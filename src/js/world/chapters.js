/* =====================================================================
   ГЛАВЫ. Забег = одна глава: 3 карты по 12 волн, босс на 12-й волне каждой карты.
   После босса — безопасная зона (торговцы, события) и два портала:
   после 1-й карты — выбор из двух карт главы, после 2-й — к логову босса
   обычным путём или «Тропой испытаний» (враги крепче, золота и эссенции больше).
   Карты главы — варианты одного биома (bio): враги, сродство героя и музыка берутся от биома.
   ===================================================================== */
/* вариант карты поверх биома: o — что поменять */
function vmap(id,base,o){
  const B=MAPS[base],M=Object.assign({},B,o);
  M.bio=base;
  if(o.solid)M.solid=Object.assign({},B.solid,o.solid);
  if(o.pool!==undefined)M.pool=o.pool?Object.assign({},B.pool||{},o.pool):null;
  M.mods={buff:o.buff||B.mods.buff,debuff:o.debuff||B.mods.debuff};
  if(o.amb)M.amb=Object.assign({},B.amb,o.amb);
  delete M.buff;delete M.debuff;
  MAPS[id]=M;if(MAPK.indexOf(id)<0)MAPK.push(id);
}
for(const k of BIOMES)MAPS[k].bio=k;
const bio=id=>(MAPS[id]&&MAPS[id].bio)||id;

/* ---- Глава 1: Зелёный край ---- */
vmap('lawn','forest',{n:'Солнечная лужайка',d:'Светлая поляна с редкими деревьями. Хорошее место, чтобы освоиться.',
  base:'#13240f',mid:'#1d3a18',acc:'#3f6e2c',glow:'#a6e86a',grade:'rgba(30,40,0,.06)',
  solid:{n:0.9},pool:null,amb:{c:['#fff4a0','#e6ffb0','#ffd36b'],fall:0.15},
  debuff:{n:'Высокая трава',d:'−5% к скорости бега.',st:{spd:-0.05}},
  foe:{n:'Лесные жители',d:'Обычные враги'},roster:{wisp:1.6,splitter:1.5}});
vmap('bog','forest',{n:'Топь',d:'Болото в низине: лужи мочат врагов, корни вырываются из трясины.',
  base:'#0e1912',mid:'#16271c',acc:'#2f4a36',glow:'#7fd0a0',grade:'rgba(0,30,20,.12)',
  solid:{n:1.4},pool:{kind:'puddle',n:1.2,r:[60,100]},amb:{c:['#c8f0b0','#7fd0a0'],fall:-0.3},
  buff:{n:'Болотная мята',d:'+1,5 маны в секунду.',st:{mreg:1.5}},
  debuff:{n:'Трясина',d:'Корни вырываются из земли в отмеченных местах. −10% к скорости бега.',st:{spd:-0.10},hz:'overgrow'},
  foe:{n:'Болотная гниль',d:'Враги прочнее на 15%',hp:1.15},roster:{splitter:2.4,healer:1.6,sporer:1.6}});
vmap('thicket','forest',{n:'Сердце чащи',d:'Логово хранителя леса: непролазные деревья и терновник повсюду.',
  base:'#0a140c',mid:'#112016',acc:'#1f3d24',glow:'#4fae4a',grade:'rgba(0,24,8,.16)',
  solid:{n:3.0},pool:{kind:'bramble',n:1.0,r:[55,95]},
  buff:{n:'Живица',d:'+1,5 здоровья в секунду.',st:{regen:1.5}},
  debuff:{n:'Дикие заросли',d:'Корни вырываются из земли чаще. −8% к скорости бега.',st:{spd:-0.08},hz:'overgrow'},
  foe:{n:'Древняя кора',d:'Враги прочнее на 20% и бьют на 5% сильнее',hp:1.2,dmg:1.05}});

/* ---- Глава 2: Пески ---- */
vmap('steppe','dunes',{n:'Каменистая степь',d:'Твёрдая земля на краю пустыни: редкие кактусы, зыбучих песков нет.',
  base:'#28221a',mid:'#3a3022',acc:'#5c4c34',glow:'#e8c27a',
  solid:{n:0.7},pool:null,amb:{wind:2,drift:40},
  debuff:{n:'Зной',d:'Мана восстанавливается медленнее (−1 в секунду).',st:{mreg:-1}},
  foe:{n:'Жара',d:'Враги быстрее на 4%',sp:1.04}});
