/* ---------- способности (хотбар 1-5) ---------- */
const AB={};
function def(id,o){o.id=id;o.c1=o.c1||null;AB[id]=o;return o}

/* навыки стихий */
def('nova',{cat:'skill',n:'Вспышка',els:['fire'],kind:'nova',mana:26,cd:5.5,
  d:'Кольцо огня расходится от вас, отбрасывает врагов и поджигает.',
  up:['Шире и горячее','Урон и ожог выше','Шире и мощнее','Урон и ожог выше'],
  p:l=>({r:90+16*l,dmg:34+18*l,dt:'magic',knock:320,col:'#ff8a3d',st:{burn:[4+3*l,3]}})});
def('spring',{cat:'skill',n:'Источник',els:['water'],kind:'zone',mana:30,cd:9,
  d:'Под вами бьёт источник: лечит вас, мочит и замедляет врагов.',
  up:['Шире, лечит сильнее','Живёт дольше','Шире, лечит сильнее','Лечит сильнее'],
  p:l=>({self:true,r:80+10*l,life:5+0.5*l,dps:0,heal:3+1.6*l,dt:'magic',vis:'spring',col:'#6fd0ff',st:{slow:[0.6,0.6],wet:2}})});
def('spikes',{cat:'skill',n:'Шипы земли',els:['earth'],kind:'rain',mana:30,cd:6,
  d:'Шипы пробивают землю вокруг точки прицела и оглушают врагов.',
  up:['+1 шип','Урон выше','+1 шип','Шипы шире'],
  p:l=>({n:3+l,spread:110,r:34+3*l,dmg:34+16*l,dt:'phys',delay:0.45,gap:0.07,vis:'spike',col:'#d9b36a',knock:100,st:{stun:0.5}})});
def('bolt',{cat:'skill',n:'Молния',els:['air'],kind:'chain',mana:24,cd:4,
  d:'Цепная молния перескакивает между врагами. По мокрым бьёт сильнее.',
  up:['+1 прыжок','Вторая молния за раз','+1 прыжок','Урон выше'],
  p:l=>({n:1+(l>=3?1:0)+(l>=5?1:0),jumps:2+l,dmg:36+16*l,dt:'magic',range:180,col:'#f4f08a',shock:true})});
def('volley',{cat:'skill',n:'Залп',els:['metal'],kind:'proj',mana:26,cd:5,
  d:'Веер стальных пуль в направлении цели.',
  up:['+2 пули','Пробивают двоих','+2 пули','Урон выше'],
  p:l=>({n:3+2*l,spread:0.5,spd:680,r:5,dmg:16+7*l,dt:'phys',pierce:l>=3?2:1,life:0.7,vis:'bullet',col:'#e8eef8'})});
def('whip',{cat:'skill',n:'Хлыст лозы',els:['wood'],kind:'beam',mana:28,cd:6,
  d:'Лоза бьёт по линии, опутывает врагов корнями и лечит вас.',
  up:['Длиннее и сильнее','Корни дольше','Лечит сильнее','Длиннее и сильнее'],
  p:l=>({len:300+30*l,w:44,dmg:34+15*l,dt:'magic',vis:'vine',col:'#62c15a',st:{root:1.2+0.2*l},healHit:3+l})});


/* новые навыки: у каждой стихии дальний, ближний и поддерживающий */
def('fireball',{cat:'skill',role:'дальний бой',n:'Огненный шар',els:['fire'],kind:'proj',mana:28,cd:4.5,
  d:'Тяжёлый огненный шар летит в цель и взрывается, поджигая всех вокруг.',
  up:['Взрыв шире','Урон выше','Взрыв шире','Урон выше'],
  p:l=>({n:1,spread:0,spd:430,r:13,dmg:44+22*l,dt:'magic',pierce:0,life:1.1,vis:'fire',col:'#ff8a3d',blast:68+8*l,st:{burn:[5+3*l,3]}})});
def('blaze',{cat:'skill',role:'поддержка',n:'Боевой жар',els:['fire'],kind:'buff',mana:34,cd:14,
  d:'Жар воодушевляет: больше урона и вампиризма вам и союзникам рядом.',
  up:['Сильнее и дольше','Вампиризм выше','Сильнее и дольше','Вампиризм выше'],
  p:l=>({dm:0.2+0.05*l,ls:0.04+0.015*l,dur:7+l,col:'#ffb347'})});
def('icelance',{cat:'skill',role:'дальний бой',n:'Ледяное копьё',els:['water'],kind:'proj',mana:26,cd:4,
  d:'Копьё изо льда пробивает врагов насквозь и замедляет их.',
  up:['Урон выше','Пробивает больше врагов','+1 копьё','Урон выше'],
  p:l=>({n:1+(l>=4?1:0),spread:0.22,spd:650,r:8,dmg:34+17*l,dt:'magic',pierce:2+Math.floor(l/2),life:0.9,vis:'ice',col:'#9fe0ff',st:{slow:[0.55,1.4],wet:2}})});
def('tide',{cat:'skill',role:'ближний бой',n:'Приливная волна',els:['water'],kind:'proj',mana:30,cd:6.5,
  d:'Мощная волна бьёт вперёд, отбрасывает и мочит врагов.',
  up:['Шире','Урон выше','Шире','Урон выше'],
  p:l=>({n:1,spread:0,spd:540,r:40+4*l,dmg:30+16*l,dt:'magic',pierce:99,life:0.44,vis:'tsunami',col:'#6fd0ff',knock:380,st:{wet:2,slow:[0.7,1]}})});
