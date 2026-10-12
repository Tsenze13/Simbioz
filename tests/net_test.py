#!/usr/bin/env python3
"""Сетевой тест «Симбиоза»: два игрока в одном браузере, связь через вкладки (код на L) + WebRTC.

Запуск:  python3 tests/net_test.py
Проверяет: комнату по коду, старт вдвоём, lockstep (отпечатки миров совпадают), выравнивание
после искусственного рассинхрона, ручное подключение длинными кодами, выход друга.
"""
import sys, time, threading, pathlib, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from mini_mqtt import Broker

ROOT = pathlib.Path(__file__).resolve().parent.parent
fails = []


def check(name, ok, info=''):
    print(('  ok   ' if ok else '  FAIL ') + name + (('  ' + str(info)) if info != '' else ''))
    if not ok:
        fails.append(name)


class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=str(ROOT)))
port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{port}/index.html'


def wait(pg, js, sec=15, arg=None):
    end = time.time() + sec
    while time.time() < end:
        if pg.evaluate(js, arg) if arg is not None else pg.evaluate(js):
            return True
        time.sleep(0.1)
    return False


# закрывает окна выбора у обоих (карточки, реликвии), чтобы мир шёл
PICK = """()=>{const S=window.__sb,g=S.G;if(!g)return 0;
  if(g.lvlOpen){const b=document.querySelector('#levelup button.card');if(b){b.click();return 1}}
  if(g.treeOpen)S.closeTree();if(g.shopOpen)S.closeShop();return 0}"""
HASHES = "()=>Object.assign({},window.__sb.LS.hash)"


def common(a, b):
    ks = [k for k in a if k in b]
    return ks, [k for k in ks if a[k] != b[k]]


