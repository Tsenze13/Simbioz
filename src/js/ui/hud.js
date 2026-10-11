/* =====================================================================
   ИНТЕРФЕЙС: ХОТБАР, ПОДСКАЗКИ
   ===================================================================== */
let hc={};
let dockRefs={sk:[],bag:[]};
const pips=(n,max)=>{let h='';for(let i=1;i<=(max||5);i++)h+='<u'+(i<=n?' class="on"':'')+'></u>';return h};
function buildTopHud(){
  const g=G,E=EL[g.start];
  $('portrait').style.setProperty('--c1',E.c);$('pel').textContent=E.n;$('pname').textContent=CLS[g.start].n;
  $('portOrb').style.setProperty('--c1',E.c);$('portOrb').style.setProperty('--c2',E.c2);
}
function renderDock(){
  const g=G;
  const sig=g.pl+':'+(pasCan()?1:0)+'|'+g.slots.map(s=>s?s.id+s.lv:'-').join(',')+'|'+g.bag.map(b=>b?b.id+':'+b.ch:'-').join(',')+'|'+g.ult.lv+(g.ult.kind||'')+'|'+g.start+'|'+JSON.stringify(SAVE.keys);
  if(g.dockSig===sig)return;
  g.dockSig=sig;
  {const l=g.pl||0;$('pasw').innerHTML='<button class="slot pas'+(pasCan()?' can':'')+'" type="button" tabindex="-1" data-k="p" data-i="0" style="--c1:'+EL[g.start].c+'"><canvas width="104" height="104" id="pasCv"></canvas><span class="pp">'+[0,1,2].map(i=>'<b class="'+(i<l?'on':'')+'"></b>').join('')+'</span></button>'}
  let h='';
  for(let i=0;i<5;i++){
    const s=g.slots[i],key=keyName(SAVE.keys['s'+(i+1)]);
    if(s){
      const a=AB[s.id];
      h+='<button class="slot sk" type="button" tabindex="-1" data-k="s" data-i="'+i+'" style="--c1:'+a.c1+';--c2:'+a.c2+'"><span class="ic">'+icon(a.gl)+'</span><span class="key">'+key+'</span><span class="cost">'+a.mana+'</span><span class="lv">'+pips(s.lv)+'</span><span class="cdov"></span><span class="cdt"></span></button>';
    }else h+='<button class="slot empty" type="button" tabindex="-1" data-k="s" data-i="'+i+'"><span class="key">'+key+'</span></button>';
  }
  const u=ultInfo(),E=EL[g.start];
  h+='<button class="slot ult'+(g.ult.lv?'':' locked')+'" type="button" tabindex="-1" data-k="u" data-i="0" style="--c1:'+u.c1+';--c2:'+u.c2+'"><span class="ic">'+(g.ult.lv?icon('ult'):'<b style="font-size:11px;line-height:1.1;text-align:center">🔒<br>'+ULT_LV+' ур.</b>')+'</span><span class="key">'+keyName(SAVE.keys.ult)+'</span><span class="cost">'+u.mana+'</span><span class="lv">'+pips(g.ult.lv,3)+'</span><span class="cdov"></span><span class="cdt"></span></button>';
  $('skills').innerHTML=h;
  let b='';
  for(let i=0;i<6;i++){
    const x=g.bag[i],key=keyName(SAVE.keys['i'+(i+1)]);
    if(x){
      const d=ITEMS[x.id];
      b+='<button class="slot item r'+(d.rar||0)+'" type="button" tabindex="-1" data-k="i" data-i="'+i+'" style="--c1:'+d.c[0]+';--c2:'+d.c[1]+'"><span class="ic">'+iconItem(d)+'</span><span class="key">'+key+'</span>'+(d.ch?'<span class="ch">'+x.ch+'</span>':'')+(d.mana?'<span class="cost">'+d.mana+'</span>':'')+'<span class="cdov"></span><span class="cdt"></span></button>';
    }else b+='<button class="slot item empty" type="button" tabindex="-1" data-k="i" data-i="'+i+'"><span class="key">'+key+'</span></button>';
  }
  $('bag').innerHTML=b;
  dockRefs.sk=Array.from($('skills').children);
  dockRefs.bag=Array.from($('bag').children);
}
function setCd(el,cd,max,afford){
  if(!el||el.classList.contains('empty'))return;
  const ov=el.children[el.children.length-2],tx=el.children[el.children.length-1];
  const k=cd>0?Math.round(cd/max*100):0;
  if(el._k!==k){el._k=k;ov.style.transform='scaleY('+(cd>0?clamp(cd/max,0,1):0)+')'}
  const t=cd>0?(cd>=10?String(Math.ceil(cd)):cd.toFixed(1)):'';
  if(el._t!==t){el._t=t;tx.textContent=t}
  const nm=afford===false;
  if(el._n!==nm){el._n=nm;el.classList.toggle('nomana',nm)}
}
function setText(id,v){
  if(hc[id]!==v){hc[id]=v;$(id).textContent=v}
}
function hud(){
  if(mode!=='play'||!G)return;
  const g=G,p=g.p,S=g.S;
  renderDock();
  {const pc=$('pasCv');if(pc)pIcon(pc.getContext('2d'),g.start,anim,g.pl||0)}
  /* хотбар */
  for(let i=0;i<5;i++){
    const s=g.slots[i];
    if(s)setCd(dockRefs.sk[i],s.cd,s.cdMax||1,p.mana>=AB[s.id].mana);
  }
  setCd(dockRefs.sk[5],g.ult.cd,g.ult.cdMax||1,p.mana>=ultInfo().mana);
  for(let i=0;i<6;i++){
    const b=g.bag[i];
    if(b){const d=ITEMS[b.id];setCd(dockRefs.bag[i],b.cd,b.cdMax||1,d.mana?p.mana>=d.mana:true)}
  }
  /* бары */
  const hp=Math.ceil(p.hp);
  const rgh=Math.round(g.E.regen*10)/10;
  if(hc.hp!==hp||hc.mx!==S.maxHp||hc.rgh!==rgh){hc.hp=hp;hc.mx=S.maxHp;hc.rgh=rgh;$('hpF').style.transform='scaleX('+clamp(p.hp/S.maxHp,0,1)+')';$('hpT').textContent=hp+' / '+Math.round(S.maxHp);$('hpR').textContent='+'+rgh.toFixed(1)+'/с'}
  const mp=Math.floor(p.mana);
  const mrh=Math.round(S.mreg*10)/10;
  if(hc.mp!==mp||hc.mm!==S.maxMana||hc.mrh!==mrh){hc.mp=mp;hc.mm=S.maxMana;hc.mrh=mrh;$('mpF').style.transform='scaleX('+clamp(p.mana/S.maxMana,0,1)+')';$('mpT').textContent=mp+' / '+Math.round(S.maxMana);$('mpR').textContent='+'+mrh.toFixed(1)+'/с'}
  const xp=Math.round(p.xp/p.need*100);
  if(hc.xp!==xp){hc.xp=xp;$('portrait').style.setProperty('--p',xp);$('pxpF').style.width=xp+'%'}
  {const hu=p.hp<S.maxHp*0.25;if(hc.hu!==hu){hc.hu=hu;$('portrait').classList.toggle('hurt',hu)}}
  setText('portLv',String(p.lv));
  {const sig=p.lv+'|'+Math.round(g.E.dm*100)+'|'+Math.round(g.E.armor)+'|'+Math.round(g.E.spd*100)+'|'+Math.round(g.E.cdr*100)+'|'+g.el.air+'|'+Math.round(g.E.mres*100);if(hc.hst!==sig){hc.hst=sig;renderHStats()}}
  setText('kl',g.kills+' убито');
  const gd=Math.floor(p.gold);
  if(hc.gold!==gd){hc.gold=gd;$('gold').innerHTML='<span class="coin"></span>'+gd;$('gold2').innerHTML='<span class="coin"></span>'+gd}
  /* волна */
  setText('waveL',g.endless?('Волна '+g.wave+' · бесконечный режим'):('Волна '+g.wave+' из '+WAVES_TOTAL));
  const boss=!!bossKeyFor(g.wave);
  if(g.phase==='fight'){
    setText('waveT',boss?'Босс':fmt(g.waveDur-g.wt));
    const nb=4-((g.wave-1)%4);
    setText('waveS',(boss?'Победи босса, чтобы закончить волну':('До конца волны · врагов '+g.en.length))+(!g.endless&&g.wave<WAVES_TOTAL?' · смена карты: '+nb+' в.':''));
  }else{
    setText('waveT',fmt(g.inter));
    setText('waveS','Пауза. Подойди к торговцу. Enter начнёт волну раньше.');
  }
  if(hc.mapSig!==g.map){
    hc.mapSig=g.map;const M=MAPS[g.map];
    $('mapS').innerHTML='<span style="color:'+M.glow+'">◆ '+M.n+'</span> · <span class="up">▲ '+M.mods.buff.n+'</span> · <span class="dn">▼ '+M.mods.debuff.n+'</span>';
    $('mapS').title='▲ '+M.mods.buff.n+': '+M.mods.buff.d+'\n▼ '+M.mods.debuff.n+': '+M.mods.debuff.d+'\n☠ '+M.foe.n+': '+M.foe.d;
  }
  const br=g.bossRef&&!g.bossRef.dead;
  if(hc.boss!==br){hc.boss=br;$('boss').hidden=!br}
  if(br){setText('bossN',g.bossRef.name+(g.bossRef.bar>0?' · барьер '+Math.ceil(g.bossRef.bar/g.bossRef.barMax*100)+'%':'')+(g.bossRef.phase>1?' · фаза '+g.bossRef.phase:''));$('bossF').style.transform='scaleX('+clamp(g.bossRef.hp/g.bossRef.max,0,1)+')'}
  const nm=g.phase==='inter'?nearMerchant():null;
  const key=!!nm;
  {const cd=dashCd().toFixed(1),dc=g.p.dch+'/'+(1+(g.S.dch||0))+' · '+cd+'с';if(hc.dc!==dc){hc.dc=dc;$('dashBtn').textContent='Рывок '+dc;$('dashBtn').title='Заряды рывка и время перезарядки одного заряда'}}
  if(hc.nm!==key){hc.nm=key;$('prompt').hidden=!key||uiTouch;$('useBtn').hidden=!key;if(nm)$('useBtn').textContent=MERCH[nm.id].n}
  if(nm&&!uiTouch)$('prompt').textContent=keyName(SAVE.keys.use)+' — '+MERCH[nm.id].n;
  const inter=g.phase==='inter';
  if(hc.inter!==inter){hc.inter=inter;$('skipBtn').hidden=!inter}
}
function tipFor(k,i){
  const g=G;
  if(k==='p')return pasTip();
  if(k==='s'){
    const s=g.slots[i],key=keyName(SAVE.keys['s'+(i+1)]);
    if(!s)return '<div class="tn">Пустой слот ['+key+']</div><div class="td">Навыки даются на повышении уровня или покупаются свитками у Чародея.</div>';
    const a=AB[s.id];
    return '<div class="tn">'+a.n+'</div><div class="tm">Ур. '+s.lv+' · мана <b>'+a.mana+'</b> · откат '+(a.cd/(1+g.E.cdr)).toFixed(1)+' с · ['+key+']</div><div class="td">'+a.d+'</div>'+(s.lv<5?'<div class="tu">Следующий уровень: '+a.up[s.lv-1]+'</div>':'');
  }
  if(k==='u'){
    const u=ultInfo(),mods=ultMods();
    if(!g.ult.lv)return '<div class="tn">Ульта закрыта</div><div class="td">С '+ULT_LV+' уровня героя её можно открыть за 1 очко навыков: древо (T) → «Ульта» выберите направление: ульта героя «'+ULT[g.start].n+'» или ульта одного из изученных симбиозов.</div><div class="tu">Уровни ульты открываются на '+ultNeedLv(2)+' и '+ultNeedLv(3)+' уровнях героя, печати — после изучения симбиозов.</div>';
    return '<div class="tn">'+u.n+'</div><div class="tm">Ульта ур. '+g.ult.lv+' · мана <b>'+u.mana+'</b> · откат '+Math.round(u.cd*(1-g.S.ultcd)/(1+g.E.cdr*0.5))+' с · ['+keyName(SAVE.keys.ult)+']</div><div class="td">'+u.d+'</div>'+(mods.length?'<div class="tu">Усилена симбиозами: '+mods.map(p=>ULTMOD[p]+' ('+ULTMODD[p]+')').join('; ')+'</div>':'<div class="tu">Симбиозы с вашей стихией добавляют ульте новые эффекты.</div>');
  }
  const x=g.bag[i];
  if(!x)return '<div class="tn">Пустой слот ['+keyName(SAVE.keys['i'+(i+1)])+']</div><div class="td">Рюкзак на 6 предметов. Покупайте у торговцев в паузе между волнами.</div>';
  const d=ITEMS[x.id];
  return itemTip(x.id,true)+'<div class="tu">Клавиша ['+keyName(SAVE.keys['i'+(i+1)])+']</div>';
}
(function initDock(){
  const dock=$('dock'),tip=$('tip');
  dock.addEventListener('pointerdown',e=>{
    const b=e.target.closest('.slot');
    if(!b||!G)return;
    e.preventDefault();
    const k=b.dataset.k,i=parseInt(b.dataset.i,10);
    if(e.pointerType!=='mouse')uiTouch=true;
    if(k==='s')castSlot(i);else if(k==='u')castUlt();else if(k==='i')useItem(i);
    else if(k==='p'){if(!pasUp()){trSel='__pas';openTree()}else{tip.innerHTML=pasTip()}}
  });
  dock.addEventListener('mouseover',e=>{
    const b=e.target.closest('.slot');
    if(!b||!G||uiTouch){tip.hidden=true;return}
    tip.innerHTML=tipFor(b.dataset.k,parseInt(b.dataset.i,10));
    tip.hidden=false;
    const r=b.getBoundingClientRect(),tw=tip.offsetWidth,th=tip.offsetHeight;
    tip.style.left=clamp(r.left+r.width/2-tw/2,8,innerWidth-tw-8)+'px';
    tip.style.top=Math.max(8,r.top-th-10)+'px';
  });
  if(window.ResizeObserver)new ResizeObserver(()=>{$('hud').style.setProperty('--dockh',($('dock').offsetHeight+8)+'px')}).observe(dock);
  dock.addEventListener('mouseout',e=>{if(!e.relatedTarget||!e.relatedTarget.closest||!e.relatedTarget.closest('.slot'))tip.hidden=true});
})();