def('quake',{cat:'skill',role:'ближний бой',n:'Землетрясение',els:['earth'],kind:'nova',mana:32,cd:7,
  d:'Удар о землю: трещины, ударная волна и оглушение врагов вокруг.',
  up:['Шире','Оглушение дольше','Шире','Урон выше'],
  p:l=>({r:100+14*l,dmg:40+20*l,dt:'phys',knock:140,col:'#c9974f',st:{stun:0.7+0.1*l}})});
def('stoneward',{cat:'skill',role:'поддержка',n:'Каменный покров',els:['earth'],kind:'buff',mana:32,cd:13,
  d:'Каменная броня: защита растёт, вы восстанавливаете здоровье.',
  up:['Броня выше','Регенерация выше','Броня выше','Дольше'],
  p:l=>({armor:8+3*l,regen:1+0.6*l,dur:8+l,col:'#c9974f'})});
def('bladestorm',{cat:'skill',role:'ближний бой',n:'Вихрь клинков',els:['air'],kind:'nova',mana:26,cd:5,
  d:'Круг воздушных клинков разлетается от вас и рубит всех рядом.',
  up:['+2 клинка','Урон выше','+2 клинка','Урон выше'],
  p:l=>({r:70+8*l,dmg:20+10*l,dt:'phys',knock:200,col:'#8febd0',shards:{n:6+2*l,spd:480,dmg:20+10*l,dt:'phys',life:0.45,pierce:2,vis:'blade',col:'#8febd0'}})});
def('tailwind',{cat:'skill',role:'поддержка',n:'Попутный ветер',els:['air'],kind:'buff',mana:30,cd:12,
  d:'Ветер подхватывает: скорость растёт, рывок восстанавливается.',
  up:['Быстрее','Дольше','Быстрее','Дольше'],
  p:l=>({spd:0.28+0.05*l,dash:true,dur:6+l,col:'#b6f5e0'})});
def('magnet',{cat:'skill',role:'ближний бой',n:'Магнитный импульс',els:['metal'],kind:'nova',mana:30,cd:6.5,
  d:'Импульс затягивает врагов к вам и бьёт по площади.',
  up:['Шире','Урон выше','Сильнее затягивает','Урон выше'],
  p:l=>({r:110+12*l,dmg:36+18*l,dt:'phys',knock:0,pull:280+30*l,col:'#b4c0d4'})});
def('bastion',{cat:'skill',role:'поддержка',n:'Бастион',els:['metal'],kind:'buff',mana:32,cd:13,
  d:'Стальной бастион: броня и урон растут на время.',
  up:['Броня выше','Урон выше','Броня выше','Дольше'],
  p:l=>({armor:7+3*l,dm:0.1+0.04*l,dur:8+l,col:'#b4c0d4'})});
def('parasites',{cat:'skill',role:'дальний бой',n:'Семена-паразиты',els:['wood'],kind:'proj',mana:26,cd:5.5,
  d:'Рой семян сам находит врагов и заражает их ядом.',
  up:['+1 семя','Яд сильнее','+1 семя','Урон выше'],
  p:l=>({n:3+l,spread:1.2,spd:300,r:6,dmg:20+9*l,dt:'magic',pierce:0,life:2.2,vis:'seed',homing:true,col:'#9ad16a',st:{poison:[5+2*l,4],slow:[0.8,1]}})});
def('sprout',{cat:'skill',role:'поддержка',n:'Росток жизни',els:['wood'],kind:'zone',mana:32,cd:10,
  d:'Из земли вырастает росток: лечит вас и союзников рядом.',
  up:['Шире, лечит сильнее','Живёт дольше','Шире, лечит сильнее','Лечит сильнее'],
  p:l=>({self:true,r:84+10*l,life:6+0.4*l,dps:0,heal:3.8+1.7*l,dt:'magic',vis:'sprout',col:'#8ad25a',st:{}})});

/* навыки, добивающие набор до 4 ролей: бросок, ближний, массовый, контроль */
def('flamejet',{cat:'skill',n:'Огнемёт',els:['fire'],kind:'proj',mana:24,cd:4,
  d:'Струя пламени конусом перед вами: сжигает всех вблизи.',
  up:['Шире конус','Урон и горение выше','Дальше бьёт','Урон и горение выше'],
  p:l=>({n:7+l,spread:0.85,spd:360+10*l,r:9,dmg:14+7*l,dt:'magic',pierce:3,life:0.34+0.02*l,vis:'flame',col:'#ff9a3c',st:{burn:[6+3*l,3]}})});
def('deluge',{cat:'skill',n:'Ливень',els:['water'],kind:'rain',mana:32,cd:8,
  d:'На область у прицела обрушивается ливень: бьёт, мочит и замедляет всех.',
  up:['+2 струи','Урон выше','Шире','Урон выше'],
  p:l=>({n:7+2*l,spread:140+8*l,r:42,dmg:22+11*l,dt:'magic',delay:0.45,gap:0.05,vis:'drop',col:'#6fd0ff',knock:40,st:{wet:3,slow:[0.6,1.4]}})});
