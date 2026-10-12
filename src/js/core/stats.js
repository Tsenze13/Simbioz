/* ---------- характеристики ---------- */
function recalc(){
  const g=G,S=g.S,m=g.meta||SAVE.meta,p=g.p;
  const ml=k=>m[k]||0,cl=k=>g.pass[k]||0;
  const it={};
  for(const b of g.bag){
    if(!b)continue;
    const st=ITEMS[b.id].st;
    if(st)for(const k in st)it[k]=(it[k]||0)+st[k];
  }
  for(const id of g.relics||[]){const st=RELICS[id].st;if(st)for(const k in st)it[k]=(it[k]||0)+st[k]}
  synUpdate(g,it);
  {const ms=mapStats(g);for(const k in ms)it[k]=(it[k]||0)+ms[k]}
  {const A=AFF[bio(g.map)];g.aff=(A&&A.h===g.start)?A:null}
  if(g.aff)for(const k in g.aff.st)it[k]=(it[k]||0)+g.aff.st[k];
  if(g.cls)for(const k in g.cls.st)it[k]=(it[k]||0)+g.cls.st[k];
  {const Gr=GROW[g.start],lv=(p.lv||1)-1;if(Gr&&lv>0)for(const k in Gr.st)it[k]=(it[k]||0)+Gr.st[k]*lv}
  if(g.inv)for(const s of INVEST){const n=g.inv[s.k]||0;if(n)for(const q in s.st)it[q]=(it[q]||0)+s.st[q]*n}
  if(isAva(g)){const n=EK.filter(k=>g.el[k]>0).length;it.dm=(it.dm||0)+PV('avatar',[0,.06,.09,.12])*n}
  {const a=PV('air',[0,.06,.1,.14]);if(a)it.spd=(it.spd||0)+a;const m=PV('metal',[0,.06,.1,.14]);if(m)it.crit=(it.crit||0)+m;if(g.start==='air'&&g.pl>=2)it.drc=(it.drc||0)+0.15}
  const x=k=>it[k]||0;
  S.maxHp=(100+12*ml('hp')+25*cl('hp')+x('hp'))*(1-(g.altarCut||0)); /* алтарь крови навсегда отнимает часть */
  S.regen=0.3+0.25*ml('reg')+0.8*cl('reg')+x('regen');
  S.maxMana=120+10*ml('mana')+20*cl('mana')+x('mana');
  S.mreg=3+0.2*ml('mreg')+0.8*cl('mreg')+x('mreg');
  S.magnet=70*(1+0.06*ml('mag')+0.35*cl('mag')+x('magnet'));
  S.dm=1+0.03*ml('dmg')+0.1*cl('dmg')+x('dm');
  S.spd=1+0.02*ml('spd')+0.12*cl('spd')+x('spd');
  S.cdr=0.02*ml('cdr')+0.08*cl('cdr')+x('cdr');
  S.area=0.08*cl('area')+x('area');
  S.crit=0.01*ml('crit')+0.08*cl('crit')+x('crit');
  S.armor=ml('arm')+4*cl('arm')+x('armor');
  S.mres=Math.min(0.8,0.01*ml('mres')+0.08*cl('mres')+x('mres'));
  S.xpm=0.04*ml('xp')+0.1*cl('xpg')+x('xpm');
  S.goldm=0.05*ml('gold')+0.1*cl('gld')+x('gold');
  S.ls=0.01*ml('ls')+0.03*cl('ls')+x('ls');
  S.thorns=x('thorns');
  S.dch=cl('dch')+x('dch');S.drc=Math.min(0.6,0.03*ml('drc')+0.15*cl('drc')+x('drc'));
  S.ultcd=Math.min(0.5,0.05*ml('ultcd')+x('ultcd'));
  S.mreg*=1+PV('water',[0,.1,.2,.3]);
  S.mreg=Math.max(0.4,S.mreg);S.regen=Math.max(0,S.regen);S.cdr=Math.max(-0.4,S.cdr);S.spd=Math.max(0.5,S.spd);S.crit=Math.min(0.95,S.crit);
  if(!g.lastMax){p.hp=S.maxHp;p.mana=S.maxMana}
  else{
    if(S.maxHp>g.lastMax)p.hp+=S.maxHp-g.lastMax;
    if(S.maxMana>g.lastMaxMana)p.mana+=S.maxMana-g.lastMaxMana;
  }
  g.lastMax=S.maxHp;g.lastMaxMana=S.maxMana;
  {const nd=S.dch||0,od=g.lastDch||0;if(nd>od)p.dch=Math.min(1+nd,(p.dch||0)+(nd-od));g.lastDch=nd;p.dch=Math.min(p.dch||0,1+nd)}
  p.hp=Math.min(p.hp,S.maxHp);p.mana=Math.min(p.mana,S.maxMana);
  g.dockSig='';
  g.ifx={};for(const b of g.bag)if(b&&ITEMS[b.id].fx)g.ifx[ITEMS[b.id].fx]=1;
  for(const id of g.relics||[])if(RELICS[id].fx)g.ifx[RELICS[id].fx]=1;
  tickBuffs(0);
}
function tickBuffs(dt){
  const g=G,bf=g.bf,S=g.S,E=g.E;
  for(const k in bf){if(bf[k].t>0){bf[k].t-=dt;if(bf[k].t<=0){bf[k].t=0;bf[k].v=0}}}
  E.dm=S.dm+bf.dm.v;E.spd=S.spd+bf.spd.v;E.armor=S.armor+bf.armor.v;E.ls=S.ls+bf.ls.v;E.regen=S.regen+bf.regen.v;
  E.mres=S.mres;E.cdr=S.cdr;E.crit=S.crit;
  if(g.start==='earth'&&g.plates)E.armor+=3*g.plates;
  if(g.start==='wood'&&g.season===0)E.regen+=2;
}
function heal(n){
  const g=G,p=g.p;
  if(n<=0||p.hp<=0)return;
  p.hp=Math.min(g.S.maxHp,p.hp+n);
}

