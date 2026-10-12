/* =====================================================================
   ДЕЙСТВИЯ ИГРОКА. Всё, что меняет игру по нажатию (навык, рывок, карточка, лавка, древо…),
   идёт через A(имя, …аргументы). В одиночной игре действие выполняется сразу,
   в совместной — уходит в сеть и выполняется у обоих в один и тот же такт (net/lockstep.js).
   ===================================================================== */
const ACTF={
  cast:i=>castSlot(i),ult:()=>castUlt(),dash:()=>tryDash(),item:i=>useItem(i),auto:i=>toggleAuto(i),
  use:()=>interact(),skip:()=>skipWave(),pick:i=>pickCard(i),pas:()=>pasUp(),
  tree:(a,v)=>treeAct(a,v),shop:(k,mi,a,b)=>shopAct(k,mi,a,b),
  openTree:()=>openTree(),closeTree:()=>closeTree(),closeShop:()=>closeShop(),
  pause:()=>togglePause(),chanPtr:i=>{G.chanPtr=i}
};
function A(name,...args){
  if(COOP&&COOP.net)return netCmd(name,args);
  const f=ACTF[name];if(!f)return;
  return f(...args);
}
/* выполнить действие от имени героя k (вызывает сеть) */
function runAct(k,name,args){
  const f=ACTF[name];if(!f||!COOP)return;
  const me=G;G=COOP.H[k];
  try{f(...(args||[]))}catch(e){console.error(e)}finally{G=me}
}
