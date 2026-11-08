/* ===== Hallenmodus: Lesbarkeit aus Entfernung =====
   Größere, kräftigere Schrift, heller Nebentext, weniger Sperrung bei Großbuchstaben.
   Automatisch an: Station-Tablet, Monitor-Konto, Zahlen-Widget-Fenster, Shopfloor als großer Monitor.
   Werkstattmonitor, Lagerfachmonitor und Ruhemodus sind immer im Hallenmodus.
   Je Gerät umschaltbar (automatisch, an, aus) unter Einstellungen → Darstellung auf diesem Gerät. Gestaltung in lesehalle.css. */
(function(){
'use strict';
var M=window.MF,ls=M.ls,root=document.documentElement;
function sel(){return ls('mflow.halle')||'auto'}
function who(){try{return TEAM.filter(function(m){return m.n===S.user})[0]||{}}catch(e){return {}}}
function auto(){var w=who();return !!(w.station||w.monitor||(window.isStation&&isStation())||$('#stn')||(window.widgetId&&widgetId())||root.classList.contains('rpm'))}
function apply(){var s=sel(),on=s==='on'||(s==='auto'&&auto());root.classList.toggle('halle',on);
 /* Shopfloor auf dem großen Monitor: alles wächst mit der Bildschirmbreite (ausgelegt für 1440 px) */
 var app=$('#app'),z=root.classList.contains('rpm')&&s!=='off'?Math.max(1,Math.min(1.6,innerWidth/1440)):0;if(app){var v=z>1.02?String(Math.round(z*100)/100):'';if(app.style.zoom!==v)app.style.zoom=v}}
addEventListener('resize',function(){apply()});
window.halleApply=apply;
var ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);apply()};
setInterval(apply,1500);apply();
var adm=VIEW.adm;VIEW.adm=function(){var h=adm.apply(this,arguments),s=sel();
 return h+M.card('Hallenmodus','<div class="seg">'+[['auto','automatisch'],['on','an'],['off','aus']].map(function(o){return '<button class="'+(s===o[0]?'on':'')+'" data-act="halleset" data-v="'+o[0]+'">'+o[1]+'</button>'}).join('')+'</div><p class="dim" style="font-size:13px;margin:10px 0 0">Größere, kräftigere Schrift und heller Nebentext, damit Zahlen und Beschriftungen aus einigen Metern lesbar sind. Automatisch an für Station-Tablet, Monitor-Konto, Zahlen-Widgets und den Shopfloor auf dem großen Monitor. Gilt für dieses Gerät.</p>')};
ACT.halleset=function(d){ls('mflow.halle',d.v==='auto'?null:d.v);apply();render()};
})();
