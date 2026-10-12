
/* =====================================================================
   РЕЛИКВИИ, СОБЫТИЯ, КОМБО — логика (данные в data/relics.js)
   ===================================================================== */

/* ---------- реликвии ---------- */
function relicChoices(bk){
  const g=G,own=new Set(g.relics);
  const pool=shuffle(RELIC_IDS.filter(id=>RELICS[id].boss===bk&&!own.has(id)));
  const extra=shuffle(RELIC_IDS.filter(id=>RELICS[id].boss!==bk&&!own.has(id)));
  const out=pool.slice(0,3);while(out.length<3&&extra.length)out.push(extra.shift());
  return out.map(id=>{const R=RELICS[id];return {kind:'relic',key:id,w:1,tag:'Реликвия · '+BOSS[R.boss].n,title:R.n,sub:R.st?statLine(R.st):'',desc:R.d,c1:'#ffd36b',c2:BOSS[R.boss].col}});
}
function relicTick(){
  const g=G;
  if(!g.relicQ||g.lvlOpen||g.over||g.shopOpen||g.treeOpen||g.paused)return;
  const bk=g.relicQ;g.relicQ=null;
  const ch=relicChoices(bk);if(!ch.length)return;
  g.pending++;openLevelUp(ch);$('luT').textContent='Трофей: '+BOSS[bk].n+' повержен — выбери реликвию';
}

/* ---------- комбо предметов ---------- */
function synActive(g){const ids=new Set(g.bag.filter(Boolean).map(b=>b.id));return SYN.filter(s=>s.ids.every(i=>ids.has(i)))}
function synUpdate(g,it){
  const on=synActive(g),prev=g.synOn||[];g.syn={};
  for(const s of on){if(s.k)g.syn[s.k]=1;if(s.st)for(const k in s.st)it[k]=(it[k]||0)+s.st[k]}
  for(const s of on)if(!prev.includes(s.n)&&g.t>0){toast('Комбо: '+s.n,s.d);sfx(880,0.25,'triangle',0.05,600)}
  g.synOn=on.map(s=>s.n);
}
function synTip(id){
  const g=G,L=SYN.filter(s=>s.ids.includes(id));if(!L.length)return '';
  return L.map(s=>{const o=ITEMS[s.ids.find(x=>x!==id)],on=g&&g.synOn&&g.synOn.includes(s.n);
    return '<div class="tsyn'+(on?' on':'')+'"><b>Комбо «'+s.n+'»</b>'+(on?' · активно':' · вместе с «'+o.n+'»')+'<br>'+s.d+'</div>'}).join('');
}

