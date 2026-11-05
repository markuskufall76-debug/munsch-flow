/* ===== Kino und Rückmeldung =====
   1. Rückmeldung: Ton, Vibration und Erfolgsszene bei Scan, Einlagern, Milkrun, Station (abschaltbar)
   2. Alarm-Szene: neue kritische Lage erscheint als Banner, auf dem Hallenmonitor als Vollbild
   3. Seitenwechsel mit Richtung und Lichtkante
   4. Rundgang für neue Kollegen
   5. Installierbar und offline startfähig (nur mit Zentrale) */
(function(){
'use strict';
var M=window.MF,RM=M.RM;

/* ---------- 1. Rückmeldung ---------- */
var AC=null;function ac(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC}catch(e){return null}}
document.addEventListener('pointerdown',function(){ac()},{once:true,capture:true});
function tone(seq){if(S.ui.snd===0)return;var a=ac();if(!a)return;var t=a.currentTime;seq.forEach(function(s){var o=a.createOscillator(),g=a.createGain();o.type=s[3]||'sine';o.frequency.value=s[0];g.gain.setValueAtTime(0,t+s[1]);g.gain.linearRampToValueAtTime(.18,t+s[1]+.01);g.gain.exponentialRampToValueAtTime(.0001,t+s[1]+s[2]);o.connect(g).connect(a.destination);o.start(t+s[1]);o.stop(t+s[1]+s[2]+.02)})}
function buzz(p){try{if(S.ui.vib!==0&&navigator.vibrate)navigator.vibrate(p)}catch(e){}}
function burst(ok){if(RM)return;var b=document.createElement('div');b.className='burst '+(ok?'ok':'no');b.innerHTML=ok?'<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44"/><path d="M38 62l15 15 30-34"/></svg>':'<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44"/><path d="M42 42l36 36M78 42 42 78"/></svg>';document.body.appendChild(b);setTimeout(function(){b.remove()},900)}
window.fx={ok:function(big){tone([[880,0,.09],[1320,.09,.16]]);buzz(30);if(big)burst(true)},err:function(){tone([[196,0,.22,'square'],[165,.12,.24,'square']]);buzz([80,40,80]);burst(false)},tick:function(){tone([[1046,0,.06]]);buzz(12)}};
var fi0=window.fachIn;window.fachIn=function(){var r=fi0.apply(this,arguments);if(r)fx.ok(true);else fx.err();return r};
['mks','mke','mkx','stmk','stadd','stfaus','chkt','radd'].forEach(function(k){var f=ACT[k];if(f)ACT[k]=function(){var r=f.apply(this,arguments);fx.tick();return r}});
var st0=ACT.stundo;if(st0)ACT.stundo=function(){st0.apply(this,arguments);fx.tick()};

/* ---------- 2. Alarm-Szene ---------- */
var seen=null;
function critKeys(){try{return alerts(new Date()).filter(function(a){return a.tone==='crit'})}catch(e){return []}}
function alarmCheck(){var C=critKeys(),keys=C.map(function(a){return a.t});if(seen===null){seen=keys;return}var neu=C.filter(function(a){return seen.indexOf(a.t)<0});seen=keys;if(!neu.length)return;var a=neu[0];
 if($('#mon')){var s=document.createElement('div');s.id='alarm';s.innerHTML='<div class="al-in"><div class="al-k">Achtung</div><div class="al-t">'+esc(a.t)+'</div><div class="al-s">'+esc(new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}))+' Uhr</div></div>';$('#mon').appendChild(s);/* im Vollbild ist nur der Monitor sichtbar, daher hinein statt an body */tone([[660,0,.25],[523,.3,.25],[660,.6,.25],[523,.9,.4]]);setTimeout(function(){s.classList.add('out');setTimeout(function(){s.remove()},800)},9000);return}
 if(!$('#stage'))return;var o=$('#albar');if(o)o.remove();var b=document.createElement('div');b.id='albar';b.setAttribute('role','alert');b.innerHTML='<i></i><span><b>Neu</b> '+esc(a.t)+'</span><button class="btn sm" data-act="alg" data-go="'+a.go+'">Ansehen</button><button class="btn sm ghost" data-act="alx" aria-label="Schließen">✕</button>';document.body.appendChild(b);fx.err();clearTimeout(alarmCheck.t);alarmCheck.t=setTimeout(function(){var x=$('#albar');if(x)x.remove()},12000)}
ACT.alg=function(d){var x=$('#albar');if(x)x.remove();go(d.go)};ACT.alx=function(){var x=$('#albar');if(x)x.remove()};
var ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);alarmCheck()};
setInterval(alarmCheck,20000);

/* ---------- 3. Seitenwechsel mit Richtung ---------- */
function idx(p){var all=['mein','heute','lage','runde','frist','chk','fluss','woche','tag','fach','milk','vork','wep','we','mw','wv','tb','tz','qs','auf','mas','aud','s5','urlaub','gespr','plan','schicht','quali','funk','brett','adm','verl','ausw','imp','ber','train'];var i=all.indexOf(p);return i<0?99:i}
var go0=window.go;window.go=function(p){var from=S.ui.page;if(!RM&&from&&p!==from&&idx(p)!==99){document.documentElement.dataset.dir=idx(p)>=idx(from)?'f':'b';if(document.startViewTransition){var l=document.createElement('div');l.className='sweep';document.body.appendChild(l);setTimeout(function(){l.remove()},700)}}return go0.apply(this,arguments)};

