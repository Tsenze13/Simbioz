/* =====================================================================
   ПАУЗА И ИТОГИ
   ===================================================================== */
function buildChips(g){
  let h='';
  for(const k of EK){
    if(g.el[k]>0)h+='<span class="chip" style="--c1:'+EL[k].c+'"><span class="orb sm" style="--c1:'+EL[k].c+';--c2:'+EL[k].c2+'"></span><b>'+EL[k].n+'</b><span class="pips" style="--c1:'+EL[k].c+'">'+pips(g.el[k])+'</span></span>';
  }
  for(const s of g.slots){
    if(!s)continue;
    const a=AB[s.id],dual=a.cat!=='skill';
    h+='<span class="chip"><span class="orb sm'+(dual?' dual':'')+'" style="--c1:'+a.c1+';--c2:'+a.c2+'"></span><b>'+a.n+'</b><span class="pips" style="--c1:'+a.c1+'">'+pips(s.lv)+'</span></span>';
  }
  for(const b of g.bag){
    if(!b)continue;
    const d=ITEMS[b.id];
    h+='<span class="chip stat"><b>'+d.n+'</b>'+(d.ch?' ×'+b.ch:'')+'</span>';
  }
  for(const id of g.relics||[])h+='<span class="chip" style="--c1:#ffd36b" title="'+RELICS[id].d+'"><span class="orb sm" style="--c1:#ffd36b;--c2:'+BOSS[RELICS[id].boss].col+'"></span><b>'+RELICS[id].n+'</b></span>';
  for(const n of g.synOn||[])h+='<span class="chip stat" style="border-color:#c47bff"><b style="color:#c9b3ff">Комбо: '+n+'</b></span>';
  for(const k in g.pass){if(g.pass[k]>0)h+='<span class="chip stat"><b>'+STCM[k].n+'</b> '+g.pass[k]+'</span>'}
  return h;
}
function fillStats(){
  const g=G,S=g.S,E=g.E;
  const rows=[
    ['Карта',MAPS[g.map].n],['Сложность',ASC[g.asc||0].n],['Здоровье',Math.round(S.maxHp)],['Регенерация',E.regen.toFixed(1)+' в с'],
    ['Мана',Math.round(S.maxMana)],['Восстановление маны',S.mreg.toFixed(1)+' в с'],
    ['Радиус подбора',Math.round(S.magnet)],['Урон','+'+Math.round((E.dm-1)*100)+'%'],
    ['Скорость бега','+'+Math.round((E.spd-1+0.03*g.el.air)*100)+'%'],['Скорость навыков','+'+Math.round(S.cdr*100)+'%'],
    ['Размах','+'+Math.round(S.area*100)+'%'],['Шанс крита',Math.round(S.crit*100)+'%'],
    ['Броня',E.armor.toFixed(0)+' (−'+Math.round(armorRed(E.armor)*100)+'% физ.)'],['Сопр. магии',Math.round(S.mres*100)+'%'],
    ['Вампиризм',Math.round(E.ls*100)+'%'],['Опыт','+'+Math.round(S.xpm*100)+'%'],
    ['Золото','+'+Math.round(S.goldm*100)+'%'],['Откат ульты','−'+Math.round(S.ultcd*100)+'%']
  ];
  $('sgrid').innerHTML=rows.map(r=>'<div><span>'+r[0]+'</span><b>'+r[1]+'</b></div>').join('');
  $('pBuild').innerHTML=buildChips(g);
}
let quitArmed=0;
$('resume').addEventListener('click',togglePause);
$('quit').addEventListener('click',()=>{
  if(!quitArmed){quitArmed=1;$('quit').textContent='Точно выйти? Забег будет потерян';return}
  quitArmed=0;$('quit').textContent='Выйти в меню';
  if(G&&!G.over){const add=payEssence(false);SAVE.runs++;SAVE.best=Math.max(SAVE.best,G.wave);store()}
  quitToMenu();
});
function dmgRows(g){
  const D=g.dmgBy||{},ks=Object.keys(D).filter(k=>D[k]>=1).sort((a,b)=>D[b]-D[a]),tot=ks.reduce((s,k)=>s+D[k],0)||1,top=D[ks[0]]||1;
  if(!ks.length)return '<p class="sub" style="margin:0">Урона не нанесено.</p>';
  const fmt=v=>v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e4?Math.round(v/1e3)+'K':String(Math.round(v));
  const col=k=>k==='__ult'?'#ffd36b':AB[k]?AB[k].c1:k==='__gun'?'#e8eef8':k==='__dot'?'#ff9a3c':k==='__auto'?hEl(g.start).c:'#9cc4ff';
  return ks.slice(0,8).map(k=>'<div class="dr" style="--c1:'+col(k)+'"><span>'+dmgLabel(k)+'</span><i style="width:'+Math.max(1,D[k]/top*100).toFixed(1)+'%"></i><b>'+fmt(D[k])+' · '+Math.round(D[k]/tot*100)+'%</b></div>').join('');
}
function showOver(win,add){
  const g=G;
  $('goT').textContent=win?'Пожиратель повержен':(g.endless?'Бесконечный режим окончен':'Аватар пал');
  $('goW').textContent=g.wave;$('goLv').textContent=g.p.lv;$('goK').textContent=g.kills;$('goE').textContent='+'+add;
  $('goBuild').innerHTML=buildChips(g);
  {const w=$('goWhy');if(!win&&g.lastHurt){w.hidden=false;w.innerHTML='Последний удар: <b>'+g.lastHurt.n+'</b> (−'+g.lastHurt.d+')'}else w.hidden=true}
  $('goDmg').innerHTML=dmgRows(g);
  $('endless').hidden=!win;
  $('again').textContent='В меню';
  $('goBest').textContent='Лучшая волна: '+SAVE.best+' · Всего эссенции: '+SAVE.ess;
  $('hud').hidden=true;$('levelup').hidden=true;$('shop').hidden=true;$('pause').hidden=true;$('over').hidden=false;
}
$('again').addEventListener('click',quitToMenu);
$('endless').addEventListener('click',()=>{
  const g=G;
  if(!g)return;
  g.over=false;g.endless=true;mode='play';
  $('over').hidden=true;$('hud').hidden=false;hc={};
  endWave();
  toast('Бесконечный режим','Враги будут только сильнее');
});
$('pauseBtn').addEventListener('click',togglePause);
$('skipBtn').addEventListener('click',skipWave);
$('useBtn').addEventListener('click',interact);
$('dashBtn').addEventListener('pointerdown',e=>{e.preventDefault();uiTouch=true;tryDash()});