def('boulder',{cat:'skill',n:'Валун',els:['earth'],kind:'proj',mana:28,cd:5,
  d:'Тяжёлый валун катится в сторону прицела, давит всех на пути и оглушает.',
  up:['Валун крупнее','Урон выше','Оглушение дольше','Урон выше'],
  p:l=>({n:1,spread:0,spd:400,r:16+2*l,dmg:48+24*l,dt:'phys',pierce:99,life:1.15,vis:'rock',col:'#c9974f',knock:300,st:{stun:0.5+0.1*l}})});
def('gale',{cat:'skill',n:'Серп ветра',els:['air'],kind:'proj',mana:22,cd:3.5,
  d:'Острые серпы ветра летят в прицел и прорезают целые ряды врагов.',
  up:['+1 серп','Пробивают больше','+1 серп','Урон выше'],
  p:l=>({n:2+Math.floor(l/2),spread:0.24,spd:820,r:8,dmg:26+12*l,dt:'phys',pierce:3+l,life:0.7,vis:'blade',col:'#8febd0',knock:120})});
def('shrapnel',{cat:'skill',n:'Осколочный град',els:['metal'],kind:'rain',mana:34,cd:8,
  d:'Снаряды падают на область у прицела и разрываются шрапнелью.',
  up:['+2 снаряда','Урон выше','Шире','Урон выше'],
  p:l=>({n:8+2*l,spread:160+8*l,r:40,dmg:30+14*l,dt:'phys',delay:0.5,gap:0.06,vis:'shell',col:'#e8eef8',knock:120,st:{stun:0.2}})});
def('thornfield',{cat:'skill',n:'Терновая поляна',els:['wood'],kind:'zone',mana:34,cd:10,
  d:'У прицела вырастает поляна терновника: держит корнями и отравляет всех внутри.',
  up:['Шире','Яд сильнее','Шире','Дольше держит'],
  p:l=>({r:110+12*l,life:5+0.4*l,dps:16+9*l,dt:'magic',vis:'thorns',col:'#62c15a',st:{root:0.45+0.08*l,poison:[6+3*l,3]}})});

/* вторые варианты ролей: новые механики */
def('fboomer',{cat:'skill',n:'Пылающий бумеранг',els:['fire'],kind:'boomer',mana:26,cd:4.5,
  d:'Огненный бумеранг летит в прицел и возвращается, обжигая всех дважды.',
  up:['Урон выше','Горение сильнее','+1 бумеранг','Урон выше'],
  p:l=>({n:1+(l>=4?1:0),spread:0.5,spd:520,r:12,dmg:30+15*l,dt:'magic',life:0.95,col:'#ff8a3d',st:{burn:[5+3*l,3]},knock:80})});
def('fdash',{cat:'skill',n:'Огненный рывок',els:['fire'],kind:'dash',mana:26,cd:5,
  d:'Рывок сквозь врагов в сторону прицела: обжигает всех на пути и оставляет полосу огня.',
  up:['Дальше','Урон выше','След горячее','Урон выше'],
  p:l=>({dist:230+20*l,w:30,dmg:36+18*l,dt:'magic',col:'#ff7a2b',st:{burn:[6+3*l,3]},knock:200,spd:1100,trail:{r:30,life:2+0.3*l,dps:10+5*l,dt:'magic',vis:'lava',col:'#ff4a2a'}})});
def('frain',{cat:'skill',n:'Огненный дождь',els:['fire'],kind:'barrage',mana:40,cd:11,
  d:'Несколько секунд на область у прицела падают огненные капли.',
  up:['+1 волна','Урон выше','Капель больше','Урон выше'],
  p:l=>({waves:3+Math.floor(l/2),wgap:0.7,rain:{n:4+l,spread:130,r:46,dmg:24+11*l,dt:'magic',delay:0.4,gap:0.08,vis:'meteor',col:'#ff6a2b',knock:80,st:{burn:[5+2*l,3]}}})});
def('fwall',{cat:'skill',n:'Стена огня',els:['fire'],kind:'wall',mana:32,cd:10,
  d:'Поперёк пути врагов встаёт стена пламени: жжёт и замедляет всех, кто идёт сквозь неё.',
  up:['Длиннее','Жарче','Дольше горит','Жарче'],
  p:l=>({n:6+l,gap:34,r:28,life:4+0.5*l,dps:22+10*l,dt:'magic',vis:'wildfire',col:'#ff7a2b',st:{burn:[6+3*l,3],slow:[0.7,0.5]},range:260})});
def('bubble',{cat:'skill',n:'Пузырь',els:['water'],kind:'proj',mana:26,cd:5,
  d:'Водяной пузырь лопается на цели: запирает врагов рядом в воде и оглушает.',
  up:['Дольше держит','Урон выше','+1 пузырь','Шире всплеск'],
  p:l=>({n:1+(l>=3?1:0),spread:0.3,spd:380,r:14,dmg:24+12*l,dt:'magic',life:1.4,vis:'bubble',col:'#6fd0ff',blast:46+6*l,st:{stun:1.2+0.2*l,wet:3}})});
def('wwhip',{cat:'skill',n:'Водяной хлыст',els:['water'],kind:'cone',mana:22,cd:3.5,
  d:'Широкий взмах водяным хлыстом перед вами: отбрасывает и мочит всех в дуге.',
  up:['Дальше','Урон выше','Шире','Урон выше'],
  p:l=>({range:150+10*l,arc:2.2,dmg:30+15*l,dt:'magic',knock:200,st:{wet:3,slow:[0.6,1]},col:'#6fd0ff',vis:'arc'})});
