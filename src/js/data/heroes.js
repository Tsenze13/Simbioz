/* =====================================================================
   ДАННЫЕ
   ===================================================================== */
const DT={
  phys:{n:'Физический',c:'#ff8f7a',d:'Снижается бронёй'},
  magic:{n:'Магический',c:'#74b9ff',d:'Снижается сопротивлением магии'},
  pure:{n:'Чистый',c:'#ffd36b',d:'Не снижается ничем'}
};
const EK=['fire','water','earth','air','metal','wood'];
const EL={
  fire:{n:'Огонь',c:'#ff6a2b',c2:'#ffb347',d:'Жар и взрывы. Поджигает врагов.'},
  water:{n:'Вода',c:'#3aa7ff',c2:'#9fe0ff',d:'Замедляет, мочит, лечит.'},
  earth:{n:'Земля',c:'#c9974f',c2:'#e8c98f',d:'Камень и шипы. Оглушает и бьёт тяжело.'},
  air:{n:'Воздух',c:'#8febd0',c2:'#e6fff7',d:'Скорость, молнии и пробивающие лезвия.'},
  metal:{n:'Металл',c:'#b4c0d4',c2:'#eef3fb',d:'Огнестрел, турели и стальные структуры.'},
  wood:{n:'Дерево',c:'#62c15a',c2:'#b6ee8a',d:'Лозы, корни, яд и жизнь.'}
};
const EW={
  fire:{w:'Огненные шары',d:'Взрываются и поджигают',dt:'magic'},
  water:{w:'Приливные волны',d:'Пробивают, мочат и замедляют',dt:'magic'},
  earth:{w:'Каменные спутники',d:'Кружат вокруг и отбрасывают',dt:'phys'},
  air:{w:'Лезвия ветра',d:'Пробивают цели, бег быстрее',dt:'phys'},
  metal:{w:'Стальные пули',d:'Быстрый огонь по ближайшим',dt:'phys'},
  wood:{w:'Семена-шипы',d:'Самонаведение, яд и замедление',dt:'magic'}
};
const EUP={
  fire:['Урон и взрыв больше','+1 огненный шар','Урон и ожог сильнее','+1 шар, взрыв шире'],
  water:['Волна шире и сильнее','+1 волна','Шире и быстрее','+1 волна, сильнее'],
  earth:['+1 камень','Камни сильнее','+1 камень','+1 камень, орбита шире'],
  air:['+1 лезвие','Быстрее, пробивают больше','+1 лезвие','+1 лезвие, бег быстрее'],
  metal:['+1 ствол','Быстрее и мощнее','+1 ствол','Ещё быстрее'],
  wood:['+1 семя','Яд сильнее','+1 семя','+1 семя, быстрее']
};
const ELSK={fire:'fireball',water:'spring',earth:'quake',air:'bolt',metal:'volley',wood:'whip'};
/* классы по стартовой стихии: плюсы, минусы и особенность */
/* рост характеристик героя за уровень и его главный атрибут (как в Dota 2) */
const GROW={
  fire:{main:'dmg',st:{dm:0.022,cdr:0.003},t:'Пиромант с каждым уровнем бьёт сильнее'},
  water:{main:'as',st:{cdr:0.008,mreg:0.12,mres:0.004},t:'Мистик с каждым уровнем быстрее колдует и восстанавливает ману'},
  earth:{main:'def',st:{armor:0.6,hp:6},t:'Каменный страж с каждым уровнем всё прочнее'},
  air:{main:'spd',st:{spd:0.009,crit:0.003},t:'Налётчик с каждым уровнем быстрее и точнее'},
  metal:{main:'as',st:{cdr:0.007,dm:0.008,armor:0.2},t:'Солдат с каждым уровнем стреляет быстрее'},
  wood:{main:'def',st:{regen:0.09,hp:3,ls:0.002,armor:0.35},t:'Друид с каждым уровнем живучее'}
};
const HST=[
  {k:'dmg',n:'Урон',c:'#ff7a5a',g:'<path d="M14.5 4.5l5 5L9 20H4v-5z"/><path d="M12 7l5 5"/>',v:g=>Math.round(30*g.E.dm),d:'Множитель всего урона: автоатак, навыков и ульты.'},
  {k:'def',n:'Защита',c:'#8fb4ff',g:'<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/>',v:g=>Math.round(g.E.armor),d:g=>'Броня снижает физический урон на '+Math.round(armorRed(g.E.armor)*100)+'%. Сопротивление магии '+Math.round(g.E.mres*100)+'%.'},
  {k:'spd',n:'Скорость',c:'#6fe0c0',g:'<path d="M13 4l-2 7h6l-6 9 2-7H7z"/>',v:g=>Math.round(300*(g.E.spd+0.03*g.el.air)),d:'Скорость бега.'},
  {k:'as',n:'Скор. атаки',c:'#ffd56a',g:'<circle cx="12" cy="12" r="7"/><path d="M12 8v4l3 2"/>',v:g=>Math.round(100*(1+g.E.cdr)),d:'Как часто стреляют автоатаки и как быстро восстанавливаются навыки.'}
];
function renderHStats(){
  const g=G,Gr=GROW[g.start];
  let h='<div class="sh">Характеристики <b>ур. '+g.p.lv+'</b></div>';
  for(const s of HST){
    const main=Gr.main===s.k,d=typeof s.d==='function'?s.d(g):s.d;
    h+='<div class="st'+(main?' main':'')+'" style="--sc:'+s.c+'" title="'+s.n+': '+d+(main?' Главная характеристика героя: '+Gr.t.toLowerCase()+'.':'')+'"><i><svg viewBox="0 0 24 24">'+s.g+'</svg></i><span>'+s.n+'</span><b>'+s.v(g)+'</b></div>';
  }
  $('hstats').innerHTML=h;
}
const CLS={
  fire:{n:'Пиромант',role:'Стеклянная пушка',st:{dm:0.16,cdr:0.04,hp:-25,armor:-2},dot:1.25,
    plus:'+16% урона, +4% скорости способностей, горение на 25% сильнее. Убитый горящим враг взрывается.',minus:'−25 здоровья, −2 брони.'},
  water:{n:'Мистик прилива',role:'Поддержка',st:{regen:1.3,mana:30,mreg:1.6,ls:0.03,dm:-0.1},
    plus:'+1.3 регенерации, +30 маны, мана быстрее, +3% вампиризма. Смена прилива и отлива лечит 6% здоровья и замедляет врагов вокруг.',minus:'−10% урона.'},
  earth:{n:'Каменный страж',role:'Танк',st:{hp:45,armor:6,thorns:0.25,spd:-0.1,cdr:-0.06},
    plus:'+45 здоровья, +6 брони, отражение урона 25%. Рывок вызывает ударную волну, оглушающую врагов.',minus:'−10% скорости, −6% скорости способностей.'},
  air:{n:'Налётчик ветра',role:'Мобильный охотник',st:{spd:0.1,crit:0.08,hp:-22,armor:-3},dashx:0.62,
    plus:'+10% скорости, +8% шанса крита, рывок перезаряжается на 38% быстрее.',minus:'−22 здоровья, −3 брони.'},
  metal:{n:'Солдат',role:'Стрелок',st:{armor:4,area:-0.12,mana:-20,cdr:-0.05},maxGuns:5,manax:1.15,
    plus:'+4 брони. До 5 орудий вместо 3 и пробитие пуль +1.',minus:'−12% размаха, −20 маны, навыки дороже на 15%.'},
  wood:{n:'Друид',role:'Выживание и яды',st:{regen:0.9,ls:0.04,spd:-0.05,armor:-2},dot:1.35,
    plus:'+0.9 регенерации, +4% вампиризма, яд и горение на 35% сильнее. Умирая отравленным, враг заражает соседей.',minus:'−5% скорости, −2 брони.'}
};


