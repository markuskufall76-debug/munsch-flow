/* ===== Prognose für heute =====
   Hochrechnung bis Schichtende 15:00 aus zwei Quellen:
   – bisheriges Tempo heute (Zähler der Station bzw. Tageszahlen),
   – Durchschnitt und Streuung der letzten 20 Arbeitstage.
   Je weiter die Schicht, desto stärker zählt das heutige Tempo. Ohne Buchung heute: nur Erfahrungswert. */
(function(){
'use strict';
var M=window.MF,cp=M.cp,card=M.card;
var ITEMS=[
 {id:'ms',k:'Säge Metall',f:'ms_ist',plan:'ms_plan',rueck:'ms_rueck',u:'Teile',u1:'Teil'},
 {id:'ks',k:'Säge Kunststoff',f:'ks_ist',plan:'ks_plan',rueck:'ks_rueck',u:'Teile',u1:'Teil'},
 {id:'we',k:'Wareneingang',f:'we_pak',u:'Pakete',u1:'Paket'}];
function hist(f,t){var v=[],d=t;for(var i=0;i<60&&v.length<20;i++){d=prevWork(d);var o=S.tz[d];if(o&&o[f]!=null)v.push(+o[f]||0)}return v}
function stat(v){if(!v.length)return {mu:0,sd:0,n:0};var mu=v.reduce(function(a,b){return a+b},0)/v.length,sd=Math.sqrt(v.reduce(function(a,b){return a+(b-mu)*(b-mu)},0)/v.length);return {mu:mu,sd:sd,n:v.length}}
/* f: Feld, now: Date (optional, für Tests). Liefert ist, lo, mid, hi, Ziel und Basis. */
function fcast(it,now){now=now||new Date();var t=iso(now),si=shiftInfo(now),p=si.state==='lauf'?si.p:si.state==='ende'?1:0,o=S.tz[t]||{},ist=+o[it.f]||0,h=stat(hist(it.f,t));
 var tg=null;if(it.plan&&o[it.plan]!=null){var lt=tzLatest(prevWork(t));tg=(+o[it.plan]||0)+(+((lt&&S.tz[lt]||{})[it.rueck])||0)}
 var mid,band,basis;
 if(p>=1){mid=ist;band=0;basis='Schicht beendet'}
 else if(!ist||p<.05){mid=Math.max(ist,h.mu);band=Math.max(1,h.sd);basis=h.n?'Erfahrungswert: Ø '+fmt1(h.mu)+' an den letzten '+h.n+' Arbeitstagen':'noch keine Vergleichstage'}
 else{var pace=ist/p,rate=p*pace+(1-p)*h.mu;mid=ist+(1-p)*rate;band=Math.max(.5,(1-p)*Math.max(h.sd,1));basis='Tempo heute '+fmt1(pace)+' je Schicht, Ø '+fmt1(h.mu)+' der letzten '+h.n+' Tage · gewichtet '+Math.round(p*100)+' : '+Math.round((1-p)*100)}
 var lo=Math.max(ist,Math.round(mid-band)),hi=Math.max(lo,Math.round(mid+band));mid=Math.round(mid);
 var v=tg==null?null:lo>=tg?'ok':hi<tg?'crit':'warn';
 return {it:it,ist:ist,lo:lo,mid:mid,hi:hi,tg:tg,mu:h.mu,n:h.n,p:p,basis:basis,v:v,run:si.state}}
function fmt1(x){return String(Math.round(x*10)/10).replace('.',',')}
function un(it,n){return n===1?it.u1:it.u}
function say(r){var it=r.it;if(r.run==='ende')return it.k+': '+r.ist+' '+un(it,r.ist)+(r.tg!=null?' bei Ziel '+r.tg:'');
 if(r.tg!=null)return r.v==='ok'?it.k+' schafft das Ziel voraussichtlich: '+r.mid+' von '+r.tg:r.v==='warn'?it.k+' wird knapp: voraussichtlich '+r.mid+' von '+r.tg:it.k+' schafft voraussichtlich nur '+r.mid+' von '+r.tg;return it.k+': voraussichtlich '+r.mid+' '+un(it,r.mid)+' bis 15:00'}
/* Balken: Ist (voll), Prognosebereich (schraffiert), Mitte (Strich), Ziel (Marke) */
function bar(r){var mx=Math.max(r.hi,r.tg||0,r.mu,1)*1.15,P=function(x){return (x/mx*100).toFixed(1)+'%'};
 return '<div class="fc-bar" role="img" aria-label="'+esc(say(r))+', Bereich '+r.lo+' bis '+r.hi+'">'
  +'<span class="fc-band" style="left:'+P(r.lo)+';width:calc('+P(r.hi)+' - '+P(r.lo)+')"></span>'
  +'<span class="fc-ist" style="width:'+P(r.ist)+'"></span>'
  +'<span class="fc-mid" style="left:'+P(r.mid)+'"></span>'
  +(r.tg!=null?'<span class="fc-tg" style="left:'+P(r.tg)+'"><em>Ziel '+r.tg+'</em></span>':'')
  +(r.mu?'<span class="fc-mu" style="left:'+P(r.mu)+'" title="Ø '+fmt1(r.mu)+'"></span>':'')+'</div>'}
function row(r){var tone=r.v||'';return '<div class="fc-row '+tone+'"><div class="fc-h"><b>'+esc(r.it.k)+'</b>'
  +(r.v?cp(r.v,r.v==='ok'?'schafft es':r.v==='warn'?'knapp':'wird eng'):'')+'<span class="fc-n"><em data-cu>'+r.mid+'</em><small>'+(r.lo!==r.hi?r.lo+'–'+r.hi:'')+'</small></span></div>'
  +bar(r)+'<div class="fc-s"><span>'+r.ist+' '+r.it.u+' gebucht</span><span class="dim">'+esc(r.basis)+'</span></div></div>'}
function block(items,now){var t=iso(now||new Date());if(!isWork(t))return '';var R=items.map(function(it){return fcast(it,now)}).filter(function(r){return r.n||r.ist||r.tg!=null});if(!R.length)return '';
 var si=shiftInfo(now||new Date()),W={crit:3,warn:2,ok:1},head=R.slice().sort(function(a,b){return (W[b.v]||0)-(W[a.v]||0)})[0];
 return card('Prognose bis 15:00','<p class="fc-lead">'+esc(say(head))+'.</p>'+R.map(row).join('')+'<div class="fc-lg dim"><span><i class="l-ist"></i>gebucht</span><span><i class="l-band"></i>erwarteter Bereich</span><span><i class="l-tg"></i>Ziel</span><span><i class="l-mu"></i>Ø 20 Tage</span></div>',{c:'fc',r:cp(si.state==='lauf'?'sig':'',si.state==='lauf'?'Schicht '+Math.round(si.p*100)+' %':si.state==='vor'?'vor Schichtbeginn':'Schicht beendet')})}
window.fcast=function(id,now){return fcast(ITEMS.filter(function(x){return x.id===id})[0],now)};
window.fcBlock=function(ids,now){return block(ITEMS.filter(function(x){return !ids||ids.indexOf(x.id)>=0}),now)};
/* Lagebild: nach den Kacheln */
var lg=VIEW.lage;VIEW.lage=function(){var h=lg.apply(this,arguments),b=block(ITEMS);return b?h.replace('<div class="row r-23">',b+'<div class="row r-23">'):h};
/* Mein Tag: Prognose für den eigenen Bereich */
var mn=VIEW.mein;if(mn)VIEW.mein=function(){var h=mn.apply(this,arguments),pl=(S.plan[todayIso()]||{})[S.user],id=pl==='Säge Metall'?'ms':pl==='Säge Kunststoff'?'ks':pl==='Wareneingang'?'we':null;if(!id)return h;var b=window.fcBlock([id]);return b?h.replace('<div class="row r-32">',b+'<div class="row r-32">'):h};
})();
