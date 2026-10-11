/* =====================================================================
   ВВОД
   ===================================================================== */
function toggleMute(){SAVE.muted=!SAVE.muted;store();if(mode==='menu'&&menuTab==='keys')renderMenu()}
addEventListener('keydown',e=>{
  const c=e.code;
  if(listening){e.preventDefault();finishListen(c);return}
  if(mode==='menu')return;
  const act=KEYMAP[c];
  if(c==='Space'||c.startsWith('Arrow')||c==='Tab')e.preventDefault();
  codes[c]=true;
  if(e.repeat)return;
  const g=G;
  if(!g)return;
  if(g.lvlOpen){
    if(c==='Digit1'||c==='Digit2'||c==='Digit3')pickCard(parseInt(c.slice(5),10)-1);
    return;
  }
  if(act==='mute'){toggleMute();return}
  if(g.treeOpen){if(act==='tree'||act==='pause'||c==='Escape')closeTree();return}
  if(g.shopOpen){if(act==='use'||act==='pause'||c==='Escape')closeShop();return}
  if(g.over)return;
  if(act==='pause'||c==='Escape'){togglePause();return}
  if(g.paused)return;
  if(act==='dash')tryDash();
  else if(act==='ult')castUlt();
  else if(act==='tree')openTree();
  else if(act==='use')interact();
  else if(act==='skip')skipWave();
  else if(act&&act.length===2&&act[0]==='s')castSlot(parseInt(act[1],10)-1);
  else if(act&&act.length===2&&act[0]==='i')useItem(parseInt(act[1],10)-1);
});
addEventListener('keyup',e=>{codes[e.code]=false});
addEventListener('blur',()=>{for(const k in codes)codes[k]=false});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play'&&G&&!G.paused&&!G.lvlOpen&&!G.shopOpen&&!G.treeOpen)togglePause()});
const cv=$('c'),ctx=cv.getContext('2d');
cv.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse')return;
  uiTouch=true;
  joy.on=true;joy.id=e.pointerId;joy.ox=joy.cx=e.clientX;joy.oy=joy.cy=e.clientY;joy.dx=joy.dy=0;
  try{cv.setPointerCapture(e.pointerId)}catch(_){}
});
cv.addEventListener('pointermove',e=>{
  if(e.pointerType==='mouse'){mouse.x=e.clientX;mouse.y=e.clientY;mouse.on=true;uiTouch=false;return}
  if(!joy.on||e.pointerId!==joy.id)return;
  const R=52;let dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;const m=Math.hypot(dx,dy);
  if(m>R){dx=dx/m*R;dy=dy/m*R}
  joy.cx=joy.ox+dx;joy.cy=joy.oy+dy;
  joy.dx=m<7?0:dx/R;joy.dy=m<7?0:dy/R;
});
function joyEnd(e){if(e.pointerId===joy.id){joy.on=false;joy.dx=joy.dy=0}}
cv.addEventListener('pointerup',joyEnd);
cv.addEventListener('pointercancel',joyEnd);
document.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){mouse.x=e.clientX;mouse.y=e.clientY;mouse.on=true;uiTouch=false}});

