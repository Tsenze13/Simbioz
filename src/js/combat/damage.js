/* =====================================================================
   БОЕВАЯ СИСТЕМА
   ===================================================================== */
const uiOpen=()=>!!(G&&(G.lvlOpen||G.shopOpen||G.treeOpen||G.paused||G.over));
function nearest(x,y,maxD){
  let b=null,bd=maxD*maxD;
  for(const e of G.en){
    if(e.dead)continue;
    const dx=e.x-x,dy=e.y-y,d=dx*dx+dy*dy;
    if(d<bd){bd=d;b=e}
  }
  return b;
}
function nearList(x,y,r){
  const out=[],r2=r*r;
  for(const e of G.en){
    if(e.dead)continue;
    const dx=e.x-x,dy=e.y-y;
    if(dx*dx+dy*dy<r2)out.push(e);
  }
  return out;
}
function knockE(e,dx,dy,f){const d=Math.hypot(dx,dy)||1;e.kx+=dx/d*f*e.kres;e.ky+=dy/d*f*e.kres}
const SEAS=[{n:'Весна',c:'#8fe07a',d:'+2 регенерации'},{n:'Лето',c:'#ffd36b',d:'яд +40%'},{n:'Осень',c:'#e08a3a',d:'шипы +30%'},{n:'Зима',c:'#bfe6ff',d:'корни дольше на 50%'}];
function applySt(e,st,dm){
  if(!st)return;
  const c=e.boss?0.25:(e.elite?0.5:1);
  dm=(dm||1)*((G&&G.cls&&G.cls.dot)||1);
  if(st.burn){e.burn=Math.max(e.burn,st.burn[1]+(G&&G.start==='fire'&&G.pl>=2?1:0));e.burnDps=Math.max(e.burnDps,st.burn[0]*dm)}
  if(st.poison){const pm=(1+PV('wood',[0,.15,.3,.45]))*(G&&G.start==='wood'&&G.season===1?1.4:1);if(G&&G.start==='wood'&&G.pl>=2)e.pst=e.poison>0?Math.min(3,(e.pst||1)+1):1;e.poison=Math.max(e.poison,st.poison[1]);e.poisonDps=Math.max(e.poisonDps,st.poison[0]*dm*pm)}
  if(st.slow){
    const f=e.boss?1-(1-st.slow[0])*0.5:st.slow[0];
    e.slowF=e.slow>0?Math.min(e.slowF,f):f;e.slow=Math.max(e.slow,st.slow[1]);
  }
  if(st.frz)e.frz=Math.max(e.frz,st.frz*c);
  if(st.stun)e.stun=Math.max(e.stun,st.stun*c);
  if(st.root)e.root=Math.max(e.root,st.root*c*(G&&G.start==='wood'&&G.season===3?1.5:1));
  if(st.wet)e.wet=Math.max(e.wet,st.wet);
  if(st.rust)e.rust=Math.max(e.rust,st.rust);
}
/* Множители исходящего урона героя. Новая механика усиления урона = новая строка тут. */
const OUT_MODS=[
  (e,o,g,dot)=>e.burn>0&&g.start==='fire'&&g.pl?1+PV('fire',[0,.08,.15,.25]):1, /* пассивка Пироманта по горящим */
  (e,o,g,dot)=>g.ovhT>0&&!dot?1.5:1,  /* Перегрев Пироманта */
  (e,o,g,dot)=>g.shdT>0&&!dot?(g.syn.assassin?2:1.5):1   /* Плащ тени после рывка (комбо «Убийца из тени» — ×2) */
];
function outMods(e,o,g,dot){let m=1;for(const f of OUT_MODS)m*=f(e,o,g,dot);return m}
/* Защита босса: барьер фазы, лимит урона за удар, троттлинг плотного урона (числа в BAL.boss).
   Возвращает урон после защиты; 0 — удар целиком ушёл в барьер. */
