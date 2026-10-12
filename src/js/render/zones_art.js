/* =====================================================================
   ЗОНЫ НАВЫКОВ: Ледяная тюрьма (frostz), Ржавчина (rust), Древний корень (корни + thorns).
   Раньше они рисовались пустыми кругами.
   ===================================================================== */
const zh=(a,b)=>{const v=Math.sin(a*127.1+b*311.7)*43758.5453;return v-Math.floor(v)};
function zoneArt(z){
  if(z.kind==='frostz'){drawFrostZone(z);return true}
  if(z.kind==='rust'){drawRustZone(z);return true}
  if(z.kind==='thorns'){drawThornZone(z);return true}
  return false;
}
/* неровный круг по шуму */
function blobPath(x,y,r,seed,amp,n){ctx.beginPath();for(let i=0;i<=n;i++){const a=i/n*TAU,rr=r*(1-amp+amp*2*zh(seed,i%n));i?ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*0.92):ctx.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*0.92)}ctx.closePath()}

/* ---------- Ледяная тюрьма ---------- */
function drawFrostZone(z){
  const age=z.max-z.life,grow=Math.min(1,age/0.25),fade=Math.min(1,z.life/0.4),r=z.r*(0.3+0.7*(1-(1-grow)*(1-grow))),x=z.x,y=z.y,sd=Math.floor(Math.abs(x*7+y*13))%997;
  ctx.save();ctx.globalAlpha=fade;
  /* иней на земле */
  const gr=ctx.createRadialGradient(x,y,r*0.1,x,y,r);gr.addColorStop(0,'rgba(240,250,255,.4)');gr.addColorStop(.6,'rgba(170,220,255,.32)');gr.addColorStop(1,'rgba(120,190,250,.12)');
  ctx.fillStyle=gr;blobPath(x,y,r,sd,0.06,30);ctx.fill();
  ctx.strokeStyle='rgba(225,245,255,.7)';ctx.lineWidth=2;blobPath(x,y,r,sd,0.06,30);ctx.stroke();
  /* трещины льда */
  ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1.3;ctx.lineCap='round';
  for(let i=0;i<7;i++){let a=zh(sd,i+40)*TAU,px=x,py=y;ctx.beginPath();ctx.moveTo(px,py);
    for(let j=0;j<4;j++){a+=(zh(sd,i*9+j)-0.5)*0.9;const L=r*0.24;px+=Math.cos(a)*L;py+=Math.sin(a)*L*0.92;ctx.lineTo(px,py);
      if(j===1){ctx.moveTo(px,py);ctx.lineTo(px+Math.cos(a+0.8)*L*0.6,py+Math.sin(a+0.8)*L*0.55);ctx.moveTo(px,py)}}
    ctx.stroke()}
  /* снежинка в центре */
  ctx.save();ctx.translate(x,y);ctx.rotate(anim*0.3);ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=2;
  for(let i=0;i<6;i++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-r*0.28);ctx.moveTo(0,-r*0.17);ctx.lineTo(-r*0.06,-r*0.23);ctx.moveTo(0,-r*0.17);ctx.lineTo(r*0.06,-r*0.23);ctx.stroke()}
  ctx.restore();
  /* ледяные шипы по краю: растут при появлении, раскалываются в конце */
  const n=12+Math.floor(z.r/30);
  for(let i=0;i<n;i++){
    const a=i/n*TAU+zh(sd,i)*0.3,h=r*(0.15+0.12*zh(sd,i+77))*grow*fade,w=r*0.07,bx=x+Math.cos(a)*r*0.86,by=y+Math.sin(a)*r*0.8;
    const tx=bx+Math.cos(a)*h,ty=by+Math.sin(a)*h*0.8-h*0.45,nx=-Math.sin(a)*w,ny=Math.cos(a)*w;
    ctx.fillStyle='rgba(30,60,100,.25)';ctx.beginPath();ctx.moveTo(bx+nx,by+ny+4);ctx.lineTo(tx+6,ty+h*0.5);ctx.lineTo(bx-nx,by-ny+4);ctx.fill();
    ctx.fillStyle='#bfe8ff';ctx.beginPath();ctx.moveTo(bx+nx,by+ny);ctx.lineTo(tx,ty);ctx.lineTo(bx,by);ctx.closePath();ctx.fill();
    ctx.fillStyle='#7cc4f0';ctx.beginPath();ctx.moveTo(bx-nx,by-ny);ctx.lineTo(tx,ty);ctx.lineTo(bx,by);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(20,50,90,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bx+nx,by+ny);ctx.lineTo(tx,ty);ctx.lineTo(bx-nx,by-ny);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.moveTo(bx+nx*0.4,by+ny*0.4);ctx.lineTo(tx,ty);ctx.stroke();
  }
  /* холодный туман */
  ctx.globalCompositeOperation='lighter';
  for(let i=0;i<6;i++){const a=zh(sd,i+5)*TAU+anim*0.2*(i%2?1:-1),d=r*0.55*zh(sd,i+9);glow(x+Math.cos(a)*d,y+Math.sin(a)*d*0.8,r*0.42,'#cfefff',0.07*fade)}
  glow(x,y,r*0.9,'#9fe0ff',0.08*fade);
  ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.lineCap='butt';
}

