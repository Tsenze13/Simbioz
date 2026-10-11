
/* =====================================================================
   ФОРМЫ СТИХИИ — линия глубины мастера (как стволы у Солдата).
   До BAL.hero.maxForms форм; у каждой одна модификация из двух. Сила растёт с уровнем своей стихии.
   fire(f,l,t,m): f — состояние формы, l — уровень стихии, t — цель (или null), m — ключ модификации.
   ===================================================================== */
const FLINE={fire:'Очаги',water:'Течения',earth:'Глыбы',air:'Ветра',wood:'Поросль'};
function fctx(t,col){const p=G.p;return {px:p.x,py:p.y,x:t?t.x:p.x,y:t?t.y:p.y,ang:t?Math.atan2(t.y-p.y,t.x-p.x):p.face,col:col,col2:col}}
const FORMS={
  /* ---------- ОГОНЬ: Очаги ---------- */
  fspear:{el:'fire',n:'Огненное копьё',d:'Пробивает всех на линии и поджигает.',cd:2.2,rng:520,
    mods:[{k:'hot',n:'Раскалённое копьё',d:'Поджог втрое сильнее.'},{k:'twin',n:'Двойное копьё',d:'Два копья веером.'}],
    fire(f,l,t,m){const p=G.p,c=fctx(t),n=m==='twin'?2:1;for(let i=0;i<n;i++){const a=c.ang+(n>1?(i-.5)*0.18:0);
      shoot({vis:'fire',x:p.x,y:p.y,vx:Math.cos(a)*720,vy:Math.sin(a)*720,r:7,hr:16,dmg:14+7*l,dt:'magic',life:0.8,pierce:99,st:{burn:[(3+1.5*l)*(m==='hot'?3:1),3]},col:'#ff8a3a',src:'proj'})}}},
  fmeteor:{el:'fire',n:'Метеорчик',d:'Навесом падает на врага и оставляет горящую землю.',cd:3.2,rng:460,
    mods:[{k:'wide',n:'Широкое пламя',d:'Горящая земля вдвое больше.'},{k:'tri',n:'Три метеорчика',d:'Три малых метеора вместо одного.'}],
    fire(f,l,t,m){const c=fctx(t,'#ff6a2b'),z={r:m==='wide'?90:60,life:3,dps:5+2*l,dt:'magic',col:'#ff7a3a',st:{burn:[2+l,2]},vis:'wildfire'};
      if(m==='tri'){for(let i=0;i<3;i++){const a=rnd(0,TAU),d=rnd(20,70);CAST.blast({r:46,dmg:(20+9*l)*0.55,dt:'magic',delay:0.6+i*0.12,range:520,vis:'meteor',col:'#ff6a2b',st:{burn:[3+l,3]},zone:Object.assign({},z,{r:40})},Object.assign({},c,{x:c.x+Math.cos(a)*d,y:c.y+Math.sin(a)*d}))}}
      else CAST.blast({r:70,dmg:20+9*l,dt:'magic',delay:0.7,range:520,vis:'meteor',col:'#ff6a2b',st:{burn:[4+l,3]},zone:z},c)}},
  fring:{el:'fire',n:'Кольцо пламени',d:'Огненное кольцо вокруг героя жжёт всех рядом.',cd:0.5,rng:0,aura:true,
    mods:[{k:'wide',n:'Широкое кольцо',d:'Радиус кольца +40%.'},{k:'pulse',n:'Пульс',d:'Каждые 3 с кольцо взрывается.'}],
    rad(l,m){return (95+6*l)*(m==='wide'?1.4:1)*(1+G.S.area*0.5)},
    fire(f,l,t,m){const g=G,p=g.p,R=this.rad(l,m);
      for(const e of g.en){if(e.dead||e.sub)continue;if((e.x-p.x)**2+(e.y-p.y)**2<(R+e.r)**2)hitEnemy(e,3+1.6*l,{dt:'magic',src:'zone',quiet:true,st:{burn:[2+l,1.2]}})}
      if(m==='pulse'){f.pt=(f.pt||0)+0.5;if(f.pt>=3){f.pt=0;explodeAt(p.x,p.y,R+40,20+8*l,{dt:'magic',col:'#ff7a3a',knock:200,src:'proj',shake:3})}}}},
  fphoenix:{el:'fire',n:'Фениксы',d:'Огненные птицы сами находят врагов.',cd:2.6,rng:480,
    mods:[{k:'boom',n:'Взрывные фениксы',d:'Птицы взрываются при попадании.'},{k:'flock',n:'Стая',d:'+2 птицы.'}],
    fire(f,l,t,m){const p=G.p,n=m==='flock'?4:2;for(let i=0;i<n;i++){const a=rnd(0,TAU);
      shoot({vis:'fire',homing:true,x:p.x,y:p.y,vx:Math.cos(a)*260,vy:Math.sin(a)*260,r:7,dmg:12+5*l,dt:'magic',life:2.6,blast:m==='boom'?55:0,st:{burn:[3+l,3]},col:'#ffb347',src:'proj'})}}},
  fsparks:{el:'fire',n:'Искры',d:'Веер искр вблизи.',cd:1.1,rng:230,
    mods:[{k:'wide',n:'Сноп искр',d:'8 искр и шире веер.'},{k:'bounce',n:'Прыгучие искры',d:'Искры отскакивают к соседям.'}],
    fire(f,l,t,m){const p=G.p,c=fctx(t),n=m==='wide'?8:5,sp=m==='wide'?1.4:0.9;for(let i=0;i<n;i++){const a=c.ang+(i/(n-1)-0.5)*sp;
      shoot({vis:'fire',x:p.x,y:p.y,vx:Math.cos(a)*520,vy:Math.sin(a)*520,r:4,dmg:6+3*l,dt:'magic',life:0.4,bounce:m==='bounce'?1:0,st:{burn:[1.5+0.6*l,2]},col:'#ffd36b',src:'proj'})}}},
  /* ---------- ВОДА: Течения ---------- */
  wwhip:{el:'water',n:'Водяная плеть',d:'Хлещет дугой вблизи: мочит и отбрасывает.',cd:1.6,rng:200,
    mods:[{k:'long',n:'Длинная плеть',d:'Дальность +40%.'},{k:'pull',n:'Затягивающая плеть',d:'Тянет врагов к вам вместо отброса.'}],
    fire(f,l,t,m){CAST.cone({range:m==='long'?225:160,arc:1.5,dmg:12+6*l,dt:'magic',st:{wet:2,slow:[0.7,1]},knock:m==='pull'?-240:180,col:'#3aa7ff',vis:'arc'},fctx(t,'#3aa7ff'))}},
  wbubble:{el:'water',n:'Пузыри',d:'Медленные пузыри оглушают тех, кого поймают.',cd:2.4,rng:380,
    mods:[{k:'long',n:'Крепкие пузыри',d:'Оглушение вдвое дольше.'},{k:'chain',n:'Пузырьковая цепь',d:'Лопаясь, пузырь разлетается на 4 малых.'}],
    fire(f,l,t,m){const p=G.p,c=fctx(t);
      shoot({vis:'bubble',x:p.x,y:p.y,vx:Math.cos(c.ang)*150,vy:Math.sin(c.ang)*150,r:10,dmg:8+4*l,dt:'magic',life:2.8,blast:m==='chain'?40:0,burst:m==='chain'?{n:4,spd:260,dmg:5+2.5*l,vis:'bubble',life:0.5}:null,st:{stun:m==='long'?1.4:0.7,wet:2},col:'#9fe0ff',src:'proj'})}},
  wice:{el:'water',n:'Ледяные иглы',d:'Быстрые иглы морозят врагов.',cd:1.3,rng:460,
    mods:[{k:'pierce',n:'Пронзающие иглы',d:'Иглы пробивают 3 врагов.'},{k:'fan',n:'Веер игл',d:'5 игл вместо 3.'}],
    fire(f,l,t,m){const p=G.p,c=fctx(t),n=m==='fan'?5:3,sp=m==='fan'?0.6:0.25;for(let i=0;i<n;i++){const a=c.ang+(i/(n-1)-0.5)*sp;
      shoot({vis:'ice',x:p.x,y:p.y,vx:Math.cos(a)*700,vy:Math.sin(a)*700,r:5,dmg:7+3.5*l,dt:'magic',life:0.7,pierce:m==='pierce'?3:0,icy:true,st:{frz:0.35,slow:[0.6,1.2]},col:'#bdf0ff',src:'proj'})}}},
  wgeyser:{el:'water',n:'Гейзер',d:'Под врагом бьёт столб воды.',cd:3,rng:420,
    mods:[{k:'lift',n:'Подброс',d:'Гейзер оглушает на 0,7 с.'},{k:'heal',n:'Целебный гейзер',d:'Каждый гейзер лечит вас на 2%.'}],
    fire(f,l,t,m){CAST.blast({r:62,dmg:22+9*l,dt:'magic',delay:0.5,range:460,vis:'drop',col:'#9fe0ff',knock:240,st:{wet:2,stun:m==='lift'?0.7:0}},fctx(t,'#9fe0ff'));if(m==='heal')heal(G.S.maxHp*0.02)}},
  wrain:{el:'water',n:'Ливень',d:'Зона дождя мочит, замедляет и ранит.',cd:6,rng:420,
    mods:[{k:'soak',n:'Проливной',d:'Замедление вдвое сильнее.'},{k:'follow',n:'Туча',d:'Дождь ходит за вами.'}],
    fire(f,l,t,m){const z={r:110,life:4.5,dps:6+3*l,dt:'magic',col:'#6fb8ff',st:{wet:2,slow:[m==='soak'?0.4:0.7,1]},vis:'zone'};
      if(m==='follow')addZone(G.p.x,G.p.y,z,true);else{const c=fctx(t);addZone(c.x,c.y,z,false)}}},
  /* ---------- ЗЕМЛЯ: Глыбы ---------- */
  eboulder:{el:'earth',n:'Валун',d:'Тяжёлый камень катится сквозь врагов и сбивает их.',cd:2.4,rng:440,
    mods:[{k:'big',n:'Глыба',d:'Валун больше и бьёт на 40% сильнее.'},{k:'split',n:'Раскол',d:'На первом враге раскалывается на 3 камня.'}],
    fire(f,l,t,m){const p=G.p,c=fctx(t),big=m==='big';
      shoot({vis:'rock',x:p.x,y:p.y,vx:Math.cos(c.ang)*280,vy:Math.sin(c.ang)*280,r:13*(big?1.5:1),dmg:(16+8*l)*(big?1.4:1),dt:'phys',life:1.7,pierce:99,knock:260,blast:m==='split'?50:0,burst:m==='split'?{n:3,spd:320,dmg:8+4*l,vis:'rock',life:0.6}:null,col:'#c9974f',src:'proj'})}},
  espike:{el:'earth',n:'Шипы из земли',d:'Из-под врага вырываются каменные шипы.',cd:2,rng:420,
    mods:[{k:'chain',n:'Гряда шипов',d:'Три шипа по линии.'},{k:'stun',n:'Оглушающие шипы',d:'Шипы оглушают на 0,6 с.'}],
    fire(f,l,t,m){const g=G,c=fctx(t),st=m==='stun'?{stun:0.6}:null,pts=[];
      if(m==='chain'){const d=Math.hypot(c.x-c.px,c.y-c.py);for(const k of [-60,0,60]){const dd=Math.max(30,d+k);pts.push({x:c.px+Math.cos(c.ang)*dd,y:c.py+Math.sin(c.ang)*dd})}}else pts.push({x:c.x,y:c.y});
      pts.forEach((q,i)=>{ring(q.x,q.y,58,'#c9974f',0.4);g.later.push({t:0.35+i*0.1,fn:()=>{g.curSk='form:espike';explodeAt(q.x,q.y,58,18+8*l,{dt:'phys',col:'#c9974f',spike:true,knock:150,st:st,src:'proj',sk:'form:espike'});g.curSk=null}})})}},
  eshield:{el:'earth',n:'Каменный щит',d:'Камни кружат вокруг вас, ловят вражеские снаряды и бьют врагов.',cd:0,rng:0,aura:true,
    mods:[{k:'twin',n:'Два щита',d:'Кружат два камня.'},{k:'reflect',n:'Отражение',d:'Пойманный снаряд летит обратно во врага.'}],
    pos(g,f){const n=f.m==='twin'?2:1,out=[];for(let i=0;i<n;i++){const a=g.t*2.4+i*Math.PI;out.push({x:g.p.x+Math.cos(a)*52,y:g.p.y+Math.sin(a)*52})}return out},
    fire(f,l,t,m){const g=G;for(const s of this.pos(g,f)){
      for(const b of g.eps){if(b.dead)continue;if((b.x-s.x)**2+(b.y-s.y)**2<20*20){b.dead=true;sparks(s.x,s.y,'#e8c38a',5,180);
        if(m==='reflect'){const e=nearest(s.x,s.y,500);if(e){const a=Math.atan2(e.y-s.y,e.x-s.x);shoot({vis:'rock',x:s.x,y:s.y,vx:Math.cos(a)*520,vy:Math.sin(a)*520,r:6,dmg:10+5*l,dt:'phys',life:1,col:'#e8c38a',src:'proj',sk:'form:eshield'})}}}}
      for(const e of g.en){if(e.dead||e.sub)continue;if((e.x-s.x)**2+(e.y-s.y)**2<(14+e.r)**2&&g.t>(e.shT||0)){e.shT=g.t+0.4;hitEnemy(e,6+3*l,{dt:'phys',src:'proj',col:'#c9974f'});if(!e.dead)knockE(e,e.x-g.p.x,e.y-g.p.y,160)}}}}},
  edust:{el:'earth',n:'Пыльный вихрь',d:'Пыль вокруг вас замедляет врагов.',cd:0.4,rng:0,aura:true,
    mods:[{k:'wide',n:'Пыльная буря',d:'Радиус +40%.'},{k:'blind',n:'Ослепление',d:'Враги в пыли бьют на 30% слабее.'}],
    rad(l,m){return (105+5*l)*(m==='wide'?1.4:1)*(1+G.S.area*0.5)},
    fire(f,l,t,m){const g=G,p=g.p,R=this.rad(l,m);
      for(const e of g.en){if(e.dead||e.sub)continue;if((e.x-p.x)**2+(e.y-p.y)**2<(R+e.r)**2){applySt(e,{slow:[0.6,0.6]},1);hitEnemy(e,1.5+0.8*l,{dt:'phys',src:'zone',quiet:true});if(m==='blind')e.blindU=g.t+0.6}}}},
  ehail:{el:'earth',n:'Каменный град',d:'С неба падают камни на врагов рядом.',cd:3.4,rng:480,
    mods:[{k:'more',n:'Ливень камней',d:'7 камней вместо 4.'},{k:'big',n:'Тяжёлый град',d:'Камни крупнее и сильнее.'}],
    fire(f,l,t,m){const g=G,p=g.p,near=nearList(p.x,p.y,480),n=m==='more'?7:4,big=m==='big';
      for(let i=0;i<n;i++){const e=near.length?pickOf(near):null;const x=e?e.x:p.x+rnd(-200,200),y=e?e.y:p.y+rnd(-200,200);
        CAST.blast({r:42*(big?1.4:1),dmg:(14+6*l)*(big?1.3:1),dt:'phys',delay:0.55+i*0.08,range:2000,vis:'shell',col:'#c9974f',knock:120},{px:p.x,py:p.y,x:x,y:y,ang:0,col:'#c9974f'})}}}
};
const FORM_IDS=Object.keys(FORMS);

