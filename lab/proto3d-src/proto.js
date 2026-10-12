/* Симбиоз 3D — прототип: лужайка, Пиромант, враги, огненные шары, молния */
(function(){
'use strict';
const T=THREE,X=THREE_X;
const $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),TAU=Math.PI*2;

/* ---------- рендер ---------- */
const cv=$('c');
const renderer=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();
const camera=new T.PerspectiveCamera(40,1,0.5,260);

/* небо: градиентный купол */
const skyU={top:{value:new T.Color('#3d7fd9')},hor:{value:new T.Color('#cfe8ff')}};
const sky=new T.Mesh(new T.SphereGeometry(200,24,12),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:skyU,
  vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform vec3 top,hor;varying vec3 vP;void main(){float h=clamp(vP.y*1.6,0.,1.);gl_FragColor=vec4(mix(hor,top,pow(h,.7)),1.);}'}));
scene.add(sky);
scene.fog=new T.Fog('#cfe8ff',38,120);

const hemi=new T.HemisphereLight('#cfe6ff','#55702c',1.15);scene.add(hemi);
const sun=new T.DirectionalLight('#fff0d8',2.6);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
const SC=sun.shadow.camera;SC.left=-30;SC.right=30;SC.top=30;SC.bottom=-30;SC.near=1;SC.far=120;
sun.shadow.bias=-0.0004;sun.shadow.normalBias=0.03;
scene.add(sun);scene.add(sun.target);

/* ---------- геометрия из блоков ---------- */
/* box: w,h,d — размеры; x,y,z — центр; col — цвет; ao — затемнение низа (фальшивое затенение углов) */
function boxG(w,h,d,x,y,z,col,o){
  o=o||{};
  const g=new T.BoxGeometry(w,h,d);
  if(o.ry)g.rotateY(o.ry);if(o.rx)g.rotateX(o.rx);if(o.rz)g.rotateZ(o.rz);
  g.translate(x,y,z);
  const c=new T.Color(col),p=g.attributes.position,n=p.count,cols=new Float32Array(n*3);
  const ao=o.ao===undefined?0.38:o.ao,y0=y-h/2;
  for(let i=0;i<n;i++){
    const k=clamp((p.getY(i)-y0)/h,0,1),m=1-ao*(1-k);
    const j=o.jit?1+(Math.random()-.5)*o.jit:1;
    cols[i*3]=c.r*m*j;cols[i*3+1]=c.g*m*j;cols[i*3+2]=c.b*m*j;
  }
  g.setAttribute('color',new T.BufferAttribute(cols,3));
  return g;
}
const merge=gs=>X.mergeGeometries(gs.map(g=>g.index?g.toNonIndexed():g),false);
const matV=new T.MeshStandardMaterial({vertexColors:true,roughness:.92,metalness:0});

/* ---------- мир ---------- */
const WR=110;           /* радиус мира */
const solids=[];        /* круги столкновений {x,z,r} */
const GRID=new Map(),GS=6;
function addSolid(x,z,r){const s={x,z,r};solids.push(s);const k=Math.floor(x/GS)+','+Math.floor(z/GS);if(!GRID.has(k))GRID.set(k,[]);GRID.get(k).push(s)}
function nearSolids(x,z){const a=[],cx=Math.floor(x/GS),cz=Math.floor(z/GS);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const l=GRID.get((cx+i)+','+(cz+j));if(l)for(const s of l)a.push(s)}return a}

/* земля: плитки с лёгким разбросом цвета */
(function(){
  const g=new T.PlaneGeometry(WR*2.4,WR*2.4,96,96);g.rotateX(-Math.PI/2);
  const p=g.attributes.position,n=p.count,cols=new Float32Array(n*3),a=new T.Color('#5aa836'),b=new T.Color('#46922c'),c=new T.Color('#79bf46');
  const tmp=new T.Color();
  for(let i=0;i<n;i++){const x=p.getX(i),z=p.getZ(i);
    const v=Math.sin(x*.11)*Math.cos(z*.13)+Math.sin(x*.031+z*.027)*1.3;
    tmp.copy(a).lerp(v>0?c:b,Math.min(1,Math.abs(v)*.45));
    cols[i*3]=tmp.r;cols[i*3+1]=tmp.g;cols[i*3+2]=tmp.b}
  g.setAttribute('color',new T.BufferAttribute(cols,3));
  const m=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:1}));m.receiveShadow=true;scene.add(m);
})();

