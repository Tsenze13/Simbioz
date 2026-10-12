#!/usr/bin/env python3
"""Автотест «Симбиоза»: гоняет собранный index.html в headless Chromium.

Запуск:  python3 tests/smoke.py [путь к html]   (по умолчанию index.html)
Нужно:   pip install playwright  (браузер Chromium)
Выход с кодом 1, если есть ошибки JS или провалены проверки.
"""
import sys, time, json, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
HTML = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / 'index.html'
HEROES = ['fire', 'water', 'earth', 'air', 'metal', 'wood']
fails = []


def check(name, ok, info=''):
    print(('  ok   ' if ok else '  FAIL ') + name + (('  ' + str(info)) if info != '' else ''))
    if not ok:
        fails.append(name)


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1366, 'height': 768})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('console: ' + m.text[:200]) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
    pg.add_init_script("localStorage.setItem('simbioz-debug','1')")
    pg.goto(HTML.as_uri())
    time.sleep(1)
    J = pg.evaluate

    print('Загрузка')
    check('меню открылось', J("()=>!!window.__sb&&window.__sb.mode==='menu'"))

    print('Герои: бой, навыки, рывок, отрисовка')
    for k in HEROES:
        r = J("""(k)=>{const S=window.__sb;S.quitToMenu();S.startRun(k);const g=S.G;
          for(let i=0;i<14;i++){g.p.xp=g.p.need;S.gainXp(0)}g.pending=0;
          const ks=Object.keys(S.AB).filter(x=>S.AB[x].cat==='skill'&&S.AB[x].els[0]===k).slice(0,5);for(const x of ks)S.learnSkill(x);
          S.startWave(6);
          for(let i=0;i<1500;i++){g.p.inv=1;if(g.p.hp<60)g.p.hp=g.S.maxHp;if(i%90===0){for(const s of g.slots)if(s)s.cd=0;g.p.mana=999;for(let j=0;j<5;j++)S.castSlot(j);S.tryDash()}S.update(1/60);if(i%250===0)S.render()}
          return {kills:g.kills,over:g.over}}""", k)
        check('герой ' + k, r['kills'] > 0 and not r['over'], r)

    r = J("""()=>{const S=window.__sb,g=S.G;const n=Object.keys(g.dmgBy||{}).length;S.endRun(false);
        return {src:n,rows:document.querySelectorAll('#goDmg .dr').length,over:!document.getElementById('over').hidden}}""")
    check('итоги забега: урон по источникам', r['src'] > 0 and r['rows'] > 0 and r['over'], r)
    r = J("""()=>{const X=window.__x,c=document.createElement('canvas').getContext('2d');const out={};
        for(const k of ['pistol','shotgun','rifle','smg','launcher','sniper','grenade']){X.SP[k](c,k==='grenade'?0:1);out[k]=X.SP[k]===X.GUNART[k]}return out}""")
    check('новые спрайты оружия Солдата рисуются', all(r.values()), r)
    r = J("()=>{const S=window.__sb;S.SAVE.tut={};S.SAVE.hints=true;S.quitToMenu();S.startRun('fire');S.update(1/60);return document.getElementById('hint').innerText}")
    check('подсказка новичку', 'Управление' in r, r[:40])

    print('Мастера стихий и Аватар')
    r = J("""()=>{const S=window.__sb,out={};for(const k of ['fire','water','earth','air','metal','wood']){S.quitToMenu();S.startRun(k);const g=S.G;
        const els=new Set();for(let i=0;i<300;i++)for(const c of S.buildChoices())if(c.kind==='el'||c.kind==='skill')els.add(c.kind==='el'?c.key:S.AB[c.key].els?S.AB[c.key].els[0]:'sym');
        g.el[k]=7;const up=S.buildChoices().length;out[k]=[...els]}return out}""")
    check('мастер берёт только свою стихию', all(v == [k] for k, v in r.items()), r)
    r = J("""()=>{const S=window.__sb;S.quitToMenu();S.startRun('fire');const g=S.G;g.el.fire=8;S.startWave(3);const e=S.spawnEnemy('wisp');e.hp=e.max=1e6;
        for(let i=0;i<200;i++){e.x=g.p.x+120;e.y=g.p.y;g.p.inv=1;S.update(1/60)}return {dmg:Math.round(1e6-e.hp),cards:S.buildChoices().filter(c=>c.kind==='el').length}}""")
    check('стихия 8 уровня работает, дальше не качается', r['dmg'] > 0 and r['cards'] == 0, r)
    r = J("""()=>{const S=window.__sb;S.quitToMenu();S.startRun('avatar');const g=S.G;S.update(1/60);
        const first=(g.choices||[]).map(c=>c.kind+':'+c.key);if(g.lvlOpen)S.pickCard(0);
        const e1=Object.keys(g.el).filter(k=>g.el[k]>0);
        for(let i=0;i<20;i++){g.p.xp=g.p.need;S.gainXp(0)}g.pending=0;
        for(const k of ['fire','air','metal','water','earth','wood'])if(!g.el[S.OPP?0:0]&&!g.el[({fire:'water',water:'fire',earth:'air',air:'earth',metal:'wood',wood:'metal'})[k]])g.el[k]=Math.max(g.el[k],2);
        S.recalc();const els=Object.keys(g.el).filter(k=>g.el[k]>0);
        const kinds=new Set();for(let i=0;i<200;i++)for(const c of S.buildChoices())kinds.add(c.kind);
        S.startWave(4);for(let i=0;i<600;i++){g.p.inv=1;if(i%100===0){for(const s of g.slots)if(s)s.cd=0;g.p.mana=999;for(let j=0;j<5;j++)S.castSlot(j)}S.update(1/60);if(i%200===0)S.render()}
        S.openTree();document.querySelector('#trList [data-sk="__ult"]').click();const ultHtml=document.getElementById('trDet').innerText;S.closeTree();
        return {first,e1,els,kinds:[...kinds],kills:g.kills,heroUlt:ultHtml.includes('Ульта героя')}}""")
    check('Аватар: первая карточка — выбор стихии', len(r['first']) == 3 and all(x.startswith('el:') for x in r['first']) and len(r['e1']) == 1, r)
    check('Аватар смешивает и учит симбиозы', len(r['els']) == 3 and 'skill' in r['kinds'] and r['kills'] > 0 and not r['heroUlt'], r)

    print('Формы стихий')
    r = J("""()=>{const S=window.__sb,bad=[],ok=[];
      for(const id of S.FORM_IDS){const F=S.FORMS[id];for(const m of ['',...F.mods.map(x=>x.k)]){
        S.quitToMenu();S.startRun(F.el);const g=S.G;g.el[F.el]=5;g.forms=[{t:id,cd:0,m:m}];S.startWave(3);g.spawnT=1e9;g.en.length=0;
        const es=[];for(let i=0;i<4;i++){const e=S.spawnEnemy('wisp');e.hp=e.max=1e6;e.sp=0;es.push(e)}
        for(let i=0;i<360;i++){es.forEach((e,j)=>{e.x=g.p.x+70+j*25;e.y=g.p.y+(j%2?20:-20)});g.p.inv=1;S.update(1/60);if(i%120===0)S.render()}
        const dmg=es.reduce((a,e)=>a+(1e6-e.hp),0);const key='form:'+id;
        if(dmg<=0||!(g.dmgBy&&g.dmgBy[key]>0))bad.push(id+':'+m+' dmg='+Math.round(dmg));else ok.push(id)}}
      return {bad,n:ok.length}}""")
    check('все формы и модификации бьют и учитываются в итогах', not r['bad'], r)
    r = J("""()=>{const S=window.__sb;S.quitToMenu();S.startRun('fire');const g=S.G;const k=new Set();for(let i=0;i<300;i++)for(const c of S.buildChoices())k.add(c.kind);
      g.forms=[{t:'fspear',cd:0,m:''}];const mods=S.buildChoices;let fm=0;for(let i=0;i<300;i++)for(const c of S.buildChoices())if(c.kind==='formmod')fm++;
      S.quitToMenu();S.startRun('avatar');const g2=S.G;g2.el.fire=3;let fa=0;for(let i=0;i<200;i++)for(const c of S.buildChoices())if(c.kind==='form')fa++;
      return {kinds:[...k],fm,fa}}""")
    check('карточки форм у мастера, у Аватара их нет', 'form' in r['kinds'] and r['fm'] > 0 and r['fa'] == 0, r)

    r = J("""()=>{const S=window.__sb,bad=[];for(const k of ['fire','water','earth','air','metal','wood']){
        S.quitToMenu();S.startRun(k);const g=S.G;S.startWave(5);g.p.inv=1e9;g.p.lv=24;g.ult.kind='hero';g.ult.lv=3;g.ult.ms={};for(const s of S.MSEAL[k])g.ult.ms[s.k]=true;
        for(let i=0;i<6;i++){const e=S.spawnEnemy('wisp');e.hp=e.max=1e6;e.x=g.p.x+100+i*20;e.y=g.p.y}
        g.p.mana=999;g.ult.cd=0;try{S.castUlt();for(let i=0;i<180;i++)S.update(1/60);S.render()}catch(e){bad.push(k+': '+e.message)}}return bad}""")
    check('ульта с печатями мастерства у всех мастеров', not r, r)

    r = J("""()=>new Promise(res=>{const S=window.__sb;S.quitToMenu();S.setTab('bestiary');setTimeout(()=>{const cv=[...document.querySelectorAll('canvas[data-et]')];
        const first=cv[0].getContext('2d').getImageData(0,0,cv[0].width,cv[0].height).data;let px=0;for(let i=3;i<first.length;i+=4)if(first[i]>0)px++;
        const dup=cv.filter(c=>c.dataset.et.indexOf('boss_')===0).length;S.setTab('play');res({n:cv.length,px,bossCards:dup})},400)})""")
    check('бестиарий: живые спрайты врагов, боссы без дублей', r['n'] > 30 and r['px'] > 200 and r['bossCards'] == 6, r)

    print('Огнемёт и автоприменение')
    r = J("""()=>{const S=window.__sb;S.quitToMenu();S.startRun('fire');const g=S.G;S.startWave(3);g.spawnT=1e9;g.en.length=0;S.learnSkill('flamejet');
        const e=S.spawnEnemy('brute');e.hp=e.max=1e6;e.sp=0;S.setMouse(683+90,384);g.p.mana=g.S.maxMana;const m0=g.p.mana;
        S.key('Digit1',true);S.castSlot(0);let held=0;for(let i=0;i<90;i++){e.x=g.p.x+90;e.y=g.p.y;g.p.inv=1;S.update(1/60);if(g.chan)held++}
        const dmgHeld=Math.round(1e6-e.hp),manaUsed=Math.round(m0-g.p.mana);S.key('Digit1',false);S.update(1/60);
        return {held,dmgHeld,manaUsed,chanAfter:!!g.chan,cd:g.slots[0].cd>0}}""")
    check('огнемёт: струя, пока держишь кнопку', r['held'] >= 85 and r['dmgHeld'] > 0 and r['manaUsed'] > 15 and not r['chanAfter'] and r['cd'], r)
    r = J("""()=>{const S=window.__sb;S.quitToMenu();S.startRun('fire');const g=S.G;S.startWave(3);g.spawnT=1e9;g.en.length=0;S.learnSkill('fireball');S.learnSkill('flamejet');
        const e=S.spawnEnemy('brute');e.hp=e.max=1e6;e.sp=0;S.toggleAuto(0);S.toggleAuto(1);let casts=0,ch=0;const c0=g.castN;
        for(let i=0;i<300;i++){e.x=g.p.x+120;e.y=g.p.y;g.p.inv=1;g.p.mana=g.S.maxMana;S.update(1/60);if(g.chan)ch++}
        S.hud();return {casts:g.castN-c0,ch,badge:document.querySelectorAll('.slot.sk.auto').length,dmg:Math.round(1e6-e.hp)}}""")
    check('автоприменение навыков (Alt+клавиша)', r['casts'] >= 2 and r['ch'] > 30 and r['badge'] == 2 and r['dmg'] > 0, r)

    print('Все навыки с мутациями')
    r = J("""()=>{const S=window.__sb;let bad=[];for(const id of Object.keys(S.AB)){try{S.quitToMenu();S.startRun('fire');const g=S.G;S.startWave(3);
        S.learnSkill(id);const s=g.slots.find(x=>x&&x.id===id);if(!s)continue;s.lv=5;if(S.TREE[id])g.nodes[id]={a:3,b:3,c:3};
        for(let i=0;i<4;i++){const e=S.spawnEnemy('wisp');e.x=g.p.x+80+i*30;e.y=g.p.y}
        g.p.mana=999;S.castSlot(g.slots.indexOf(s));for(let i=0;i<90;i++){g.p.inv=1;S.update(1/60)}S.render()}catch(e){bad.push(id+': '+e.message)}}return bad}""")
    check('навыки без ошибок', not r, r[:5])

    print('Боссы: все приёмы')
    for bk, ch, w in [('guard', 1, 8), ('golem', 1, 16), ('ent', 1, 24), ('sandlord', 2, 24), ('queen', 3, 24), ('devourer', 6, 24)]:
        r = J("""([bk,ch,w])=>{const S=window.__sb;S.SAVE.ch=6;S.quitToMenu();S.startRun('fire',ch);const g=S.G;g.p.inv=1e9;S.startWave(w);const e=g.bossRef;
          const pats=[...new Set(S.BOSS[bk].pats.concat(S.BOSS[bk].p2))];
          for(const pt of pats){S.bossPattern(e,pt);for(let i=0;i<120;i++){g.p.hp=g.S.maxHp;S.update(1/60)}S.render()}
          e.hp=e.max*0.5;for(let i=0;i<60;i++)S.update(1/60);
          return {key:e.bkey,pats:pats.length,phase:e.phase,bar:e.bar>0||e.dead}}""", [bk, ch, w])
        check('босс ' + bk, r['key'] == bk and r['phase'] >= 2, r)

    print('Оружие и модификации')
    r = J("""()=>{const S=window.__sb,bad=[];for(const hero of ['metal','fire'])for(const t of Object.keys(S.GUNS))for(const m of ['',...S.GMOD[t].map(x=>x.k)]){
        S.quitToMenu();S.startRun(hero);const g=S.G;g.el.metal=5;g.guns=[{t:t,cd:0,aim:0,fl:0,rec:0}];if(g.hand)g.hand.t=t;g.gmods[t]=m;g.gmu={sil:1,scope:1,mag:1};S.startWave(5);
        const e=S.spawnEnemy('shield');e.hp=e.max=1e6;e.sp=0;for(let i=0;i<240;i++){g.p.inv=1;e.x=g.p.x+120;e.y=g.p.y;S.update(1/60)}
        if(e.hp>=1e6)bad.push(hero+':'+t+':'+m)}return bad}""")
    check('все стволы и моды наносят урон', not r, r)
    r = J("""()=>{const S=window.__sb;S.quitToMenu();S.startRun('metal');const g=S.G;S.startWave(1);const e=S.spawnEnemy('wisp');e.hp=e.max=1e6;
        for(let i=0;i<600;i++){e.x=g.p.x+100;e.y=g.p.y;g.p.inv=1;S.update(1/60)}return {dmg:Math.round(1e6-e.hp),noAmmo:g.hand.am===undefined}}""")
    check('Солдат стреляет без перезарядки', r['dmg'] > 0 and r['noAmmo'], r)

    print('Механики героев')
    r = J("""()=>{const S=window.__sb,o={};let g;
      S.quitToMenu();S.startRun('earth');g=S.G;S.startWave(1);for(let i=0;i<400;i++){g.p.inv=1;S.update(1/60)}o.plates=g.plates;
      S.quitToMenu();S.startRun('air');g=S.G;S.startWave(1);S.key('KeyD',true);const x0=g.p.x,y0=g.p.y;let mx=0;for(let i=0;i<300;i++){g.p.inv=1;g.p.x=x0;g.p.y=y0;S.update(1/60);mx=Math.max(mx,g.imp)}S.key('KeyD',false);o.imp=mx;
      S.quitToMenu();S.startRun('water');g=S.G;S.startWave(1);for(let i=0;i<660;i++){g.p.inv=1;S.update(1/60)}o.tide=g.tide;
      S.quitToMenu();S.startRun('wood');g=S.G;S.startWave(3);o.season=g.season;return o}""")
    check('плиты земли', r['plates'] == 5, r['plates'])
    check('импульс воздуха', r['imp'] >= 100, r['imp'])
    check('приливы', r['tide'] == 'ebb', r['tide'])
    check('сезоны', r['season'] == 2, r['season'])

    print('Прокачка, древо, ульта')
    r = J("""()=>{const S=window.__sb;S.quitToMenu();S.startRun('air');const g=S.G;for(let i=0;i<61;i++){g.p.xp=g.p.need;S.gainXp(0)}g.pending=0;
        S.openTree();const sp0=g.sp;document.querySelector('#trList [data-sk="__ult"]').click();
        const pick=document.querySelector('#trDet [data-ult="hero"]');pick.click();const lv1=g.ult.lv;
        document.querySelector('#trDet [data-ultlv]').click();document.querySelector('#trDet [data-ultlv]').click();
        S.closeTree();const c=S.buildChoices();return {lv:g.p.lv,sp0,sp:g.sp,ult:g.ult.lv,lv1,cards:c.length,up:g.up}}""")
    check('ульта открывается и качается очками навыков', r['lv1'] == 1 and r['ult'] == 3 and r['sp'] == r['sp0'] - 3 and r.get('up') is None, r)
    check('карточки уровня', r['cards'] == 3, r['cards'])

    print('Лавка и предметы')
    r = J("""()=>{const S=window.__sb;S.quitToMenu();S.startRun('air');const g=S.G;S.startWave(5);S.endWave();g.p.gold=1e5;
        for(const id of ['thundercrown','flamering','frostheart','shadowcloak','venomfang','phoenix'])S.addToBag(id);S.recalc();
        for(const m of g.merch){S.openShop(m);S.closeShop()}S.openShop(g.merch[0]);const ok=!document.getElementById('shop').hidden;S.closeShop();
        S.startWave(6);for(let i=0;i<5;i++){const e=S.spawnEnemy('wisp');e.hp=e.max=1e5;e.x=g.p.x+60;e.y=g.p.y}g.p.hp=g.S.maxHp*0.2;
        for(let i=0;i<300;i++){g.p.inv=1;S.update(1/60)}return {ok,fx:Object.keys(g.ifx||{}).length,phoenix:!!g.phU}}""")
    check('лавка открывается', r['ok'])
    check('эффекты предметов', r['fx'] == 6 and r['phoenix'], r)

    print('Главы и карты')
    r = J("""()=>{const S=window.__sb;S.SAVE.ch=6;const out={};
        for(let c=1;c<=6;c++){S.quitToMenu();S.startRun('fire',c);const g=S.G;out['c'+c]=[g.ch,g.map,S.MAPS[g.map].bio]}
        S.quitToMenu();S.startRun('fire',1);const g=S.G;g.p.inv=1e9;
        out.boss=[7,8,16,24,25].map(w=>S.bossKeyFor(w));
        out.hp=[8,16,24].map(w=>Math.round(S.bossHpScale(S.bossKeyFor(w),w)*S.ET['boss_'+S.bossKeyFor(w)].hp));
        S.startWave(8);const e=g.bossRef;e.bar=0;let n=0;while(!e.dead&&n<4000){e.hp=Math.min(e.hp,1);S.hitEnemy(e,99999,{dt:'pure',src:'skill'});n++}
        for(let i=0;i<200;i++){if(g.lvlOpen)S.pickCard(0);S.update(1/60)}
        out.safe=[g.safe,g.phase,(g.portals||[]).map(q=>q.map)];
        for(let i=0;i<600;i++)S.update(1/60);out.still=[g.safe,g.wave];
        for(let k=0;k<30&&g.lvlOpen;k++)S.pickCard(0);if(g.treeOpen)S.closeTree();const q=g.portals[1];g.p.x=q.x;g.p.y=q.y;S.interact();out.after=[g.safe,g.wave,g.map,g.phase];
        S.startWave(16);const b=g.bossRef;b.bar=0;n=0;while(!b.dead&&n<4000){b.hp=Math.min(b.hp,1);S.hitEnemy(b,99999,{dt:'pure',src:'skill'});n++}
        for(let i=0;i<200;i++){if(g.lvlOpen)S.pickCard(0);S.update(1/60)}
        out.fork2=(g.portals||[]).map(q=>q.map+(q.risk?'!':''));
        for(let k=0;k<30&&g.lvlOpen;k++)S.pickCard(0);if(g.treeOpen)S.closeTree();const sp=g.sp;const r2=g.portals[1];g.p.x=r2.x;g.p.y=r2.y;S.interact();out.risk=g.risk;
        const w0=S.spawnEnemy('wisp');out.riskHp=w0.max;g.risk=false;const w1=S.spawnEnemy('wisp');out.normHp=w1.max;g.risk=true;
        S.startWave(24);const f=g.bossRef;f.bar=0;n=0;while(!f.dead&&n<4000){f.hp=Math.min(f.hp,1);S.hitEnemy(f,99999,{dt:'pure',src:'skill'});n++}
        for(let i=0;i<300&&!g.over;i++){if(g.lvlOpen)S.pickCard(0);S.update(1/60)}
        out.win=[g.over,g.victory,!!g.riskRun];S.SAVE.ch=1;S.SAVE.chSel=1;return out}""")
    check('6 глав, у каждой своя стартовая карта своего биома', [r['c%d' % c][2] for c in range(1, 7)] == ['forest', 'dunes', 'ice', 'ash', 'storm', 'lava'] and len({r['c%d' % c][1] for c in range(1, 7)}) == 6, {k: r[k] for k in r if k.startswith('c')})
    check('босс на 12-й волне каждой карты', r['boss'] == [None, 'guard', 'golem', 'ent', None], r['boss'])
    check('здоровье боссов растёт по картам', r['hp'][0] < r['hp'][1] < r['hp'][2], r['hp'])
    check('после босса — безопасная зона с развилкой', r['safe'][0] and r['safe'][2] == ['forest', 'bog'] and r['still'] == [True, 8], r['safe'] + r['still'])
    check('портал ведёт на выбранную карту', r['after'] == [False, 9, 'bog', 'fight'], r['after'])
    check('вторая развилка: логово или тропа испытаний', r['fork2'] == ['thicket', 'thicket!'] and r['risk'] and r['riskHp'] > r['normHp'], r)
    check('победа над хранителем главы', r['win'] == [True, True, True], r['win'])
    print('Особенности карт и враги глав')
    r = J("""()=>{const S=window.__sb,out={};
        const newE=['boar','mossgolem','bogling','vulture','mummy','yeti','shardarcher','cinderbat','voidling','sparkbot','thunderbird','salamander','cultist'];
        S.quitToMenu();S.startRun('fire',1);let g=S.G;g.p.inv=1e9;out.bad=[];
        for(const k of newE){const d=S.ET[k];for(const m of d.maps){S.enterBiome(m,true);S.startWave(5);const e=S.spawnEnemy(k);if(!e)out.bad.push(k+'@'+m)}
          for(let i=0;i<60;i++)S.update(1/60);S.render()}
        out.feats=Object.keys(S.FEAT).length;
        const res={};
        for(const [m,t] of [['thicket','spring'],['lawn','shrine'],['forest','cache'],['bog','nest']]){
          S.quitToMenu();S.startRun('fire',1);g=S.G;g.p.inv=1e9;S.enterBiome(m,true);S.placeFeature();S.startWave(3);g.spawnT=1e9;
          const F=g.feat;const r1={t:F.t};
          if(t==='spring'){g.p.hp=g.S.maxHp*0.3;g.p.x=F.x;g.p.y=F.y;for(let i=0;i<120;i++){g.p.x=F.x;g.p.y=F.y;S.update(1/60)}r1.ok=g.p.hp>g.S.maxHp*0.33}
          if(t==='shrine'){for(let i=0;i<120;i++){g.p.x=F.x;g.p.y=F.y;S.update(1/60)}r1.ok=g.bf.dm.t>30&&F.cdW===g.wave+3}
          if(t==='cache'){const gold=g.p.gold;for(let i=0;i<120;i++){g.p.x=F.x;g.p.y=F.y;S.update(1/60)}r1.ok=F.done&&g.p.gold>gold}
          if(t==='nest'){const e=F.ref;r1.spawned=!!e&&e.type==='nest';const n0=g.en.length+g.kills;g.p.x=F.x+200;g.p.y=F.y;for(let i=0;i<300;i++)S.update(1/60);r1.made=g.en.length+g.kills>n0;
            e.hp=1;S.hitEnemy(e,999,{dt:'pure',src:'skill'});for(let i=0;i<10;i++)S.update(1/60);r1.ok=r1.spawned&&r1.made&&F.done&&Math.abs(e.x-F.x)<1}
          S.render();res[m]=r1}
        out.res=res;return out}""")
    check('враги глав появляются на своих картах', not r['bad'], r['bad'])
    check('у всех 24 карт есть особенность', r['feats'] == 24, r['feats'])
    for m, v in r['res'].items():
        check('особенность карты: ' + v['t'], v['ok'], v)
    r = J("""()=>{const S=window.__sb;S.quitToMenu();S.startRun('air',1);const g=S.G;g.p.inv=1e9;S.enterBiome('maw',true);S.startWave(5);
        S.skyStrike(g.p.x+100,g.p.y,'#f4f08a',true);for(let i=0;i<20;i++){S.update(1/60);S.render()}return window.__x.SP?1:0}""")
    check('освещение на тёмной карте без ошибок', r == 1, r)
    r = J("""()=>{const S=window.__sb;S.quitToMenu();S.startRun('avatar',1);const g=S.G;S.pickCard(0);g.p.inv=1e9;S.startWave(2);const x0=g.p.x;let err=null;
        S.key('KeyD',true);try{for(let i=0;i<120;i++){S.update(1/60);while(g.lvlOpen)S.pickCard(0);if(i%20===0)S.render()}}catch(e){err=e.message}S.key('KeyD',false);
        return {moved:g.p.x-x0,err,body:g.hch&&Object.keys(g.hch).length}}""")
    check('Аватар бегает со своим телом без ошибок', abs(r['moved']) > 1 and not r['err'] and r['body'] == 7, r)
    print('Сохранение забега')
    r = J("""()=>{const S=window.__sb;S.SAVE.ch=6;S.quitToMenu();S.startRun('earth',2);let g=S.G;g.p.inv=1e9;S.learnSkill('quake');g.p.gold=777;
        S.startWave(8);const e=g.bossRef;e.bar=0;let n=0;while(!e.dead&&n<4000){e.hp=Math.min(e.hp,1);S.hitEnemy(e,99999,{dt:'pure',src:'skill'});n++}
        for(let i=0;i<200;i++){if(g.lvlOpen)S.pickCard(0);S.update(1/60)}for(let k=0;k<30&&g.lvlOpen;k++)S.pickCard(0);if(g.treeOpen)S.closeTree();
        const before={ch:g.ch,wave:g.wave,map:g.map,lv:g.p.lv,gold:g.p.gold,sk:g.slots.filter(Boolean).map(s=>s.id).join(),portals:g.portals.length,el:g.el.earth};
        const ok=S.saveRun();g.over=true;S.quitToMenu();const has=!!S.runSaved();const html=document.getElementById('mpanel').innerHTML.indexOf('data-cont')>=0;
        S.loadRun();g=S.G;const after={ch:g.ch,wave:g.wave,map:g.map,lv:g.p.lv,gold:g.p.gold,sk:g.slots.filter(Boolean).map(s=>s.id).join(),portals:g.portals.length,el:g.el.earth};
        for(let i=0;i<60;i++){S.update(1/60);while(g.lvlOpen)S.pickCard(0);if(i%20===0)S.render()}if(g.treeOpen)S.closeTree();
        const q=g.portals[0];g.p.x=q.x;g.p.y=q.y;S.interact();for(let i=0;i<60;i++)S.update(1/60);
        return {ok,has,html,before,after,cleared:!S.runSaved(),next:[g.wave,g.safe,g.map]}}""")
    check('забег сохраняется в безопасной зоне', r['ok'] and r['has'] and r['html'], r)
    check('сохранённый забег продолжается как был', {k: v for k, v in r['before'].items() if k != 'gold'} == {k: v for k, v in r['after'].items() if k != 'gold'} and r['after']['gold'] >= r['before']['gold'] and r['cleared'], r)
    check('после продолжения портал работает', r['next'][0] == 9 and not r['next'][1], r['next'])
    r = J("""()=>{const S=window.__sb;S.quitToMenu();S.startRun('fire',1);const g=S.G;g.p.inv=1e9;S.startWave(8);const e=g.bossRef;e.bar=0;let n=0;while(!e.dead&&n<4000){e.hp=Math.min(e.hp,1);S.hitEnemy(e,99999,{dt:'pure',src:'skill'});n++}
        for(let i=0;i<200;i++){if(g.lvlOpen)S.pickCard(0);S.update(1/60)}const auto=!!S.runSaved();S.clearRun();S.quitToMenu();return auto}""")
    check('автосохранение после каждой карты', r, r)
    r = J("""()=>{const S=window.__sb;S.SAVE.mmove=true;S.quitToMenu();S.startRun('fire',1);const g=S.G;g.p.inv=1e9;const x0=g.p.x;const c=document.getElementById('c');
        c.dispatchEvent(new PointerEvent('pointerdown',{pointerType:'mouse',button:0,clientX:innerWidth/2+300,clientY:innerHeight/2,bubbles:true}));for(let i=0;i<60;i++)S.update(1/60);
        const d=g.p.x-x0;window.dispatchEvent(new PointerEvent('pointerup',{pointerType:'mouse',button:0}));S.SAVE.mmove=false;return d}""")
    check('ходьба мышью (настройка)', r > 60, r)
    r = J("""()=>{const S=window.__sb;S.quitToMenu();S.startRun('fire',1);const g=S.G;g.p.inv=1e9;S.startWave(2);const hp0=g.S.maxHp,out={};
        for(let k=0;k<2;k++){g.evts=[{t:'altar',x:g.p.x+20,y:g.p.y,used:false,bob:0}];g.phase='inter';const sp=g.sp,pd=g.pending;S.interact();out['a'+k]=[g.sp-sp,g.pending-pd,Math.round(g.S.maxHp)]}
        out.hp0=Math.round(hp0);
        S.startWave(3);S.endWave();out.short=[g.inter,g.merch.length];S.startWave(4);S.endWave();out.long=[g.inter,g.merch.length>0];return out}""")
    check('алтарь крови: цена и награда растут', r['a0'][0] == 1 and r['a0'][1] == 1 and r['a1'][1] == 2 and r['a1'][2] < r['a0'][2] < r['hp0'], r)
    check('короткая передышка и пауза с торговцами через волну', r['short'][0] <= 5 and r['short'][1] == 0 and r['long'][0] >= 20 and r['long'][1], r)
    print('Меню и древо')
    r = J("""()=>{const S=window.__sb;S.quitToMenu();S.setTab('play');const b=document.querySelector('[data-start]').getBoundingClientRect();
        const names=[...document.querySelectorAll('.hpick b')].map(x=>x.textContent);
        S.startRun('metal',1);const g=S.G;g.sp=5;S.openTree();const heads=[...document.querySelectorAll('#trList h4')].map(h=>h.textContent);S.closeTree();
        S.quitToMenu();S.startRun('avatar',1);const g2=S.G;S.openTree();const heads2=[...document.querySelectorAll('#trList h4')].map(h=>h.textContent);S.closeTree();
        S.quitToMenu();return {vis:b.bottom<=innerHeight&&b.top>=0,names,heads,heads2}}""")
    check('кнопка «Начать забег» видна без прокрутки', r['vis'], r)
    check('герои названы по персонажам', 'Солдат' in r['names'] and 'Пиромант' in r['names'] and 'Металл' not in r['names'], r['names'])
    check('в древе только стихия героя', len([h for h in r['heads'] if h.startswith('Металл')]) == 1 and not any(h.startswith('Огонь') for h in r['heads']) and 'Симбиозы' not in r['heads'], r['heads'])
    print('Реликвии, события, комбо, сложность')
    r = J("""()=>{const S=window.__sb;S.quitToMenu();S.startRun('fire');const g=S.G;S.startWave(8);g.p.inv=1e9;const e=g.bossRef;e.bar=0;
        let n=0;while(!e.dead&&n<4000){e.hp=Math.min(e.hp,1);S.hitEnemy(e,99999,{dt:'pure',src:'skill'});n++}
        for(let i=0;i<200&&!g.lvlOpen;i++)S.update(1/60);
        const cards=(g.choices||[]).map(c=>c.kind);if(g.lvlOpen)S.pickCard(0);
        return {cards,relics:g.relics.slice(),phase:g.phase}}""")
    check('реликвия после босса', r['cards'] == ['relic'] * 3 and len(r['relics']) == 1, r)
    r = J("""()=>{const S=window.__sb,g=S.G,out={};g.p.gold=0;
        for(const t of ['altar','chest','trial']){g.evts=[{t,x:g.p.x+20,y:g.p.y,used:false,bob:0}];g.p.hp=g.S.maxHp;const sp=g.sp,gold=g.p.gold;S.interact();
          out[t]={used:g.evts[0].used,sp:g.sp-sp,gold:g.p.gold-gold}}
        out.trialW=g.trialW;out.curseW=g.curseW;S.render();return out}""")
    check('события между волнами', r['altar']['used'] and r['altar']['sp'] == 1 and r['chest']['gold'] > 0 and r['trial']['used'] and r['trialW'] == r['curseW'], r)
    r = J("""()=>{const S=window.__sb;S.quitToMenu();S.startRun('air');const g=S.G;S.addToBag('berserk');S.addToBag('bloodpact');S.recalc();return g.synOn}""")
    check('комбо предметов', r == ['Безумие'], r)
    r = J("""()=>{const S=window.__sb;S.SAVE.asc=5;S.SAVE.ascSel=5;S.quitToMenu();S.startRun('air');const g=S.G;S.startWave(3);const e=S.spawnEnemy('wisp');
        const hp5=e.max;S.SAVE.ascSel=0;S.quitToMenu();S.startRun('air');S.startWave(3);const e0=S.spawnEnemy('wisp');const r={asc5:hp5,asc0:e0.max};S.SAVE.asc=0;return r}""")
    check('сложность V крепче обычной', r['asc5'] > r['asc0'] * 1.2, r)

    le = J("()=>window.__le||null")
    check('нет ошибок в отложенных эффектах', not le, le)
    check('нет ошибок JS', not errs, errs[:5])
    b.close()

print('\nИТОГ: ' + ('всё в порядке' if not fails else 'провалено ' + str(len(fails)) + ': ' + ', '.join(fails)))
sys.exit(1 if fails else 0)