/* каждый кадр из weapons(): перезарядка и выстрел форм */
function formsTick(dt,cdm){
  const g=G;if(!g.forms||!g.forms.length)return;
  const l=g.el[g.start]||1;
  for(const f of g.forms){
    const F=FORMS[f.t];if(!F)continue;
    if(F.cd===0){g.curSk='form:'+f.t;F.fire(f,l,null,f.m);g.curSk=null;continue}
    f.cd=(f.cd||0)-dt*cdm;if(f.cd>0)continue;
    const t=F.aura?null:nearest(g.p.x,g.p.y,F.rng);
    if(!F.aura&&!t){f.cd=0.15;continue}
    const L0=lens();g.curSk='form:'+f.t;
    F.fire(f,l,t,f.m);
    tagNew(L0,'form:'+f.t);g.curSk=null;
    f.cd=F.cd*(1-0.03*(l-1));
  }
}
function drawForms(g){
  if(!g.forms||!g.forms.length)return;
  const l=g.el[g.start]||1,p=g.p;
  for(const f of g.forms){
    const F=FORMS[f.t];
    if(f.t==='fring'||f.t==='edust'){
      const R=F.rad(l,f.m),fire=f.t==='fring';
      ctx.save();ctx.globalCompositeOperation='lighter';
      ctx.strokeStyle=fire?'rgba(255,122,58,'+(0.28+0.1*Math.sin(anim*7))+')':'rgba(201,151,79,0.22)';ctx.lineWidth=fire?3:2;
      ctx.setLineDash(fire?[10,6]:[4,10]);ctx.lineDashOffset=-anim*(fire?40:20);ctx.beginPath();ctx.arc(p.x,p.y,R,0,TAU);ctx.stroke();ctx.setLineDash([]);
      if(Math.random()<0.5&&g.pt.length<450){const a=rnd(0,TAU);g.pt.push({x:p.x+Math.cos(a)*R,y:p.y+Math.sin(a)*R,vx:rnd(-20,20),vy:fire?rnd(-60,-20):rnd(-20,20),life:0.5,max:0.5,col:fire?'#ff9a3c':'#a4825a',size:fire?2.4:3})}
      ctx.restore();
    }else if(f.t==='eshield'){
      for(const s of F.pos(g,f)){ctx.save();ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(s.x+2,s.y+8,10,5,0,0,TAU);ctx.fill();
        ctx.fillStyle='#8a7a62';ctx.strokeStyle='#3a2e22';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<7;i++){const a=i*TAU/7+anim,r=11+(i%2)*2;i?ctx.lineTo(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r):ctx.moveTo(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='rgba(232,195,138,.5)';ctx.beginPath();ctx.arc(s.x-3,s.y-3,3,0,TAU);ctx.fill();ctx.restore()}
    }
  }
}
