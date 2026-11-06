/* ===== Clips: Shopfloor-Begrüßung und „Tag in Zahlen“ =====
   Zwei kurze Filme in 1920×1080, gezeichnet auf eine Leinwand (gleiche Technik wie der Monatsrückblick, filmrec.js).
   In der App abspielbar (Vollbild, Esc schließt) und als Videodatei speicherbar (MP4, sonst WebM).
   – Begrüßung: Guten Morgen, Anwesenheit (nur Zahlen, keine Namen), Gestern in Zahlen, Sicherheit, Heute, Los geht’s.
   – Tag in Zahlen: ein Arbeitstag mit Kennzahlen, Sägen gegen Ziel, Wareneingang gegen Ø 20 Tage.
   Knöpfe: Eröffnungsfolie im Shopfloor 06:45 und Tageszahlen. */
(function(){
'use strict';
var K=window.filmKit;if(!K)return;
var M=window.MF,RM=M.RM;
var W=K.W,C=K.C,F=K.F,ease=K.ease,rr=K.rr,spaced=K.spaced,L0=170,R0=W-170;
var MN=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

/* ---------- Daten ---------- */
function kw(d){var x=new Date(d+'T12:00:00');x.setDate(x.getDate()+3-((x.getDay()+6)%7));var w=new Date(x.getFullYear(),0,4);return 1+Math.round(((x-w)/864e5-3+((w.getDay()+6)%7))/7)}
function nums(d){var o=S.tz[d]||{},f=tzFn(o);return [{v:+o.we_pak||0,l:'Pakete gebucht'},{v:+o.ms_ist||0,l:'Säge Metall'},{v:+o.ks_ist||0,l:'Säge Kunststoff'},{v:+o.milkrun||0,l:'Milkrun-Runden',of:10},{v:f.stoer,l:'Störungen',st:1}]}
function target(d,f,plan,rueck){var o=S.tz[d]||{};if(o[plan]==null||o[plan]==='')return null;var lt=tzLatest(prevWork(d));return (+o[plan]||0)+(+((lt&&S.tz[lt]||{})[rueck])||0)}
function avg(d,f){var v=[],x=d;for(var i=0;i<60&&v.length<20;i++){x=prevWork(x);var o=S.tz[x];if(o&&o[f]!=null)v.push(+o[f]||0)}return v.length?v.reduce(function(a,b){return a+b},0)/v.length:null}
function safety(t){var I=S.sich||{},last=null,ks=Object.keys(I).sort();ks.forEach(function(k){if(I[k]&&I[k].t==='unf'&&k<=t&&(!last||k>last))last=k});
 var from=last||ks[0];if(!from)return null;var c={ok:0,bei:0},m=t.slice(0,7);ks.forEach(function(k){if(k.slice(0,7)===m&&I[k]){if(I[k].t==='ok')c.ok++;else if(I[k].t==='bei')c.bei++}});
 return {days:Math.max(0,Math.round((new Date(t+'T12:00:00')-new Date(from+'T12:00:00'))/864e5)),since:!!last,ok:c.ok,bei:c.bei,mon:MN[+m.slice(5,7)-1]}}
function lastDay(){var p=prevWork(todayIso()),l=tzLatest(p);return l||null}
function greetData(){var t=todayIso(),h=new Date().getHours(),y=lastDay(),work=isWork(t),L=[];
 var ms=target(t,'ms_ist','ms_plan','ms_rueck'),ks=target(t,'ks_ist','ks_plan','ks_rueck');
 if(ms!=null)L.push(['Ziel Säge Metall',ms+' Teile']);if(ks!=null)L.push(['Ziel Säge Kunststoff',ks+' Teile']);
 if(work)L.push(['Milkrun','10 Runden ab 06:00']);
 var T=S.term||{};Object.keys(T).map(function(k){return T[k]}).filter(function(x){return x&&x.d===t}).slice(0,3).forEach(function(x){L.push(['Termin',x.t])});
 return {t:t,hi:h<11?'Guten Morgen,':h<17?'Hallo,':'Guten Abend,',date:fmtD(t,{weekday:'long',day:'numeric',month:'long'}),kw:kw(t),work:work,
  pr:work?presentOn(t).length:0,crew:CREW.length,mod:window.sfMod?sfMod(t):'',y:y,yN:y?nums(y):null,yLab:y?(y===prevWork(t)?'Gestern':fmtD(y,{weekday:'long'})):'',yDate:y?fmtD(y,{weekday:'long',day:'numeric',month:'long'}):'',
  si:safety(t),today:L}}

/* ---------- Bausteine ---------- */
function A(x,t,d,dur){x.globalAlpha=ease((t-(d||0))/(dur||.5))}
function kick(x,t,s,y,center){A(x,t,0,.5);x.fillStyle=C.sig;x.font='600 26px '+F.m;spaced(x,s.toUpperCase(),center?W/2:L0,y,7,center)}
function rise(x,t,d,dur){var e=ease((t-d)/(dur||.8));x.globalAlpha=e;return (1-e)*46}
function head(x,t,s,y,sz,col,d,center){var dy=rise(x,t,d||0,.9);x.fillStyle=col||C.ink;x.font='800 '+sz+'px '+F.d;x.textAlign=center?'center':'left';x.fillText(s,center?W/2:L0,y+dy);x.textAlign='left'}
function line(x,t,s,y,d,col,font,center){A(x,t,d,.6);x.fillStyle=col||C.dim;x.font=font||('500 36px '+F.b);x.textAlign=center?'center':'left';x.fillText(s,center?W/2:L0,y);x.textAlign='left'}
function cnt(t,v,d,dur){return Math.round(v*ease((t-d)/(dur||1.2)))}
function logoAt(x,lg,t,d,y,h){if(!lg)return;A(x,t,d,.6);var lw=h*lg.width/lg.height,s=1.04-.04*ease((t-d)/1.2);x.save();x.translate(W/2,y+h/2);x.scale(s,s);x.drawImage(lg,-lw/2,-h/2,lw,h);x.restore()}
/* Kennzahlen nebeneinander, Zahl zählt hoch, Akzentlinie wächst */
function grid(x,t,N,y,d0){var n=N.length,cw=(R0-L0)/n;N.forEach(function(it,i){var X=L0+i*cw,d=d0+i*.16,e=ease((t-d)/.9),col=it.st?(it.v?C.warn:C.ok):C.ink;
 x.globalAlpha=1;x.fillStyle=C.track;x.fillRect(X,y-250,cw-40,3);x.fillStyle=it.st?col:C.sig;x.fillRect(X,y-250,(cw-40)*e,3);
 var dy=(1-e)*40;x.globalAlpha=e;x.fillStyle=col;x.font='800 190px '+F.d;var s=String(cnt(t,it.v,d+.1));x.fillText(s,X,y+dy);
 if(it.of){var w=x.measureText(s).width;x.fillStyle=C.mute;x.font='800 80px '+F.d;x.fillText('/'+it.of,X+w+10,y+dy)}
 A(x,t,d+.35,.5);x.fillStyle=C.dim;x.font='500 32px '+F.b;x.fillText(it.l,X,y+70)})}
/* Balken mit Zielmarke */
function bar(x,t,lab,v,tg,mx,col,y,d){var e=ease((t-d)/1.3);A(x,t,d-.2,.5);x.fillStyle=C.ink;x.font='600 40px '+F.b;x.fillText(lab,L0,y+14);
 var X=600,BW=900;x.fillStyle=C.track;rr(x,X,y-16,BW,34,17);x.fill();x.fillStyle=col;rr(x,X,y-16,Math.max(34,BW*v/mx*e),34,17);x.fill();
 if(tg!=null){var tx=X+BW*tg/mx;x.globalAlpha=ease((t-d-.6)/.5);x.fillStyle=C.ink;x.fillRect(tx-2,y-34,4,70);x.font='600 22px '+F.m;x.fillStyle=C.dim;x.textAlign='center';x.fillText('ZIEL '+tg,tx,y-46);x.textAlign='left';x.globalAlpha=ease((t-d)/.5)}
 x.fillStyle=v>=(tg||0)&&tg!=null?C.ok:C.ink;x.font='800 84px '+F.d;x.textAlign='right';x.fillText(String(cnt(t,v,d,1.3)),R0,y+30);x.textAlign='left'}
function chip(x,t,s,X,Y,col,d){A(x,t,d,.6);x.font='600 28px '+F.m;var w=x.measureText(s).width+40;x.strokeStyle=col;x.lineWidth=2;rr(x,X,Y-40,w,56,28);x.stroke();x.fillStyle=col;x.fillText(s,X+20,Y-3)}
function outro(a,b,lg){return [3.8,function(x,t){x.textAlign='center';A(x,t,0,.6);x.fillStyle=C.sig;x.font='600 30px '+F.m;spaced(x,a,W/2,400,10,true);head(x,t,b,620,220,C.ink,.25,true);logoAt(x,lg,t,.9,690,90)}]}

/* ---------- Begrüßung ---------- */
/* Szene mit Hintergrundbild (Name aus der Bildwelt, filmrec.js zeichnet es) */
function im(n,sc){sc.img=n;return sc}
function greetScenes(g,lg){var SC=[];
 SC.push(im('steuer',[4.4,function(x,t){logoAt(x,lg,t,0,200,84);kick(x,t,'Shopfloor 06:45 · KW '+g.kw,380,true);
  head(x,t,g.hi.toUpperCase(),580,190,C.ink,.25,true);head(x,t,'TEAM.',770,190,C.sig,.55,true);line(x,t,g.date,860,1.1,C.dim,'500 34px '+F.m,true)}]));
 if(g.work)SC.push(im('pers',[4.6,function(x,t){kick(x,t,'Heute im Dienst',300);var s=String(cnt(t,g.pr,.2,1));head(x,t,s,600,300,C.ink,.1);
  x.font='800 300px '+F.d;var w=x.measureText(s).width;A(x,t,.4,.6);x.fillStyle=C.mute;x.font='800 120px '+F.d;x.fillText('/ '+g.crew,L0+w+30,600);
  for(var i=0;i<g.crew;i++){var e=ease((t-.6-i*.07)/.5),X=L0+i*92+30,Y=740;x.globalAlpha=e;x.beginPath();x.arc(X,Y,26*(.85+.15*e),0,Math.PI*2);
   if(i<g.pr){x.fillStyle=C.sig;x.fill()}else{x.strokeStyle=C.mute;x.lineWidth=3;x.stroke()}}
  if(g.mod)line(x,t,'Es moderiert '+g.mod,880,1.3)}]));
 if(g.yN)SC.push(im('halle',[6.6,function(x,t){kick(x,t,g.yLab+' in Zahlen',260);line(x,t,g.yDate,320,.15,C.dim,'500 30px '+F.m);grid(x,t,g.yN,700,.3)}]));
 if(g.si)SC.push(im('lager',[4.6,function(x,t){kick(x,t,'Arbeitssicherheit',300);head(x,t,String(cnt(t,g.si.days,.2,1.4)),610,320,C.ok,.1);
  line(x,t,g.si.since?'Tage seit dem letzten Unfall':'Tage ohne Unfall erfasst',700,.6,C.ink,'600 44px '+F.b);
  line(x,t,g.si.mon+': '+g.si.ok+' unfallfrei · '+g.si.bei+(g.si.bei===1?' Beinaheunfall':' Beinaheunfälle'),790,1,C.dim)}]));
 if(g.today.length)SC.push(im('steuer',[5.6,function(x,t){kick(x,t,'Heute',260);head(x,t,'DAS STEHT AN.',420,150,C.ink,.1);
  g.today.forEach(function(r,i){var y=560+i*92,d=.5+i*.2,e=ease((t-d)/.7);x.globalAlpha=e;x.fillStyle=C.track;x.fillRect(L0,y+30,(R0-L0)*e,2);
   x.fillStyle=C.dim;x.font='600 26px '+F.m;spaced(x,r[0].toUpperCase(),L0,y,4);x.fillStyle=C.ink;x.font='700 46px '+F.b;x.textAlign='right';x.fillText(r[1].length>48?r[1].slice(0,47)+'…':r[1],R0,y+6);x.textAlign='left'})}]));
 SC.push(im('halle',outro('SICHERHEIT ZUERST.','LOS GEHT’S.',lg)));return SC}

/* ---------- Tag in Zahlen ---------- */
function dayScenes(d,lg){var t=todayIso(),lab=d===prevWork(t)?'GESTERN':d===t?'HEUTE':fmtD(d,{weekday:'long'}).toUpperCase(),o=S.tz[d]||{},N=nums(d);
 var mt=target(d,'ms_ist','ms_plan','ms_rueck'),kt=target(d,'ks_ist','ks_plan','ks_rueck'),m=+o.ms_ist||0,k=+o.ks_ist||0,mx=Math.max(m,k,mt||0,kt||0,1)*1.1;
 var pak=+o.we_pak||0,av=avg(d,'we_pak'),SC=[];
 SC.push(im('halle',[3.6,function(x,t){kick(x,t,'MUNSCH Logistik · Tag in Zahlen',380,true);head(x,t,lab,610,230,C.ink,.25,true);
  line(x,t,fmtD(d,{weekday:'long',day:'numeric',month:'long',year:'numeric'}),700,.8,C.dim,'500 34px '+F.m,true)}]));
 SC.push(im('lager',[6.6,function(x,t){kick(x,t,'Auf einen Blick',300);grid(x,t,N,680,.2)}]));
 if(m||k||mt!=null||kt!=null)SC.push(im('prod',[5.4,function(x,t){kick(x,t,'Sägen',300);head(x,t,String(cnt(t,m+k,.2,1.2)),540,220,C.ink,.1);
  A(x,t,.5,.6);x.font='800 220px '+F.d;var w=x.measureText(String(m+k)).width;x.fillStyle=C.dim;x.font='500 44px '+F.b;x.fillText('Teile gesägt',L0+w+36,540);
  bar(x,t,'Metall',m,mt,mx,C.met,720,.6);bar(x,t,'Kunststoff',k,kt,mx,C.kst,860,.85)}]));
 SC.push(im('lager',[4.8,function(x,t){kick(x,t,'Wareneingang',300);head(x,t,String(cnt(t,pak,.2,1.2)),600,280,C.ink,.1);A(x,t,.5,.6);x.font='800 280px '+F.d;var w=x.measureText(String(pak)).width;x.fillStyle=C.dim;x.font='500 44px '+F.b;x.fillText('Pakete gebucht',L0+w+36,600);
  if(av!=null&&av>0){var p=Math.round((pak-av)/av*100);chip(x,t,(p>0?'+':'')+p+' % zum Ø der letzten 20 Arbeitstage',L0,720,p>=0?C.ok:C.warn,1)}
  line(x,t,(+o.we_gbpal||0)+' GB / Pal',840,1.3)}]));
 SC.push(im('halle',outro('DANKE, TEAM.','WEITER SO.',lg)));return SC}

/* ---------- Abspielen in der App ---------- */
var PL=null;
function play(make,rec,o){o=o||{};closeClip();var c=document.createElement('div');c.id='clip';if(o.cls)c.className=o.cls;c.setAttribute('role','dialog');c.setAttribute('aria-label','Film');
 c.innerHTML='<canvas width="'+W+'" height="'+K.H+'"></canvas><div class="cl-ctl">'+(rec?'<button class="btn sm ghost" data-act="clrec">Als Video speichern</button>':'')+'<button class="btn sm" data-act="clx">'+(o.skip?'Überspringen':'Schließen')+'</button></div>';
 if(o.skip)c.addEventListener('pointerdown',function(e){if(!e.target.closest('button'))closeClip()});
 document.body.appendChild(c);var x=c.querySelector('canvas').getContext('2d');
 Promise.all([K.fonts(),K.loadLogo(),K.imgs()]).then(function(r){if(!$('#clip'))return;var SC=make(r[1]),tot=SC.reduce(function(a,s){return a+s[0]},0),t0=performance.now();PL={rec:rec,raf:0,end:0};
  (function f(){if(!PL||!$('#clip'))return;var T=(performance.now()-t0)/1000;K.paint(x,SC,Math.min(T,tot-.36));if(T>=tot){PL.end=setTimeout(closeClip,o.end!=null?o.end:1500);return}PL.raf=requestAnimationFrame(f)})()});
 c.addEventListener('pointermove',function(){c.classList.add('ui');clearTimeout(c._t);c._t=setTimeout(function(){c.classList.remove('ui')},2200)})}
function closeClip(){if(PL){cancelAnimationFrame(PL.raf);clearTimeout(PL.end)}PL=null;var c=$('#clip');if(c){c.classList.add('out');setTimeout(function(){c.remove()},300)}}
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('#clip')){e.stopPropagation();closeClip()}},true);
ACT.clx=closeClip;ACT.clrec=function(){var r=PL&&PL.rec;closeClip();if(r)setTimeout(r,320)};

