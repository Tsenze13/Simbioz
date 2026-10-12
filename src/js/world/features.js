/* =====================================================================
   ОСОБЕННОСТИ КАРТ: у каждой из 24 карт глав — одна своя точка интереса.
   spring — источник: стоишь в нём — лечит и даёт ману;
   shrine — святилище: постой рядом — благословение на 40 с (урон и скорость), потом остывает 3 волны;
   nest   — гнездо: стоит на карте и выпускает врагов, пока его не разрушить (награда: золото и опыт);
   cache  — тайник: постой рядом — золото и предмет. Один раз за карту.
   Точка появляется в ~520 px от героя при входе на карту и показывается стрелкой у края экрана.
   ===================================================================== */
const FEAT={
  lawn:['shrine','Каменный идол'],forest:['cache','Тайник лесника'],bog:['nest','Гнилое гнездо'],thicket:['spring','Живой родник'],
  steppe:['cache','Брошенный караван'],dunes:['shrine','Солнечный обелиск'],oasis:['spring','Родник оазиса'],tomb:['nest','Саркофаг'],
  shore:['spring','Тёплый ключ'],ice:['cache','Вмёрзший сундук'],glacier:['nest','Ледяное логово'],palace:['shrine','Ледяной трон'],
  cinder:['spring','Чистый ключ'],ash:['shrine','Пепельный идол'],mines:['cache','Забытая вагонетка'],rift:['nest','Разлом пустоты'],
  hills:['spring','Дождевая чаша'],storm:['nest','Грозовой улей'],pylons:['shrine','Старый громоотвод'],eye:['cache','Обломки бури'],
  cooled:['cache','Обсидиановый тайник'],lava:['spring','Огненный ключ'],river:['nest','Огненное гнездо'],maw:['shrine','Алтарь Пожирателя']
};
const FEAT_HINT={spring:'постой в нём — лечит и восстанавливает ману',shrine:'постой рядом — благословение: +25% урона и +12% скорости на 40 с',
  nest:'выпускает врагов, пока цел. Разрушь — получишь золото и опыт',cache:'постой рядом пару секунд — золото и предмет'};
