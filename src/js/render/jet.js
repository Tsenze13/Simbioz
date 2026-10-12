
/* =====================================================================
   ОГНЕМЁТ — отрисовка непрерывной струи (вид «А», одобрен в лаборатории)
   ===================================================================== */
const JETN=x=>Math.sin(x*1.7)+Math.sin(x*3.1+1.3)*.5+Math.sin(x*7.3+.7)*.25;
const JET={e:[],last:0};
function jetBlob(x,y,r,col,a){ctx.globalAlpha=a;ctx.drawImage(glowSpr(col),x-r,y-r,2*r,2*r);ctx.globalAlpha=1}
function drawJet(g){
  const now=anim,dt=Math.min(0.05,Math.max(0,now-JET.last));JET.last=now;
  const J=g.jet,on=J&&J.t>0;if(J)J.t-=dt;
  const p=g.p;
  if(on){J.x=p.x;J.y=p.y}
  /* угольки и дым живут и после отпускания — дотухают */
  if(on&&Math.random()<0.7){const d=rnd(0.3,1)*J.len,o=rnd(-0.4,0.4)*J.arc*d;JET.e.push({x:J.x+Math.cos(J.ang)*d-Math.sin(J.ang)*o,y:J.y+Math.sin(J.ang)*d+Math.cos(J.ang)*o,vx:Math.cos(J.ang)*rnd(40,120),vy:rnd(-70,-20),l:rnd(0.3,0.7),k:Math.random()<0.3})}
  if(!on&&!JET.e.length)return;
  ctx.save();
  if(on){
    const L=J.len,t=now;
    ctx.save();ctx.translate(J.x+Math.cos(J.ang)*12,J.y+Math.sin(J.ang)*12);ctx.rotate(J.ang);ctx.globalCompositeOperation='lighter';
    const hw=Math.tan(J.arc/2);
    {
      const layer=(sc,len,cols,ph,a)=>{ctx.beginPath();ctx.moveTo(0,-3*sc);
        for(let s=0;s<=1.0001;s+=0.05){const w=(4+s*L*hw)*sc*(1+0.22*JETN(t*10+s*13+ph));ctx.lineTo(s*L*len,-w)}
        for(let s=1;s>=0;s-=0.05){const w=(4+s*L*hw)*sc*(1+0.22*JETN(t*11+s*11+ph+5));ctx.lineTo(s*L*len,w)}
        ctx.closePath();ctx.globalAlpha=a;const gr=ctx.createLinearGradient(0,0,L*len,0);cols.forEach(q=>gr.addColorStop(q[0],q[1]));ctx.fillStyle=gr;ctx.fill()};
      layer(1,1,[[0,'rgba(255,120,30,.9)'],[.6,'rgba(230,60,20,.55)'],[1,'rgba(150,20,10,0)']],0,.85);
      layer(.62,.86,[[0,'rgba(255,220,110,1)'],[.7,'rgba(255,140,40,.6)'],[1,'rgba(255,100,30,0)']],2,.9);
      layer(.26,.55,[[0,'rgba(255,255,240,1)'],[1,'rgba(255,230,150,0)']],4,1);
    }
    ctx.restore();
    ctx.globalCompositeOperation='lighter';jetBlob(J.x+Math.cos(J.ang)*14,J.y+Math.sin(J.ang)*14,34,'#ffb347',0.6);
  }
  ctx.globalCompositeOperation='lighter';
  for(const q of JET.e){q.x+=q.vx*dt;q.y+=q.vy*dt;q.l-=dt;
    if(q.k){ctx.globalCompositeOperation='source-over';jetBlob(q.x,q.y,10+(1-q.l)*14,'#3c3232',q.l*0.45);ctx.globalCompositeOperation='lighter'}
    else jetBlob(q.x,q.y,3,'#ffdc78',q.l*1.4)}
  JET.e=JET.e.filter(q=>q.l>0);
  ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}

/* =====================================================================
   НОВЫЕ ЭФФЕКТЫ (одобрено в лаборатории спрайтов):
   Стена огня — «Языки пламени», смерчи — «Плотная воронка», дожди/град — «Мягкие метки»,
   Огненный смерч — «Огненные кометы».
   ===================================================================== */
