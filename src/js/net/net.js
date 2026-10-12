/* =====================================================================
   СЕТЬ: комната по коду, прямое соединение WebRTC между игроками.
   Сервера у игры нет. Чтобы найти друг друга, игроки на минуту встречаются в публичном
   «почтовом ящике» (MQTT-брокер по WebSocket) под темой с кодом комнаты и обмениваются
   данными соединения. Дальше всё идёт напрямую. Запасные пути:
     • «вручную» — обменяться длинными кодами через мессенджер;
     • «в этом браузере» (BroadcastChannel) — две вкладки на одном компьютере (для проверки).
   ===================================================================== */
const NET={st:'idle',pc:null,dc:null,sig:null,id:'',code:'',host:false,peer:null,onmsg:null,log:[],me:null,friend:null,lobby:null};
const ICE=[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']},{urls:'stun:global.stun.twilio.com:3478'},
  {urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443','turn:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'}];
const BROKERS=['wss://broker.emqx.io:8084/mqtt','wss://broker.hivemq.com:8884/mqtt','wss://test.mosquitto.org:8081/mqtt'];
const CODE_ABC='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function gameVer(){const s=document.querySelector('.mfoot span:last-child');return s?s.textContent.split('·')[0].trim():'?'}
function nlog(s){NET.log.push(s);if(NET.log.length>30)NET.log.shift();if(typeof lobbyRender==='function')lobbyRender()}
function rid(n,abc){abc=abc||CODE_ABC;let s='';for(let i=0;i<n;i++)s+=abc[Math.floor(VR()*abc.length)];return s}

/* ---------- MQTT 3.1.1 поверх WebSocket (только то, что нужно: connect / subscribe / publish / ping) ---------- */
function mqttOpen(url,topic,onJson){
  return new Promise((resolve,reject)=>{
    let ws;try{ws=new WebSocket(url,'mqtt')}catch(e){reject(e);return}
    ws.binaryType='arraybuffer';
    const enc=new TextEncoder(),dec=new TextDecoder();
    const str=s=>{const b=enc.encode(s);return [b.length>>8,b.length&255,...b]};
    const pkt=(h,body)=>{const L=[];let n=body.length;do{let d=n%128;n=Math.floor(n/128);if(n>0)d|=128;L.push(d)}while(n>0);const u=new Uint8Array(1+L.length+body.length);u[0]=h;u.set(L,1);u.set(body,1+L.length);return u};
    let buf=new Uint8Array(0),ping=0,ok=false;
    const to=setTimeout(()=>{if(!ok){try{ws.close()}catch(_){}reject(new Error('timeout'))}},6000);
    ws.onopen=()=>{
      const cid='sb'+rid(10);
      ws.send(pkt(0x10,[...str('MQTT'),4,0x02,0,60,...str(cid)]));
    };
    ws.onmessage=ev=>{
      const a=new Uint8Array(ev.data),nb=new Uint8Array(buf.length+a.length);nb.set(buf);nb.set(a,buf.length);buf=nb;
      while(buf.length>=2){
        let mul=1,len=0,i=1,d;
        do{if(i>=buf.length)return;d=buf[i++];len+=(d&127)*mul;mul*=128}while(d&128);
        if(buf.length<i+len)return;
        const h0=buf[0],type=h0>>4,body=buf.slice(i,i+len);buf=buf.slice(i+len);
        if(type===2){ok=true;clearTimeout(to);ws.send(pkt(0x82,[0,1,...str(topic),0]));ping=setInterval(()=>{try{ws.send(new Uint8Array([0xC0,0]))}catch(_){}},25000)}
        else if(type===9){resolve(api)}
        else if(type===3){const qos=(h0>>1)&3,tl=(body[0]<<8)|body[1];let p=2+tl;if(qos>0)p+=2;
          try{onJson(JSON.parse(dec.decode(body.slice(p))))}catch(_){}}
      }
    };
    ws.onerror=()=>{clearTimeout(to);if(!ok)reject(new Error('ws'))};
    ws.onclose=()=>{clearInterval(ping);if(api.onclose)api.onclose()};
    const api={send(o){try{ws.send(pkt(0x30,[...str(topic),...enc.encode(JSON.stringify(o))]))}catch(_){}},close(){clearInterval(ping);try{ws.send(new Uint8Array([0xE0,0]));ws.close()}catch(_){}},onclose:null,url};
  });
}
/* сигнальный канал: брокер по номеру из кода комнаты, либо BroadcastChannel */
async function sigOpen(code,onJson){
  const cb=onJson;onJson=m=>{Promise.resolve().then(()=>cb(m)).catch(e=>nlog('Ошибка соединения: '+(e&&e.message||e)))};
  if(code[0]==='0'){const bc=new BroadcastChannel('simbioz-'+code);bc.onmessage=e=>onJson(e.data);return {send:o=>bc.postMessage(JSON.parse(JSON.stringify(o))),close:()=>bc.close(),url:'вкладки этого браузера'}}
  const bi=parseInt(code[0],10)-1,order=[bi,...BROKERS.map((_,i)=>i).filter(i=>i!==bi)];
  let lastErr;
  for(const i of order.slice(0,1)){ /* брокер задаёт код — у обоих один и тот же */
    try{return await mqttOpen(BROKERS[i],'simbioz/v1/'+code,onJson)}catch(e){lastErr=e}
  }
  throw lastErr||new Error('broker');
}
async function pickBroker(){
  for(let i=0;i<BROKERS.length;i++){
    try{const s=await mqttOpen(BROKERS[i],'simbioz/v1/probe'+rid(4),()=>{});s.close();return i}catch(_){nlog('Сервер встреч '+(i+1)+' недоступен')}
  }
  return -1;
}
/* ---------- WebRTC ---------- */
function pcNew(){
  const pc=new RTCPeerConnection({iceServers:ICE});
  const RU={new:'новое',connecting:'устанавливается',connected:'есть',disconnected:'прервалось',failed:'не удалось',closed:'закрыто'};
  pc.onconnectionstatechange=()=>{
    if(NET.pc!==pc)return;
    const s=pc.connectionState;nlog('Соединение: '+(RU[s]||s));
    if(s==='failed'||s==='closed')netLost();
    /* «прервалось» бывает на секунду (смена сети) — ждём 6 с, вдруг восстановится */
    else if(s==='disconnected')setTimeout(()=>{if(NET.pc===pc&&pc.connectionState!=='connected')netLost()},6000);
  };
  return pc;
}
function dcBind(dc){
  NET.dc=dc;
  dc.onopen=()=>{if(NET.dc!==dc)return;NET.st='open';nlog('Канал открыт');if(NET.sig){setTimeout(()=>{try{NET.sig.close()}catch(_){}NET.sig=null},1500)}netHello()};
  dc.onclose=()=>{if(NET.dc===dc)netLost()};
  dc.onmessage=e=>{if(NET.dc!==dc)return;let m;try{m=JSON.parse(e.data)}catch(_){return}netRecv(m)};
}
function waitIce(pc){return new Promise(r=>{if(pc.iceGatheringState==='complete'){r();return}const t=setTimeout(r,4000);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(t);r()}})})}