function greet(){play(function(lg){return greetScenes(greetData(),lg)},greetRec)}
function greetRec(){var g=greetData();K.record({title:'Shopfloor-Begrüßung als Video',sub:g.date,fn:'MUNSCH-Begruessung-'+g.t,make:function(lg){return greetScenes(g,lg)}})}
function dayOf(){var d=S.ui.page==='tz'&&S.ui.td||todayIso(),o=S.tz[d];return o&&Object.keys(o).length?d:lastDay()}
function day(d){d=d||dayOf();if(!d)return toast('Noch keine Tageszahlen erfasst');play(function(lg){return dayScenes(d,lg)},function(){dayRec(d)})}
function dayRec(d){d=d||dayOf();if(!d)return toast('Noch keine Tageszahlen erfasst');K.record({title:'Tag in Zahlen als Video',sub:fmtD(d,{weekday:'long',day:'numeric',month:'long'}),fn:'MUNSCH-Tag-'+d,make:function(lg){return dayScenes(d,lg)}})}
ACT.clgreet=greet;ACT.clgreetv=greetRec;ACT.clday=function(){day()};ACT.cldayv=function(){dayRec()};

/* ---------- Die Woche in Zahlen ----------
   Montag bis heute (bzw. Freitag), aus den Tageszahlen. Freitags 14:30 spielt der Werkstattmonitor den Film von selbst. */
