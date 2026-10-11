/* =====================================================================
   МЕНЮ
   ===================================================================== */
let menuTab='play',menuEl='fire',listening=null,resetArmed=0;
const TABS=[['play','Играть'],['up','Развитие'],['codex','Кодекс'],['bestiary','Бестиарий'],['keys','Управление']];
function renderMenu(){
  $('tabs').innerHTML=TABS.map(t=>'<button class="tab'+(menuTab===t[0]?' on':'')+'" type="button" data-tab="'+t[0]+'">'+t[1]+'</button>').join('');
  $('essLine').innerHTML='Эссенция: <b>'+SAVE.ess+'</b>';
  $('bestLine').textContent=SAVE.best?('Лучшая волна: '+SAVE.best+' · Побед: '+SAVE.wins):'Забегов пока не было';
  const P=$('mpanel');
  if(menuTab==='play')P.innerHTML=playTab();
  else if(menuTab==='up')P.innerHTML=upTab();
  else if(menuTab==='codex')P.innerHTML=codexTab();
  else if(menuTab==='bestiary'){P.innerHTML=bestiaryTab();if(!bestRaf)bestRaf=requestAnimationFrame(bestLoop)}
  else P.innerHTML=keysTab();
}
function routeHtml(){
  let h='';
  BIOMES.forEach((id,i)=>{const M=MAPS[id];h+='<div class="rt" style="--c1:'+M.glow+';--a:'+M.acc+';--b:'+M.base+'"><span class="msw"></span><b>'+M.n+'</b><small>Волны '+(2*i+1)+'–'+(2*i+2)+'</small><em class="up">▲ '+M.mods.buff.n+'</em><em class="dn">▼ '+M.mods.debuff.n+'</em></div>'});
  return h;
}
function playTab(){
  let picks='';
  for(const k of HEROK){
    const E=hEl(k),ava=k==='avatar';
    picks+='<button class="pick'+(menuEl===k?' on':'')+(ava?' ava':'')+'" type="button" data-el="'+k+'" style="--c1:'+E.c+';--c2:'+E.c2+'"><span class="orb"></span><b>'+(ava?'Аватар':E.n)+'</b><small>'+(ava?'Смешивает стихии':EW[k].w)+'</small></button>';
  }
  const ava=menuEl==='avatar',E=hEl(menuEl),u=ULT[menuEl],sk=AB[ELSK[menuEl]]||{n:'Навыки изученных стихий',d:'Плюс симбиозы двух стихий и их слияния'};
  const ew=EW[menuEl]||{w:'Автоатаки всех изученных стихий',d:'Каждая стихия добавляет свою',dt:'magic'};
  let syms='';
  for(const k of SYM_IDS){
    const a=AB[k];
    if(a.pair.indexOf(menuEl)<0)continue;
    const other=a.pair[0]===menuEl?a.pair[1]:a.pair[0];
    syms+='<span class="chip"><span class="orb sm dual" style="--c1:'+a.c1+';--c2:'+a.c2+'"></span><b>'+a.n+'</b> с '+EL[other].n+' · ульта: '+ULTMOD[other]+'</span>';
  }
  return '<section><div><h2 class="sec">Стартовая стихия</h2><div class="picks">'+picks+'</div></div><div><h2 class="sec">Маршрут забега: местность меняется каждые две волны</h2><div class="route">'+routeHtml()+'</div></div>'
    +'<div class="pdetail" style="--c1:'+E.c+'"><canvas class="mpc" id="mpc"></canvas><h3 style="color:'+E.c+'">'+CLS[menuEl].n+' <span style="font-size:.6em;color:var(--dim)">'+E.n+'</span></h3><dl><dt>Описание</dt><dd>'+E.d+'</dd><dt>Класс</dt><dd><b>'+CLS[menuEl].n+'</b> · '+CLS[menuEl].role+'</dd><dt>Плюсы</dt><dd>'+CLS[menuEl].plus+'</dd><dt>Минусы</dt><dd>'+CLS[menuEl].minus+(ava?'':' Мастер одной стихии: качает её до 8 уровня, чужие стихии не берёт.')+'</dd><dt>Пассивка</dt><dd><b>'+HPAS[menuEl].n+'</b> (3 уровня, очками навыков): '+HPAS[menuEl].pd.map((d,i)=>(i+1)+') '+d).join('; ')+'.</dd><dt>Механика</dt><dd><b>'+HMECH[menuEl].n+'</b>. '+HMECH[menuEl].d+'.</dd><dt>Автоатака</dt><dd>'+ew.w+'. '+ew.d+' ('+DT[ew.dt].n.toLowerCase()+' урон)</dd><dt>Навык (очко на ур. 2)</dt><dd><b>'+sk.n+'</b>. '+sk.d+'</dd><dt>Ульта (с '+ULT_LV+' ур.)</dt><dd><b>'+u.n+'</b>. '+u.d+'</dd><dt>Стихии</dt><dd>'+(ava?'Не больше трёх: по одной из каждой пары огонь/вода, земля/воздух, металл/дерево. Каждая до 4 уровня.':'Только «'+E.n+'». Смешивать стихии умеет только Аватар.')+'</dd></dl>'
    +(ava?'<h2 class="sec" style="margin-top:6px">Симбиозы — по одному на каждую пару стихий, '+SYM_IDS.length+' всего</h2><div class="chips">'+SYM_IDS.map(k=>'<span class="chip"><span class="orb sm dual" style="--c1:'+AB[k].c1+';--c2:'+AB[k].c2+'"></span><b>'+AB[k].n+'</b></span>').join('')+'</div>':'')+'</div>'
    +ascRow()+'<div class="playrow"><button class="btn" type="button" data-start="1">Начать забег</button><span class="sub">24 волны, после каждой пауза с торговцами. Мир меняется каждые четыре волны: чтобы пройти дальше, победи хранителя биома. Финал: Пожиратель Стихий.</span></div></section>';
}
function upTab(){
  let h='<section><div class="playrow"><div><h2 class="sec">Эссенция</h2><div class="ess">'+SAVE.ess+'</div></div><span class="sub">Эссенция выдаётся за забег: за волны, убийства и боссов. Улучшения остаются навсегда.</span></div><div class="metas">';
  for(const m of META){
    const l=SAVE.meta[m.id]||0,max=l>=m.max,cost=m.c0+m.cs*l;
    h+='<div class="meta-card"><h4>'+m.n+'</h4><p>'+m.d+'</p><div class="row"><span class="pips" style="--c1:#9fe0ff">'+pips(l,m.max)+'</span>'+(max?'<span class="sub">Максимум</span>':'<button class="btn sm" type="button" data-meta="'+m.id+'"'+(SAVE.ess>=cost?'':' disabled')+'>'+cost+'</button>')+'</div></div>';
  }
  return h+'</div></section>';
}
/* живые спрайты врагов в бестиарии — те же, что в игре (ENS.draw) */
let bestRaf=0,bestLast=0;
function bestLoop(t){
  bestRaf=0;
  if(mode!=='menu'||menuTab!=='bestiary')return;
  bestRaf=requestAnimationFrame(bestLoop);
  if(t-bestLast<33)return;bestLast=t;
  const tt=t/1000,vh=innerHeight;
  for(const cv of document.querySelectorAll('canvas[data-et]')){
    const r=cv.getBoundingClientRect();if(r.bottom<0||r.top>vh||!r.width)continue;
    const k=cv.dataset.et,d=ET[k];if(!d||typeof ENS==='undefined'||!ENS.has(k))continue;
    const c=cv.getContext('2d'),W=cv.width;
    c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,W);
    c.save();c.translate(W/2,W/2+2);c.rotate(-0.35+Math.sin(tt*0.7+k.length)*0.15);
    try{ENS.draw(c,k,{t:tt+k.length*0.37,r:W/2/2.25,col:d.col,st:'move',hp:1})}catch(_){}
    c.restore();
  }
}
function bestiaryTab(){
  const dtn={phys:'Физический урон',magic:'Магический урон',mixed:'Физ. и маг. урон'};
  const card=(k,o,boss)=>{
    const dt=boss?'mixed':(EDT[k]||'phys');
    const map=o.map?MAPS[o.map].n:'любая карта';
    const st='<div class="bst">Здоровье '+o.hp+' · Урон '+o.dmg+' · Скорость '+o.sp+(o.armor?' · Броня '+o.armor:'')+(o.mres?' · Сопр. магии '+Math.round(o.mres*100)+'%':'')+'</div>';
    return '<div class="be"><canvas class="ic '+dt+'" data-et="'+(boss?'boss_'+k:k)+'" width="128" height="128" style="--bc:'+o.col+'"></canvas><div><strong>'+o.n+'</strong><div class="tp '+dt+'">'+dtn[dt]+'</div></div>'+st+'<p>'+o.d+(boss?' · Волна '+(4*(BOSS_ORDER.indexOf(k)+1)):' · Появляется: '+map+(o.from>1&&o.from<99?', с волны '+o.from:''))+'</p></div>';
  };
  let h='<section><p class="s" style="color:var(--dim)">Красная пунктирная обводка у врага = физический урон (против него работает броня). Синее свечение = магический урон (против него работает сопротивление магии).</p>';
  h+='<h2 class="sec">Враги</h2><div class="bs">';
  for(const k in ET)if(ET[k].from<99&&!ET[k].map)h+=card(k,ET[k],false);
  h+='</div>';
  for(const mk in MAPS){
    const ks=Object.keys(ET).filter(k=>ET[k].map===mk);
    if(!ks.length)continue;
    h+='<h2 class="sec" style="margin-top:14px">Только на карте: '+MAPS[mk].n+'</h2><div class="bs">'+ks.map(k=>card(k,ET[k],false)).join('')+'</div>';
  }
  const other=Object.keys(ET).filter(k=>ET[k].from>=99&&k.indexOf('boss_')!==0);
  if(other.length)h+='<h2 class="sec" style="margin-top:14px">Призванные</h2><div class="bs">'+other.map(k=>card(k,ET[k],false)).join('')+'</div>';
  h+='<h2 class="sec" style="margin-top:14px">Боссы</h2><div class="bs">'+Object.keys(BOSS).map(k=>card(k,BOSS[k],true)).join('')+'</div></section>';
  return h;
}
function trCodex(){
  let h='<div class="cx"><b>Очки навыков</b><span>Начинаете без навыков. Каждый уровень даёт 1 очко (клавиша T): откройте навык стихии, усиливайте его и вкладывайте очки в три мутации с разным геймплеем.</span></div>';
  for(const id in TREE)h+='<div class="cx"><b>'+AB[id].n+'</b><span>'+TREE[id].map(n=>'<i style="color:#fff;font-style:normal">'+n.n+'</i> — '+n.d).join('<br>')+'</span></div>';
  return h;
}
function codexTab(){
  const sec=(t,body)=>'<details><summary>'+t+'</summary><div>'+body+'</div></details>';
  const row=(a,b)=>'<div class="cx"><b>'+a+'</b><span>'+b+'</span></div>';
  let el='';
  for(const k of EK)el+=row('<span style="color:'+EL[k].c+'">'+EL[k].n+'</span>',EL[k].d+' Автоатака: '+EW[k].w+'. Навык: '+AB[ELSK[k]].n+'. Ульта: '+ULT[k].n+'.');
  let sy='';
  for(const k of SYM_IDS){const a=AB[k];sy+=row(a.n,EL[a.pair[0]].n+' + '+EL[a.pair[1]].n+'. '+a.d)}
  let fu='';
  for(const k of FUSE_IDS){const a=AB[k];fu+=row(a.n,AB[a.a].n+' + '+AB[a.b].n+'. '+a.d)}
  let sk='';
  for(const k of SKILL_IDS){const a=AB[k];sk+=row(a.n,EL[a.els[0]].n+'. '+a.d+' Мана '+a.mana+'.')}
  let ul='';
  for(const k of EK)ul+=row(ULT[k].n,ULT[k].d+' Симбиоз усиливает ульту: '+EK.filter(x=>x!==k).map(x=>EL[x].n+' → '+ULTMODD[x]).join('; ')+'.');
  let it='';
  for(const mk of MKEYS){
    const M=MERCH[mk];
    let r='';
    for(const id of M.pool)r+=row(ITEMS[id].n,ITEMS[id].tag+'. '+ITEMS[id].d+(ITEMS[id].st?' ('+statLine(ITEMS[id].st)+')':'')+' Цена '+ITEMS[id].price+'.');
    if(M.special==='invest')r+=row('Вложения и пробуждение','Приходит после 6-й, 12-й и 18-й волн, только если у вас много золота (200 + 25 за волну). Постоянные усиления, повышение уровня стихии, очко навыков и четыре предмета, которых нет у других торговцев.');
    if(M.special==='swap')r+=row('Смена навыка','Появляется на чётных волнах. Забываете навык, возвращаются очки мутаций, а новый навык стартует со 2 уровня. Цена растёт с каждой сменой.');
    if(M.scrolls)r+=row('Свитки способностей','Случайные навыки и симбиозы: изучаются сразу, без условий стихий.');
    if(M.fscroll)r+=row('Свиток слияния','Редкая находка: слияние без ингредиентов.');
    it+='<h2 class="sec" style="margin-top:6px;color:'+M.col+'">'+M.n+'</h2>'+r;
  }
  let en='';
  for(const k of ET_KEYS)en+=row(ET[k].n,ET[k].d);
  for(const k in BOSS)en+=row(BOSS[k].n,BOSS[k].d);
  const rx=row('Электрошок','Молния по мокрому врагу: урон ×1,5 и короткое оглушение.')+row('Перегрузка','Молния по горящему врагу вызывает небольшой взрыв.')+row('Раскол','Физический удар по замороженному врагу: урон ×1,5, лёд разбивается.')+row('Ржавчина','Враги с ржавчиной получают больше физического урона.');
  const dtp=Object.keys(DT).map(k=>row('<span style="color:'+DT[k].c+'">'+DT[k].n+'</span>',DT[k].d)).join('');
  return '<section>'+sec('Стихии',el)+sec('Навыки стихий (хотбар 1-5)',sk)+sec('Симбиозы стихий',sy)+sec('Слияния навыков',fu)+sec('Ульты',ul)+sec('Торговцы и предметы',it)+sec('Враги и боссы',en)+sec('Древа навыков',trCodex())+sec('Типы урона',dtp)+sec('Реакции',rx)+'</section>';
}
function ascRow(){
  const mx=SAVE.asc||0,cur=Math.min(SAVE.ascSel||0,mx),A=ASC[cur];
  return '<div class="ascrow"><button class="btn alt sm" type="button" data-asc="-1"'+(cur>0?'':' disabled')+'>‹</button><div><b>'+A.n+'</b><span class="sub">'+(cur?A.d+(cur>1?' И всё с прошлых уровней.':'')+' Эссенция +'+cur*25+'%.':'Победа открывает «'+ASC[1].n+'».')+(mx<ASC.length-1?' Открыто: '+(mx+1)+' из '+ASC.length+'.':'')+'</span></div><button class="btn alt sm" type="button" data-asc="1"'+(cur<mx?'':' disabled')+'>›</button></div>';
}
function keysTab(){
  let h='<section><div><h2 class="sec">Клавиши</h2><div class="kgrid">';
  for(const a of ACTIONS){
    const on=listening===a[0];
    h+='<div class="krow"><span>'+a[1]+'</span><button class="kbtn'+(on?' listen':'')+'" type="button" data-key="'+a[0]+'">'+(on?'Нажми клавишу…':keyName(SAVE.keys[a[0]]))+'</button></div>';
  }
  h+='</div></div><div class="setrow"><button class="btn alt sm" type="button" data-keyreset="1">Сбросить клавиши</button><span class="sub">Esc отменяет привязку. Стрелки всегда двигают персонажа. Цифры 1-3 выбирают карточки уровня.</span></div>';
  h+='<div><h2 class="sec">Звук</h2><div class="setrow"><label for="vol" class="sub">Громкость</label><input id="vol" type="range" min="0" max="100" value="'+Math.round(SAVE.vol*100)+'"><label for="mus" class="sub">Музыка</label><input id="mus" type="range" min="0" max="100" value="'+Math.round((SAVE.mus===undefined?0.5:SAVE.mus)*100)+'"><button class="btn alt sm" type="button" data-mute="1">'+(SAVE.muted?'Включить звук':'Выключить звук')+'</button></div></div>';
  h+='<div><h2 class="sec">Подсказки</h2><div class="setrow"><button class="btn alt sm" type="button" data-hints="1">'+(SAVE.hints?'Подсказки новичку: вкл.':'Подсказки новичку: выкл.')+'</button><button class="btn alt sm" type="button" data-hintreset="1">Показать все заново</button><button class="btn alt sm" type="button" data-fps="1">'+(SAVE.fps?'Счётчик FPS: вкл.':'Счётчик FPS: выкл.')+'</button><span class="sub">Короткие советы вверху экрана, каждый показывается один раз.</span></div></div>';
  h+='<div><h2 class="sec">Данные</h2><div class="setrow"><button class="btn danger sm" type="button" data-wipe="1">'+(resetArmed?'Точно удалить всё? Нажми ещё раз':'Сбросить прогресс')+'</button><span class="sub">Прогресс хранится только в этом браузере.</span></div></div></section>';
  return h;
}
$('mpanel').addEventListener('click',e=>{
  const t=e.target.closest('button');
  if(!t)return;
  if(t.dataset.el){menuEl=t.dataset.el;renderMenu()}
  else if(t.dataset.start)startRun(menuEl);
  else if(t.dataset.meta){
    const m=META.find(x=>x.id===t.dataset.meta),l=SAVE.meta[m.id]||0,cost=m.c0+m.cs*l;
    if(l<m.max&&SAVE.ess>=cost){SAVE.ess-=cost;SAVE.meta[m.id]=l+1;store();sfx(700,0.12,'triangle',0.05,300);renderMenu()}
  }else if(t.dataset.key){listening=t.dataset.key;renderMenu()}
  else if(t.dataset.keyreset){SAVE.keys=Object.assign({},DEFKEYS);rebuildKeys();store();renderMenu()}
  else if(t.dataset.mute){SAVE.muted=!SAVE.muted;store();renderMenu()}
  else if(t.dataset.asc){SAVE.ascSel=clamp((SAVE.ascSel||0)+parseInt(t.dataset.asc,10),0,SAVE.asc||0);store();renderMenu()}
  else if(t.dataset.fps){SAVE.fps=!SAVE.fps;store();renderMenu()}
  else if(t.dataset.hints){SAVE.hints=!SAVE.hints;store();renderMenu()}
  else if(t.dataset.hintreset){SAVE.tut={};SAVE.hints=true;store();renderMenu()}
  else if(t.dataset.wipe){
    if(!resetArmed){resetArmed=1;renderMenu();return}
    resetArmed=0;const keep=SAVE.keys;SAVE=freshSave();SAVE.keys=keep;store();renderMenu();
  }
});
$('mpanel').addEventListener('input',e=>{if(e.target.id==='vol'){SAVE.vol=parseInt(e.target.value,10)/100;store();sfx(500,0.06,'triangle',0.05)}else if(e.target.id==='mus'){SAVE.mus=parseInt(e.target.value,10)/100;store()}});
$('tabs').addEventListener('click',e=>{
  const t=e.target.closest('.tab');
  if(t){menuTab=t.dataset.tab;listening=null;resetArmed=0;renderMenu()}
});
function finishListen(code){
  const a=listening;
  listening=null;
  if(code!=='Escape'&&a){
    for(const x of ACTIONS)if(x[0]!==a&&SAVE.keys[x[0]]===code)SAVE.keys[x[0]]=SAVE.keys[a];
    SAVE.keys[a]=code;
    rebuildKeys();store();
  }
  renderMenu();
}

