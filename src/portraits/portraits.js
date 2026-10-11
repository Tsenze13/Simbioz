/* Симбиоз — «живописные» портреты героев. Всё рисуется кодом в пространстве 200×200.
   PORTRAIT.draw(ctx, key, t, hp01) — ctx уже отмасштабирован под 200×200. */
(function(){
const TAU=Math.PI*2;
function hex(h){const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]}
function rgba(h,a){const[r,g,b]=hex(h);return`rgba(${r},${g},${b},${a})`}
function mix(a,b,t){const A=hex(a),B=hex(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')}
function LG(c,x0,y0,x1,y1,s){const g=c.createLinearGradient(x0,y0,x1,y1);s.forEach(a=>g.addColorStop(a[0],a[1]));return g}
function RG(c,x,y,r,s,r0,fx,fy){const g=c.createRadialGradient(fx??x,fy??y,r0||0,x,y,r);s.forEach(a=>g.addColorStop(a[0],a[1]));return g}
function ell(c,x,y,rx,ry,rot){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),rot||0,0,TAU)}
function glow(c,x,y,r,col,a){c.save();c.globalCompositeOperation='lighter';c.fillStyle=RG(c,x,y,r,[[0,rgba(col,a)],[.35,rgba(col,a*.45)],[1,rgba(col,0)]]);c.fillRect(x-r,y-r,r*2,r*2);c.restore()}
function soft(c,x,y,r,col,a,op){c.save();if(op)c.globalCompositeOperation=op;c.fillStyle=RG(c,x,y,r,[[0,rgba(col,a)],[1,rgba(col,0)]]);c.fillRect(x-r,y-r,r*2,r*2);c.restore()}
function stroke(c,col,w,a){c.save();c.globalAlpha=a??1;c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke();c.restore()}
// детерминированный шум
function hv(n){const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s)}
const INK='#120a08';

/* ---------- зерно ---------- */
let GRAIN=null;
function grain(){if(GRAIN)return GRAIN;const cv=document.createElement('canvas');cv.width=cv.height=200;const c=cv.getContext('2d'),d=c.createImageData(200,200);
 for(let i=0;i<d.data.length;i+=4){const v=110+Math.random()*90;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}c.putImageData(d,0,0);return GRAIN=cv}

/* ---------- голова ---------- */
function headPath(c,H){const w=H.hw,j=H.jaw,cx=100,top=H.top||50,ch=H.chin||148;
 c.beginPath();c.moveTo(cx,top);
 c.bezierCurveTo(cx+w*.78,top,cx+w,top+14,cx+w,top+38);
 c.bezierCurveTo(cx+w,top+52,cx+w*.98,top+60,cx+w*.93,top+66);
 c.bezierCurveTo(cx+w*j,ch-16,cx+w*.42,ch-2,cx,ch);
 c.bezierCurveTo(cx-w*.42,ch-2,cx-w*j,ch-16,cx-w*.93,top+66);
 c.bezierCurveTo(cx-w*.98,top+60,cx-w,top+52,cx-w,top+38);
 c.bezierCurveTo(cx-w,top+14,cx-w*.78,top,cx,top);c.closePath()}

function ears(c,H){const S=H.skin;for(const s of[-1,1]){const x=100+s*(H.hw-1);
 c.beginPath();c.moveTo(x,90);c.bezierCurveTo(x+s*9,84,x+s*10,104,x+s*3,114);c.lineTo(x,112);c.closePath();
 c.fillStyle=LG(c,x,88,x+s*10,112,[[0,S[1]],[1,S[2]]]);c.fill();stroke(c,INK,1.6,.7);
 c.beginPath();c.moveTo(x+s*2,94);c.bezierCurveTo(x+s*6,92,x+s*6,104,x+s*2,108);stroke(c,S[2],1.6,.6)}}

function skin(c,H,m,L){
 const S=H.skin,cx=100,w=H.hw;
 headPath(c,H);
 c.fillStyle=LG(c,cx-w,H.top||50,cx+w*.9,H.chin||148,[[0,S[0]],[.45,S[1]],[1,S[2]]]);c.fill();
 c.save();headPath(c,H);c.clip();
 // формы лица
 soft(c,cx+w*.95,112,w*.9,S[2],.55,'multiply');            // теневая сторона
 soft(c,cx,152,46,S[2],.7,'multiply');                      // под челюстью
 for(const s of[-1,1])soft(c,cx+s*w*.42,95,13,S[2],.55,'multiply'); // глазницы
 soft(c,cx-w*.35,70,30,'#ffffff',.22,'screen');            // лоб
 for(const s of[-1,1])soft(c,cx+s*w*.55,116,13,H.blush||'#d0503a',.18,'multiply'); // скулы
 soft(c,cx-w*.6,108,12,'#ffffff',.16,'screen');             // блик скулы
 soft(c,cx,141,10,'#ffffff',.14,'screen');                  // подбородок
 if(H.stub){c.globalAlpha=H.stub;for(let i=0;i<420;i++){const a=hv(i)*TAU,r=hv(i+.5);const x=cx+(hv(i+1.3)-.5)*w*1.9,y=118+hv(i+2.7)*34;
   if(y<126&&Math.abs(x-cx)<10)continue;c.fillStyle=hv(i+9)>.5?'#2a1a12':'#3c2a20';c.fillRect(x,y,.9,.9)}c.globalAlpha=1;
   soft(c,cx,138,30,'#3a2a24',.25*H.stub*2,'multiply')}
 if(H.bark){c.globalAlpha=.55;for(let i=0;i<26;i++){const x=cx-w+hv(i)*w*2,y=50+hv(i+3)*90,l=8+hv(i+7)*16;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+2,y+l*.3,x-2,y+l*.6,x+1,y+l);stroke(c,S[2],1.1+hv(i)*0.9,.6)}c.globalAlpha=1}
 // римлайт стихии
 c.globalCompositeOperation='lighter';
 c.save();c.translate(L.rx*3,0);headPath(c,H);c.restore();
 c.lineWidth=7;c.strokeStyle=rgba(H.rim,.38);c.filter='blur(3px)';c.stroke();c.filter='none';
 c.globalCompositeOperation='source-over';
 c.restore();
 headPath(c,H);stroke(c,INK,2.2,.85);
}

function eye(c,x,y,side,H,open,gx,gy,t){
 const w=9.6,ix=x-side*w,ox=x+side*w,iy=y+.8,oy=y+(H.eyeTilt||0);
 const hU=5.6*open,hD=3.4*Math.max(.35,open);
 const path=()=>{c.beginPath();c.moveTo(ix,iy);c.bezierCurveTo(ix+side*3,y-hU*1.25,ox-side*4,y-hU*1.3,ox,oy);c.bezierCurveTo(ox-side*4,y+hD*1.2,ix+side*3,y+hD*1.2,ix,iy);c.closePath()};
 if(open<.12){c.beginPath();c.moveTo(ix,iy);c.quadraticCurveTo(x,y+2.6,ox,oy);stroke(c,INK,2.4,.95);
   c.beginPath();c.moveTo(ix,iy-3);c.quadraticCurveTo(x,y-4.5,ox,oy-2.5);stroke(c,H.skin[2],1.2,.6);return}
 c.save();path();c.clip();
 c.fillStyle=LG(c,x,y-hU,x,y+hD,[[0,'#7d6e66'],[.45,'#e9e1d9'],[1,'#b9ada4']]);c.fillRect(x-12,y-9,24,16);
 const px=x+gx,py=y+gy+.6,r=4.5;
 c.fillStyle=RG(c,px,py,r,[[0,'#020202'],[.32,'#050505'],[.38,H.iris[0]],[.8,H.iris[1]],[1,'#0a0606']]);ell(c,px,py,r,r);c.fill();
 if(H.eyeGlow){c.globalCompositeOperation='lighter';c.fillStyle=RG(c,px,py,r*1.4,[[0,rgba(H.iris[0],.9)],[.6,rgba(H.iris[0],.35)],[1,rgba(H.iris[0],0)]]);ell(c,px,py,r*1.4,r*1.4);c.fill();c.globalCompositeOperation='source-over'}
 c.fillStyle=LG(c,x,y-hU*1.3,x,y-hU*.1,[[0,'rgba(20,6,2,.75)'],[1,'rgba(20,6,2,0)']]);c.fillRect(x-12,y-10,24,10);
 c.fillStyle='rgba(255,255,255,.95)';ell(c,px-1.6,py-1.8,1.25,1.1);c.fill();
 c.fillStyle='rgba(255,255,255,.5)';ell(c,px+1.6,py+1.4,.6,.5);c.fill();
 c.restore();
 // веко и ресницы
 c.beginPath();c.moveTo(ix,iy);c.bezierCurveTo(ix+side*3,y-hU*1.25,ox-side*4,y-hU*1.3,ox,oy);stroke(c,INK,2.4,1);
 c.beginPath();c.moveTo(ox-side*3,oy-1.6);c.lineTo(ox+side*2.4,oy-1.4);stroke(c,INK,1.8,.9);
 c.beginPath();c.moveTo(ix+side*2,y-hU*1.4-3.2);c.bezierCurveTo(ix+side*5,y-hU*1.8-4.5,ox-side*4,y-hU*1.8-4.2,ox+side,oy-3.5);stroke(c,H.skin[2],1.3,.55);
 c.beginPath();c.moveTo(ox,oy);c.bezierCurveTo(ox-side*4,y+hD*1.2,ix+side*3,y+hD*1.2,ix,iy);stroke(c,'#4a1e14',1.1,.45);
 if(H.eyeGlow)glow(c,px,py,13,H.iris[0],.28+.08*Math.sin(t*3));
}

