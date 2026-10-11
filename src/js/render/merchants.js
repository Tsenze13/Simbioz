const MS=(function(){
const TAU=Math.PI*2,OUT='rgba(8,8,14,.88)';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function E(c,x,y,rx,ry,fill,rot,stroke,lw){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),rot||0,0,TAU);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw||1.2;c.stroke()}}
function P(c,pts,fill,stroke,lw){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw||1.2;c.lineJoin='round';c.stroke()}}
function RR(c,x,y,w,h,r,fill,stroke,lw){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw||1.2;c.stroke()}}
function LG(c,x1,y1,x2,y2,st){const g=c.createLinearGradient(x1,y1,x2,y2);for(const [o,k] of st)g.addColorStop(o,k);return g}
function RG(c,x,y,r,st){const g=c.createRadialGradient(x,y,0,x,y,Math.max(.1,r));for(const [o,k] of st)g.addColorStop(o,k);return g}
function G(c,x,y,r,col,a){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=a;c.fillStyle=RG(c,x,y,r,[[0,col],[1,'rgba(0,0,0,0)']]);c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore()}
function L(c,x1,y1,x2,y2,col,w,cap){c.strokeStyle=col;c.lineWidth=w;c.lineCap=cap||'round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.lineCap='butt'}
function arm(c,sx,sy,hx,hy,sleeve,skin,w){L(c,sx,sy,hx,hy,OUT,(w||6)+2);L(c,sx,sy,hx,hy,sleeve,w||6);E(c,hx,hy,3,3,skin,0,OUT,1)}
function R(s){const x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x)}

function stall(c,cloth,cloth2,wood,t){
  // тень
  c.save();c.translate(0,14);c.scale(1,.32);c.fillStyle=RG(c,0,0,62,[[0,'rgba(0,0,0,.6)'],[1,'rgba(0,0,0,0)']]);c.beginPath();c.arc(0,0,62,0,TAU);c.fill();c.restore();
  // навес-ткань за спиной
  const sw=Math.sin(t*1.3)*1.2;
  c.beginPath();c.moveTo(-38,-44);c.lineTo(38,-44);c.lineTo(38+sw*.5,-27);
  for(let i=0;i<=8;i++){const x=38-i*9.5;c.lineTo(x,-27+(i%2?4:0)+Math.sin(t*2+i)*.8)}
  c.closePath();c.fillStyle=cloth;c.fill();c.strokeStyle=OUT;c.lineWidth=1.3;c.stroke();
  c.save();c.clip();for(let i=-4;i<4;i++){c.fillStyle=cloth2;c.fillRect(i*19,-46,9.5,24)}c.restore();
  c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=1;c.beginPath();c.moveTo(-36,-43);c.lineTo(36,-43);c.stroke();
  // стойки
  for(const x of [-36,36]){RR(c,x-2.5,-46,5,44,2,LG(c,x-3,0,x+3,0,[[0,wood[0]],[1,wood[1]]]),OUT,1)}
  // стойка прилавка
  RR(c,-34,6,68,22,3,LG(c,0,6,0,28,[[0,wood[0]],[.6,wood[1]],[1,wood[2]]]),OUT,1.4);
  c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=1;for(const y of [12,18,23]){c.beginPath();c.moveTo(-33,y);c.lineTo(33,y);c.stroke()}
  for(let i=0;i<5;i++){const x=-28+i*14+R(i)*5;L(c,x,7,x+R(i+3)*3-1.5,27,'rgba(0,0,0,.18)',1,'butt')}
  c.fillStyle='rgba(255,255,255,.14)';c.fillRect(-33,7,66,1.6);
}
function nearRing(c,col,t,near){
  if(!near)return;
  c.save();c.translate(0,12);c.scale(1,.38);
  c.strokeStyle=col;c.globalAlpha=.55+.3*Math.sin(t*5);c.lineWidth=3;c.beginPath();c.arc(0,0,58,0,TAU);c.stroke();
  c.restore();G(c,0,-8,64,col,.2);
}
const SK=['#c99a76','#e0b894','#b08060','#8a5a3a'];

