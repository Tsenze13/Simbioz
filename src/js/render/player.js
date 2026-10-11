
function drawPlayer(g){
  const p=g.p;
  if(g.leapH){ctx.save();ctx.translate(0,-g.leapH)}
  for(const q of g.gh){
    ctx.globalAlpha=0.35*clamp(q.t/q.max,0,1);ctx.fillStyle='#8febd0';
    ctx.beginPath();ctx.arc(q.x,q.y,12,0,TAU);ctx.fill();
  }
  ctx.globalAlpha=1;
  ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(p.x+3,p.y+10,13,6,0,0,TAU);ctx.fill();
  ctx.save();ctx.translate(p.x,p.y);
  ctx.globalCompositeOperation='lighter';
  glow(0,0,150,EL[g.start||'fire'].c,0.10);
  for(const k of EK){
    const l=g.el[k];if(!l)continue;
    glow(0,0,34+l*5,EL[k].c,0.20+0.05*l);
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  if(p.inv>0&&Math.floor(anim*20)%2===0)ctx.globalAlpha=0.45;
  if(g.hf!==undefined){
    ctx.save();ctx.rotate(g.hf);ctx.scale(1.32,1.32);
    HTD.draw(ctx,g.start||'fire',{ph:g.hph,mv:g.hmv,t:anim,dash:g.dashT>0,ch:g.hch,atk:g.hat?g.hat.t:-1,aim:clamp(angd(g.hla,g.hf),-1,1),gun:g.hand?{aim:clamp(angd(g.hand.aim,g.hf),-.9,.9),fl:g.hand.fl,rec:g.hand.rec}:null});
    ctx.restore();
  }else{ctx.fillStyle='#f1ecdf';ctx.beginPath();ctx.arc(0,0,11,0,TAU);ctx.fill()}
  const owned=EK.filter(k=>g.el[k]>0);
  owned.forEach((k,i)=>{
    const l=g.el[k];
    ctx.strokeStyle=EL[k].c;ctx.lineWidth=1.4+l*0.5;ctx.globalAlpha=0.8;ctx.lineCap='round';
    const seg=TAU/owned.length,a0=anim*0.8+i*seg+0.12;
    ctx.beginPath();ctx.arc(0,0,22,a0,a0+seg-0.26);ctx.stroke();
  });
  ctx.lineCap='butt';ctx.globalAlpha=1;
  const sk=g.slots.filter(s=>s&&s.id);
  sk.forEach((s,i)=>{
    const a=-anim*1.6+i*TAU/sk.length,rx=Math.cos(a)*29,ry=Math.sin(a)*29,A=AB[s.id];
    if(!A)return;
    ctx.fillStyle=A.c1;ctx.beginPath();ctx.arc(rx,ry,2.6+s.lv*0.4,0,TAU);ctx.fill();
    if(A.cat!=='skill'){ctx.fillStyle=A.c2;ctx.beginPath();ctx.arc(rx,ry,1.4+s.lv*0.2,0,TAU);ctx.fill()}
  });
  if(g.shield>0){
    ctx.globalAlpha=Math.min(1,g.shield)*(0.55+0.2*Math.sin(anim*10));
    ctx.strokeStyle='#7fe6ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,27,0,TAU);ctx.stroke();
  }
  if(g.block>0){
    ctx.globalAlpha=0.7;ctx.strokeStyle='#7fe6ff';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.lineDashOffset=-anim*20;
    ctx.beginPath();ctx.arc(0,0,31,0,TAU);ctx.stroke();ctx.setLineDash([]);
  }
  if(g.bf.dm.t>0){ctx.globalAlpha=0.5;ctx.strokeStyle='#ff8a5c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,21,0,TAU);ctx.stroke()}
  if(g.bf.spd.t>0){ctx.globalAlpha=0.5;ctx.strokeStyle='#8febd0';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,34,0,TAU);ctx.stroke()}
  ctx.restore();
  ctx.globalAlpha=1;
  if(g.leapH){ctx.restore();ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(p.x,p.y+10,16-g.leapH*0.1,7,0,0,TAU);ctx.fill()}
  drawDashBar(g);drawHeroRes(g);drawItemFx(g);
}
function drawHeroRes(g){
  const p=g.p,k=g.start;if(!g.cls)return;
  const w=46,x0=p.x-w/2,y0=p.y+38;let f=0,col='#fff',lab='',pulse=false;
  if(k==='metal')return; /* у Солдата механика пассивная — без полоски */
  ctx.save();
  ctx.fillStyle='rgba(6,8,14,.72)';ctx.fillRect(x0-1,y0-1,w+2,5);
  if(k==='earth'){
    const n=g.plates||0,sw=(w-4*2)/5;
    for(let j=0;j<5;j++){ctx.fillStyle=j<n?'#c9974f':'rgba(255,255,255,.12)';ctx.fillRect(x0+j*(sw+2),y0,sw,3)}
    if(n<5&&g.stillT>0){ctx.fillStyle='rgba(232,195,138,.7)';ctx.fillRect(x0+n*(sw+2),y0,sw*clamp(g.stillT,0,1),3)}
    ctx.restore();return;
  }
  if(k==='fire'){f=(g.heat||0)/100;col=f>=1?'#fff2b0':'#ff7a3a';pulse=f>=1;if(pulse)lab='ПЕРЕГРЕВ'}
  else if(k==='water'){f=clamp(g.tideT/10,0,1);col=g.tide==='ebb'?'#6fe0b0':'#3aa7ff';lab=g.phase==='fight'?(g.tide==='ebb'?'Отлив':'Прилив'):''}
  else if(k==='air'){f=(g.imp||0)/100;col=f>=1?'#e6fff7':'#8febd0';pulse=f>=1}
  else if(k==='wood'){f=g.phase==='fight'?clamp(1-g.wt/(g.waveDur||60),0,1):1;const S0=SEAS[g.season||0];col=S0.c;lab=S0.n}
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(x0,y0,w,3);
  if(pulse)ctx.globalAlpha=0.7+0.3*Math.sin(anim*12);
  ctx.fillStyle=col;ctx.fillRect(x0,y0,w*f,3);ctx.globalAlpha=1;
  if(lab){ctx.font='700 7.5px system-ui,sans-serif';ctx.textAlign='center';ctx.fillStyle=col;ctx.fillText(lab,p.x,y0+12)}
  ctx.restore();
}
function drawDashBar(g){
  const p=g.p,mx=1+(g.S.dch||0),full=p.dch>=mx;
  if(full){p.dbf=Math.min(1.4,(p.dbf||0)+0.016)}else p.dbf=0;
  const al=full?Math.max(0.18,1-(p.dbf||0)*0.75):0.95;
  const w=22,gap=3,tw=mx*w+(mx-1)*gap,x0=p.x-tw/2,y0=p.y+31;
  ctx.save();ctx.globalAlpha=al;
  ctx.fillStyle='rgba(6,8,14,.7)';ctx.fillRect(x0-2,y0-2,tw+4,8);
  const cl=EL[g.start||'air'].c;
  for(let j=0;j<mx;j++){
    const x=x0+j*(w+gap);
    ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(x,y0,w,4);
    if(j<p.dch){ctx.fillStyle=cl;ctx.fillRect(x,y0,w,4);ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(x,y0,w,1.3)}
    else if(j===p.dch){const f=clamp(p.dcr/dashCd(),0,1);ctx.fillStyle='rgba(130,200,255,.9)';ctx.fillRect(x,y0,w*f,4)}
  }
  ctx.restore();
}
function drawProj(g){
  ctx.globalCompositeOperation='lighter';
  for(const b of g.pr){
    if(!vis(b.x,b.y,180))continue;
    const a=Math.atan2(b.vy,b.vx),v=b.vis;
    if(NEWV[v]){drawNewProj(b,a,v);continue}
    if(SPV[v]){drawProjSpr(b,a,v);continue}
    if(v!=='tsunami'&&v!=='wave'){const gr=b.r*3.4+6;ctx.globalAlpha=0.5;ctx.drawImage(glowSpr(b.col),b.x-gr,b.y-gr,gr*2,gr*2);ctx.globalAlpha=1}
    if(v==='fire'){
      ctx.fillStyle='rgba(255,120,40,.35)';ctx.beginPath();ctx.arc(b.x,b.y,b.r*1.9,0,TAU);ctx.fill();
      ctx.fillStyle='#ffb347';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();
    }else if(v==='wave'){
      ctx.strokeStyle='rgba(120,200,255,.85)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(b.x,b.y,b.r,a-1.1,a+1.1);ctx.stroke();
      ctx.strokeStyle='rgba(120,200,255,.4)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(b.x-Math.cos(a)*6,b.y-Math.sin(a)*6,b.r*0.7,a-1.0,a+1.0);ctx.stroke();
      ctx.fillStyle='rgba(58,167,255,.12)';ctx.beginPath();ctx.arc(b.x,b.y,b.r,a-1.1,a+1.1);ctx.lineTo(b.x,b.y);ctx.fill();
    }else if(v==='tsunami'){
      ctx.fillStyle='rgba(58,167,255,.16)';ctx.beginPath();ctx.arc(b.x,b.y,b.r,a-1.25,a+1.25);ctx.lineTo(b.x,b.y);ctx.fill();
      for(let i=0;i<3;i++){ctx.strokeStyle='rgba('+(120+i*40)+',210,255,'+(0.85-i*0.22)+')';ctx.lineWidth=7-i*2;ctx.beginPath();ctx.arc(b.x-Math.cos(a)*i*16,b.y-Math.sin(a)*i*16,b.r-i*14,a-1.2,a+1.2);ctx.stroke()}
    }else if(v==='blade'){
      ctx.strokeStyle='rgba(200,255,240,.9)';ctx.lineWidth=3;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*0.035,b.y-b.vy*0.035);ctx.stroke();ctx.lineCap='butt';
    }else if(v==='bullet'){
      ctx.strokeStyle='rgba(255,244,190,.9)';ctx.lineWidth=3;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*0.022,b.y-b.vy*0.022);ctx.stroke();ctx.lineCap='butt';
      ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(b.x,b.y,2.4,0,TAU);ctx.fill();
    }else if(v==='flame'){
      ctx.fillStyle='rgba(255,154,60,.4)';ctx.beginPath();ctx.arc(b.x,b.y,b.r*1.8,0,TAU);ctx.fill();
      ctx.fillStyle='#ffd36b';ctx.beginPath();ctx.arc(b.x,b.y,b.r*0.8,0,TAU);ctx.fill();
    }else if(v==='slug'){
      ctx.fillStyle='rgba(255,120,40,.4)';ctx.beginPath();ctx.arc(b.x,b.y,b.r*1.8,0,TAU);ctx.fill();
      ctx.fillStyle='#ffd9a0';ctx.beginPath();ctx.arc(b.x,b.y,b.r*0.8,0,TAU);ctx.fill();
    }else if(v==='seed'){
      ctx.fillStyle='rgba(154,209,106,.35)';ctx.beginPath();ctx.arc(b.x,b.y,b.r*1.8,0,TAU);ctx.fill();
      ctx.fillStyle='#d6f59a';ctx.beginPath();ctx.arc(b.x,b.y,b.r*0.8,0,TAU);ctx.fill();
    }else if(v==='thorn'){
      ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);ctx.fillStyle='#c8f090';
      ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-5,-3);ctx.lineTo(-5,3);ctx.closePath();ctx.fill();ctx.restore();
    }else if(v==='shard'){
      ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);ctx.fillStyle='rgba(189,240,255,.95)';
      ctx.beginPath();ctx.moveTo(b.r*1.6,0);ctx.lineTo(0,-b.r*0.7);ctx.lineTo(-b.r*1.2,0);ctx.lineTo(0,b.r*0.7);ctx.closePath();ctx.fill();ctx.restore();
    }else{
      ctx.fillStyle=rgba(b.col||'#ffffff',0.9);ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();
    }
  }
  ctx.globalCompositeOperation='source-over';
}
function drawEnemyProj(g){
  ctx.globalCompositeOperation='lighter';
  for(const b of g.eps){
    if(!vis(b.x,b.y,20))continue;
    ctx.globalAlpha=0.7;ctx.drawImage(glowSpr(b.col),b.x-b.r*3.4,b.y-b.r*3.4,b.r*6.8,b.r*6.8);ctx.globalAlpha=1;
    ctx.fillStyle='#ff6b7a';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r*0.4,0,TAU);ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';
}
function drawTornados(g){
  for(const t of g.tor){
    if(!vis(t.x,t.y,t.r+20))continue;
    const tc=t.vis==='storm'?'244,230,130':(t.vis==='fire'?'255,140,60':'224,194,122');
    const cc=t.vis==='storm'?['244,230,130','255,250,210']:(t.vis==='fire'?['255,120,30','255,230,150']:(t.vis==='water'?['80,160,255','200,235,255']:(t.vis==='air'?['150,235,215','235,255,250']:['220,185,120','255,235,190'])));
    ctx.globalCompositeOperation='source-over';
    SP.disc(ctx,t.x,t.y+6,t.r*1.1,t.r*.5,cc[0],.4);
    SP.funnel(ctx,t.x,t.y+4,t.r*2.5,t.r*.95,anim,cc[0],cc[1]);
    for(let i=0;i<14;i++){const q=(anim*.8+i*.173)%1,ang=anim*7+i*1.7,rr=t.r*(.2+.8*q);ctx.fillStyle='rgba('+cc[0]+','+(.8*(1-q*.5))+')';ctx.beginPath();ctx.arc(t.x+Math.cos(ang)*rr,t.y+4-q*t.r*2.4+Math.sin(ang)*rr*.2,1.8,0,TAU);ctx.fill()}
    ctx.strokeStyle='rgba('+cc[0]+',.25)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,TAU);ctx.stroke();
  }
}
function bzig(x1,y1,x2,y2,seed,depth,branch){
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
  const n=Math.max(3,Math.floor(L/14));
  let s=seed*9301+49297;const rn=()=>{s=(s*9301+49297)%233280;return s/233280-0.5};
  for(let i=1;i<=n;i++){
    const k=i/n,w=i===n?0:rn()*Math.min(26,L*0.22);
    const px=x1+dx*k+nx*w,py=y1+dy*k+ny*w;
    ctx.lineTo(px,py);
    if(branch&&depth<1&&i<n&&rn()>0.28){
      const ex=px+rn()*L*0.5+dx/L*20,ey=py+rn()*L*0.5+dy/L*20;
      ctx.moveTo(px,py);ctx.lineTo((px+ex)/2+rn()*8,(py+ey)/2+rn()*8);ctx.lineTo(ex,ey);ctx.moveTo(px,py);
    }
  }
}
function drawBolts(g){
  ctx.globalCompositeOperation='lighter';
  ctx.lineCap='round';ctx.lineJoin='round';
  for(const b of g.bolts){
    const a=clamp(b.t/b.max,0,1);
    const fr=Math.floor(b.t*40);
    for(let i=1;i<b.pts.length;i++){
      const q=b.pts[i-1],pp=b.pts[i];
      for(let pass=0;pass<3;pass++){
        ctx.strokeStyle=pass===2?'#ffffff':b.col;ctx.globalAlpha=a*(pass===0?0.22:pass===1?0.6:1);ctx.lineWidth=pass===0?9:pass===1?4:1.6;
        ctx.beginPath();ctx.moveTo(q.x,q.y);
        bzig(q.x,q.y,pp.x,pp.y,fr*13+i*7,0,pass===2);
        ctx.stroke();
      }
    }
  }
  for(const b of g.beams){
    const a=clamp(b.t/b.max,0,1);
    if(b.vis==='rail'){
      const ang=Math.atan2(b.y2-b.y1,b.x2-b.x1),len=Math.hypot(b.x2-b.x1,b.y2-b.y1),q=1-a;
      ctx.save();ctx.translate(b.x1,b.y1);ctx.rotate(ang);
      for(const [w,col,al] of [[b.w*.9,'80,160,255',.2],[b.w*.4,'150,210,255',.5],[7,'255,255,255',1]]){ctx.fillStyle='rgba('+col+','+(al*a)+')';ctx.fillRect(0,-w/2*(1-q*.4),len,w*(1-q*.4))}
      for(let i=1;i*46<len;i++)SP.ringE(ctx,i*46+q*30,0,4+14*q,b.w*.3+10*q,'200,235,255',1.8,.7*a);
      ctx.restore();SP.glow(ctx,b.x1,b.y1,60,'#ffffff',.7*a);continue;
    }
    if(b.vis==='vine'){
      ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.min(1,a*2);
      SP.vine(ctx,b.x1,b.y1,b.x2,b.y2,anim,9,11,true);
      ctx.globalAlpha=1;ctx.globalCompositeOperation='lighter';continue;
    }
    ctx.strokeStyle=b.col;
    ctx.globalAlpha=a*0.3;ctx.lineWidth=b.w;
    ctx.beginPath();ctx.moveTo(b.x1,b.y1);ctx.lineTo(b.x2,b.y2);ctx.stroke();
    ctx.globalAlpha=a*0.95;ctx.lineWidth=b.vis==='rail'?8:5;
    if(b.vis==='vine'){
      const dx=b.x2-b.x1,dy=b.y2-b.y1,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
      ctx.beginPath();
      for(let i=0;i<=24;i++){const k=i/24,w=Math.sin(k*18+b.t*30)*8*(1-k*0.4);const px=b.x1+dx*k+nx*w,py=b.y1+dy*k+ny*w;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py)}
      ctx.stroke();
    }else{ctx.beginPath();ctx.moveTo(b.x1,b.y1);ctx.lineTo(b.x2,b.y2);ctx.stroke()}
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.lineCap='butt';ctx.lineJoin='miter';
  if(mode==='play'&&mouse.on&&!uiTouch&&!g.over&&!uiOpen()){
    const a=s2w(mouse.x,mouse.y),pp=g.p;
    ctx.save();ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=1.4;ctx.setLineDash([4,6]);
    const dx=a.x-pp.x,dy=a.y-pp.y,d=Math.hypot(dx,dy)||1,m=Math.min(d,420);
    ctx.beginPath();ctx.moveTo(pp.x+dx/d*30,pp.y+dy/d*30);ctx.lineTo(pp.x+dx/d*m,pp.y+dy/d*m);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.arc(a.x,a.y,9,0,TAU);ctx.stroke();
    ctx.beginPath();ctx.moveTo(a.x-14,a.y);ctx.lineTo(a.x-5,a.y);ctx.moveTo(a.x+5,a.y);ctx.lineTo(a.x+14,a.y);ctx.moveTo(a.x,a.y-14);ctx.lineTo(a.x,a.y-5);ctx.moveTo(a.x,a.y+5);ctx.lineTo(a.x,a.y+14);ctx.stroke();
    ctx.restore();
  }
}
function drawFx(g){
  for(const h of g.afx){
    const m=h.m;ctx.save();ctx.translate(h.x,h.y);ctx.scale(h.k,h.k*1.35);ctx.translate(-SP.CX,-(SP.CY+m[2]));
    SP.AB[m[0]](ctx,h.t/h.life,anim);ctx.restore();ctx.globalAlpha=1;
  }
  for(const h of g.hfx){
    const p=h.t/h.life;ctx.save();ctx.translate(h.x,h.y);if(h.rot)ctx.rotate(h.a);ctx.scale(h.sc,h.sc);
    SP.hit[h.kk](ctx,0,0,p,h.seed,h);ctx.restore();ctx.globalAlpha=1;
  }
  for(const f of g.fx){
    const k=f.t/f.life,r=f.max*(1-(1-k)*(1-k));
    ctx.strokeStyle=f.col;ctx.globalAlpha=1-k;ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(f.x,f.y,r,0,TAU);ctx.stroke();
    if(f.spike){
      ctx.fillStyle=f.col;
      for(let i=0;i<7;i++){
        const a=i*TAU/7+0.4,bx=f.x+Math.cos(a)*r*0.55,by=f.y+Math.sin(a)*r*0.55,h=(1-k)*14+4;
        ctx.beginPath();
        ctx.moveTo(bx+Math.cos(a+1.57)*4,by+Math.sin(a+1.57)*4);
        ctx.lineTo(bx+Math.cos(a)*h,by+Math.sin(a)*h);
        ctx.lineTo(bx+Math.cos(a-1.57)*4,by+Math.sin(a-1.57)*4);
        ctx.closePath();ctx.fill();
      }
    }
  }
  ctx.globalAlpha=1;
  ctx.globalCompositeOperation='lighter';
  for(const q of g.pt){
    ctx.globalAlpha=clamp(q.life/q.max,0,1);ctx.fillStyle=q.col;
    ctx.beginPath();ctx.arc(q.x,q.y,q.size,0,TAU);ctx.fill();
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  ctx.textAlign='center';
  for(const t of g.tx){
    ctx.globalAlpha=clamp(t.t/0.3,0,1);
    ctx.font=(t.big?'700 17px':'700 13px')+' "Golos Text",system-ui,sans-serif';
    ctx.lineWidth=3;ctx.strokeStyle='rgba(10,12,18,.8)';ctx.strokeText(t.txt,t.x,t.y);
    ctx.fillStyle=t.crit?'#ffffff':(t.col||'#ffffff');ctx.fillText(t.txt,t.x,t.y);
    if(t.react){ctx.font='700 10px "Golos Text",system-ui,sans-serif';ctx.strokeText(t.react,t.x,t.y-14);ctx.fillStyle='#ffd36b';ctx.fillText(t.react,t.x,t.y-14)}
  }
  ctx.globalAlpha=1;
}
function ambUpdate(dt){
  const MP=MAPS[(G&&mode!=='menu')?G.map:MAPK[Math.floor(anim/16)%MAPK.length]]||MAPS.ash,A=MP.amb;
  const pvx=(G&&mode==='play')?G.p.vx:0,pvy=(G&&mode==='play')?G.p.vy:0;
  const w=W+20,h=H+20;
  for(const a of amb){
    a.x+=(a.vx*A.wind+(A.drift||0)-pvx*0.18)*dt;a.y+=(a.vy*A.fall-pvy*0.18)*dt;
    a.x=((a.x+10)%w+w)%w-10;a.y=((a.y+10)%h+h)%h-10;
  }
}
function drawAmb(MP){
  const A=MP.amb;
  ctx.globalCompositeOperation='lighter';
  if(A.streak){
    ctx.lineWidth=1.2;ctx.lineCap='round';
    for(let i=0;i<amb.length;i++){const a=amb[i];ctx.globalAlpha=A.al*(0.5+a.r*0.2);ctx.strokeStyle=A.c[i%A.c.length];ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x-(a.vx*A.wind+(A.drift||0))*0.05,a.y-a.vy*A.fall*0.05);ctx.stroke()}
    ctx.lineCap='butt';
  }else for(let i=0;i<amb.length;i++){const a=amb[i];ctx.globalAlpha=A.al;ctx.fillStyle=A.c[i%A.c.length];ctx.beginPath();ctx.arc(a.x,a.y,a.r*A.sz,0,TAU);ctx.fill()}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