function brow(c,x,y,side,col,lift,inner,th){
 // inner: + опускает внутренний край (злость), − поднимает (боль)
 const ix=x-side*10.5,ox=x+side*12,iy=y-9.5+inner-lift,oy=y-11-lift+(inner<0?3:0)-(inner>3?1:0);
 c.beginPath();c.moveTo(ix,iy+th*.5);
 c.quadraticCurveTo(x+side*2,(iy+oy)/2-th*1.4,ox,oy);
 c.quadraticCurveTo(x+side*2,(iy+oy)/2+th*.2,ix,iy+th*1.6);c.closePath();
 c.fillStyle=col;c.fill();stroke(c,INK,1,.5);
 c.save();c.clip();for(let i=0;i<14;i++){const u=i/13,px=ix+(ox-ix)*u,py=iy+(oy-iy)*u+th*.6;c.beginPath();c.moveTo(px,py+1.5);c.lineTo(px+side*3,py-1.5);stroke(c,i%2?'#000':'#fff',.6,.18)}c.restore();
}

function nose(c,H,m){const S=H.skin,cx=100;
 c.save();c.globalCompositeOperation='multiply';
 c.beginPath();c.moveTo(cx+2,94);c.bezierCurveTo(cx+5,104,cx+8,114,cx+8,120);c.lineTo(cx+2,121);c.closePath();c.fillStyle=rgba(S[2],.45);c.fill();
 c.restore();
 c.beginPath();c.moveTo(cx-1,92);c.lineTo(cx-1,116);stroke(c,'#ffffff',2.4,.14);
 soft(c,cx-1,118,4.5,'#ffffff',.3,'screen');
 c.beginPath();c.moveTo(cx-8,118);c.bezierCurveTo(cx-10,121,cx-8,125,cx-4,124);stroke(c,S[2],1.6,.8);
 c.beginPath();c.moveTo(cx+8,118);c.bezierCurveTo(cx+10,121,cx+8,125,cx+4,124);stroke(c,S[2],1.6,.8);
 for(const s of[-1,1]){c.fillStyle='rgba(40,12,6,.6)';ell(c,cx+s*4,123.5,2.3,1.2,s*.3);c.fill()}
 soft(c,cx+1,128,9,S[2],.35,'multiply');
 if(H.folds){for(const s of[-1,1]){c.beginPath();c.moveTo(cx+s*9,121);c.quadraticCurveTo(cx+s*15,130,cx+s*13,139);stroke(c,S[2],1.4,.5*H.folds)}}
}

function mouth(c,H,m,t,pant){const cx=100,y=134,L=H.lip;
 if(m===2){ // уверенная ухмылка
  const sk=H.smirk??1;
  c.beginPath();c.moveTo(cx-11,y+.5);c.bezierCurveTo(cx-4,y-2.5,cx+2,y-2.5,cx+11,y-1.5*sk-1);
  c.bezierCurveTo(cx+5,y+1,cx-5,y+1.5,cx-11,y+.5);c.fillStyle=L[1];c.fill();
  c.beginPath();c.moveTo(cx-10,y+.8);c.bezierCurveTo(cx-5,y+6,cx+5,y+6,cx+10,y-.5*sk);c.bezierCurveTo(cx+4,y+1.4,cx-4,y+1.6,cx-10,y+.8);
  c.fillStyle=LG(c,cx,y,cx,y+6,[[0,L[0]],[1,L[1]]]);c.fill();
  soft(c,cx-2,y+3,4,'#ffffff',.25,'screen');
  c.beginPath();c.moveTo(cx-11,y+.6);c.bezierCurveTo(cx-4,y+1.6,cx+4,y+1.2,cx+11,y-1.5*sk-1);stroke(c,INK,1.8,.95);
  c.beginPath();c.moveTo(cx+11,y-1.5*sk-1);c.lineTo(cx+13,y-2.5*sk-1.5);stroke(c,INK,1.2,.6);
  soft(c,cx,y+9,7,H.skin[2],.35,'multiply');
 }else if(m===1){ // стиснутые зубы
  c.beginPath();c.moveTo(cx-12,y);c.bezierCurveTo(cx-6,y-3,cx+6,y-3,cx+12,y);c.bezierCurveTo(cx+7,y+5,cx-7,y+5,cx-12,y);c.closePath();
  c.fillStyle='#2a0806';c.fill();
  c.save();c.clip();c.fillStyle=LG(c,cx,y-3,cx,y+5,[[0,'#f2e8d6'],[.5,'#d8ccb4'],[1,'#8a7a64']]);c.fillRect(cx-12,y-2.6,24,6.6);
  for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(cx+i*3.2,y-3);c.lineTo(cx+i*3.2,y+5);stroke(c,'#5a4a3a',.7,.7)}
  c.beginPath();c.moveTo(cx-12,y+.6);c.lineTo(cx+12,y+.6);stroke(c,'#4a3a2a',.8,.8);c.restore();
  c.beginPath();c.moveTo(cx-12,y);c.bezierCurveTo(cx-6,y-3,cx+6,y-3,cx+12,y);stroke(c,L[1],2.2,.9);
  c.beginPath();c.moveTo(cx-12,y);c.bezierCurveTo(cx-7,y+5,cx+7,y+5,cx+12,y);stroke(c,L[1],2.2,.9);
  for(const s of[-1,1]){c.beginPath();c.moveTo(cx+s*12,y);c.lineTo(cx+s*15,y+2);stroke(c,INK,1.3,.7)}
 }else{ // тяжёлое дыхание
  const o=3+pant*2.5;
  c.beginPath();c.moveTo(cx-10,y-1);c.bezierCurveTo(cx-4,y-3.5,cx+4,y-3.5,cx+10,y);c.bezierCurveTo(cx+7,y+o+3,cx-6,y+o+3,cx-10,y-1);c.closePath();
  c.fillStyle=RG(c,cx,y+2,12,[[0,'#100202'],[1,'#3a0a08']]);c.fill();
  c.save();c.clip();c.fillStyle='#d8ccb4';c.fillRect(cx-8,y-3,16,2.6);c.fillStyle='#7a1a18';ell(c,cx+1,y+o+2,6,2.6);c.fill();c.restore();
  c.beginPath();c.moveTo(cx-10,y-1);c.bezierCurveTo(cx-4,y-3.5,cx+4,y-3.5,cx+10,y);stroke(c,L[1],2,.9);
  c.beginPath();c.moveTo(cx+10,y);c.bezierCurveTo(cx+7,y+o+3,cx-6,y+o+3,cx-10,y-1);stroke(c,L[1],2,.9);
 }
}

/* ---------- раны ---------- */
function wounds(c,H,m,t,seed){
 const cx=100;if(m===2)return;
 // царапина на щеке
 c.beginPath();c.moveTo(cx+H.hw*.35,108);c.lineTo(cx+H.hw*.7,118);stroke(c,'#6a0a08',1.6,.9);
 c.beginPath();c.moveTo(cx+H.hw*.35,109);c.lineTo(cx+H.hw*.7,119);stroke(c,'#ff6a5a',.5,.6);
 // грязь
 soft(c,cx-H.hw*.6,124,8,'#3a2a20',.25,'multiply');
 if(m===1){ // пот
  for(let i=0;i<2;i++){const p=(t*.35+i*.5)%1,x=cx+(i?-1:1)*H.hw*.78,y=72+p*30;
   c.fillStyle=RG(c,x-.6,y-.6,3,[[0,'rgba(255,255,255,.95)'],[.4,'rgba(170,210,240,.6)'],[1,'rgba(120,170,220,0)']]);ell(c,x,y,1.8,2.6);c.fill()}
  return}
 // синяк
 soft(c,cx-H.hw*.42,100,12,'#5a1a4a',.55,'multiply');
 // рассечение на лбу + кровь
 const wx=cx+H.hw*.62,wy=(H.cutY||70)+4;
 c.beginPath();c.moveTo(wx-7,wy-2);c.lineTo(wx+6,wy+2);stroke(c,'#3a0202',2.4,1);
 const drip=(t*.22+seed)%1;
 c.save();c.beginPath();
 c.moveTo(wx-4,wy);c.bezierCurveTo(wx-1,wy+10,wx+3,wy+20,wx+2,wy+30+drip*12);
 c.quadraticCurveTo(wx+3.5,wy+35+drip*12,wx+4.5,wy+29+drip*10);c.bezierCurveTo(wx+5,wy+18,wx+3,wy+8,wx+3,wy+1);c.closePath();
 c.fillStyle=LG(c,wx,wy,wx,wy+50,[[0,'#7a0606'],[.5,'#a50d0d'],[1,'#5a0202']]);c.fill();
 c.beginPath();c.moveTo(wx+1,wy+6);c.bezierCurveTo(wx+2,wy+14,wx+3.5,wy+20,wx+3,wy+28);stroke(c,'#ff8a7a',.8,.55);c.restore();
 // капля падает
 const fp=(t*.6+seed)%1;c.fillStyle='#9a0a0a';ell(c,wx+3,wy+40+fp*40,1.4,2.2);c.globalAlpha=1-fp;c.fill();c.globalAlpha=1;
 // кровь из носа/рта
 c.beginPath();c.moveTo(97,125);c.bezierCurveTo(95,130,98,132,96,134);c.lineTo(99,134);c.bezierCurveTo(100,130,100,127,100,125);c.fillStyle='#8a0808';c.fill();
 c.beginPath();c.moveTo(108,137);c.quadraticCurveTo(109,143,107,148);stroke(c,'#8a0808',2,.9);
 // брызги
 for(let i=0;i<9;i++){const x=cx-30+hv(i+seed*9)*60,y=60+hv(i*3+1)*80;c.fillStyle='rgba(120,6,6,.8)';ell(c,x,y,.6+hv(i+4)*1.5,.6+hv(i+4)*1.3);c.fill()}
}

