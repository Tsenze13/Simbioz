/* =====================================================================
   СПРАЙТЫ (реалистичный стиль)
   ===================================================================== */
const SP=(function(){
const TAU=Math.PI*2;
const R=(s)=>{const x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x)};
function rg(c,x,y,r,st){const g=c.createRadialGradient(x,y,0,x,y,r);for(const [o,col] of st)g.addColorStop(o,col);return g}
function lg(c,x1,y1,x2,y2,st){const g=c.createLinearGradient(x1,y1,x2,y2);for(const [o,col] of st)g.addColorStop(o,col);return g}
function glow(c,x,y,r,col,a){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=a;c.fillStyle=rg(c,x,y,r,[[0,col],[1,'rgba(0,0,0,0)']]);c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore()}
function shadow(c,x,y,w,a){c.save();c.globalAlpha=a;c.fillStyle=rg(c,x,y,w,[[0,'rgba(0,0,0,.7)'],[1,'rgba(0,0,0,0)']]);c.translate(x,y);c.scale(1,.28);c.translate(-x,-y);c.beginPath();c.arc(x,y,w,0,TAU);c.fill();c.restore()}

/* ---------- ОГОНЬ ---------- */
function fireS(c,t,s){ // направление вправо
  glow(c,0,0,46*s,'#ff5a1a',.55);
  c.save();c.scale(s,s);
  const layers=[[1,'rgba(150,20,5,.85)','rgba(255,70,20,0)'],[.78,'rgba(255,90,20,.95)','rgba(255,150,40,0)'],[.52,'rgba(255,190,60,.95)','rgba(255,230,120,0)'],[.28,'rgba(255,250,200,.95)','rgba(255,255,255,0)']];
  for(const [k,c1,c2] of layers){
    for(let i=0;i<9;i++){
      const ph=t*9+i*1.9,a=(i/9-.5)*1.5,L=(30+14*R(i))*k*(0.8+.25*Math.sin(ph)),w=11*k*(0.7+.3*R(i+3));
      const tx=-Math.cos(a)*L-6,ty=Math.sin(a)*L+Math.sin(ph*1.3)*5*k;
      const g=lg(c,0,0,tx,ty,[[0,c1],[1,c2]]);
      c.fillStyle=g;c.beginPath();c.moveTo(4,-w);
      c.quadraticCurveTo(-L*.4,-w*1.2+ty*.3,tx,ty);c.quadraticCurveTo(-L*.4,w*1.2+ty*.3,4,w);
      c.arc(4,0,w,Math.PI/2,-Math.PI/2,true);c.fill();
    }
  }
  c.fillStyle=rg(c,2,0,15,[[0,'#fff'],[.35,'#fff2b0'],[.7,'#ffb040'],[1,'rgba(255,120,30,0)']]);c.beginPath();c.arc(2,0,15,0,TAU);c.fill();
  c.restore();
  c.save();c.globalCompositeOperation='lighter';
  for(let i=0;i<7;i++){const a=t*2+i*2.1,d=((t*1.5+R(i))%1);c.fillStyle='rgba(255,'+(160+80*R(i))+',60,'+(1-d)+')';c.beginPath();c.arc(-14*s-d*40*s,Math.sin(a*3)*14*s*(0.5+d),1.6*s*(1-d)+.4,0,TAU);c.fill()}
  c.restore();
}
function fireT(c,x,y,age,k,t){
  if(age>.95)return;
  c.save();
  const sm=age;
  c.globalCompositeOperation='source-over';
  c.fillStyle='rgba(40,34,34,'+(.22*(1-sm))+')';c.beginPath();c.arc(0,-sm*26+Math.sin(k+t*3)*3,8+sm*20,0,TAU);c.fill();
  c.globalCompositeOperation='lighter';
  const col=sm<.3?'255,170,50':sm<.6?'255,90,20':'180,30,10';
  c.fillStyle=rg(c,0,-sm*12,14*(1-sm*.6),[[0,'rgba('+col+','+(.7*(1-sm))+')'],[1,'rgba('+col+',0)']]);c.beginPath();c.arc(0,-sm*12,14,0,TAU);c.fill();
  c.restore();
}
function fireH(c,x,y,p,k){
  const e=1-(1-p)*(1-p);
  glow(c,0,0,90*e+10,'#ff7a28',.9*(1-p));
  c.save();c.globalCompositeOperation='lighter';
  c.fillStyle=rg(c,0,0,60*e+8,[[0,'rgba(255,255,230,'+(1-p)+')'],[.3,'rgba(255,200,80,'+(.9*(1-p))+')'],[.7,'rgba(255,80,20,'+(.6*(1-p))+')'],[1,'rgba(120,20,0,0)']]);c.beginPath();c.arc(0,0,60*e+8,0,TAU);c.fill();
  c.strokeStyle='rgba(255,220,150,'+(1-p)+')';c.lineWidth=4*(1-p)+1;c.beginPath();c.arc(0,0,70*e,0,TAU);c.stroke();
  for(let i=0;i<18;i++){const a=R(i)*TAU,d=(30+70*R(i+5))*e;c.fillStyle='rgba(255,'+(140+90*R(i))+',60,'+(1-p)+')';c.beginPath();c.arc(Math.cos(a)*d,Math.sin(a)*d+p*p*30,2.4*(1-p)+.5,0,TAU);c.fill()}
  c.restore();
  c.fillStyle='rgba(30,26,26,'+(.4*(1-p))+')';for(let i=0;i<5;i++){c.beginPath();c.arc((R(i+9)-.5)*60*e,-p*40-R(i)*20,10+20*p,0,TAU);c.fill()}
}

/* ---------- ВОДА ---------- */
function crest(c,s,t,col1,col2){
  c.save();c.scale(s,s);
  const R1=30;
  c.beginPath();c.arc(-6,0,R1,-1.25,1.25);
  c.bezierCurveTo(R1*.2-6,16,-4,12,-14,0);c.bezierCurveTo(-4,-12,R1*.2-6,-16,Math.cos(-1.25)*R1-6,Math.sin(-1.25)*R1);
  c.closePath();
  c.fillStyle=lg(c,-20,0,26,0,[[0,'rgba(8,60,140,.9)'],[.55,'rgba(40,150,230,.92)'],[1,'rgba(200,240,255,.98)']]);c.fill();
  c.save();c.clip();
  c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1.2;
  for(let i=0;i<5;i++){c.beginPath();for(let x=-20;x<=28;x+=3){const y=(i-2)*8+Math.sin(x*.28+t*7+i*1.4)*3;x===-20?c.moveTo(x,y):c.lineTo(x,y)}c.stroke()}
  c.fillStyle=rg(c,10,-10,18,[[0,'rgba(255,255,255,.55)'],[1,'rgba(255,255,255,0)']]);c.fillRect(-30,-30,70,40);
  c.restore();
  c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=2.4;c.beginPath();c.arc(-6,0,R1-1,-1.2,1.2);c.stroke();
  c.fillStyle='#fff';
  for(let i=0;i<14;i++){const a=-1.2+2.4*(i/13)+Math.sin(t*6+i)*.05,r=R1+2+Math.sin(t*9+i*2)*2;c.globalAlpha=.55+.4*R(i);c.beginPath();c.arc(-6+Math.cos(a)*r,Math.sin(a)*r,1.4+1.6*R(i+4),0,TAU);c.fill()}
  c.globalAlpha=1;c.restore();
}
function waterS(c,t,s){glow(c,0,0,48*s,'#3aa7ff',.35);crest(c,s,t)}
function waterT(c,x,y,age,k,t){
  if(age>.95)return;
  c.save();const a=1-age;
  c.fillStyle='rgba(80,170,240,'+(.28*a)+')';c.beginPath();c.ellipse(0,0,10+age*10,14*(1-age*.5),0,0,TAU);c.fill();
  c.strokeStyle='rgba(220,245,255,'+(.5*a)+')';c.lineWidth=1.4;c.beginPath();c.ellipse(0,0,6+age*22,12+age*8,0,-1.2,1.2);c.stroke();
  if(R(k)>.5){c.fillStyle='rgba(210,240,255,'+(.8*a)+')';c.beginPath();c.arc(-age*8,(R(k+1)-.5)*40*(1+age),2.2*a+.6,0,TAU);c.fill()}
  c.restore();
}
function waterH(c,x,y,p,k){
  const e=1-(1-p)*(1-p),a=1-p;
  c.strokeStyle='rgba(200,235,255,'+a+')';c.lineWidth=3*a+.5;c.beginPath();c.ellipse(0,8,70*e+6,22*e+3,0,0,TAU);c.stroke();
  c.beginPath();c.ellipse(0,8,40*e,12*e,0,0,TAU);c.stroke();
  for(let i=0;i<22;i++){const ang=-Math.PI/2+(R(i)-.5)*2.4,v=70+90*R(i+3),tt=p*1.2;const px=Math.cos(ang)*v*tt,py=Math.sin(ang)*v*tt+260*tt*tt;
    c.fillStyle='rgba('+(150+80*R(i))+',225,255,'+a+')';c.beginPath();c.ellipse(px,py,2.4*(1-p)+.8,3.6*(1-p)+1,Math.atan2(py,px),0,TAU);c.fill();}
  c.fillStyle='rgba(120,200,255,'+(.35*a)+')';c.beginPath();c.arc(0,0,28*e+6,Math.PI,0);c.fill();
  glow(c,0,0,60,'#7fd0ff',.5*a);
}

/* ---------- ЗЕМЛЯ ---------- */
function rockPoly(seed,n,r){const v=[];for(let i=0;i<n;i++){const a=i/n*TAU,rr=r*(.72+.4*R(seed+i));v.push([Math.cos(a)*rr,Math.sin(a)*rr*.92])}return v}
function earthS(c,t,s,seed){
  seed=seed||1;const v=rockPoly(seed,9,20),rot=t*6;
  c.save();c.scale(s,s);c.rotate(rot);
  const L=[Math.cos(-2.3-rot),Math.sin(-2.3-rot)];
  c.lineJoin='round';
  for(let i=0;i<v.length;i++){
    const a=v[i],b=v[(i+1)%v.length];
    const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,len=Math.hypot(mx,my)||1;
    const d=(mx/len)*L[0]+(my/len)*L[1];
    const sh=.35+.55*(d*.5+.5)+.1*R(seed+i*3);
    c.fillStyle='rgb('+Math.round(150*sh)+','+Math.round(118*sh)+','+Math.round(80*sh)+')';
    c.beginPath();c.moveTo(0,0);c.lineTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.closePath();c.fill();
    c.strokeStyle='rgba(30,20,12,.55)';c.lineWidth=1;c.stroke();
    c.fillStyle='rgba(255,235,200,'+(.16*Math.max(0,d))+')';c.beginPath();c.moveTo(a[0]*.9,a[1]*.9);c.lineTo(b[0]*.9,b[1]*.9);c.lineTo(mx*.5,my*.5);c.closePath();c.fill();
  }
  c.strokeStyle='rgba(20,12,8,.7)';c.lineWidth=1.3;c.beginPath();c.moveTo(v[0][0]*.3,v[0][1]*.3);c.lineTo(v[0][0]*.7,v[0][1]*.9);c.moveTo(v[4][0]*.2,v[4][1]*.2);c.lineTo(v[4][0]*.85,v[4][1]*.6);c.stroke();
  c.fillStyle='rgba(90,130,60,.55)';c.beginPath();c.arc(v[2][0]*.6,v[2][1]*.6,3.2,0,TAU);c.arc(v[6][0]*.55,v[6][1]*.5,2.2,0,TAU);c.fill();
  c.strokeStyle='rgba(20,12,8,.9)';c.lineWidth=1.6;c.beginPath();v.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.stroke();
  c.restore();
}
function earthT(c,x,y,age,k,t){
  if(age>.95)return;const a=1-age;
  c.fillStyle='rgba(150,120,80,'+(.3*a)+')';c.beginPath();c.arc(0,age*-6,6+age*18,0,TAU);c.fill();
  if(R(k)>.55){c.fillStyle='rgba(110,86,58,'+a+')';c.beginPath();const p=rockPoly(k,5,3);p.forEach((q,i)=>i?c.lineTo(q[0]-age*14,q[1]+(R(k+2)-.5)*40*age+age*age*24):c.moveTo(q[0]-age*14,q[1]));c.fill()}
}
function earthH(c,x,y,p,k){
  const e=1-(1-p)*(1-p),a=1-p;
  c.fillStyle='rgba(140,112,80,'+(.5*a)+')';for(let i=0;i<7;i++){c.beginPath();c.arc((R(i)-.5)*90*e,-R(i+8)*34*e-6,12+26*e*(.5+R(i+2)),0,TAU);c.fill()}
  for(let i=0;i<12;i++){const ang=-Math.PI/2+(R(i)-.5)*2.6,v=70+120*R(i+7),tt=p*1.1;
    c.save();c.translate(Math.cos(ang)*v*tt,Math.sin(ang)*v*tt+300*tt*tt);c.rotate(p*8*R(i)*3);
    const f=.5+.4*R(i+3);c.fillStyle='rgb('+Math.round(150*f)+','+Math.round(118*f)+','+Math.round(80*f)+')';c.strokeStyle='rgba(20,12,8,'+a+')';c.globalAlpha=a;
    const q=rockPoly(i,5,4+5*R(i+1));c.beginPath();q.forEach((u,j)=>j?c.lineTo(u[0],u[1]):c.moveTo(u[0],u[1]));c.closePath();c.fill();c.stroke();c.restore();}
  c.strokeStyle='rgba(20,12,8,'+(.8*a)+')';c.lineWidth=2;for(let i=0;i<6;i++){const ang=i*1.05+.3;c.beginPath();c.moveTo(0,8);c.lineTo(Math.cos(ang)*50*e,8+Math.sin(ang)*14*e);c.stroke()}
}

/* ---------- ВОЗДУХ ---------- */
function airS(c,t,s){
  glow(c,0,0,44*s,'#8febd0',.3);
  c.save();c.scale(s,s);
  for(let i=0;i<4;i++){c.strokeStyle='rgba(230,255,248,'+(.35-i*.07)+')';c.lineWidth=1.4;c.beginPath();
    for(let x=-8;x>-52;x-=3){const y=(i-1.5)*9+Math.sin(x*.22+t*14+i)*3;x===-8?c.moveTo(x,y):c.lineTo(x,y)}c.stroke()}
  c.beginPath();c.moveTo(24,0);c.bezierCurveTo(10,-22,-12,-30,-24,-26);c.bezierCurveTo(-8,-14,-6,-6,-6,0);c.bezierCurveTo(-6,6,-8,14,-24,26);c.bezierCurveTo(-12,30,10,22,24,0);c.closePath();
  c.fillStyle=lg(c,-24,0,24,0,[[0,'rgba(60,200,170,.15)'],[.5,'rgba(150,245,220,.75)'],[1,'rgba(255,255,255,1)']]);c.fill();
  c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=1.8;c.beginPath();c.moveTo(24,0);c.bezierCurveTo(10,-22,-12,-30,-24,-26);c.moveTo(24,0);c.bezierCurveTo(10,22,-12,30,-24,26);c.stroke();
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(200,255,240,.7)';c.lineWidth=1.2;
  for(let i=0;i<3;i++){c.beginPath();c.ellipse(-6+i*4,0,5+i*4,10+i*6,0,-1.1+t*2,1.1+t*2);c.stroke()}c.restore();
  c.restore();
}
function airT(c,x,y,age,k,t){
  if(age>.95)return;const a=1-age;
  c.strokeStyle='rgba(220,255,245,'+(.5*a)+')';c.lineWidth=1.5;c.beginPath();c.moveTo(0,(R(k)-.5)*40);c.lineTo(-18*(1-age*.3),(R(k)-.5)*40+Math.sin(k)*3);c.stroke();
  if(R(k+2)>.7){c.fillStyle='rgba(255,255,255,'+a+')';c.beginPath();c.arc(-4,(R(k+3)-.5)*44,1.5,0,TAU);c.fill()}
}
function airH(c,x,y,p,k){
  const e=1-(1-p)*(1-p),a=1-p;
  glow(c,0,0,60*e+10,'#bfffe9',.6*a);
  c.strokeStyle='rgba(240,255,250,'+a+')';c.lineWidth=3*a+1;c.beginPath();c.arc(0,0,56*e,0,TAU);c.stroke();
  for(let i=0;i<14;i++){const ang=i/14*TAU+R(i)*.3,r1=14+30*e,r2=r1+18+30*e*R(i+2);c.lineWidth=2*a+.5;c.strokeStyle='rgba(220,255,245,'+a+')';c.beginPath();c.moveTo(Math.cos(ang)*r1,Math.sin(ang)*r1);c.lineTo(Math.cos(ang)*r2,Math.sin(ang)*r2);c.stroke()}
  c.strokeStyle='rgba(180,255,230,'+(.7*a)+')';c.lineWidth=2;c.beginPath();for(let i=0;i<30;i++){const ang=i*.5+p*8,r=4+i*2.2*e;i?c.lineTo(Math.cos(ang)*r,Math.sin(ang)*r):c.moveTo(r,0)}c.stroke();
}

/* ---------- МЕТАЛЛ ---------- */
function metalS(c,t,s){
  c.save();c.scale(s,s);
  c.save();c.globalCompositeOperation='lighter';
  c.fillStyle=lg(c,-60,0,-8,0,[[0,'rgba(255,120,30,0)'],[.7,'rgba(255,170,60,.55)'],[1,'rgba(255,240,180,.95)']]);c.beginPath();c.moveTo(-60,0);c.lineTo(-8,-3.2);c.lineTo(-8,3.2);c.closePath();c.fill();c.restore();
  const body=()=>{c.beginPath();c.moveTo(-14,-5);c.lineTo(2,-5);c.bezierCurveTo(10,-5,16,-2.5,19,0);c.bezierCurveTo(16,2.5,10,5,2,5);c.lineTo(-14,5);c.closePath()};
  body();c.fillStyle=lg(c,0,-5,0,5,[[0,'#f4f8ff'],[.25,'#b8c4d8'],[.6,'#6d7b92'],[1,'#2c3446']]);c.fill();
  c.save();body();c.clip();
  c.fillStyle=lg(c,0,-5,0,5,[[0,'#ffe9a0'],[.3,'#d9a548'],[.7,'#8a5e1c'],[1,'#4a300c']]);c.fillRect(-14,-6,11,12);
  c.fillStyle='rgba(255,255,255,.85)';c.fillRect(-14,-4,34,1.1);
  c.fillStyle='rgba(0,0,0,.5)';c.fillRect(-3.4,-6,.9,12);
  c.restore();
  c.strokeStyle='rgba(15,18,28,.9)';c.lineWidth=.9;body();c.stroke();
  glow(c,19,0,8,'#fff',.55);
  c.restore();
}
function metalT(c,x,y,age,k,t){
  if(age>.95)return;const a=1-age;
  c.fillStyle='rgba(200,200,205,'+(.16*a)+')';c.beginPath();c.arc(0,(R(k)-.5)*5,3+age*12,0,TAU);c.fill();
}
function metalH(c,x,y,p,k){
  const e=1-(1-p)*(1-p),a=1-p;
  glow(c,0,0,36*e+6,'#ffe9a8',.9*a);
  c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
  for(let i=0;i<16;i++){const ang=-Math.PI+(R(i)-.5)*2.4+.0,v=60+160*R(i+4),r1=v*p*.7,r2=r1+10+18*(1-p);
    c.strokeStyle='rgba(255,'+(190+60*R(i))+',90,'+a+')';c.lineWidth=1.8*a+.4;c.beginPath();c.moveTo(Math.cos(ang)*r1,Math.sin(ang)*r1+p*p*40);c.lineTo(Math.cos(ang)*r2,Math.sin(ang)*r2+p*p*40);c.stroke()}
  c.restore();
  c.fillStyle='rgba(160,160,165,'+(.4*a)+')';for(let i=0;i<3;i++){c.beginPath();c.arc(-4-p*14*i,-p*20-i*4,5+p*14,0,TAU);c.fill()}
  c.strokeStyle='rgba(255,255,255,'+a+')';c.lineWidth=2;c.beginPath();c.arc(0,0,16*e,0,TAU);c.stroke();
}

/* ---------- ДЕРЕВО ---------- */
function woodS(c,t,s){
  glow(c,0,0,36*s,'#7ee05a',.3);
  c.save();c.scale(s,s);
  c.rotate(Math.sin(t*5)*.08);
  c.fillStyle='#2a6a2a';for(const sg of [-1,1]){c.save();c.translate(-14,0);c.rotate(sg*.7);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-8,sg*-2-4,-16,0);c.quadraticCurveTo(-8,sg*2+4,0,0);c.fillStyle=lg(c,0,0,-16,0,[[0,'#3f9a3a'],[1,'#a6e07a']]);c.fill();c.restore()}
  const N=9;
  for(let i=0;i<N;i++){const a=i/N*TAU+.25;c.save();c.rotate(a);
    c.fillStyle=lg(c,10,0,25,0,[[0,'#6a4a2a'],[.6,'#d8c9a0'],[1,'#fff6d8']]);c.beginPath();c.moveTo(10,-3.2);c.lineTo(26,0);c.lineTo(10,3.2);c.closePath();c.fill();
    c.strokeStyle='rgba(20,30,10,.6)';c.lineWidth=.8;c.stroke();c.restore()}
  c.beginPath();c.ellipse(0,0,13,11,0,0,TAU);
  c.fillStyle=rg(c,-4,-4,16,[[0,'#d6f59a'],[.35,'#79c24a'],[.75,'#2f7a2e'],[1,'#164a1e']]);c.fill();
  c.strokeStyle='rgba(10,30,10,.8)';c.lineWidth=1;c.stroke();
  c.strokeStyle='rgba(10,50,10,.45)';c.lineWidth=.8;for(let i=-1;i<=1;i++){c.beginPath();c.ellipse(0,0,12,Math.abs(i)*5+1.5,0,0,TAU);c.stroke()}
  c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.ellipse(-5,-5,3.2,1.8,-.6,0,TAU);c.fill();
  glow(c,5,0,7,'#d6ff6a',.8);
  c.restore();
}
function woodT(c,x,y,age,k,t){
  if(age>.95)return;const a=1-age;
  c.fillStyle='rgba(150,230,90,'+(.55*a)+')';c.beginPath();c.arc(-age*6,Math.sin(k+t*4)*age*10,2.6*a+.6,0,TAU);c.fill();
  if(R(k)>.6){c.save();c.translate(-age*10,(R(k+1)-.5)*30*(1+age));c.rotate(k+t*6);c.fillStyle='rgba(90,190,70,'+a+')';c.beginPath();c.ellipse(0,0,4,1.8,0,0,TAU);c.fill();c.restore()}
}
function woodH(c,x,y,p,k){
  const e=1-(1-p)*(1-p),a=1-p;
  c.fillStyle='rgba(130,210,80,'+(.28*a)+')';for(let i=0;i<6;i++){c.beginPath();c.arc((R(i)-.5)*70*e,(R(i+5)-.5)*36*e-p*10,12+24*e*R(i+2),0,TAU);c.fill()}
  for(let i=0;i<10;i++){const ang=i/10*TAU,L=10+36*e;c.save();c.rotate(ang);c.globalAlpha=a;
    c.fillStyle='#e8ddb0';c.beginPath();c.moveTo(L*.4,-2.2);c.lineTo(L+10,0);c.lineTo(L*.4,2.2);c.closePath();c.fill();c.restore()}
  for(let i=0;i<8;i++){c.save();c.translate((R(i)-.5)*100*e,(R(i+3)-.5)*60*e+p*30*p);c.rotate(i+p*6);c.globalAlpha=a;c.fillStyle=i%2?'#7ac856':'#3f9a3a';c.beginPath();c.ellipse(0,0,6,2.6,0,0,TAU);c.fill();c.restore()}
  c.globalAlpha=1;glow(c,0,0,40*e+8,'#9be36a',.45*a);
}

