
function drawBossFx(e){
  if(!e.boss)return;
  if(e.bar>0){const k=e.bar/e.barMax;ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(127,230,255,'+(0.35+0.4*k)+')';ctx.lineWidth=2+3*k;ctx.beginPath();ctx.arc(e.x,e.y,e.r+14+2*Math.sin(anim*5),0,TAU);ctx.stroke();ctx.fillStyle='rgba(127,230,255,'+(0.06+0.08*k)+')';ctx.fill();ctx.restore()}
  if(e.healT>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(111,227,160,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,e.r+22+(anim*30)%20,0,TAU);ctx.stroke();ctx.restore()}
  if(e.fort){ctx.save();ctx.strokeStyle='rgba(201,212,234,.7)';ctx.lineWidth=4;for(let i=0;i<6;i++){const a=i*TAU/6+anim*0.5;ctx.beginPath();ctx.arc(e.x,e.y,e.r+10,a,a+0.6);ctx.stroke()}ctx.restore()}
}
function drawEnemy(e){
  if(e.boss&&e.sub){ctx.save();ctx.globalAlpha=0.18;ctx.fillStyle='#d9b36a';ctx.beginPath();ctx.ellipse(e.x,e.y+6,e.r*1.1,e.r*0.5,0,0,TAU);ctx.fill();ctx.restore();return}
  drawEnemy0(e);drawBossFx(e);
}
function drawEnemy0(e){
  const x=e.x,y=e.y,r=e.r*(1+e.flash*1.3);
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x+3,y+r*0.72,r*0.95,r*0.42,0,0,TAU);ctx.fill();
  if(e.st==='wind'&&(e.ai==='charger'||e.ai==='boss')){
    const l=e.ai==='boss'?520:360,k=1-e.tm/(e.ai==='boss'?0.9:0.75);
    ctx.strokeStyle='rgba(255,77,94,'+(0.2+0.5*k).toFixed(2)+')';ctx.lineWidth=r*1.2;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(e.dir)*l,y+Math.sin(e.dir)*l);ctx.stroke();
  }
  const frozen=e.frz>0;
  let col=frozen?'#cdeeff':(e.flash>0?'#ffffff':e.col);
  if(e.st==='fuse'&&Math.floor(anim*14)%2===0)col='#ff5a3a';
  ctx.fillStyle=col;
  const sh=e.shape;
  let ens=false;
  if(ENS.has(e.type)){
    if(e.seedT===undefined)e.seedT=Math.random()*20;
    let tt=anim+e.seedT;
    if(e.frz>0||e.stun>0){if(e.tfix===undefined)e.tfix=tt;tt=e.tfix}else e.tfix=undefined;
    ctx.save();ctx.translate(x,y);ctx.rotate(e.st==='dash'||e.st==='wind'?e.dir:e.ang);
    ENS.draw(ctx,e.type,{t:tt,r:e.r*(1+e.flash*0.5),col:frozen?'#cdeeff':(e.st==='fuse'&&Math.floor(anim*14)%2===0?'#ff5a3a':e.col),st:e.st,hp:e.hp/e.max,sub:e.sub,lod:G.en.length>90&&!e.boss,cache:!!e.cch,r0:e.def.r});
    ctx.restore();
    if(e.flash>0.02){ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,255,255,'+Math.min(.7,e.flash*3).toFixed(2)+')';ctx.beginPath();ctx.arc(x,y,r*0.95,0,TAU);ctx.fill();ctx.globalCompositeOperation='source-over'}
    if(frozen){ctx.fillStyle='rgba(205,238,255,.35)';ctx.beginPath();ctx.arc(x,y,r*0.95,0,TAU);ctx.fill()}
    ens=true;
  }
  else if(sh==='circle'){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}
  else if(sh==='dart'||sh==='wedge'){
    ctx.save();ctx.translate(x,y);ctx.rotate(e.st==='dash'||e.st==='wind'?e.dir:e.ang);
    ctx.beginPath();ctx.moveTo(r+3,0);ctx.lineTo(-r,-r);ctx.lineTo(-r*0.5,0);ctx.lineTo(-r,r);ctx.closePath();ctx.fill();ctx.restore();
  }
  else if(sh==='tri'){poly(x,y,r+2,3,e.ang);ctx.fill()}
  else if(sh==='hex'){poly(x,y,r,6,0.5);ctx.fill()}
  else if(sh==='bomb'){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.strokeStyle='#ffd36b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+r*0.5,y-r*0.7);ctx.lineTo(x+r*0.9,y-r*1.3);ctx.stroke();ctx.fillStyle='#ff9a3c';ctx.beginPath();ctx.arc(x+r*0.9,y-r*1.3,2.2+Math.sin(anim*20),0,TAU);ctx.fill()}
  else if(sh==='diamond'){poly(x,y,r+3,4,anim*0.5);ctx.fill()}
  else if(sh==='shield'){
    ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
    ctx.strokeStyle=frozen?'#fff':'#e8eef8';ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y,r+2,e.ang-0.9,e.ang+0.9);ctx.stroke();
  }
  else if(sh==='blob'){ctx.beginPath();ctx.ellipse(x,y,r*(1+0.08*Math.sin(anim*7+x)),r*(1-0.08*Math.sin(anim*7+x)),0,0,TAU);ctx.fill()}
  else if(sh==='ghost'){
    ctx.globalAlpha=0.78;
    ctx.beginPath();ctx.arc(x,y-1,r,Math.PI,0);ctx.lineTo(x+r,y+r);
    for(let i=0;i<4;i++)ctx.lineTo(x+r-(i+0.5)*r/2,y+r-3+(i%2?3:-1));
    ctx.lineTo(x-r,y+r);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
  }
  else if(sh==='cross'){const t=r*0.45;ctx.fillRect(x-t,y-r,t*2,r*2);ctx.fillRect(x-r,y-t,r*2,t*2)}
  else if(sh==='ring'){ctx.strokeStyle=col;ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y,r-2,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(x,y,4+Math.sin(anim*6)*1.5,0,TAU);ctx.fill()}
  else if(sh==='star'){
    ctx.beginPath();
    for(let i=0;i<16;i++){const a=i*TAU/16+anim*0.4,rr=i%2?r*0.8:r*1.18;const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py)}
    ctx.closePath();ctx.fill();
  }
  else if(sh==='block'){
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(anim*0.7)*0.15);
    ctx.fillRect(-r,-r,r*2,r*2);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(-r*0.6,-r*0.6,r*1.2,r*1.2);
    ctx.fillStyle='#ffd36b';ctx.fillRect(-r*0.5,-r*0.1,r,r*0.2);ctx.restore();
  }
  else if(sh==='maw'){
    ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
    for(let i=0;i<3;i++){const a=anim*0.8+i*TAU/3;ctx.fillStyle=EL[EK[(i*2+Math.floor(anim*0.5))%6]].c;ctx.beginPath();ctx.arc(x+Math.cos(a)*r*1.1,y+Math.sin(a)*r*1.1,10,0,TAU);ctx.fill()}
    ctx.fillStyle='#10131c';ctx.beginPath();ctx.arc(x,y,r*0.45,0,TAU);ctx.fill();
    ctx.fillStyle='#ffe9a8';ctx.beginPath();ctx.arc(x+Math.cos(e.ang)*r*0.15,y+Math.sin(e.ang)*r*0.15,r*0.18,0,TAU);ctx.fill();
  }
  else if(sh==='ember'){
    ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
    ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,170,60,.85)';
    for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*0.55,h=r*(0.5+0.4*Math.sin(anim*9+i*2+x*0.1));ctx.beginPath();ctx.moveTo(x+Math.cos(a-0.3)*r*0.9,y+Math.sin(a-0.3)*r*0.9);ctx.lineTo(x+Math.cos(a)*(r+h),y+Math.sin(a)*(r+h));ctx.lineTo(x+Math.cos(a+0.3)*r*0.9,y+Math.sin(a+0.3)*r*0.9);ctx.closePath();ctx.fill()}
    ctx.globalCompositeOperation='source-over';
  }
  else if(sh==='spore'){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.fillStyle='rgba(50,100,36,.85)';for(let i=0;i<4;i++){const a=i*TAU/4+0.6;ctx.beginPath();ctx.arc(x+Math.cos(a)*r*0.9,y+Math.sin(a)*r*0.9,r*0.32,0,TAU);ctx.fill()}}
  else if(sh==='spike'){ctx.beginPath();for(let i=0;i<16;i++){const a=i*TAU/16,rr=i%2?r*0.82:r*1.32;const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py)}ctx.closePath();ctx.fill()}
  else if(sh==='crystal'){ctx.save();ctx.translate(x,y);ctx.rotate(e.ang);ctx.beginPath();ctx.moveTo(r+5,0);ctx.lineTo(0,-r*0.85);ctx.lineTo(-r*1.3,0);ctx.lineTo(0,r*0.85);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.moveTo(r+5,0);ctx.lineTo(0,-r*0.85);ctx.lineTo(-r*0.2,0);ctx.closePath();ctx.fill();ctx.restore()}
  else if(sh==='beetle'){
    ctx.save();ctx.translate(x,y);ctx.rotate(e.st==='dash'||e.st==='wind'?e.dir:e.ang);
    ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=1.6;
    for(let i=-1;i<=1;i++){const w=Math.sin(anim*16+i*2)*2;ctx.beginPath();ctx.moveTo(i*r*0.5,-r*0.5);ctx.lineTo(i*r*0.6+w,-r*1.15);ctx.moveTo(i*r*0.5,r*0.5);ctx.lineTo(i*r*0.6-w,r*1.15);ctx.stroke()}
    ctx.beginPath();ctx.ellipse(0,0,r*1.2,r*0.85,0,0,TAU);ctx.fill();
    ctx.beginPath();ctx.moveTo(-r*1.1,0);ctx.lineTo(r*0.6,0);ctx.stroke();
    ctx.restore();
  }
  else{ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}
  if(!ens&&sh!=='cross'&&sh!=='ring'){ctx.fillStyle='rgba(255,255,255,.14)';ctx.beginPath();ctx.arc(x-r*0.28,y-r*0.3,r*0.5,0,TAU);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke()}
  if(!ens&&!e.boss&&e.frz<=0&&sh!=='cross'&&sh!=='ring'&&sh!=='maw'){
    ctx.fillStyle='#ffe9a8';const er=r*0.45;
    for(let s=-1;s<=1;s+=2){ctx.beginPath();ctx.arc(x+Math.cos(e.ang+s*0.55)*er,y+Math.sin(e.ang+s*0.55)*er,Math.max(1.6,r*0.14),0,TAU);ctx.fill()}
  }
  {
    const dtp=e.def.dt,mx=dtp==='mixed';
    if(dtp==='phys'||mx){
      ctx.fillStyle='rgba(255,143,122,'+(mx?0.6:0.92)+')';
      const n=mx?10:6,ro=e.boss?11:6.5;
      for(let i=0;i<n;i++){const a=i*TAU/n+(e.boss?anim*0.3:0.3),c=Math.cos(a),s=Math.sin(a);ctx.beginPath();ctx.moveTo(x+c*(r+1)-s*3,y+s*(r+1)+c*3);ctx.lineTo(x+c*(r+ro),y+s*(r+ro));ctx.lineTo(x+c*(r+1)+s*3,y+s*(r+1)-c*3);ctx.closePath();ctx.fill()}
    }
    if(dtp==='magic'||mx){
      const mr=r+(mx?16:5.5);
      ctx.strokeStyle='rgba(116,185,255,'+(0.42+0.25*Math.sin(anim*4+x)).toFixed(2)+')';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x,y,mr,0,TAU);ctx.stroke();
      ctx.fillStyle='#9fd0ff';
      for(let i=0;i<3;i++){const a=anim*2.4+i*TAU/3;ctx.beginPath();ctx.arc(x+Math.cos(a)*mr,y+Math.sin(a)*mr,2,0,TAU);ctx.fill()}
    }
  }
  if(e.elite){ctx.strokeStyle='#ffd36b';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(x,y,r+4,0,TAU);ctx.stroke()}
  if(e.burn>0){ctx.strokeStyle='rgba(255,140,50,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r+3,0,TAU);ctx.stroke()}
  if(e.poison>0){ctx.fillStyle='rgba(160,230,110,.9)';ctx.beginPath();ctx.arc(x+r*0.6,y-r*0.9,2.5,0,TAU);ctx.fill()}
  if(e.slow>0){ctx.strokeStyle='rgba(120,200,255,.8)';ctx.lineWidth=1.5;ctx.setLineDash([3,3]);ctx.beginPath();ctx.arc(x,y,r+6,0,TAU);ctx.stroke();ctx.setLineDash([])}
  if(e.root>0){ctx.strokeStyle='rgba(98,193,90,.95)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x-r,y+r*0.6);ctx.lineTo(x+r,y+r*0.6);ctx.moveTo(x-r*0.6,y+r);ctx.lineTo(x+r*0.6,y+r*0.2);ctx.stroke()}
  if(e.stun>0){ctx.fillStyle='#ffe9a8';for(let i=0;i<3;i++){const a=anim*6+i*TAU/3;ctx.beginPath();ctx.arc(x+Math.cos(a)*r*0.8,y-r-5+Math.sin(a)*3,2,0,TAU);ctx.fill()}}
  if(e.wet>0){ctx.fillStyle='rgba(90,170,255,.9)';ctx.beginPath();ctx.arc(x-r*0.7,y-r*0.9,2.2,0,TAU);ctx.fill()}
  if(e.rust>0){ctx.strokeStyle='rgba(197,138,74,.9)';ctx.lineWidth=2;ctx.setLineDash([2,4]);ctx.beginPath();ctx.arc(x,y,r+1,0,TAU);ctx.stroke();ctx.setLineDash([])}
  if(e.elite||(e.hp<e.max&&!e.boss&&r>=14)){
    const w=e.elite?44:34,by=y-r-(e.elite?14:9);
    ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(x-w/2,by,w,4);
    ctx.fillStyle=e.elite?'#ffd36b':'#ff6b7a';ctx.fillRect(x-w/2,by,w*clamp(e.hp/e.max,0,1),4);
    if(e.elite){ctx.textAlign='center';ctx.font='700 10px "Golos Text",system-ui,sans-serif';ctx.fillStyle='#ffd36b';ctx.fillText(AFFIX[e.affix].n,x,by-3)}
  }
}
function drawEnemies(g){
  const n=g.en.length,p=g.p;
  if(n>40){
    const ds=[];for(const e of g.en)if(!e.dead)ds.push((e.x-p.x)**2+(e.y-p.y)**2);
    ds.sort((a,b)=>a-b);const lim=ds[Math.min(ds.length-1,22)];
    for(const e of g.en){
      e.cch=!e.boss&&!e.elite&&e.st==='move'&&!e.def.rage&&e.flash<=0.02&&e.type!=='sandworm'&&(e.x-p.x)**2+(e.y-p.y)**2>lim;
    }
  }else for(const e of g.en)e.cch=false;
  for(const e of g.en){if(!e.dead&&vis(e.x,e.y,80))drawEnemy(e)}
}
function drawRocks(g){
  let i=0;
  for(const rk of rockPos(g)){
    SP.shadow(ctx,rk.x,rk.y+rk.r*1.1,rk.r*1.1,.5);
    ctx.save();ctx.translate(rk.x,rk.y);SP.rock(ctx,anim*.35+i,rk.r/17,i+1);ctx.restore();ctx.globalAlpha=1;i++;
  }
}
