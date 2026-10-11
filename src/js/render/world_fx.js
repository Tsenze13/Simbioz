
function drawMerchants(g){
  const near=nearMerchant();
  for(const m of g.merch){
    if(!vis(m.x,m.y,90))continue;
    const M=MERCH[m.id];
    ctx.save();ctx.translate(m.x,m.y);
    ctx.save();ctx.scale(1.3,1.3);MS.draw(ctx,m.id,anim,near===m);ctx.restore();
    ctx.textAlign='center';ctx.font='700 12px "Golos Text",system-ui,sans-serif';
    ctx.lineWidth=3;ctx.strokeStyle='rgba(10,12,18,.85)';ctx.strokeText(M.n,0,-66);
    ctx.fillStyle=M.col;ctx.fillText(M.n,0,-66);
    ctx.restore();
  }
}
function drawSummon(s){
  if(s.kind==='mine'){
    const armed=s.arm<=0,bl=armed&&Math.floor(anim*4+s.x)%2===0;
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(s.x+2,s.y+4,11,5,0,0,TAU);ctx.fill();
    const gr=ctx.createRadialGradient(s.x-3,s.y-3,1,s.x,s.y,11);gr.addColorStop(0,'#9aa6be');gr.addColorStop(1,'#2a303e');
    ctx.fillStyle=gr;ctx.beginPath();ctx.arc(s.x,s.y,10,0,TAU);ctx.fill();ctx.strokeStyle='#0a0c12';ctx.lineWidth=1.5;ctx.stroke();
    for(let i=0;i<4;i++){const a=i*TAU/4+0.4;ctx.fillStyle='#c8d0e0';ctx.fillRect(s.x+Math.cos(a)*10-1.5,s.y+Math.sin(a)*10-1.5,3,3)}
    ctx.fillStyle=bl?'#ff3a2a':'#5a1a14';ctx.beginPath();ctx.arc(s.x,s.y,3,0,TAU);ctx.fill();
    if(bl){ctx.globalCompositeOperation='lighter';glow(s.x,s.y,16,'#ff3a2a',0.7);ctx.globalCompositeOperation='source-over'}
    return;
  }
  const fade=Math.min(1,s.life/0.6,(anim-s.t0)/0.3);ctx.globalAlpha=Math.max(0,fade);
  ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.aim||0);
  const sc=1+(s.atk>0?Math.sin(s.atk/0.35*Math.PI)*0.15:0);ctx.scale(sc,sc);
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(3,10,24,10,0,0,TAU);ctx.fill();
  if(typeof ENS!=='undefined'&&ENS.has(s.kind==='golem'?'boss_golem':'boss_ent'))ENS.draw(ctx,s.kind==='golem'?'boss_golem':'boss_ent',{t:anim,r:19,col:s.kind==='golem'?'#9a8a6a':'#4a8a3a',st:'move',hp:1});
  else{ctx.fillStyle=s.col;ctx.beginPath();ctx.arc(0,0,20,0,TAU);ctx.fill()}
  ctx.restore();
  if(s.kind==='treant'&&s.heal){ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(140,230,120,'+(0.25+0.1*Math.sin(anim*3))+')';ctx.lineWidth=2;ctx.setLineDash([6,8]);ctx.lineDashOffset=-anim*12;ctx.beginPath();ctx.arc(s.x,s.y,170,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.globalCompositeOperation='source-over'}
  if(s.taunt){ctx.fillStyle='#ffd36b';ctx.font='700 13px "Golos Text",system-ui';ctx.textAlign='center';ctx.fillText('!',s.x,s.y-30)}
  const w=34,k=clamp(s.life/s.max,0,1);ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(s.x-w/2,s.y-28,w,4);ctx.fillStyle=s.kind==='golem'?'#e8c98f':'#8ad25a';ctx.fillRect(s.x-w/2,s.y-28,w*k,4);
  ctx.globalAlpha=1;
}
function drawSkillFx(g){
  for(const f of g.cfx){
    const k=f.t/f.life,a=1-k;
    ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.ang);ctx.globalCompositeOperation='lighter';
    const R=f.range*(0.55+0.45*k);
    const gr=ctx.createRadialGradient(0,0,R*0.2,0,0,R);gr.addColorStop(0,rgba(gcol(f.col),0));gr.addColorStop(0.7,rgba(gcol(f.col),0.35*a));gr.addColorStop(1,rgba(gcol(f.col),0));
    ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R,-f.arc/2,f.arc/2);ctx.closePath();ctx.fill();
    ctx.strokeStyle=rgba('#ffffff',0.8*a);ctx.lineWidth=3*a+1;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,0,R,-f.arc/2,f.arc/2);ctx.stroke();
    if(f.vis==='wind')for(let i=0;i<5;i++){const aa=(i/4-.5)*f.arc,rr=R*(0.4+0.5*((k*2+i*.3)%1));ctx.strokeStyle=rgba('#e6fff7',0.6*a);ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,rr,aa-0.15,aa+0.15);ctx.stroke()}
    ctx.lineCap='butt';ctx.restore();
  }
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  for(const m of g.em){
    if(m.kind!=='orbit')continue;
    const p=g.p,a0=Math.min(1,m.life/0.4,(m.max-m.life)/0.2);
    for(let i=0;i<m.n;i++){const a=m.ang+i*TAU/m.n,x=p.x+Math.cos(a)*m.R,y=p.y+Math.sin(a)*m.R;
      ctx.save();ctx.globalAlpha=a0;ctx.translate(x,y);ctx.rotate(anim*14+i);
      if(m.vis==='saw')drawSaw(10);else{ctx.rotate(a);SP.proj.blade(ctx,anim,.7)}
      ctx.restore()}
  }
  ctx.globalAlpha=1;
}
function drawSaw(r){
  ctx.fillStyle='#cfd6e4';ctx.beginPath();for(let i=0;i<16;i++){const a=i/16*TAU,rr=i%2?r:r*0.78;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill();
  ctx.strokeStyle='#2a303e';ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle='#7a849a';ctx.beginPath();ctx.arc(0,0,r*0.45,0,TAU);ctx.fill();ctx.fillStyle='#1a1e28';ctx.beginPath();ctx.arc(0,0,r*0.18,0,TAU);ctx.fill();
  ctx.globalCompositeOperation='lighter';glow(0,0,r*1.6,'#e8eef8',0.25);ctx.globalCompositeOperation='source-over';
}
function drawNewProj(b,a,v){
  ctx.save();ctx.translate(b.x,b.y);ctx.globalCompositeOperation='source-over';
  if(v==='boomer'){ctx.rotate(anim*18);ctx.globalCompositeOperation='lighter';glow(0,0,26,'#ff7a2b',.6);
    ctx.fillStyle='#ffb347';ctx.beginPath();ctx.arc(0,0,14,-1.3,1.3);ctx.arc(-6,0,11,1.1,-1.1,true);ctx.closePath();ctx.fill();
    ctx.fillStyle='#fff2b0';ctx.beginPath();ctx.arc(0,0,10,-1,1);ctx.arc(-4,0,8,0.8,-0.8,true);ctx.closePath();ctx.fill();}
  else if(v==='saw'){ctx.rotate(anim*22);drawSaw(b.r+2)}
  else if(v==='bubble'){const r=b.r;const gr=ctx.createRadialGradient(-r*.35,-r*.35,1,0,0,r);gr.addColorStop(0,'rgba(255,255,255,.85)');gr.addColorStop(.35,'rgba(160,220,255,.25)');gr.addColorStop(1,'rgba(90,170,255,.55)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.strokeStyle='rgba(200,240,255,.9)';ctx.lineWidth=1.5;ctx.stroke()}
  else if(v==='orb'){ctx.globalCompositeOperation='lighter';glow(0,0,b.r*3,'#f4f08a',.7);glow(0,0,b.r*1.4,'#ffffff',.9);ctx.strokeStyle='rgba(255,250,170,.9)';ctx.lineWidth=1.5;for(let i=0;i<4;i++){const q=anim*20+i*1.7;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(q)*b.r*1.8,Math.sin(q*1.3)*b.r*1.8);ctx.stroke()}}
  else if(v==='fruit'){ctx.rotate(anim*6);ctx.fillStyle='#7a3a8a';ctx.beginPath();ctx.arc(0,0,b.r,0,TAU);ctx.fill();ctx.fillStyle='#d8f0a0';for(let i=0;i<8;i++){const q=i/8*TAU;ctx.beginPath();ctx.moveTo(Math.cos(q-.2)*b.r,Math.sin(q-.2)*b.r);ctx.lineTo(Math.cos(q)*(b.r+5),Math.sin(q)*(b.r+5));ctx.lineTo(Math.cos(q+.2)*b.r,Math.sin(q+.2)*b.r);ctx.fill()}ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.arc(-b.r*.3,-b.r*.3,b.r*.35,0,TAU);ctx.fill()}
  else if(v==='wasp'){ctx.rotate(a);ctx.fillStyle='#ffd36b';ctx.beginPath();ctx.ellipse(0,0,5,3,0,0,TAU);ctx.fill();ctx.fillStyle='#2a2010';ctx.fillRect(-1,-3,1.5,6);ctx.fillRect(2,-3,1.5,6);ctx.fillStyle='rgba(230,250,255,.6)';ctx.beginPath();ctx.ellipse(-1,-4,3,1.6,-.5+Math.sin(anim*60)*.4,0,TAU);ctx.ellipse(-1,4,3,1.6,.5-Math.sin(anim*60)*.4,0,TAU);ctx.fill()}
  ctx.restore();ctx.globalCompositeOperation='lighter';
}
function drawStructs(g){
  for(const s of g.stc){
    if(!vis(s.x,s.y,40))continue;
    const fade=Math.min(1,s.life/0.6);
    ctx.globalAlpha=fade;
    if(s.kind==='mine'||s.kind==='golem'||s.kind==='treant'){drawSummon(s);ctx.globalAlpha=1;continue}
    if(s.kind==='wall'){
      wallSpr(s);
    }else if(true){
      turretSpr(s);
    }else{
      const col=s.col||'#b4c0d4',a=s.aim||0;
      ctx.fillStyle='#1b2233';ctx.strokeStyle=col;ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,TAU);ctx.fill();ctx.stroke();
      if(s.tvis==='tesla'){
        ctx.strokeStyle='#f4f08a';ctx.beginPath();ctx.moveTo(s.x,s.y+4);ctx.lineTo(s.x,s.y-12);ctx.stroke();
        ctx.fillStyle='#f4f08a';ctx.beginPath();ctx.arc(s.x,s.y-13,3+Math.sin(anim*12),0,TAU);ctx.fill();
      }else if(s.tvis==='thorn'){
        ctx.fillStyle=col;poly(s.x,s.y,s.r*0.75,3,a);ctx.fill();
      }else{
        ctx.strokeStyle=col;ctx.lineWidth=5;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+Math.cos(a)*16,s.y+Math.sin(a)*16);ctx.stroke();ctx.lineCap='butt';
      }
    }
    ctx.globalAlpha=1;
  }
}
/*ENEMY-SPRITES*/
/* Враги и боссы: вид сверху, в стиле героев. Все спрайты в нормированных единицах (радиус тела = 1), лицом в +x.
   ENS.draw(ctx,type,{t,r,ang?,st,hp,atk,lod,sub,col}) — вызывающий уже сделал translate(x,y). */
