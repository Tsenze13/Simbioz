/* =====================================================================
   ЦИКЛ
   ===================================================================== */
let last=performance.now();
/* ---------- живые портреты ---------- */
const POR={off:null,oc:null,last:0};
const PCR={x:18,y:8,w:164,h:192};
function porDraw(cv,key,hp){
  if(!cv||!window.PORTRAIT)return;
  const r=cv.getBoundingClientRect();if(!r.width)return;
  const d=Math.min(2,window.devicePixelRatio||1),w=Math.round(r.width*d),h=Math.round(r.height*d);
  if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}
  const sz=Math.round(h/PCR.h*200);
  if(!POR.off||POR.off.width!==sz){POR.off=document.createElement('canvas');POR.off.width=POR.off.height=sz;POR.oc=POR.off.getContext('2d')}
  const k=sz/200,oc=POR.oc;oc.setTransform(k,0,0,k,0,0);oc.clearRect(0,0,200,200);
  try{PORTRAIT.draw(oc,key,anim,clamp(hp,0,1),0)}catch(e){}
  const c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);c.imageSmoothingQuality='high';
  c.drawImage(POR.off,PCR.x*k,PCR.y*k,PCR.w*k,PCR.h*k,0,0,w,h);
}
function portraits(){
  const now=performance.now();if(now-POR.last<40)return;POR.last=now;
  if(mode==='menu'){const m=$('mpc');if(m)porDraw(m,menuEl,1)}
  else if(G&&$('hud')&&!$('hud').hidden)porDraw($('pc'),G.start,G.p.hp/G.S.maxHp);
}
let fpsA=60,fpsT=0;
function frame(t){
  const raw=(t-last)/1000,dt=Math.min(0.05,Math.max(0,raw));last=t;anim+=dt;
  if(SAVE.fps){if(raw>0&&raw<1)fpsA+=(1/raw-fpsA)*0.05;fpsT-=raw;if(fpsT<=0){fpsT=0.5;const el=$('fps');el.hidden=false;el.textContent=Math.round(fpsA)+' FPS'+(G&&mode==='play'?' · врагов '+G.en.length:'')}}else if(fpsT!==-1){fpsT=-1;$('fps').hidden=true}
  try{
    if(mode==='play'&&G&&!G.paused&&!G.lvlOpen&&!G.shopOpen&&!G.treeOpen&&!G.over)update(dt);
    else if(mode==='menu')demoUpdate(dt);
    ambUpdate(dt);render();hud();portraits();MUS.update();
  }catch(err){
    console.error(err);
  }
  requestAnimationFrame(frame);
}
addEventListener('resize',resize);
resize();
renderMenu();
requestAnimationFrame(frame);

if(DEBUG){
  window.__x={SPAB:SP.AB,ultInfo,symUlt,buildChoicesX:()=>buildChoices(),skillAvail,setTr:(k)=>{trSel=k;openTree()},OPP};
  window.__pasUp=pasUp;window.__trPas=()=>{trSel='__pas';openTree()};
  window.__sb={
    get G(){return G},get mode(){return mode},SAVE:SAVE,AB:AB,ITEMS:ITEMS,ET:ET,
    CLS,genStock,TREE,openTree,openLevelUp,GUNS,closeTree,renderTree,skillPr,
    MAPS,getChunk,enterBiome,skyStrike,showBiome,biomeFor,BIOMES,startRun,update:(dt)=>{if(mode==='play'&&G&&!G.over)update(dt)},castSlot,castUlt,useItem,pickCard,openShop,closeShop,buyItem,sellItem,
    learnSkill,addToBag,spawnEnemy,startWave,endWave,applyChoice,buildChoices,recalc,hurtPlayer,hitEnemy,tryDash,render,hud,
    nearMerchant,skipWave,winRun,endRun,quitToMenu,renderMenu,setTab:(t)=>{menuTab=t;renderMenu()},bossKeyFor,doFuse,priceOf,
    setMouse:(x,y)=>{mouse.x=x;mouse.y=y;mouse.on=true;uiTouch=false},key:(c,d)=>{codes[c]=d},togglePause,gainXp,
    GMOD,heroMech,interact,FORMS,FORM_IDS,MSEAL,castUlt,MUS,get ac(){return ac},bossPattern,itemTip,ultCanUp,BOSS,
    ultMods,fillStats,essenceFor,freeSlot,uiOpen,setMenuEl:(k)=>{menuEl=k;renderMenu()}
  };
}
})();