/* ---------- Ржавчина ---------- */
function drawRustZone(z){
  const age=z.max-z.life,grow=Math.min(1,age/0.4),fade=Math.min(1,z.life/0.6),r=z.r*(0.4+0.6*grow),x=z.x,y=z.y,sd=Math.floor(Math.abs(x*5+y*11))%991;
  ctx.save();ctx.globalAlpha=fade;
  /* ржавые потёки на земле */
  ctx.fillStyle='rgba(120,60,24,.32)';blobPath(x,y,r*0.95,sd,0.12,24);ctx.fill();
  for(let i=0;i<9;i++){const a=zh(sd,i)*TAU,d=r*0.7*zh(sd,i+3),rr=r*(0.08+0.1*zh(sd,i+6));ctx.fillStyle=i%2?'rgba(150,70,25,.45)':'rgba(90,44,18,.5)';blobPath(x+Math.cos(a)*d,y+Math.sin(a)*d*0.9,rr,sd+i,0.25,10);ctx.fill()}
  /* едкое облако: клубы кружат вокруг центра */
  for(let i=0;i<10;i++){
    const a=zh(sd,i+20)*TAU+anim*(0.35+0.2*zh(sd,i))*(i%2?1:-1),d=r*(0.15+0.55*zh(sd,i+30)),rr=r*(0.32+0.22*zh(sd,i+40));
    const cx=x+Math.cos(a)*d,cy=y+Math.sin(a)*d*0.85-6;
    const g2=ctx.createRadialGradient(cx-rr*0.25,cy-rr*0.3,rr*0.1,cx,cy,rr);
    const dark=i%3===0;g2.addColorStop(0,dark?'rgba(110,60,30,.6)':'rgba(224,138,62,.58)');g2.addColorStop(.55,dark?'rgba(80,44,22,.32)':'rgba(170,92,40,.3)');g2.addColorStop(1,'rgba(120,60,30,0)');
    ctx.fillStyle=g2;ctx.beginPath();ctx.arc(cx,cy,rr,0,TAU);ctx.fill();
  }
  /* хлопья металла */
  for(let i=0;i<16;i++){const q=(anim*0.35+zh(sd,i+50))%1,a=zh(sd,i+60)*TAU,d=r*0.85*zh(sd,i+70),fx=x+Math.cos(a)*d+Math.sin(anim*2+i)*6,fy=y+Math.sin(a)*d*0.85-24+q*40;
    ctx.save();ctx.translate(fx,fy);ctx.rotate(anim*3+i);ctx.globalAlpha=fade*(1-q)*0.9;ctx.fillStyle=i%3?'#b5652a':'#e09a50';ctx.fillRect(-3,-2,6,4);ctx.fillStyle='rgba(60,30,10,.7)';ctx.fillRect(-3,1,6,1);ctx.restore()}
  /* пузыри коррозии */
  ctx.globalAlpha=fade;
  for(let i=0;i<5;i++){const q=(anim*0.8+i/5)%1,a=zh(sd,i+90)*TAU,d=r*0.6*zh(sd,i+95);ctx.strokeStyle='rgba(240,170,90,'+(0.6*(1-q)).toFixed(3)+')';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x+Math.cos(a)*d,y+Math.sin(a)*d*0.85,3+q*9,0,TAU);ctx.stroke()}
  /* граница зоны */
  ctx.strokeStyle='rgba(205,130,60,.55)';ctx.lineWidth=1.6;ctx.setLineDash([7,9]);ctx.lineDashOffset=-anim*10;ctx.beginPath();ctx.arc(x,y,z.r,0,TAU);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();ctx.globalAlpha=1;
}