/* ---------- Кузнец Бронн ---------- */
function smith(c,t,near){
  nearRing(c,'#ff8a5c',t,near);
  stall(c,'#5a2e22','#4a241a',['#7a5634','#5a3c22','#3a2614'],t);
  // горн слева
  RR(c,-62,-26,26,34,4,LG(c,-62,-26,-36,8,[[0,'#4a4a52'],[1,'#26262c']]),OUT,1.3);
  const fl=.75+.25*Math.sin(t*9)+.1*Math.sin(t*23);
  E(c,-49,-9,9,10,RG(c,-49,-9,10,[[0,'#fff1b0'],[.4,'#ff8a2b'],[1,'#7a1a08']]),0,OUT,1);
  G(c,-49,-9,34,'#ff6a1b',.5*fl);
  for(let i=0;i<5;i++){const k=((t*.8+i*.21)%1);G(c,-49+Math.sin(i*5+t*3)*6,-9-k*34,3,'#ffcf6a',.9*(1-k))}
  // голова/тело
  const br=Math.sin(t*2)*.5;
  E(c,0,-3+br,17,10,'#4a3a2e',0,OUT,1.3);
  P(c,[[-10,-10+br],[10,-10+br],[9,8],[-9,8]],'#6a4a30',OUT,1.2);
  L(c,-9,-9+br,-6,8,'#2a1c12',2,'butt');L(c,9,-9+br,6,8,'#2a1c12',2,'butt');
  E(c,-14,-5+br,5,4,'#7a7a86',-.3,OUT,1);E(c,14,-5+br,5,4,'#7a7a86',.3,OUT,1);
  E(c,0,-15+br,8.5,8.5,SK[0],0,OUT,1.2);
  L(c,-8,-18+br,8,-18+br,'#2a2a34',3.2,'butt'); // повязка
  E(c,0,-11+br,7.8,5.6,'#b24c20',0,OUT,1); E(c,0,-9+br,5,4.5,'#c85e2a');
  L(c,-3.4,-15.5+br,-1.6,-15.5+br,'#2a1a10',1.6);L(c,1.6,-15.5+br,3.4,-15.5+br,'#2a1a10',1.6);
  // молот: цикл
  const ph=(t%1.9)/1.9;let up=ph<.62?Math.pow(ph/.62,1.4):(ph<.7?1-(ph-.62)/.08:0);
  const hx=17,hy=10-up*16;
  arm(c,13,-4+br,hx,hy,'#5a4a3a',SK[0],6);
  const ang=-1.1+up*.2;
  const hxe=hx+Math.cos(ang)*11,hye=hy+Math.sin(ang)*11;
  L(c,hx,hy,hxe,hye,'#4a2e18',3.2);
  c.save();c.translate(hxe,hye);c.rotate(ang+Math.PI/2);RR(c,-6,-3.5,12,7,1.5,LG(c,-6,-3,6,3,[[0,'#c9d0dc'],[.5,'#8a93a4'],[1,'#3a4050']]),OUT,1);c.restore();
  arm(c,-13,-4+br,-12,10,'#5a4a3a',SK[0],6);L(c,-12,10,-4,13,'#9aa2b4',1.6);
  // наковальня
  P(c,[[2,10],[28,10],[32,14],[28,19],[6,19],[2,15]],LG(c,2,10,2,19,[[0,'#8a92a4'],[1,'#2c3040']]),OUT,1.3);
  c.fillStyle='rgba(255,255,255,.35)';c.fillRect(6,11,20,1.4);
  const strike=ph>.62&&ph<.7?1:0,hot=ph>.62?Math.max(0,1-(ph-.62)*3):0;
  E(c,15,13.5,6,2.6,hot>0?'#ffb04a':'#7a3a1a',0,OUT,.8);
  if(hot>0)G(c,15,13,22,'#ff8a2b',.6*hot);
  if(ph>.64){const dt=(ph-.64)*1.9;if(dt<.5)for(let i=0;i<10;i++){const a=i*.63+R(i)*.4-Math.PI*.9,v=40+R(i+4)*70;const x=15+Math.cos(a)*v*dt,y=13+Math.sin(a)*v*dt*.6+200*dt*dt-8*dt;G(c,x,y,2.6,'#ffd36b',1-dt*2)}}
  // товар: щит и меч
  E(c,-24,17,7.5,6,'#4a5060',0,OUT,1.2);E(c,-24,17,5.2,4,'#7a1e1e');E(c,-24,17,1.8,1.5,'#cfd6e4');
  c.save();c.translate(-10,19);L(c,-12,0,12,0,'#d5dbe8',3);L(c,-12,-1,12,-1,'rgba(255,255,255,.7)',1,'butt');L(c,-12,0,12,0,OUT,.6,'butt');L(c,-12,-4,-12,4,'#8a6a2a',2.4);c.restore();
}