def('whirl',{cat:'skill',n:'Водоворот',els:['water'],kind:'tornado',mana:36,cd:11,
  d:'У прицела раскручивается огромная воронка: затягивает всех к центру и крутит.',
  up:['Шире','Сильнее тянет','Дольше','Урон выше'],
  p:l=>({n:1,r:70+6*l,pull:3,life:5+0.5*l,dps:18+8*l,dt:'magic',vis:'water'})});
def('iceprison',{cat:'skill',n:'Ледяная тюрьма',els:['water'],kind:'zone',mana:34,cd:12,
  d:'Область у прицела промерзает: все внутри замерзают, физический удар их раскалывает.',
  up:['Шире','Дольше морозит','Шире','Урон выше'],
  p:l=>({r:100+10*l,life:2.5+0.2*l,dps:10+5*l,dt:'magic',vis:'frostz',col:'#bdf0ff',st:{frz:0.6+0.15*l,wet:2}})});
def('pebbles',{cat:'skill',n:'Каменная дробь',els:['earth'],kind:'proj',mana:22,cd:3.5,
  d:'Веер каменных осколков в прицел, как выстрел дробовика: вблизи страшно бьёт.',
  up:['+1 осколок','Урон выше','+1 осколок','Урон выше'],
  p:l=>({n:5+l,spread:0.7,spd:620,r:6,dmg:14+7*l,dt:'phys',pierce:0,life:0.45,vis:'rock',col:'#c9974f',knock:160,st:{stun:0.15}})});
def('hammer',{cat:'skill',n:'Удар молотом',els:['earth'],kind:'leap',mana:30,cd:7,
  d:'Прыжок к прицелу и удар о землю при приземлении: оглушает и раскидывает всех вокруг.',
  up:['Дальше прыжок','Урон выше','Шире удар','Урон выше'],
  p:l=>({dist:260+20*l,r:90+8*l,dmg:46+22*l,dt:'phys',st:{stun:0.7+0.1*l},col:'#c9974f',knock:280,T:0.5})});
def('meteorite',{cat:'skill',n:'Метеорит',els:['earth'],kind:'blast',mana:40,cd:12,
  d:'С неба падает огромный камень: один сокрушительный удар по области.',
  up:['Шире','Урон выше','Оглушение дольше','Урон выше'],
  p:l=>({r:120+10*l,dmg:90+40*l,dt:'phys',delay:1.1,vis:'meteor',col:'#c9974f',knock:380,st:{stun:1+0.1*l},range:430})});
def('golem',{cat:'skill',n:'Каменный голем',els:['earth'],kind:'summon',mana:40,cd:18,
  d:'Призывает каменного голема: враги рядом бросаются на него, а он бьёт их кулаками.',
  up:['Прочнее','Бьёт сильнее','Дольше живёт','Бьёт сильнее'],
  p:l=>({who:'golem',life:12+l,dmg:30+14*l,acd:1.2,rng:110,taunt:true,col:'#c9974f'})});
def('ballbolt',{cat:'skill',n:'Шаровая молния',els:['air'],kind:'proj',mana:28,cd:7,
  d:'Медленный шар молнии плывёт в прицел и бьёт током всех вокруг себя по пути.',
  up:['Чаще разряды','Урон выше','Дальше летит','Урон выше'],
  p:l=>({n:1,spread:0,spd:170,r:9,dmg:30+12*l,dt:'magic',life:2.6,vis:'orb',col:'#f4f08a',pierce:99,zap:{every:0.36-0.02*l,dmg:14+7*l,range:150,jumps:1+Math.floor(l/2)}})});
def('galedash',{cat:'skill',n:'Шквальный рывок',els:['air'],kind:'dash',mana:24,cd:4.5,
  d:'Мгновенный перенос к прицелу: режет всех на линии, на выходе разлетаются клинки.',
  up:['Дальше','Урон выше','+клинки','Урон выше'],
  p:l=>({blink:true,dist:220+15*l,w:34,dmg:30+15*l,dt:'phys',col:'#8febd0',knock:160,burst:{r:70+6*l,dmg:20+10*l,dt:'phys',knock:200,col:'#8febd0',shards:{n:6+l,spd:480,dmg:14+7*l,dt:'phys',life:0.4,pierce:2,vis:'blade',col:'#8febd0'}}})});
def('hurricane',{cat:'skill',n:'Ураган',els:['air'],kind:'tornado',mana:38,cd:11,
  d:'Большой смерч срывается с места и идёт по прямой в сторону прицела, сметая всех.',
  up:['Шире','Урон выше','Дольше','Урон выше'],
  p:l=>({n:1,r:64+6*l,pull:2.2,life:3.5+0.3*l,dps:30+12*l,dt:'phys',vis:'air',straight:150})});
def('gust',{cat:'skill',n:'Отталкивающий порыв',els:['air'],kind:'cone',mana:22,cd:6,
  d:'Мощный порыв ветра конусом: отшвыривает всех врагов далеко назад.',
  up:['Дальше','Сильнее сносит','Шире','Урон выше'],
  p:l=>({range:210+15*l,arc:1.6,dmg:16+8*l,dt:'phys',knock:650+50*l,col:'#e6fff7',vis:'wind',st:{slow:[0.6,1]}})});
