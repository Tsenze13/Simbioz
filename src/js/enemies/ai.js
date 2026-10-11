/* =====================================================================
   ВРАГИ, БОССЫ, ВОЛНЫ
   ===================================================================== */
for(const k in BOSS){
  const B=BOSS[k];
  ET['boss_'+k]={n:B.n,r:B.r,hp:B.hp,sp:B.sp,dmg:B.dmg,gold:0,xp:'xl',col:B.col,shape:B.shape,ai:'boss',armor:B.armor,mres:B.mres,from:99,wt:0,d:B.d,dt:'mixed'};
}
const hpMul=w=>{const B=BAL.enemy;return 1+B.hpLin*(w-1)+B.hpQuad*(w-1)*(w-1)+(w>B.lateFrom?B.hpLate*(w-B.lateFrom)**2:0)};
const dmgMul=w=>{const B=BAL.enemy;return 1+B.dmgLin*(w-1)+B.dmgQuad*(w-1)*(w-1)+(w>B.lateFrom?B.dmgLate*(w-B.lateFrom)**2:0)};
const lvAdj=()=>{const g=G,B=BAL.enemy;return g&&g.p?1+B.lvAdjK*Math.max(0,g.p.lv-(B.lvExpBase+B.lvExpPerWave*g.wave)):1};
const BOSS_ORDER=['guard','ent','queen','golem','sandlord','devourer'];
function bossKeyFor(w){
  if(w<4||w%4)return null;
  return BOSS_ORDER[(w/4-1)%BOSS_ORDER.length];
}
function spawnR(){return Math.hypot(VW,VH)/2+160}
function spawnPos(){
  const a=rnd(0,TAU),d=Math.hypot(VW,VH)/2+rnd(40,140);
  return {x:G.p.x+Math.cos(a)*d,y:G.p.y+Math.sin(a)*d};
}
function spawnAt(type,x,y,hm,dm,opts){
  const g=G,d=ET[type],F=MAPS[g.map].foe;
  opts=opts||{};
  hm*=(F.hp||1)*lvAdj();dm*=F.dmg||1;
  const e={type:type,def:d,x:x,y:y,r:d.r,hp:d.hp*hm,max:d.hp*hm,sp:d.sp,dmg:d.dmg*dm,armor:d.armor||0,mres:d.mres||0,col:d.col,shape:d.shape,ai:d.ai,
    hpMul:hm,dmgMul:dm,flash:0,burn:0,burnDps:0,bt:0,poison:0,poisonDps:0,pt:0,slow:0,slowF:1,frz:0,stun:0,root:0,wet:0,rust:0,ovl:0,kx:0,ky:0,kres:1,rockCd:0,slam:0,cc:0,
    cd:rnd(0.6,d.cd||2.2),st:'move',tm:0,dir:0,ang:0,elite:false,boss:false,affix:null,dead:false,hitP:false};
  if(F.sp)e.sp*=F.sp;
  if(!opts.boss)e.sp*=1+Math.min(0.18,0.007*(g.wave-1));
  if(F.mres)e.mres=Math.min(0.85,e.mres+F.mres);
  if(opts.elite){
    e.elite=true;tut('elite');e.r*=1.3;e.hp*=4;e.max=e.hp;e.kres=0.5;e.dmg*=1.2;
    e.affix=opts.affix||pickOf(Object.keys(AFFIX));
    if(e.affix==='bulwark')e.armor+=16;
    if(e.affix==='swift')e.sp*=1.45;
  }
  if(opts.boss){e.boss=true;e.bkey=opts.boss;e.kres=0.12;e.phase=1;e.bt=2;e.pi=0;e.spiral=0;e.spAng=0;e.name=d.n}
  g.en.push(e);
  return e;
}
function spawnEnemy(type,opts){
  const g=G,w=g.wave,pos=(opts&&opts.pos)||spawnPos();
  const e=spawnAt(type,pos.x,pos.y,hpMul(w),dmgMul(w),opts);
  const pk=ET[type].pack;
  if(pk&&!(opts&&opts.elite))for(let i=1;i<pk&&g.en.length<200;i++)spawnAt(type,pos.x+rnd(-30,30),pos.y+rnd(-30,30),hpMul(w),dmgMul(w));
  return e;
}
function enemyOk(k){const d=ET[k];return !d.map||d.map===G.map}
function pickType(w){
  const R=MAPS[G.map].roster||{};
  let sum=0;const c=[];
  for(const k of ET_KEYS){
    const d=ET[k];
    if(d.from<=w&&enemyOk(k)){sum+=d.wt*(R[k]||1)*((w-d.from<=1&&d.from>1)?1.8:1);c.push([k,sum])}
  }
  const r=Math.random()*sum;
  for(const x of c)if(r<=x[1])return x[0];
  return 'wisp';
}
function eliteType(w){
  const ok=ET_KEYS.filter(k=>ET[k].from<=w&&enemyOk(k)&&['wisp','swift','healer','summoner','scarab','ember'].indexOf(k)<0);
  return ok.length?pickOf(ok):'brute';
}
function enemyShot(x,y,a,spd,dmg,col,dt,r,fx){
  const g=G;
  if(g.eps.length>260)return;
  g.eps.push({x:x,y:y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,r:r||6,dmg:dmg,dt:dt||'phys',life:4,col:col||'#ff6b6b',dead:false,fx:fx||null,src:g.atkSrc||null});
}
function tgCircle(x,y,r,t,dmg,dt,col,ex){
  const g=G;
  if(g.tgs.length>70)return;
  if(Math.hypot(x-g.p.x,y-g.p.y)<r+160)tut('tele');
  const o={shape:'circle',x:x,y:y,r:r,t:t,max:t,dmg:dmg,dt:dt||'phys',col:col||'#ff4d5e',src:g.atkSrc||null};
  if(ex)Object.assign(o,ex);
  g.tgs.push(o);
}
function tgLine(x,y,a,len,w,t,dmg,dt,col){
  const g=G;
  if(g.tgs.length>70)return;
  g.tgs.push({src:g.atkSrc||null,shape:'line',x:x,y:y,x2:x+Math.cos(a)*len,y2:y+Math.sin(a)*len,w:w,t:t,max:t,dmg:dmg,dt:dt||'phys',col:col||'#ff4d5e'});
}
function hurtPlayer(d,dt,att){
  const g=G,p=g.p,E=g.E;
  if(g.over||p.inv>0||g.dashT>0||g.shield>0||g.phase==='inter')return;
  if(g.block>0){g.block=0;ring(p.x,p.y,45,'#7fe6ff',0.4);p.inv=0.4;sfx(600,0.15,'triangle',0.05);return}
  if(dt==='phys')d*=1-armorRed(E.armor);
  else if(dt==='magic')d*=1-E.mres;
  d*=1-PV('earth',[0,.06,.1,.14]);
  d=Math.max(1,d);
  p.hp-=d;p.inv=(att&&att.melee)?0.45:0.3;
  g.lastHurt={n:att&&att.e?(att.e.name||att.e.def.n)+(att.e.elite?' (элита)':''):(att&&att.src)||(att&&att.lava?'Опасная земля':'Неизвестно'),d:Math.round(d)};
  if(att&&att.e&&att.melee){const ka=Math.atan2(p.y-att.e.y,p.x-att.e.x),kf=att.boss?420:230;p.kx+=Math.cos(ka)*kf;p.ky+=Math.sin(ka)*kf}
  g.shake=Math.max(g.shake,(att&&att.lava)?1.5:((att&&att.boss)?9:6));g.hitFlash=0.25;
  puff(p.x,p.y,DT[dt].c,8,160,0.35,3);
  if(g.tx.length<50)g.tx.push({x:p.x,y:p.y-22,t:0.75,txt:'-'+Math.round(d),big:true,col:'#ff6b7a'});
  sfx(130,0.18,'sawtooth',0.06,-60);
  if(g.ifx&&g.ifx.frost&&att&&att.e&&att.melee&&g.t>(g.frU||0)){g.frU=g.t+4;for(const o of g.en){if(!o.dead&&(o.x-p.x)**2+(o.y-p.y)**2<140*140)applySt(o,{frz:1.2},1)}ring(p.x,p.y,140,'#bdf0ff',0.5);puff(p.x,p.y,'#e6fbff',16,200,0.5,3)}
  {const th=g.S.thorns+(g.start==='wood'&&g.season===2?0.3:0);if(att&&att.e&&att.melee&&th>0)hitEnemy(att.e,d*th,{dt:'pure',src:'dot',quiet:true})}
  if(p.hp<=0){
    const ae=g.bag.findIndex(b=>b&&b.id==='aegis');
    if(ae>=0){g.bag[ae]=null;recalc();reviveP(0.5,'Эгида спасла вас');return}
    if(g.metaRevive&&!g.revived){g.revived=true;reviveP(0.4,'Второе дыхание');return}
    p.hp=0;endRun(false);
  }
}
function reviveP(frac,msg){
  const g=G,p=g.p;
  p.hp=g.S.maxHp*frac;p.inv=2.5;
  for(const e of g.en){if(!e.dead)knockE(e,e.x-p.x,e.y-p.y,500)}
  g.eps.length=0;g.tgs.length=0;
  ring(p.x,p.y,260,'#ffd36b',0.7);puff(p.x,p.y,'#ffd36b',30,260,0.7,3.5);
  g.shake=Math.max(g.shake,10);
  toast(msg,'Продолжайте бой');sfx(600,0.5,'triangle',0.07,500);
}