def play(A, B, sec, moves=True):
    end = time.time() + sec
    i = 0
    while time.time() < end:
        i += 1
        for pg, keys in ((A, ['KeyD', 'KeyW']), (B, ['KeyA', 'KeyS'])):
            pg.evaluate(PICK)
            if moves:
                k = keys[(i // 15) % 2]
                pg.evaluate("([k,o])=>{const S=window.__sb;for(const c of o)S.key(c,false);S.key(k,true)}", [k, keys])
                if i % 20 == 0:
                    pg.keyboard.press('Digit1')
        time.sleep(0.05)


with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-features=WebRtcHideLocalIpsWithMdns', '--autoplay-policy=no-user-gesture-required'])
    ctx = b.new_context(viewport={'width': 1280, 'height': 760})
    ctx.add_init_script("localStorage.setItem('simbioz-debug','1')")
    errs = []
    pages = []
    for n in ('A', 'B'):
        pg = ctx.new_page()
        pg.on('pageerror', lambda e, n=n: errs.append(n + ': ' + str(e)))
        pg.on('console', lambda m, n=n: errs.append(n + ' console: ' + m.text[:200]) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
        pg.goto(URL)
        pages.append(pg)
    A, B = pages
    time.sleep(1)

    print('Лобби')
    A.evaluate("()=>{const S=window.__sb;S.SAVE.nick='Хозяин';S.setMenuEl('fire');S.setTab('coop')}")
    B.evaluate("()=>{const S=window.__sb;S.SAVE.nick='Гость';S.setMenuEl('metal');S.setTab('coop')}")
    check('вкладка «Вдвоём» открылась', A.evaluate("()=>!!document.querySelector('[data-net=host]')&&!!document.getElementById('nick')"))
    A.evaluate("()=>document.querySelector('[data-net=hostL]').click()")
    ok = wait(A, "()=>window.__sb.NET.code&&window.__sb.NET.st==='wait'")
    code = A.evaluate("()=>window.__sb.NET.code")
    check('комната создана, код показан', ok and A.evaluate("(c)=>document.querySelector('.lcode').textContent===c", code), code)
    B.fill('#joinCode', code[:2] + ' ' + code[2:])
    B.click('[data-net=join]')
    ok = wait(A, "()=>window.__sb.NET.st==='open'&&!!window.__sb.NET.friend", 25) and wait(B, "()=>window.__sb.NET.st==='open'&&!!window.__sb.NET.friend", 10)
    check('игроки соединились напрямую', ok, [A.evaluate("()=>window.__sb.NET.log.slice(-3)"), B.evaluate("()=>window.__sb.NET.log.slice(-3)")])
    check('друг виден в лобби', A.evaluate("()=>document.querySelector('.lplayers').innerText.includes('Гость')") and B.evaluate("()=>document.querySelector('.lplayers').innerText.includes('Хозяин')"))
    B.click('[data-el=earth]')
    ok = wait(A, "()=>window.__sb.NET.friend.start==='earth'", 5)
    check('смена героя видна другу', ok)

    print('Забег вдвоём')
    A.click('[data-net=start]')
    ok = wait(B, "()=>window.__sb.mode==='play'&&!!window.__sb.COOP", 5) and A.evaluate("()=>window.__sb.mode==='play'")
    check('оба в игре', ok)
    r = [pg.evaluate("()=>{const C=window.__sb.COOP;return [C.me,C.H.map(h=>h.start+':'+h.name)]}") for pg in (A, B)]
    check('герои одинаковы, у каждого свой', r[0][1] == r[1][1] == ['fire:Хозяин', 'earth:Гость'] and r[0][0] == 0 and r[1][0] == 1, r)
    play(A, B, 12)
    ha, hb = A.evaluate(HASHES), B.evaluate(HASHES)
    ks, bad = common(ha, hb)
    ta, tb = A.evaluate("()=>window.__sb.LS.t"), B.evaluate("()=>window.__sb.LS.t")
    check('lockstep идёт у обоих', ta > 300 and tb > 300 and abs(ta - tb) < 30, [ta, tb])
    check('отпечатки миров совпадают', len(ks) >= 5 and not bad, [len(ks), bad[:5]])
    st = [pg.evaluate("()=>{const C=window.__sb.COOP;return C.H.map(h=>[Math.round(h.p.x),Math.round(h.p.y),h.p.lv])}") for pg in (A, B)]
    check('герои двигаются и качаются', st[0][0][0] > 50 and st[0][1][0] < -50, st)
    k0 = A.evaluate("()=>window.__sb.COOP.W.kills")
    check('враги гибнут', k0 > 0, k0)

    print('Долгий бой: карточки, навыки, лавка')
    A.evaluate("()=>window.__sb.key('KeyD',false)")
    B.evaluate("()=>window.__sb.key('KeyA',false)")
    end = time.time() + 45
    i = 0
    while time.time() < end:
        i += 1
        for pg, keys in ((A, ['KeyD', 'KeyA']), (B, ['KeyW', 'KeyS'])):
            pg.evaluate(PICK)
            k = keys[(i // 8) % 2]
            pg.evaluate("([k,o])=>{const S=window.__sb;for(const c of o)S.key(c,false);S.key(k,true)}", [k, keys])
            if i % 10 == 0:
                pg.keyboard.press('Digit1')
                pg.keyboard.press('Digit2')
        time.sleep(0.05)
    st = [pg.evaluate("()=>{const C=window.__sb.COOP;return [C.W.wave,C.W.kills,C.H.map(h=>[h.p.lv,h.slots.filter(Boolean).length,h.down]),C.resyncs||0,window.__sb.LS.bad]}") for pg in (A, B)]
    ks, bad = common(A.evaluate(HASHES), B.evaluate(HASHES))
    check('долгий бой синхронен без выравниваний', st[0][3] == 0 and st[0][4] == 0 and not bad and len(ks) > 10, [st, len(ks), bad[:3]])
    check('герои качаются в бою', st[0][2][0][0] > 1 and st[0][2][1][0] > 1 and st[0] [0:3] == st[1][0:3], st)

    print('Рассинхрон и выравнивание')
    B.evaluate("()=>{const W=window.__sb.COOP.W;for(const e of W.en)e.hp*=0.5;W.kills+=7}")
    ok = wait(B, "()=>(window.__sb.COOP.resyncs||0)>=1", 10)
    check('снимок большой — шёл кусками', A.evaluate("()=>JSON.stringify(window.__sb.coopSnap()).length") > 16000)
    check('гость получил снимок от хозяина', ok and A.evaluate("()=>(window.__sb.COOP.resyncs||0)>=1"))
    play(A, B, 8)
    ha, hb = A.evaluate(HASHES), B.evaluate(HASHES)
    t0 = max(A.evaluate("()=>window.__sb.COOP.snapT||0"), 0)
    ks, bad = common(ha, hb)
    check('после выравнивания миры снова совпадают', len(ks) >= 4 and not bad, [len(ks), bad[:5], [pg.evaluate("()=>[window.__sb.COOP.resyncs,window.__sb.LS.t,window.__sb.LS.waitT,Object.keys(window.__sb.LS.hash).length,window.__sb.mode,window.__sb.COOP.W.paused,window.__sb.COOP.H.map(h=>[h.lvlOpen,h.shopOpen,h.treeOpen])]") for pg in (A,B)], A.evaluate("()=>window.__sb.NET.log.slice(-4)")])
    check('мир продолжает жить', A.evaluate("()=>window.__sb.COOP.W.kills") > k0)

    print('Пауза и уровень')
    A.evaluate("()=>window.__sb.key('KeyD',false)")
    A.keyboard.press('Escape')
    ok = wait(B, "()=>window.__sb.COOP.W.paused&&!document.getElementById('pause').hidden", 5)
    check('пауза общая', ok)
    A.click('#resume')
    ok = wait(B, "()=>!window.__sb.COOP.W.paused", 5)
    check('снятие паузы у обоих', ok)

    print('Выход друга')
    B.evaluate("()=>window.__sb.quitToMenu()")
    ok = wait(A, "()=>{const C=window.__sb.COOP;return C&&!C.net&&C.H.length===1}", 5)
    check('хозяин играет дальше один', ok)
    A.evaluate("()=>{const S=window.__sb;S.key('KeyD',false);S.key('KeyW',false)}")
    t1 = A.evaluate("()=>window.__sb.LS.t")
    time.sleep(1.5)
    check('одиночный цикл идёт', A.evaluate("()=>window.__sb.LS.t") > t1 + 40)
    check('связь после выхода сохранилась', B.evaluate("()=>window.__sb.NET.st==='open'&&window.__sb.menuTab==='coop'") and A.evaluate("()=>window.__sb.NET.st==='open'"))
    A.evaluate("()=>window.__sb.quitToMenu()")
    check('после забега лобби снова открыто', A.evaluate("()=>window.__sb.menuTab==='coop'&&!!document.querySelector('[data-net=start]')"))

    print('Второй забег в той же комнате')
    A.click('[data-net=start]')
    ok = wait(B, "()=>window.__sb.mode==='play'&&!!window.__sb.COOP&&window.__sb.COOP.net", 5)
    play(A, B, 4)
    ks, bad = common(A.evaluate(HASHES), B.evaluate(HASHES))
    check('второй забег синхронен', ok and len(ks) >= 2 and not bad, [len(ks), bad])
    A.evaluate("()=>window.__sb.quitToMenu()")
    B.evaluate("()=>window.__sb.quitToMenu()")

    print('Ручное подключение')
    A.evaluate("()=>window.__sb.netClose()")
    B.evaluate("()=>window.__sb.netClose()")
    inv = A.evaluate("()=>window.__sb.manualOffer()")
    check('код приглашения короткий', 50 < len(inv) < 1500, len(inv))
    ans = B.evaluate("(c)=>window.__sb.manualAnswer(c)", inv)
    A.evaluate("(c)=>window.__sb.manualFinish(c)", ans)
    ok = wait(A, "()=>window.__sb.NET.st==='open'&&!!window.__sb.NET.friend", 15) and wait(B, "()=>window.__sb.NET.st==='open'", 5)
    check('ручное подключение работает', ok, [len(inv), len(ans)])

    print('Комната через сервер встреч (MQTT)')
    br = Broker().start()
    for pg in (A, B):
        pg.evaluate("(u)=>{const S=window.__sb;S.netClose();for(let i=0;i<S.BROKERS.length;i++)S.BROKERS[i]=u;S.setTab('coop')}", f'ws://127.0.0.1:{br.port}/mqtt')
    A.click('[data-net=host]')
    ok = wait(A, "()=>/^[1-3][0-9]{4}$/.test(window.__sb.NET.code||'')&&window.__sb.NET.st==='wait'", 10)
    code = A.evaluate("()=>window.__sb.NET.code")
    check('код комнаты из 5 знаков', ok, code)
    B.fill('#joinCode', code)
    B.press('#joinCode', 'Enter')
    ok = wait(A, "()=>window.__sb.NET.st==='open'&&!!window.__sb.NET.friend", 20) and wait(B, "()=>window.__sb.NET.st==='open'", 5)
    check('соединение через сервер встреч', ok, [br.published, A.evaluate("()=>window.__sb.NET.log.slice(-3)"), B.evaluate("()=>window.__sb.NET.log.slice(-3)")])
    time.sleep(2)
    check('сервер встреч отпущен после соединения', A.evaluate("()=>!window.__sb.NET.sig") and B.evaluate("()=>!window.__sb.NET.sig"))

    print('Медленная сеть (120 мс ± 40 в одну сторону)')
    for pg in (A, B):
        pg.evaluate("()=>{const N=window.__sb.NET;N.lag=120;N.jit=40}")
    time.sleep(4)
    rtt = A.evaluate("()=>window.__sb.NET.rtt")
    A.evaluate("()=>{window.__sb.setTab('coop');window.__sb.netStartGame()}")
    wait(B, "()=>!!window.__sb.COOP&&window.__sb.mode==='play'", 5)
    d = A.evaluate("()=>window.__sb.LS.D")
    t0 = A.evaluate("()=>window.__sb.LS.t")
    play(A, B, 12)
    t1 = A.evaluate("()=>window.__sb.LS.t")
    ks, bad = common(A.evaluate(HASHES), B.evaluate(HASHES))
    check('пинг измерен, задержка ввода подобрана', rtt > 200 and d >= 10, [round(rtt), d])
    check('на медленной сети игра идёт почти в полную скорость', t1 - t0 > 12 * 60 * 0.75, t1 - t0)
    check('на медленной сети миры совпадают', len(ks) >= 10 and not bad and A.evaluate("()=>(window.__sb.COOP.resyncs||0)") == 0, [len(ks), bad[:3]])
    for pg in (A, B):
        pg.evaluate("()=>{const N=window.__sb.NET;N.lag=0}")
    A.evaluate("()=>window.__sb.quitToMenu()")
    B.evaluate("()=>window.__sb.quitToMenu()")
    time.sleep(1)

    print('Разрыв связи')
    A.evaluate("()=>{window.__sb.setTab('coop');window.__sb.netStartGame()}")
    wait(B, "()=>!!window.__sb.COOP", 5)
    play(A, B, 2)
    B.close()
    ok = wait(A, "()=>{const C=window.__sb.COOP;return C&&!C.net&&C.H.length===1}", 15)
    check('при разрыве хозяин остаётся в игре один', ok, A.evaluate("()=>window.__sb.NET.log.slice(-3)"))

    errs = [e for e in errs if 'stun' not in e.lower() and 'turn' not in e.lower()]
    check('нет ошибок JS', not errs, errs[:5])
    b.close()

print()
print('ИТОГ: всё в порядке' if not fails else 'ИТОГ: провалено ' + str(len(fails)) + ': ' + ', '.join(fails))
sys.exit(1 if fails else 0)