def('saw',{cat:'skill',n:'Дисковая пила',els:['metal'],kind:'proj',mana:24,cd:4,
  d:'Пила летит в прицел и рикошетит от врага к врагу.',
  up:['+1 рикошет','Урон выше','+1 рикошет','Урон выше'],
  p:l=>({n:1,spread:0,spd:600,r:10,dmg:30+13*l,dt:'phys',life:1.6,vis:'saw',col:'#e8eef8',pierce:1,bounce:3+l})});
def('steelwhirl',{cat:'skill',n:'Стальной вихрь',els:['metal'],kind:'orbit',mana:30,cd:9,
  d:'Вокруг вас несколько секунд кружат пилы и режут всех, кто подойдёт.',
  up:['+1 пила','Урон выше','Дольше','Шире'],
  p:l=>({n:3+Math.floor(l/2),R:52+4*l,dmg:16+8*l,dt:'phys',life:3+0.3*l,vis:'saw',col:'#e8eef8',spd:5})});
def('orbital',{cat:'skill',n:'Орбитальный удар',els:['metal'],kind:'strikes',mana:38,cd:11,
  d:'Лучи с орбиты бьют по области у прицела один за другим.',
  up:['+1 луч','Урон выше','+1 луч','Урон выше'],
  p:l=>({n:4+l,spread:120,r:56,dmg:50+22*l,dt:'phys',delay:0.5,gap:0.18,col:'#9fd0ff',st:{stun:0.3},knock:120})});
def('mines',{cat:'skill',n:'Минное поле',els:['metal'],kind:'trap',mana:28,cd:9,
  d:'Разбрасывает мины у прицела: каждая взрывается, когда враг наступит на неё.',
  up:['+1 мина','Урон выше','+1 мина','Шире взрыв'],
  p:l=>({n:3+l,spread:90,life:20,dmg:50+22*l,rad:70+5*l,dt:'phys',st:{stun:0.5},col:'#ffb347'})});
def('fruit',{cat:'skill',n:'Шипастый плод',els:['wood'],kind:'proj',mana:26,cd:5,
  d:'Колючий плод лопается на цели и разбрасывает ядовитые семена, которые сами ищут врагов.',
  up:['+семена','Яд сильнее','Шире взрыв','Урон выше'],
  p:l=>({n:1,spread:0,spd:360,r:11,dmg:30+14*l,dt:'magic',life:1,vis:'fruit',col:'#9ad16a',blast:60+6*l,st:{poison:[6+3*l,4]},burst:{n:6+l,dmg:12+6*l,vis:'seed',col:'#9ad16a',st:{poison:[5+2*l,3]},homing:true,spd:280,life:1.2}})});
def('choke',{cat:'skill',n:'Удушающие лозы',els:['wood'],kind:'grab',mana:26,cd:6,
  d:'Лозы хватают ближайших врагов, тянут к вам и опутывают. Каждый пойманный лечит вас.',
  up:['+1 лоза','Урон выше','Дольше держит','Лечит сильнее'],
  p:l=>({n:3+l,range:240+10*l,dmg:26+12*l,dt:'magic',pull:420,st:{root:1+0.15*l,poison:[4+2*l,3]},col:'#62c15a',healHit:2+l})});
def('swarm',{cat:'skill',n:'Рой ос',els:['wood'],kind:'proj',mana:30,cd:8,
  d:'Выпускает рой ос: они сами находят врагов и жалят ядом.',
  up:['+2 осы','Яд сильнее','+2 осы','Урон выше'],
  p:l=>({n:8+2*l,spread:2.4,spd:260,r:4,dmg:8+4*l,dt:'magic',life:3,pierce:0,vis:'wasp',homing:true,col:'#ffd36b',st:{poison:[4+2*l,3]}})});
def('treant',{cat:'skill',n:'Древень-страж',els:['wood'],kind:'summon',mana:40,cd:18,
  d:'Призывает древня: он стреляет ядовитыми шипами, а рядом с ним вы восстанавливаете здоровье.',
  up:['Лечит сильнее','Бьёт сильнее','Дольше живёт','Бьёт сильнее'],
  p:l=>({who:'treant',life:12+l,dmg:14+7*l,acd:0.8,rng:330,heal:2+0.8*l,col:'#62c15a'})});

/* симбиозы стихий */
def('steam',{cat:'sym',pair:['fire','water'],n:'Пар',kind:'zone',mana:42,cd:12,
  d:'Облако пара накрывает область: жжёт и замедляет врагов.',
  up:['Облако шире','Жарче','Шире и жарче','Жарче'],
  p:l=>({r:100+11*l,life:4.5,dps:34+15*l,dt:'magic',vis:'steam',col:'#dbe9f2',st:{slow:[0.55,0.6],wet:1.5}})});
def('magma',{cat:'sym',pair:['fire','earth'],n:'Магма',kind:'rain',mana:48,cd:14,
  d:'Метеориты падают вокруг цели и оставляют лаву.',
  up:['+1 метеорит','Взрыв шире, лава горячее','+1 метеорит','Мощнее'],
  p:l=>({n:3+l,spread:140,r:58+5*l,dmg:46+20*l,dt:'magic',delay:0.6,gap:0.18,vis:'meteor',col:'#ff6a2b',knock:200,st:{burn:[4+5*l,4]},zone:{r:48+4*l,life:3,dps:12+5*l,dt:'magic',vis:'lava',col:'#ff4a2a'}})});
