/* =====================================================================
   СОВМЕСТНАЯ ИГРА: несколько героев в одном мире.
   Каждый герой — свой объект состояния (как G в одиночной игре). Поля мира (враги, волна,
   карта, торговцы…) у всех героев — общие: это свойства-ссылки на один объект W.
   Переключение «чей сейчас ход» — просто G=H[i]: весь старый код работает как раньше.
   Всё случайное во время такта идёт от общего сида (Math.random подменяется), поэтому
   у обоих игроков мир считается одинаково — по сети передаются только нажатия (lockstep.js).
   ===================================================================== */
const WORLD_KEYS=['map','binst','ox','oy','gk','solids','pools','decors','pch','sk','dv','rt','wind','hzT','bliz',
  'wave','phase','wt','inter','waveDur','spawnT','evT','eliteT','endT','bossRef','bossDead','bossKills','endless','victory','over','paused',
  'kills','t','slowmo','zk','slowAll','slowAllF','en','eps','tgs','gem','pk','merch','evts','feat','portals','safe','risk','riskRun',
  'curseW','trialW','ch','asc','essPaid','darkAdd','flashA','atkSrc','stockT'];
/* общий генератор случайных чисел (mulberry32) */
function seedRng(seed){let a=seed>>>0;return function(){a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function withSim(fn){const r=Math.random;Math.random=COOP.rng;try{return fn()}finally{Math.random=r}}
function worldify(h,W){
  for(const k of WORLD_KEYS){
    if(!(k in W))W[k]=h[k];
    delete h[k];
    Object.defineProperty(h,k,{get(){return W[k]},set(v){W[k]=v},enumerable:true,configurable:true});
  }
}
/* cfg: {seed, ch, asc, heroes:[{start,meta,name}], me, net} */
function coopStart(cfg){
  clearRun();
  const ch=clamp(cfg.ch||1,1,CHAP.length),map=CHAP[ch-1].maps[0];
  COOP={H:[],me:cfg.me,cfg,net:cfg.net||null,W:{},rng:seedRng(cfg.seed),tick:0};lsReset();
  withSim(()=>{
    cfg.heroes.forEach((hc,i)=>{
      const h=mkState(hc.start,map);
      worldify(h,COOP.W);
      h.idx=i;h.name=hc.name||('Игрок '+(i+1));h.meta=hc.meta||{};
      h.metaRevive=(h.meta.revive||0)>0;
      h.inp={x:0,y:0,ax:0,ay:0,aim:false,held:0};
      h.down=false;h.rev=0;
      COOP.H.push(h);
    });
    const W=COOP.W;W.ch=ch;W.asc=cfg.asc||0;
    COOP.H.forEach((h,i)=>{
      G=h;
      if(h.start==='avatar')h.pending++;else h.el[h.start]=1;
      h.p.x=(i-(COOP.H.length-1)/2)*60;h.p.y=0;
      recalc();h.p.hp=h.S.maxHp;h.p.mana=h.S.maxMana;
      h.p.gold=30+25*(h.meta.startgold||0);
    });
    G=COOP.H[0];
    placeFeature();
    startWave(1);
  });
  G=COOP.H[COOP.me];
  mode='play';
  cam.x=G.p.x-VW/2;cam.y=G.p.y-VH/2;
  $('menu').hidden=true;$('over').hidden=true;$('pause').hidden=true;$('levelup').hidden=true;$('shop').hidden=true;
  $('hud').hidden=false;
  if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
  hc={};buildTopHud();showBiome(G.map);
  hintQ=[];hintT=0;$('hint').hidden=true;
  coopHud(true);
}
function coopEnd(){
  if(!COOP)return;
  if(COOP.net)netClose();
  COOP=null;coopHud(false);
}
/* такт мира: все герои + враги. dt фиксированный */
function coopTick(dt){
  const H=COOP.H,W=COOP.W;
  COOP.tick++;
  if(W.over)return;
  if(W.paused||H.some(h=>h.lvlOpen||h.shopOpen||h.treeOpen))return;
  G=H[0];
  if(W.slowmo>0){W.slowmo-=dt;dt*=0.35}
  W.zk=Math.max(0,W.zk-dt*0.2);
  gatherWorld(G,G.p.x,G.p.y);
  W.t+=dt;
  for(const h of H){G=h;if(h.down){h.p.vx=h.p.vy=0;continue}heroUpdate(dt)}
  const al=heroList();G=al.length?al[Math.floor(Math.random()*al.length)]:H[0];
  worldUpdate(dt);
  for(const h of H){G=h;heroPost(dt)}
  reviveTick(dt);
  G=H[COOP.me];
}
function nearHero(x,y){
  let b=null,bd=1e18;
  for(const h of COOP.H){if(h.down)continue;const d=(h.p.x-x)**2+(h.p.y-y)**2;if(d<bd){bd=d;b=h}}
  return b||COOP.H[0];
}
function coopDown(g){
  g.down=true;g.rev=0;g.p.hp=0;g.chan=null;
  puff(g.p.x,g.p.y,'#ff6b7a',24,200,0.6,3);ring(g.p.x,g.p.y,90,'#ff6b7a',0.6);
  if(COOP.H.every(h=>h.down)){G=COOP.H[COOP.me];endRun(false);return}
  if(isLocal())toast('Вы упали','Друг может поднять вас — пусть постоит рядом 2,5 секунды');
  else{const me=G;G=COOP.H[COOP.me];toast(me.name+' упал','Подойдите и постойте рядом, чтобы поднять');G=me}
}
function reviveTick(dt){
  for(const d of COOP.H){
    if(!d.down)continue;
    const near=COOP.H.some(h=>!h.down&&(h.p.x-d.p.x)**2+(h.p.y-d.p.y)**2<75*75);
    d.rev=near?d.rev+dt:Math.max(0,d.rev-dt*0.5);
    if(d.rev>=2.5){
      const me=G;G=d;
      d.down=false;d.rev=0;d.p.hp=d.S.maxHp*0.4;d.p.inv=2;
      ring(d.p.x,d.p.y,120,'#9fffb0',0.6);puff(d.p.x,d.p.y,'#9fffb0',20,200,0.6,3);
      G=me;
    }
  }
}
/* опыт и золото — общие */
function shareXp(v){if(!COOP){gainXp(v);return}const me=G;for(const h of COOP.H){G=h;gainXp(v)}G=me}
function shareGold(n){if(!COOP){G.p.gold+=n;return}for(const h of COOP.H)h.p.gold+=n}
/* после волны: все встают и лечатся */
function coopWaveHeal(){
  if(!COOP)return;
  const me=G;
  for(const h of COOP.H){G=h;if(h.down){h.down=false;h.rev=0;h.p.hp=1}heal(h.S.maxHp*ascMod('heal'));h.p.mana=h.S.maxMana}
  G=me;
}
/* после портала: друзья переносятся к вошедшему */
function coopGather(){
  if(!COOP)return;
  let i=0;for(const h of COOP.H){if(h===G)continue;i++;h.p.x=G.p.x+i*50;h.p.y=G.p.y+20;h.p.vx=h.p.vy=0;h.down=false;if(h.p.hp<=0)h.p.hp=h.S.maxHp*0.4}
}
/* ---------- полоска друга и состояние сети ---------- */
function coopHud(on){
  let el=$('coopBar');
  if(!on){if(el)el.hidden=true;const w=$('coopWait');if(w)w.hidden=true;return}
  if(!el){el=document.createElement('div');el.id='coopBar';$('hud').appendChild(el)}
  el.hidden=false;
  if(!$('coopWait')){const w=document.createElement('div');w.id='coopWait';w.hidden=true;document.body.appendChild(w)}
}
function coopHudTick(){
  if(!COOP)return;
  const el=$('coopBar');if(!el)return;
  let h='';
  COOP.H.forEach((q,i)=>{if(i===COOP.me)return;
    const E=hEl(q.start),st=q.down?'упал — подойди и подними':q.lvlOpen?'выбирает карточку':q.shopOpen?'в лавке':q.treeOpen?'в древе навыков':'';
    h+='<div class="cb"><b style="color:'+E.c+'">'+q.name+'</b><small>'+(q.start==='avatar'?'Аватар':CLS[q.start].n)+' · ур. '+q.p.lv+'</small>'
      +'<i><u style="width:'+Math.round(clamp(q.p.hp/q.S.maxHp,0,1)*100)+'%"></u></i>'+(st?'<em>'+st+'</em>':'')+'</div>'});
  const me=COOP.H[COOP.me];
  if(me.down)h+='<div class="cb down"><b>Вы упали</b><em>Друг поднимет вас, если постоит рядом ('+Math.round(me.rev/2.5*100)+'%)</em></div>';
  if(el._h!==h){el._h=h;el.innerHTML=h}
}
/* имена над героями */
function drawNameTags(){
  if(!COOP)return;
  ctx.save();ctx.font='bold 12px sans-serif';ctx.textAlign='center';
  COOP.H.forEach((h,i)=>{const p=h.p,E=hEl(h.start);ctx.fillStyle='rgba(0,0,0,.55)';const w=ctx.measureText(h.name).width+10;ctx.fillRect(p.x-w/2,p.y-46,w,16);
    ctx.fillStyle=i===COOP.me?'#ffffff':E.c;ctx.fillText(h.name,p.x,p.y-34);
    if(h.down){ctx.strokeStyle='#9fffb0';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,30,-Math.PI/2,-Math.PI/2+TAU*h.rev/2.5);ctx.stroke();ctx.fillStyle='#ff6b7a';ctx.fillText('упал',p.x,p.y+44)}});
  ctx.restore();ctx.textAlign='left';
}