/* деревья, ёлки, кусты, камни, цветы — всё склеено в одну деталь */
(function(){
  const gs=[];
  const leaf=['#3f8f2e','#4a9e35','#5aad3c','#357f2a'],pine=['#1f5a3a','#246843','#2c7448'];
  function oak(x,z,s){const h=2.2*s;
    gs.push(boxG(.55*s,h,.55*s,x,h/2,z,'#6b4a2e'));
    const L=leaf[Math.floor(Math.random()*leaf.length)];
    gs.push(boxG(2.8*s,1.5*s,2.8*s,x,h+.6*s,z,L,{ao:.45,jit:.1}));
    gs.push(boxG(2.0*s,1.1*s,2.0*s,x+.35*s,h+1.75*s,z-.25*s,L,{ao:.3,jit:.1}));
    gs.push(boxG(1.4*s,.9*s,1.4*s,x-.9*s,h+.2*s,z+.6*s,L,{ao:.4}));
    addSolid(x,z,.55*s)}
  function pin(x,z,s){
    gs.push(boxG(.5*s,1.4*s,.5*s,x,.7*s,z,'#5a3c24'));
    const P=pine[Math.floor(Math.random()*pine.length)];
    for(let i=0;i<4;i++){const w=(2.6-i*.55)*s,hh=.9*s;gs.push(boxG(w,hh,w,x,1.4*s+i*.85*s+hh/2,z,P,{ao:.45,ry:i*.25}))}
    addSolid(x,z,.5*s)}
  function bush(x,z,s){const L=leaf[Math.floor(Math.random()*leaf.length)];gs.push(boxG(1.4*s,.8*s,1.2*s,x,.4*s,z,L,{ao:.5,ry:Math.random()*3}));gs.push(boxG(.9*s,.6*s,.9*s,x+.5*s,.6*s,z+.2*s,L,{ao:.4}))}
  function rock(x,z,s){gs.push(boxG(1.4*s,.9*s,1.1*s,x,.45*s,z,'#8d939c',{ao:.5,ry:Math.random()*3,jit:.08}));gs.push(boxG(.8*s,.6*s,.7*s,x+.6*s,.3*s,z+.3*s,'#a3a9b1',{ao:.5,ry:Math.random()*3}));addSolid(x,z,.75*s)}
  function stone(x,z,s){const h=3.2*s;gs.push(boxG(1.1*s,h,1.1*s,x,h/2,z,'#5d6066',{ao:.45,jit:.06}));gs.push(boxG(1.25*s,.35*s,1.25*s,x,h+.1,z,'#6e9a3a',{ao:.2}));gs.push(boxG(.3*s,.5*s,.08,x,h*.6,z+.56*s,'#e8a33a',{ao:0}));addSolid(x,z,.7*s)}
  const R=(a,b)=>rnd(a,b),far=(x,z)=>Math.hypot(x,z)>6;
  for(let i=0;i<260;i++){const a=R(0,TAU),d=Math.sqrt(Math.random())*WR,x=Math.cos(a)*d,z=Math.sin(a)*d;if(!far(x,z))continue;
    const r=Math.random();if(r<.45)oak(x,z,R(.8,1.25));else if(r<.75)pin(x,z,R(.8,1.3));else if(r<.9)rock(x,z,R(.7,1.3));else stone(x,z,R(.8,1.1))}
  for(let i=0;i<220;i++){const a=R(0,TAU),d=R(4,WR);bush(Math.cos(a)*d,Math.sin(a)*d,R(.6,1.1))}
  for(let i=0;i<70;i++){let x=R(-WR*.8,WR*.8),z=R(-WR*.8,WR*.8);const n=R(4,10),ang=R(0,TAU);for(let j=0;j<n;j++){x+=Math.cos(ang+R(-.5,.5))*1.1;z+=Math.sin(ang+R(-.5,.5))*1.1;gs.push(boxG(R(.9,1.4),.06,R(.9,1.4),x,.03,z,j%3?'#9a7a4a':'#8a6a3e',{ao:0,ry:R(0,3),jit:.12}))}}
  for(let i=0;i<300;i++){const a=R(0,TAU),d=R(3,WR);gs.push(boxG(R(.15,.35),R(.1,.2),R(.15,.3),Math.cos(a)*d,.05,Math.sin(a)*d,'#9aa0a8',{ao:.4,ry:R(0,3)}))}
  const fl=['#ffe06a','#ff7a9a','#ffffff','#b58cff','#ff9a3a'];
  for(let i=0;i<260;i++){const a=R(0,TAU),d=R(2,WR),x=Math.cos(a)*d,z=Math.sin(a)*d,c=fl[i%fl.length];gs.push(boxG(.12,.35,.12,x,.175,z,'#3d8a2a',{ao:.3}));gs.push(boxG(.26,.18,.26,x,.4,z,c,{ao:0}))}
  const m=new T.Mesh(merge(gs),matV);m.castShadow=true;m.receiveShadow=true;scene.add(m);
})();

/* трава: тысячи травинок одной командой, качаются от ветра и «едут» вместе с героем */
const grassU={uT:{value:0},uP:{value:new T.Vector3()}};
let grass=null;
function makeGrass(N){
  if(grass){scene.remove(grass);grass.geometry.dispose();grass=null}
  if(!N)return;
  const base=new T.ConeGeometry(.07,.6,3,1);base.translate(0,.3,0);
  const nrm=base.attributes.normal;for(let i=0;i<nrm.count;i++)nrm.setXYZ(i,0,1,0);
  const g=new T.InstancedBufferGeometry();g.index=base.index;g.attributes.position=base.attributes.position;g.attributes.normal=base.attributes.normal;
  const off=new Float32Array(N*3),col=new Float32Array(N*3),sc=new Float32Array(N);
  const cA=new T.Color('#74c043'),cB=new T.Color('#57a535'),c=new T.Color();
  for(let i=0;i<N;i++){off[i*3]=rnd(-30,30);off[i*3+1]=0;off[i*3+2]=rnd(-30,30);c.copy(cA).lerp(cB,Math.random());col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;sc[i]=rnd(.6,1.4)}
  g.setAttribute('aOff',new T.InstancedBufferAttribute(off,3));g.setAttribute('aCol',new T.InstancedBufferAttribute(col,3));g.setAttribute('aSc',new T.InstancedBufferAttribute(sc,1));
  g.instanceCount=N;
  const m=new T.MeshLambertMaterial({vertexColors:true});
  m.onBeforeCompile=s=>{
    s.uniforms.uT=grassU.uT;s.uniforms.uP=grassU.uP;
    s.vertexShader='attribute vec3 aOff;attribute vec3 aCol;attribute float aSc;uniform float uT;uniform vec3 uP;\n'+s.vertexShader
      .replace('#include <color_vertex>','vColor=aCol*mix(.8,1.12,position.y/.6);')
      .replace('#include <begin_vertex>',`vec3 o=aOff;o.xz=mod(o.xz-uP.xz+30.,60.)-30.+uP.xz;
        float hh=position.y/.6;vec3 transformed=position*aSc;
        transformed.x+=sin(uT*2.1+o.x*.45+o.z*.3)*.16*hh*hh;transformed.z+=cos(uT*1.7+o.x*.3)*.08*hh*hh;
        transformed+=o;`);
  };
  grass=new T.Mesh(g,m);grass.frustumCulled=false;grass.receiveShadow=true;scene.add(grass);
}