def('firetwister',{cat:'sym',pair:['fire','air'],n:'Огненный смерч',kind:'spiral',mana:45,cd:13,
  d:'Вокруг вас раскручивается спираль огня на несколько секунд.',
  up:['+1 рукав','Быстрее и сильнее','+1 рукав','Сильнее'],
  p:l=>({life:3.2,arms:2+Math.floor(l/2),rate:0.05,spd:300,r:6,dmg:12+5*l,dt:'magic',pierce:2,plife:1,vis:'flame',col:'#ff9a3c',st:{burn:[5,2]}})});
def('molten',{cat:'sym',pair:['fire','metal'],n:'Расплав',kind:'proj',mana:46,cd:13,
  d:'Раскалённые болванки пробивают всех на пути и оставляют горящие лужи.',
  up:['+1 болванка','Лужи горячее','+1 болванка','Мощнее'],
  p:l=>({n:2+Math.ceil(l/2),spread:0.35,spd:400,r:11,dmg:42+17*l,dt:'phys',pierce:99,life:1.1,vis:'slug',col:'#ff9a3c',st:{burn:[5,3]},trail:{every:0.1,zone:{r:30,life:2.4,dps:10+4*l,dt:'magic',vis:'lava',col:'#ff4a2a'}}})});
def('wildfire',{cat:'sym',pair:['fire','wood'],n:'Лесной пожар',kind:'zone',mana:50,cd:16,
  d:'Заросли вспыхивают: огромная область сильно жжёт врагов.',
  up:['Шире','Жарче','Шире','Жарче'],
  p:l=>({r:115+10*l,life:6,dps:40+17*l,dt:'magic',vis:'wildfire',col:'#ff7a2b',st:{burn:[8+2*l,3]}})});
def('bog',{cat:'sym',pair:['water','earth'],n:'Топь',kind:'zone',mana:40,cd:12,
  d:'Вязкая топь сильно замедляет и разъедает врагов.',
  up:['Шире','Вязче','Шире','Урон выше'],
  p:l=>({r:110+12*l,life:6,dps:20+9*l,dt:'magic',vis:'bog',col:'#6fa05a',st:{slow:[0.35,0.6]}})});
def('frost',{cat:'sym',pair:['water','air'],n:'Ледяной шквал',kind:'nova',mana:44,cd:12,
  d:'Ледяной взрыв замораживает врагов и выпускает кольцо осколков.',
  up:['Заморозка дольше','+2 осколка','Шире','Заморозка дольше'],
  p:l=>({r:135+12*l,dmg:38+16*l,dt:'magic',knock:120,col:'#bdf0ff',st:{frz:0.9+0.15*l,wet:2},shards:{n:8+2*l,dmg:18+8*l,spd:300,dt:'magic',life:0.9,pierce:1,vis:'shard',col:'#bdf0ff',st:{frz:0.5}}})});
def('rust',{cat:'sym',pair:['water','metal'],n:'Ржавчина',kind:'zone',mana:38,cd:12,
  d:'Ржавое облако разъедает броню: враги получают больше физического урона.',
  up:['Шире','Ржавеет сильнее','Шире','Урон выше'],
  p:l=>({r:100+10*l,life:5,dps:18+8*l,dt:'magic',vis:'rust',col:'#c58a4a',st:{rust:6,slow:[0.75,0.6]}})});
def('lifevines',{cat:'sym',pair:['water','wood'],n:'Лоза жизни',kind:'zone',mana:40,cd:14,
  d:'Живая чаща вокруг вас лечит вас и опутывает врагов корнями.',
  up:['Шире','Лечит сильнее','Шире','Лечит сильнее'],
  p:l=>({self:true,r:105+10*l,life:6,dps:10+4*l,heal:7+3*l,dt:'magic',vis:'vines',col:'#62c15a',st:{root:0.7}})});
def('sand',{cat:'sym',pair:['earth','air'],n:'Песчаная буря',kind:'tornado',mana:44,cd:14,
  d:'Песчаный смерч затягивает врагов и перемалывает их.',
  up:['Шире и сильнее','+1 смерч','Дольше','+1 смерч'],
  p:l=>({n:1+(l>=3?1:0)+(l>=5?1:0),r:58+7*l,life:6+0.5*l,dps:26+11*l,dt:'phys',pull:2.1,vis:'sand'})});
def('citadel',{cat:'sym',pair:['earth','metal'],n:'Цитадель',kind:'struct',mana:55,cd:18,
  d:'Возводит каменные стены и стальные турели, которые стреляют по врагам.',
  up:['+1 турель','Турели сильнее','+1 турель','Турели сильнее'],
  p:l=>({turrets:2+Math.floor(l/2),walls:3,tdmg:11+5*l,tdt:'phys',tcd:0.5,life:12+l,tvis:'turret',col:'#b4c0d4'})});
def('ancientroot',{cat:'sym',pair:['earth','wood'],n:'Древний корень',kind:'blast',mana:48,cd:14,
  d:'Огромный корень вырывается из земли, оглушает и опутывает врагов.',
  up:['Шире','Урон выше','Шире','Урон выше'],
  p:l=>({r:110+10*l,dmg:72+30*l,dt:'phys',delay:0.9,vis:'root',col:'#8a6a3a',st:{root:2+0.3*l},zone:{r:100+8*l,life:3.5,dps:12+5*l,dt:'magic',vis:'thorns',col:'#62c15a',st:{root:0.5}}})});