/* ---------- ОГНЕСТРЕЛ ---------- */
function gunBody(c,pts,top,bot){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=lg(c,0,-14,0,14,[[0,top],[.45,'#6b7589'],[1,bot]]);c.fill();c.strokeStyle='rgba(8,10,16,.95)';c.lineWidth=1.2;c.stroke()}
function pistol(c,fl){
  gunBody(c,[[-18,-8],[26,-8],[26,2],[-6,2],[-8,6],[-18,6]],'#e5ebf5','#2a3040');
  gunBody(c,[[-12,2],[-2,2],[4,22],[-9,22]],'#5a4632','#241a10');
  c.strokeStyle='#14181f';c.lineWidth=1.6;c.beginPath();c.moveTo(-2,2);c.quadraticCurveTo(3,10,10,3);c.stroke();
  c.fillStyle='rgba(255,255,255,.7)';c.fillRect(-16,-7,40,1.2);c.fillStyle='#10131a';c.fillRect(24,-6,3,3);
  c.fillStyle='rgba(0,0,0,.5)';for(let i=0;i<5;i++)c.fillRect(-16+i*2.2,-6,1,6);
  if(fl>0){flash(c,27,-4,fl)}
}
function shotgun(c,fl){
  gunBody(c,[[-4,-5],[70,-5],[70,0],[-4,0]],'#dfe5f0','#2a3040');
  gunBody(c,[[-4,0],[60,0],[60,5],[-4,5]],'#aab4c6','#222838');
  gunBody(c,[[-30,-2],[-4,-6],[-4,6],[-24,12],[-34,10]],'#8a5e36','#3a2412');
  gunBody(c,[[8,2],[34,2],[34,9],[8,9]],'#7a4e2c','#2e1c0e');
  c.fillStyle='rgba(255,255,255,.65)';c.fillRect(0,-4.4,68,1);
  c.fillStyle='#10131a';c.beginPath();c.arc(70,-2,2,0,TAU);c.fill();c.beginPath();c.arc(60,2.5,2,0,TAU);c.fill();
  c.strokeStyle='#14181f';c.lineWidth=1.4;c.beginPath();c.moveTo(-2,5);c.quadraticCurveTo(2,12,8,6);c.stroke();
  if(fl>0)flash(c,72,-2,fl);
}
function wood(c,pts){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=lg(c,0,-12,0,14,[[0,'#c98a52'],[.5,'#8a5530'],[1,'#3e2210']]);c.fill();c.strokeStyle='rgba(20,10,4,.95)';c.lineWidth=1.2;c.stroke();c.strokeStyle='rgba(255,220,170,.18)';c.lineWidth=.8;const p0=pts[0],p1=pts[1];c.beginPath();c.moveTo(p0[0]+2,p0[1]+3);c.lineTo(p1[0]-2,p1[1]+3);c.stroke()}
function rifle(c,fl){ /* штурмовая винтовка: изогнутый магазин, дерево */
  wood(c,[[-36,-4],[-8,-8],[-8,5],[-27,13],[-38,9]]);
  gunBody(c,[[-8,-9],[36,-9],[36,3],[-8,3]],'#6a7488','#161a24');
  c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-6,-8,40,1);c.fillStyle='rgba(0,0,0,.45)';for(let i=0;i<4;i++)c.fillRect(4+i*6,-3,3,5);
  wood(c,[[36,-7],[62,-7],[62,3],[36,3]]);
  gunBody(c,[[38,-12],[66,-12],[66,-8],[38,-8]],'#7d879b','#262c3c');
  gunBody(c,[[62,-5.5],[88,-5.5],[88,-1.8],[62,-1.8]],'#aab4c6','#222838');
  gunBody(c,[[84,-8],[92,-8],[92,1],[84,1]],'#4a5266','#10131a');
  c.fillStyle='#10131a';c.beginPath();c.moveTo(76,-6);c.lineTo(78,-12);c.lineTo(80,-6);c.fill();
  c.beginPath();c.moveTo(6,3);c.lineTo(22,3);c.quadraticCurveTo(24,24,40,38);c.lineTo(26,40);c.quadraticCurveTo(10,26,6,3);c.closePath();
  c.fillStyle=lg(c,8,0,32,0,[[0,'#6a4a2e'],[.5,'#9a6a3e'],[1,'#3e2a18']]);c.fill();c.strokeStyle='#14100a';c.lineWidth=1.2;c.stroke();
  c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1;for(let i=0;i<5;i++){const q=i/5;c.beginPath();c.moveTo(8+q*10+q*q*8,8+i*6);c.lineTo(21+q*12+q*q*8,6+i*6.4);c.stroke()}
  gunBody(c,[[-6,3],[4,3],[7,18],[-3,18]],'#3a3e4a','#10131a');
  c.strokeStyle='#14181f';c.lineWidth=1.4;c.beginPath();c.moveTo(3,3);c.quadraticCurveTo(8,10,14,3);c.stroke();
  if(fl>0)flash(c,93,-3.7,fl);
}
function smg(c,fl){ /* пистолет-пулемёт: компактный корпус, длинный магазин, складной приклад */
  c.strokeStyle='#2a3040';c.lineWidth=2.2;c.lineCap='round';c.beginPath();c.moveTo(-8,-3);c.lineTo(-30,-6);c.lineTo(-34,6);c.stroke();c.strokeStyle='#8a94a8';c.lineWidth=1;c.beginPath();c.moveTo(-8,-3);c.lineTo(-30,-6);c.lineTo(-34,6);c.stroke();c.lineCap='butt';
  gunBody(c,[[-34,2],[-28,2],[-28,10],[-34,10]],'#4a5266','#10131a');
  gunBody(c,[[-8,-9],[34,-9],[34,3],[-8,3]],'#8a96ac','#1c2230');
  c.fillStyle='rgba(255,255,255,.4)';c.fillRect(-6,-8,38,1);c.fillStyle='rgba(0,0,0,.5)';for(let i=0;i<6;i++)c.fillRect(8+i*3.4,-6,1.6,6);
  gunBody(c,[[34,-7],[58,-7],[58,0],[34,0]],'#c0c9d8','#2a3040');
  gunBody(c,[[56,-6],[64,-6],[64,-1],[56,-1]],'#4a5266','#10131a');
  c.fillStyle='#10131a';c.fillRect(24,-12,6,3);
  gunBody(c,[[6,3],[17,3],[19,32],[8,32]],'#5a6074','#12151e');
  c.fillStyle='rgba(255,210,90,.9)';for(let i=0;i<3;i++)c.fillRect(10,10+i*7,4,2);
  gunBody(c,[[-8,3],[0,3],[3,18],[-6,18]],'#3a3e4a','#10131a');
  c.strokeStyle='#14181f';c.lineWidth=1.4;c.beginPath();c.moveTo(0,3);c.quadraticCurveTo(5,10,11,3);c.stroke();
  if(fl>0)flash(c,66,-3.5,fl);
}
function launcher(c,fl){ /* гранатомёт: толстый ствол-труба, барабан-коробка, деревянный приклад */
  wood(c,[[-40,-4],[-10,-8],[-10,6],[-30,14],[-42,10]]);
  gunBody(c,[[-10,-10],[30,-10],[30,6],[-10,6]],'#6a7488','#161a24');
  c.fillStyle='rgba(255,255,255,.3)';c.fillRect(-8,-9,36,1);
  gunBody(c,[[28,-13],[84,-13],[84,3],[28,3]],'#aab4c6','#222838');
  c.fillStyle='rgba(255,255,255,.55)';c.fillRect(30,-12,52,1.4);
  c.strokeStyle='rgba(20,24,34,.6)';c.lineWidth=1.2;for(let x=40;x<82;x+=10){c.beginPath();c.moveTo(x,-13);c.lineTo(x,3);c.stroke()}
  gunBody(c,[[82,-16],[94,-16],[94,6],[82,6]],'#4a5266','#10131a');
  c.fillStyle='#0a0c10';c.beginPath();c.ellipse(94,-5,2.4,10,0,0,TAU);c.fill();
  c.fillStyle='#e8c84a';c.fillRect(46,-18,2,6);c.fillRect(44,-19,6,2);
  wood(c,[[30,3],[60,3],[60,10],[30,10]]);
  gunBody(c,[[-8,6],[2,6],[6,24],[-4,24]],'#3a3e4a','#10131a');
  c.strokeStyle='#14181f';c.lineWidth=1.4;c.beginPath();c.moveTo(-2,6);c.quadraticCurveTo(3,13,10,6);c.stroke();
  if(fl>0)flash(c,96,-5,fl*1.2);
}
function grenade(c,t){ c.fillStyle=rg(c,-2,-2,9,[[0,'#8a9a6a'],[1,'#2e3a22']]);c.beginPath();c.ellipse(0,0,6.5,5,0,0,TAU);c.fill();c.strokeStyle='#10140a';c.lineWidth=1.1;c.stroke();c.fillStyle='#c8ccd6';c.fillRect(-1.5,-7.5,3,3);c.strokeStyle='rgba(0,0,0,.35)';c.beginPath();c.moveTo(-3,-4);c.lineTo(-3,4);c.moveTo(1,-4.5);c.lineTo(1,4.5);c.stroke() }
function sniper(c,fl){ /* снайперская винтовка: длинный ствол, оптика, сошки */
  gunBody(c,[[-38,-3],[-8,-8],[-8,5],[-24,13],[-40,11]],'#7a8a52','#2a3216');
  c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(-22,2,6,3.5,.3,0,TAU);c.fill();
  gunBody(c,[[-8,-8],[46,-8],[46,3],[-8,3]],'#566074','#12161f');
  c.fillStyle='rgba(255,255,255,.4)';c.fillRect(-6,-7,50,1);
  gunBody(c,[[46,-5.5],[126,-5.5],[126,-1.8],[46,-1.8]],'#c4cdda','#2a3040');
  c.strokeStyle='rgba(20,24,34,.55)';c.lineWidth=1;for(let x=58;x<110;x+=8){c.beginPath();c.moveTo(x,-5.5);c.lineTo(x,-1.8);c.stroke()}
  gunBody(c,[[122,-8],[136,-8],[136,1],[122,1]],'#4a5266','#10131a');
  c.fillStyle='#05070a';for(const x of [126,130])c.fillRect(x,-6,1.6,6);
  gunBody(c,[[4,-12],[10,-12],[10,-8],[4,-8]],'#3a4258','#161a24');gunBody(c,[[32,-12],[38,-12],[38,-8],[32,-8]],'#3a4258','#161a24');
  gunBody(c,[[-6,-19],[40,-19],[40,-12],[-6,-12]],'#3a4458','#0e1118');
  gunBody(c,[[38,-21],[52,-21],[52,-10],[38,-10]],'#2c3446','#0a0d14');gunBody(c,[[-12,-20],[-4,-20],[-4,-11],[-12,-11]],'#2c3446','#0a0d14');
  c.fillStyle=rg(c,51,-15.5,6,[[0,'#bfe8ff'],[.5,'#3a78c8'],[1,'#0a1a38']]);c.beginPath();c.ellipse(51.5,-15.5,2.2,5,0,0,TAU);c.fill();
  c.fillStyle='rgba(255,255,255,.6)';c.fillRect(0,-18,38,1);
  c.strokeStyle='#14181f';c.lineWidth=2.4;c.beginPath();c.moveTo(-2,-4);c.lineTo(-10,-1);c.stroke();c.fillStyle='#8a94a8';c.beginPath();c.arc(-11,-.5,2.6,0,TAU);c.fill();
  gunBody(c,[[10,3],[24,3],[24,11],[10,11]],'#3a4258','#161a24');
  c.strokeStyle='#8a94a8';c.lineWidth=2.2;c.lineCap='round';c.beginPath();c.moveTo(86,-1);c.lineTo(78,16);c.moveTo(92,-1);c.lineTo(100,16);c.stroke();c.lineCap='butt';
  if(fl>0)flash(c,138,-3.7,fl);
}
function flash(c,x,y,f){
  c.save();c.globalCompositeOperation='lighter';c.translate(x,y);
  c.fillStyle=rg(c,0,0,30*f,[[0,'rgba(255,255,255,1)'],[.3,'rgba(255,220,120,.9)'],[1,'rgba(255,120,30,0)']]);c.beginPath();c.arc(0,0,30*f,0,TAU);c.fill();
  c.fillStyle='rgba(255,230,150,.9)';c.beginPath();c.moveTo(0,0);c.lineTo(34*f,-4*f);c.lineTo(16*f,0);c.lineTo(34*f,4*f);c.closePath();c.fill();c.restore();
}
const ez=p=>1-(1-p)*(1-p),cl=(x,a,b)=>Math.max(a,Math.min(b,x));
function puffs(c,x,y,r,col,a){c.fillStyle=rg(c,x,y,r,[[0,'rgba('+col+','+a+')'],[1,'rgba('+col+',0)']]);c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
function disc(c,x,y,rx,ry,col,a){c.save();c.translate(x,y);c.scale(1,ry/rx);c.fillStyle=rg(c,0,0,rx,[[0,'rgba('+col+','+a+')'],[.7,'rgba('+col+','+(a*.6)+')'],[1,'rgba('+col+',0)']]);c.beginPath();c.arc(0,0,rx,0,TAU);c.fill();c.restore()}
function ringE(c,x,y,rx,ry,col,w,a){c.save();c.strokeStyle='rgba('+col+','+a+')';c.lineWidth=w;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.stroke();c.restore()}
function bolt(c,x1,y1,x2,y2,seed,col,w,a){
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,n=Math.max(4,Math.floor(L/12)),P=[[x1,y1]];
  for(let i=1;i<n;i++){const k=i/n,o=(R(seed+i)-.5)*Math.min(34,L*.28);P.push([x1+dx*k+nx*o,y1+dy*k+ny*o])}P.push([x2,y2]);
  c.save();c.globalCompositeOperation='lighter';c.lineCap='round';c.lineJoin='round';
  const path=()=>{c.beginPath();P.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]))};
  for(const [lw,cc,aa] of [[w*5,col,.22],[w*2.2,col,.6],[w*.8,'#fff',1]]){c.strokeStyle=cc;c.globalAlpha=a*aa;c.lineWidth=lw;path();c.stroke()}
  c.globalAlpha=a*.7;c.strokeStyle=col;c.lineWidth=w*.7;
  for(let i=2;i<P.length-1;i+=2){const q=P[i],ang=(R(seed+i*3)-.5)*2+Math.atan2(dy,dx),l=14+22*R(seed+i);c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(q[0]+Math.cos(ang)*l*.5+(R(seed+i+9)-.5)*6,q[1]+Math.sin(ang)*l*.5);c.lineTo(q[0]+Math.cos(ang)*l,q[1]+Math.sin(ang)*l);c.stroke()}
  c.restore();
}
function crystal(c,x,y,h,w,ang){c.save();c.translate(x,y);c.rotate(ang);
  const f=(pts,col)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=col;c.fill()};
  f([[-w,0],[0,-h],[0,0]],'rgba(190,235,255,.95)');f([[0,-h],[w,0],[0,0]],'rgba(90,170,230,.95)');f([[-w,0],[0,0],[0,w*.5]],'rgba(60,120,190,.9)');f([[0,0],[w,0],[0,w*.5]],'rgba(40,90,160,.9)');
  c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=.9;c.beginPath();c.moveTo(-w,0);c.lineTo(0,-h);c.lineTo(w,0);c.stroke();c.restore()}
