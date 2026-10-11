
/* =====================================================================
   ОГНЕМЁТ — отрисовка непрерывной струи (бета: три вида, SAVE.jetStyle = 'A'|'B'|'C')
   ===================================================================== */
const JETN=x=>Math.sin(x*1.7)+Math.sin(x*3.1+1.3)*.5+Math.sin(x*7.3+.7)*.25;
const JET={p:[],e:[],last:0};
function jetBlob(x,y,r,col,a){ctx.globalAlpha=a;ctx.drawImage(glowSpr(col),x-r,y-r,2*r,2*r);ctx.globalAlpha=1}
function jetCol(k){return k<.12?'#fffbe6':k<.3?'#ffe078':k<.55?'#ff9632':'#dc4619'}
function drawJet(g){
  const now=anim,dt=Math.min(0.05,Math.max(0,now-JET.last));JET.last=now;
  const J=g.jet,on=J&&J.t>0;if(J)J.t-=dt;
  const st=SAVE.jetStyle||'A',p=g.p;
  if(on){J.x=p.x;J.y=p.y}
  /* частицы (вид Б) и угольки/дым (все виды) живут и после отпускания — дотухают */
  if(on&&st==='B')for(let i=0;i<7;i++){const a=J.ang+(Math.random()-0.5)*J.arc*0.8,sp=J.len*rnd(1.6,2.1);JET.p.push({x:J.x+Math.cos(J.ang)*12,y:J.y+Math.sin(J.ang)*12,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,a:0,L:rnd(0.42,0.55)})}
  if(on&&Math.random()<0.7){const d=rnd(0.3,1)*J.len,o=rnd(-0.4,0.4)*J.arc*d;JET.e.push({x:J.x+Math.cos(J.ang)*d-Math.sin(J.ang)*o,y:J.y+Math.sin(J.ang)*d+Math.cos(J.ang)*o,vx:Math.cos(J.ang)*rnd(40,120),vy:rnd(-70,-20),l:rnd(0.3,0.7),k:Math.random()<0.3})}
  if(!on&&!JET.p.length&&!JET.e.length)return;
  ctx.save();
  if(on){
    const L=J.len,t=now;
    ctx.save();ctx.translate(J.x+Math.cos(J.ang)*12,J.y+Math.sin(J.ang)*12);ctx.rotate(J.ang);ctx.globalCompositeOperation='lighter';
    const hw=Math.tan(J.arc/2);
    if(st==='A'){
      const layer=(sc,len,cols,ph,a)=>{ctx.beginPath();ctx.moveTo(0,-3*sc);
        for(let s=0;s<=1.0001;s+=0.05){const w=(4+s*L*hw)*sc*(1+0.22*JETN(t*10+s*13+ph));ctx.lineTo(s*L*len,-w)}
        for(let s=1;s>=0;s-=0.05){const w=(4+s*L*hw)*sc*(1+0.22*JETN(t*11+s*11+ph+5));ctx.lineTo(s*L*len,w)}
        ctx.closePath();ctx.globalAlpha=a;const gr=ctx.createLinearGradient(0,0,L*len,0);cols.forEach(q=>gr.addColorStop(q[0],q[1]));ctx.fillStyle=gr;ctx.fill()};
      layer(1,1,[[0,'rgba(255,120,30,.9)'],[.6,'rgba(230,60,20,.55)'],[1,'rgba(150,20,10,0)']],0,.85);
      layer(.62,.86,[[0,'rgba(255,220,110,1)'],[.7,'rgba(255,140,40,.6)'],[1,'rgba(255,100,30,0)']],2,.9);
      layer(.26,.55,[[0,'rgba(255,255,240,1)'],[1,'rgba(255,230,150,0)']],4,1);
    }else if(st==='C'){
      ctx.lineCap='round';
      for(let i=0;i<3;i++)for(const [lw,col,a] of [[14,'rgba(230,70,20,',.35],[7,'rgba(255,160,50,',.6],[2.5,'rgba(255,245,200,',.9]]){
        ctx.beginPath();for(let x=0;x<=L;x+=6){const y=Math.sin(x*.045-t*16+i*2.1)*(3+x*hw*.6)+JETN(t*4+x*.02+i)*x*.03;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}
        const gr=ctx.createLinearGradient(0,0,L,0);gr.addColorStop(0,col+a+')');gr.addColorStop(.75,col+(a*.6)+')');gr.addColorStop(1,col+'0)');ctx.strokeStyle=gr;ctx.lineWidth=lw;ctx.stroke()}
      const gr=ctx.createLinearGradient(0,0,L*.5,0);gr.addColorStop(0,'rgba(255,255,230,.9)');gr.addColorStop(1,'rgba(255,200,100,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(L*.22,0,L*.24,9,0,0,TAU);ctx.fill();
    }
    ctx.restore();
    ctx.globalCompositeOperation='lighter';jetBlob(J.x+Math.cos(J.ang)*14,J.y+Math.sin(J.ang)*14,34,'#ffb347',0.6);
  }
  ctx.globalCompositeOperation='lighter';
  for(const q of JET.p){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=0.985;q.vy=q.vy*0.985-30*dt;q.a+=dt;const k=q.a/q.L;
    if(k>0.8){ctx.globalCompositeOperation='source-over';jetBlob(q.x,q.y,8+k*26,'#322a2a',(1-k)*1.2);ctx.globalCompositeOperation='lighter'}
    else jetBlob(q.x,q.y,3+k*24,jetCol(k),0.55*(1-k*0.6))}
  JET.p=JET.p.filter(q=>q.a<q.L);
  for(const q of JET.e){q.x+=q.vx*dt;q.y+=q.vy*dt;q.l-=dt;
    if(q.k){ctx.globalCompositeOperation='source-over';jetBlob(q.x,q.y,10+(1-q.l)*14,'#3c3232',q.l*0.45);ctx.globalCompositeOperation='lighter'}
    else jetBlob(q.x,q.y,3,'#ffdc78',q.l*1.4)}
  JET.e=JET.e.filter(q=>q.l>0);
  if(JET.p.length>400)JET.p.splice(0,JET.p.length-400);
  ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
