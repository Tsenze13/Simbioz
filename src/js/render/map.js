/* ---------- карта: текстуры, земля, декор, препятствия ---------- */
const TEX={},PATS={};
function mapTex(id){
  if(TEX[id])return TEX[id];
  const M=MAPS[id],R=mulberry(hash32(5,9,MAPK.indexOf(id)+31));
  const mk=(sz,fn)=>{const c=document.createElement('canvas');c.width=c.height=sz;const x=c.getContext('2d');fn(x,sz);return c};
  const blobs=(x,s,n,rmin,rmax,cols,amin,amax)=>{
    for(let i=0;i<n;i++){
      const px=R()*s,py=R()*s,r=rmin+R()*(rmax-rmin),col=cols[Math.floor(R()*cols.length)],al=amin+R()*(amax-amin);
      for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){
        const qx=px+ox*s,qy=py+oy*s;
        if(qx<-r||qy<-r||qx>s+r||qy>s+r)continue;
        const g=x.createRadialGradient(qx,qy,0,qx,qy,r);
        g.addColorStop(0,rgba(col,al));g.addColorStop(1,rgba(col,0));
        x.fillStyle=g;x.fillRect(qx-r,qy-r,r*2,r*2);
      }
    }
  };
  const a=mk(512,(x,sz)=>{
    x.fillStyle=M.base;x.fillRect(0,0,sz,sz);
    blobs(x,sz,70,30,100,[M.mid,M.acc],0.15,0.4);
    for(let i=0;i<700;i++){x.fillStyle=rgba(R()<0.5?M.acc:'#000000',0.10+R()*0.16);const q=1+R()*2.2;x.fillRect(R()*sz,R()*sz,q,q)}
    M.tex(x,sz,R);
  });
  const b=mk(1024,(x,sz)=>{blobs(x,sz,16,140,360,['#000000',M.acc,'#000000'],0.10,0.22)});
  TEX[id]={a:a,b:b};
  return TEX[id];
}
function groundPat(id){
  if(PATS[id])return PATS[id];
  const t=mapTex(id);
  PATS[id]={a:ctx.createPattern(t.a,'repeat'),b:ctx.createPattern(t.b,'repeat')};
  return PATS[id];
}
function drawGround(g,MP,cx,cy){
  const P=groundPat(g.map);
  ctx.fillStyle=P.a;ctx.fillRect(cx-3,cy-3,VW+6,VH+6);
  ctx.fillStyle=P.b;ctx.fillRect(cx-3,cy-3,VW+6,VH+6);
}
function blobPoly(x,y,r,seed,n,j){
  ctx.beginPath();
  for(let i=0;i<n;i++){const a=i*TAU/n,rr=r*(1-j+j*2*hv(seed*131+i*1.7));const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py)}
  ctx.closePath();
}
function drawDecor(g,MP){
  const dk=MP.decor;
  ctx.lineCap='round';
  for(const d of g.decors){
    if(!vis(d.x,d.y,30))continue;
    const pu=0.5+0.5*Math.sin(anim*2.4+d.s*20);
    if(dk==='ash'){
      if(d.k===0){ctx.fillStyle='#2b2a37';ctx.beginPath();ctx.ellipse(d.x,d.y,d.r*1.4,d.r,d.a,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.07)';ctx.beginPath();ctx.ellipse(d.x-1,d.y-1,d.r*0.8,d.r*0.5,d.a,0,TAU);ctx.fill()}
      else if(d.k===1){ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x+Math.cos(d.a)*d.r*4,d.y+Math.sin(d.a)*d.r*4);ctx.lineTo(d.x+Math.cos(d.a+0.5)*d.r*7,d.y+Math.sin(d.a+0.5)*d.r*7);ctx.stroke()}
      else{ctx.globalCompositeOperation='lighter';glow(d.x,d.y,9+d.r,'#ff7a3a',0.18+0.25*pu);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
    }else if(dk==='forest'){
      if(d.k===0){ctx.strokeStyle='#3d8a3f';ctx.lineWidth=1.6;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(d.x+i*3,d.y);ctx.lineTo(d.x+i*6+Math.sin(anim+d.s*9)*1.5,d.y-8-d.r);ctx.stroke()}}
      else if(d.k===1){ctx.strokeStyle='#2f6a35';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x,d.y-6);ctx.stroke();ctx.fillStyle=d.s<0.5?'#e8c3ff':'#ffe08a';ctx.beginPath();ctx.arc(d.x,d.y-7,2.4,0,TAU);ctx.fill()}
      else{ctx.fillStyle='#cfe8d4';ctx.beginPath();ctx.arc(d.x,d.y,2.4,0,TAU);ctx.fill();ctx.globalCompositeOperation='lighter';glow(d.x,d.y,16,'#8ae0b0',0.25+0.3*pu);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
    }else if(dk==='ice'){
      if(d.k===0){ctx.strokeStyle='rgba(220,245,255,.28)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x+Math.cos(d.a)*d.r*3,d.y+Math.sin(d.a)*d.r*3);ctx.lineTo(d.x+Math.cos(d.a-0.6)*d.r*6,d.y+Math.sin(d.a-0.6)*d.r*6);ctx.stroke()}
      else if(d.k===1){ctx.fillStyle='rgba(235,248,255,.10)';ctx.beginPath();ctx.ellipse(d.x,d.y,d.r*4,d.r*2.4,d.a,0,TAU);ctx.fill()}
      else{ctx.globalCompositeOperation='lighter';glow(d.x,d.y,8,'#ffffff',0.1+0.5*Math.max(0,Math.sin(anim*1.6+d.s*30)));ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
    }else if(dk==='dunes'){
      if(d.k===0){ctx.fillStyle='#4a3b22';ctx.beginPath();ctx.ellipse(d.x,d.y,d.r*1.5,d.r,d.a,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,230,170,.12)';ctx.beginPath();ctx.ellipse(d.x-1,d.y-1,d.r*0.9,d.r*0.5,d.a,0,TAU);ctx.fill()}
      else if(d.k===1){ctx.strokeStyle='#b09a52';ctx.lineWidth=1.3;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(d.x+i*2,d.y);ctx.lineTo(d.x+i*5+Math.sin(anim*1.4+d.s*9)*1.6,d.y-7-d.r);ctx.stroke()}}
      else{ctx.strokeStyle='rgba(255,230,170,.2)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(d.x,d.y,d.r*3,Math.PI*1.1,Math.PI*1.9);ctx.stroke()}
    }else if(dk==='storm'){
      if(d.k===0){ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.a);ctx.fillStyle='#2a3047';ctx.fillRect(-d.r*2,-d.r,d.r*4,d.r*2);ctx.fillStyle='rgba(180,200,255,.18)';ctx.fillRect(-d.r*2,-d.r,d.r*4,2);ctx.restore()}
      else if(d.k===1){ctx.fillStyle='rgba(60,90,170,.35)';ctx.beginPath();ctx.ellipse(d.x,d.y,d.r*3,d.r*1.6,d.a,0,TAU);ctx.fill()}
      else{ctx.globalCompositeOperation='lighter';glow(d.x,d.y,10,'#f4f08a',0.05+0.5*Math.max(0,Math.sin(anim*2.2+d.s*40)));ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
    }else{
      if(d.k===0){ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x+Math.cos(d.a)*d.r*4,d.y+Math.sin(d.a)*d.r*4);ctx.stroke();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,100,40,'+(0.15+0.25*pu).toFixed(3)+')';ctx.lineWidth=1.2;ctx.stroke();ctx.globalCompositeOperation='source-over'}
      else if(d.k===1){ctx.fillStyle='#2a1a1a';ctx.beginPath();ctx.ellipse(d.x,d.y,d.r*1.3,d.r,d.a,0,TAU);ctx.fill()}
      else{ctx.globalCompositeOperation='lighter';glow(d.x,d.y,10,'#ff6a2b',0.15+0.3*pu);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
    }
  }
}
function drawPools(g,MP){
  for(const p of g.pools){
    if(!vis(p.x,p.y,p.r+60))continue;
    if(p.kind==='lava'){
      const pu=0.5+0.5*Math.sin(anim*2+p.s*9);
      ctx.fillStyle='#0f0606';blobPoly(p.x,p.y,p.r*1.08,p.s,14,0.14);ctx.fill();
      const gr=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
      gr.addColorStop(0,'#fff0a8');gr.addColorStop(0.3,'#ffa22b');gr.addColorStop(0.75,'#d2401a');gr.addColorStop(1,'#5a1410');
      ctx.fillStyle=gr;blobPoly(p.x,p.y,p.r,p.s,14,0.14);ctx.fill();
      ctx.fillStyle='rgba(255,230,140,.55)';
      for(let i=0;i<4;i++){const k=(anim*0.35+p.s*7+i*0.25)%1,a=p.s*20+i*1.9,rr=p.r*0.55*hv(p.s*50+i);ctx.globalAlpha=Math.sin(k*Math.PI)*0.8;ctx.beginPath();ctx.arc(p.x+Math.cos(a)*rr,p.y+Math.sin(a)*rr,3+k*6,0,TAU);ctx.fill()}
      ctx.globalAlpha=1;
      ctx.globalCompositeOperation='lighter';glow(p.x,p.y,p.r*2,'#ff6a2b',0.3+0.15*pu);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    }else if(p.kind==='quicksand'){
      ctx.fillStyle='rgba(30,20,8,.55)';blobPoly(p.x,p.y,p.r*1.04,p.s,13,0.16);ctx.fill();
      const gr=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
      gr.addColorStop(0,'rgba(60,40,16,.9)');gr.addColorStop(0.6,'rgba(150,115,60,.75)');gr.addColorStop(1,'rgba(190,150,85,.45)');
      ctx.fillStyle=gr;blobPoly(p.x,p.y,p.r,p.s,13,0.16);ctx.fill();
      ctx.strokeStyle='rgba(230,200,140,.4)';ctx.lineWidth=1.5;
      for(let i=1;i<=4;i++){const k=((anim*0.18+i/4)%1);ctx.globalAlpha=1-k;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*k,p.r*k*0.82,p.s*3,0,TAU);ctx.stroke()}
      ctx.globalAlpha=1;
    }else if(p.kind==='puddle'){
      ctx.fillStyle='rgba(8,14,34,.8)';blobPoly(p.x,p.y,p.r,p.s,12,0.18);ctx.fill();
      const gr=ctx.createLinearGradient(p.x-p.r,p.y-p.r,p.x+p.r,p.y+p.r);
      gr.addColorStop(0,'rgba(90,120,200,.30)');gr.addColorStop(0.5,'rgba(30,50,110,.1)');gr.addColorStop(1,'rgba(150,180,255,.28)');
      ctx.fillStyle=gr;blobPoly(p.x,p.y,p.r*0.96,p.s,12,0.18);ctx.fill();
      ctx.strokeStyle='rgba(170,200,255,.5)';ctx.lineWidth=1.6;
      for(let i=0;i<3;i++){const k=((anim*0.5+i/3+p.s)%1);ctx.globalAlpha=(1-k)*0.8;ctx.beginPath();ctx.ellipse(p.x+Math.cos(p.s*30+i*2)*p.r*0.3,p.y+Math.sin(p.s*30+i*2)*p.r*0.2,k*p.r*0.35,k*p.r*0.2,0,0,TAU);ctx.stroke()}
      ctx.globalAlpha=1;
      ctx.strokeStyle='rgba(120,150,230,.45)';ctx.lineWidth=2;blobPoly(p.x,p.y,p.r,p.s,12,0.18);ctx.stroke();
    }else{
      ctx.fillStyle='rgba(18,46,22,.6)';blobPoly(p.x,p.y,p.r,p.s,13,0.2);ctx.fill();
      ctx.strokeStyle='rgba(74,138,58,.75)';ctx.lineWidth=2;ctx.lineCap='round';
      const nt=Math.floor(p.r/4);
      for(let i=0;i<nt;i++){
        const a=i*TAU/nt+p.s*9,rr=p.r*(0.35+0.6*hv(p.s*77+i)),x0=p.x+Math.cos(a)*rr,y0=p.y+Math.sin(a)*rr,sw=Math.sin(anim*1.5+i)*1.2;
        ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x0+Math.cos(a+1.2)*9+sw,y0+Math.sin(a+1.2)*9);ctx.moveTo(x0,y0);ctx.lineTo(x0+Math.cos(a-1.0)*7,y0+Math.sin(a-1.0)*7+sw);ctx.stroke();
      }
      ctx.setLineDash([6,7]);ctx.strokeStyle='rgba(110,190,90,.4)';blobPoly(p.x,p.y,p.r,p.s,13,0.2);ctx.stroke();ctx.setLineDash([]);
    }
  }
}
function scorchPolys(s){
  const out=[];
  const grow=(x,y,ang,len,depth,seed)=>{
    const n=5,pts=[[x,y]];let px=x,py=y,an=ang;
    for(let j=1;j<=n;j++){
      an+=(hv(seed+j*3.1)-0.5)*0.85;
      px+=Math.cos(an)*len/n;py+=Math.sin(an)*len/n;pts.push([px,py]);
      if(depth<2&&j>=2&&j<n&&hv(seed+j*7.7)>0.38){
        const side=hv(seed+j*5.3)>0.5?1:-1;
        grow(px,py,an+side*(0.55+hv(seed+j)*0.7),len*0.55,depth+1,seed*1.7+j*13);
      }
    }
    out.push({p:pts,d:depth});
  };
  const n=6+Math.floor(hv(s.seed)*3);
  for(let i=0;i<n;i++)grow(0,0,i*TAU/n+hv(s.seed+i)*0.7,s.r*(0.85+hv(s.seed+i*2)*0.5),0,s.seed+i*31);
  const blob=[];
  for(let i=0;i<12;i++){const a=i/12*TAU,r=s.r*(0.42+hv(s.seed+i*4)*0.28);blob.push([Math.cos(a)*r,Math.sin(a)*r])}
  s.poly={lines:out,blob:blob};
}
function drawScorch(g){
  for(const s of g.sc){
    if(!vis(s.x,s.y,s.r*1.6))continue;
    const k=clamp(s.life/s.max*1.4,0,1);
    ctx.save();ctx.translate(s.x,s.y);ctx.scale(1,0.8);
    if(!s.crack){
      ctx.fillStyle='rgba(8,6,10,'+(0.4*k).toFixed(3)+')';ctx.beginPath();ctx.arc(0,0,s.r,0,TAU);ctx.fill();
      ctx.strokeStyle=rgba(gcol(s.col),0.35*k);ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,s.r*0.9,0,TAU);ctx.stroke();
    }else{
      if(!s.poly)scorchPolys(s);
      const heat=clamp((s.life/s.max-0.55)*2.4,0,1),L=s.poly;
      /* копоть */
      ctx.fillStyle=rg0(0,0,s.r*1.15,[[0,'rgba(4,3,6,'+(0.78*k)+')'],[0.6,'rgba(10,8,12,'+(0.5*k)+')'],[1,'rgba(10,8,12,0)']]);
      ctx.beginPath();ctx.arc(0,0,s.r*1.15,0,TAU);ctx.fill();
      /* оплавленное пятно */
      ctx.fillStyle='rgba(18,14,20,'+(0.85*k)+')';ctx.beginPath();L.blob.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(120,100,90,'+(0.25*k)+')';ctx.lineWidth=1.2;ctx.stroke();
      /* трещины: тёмное основание */
      ctx.lineCap='round';ctx.lineJoin='round';
      for(const ln of L.lines){
        ctx.strokeStyle='rgba(6,5,8,'+(0.85*k)+')';ctx.lineWidth=ln.d===0?3.4:ln.d===1?2.2:1.4;
        ctx.beginPath();ln.p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
      }
      /* раскалённое свечение */
      if(heat>0.02){
        ctx.globalCompositeOperation='lighter';
        for(const ln of L.lines){
          const w=ln.d===0?2.2:ln.d===1?1.5:1;
          ctx.strokeStyle=rgba(gcol(s.col),0.55*heat);ctx.lineWidth=w+2.6;
          ctx.beginPath();ln.p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
          ctx.strokeStyle='rgba(255,252,220,'+(0.9*heat)+')';ctx.lineWidth=w*0.7;
          ctx.beginPath();ln.p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
        }
        ctx.fillStyle=rg0(0,0,s.r*0.55,[[0,'rgba(255,255,230,'+(0.95*heat)+')'],[0.4,rgba(gcol(s.col),0.6*heat)],[1,'rgba(255,200,80,0)']]);
        ctx.beginPath();ctx.arc(0,0,s.r*0.55,0,TAU);ctx.fill();
        for(let i=0;i<9;i++){const a=hv(s.seed+i*6)*TAU,d=s.r*(0.3+hv(s.seed+i*8)*0.8);ctx.fillStyle='rgba(255,240,170,'+(0.6*heat*(0.6+0.4*Math.sin(anim*9+i)))+')';ctx.beginPath();ctx.arc(Math.cos(a)*d,Math.sin(a)*d,1.4,0,TAU);ctx.fill()}
        ctx.globalCompositeOperation='source-over';
      }
      /* стеклянный блеск оплавленного песка */
      ctx.globalCompositeOperation='lighter';
      ctx.strokeStyle='rgba(190,215,255,'+(0.16*k)+')';ctx.lineWidth=1.4;
      ctx.beginPath();L.blob.forEach((q,i)=>{const x=q[0]*0.92-1.5,y=q[1]*0.92-1.5;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.stroke();
      ctx.fillStyle=rg0(-s.r*0.15,-s.r*0.2,s.r*0.4,[[0,'rgba(210,230,255,'+(0.22*k)+')'],[1,'rgba(210,230,255,0)']]);
      ctx.beginPath();ctx.arc(-s.r*0.15,-s.r*0.2,s.r*0.4,0,TAU);ctx.fill();
      /* ударная волна */
      const age=s.max-s.life;
      if(age<0.6){
        const q=age/0.6,rr=s.r*(0.4+2.4*(1-(1-q)*(1-q)));
        ctx.strokeStyle='rgba(235,245,255,'+(0.8*(1-q))+')';ctx.lineWidth=4*(1-q)+1;ctx.beginPath();ctx.arc(0,0,rr,0,TAU);ctx.stroke();
        ctx.strokeStyle=rgba(gcol(s.col),0.5*(1-q));ctx.lineWidth=9*(1-q)+1;ctx.beginPath();ctx.arc(0,0,rr*0.82,0,TAU);ctx.stroke();
        ctx.fillStyle=rg0(0,0,rr,[[0,'rgba(255,255,240,'+(0.5*(1-q))+')'],[1,'rgba(255,255,240,0)']]);ctx.beginPath();ctx.arc(0,0,rr,0,TAU);ctx.fill();
      }
      /* живые дуги по трещинам и искры остаточного заряда */
      const live=clamp((s.life/s.max-0.3)*2.2,0,1);
      if(live>0.02){
        const fr=Math.floor(anim*16);
        for(let li=0;li<L.lines.length;li++){
          const ln=L.lines[li];if(ln.d>1||hv(fr*7+li*13+s.seed)>0.45)continue;
          const n=ln.p.length,i0=Math.floor(hv(fr+li*5+s.seed)*(n-2)),p0=ln.p[i0],p1=ln.p[Math.min(n-1,i0+2)];
          ctx.strokeStyle=rgba(gcol(s.col),0.8*live);ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(p0[0],p0[1]);
          const mx=(p0[0]+p1[0])/2+(hv(fr+li)-0.5)*9,my=(p0[1]+p1[1])/2+(hv(fr+li+3)-0.5)*9;ctx.lineTo(mx,my);ctx.lineTo(p1[0],p1[1]);ctx.stroke();
          ctx.strokeStyle='rgba(255,255,255,'+(0.95*live)+')';ctx.lineWidth=0.9;ctx.stroke();
        }
        for(let i=0;i<4;i++){
          const a=hv(s.seed+fr*3+i)*TAU,d=s.r*(0.2+0.9*hv(s.seed+fr+i*9)),h=hv(fr+i)*8;
          ctx.fillStyle='rgba(255,250,200,'+(0.8*live)+')';ctx.beginPath();ctx.arc(Math.cos(a)*d,Math.sin(a)*d-h,1.3,0,TAU);ctx.fill();
        }
        ctx.fillStyle=rg0(0,0,s.r*0.9,[[0,rgba(gcol(s.col),0.16*live)],[1,rgba(gcol(s.col),0)]]);ctx.beginPath();ctx.arc(0,0,s.r*0.9,0,TAU);ctx.fill();
      }
      ctx.globalCompositeOperation='source-over';
      ctx.lineCap='butt';ctx.lineJoin='miter';
    }
    ctx.restore();
  }
}
function rg0(x,y,r,st){const g=ctx.createRadialGradient(x,y,0,x,y,r);for(const [o,c] of st)g.addColorStop(o,c);return g}
function drawMapFx(g){
  const p=g.p;
  for(const q of g.rt){
    if(!vis(q.x,q.y,q.r+40))continue;
    const k=q.t/q.max,gr=Math.min(1,(1-k)*6),al=Math.min(1,k*3);
    ctx.save();ctx.translate(q.x,q.y);ctx.globalAlpha=al;ctx.lineCap='round';
    ctx.fillStyle='rgba(20,50,24,.5)';ctx.beginPath();ctx.arc(0,0,q.r*0.95*gr,0,TAU);ctx.fill();
    const R=mulberry(q.seed);
    for(let i=0;i<10;i++){
      const a=i/10*TAU+R()*0.5,L=q.r*(0.7+R()*0.5)*gr,cu=(R()-0.5)*1.4,sway=Math.sin(anim*3+i)*0.08;
      const ex=Math.cos(a+cu+sway)*L,ey=Math.sin(a+cu+sway)*L*0.85,mx=Math.cos(a)*L*0.5,my=Math.sin(a)*L*0.5-8*gr;
      ctx.strokeStyle='#1f4a26';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(mx,my,ex,ey);ctx.stroke();
      ctx.strokeStyle='#4aa352';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(mx,my,ex,ey);ctx.stroke();
      ctx.fillStyle='#c8e6a0';ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex+Math.cos(a)*7-Math.sin(a)*3,ey+Math.sin(a)*7+Math.cos(a)*3);ctx.lineTo(ex+Math.sin(a)*3,ey-Math.cos(a)*3);ctx.fill();
    }
    ctx.restore();ctx.globalAlpha=1;ctx.lineCap='butt';
  }
  for(const d of g.dv){
    if(!vis(d.x,d.y,d.r*3))continue;
    const fade=Math.min(1,d.t,(d.max-d.t)*1.5);
    ctx.save();ctx.globalAlpha=fade;
    ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(d.x,d.y+4,d.r*0.8,d.r*0.28,0,0,TAU);ctx.fill();
    for(let i=0;i<9;i++){
      const rr=d.r*(0.35+i*0.1),yy=d.y-i*13,sw=Math.sin(anim*4+i*0.8)*6;
      ctx.fillStyle='rgba(214,185,130,'+(0.10+0.02*i).toFixed(3)+')';ctx.strokeStyle='rgba(240,222,176,'+(0.22+0.02*i).toFixed(3)+')';ctx.lineWidth=2;
      ctx.beginPath();ctx.ellipse(d.x+sw,yy,rr,rr*0.32,0,0,TAU);ctx.fill();ctx.stroke();
    }
    ctx.restore();
  }
  if(g.frz>0&&vis(p.x,p.y,60)){
    const k=Math.min(1,g.frz*3);
    ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=0.35+0.4*k;
    ctx.fillStyle='#bfe8ff';ctx.strokeStyle='#ffffff';ctx.lineWidth=2;
    ctx.beginPath();for(let i=0;i<7;i++){const a=i/7*TAU+0.3,r=i%2?26:34;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r*0.9)}ctx.closePath();ctx.fill();ctx.stroke();
    ctx.globalAlpha=0.7;ctx.strokeStyle='#ffffff';ctx.beginPath();ctx.moveTo(-14,-14);ctx.lineTo(-4,-4);ctx.moveTo(10,-18);ctx.lineTo(4,-6);ctx.moveTo(14,10);ctx.lineTo(4,4);ctx.stroke();
    ctx.restore();
  }
}
function drawBlizzard(g){
  const b=g.bliz;if(!b)return;
  const ramp=Math.min(1,b.t/1,(b.max-b.t)/1.2);
  ctx.fillStyle='rgba(205,230,255,'+(0.16*ramp).toFixed(3)+')';ctx.fillRect(0,0,W,H);
  const gr=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.25,W/2,H/2,Math.max(W,H)*0.7);
  const ch=Math.max(0,b.ch||0);
  gr.addColorStop(0,'rgba(220,240,255,0)');gr.addColorStop(1,'rgba(220,240,255,'+((0.25+0.5*ch)*ramp).toFixed(3)+')');
  ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,255,255,'+(0.35*ramp).toFixed(3)+')';ctx.lineWidth=1.5;
  for(let i=0;i<46;i++){
    const x=((hv(i*3.1)*W*1.4-anim*(900+hv(i)*500))%(W*1.4)+W*1.4)%(W*1.4),y=(hv(i*7.7)*H+anim*(120+hv(i+9)*60))%H;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+60,y-14);ctx.stroke();
  }
}
function drawPatches(g){
  for(const q of g.pch){
    if(!vis(q.x,q.y,q.r+20))continue;
    const k=clamp(q.life/q.max*1.5,0,1),lava=q.kind==='lava';
    ctx.globalAlpha=k;
    const gr=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,q.r);
    gr.addColorStop(0,lava?'rgba(255,230,140,.85)':'rgba(255,190,90,.6)');gr.addColorStop(0.55,lava?'rgba(255,100,30,.7)':'rgba(255,100,40,.4)');gr.addColorStop(1,'rgba(120,20,10,0)');
    ctx.fillStyle=gr;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,TAU);ctx.fill();
    ctx.globalCompositeOperation='lighter';glow(q.x,q.y,q.r*1.8,'#ff6a2b',0.35*k);ctx.globalCompositeOperation='source-over';
    ctx.globalAlpha=1;
  }
}
function boltPath(x0,y0,x1,y1,seed,amp,segs){
  const R=mulberry(seed),pts=[{x:x0,y:y0}];
  const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
  for(let i=1;i<segs;i++){const k=i/segs,o=(R()-0.5)*amp*(1-0.3*k);pts.push({x:x0+dx*k+nx*o,y:y0+dy*k+ny*o})}
  pts.push({x:x1,y:y1});
  return pts;
}
function strokePts(pts){ctx.beginPath();for(let i=0;i<pts.length;i++){if(i)ctx.lineTo(pts[i].x,pts[i].y);else ctx.moveTo(pts[i].x,pts[i].y)}ctx.stroke()}
function drawSky(g){
  if(!g.sk.length)return;
  ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
  for(const b of g.sk){
    const k=clamp(b.t/b.max,0,1),flick=(Math.floor(anim*40)%3)?1:0.6,a=Math.pow(k,0.6)*flick;
    const top=Math.max(VH,520)+120,x0=b.x+(hv(b.seed)-0.5)*160,y0=b.y-top;
    const pts=boltPath(x0,y0,b.x,b.y,b.seed,70,16);
    ctx.strokeStyle=b.col;ctx.globalAlpha=a*0.22;ctx.lineWidth=b.big?46:32;strokePts(pts);
    ctx.globalAlpha=a*0.5;ctx.lineWidth=b.big?18:12;strokePts(pts);
    ctx.strokeStyle='#ffffff';ctx.globalAlpha=a;ctx.lineWidth=b.big?6:4;strokePts(pts);
    for(let i=0;i<4;i++){
      const pi=3+Math.floor(hv(b.seed+i*7)*9),q=pts[pi];if(!q)continue;
      const ang=(hv(b.seed+i*3)-0.5)*2.2+Math.PI/2,len=70+hv(b.seed+i*5)*130;
      const bp=boltPath(q.x,q.y,q.x+Math.cos(ang)*len,q.y+Math.sin(ang)*len*0.9,b.seed+i*11,26,6);
      ctx.strokeStyle=b.col;ctx.globalAlpha=a*0.7;ctx.lineWidth=2.4;strokePts(bp);
    }
    glow(b.x,b.y,b.big?240:170,'#ffffff',a*0.9);glow(b.x,b.y,b.big?330:230,b.col,a*0.8);
    ctx.strokeStyle=b.col;ctx.globalAlpha=a*0.8;ctx.lineWidth=3;
    const rr=(1-k)*(b.big?130:90)+10;ctx.beginPath();ctx.ellipse(b.x,b.y,rr,rr*0.6,0,0,TAU);ctx.stroke();
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.lineCap='butt';ctx.lineJoin='miter';
}
function drawSolids(g,MP){
  for(const s of g.solids){
    if(!vis(s.x,s.y,s.r+70))continue;
    const k=s.kind;
    ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(s.x+7,s.y+s.r*0.5,s.r*1.1,s.r*0.62,0,0,TAU);ctx.fill();
    if(k==='rock'){
      ctx.fillStyle='#3b3d4d';blobPoly(s.x,s.y,s.r,s.s,9,0.16);ctx.fill();
      ctx.fillStyle='rgba(120,128,160,.5)';blobPoly(s.x-s.r*0.14,s.y-s.r*0.2,s.r*0.68,s.s+1,8,0.16);ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=2;blobPoly(s.x,s.y,s.r,s.s,9,0.16);ctx.stroke();
      ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(s.x-s.r*0.3,s.y+s.r*0.1);ctx.lineTo(s.x+s.r*0.1,s.y+s.r*0.35);ctx.lineTo(s.x+s.r*0.35,s.y+s.r*0.2);ctx.stroke();
    }else if(k==='basalt'){
      ctx.fillStyle='#2b2126';poly(s.x,s.y,s.r,6,s.a);ctx.fill();
      ctx.fillStyle='#43343b';poly(s.x-2,s.y-3,s.r*0.78,6,s.a);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.07)';poly(s.x-4,s.y-6,s.r*0.4,6,s.a);ctx.fill();
      ctx.strokeStyle='rgba(255,100,40,.45)';ctx.lineWidth=2;poly(s.x,s.y,s.r,6,s.a);ctx.stroke();
      ctx.globalCompositeOperation='lighter';glow(s.x,s.y,s.r*2,'#ff6a2b',0.12);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    }else if(k==='crystal'){
      const pu=0.5+0.5*Math.sin(anim*1.8+s.s*20);
      ctx.globalCompositeOperation='lighter';glow(s.x,s.y,s.r*2.6,'#7fd6ff',0.2+0.15*pu);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
      for(let i=0;i<5;i++){
        const a=s.a+i*TAU/5,l=s.r*(0.9+0.55*hv(s.s*40+i)),w=0.42;
        ctx.fillStyle=i%2?'#58b8ea':'#8fdcff';
        ctx.beginPath();ctx.moveTo(s.x+Math.cos(a-w)*s.r*0.45,s.y+Math.sin(a-w)*s.r*0.45);ctx.lineTo(s.x+Math.cos(a)*l,s.y+Math.sin(a)*l);ctx.lineTo(s.x+Math.cos(a+w)*s.r*0.45,s.y+Math.sin(a+w)*s.r*0.45);ctx.closePath();ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.35)';
        ctx.beginPath();ctx.moveTo(s.x+Math.cos(a-w)*s.r*0.45,s.y+Math.sin(a-w)*s.r*0.45);ctx.lineTo(s.x+Math.cos(a)*l,s.y+Math.sin(a)*l);ctx.lineTo(s.x+Math.cos(a)*s.r*0.3,s.y+Math.sin(a)*s.r*0.3);ctx.closePath();ctx.fill();
      }
      ctx.fillStyle='#d6f6ff';ctx.beginPath();ctx.arc(s.x,s.y,s.r*0.3,0,TAU);ctx.fill();
    }else if(k==='cactus'){
      ctx.fillStyle='#285c2e';
      for(const o of [[-1.15,0.1,0.55],[1.15,-0.15,0.5]]){ctx.beginPath();ctx.arc(s.x+o[0]*s.r,s.y+o[1]*s.r,s.r*o[2],0,TAU);ctx.fill()}
      ctx.fillStyle='#2f7236';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,TAU);ctx.fill();
      ctx.fillStyle='rgba(170,235,120,.35)';ctx.beginPath();ctx.arc(s.x-s.r*0.3,s.y-s.r*0.35,s.r*0.5,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(20,50,24,.8)';ctx.lineWidth=1.5;
      for(let i=0;i<6;i++){const a=i*TAU/6+s.a;ctx.beginPath();ctx.moveTo(s.x+Math.cos(a)*s.r*0.3,s.y+Math.sin(a)*s.r*0.3);ctx.lineTo(s.x+Math.cos(a)*s.r*0.98,s.y+Math.sin(a)*s.r*0.98);ctx.stroke()}
      ctx.strokeStyle='#f3e6b0';ctx.lineWidth=1;
      for(let i=0;i<10;i++){const a=i*TAU/10+s.a*2,x0=s.x+Math.cos(a)*s.r,y0=s.y+Math.sin(a)*s.r;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x0+Math.cos(a)*5,y0+Math.sin(a)*5);ctx.stroke()}
    }else if(k==='pylon'){
      const pu=0.5+0.5*Math.sin(anim*3+s.s*20);
      ctx.fillStyle='#1b2133';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,TAU);ctx.fill();
      ctx.strokeStyle='#5a6690';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(s.x,s.y,s.r*0.78,0,TAU);ctx.stroke();
      ctx.strokeStyle='#39425f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.x,s.y,s.r*0.52,0,TAU);ctx.stroke();
      ctx.fillStyle='rgba(180,200,255,.18)';ctx.beginPath();ctx.arc(s.x-s.r*0.3,s.y-s.r*0.3,s.r*0.45,0,TAU);ctx.fill();
      ctx.globalCompositeOperation='lighter';glow(s.x,s.y,s.r*2.8,'#f4f08a',0.14+0.2*pu);glow(s.x,s.y,s.r*0.9,'#ffffff',0.3+0.4*pu);
      if(hv(Math.floor(anim*7)+s.s*50)>0.8){ctx.strokeStyle='#f4f08a';ctx.globalAlpha=0.9;ctx.lineWidth=1.6;const a=hv(Math.floor(anim*7)+s.s*9)*TAU;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+Math.cos(a)*s.r*1.8+rnd(-4,4),s.y+Math.sin(a)*s.r*1.8+rnd(-4,4));ctx.stroke()}
      ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    }else{
      const sw=Math.sin(anim*1.2+s.x*0.01)*1.6;
      ctx.fillStyle='#4a3524';ctx.beginPath();ctx.arc(s.x,s.y,s.r*0.45,0,TAU);ctx.fill();
      const cols=['#1b4524','#235b2d','#2d7438'];
      for(let i=0;i<3;i++){
        ctx.fillStyle=cols[i];
        for(let j=0;j<4;j++){const a=s.a+j*TAU/4+i*0.8,rr=s.r*(0.5-0.12*i);ctx.beginPath();ctx.arc(s.x+Math.cos(a)*rr+sw*i,s.y+Math.sin(a)*rr,s.r*(0.72-0.12*i),0,TAU);ctx.fill()}
      }
      ctx.fillStyle='rgba(160,230,110,.28)';ctx.beginPath();ctx.arc(s.x-s.r*0.25+sw,s.y-s.r*0.3,s.r*0.42,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(s.x,s.y,s.r*1.05,0,TAU);ctx.stroke();
    }
  }
}
function drawDebris(g){
  for(const d of g.deb){
    if(!vis(d.x,d.y,20))continue;
    ctx.globalAlpha=clamp(d.life/d.max*1.7,0,1);ctx.fillStyle=d.col;
    ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.rot);
    ctx.beginPath();
    for(let i=0;i<d.n;i++){const a=i*TAU/d.n,rr=d.s*(i%2?0.55:1);const px=Math.cos(a)*rr,py=Math.sin(a)*rr;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py)}
    ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1;ctx.stroke();ctx.restore();
  }
  ctx.globalAlpha=1;
}
function drawSmoke(g){
  for(const q of g.smk){
    if(!vis(q.x,q.y,60))continue;
    const k=1-q.life/q.max;
    ctx.globalAlpha=(1-k)*0.32*q.a;ctx.fillStyle=q.col;
    ctx.beginPath();ctx.arc(q.x,q.y,q.r*(1+k*q.gr),0,TAU);ctx.fill();
  }
  ctx.globalAlpha=1;
}
function drawFlash(g){
  ctx.globalCompositeOperation='lighter';
  for(const f of g.fl){
    const k=f.t/f.life,r=f.r*(0.55+0.7*k),a=(1-k);
    glow(f.x,f.y,r*1.5,'#ffffff',a*0.55);
    glow(f.x,f.y,r*2.1,f.col,a*0.85);
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function drawSparks(g){
  ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineWidth=1.8;
  for(const q of g.spk){
    if(!vis(q.x,q.y,20))continue;
    ctx.globalAlpha=clamp(q.life/q.max*1.6,0,1);ctx.strokeStyle=q.col;
    ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x-q.vx*0.045,q.y-q.vy*0.045);ctx.stroke();
  }
  ctx.globalAlpha=1;ctx.lineCap='butt';ctx.globalCompositeOperation='source-over';
}
function render(){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle='#0b0d13';ctx.fillRect(0,0,W,H);
  let g,cx,cy;
  if(mode==='menu'){g=demoG;g.map=MAPK[Math.floor(anim/16)%MAPK.length];cx=-VW*0.7;cy=-VH*0.5;gatherWorld(g,cx+VW/2,cy+VH/2)}
  else if(G){g=G;cx=cam.x;cy=cam.y;if(g.shake>0&&!RM){cx+=rnd(-1,1)*g.shake;cy+=rnd(-1,1)*g.shake}}
  else return;
  VX=cx;VY=cy;
  const MP=MAPS[g.map]||MAPS.ash;
  const z=ZM*(1+(g.zk||0));
  ctx.save();ctx.translate(W/2,H/2);ctx.scale(z,z);ctx.translate(-(cx+VW/2),-(cy+VH/2));
  drawGround(g,MP,cx,cy);
  drawDecor(g,MP);drawPools(g,MP);drawScorch(g);drawPatches(g);drawSolids(g,MP);
  if(mode!=='menu'){drawZones(g);drawBlasts(g);drawTelegraphs(g);drawGems(g);drawPickups(g);drawPortals(g);drawMerchants(g);drawEvents(g);drawStructs(g);drawEnemies(g);drawWalls(g);drawSplashes(g);drawSpiralCore(g);drawJet(g);drawDebris(g);drawSmoke(g)}
  drawRocks(g);drawPlayer(g);if(mode!=='menu'){drawGuns(g);drawMapFx(g);drawLighting(g,cx,cy,z)}
  if(mode!=='menu'){drawSkillFx(g);drawProj(g);drawEnemyProj(g);drawTornados(g);drawBolts(g);drawSky(g);drawFlash(g);drawSparks(g);drawFx(g)}
  else drawFx(g);
  ctx.restore();
  drawAmb(MP);
  ctx.fillStyle=MP.grade;ctx.fillRect(0,0,W,H);
  drawBlizzard(g);
  if(g.flashA>0){ctx.fillStyle='rgba(235,240,255,'+(g.flashA*0.55).toFixed(3)+')';ctx.fillRect(0,0,W,H)}
  if(mode==='play'){
    if(joy.on){
      ctx.strokeStyle='rgba(236,239,247,.25)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(joy.ox,joy.oy,52,0,TAU);ctx.stroke();
      ctx.fillStyle='rgba(236,239,247,.3)';ctx.beginPath();ctx.arc(joy.cx,joy.cy,20,0,TAU);ctx.fill();
    }else if(mouse.on&&!uiTouch&&!uiOpen()){
      ctx.strokeStyle='rgba(236,239,247,.55)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(mouse.x,mouse.y,9,0,TAU);ctx.moveTo(mouse.x-14,mouse.y);ctx.lineTo(mouse.x-5,mouse.y);ctx.moveTo(mouse.x+5,mouse.y);ctx.lineTo(mouse.x+14,mouse.y);ctx.moveTo(mouse.x,mouse.y-14);ctx.lineTo(mouse.x,mouse.y-5);ctx.moveTo(mouse.x,mouse.y+5);ctx.lineTo(mouse.x,mouse.y+14);ctx.stroke();
    }
    if(g.hitFlash>0){ctx.fillStyle='rgba(255,60,80,'+(g.hitFlash*0.55).toFixed(3)+')';ctx.fillRect(0,0,W,H)}
    if(g.p.hp<g.S.maxHp*0.3){
      const k=0.18+0.08*Math.sin(anim*5);
      const gr=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.35,W/2,H/2,Math.hypot(W,H)*0.55);
      gr.addColorStop(0,'rgba(255,40,60,0)');gr.addColorStop(1,'rgba(255,40,60,'+k.toFixed(3)+')');
      ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    }
    if(g.nomana>0){ctx.fillStyle='rgba(60,110,255,'+(g.nomana*0.25).toFixed(3)+')';ctx.fillRect(0,H-160,W,160)}
  }
  ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
}
function demoUpdate(dt){
  const g=demoG;
  g.rockAng+=dt*2.4;
  g.p.face+=dt*0.6;
  g.trT-=dt;
  if(g.trT<=0){
    g.trT=0.06;
    const k=EK[Math.floor(anim*1.2)%6];
    if(g.pt.length<200)g.pt.push({x:rnd(-14,14),y:rnd(-10,14),vx:rnd(-30,30),vy:rnd(-50,-10),life:0.9,max:0.9,col:EL[k].c,size:2.6});
  }
  for(const q of g.pt){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;if(q.life<=0)q.dead=true}
  compact(g.pt);
  g.shake=0;
}
demoG.slots=[{id:'steam',lv:3},{id:'magma',lv:3},{id:'frost',lv:2},{id:'sand',lv:2},{id:'railgun',lv:1}];

