/* ===== Vor dem Pilot =====
   1 Sicherung prüfen: Datei einlesen und prüfen, ohne etwas zu überschreiben (Format, Vollständigkeit, Inhalt, Vergleich mit heute).
   2 Pilot-Auswertung: Erfolgskriterien aus dem Fahrplan Woche für Woche (Auswertung, nur Teamleitung).
   4 Urlaub über dem Anspruch: Hinweis beim Beantragen, Eintragen und Genehmigen.
   5 Fehlende Tageszahlen: ab 14:30 an Arbeitstagen in der Warnlage, mit den Abteilungen, die heute eingeteilt sind. */
(function(){
'use strict';
var M=window.MF,cp=M.cp,card=M.card;
function esc2(s){return esc(s==null?'':String(s))}
function cfg(){S.cfg=S.cfg&&typeof S.cfg==='object'?S.cfg:{};return S.cfg}

/* ---------- 5 Fehlende Tageszahlen ---------- */
/* Bereich im Schichtplan → Gruppen der Tageszahlen (wie die Zahlen-Leiste) */
var AREA2G={'Wareneingang':['Wareneingang'],'WEP':['WE-Prüfung'],'Materialwagen':['Materialwagen'],'Werk 1':['WE-Prüfung','Materialwagen'],'Säge Metall':['Säge Metall'],'Säge Kunststoff':['Säge Kunststoff'],
 'Vorkommissionierung':['Pumpen vor Lack','Pumpen vor Montage','Grundplatten'],'Werk 2':['Kommissionierung Werk 2'],'Werksverkehr':['Werksverkehr']};
var BASIS=['Wareneingang','Säge Metall','Säge Kunststoff','Pumpen vor Lack','Pumpen vor Montage'];
function groupsFor(d){var P=S.plan[d]||{},G={};Object.keys(P).forEach(function(n){(AREA2G[P[n]]||[]).forEach(function(g){G[g]=1})});var L=Object.keys(G);return L.length?L:BASIS}
/* Gruppen ohne einen einzigen Wert an diesem Tag; der Rückstand allein zählt nicht als erfasst */
window.tzMissing=function(d){var o=S.tz[d]||{};return groupsFor(d).filter(function(g){var G=TZ.filter(function(x){return x.g===g})[0];if(!G)return false;return !G.f.some(function(f){return !/_rueck$/.test(f[0])&&o[f[0]]!=null&&o[f[0]]!==''})})};
var al=window.alerts;window.alerts=function(now){var a=al.apply(this,arguments);try{var t=todayIso(),m=now.getHours()*60+now.getMinutes();
 if(isWork(t)&&m>=14*60+30){var L=tzMissing(t);if(L.length)a.push({tone:'warn',t:'Tageszahlen fehlen: '+L.join(', '),go:'tz'})}}catch(e){}return a};

/* ---------- 4 Urlaub über dem Anspruch ---------- */
/* Resturlaub im Jahr des Beginns, wenn der Zeitraum dazukommt (halbe Tage am 24. und 31.12. wie im Konto) */
function after(e,a,b,extra){var y=+a.slice(0,4);return konto(e,y).rest-(extra?wdays(a,b,y):0)}
window.vacOver=function(e,a,b,add){return after(e,a,b,add)};
var va=ACT.vadd;ACT.vadd=function(){var e=($('#ve')||{}).value,ty=($('#vt')||{}).value,a=($('#v0')||{}).value,b=($('#v1')||{}).value;
 if(ty!=='Urlaub'||!e||!a||!b||b<a||ACT.vadd._ok)return va.apply(this,arguments);var r=after(e,a,b,true);if(r>=0)return va.apply(this,arguments);
 var ve=e,vt=ty,v0=a,v1=b;closeModal();
 confirmM(esc2(ve)+' hätte danach '+String(r).replace('.',',')+' Tage Resturlaub '+a.slice(0,4)+', also mehr Urlaub als Anspruch. Trotzdem '+(isLead()?'eintragen':'beantragen')+'?',function(){
  /* Dialog mit den Werten neu aufbauen und ohne erneute Rückfrage absenden */
  ACT.vq({e:ve,d:v0});setTimeout(function(){var s=$('#vt'),x0=$('#v0'),x1=$('#v1');if(s)s.value=vt;if(x0)x0.value=v0;if(x1)x1.value=v1;ACT.vadd._ok=1;try{va()}finally{ACT.vadd._ok=0}},0)},isLead()?'Trotzdem eintragen':'Trotzdem beantragen')};
var vk=ACT.vok;ACT.vok=function(d){var v=S.vacs.filter(function(x){return x.id===d.id})[0];if(!v||v.type!=='Urlaub'||d._ok)return vk.apply(this,arguments);
 var r=konto(v.emp,+v.d0.slice(0,4)).rest;if(r>=0)return vk.apply(this,arguments);
 confirmM(esc2(v.emp)+' hat mit diesem Antrag '+String(r).replace('.',',')+' Tage Resturlaub '+v.d0.slice(0,4)+'. Trotzdem genehmigen?',function(){vk({id:d.id,_ok:1})},'Trotzdem genehmigen')};
/* offene Anträge: Hinweis direkt am Eintrag */
var ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);if(p!=='urlaub'||!isLead())return;
 document.querySelectorAll('[data-act="vok"]').forEach(function(btn){var v=S.vacs.filter(function(x){return x.id===btn.dataset.id})[0];if(!v||v.type!=='Urlaub')return;var r=konto(v.emp,+v.d0.slice(0,4)).rest,row=btn.parentElement;
  if(r<0&&row&&!row.querySelector('.vo-over'))btn.insertAdjacentHTML('beforebegin','<span class="chip warn vo-over" title="Resturlaub mit diesem Antrag">Rest '+String(r).replace('.',',')+'</span>')})};