function weekData(){var t=todayIso(),x=new Date(t+'T12:00:00'),mo=addDays(t,-((x.getDay()+6)%7)),D=[];for(var i=0;i<5;i++){var d=addDays(mo,i);if(d>t)break;var o=S.tz[d];if(o&&Object.keys(o).length){var f=tzFn(o);D.push({d:d,pak:+o.we_pak||0,saw:f.gesaegt,milk:+o.milkrun||0,st:f.stoer})}}
 var sum=function(k){return D.reduce(function(a,b){return a+b[k]},0)},best=D.slice().sort(function(a,b){return b.pak-a.pak})[0];
 return {kw:kw(t),from:mo,to:D.length?D[D.length-1].d:t,D:D,pak:sum('pak'),saw:sum('saw'),milk:sum('milk'),st:sum('st'),best:best}}
function dayBars(x,t,D,k,y,col,d0){var n=D.length,mx=Math.max.apply(null,D.map(function(r){return r[k]}).concat([1])),cw=Math.min(240,(R0-L0)/Math.max(n,1));
 D.forEach(function(r,i){var X=L0+i*cw,e=ease((t-d0-i*.12)/.9),h=230*r[k]/mx*e;A(x,t,d0+i*.12,.4);x.fillStyle=C.track;var bw=Math.min(96,cw-70);rr(x,X,y-230,bw,230,8);x.fill();x.fillStyle=col;rr(x,X,y-h,bw,Math.max(4,h),8);x.fill();
  x.fillStyle=C.ink;x.font='800 54px '+F.d;x.fillText(String(Math.round(r[k]*e)),X,y-h-18);x.fillStyle=C.dim;x.font='600 24px '+F.m;x.fillText(fmtD(r.d,{weekday:'short'}).toUpperCase(),X,y+40)})}
