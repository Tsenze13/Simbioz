/* =====================================================================
   СВЕТ. Мир приглушается до «сумерек» карты (MAPS[id].dark, цвет MAPS[id].nc),
   а эффекты освещают всё вокруг себя: огненные шары, взрывы, молнии, лава, кристаллы.
   Карта света рисуется в половинном разрешении и накладывается «умножением»
   после мира и тел, но до ярких эффектов — сами эффекты остаются яркими.
   Сильные вспышки (молния с неба) дают резкие тени от деревьев и камней.
   ===================================================================== */
const LM={c:null,x:null,w:0,h:0};
const LTS=[];                       /* короткие вспышки: {x,y,r,col,a,t,T,sh} */
const LSP={};                       /* кэш мягких пятен света по цвету */
function lightSpr(col){
  col=gcol(col);
  if(LSP[col])return LSP[col];
  const c=document.createElement('canvas');c.width=c.height=64;
  const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,rgba(col,1));gr.addColorStop(0.3,rgba(col,0.62));gr.addColorStop(0.65,rgba(col,0.2));gr.addColorStop(1,rgba(col,0));
  x.fillStyle=gr;x.fillRect(0,0,64,64);
  return LSP[col]=c;
}
/* вспышка света: радиус r (мир), сила a (0..1.5), длительность T; sh — бросать тени */
function addLight(x,y,r,col,a,T,sh){if(SAVE.light===false)return;if(LTS.length>70)LTS.shift();LTS.push({x,y,r,col:gcol(col),a,t0:anim,T:T||0.3,sh:!!sh})}
function lightOn(g){return SAVE.light!==false&&mode==='play'&&g&&MAPS[g.map]}
function mapDark(g){const M=MAPS[g.map];return clamp((M.dark||0)+(g.darkAdd||0),0,0.85)}
const LGLOW={ember:1,magmaling:1,imp:1,wisp:1,frostling:1,stormcaller:1,djinn:1,specter:1,frostwitch:1,ogre:1,healer:1,summoner:1};
function drawLighting(g,cx,cy,z){
  if(!lightOn(g))return;
  const dark=mapDark(g);
  /* вспышки живут и без темноты (дают тени), но если карта светлая и вспышек нет — пропускаем */
  for(const l of LTS)l.t=anim-l.t0;
  for(let i=LTS.length-1;i>=0;i--)if(LTS[i].t>=LTS[i].T||LTS[i].t<0)LTS.splice(i,1);
  const strike=g.sk&&g.sk.length;
  if(dark<0.02&&!LTS.some(l=>l.sh)&&!strike)return;
  const w=Math.max(2,Math.round(W/2)),h=Math.max(2,Math.round(H/2));
  if(!LM.c){LM.c=document.createElement('canvas');LM.x=LM.c.getContext('2d')}
  if(LM.w!==w||LM.h!==h){LM.c.width=w;LM.c.height=h;LM.w=w;LM.h=h}
  const x=LM.x,M=MAPS[g.map],nc=M.nc||'#283454';
  /* перевод мира в пиксели карты света */
  const k=z/2,ox=W/2/2-(cx+VW/2)*k,oy=H/2/2-(cy+VH/2)*k;
  const SX=wx=>wx*k+ox,SY=wy=>wy*k+oy;
  /* фон: смесь белого и цвета ночи; вспышка неба осветляет всё */
  const n=parseInt(nc.slice(1),16),fa=clamp((g.flashA||0)*1.4,0,1),d=dark*(1-fa);
  const R=Math.round(255-(255-((n>>16)&255))*d),G2=Math.round(255-(255-((n>>8)&255))*d),B=Math.round(255-(255-(n&255))*d);
  const amb='rgb('+R+','+G2+','+B+')';
  x.globalCompositeOperation='source-over';x.globalAlpha=1;x.fillStyle=amb;x.fillRect(0,0,w,h);
  x.globalCompositeOperation='lighter';
  let cnt=0;
  const vw=VW/2+300,vh=VH/2+300,mx=cx+VW/2,my=cy+VH/2;
  const L=(wx,wy,r,col,a)=>{if(a<=0.01||cnt>260)return;if(Math.abs(wx-mx)>vw+r||Math.abs(wy-my)>vh+r)return;cnt++;
    const rr=r*k;x.globalAlpha=Math.min(1,a);x.drawImage(lightSpr(col),SX(wx)-rr,SY(wy)-rr,rr*2,rr*2);if(a>1){x.globalAlpha=Math.min(1,a-1);x.drawImage(lightSpr(col),SX(wx)-rr*.6,SY(wy)-rr*.6,rr*1.2,rr*1.2)}};
  const p=g.p,dk=dark;
  /* герой — всегда немного светится, чтобы его было видно */
  L(p.x,p.y-6,250,'#ffe2b8',0.4+dk*0.6);
  /* окружение */
  for(const s of g.pools){if(s.kind==='lava')L(s.x,s.y,s.r*1.7,'#ff6a2b',0.5+0.12*Math.sin(anim*2+s.s*9))}
  for(const s of g.solids){if(s.kind==='crystal')L(s.x,s.y,s.r*3.2,'#7fd6ff',0.28+0.1*Math.sin(anim*1.8+s.s*20));else if(s.kind==='basalt')L(s.x,s.y,s.r*2,'#ff6a2b',0.16);else if(s.kind==='pylon')L(s.x,s.y-10,s.r*2.4,'#f4f08a',0.14+0.1*Math.max(0,Math.sin(anim*3+s.s*12)))}
  for(const q of g.pch)L(q.x,q.y,q.r*1.7,q.kind==='fire'?'#ff7a2b':'#9be36a',0.45*clamp(q.life/q.max*2,0,1));
  for(const m of g.merch)L(m.x,m.y-20,190,'#ffd59a',0.55);
  if(g.portals)for(const q of g.portals)L(q.x,q.y,240,q.risk?'#ff5a5a':MAPS[q.map].glow,0.8);
  if(g.evts)for(const v of g.evts)if(!v.used)L(v.x,v.y,140,'#ffd36b',0.4);
  let gn=0;for(const m of g.gem){if(gn++>140)break;L(m.x,m.y,m.k==='coin'?34:30,m.k==='coin'?'#ffd36b':'#9fe0ff',0.35)}
  /* враги, которые светятся сами */
  for(const e of g.en){if(e.dead)continue;
    if(e.boss)L(e.x,e.y,e.r*5,e.col,0.6);else if(e.elite)L(e.x,e.y,e.r*4,'#ffd36b',0.45);else if(LGLOW[e.type])L(e.x,e.y,e.r*5,e.col,0.45);else L(e.x,e.y,e.r*3.2,'#c8d0e0',0.18+dk*0.25)}
  /* снаряды и эффекты героя */
  for(const b of g.pr){const c=b.col||DT[b.dt||'phys'].c;L(b.x,b.y,b.gun?40:60+b.r*3,c,b.gun?0.35:0.6)}
  for(const b of g.eps)L(b.x,b.y,55,b.col||'#ff6b5a',0.4);
  for(const zz of g.zn){if(zz.dead)continue;L(zz.x,zz.y,zz.r*1.4,zz.col,0.32*clamp(zz.life/zz.max*3,0,1))}
  for(const f of g.fl){const q=f.t/f.life;L(f.x,f.y,f.r*3,f.col,(1-q)*1.1)}
  for(const b of g.bl){const q=1-b.t/b.max;if(q>0.6)L(b.x,b.y,b.r*1.6,b.col||'#ff6a2b',(q-0.6)*1.2)}
  for(const b of g.bolts){const q=b.t/b.max,pp=b.pts;for(let i=0;i<pp.length;i+=2)L(pp[i].x,pp[i].y,130,b.col,q*0.9)}
  for(const b of g.beams){const q=b.t/b.max,dx=b.x2-b.x1,dy=b.y2-b.y1,len=Math.hypot(dx,dy),nS=Math.min(12,Math.ceil(len/90));for(let i=0;i<=nS;i++)L(b.x1+dx*i/nS,b.y1+dy*i/nS,90+b.w*2,b.col,q*0.8)}
  if(g.walls)for(const wl of g.walls){const q=clamp((wl.t0+wl.dur-g.t)/0.6,0,1),dx=wl.x1-wl.x0,dy=wl.y1-wl.y0,nS=Math.max(2,Math.ceil(Math.hypot(dx,dy)/70));for(let i=0;i<=nS;i++)L(wl.x0+dx*i/nS,wl.y0+dy*i/nS,110,'#ff7a2b',0.55*q*(0.85+0.3*Math.random()))}
  if(g.jet&&g.jet.t>0){const J=g.jet;for(let i=1;i<=4;i++){const dd=J.len*i/4;L(J.x+Math.cos(J.ang)*dd,J.y+Math.sin(J.ang)*dd,70+dd*0.5,'#ff8a3a',0.75*(0.85+0.3*Math.random()))}}
  for(const t of g.tor)L(t.x,t.y,t.r*1.8,t.col||'#bdf5e0',0.25);
  for(let i=0;i<g.guns.length;i++){const gq=g.guns[i];if(gq.fl>0.05){const ps=gunPos(g,i);L(ps.x+Math.cos(gq.aim||0)*30,ps.y+Math.sin(gq.aim||0)*30,110,'#ffd27a',gq.fl*0.9)}}
  for(const l of LTS){const q=1-l.t/l.T;L(l.x,l.y,l.r,l.col,l.a*q*q)}
  /* молния с неба: огромная вспышка */
  for(const b of g.sk){const q=clamp(b.t/b.max,0,1);L(b.x,b.y,b.big?560:440,'#e6eeff',1.6*q);L(b.x,b.y,140,'#ffffff',q)}
  /* резкие тени от сильных вспышек: тень уходит от источника */
  const shL=[];for(const b of g.sk)shL.push({x:b.x,y:b.y,r:b.big?560:440,a:clamp(b.t/b.max,0,1)});for(const l of LTS)if(l.sh){const q=1-l.t/l.T;shL.push({x:l.x,y:l.y,r:l.r,a:q*q*l.a})}
  if(shL.length){
    x.globalCompositeOperation='source-over';x.fillStyle=amb;
    for(const S of shL){if(S.a<0.05)continue;
      for(const s of g.solids){const dx=s.x-S.x,dy=s.y-S.y,dd=Math.hypot(dx,dy);if(dd<s.r+4||dd>S.r)continue;
        const ux=dx/dd,uy=dy/dd,px=-uy*s.r*0.9,py=ux*s.r*0.9,len=(S.r-dd)*0.55+s.r,ex=s.x+ux*len,ey=s.y+uy*len,sp=1+len/(dd+1)*0.35;
        x.globalAlpha=Math.min(0.85,S.a*0.9)*(1-dd/S.r*0.6);
        x.beginPath();const bx=s.x+ux*s.r*0.35,by=s.y+uy*s.r*0.35;x.moveTo(SX(bx+px),SY(by+py));x.lineTo(SX(ex+px*sp),SY(ey+py*sp));x.lineTo(SX(ex-px*sp),SY(ey-py*sp));x.lineTo(SX(bx-px),SY(by-py));x.closePath();x.fill()}}
  }
  x.globalAlpha=1;x.globalCompositeOperation='source-over';
  /* наложение на кадр */
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='multiply';
  ctx.imageSmoothingEnabled=true;ctx.drawImage(LM.c,0,0,cv.width,cv.height);
  ctx.restore();
  /* лёгкое свечение поверх: сильные вспышки чуть «пересвечивают» кадр */
  if(dark>0.15){ctx.save();ctx.globalCompositeOperation='lighter';
    for(const b of g.sk){const q=clamp(b.t/b.max,0,1);glow(b.x,b.y,(b.big?380:300),'#c8d8ff',0.35*q*dark*2)}
    for(const f of g.fl){const q=f.t/f.life;glow(f.x,f.y,f.r*2.2,f.col,(1-q)*0.25*dark*2)}
    ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
}