/* ---------- Алхимик Мирра ---------- */
function alch(c,t,near){
  nearRing(c,'#6fe3a0',t,near);
  stall(c,'#1e4a3e','#173a31',['#6a5a3c','#4a3e28','#2e2618'],t);
  // котёл слева
  const cx=-45,cy=-2;
  E(c,cx,cy+4,17,9,'rgba(0,0,0,.4)');
  E(c,cx,cy,16,12,LG(c,cx-16,cy-12,cx+16,cy+12,[[0,'#4a4e58'],[1,'#14161c']]),0,OUT,1.4);
  E(c,cx,cy,12.5,8.8,RG(c,cx,cy,13,[[0,'#b8ffd2'],[.55,'#3ed07a'],[1,'#146a3a']]),0,'rgba(0,0,0,.5)',1);
  G(c,cx,cy,34,'#58f0a0',.38+.1*Math.sin(t*3));
  for(let i=0;i<6;i++){const k=((t*.7+i*.17)%1),bx=cx+Math.sin(i*2.7+t)*8,by=cy+Math.cos(i*1.9)*4-k*5;if(k<.85){E(c,bx,by,1.4+k*2,(1.4+k*2)*.7,'rgba(210,255,225,'+(.8-k*.5)+')',0,'rgba(255,255,255,.7)',.7)}}
  for(let i=0;i<4;i++){const k=((t*.35+i*.25)%1);G(c,cx+Math.sin(i*3+t*1.5)*7,cy-10-k*40,7+k*8,'#c9ffe0',.22*(1-k))}
  // тело
  const br=Math.sin(t*2.2)*.5;
  E(c,0,-3+br,15,9.5,'#2a6a5a',0,OUT,1.3);
  P(c,[[-9,-9+br],[9,-9+br],[8,8],[-8,8]],'#34805e',OUT,1.1);
  L(c,-12,-4+br,12,-4+br,'#5a3a22',3,'butt');
  for(const x of [-6,0,6]){E(c,x,-4+br,1.8,2,['#ff6a8a','#6fe3ff','#ffd36b'][(x+6)/6],0,OUT,.7)}
  // волосы сзади + хвост
  const sw=Math.sin(t*2.4)*2;
  E(c,-4+sw*.3,-20+br,8,6,'#5a2a7a',0,OUT,1);
  for(let i=0;i<2;i++){const s=i?1:-1;c.strokeStyle='#7a3aa8';c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(s*7,-17+br);c.quadraticCurveTo(s*14+sw,-12,s*13+sw*1.5,-3+Math.sin(t*3+i)*1.5);c.stroke();c.lineCap='butt'}
  E(c,0,-15+br,8,8.2,SK[1],0,OUT,1.2);
  E(c,0,-20+br,8.4,4.6,'#7a3aa8',0,OUT,1); // чёлка
  // очки на лбу
  for(const x of [-4.2,4.2]){E(c,x,-20.5+br,3.4,3,'#1c2a2a',0,OUT,.8);E(c,x,-20.5+br,2.3,2,'rgba(120,255,180,.8)');E(c,x-.6,-21.3+br,.8,.7,'#fff')}
  L(c,-3.4,-14.5+br,-1.8,-14.5+br,'#2a1a2a',1.5);L(c,1.8,-14.5+br,3.4,-14.5+br,'#2a1a2a',1.5);
  c.fillStyle='rgba(255,120,140,.35)';c.beginPath();c.arc(-5,-12+br,1.6,0,TAU);c.arc(5,-12+br,1.6,0,TAU);c.fill();
  // правая рука мешает в котле
  const a=t*2.2,sx=Math.cos(a)*7,sy=Math.sin(a)*3.5;
  arm(c,-13,-4+br,cx+9+sx*.3,cy+4+sy,'#2a6a5a',SK[1],5.5);
  L(c,cx+9+sx*.3,cy+4+sy,cx+sx,cy+sy-1,'#8a6a3a',2.2);
  // левая рука держит колбу
  const fy=Math.sin(t*1.7)*1.2;
  arm(c,13,-4+br,16,9+fy,'#2a6a5a',SK[1],5.5);
  E(c,16,6+fy,5,5,'rgba(120,255,190,.35)',0,'rgba(220,255,235,.9)',1);E(c,16,7+fy,3.6,3.4,'#58f0a0');L(c,16,0+fy,16,2+fy,'#d9ffea',2.2,'butt');G(c,16,6+fy,16,'#58f0a0',.4);
  // склянки на прилавке
  const fl=[[-20,17,'#ff5a7a'],[-10,18,'#6fd6ff'],[0,17,'#ffd36b'],[26,17,'#b88aff']];
  for(const [x,y,col] of fl){E(c,x,y,4.2,3.6,'rgba(255,255,255,.18)',0,'rgba(230,240,255,.8)',1);E(c,x,y+.5,3,2.5,col);L(c,x,y-4.4,x,y-2.6,'#d9e6f0',2.2,'butt');E(c,x-1,y-.6,1,.8,'rgba(255,255,255,.9)');G(c,x,y,13,col,.28)}
  RR(c,8,13,10,9,1.5,'#d8c89a',OUT,.9);L(c,10,16,16,16,'rgba(60,40,20,.6)',1,'butt');L(c,10,18.5,15,18.5,'rgba(60,40,20,.6)',1,'butt');
}