/* ---------- фоны ---------- */
function bgBase(c,top,bot,t){c.fillStyle=RG(c,100,80,150,[[0,top],[1,bot]]);c.fillRect(0,0,200,200)}
function embers(c,t,col,n,spd,seed){c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<n;i++){const p=(t*spd*(.6+hv(i+seed)*.8)+hv(i*7+seed))%1,x=hv(i*3+seed)*200+Math.sin(t*1.3+i)*10,y=205-p*220,r=.8+hv(i*11)*1.8;
  c.fillStyle=RG(c,x,y,r*4,[[0,rgba(col,(1-p)*.9)],[.3,rgba(col,(1-p)*.35)],[1,rgba(col,0)]]);c.fillRect(x-r*4,y-r*4,r*8,r*8)}c.restore()}

/* ---------- ТЕЛО/ДЕТАЛИ ГЕРОЕВ ---------- */
function metalG(c,x0,y0,x1,y1,b){return LG(c,x0,y0,x1,y1,[[0,mix(b,'#000000',.6)],[.35,b],[.5,mix(b,'#ffffff',.55)],[.62,b],[1,mix(b,'#000000',.55)]])}
function fold(c,x0,y0,x1,y1,cp,a){c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo(cp[0],cp[1],x1,y1);stroke(c,'#000',2.4,a||.3)}
function rivet(c,x,y){c.fillStyle=RG(c,x-.5,y-.5,2.2,[[0,'#fff'],[.4,'#aab'],[1,'#223']]);ell(c,x,y,1.6,1.6);c.fill()}

const HEROES={};

/* ===== ОГОНЬ — Пиромант ===== */
HEROES.fire={n:'Пиромант',c:'#ff6a2b',hw:31,jaw:.78,skin:['#f6c9a0','#d8926a','#6e2a1c'],iris:['#ffd060','#ff6a10'],eyeGlow:1,lip:['#c06a5a','#7a3428'],
 rim:'#ff7a2a',brow:'#5a1408',blush:'#d84a2a',smirk:1.6,eyeTilt:-1,cutY:66,
 bg(c,t,m){bgBase(c,m?'#4a1a0e':'#3a0808','#0c0404',t);soft(c,150,170,90,'#ff5a10',.35+.08*Math.sin(t*3),'lighter');embers(c,t,'#ffa040',26,.22,1)},
 back(c,t,m){ // огненные пряди
  const tips=[[-34,58],[-30,38],[-20,20],[-8,8],[4,2],[14,12],[24,24],[32,40],[36,58]];
  for(let i=0;i<tips.length;i++){const[dx,dy]=tips[i],s=Math.sin(t*3+i)*2.5,bx=100+dx*.6,by=70;
   c.beginPath();c.moveTo(bx-9,by+8);c.quadraticCurveTo(100+dx*.9-4+s,by-10,100+dx+s,dy+8);c.quadraticCurveTo(100+dx*.9+6+s,by-8,bx+9,by+8);c.closePath();
   c.fillStyle=LG(c,bx,by+8,100+dx,dy+8,[[0,'#3a0a04'],[.45,'#a8200a'],[1,'#ff6a1a']]);c.fill();stroke(c,INK,1.6,.8)}
  flames(c,t,tips.map(([dx,dy],i)=>[100+dx+Math.sin(t*3+i)*2.5,dy+14]),1.7)},
 body(c,t,m,br){
  c.beginPath();c.moveTo(0,200);c.lineTo(4,170);c.quadraticCurveTo(14,150,52,142);c.lineTo(82,136);c.lineTo(100,170);c.lineTo(118,136);c.lineTo(148,142);c.quadraticCurveTo(186,150,196,170);c.lineTo(200,200);c.closePath();
  c.fillStyle=LG(c,0,140,200,200,[[0,'#3a0a08'],[.4,'#7a1810'],[.7,'#4a0c08'],[1,'#1a0404']]);c.fill();stroke(c,INK,2.4);
  fold(c,40,160,60,200,[44,182]);fold(c,160,160,140,200,[156,182]);
  // воротник
  for(const s of[-1,1]){c.beginPath();c.moveTo(100+s*18,134);c.lineTo(100+s*38,118);c.lineTo(100+s*44,148);c.lineTo(100+s*20,162);c.closePath();
   c.fillStyle=LG(c,100+s*18,120,100+s*44,160,[[0,'#5a1008'],[1,'#2a0604']]);c.fill();stroke(c,INK,2);
   c.beginPath();c.moveTo(100+s*38,118);c.lineTo(100+s*44,148);stroke(c,'#e0a040',2,.9)}
  // наплечник обожжённой стали
  c.beginPath();c.moveTo(126,146);c.quadraticCurveTo(160,128,190,150);c.lineTo(192,172);c.quadraticCurveTo(160,160,130,170);c.closePath();
  c.fillStyle=metalG(c,130,140,190,172,'#4a3a38');c.fill();stroke(c,INK,2.2);
  c.beginPath();c.moveTo(128,150);c.quadraticCurveTo(160,134,190,153);stroke(c,'#ff7a2a',1.6,.5+.3*Math.sin(t*4));
  rivet(c,140,158);rivet(c,160,152);rivet(c,180,158);
  // кулон
  c.beginPath();c.moveTo(80,138);c.quadraticCurveTo(100,170,120,138);stroke(c,'#c08a30',1.4,.9);
  c.beginPath();c.moveTo(100,166);c.lineTo(106,174);c.lineTo(100,184);c.lineTo(94,174);c.closePath();c.fillStyle=LG(c,94,166,106,184,[[0,'#ffd080'],[.5,'#ff5a10'],[1,'#6a1004']]);c.fill();stroke(c,INK,1.6);
  glow(c,100,175,16,'#ff7a20',.5+.2*Math.sin(t*5));
  // огненная сфера в руке (снизу слева)
  const ox=26,oy=182+Math.sin(t*2)*3;glow(c,ox,oy,40,'#ff6a10',.55);
  c.fillStyle=RG(c,ox,oy,12,[[0,'#fff6c0'],[.4,'#ffb030'],[1,'rgba(255,80,10,0)']]);ell(c,ox,oy,12,12);c.fill();
  flames(c,t,[[ox-4,oy-6],[ox+3,oy-9],[ox+8,oy-4]],.7)},
 front(c,t,m){ // чёлка-пламя
  c.beginPath();c.moveTo(68,92);c.bezierCurveTo(62,52,82,40,100,40);c.bezierCurveTo(118,40,138,52,132,92);c.bezierCurveTo(128,74,116,64,100,64);c.bezierCurveTo(84,64,72,74,68,92);c.closePath();
  c.fillStyle=LG(c,68,40,132,92,[[0,'#c0300c'],[.5,'#6a1006'],[1,'#2a0604']]);c.fill();stroke(c,INK,2);
  for(let k=0;k<7;k++){c.beginPath();c.moveTo(78+k*7,46);c.quadraticCurveTo(76+k*7.5,58,72+k*9,70);stroke(c,'#ff8a3a',.9,.35)}
  const fr=[[-24,60,-31,90],[-12,58,-19,84],[0,58,-7,80],[12,60,6,82],[22,62,20,88]];
  for(let i=0;i<fr.length;i++){const[x0,y0,x1,y1]=fr[i],s=Math.sin(t*2.5+i)*1.5;
   c.beginPath();c.moveTo(100+x0-8,y0-8);c.quadraticCurveTo(100+x0+8,y0,100+x1+s,y1);c.quadraticCurveTo(100+x0+4,y0-2,100+x0+10,y0-10);c.closePath();
   c.fillStyle=LG(c,100+x0,y0-8,100+x1,y1,[[0,'#7a1408'],[.6,'#e0400e'],[1,'#ffb040']]);c.fill();stroke(c,INK,1.4,.8)}
  // светящиеся трещины-шрамы на щеке
  const p=.55+.35*Math.sin(t*2.2);
  c.beginPath();c.moveTo(76,104);c.lineTo(82,110);c.lineTo(79,116);c.lineTo(85,122);c.moveTo(82,110);c.lineTo(88,108);
  stroke(c,'#3a0a04',2.6,.9);c.save();c.globalCompositeOperation='lighter';stroke(c,'#ffa030',1.2,p);c.restore();glow(c,82,112,10,'#ff7a20',p*.35)},
 light(c,t,m){soft(c,40,190,140,'#ff6a10',.28,'soft-light');soft(c,170,40,120,'#000000',.35,'multiply')}
};
function flames(c,t,pts,sc){c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<pts.length;i++){const[x,y]=pts[i];for(let k=0;k<3;k++){const ph=t*(6+k)+i*2.1+k,h=(10+k*4)*sc*(.8+.3*Math.sin(ph)),w=(4+k)*sc,sx=Math.sin(ph*1.3)*2*sc;
  c.beginPath();c.moveTo(x-w,y);c.quadraticCurveTo(x-w*.6+sx,y-h*.6,x+sx*1.5,y-h);c.quadraticCurveTo(x+w*.6+sx,y-h*.6,x+w,y);c.closePath();
  c.fillStyle=LG(c,x,y,x,y-h,[[0,k?'rgba(255,90,10,.55)':'rgba(255,230,140,.7)'],[1,'rgba(255,40,0,0)']]);c.fill()}}
 c.restore()}

