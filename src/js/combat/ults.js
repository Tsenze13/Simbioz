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
const ULT_LV=BAL.hero.ultLv;
/* Печати мастерства: у мастеров вместо печатей симбиозов. fx(x,y,lv) — после удара ульты в точке (x,y). */
function onScreen(){const g=G;return g.en.filter(e=>!e.dead&&!e.sub&&simVis(e.x,e.y,40))}
const MSEAL={
  fire:[{k:'ash',n:'Пепелище',d:'Ульта оставляет горящую землю на 6 с',fx(x,y,lv){addZone(x,y,{vis:'wildfire',r:150,life:6,dps:12+8*lv+SW()*1.5,dt:'magic',col:'#ff7a3a',st:{burn:[6+2*lv,3]}})}},
    {k:'nova',n:'Сверхновая',d:'Мощный взрыв в центре удара',fx(x,y,lv){explodeAt(x,y,220,60+30*lv+SW()*4,{dt:'magic',col:'#ffb347',knock:320,shake:9})}},
    {k:'ignite',n:'Возгорание',d:'Поджигает всех врагов на экране',fx(x,y,lv){for(const e of onScreen())applySt(e,{burn:[10+3*SW(),4]},1)}}],
  water:[{k:'tsunami',n:'Цунами',d:'Отбрасывает и мочит всех вокруг героя',fx(x,y,lv){const p=G.p;for(const e of G.en){if(e.dead)continue;const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<320){knockE(e,e.x-p.x,e.y-p.y,520);applySt(e,{wet:3},1)}}ring(p.x,p.y,320,'#3aa7ff',0.6)}},
    {k:'heal',n:'Исцеление',d:'Ульта лечит 30% здоровья',fx(x,y,lv){heal(G.S.maxHp*0.3);ring(G.p.x,G.p.y,90,'#6fe3a0',0.6)}},
    {k:'frost',n:'Лёд',d:'Замораживает врагов у точки удара на 2 с',fx(x,y,lv){for(const e of G.en){if(!e.dead&&(e.x-x)**2+(e.y-y)**2<260*260)applySt(e,{frz:2},1)}ring(x,y,260,'#bdf0ff',0.6)}}],
  earth:[{k:'quake',n:'Землетрясение',d:'Оглушает всех врагов на экране на 1,5 с',fx(x,y,lv){for(const e of onScreen()){applySt(e,{stun:1.5},1);hitEnemy(e,10+5*lv+SW()*2,{dt:'phys',aoe:true,quiet:true})}G.shake=Math.max(G.shake,10)}},
    {k:'citadel',n:'Цитадель',d:'4 секунды неуязвимости',fx(x,y,lv){G.shield=Math.max(G.shield,4);ring(G.p.x,G.p.y,70,'#c9974f',0.6)}},
    {k:'debris',n:'Обломки',d:'После удара падает град камней',fx(x,y,lv){for(let i=0;i<8;i++){const a=rnd(0,TAU),d=rnd(40,200);CAST.blast({r:50,dmg:20+10*lv+SW()*2,dt:'phys',delay:0.4+i*0.1,range:5000,vis:'shell',col:'#c9974f',knock:140},{px:G.p.x,py:G.p.y,x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,ang:0,col:'#c9974f'})}}}],
  air:[{k:'hurricane',n:'Ураган',d:'Затягивает врагов в центр удара',fx(x,y,lv){for(const e of G.en){if(e.dead)continue;const d=Math.hypot(e.x-x,e.y-y);if(d<340&&d>20)knockE(e,x-e.x,y-e.y,Math.min(600,d*2.2))}ring(x,y,340,'#8febd0',0.6)}},
    {k:'storm',n:'Шторм',d:'6 молний бьют врагов на экране',fx(x,y,lv){const L=onScreen();for(let i=0;i<6&&L.length;i++){const e=pickOf(L);chainBolt(e.x+rnd(-30,30),e.y-320,e,1,30+12*lv+SW()*3,150,{dt:'magic',shock:true,col:'#f4f08a'})}}},
    {k:'tailwind',n:'Попутный ветер',d:'Рывки восстановлены, скорость +40% на 5 с',fx(x,y,lv){const g=G;g.p.dch=1+(g.S.dch||0);g.bf.spd={t:5,v:0.4};tickBuffs(0)}}],
  metal:[{k:'carpet',n:'Ковровая бомбардировка',d:'Линия взрывов от героя до цели',fx(x,y,lv){const p=G.p;for(let i=1;i<=10;i++){const k=i/10;CAST.blast({r:55,dmg:22+10*lv+SW()*2,dt:'phys',delay:0.15+i*0.07,range:5000,vis:'shell',col:'#ffb347',knock:160},{px:p.x,py:p.y,x:p.x+(x-p.x)*k*1.3,y:p.y+(y-p.y)*k*1.3,ang:0,col:'#ffb347'})}}},
    {k:'ap',n:'Бронебойные',d:'Ржавчина на всех врагах экрана: −14 брони на 6 с',fx(x,y,lv){for(const e of onScreen())e.rust=Math.max(e.rust,6)}},
    {k:'overdrive',n:'Перегрузка стволов',d:'5 с все стволы стреляют вдвое чаще',fx(x,y,lv){G.odT=5}}],
  wood:[{k:'jungle',n:'Джунгли',d:'Корни держат всех врагов на экране 2 с',fx(x,y,lv){for(const e of onScreen())applySt(e,{root:2},1)}},
    {k:'plague',n:'Чума',d:'Отравляет всех врагов на экране',fx(x,y,lv){for(const e of onScreen())applySt(e,{poison:[8+2*SW(),5]},1)}},
    {k:'bloom',n:'Цветение',d:'Лечит 20% и даёт +8 регенерации на 6 с',fx(x,y,lv){const g=G;heal(g.S.maxHp*0.2);g.bf.regen={t:6,v:8};tickBuffs(0)}}]
};
function ultMods(){const g=G;return EK.filter(p=>p!==g.start&&g.ult.seals&&g.ult.seals[p])}
function symUltName(id){return 'Великий симбиоз: '+AB[id].n}
function ultInfo(){
  const g=G,k=g.ult.kind;
  if(k&&k.indexOf('sym:')===0){const id=k.slice(4),a=AB[id];return {n:symUltName(id),d:'«'+a.n+'» тройной силы с вашими мутациями: главный удар в прицел и два отголоска рядом.',mana:95,cd:75,c1:a.c1,c2:a.c2}}
  const u=ULT[g.start];return {n:u.n,d:u.d,mana:u.mana,cd:u.cd,c1:hEl(g.start).c,c2:hEl(g.start).c2};
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
  if(!g.ult.lv){if(!g.ult.warn||g.t-g.ult.warn>2){g.ult.warn=g.t;toast('Ульта ещё закрыта','С '+ULT_LV+' уровня героя: древо (T) → Ульта, 1 очко навыков')}return}
  const u=ultInfo();
  if(g.ult.cd>0)return;
  if(g.p.mana<u.mana){g.nomana=0.35;sfx(130,0.1,'square',0.03);return}
  g.p.mana-=u.mana;
  g.ult.cdMax=u.cd*(1-g.S.ultcd)/(1+g.E.cdr*0.5);g.ult.cd=g.ult.cdMax;
  const c=castCtx(u.c1,u.c2),L0=lens();g.curSk='__ult';
  const ep=(g.ult.kind&&g.ult.kind.indexOf('sym:')===0?symUlt(g.ult.kind.slice(4),g.ult.lv,c):ULTFN[g.start](g.ult.lv,c))||{x:c.px,y:c.py};
  for(const p of ultMods())ultMod(p,ep.x,ep.y,g.ult.lv);
  if(!isAva(g)&&MSEAL[g.start]&&g.ult.ms)for(const s of MSEAL[g.start])if(g.ult.ms[s.k])s.fx(ep.x,ep.y,g.ult.lv);
  tagNew(L0,'__ult');g.curSk=null;
  g.shake=Math.max(g.shake,8);g.zk=Math.max(g.zk,0.045);
  ring(g.p.x,g.p.y,160,hEl(g.start).c,0.6);
  toast(u.n,ultMods().length?('+ '+ultMods().map(p=>ULTMOD[p]).join(', ')):'');
  sfx(220,0.4,'sawtooth',0.06,260);
}

