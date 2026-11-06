/* ===== Effektstufe und Lesbarkeit je Gerät =====
   Effekte: voll (Kino-Licht, Filmkorn, Kamerazüge) · ausgewogen (Fotos und Laufrad, ohne Kino-Licht und Korn,
   Bilder stehen) · ruhig (keine Bewegung, wie bisher „ruhig“). Ohne eigene Wahl schätzt das Gerät beim Start selbst:
   wenig Kerne oder Speicher, Touch ohne Maus → ausgewogen; Bereichs-Tablet → ruhig; sonst voll. Ruckelt das
   Kino-Licht trotz kleinster Auflösung, stuft das Gerät sich selbst auf ausgewogen herab (nur ohne eigene Wahl).
   Schrift: normal oder groß (für Hallengeräte, aus der Entfernung lesbar).
   Ersetzt die bisherigen Einzelschalter „Darstellung auf diesem Gerät“ und „Kino-Hintergrund an/aus“. */
(function(){
'use strict';
var M=window.MF,ls=M.ls,root=document.documentElement;
function auto(){if(ls('mflow.area'))return 'ruhig';var n=navigator,low=(n.deviceMemory&&n.deviceMemory<=4)||(n.hardwareConcurrency&&n.hardwareConcurrency<=4),touch=window.matchMedia&&matchMedia('(pointer:coarse)').matches&&!matchMedia('(pointer:fine)').matches;
 return low||touch?'mittel':'voll'}
/* früheres „Kino-Hintergrund: aus“ wird zu „ausgewogen“ */
if(ls('mflow.kino')==='off'){if(!ls('mflow.fx'))ls('mflow.fx','mittel');ls('mflow.kino',null)}
/* früheres „ruhig“ bleibt ruhig */
if(ls('mflow.lite')==='1'&&!ls('mflow.fx')&&!ls('mflow.area'))ls('mflow.fx','ruhig');
var LAST=null;
function level(){return ls('mflow.fx')||ls('mflow.fxauto')||auto()}
function apply(){var l=level();
 /* bestehende Schalter mitführen, damit kino.js und care.js unverändert gelten */
 if(l==='ruhig'){if(ls('mflow.lite')!=='1')ls('mflow.lite','1')}else if(ls('mflow.lite')==='1'&&!ls('mflow.area'))ls('mflow.lite',null);
 root.classList.toggle('fx-mid',l==='mittel');root.classList.toggle('lite',l==='ruhig'||!!ls('mflow.area'));
 root.classList.toggle('big',ls('mflow.big')==='1');
 var k=l+(root.classList.contains('lite')?'L':'');if(k!==LAST){LAST=k;if(window.kino&&kino.apply)kino.apply(true)}}
window.fxLevel=level;
/* Herabstufen auf Meldung von kino.js */
window.fxDowngrade=function(){if(ls('mflow.fx')||level()!=='voll')return;ls('mflow.fxauto','mittel');apply();try{toast('Effekte auf „ausgewogen“ gestellt, damit es flüssig bleibt')}catch(e){}};
apply();setInterval(apply,5000);

/* Einstellungen: eine Karte statt mehrerer Schalter */
var adm=VIEW.adm;VIEW.adm=function(){var h=adm.apply(this,arguments),l=level(),own=!!ls('mflow.fx'),b=ls('mflow.big')==='1';
 h=h.replace(/<section class="card"><div class="ch"><h2>Darstellung auf diesem Gerät<\/h2>[\s\S]*?<\/section>/,'');
 var seg=[['voll','voll'],['mittel','ausgewogen'],['ruhig','ruhig']].map(function(x){return '<button class="'+(l===x[0]?'on':'')+'" data-act="fxset" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('');
 var c=M.card('Darstellung auf diesem Gerät','<div class="fl" style="margin-bottom:8px">Effekte'+(own?'':' · automatisch gewählt')+'</div><div class="seg">'+seg+'</div>'+(own?'<button class="btn sm ghost" data-act="fxset" data-v="" style="margin-left:10px">automatisch</button>':'')
  +'<p class="dim" style="font-size:13px;margin:10px 0 0">Voll: Kino-Licht, Filmkorn, Kamerazüge. Ausgewogen: Fotos und Laufrad, ohne Kino-Licht und Korn. Ruhig: keine Bewegung, Rückmeldungen bleiben.</p>'
  +'<div class="fl" style="margin:18px 0 8px">Schrift</div><div class="seg"><button class="'+(b?'':'on')+'" data-act="bigset" data-v="0">normal</button><button class="'+(b?'on':'')+'" data-act="bigset" data-v="1">groß</button></div><p class="dim" style="font-size:13px;margin:10px 0 0">Groß: für Monitor und Tablets in der Halle, aus zwei bis drei Metern lesbar.</p>');
 /* nach dem Kopfbild einsetzen */
 var i=h.indexOf('<section class="ph"')===0?h.indexOf('</section>')+10:0;return h.slice(0,i)+c+h.slice(i)};
ACT.fxset=function(d){ls('mflow.fx',d.v||null);if(!d.v)ls('mflow.fxauto',null);apply();render()};
ACT.bigset=function(d){ls('mflow.big',d.v==='1'?'1':null);apply();render()};

/* Ruhe über Inhalten: sobald die Seite unter das Kopfbild scrollt, tritt das Licht zurück */
var raf=0;document.addEventListener('scroll',function(e){if(e.target.id!=='stage'||raf)return;raf=requestAnimationFrame(function(){raf=0;root.classList.toggle('deep',e.target.scrollTop>240)})},true);
var ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);var st=$('#stage');root.classList.toggle('deep',!!st&&st.scrollTop>240)};
})();
