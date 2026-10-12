/* =====================================================================
   КАРТЫ: чанки с препятствиями, лужами и декором (детерминированно)
   ===================================================================== */
const CH=520;
const hv=a=>{const v=Math.sin(a*12.9898)*43758.5453;return v-Math.floor(v)};
const gcol=c=>(typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c))?c:'#ffffff';
function hash32(a,b,c){let h=(Math.imul(a,374761393)+Math.imul(b,668265263)+Math.imul(c,2147483629))|0;h=Math.imul(h^(h>>>13),1274126177);return (h^(h>>>16))>>>0}
function mulberry(a){return function(){a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function crackLine(x,px,py,R,segs,len){x.beginPath();x.moveTo(px,py);for(let k=0;k<segs;k++){px+=(R()-0.5)*len*2;py+=(R()-0.5)*len*2;x.lineTo(px,py)}}
const BIOMES=['ash','forest','ice','lava','dunes','storm'];
const MAPS={
  ash:{n:'Пепельная равнина',d:'Открытое поле с редкими скалами. Много места для манёвра, мало укрытий.',
    base:'#15161f',mid:'#201f2b',acc:'#34303f',glow:'#ff8a4a',grade:'rgba(40,16,0,.07)',
    solid:{kind:'rock',n:0.8,r:[24,42]},pool:null,decor:'ash',
    amb:{c:['#ffb07a','#ff7a3a','#9a96aa'],fall:1,wind:1,sz:1,al:0.45},
    mods:{buff:{n:'Тёплый ветер',d:'+10% к скорости бега.',st:{spd:0.10}},debuff:{n:'Пыльные вихри',d:'По полю бродят пыльные вихри: затягивают и бьют всех, кто рядом. Мана восстанавливается медленнее (−1 в секунду).',st:{mreg:-1},hz:'devil'}},
    foe:{n:'Ветер подгоняет врагов',d:'Враги быстрее на 8%',sp:1.08},
    roster:{wisp:1.6,swift:1.4},
    tex:(x,s,R)=>{x.lineCap='round';for(let i=0;i<16;i++){crackLine(x,60+R()*(s-120),60+R()*(s-120),R,4,45);x.strokeStyle='rgba(0,0,0,.38)';x.lineWidth=2;x.stroke();x.strokeStyle='rgba(255,140,80,.06)';x.lineWidth=1;x.stroke()}}},
  forest:{n:'Шепчущий лес',d:'Густые деревья останавливают врагов и их выстрелы. Терновник замедляет всех, кто в него зашёл.',
    base:'#0d1a11',mid:'#15271a',acc:'#244a2a',glow:'#62c15a',grade:'rgba(0,28,10,.10)',
    solid:{kind:'tree',n:2.3,r:[24,31]},pool:{kind:'bramble',n:0.8,r:[55,95]},decor:'forest',
    amb:{c:['#b6ee8a','#e6ffb0','#62c15a'],fall:0.25,wind:2,sz:1.1,al:0.5},
    mods:{buff:{n:'Живица',d:'+1,2 здоровья в секунду.',st:{regen:1.2}},debuff:{n:'Заросли',d:'Корни вырываются из земли в отмеченных местах: ранят и опутывают (рывок освобождает). −8% к скорости бега.',st:{spd:-0.08},hz:'overgrow'}},
    foe:{n:'Крепкая кора',d:'Враги прочнее на 12%',hp:1.12},
    roster:{splitter:2,healer:1.8,archer:0.6,swift:0.6},
    tex:(x,s,R)=>{x.lineCap='round';for(let i=0;i<650;i++){const px=R()*s,py=R()*s,h=3+R()*7;x.strokeStyle=R()<0.5?'rgba(60,140,64,.30)':'rgba(30,80,40,.35)';x.lineWidth=1.2;x.beginPath();x.moveTo(px,py);x.lineTo(px+(R()-.5)*4,py-h);x.stroke()}}},
  ice:{n:'Ледяное озеро',d:'Скользкий лёд: вы и враги скользите, отбрасывание летит дальше, а удары о кристаллы наносят урон.',
    base:'#0c1a29',mid:'#13304a',acc:'#2d5b82',glow:'#7fd6ff',grade:'rgba(0,30,70,.08)',
    solid:{kind:'crystal',n:1.5,r:[20,34]},pool:null,ice:true,decor:'ice',
    amb:{c:['#ffffff','#d6f2ff','#9fe0ff'],fall:-1.6,wind:2,sz:1,al:0.6},
    mods:{buff:{n:'Закалка холодом',d:'+6 к броне.',st:{armor:6}},debuff:{n:'Метель',d:'Периодически налетает метель: замедляет, морозит, а затем замораживает на месте. Способности на 12% медленнее.',st:{cdr:-0.12},hz:'blizzard'}},
    foe:{n:'Морозная броня',d:'Враги прочнее на 15%, но медленнее на 8%',hp:1.15,sp:0.92},
    roster:{brute:1.6,shield:1.5,charger:1.3,swift:0.5},
    tex:(x,s,R)=>{x.lineCap='round';for(let i=0;i<34;i++){const px=R()*s,py=R()*s,l=60+R()*140;x.strokeStyle='rgba(200,235,255,'+(0.04+R()*0.06).toFixed(3)+')';x.lineWidth=1+R()*2;x.beginPath();x.moveTo(px,py);x.lineTo(px+l,py+l*0.35);x.stroke()}
      for(let i=0;i<10;i++){crackLine(x,40+R()*(s-80),40+R()*(s-80),R,4,40);x.strokeStyle='rgba(220,245,255,.16)';x.lineWidth=1.2;x.stroke()}}},
  lava:{n:'Вулканическое плато',d:'Лавовые озёра жгут всех, кто в них зайдёт: и вас, и врагов. Между ними торчат базальтовые колонны.',
    base:'#190c0c',mid:'#271311',acc:'#4a2218',glow:'#ff6a2b',grade:'rgba(70,12,0,.10)',
    solid:{kind:'basalt',n:1.0,r:[24,40]},pool:{kind:'lava',n:1.1,r:[70,125]},decor:'lava',
    amb:{c:['#ffb347','#ff6a2b','#ffd36b'],fall:1.3,wind:1,sz:1.1,al:0.55},
    mods:{buff:{n:'Жар кузни',d:'+12% к урону.',st:{dm:0.12}},debuff:{n:'Вулканические бомбы',d:'Раскалённые глыбы падают рядом с вами: бьют и вас, и врагов.',hz:'bombs'}},
    foe:{n:'Раскалённые',d:'Враги наносят на 12% больше урона',dmg:1.12},
    roster:{bomber:2,brute:1.5,mage:1.3,wisp:0.5},
    tex:(x,s,R)=>{x.lineCap='round';x.shadowColor='#ff5a1a';x.shadowBlur=8;for(let i=0;i<11;i++){crackLine(x,50+R()*(s-100),50+R()*(s-100),R,5,40);x.strokeStyle='rgba(255,90,30,.20)';x.lineWidth=2;x.stroke()}x.shadowBlur=0;
      for(let i=0;i<14;i++){crackLine(x,50+R()*(s-100),50+R()*(s-100),R,3,30);x.strokeStyle='rgba(0,0,0,.4)';x.lineWidth=2;x.stroke()}}},
  dunes:{n:'Бескрайние дюны',d:'Песок и кактусы. Зыбучие пески вязнут для всех, а песчаные бури сносят и вас, и врагов.',
    base:'#2a2113',mid:'#3b2e19',acc:'#5e4a28',glow:'#ffc15e',grade:'rgba(70,40,0,.10)',
    solid:{kind:'cactus',n:1.1,r:[17,24]},pool:{kind:'quicksand',n:0.8,r:[65,105]},decor:'dunes',
    amb:{c:['#f1d9a0','#d9b36a','#fff0c8'],fall:-0.2,wind:3,sz:0.9,al:0.5,drift:90},
    mods:{buff:{n:'Попутный ветер',d:'+15% к скорости способностей.',st:{cdr:0.15}},debuff:{n:'Песчаная буря',d:'Порывы ветра периодически сносят вас и врагов в одну сторону.',hz:'wind'}},
    foe:{n:'Жара пустыни',d:'Враги быстрее на 6%, и их больше на 20%',sp:1.06,cnt:1.2},
    roster:{charger:2,swift:1.4,archer:1.4},
    tex:(x,s,R)=>{x.lineCap='round';for(let i=0;i<46;i++){const px=R()*s,py=R()*s,l=50+R()*90;x.strokeStyle='rgba(255,225,160,'+(0.04+R()*0.05).toFixed(3)+')';x.lineWidth=2;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+l*0.5,py-10-R()*8,px+l,py);x.stroke();x.strokeStyle='rgba(0,0,0,.14)';x.beginPath();x.moveTo(px,py+4);x.quadraticCurveTo(px+l*0.5,py-6,px+l,py+4);x.stroke()}}},
  storm:{n:'Грозовая пустошь',d:'Выжженная земля под вечной грозой. Лужи делают врагов мокрыми, а молнии с неба бьют по всем.',
    base:'#0f1119',mid:'#1a1e2d',acc:'#3a4262',glow:'#f4f08a',grade:'rgba(10,16,48,.16)',
    solid:{kind:'pylon',n:1.0,r:[18,26]},pool:{kind:'puddle',n:0.9,r:[55,95]},decor:'storm',
    amb:{c:['#9fb4ff','#c9d6ff'],fall:-9,wind:1,sz:1,al:0.4,streak:1,drift:-40},
    mods:{buff:{n:'Заряженный воздух',d:'+10% к шансу критического удара.',st:{crit:0.10}},debuff:{n:'Грозовые разряды',d:'Молнии бьют в случайные точки рядом: по вам и по врагам. Мокрые враги получают от молний вдвое больше.',hz:'strike'}},
    foe:{n:'Наэлектризованные',d:'Враги устойчивее к магии (+10%) и наносят на 8% больше урона',mres:0.10,dmg:1.08},
    roster:{mage:1.8,specter:1.8,shield:1.3},
    tex:(x,s,R)=>{x.lineCap='round';for(let i=0;i<9;i++){crackLine(x,40+R()*(s-80),40+R()*(s-80),R,5,44);x.strokeStyle='rgba(130,160,255,.16)';x.lineWidth=1.6;x.stroke()}
      for(let i=0;i<18;i++){x.strokeStyle='rgba(255,255,255,.035)';x.lineWidth=1;const px=R()*s,py=R()*s;x.strokeRect(px,py,40+R()*60,24+R()*40)}}}
};
const MAPK=Object.keys(MAPS);
const AFF={
  lava:{h:'fire',n:'Дома в огне',d:'+15% урона, +2 маны/с. Лава, бомбы и пламя вам не вредят.',st:{dm:0.15,mreg:2},imm:['lava','bombs']},
  ice:{h:'water',n:'Стихия воды',d:'+22% скорости, +5 брони, −15% магического урона, +2 маны/с. Вы не скользите, метель вам не страшна.',st:{spd:0.22,armor:5,mres:0.15,mreg:2},imm:['blizzard','slip']},
  dunes:{h:'earth',n:'Каменная твердыня',d:'+6 брони, +30 здоровья. Зыбучие пески и бури вас не берут.',st:{armor:6,hp:30},imm:['quicksand','wind']},
  ash:{h:'air',n:'В родной стихии',d:'+12% скорости, +8% к криту, быстрее рывок. Вихри не страшны.',st:{spd:0.12,crit:0.08,drc:0.3},imm:['devil']},
  storm:{h:'metal',n:'Громоотвод',d:'+12% урона, +6% к криту. Молнии вам не вредят и даже заряжают (+8 маны).',st:{dm:0.12,crit:0.06},imm:['strike']},
  forest:{h:'wood',n:'Дитя леса',d:'+20% скорости, +2 здоровья/с. Корни и терновник вас не держат.',st:{spd:0.20,regen:2},imm:['overgrow','bramble']}
};
function imm(k){const g=G;return !!(g&&g.aff&&g.aff.imm.indexOf(k)>=0)}
function immFx(label){const g=G,p=g.p;if((g.immT||0)>g.t-0.8)return;g.immT=g.t;if(g.tx.length<50)g.tx.push({x:p.x,y:p.y-30,t:0.8,txt:label||'иммунитет',big:false,col:'#ffd36b'})}

function biomeFor(w){return BIOMES[Math.floor((Math.max(1,w)-1)/4)%BIOMES.length]}


const chunkCache=new Map();
function getChunk(g,cx,cy){
  const id=g.map,key=id+g.binst+':'+cx+':'+cy;
  let c=chunkCache.get(key);
  if(c)return c;
  const M=MAPS[id],R=mulberry(hash32(cx,cy,MAPK.indexOf(id)+7+g.binst*31));
  c={solids:[],pools:[],decor:[]};
  const ox=cx*CH,oy=cy*CH;
  const place=(spec,arr,clear)=>{
    if(!spec)return;
    const cnt=Math.floor(spec.n)+(R()<spec.n%1?1:0);
    for(let i=0;i<cnt;i++){
      for(let t=0;t<7;t++){
        const x=ox+R()*CH,y=oy+R()*CH,r=spec.r[0]+R()*(spec.r[1]-spec.r[0]);
        if(Math.hypot(x-g.ox,y-g.oy)<r+clear)continue;
        let ok=true;
        for(const o of c.pools)if(Math.hypot(x-o.x,y-o.y)<r+o.r+24){ok=false;break}
        if(ok)for(const o of c.solids)if(Math.hypot(x-o.x,y-o.y)<r+o.r+24){ok=false;break}
        if(!ok)continue;
        arr.push({x:x,y:y,r:r,kind:spec.kind,a:R()*TAU,s:R()});break;
      }
    }
  };
  place(M.pool,c.pools,330);place(M.solid,c.solids,260);
  for(let i=0;i<14;i++)c.decor.push({x:ox+R()*CH,y:oy+R()*CH,r:2+R()*5,a:R()*TAU,k:Math.floor(R()*3),s:R()});
  chunkCache.set(key,c);
  if(chunkCache.size>420){let n=0;for(const k of chunkCache.keys()){chunkCache.delete(k);if(++n>120)break}}
  return c;
}
function gatherWorld(g,px,py){
  const m=520,hw=simVW()/2+m,hh=simVH()/2+m;
  let ax=px,bx=px,ay=py,by=py;
  if(COOP)for(const h of COOP.H){ax=Math.min(ax,h.p.x);bx=Math.max(bx,h.p.x);ay=Math.min(ay,h.p.y);by=Math.max(by,h.p.y)} /* вдвоём — вокруг обоих героев */
  const x0=Math.floor((ax-hw)/CH),x1=Math.floor((bx+hw)/CH),y0=Math.floor((ay-hh)/CH),y1=Math.floor((by+hh)/CH);
  const k=g.map+g.binst+':'+x0+','+x1+','+y0+','+y1;
  if(g.gk===k)return;
  g.gk=k;
  g.solids.length=0;g.pools.length=0;g.decors.length=0;
  for(let cx=x0;cx<=x1;cx++)for(let cy=y0;cy<=y1;cy++){
    const c=getChunk(g,cx,cy);
    for(const q of c.solids)g.solids.push(q);
    for(const q of c.pools)g.pools.push(q);
    for(const q of c.decor)g.decors.push(q);
  }
}
function poolAt(g,x,y){for(const s of g.pools){const dx=x-s.x,dy=y-s.y,r=s.r*0.9;if(dx*dx+dy*dy<r*r)return s}return null}
function freeSpot(x,y,r,sep){
  const g=G;
  for(let t=0;t<40;t++){
    let ok=true;
    if(sep)for(const m of g.merch)if(Math.hypot(x-m.x,y-m.y)<sep){ok=false;break}
    for(const s of g.solids)if(Math.hypot(x-s.x,y-s.y)<s.r+r+12){ok=false;break}
    if(ok)for(const s of g.pools)if(s.kind==='lava'&&Math.hypot(x-s.x,y-s.y)<s.r+r+14){ok=false;break}
    if(ok)return {x:x,y:y};
    const a=rnd(0,TAU),d=rnd(170,240+t*6);x=g.p.x+Math.cos(a)*d;y=g.p.y+Math.sin(a)*d;
  }
  return {x:x,y:y};
}
function pushOutP(p){
  const g=G,ice=!!MAPS[g.map].ice;
  for(const s of g.solids){
    const dx=p.x-s.x,dy=p.y-s.y,m=s.r+p.r;
    if(dx>m||dx<-m||dy>m||dy<-m)continue;
    const d2=dx*dx+dy*dy;
    if(d2>=m*m)continue;
    const d=Math.sqrt(d2)||0.01,nx=dx/d,ny=dy/d;
    p.x=s.x+nx*m;p.y=s.y+ny*m;
    const vn=p.vx*nx+p.vy*ny;
    if(vn<0){const f=ice?1.6:1;p.vx-=vn*nx*f;p.vy-=vn*ny*f}
    const kn=p.kx*nx+p.ky*ny;
    if(kn<0){p.kx-=kn*nx*1.5;p.ky-=kn*ny*1.5}
  }
}
function obsE(e){
  const g=G;
  for(const s of g.solids){
    const dx=e.x-s.x,dy=e.y-s.y,m=s.r+e.r*0.9;
    if(dx>m||dx<-m||dy>m||dy<-m)continue;
    const d2=dx*dx+dy*dy;
    if(d2>=m*m)continue;
    const d=Math.sqrt(d2)||0.01,nx=dx/d,ny=dy/d;
    e.x=s.x+nx*m;e.y=s.y+ny*m;
    const vn=e.kx*nx+e.ky*ny;
    if(vn<0){
      if(vn<-230&&e.slam<=0){
        e.slam=0.3;
        sparks(e.x-nx*e.r,e.y-ny*e.r,'#ffd9a0',7,240);
        g.shake=Math.max(g.shake,2);
        hitEnemy(e,Math.min(70,-vn*0.08),{dt:'pure',src:'auto',col:'#ffd9a0'});
        if(e.dead)return;
      }
      e.kx-=1.5*vn*nx;e.ky-=1.5*vn*ny;
    }
  }
}
function poolsTick(dt){
  const g=G,p=g.p;
  if(!g.pools.length)return;
  if(g.pt.length<300){
    for(const pl of g.pools){
      if(pl.kind!=='lava'||!simVis(pl.x,pl.y,pl.r))continue;
      if(Math.random()<dt*3){
        const a=rnd(0,TAU),d=Math.sqrt(Math.random())*pl.r*0.9;
        g.pt.push({x:pl.x+Math.cos(a)*d,y:pl.y+Math.sin(a)*d,vx:rnd(-10,10),vy:rnd(-60,-25),life:1.1,max:1.1,col:Math.random()<0.5?'#ffb347':'#ff6a2b',size:2.2});
      }
    }
  }
  const pl=poolAt(g,p.x,p.y);
  if(!pl||pl.kind!=='lava'||imm('lava')){g.lavaT=0;if(pl&&pl.kind==='lava')immFx();return}
  if(Math.random()<dt*14)puff(p.x+rnd(-8,8),p.y+rnd(-4,8),Math.random()<0.5?'#ff9a3c':'#ffd36b',1,60,0.4,2.4);
  g.lavaT=(g.lavaT||0)+dt;
  if(g.lavaT>=0.4){g.lavaT=0;hurtPlayer(6+SW()*0.8,'pure',{lava:true})}
}

/* ---------- эффекты: свечение, искры, дым, обломки ---------- */
const GS={};
function glowSpr(col){
  col=gcol(col);
  if(GS[col])return GS[col];
  const c=document.createElement('canvas');c.width=c.height=64;
  const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,rgba(col,1));g.addColorStop(0.28,rgba(col,0.5));g.addColorStop(1,rgba(col,0));
  x.fillStyle=g;x.fillRect(0,0,64,64);
  GS[col]=c;return c;
}
function glow(x,y,r,col,a){ctx.globalAlpha=a;ctx.drawImage(glowSpr(col),x-r,y-r,r*2,r*2)}
function sparks(x,y,col,n,spd){
  const g=G||demoG;
  for(let i=0;i<n;i++){
    if(g.spk.length>150)return;
    const a=Math.random()*TAU,s=(0.3+Math.random()*0.7)*spd;
    g.spk.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0.18+Math.random()*0.25,max:0.43,col:col});
  }
}
function smokeAt(x,y,r,n){
  const g=G||demoG;
  for(let i=0;i<n;i++){
    if(g.smk.length>80)return;
    const a=rnd(0,TAU),s=rnd(8,40);
    g.smk.push({x:x+Math.cos(a)*r*0.4,y:y+Math.sin(a)*r*0.4,vx:Math.cos(a)*s,vy:Math.sin(a)*s-12,r:r*rnd(0.4,0.7),gr:rnd(1.2,2.2),life:rnd(0.6,1.1),max:1.1,a:rnd(0.6,1),col:'#2b2d38'});
  }
}
function debrisAt(e){
  const g=G;
  if(g.deb.length>200)return;
  const n=e.boss?26:(e.elite?9:(e.r>14?6:4));
  for(let i=0;i<n;i++){
    const a=rnd(0,TAU),s=rnd(70,280)*(e.boss?1.5:1);
    g.deb.push({x:e.x+Math.cos(a)*e.r*0.3,y:e.y+Math.sin(a)*e.r*0.3,vx:Math.cos(a)*s+e.kx*0.4,vy:Math.sin(a)*s+e.ky*0.4,rot:rnd(0,TAU),vr:rnd(-14,14),s:Math.max(2.5,e.r*rnd(0.18,0.42)),col:e.col,life:rnd(1.0,1.8),max:1.8,n:3+Math.floor(rnd(0,2.99))});
  }
  if(e.boss||e.elite||e.r>14)smokeAt(e.x,e.y,e.r*0.8,e.boss?5:2);
}
function boomFx(x,y,r,col){
  const g=G;
  if(g.fl.length<40)g.fl.push({x:x,y:y,r:r*1.15,t:0,life:0.28,col:col});
  sparks(x,y,col,Math.min(14,4+Math.floor(r/16)),r*3.2);
  if(r>=46){
    if(g.sc.length<36)g.sc.push({x:x,y:y,r:r*0.8,life:7,max:7,col:col});
    smokeAt(x,y,r*0.6,2);
  }
  if(g.gem.length<260){
    const R2=r*1.25;
    for(const m of g.gem){
      if(m.fly)continue;
      const dx=m.x-x,dy=m.y-y,d=Math.hypot(dx,dy)||1;
      if(d<R2){const f=(1-d/R2)*320;m.vx+=dx/d*f;m.vy+=dy/d*f}
    }
  }
}