/* ---------- Стена огня ---------- */
function drawWalls(g){
  if(!g.walls||!g.walls.length)return;
  g.walls=g.walls.filter(w=>g.t<w.t0+w.dur);
  ctx.save();
  for(const w of g.walls){
    const age=g.t-w.t0,fade=Math.min(1,age/0.25,(w.t0+w.dur-g.t)/0.5),t=anim,dx=w.x1-w.x0,dy=w.y1-w.y0,L=Math.hypot(dx,dy)||1,cx=(w.x0+w.x1)/2,cy=(w.y0+w.y1)/2,ang=Math.atan2(dy,dx);
    if(!vis(cx,cy,L/2+60))continue;
    ctx.globalAlpha=fade;ctx.globalCompositeOperation='source-over';
    ctx.save();ctx.translate(cx,cy);ctx.rotate(ang);ctx.fillStyle='rgba(20,8,4,.5)';ctx.beginPath();ctx.ellipse(0,0,L/2+14,15,0,0,TAU);ctx.fill();
    ctx.globalCompositeOperation='lighter';const gr=ctx.createRadialGradient(0,0,0,0,0,L/2+22);gr.addColorStop(0,'rgba(255,120,30,.5)');gr.addColorStop(1,'rgba(255,60,10,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(0,0,L/2+22,24,0,0,TAU);ctx.fill();ctx.restore();
    ctx.globalCompositeOperation='lighter';
    const N=Math.max(6,Math.round(L/10));
    for(let i=0;i<N;i++){
      const k=i/(N-1),x=w.x0+dx*k-dy/L*Math.sin(i*5.3)*7,y=w.y0+dy*k+dx/L*Math.sin(i*5.3)*7;
      const h=(22+16*(.5+.5*JETN(t*2.6+i*1.9)))*Math.min(1,age*4),sw=Math.sin(t*5+i)*4,wd=10+4*Math.sin(i*3.3);
      for(const [sc,c0,c1,c2] of [[1,'rgba(255,170,50,.95)','rgba(240,80,25,.6)','rgba(160,30,10,0)'],[.55,'rgba(255,255,220,1)','rgba(255,210,100,.7)','rgba(255,160,50,0)']]){
        ctx.beginPath();ctx.moveTo(x-wd*sc,y);ctx.bezierCurveTo(x-wd*sc,y-h*sc*.45,x+sw-wd*sc*.3,y-h*sc*.75,x+sw*1.4,y-h*sc);ctx.bezierCurveTo(x+sw+wd*sc*.3,y-h*sc*.7,x+wd*sc,y-h*sc*.45,x+wd*sc,y);ctx.closePath();
        const lg=ctx.createLinearGradient(0,y,0,y-h*sc);lg.addColorStop(0,c0);lg.addColorStop(.55,c1);lg.addColorStop(1,c2);ctx.fillStyle=lg;ctx.fill()}
    }
    if(Math.random()<0.6&&g.pt.length<450){const k=Math.random();g.pt.push({x:w.x0+dx*k+rnd(-6,6),y:w.y0+dy*k,vx:rnd(-15,15),vy:rnd(-90,-50),life:rnd(.5,1),max:1,col:'#ffc864',size:2.2})}
  }
  ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
/* ---------- Смерч: плотная воронка ---------- */
const TORC={storm:['rgba(200,190,110,','rgba(255,250,210,'],fire:['rgba(200,80,30,','rgba(255,220,150,'],water:['rgba(60,130,220,','rgba(200,235,255,'],air:['rgba(90,170,150,','rgba(225,255,245,']};
function drawTornados(g){
  for(const t of g.tor){
    if(!vis(t.x,t.y,t.r*3))continue;
    const C=TORC[t.vis]||['rgba(150,120,80,','rgba(255,235,190,'],H=t.r*2.1,R=t.r*0.9,cx=t.x,cy=t.y+6,tm=anim+(t.ang||0);
    ctx.save();
    ctx.fillStyle=C[0]+'.3)';ctx.beginPath();ctx.ellipse(cx,cy,R*1.25,R*.42,0,0,TAU);ctx.fill();
    const Lp=[],Rp=[];for(let k=0;k<=1.001;k+=0.05){const r=R*(0.14+0.86*k),y=cy-k*H,off=Math.sin(tm*1.3+k*2)*R*0.2*k+JETN(tm*3+k*4)*R*0.04;Lp.push([cx-r+off,y]);Rp.push([cx+r+off,y])}
    ctx.beginPath();Lp.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));for(let i=Rp.length-1;i>=0;i--)ctx.lineTo(Rp[i][0],Rp[i][1]);ctx.closePath();
    const gr=ctx.createLinearGradient(cx-R,0,cx+R,0);gr.addColorStop(0,C[0]+'.28)');gr.addColorStop(.5,C[1]+'.5)');gr.addColorStop(1,C[0]+'.28)');ctx.fillStyle=gr;ctx.fill();
    ctx.save();ctx.clip();ctx.strokeStyle='rgba(255,255,255,.32)';ctx.lineWidth=Math.max(2,R*0.05);
    for(let i=0;i<14;i++){const y=cy-((i*H/12+tm*H*0.7)%(H*1.1));ctx.beginPath();ctx.moveTo(cx-R*1.3,y+R*.22);ctx.quadraticCurveTo(cx,y-R*.1,cx+R*1.3,y-R*.3);ctx.stroke()}ctx.restore();
    if(t.vis==='fire'||t.vis==='storm'){ctx.globalCompositeOperation='lighter';ctx.fillStyle=C[1]+'.12)';ctx.beginPath();Lp.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));for(let i=Rp.length-1;i>=0;i--)ctx.lineTo(Rp[i][0],Rp[i][1]);ctx.fill();ctx.globalCompositeOperation='source-over'}
    for(let i=0;i<10;i++){const q=(tm*.8+i*.173)%1,a=tm*6+i*1.7,rr=R*(.2+.9*q);ctx.fillStyle=C[0]+'.85)';ctx.save();ctx.translate(cx+Math.cos(a)*rr,cy-q*H*.9+Math.sin(a)*rr*.25);ctx.rotate(a*2);ctx.fillRect(-2,-1.4,4,2.8);ctx.restore()}
    if(Math.random()<0.4&&g.pt.length<450)g.pt.push({x:cx+rnd(-R,R),y:cy+rnd(-4,6),vx:rnd(-40,40),vy:rnd(-20,0),life:1,max:1,col:C[1].replace('rgba(','rgb(').replace(/,$/,')'),size:4});
    ctx.restore();
  }
}
/* ---------- Дожди и град: мягкие метки, падающий снаряд со следом, брызги ---------- */
function drawRainMark(b,pr){
  const R=b.r;ctx.save();ctx.globalCompositeOperation='lighter';
  const gr=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,R);gr.addColorStop(0,rgba(b.col,0.1+0.25*pr));gr.addColorStop(1,rgba(b.col,0));ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(b.x,b.y,R,R*.6,0,0,TAU);ctx.fill();
  const rr=R*(1-pr*0.75)+3;ctx.strokeStyle=rgba(b.col,0.35+0.5*pr);ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(b.x,b.y,rr,rr*.6,0,0,TAU);ctx.stroke();
  ctx.restore();
}
function drawRainDrop(b,pr,head){
  const k=1-pr,mx=b.x+k*40,my=b.y-k*240;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  const lg=ctx.createLinearGradient(mx,my,mx+14,my-60);lg.addColorStop(0,head);lg.addColorStop(1,rgba(b.col,0));ctx.strokeStyle=lg;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx+14,my-60);ctx.stroke();
  ctx.globalAlpha=0.95;ctx.drawImage(glowSpr(head),mx-7,my-7,14,14);ctx.restore();ctx.globalAlpha=1;
}
function rainSplash(b){const g=G;if(!g)return;(g.spl||(g.spl=[])).push({x:b.x,y:b.y,r:b.r,col:b.col,t:0});if(g.spl.length>30)g.spl.shift()}
function drawSplashes(g){
  if(!g.spl||!g.spl.length)return;ctx.save();ctx.globalCompositeOperation='lighter';
  for(const s of g.spl){s.t+=1/60;const k=s.t/0.45;if(k>=1)continue;ctx.strokeStyle=rgba(s.col,1-k);ctx.lineWidth=2.5;const R=s.r*(0.35+k*0.9);ctx.beginPath();ctx.ellipse(s.x,s.y,R,R*.6,0,0,TAU);ctx.stroke();
    for(let i=0;i<8;i++){const a=i*TAU/8,r=k*s.r*0.85;ctx.globalAlpha=1-k;ctx.drawImage(glowSpr(s.col),s.x+Math.cos(a)*r-3,s.y+Math.sin(a)*r*.6-Math.sin(k*Math.PI)*14-3,6,6)}ctx.globalAlpha=1}
  g.spl=g.spl.filter(s=>s.t<0.45);ctx.restore();ctx.globalCompositeOperation='source-over';
}
/* ---------- Огненный смерч: кометы ---------- */
function drawComet(b,a){
  ctx.save();ctx.globalCompositeOperation='lighter';const L=46;
  const lg=ctx.createLinearGradient(b.x,b.y,b.x-Math.cos(a)*L,b.y-Math.sin(a)*L);lg.addColorStop(0,'rgba(255,240,190,.95)');lg.addColorStop(.35,'rgba(255,150,50,.7)');lg.addColorStop(1,'rgba(220,60,20,0)');
  ctx.strokeStyle=lg;ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=b.r*1.9;ctx.beginPath();ctx.moveTo(b.x,b.y);
  if(b.curl){let x=b.x,y=b.y,vx=b.vx,vy=b.vy;const st=0.018,ca=-b.curl*st,cs=Math.cos(ca),sn=Math.sin(ca);for(let i=0;i<9;i++){x-=vx*st;y-=vy*st;const v=vx;vx=v*cs-vy*sn;vy=v*sn+vy*cs;ctx.lineTo(x,y)}}
  else ctx.lineTo(b.x-Math.cos(a)*L,b.y-Math.sin(a)*L);ctx.stroke();
  ctx.drawImage(glowSpr('#ffb347'),b.x-b.r*3,b.y-b.r*3,b.r*6,b.r*6);ctx.drawImage(glowSpr('#fff2c0'),b.x-b.r*1.4,b.y-b.r*1.4,b.r*2.8,b.r*2.8);
  ctx.restore();
}
function drawSpiralCore(g){
  for(const m of g.em){if(m.kind!=='spiral'||m.dead)continue;ctx.save();ctx.globalCompositeOperation='lighter';const r=46+6*Math.sin(anim*8);ctx.drawImage(glowSpr('#ff8a3a'),g.p.x-r,g.p.y-r,r*2,r*2);ctx.restore()}
}