/* ---------- 4. Rundgang ---------- */
var TOUR=[
 ['.rail','Bereiche','Links liegen die Bereiche: Steuerung, Lager, Produktion, Personal, Kommunikation, System. Antippen öffnet die Seiten des Bereichs.'],
 ['.srch','Suchen und fragen','Mit Strg K oder / findest du jede Seite, jeden Auftrag (7 Ziffern) und jedes Fach (z. B. S012). Mit Zentrale beantwortet Perplexity auch Fachfragen.'],
 ['#live','Verbindung','Grün heißt: live mit der Zentrale. Ohne Netz wird gepuffert und später gesendet.'],
 ['.ib[data-act="bell"]','Warnlage','Alles, was jetzt Aufmerksamkeit braucht. Neue kritische Punkte erscheinen zusätzlich als Banner.'],
 ['.tl','Schichtpuls','Die Schicht von 06:00 bis 15:00 mit den zehn Milkrun-Runden. Eine Perle antippen startet oder beendet die Runde.'],
 ['.row.r4','Kennzahlen','Jede Kachel führt in ihren Bereich. Zahlen, die sich durch ein anderes Gerät ändern, leuchten kurz auf.'],
 ['.tabs','Schnellwahl','Auf dem Handy liegen hier die wichtigsten Seiten, unter „Mehr“ alle anderen.']];
var T={i:-1};
window.tourStart=function(){if(S.ui.page!=='lage')go('lage');setTimeout(function(){T.i=-1;tourNext(1)},RM?50:650)};
function tourNext(n){var o=$('#tour');T.i+=n;while(T.i>=0&&T.i<TOUR.length){var el=$(TOUR[T.i][0]);if(el&&el.getBoundingClientRect().width>0)break;T.i+=n>0?1:-1}if(T.i<0)T.i=0;if(T.i>=TOUR.length){if(o)o.remove();S.ui.tour=1;save();toast('Rundgang beendet. Wieder starten unter Einstellungen.');return}
 var s=TOUR[T.i],el=$(s[0]);el.scrollIntoView({block:'center',behavior:RM?'auto':'smooth'});setTimeout(function(){var r=el.getBoundingClientRect(),pad=8;if(!o){o=document.createElement('div');o.id='tour';document.body.appendChild(o)}
  var x=Math.max(8,r.left-pad),y=Math.max(8,r.top-pad),w=Math.min(innerWidth-16,r.width+pad*2),h=Math.min(innerHeight-16,r.height+pad*2),below=y+h+220<innerHeight,cx=Math.min(Math.max(16,x),innerWidth-360);
  o.innerHTML='<div class="tr-hole" style="left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px"></div><div class="tr-card" style="left:'+cx+'px;'+(below?'top:'+(y+h+14):'top:'+Math.max(16,y-206))+'px"><div class="tr-n">'+(T.i+1)+' von '+TOUR.length+'</div><h3>'+esc(s[1])+'</h3><p>'+esc(s[2])+'</p><div class="acts"><button class="btn ghost sm" data-act="trq">Beenden</button>'+(T.i?'<button class="btn sm" data-act="trb">Zurück</button>':'')+'<button class="btn pri sm" data-act="trn">'+(T.i===TOUR.length-1?'Fertig':'Weiter')+'</button></div></div>'},RM?0:350)}
ACT.trn=function(){tourNext(1)};ACT.trb=function(){tourNext(-1)};ACT.trq=function(){var o=$('#tour');if(o)o.remove();S.ui.tour=1;save()};
document.addEventListener('keydown',function(e){if(!$('#tour'))return;if(e.key==='Escape'){e.stopPropagation();ACT.trq()}else if(e.key==='ArrowRight'||e.key==='Enter'){e.preventDefault();tourNext(1)}else if(e.key==='ArrowLeft'){e.preventDefault();tourNext(-1)}},true);
/* beim ersten Start einer Person einmal anbieten (nicht in automatisierten Tests) */
var ar2=window.afterRender;window.afterRender=function(p){if(ar2)ar2(p);if(p==='lage'&&S.ui.tour!==1&&!navigator.webdriver&&!$('#tour')&&!T.asked){T.asked=1;setTimeout(function(){if($('#stage')&&!$('#modal'))confirmM('Kurzer Rundgang durch MUNSCH Flow? Dauert eine Minute.',tourStart,'Rundgang starten');S.ui.tour=1;save()},1800)}};

/* Einstellungen: Ton, Vibration, Rundgang */
var adm0=VIEW.adm;VIEW.adm=function(){var h=adm0.apply(this,arguments),seg=function(k,lab){var on=S.ui[k]!==0;return '<div><div class="fl" style="margin-bottom:8px">'+lab+'</div><div class="seg"><button class="'+(on?'on':'')+'" data-act="fxset" data-k="'+k+'" data-v="1">an</button><button class="'+(on?'':'on')+'" data-act="fxset" data-k="'+k+'" data-v="0">aus</button></div></div>'};
 return h+M.card('Rückmeldung und Einarbeitung','<div style="display:flex;gap:28px;flex-wrap:wrap;align-items:flex-end">'+seg('snd','Ton bei Scan und Aktionen')+seg('vib','Vibration (Handy, Tablet)')+'<button class="btn" data-act="fxtest">Probieren</button><button class="btn" data-act="tour">Rundgang starten</button></div><p class="dim" style="font-size:12.5px;margin:12px 0 0">Gilt für dieses Gerät. Zwei helle Töne heißen erledigt, ein tiefer Ton heißt Fehler.</p>')};
ACT.fxset=function(d){S.ui[d.k]=+d.v;save();render()};ACT.fxtest=function(){fx.ok(true);setTimeout(function(){fx.err()},900)};ACT.tour=function(){tourStart()};

/* ---------- 5. Installierbar und offline startfähig ---------- */
if(window.MF_SERVER&&'serviceWorker' in navigator&&location.protocol!=='file:'){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}
})();