/* ===== ВОДА — Мистик прилива ===== */
HEROES.water={n:'Мистик прилива',c:'#3aa7ff',hw:28,jaw:.66,chin:146,skin:['#f8e2d8','#dcb4a8','#5a4a6e'],iris:['#9ff0ff','#1a7ad0'],eyeGlow:1,lip:['#d08a8a','#8a4a56'],
 rim:'#5ad0ff',brow:'#1a3a6a',blush:'#e0707a',smirk:.3,cutY:68,
 bg(c,t,m){bgBase(c,m?'#0e2a4a':'#2a0e1a','#020610',t);
  c.save();c.globalCompositeOperation='lighter';for(let i=0;i<5;i++){c.beginPath();for(let x=0;x<=200;x+=8){const y=30+i*36+Math.sin(x*.05+t*1.2+i)*6;x?c.lineTo(x,y):c.moveTo(x,y)}stroke(c,'#3aa7ff',3,.08)}c.restore();
  bubbles(c,t)},
 back(c,t,m){ // длинные волосы
  for(const s of[-1,1]){const w=Math.sin(t*1.4+s)*4;
   c.beginPath();c.moveTo(100+s*20,56);c.bezierCurveTo(100+s*46,62,100+s*40+w,120,100+s*52+w,200);c.lineTo(100+s*22,200);c.bezierCurveTo(100+s*30,150,100+s*26,110,100+s*22,90);c.closePath();
   c.fillStyle=LG(c,100+s*20,60,100+s*50,200,[[0,'#0a2a6a'],[.5,'#1a5ac0'],[1,'#3aa7ff']]);c.fill();stroke(c,INK,2);
   for(let k=0;k<5;k++){c.beginPath();c.moveTo(100+s*(24+k*3),70+k*6);c.bezierCurveTo(100+s*(40+k*2),110,100+s*(34+k*3)+w,150,100+s*(44+k*2)+w,196);stroke(c,k%2?'#8fe0ff':'#5ab0ff',1,.35)}}},
 body(c,t,m,br){
  c.beginPath();c.moveTo(4,200);c.quadraticCurveTo(16,154,60,146);c.lineTo(86,140);c.lineTo(100,166);c.lineTo(114,140);c.lineTo(140,146);c.quadraticCurveTo(184,154,196,200);c.closePath();
  c.fillStyle=LG(c,0,140,200,200,[[0,'#f0f8ff'],[.5,'#b8d8f0'],[1,'#5a7aa0']]);c.fill();stroke(c,INK,2.2);
  fold(c,50,160,64,200,[52,182],.18);fold(c,150,160,136,200,[148,182],.18);
  for(const s of[-1,1]){c.beginPath();c.moveTo(100+s*14,140);c.quadraticCurveTo(100+s*30,170,100+s*24,200);stroke(c,'#c0c8d8',3,.9);c.beginPath();c.moveTo(100+s*14,140);c.quadraticCurveTo(100+s*30,170,100+s*24,200);stroke(c,'#ffffff',1,.7)}
  // водяная лента
  c.save();c.globalCompositeOperation='lighter';
  for(let k=0;k<2;k++){c.beginPath();for(let a=0;a<=TAU+.01;a+=.12){const x=100+Math.cos(a+t*.8)*84,y=184+Math.sin(a+t*.8)*12+Math.sin(a*3+t*2+k)*4;a?c.lineTo(x,y):c.moveTo(x,y)}stroke(c,k?'#9ff0ff':'#3aa7ff',k?1.4:4,k?.6:.3)}
  c.restore();
  // камень-капля на груди
  c.beginPath();c.moveTo(100,160);c.quadraticCurveTo(108,172,100,180);c.quadraticCurveTo(92,172,100,160);c.fillStyle=RG(c,98,170,10,[[0,'#ffffff'],[.3,'#9ff0ff'],[1,'#1a6ac0']]);c.fill();stroke(c,INK,1.6);
  glow(c,100,172,18,'#5ad0ff',.4+.15*Math.sin(t*2))},
 front(c,t,m){
  // пробор и передние пряди
  c.beginPath();c.moveTo(100,48);c.bezierCurveTo(70,46,66,66,70,100);c.bezierCurveTo(74,80,84,62,100,58);c.bezierCurveTo(116,62,126,80,130,100);c.bezierCurveTo(134,66,130,46,100,48);c.closePath();
  c.fillStyle=LG(c,70,46,130,100,[[0,'#2a6ad0'],[.5,'#0e3a8a'],[1,'#1a5ac0']]);c.fill();stroke(c,INK,2);
  for(let k=0;k<6;k++){c.beginPath();c.moveTo(100-k*2,52);c.bezierCurveTo(84-k,60,76-k,74,74-k*.5,96);stroke(c,'#8fe0ff',.9,.4);c.beginPath();c.moveTo(100+k*2,52);c.bezierCurveTo(116+k,60,124+k,74,126+k*.5,96);stroke(c,'#8fe0ff',.9,.4)}
  // диадема
  c.beginPath();c.moveTo(72,72);c.quadraticCurveTo(100,60,128,72);stroke(c,'#2a3040',4.2,1);c.beginPath();c.moveTo(72,72);c.quadraticCurveTo(100,60,128,72);stroke(c,'#e0ecff',2,1);
  c.beginPath();c.moveTo(100,58);c.lineTo(106,66);c.lineTo(100,76);c.lineTo(94,66);c.closePath();c.fillStyle=RG(c,98,64,9,[[0,'#ffffff'],[.3,'#9ff0ff'],[1,'#1a5ab0']]);c.fill();stroke(c,INK,1.4);
  glow(c,100,66,16,'#7fe0ff',.45+.2*Math.sin(t*2.4));
  // слеза-метка
  c.beginPath();c.moveTo(80,108);c.quadraticCurveTo(78,114,80,118);stroke(c,'#5ad0ff',1.4,.8)},
 light(c,t,m){soft(c,100,40,140,'#5ad0ff',.25,'soft-light');soft(c,180,170,110,'#000000',.3,'multiply')}
};
function bubbles(c,t){c.save();for(let i=0;i<16;i++){const p=(t*.12*(.6+hv(i)*.8)+hv(i*5))%1,x=hv(i*3)*200+Math.sin(t+i)*6,y=210-p*230,r=1+hv(i*7)*3;
 c.strokeStyle=`rgba(160,230,255,${.6*(1-p)})`;c.lineWidth=.8;ell(c,x,y,r,r);c.stroke();c.fillStyle=`rgba(255,255,255,${.7*(1-p)})`;ell(c,x-r*.35,y-r*.35,r*.25,r*.25);c.fill()}c.restore()}

