/* ---------- враги ---------- */
const ET={
  wisp:{n:'Огонёк',r:10,hp:14,sp:62,dmg:7,gold:1,xp:'s',col:'#8a6bd6',shape:'circle',ai:'chase',from:1,wt:10,d:'Простой преследователь. Приходит роем.'},
  swift:{n:'Налётчик',r:8,hp:8,sp:112,dmg:5,gold:1,xp:'s',col:'#d65f8e',shape:'dart',ai:'chase',from:2,wt:6,d:'Очень быстрый, но хрупкий.'},
  archer:{n:'Стрелок',r:10,hp:20,sp:55,dmg:9,gold:2,xp:'s',col:'#e0b24a',shape:'tri',ai:'ranged',rng:300,cd:2.2,from:3,wt:4,d:'Стреляет с расстояния. Уклоняйся от стрел.'},
  brute:{n:'Громила',r:17,hp:55,sp:42,dmg:14,gold:3,xp:'m',col:'#5a63d6',shape:'hex',ai:'chase',armor:6,from:5,wt:3,d:'Медленный и прочный. Броня режет физический урон.'},
  bomber:{n:'Подрывник',r:11,hp:16,sp:80,dmg:34,gold:2,xp:'m',col:'#ffb347',shape:'bomb',ai:'bomber',from:5,wt:3,d:'Подбегает и взрывается. Держи дистанцию.'},
  mage:{n:'Колдун',r:11,hp:26,sp:48,dmg:20,gold:3,xp:'m',col:'#6fa8ff',shape:'diamond',ai:'mage',rng:330,cd:3.4,mres:0.2,from:6,wt:3,d:'Накладывает на вас красные круги магического урона.'},
  shield:{n:'Щитоносец',r:16,hp:62,sp:40,dmg:12,gold:3,xp:'m',col:'#9aa7c0',shape:'shield',ai:'chase',armor:24,from:6,wt:2,d:'Почти не берёт физический урон. Бей магией.'},
  charger:{n:'Таран',r:15,hp:50,sp:50,dmg:22,gold:3,xp:'m',col:'#e0603b',shape:'wedge',ai:'charger',armor:4,from:7,wt:3,d:'Целится, затем несётся по прямой. Рывок спасёт.'},
  splitter:{n:'Слизень',r:15,hp:42,sp:52,dmg:9,gold:2,xp:'m',col:'#6bd36a',shape:'blob',ai:'chase',split:2,from:7,wt:3,d:'После смерти распадается на двоих.'},
  specter:{n:'Призрак',r:11,hp:32,sp:70,dmg:13,gold:3,xp:'m',col:'#8fd8ff',shape:'ghost',ai:'specter',mres:0.65,armor:-5,from:9,wt:3,d:'Почти неуязвим к магии, телепортируется к вам. Бей физикой.'},
  healer:{n:'Целитель',r:12,hp:36,sp:46,dmg:5,gold:4,xp:'m',col:'#69e08f',shape:'cross',ai:'healer',from:9,wt:1.5,d:'Лечит соседей. Убей первым.'},
  summoner:{n:'Призыватель',r:14,hp:60,sp:38,dmg:8,gold:5,xp:'l',col:'#b266ff',shape:'ring',ai:'summoner',from:10,wt:1.2,d:'Постоянно призывает огоньков.'},
  slimelet:{n:'Слизнёнок',r:9,hp:12,sp:70,dmg:6,gold:1,xp:'s',col:'#8be58a',shape:'blob',ai:'chase',from:99,wt:0,d:'Мелкий осколок слизня.'},
  /* враги отдельных карт */
  ember:{n:'Тлеющий',r:11,hp:20,sp:68,dmg:8,gold:1,xp:'s',col:'#ff7a3a',shape:'ember',ai:'chase',map:'ash',from:1,wt:5,onDeath:'fire',d:'Угольный дух. После смерти оставляет тлеющий очаг, который жжёт вас.'},
  sporer:{n:'Споровик',r:12,hp:24,sp:50,dmg:10,gold:2,xp:'s',col:'#9be36a',shape:'spore',ai:'ranged',rng:290,cd:2.6,shot:{spd:200,col:'#a6e07a',n:3,spread:0.55,r:6},map:'forest',from:1,wt:5,d:'Выпускает веер ядовитых спор. Прячься за деревьями.'},
  thornback:{n:'Шипоспин',r:16,hp:70,sp:38,dmg:15,armor:14,gold:3,xp:'m',col:'#4f8a3a',shape:'spike',ai:'chase',map:'forest',from:1,wt:4,d:'Медленный, бронированный, весь в шипах. Бей магией.'},
  frostling:{n:'Ледяной дух',r:11,hp:26,sp:56,dmg:12,gold:2,xp:'s',col:'#9fe0ff',shape:'crystal',ai:'ranged',rng:310,cd:2.2,shot:{spd:260,col:'#bdf0ff',n:2,spread:0.3,r:5},map:'ice',from:1,wt:5,d:'Стреляет ледяными осколками парами. Хрупкий.'},
  glacier:{n:'Глыба',r:19,hp:120,sp:30,dmg:20,armor:22,mres:0.25,gold:4,xp:'m',col:'#6fb0d8',shape:'hex',ai:'chase',map:'ice',from:1,wt:3,d:'Ледяной монолит: очень прочный и тяжёлый. Медленный.'},
  magmaling:{n:'Магмовик',r:14,hp:46,sp:46,dmg:13,gold:3,xp:'m',col:'#ff5a2b',shape:'ember',ai:'chase',map:'lava',from:1,wt:5,onDeath:'lava',d:'Кусок живой лавы. После смерти разливается лужей лавы.'},
  imp:{n:'Бес',r:10,hp:22,sp:62,dmg:14,gold:2,xp:'s',col:'#ffb347',shape:'tri',ai:'ranged',rng:300,cd:1.7,shot:{spd:330,col:'#ff9a3c',n:1,spread:0,r:5},map:'lava',from:1,wt:4,d:'Быстро швыряет огненные шары. Проворный и хрупкий.'},
  scarab:{n:'Скарабей',r:8,hp:10,sp:128,dmg:7,gold:1,xp:'s',col:'#d6b25a',shape:'beetle',ai:'chase',map:'dunes',from:1,wt:7,pack:3,d:'Быстрый жук. Всегда приходит стаей по три.'},
  scorpion:{n:'Скорпион',r:13,hp:44,sp:56,dmg:20,armor:4,gold:3,xp:'m',col:'#c4562a',shape:'beetle',ai:'charger',map:'dunes',from:1,wt:4,d:'Выжидает и делает бросок жалом по прямой. Рывок спасёт.'},
  djinn:{n:'Джинн',r:12,hp:34,sp:46,dmg:22,mres:0.2,gold:3,xp:'m',col:'#7fe0d0',shape:'ghost',ai:'mage',rng:330,cd:3.2,twin:true,map:'dunes',from:1,wt:3,d:'Накрывает вас сразу двумя красными кругами магического урона.'},
  stormcaller:{n:'Громовержец',r:13,hp:40,sp:44,dmg:26,mres:0.3,gold:4,xp:'m',col:'#f4f08a',shape:'diamond',ai:'caller',rng:340,cd:3.8,map:'storm',from:1,wt:4,d:'Призывает молнии с неба: три удара по области вокруг вас.'},
  lancer:{n:'Копейщик',r:13,hp:40,sp:58,dmg:18,armor:6,gold:3,xp:'m',col:'#c9a86a',shape:'lancer',ai:'lancer',from:8,wt:3,d:'Подходит и делает длинный выпад копьём по прямой. Линия показывает, куда бьёт.'},
  sniper:{n:'Снайпер',r:10,hp:26,sp:40,dmg:30,gold:4,xp:'m',col:'#d0d4e0',shape:'sniper',ai:'sniper',cd:4.2,from:11,wt:2.2,d:'Держится далеко. Наводит тонкий луч и через секунду бьёт очень сильно. Уйди с линии.'},
  miner:{n:'Минёр',r:11,hp:34,sp:62,dmg:24,gold:3,xp:'m',col:'#9a8a5a',shape:'miner',ai:'miner',cd:2.3,from:9,wt:2.4,d:'Кружит рядом и бросает мины под ноги. Мина взрывается через полторы секунды.'},
  banner:{n:'Знаменосец',r:13,hp:52,sp:40,dmg:10,gold:5,xp:'l',col:'#e0485c',shape:'banner',ai:'banner',from:10,wt:1.4,d:'Держится позади. Враги рядом со знаменем быстрее на 30% и бьют на 25% сильнее. Убей первым.'},
  binder:{n:'Оковщик',r:11,hp:30,sp:52,dmg:12,gold:3,xp:'m',col:'#6a8aa8',shape:'binder',ai:'ranged',rng:300,cd:2.6,shot:{spd:240,col:'#9fd0ff',n:1,spread:0,r:7,fx:'slow'},from:7,wt:2.5,d:'Стреляет цепными зарядами: попадание замедляет вас на 2 секунды.'},
  berserker:{n:'Берсерк',r:14,hp:60,sp:46,dmg:16,gold:3,xp:'m',col:'#c0392b',shape:'berserker',ai:'chase',rage:true,from:8,wt:3,d:'Чем меньше у него здоровья, тем быстрее и злее он становится. Добивай одним ударом.'},
  hound:{n:'Пепельная гончая',r:10,hp:24,sp:105,dmg:10,gold:2,xp:'s',col:'#9a8a8a',shape:'hound',ai:'charger',chw:0.35,chs:640,map:'ash',pack:2,from:1,wt:4,d:'Быстрая и злая: коротко замирает и прыгает. Ходит парой.'},
  dryad:{n:'Дриада',r:12,hp:38,sp:44,dmg:18,gold:3,xp:'m',col:'#7ad07a',shape:'dryad',ai:'curser',curse:'roots',rng:320,cd:3.6,map:'forest',from:1,wt:3,d:'Призывает корни под вами. Корни ранят и держат на месте, рывок освобождает.'},
  frostwitch:{n:'Вьюжница',r:12,hp:36,sp:46,dmg:14,gold:3,xp:'m',col:'#aee8ff',shape:'frostwitch',ai:'curser',curse:'chill',rng:320,cd:3.2,mres:0.15,map:'ice',from:1,wt:3,d:'Накрывает вас кругом стужи: урон и сильное замедление.'},
  ogre:{n:'Лавовый огр',r:20,hp:150,sp:36,dmg:26,armor:8,gold:5,xp:'l',col:'#c8441a',shape:'ogre',ai:'slammer',map:'lava',from:1,wt:2.2,d:'Огромный и медленный. Бьёт кулаком по земле и оставляет на месте удара огонь.'},
  sandworm:{n:'Песчаный червь',r:15,hp:70,sp:66,dmg:24,gold:4,xp:'m',col:'#d9b36a',shape:'sandworm',ai:'burrow',map:'dunes',from:1,wt:3,d:'Зарывается в песок и неуязвим, затем вырывается из-под земли там, где вы стояли. Следи за кругом.'},
  stormknight:{n:'Громовой рыцарь',r:15,hp:80,sp:46,dmg:22,armor:12,mres:0.15,gold:4,xp:'m',col:'#cfd8ff',shape:'stormknight',ai:'zapper',cd:4.2,map:'storm',from:1,wt:2.6,d:'Тяжёлый рыцарь в броне. Быстро вызывает молнию прямо на вас.'},
  ironwraith:{n:'Железный призрак',r:12,hp:48,sp:68,dmg:17,armor:18,mres:0.1,gold:3,xp:'m',col:'#8ea0c4',shape:'ghost',ai:'specter',map:'storm',from:1,wt:4,d:'Закованный в железо призрак: телепортируется к вам. Магия работает лучше.'}
};
const EDT={wisp:'magic',swift:'phys',archer:'phys',brute:'phys',bomber:'magic',mage:'magic',shield:'phys',charger:'phys',splitter:'magic',specter:'magic',healer:'magic',summoner:'magic',slimelet:'magic',
  ember:'magic',sporer:'magic',thornback:'phys',frostling:'magic',glacier:'phys',magmaling:'magic',imp:'magic',scarab:'phys',scorpion:'phys',djinn:'magic',stormcaller:'magic',ironwraith:'phys',
  lancer:'phys',sniper:'phys',miner:'phys',banner:'magic',binder:'magic',berserker:'phys',hound:'phys',dryad:'phys',frostwitch:'magic',ogre:'phys',sandworm:'phys',stormknight:'magic'};