function bossDefense(e,eff,o,dot){
  const g=G;
  if(e.bar>0){const a=Math.min(e.bar,eff);e.bar-=a;eff-=a;
    if(e.bar<=0){e.bar=0;ring(e.x,e.y,e.r+50,'#7fe6ff',0.5);puff(e.x,e.y,'#bff4ff',24,260,0.5,3);if(g.tx.length<50)g.tx.push({x:e.x,y:e.y-e.r-26,t:1,txt:'Барьер сломан',big:true,col:'#7fe6ff'})}
    if(eff<=0){e.flash=0.05;if(!o.quiet&&!dot&&Math.random()<0.25&&g.tx.length<40)g.tx.push({x:e.x+rnd(-14,14),y:e.y-e.r,t:0.5,txt:'барьер',big:false,col:'#7fe6ff'});return 0}}
  const now=g.t;e.rd=(e.rd||0)*Math.exp(-Math.max(0,now-(e.rdt||now))/2);e.rdt=now;
  const lim=e.max*BAL.boss.burstLim;if(e.rd>lim)eff*=Math.max(BAL.boss.burstFloor,1-(e.rd-lim)/lim);
  eff=Math.min(eff,e.max*BAL.boss.hitCap);e.rd+=eff;
  return eff;
}
/* o: {dt,src:'skill'|'proj'|'auto'|'zone'|'dot'|'item', st, col, quiet, aoe, shock, icy, proj} */
/* Учёт урона по источникам для итогов забега: ключ — id навыка или служебная метка (__auto, __gun …). */
const DMG_LBL={__auto:'Автоатака',__gun:'Стволы',__item:'Предметы',__dot:'Горение и яд',__dash:'Рывок',__mech:'Особенность героя',__other:'Прочее'};
function dmgKey(o){const g=G,src=o.src||'skill';return o.sk||g.curSk||(src==='auto'?'__auto':src==='item'?'__item':src==='dot'?'__dot':'__other')}
function dmgLabel(k){if(k.indexOf('form:')===0&&FORMS[k.slice(5)])return FORMS[k.slice(5)].n;if(k==='__ult')return 'Ульта: '+ultInfo().n;return DMG_LBL[k]||(AB[k]?AB[k].n:k)}
/* Метит сущности, созданные навыком (снаряды, зоны, взрывы, смерчи, постройки), чтобы их урон шёл в зачёт навыку. */
function tagNew(L0,sk){const g=G;for(const k in L0){const A=g[k];for(let i=L0[k];i<A.length;i++)if(A[i]&&!A[i].sk)A[i].sk=sk}}
function lens(){const g=G;return {pr:g.pr.length,zn:g.zn.length,bl:g.bl.length,tor:g.tor.length,stc:g.stc.length,em:g.em.length}}
function hitEnemy(e,dmg,o){
  if(e.dead||e.sub)return 0;
  const g=G,E=g.E;
  o=o||{};
  const src=o.src||'skill',dot=src==='dot',zone=src==='zone',dt=o.dt||'phys';
  let crit=false,react=null,overload=false;
  if(!dot)dmg*=E.dm;
  dmg*=outMods(e,o,g,dot);
  {const cc=E.crit+(o.cc||0);if(!dot&&!zone&&cc>0&&Math.random()<cc){dmg*=2;crit=true}}
  if(o.fcrit)crit=true;
  if(o.shock&&!dot){
    if(e.wet>0){dmg*=1.5;e.stun=Math.max(e.stun,e.boss?0.1:0.35);react='Электрошок'}
    else if(e.burn>0&&e.ovl<=0){e.ovl=1.6;react='Перегрузка';overload=true}
  }
  if(o.icy&&e.frz>0)dmg*=1.6;
  let eff=dmg;
  if(dt==='phys'){
    eff*=1-armorRed((e.empU>g.t?0:e.armor)-(e.rust>0?14:0));
    if(e.frz>0&&!dot&&!zone){eff*=1.5;e.frz=0;react='Раскол'}
  }else if(dt==='magic')eff*=1-e.mres;
  if(eff<0.2)eff=0.2;
  if(e.boss){eff=bossDefense(e,eff,o,dot);if(eff<=0)return 0}
  const before=e.hp;
  e.hp-=eff;e.flash=0.09;
  {const k=dmgKey(o),D=g.dmgBy||(g.dmgBy={});D[k]=(D[k]||0)+Math.min(eff,Math.max(0,before));if(o.st&&(o.st.burn||o.st.poison)&&k!=='__dot')e.dsk=k}
  if(E.ls>0)heal(Math.min(eff,Math.max(0,before))*E.ls*((dot||zone||o.aoe)?0.4:1));
  if(!o.quiet&&g.tx.length<48&&(!zone||Math.random()<0.6)){
    g.tx.push({x:e.x+rnd(-7,7),y:e.y-e.r-2,t:0.65,txt:String(Math.max(1,Math.round(eff))),big:crit||eff>=60,crit:crit,col:DT[dt].c,react:react});
  }
  if(!o.quiet&&!dot){
    const col=o.col||DT[dt].c;
    if(g.spk.length<110&&(crit||o.proj))sparks(e.x,e.y,col,crit?7:2,crit?260:160);
    if(g.pt.length<430)puff(e.x,e.y,col,crit?8:(o.aoe?1:3),crit?180:120,0.3,crit?2.8:2);
    if((o.proj||crit)&&g.fx.length<60)ring(e.x,e.y,crit?24:15,col,0.16);
    const now=performance.now();
    if(now-lastHitSfx>55){lastHitSfx=now;sfx(crit?520:240+Math.random()*60,0.04,crit?'triangle':'square',0.016,-60)}
  }
  if(e.hp>0){
    if(o.st)applySt(e,o.st,E.dm);
    if(g.ifx&&g.ifx.venom&&!dot&&!zone)applySt(e,{poison:[(3+0.6*SW())*(g.syn.fangs?1.5:1),3]},1);
    if(overload){
      g.shake=Math.max(g.shake,3);
      explodeAt(e.x,e.y,70,eff*0.8/Math.max(0.01,E.dm),{dt:'magic',col:'#ffb347',src:'skill',noReact:true});
    }
  }else killEnemy(e,o);
  return eff;
}
function dropLoot(e){
  const g=G,t=e.type,r=Math.random(),d=e.def;
  const gv=Math.max(1,Math.round(d.gold*(1+(SW()-1)*0.06)*BAL.chap.goldGain));
  if(e.boss){
    for(let i=0;i<3;i++)addGem(e.x+rnd(-40,40),e.y+rnd(-40,40),'xl');
    for(let i=0;i<8;i++){const a=rnd(0,TAU),dd=rnd(20,80);addGem(e.x+Math.cos(a)*dd,e.y+Math.sin(a)*dd,'l')}
    for(let i=0;i<8;i++){const a=rnd(0,TAU),dd=rnd(20,90);addCoin(e.x+Math.cos(a)*dd,e.y+Math.sin(a)*dd,10+SW()*2.5)}
    addPickup(e.x-24,e.y,'heal');addPickup(e.x+24,e.y,'magnet');
    return;
  }
  if(e.elite){
    for(let i=0;i<2;i++)addGem(e.x+rnd(-18,18),e.y+rnd(-18,18),'l');
    addGem(e.x,e.y,r<0.5?'xl':'m');
    for(let i=0;i<3;i++)addCoin(e.x+rnd(-16,16),e.y+rnd(-16,16),gv*2);
    addPickup(e.x,e.y,pickOf(PK_KEYS));
    return;
  }
  let k=d.xp||'s';
  if(k==='s'&&r<0.08)k='m';
  addGem(e.x,e.y,k);
  if(Math.random()<0.5)addCoin(e.x+rnd(-8,8),e.y+rnd(-8,8),gv);
  const q=Math.random();
  if(q<0.014)addPickup(e.x,e.y,'heal');
  else if(q<0.022)addPickup(e.x,e.y,'magnet');
  else if(q<0.028)addPickup(e.x,e.y,'shield');
  else if(q<0.032)addPickup(e.x,e.y,'bomb');
}
function addPickup(x,y,type){G.pk.push({x:x,y:y,type:type,life:30,dead:false})}
function usePickup(type){
  const g=G,p=g.p;
  ring(p.x,p.y,110,PK[type].c,0.5);
  puff(p.x,p.y,PK[type].c,18,200,0.5,3);
  if(type==='heal')heal(Math.max(25,g.S.maxHp*0.25));
  else if(type==='magnet'){for(const m of g.gem)m.fly=true;g.vac=3}
  else if(type==='shield')g.shield=Math.max(g.shield,6);
  else if(type==='bomb'){
    const dmg=(40+SW()*14);
    for(const e of g.en){
      if(e.dead||!vis(e.x,e.y,40))continue;
      hitEnemy(e,dmg,{dt:'magic',aoe:true,col:'#ffb347'});
      if(!e.dead)knockE(e,e.x-p.x,e.y-p.y,220);
    }
    g.shake=Math.max(g.shake,9);
    ring(p.x,p.y,Math.max(W,H)*0.6,'#ffb347',0.6);
  }
  toast(PK[type].n,PK[type].d);
  sfx(520,0.18,'triangle',0.05,400);
}
function killEnemy(e,o){
  const g=G;
  if(e.dead)return;
  e.dead=true;g.kills++;
  puff(e.x,e.y,e.col,e.boss?40:(e.elite?14:7),e.boss?260:120,0.5,e.boss?4:2.4);
  debrisAt(e);
  const now=performance.now();
  if(now-lastKillSfx>70){lastKillSfx=now;sfx(rnd(170,250),0.06,'square',0.02,-80)}
  if(e.def.split){
    for(let i=0;i<e.def.split;i++){const a=rnd(0,TAU);spawnAt('slimelet',e.x+Math.cos(a)*12,e.y+Math.sin(a)*12,e.hpMul,e.dmgMul)}
  }
  if(g.cls&&!g.inChain){
    if(g.start==='fire'&&e.burn>0){g.inChain=true;const bx=g.pl>=3?2:1;explodeAt(e.x,e.y,58*(g.pl>=3?1.4:1),(12+6*g.el.fire)*bx,{dt:'magic',col:'#ff7a3a',st:{burn:[3,2]},src:'skill',quiet:true,sk:'__mech'});g.inChain=false}
    if(g.start==='water'&&e.wet>0&&o&&o.shock){g.p.mana=Math.min(g.S.maxMana,g.p.mana+5);if(g.tx.length<40&&Math.random()<0.5)g.tx.push({x:e.x,y:e.y-16,t:0.7,txt:'+5 маны',big:false,col:'#6fd0ff'})}
    if(g.start==='wood'&&e.poison>0&&g.pl>=3)heal(g.S.maxHp*0.01);
    if(g.ifx&&g.ifx.sapling)heal(g.S.maxHp*0.006);
    if(g.start==='wood'&&e.poison>0){for(const o of g.en){if(!o.dead&&o!==e&&(o.x-e.x)**2+(o.y-e.y)**2<85*85)applySt(o,{poison:[e.poisonDps*0.6,3]},1/(g.cls.dot||1))}ring(e.x,e.y,85,'#a6e07a',0.4)}
  }
  if(e.def.onDeath){const lv=e.def.onDeath==='lava';addPatch(e.x,e.y,lv?52:40,lv?4:3,e.dmg*(lv?1.1:0.9),lv?'lava':'fire')}
  if(e.affix==='volatile')g.tgs.push({x:e.x,y:e.y,r:85,t:0.7,max:0.7,dmg:e.dmg*1.6,dt:'magic',col:'#ff7a3a',shape:'circle'});
  dropLoot(e);
  if(e.boss){
    g.bossKills++;g.shake=Math.max(g.shake,12);g.slowmo=0.9;g.zk=0.05;
    ring(e.x,e.y,180,'#c46bff',0.6);
    sfx(90,0.5,'sawtooth',0.07,-40);
  }
  if(e===g.bossRef)g.bossDead=true;
}
function explodeAt(x,y,r,dmg,o){
  const g=G;
  o=o||{};
  const oo={dt:o.dt,src:o.src||'skill',st:o.st,col:o.col,aoe:true,quiet:o.quiet,sk:o.sk};
  for(const e of g.en){
    if(e.dead)continue;
    const dx=e.x-x,dy=e.y-y,rr=r+e.r;
    if(dx*dx+dy*dy<=rr*rr){
      hitEnemy(e,dmg,oo);
      if(o.knock&&!e.dead)knockE(e,dx,dy,o.knock);
    }
  }
  const col=o.col||DT[o.dt||'phys'].c;
  ring(x,y,r,col,0.34,o.spike);
  puff(x,y,col,Math.min(14,5+Math.floor(r/14)),r*2.2,0.45,3);
  if(!o.quiet)boomFx(x,y,r,gcol(col));
  if(o.shake)g.shake=Math.max(g.shake,o.shake);
}
function burstAt(b,x,y){const q=b.burst,off=rnd(0,TAU);for(let i=0;i<q.n;i++){const a=off+i*TAU/q.n;shoot({vis:q.vis||'seed',x:x,y:y,vx:Math.cos(a)*(q.spd||300),vy:Math.sin(a)*(q.spd||300),r:5,dmg:q.dmg,dt:b.dt,life:q.life||0.8,pierce:1,col:q.col||b.col,st:q.st||b.st,homing:!!q.homing,src:'proj'})}}
function shoot(o){if(!o.sk&&G.curSk)o.sk=G.curSk;if((o.src==='auto'||o.gun)&&!o.hr)o.hr=o.r+8;
  o.pierce=o.pierce||0;o.hit=null;G.pr.push(o);
  if((o.src==='auto'||o.src==='skill')&&!o.gun&&o.vis!=='bullet'&&o.vis!=='pellet')heroAtk(Math.atan2(o.vy,o.vx));
}
function heroAtk(a){const g=G;if(!g||!g.p||g.hand)return;if(!g.hat||g.hat.t>.5){g.hat={t:0,dur:.34}}g.hla=a;g.hlt=.6}
function angd(a,b){let d=a-b;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return d}
function handPs(g){
  const h=g.hand,hf=g.hf||0,ar=clamp(angd(h.aim,hf),-.9,.9),lx=Math.cos(ar)*7,ly=9.4+Math.sin(ar)*7,c=Math.cos(hf),s=Math.sin(hf);
  return {x:g.p.x+(lx*c-ly*s)*1.32,y:g.p.y+(lx*s+ly*c)*1.32};
}
function chainBolt(x,y,first,jumps,dmg,range,o){
  const g=G,pts=[{x:x,y:y}],hit=new Set();
  let cur=first,d=dmg;
  for(let i=0;i<=jumps&&cur;i++){
    hit.add(cur);
    pts.push({x:cur.x,y:cur.y});
    hitEnemy(cur,d,{dt:o.dt||'magic',shock:o.shock,icy:o.icy,st:o.st,col:o.col,src:o.src||'skill',proj:true});
    d*=0.92;
    let nx=null,nd=range*range;
    for(const e of g.en){
      if(e.dead||hit.has(e))continue;
      const dx=e.x-cur.x,dy=e.y-cur.y,q=dx*dx+dy*dy;
      if(q<nd){nd=q;nx=e}
    }
    cur=nx;
  }
  g.bolts.push({pts:pts,t:0.22,max:0.22,col:o.col||'#f4f08a'});
  const now=performance.now();
  if(now-lastBoltSfx>90){lastBoltSfx=now;sfx(rnd(700,900),0.08,'sawtooth',0.02,-300)}
}
function addZone(x,y,z,self){
  const g=G,area=1+g.S.area;
  g.zn.push({sk:g.curSk||undefined,kind:z.vis||'zone',x:x,y:y,r:z.r*area,life:z.life,max:z.life,tick:0.08,dps:z.dps||0,dt:z.dt||'magic',heal:z.heal||0,st:z.st||null,col:z.col||'#ffffff',follow:!!(self||z.follow),dead:false});
}

/* ---------- прицел ---------- */
function s2w(sx,sy){const z=ZM*(1+(G?G.zk:0));return {x:cam.x+VW/2+(sx-W/2)/z,y:cam.y+VH/2+(sy-H/2)/z}}
function aimPoint(){
  const g=G,p=g.p;
  if(g.autoAim){const t=nearest(p.x,p.y,600);if(t)return {x:t.x,y:t.y}}
  if(mouse.on&&!uiTouch)return s2w(mouse.x,mouse.y);
  const t=nearest(p.x,p.y,520);
  if(t)return {x:t.x,y:t.y};
  return {x:p.x+Math.cos(p.face)*220,y:p.y+Math.sin(p.face)*220};
}
function castCtx(c1,c2){
  const p=G.p,a=aimPoint();
  return {px:p.x,py:p.y,x:a.x,y:a.y,ang:Math.atan2(a.y-p.y,a.x-p.x),col:c1,col2:c2};
}
function clampRange(c,range){
  const dx=c.x-c.px,dy=c.y-c.py,d=Math.hypot(dx,dy);
  if(d<=range)return {x:c.x,y:c.y};
  return {x:c.px+dx/d*range,y:c.py+dy/d*range};
}

