/* ===== Hallenbühne: Werkstattmonitor, Shopfloor 06:45 und Ruhemodus in der Bildwelt =====
   1 Werkstattmonitor: jede Folie mit Vollbild-Foto, Überblendung im Takt der Folien, langsamer Zoom.
   2 Shopfloor: jede Folie mit eigenem Motiv; Eröffnung ganz im Bild, sonst Bildstreifen hinter dem Titel.
     Beim Weiterblättern fährt die Kamera ins neue Bild.
   3 Ruhemodus: Fotos wechseln langsam (Überblendung, Kamerazug), Uhr und Zahlen bleiben darüber.
   Stimmung: bei kritischer Warnlage färbt sich das Bild warm-rot. Nach Schichtende Nachtmotiv statt Halle.
   Gestaltung in buehne.css, Bilder aus der Bildwelt (MF_IMG / var(--img-*)). */
(function(){
'use strict';
var M=window.MF,RM=M.RM;
function night(){return window.MF_SUN?MF_SUN.dark():(function(h){return h<6||h>=17})(new Date().getHours())}
function hall(){return night()?'nacht':'halle'}
function mood(){try{var a=alerts(new Date());return a.some(function(x){return x.tone==='crit'})?'crit':a.length?'warn':'ok'}catch(e){return 'ok'}}
function layer(n,cls){return '<div class="'+(cls||'bn-l')+'" data-img="'+n+'" aria-hidden="true"><div class="bn-p" style="--kb:-'+(Date.now()/1000%60).toFixed(1)+'s"></div></div>'}

/* ---------- 1 Werkstattmonitor ---------- */
var MONK={Schicht:'steuer',Milkrun:'halle',Lager:'lager',Lage:'sys',Meldung:'komm'};
var om=window.openMon,mt=0;
window.openMon=function(){var r=om.apply(this,arguments);var m=$('#mon');if(!m)return r;
 /* Hintergrund anlegen; monDraw baut den Monitor je Durchlauf neu auf, daher bei jedem Abgleich prüfen */
 var bg=function(m2){if(m2.querySelector('.bn-bg'))return;var b=document.createElement('div');b.className='bn-bg';b.setAttribute('aria-hidden','true');
  b.innerHTML=Object.keys(MONK).map(function(k){var n=MONK[k]==='halle'?hall():MONK[k];return '<div class="bn-l" data-k="'+k+'" data-img="'+n+'"><div class="bn-p"></div></div>'}).join('');m2.insertBefore(b,m2.firstChild)};
 clearInterval(mt);var sync=function(){var m2=$('#mon');if(!m2){clearInterval(mt);return}bg(m2);var on=m2.querySelector('.sl.on .kk'),k=on?on.textContent:'Schicht';
  m2.querySelectorAll('.bn-l').forEach(function(l){var a=l.dataset.k===k;if(a!==l.classList.contains('on')){l.classList.toggle('on',a);if(a&&!RM){var p=l.firstChild;p.style.animation='none';void p.offsetWidth;p.style.animation=''}}});m2.dataset.mood=mood()};
 sync();mt=setInterval(sync,400);return r};

/* ---------- 2 Shopfloor 06:45 ---------- */
var SFI={open:'steuer',anw:'pers',ter:'steuer',sich:'pers',we:'lager',saw:'prod',sawk:'prod',w2:'halle',w1:'lager',wep:'pumpe',wv:'halle',s5:'prod',abs:'halle'};
var SID=['open','anw','ter','sich','we','saw','sawk','w2','w1','wep','wv','s5','abs'];
var ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);if(p!=='runde')return;var st=document.querySelector('.sf-stage');if(!st||st.querySelector('.bn-sf'))return;
 var i=Math.max(0,Math.min(S.ui.rp||0,SID.length-1)),id=SID[i],n=SFI[id]||'steuer';if(n==='halle')n=hall();
 st.classList.add('bn-on');if(id==='open')st.classList.add('bn-full');st.insertAdjacentHTML('afterbegin',layer(n,'bn-sf'));st.dataset.mood=mood()};

/* ---------- 4 Momente: das Licht leuchtet auf, wenn etwas geschafft ist ----------
   Milkrun-Runde beendet, Störung behoben; alle zehn Runden: stärker. Auch wenn es an einem anderen Gerät passiert. */
