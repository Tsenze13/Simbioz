/* ---------- ДРЕВА НАВЫКОВ ---------- */
function later(t,fn){G.later.push({t:t,fn:fn})}
const NS=(n,d,pr,hk)=>({n:n,d:d,pr:pr||null,hk:hk||null});
const mulK=(p,ks,f)=>{for(const k of ks)if(typeof p[k]==='number')p[k]*=f};
const addSt=(p,st)=>{p.st=Object.assign({},p.st||{},st)};
const TREE={
 fboomer:[
  NS('Двойной бумеранг','Летит ещё один бумеранг.',(p,r)=>{p.n+=r;p.spread=0.6}),
  NS('Огненный след','Бумеранг оставляет за собой полосу огня.',(p,r)=>{p.trail={every:0.08,zone:{r:26,life:1.6+0.4*r,dps:10+6*r,dt:'magic',vis:'lava',col:'#ff4a2a'}}}),
  NS('Раскалённый','Крупнее и бьёт сильнее.',(p,r)=>{p.r*=1+0.2*r;mulK(p,['dmg'],1+0.3*r)})],
 fdash:[
  NS('Взрыв в конце','В конце рывка — огненный взрыв.',(p,r)=>{p.end={r:80+10*r,dmg:40+25*r,dt:'magic',col:'#ff7a2b',knock:260,st:{burn:[8,3]}}}),
  NS('Пламенная ярость','Рывок восстанавливается быстрее.',(p,r)=>{p.cdm*=1-0.18*r}),
  NS('Огненный щит','После рывка вы неуязвимы ещё мгновение.',null,r=>[{t:'buff',shield:true,dur:0.6+0.4*r}])],
 frain:[
  NS('Долгий дождь','Больше волн огня.',(p,r)=>{p.waves+=r}),
  NS('Пепелище','На месте дождя горит земля.',null,r=>[{t:'zone',r:120,life:3+r,dps:12+7*r,col:'#ff4a2a',vis:'lava',st:{burn:[6,2]}}]),
  NS('Метеорит','В конце падает метеорит.',null,r=>[{t:'quake',d:2.2,r:110,dmg:80+40*r,dt:'magic',col:'#ff6a2b',knock:300}])],
 fwall:[
  NS('Длинная стена','Стена намного длиннее.',(p,r)=>{p.n+=3*r}),
  NS('Кольцо огня','Вокруг вас вспыхивает кольцо пламени.',null,r=>[{t:'cast',self:true,kind:'nova',pr:{r:120,dmg:20+10*r,dt:'magic',col:'#ff7a2b',knock:150,ring:{n:8,zone:{r:30,life:3+r,dps:14+7*r,dt:'magic',vis:'wildfire',col:'#ff7a2b'}}}}]),
  NS('Жар стены','Стена жжёт сильнее и сильнее замедляет.',(p,r)=>{mulK(p,['dps'],1+0.3*r);addSt(p,{slow:[0.6-0.08*r,0.6]})})],
 bubble:[
  NS('Пузырьки','Лопнувший пузырь разлетается мелкими пузырями.',(p,r)=>{p.burst={n:4+2*r,dmg:14+8*r,vis:'ice',col:'#9fe0ff',st:{wet:2,slow:[0.6,1]}}}),
  NS('Глубокая вода','Держит намного дольше.',(p,r)=>{p.st=Object.assign({},p.st,{stun:p.st.stun+0.4*r})}),
  NS('Двойной пузырь','Летит больше пузырей.',(p,r)=>{p.n+=r;p.spread=0.45})],
 wwhip:[
  NS('Двойной взмах','Сразу следом второй взмах.',null,r=>[{t:'echo',d:0.25,s:0.6+0.15*r}]),
  NS('Широкий взмах','Шире и дальше.',(p,r)=>{p.arc*=1+0.2*r;p.range*=1+0.15*r}),
  NS('Цунами','Отбрасывает намного дальше и бьёт сильнее.',(p,r)=>{p.knock*=1+0.6*r;mulK(p,['dmg'],1+0.2*r)})],
 whirl:[
  NS('Глубина','Шире и сильнее тянет.',(p,r)=>{p.pull*=1+0.3*r;p.r*=1+0.15*r}),
  NS('Шторм','Из воронки бьют молнии по мокрым врагам.',(p,r)=>{p.zap={every:0.6-0.1*r,jumps:1+r,dmg:20+10*r,dt:'magic',range:160}}),
  NS('Разлив','Вокруг остаётся вязкая вода.',null,r=>[{t:'zone',r:150,life:4+r,dps:6+4*r,col:'#3aa7ff',vis:'bog',st:{slow:[0.45,1],wet:3}}])],
 iceprison:[
  NS('Раскол','Когда тюрьма тает, лёд взрывается и раскалывает врагов.',null,r=>[{t:'quake',d:2.4,r:120,dmg:60+30*r,dt:'phys',col:'#bdf0ff'}]),
  NS('Шире','Тюрьма больше.',(p,r)=>{p.r*=1+0.25*r}),
  NS('Ледяные шипы','Из тюрьмы вылетают ледяные осколки.',null,r=>[{t:'shards',n:8+2*r,dmg:18+9*r,col:'#bdf0ff',st:{frz:0.3},at:'tp'}])],
 pebbles:[
  NS('Крупная дробь','Осколки крупнее и бьют сильнее.',(p,r)=>{p.r*=1+0.3*r;mulK(p,['dmg'],1+0.25*r)}),
  NS('Рикошет','Осколки отскакивают в соседних врагов.',(p,r)=>{p.bounce=r;p.pierce=1}),
  NS('Обвал','У прицела обрушиваются камни.',null,r=>[{t:'meteor',n:2+r,dmg:36+18*r,r:50,spread:110,vis:'spike',col:'#d9b36a',st:{stun:0.4}}])],
 hammer:[
  NS('Разлом','На месте удара остаётся трещина, замедляющая врагов.',(p,r)=>{p.zone={r:100,life:3+r,dps:10+6*r,dt:'phys',vis:'sandz',col:'#c9974f',st:{slow:[0.5,0.8]}}}),
  NS('Осколки','При приземлении разлетаются осколки камня.',(p,r)=>{p.shards={n:8+2*r,spd:420,dmg:16+8*r,dt:'phys',life:0.5,pierce:2,vis:'rock',col:'#d9b36a'}}),
  NS('Тяжёлое приземление','Удар шире и сильнее.',(p,r)=>{p.r*=1+0.2*r;mulK(p,['dmg'],1+0.25*r)})],
 meteorite:[
  NS('Кратер','Остаётся кратер, где враги вязнут.',null,r=>[{t:'zone',r:130,life:4+r,dps:8+5*r,col:'#c9974f',vis:'sandz',st:{slow:[0.45,0.8]},at:'tp'}]),
  NS('Град камней','Вокруг падают ещё камни.',null,r=>[{t:'meteor',n:3+2*r,dmg:40+20*r,r:50,spread:170,vis:'spike',col:'#d9b36a',st:{stun:0.3}}]),
  NS('Звезда','Огромный и сокрушительный.',(p,r)=>{p.r*=1+0.15*r;mulK(p,['dmg'],1+0.35*r)})],
 golem:[
  NS('Гранитная шкура','Голем живёт дольше.',(p,r)=>{p.life*=1+0.35*r}),
  NS('Сотрясение','Удары голема оглушают дольше и бьют сильнее.',(p,r)=>{p.st={stun:0.4+0.2*r};mulK(p,['dmg'],1+0.25*r)}),
  NS('Каменный союз','Пока голем стоит, у вас больше брони.',null,r=>[{t:'buff',armor:4+3*r,dur:10}])],
 ballbolt:[
  NS('Взрыв шара','В конце пути шар взрывается.',null,r=>[{t:'quake',d:2.4,r:100,dmg:60+30*r,dt:'magic',col:'#f4f08a',st:{stun:0.4}}]),
  NS('Двойная','Летят два шара.',(p,r)=>{p.n+=r;p.spread=0.5}),
  NS('Частые разряды','Бьёт током чаще и сильнее.',(p,r)=>{p.zap=Object.assign({},p.zap,{every:p.zap.every*(1-0.2*r),dmg:p.zap.dmg*(1+0.25*r)})})],
 galedash:[
  NS('Ветер в спину','Рывок восстанавливается быстрее, после него вы быстрее.',(p,r)=>{p.cdm*=1-0.15*r},r=>[{t:'buff',spd:0.15+0.1*r,dur:2.5}]),
  NS('Острые ветра','Шире полоса и сильнее урон.',(p,r)=>{p.w*=1+0.3*r;mulK(p,['dmg'],1+0.25*r)}),
  NS('Невидимость','После переноса вы неуязвимы.',null,r=>[{t:'buff',shield:true,dur:0.5+0.3*r}])],
 hurricane:[
  NS('Два урагана','Идут два урагана веером.',(p,r)=>{p.n+=r}),
  NS('Грозовой','Ураган бьёт молниями.',(p,r)=>{p.zap={every:0.55-0.08*r,jumps:1+r,dmg:20+10*r,dt:'magic',range:160}}),
  NS('Тяжёлый ураган','Медленнее, но дольше и шире.',(p,r)=>{p.straight*=1-0.15*r;p.life+=r;p.r*=1+0.12*r})],
 gust:[
  NS('Удар о стену','Сильнее урон от порыва.',(p,r)=>{mulK(p,['dmg'],1+0.6*r)}),
  NS('Шире','Порыв шире и дальше.',(p,r)=>{p.arc*=1+0.2*r;p.range*=1+0.12*r}),
  NS('Ошеломление','Сбитые с ног враги оглушены.',(p,r)=>{addSt(p,{stun:0.5+0.2*r})})],
 saw:[
  NS('Две пилы','Летит ещё пила.',(p,r)=>{p.n+=r;p.spread=0.4}),
  NS('Зубастая','Пила оставляет кровоточащие раны.',(p,r)=>{addSt(p,{poison:[8+5*r,3]})}),
  NS('Бесконечный рикошет','Намного больше рикошетов.',(p,r)=>{p.bounce+=3*r})],
 steelwhirl:[
  NS('Больше пил','Пил больше.',(p,r)=>{p.n+=r}),
  NS('Шире','Пилы кружат дальше от вас.',(p,r)=>{p.R*=1+0.2*r}),
  NS('Долгий вихрь','Вихрь держится дольше.',(p,r)=>{p.life+=1.2*r})],
 orbital:[
  NS('Залп спутника','Больше лучей.',(p,r)=>{p.n+=2*r}),
  NS('Перегрев','Лучи поджигают.',(p,r)=>{addSt(p,{burn:[8+4*r,3]})}),
  NS('Фокус','Лучи шире и мощнее.',(p,r)=>{p.r*=1+0.2*r;mulK(p,['dmg'],1+0.25*r)})],
 mines:[
  NS('Больше мин','Мин больше.',(p,r)=>{p.n+=2*r}),
  NS('Шоковые','Взрыв надолго оглушает.',(p,r)=>{p.st={stun:1+0.3*r}}),
  NS('Мощный заряд','Взрыв шире и сильнее.',(p,r)=>{p.rad*=1+0.2*r;mulK(p,['dmg'],1+0.3*r)})],
 fruit:[
  NS('Урожай','Летит больше плодов.',(p,r)=>{p.n+=r;p.spread=0.5}),
  NS('Ядовитый сок','Яд намного сильнее.',(p,r)=>{addSt(p,{poison:[10+6*r,4]})}),
  NS('Росток','На месте взрыва вырастают колючки.',null,r=>[{t:'zone',r:80,life:3+r,dps:10+6*r,col:'#62c15a',vis:'thorns',st:{root:0.5}}])],
 choke:[
  NS('Больше лоз','Хватает больше врагов.',(p,r)=>{p.n+=2*r}),
  NS('Сок жизни','Каждый пойманный лечит сильнее.',(p,r)=>{p.healHit+=3*r}),
  NS('Колючие','Лозы бьют и травят сильнее.',(p,r)=>{mulK(p,['dmg'],1+0.3*r);addSt(p,{poison:[8+4*r,3]})})],
 swarm:[
  NS('Улей','Намного больше ос.',(p,r)=>{p.n+=4*r}),
  NS('Жало','Жалят сильнее.',(p,r)=>{mulK(p,['dmg'],1+0.3*r);addSt(p,{poison:[8+4*r,3]})}),
  NS('Второй рой','Следом вылетает ещё рой.',null,r=>[{t:'echo',d:0.6,s:0.5+0.15*r}])],
 treant:[
  NS('Целитель','Древень лечит сильнее.',(p,r)=>{p.heal*=1+0.5*r}),
  NS('Шипы','Шипы древня бьют сильнее.',(p,r)=>{mulK(p,['dmg'],1+0.35*r)}),
  NS('Долгожитель','Древень живёт дольше.',(p,r)=>{p.life+=3*r})],
 flamejet:[
  NS('Напалм','Пламя оставляет горящую землю перед вами.',null,r=>[{t:'zone',r:70,life:2.5+r,dps:14+9*r,col:'#ff7a2b',vis:'lava',st:{burn:[6,2]},at:'near'}]),
  NS('Длинное пламя','Струя бьёт дальше и шире.',(p,r)=>{p.spd*=1+0.25*r;p.life*=1+0.15*r;p.spread*=1+0.15*r;p.n+=2*r}),
  NS('Огненный рывок','После струи рывок восстанавливается, через миг бьёт вторая струя.',null,r=>[{t:'buff',dash:true,spd:0.15+0.08*r,dur:2},{t:'echo',d:0.3,s:0.4+0.15*r}])],
 deluge:[
  NS('Потоп','Остаётся глубокая лужа, сильно замедляющая врагов.',null,r=>[{t:'zone',r:120,life:3+r,dps:6+4*r,col:'#3aa7ff',vis:'bog',st:{slow:[0.4,1],wet:3}}]),
  NS('Грозовой ливень','С неба в мокрых врагов бьют молнии.',null,r=>[{t:'bolt',n:1+r,dmg:60+32*r,stun:0.4,r:70}]),
  NS('Шквал','Намного больше струй.',(p,r)=>{p.n+=4*r;p.spread*=1+0.1*r})],
 boulder:[
  NS('Камнепад','Вокруг точки удара падают камни.',null,r=>[{t:'meteor',n:2+2*r,dmg:40+22*r,r:52,spread:150,vis:'spike',col:'#d9b36a',st:{stun:0.4}}]),
  NS('Осколки','В конце пути валун разлетается осколками.',null,r=>[{t:'shards',n:6+2*r,dmg:22+12*r,col:'#d9b36a',st:{stun:0.2},d:0.9,at:'tp'}]),
  NS('Глыба','Валун огромный и бьёт сильнее.',(p,r)=>{p.r*=1+0.25*r;mulK(p,['dmg'],1+0.3*r);p.knock*=1+0.3*r})],
 gale:[
  NS('Бумеранг','Следом летит вторая волна серпов.',null,r=>[{t:'echo',d:0.45,s:0.5+0.15*r}]),
  NS('Разрез','Серпы пробивают всех и режут сильнее.',(p,r)=>{p.pierce+=4*r;mulK(p,['dmg'],1+0.25*r)}),
  NS('Вихрь','В точке прицела раскручивается вихрь.',null,r=>[{t:'cast',kind:'tornado',pr:{n:1,r:44+6*r,pull:1.8,life:2.5+r,dps:18+10*r,dt:'phys',vis:'sand'}}])],
 shrapnel:[
  NS('Зажигательные','Снаряды поджигают врагов.',(p,r)=>{addSt(p,{burn:[6+4*r,3]})}),
  NS('Ковровая бомбардировка','Намного больше снарядов.',(p,r)=>{p.n+=4*r;p.spread*=1+0.12*r}),
  NS('Минное поле','На месте обстрела остаются мины-ловушки.',null,r=>[{t:'zone',r:100,life:3+r,dps:14+8*r,col:'#ffb347',vis:'zone',st:{stun:0.15}}])],
 thornfield:[
  NS('Ядовитые шипы','Яд намного сильнее.',(p,r)=>{addSt(p,{poison:[12+6*r,4]})}),
  NS('Хищные корни','Поляна затягивает врагов к центру.',null,r=>[{t:'pull',r:190+20*r,f:240,times:4,gap:0.45}]),
  NS('Цветение','Под вами распускаются цветы: лечат.',null,r=>[{t:'zone',r:80,life:4,heal:3+2*r,col:'#8ad25a',vis:'sprout',self:true}])],
 fireball:[
  NS('Двойной шар','Следом вылетает второй шар.',null,r=>[{t:'echo',d:0.4,s:0.55+0.2*r}]),
  NS('Метеориты','Вокруг цели падают метеориты.',null,r=>[{t:'meteor',n:2+2*r,dmg:46+24*r,r:56,spread:170}]),
  NS('Раскалённое ядро','Шар крупнее, взрыв сильнее, горение дольше.',(p,r)=>{p.r*=1+0.2*r;p.blast*=1+0.2*r;mulK(p,['dmg'],1+0.3*r);addSt(p,{burn:[10+4*r,4]})})],
 blaze:[
  NS('Пламенный ореол','Вокруг вас горит кольцо огня, пока действует жар.',null,r=>[{t:'zone',r:80+10*r,life:6+r,dps:12+8*r,col:'#ff7a2b',self:true,st:{burn:[5,2]}}]),
  NS('Порыв отваги','Рывок восстанавливается, вы быстрее.',(p,r)=>{p.dash=true;p.spd=0.1+0.08*r}),
  NS('Кровь и пламя','Вампиризм сильнее, жар держится дольше.',(p,r)=>{p.ls=(p.ls||0)+0.05*r;p.dur+=2*r})],
 icelance:[
  NS('Град копий','Веер дополнительных копий.',(p,r)=>{p.n+=2*r;p.spread=0.9;mulK(p,['dmg'],0.8)}),
  NS('Вечная мерзлота','Копья оглушают и сильно замедляют.',(p,r)=>{addSt(p,{stun:0.35+0.15*r,slow:[0.85,2.2]})}),
  NS('Эхо льда','Второе копьё вылетает следом.',null,r=>[{t:'echo',d:0.3,s:0.5+0.2*r}])],
 tide:[
  NS('Двойной прилив','Вторая волна идёт следом.',null,r=>[{t:'echo',d:0.45,s:0.6+0.15*r}]),
  NS('Цунами','Волна шире, сильнее и бьёт дальше.',(p,r)=>{p.r*=1+0.3*r;p.life*=1+0.2*r;mulK(p,['dmg','knock'],1+0.25*r)}),
  NS('Отлив','После волны врагов затягивает к вам.',null,r=>[{t:'pull',r:200+20*r,f:300,times:3,gap:0.25}])],
 quake:[
  NS('Афтершок','Земля трескается ещё два раза.',null,r=>[{t:'quake',d:0.7,r:100+15*r,dmg:44+24*r},{t:'quake',d:1.3,r:100+15*r,dmg:44+24*r}]),
  NS('Каменная клетка','Вокруг вырастает кольцо каменных стен.',null,r=>[{t:'cage',n:8,life:3+r,r:120}]),
  NS('Сейсмические осколки','Из эпицентра летят осколки камня.',null,r=>[{t:'shards',n:6+2*r,dmg:22+11*r,col:'#d9b36a'}])],
 stoneward:[
  NS('Каменная кожа','Броня ещё выше.',(p,r)=>{p.armor+=4*r;p.dur+=r}),
  NS('Живой камень','Больше регенерации за время действия.',(p,r)=>{p.regen=(p.regen||0)+1.5*r}),
  NS('Каменные стены','Рядом вырастают защитные стены.',null,r=>[{t:'cage',n:6+r,life:4+r,r:90}])],
 bladestorm:[
  NS('Эхо вихря','Вихрь повторяется.',null,r=>[{t:'echo',d:0.5,s:0.55+0.15*r}]),
  NS('Смерч','Рождается смерч, затягивающий врагов.',null,r=>[{t:'cast',kind:'tornado',pr:{n:1,r:50,pull:1.1,life:2.5+r,dps:16+8*r,dt:'phys',vis:'storm'}}]),
  NS('Больше клинков','Клинков больше, летят дальше.',(p,r)=>{p.shards.n+=3*r;p.shards.life*=1+0.25*r})],
 tailwind:[
  NS('Попутный шторм','Скорость выше, действует дольше.',(p,r)=>{p.spd+=0.1*r;p.dur+=2*r}),
  NS('Воздушный щит','Короткая неуязвимость.',null,r=>[{t:'buff',shield:true,dur:0.8+0.5*r}]),
  NS('Дыхание бури','Восстанавливает ману.',null,r=>[{t:'mana',a:8*r}])],
 magnet:[
  NS('Шрапнель','Импульс разбрасывает осколки.',null,r=>[{t:'shards',n:8+2*r,dmg:20+10*r,col:'#e8eef8'}]),
  NS('Сингулярность','Сильнее затягивает и бьёт в центре.',(p,r)=>{p.pull*=1+0.35*r;mulK(p,['dmg'],1+0.3*r)}),
  NS('Эхо импульса','Импульс повторяется.',null,r=>[{t:'echo',d:0.6,s:0.5+0.15*r}])],
 bastion:[
  NS('Закалка','Броня ещё выше.',(p,r)=>{p.armor+=4*r}),
  NS('Ярость стали','Урон выше на время.',(p,r)=>{p.dm=(p.dm||0)+0.1*r;p.dur+=r}),
  NS('Стальные стены','Вокруг вырастают стены.',null,r=>[{t:'cage',n:6+r,life:4+r,r:100}])],
 parasites:[
  NS('Рой','Больше семян.',(p,r)=>{p.n+=2*r}),
  NS('Токсичные споры','Яд сильнее и держится дольше.',(p,r)=>{addSt(p,{poison:[10+4*r,5]})}),
  NS('Цветение','Семя оставляет след из пыльцы.',(p,r)=>{p.trail={every:0.25,zone:{r:30,life:2+r,dps:8+6*r,dt:'magic',col:'#9ad16a',vis:'zone',st:{poison:[4,2]}}}})],
 sprout:[
  NS('Целебная пыльца','Лечит сильнее и восстанавливает ману.',(p,r)=>{mulK(p,['heal'],1+0.35*r);p.life+=r},r=>[{t:'mana',a:6*r}]),
  NS('Корни-защитники','Корни держат врагов в зоне.',(p,r)=>{addSt(p,{root:0.6+0.25*r})}),
  NS('Древо жизни','Вырастает ещё один росток.',null,r=>[{t:'echo',d:1.2,s:0.6+0.1*r}])],
 nova:[
  NS('Огненное кольцо','Вспышка оставляет по кругу горящие очаги.',(p,r)=>{p.ring={n:3+2*r,zone:{r:34,life:3+r,dps:10+9*r,dt:'magic',col:'#ff7a2b',vis:'zone',st:{burn:[5,2]}}}}),
  NS('Эхо вспышки','Через 0.6 с вспышка повторяется ещё раз.',null,r=>[{t:'echo',d:0.6,s:0.45+0.2*r}]),
  NS('Метеоритный дождь','Вокруг вас с неба падают метеориты.',null,r=>[{t:'meteor',n:2+2*r,dmg:46+26*r,r:58,spread:240}])],
 spring:[
  NS('Водяной венец','Источник выстреливает кольцом водяных осколков.',null,r=>[{t:'shards',n:6+2*r,dmg:18+10*r,col:'#6fd0ff',st:{wet:2,slow:[0.7,0.8]}}]),
  NS('Живительный родник','Лечит сильнее, восстанавливает ману и даёт регенерацию.',(p,r)=>{mulK(p,['heal'],1+0.35*r);p.life+=r},r=>[{t:'mana',a:6*r},{t:'buff',regen:2+2*r,dur:6}]),
  NS('Водоворот','Затягивает врагов к центру и размалывает их.',null,r=>[{t:'pull',r:170+25*r,f:300,times:3,gap:0.3},{t:'zone',r:90+10*r,life:3,dps:12*r+8,col:'#3aa7ff',self:true}])],
 spikes:[
  NS('Разлом','Из-под ног тянется линия шипов в сторону прицела.',null,r=>[{t:'line',len:380,step:40,dmg:30+16*r,r:32}]),
  NS('Каменная клетка','Вокруг цели вырастает кольцо каменных стен.',null,r=>[{t:'cage',n:8,life:3+r,r:110}]),
  NS('Афтершок','Земля трескается ещё два раза мощными толчками.',null,r=>[{t:'quake',d:0.8,r:90+15*r,dmg:50+28*r},{t:'quake',d:1.4,r:90+15*r,dmg:50+28*r}])],
 bolt:[
  NS('Гром небесный','С неба бьют удары грома по врагам рядом с целью.',null,r=>[{t:'bolt',n:1+r,dmg:70+38*r,stun:0.5,r:80}]),
  NS('Шаровая молния','Рождает шаровую молнию, которая разряжает врагов вокруг.',null,r=>[{t:'cast',kind:'tornado',pr:{n:1,r:40,pull:1.2,life:3+r,dps:0,dt:'magic',vis:'storm',zap:{every:0.4,jumps:1+r,dmg:24+10*r,dt:'magic',range:170}}}]),
  NS('Паралич','Больше прыжков, молния оглушает и возвращает ману.',(p,r)=>{p.jumps+=r;addSt(p,{stun:0.25+0.15*r});p.manam=1-0.12*r},r=>[{t:'mana',a:5*r}])],
 volley:[
  NS('Часовые','Оставляет автоматические турели, стреляющие по врагам.',null,r=>[{t:'turret',n:r,dmg:14+8*r,tcd:0.45,life:8+2*r}]),
  NS('Эхо-залп','Второй залп вылетает следом.',null,r=>[{t:'echo',d:0.35,s:0.5+0.15*r}]),
  NS('Пушка','Одна тяжёлая пуля: огромный урон, пробивает всех, отбрасывает.',(p,r)=>{p.n=1;p.spread=0;p.r=9+2*r;p.dmg=p.dmg*(2.4+1.1*r)*2;p.pierce=99;p.knock=240;p.spd=900;p.life=1})],
 whip:[
  NS('Терновый след','Под хлыстом остаётся колючий кустарник, который держит врагов.',null,r=>[{t:'zone',r:70,life:3+r,dps:14+8*r,col:'#62c15a',st:{root:0.6},at:'beam'}]),
  NS('Жатва','Каждый задетый враг лечит вас и даёт ману.',null,r=>[{t:'harvest',hp:3*r,mp:2*r}]),
  NS('Вихрь лозы','После удара лоза вращается вокруг вас по кругу.',null,r=>[{t:'cast',kind:'nova',pr:{r:95+10*r,dmg:40+22*r,dt:'magic',knock:200,col:'#62c15a',st:{root:1.2}},self:true},{t:'echo',d:0.5,s:0.3}])],
 steam:[
  NS('Паровой взрыв','Когда пар рассеивается, происходит мощный взрыв.',null,r=>[{t:'quake',d:1.6,r:130,dmg:80+45*r,dt:'magic',col:'#dbe9f2'}]),
  NS('Ошпаривание','Пар жжёт сильнее и поджигает врагов.',(p,r)=>{mulK(p,['dps'],1+0.4*r);addSt(p,{burn:[6+4*r,3]})}),
  NS('Гейзеры','Из земли бьют гейзеры вокруг пара.',null,r=>[{t:'meteor',n:3+2*r,dmg:40+20*r,r:56,spread:130,vis:'spike',col:'#bfe8ff'}])],
 magma:[
  NS('Лавовое озеро','На месте падения остаётся огромная лужа лавы.',null,r=>[{t:'zone',r:110,life:4+r,dps:30+18*r,col:'#ff4a2a',vis:'lava',st:{burn:[8,3]}}]),
  NS('Метеоритный шторм','Намного больше метеоритов.',(p,r)=>{p.n+=3*r;p.spread*=1.2}),
  NS('Вулкан','В центре происходит гигантский взрыв.',null,r=>[{t:'quake',d:1.1,r:150+10*r,dmg:160+80*r,dt:'magic',col:'#ff6a2b',knock:380}])],
 firetwister:[
  NS('Огненный след','Вы оставляете за собой огонь, пока смерч крутится.',null,r=>[{t:'trail',n:6,gap:0.5,r:42,life:2.5,dps:14+8*r}]),
  NS('Огненные шары','Смерч выпускает ещё и круг огненных шаров.',null,r=>[{t:'cast',kind:'proj',pr:{n:4+r,spread:6.0,spd:360,r:10,dmg:34+16*r,dt:'magic',pierce:2,life:1,vis:'slug',col:'#ff9a3c',st:{burn:[6,3]}}}]),
  NS('Жаровой кокон','Вы неуязвимы в центре жара на время.',null,r=>[{t:'buff',shield:true,dur:1+0.7*r}])],
 molten:[
  NS('Раскалённый металл','Снаряд бьёт сильнее и сильнее поджигает.',(p,r)=>{mulK(p,['dmg'],1+0.3*r);addSt(p,{burn:[8+4*r,3]})}),
  NS('Кассетный взрыв','В точке прицела происходит взрыв и разлетаются осколки.',null,r=>[{t:'quake',d:0.55,r:100,dmg:60+30*r,dt:'magic',col:'#ff9a3c'},{t:'shards',n:6+2*r,dmg:20+10*r,col:'#ff9a3c',st:{burn:[5,2]},d:0.55,at:'tp'}]),
  NS('Кузня','Вокруг вас горит кузня: огонь вокруг и броня.',null,r=>[{t:'zone',r:100,life:4+r,dps:18+8*r,col:'#ff7a2b',self:true},{t:'buff',armor:6+3*r,dur:5+r}])],
 wildfire:[
  NS('Разрастание','Пожар шире и живёт дольше.',(p,r)=>{p.r*=1+0.25*r;p.life+=r}),
  NS('Угли','Пожар выбрасывает кольцо раскалённых углей.',null,r=>[{t:'shards',n:8+2*r,dmg:24+10*r,col:'#ff7a2b',st:{burn:[6,3]}}]),
  NS('Духи огня','Вокруг вас вращаются духи огня.',null,r=>[{t:'cast',kind:'spiral',pr:{life:3+r,arms:2,rate:0.09,spd:260,r:7,dmg:20+10*r,dt:'magic',pierce:1,plife:0.9,vis:'flame',col:'#ff9a3c',st:{burn:[5,2]}}}])],
 bog:[
  NS('Хватающие корни','Топь надолго обездвиживает врагов.',(p,r)=>{addSt(p,{root:0.5+0.4*r})}),
  NS('Яд топи','Болото отравляет: урон от яда накапливается.',(p,r)=>{addSt(p,{poison:[8+5*r,4]})}),
  NS('Терновые стражи','Из топи вырастают стреляющие тернии.',null,r=>[{t:'turret',n:1+r,dmg:16+8*r,tcd:0.5,life:9,tvis:'thorn',st:{root:0.3}}])],
 frost:[
  NS('Вечная мерзлота','Вспышка оставляет ледяные очаги, замедляющие врагов.',(p,r)=>{p.ring={n:3+r,zone:{r:40,life:3+r,dps:10+6*r,dt:'magic',col:'#bdf0ff',vis:'zone',st:{slow:[0.4,1],frz:0.3}}}}),
  NS('Град осколков','Намного больше ледяных осколков.',(p,r)=>{if(p.shards){p.shards.n+=6*r;p.shards.dmg*=1+0.25*r}}),
  NS('Ледяной купол','Вы получаете защиту, враги отброшены.',null,r=>[{t:'buff',shield:true,dur:1+0.6*r},{t:'quake',d:0.05,r:170,dmg:20,dt:'magic',col:'#bdf0ff',knock:500,self:true}])],
 rust:[
  NS('Коррозия','Ржавчина разъедает сильнее.',(p,r)=>{mulK(p,['dps'],1+0.5*r)}),
  NS('Ржавые бомбы','На врагов падают ржавые бомбы.',null,r=>[{t:'meteor',n:2+2*r,dmg:44+24*r,r:62,spread:140,vis:'meteor',col:'#c58a4a',st:{rust:6}}]),
  NS('Магнит','Притягивает врагов к центру ржавчины.',null,r=>[{t:'pull',r:200+20*r,f:260,times:4,gap:0.4}])],
 lifevines:[
  NS('Шипы лозы','Лозы наносят больше урона.',(p,r)=>{mulK(p,['dps'],1+0.7*r)}),
  NS('Древо жизни','Лечение, щит и регенерация вокруг вас.',(p,r)=>{mulK(p,['heal'],1+0.4*r)},r=>[{t:'buff',regen:3+2*r,dur:6,shield:r>=2}]),
  NS('Ядовитый цвет','Цветы вокруг отравляют врагов.',(p,r)=>{p.ring=null},r=>[{t:'shards',n:6+2*r,dmg:16+8*r,col:'#a6e07a',st:{poison:[10+4*r,3]}}])],
 sand:[
  NS('Дробление','Песок перемалывает сильнее.',(p,r)=>{mulK(p,['dps'],1+0.5*r)}),
  NS('Взрыв бури','Когда буря стихает, происходит взрыв.',null,r=>[{t:'quake',d:5.5,r:150,dmg:90+50*r,dt:'phys',col:'#e6c88a'}]),
  NS('Широкий вихрь','Шире и сильнее затягивает врагов.',(p,r)=>{p.r*=1+0.25*r;p.pull*=1+0.2*r})],
 citadel:[
  NS('Усиленные стены','Больше и дольше живущих стен, турели сильнее.',(p,r)=>{p.walls+=r;p.life+=3*r;mulK(p,['tdmg'],1+0.2*r)}),
  NS('Огнемёты','Турели стреляют намного чаще.',(p,r)=>{p.tcd*=1-0.2*r;mulK(p,['tdmg'],1+0.15*r)}),
  NS('Полевой госпиталь','Под цитаделью лечебное поле.',null,r=>[{t:'zone',r:110,life:8,dps:0,heal:4+3*r,col:'#6fe3a0',self:false}])],
 ancientroot:[
  NS('Корни-убийцы','Корни выстреливают вокруг цели ещё раз.',null,r=>[{t:'meteor',n:2+2*r,dmg:50+25*r,r:70,spread:150,vis:'root',col:'#8a6a3a',st:{root:1.5}}]),
  NS('Колосс','Корень становится гигантским.',(p,r)=>{p.r*=1+0.3*r;p.dmg*=1+0.3*r}),
  NS('Чаща','Остаётся густая чаща, долго удерживающая врагов.',null,r=>[{t:'zone',r:130,life:4+2*r,dps:16+8*r,col:'#62c15a',vis:'thorns',st:{root:0.8}}])],
 railgun:[
  NS('Двойной выстрел','Второй выстрел почти сразу.',null,r=>[{t:'echo',d:0.25,s:0.6+0.15*r}]),
  NS('Электроразряд','Луч бьёт молниями в ближайших врагов.',null,r=>[{t:'bolt',n:2+r,dmg:50+30*r,stun:0.3,r:70,range:420,self:true}]),
  NS('Тяжёлый заряд','Луч шире и мощнее.',(p,r)=>{p.w*=1+0.5*r;p.len*=1+0.15*r;p.dmg*=1+0.4*r;p.manam=1+0.1*r})],
 spores:[
  NS('Взрывные споры','Споры детонируют после рассеивания.',null,r=>[{t:'quake',d:2.8,r:120,dmg:70+40*r,dt:'magic',col:'#a6e07a'}]),
  NS('Рой','Намного больше облаков спор.',(p,r)=>{p.n+=2*r}),
  NS('Вампирская пыльца','Яд сильнее, а вы получаете здоровье.',(p,r)=>{addSt(p,{poison:[14+6*r,4]})},r=>[{t:'harvest',hp:5*r,mp:0,min:3}])],
 thornsteel:[
  NS('Скорострельные','Турели стреляют намного быстрее.',(p,r)=>{p.tcd*=1-0.2*r}),
  NS('Живая изгородь','Колючие стены перед турелями.',(p,r)=>{p.walls=2+r;p.life+=2*r}),
  NS('Корневой взрыв','Турели ставятся с корневым взрывом.',null,r=>[{t:'quake',d:0.3,r:110,dmg:40+25*r,dt:'phys',col:'#9ad16a',st:{root:1.4+0.3*r}}])]
};
const NODE_REQ=[1,2,3];
function nodeRank(id,i){const n=G.nodes[id];return n?(n['abc'[i]]||0):0}
function skillPr(s){
  const a=AB[s.id],pr=a.p(s.lv);
  pr.cdm=1;pr.manam=1;pr.hk=[];
  const T=TREE[s.id];
  if(T)T.forEach((n,i)=>{const r=nodeRank(s.id,i);if(!r)return;if(n.pr)n.pr(pr,r);if(n.hk)for(const h of n.hk(r))pr.hk.push(h)});
  return pr;
}
function hkPoint(X,h){
  if(h.self)return {x:X.c.px,y:X.c.py};
  if(h.at==='tp'||!h.at)return X.tp;
  if(h.at==='near')return {x:X.c.px+Math.cos(X.c.ang)*110,y:X.c.py+Math.sin(X.c.ang)*110};
  if(h.at==='beam'){const L=(X.pr.len||300)*0.6;return {x:X.c.px+Math.cos(X.c.ang)*L,y:X.c.py+Math.sin(X.c.ang)*L}}
  return X.tp;
}
const HK={
  echo(X,h){later(h.d,()=>{const p2=Object.assign({},X.pr);p2.hk=[];mulK(p2,['dmg','tdmg','dps','heal'],h.s);const c2=Object.assign({},X.c,{px:G.p.x,py:G.p.y});CAST[X.a.kind](p2,c2)})},
  meteor(X,h){
    const g=G,t=hkPoint(X,h);
    for(let i=0;i<h.n;i++){
      const a=rnd(0,TAU),d=Math.sqrt(Math.random())*h.spread,tt=0.5+i*0.12;
      g.bl.push({x:t.x+Math.cos(a)*d,y:t.y+Math.sin(a)*d,t:tt,max:tt,r:h.r,dmg:h.dmg,dt:h.dt||'magic',st:h.st||{burn:[6,3]},knock:160,vis:h.vis||'meteor',col:h.col||'#ff6a2b',dead:false});
    }
  },
  zone(X,h){const t=hkPoint(X,h);addZone(t.x,t.y,{r:h.r,life:h.life,dps:h.dps||0,heal:h.heal||0,dt:h.dt||'magic',vis:h.vis||'zone',col:h.col,st:h.st},!!h.self)},
  shards(X,h){
    const run=()=>{const t=h.at==='tp'?X.tp:{x:X.c.px,y:X.c.py},off=rnd(0,TAU);
      for(let i=0;i<h.n;i++){const a=off+i*TAU/h.n;shoot({vis:'shard',x:t.x,y:t.y,vx:Math.cos(a)*340,vy:Math.sin(a)*340,r:6,dmg:h.dmg,dt:'magic',life:0.8,pierce:1,col:h.col,st:h.st,src:'proj'})}
      ring(t.x,t.y,60,h.col,0.3)};
    if(h.d)later(h.d,run);else run();
  },
  pull(X,h){
    const t=X.tp2||{x:X.c.px,y:X.c.py};
    for(let k=0;k<h.times;k++)later(k*h.gap,()=>{
      for(const e of G.en){if(e.dead)continue;const dx=t.x-e.x,dy=t.y-e.y;if(dx*dx+dy*dy<h.r*h.r)knockE(e,dx,dy,h.f)}
      ring(t.x,t.y,h.r*0.7,X.a.c1||'#9cc4ff',0.3);
    });
  },
  quake(X,h){
    const t=h.self?{x:X.c.px,y:X.c.py}:X.tp;
    later(h.d,()=>{explodeAt(t.x,t.y,h.r,h.dmg,{dt:h.dt||'phys',col:h.col||'#d9b36a',st:h.st||{stun:0.4},knock:h.knock||160,shake:7,spike:true});smokeAt(t.x,t.y,10,1.5)});
    ring(t.x,t.y,h.r,h.col||'#ffffff',Math.min(h.d,0.8));
  },
  line(X,h){
    const g=G,n=Math.floor(h.len/h.step);
    for(let i=0;i<n;i++){
      const d=50+i*h.step,tt=0.12+i*0.05;
      g.bl.push({x:X.c.px+Math.cos(X.c.ang)*d,y:X.c.py+Math.sin(X.c.ang)*d,t:tt,max:tt,r:h.r,dmg:h.dmg,dt:'phys',st:{stun:0.5},knock:60,vis:'spike',col:'#d9b36a',dead:false});
    }
  },
  cage(X,h){
    const t=X.tp;
    for(let i=0;i<h.n;i++){const a=i*TAU/h.n;G.stc.push({kind:'wall',x:t.x+Math.cos(a)*h.r,y:t.y+Math.sin(a)*h.r,r:24,life:h.life,max:h.life,col:'#c9974f',dead:false})}
    ring(t.x,t.y,h.r,'#d9b36a',0.5);
  },
  bolt(X,h){
    const g=G,t=h.self?{x:X.c.px,y:X.c.py}:X.tp,R=h.range||320;
    const cand=g.en.filter(e=>!e.dead&&(e.x-t.x)**2+(e.y-t.y)**2<R*R);
    for(let i=cand.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cand[i],cand[j]]=[cand[j],cand[i]]}
    for(let i=0;i<h.n;i++){
      const e=cand[i],x=e?e.x:t.x+rnd(-120,120),y=e?e.y:t.y+rnd(-120,120);
      ring(x,y,h.r,'#f4f08a',0.3);
      later(0.28+i*0.13,()=>{skyStrike(x,y,'#f4f08a',i===0);explodeAt(x,y,h.r,h.dmg,{dt:'magic',col:'#f4f08a',st:{stun:h.stun||0.4},quiet:true,shake:6})});
    }
  },
  turret(X,h){CAST.struct({turrets:h.n,walls:0,tdmg:h.dmg,tdt:'phys',tcd:h.tcd,life:h.life,tvis:h.tvis||'turret',col:X.a.c1||'#b4c0d4',tst:h.st||null},{px:X.c.px,py:X.c.py,x:X.tp.x,y:X.tp.y,ang:0})},
  cast(X,h){CAST[h.kind](h.pr,h.self?Object.assign({},X.c,{x:X.c.px+1,y:X.c.py}):X.c)},
  buff(X,h){CAST.buff(h,X.c)},
  mana(X,h){const g=G;g.p.mana=Math.min(g.S.maxMana,g.p.mana+h.a)},
  harvest(X,h){const n=Math.min(G.lastHits,8);if(n>0){heal(h.hp*n);G.p.mana=Math.min(G.S.maxMana,G.p.mana+h.mp*n);ring(G.p.x,G.p.y,40,'#62c15a',0.4)}else if(h.min)heal(h.min)},
  trail(X,h){for(let i=0;i<h.n;i++)later(i*h.gap,()=>addZone(G.p.x,G.p.y,{r:h.r,life:h.life,dps:h.dps,dt:'magic',vis:'lava',col:'#ff4a2a',st:{burn:[5,2]}},false))}
};
function runHooks(pr,c,a){
  if(!pr.hk||!pr.hk.length)return;
  const selfK=a.kind==='nova'||a.kind==='buff'||pr.self;
  const tp=selfK?{x:c.px,y:c.py}:clampRange(c,420);
  const X={pr:pr,c:c,tp:tp,tp2:tp,a:a};
  for(const h of pr.hk){const f=HK[h.t];if(f)f(X,h)}
}
function castSlot(i){
  const g=G;
  if(!g||mode!=='play'||uiOpen())return;
  const s=g.slots[i];
  if(!s)return;
  const a=AB[s.id];
  if(s.cd>0)return;
  const pr=skillPr(s);let mana=Math.round(a.mana*pr.manam*((g.cls&&g.cls.manax)||1));
  if(g.start==='water'&&g.tide!=='ebb')mana=Math.round(mana*0.7);
  const free=g.start==='water'&&g.pl>=3&&(g.castN+1)%10===0;if(free)mana=0;
  if(g.p.mana<mana){g.nomana=0.35;sfx(130,0.1,'square',0.03);return}
  const c=castCtx(a.c1,a.c2);
  const hot=g.start==='fire'&&(g.heat||0)>=100,oh0=g.ovhT;if(hot)g.ovhT=1.5;
  const L0=lens();g.curSk=a.id;
  const r=CAST[a.kind](pr,c);
  if(r===false){if(hot)g.ovhT=oh0;g.curSk=null;return}
  g.p.mana-=mana;g.castN++;
  const echo=g.ifx&&g.ifx.echo&&g.castN%(g.syn.loop?3:4)===0;
  if(g.start==='fire'){
    g.heatIdle=0;
    if(hot){
      const p=g.p;g.heat=0;g.burnSelf=3;g.bsT=0.5;
      explodeAt(p.x,p.y,150*(1+g.S.area),20+9*g.el.fire,{dt:'magic',col:'#ff7a3a',st:{burn:[4+2*g.el.fire,3]},src:'skill',knock:180,shake:7});
      ring(p.x,p.y,170,'#ffd36b',0.6);puff(p.x,p.y,'#ffb347',26,260,0.7,3.5);
      if(g.tx.length<50)g.tx.push({x:p.x,y:p.y-40,t:1,txt:'ПЕРЕГРЕВ ×1.5',big:true,col:'#ffb347'});
    }else g.heat=Math.min(100,(g.heat||0)+25);
  }
  if(free&&g.tx.length<50)g.tx.push({x:g.p.x,y:g.p.y-30,t:0.9,txt:'Прилив: без маны',big:false,col:'#6fd0ff'});
  s.cdMax=a.cd*pr.cdm/(1+g.E.cdr);s.cd=echo?0.15:s.cdMax;
  if(echo){ring(g.p.x,g.p.y,50,'#9fe0ff',0.4);if(g.tx.length<50)g.tx.push({x:g.p.x,y:g.p.y-34,t:0.8,txt:'Эхо!',big:true,col:'#9fe0ff'})}
  if(AFXM[a.id]){const m=AFXM[a.id],R0=(pr.r||100)*(1+g.S.area);g.afx.push({m:m,x:c.px,y:c.py,t:0,life:.9,k:R0/m[1]})}
  runHooks(pr,c,a);
  tagNew(L0,a.id);g.curSk=null;
  heroAtk(c.ang);
  sfx(380+i*40,0.12,'triangle',0.04,200);
}
function useItem(i){
  const g=G;
  if(!g||mode!=='play'||uiOpen())return;
  const b=g.bag[i];
  if(!b)return;
  const d=ITEMS[b.id];
  if(!d.cast||b.cd>0)return;
  if(d.mana&&g.p.mana<d.mana){g.nomana=0.35;sfx(130,0.1,'square',0.03);return}
  const r=CAST[d.cast.kind](d.cast,castCtx(d.c[0],d.c[1]));
  if(r===false)return;
  if(d.mana)g.p.mana-=d.mana;
  b.cdMax=d.cd||1;b.cd=b.cdMax;
  if(d.ch){b.ch--;if(b.ch<=0){g.bag[i]=null;recalc()}}
  g.dockSig='';
  sfx(520,0.1,'triangle',0.04,300);
}