/* ---------- 1 Sicherung prüfen ---------- */
function bakCheck(b,fileName){var R={ok:true,lines:[]},add=function(ok,t){R.lines.push([ok,t]);if(ok===false)R.ok=false};
 var fmt=b&&b.app==='MUNSCH Zentrale'&&Array.isArray(b.rows);add(fmt,fmt?'Format: Sicherung der MUNSCH Zentrale':'Format: keine Sicherung der MUNSCH Zentrale');if(!fmt)return R;
 var cr=Date.parse(b.created),age=isFinite(cr)?Math.floor((Date.now()-cr)/864e5):null;
 add(age!=null,isFinite(cr)?'Erstellt am '+fmtDT(cr)+(age!=null?' ('+(age===0?'heute':age===1?'gestern':'vor '+age+' Tagen')+')':''):'Erstellungsdatum fehlt');
 if(age!=null&&age>7)add(null,'Älter als 7 Tage: für den Ernstfall eine frische Sicherung herunterladen');
 var cnt=b.count==null||b.count===b.rows.length;add(cnt,cnt?b.rows.length+' Einträge, vollständig':'Anzahl stimmt nicht: '+b.rows.length+' von '+b.count+' Einträgen');
 var bad=0,sec={};b.rows.forEach(function(r){if(!r||typeof r.s!=='string'||typeof r.k!=='string'){bad++;return}if(r.v!=null){try{JSON.parse(r.v)}catch(e){bad++;return}}sec[r.s]=(sec[r.s]||0)+(r.v==null?0:1)});
 add(!bad,bad?bad+' Einträge beschädigt':'Alle Einträge lesbar');
 var tz=b.rows.filter(function(r){return r.s==='tz'&&r.v!=null}).map(function(r){return r.k}).sort();
 add(tz.length>0,tz.length?'Tageszahlen: '+tz.length+' Tage, '+fmtD(tz[0],{day:'2-digit',month:'2-digit',year:'numeric'})+' bis '+fmtD(tz[tz.length-1],{day:'2-digit',month:'2-digit',year:'numeric'}):'Keine Tageszahlen enthalten');
 var reg=Object.keys(sec).filter(function(s){return s.indexOf('reg.')===0}).reduce(function(a,s){return a+sec[s]},0);
 add(null,'Fächer '+(sec.fach||0)+' · Abwesenheiten '+(sec.vacs||0)+' · Registereinträge '+reg+' · Schichtplan-Tage '+(sec.plan||0)+' · Bereiche '+Object.keys(sec).length);
 if(window.SY&&SY.on&&SY.last){var now=0,miss=0,inB={};b.rows.forEach(function(r){inB[r.s+'\u0001'+r.k]=1});Object.keys(SY.last).forEach(function(s){Object.keys(SY.last[s]||{}).forEach(function(k){if(SY.last[s][k]==null)return;now++;if(!inB[s+'\u0001'+k])miss++})});
  add(null,'Heute in der Zentrale: '+now+' Einträge, davon '+miss+' neuer als die Sicherung (bleiben beim Einspielen erhalten)')}
 add(null,'PINs und Anmeldungen sind nicht Teil der Sicherung, sie bleiben in der Zentrale.');
 R.name=fileName;R.created=b.created;R.n=b.rows.length;return R}