/* ---------- Чародей Эзра ---------- */
function mage(c,t,near){
  nearRing(c,'#9a8aff',t,near);
  stall(c,'#241d52','#1a1540',['#5a4a6a','#3e3250','#261e36'],t);
  // звёзды на навесе
  for(let i=0;i<9;i++){const x=-32+i*8,y=-40+R(i)*10;G(c,x,y,4,'#ffe9a8',.4+.4*Math.sin(t*2+i))}
  // орб на подставке справа
  const ox=44,oy=2,pu=1+.12*Math.sin(t*3);
  RR(c,ox-5,oy+6,10,8,2,'#3a3050',OUT,1);E(c,ox,oy+6,7,3,'#5a4a78',0,OUT,1);
  E(c,ox,oy-4,9,9,RG(c,ox-2,oy-7,11,[[0,'#f0e8ff'],[.4,'#a58aff'],[1,'#3a2a8a']]),0,OUT,1.2);
  G(c,ox,oy-4,34*pu,'#9a7aff',.5);
  for(let i=0;i<6;i++){const a=t*1.2+i*TAU/6;E(c,ox+Math.cos(a)*15,oy-4+Math.sin(a)*6,1.6,1.6,'#e6dcff');G(c,ox+Math.cos(a)*15,oy-4+Math.sin(a)*6,6,'#b8a4ff',.6)}
  // книга парит над прилавком слева
  const by=Math.sin(t*1.6)*2.5,bx=-30;
  c.save();c.translate(bx,2+by);c.rotate(-.12);
  G(c,0,2,26,'#ffe9a8',.2);
  P(c,[[-12,-6],[0,-4],[0,8],[-12,6]],'#e8dcc0',OUT,1);P(c,[[12,-6],[0,-4],[0,8],[12,6]],'#d8ccaa',OUT,1);
  for(let i=0;i<3;i++){L(c,-10,-3+i*3,-2,-2+i*3,'rgba(80,50,30,.5)',1,'butt');L(c,2,-2+i*3,10,-3+i*3,'rgba(80,50,30,.5)',1,'butt')}
  const fp=(t*.9)%1;if(fp<.5){const k=fp*2;P(c,[[0,-4],[12*Math.cos(k*Math.PI),-6-6*Math.sin(k*Math.PI)],[12*Math.cos(k*Math.PI),6-6*Math.sin(k*Math.PI)],[0,8]],'rgba(240,230,205,.85)',OUT,.8)}
  P(c,[[-13,-7],[-13,7],[0,9],[0,-5]],'rgba(60,40,110,.5)');
  c.restore();
  // тело (мантия)
  const br=Math.sin(t*1.9)*.5;
  E(c,0,-3+br,17,10.5,'#2a2a78',0,OUT,1.3);
  P(c,[[-9,-8+br],[9,-8+br],[8,9],[-8,9]],LG(c,0,-8,0,9,[[0,'#3a3a98'],[1,'#222266']]),OUT,1.1);
  L(c,0,-8+br,0,9,'#e9c75a',3,'butt');
  for(const s of [-1,1]){E(c,s*14,-5+br,5,4,'#ecd88a',0,OUT,1)}
  // голова: борода, шляпа
  E(c,0,-12+br,8.4,8,SK[1],0,OUT,1.2);
  P(c,[[-7,-11+br],[7,-11+br],[5,2+br],[0,5+br],[-5,2+br]],'#ececf4',OUT,1.1);
  c.strokeStyle='rgba(120,120,150,.5)';c.lineWidth=.9;for(const x of [-3,0,3]){c.beginPath();c.moveTo(x,-8+br);c.quadraticCurveTo(x*1.3,-2+br,x*.8,3+br);c.stroke()}
  E(c,0,-14.5+br,5.5,2.6,'#ececf4',0,OUT,.7);
  L(c,-3.5,-14.5+br,-1.6,-14.5+br,'#1a1a28',1.5);L(c,1.6,-14.5+br,3.5,-14.5+br,'#1a1a28',1.5);
  c.save();c.translate(1,-20+br);c.rotate(.25);
  E(c,0,0,14,10,'#26267a',0,OUT,1.3); // поля
  E(c,0,-1,7.5,6,LG(c,-7,-6,7,5,[[0,'#4a4ab8'],[1,'#1c1c60']]),0,OUT,1.1);
  E(c,0,0.6,7.6,2.4,'#e9c75a'); // лента
  // кончик
  P(c,[[-3,-3],[3,-3],[6,-14+Math.sin(t*2)*1.5],[0,-9]],'#2e2e8e',OUT,1);
  c.restore();
  G(c,2,-22+br,5,'#ffe9a8',.8);
  // руки, посох в правой
  arm(c,13,-4+br,24,3,'#2a2a78',SK[1],5.5);
  L(c,24,10,24,-18,'#6a4a2a',3.2,'butt');L(c,24,10,24,-18,OUT,.7,'butt');
  E(c,24,-20,4,4,RG(c,24,-20,5,[[0,'#fff'],[.5,'#9a8aff'],[1,'#4a3aa8']]),0,OUT,1);G(c,24,-20,22,'#9a8aff',.55+.2*Math.sin(t*4));
  E(c,24,3,3,3,SK[1],0,OUT,1);
  arm(c,-13,-4+br,-12,8+by*.4,'#2a2a78',SK[1],5.5);
  // свитки
  for(const [x,y,r] of [[-6,18,.1],[6,19,-.15],[16,17,.2]]){c.save();c.translate(x,y);c.rotate(r);RR(c,-6,-2.2,12,4.4,2,'#e6d8b0',OUT,.9);E(c,-6,0,1.8,2.2,'#c8b88a',0,OUT,.7);E(c,6,0,1.8,2.2,'#c8b88a',0,OUT,.7);c.restore()}
  E(c,16,17,1.6,1.6,'#c0392b');
}