vmap('oasis','dunes',{n:'Оазис',d:'Вода посреди песков: лужи мочат врагов, а к воде стягиваются целые стаи.',
  base:'#252414',mid:'#36351c',acc:'#56602e',glow:'#c8e07a',
  solid:{n:1.4},pool:{kind:'puddle',n:0.9,r:[60,110]},
  buff:{n:'Тень пальм',d:'+1,5 здоровья в секунду.',st:{regen:1.5}},
  debuff:{n:'Суховей',d:'Порывы ветра периодически сносят вас и врагов в одну сторону.',hz:'wind'},
  foe:{n:'Водопой',d:'Врагов больше на 30%',cnt:1.3}});
vmap('tomb','dunes',{n:'Гробница Владыки',d:'Древние камни и зыбучие пески у логова Песчаного Владыки.',
  base:'#221a10',mid:'#30251a',acc:'#4e3c24',glow:'#ffb347',grade:'rgba(60,30,0,.14)',
  solid:{kind:'rock',n:1.4,r:[24,40]},pool:{kind:'quicksand',n:1.2,r:[65,110]},
  debuff:{n:'Буря гробницы',d:'Ветер сносит вас и врагов. −6% к скорости бега.',st:{spd:-0.06},hz:'wind'},
  foe:{n:'Стражи гробницы',d:'Враги быстрее на 8% и бьют на 10% сильнее',sp:1.08,dmg:1.1}});

/* ---- Глава 3: Стужа ---- */
vmap('shore','ice',{n:'Заснеженный берег',d:'Снег, а не лёд: здесь не скользко. Редкие кристаллы.',
  base:'#142030',mid:'#1c2e42',acc:'#3a5a7a',glow:'#bfe8ff',ice:false,
  solid:{n:1.0},
  debuff:{n:'Мороз',d:'Способности на 6% медленнее.',st:{cdr:-0.06}},
  foe:{n:'Холод',d:'Враги прочнее на 8%',hp:1.08}});
vmap('glacier','ice',{n:'Ледник',d:'Лабиринт ледяных кристаллов на скользком льду. Налетает метель.',
  base:'#0b1828',mid:'#122a44',acc:'#2a5680',glow:'#8fd8ff',
  solid:{n:2.4},
  debuff:{n:'Метель',d:'Периодически налетает метель: замедляет, морозит, затем замораживает. Способности на 10% медленнее.',st:{cdr:-0.10},hz:'blizzard'},
  foe:{n:'Вечная мерзлота',d:'Враги прочнее на 20%',hp:1.2}});
vmap('palace','ice',{n:'Ледяной дворец',d:'Тронный зал Ледяной Королевы: скользкий пол, кристальные колонны, вьюга.',
  base:'#10142a',mid:'#1a2242',acc:'#3c4a86',glow:'#c9b8ff',grade:'rgba(20,10,70,.12)',
  solid:{n:1.8},amb:{c:['#ffffff','#c9b8ff','#9fe0ff']},
  debuff:{n:'Королевская вьюга',d:'Метель налетает и морозит. Способности на 15% медленнее.',st:{cdr:-0.15},hz:'blizzard'},
  foe:{n:'Свита королевы',d:'Враги прочнее на 20%, устойчивее к магии (+10%), но медленнее на 5%',hp:1.2,sp:0.95,mres:0.10}});

/* ---- Глава 4: Пепелище ---- */
vmap('cinder','ash',{n:'Тлеющая опушка',d:'Край сгоревшего леса: пепел в воздухе, редкие камни.',
  base:'#18161a',mid:'#24202a',acc:'#3a3240',glow:'#ffa060',
  solid:{n:0.5},
  debuff:{n:'Пепел в воздухе',d:'−6% к урону.',st:{dm:-0.06}},
  foe:{n:'Погорельцы',d:'Враги быстрее на 5%',sp:1.05}});
vmap('mines','ash',{n:'Угольные копи',d:'Раскопы с тлеющими углями. С потолка срываются раскалённые глыбы.',
  base:'#141210',mid:'#201a16',acc:'#3a2a20',glow:'#ff7a3a',
  solid:{n:1.4},pool:{kind:'lava',n:0.5,r:[50,85]},
  debuff:{n:'Обвалы',d:'Раскалённые глыбы падают рядом с вами: бьют и вас, и врагов.',hz:'bombs'},
  foe:{n:'Шахтёры',d:'Враги бьют на 10% сильнее',dmg:1.1}});
