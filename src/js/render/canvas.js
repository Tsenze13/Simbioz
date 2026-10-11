/* =====================================================================
   ОТРИСОВКА
   ===================================================================== */
let vig=null;
function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);
  W=innerWidth;H=innerHeight;ZM=clamp(Math.min(W,H)/760,1,2);VW=W/ZM;VH=H/ZM;
  cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
  cv.style.width=W+'px';cv.style.height=H+'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);
  vig=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.38,W/2,H/2,Math.hypot(W,H)*0.62);
  vig.addColorStop(0,'rgba(8,10,16,0)');vig.addColorStop(1,'rgba(8,10,16,.7)');
}
const pat=(()=>{
  const c=document.createElement('canvas');c.width=c.height=96;
  const x=c.getContext('2d');
  if(!x)return null;
  x.fillStyle='rgba(120,135,175,.07)';x.fillRect(0,0,96,1);x.fillRect(0,0,1,96);
  x.fillStyle='rgba(140,155,200,.26)';x.fillRect(0,0,3,3);
  return ctx.createPattern(c,'repeat');
})();
function rgba(hex,a){
  if(!hex||hex[0]!=='#')return hex||'rgba(255,255,255,'+a+')';
  const n=parseInt(hex.slice(1,7),16);
  return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')';
}
function poly(x,y,r,n,rot){
  ctx.beginPath();
  for(let i=0;i<n;i++){const a=rot+i*TAU/n;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py)}
  ctx.closePath();
}