/* ---------- Контрабандист Рогар ---------- */
function smug(c,t,near){
  nearRing(c,'#ffd36b',t,near);
  stall(c,'#241a1a','#1a1212',['#4a3a2e','#32261c','#20170f'],t);
  // ящики и мешок слева
  RR(c,-60,-8,22,20,2,LG(c,-60,-8,-38,12,[[0,'#7a5a34'],[1,'#4a3418']]),OUT,1.3);
  c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1.2;c.beginPath();c.moveTo(-60,2);c.lineTo(-38,2);c.moveTo(-49,-8);c.lineTo(-49,12);c.stroke();
  RR(c,-56,-22,16,14,2,LG(c,-56,-22,-40,-8,[[0,'#6a4c2a'],[1,'#3e2a14']]),OUT,1.2);L(c,-56,-15,-40,-15,'rgba(0,0,0,.4)',1.1,'butt');
  E(c,-30,10,9,7,'#6a5a3a',0,OUT,1.2);L(c,-33,5,-27,5,'#3a2c1a',2.2);
  // фонарь на столбе справа
  const sw=Math.sin(t*1.4)*2;
  L(c,44,-44,44+sw*.4,-36,'#2a2a2a',1.4);
  RR(c,40+sw*.4,-37,9,12,2,'#2a2a30',OUT,1);E(c,44.5+sw*.4,-31,2.8,4,'#ffe29a');
  const fk=.75+.15*Math.sin(t*11)+.1*Math.sin(t*5);
  G(c,44+sw*.4,-31,70,'#ffb347',.42*fk);G(c,0,0,60,'#ffb347',.1*fk);
  // тело
  const br=Math.sin(t*1.8)*.5,look=Math.sin(t*.7)*2.2;
  E(c,0,-3+br,18,10.5,'#1c1c24',0,OUT,1.3);
  P(c,[[-11,-9+br],[11,-9+br],[10,9],[-10,9]],LG(c,-10,0,10,0,[[0,'#26262e'],[.5,'#1a1a22'],[1,'#2a2a34']]),OUT,1.1);
  L(c,0,-8+br,0,9,'rgba(255,255,255,.08)',1.2,'butt');
  // красный платок и пуговицы
  P(c,[[-8,-10+br],[8,-10+br],[5,-4+br],[-5,-4+br]],'#8a2a2a',OUT,1);
  for(const y of [0,4]){E(c,-1.5,y,1.1,1.1,'#d9b45a');}
  // капюшон сверху
  c.save();c.translate(look*.4,-16+br);
  E(c,0,0,11.5,11,LG(c,-11,-11,11,11,[[0,'#3a3a46'],[1,'#14141a']]),0,OUT,1.4);
  E(c,look,2.5,7.2,6.4,'#07070b'); // тёмный зев капюшона
  E(c,look,3.2,5.2,4.4,SK[2]);
  P(c,[[look-5.5,4.6],[look+5.5,4.6],[look+4.4,8],[look-4.4,8]],'#8a2a2a',OUT,.8);
  E(c,look-2.1,2.8,1.2,.9,'#fff6c8');E(c,look+2.1,2.8,1.2,.9,'#fff6c8');
  E(c,look-2.1+look*.2,2.8,.6,.6,'#1a1a1a');E(c,look+2.1+look*.2,2.8,.6,.6,'#1a1a1a');
  L(c,look-4,1.2,look-.8,1.8,'#0a0a0a',1.2);L(c,look+4,1.2,look+.8,1.8,'#0a0a0a',1.2);
  c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=1;c.beginPath();c.arc(0,0,9.2,3.7,5.2);c.stroke();
  c.restore();
  // монета в руке — подбрасывает
  const cf=(t%2.4)/2.4,toss=cf<.5?Math.sin(cf*2*Math.PI):0,cy=3-toss*22,cw=Math.abs(Math.cos(cf*TAU*3));
  arm(c,13,-4+br,18,6,'#1c1c24',SK[2],5.5);
  E(c,18,cy,3.4*Math.max(.25,cw),3.4,'#ffd36b',0,OUT,.9);G(c,18,cy,12,'#ffd36b',.5);
  arm(c,-13,-4+br,-14,9,'#1c1c24',SK[2],5.5);
  // товар на тряпке
  RR(c,-5,12,36,10,2,'#3a1a1a',OUT,1);
  const gems=[[1,'#6fe3ff'],[7,'#ff5a7a'],[13,'#7fe39a']];
  for(const [x,col] of gems){P(c,[[x-2.6,17],[x,13.5],[x+2.6,17],[x,20]],col,OUT,.8);G(c,x,17,10,col,.3+.2*Math.sin(t*3+x))}
  c.save();c.translate(22,17);c.rotate(-.5);L(c,-7,0,5,0,'#cfd6e4',2);L(c,-7,0,5,0,OUT,.5);L(c,5,-2.6,5,2.6,'#6a2a2a',2.2);c.restore();
  E(c,-14,18,3,3,'#ffd36b',0,OUT,.8);E(c,-10,19,3,3,'#e0b84a',0,OUT,.8);
  // блик на стёклах (глаза) уже; тихий дым от фонаря
}