function placeFeature(){
  const g=G,f=FEAT[g.map];
  g.feat=null;
  if(!f)return;
  const a=rnd(0,TAU);
  const q=freeSpot(g.p.x+Math.cos(a)*520,g.p.y+Math.sin(a)*520,60,200);
  g.feat={t:f[0],n:f[1],x:q.x,y:q.y,prog:0,done:false,cdW:0,ref:null,bob:rnd(0,TAU),col:MAPS[g.map].glow};
  setTimeout(()=>{if(G===g&&g.feat)toast('На карте: '+f[1],FEAT_HINT[f[0]])},9800);
}
/* гнездо — неподвижный «враг»: живёт в волне, после волны появляется снова, пока не разрушено */
function nestSpawn(){
  const g=G,F=g.feat;
  if(!F||F.t!=='nest'||F.done||F.ref&&!F.ref.dead)return;
  const e=spawnAt('nest',F.x,F.y,hpMul(g.wave)*1.4,dmgMul(g.wave),{});
  e.col=F.col;e.hx=F.x;e.hy=F.y;e.cd=3;F.ref=e;
}
function featTick(dt){
  const g=G,F=g.feat,p=g.p;
  if(!F)return;
  F.bob+=dt;
  const d=Math.hypot(p.x-F.x,p.y-F.y);
  if(F.t==='spring'){
    F.on=d<85;
    if(F.on&&p.hp>0){heal(g.S.maxHp*0.035*dt);p.mana=Math.min(g.S.maxMana,p.mana+g.S.maxMana*0.08*dt);if(Math.random()<dt*8)puff(p.x+rnd(-10,10),p.y+rnd(-6,6),'#bff0ff',1,40,0.6,2.5)}
  }else if(F.t==='shrine'||F.t==='cache'){
    const ready=F.t==='shrine'?g.wave>=F.cdW:!F.done;
    if(ready&&d<70){F.prog+=dt/1.3;if(F.prog>=1){F.prog=0;featUse(F)}}
    else F.prog=Math.max(0,F.prog-dt*2);
  }else if(F.t==='nest'){
    const e=F.ref;
    if(e&&e.dead&&!F.done){F.done=true;F.ref=null;
      const gold=Math.round(60+22*SW());for(let i=0;i<10;i++){const a=rnd(0,TAU),dd=rnd(20,90);addCoin(F.x+Math.cos(a)*dd,F.y+Math.sin(a)*dd,Math.ceil(gold/10))}
      for(let i=0;i<5;i++)addGem(F.x+rnd(-40,40),F.y+rnd(-40,40),'l');
      ring(F.x,F.y,180,F.col,0.6);addLight(F.x,F.y,320,F.col,1.2,0.6,true);g.shake=Math.max(g.shake,8);
      toast(F.n+' разрушено','Золото и опыт рядом с обломками')}
  }
}
function featUse(F){
  const g=G,p=g.p;
  if(F.t==='shrine'){
    g.bf.dm={t:40,v:Math.max(g.bf.dm.t>0?g.bf.dm.v:0,0.25)};g.bf.spd={t:40,v:Math.max(g.bf.spd.t>0?g.bf.spd.v:0,0.12)};tickBuffs(0);
    F.cdW=g.wave+3;ring(F.x,F.y,160,F.col,0.6);puff(p.x,p.y,F.col,24,200,0.7,3);addLight(F.x,F.y,300,F.col,1.1,0.8);
    toast(F.n,'Благословение: +25% урона и +12% скорости на 40 с. Снова — через 3 волны');sfx(660,0.4,'triangle',0.06,400);
  }else if(F.t==='cache'){
    F.done=true;
    const gold=Math.round(90+30*SW());p.gold+=gold;
    const ids=[];for(const k of ['smith','alch','mage'])for(const id of MERCH[k].pool){const d=ITEMS[id];if(!d.scroll&&!d.ch&&d.price<450&&!g.bag.some(b=>b&&b.id===id))ids.push(id)}
    const id=pickOf(ids);let got='';
    if(id&&addToBag(id)){recalc();got=' и «'+ITEMS[id].n+'»'}else if(id){p.gold+=Math.round(ITEMS[id].price*0.5);got=' (рюкзак полон — ещё золото)'}
    puff(F.x,F.y,'#ffd36b',26,240,0.7,3);addLight(F.x,F.y,260,'#ffd36b',1,0.7);
    toast(F.n,'+'+gold+' золота'+got);sfx(820,0.35,'triangle',0.05,300);
  }
}
/* рисование */
function drawFeature(g){
  const F=g.feat;if(!F||!vis(F.x,F.y,140))return featArrow(g);
  const x=F.x,y=F.y,t=F.bob,c=F.col;
  ctx.save();
  if(F.t==='spring'){
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x,y+6,92,48,0,0,TAU);ctx.fill();
    const gr=ctx.createRadialGradient(x-14,y-8,6,x,y,86);gr.addColorStop(0,'#e8fbff');gr.addColorStop(.35,rgba(c,.85));gr.addColorStop(1,'rgba(20,60,90,.85)');
    ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(x,y,84,44,0,0,TAU);ctx.fill();
    ctx.strokeStyle='rgba(60,70,80,.9)';ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(x,y,88,47,0,0,TAU);ctx.stroke();
    ctx.strokeStyle='rgba(160,170,180,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y-2,88,47,0,Math.PI*1.05,Math.PI*1.95);ctx.stroke();
    for(let i=0;i<3;i++){const k=(t*0.5+i/3)%1;ctx.strokeStyle='rgba(255,255,255,'+(0.5*(1-k)).toFixed(3)+')';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x,y,10+k*70,5+k*36,0,0,TAU);ctx.stroke()}
    ctx.globalCompositeOperation='lighter';glow(x,y,F.on?120:90,c,F.on?0.45:0.25);
  }else if(F.t==='shrine'){
    const ready=g.wave>=F.cdW;
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x+6,y+26,34,14,0,0,TAU);ctx.fill();
    ctx.fillStyle='#4a4e58';ctx.fillRect(x-30,y+10,60,16);ctx.fillStyle='#62666f';ctx.fillRect(x-30,y+10,60,4);
    const gr=ctx.createLinearGradient(x-16,0,x+16,0);gr.addColorStop(0,'#55596a');gr.addColorStop(.5,'#7d8294');gr.addColorStop(1,'#3e4150');
    ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(x-16,y+12);ctx.lineTo(x-12,y-46);ctx.lineTo(x,y-58);ctx.lineTo(x+12,y-46);ctx.lineTo(x+16,y+12);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(10,10,16,.8)';ctx.lineWidth=2;ctx.stroke();
    ctx.globalCompositeOperation='lighter';const pu=ready?0.6+0.4*Math.sin(t*3):0.15;
    ctx.strokeStyle=rgba(c,pu);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-40);ctx.lineTo(x-6,y-26);ctx.lineTo(x+5,y-18);ctx.lineTo(x-4,y-4);ctx.stroke();
    ctx.beginPath();ctx.arc(x,y-30,8,0,TAU);ctx.stroke();
    glow(x,y-30,ready?70:30,c,0.5*pu);
  }else if(F.t==='cache'){
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x+5,y+18,34,12,0,0,TAU);ctx.fill();
    if(!F.done){
      ctx.fillStyle='#6a4426';ctx.fillRect(x-28,y-8,56,26);ctx.fillStyle='#8a5a32';ctx.beginPath();ctx.moveTo(x-28,y-8);ctx.quadraticCurveTo(x,y-30,x+28,y-8);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#2a1808';ctx.lineWidth=2;ctx.strokeRect(x-28,y-8,56,26);
      ctx.fillStyle='#d9a63a';ctx.fillRect(x-28,y-2,56,4);ctx.fillRect(x-4,y-6,8,12);ctx.fillStyle='#2a1808';ctx.fillRect(x-1.5,y-1,3,4);
      ctx.globalCompositeOperation='lighter';glow(x,y-6,60,'#ffd36b',0.25+0.15*Math.sin(t*3));
    }else{ctx.fillStyle='#4a2e18';ctx.fillRect(x-28,y-4,56,22);ctx.strokeStyle='#2a1808';ctx.lineWidth=2;ctx.strokeRect(x-28,y-4,56,22)}
  }
  else if(F.t==='nest'&&F.done){ctx.fillStyle='rgba(20,14,10,.7)';ctx.beginPath();ctx.ellipse(x,y,46,30,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(60,46,36,.9)';for(let i=0;i<7;i++){const a=i*0.9;ctx.beginPath();ctx.arc(x+Math.cos(a)*30,y+Math.sin(a)*18,6+(i%3)*2,0,TAU);ctx.fill()}}
  ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  /* круг прогресса и подпись */
  if(F.prog>0){ctx.strokeStyle='#ffffff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y-4,58,-Math.PI/2,-Math.PI/2+TAU*F.prog);ctx.stroke()}
  if(F.t!=='nest'||F.done){ctx.fillStyle='#fff';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.globalAlpha=0.9;
    ctx.fillText(F.n+(F.t==='shrine'&&g.wave<F.cdW?' (остывает)':F.done&&F.t==='cache'?' (пусто)':''),x,y-(F.t==='shrine'?70:F.t==='spring'?58:38));ctx.globalAlpha=1;ctx.textAlign='left'}
}
function featArrow(g){
  const F=g.feat;if(!F||F.done&&F.t!=='spring'&&F.t!=='shrine'||g.phase!=='fight'&&F.t==='nest')return;
  const z=ZM*(1+(g.zk||0)),cx=VX+VW/2,cy=VY+VH/2,hw=W/z/2-30,hh=H/z/2-30,dx=F.x-cx,dy=F.y-cy,k=Math.min(hw/Math.abs(dx||1),hh/Math.abs(dy||1),1);
  const ax=cx+dx*k,ay=cy+dy*k,a=Math.atan2(dy,dx);
  ctx.save();ctx.translate(ax,ay);ctx.rotate(a);ctx.globalAlpha=0.55+0.25*Math.sin(anim*4);ctx.fillStyle=F.col;
  ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-8,-9);ctx.lineTo(-3,0);ctx.lineTo(-8,9);ctx.closePath();ctx.fill();ctx.restore();ctx.globalAlpha=1;
}
