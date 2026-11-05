/* ===== Bereichsansicht und Anmeldung mit Karte =====
   1 Jede Person sieht nur die Seiten ihres Bereichs. Der Bereich kommt aus
     Gerät (Tablet fest im Bereich)  >  Schichtplan heute  >  Stammbereich.
     „Alle Seiten“ bleibt einen Klick entfernt. Rechte prüft weiter die Zentrale.
   2 Anmeldekarten für Handscanner: Teamleitung stellt sie aus und druckt sie (Code 128).
     Scan am Anmeldebildschirm meldet an, Scan an der Station wählt die Person,
     Scan an einem gemeinsamen Gerät wechselt die Person. Teamleitung meldet sich weiter mit PIN an.
   3 Gemeinsames Gerät: nach 10 Minuten ohne Bedienung abmelden. */
(function(){
'use strict';
var M=window.MF,cp=M.cp,card=M.card,ls=M.ls;
var COMMON=['mein','heute','runde','chk','halle','qs','funk','brett','urlaub','adm'];
var AREAP={
 'Wareneingang':['we','wep','mw','tz','fach'],
 'WEP':['wep','we','tz'],
 'Säge Metall':['tz','mas','auf','s5'],
 'Säge Kunststoff':['tz','mas','auf','s5'],
 'Vorkommissionierung':['vork','fach','auf','milk'],
 'Materialwagen':['mw','tb','wv','we'],
 'Werksverkehr':['wv','tb','mw'],
 'Werk 1':['fach','milk','vork','auf','tz','mas'],
 'Werk 2':['we','wep','mw','tz']};
var AREAS=Object.keys(AREAP);
var SHORT={we:'Eingang',wep:'WEP',mw:'Wagen',tz:'Zahlen',fach:'Fächer',mas:'Wartung',auf:'Aufträge',s5:'5S',vork:'Vorkomm.',milk:'Milkrun',tb:'TB-Wagen',wv:'Verkehr'};
var ICON={we:'lager',wep:'lager',mw:'lager',tb:'lager',wv:'lager',fach:'lager',vork:'lager',milk:'milk',tz:'tz',mas:'prod',auf:'prod',s5:'prod'};
function devArea(){var a=ls('mflow.area');return a&&AREAP[a]?a:null}
function src(){var u=S.user,t=todayIso(),d=devArea();if(d)return [d,'Gerät'];var p=(S.plan[t]||{})[u];if(p&&AREAP[p])return [p,'Schichtplan heute'];var h=(S.home||{})[u];if(h&&AREAP[h])return [h,'Stammbereich'];return [null,'']}
window.myArea=function(){return src()[0]};
function active(){if(!S||!S.user)return null;if(isLead())return S.ui.fview&&AREAP[S.ui.fview]?S.ui.fview:null;if(S.ui.fall===1)return null;return src()[0]}
window.focusArea=active;
window.navFilter=function(p){var a=active();if(!a)return true;return COMMON.indexOf(p)>=0||AREAP[a].indexOf(p)>=0};
window.navTabs=function(){var a=active();if(!a)return null;return [['mein','lage','Mein Tag']].concat(AREAP[a].slice(0,3).map(function(p){return [p,ICON[p]||'tz',SHORT[p]||M.PAGE[p].t]})).concat([['more','more','Mehr']])};
window.navNote=function(){var a=active(),s=src();
 if(isLead()&&a)return '<div class="fnote sig"><span>Vorschau: so sieht <b>'+esc(a)+'</b> die App</span><button class="btn sm" data-act="fvx">Vorschau beenden</button></div>';
 if(a)return '<div class="fnote"><span>Deine Ansicht: <b>'+esc(a)+'</b> · '+esc(s[1])+'</span><button class="btn sm ghost" data-act="fall">Alle Seiten</button></div>';
 if(!isLead()&&s[0])return '<div class="fnote"><span>Alle Seiten sichtbar</span><button class="btn sm ghost" data-act="fon">Nur '+esc(s[0])+'</button></div>';
 return ''};
function reshell(){if(!$('#app .rail'))return;if(window.flyClose)flyClose();var f=$('#flyout');if(f)f.parentNode.removeChild(f);buildShell();render()}
ACT.fall=function(){S.ui.fall=1;save();reshell();toast('Alle Seiten sichtbar')};
ACT.fon=function(){S.ui.fall=0;save();reshell();go('mein')};
ACT.fvx=function(){S.ui.fview=null;save();reshell()};
ACT.fview=function(){var s=$('#fvsel');if(!s||!s.value)return;S.ui.fview=s.value;save();reshell();go('mein')};
/* Bereich wechselt (Schichtplan, Gerät): Gerüst neu */
var LAST=null,ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);var k=String(active())+'|'+(S.ui.fall||0);if(LAST===null){LAST=k;return}if(k!==LAST){LAST=k;setTimeout(reshell,0)}};