/* ---------- частицы (светящиеся и дым) ---------- */
function particleSystem(N,additive){
  const g=new T.BufferGeometry();
  const pos=new Float32Array(N*3),col=new Float32Array(N*4),size=new Float32Array(N);
  g.setAttribute('position',new T.BufferAttribute(pos,3).setUsage(T.DynamicDrawUsage));
  g.setAttribute('aCol',new T.BufferAttribute(col,4).setUsage(T.DynamicDrawUsage));
  g.setAttribute('aSize',new T.BufferAttribute(size,1).setUsage(T.DynamicDrawUsage));
  const m=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:additive?T.AdditiveBlending:T.NormalBlending,uniforms:{uS:{value:400}},
    vertexShader:'attribute vec4 aCol;attribute float aSize;uniform float uS;varying vec4 vC;void main(){vC=aCol;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=aSize*uS/(-mv.z);gl_Position=projectionMatrix*mv;}',
    fragmentShader:additive?'varying vec4 vC;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,d);a*=a;gl_FragColor=vec4(vC.rgb*a*vC.a,1.);}'
      :'varying vec4 vC;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.15,d);gl_FragColor=vec4(vC.rgb,vC.a*a);}'});
  const pts=new T.Points(g,m);pts.frustumCulled=false;scene.add(pts);
  const P={n:0,N,pts,mat:m,x:new Float32Array(N),y:new Float32Array(N),z:new Float32Array(N),vx:new Float32Array(N),vy:new Float32Array(N),vz:new Float32Array(N),
    l:new Float32Array(N),L:new Float32Array(N),s0:new Float32Array(N),s1:new Float32Array(N),r:new Float32Array(N),gg:new Float32Array(N),b:new Float32Array(N),a:new Float32Array(N),grav:new Float32Array(N),drag:new Float32Array(N)};
  P.add=(x,y,z,vx,vy,vz,life,s0,s1,r,gr,b,a,grav,drag)=>{if(P.n>=N)return;const i=P.n++;P.x[i]=x;P.y[i]=y;P.z[i]=z;P.vx[i]=vx;P.vy[i]=vy;P.vz[i]=vz;P.l[i]=0;P.L[i]=life;P.s0[i]=s0;P.s1[i]=s1;P.r[i]=r;P.gg[i]=gr;P.b[i]=b;P.a[i]=a;P.grav[i]=grav||0;P.drag[i]=drag||0};
  P.update=dt=>{
    let i=0;
    while(i<P.n){
      P.l[i]+=dt;
      if(P.l[i]>=P.L[i]){const j=--P.n;for(const k of ['x','y','z','vx','vy','vz','l','L','s0','s1','r','gg','b','a','grav','drag'])P[k][i]=P[k][j];continue}
      const dr=Math.exp(-P.drag[i]*dt);P.vx[i]*=dr;P.vy[i]=P.vy[i]*dr-P.grav[i]*dt;P.vz[i]*=dr;
      P.x[i]+=P.vx[i]*dt;P.y[i]+=P.vy[i]*dt;P.z[i]+=P.vz[i]*dt;if(P.y[i]<0.02){P.y[i]=0.02;P.vy[i]*=-.3}
      const k=P.l[i]/P.L[i];
      pos[i*3]=P.x[i];pos[i*3+1]=P.y[i];pos[i*3+2]=P.z[i];
      size[i]=P.s0[i]+(P.s1[i]-P.s0[i])*k;
      const f=additive?(1-k)*(1-k):(1-k);
      col[i*4]=P.r[i];col[i*4+1]=P.gg[i];col[i*4+2]=P.b[i];col[i*4+3]=P.a[i]*f;
      i++;
    }
    g.setDrawRange(0,P.n);
    g.attributes.position.needsUpdate=true;g.attributes.aCol.needsUpdate=true;g.attributes.aSize.needsUpdate=true;
  };
  return P;
}
const FX=particleSystem(6000,true),SMK=particleSystem(1500,false);

/* обломки-кубики (враги рассыпаются на блоки) */
const DEB={N:700,n:0,a:[]};
DEB.mesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({roughness:.8}),DEB.N);
DEB.mesh.castShadow=true;DEB.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);DEB.mesh.count=0;scene.add(DEB.mesh);
DEB.mesh.setColorAt(0,new T.Color());
function debris(x,y,z,col,n,s,pow){const c=new T.Color(col);for(let i=0;i<n;i++){if(DEB.a.length>=DEB.N)DEB.a.shift();DEB.a.push({x:x+rnd(-.3,.3),y:y+rnd(0,.5),z:z+rnd(-.3,.3),vx:rnd(-1,1)*pow,vy:rnd(2,6)*pow*.6,vz:rnd(-1,1)*pow,rx:rnd(0,6),ry:rnd(0,6),wr:rnd(-8,8),s:s*rnd(.6,1.2),l:0,L:rnd(1.4,2.2),c:c.clone().multiplyScalar(rnd(.8,1.15))})}}
const _m=new T.Matrix4(),_q=new T.Quaternion(),_e=new T.Euler(),_v=new T.Vector3(),_s=new T.Vector3();
function updDebris(dt){
  let k=0;
  DEB.a=DEB.a.filter(d=>{d.l+=dt;return d.l<d.L});
  for(const d of DEB.a){
    d.vy-=22*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.z+=d.vz*dt;
    if(d.y<d.s/2){d.y=d.s/2;d.vy*=-.35;d.vx*=.6;d.vz*=.6;d.wr*=.6}
    d.rx+=d.wr*dt;d.ry+=d.wr*.7*dt;
    const sc=d.s*Math.min(1,(d.L-d.l)*2.5);
    _m.compose(_v.set(d.x,d.y,d.z),_q.setFromEuler(_e.set(d.rx,d.ry,0)),_s.set(sc,sc,sc));
    DEB.mesh.setMatrixAt(k,_m);DEB.mesh.setColorAt(k,d.c);k++;
  }
  DEB.mesh.count=k;DEB.mesh.instanceMatrix.needsUpdate=true;if(DEB.mesh.instanceColor)DEB.mesh.instanceColor.needsUpdate=true;
}

/* вспышки света: несколько точечных источников, которые переиспользуются */
const LIGHTS=[];
for(let i=0;i<8;i++){const L=new T.PointLight('#ff8a3a',0,10,2);L.userData={t:0,T:0,peak:0,follow:null};scene.add(L);LIGHTS.push(L)}
function flashLight(x,y,z,col,peak,dur,dist,follow){
  let L=LIGHTS.find(l=>l.userData.T<=0&&!l.userData.follow)||LIGHTS.reduce((a,b)=>a.userData.T-a.userData.t<b.userData.T-b.userData.t?a:b);
  L.position.set(x,y,z);L.color.set(col);L.distance=dist;L.userData={t:0,T:dur,peak,follow:follow||null};L.intensity=peak;return L;
}
function updLights(dt){for(const L of LIGHTS){const u=L.userData;
  if(u.follow){if(u.follow.dead){u.follow=null;u.T=0.12;u.t=0;continue}L.position.set(u.follow.x,u.follow.y,u.follow.z);L.intensity=u.peak*(0.85+0.3*Math.random());continue}
  if(u.T<=0){L.intensity=0;continue}u.t+=dt;const k=u.t/u.T;if(k>=1){u.T=0;L.intensity=0}else L.intensity=u.peak*(1-k)*(1-k)}}

