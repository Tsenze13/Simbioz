
const NEWV={boomer:1,saw:1,bubble:1,orb:1,fruit:1,wasp:1};
const SPV={fire:1,wave:1,tsunami:1,blade:1,bullet:1,seed:1,ice:1,rock:1};
const HSC={fire:0,wave:.6,blade:.6,bullet:.55,seed:.6,rock:.5};
SP.hit.spike=(c,x,y,p,seed,h)=>{
  const r=h.k,rt=p>.7?SP.cl(1-(p-.7)/.3,0,1):1,up=SP.ez(SP.cl(p*3.2,0,1))*rt;
  c.fillStyle='rgba(20,12,6,.45)';c.beginPath();c.ellipse(0,4,r*.9,r*.45,0,0,Math.PI*2);c.fill();
  if(p<.5){c.fillStyle='rgba(150,120,80,'+(.5*(1-p*2))+')';for(let i=0;i<6;i++){c.beginPath();c.arc(Math.cos(i*1.1)*r*.6*SP.ez(p*2),Math.sin(i*1.1)*r*.3-p*14,r*.18+r*.2*p,0,Math.PI*2);c.fill()}}
  const pts=[[0,0,1],[-.5,.2,.7],[.5,.25,.75],[-.25,-.35,.6],[.3,-.3,.65]];
  pts.sort((a,b)=>a[1]-b[1]);
  pts.forEach((q,i)=>SP.spikeRock(c,q[0]*r,q[1]*r*.6,r*1.25*q[2]*up,r*.2,seed+i));
};
SP.hit.root=(c,x,y,p,seed,h)=>{c.save();c.scale(h.k,h.k*1.15);c.translate(-SP.CX,-(SP.CY+28));SP.AB['Древний корень'](c,p,anim);c.restore()};
function hitFx(kk,x,y,a,k,life){
  const g=G;if(!g||g.hfx.length>34)return;
  g.hfx.push({kk:kk,x:x,y:y,a:a,k:k,sc:k,t:0,life:life,seed:Math.floor(Math.random()*90),rot:kk==='bullet'||kk==='blade'});
}
function projHitFx(b,x,y){
  const v=b.vis;if(!SP.hit[v])return;
  if(b.hfxT>0)return;b.hfxT=v==='bullet'?0.05:0.15;
  const a=Math.atan2(b.vy,b.vx);
  if(v==='fire')hitFx('fire',x,y,a,Math.max(.4,(b.blast||44)/70),.55);
  else hitFx(v,x,y,a,HSC[v]||.6,v==='bullet'?.3:.5);
}
function blFx(b){
  const g=G;if(!g||g.hfx.length>34)return;
  if(b.vis==='spike')g.hfx.push({kk:'spike',x:b.x,y:b.y,a:0,k:Math.max(18,b.r),sc:1,t:0,life:.85,seed:Math.floor(Math.random()*90)});
  else if(b.vis==='meteor')hitFx('fire',b.x,b.y,0,Math.max(.5,b.r/60),.7);
  else if(b.vis==='drop'||b.vis==='shell')rainSplash(b);
  else if(b.vis==='root')g.hfx.push({kk:'root',x:b.x,y:b.y,a:0,k:b.r/110,sc:1,t:0,life:1.1,seed:1});
}
const AFXM={nova:['Вспышка',118,0],frost:['Ледяной шквал',110,18],quake:['Землетрясение',100,0],blaze:['Боевой жар',100,0],stoneward:['Каменный покров',96,0],bladestorm:['Вихрь клинков',96,0],tailwind:['Попутный ветер',96,0],magnet:['Магнитный импульс',104,0],bastion:['Бастион',96,0]};
function drawProjSpr(b,a,v){
  ctx.globalCompositeOperation='source-over';
  ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);
  if(v==='fire')SP.proj.fire(ctx,anim,clamp(b.r/9,.8,1.5));
  else if(v==='wave')SP.proj.wave(ctx,anim,b.r/32);
  else if(v==='tsunami')SP.proj.wave(ctx,anim,Math.min(b.r/32,4.5));
  else if(v==='blade')SP.proj.blade(ctx,anim,.62);
  else if(v==='ice')SP.proj.ice(ctx,anim,.85);
  else if(v==='bullet')SP.proj.bullet(ctx,anim,clamp(b.r/4.5*.62,.5,1));
  else if(v==='seed')SP.proj.seed(ctx,anim,.55);
  else if(v==='rock')SP.rock(ctx,anim,b.r/20,7);
  ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='lighter';
}
const ZSP={steam:['Пар',100,0],lava:['Магма',104,0],wildfire:['Лесной пожар',110,0],bog:['Топь',110,0],livebog:['Топь',110,0],rust:['Ржавчина',100,0],vines:['Лоза жизни',90,0],spore:['Пыльца',110,0],spring:['Источник',90,0],sprout:['Росток жизни',96,0]};
function zoneSpr(z){
  const m=ZSP[z.kind];if(!m)return false;
  const fade=Math.min(1,z.life/0.5),k=z.r/m[1]*(0.7+0.3*fade);
  ctx.save();ctx.translate(z.x,z.y);ctx.scale(k,k*1.15);ctx.translate(-SP.CX,-(SP.CY+22));
  const p=z.kind==='spring'?(anim*.6)%1:(z.kind==='lava'?.99:1);
  SP.AB[m[0]](ctx,p,anim);
  ctx.restore();ctx.globalAlpha=fade*.35;
  ctx.strokeStyle=rgba(z.col,0.7);ctx.lineWidth=1.4;ctx.setLineDash([6,10]);ctx.lineDashOffset=-anim*10;
  ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
  return true;
}
function wallSpr(s){
  const r=s.r,x=s.x,y=s.y;
  SP.shadow(ctx,x,y+r*.9,r*1.2,.5);
  ctx.fillStyle=SP.lg(ctx,x-r,0,x+r,0,[[0,'#8a8f9c'],[.5,'#c4c9d4'],[1,'#5a606e']]);
  ctx.fillRect(x-r,y-r*.9,r*2,r*1.8);
  ctx.strokeStyle='rgba(20,24,34,.8)';ctx.lineWidth=1;
  for(let i=1;i<4;i++){const yy=y-r*.9+i*r*.45;ctx.beginPath();ctx.moveTo(x-r,yy);ctx.lineTo(x+r,yy);ctx.stroke();ctx.beginPath();const xo=(i%2?0:r*.5);ctx.moveTo(x-r*.5+xo,yy-r*.45);ctx.lineTo(x-r*.5+xo,yy);ctx.stroke()}
  ctx.fillStyle='rgba(255,255,255,.2)';ctx.fillRect(x-r,y-r*.9,r*2,3);
  ctx.strokeStyle='rgba(10,12,18,.85)';ctx.strokeRect(x-r,y-r*.9,r*2,r*1.8);
}
function turretSpr(s){
  const x=s.x,y=s.y,a=s.aim||0,tv=s.tvis,col=s.col||'#b4c0d4';
  SP.shadow(ctx,x,y+12,15,.5);
  ctx.fillStyle=SP.lg(ctx,0,y-4,0,y+14,[[0,'#d3dbe8'],[1,'#303848']]);
  ctx.beginPath();ctx.moveTo(x-14,y+12);ctx.lineTo(x-9,y-2);ctx.lineTo(x+9,y-2);ctx.lineTo(x+14,y+12);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#10131a';ctx.lineWidth=1.2;ctx.stroke();
  if(tv==='tesla'){
    ctx.strokeStyle='#c9b84a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-2);ctx.lineTo(x,y-16);ctx.stroke();
    ctx.fillStyle=SP.rg(ctx,x,y-18,8,[[0,'#fff'],[.5,'#f4f08a'],[1,'rgba(244,240,138,0)']]);ctx.beginPath();ctx.arc(x,y-18,7+Math.sin(anim*12),0,TAU);ctx.fill();
  }else{
    ctx.save();ctx.translate(x,y-4);ctx.rotate(a);
    if(tv==='thorn'){ctx.fillStyle=SP.lg(ctx,0,-5,0,5,[[0,'#e5ebf5'],[1,'#2a3040']]);ctx.fillRect(0,-4,20,8);ctx.fillStyle='#e8ddb0';for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(4+i*6,-4);ctx.lineTo(6+i*6,-10);ctx.lineTo(8+i*6,-4);ctx.fill()}}
    else{ctx.fillStyle=SP.lg(ctx,0,-5,0,5,[[0,'#e5ebf5'],[.5,'#8a94a8'],[1,'#2a3040']]);ctx.fillRect(0,-3.5,20,7);ctx.fillStyle='#10131a';ctx.fillRect(18,-2.4,3,4.8)}
    ctx.restore();
    ctx.fillStyle=SP.lg(ctx,0,y-14,0,y,[[0,'#e5ebf5'],[1,'#3a4258']]);ctx.beginPath();ctx.arc(x,y-4,8,Math.PI,0);ctx.fill();ctx.stroke();
  }
}
