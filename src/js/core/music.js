
/* =====================================================================
   МУЗЫКА — генерируется кодом (Web Audio), без файлов.
   Своё настроение на каждую карту, отдельная тема босса, спокойная — в меню и передышке.
   Громкость: SAVE.vol (общая) × SAVE.mus (музыка).
   ===================================================================== */
const MUS=(function(){
  const MOODS={
    menu:{root:45,sc:[0,2,3,5,7,8,10],bpm:76,prog:[0,5,3,4]},
    ash:{root:45,sc:[0,2,3,5,7,8,10],bpm:96,prog:[0,5,2,4]},
    forest:{root:50,sc:[0,2,4,7,9],bpm:88,prog:[0,3,1,4]},
    ice:{root:52,sc:[0,2,3,7,8],bpm:80,prog:[0,3,2,1]},
    lava:{root:43,sc:[0,1,4,5,7,8,10],bpm:104,prog:[0,1,5,4]},
    dunes:{root:47,sc:[0,1,4,5,7,8,11],bpm:96,prog:[0,1,0,5]},
    storm:{root:48,sc:[0,2,3,5,7,9,10],bpm:112,prog:[0,6,5,4]},
    boss:{root:41,sc:[0,1,3,5,6,8,10],bpm:134,prog:[0,1,5,4]}
  };
  let mg=null,noise=null,timer=0,next=0,step=0,ci=0,mood='menu',calm=true,want=0;
  const mtof=m=>440*Math.pow(2,(m-69)/12);
  function deg(M,d,oct){const n=M.sc.length,o=Math.floor(d/n);return M.root+12*(oct+o)+M.sc[((d%n)+n)%n]}
  function init(){
    if(mg||!ac)return;
    mg=ac.createGain();mg.gain.value=0;mg.connect(ac.destination);
    const len=ac.sampleRate*0.5;noise=ac.createBuffer(1,len,ac.sampleRate);
    const d=noise.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
    timer=setInterval(sched,90);next=ac.currentTime+0.1;
  }
  function tone(f,t,dur,type,vol,cut,att){
    const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;
    let out=o;
    if(cut){const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=cut;o.connect(fl);out=fl}
    out.connect(g);g.connect(mg);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+(att||0.01));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.start(t);o.stop(t+dur+0.05);
  }
  function hat(t,vol){const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noise;f.type='highpass';f.frequency.value=7000;s.connect(f);f.connect(g);g.connect(mg);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.05);s.start(t);s.stop(t+0.06)}
  function kick(t,vol){const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+0.16);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.22);o.connect(g);g.connect(mg);o.start(t);o.stop(t+0.25)}
  function sched(){
    if(!ac||!mg)return;
    const v=SAVE.muted?0:SAVE.vol*(SAVE.mus===undefined?0.5:SAVE.mus)*0.55;
    mg.gain.setTargetAtTime(v*want,ac.currentTime,0.6);
    if(ac.state!=='running'||v<=0||want<=0){next=Math.max(next,ac.currentTime+0.05);return}
    const M=MOODS[mood]||MOODS.ash,s16=60/M.bpm/4,boss=mood==='boss';
    while(next<ac.currentTime+0.25){
      const t=next,st=step%16,ch=M.prog[ci%M.prog.length];
      if(st===0){
        for(const k of [0,2,4])tone(mtof(deg(M,ch+k,0)),t,s16*16,'sawtooth',boss?0.018:0.022,boss?1200:800,0.4);
      }
      if(st%(calm?8:4)===0)tone(mtof(deg(M,ch,-1)),t,s16*(calm?7:3.5),boss?'square':'triangle',boss?0.05:0.06,boss?600:500,0.01);
      if(!calm||st%4===0){const ap=[0,2,4,7,4,2,0,4][(step>>1)%8];if(st%2===0)tone(mtof(deg(M,ch+ap,1)),t,s16*1.6,'triangle',calm?0.016:0.022,0,0.005)}
      if(!calm){
        if(boss?st%4===0:st%8===0)kick(t,boss?0.22:0.16);
        if(st%2===1)hat(t,boss?0.03:0.018);
      }
      next+=s16;step++;if(step%16===0)ci++;
    }
  }
  /* вызывается каждый кадр: выбирает настроение по состоянию игры */
  function update(){
    if(!ac)return;
    init();
    let m='menu',c=true,w=1;
    if(mode!=='menu'&&G){
      if(G.over){w=0}
      else if(G.bossRef&&!G.bossRef.dead&&G.phase==='fight'){m='boss';c=false}
      else{m=MOODS[G.map]?G.map:'ash';c=G.phase!=='fight'}
      if(G.paused)w=0.35;
    }
    if(m!==mood){mood=m;ci=0;step=0}
    calm=c;want=w;
  }
  return {update,get mood(){return mood}};
})();
/* звук в браузере можно включить только после действия игрока */
function audioWake(){try{if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume()}catch(_){}}
addEventListener('pointerdown',audioWake);addEventListener('keydown',audioWake);
