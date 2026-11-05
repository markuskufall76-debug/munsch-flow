/* ===== Vorsorge und Betrieb =====
   1 Qualifikationsrisiko: Wer kann was sicher, wer ist wann weg? Lücken der nächsten 4 Wochen,
     Warnung in der Warnlage und vor dem Genehmigen eines Urlaubs.
   2 Datensicherung: Datei herunterladen, wieder einspielen, Erinnerung nach 7 Tagen.
   3 Aufbewahrung: Krankmeldungen nach 13 Monaten löschen (Datenschutz, Gesundheitsdaten).
   4 Nutzung, anonym: Seitenaufrufe je Gerät und Tag ohne Personenbezug, Auswertung für den Pilot.
   5 Ruhiger Modus für Arbeitsgeräte (Tablet im Bereich): keine Kino-Übergänge.
   6 Anmeldekarten optional (Standard aus), Schnellanmeldung am Bereichs-Tablet. */
(function(){
'use strict';
var M=window.MF,cp=M.cp,card=M.card,ls=M.ls;
function cfg(){S.cfg=S.cfg&&typeof S.cfg==='object'?S.cfg:{};return S.cfg}
window.cardsOn=function(){return !!cfg().cards};

/* ---------- 1  Qualifikationsrisiko ---------- */
/* Fähigkeiten wie im Qualifikationsboard (pages.js, SK); 2 = sicher, 3 = Trainer */
var SK=['Stapler','Wareneingang','WEP','Säge Metall','Säge Kunststoff','Vorkommissionierung','Milkrun','Materialwagen','Werksverkehr','Lager Werk 1'];
function safe(sk){return CREW.filter(function(c){return ((S.quali[c.n]||{})[sk]||0)>=2}).map(function(c){return c.n})}
function workdays(n,from){var out=[],d=from||todayIso();if(!isWork(d))d=nextWork(d);for(var i=0;i<n;i++){out.push(d);d=nextWork(d)}return out}
/* extra: zusätzlicher Abwesenheitseintrag (zum Prüfen vor dem Genehmigen) */
function awayOn(d,extra){var a=absentOn(d).map(function(v){return v.emp});if(extra&&extra.d0<=d&&extra.d1>=d)a.push(extra.emp);return a}
window.qRisk=function(n,extra){var D=workdays(n||20),R=[];SK.forEach(function(sk){var all=safe(sk);if(!all.length)return;var days=D.map(function(d){var aw=awayOn(d,extra),here=all.filter(function(x){return aw.indexOf(x)<0});return {d:d,n:here.length,gone:all.filter(function(x){return aw.indexOf(x)>=0})}});R.push({sk:sk,all:all,days:days,zero:days.filter(function(x){return !x.n})})});return R};
function fmt(d){return fmtD(d,{weekday:'short',day:'2-digit',month:'2-digit'})}
var al0=window.alerts;window.alerts=function(now){var a=al0.apply(this,arguments);try{
 qRisk(10).filter(function(r){return r.zero.length}).slice(0,2).forEach(function(r){var z=r.zero[0];a.push({tone:'warn',t:r.sk+': am '+fmt(z.d)+' niemand sicher da'+(z.gone.length?' ('+z.gone.join(', ')+' abwesend)':''),go:'quali'})});
 if(isLead()){var b=cfg().backup;var age=b&&b.ts?Math.floor((Date.now()-b.ts)/864e5):null;if(window.SY&&SY.on&&(age==null||age>7))a.push({tone:'ice',t:age==null?'Noch keine Datensicherung heruntergeladen':'Letzte Datensicherung vor '+age+' Tagen',go:'adm'})}
}catch(e){}return a};
var q0=VIEW.quali;VIEW.quali=function(){var h=q0.apply(this,arguments),R=qRisk(20),D=workdays(20);
 var rows=R.map(function(r){var cells=r.days.map(function(x){var c=x.n===0?'z':x.n===1?'o':'g';return '<i class="'+c+'" title="'+fmt(x.d)+': '+x.n+' sicher da'+(x.gone.length?' · weg: '+esc(x.gone.join(', ')):'')+'"></i>'}).join('');
  return '<div class="qr-row'+(r.zero.length?' bad':'')+'"><div class="qr-n"><b>'+esc(r.sk)+'</b><span>'+r.all.length+' sicher: '+esc(r.all.join(', '))+'</span></div><div class="qr-d">'+cells+'</div><div class="qr-s">'+(r.zero.length?cp('crit',r.zero.length+' Tag'+(r.zero.length>1?'e':'')+' ohne'):r.all.length<2?cp('warn','nur 1 Person'):cp('ok','abgedeckt'))+'</div></div>'}).join('');
 var none=SK.filter(function(sk){return !safe(sk).length});
 var c=card('Ausfallrisiko · nächste 20 Arbeitstage','<div class="qr-head"><span></span><div class="qr-d lab">'+D.map(function(d,i){return '<em>'+(i%5===0?fmtD(d,{day:'2-digit',month:'2-digit'}):'')+'</em>'}).join('')+'</div><span></span></div>'+rows
  +(none.length?'<p class="dim" style="font-size:12.5px;margin:12px 0 0">Noch niemand als sicher eingetragen: '+esc(none.join(', '))+'.</p>':'')
  +'<div class="qr-lg dim"><span><i class="g"></i>2 oder mehr sicher da</span><span><i class="o"></i>nur 1</span><span><i class="z"></i>niemand</span><span>Grundlage: Qualifikationen und genehmigte Abwesenheiten</span></div>',{c:'qrc'});
 return c+h};
var vok0=ACT.vok;ACT.vok=function(d){var v=S.vacs.filter(function(x){return x.id===d.id})[0];if(!v)return vok0(d);
 var before={};qRisk(40).forEach(function(r){r.zero.forEach(function(z){before[r.sk+z.d]=1})});
 var hit=[];qRisk(40,{emp:v.emp,d0:v.d0,d1:v.d1}).forEach(function(r){r.zero.forEach(function(z){if(!before[r.sk+z.d])hit.push(r.sk+' am '+fmt(z.d))})});
 if(!hit.length)return vok0(d);confirmM('Wenn du genehmigst, ist niemand sicher da für: '+hit.slice(0,4).join(', ')+(hit.length>4?' und '+(hit.length-4)+' weitere':'')+'. Trotzdem genehmigen?',function(){vok0(d)},'Trotzdem genehmigen')};

/* ---------- 2  Datensicherung ---------- */
function dl(name,text){var b=new Blob([text],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){a.parentNode.removeChild(a);URL.revokeObjectURL(u)},3000)}
ACT.bakdl=function(){if(!window.SY||!SY.on)return toast('Sicherung gibt es nur mit der Zentrale');syApi('/api/backup').then(function(r){if(!r.rows)return toast(r.error||'Sicherung fehlgeschlagen');delete r._s;dl('munsch-zentrale-sicherung-'+todayIso()+'.json',JSON.stringify(r));cfg().backup={ts:Date.now(),by:S.user,n:r.count};save();render();toast('Sicherung gespeichert · '+r.count+' Einträge')})};
ACT.bakin=function(){var i=document.createElement('input');i.type='file';i.accept='.json,application/json';i.onchange=function(){var f=i.files&&i.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){var b;try{b=JSON.parse(rd.result)}catch(e){return toast('Datei ist keine Sicherung')}if(!b||b.app!=='MUNSCH Zentrale'||!Array.isArray(b.rows))return toast('Datei ist keine Sicherung der Zentrale');
  confirmM('Sicherung vom '+fmtDT(Date.parse(b.created))+' mit '+b.rows.length+' Einträgen einspielen? Einträge der Sicherung überschreiben den aktuellen Stand, neuere Einträge bleiben erhalten.',function(){restore(b.rows)},'Einspielen')};rd.readAsText(f)};i.click()};
