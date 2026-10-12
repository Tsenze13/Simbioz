/* =====================================================================
   СНИМОК СОСТОЯНИЯ для выравнивания при рассинхроне: хозяин сериализует мир и героев
   (граф объектов со ссылками; таблицы данных — ссылками по имени), гость его принимает.
   Функции (отложенные эффекты) не переносятся — их пара кадров пропадёт, это незаметно.
   ===================================================================== */
let SNAP_C=null;
function snapConsts(){
  if(SNAP_C)return SNAP_C;
  SNAP_C={o2p:new Map(),p2o:new Map()};
  const T={ET,BOSS,AB,ITEMS,CLS,EL,MAPS,FORMS,GUNS,GMOD,RELICS,EVTS,MERCH,HPAS,HMECH,ULT,TREE,CHAP,INVEST,MSEAL,BAL,DT,AFF,CR,EW};
  const reg=(o,p,d)=>{if(!o||typeof o!=='object'||SNAP_C.o2p.has(o)||d>3)return;SNAP_C.o2p.set(o,p);SNAP_C.p2o.set(p,o);for(const k of Object.keys(o))reg(o[k],p+'.'+k,d+1)};
  for(const n in T)reg(T[n],n,0);
  return SNAP_C;
}
function snapSer(root,skipKeys){
  const C=snapConsts(),ids=new Map(),out=[];
  const enc=v=>{
    if(typeof v==='function')return undefined;
    if(typeof v==='number'&&!isFinite(v))return {$n:String(v)};
    if(v===null||typeof v!=='object')return v;
    if(C.o2p.has(v))return {$c:C.o2p.get(v)};
    if(ids.has(v))return {$r:ids.get(v)};
    if(typeof Node!=='undefined'&&v instanceof Node)return null;
    if(v instanceof CanvasRenderingContext2D||(typeof ImageData!=='undefined'&&v instanceof ImageData))return null;
    const id=out.length;ids.set(v,id);out.push(null);
    let o;
    if(Array.isArray(v))o={a:v.map(x=>{const e=enc(x);return e===undefined?null:e})};
    else if(v instanceof Set)o={s:[...v].map(enc)};
    else if(v instanceof Map)o={m:[...v].map(([k,x])=>[enc(k),enc(x)])};
    else{const sk=skipKeys&&skipKeys.get(v);o={o:{}};for(const k of Object.keys(v)){if(sk&&sk.has(k))continue;const e=enc(v[k]);if(e!==undefined)o.o[k]=e}}
    out[id]=o;return {$r:id};
  };
  return {root:enc(root),out};
}
function snapDes(S){
  const C=snapConsts(),objs=S.out.map(o=>o.a?[]:o.s?new Set():o.m?new Map():{});
  const dec=v=>{
    if(v===null||typeof v!=='object')return v;
    if(v.$r!==undefined)return objs[v.$r];
    if(v.$c!==undefined)return C.p2o.get(v.$c);
    if(v.$n!==undefined)return Number(v.$n);
    return v;
  };
  S.out.forEach((o,i)=>{const t=objs[i];
    if(o.a)for(const x of o.a)t.push(dec(x));
    else if(o.s)for(const x of o.s)t.add(dec(x));
    else if(o.m)for(const [k,x] of o.m)t.set(dec(k),dec(x));
    else for(const k in o.o)t[k]=dec(o.o[k]);
  });
  return dec(S.root);
}
/* снимок совместной игры */
function coopSnap(){
  const skip=new Map(),wk=new Set(WORLD_KEYS);
  for(const h of COOP.H)skip.set(h,wk);
  const inq={};for(const t in LS.inq)if(+t>=LS.t)inq[t]=LS.inq[t];
  return {k:'snap',t:LS.t,rng:COOP.rng.get(),tick:COOP.tick,g:snapSer({W:COOP.W,H:COOP.H},skip),inq};
}
function coopApplySnap(m){
  if(!COOP)return;
  const st=snapDes(m.g),W=st.W;
  COOP.W=W;COOP.H=st.H;
  for(const h of COOP.H){worldify(h,W);h.later=(h.later||[]).filter(x=>typeof x.fn==='function');h.gk=''}
  COOP.rng.set(m.rng);COOP.tick=m.tick;
  const keep={};for(const t in LS.inq)if(+t>=m.t)keep[t]=LS.inq[t];
  LS.inq=keep;for(const t in m.inq){LS.inq[t]=LS.inq[t]||{};Object.assign(LS.inq[t],m.inq[t])}
  /* свой ввод — из своей истории: часть его могла быть уже выполнена и ещё лететь к хозяину */
  for(const t in LS.mine)if(+t>=m.t)(LS.inq[t]=LS.inq[t]||{})[COOP.me]=LS.mine[t];
  COOP.ep=(COOP.ep|0)+1;
  LS.t=m.t;LS.acc=0;LS.hash={};LS.rhash={};
  /* sentT не трогаем: всё, что уже отправлено, у хозяина есть; пропуски дозаполнит coopFrame */
  G=COOP.H[COOP.me];
  hc={};buildTopHud();
  COOP.resyncs=(COOP.resyncs||0)+1;
  if(!m.self)toast('Игра выровнена','Состояние мира взято у хозяина комнаты');
}
