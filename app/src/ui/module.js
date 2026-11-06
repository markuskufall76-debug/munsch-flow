/* ===== Zusatzmodule, je Modul ein- und ausschaltbar (Einstellungen › Module, nur Teamleitung) =====
   Unterweisungen und Berechtigungen mit Ablaufdatum · Lieferanten-Auswertung · Materialabruf (Kanban) ·
   Fehlteile · Leergut und Ladungsträger · Versand und Abholungen · Verbesserungsvorschläge · Arbeitsanweisungen.
   Register nutzen den bewährten Registerbaustein (regView), Daten als S.reg.<kürzel> (Abgleich wie bisher).
   Einstellungen und Stammdaten der Teamleitung in S.cfg (nur Teamleitung schreibt, Regel im Server).
   Muss vor pagehero.js geladen werden, damit die neuen Seiten ihr Kopfbild bekommen. */
(function(){
'use strict';
var M=window.MF,card=M.card,cp=M.cp,ic=M.ic,tile=M.tile,empty=M.empty;
var NAMES=CREW.map(function(c){return c.n});
function cfg(){S.cfg=S.cfg&&typeof S.cfg==='object'?S.cfg:{};return S.cfg}
function ensure(k){S.reg[k]=S.reg[k]||[];return S.reg[k]}

/* ---------- Module ---------- */
var MODS=[
 {id:'unt',t:'Unterweisungen und Berechtigungen',d:'Staplerschein, Unterweisung, Kran, Gefahrgut, Ersthelfer mit Ablaufdatum; Erinnerung 30 Tage vorher.',pages:['unt'],on:1},
 {id:'lief',t:'Lieferanten-Auswertung',d:'Lieferungen, Pakete, Prüfaufwand und Sperrungen je Lieferant aus Wareneingang und WEP.',pages:['lief'],on:1},
 {id:'abruf',t:'Materialabruf (Kanban)',d:'Produktion meldet Bedarf, der Milkrun nimmt ihn mit; Warnung nach 60 Minuten.',pages:['abruf']},
 {id:'fehl',t:'Fehlteile',d:'Fehlende Teile je Auftrag mit Zuständigkeit und Status.',pages:['fehl']},
 {id:'leer',t:'Leergut und Ladungsträger',d:'Europaletten, Gitterboxen, KLT und Spezialbehälter im Tausch mit Partnern.',pages:['leer']},
 {id:'vers',t:'Versand und Abholungen',d:'Was heute rausgeht, mit Spedition und Abholtermin.',pages:['vers']},
 {id:'kvp',t:'Verbesserungsvorschläge',d:'Ideen aus dem Team mit Status und Rückmeldung.',pages:['kvp']},
 {id:'aa',t:'Arbeitsanweisungen',d:'Kurze Schritt-für-Schritt-Anleitungen je Bereich, für alle lesbar.',pages:['aa']}];
function modOn(id){var m=cfg().mods||{};if(id in m)return !!m[id];var x=MODS.filter(function(z){return z.id===id})[0];return !!(x&&x.on)}
var PMOD={};MODS.forEach(function(m){m.pages.forEach(function(p){PMOD[p]=m.id})});
window.modOn=modOn;

/* Seiten einhängen (Navigation, Titel) */
function addPage(gid,p,t,lead){var g=M.GROUPS.filter(function(x){return x.id===gid})[0];if(!g)return;g.p.push(lead?[p,t,'lead']:[p,t]);M.PAGE[p]={t:t,g:g,lead:!!lead}}
addPage('pers','unt','Unterweisungen');addPage('lager','lief','Lieferanten');addPage('lager','abruf','Materialabruf');addPage('prod','fehl','Fehlteile');
addPage('lager','leer','Leergut und Ladungsträger');addPage('lager','vers','Versand und Abholungen');addPage('komm','kvp','Verbesserungsvorschläge');addPage('komm','aa','Arbeitsanweisungen');
var nf=window.navFilter;window.navFilter=function(p){if(PMOD[p]&&!modOn(PMOD[p]))return false;return nf?nf(p):true};

/* ---------- Register ---------- */
REG.abruf={t:'Materialabruf',k:'Bedarf aus der Produktion, der Milkrun nimmt ihn mit',st:['angefordert','im Milkrun','geliefert'],done:[2],f:[['ref','Material oder Auftrag','t'],['ziel','Wohin','s',['Montage','Lack','Vorkommissionierung','Werk 1','Werk 2','Säge Metall','Säge Kunststoff']],['menge','Menge','n']],cols:['ref','ziel','menge']};
REG.fehl={t:'Fehlteile',k:'Fehlende Teile je Auftrag',st:['gemeldet','beim Einkauf','bestellt','eingetroffen','erledigt'],done:[4],f:[['ref','Auftragsnummer (7 Ziffern)','a'],['teil','Teil oder Material','t'],['wer','Kümmert sich','s',NAMES]],cols:['ref','teil','wer']};
REG.leer={t:'Leergut und Ladungsträger',k:'Behälter im Tausch mit Lieferanten und Speditionen',st:['erhalten','zur Rückgabe bereit','zurückgegeben'],done:[2],f:[['ref','Partner (Lieferant oder Spedition)','t'],['art','Ladungsträger','s',['Europalette','Gitterbox','KLT','Spezialbehälter','sonstige']],['anz','Anzahl','n']],cols:['ref','art','anz']};
REG.vers={t:'Versand und Abholungen',k:'Was rausgeht, mit Spedition und Abholtermin',st:['geplant','bereitgestellt','verladen','abgeholt'],done:[3],f:[['ref','Auftrag oder Sendung','t'],['sped','Spedition','t'],['datum','Abholung','d']],cols:['ref','sped','datum']};
REG.kvp={t:'Verbesserungsvorschläge',k:'Ideen aus dem Team',st:['eingereicht','in Prüfung','umgesetzt','abgelehnt'],done:[2,3],f:[['ref','Idee','t'],['ber','Bereich','s',['Wareneingang','WEP','Lager','Säge','Milkrun','Werk 1','Werk 2','Versand','Sonstiges']]],cols:['ref','ber']};
['abruf','fehl','leer','vers','kvp'].forEach(function(k){VIEW[k]=function(){ensure(k);return regView(k)}});
/* Zeitpunkt je Statuswechsel festhalten (für Durchlaufzeiten) */
var rst0=ACT.rst;ACT.rst=function(d){var r=rst0.apply(this,arguments);if(REG[d.k]&&['abruf','fehl','vers'].indexOf(d.k)>=0){var e=S.reg[d.k].filter(function(x){return x.id===d.id})[0];if(e&&!e['t'+e.st]){e['t'+e.st]=Date.now();save()}}return r};
var ro0=window.regOpen;window.regOpen=function(k){ensure(k);return ro0(k)};

/* ---------- Unterweisungen und Berechtigungen ---------- */
var UT=[['stap','Staplerschein'],['unt','Sicherheitsunterweisung'],['kran','Kranschein'],['gg','Gefahrgut'],['eh','Ersthelfer']];
function ud(){return cfg().unt||{}}
function stat(d){if(!d)return '';var t=todayIso(),n=Math.round((new Date(d+'T12:00:00')-new Date(t+'T12:00:00'))/864e5);return n<0?'crit':n<=30?'warn':'ok'}
function dueList(only){var U=ud(),L=[];Object.keys(U).forEach(function(n){if(only&&n!==only)return;UT.forEach(function(u){var d=U[n][u[0]],s=stat(d);if(s==='crit'||s==='warn')L.push({n:n,u:u[1],d:d,s:s})})});return L}
VIEW.unt=function(){var lead=isLead(),U=ud(),t=todayIso(),P=lead?CREW:CREW.filter(function(c){return c.n===S.user}),L=dueList(lead?null:S.user);
 var head='<div class="row r4">'+tile({k:'Abgelaufen',v:String(L.filter(function(x){return x.s==='crit'}).length),tone:L.some(function(x){return x.s==='crit'})?'crit':'ok'})+tile({k:'In 30 Tagen fällig',v:String(L.filter(function(x){return x.s==='warn'}).length),tone:L.some(function(x){return x.s==='warn'})?'warn':'ok'})+'</div>';
 var rows=P.map(function(c,i){return '<tr><td style="font-weight:600">'+esc(c.n)+'</td>'+UT.map(function(u){var d=(U[c.n]||{})[u[0]]||'',s=stat(d);return '<td>'+(lead?'<input class="in" type="date" id="ut_'+i+'_'+u[0]+'" value="'+d+'" style="height:38px;min-width:140px">':(d?fmtD(d,{day:'2-digit',month:'2-digit',year:'numeric'}):'–'))+(s&&s!=='ok'?' '+cp(s,s==='crit'?'abgelaufen':'bald fällig'):'')+'</td>'}).join('')+'</tr>'}).join('');
 return head+card(lead?'Gültig bis':'Deine Nachweise','<div class="tw"><table class="t"><thead><tr><th>Person</th>'+UT.map(function(u){return '<th>'+u[1]+'</th>'}).join('')+'</tr></thead><tbody>'+rows+'</tbody></table></div>'+(lead?'<div style="margin-top:14px"><button class="btn pri" data-act="utsave">Speichern</button></div><p class="dim" style="font-size:13px;margin:10px 0 0">Leer lassen, wenn nicht zutreffend. Erinnerung 30 Tage vor Ablauf in der Warnlage. Jede Person sieht nur ihre eigenen Nachweise.</p>':''))};
ACT.utsave=function(){var U={};CREW.forEach(function(c,i){var o={};UT.forEach(function(u){var e=$('#ut_'+i+'_'+u[0]);if(e&&e.value)o[u[0]]=e.value});if(Object.keys(o).length)U[c.n]=o});cfg().unt=U;save();render();toast('Nachweise gespeichert')};

/* ---------- Lieferanten-Auswertung ---------- */
function norm(s){return String(s||'').trim().replace(/\s+/g,' ').replace(/[ ,;:]+(LS|Lieferschein|Nr\.?)\s*[\w-]*$/i,'')}
VIEW.lief=function(){var days=+(S.ui.lfd||90),from=Date.now()-days*864e5,A={};
 function row(n){var k=n.toLowerCase();return A[k]=A[k]||{n:n,we:0,pak:0,wep:0,sp:0,min:0}}
 ensure('we').forEach(function(e){if(e.ts<from||!e.ref)return;var r=row(norm(e.ref));r.we++;r.pak+=+e.pak||0});
 ensure('wep').forEach(function(e){if(e.ts<from||!e.ref)return;var r=row(norm(e.ref));r.wep++;if(e.st===3)r.sp++;r.min+=+e.dauer||0});
 var L=Object.keys(A).map(function(k){return A[k]}).sort(function(a,b){return (b.sp-a.sp)||(b.min-a.min)||(b.we-a.we)});
 var seg='<div class="seg">'+[[30,'30 Tage'],[90,'90 Tage'],[365,'1 Jahr']].map(function(x){return '<button class="'+(days===x[0]?'on':'')+'" data-act="lfd" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>';
 var tb=L.length?'<div class="tw"><table class="t"><thead><tr><th>Lieferant</th><th class="n">Lieferungen</th><th class="n">Pakete</th><th class="n">Prüfungen</th><th class="n">Gesperrt</th><th class="n">Sperrquote</th><th class="n">Prüfminuten</th></tr></thead><tbody>'+L.map(function(r){var q=r.wep?Math.round(r.sp/r.wep*100):0;return '<tr><td style="font-weight:600">'+esc(r.n)+'</td><td class="n">'+r.we+'</td><td class="n">'+r.pak+'</td><td class="n">'+r.wep+'</td><td class="n">'+(r.sp?cp('crit',String(r.sp)):'0')+'</td><td class="n">'+(r.wep?q+' %':'–')+'</td><td class="n">'+r.min+'</td></tr>'}).join('')+'</tbody></table></div><p class="dim" style="font-size:13px;margin:12px 0 0">Zusammengefasst nach dem Namen im Feld „Lieferant“ (Wareneingang) bzw. „Lieferung“ (WEP). Einheitlich schreiben, dann stimmt die Zuordnung.</p>'
  :empty('Noch keine Lieferungen','Sobald Wareneingang und WEP Einträge haben, erscheint hier die Auswertung.');
 return '<div class="row r4">'+tile({k:'Lieferanten',v:String(L.length)})+tile({k:'Lieferungen',v:String(L.reduce(function(a,r){return a+r.we},0))})+tile({k:'Gesperrt',v:String(L.reduce(function(a,r){return a+r.sp},0)),tone:L.some(function(r){return r.sp})?'warn':'ok'})+tile({k:'Prüfminuten',v:String(L.reduce(function(a,r){return a+r.min},0))})+'</div>'+card('Je Lieferant',tb,{r:seg})};
ACT.lfd=function(d){S.ui.lfd=+d.v;save();render()};

/* ---------- Arbeitsanweisungen ---------- */
var AB=['Wareneingang','WEP','Lager','Säge Metall','Säge Kunststoff','Milkrun','Vorkommissionierung','Werk 1','Werk 2','Versand','Allgemein'];
VIEW.aa=function(){var lead=isLead(),A=(cfg().aa||[]).slice(),by={};A.forEach(function(a){(by[a.b]=by[a.b]||[]).push(a)});
 var list=Object.keys(by).length?AB.filter(function(b){return by[b]}).map(function(b){return card(esc(b),by[b].map(function(a){var st=String(a.x||'').split(/\n+/).filter(Boolean);return '<div class="aa"><h3>'+esc(a.t)+'</h3><ol>'+st.map(function(s){return '<li>'+esc(s.replace(/^\d+[.)]\s*/,''))+'</li>'}).join('')+'</ol>'+(lead?'<button class="btn sm ghost" data-act="aadel" data-id="'+a.id+'">Entfernen</button>':'')+'</div>'}).join(''))}).join('')
  :empty('Noch keine Anleitungen',lead?'Die erste Anleitung kommt über das Formular.':'Die Teamleitung legt Anleitungen an.');
 var form=lead?card('Neue Anleitung','<div class="frm"><label class="fl">Bereich<select class="in" id="aab">'+AB.map(function(b){return '<option>'+b+'</option>'}).join('')+'</select></label><label class="fl w2">Titel<input class="in" id="aat" maxlength="80" placeholder="z. B. Einlagern mit Scanner"></label></div><label class="fl" style="margin-top:14px">Schritte, einer je Zeile<textarea class="in" id="aax" rows="5" placeholder="Auftragsnummer scannen&#10;Fach wählen&#10;Mit Enter bestätigen"></textarea></label><div style="margin-top:12px"><button class="btn pri" data-act="aaadd">Anlegen</button></div>'):'';
 return form+list};
ACT.aaadd=function(){var t=$('#aat').value.trim(),x=$('#aax').value.trim();if(!t||!x)return toast('Bitte Titel und Schritte angeben');var c=cfg();c.aa=(c.aa||[]).concat([{id:uid(),b:$('#aab').value,t:t,x:x}]);save();render();toast('Anleitung angelegt')};
ACT.aadel=function(d){confirmM('Anleitung entfernen?',function(){var c=cfg();c.aa=(c.aa||[]).filter(function(a){return a.id!==d.id});save();render()},'Entfernen','no')};

/* ---------- Materialabruf im Milkrun ---------- */
function abOpen(){return ensure('abruf').filter(function(e){return e.st<2})}
var ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);if(p!=='milk'||!modOn('abruf'))return;var sc=document.querySelector('#stage .scene');if(!sc||sc.querySelector('.ab-card'))return;var O=abOpen().sort(function(a,b){return a.ts-b.ts});
 var h=card('Offene Abrufe',O.length?'<div class="al">'+O.map(function(e){var m=Math.round((Date.now()-e.ts)/6e4),tone=e.st===1?'':m>60?'crit':m>30?'warn':'';return '<div class="ab-r '+tone+'"><span><b>'+esc(e.ref)+'</b> → '+esc(e.ziel)+(e.menge?' · '+e.menge:'')+' <em class="dim">vor '+m+' Min.</em></span><button class="btn sm'+(e.st?'':' pri')+'" data-act="rst" data-k="abruf" data-id="'+e.id+'" data-n="1">'+(e.st?'Geliefert':'Mitnehmen')+'</button></div>'}).join('')+'</div>':'<div class="calm"><b>Kein offener Abruf</b><span>Die Produktion meldet Bedarf unter Materialabruf.</span></div>',{c:'ab-card',r:'<button class="btn sm" data-act="go" data-go="abruf">Alle</button>'});
 var after=sc.querySelector('.ph');if(after)after.insertAdjacentHTML('afterend',h);else sc.insertAdjacentHTML('afterbegin',h)};

/* ---------- Auswahl per Antippen statt Liste ----------
   In allen Registern werden Auswahlfelder mit bis zu 6 Möglichkeiten zu großen Tasten. Die letzte Wahl bleibt
   je Register und Feld gemerkt. Im Wareneingang mit Symbolen: Pakete, GB / Pal, Metall, Kunststoff, sonstige. */
var SYM={'Pakete':'<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>','GB / Pal':'<rect x="6" y="3" width="12" height="9" rx="1"/><path d="M6 7.5h12M3 14h18M3 19h18M5 14v5M12 14v5M19 14v5"/>',
 'Metall':'<ellipse cx="7" cy="12" rx="3" ry="6"/><path d="M7 6h11M7 18h11"/><ellipse cx="18" cy="12" rx="3" ry="6"/>','Kunststoff':'<path d="M12 3l7.5 4.5v9L12 21l-7.5-4.5v-9z"/><circle cx="12" cy="12" r="2.5"/>','sonstige':'<circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/>'};
function chipify(k,h){var R=REG[k];if(!R)return h;R.f.forEach(function(f){if(f[2]!=='s'||!f[3]||f[3].length>6)return;var id='rf_'+k+'_'+f[0],re=new RegExp('<select class="in" id="'+id+'">[\\s\\S]*?</select>');if(!re.test(h))return;
  var last=S.ui['rc_'+k+'_'+f[0]],cur=f[3].indexOf(last)>=0?last:f[3][0],big=k==='we'&&f[0]==='kat';
  var chips='<div class="pick'+(big?' big':'')+'" role="radiogroup">'+f[3].map(function(o){return '<button type="button" role="radio" aria-checked="'+(o===cur)+'" class="'+(o===cur?'on':'')+'" data-act="rpick" data-k="'+k+'" data-f="'+f[0]+'" data-v="'+esc(o)+'">'+(big&&SYM[o]?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+SYM[o]+'</svg>':'')+'<span>'+esc(o)+'</span></button>'}).join('')+'</div>';
  h=h.replace(re,'<input type="hidden" id="'+id+'" value="'+esc(cur)+'">'+chips);if(big)h=h.replace('<label class="fl">'+esc(f[1])+'<input type="hidden"','<label class="fl w-full">Was kam rein?<input type="hidden"')});return h}
/* Wareneingang: Zahlfeld passt zu jeder Kategorie */
if(REG.we&&REG.we.f[1]&&REG.we.f[1][0]==='pak')REG.we.f[1][1]='Anzahl (Pakete, Paletten, Stück)';
ACT.rpick=function(d,el){var i=$('#rf_'+d.k+'_'+d.f);if(i)i.value=d.v;S.ui['rc_'+d.k+'_'+d.f]=d.v;save();el.parentNode.querySelectorAll('button').forEach(function(b){var on=b===el;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)})};
Object.keys(REG).forEach(function(k){var v=VIEW[k];if(v)VIEW[k]=function(){return chipify(k,v.apply(this,arguments))}});

