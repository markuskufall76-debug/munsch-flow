/* ===== Klangbild =====
   Ein zusammenpassender Satz Töne, synthetisch erzeugt (keine Tondateien, keine Lizenzen).
   Grundton D-Dur pentatonisch: Erfolge steigen, Fehler und Hinweise fallen, der Alarm wiederholt sich.
   Klangfarbe: Metallophon und Holz statt Piepen, mit etwas Raum, dazu ein Begrenzer gegen Übersteuern.
   Klänge: tick (Tippen), plus/minus (Widget), ok (erledigt), done (Einlagern, Runde fertig), err (Fehler),
   warn (Hinweis), alarm (kritische Lage, Monitor), record (Rekord), slide (Folienwechsel Shopfloor).
   Lautstärke je Gerät (leise, mittel, laut); Ton aus über die bestehende Einstellung. Ersetzt die Töne aus cinema.js. */
(function(){
'use strict';
var M=window.MF,ls=M.ls;
var N={D4:293.66,Fs4:369.99,A4:440,B4:493.88,D5:587.33,E5:659.26,Fs5:739.99,A5:880,B5:987.77,D6:1174.66};
var VOL={leise:.45,mittel:.85,laut:1.45};
function vol(){var v=ls('mflow.vol');return VOL[v]?v:(isMonitorish()?'laut':'mittel')}
function isMonitorish(){return !!($('#mon')||$('#lfm')||document.documentElement.classList.contains('halle'))}
function on(){return !window.S||S.ui.snd!==0}

/* Ausgang je Kontext: Lautstärke → Raum (Hall aus Rauschimpuls) → Begrenzer → Lautsprecher */
var OUT=typeof WeakMap!=='undefined'?new WeakMap():null;
function out(a,level){var o=OUT&&OUT.get(a);if(o){o.g.gain.value=level;return o.g}
 var g=a.createGain(),dry=a.createGain(),wet=a.createGain(),cv=a.createConvolver(),cmp=a.createDynamicsCompressor();
 g.gain.value=level;dry.gain.value=.86;wet.gain.value=.2;cmp.threshold.value=-12;cmp.knee.value=8;cmp.ratio.value=8;cmp.attack.value=.003;cmp.release.value=.2;
 var len=Math.floor(a.sampleRate*1.6),ir=a.createBuffer(2,len,a.sampleRate);for(var c=0;c<2;c++){var d=ir.getChannelData(c);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2)}cv.buffer=ir;
 g.connect(dry);g.connect(cv);cv.connect(wet);dry.connect(cmp);wet.connect(cmp);cmp.connect(a.destination);o={g:g};if(OUT)OUT.set(a,o);return g}
/* Metallophon: Teiltöne wie ein Klangstab, kurzer Anschlag, Ausklang je Teilton */
function bell(a,dst,f,t,dur,v){[[1,1,1],[2.01,.32,.55],[3.02,.14,.38],[4.21,.06,.28]].forEach(function(p){var o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=f*p[0];
 var A=.22*v*p[1];g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(A,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+dur*p[2]);o.connect(g).connect(dst);o.start(t);o.stop(t+dur*p[2]+.05)})}
/* Holz/Marimba: Grundton plus Oberton im Abstand von zwei Oktaven, weich gefiltert */
function mallet(a,dst,f,t,dur,v){var lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=Math.min(9000,f*6);lp.connect(dst);
 [[1,1,1],[3.98,.22,.3]].forEach(function(p){var o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=f*p[0];var A=.26*v*p[1];
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(A,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dur*p[2]);o.connect(g).connect(lp);o.start(t);o.stop(t+dur*p[2]+.05)})}
function noise(a,dur){var n=Math.max(1,Math.floor(a.sampleRate*dur)),b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1;var s=a.createBufferSource();s.buffer=b;return s}
/* Klick: kurzes gefiltertes Rauschen mit Tonkern, wie ein guter Taster */
function click(a,dst,t,f,v){var s=noise(a,.03),bp=a.createBiquadFilter(),g=a.createGain();bp.type='bandpass';bp.frequency.value=f*1.6;bp.Q.value=2.5;g.gain.setValueAtTime(.6*v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.025);s.connect(bp).connect(g).connect(dst);s.start(t);s.stop(t+.03);
 var o=a.createOscillator(),og=a.createGain();o.frequency.value=f;og.gain.setValueAtTime(.18*v,t);og.gain.exponentialRampToValueAtTime(.0001,t+.04);o.connect(og).connect(dst);o.start(t);o.stop(t+.05)}
/* dumpfer Schlag mit fallender Tonhöhe: Fehler, ohne zu kreischen */
function thud(a,dst,t,f,v){var o=a.createOscillator(),g=a.createGain(),lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;o.type='triangle';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.62,t+.18);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.42*v,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+.26);o.connect(lp).connect(g).connect(dst);o.start(t);o.stop(t+.3)}
function swell(a,dst,f,t,dur,v){var o=a.createOscillator(),g=a.createGain(),lp=a.createBiquadFilter();o.type='sawtooth';o.frequency.value=f;lp.type='lowpass';lp.frequency.setValueAtTime(400,t);lp.frequency.linearRampToValueAtTime(2200,t+dur*.6);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05*v,t+dur*.4);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(lp).connect(g).connect(dst);o.start(t);o.stop(t+dur+.05)}
function whoosh(a,dst,t,v){var s=noise(a,.55),bp=a.createBiquadFilter(),g=a.createGain();bp.type='bandpass';bp.Q.value=1.4;bp.frequency.setValueAtTime(350,t);bp.frequency.exponentialRampToValueAtTime(2600,t+.45);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16*v,t+.18);g.gain.exponentialRampToValueAtTime(.0001,t+.52);s.connect(bp).connect(g).connect(dst);s.start(t);s.stop(t+.56)}