/* ===== ЗЕМЛЯ — Каменный страж ===== */
HEROES.earth={n:'Каменный страж',c:'#c9974f',hw:35,jaw:.92,top:52,chin:150,skin:['#e8b88e','#b47a52','#4a2614'],iris:['#c8a070','#5a3a1a'],lip:['#a86a56','#6a3a2a'],
 rim:'#ffb860',brow:'#3a2010',blush:'#c0503a',stub:.25,folds:1,smirk:0,cutY:74,
 bg(c,t,m){bgBase(c,m?'#3a2a16':'#3a1208','#080604',t);
  c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.moveTo(0,140);c.lineTo(30,96);c.lineTo(52,120);c.lineTo(80,80);c.lineTo(110,118);c.lineTo(150,70);c.lineTo(180,110);c.lineTo(200,90);c.lineTo(200,200);c.lineTo(0,200);c.fill();
  embers(c,t,'#e0b070',18,.08,3)},
 back(c,t,m){},
 body(c,t,m,br){
  c.beginPath();c.moveTo(0,200);c.lineTo(0,168);c.quadraticCurveTo(30,146,70,144);c.lineTo(130,144);c.quadraticCurveTo(170,146,200,168);c.lineTo(200,200);c.closePath();
  c.fillStyle=LG(c,0,140,0,200,[[0,'#6a5a46'],[1,'#2a2218']]);c.fill();stroke(c,INK,2.4);
  // каменные наплечники
  for(const s of[-1,1]){const x=100+s*68;
   c.beginPath();c.moveTo(x-s*36,150);c.quadraticCurveTo(x-s*10,118,x+s*26,128);c.lineTo(x+s*34,170);c.quadraticCurveTo(x,184,x-s*30,176);c.closePath();
   c.fillStyle=LG(c,x-30,118,x+30,184,[[0,'#a89c88'],[.5,'#7a7060'],[1,'#3a342a']]);c.fill();stroke(c,INK,2.4);
   c.beginPath();c.moveTo(x-s*20,140);c.lineTo(x-s*8,150);c.lineTo(x-s*14,160);stroke(c,'#2a241a',1.6,.8);
   c.beginPath();c.moveTo(x+s*6,128);c.lineTo(x+s*14,108);c.lineTo(x+s*20,130);c.closePath();c.fillStyle=LG(c,x,108,x+s*20,130,[[0,'#c8bca8'],[1,'#5a5040']]);c.fill();stroke(c,INK,2);
   const p=.5+.4*Math.sin(t*1.8+s);c.beginPath();c.moveTo(x+s*2,156);c.lineTo(x+s*10,150);c.lineTo(x+s*8,162);c.lineTo(x+s*16,158);
   stroke(c,'#3a2008',2.6,.9);c.save();c.globalCompositeOperation='lighter';stroke(c,'#ffc060',1.3,p);c.restore();glow(c,x+s*9,156,12,'#ffa030',p*.4)}
  // ремни/кольчуга
  c.fillStyle='rgba(0,0,0,.25)';for(let y=152;y<200;y+=5)for(let x=72;x<130;x+=5){ell(c,x+(y%10?2.5:0),y,2,1.6);c.fill()}},
 front(c,t,m){
  // борода
  const sw=Math.sin(t*1.2)*1;
  c.beginPath();c.moveTo(66,112);c.bezierCurveTo(64,150,80,186,100+sw,196);c.bezierCurveTo(120,186,136,150,134,112);
  c.bezierCurveTo(128,132,118,140,112,138);c.quadraticCurveTo(100,128,88,138);c.bezierCurveTo(82,140,72,132,66,112);c.closePath();
  c.fillStyle=LG(c,66,112,134,196,[[0,'#6a3a1a'],[.5,'#4a2610'],[1,'#2a1408']]);c.fill();stroke(c,INK,2.2);
  for(let k=0;k<16;k++){const x=70+k*4,l=40+Math.sin(k*1.7)*14;c.beginPath();c.moveTo(x,120+Math.abs(k-7.5)*1.2);c.quadraticCurveTo(x+(k-7.5)*.6,150,100+(k-7.5)*1.8+sw,150+l*.8);stroke(c,k%3?'#8a5a2a':'#2a1408',.9,.6)}
  // косички с кольцами
  for(const s of[-1,1]){const x=100+s*11;for(let k=0;k<4;k++){c.fillStyle=LG(c,x-3,170+k*6,x+3,170+k*6,[[0,'#3a1e0a'],[.5,'#7a4a20'],[1,'#3a1e0a']]);ell(c,x+sw,170+k*6,3.4,3.6);c.fill();stroke(c,INK,.8,.8)}
   c.fillStyle=metalG(c,x-4,180,x+4,186,'#d0a040');c.fillRect(x-4+sw,184,8,4);c.strokeStyle=INK;c.lineWidth=.8;c.strokeRect(x-4+sw,184,8,4)}
  // усы
  for(const s of[-1,1]){c.beginPath();c.moveTo(100,126);c.bezierCurveTo(100+s*10,122,100+s*18,128,100+s*20,140);c.bezierCurveTo(100+s*14,134,100+s*8,132,100,131);c.closePath();c.fillStyle='#5a3216';c.fill();stroke(c,INK,1.4)}
  // шлем
  c.beginPath();c.moveTo(62,96);c.bezierCurveTo(60,50,80,38,100,38);c.bezierCurveTo(120,38,140,50,138,96);c.lineTo(126,90);c.quadraticCurveTo(100,78,74,90);c.closePath();
  c.fillStyle=LG(c,62,38,138,96,[[0,'#b8ac98'],[.5,'#8a806e'],[1,'#3e382e']]);c.fill();stroke(c,INK,2.6);
  c.beginPath();c.moveTo(66,86);c.quadraticCurveTo(100,72,134,86);stroke(c,'#2a241a',3,.9);
  // наносник
  c.beginPath();c.moveTo(96,80);c.lineTo(104,80);c.lineTo(103,108);c.lineTo(100,112);c.lineTo(97,108);c.closePath();c.fillStyle=metalG(c,96,80,104,80,'#8a806e');c.fill();stroke(c,INK,1.8);
  // шип
  c.beginPath();c.moveTo(92,42);c.lineTo(100,16);c.lineTo(108,42);c.closePath();c.fillStyle=LG(c,92,16,108,42,[[0,'#d8ccb8'],[1,'#5a5040']]);c.fill();stroke(c,INK,2);
  // трещины и руны
  c.beginPath();c.moveTo(80,52);c.lineTo(86,62);c.lineTo(82,70);stroke(c,'#2a241a',1.4,.8);
  const p=.5+.45*Math.sin(t*2.1);c.beginPath();c.moveTo(110,56);c.lineTo(118,52);c.lineTo(116,62);c.lineTo(124,60);
  stroke(c,'#2a1404',2.4,.9);c.save();c.globalCompositeOperation='lighter';stroke(c,'#ffc060',1.2,p);c.restore();glow(c,117,58,12,'#ffa030',p*.45);
  soft(c,86,56,16,'#ffffff',.25,'screen')},
 light(c,t,m){soft(c,30,30,150,'#ffb060',.22,'soft-light');soft(c,180,180,110,'#000000',.35,'multiply')}
};