/* Mein Tag: deine Seiten als große Kacheln */
var mn=VIEW.mein;if(mn)VIEW.mein=function(){var h=mn.apply(this,arguments),a=active()||src()[0];if(!a)return h;
 var q='<div class="fquick" aria-label="Deine Seiten">'+AREAP[a].map(function(p){return M.PAGE[p]?'<button data-act="go" data-go="'+p+'">'+M.ic(ICON[p]||'tz')+'<b>'+esc(M.PAGE[p].t)+'</b></button>':''}).join('')+'</div>';
 return h.replace('</section>','</section>'+q)};

/* ---------- Einstellungen ---------- */
var CARDS={};
function people(){return CREW.filter(function(c){return !c.nonop&&!c.station&&!c.monitor})}
var adm=VIEW.adm;VIEW.adm=function(){var h=adm.apply(this,arguments),d=devArea(),sh=ls('mflow.shared')==='1';
 var dev=card('Dieses Gerät','<div class="fgrid"><label class="fl">Gerät gehört fest zum Bereich<select class="in" data-fdev><option value="">– persönlich, Bereich aus dem Schichtplan –</option>'+AREAS.map(function(a){return '<option'+(a===d?' selected':'')+'>'+esc(a)+'</option>'}).join('')+'</select></label>'
  +'<div><div class="fl" style="margin-bottom:8px">Gemeinsames Gerät</div><div class="seg"><button class="'+(sh?'on':'')+'" data-act="fshared" data-v="1">ja</button><button class="'+(sh?'':'on')+'" data-act="fshared" data-v="0">nein</button></div></div></div>'
  +'<p class="dim" style="font-size:12.5px;margin:12px 0 0">Ein Tablet im Bereich zeigt allen nur die Seiten dieses Bereichs. Gemeinsame Geräte melden nach 10 Minuten ohne Bedienung ab'+(window.cardsOn&&cardsOn()?'; mit der Karte ist die nächste Person in einer Sekunde angemeldet.':'; am Anmeldebildschirm stehen dann die heute hier Eingeteilten oben.')+'</p>');
 if(!isLead())return h+dev;
 var KC=window.cardsOn&&cardsOn();
 var rows=people().map(function(c){var n=c.n,ld=(c.lead||(window.CREWLEAD&&CREWLEAD(n)));var hm=(S.home||{})[n]||'';
  return '<tr><td><b>'+esc(n)+'</b></td><td><select class="in sm" data-home="'+esc(n)+'"><option value="">–</option>'+AREAS.map(function(a){return '<option'+(a===hm?' selected':'')+'>'+esc(a)+'</option>'}).join('')+'</select></td>'
   +(KC?'<td class="bdst" data-n="'+esc(n)+'">'+(ld?'<span class="dim">PIN</span>':'<span class="dim">…</span>')+'</td><td class="r">'+(ld?'':'<button class="btn sm" data-act="bdgnew" data-n="'+esc(n)+'">Karte</button> <button class="btn sm ghost" data-act="bdgdel" data-n="'+esc(n)+'">Sperren</button>')+'</td>':'')+'</tr>'}).join('');
 var lead=card(KC?'Bereiche und Anmeldekarten':'Bereiche','<p class="dim" style="font-size:13px;margin:0 0 12px">Stammbereich gilt, wenn jemand heute nicht im Schichtplan steht.'+(KC?' Karten druckst du auf Etikett oder Papier; der Handscanner liest sie wie eine Tastatur. Eine neue Karte macht die alte ungültig, Sperren meldet die Person überall ab.':'')+'</p>'
  +'<div class="tw"><table class="t ftab"><thead><tr><th>Person</th><th>Stammbereich</th>'+(KC?'<th>Karte</th><th></th>':'')+'</tr></thead><tbody>'+rows+'</tbody></table></div>'
  +'<div class="fprev"><span class="fl">Ansicht testen</span><select class="in sm" id="fvsel">'+AREAS.map(function(a){return '<option>'+esc(a)+'</option>'}).join('')+'</select><button class="btn sm" data-act="fview">So sieht es der Bereich</button></div>');
 return h+lead+dev};