/* ударные кольца на земле */
const RINGS=[];
function ring(x,z,col,r0,r1,dur){const m=new T.Mesh(new T.RingGeometry(.8,1,40),new T.MeshBasicMaterial({color:new T.Color(col),transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));
  m.rotation.x=-Math.PI/2;m.position.set(x,.06,z);scene.add(m);RINGS.push({m,t:0,T:dur,r0,r1})}
function updRings(dt){for(let i=RINGS.length-1;i>=0;i--){const R=RINGS[i];R.t+=dt;const k=R.t/R.T;if(k>=1){scene.remove(R.m);R.m.geometry.dispose();R.m.material.dispose();RINGS.splice(i,1);continue}
  const r=R.r0+(R.r1-R.r0)*(1-(1-k)*(1-k));R.m.scale.set(r,r,r);R.m.material.opacity=(1-k)}}

/* ---------- герой: Пиромант из блоков ---------- */
const hero={x:0,z:0,ang:0,walk:0,cast:0,hp:1};
const H=new T.Group();scene.add(H);
function part(geoms,px,py,pz){const g=new T.Group();g.position.set(px,py,pz);const m=new T.Mesh(merge(geoms),matV);m.castShadow=true;g.add(m);H.add(g);return g}
const SK='#f0c49a',TUN='#c8381e',TUN2='#8e1f12',PANT='#3a2a26',HAIR='#ff5a1e',HAIR2='#ffb03a',GOLD='#f2c14a';
const legL=part([boxG(.32,.75,.34,0,-.375,0,PANT),boxG(.36,.18,.42,0,-.7,.04,'#2a1c18',{ao:.2})],-.2,.8,0);
const legR=part([boxG(.32,.75,.34,0,-.375,0,PANT),boxG(.36,.18,.42,0,-.7,.04,'#2a1c18',{ao:.2})],.2,.8,0);
const body=part([boxG(.82,.8,.48,0,.4,0,TUN,{ao:.3}),boxG(.86,.14,.52,0,.08,0,TUN2,{ao:0}),boxG(.16,.16,.06,0,.08,.27,GOLD,{ao:0}),boxG(.9,.5,.12,0,.35,-.3,TUN2,{ao:.2})],0,.8,0);
const armL=part([boxG(.24,.7,.26,0,-.32,0,TUN,{ao:.25}),boxG(.22,.18,.24,0,-.72,0,SK,{ao:.1})],-.54,1.55,0);
const armR=part([boxG(.24,.7,.26,0,-.32,0,TUN,{ao:.25}),boxG(.22,.18,.24,0,-.72,0,SK,{ao:.1})],.54,1.55,0);
const head=part([boxG(.62,.6,.58,0,.3,0,SK,{ao:.15}),boxG(.1,.12,.04,-.14,.32,.3,'#2a1410',{ao:0}),boxG(.1,.12,.04,.14,.32,.3,'#2a1410',{ao:0}),
  boxG(.7,.22,.66,0,.66,-.02,HAIR,{ao:.2}),boxG(.22,.34,.22,-.18,.86,0,HAIR,{ao:.2,rz:.3}),boxG(.22,.4,.22,.08,.92,-.06,HAIR2,{ao:.1,rz:-.15}),boxG(.2,.3,.2,.26,.82,.08,HAIR,{ao:.1,rz:-.4}),
  boxG(.7,.36,.18,0,.42,-.32,HAIR,{ao:.3})],0,1.62,0);
/* пламя в ладони */
const flameM=new T.Mesh(new T.BoxGeometry(.18,.18,.18),new T.MeshBasicMaterial({color:new T.Color(4,1.6,.35)}));flameM.position.set(0,-.86,.12);armR.add(flameM);
const heroLight=new T.PointLight('#ff8a3a',6,7,2);scene.add(heroLight);
H.traverse(o=>{if(o.isMesh)o.castShadow=true});

/* ---------- враги (каждый вид — одна команда отрисовки на всех) ---------- */
const ETYPES={
  slime:{n:'Слизень',hp:30,sp:2.6,r:.6,col:'#6bd36a',geo:()=>merge([boxG(1.1,.9,1.1,0,.45,0,'#6bd36a',{ao:.35}),boxG(1.16,.2,1.16,0,.92,0,'#8ef08a',{ao:0}),boxG(.16,.2,.05,-.22,.6,.56,'#13301a',{ao:0}),boxG(.16,.2,.05,.22,.6,.56,'#13301a',{ao:0})])},
  wisp:{n:'Огонёк',hp:18,sp:3.6,r:.45,col:'#a07cff',fly:1,emi:'#5a2cff',geo:()=>merge([boxG(.7,.7,.7,0,0,0,'#b896ff',{ao:.2}),boxG(.4,.4,.4,0,-.5,0,'#8a6bd6',{ao:.2}),boxG(.12,.14,.04,-.14,.08,.36,'#ffffff',{ao:0}),boxG(.12,.14,.04,.14,.08,.36,'#ffffff',{ao:0})])},
  brute:{n:'Громила',hp:90,sp:1.6,r:.9,col:'#5a63d6',geo:()=>merge([boxG(.42,.7,.42,-.32,.35,0,'#2c2f5a'),boxG(.42,.7,.42,.32,.35,0,'#2c2f5a'),boxG(1.3,1.1,.8,0,1.25,0,'#5a63d6',{ao:.3}),
    boxG(.36,1.0,.4,-.86,1.2,0,'#4a52b8',{ao:.3}),boxG(.36,1.0,.4,.86,1.2,0,'#4a52b8',{ao:.3}),boxG(.42,.36,.46,-.86,.58,0,'#9aa7c0',{ao:.2}),boxG(.42,.36,.46,.86,.58,0,'#9aa7c0',{ao:.2}),
    boxG(.7,.6,.62,0,2.1,.05,'#6f78e6',{ao:.2}),boxG(.5,.1,.05,0,2.12,.37,'#ffd23a',{ao:0})])},
  beetle:{n:'Скарабей',hp:24,sp:4.2,r:.5,col:'#d6b25a',geo:()=>merge([boxG(.9,.42,1.1,0,.36,0,'#c4962e',{ao:.4}),boxG(.96,.12,1.0,0,.6,-.05,'#e8c25a',{ao:0}),boxG(.5,.3,.36,0,.32,.68,'#3a2a14',{ao:.2}),
    boxG(1.3,.1,.1,0,.18,.28,'#2a1c0a',{ao:0}),boxG(1.3,.1,.1,0,.18,-.08,'#2a1c0a',{ao:0}),boxG(1.3,.1,.1,0,.18,-.42,'#2a1c0a',{ao:0})])}
};
const EK=Object.keys(ETYPES),EMAX=320;
for(const k of EK){const E=ETYPES[k];
  const mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.85});if(E.emi){mat.emissive=new T.Color(E.emi);mat.emissiveIntensity=.9}
  E.mesh=new T.InstancedMesh(E.geo(),mat,EMAX);E.mesh.castShadow=true;E.mesh.receiveShadow=true;E.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);E.mesh.count=0;E.mesh.frustumCulled=false;
  for(let i=0;i<EMAX;i++)E.mesh.setColorAt(i,new T.Color(1,1,1));scene.add(E.mesh)}
