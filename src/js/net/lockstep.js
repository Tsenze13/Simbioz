/* =====================================================================
   LOCKSTEP: мир считается тактами по 1/60 с. На каждый такт у каждого игрока есть «ввод»
   (движение, прицел, зажатые навыки) и список действий. Свой ввод отправляется на D тактов
   вперёд; такт выполняется, только когда пришёл ввод всех игроков — поэтому мир у всех одинаков.
   Без сети (COOP.net=null) — тот же цикл, но второй герой стоит или управляется тестом.
   ===================================================================== */
const LS={dt:1/60,acc:0,D:4,t:0,inq:{},cmds:[],sentT:-1,waitT:0,hash:{},bad:0};
/* ввод этого устройства, округлённый до целых: у всех применяется одно и то же число */
function sampleInput(){
  const g=COOP.H[COOP.me],mv=(g.lvlOpen||g.shopOpen||g.treeOpen||COOP.W.paused)?{x:0,y:0}:readMove();
  let aim=0,ax=0,ay=0;
  if(mouse.on&&!uiTouch){const w=s2w(mouse.x,mouse.y);ax=Math.round(w.x);ay=Math.round(w.y);aim=1}
  let held=0;for(let i=0;i<5;i++)if(codes[SAVE.keys['s'+(i+1)]])held|=1<<i;
  return [Math.round(mv.x*100),Math.round(mv.y*100),ax,ay,aim,held];
}
function applyInput(h,q){
  if(!q)return;
  h.inp.x=q[0]/100;h.inp.y=q[1]/100;h.inp.ax=q[2];h.inp.ay=q[3];h.inp.aim=!!q[4];h.inp.held=q[5]|0;
}
function lsReset(){LS.acc=0;LS.t=0;LS.inq={};LS.cmds=[];LS.sentT=-1;LS.waitT=0;LS.hash={};LS.bad=0}
/* команда A(...) в сетевой игре — копится и уходит вместе с ближайшим вводом */
function netCmd(name,args){LS.cmds.push([name,args||[]])}
/* выполнить такт t: действия игроков по порядку, ввод, затем мир */
function lsRun(t){
  const slot=LS.inq[t]||{};
  withSim(()=>{
    for(let i=0;i<COOP.H.length;i++){const m=slot[i];if(!m)continue;applyInput(COOP.H[i],m.i);for(const c of (m.c||[]))runAct(i,c[0],c[1])}
    coopTick(LS.dt);
  });
  delete LS.inq[t];
  if(t%30===0){LS.hash[t]=stateHash();netHash(t,LS.hash[t])}
}
/* каждый кадр */
function coopFrame(raw){
  if(!COOP||mode!=='play')return;
  LS.acc=Math.min(LS.acc+raw,0.25);
  if(!COOP.net){
    /* без сети: свой ввод сразу, второй герой — как задаст тест (COOP.H[i].inp) */
    let n=0;
    while(LS.acc>=LS.dt&&n<6){LS.acc-=LS.dt;n++;
      const q=sampleInput();applyInput(COOP.H[COOP.me],q);
      const cm=LS.cmds;LS.cmds=[];
      withSim(()=>{for(const c of cm)runAct(COOP.me,c[0],c[1]);coopTick(LS.dt)});LS.t++}
    return;
  }
  let n=0;
  while(LS.acc>=LS.dt&&n<8){
    /* свой ввод на такт t+D (один раз на такт) */
    const st=LS.t+LS.D;
    if(LS.sentT<st){LS.sentT=st;const m={i:sampleInput(),c:LS.cmds};LS.cmds=[];(LS.inq[st]=LS.inq[st]||{})[COOP.me]=m;netSend({k:'in',t:st,m})}
    const slot=LS.inq[LS.t];
    const ready=LS.t<LS.D||(slot&&COOP.H.every((h,i)=>slot[i]));
    if(!ready){LS.waitT+=raw;break}
    LS.acc-=LS.dt;n++;LS.waitT=0;
    lsRun(LS.t);LS.t++;
  }
  const w=$('coopWait');if(w){const show=LS.waitT>0.5;if(w.hidden===show){w.hidden=!show;w.innerHTML='Ждём друга…<small>Соединение подвисло или друг свернул игру</small>'}}
}
/* приём ввода друга */
function lsRecv(from,m){
  if(m.k==='in'){(LS.inq[m.t]=LS.inq[m.t]||{})[from]=m.m}
  else if(m.k==='hash'){const mine=LS.hash[m.t];if(mine!==undefined&&mine!==m.h){LS.bad++;coopDesync(m.t)}}
}
/* отпечаток мира: если у игроков разный — значит, разошлись */
function stateHash(){
  let h=0;const add=v=>{h=(Math.imul(h^Math.round(v*16),16777619)+0x9e3779b9)|0};
  const W=COOP.W;add(W.wave);add(W.t*60);add(W.en.length);add(W.kills);
  for(const e of W.en){add(e.x);add(e.y);add(e.hp)}
  for(const q of COOP.H){add(q.p.x);add(q.p.y);add(q.p.hp);add(q.p.lv);add(q.p.gold)}
  return h>>>0;
}
