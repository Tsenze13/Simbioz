/* ---------- прокачка ---------- */
function gainXp(v){
  const g=G,p=g.p;
  p.xp+=v*(1+g.S.xpm);
  while(p.xp>=p.need){p.xp-=p.need;p.lv++;p.need=needFor(p.lv);g.pending++;g.sp++;recalc();if(p.lv===ULT_LV)toast('Ульта доступна','Древо (T) → Ульта: выберите её за 1 очко навыков');else if(g.ult.kind&&BAL.hero.ultLvReq.indexOf(p.lv)>0&&g.ult.lv<3)toast('Ульту можно усилить','Древо (T) → Ульта')}
}
function buildChoices(){
  const g=G,pool=[];
  for(const k of EK){
    const l=g.el[k],E=EL[k];
    if(l===0){if(g.el[OPP[k]]>0)continue;pool.push({w:2.2,kind:'el',key:k,tag:'Новая стихия',title:E.n,sub:'Открывает: '+EW[k].w,desc:EW[k].d+'. Закроет противоположную стихию «'+EL[OPP[k]].n+'».',c1:E.c,c2:E.c2})}
    else if(l<(k===g.start?5:4))pool.push({w:3,kind:'el',key:k,tag:'Стихия',title:E.n,sub:'Уровень '+l+' → '+(l+1),desc:EUP[k][l-1],c1:E.c,c2:E.c2});
  }
  if(g.el.metal>0&&g.guns.length<((g.cls&&g.cls.maxGuns)||3)){
    const have=new Set(g.guns.map(x=>x.t));if(g.hand)have.add(g.hand.t);
    for(const k of GUN_IDS)if(!have.has(k))pool.push({w:3.4,kind:'gun',key:k,tag:'Оружие · Металл',title:GUNS[k].n,sub:'Парит вокруг вас и стреляет само',desc:GUNS[k].d,c1:EL.metal.c,c2:EL.metal.c2});
  }
  if(g.el.metal>0){
    const own=g.guns.map(x=>x.t);if(g.hand)own.push(g.hand.t);const GM=g.gmods||{},MU=g.gmu||{};
    for(const t of new Set(own))if(!GM[t]&&GMOD[t]){const L=GMOD[t];for(const m of L)pool.push({w:3.6/L.length,kind:'gunmod',key:t,mk:m.k,tag:'Модификация · '+GUNS[t].n,title:m.n,sub:'Одна модификация на ствол',desc:m.d,c1:EL.metal.c,c2:'#ffd36b'})}
    for(const q in GMODU)if(!MU[q])pool.push({w:1.1,kind:'gmodule',key:q,tag:'Модуль · все стволы',title:GMODU[q].n,sub:'Ставится на все орудия',desc:GMODU[q].d,c1:EL.metal.c,c2:EL.metal.c2});
  }
  const free=freeSlot()>=0;
  const lvOf=id=>{const s=g.slots.find(x=>x&&x.id===id);return s?s.lv:0};
  const mc=a=>'Мана '+a.mana+' · Перезарядка '+a.cd+' с';
  for(const k of SKILL_IDS.concat(SYM_IDS)){
    const a=AB[k],l=lvOf(k);
    const ok=a.cat==='skill'?g.el[a.els[0]]>=1:(g.el[a.pair[0]]>=2&&g.el[a.pair[1]]>=2);
    if(l===0){
      if(ok&&free)pool.push({w:a.cat==='sym'?3.5:1.6,kind:'skill',key:k,tag:a.cat==='sym'?'Симбиоз':'Новый навык',title:a.n,sub:a.cat==='sym'?EL[a.pair[0]].n+' + '+EL[a.pair[1]].n:EL[a.els[0]].n+(a.role?' · '+a.role:''),desc:a.d,mc:mc(a),c1:a.c1,c2:a.c2,dual:a.cat==='sym'});
    }
  }
  for(const k of FUSE_IDS){
    const a=AB[k],l=lvOf(k);
    if(l===0){
      if(lvOf(a.a)>=2&&lvOf(a.b)>=2)pool.push({w:8,kind:'fuse',key:k,tag:'Слияние навыков',title:a.n,sub:AB[a.a].n+' + '+AB[a.b].n,desc:a.d+' Заменяет оба навыка одним.',mc:mc(a),c1:a.c1,c2:a.c2,dual:true});
    }else if(l<5)pool.push({w:3.2,kind:'skill',key:k,tag:'Слияние',title:a.n,sub:'Уровень '+l+' → '+(l+1),desc:a.up[l-1],c1:a.c1,c2:a.c2,dual:true});
  }
  for(const s of STC){
    const n=g.pass[s.k]||0;
    const mx=s.max||5;
    if(n<mx)pool.push({w:s.k==='dch'?0.7:0.9,kind:'pas',key:s.k,tag:s.k==='dch'||s.k==='drc'?'Рывок':'Стат',title:s.n,sub:'Улучшение '+(n+1)+' из '+mx,desc:s.d,c1:'#b79bff',c2:'#e0d4ff'});
  }
  const out=[];
  for(let i=0;i<3&&pool.length;i++){
    let sum=0;for(const c of pool)sum+=c.w;
    let r=Math.random()*sum,idx=0;
    for(;idx<pool.length;idx++){r-=pool[idx].w;if(r<=0)break}
    if(idx>=pool.length)idx=pool.length-1;
    out.push(pool.splice(idx,1)[0]);
  }
  return out;
}
function applyChoice(c){
  const g=G,p=g.p;
  if(c.kind==='gun'){g.guns.push({t:c.key,cd:0,aim:0,fl:0,rec:0});toast('Оружие: '+GUNS[c.key].n,'Теперь вокруг вас парят '+g.guns.length+' ствола')}
  else if(c.kind==='gunmod'){(g.gmods||(g.gmods={}))[c.key]=c.mk;toast(GUNS[c.key].n+': '+c.title,c.desc);sfx(640,0.15,'triangle',0.05,200)}
  else if(c.kind==='gmodule'){(g.gmu||(g.gmu={}))[c.key]=1;if(c.key==='mag')for(const gn of allGuns(g))if(gn.am!==undefined&&!(gn.rl>0))gn.am=gunMag(gn);toast('Модуль: '+c.title,c.desc)}
  else if(c.kind==='el'){
    g.el[c.key]++;
    if(g.el[c.key]===1)toast(EL[c.key].n,'Открыт навык «'+AB[ELSK[c.key]].n+'»');
  }else if(c.kind==='skill'){
    learnSkill(c.key);
    if(AB[c.key].cat==='sym'&&(g.slots.find(s=>s&&s.id===c.key)||{}).lv===1)toast('Симбиоз: '+AB[c.key].n,EL[AB[c.key].pair[0]].n+' + '+EL[AB[c.key].pair[1]].n);
  }else if(c.kind==='fuse'){
    doFuse(c.key);
    toast('Слияние: '+AB[c.key].n,AB[AB[c.key].a].n+' + '+AB[AB[c.key].b].n);
    ring(p.x,p.y,150,AB[c.key].c1,0.8);puff(p.x,p.y,AB[c.key].c2,34,280,0.8,3.5);
  }else if(c.kind==='ult'){g.ult.lv++}
  else{
    g.pass[c.key]=(g.pass[c.key]||0)+1;
    if(c.key==='hp')heal(25);
  }
  p.hp=Math.min(g.S.maxHp,p.hp+8);
  recalc();
}