/* ---------- эффекты ---------- */
function puff(x,y,col,n,spd,life,size){
  const g=G||demoG;
  if(g.pt.length>520)return;
  for(let i=0;i<n;i++){
    const a=Math.random()*TAU,s=Math.random()*spd;
    g.pt.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:life*(0.5+Math.random()*0.5),max:life,col:col,size:size*(0.6+Math.random()*0.8)});
  }
}
function ring(x,y,max,col,life,spike){
  const g=G||demoG;
  if(g.fx.length>90)return;
  g.fx.push({x:x,y:y,r:0,max:max,t:0,life:life||0.3,col:col,spike:!!spike});
}
let toastTimer=0;
function toast(a,b){
  if(!isLocal())return; /* сообщения героя друга не показываем */
  const t=$('toast');
  t.hidden=true;void t.offsetWidth;
  t.innerHTML=a+(b?'<small>'+b+'</small>':'');
  t.hidden=false;
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>{t.hidden=true},2600);
}
function addGem(x,y,k){
  const g=G,c=CR[k];
  if(g.gem.length>340){for(let i=g.gem.length-1;i>=0;i--){if(g.gem[i].k!=='coin'){g.gem[i].v+=c.v;return}}}
  g.gem.push({x:x,y:y,k:k,v:c.v,fly:false,dead:false,vx:rnd(-150,150),vy:rnd(-150,150)});
}
function addCoin(x,y,v){
  const g=G;
  if(g.gem.length>340){g.p.gold+=Math.round(v*(1+g.S.goldm));return}
  g.gem.push({x:x,y:y,k:'coin',v:v,fly:false,dead:false,vx:rnd(-150,150),vy:rnd(-150,150)});
}
const CR={
  s:{v:1,col:'#5fb0ff',size:3.5},
  m:{v:3,col:'#6fe3a0',size:5},
  l:{v:8,col:'#ff8a5c',size:6.5},
  xl:{v:25,col:'#ffd36b',size:8.5},
  coin:{v:1,col:'#ffd36b',size:4.5}
};
const PK={
  heal:{n:'Лечение',c:'#6fe3a0',d:'Восстановлено 25% здоровья'},
  magnet:{n:'Магнит',c:'#ff6b7a',d:'Весь опыт и золото летят к вам'},
  shield:{n:'Щит',c:'#7fe6ff',d:'6 секунд неуязвимости'},
  bomb:{n:'Взрыв стихий',c:'#ffb347',d:'Удар по всем врагам на экране'}
};
const PK_KEYS=Object.keys(PK);