function weekScenes(w,lg){var SC=[],q=w.D.length?Math.round(w.milk/(w.D.length*10)*100):0;
 SC.push(im('steuer',[3.8,function(x,t){kick(x,t,'MUNSCH Logistik · Wochenrückblick',380,true);head(x,t,'DIE WOCHE.',610,230,C.ink,.25,true);line(x,t,'KW '+w.kw+' · '+fmtD(w.from,{day:'numeric',month:'long'})+' bis '+fmtD(w.to,{day:'numeric',month:'long'}),700,.8,C.dim,'500 34px '+F.m,true)}]));
 if(w.D.length){
  SC.push(im('lager',[5.6,function(x,t){kick(x,t,'Wareneingang',250);head(x,t,String(cnt(t,w.pak,.2,1.2)),470,200,C.ink,.1);A(x,t,.5,.6);x.font='800 200px '+F.d;var wd=x.measureText(String(w.pak)).width;x.fillStyle=C.dim;x.font='500 42px '+F.b;x.fillText('Pakete gebucht',L0+wd+32,470);dayBars(x,t,w.D,'pak',880,C.sig,.7)}]));
  SC.push(im('prod',[5.6,function(x,t){kick(x,t,'Sägen',250);head(x,t,String(cnt(t,w.saw,.2,1.2)),470,200,C.ink,.1);A(x,t,.5,.6);x.font='800 200px '+F.d;var wd=x.measureText(String(w.saw)).width;x.fillStyle=C.dim;x.font='500 42px '+F.b;x.fillText('Teile gesägt',L0+wd+32,470);dayBars(x,t,w.D,'saw',880,C.met,.7)}]));
  SC.push(im('halle',[4.8,function(x,t){kick(x,t,'Milkrun',300);head(x,t,String(cnt(t,q,.2,1.4)),620,300,q>=90?C.ok:C.ink,.1);A(x,t,.4,.6);x.font='800 300px '+F.d;var wd=x.measureText(String(q)).width;x.fillStyle=C.mute;x.font='800 120px '+F.d;x.fillText('%',L0+wd+20,620);line(x,t,w.milk+' von '+(w.D.length*10)+' Runden beendet',720,.8,C.ink,'600 44px '+F.b)}]));
  SC.push(im('pumpe',[4.6,function(x,t){kick(x,t,'Störungen',300);head(x,t,String(cnt(t,w.st,.2,1.2)),620,300,w.st?C.warn:C.ok,.1);line(x,t,w.st?'Störungen und Abweichungen erfasst':'Keine Störung in dieser Woche',720,.7,C.ink,'600 44px '+F.b);
   if(w.best){line(x,t,'Stärkster Tag: '+fmtD(w.best.d,{weekday:'long'})+' mit '+w.best.pak+' Paketen',810,1.1)}}]));
 }
 SC.push(im('nacht',outro('DANKE FÜR DIESE WOCHE.','SCHÖNES WOCHENENDE.',lg)));return SC}