document.addEventListener('change',function(e){var t=e.target;if(!t||!t.matches)return;
 if(t.matches('select[data-home]')){S.home=S.home||{};if(t.value)S.home[t.dataset.home]=t.value;else delete S.home[t.dataset.home];save();toast('Stammbereich gespeichert')}
 else if(t.matches('select[data-fdev]')){ls('mflow.area',t.value||null);toast(t.value?'Dieses Gerät gehört jetzt zu '+t.value:'Gerät wieder persönlich');reshell()}});
ACT.fshared=function(d){ls('mflow.shared',d.v==='1'?'1':null);render()};
function bdgFill(){if(!isLead()||!window.SY||!SY.on||!SY.tok)return;syApi('/api/badges').then(function(r){if(!r.cards)return;CARDS={};r.cards.forEach(function(c){CARDS[c.name]=c});
 $$('.bdst').forEach(function(td){if(td.textContent==='PIN')return;var c=CARDS[td.dataset.n];td.innerHTML=c?cp('ok','aktiv seit '+fmtD(iso(new Date(c.created)),{day:'2-digit',month:'2-digit'}))+(c.last?' <span class="dim">zuletzt '+fmtDT(c.last)+'</span>':''):'<span class="dim">keine</span>'})})}
var ar2=window.afterRender;window.afterRender=function(p){if(ar2)ar2(p);if(p==='adm')bdgFill()};
ACT.bdgnew=function(d){if(!window.SY||!SY.on)return toast('Karten gibt es nur mit der Zentrale');var go_=function(){syApi('/api/badge',{name:d.n}).then(function(r){if(!r.code)return toast(r.error||'Karte konnte nicht ausgestellt werden');cardModal(r);bdgFill()})};
 if(CARDS[d.n])confirmM('Neue Karte für '+d.n+'? Die alte Karte wird sofort ungültig.',go_,'Neue Karte');else go_()};
ACT.bdgdel=function(d){if(!window.SY||!SY.on)return toast('Nur mit der Zentrale');confirmM('Karte von '+d.n+' sperren? Die Person wird auf allen Geräten abgemeldet.',function(){syApi('/api/badge/revoke',{name:d.n}).then(function(r){toast(r.ok?'Karte gesperrt':r.error||'Fehler');bdgFill()})},'Sperren')};
function cardModal(r){var a=(S.home||{})[r.name]||'';
 modal('<h3>Anmeldekarte für '+esc(r.name)+'</h3><p class="dim" style="margin:0 0 14px">Der Code wird nur jetzt angezeigt. Jetzt drucken; geht die Karte verloren, einfach eine neue ausstellen.</p>'
  +'<div class="etpv"><div class="etk mfcard" id="mfcard"><div class="mc-h">'+logoSVG({h:22})+'<span>Anmeldekarte</span></div><div class="mc-n">'+esc(r.name)+'</div><div class="mc-a">'+esc(a||'MUNSCH Logistik')+'</div><svg id="mcbc"></svg><div class="mc-f">Nur für die Anmeldung in MUNSCH Flow · Verlust bitte der Teamleitung melden</div></div></div>'
  +'<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px"><button class="btn" data-act="closem">Schließen</button><button class="btn pri" data-act="bdgprint">Drucken</button></div>');
 try{if(window.JsBarcode)JsBarcode('#mcbc',r.code,{format:'CODE128',width:2,height:64,displayValue:false,margin:0,background:'#ffffff',lineColor:'#000000'})}catch(e){}
 window._mfcode=r.code}