for(const k in EDT)ET[k].dt=EDT[k];
const ET_KEYS=Object.keys(ET).filter(k=>ET[k].from<99);
const AFFIX={
  bulwark:{n:'Бронированный',d:'+16 к броне'},swift:{n:'Быстрый',d:'+45% скорость'},
  volatile:{n:'Взрывной',d:'Взрывается после смерти'},regen:{n:'Живучий',d:'Лечится сам'}
};
const BOSS={
  guard:{n:'Страж Пустоты',r:36,hp:1500,sp:50,dmg:22,col:'#a83bd0',armor:6,mres:0.1,shape:'star',
    pats:['ring','slam','blink','summon'],p2:['charge','voidrain','ring','blink'],d:'Круги пуль, удары по площади, телепорт к вам и призыв. Во второй фазе — дождь пустоты и рывки.'},
  golem:{n:'Железный Колосс',r:44,hp:4200,sp:44,dmg:28,col:'#8a98b8',armor:22,mres:0,shape:'block',
    pats:['slam','rockfall','magnet','line','summon'],p2:['fortify','rockfall','ring','magnet'],d:'Почти не берёт физический урон. Притягивает магнитом и бьёт с размаху, укрепляет броню, лучи и камнепады.'},
  ent:{n:'Древний Энт',r:44,hp:2800,sp:34,dmg:24,col:'#4a8a3a',armor:14,mres:0.15,shape:'ent',
    pats:['roots','slam','summon','thornwall'],p2:['roots','heal','ring','thornwall'],d:'Живой лес. Корни, вырывающиеся под вами, удары по площади и призыв споровиков. Стены шипов крестом. Во второй фазе лечится соком жизни, пока рядом его слуги.'},
  queen:{n:'Ледяная Королева',r:38,hp:4200,sp:42,dmg:26,col:'#9fe0ff',armor:8,mres:0.3,shape:'queen',
    pats:['shards','nova','line','blizzard','summon'],p2:['mirror','shards','blizzard','slam'],d:'Веер ледяных игл, круг стужи, лучи холода, метель над вами и ледяные отражения-элиты.'},
  sandlord:{n:'Песчаный Владыка',r:46,hp:6400,sp:40,dmg:30,col:'#e0b24a',armor:12,mres:0.1,shape:'sandlord',
    pats:['erupt','charge','burrow','summon'],p2:['sandstorm','burrow','line','erupt'],d:'Извержения кольцами, броски, уходит под песок и выныривает под вами, песчаная буря замедляет. Не стойте на месте.'},
  devourer:{n:'Пожиратель Стихий',r:52,hp:9500,sp:46,dmg:32,col:'#d94a7a',armor:10,mres:0.25,shape:'maw',
    pats:['spiral','rockfall','blackhole','summon','charge','line'],p2:['blink','ring','voidrain','blackhole','slam'],d:'Финальный босс. Спирали, чёрные дыры, телепорты, огонь пустоты и армия слуг.'}
};