/* ===== ВОЗДУХ — Налётчик ветра ===== */
HEROES.air={n:'Налётчик ветра',c:'#8febd0',hw:28,jaw:.7,skin:['#f2d6be','#c89878','#3e3038'],iris:['#b0fff0','#1a9a80'],eyeGlow:1,lip:['#b07a6a','#6a3a32'],
 rim:'#8febd0',brow:'#d0e8e2',blush:'#c0605a',eyeTilt:-1.5,cutY:72,mask:1,
 bg(c,t,m){bgBase(c,m?'#0e2e2a':'#2a0e10','#020806',t);
  c.save();c.globalCompositeOperation='lighter';for(let i=0;i<12;i++){const p=(t*.5*(.7+hv(i)*.6)+hv(i*3))%1,y=hv(i*5)*200,x=-60+p*320,l=30+hv(i)*50;
   c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+l*.5,y-4,x+l,y+Math.sin(t+i)*3);stroke(c,'#b0fff0',1.2,.35*(1-Math.abs(p-.5)*2))}c.restore()},
 back(c,t,m){ // капюшон сзади + хвосты шарфа
  c.beginPath();c.moveTo(56,150);c.bezierCurveTo(50,60,70,30,100,30);c.bezierCurveTo(130,30,150,60,144,150);c.closePath();
  c.fillStyle=LG(c,56,30,144,150,[[0,'#2e5a54'],[1,'#0e221e']]);c.fill();stroke(c,INK,2.4);
  for(let k=0;k<2;k++){const s=t*3.2+k*1.3;c.beginPath();c.moveTo(130,150+k*8);
   c.bezierCurveTo(156,140+Math.sin(s)*8,176,150+Math.sin(s+1)*10,200,136+Math.sin(s+2)*12);c.lineTo(200,152+Math.sin(s+2)*12);
   c.bezierCurveTo(178,166+Math.sin(s+1)*10,156,160+Math.sin(s)*8,130,166+k*8);c.closePath();
   c.fillStyle=LG(c,130,150,200,150,[[0,k?'#2a9a80':'#46d0aa'],[1,k?'#1a6a58':'#2fa88a']]);c.fill();stroke(c,INK,2)}},
 body(c,t,m,br){
  c.beginPath();c.moveTo(6,200);c.quadraticCurveTo(14,158,56,150);c.lineTo(144,150);c.quadraticCurveTo(186,158,194,200);c.closePath();
  c.fillStyle=LG(c,0,150,200,200,[[0,'#3a5a50'],[.5,'#22403a'],[1,'#0e1e1a']]);c.fill();stroke(c,INK,2.2);
  // кожаные ремни, ножи
  c.beginPath();c.moveTo(40,160);c.lineTo(150,200);c.lineTo(162,200);c.lineTo(48,154);c.closePath();c.fillStyle=LG(c,40,160,160,200,[[0,'#5a3a22'],[1,'#2a1a10']]);c.fill();stroke(c,INK,1.6);
  for(let k=0;k<3;k++){const x=70+k*22,y=168+k*8;c.fillStyle=metalG(c,x,y-6,x+4,y+6,'#a8b8c0');c.beginPath();c.moveTo(x,y-10);c.lineTo(x+3,y-14);c.lineTo(x+6,y-10);c.lineTo(x+5,y+2);c.lineTo(x+1,y+2);c.closePath();c.fill();stroke(c,INK,1)}
  // шарф вокруг шеи
  c.beginPath();c.moveTo(62,140);c.quadraticCurveTo(100,128,138,140);c.lineTo(142,160);c.quadraticCurveTo(100,172,58,160);c.closePath();
  c.fillStyle=LG(c,60,130,140,170,[[0,'#5ae8c0'],[.5,'#2fa88a'],[1,'#1a6a58']]);c.fill();stroke(c,INK,2);
  for(let k=0;k<3;k++){c.beginPath();c.moveTo(64,146+k*5);c.quadraticCurveTo(100,138+k*6,136,146+k*5);stroke(c,'#000',1.2,.18)}},
 front(c,t,m){
  // маска-платок на нижней части лица
  const tear=m===0;
  c.beginPath();c.moveTo(70,112);c.quadraticCurveTo(100,104,130,112);c.lineTo(132,142);c.quadraticCurveTo(100,160,68,142);c.closePath();
  c.fillStyle=LG(c,70,104,130,156,[[0,'#3a8a78'],[.5,'#22584c'],[1,'#0e2a24']]);c.fill();stroke(c,INK,2);
  soft(c,96,116,12,'#9fffe0',.18,'screen');
  for(let k=0;k<5;k++){c.beginPath();c.moveTo(70+k*3,140-k*7);c.quadraticCurveTo(98+k*4,126-k*4,130,112+k*5);stroke(c,'#000',1.6,.28);c.beginPath();c.moveTo(70+k*3,141-k*7);c.quadraticCurveTo(98+k*4,127-k*4,130,113+k*5);stroke(c,'#8fe8d0',.6,.25)}
  c.beginPath();c.moveTo(124,112);c.lineTo(134,108);c.lineTo(136,126);c.lineTo(128,130);c.closePath();c.fillStyle='#1a463c';c.fill();stroke(c,INK,1.6)
  // дыхание тканью
  const b=Math.sin(t*(m===0?4:m===1?3:1.6));soft(c,100,128+b,8+b*2,'#000000',.18,'multiply');
  if(tear){c.beginPath();c.moveTo(110,118);c.lineTo(116,128);c.lineTo(112,134);c.lineTo(120,142);stroke(c,'#0a2a22',2,.9);c.beginPath();c.moveTo(114,130);c.quadraticCurveTo(116,140,113,150);stroke(c,'#8a0808',2.2,.9)}
  // капюшон спереди, тень на лбу
  c.beginPath();c.moveTo(62,120);c.bezierCurveTo(56,70,72,44,100,44);c.bezierCurveTo(128,44,144,70,138,120);c.bezierCurveTo(136,92,126,70,100,68);c.bezierCurveTo(74,70,64,92,62,120);c.closePath();
  c.fillStyle=LG(c,60,44,140,120,[[0,'#3e766c'],[.5,'#244a44'],[1,'#10241f']]);c.fill();stroke(c,INK,2.4);
  c.save();c.beginPath();c.rect(60,66,80,30);c.clip();soft(c,100,70,34,'#000000',.4,'multiply');c.restore();
  // белые пряди из-под капюшона
  for(const[x0,dir]of[[68,-1],[73,-1],[127,1],[132,1]]){const s=Math.sin(t*3+x0)*2.5,len=dir?26:8;const ex=x0+dir*8+s,ey=74+len;
   c.beginPath();c.moveTo(x0,70);c.quadraticCurveTo(x0+dir*2+s,74+len*.5,ex,ey);stroke(c,'#cfe0dc',1.8,.9)}
  // очки на капюшоне
  c.beginPath();c.moveTo(66,58);c.quadraticCurveTo(100,46,134,58);stroke(c,'#2a1a10',4,1);
  for(const s of[-1,1]){const x=100+s*14,y=53;c.fillStyle=metalG(c,x-9,y-9,x+9,y+9,'#8a7a5a');ell(c,x,y,9,8);c.fill();stroke(c,INK,1.8);
   c.fillStyle=RG(c,x-2,y-2,7,[[0,'#d0fff4'],[.5,'#46d0aa'],[1,'#0a3a30']]);ell(c,x,y,6.4,5.6);c.fill();
   c.fillStyle='rgba(255,255,255,.7)';ell(c,x-2.5,y-2,2,1.3,-.5);c.fill()}},
 light(c,t,m){soft(c,170,60,140,'#8febd0',.22,'soft-light');soft(c,40,180,110,'#000000',.3,'multiply')}
};