/* ---------- создать комнату / войти ---------- */
async function netHost(local){
  netClose();
  NET.host=true;NET.id=rid(8);NET.st='wait';
  let bi=0;
  if(local)NET.code='0'+rid(4,'0123456789');
  else{nlog('Ищем сервер встреч…');bi=await pickBroker();if(bi<0){NET.st='err';nlog('Серверы встреч недоступны — попробуйте «вручную»');return}NET.code=(bi+1)+rid(4,'0123456789')}
  try{NET.sig=await sigOpen(NET.code,hostSig)}catch(e){NET.st='err';nlog('Не удалось открыть комнату: '+e.message);return}
  nlog('Комната '+NET.code+' открыта. Ждём друга…');
}
async function hostSig(m){
  if(!m||m.f===NET.id)return;
  if(m.t==='hello'&&NET.st==='wait'){
    NET.peer=m.f;NET.st='link';nlog('Друг нашёлся, соединяемся…');
    const pc=NET.pc=pcNew();
    pc.onicecandidate=e=>{if(e.candidate&&NET.sig)NET.sig.send({f:NET.id,to:NET.peer,t:'ice',d:e.candidate})};
    dcBind(pc.createDataChannel('game',{ordered:true}));
    await pc.setLocalDescription(await pc.createOffer());
    NET.sig.send({f:NET.id,to:NET.peer,t:'offer',d:pc.localDescription});
  }else if(m.t==='hello'&&m.f!==NET.peer&&NET.sig)NET.sig.send({f:NET.id,to:m.f,t:'full'});
  else if(m.to===NET.id&&m.t==='answer'&&NET.pc)await NET.pc.setRemoteDescription(m.d);
  else if(m.to===NET.id&&m.t==='ice'&&NET.pc){try{await NET.pc.addIceCandidate(m.d)}catch(_){}}
}
async function netJoin(code){
  netClose();
  code=(code||'').replace(/\D/g,'');
  if(code.length!==5||code[0]>'3'){nlog('Код — 5 цифр, первая от 0 до 3. Проверьте код');return}
  NET.host=false;NET.id=rid(8);NET.code=code;NET.st='join';
  try{NET.sig=await sigOpen(code,joinSig)}catch(e){NET.st='err';nlog('Не удалось подключиться к серверу встреч — попробуйте «вручную»');return}
  nlog('Ищем комнату '+code+'…');
  let n=0;const hi=setInterval(()=>{if(NET.st!=='join'||!NET.sig){clearInterval(hi);return}if(++n>40){clearInterval(hi);NET.st='err';nlog('Комната не отвечает. Проверьте код');return}NET.sig.send({f:NET.id,t:'hello'})},1500);
  NET.sig.send({f:NET.id,t:'hello'});
}
async function joinSig(m){
  if(!m||m.f===NET.id||(m.to&&m.to!==NET.id))return;
  if(m.t==='full'){NET.st='err';nlog('В комнате уже двое');return}
  if(m.t==='offer'&&NET.st==='join'){
    NET.peer=m.f;NET.st='link';nlog('Комната найдена, соединяемся…');
    const pc=NET.pc=pcNew();
    pc.onicecandidate=e=>{if(e.candidate&&NET.sig)NET.sig.send({f:NET.id,to:NET.peer,t:'ice',d:e.candidate})};
    pc.ondatachannel=e=>dcBind(e.channel);
    await pc.setRemoteDescription(m.d);
    await pc.setLocalDescription(await pc.createAnswer());
    NET.sig.send({f:NET.id,to:NET.peer,t:'answer',d:pc.localDescription});
  }else if(m.t==='ice'&&NET.pc){try{await NET.pc.addIceCandidate(m.d)}catch(_){}}
}
/* ---------- вручную: длинные коды ---------- */
async function zip(o){const s=new Blob([JSON.stringify(o)]).stream().pipeThrough(new CompressionStream('deflate-raw'));const b=new Uint8Array(await new Response(s).arrayBuffer());let t='';for(const x of b)t+=String.fromCharCode(x);return btoa(t).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
async function unzip(s){s=s.trim().replace(/-/g,'+').replace(/_/g,'/');const t=atob(s),b=new Uint8Array(t.length);for(let i=0;i<t.length;i++)b[i]=t.charCodeAt(i);const st=new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate-raw'));return JSON.parse(await new Response(st).text())}
async function manualOffer(){
  netClose();NET.host=true;NET.st='manual';
  const pc=NET.pc=pcNew();dcBind(pc.createDataChannel('game',{ordered:true}));
  await pc.setLocalDescription(await pc.createOffer());await waitIce(pc);
  return await zip({t:'o',s:pc.localDescription.sdp});
}
async function manualAnswer(code){
  netClose();NET.host=false;NET.st='manual';
  const o=await unzip(code);if(o.t!=='o')throw new Error('Это не код приглашения');
  const pc=NET.pc=pcNew();pc.ondatachannel=e=>dcBind(e.channel);
  await pc.setRemoteDescription({type:'offer',sdp:o.s});
  await pc.setLocalDescription(await pc.createAnswer());await waitIce(pc);
  return await zip({t:'a',s:pc.localDescription.sdp});
}
async function manualFinish(code){
  const o=await unzip(code);if(o.t!=='a')throw new Error('Это не код ответа');
  await NET.pc.setRemoteDescription({type:'answer',sdp:o.s});
}
/* ---------- обмен сообщениями ---------- */
/* большие сообщения (снимок мира) режем на куски: между браузерами предел одного сообщения ~64 КБ */
const PART=16000;let partN=0;
function netSend(m){
  if(!NET.dc||NET.dc.readyState!=='open')return;
  /* отладка: искусственная задержка сети (порядок сохраняется) */
  if(NET.lag&&!m._l){const at=Math.max(NET.lagAt||0,performance.now()+NET.lag+VR()*(NET.jit||0));NET.lagAt=at;const c=Object.assign({},m,{_l:1});setTimeout(()=>netSend(c),at-performance.now());return}
  if(m._l)delete m._l;
  try{const s=JSON.stringify(m);
    if(s.length<=PART){NET.dc.send(s);return}
    const id=++partN,n=Math.ceil(s.length/PART);
    for(let i=0;i<n;i++)NET.dc.send(JSON.stringify({k:'part',id,i,n,d:s.slice(i*PART,(i+1)*PART)}));
  }catch(e){nlog('Не удалось отправить: '+(e&&e.message||e))}
}
const PARTS={};
function netPart(m){
  const P=PARTS[m.id]=PARTS[m.id]||{n:m.n,got:0,a:[]};
  if(P.a[m.i]===undefined){P.a[m.i]=m.d;P.got++}
  if(P.got===P.n){delete PARTS[m.id];let o;try{o=JSON.parse(P.a.join(''))}catch(_){return}netRecv(o)}
}
function netHello(){NET.me=lobbyMe();netSend({k:'hello',ver:gameVer(),p:NET.me});NET.rtt=0;clearInterval(NET.pingT);NET.pingT=setInterval(()=>{if(NET.st!=='open'){clearInterval(NET.pingT);return}netSend({k:'ping',t:performance.now()});if(!COOP)lobbyPing()},1000)}
function netRecv(m){
  if(m.k==='part'){netPart(m);return}
  if(m.k==='ping'){netSend({k:'pong',t:m.t});return}
  if(m.k==='pong'){const r=performance.now()-m.t;NET.rtt=NET.rtt?NET.rtt*0.7+r*0.3:r;return}
  if(m.k==='in'||m.k==='hash'){if(COOP&&COOP.net)lsRecv(NET.host?1:0,m);return}
  if(m.k==='hello'){
    if(m.ver!==gameVer()){nlog('У друга другая версия игры ('+m.ver+'). Обновите страницу у обоих');NET.verBad=true}
    NET.friend=m.p;nlog('Друг: '+m.p.name);lobbyRender();return}
  if(m.k==='me'){NET.friend=m.p;lobbyRender();return}
  if(m.k==='start'&&!NET.host){coopStart(Object.assign({},m.cfg,{me:1,net:true}));return}
  if(m.k==='snap'){if(COOP&&COOP.net)coopApplySnap(m);return}
  if(m.k==='leave'){if(COOP&&COOP.net){coopSolo(NET.friend&&NET.friend.name||'Друг',' вышел в меню')}return}
  if(m.k==='bye'){netLost();return}
}
function netHash(t,h){netSend({k:'hash',t,h,e:COOP.ep|0})}
function netLost(){
  if(NET.st==='closed')return;
  const was=NET.st;NET.st='closed';
  if(COOP&&COOP.net)coopSolo('Связь с другом',' потеряна');
  if(was==='open'||was==='link')nlog('Связь потеряна');
  lobbyRender();
}
function netClose(){
  try{if(NET.dc&&NET.dc.readyState==='open')NET.dc.send(JSON.stringify({k:'bye'}))}catch(_){}
  const {sig,dc,pc}=NET;NET.sig=NET.dc=NET.pc=null;
  try{sig&&sig.close()}catch(_){}try{dc&&dc.close()}catch(_){}try{pc&&pc.close()}catch(_){}NET.st='idle';NET.friend=null;NET.peer=null;NET.verBad=false;
}
/* хозяин запускает забег */
function netStartGame(){
  if(!NET.host||!NET.friend||NET.st!=='open')return;
  /* задержка ввода под пинг: ввод должен успеть долететь до того, как такт выполнится */
  const D=clamp(Math.ceil((NET.rtt||60)/2/(1000/60))+3,4,14);
  const cfg={D,seed:(VR()*2**31)|0,ch:clamp(SAVE.chSel||1,1,SAVE.ch||1),asc:Math.min(SAVE.ascSel||0,SAVE.asc||0),heroes:[lobbyMe(),NET.friend]};
  netSend({k:'start',cfg});
  coopStart(Object.assign({},cfg,{me:0,net:true}));
}
/* рассинхрон: хозяин присылает состояние, гость его принимает */
function coopDesync(t){
  if(!COOP||!COOP.net)return;
  nlog('Рассинхрон на такте '+t);
  if(NET.host&&!COOP.snapT){
    COOP.snapT=LS.t;
    const s=coopSnap();netSend(s);
    /* хозяин тоже «перезагружается» из того же снимка: у обоих одинаково пропадут функции-отложки */
    const own=JSON.parse(JSON.stringify(s));own.self=true;coopApplySnap(own);
  }
}
