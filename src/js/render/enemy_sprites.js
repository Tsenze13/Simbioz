const ENS=(function(){
const TAU=Math.PI*2,OUT='rgba(8,8,14,.92)';
let S=1,LOD=false,K='#888';
const TC={};
function tint(col,a){
  const key=col+a;if(TC[key])return TC[key];
  const n=parseInt(col.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255;
  const m=a>=0?255:0,k=Math.abs(a);
  const f=v=>Math.round(v+(m-v)*k);
  return TC[key]='rgb('+f(r)+','+f(g)+','+f(b)+')';
}
function E(c,x,y,rx,ry,f,st,lw,rot){c.beginPath();c.ellipse(x,y,Math.max(.001,rx),Math.max(.001,ry),rot||0,0,TAU);if(f){c.fillStyle=f;c.fill()}if(st!==0){c.strokeStyle=st||OUT;c.lineWidth=(lw||1.3)/S;c.stroke()}}
function P(c,pts,f,st,lw){c.beginPath();for(let i=0;i<pts.length;i++){if(i)c.lineTo(pts[i][0],pts[i][1]);else c.moveTo(pts[i][0],pts[i][1])}c.closePath();if(f){c.fillStyle=f;c.fill()}if(st!==0){c.strokeStyle=st||OUT;c.lineWidth=(lw||1.3)/S;c.lineJoin='round';c.stroke()}}
function RG(c,x,y,r,st){const g=c.createRadialGradient(x,y,0,x,y,Math.max(.001,r));for(const [o,k] of st)g.addColorStop(o,k);return g}
function LGr(c,x1,y1,x2,y2,st){const g=c.createLinearGradient(x1,y1,x2,y2);for(const [o,k] of st)g.addColorStop(o,k);return g}
function shadeF(c,x,y,r,col){return LOD?col:RG(c,x-r*.3,y-r*.35,r*1.5,[[0,tint(col,.4)],[.55,col],[1,tint(col,-.45)]])}
function B(c,x,y,rx,ry,col,rot,lw){E(c,x,y,rx,ry,shadeF(c,x,y,Math.max(rx,ry),col),OUT,lw,rot)}
function glow(c,x,y,r,col,a){if(LOD)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=a;c.fillStyle=RG(c,x,y,r,[[0,col],[1,'rgba(0,0,0,0)']]);c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore()}
function L(c,x1,y1,x2,y2,col,w,cap){c.strokeStyle=col;c.lineWidth=w;c.lineCap=cap||'round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.lineCap='butt'}
function limb(c,x0,y0,x1,y1,w,col){L(c,x0,y0,x1,y1,OUT,w+1.5/S);L(c,x0,y0,x1,y1,col,w)}
function eyes(c,x,g,s,col,pup){
  for(const k of[-1,1]){E(c,x,k*g,s,s*1.15,col||'#fff1a8',OUT,.8);E(c,x+s*.3,k*g,s*.5,s*.6,pup||'#15121a',0)}
}
function eyeG(c,x,g,s,col){for(const k of[-1,1]){E(c,x,k*g,s,s*.8,col,0);glow(c,x,k*g,s*3,col,.6)}}
function legs(c,t,n,len,w,col,x0,span,sp){
  for(let i=0;i<n;i++)for(const s of[-1,1]){
    const f=n===1?0:i/(n-1)-.5,ph=Math.sin(t*sp+i*1.9+(s>0?0:Math.PI))*.35;
    const bx=x0+f*span,a=s*(1.05+ph);
    limb(c,bx,s*.35,bx+Math.cos(a)*len*.55+f*.1,s*(.35+Math.abs(Math.sin(a))*len),w,col);
  }
}
function feet(c,t,sp,x,gap,r,col){for(const s of[-1,1]){const st=Math.sin(t*sp+(s>0?0:Math.PI))*.28;E(c,x+st,s*gap,r,r*.7,col)}}
function spikes(c,n,r0,r1,col,rot,w){for(let i=0;i<n;i++){const a=rot+i*TAU/n;P(c,[[Math.cos(a-w)*r0,Math.sin(a-w)*r0],[Math.cos(a)*r1,Math.sin(a)*r1],[Math.cos(a+w)*r0,Math.sin(a+w)*r0]],col,OUT,1)}}
function bolt(c,x0,y0,x1,y1,seed,col,w){
  c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(x0,y0);
  for(let i=1;i<5;i++){const k=i/5,o=Math.sin(seed*13+i*7.1)*.22;c.lineTo(x0+(x1-x0)*k-(y1-y0)*o,y0+(y1-y0)*k+(x1-x0)*o)}
  c.lineTo(x1,y1);c.stroke();c.lineCap='butt';
}
function tailW(c,t,n,len,w,col,x0,y0,amp,sp){
  c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x0,y0);
  for(let i=1;i<=n;i++){const k=i/n;c.lineTo(x0-k*len,y0+Math.sin(t*sp-k*4)*amp*k)}
  c.stroke();c.lineCap='butt';
}

const D={};
/* ---------- обычные ---------- */
D.wisp=(c,o)=>{const t=o.t;
  for(let i=0;i<3;i++){c.globalAlpha=.55;tailW(c,t+i,7,1.7+i*.2,.34-i*.05,tint(K,.2),-.5,(i-1)*.36,.5,6);c.globalAlpha=1}
  glow(c,0,0,1.9,K,.4);B(c,0,0,1,1,K);E(c,.1,0,.55,.55,'rgba(255,255,255,.22)',0);eyes(c,.5,.34,.24,'#fff',K);};
D.swift=(c,o)=>{const t=o.t,fl=Math.sin(t*28)*.12;
  for(let i=0;i<3;i++){c.globalAlpha=.3-i*.08;L(c,-.8-i*.4,(i-1)*.4,-1.6-i*.5,(i-1)*.4,'#fff',.14);c.globalAlpha=1}
  for(const s of[-1,1])P(c,[[.1,s*.2],[-.7,s*(1.0+fl)],[-.9,s*.5],[-.2,s*.15]],tint(K,-.1),OUT,1);
  P(c,[[1.5,0],[.2,-.55],[-.7,-.3],[-.7,.3],[.2,.55]],shadeF(c,0,0,1,K),OUT,1.3);
  eyes(c,.6,.2,.17,'#ffd0d0','#600');};
D.archer=(c,o)=>{const t=o.t;
  feet(c,t,9,-.1,.55,.28,'#4a3a22');
  E(c,-.5,0,.28,.5,'#5a3a1a',OUT,1);for(let i=-1;i<=1;i++)L(c,-.62,i*.2,-.9,i*.2,'#d9d0b0',.1);
  B(c,0,0,.88,.95,tint(K,-.25));
  limb(c,.1,-.6,.95,-.35,.26,tint(K,-.1));limb(c,.1,.6,.55,.35,.26,tint(K,-.1));
  const pull=.15+.2*Math.sin(t*2.5)**2;
  c.strokeStyle='#7a4a1a';c.lineWidth=.14;c.lineCap='round';c.beginPath();c.arc(.7,0,.95,-1.15,1.15);c.stroke();c.lineCap='butt';
  c.strokeStyle='rgba(240,240,220,.8)';c.lineWidth=.04;c.beginPath();c.moveTo(.7+Math.cos(-1.15)*.95,Math.sin(-1.15)*.95);c.lineTo(.55-pull,0);c.lineTo(.7+Math.cos(1.15)*.95,Math.sin(1.15)*.95);c.stroke();
  L(c,.55-pull,0,1.6,0,'#d9d0b0',.07);P(c,[[1.6,0],[1.45,-.07],[1.45,.07]],'#ddd',0);
  E(c,.15,0,.62,.62,tint(K,.12),OUT,1);E(c,.34,0,.3,.34,'#16110c',0);eyeG(c,.42,.12,.07,'#ffe27a');};
D.brute=(c,o)=>{const t=o.t,s=Math.sin(t*4);
  feet(c,t,4,-.15,.5,.34,'#262a50');
  B(c,0,0,.95,.9,K);
  for(const k of[-1,1]){B(c,.05,k*.95,.5,.42,tint(K,.1));limb(c,.1,k*.95,.9+s*k*.2,k*.8,.34,tint(K,-.1));B(c,.95+s*k*.2,k*.8,.34,.34,tint(K,.2))}
  P(c,[[-.5,-.6],[.5,-.7],[.6,.7],[-.5,.6]],tint(K,-.2),OUT,1);for(const x of[-.2,.1,.35])L(c,x,-.6,x,.6,'rgba(0,0,0,.35)',.06);
  B(c,.6,0,.38,.4,tint(K,.25));L(c,.78,-.22,.78,.22,'#0b0b10',.12);E(c,.78,0,.04,.05,'#ff9a5a',0);};
D.bomber=(c,o)=>{const t=o.t,fz=o.st==='fuse';
  feet(c,t,fz?20:8,.1,.55,.26,'#6a3a1a');
  B(c,0,0,1,1,fz&&Math.floor(t*14)%2?'#ff5a3a':K);
  for(const a of[-.7,0,.7]){c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=.1;c.beginPath();c.arc(0,0,.78,a-.12,a+.12);c.stroke()}
  L(c,-.1,-.9,.0,-1.3,'#caa86a',.14);const fk=.7+.3*Math.sin(t*22);glow(c,.0,-1.35,.6,'#ffd36b',fk);E(c,.0,-1.35,.13,.13,'#fff3b0',0);
  eyes(c,.5,.3,.22,'#fff6d0','#a02');L(c,.35,-.52,.7,-.38,'#2a1008',.1);L(c,.35,.52,.7,.38,'#2a1008',.1);};
D.mage=(c,o)=>{const t=o.t;
  tailW(c,t,6,1.3,.9,tint(K,-.3),-.2,0,.4,4);
  B(c,0,0,.95,.9,tint(K,-.15));
  P(c,[[.1,-.55],[1.0,0],[.1,.55]],tint(K,.1),OUT,1);
  limb(c,.1,-.6,1.05,-.55,.24,tint(K,-.3));limb(c,.1,.6,.95,.55,.24,tint(K,-.3));
  const og=1+.12*Math.sin(t*5);glow(c,1.15,.55,1.0*og,K,.55);B(c,1.15,.55,.26,.26,tint(K,.5));
  c.strokeStyle=tint(K,.4);c.lineWidth=.06;c.beginPath();c.ellipse(1.15,.55,.5,.2,t*2,0,TAU);c.stroke();
  E(c,.1,0,.62,.62,tint(K,-.1),OUT,1);E(c,.3,0,.36,.4,'#0a0d18',0);eyeG(c,.38,.13,.07,'#9fe0ff');};
D.shield=(c,o)=>{const t=o.t;
  feet(c,t,5,-.1,.45,.3,'#4a5266');
  B(c,0,0,.78,.82,tint(K,-.2));
  limb(c,.1,-.5,.9,-.7,.26,tint(K,-.1));
  B(c,0,0,.5,.5,tint(K,.1));E(c,.1,0,.34,.2,'#12151f',0);L(c,.25,0,.52,0,'#ff6a6a',.06);
  P(c,[[-.2,0],[-.7,-.15],[-.7,.15]],'#a83030',OUT,.8);
  c.strokeStyle=OUT;c.lineWidth=.62+1.5/S;c.beginPath();c.arc(.15,0,1.18,-.95,.95);c.stroke();
  const g=LGr(c,0,-1,1.4,1,[[0,'#f4f8ff'],[.5,'#9aa7c0'],[1,'#566078']]);c.strokeStyle=g;c.lineWidth=.62;c.beginPath();c.arc(.15,0,1.18,-.95,.95);c.stroke();
  c.fillStyle='#e8eef8';for(let i=-2;i<=2;i++){const a=i*.32;c.beginPath();c.arc(.15+Math.cos(a)*1.18,Math.sin(a)*1.18,.07,0,TAU);c.fill()}};
D.charger=(c,o)=>{const t=o.t,w=o.st==='wind',sh=w?Math.sin(t*60)*.05:0;
  legs(c,t,3,.85,.2,tint(K,-.3),0,1.0,w?0:14);
  B(c,-.1+sh,0,1.15,.82,K);
  for(const s of[-1,1]){P(c,[[.7,s*.35],[1.1,s*.75],[1.55,s*.55],[1.2,s*.3]],'#efe4cf',OUT,1);}
  B(c,.75+sh,0,.55,.52,tint(K,.1));
  for(const s of[-1,1])E(c,.2,s*.6,.2,.12,tint(K,-.2),0);
  eyeG(c,1.0,.25,w?.12:.08,w?'#ff2a2a':'#ffd36b');
  c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=.08;c.beginPath();c.moveTo(-.6,0);c.lineTo(.4,0);c.stroke();};
D.splitter=(c,o)=>{const t=o.t,w=1+.08*Math.sin(t*7),h=1-.08*Math.sin(t*7);
  c.beginPath();for(let i=0;i<=24;i++){const a=i/24*TAU,r=1+.09*Math.sin(a*3+t*4)+.05*Math.sin(a*5-t*3);const x=Math.cos(a)*r*w,y=Math.sin(a)*r*h;if(i)c.lineTo(x,y);else c.moveTo(x,y)}c.closePath();
  c.fillStyle=LOD?K:RG(c,-.3,-.35,1.6,[[0,tint(K,.5)],[.6,K],[1,tint(K,-.4)]]);c.fill();c.strokeStyle=OUT;c.lineWidth=1.3/S;c.stroke();
  E(c,-.05,0,.38,.34,'rgba(30,90,40,.5)',0);E(c,.35,-.1,.12,.12,'rgba(255,255,255,.4)',0);L(c,-.15,-.3,.05,.3,'rgba(20,60,30,.5)',.05);
  eyes(c,.55,.3,.2,'#fffbe0','#143');};
D.slimelet=(c,o)=>{D.splitter(c,o)};
D.specter=(c,o)=>{const t=o.t;
  c.globalAlpha=.8;
  tailW(c,t,8,2.2,1.1,tint(K,-.1),-.2,0,.6,5);tailW(c,t+1,8,2.0,.7,tint(K,.2),-.3,0,.8,5);
  glow(c,0,0,2,K,.35);
  B(c,0,0,1,.95,K);
  for(const s of[-1,1]){const a=Math.sin(t*3+s)*.15;limb(c,.2,s*.8,1.0,s*(.7+a),.2,tint(K,.2))}
  E(c,.45,0,.42,.5,'rgba(10,20,40,.7)',0);eyeG(c,.55,.2,.1,'#e8ffff');c.globalAlpha=1;};
D.healer=(c,o)=>{const t=o.t;
  glow(c,0,0,1.8,'#69e08f',.3+.1*Math.sin(t*3));
  B(c,0,0,.9,.9,tint(K,-.2));
  E(c,0,0,1.15,1.15,0,'rgba(120,255,170,.5)',1);
  limb(c,.1,-.6,.9,-.35,.24,tint(K,-.1));limb(c,.1,.6,.9,.35,.24,tint(K,-.1));
  E(c,.95,0,.2,.2,'#caffd9',0);glow(c,.95,0,.6,'#69e08f',.6);
  P(c,[[.1,-.15],[.3,-.15],[.3,-.45],[.5,-.45],[.5,-.15],[.7,-.15],[.7,.15],[.5,.15],[.5,.45],[.3,.45],[.3,.15],[.1,.15]].map(p=>[p[0]-.25,p[1]]),'#eaffef',OUT,.7);
  E(c,.55,0,.4,.42,tint(K,.1),OUT,1);eyes(c,.62,.15,.1,'#fff','#165');};
D.summoner=(c,o)=>{const t=o.t;
  E(c,0,0,1.5,1.5,0,'rgba(178,102,255,.35)',1);
  c.save();c.rotate(t*.8);for(let i=0;i<6;i++){const a=i*TAU/6;L(c,Math.cos(a)*1.28,Math.sin(a)*1.28,Math.cos(a)*1.5,Math.sin(a)*1.5,'rgba(210,160,255,.7)',.08)}c.restore();
  B(c,0,0,1,1,tint(K,-.25));
  limb(c,.1,-.7,.95,-.7+Math.sin(t*3)*.15,.26,tint(K,-.1));limb(c,.1,.7,.95,.7-Math.sin(t*3)*.15,.26,tint(K,-.1));
  for(let i=0;i<3;i++){const a=t*2+i*TAU/3,x=Math.cos(a)*1.4,y=Math.sin(a)*1.4;glow(c,x,y,.55,K,.6);E(c,x,y,.15,.15,tint(K,.6),0)}
  E(c,.1,0,.6,.6,tint(K,.05),OUT,1);E(c,.3,0,.34,.38,'#0e0818',0);eyeG(c,.38,.12,.07,'#e0b0ff');};
D.ember=(c,o)=>{const t=o.t;
  B(c,0,0,1,1,'#3a2420');
  c.strokeStyle='#ff8a2b';c.lineWidth=.1;c.lineCap='round';
  for(let i=0;i<4;i++){const a=i*1.57+.4;c.beginPath();c.moveTo(Math.cos(a)*.2,Math.sin(a)*.2);c.lineTo(Math.cos(a+.3)*.55,Math.sin(a+.3)*.55);c.lineTo(Math.cos(a)*.9,Math.sin(a)*.9);c.stroke()}
  c.lineCap='butt';glow(c,0,0,1.4,'#ff6a2b',.35+.1*Math.sin(t*8));
  c.save();c.globalCompositeOperation='lighter';
  for(let i=0;i<5;i++){const a=Math.PI+(i-2)*.6,h=.5+.35*Math.sin(t*9+i*2);P(c,[[Math.cos(a-.25)*.8,Math.sin(a-.25)*.8],[Math.cos(a)*(1+h),Math.sin(a)*(1+h)],[Math.cos(a+.25)*.8,Math.sin(a+.25)*.8]],'rgba(255,170,60,.8)',0)}
  c.restore();eyeG(c,.5,.28,.14,'#ffd36b');};
D.sporer=(c,o)=>{const t=o.t;
  feet(c,t,6,0,.5,.28,'#6a7a3a');
  B(c,0,0,.8,.8,'#c9b88a');
  B(c,0,0,1.15,1.1,tint(K,-.1));
  for(const [x,y,r] of [[-.4,-.4,.2],[.3,-.5,.15],[-.1,.35,.22],[.55,.3,.14],[-.6,.2,.12]])E(c,x,y,r,r,'#e8f5b8',OUT,.7);
  for(let i=0;i<3;i++){const k=(o.t*.6+i*.33)%1;c.globalAlpha=.7*(1-k);E(c,.8+k*.8,(i-1)*.5*k,.1,.1,'#d2f09a',0);c.globalAlpha=1}
  eyes(c,.8,.28,.14,'#fff6c0','#341');};
D.thornback=(c,o)=>{const t=o.t;
  legs(c,t,3,.8,.22,'#2f4d22',-.1,1,6);
  for(let i=0;i<14;i++){const a=i*TAU/14+Math.sin(t*2+i)*.04;P(c,[[Math.cos(a-.2)*.8,Math.sin(a-.2)*.8],[Math.cos(a)*1.5,Math.sin(a)*1.5],[Math.cos(a+.2)*.8,Math.sin(a+.2)*.8]],'#b8c890',OUT,1)}
  B(c,-.1,0,1.1,.95,K);
  for(const [x,y,r] of [[-.5,-.3,.2],[0,.35,.22],[-.2,0,.16],[.2,-.4,.14]])E(c,x,y,r,r*.8,tint(K,-.25),0);
  B(c,.85,0,.45,.4,tint(K,.1));for(const s of[-1,1])P(c,[[1.1,s*.2],[1.35,s*.4],[1.15,s*.12]],'#efe6cf',OUT,.7);
  eyeG(c,1.0,.18,.07,'#ffd36b');};
D.frostling=(c,o)=>{const t=o.t,fl=Math.sin(t*3)*.08;
  glow(c,0,0,1.9,'#9fe0ff',.4);
  for(const s of[-1,1])P(c,[[.1,s*.3],[-.4,s*(1.1+fl)],[.35,s*.75]],tint(K,.1),OUT,1);
  P(c,[[1.5,0],[.3,-.65],[-.9,0],[.3,.65]],LOD?K:LGr(c,-1,-.6,1.5,.6,[[0,tint(K,-.3)],[.5,K],[1,'#ffffff']]),OUT,1.3);
  L(c,-.6,0,1.2,0,'rgba(255,255,255,.55)',.06);L(c,.1,-.4,.7,0,'rgba(255,255,255,.4)',.05);
  eyeG(c,.55,.2,.09,'#1a5a8a');};
D.glacier=(c,o)=>{const t=o.t;
  glow(c,0,0,2,'#9fe0ff',.25);
  for(const s of[-1,1]){const sw=Math.sin(t*2+s)*.1;P(c,[[.2,s*.8],[1.2,s*(.7+sw)],[1.35,s*(1.0+sw)],[.5,s*1.3]],tint(K,.15),OUT,1.2)}
  P(c,[[1,0],[.5,-.95],[-.5,-.95],[-1,0],[-.5,.95],[.5,.95]],LOD?K:LGr(c,-1,-1,1,1,[[0,tint(K,.5)],[.5,K],[1,tint(K,-.4)]]),OUT,1.5);
  P(c,[[.5,0],[.2,-.5],[-.3,-.5],[-.55,0],[-.3,.5],[.2,.5]],'rgba(255,255,255,.2)',0);
  L(c,-.5,-.6,.1,.2,'rgba(255,255,255,.55)',.06);L(c,.4,-.5,.1,.3,'rgba(255,255,255,.4)',.05);
  P(c,[[.9,-.2],[.6,-.3],[.6,.3],[.9,.2]],'#0e2a3a',0);eyeG(c,.78,.13,.06,'#bdf5ff');};
D.magmaling=(c,o)=>{const t=o.t,pu=.8+.2*Math.sin(t*5);
  feet(c,t,5,0,.55,.3,'#3a1a10');
  B(c,0,0,1,.95,'#4a2218');
  c.strokeStyle='#ff8a2b';c.lineWidth=.12;c.lineCap='round';
  for(let i=0;i<6;i++){const a=i*1.05+.2;c.beginPath();c.moveTo(Math.cos(a)*.15,Math.sin(a)*.15);c.lineTo(Math.cos(a+.25)*.5,Math.sin(a+.25)*.5);c.lineTo(Math.cos(a-.1)*.92,Math.sin(a-.1)*.92);c.stroke()}
  c.lineCap='butt';glow(c,0,0,1.5,'#ff6a2b',.5*pu);E(c,.05,0,.3,.3,'#ffd36b',0);
  for(const [x,y] of[[-.6,.5],[.1,-.8]]){glow(c,x,y,.35,'#ff9a3c',.6)}
  eyeG(c,.6,.3,.12,'#ffe29a');};
D.imp=(c,o)=>{const t=o.t,f=Math.sin(t*16)*.25;
  for(const s of[-1,1])P(c,[[0,s*.3],[-.5,s*(1.6+f)],[-.9,s*(1.0+f)],[-.75,s*.6],[-.3,s*.3]],'#a52a2a',OUT,1);
  tailW(c,t,6,1.5,.12,'#222',-.4,0,.5,7);P(c,[[-1.9,.0],[-1.6,-.15],[-1.6,.15]],'#222',0);
  B(c,0,0,.8,.85,K);
  for(const s of[-1,1])P(c,[[.5,s*.5],[.9,s*.75],[.7,s*.3]],'#e8e0c0',OUT,.8);
  glow(c,1.0,0,.55,'#ff9a3c',.6);E(c,1.0,0,.17,.17,'#ffd36b',0);
  eyes(c,.45,.28,.17,'#ffe0a0','#a00');};
D.scarab=(c,o)=>{const t=o.t;
  legs(c,t,3,.95,.13,'#4a3a14',0,1,22);
  B(c,-.1,0,1.25,.9,K);L(c,-1.2,0,.8,0,'rgba(0,0,0,.5)',.07);
  for(const s of[-1,1])E(c,-.3,s*.42,.8,.35,'rgba(255,255,255,.14)',0);
  B(c,1.0,0,.4,.42,tint(K,-.3));for(const s of[-1,1])P(c,[[1.25,s*.2],[1.55,s*.3],[1.35,s*.05]],'#2a2010',0);
  eyeG(c,1.1,.2,.06,'#fff');};
D.scorpion=(c,o)=>{const t=o.t,w=o.st==='wind';
  legs(c,t,4,.9,.14,'#6a2a14',-.1,1.1,12);
  B(c,0,0,1,.75,K);B(c,-.9,0,.62,.52,tint(K,-.1));B(c,-1.45,0,.42,.38,tint(K,-.2));
  c.strokeStyle=OUT;c.lineWidth=.3+1.3/S;c.lineCap='round';c.beginPath();c.moveTo(-1.6,0);c.quadraticCurveTo(-2.1,0,-1.7,-.1);c.stroke();
  const ty=w?.3:0;
  limb(c,-1.4,0,-.6,-.2+ty,.22,K);limb(c,-.6,-.2+ty,.5,0,.2,K);P(c,[[.5,0],[.15,-.2],[.15,.2]],'#222',OUT,.6);
  c.lineCap='butt';
  for(const s of[-1,1]){limb(c,.6,s*.4,1.4,s*.8,.24,tint(K,-.1));B(c,1.55,s*.78,.38,.28,tint(K,.1),s*.6);L(c,1.7,s*.78,1.9,s*.55,'#222',.1)}
  B(c,.8,0,.4,.4,tint(K,-.1));eyeG(c,.95,.15,.06,'#ffd36b');};
D.djinn=(c,o)=>{const t=o.t;
  c.globalAlpha=.9;tailW(c,t,9,2.4,1.4,tint(K,-.25),-.1,0,.8,4);tailW(c,t+2,9,2.0,.8,tint(K,.1),-.2,0,-1,4);c.globalAlpha=1;
  glow(c,0,0,1.8,K,.3);B(c,0,0,.95,.95,K);
  limb(c,.1,-.6,.85,.1,.28,tint(K,-.1));limb(c,.1,.6,.85,-.1,.28,tint(K,-.1));
  E(c,.1,0,.88,.88,0,'rgba(255,230,140,.7)',1);
  for(const s of[-1,1]){const a=t*2+s*2,x=.6+Math.cos(a)*.18,y=s*1.2+Math.sin(a)*.18;glow(c,x,y,.5,'#7fe0d0',.7);E(c,x,y,.15,.15,'#e8fffa',0)}
  B(c,.25,0,.6,.62,'#e8c050');E(c,.25,0,.38,.4,tint('#e8c050',.4),0);E(c,.55,0,.3,.34,SKn,OUT,.9);eyes(c,.7,.13,.07,'#fff','#122');};
const SKn='#c98a62';
D.stormcaller=(c,o)=>{const t=o.t;
  tailW(c,t,6,1.2,.9,tint(K,-.45),-.2,0,.4,4);
  B(c,0,0,.95,.92,tint(K,-.35));
  for(let i=0;i<3;i++){const a=t*7+i*2.1;bolt(c,Math.cos(a)*.5,Math.sin(a)*.5,Math.cos(a+.4)*1.5,Math.sin(a+.4)*1.5,Math.floor(t*10)+i,'rgba(255,250,170,.85)',.08)}
  limb(c,.1,-.6,1.0,-.5,.24,tint(K,-.4));limb(c,.1,.6,.9,.45,.24,tint(K,-.4));
  L(c,.9,.7,1.5,.45,'#6a4a2a',.1);glow(c,1.55,.45,.6,'#f4f08a',.7+.2*Math.sin(t*20));E(c,1.55,.45,.14,.14,'#fff',0);
  E(c,.1,0,.62,.62,tint(K,-.3),OUT,1);E(c,.3,0,.36,.4,'#0c0c14',0);eyeG(c,.38,.12,.07,'#fff6a0');
  P(c,[[.0,-.55],[.35,-.3],[.2,-.2],[.5,.05],[.1,-.1],[.25,-.28]].map(p=>[p[0]-.1,p[1]]),'#fff06a',OUT,.5);};
D.ironwraith=(c,o)=>{const t=o.t;
  c.globalAlpha=.9;tailW(c,t,8,2,1,'rgba(120,140,190,.75)',-.3,0,.6,5);c.globalAlpha=1;
  glow(c,0,0,1.7,'#7fb0ff',.3);
  for(const s of[-1,1]){const sw=Math.sin(t*3+s)*.1;B(c,.1,s*1.0,.55,.42,'#8a9cc4',0);limb(c,.2,s*1.0,1.0,s*(.8+sw),.3,'#7a8cb4');B(c,1.1,s*(.8+sw),.3,.3,'#a8b8dc')}
  B(c,0,0,.85,.8,'#9aa8cc');L(c,-.6,0,.6,0,'rgba(0,0,0,.35)',.07);
  B(c,.45,0,.55,.52,'#b8c4e0');L(c,.5,-.3,.5,.3,'#0a0e1c',.16);eyeG(c,.74,.13,.06,'#7fd0ff');
  P(c,[[.3,-.5],[-.1,0],[.3,.5]],'#4a5a88',0,0);};
/* ---------- новые ---------- */
D.lancer=(c,o)=>{const t=o.t,th=o.st==='thrust'?1:0,ex=th?.6+.5*Math.min(1,Math.abs(Math.sin(t*14))):0;
  feet(c,t,7,-.1,.5,.3,'#3a2a14');
  B(c,0,0,.9,.95,tint(K,-.15));
  B(c,-.05,0,.55,.6,tint(K,.15));
  limb(c,.1,.6,1.0+ex,.1,.22,tint(K,-.1));limb(c,.1,-.6,.6,-.1,.22,tint(K,-.1));
  L(c,-.5+ex,.1,2.4+ex,.1,'#7a5a2a',.12);P(c,[[2.4+ex,.1],[2.15+ex,-.14],[2.15+ex,.34]],'#e8eef6',OUT,.8);
  B(c,.3,0,.5,.5,'#aeb4c4');L(c,.55,-.2,.55,.2,'#0a0a10',.1);P(c,[[-.3,0],[-.75,-.25],[-.75,.25]],'#b83030',OUT,.7);};
D.sniper=(c,o)=>{const t=o.t;
  tailW(c,t,5,1.1,.8,tint(K,-.5),-.2,0,.3,3);
  B(c,0,0,.9,.85,tint(K,-.45));
  limb(c,.1,.5,1.0,.15,.22,tint(K,-.3));limb(c,.1,-.5,.7,-.1,.2,tint(K,-.3));
  L(c,-.2,.1,2.2,.1,'#2a2a34',.16);L(c,.6,.1,.6,-.3,'#1a1a22',.12);E(c,1.0,.1,.1,.1,'#7fd0ff',0);glow(c,1.0,.1,.4,'#7fd0ff',.4);
  E(c,.15,0,.62,.62,tint(K,-.3),OUT,1);E(c,.35,0,.34,.36,'#0a0a10',0);eyeG(c,.42,.12,.06,'#ff5a5a');
  const bl=(Math.sin(t*6)>.9)?1:0;if(bl)glow(c,2.2,.1,.5,'#ff5a5a',.8);};
D.miner=(c,o)=>{const t=o.t;
  feet(c,t,9,-.1,.5,.28,'#4a3a22');
  E(c,-.55,0,.5,.7,'#5a4a2a',OUT,1);for(const [x,y] of[[-.6,-.3],[-.7,.2],[-.45,.4]]){E(c,x,y,.2,.2,'#2a2a30',OUT,.8);glow(c,x,y,.35,'#ffb347',.4)}
  B(c,0,0,.88,.9,tint(K,-.25));
  limb(c,.1,-.6,.9,-.3,.24,tint(K,-.15));limb(c,.1,.6,.9,.35,.24,tint(K,-.15));
  E(c,1.0,.0,.3,.3,'#3a3a44',OUT,1);E(c,1.0,0,.12,.12,'#ff5a3a',0);glow(c,1.0,0,.5,'#ff5a3a',.4+.3*Math.sin(t*8));
  B(c,.3,0,.55,.55,'#c9a040');glow(c,1.0,.0,1.6,'#ffe9a8',.15);E(c,.7,0,.14,.18,'#fff3c0',0);
  eyes(c,.5,.2,.1,'#fff','#111');};
D.banner=(c,o)=>{const t=o.t,w=Math.sin(t*4);
  E(c,0,0,2.3,2.3,0,'rgba(224,72,92,.18)',1);
  feet(c,t,5,-.1,.5,.3,'#3a2a2a');
  B(c,0,0,.88,.9,tint(K,-.2));
  limb(c,.1,.5,.7,.55,.22,tint(K,-.1));limb(c,.1,-.5,.8,-.35,.22,tint(K,-.1));
  L(c,.1,.55,-.1,2.0,'#8a6a3a',.13);
  P(c,[[-.1,1.9],[-.1+.2*w,1.3],[-1.2+.35*w,1.45],[-1.3+.3*w,2.0]],K,OUT,1);
  E(c,-.7+.2*w,1.7,.2,.2,'#ffd36b',0);
  B(c,.3,0,.55,.55,tint(K,.1));eyes(c,.55,.2,.1,'#fff','#411');
  P(c,[[.0,-.55],[.5,-.5],[.2,-.9]],'#ffd36b',OUT,.6);};
D.binder=(c,o)=>{const t=o.t;
  for(let i=0;i<8;i++){const a=t*1.4+i*TAU/8,x=Math.cos(a)*1.25,y=Math.sin(a)*1.25;E(c,x,y,.14,.09,0,'#9fb0c8',1.2,a+1.57)}
  B(c,0,0,.9,.88,tint(K,-.2));
  limb(c,.1,-.6,.95,-.5,.26,tint(K,-.1));limb(c,.1,.6,.95,.5,.26,tint(K,-.1));
  B(c,1.05,0,.3,.3,'#8a98b0');glow(c,1.2,0,.5,'#9fd0ff',.6);E(c,1.2,0,.12,.12,'#e8f5ff',0);
  B(c,.2,0,.62,.6,tint(K,.1));E(c,.45,0,.28,.3,'#0e1420',0);eyeG(c,.5,.1,.06,'#9fd0ff');};
D.berserker=(c,o)=>{const t=o.t,rg=1-(o.hp===undefined?1:o.hp),s=Math.sin(t*(6+rg*8));
  feet(c,t,6+rg*6,-.1,.5,.32,'#3a1a14');
  B(c,0,0,.98,.95,K);
  for(const k of[-1,1]){B(c,.05,k*.95,.5,.44,tint(K,.1));const sw=s*k*.25;limb(c,.1,k*.95,1.0+sw,k*.75,.3,tint(K,-.1));L(c,1.0+sw,k*.75,1.0+sw+.4,k*.75-k*.9,'#6a4a2a',.1);P(c,[[1.4+sw,k*(.75-.9)],[1.9+sw,k*(.75-.7)],[1.7+sw,k*(.75-.35)]],'#d8dce4',OUT,.8)}
  B(c,.5,0,.4,.4,tint(K,.2));L(c,.7,-.2,.7,.2,'#ffcbcb',.07);
  eyeG(c,.78,.15,.08+.05*rg,'#ff2a2a');
  if(rg>.4)for(let i=0;i<3;i++){const k=(t*1.3+i*.33)%1;c.globalAlpha=.6*(1-k);E(c,-.3+i*.3,-1.1-k*.8,.2+k*.3,.2+k*.3,'rgba(255,200,200,.6)',0);c.globalAlpha=1}};
D.hound=(c,o)=>{const t=o.t,w=o.st==='wind';
  tailW(c,t,5,.9,.2,tint(K,-.3),-.9,0,.5,14);
  legs(c,t,2,.85,.16,tint(K,-.3),0,1.4,w?0:18);
  B(c,-.1,0,1.25,.62,K);
  B(c,.95,0,.5,.42,tint(K,.1));for(const s of[-1,1])P(c,[[.8,s*.3],[.65,s*.7],[.95,s*.4]],tint(K,-.25),OUT,.8);
  B(c,1.35,0,.3,.2,tint(K,-.1));E(c,1.6,0,.08,.08,'#111',0);
  eyeG(c,1.05,.2,.07,w?'#ff2a2a':'#ffd36b');
  for(const x of[.55])L(c,x,-.55,x,.55,'#c9a040',.12);};
D.dryad=(c,o)=>{const t=o.t;
  for(let i=0;i<5;i++){const a=Math.PI+(i-2)*.45;c.globalAlpha=.8;tailW(c,t+i,6,1.3+i%2*.3,.12,'#3a8a3a',-.4,(i-2)*.25,.4,4);c.globalAlpha=1}
  glow(c,0,0,1.8,'#7ad07a',.3);
  B(c,0,0,.85,.88,'#6a4a2a');
  for(const s of[-1,1]){limb(c,.1,s*.55,.95,s*(.8+Math.sin(t*2+s)*.1),.2,'#5a3a1a');for(let i=0;i<3;i++)P(c,[[.9+i*.12,s*(.8+i*.1)],[1.15+i*.12,s*(.7+i*.12)],[1.0+i*.12,s*(.95+i*.1)]],'#5ad05a',OUT,.6)}
  E(c,.1,0,.6,.6,'#c9a070',OUT,1);
  for(let i=0;i<7;i++){const a=i*TAU/7;P(c,[[Math.cos(a-.2)*.5,Math.sin(a-.2)*.5],[Math.cos(a)*.95,Math.sin(a)*.95],[Math.cos(a+.2)*.5,Math.sin(a+.2)*.5]],i%2?'#4ab04a':'#7ae07a',OUT,.7)}
  E(c,.25,0,.36,.4,'#d8b88a',OUT,.8);eyes(c,.35,.14,.08,'#e8ffd8','#164');};
D.frostwitch=(c,o)=>{const t=o.t;
  for(let i=0;i<4;i++){const a=t*1.5+i*TAU/4;E(c,Math.cos(a)*1.4,Math.sin(a)*1.4,.12,.12,0,'#e8f8ff',1.1);L(c,Math.cos(a)*1.4-.12,Math.sin(a)*1.4,Math.cos(a)*1.4+.12,Math.sin(a)*1.4,'#e8f8ff',.04)}
  tailW(c,t,6,1.4,.9,tint(K,-.4),-.2,0,.4,4);
  B(c,0,0,.9,.9,tint(K,-.35));
  limb(c,.1,-.6,1.0,-.55,.22,tint(K,-.3));limb(c,.1,.6,.95,.5,.22,tint(K,-.3));
  glow(c,1.15,.5,.6,'#bdf0ff',.6);P(c,[[1.15,.2],[1.3,.5],[1.15,.8],[1.0,.5]],'#e8faff',OUT,.7);
  P(c,[[-.4,-.3],[.2,0],[-.4,.3]],'#aee8ff',OUT,.5);
  P(c,[[.0,-.7],[1.0,0],[.0,.7]],tint(K,-.5),OUT,1);E(c,.0,0,.75,.75,tint(K,-.6),0);
  E(c,.3,0,.3,.35,'#c98a72',OUT,.8);eyes(c,.4,.12,.06,'#fff','#17a');};
D.ogre=(c,o)=>{const t=o.t,sl=o.st==='slam',up=sl?.5:0,s=Math.sin(t*3);
  feet(c,t,3,-.2,.55,.4,'#3a1a10');
  B(c,0,0,1,.95,K);
  for(const k of[-1,1]){B(c,0,k*1.0,.6,.5,tint(K,.1));const sw=sl?0:s*k*.15;limb(c,.1,k*1.0,1.0+up+sw,k*.7,.45,tint(K,-.1));B(c,1.15+up+sw,k*.7,.45,.45,tint(K,.15))}
  c.strokeStyle='#ffb347';c.lineWidth=.07;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-.6+i*.3,-.5);c.lineTo(-.4+i*.3,.1+(i%2)*.2);c.lineTo(-.7+i*.3,.55);c.stroke()}
  glow(c,0,0,1.5,'#ff6a2b',.25);
  B(c,.55,0,.4,.42,tint(K,.2));for(const s2 of[-1,1])P(c,[[.55,s2*.3],[.8,s2*.7],[.9,s2*.35]],'#efe4cf',OUT,.8);
  eyeG(c,.8,.16,.08,'#ffd36b');};
D.sandworm=(c,o)=>{const t=o.t;
  if(o.sub){c.globalAlpha=.5;for(let i=0;i<5;i++){const a=i*1.3+t*6,r=.5+.2*i%1;E(c,Math.cos(a)*r*1.1,Math.sin(a)*r*.9,.38,.3,'rgba(217,179,106,.7)',0)}
    E(c,0,0,1.1,.85,'rgba(150,110,50,.6)',0);L(c,-.8,0,.8,0,'rgba(80,50,20,.5)',.1);c.globalAlpha=1;return}
  for(let i=5;i>=1;i--){const x=-i*.62,y=Math.sin(t*5-i*.9)*.38*(i/3),r=1-i*.1;B(c,x,y,r*.95,r*.85,i%2?tint(K,-.15):K)}
  B(c,0,0,1,.95,tint(K,.05));
  E(c,.35,0,.62,.6,'#2a0e0a',OUT,1);
  for(let i=0;i<10;i++){const a=i*TAU/10+t*.4;P(c,[[.35+Math.cos(a-.15)*.55,Math.sin(a-.15)*.55],[.35+Math.cos(a)*.3,Math.sin(a)*.3],[.35+Math.cos(a+.15)*.55,Math.sin(a+.15)*.55]],'#f0e8d0',0)}
  E(c,.35,0,.18,.18,'#5a1a10',0);
  for(const s of[-1,1])E(c,-.1,s*.62,.18,.14,'#2a1a10',0);};
D.stormknight=(c,o)=>{const t=o.t;
  P(c,[[-.2,-.75],[-1.5,-.5],[-1.6,0],[-1.5,.5],[-.2,.75]],'#3a4a8a',OUT,1);
  feet(c,t,5,-.1,.55,.32,'#5a6490');
  B(c,0,0,.95,.98,'#aab4dc');
  for(const k of[-1,1]){B(c,.05,k*.95,.5,.42,'#c4ccee');}
  limb(c,.1,-.9,1.0,-.9,.3,'#8a94c0');limb(c,.1,.9,.9,.7,.3,'#8a94c0');
  P(c,[[.9,-.9],[2.2,-.9]],0,0);L(c,.95,-.9,2.4,-.9,'#e8eef6',.14);L(c,.95,-.9,2.4,-.9,'rgba(255,250,150,.7)',.05);
  glow(c,2.3,-.9,.55,'#f4f08a',.6);
  B(c,.85,.72,.3,.4,'#7a8ab8');bolt(c,.7,.5,1.0,.95,3,'#f4f08a',.07);
  B(c,.35,0,.55,.55,'#c4ccee');L(c,.55,-.3,.55,.3,'#0a0e22',.15);eyeG(c,.74,.13,.05,'#f4f08a');
  bolt(c,.1,-.4,-.2,-.1,Math.floor(t*8),'rgba(255,250,150,.9)',.06);
  P(c,[[.2,0],[-.2,-.15],[-.2,.15]],'#f4f08a',0);};

/* ---------- боссы ---------- */
D.boss_guard=(c,o)=>{const t=o.t;
  glow(c,0,0,2.2,K,.35);
  c.save();c.rotate(t*.35);spikes(c,8,.9,1.65,tint(K,-.1),0,.2);c.restore();
  c.save();c.rotate(-t*.5);spikes(c,6,.85,1.35,tint(K,.2),.3,.22);c.restore();
  B(c,0,0,1,1,tint(K,-.3),0,2);
  E(c,0,0,.85,.85,0,tint(K,.5),1.2);
  for(let i=0;i<6;i++){const a=t*1.2+i*TAU/6;glow(c,Math.cos(a)*1.9,Math.sin(a)*1.9,.5,K,.6);E(c,Math.cos(a)*1.9,Math.sin(a)*1.9,.14,.14,tint(K,.7),0)}
  E(c,.15,0,.62,.62,'#08040e',OUT,1.2);glow(c,.2,0,.8,K,.5);
  E(c,.2,0,.32,.2,'#f4e0ff',0,0,0);E(c,.28,0,.14,.14,'#2a0a3a',0);};
D.boss_ent=(c,o)=>{const t=o.t,s=Math.sin(t*1.4);
  for(let i=0;i<9;i++){const a=i*TAU/9+.3,l=1.7+.2*Math.sin(t*2+i);c.strokeStyle='#3a2a14';c.lineWidth=.2;c.lineCap='round';c.beginPath();c.moveTo(Math.cos(a)*.7,Math.sin(a)*.7);c.quadraticCurveTo(Math.cos(a+.3)*1.2,Math.sin(a+.3)*1.2,Math.cos(a)*l,Math.sin(a)*l);c.stroke()}
  c.lineCap='butt';
  for(const k of[-1,1]){limb(c,.2,k*.9,1.1+s*.1*k,k*1.0,.5,'#5a3a1a');limb(c,1.1+s*.1*k,k*1.0,1.8,k*.7+s*k*.15,.34,'#4a2e14');for(let i=0;i<4;i++)L(c,1.8,k*.7+s*k*.15,2.15,k*(.7+(i-1.5)*.3),'#3a2410',.1)}
  B(c,0,0,1.05,1.0,'#5a3a1a');
  for(let i=0;i<14;i++){const a=i*TAU/14+t*.12,r=.55+(i%3)*.12;B(c,Math.cos(a)*r,Math.sin(a)*r,.4,.4,i%2?'#3a8a3a':'#4aa04a',0,.9)}
  for(let i=0;i<6;i++){const a=i*1.1+1,r=.15+(i%2)*.25;B(c,Math.cos(a)*r,Math.sin(a)*r,.3,.3,'#5ac05a',0,.8)}
  E(c,.55,0,.3,.34,'#2a1a0c',OUT,1);eyeG(c,.62,.14,.08,'#ffe27a');
  for(let i=0;i<5;i++){const a=t*1.1+i*1.3;E(c,Math.cos(a)*1.35,Math.sin(a)*1.35,.07,.05,'#c8f080',0,0,a)}};
D.boss_queen=(c,o)=>{const t=o.t;
  glow(c,0,0,2.4,'#bdf0ff',.3);
  c.save();c.rotate(t*.2);for(let i=0;i<12;i++){const a=i*TAU/12;P(c,[[Math.cos(a-.12)*1.2,Math.sin(a-.12)*1.2],[Math.cos(a)*(1.8+.12*Math.sin(t*3+i)),Math.sin(a)*(1.8+.12*Math.sin(t*3+i))],[Math.cos(a+.12)*1.2,Math.sin(a+.12)*1.2]],'rgba(200,240,255,.8)',OUT,.9)}c.restore();
  tailW(c,t,8,2.6,1.6,tint(K,-.1),-.4,0,.8,3);
  P(c,[[.3,-.8],[-1.7,-1.1],[-2.3,0],[-1.7,1.1],[.3,.8]],LOD?K:LGr(c,.3,0,-2.3,0,[[0,K],[1,'#ffffff']]),OUT,1.3);
  B(c,0,0,1,1,tint(K,.05));
  for(const k of[-1,1]){limb(c,.1,k*.85,1.1,k*.6,.32,tint(K,.1))}
  L(c,1.0,.6,2.2,.6,'#e8faff',.13);P(c,[[2.2,.6],[2.45,.6],[2.2,.85],[2.2,.35]].slice(0,4),'#9fe0ff',OUT,.7);glow(c,2.35,.6,.7,'#bdf0ff',.7);
  E(c,.3,0,.62,.62,tint(K,.2),OUT,1);
  for(let i=0;i<5;i++){const a=-1+i*.5;P(c,[[.3+Math.cos(a-.15)*.6,Math.sin(a-.15)*.6],[.3+Math.cos(a)*1.0,Math.sin(a)*1.0],[.3+Math.cos(a+.15)*.6,Math.sin(a+.15)*.6]],'#e8faff',OUT,.8)}
  E(c,.4,0,.36,.4,'#d8b8a0',OUT,.9);eyes(c,.5,.14,.08,'#bdf0ff','#0a3a6a');};
D.boss_golem=(c,o)=>{const t=o.t,s=Math.sin(t*2);
  E(c,0,0,1.6,1.6,0,'rgba(255,211,107,.12)',0);
  feet(c,t,2.5,-.3,.7,.5,'#4a5268');
  for(const k of[-1,1]){B(c,0,k*1.2,.75,.62,'#7a88a8');const sw=s*k*.15;limb(c,.2,k*1.2,1.3+sw,k*.95,.65,'#6a7898');B(c,1.5+sw,k*.95,.62,.58,'#9aa8c8');for(let i=0;i<3;i++)L(c,1.7+sw,k*(.95+(i-1)*.22),2.0+sw,k*(.95+(i-1)*.22),'#2a3040',.08)}
  B(c,0,0,1.15,1.1,K);
  for(const [x,y] of[[-.7,-.7],[-.7,.7],[.7,-.7],[.7,.7]])E(c,x,y,.1,.1,'#d8dce8',0);
  P(c,[[-.8,-.6],[.1,-.7],[.1,.7],[-.8,.6]],tint(K,-.25),OUT,1);
  for(let i=0;i<3;i++)L(c,-.7+i*.25,-.5,-.7+i*.25,.5,'rgba(0,0,0,.35)',.06);
  glow(c,-.3,0,1.0,'#ffd36b',.4+.15*Math.sin(t*4));P(c,[[-.65,-.18],[0,-.18],[0,.18],[-.65,.18]],'#ffd36b',0);
  B(c,.65,0,.5,.5,tint(K,.15));L(c,.85,-.3,.85,.3,'#0a0c14',.14);eyeG(c,.95,.12,.07,'#ffd36b');
  for(let i=0;i<2;i++){const k=(t*.7+i*.5)%1;c.globalAlpha=.4*(1-k);E(c,-.9-k*.4,(i?.4:-.4),.18+k*.3,.18+k*.3,'rgba(220,230,240,.8)',0);c.globalAlpha=1}};
D.boss_sandlord=(c,o)=>{const t=o.t,w=o.st==='wind';
  c.save();c.rotate(t*.4);for(let i=0;i<7;i++){const a=i*TAU/7;c.globalAlpha=.25;E(c,Math.cos(a)*1.9,Math.sin(a)*1.9,.55,.2,'#e8c880',0,0,a+1.6)}c.globalAlpha=1;c.restore();
  legs(c,t,4,1.3,.2,'#7a4a14',-.1,1.8,w?0:9);
  for(let i=1;i<=3;i++){const x=-.7-i*.55,y=Math.sin(t*3-i)*.15;B(c,x,y,.8-i*.1,.7-i*.1,tint(K,-.12*i))}
  c.strokeStyle=OUT;c.lineWidth=.4+1.4/S;c.lineCap='round';c.beginPath();c.moveTo(-2.5,0);c.quadraticCurveTo(-3.3,0,-2.8,-.3);c.stroke();
  limb(c,-2.4,0,-.8,-.4,.3,K);limb(c,-.8,-.4,.7,0,.26,tint(K,.1));P(c,[[.7,0],[.2,-.3],[.2,.3]],'#2a1a08',OUT,.7);
  c.lineCap='butt';
  for(const s of[-1,1]){limb(c,.6,s*.7,1.6,s*1.2,.4,tint(K,-.1));B(c,1.9,s*1.15,.6,.42,tint(K,.1),s*.5);L(c,2.2,s*1.15,2.55,s*.8,'#2a1a08',.16)}
  B(c,0,0,1.15,1.0,K);
  for(let i=0;i<3;i++)L(c,-.6+i*.4,-.7,-.6+i*.4,.7,'rgba(0,0,0,.25)',.06);
  B(c,.85,0,.55,.52,tint(K,.15));P(c,[[.7,-.4],[1.25,0],[.7,.4]],'#ffd36b',OUT,.8);
  E(c,.95,0,.22,.25,'#10080a',0);eyeG(c,1.0,.1,.06,'#ff5a3a');
  P(c,[[.55,-.5],[.8,-.8],[.95,-.5]],'#ffd36b',OUT,.7);P(c,[[.55,.5],[.8,.8],[.95,.5]],'#ffd36b',OUT,.7);};
D.boss_devourer=(c,o)=>{const t=o.t;
  glow(c,0,0,2.6,K,.3);
  const EC=['#ff6a2b','#3aa7ff','#c9974f','#8febd0','#b4c0d4','#62c15a'];
  c.save();c.rotate(t*.3);
  for(let i=0;i<12;i++){const a=i*TAU/12;P(c,[[Math.cos(a-.17)*1.1,Math.sin(a-.17)*1.1],[Math.cos(a)*1.75,Math.sin(a)*1.75],[Math.cos(a+.17)*1.1,Math.sin(a+.17)*1.1]],'#f0e8dc',OUT,1)}
  c.restore();
  B(c,0,0,1.15,1.15,tint(K,-.2),0,2);
  c.save();c.rotate(-t*.5);
  for(let i=0;i<10;i++){const a=i*TAU/10;P(c,[[Math.cos(a-.2)*.95,Math.sin(a-.2)*.95],[Math.cos(a)*.45,Math.sin(a)*.45],[Math.cos(a+.2)*.95,Math.sin(a+.2)*.95]],'#e8dccb',0)}
  c.restore();
  E(c,0,0,.5,.5,'#10040a',OUT,1.2);
  for(let i=0;i<6;i++){const a=t*.9+i*TAU/6,x=Math.cos(a)*2.0,y=Math.sin(a)*2.0;glow(c,x,y,.7,EC[i],.7);E(c,x,y,.2,.2,tint(EC[i],.5),OUT,.8)}
  E(c,.0,0,.28,.2,'#fff0c8',0);E(c,.08,0,.12,.14,'#3a0a1a',0);glow(c,0,0,.9,'#ffe9a8',.4);};

const CACHE={},NF=4,CS=1.6,EXT=2.7;
function frames(type,r0,col){
  const key=type+'|'+col+'|'+r0;let fr=CACHE[key];if(fr)return fr;
  const size=Math.ceil(EXT*2*r0*CS);fr=[];
  for(let i=0;i<NF;i++){
    const cv=document.createElement('canvas');cv.width=cv.height=size;
    const g=cv.getContext('2d');g.translate(size/2,size/2);
    S=r0*CS;LOD=false;K=col;g.scale(r0*CS,r0*CS);
    try{D[type](g,{t:i*0.9+0.3,r:1,col:col,st:'move',hp:1})}catch(e){}
    fr.push(cv);
  }
  fr.size=size;CACHE[key]=fr;return fr;
}
function drawCached(c,type,o){
  const fr=frames(type,o.r0,o.col),cv=fr[Math.floor(o.t*6)%NF],k=o.r/o.r0,w=fr.size/CS*k;
  c.drawImage(cv,-w/2,-w/2,w,w);
}
function draw(c,type,o){
  const f=D[type];if(!f)return false;
  if(o.cache&&o.r0){drawCached(c,type,o);return true}
  const r=o.r||1;
  S=r;LOD=!!o.lod;K=o.col||'#888888';
  c.save();c.scale(r,r);
  try{f(c,o)}catch(e){}
  c.restore();return true;
}
return {draw,has:t=>!!D[t],types:Object.keys(D)};
})();
