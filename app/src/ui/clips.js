/* ===== Clips: Shopfloor-Begrüßung und „Tag in Zahlen“ =====
   Zwei kurze Filme in 1920×1080, gezeichnet auf eine Leinwand (gleiche Technik wie der Monatsrückblick, filmrec.js).
   In der App abspielbar (Vollbild, Esc schließt) und als Videodatei speicherbar (MP4, sonst WebM).
   – Begrüßung: Guten Morgen, Anwesenheit (nur Zahlen, keine Namen), Gestern in Zahlen, Sicherheit, Heute, Los geht’s.
   – Tag in Zahlen: ein Arbeitstag mit Kennzahlen, Sägen gegen Ziel, Wareneingang gegen Ø 20 Tage.
   Knöpfe: Eröffnungsfolie im Shopfloor 06:45 und Tageszahlen. */
(function(){
'use strict';
var K=window.filmKit;if(!K)return;
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
 return {t:t,hi:h<11?'Guten Morgen,':h<17?'Guten Tag,':'Guten Abend,',date:fmtD(t,{weekday:'long',day:'numeric',month:'long'}),kw:kw(t),work:work,
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
  head(x,t,g.hi.toUpperCase(),580,190,C.ink,.25,true);head(x,t,'LIEBES TEAM.',770,190,C.sig,.55,true);line(x,t,g.date,860,1.1,C.dim,'500 34px '+F.m,true)}]));
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
function play(make,rec){closeClip();var c=document.createElement('div');c.id='clip';c.setAttribute('role','dialog');c.setAttribute('aria-label','Film');
 c.innerHTML='<canvas width="'+W+'" height="'+K.H+'"></canvas><div class="cl-ctl"><button class="btn sm ghost" data-act="clrec">Als Video speichern</button><button class="btn sm" data-act="clx">Schließen</button></div>';
 document.body.appendChild(c);var x=c.querySelector('canvas').getContext('2d');
 Promise.all([K.fonts(),K.loadLogo(),K.imgs()]).then(function(r){if(!$('#clip'))return;var SC=make(r[1]),tot=SC.reduce(function(a,s){return a+s[0]},0),t0=performance.now();PL={rec:rec,raf:0,end:0};
  (function f(){if(!PL||!$('#clip'))return;var T=(performance.now()-t0)/1000;K.paint(x,SC,Math.min(T,tot-.36));if(T>=tot){PL.end=setTimeout(closeClip,1500);return}PL.raf=requestAnimationFrame(f)})()});
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
window.playGreeting=greet;window.playDay=day;window.clipData={greet:greetData,day:nums};

/* ---------- Knöpfe ---------- */
var ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);var v=!!K.mime();
 if(p==='runde'){var o=document.querySelector('.sf-open');if(o&&!o.querySelector('.cl-row')){var b=o.querySelector('.btn.xl');var h='<div class="cl-row"><button class="btn" data-act="clgreet">▶ Begrüßung abspielen</button>'+(v?'<button class="btn ghost" data-act="clgreetv">Als Video speichern</button>':'')+'</div>';if(b)b.insertAdjacentHTML('afterend',h);else o.insertAdjacentHTML('beforeend',h)}}
 if(p==='tz'){var c=document.querySelector('[data-act="tzcp"]');if(c&&!document.querySelector('[data-act="clday"]'))c.insertAdjacentHTML('beforebegin','<button class="btn sm" data-act="clday">▶ Tag als Film</button>'+(v?'<button class="btn sm ghost" data-act="cldayv">Als Video</button>':''))}};
})();