function spikeRock(c,x,y,h,w,seed){if(h<1)return;c.save();c.translate(x,y);
  c.fillStyle=lg(c,-w,0,w,0,[[0,'#b08a58'],[.5,'#d9b87c'],[1,'#6a5030']]);c.beginPath();c.moveTo(-w,0);c.lineTo(-w*.3+(R(seed)-.5)*4,-h*.6);c.lineTo((R(seed+1)-.5)*4,-h);c.lineTo(w*.35,-h*.55);c.lineTo(w,0);c.closePath();c.fill();
  c.fillStyle='rgba(30,20,10,.35)';c.beginPath();c.moveTo(0,-h);c.lineTo(w*.35,-h*.55);c.lineTo(w,0);c.lineTo(w*.1,0);c.closePath();c.fill();
  c.strokeStyle='rgba(25,15,8,.85)';c.lineWidth=1.1;c.beginPath();c.moveTo(-w,0);c.lineTo(-w*.3,-h*.6);c.lineTo(0,-h);c.lineTo(w*.35,-h*.55);c.lineTo(w,0);c.stroke();
  c.strokeStyle='rgba(255,240,200,.5)';c.beginPath();c.moveTo(-w*.6,-h*.2);c.lineTo(-w*.2,-h*.7);c.stroke();c.restore()}
function vine(c,x1,y1,x2,y2,t,w,amp,leaves){
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,P=[];
  for(let i=0;i<=20;i++){const k=i/20,o=Math.sin(k*9+t*8)*amp*(1-k*.5)*Math.sin(k*Math.PI);P.push([x1+dx*k+nx*o,y1+dy*k+ny*o])}
  c.save();c.lineCap='round';c.lineJoin='round';
  for(const [lw,col] of [[w+2,'#0f2a10'],[w,'#2f7a2e'],[w*.45,'#8fdc66']]){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();P.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke()}
  if(leaves)for(let i=3;i<P.length;i+=3){const q=P[i],sg=i%2?1:-1;c.save();c.translate(q[0],q[1]);c.rotate(Math.atan2(dy,dx)+sg*.9);c.fillStyle=lg(c,0,0,12,0,[[0,'#2f7a2e'],[1,'#a6e07a']]);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(6,-4*sg,13,0);c.quadraticCurveTo(6,4*sg,0,0);c.fill();c.restore()}
  c.restore();
}
function funnel(c,x,y,h,w,t,rgb,lite){
  c.save();
  for(let i=0;i<22;i++){const k=i/21,yy=y-k*h,ww=w*(.25+.75*k)*(1+.06*Math.sin(t*6+i)),sx=Math.sin(t*5+i*.55)*w*.18*k;
    c.strokeStyle='rgba('+rgb+','+(.18+.35*(1-k*.5))+')';c.lineWidth=3.2;c.beginPath();c.ellipse(x+sx,yy,ww,ww*.28,0,Math.PI*.1+((t*8+i)%1)*.2,Math.PI*.9);c.stroke();
    c.strokeStyle='rgba('+lite+','+(.22)+')';c.beginPath();c.ellipse(x+sx,yy,ww*.7,ww*.2,0,Math.PI*1.1,Math.PI*1.9);c.stroke()}
  c.restore();
}
function rockBit(c,x,y,r,a,seed,col){c.save();c.translate(x,y);c.rotate(a);c.fillStyle=col||'#8a6b45';c.strokeStyle='#1c120a';c.lineWidth=1;const p=rockPoly(seed,5,r);c.beginPath();p.forEach((u,i)=>i?c.lineTo(u[0],u[1]):c.moveTo(u[0],u[1]));c.closePath();c.fill();c.stroke();c.restore()}
function flameAt(c,x,y,s,t,k){c.save();c.translate(x,y);c.rotate(-Math.PI/2);const sc=s*(.9+.2*Math.sin(t*10+k));
  for(const [l,c1,c2] of [[1,'rgba(160,25,5,.85)','rgba(255,80,20,0)'],[.7,'rgba(255,110,25,.95)','rgba(255,170,60,0)'],[.4,'rgba(255,230,140,.95)','rgba(255,255,220,0)']]){
    c.fillStyle=lg(c,0,0,-26*l*sc,0,[[0,c1],[1,c2]]);c.beginPath();c.moveTo(2,-7*l*sc);c.quadraticCurveTo(-12*l*sc,-9*l*sc+Math.sin(t*9+k)*3,-26*l*sc,Math.sin(t*7+k)*4);c.quadraticCurveTo(-12*l*sc,9*l*sc,2,7*l*sc);c.closePath();c.fill()}
  c.restore()}