let ens=[];
function spawnEnemy(){
  const k=EK[Math.random()<.35?0:Math.random()<.4?1:Math.random()<.6?3:2],E=ETYPES[k];
  for(let t=0;t<10;t++){const a=rnd(0,TAU),d=rnd(17,25),x=hero.x+Math.cos(a)*d,z=hero.z+Math.sin(a)*d;
    if(Math.hypot(x,z)>WR-4)continue;if(nearSolids(x,z).some(s=>Math.hypot(x-s.x,z-s.z)<s.r+E.r))continue;
    ens.push({k,E,x,z,y:0,hp:E.hp,max:E.hp,fl:0,ph:rnd(0,6),ang:0,dead:false,kx:0,kz:0});return}
}
let TARGET=40;
function hitEnemy(e,dmg,col,kx,kz){
  if(e.dead)return;
  e.hp-=dmg;e.fl=1;e.kx+=kx||0;e.kz+=kz||0;
  dmgNum(e.x,1.6,e.z,Math.round(dmg),col);
  if(e.hp<=0){e.dead=true;kills++;
    debris(e.x,e.E.fly?1:.5,e.z,e.E.col,e.E.r>.8?14:8,e.E.r>.8?.32:.22,1.4);
    for(let i=0;i<8;i++)SMK.add(e.x+rnd(-.3,.3),.4,e.z+rnd(-.3,.3),rnd(-.5,.5),rnd(.6,1.4),rnd(-.5,.5),rnd(.6,1),.6,1.6,.35,.33,.3,.5,0,1)}
}

/* ---------- огненный шар ---------- */
const balls=[];
const ballGeo=new T.IcosahedronGeometry(.32,0),ballMat=new T.MeshBasicMaterial({color:new T.Color(7,3,.7)});
function castFire(){
  let best=null,bd=22*22;
  for(const e of ens){if(e.dead)continue;const d=(e.x-hero.x)**2+(e.z-hero.z)**2;if(d<bd){bd=d;best=e}}
  if(!best)return;
  hero.cast=.25;hero.ang=Math.atan2(best.x-hero.x,best.z-hero.z);
  const hx=hero.x+Math.sin(hero.ang)*.6,hz=hero.z+Math.cos(hero.ang)*.6;
  const m=new T.Mesh(ballGeo,ballMat);scene.add(m);
  const b={m,x:hx,y:1.3,z:hz,t:best,sp:20,dead:false,life:2};
  b.L=flashLight(hx,1.3,hz,'#ff8a3a',22,0,7,b);
  balls.push(b);
}
function explode(x,y,z,big){
  flashLight(x,1.2,z,'#ff9a4a',big?140:70,.35,big?14:10);
  ring(x,z,new T.Color(3,1.3,.3),.3,big?4:2.6,.45);
  for(let i=0;i<(big?70:38);i++){const a=rnd(0,TAU),u=rnd(-1,1),s=rnd(3,10)*(big?1.3:1),c=Math.sqrt(1-u*u);
    const hot=Math.random()<.4;FX.add(x,y,z,Math.cos(a)*c*s,Math.abs(u)*s*.8+2,Math.sin(a)*c*s,rnd(.3,.7),hot?.55:.35,.1,hot?6:4,hot?4:1.6,hot?1.5:.3,1,9,2.5)}
  for(let i=0;i<10;i++)SMK.add(x+rnd(-.5,.5),y,z+rnd(-.5,.5),rnd(-1,1),rnd(1,2.5),rnd(-1,1),rnd(.8,1.4),.8,2.4,.25,.22,.2,.55,0,1.2);
  const R=big?3.2:2.2;
  for(const e of ens){if(e.dead)continue;const d=Math.hypot(e.x-x,e.z-z);if(d<R+e.E.r){const k=(e.x-x)/(d||1),l=(e.z-z)/(d||1);hitEnemy(e,10,'#ffb347',k*4,l*4)}}
  shake=Math.max(shake,big?.35:.15);
}
function updBalls(dt){
  for(const b of balls){
    if(b.dead)continue;b.life-=dt;
    if(b.t.dead){let best=null,bd=10*10;for(const e of ens){if(e.dead)continue;const d=(e.x-b.x)**2+(e.z-b.z)**2;if(d<bd){bd=d;best=e}}if(best)b.t=best}
    const tx=b.t.x,tz=b.t.z,ty=b.t.E.fly?1.3:.7,dx=tx-b.x,dy=ty-b.y,dz=tz-b.z,d=Math.hypot(dx,dy,dz)||1;
    b.x+=dx/d*b.sp*dt;b.y+=dy/d*b.sp*dt;b.z+=dz/d*b.sp*dt;
    b.m.position.set(b.x,b.y,b.z);b.m.rotation.x+=dt*9;b.m.rotation.y+=dt*7;
    for(let i=0;i<3;i++)FX.add(b.x+rnd(-.1,.1),b.y+rnd(-.1,.1),b.z+rnd(-.1,.1),rnd(-.6,.6),rnd(.2,1.2),rnd(-.6,.6),rnd(.25,.45),.7,.15,5,2,.4,1,-1.5,1);
    if(Math.random()<.3)SMK.add(b.x,b.y,b.z,0,.6,0,.7,.3,.9,.3,.28,.26,.25,0,.5);
    if(d<b.t.E.r+.3||b.life<=0){b.dead=true;scene.remove(b.m);if(!b.t.dead)hitEnemy(b.t,22,'#ffd36b',dx/d*3,dz/d*3);explode(b.x,b.y,b.z,false)}
  }
  for(let i=balls.length-1;i>=0;i--)if(balls[i].dead)balls.splice(i,1);
}