function restore(rows){var ops=rows.filter(function(r){return r.v!=null}).map(function(r){return {s:r.s,k:r.k,v:r.v}}),i=0,n=0,rej=0;toast('Spiele ein …');
 (function next(){if(i>=ops.length){toast('Eingespielt: '+n+' Einträge'+(rej?' · '+rej+' abgelehnt':''));SY.seq=0;if(window.syPull)syPull(function(){render()});return}var part=ops.slice(i,i+200);i+=200;
  syApi('/api/push',{ops:part}).then(function(r){n+=r.n||0;rej+=(r.rej||[]).length;next()}).catch(function(){toast('Zentrale nicht erreichbar, abgebrochen nach '+n)})})()}

/* ---------- 3  Aufbewahrung: Krankmeldungen ---------- */
function oldSick(){var lim=iso(new Date(Date.now()-396*864e5));return S.vacs.filter(function(v){return v.type==='Krank'&&v.d1<lim})}
ACT.sickdel=function(){var o=oldSick();if(!o.length)return toast('Keine Krankmeldungen älter als 13 Monate');confirmM(o.length+' Krankmeldungen älter als 13 Monate endgültig löschen?',function(){var ids={};o.forEach(function(v){ids[v.id]=1});S.vacs=S.vacs.filter(function(v){return !ids[v.id]});logA('Aufbewahrung: '+o.length+' alte Krankmeldungen gelöscht');save();render();toast('Gelöscht')},'Löschen')};

