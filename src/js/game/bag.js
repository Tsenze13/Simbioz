/* ---------- рюкзак ---------- */
function addToBag(id){
  const g=G,d=ITEMS[id];
  if(d.ch){
    const ex=g.bag.find(b=>b&&b.id===id);
    if(ex){ex.ch=Math.min(9,ex.ch+d.ch);g.dockSig='';return true}
  }
  const i=g.bag.findIndex(b=>!b);
  if(i<0)return false;
  g.bag[i]={id:id,ch:d.ch||0,cd:0,cdMax:1};
  recalc();
  return true;
}
function freeSlot(){return G.slots.findIndex(s=>!s)}
function learnSkill(id){
  const g=G,a=AB[id];
  const ex=g.slots.find(s=>s&&s.id===id);
  if(ex){if(ex.lv>=5)return false;ex.lv++;g.dockSig='';return true}
  const i=freeSlot();
  if(i<0)return false;
  g.slots[i]={id:id,lv:1,cd:0,cdMax:1};
  if(a.cat==='sym')g.symKnown[id]=true;
  g.dockSig='';
  return true;
}
function doFuse(id){
  const g=G,F=AB[id];
  const ia=g.slots.findIndex(s=>s&&s.id===F.a),ib=g.slots.findIndex(s=>s&&s.id===F.b);
  if(ia<0||ib<0)return false;
  const lv=Math.max(2,Math.round((g.slots[ia].lv+g.slots[ib].lv)/2));
  const first=Math.min(ia,ib),second=Math.max(ia,ib);
  g.slots[first]={id:id,lv:lv,cd:0,cdMax:1};
  g.slots[second]=null;
  g.dockSig='';
  return true;
}
function buyItem(m,si){
  const g=G,s=m.stock[si];
  if(!s||s.sold)return 'Уже продано';
  const d=ITEMS[s.id],price=priceOf(s.id,m.id);
  if(g.p.gold<price)return 'Не хватает золота';
  if(d.scroll==='sp'){
    g.sp++;toast('Очко навыков','Древо (T)');
  }else if(d.scroll){
    const ex=g.slots.find(x=>x&&x.id===d.scroll);
    if(ex&&ex.lv>=5)return 'Способность на максимуме';
    if(!ex&&freeSlot()<0)return 'Нет места в хотбаре';
    learnSkill(d.scroll);
  }else{
    if(!addToBag(s.id))return 'Рюкзак полон';
  }
  g.p.gold-=price;
  if(!d.ch&&!d.scroll)g.bought[s.id]=true;
  if(!(d.ch&&g.bag.some(b=>b&&b.id===s.id&&b.ch>d.ch)))s.sold=true;
  s.sold=true;
  sfx(700,0.12,'triangle',0.05,300);
  return null;
}
function sellItem(i){
  const g=G,b=g.bag[i];
  if(!b)return;
  const d=ITEMS[b.id];
  g.p.gold+=Math.round(d.price*0.5*(d.ch?b.ch/d.ch:1));
  g.bag[i]=null;recalc();
  sfx(500,0.1,'triangle',0.04,-100);
}