/* ---------- пассивки героев: 3 уровня, качаются очками навыков ---------- */
const PASR=BAL.hero.pasLv;
const HMECH={
  fire:{n:'Перегрев',d:'Каждый навык нагревает на 25. При 100 следующий навык бьёт ×1.5 и взрывом поджигает всё вокруг, но вы горите 3 с. Без кастов жар спадает'},
  water:{n:'Приливы и отливы',d:'Фаза меняется каждые 10 с. Прилив: навыки на 30% дешевле. Отлив: +3 здоровья в секунду. Мокрый враг, добитый током, даёт 5 маны'},
  earth:{n:'Стойкость',d:'Стоя на месте, каждую секунду наращиваете каменную плиту (до 5, +3 брони за каждую). Рывок тратит плиты: ударная волна шире, сильнее и дольше оглушает'},
  air:{n:'Импульс',d:'Бег копит импульс, остановка гасит. На максимуме следующий снаряд бьёт ×2.5 критом и отбрасывает'},
  metal:{n:'Арсенал',d:'Каждый ствол (и пистолет в руке) усиливает урон всех стволов на 6%. Ничего нажимать не нужно: собирай оружие и модификации'},
  wood:{n:'Сезоны',d:'Каждая волна — новый сезон. Весна: +2 регенерации. Лето: яд +40%. Осень: шипы +30%. Зима: корни держат на 50% дольше'}
};
const HPAS={
  fire:{n:'Раскалённая кровь',ic:'🔥',pd:['+8% урона по горящим врагам','+15% урона по горящим, горение длится на 1 с дольше','+25% урона по горящим; взрывы горящих врагов при смерти вдвое сильнее и шире']},
  water:{n:'Приливная сила',ic:'💧',pd:['Восстановление маны +10%','Восстановление маны +20%, мокрые враги на 15% медленнее','Восстановление маны +30%; каждый 10-й навык бесплатный']},
  earth:{n:'Каменная кожа',ic:'⛰',pd:['−6% входящего урона','−10% входящего урона','−14% входящего урона; раз в 20 с каменный щит на 3 с']},
  air:{n:'Попутный ветер',ic:'🌪',pd:['+6% скорости','+10% скорости, рывок перезаряжается на 15% быстрее','+14% скорости; после рывка +20% урона на 2 с']},
  metal:{n:'Боевая выучка',ic:'⚙',pd:['+6% шанса крита','+10% шанса крита, +10% урона огнестрела','+14% шанса крита; каждый 8-й выстрел орудия усиленный (×2,5 урона, пробивает)']},
  wood:{n:'Живой яд',ic:'🌿',pd:['+15% урона яда','+30% урона яда, яд накапливается до 3 стаков','+45% урона яда; смерть отравленного врага лечит вас на 1% здоровья']}
};
const PV=(k,arr)=>{const g=G;return(g&&g.start===k)?arr[g.pl||0]:0};
function pasCan(){const g=G;if(!g)return false;const l=g.pl||0;return l<3&&g.sp>0&&g.p.lv>=PASR[l]}
function pasUp(){const g=G;if(!pasCan())return false;g.pl=(g.pl||0)+1;g.sp--;g.dockSig='';recalc();sfx(860,0.16,'triangle',0.05,420);toast(HPAS[g.start].n+' · ур. '+g.pl,HPAS[g.start].pd[g.pl-1]);ring(g.p.x,g.p.y,90,EL[g.start].c,0.6);return true}
function pShade(h,a){const n=parseInt(h.slice(1),16);let r=n>>16,gg=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(v+(a<0?v*a:(255-v)*a))));return'rgb('+f(r)+','+f(gg)+','+f(b)+')'}
function pIcon(c,k,t,lv){
 const W=c.canvas.width,col=EL[k].c;c.save();c.setTransform(1,0,0,1,0,0);c.scale(W/54,W/54);c.clearRect(0,0,54,54);
 const gr=c.createRadialGradient(27,22,2,27,27,30);gr.addColorStop(0,pShade(col,-.3));gr.addColorStop(1,'#06080c');c.fillStyle=gr;c.beginPath();c.arc(27,27,27,0,TAU);c.fill();
 c.translate(27,27);c.globalAlpha=lv?1:.4;const p=Math.sin(t*3)*.5+.5;c.lineJoin='round';
 if(k==='fire'){c.fillStyle='#c0201a';c.beginPath();c.moveTo(0,-16);c.quadraticCurveTo(14,2,0,14);c.quadraticCurveTo(-14,2,0,-16);c.fill();c.fillStyle=col;c.beginPath();c.moveTo(0,-4);c.quadraticCurveTo(7+p*2,4,0,12);c.quadraticCurveTo(-7,4,0,-4);c.fill();c.fillStyle='#ffd27a';c.beginPath();c.moveTo(0,3);c.quadraticCurveTo(3,7,0,11);c.quadraticCurveTo(-3,7,0,3);c.fill()}
 else if(k==='water'){c.strokeStyle='#cfefff';c.lineWidth=3;c.lineCap='round';for(let i=0;i<3;i++){c.beginPath();for(let x=-15;x<=15;x+=2){const y=-9+i*9+Math.sin(x*.28+t*3+i)*3;x===-15?c.moveTo(x,y):c.lineTo(x,y)}c.stroke()}}
 else if(k==='earth'){c.fillStyle='#8a8070';c.beginPath();c.moveTo(-14,-6);c.lineTo(-4,-15);c.lineTo(10,-13);c.lineTo(16,0);c.lineTo(10,13);c.lineTo(-6,15);c.lineTo(-15,6);c.closePath();c.fill();c.strokeStyle='#1a1610';c.lineWidth=2;c.stroke();c.strokeStyle='rgba(255,200,90,'+(.6+.4*p)+')';c.beginPath();c.moveTo(-6,-8);c.lineTo(2,-2);c.lineTo(-2,6);c.stroke()}
 else if(k==='air'){c.strokeStyle='#e6fff7';c.lineWidth=3;c.lineCap='round';const s=Math.sin(t*3)*2;c.beginPath();c.moveTo(-15,-6);c.lineTo(8+s,-6);c.arc(8+s,-10,4,Math.PI/2,-Math.PI*.9,true);c.stroke();c.beginPath();c.moveTo(-13,4);c.lineTo(11-s,4);c.arc(11-s,8,4,-Math.PI/2,Math.PI*.9);c.stroke()}
 else if(k==='metal'){c.fillStyle='#b4c0d4';c.beginPath();c.moveTo(0,-16);c.lineTo(13,-11);c.lineTo(12,3);c.quadraticCurveTo(10,12,0,17);c.quadraticCurveTo(-10,12,-12,3);c.lineTo(-13,-11);c.closePath();c.fill();c.fillStyle='#d9c25a';c.beginPath();for(let i=0;i<10;i++){const r=i%2?3.5:8,a=-Math.PI/2+i*Math.PI/5;i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath();c.fill()}
 else{c.fillStyle='#62c15a';c.beginPath();c.moveTo(-12,12);c.quadraticCurveTo(-16,-12,10,-14);c.quadraticCurveTo(16,10,-12,12);c.fill();c.strokeStyle='#1d3a1a';c.lineWidth=1.8;c.beginPath();c.moveTo(-12,12);c.quadraticCurveTo(-2,0,8,-10);c.stroke()}
 c.restore()}
function pasTip(){
  const g=G,H=HPAS[g.start],l=g.pl||0;
  return '<div class="tn" style="color:'+EL[g.start].c+'">'+H.n+'</div><div class="tm">Пассивка героя · ур. '+l+'/3</div>'+H.pd.map((d,i)=>'<div class="pl'+(i<l?' on':'')+'">'+(i+1)+'. '+d+(i>=l?' <span style="color:var(--dim)">(ур. героя '+PASR[i]+')</span>':'')+'</div>').join('')+'<div class="tu">'+(l>=3?'Максимум.':(pasCan()?'Нажмите, чтобы прокачать за 1 очко.':'Качается очками навыков (T).'))+'</div>';
}

/* ---------- значки (svg, 24x24) ---------- */
const GL={
  nova:'<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" stroke-dasharray="3 3"/>',
  blast:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/><circle cx="12" cy="12" r="2.5"/>',
  rain:'<path d="M7 3l-2 6M13 3l-2 6M19 3l-2 6"/><path d="M5 14l-1 6M11 14l-1 6M17 14l-1 6"/>',
  zone:'<ellipse cx="12" cy="15" rx="9" ry="5"/><path d="M8 11c0-3 4-3 4-7M14 11c0-3 3-3 3-6"/>',
  proj:'<path d="M3 12h14M13 7l5 5-5 5"/>',
  chain:'<path d="M13 2L6 13h5l-1 9 8-12h-5z"/>',
  beam:'<path d="M3 21L21 3"/><circle cx="5" cy="19" r="2"/>',
  tornado:'<path d="M4 5h16M6 9.5h12M8 14h8M10 18.5h4"/>',
  spiral:'<path d="M12 12c2 0 3-2 2-4s-5-2-6 1 1 7 6 7 9-5 7-10"/>',
  struct:'<path d="M5 21V10l3-2 4 2 4-2 3 2v11zM9 21v-5h6v5"/>',
  buff:'<path d="M12 3l3 6 6 1-4.5 4.5L18 21l-6-3-6 3 1.5-6.5L3 10l6-1z"/>',
  blink:'<path d="M5 19L19 5M13 5h6v6"/><circle cx="6" cy="18" r="1.5"/>',
  heal:'<path d="M12 5v14M5 12h14"/>',
  potion:'<path d="M9 3h6M10 3v5l-5 9a3 3 0 0 0 3 4h8a3 3 0 0 0 3-4l-5-9V3"/>',
  shield:'<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/>',
  sword:'<path d="M5 19l10-10M14 10l5-6-1 1M16 4h4v4M7 17l-2 2"/>',
  boots:'<path d="M8 4v9l-4 3v4h14v-3l-5-2V4z"/>',
  staff:'<path d="M5 21L15 9"/><circle cx="17" cy="7" r="3.2"/>',
  scroll:'<path d="M7 4h10v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M9 9h6M9 13h6"/>',
  heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z"/>',
  clock:'<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
  crown:'<path d="M4 18l2-10 4 4 2-7 2 7 4-4 2 10z"/>',
  coin:'<circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.500 10.500h5"/>',
  bomb:'<circle cx="11" cy="14" r="6"/><path d="M15 9l3-3M17 4l1 3"/>',
  magnet:'<path d="M6 3v9a6 6 0 0 0 12 0V3M6 8h4M14 8h4"/>',
  ring:'<circle cx="12" cy="15" r="6"/><path d="M9.500 8l2.500-4 2.500 4"/>',
  fist:'<path d="M7 11V7a1.500 1.500 0 0 1 3 0v3M10 10V6a1.500 1.500 0 0 1 3 0v4M13 10V7a1.500 1.500 0 0 1 3 0v6c0 4-2 7-6 7s-6-3-6-7v-3a1.500 1.500 0 0 1 3 0"/>',
  gem:'<path d="M6 4h12l3 5-9 12L3 9z"/><path d="M3 9h18"/>',
  ult:'<path d="M12 2l2.500 7.500L22 12l-7.500 2.500L12 22l-2.500-7.500L2 12l7.500-2.500z"/>',
  mana:'<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>',
  leaf:'<path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15zM5 19l8-8"/>'
};
const GLK={boomer:'proj',cone:'blast',dash:'blink',leap:'nova',wall:'zone',strikes:'chain',barrage:'rain',trap:'bomb',summon:'struct',orbit:'spiral',grab:'beam',nova:'nova',blast:'blast',rain:'rain',zone:'zone',zones:'zone',proj:'proj',chain:'chain',beam:'beam',tornado:'tornado',spiral:'spiral',struct:'struct',buff:'buff',blink:'blink',heal:'heal',mana:'mana',block:'shield',vacuum:'magnet',slowAll:'clock',nuke:'bomb'};
const RAR=[{n:'Обычный',c:'#aab3c5'},{n:'Необычный',c:'#6fe39a'},{n:'Редкий',c:'#5fb0ff'},{n:'Эпический',c:'#c47bff'},{n:'Легендарный',c:'#ffb347'}];
const RIC={
  shield:'<path class="a" d="M12 2.5l8 3v6c0 5-3.5 8.6-8 10-4.5-1.4-8-5-8-10v-6z"/><path class="b" d="M12 5l5.5 2v4.6c0 3.6-2.4 6.3-5.5 7.5z"/><path class="h" d="M6.5 7l4-1.4v3.2l-4 1.2z"/>',
  sword:'<path class="b" d="M19 2.5h2.5V5L10.5 16l-2.5-2.5z"/><path class="h" d="M19.6 3.6l.8.8-9.4 9.4-.6-.6z"/><path class="a" d="M5 12.5l6.5 6.5-1.5 1.5-1.8-1.8-2.7 2.7-1.9-1.9 2.7-2.7L3.5 14z"/><circle class="b" cx="3.6" cy="20.4" r="1.4"/>',
  boots:'<path class="a" d="M7 3h6v9l6 3.2c1.3.7 2 1.8 2 3.3V20H4.5c-.8 0-1.5-.7-1.5-1.5V15l4-3z"/><path class="b" d="M3 17.5h18V20H4.5c-.8 0-1.5-.7-1.5-1.5z"/><path class="h" d="M8 4.5h3.5v2H8z"/>',
  heart:'<path class="a" d="M12 21s-8.5-5-8.5-11.2A4.8 4.8 0 0 1 12 6.7a4.8 4.8 0 0 1 8.5 3.1C20.5 16 12 21 12 21z"/><path class="b" d="M12 18.5s-5.5-3.6-5.5-8a2.8 2.8 0 0 1 5.5-.8z"/><ellipse class="h" cx="8" cy="9" rx="1.6" ry="1.1"/>',
  potion:'<path class="d" d="M9.5 2h5v2.5h-5z"/><path class="a" d="M10 4.5h4v4.2l4.6 7.5A3.8 3.8 0 0 1 15.4 22H8.6a3.8 3.8 0 0 1-3.2-5.8L10 8.7z"/><path class="b" d="M6.8 15h10.4l1.4 2.2A3.8 3.8 0 0 1 15.4 22H8.6a3.8 3.8 0 0 1-3.2-4.8z"/><circle class="h" cx="10" cy="17.5" r="1.1"/>',
  bomb:'<circle class="a" cx="11" cy="14" r="7"/><path class="b" d="M14 6.5l2.5-2.5 2 2-2.5 2.5z"/><path class="ff" d="M18.6 1.5l.7 1.8 1.9.3-1.5 1.1.4 1.9-1.6-1-1.6 1 .4-1.9-1.5-1.1 1.9-.3z"/><ellipse class="h" cx="8.3" cy="11.2" rx="2" ry="1.3"/>',
  gem:'<path class="a" d="M6 3.5h12l3.5 5.5L12 21.5 2.5 9z"/><path class="b" d="M2.5 9h19L12 21.5z"/><path class="h" d="M8 5h3l-2.5 4H5z"/>',
  staff:'<path class="d" d="M5 21.5l-1.5-1.5 9.5-9.5 1.5 1.5z"/><circle class="a" cx="16.5" cy="7.5" r="4.5"/><circle class="b" cx="16.5" cy="7.5" r="2.4"/><circle class="h" cx="15.4" cy="6.4" r=".9"/>',
  blink:'<path class="b" d="M14 2.5l4 .5.5 4-8.5 8-3-1z"/><path class="h" d="M16.8 3.6l.6.6-7 7-.5-.6z"/><path class="a" d="M5 11.5l7.5 7.5-1.5 1.5-2-2-3.5 3.5-1.5-1.5 3.5-3.5-2-2z"/>',
  mana:'<path class="a" d="M12 2.5c4.5 5.5 7 9 7 12.2a7 7 0 0 1-14 0c0-3.2 2.5-6.7 7-12.2z"/><path class="b" d="M5.2 15.5h13.6a7 7 0 0 1-13.6 0z"/><ellipse class="h" cx="9.5" cy="12" rx="1.3" ry="2.2"/>',
  scroll:'<path class="a" d="M6 4h12v14.5H6z"/><path class="b" d="M4 3.5a2 2 0 0 1 4 0V5H4zM16 18.5h4V20a2 2 0 0 1-4 0z"/><path class="d" d="M8.5 8h7v1.2h-7zM8.5 11h7v1.2h-7zM8.5 14h5v1.2h-5z"/>',
  ring:'<circle class="a" cx="12" cy="15" r="6.5"/><circle class="d" cx="12" cy="15" r="3.8"/><path class="b" d="M12 2.5l3.5 4-3.5 3.5-3.5-3.5z"/><path class="h" d="M11 4.5l1-1 1 1-1 1z"/>',
  coin:'<circle class="a" cx="12" cy="12" r="9"/><circle class="b" cx="12" cy="12" r="6.5"/><path class="d" d="M11 7.5h2v9h-2zM9 10.5h6v1.4H9z"/><ellipse class="h" cx="8.5" cy="8" rx="1.6" ry="1"/>',
  magnet:'<path class="a" d="M4 3h5v9a3 3 0 0 0 6 0V3h5v9a8 8 0 0 1-16 0z"/><path class="b" d="M4 3h5v4H4zM15 3h5v4h-5z"/>',
  clock:'<path class="d" d="M5 2h14v2.5H5zM5 19.5h14V22H5z"/><path class="a" d="M6.5 4.5h11c0 4-3 5.5-4 7.5 1 2 4 3.5 4 7.5h-11c0-4 3-5.5 4-7.5-1-2-4-3.5-4-7.5z"/><path class="b" d="M9 7.5h6c-.6 1.5-2 2.5-3 3.6-1-1.1-2.4-2.1-3-3.6zM8.5 18c.5-1.8 2-2.6 3.5-3.6 1.5 1 3 1.8 3.5 3.6z"/>',
  crown:'<path class="a" d="M3 18.5L2 7l5.5 4.5L12 3.5l4.5 8L22 7l-1 11.5z"/><path class="b" d="M3 17h18v3.5H3z"/><circle class="h" cx="12" cy="12.5" r="1.6"/><circle class="h" cx="7" cy="14.5" r="1"/><circle class="h" cx="17" cy="14.5" r="1"/>',
  fist:'<path class="a" d="M6 10V6.5a1.8 1.8 0 0 1 3.5 0V9V5a1.8 1.8 0 0 1 3.5 0v4V5.8a1.8 1.8 0 0 1 3.5 0V10l1-1.5a1.7 1.7 0 0 1 2.8 1.9L17.5 15c-1 3.5-3.4 6.5-7 6.5-3 0-5.5-2.5-5.5-6z"/><path class="b" d="M5.5 17h11.8l-.5 1.5c-1.2 2-3.2 3-5.3 3-2.8 0-5.3-2-6-4.5z"/>',
  feather:'<path class="a" d="M20.5 2.5c-9 0-14.5 6-14.5 13.5l-2.5 5 1.5.5L7.5 17c7 0 13-5 13-14.5z"/><path class="b" d="M20.5 2.5L7.5 17l-1-1z"/><path class="h" d="M16 6l-3 2.2 4-.2z"/>',
  cloak:'<path class="a" d="M12 2.5c-2 0-3.5 1.5-3.8 3.5L4 21.5h16L15.8 6c-.3-2-1.8-3.5-3.8-3.5z"/><path class="b" d="M9.5 8.5c.6 1.2 1.5 1.8 2.5 1.8s1.9-.6 2.5-1.8L12 21.5z"/><circle class="d" cx="12" cy="6" r="2"/>'
};
function iconItem(d){return RIC[d.gl]?'<svg class="ri" viewBox="0 0 24 24">'+RIC[d.gl]+'</svg>':icon(d.gl)}
function curStat(k){const S=G.S;return {hp:S.maxHp,regen:S.regen,mana:S.maxMana,mreg:S.mreg,dm:S.dm,spd:S.spd,cdr:S.cdr,area:S.area,crit:S.crit,armor:S.armor,mres:S.mres,ls:S.ls,thorns:S.thorns,xpm:S.xpm,gold:S.goldm,dch:1+(S.dch||0),drc:S.drc,ultcd:S.ultcd}[k]}
function fmtStat(k,v){return STPCT[k]?Math.round(v*100)+'%':(Math.abs(v%1)>0.001?v.toFixed(1):String(Math.round(v)))}
function itemTip(id,own){
  const g=G,d=ITEMS[id],R=RAR[d.rar||0];
  let h='<div class="tn" style="color:'+R.c+'">'+d.n+'</div><div class="tm"><b style="color:'+R.c+'">'+R.n+'</b> · '+d.tag+(d.mana?' · мана <b>'+d.mana+'</b>':'')+(d.cd&&d.cast?' · откат '+d.cd+' с':'')+(d.ch?' · зарядов '+d.ch:'')+'</div><div class="td">'+d.d+'</div>';
  if(d.st){
    h+='<div class="tst">';
    for(const k in d.st){
      const v=d.st[k],c=g&&g.S?curStat(k):undefined;
      h+='<div><span style="color:'+(v<0?'#ff8a7a':'#9fe0ff')+'">'+(v<0?'−':'+')+fmtStat(k,Math.abs(v))+' '+STN[k]+'</span>'+(c!==undefined&&!own?'<i>'+fmtStat(k,c)+' → <b>'+fmtStat(k,k==='mres'?Math.min(0.8,c+v):c+v)+'</b></i>':'')+'</div>';
    }
    h+='</div>';
  }
  h+=synTip(id);
  if(own)h+='<div class="tu">Продать: '+Math.round(d.price*0.5)+' золота</div>';
  return h;
}
function icon(name){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(GL[name]||GL.gem)+'</svg>'}