/* ---------- молния ---------- */
const bolts=[];
const boltCore=new T.MeshBasicMaterial({color:new T.Color(9,10,14)});
const boltGlow=new T.MeshBasicMaterial({color:new T.Color(1.4,2.2,6),transparent:true,opacity:.4,blending:T.AdditiveBlending,depthWrite:false});
function jag(a,b,disp,depth,out){
  if(depth===0){out.push(b.clone().add(new T.Vector3(rnd(-.12,.12),0,rnd(-.12,.12))));return}
  const m=a.clone().add(b).multiplyScalar(.5);
  const L=a.distanceTo(b);m.x+=rnd(-1,1)*disp*L;m.y+=rnd(-.3,.3)*disp*L;m.z+=rnd(-1,1)*disp*L;
  jag(a,m,disp,depth-1,out);jag(m,b,disp,depth-1,out);
}
function boltMesh(pts,r,brs){
  const grp=new T.Group();
  const add=(P,rr)=>{const path=new T.CurvePath();for(let i=1;i<P.length;i++)path.add(new T.LineCurve3(P[i-1],P[i]));
    const g1=new T.TubeGeometry(path,P.length*3,rr,4,false),g2=new T.TubeGeometry(path,P.length*3,rr*2.6,5,false);
    grp.add(new T.Mesh(g1,boltCore));grp.add(new T.Mesh(g2,boltGlow))};
  add(pts,r);
  for(let i=0;i<brs;i++){const s=pts[Math.floor(rnd(.15,.75)*pts.length)].clone(),e=s.clone().add(new T.Vector3(rnd(-4,4),-rnd(2,6),rnd(-4,4)));if(e.y<.2)e.y=.2;const o=[s];jag(s,e,.25,4,o);add(o,r*.55)}
  scene.add(grp);return grp;
}
function strike(tx,tz,dmg,chain){
  const top=new T.Vector3(tx+rnd(-6,6),34,tz+rnd(-6,6)),bot=new T.Vector3(tx,0,tz);
  const pts=[top];jag(top,bot,.13,7,pts);
  bolts.push({g:boltMesh(pts,.07,4),t:0,T:.32,pts,re:.1});
  const L=flashLight(tx,4,tz,'#bcd6ff',260,.4,16);
  skyFlash=1;shake=Math.max(shake,.6);
  ring(tx,tz,new T.Color(.5,.8,2.2),.2,5,.5);ring(tx,tz,new T.Color(2,2.4,3),.2,2.2,.22);
  for(let i=0;i<60;i++){const a=rnd(0,TAU),s=rnd(4,14);FX.add(tx,.3,tz,Math.cos(a)*s,rnd(2,9),Math.sin(a)*s,rnd(.25,.6),.35,.08,3,4.5,9,1,16,2)}
  for(let i=0;i<14;i++)SMK.add(tx+rnd(-.8,.8),.3,tz+rnd(-.8,.8),rnd(-1,1),rnd(.8,2),rnd(-1,1),rnd(1,1.8),1,3,.3,.32,.38,.5,0,1);
  scorch(tx,tz);
  const hit=[];
  for(const e of ens){if(e.dead)continue;const d=Math.hypot(e.x-tx,e.z-tz);if(d<3.5+e.E.r){hitEnemy(e,dmg,'#cfe2ff',(e.x-tx)/(d||1)*6,(e.z-tz)/(d||1)*6);hit.push(e)}}
  /* цепь: молния прыгает на соседей */
  if(chain){let from={x:tx,y:.8,z:tz},n=0;const done=new Set(hit);
    for(let j=0;j<5;j++){let best=null,bd=9*9;for(const e of ens){if(e.dead||done.has(e))continue;const d=(e.x-from.x)**2+(e.z-from.z)**2;if(d<bd){bd=d;best=e}}
      if(!best)break;done.add(best);const a=new T.Vector3(from.x,from.y,from.z),b=new T.Vector3(best.x,best.E.fly?1.3:.8,best.z),p=[a];jag(a,b,.18,4,p);
      bolts.push({g:boltMesh(p,.045,0),t:-j*.06,T:.28,pts:p,re:0});
      const bb=best;setTimeout(()=>{hitEnemy(bb,35,'#cfe2ff',0,0);flashLight(bb.x,1.2,bb.z,'#a8c8ff',160,.25,9);for(let i=0;i<14;i++)FX.add(bb.x,1,bb.z,rnd(-5,5),rnd(1,6),rnd(-5,5),rnd(.2,.4),.3,.06,3,4.5,9,1,12,2)},j*60);
      from={x:best.x,y:.8,z:best.z}}}
}
const scorches=[];
const scorchTex=(function(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');const g=x.createRadialGradient(64,64,4,64,64,62);g.addColorStop(0,'rgba(10,10,14,.85)');g.addColorStop(.5,'rgba(20,18,20,.5)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new T.CanvasTexture(c)})();
function scorch(x,z){const m=new T.Mesh(new T.PlaneGeometry(4,4),new T.MeshBasicMaterial({map:scorchTex,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.rotation.z=rnd(0,6);m.position.set(x,.03,z);scene.add(m);scorches.push({m,t:0});if(scorches.length>12){const s=scorches.shift();scene.remove(s.m)}}
function updBolts(dt){
  for(let i=bolts.length-1;i>=0;i--){const b=bolts[i];b.t+=dt;
    b.g.visible=b.t>=0&&(b.t<.06||Math.sin(b.t*90)>-.3);
    if(b.re&&b.t>b.re){b.re=0;scene.remove(b.g);b.g.traverse(o=>{if(o.geometry)o.geometry.dispose()});const p=[b.pts[0]];jag(b.pts[0],b.pts[b.pts.length-1],.13,7,p);b.g=boltMesh(p,.07,3)}
    const k=b.t/b.T;
    if(k>=1){scene.remove(b.g);b.g.traverse(o=>{if(o.geometry)o.geometry.dispose()});bolts.splice(i,1)}}
}

/* ---------- цифры урона (HTML поверх) ---------- */
const nums=[];const numBox=$('nums');
function dmgNum(x,y,z,v,col){if(nums.length>40)return;const el=document.createElement('div');el.className='dn';el.textContent=v;el.style.color=col;numBox.appendChild(el);nums.push({el,x,y,z,t:0,dx:rnd(-.4,.4)})}
function updNums(dt){for(let i=nums.length-1;i>=0;i--){const n=nums[i];n.t+=dt;if(n.t>.8){n.el.remove();nums.splice(i,1);continue}
  _v.set(n.x+n.dx*n.t,n.y+n.t*1.6,n.z).project(camera);const sx=(_v.x*.5+.5)*innerWidth,sy=(-_v.y*.5+.5)*innerHeight;
  n.el.style.transform='translate('+sx+'px,'+sy+'px) translate(-50%,-50%) scale('+(1+Math.max(0,.25-n.t)*2)+')';n.el.style.opacity=String(1-Math.max(0,n.t-.5)/.3)}}

/* ---------- постобработка: свечение ---------- */
let composer=null,bloom=null;
function makeComposer(){
  const w=innerWidth,h=innerHeight;
  composer=new X.EffectComposer(renderer);
  composer.addPass(new X.RenderPass(scene,camera));
  bloom=new X.UnrealBloomPass(new T.Vector2(w,h),.6,.35,.95);composer.addPass(bloom);
  composer.addPass(new X.OutputPass());
}

/* ---------- качество ---------- */
const QL=[
  {n:'Высокое',pr:2,shadow:2048,bloom:true,grass:26000},
  {n:'Среднее',pr:1.25,shadow:1024,bloom:true,grass:10000},
  {n:'Низкое',pr:1,shadow:0,bloom:false,grass:0}];
let qi=0,Q=QL[0];
function setQuality(i){qi=i;Q=QL[i];
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,Q.pr));
  renderer.shadowMap.enabled=!!Q.shadow;sun.castShadow=!!Q.shadow;
  if(Q.shadow){sun.shadow.mapSize.set(Q.shadow,Q.shadow);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}
  scene.traverse(o=>{if(o.material&&o.material.needsUpdate!==undefined)o.material.needsUpdate=true});
  makeGrass(Q.grass);resize();$('bq').textContent='Качество: '+Q.n;
}

/* ---------- день / вечер ---------- */
let evening=false;
function setTime(ev){evening=ev;
  if(ev){skyU.top.value.set('#1a1440');skyU.hor.value.set('#e0784a');scene.fog.color.set('#5a3c4c');scene.fog.near=26;scene.fog.far=90;
    hemi.color.set('#9a8ad0');hemi.groundColor.set('#3a3020');hemi.intensity=.85;sun.color.set('#ff9a5a');sun.intensity=1.4;renderer.toneMappingExposure=1.1;heroLight.intensity=7}
  else{skyU.top.value.set('#3d7fd9');skyU.hor.value.set('#cfe8ff');scene.fog.color.set('#cfe8ff');scene.fog.near=38;scene.fog.far=120;
    hemi.color.set('#cfe6ff');hemi.groundColor.set('#55702c');hemi.intensity=.95;sun.color.set('#fff0d8');sun.intensity=2.3;renderer.toneMappingExposure=.92;heroLight.intensity=2.5}
  baseHemi=hemi.intensity;$('bt').textContent=ev?'Время: вечер':'Время: день';
}
let baseHemi=1.15;

/* ---------- ввод ---------- */
const keys={};
addEventListener('keydown',e=>{keys[e.code]=true;
  if(e.code==='KeyQ')doStrike();if(e.code==='KeyC')toggleCam();if(e.code==='KeyN')setTime(!evening);if(e.code==='KeyG')setQuality((qi+1)%3);if(e.code==='KeyB')stress()});
addEventListener('keyup',e=>{keys[e.code]=false});
/* сенсорный джойстик: палец в любом месте левой половины */
const joy={id:null,x0:0,y0:0,dx:0,dy:0};
cv.addEventListener('pointerdown',e=>{if(joy.id!==null||e.pointerType==='mouse')return; /* джойстик только для пальца */joy.id=e.pointerId;joy.x0=e.clientX;joy.y0=e.clientY;joy.dx=joy.dy=0;$('joy').style.display='block';$('joy').style.left=e.clientX+'px';$('joy').style.top=e.clientY+'px'});
addEventListener('pointermove',e=>{if(e.pointerId!==joy.id)return;let dx=e.clientX-joy.x0,dy=e.clientY-joy.y0;const L=Math.hypot(dx,dy),M=50;if(L>M){dx*=M/L;dy*=M/L}joy.dx=dx/M;joy.dy=dy/M;$('knob').style.transform='translate('+dx+'px,'+dy+'px)'});
const jEnd=e=>{if(e.pointerId!==joy.id)return;joy.id=null;joy.dx=joy.dy=0;$('joy').style.display='none';$('knob').style.transform=''};
addEventListener('pointerup',jEnd);addEventListener('pointercancel',jEnd);

/* ---------- камера ---------- */
const CAMS=[{n:'сверху',off:new T.Vector3(0,18,11)},{n:'как в Diablo',off:new T.Vector3(0,10,11.5)}];
let camI=0;const camPos=new T.Vector3(0,18,11),look=new T.Vector3();
function toggleCam(){camI=(camI+1)%CAMS.length;$('bc').textContent='Камера: '+CAMS[camI].n}

/* ---------- кнопки ---------- */
function doStrike(){let best=null,bd=1e9;for(const e of ens){if(e.dead)continue;const d=(e.x-hero.x)**2+(e.z-hero.z)**2;if(d<bd&&d>4){bd=d;best=e}}
  if(best&&bd<14*14)strike(best.x,best.z,60,true);else{const a=rnd(0,TAU);strike(hero.x+Math.cos(a)*rnd(4,8),hero.z+Math.sin(a)*rnd(4,8),60,true)}}
function stress(){TARGET=TARGET>=200?40:200;$('bs').textContent=TARGET>=200?'Врагов: 200 (стресс)':'Врагов: 40'}
$('bl').onclick=doStrike;$('bc').onclick=toggleCam;$('bt').onclick=()=>setTime(!evening);$('bq').onclick=()=>setQuality((qi+1)%3);$('bs').onclick=stress;
$('ba').onclick=()=>{autoBolt=!autoBolt;$('ba').textContent='Авто-молния: '+(autoBolt?'вкл':'выкл')};
let autoBolt=true;

/* ---------- цикл ---------- */
let last=performance.now(),acc=0,fpsN=0,fpsT=0,fps=60,shake=0,skyFlash=0,kills=0,fireT=0,boltT=2,time=0;
let lowT=0;
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  if(Q.bloom){if(!composer)makeComposer();composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(w,h)}
  FX.mat.uniforms.uS.value=SMK.mat.uniforms.uS.value=h*renderer.getPixelRatio()*.9}
