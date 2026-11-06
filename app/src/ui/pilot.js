/* ===== Pilot: anonyme Rückmeldung =====
   Jede Person kann jederzeit einen Satz schreiben: stört mich, fehlt mir, gefällt mir.
   Der Server speichert ihn ohne Namen und nur mit Datum (POST /api/feedback); lesen kann nur die Teamleitung. */
(function(){
'use strict';
var M=window.MF,cp=M.cp,card=M.card;
var CAT={stoert:['Stört mich','warn'],fehlt:['Fehlt mir','info'],gut:['Gefällt mir','ok']};
var SEL='stoert';
ACT.fbopen=function(d){SEL=d&&d.c&&CAT[d.c]?d.c:'stoert';modal('<h3>Deine Rückmeldung zum Pilot</h3><p class="dim" style="margin:0 0 14px">Anonym: gespeichert ohne Namen und ohne Uhrzeit. Nur die Teamleitung liest es.</p>'
 +'<div class="seg fbseg">'+Object.keys(CAT).map(function(k){return '<button class="'+(k===SEL?'on':'')+'" data-act="fbcat" data-c="'+k+'">'+CAT[k][0]+'</button>'}).join('')+'</div>'
 +'<label class="fl" style="margin-top:14px">Ein Satz reicht<textarea class="in" id="fbt" rows="4" maxlength="1000" placeholder="Zum Beispiel: Die Station braucht einen größeren Knopf für Rückgängig."></textarea></label>'
 +'<div class="acts"><button class="btn ghost" data-act="mclose">Abbrechen</button><button class="btn pri" data-act="fbsend">Abschicken</button></div>')};
ACT.fbcat=function(d){SEL=d.c;$$('.fbseg button').forEach(function(b){b.classList.toggle('on',b.dataset.c===SEL)})};
ACT.fbsend=function(){var t=($('#fbt')||{}).value||'';if(!t.trim())return toast('Bitte einen Satz schreiben');if(!window.SY||!SY.on||!SY.tok)return toast('Rückmeldung geht nur mit der Zentrale');
 syApi('/api/feedback',{t:t.trim(),cat:SEL}).then(function(r){if(!r.ok)return toast(r.error||'Nicht gesendet');closeModal();try{fx.ok()}catch(e){}toast('Danke! Deine Rückmeldung ist angekommen.')}).catch(function(){toast('Zentrale nicht erreichbar')})};

/* Einstieg: Mein Tag und Menü „Mehr“ */
var mn=VIEW.mein;if(mn)VIEW.mein=function(){return mn.apply(this,arguments)+card('Pilot: Was meinst du?','<p class="dim" style="margin:0 0 12px;font-size:13.5px">Vier Wochen Probebetrieb. Was stört, was fehlt, was ist gut? Anonym, ein Satz genügt.</p><div class="fbq">'+Object.keys(CAT).map(function(k){return '<button class="btn" data-act="fbopen" data-c="'+k+'">'+CAT[k][0]+'</button>'}).join('')+'</div>',{c:'fbcard'})};
var nn=window.navNote;window.navNote=function(){return (nn?nn():'')+'<div class="fnote"><span>Pilot · deine Meinung zählt</span><button class="btn sm" data-act="fbopen">Rückmeldung geben</button></div>'};

/* Teamleitung: Auswertung */
function list(){var F=S.fb||{};return Object.keys(F).map(function(k){return F[k]}).filter(function(x){return x&&x.t}).sort(function(a,b){return a.d<b.d?1:a.d>b.d?-1:0})}
var aw=VIEW.ausw;VIEW.ausw=function(){var h=aw.apply(this,arguments);if(!isLead())return h;var L=list(),open=L.filter(function(x){return !x.done}),showDone=S.ui.fbdone===1;
 var cnt=Object.keys(CAT).map(function(k){var n=L.filter(function(x){return x.cat===k}).length;return cp(CAT[k][1],CAT[k][0]+': '+n)}).join(' ');
 var rows=(showDone?L:open).map(function(x){return '<div class="fbi'+(x.done?' done':'')+'"><div class="fbm">'+cp(CAT[x.cat]?CAT[x.cat][1]:'',CAT[x.cat]?CAT[x.cat][0]:x.cat)+'<span class="dim mono">'+fmtD(x.d,{day:'2-digit',month:'2-digit'})+'</span></div><p>'+esc(x.t)+'</p><button class="btn sm ghost" data-act="fbdone" data-id="'+esc(x.id)+'">'+(x.done?'wieder offen':'erledigt')+'</button></div>'}).join('');
 return h+card('Rückmeldungen aus dem Pilot',L.length?'<div class="chips" style="margin-bottom:12px">'+cnt+'</div>'+(rows||'<div class="calm"><b>Alles bearbeitet</b><span>Keine offenen Rückmeldungen.</span></div>'):M.empty('Noch keine Rückmeldungen','Das Team kann sie in „Mein Tag“ oder im Menü „Mehr“ abgeben.'),{r:L.length?'<button class="btn sm ghost" data-act="fbtog">'+(showDone?'nur offene':'alle zeigen')+'</button>':''})};
ACT.fbdone=function(d){var x=(S.fb||{})[d.id];if(!x)return;if(x.done)delete x.done;else x.done=1;save();render()};
ACT.fbtog=function(){S.ui.fbdone=S.ui.fbdone===1?0:1;save();render()};
var al=window.alerts;window.alerts=function(now){var a=al.apply(this,arguments);try{if(isLead()){var n=list().filter(function(x){return !x.done}).length;if(n)a.push({tone:'ice',t:n+' Rückmeldung'+(n>1?'en':'')+' aus dem Pilot offen',go:'ausw'})}}catch(e){}return a};
})();