/* ---------- ИИ врагов ---------- */
function chargeAI(e,dt,p,d,boss){
  /* возвращает true, если рывок управляет движением */
  const g=G;
  if(e.st==='wind'){
    e.tm-=dt;
    if(e.tm<=0){e.st='dash';e.tm=boss?0.7:(e.def.chs?0.4:0.55)}
    return true;
  }
  if(e.st==='dash'){
    e.tm-=dt;
    const sp=boss?480:(e.def.chs||540);
    e.x+=Math.cos(e.dir)*sp*dt;e.y+=Math.sin(e.dir)*sp*dt;
    if(Math.random()<0.5)puff(e.x,e.y,e.col,1,50,0.3,3);
    if(!e.hitP&&d<e.r+p.r){e.hitP=true;hurtPlayer(e.dmg*(boss?1.6:1.4),'phys',{e:e,melee:true,boss:boss})}
    if(e.tm<=0){e.st='rest';e.tm=boss?0.5:0.9;e.hitP=false}
    return true;
  }
  if(e.st==='rest'){e.tm-=dt;if(e.tm<=0){e.st='move';e.cd=rnd(2.2,3.4)}return true}
  return false;
}
function summonAround(e,type,n){
  const g=G;
  for(let i=0;i<n;i++){
    if(g.en.length>230)return;
    const a=rnd(0,TAU);
    spawnAt(type,e.x+Math.cos(a)*(e.r+22),e.y+Math.sin(a)*(e.r+22),hpMul(g.wave)*0.8,dmgMul(g.wave));
  }
  ring(e.x,e.y,e.r+60,'#b266ff',0.4);
}
function bossPattern(e,name){
  const g=G,p=g.p,ph=e.phase,B=BOSS[e.bkey],dm=e.dmg,toP=Math.atan2(p.y-e.y,p.x-e.x);
  if(name==='ring'){
    const n=14+4*ph,off=rnd(0,TAU);
    for(let i=0;i<n;i++)enemyShot(e.x,e.y,off+i*TAU/n,185+15*ph,dm*0.45,B.col,'phys',7);
    ring(e.x,e.y,e.r+40,B.col,0.35);
  }else if(name==='spiral'){e.spiral=2.6;e.spAng=rnd(0,TAU)}
  else if(name==='slam'){
    tgCircle(p.x,p.y,110+10*ph,1.0,dm*1.8,'phys');
    if(ph>=2){const a=rnd(0,TAU);tgCircle(p.x+Math.cos(a)*170,p.y+Math.sin(a)*170,90,1.25,dm*1.5,'phys')}
  }else if(name==='rockfall'){
    const n=5+2*ph;
    for(let i=0;i<n;i++){const a=rnd(0,TAU),d=rnd(0,280);tgCircle(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d,62,0.9+i*0.08,dm*1.1,e.bkey==='devourer'?'magic':'phys')}
  }else if(name==='line'){
    tgLine(e.x,e.y,toP,780,70,1.0,dm*2,'magic');
    if(ph>=2){tgLine(e.x,e.y,toP+0.4,780,70,1.15,dm*2,'magic');tgLine(e.x,e.y,toP-0.4,780,70,1.15,dm*2,'magic')}
  }else if(name==='charge'){e.st='wind';e.tm=0.9;e.dir=toP;e.hitP=false;tgLine(e.x,e.y,toP,520,e.r*1.6,0.9,0,'phys','rgba(255,77,94,1)')}
  else if(name==='roots'){
    const n=3+ph;
    for(let i=0;i<n;i++){const a=i*TAU/n+rnd(0,1),d=i?rnd(60,230):0;tgCircle(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d,66,1.1+i*0.13,dm*1.0,'phys','#62c15a',{fx:'roots'})}
  }else if(name==='shards'){
    const n=7+2*ph;
    for(let i=0;i<n;i++)enemyShot(e.x,e.y,toP+(i/(n-1)-0.5)*(0.9+0.15*ph),230+20*ph,dm*0.45,'#bdf0ff','magic',6,'slow');
    ring(e.x,e.y,e.r+40,'#bdf0ff',0.35);
  }else if(name==='nova'){
    tgCircle(e.x,e.y,200,1.4,dm*1.6,'magic','#bdf0ff',{fx:'chill'});
  }else if(name==='erupt'){
    tgCircle(p.x,p.y,72,0.9,dm*1.5,'phys','#e0b24a');
    const n=5+ph,off=rnd(0,TAU);
    for(let i=0;i<n;i++){const a=off+i*TAU/n;tgCircle(p.x+Math.cos(a)*155,p.y+Math.sin(a)*155,64,1.25+i*0.07,dm*1.3,'phys','#e0b24a')}
  }
  else if(name==='blink'){
    const a=rnd(0,TAU),tx=p.x+Math.cos(a)*130,ty=p.y+Math.sin(a)*130;
    tgCircle(tx,ty,e.r+55,0.8,dm*1.4,'magic',B.col);puff(e.x,e.y,B.col,20,220,0.5,3);e.hold=0.9;
    g.later.push({t:0.8,fn:()=>{if(e.dead)return;e.x=tx;e.y=ty;ring(e.x,e.y,e.r+70,B.col,0.5);puff(e.x,e.y,B.col,24,260,0.6,3.5);g.shake=Math.max(g.shake,6);bossPattern(e,'ring')}});
  }else if(name==='voidrain'){
    const n=4+ph;
    for(let i=0;i<n;i++){const a=rnd(0,TAU),r0=i?rnd(60,260):0,x=p.x+Math.cos(a)*r0,y=p.y+Math.sin(a)*r0;
      tgCircle(x,y,58,1+i*0.1,dm*1.1,'magic',B.col);g.later.push({t:1+i*0.1,fn:()=>addPatch(x,y,50,4.5,dm*0.7,e.bkey==='devourer'?'lava':'fire')})}
  }else if(name==='magnet'){
    e.pullT=1.5;e.pullX=null;e.hold=1.6;tgCircle(e.x,e.y,150,1.6,dm*2.1,'phys',B.col);
    if(g.tx.length<50)g.tx.push({x:e.x,y:e.y-e.r-20,t:1,txt:'Притяжение!',big:true,col:'#9fb0d0'});
  }else if(name==='fortify'){
    if(!e.fort){e.fort=1;e.armor+=25;e.kres=0.02;ring(e.x,e.y,e.r+40,'#c9d4ea',0.6);g.later.push({t:6,fn:()=>{e.fort=0;e.armor-=25;e.kres=0.12}})}
    summonAround(e,'shield',2);
  }else if(name==='heal'){
    e.healT=4;ring(e.x,e.y,e.r+60,'#6fe3a0',0.6);summonAround(e,'sporer',2);
  }else if(name==='thornwall'){
    const a0=rnd(0,Math.PI/2);
    for(let k=0;k<2;k++){const a=a0+k*Math.PI/2;tgLine(p.x-Math.cos(a)*300,p.y-Math.sin(a)*300,a,600,48,1.1+k*0.25,dm*1.3,'phys','#62c15a')}
  }else if(name==='blizzard'){
    const n=6+2*ph;
    for(let i=0;i<n;i++)g.later.push({t:i*0.28,fn:()=>{if(e.dead)return;const a=rnd(0,TAU),r0=rnd(0,90);tgCircle(p.x+Math.cos(a)*r0,p.y+Math.sin(a)*r0,60,0.85,dm*1.0,'magic','#bdf0ff',{fx:'chill'})}});
  }else if(name==='mirror'){
    for(let i=0;i<2;i++){if(g.en.length>230)break;const a=rnd(0,TAU);const c=spawnAt('frostling',e.x+Math.cos(a)*(e.r+40),e.y+Math.sin(a)*(e.r+40),hpMul(g.wave)*1.2,dmgMul(g.wave),{elite:true});c.name='Отражение'}
    ring(e.x,e.y,e.r+80,'#bdf0ff',0.6);
  }else if(name==='burrow'){
    e.bur=1.8;e.burT=0;e.sub=true;puff(e.x,e.y,'#e0b24a',30,220,0.6,4);g.shake=Math.max(g.shake,5);
  }else if(name==='sandstorm'){
    g.pslow=Math.max(g.pslow||0,3.5);summonAround(e,'scarab',2+ph);
    for(let i=0;i<40;i++)g.pt.length<470&&g.pt.push({x:p.x+rnd(-300,300),y:p.y+rnd(-200,200),vx:rnd(120,220),vy:rnd(-20,20),life:1.4,max:1.4,col:'#e0b24a',size:2.6});
    if(g.tx.length<50)g.tx.push({x:p.x,y:p.y-40,t:1.2,txt:'Песчаная буря: вы замедлены',big:true,col:'#e0b24a'});
  }else if(name==='blackhole'){
    const a=rnd(0,TAU),x=p.x+Math.cos(a)*140,y=p.y+Math.sin(a)*140;
    e.pullT=2;e.pullX=x;e.pullY=y;tgCircle(x,y,120,2.1,dm*2.3,'magic','#d94a7a');
    g.later.push({t:2.1,fn:()=>{ring(x,y,140,'#d94a7a',0.6);puff(x,y,'#ff7aa8',30,260,0.6,4)}});
  }
  else if(name==='summon'){
    if(ph>=2&&g.en.length<220){const t=({guard:'wisp',ent:'thornback',queen:'frostling',sandlord:'scarab',golem:'shield'})[e.bkey]||'specter';const a=rnd(0,TAU);spawnAt(t,e.x+Math.cos(a)*(e.r+40),e.y+Math.sin(a)*(e.r+40),hpMul(g.wave),dmgMul(g.wave),{elite:true})}
    if(e.bkey==='guard')summonAround(e,'wisp',4+ph);
    else if(e.bkey==='ent'){summonAround(e,'sporer',2+ph);if(ph>=2)summonAround(e,'thornback',1)}
    else if(e.bkey==='queen')summonAround(e,'frostling',2+ph);
    else if(e.bkey==='sandlord'){for(let i=0;i<2+ph;i++)summonAround(e,'scarab',1)}
    else if(e.bkey==='golem')summonAround(e,'shield',2);
    else{summonAround(e,'swift',3);summonAround(e,'archer',2);if(ph>=2)summonAround(e,'specter',2)}
  }
}
function bossDodge(e,dt,p){
  const g=G;
  e.dgCd=(e.dgCd||rnd(1,2))-dt;e.dgScan=(e.dgScan||0)-dt;
  if(e.dgCd>0||e.dgScan>0||e.st==='wind'||e.st==='dash'||e.stun>0||e.frz>0||e.root>0)return;
  e.dgScan=0.12;
  let th=null;
  for(const b of g.pr){if(b.dead||b.gun||b.src==='auto')continue;const dx=e.x-b.x,dy=e.y-b.y,dd=Math.hypot(dx,dy);if(dd>240)continue;const sp=Math.hypot(b.vx,b.vy)||1;if((b.vx*dx+b.vy*dy)/(sp*dd||1)>0.85){th={x:-b.vy/sp,y:b.vx/sp};break}}
  if(!th)for(const b of g.bl){const dd=Math.hypot(e.x-b.x,e.y-b.y);if(dd<b.r+e.r){const a=Math.atan2(e.y-b.y,e.x-b.x);th={x:Math.cos(a),y:Math.sin(a)};break}}
  if(!th)return;
  if(Math.random()>(e.phase>=3?0.75:0.5)){e.dgCd=0.8;return}
  if((e.x+th.x-g.p.x)**2+(e.y+th.y-g.p.y)**2<(e.x-th.x-g.p.x)**2+(e.y-th.y-g.p.y)**2&&Math.random()<0.5){th.x=-th.x;th.y=-th.y}
  e.dodge={vx:th.x*720,vy:th.y*720,t:0.24};e.dgCd=e.phase>=3?2.4:3.6;
  puff(e.x,e.y,e.col,14,180,0.4,4);sfx(520,0.08,'triangle',0.03,300);
  if(g.tx.length<50)g.tx.push({x:e.x,y:e.y-e.r-14,t:0.7,txt:'Уворот',big:false,col:'#e8eef8'});
}
function bossAI(e,dt,p,d,spMul){
  const g=G;
  const ph=e.hp/e.max<0.34?3:(e.hp/e.max<0.67?2:1);
  if(ph!==e.phase){
    e.phase=ph;e.bt=1.2;e.st='move';e.bar=e.max*BAL.boss.barrier;e.barMax=e.bar;
    if(ph===3){e.sp*=1.25;if(g.tx.length<50)g.tx.push({x:e.x,y:e.y-e.r-30,t:1.4,txt:'ЯРОСТЬ',big:true,col:'#ff4d5e'})}
    g.shake=Math.max(g.shake,12);ring(e.x,e.y,e.r+120,e.col,0.6);puff(e.x,e.y,e.col,30,260,0.6,4);
    toast(e.name,'Фаза '+ph);sfx(80,0.5,'sawtooth',0.07,-20);
    bossPattern(e,'summon');
  }
  if(e.spiral>0){
    e.spiral-=dt;e.spAng+=dt*2.2;e.tm2=(e.tm2||0)-dt;
    if(e.tm2<=0){e.tm2=0.11;for(let k=0;k<3;k++)enemyShot(e.x,e.y,e.spAng+k*TAU/3,200,e.dmg*0.4,e.col,'magic',6)}
  }
  if(e.pullT>0){e.pullT-=dt;const tx=e.pullX!=null?e.pullX:e.x,ty=e.pullX!=null?e.pullY:e.y,dx=tx-p.x,dy=ty-p.y,dd=Math.hypot(dx,dy)||1;
    if(dd>30&&!(g.dashT>0)){p.kx+=dx/dd*1150*dt;p.ky+=dy/dd*1150*dt}
    if(Math.random()<0.6&&g.pt.length<470){const a=rnd(0,TAU),r0=rnd(60,160);g.pt.push({x:tx+Math.cos(a)*r0,y:ty+Math.sin(a)*r0,vx:-Math.cos(a)*r0*2,vy:-Math.sin(a)*r0*2,life:0.4,max:0.4,col:e.pullX!=null?'#ff7aa8':'#c9d4ea',size:2.2})}}
  if(e.healT>0){e.healT-=dt;let near=0;for(const o of g.en)if(!o.dead&&!o.boss&&(o.x-e.x)**2+(o.y-e.y)**2<500*500)near++;
    e.hp=Math.min(e.max,e.hp+e.max*(near?0.022:0.008)*dt);if(Math.random()<0.4)puff(e.x+rnd(-e.r,e.r),e.y+rnd(-e.r,e.r),'#6fe3a0',1,40,0.6,3)}
  if(e.bur>0){
    e.bur-=dt;
    if(!e.burT&&e.bur<=0.9){e.burT=1;e.bx=p.x;e.by=p.y;tgCircle(e.bx,e.by,95,0.9,e.dmg*2,'phys','#e0b24a')}
    if(e.burT&&Math.random()<0.5)puff(e.bx+rnd(-40,40),e.by+rnd(-40,40),'#d9b36a',1,60,0.4,3);
    if(e.bur<=0){e.sub=false;e.x=e.bx;e.y=e.by;e.burT=0;puff(e.x,e.y,'#e0b24a',30,260,0.7,4.5);g.shake=Math.max(g.shake,8);sfx(110,0.35,'sawtooth',0.06,-60)}
    return;
  }
  bossDodge(e,dt,p);
  if(e.dodge){const D=e.dodge;D.t-=dt;e.x+=D.vx*dt;e.y+=D.vy*dt;if(Math.random()<0.7)g.gh&&puff(e.x,e.y,e.col,2,60,0.3,4);if(D.t<=0)e.dodge=null;return}
  if(chargeAI(e,dt,p,d,true))return;
  e.bt-=dt*(ph>=2?1.25:1)*(ph>=3?1.15:1);
  e.pg=(e.pg||0)-dt;
  if(e.bt<=0&&e.pg<=0){
    e.pg=BAL.boss.gapMin;
    const list=ph>=2?BOSS[e.bkey].pats.concat(BOSS[e.bkey].p2):BOSS[e.bkey].pats;
    bossPattern(e,list[e.pi%list.length]);e.pi++;
    e.bt=(e.st==='wind'?0.4:2.0-0.25*ph)+rnd(0,0.5);
  }
  if(e.hold>0){e.hold-=dt;return}
  if(e.root<=0&&d>e.r+p.r-4){e.x+=(p.x-e.x)/d*e.sp*spMul*dt;e.y+=(p.y-e.y)/d*e.sp*spMul*dt}
}
function updEnemies(dt){
  const g=G,p=g.p,en=g.en,kdr=MAPS[g.map].ice?2.2:6;
  for(const b of en){
    if(b.dead||b.ai!=='banner')continue;
    for(const o of en){if(o===b||o.dead)continue;const ax=o.x-b.x,ay=o.y-b.y;if(ax*ax+ay*ay<170*170)o.buf=0.25}
  }
  for(const e of en){
    if(e.dead)continue;
    g.atkSrc=e.name||e.def.n;
    e.flash=Math.max(0,e.flash-dt);e.rockCd=Math.max(0,e.rockCd-dt);e.ovl=Math.max(0,e.ovl-dt);e.slam=Math.max(0,e.slam-dt);e.cc=Math.max(0,e.cc-dt);
    if(e.wet>0)e.wet-=dt;
    if(e.rust>0)e.rust-=dt;
    if(e.burn>0){e.burn-=dt;e.bnt=(e.bnt||0)+dt;if(e.bnt>=0.5){e.bnt=0;hitEnemy(e,e.burnDps*0.5,{dt:'magic',src:'dot',quiet:true,sk:e.dsk});if(e.dead)continue}}
    if(e.poison>0){e.poison-=dt;if(e.poison<=0)e.pst=0;e.pt+=dt;if(e.pt>=0.5){e.pt=0;hitEnemy(e,e.poisonDps*0.5*(e.pst||1),{dt:'magic',src:'dot',quiet:true,sk:e.dsk});if(e.dead)continue}}
    if(e.affix==='regen'&&e.hp<e.max)e.hp=Math.min(e.max,e.hp+e.max*0.03*dt);
    if(e.slow>0){e.slow-=dt;if(e.slow<=0)e.slowF=1}
    if(e.frz>0)e.frz-=dt;
    if(e.stun>0)e.stun-=dt;
    if(e.root>0)e.root-=dt;
    e.x+=e.kx*dt;e.y+=e.ky*dt;
    const kd=Math.exp(-kdr*dt);e.kx*=kd;e.ky*=kd;
    const pdx=p.x-e.x,pdy=p.y-e.y,pd2=pdx*pdx+pdy*pdy;
    let tgx=p.x,tgy=p.y;
    if(!e.boss&&g.stc.length)for(const s of g.stc){if(s.taunt&&!s.dead){const q=(s.x-e.x)**2+(s.y-e.y)**2;if(q<320*320&&q<pd2){tgx=s.x;tgy=s.y;break}}}
    const dx=tgx-e.x,dy=tgy-e.y,d2=dx*dx+dy*dy,d=Math.sqrt(d2)||1;
    e.ang=Math.atan2(dy,dx);
    let spMul=1;
    if(e.slow>0)spMul*=e.slowF;
    if(e.wet>0&&g.start==='water'&&g.pl>=2)spMul*=0.85;
    if(g.slowAll>0)spMul*=g.slowAllF;
    if(e.def.rage)spMul*=1+(1-e.hp/e.max)*0.9;
    if(e.buf>0){spMul*=1.3;e.buf-=dt}
    if(!e.boss){const sr=spawnR()-120;if(d>sr)spMul*=1+Math.min(1.5,(d-sr)/500)}
    if(g.pools.length){
      const pl=poolAt(g,e.x,e.y);
      if(pl){
        if(pl.kind==='bramble')spMul*=e.boss?0.85:0.6;
        else if(pl.kind==='quicksand')spMul*=e.boss?0.8:0.45;
        else if(pl.kind==='puddle')e.wet=Math.max(e.wet,0.8);
        else if(pl.kind==='lava'){
          e.lavaT=(e.lavaT||0)-dt;
          if(e.lavaT<=0){e.lavaT=0.5;hitEnemy(e,(6+g.wave*1.2)*(e.boss?0.3:1),{dt:'magic',src:'dot',quiet:true,st:{burn:[8,1.2]}});if(e.dead)continue}
        }
      }
    }
    const locked=e.frz>0||e.stun>0;
    if(!locked){
      const sp=e.sp*spMul,canMove=e.root<=0;
      const ai=e.ai;
      if(ai==='boss')bossAI(e,dt,p,d,spMul);
      else if(ai==='ranged'||ai==='mage'||ai==='healer'||ai==='summoner'||ai==='caller'||ai==='curser'){
        const rng=e.def.rng||(ai==='healer'?280:340);
        if(canMove){
          if(d>rng){e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt}
          else if(d<rng*0.65){e.x-=dx/d*sp*dt;e.y-=dy/d*sp*dt}
        }
        e.cd-=dt*(g.slowAll>0?g.slowAllF:1);
        if(e.cd<=0){
          if(ai==='ranged'&&d<rng+90){const sh=e.def.shot||{},n=sh.n||1;for(let k=0;k<n;k++)enemyShot(e.x,e.y,e.ang+(n===1?0:(k/(n-1)-0.5)*(sh.spread||0.4)),sh.spd||250,e.dmg,sh.col||'#ffd36b',e.def.dt||'phys',sh.r||5,sh.fx);e.cd=e.def.cd*rnd(0.9,1.2)}
          else if(ai==='curser'&&d<rng+100){
            if(e.def.curse==='roots')tgCircle(p.x,p.y,60,1.15,e.dmg*1.2,'phys','#62c15a',{fx:'roots'});
            else tgCircle(p.x,p.y,86,1.2,e.dmg*1.3,'magic','#bdf0ff',{fx:'chill'});
            e.cd=e.def.cd*rnd(0.9,1.2);
          }
          else if(ai==='mage'&&d<rng+100){tgCircle(p.x,p.y,78,1.0,e.dmg*1.6,'magic','#6fa8ff');if(e.def.twin){const a2=rnd(0,TAU);tgCircle(p.x+Math.cos(a2)*125,p.y+Math.sin(a2)*125,70,1.3,e.dmg*1.4,'magic','#7fe0d0')}e.cd=e.def.cd*rnd(0.9,1.2)}
          else if(ai==='caller'&&d<rng+120){for(let k=0;k<3;k++){const a2=rnd(0,TAU),dd=k?rnd(40,140):0;tgCircle(p.x+Math.cos(a2)*dd,p.y+Math.sin(a2)*dd,52,0.95+k*0.22,e.dmg*1.4,'magic','#f4f08a',{fx:'bolt'})}e.cd=e.def.cd*rnd(0.9,1.2)}
          else if(ai==='healer'){
            let any=false;
            for(const o of en){if(o.dead||o===e||o.hp>=o.max)continue;const ddx=o.x-e.x,ddy=o.y-e.y;if(ddx*ddx+ddy*ddy<180*180){o.hp=Math.min(o.max,o.hp+o.max*0.14);any=true;if(g.pt.length<400)puff(o.x,o.y,'#69e08f',3,50,0.4,2)}}
            if(any)ring(e.x,e.y,180,'#69e08f',0.4);
            e.cd=3;
          }else if(ai==='summoner'){
            if(en.length<200)for(let i=0;i<2;i++){const a=rnd(0,TAU);spawnAt('wisp',e.x+Math.cos(a)*24,e.y+Math.sin(a)*24,e.hpMul*0.7,e.dmgMul)}
            ring(e.x,e.y,60,'#b266ff',0.4);e.cd=6.5;
          }else e.cd=0.4;
        }
      }else if(ai==='charger'){
        if(!chargeAI(e,dt,p,d,false)){
          e.cd-=dt;
          if(canMove){e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt}
          if(e.cd<=0&&d<340&&d>100){e.st='wind';e.tm=e.def.chw||0.75;e.dir=e.ang;e.hitP=false}
          else if(e.cd<=0)e.cd=0.4;
        }
      }else if(ai==='bomber'){
        if(e.st==='fuse'){
          e.tm-=dt;
          if(e.tm<=0){
            ring(e.x,e.y,95,'#ffb347',0.35);puff(e.x,e.y,'#ffb347',14,200,0.5,3.5);g.shake=Math.max(g.shake,5);
            if(Math.sqrt(pd2)<95+p.r)hurtPlayer(e.dmg,'magic',{e:e});
            killEnemy(e);continue;
          }
        }else{
          if(canMove){e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt}
          if(d<50){e.st='fuse';e.tm=0.65}
        }
      }else if(ai==='lancer'){
        if(e.st==='thrust'){e.tm-=dt;if(e.tm<=0){e.st='move';e.cd=rnd(2.2,3.2)}}
        else{
          if(canMove&&d>120){e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt}
          e.cd-=dt;
          if(e.cd<=0){if(d<210){e.st='thrust';e.tm=0.8;tgLine(e.x,e.y,e.ang,250,40,0.75,e.dmg*1.6,'phys','#e8c98a')}else e.cd=0.3}
        }
      }else if(ai==='sniper'){
        if(canMove){if(d<340){e.x-=dx/d*sp*dt;e.y-=dy/d*sp*dt}else if(d>470){e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt}}
        e.cd-=dt;
        if(e.cd<=0){if(d<640){tgLine(e.x,e.y,e.ang,720,24,1.15,e.dmg*1.9,'phys','#ff8a8a');e.cd=e.def.cd*rnd(0.95,1.2)}else e.cd=0.5}
      }else if(ai==='miner'){
        if(canMove){
          if(!e.sgn)e.sgn=Math.random()<0.5?1:-1;
          const tx=-dy/d*e.sgn,ty=dx/d*e.sgn;let rx=0,ry=0;
          if(d<140){rx=-dx/d;ry=-dy/d}else if(d>210){rx=dx/d;ry=dy/d}
          e.x+=(tx*0.9+rx)*sp*dt;e.y+=(ty*0.9+ry)*sp*dt;
        }
        e.cd-=dt;
        if(e.cd<=0){tgCircle(e.x,e.y,56,1.5,e.dmg*1.5,'phys','#ffb347');e.cd=e.def.cd*rnd(0.9,1.2)}
      }else if(ai==='banner'){
        if(canMove){if(d<250){e.x-=dx/d*sp*dt;e.y-=dy/d*sp*dt}else if(d>340){e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt}}
      }else if(ai==='slammer'){
        if(e.st==='slam'){e.tm-=dt;if(e.tm<=0){e.st='move';e.cd=rnd(2.6,3.6);addPatch(e.x,e.y,56,2.6,6+g.wave*0.8,'fire');g.shake=Math.max(g.shake,6)}}
        else{
          if(canMove&&d>e.r+18){e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt}
          e.cd-=dt;
          if(e.cd<=0){if(d<160){e.st='slam';e.tm=0.95;tgCircle(e.x,e.y,108,0.9,e.dmg*1.7,'phys','#ff7a3a')}else e.cd=0.3}
        }
      }else if(ai==='zapper'){
        if(canMove){e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt}
        e.cd-=dt;
        if(e.cd<=0){if(d<400){tgCircle(p.x,p.y,46,0.75,e.dmg*1.3,'magic','#f4f08a',{fx:'bolt'});e.cd=e.def.cd*rnd(0.9,1.2)}else e.cd=0.5}
      }else if(ai==='burrow'){
        if(e.st==='move'||e.st==='rest'){
          if(canMove){e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt}
          e.cd-=dt;
          if(e.cd<=0){if(d<440){e.st='dive';e.tm=0.45;e.sub=true;puff(e.x,e.y,'#d9b36a',10,120,0.5,3)}else e.cd=0.5}
        }else if(e.st==='dive'){e.tm-=dt;if(e.tm<=0){e.st='sub';e.tm=1.2}}
        else if(e.st==='sub'){
          e.x+=dx/d*sp*1.5*dt;e.y+=dy/d*sp*1.5*dt;e.tm-=dt;
          if(Math.random()<0.4)puff(e.x,e.y,'#d9b36a',1,50,0.4,2.5);
          if(e.tm<=0){e.st='warn';e.tm=0.95;e.wx=p.x;e.wy=p.y;tgCircle(e.wx,e.wy,66,0.95,e.dmg*1.5,'phys','#e0b24a')}
        }else if(e.st==='warn'){
          e.tm-=dt;e.x+=(e.wx-e.x)*Math.min(1,dt*5);e.y+=(e.wy-e.y)*Math.min(1,dt*5);
          if(e.tm<=0){e.x=e.wx;e.y=e.wy;e.sub=false;e.st='move';e.cd=rnd(3.2,4.4);puff(e.x,e.y,'#d9b36a',16,200,0.6,4);g.shake=Math.max(g.shake,5);sfx(120,0.3,'sawtooth',0.05,-60)}
        }
      }else if(ai==='specter'){
        if(canMove){e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt}
        e.cd-=dt;
        if(e.cd<=0){
          if(d>220){puff(e.x,e.y,'#8fd8ff',6,90,0.4,2.5);e.x+=dx/d*140;e.y+=dy/d*140;puff(e.x,e.y,'#8fd8ff',6,90,0.4,2.5)}
          e.cd=rnd(3.5,5);
        }
      }else{
        if(canMove){e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt}
      }
    }
    /* телепорт далеко отставших */
    {const lim=spawnR()+450;if(!e.boss&&pd2>lim*lim){const pos=spawnPos();e.x=pos.x;e.y=pos.y}}
    /* контактный урон */
    const rr=e.r+p.r-2;
    if(pd2<rr*rr&&e.ai!=='boss'&&e.st!=='fuse'&&!locked&&!e.sub)hurtPlayer(e.dmg*(e.buf>0?1.25:1),e.def.dt==='magic'?'magic':'phys',{e:e,melee:true});
    else if(e.ai==='boss'&&pd2<rr*rr&&!locked)hurtPlayer(e.dmg,'phys',{e:e,melee:true,boss:true});
  }
  /* препятствия карты */
  if(g.solids.length)for(const e of en){if(!e.dead&&e.ai!=='specter')obsE(e)}
  /* разделение, столкновения с передачей импульса */
  for(let i=0;i<en.length;i++){
    const a=en[i];if(a.dead)continue;
    for(let j=i+1;j<en.length;j++){
      const b=en[j];if(b.dead)continue;
      const dx=b.x-a.x,dy=b.y-a.y,m=(a.r+b.r)*0.85;
      if(dx>m||dx<-m||dy>m||dy<-m)continue;
      const d=Math.hypot(dx,dy);
      if(d>0&&d<m){
        const push=(m-d)*0.5,ux=dx/d,uy=dy/d;
        if(!a.boss){a.x-=ux*push;a.y-=uy*push}
        if(!b.boss){b.x+=ux*push;b.y+=uy*push}
        const rv=(a.kx-b.kx)*ux+(a.ky-b.ky)*uy;
        if(rv>110){
          const jj=rv*0.5;
          if(!a.boss){a.kx-=ux*jj;a.ky-=uy*jj}
          if(!b.boss){b.kx+=ux*jj;b.ky+=uy*jj}
          if(rv>170&&a.cc<=0&&b.cc<=0){
            a.cc=b.cc=0.25;
            const dmg=Math.min(50,rv*0.06);
            sparks((a.x+b.x)/2,(a.y+b.y)/2,'#ffd9a0',5,200);
            hitEnemy(a,dmg,{dt:'pure',src:'auto',col:'#ffd9a0'});
            hitEnemy(b,dmg,{dt:'pure',src:'auto',col:'#ffd9a0'});
            if(a.dead)break;
          }
        }
      }
    }
  }
  for(const s of g.stc){
    if(s.kind!=='wall')continue;
    for(const e of en){
      if(e.dead||e.boss)continue;
      const dx=e.x-s.x,dy=e.y-s.y,m=s.r+e.r,d=Math.hypot(dx,dy);
      if(d<m&&d>0){e.x=s.x+dx/d*m;e.y=s.y+dy/d*m;s.life-=dt*0.5}
    }
  }
  compact(g.en);
}
function updEnemyProj(dt){
  const g=G,p=g.p;
  for(const b of g.eps){
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    if(b.life<=0){b.dead=true;continue}
    let blocked=false;
    for(const s of g.stc){
      if(s.kind!=='wall')continue;
      const dx=b.x-s.x,dy=b.y-s.y;
      if(dx*dx+dy*dy<(s.r+b.r)*(s.r+b.r)){blocked=true;s.life-=1.2;break}
    }
    if(!blocked)for(const s of g.solids){const dx=b.x-s.x,dy=b.y-s.y;if(dx*dx+dy*dy<(s.r+b.r)*(s.r+b.r)){blocked=true;break}}
    if(blocked){b.dead=true;puff(b.x,b.y,b.col,3,60,0.25,2);continue}
    const dx=p.x-b.x,dy=p.y-b.y,rr=p.r+b.r;
    if(dx*dx+dy*dy<rr*rr){b.dead=true;hurtPlayer(b.dmg,b.dt,{src:b.src||'Вражеский снаряд'});if(b.fx==='slow'){g.pslow=2.2;if(g.tx.length<50)g.tx.push({x:p.x,y:p.y-32,t:0.8,txt:'Замедлен',big:false,col:'#9fd0ff'})}}
  }
  for(const t of g.tgs){
    t.t-=dt;
    if(t.t>0)continue;
    t.dead=true;
    if(t.shape==='circle'){
      const dx=p.x-t.x,dy=p.y-t.y;
      ring(t.x,t.y,t.r,t.col,0.3);puff(t.x,t.y,t.col,10,t.r*2,0.45,3);
      g.shake=Math.max(g.shake,t.r>100?7:3);
      if(t.fx==='bolt')skyStrike(t.x,t.y,t.col);
      else if(t.fx==='meteor')boomFx(t.x,t.y,t.r,'#ff7a3a');
      else if(t.fx==='chill'){puff(t.x,t.y,'#e6f7ff',16,t.r*2.2,0.6,3);sfx(900,0.25,'triangle',0.05,-400)}
      else if(t.fx==='roots'){
        if(g.rt.length<12)g.rt.push({x:t.x,y:t.y,r:t.r,t:1.8,max:1.8,seed:Math.floor(Math.random()*1e6)});
        puff(t.x,t.y,'#3f9d4a',14,t.r*2.2,0.5,3);puff(t.x,t.y,'#2a5a2a',8,t.r*1.6,0.6,2.5);sfx(180,0.25,'sawtooth',0.05,-80);
      }
      if(t.hitEn){for(const e of g.en){if(e.dead)continue;const ex=e.x-t.x,ey=e.y-t.y,rr=t.r+e.r;if(ex*ex+ey*ey<=rr*rr){hitEnemy(e,t.hitEn*(t.fx==='bolt'&&e.wet>0?2:1),{dt:'magic',src:'skill',aoe:true,col:t.col,st:t.fx==='bolt'?{stun:0.5}:(t.fx==='roots'?{stun:1.1}:null)});if(!e.dead&&t.fx==='meteor')knockE(e,ex,ey,200)}}}
      if(t.patch)addPatch(t.x,t.y,t.patch.r,t.patch.life,t.patch.dps,'fire');
      if(dx*dx+dy*dy<(t.r+p.r*0.6)*(t.r+p.r*0.6)){
        const hz=t.env?(t.hz||(t.fx==='meteor'?'bombs':(t.fx==='bolt'?'strike':''))):'';
        if(hz&&imm(hz)){
          immFx(hz==='strike'?'+8 маны':'иммунитет');
          if(hz==='strike'){p.mana=Math.min(g.S.maxMana,p.mana+8);ring(p.x,p.y,50,'#f4f08a',0.4);sparks(p.x,p.y,'#f4f08a',10,220)}
        }else{
          hurtPlayer(t.dmg,t.dt,{src:t.src||'Удар по области'});
          if(t.fx==='chill'){g.pslow=2.6;if(g.tx.length<50)g.tx.push({x:p.x,y:p.y-32,t:0.8,txt:'Заморожены ноги',big:false,col:'#bdf0ff'})}
          if(t.fx==='roots'&&g.dashT<=0){g.rootT=1.2;if(g.tx.length<50)g.tx.push({x:p.x,y:p.y-32,t:0.9,txt:'Опутан! Рывок освободит',big:false,col:'#9fe07a'})}
        }
      }
    }else if(t.dmg>0){
      const n=Math.floor(Math.hypot(t.x2-t.x,t.y2-t.y)/40);
      for(let i=0;i<n;i++)puff(t.x+(t.x2-t.x)*i/n,t.y+(t.y2-t.y)*i/n,t.col,2,80,0.35,3);
      g.shake=Math.max(g.shake,5);
      if(distSeg(p.x,p.y,t.x,t.y,t.x2,t.y2)<t.w/2+p.r*0.6)hurtPlayer(t.dmg,t.dt,{src:t.src||'Удар по области'});
    }
  }
}
function compact(a){let j=0;for(let i=0;i<a.length;i++){if(!a[i].dead)a[j++]=a[i]}a.length=j}

