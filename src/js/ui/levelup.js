/* =====================================================================
   ПОВЫШЕНИЕ УРОВНЯ
   ===================================================================== */
const PVP={fire:'fire',water:'wave',air:'blade',metal:'bullet',wood:'seed'};
const PVG={pistol:[4,45,27],shotgun:[19,106,72],rifle:[27,130,93],sniper:[45,170,128],smg:[16,100,66],launcher:[27,138,96]};
function cardPrev(c){
  if((c.kind==='skill'||c.kind==='fuse')&&AB[c.key]&&SP.AB[AB[c.key].n]){
    const f=SP.AB[AB[c.key].n];
    return (x,w,h,t)=>{const k=.56,p=Math.min(1,.12+((t*.5)%1.2));x.save();x.translate(w/2-SP.CX*k,h*.6-SP.CY*k);x.scale(k,k);f(x,p,t);x.restore()};
  }
  if(c.kind==='el'){
    const v=PVP[c.key];
    return (x,w,h,t)=>{
      const u=(t*.6)%1,px=w*.14+u*w*.72;
      for(let i=0;i<3;i++){const uu=u-i*.05;if(uu<0)continue;x.save();x.globalAlpha=.25-i*.07;x.translate(w*.14+uu*w*.72,h*.56);if(v)SP.proj[v](x,t,1.2);x.restore()}
      x.save();x.translate(px,h*.56);
      if(v)SP.proj[v](x,t,1.3);else SP.rockBit(x,0,0,13,t*4,3,'#7a6a52');
      x.restore();
      x.save();x.globalAlpha=.8;x.fillStyle=c.c1;x.beginPath();x.arc(w*.1,h*.56,3,0,TAU);x.fill();x.restore();
    };
  }
  if((c.kind==='gun'||c.kind==='gunmod')&&SP[c.key]&&PVG[c.key]){
    const m=PVG[c.key],G0=GUNS[c.key],k=Math.min(1.5,185/m[1]);
    return (x,w,h,t)=>{
      const cyc=Math.max(1.1,G0.cd+.35),u=t%cyc;
      let fl=0;const shots=[];
      if(G0.burst){for(let i=0;i<G0.burst;i++){const d=u-i*G0.bi;if(d>=0&&d<.4)shots.push(d);if(d>=0&&d<.11)fl=Math.max(fl,1-d/.11)}}
      else{if(u<.4)shots.push(u);if(u<.12)fl=1-u/.12}
      x.save();x.translate(0,h*.46);x.scale(k,k);
      x.translate((w/k-(m[2]+m[0]))*.5+m[0],0);
      x.translate(-fl*3,0);
      if(c.key==='launcher'&&u<.45){x.save();x.translate(m[2]+10+u*300,-5-Math.sin(u/.45*Math.PI)*22);x.rotate(u*14);SP.grenade(x,0);x.restore()}
      SP[c.key](x,fl);
      x.globalCompositeOperation='lighter';
      if(c.key!=='launcher')for(const d of shots){x.fillStyle='rgba(255,240,170,'+(.9*(1-d/.4))+')';x.fillRect(m[2]+6+d*520,-3.6,22,2.2)}
      x.restore();
    };
  }
  return null;
}
let lvRaf=0,lvPv=[];
function lvLoop(){
  if($('levelup').hidden){lvRaf=0;return}
  const t=performance.now()/1000;
  for(const q of lvPv){
    const x=q.cv.getContext('2d'),w=q.cv.width/2,h=q.cv.height/2;
    x.setTransform(2,0,0,2,0,0);x.clearRect(0,0,w,h);
    try{q.f(x,w,h,t)}catch(e){}
    x.globalCompositeOperation='source-over';x.globalAlpha=1;
  }
  lvRaf=requestAnimationFrame(lvLoop);
}
function openLevelUp(force){
  const g=G;
  g.pending--;g.lvlOpen=true;g.choices=force||buildChoices();
  if(!g.choices.length){g.lvlOpen=false;return}
  for(const k in codes)codes[k]=false;
  joy.on=false;joy.dx=joy.dy=0;
  $('luT').textContent='Уровень '+g.p.lv;
  let h='';
  $('luT').textContent='Уровень '+g.p.lv+(g.sp>0?' · очков навыков: '+g.sp+' (T)':'');
  g.choices.forEach((c,i)=>{
    const pf=cardPrev(c);c.pf=pf;
    h+='<button class="card'+(c.dual?' fuse':'')+(pf?' pv':'')+'" type="button" data-i="'+i+'" style="--c1:'+c.c1+';--c2:'+c.c2+'">'+(pf?'<canvas class="cprev" width="440" height="208"></canvas>':'')+'<span class="orb'+(c.dual?' dual':'')+'"></span><span class="tg">'+c.tag+'</span><strong>'+c.title+'</strong><em>'+c.sub+'</em><p>'+c.desc+'</p>'+(c.mc?'<span class="cm">'+c.mc+'</span>':'')+'<kbd>'+(i+1)+'</kbd></button>';
  });
  $('cards').innerHTML=h;
  $('levelup').hidden=false;
  lvPv=[];$('cards').querySelectorAll('button.card').forEach((b,i)=>{const cv=b.querySelector('canvas.cprev');if(cv&&g.choices[i].pf)lvPv.push({cv:cv,f:g.choices[i].pf})});
  if(!lvRaf)lvRaf=requestAnimationFrame(lvLoop);
  sfx(500,0.25,'triangle',0.05,500);
}
function pickCard(i){
  const g=G;
  if(!g||!g.lvlOpen)return;
  const c=g.choices[i];
  if(!c)return;
  applyChoice(c);
  g.lvlOpen=false;$('levelup').hidden=true;
  if(g.sp>0&&!g.hinted&&g.pending<=0){g.hinted=true;openTree()}
  sfx(660,0.12,'triangle',0.05,300);
}
$('cards').addEventListener('click',e=>{const b=e.target.closest('.card');if(b)pickCard(parseInt(b.getAttribute('data-i'),10))});