/* ---------- Мастер перемен Ксандр ---------- */
function sage(c,t,near){
  nearRing(c,'#6fd6d0',t,near);
  stall(c,'#164040','#10302f',['#4a5a5a','#323f3f','#1e2828'],t);
  for(let i=0;i<8;i++){const x=-32+i*9,y=-40+R(i+20)*9;G(c,x,y,3.5,'#9ff7ee',.3+.3*Math.sin(t*2.4+i))}
  // кольцо рун на прилавке
  c.save();c.translate(0,16);c.scale(1,.26);
  c.strokeStyle='rgba(111,214,208,.75)';c.lineWidth=3;c.beginPath();c.arc(0,0,27,0,TAU);c.stroke();
  c.lineWidth=1.5;c.beginPath();c.arc(0,0,20,0,TAU);c.stroke();
  for(let i=0;i<10;i++){const a=i/10*TAU+t*.5;c.fillStyle='rgba(180,255,246,.85)';c.fillRect(Math.cos(a)*23.5-1.2,Math.sin(a)*23.5-2.5,2.4,5)}
  c.restore();
  G(c,0,16,34,'#6fd6d0',.22);
  // тело: длинное серо-бирюзовое пальто с высоким воротом
  const br=Math.sin(t*2)*.5;
  E(c,0,-3+br,17,10,'#2e4a4c',0,OUT,1.3);
  P(c,[[-10,-9+br],[10,-9+br],[9,9],[-9,9]],LG(c,-9,0,9,0,[[0,'#3a5c5e'],[.5,'#2a4446'],[1,'#3a5c5e']]),OUT,1.1);
  L(c,0,-8+br,0,9,'rgba(159,247,238,.45)',1.4,'butt');
  for(const s of [-1,1]){P(c,[[s*4,-10+br],[s*12,-8+br],[s*9,-2+br],[s*3,-5+br]],'#4a7274',OUT,1)}
  // голова
  E(c,0,-14+br,8,8.2,SK[1],0,OUT,1.2);
  E(c,0,-18+br,8.6,5.4,'#c9d8e0',0,OUT,1); // серебристые волосы
  for(const x of [-5,-1,3]){L(c,x,-22+br,x+1.5,-16+br,'rgba(255,255,255,.35)',1,'butt')}
  L(c,-3.6,-13.8+br,-1.6,-13.8+br,'#10202a',1.5);L(c,1.6,-13.8+br,3.6,-13.8+br,'#10202a',1.5);
  c.strokeStyle='rgba(111,214,208,.95)';c.lineWidth=1;c.beginPath();c.moveTo(-5.4,-12.4+br);c.lineTo(-4.4,-9.6+br);c.moveTo(5.4,-12.4+br);c.lineTo(4.4,-9.6+br);c.stroke();
  G(c,0,-14+br,10,'#6fd6d0',.25);
  // руки раскрыты над кольцом, сферы навыков меняются местами
  const cols=['#ff6a4a','#4aa7ff','#7be07a'];
  const hxL=-17+Math.sin(t*1.5)*1,hxR=17-Math.sin(t*1.5)*1;
  arm(c,-13,-4+br,hxL,10,'#2e4a4c',SK[1],5.5);arm(c,13,-4+br,hxR,10,'#2e4a4c',SK[1],5.5);
  G(c,hxL,10,14,'#9ff7ee',.5);G(c,hxR,10,14,'#9ff7ee',.5);
  for(let i=0;i<3;i++){
    const a=t*1.1+i*TAU/3,sw=.5+.5*Math.sin(t*.8+i*2);
    const x=Math.cos(a)*(18+6*sw),y=15+Math.sin(a)*5-(Math.sin(a)>0?0:0)-6*sw*Math.max(0,Math.sin(t*.8+i*2));
    E(c,x,y,3.6,3.6,RG(c,x-1,y-1,4,[[0,'#fff'],[.5,cols[i]],[1,'rgba(0,0,0,.6)']]),0,OUT,.8);G(c,x,y,15,cols[i],.55);
  }
}