function week(){var w=weekData();play(function(lg){return weekScenes(w,lg)},weekRec)}
function weekRec(){var w=weekData();K.record({title:'Wochenrückblick als Video',sub:'KW '+w.kw,fn:'MUNSCH-Woche-KW'+w.kw,make:function(lg){return weekScenes(w,lg)}})}
ACT.clweek=week;ACT.clweekv=weekRec;window.playWeek=week;
/* Freitags 14:30 bis 14:40: der Werkstattmonitor spielt den Wochenfilm einmal von selbst */
setInterval(function(){if(!$('#mon')||$('#clip'))return;var n=new Date();if(n.getDay()!==5)return;var m=n.getHours()*60+n.getMinutes();if(m<870||m>880)return;var k='mflow.wfilm',t=todayIso();try{if(localStorage.getItem(k)===t)return;localStorage.setItem(k,t)}catch(e){}week()},20000);

/* ---------- Persönlicher Begrüßungsfilm ----------
   Einmal am Tag bei der ersten Anmeldung, statt der Einblendung „Guten Tag, Name“. Etwa 7 Sekunden, Tippen überspringt.
   Zeigt nur, was die Person auch auf „Mein Tag“ sieht: Bereich, Ziel, Vortrag, neue Nachrichten, eigene Maßnahmen,
   eigene nächste Abwesenheit. Nie Krankmeldungen anderer, nie Gesprächstermine.
   Nicht an Station, Bereichs-Tablet und im ruhigen Modus. Je Person abschaltbar (Einstellungen). */
