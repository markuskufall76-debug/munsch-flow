/* ===== Betrieb: Monitor-Konto, Fehlerberichte, Hilfe an Ort und Stelle =====
   1 Monitor-Konto (Rolle „monitor“, nur lesen, im Server geprüft): startet direkt im Werkstattmonitor,
     Eingabeformulare sind ausgeblendet, große Schrift ohne eigene Wahl.
   2 Fehlerberichte: Absturz einer Ansicht oder unbehandelter Fehler geht ohne Personendaten an die Zentrale
     (Seite, Gerätetyp, Version, Fehlertext). Einsehen und leeren: Einstellungen › Fehlerberichte (Teamleitung).
   3 Hilfe: kleines „?“ an Karten, die erklärungsbedürftig sind. */
(function(){
'use strict';
var M=window.MF,ls=M.ls,root=document.documentElement;
function isMon(){try{return !!(S&&S.user&&me()&&me().monitor)}catch(e){return false}}
window.isMonitor=isMon;

/* ---------- 1 Monitor-Konto ---------- */
var started=false;
function monTick(){var m=isMon();root.classList.toggle('ro',m);if(m&&!ls('mflow.big'))root.classList.add('big');if(m&&!started&&$('#stage')){started=true;setTimeout(function(){if(window.openMon)openMon()},400)}}
var ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);monTick()};setInterval(monTick,3000);