vmap('rift','ash',{n:'Пустотный разлом',d:'Трещина в мире, где живёт Страж Пустоты. Пыльные вихри затягивают всех.',
  base:'#140f1f',mid:'#1f1830',acc:'#3a2a52',glow:'#b06bff',grade:'rgba(40,0,60,.12)',
  amb:{c:['#d0a0ff','#8a6bd6','#ff8a4a']},
  debuff:{n:'Пустотные вихри',d:'Вихри затягивают и бьют. Мана восстанавливается медленнее (−1,5 в секунду).',st:{mreg:-1.5},hz:'devil'},
  foe:{n:'Порождения пустоты',d:'Враги прочнее на 15% и быстрее на 8%',hp:1.15,sp:1.08}});

/* ---- Глава 5: Гроза ---- */
vmap('hills','storm',{n:'Мокрые холмы',d:'Ливень без молний: лужи повсюду, редкие громоотводы.',
  base:'#121620',mid:'#1c2230',acc:'#344058',glow:'#a8c0ff',
  solid:{n:0.4},pool:{kind:'puddle',n:1.2,r:[55,95]},
  debuff:{n:'Ливень',d:'−6% к скорости бега.',st:{spd:-0.06}},
  foe:{n:'Промокшие',d:'Враги устойчивее к магии (+5%)',mres:0.05}});
vmap('pylons','storm',{n:'Ржавые столбы',d:'Поле старых громоотводов. Молнии бьют часто.',
  base:'#13120f',mid:'#201d18',acc:'#4a3e2e',glow:'#ffd27a',
  solid:{n:1.8},pool:null,
  debuff:{n:'Грозовые разряды',d:'Молнии бьют в случайные точки рядом: по вам и по врагам.',hz:'strike'},
  foe:{n:'Наэлектризованные',d:'Враги устойчивее к магии (+15%) и бьют на 10% сильнее',mres:0.15,dmg:1.1}});
vmap('eye','storm',{n:'Око бури',d:'Сердце грозы и мастерская Железного Колосса.',
  base:'#0c0e18',mid:'#161a2a',acc:'#2e3a66',glow:'#f4f08a',grade:'rgba(10,16,60,.18)',
  solid:{n:1.2},pool:{kind:'puddle',n:1.1,r:[55,95]},
  debuff:{n:'Буря',d:'Молнии бьют по всем. Способности на 8% медленнее.',st:{cdr:-0.08},hz:'strike'},
  foe:{n:'Дети бури',d:'Враги прочнее на 10%, устойчивее к магии (+15%) и бьют на 12% сильнее',hp:1.1,mres:0.15,dmg:1.12}});

/* ---- Глава 6: Пламя ---- */
vmap('cooled','lava',{n:'Остывшая лава',d:'Чёрная корка над огнём: лавовых озёр мало, но жар чувствуется.',
  base:'#161010',mid:'#221616',acc:'#3e2420',glow:'#ff8a4a',
  pool:{kind:'lava',n:0.5,r:[60,100]},
  debuff:{n:'Жар',d:'−1 здоровья в секунду.',st:{regen:-1}},
  foe:{n:'Раскалённые',d:'Враги бьют на 8% сильнее',dmg:1.08}});
vmap('river','lava',{n:'Огненная река',d:'Широкие потоки лавы и падающие вулканические бомбы.',
  base:'#1c0c0a',mid:'#2c1410',acc:'#52241a',glow:'#ff5a2b',
  pool:{kind:'lava',n:1.6,r:[90,150]},
  debuff:{n:'Вулканические бомбы',d:'Раскалённые глыбы падают рядом с вами: бьют и вас, и врагов.',hz:'bombs'},
  foe:{n:'Огненные',d:'Враги бьют на 15% сильнее',dmg:1.15}});
vmap('maw','lava',{n:'Жерло Пожирателя',d:'Кратер, где ждёт Пожиратель Стихий. Всё горит.',
  base:'#160a12',mid:'#24101c',acc:'#4a1a30',glow:'#ff4a7a',grade:'rgba(70,0,30,.14)',
  solid:{n:1.3},pool:{kind:'lava',n:1.2,r:[70,125]},amb:{c:['#ff8ab0','#ff6a2b','#ffd36b']},
  debuff:{n:'Пекло',d:'Падают вулканические бомбы. −1 здоровья в секунду.',st:{regen:-1},hz:'bombs'},
  foe:{n:'Слуги Пожирателя',d:'Враги прочнее на 20% и бьют на 15% сильнее',hp:1.2,dmg:1.15}});

