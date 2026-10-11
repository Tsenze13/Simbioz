/* =====================================================================
   ДРЕВО НАВЫКОВ (интерфейс)
   ===================================================================== */
let trSel=null;
function skillAvail(id){
  const g=G,a=AB[id];
  if(a.cat==='skill')return g.el[a.els[0]]>=1?'':(g.el[OPP[a.els[0]]]>0?'Стихия закрыта: у вас противоположная «'+EL[OPP[a.els[0]]].n+'»':'Нужна стихия «'+EL[a.els[0]].n+'»');
  if(symForbidden(id))return 'Запретный симбиоз противоположностей: только свитком у Чародея';
  return (g.el[a.pair[0]]>=2&&g.el[a.pair[1]]>=2)?'':'Нужны '+EL[a.pair[0]].n+' и '+EL[a.pair[1]].n+' ур.2+';
}
function treeBadge(){
  const g=G;if(!g)return;
  const b=$('treeBtn');if(!b)return;
  const n=g.sp,t=n>0?'Навыки · '+n+' (T)':'Навыки (T)';
  if(b.textContent!==t){b.textContent=t;b.classList.toggle('has',n>0)}
}
function openTree(){
  const g=G;
  if(!g||mode!=='play'||g.treeOpen||g.lvlOpen||g.shopOpen||g.paused||g.over)return;
  g.treeOpen=true;
  for(const k in codes)codes[k]=false;
  joy.on=false;joy.dx=joy.dy=0;
  if(!trSel||(trSel!=='__pas'&&trSel!=='__ult'&&!AB[trSel])){const f=g.slots.find(s=>s&&AB[s.id].cat!=='fuse');trSel=f?f.id:ELSK[g.start]}
  $('tree').hidden=false;renderTree();
}
function closeTree(){const g=G;if(!g)return;g.treeOpen=false;$('tree').hidden=true;$('tip').hidden=true;treeBadge()}
function slotOf(id){return G.slots.find(s=>s&&s.id===id)}
let trPv=null,trRaf=0;
function trLoop(){
  if($('tree').hidden||!trPv){trRaf=0;return}
  const t=performance.now()/1000,x=trPv.getContext('2d'),w=trPv.width/2,h=trPv.height/2;
  x.setTransform(2,0,0,2,0,0);x.clearRect(0,0,w,h);
  try{trPv._f(x,w,h,t)}catch(e){}
  x.globalCompositeOperation='source-over';x.globalAlpha=1;
  trRaf=requestAnimationFrame(trLoop);
}
function abPrev(id){const f=SP.AB[AB[id].n];if(!f)return null;return (x,w,h,t)=>{const k=Math.min(w/340,h/236)*1.05,p=Math.min(1,.12+((t*.5)%1.2));x.save();x.translate(w/2-SP.CX*k,h*.58-SP.CY*k);x.scale(k,k);f(x,p,t);x.restore()}}
function trThumbs(){
  $('trList').querySelectorAll('canvas.tth').forEach(cv=>{
    const id=cv.getAttribute('data-id'),f=SP.AB[AB[id]&&AB[id].n];const x=cv.getContext('2d');
    x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cv.width,cv.height);if(!f)return;
    const k=Math.min(cv.width/300,cv.height/200);x.save();x.translate(cv.width/2-SP.CX*k,cv.height*.6-SP.CY*k);x.scale(k,k);try{f(x,.55,1.3)}catch(e){}x.restore();
  });
}
function roleTag(a){return a.role?'<span class="rtag" style="color:'+ROLEC[a.role]+'">'+a.role+'</span>':''}
function renderTree(){
  const g=G;
  $('trSp').textContent='Очков навыков: '+g.sp+'. Очко за каждый уровень. Тратятся на навыки, мутации, пассивку героя и ульту (с '+ULT_LV+' уровня).';
  let h='<h4>Герой</h4>';
  h+='<button type="button" data-sk="__pas" class="'+(trSel==='__pas'?'sel':'')+'" style="--c1:'+EL[g.start].c+'"><span class="tl"><b>'+HPAS[g.start].n+'</b><span class="rtag" style="color:'+EL[g.start].c+'">пассивка</span></span><small>'+(g.pl||0)+'/3</small></button>';
  const ui=ultInfo();
  h+='<button type="button" data-sk="__ult" class="'+(trSel==='__ult'?'sel':'')+(g.ult.lv?'':' lock')+'" style="--c1:'+ui.c1+'"><span class="tl"><b>'+(g.ult.lv?ui.n:'Ульта')+'</b><span class="rtag" style="color:#ffd36b">ульта</span></span><small>'+(g.ult.lv?g.ult.lv+'/3':'🔒 '+ULT_LV)+'</small></button>';
  const row=id=>{
    const a=AB[id],s=slotOf(id),why=skillAvail(id);
    h+='<button type="button" data-sk="'+id+'" class="'+(trSel===id?'sel':'')+(why&&!s?' lock':'')+'" style="--c1:'+(a.c1||'#9cc4ff')+'"><canvas class="tth" data-id="'+id+'" width="104" height="60"></canvas><span class="tl"><b>'+a.n+'</b>'+(a.cat==='sym'?'<span class="rtag" style="color:'+a.c2+'">'+EL[a.pair[0]].n+' + '+EL[a.pair[1]].n+'</span>':roleTag(a))+'</span><small>'+(s?'ур.'+s.lv:(why?'🔒':'—'))+'</small></button>';
  };
  for(const k of EK){
    const blocked=g.el[OPP[k]]>0&&!g.el[k];
    h+='<h4 style="--ec:'+EL[k].c+'"><span class="eo"></span>'+EL[k].n+(g.el[k]?' · ур. '+g.el[k]:(blocked?' · закрыта':''))+'</h4>';
    SKILL_IDS.filter(id=>AB[id].els[0]===k).forEach(row);
  }
  h+='<h4>Симбиозы</h4>';SYM_IDS.forEach(row);
  $('trList').innerHTML=h;
  trThumbs();
  trPv=null;
  if(trSel==='__pas'){
    const H=HPAS[g.start],l=g.pl||0,col=EL[g.start].c;
    let d='<div class="th" style="--c1:'+col+'"><strong style="color:'+col+'">'+H.n+'</strong><span>Пассивка героя «'+CLS[g.start].n+'» · ур. '+l+'/3</span></div><p style="margin:0;color:#c5cbdd">Работает всегда. Каждый уровень стоит 1 очко навыков и открывается на нужном уровне героя.</p>';
    H.pd.forEach((t,i)=>{const done=i<l,next=i===l,ok=g.p.lv>=PASR[i];
      d+='<div class="nd'+(done?' max':'')+'" style="--c1:'+col+'"><div><strong>Уровень '+(i+1)+'</strong><p>'+t+'</p></div>'+(!done&&!ok?'<span class="rq">Нужен уровень героя '+PASR[i]+'</span>':'')+'<button type="button" data-pas="1"'+(next&&pasCan()?'':' disabled')+'>'+(done?'Открыто':'+1 · 1 очко')+'</button></div>'});
    $('trDet').innerHTML=d;return;
  }
  if(trSel==='__ult'){$('trDet').innerHTML=ultTreeHtml();return}
  const id=trSel,a=AB[id],s=slotOf(id),why=skillAvail(id);
  const col=a.c1||'#9cc4ff';
  let d='<div class="th" style="--c1:'+col+'"><strong style="color:'+col+'">'+a.n+'</strong><span>'+(a.cat==='sym'?'Симбиоз · ':(a.role?a.role+' · ':''))+'Мана '+a.mana+' · перезарядка '+a.cd+' с</span></div>';
  if(SP.AB[a.n])d+='<canvas class="trpv" id="trpv" width="880" height="416"></canvas>';
  d+='<p style="margin:0;color:#c5cbdd">'+a.d+'</p>';
  if(!s){
    const can=!why&&g.sp>0&&freeSlot()>=0;
    d+='<div class="nd" style="--c1:'+col+'"><div><strong>Открыть навык</strong><p>'+(why||(freeSlot()<0?'Нет места в хотбаре':'Стоимость: 1 очко. Навык появится в хотбаре.'))+'</p></div><button type="button" data-unlock="'+id+'"'+(can?'':' disabled')+'>Открыть · 1</button></div>';
  }else{
    const lv=s.lv;
    d+='<div class="nd'+(lv>=5?' max':'')+'" style="--c1:'+col+'"><div><strong>Усиление</strong> <span class="pips">'+[1,2,3,4,5].map(k=>'<i class="'+(k<=lv?'on':'')+'"></i>').join('')+'</span><p>'+(lv>=5?'Максимум.':'Следующий уровень: '+a.up[lv-1])+'</p></div><button type="button" data-core="'+id+'"'+(lv<5&&g.sp>0?'':' disabled')+'>+1 · 1 очко</button></div>';
  }
  const T=TREE[id];
  if(T){
    d+='<h4 style="margin:4px 0 0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim)">Мутации — меняют, как играется навык</h4>';
    T.forEach((n,i)=>{
      const r=nodeRank(id,i),need=NODE_REQ[i],lv=s?s.lv:0,ok=!!s&&lv>=need;
      d+='<div class="nd'+(r>=3?' max':'')+'" style="--c1:'+col+'"><div><strong>'+n.n+'</strong> <span class="pips">'+[1,2,3].map(k=>'<i class="'+(k<=r?'on':'')+'"></i>').join('')+'</span><p>'+n.d+' Каждый ранг усиливает эффект.</p></div>'+(ok?'':'<span class="rq">'+(s?'Нужен уровень усиления '+need:'Сначала откройте навык')+'</span>')+'<button type="button" data-node="'+id+':'+i+'"'+(ok&&r<3&&g.sp>0?'':' disabled')+'>'+(r>=3?'Макс.':'+1 · 1 очко')+'</button></div>';
    });
  }else if(s)d+='<p style="color:var(--dim)">У слитых навыков нет мутаций — они улучшаются картами уровня.</p>';
  $('trDet').innerHTML=d;
  const pv=$('trpv');if(pv){pv._f=abPrev(id);trPv=pv;if(!trRaf)trRaf=requestAnimationFrame(trLoop)}
}
function ultTreeHtml(){
  const g=G,ui=ultInfo();
  let d='<div class="th" style="--c1:#ffd36b"><strong style="color:#ffd36b">Ульта</strong><span>Очков навыков: '+g.sp+' · открыть с '+ULT_LV+' ур., уровни 2 и 3 — с '+ultNeedLv(2)+' и '+ultNeedLv(3)+' ур. героя</span></div>';
  if(!g.ult.kind){
    const lvOk=g.p.lv>=ULT_LV;
    d+='<p style="margin:0;color:#c5cbdd">Выберите направление ульты. Выбор один на забег. Ульта симбиоза доступна, если этот симбиоз уже изучен.</p>';
    const opt=(key,name,desc,ok,why,col)=>'<div class="nd" style="--c1:'+col+'"><div><strong>'+name+'</strong><p>'+desc+'</p></div>'+(ok?'':'<span class="rq">'+why+'</span>')+'<button type="button" data-ult="'+key+'"'+(ok&&lvOk&&g.sp>0?'':' disabled')+'>Выбрать · 1 очко</button></div>';
    d+=opt('hero','Ульта героя: '+ULT[g.start].n,ULT[g.start].d,true,'',EL[g.start].c);
    for(const id of SYM_IDS){
      if(!g.symKnown[id])continue;
      d+=opt('sym:'+id,symUltName(id),'«'+AB[id].n+'» тройной силы с вашими мутациями: главный удар в прицел и два отголоска рядом.',true,'',AB[id].c1);
    }
    if(!SYM_IDS.some(id=>g.symKnown[id]))d+='<p style="margin:0;color:var(--dim)">Ульты симбиозов появятся здесь, когда вы изучите симбиоз.</p>';
    if(!lvOk)d+='<p style="margin:0;color:#e0a46a">Ульта открывается с '+ULT_LV+' уровня героя (сейчас '+g.p.lv+').</p>';
    return d;
  }
  d+='<p style="margin:0;color:#c5cbdd"><b style="color:'+ui.c1+'">'+ui.n+'.</b> '+ui.d+'</p>';
  d+='<div class="nd'+(g.ult.lv>=3?' max':'')+'" style="--c1:#ffd36b"><div><strong>Уровень ульты</strong> <span class="pips">'+[1,2,3].map(k=>'<i class="'+(k<=g.ult.lv?'on':'')+'"></i>').join('')+'</span><p>Каждый уровень заметно усиливает урон и размах ульты.</p></div>'+(g.ult.lv<3&&!ultCanUp()?'<span class="rq">Нужен '+ultNeedLv(g.ult.lv+1)+' ур. героя</span>':'')+'<button type="button" data-ultlv="1"'+(ultCanUp()&&g.sp>0?'':' disabled')+'>'+(g.ult.lv>=3?'Макс.':'+1 · 1 очко')+'</button></div>';
  d+='<h4 style="margin:4px 0 0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim)">Печати симбиозов — добавляют ульте эффекты</h4>';
  for(const p of EK){
    if(p===g.start)continue;
    const sid=symFor(g.start,p);if(!sid)continue;
    const has=g.ult.seals[p],known=g.symKnown[sid];
    d+='<div class="nd'+(has?' max':'')+'" style="--c1:'+EL[p].c+'"><div><strong>Печать: '+ULTMOD[p]+'</strong><p>'+ULTMODD[p]+'.</p></div>'+(known||has?'':'<span class="rq">Нужен симбиоз «'+AB[sid].n+'»'+(symForbidden(sid)?' (только свитком)':'')+'</span>')+'<button type="button" data-seal="'+p+'"'+(!has&&known&&g.sp>0?'':' disabled')+'>'+(has?'Открыта':'Открыть · 1 очко')+'</button></div>';
  }
  return d;
}
$('trList').addEventListener('click',e=>{const b=e.target.closest('button[data-sk]');if(b){trSel=b.getAttribute('data-sk');renderTree()}});
$('trDet').addEventListener('click',e=>{
  const g=G,b=e.target.closest('button');
  if(!g||!b||b.disabled)return;
  if(b.hasAttribute('data-pas')){pasUp()}
  else if(b.hasAttribute('data-ult')){if(g.sp>0&&!g.ult.kind&&g.p.lv>=ULT_LV){g.sp--;g.ult.kind=b.getAttribute('data-ult')==='hero'?'hero':b.getAttribute('data-ult');g.ult.lv=1;g.ult.cd=0;g.dockSig='';sfx(880,0.2,'triangle',0.06,500);toast('Ульта открыта',ultInfo().n+' · клавиша '+keyName(SAVE.keys.ult))}}
  else if(b.hasAttribute('data-ultlv')){if(g.sp>0&&ultCanUp()){g.sp--;g.ult.lv++;g.dockSig='';sfx(820,0.14,'triangle',0.05,400)}}
  else if(b.hasAttribute('data-seal')){const p=b.getAttribute('data-seal');if(g.sp>0&&g.ult.kind&&!g.ult.seals[p]&&g.symKnown[symFor(g.start,p)]){g.sp--;g.ult.seals[p]=true;g.dockSig='';sfx(820,0.14,'triangle',0.05,400);toast('Печать: '+ULTMOD[p],ULTMODD[p])}}
  else if(b.hasAttribute('data-unlock')){const id=b.getAttribute('data-unlock');if(g.sp>0&&!skillAvail(id)&&learnSkill(id)){g.sp--;sfx(700,0.12,'triangle',0.05,300)}}
  else if(b.hasAttribute('data-core')){const s=slotOf(b.getAttribute('data-core'));if(s&&s.lv<5&&g.sp>0){s.lv++;g.sp--;g.dockSig='';sfx(700,0.12,'triangle',0.05,300)}}
  else if(b.hasAttribute('data-node')){
    const [id,i]=b.getAttribute('data-node').split(':'),ix=parseInt(i,10),s=slotOf(id);
    if(s&&g.sp>0&&s.lv>=NODE_REQ[ix]&&nodeRank(id,ix)<3){(g.nodes[id]=g.nodes[id]||{})['abc'[ix]]=nodeRank(id,ix)+1;g.sp--;g.dockSig='';sfx(820,0.14,'triangle',0.05,400);toast('Мутация: '+TREE[id][ix].n,AB[id].n)}
  }
  renderTree();treeBadge();
});
$('trClose').addEventListener('click',closeTree);
$('treeBtn').addEventListener('click',()=>{G&&G.treeOpen?closeTree():openTree()});

