const GUNS={
  pistol:{n:'Пистолет',d:'Точные одиночные выстрелы. Вблизи (до 100) урон ×2, каждое 5-е попадание рикошетит.',cd:.5,pel:1,sp:.04,spd:760,dm:1,pierce:0,life:.7,rng:440,sc:.7,mz:17},
  shotgun:{n:'Дробовик',d:'Настоящий разлёт дроби: в упор полный урон и сильный отброс, вдали дробь слабеет.',cd:1.15,pel:7,sp:.62,spd:640,dm:.5,pierce:0,life:.42,rng:240,sc:.55,mz:45,knock:150,pellet:true},
  rifle:{n:'Автомат',d:'Раскручивается: чем дольше бьёт одну цель, тем быстрее стреляет. На пике может перегреться.',cd:.17,pel:1,sp:.12,spd:820,dm:.42,pierce:0,life:.7,rng:470,sc:.5,mz:57,spin:true},
  smg:{n:'Пистолет-пулемёт',d:'Очереди по 6 почти мгновенных пуль: много урона по одной цели.',cd:1.25,pel:1,sp:.1,spd:1150,dm:.34,pierce:0,life:.42,rng:380,sc:.5,mz:66,burst:6,bi:.06},
  launcher:{n:'Гранатомёт',d:'Навесом метает гранату: взрыв бьёт по площади и отбрасывает. Можно поставить спецбоеприпасы.',cd:2.1,pel:0,sp:0,spd:0,dm:1,pierce:0,life:1,rng:420,sc:.5,mz:96,gren:true},
  sniper:{n:'Снайперка',d:'Пробивает всех на линии, каждый следующий враг получает +25% урона. По элитам и боссам 25% шанс крита ×3.',cd:1.9,pel:1,sp:0,spd:1250,dm:5.2,pierce:99,life:.9,rng:640,sc:.46,mz:86,big:true}
};
const GUN_IDS=Object.keys(GUNS);
/* ---- модификации стволов (одна на ствол) и общие модули ---- */
const GMOD={
  pistol:[{k:'double',n:'Двойной выстрел',d:'Пистолет стреляет двумя параллельными пулями.'},{k:'chain',n:'Цепной рикошет',d:'Рикошет каждое 3-е попадание, и пуля отскакивает дважды.'}],
  shotgun:[{k:'slug',n:'Жакан',d:'Одна тяжёлая пуля вместо дроби: пробивает 2 врагов, мощный отброс, не слабеет с дистанцией.'},{k:'buck',n:'Картечь',d:'11 дробин вместо 7, разлёт шире: косит толпу вблизи.'}],
  rifle:[{k:'cool',n:'Охлаждение',d:'Нагрев на 40% меньше, остывание вдвое быстрее.'},{k:'tracer',n:'Зажигательные трассеры',d:'Каждая 4-я пуля поджигает врага.'}],
  smg:[{k:'rubber',n:'Резиновые пули',d:'Каждое попадание замедляет цель ещё на 5% (до 40%).'},{k:'shock',n:'Шоковые пули',d:'Каждая 6-я пуля оглушает и бьёт током: по мокрым врагам электрошок.'}],
  launcher:[{k:'acid',n:'Кислотные гранаты',d:'Оставляют лужу кислоты: урон и ржавчина (−14 брони врагам).'},{k:'emp',n:'ЭМИ-гранаты',d:'Оглушают на 1.2 с и ломают щиты: 5 с броня врагов не работает. Щитоносцы и железные призраки получают доп. урон.'},{k:'inc',n:'Зажигательные гранаты',d:'Поджигают врагов и оставляют горящую землю на 4 с.'},{k:'cluster',n:'Кассетные гранаты',d:'После взрыва разлетаются ещё 3 малых заряда.'}],
  sniper:[{k:'ap',n:'Бронебойные',d:'Снайперка игнорирует броню врагов.'},{k:'expl',n:'Разрывные',d:'Первое попадание взрывается: 40% урона по площади.'}]
};
const GMODU={
  sil:{n:'Глушитель',d:'+12% шанса крита для всех стволов.'},
  scope:{n:'Лазерный прицел',d:'Стволы видят на 30% дальше, разброс меньше, пули летят на 20% быстрее и дальше.'},
  mag:{n:'Ускоренный затвор',d:'Все стволы стреляют на 12% чаще.'}
};
function allGuns(g){const a=g.guns.slice();if(g.hand)a.unshift(g.hand);return a}
function gunHit(b,e,o){
  const g=G,t=b.gt,m=b.gmod;let d=b.dmg,km=1;b.nh=(b.nh||0)+1;
  if(g.gmu&&g.gmu.sil)o.cc=0.12;
  if(t==='sniper'){
    d*=1+0.25*(b.nh-1);
    if(m==='ap')o.dt='pure';
    if((e.elite||e.boss)&&Math.random()<0.25){d*=3;o.fcrit=true;sparks(e.x,e.y,'#ffd36b',10,300);ring(e.x,e.y,30,'#ffd36b',0.3)}
    if(m==='expl'&&b.nh===1)explodeAt(e.x,e.y,62,d*0.4,{dt:'phys',col:'#ffb347',src:'auto',shake:3});
  }else if(t==='shotgun'){
    if(m!=='slug'){const f=clamp(b.life/(b.l0||1),0,1);d*=0.35+0.65*f;km=0.3+1.2*f}
  }else if(t==='pistol'){
    if(Math.hypot(e.x-g.p.x,e.y-g.p.y)<100+e.r){d*=2;if(g.pt.length<430)puff(e.x,e.y,'#ffd36b',3,120,0.25,2)}
    g.pisN=(g.pisN||0)+1;
    if(g.pisN%(m==='chain'?3:5)===0)b.bounce=(b.bounce||0)+(m==='chain'?2:1);
  }else if(t==='smg'&&m==='rubber'){
    e.rbs=e.slow>0?Math.min(8,(e.rbs||0)+1):1;const f=1-0.05*e.rbs*(e.boss?0.5:1);
    e.slowF=e.slow>0?Math.min(e.slowF,f):f;e.slow=Math.max(e.slow,1.5);
  }
  return [d,km];
}
function gExplode(q){G.curSk='__gun';try{gExplode0(q)}finally{G.curSk=null}}
function gExplode0(q){
  const g=G,md=q.md||'',R=66+8*q.l,D=(18+9*q.l)*(q.dm||1),x=q.x1,y=q.y1;
  if(md==='cluster'){
    explodeAt(x,y,R*0.8,D*0.8,{dt:'phys',col:'#ffb347',knock:200,src:'auto',shake:4});
    for(let j=0;j<3;j++){const a=rnd(0,TAU),dd=rnd(45,85),cx=x+Math.cos(a)*dd,cy=y+Math.sin(a)*dd;
      g.later.push({t:0.16+j*0.12,fn:()=>explodeAt(cx,cy,R*0.55,D*0.65,{dt:'phys',col:'#ffd36b',knock:120,src:'auto',shake:2})})}
    return;
  }
  const o={dt:'phys',col:'#ffb347',knock:230,src:'auto',shake:4};
  if(md==='emp'){o.dt='magic';o.col='#7fe6ff';o.st={stun:1.2};o.knock=60}
  else if(md==='acid'){o.col='#9be04a'}
  else if(md==='inc'){o.col='#ff7a3a';o.st={burn:[4+2*q.l,3]}}
  if(md==='emp'){for(const e of g.en){if(e.dead||e.sub)continue;if((e.x-x)**2+(e.y-y)**2<(R+e.r)**2){e.empU=g.t+5;if(e.type==='shield'||e.type==='ironwraith')hitEnemy(e,D*1.5,{dt:'pure',src:'auto',col:'#7fe6ff',aoe:true})}}
    for(let j=0;j<5;j++){const a=rnd(0,TAU);sparks(x+Math.cos(a)*R*0.6,y+Math.sin(a)*R*0.6,'#bff4ff',3,180)}}
  explodeAt(x,y,R,D,o);
  if(md==='acid')addZone(x,y,{r:R*0.85,life:4,dps:5+2.5*q.l,dt:'magic',col:'#9be04a',st:{rust:1.5,slow:[0.82,0.5]}});
  if(md==='inc')addZone(x,y,{vis:'wildfire',r:R*0.8,life:4,dps:6+3*q.l,dt:'magic',col:'#ff7a3a',st:{burn:[3+q.l,2]}});
}
function gunPos(g,i){
  const n=g.guns.length,a=g.t*0.9+i*TAU/Math.max(1,n);
  return {x:g.p.x+Math.cos(a)*34,y:g.p.y-4+Math.sin(a)*24};
}
function drawGren(g){
  for(const q of g.gren){
    const k=clamp(q.t/q.life,0,1),x=q.x0+(q.x1-q.x0)*k,y=q.y0+(q.y1-q.y0)*k,h=Math.sin(k*Math.PI)*70;
    ctx.save();ctx.globalAlpha=.35;ctx.strokeStyle=({acid:'#9be04a',emp:'#7fe6ff',inc:'#ff7a3a',cluster:'#ffd36b'})[q.md]||'#ffb347';ctx.lineWidth=1.2;ctx.setLineDash([3,4]);ctx.beginPath();ctx.arc(q.x1,q.y1,66+8*q.l,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.restore();
    SP.shadow(ctx,x,y+4,9,.4);
    ctx.save();ctx.translate(x,y-h);ctx.rotate(k*9);ctx.scale(1.1,1.1);SP.grenade(ctx,0);ctx.restore();
  }
}
function drawGuns(g){
  drawGren(g);
  if(!g.guns.length)return;
  for(let i=0;i<g.guns.length;i++){
    const gn=g.guns[i],G0=GUNS[gn.t],ps=gunPos(g,i);
    SP.shadow(ctx,ps.x,ps.y+18,12,.45);
    ctx.save();ctx.translate(ps.x,ps.y);
    const aim=gn.aim||0;ctx.rotate(aim);
    if(Math.cos(aim)<0)ctx.scale(1,-1);
    ctx.translate(-(gn.rec||0),0);ctx.scale(G0.sc,G0.sc);
    SP[gn.t](ctx,gn.fl||0);
    ctx.restore();
    if(gn.t==='rifle'&&(gn.heat>0.05||gn.oh>0)){ctx.save();ctx.fillStyle='rgba(6,8,14,.6)';ctx.fillRect(ps.x-10,ps.y-13,20,2.4);ctx.fillStyle=gn.oh>0?'#ff6b5a':'#ffb347';ctx.fillRect(ps.x-10,ps.y-13,20*(gn.oh>0?gn.oh/1.3:gn.heat),2.4);ctx.restore()}
  }
}
function drawMeteorSpr(b,pr){
  const k=1-pr,mx=b.x+k*90,my=b.y-k*320,s=Math.max(.7,b.r/60);
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=0;i<14;i++){const q=i/14;SP.puffs(ctx,mx+q*60*s,my-q*45*s*1.2,18*s*(1-q*.7),q<.4?'255,160,40':'200,50,10',.6*(1-q))}
  ctx.restore();
  SP.rockBit(ctx,mx,my,15*s,anim*5,3,'#3a2a22');SP.glow(ctx,mx,my,26*s,'#ff7a28',.85);
}
function drawZones(g){
  for(const z of g.zn){
    if(!vis(z.x,z.y,z.r+20))continue;
    if(z.wid)continue;
    if(zoneSpr(z))continue;
    const fade=Math.min(1,z.life/0.5);
    const hot=z.kind==='lava'||z.kind==='wildfire';
    ctx.globalAlpha=fade;
    ctx.fillStyle=rgba(z.col,hot?0.22:0.13);
    ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,TAU);ctx.fill();
    ctx.strokeStyle=rgba(z.col,0.55);ctx.lineWidth=2;
    ctx.setLineDash([8,8]);ctx.lineDashOffset=-anim*14;
    ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,TAU);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=rgba(z.col,0.28);
    const nd=5+Math.floor(z.r/40);
    for(let i=0;i<nd;i++){
      const a=i*1.9+anim*0.4,rr=z.r*(0.25+0.65*((i*0.37+anim*0.1)%1));
      ctx.beginPath();ctx.arc(z.x+Math.cos(a)*rr,z.y+Math.sin(a)*rr,2.5+(i%3),0,TAU);ctx.fill();
    }
    if(z.kind==='spring'||z.kind==='vines'||z.kind==='livebog'||z.kind==='forest'){
      for(let i=0;i<2;i++){const k=((anim*0.6+i/2)%1);ctx.strokeStyle=rgba(z.col,0.4*(1-k));ctx.beginPath();ctx.arc(z.x,z.y,z.r*k,0,TAU);ctx.stroke()}
    }
    if(hot){ctx.fillStyle=rgba('#ffd36b',0.12+0.08*Math.sin(anim*9));ctx.beginPath();ctx.arc(z.x,z.y,z.r*0.55,0,TAU);ctx.fill()}
    if(z.heal){
      ctx.strokeStyle='rgba(180,255,210,.55)';ctx.lineWidth=2.4;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(z.x-6,z.y);ctx.lineTo(z.x+6,z.y);ctx.moveTo(z.x,z.y-6);ctx.lineTo(z.x,z.y+6);ctx.stroke();ctx.lineCap='butt';
    }
    ctx.globalAlpha=1;
  }
}
function drawBlasts(g){
  for(const b of g.bl){
    if(!vis(b.x,b.y,b.r+100))continue;
    const pr=clamp(1-b.t/b.max,0,1);
    drawRainMark(b,pr);
    if(b.vis==='meteor')drawMeteorSpr(b,pr);
    else if(b.vis==='drop')drawRainDrop(b,pr,'#e6f5ff');
    else if(b.vis==='shell')drawRainDrop(b,pr,'#fff0d0');
  }
}
function drawTelegraphs(g){
  for(const t of g.tgs){
    if(!vis(t.x,t.y,Math.max(t.r||0,800)))continue;
    const pr=clamp(1-t.t/t.max,0,1);
    if(t.shape==='circle'){
      const tc=t.env?gcol(t.col):'#ff4d5e';
      ctx.fillStyle=rgba(tc,0.1+0.22*pr);ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,TAU);ctx.fill();
      ctx.strokeStyle=rgba(tc,0.55+0.4*pr);ctx.lineWidth=2;ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,TAU);ctx.stroke();
      ctx.fillStyle=rgba(tc,0.25);ctx.beginPath();ctx.arc(t.x,t.y,t.r*pr,0,TAU);ctx.fill();
      if(t.fx==='meteor'&&t.t<0.7){
        const kk=t.t/0.7,mx=t.x+kk*130,my=t.y-kk*460;
        ctx.globalCompositeOperation='lighter';
        ctx.strokeStyle='rgba(255,150,70,.7)';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx+70,my-210);ctx.stroke();ctx.lineCap='butt';
        glow(mx,my,60,'#ff7a3a',0.9);glow(mx,my,26,'#ffe9a8',1);
        ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
        ctx.fillStyle='#ffb347';ctx.beginPath();ctx.arc(mx,my,11,0,TAU);ctx.fill();
      }else if(t.fx==='bolt'){
        ctx.globalCompositeOperation='lighter';
        glow(t.x,t.y,t.r*1.4,'#f4f08a',0.18+0.4*pr*(0.6+0.4*Math.sin(anim*38)));
        ctx.strokeStyle='rgba(244,240,138,.8)';ctx.lineWidth=1.5;
        for(let i=0;i<3;i++){const a=anim*5+i*2.1,rr=t.r*(0.3+0.5*hv(i+Math.floor(anim*9)));ctx.beginPath();ctx.moveTo(t.x+Math.cos(a)*rr*0.4,t.y+Math.sin(a)*rr*0.4);ctx.lineTo(t.x+Math.cos(a+0.4)*rr,t.y+Math.sin(a+0.4)*rr);ctx.stroke()}
        ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
      }
    }else{
      const dx=t.x2-t.x,dy=t.y2-t.y,l=Math.hypot(dx,dy)||1,nx=-dy/l*t.w/2,ny=dx/l*t.w/2;
      ctx.fillStyle=rgba('#ff4d5e',0.08+0.2*pr);
      ctx.beginPath();ctx.moveTo(t.x+nx,t.y+ny);ctx.lineTo(t.x2+nx,t.y2+ny);ctx.lineTo(t.x2-nx,t.y2-ny);ctx.lineTo(t.x-nx,t.y-ny);ctx.closePath();ctx.fill();
      ctx.strokeStyle=rgba('#ff4d5e',0.5+0.4*pr);ctx.lineWidth=2;ctx.stroke();
    }
  }
}
function drawGems(g){
  ctx.globalCompositeOperation='lighter';
  for(const m of g.gem){
    if(!vis(m.x,m.y,20))continue;
    const c=CR[m.k]||CR.s,s=c.size;
    ctx.globalAlpha=0.6+0.15*Math.sin(anim*4+m.x*0.1);ctx.drawImage(glowSpr(c.col),m.x-s*3.4,m.y-s*3.4,s*6.8,s*6.8);
    ctx.fillStyle=c.col;
    ctx.globalAlpha=0.95;
    if(m.k==='coin'){ctx.beginPath();ctx.arc(m.x,m.y,s*0.9,0,TAU);ctx.fill()}
    else{ctx.beginPath();ctx.moveTo(m.x,m.y-s);ctx.lineTo(m.x+s*0.7,m.y);ctx.lineTo(m.x,m.y+s);ctx.lineTo(m.x-s*0.7,m.y);ctx.closePath();ctx.fill()}
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function drawPickups(g){
  for(const q of g.pk){
    if(!vis(q.x,q.y,30))continue;
    if(q.life<5&&Math.floor(anim*8)%2===0)continue;
    const c=PK[q.type].c,bob=Math.sin(anim*4+q.x)*2;
    ctx.save();ctx.translate(q.x,q.y+bob);
    ctx.globalCompositeOperation='lighter';
    ctx.fillStyle=c;ctx.globalAlpha=0.22;ctx.beginPath();ctx.arc(0,0,17+2*Math.sin(anim*5),0,TAU);ctx.fill();
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='#10131c';ctx.beginPath();ctx.arc(0,0,11,0,TAU);ctx.fill();
    ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=2.4;ctx.lineCap='round';
    if(q.type==='heal'){ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(5,0);ctx.moveTo(0,-5);ctx.lineTo(0,5);ctx.stroke()}
    else if(q.type==='magnet'){ctx.beginPath();ctx.arc(0,-1,5,Math.PI,0);ctx.lineTo(5,5);ctx.moveTo(-5,-1);ctx.lineTo(-5,5);ctx.stroke()}
    else if(q.type==='shield'){ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(5.5,-3);ctx.lineTo(4,3);ctx.lineTo(0,6.5);ctx.lineTo(-4,3);ctx.lineTo(-5.5,-3);ctx.closePath();ctx.stroke()}
    else{ctx.beginPath();ctx.arc(0,1,4.5,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(2,-3);ctx.lineTo(5,-6);ctx.stroke()}
    ctx.lineCap='butt';ctx.restore();
  }
}
/*MERCH-SPRITES*/
/* Торговцы: вид сверху в три четверти, как у героев. Прилавок, товары, живая анимация. Центр (0,0) = точка под ногами. */