/* ---------- Warnlage ---------- */
var al0=window.alerts;window.alerts=function(now){var A=al0.apply(this,arguments);try{
 if(modOn('unt')){var L=dueList(isLead()?null:S.user),c=L.filter(function(x){return x.s==='crit'}).length,w=L.length-c;
  if(c)A.push({tone:'crit',t:c+(c===1?' Nachweis abgelaufen':' Nachweise abgelaufen')+(isLead()?'':' (deine)'),go:'unt'});
  if(w)A.push({tone:'warn',t:w+(w===1?' Nachweis läuft':' Nachweise laufen')+' in 30 Tagen ab',go:'unt'})}
 if(modOn('abruf')){var o=abOpen().filter(function(e){return e.st===0&&Date.now()-e.ts>36e5}).length;if(o)A.push({tone:'warn',t:o+(o===1?' Materialabruf':' Materialabrufe')+' länger als 60 Min. offen',go:'milk'})}
 if(modOn('fehl')){var f=ensure('fehl').filter(function(e){return e.st<4&&Date.now()-e.ts>3*864e5}).length;if(f)A.push({tone:'warn',t:f+(f===1?' Fehlteil':' Fehlteile')+' seit mehr als 3 Tagen offen',go:'fehl'})}
 if(modOn('vers')){var t=todayIso(),v=ensure('vers').filter(function(e){return e.st<1&&e.datum&&e.datum<=t}).length;if(v)A.push({tone:'warn',t:v+(v===1?' Sendung':' Sendungen')+' heute zur Abholung, noch nicht bereitgestellt',go:'vers'})}
 }catch(e){}return A};