var PIMG={'Wareneingang':'lager','WEP':'pumpe','Säge Metall':'prod','Säge Kunststoff':'prod','Vorkommissionierung':'lager','Materialwagen':'lager','Werksverkehr':'halle','Werk 1':'lager','Werk 2':'halle','Teamleitung':'steuer'};
/* Anrede und Vorname je Person: von der Teamleitung gepflegt (S.cfg.gruss, nur Teamleitung schreibt) */
function gruss(u){var c=S.cfg&&S.cfg.gruss;return (c&&c[u])||{}}
var MOTIVE=[['','automatisch (dein Bereich)'],['halle','Halle'],['lager','Regalgang'],['prod','Säge'],['pumpe','Pumpe'],['steuer','Besprechungsecke'],['sys','Leitstand'],['pers','Helme und Westen'],['komm','Funkgerät']];
function pKey(){return 'mflow.pf.'+String(S.user||'').replace(/[^A-Za-z0-9]/g,'')}
function pOn(){return (M.ls(pKey()+'.on')||'1')==='1'}
function pDue(){var t=todayIso();return !!S.user&&pOn()&&!RM&&!document.documentElement.classList.contains('lite')&&!M.ls('mflow.area')&&!(window.isStation&&isStation())&&!(window.me&&me()&&me().station)&&M.ls(pKey())!==t&&(!navigator.webdriver||window.__pf)}
function persData(){var t=todayIso(),u=S.user,h=new Date().getHours(),w=isWork(t),plan0=(S.plan[t]||{})[u],plan=plan0||(window.myArea?myArea():null),ab=absentOn(t).filter(function(v){return v.emp===u})[0];
 var G=gruss(u),back=!ab&&w&&absentOn(prevWork(t)).some(function(v){return v.emp===u}),own=M.ls(pKey()+'.img');
 var hi=(back?'Willkommen zurück':G.a||(h<11?'Guten Morgen':h<17?'Hallo':'Guten Abend'))+',',img=ab?'pers':own||PIMG[plan]||'steuer',big='',small='';
 if(ab){big='Heute: '+ab.type+'.';small='Bis '+fmtD(ab.d1,{weekday:'long',day:'numeric',month:'long'})+'. Gute Erholung.'}
 else if(!w){big='Heute frei.';small='Nächster Arbeitstag: '+fmtD(nextWork(t),{weekday:'long',day:'numeric',month:'long'})+'.'}
 else if(plan){big=plan+'.';small=plan0?'Dort bist du heute eingeteilt.':'Dein Bereich.';
  var sw=plan==='Säge Metall'?'ms':plan==='Säge Kunststoff'?'ks':null,o=S.tz[t]||{};
  if(sw&&o[sw+'_plan']!=null){var lt=tzLatest(prevWork(t)),z=(+o[sw+'_plan']||0)+(+((lt&&S.tz[lt]||{})[sw+'_rueck'])||0);small='Ziel heute: '+z+' Teile.'}
  if(plan==='Teamleitung'){var al=alerts(new Date()).length;small=al?al+(al===1?' Hinweis':' Hinweise')+' in der Warnlage.':'Alles ruhig in der Warnlage.'}}
 else{big='Schön, dass du da bist.';small=shiftInfo(new Date()).txt+'.'}
 var P=[],vt=(window._presToday?_presToday(t):[]).filter(function(x){return x.n===u});
 ((window.pmKey&&S.funk[pmKey(u)])||[]).filter(function(m){return m.gd===t}).slice(-1).forEach(function(m){P.push(['Von '+m.by,m.t])});
 vt.forEach(function(x){P.push(['Shopfloor 06:45','Du hältst den Vortrag: '+x.t+'.'])});
 var pm=window.pmKey?(S.funk[pmKey(u)]||[]).filter(function(m){return m.by!==u&&m.ts>(+(S.ui.pmr||0))&&m.gd!==t}):[];
 if(pm.length)P.push(['Für dich',pm.length===1?'Eine neue Nachricht von '+pm[0].by+'.':pm.length+' neue Nachrichten.']);
 var ms=(S.mass||[]).concat((S.s5&&S.s5.mass)||[]).filter(function(m){return !m.done&&m.wer===u});
 if(ms.length)P.push(['Deine Maßnahmen',ms.length===1?'Eine offene Maßnahme: '+ms[0].txt+'.':ms.length+' offene Maßnahmen.']);
 if(!ab){var nx=(S.vacs||[]).filter(function(v){return v.emp===u&&v.d0>t&&v.st!=='abgelehnt'}).sort(function(a,b){return a.d0<b.d0?-1:1})[0];
  if(nx&&(new Date(nx.d0+'T12:00:00')-new Date(t+'T12:00:00'))/864e5<=7)P.push(['Bald',nx.type+' ab '+fmtD(nx.d0,{weekday:'long',day:'numeric',month:'long'})+'.'])}
 return {hi:hi,name:G.v||firstName(u),img:img,big:big,small:small,P:P.slice(0,2),date:fmtD(t,{weekday:'long',day:'numeric',month:'long'})}}
/* Als Bildschirm-Animation (nicht Leinwand): passt sich jedem Format an, Schrift bleibt scharf, startet ohne Ladezeit */
var PF=null;
/* Klang zur Begrüßung: weicher Akkord, der aufblüht, ein heller Glockenton beim Namen, leises Rauschen beim Szenenwechsel.
   Synthetisch (keine Tondatei). Folgt dem Geräte-Ton (Einstellungen › Rückmeldung) und eigener Einstellung;
   ohne eigene Wahl an auf Handy und Tablet, aus am PC. */
function pfSndOn(){var v=M.ls(pKey()+'.snd');if(v)return v==='1';return !!(window.matchMedia&&matchMedia('(pointer:coarse)').matches)}
function pfSound(n){if(!pfSndOn()||S.ui.snd===0||!window.fxAC)return null;var a=fxAC();if(!a)return null;var t=a.currentTime+.05,out=a.createGain(),lp=a.createBiquadFilter();
 out.gain.value=0;out.connect(a.destination);out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(1,t+.02);
 /* Akkord (E-Dur, tief) durch einen Filter, der sich öffnet */
 lp.type='lowpass';lp.Q.value=.7;lp.frequency.setValueAtTime(220,t);lp.frequency.exponentialRampToValueAtTime(2400,t+2.2);lp.frequency.exponentialRampToValueAtTime(700,t+5.5);lp.connect(out);
 [[82.41,'sine',0],[123.47,'triangle',3],[164.81,'sine',-4],[207.65,'triangle',5],[246.94,'sine',-2]].forEach(function(f){var o=a.createOscillator(),g=a.createGain();o.type=f[1];o.frequency.value=f[0];o.detune.value=f[2];
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045,t+1.6);g.gain.setValueAtTime(.045,t+3.4);g.gain.exponentialRampToValueAtTime(.0001,t+6.2);o.connect(g).connect(lp);o.start(t);o.stop(t+6.3)});
 /* Glocke beim Namen (Grundton + Obertöne, Echo) */
 var bell=function(at,f,v){[[1,v],[2.76,v*.35],[5.4,v*.12]].forEach(function(h){var o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=f*h[0];g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(h[1],at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+2.4/h[0]);o.connect(g).connect(out);o.start(at);o.stop(at+2.5)})};
 bell(t+.55,659.25,.05);bell(t+.85,987.77,.035);bell(t+1.15,1318.5,.022);bell(t+1.6,1318.5,.008);
 /* weiches Rauschen beim Szenenwechsel */
 var noise=a.createBuffer(1,a.sampleRate*.6,a.sampleRate),d=noise.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
 for(var k=1;k<n;k++){var s=a.createBufferSource(),bp=a.createBiquadFilter(),g=a.createGain(),at=t+k*3-.18;s.buffer=noise;bp.type='bandpass';bp.Q.value=.8;bp.frequency.setValueAtTime(600,at);bp.frequency.exponentialRampToValueAtTime(3200,at+.5);
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.05,at+.15);g.gain.exponentialRampToValueAtTime(.0001,at+.6);s.connect(bp).connect(g).connect(out);s.start(at)}
 return {stop:function(){try{var c=a.currentTime;out.gain.cancelScheduledValues(c);out.gain.setValueAtTime(out.gain.value,c);out.gain.linearRampToValueAtTime(0,c+.4);setTimeout(function(){out.disconnect()},600)}catch(e){}}}}
