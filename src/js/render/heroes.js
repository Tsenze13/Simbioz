/* ---------- герои (вид сверху, физика хвостов) ---------- */
// Герои для вида сверху. Рисуются лицом в +x. Вызов: HTD.draw(c,key,{ph,mv,t,dash})
// ph — фаза шага, mv — 0..1 движение, t — время, dash — рывок
const HTD=(function(){
const TAU=Math.PI*2;
const OUT='rgba(8,8,14,.9)';
function E(c,x,y,rx,ry,fill,st,lw,rot){c.beginPath();c.ellipse(x,y,rx,ry,rot||0,0,TAU);c.fillStyle=fill;c.fill();if(st!==0){c.strokeStyle=st||OUT;c.lineWidth=lw||1.1;c.stroke()}}
function P(c,pts,fill,st,lw){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=fill;c.fill();if(st!==0){c.strokeStyle=st||OUT;c.lineWidth=lw||1.1;c.lineJoin='round';c.stroke()}}
function RG(c,x,y,r,st){const g=c.createRadialGradient(x,y,0,x,y,r);for(const [o,col] of st)g.addColorStop(o,col);return g}
function LG(c,x1,y1,x2,y2,st){const g=c.createLinearGradient(x1,y1,x2,y2);for(const [o,col] of st)g.addColorStop(o,col);return g}
function glow(c,x,y,r,col,a){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=a;c.fillStyle=RG(c,x,y,r,[[0,col],[1,'rgba(0,0,0,0)']]);c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore()}
// ноги: шаг вперёд-назад
function feet(c,o,col,sz){
  sz=sz||1;
  for(const s of[-1,1]){
    const st=Math.sin(o.ph+(s>0?0:Math.PI))*6.5*o.mv;
    const lift=Math.max(0,Math.cos(o.ph+(s>0?0:Math.PI)))*o.mv;
    E(c,st-1,s*4.4,5.2*sz*(1+lift*.12),3.1*sz*(1+lift*.12),col);
  }
}
// руки качаются противофазно ногам
function arm(c,o,s,sh,hand,skin,sleeve,len){
  const sw=-Math.sin(o.ph+(s>0?0:Math.PI))*0.7*o.mv;
  let hx=(len||6)+sw+(o.hx||0),hy=s*(sh+1.5)+(o.hy||0)*s;
  if(o.pu){hx+=o.pu*Math.cos(o.pa||0);hy+=o.pu*Math.sin(o.pa||0)}
  c.strokeStyle=sleeve;c.lineWidth=5;c.lineCap='round';
  c.beginPath();c.moveTo(0,s*sh);c.quadraticCurveTo(hx*.6,s*(sh+3),hx,hy);c.stroke();c.lineCap='butt';
  E(c,hx,hy,3.1,3.1,skin);
  return [hx,hy];
}
function face(c,x,r,skin,eye){
  E(c,x,0,r,r*.95,RG(c,x-1,-2,r*1.5,[[0,skin[0]],[1,skin[1]]]));
  c.fillStyle=eye||'#14161f';
  c.beginPath();c.ellipse(x+r*.62,-r*.38,1,1.45,0,0,TAU);c.fill();
  c.beginPath();c.ellipse(x+r*.62,r*.38,1,1.45,0,0,TAU);c.fill();
}
const SK=['#f0c196','#c98a62'];
// анимация броска: замах → толчок → возврат. o.atk: 0..1 (или <0 — нет атаки)
function pk(o){const a=o.atk;if(a===undefined||a<0)return 0;return a<.3?-a/.3*3.2:a<.62?-3.2+(a-.3)/.32*13.5:10.3*(1-(a-.62)/.38)}
function ballK(o){const a=o.atk;if(a===undefined||a<0)return 1;return a<.45?1+a*.7:a<.8?0:(a-.8)/.2}
function pushed(o,extra){return Object.assign({},o,{pu:pk(o),pa:o.aim||0},extra||{})}
function bobOf(o){return Math.abs(Math.sin(o.ph))*1.1*o.mv}

/* ---------- физика хвостов: цепочки Верле в мировых координатах ---------- */
const DEF={
 fire:[...[0,1,2,3,4].map(i=>({n:'c'+i,ax:-4,ay:(i-2)*4.4,N:4,L:4.6,fan:(i-2)*.28,r:20,w:5})),
       ...[0,1,2,3,4].map(i=>({n:'h'+i,ax:-1.5,ay:(i-2)*2.7,N:3,L:3.4,fan:(i-2)*.42,r:26,w:6}))],
 water:[-1,1].map((s,i)=>({n:'r'+i,ax:-4,ay:s*6,N:9,L:2.7,fan:s*.12,r:11,w:2.2})),
 air:[{n:'s0',ax:-4,ay:0,N:13,L:2.6,fan:0,r:9,w:2.6}],
 wood:[0,1,2,3,4,5,6].map(i=>({n:'l'+i,ax:-5,ay:(i-3)*3.4,N:2,L:6.5,fan:(i-3)*.3,r:30,w:1.2}))
};
function mkSim(){return {init:false,last:null}}
function simStep(st,key,dt,x,y,face){
  const defs=DEF[key];if(!defs)return {};
  const cf=Math.cos(face),sf=Math.sin(face);
  if(!st.init||(st.last&&Math.hypot(x-st.last.x,y-st.last.y)>120)||st.key!==key){
    st.init=true;st.key=key;st.ch={};st.tm=0;
    for(const d of defs){
      const A={x:x+d.ax*cf-d.ay*sf,y:y+d.ax*sf+d.ay*cf},pts=[];
      for(let i=0;i<d.N;i++){const px=A.x-cf*d.L*i,py=A.y-sf*d.L*i;pts.push({x:px,y:py,px:px,py:py})}
      st.ch[d.n]=pts;
    }
    st.last={x,y,f:face};
  }
  const steps=Math.max(1,Math.ceil(dt/(1/120))),h=dt/steps,lx=st.last.x,ly=st.last.y,lf=st.last.f;
  let df=face-lf;while(df>Math.PI)df-=TAU;while(df<-Math.PI)df+=TAU;
  for(let sI=1;sI<=steps;sI++){
    const q=sI/steps,hx=lx+(x-lx)*q,hy=ly+(y-ly)*q,hf=lf+df*q,c0=Math.cos(hf),s0=Math.sin(hf);
    st.tm+=h;
    for(const d of defs){
      const pts=st.ch[d.n],A=pts[0];
      A.x=hx+d.ax*c0-d.ay*s0;A.y=hy+d.ax*s0+d.ay*c0;A.px=A.x;A.py=A.y;
      const ba=hf+Math.PI+d.fan,bx=Math.cos(ba),by=Math.sin(ba);
      const kk=1-Math.exp(-d.r*h);
      for(let i=1;i<pts.length;i++){
        const a1=pts[i-1],p=pts[i];
        let dx,dy;
        if(i===1){dx=bx;dy=by}else{const a2=pts[i-2];dx=a1.x-a2.x;dy=a1.y-a2.y;const m=Math.hypot(dx,dy)||1;dx/=m;dy/=m}
        // «хвост ведомый»: каждая точка тянется к месту позади предыдущей и по инерции отстаёт от героя
        const fl=Math.sin(st.tm*(4.2+i*.35)+i*1.7+d.ay*.9)*d.w*.14*i;
        const tx=a1.x+dx*d.L-dy*fl*.35,ty=a1.y+dy*d.L+dx*fl*.35;
        p.x+=(tx-p.x)*kk;p.y+=(ty-p.y)*kk;
        const ex=p.x-a1.x,ey=p.y-a1.y,m2=Math.hypot(ex,ey)||1e-6;
        p.x=a1.x+ex/m2*d.L;p.y=a1.y+ey/m2*d.L;
      }
    }
  }
  st.last={x,y,f:face};
  const out={},cf2=Math.cos(-face),sf2=Math.sin(-face);
  for(const d of defs)out[d.n]=st.ch[d.n].map(p=>{const dx=p.x-x,dy=p.y-y;return [dx*cf2-dy*sf2,dx*sf2+dy*cf2]});
  return out;
}
function chain(o,n,d){ // локальные точки цепочки (или запасная прямая)
  if(o.ch&&o.ch[n])return o.ch[n];
  const r=[];for(let i=0;i<d.N;i++)r.push([d.ax-d.L*i*Math.cos(d.fan),d.ay-d.L*i*Math.sin(d.fan)]);return r;
}
function defOf(key,n){return DEF[key].find(d=>d.n===n)}
function ribbon(c,pts,w0,w1,fill,stroke){
  const L=[],R=[];
  for(let i=0;i<pts.length;i++){
    const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];
    let dx=b[0]-a[0],dy=b[1]-a[1];const m=Math.hypot(dx,dy)||1;dx/=m;dy/=m;
    const w=(w0+(w1-w0)*(i/(pts.length-1)))/2;
    L.push([pts[i][0]-dy*w,pts[i][1]+dx*w]);R.push([pts[i][0]+dy*w,pts[i][1]-dx*w]);
  }
  c.beginPath();L.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));
  for(let i=R.length-1;i>=0;i--)c.lineTo(R[i][0],R[i][1]);c.closePath();
  c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=.8;c.lineJoin='round';c.stroke()}
}
function line(c,pts,col,w){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();c.lineCap='butt'}

