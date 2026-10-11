/* ---------- предметы ---------- */
const ITEMS={};
function it(id,o){o.id=id;ITEMS[id]=o;return o}
const STN={dch:'заряд рывка',drc:'скорость перезарядки рывка',hp:'макс. здоровье',regen:'здоровья/с',mana:'макс. мана',mreg:'маны/с',magnet:'радиус подбора',dm:'урон',spd:'скорость',cdr:'скорость способностей',area:'размах',crit:'шанс крита',armor:'броня',mres:'сопр. магии',xpm:'опыт',gold:'золото',ls:'вампиризм',thorns:'отражение',ultcd:'откат ульты'};
const STPCT={drc:1,magnet:1,dm:1,spd:1,cdr:1,area:1,crit:1,mres:1,xpm:1,gold:1,ls:1,thorns:1,ultcd:1};
function statLine(st){
  const out=[];
  for(const k in st){const v=st[k];out.push((v<0?'−':'+')+(STPCT[k]?Math.round(Math.abs(v)*100)+'%':(v%1?Math.abs(v).toFixed(1):Math.abs(v)))+' '+STN[k])}
  return out.join(', ');
}
/* Кузнец: пассивные предметы */
it('shield1',{n:'Железный щит',gl:'shield',price:90,st:{hp:20,armor:6},d:'Крепкий щит из холодного железа.',c:['#6b7691','#b4c0d4']});
it('mail',{n:'Кольчуга',gl:'shield',price:180,st:{armor:12,hp:30},d:'Плотная кольчуга. Хорошо держит физический урон.',c:['#5b6786','#9fb0d0']});
it('blade',{n:'Клинок ярости',gl:'sword',price:150,st:{dm:0.16},d:'Усиливает весь урон.',c:['#a3442f','#ff8a5c']});
it('boots',{n:'Сапоги бегуна',gl:'boots',price:120,st:{spd:0.14},d:'Лёгкие сапоги для долгих забегов.',c:['#4a7f60','#8febd0']});
it('heart',{n:'Сердце титана',gl:'heart',price:200,st:{hp:70,regen:1.2},d:'Бьётся медленно и мощно.',c:['#9a2e45','#ff6b7f']});
it('thorn',{n:'Шипастый доспех',gl:'shield',price:170,st:{armor:8,thorns:0.35},d:'Отражает часть урона ближнего боя обратно в обидчика.',c:['#5a7a3a','#b6ee8a']});
it('mace',{n:'Булава крови',gl:'sword',price:190,st:{dm:0.1,ls:0.06},d:'Каждый удар немного лечит вас.',c:['#8a2a3a','#e0485c']});
it('gaunt',{n:'Перчатки стрелка',gl:'fist',price:160,st:{crit:0.1,cdr:0.08},d:'Точность и скорость.',c:['#8a6a2a','#ffd36b']});
it('jetsole',{n:'Реактивные подошвы',gl:'boots',price:230,st:{dch:1},d:'Второй заряд рывка: можно рвануть дважды подряд.',c:['#2f7a6a','#8febd0']});
it('springs',{n:'Пружинные сапоги',gl:'boots',price:170,st:{drc:0.3,spd:0.05},d:'Рывок перезаряжается на 30% быстрее.',c:['#4a7f60','#b6ffd8']});
it('anvil',{n:'Наковальня титана',gl:'shield',price:380,st:{dm:0.22,armor:14},d:'Тяжёлая реликвия кузнецов.',c:['#4a5575','#ff8a5c']});
it('plate',{n:'Латные доспехи',gl:'shield',price:340,st:{armor:22,hp:60,mres:0.1},d:'Тяжёлая броня полного покрытия.',c:['#5b6786','#c9d4ea']});
it('greaves',{n:'Поножи ветра',gl:'boots',price:260,st:{spd:0.2,armor:6,cdr:0.05},d:'Лёгкие и быстрые: бегать станет намного проще.',c:['#3a7a6a','#8febd0']});
it('reaper',{n:'Коса жнеца',gl:'sword',price:360,st:{dm:0.3,crit:0.08},d:'Огромный прирост урона и немного критов.',c:['#7a2a3a','#ff6b7f']});
it('vitality',{n:'Камень жизни',gl:'heart',price:320,st:{hp:150,regen:2.5},d:'Толстая шкура и быстрая регенерация.',c:['#9a2e45','#ff8fa0']});
it('spikedshield',{n:'Шипастый бастион',gl:'shield',price:380,st:{armor:14,thorns:0.7,hp:40},d:'Отражает большую часть урона ближнего боя.',c:['#5a7a3a','#b6ee8a']});
it('warhammer',{n:'Молот войны',gl:'sword',price:440,st:{dm:0.36,area:0.15},d:'Удары и способности больше и сильнее.',c:['#8a4a2a','#ffb347']});
it('dragonscale',{n:'Чешуя дракона',gl:'shield',price:520,st:{armor:18,mres:0.3,hp:90},d:'Защищает и от стали, и от магии.',c:['#8a2a2a','#ff9a6b']});
/* Алхимик: расходники и активные предметы */
it('salve',{n:'Малое лечение',gl:'potion',price:45,ch:3,cd:1,cast:{kind:'heal',amt:90},d:'Мгновенно восстанавливает 90 здоровья. 3 заряда.',c:['#9a2e45','#ff8fa0']});
it('mpot',{n:'Зелье маны',gl:'potion',price:45,ch:3,cd:1,cast:{kind:'mana',amt:70},d:'Мгновенно восстанавливает 70 маны. 3 заряда.',c:['#2c4fa3','#78aeff']});
it('regenp',{n:'Склянка восстановления',gl:'potion',price:70,ch:2,cd:1,cast:{kind:'buff',dur:8,regen:9},d:'+9 здоровья в секунду на 8 секунд. 2 заряда.',c:['#2f7a4a','#6fe3a0']});
it('rage',{n:'Эликсир ярости',gl:'potion',price:90,ch:2,cd:1,cast:{kind:'buff',dur:10,dm:0.45},d:'+45% урона на 10 секунд. 2 заряда.',c:['#a3442f','#ffb347']});
it('stone',{n:'Зелье каменной кожи',gl:'potion',price:80,ch:2,cd:1,cast:{kind:'buff',dur:10,armor:20},d:'+20 брони на 10 секунд. 2 заряда.',c:['#7a5a2a','#e8c98f']});
it('molotov',{n:'Огненный флакон',gl:'bomb',price:100,ch:4,cd:1.2,cast:{kind:'blast',r:90,dmg:70,dt:'magic',delay:0.35,range:480,vis:'meteor',col:'#ff6a2b',knock:160,st:{burn:[10,4]}},d:'Бросок в точку прицела: взрыв и поджог. 4 заряда.',c:['#a3442f','#ff9a3c']});
it('venom',{n:'Ядовитая бомба',gl:'bomb',price:100,ch:3,cd:1.2,cast:{kind:'zone',r:95,life:5,dps:36,dt:'magic',range:480,vis:'spore',col:'#a6e07a',st:{poison:[12,3],slow:[0.75,0.6]}},d:'Облако яда в точке прицела на 5 секунд. 3 заряда.',c:['#4a7a2a','#a6e07a']});
it('haste',{n:'Эликсир ветра',gl:'potion',price:70,ch:2,cd:1,cast:{kind:'buff',dur:8,spd:0.4},d:'+40% скорости на 8 секунд. 2 заряда.',c:['#2f7a6a','#8febd0']});
it('tonic',{n:'Тоник вампира',gl:'potion',price:110,ch:2,cd:1,cast:{kind:'buff',dur:12,ls:0.25},d:'+25% вампиризма на 12 секунд. 2 заряда.',c:['#6a2a5a','#e05fb0']});
it('philos',{n:'Философский камень',gl:'gem',price:340,st:{regen:3,mana:60,mreg:2},d:'Здоровье и мана текут рекой.',c:['#8a6a2a','#ffd36b']});
it('bloodvial',{n:'Кровавая колба',gl:'potion',price:290,st:{ls:0.13,hp:60},d:'Часть нанесённого урона возвращается здоровьем.',c:['#8a1a2a','#ff5a6b']});
it('hermes',{n:'Крылья Гермеса',gl:'boots',price:310,st:{spd:0.24,cdr:0.1},d:'Невероятная скорость и быстрые способности.',c:['#2f7a6a','#bdfff0']});
/* Чародей: активные способности и мана */
it('staffbolt',{n:'Посох молний',gl:'staff',price:260,st:{mana:40},cd:7,mana:40,cast:{kind:'chain',n:1,jumps:5,dmg:70,dt:'magic',range:190,col:'#f4f08a',shock:true},d:'Активная цепная молния.',c:['#8a7a1a','#f4f08a']});
it('wandfrost',{n:'Жезл мороза',gl:'staff',price:240,st:{mreg:1},cd:10,mana:45,cast:{kind:'nova',r:150,dmg:60,dt:'magic',knock:120,col:'#bdf0ff',st:{frz:1.4,wet:2}},d:'Активная ледяная волна вокруг вас.',c:['#2c6a8a','#bdf0ff']});
it('blinkd',{n:'Блинк-кинжал',gl:'blink',price:300,cd:11,cast:{kind:'blink',range:360},d:'Мгновенный бросок к точке прицела (до 360).',c:['#5a3a9a','#b79bff']});
it('orbmana',{n:'Сфера маны',gl:'mana',price:190,st:{mana:80,mreg:1.8},d:'Большой запас маны и быстрое восстановление.',c:['#2c4fa3','#78aeff']});
it('cloak',{n:'Плащ мага',gl:'shield',price:160,st:{mres:0.35,hp:20},d:'Магические удары ранят заметно слабее.',c:['#3a2a8a','#9a8aff']});
it('ward',{n:'Сфера отражения',gl:'shield',price:280,cd:22,mana:30,cast:{kind:'block',dur:8},d:'Активная: поглощает следующий полученный удар в течение 8 секунд.',c:['#2c8a8a','#7fe6ff']});
it('ultgem',{n:'Кристалл ульты',gl:'gem',price:260,st:{ultcd:0.22,mana:30},d:'Ульта заряжается заметно быстрее.',c:['#8a2a8a','#ff8aff']});
it('ringmind',{n:'Кольцо ритма',gl:'ring',price:210,st:{cdr:0.14,mreg:1},d:'Способности и атаки быстрее.',c:['#2a7a8a','#8febd0']});
it('ultscroll',{n:'Свиток силы',gl:'scroll',price:300,scroll:'ultup',d:'Даёт 1 очко ульты: открыть ульту раньше, поднять её уровень или открыть печать.',c:['#8a6a1a','#ffd36b']});
it('archstaff',{n:'Посох архимага',gl:'staff',price:400,st:{dm:0.22,mana:100,cdr:0.1},d:'Власть над маной и силой заклинаний.',c:['#5a3a9a','#c9b3ff']});
it('runering',{n:'Руническое кольцо',gl:'ring',price:330,st:{area:0.28,cdr:0.1},d:'Способности накрывают заметно больше.',c:['#2a7a8a','#8febd0']});
it('arcanebook',{n:'Книга тайн',gl:'scroll',price:360,st:{xpm:0.22,mreg:3,mana:60},d:'Знания дают опыт и ману.',c:['#3a2a8a','#9a8aff']});
it('prism',{n:'Призма разума',gl:'gem',price:420,st:{dm:0.3,mres:0.25},d:'Концентрирует силу и защищает от магии.',c:['#8a2a8a','#ff8aff']});
it('ultheart',{n:'Сердце ульты',gl:'heart',price:350,st:{ultcd:0.35,dm:0.1},d:'Ульта заряжается почти вдвое быстрее.',c:['#8a2a5a','#ff8ad0']});
/* Контрабандист: редкое */
it('aegis',{n:'Эгида',gl:'heart',price:520,revive:true,d:'Один раз спасает от смерти: вы воскресаете с половиной здоровья. Исчезает после срабатывания.',c:['#8a6a1a','#ffd36b']});
it('fang',{n:'Клык вампира',gl:'sword',price:340,st:{ls:0.14,dm:0.08},d:'Сильный вампиризм.',c:['#8a2a3a','#ff6b7f']});
it('purse',{n:'Кошель жадности',gl:'coin',price:260,st:{gold:0.3,xpm:0.1},d:'Больше золота и опыта.',c:['#8a6a1a','#ffd36b']});
it('compass',{n:'Компас-магнит',gl:'magnet',price:220,st:{magnet:0.6},cd:45,cast:{kind:'vacuum'},d:'Радиус подбора больше. Активный: все кристаллы и монеты летят к вам.',c:['#8a2a3a','#ff6b7f']});
it('hourglass',{n:'Песочные часы',gl:'clock',price:360,cd:40,cast:{kind:'slowAll',f:0.4,t:6},d:'Активные: замедляют всех врагов на экране на 6 секунд.',c:['#6a5a2a','#e8c98f']});
it('voidb',{n:'Бомба пустоты',gl:'bomb',price:260,ch:2,cd:1.5,cast:{kind:'nuke',dmg:180,dt:'pure'},d:'Наносит 180 чистого урона всем врагам на экране. 2 заряда.',c:['#3a2a5a','#b79bff']});
it('crown',{n:'Корона мудрости',gl:'crown',price:300,st:{xpm:0.25,dm:0.1},d:'Больше опыта и урона.',c:['#8a6a1a','#ffd36b']});
it('storm',{n:'Сердце бури',gl:'heart',price:320,st:{spd:0.1,cdr:0.1},cd:25,cast:{kind:'buff',dur:4,spd:0.45,dash:true},d:'Активное: рывок восстанавливается, скорость +45% на 4 секунды.',c:['#2f7a6a','#8febd0']});
it('bulwark',{n:'Бастион',gl:'shield',price:400,st:{armor:16,mres:0.2},cd:40,cast:{kind:'buff',dur:4,shield:true},d:'Активный: 4 секунды полной неуязвимости.',c:['#5a6786','#b4c0d4']});
it('luckycoin',{n:'Монета удачи',gl:'coin',price:290,st:{gold:0.45,crit:0.12},d:'Много золота и критов.',c:['#8a6a1a','#ffd36b']});
it('berserk',{n:'Маска берсерка',gl:'crown',price:460,st:{dm:0.42,ls:0.1},d:'Дикая сила и вампиризм.',c:['#8a2a2a','#ff6b4a']});
it('colossus',{n:'Сердце колосса',gl:'heart',price:540,st:{hp:230,armor:10,regen:3},d:'Огромный запас здоровья.',c:['#7a2a3a','#ff8fa0']});
it('goldheart',{n:'Золотое сердце',gl:'heart',price:720,st:{hp:140,regen:2.5,gold:0.25},d:'Магнатская роскошь: здоровье, восстановление и золото.',c:['#8a6a1a','#ffe08a']});
it('midasring',{n:'Перстень Мидаса',gl:'crown',price:800,st:{dm:0.2,gold:0.3,crit:0.05},d:'Всё, к чему вы прикасаетесь, бьёт сильнее и приносит золото.',c:['#8a5a1a','#ffd36b']});
it('chronolens',{n:'Хронолинза',gl:'clock',price:760,st:{cdr:0.18,mreg:3,drc:0.25},d:'Способности и рывок восстанавливаются заметно быстрее.',c:['#3a5a8a','#9fe0ff']});
it('warlord',{n:'Знамя полководца',gl:'shield',price:840,st:{dm:0.16,armor:6,magnet:0.4,spd:0.06},d:'Урон, броня, скорость и притяжение добычи.',c:['#7a2a2a','#ff9a8a']});
it('stormgem',{n:'Камень бури',gl:'gem',price:400,st:{crit:0.2,cdr:0.18},d:'Критические удары и скорость способностей.',c:['#2a6a8a','#7fe6ff']});
/* уникальные предметы с особыми эффектами */
it('thundercrown',{n:'Венец громовержца',gl:'crown',price:640,rar:4,st:{dm:0.1,crit:0.05},fx:'thunder',d:'Каждые 2,5 с молния с неба бьёт самого живучего врага рядом. Мокрых — электрошоком.',c:['#8a7a1a','#f4f08a']});
it('echoorb',{n:'Сфера эха',gl:'gem',price:700,rar:4,st:{cdr:0.1,mana:40},fx:'echo',d:'Каждый 4-й применённый навык мгновенно перезаряжается.',c:['#3a2a8a','#9fe0ff']});
it('phoenix',{n:'Перо феникса',gl:'feather',price:660,rar:4,st:{regen:2,hp:40},fx:'phoenix',d:'Когда здоровья меньше 30%: огненный взрыв вокруг и лечение 35% здоровья. Раз в 60 с.',c:['#a3442f','#ffb347']});
it('flamering',{n:'Кольцо пожара',gl:'ring',price:430,rar:3,st:{area:0.1,dm:0.06},fx:'aura',d:'Враги ближе 120 к вам постоянно горят.',c:['#a3442f','#ff9a3c']});
it('frostheart',{n:'Ледяное сердце',gl:'heart',price:450,rar:3,st:{hp:60,armor:6},fx:'frost',d:'Когда вас бьют вблизи, обидчик и враги вокруг замерзают на 1,2 с. Раз в 4 с.',c:['#2c6a8a','#bdf0ff']});
it('shadowcloak',{n:'Плащ тени',gl:'cloak',price:390,rar:3,st:{spd:0.08,crit:0.05},fx:'shadow',d:'После рывка 2,5 с ваш урон +50%.',c:['#2a2440','#b79bff']});
it('venomfang',{n:'Ядовитый клык',gl:'blink',price:280,rar:2,st:{dm:0.08},fx:'venom',d:'Каждое ваше попадание отравляет врага.',c:['#4a7a2a','#a6e07a']});
it('bloodpact',{n:'Кровавый договор',gl:'scroll',price:300,rar:2,st:{dm:0.35,hp:-40},d:'Огромный урон ценой здоровья.',c:['#5a0f1a','#ff4a5a']});
/* свитки способностей: по одному на каждую способность */
for(const k in AB){
  const a=AB[k];
  it('scr:'+k,{n:'Свиток: '+a.n,gl:'scroll',price:a.cat==='skill'?150:a.cat==='sym'?230:420,scroll:k,dyn:true,
    d:'Мгновенно изучает «'+a.n+'» (1 уровень) в свободный слот хотбара. Условия стихий не нужны.',c:[a.c1,a.c2]});
}
for(const k in ITEMS){
  const o=ITEMS[k];
  if(!o.c)o.c=['#4a5575','#8d99b8'];
  if(o.rar===undefined)o.rar=o.price>=600?4:o.price>=380?3:o.price>=250?2:o.price>=140?1:0;
  o.tag=o.scroll?'Свиток':o.revive?'Пассивный':o.ch?'Расходник':(o.cast&&o.st)?'Предмет + способность':o.cast?'Активный':'Пассивный';
}
const MERCH={
  smith:{n:'Кузнец Бронн',q:'Сталь не врёт. Бери, пока горячая.',col:'#ff8a5c',pool:['shield1','mail','blade','boots','heart','thorn','mace','gaunt','anvil','plate','greaves','reaper','vitality','spikedshield','warhammer','dragonscale','jetsole','springs','frostheart'],cnt:5},
  alch:{n:'Алхимик Мирра',q:'Всё свежее. Почти.',col:'#6fe3a0',pool:['salve','mpot','regenp','rage','stone','molotov','venom','haste','tonic','philos','bloodvial','hermes'],cnt:6},
  mage:{n:'Чародей Эзра',q:'Мана течёт к тем, кто умеет слушать.',col:'#9a8aff',pool:['staffbolt','wandfrost','blinkd','orbmana','cloak','ward','ultgem','ringmind','ultscroll','archstaff','runering','arcanebook','prism','ultheart','flamering'],cnt:5,scrolls:2},
  sage:{n:'Мастер перемен Ксандр',q:'Забудь старое — освободи место новому.',col:'#6fd6d0',pool:[],cnt:0,special:'swap'},
  tycoon:{n:'Магнат Мидас',q:'Деньги любят тех, кто умеет их тратить.',col:'#f0a8ff',pool:['goldheart','midasring','chronolens','warlord','echoorb','phoenix'],cnt:3,special:'invest'},
  smug:{n:'Контрабандист Рогар',q:'Я вам этого не продавал.',col:'#ffd36b',pool:['aegis','fang','purse','compass','hourglass','voidb','crown','storm','bulwark','luckycoin','berserk','colossus','stormgem','thundercrown','shadowcloak','venomfang','bloodpact'],cnt:4,fscroll:1}
};
const INVEST=[
  {k:'hp',n:'Закалка тела',d:'+30 максимума здоровья',st:{hp:30},p:150},
  {k:'dm',n:'Закалка силы',d:'+5% урона',st:{dm:0.05},p:220},
  {k:'cdr',n:'Отточенная магия',d:'+4% скорости способностей',st:{cdr:0.04},p:200},
  {k:'armor',n:'Закалённая броня',d:'+2 брони',st:{armor:2},p:160},
  {k:'crit',n:'Верный глаз',d:'+3% шанса критического удара',st:{crit:0.03},p:200},
  {k:'mreg',n:'Поток маны',d:'+0,8 маны в секунду',st:{mreg:0.8},p:170}
];
const INV_MAX=5;
const MKEYS=Object.keys(MERCH);