/* ---------- Einstellungen: Module ---------- */
var adm=VIEW.adm;VIEW.adm=function(){var h=adm.apply(this,arguments);if(!isLead())return h;
 return h+card('Module','<p class="dim" style="font-size:13px;margin:0 0 14px">Zusatzthemen ein- oder ausschalten. Ausgeschaltet verschwinden sie aus der Navigation, eingegebene Daten bleiben erhalten. Gilt für alle Geräte.</p><div class="mods">'+MODS.map(function(m){var o=modOn(m.id);return '<div class="mod"><div><b>'+esc(m.t)+'</b><span>'+esc(m.d)+'</span></div><div class="seg"><button class="'+(o?'on':'')+'" data-act="modset" data-id="'+m.id+'" data-v="1">an</button><button class="'+(o?'':'on')+'" data-act="modset" data-id="'+m.id+'" data-v="0">aus</button></div></div>'}).join('')+'</div>')};
ACT.modset=function(d){var c=cfg();c.mods=Object.assign({},c.mods||{});c.mods[d.id]=d.v==='1';save();if($('#app .rail')){if(window.flyClose)flyClose();var f=$('#flyout');if(f)f.remove();buildShell()}render();toast(d.v==='1'?'Modul eingeschaltet':'Modul ausgeschaltet')};
})();
