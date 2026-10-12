/* ---------- волны ---------- */
function startWave(w){
  const g=G;
  g.wave=w;g.phase='fight';g.wt=0;g.evts=[];
  if(g.curseW===w)toast('Проклятие сундука','Враги этой волны на 30% крепче');if(g.trialW===w)toast('Испытание','Врагов больше, и они злее. Выживи!');
  if(g.start==='wood'){g.season=(w-1)%4;const S0=SEAS[g.season];tickBuffs(0);ring(g.p.x,g.p.y,160,S0.c,0.8);puff(g.p.x,g.p.y,S0.c,24,220,0.8,3);g.tx.push({x:g.p.x,y:g.p.y-46,t:1.6,txt:'Сезон: '+S0.n+' ('+S0.d+')',big:true,col:S0.c})}g.spawnT=0.6;g.eliteT=rnd(12,18);g.evT=rnd(24,32);
  g.bossRef=null;g.bossDead=false;
  g.waveDur=Math.min(BAL.wave.durMax,BAL.wave.durBase+w);
  g.merch=[];
  if(g.shopOpen)closeShop();
  const bk=bossKeyFor(w);
  if(bk){tut('boss');
    const bs=bossHpScale(bk,w),pos=spawnPos();
    g.bossRef=spawnAt('boss_'+bk,pos.x,pos.y,bs,dmgMul(w),{boss:bk});
    toast(waveTitle(w),(w%(WPM*3)===0&&!g.endless?'Хранитель главы: ':'Босс: ')+BOSS[bk].n);
    sfx(70,0.7,'sawtooth',0.07,-20);
  }else{
    toast(waveTitle(w),w===1?'Двигайся, пока оружие бьёт само':'');
    sfx(300,0.2,'triangle',0.05,300);
  }
  nestSpawn();
  g.dockSig='';
}
function endWave(){
  const g=G,p=g.p;tut('inter');
  g.phase='inter';g.inter=BAL.wave.interTime;
  for(const e of g.en){if(!e.dead){e.dead=true;if(g.pt.length<320)puff(e.x,e.y,e.col,3,80,0.4,2)}}
  g.en.length=0;g.eps.length=0;g.tgs.length=0;
  for(const m of g.gem)m.fly=true;
  g.vac=4;
  heal(g.S.maxHp*ascMod('heal'));p.mana=g.S.maxMana;
  stockMerchants();
  spawnEvents();trialReward();
  {const bk=bossKeyFor(g.wave);if(bk&&g.bossDead)g.relicQ=bk}
  if(bossKeyFor(g.wave)&&!g.endless&&g.wave<WAVES_TOTAL){openSafeZone();sfx(500,0.4,'triangle',0.06,300);return}
  toast('Волна '+g.wave+' пройдена',(g.merch.some(m=>m.id==='tycoon')?'Пришёл Магнат Мидас! ':'')+'Пауза 60 секунд. Торговцы рядом.'+((g.wave+1)%6===0?' Копите золото: после следующей волны может прийти Магнат ('+tycoonNeed2(g.wave+1)+'+).':''));
  sfx(500,0.4,'triangle',0.06,300);
}
function waveTitle(w){
  const g=G;
  if(g.endless)return 'Волна '+w+' · бесконечный режим';
  return 'Карта '+mapStage(w)+' из 3 · волна '+mapWave(w)+' из '+WPM;
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t}return a}
function priceOf(id,mid){
  const g=G,d=ITEMS[id];
  let pr=d.price*(1+0.03*(SW()-1))*(1-0.03*(SAVE.meta.discount||0));
  if(mid==='smug')pr*=1.15;
  pr*=ascMod('price');
  return Math.max(10,Math.round(pr/5)*5);
}
function genStock(mid){
  const g=G,M=MERCH[mid];
  if(M.special==='swap')return [];
  const have=id=>ITEMS[id].ch?false:(g.bought[id]||g.bag.some(b=>b&&b.id===id));
  const list=shuffle(M.pool.filter(id=>!have(id))).slice(0,M.cnt);
  const owned=id=>g.slots.some(s=>s&&s.id===id);
  if(M.scrolls){
    const cands=shuffle((isAva(g)?SKILL_IDS.concat(SYM_IDS):SKILL_IDS.filter(k=>AB[k].els[0]===g.start)).filter(k=>!owned(k)));
    for(let i=0;i<M.scrolls&&i<cands.length;i++)list.push('scr:'+cands[i]);
  }
  if(M.fscroll&&isAva(g)){
    const cands=shuffle(FUSE_IDS.filter(k=>!owned(k)));
    if(cands.length)list.push('scr:'+cands[0]);
  }
  return list.map(id=>({id:id,sold:false}));
}
function tycoonNeed2(w){return Math.round(200+25*effW(w))}
function tycoonNeed(){return tycoonNeed2(G.wave)}
function invPrice(s){return Math.round(s.p*(1+0.55*((G.inv||{})[s.k]||0))/5)*5}
function awkPrice(){return BAL.shop.awkBase+BAL.shop.awkStep*(G.awk||0)}
function stockMerchants(){
  const g=G;
  const ids=['smith','alch','mage'];
  if(g.wave>=3||Math.random()<0.4)ids.push('smug');
  shuffle(ids);
  const n=Math.min(ids.length,3);
  g.merch=[];
  const a0=rnd(0,TAU);
  for(let i=0;i<n;i++){
    const a=a0+i*TAU/n,d=rnd(180,220);
    const q=freeSpot(g.p.x+Math.cos(a)*d,g.p.y+Math.sin(a)*d,48,200);
    g.merch.push({id:ids[i],x:q.x,y:q.y,stock:genStock(ids[i]),bob:rnd(0,TAU)});
  }
  if(g.wave%6===0&&g.p.gold>=tycoonNeed()){
    const a=a0+TAU*(n-0.5)/n,d=rnd(260,300);
    const q=freeSpot(g.p.x+Math.cos(a)*d,g.p.y+Math.sin(a)*d,48,200);
    g.merch.push({id:'tycoon',x:q.x,y:q.y,stock:genStock('tycoon'),bob:0});
  }
  if(g.wave>=2&&g.wave%2===0&&g.slots.some(s=>s)){
    const a=a0+TAU/(2*n),d=rnd(240,280);
    const q=freeSpot(g.p.x+Math.cos(a)*d,g.p.y+Math.sin(a)*d,48,200);
    g.merch.push({id:'sage',x:q.x,y:q.y,stock:[],bob:0,sel:-1});
  }
}
function nearMerchant(){
  const g=G;
  if(g.phase!=='inter')return null;
  let b=null,bd=95*95;
  for(const m of g.merch){const dx=m.x-g.p.x,dy=m.y-g.p.y,d=dx*dx+dy*dy;if(d<bd){bd=d;b=m}}
  return b;
}