/* ---------- Древний корень ---------- */
/* сужающийся корень по квадратичной кривой: от (x0,y0) к (x1,y1) через (cx,cy), ширина w → 2 */
function rootCurve(x0,y0,cx,cy,x1,y1,w,grow,col,dark){
  const N=14,pts=[];
  for(let i=0;i<=N;i++){const t=i/N*grow,u=1-t;pts.push([u*u*x0+2*u*t*cx+t*t*x1,u*u*y0+2*u*t*cy+t*t*y1,t])}
  const L=[],R=[];
  for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,ww=w*(1-pts[i][2]*0.85)/2;L.push([pts[i][0]-dy/l*ww,pts[i][1]+dx/l*ww]);R.push([pts[i][0]+dy/l*ww,pts[i][1]-dx/l*ww])}
  ctx.beginPath();L.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));for(let i=R.length-1;i>=0;i--)ctx.lineTo(R[i][0],R[i][1]);ctx.closePath();
  ctx.fillStyle=col;ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=1.6;ctx.stroke();
  /* светлая кромка и кольца коры */
  ctx.strokeStyle='rgba(230,190,130,.45)';ctx.lineWidth=1.3;ctx.beginPath();L.forEach((p,i)=>{const q=[(p[0]*2+pts[i][0])/3,(p[1]*2+pts[i][1])/3];i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.stroke();
  ctx.strokeStyle='rgba(40,22,8,.55)';ctx.lineWidth=1;for(let i=2;i<pts.length-1;i+=3){ctx.beginPath();ctx.moveTo(L[i][0],L[i][1]);ctx.lineTo(R[i][0],R[i][1]);ctx.stroke()}
  return pts[pts.length-1];
}
function leaf(x,y,a,s,col){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(s*0.5,-s*0.45,s,0);ctx.quadraticCurveTo(s*0.5,s*0.45,0,0);ctx.fill();ctx.strokeStyle='rgba(20,60,20,.7)';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(s*0.9,0);ctx.stroke();ctx.restore()}
/* предупреждение: земля трескается и светится зелёным */
function drawRootTele(b,pr){
  const x=b.x,y=b.y,r=b.r,sd=Math.floor(Math.abs(x*3+y*7))%983,sh=Math.sin(anim*40)*pr*1.5;
  ctx.save();ctx.lineCap='round';
  ctx.fillStyle='rgba(60,40,20,'+(0.25*pr).toFixed(3)+')';blobPath(x,y,r*0.9*pr+8,sd,0.1,20);ctx.fill();
  for(let i=0;i<9;i++){let a=i/9*TAU+zh(sd,i)*0.5,px=x+sh,py=y;const len=r*0.95*pr;
    ctx.beginPath();ctx.moveTo(px,py);for(let j=0;j<4;j++){a+=(zh(sd,i*5+j)-0.5)*0.7;px+=Math.cos(a)*len/4;py+=Math.sin(a)*len/4*0.9;ctx.lineTo(px,py)}
    ctx.strokeStyle='rgba(20,12,4,.8)';ctx.lineWidth=3.5;ctx.stroke();
    ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(140,240,110,'+(0.25+0.5*pr).toFixed(3)+')';ctx.lineWidth=1.4;ctx.stroke();ctx.globalCompositeOperation='source-over'}
  ctx.globalCompositeOperation='lighter';glow(x,y,r*0.6*pr+20,'#8ff06a',0.35*pr);
  ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.lineCap='butt';
}
/* извержение: из земли вырываются огромные корни и закручиваются наружу */
function drawRootBurst(h,p){
  const x=0,y=0,R=110*h.k,sd=Math.floor(Math.abs(h.x*3+h.y*7))%983; /* рисуется в локальных координатах (drawFx уже сдвинул холст) */
  const grow=Math.min(1,p/0.3),e=1-(1-grow)*(1-grow),sink=p>0.75?(p-0.75)/0.25:0;
  ctx.save();ctx.globalAlpha=1-sink*0.85;
  /* развороченная земля */
  ctx.fillStyle='rgba(50,32,16,.75)';blobPath(x,y,R*0.42*(0.6+0.4*e),sd,0.15,18);ctx.fill();
  ctx.fillStyle='rgba(20,12,6,.8)';blobPath(x,y,R*0.22*(0.6+0.4*e),sd+3,0.2,14);ctx.fill();
  /* корни */
  const n=6;
  for(let i=0;i<n;i++){
    const a=i/n*TAU+zh(sd,i)*0.6,side=i%2?1:-1,len=R*(0.75+0.25*zh(sd,i+11))*(1-sink*0.4);
    const x1=x+Math.cos(a)*len,y1=y+Math.sin(a)*len*0.85,cx=x+Math.cos(a+0.6*side)*len*0.55,cy=y+Math.sin(a+0.6*side)*len*0.5-R*0.25*e;
    const tip=rootCurve(x,y,cx,cy,x1,y1,R*0.32,e,i%3?'#7a5632':'#664626','rgba(25,14,6,.95)');
    if(e>0.8){leaf(tip[0],tip[1],a+0.5,9,'#5ac04a');leaf(tip[0],tip[1],a-0.6,7,'#3f9a38')}
  }
  /* главный ствол в центре */
  ctx.fillStyle='#4a3018';ctx.beginPath();ctx.ellipse(x,y-R*0.08*e,R*0.16,R*0.12,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(20,10,4,.9)';ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle='rgba(220,180,120,.4)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(x,y-R*0.08*e,R*0.09,R*0.065,0,0,TAU);ctx.stroke();
  /* комья земли и щепки */
  if(p<0.45){const q=p/0.45;for(let i=0;i<14;i++){const a=zh(sd,i+30)*TAU,d=R*(0.2+0.8*q)*zh(sd,i+31),hgt=Math.sin(q*Math.PI)*R*0.5*zh(sd,i+32);
    ctx.fillStyle=i%3?'#4a3420':'#6b8a3a';ctx.fillRect(x+Math.cos(a)*d-3,y+Math.sin(a)*d*0.85-hgt-3,6,6)}}
  ctx.globalCompositeOperation='lighter';glow(x,y,R*0.7,'#9bff6a',0.35*(1-p));
  ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
/* колючие лозы после корня: держат врагов */
function drawThornZone(z){
  const age=z.max-z.life,grow=Math.min(1,age/0.35),fade=Math.min(1,z.life/0.5),r=z.r,x=z.x,y=z.y,sd=Math.floor(Math.abs(x*9+y*5))%977;
  ctx.save();ctx.globalAlpha=fade;ctx.lineCap='round';
  ctx.fillStyle='rgba(40,60,24,.28)';blobPath(x,y,r*0.95,sd,0.1,22);ctx.fill();
  for(let i=0;i<7;i++){
    const a0=i/7*TAU+zh(sd,i)*0.4,side=i%2?1:-1,N=16;
    ctx.beginPath();
    for(let j=0;j<=N;j++){const t=j/N*grow,a=a0+t*1.6*side,d=r*0.12+r*0.82*t,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*0.88;j?ctx.lineTo(px,py):ctx.moveTo(px,py)}
    ctx.strokeStyle='#22381a';ctx.lineWidth=6;ctx.stroke();ctx.strokeStyle='#4f8a34';ctx.lineWidth=3.4;ctx.stroke();
    for(let j=2;j<=N;j+=2){const t=j/N*grow,a=a0+t*1.6*side,d=r*0.12+r*0.82*t,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*0.88,ta=a+Math.PI/2*side;
      ctx.fillStyle='#d8d0a0';ctx.beginPath();ctx.moveTo(px+Math.cos(ta+0.4)*3,py+Math.sin(ta+0.4)*3);ctx.lineTo(px+Math.cos(ta)*9,py+Math.sin(ta)*9);ctx.lineTo(px+Math.cos(ta-0.4)*3,py+Math.sin(ta-0.4)*3);ctx.fill();
      if(j%6===0)leaf(px,py,a-side*0.8,8,j%4?'#5ac04a':'#3f9a38')}
  }
  ctx.globalCompositeOperation='lighter';glow(x,y,r*0.8,'#62c15a',0.12+0.06*Math.sin(anim*3));
  ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.lineCap='butt';
}

SP.hit.root=(c,x,y,p,seed,h)=>drawRootBurst(h,p);
