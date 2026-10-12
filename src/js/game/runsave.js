/* =====================================================================
   СОХРАНЕНИЕ ЗАБЕГА: в безопасной зоне (между картами) можно сохраниться и выйти,
   а потом продолжить из меню. Сохраняется только состояние героя и забега —
   всё мимолётное (частицы, снаряды, враги) сбрасывается: в безопасной зоне их и так нет.
   ===================================================================== */
const RUN_KEY='simbioz-run';
const RUN_SKIP={pt:1,fx:1,tx:1,deb:1,smk:1,spk:1,fl:1,sc:1,hfx:1,afx:1,cfx:1,later:1,en:1,eps:1,tgs:1,pr:1,zn:1,bl:1,tor:1,bolts:1,beams:1,gh:1,em:1,stc:1,sk:1,pch:1,
  solids:1,pools:1,decors:1,hsim:1,hch:1,hf:1,cls:1,bossRef:1,dv:1,rt:1,jet:1,walls:1,spl:1,chan:1,gem:1,choices:1};
function runSaved(){try{const R=JSON.parse(localStorage.getItem(RUN_KEY)||'null');return R&&R.g?R:null}catch(_){return null}}
function clearRun(){try{localStorage.removeItem(RUN_KEY)}catch(_){}}
function saveRun(){
  const g=G;if(!g||!g.safe||g.over)return false;
  const o={};
  for(const k in g){if(RUN_SKIP[k])continue;const v=g[k];if(typeof v==='function')continue;o[k]=v}
  if(g.feat)o.feat=Object.assign({},g.feat,{ref:null});
  /* золото и опыт, лежащие на земле, забираем сразу */
  for(const m of g.gem){if(m.k==='coin')o.p.gold+=Math.round(m.v*(1+g.S.goldm))}
  try{localStorage.setItem(RUN_KEY,JSON.stringify({v:1,at:Date.now(),g:o}));return true}catch(_){return false}
}
function loadRun(){
  const R=runSaved();if(!R)return false;
  const s=R.g;
  G=Object.assign(mkState(s.start,s.map),s);
  const g=G;
  g.cls=CLS[g.start]||null;g.gk='';g.later=[];g.bossRef=null;g.paused=false;g.lvlOpen=false;g.shopOpen=false;g.treeOpen=false;g.over=false;g.chan=null;
  if(g.feat)g.feat.ref=null;
  mode='play';recalc();
  cam.x=g.p.x-VW/2;cam.y=g.p.y-VH/2;
  $('menu').hidden=true;$('over').hidden=true;$('pause').hidden=true;$('levelup').hidden=true;$('shop').hidden=true;$('hud').hidden=false;
  hc={};buildTopHud();hintQ=[];hintT=0;$('hint').hidden=true;
  clearRun();
  toast('Забег продолжен','Глава '+(g.ch||1)+' · '+MAPS[g.map].n+' · безопасная зона');
  return true;
}
function runSavedLine(){
  const R=runSaved();if(!R)return '';
  const s=R.g,C=CHAP[clamp((s.ch||1)-1,0,CHAP.length-1)],hero=s.start==='avatar'?'Аватар':CLS[s.start].n;
  return hero+' · глава '+(s.ch||1)+' «'+C.n+'» · пройдено карт: '+mapStage(s.wave)+' из 3 · ур. '+s.p.lv;
}
