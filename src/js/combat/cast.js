/* ---------- типы способностей ---------- */
const CAST={};
CAST.nova=(pr,c)=>{
  const g=G,R=pr.r*(1+g.S.area);
  if(pr.pull){for(const e of g.en){if(e.dead)continue;const dx=c.px-e.x,dy=c.py-e.y,dd=Math.hypot(dx,dy);if(dd<R*1.8&&dd>24)knockE(e,dx,dy,pr.pull)}}
  explodeAt(c.px,c.py,R,pr.dmg,{dt:pr.dt,col:pr.col||c.col,st:pr.st,knock:pr.knock,shake:5});
  if(pr.shards){
    const s=pr.shards,off=rnd(0,TAU);
    for(let i=0;i<s.n;i++){
      const a=off+i*TAU/s.n;
      shoot({vis:s.vis,x:c.px,y:c.py,vx:Math.cos(a)*s.spd,vy:Math.sin(a)*s.spd,r:6,dmg:s.dmg,dt:s.dt,life:s.life,pierce:s.pierce,col:s.col,st:s.st,src:'proj'});
    }
  }
  if(pr.ring){
    for(let i=0;i<pr.ring.n;i++){
      const a=i*TAU/pr.ring.n+rnd(0,0.5);
      addZone(c.px+Math.cos(a)*R*0.9,c.py+Math.sin(a)*R*0.9,pr.ring.zone);
    }
  }
};
CAST.blast=(pr,c)=>{
  const g=G,t=clampRange(c,pr.range||430);
  g.bl.push({x:t.x,y:t.y,t:pr.delay,max:pr.delay,r:pr.r*(1+g.S.area),dmg:pr.dmg,dt:pr.dt,st:pr.st,knock:pr.knock||0,vis:pr.vis,col:pr.col||c.col,zone:pr.zone,dead:false});
};
CAST.rain=(pr,c)=>{
  const g=G,t=clampRange(c,450),area=1+g.S.area;
  for(let i=0;i<pr.n;i++){
    const a=rnd(0,TAU),d=Math.sqrt(Math.random())*pr.spread*(1+g.S.area*0.5),tt=pr.delay+i*pr.gap;
    g.bl.push({x:t.x+Math.cos(a)*d,y:t.y+Math.sin(a)*d,t:tt,max:tt,r:pr.r*area,dmg:pr.dmg,dt:pr.dt,st:pr.st,knock:pr.knock||0,vis:pr.vis,col:pr.col||c.col,zone:pr.zone,dead:false});
  }
};
CAST.zone=(pr,c)=>{
  if(pr.self)addZone(c.px,c.py,pr,true);
  else{const t=clampRange(c,pr.range||420);addZone(t.x,t.y,pr,false)}
};
CAST.zones=(pr,c)=>{
  const t=clampRange(c,420);
  for(let i=0;i<pr.n;i++){
    const a=rnd(0,TAU),d=Math.sqrt(Math.random())*pr.spread;
    addZone(t.x+Math.cos(a)*d,t.y+Math.sin(a)*d,pr,false);
  }
};
/* одна «порция» удерживаемой струи (вызывается каждые pr.tick секунд, пока держат кнопку) */
CAST.channel=(pr,c)=>{
  const k=Math.max(2,Math.round(pr.n/4));
  for(let i=0;i<k;i++){const a=c.ang+(Math.random()-0.5)*pr.spread,sp=pr.spd*rnd(0.85,1.1);
    shoot({vis:pr.vis,x:c.px+Math.cos(c.ang)*10,y:c.py+Math.sin(c.ang)*10,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:pr.r,dmg:pr.dmg*0.18,dt:pr.dt,life:pr.life*rnd(1.1,1.45),pierce:pr.pierce,col:pr.col||c.col,st:pr.st,src:'proj'})}
};
CAST.proj=(pr,c)=>{
  const n=pr.n;
  for(let i=0;i<n;i++){
    const a=c.ang+(n===1?0:(i/(n-1)-0.5)*pr.spread);
    shoot({vis:pr.vis,x:c.px,y:c.py,vx:Math.cos(a)*pr.spd,vy:Math.sin(a)*pr.spd,r:pr.r,dmg:pr.dmg,dt:pr.dt,life:pr.life,pierce:pr.pierce,col:pr.col||c.col,st:pr.st,trail:pr.trail,knock:pr.knock,blast:pr.blast,homing:pr.homing,src:'proj'});
  }
};
CAST.chain=(pr,c)=>{
  const g=G,p=g.p;
  const near=nearList(p.x,p.y,460);
  if(!near.length)return false;
  near.sort((a,b)=>((a.x-c.x)**2+(a.y-c.y)**2)-((b.x-c.x)**2+(b.y-c.y)**2));
  for(let i=0;i<pr.n&&i<near.length;i++)chainBolt(p.x,p.y,near[i],pr.jumps,pr.dmg,pr.range,pr);
};
CAST.beam=(pr,c)=>{
  const g=G,x2=c.px+Math.cos(c.ang)*pr.len,y2=c.py+Math.sin(c.ang)*pr.len;
  g.beams.push({x1:c.px,y1:c.py,x2:x2,y2:y2,w:pr.w,t:0.3,max:0.3,col:pr.col||c.col,vis:pr.vis});
  let hits=0;
  for(const e of g.en){
    if(e.dead)continue;
    if(distSeg(e.x,e.y,c.px,c.py,x2,y2)<pr.w/2+e.r){
      hitEnemy(e,pr.dmg,{dt:pr.dt,st:pr.st,col:pr.col||c.col,src:'skill',aoe:true,proj:true});
      hits++;
    }
  }
  G.lastHits=hits;
  if(pr.healHit&&hits)heal(pr.healHit*Math.min(hits,6));
  g.shake=Math.max(g.shake,pr.vis==='rail'?7:2);
  puff(c.px,c.py,pr.col||c.col,6,120,0.3,2.4);
};
CAST.boomer=(pr,c)=>{
  const n=pr.n||1;
  for(let i=0;i<n;i++){const a=c.ang+(n===1?0:(i/(n-1)-0.5)*(pr.spread||0.5));
    shoot({vis:pr.vis||'boomer',x:c.px,y:c.py,vx:Math.cos(a)*pr.spd,vy:Math.sin(a)*pr.spd,r:pr.r,dmg:pr.dmg,dt:pr.dt,life:pr.life,life0:pr.life,ret:true,spd0:pr.spd,pierce:99,col:pr.col||c.col,st:pr.st,knock:pr.knock,trail:pr.trail,src:'proj'})}
};
CAST.cone=(pr,c)=>{
  const g=G,R=pr.range*(1+g.S.area*0.5);let hits=0;
  for(const e of g.en){if(e.dead||e.sub)continue;const dx=e.x-c.px,dy=e.y-c.py,d=Math.hypot(dx,dy);if(d>R+e.r)continue;
    if(Math.abs(angd(Math.atan2(dy,dx),c.ang))>pr.arc/2+0.15)continue;
    hitEnemy(e,pr.dmg,{dt:pr.dt,st:pr.st,col:pr.col,src:'skill',aoe:true});hits++;
    if(!e.dead&&pr.knock)knockE(e,dx,dy,pr.knock*(1.2-d/R*0.4))}
  g.lastHits=hits;
  g.cfx.push({x:c.px,y:c.py,ang:c.ang,range:R,arc:pr.arc,t:0,life:0.32,col:pr.col||c.col,vis:pr.vis||'arc'});
  g.shake=Math.max(g.shake,pr.knock>300?6:3);
};
CAST.dash=(pr,c)=>{
  const g=G,p=g.p,t=clampRange(c,pr.dist);
  const dx=t.x-p.x,dy=t.y-p.y,L=Math.hypot(dx,dy)||1;
  if(pr.blink){
    const x0=p.x,y0=p.y;g.gh.push({x:x0,y:y0,t:0.4,max:0.4});
    for(const e of g.en){if(e.dead||e.sub)continue;if(distSeg(e.x,e.y,x0,y0,t.x,t.y)<pr.w+e.r){hitEnemy(e,pr.dmg,{dt:pr.dt,st:pr.st,col:pr.col,src:'skill',aoe:true,proj:true});if(!e.dead&&pr.knock)knockE(e,e.x-t.x,e.y-t.y,pr.knock)}}
    g.beams.push({x1:x0,y1:y0,x2:t.x,y2:t.y,w:pr.w,t:0.25,max:0.25,col:pr.col,vis:'rail'});
    p.x=t.x;p.y=t.y;p.inv=Math.max(p.inv,0.3);
    if(pr.burst)CAST.nova(pr.burst,Object.assign({},c,{px:p.x,py:p.y}));
    puff(p.x,p.y,pr.col,14,200,0.4,3);return;
  }
  g.dashAng=Math.atan2(dy,dx);g.dashSp=pr.spd||1000;g.dashT=L/g.dashSp;p.inv=Math.max(p.inv,g.dashT+0.15);
  g.dashHit={dmg:pr.dmg,dt:pr.dt,st:pr.st,col:pr.col,w:pr.w,knock:pr.knock||0,trail:pr.trail||null,tt:0,hit:new Set(),end:pr.end||null};
};
CAST.leap=(pr,c)=>{
  const g=G,p=g.p,t=clampRange(c,pr.dist);
  g.leap={x0:p.x,y0:p.y,x1:t.x,y1:t.y,t:0,T:pr.T||0.5,pr:pr};p.inv=Math.max(p.inv,(pr.T||0.5)+0.2);
  ring(t.x,t.y,pr.r,pr.col,pr.T||0.5);
};
CAST.wall=(pr,c)=>{
  const g=G,t=clampRange(c,pr.range||300),px=-Math.sin(c.ang),py=Math.cos(c.ang),n=pr.n;
  for(let i=0;i<n;i++){const o=(i-(n-1)/2)*pr.gap;addZone(t.x+px*o,t.y+py*o,{r:pr.r,life:pr.life,dps:pr.dps,dt:pr.dt,vis:pr.vis,col:pr.col,st:pr.st})}
};
CAST.strikes=(pr,c)=>{
  const g=G,t=clampRange(c,440);
  for(let i=0;i<pr.n;i++){const a=rnd(0,TAU),d=i?Math.sqrt(Math.random())*pr.spread:0,x=t.x+Math.cos(a)*d,y=t.y+Math.sin(a)*d;
    ring(x,y,pr.r,pr.col,pr.delay+i*pr.gap);
    later(pr.delay+i*pr.gap,()=>{skyStrike(x,y,pr.col,i===0);explodeAt(x,y,pr.r,pr.dmg,{dt:pr.dt,col:pr.col,st:pr.st,knock:pr.knock||0,quiet:true,shake:5})})}
};
CAST.barrage=(pr,c)=>{
  const t=clampRange(c,440),cf=Object.assign({},c,{x:t.x,y:t.y});
  for(let i=0;i<pr.waves;i++)later(i*pr.wgap,()=>{const c2=Object.assign({},cf,{px:G.p.x,py:G.p.y});CAST.rain(pr.rain,c2)});
};
CAST.trap=(pr,c)=>{
  const g=G,t=clampRange(c,360);
  for(let i=0;i<pr.n;i++){const a=i/pr.n*TAU+rnd(0,0.4),d=pr.n>1?pr.spread*(0.5+0.5*Math.random()):0;
    const q=freeSpot(t.x+Math.cos(a)*d,t.y+Math.sin(a)*d,10);
    g.stc.push({kind:'mine',x:q.x,y:q.y,r:10,arm:0.6,life:pr.life,max:pr.life,dmg:pr.dmg,rad:pr.rad,dt:pr.dt,st:pr.st,col:pr.col,dead:false})}
  puff(t.x,t.y,'#ffd36b',8,120,0.3,2);
};
CAST.summon=(pr,c)=>{
  const g=G,t=clampRange(c,160),q=freeSpot(t.x,t.y,24);
  for(const s of g.stc)if(s.kind===pr.who){s.dead=true}
  g.stc.push({kind:pr.who,x:q.x,y:q.y,r:22,life:pr.life,max:pr.life,dmg:pr.dmg,cd:0.5,acd:pr.acd,rng:pr.rng,heal:pr.heal||0,st:pr.st||null,taunt:!!pr.taunt,col:pr.col,t0:anim,dead:false});
  ring(q.x,q.y,70,pr.col,0.5);puff(q.x,q.y,pr.col,18,180,0.5,3);g.shake=Math.max(g.shake,4);
};
CAST.orbit=(pr,c)=>{G.em.push({kind:'orbit',life:pr.life,max:pr.life,tm:0,n:pr.n,R:pr.R*(1+G.S.area*0.5),dmg:pr.dmg,dt:pr.dt,st:pr.st,col:pr.col,vis:pr.vis,spd:pr.spd||5,ang:0,hit:new Map()})};
CAST.grab=(pr,c)=>{
  const g=G,p=g.p,near=nearList(p.x,p.y,pr.range).sort((a,b)=>dist2(a,p)-dist2(b,p)).slice(0,pr.n);
  if(!near.length)return false;
  for(const e of near){
    g.beams.push({x1:p.x,y1:p.y,x2:e.x,y2:e.y,w:12,t:0.35,max:0.35,col:pr.col,vis:'vine'});
    hitEnemy(e,pr.dmg,{dt:pr.dt,st:pr.st,col:pr.col,src:'skill',proj:true});
    if(!e.dead&&!e.boss)knockE(e,p.x-e.x,p.y-e.y,pr.pull);
  }
  g.lastHits=near.length;
  if(pr.healHit)heal(pr.healHit*near.length);
};
CAST.tornado=(pr,c)=>{
  const g=G,t=pr.straight?{x:c.px,y:c.py}:clampRange(c,420),area=1+g.S.area;
  for(let i=0;i<pr.n;i++){
    const a=rnd(0,TAU),d=i?60:0;
    g.tor.push({x:t.x+Math.cos(a)*d,y:t.y+Math.sin(a)*d,r:pr.r*area,pullR:pr.r*area*pr.pull,life:pr.life,tick:0.25,ang:rnd(0,TAU),dps:pr.dps,dt:pr.dt,vis:pr.vis,zap:pr.zap||null,flames:pr.flames||null,zt:0.3,ft:0.2,dead:false,vx:pr.straight?Math.cos(c.ang+(i-(pr.n-1)/2)*0.3)*pr.straight:0,vy:pr.straight?Math.sin(c.ang+(i-(pr.n-1)/2)*0.3)*pr.straight:0});
  }
};
CAST.spiral=(pr,c)=>{
  G.em.push({kind:'spiral',life:pr.life,tm:0,rate:pr.rate,ang:rnd(0,TAU),arms:pr.arms,spd:pr.spd,r:pr.r,dmg:pr.dmg,dt:pr.dt,pierce:pr.pierce,plife:pr.plife,vis:pr.vis,col:pr.col,st:pr.st});
};
CAST.struct=(pr,c)=>{
  const g=G,t=clampRange(c,380),area=1+g.S.area;
  const base=Math.atan2(t.y-c.py,t.x-c.px),px=-Math.sin(base),py=Math.cos(base);
  for(let i=0;i<pr.walls;i++){
    const o=(i-(pr.walls-1)/2)*50;
    g.stc.push({kind:'wall',x:t.x+px*o,y:t.y+py*o,r:24,life:pr.life,max:pr.life,col:'#c9974f',dead:false});
  }
  for(let i=0;i<pr.turrets;i++){
    const a=base+Math.PI+(pr.turrets===1?0:(i/(pr.turrets-1)-0.5)*2.2),dd=pr.walls?58:46+i*8;
    g.stc.push({kind:'turret',tvis:pr.tvis,x:t.x+Math.cos(a)*dd*(pr.walls?1:1.2),y:t.y+Math.sin(a)*dd*(pr.walls?1:1.2),r:13,life:pr.life,max:pr.life,cd:0.2+i*0.12,dmg:pr.tdmg,dt:pr.tdt,tcd:pr.tcd,st:pr.tst||null,jumps:pr.tjumps||0,col:pr.col||c.col,dead:false});
  }
  ring(t.x,t.y,70*area,pr.col||c.col,0.4);
  puff(t.x,t.y,pr.col||c.col,14,160,0.5,3);
};
CAST.buff=(pr,c)=>{
  const g=G,k=['dm','spd','armor','ls','regen'];
  for(const x of k)if(pr[x]!==undefined)g.bf[x]={t:pr.dur,v:pr[x]};
  if(pr.dash){g.p.dash=0;g.p.dch=1+(g.S.dch||0);g.p.dcr=0}
  if(pr.shield)g.shield=Math.max(g.shield,pr.dur);
  tickBuffs(0);
  ring(g.p.x,g.p.y,50,c.col||'#fff',0.4);
};
CAST.heal=(pr)=>{heal(pr.amt);ring(G.p.x,G.p.y,40,'#6fe3a0',0.4);puff(G.p.x,G.p.y,'#6fe3a0',10,100,0.5,2.5)};
CAST.mana=(pr)=>{const g=G;g.p.mana=Math.min(g.S.maxMana,g.p.mana+pr.amt);ring(g.p.x,g.p.y,40,'#78aeff',0.4);puff(g.p.x,g.p.y,'#78aeff',10,100,0.5,2.5)};
CAST.blink=(pr,c)=>{
  const g=G,p=g.p,dx=c.x-p.x,dy=c.y-p.y,d=Math.hypot(dx,dy)||1,m=Math.min(pr.range,d);
  g.gh.push({x:p.x,y:p.y,t:0.4,max:0.4});
  puff(p.x,p.y,'#b79bff',12,160,0.4,3);
  p.x+=dx/d*m;p.y+=dy/d*m;p.inv=Math.max(p.inv,0.35);
  puff(p.x,p.y,'#b79bff',12,160,0.4,3);
};
CAST.block=(pr)=>{G.block=pr.dur;ring(G.p.x,G.p.y,40,'#7fe6ff',0.4)};
CAST.vacuum=()=>{const g=G;for(const m of g.gem)m.fly=true;g.vac=3;ring(g.p.x,g.p.y,g.S.magnet,'#ff6b7a',0.5)};
CAST.slowAll=(pr)=>{G.slowAll=pr.t;G.slowAllF=pr.f;ring(G.p.x,G.p.y,Math.max(W,H)*0.5,'#e8c98f',0.6)};
CAST.nuke=(pr)=>{
  const g=G;
  for(const e of g.en){if(!e.dead&&vis(e.x,e.y,40))hitEnemy(e,pr.dmg,{dt:pr.dt,aoe:true,col:'#b79bff'})}
  g.shake=Math.max(g.shake,10);ring(g.p.x,g.p.y,Math.max(W,H)*0.6,'#b79bff',0.6);
};