/* ---------- молнии с неба, очаги, окружение ---------- */
function skyStrike(x,y,col,big){
  const g=G||demoG;
  col=gcol(col||'#f4f08a');
  if(g.sk.length<10)g.sk.push({x:x,y:y,t:0.5,max:0.5,seed:Math.floor(Math.random()*1e6),col:col,big:!!big});
  g.flashA=Math.max(g.flashA||0,big?0.6:0.38);
  g.shake=Math.max(g.shake,big?10:6);
  if(g.sc.length<36)g.sc.push({x:x,y:y,r:big?64:46,life:9,max:9,col:col,crack:true,seed:Math.floor(Math.random()*1e6)});
  sparks(x,y,'#fff6b0',16,400);sparks(x,y,col,10,300);
  puff(x,y,'#ffffff',8,220,0.4,3.5);
  smokeAt(x,y,22,2);
  sfx(55,0.7,'sawtooth',0.08,-25);sfx(1300,0.07,'square',0.045,-1000);
}
function addPatch(x,y,r,life,dps,kind){
  const g=G;
  if(g.pch.length>28)return;
  g.pch.push({x:x,y:y,r:r,life:life,max:life,dps:dps,kind:kind||'fire',tick:0.2,dead:false});
}
function mapEvents(dt){
  const g=G,p=g.p;
  if(g.frz>0)g.frz-=dt;
  if(g.rootT>0)g.rootT-=dt;
  if(g.pslow>0)g.pslow-=dt;
  const bz=g.bliz;
  if(bz){
    bz.t-=dt;
    if(bz.t<=0){g.bliz=null}
    else{
      const im=imm('blizzard');
      for(let i=0;i<4&&g.pt.length<330;i++)g.pt.push({x:VX+rnd(-60,VW+60)+300,y:VY+rnd(-60,VH),vx:-(560+rnd(0,300)),vy:rnd(60,160),life:0.8,max:0.8,col:Math.random()<0.5?'#ffffff':'#bfe8ff',size:rnd(1.2,2.8)});
      if(im){if(Math.random()<dt*1.2)immFx('метель не страшна')}
      else{
        bz.cd=(bz.cd||0)-dt;
        if(bz.cd<=0){bz.cd=1.1;hurtPlayer(2+SW()*0.35,'pure',{lava:true})}
        if(!(g.frz>0))bz.ch+=dt/2.6;
        if(bz.ch>=1){bz.ch=-0.7;g.frz=0.9;ring(p.x,p.y,70,'#bfe8ff',0.5);puff(p.x,p.y,'#e6f7ff',22,220,0.6,3);sparks(p.x,p.y,'#ffffff',14,260);g.shake=Math.max(g.shake,4);sfx(900,0.3,'triangle',0.05,-500);if(g.tx.length<50)g.tx.push({x:p.x,y:p.y-32,t:0.9,txt:'Заморожен!',big:true,col:'#bfe8ff'})}
      }
    }
  }
  for(const q of g.rt){q.t-=dt;if(q.t<=0)q.dead=true}
  if(g.rt.length&&g.rt[0].dead)g.rt=g.rt.filter(q=>!q.dead);
  if(g.dv.length){
    for(const d of g.dv){
      d.t-=dt;if(d.t<=0){d.dead=true;continue}
      const a=Math.atan2(p.y-d.y,p.x-d.x)+Math.sin(d.t*1.6+d.s)*1.2;
      d.x+=Math.cos(a)*65*dt;d.y+=Math.sin(a)*65*dt;
      const R2=d.r*2.6;
      for(let i=0;i<3&&g.pt.length<330;i++){const an=rnd(0,TAU),rr=rnd(0.3,1)*d.r*1.1;g.pt.push({x:d.x+Math.cos(an)*rr,y:d.y+Math.sin(an)*rr*0.5-rnd(0,50),vx:-Math.sin(an)*140,vy:Math.cos(an)*70-rnd(40,110),life:0.7,max:0.7,col:Math.random()<0.5?'#e8d0a0':'#b89c6a',size:rnd(1.5,3)})}
      const dx=d.x-p.x,dy=d.y-p.y,dd=Math.hypot(dx,dy)||1;
      if(dd<R2){
        if(imm('devil')){if(dd<d.r)immFx()}
        else{
          const f=(1-dd/R2)*520;
          p.kx+=(dx/dd*0.7-dy/dd*0.7)*f*dt;p.ky+=(dy/dd*0.7+dx/dd*0.7)*f*dt;
          if(dd<d.r){d.hc=(d.hc||0)-dt;if(d.hc<=0){d.hc=0.55;hurtPlayer(5+SW()*0.7,'phys',{lava:true})}}
        }
      }
      d.ec=(d.ec||0)-dt;const hitE=d.ec<=0;if(hitE)d.ec=0.6;
      for(const e of g.en){
        if(e.dead)continue;
        const ex=d.x-e.x,ey=d.y-e.y,ed=Math.hypot(ex,ey)||1;
        if(ed<R2){
          const f=(1-ed/R2)*480*(e.boss?0.25:e.kres);
          e.kx+=(ex/ed*0.7-ey/ed*0.7)*f*dt;e.ky+=(ey/ed*0.7+ex/ed*0.7)*f*dt;
          if(hitE&&ed<d.r+e.r)hitEnemy(e,6+3*SW(),{dt:'phys',src:'dot',quiet:true});
        }
      }
    }
    if(g.dv.some(d=>d.dead))g.dv=g.dv.filter(d=>!d.dead);
  }
}
function envTick(dt){
  const g=G,p=g.p;
  mapEvents(dt);
  if(g.later.length){g.atkSrc=null;const L=g.later;g.later=[];for(const q of L){q.t-=dt;if(q.t<=0){try{q.fn()}catch(e){window.__le=(window.__le||[]).concat(e.message)}}else g.later.push(q)}}
  treeBadge();
  if(g.start==='water'&&g.phase==='fight'){g.tideT-=dt;if(g.tide==='ebb')heal(3*dt);if(g.tideT<=0){g.tideT=10;g.tide=g.tide==='ebb'?'flood':'ebb';if(g.tx.length<50)g.tx.push({x:p.x,y:p.y-40,t:1.1,txt:g.tide==='ebb'?'Отлив: лечение':'Прилив: навыки дешевле',big:true,col:g.tide==='ebb'?'#6fe0b0':'#6fd0ff'});heal(g.S.maxHp*0.06);ring(p.x,p.y,170,'#6fd0ff',0.7);puff(p.x,p.y,'#9fe0ff',20,220,0.6,3);for(const e of g.en){if(!e.dead&&(e.x-p.x)**2+(e.y-p.y)**2<170*170)applySt(e,{slow:[0.55,2],wet:2},1)}}}
  g.flashA=Math.max(0,(g.flashA||0)-dt*2.2);
  for(const q of g.sk){q.t-=dt;if(q.t<=0)q.dead=true}
  for(const q of g.pch){
    q.life-=dt;q.tick-=dt;
    if(q.life<=0){q.dead=true;continue}
    if(q.tick<=0){
      q.tick=0.4;
      const dx=p.x-q.x,dy=p.y-q.y;
      if(dx*dx+dy*dy<(q.r+p.r*0.5)*(q.r+p.r*0.5)){if(imm('bombs'))immFx();else hurtPlayer(q.dps*0.4,'magic',{lava:true})}
    }
    if(g.pt.length<260&&Math.random()<dt*8)g.pt.push({x:q.x+rnd(-q.r,q.r)*0.7,y:q.y+rnd(-q.r,q.r)*0.5,vx:rnd(-8,8),vy:rnd(-60,-25),life:0.8,max:0.8,col:q.kind==='lava'?'#ffb347':'#ff7a3a',size:2.3});
  }
  const w=g.wind;
  if(w.t>0){
    w.t-=dt;
    const ramp=Math.min(1,(w.max-w.t)/0.7,w.t/0.7),f=560*Math.max(0,ramp),cx=Math.cos(w.ang),cy=Math.sin(w.ang);
    if(!imm('wind')){p.kx+=cx*f*dt;p.ky+=cy*f*dt}
    for(const e of g.en){if(e.dead)continue;const k=e.boss?0.3:e.kres;e.kx+=cx*f*dt*k;e.ky+=cy*f*dt*k}
    for(let i=0;i<4&&g.pt.length<320;i++)g.pt.push({x:VX+rnd(-40,VW+40)-cx*200,y:VY+rnd(-40,VH+40)-cy*200,vx:cx*(520+rnd(0,300)),vy:cy*(520+rnd(0,300)),life:0.7,max:0.7,col:'#f1d9a0',size:rnd(1,2.4)});
  }
}
function hazards(dt){
  const g=G,p=g.p,hz=MAPS[g.map].mods.debuff.hz;
  if(!hz)return;
  g.hzT-=dt;
  if(g.hzT>0)return;
  if(hz==='bombs'){
    g.hzT=Math.max(2.8,rnd(4.5,6.5)-SW()*0.12);
    for(let i=0;i<2;i++){
      const a=rnd(0,TAU),d=rnd(30,270);
      tgCircle(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d,66,1.15+i*0.3,14+3.2*SW(),'magic','#ff7a3a',{fx:'meteor',env:true,hitEn:70+11*SW(),patch:{r:46,life:3.2,dps:8+SW()}});
    }
  }else if(hz==='strike'){
    g.hzT=Math.max(1.6,rnd(2.6,4.2)-SW()*0.08);
    const tg=g.en.length&&Math.random()<0.55?pickOf(g.en):null;
    const a=rnd(0,TAU),d=rnd(20,240);
    const x=tg?tg.x:p.x+Math.cos(a)*d,y=tg?tg.y:p.y+Math.sin(a)*d;
    tgCircle(x,y,58,0.95,16+3.6*SW(),'magic','#f4f08a',{fx:'bolt',env:true,hitEn:100+15*SW()});
  }else if(hz==='wind'){
    g.hzT=rnd(13,19);
    g.wind={t:3.6,max:3.6,ang:rnd(0,TAU)};
    toast('Песчаная буря',imm('wind')?'Земля держит вас крепко':'Порыв ветра сносит вас и врагов');
  }else if(hz==='blizzard'){
    g.hzT=rnd(17,23);
    g.bliz={t:6.5,max:6.5,ch:0,cd:1};
    toast('Метель',imm('blizzard')?'Вода — ваша стихия: метель не страшна':'Холод ранит, а потом заморозит на месте');
  }else if(hz==='overgrow'){
    g.hzT=Math.max(3.4,rnd(5.5,8)-SW()*0.1);
    const n=SW()>8?3:2;
    for(let i=0;i<n;i++){
      const a=rnd(0,TAU),d=i===0?rnd(0,40):rnd(60,260);
      tgCircle(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d,62,1.25+i*0.25,10+2.8*SW(),'phys','#62c15a',{fx:'roots',env:true,hz:'overgrow',hitEn:40+7*SW()});
    }
  }else if(hz==='devil'){
    g.hzT=rnd(13,18);
    for(let i=0;i<2;i++){const a=rnd(0,TAU);g.dv.push({x:p.x+Math.cos(a)*rnd(380,520),y:p.y+Math.sin(a)*rnd(380,520),t:8,max:8,r:58,s:rnd(0,6),dead:false})}
    toast('Пыльные вихри',imm('devil')?'Вихри вам не страшны':'Держитесь подальше от воронок');
  }
}
let biomeTimer=0,biomeShow=0;
function showBiome(id,delay){
  const M=MAPS[id],el=$('biome'),A=(G&&G.map===id&&G.aff)?G.aff:null;
  const ex=ET_KEYS.filter(k=>(ET[k].map||ET[k].maps)&&mapOk(k,id)).map(k=>ET[k].n);
  const more=Object.keys(M.roster||{}).filter(k=>M.roster[k]>1).map(k=>ET[k].n);
  el.style.setProperty('--bc',M.glow);
  el.innerHTML='<div class="bn" style="color:'+M.glow+'">'+M.n+'</div><div class="bs">'+M.d+'</div><div class="bm"><div><b class="up">▲ '+M.mods.buff.n+'</b>'+M.mods.buff.d+'</div><div><b class="dn">▼ '+M.mods.debuff.n+'</b>'+M.mods.debuff.d+'</div><div><b class="fo">☠ '+M.foe.n+'</b>'+M.foe.d+'. Новые враги: '+ex.join(', ')+(more.length?'. Чаще: '+more.join(', '):'')+'.</div>'+(A?'<div style="border-color:#ffd36b"><b style="color:#ffd36b">★ '+A.n+'</b>'+A.d+'</div>':'')+'</div>';
  clearTimeout(biomeTimer);clearTimeout(biomeShow);
  el.hidden=true;
  biomeShow=setTimeout(()=>{
    if(!G||mode!=='play')return;
    el.hidden=false;el.style.animation='none';void el.offsetWidth;el.style.animation='';
    biomeTimer=setTimeout(()=>{el.hidden=true},7200);
  },delay===undefined?2600:delay);
}
function enterBiome(id,silent){
  const g=G,p=g.p;
  g.map=id;g.binst++;g.ox=p.x;g.oy=p.y;g.gk='';
  g.solids.length=0;g.pools.length=0;g.decors.length=0;g.sc.length=0;g.pch.length=0;g.sk.length=0;
  g.wind={t:0,max:1,ang:0};g.hzT=5;g.bliz=null;g.dv.length=0;g.rt.length=0;g.frz=0;g.rootT=0;
  recalc();
  if(!silent){
    showBiome(id);
    const f=$('fade');f.style.setProperty('--fc',MAPS[id].glow);f.classList.remove('fgo');void f.offsetWidth;f.classList.add('fgo');
  }
}
function mapStats(g){
  const M=MAPS[g.map],o={};
  for(const k of ['buff','debuff']){const s=M.mods[k].st;if(s)for(const q in s)o[q]=(o[q]||0)+s[q]}
  return o;
}
function mkState(start,map){
  return {
    map:map||'ash',aff:null,inv:{},awk:0,pslow:0,dv:[],rt:[],bliz:null,frz:0,rootT:0,immT:0,binst:0,ox:0,oy:0,pch:[],sk:[],flashA:0,wind:{t:0,max:1,ang:0},hzT:5,start:start,cfx:[],leap:null,leapH:0,dashSp:0,dashHit:null,pl:0,castN:0,shotN:0,pasT:20,cls:CLS[start]||null,tideT:10,tide:'flood',gmods:{},gmu:{},heat:0,heatIdle:0,ovhT:0,burnSelf:0,plates:0,stillT:0,imp:0,impR:false,season:0,hand:start==='metal'?{t:'pistol',cd:0,aim:0,fl:0,rec:0,hasT:false}:null,gren:[],hat:null,hlt:0,hla:0,sp:0,nodes:{},later:[],hfx:[],afx:[],guns:[],bought:{},lastHits:0,treeOpen:false,hinted:false,t:0,kills:0,over:false,paused:false,lvlOpen:false,shopOpen:false,
    wave:0,phase:'fight',wt:0,inter:0,waveDur:60,spawnT:1,evT:30,bossRef:null,bossDead:false,bossKills:0,endless:false,victory:false,
    p:{x:0,y:0,r:13,hp:100,mana:120,xp:0,lv:1,need:needFor(1),inv:0,dash:0,dch:1,dcr:0,face:0,gold:0,vx:0,vy:0,kx:0,ky:0},
    el:{fire:0,water:0,earth:0,air:0,metal:0,wood:0},pass:{},
    slots:[null,null,null,null,null],ult:{lv:0,cd:0,cdMax:1,kind:null,seals:{}},relics:[],evts:[],forms:[],chan:null,chanPtr:-1,autoAim:false,syn:{},synOn:[],asc:Math.min(SAVE.ascSel||0,SAVE.asc||0),symKnown:{},bag:[null,null,null,null,null,null],
    S:{},E:{},bf:{dm:{t:0,v:0},spd:{t:0,v:0},armor:{t:0,v:0},ls:{t:0,v:0},regen:{t:0,v:0}},
    en:[],pr:[],zn:[],gem:[],pt:[],tx:[],bl:[],tor:[],fx:[],pk:[],bolts:[],beams:[],em:[],stc:[],eps:[],tgs:[],gh:[],merch:[],solids:[],pools:[],decors:[],gk:'',deb:[],smk:[],spk:[],fl:[],sc:[],slowmo:0,zk:0,lavaT:0,
    cdw:{},choices:[],pending:0,shake:0,hitFlash:0,rockAng:0,dashT:0,dashAng:0,block:0,shield:0,vac:0,slowAll:0,slowAllF:1,
    metaRevive:(SAVE.meta.revive||0)>0,revived:false,trT:0,lastMax:0,lastMaxMana:0,stockT:null,dockSig:''
  };
}
const demoG=mkState(null);
demoG.el={fire:3,water:3,earth:3,air:3,metal:2,wood:2};
demoG.S={area:0};demoG.E={dm:1};
const amb=[];
for(let i=0;i<80;i++)amb.push({x:Math.random()*1600,y:Math.random()*1000,vx:rnd(-6,6),vy:rnd(-26,-8),r:rnd(1.2,3.2),c:EL[EK[i%6]].c});