/* ---------- 4  Nutzung, anonym ---------- */
function rid(){var r=ls('mflow.rid');if(!r){r=Math.random().toString(36).slice(2,10);ls('mflow.rid',r)}return r}
var go0=window.go;window.go=function(p){var r=go0.apply(this,arguments);try{if(window.SY&&SY.on&&M.PAGE[p]){S.use=S.use&&typeof S.use==='object'?S.use:{};var k=todayIso()+'.'+rid(),o=S.use[k]=S.use[k]||{};o[p]=(o[p]||0)+1}}catch(e){}return r};
window.useStats=function(days){days=days||28;var lim=iso(new Date(Date.now()-days*864e5)),U=S.use||{},sum={},dev={},act={};Object.keys(U).forEach(function(k){var d=k.slice(0,10);if(d<lim)return;dev[k.slice(11)]=1;act[d]=1;var o=U[k]||{};Object.keys(o).forEach(function(p){sum[p]=(sum[p]||0)+(+o[p]||0)})});
 var all=[];M.GROUPS.forEach(function(g){g.p.forEach(function(p){all.push([p[0],p[1],sum[p[0]]||0])})});all.sort(function(a,b){return b[2]-a[2]});return {all:all,devices:Object.keys(dev).length,days:Object.keys(act).length}};
var aw=VIEW.ausw;VIEW.ausw=function(){var h=aw.apply(this,arguments);if(!isLead())return h;var u=useStats(28),mx=Math.max.apply(null,u.all.map(function(x){return x[2]}).concat([1])),used=u.all.filter(function(x){return x[2]}),unused=u.all.filter(function(x){return !x[2]});
 var c=card('Nutzung im Pilot · 28 Tage, anonym',u.days?'<p class="dim" style="font-size:13px;margin:0 0 12px">'+u.days+(u.days===1?' Tag, ':' Tage, ')+u.devices+(u.devices===1?' Gerät':' Geräte')+'. Gezählt werden Seitenaufrufe je Gerät, ohne Person.</p><div class="us">'+used.slice(0,14).map(function(x){return '<div><span>'+esc(x[1])+'</span><i style="--w:'+(x[2]/mx*100).toFixed(1)+'%"></i><b>'+x[2]+'</b></div>'}).join('')+'</div>'
  +(unused.length?'<p style="margin:14px 0 6px"><b>Nicht genutzt</b> <span class="dim">· Kandidaten zum Aufräumen</span></p><div class="chips">'+unused.map(function(x){return cp('',x[1])}).join(' ')+'</div>':''):M.empty('Noch keine Nutzungsdaten','Zählt ab jetzt, sobald die Zentrale verbunden ist.'));
 return h+c};
/* alte Zählerzeilen (> 60 Tage) räumt das Gerät der Teamleitung auf */
setTimeout(function(){try{if(!isLead()||!S.use)return;var lim=iso(new Date(Date.now()-60*864e5)),n=0;Object.keys(S.use).forEach(function(k){if(k.slice(0,10)<lim){delete S.use[k];n++}});if(n)save()}catch(e){}},20000);

/* ---------- 5  Ruhiger Modus auf Arbeitsgeräten ---------- */
function lite(){var on=!!ls('mflow.area')||ls('mflow.lite')==='1';document.documentElement.classList.toggle('lite',on)}
lite();setInterval(lite,5000);

