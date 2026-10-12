/* =====================================================================
   МЕНЮ «ВДВОЁМ»: имя, герой, комната по коду, ручное подключение, старт.
   ===================================================================== */
function lobbyMe(){return {name:(SAVE.nick||'Игрок').slice(0,16),start:menuEl,meta:Object.assign({},SAVE.meta)}}
const LOB={manual:false,inv:'',ans:'',joinCode:'',busy:false};
function heroLabel(p){return p?(p.start==='avatar'?'Аватар':CLS[p.start].n):'—'}
function coopTab(){
  let picks='';
  for(const k of HEROK){const E=hEl(k);picks+='<button class="hpick'+(menuEl===k?' on':'')+(k==='avatar'?' ava':'')+'" type="button" data-el="'+k+'" style="--c1:'+E.c+';--c2:'+E.c2+'"><span class="orb"></span><b>'+heroName(k)+'</b></button>'}
  return '<section class="lobby"><div><h2 class="sec">Игра вдвоём</h2><p class="sub" style="margin:0">Один игрок создаёт комнату и говорит другу код из 5 цифр. Второй вводит код — игра соединяет вас напрямую. Лучше играть в одном и том же браузере (например, оба в Chrome).</p></div>'
    +'<div class="lrow"><label>Ваше имя <input id="nick" maxlength="16" value="'+(SAVE.nick||'').replace(/"/g,'')+'" placeholder="Игрок"></label></div>'
    +'<div><h2 class="sec">Ваш герой</h2><div class="hpicks">'+picks+'</div></div>'
    +'<div id="lobbyDyn">'+lobbyDyn()+'</div></section>';
}
function lobbyDyn(){
  const st=NET.st,h=[];
  const log=NET.log.slice(-4).map(s=>'<div>'+s+'</div>').join('');
  if(st==='idle'||st==='err'||st==='closed'){
    h.push('<div class="lcards"><div class="lcard"><b>Создать комнату</b><p class="sub">Получите код и отправьте его другу.</p><button class="btn" type="button" data-net="host">Создать комнату</button></div>'
      +'<div class="lcard"><b>Войти по коду</b><p class="sub">Код вам скажет друг.</p><div class="lrow"><input id="joinCode" maxlength="7" inputmode="numeric" autocomplete="off" placeholder="Например 14827" value="'+LOB.joinCode+'" style="letter-spacing:.2em;width:9em"><button class="btn" type="button" data-net="join">Войти</button></div></div></div>');
    h.push('<details class="lman"'+(LOB.manual?' open':'')+'><summary>Не соединяется? Подключиться вручную через мессенджер</summary>'+manualHtml()+'</details>');
    h.push('<details class="lman"><summary>Проверить на одном компьютере (две вкладки)</summary><p class="sub">Откройте игру во второй вкладке этого же браузера. В одной нажмите «Создать (вкладки)», в другой введите код, который начинается на 0.</p><button class="btn alt sm" type="button" data-net="hostL">Создать (вкладки)</button></details>');
  }else if(st==='wait'||st==='join'||st==='link'){
    h.push('<div class="lcard big">'+(NET.host&&NET.code?'<div class="sub">Код комнаты — скажите его другу</div><div class="lcode">'+NET.code+'</div><button class="btn alt sm" type="button" data-net="copy">Скопировать код</button>':'')+'<div class="lst">'+(st==='link'?'Соединяемся…':NET.host?'Ждём друга…':'Ищем комнату '+NET.code+'…')+'</div><button class="btn alt sm" type="button" data-net="leave">Отмена</button></div>');
  }else if(st==='manual'){
    h.push('<div class="lcard big">'+manualHtml()+'<button class="btn alt sm" type="button" data-net="leave">Отмена</button></div>');
  }else if(st==='open'){
    const me=lobbyMe(),fr=NET.friend;
    h.push('<div class="lplayers"><div class="lp" style="--c1:'+hEl(me.start).c+'"><small>Вы'+(NET.host?' · хозяин':'')+'</small><b>'+me.name+'</b><span>'+heroLabel(me)+'</span></div>'
      +'<div class="lp" style="--c1:'+(fr?hEl(fr.start).c:'#888')+'"><small>Друг'+(!NET.host?' · хозяин':'')+' · <span id="lping">'+pingTxt()+'</span></small><b>'+(fr?fr.name:'…')+'</b><span>'+heroLabel(fr)+'</span></div></div>');
    if(NET.verBad)h.push('<p class="lerr">У вас разные версии игры. Обновите страницу у обоих (Ctrl+F5).</p>');
    if(NET.host){
      h.push('<h2 class="sec">Глава</h2>'+chapRow()+'<h2 class="sec" style="margin-top:10px">Сложность</h2>'+ascRow());
      h.push('<div class="startbar"><button class="btn big" type="button" data-net="start"'+(fr&&!NET.verBad?'':' disabled')+'>Начать вдвоём</button><span class="sbinfo">Глава '+(SAVE.chSel||1)+' · опыт и золото общие · упавшего друга поднимают, постояв рядом</span></div>');
    }else h.push('<div class="lcard"><div class="lst">Хозяин комнаты выбирает главу и начинает игру. Можно поменять героя выше.</div></div>');
    h.push('<button class="btn alt sm" type="button" data-net="leave">Выйти из комнаты</button>');
  }
  if(log)h.push('<div class="llog">'+log+'</div>');
  return h.join('');
}
function manualHtml(){
  return '<div class="lman2"><p class="sub">1) Один нажимает «Создать приглашение» и отправляет длинный код другу. 2) Друг вставляет его и нажимает «Создать ответ», отправляет ответ обратно. 3) Первый вставляет ответ и нажимает «Подключить».</p>'
    +'<div class="lrow"><button class="btn alt sm" type="button" data-net="mOffer">Создать приглашение</button></div>'
    +(LOB.inv?'<textarea readonly rows="3" id="mInv">'+LOB.inv+'</textarea><button class="btn alt sm" type="button" data-net="copyInv">Скопировать</button>':'')
    +'<textarea rows="3" id="mIn" placeholder="Вставьте сюда код от друга"></textarea>'
    +'<div class="lrow"><button class="btn alt sm" type="button" data-net="mAnswer">Это приглашение → создать ответ</button><button class="btn alt sm" type="button" data-net="mFinish">Это ответ → подключить</button></div>'
    +(LOB.ans?'<textarea readonly rows="3" id="mAns">'+LOB.ans+'</textarea><button class="btn alt sm" type="button" data-net="copyAns">Скопировать ответ</button>':'')+'</div>';
}
function pingTxt(){const r=NET.rtt;return r?'связь '+Math.round(r)+' мс'+(r>250?' (медленно)':''):'связь…'}
function lobbyPing(){const e=$('lping');if(e)e.textContent=pingTxt()}
function lobbyRender(){if(mode==='menu'&&menuTab==='coop'){const d=$('lobbyDyn');if(d)d.innerHTML=lobbyDyn()}}
async function lobbyClick(t){
  const a=t.dataset.net;
  const copy=s=>{try{navigator.clipboard.writeText(s);nlog('Скопировано')}catch(_){}};
  try{
    if(a==='host')await netHost(false);
    else if(a==='hostL')await netHost(true);
    else if(a==='join'){const v=($('joinCode')||{}).value||'';LOB.joinCode=v;await netJoin(v)}
    else if(a==='leave'){netClose();LOB.inv=LOB.ans='';nlog('Вы вышли из комнаты')}
    else if(a==='copy')copy(NET.code);
    else if(a==='start')netStartGame();
    else if(a==='mOffer'){LOB.manual=true;LOB.inv=await manualOffer();nlog('Приглашение готово — отправьте его другу')}
    else if(a==='mAnswer'){LOB.manual=true;const v=($('mIn')||{}).value||'';LOB.ans=await manualAnswer(v);nlog('Ответ готов — отправьте его обратно')}
    else if(a==='mFinish'){const v=($('mIn')||{}).value||'';await manualFinish(v);nlog('Подключаемся…')}
    else if(a==='copyInv')copy(LOB.inv);
    else if(a==='copyAns')copy(LOB.ans);
  }catch(e){nlog('Ошибка: '+(e&&e.message||e))}
  lobbyRender();
}
/* сменили героя/главу в лобби — рассказать другу */
function lobbyChanged(){if(NET.st==='open'&&!COOP)netSend({k:'me',p:lobbyMe()})}