def('railgun',{cat:'sym',pair:['air','metal'],n:'Рельсотрон',kind:'beam',mana:50,cd:11,
  d:'Мгновенный сверхмощный выстрел через весь экран и дальше: прошивает всех врагов на линии.',
  up:['Урон выше','Урон выше','Урон выше','Урон выше'],
  p:l=>({len:2600,w:50,dmg:110+52*l,dt:'phys',vis:'rail',col:'#e8eef8',st:{stun:0.4}})});
def('spores',{cat:'sym',pair:['air','wood'],n:'Пыльца',kind:'zones',mana:42,cd:13,
  d:'Облака ядовитой пыльцы дрейфуют вокруг цели и травят врагов.',
  up:['+1 облако','Яд сильнее','+1 облако','Яд сильнее'],
  p:l=>({n:3+Math.floor(l/2),spread:170,r:68+8*l,life:5,dps:18+8*l,dt:'magic',vis:'spore',col:'#a6e07a',st:{poison:[10+4*l,3],slow:[0.7,0.6]}})});
def('thornsteel',{cat:'sym',pair:['metal','wood'],n:'Терновая сталь',kind:'struct',mana:52,cd:17,
  d:'Турели-шипы выпускают пробивающие шипы и опутывают врагов.',
  up:['+1 турель','Шипы сильнее','+1 турель','Шипы сильнее'],
  p:l=>({turrets:2+Math.floor(l/2),walls:0,tdmg:15+6*l,tdt:'phys',tcd:0.55,life:12+l,tvis:'thorn',col:'#9ad16a',tst:{root:0.3}})});

/* слияния навыков: заменяют два навыка одним */
def('thunder',{cat:'fuse',a:'sand',b:'bolt',n:'Грозовой торнадо',kind:'tornado',mana:62,cd:15,
  d:'Песчаные смерчи бьют врагов молниями.',up:['Молний больше','Бьют чаще','Сильнее','Больше молний'],
  p:l=>({n:1+(l>=4?1:0),r:62+7*l,life:7,dps:30+12*l,dt:'phys',pull:2.1,vis:'storm',zap:{every:0.55,jumps:1+Math.floor(l/2),dmg:20+8*l,dt:'magic',range:150}})});
def('eruption',{cat:'fuse',a:'magma',b:'spikes',n:'Извержение',kind:'rain',mana:64,cd:15,
  d:'Из земли бьют гейзеры лавы, оглушают и оставляют пожар.',up:['+1 гейзер','Шире','+1 гейзер','Мощнее'],
  p:l=>({n:6+l,spread:170,r:62+4*l,dmg:62+26*l,dt:'magic',delay:0.5,gap:0.12,vis:'meteor',col:'#ff6a2b',knock:240,st:{burn:[8+3*l,4],stun:0.4},zone:{r:50,life:3.2,dps:16+6*l,dt:'magic',vis:'lava',col:'#ff4a2a'}})});
def('icebolt',{cat:'fuse',a:'frost',b:'bolt',n:'Ледяная молния',kind:'chain',mana:54,cd:9,
  d:'Молния замораживает цели и бьёт замёрзших в полтора раза сильнее.',up:['Цепь длиннее','Заморозка дольше','Вторая молния','Сильнее'],
  p:l=>({n:1+(l>=4?1:0),jumps:4+l,dmg:54+22*l,dt:'magic',range:200,col:'#bdf0ff',shock:true,icy:true,st:{frz:0.7+0.15*l}})});
def('boiler',{cat:'fuse',a:'steam',b:'nova',n:'Паровой котёл',kind:'nova',mana:60,cd:14,
  d:'Вспышка выпускает кольцо паровых облаков.',up:['Кольцо шире','Жарче','Шире','Жарче'],
  p:l=>({r:110+10*l,dmg:36+16*l,dt:'magic',knock:300,col:'#dbe9f2',st:{wet:2},ring:{n:5,zone:{r:52+6*l,life:3,dps:34+14*l,dt:'magic',vis:'steam',col:'#dbe9f2',st:{slow:[0.6,0.5]}}}})});
def('livebog',{cat:'fuse',a:'bog',b:'spring',n:'Живая топь',kind:'zone',mana:58,cd:16,
  d:'Огромная топь лечит вас и разъедает врагов.',up:['Шире','Лечит сильнее','Шире','Урон выше'],
  p:l=>({self:true,r:150+14*l,life:7,dps:30+12*l,heal:8+3*l,dt:'magic',vis:'livebog',col:'#3fd0a0',st:{slow:[0.4,0.6]}})});
def('infernado',{cat:'fuse',a:'firetwister',b:'sand',n:'Пылающий смерч',kind:'tornado',mana:64,cd:16,
  d:'Огненные смерчи поджигают врагов и разбрасывают искры.',up:['Горячее','Больше искр','+1 смерч','Горячее'],
  p:l=>({n:1+(l>=4?1:0),r:60+6*l,life:6.5,dps:28+12*l,dt:'magic',pull:1.8,vis:'fire',flames:{every:0.2,dmg:16+6*l,st:{burn:[8,3]}}})});
def('tesla',{cat:'fuse',a:'citadel',b:'bolt',n:'Тесла-башни',kind:'struct',mana:66,cd:18,
  d:'Башни бьют цепными молниями по ближайшим врагам.',up:['Цепь длиннее','Сильнее','+1 башня','Цепь длиннее'],
  p:l=>({turrets:l>=4?4:3,walls:0,tdmg:20+9*l,tdt:'magic',tcd:0.9,life:14,tvis:'tesla',tjumps:2+Math.floor(l/2),col:'#f4f08a'})});