const ABL=[];
function ab(n,k,d,col,f){ABL.push({n:n,k:k,d:d,c:col,f:f})}
const CX=170,CY=118;
ab('Вспышка','Навык · Огонь','Огненное кольцо расходится от героя, оставляя горящую землю.','#ff6a2b',(c,p,t)=>{
  const e=ez(p),r=14+104*e,a=1-p*p;
  disc(c,CX,CY,r*1.1,r*.6,'255,90,20',.35*a);
  ringE(c,CX,CY,r,r*.55,'255,130,30',16*(1-p)+3,.6*a);ringE(c,CX,CY,r,r*.55,'255,230,160',5*(1-p)+1,.95*a);
  c.save();c.globalCompositeOperation='lighter';for(let i=0;i<22;i++){const ang=i/22*TAU;flameAt(c,CX+Math.cos(ang)*r,CY+Math.sin(ang)*r*.55,.6*(1-p*.5),t,i)}c.restore();
  glow(c,CX,CY-6,50*(1-p)+16,'#ffd070',.8*(1-p));
  for(let i=0;i<12;i++){const ang=R(i)*TAU,d=r*(.6+.5*R(i+2));c.fillStyle='rgba(255,'+(150+90*R(i))+',60,'+a+')';c.beginPath();c.arc(CX+Math.cos(ang)*d,CY+Math.sin(ang)*d*.55-p*30*R(i+4),2,0,TAU);c.fill()}
});
ab('Источник','Навык · Вода','Бьёт родник: лечит героя, мочит и замедляет врагов.','#3aa7ff',(c,p,t)=>{
  disc(c,CX,CY+20,90,40,'60,150,230',.5);
  for(let i=0;i<3;i++){const q=(p*2+i/3)%1;ringE(c,CX,CY+20,10+85*q,4+36*q,'210,240,255',2,.8*(1-q))}
  for(let i=0;i<26;i++){const ang=R(i)*TAU,v=.5+.5*R(i+3),q=(t*1.3+R(i+7))%1,h=Math.sin(q*Math.PI)*(70+30*v),x=CX+Math.cos(ang)*q*40*v,y=CY+20-h+Math.sin(ang)*q*8;c.fillStyle='rgba(200,235,255,'+(1-q*.5)+')';c.beginPath();c.ellipse(x,y,2,3,0,0,TAU);c.fill()}
  c.fillStyle=lg(c,0,CY-50,0,CY+20,[[0,'rgba(220,245,255,.2)'],[1,'rgba(90,180,240,.7)']]);c.beginPath();c.moveTo(CX-8,CY+20);c.quadraticCurveTo(CX-5,CY-40,CX,CY-52);c.quadraticCurveTo(CX+5,CY-40,CX+8,CY+20);c.fill();
  glow(c,CX,CY+10,70,'#6fd0ff',.3);
  c.fillStyle='#8ff0b0';c.font='bold 16px sans-serif';for(let i=0;i<4;i++){const q=(t*.8+i/4)%1;c.globalAlpha=1-q;c.fillText('+',CX-40+i*26,CY-q*50)}c.globalAlpha=1;
});
ab('Шипы земли','Навык · Земля','Шипы пробивают землю и оглушают врагов.','#c9974f',(c,p,t)=>{
  disc(c,CX,CY+18,100,40,'30,20,10',.5);
  const sp=[[-70,6],[-38,-8],[-6,-14],[26,-6],[58,8],[-52,26],[16,22],[46,28]];
  sp.forEach((q,i)=>{const s=cl((p*1.5-i*.07)/.25,0,1),r=p>.78?cl(1-(p-.78)/.2,0,1):1,h=(46+22*R(i))*ez(s)*r;
    if(s>0&&s<1){c.fillStyle='rgba(150,120,80,.5)';for(let j=0;j<4;j++){c.beginPath();c.arc(CX+q[0]+(R(j+i)-.5)*40*s,CY+q[1]-8*s*R(j),6+10*s,0,TAU);c.fill()}}
    c.strokeStyle='rgba(15,8,4,.8)';c.lineWidth=1.5;c.beginPath();c.moveTo(CX+q[0]-12,CY+q[1]);c.lineTo(CX+q[0]-3,CY+q[1]+4);c.lineTo(CX+q[0]+10,CY+q[1]-2);c.stroke();
    spikeRock(c,CX+q[0],CY+q[1],h,11+5*R(i),i)});
});
ab('Молния','Навык · Воздух','Цепная молния перескакивает между врагами, сверху бьёт гром.','#f4f08a',(c,p,t)=>{
  const en=[[CX-90,CY+20],[CX-20,CY-10],[CX+60,CY+16],[CX+110,CY-20]];
  disc(c,CX-20,CY+16,60,20,'20,20,20',.4);
  const fl=(Math.floor(t*16)%2)?1:.55;
  if(p<.35){const a=fl*(1-p/.35);bolt(c,CX-20+30,-10,CX-20,CY-10,Math.floor(t*14),'#f4f08a',2.4,a);glow(c,CX-20,CY-10,90,'#fff6b0',.7*a)}
  if(p>.2&&p<.8){const a=fl*(1-(p-.2)/.6);for(let i=0;i<en.length-1;i++){const k=cl((p-.2)*4-i*.3,0,1);if(k>0)bolt(c,en[i][0],en[i][1],en[i][0]+(en[i+1][0]-en[i][0])*k,en[i][1]+(en[i+1][1]-en[i][1])*k,Math.floor(t*14)+i*5,'#f4f08a',1.8,a)}}
  en.forEach((q,i)=>{c.fillStyle='#d65f8e';c.beginPath();c.arc(q[0],q[1],9,0,TAU);c.fill();if(p>.2+i*.12&&p<.8)glow(c,q[0],q[1],34,'#f4f08a',.7)});
  if(p<.3)ringE(c,CX-20,CY+14,20+90*p/.3,8+30*p/.3,'255,246,176',3,1-p/.3);
});
ab('Залп','Навык · Металл','Веер стальных пуль в сторону цели.','#b4c0d4',(c,p,t)=>{
  const ox=40,oy=CY;
  for(let i=0;i<7;i++){const a=(i/6-.5)*.7,q=cl(p*1.25-i*.01,0,1),d=20+260*q,x=ox+Math.cos(a)*d,y=oy+Math.sin(a)*d;
    c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(255,190,80,'+(.5*(1-q))+')';c.lineWidth=2;c.beginPath();c.moveTo(ox+Math.cos(a)*Math.max(20,d-70),oy+Math.sin(a)*Math.max(20,d-70));c.lineTo(x,y);c.stroke();c.restore();
    if(q<1){c.save();c.translate(x,y);c.rotate(a);metalS(c,t,.9);c.restore()}else{glow(c,x,y,16,'#ffe9a8',.8*(1-(p*1.25-1)*4));}}
  if(p<.12)flash(c,ox+8,oy,1-p/.12);
});
ab('Хлыст лозы','Навык · Дерево','Лоза бьёт по линии, опутывает и лечит.','#62c15a',(c,p,t)=>{
  const sw=ez(cl(p*1.5,0,1)),ang=-.9+1.8*sw,L=210*(.6+.4*Math.sin(Math.PI*cl(p*1.5,0,1)));
  const x1=50,y1=CY+20,x2=x1+Math.cos(ang)*L,y2=y1+Math.sin(ang)*L*.7;
  disc(c,x1+L*.4,y1+10,90,24,'20,40,10',.45);
  vine(c,x1,y1,x2,y2,t,8,10,true);
  c.fillStyle='#e8ddb0';for(let i=0;i<5;i++){const k=.3+i*.14;const px=x1+(x2-x1)*k,py=y1+(y2-y1)*k;c.beginPath();c.moveTo(px,py-6);c.lineTo(px+3,py-14);c.lineTo(px+5,py-5);c.fill()}
  glow(c,x2,y2,26,'#a6e07a',.6*(1-p));
  for(let i=0;i<8;i++){const q=(t*1.1+i/8)%1;c.fillStyle='rgba(160,240,110,'+(1-q)+')';c.beginPath();c.arc(x1+(R(i)-.5)*30,y1-q*50,2.2,0,TAU);c.fill()}
});
ab('Пар','Симбиоз · Огонь + Вода','Облако горячего пара: замедляет и обжигает.','#dbe9f2',(c,p,t)=>{
  disc(c,CX,CY+22,100,38,'200,225,240',.4);
  for(let i=0;i<20;i++){const q=(t*.35+R(i))%1,x=CX+(R(i+3)-.5)*130+Math.sin(t*2+i)*14,y=CY+24-q*110,r=16+34*q;puffs(c,x,y,r,i%3?'235,243,250':'190,215,235',.5*(1-q)*(q<.1?q*10:1))}
  glow(c,CX,CY+10,60,'#ff9a5a',.25);
  c.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<10;i++){const q=(t*.9+R(i))%1;c.beginPath();c.arc(CX+(R(i+1)-.5)*120,CY+20-q*90,1.6,0,TAU);c.fill()}
});
ab('Магма','Симбиоз · Огонь + Земля','Метеориты падают с неба и оставляют лавовые лужи.','#ff6a2b',(c,p,t)=>{
  const imp=.45,fall=cl(p/imp,0,1);
  if(p>imp){const q=(p-imp)/(1-imp),r=20+70*ez(q);disc(c,CX,CY+16,r*1.15,r*.5,'255,70,20',.7);disc(c,CX,CY+16,r*.8,r*.34,'255,190,70',.7*(1-q*.4));
    for(let i=0;i<8;i++){const ang=i*.8+.3;c.strokeStyle='rgba(30,10,5,.7)';c.lineWidth=2;c.beginPath();c.moveTo(CX,CY+16);c.lineTo(CX+Math.cos(ang)*r,CY+16+Math.sin(ang)*r*.45);c.stroke()}
    for(let i=0;i<10;i++){const a=R(i)*TAU,d=r*.7*R(i+4),bq=(t*1.2+R(i))%1;c.fillStyle='rgba(255,220,120,'+(1-bq)+')';c.beginPath();c.arc(CX+Math.cos(a)*d,CY+16+Math.sin(a)*d*.45-bq*10,2+2*bq,0,TAU);c.fill()}
    if(q<.4){glow(c,CX,CY+10,110*q/.4+20,'#ffb050',.9*(1-q/.4));for(let i=0;i<14;i++){const a=-Math.PI/2+(R(i)-.5)*2.6,v=140*R(i+3)*q;c.fillStyle='rgba(255,'+(120+100*R(i))+',40,'+(1-q)+')';c.beginPath();c.arc(CX+Math.cos(a)*v,CY+Math.sin(a)*v+260*q*q*.4,3,0,TAU);c.fill()}}}
  if(p<imp){const x=CX+150-150*fall,y=-30+(CY+10+30)*fall;
    c.save();c.globalCompositeOperation='lighter';for(let k=0;k<14;k++){const q=k/14;puffs(c,x+q*60,y-q*45,18*(1-q*.7),q<.4?'255,160,40':'200,50,10',.6*(1-q))}c.restore();
    rockBit(c,x,y,16,t*5,3,'#3a2a22');glow(c,x,y,28,'#ff7a28',.9);disc(c,CX,CY+16,26*fall,10*fall,'0,0,0',.4)}
});
ab('Огненный смерч','Симбиоз · Огонь + Воздух','Огненный вихрь втягивает врагов и жжёт.','#ff9a3c',(c,p,t)=>{
  disc(c,CX,CY+26,70,22,'255,90,20',.45);
  funnel(c,CX,CY+22,130,52,t,'255,120,30','255,230,150');
  c.save();c.globalCompositeOperation='lighter';
  for(let i=0;i<30;i++){const q=(t*.7+R(i))%1,ang=t*8+i*1.3,rr=10+50*q;puffs(c,CX+Math.cos(ang)*rr,CY+22-q*120,6+4*(1-q),i%2?'255,170,50':'255,80,20',.7*(1-q*.5))}c.restore();
  glow(c,CX,CY+24,60,'#ff6a1a',.35);
});
ab('Расплав','Симбиоз · Огонь + Металл','Раскалённый слиток оставляет лужи расплава.','#ff9a3c',(c,p,t)=>{
  const x=30+270*p,y=CY-6;
  for(let i=0;i<5;i++){const px=30+270*Math.max(0,p-i*.12-.05);if(px>x-10)continue;disc(c,px,CY+26,26,9,'255,90,20',.7*(1-i*.15));disc(c,px,CY+26,14,5,'255,210,100',.8*(1-i*.15))}
  c.save();c.globalCompositeOperation='lighter';for(let k=0;k<14;k++){const q=k/14;puffs(c,x-q*70,y+Math.sin(t*10+k)*4,14*(1-q*.6),q<.5?'255,150,40':'200,50,10',.7*(1-q))}c.restore();
  c.fillStyle=rg(c,x-3,y-3,16,[[0,'#fff6c0'],[.35,'#ffb040'],[.7,'#c8400c'],[1,'#3a1008']]);c.beginPath();c.arc(x,y,15,0,TAU);c.fill();
  c.strokeStyle='rgba(30,10,5,.7)';c.lineWidth=1.4;c.beginPath();c.moveTo(x-8,y-6);c.lineTo(x-2,y);c.lineTo(x-6,y+8);c.moveTo(x+3,y-10);c.lineTo(x+6,y-2);c.stroke();
  glow(c,x,y,40,'#ff7a28',.7);
  for(let i=0;i<8;i++){const q=(t*2+R(i))%1;c.fillStyle='rgba(255,200,80,'+(1-q)+')';c.beginPath();c.arc(x-q*40,y+(R(i+2)-.5)*30+q*q*30,2,0,TAU);c.fill()}
});
ab('Лесной пожар','Симбиоз · Огонь + Дерево','Огонь разрастается и охватывает всё вокруг.','#ff7a2b',(c,p,t)=>{
  const g=.5+.5*ez(p);disc(c,CX,CY+20,110*g,44*g,'255,70,20',.4);disc(c,CX,CY+20,70*g,28*g,'40,12,6',.5);
  for(const [x,h] of [[-60,40],[50,48],[0,-44]]){c.fillStyle='#1a1008';c.fillRect(CX+x-3,CY+16+(h<0?-30:-h*.5),6,Math.abs(h)*.5+8);c.beginPath();c.moveTo(CX+x-14,CY+8+(h<0?-30:-h*.5));c.lineTo(CX+x,CY-30-Math.abs(h)*.4+(h<0?-30:0));c.lineTo(CX+x+14,CY+8+(h<0?-30:-h*.5));c.fill()}
  c.save();c.globalCompositeOperation='lighter';
  for(let i=0;i<26;i++){const a=R(i)*TAU,d=Math.sqrt(R(i+5))*100*g,x=CX+Math.cos(a)*d,y=CY+20+Math.sin(a)*d*.4;if(R(i+9)>g+.1)continue;flameAt(c,x,y,.9+.5*R(i+3),t,i)}
  c.restore();
  for(let i=0;i<16;i++){const q=(t*.6+R(i))%1;c.fillStyle='rgba(255,'+(140+90*R(i))+',60,'+(1-q)+')';c.beginPath();c.arc(CX+(R(i+1)-.5)*180*g+Math.sin(t*3+i)*8,CY+10-q*100,1.8,0,TAU);c.fill()}
});
ab('Топь','Симбиоз · Вода + Земля','Вязкая трясина замедляет и душит врагов.','#6fa05a',(c,p,t)=>{
  disc(c,CX,CY+20,110,46,'30,50,24',.9);disc(c,CX,CY+20,80,32,'60,90,40',.7);
  for(let i=0;i<9;i++){const q=(t*.5+R(i))%1,x=CX+(R(i+2)-.5)*150,y=CY+18+(R(i+6)-.5)*50;
    if(q<.8){const r=2+7*Math.sin(q/.8*Math.PI*.5);c.fillStyle='rgba(150,190,100,.55)';c.strokeStyle='rgba(220,250,170,.8)';c.beginPath();c.arc(x,y-q*14,r,0,TAU);c.fill();c.stroke()}
    else{ringE(c,x,y,(q-.8)*60,(q-.8)*24,'200,240,150',1.5,1-(q-.8)*5)}}
  for(let i=0;i<5;i++){const x=CX+(R(i+20)-.5)*140,h=24+14*Math.sin(t*3+i);c.strokeStyle='#2a4a1c';c.lineWidth=4;c.beginPath();c.moveTo(x,CY+22);c.quadraticCurveTo(x+8,CY+22-h*.6,x+(i%2?10:-10),CY+22-h);c.stroke();c.fillStyle='#d8e0b0';c.beginPath();c.moveTo(x+(i%2?10:-10)-2,CY+22-h);c.lineTo(x+(i%2?14:-14),CY+22-h-8);c.lineTo(x+(i%2?10:-10)+2,CY+22-h+2);c.fill()}
  for(let i=0;i<6;i++){const q=(t*.25+i/6)%1;puffs(c,CX+(R(i)-.5)*160,CY+10-q*30,26,'150,190,120',.18*(1-q))}
});
ab('Ледяной шквал','Симбиоз · Вода + Воздух','Ледяная волна замораживает и разбрасывает осколки.','#bdf0ff',(c,p,t)=>{
  const e=ez(p),r=10+100*e;
  disc(c,CX,CY+18,r*1.1,r*.5,'180,230,255',.45*(1-p*.5));ringE(c,CX,CY+18,r,r*.48,'230,250,255',5*(1-p)+1,.9);
  for(let i=0;i<14;i++){const a=i/14*TAU+.2,d=r*(.55+.4*R(i)),x=CX+Math.cos(a)*d,y=CY+18+Math.sin(a)*d*.48,h=(14+26*R(i+3))*cl(e*1.6,0,1);crystal(c,x,y,h,5+5*R(i+1),(R(i+2)-.5)*.5)}
  glow(c,CX,CY,60*(1-p)+20,'#bdf0ff',.6*(1-p));
  c.fillStyle='#fff';for(let i=0;i<20;i++){const q=(t*.7+R(i))%1;c.globalAlpha=.8*(1-q);c.beginPath();c.arc(CX+(R(i+3)-.5)*220,CY-40+q*90,1.4,0,TAU);c.fill()}c.globalAlpha=1;
});
ab('Ржавчина','Симбиоз · Вода + Металл','Ржавое облако разъедает броню врагов.','#c58a4a',(c,p,t)=>{
  disc(c,CX,CY+22,100,36,'150,80,30',.5);
  for(let i=0;i<14;i++){const q=(t*.3+R(i))%1,x=CX+(R(i+3)-.5)*130,y=CY+16-q*70;puffs(c,x,y,22+16*q,i%2?'190,110,50':'140,70,30',.4*(1-q))}
  c.save();c.translate(CX,CY+4);c.rotate(.4);const dis=.3+.7*Math.abs(Math.sin(t*.8));
  c.fillStyle=lg(c,-20,-20,20,20,[[0,'#9aa6b8'],[1,'#3c4658']]);c.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;c.lineTo(Math.cos(a)*22,Math.sin(a)*22)}c.closePath();c.fill();
  c.fillStyle='#10131a';c.beginPath();c.arc(0,0,9,0,TAU);c.fill();
  for(let i=0;i<14;i++){const a=R(i)*TAU,d=20*R(i+2);c.fillStyle='rgba('+(170+40*R(i))+','+(80+30*R(i))+',30,'+(.8*dis)+')';c.beginPath();c.arc(Math.cos(a)*d,Math.sin(a)*d,3+4*R(i+5),0,TAU);c.fill()}c.restore();
  for(let i=0;i<14;i++){const q=(t*.6+R(i))%1;c.save();c.translate(CX+(R(i+1)-.5)*70+Math.sin(q*6+i)*6,CY-10+q*50);c.rotate(q*6+i);c.fillStyle='rgba(180,90,35,'+(1-q)+')';c.fillRect(-3,-1.5,6,3);c.restore()}
});
ab('Лоза жизни','Симбиоз · Вода + Дерево','Лозы растут вокруг героя, лечат вас и колют врагов.','#62c15a',(c,p,t)=>{
  disc(c,CX,CY+22,90,32,'40,120,50',.5);
  const g=ez(cl(p*2,0,1));
  for(let i=0;i<7;i++){const a=i/7*TAU+t*.5,x=CX+Math.cos(a)*62,y=CY+22+Math.sin(a)*24;vine(c,x,y,x+Math.cos(a)*10,y-(70+20*R(i))*g,t+i,6,6,true);
    if(g>.8){c.fillStyle='#ff9ec0';for(let j=0;j<5;j++){c.beginPath();c.arc(x+Math.cos(a)*10+Math.cos(j*1.26)*4,y-(70+20*R(i))*g+Math.sin(j*1.26)*4,2.6,0,TAU);c.fill()}c.fillStyle='#ffe27a';c.beginPath();c.arc(x+Math.cos(a)*10,y-(70+20*R(i))*g,2,0,TAU);c.fill()}}
  for(let i=0;i<12;i++){const q=(t*.5+i/12)%1;c.fillStyle='rgba(140,255,170,'+(1-q)+')';c.font='bold 13px sans-serif';c.fillText('+',CX+(R(i)-.5)*40,CY+10-q*70)}
  glow(c,CX,CY,70,'#7ee05a',.2);
});
ab('Песчаная буря','Симбиоз · Земля + Воздух','Песчаный вихрь тянет врагов и перемалывает их.','#e6c88a',(c,p,t)=>{
  disc(c,CX,CY+26,80,26,'200,160,100',.5);
  funnel(c,CX,CY+22,130,56,t,'220,185,120','255,235,190');
  for(let i=0;i<28;i++){const q=(t*.8+R(i))%1,a=t*7+i*1.7,rr=14+60*q;c.fillStyle='rgba('+(200+30*R(i))+','+(165+30*R(i))+',110,'+(.8*(1-q*.6))+')';c.beginPath();c.arc(CX+Math.cos(a)*rr,CY+22-q*118+Math.sin(a)*rr*.2,1.6+R(i+2)*1.6,0,TAU);c.fill()}
  for(let i=0;i<3;i++){const a=t*5+i*2.1,rr=44;rockBit(c,CX+Math.cos(a)*rr,CY-10+Math.sin(a)*14-i*18,5,a*2,i)}
  puffs(c,CX,CY+24,70,'210,175,120',.3);
});
ab('Цитадель','Симбиоз · Земля + Металл','Стальные стены и турели прикрывают героя.','#b4c0d4',(c,p,t)=>{
  disc(c,CX,CY+34,120,30,'0,0,0',.4);
  const g=ez(cl(p*2.5,0,1));
  for(let i=0;i<3;i++){const x=CX-60+i*60,h=70*g,y=CY+30;
    c.fillStyle=lg(c,x-26,0,x+26,0,[[0,'#8a8f9c'],[.5,'#c4c9d4'],[1,'#5a606e']]);c.fillRect(x-26,y-h,52,h);
    c.strokeStyle='rgba(20,24,34,.8)';c.lineWidth=1.2;for(let r=0;r<5;r++){const yy=y-h+r*h/5;c.beginPath();c.moveTo(x-26,yy);c.lineTo(x+26,yy);c.stroke();for(let b=0;b<2;b++){c.beginPath();c.moveTo(x-26+(r%2?0:13)+b*26,yy);c.lineTo(x-26+(r%2?0:13)+b*26,yy+h/5);c.stroke()}}
    c.fillStyle='rgba(255,255,255,.18)';c.fillRect(x-26,y-h,52,3);
    if(g>.9){c.fillStyle='#7a8090';for(let m=0;m<3;m++)c.fillRect(x-24+m*18,y-h-8,12,8)}}
  if(g>.9){const tx=CX,ty=CY-52;c.fillStyle=lg(c,0,ty-10,0,ty+10,[[0,'#d3dbe8'],[1,'#3a4258']]);c.beginPath();c.arc(tx,ty,12,Math.PI,0);c.fill();c.fillRect(tx-12,ty,24,6);
    const a=Math.sin(t*1.5)*.4;c.save();c.translate(tx,ty-2);c.rotate(a);c.fillStyle='#2a3040';c.fillRect(0,-3,26,6);c.restore();
    const q=(t*3)%1;if(q<.3)flash(c,tx+Math.cos(a)*28,ty-2+Math.sin(a)*28,1-q/.3);c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(255,200,90,.7)';c.lineWidth=1.6;c.beginPath();c.moveTo(tx+Math.cos(a)*30,ty-2+Math.sin(a)*30);c.lineTo(tx+Math.cos(a)*120,ty-2+Math.sin(a)*120);c.stroke();c.restore()}
});
ab('Древний корень','Симбиоз · Земля + Дерево','Гигантские корни пробивают землю и сжимают врагов.','#8a6a3a',(c,p,t)=>{
  disc(c,CX,CY+28,110,34,'20,12,6',.55);
  const g=ez(cl(p*2.2,0,1))*(p>.85?cl(1-(p-.85)/.15,0,1):1);
  const roots=[[-60,-28,.4],[-10,-80,-.1],[50,-50,-.5]];
  roots.forEach((r,i)=>{const bx=CX+r[0],by=CY+28,tipx=bx+r[2]*r[1]*-1.2,tipy=by+r[1]*g,N=18;
    c.save();c.lineCap='round';
    for(const [k,col] of [[1,'#1c120a'],[.8,'#6a4a28'],[.35,'#a07a48']]){c.strokeStyle=col;c.beginPath();for(let j=0;j<=N;j++){const q=j/N,x=bx+(tipx-bx)*q+Math.sin(q*5+i)*10*q,y=by+(tipy-by)*q;c.lineWidth=(16*(1-q)+3)*k*(.4+.6*g);j?c.lineTo(x,y):c.moveTo(x,y);}c.stroke()}
    c.restore();c.fillStyle='rgba(90,160,60,.8)';c.beginPath();c.ellipse(bx+(tipx-bx)*.5,by+(tipy-by)*.5,5,2.4,.6,0,TAU);c.fill();
    if(g<1&&g>0){c.fillStyle='rgba(110,84,56,.6)';for(let j=0;j<5;j++){c.beginPath();c.arc(bx+(R(j+i)-.5)*40,by-R(j)*16,7+7*R(j+2),0,TAU);c.fill()}}});
  for(let i=0;i<8;i++){const q=cl(p*1.5,0,1);rockBit(c,CX+(R(i)-.5)*160*q,CY+10-Math.sin(q*3)*60*R(i+1)+q*q*50,3+3*R(i+3),i+q*8,i)}
});
ab('Рельсотрон','Симбиоз · Воздух + Металл','Заряженный луч пробивает всех на линии.','#e8eef8',(c,p,t)=>{
  const y=CY,ox=44;
  c.fillStyle=lg(c,0,y-10,0,y+10,[[0,'#d3dbe8'],[1,'#2a3040']]);c.fillRect(ox-30,y-8,46,16);c.fillStyle='#10131a';c.fillRect(ox+14,y-4,6,8);
  for(let i=0;i<3;i++){c.strokeStyle='rgba(120,200,255,.9)';c.lineWidth=2;c.beginPath();c.moveTo(ox-20+i*10,y-8);c.lineTo(ox-20+i*10,y+8);c.stroke()}
  if(p<.35){const q=p/.35;glow(c,ox+20,y,14+30*q,'#9fd8ff',.4+.6*q);for(let i=0;i<3;i++){ringE(c,ox+22,y,30*(1-((q+i/3)%1)),30*(1-((q+i/3)%1)),'160,220,255',1.6,.8)}}
  else{const q=(p-.35)/.65,a=1-q*q;
    c.save();c.globalCompositeOperation='lighter';
    for(const [w,col,al] of [[34,'80,160,255',.2],[16,'150,210,255',.5],[5,'255,255,255',1]]){c.fillStyle='rgba('+col+','+(al*a)+')';c.fillRect(ox+20,y-w/2*(1-q*.4),330,w*(1-q*.4))}
    for(let i=0;i<9;i++){const x=ox+40+i*34+q*40;ringE(c,x,y,4+16*q,9+16*q,'200,235,255',1.6,.7*a)}
    c.restore();glow(c,ox+22,y,50,'#fff',.8*a);
    for(let i=0;i<16;i++){const x=ox+40+R(i)*270,s=(R(i+3)-.5)*30*q;c.strokeStyle='rgba(255,255,255,'+(a*.7)+')';c.lineWidth=1.2;c.beginPath();c.moveTo(x,y+s*.3);c.lineTo(x+8,y+s);c.stroke()}
  }
});
ab('Пыльца','Симбиоз · Воздух + Дерево','Облака спор отравляют и замедляют врагов.','#a6e07a',(c,p,t)=>{
  disc(c,CX,CY+24,110,38,'120,180,60',.35);
  [[-60,0],[10,-14],[64,6],[-14,22]].forEach(([x,y],j)=>{
    for(let i=0;i<7;i++){const a=t*(.5+R(i)*.4)+i*1.3+j,rr=14+16*R(i+j);puffs(c,CX+x+Math.cos(a)*rr,CY+y+Math.sin(a)*rr*.6,22+10*R(i+4),i%2?'166,224,122':'220,240,120',.32)}
    for(let i=0;i<9;i++){const a=t*(.8+R(i))+i*2+j,rr=10+36*R(i+j+2);c.fillStyle='rgba(235,255,150,'+(.5+.4*Math.sin(t*4+i))+')';c.beginPath();c.arc(CX+x+Math.cos(a)*rr,CY+y+Math.sin(a)*rr*.7-8,1.6,0,TAU);c.fill()}});
  glow(c,CX,CY,90,'#c8ff7a',.15);
});
ab('Терновая сталь','Симбиоз · Металл + Дерево','Стальная турель стреляет колючими шипами.','#9ad16a',(c,p,t)=>{
  disc(c,CX-70,CY+34,60,16,'0,0,0',.5);
  const tx=CX-70,ty=CY+10;
  c.fillStyle=lg(c,0,ty,0,ty+30,[[0,'#cfd7e3'],[1,'#303848']]);c.beginPath();c.moveTo(tx-22,ty+26);c.lineTo(tx-14,ty);c.lineTo(tx+14,ty);c.lineTo(tx+22,ty+26);c.closePath();c.fill();c.strokeStyle='#10131a';c.lineWidth=1.2;c.stroke();
  vine(c,tx-18,ty+26,tx-10,ty+4,t,3,2,true);vine(c,tx+18,ty+26,tx+12,ty+2,t+2,3,2,true);
  const a=-.06;c.save();c.translate(tx,ty-4);c.rotate(a);c.fillStyle=lg(c,0,-6,0,6,[[0,'#e5ebf5'],[1,'#2a3040']]);c.fillRect(0,-5,36,10);c.fillStyle='#4a8a3a';for(let i=0;i<4;i++){c.beginPath();c.moveTo(6+i*8,-5);c.lineTo(9+i*8,-12);c.lineTo(12+i*8,-5);c.fill()}c.restore();
  const per=.6,sh=(t%per)/per;if(sh<.15)glow(c,tx+38,ty-6,24,'#b6ff7a',1-sh/.15);
  for(let i=0;i<3;i++){const q=((t/per)+i/3)%1,x=tx+40+q*220,y=ty-6+Math.sin(i)*3*q;
    c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(160,255,110,'+(.5*(1-q))+')';c.lineWidth=3;c.beginPath();c.moveTo(x-28,y);c.lineTo(x,y);c.stroke();c.restore();
    c.save();c.translate(x,y);c.fillStyle=lg(c,-10,0,12,0,[[0,'#5a7a5a'],[.5,'#dfe7ee'],[1,'#fff']]);c.beginPath();c.moveTo(14,0);c.lineTo(-8,-4);c.lineTo(-4,0);c.lineTo(-8,4);c.closePath();c.fill();c.restore()}
  c.fillStyle='#d65f8e';c.beginPath();c.arc(CX+120,CY+12,12,0,TAU);c.fill();
});


/* ---------- новые навыки: дальний / ближний / поддержка ---------- */
function iceS(c,t,s){ // ледяное копьё, направление вправо
  c.save();c.scale(s,s);glow(c,0,0,34,'#9fe0ff',.45);
  c.globalCompositeOperation='lighter';
  for(let i=0;i<7;i++){const q=i/7;c.fillStyle='rgba(170,225,255,'+(.32*(1-q))+')';c.beginPath();c.ellipse(-12-q*34,(R(i)-.5)*5*q,9*(1-q*.6),3.2*(1-q*.5),0,0,TAU);c.fill()}
  c.globalCompositeOperation='source-over';
  c.fillStyle=lg(c,-16,-6,22,6,[[0,'#cfeeff'],[.55,'#7fc8f0'],[1,'#2f78c0']]);c.beginPath();c.moveTo(26,0);c.lineTo(4,-6.5);c.lineTo(-16,-3);c.lineTo(-20,0);c.lineTo(-16,3);c.lineTo(4,6.5);c.closePath();c.fill();
  c.strokeStyle='rgba(10,30,60,.85)';c.lineWidth=1.1;c.stroke();
  c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=1;c.beginPath();c.moveTo(-14,0);c.lineTo(23,0);c.stroke();
  c.restore();
}
ab('Огненный шар','Навык · Огонь · дальний бой','Тяжёлый огненный шар летит в цель и взрывается, поджигая всех вокруг.','#ff8a3d',(c,p,t)=>{
  disc(c,CX,CY+22,110,34,'30,10,5',.35);
  const fl=cl(p/.58,0,1);
  if(p<.58){const x=CX-110+fl*(200),y=CY-12-Math.sin(fl*Math.PI)*16;for(let i=0;i<9;i++){const q=i/9;glow(c,x-q*46,y+q*8,16*(1-q*.5),'#ff7a2b',.5*(1-q))}c.save();c.translate(x,y);fireS(c,t,1.9);c.restore()}
  else{const e=(p-.58)/.42,r=18+86*ez(e),a=1-e*e;
    glow(c,CX+90,CY,r*1.5,'#ffd070',.8*a);disc(c,CX+90,CY+8,r*1.2,r*.5,'255,100,25',.5*a);ringE(c,CX+90,CY+8,r,r*.5,'255,200,110',7*(1-e)+1,.9*a);ringE(c,CX+90,CY+8,r*.7,r*.35,'255,120,40',4,.7*a);
    c.save();c.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const ang=i/14*TAU+R(i);flameAt(c,CX+90+Math.cos(ang)*r*.8,CY+8+Math.sin(ang)*r*.4,.7*(1-e*.4),t,i)}c.restore()}
});
ab('Боевой жар','Навык · Огонь · поддержка','Жар воодушевляет: больше урона и вампиризма вам и союзникам рядом.','#ffb347',(c,p,t)=>{
  const e=ez(cl(p*1.6,0,1)),a=p>.8?1-(p-.8)/.2:1;
  disc(c,CX,CY+22,100*e,40*e,'255,120,30',.4*a);
  c.save();c.translate(CX,CY+22);c.scale(1,.4);c.strokeStyle='rgba(255,200,100,'+(.8*a)+')';c.lineWidth=2.4;c.beginPath();c.arc(0,0,86*e,0,TAU);c.stroke();c.beginPath();c.arc(0,0,64*e,0,TAU);c.stroke();
  for(let i=0;i<8;i++){const ang=i/8*TAU+t*.4;c.beginPath();c.moveTo(Math.cos(ang)*64*e,Math.sin(ang)*64*e);c.lineTo(Math.cos(ang)*86*e,Math.sin(ang)*86*e);c.stroke()}c.restore();
  c.save();c.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const ang=i/10*TAU+t*.5;flameAt(c,CX+Math.cos(ang)*58*e,CY+22+Math.sin(ang)*23*e,.5*e,t,i)}c.restore();
  for(let i=0;i<24;i++){const q=(t*.7+R(i))%1,x=CX+(R(i+3)-.5)*100,y=CY+22-q*110;c.fillStyle='rgba(255,'+(150+80*R(i))+',60,'+((1-q)*a)+')';c.beginPath();c.arc(x,y,1.8+R(i+5)*1.6,0,TAU);c.fill()}
  glow(c,CX,CY-6,60,'#ffb347',.45*a);
  c.fillStyle='rgba(255,230,160,'+a+')';c.font='bold 15px sans-serif';for(let i=0;i<3;i++){const q=(t*.8+i/3)%1;c.globalAlpha=(1-q)*a;c.fillText('▲',CX-40+i*34,CY-30-q*40)}c.globalAlpha=1;
});
ab('Ледяное копьё','Навык · Вода · дальний бой','Копьё изо льда пробивает врагов насквозь и замедляет их.','#9fe0ff',(c,p,t)=>{
  disc(c,CX,CY+22,110,34,'20,40,70',.35);
  const fl=cl(p/.62,0,1);
  if(p<.62){const x=CX-120+fl*220;c.save();c.translate(x,CY-6);iceS(c,t,2.2);c.restore()}
  else{const e=(p-.62)/.38,a=1-e;ringE(c,CX+100,CY+6,10+60*e,4+22*e,'200,235,255',3,.9*a);
    for(let i=0;i<12;i++){const ang=R(i)*TAU,d=e*(30+60*R(i+2));crystal(c,CX+100+Math.cos(ang)*d,CY+6+Math.sin(ang)*d*.5-e*18,12+8*R(i+4),4,ang+1.2)}c.globalAlpha=1}
});
ab('Приливная волна','Навык · Вода · ближний бой','Мощная волна бьёт вперёд, отбрасывает и мочит врагов.','#6fd0ff',(c,p,t)=>{
  disc(c,CX,CY+22,110,34,'20,60,110',.35);
  const e=ez(p),x=CX-30+e*120,a=1-p*p*.8;
  c.save();c.translate(x,CY);waterS(c,t,3.1*(.6+.4*e));c.restore();
  for(let i=0;i<22;i++){const q=(t*1.2+R(i))%1,xx=x+(R(i+2)-.5)*40-q*50,yy=CY+(R(i+4)-.5)*70-Math.sin(q*Math.PI)*22;c.fillStyle='rgba(220,245,255,'+(.8*(1-q)*a)+')';c.beginPath();c.arc(xx,yy,1.8+R(i+6)*2,0,TAU);c.fill()}
  ringE(c,CX,CY+22,40+60*e,14+22*e,'160,220,255',3,.5*(1-p));
});
ab('Землетрясение','Навык · Земля · ближний бой','Удар о землю: трещины, ударная волна и оглушение врагов вокруг.','#c9974f',(c,p,t)=>{
  const e=ez(p),a=1-p*p;
  disc(c,CX,CY+22,100,40,'30,20,10',.5);
  c.save();c.translate(CX,CY+22);c.scale(1,.45);c.strokeStyle='rgba(20,10,4,.9)';c.lineWidth=3;
  for(let i=0;i<9;i++){const ang=i/9*TAU+R(i)*.3,L=30+80*e*(.7+.3*R(i+2));c.beginPath();c.moveTo(0,0);let x=0,y=0;for(let k=1;k<=6;k++){const q=k/6;x=Math.cos(ang+(R(i*7+k)-.5)*.5)*L*q;y=Math.sin(ang+(R(i*7+k)-.5)*.5)*L*q;c.lineTo(x,y)}c.stroke()}
  c.strokeStyle='rgba(255,170,70,'+(.5*a)+')';c.lineWidth=1.2;for(let i=0;i<9;i++){const ang=i/9*TAU+R(i)*.3,L=30+80*e;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(ang)*L,Math.sin(ang)*L);c.stroke()}c.restore();
  ringE(c,CX,CY+22,20+95*e,8+40*e,'210,170,100',5*(1-p)+1,.8*a);ringE(c,CX,CY+22,10+60*e,4+26*e,'255,230,170',2.5,.8*a);
  for(let i=0;i<10;i++){const ang=R(i)*TAU,d=(20+70*e)*(.5+.5*R(i+2)),h=Math.sin(Math.min(1,p*1.4)*Math.PI)*(30+30*R(i+4));rockBit(c,CX+Math.cos(ang)*d,CY+22+Math.sin(ang)*d*.45-h,4+4*R(i+6),p*8+i,i,'#8a6b45')}
  puffs(c,CX,CY+18,50*e+10,'150,120,80',.4*a);
});
ab('Каменный покров','Навык · Земля · поддержка','Каменная броня: ваша защита растёт, вы восстанавливаете здоровье.','#c9974f',(c,p,t)=>{
  const e=ez(cl(p*1.8,0,1)),a=p>.8?1-(p-.8)/.2:1;
  disc(c,CX,CY+22,90*e,34*e,'60,45,20',.5*a);
  c.save();c.translate(CX,CY+22);c.scale(1,.4);c.strokeStyle='rgba(255,170,60,'+(.8*a)+')';c.lineWidth=2;c.beginPath();c.arc(0,0,74*e,0,TAU);c.stroke();
  for(let i=0;i<6;i++){const ang=i/6*TAU;c.beginPath();c.moveTo(Math.cos(ang)*50*e,Math.sin(ang)*50*e);c.lineTo(Math.cos(ang+1.2)*74*e,Math.sin(ang+1.2)*74*e);c.stroke()}c.restore();
  for(let i=0;i<7;i++){const ang=i/7*TAU+t*.7,x=CX+Math.cos(ang)*56*e,y=CY+4+Math.sin(ang)*22*e,h=18+6*Math.sin(i);c.save();c.globalAlpha=a;c.translate(x,y);c.rotate(Math.cos(ang)*.3);
    c.fillStyle=lg(c,-8,-h,8,h*.2,[[0,'#d7c08c'],[.5,'#8a7048'],[1,'#4a3a22']]);c.beginPath();c.moveTo(-9,h*.5);c.lineTo(-7,-h*.6);c.lineTo(0,-h);c.lineTo(7,-h*.6);c.lineTo(9,h*.5);c.closePath();c.fill();c.strokeStyle='rgba(20,12,5,.9)';c.lineWidth=1.2;c.stroke();
    c.strokeStyle='rgba(255,180,70,'+(.5+.3*Math.sin(t*3+i))+')';c.beginPath();c.moveTo(-3,-h*.5);c.lineTo(0,-h*.2);c.lineTo(3,-h*.5);c.stroke();c.restore()}
  glow(c,CX,CY,60,'#c9974f',.3*a);
});
ab('Вихрь клинков','Навык · Воздух · ближний бой','Круг воздушных клинков разлетается от вас и рубит всех рядом.','#8febd0',(c,p,t)=>{
  const e=ez(p),a=1-p*p;
  ringE(c,CX,CY+22,10+80*e,4+32*e,'200,255,240',2.5,.5*a);
  for(let i=0;i<8;i++){const ang=i/8*TAU+p*5,d=14+84*e,x=CX+Math.cos(ang)*d,y=CY+14+Math.sin(ang)*d*.5;
    for(let k=1;k<6;k++){const aa=ang-k*.16,dd=14+84*e*(1-k*.06);c.strokeStyle='rgba(180,255,230,'+(.5*(1-k/6)*a)+')';c.lineWidth=3-k*.4;c.beginPath();c.moveTo(CX+Math.cos(aa+.16)*(dd+3),CY+14+Math.sin(aa+.16)*(dd+3)*.5);c.lineTo(CX+Math.cos(aa)*dd,CY+14+Math.sin(aa)*dd*.5);c.stroke()}
    c.save();c.translate(x,y);c.rotate(ang+Math.PI/2+.4);c.globalAlpha=a;c.fillStyle='rgba(235,255,250,.95)';c.beginPath();c.moveTo(0,-12);c.quadraticCurveTo(7,0,0,12);c.quadraticCurveTo(2,0,0,-12);c.fill();c.strokeStyle='#2fd0b0';c.lineWidth=1;c.stroke();c.restore()}
  glow(c,CX,CY,50,'#8febd0',.4*a);
});
ab('Попутный ветер','Навык · Воздух · поддержка','Ветер подхватывает: скорость растёт, рывок восстанавливается.','#b6f5e0',(c,p,t)=>{
  const a=p>.8?1-(p-.8)/.2:1,e=ez(cl(p*2,0,1));
  disc(c,CX,CY+22,80*e,28*e,'120,230,200',.25*a);
  for(let j=0;j<5;j++){c.strokeStyle='rgba('+(j%2?'210,255,240':'120,235,205')+','+(.7*a)+')';c.lineWidth=2.2-j*.2;c.beginPath();
    for(let i=0;i<=40;i++){const q=i/40,ang=q*TAU*1.5+t*2.4+j*1.3,r=(26+q*52)*e,x=CX+Math.cos(ang)*r,y=CY+10+Math.sin(ang)*r*.5-q*20+j*4;i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}
  for(let i=0;i<14;i++){const q=(t*1.1+R(i))%1,y=CY-30+R(i+2)*80;c.strokeStyle='rgba(220,255,245,'+(.6*(1-q)*a)+')';c.lineWidth=1.4;c.beginPath();c.moveTo(CX-80+q*160,y);c.lineTo(CX-80+q*160-26,y);c.stroke()}
  glow(c,CX,CY,50,'#b6f5e0',.3*a);
});
ab('Магнитный импульс','Навык · Металл · ближний бой','Импульс затягивает врагов к вам и бьёт по площади.','#b4c0d4',(c,p,t)=>{
  const a=1-p*p;
  disc(c,CX,CY+22,100,38,'30,40,60',.4);
  for(let i=0;i<3;i++){const q=(p*1.6+i/3)%1;ringE(c,CX,CY+18,100*(1-q)+8,40*(1-q)+3,'190,210,240',2.4,.7*q)}
  for(let i=0;i<14;i++){const ang=R(i)*TAU,q=cl(p*1.5-R(i+2)*.3,0,1),d=100*(1-ez(q))+6,x=CX+Math.cos(ang)*d,y=CY+14+Math.sin(ang)*d*.5;c.save();c.translate(x,y);c.rotate(ang+q*5);c.fillStyle='#aab4c6';c.fillRect(-4,-2,8,4);c.strokeStyle='#1c2230';c.lineWidth=1;c.strokeRect(-4,-2,8,4);c.restore()}
  for(let i=0;i<5;i++){const ang=R(i+9)*TAU;bolt(c,CX+Math.cos(ang)*70*(1-p*.6),CY+14+Math.sin(ang)*34*(1-p*.6),CX,CY+8,i+Math.floor(t*14),'#9cc4ff',1.2,.7*a)}
  glow(c,CX,CY+8,40+30*p,'#9cc4ff',.6*a);
});
ab('Бастион','Навык · Металл · поддержка','Стальной бастион: броня и урон растут на время.','#b4c0d4',(c,p,t)=>{
  const e=ez(cl(p*1.8,0,1)),a=p>.8?1-(p-.8)/.2:1;
  disc(c,CX,CY+22,90*e,34*e,'40,50,70',.5*a);
  for(let i=0;i<6;i++){const ang=i/6*TAU+t*.3,x=CX+Math.cos(ang)*54*e,y=CY+8+Math.sin(ang)*22*e;c.save();c.globalAlpha=a;c.translate(x,y);
    c.fillStyle=lg(c,-12,-18,12,14,[[0,'#d5deee'],[.5,'#7d889c'],[1,'#3a4254']]);c.beginPath();c.moveTo(-12,-14);c.lineTo(12,-14);c.lineTo(12,8);c.lineTo(0,18);c.lineTo(-12,8);c.closePath();c.fill();c.strokeStyle='#10141c';c.lineWidth=1.4;c.stroke();
    c.fillStyle='rgba(255,230,130,.9)';for(const [rx,ry] of[[-7,-9],[7,-9],[-7,2],[7,2]]){c.beginPath();c.arc(rx,ry,1.4,0,TAU);c.fill()}c.restore()}
  ringE(c,CX,CY+8,60*e,26*e,'190,215,255',2.4,.7*a);
  glow(c,CX,CY,60,'#9cc4ff',.35*a);
});
ab('Семена-паразиты','Навык · Дерево · дальний бой','Рой семян сам находит врагов и заражает их ядом.','#9ad16a',(c,p,t)=>{
  disc(c,CX,CY+22,110,34,'20,40,15',.4);
  for(let i=0;i<5;i++){const q=cl(p/.7-i*.05,0,1),a=-.7+i*.35,x=CX-90+q*190*(.9+.1*Math.cos(a)),y=CY-6+Math.sin(a)*(60*Math.sin(q*Math.PI))*(1-q*.4);
    if(q>0&&q<1){for(let k=1;k<5;k++){glow(c,x-k*8,y-Math.sin(a)*k*2,5,'#9aff5a',.35*(1-k/5))}c.save();c.translate(x,y);c.rotate(Math.atan2(Math.sin(a)*8,22));woodS(c,t,.9);c.restore()}}
  if(p>.62){const e=(p-.62)/.38,a=1-e;for(let i=0;i<5;i++)puffs(c,CX+100+(R(i)-.5)*60*e,CY+6+(R(i+3)-.5)*30*e,16+20*e,'110,200,70',.45*a);
    for(let i=0;i<14;i++){const ang=R(i)*TAU,d=e*40*R(i+2);c.fillStyle='rgba(180,255,110,'+a+')';c.beginPath();c.arc(CX+100+Math.cos(ang)*d,CY+6+Math.sin(ang)*d*.6-e*14,2.2,0,TAU);c.fill()}}
});
ab('Росток жизни','Навык · Дерево · поддержка','Из земли вырастает росток: лечит вас и союзников рядом.','#8ad25a',(c,p,t)=>{
  const e=ez(cl(p*1.4,0,1)),a=p>.85?1-(p-.85)/.15:1;
  disc(c,CX,CY+22,96*e,36*e,'40,110,40',.5*a);
  for(let i=0;i<3;i++){const q=(p*1.5+i/3)%1;ringE(c,CX,CY+22,10+86*q,4+34*q,'160,255,140',2,.7*(1-q)*a)}
  c.save();c.globalAlpha=a;const h=70*e;
  c.strokeStyle='#5a3a1a';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(CX,CY+24);c.quadraticCurveTo(CX+6*Math.sin(t*1.6),CY-h*.5,CX,CY+24-h);c.stroke();
  c.strokeStyle='#3f8a36';c.lineWidth=4;c.beginPath();c.moveTo(CX,CY+24);c.quadraticCurveTo(CX+6*Math.sin(t*1.6),CY-h*.5,CX,CY+24-h);c.stroke();c.lineCap='butt';
  for(let i=0;i<6;i++){const q=(i+1)/7,sg=i%2?1:-1,x=CX+3*Math.sin(t*1.6)*q,y=CY+24-h*q;c.save();c.translate(x,y);c.rotate(sg*(.8+.2*Math.sin(t*2+i)));c.fillStyle=lg(c,0,0,22*e,0,[[0,'#2f7a2e'],[1,'#a6e07a']]);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(12*e,-8*sg,26*e*(1-q*.3),0);c.quadraticCurveTo(12*e,6*sg,0,0);c.fill();c.strokeStyle='#14300f';c.lineWidth=1;c.stroke();c.restore()}
  glow(c,CX,CY+24-h,26,'#caff8a',.6);c.restore();
  c.fillStyle='#8ff0b0';c.font='bold 16px sans-serif';for(let i=0;i<5;i++){const q=(t*.8+i/5)%1;c.globalAlpha=(1-q)*a;c.fillText('+',CX-50+i*24,CY-q*54)}c.globalAlpha=1;
});

ab('Огнемёт','Навык · Огонь · ближний','Струя пламени конусом перед героем.','#ff9a3c',(c,p,t)=>{
  const a=p>.8?1-(p-.8)/.2:1;
  disc(c,CX-10,CY+24,150,36,'60,20,5',.35*a);
  c.fillStyle='#2a2f44';c.beginPath();c.arc(CX-120,CY+6,14,0,TAU);c.fill();glow(c,CX-108,CY+4,40,'#ff7a2b',.6*a);
  c.save();c.globalCompositeOperation='lighter';
  for(let i=0;i<22;i++){const q=(t*1.7+R(i))%1,x=CX-104+q*230,y=CY+4+(R(i+3)-.5)*q*110;c.save();c.globalAlpha=(1-q)*a;c.translate(x,y);fireS(c,t+i,.35+q*.75);c.restore()}
  c.restore();
});
ab('Ливень','Навык · Вода · массовый','Ливень обрушивается на область.','#6fd0ff',(c,p,t)=>{
  const e=ez(cl(p*1.4,0,1)),a=p>.85?1-(p-.85)/.15:1;
  disc(c,CX,CY+22,130*e,44*e,'40,110,200',.45*a);
  c.fillStyle='rgba(60,80,120,'+(.55*a)+')';for(let i=0;i<7;i++){c.beginPath();c.arc(CX-110+i*36,CY-92+Math.sin(i*1.7)*8,30+R(i)*10,0,TAU);c.fill()}
  c.strokeStyle='rgba(190,235,255,'+(.85*a)+')';c.lineWidth=2.2;c.lineCap='round';
  for(let i=0;i<34;i++){const q=(t*1.6+R(i+1))%1,x=CX+(R(i)-.5)*240,y=CY-80+q*110;c.beginPath();c.moveTo(x,y);c.lineTo(x-4,y-16);c.stroke();if(q>.86)ringE(c,x,CY+22+(R(i+5)-.5)*30,6+(q-.86)*90,3+(q-.86)*30,'200,240,255',1.5,a*(1-q)*4)}
  c.lineCap='butt';
});
ab('Валун','Навык · Земля · бросок','Тяжёлый валун катится и давит врагов.','#c9974f',(c,p,t)=>{
  disc(c,CX,CY+24,140,32,'40,25,10',.4);
  const fl=cl(p/.7,0,1),x=CX-130+fl*250;
  for(let i=0;i<10;i++){const q=i/10;puffs(c,x-20-q*80,CY+18-R(i)*10,14+q*16,'150,120,80',.35*(1-q))}
  c.save();c.translate(x,CY);earthS(c,t*1.6,1.9,7);c.restore();
  if(p>.7){const e=(p-.7)/.3;ringE(c,CX+120,CY+20,20+70*e,8+26*e,'230,200,140',4,1-e);for(let i=0;i<8;i++){const ang=R(i)*TAU;rockBit(c,CX+120+Math.cos(ang)*60*e,CY+10+Math.sin(ang)*24*e-e*20,5+R(i+1)*4,t*5+i,i)}}
});
ab('Серп ветра','Навык · Воздух · бросок','Серпы ветра прорезают ряды врагов.','#8febd0',(c,p,t)=>{
  disc(c,CX,CY+24,140,30,'40,90,80',.25);
  for(let k=0;k<3;k++){const q=cl(p*1.3-k*.08,0,1),x=CX-120+q*280,y=CY-20+k*20;
    c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(200,255,240,'+(.5*(1-q))+')';c.lineWidth=2;c.beginPath();c.moveTo(x-90,y);c.lineTo(x-10,y);c.stroke();c.restore();
    c.save();c.translate(x,y);airS(c,t,1.4);c.restore()}
  for(let i=0;i<4;i++){const ex=CX-40+i*50,hit=p*1.3>(ex-(CX-120))/280;c.fillStyle=hit?'rgba(214,95,142,.5)':'#d65f8e';c.beginPath();c.arc(ex,CY+(i%2?14:-6),9,0,TAU);c.fill();if(hit)glow(c,ex,CY,20,'#c8fff0',.5)}
});
ab('Осколочный град','Навык · Металл · массовый','Снаряды падают и рвутся шрапнелью.','#e8eef8',(c,p,t)=>{
  disc(c,CX,CY+22,130,40,'40,40,50',.4);
  const pts=[[-80,10],[-20,-4],[40,14],[90,-2],[-50,30],[20,32]];
  pts.forEach((q,i)=>{const t0=.12+i*.1,x=CX+q[0],y=CY+q[1];
    if(p<t0){const k=1-p/t0;c.strokeStyle='rgba(230,240,255,.8)';c.lineWidth=3;c.beginPath();c.moveTo(x+k*40,y-k*160);c.lineTo(x+k*40+12,y-k*160-40);c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(x+k*40,y-k*160,4,0,TAU);c.fill()}
    else{const e=cl((p-t0)/.3,0,1),a=1-e;if(e<1){flash(c,x,y,a);ringE(c,x,y+6,10+46*e,4+16*e,'255,220,150',3,a);for(let j=0;j<6;j++){const ang=R(i*7+j)*TAU;c.fillStyle='rgba(200,210,230,'+a+')';c.fillRect(x+Math.cos(ang)*50*e,y+Math.sin(ang)*20*e-10*e,3,3)}}}});
});
ab('Терновая поляна','Навык · Дерево · массовый','Поляна терновника держит и травит врагов.','#62c15a',(c,p,t)=>{
  const e=ez(cl(p*1.5,0,1)),a=p>.85?1-(p-.85)/.15:1;
  disc(c,CX,CY+22,120*e,42*e,'40,110,40',.5*a);
  for(let i=0;i<14;i++){const ang=i/14*TAU+R(i),d=(30+70*R(i+2))*e,x=CX+Math.cos(ang)*d,y=CY+22+Math.sin(ang)*d*.35,h=(26+20*R(i+4))*e*a;
    c.strokeStyle='#2f5a22';c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+6*Math.sin(t*2+i),y-h*.6,x+(R(i+6)-.5)*14,y-h);c.stroke();
    c.strokeStyle='#7ac04a';c.lineWidth=1.6;c.stroke();
    c.fillStyle='#d8f0a0';for(let j=1;j<4;j++){const yy=y-h*j/4;c.beginPath();c.moveTo(x-1,yy);c.lineTo(x-7,yy-3);c.lineTo(x-1,yy-4);c.fill()}}
  c.lineCap='butt';
  for(let i=0;i<12;i++){const q=(t*.7+R(i))%1;c.fillStyle='rgba(170,230,110,'+((1-q)*.7*a)+')';c.beginPath();c.arc(CX+(R(i+3)-.5)*180*e,CY+22-q*60,2+R(i)*2,0,TAU);c.fill()}
});