function pfHtml(d){var hn=d.img==='halle'&&window.MF_SUN&&MF_SUN.dark()?'nacht':d.img,sc=[];
 sc.push('<div class="pf-s pf-1"><div class="pf-lg">'+logoSVG({h:44})+'</div><div class="pf-k">'+esc(d.date)+'</div><h2><span><i>'+esc(d.hi)+'</i></span><span class="o"><i>'+esc(d.name)+'.</i></span></h2></div>');
 sc.push('<div class="pf-s pf-2"><div class="pf-k">Dein Tag</div><h2 class="pf-big"><span><i>'+esc(d.big)+'</i></span></h2><p><span><i>'+esc(d.small)+'</i></span></p></div>');
 if(d.P.length)sc.push('<div class="pf-s pf-3">'+d.P.map(function(x,i){return '<div class="pf-it" style="--d:'+(i*.32)+'s"><div class="pf-k">'+esc(x[0])+'</div><p><span><i>'+esc(x[1])+'</i></span></p></div>'}).join('')+'</div>');
 return {n:sc.length,h:'<div class="pf-bg" data-img="'+hn+'"><div class="bn-p"></div></div><div class="pf-sh"></div><div class="pf-lb t"></div><div class="pf-lb b"></div>'+sc.join('')+'<div class="pf-bar"><i></i></div><button class="pf-x" data-act="pfx">Überspringen</button>'}}
function pfClose(){if(!PF)return;PF.T.forEach(clearTimeout);if(PF.snd)PF.snd.stop();var e=PF.el;PF=null;e.classList.add('out');setTimeout(function(){e.remove()},700)}
function personal(force){if(!force&&!pDue())return;M.ls(pKey(),todayIso());if(PF)pfClose();var d=persData(),H=pfHtml(d),el=document.createElement('div');el.id='pf';el.setAttribute('role','dialog');el.setAttribute('aria-label','Persönliche Begrüßung');el.innerHTML=H.h;document.body.appendChild(el);
 var D=[3000,3000,2600].slice(0,H.n),tot=D.reduce(function(a,b){return a+b},0),S2=el.querySelectorAll('.pf-s'),T=[],acc=0;el.style.setProperty('--tot',tot+'ms');
 S2.forEach(function(x,i){T.push(setTimeout(function(){S2.forEach(function(y){y.classList.toggle('on',y===x)});if(i)S2[i-1].classList.add('gone')},acc+(i?0:120)));acc+=D[i]});
 T.push(setTimeout(pfClose,tot));PF={el:el,T:T,snd:pfSound(H.n)};requestAnimationFrame(function(){el.classList.add('go')});
 el.addEventListener('pointerdown',function(e){e.preventDefault();pfClose()})}
ACT.pfx=pfClose;document.addEventListener('keydown',function(e){if(PF&&(e.key==='Escape'||e.key===' '||e.key==='Enter')){e.preventDefault();pfClose()}},true);
window.playPersonal=function(){personal(true)};ACT.pfnow=function(){personal(true)};
/* statt der Einblendung „Guten Tag, Name“: Klasse vorab setzen, damit die Einblendung nicht doppelt erscheint */
var pfDone=false;function pfMark(){document.documentElement.classList.toggle('pf-due',pDue())}
setInterval(pfMark,1000);document.addEventListener('pointerdown',pfMark,true);
var arP=window.afterRender;window.afterRender=function(p){if(arP)arP(p);if(pfDone)return;pfDone=true;if(pDue())setTimeout(function(){personal(false);document.documentElement.classList.remove('pf-due')},60)};
var admP=VIEW.adm;VIEW.adm=function(){var h=admP.apply(this,arguments),on=pOn();
 return h+M.card('Persönliche Begrüßung','<div class="seg"><button class="'+(on?'on':'')+'" data-act="pfset" data-v="1">an</button><button class="'+(on?'':'on')+'" data-act="pfset" data-v="0">aus</button></div><div class="fl" style="margin:14px 0 8px">Motiv</div><select class="in" id="pfimgsel" style="max-width:320px">'+MOTIVE.map(function(m){return '<option value="'+m[0]+'"'+((M.ls(pKey()+'.img')||'')===m[0]?' selected':'')+'>'+m[1]+'</option>'}).join('')+'</select><div class="fl" style="margin:14px 0 8px">Klang</div><div class="seg"><button class="'+(pfSndOn()?'on':'')+'" data-act="pfsnd" data-v="1">an</button><button class="'+(pfSndOn()?'':'on')+'" data-act="pfsnd" data-v="0">aus</button></div><div style="margin-top:14px"><button class="btn" data-act="pfnow">Jetzt abspielen</button></div><p class="dim" style="font-size:12.5px;margin:12px 0 0">Ein kurzer Film bei der ersten Anmeldung des Tages: dein Bereich, dein Ziel und was heute für dich ansteht. Tippen überspringt. Gilt für dich, nicht an Station und Bereichs-Tablets.</p>')};