/* ---------- события между волнами ---------- */
function spawnEvents(){
  const g=G;g.evts=[];
  if(g.wave<2||Math.random()>0.6)return;
  const types=shuffle(Object.keys(EVTS)),n=g.wave>=10&&Math.random()<0.3?2:1;
  for(let i=0;i<n;i++){const a=rnd(0,TAU),q=freeSpot(g.p.x+Math.cos(a)*300,g.p.y+Math.sin(a)*300,40,170);g.evts.push({t:types[i],x:q.x,y:q.y,used:false,bob:rnd(0,TAU)})}
}
function nearEvent(){
  const g=G;if(g.phase!=='inter'||!g.evts)return null;
  for(const v of g.evts)if(!v.used&&(v.x-g.p.x)**2+(v.y-g.p.y)**2<85*85)return v;
  return null;
}
function useEvent(v){
  const g=G,p=g.p,w=g.wave;
  if(v.t==='altar'){
    const cost=g.S.maxHp*0.2;
    if(p.hp<=cost+1){toast('Алтарь молчит','Нужно больше здоровья');return}
    p.hp-=cost;g.sp++;g.pending++;
    ring(v.x,v.y,120,'#ff4d5e',0.6);puff(p.x,p.y,'#ff4d5e',20,200,0.6,3);toast('Алтарь крови','+1 очко навыков и карточка уровня');
  }else if(v.t==='chest'){
    const gold=Math.round(120+30*SW());p.gold+=gold;
    const ids=[];for(const k of ['smith','alch','mage','smug'])for(const id of MERCH[k].pool){const d=ITEMS[id];if(!d.scroll&&!d.ch&&d.price<500&&!g.bag.some(b=>b&&b.id===id))ids.push(id)}
    const id=pickOf(ids);let got='';
    if(id&&addToBag(id)){recalc();got=' и «'+ITEMS[id].n+'»'}else if(id){p.gold+=Math.round(ITEMS[id].price*0.5);got=' (рюкзак полон — ещё золото)'}
    g.curseW=w+1;
    ring(v.x,v.y,120,'#c47bff',0.6);puff(v.x,v.y,'#ffd36b',24,220,0.6,3);toast('Проклятый сундук','+'+gold+' золота'+got+'. Следующая волна крепче');
  }else if(v.t==='trial'){
    g.trialW=w+1;
    ring(v.x,v.y,140,'#ffd36b',0.6);toast('Испытание принято','Переживите следующую волну — получите награду');
  }
  v.used=true;sfx(520,0.3,'triangle',0.05,300);
}
function trialReward(){
  const g=G;if(g.trialW!==g.wave)return;
  const gold=Math.round(150+40*SW());g.p.gold+=gold;g.sp++;heal(g.S.maxHp*0.5);g.trialW=0;
  toast('Испытание пройдено','+'+gold+' золота, +1 очко навыков, лечение');
}
function drawEvents(g){
  if(!g.evts||!g.evts.length)return;
  const ne=nearEvent();
  for(const v of g.evts){
    if(!vis(v.x,v.y,90))continue;
    const E=EVTS[v.t],a=v.used?0.35:1,bob=Math.sin(anim*2+v.bob)*2;
    ctx.save();ctx.translate(v.x,v.y);ctx.globalAlpha=a;
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,16,26,8,0,0,TAU);ctx.fill();
    if(!v.used){ctx.globalCompositeOperation='lighter';glow(0,0,60,E.c,0.35+0.1*Math.sin(anim*3));ctx.globalCompositeOperation='source-over';ctx.globalAlpha=a}
    if(v.t==='altar'){
      ctx.fillStyle='#4a4550';ctx.fillRect(-22,-4,44,20);ctx.fillStyle='#5d5866';ctx.fillRect(-26,-10,52,8);
      ctx.fillStyle=v.used?'#5a2a30':'#c2263a';ctx.beginPath();ctx.ellipse(0,-10,14,4,0,0,TAU);ctx.fill();
      if(!v.used){ctx.fillStyle='#ff4d5e';for(let i=0;i<3;i++){const k=(anim*0.8+i/3)%1;ctx.globalAlpha=1-k;ctx.beginPath();ctx.arc(rnd(-6,6)*0+(i-1)*6,-14-k*26,2,0,TAU);ctx.fill()}ctx.globalAlpha=a}
    }else if(v.t==='chest'){
      ctx.translate(0,bob*0.3);
      ctx.fillStyle='#3a2a4a';ctx.fillRect(-20,-6,40,22);ctx.fillStyle='#4e3866';ctx.beginPath();ctx.moveTo(-21,-6);ctx.quadraticCurveTo(0,-24,21,-6);ctx.fill();
      ctx.fillStyle='#c9a24a';ctx.fillRect(-21,-7,42,3);ctx.fillRect(-3,-12,6,12);ctx.fillStyle='#c47bff';ctx.beginPath();ctx.arc(0,-2,3,0,TAU);ctx.fill();
    }else{
      ctx.fillStyle='#55555f';ctx.beginPath();ctx.moveTo(-10,16);ctx.lineTo(-7,-34);ctx.lineTo(0,-42);ctx.lineTo(7,-34);ctx.lineTo(10,16);ctx.closePath();ctx.fill();
      ctx.fillStyle=v.used?'#7a6a3a':'#ffd36b';ctx.globalAlpha=a*(0.7+0.3*Math.sin(anim*4));ctx.fillRect(-2,-30,4,16);ctx.fillRect(-6,-24,12,3);ctx.globalAlpha=a;
    }
    ctx.restore();
    ctx.save();ctx.textAlign='center';ctx.font='700 12px "Golos Text",system-ui,sans-serif';ctx.lineWidth=3;ctx.strokeStyle='rgba(10,12,18,.85)';
    const t=E.n+(v.used?' (использовано)':'');ctx.strokeText(t,v.x,v.y-52);ctx.fillStyle=v.used?'#8a90a2':E.c;ctx.fillText(t,v.x,v.y-52);
    if(v===ne){ctx.font='12px "Golos Text",system-ui,sans-serif';ctx.strokeText(E.d,v.x,v.y+34);ctx.fillStyle='#dfe5f3';ctx.fillText(E.d,v.x,v.y+34)}
    ctx.restore();
  }
}