const HERO=(c,x,y)=>{shadow(c,x,y+12,16,.5);c.fillStyle='#2a2f44';c.beginPath();c.arc(x,y,13,0,TAU);c.fill();c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=1.5;c.stroke()};
const FOE=(c,x,y,hit,col)=>{shadow(c,x,y+10,12,.4);c.fillStyle=hit?'rgba(214,95,142,.55)':(col||'#d65f8e');c.beginPath();c.arc(x,y,10,0,TAU);c.fill();c.fillStyle='#fff1a8';c.beginPath();c.arc(x-3,y-2,2,0,TAU);c.arc(x+3,y-2,2,0,TAU);c.fill()};
ab('Пылающий бумеранг','Навык · Огонь · бросок','Огненный бумеранг летит и возвращается.','#ff8a3d',(c,p,t)=>{
  disc(c,CX,CY+24,140,32,'60,20,5',.3);HERO(c,CX-120,CY+6);
  const k=p<.5?ez(p/.5):1-ez((p-.5)/.5),x=CX-110+k*230,y=CY-Math.sin(k*Math.PI)*30*(p<.5?1:-1);
  for(let i=1;i<8;i++){const kk=Math.max(0,k-i*.03*(p<.5?1:-1));glow(c,CX-110+kk*230,CY-Math.sin(kk*Math.PI)*30*(p<.5?1:-1),18-i*2,'#ff7a2b',.4*(1-i/8))}
  c.save();c.translate(x,y);c.rotate(t*18);c.globalCompositeOperation='lighter';glow(c,0,0,34,'#ff7a2b',.7);
  c.fillStyle='#ffb347';c.beginPath();c.arc(0,0,22,-1.3,1.3);c.arc(-9,0,17,1.1,-1.1,true);c.closePath();c.fill();
  c.fillStyle='#fff2b0';c.beginPath();c.arc(0,0,16,-1,1);c.arc(-6,0,13,.8,-.8,true);c.closePath();c.fill();c.restore();
  FOE(c,CX+60,CY-6,k>.75);FOE(c,CX+100,CY+16,k>.9);
});
ab('Огненный рывок','Навык · Огонь · ближний','Рывок сквозь врагов, след пламени.','#ff7a2b',(c,p,t)=>{
  disc(c,CX,CY+24,150,32,'60,20,5',.35);
  const k=ez(cl(p/.45,0,1)),x=CX-120+k*240;
  c.save();c.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const q=i/14;if(q>k)continue;flameAt(c,CX-120+q*240,CY+14,1.1*(1-cl(p-.45,0,1)*.9),t,i)}c.restore();
  FOE(c,CX-20,CY-14,k>.42);FOE(c,CX+40,CY+20,k>.66);
  for(let i=0;i<5;i++){c.globalAlpha=.25*(1-i/5);HERO(c,x-i*18,CY+4)}c.globalAlpha=1;HERO(c,x,CY+4);glow(c,x,CY+4,36,'#ff7a2b',.6);
});
ab('Огненный дождь','Навык · Огонь · массовый','Огненные капли падают на область.','#ff6a2b',(c,p,t)=>{
  disc(c,CX,CY+22,130,42,'90,25,5',.45);
  for(let i=0;i<16;i++){const q=(t*1.1+R(i))%1,x=CX+(R(i+2)-.5)*220,y=CY+22+(R(i+4)-.5)*50;
    if(q<.7){const k=q/.7,mx=x+(1-k)*40,my=y-(1-k)*170;c.save();c.translate(mx,my);c.rotate(Math.PI*.62);fireS(c,t+i,.55);c.restore()}
    else{const e=(q-.7)/.3;glow(c,x,y,30*(1-e)+8,'#ffb347',.8*(1-e));ringE(c,x,y,8+30*e,4+12*e,'255,160,60',2,1-e)}}
});
ab('Стена огня','Навык · Огонь · контроль','Стена пламени поперёк пути.','#ff7a2b',(c,p,t)=>{
  const e=ez(cl(p*2,0,1)),a=p>.85?1-(p-.85)/.15:1;
  disc(c,CX,CY+22,40,110*e,'90,25,5',.4*a);
  c.save();c.globalCompositeOperation='lighter';for(let i=0;i<12;i++){const y=CY-70+i*14*e+ (1-e)*70;flameAt(c,CX+(R(i)-.5)*10,y+20,(.6+.3*R(i+1))*a,t,i)}c.restore();
  for(let i=0;i<3;i++){const x=CX+90-((t*30+i*40)%80);FOE(c,x,CY-30+i*30,x<CX+30)}
});
ab('Пузырь','Навык · Вода · бросок','Пузырь запирает врагов в воде.','#6fd0ff',(c,p,t)=>{
  disc(c,CX,CY+22,130,34,'20,60,110',.3);HERO(c,CX-120,CY+6);
  const fl=cl(p/.5,0,1),x=CX-100+fl*190;
  if(p<.5){const r=16;const g2=rg(c,x-5,CY-5,r,[[0,'rgba(255,255,255,.9)'],[.4,'rgba(160,220,255,.25)'],[1,'rgba(90,170,255,.6)']]);c.fillStyle=g2;c.beginPath();c.arc(x,CY,r,0,TAU);c.fill();c.strokeStyle='rgba(220,245,255,.9)';c.lineWidth=1.5;c.stroke();FOE(c,CX+90,CY+4,false)}
  else{const e=ez((p-.5)/.5),bob=Math.sin(t*3)*4;FOE(c,CX+90,CY+4-e*18+bob,false);const r=26;const g2=rg(c,CX+84,CY-14-e*18+bob,r,[[0,'rgba(255,255,255,.5)'],[.5,'rgba(160,220,255,.18)'],[1,'rgba(90,170,255,.55)']]);c.fillStyle=g2;c.beginPath();c.arc(CX+90,CY+4-e*18+bob,r,0,TAU);c.fill();c.strokeStyle='rgba(220,245,255,.8)';c.lineWidth=1.5;c.stroke();
    for(let i=0;i<6;i++){const q=(t*.8+i/6)%1;c.fillStyle='rgba(220,245,255,'+(1-q)*.7+')';c.beginPath();c.arc(CX+80+R(i)*20,CY+10-q*50,2+R(i+3)*2,0,TAU);c.fill()}}
});
ab('Водяной хлыст','Навык · Вода · ближний','Широкий взмах водяным хлыстом.','#6fd0ff',(c,p,t)=>{
  disc(c,CX,CY+22,120,36,'20,60,110',.3);HERO(c,CX-60,CY+6);
  const k=ez(cl(p/.5,0,1)),a0=-1.1+k*2.2,a=p>.6?1-(p-.6)/.4:1;
  c.save();c.translate(CX-60,CY+6);c.globalCompositeOperation='lighter';
  for(let i=0;i<10;i++){const aa=-1.1+(a0+1.1)*(i/10);c.strokeStyle='rgba(120,200,255,'+(.08+.06*i)*a+')';c.lineWidth=14;c.beginPath();c.arc(0,0,140,aa-.08,aa);c.stroke()}
  c.strokeStyle='rgba(230,248,255,'+a+')';c.lineWidth=4;c.beginPath();c.arc(0,0,140,-1.1,a0);c.stroke();c.restore();
  for(let i=0;i<3;i++){const ang=-.8+i*.8,hit=a0>ang;FOE(c,CX-60+Math.cos(ang)*(140+(hit?30*k:0)),CY+6+Math.sin(ang)*(140+(hit?30*k:0))*.55,hit)}
});
ab('Водоворот','Навык · Вода · массовый','Воронка затягивает всех к центру.','#3aa7ff',(c,p,t)=>{
  const e=ez(cl(p*1.6,0,1)),a=p>.85?1-(p-.85)/.15:1;
  disc(c,CX,CY+22,120*e,44*e,'30,90,200',.5*a);
  c.save();c.translate(CX,CY+22);c.scale(1,.38);for(let i=0;i<5;i++){c.strokeStyle='rgba(150,215,255,'+(.6-i*.1)*a+')';c.lineWidth=3;c.beginPath();c.arc(0,0,(20+i*20)*e,t*4+i,t*4+i+4);c.stroke()}c.restore();
  funnel(c,CX,CY+18,70*e,46*e,t,'80,160,255','200,235,255');
  for(let i=0;i<4;i++){const ang=t*2+i*TAU/4,rr=(110-80*((t*.3+i*.25)%1))*e;FOE(c,CX+Math.cos(ang)*rr,CY+22+Math.sin(ang)*rr*.38,false)}
});
ab('Ледяная тюрьма','Навык · Вода · контроль','Область промерзает насквозь.','#bdf0ff',(c,p,t)=>{
  const e=ez(cl(p*1.8,0,1)),a=p>.85?1-(p-.85)/.15:1;
  disc(c,CX,CY+22,110*e,40*e,'150,220,255',.5*a);ringE(c,CX,CY+22,110*e,40*e,'220,245,255',2,.8*a);
  [[-50,6],[10,-6],[60,14],[-10,26]].forEach((q,i)=>{FOE(c,CX+q[0],CY+q[1],false,'#9fc8e0');c.globalAlpha=a;for(let j=0;j<5;j++)crystal(c,CX+q[0]+(R(i*5+j)-.5)*24,CY+q[1]+12,(14+R(j+i)*10)*e,5,-Math.PI/2+(R(j+3)-.5)*.8);c.globalAlpha=1});
  glow(c,CX,CY,90*e,'#bdf0ff',.3*a);
});
ab('Каменная дробь','Навык · Земля · бросок','Веер каменных осколков.','#c9974f',(c,p,t)=>{
  disc(c,CX,CY+22,120,32,'40,25,10',.35);HERO(c,CX-120,CY+6);
  const k=cl(p/.4,0,1);
  for(let i=0;i<8;i++){const a=(i/7-.5)*.7,d=20+200*ez(k),x=CX-110+Math.cos(a)*d,y=CY+4+Math.sin(a)*d;if(k<1)rockBit(c,x,y,4+R(i)*3,t*8+i,i);else puffs(c,x,y,10,'150,120,80',.5*(1-(p-.4)/.6))}
  if(p<.12)flash(c,CX-100,CY+4,1-p/.12);
  FOE(c,CX+70,CY-20,k>=1);FOE(c,CX+86,CY+24,k>=1);
});
ab('Удар молотом','Навык · Земля · ближний','Прыжок и удар при приземлении.','#c9974f',(c,p,t)=>{
  disc(c,CX,CY+24,140,36,'40,25,10',.4);
  const k=cl(p/.5,0,1),x=CX-110+ez(k)*200,h=Math.sin(k*Math.PI)*80;
  shadow(c,x,CY+18,16-h*.08,.5);
  c.fillStyle='#2a2f44';c.beginPath();c.arc(x,CY+6-h,13,0,TAU);c.fill();
  c.save();c.translate(x+10,CY-h-4);c.rotate(-1.2+k*2);c.fillStyle='#6a4a2a';c.fillRect(-2,-26,4,26);c.fillStyle='#8a8070';c.fillRect(-10,-34,20,12);c.restore();
  if(p>.5){const e=(p-.5)/.5;ringE(c,CX+90,CY+18,20+90*e,8+32*e,'230,200,140',5*(1-e)+1,1-e);for(let i=0;i<8;i++){const ang=i/8*TAU;spikeRock(c,CX+90+Math.cos(ang)*50*e,CY+18+Math.sin(ang)*20*e,(1-e)*24,8,i)}
    FOE(c,CX+40-e*20,CY-14,true);FOE(c,CX+140+e*20,CY+20,true)}else{FOE(c,CX+50,CY-10,false);FOE(c,CX+130,CY+20,false)}
});
ab('Метеорит','Навык · Земля · массовый','Огромный камень падает с неба.','#c9974f',(c,p,t)=>{
  disc(c,CX+20,CY+22,110,40,'40,25,10',.4);
  if(p<.6){const k=p/.6;ringE(c,CX+20,CY+22,100,36,'255,120,80',2,.5+.4*k);c.save();c.translate(CX+20+(1-k)*120,CY+10-(1-k)*200);for(let i=0;i<8;i++)glow(c,i*12,-i*20,30-i*3,'#ff9a3c',.4*(1-i/8));earthS(c,t,2.2,3);c.restore()}
  else{const e=(p-.6)/.4;flash(c,CX+20,CY+10,1-e);glow(c,CX+20,CY+10,140*(1-e*.5),'#ffd070',.8*(1-e));ringE(c,CX+20,CY+22,30+120*e,12+44*e,'255,210,150',6*(1-e)+1,1-e);for(let i=0;i<10;i++){const ang=R(i)*TAU;rockBit(c,CX+20+Math.cos(ang)*110*e,CY+14+Math.sin(ang)*40*e-Math.sin(e*Math.PI)*40,5+R(i)*5,t*6+i,i)}}
});
ab('Каменный голем','Навык · Земля · контроль','Голем отвлекает врагов и бьёт их.','#c9974f',(c,p,t)=>{
  disc(c,CX,CY+26,90,30,'40,25,10',.4);
  const e=ez(cl(p*2.5,0,1)),sl=Math.sin(t*3);
  c.save();c.translate(CX,CY+26-(1-e)*20);c.globalAlpha=e;
  c.fillStyle='#6a5a44';c.beginPath();c.ellipse(0,-30,30,30,0,0,TAU);c.fill();
  c.fillStyle='#8a7a5e';for(const sgn of[-1,1]){c.beginPath();c.ellipse(sgn*34,-26+sl*sgn*4,14,16,0,0,TAU);c.fill()}
  c.fillStyle='#4a3e30';c.fillRect(-14,-12,10,14);c.fillRect(4,-12,10,14);
  c.fillStyle='#ffd36b';glow(c,0,-36,14,'#ffd36b',.7);c.fillRect(-10,-40,20,5);
  c.strokeStyle='rgba(20,12,6,.6)';c.lineWidth=1.5;c.beginPath();c.moveTo(-10,-54);c.lineTo(-2,-44);c.lineTo(-12,-30);c.stroke();c.restore();c.globalAlpha=1;
  for(let i=0;i<4;i++){const ang=i/4*TAU+t*.3;FOE(c,CX+Math.cos(ang)*(90-20*e),CY+20+Math.sin(ang)*30,false)}
  c.fillStyle='#ffd36b';c.font='bold 22px sans-serif';c.textAlign='center';c.fillText('!',CX,CY-50);c.textAlign='left';
});
ab('Шаровая молния','Навык · Воздух · бросок','Шар молнии бьёт током по пути.','#f4f08a',(c,p,t)=>{
  disc(c,CX,CY+22,130,32,'40,40,20',.3);
  const x=CX-110+p*230,fl=(Math.floor(t*16)%2)?1:.6;
  [[-40,-30],[10,30],[60,-26],[100,24]].forEach((q,i)=>{const ex=CX+q[0],ey=CY+q[1],near=Math.abs(ex-x)<70;FOE(c,ex,ey,near);if(near)bolt(c,x,CY,ex,ey,Math.floor(t*14)+i,'#f4f08a',1.6,fl)});
  c.save();c.globalCompositeOperation='lighter';glow(c,x,CY,40,'#f4f08a',.8);glow(c,x,CY,16,'#ffffff',1);c.restore();
  for(let i=0;i<4;i++){const q=t*20+i*1.7;bolt(c,x,CY,x+Math.cos(q)*24,CY+Math.sin(q*1.3)*24,Math.floor(t*20)+i,'#fff6b0',1,fl)}
});
ab('Шквальный рывок','Навык · Воздух · ближний','Перенос с клинками на выходе.','#8febd0',(c,p,t)=>{
  disc(c,CX,CY+22,140,30,'40,90,80',.25);
  const jumped=p>.15;
  if(!jumped)HERO(c,CX-110,CY+6);else{c.globalAlpha=Math.max(0,.4-(p-.15));HERO(c,CX-110,CY+6);c.globalAlpha=1;HERO(c,CX+80,CY+6)}
  if(p>.12&&p<.45){const a=1-(p-.12)/.33;c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(200,255,240,'+a+')';c.lineWidth=10*a+2;c.beginPath();c.moveTo(CX-110,CY+6);c.lineTo(CX+80,CY+6);c.stroke();c.restore()}
  FOE(c,CX-30,CY+2,jumped);FOE(c,CX+20,CY+12,jumped);
  if(jumped){const e=ez(cl((p-.15)/.6,0,1));for(let i=0;i<8;i++){const ang=i/8*TAU;c.save();c.translate(CX+80+Math.cos(ang)*90*e,CY+6+Math.sin(ang)*36*e);c.rotate(ang);c.globalAlpha=1-e;airS(c,t,.42);c.restore()}c.globalAlpha=1}
});
ab('Ураган','Навык · Воздух · массовый','Смерч идёт по прямой и сметает всех.','#8febd0',(c,p,t)=>{
  disc(c,CX,CY+24,150,30,'40,90,80',.3);
  const x=CX-100+ez(p)*200;
  funnel(c,x,CY+20,130,60,t,'150,235,215','235,255,250');
  for(let i=0;i<4;i++){const ex=CX-40+i*50,taken=x>ex-30;if(taken){const ang=t*6+i*1.6;FOE(c,x+Math.cos(ang)*30,CY-10-i*14+Math.sin(ang)*8,true)}else FOE(c,ex,CY+(i%2?16:-6),false)}
});
ab('Отталкивающий порыв','Навык · Воздух · контроль','Порыв отшвыривает всех назад.','#e6fff7',(c,p,t)=>{
  disc(c,CX,CY+22,140,32,'40,90,80',.25);HERO(c,CX-110,CY+6);
  const k=ez(cl(p/.4,0,1)),a=1-cl((p-.3)/.7,0,1);
  c.save();c.translate(CX-110,CY+6);c.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const rr=40+i*30*k;c.strokeStyle='rgba(230,255,248,'+(.6-i*.08)*a+')';c.lineWidth=3;c.beginPath();c.arc(0,0,rr,-.7,.7);c.stroke()}c.restore();
  for(let i=0;i<3;i++){const ex=CX-20+i*30+k*140;FOE(c,ex,CY-30+i*30,k>.3)}
});
ab('Дисковая пила','Навык · Металл · бросок','Пила рикошетит между врагами.','#e8eef8',(c,p,t)=>{
  disc(c,CX,CY+22,130,36,'40,40,50',.35);HERO(c,CX-120,CY+6);
  const pts=[[CX-110,CY+4],[CX-30,CY-20],[CX+30,CY+24],[CX+80,CY-26],[CX+120,CY+16]];
  const seg=cl(p*1.2,0,.999)*(pts.length-1),i=Math.floor(seg),f=seg-i,x=pts[i][0]+(pts[i+1][0]-pts[i][0])*f,y=pts[i][1]+(pts[i+1][1]-pts[i][1])*f;
  for(let j=1;j<pts.length;j++)FOE(c,pts[j][0],pts[j][1],j<=i);
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(230,240,255,.35)';c.lineWidth=2;c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let j=1;j<=i;j++)c.lineTo(pts[j][0],pts[j][1]);c.lineTo(x,y);c.stroke();c.restore();
  c.save();c.translate(x,y);c.rotate(t*24);c.fillStyle='#cfd6e4';c.beginPath();for(let j=0;j<16;j++){const a=j/16*TAU,rr=j%2?14:11;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}c.closePath();c.fill();c.strokeStyle='#2a303e';c.stroke();c.fillStyle='#7a849a';c.beginPath();c.arc(0,0,6,0,TAU);c.fill();c.restore();
});
ab('Стальной вихрь','Навык · Металл · ближний','Пилы кружат вокруг героя.','#e8eef8',(c,p,t)=>{
  disc(c,CX,CY+22,100,36,'40,40,50',.35);HERO(c,CX,CY+6);
  const e=ez(cl(p*3,0,1)),a=p>.85?1-(p-.85)/.15:1;
  for(let i=0;i<4;i++){const ang=t*5+i*TAU/4,x=CX+Math.cos(ang)*60*e,y=CY+6+Math.sin(ang)*28*e;c.save();c.globalAlpha=a;c.translate(x,y);c.rotate(t*22+i);c.fillStyle='#cfd6e4';c.beginPath();for(let j=0;j<16;j++){const q=j/16*TAU,rr=j%2?12:9;c.lineTo(Math.cos(q)*rr,Math.sin(q)*rr)}c.closePath();c.fill();c.strokeStyle='#2a303e';c.stroke();c.restore()}
  c.globalAlpha=1;ringE(c,CX,CY+6,60*e,28*e,'230,240,255',1.5,.4*a);
  FOE(c,CX+90,CY-10,false);FOE(c,CX-86,CY+20,false);
});
ab('Орбитальный удар','Навык · Металл · массовый','Лучи с орбиты бьют по области.','#9fd0ff',(c,p,t)=>{
  disc(c,CX,CY+22,130,40,'30,40,60',.4);
  [[-70,10],[-10,-6],[50,16],[100,-4],[20,30]].forEach((q,i)=>{const t0=i*.14,x=CX+q[0],y=CY+q[1];
    if(p<t0)ringE(c,x,y,22,8,'160,210,255',1.5,.6);
    else{const e=cl((p-t0)/.25,0,1),a=1-e;c.save();c.globalCompositeOperation='lighter';c.fillStyle=lg(c,x-10,0,x+10,0,[[0,'rgba(120,190,255,0)'],[.5,'rgba(220,240,255,'+a+')'],[1,'rgba(120,190,255,0)']]);c.fillRect(x-10*(1-e*.5),-10,20*(1-e*.5),y+10);glow(c,x,y,50*a+10,'#9fd0ff',a);c.restore();ringE(c,x,y,10+40*e,4+14*e,'200,230,255',3*a+1,a)}});
});
ab('Минное поле','Навык · Металл · контроль','Мины взрываются под врагами.','#ffb347',(c,p,t)=>{
  disc(c,CX,CY+22,130,40,'40,40,50',.35);
  const mines=[[-70,10],[-10,24],[50,4],[100,22]],ex=CX+130-p*260;
  mines.forEach((q,i)=>{const x=CX+q[0],y=CY+q[1],boom=ex<x+10;
    if(!boom){c.fillStyle='#4a5266';c.beginPath();c.arc(x,y,9,0,TAU);c.fill();c.strokeStyle='#0a0c12';c.stroke();const bl=Math.floor(t*4+i)%2;c.fillStyle=bl?'#ff3a2a':'#5a1a14';c.beginPath();c.arc(x,y,3,0,TAU);c.fill();if(bl)glow(c,x,y,14,'#ff3a2a',.6)}
    else{const e=cl((x+10-ex)/80,0,1);if(e<1){flash(c,x,y,1-e);ringE(c,x,y+4,10+40*e,4+14*e,'255,200,120',3,1-e);glow(c,x,y,40*(1-e),'#ffb347',1-e)}}});
  FOE(c,ex,CY+10,false);
});
ab('Шипастый плод','Навык · Дерево · бросок','Плод разбрасывает ядовитые семена.','#9ad16a',(c,p,t)=>{
  disc(c,CX,CY+22,130,34,'30,70,30',.3);HERO(c,CX-120,CY+6);
  const k=cl(p/.45,0,1),x=CX-110+k*200,y=CY-Math.sin(k*Math.PI)*40;
  if(p<.45){c.save();c.translate(x,y);c.rotate(t*6);c.fillStyle='#7a3a8a';c.beginPath();c.arc(0,0,12,0,TAU);c.fill();c.fillStyle='#d8f0a0';for(let i=0;i<8;i++){const q=i/8*TAU;c.beginPath();c.moveTo(Math.cos(q-.2)*12,Math.sin(q-.2)*12);c.lineTo(Math.cos(q)*18,Math.sin(q)*18);c.lineTo(Math.cos(q+.2)*12,Math.sin(q+.2)*12);c.fill()}c.restore()}
  else{const e=ez((p-.45)/.55);puffs(c,CX+90,CY+4,40*(1-e)+10,'140,200,90',.6*(1-e));for(let i=0;i<8;i++){const ang=i/8*TAU,d=e*100;c.save();c.translate(CX+90+Math.cos(ang)*d,CY+4+Math.sin(ang)*d*.5);c.rotate(ang);woodS(c,t,.6);c.restore()}}
  FOE(c,CX+90,CY+4,p>.45,'#c86a9a');
});
ab('Удушающие лозы','Навык · Дерево · ближний','Лозы хватают и тянут врагов.','#62c15a',(c,p,t)=>{
  disc(c,CX,CY+22,120,36,'30,70,30',.35);HERO(c,CX-40,CY+6);
  const k=ez(cl(p/.35,0,1)),back=cl((p-.4)/.5,0,1);
  [[90,-30],[110,20],[60,40]].forEach((q,i)=>{const fx=CX-40+q[0]*(1-back*.6),fy=CY+6+q[1]*(1-back*.6);
    vine(c,CX-40,CY+6,CX-40+(fx-(CX-40))*k,CY+6+(fy-(CY+6))*k,t,4,6,true);FOE(c,fx,fy,back>0);
    if(back>0){c.strokeStyle='#3f8a36';c.lineWidth=2.5;c.beginPath();c.arc(fx,fy,12,0,TAU);c.stroke()}});
  if(back>.3)c.fillStyle='#8ff0b0',c.font='bold 16px sans-serif',c.fillText('+',CX-46,CY-20-back*20);
});
ab('Рой ос','Навык · Дерево · массовый','Рой ос сам находит врагов.','#ffd36b',(c,p,t)=>{
  disc(c,CX,CY+22,130,34,'30,70,30',.3);HERO(c,CX-120,CY+6);
  const foes=[[CX+40,CY-30],[CX+90,CY+10],[CX+20,CY+30]];foes.forEach((f,i)=>FOE(c,f[0],f[1],p>.6));
  for(let i=0;i<14;i++){const f=foes[i%3],k=cl(p*1.4-R(i)*.3,0,1),sx=CX-110,sy=CY+4,cx=sx+(R(i+1)-.3)*120,cy=sy+(R(i+2)-.5)*140;
    const x=(1-k)*(1-k)*sx+2*(1-k)*k*cx+k*k*(f[0]+Math.sin(t*20+i)*8),y=(1-k)*(1-k)*sy+2*(1-k)*k*cy+k*k*(f[1]+Math.cos(t*18+i)*8);
    c.save();c.translate(x,y);c.fillStyle='#ffd36b';c.beginPath();c.ellipse(0,0,5,3,0,0,TAU);c.fill();c.fillStyle='#2a2010';c.fillRect(-1,-3,1.5,6);c.fillRect(2,-3,1.5,6);c.fillStyle='rgba(230,250,255,.6)';c.beginPath();c.ellipse(-1,-4,3,1.5,-.5+Math.sin(t*60+i)*.4,0,TAU);c.fill();c.restore()}
});
ab('Древень-страж','Навык · Дерево · контроль','Древень лечит и стреляет шипами.','#62c15a',(c,p,t)=>{
  disc(c,CX-20,CY+26,90,30,'30,70,30',.4);
  const e=ez(cl(p*2.5,0,1));
  c.save();c.translate(CX-20,CY+26);c.scale(e,e);
  c.strokeStyle='#5a3a1a';c.lineWidth=6;c.lineCap='round';for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.5;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(Math.cos(a)*20,-30,Math.cos(a)*34+Math.sin(t*1.5+i)*3,-62+Math.abs(i-2)*10);c.stroke()}
  for(let i=0;i<8;i++){const a=i/8*TAU;c.fillStyle=i%2?'#3a8a3a':'#4aa04a';c.beginPath();c.arc(Math.cos(a)*26,-60+Math.sin(a)*18,16,0,TAU);c.fill()}
  c.fillStyle='#ffe27a';glow(c,0,-30,14,'#ffe27a',.7);c.beginPath();c.arc(-5,-30,3,0,TAU);c.arc(5,-30,3,0,TAU);c.fill();c.restore();c.lineCap='butt';
  ringE(c,CX-20,CY+26,90*e,30*e,'140,230,120',1.5,.5);
  HERO(c,CX-70,CY+18);c.fillStyle='#8ff0b0';c.font='bold 15px sans-serif';for(let i=0;i<3;i++){const q=(t*.8+i/3)%1;c.globalAlpha=1-q;c.fillText('+',CX-78+i*8,CY-q*40)}c.globalAlpha=1;
  if(p>.4){const k=((p-.4)*3)%1;c.save();c.translate(CX-10+k*140,CY-20+k*20);c.rotate(.15);c.fillStyle='#c8f090';c.beginPath();c.moveTo(8,0);c.lineTo(-5,-3);c.lineTo(-5,3);c.fill();c.restore()}
  FOE(c,CX+130,CY,p>.6);
});

const AB={};for(const x of ABL)AB[x.n]=x.f;
return {R,rg,lg,glow,shadow,ez,cl,AB,CX,CY,bolt,vine,funnel,spikeRock,rockBit,rockPoly,puffs,disc,ringE,crystal,flash,pistol,shotgun,rifle,sniper,smg,launcher,grenade,
 proj:{ice:iceS,fire:fireS,wave:waterS,blade:airS,bullet:metalS,seed:woodS},
 hit:{fire:fireH,wave:waterH,blade:airH,bullet:metalH,seed:woodH,rock:earthH},
 rock:earthS,trail:{fire:fireT,wave:waterT,blade:airT,bullet:metalT,seed:woodT,rock:earthT}};
})();