var SC=null;function score(){try{var mk=mkDay(todayIso()),m=Object.keys(mk).filter(function(k){return mk[k].e}).length,R=REG.qs,q=(S.reg.qs||[]).filter(function(e){return R.done.indexOf(e.st)>=0}).length;return {m:m,q:q,d:todayIso()}}catch(e){return null}}
function moment(){var s=score();if(!s)return;if(SC&&SC.d===s.d){var big=s.m>SC.m&&s.m===10,hit=s.m>SC.m||s.q>SC.q;if(hit){if(window.kino&&kino.flash)kino.flash(big);else if(window.logoSpin)logoSpin(big)}}SC=s}
var ar4=window.afterRender;window.afterRender=function(p){if(ar4)ar4(p);moment()};setInterval(moment,4000);

/* ---------- 5 Laufrad im Hintergrund ----------
   Das Munsch-Zeichen groß und kaum sichtbar am rechten Rand, das Laufrad dreht wie eine Pumpe im Betrieb:
   langsam außerhalb der Schicht, gleichmäßig während der Schicht, kurz schneller bei Erfolgen (Runde fertig, Störung behoben).
   Aus im ruhigen Modus und an der Station; bei reduzierter Bewegung stehend. */
var MK=null,SP=null,rate=1,goal=1,boost=0;
function markSvg(){var d=function(a){return 'M'+a.map(function(p){return p[0]+','+p[1]}).join('L')+'Z'},t='',w='';
 PARTS.forEach(function(p){if(p.g!=='t'&&p.g!=='w')return;var x='<path d="'+d(p.s[0])+'"/>';if(p.g==='t')t+=x;else w+=x});
 return '<svg viewBox="0 0 131 131" aria-hidden="true"><circle class="mk-r" cx="65.3" cy="65.3" r="62.3"/><circle class="mk-r2" cx="65.3" cy="65.3" r="54"/><g class="mk-t">'+t+'</g><g class="mk-w">'+w+'</g></svg>'}
function markOn(){return !document.documentElement.classList.contains('lite')&&!(window.isStation&&isStation())&&!$('#stn')&&(window.MF_LOGO!==0)}
function markBase(){try{var s=shiftInfo(new Date()).state;return s==='lauf'?1:.35}catch(e){return .5}}
function markInit(){if(MK||!window.PARTS)return;MK=document.createElement('div');MK.id='mark';MK.setAttribute('aria-hidden','true');MK.innerHTML=markSvg();
 var v=$('#vignette');document.body.insertBefore(MK,v||document.body.firstChild);
 var g=MK.querySelector('.mk-w');if(g.animate&&!RM){SP=g.animate([{transform:'rotate(0deg)'},{transform:'rotate(360deg)'}],{duration:48000,iterations:Infinity});
  (function tick(){if(!SP)return;goal=markBase()+boost;boost*=.985;rate+=(goal-rate)*.04;SP.playbackRate=Math.max(.05,rate);setTimeout(tick,120)})()}}
function markApply(){if(markOn()){markInit();if(MK)MK.hidden=false}else if(MK)MK.hidden=true}
window.logoSpin=function(big){boost=big?14:7;if(MK&&!RM){MK.classList.remove('flare');void MK.offsetWidth;MK.classList.add('flare')}};
setInterval(markApply,3000);markApply();
var fl0=window.kino&&kino.flash;if(fl0)kino.flash=function(big){fl0(big);logoSpin(big)};

/* ---------- 3 Ruhemodus ---------- */
var AL=['steuer','lager','prod','halle','pumpe','pers','sys'],ai=0,at=0;
var ao=window.ambientOn;window.ambientOn=function(){var r=ao.apply(this,arguments);var a=$('#amb');if(!a||a.querySelector('.bn-bg'))return r;
 var b=document.createElement('div');b.className='bn-bg';b.setAttribute('aria-hidden','true');a.insertBefore(b,a.firstChild);ai=0;
 var next=function(){var a2=$('#amb');if(!a2){clearInterval(at);return}var bg=a2.querySelector('.bn-bg'),n=AL[ai++%AL.length];if(n==='halle')n=hall();
  bg.insertAdjacentHTML('beforeend',layer(n));var l=bg.lastChild;requestAnimationFrame(function(){requestAnimationFrame(function(){l.classList.add('on')})});
  var old=bg.querySelectorAll('.bn-l');if(old.length>2)old[0].remove();if(old.length>1)setTimeout(function(){old[old.length-2].classList.remove('on')},2400);a2.dataset.mood=mood()};
 next();clearInterval(at);if(!RM)at=setInterval(next,16000);return r};
})();