/* ---------- Магнат Мидас ---------- */
function tycoon(c,t,near){
  nearRing(c,'#f0a8ff',t,near);
  stall(c,'#4a1e5a','#381046',['#7a5a2a','#5a4018','#3a280c'],t);
  for(let i=0;i<9;i++){const x=-32+i*8;G(c,x,-28+(i%2?3:0),3,'#ffd36b',.35+.3*Math.sin(t*3+i))}
  // куча золота слева на прилавке
  for(let i=0;i<16;i++){const a=R(i+40)*TAU,r=R(i+60)*11,x=-22+Math.cos(a)*r*1.2,y=17+Math.sin(a)*r*.4;E(c,x,y,3.6,2.4,LG(c,x-3,y-2,x+3,y+2,[[0,'#fff1b0'],[1,'#c9922a']]),0,OUT,.7)}
  G(c,-22,15,26,'#ffd36b',.4+.1*Math.sin(t*3));
  const sp=(t*1.3)%1;G(c,-26+sp*10,12-sp*8,5,'#ffffff',.9*(1-sp));
  // сундук справа
  RR(c,14,10,24,14,2,LG(c,14,10,14,24,[[0,'#7a3a1a'],[1,'#3a1a0a']]),OUT,1.2);
  P(c,[[14,10],[38,10],[36,5],[16,5]],'#8a4a22',OUT,1.1);
  L(c,14,15,38,15,'#d9a43a',1.8,'butt');E(c,26,15,2.4,2.4,'#ffd36b',0,OUT,.8);
  E(c,26,7,10,3,'rgba(255,220,120,.7)');G(c,26,6,22,'#ffd36b',.55);
  // тело: сливовое пальто, меховой воротник
  const br=Math.sin(t*1.7)*.5;
  E(c,0,-3+br,19,11,'#4a1e5a',0,OUT,1.3);
  P(c,[[-11,-9+br],[11,-9+br],[10,9],[-10,9]],LG(c,-10,0,10,0,[[0,'#5a2a70'],[.5,'#3e1650'],[1,'#5a2a70']]),OUT,1.1);
  L(c,-9,-8+br,-9,9,'#d9a43a',1.6,'butt');L(c,9,-8+br,9,9,'#d9a43a',1.6,'butt');
  for(const y of [-2,3]){E(c,0,y,1.5,1.5,'#ffd36b',0,OUT,.6)}
  E(c,0,-9+br,15,7,'#e8e0d0',0,OUT,1.2);E(c,0,-9+br,10,4.4,'#b8ae9c');
  // голова
  E(c,0,-13+br,8.4,8,SK[0],0,OUT,1.2);
  P(c,[[-5,-9+br],[0,-7.5+br],[5,-9+br],[7,-8+br],[0,-5.5+br],[-7,-8+br]],'#2a1a14',OUT,.8);
  E(c,3.2,-14+br,2.6,2.6,'rgba(200,240,255,.35)',0,'#ffd36b',1);G(c,3.2,-14+br,7,'#ffffff',.5+.4*Math.sin(t*2));
  L(c,-3.6,-14.2+br,-1.8,-14.2+br,'#1a1018',1.5);
  // цилиндр
  c.save();c.translate(0,-20+br);c.rotate(-.08);
  E(c,0,0,11,8.4,'#15111c',0,OUT,1.2);
  E(c,0,-1.4,7.6,5.6,'#241c2e',0,OUT,1);E(c,0,-1.4,7.6,5.6,null,0,'#ffd36b',1.6);
  E(c,-2,-3,2.4,1.4,'rgba(255,255,255,.25)');
  c.restore();
  // руки: правая подбрасывает монету, левая на золоте
  const cf=(t%1.8)/1.8,toss=cf<.55?Math.sin(cf/.55*Math.PI):0,cw=Math.abs(Math.cos(cf*TAU*3));
  arm(c,13,-4+br,20,4,'#4a1e5a',SK[0],6);E(c,20,-2-toss*20,3.6*Math.max(.25,cw),3.6,'#ffd36b',0,OUT,.9);G(c,20,-2-toss*20,12,'#ffd36b',.6);
  arm(c,-13,-4+br,-18,13,'#4a1e5a',SK[0],6);
}

const FN={smith,alch,mage,smug,sage,tycoon};
return{draw(c,id,t,near){c.save();try{FN[id](c,t,!!near)}catch(e){}c.restore()},ids:Object.keys(FN)};
})();