/* сумерки: [насколько темно 0..0.85, цвет ночи] — эффекты светят тем сильнее, чем темнее карта */
const DUSK={forest:[.19,'#1c3048'],dunes:[.09,'#5a3a2a'],ice:[.14,'#24365e'],ash:[.22,'#2a2238'],storm:[.38,'#18203c'],lava:[.34,'#3a1424'],
  lawn:[.04,'#2a3a50'],bog:[.29,'#1a2c38'],thicket:[.41,'#141e38'],steppe:[.06,'#4a3a3a'],oasis:[.15,'#2a3050'],tomb:[.38,'#3a2030'],
  shore:[.08,'#2a3a60'],glacier:[.22,'#24365e'],palace:[.41,'#221a4a'],cinder:[.19,'#2a2238'],mines:[.38,'#2a1a1a'],rift:[.45,'#24123a'],
  hills:[.26,'#1e2840'],pylons:[.38,'#22202c'],eye:[.46,'#121838'],cooled:[.26,'#2a1418'],river:[.38,'#341018'],maw:[.46,'#2a0c1c']};
for(const k in DUSK){MAPS[k].dark=DUSK[k][0];MAPS[k].nc=DUSK[k][1]}

/* maps: [старт, развилка А, развилка Б, логово]; boss: [босс 1-й карты, 2-й, босс главы] */
const CHAP=[
  {n:'Зелёный край',d:'Лужайки, болота и чаща. Хранитель — Древний Энт.',maps:['lawn','forest','bog','thicket'],boss:['guard','golem','ent']},
  {n:'Пески',d:'Степь, дюны и оазис. Хранитель — Песчаный Владыка.',maps:['steppe','dunes','oasis','tomb'],boss:['guard','ent','sandlord']},
  {n:'Стужа',d:'Снега, лёд и ледник. Хранитель — Ледяная Королева.',maps:['shore','ice','glacier','palace'],boss:['ent','sandlord','queen']},
  {n:'Пепелище',d:'Гарь, пепел и копи. Хранитель — Страж Пустоты.',maps:['cinder','ash','mines','rift'],boss:['queen','golem','guard']},
  {n:'Гроза',d:'Холмы под ливнем и поле молний. Хранитель — Железный Колосс.',maps:['hills','storm','pylons','eye'],boss:['sandlord','guard','golem']},
  {n:'Пламя',d:'Вулкан и огненные реки. Финал — Пожиратель Стихий.',maps:['cooled','lava','river','maw'],boss:['queen','golem','devourer']}
];
const chapOf=g=>CHAP[clamp((g&&g.ch||1)-1,0,CHAP.length-1)];
const mapStage=w=>Math.min(3,Math.floor((Math.max(1,w)-1)/WPM)+1);
const mapWave=w=>(Math.max(1,w)-1)%WPM+1;
/* «волна сложности»: по ней растут враги, ловушки, цены */
const effW=w=>1+(Math.max(1,w)-1)*BAL.chap.wk;
function SW(){return G?effW(G.wave):1}
function chapHp(){const g=G;return 1+BAL.chap.hpPer*((g&&g.ch||1)-1)}
function chapDm(){const g=G;return 1+BAL.chap.dmPer*((g&&g.ch||1)-1)}
/* здоровье босса: кривая по волне сложности, приведённая к базе конкретного босса */
function bossHpScale(bk,w){
  const C=BAL.boss.hpCurve,s=effW(Math.min(w,WAVES_TOTAL));
  let hp;
  if(s<=C[0][0])hp=C[0][1]*s/C[0][0];
  else if(s>=C[C.length-1][0]){const a=C[C.length-2],b=C[C.length-1];hp=b[1]+(b[1]-a[1])/(b[0]-a[0])*(s-b[0])}
  else for(let i=1;i<C.length;i++)if(s<=C[i][0]){const a=C[i-1],b=C[i];hp=a[1]+(b[1]-a[1])*(s-a[0])/(b[0]-a[0]);break}
  const fin=(w%(WPM*3)===0&&((G&&G.ch)||1)>1)?BAL.chap.finalBoss:1; /* в первой главе хранитель без надбавки */
  const endl=w>WAVES_TOTAL?1+BAL.boss.endlessK*(w-WAVES_TOTAL):1;
  return hp/ET['boss_'+bk].hp*fin*endl;
}

