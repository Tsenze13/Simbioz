/* ---------- стихийное оружие (автоатака) ---------- */
function rockPos(g){
  const l=g.el.earth;
  if(!l)return [];
  const n=[0,2,3,3,4,5,6,6,7][l],R=(62+5*l)*(1+g.S.area*0.5),out=[];
  for(let i=0;i<n;i++){const a=g.rockAng+i*TAU/n;out.push({x:g.p.x+Math.cos(a)*R,y:g.p.y+Math.sin(a)*R,r:9+l})}
  return out;
}
function weapons(dt){
  const g=G,p=g.p,e=g.el,ar=1+g.S.area,cdm=1+g.E.cdr;
  const cd=k=>{g.cdw[k]=(g.cdw[k]||0)-dt*cdm;return g.cdw[k]<=0};
  if(e.fire>0&&cd('fire')){
    const l=e.fire,t=nearest(p.x,p.y,480);
    if(t){
      const n=[0,1,1,2,2,3,3,4,4][l],base=Math.atan2(t.y-p.y,t.x-p.x);
      for(let i=0;i<n;i++){
        const a=base+(i-(n-1)/2)*0.24;
        shoot({vis:'fire',x:p.x,y:p.y,vx:Math.cos(a)*310,vy:Math.sin(a)*310,r:7,dmg:10+5*l,dt:'magic',life:1.5,blast:(36+6*l)*ar,st:{burn:[2.5*l,3]},col:'#ff6a2b',src:'auto'});
      }
      g.cdw.fire=1.25-0.09*l;
    }else g.cdw.fire=0.12;
  }
  if(e.water>0&&cd('water')){
    const l=e.water,t=nearest(p.x,p.y,460);
    if(t){
      const n=[0,1,1,2,2,3,3,4,4][l],base=Math.atan2(t.y-p.y,t.x-p.x);
      for(let i=0;i<n;i++){
        const a=base+(i-(n-1)/2)*0.4;
        shoot({vis:'wave',x:p.x,y:p.y,vx:Math.cos(a)*195,vy:Math.sin(a)*195,r:(18+4*l)*ar,dmg:7+4*l,dt:'magic',life:1.7,pierce:99,knock:130,col:'#3aa7ff',st:{slow:[0.55,1.4+0.2*l],wet:2},src:'auto',ang:a});
      }
      g.cdw.water=1.7-0.1*l;
    }else g.cdw.water=0.12;
  }
  if(e.air>0&&cd('air')){
    const l=e.air,t=nearest(p.x,p.y,420);
    if(t){
      const n=[0,1,2,2,3,4,4,5,6][l],base=Math.atan2(t.y-p.y,t.x-p.x);
      for(let i=0;i<n;i++){
        const a=base+(i-(n-1)/2)*0.2;
        shoot({vis:'blade',x:p.x,y:p.y,vx:Math.cos(a)*540,vy:Math.sin(a)*540,r:6,dmg:5+3*l,dt:'phys',life:0.75,pierce:1+Math.floor(l/2),col:'#8febd0',src:'auto'});
      }
      g.cdw.air=Math.max(0.24,0.62-0.05*l);
    }else g.cdw.air=0.1;
  }
  if(e.metal>0){
    const l=e.metal,sol=!!g.hand,GM=g.gmods||(g.gmods={}),MU=g.gmu||(g.gmu={}),scope=!!MU.scope,ars=g.start==='metal'?1+0.06*allGuns(g).length:1;
    if(!sol&&!g.guns.length)g.guns.push({t:'pistol',cd:0,aim:0,fl:0,rec:0});
    const fireOne=(gn,ps,G0)=>{
      g.shotN++;const pw=g.start==='metal'&&g.pl>=3&&g.shotN%8===0,gm=(g.start==='metal'&&g.pl>=2?1.1:1)*(pw?2.5:1)*ars;
      if(pw){sparks(ps.x,ps.y,'#ffd36b',8,260);ring(ps.x,ps.y,26,'#ffd36b',0.25)}
      const md=GM[gn.t]||'',base=gn.aim,mo=gn.hand?12:G0.mz*G0.sc*1.6,mx=ps.x+Math.cos(base)*mo,my=ps.y+Math.sin(base)*mo;
      let pel=G0.pel,sp=G0.sp*(scope?0.45:1),dm=G0.dm,knock=G0.knock,big=G0.big,spd=G0.spd*(scope?1.2:1),life=G0.life*(scope?1.3:1),pellet=!!G0.pellet,xp=0;
      if(gn.t==='shotgun'){if(md==='slug'){pel=1;sp=0.03;dm=4.2;knock=330;big=true;pellet=false;xp=2}else if(md==='buck'){pel=11;sp*=1.5;dm=0.42}}
      if(gn.t==='pistol'&&md==='double')pel=2;
      for(let k=0;k<pel;k++){
        let a,ox=0,oy=0;
        if(gn.t==='pistol'&&pel===2){a=base+rnd(-sp,sp)*0.5;const sg=k?1:-1;ox=-Math.sin(base)*6*sg;oy=Math.cos(base)*6*sg}
        else if(pellet)a=base+(Math.random()-0.5)*sp;
        else a=base+(pel>1?(k/(pel-1)-0.5)*sp:rnd(-sp,sp)*0.5);
        const sv=spd*(pellet?rnd(0.82,1.1):1),lf=life*(pellet?rnd(0.85,1.1):1);
        let st=null,shock=false,col=pw?'#ffd36b':'#e8eef8';
        if(gn.t==='smg'&&md==='shock'){g.smgN=(g.smgN||0)+1;if(g.smgN%6===0){st={stun:0.45};shock=true;col='#f4f08a'}}
        if(gn.t==='rifle'&&md==='tracer'){g.rflN=(g.rflN||0)+1;if(g.rflN%4===0){st={burn:[4+1.5*l,3]};col='#ff9a3c'}}
        shoot({vis:pellet?'pellet':'bullet',gun:true,gt:gn.t,gmod:md,x:mx+ox,y:my+oy,vx:Math.cos(a)*sv,vy:Math.sin(a)*sv,r:(big?6:(pellet?3:4.5))*(pw?1.6:1),dmg:(7+3.5*l)*dm*gm,dt:'phys',life:lf,l0:life,pierce:G0.pierce+xp+(l>=4&&!G0.pierce?1:0)+(g.start==='metal'?1:0)+(pw?2:0),knock:knock,col:col,st:st,shock:shock,src:'auto'});
      }
      gn.fl=1;
      puff(mx,my,'#fff2b0',2,70,0.14,2);
      if(G0.pellet){g.shake=Math.max(g.shake,md==='slug'?3:2)}
      if(gn.t==='rifle'){gn.heat=(gn.heat||0)+(md==='cool'?0.021:0.035);if(gn.heat>=1){gn.oh=1.3;gn.heat=0;gn.spin=0;puff(ps.x,ps.y,'#d6dde8',8,90,0.7,3);sfx(300,0.2,'sawtooth',0.03,-200);if(g.tx.length<50)g.tx.push({x:ps.x,y:ps.y-20,t:0.8,txt:'Перегрев',big:false,col:'#ffb0a0'})}}
      
    };
    const tick=(gn,ps)=>{
      const G0=GUNS[gn.t],md=GM[gn.t]||'';
      gn.cd-=dt*cdm;gn.fl=Math.max(0,(gn.fl||0)-dt*9);gn.rec=gn.fl*5;
      const t=nearest(ps.x,ps.y,G0.rng*(scope?1.3:1));
      gn.hasT=!!t;
      if(t)gn.aim=Math.atan2(t.y-ps.y,t.x-ps.x);
      else if(gn.aim===undefined||!g.en.length)gn.aim=Math.atan2(Math.sin(g.t*.5),Math.cos(g.t*.5));
      if(gn.t==='rifle'){
        if(t&&t===gn.tg)gn.spin=Math.min(1,(gn.spin||0)+dt*0.55);else if(t)gn.spin=(gn.spin||0)*0.9;else gn.spin=Math.max(0,(gn.spin||0)-dt);
        gn.tg=t;gn.heat=Math.max(0,(gn.heat||0)-dt*(md==='cool'?0.7:0.35));
        if(gn.oh>0){gn.oh-=dt;if(Math.random()<0.35)puff(ps.x,ps.y-8,'#d6dde8',1,30,0.6,2.6)}
      }
      const ready=!(gn.oh>0);
      if(gn.bl>0){if(!ready)gn.bl=0;else{gn.bt-=dt;if(gn.bt<=0){fireOne(gn,ps,G0);gn.bl--;gn.bt=G0.bi}}}
      if(t&&gn.cd<=0&&!(gn.bl>0)&&ready){
        if(G0.burst){gn.bl=G0.burst;gn.bt=0}
        else if(G0.gren){
          const d=Math.hypot(t.x-ps.x,t.y-ps.y),fl=Math.max(.45,d/520),mo=G0.mz*G0.sc*1.6;
          g.gren.push({x0:ps.x+Math.cos(gn.aim)*mo,y0:ps.y+Math.sin(gn.aim)*mo,x1:t.x,y1:t.y,t:0,life:fl,l:l,dm:ars,md:md});
          gn.fl=1;g.shake=Math.max(g.shake,2);sfx(150,0.12,'square',0.04,60);
        }else fireOne(gn,ps,G0);
        let c0=G0.cd*(1-.04*(l-1))*(MU.mag?0.88:1);
        if(gn.t==='rifle')c0/=1+1.6*(gn.spin||0);
        gn.cd=c0;
      }
    };
    if(g.hand){g.hand.hand=true;tick(g.hand,handPs(g))}
    g.guns.forEach((gn,i)=>tick(gn,gunPos(g,i)));
  }
  for(let i=g.gren.length-1;i>=0;i--){
    const q=g.gren[i];q.t+=dt;
    if(q.t>=q.life){g.gren.splice(i,1);gExplode(q)}
  }
  if(e.wood>0&&cd('wood')){
    const l=e.wood,t=nearest(p.x,p.y,460);
    if(t){
      const n=[0,1,1,2,2,3,3,4,4][l],base=Math.atan2(t.y-p.y,t.x-p.x);
      for(let i=0;i<n;i++){
        const a=base+(i-(n-1)/2)*0.5;
        shoot({vis:'seed',homing:true,x:p.x,y:p.y,vx:Math.cos(a)*240,vy:Math.sin(a)*240,r:6,dmg:6+3*l,dt:'magic',life:2.4,col:'#9ad16a',st:{poison:[3+1.5*l,3],slow:[0.8,1]},src:'auto'});
      }
      g.cdw.wood=1.4-0.1*l;
    }else g.cdw.wood=0.12;
  }
}