window.bakCheck=bakCheck;
ACT.baktest=function(){var i=document.createElement('input');i.type='file';i.accept='.json,application/json';i.onchange=function(){var f=i.files&&i.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){var b=null;try{b=JSON.parse(rd.result)}catch(e){}bakShow(bakCheck(b,f.name))};rd.readAsText(f)};i.click()};
function bakShow(R){var c=cfg();c.bakTest={ts:Date.now(),by:S.user,ok:R.ok,n:R.n||0,created:R.created||null};save();
 modal('<h3>Sicherung geprüft</h3><p class="dim" style="margin:6px 0 14px">'+esc2(R.name||'')+'</p><div class="bk-r">'+R.lines.map(function(l){return '<div class="'+(l[0]===true?'ok':l[0]===false?'no':'in')+'"><i></i><span>'+esc2(l[1])+'</span></div>'}).join('')+'</div>'
  +'<p class="lead" style="margin:16px 0 0"><b>'+(R.ok?'Diese Sicherung lässt sich einspielen.':'Diese Datei taugt nicht als Sicherung.')+'</b> Es wurde nichts verändert.</p><div class="acts"><button class="btn pri" data-act="mclose">Fertig</button></div>');render()}
var adm=VIEW.adm;VIEW.adm=function(){var h=adm.apply(this,arguments);if(!isLead())return h;var t=cfg().bakTest;
 var line='<p class="dim bk-last" style="font-size:12.5px;margin:10px 0 0">'+(t&&t.ts?'Zuletzt geprüft am '+fmtDT(t.ts)+' von '+esc2(t.by)+': '+(t.ok?'in Ordnung':'nicht in Ordnung')+(t.created?' (Sicherung vom '+fmtD(t.created.slice(0,10),{day:'2-digit',month:'2-digit'})+')':'')+'.':'Noch keine Sicherung geprüft. Einmal vor dem Pilot prüfen.')+'</p>';
 return h.replace('<button class="btn" data-act="bakin">Sicherung einspielen</button>','<button class="btn" data-act="baktest">Sicherung prüfen</button><button class="btn" data-act="bakin">Sicherung einspielen</button>').replace(/(Cloudflare D1 kann zusätzlich bis zu 30 Tage zurückspringen\.<\/p>)/,'$1'+line)};
/* Warnlage: vor dem Pilot noch nie geprüft */
var al2=window.alerts;window.alerts=function(now){var a=al2.apply(this,arguments);try{if(isLead()&&window.SY&&SY.on&&!(cfg().bakTest&&cfg().bakTest.ok))a.push({tone:'ice',t:'Sicherung noch nie geprüft',go:'adm'})}catch(e){}return a};

/* ---------- 2 Pilot-Auswertung ---------- */
function pcfg(){var c=cfg();c.pilot=c.pilot||{};return {start:c.pilot.start||'2027-01-04',weeks:+c.pilot.weeks||4}}
function monday(d){var w=new Date(d+'T12:00:00').getDay();return addDays(d,-((w+6)%7))}
function weeks(){var p=pcfg(),t=todayIso(),W=[],s;
 if(t<p.start){s=addDays(monday(t),-21);for(var i=0;i<4;i++)W.push(addDays(s,7*i));return {W:W,pre:true}}
 s=monday(p.start);for(var j=0;j<Math.max(p.weeks,1);j++){var w=addDays(s,7*j);if(w>t)break;W.push(w)}return {W:W,pre:false}}
function wdaysIn(w){var t=todayIso(),L=[];for(var i=0;i<5;i++){var d=addDays(w,i);if(d<=t&&isWork(d))L.push(d)}var sa=addDays(w,5);if(sa<=t&&isWork(sa))L.push(sa);return L}
function kw(d){var x=new Date(d+'T12:00:00');x.setDate(x.getDate()+3-(x.getDay()+6)%7);var j=new Date(x.getFullYear(),0,4);return 1+Math.round(((x-j)/864e5-3+(j.getDay()+6)%7)/7)}
function milkOk(d){var m=S.milk[d]||{};return Object.keys(m).filter(function(i){return m[i]&&m[i].e}).length>=9}
var ERR=null;function errLoad(){if(ERR!==null||!window.SY||!SY.on||!SY.tok)return;ERR=[];syApi('/api/errs').then(function(r){ERR=r.errs||[];if(S.ui.page==='ausw')render()}).catch(function(){})}
function crit(){var R=weeks(),C=[
 {k:'Milkrun im Flow erfasst',z:'mindestens 9 von 10 Runden je Arbeitstag',f:function(D){var n=D.filter(milkOk).length;return [n,D.length,D.length&&n/D.length>=.9]}},
 {k:'Shopfloor 06:45 mit Flow',z:'an jedem Arbeitstag abgeschlossen',f:function(D){var n=D.filter(function(d){return S.runde[d]&&S.runde[d].fin}).length;return [n,D.length,D.length&&n===D.length]}},
 {k:'Tageszahlen vollständig',z:'alle eingeteilten Abteilungen',f:function(D){var n=D.filter(function(d){return !tzMissing(d).length}).length;return [n,D.length,D.length&&n/D.length>=.9]}},
 {k:'Fehlerberichte der Geräte',z:'möglichst keine',f:function(D,w){if(ERR===null)return ['–','',null];var e=addDays(w,7),n=ERR.filter(function(x){var d=iso(new Date(x.ts));return d>=w&&d<e}).reduce(function(a,x){return a+(x.n||1)},0);return [n,'',n===0]}},
 {k:'Rückmeldungen im Team',z:'mehr Gutes als Störendes',f:function(D,w){var e=addDays(w,7),L=Object.keys(S.fb||{}).map(function(k){return S.fb[k]}).filter(function(x){return x&&x.d>=w&&x.d<e}),g=L.filter(function(x){return x.cat==='gut'}).length,s=L.filter(function(x){return x.cat==='stoert'}).length;return [g+' : '+s,'',L.length?g>=s:null]}}];
 return {R:R,C:C}}