/* ===== МЕТАЛЛ — Солдат ===== */
HEROES.metal={n:'Солдат',c:'#b4c0d4',hw:33,jaw:.9,chin:150,skin:['#ecbc96','#b9805e','#4a261c'],iris:['#9ab8d0','#2a4a6a'],lip:['#a8705e','#6a3a2c'],
 rim:'#c8d8f0',brow:'#3a281a',blush:'#c0503a',stub:.55,folds:.8,smirk:1.2,eyeTilt:.5,cutY:74,
 bg(c,t,m){bgBase(c,m?'#2a3024':'#300c08','#060806',t);
  c.save();for(let i=0;i<6;i++){const x=(hv(i)*260+t*6*(1+hv(i)))%260-30,y=40+hv(i*3)*120;c.fillStyle='rgba(120,120,110,.12)';ell(c,x,y,40+hv(i)*30,16+hv(i*2)*10);c.fill()}c.restore();
  embers(c,t,'#ffc060',10,.3,7)},
 back(c,t,m){},
 body(c,t,m,br){
  c.beginPath();c.moveTo(0,200);c.lineTo(2,168);c.quadraticCurveTo(20,148,62,144);c.lineTo(138,144);c.quadraticCurveTo(180,148,198,168);c.lineTo(200,200);c.closePath();
  c.fillStyle=LG(c,0,144,200,200,[[0,'#5a6a46'],[.5,'#46553a'],[1,'#222a1c']]);c.fill();stroke(c,INK,2.4);
  // воротник куртки
  for(const s of[-1,1]){c.beginPath();c.moveTo(100+s*22,138);c.lineTo(100+s*40,142);c.lineTo(100+s*30,166);c.lineTo(100+s*14,156);c.closePath();c.fillStyle='#55663f';c.fill();stroke(c,INK,1.8)}
  // разгрузка
  for(const s of[-1,1]){c.beginPath();c.moveTo(100+s*36,146);c.lineTo(100+s*50,146);c.lineTo(100+s*44,200);c.lineTo(100+s*28,200);c.closePath();c.fillStyle=LG(c,0,146,0,200,[[0,'#3a4630'],[1,'#1e2618']]);c.fill();stroke(c,INK,1.8);
   for(let k=0;k<2;k++){const y=166+k*18,x=100+s*40;c.beginPath();c.rect(x-9,y,18,14);c.fillStyle=LG(c,x,y,x,y+14,[[0,'#4e5c3c'],[1,'#2a3420']]);c.fill();stroke(c,INK,1.4);c.fillStyle='#1a2014';c.fillRect(x-9,y,18,4);rivet(c,x,y+6)}}
  // жетоны
  c.beginPath();c.moveTo(84,140);c.quadraticCurveTo(100,170,116,140);stroke(c,'#c0c4c8',1,.9);
  for(let k=0;k<2;k++){const x=96+k*7,y=170+k*2,a=Math.sin(t*1.5+k)*.08;c.save();c.translate(x,y);c.rotate(a);c.beginPath();c.roundRect(-3.5,-5,7,10,2);c.fillStyle=metalG(c,-4,-5,4,5,'#b8c0c8');c.fill();stroke(c,INK,1);c.restore()}
  // наплечные погоны
  for(const s of[-1,1]){c.beginPath();c.moveTo(100+s*58,148);c.lineTo(100+s*88,156);c.lineTo(100+s*86,164);c.lineTo(100+s*58,158);c.closePath();c.fillStyle='#3a4630';c.fill();stroke(c,INK,1.6);rivet(c,100+s*62,153)}},
 front(c,t,m){
  // шрам через бровь
  c.beginPath();c.moveTo(118,80);c.lineTo(124,96);c.moveTo(125,102);c.lineTo(128,116);stroke(c,'#7a3028',2.6,.9);
  c.beginPath();c.moveTo(118,80);c.lineTo(124,96);c.moveTo(125,102);c.lineTo(128,116);stroke(c,'#f0b8a0',.8,.6);
  for(const y of[84,90,106,111]){c.beginPath();c.moveTo(119+(y-80)*.37,y);c.lineTo(125+(y-80)*.37,y-1);stroke(c,'#7a3028',.8,.6)}
  // каска
  c.beginPath();c.moveTo(58,98);c.bezierCurveTo(54,48,78,30,100,30);c.bezierCurveTo(122,30,146,48,142,98);c.bezierCurveTo(130,86,118,82,100,82);c.bezierCurveTo(82,82,70,86,58,98);c.closePath();
  c.fillStyle=LG(c,58,30,142,98,[[0,'#7a8a5a'],[.45,'#55663f'],[1,'#222a18']]);c.fill();stroke(c,INK,2.6);
  c.beginPath();c.moveTo(56,96);c.bezierCurveTo(70,84,86,80,100,80);c.bezierCurveTo(114,80,130,84,144,96);stroke(c,'#1e2614',4,1);
  // сетка
  c.save();c.beginPath();c.moveTo(58,98);c.bezierCurveTo(54,48,78,30,100,30);c.bezierCurveTo(122,30,146,48,142,98);c.bezierCurveTo(130,86,118,82,100,82);c.bezierCurveTo(82,82,70,86,58,98);c.clip();
  for(let i=-6;i<12;i++){c.beginPath();c.moveTo(40+i*12,20);c.lineTo(80+i*12,100);stroke(c,'#1a2010',.9,.55);c.beginPath();c.moveTo(80+i*12,20);c.lineTo(40+i*12,100);stroke(c,'#1a2010',.9,.55)}
  soft(c,84,46,26,'#ffffff',.22,'screen');c.restore();
  // ремешок с очками
  c.beginPath();c.moveTo(60,72);c.quadraticCurveTo(100,58,140,72);stroke(c,'#2a2018',5,1);
  for(const s of[-1,1]){const x=100+s*15,y=63;c.fillStyle=metalG(c,x-9,y-8,x+9,y+8,'#6a6a60');ell(c,x,y,9.5,7.5);c.fill();stroke(c,INK,1.6);
   c.fillStyle=RG(c,x-2,y-2,7,[[0,'#f0e0b0'],[.5,'#8a6a30'],[1,'#2a1a08']]);ell(c,x,y,6.5,5);c.fill();c.fillStyle='rgba(255,255,255,.7)';ell(c,x-2.5,y-2,2,1,-.4);c.fill()}
  // подбородочный ремень
  for(const s of[-1,1]){c.beginPath();c.moveTo(100+s*36,96);c.quadraticCurveTo(100+s*34,130,100+s*20,146);stroke(c,'#2a2018',2.6,.95)}},
 extra(c,t,m){ // сигара: зажата в углу рта, выпадает при смерти, возвращается при лечении
  const S=this._cig||(this._cig={st:'held',ft:0,lt:t});
  const dt=Math.min(.1,Math.max(0,t-S.lt));S.lt=t;S.ft+=dt;
  if(m===0&&(S.st==='held'||S.st==='in')){S.st='fall';S.ft=0}
  if(S.st==='fall'&&S.ft>1.4)S.st='gone';
  if(m>0&&S.st==='gone'){S.st='in';S.ft=0}
  if(S.st==='in'&&S.ft>.9)S.st='held';
  const bx=108,by=133.5,lift0=m===2?-.24:-.06,bob=Math.sin(t*1.1)*.025;
  const drawCig=(x,y,a,al,lit)=>{c.save();c.globalAlpha=al;c.translate(x,y);c.rotate(a);
   // тень на подбородок
   c.save();c.globalAlpha=al*.35;c.fillStyle='#1a0a04';c.beginPath();c.roundRect(-2,2,30,4,2);c.fill();c.restore();
   c.beginPath();c.roundRect(-1,-3,30,6,3);c.fillStyle=LG(c,0,-3,0,3,[[0,'#a8683a'],[.45,'#6e3c1c'],[1,'#341a0a']]);c.fill();stroke(c,INK,1.3);
   for(let i=2;i<26;i+=4.5){c.beginPath();c.moveTo(i,-2.8);c.lineTo(i+1.8,2.8);stroke(c,'#2a1408',.5,.5)}
   c.beginPath();c.moveTo(-2,-1.6);c.lineTo(26,-1.6);stroke(c,'#e0a070',.7,.35);
   c.fillStyle=metalG(c,6,-3,10,3,'#d8a840');c.fillRect(6,-3,4,6);c.strokeStyle=INK;c.lineWidth=.6;c.strokeRect(6,-3,4,6);
   c.fillStyle=LG(c,26,-3,26,3,[[0,'#d8d2c8'],[1,'#8a847a']]);c.fillRect(26,-2.8,3,5.6);
   const e=lit*(.75+.25*Math.sin(t*7));
   c.fillStyle=RG(c,29,0,4,[[0,`rgba(255,240,180,${e})`],[.45,`rgba(255,110,20,${e})`],[1,`rgba(90,20,0,${.5+.3*lit})`]]);ell(c,29.5,0,2.4,2.9);c.fill();
   if(lit>.05)glow(c,30,0,13,'#ff7a20',.35*e);
   c.restore()};
  const lips=(al)=>{c.save();c.globalAlpha=al;const L=this.lip;
   // губы обхватывают сигару
   soft(c,bx+2,by,4,'#1a0604',.45,'multiply');
   // верхняя губа ложится на сигару
   c.beginPath();c.moveTo(bx-7,by-1.6);c.quadraticCurveTo(bx-1,by-6,bx+5,by-3.4);c.quadraticCurveTo(bx,by-2.6,bx-7,by-1.6);
   c.fillStyle=LG(c,bx,by-6,bx,by-2,[[0,L[0]],[1,L[1]]]);c.fill();
   c.beginPath();c.moveTo(bx-5,by-2.3);c.quadraticCurveTo(bx,by-2.9,bx+5,by-3.4);stroke(c,'#2a0e08',.9,.7);
   // нижняя губа подпирает снизу
   c.beginPath();c.moveTo(bx-7,by+1.6);c.quadraticCurveTo(bx,by+2.8,bx+5,by+3.2);c.quadraticCurveTo(bx,by+7.2,bx-7,by+1.6);
   c.fillStyle=LG(c,bx,by+2,bx,by+6,[[0,L[1]],[1,L[0]]]);c.fill();
   c.beginPath();c.moveTo(bx-5,by+2.2);c.quadraticCurveTo(bx,by+2.9,bx+5,by+3.2);stroke(c,'#2a0e08',.9,.7);
   soft(c,bx-1,by+4.6,2.6,'#ffffff',.35,'screen');c.restore()};
  let tipX=0,tipY=0,smoke=0;
  if(S.st==='held'||S.st==='in'){
   const p=S.st==='in'?Math.min(1,S.ft/.9):1,e=1-Math.pow(1-p,3);
   const a=lift0+bob+(1-e)*.6,x=bx+(1-e)*16,y=by+(1-e)*10;
   drawCig(x,y,a,Math.min(1,p*1.6),S.st==='in'?Math.max(0,(p-.5)*2):1);
   lips(e);smoke=S.st==='held'?1:Math.max(0,p-.6)*2.5;
   tipX=x+Math.cos(a)*30;tipY=y+Math.sin(a)*30;
   soft(c,tipX-6,tipY-2,26,'#ff8a30',.16*smoke,'screen');
  }else if(S.st==='fall'){
   const f=S.ft,x=bx+f*22,y=by+f*f*150+f*8,a=lift0+f*7;
   drawCig(x,y,a,Math.max(0,1-Math.max(0,f-1)*2.5),Math.max(0,1-f*.8));
   // искры пепла
   c.save();c.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const q=Math.min(1,f*1.5),sx=bx+28+(hv(i)-.5)*20*q+f*14,sy=by-4+hv(i+3)*30*q+f*f*60;c.fillStyle=`rgba(255,${140+hv(i)*80|0},40,${Math.max(0,1-f*1.2)})`;ell(c,sx,sy,.9,.9);c.fill()}c.restore();
   tipX=x;tipY=y;smoke=Math.max(0,1-f);
  }
  // дым
  if(smoke>0)for(let i=0;i<10;i++){const p=(t*.25+i/10)%1,x=tipX+Math.sin(p*5+i*.7+t)*8*p+p*14,y=tipY-p*90,r=2+p*12;
   c.fillStyle=RG(c,x,y,r,[[0,`rgba(200,200,195,${.3*(1-p)*smoke})`],[1,'rgba(200,200,195,0)']]);ell(c,x,y,r,r);c.fill()}},
 light(c,t,m){soft(c,30,40,150,'#c8d8f0',.18,'soft-light');soft(c,190,190,120,'#000000',.35,'multiply')}
};

