/* =====================================================================
   ЛАВКА
   ===================================================================== */
let shopM=null,shopMsg='';
function openShop(m){
  const g=G;
  if(!g||g.shopOpen)return;
  g.shopOpen=true;g.shopMi=g.merch.indexOf(m);if(!isLocal())return;shopM=m;shopMsg='';
  for(const k in codes)codes[k]=false;
  joy.on=false;joy.dx=joy.dy=0;
  renderShop();
  $('shop').hidden=false;
  sfx(440,0.1,'triangle',0.04,200);
}
function closeShop(){
  const g=G;
  if(!g)return;
  g.shopOpen=false;if(!isLocal())return;shopM=null;$('shop').hidden=true;$('tip').hidden=true;
}
function itemCard(id,price,sold,afford){
  const d=ITEMS[id];
  const R=RAR[d.rar||0];
  return '<span class="slot r'+(d.rar||0)+'" style="--c1:'+d.c[0]+';--c2:'+d.c[1]+'"><span class="ic">'+iconItem(d)+'</span></span><strong style="color:'+(d.rar?R.c:'inherit')+'">'+d.n+'</strong><span class="tags"><span class="rar" style="color:'+R.c+'">'+R.n+'</span> · '+d.tag+(d.mana?' · мана '+d.mana:'')+(d.cd&&d.cast&&!d.ch?' · откат '+d.cd+' с':'')+'</span><p>'+d.d+(d.st?'<br><span style="color:#9fe0ff">'+statLine(d.st)+'</span>':'')+'</p>';
}
function sagePrice(s){return Math.round(45+28*s.lv+25*(G.swaps||0))}
function sageCands(){
  const g=G,out=[];
  for(const k of SKILL_IDS.concat(SYM_IDS)){
    const a=AB[k];
    if(g.slots.some(s=>s&&s.id===k))continue;
    const ok=a.cat==='skill'?g.el[a.els[0]]>=1:(g.el[a.pair[0]]>=2&&g.el[a.pair[1]]>=2);
    if(ok)out.push(k);
  }
  return out;
}
function sageSwap(m,i,k){
  const g=G,s=g.slots[i];
  if(!s||!AB[k])return 'Навык не найден';
  const price=sagePrice(s);
  if(g.p.gold<price)return 'Не хватает золота';
  g.p.gold-=price;
  const n=g.nodes[s.id];let back=0;
  if(n){back=(n.a||0)+(n.b||0)+(n.c||0);g.sp+=back;delete g.nodes[s.id]}
  const old=AB[s.id].n;
  g.slots[i]={id:k,lv:2,cd:0,cdMax:1};
  if(AB[k].cat==='sym')g.symKnown[k]=true;
  g.swaps=(g.swaps||0)+1;g.dockSig='';m.sel=-1;
  recalc();
  sfx(520,0.2,'triangle',0.05,300);
  return '«'+old+'» забыт, «'+AB[k].n+'» начинает с 2 уровня'+(back?'. Очки навыков вернулись: '+back:'');
}
function renderSage(m,M,tabs){
  const g=G;let body='';
  const coin='<span class="coin"></span>';
  if(m.sel===undefined)m.sel=-1;
  if(m.sel<0||!g.slots[m.sel]){
    m.sel=-1;
    body+='<h2 class="sec" style="grid-column:1/-1">1. Какой навык забыть? Цена растёт с уровнем навыка и с каждой сменой.</h2>';
    g.slots.forEach((s,i)=>{
      if(!s)return;
      const a=AB[s.id],price=sagePrice(s),can=g.p.gold>=price,n=g.nodes[s.id],back=n?(n.a||0)+(n.b||0)+(n.c||0):0;
      body+='<button class="btn alt sagecard" type="button" data-sage="old:'+i+'" style="--c1:'+a.c1+'"><span class="orb sm" style="--c1:'+a.c1+';--c2:'+a.c2+'"></span><span><b>'+a.n+'</b> · ур. '+s.lv+'<br><small>'+(back?'Вернёт очков навыков: '+back+'. ':'')+'</small></span><span class="price'+(can?'':' no')+'">'+coin+price+'</span></button>';
    });
    if(!g.slots.some(s=>s))body+='<p>У вас нет навыков, которые можно забыть.</p>';
  }else{
    const s=g.slots[m.sel],a=AB[s.id],c=sageCands();
    body+='<h2 class="sec" style="grid-column:1/-1">2. Чему научиться вместо «'+a.n+'»? Новый навык начнёт сразу со 2 уровня.</h2>';
    for(const k of c){
      const b=AB[k];
      body+='<button class="btn alt sagecard" type="button" data-sage="new:'+k+'" style="--c1:'+b.c1+'"><span class="orb sm'+(b.cat==='sym'?' dual':'')+'" style="--c1:'+b.c1+';--c2:'+b.c2+'"></span><span><b>'+b.n+'</b><br><small>'+(b.cat==='sym'?EL[b.pair[0]].n+' + '+EL[b.pair[1]].n:EL[b.els[0]].n+(b.role?' · '+b.role:''))+'</small></span></button>';
    }
    if(!c.length)body+='<p>Нет подходящих навыков: откройте больше стихий.</p>';
    body+='<button class="btn" type="button" data-sage="back" style="grid-column:1/-1">← Назад</button>';
  }
  $('shop').innerHTML='<div class="shop"><div class="shop-head"><div><h3 style="color:'+M.col+'">'+M.n+'</h3><p>«'+M.q+'»</p></div><div class="mtabs">'+tabs+'</div><div class="gold" id="shopGold"><span class="coin"></span>'+Math.floor(g.p.gold)+'</div></div>'
    +'<div class="stock" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;align-content:start">'+body+'</div>'
    +'<div class="bagside"><h2 class="sec">Смена навыка</h2><div class="hint" id="shopMsg">'+(shopMsg||'Навык и его прокачка исчезают, потраченные очки навыков возвращаются. Новый навык начнёт со 2 уровня.')+'</div><button class="btn" type="button" data-close="1">Закрыть ('+keyName(SAVE.keys.use)+')</button></div></div>';
}
function renderShop(){
  const g=G,m=shopM;
  if(!m)return;
  const M=MERCH[m.id];
  let tabs='';
  for(const x of g.merch)tabs+='<button class="btn alt sm'+(x===m?' on':'')+'" type="button" data-merch="'+g.merch.indexOf(x)+'">'+MERCH[x.id].n+'</button>';
  $('tip').hidden=true;
  if(M.special==='swap'){renderSage(m,M,tabs);return}
  let st='';
  if(M.special==='invest'){
    const coin='<span class="coin"></span>';
    st+='<h2 class="sec" style="grid-column:1/-1">Вложения: усиление навсегда (до '+INV_MAX+' раз каждое, цена растёт)</h2>';
    for(const s of INVEST){
      const n=g.inv[s.k]||0,pr=invPrice(s),can=g.p.gold>=pr,full=n>=INV_MAX;
      st+='<button class="btn alt sagecard" type="button" data-inv="'+s.k+'"'+(full?' disabled':'')+'><span><b>'+s.n+'</b> · '+n+'/'+INV_MAX+'<br><small>'+s.d+'</small></span><span class="price'+(can?'':' no')+'">'+(full?'макс.':coin+pr)+'</span></button>';
    }
    for(const k of EK){
      const l=g.el[k],cap=elCap(k);
      if(l<1||l>=cap)continue;
      const pr=awkPrice(),can=g.p.gold>=pr;
      st+='<button class="btn alt sagecard" type="button" data-awk="'+k+'" style="--c1:'+EL[k].c+'"><span class="orb sm" style="--c1:'+EL[k].c+';--c2:'+EL[k].c2+'"></span><span><b>Пробуждение: '+EL[k].n+'</b> · ур. '+l+' → '+(l+1)+'<br><small>Стихия становится сильнее, как за карточку уровня</small></span><span class="price'+(can?'':' no')+'">'+coin+pr+'</span></button>';
    }
    const sp=BAL.shop.spBase+BAL.shop.spStep*(g.spb||0),cs=g.p.gold>=sp;
    st+='<button class="btn alt sagecard" type="button" data-inv="__sp"><span><b>Озарение</b><br><small>+1 очко навыков</small></span><span class="price'+(cs?'':' no')+'">'+coin+sp+'</span></button>';
    st+='<h2 class="sec" style="grid-column:1/-1">Редкие предметы: нигде больше не продаются</h2>';
  }
  m.stock.forEach((s,i)=>{
    const price=priceOf(s.id,m.id),can=g.p.gold>=price;
    st+='<div class="item'+(s.sold?' sold':'')+'" data-r="'+(ITEMS[s.id].rar||0)+'" data-tipid="'+s.id+'" style="--rc:'+RAR[ITEMS[s.id].rar||0].c+'">'+itemCard(s.id)+'<div class="buy"><span class="price'+(can?'':' no')+'"><span class="coin"></span>'+price+'</span><button class="btn sm" type="button" data-buy="'+i+'"'+(s.sold?' disabled':'')+'>'+(s.sold?'Продано':'Купить')+'</button></div></div>';
  });
  let bag='';
  for(let i=0;i<6;i++){
    const x=g.bag[i];
    if(x){const d=ITEMS[x.id];bag+='<button class="slot item r'+(d.rar||0)+'" type="button" tabindex="-1" data-sell="'+i+'" data-tipown="'+x.id+'" style="--c1:'+d.c[0]+';--c2:'+d.c[1]+'"><span class="ic">'+iconItem(d)+'</span>'+(d.ch?'<span class="ch">'+x.ch+'</span>':'')+'</button>'}
    else bag+='<span class="slot item empty"></span>';
  }
  $('shop').innerHTML='<div class="shop"><div class="shop-head"><div><h3 style="color:'+M.col+'">'+M.n+'</h3><p>«'+M.q+'»</p></div><div class="mtabs">'+tabs+'</div><div class="gold" id="shopGold"><span class="coin"></span>'+Math.floor(g.p.gold)+'</div></div>'
    +'<div class="stock"'+(M.special==='invest'?' style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;align-content:start"':'')+'>'+st+'</div>'
    +'<div class="bagside"><h2 class="sec">Рюкзак (нажми, чтобы продать за половину цены)</h2><div class="bag">'+bag+'</div><div class="hint" id="shopMsg">'+(shopMsg||'Расходники складываются в один слот.')+'</div><button class="btn" type="button" data-close="1">Закрыть ('+keyName(SAVE.keys.use)+')</button></div></div>';
}
$('shop').addEventListener('mouseover',e=>{
  const tip=$('tip'),el=e.target.closest('[data-tipid],[data-tipown]');
  if(!el||!G||uiTouch){tip.hidden=true;return}
  const id=el.dataset.tipid||el.dataset.tipown;if(!ITEMS[id]){tip.hidden=true;return}
  tip.innerHTML=itemTip(id,!!el.dataset.tipown);tip.hidden=false;
  const r=el.getBoundingClientRect(),tw=tip.offsetWidth,th=tip.offsetHeight;
  let x=r.right+10;if(x+tw>innerWidth-8)x=r.left-tw-10;if(x<8)x=clamp(r.left,8,innerWidth-tw-8);
  tip.style.left=x+'px';tip.style.top=clamp(r.top,8,innerHeight-th-8)+'px';
});
$('shop').addEventListener('mouseout',e=>{if(!e.relatedTarget||!e.relatedTarget.closest||!e.relatedTarget.closest('[data-tipid],[data-tipown]'))$('tip').hidden=true});
/* действие в лавке: выполняется для героя, который его сделал (в совместной игре — по сети) */
function shopAct(kind,mi,a,b){
  const g=G;if(!g)return '';
  const M=g.merch[mi];let msg='';
  if(kind==='sp'){
    const pr=BAL.shop.spBase+BAL.shop.spStep*(g.spb||0);
    if(g.p.gold<pr)msg='Не хватает золота';else{g.p.gold-=pr;g.sp++;g.spb=(g.spb||0)+1;msg='Очко навыков получено';sfx(700,0.12,'triangle',0.05,300)}
  }else if(kind==='inv'){
    const s=INVEST.find(x=>x.k===a),n=g.inv[s.k]||0,pr=invPrice(s);
    if(n>=INV_MAX)msg='Уже на максимуме';else if(g.p.gold<pr)msg='Не хватает золота';else{g.p.gold-=pr;g.inv[s.k]=n+1;recalc();msg=s.n+': '+s.d;sfx(700,0.12,'triangle',0.05,300)}
  }else if(kind==='awk'){
    const k=a,pr=awkPrice();
    if(g.p.gold<pr)msg='Не хватает золота';else if(g.el[k]>=(k===g.start?5:4))msg='Стихия уже на максимуме';else{g.p.gold-=pr;g.el[k]++;g.awk=(g.awk||0)+1;recalc();msg=EL[k].n+' стала сильнее';sfx(560,0.2,'triangle',0.05,400)}
  }else if(kind==='sage'&&M){msg=sageSwap(M,a,b)}
  else if(kind==='buy'&&M){msg=buyItem(M,a)||'Куплено'}
  else if(kind==='sell'){sellItem(a);msg='Продано'}
  if(isLocal()&&g.shopOpen){shopMsg=msg;renderShop()}
  return msg;
}
$('shop').addEventListener('click',e=>{
  const g=G;
  if(!g||!shopM)return;
  const mi=g.merch.indexOf(shopM);
  const buy=e.target.closest('[data-buy]'),sell=e.target.closest('[data-sell]'),tab=e.target.closest('[data-merch]'),cl=e.target.closest('[data-close]');
  const iv=e.target.closest('[data-inv]'),aw=e.target.closest('[data-awk]');
  if(iv){if(iv.dataset.inv==='__sp')A('shop','sp',mi);else A('shop','inv',mi,iv.dataset.inv);return}
  if(aw){A('shop','awk',mi,aw.dataset.awk);return}
  const sg=e.target.closest('[data-sage]');
  if(sg){
    const v=sg.dataset.sage;
    if(v==='back')shopM.sel=-1;
    else if(v.indexOf('old:')===0){shopM.sel=parseInt(v.slice(4),10);shopMsg=''}
    else if(v.indexOf('new:')===0){A('shop','sage',mi,shopM.sel,v.slice(4));return}
    renderShop();return;
  }
  if(buy)A('shop','buy',mi,parseInt(buy.dataset.buy,10));
  else if(sell)A('shop','sell',mi,parseInt(sell.dataset.sell,10));
  else if(tab){shopM=g.merch[parseInt(tab.dataset.merch,10)];shopMsg='';renderShop()}
  else if(cl)A('closeShop');
  else if(e.target===$('shop'))A('closeShop');
});