ACT.pfset=function(d){M.ls(pKey()+'.on',d.v);render()};
document.addEventListener('change',function(e){if(e.target&&e.target.id==='pfimgsel'){M.ls(pKey()+'.img',e.target.value||null);toast('Motiv gespeichert')}});
/* Teamleitung: Anrede, Vorname, Begrüßungsnachricht für einen Tag */
var admG=VIEW.adm;VIEW.adm=function(){var h=admG.apply(this,arguments);if(!isLead())return h;var P=TEAM.filter(function(m){return !m.station&&!m.monitor}),t=todayIso();
 var rows=P.map(function(m,i){var g=gruss(m.n);return '<tr><td>'+esc(m.n)+'</td><td><input class="in" id="gra'+i+'" data-u="'+esc(m.n)+'" value="'+esc(g.a||'')+'" placeholder="automatisch" maxlength="30"></td><td><input class="in" id="grv'+i+'" value="'+esc(g.v||'')+'" placeholder="'+esc(firstName(m.n))+'" maxlength="30"></td></tr>'}).join('');
 return h+M.card('Begrüßung im Team','<p class="dim" style="font-size:12.5px;margin:0 0 12px">Anrede und Vorname für die persönliche Begrüßung. Leer: Tageszeit-Gruß und Kurzname. Nach Urlaub oder Krankheit heißt es automatisch „Willkommen zurück“ (ohne Grund).</p><table class="t"><thead><tr><th>Person</th><th>Anrede</th><th>Vorname</th></tr></thead><tbody>'+rows+'</tbody></table><div style="margin-top:12px"><button class="btn pri" data-act="grsave" data-n="'+P.length+'">Speichern</button></div>'
  +'<div class="fl" style="margin:22px 0 8px">Begrüßungsnachricht für einen Tag</div><div class="frm"><label class="fl">Person<select class="in" id="grp">'+P.map(function(m){return '<option>'+esc(m.n)+'</option>'}).join('')+'</select></label><label class="fl">Tag<input class="in" type="date" id="grd" value="'+nextWork(t)+'"></label><label class="fl w2">Text<input class="in" id="grt" maxlength="90" placeholder="z. B. Willkommen im Team!"></label><button class="btn" data-act="grmsg">Senden</button></div><p class="dim" style="font-size:12.5px;margin:10px 0 0">Erscheint an diesem Tag als eigene Szene in der Begrüßung und als persönliche Nachricht.</p>')};
ACT.grsave=function(d){var c=S.cfg=S.cfg&&typeof S.cfg==='object'?S.cfg:{},g={};for(var i=0;i<+d.n;i++){var a=$('#gra'+i),v=$('#grv'+i);if(!a)continue;var x={};if(a.value.trim())x.a=a.value.trim();if(v.value.trim())x.v=v.value.trim();if(x.a||x.v)g[a.dataset.u]=x}c.gruss=g;save();toast('Begrüßung gespeichert')};
ACT.grmsg=function(){var n=$('#grp').value,d=$('#grd').value,tx=$('#grt').value.trim();if(!n||!d||!tx)return toast('Bitte Person, Tag und Text angeben');var k=pmKey(n);S.funk[k]=S.funk[k]||[];S.funk[k].push({by:S.user,t:tx,ts:Date.now(),gd:d});save();$('#grt').value='';toast('Nachricht für '+n+' am '+fmtD(d,{day:'2-digit',month:'2-digit'})+' angelegt')};ACT.pfsnd=function(d){M.ls(pKey()+'.snd',d.v);render()};
window.playGreeting=greet;window.playDay=day;window.clipData={greet:greetData,day:nums};

/* ---------- Knöpfe ---------- */
var ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);var v=!!K.mime();
 if(p==='runde'){var o=document.querySelector('.sf-open');if(o&&!o.querySelector('.cl-row')){var b=o.querySelector('.btn.xl');var h='<div class="cl-row"><button class="btn" data-act="clgreet">▶ Begrüßung abspielen</button>'+(v?'<button class="btn ghost" data-act="clgreetv">Als Video speichern</button>':'')+'</div>';if(b)b.insertAdjacentHTML('afterend',h);else o.insertAdjacentHTML('beforeend',h)}}
 if(p==='woche'){var wc=document.querySelector('[data-act="wkc"]');if(wc&&!document.querySelector('[data-act="clweek"]'))wc.insertAdjacentHTML('beforebegin','<button class="btn sm" data-act="clweek">▶ Woche als Film</button>'+(v?'<button class="btn sm ghost" data-act="clweekv">Als Video</button>':''))}
 if(p==='tz'){var c=document.querySelector('[data-act="tzcp"]');if(c&&!document.querySelector('[data-act="clday"]'))c.insertAdjacentHTML('beforebegin','<button class="btn sm" data-act="clday">▶ Tag als Film</button>'+(v?'<button class="btn sm ghost" data-act="cldayv">Als Video</button>':''))}};
})();