/* ---------- 2 Fehlerberichte ---------- */
var sent={},count=0;
function dev(){var u=navigator.userAgent,t=/iPad|Tablet|Android(?!.*Mobile)/.test(u)?'Tablet':/Mobi|iPhone|Android/.test(u)?'Handy':'PC',b=/Edg\//.test(u)?'Edge':/Chrome\//.test(u)?'Chrome':/Safari\//.test(u)?'Safari':/Firefox\//.test(u)?'Firefox':'Browser';return t+' · '+b+(isMon()?' · Monitor':window.isStation&&isStation()?' · Station':'')}
function report(msg,stack){try{if(!window.MF_SERVER||!window.SY||!SY.tok||!window.syApi)return;var m=String(msg||'').slice(0,300),s=String(stack||'').split('\n').slice(0,4).join(' | ').slice(0,280),key=m+'|'+((S&&S.ui&&S.ui.page)||'');
 if(!m||sent[key]||count>=20)return;sent[key]=1;count++;syApi('/api/err',{msg:m+(s?' — '+s:''),page:(S&&S.ui&&S.ui.page)||'',ver:window.MF_BUILD||'',dev:dev()}).catch(function(){})}catch(e){}}
window.addEventListener('error',function(e){if(e&&e.message&&!/ResizeObserver/.test(e.message))report(e.message,e.error&&e.error.stack)});
window.addEventListener('unhandledrejection',function(e){var r=e&&e.reason;if(r&&r.message)report(r.message,r.stack)});
/* Abstürze einer Ansicht fängt render() ab und schreibt sie in die Konsole: dort mithören */
var ce=console.error;console.error=function(x){try{if(x instanceof Error)report(x.message,x.stack)}catch(e){}return ce.apply(console,arguments)};
window.mfReport=report;

/* Einstellungen: Fehlerberichte (nur Teamleitung, nur mit Zentrale) */
var ER=null;
function erLoad(){if(!window.SY||!SY.tok)return;syApi('/api/errs').then(function(r){ER=r.errs||[];var b=$('#errbox');if(b)b.innerHTML=erHtml()}).catch(function(){})}
function erHtml(){if(ER===null)return '<p class="dim">Wird geladen …</p>';if(!ER.length)return '<div class="calm"><b>Keine Fehler</b><span>Alle Geräte laufen ohne gemeldete Fehler.</span></div>';
 return '<div class="tw"><table class="t"><thead><tr><th>Zuletzt</th><th>Seite</th><th>Gerät</th><th class="n">Anzahl</th><th>Fehler</th></tr></thead><tbody>'+ER.slice(0,30).map(function(e){return '<tr><td class="mono" style="white-space:nowrap">'+esc(fmtDT(e.ts))+'</td><td>'+esc(e.page||'–')+'</td><td>'+esc(e.dev||'')+'</td><td class="n">'+e.n+'</td><td style="font-size:13px">'+esc(e.msg)+'<div class="dim mono" style="font-size:11px">'+esc(e.ver||'')+'</div></td></tr>'}).join('')+'</tbody></table></div>'}
var adm=VIEW.adm;VIEW.adm=function(){var h=adm.apply(this,arguments);if(!isLead()||!window.MF_SERVER)return h;if(ER===null)setTimeout(erLoad,50);
 return h+M.card('Fehlerberichte','<div id="errbox">'+erHtml()+'</div>',{r:'<button class="btn sm" data-act="errload">Aktualisieren</button>'+(ER&&ER.length?'<button class="btn sm ghost" data-act="errclr">Leeren</button>':'')})};
ACT.errload=function(){ER=null;render();erLoad()};
ACT.errclr=function(){confirmM('Alle Fehlerberichte leeren?',function(){syApi('/api/errs',{clear:1}).then(function(){ER=[];render()})},'Leeren','no')};

/* ---------- 3 Hilfe an Ort und Stelle ---------- */
var HELP={
 'Module':'Zusatzthemen für alle Geräte ein- oder ausschalten. Ausgeschaltet verschwinden sie aus der Navigation, eingegebene Daten bleiben erhalten.',
 'Darstellung auf diesem Gerät':'Effekte: voll mit Kino-Licht, ausgewogen ohne Licht und Korn, ruhig ohne Bewegung. Ohne eigene Wahl entscheidet das Gerät selbst und stuft sich bei Ruckeln herab. Schrift groß ist für Monitor und Hallen-Tablets.',
 'Unterweisungen und Berechtigungen':'Gültig-bis-Datum je Nachweis. 30 Tage vor Ablauf erscheint ein Hinweis in der Warnlage. Jede Person sieht nur ihre eigenen Nachweise.',
 'Gültig bis':'Gültig-bis-Datum je Nachweis. 30 Tage vor Ablauf erscheint ein Hinweis in der Warnlage. Jede Person sieht nur ihre eigenen Nachweise.',
 'Je Lieferant':'Aus Wareneingang und WEP. Gruppiert wird nach dem Namen; Lieferscheinnummern am Ende werden ignoriert. Sperrquote = gesperrte durch geprüfte Lieferungen.',
 'Begrüßung im Team':'Anrede und Vorname für den persönlichen Begrüßungsfilm. Die Tagesnachricht erscheint am gewählten Tag als eigene Szene und als persönliche Nachricht.',
 'Persönliche Begrüßung':'Kurzer Film bei der ersten Anmeldung des Tages. Zeigt nur, was du auch auf „Mein Tag“ siehst. Tippen überspringt.',
 'Fehlerberichte':'Geräte melden Abstürze ohne Personendaten: Seite, Gerätetyp, Version, Fehlertext. Gleiche Fehler am selben Tag werden gezählt statt wiederholt.',
 'Offene Abrufe':'Bedarf aus der Produktion. „Mitnehmen“, wenn der Milkrun ihn lädt, „Geliefert“ am Ziel. Gelb nach 30, Warnung nach 60 Minuten.'};
function helps(){$$('#stage .card > .ch h2').forEach(function(h){var t=h.textContent.trim(),x=HELP[t];if(!x||h.parentNode.querySelector('.hq'))return;var b=document.createElement('button');b.className='hq';b.type='button';b.setAttribute('aria-label','Hilfe: '+t);b.dataset.act='hq';b.dataset.t=t;b.textContent='?';h.insertAdjacentElement('afterend',b)});
 /* Shopfloor: Herkunft der Zahlen */
 var w=$('#stage .sf-when');if(w&&!w.querySelector('.hq'))w.insertAdjacentHTML('beforeend','<button class="hq" type="button" data-act="hq" data-t="sfwhen" aria-label="Hilfe">?</button>')}
HELP.sfwhen='Die Kacheln zeigen die Zahlen des letzten erfassten Tages. Rückstand Vortag ist, was am letzten Arbeitstag nicht abgearbeitet wurde und heute noch offen ist. Das Tagesziel (Plan plus Rückstand Vortag) gilt für heute, „jetzt“ sind Live-Werte aus den Registern.';
ACT.hq=function(d,el){var o=$('#hqpop');if(o){var same=o.dataset.t===d.t;o.remove();if(same)return}var p=document.createElement('div');p.id='hqpop';p.dataset.t=d.t;p.setAttribute('role','tooltip');p.textContent=HELP[d.t]||'';document.body.appendChild(p);
 var r=el.getBoundingClientRect(),w=Math.min(340,innerWidth-24),x=Math.max(12,Math.min(r.left-12,innerWidth-w-12));p.style.cssText='left:'+x+'px;top:'+(r.bottom+8)+'px;width:'+w+'px'};
document.addEventListener('pointerdown',function(e){var o=$('#hqpop');if(o&&!e.target.closest('#hqpop,.hq'))o.remove()},true);
document.addEventListener('scroll',function(){var o=$('#hqpop');if(o)o.remove()},true);
var ar2=window.afterRender;window.afterRender=function(p){if(ar2)ar2(p);helps()};
})();