var SND={
 tick:function(a,d,t){click(a,d,t,1800,1)},
 plus:function(a,d,t){click(a,d,t,1800,.9);mallet(a,d,N.A5,t+.01,.3,1)},
 minus:function(a,d,t){click(a,d,t,1400,.9);mallet(a,d,N.D5,t+.01,.3,.95)},
 ok:function(a,d,t){mallet(a,d,N.A5,t,.5,.9);mallet(a,d,N.D6,t+.085,.7,.85)},
 done:function(a,d,t){[N.D5,N.Fs5,N.A5,N.D6].forEach(function(f,i){bell(a,d,f,t+i*.07,1.1,.75)});bell(a,d,N.A5*2,t+.3,1.2,.18)},
 err:function(a,d,t){thud(a,d,t,196,1);thud(a,d,t+.15,165,.9)},
 warn:function(a,d,t){bell(a,d,N.E5,t,.9,.7);bell(a,d,N.B4,t+.2,1.1,.7)},
 alarm:function(a,d,t){for(var r=0;r<2;r++){var s=t+r*1.05;bell(a,d,N.A5,s,.9,1.15);bell(a,d,N.Fs5,s+.26,.9,1.1);bell(a,d,N.A5,s+.52,.9,1.15);mallet(a,d,N.D4,s,.8,.8)}},
 record:function(a,d,t){[N.D4,N.Fs4,N.A4,N.D5].forEach(function(f){swell(a,d,f,t,1.6,1)});[N.D5,N.Fs5,N.A5,N.D6,N.Fs5*2].forEach(function(f,i){bell(a,d,f,t+.25+i*.09,1.3,.7)})},
 slide:function(a,d,t){whoosh(a,d,t,1)}};
window.KLANG={names:Object.keys(SND),
 /* auf einem beliebigen Kontext abspielen (auch OfflineAudioContext für Tests) */
 render:function(name,a,level){var f=SND[name];if(!f||!a)return false;f(a,out(a,level==null?1:level),a.currentTime+.01);return true},
 play:function(name){if(!on())return false;var a=window.fxAC&&fxAC();if(!a)return false;return KLANG.render(name,a,VOL[vol()])}};

/* bestehende Rückmeldungen auf das Klangbild umstellen (Vibration und Erfolgsszene bleiben) */
var f0=window.fx||{};function buzz(p){try{if(window.S&&S.ui.vib!==0&&navigator.vibrate)navigator.vibrate(p)}catch(e){}}
var MUTE=0;
window.fx={ok:function(big){if(!MUTE)KLANG.play(big?'done':'ok');buzz(30);if(big&&f0.ok){var s=S.ui.snd;S.ui.snd=0;try{f0.ok(true)}finally{S.ui.snd=s}}},
 err:function(){KLANG.play('err');buzz([80,40,80]);if(f0.err){var s=S.ui.snd;S.ui.snd=0;try{f0.err()}finally{S.ui.snd=s}}},
 tick:function(){KLANG.play('tick');buzz(12)},
 plus:function(){KLANG.play('plus');buzz(10)},minus:function(){KLANG.play('minus');buzz(10)},
 warn:function(){KLANG.play('warn')},alarm:function(){KLANG.play('alarm')},record:function(){KLANG.play('record')},slide:function(){KLANG.play('slide')}};

