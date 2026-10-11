/* =====================================================================
   ХОД ИГРЫ
   ===================================================================== */
const DASH_CD=BAL.hero.dashCd;
function getInput(){
  const k=SAVE.keys;
  let x=(codes[k.right]||codes.ArrowRight?1:0)-(codes[k.left]||codes.ArrowLeft?1:0);
  let y=(codes[k.down]||codes.ArrowDown?1:0)-(codes[k.up]||codes.ArrowUp?1:0);
  if(joy.on){x=joy.dx;y=joy.dy}
  let m=Math.hypot(x,y);
  if(m>1){x/=m;y/=m;m=1}
  return {x:x,y:y,m:m};
}
function dashCd(){const g=G;return DASH_CD*((g.cls&&g.cls.dashx)||1)*(1-(g.S.drc||0))}
function tryDash(){
  const g=G;
  if(!g||mode!=='play'||uiOpen())return;
  const p=g.p;
  if(p.dash>0||p.dch<=0||g.frz>0)return;
  g.rootT=0;
  const i=getInput();
  g.dashAng=i.m>0.05?Math.atan2(i.y,i.x):p.face;
  if(g.start==='air'&&g.pl>=3){g.bf.dm={t:2,v:Math.max(0.2,g.bf.dm.t>0?g.bf.dm.v:0)};tickBuffs(0)}
  g.dashHit=null;g.dashSp=0;
  if(g.ifx&&g.ifx.shadow)g.shdT=2.5;
  g.dashT=0.18;p.dch--;p.dash=0.28;p.inv=Math.max(p.inv,0.32);
  if(g.start==='earth'){const n=g.plates||0;explodeAt(p.x,p.y,78*(1+0.18*n),(22+7*g.el.earth)*(1+0.45*n),{dt:'phys',col:'#c9974f',knock:320+40*n,st:{stun:0.5+0.15*n},src:'skill',spike:true});g.shake=Math.max(g.shake,5+n);if(n){g.plates=0;tickBuffs(0);ring(p.x,p.y,78*(1+0.18*n)+20,'#e8c38a',0.5);if(g.tx.length<50)g.tx.push({x:p.x,y:p.y-36,t:0.9,txt:'Плиты ×'+n,big:true,col:'#e8c38a'})}}
  ring(p.x,p.y,40,'#8febd0',0.3);puff(p.x,p.y,'#8febd0',14,200,0.4,3);
  sfx(420,0.14,'triangle',0.05,500);
}
function trailFx(dt,moving,dash){
  const g=G,p=g.p;
  g.trT-=dt;
  if(g.trT>0)return;
  g.trT=dash?0.02:0.05;
  if(!moving&&!dash)return;
  const own=EK.filter(k=>g.el[k]>0);
  const k=Math.random()<0.6?g.start:pickOf(own.length?own:[g.start]);
  const c=EL[k].c,c2=EL[k].c2;
  const base={x:p.x+rnd(-4,4),y:p.y+rnd(-2,8),life:0.45,max:0.45,col:Math.random()<0.4?c2:c,size:2.4};
  if(k==='fire'){base.vy=rnd(-45,-15);base.vx=rnd(-12,12)}
  else if(k==='water'){base.vy=rnd(10,35);base.vx=rnd(-18,18);base.size=2}
  else if(k==='earth'){base.vy=rnd(-8,8);base.vx=rnd(-20,20);base.size=3.2;base.life=0.6;base.max=0.6}
  else if(k==='air'){base.vx=-Math.cos(p.face)*80;base.vy=-Math.sin(p.face)*80;base.size=1.8;base.life=0.3;base.max=0.3}
  else if(k==='metal'){base.vx=rnd(-60,60);base.vy=rnd(-60,60);base.size=1.6;base.life=0.22;base.max=0.22}
  else{base.vy=rnd(-30,0);base.vx=rnd(-30,30);base.size=2.8;base.life=0.7;base.max=0.7}
  if(g.pt.length<470)g.pt.push(base);
  if(dash)g.gh.push({x:p.x,y:p.y,t:0.3,max:0.3});
}
function movePlayer(dt){
  const g=G,p=g.p,inp=getInput(),M=MAPS[g.map];
  if(inp.m>0.05)p.face=Math.atan2(inp.y,inp.x);
  const moving=inp.m>0.05;
  if(g.leap){
    const L=g.leap;L.t+=dt;const k=Math.min(1,L.t/L.T),e=k*k*(3-2*k);
    p.x=L.x0+(L.x1-L.x0)*e;p.y=L.y0+(L.y1-L.y0)*e;g.leapH=Math.sin(k*Math.PI)*60;p.vx=p.vy=0;
    if(k>=1){g.leap=null;g.leapH=0;const pr=L.pr;explodeAt(p.x,p.y,pr.r,pr.dmg,{dt:pr.dt,col:pr.col,st:pr.st,knock:pr.knock||260,spike:true,shake:9});smokeAt(p.x,p.y,30,4);if(pr.zone)addZone(p.x,p.y,pr.zone);if(pr.shards)CAST.nova({r:20,dmg:0,dt:'phys',col:pr.col,shards:pr.shards},{px:p.x,py:p.y,col:pr.col})}
    cam.x+=(p.x-VW/2-cam.x)*Math.min(1,dt*8);cam.y+=(p.y-VH/2-cam.y)*Math.min(1,dt*8);
    return;
  }
  if(g.dashT>0){
    g.dashT-=dt;
    const dsp=g.dashSp||620;
    p.vx=Math.cos(g.dashAng)*dsp;p.vy=Math.sin(g.dashAng)*dsp;
    if(g.dashHit){const H=g.dashHit;
      for(const e of g.en){if(e.dead||e.sub||H.hit.has(e))continue;const dx=e.x-p.x,dy=e.y-p.y,rr=H.w+e.r;if(dx*dx+dy*dy<rr*rr){H.hit.add(e);hitEnemy(e,H.dmg,{dt:H.dt,st:H.st,col:H.col,src:'skill',proj:true});if(!e.dead&&H.knock)knockE(e,-Math.sin(g.dashAng)*(angd(Math.atan2(dy,dx),g.dashAng)>0?-1:1),Math.cos(g.dashAng)*(angd(Math.atan2(dy,dx),g.dashAng)>0?-1:1),H.knock)}}
      if(H.trail){H.tt-=dt;if(H.tt<=0){H.tt=0.05;addZone(p.x,p.y,H.trail)}}
      if(g.dashT<=0){if(H.end)CAST.nova(H.end,{px:p.x,py:p.y,col:H.col});g.dashHit=null;g.dashSp=0}
    }
    trailFx(dt,true,true);
  }else{
    const pl=g.pools.length?poolAt(g,p.x,p.y):null;
    const mud=(pl&&!imm(pl.kind))?(pl.kind==='bramble'?0.6:(pl.kind==='quicksand'?0.5:1)):1;
    const fro=g.frz>0,slowF=((g.bliz&&!imm('blizzard'))?0.8:1)*(g.rootT>0?0.2:1)*(g.pslow>0?0.6:1);
    const sp=150*(g.E.spd+0.03*g.el.air)*mud*slowF,k=Math.min(1,(fro?12:((M.ice&&!imm('slip'))?3.2:15))*dt);
    const ix=fro?0:inp.x,iy=fro?0:inp.y;
    p.vx+=(ix*sp-p.vx)*k;p.vy+=(iy*sp-p.vy)*k;
    trailFx(dt,moving||Math.hypot(p.vx,p.vy)>60,false);
  }
  p.x+=(p.vx+p.kx)*dt;p.y+=(p.vy+p.ky)*dt;
  const kk=Math.exp(-7*dt);p.kx*=kk;p.ky*=kk;
  if(g.solids.length)pushOutP(p);
  {// анимация героя: поворот по движению, фаза шага, хвосты
    const spd=Math.hypot(p.vx,p.vy),dash=g.dashT>0;
    if(g.hf===undefined){g.hf=p.face;g.hph=0;g.hmv=0;g.hsim=HTD.mkSim()}
    let look=null;
    if(g.hlt>0){g.hlt-=dt;look=g.hla}
    if(g.hand&&g.hand.hasT)look=g.hand.aim;
    if(dash)look=null;
    if(look!==null){g.hf+=angd(look,g.hf)*Math.min(1,dt*14)}
    else if(spd>25||dash){g.hf+=angd(Math.atan2(p.vy,p.vx),g.hf)*Math.min(1,dt*(dash?30:12))}
    if(g.hat){g.hat.t+=dt/g.hat.dur;if(g.hat.t>=1)g.hat=null}
    g.hmv+=(Math.min(1,spd/(150*Math.max(.6,g.E.spd)))-g.hmv)*Math.min(1,dt*10);
    g.hph+=dt*spd*0.085;
    g.hch=HTD.step(g.hsim,g.start||'fire',dt,p.x,p.y,g.hf);
  }
  cam.x+=(p.x-VW/2-cam.x)*Math.min(1,dt*8);
  cam.y+=(p.y-VH/2-cam.y)*Math.min(1,dt*8);
}
function itemFx(dt){
  const g=G,p=g.p,F=g.ifx;if(!F)return;
  if(g.shdT>0)g.shdT-=dt;
  if(g.phase!=='fight')return;
  if(F.thunder){g.thT=(g.thT||0)-dt;if(g.thT<=0){g.thT=2.5;let best=null,bh=0;
    for(const e of g.en){if(e.dead||e.sub)continue;if((e.x-p.x)**2+(e.y-p.y)**2>480*480)continue;if(e.hp>bh){bh=e.hp;best=e}}
    if(best){chainBolt(best.x+rnd(-30,30),best.y-320,best,0,60+14*g.wave,0,{dt:'magic',shock:true,col:'#f4f08a',src:'item'});ring(best.x,best.y,40,'#f4f08a',0.3);g.shake=Math.max(g.shake,3);sfx(900,0.12,'sawtooth',0.03,-600)}}}
  if(F.aura){g.auT=(g.auT||0)-dt;if(g.auT<=0){g.auT=0.5;for(const e of g.en){if(e.dead||e.sub)continue;if((e.x-p.x)**2+(e.y-p.y)**2<(120+e.r)**2)applySt(e,{burn:[5+1.3*g.wave,1.2]},1)}}}
  if(F.phoenix&&p.hp<g.S.maxHp*0.3&&g.t>(g.phU||0)){g.phU=g.t+60;heal(g.S.maxHp*0.35);explodeAt(p.x,p.y,230,40+15*g.wave,{dt:'magic',col:'#ffb347',st:{burn:[8+2*g.wave,3]},knock:320,src:'item',shake:9});ring(p.x,p.y,260,'#ffd36b',0.8);puff(p.x,p.y,'#ffb347',30,300,0.8,4);toast('Перо феникса','Вы восстали из пламени')}
}
function drawItemFx(g){
  const F=g.ifx,p=g.p;if(!F)return;
  if(F.aura&&g.phase==='fight'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,122,58,'+(0.22+0.1*Math.sin(anim*6))+')';ctx.lineWidth=2;ctx.setLineDash([6,8]);ctx.lineDashOffset=-anim*20;ctx.beginPath();ctx.arc(p.x,p.y,120,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.restore()}
  if(g.shdT>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(183,155,255,'+(0.18*Math.min(1,g.shdT))+')';ctx.beginPath();ctx.arc(p.x,p.y,22,0,TAU);ctx.fill();ctx.restore()}
}
function heroMech(dt){
  const g=G,p=g.p,k=g.start;if(!g.cls)return;
  if(k==='fire'){
    if(g.ovhT>0)g.ovhT-=dt;
    if(g.burnSelf>0){g.burnSelf-=dt;g.bsT-=dt;if(g.bsT<=0){g.bsT=0.5;const d=g.S.maxHp*0.012;p.hp=Math.max(1,p.hp-d);puff(p.x,p.y,'#ff7a3a',5,90,0.4,2.6);if(g.tx.length<50)g.tx.push({x:p.x,y:p.y-22,t:0.5,txt:'-'+Math.round(d),big:false,col:'#ff9a5a'})}}
    g.heatIdle=(g.heatIdle||0)+dt;if(g.heatIdle>3)g.heat=Math.max(0,(g.heat||0)-6*dt);
    if(g.heat>=100&&Math.random()<0.4)puff(p.x+rnd(-8,8),p.y-10,'#ffb347',1,60,0.4,2.2);
  }else if(k==='earth'){
    const sp=Math.hypot(p.vx,p.vy);
    if(g.phase==='fight'&&sp<18&&!(g.dashT>0)){g.stillT=(g.stillT||0)+dt;if(g.stillT>=1&&(g.plates||0)<5){g.stillT=0;g.plates=(g.plates||0)+1;tickBuffs(0);ring(p.x,p.y,30+g.plates*5,'#c9974f',0.35);puff(p.x,p.y+6,'#a4825a',6,90,0.4,3);sfx(160+g.plates*30,0.08,'square',0.025,40)}}
    else g.stillT=0;
  }else if(k==='air'){
    const sp=Math.hypot(p.vx,p.vy);
    g.imp=clamp((g.imp||0)+(sp>90?32:-45)*dt,0,100);
    if(g.imp>=100&&!g.impR){g.impR=true;ring(p.x,p.y,40,'#e6fff7',0.35);sfx(720,0.08,'triangle',0.03,300)}
    if(g.imp<100)g.impR=false;
    if(g.impR&&Math.random()<0.5&&g.pt.length<470)g.pt.push({x:p.x+rnd(-6,6),y:p.y+rnd(-6,6),vx:-p.vx*0.3,vy:-p.vy*0.3,life:0.3,max:0.3,col:'#e6fff7',size:2});
  }
}
function update(dt){
  const g=G,p=g.p,S=g.S;
  if(g.slowmo>0){g.slowmo-=dt;dt*=0.35}
  g.zk=Math.max(0,g.zk-dt*0.2);
  gatherWorld(g,p.x,p.y);
  g.t+=dt;
  p.inv=Math.max(0,p.inv-dt);p.dash=Math.max(0,p.dash-dt);
  {const mxd=1+(S.dch||0);if(p.dch<mxd){p.dcr+=dt;const need=dashCd();if(p.dcr>=need){p.dcr=0;p.dch++;if(p.dch>=mxd){p.dcr=0}ring(p.x,p.y,26,'#8febd0',0.25)}}else p.dcr=0}
  g.shield=Math.max(0,g.shield-dt);g.vac=Math.max(0,g.vac-dt);g.block=Math.max(0,g.block-dt);
  g.slowAll=Math.max(0,g.slowAll-dt);g.nomana=Math.max(0,(g.nomana||0)-dt);
  tickBuffs(dt);
  p.hp=Math.min(S.maxHp,p.hp+g.E.regen*dt);
  p.mana=Math.min(S.maxMana,p.mana+S.mreg*dt);
  for(const s of g.slots)if(s&&s.cd>0)s.cd=Math.max(0,s.cd-dt);
  for(const b of g.bag)if(b&&b.cd>0)b.cd=Math.max(0,b.cd-dt);
  if(g.ult.cd>0)g.ult.cd=Math.max(0,g.ult.cd-dt);
  movePlayer(dt);
  heroMech(dt);
  itemFx(dt);
  poolsTick(dt);
  envTick(dt);
  if(g.start==='earth'&&g.pl>=3){g.pasT-=dt;if(g.pasT<=0){g.pasT=20;g.shield=Math.max(g.shield,3);ring(g.p.x,g.p.y,60,'#c9974f',0.6);toast('Каменная кожа','Щит на 3 секунды')}}
  if(g.phase==='fight')weapons(dt);
  updPlayerSide(dt);
  waveLogic(dt);
  updEnemies(dt);
  updEnemyProj(dt);
  /* кристаллы и монеты */
  for(const m of g.gem){
    const dx=p.x-m.x,dy=p.y-m.y,d=Math.hypot(dx,dy)||1;
    if(!m.fly&&(m.vx||m.vy)){m.x+=m.vx*dt;m.y+=m.vy*dt;const f=Math.exp(-4.5*dt);m.vx*=f;m.vy*=f;if(Math.abs(m.vx)+Math.abs(m.vy)<4)m.vx=m.vy=0}
    if(d<S.magnet)m.fly=true;
    if(m.fly){const s=g.vac>0?900:400;m.x+=dx/d*s*dt;m.y+=dy/d*s*dt}
    if(d<p.r+7){
      m.dead=true;
      if(m.k==='coin'){p.gold+=Math.max(1,Math.round(m.v*(1+S.goldm)));sfx(900,0.03,'sine',0.015)}
      else{gainXp(m.v);sfx(600+Math.min(600,m.v*30+p.lv*8),0.04,'sine',0.02)}
    }
  }
  for(const q of g.pk){
    q.life-=dt;
    if(q.life<=0){q.dead=true;continue}
    const dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy)||1;
    if(d<S.magnet*0.8){q.x+=dx/d*260*dt;q.y+=dy/d*260*dt}
    if(d<p.r+14){q.dead=true;usePickup(q.type)}
  }
  /* эффекты */
  for(const q of g.pt){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=0.96;q.vy*=0.96;q.life-=dt;if(q.life<=0)q.dead=true}
  for(const f of g.fx){f.t+=dt;if(f.t>=f.life)f.dead=true}
  for(const t of g.tx){t.t-=dt;t.y-=40*dt;if(t.t<=0)t.dead=true}
  {
    const fr=Math.exp(-(MAPS[g.map].ice?1.3:3.4)*dt);
    for(const q of g.deb){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=fr;q.vy*=fr;q.rot+=q.vr*dt;q.vr*=fr;q.life-=dt;if(q.life<=0)q.dead=true}
    for(const q of g.smk){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=0.97;q.vy*=0.97;q.life-=dt;if(q.life<=0)q.dead=true}
    for(const q of g.spk){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=0.93;q.vy*=0.93;q.life-=dt;if(q.life<=0)q.dead=true}
    for(const q of g.fl){q.t+=dt;if(q.t>=q.life)q.dead=true}
    for(const q of g.sc){q.life-=dt;if(q.life<=0)q.dead=true}
  }
  g.shake=Math.max(0,g.shake-dt*22);
  g.hitFlash=Math.max(0,g.hitFlash-dt);
  for(const m of g.merch)m.bob+=dt*2;
  compact(g.pch);compact(g.sk);compact(g.deb);compact(g.smk);compact(g.spk);compact(g.fl);compact(g.sc);compact(g.pt);compact(g.fx);compact(g.hfx);compact(g.afx);compact(g.tx);compact(g.pr);compact(g.zn);compact(g.bl);compact(g.tor);compact(g.gem);compact(g.pk);
  compact(g.em);compact(g.cfx);compact(g.stc);compact(g.eps);compact(g.tgs);compact(g.bolts);compact(g.beams);compact(g.gh);
  if(mode==='play'&&g.pending>0&&!g.lvlOpen&&!g.over)openLevelUp();
}
function waveLogic(dt){
  const g=G,w=g.wave;
  if(g.phase==='inter'){
    g.inter-=dt;
    if(g.inter<=0)startWave(w+1);
    return;
  }
  g.wt+=dt;
  const boss=!!bossKeyFor(w);
  hazards(dt);
  g.spawnT-=dt;
  if(g.spawnT<=0){
    const cap=Math.min(180,45+14*w);
    const n=boss?1:1+Math.floor((w-1)/3);
    if(g.en.length<cap)for(let i=0;i<n;i++)spawnEnemy(pickType(w));
    g.spawnT=Math.max(0.28,(w===1?1.3:1.0-0.045*w))*(boss?2:1)/(MAPS[g.map].foe.cnt||1);
  }
  if(w>=3){
    g.eliteT-=dt;
    if(g.eliteT<=0&&g.en.length<170){
      spawnEnemy(eliteType(w),{elite:true});
      g.eliteT=rnd(Math.max(8,18-0.4*w),Math.max(12,26-0.6*w));
      toast('Элита','Золотая обводка: падает бонус и крупные кристаллы');
    }
  }
  if(w>=2&&!boss){
    g.evT-=dt;
    if(g.evT<=0){
      g.evT=rnd(24,34);
      const a=rnd(0,TAU),n=8+2*w,d=Math.hypot(VW,VH)/2+90;
      for(let i=0;i<n&&g.en.length<200;i++){
        const aa=a+rnd(-0.6,0.6),dd=d+rnd(0,70);
        spawnAt(Math.random()<0.5?'swift':'wisp',g.p.x+Math.cos(aa)*dd,g.p.y+Math.sin(aa)*dd,hpMul(w),dmgMul(w));
      }
      toast('Рой!','');sfx(200,0.3,'sawtooth',0.05,-80);
    }
  }
  if(boss){
    if(g.bossDead){
      g.endT=(g.endT===undefined?1.8:g.endT)-dt;
      if(g.endT<=0){
        g.endT=undefined;
        if(w===WAVES_TOTAL&&!g.endless)winRun();
        else endWave();
      }
    }
  }else if(g.wt>=g.waveDur)endWave();
}
function essenceFor(g,win){
  return Math.round(g.wave*6+g.kills/15+g.bossKills*20+(win||g.endless?120:0)+(g.endless?(g.wave-WAVES_TOTAL)*8:0));
}
function payEssence(win){
  const g=G,total=essenceFor(g,win),add=Math.max(0,total-(g.essPaid||0));
  g.essPaid=total;
  SAVE.ess+=add;
  return add;
}
function endRun(win){
  const g=G;
  if(g.over)return;
  g.over=true;mode='over';
  const add=payEssence(false);
  SAVE.runs++;SAVE.best=Math.max(SAVE.best,g.wave);
  store();
  showOver(false,add);
  sfx(140,0.5,'sawtooth',0.06,-80);
}
function winRun(){
  const g=G;
  g.over=true;mode='over';g.victory=true;
  const add=payEssence(true);
  SAVE.runs++;SAVE.wins++;SAVE.best=Math.max(SAVE.best,g.wave);
  store();
  showOver(true,add);
  sfx(520,0.6,'triangle',0.06,400);
}
function startRun(el){
  G=mkState(el,biomeFor(1));
  const g=G;
  mode='play';
  g.el[el]=1;
  recalc();
  g.p.gold=30+25*(SAVE.meta.startgold||0);
  cam.x=-VW/2;cam.y=-VH/2;
  $('menu').hidden=true;$('over').hidden=true;$('pause').hidden=true;$('levelup').hidden=true;$('shop').hidden=true;
  $('hud').hidden=false;
  if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
  hc={};
  buildTopHud();
  startWave(1);
  showBiome(g.map);
}
function quitToMenu(){
  mode='menu';G=null;clearTimeout(biomeShow);clearTimeout(biomeTimer);$('biome').hidden=true;
  $('hud').hidden=true;$('over').hidden=true;$('pause').hidden=true;$('levelup').hidden=true;$('shop').hidden=true;
  $('menu').hidden=false;
  renderMenu();
}
function skipWave(){
  const g=G;
  if(!g||mode!=='play'||uiOpen()||g.phase!=='inter')return;
  startWave(g.wave+1);
}
function interact(){
  const g=G;
  if(!g||mode!=='play'||uiOpen())return;
  const m=nearMerchant();
  if(m)openShop(m);
}
function togglePause(){
  const g=G;
  if(mode!=='play'||!g||g.lvlOpen||g.shopOpen||g.treeOpen)return;
  g.paused=!g.paused;$('pause').hidden=!g.paused;
  if(g.paused){fillStats();for(const k in codes)codes[k]=false}
}

