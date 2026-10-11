/* =====================================================================
   СОХРАНЕНИЕ, ЗВУК, ВВОД
   ===================================================================== */
const SAVE_KEY='simbioz-save-v2';
function freshSave(){return {v:2,ess:40,best:0,runs:0,wins:0,meta:{},keys:Object.assign({},DEFKEYS),vol:0.7,muted:false,map:'ash'}}
let SAVE=freshSave();
(function loadSave(){
  try{
    const j=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(j&&j.v===2){
      SAVE=Object.assign(freshSave(),j);
      SAVE.keys=Object.assign({},DEFKEYS,j.keys||{});
      SAVE.meta=j.meta||{};
    }
  }catch(_){}
})();
function store(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE))}catch(_){}}
const DEBUG=(()=>{try{return localStorage.getItem('simbioz-debug')==='1'}catch(_){return false}})();

let KEYMAP={};
function rebuildKeys(){
  KEYMAP={};
  for(const a of ACTIONS){const c=SAVE.keys[a[0]];if(c)KEYMAP[c]=a[0]}
  const fixed=[['ArrowUp','up'],['ArrowDown','down'],['ArrowLeft','left'],['ArrowRight','right']];
  for(const f of fixed)if(!KEYMAP[f[0]])KEYMAP[f[0]]=f[1];
}
rebuildKeys();
function keyName(c){
  if(!c)return '—';
  if(c.startsWith('Key'))return c.slice(3);
  if(c.startsWith('Digit'))return c.slice(5);
  const m={Space:'Пробел',Enter:'Enter',Escape:'Esc',ShiftLeft:'Shift',ShiftRight:'Shift',ControlLeft:'Ctrl',AltLeft:'Alt',Tab:'Tab',Backquote:'~',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Minus:'-',Equal:'=',Comma:',',Period:'.',Slash:'/',Semicolon:';',Quote:"'",BracketLeft:'[',BracketRight:']',Backspace:'⌫'};
  return m[c]||c.replace('Numpad','Num');
}
const codes={};

let ac=null;
function sfx(f,d,type,v,slide){
  if(SAVE.muted||SAVE.vol<=0)return;
  try{
    if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();
    if(ac.state==='suspended')ac.resume();
    const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;
    o.type=type||'square';o.frequency.setValueAtTime(f,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+d);
    g.gain.setValueAtTime((v||0.04)*SAVE.vol*1.4,t);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
    o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+d);
  }catch(_){}
}
let lastKillSfx=0,lastBoltSfx=0,lastHitSfx=0;