addEventListener('resize',resize);

function step(dt){
  time+=dt;grassU.uT.value=time;
  /* герой */
  let mx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+joy.dx,mz=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+joy.dy;
  const ml=Math.hypot(mx,mz);if(ml>1){mx/=ml;mz/=ml}
  const moving=ml>.1,SP=6.5;
  if(moving){hero.x+=mx*SP*dt;hero.z+=mz*SP*dt;if(hero.cast<=0)hero.ang=Math.atan2(mx,mz)}
  for(const s of nearSolids(hero.x,hero.z)){const dx=hero.x-s.x,dz=hero.z-s.z,d=Math.hypot(dx,dz),m=s.r+.45;if(d<m&&d>0){hero.x=s.x+dx/d*m;hero.z=s.z+dz/d*m}}
  const hr=Math.hypot(hero.x,hero.z);if(hr>WR-3){hero.x*=(WR-3)/hr;hero.z*=(WR-3)/hr}
  hero.walk+=moving?dt*11:0;hero.cast-=dt;
  H.position.set(hero.x,moving?Math.abs(Math.sin(hero.walk))*.08:Math.sin(time*2)*.02,hero.z);
  let da=hero.ang-H.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));H.rotation.y+=da*Math.min(1,dt*14);
  const sw=moving?Math.sin(hero.walk)*.7:0;legL.rotation.x=sw;legR.rotation.x=-sw;armL.rotation.x=-sw*.8;
  armR.rotation.x=hero.cast>0?-1.5:sw*.8;head.rotation.y=Math.sin(time*.7)*.08;
  flameM.rotation.y+=dt*6;flameM.scale.setScalar(.9+.25*Math.sin(time*23));
  flameM.getWorldPosition(_v);heroLight.position.copy(_v);heroLight.position.y+=.3;
  if(Math.random()<.6)FX.add(_v.x+rnd(-.05,.05),_v.y+.05,_v.z+rnd(-.05,.05),rnd(-.2,.2),rnd(.8,1.6),rnd(-.2,.2),rnd(.2,.4),.35,.05,5,2,.4,1,-1,0);
  /* атаки */
  fireT-=dt;if(fireT<=0){fireT=.42;castFire()}
  if(autoBolt){boltT-=dt;if(boltT<=0){boltT=3.2;doStrike()}}
  /* враги */
  ens=ens.filter(e=>!e.dead);
  while(ens.length<TARGET)spawnEnemy();
  for(const e of ens){
    const dx=hero.x-e.x,dz=hero.z-e.z,d=Math.hypot(dx,dz)||1;
    let vx=dx/d*e.E.sp,vz=dz/d*e.E.sp;
    if(d<1.2+e.E.r){vx=vz=0}
    e.x+=(vx+e.kx)*dt;e.z+=(vz+e.kz)*dt;const f=Math.exp(-6*dt);e.kx*=f;e.kz*=f;
    if(!e.E.fly)for(const s of nearSolids(e.x,e.z)){const ax=e.x-s.x,az=e.z-s.z,dd=Math.hypot(ax,az),m=s.r+e.E.r;if(dd<m&&dd>0){e.x=s.x+ax/dd*m;e.z=s.z+az/dd*m}}
    e.ang=Math.atan2(dx,dz);e.fl=Math.max(0,e.fl-dt*6);e.ph+=dt;
    if(d>60){e.dead=true}
  }
  /* раздвигаем врагов друг от друга */
  for(let i=0;i<ens.length;i++){const a=ens[i];for(let j=i+1;j<ens.length;j++){const b=ens[j],dx=b.x-a.x,dz=b.z-a.z,m=a.E.r+b.E.r;if(Math.abs(dx)>m||Math.abs(dz)>m)continue;const d=Math.hypot(dx,dz);if(d<m&&d>0){const p=(m-d)*.5/d;a.x-=dx*p;a.z-=dz*p;b.x+=dx*p;b.z+=dz*p}}}
  /* в инстансы */
  const cnt={};for(const k of EK)cnt[k]=0;
  const c=new T.Color();
  for(const e of ens){const E=e.E,i=cnt[e.k]++;
    let y=0,sx=1,sy=1,sz=1,rx=0;
    if(e.k==='slime'){const b=Math.abs(Math.sin(e.ph*5));y=b*.5;sy=.8+b*.35;sx=sz=1.12-b*.15}
    else if(e.k==='wisp'){y=1+Math.sin(e.ph*3)*.25}
    else if(e.k==='brute'){y=Math.abs(Math.sin(e.ph*4))*.1;rx=Math.sin(e.ph*4)*.05}
    else{y=Math.abs(Math.sin(e.ph*14))*.05}
    const pop=1+e.fl*.15;
    _m.compose(_v.set(e.x,y,e.z),_q.setFromEuler(_e.set(rx,e.ang,0)),_s.set(sx*pop,sy*pop,sz*pop));
    E.mesh.setMatrixAt(i,_m);const w=1+e.fl*3;E.mesh.setColorAt(i,c.setRGB(w,w,w));}
  for(const k of EK){const M=ETYPES[k].mesh;M.count=cnt[k];M.instanceMatrix.needsUpdate=true;if(M.instanceColor)M.instanceColor.needsUpdate=true}
  updBalls(dt);updBolts(dt);updLights(dt);updRings(dt);updDebris(dt);FX.update(dt);SMK.update(dt);updNums(dt);
  /* вспышка неба при молнии */
  skyFlash=Math.max(0,skyFlash-dt*5);hemi.intensity=baseHemi+skyFlash*(evening?.9:.35);
  /* солнце и тени следуют за героем */
  sun.position.set(hero.x+22,40,hero.z+14);sun.target.position.set(hero.x,0,hero.z);
  grassU.uP.value.set(hero.x,0,hero.z);sky.position.set(hero.x,0,hero.z);
  /* камера */
  const off=CAMS[camI].off,zk=camera.aspect<1?Math.min(1.6,1/Math.sqrt(camera.aspect)):1;camPos.lerp(_v.set(hero.x+off.x*zk,off.y*zk,hero.z+off.z*zk),Math.min(1,dt*6));
  shake=Math.max(0,shake-dt*1.8);
  camera.position.copy(camPos).add(_v.set(rnd(-1,1)*shake,rnd(-1,1)*shake,rnd(-1,1)*shake));
  look.set(hero.x,1,hero.z);camera.lookAt(look);
}
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-last)/1000);last=now;
  step(dt);
  if(Q.bloom&&composer)composer.render();else renderer.render(scene,camera);
  fpsN++;fpsT+=dt;if(fpsT>=.5){fps=fpsN/fpsT;fpsN=0;fpsT=0;
    $('st').textContent=Math.round(fps)+' к/с · врагов '+ens.length+' · убито '+kills+' · '+Q.n.toLowerCase()+' качество';
    /* автоснижение качества, если совсем тормозит */
    if(fps<28&&qi<2&&!window.__noAuto){lowT+=.5;if(lowT>=3){lowT=0;setQuality(qi+1)}}else lowT=0}
}
setQuality(0);setTime(false);resize();
for(let i=0;i<TARGET;i++)spawnEnemy();
requestAnimationFrame(frame);
window.__p3={strikeAt:(dx,dz)=>strike(hero.x+dx,hero.z+dz,60,true),get fps(){return fps},stress,setQuality,doStrike,setTime,toggleCam,step,ens:()=>ens.length,render:()=>{if(Q.bloom&&composer)composer.render();else renderer.render(scene,camera)}};
})();