/* ---------- Einstellungen ---------- */
var adm=VIEW.adm;VIEW.adm=function(){var h=adm.apply(this,arguments);var lt=ls('mflow.lite')==='1';
 var dev=card('Darstellung auf diesem Gerät','<div class="seg"><button class="'+(lt?'':'on')+'" data-act="liteset" data-v="0">mit Bewegung</button><button class="'+(lt?'on':'')+'" data-act="liteset" data-v="1">ruhig</button></div><p class="dim" style="font-size:12.5px;margin:12px 0 0">Ruhig: keine Kino-Übergänge und kein bewegter Hintergrund, Rückmeldungen bleiben. Tablets mit festem Bereich sind automatisch ruhig.</p>');
 if(!isLead())return h+dev;var b=cfg().backup,o=oldSick().length;
 var bak=card('Datensicherung und Aufbewahrung','<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn pri" data-act="bakdl">Sicherung herunterladen</button><button class="btn" data-act="bakin">Sicherung einspielen</button><button class="btn ghost" data-act="sickdel">Krankmeldungen älter als 13 Monate löschen'+(o?' ('+o+')':'')+'</button></div>'
  +'<p class="dim" style="font-size:12.5px;margin:12px 0 0">'+(b&&b.ts?'Zuletzt gesichert am '+fmtDT(b.ts)+' von '+esc(b.by)+' ('+b.n+' Einträge). ':'Noch keine Sicherung heruntergeladen. ')+'Die Zentrale räumt jede Nacht auf (Protokoll 180 Tage) und sichert nach R2, wenn eingerichtet. Cloudflare D1 kann zusätzlich bis zu 30 Tage zurückspringen.</p>');
 var cards=card('Anmeldekarten','<div class="seg"><button class="'+(cardsOn()?'on':'')+'" data-act="cardset" data-v="1">verwenden</button><button class="'+(cardsOn()?'':'on')+'" data-act="cardset" data-v="0">aus</button></div><p class="dim" style="font-size:12.5px;margin:12px 0 0">Die App druckt eigene Karten mit Barcode für die Handscanner, Firmenausweise braucht es nicht. Ohne Karten: Name antippen und PIN, am Bereichs-Tablet stehen die heute Eingeteilten oben.</p>');
 return h+bak+cards+dev};
ACT.liteset=function(d){ls('mflow.lite',d.v==='1'?'1':null);lite();render()};
ACT.cardset=function(d){cfg().cards=d.v==='1';save();render()};

/* ---------- 6  Schnellanmeldung am Bereichs-Tablet ---------- */
/* Vor der Anmeldung kennt das Gerät den Schichtplan nicht: das Bereichs-Tablet merkt sich die Einteilung der nächsten 7 Tage (nur Namen) */
function hereCache(){var a=ls('mflow.area');if(!a||!S||!S.plan||!S.user)return;var o={},d=todayIso();for(var i=0;i<8;i++){var p=S.plan[d]||{};o[d]=Object.keys(p).filter(function(n){return p[n]===a});d=addDays(d,1)}try{ls('mflow.here',JSON.stringify({a:a,d:o}))}catch(e){}}
setInterval(hereCache,60000);var arH=window.afterRender;window.afterRender=function(p){if(arH)arH(p);hereCache()};
function hereToday(a){var p=S.plan&&S.plan[todayIso()];if(p&&Object.keys(p).length)return Object.keys(p).filter(function(n){return p[n]===a});try{var c=JSON.parse(ls('mflow.here')||'null');if(c&&c.a===a)return c.d[todayIso()]||[]}catch(e){}return []}
new MutationObserver(function(){var pl=$('#ppl'),a=ls('mflow.area');if(!pl||!a||pl.dataset.here)return;pl.dataset.here='1';var here=hereToday(a);
 if(!here.length)return;var hd=document.createElement('div');hd.className='lhere';hd.innerHTML='<b>'+esc(a)+'</b> · heute hier eingeteilt';pl.parentNode.insertBefore(hd,pl);
 here.slice().reverse().forEach(function(n){var b=pl.querySelector('.pc[data-u="'+n.replace(/"/g,'')+'"]');if(b){b.classList.add('here');pl.insertBefore(b,pl.firstChild)}})}).observe(document.body,{childList:true,subtree:true});
})();
