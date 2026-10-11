/* ---------- ульты ---------- */
const ULTFN={};
ULTFN.fire=(lv,c)=>{
  const g=G,t=clampRange(c,480),n=9+3*lv;
  for(let i=0;i<n;i++){
    const a=rnd(0,TAU),d=Math.sqrt(Math.random())*230,tt=0.5+i*0.17;
    g.bl.push({x:t.x+Math.cos(a)*d,y:t.y+Math.sin(a)*d,t:tt,max:tt,r:84,dmg:90+42*lv,dt:'magic',st:{burn:[12,4]},knock:220,vis:'meteor',col:'#ff6a2b',dead:false});
  }
  return t;
};
ULTFN.water=(lv,c)=>{
  const a=c.ang;
  shoot({vis:'tsunami',x:c.px,y:c.py,vx:Math.cos(a)*430,vy:Math.sin(a)*430,r:150,dmg:120+55*lv,dt:'magic',life:2.1,pierce:9999,knock:430,col:'#3aa7ff',st:{wet:3,slow:[0.5,2]},src:'skill',ang:a});
  G.shake=Math.max(G.shake,8);
  return {x:c.px+Math.cos(a)*320,y:c.py+Math.sin(a)*320};
};
ULTFN.earth=(lv,c)=>{
  const g=G;
  explodeAt(c.px,c.py,540,110+50*lv,{dt:'phys',col:'#c9974f',st:{stun:1.6+0.3*lv},knock:200,shake:14,spike:true});
  for(let i=0;i<14;i++){
    const a=rnd(0,TAU),d=rnd(60,380),tt=0.4+i*0.08;
    g.bl.push({x:c.px+Math.cos(a)*d,y:c.py+Math.sin(a)*d,t:tt,max:tt,r:50,dmg:60+25*lv,dt:'phys',st:{stun:0.6},knock:80,vis:'spike',col:'#d9b36a',dead:false});
  }
  return {x:c.px,y:c.py};
};
ULTFN.air=(lv,c)=>{
  const g=G;
  g.em.push({kind:'storm',life:4,tm:0,rate:0.1,dmg:70+30*lv,col:'#f4f08a'});
  g.bf.spd={t:4,v:0.3};tickBuffs(0);
  return {x:c.px,y:c.py};
};
ULTFN.metal=(lv,c)=>{
  const g=G;
  g.em.push({kind:'spiral',life:3,tm:0,rate:0.04,ang:rnd(0,TAU),arms:3,spd:640,r:6,dmg:22+10*lv,dt:'phys',pierce:2,plife:0.9,vis:'bullet',col:'#e8eef8'});
  CAST.struct({turrets:2,walls:0,tdmg:14+6*lv,tdt:'phys',tcd:0.4,life:12,tvis:'turret',col:'#b4c0d4'},{px:c.px,py:c.py,x:c.px+40,y:c.py+40,ang:0});
  return {x:c.px,y:c.py};
};
ULTFN.wood=(lv,c)=>{
  addZone(c.px,c.py,{r:260,life:6,dps:40+20*lv,heal:10+4*lv,dt:'magic',vis:'forest',col:'#62c15a',st:{root:0.7}},true);
  ring(c.px,c.py,260,'#62c15a',0.6);
  return {x:c.px,y:c.py};
};
function ultMod(p,x,y,lv){
  const g=G;
  if(p==='fire'){explodeAt(x,y,200,60+25*lv,{dt:'magic',col:'#ff6a2b',st:{burn:[10,4]},knock:100});addZone(x,y,{r:120,life:4,dps:22+10*lv,dt:'magic',vis:'lava',col:'#ff4a2a'})}
  else if(p==='water')explodeAt(x,y,260,40+15*lv,{dt:'magic',col:'#3aa7ff',st:{slow:[0.45,3],wet:3}});
  else if(p==='earth')explodeAt(x,y,240,60+25*lv,{dt:'phys',col:'#c9974f',st:{stun:1.2},shake:6,spike:true});
  else if(p==='air'){
    const near=nearList(x,y,420);
    for(let i=0;i<6&&near.length;i++)chainBolt(x,y,pickOf(near),2,50+22*lv,170,{col:'#f4f08a',shock:true});
  }
  else if(p==='metal'){
    for(let i=0;i<16;i++){const a=i*TAU/16;shoot({vis:'bullet',x:x,y:y,vx:Math.cos(a)*600,vy:Math.sin(a)*600,r:5,dmg:24+10*lv,dt:'phys',life:0.8,pierce:2,col:'#e8eef8',src:'proj'})}
    CAST.struct({turrets:2,walls:0,tdmg:12+5*lv,tdt:'phys',tcd:0.45,life:8,tvis:'turret',col:'#b4c0d4'},{px:x,py:y,x:x+30,y:y+30,ang:0});
  }
  else if(p==='wood'){addZone(x,y,{r:200,life:4,dps:0,heal:18,dt:'magic',vis:'vines',col:'#62c15a',st:{root:1}})}
}
const ULT_LV=12;
function ultMods(){const g=G;return EK.filter(p=>p!==g.start&&g.ult.seals&&g.ult.seals[p])}
function symUltName(id){return 'Великий симбиоз: '+AB[id].n}
function ultInfo(){
  const g=G,k=g.ult.kind;
  if(k&&k.indexOf('sym:')===0){const id=k.slice(4),a=AB[id];return {n:symUltName(id),d:'«'+a.n+'» тройной силы с вашими мутациями: главный удар в прицел и два отголоска рядом.',mana:95,cd:75,c1:a.c1,c2:a.c2}}
  const u=ULT[g.start];return {n:u.n,d:u.d,mana:u.mana,cd:u.cd,c1:EL[g.start].c,c2:EL[g.start].c2};
}
function symUlt(id,lv,c){
  const g=G,a=AB[id],pr=skillPr({id:id,lv:5});
  mulK(pr,['dmg','dps','heal','tdmg'],1.6+0.5*lv);
  if(pr.r)pr.r*=1.3;if(pr.n)pr.n+=2+lv;if(pr.life)pr.life*=1.25;if(pr.turrets)pr.turrets+=lv;if(pr.spread)pr.spread*=1.2;
  CAST[a.kind](pr,c);runHooks(pr,c,a);
  for(let i=0;i<2;i++)later(0.4*(i+1),()=>{const o=(i?-1:1)*0.45,d=120,ang=c.ang+o*2.2;
    const c2=Object.assign({},c,{px:G.p.x,py:G.p.y,x:c.x+Math.cos(ang)*d,y:c.y+Math.sin(ang)*d,ang:c.ang+o});
    const p2=Object.assign({},pr);p2.hk=[];mulK(p2,['dmg','dps','heal','tdmg'],0.6);CAST[a.kind](p2,c2)});
  g.shake=Math.max(g.shake,10);
  return clampRange(c,420);
}
function castUlt(){
  const g=G;
  if(!g||mode!=='play'||uiOpen())return;
  if(!g.ult.lv){if(!g.ult.warn||g.t-g.ult.warn>2){g.ult.warn=g.t;toast('Ульта ещё закрыта','На '+ULT_LV+' уровне героя придёт очко ульты: древо (T) → Ульта')}return}
  const u=ultInfo();
  if(g.ult.cd>0)return;
  if(g.p.mana<u.mana){g.nomana=0.35;sfx(130,0.1,'square',0.03);return}
  g.p.mana-=u.mana;
  g.ult.cdMax=u.cd*(1-g.S.ultcd)/(1+g.E.cdr*0.5);g.ult.cd=g.ult.cdMax;
  const c=castCtx(u.c1,u.c2);
  const ep=(g.ult.kind&&g.ult.kind.indexOf('sym:')===0?symUlt(g.ult.kind.slice(4),g.ult.lv,c):ULTFN[g.start](g.ult.lv,c))||{x:c.px,y:c.py};
  for(const p of ultMods())ultMod(p,ep.x,ep.y,g.ult.lv);
  g.shake=Math.max(g.shake,8);g.zk=Math.max(g.zk,0.045);
  ring(g.p.x,g.p.y,160,EL[g.start].c,0.6);
  toast(u.n,ultMods().length?('+ '+ultMods().map(p=>ULTMOD[p]).join(', ')):'');
  sfx(220,0.4,'sawtooth',0.06,260);
}