def('barrage',{cat:'fuse',a:'railgun',b:'volley',n:'Артобстрел',kind:'rain',mana:62,cd:15,
  d:'Град тяжёлых снарядов обрушивается на область.',up:['+2 снаряда','Мощнее','+2 снаряда','Мощнее'],
  p:l=>({n:8+2*l,spread:200,r:46,dmg:70+30*l,dt:'phys',delay:0.55,gap:0.1,vis:'shell',col:'#e8eef8',knock:200,st:{stun:0.3}})});

const OPP={fire:'water',water:'fire',earth:'air',air:'earth',metal:'wood',wood:'metal'};
function symForbidden(id){const a=AB[id];return !!(a&&a.pair&&OPP[a.pair[0]]===a.pair[1])}
const ROLE={fireball:'бросок',flamejet:'ближний',nova:'массовый',blaze:'контроль',
  icelance:'бросок',tide:'ближний',deluge:'массовый',spring:'контроль',
  boulder:'бросок',quake:'ближний',spikes:'массовый',stoneward:'контроль',
  gale:'бросок',bladestorm:'ближний',bolt:'массовый',tailwind:'контроль',
  volley:'бросок',magnet:'ближний',shrapnel:'массовый',bastion:'контроль',
  parasites:'бросок',whip:'ближний',thornfield:'массовый',sprout:'контроль',
  fboomer:'бросок',fdash:'ближний',frain:'массовый',fwall:'контроль',
  bubble:'бросок',wwhip:'ближний',whirl:'массовый',iceprison:'контроль',
  pebbles:'бросок',hammer:'ближний',meteorite:'массовый',golem:'контроль',
  ballbolt:'бросок',galedash:'ближний',hurricane:'массовый',gust:'контроль',
  saw:'бросок',steelwhirl:'ближний',orbital:'массовый',mines:'контроль',
  fruit:'бросок',choke:'ближний',swarm:'массовый',treant:'контроль'};
const ROLEO=['бросок','ближний','массовый','контроль'];
const ROLEC={'бросок':'#ffd36b','ближний':'#ff8a6a','массовый':'#c9a6ff','контроль':'#7fe0c0'};
for(const k in ROLE)if(AB[k])AB[k].role=ROLE[k];
const SKILL_IDS=Object.keys(AB).filter(k=>AB[k].cat==='skill').sort((a,b)=>EK.indexOf(AB[a].els[0])-EK.indexOf(AB[b].els[0])||ROLEO.indexOf(AB[a].role)-ROLEO.indexOf(AB[b].role));
const SYM_IDS=Object.keys(AB).filter(k=>AB[k].cat==='sym');
const FUSE_IDS=Object.keys(AB).filter(k=>AB[k].cat==='fuse');
for(const k in AB){
  const a=AB[k];
  a.gl=a.gl||GLK[a.kind]||'gem';
  if(a.cat==='skill'){a.c1=EL[a.els[0]].c;a.c2=EL[a.els[0]].c2}
  else if(a.cat==='sym'){a.c1=EL[a.pair[0]].c;a.c2=EL[a.pair[1]].c}
  else{a.c1=AB[a.a].c1;a.c2=AB[a.b].c1}
}
/* Ульта качается обычными очками навыков; уровни ульты открываются с уровня героя (BAL.hero.ultLvReq). */
function ultNeedLv(k){return BAL.hero.ultLvReq[Math.min(k,3)-1]}
function ultCanUp(){const g=G;return !!g.ult.kind&&g.ult.lv<3&&g.p.lv>=ultNeedLv(g.ult.lv+1)}
function symFor(x,y){for(const k of SYM_IDS){const p=AB[k].pair;if((p[0]===x&&p[1]===y)||(p[0]===y&&p[1]===x))return k}return null}

/* ---------- ульты (R) ---------- */
const ULT={
  avatar:{n:'Великий симбиоз',d:'Ульта одного из изученных симбиозов: выбирается в древе.',mana:90,cd:80},
  fire:{n:'Метеоритный дождь',d:'Каскад метеоритов обрушивается на большую область у цели.',mana:90,cd:80},
  water:{n:'Цунами',d:'Гигантская волна проходит сквозь всех, отбрасывает и мочит врагов.',mana:90,cd:75},
  earth:{n:'Землетрясение',d:'Земля раскалывается по всему экрану: оглушение и тяжёлый урон.',mana:100,cd:80},
  air:{n:'Громовая буря',d:'Несколько секунд молнии сами бьют врагов вокруг. Вы быстрее.',mana:90,cd:75},
  metal:{n:'Стальной шквал',d:'Спираль пуль и две турели защищают вас несколько секунд.',mana:95,cd:80},
  wood:{n:'Пробуждение леса',d:'Лес оживает вокруг вас: корни держат врагов, чаща лечит вас.',mana:90,cd:80}
};
const ULTMOD={fire:'Лава',water:'Прилив',earth:'Оглушение',air:'Разряды',metal:'Шрапнель',wood:'Корни'};
const ULTMODD={
  fire:'огненное кольцо и лавовая лужа',water:'ледяной прилив замедляет и мочит',earth:'дополнительное оглушение',
  air:'цепные молнии из эпицентра',metal:'кольцо пуль и две турели',wood:'корни и исцеление'
};

