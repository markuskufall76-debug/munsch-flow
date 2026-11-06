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
var MK={Schicht:'steuer',Milkrun:'halle',Lager:'lager',Lage:'sys',Meldung:'komm'};
var om=window.openMon,mt=0;
window.openMon=function(){var r=om.apply(this,arguments);var m=$('#mon');if(!m)return r;
 if(!m.querySelector('.bn-bg')){var b=document.createElement('div');b.className='bn-bg';b.setAttribute('aria-hidden','true');
  b.innerHTML=Object.keys(MK).map(function(k){var n=MK[k]==='halle'?hall():MK[k];return '<div class="bn-l" data-k="'+k+'" data-img="'+n+'"><div class="bn-p"></div></div>'}).join('');m.insertBefore(b,m.firstChild)}
 clearInterval(mt);var sync=function(){var m2=$('#mon');if(!m2){clearInterval(mt);return}var on=m2.querySelector('.sl.on .kk'),k=on?on.textContent:'Schicht';
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
function moment(){var s=score();if(!s)return;if(SC&&SC.d===s.d&&window.kino&&kino.flash){if(s.m>SC.m)kino.flash(s.m===10);else if(s.q>SC.q)kino.flash(false)}SC=s}
var ar4=window.afterRender;window.afterRender=function(p){if(ar4)ar4(p);moment()};setInterval(moment,4000);

/* ---------- 3 Ruhemodus ---------- */
var AL=['steuer','lager','prod','halle','pumpe','pers','sys'],ai=0,at=0;
var ao=window.ambientOn;window.ambientOn=function(){var r=ao.apply(this,arguments);var a=$('#amb');if(!a||a.querySelector('.bn-bg'))return r;
 var b=document.createElement('div');b.className='bn-bg';b.setAttribute('aria-hidden','true');a.insertBefore(b,a.firstChild);ai=0;
 var next=function(){var a2=$('#amb');if(!a2){clearInterval(at);return}var bg=a2.querySelector('.bn-bg'),n=AL[ai++%AL.length];if(n==='halle')n=hall();
  bg.insertAdjacentHTML('beforeend',layer(n));var l=bg.lastChild;requestAnimationFrame(function(){requestAnimationFrame(function(){l.classList.add('on')})});
  var old=bg.querySelectorAll('.bn-l');if(old.length>2)old[0].remove();if(old.length>1)setTimeout(function(){old[old.length-2].classList.remove('on')},2400);a2.dataset.mood=mood()};
 next();clearInterval(at);if(!RM)at=setInterval(next,16000);return r};
})();