/* ===== ДЕРЕВО — Друид ===== */
HEROES.wood={n:'Друид',c:'#62c15a',hw:30,jaw:.74,skin:['#d8c49a','#9a8a5e','#2a2a18'],iris:['#d0ff80','#3a9a20'],eyeGlow:1,lip:['#8a6a4a','#4a3a22'],
 rim:'#9aff6a',brow:'#3a5a22',blush:'#8a6a3a',bark:1,folds:1.2,smirk:.6,cutY:70,
 bg(c,t,m){bgBase(c,m?'#14301a':'#2a1008','#020602',t);
  c.fillStyle='rgba(0,0,0,.4)';for(let i=0;i<5;i++){const x=hv(i)*200;c.fillRect(x,0,8+hv(i*2)*10,200)}
  c.save();c.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const x=hv(i)*200+Math.sin(t*.7+i)*12,y=hv(i*3)*200+Math.cos(t*.5+i)*10,a=.5+.5*Math.sin(t*3+i*2);glow(c,x,y,6,'#d0ff60',.6*a)}c.restore()},
 back(c,t,m){ // рога-ветви с листьями
  const sw=Math.sin(t*1.1)*.03;
  for(const s of[-1,1]){c.save();c.translate(100+s*16,58);c.rotate(s*sw);
   const br=[[0,0,s*30,-36],[s*20,-22,s*48,-30],[s*26,-30,s*30,-56],[s*12,-14,s*6,-40]];
   for(const lw of[7,4.5]){for(const[a,b,x,y]of br){c.beginPath();c.moveTo(a,b);c.quadraticCurveTo((a+x)/2+s*6,(b+y)/2+4,x,y);stroke(c,lw>5?INK:'#7a5a34',lw*(a===0?1.2:.85),1)}}
   for(const[a,b,x,y]of br){c.beginPath();c.moveTo(a,b);c.quadraticCurveTo((a+x)/2+s*6,(b+y)/2+4,x,y);stroke(c,'#b08a5a',1,.6)}
   for(let k=0;k<6;k++){const[,,x,y]=br[k%4];leaf(c,x+(k>3?-s*8:0),y+(k>3?10:0),s*(.6+k*.3)+Math.sin(t*2+k)*.2,k%3?'#62c15a':'#9ad16a')}
   c.restore()}},
 body(c,t,m,br){
  c.beginPath();c.moveTo(0,200);c.lineTo(4,170);c.quadraticCurveTo(24,148,62,144);c.lineTo(138,144);c.quadraticCurveTo(176,148,196,170);c.lineTo(200,200);c.closePath();
  c.fillStyle=LG(c,0,144,200,200,[[0,'#4a3a22'],[1,'#1e180c']]);c.fill();stroke(c,INK,2.4);
  // плащ из листьев и мха
  for(const s of[-1,1])for(let k=0;k<7;k++){const x=100+s*(40+k*8),y=150+Math.abs(k-3)*3+(k%2)*6;leaf(c,x,y,s*(1.4+k*.15)+Math.sin(t*1.6+k)*.08,k%2?'#3e7a30':'#5aa040',1.4)}
  c.fillStyle=LG(c,0,140,0,170,[[0,'#3a6a2a'],[1,'#1e3a14']]);c.beginPath();c.moveTo(56,148);c.quadraticCurveTo(100,138,144,148);c.quadraticCurveTo(100,160,56,148);c.fill();stroke(c,INK,1.6);
  // светящийся семя-амулет
  const p=.6+.4*Math.sin(t*2);c.beginPath();c.moveTo(100,178);c.bezierCurveTo(108,178,110,190,100,194);c.bezierCurveTo(90,190,92,178,100,178);c.fillStyle=RG(c,100,186,10,[[0,'#f0ffc0'],[.4,'#9aff5a'],[1,'#2a6a10']]);c.fill();stroke(c,INK,1.4);glow(c,100,186,20,'#9aff5a',.4*p)},
 front(c,t,m){
  // мох/волосы
  c.beginPath();c.moveTo(66,100);c.bezierCurveTo(60,56,80,44,100,44);c.bezierCurveTo(120,44,140,56,134,100);c.bezierCurveTo(128,74,116,66,100,68);c.bezierCurveTo(84,66,72,74,66,100);c.closePath();
  c.fillStyle=LG(c,66,44,134,100,[[0,'#5a8a3a'],[.5,'#3a6224'],[1,'#1a2e10']]);c.fill();stroke(c,INK,2.2);
  c.fillStyle='rgba(160,220,100,.35)';for(let i=0;i<40;i++){const x=70+hv(i)*60,y=48+hv(i*2)*24;if(y>48+ (Math.abs(x-100)/30)*30)continue;ell(c,x,y,1.4,1.1);c.fill()}
  // борода из лиан и мха
  const sw=Math.sin(t*1.3);
  c.beginPath();c.moveTo(74,124);c.bezierCurveTo(74,156,88,180,100,184);c.bezierCurveTo(112,180,126,156,126,124);c.quadraticCurveTo(114,140,100,138);c.quadraticCurveTo(86,140,74,124);c.closePath();
  c.fillStyle=LG(c,74,124,126,184,[[0,'#4a7a30'],[1,'#1a3010']]);c.fill();stroke(c,INK,2);
  for(let k=0;k<8;k++){const x=78+k*6.2,l=50+Math.sin(k*2.1)*12;c.beginPath();c.moveTo(x,130);c.bezierCurveTo(x+sw,150,x-2+sw*1.5,170,x+(k-3.5)*1.4+sw*2,130+l);stroke(c,'#2a4a1a',2.6,.9);c.beginPath();c.moveTo(x,130);c.bezierCurveTo(x+sw,150,x-2+sw*1.5,170,x+(k-3.5)*1.4+sw*2,130+l);stroke(c,'#7ab84a',1,.6)}
  for(const[x,y,col]of[[84,166,'#e9a0c0'],[112,172,'#ffe080'],[98,186,'#e9a0c0']]){for(let k=0;k<5;k++){c.fillStyle=col;ell(c,x+Math.cos(k*TAU/5)*2.2,y+Math.sin(k*TAU/5)*2.2,1.6,1.6);c.fill()}c.fillStyle='#ffd040';ell(c,x,y,1.2,1.2);c.fill()}
  // усы-корни
  for(const s of[-1,1]){c.beginPath();c.moveTo(100,127);c.bezierCurveTo(100+s*10,124,100+s*16,130,100+s*18,142);stroke(c,'#3a5a24',3,1)}
  leaf(c,80,58,-.8+Math.sin(t*2)*.1,'#9ad16a');leaf(c,120,58,.8+Math.sin(t*2+1)*.1,'#62c15a')},
 light(c,t,m){soft(c,100,190,140,'#9aff5a',.2,'soft-light');soft(c,180,30,120,'#000000',.35,'multiply')}
};
function leaf(c,x,y,a,col,sc){sc=sc||1;c.save();c.translate(x,y);c.rotate(a);c.scale(sc,sc);
 c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(5,-6,0,-15);c.quadraticCurveTo(-5,-6,0,0);c.closePath();
 c.fillStyle=LG(c,-4,-8,4,-8,[[0,mix(col,'#000000',.35)],[.5,col],[1,mix(col,'#ffffff',.25)]]);c.fill();stroke(c,INK,1,.9);
 c.beginPath();c.moveTo(0,-1);c.lineTo(0,-13);stroke(c,mix(col,'#000000',.45),.6,.8);c.restore()}

/* ---------- сборка ---------- */
function draw(c,key,t,hp,seed){
 const H=HEROES[key];seed=seed||0;
 const m=hp>.55?2:hp>.25?1:0;
 const brS=m===0?4.4:m===1?3:1.7,br=Math.sin(t*brS+seed),pant=.5+.5*Math.sin(t*brS*2+seed);
 const sway=Math.sin(t*.8+seed)*(m===0?2.4:1.2),shk=m===0?(hv(Math.floor(t*30))-.5)*.8:0;
 const L={rx:1};
 c.save();
 H.bg(c,t,m);
 // тело
 c.save();c.translate(0,br*(m===0?1.6:.9));
 c.save();c.translate(100,200);c.scale(1+br*.006,1+br*.012);c.translate(-100,-200);H.body(c,t,m,br);c.restore();
 c.restore();
 // голова
 c.save();
 const hx=sway*.6+shk,hy=br*(m===0?1.2:.6)+(m===0?3:0),ha=sway*.012+(m===0?.06:0);
 c.translate(100+hx,130+hy);c.rotate(ha);c.translate(-100,-130);
 H.back(c,t,m);
 // шея
 c.beginPath();c.moveTo(100-H.hw*.52,118);c.lineTo(100+H.hw*.52,118);c.lineTo(100+H.hw*.6,156);c.quadraticCurveTo(100,162,100-H.hw*.6,156);c.closePath();
 c.fillStyle=LG(c,0,120,0,160,[[0,H.skin[2]],[.5,H.skin[1]],[1,H.skin[2]]]);c.fill();
 for(const s of[-1,1]){c.beginPath();c.moveTo(100+s*H.hw*.52,118);c.lineTo(100+s*H.hw*.6,156);stroke(c,INK,2)}
 soft(c,100,124,H.hw*.7,H.skin[2],.6,'multiply');
 ears(c,H);
 skin(c,H,m,L);
 // глаза
 const blink=((t*.37+seed*.13)%1)<.035||(m===0&&((t*.5)%1)<.06);
 const sacc=Math.floor(t*.7+seed),gx=(hv(sacc)-.5)*3.2,gy=(hv(sacc+.3)-.5)*1.2;
 const open=blink?0:m===2?.72:m===1?.95:.8;
 eye(c,100-H.hw*.42,98,-1,H,m===0?Math.min(open,.25):open,gx,gy,t);
 eye(c,100+H.hw*.42,98,1,H,m===2&&H.smirk>1?open*.85:open,gx,gy,t);
 const bl=m===2?0:m===1?-1:2,bi=m===2?2.5:m===1?6:-4;
 brow(c,100-H.hw*.42,98,-1,H.brow,bl,bi,3.4);brow(c,100+H.hw*.42,98,1,H.brow,bl+(m===2&&H.smirk>1?1.6:0),bi,3.4);
 nose(c,H,m);
 if(!H.mask)mouth(c,H,m,t,pant);
 wounds(c,H,m,t,seed);
 H.front(c,t,m);
 if(H.extra)H.extra(c,t,m);
 c.restore();
 // свет и цвет
 H.light(c,t,m);
 if(m===0){c.save();c.globalCompositeOperation='saturation';c.fillStyle='rgba(128,128,128,.45)';c.fillRect(0,0,200,200);c.restore();
  const p=.35+.25*Math.sin(t*5);c.fillStyle=RG(c,100,100,150,[[.4,'rgba(160,0,0,0)'],[1,`rgba(160,0,0,${p})`]]);c.fillRect(0,0,200,200)}
 c.fillStyle=RG(c,100,96,150,[[.45,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.6)']]);c.fillRect(0,0,200,200);
 c.save();c.globalCompositeOperation='overlay';c.globalAlpha=.12;c.drawImage(grain(),0,0);c.restore();
 c.restore();
}
window.PORTRAIT={draw,HEROES,keys:['fire','water','earth','air','metal','wood']};
})();