/* Milkrun-Runde beendet: kleiner Erfolg statt Klick */
['mke','stmk'].forEach(function(k){var f=ACT[k];if(f)ACT[k]=function(){var r=f.apply(this,arguments);fx.ok();return r}});
/* Widget: + steigt, − fällt */
var zs=ACT.zwstep;if(zs)ACT.zwstep=function(d){var r=zs.apply(this,arguments);try{(+d.n>0?fx.plus:fx.minus)()}catch(e){}return r};
var zk=ACT.zwkey;if(zk)ACT.zwkey=function(d){var r=zk.apply(this,arguments);try{d.v==='ok'?fx.ok():fx.tick()}catch(e){}return r};
/* Shopfloor auf dem großen Monitor: Folienwechsel hörbar, aber leise */
['rpi','rnext'].forEach(function(k){var f=ACT[k];if(f)ACT[k]=function(){var r=f.apply(this,arguments);if(document.documentElement.classList.contains('rpm'))KLANG.play('slide');return r}});
/* Alarm: im Monitor der Alarm-Klang, sonst der Fehlerton (aus cinema.js), dazu Rekord-Moment */
var mo=new MutationObserver(function(L){L.forEach(function(m){[].forEach.call(m.addedNodes,function(n){if(n.nodeType!==1)return;
 if(n.id==='alarm')KLANG.play('alarm')})})});
/* Rekord: eigener Klang statt „eingelagert“ */
var rs=window.recShow;if(rs)window.recShow=function(){MUTE=1;try{return rs.apply(this,arguments)}finally{MUTE=0;KLANG.play('record')}};
mo.observe(document.body,{childList:true,subtree:true});

/* Monitor ohne Bedienung: Browser erlauben Ton erst nach einem Tipp. Dann ein Knopf „Ton einschalten“. */
setInterval(function(){var m=$('#mon')||$('#lfm');if(!m||!on())return;var a=window.fxAC&&fxAC(),b=m.querySelector('.snd-on');var need=a&&a.state!=='running';
 if(need&&!b){b=document.createElement('button');b.className='btn snd-on';b.textContent='Ton einschalten';b.addEventListener('click',function(e){e.stopPropagation();var c=fxAC();if(c&&c.resume)c.resume().then(function(){KLANG.play('ok')});b.remove()});m.appendChild(b)}
 else if(!need&&b)b.remove()},1500);

/* Einstellungen: Lautstärke und Klänge zum Anhören */
var LAB={tick:'Tippen',plus:'Plus',minus:'Minus',ok:'Erledigt',done:'Eingelagert',err:'Fehler',warn:'Hinweis',alarm:'Alarm',record:'Rekord',slide:'Folie'};
var adm=VIEW.adm;VIEW.adm=function(){var h=adm.apply(this,arguments),v=vol();
 var c=M.card('Klang','<div style="display:flex;gap:28px;flex-wrap:wrap;align-items:flex-end"><div><div class="fl" style="margin-bottom:8px">Lautstärke auf diesem Gerät</div><div class="seg">'+['leise','mittel','laut'].map(function(k){return '<button class="'+(v===k?'on':'')+'" data-act="volset" data-v="'+k+'">'+k+'</button>'}).join('')+'</div></div></div>'
  +'<div class="fl" style="margin:18px 0 8px">Anhören</div><div class="kl-g">'+Object.keys(LAB).map(function(k){return '<button class="btn sm" data-act="klang" data-k="'+k+'">▶ '+LAB[k]+'</button>'}).join('')+'</div>'
  +'<p class="dim" style="font-size:12.5px;margin:12px 0 0">Erfolge klingen hell und steigend, Fehler dumpf und fallend, der Alarm wiederholt sich. Monitore stehen ab Werk auf laut. Ton ganz aus: oben unter „Rückmeldung und Einarbeitung“.</p>');
 return h+c};
ACT.volset=function(d){ls('mflow.vol',d.v);render();KLANG.play('ok')};
ACT.klang=function(d){var s=S.ui.snd;if(s===0)toast('Ton ist auf diesem Gerät aus');KLANG.play(d.k)};
ACT.fxtest=function(){KLANG.play('done');setTimeout(function(){KLANG.play('err')},1100)};
})();
