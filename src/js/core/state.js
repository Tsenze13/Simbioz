/* =====================================================================
   СОСТОЯНИЕ
   ===================================================================== */
let mode='menu',G=null,anim=0;
let W=innerWidth,H=innerHeight,DPR=1,VX=0,VY=0,ZM=1,VW=innerWidth,VH=innerHeight;
const cam={x:0,y:0};
const mouse={x:0,y:0,on:false,down:false};
const joy={on:false,id:-1,ox:0,oy:0,cx:0,cy:0,dx:0,dy:0};
let uiTouch=false;

const fmt=t=>{t=Math.max(0,Math.floor(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};
const armorRed=a=>clamp(a/(25+Math.abs(a)),-0.5,0.9);
const needFor=l=>{const X=BAL.xp;return Math.floor((X.base+l*X.lin+l*l*X.quad)*(1+Math.max(0,l-X.lateFrom)*X.lateK))};
const vis=(x,y,m)=>x>VX-m&&x<VX+VW+m&&y>VY-m&&y<VY+VH+m;
const dist2=(a,b)=>{const dx=a.x-b.x,dy=a.y-b.y;return dx*dx+dy*dy};
function distSeg(px,py,x1,y1,x2,y2){
  const dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy;
  let t=l2?((px-x1)*dx+(py-y1)*dy)/l2:0;t=clamp(t,0,1);
  const cx=x1+t*dx,cy=y1+t*dy;
  return Math.hypot(px-cx,py-cy);
}