const H={};
// ───────── ОГОНЬ: Пиромант
H.fire=function(c,o){
  const t=o.t,b=bobOf(o);
  feet(c,o,'#2a1410');
  // язык-плащ позади (физика)
  for(let i=0;i<5;i++){const d=defOf('fire','c'+i),pts=chain(o,'c'+i,d);
    ribbon(c,pts,7,1,LG(c,pts[0][0],pts[0][1],pts[3][0],pts[3][1],[[0,'#e8601e'],[1,'rgba(255,200,60,.3)']]))}
  E(c,-1,0,7,11.5,LG(c,0,-11,0,11,[[0,'#8a2a16'],[1,'#4a1410']]));
  P(c,[[-3,-3],[5,0],[-3,3]],'#ffb347',0);
  // наплечники-шипы
  for(const s of[-1,1]){P(c,[[0,s*8],[5,s*10],[1,s*15],[-4,s*11]],'#3a1410');P(c,[[1,s*9.5],[7,s*13.5],[1,s*16]],'#ff7a28',0)}
  const hl=arm(c,o,-1,9,0,SK[0],'#6a2012',5);
  const hr=arm(c,pushed(o,{hx:5,hy:-1}),1,9,0,SK[0],'#6a2012',6);
  // шар в правой руке
  {const bk=ballK(o);if(bk>.05){glow(c,hr[0]+3,hr[1]+1,14*bk,'#ff8a2a',.75);E(c,hr[0]+3,hr[1]+1,4.4*bk,4.4*bk,RG(c,hr[0]+3,hr[1]+1,5*bk,[[0,'#fff6c0'],[.5,'#ffb040'],[1,'#e0501a']]),0)}}
  // голова + пламя-волосы
  face(c,2.5,6.2,SK);
  for(let i=0;i<5;i++){const d=defOf('fire','h'+i),pts=chain(o,'h'+i,d);
    ribbon(c,pts,6.5,.6,LG(c,pts[0][0],pts[0][1],pts[2][0],pts[2][1],[[0,'#ffd24a'],[1,'#ff4a18']]))}
  E(c,.5,0,5.6,6.3,RG(c,0,0,8,[[0,'rgba(255,190,60,.0)'],[1,'rgba(255,90,30,.0)']]),0);
  // чёлка
  P(c,[[2,-6.2],[7.5,-3.5],[4,-3.2],[7,0],[3,-1.5],[0,-6.8]],'#ff8a2a',0);
  glow(c,0,0,30,'#ff7a28',.25);
};
// ───────── ВОДА: Мистик прилива
H.water=function(c,o){
  const t=o.t;
  feet(c,o,'#1a3a5a');
  // водяные ленты (физика)
  for(let i=0;i<2;i++){const pts=chain(o,'r'+i,defOf('water','r'+i));
    line(c,pts,'rgba(120,210,255,.85)',3.6);line(c,pts,'rgba(235,250,255,.75)',1.2)}
  E(c,-1,0,7,11,LG(c,0,-11,0,11,[[0,'#d8f1ff'],[1,'#58a8e0']]));
  c.strokeStyle='rgba(90,170,230,.8)';c.lineWidth=1;c.beginPath();c.moveTo(-6,0);c.lineTo(5,0);c.stroke();
  for(const s of[-1,1])E(c,-1,s*9.5,4.4,3.8,'#7ec8f0');
  const a1=arm(c,pushed(o,{hx:3}),-1,9,0,SK[0],'#cdeaff',8);
  const a2=arm(c,pushed(o,{hx:3}),1,9,0,SK[0],'#cdeaff',8);
  // сфера между руками
  const ox=Math.max(a1[0],a2[0])+4,oy=0;
  {const bk=ballK(o);if(bk>.05){glow(c,ox,oy,16*bk,'#5ac8ff',.7);
  E(c,ox,oy,4.8*bk,4.8*bk,RG(c,ox-1,oy-1,6*bk,[[0,'#ffffff'],[.4,'#8fe0ff'],[1,'#2a82d0']]),'rgba(30,100,170,.8)');
  for(let i=0;i<4;i++){const a=t*2.4+i*1.57;E(c,ox+Math.cos(a)*8*bk,Math.sin(a)*8*bk,1.2,1.2,'#dff6ff',0)}}}
  E(c,-.5,0,7.4,7.6,RG(c,-2,-2,10,[[0,'#bfe8ff'],[1,'#3f98d8']]));
  for(let i=0;i<3;i++){c.strokeStyle='rgba(235,250,255,.7)';c.lineWidth=.9;c.beginPath();c.arc(-.5,0,2.6+i*1.8,2.3,4)  ;c.stroke()}
  face(c,3.6,4.9,SK);
  c.strokeStyle='#e8fbff';c.lineWidth=1.4;c.beginPath();c.arc(1.6,0,6.3,-1.25,1.25);c.stroke();
  E(c,7.7,0,1.7,1.7,'#fff',0);glow(c,7.7,0,6,'#9ae8ff',.8);
  glow(c,0,0,30,'#3aa7ff',.22);
};
// ───────── ЗЕМЛЯ: Каменный страж
H.earth=function(c,o){
  const t=o.t;
  feet(c,Object.assign({},o,{mv:o.mv*.8}),'#3a2c1e',1.25);
  E(c,-1,0,8.6,13.5,LG(c,0,-13,0,13,[[0,'#8c7a58'],[1,'#52432e']]));
  // руны на спине
  c.strokeStyle='rgba(255,170,60,'+(.55+.25*Math.sin(t*2))+')';c.lineWidth=1.3;
  c.beginPath();c.moveTo(-6,-3);c.lineTo(-3,0);c.lineTo(-6,3);c.moveTo(-1,-4);c.lineTo(-1,4);c.stroke();
  // кулаки
  const a1=arm(c,Object.assign({},o,{mv:o.mv*.85}),-1,12,0,'#a07850','#5a4a32',7);
  const a2=arm(c,pushed(o,{mv:o.mv*.85}),1,12,0,'#a07850','#5a4a32',7);
  for(const a of[a1,a2]){E(c,a[0]+1,a[1],4.8,4.4,LG(c,a[0]-4,a[1]-4,a[0]+5,a[1]+4,[[0,'#a89572'],[1,'#5a4a32']]));c.fillStyle='rgba(0,0,0,.35)';c.fillRect(a[0]-1,a[1]-.4,5,.9)}
  // наплечники
  for(const s of[-1,1]){
    E(c,-1,s*12.5,7,6.2,RG(c,-3,s*11,10,[[0,'#bfae88'],[.6,'#7d6c4c'],[1,'#44382a']]));
    P(c,[[-3,s*13],[4,s*17],[2,s*11]],'#a89572');
    c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1;c.beginPath();c.moveTo(-5,s*10);c.lineTo(2,s*14);c.stroke();
  }
  // голова в шлеме-конусе
  E(c,2,0,7,6.8,RG(c,0,-2,10,[[0,'#c0ae86'],[1,'#5a4a32']]));
  E(c,6.6,0,1.2,4.4,'#1e160e',0);
  c.fillStyle='#ffb54a';c.fillRect(6.2,-2.8,1.4,1.4);c.fillRect(6.2,1.4,1.4,1.4);
  P(c,[[3,-2.4],[-7,0],[3,2.4]],'#d6c598');
  c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=.9;c.beginPath();c.arc(2,0,5,2,4.3);c.stroke();
  glow(c,0,0,32,'#c9974f',.2);
};
// ───────── ВОЗДУХ: Налётчик ветра
H.air=function(c,o){
  const t=o.t;
  // линии скорости
  if(o.mv>.2||o.dash){c.strokeStyle='rgba(200,255,240,.45)';c.lineWidth=1.2;for(let i=0;i<4;i++){const y=(i-1.5)*7,L=10+((t*60+i*13)%12);c.beginPath();c.moveTo(-12-i*2,y);c.lineTo(-12-i*2-L,y);c.stroke()}}
  feet(c,Object.assign({},o,{ph:o.ph*1.15}),'#0c2e2a',.9);
  // шарф (физика)
  {const pts=chain(o,'s0',defOf('air','s0'));line(c,pts,'#2fd0b0',4.2);line(c,pts,'#e6fff7',1.4)}
  E(c,-1,0,5.8,9.4,LG(c,0,-9,0,9,[[0,'#2a9a86'],[1,'#0f4a42']]));
  P(c,[[-1,-3],[4,0],[-1,3]],'#e6fff7',0);
  const sh=Math.sin(t*14)*0;
  const a1=arm(c,pushed(o,{hx:2,pa:(o.aim||0)+.5}),-1,8.2,0,'#cfeee6','#1f7a6a',6);
  const a2=arm(c,pushed(o,{hx:2,pa:(o.aim||0)-.5}),1,8.2,0,'#cfeee6','#1f7a6a',6);
  // клинки из воздуха
  for(const [a,s] of[[a1,-1],[a2,1]]){
    c.save();c.translate(a[0]+1.5,a[1]);c.rotate(s*0.35);
    glow(c,2,0,9,'#8febd0',.35);
    c.beginPath();c.arc(0,0,6.5,-1.25,1.25);c.arc(-2.6,0,5.6,1.05,-1.05,true);c.closePath();
    c.fillStyle=LG(c,-3,0,7,0,[[0,'rgba(120,230,200,.55)'],[1,'rgba(240,255,250,.95)']]);c.fill();
    c.strokeStyle='rgba(20,80,70,.7)';c.lineWidth=.6;c.stroke();
    c.restore();
  }
  // голова в маске и капюшоне
  E(c,0,0,7,6.6,RG(c,-1,-2,9,[[0,'#38b89c'],[1,'#12544a']]));
  P(c,[[-8,0],[-3,-2],[-3,2]],'#1f7a6a');
  E(c,4,0,3.8,4.6,'#e6fff7');
  E(c,5.6,0,1.9,3.4,'#0f2a2a',0);
  c.fillStyle='#9affe6';c.fillRect(5.6,-2.6,1.4,1.4);c.fillRect(5.6,1.2,1.4,1.4);
  glow(c,0,0,28,'#8febd0',.2);
};
// ───────── МЕТАЛЛ: Солдат
H.metal=function(c,o){
  const b=bobOf(o);
  feet(c,o,'#1c2216',1.15);
  // рюкзак
  P(c,[[-9,-6],[-4,-6.5],[-4,6.5],[-9,6]],'#4a5230');
  c.fillStyle='#2a3020';c.fillRect(-8,-.5,3.8,1);
  E(c,-1,0,6.8,11.5,LG(c,0,-11,0,11,[[0,'#5f6c3a'],[1,'#3a4424']]));
  // разгрузка
  c.fillStyle='#2e3620';c.fillRect(1,-8,2.2,16);c.fillStyle='#8a7a4a';for(const y of[-6,-2,2,6])c.fillRect(1.2,y-.8,1.8,1.6);
  for(const s of[-1,1])E(c,-1,s*9.5,4.2,3.7,'#4a5530');
  arm(c,Object.assign({},o,{hx:4}),-1,9.4,0,SK[0],'#4a5530',6);
  if(o.gun&&typeof SP!=='undefined'){
    const ar=o.gun.aim||0,ex=Math.cos(ar)*7-(o.gun.rec||0)*.4,ey=9.4+Math.sin(ar)*7;
    c.strokeStyle='#4a5530';c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(0,9.4);c.lineTo(ex,ey);c.stroke();c.lineCap='butt';
    c.save();c.translate(ex,ey);c.rotate(ar);c.scale(.3,.3);c.translate(-6,-1);SP.pistol(c,o.gun.fl||0);c.restore();
    E(c,ex,ey,3.1,3.1,SK[0]);
  }else arm(c,Object.assign({},o,{hx:4}),1,9.4,0,SK[0],'#4a5530',6);
  // лицо + каска
  face(c,2.5,6,SK);
  E(c,1,0,7.4,7.1,RG(c,-1,-2,10,[[0,'#7a8a4a'],[1,'#3e4a26']]));
  c.strokeStyle='rgba(20,26,12,.8)';c.lineWidth=1.2;c.beginPath();c.arc(1,0,7.4,-.9,.9);c.stroke();
  c.strokeStyle='rgba(180,200,120,.5)';c.lineWidth=1;c.beginPath();c.arc(1,0,5.4,2.3,4);c.stroke();
  P(c,[[3,0],[0,-2.8],[-3,0],[0,2.8]],'#e8c84a',0);
  P(c,[[8,-4],[11,-2.4],[11,2.4],[8,4],[7,0]],'#4e5c2e');
  // ремешок
  c.strokeStyle='#1c2210';c.lineWidth=.9;c.beginPath();c.moveTo(4,-5);c.lineTo(5.6,-2.4);c.moveTo(4,5);c.lineTo(5.6,2.4);c.stroke();
};
// ───────── ДЕРЕВО: Друид
H.wood=function(c,o){
  const t=o.t;
  feet(c,o,'#2a2210');
  // плащ из листьев (физика)
  for(let i=0;i<7;i++){const pts=chain(o,'l'+i,defOf('wood','l'+i)),p0=pts[0],p1=pts[1];
    const ang=Math.atan2(p1[1]-p0[1],p1[0]-p0[0]),mx=(p0[0]+p1[0])/2+Math.cos(ang)*2,my=(p0[1]+p1[1])/2+Math.sin(ang)*2;
    E(c,mx,my,5.4,2.7,i%2?'#3a9a3a':'#2a7a2e',OUT,.9,ang)}
  E(c,-1,0,7,11.5,LG(c,0,-11,0,11,[[0,'#3f7a36'],[1,'#254a22']]));
  E(c,-3,2,2.2,1.4,'#8ad25a',0,0,.4);E(c,0,-4,2,1.2,'#6ab04a',0,0,-.4);
  for(const s of[-1,1]){E(c,-1,s*10,4.8,3.6,'#2a6a28');E(c,-1,s*11.6,2.4,1.4,'#8ad25a',0,0,s*.5)}
  const a1=arm(c,o,-1,9,0,SK[1],'#2a6a28',6);
  const a2=arm(c,pushed(o,{hx:3}),1,9,0,SK[1],'#2a6a28',6);
  // светящееся семя в руке
  {const bk=ballK(o);if(bk>.05){glow(c,a2[0]+3,a2[1],13*bk,'#9aff5a',.6+.2*Math.sin(t*3));E(c,a2[0]+3,a2[1],3.2*bk,3.2*bk,RG(c,a2[0]+3,a2[1],4*bk,[[0,'#f4ffd0'],[1,'#58c040']]),0)}}
  // рога-ветви
  c.strokeStyle='#7a5430';c.lineCap='round';
  for(const s of[-1,1]){
    c.lineWidth=2.4;c.beginPath();c.moveTo(1,s*4);c.quadraticCurveTo(-2,s*11,5,s*17);c.stroke();
    c.lineWidth=1.6;c.beginPath();c.moveTo(-1.2,s*9);c.lineTo(-8,s*13);c.moveTo(1,s*13.5);c.lineTo(8,s*12);c.stroke();
    for(const [lx,ly] of[[5,s*17],[-8,s*13],[8,s*12]])E(c,lx,ly,2.6,1.3,'#8ad25a',OUT,.7,s*1.0);
  }
  c.lineCap='butt';
  E(c,0,0,7,6.8,RG(c,-1,-2,9,[[0,'#4a9a3e'],[1,'#1e4a1c']]));
  E(c,-3,-3,2.2,1.2,'#8ad25a',0,0,.6);E(c,-3,3,2.2,1.2,'#8ad25a',0,0,-.6);
  face(c,3.6,4.8,SK);
  E(c,7.4,0,1.9,2.6,'#58b04a',0);
  glow(c,0,0,30,'#58c040',.2);
};
function draw(c,key,o){
  o=Object.assign({ph:0,mv:0,t:0,dash:false},o);
  c.save();
  const lean=o.dash?1:0;
  if(lean)c.scale(1.15,.9);
  H[key](c,o);
  c.restore();
}
return {draw,keys:Object.keys(H),mkSim,step:simStep};
})();