ACT.closem=function(){window._mfcode=null;closeModal()};
ACT.bdgprint=function(){var st=$('#lblpage');if(!st){st=document.createElement('style');st.id='lblpage';document.head.appendChild(st)}st.textContent='@media print{@page{size:85.6mm 54mm;margin:0}}';
 document.body.classList.add('prlbl');var off=function(){document.body.classList.remove('prlbl');removeEventListener('afterprint',off)};addEventListener('afterprint',off);try{window.print()}catch(x){off()}setTimeout(function(){if(document.body.classList.contains('prlbl'))off()},4000)};

/* ---------- Scanner ----------
   Handscanner tippen schnell (wenige ms je Zeichen) und schließen mit Enter.
   Erkannt wird nur ein Kartencode MF-…; alles andere (Fach- und Auftragscodes) läuft wie bisher. */
var BUF='',LT=0,RE=/MF-[A-Z2-7]{16}$/;
document.addEventListener('keydown',function(e){var now=performance.now();if(e.key&&e.key.length===1){if(now-LT>120)BUF='';BUF=(BUF+e.key).slice(-40);LT=now;return}
 if(e.key!=='Enter')return;var m=RE.exec(BUF.toUpperCase());BUF='';if(!m)return;e.preventDefault();e.stopPropagation();strip(m[0]);scan(m[0])},true);
function strip(c){var a=document.activeElement;if(a&&'value' in a&&typeof a.value==='string'){var v=a.value,i=v.toUpperCase().lastIndexOf(c);if(i>=0){a.value=v.slice(0,i)+v.slice(i+c.length);try{a.dispatchEvent(new Event('input',{bubbles:true}))}catch(x){}}}}
function busy(t){var b=$('#fscan');if(!b){b=document.createElement('div');b.id='fscan';b.setAttribute('role','status');document.body.appendChild(b)}b.textContent=t;b.className='on';clearTimeout(busy.t);busy.t=setTimeout(function(){b.className=''},2600)}
function scan(code){
 if(!window.MF_SERVER&&!(window.SY&&SY.on))return toast('Anmeldung mit Karte geht nur mit der Zentrale');
 if($('#login'))return syApi('/api/login',{badge:code}).then(function(r){if(!r.token){try{fx.err()}catch(x){}return toast(r.error||'Karte unbekannt')}try{fx.ok()}catch(x){}busy('Hallo '+firstName(r.name));loginWith(r)}).catch(function(){toast('Zentrale nicht erreichbar')});
 if(window.isStation&&isStation()||me&&me().station)return syApi('/api/badge/who',{code:code}).then(function(r){if(!r.name){try{fx.err()}catch(x){}return toast(r.error||'Karte unbekannt')}try{fx.ok()}catch(x){}busy('Hallo '+firstName(r.name));if(ACT.stpick)ACT.stpick({u:r.name})});
 /* angemeldet: andere Karte wechselt die Person (gemeinsames Gerät) */
 syApi('/api/login',{badge:code}).then(function(r){if(!r.token){try{fx.err()}catch(x){}return toast(r.error||'Karte unbekannt')}if(r.name===S.user){busy('Du bist schon angemeldet');return syApi('/api/logout',{}).catch(function(){})}
  var old=SY.tok;busy('Wechsel zu '+r.name);fetch('/api/logout',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+old},body:'{}'}).catch(function(){}).then(function(){ls('mflow.tok',r.token);ls('mflow.name',r.name);S.ui.fall=0;save();location.reload()})})}
window.badgeScan=scan;

/* Anmeldebildschirm: Hinweis auf die Karte */
new MutationObserver(function(){var l=$('#login');if(!l||l.querySelector('.lscan')||!window.MF_SERVER||!(window.cardsOn&&cardsOn()))return;var h=document.createElement('div');h.className='lscan';h.innerHTML='<i aria-hidden="true"></i><span><b>Karte scannen</b> meldet sofort an</span>';l.appendChild(h)}).observe(document.body,{childList:true});

/* ---------- Gemeinsames Gerät: Abmelden nach 10 Minuten ---------- */
var ACTV=Date.now();['pointerdown','keydown','touchstart'].forEach(function(ev){document.addEventListener(ev,function(){ACTV=Date.now()},{capture:true,passive:true})});
setInterval(function(){if(ls('mflow.shared')!=='1'||!window.SY||!SY.tok||$('#login'))return;if(me&&me().station)return;if(Date.now()-ACTV>10*6e4){S.ui.fall=0;save();if(ACT.syout)ACT.syout()}},30000);
})();
