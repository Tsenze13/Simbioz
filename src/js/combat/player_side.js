/* ---------- обновление объектов стороны игрока ---------- */
function updPlayerSide(dt){
  const g=G,p=g.p,E=g.E;
  try{updPlayerSide0(dt)}finally{g.curSk=null}
}
function updPlayerSide0(dt){
  const g=G,p=g.p,E=g.E;
  /* камни земли */
  if(g.el.earth>0){
    g.rockAng+=dt*(2.2+0.12*g.el.earth);
    const l=g.el.earth;
    for(const rk of rockPos(g)){
      for(const e of g.en){
        if(e.dead||e.rockCd>0)continue;
        const dx=e.x-rk.x,dy=e.y-rk.y,rr=rk.r+e.r;
        if(dx*dx+dy*dy<rr*rr){
          hitEnemy(e,9+4*l,{dt:'phys',src:'auto',col:'#c9974f',proj:true});
          hitFx('rock',e.x,e.y,0,.5,.5);
          if(!e.dead)knockE(e,e.x-p.x,e.y-p.y,260);
          e.rockCd=0.4;
        }
      }
    }
  }
  /* эмиттеры */
  for(const m of g.em){
    g.curSk=m.sk||null;
    m.life-=dt;m.tm-=dt;
    if(m.life<=0){m.dead=true;continue}
    if(m.kind==='orbit'){
      m.ang+=dt*m.spd;
      for(let i=0;i<m.n;i++){const a=m.ang+i*TAU/m.n,x=p.x+Math.cos(a)*m.R,y=p.y+Math.sin(a)*m.R;
        for(const e of g.en){if(e.dead||e.sub)continue;const dx=e.x-x,dy=e.y-y,rr=e.r+12;if(dx*dx+dy*dy>rr*rr)continue;const lt=m.hit.get(e)||0;if(g.t-lt<0.35)continue;m.hit.set(e,g.t);
          hitEnemy(e,m.dmg,{dt:m.dt,st:m.st,col:m.col,src:'skill',proj:true});if(!e.dead)knockE(e,e.x-p.x,e.y-p.y,120)}}
      continue;
    }
    if(m.kind==='spiral'){
      m.ang+=dt*4.4;
      if(m.tm<=0){
        m.tm=m.rate;
        for(let k=0;k<m.arms;k++){
          const a=m.ang+k*TAU/m.arms;
          shoot({vis:m.vis,x:p.x,y:p.y,vx:Math.cos(a)*m.spd,vy:Math.sin(a)*m.spd,r:m.r,dmg:m.dmg,dt:m.dt,life:m.plife,pierce:m.pierce,col:m.col,st:m.st,src:'proj',curl:m.vis==='comet'?3.6:0});
        }
      }
    }else if(m.kind==='storm'){
      if(m.tm<=0){
        m.tm=m.rate;
        const near=nearList(p.x,p.y,560);
        if(near.length)chainBolt(p.x+rnd(-30,30),p.y-60,pickOf(near),2,m.dmg,170,{col:m.col,shock:true});
      }
    }
  }
  /* отложенные взрывы */
  for(const b of g.bl){
    g.curSk=b.sk||null;
    b.t-=dt;
    if(b.t<=0){
      b.dead=true;blFx(b);
      explodeAt(b.x,b.y,b.r,b.dmg,{dt:b.dt,st:b.st,knock:b.knock,col:b.col,shake:b.vis==='meteor'?3:0,spike:b.vis==='spike'||b.vis==='root'});
      if(b.zone)addZone(b.x,b.y,b.zone);
    }
  }
  /* зоны */
  for(const z of g.zn){
    g.curSk=z.sk||null;
    z.life-=dt;z.tick-=dt;
    if(z.life<=0){z.dead=true;continue}
    if(z.follow){z.x=p.x;z.y=p.y}
    if(z.tick<=0){
      z.tick=0.25;
      if(z.heal){const hx=p.x-z.x,hy=p.y-z.y;if(hx*hx+hy*hy<z.r*z.r)heal(z.heal*0.25)}
      for(const e of g.en){
        if(e.dead)continue;
        const dx=e.x-z.x,dy=e.y-z.y,rr=z.r+e.r*0.5;
        if(dx*dx+dy*dy<rr*rr){
          if(z.dps)hitEnemy(e,z.dps*0.25,{dt:z.dt,src:'zone',quiet:Math.random()<0.4,st:z.st,col:z.col});
          else if(z.st)applySt(e,z.st,E.dm);
        }
      }
    }
  }
  /* смерчи */
  for(const t of g.tor){
    g.curSk=t.sk||null;
    t.life-=dt;
    if(t.life<=0){t.dead=true;continue}
    const tg=t.vx||t.vy?null:nearest(t.x,t.y,600);
    if(t.vx||t.vy){t.x+=t.vx*dt;t.y+=t.vy*dt}
    if(tg){const a=Math.atan2(tg.y-t.y,tg.x-t.x);t.x+=Math.cos(a)*90*dt;t.y+=Math.sin(a)*90*dt}
    t.ang+=dt*8;t.tick-=dt;
    const doTick=t.tick<=0;
    if(doTick)t.tick=0.25;
    if(t.zap){
      t.zt-=dt;
      if(t.zt<=0){
        t.zt=t.zap.every;
        const near=nearList(t.x,t.y,t.pullR);
        if(near.length)chainBolt(t.x,t.y,pickOf(near),t.zap.jumps,t.zap.dmg,t.zap.range,{dt:t.zap.dt,col:'#f4f08a',shock:true});
      }
    }
    if(t.flames){
      t.ft-=dt;
      if(t.ft<=0){
        t.ft=t.flames.every;
        const a=rnd(0,TAU);
        shoot({vis:'flame',x:t.x,y:t.y,vx:Math.cos(a)*240,vy:Math.sin(a)*240,r:6,dmg:t.flames.dmg,dt:'magic',life:1,pierce:1,col:'#ff9a3c',st:t.flames.st,src:'proj'});
      }
    }
    for(const e of g.en){
      if(e.dead)continue;
      const dx=t.x-e.x,dy=t.y-e.y,d=Math.hypot(dx,dy)||1;
      if(d<t.pullR&&!e.boss){const f=140*dt*(1.3-d/t.pullR);e.x+=dx/d*f;e.y+=dy/d*f}
      if(doTick&&d<t.r+e.r)hitEnemy(e,t.dps*0.25,{dt:t.dt,src:'zone',quiet:Math.random()<0.4,col:'#e0c27a'});
    }
  }
  /* структуры */
  for(const s of g.stc){
    g.curSk=s.sk||null;
    s.life-=dt;
    if(s.life<=0){s.dead=true;continue}
    if(s.kind==='mine'){
      s.arm-=dt;if(s.arm>0)continue;
      for(const e of g.en){if(e.dead||e.sub)continue;const dx=e.x-s.x,dy=e.y-s.y;if(dx*dx+dy*dy<(24+e.r)*(24+e.r)){s.dead=true;explodeAt(s.x,s.y,s.rad,s.dmg,{dt:s.dt,st:s.st,col:s.col,knock:180,shake:4});break}}
      continue;
    }
    if(s.kind==='golem'||s.kind==='treant'){
      s.cd-=dt;
      let touch=0;for(const e of g.en){if(e.dead)continue;const dx=e.x-s.x,dy=e.y-s.y,m=s.r+e.r;if(dx*dx+dy*dy<m*m){touch++;const d=Math.hypot(dx,dy)||1;e.x=s.x+dx/d*m;e.y=s.y+dy/d*m}}
      s.life-=dt*0.35*touch;
      if(s.kind==='golem'){
        if(s.cd<=0){const t=nearest(s.x,s.y,s.rng);if(t){s.cd=s.acd;s.atk=0.35;s.aim=Math.atan2(t.y-s.y,t.x-s.x);explodeAt(s.x+Math.cos(s.aim)*26,s.y+Math.sin(s.aim)*26,64,s.dmg,{dt:'phys',col:'#c9974f',st:s.st||{stun:0.4},knock:240,spike:true,shake:3})}else s.cd=0.2}
      }else{
        if(s.heal){const hx=p.x-s.x,hy=p.y-s.y;if(hx*hx+hy*hy<170*170)heal(s.heal*dt)}
        if(s.cd<=0){const t=nearest(s.x,s.y,s.rng);if(t){s.cd=s.acd;s.atk=0.3;s.aim=Math.atan2(t.y-s.y,t.x-s.x);for(let k=-1;k<=1;k++)shoot({vis:'thorn',x:s.x,y:s.y,vx:Math.cos(s.aim+k*0.18)*520,vy:Math.sin(s.aim+k*0.18)*520,r:6,dmg:s.dmg,dt:'magic',life:0.8,pierce:1,col:'#9ad16a',st:s.st||{poison:[6,3]},src:'proj'})}else s.cd=0.2}
      }
      if(s.atk>0)s.atk-=dt;
      continue;
    }
    if(s.kind!=='turret')continue;
    s.cd-=dt*(1+E.cdr);
    if(s.cd>0)continue;
    const t=nearest(s.x,s.y,370);
    if(!t){s.cd=0.2;continue}
    s.cd=s.tcd;
    const a=Math.atan2(t.y-s.y,t.x-s.x);
    s.aim=a;
    if(s.tvis==='tesla')chainBolt(s.x,s.y-8,t,s.jumps,s.dmg,170,{dt:s.dt,col:'#f4f08a',shock:true,src:'skill'});
    else if(s.tvis==='thorn')shoot({vis:'thorn',x:s.x,y:s.y,vx:Math.cos(a)*560,vy:Math.sin(a)*560,r:6,dmg:s.dmg,dt:s.dt,life:0.75,pierce:2,col:'#9ad16a',st:s.st,src:'proj'});
    else shoot({vis:'bullet',x:s.x,y:s.y,vx:Math.cos(a)*680,vy:Math.sin(a)*680,r:5,dmg:s.dmg,dt:s.dt,life:0.65,pierce:0,col:'#e8eef8',src:'proj'});
    puff(s.x+Math.cos(a)*12,s.y+Math.sin(a)*12,'#fff2b0',1,50,0.1,2);
  }
  /* снаряды игрока */
  for(const b of g.pr){
    g.curSk=b.sk||(b.gt?'__gun':b.src==='auto'?'__auto':null);
    if(b.homing){
      const t=nearest(b.x,b.y,320);
      if(t){
        const sp=Math.hypot(b.vx,b.vy),ca=Math.atan2(b.vy,b.vx);
        let da=Math.atan2(t.y-b.y,t.x-b.x)-ca;
        while(da>Math.PI)da-=TAU;while(da<-Math.PI)da+=TAU;
        const na=ca+clamp(da,-3.2*dt,3.2*dt);
        b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp;
      }
    }
    if(b.ret){
      if(!b.back&&b.life<b.life0*0.5){b.back=true;b.hit=null;b.life=b.life0}
      if(b.back){const dx=p.x-b.x,dy=p.y-b.y,d=Math.hypot(dx,dy)||1;b.vx=dx/d*b.spd0*1.1;b.vy=dy/d*b.spd0*1.1;if(d<18){b.dead=true;continue}}
      else{const k=Math.max(0.25,b.life/b.life0*2-1);const sp=Math.hypot(b.vx,b.vy)||1;b.vx*=1-(1-k)*dt*1.5;b.vy*=1-(1-k)*dt*1.5}
    }
    if(b.zap){b.zt=(b.zt||0)-dt;if(b.zt<=0){b.zt=b.zap.every;const near=nearList(b.x,b.y,b.zap.range);if(near.length)chainBolt(b.x,b.y,pickOf(near),b.zap.jumps,b.zap.dmg,150,{dt:'magic',col:'#f4f08a',shock:true})}}
    if(b.curl){const ca=b.curl*dt,cs=Math.cos(ca),sn=Math.sin(ca),vx=b.vx;b.vx=vx*cs-b.vy*sn;b.vy=vx*sn+b.vy*cs}
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    if(b.hfxT>0)b.hfxT-=dt;
    if(b.vis==='fire'&&Math.random()<0.6)puff(b.x,b.y,'#ff9a3c',1,30,0.3,2.4);
    else if(b.vis==='wave'&&Math.random()<0.5)puff(b.x,b.y,'#9fe0ff',1,40,0.3,2);
    else if(b.vis==='seed'&&Math.random()<0.4)puff(b.x,b.y,'#a6e07a',1,30,0.4,2);
    else if(b.vis==='blade'&&Math.random()<0.3)puff(b.x,b.y,'#e6fff7',1,20,0.2,1.6);
    if(b.trail){
      b.trT=(b.trT||0)-dt;
      if(b.trT<=0){b.trT=b.trail.every;addZone(b.x,b.y,b.trail.zone)}
    }
    if(b.life<=0){
      if(b.blast){explodeAt(b.x,b.y,b.blast,b.dmg,{dt:b.dt,st:b.st,col:b.col});projHitFx(b,b.x,b.y);if(b.burst)burstAt(b,b.x,b.y)}
      b.dead=true;continue;
    }
    for(const e of g.en){
      if(e.dead)continue;
      if(b.hit&&b.hit.has(e))continue;
      const dx=e.x-b.x,dy=e.y-b.y,rr=e.r+(b.hr||b.r);
      if(dx*dx+dy*dy<rr*rr){
        if(b.blast){explodeAt(b.x,b.y,b.blast,b.dmg,{dt:b.dt,st:b.st,col:b.col});projHitFx(b,b.x,b.y);if(b.burst)burstAt(b,b.x,b.y);b.dead=true;break}
        const bo={dt:b.dt,st:b.st,col:b.col,src:b.src||'proj',proj:true,shock:b.shock,icy:b.icy,sk:b.sk||(b.gt?'__gun':undefined)};let bd=b.dmg,kn=b.knock||0;
        if(b.gt){const gr=gunHit(b,e,bo);bd=gr[0];kn*=gr[1]}
        if(g.impR&&g.start==='air'){bd*=2.5;bo.fcrit=true;kn=Math.max(kn,300);g.imp=0;g.impR=false;ring(e.x,e.y,34,'#e6fff7',0.3);sparks(e.x,e.y,'#e6fff7',8,280);g.shake=Math.max(g.shake,3)}
        hitEnemy(e,bd,bo);
        projHitFx(b,b.x,b.y);
        if(kn&&!e.dead){const a=Math.atan2(b.vy,b.vx);knockE(e,Math.cos(a),Math.sin(a),kn)}
        if(!b.hit)b.hit=new Set();
        b.hit.add(e);
        if(b.bounce>0){let nx=null,nd=280*280;for(const o of g.en){if(o.dead||o===e||b.hit.has(o))continue;const q=(o.x-b.x)**2+(o.y-b.y)**2;if(q<nd){nd=q;nx=o}}
          if(nx){b.bounce--;const a=Math.atan2(nx.y-b.y,nx.x-b.x),sp=Math.hypot(b.vx,b.vy);b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp;b.life=Math.max(b.life,0.6);sparks(b.x,b.y,'#e8eef8',5,220);break}}
        if(--b.pierce<0){b.dead=true;break}
      }
    }
  }
  for(const q of g.cfx){q.t+=dt;if(q.t>=q.life)q.dead=true}
  for(const q of g.hfx){q.t+=dt;if(q.t>=q.life)q.dead=true}
  for(const q of g.afx){q.t+=dt;if(q.t>=q.life)q.dead=true}
  for(const b of g.bolts){b.t-=dt;if(b.t<=0)b.dead=true}
  for(const b of g.beams){b.t-=dt;if(b.t<=0)b.dead=true}
  for(const q of g.gh){q.t-=dt;if(q.t<=0)q.dead=true}
}