/* ---------- безопасная зона и порталы ---------- */
function openSafeZone(){
  const g=G,C=chapOf(g),st=mapStage(g.wave);
  g.safe=true;g.portals=[];
  const opts=st===1?[{map:C.maps[1]},{map:C.maps[2]}]:[{map:C.maps[3]},{map:C.maps[3],risk:true}];
  /* порталы — над героем, слева и справа; торговцев и события из-под них сдвигаем вниз */
  const spot=side=>{let x=g.p.x+side*190,y=g.p.y-250;
    for(let t=0;t<60;t++){let ok=true;
      for(const s of g.solids)if(Math.hypot(x-s.x,y-s.y)<s.r+70){ok=false;break}
      if(ok)for(const s of g.pools)if(s.kind==='lava'&&Math.hypot(x-s.x,y-s.y)<s.r+70){ok=false;break}
      if(ok)for(const q of g.portals)if(Math.hypot(x-q.x,y-q.y)<260){ok=false;break}
      if(ok)return {x,y};
      x=g.p.x+side*rnd(150,340);y=g.p.y-rnd(150,340)}
    return {x,y}};
  opts.forEach((o,i)=>{const q=spot(i?1:-1);g.portals.push(Object.assign({x:q.x,y:q.y,bob:rnd(0,TAU)},o))});
  for(const m of (g.merch||[]).concat(g.evts||[]))for(const q of g.portals)if(Math.hypot(m.x-q.x,m.y-q.y)<150&&m.y<g.p.y-60){const s=freeSpot(m.x,g.p.y+rnd(150,230),48,160);m.x=s.x;m.y=s.y}
  if(!COOP)saveRun(); /* автосохранение после каждой карты: забег можно продолжить из меню */
  toast('Безопасная зона','Забег сохранён. Враги не придут, пока вы не войдёте в портал. Торговцы рядом.');
}
function nearPortal(){
  const g=G;if(!g.safe||!g.portals)return null;
  let b=null,bd=80*80;
  for(const q of g.portals){const d=(q.x-g.p.x)**2+(q.y-g.p.y)**2;if(d<bd){bd=d;b=q}}
  return b;
}
function portalName(q){return q.risk?'Тропа испытаний':MAPS[q.map].n}
function usePortal(q){
  const g=G;
  g.safe=false;g.portals=[];g.risk=!!q.risk;if(g.risk)g.riskRun=true;g.evts=[];g.merch=[];
  enterBiome(q.map);coopGather();placeFeature();clearRun();
  if(g.risk)toast('Тропа испытаний','Враги на '+Math.round((BAL.chap.riskHp-1)*100)+'% крепче, золота на '+Math.round((BAL.chap.riskGold-1)*100)+'% больше. Победа даст +'+Math.round((BAL.chap.riskEss-1)*100)+'% эссенции.');
  sfx(260,0.5,'sine',0.06,500);
  startWave(g.wave+1);
}
function drawPortals(g){
  if(!g.safe||!g.portals)return;
  for(const q of g.portals){
    const M=MAPS[q.map],col=q.risk?'#ff5a5a':M.glow,t=anim+q.bob,x=q.x,y=q.y;
    ctx.save();ctx.translate(x,y);
    ctx.globalCompositeOperation='lighter';
    glow(0,0,90,col,0.35+0.1*Math.sin(t*3));
    ctx.globalAlpha=1;
    for(let i=0;i<3;i++){ctx.save();ctx.rotate(t*(1.2+i*0.5)*(i%2?-1:1));ctx.strokeStyle=col;ctx.globalAlpha=0.55-i*0.12;ctx.lineWidth=3-i*0.6;
      ctx.beginPath();ctx.ellipse(0,0,34+i*9,46+i*11,0,0.3,TAU-0.6);ctx.stroke();ctx.restore()}
    ctx.globalCompositeOperation='source-over';
    const gr=ctx.createRadialGradient(0,0,4,0,0,36);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(0.35,M.acc);gr.addColorStop(1,'rgba(0,0,0,.85)');
    ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(0,0,30,42,0,0,TAU);ctx.fill();
    ctx.globalAlpha=1;ctx.shadowColor='rgba(0,0,0,.9)';ctx.shadowBlur=6;
    ctx.fillStyle='#fff';ctx.font='bold 15px sans-serif';ctx.textAlign='center';
    ctx.fillText(portalName(q),0,-62);
    ctx.font='12px sans-serif';ctx.fillStyle=col;
    ctx.fillText(q.risk?'враги крепче · золото ×'+BAL.chap.riskGold:('▼ '+M.mods.debuff.n),0,-46);
    ctx.restore();
    /* стрелка к порталу за краем экрана */
    const sx=x-cam.x,sy=y-cam.y;
    if(sx<0||sy<0||sx>VW||sy>VH){const a=Math.atan2(sy-VH/2,sx-VW/2),ex=clamp(sx,36,VW-36),ey=clamp(sy,36,VH-36);
      ctx.save();ctx.translate(cam.x+ex,cam.y+ey);ctx.rotate(a);ctx.fillStyle=col;ctx.globalAlpha=0.6+0.3*Math.sin(t*4);
      ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-8,-10);ctx.lineTo(-3,0);ctx.lineTo(-8,10);ctx.closePath();ctx.fill();ctx.restore()}
  }
}