function pilotCard(){errLoad();var X=crit(),R=X.R,p=pcfg();
 var head='<tr><th>Kriterium</th><th>Ziel</th>'+R.W.map(function(w){return '<th class="n">KW '+kw(w)+'</th>'}).join('')+'</tr>';
 var all=[];var rows=X.C.map(function(c){return '<tr><td style="font-weight:600">'+c.k+'</td><td class="dim">'+c.z+'</td>'+R.W.map(function(w){var D=wdaysIn(w),r=c.f(D,w),tone=r[2]===true?'ok':r[2]===false?'crit':'';if(D.length||r[1]==='')all.push(r[2]);return '<td class="n">'+(D.length||r[1]===''?cp(tone,r[1]!==''?r[0]+' / '+r[1]:String(r[0])):'<span class="dim">–</span>')+'</td>'}).join('')+'</tr>'}).join('');
 var judged=all.filter(function(x){return x!=null}),pass=judged.length&&judged.every(function(x){return x}),bad=judged.filter(function(x){return x===false}).length;
 var sum=R.pre?'<p class="dim" style="margin:0 0 12px;font-size:13.5px">Der Pilot beginnt am '+fmtD(p.start,{day:'2-digit',month:'2-digit',year:'numeric'})+'. Bis dahin zeigt die Tabelle die letzten vier Wochen als Probelauf.</p>'
  :'<p style="margin:0 0 12px">'+(pass?cp('ok','Alle Kriterien erfüllt'):cp(bad?'crit':'warn',bad+' Mal nicht erfüllt'))+' <span class="dim" style="font-size:13px">Woche '+R.W.length+' von '+p.weeks+'</span></p>';
 return card('Pilot-Auswertung',sum+'<div class="tw"><table class="t pil">'+'<thead>'+head+'</thead><tbody>'+rows+'</tbody></table></div>'
  +'<div class="frm" style="margin-top:14px"><label class="fl">Pilot ab<input class="in" type="date" id="pls" data-in="pls" value="'+p.start+'"></label><label class="fl">Wochen<input class="in" type="number" min="1" max="12" id="plw" data-in="plw" value="'+p.weeks+'"></label></div>'
  +'<p class="dim" style="font-size:12.5px;margin:10px 0 0">Ausfälle der Zentrale und ersetzte Papierlisten lassen sich nicht automatisch messen; die beiden Punkte im Team besprechen. Fehlerberichte werden 300 Stück lang aufbewahrt.</p>',{r:R.pre?cp('','Probelauf'):cp('sig','Pilot')})}
window.pilotCard=pilotCard;
var aw=VIEW.ausw;VIEW.ausw=function(){var h=aw.apply(this,arguments);return isLead()?h+'<div id="pilmark" hidden></div>'+pilotCard():h};
/* direkt unter das Kopfbild der Seite stellen */
var ar3=window.afterRender;window.afterRender=function(p){if(ar3)ar3(p);if(p!=='ausw')return;var mk=$('#pilmark'),c=mk&&mk.nextElementSibling,sc=mk&&mk.parentElement;if(!c||!sc)return;var hero=sc.querySelector(':scope > .ph, :scope > .hero');mk.remove();if(hero)hero.after(c);else sc.insertBefore(c,sc.firstChild)};
document.addEventListener('change',function(e){var el=e.target;if(!el||!el.dataset)return;var c=cfg();c.pilot=c.pilot||{};
 if(el.dataset.in==='pls'&&/^\d{4}-\d{2}-\d{2}$/.test(el.value)){c.pilot.start=el.value;save();render()}
 else if(el.dataset.in==='plw'){var n=Math.max(1,Math.min(12,+el.value||4));c.pilot.weeks=n;save();render()}});
})();
