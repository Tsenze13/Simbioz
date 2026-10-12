/* =====================================================================
   ОРУЖИЕ СОЛДАТА — детальные спрайты (бета 0.35)
   Ствол смотрит в +x, дуло — в тех же точках, что у прежних спрайтов,
   поэтому GUNS[].mz и превью карточек (PVG) не меняются.
   Подключается после sprites_skills.js и подменяет SP.pistol … SP.grenade.
   ===================================================================== */
const GUNART=(function(){
const TAU=Math.PI*2;
const OUT='rgba(6,8,12,.96)';
function path(c,p){c.beginPath();for(let i=0;i<p.length;i++)i?c.lineTo(p[i][0],p[i][1]):c.moveTo(p[i][0],p[i][1]);c.closePath()}
function box(p){let a=1e9,b=-1e9,y0=1e9,y1=-1e9;for(const q of p){a=Math.min(a,q[0]);b=Math.max(b,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}return [a,y0,b,y1]}
function lgr(c,x1,y1,x2,y2,st){const g=c.createLinearGradient(x1,y1,x2,y2);for(const [o,k] of st)g.addColorStop(o,k);return g}
function rgr(c,x,y,r,st){const g=c.createRadialGradient(x,y,0,x,y,r);for(const [o,k] of st)g.addColorStop(o,k);return g}
/* скос: светлая кромка сверху, тень снизу (внутри формы) */
function bevel(c,p,hi,lo){c.save();path(c,p);c.clip();c.lineWidth=1.6;
  c.translate(0,1.1);path(c,p);c.strokeStyle=hi;c.stroke();
  c.translate(0,-2.2);path(c,p);c.strokeStyle=lo;c.stroke();c.restore()}
/* палитры: [верх, середина, низ] */
const PAL={
  steel:['#dfe6f2','#7d889c','#262c3a'],
  dark:['#8c96aa','#3c4352','#11141c'],
  blue:['#b6c6e2','#4c5a78','#161c2c'],
  poly:['#5c6270','#2e323c','#111318'],
  olive:['#a7b07a','#5f6a3c','#232914'],
  tan:['#e2cf9e','#a98c58','#4a3a1e'],
  brass:['#fff0b0','#d2a442','#6a4a12'],
  red:['#ff9a86','#c8382a','#4e0e08']};
function part(c,p,pal,o){
  const P=PAL[pal]||pal,b=box(p);path(c,p);
  c.fillStyle=lgr(c,0,b[1],0,b[3],[[0,P[0]],[.42,P[1]],[1,P[2]]]);c.fill();
  bevel(c,p,'rgba(255,255,255,'+((o&&o.hi)||.38)+')','rgba(0,0,0,.42)');
  path(c,p);c.strokeStyle=OUT;c.lineWidth=1.15;c.stroke();
}
function wood(c,p,dark){
  const b=box(p);path(c,p);
  c.fillStyle=lgr(c,0,b[1],0,b[3],dark?[[0,'#a8683a'],[.5,'#6a3c1c'],[1,'#2a160a']]:[[0,'#e0a464'],[.45,'#9c5e30'],[1,'#3e200c']]);c.fill();
  c.save();path(c,p);c.clip();
  c.strokeStyle='rgba(40,16,4,.35)';c.lineWidth=.8;
  for(let i=0;i<7;i++){const y=b[1]+(i+.5)*(b[3]-b[1])/7;c.beginPath();c.moveTo(b[0]-2,y);
    for(let x=b[0];x<=b[2]+4;x+=6)c.lineTo(x,y+Math.sin(x*.21+i*1.7)*1.1);c.stroke()}
  c.strokeStyle='rgba(255,226,180,.18)';c.beginPath();c.ellipse((b[0]+b[2])/2,(b[1]+b[3])/2,(b[2]-b[0])*.3,(b[3]-b[1])*.2,0,0,TAU);c.stroke();
  c.restore();
  bevel(c,p,'rgba(255,230,190,.35)','rgba(0,0,0,.45)');
  path(c,p);c.strokeStyle='rgba(22,10,3,.96)';c.lineWidth=1.15;c.stroke();
}
/* рукоять с насечкой */
function grip(c,p,pal){
  part(c,p,pal||'poly',{hi:.22});
  c.save();path(c,p);c.clip();c.fillStyle='rgba(0,0,0,.35)';const b=box(p);
  for(let y=b[1]+3;y<b[3]-1;y+=2.2)for(let x=b[0]+((y*1.3)%2.2);x<b[2];x+=2.2)c.fillRect(x,y,.9,.9);
  c.fillStyle='rgba(255,255,255,.07)';for(let y=b[1]+4;y<b[3]-1;y+=2.2)for(let x=b[0]+1+((y*1.3)%2.2);x<b[2];x+=2.2)c.fillRect(x,y,.6,.6);
  c.restore();
}
function screw(c,x,y,r){r=r||1.3;c.fillStyle=rgr(c,x-r*.3,y-r*.3,r*1.4,[[0,'#f2f5fa'],[.5,'#8a94a6'],[1,'#20242e']]);c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
  c.strokeStyle='rgba(10,12,16,.8)';c.lineWidth=.5;c.beginPath();c.moveTo(x-r*.7,y);c.lineTo(x+r*.7,y);c.stroke()}
function line(c,x0,y0,x1,y1,col,w){c.strokeStyle=col;c.lineWidth=w||1;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke()}
/* планка Пикатинни */
function rail(c,x0,x1,y){part(c,[[x0,y-2.4],[x1,y-2.4],[x1,y],[x0,y]],'dark',{hi:.25});
  c.fillStyle='#0b0d12';for(let x=x0+1.5;x<x1-1.5;x+=3)c.fillRect(x,y-3.6,1.6,1.4)}
/* дульная вспышка: лепестки + ядро, мерцает от f */
function flash(c,x,y,f){
  c.save();c.globalCompositeOperation='lighter';c.translate(x,y);
  const s=f*(.85+.3*Math.sin(f*37));
  c.fillStyle=rgr(c,0,0,30*s,[[0,'rgba(255,255,240,1)'],[.25,'rgba(255,214,110,.85)'],[1,'rgba(255,110,20,0)']]);c.beginPath();c.arc(4*s,0,30*s,0,TAU);c.fill();
  const pet=[[0,40,6],[.5,20,4],[-.5,20,4],[1.15,14,3],[-1.15,14,3]];
  for(const [a,L,W] of pet){c.save();c.rotate(a+Math.sin(f*23+a)*.08);
    c.fillStyle=lgr(c,0,0,L*s,0,[[0,'rgba(255,255,230,.95)'],[.5,'rgba(255,200,90,.8)'],[1,'rgba(255,90,20,0)']]);
    c.beginPath();c.moveTo(0,-W*s*.5);c.quadraticCurveTo(L*s*.5,-W*s,L*s,0);c.quadraticCurveTo(L*s*.5,W*s,0,W*s*.5);c.closePath();c.fill();c.restore()}
  c.fillStyle='rgba(255,255,255,.95)';c.beginPath();c.ellipse(3*s,0,6*s,3*s,0,0,TAU);c.fill();
  c.restore();
}
function guard(c,x0,x1,y0,dy){c.strokeStyle='#14171e';c.lineWidth=2.2;c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo(x0+1,y0+dy,(x0+x1)/2,y0+dy);c.quadraticCurveTo(x1,y0+dy,x1,y0);c.stroke();
  c.strokeStyle='rgba(160,170,190,.45)';c.lineWidth=.7;c.stroke();
  c.strokeStyle='#0c0e12';c.lineWidth=1.4;c.beginPath();c.moveTo((x0+x1)/2-1,y0);c.quadraticCurveTo((x0+x1)/2+1,y0+dy*.5,(x0+x1)/2-1.5,y0+dy*.75);c.stroke()}

/* ---------- ПИСТОЛЕТ ---------- */
function pistol(c,fl){
  grip(c,[[-15,0],[-3,0],[-4,6],[-6,20],[-17,21],[-18,18]],'poly');
  part(c,[[-18.5,19],[-5.5,18.4],[-5.8,21.6],[-18.8,22.2]],'dark');
  part(c,[[-15,-2],[25,-2],[25,3],[2,3],[-3,1],[-15,1]],'dark');
  guard(c,-3,9,2.5,7);
  part(c,[[-19,-8],[-18,-10],[25,-10],[27,-8.5],[27,-1.5],[-19,-1.5]],'steel');
  c.fillStyle='rgba(0,0,0,.55)';for(let i=0;i<6;i++)c.fillRect(-16.5+i*1.9,-9,1,6.5);
  part(c,[[4,-10],[14,-10],[14,-6],[4,-6]],'dark',{hi:.15});c.fillStyle='#d6a33e';c.fillRect(6,-8.6,5,1.6);
  c.fillStyle='#0b0d12';c.fillRect(22.5,-12.2,2.2,2.4);c.fillRect(-17.5,-12.2,3.6,2.4);
  c.fillStyle='#ff4a3a';c.beginPath();c.arc(23.6,-11.6,.7,0,TAU);c.fill();c.fillStyle='#7cff8a';c.fillRect(-16.6,-11.9,.8,.8);c.fillRect(-14.9,-11.9,.8,.8);
  line(c,-17,-6.2,25.5,-6.2,'rgba(255,255,255,.55)',.6);
  part(c,[[-21,-6],[-18.5,-7],[-18.5,-3],[-21,-3.6]],'dark');
  screw(c,-10.5,4.2,1.1);screw(c,-12,16,1.1);
  c.fillStyle='#05070a';c.beginPath();c.ellipse(27,-5,.9,2,0,0,TAU);c.fill();
  if(fl>0)flash(c,28,-5,fl);
}

/* ---------- ДРОБОВИК (помповый) ---------- */
function shotgun(c,fl){
  wood(c,[[-34,-4],[-8,-7],[-6,1],[-12,4],[-24,10],[-35,12],[-37,6]]);
  part(c,[[-38,-4.6],[-34.5,-4.8],[-35,12.6],[-38.4,12.4]],'poly',{hi:.18});
  part(c,[[-6,-8],[16,-8],[18,-6],[18,5],[-6,5]],'blue');
  c.fillStyle='#0b0d12';path(c,[[0,-1],[12,-1],[12,3],[0,3]]);c.fill();c.fillStyle='rgba(210,164,66,.85)';c.fillRect(2,0,7,2);
  screw(c,-3,-4,1.1);screw(c,14,-4,1.1);
  guard(c,-4,8,5,7);
  part(c,[[16,-1],[64,-1],[64,4],[16,4]],'dark');
  part(c,[[16,-6.5],[72,-6.5],[72,-1.5],[16,-1.5]],'steel');
  c.save();path(c,[[22,-8.8],[62,-8.8],[62,-6.2],[22,-6.2]]);c.fillStyle='#262b38';c.fill();c.restore();
  c.fillStyle='#0b0d12';for(let x=25;x<60;x+=5){c.beginPath();c.ellipse(x,-7.5,1.5,.8,0,0,TAU);c.fill()}
  wood(c,[[22,-2],[42,-2],[43,7],[21,7]],true);
  c.strokeStyle='rgba(20,8,2,.8)';c.lineWidth=1;for(let x=24;x<41;x+=2.6){c.beginPath();c.moveTo(x,-1);c.lineTo(x,6);c.stroke()}
  part(c,[[62,-2],[66,-2],[66,4.5],[62,4.5]],'dark');
  part(c,[[68,-7.2],[72.6,-7.2],[72.6,-.8],[68,-.8]],'dark');
  c.fillStyle='#f2e6b8';c.beginPath();c.arc(70,-8,1,0,TAU);c.fill();
  c.fillStyle='#05070a';c.beginPath();c.ellipse(72.4,-4,1.1,2.2,0,0,TAU);c.fill();
  for(let i=0;i<4;i++){const x=-4.5+i*4.6;part(c,[[x,-14.2],[x+3.8,-14.2],[x+3.8,-10.2],[x,-10.2]],'red',{hi:.3});part(c,[[x,-10.4],[x+3.8,-10.4],[x+3.8,-8.4],[x,-8.4]],'brass',{hi:.4})}
  if(fl>0)flash(c,73,-4,fl*1.15);
}

/* ---------- АВТОМАТ ---------- */
function rifle(c,fl){
  wood(c,[[-38,-5],[-10,-8],[-8,0],[-10,4],[-24,10],[-37,12],[-40,8]]);
  part(c,[[-41,-5.6],[-37.6,-5.8],[-38.2,12.6],[-41.4,12.4]],'poly',{hi:.18});
  /* магазин: рёбра идут между передней и задней кромкой и обрезаны по форме */
  const qb=(a,b,d,t)=>(1-t)*(1-t)*a+2*(1-t)*t*b+t*t*d;
  const fr=t=>[qb(21,23,39,t),qb(3,24,37,t)],bk=t=>[qb(6,9,26,t),qb(3,27,41,t)];
  const magP=()=>{c.beginPath();c.moveTo(6,3);c.lineTo(21,3);c.quadraticCurveTo(23,24,39,37);c.lineTo(26,41);c.quadraticCurveTo(9,27,6,3);c.closePath()};
  magP();c.fillStyle=lgr(c,6,0,36,0,[[0,'#3e2a18'],[.4,'#a86e3a'],[.7,'#7a4a24'],[1,'#2e1c0e']]);c.fill();
  c.save();magP();c.clip();
  for(let i=1;i<=4;i++){const t=i/5,f=fr(t),b=bk(t),ix=(f[0]-b[0])*.08,iy=(f[1]-b[1])*.08;
    c.strokeStyle='rgba(30,14,4,.6)';c.lineWidth=1.3;c.beginPath();c.moveTo(b[0]+ix,b[1]+iy);c.lineTo(f[0]-ix,f[1]-iy);c.stroke();
    c.strokeStyle='rgba(255,214,160,.22)';c.lineWidth=.7;c.beginPath();c.moveTo(b[0]+ix,b[1]+iy+1.2);c.lineTo(f[0]-ix,f[1]-iy+1.2);c.stroke()}
  c.strokeStyle='rgba(255,220,170,.28)';c.lineWidth=1.4;c.beginPath();c.moveTo(19.6,4);c.quadraticCurveTo(21.4,24,36.6,35.6);c.stroke();
  c.restore();
  magP();c.strokeStyle='rgba(22,10,3,.96)';c.lineWidth=1.15;c.stroke();
  part(c,[[24,39],[39.5,34.5],[41,38],[26.6,42.6]],'dark');
  grip(c,[[-7,2],[3,2],[5,7],[2,19],[-8,19],[-9,15]],'poly');
  guard(c,2,14,3,6);
  /* ствольная коробка */
  part(c,[[-10,-9],[36,-9],[36,3],[-10,3]],'blue');
  c.save();path(c,[[-8,-12],[34,-12],[36,-9],[-10,-9]]);c.fillStyle=lgr(c,0,-12,0,-9,[[0,'#d5deec'],[1,'#4c5a78']]);c.fill();c.strokeStyle=OUT;c.lineWidth=1.1;c.stroke();c.restore();
  c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=.9;for(let x=0;x<32;x+=6){c.beginPath();c.moveTo(x,-11.6);c.lineTo(x+2,-9.3);c.stroke()}
  part(c,[[16,-6],[28,-6],[28,-1],[16,-1]],'dark',{hi:.12});c.fillStyle='rgba(210,164,66,.9)';c.fillRect(18,-4.4,6,2);
  part(c,[[-6,-1],[6,-3],[7,-1.6],[-5,.4]],'steel');
  screw(c,-6,-5,1.1);screw(c,32,-1,1.1);
  /* цевьё и газовая трубка */
  wood(c,[[36,-8],[62,-8],[62,3],[36,3]],true);
  c.strokeStyle='rgba(255,230,190,.25)';c.lineWidth=.7;for(let x=40;x<60;x+=5){c.beginPath();c.moveTo(x,-6);c.lineTo(x,1);c.stroke()}
  part(c,[[36,-13],[68,-13],[68,-8.5],[36,-8.5]],'blue');
  c.fillStyle='#0b0d12';for(let x=42;x<66;x+=6)c.fillRect(x,-11.6,2.6,1.4);
  part(c,[[62,-5.6],[86,-5.6],[86,-1.8],[62,-1.8]],'steel');
  part(c,[[70,-7],[73,-7],[73,-.6],[70,-.6]],'dark');
  part(c,[[76,-6.4],[79,-6.4],[79,-.8],[76,-.8]],'dark');
  c.fillStyle='#0b0d12';c.beginPath();c.moveTo(76.4,-6.4);c.lineTo(77.6,-12.6);c.lineTo(78.8,-6.4);c.closePath();c.fill();
  c.fillStyle='#ffd27a';c.beginPath();c.arc(77.6,-12.6,.6,0,TAU);c.fill();
  /* дульный тормоз */
  part(c,[[84,-7.6],[93,-7.6],[93,0],[84,0]],'dark');
  c.fillStyle='#05070a';for(const x of [86,89])c.fillRect(x,-6.6,1.6,2.6);
  c.fillStyle='#05070a';c.beginPath();c.ellipse(93,-3.7,1,2.4,0,0,TAU);c.fill();
  if(fl>0)flash(c,94,-3.7,fl);
}

/* ---------- ПИСТОЛЕТ-ПУЛЕМЁТ ---------- */
function smg(c,fl){
  c.lineCap='round';c.lineJoin='round';
  c.strokeStyle='#14171e';c.lineWidth=3;c.beginPath();c.moveTo(-8,-4);c.lineTo(-30,-6);c.lineTo(-33,7);c.lineTo(-10,2);c.stroke();
  c.strokeStyle='#9aa4b8';c.lineWidth=1.2;c.stroke();c.lineCap='butt';c.lineJoin='miter';
  part(c,[[-36,-8],[-30,-8],[-31,9],[-37,9]],'poly',{hi:.2});
  /* длинный магазин с окном патронов */
  part(c,[[6,3],[17,3],[19,33],[8,33]],'dark');
  c.fillStyle='#0b0d12';path(c,[[10,8],[14,8],[15.6,28],[11.6,28]]);c.fill();
  for(let i=0;i<4;i++){c.fillStyle=lgr(c,10,0,16,0,[[0,'#7a5212'],[.5,'#ffd77a'],[1,'#8a5e16']]);c.fillRect(10.6+i*.32,9.4+i*4.6,3.6,2.4)}
  part(c,[[7.2,32],[19.4,32],[19.8,35],[7,35]],'dark');
  grip(c,[[-9,2],[0,2],[1,6],[-1,18],[-10,18],[-11,14]],'poly');
  guard(c,0,10,3,6);
  part(c,[[-10,-10],[34,-10],[34,3],[-10,3]],'steel');
  c.fillStyle='#0b0d12';c.fillRect(14,-6,10,3);c.fillStyle='rgba(210,164,66,.85)';c.fillRect(16,-5.4,5,1.8);
  part(c,[[-6,-3.5],[2,-3.5],[2,-.8],[-6,-.8]],'dark');
  screw(c,-6,-7,1.1);screw(c,30,-1,1.1);
  /* кожух ствола с отверстиями */
  part(c,[[34,-8],[58,-8],[58,1],[34,1]],'dark');
  c.fillStyle='#05070a';for(let x=37;x<56;x+=4.4){c.beginPath();c.arc(x,-3.6,1.4,0,TAU);c.fill()}
  c.fillStyle='rgba(255,255,255,.18)';for(let x=37;x<56;x+=4.4){c.beginPath();c.arc(x+.4,-3.2,.6,0,TAU);c.fill()}
  part(c,[[58,-6.6],[66,-6.6],[66,-.4],[58,-.4]],'blue');
  c.fillStyle='#05070a';c.beginPath();c.ellipse(66,-3.5,1,2.2,0,0,TAU);c.fill();
  /* коллиматор */
  rail(c,-4,30,-10);
  part(c,[[6,-12.4],[22,-12.4],[22,-10],[6,-10]],'dark');
  part(c,[[4,-20],[24,-20],[24,-12.4],[4,-12.4]],'poly',{hi:.3});
  c.fillStyle=rgr(c,22.5,-16.2,5,[[0,'#ffe0d8'],[.35,'#ff4a3a'],[1,'#3a0606']]);c.beginPath();c.ellipse(22.6,-16.2,1.6,3.2,0,0,TAU);c.fill();
  c.save();c.globalCompositeOperation='lighter';c.fillStyle='rgba(255,60,40,.5)';c.beginPath();c.arc(22.6,-16.2,3.4,0,TAU);c.fill();c.restore();
  screw(c,10,-16.2,1);
  if(fl>0)flash(c,67,-3.5,fl);
}

/* ---------- ГРАНАТОМЁТ (револьверный) ---------- */
function launcher(c,fl){
  wood(c,[[-40,-5],[-12,-8],[-10,2],[-14,6],[-28,13],[-41,13],[-43,8]]);
  part(c,[[-44,-5.6],[-40.4,-5.8],[-41,13.6],[-44.4,13.4]],'poly',{hi:.18});
  grip(c,[[-10,4],[0,4],[2,9],[0,24],[-9,24],[-11,19]],'poly');
  guard(c,0,12,6,6);
  part(c,[[-12,-11],[12,-11],[12,6],[-12,6]],'olive');
  screw(c,-8,-7,1.2);screw(c,-8,2,1.2);
  /* барабан с камерами */
  part(c,[[10,-18],[40,-18],[42,-14],[42,10],[40,13],[10,13],[8,10],[8,-14]],'dark');
  for(let i=0;i<3;i++){const y=-12.4+i*8.6;
    part(c,[[11,y-3.2],[39,y-3.2],[39,y+3.2],[11,y+3.2]],'olive',{hi:.3});
    c.fillStyle=rgr(c,13,y-1,4,[[0,'#fff4c0'],[.5,'#d2a442'],[1,'#5a3e10']]);c.beginPath();c.arc(13.5,y,2.6,0,TAU);c.fill();
    c.fillStyle='rgba(0,0,0,.35)';c.fillRect(30,y-3.2,1.2,6.4)}
  screw(c,25,-15.6,1.2);
  /* труба ствола */
  part(c,[[40,-14],[84,-14],[84,4],[40,4]],'steel');
  c.strokeStyle='rgba(20,24,34,.55)';c.lineWidth=1.3;for(let x=50;x<82;x+=8){c.beginPath();c.moveTo(x,-14);c.lineTo(x,4);c.stroke()}
  c.fillStyle='rgba(255,255,255,.35)';c.fillRect(42,-12.4,40,1);
  part(c,[[82,-17],[96,-17],[96,7],[82,7]],'dark');
  c.fillStyle='#05070a';c.beginPath();c.ellipse(96,-5,2.6,10.2,0,0,TAU);c.fill();
  c.fillStyle='rgba(255,230,140,.25)';c.beginPath();c.ellipse(95.6,-8,1,4,0,0,TAU);c.fill();
  /* передняя рукоять и прицел */
  grip(c,[[54,4],[62,4],[63,16],[55,17]],'poly');
  part(c,[[46,-22],[60,-22],[60,-14],[46,-14]],'dark');
  c.fillStyle='#e8c84a';c.fillRect(51,-28,2.4,6);c.fillRect(48.8,-29,6.8,2.2);
  c.save();c.globalCompositeOperation='lighter';c.fillStyle='rgba(255,220,90,.35)';c.beginPath();c.arc(52.2,-27.8,3,0,TAU);c.fill();c.restore();
  if(fl>0)flash(c,97,-5,fl*1.3);
}

/* ---------- СНАЙПЕРКА ---------- */
function sniper(c,fl){
  /* приклад с вырезом под большой палец */
  c.beginPath();c.moveTo(-40,-5);c.lineTo(-10,-9);c.lineTo(-8,3);c.lineTo(-12,6);c.lineTo(-24,13);c.lineTo(-39,13);c.lineTo(-42,8);c.closePath();
  c.moveTo(-26,1);c.ellipse(-21,2.5,5.6,3,.25,Math.PI,Math.PI*3);
  c.fillStyle=lgr(c,0,-9,0,13,[[0,PAL.olive[0]],[.45,PAL.olive[1]],[1,PAL.olive[2]]]);c.fill('evenodd');c.strokeStyle=OUT;c.lineWidth=1.15;c.stroke();
  part(c,[[-34,-11],[-16,-11.6],[-15,-8.4],[-33,-7.4]],'olive',{hi:.3});
  part(c,[[-44,-5.6],[-40.4,-5.8],[-41,13.6],[-44.4,13.4]],'poly',{hi:.18});
  grip(c,[[-8,1],[2,1],[3,6],[0,16],[-9,16],[-10,11]],'olive');
  guard(c,2,14,3,5);
  part(c,[[-10,-9],[46,-9],[46,3],[-10,3]],'dark');
  part(c,[[46,-7],[60,-7],[60,2],[46,2]],'olive');
  /* затвор */
  part(c,[[-4,-6.4],[12,-6.4],[12,-2.4],[-4,-2.4]],'steel');
  c.strokeStyle='#14171e';c.lineWidth=2.4;c.beginPath();c.moveTo(-2,-3);c.lineTo(-8,3);c.stroke();
  c.fillStyle=rgr(c,-9,3.6,3.4,[[0,'#f2f5fa'],[.6,'#8a94a6'],[1,'#20242e']]);c.beginPath();c.arc(-9,3.8,2.6,0,TAU);c.fill();
  /* ствол с долами */
  part(c,[[58,-5.8],[124,-5.8],[124,-1.6],[58,-1.6]],'steel');
  c.strokeStyle='rgba(16,20,28,.6)';c.lineWidth=.8;c.beginPath();c.moveTo(62,-3.7);c.lineTo(110,-3.7);c.stroke();
  c.strokeStyle='rgba(255,255,255,.45)';c.beginPath();c.moveTo(62,-4.8);c.lineTo(110,-4.8);c.stroke();
  part(c,[[122,-8],[137,-8],[137,.6],[122,.6]],'dark');
  c.fillStyle='#05070a';for(const x of [125,128.6,132.2])c.fillRect(x,-6.8,1.8,6.2);
  c.fillStyle='#05070a';c.beginPath();c.ellipse(137.4,-3.7,1,2.4,0,0,TAU);c.fill();
  /* сошки */
  c.lineCap='round';c.strokeStyle='#14171e';c.lineWidth=2.8;c.beginPath();c.moveTo(66,1);c.lineTo(58,18);c.moveTo(70,1);c.lineTo(78,18);c.stroke();
  c.strokeStyle='#8a94a8';c.lineWidth=1.1;c.stroke();c.lineCap='butt';
  part(c,[[63,-.4],[73,-.4],[73,3],[63,3]],'dark');
  /* оптика */
  part(c,[[2,-12.4],[8,-12.4],[8,-9],[2,-9]],'dark');part(c,[[30,-12.4],[36,-12.4],[36,-9],[30,-9]],'dark');
  part(c,[[-4,-19],[40,-19],[40,-12.4],[-4,-12.4]],'poly',{hi:.3});
  part(c,[[14,-22],[20,-22],[20,-19],[14,-19]],'dark');part(c,[[15,-12.4],[19,-12.4],[19,-10.6],[15,-10.6]],'dark');
  part(c,[[38,-22.6],[54,-22.6],[54,-8.8],[38,-8.8]],'poly',{hi:.3});
  part(c,[[-12,-21],[-3,-21],[-3,-10.4],[-12,-10.4]],'poly',{hi:.3});
  c.fillStyle=rgr(c,53,-17.6,8,[[0,'#e8f8ff'],[.25,'#8cd2ff'],[.6,'#2a62b4'],[1,'#071430']]);c.beginPath();c.ellipse(54,-15.7,2.6,6.2,0,0,TAU);c.fill();
  c.save();c.globalCompositeOperation='lighter';c.fillStyle='rgba(150,220,255,.35)';c.beginPath();c.ellipse(54.6,-15.7,4,7.4,0,0,TAU);c.fill();
  c.fillStyle='rgba(255,255,255,.9)';c.beginPath();c.ellipse(53.6,-18.4,.7,1.6,0,0,TAU);c.fill();c.restore();
  c.fillStyle='#d2a442';c.fillRect(38.6,-21.8,1.6,12.2);
  if(fl>0)flash(c,138,-3.7,fl*1.2);
}

/* ---------- ГРАНАТА (осколочная) ---------- */
function grenade(c,t){
  c.fillStyle=rgr(c,-2.2,-1.8,9,[[0,'#b8c48a'],[.45,'#5f6a3c'],[1,'#1c2210']]);c.beginPath();c.ellipse(0,1,6.4,5.6,0,0,TAU);c.fill();
  c.strokeStyle='rgba(20,26,10,.75)';c.lineWidth=.8;
  c.beginPath();c.moveTo(-6,1);c.lineTo(6,1);c.moveTo(-5,-2);c.lineTo(5,-2);c.moveTo(-5,4);c.lineTo(5,4);c.stroke();
  c.beginPath();c.moveTo(-2.4,-4);c.lineTo(-2.4,6);c.moveTo(2.4,-4);c.lineTo(2.4,6);c.stroke();
  c.strokeStyle='rgba(8,10,4,.95)';c.lineWidth=1.1;c.beginPath();c.ellipse(0,1,6.4,5.6,0,0,TAU);c.stroke();
  c.fillStyle='#9aa2b2';c.fillRect(-2.2,-7.4,4.4,3);c.strokeStyle='#14171e';c.lineWidth=.8;c.strokeRect(-2.2,-7.4,4.4,3);
  c.fillStyle='#c8ccd6';c.beginPath();c.moveTo(2,-7.4);c.quadraticCurveTo(7,-7,6.6,-1);c.lineTo(5.4,-1.4);c.quadraticCurveTo(5.6,-5.6,2,-6);c.closePath();c.fill();c.stroke();
  c.strokeStyle='#e8c84a';c.lineWidth=1;c.beginPath();c.arc(-3.8,-7.2,1.8,0,TAU);c.stroke();
}
return {pistol,shotgun,rifle,smg,launcher,sniper,grenade};
})();
Object.assign(SP,GUNART);
