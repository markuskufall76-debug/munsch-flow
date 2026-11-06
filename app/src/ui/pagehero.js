/* ===== Kopfbild für alle Seiten =====
   Jede Seite (außer Lagebild mit eigener Bühne und Shopfloor mit eigener Präsentation) beginnt mit einem Bild
   ihres Bereichs, dem Seitentitel groß und einem Satz zur Lage – aus den echten Daten, wo es sich anbietet.
   Seiten, die schon eine eigene Begrüßung haben (Heute, Mein Tag, Probelauf), bekommen das Bild hinter diese.
   Beim Scrollen wandert der große Titel in die Kopfzeile (wie bei iOS). Gestaltung in pagehero.css.
   Bilder: app/src/img/*.webp, KI-generiert, keine Aufnahmen aus dem Werk. */
(function(){
'use strict';
var M=window.MF,RM=M.RM,ls=M.ls,root=document.documentElement;
var SKIP={lage:1,runde:1};
var IMG={lage:'steuer',lager:'lager',prod:'prod',pers:'pers',komm:'komm',sys:'sys'};
var OWN={milk:'halle',halle:'halle',qs:'pumpe',aud:'pumpe',mas:'pumpe',fach:'lager'};
function on(){return (ls('mflow.lage')||'buehne')==='buehne'}
function img(p){return OWN[p]||IMG[(M.PAGE[p]||{}).g&&M.PAGE[p].g.id]||'steuer'}
function n(x,a,b){return x===1?a:b}

/* Ein Satz je Seite */
function say(p){var t=todayIso(),now=new Date();try{
 if(REG[p]){var o=regOpen(p);return o?o+' '+n(o,'offener Eintrag','offene Einträge')+'.':'Keine offenen Einträge. Alles erledigt.'}
 switch(p){
 case 'fach':var fs=fachStat();return fs.fr+' Fächer frei, '+fs.o+' belegt'+(fs.l?', '+fs.l+' '+n(fs.l,'Langlieger','Langlieger'):'')+'.';
 case 'milk':var mk=mkDay(t),d=Object.keys(mk).filter(function(k){return mk[k].e}).length,od=0;for(var i=0;i<10;i++){var s=mkStatus(i,now);if(s.tone==='crit'&&!(mk[i]&&mk[i].e))od++}return d+' von 10 Runden erledigt'+(od?', '+od+' überfällig.':'.');
 case 'urlaub':return presentOn(isWork(t)?t:nextWork(t)).length+' von '+CREW.length+' '+(isWork(t)?'heute':'am nächsten Arbeitstag')+' im Dienst.';
 case 'halle':return 'Werk 1 und Werk 2 als Plan, mit Fächern, Störungen und Milkrun.';
 case 'frist':return 'Wartungen, Audits und Gespräche mit Datum.';
 case 'chk':return 'Was in dieser Schicht erledigt werden muss.';
 case 'fluss':return 'Wie das Material heute durch beide Werke läuft.';
 case 'woche':return 'Die Woche in Zahlen.';
 case 'tag':return 'Der Tag im Rückblick, bereit für den Bericht.';
 case 'tz':return 'Die Zahlen des Tages, erfasst und verglichen.';
 case 's5':return 'Zwölf Bereiche, ein Blick auf Ordnung und Sauberkeit.';
 case 'plan':return 'Wer heute wo arbeitet.';
 case 'schicht':return 'Die Woche im Schichtplan.';
 case 'quali':return 'Wer was sicher kann und wo Lücken drohen.';
 case 'funk':return 'Nachrichten an die Bereiche und an einzelne Kollegen.';
 case 'brett':var b=(S.brett||[]).length;return b?b+' '+n(b,'Meldung','Meldungen')+' am Brett.':'Was das Team wissen soll.';
 case 'adm':return 'Darstellung, Konto und Geräte.';
 case 'verl':return 'Jede Änderung, nachvollziehbar.';
 case 'ausw':return 'Zahlen über Wochen, Monate und Jahre.';
 case 'imp':return 'Excel-Daten übernehmen, mit Vorschau vor dem Speichern.';
 case 'ber':return 'Berichte zum Kopieren und Versenden.'}
 }catch(e){}return ''}

function hero(p){var P=M.PAGE[p];return '<section class="ph" data-img="'+img(p)+'"><div class="ph-img" aria-hidden="true"><div class="ph-pic" style="--kb:-'+(Date.now()/1000%92).toFixed(1)+'s"></div></div><div class="ph-in">'
 +'<div class="lb-eb">'+esc(P.g.t)+'<span class="ph-d"> · '+esc(fmtD(todayIso(),{weekday:'long',day:'numeric',month:'long'}))+'</span></div>'
 +'<h2 class="ph-t">'+esc(P.t)+'</h2>'+(say(p)?'<p class="ph-s">'+esc(say(p))+'</p>':'')+'</div></section>'}

Object.keys(M.PAGE).forEach(function(p){if(SKIP[p]||!VIEW[p])return;var v=VIEW[p];VIEW[p]=function(){var h=v.apply(this,arguments);if(!on())return h;
 var im='<div class="ph-img" aria-hidden="true"><div class="ph-pic" style="--kb:-'+(Date.now()/1000%92).toFixed(1)+'s"></div></div>';
 if(h.indexOf('<section class="hero">')===0)return '<section class="hero ph-own" data-img="'+img(p)+'">'+im+h.slice('<section class="hero">'.length);
 return hero(p)+h}});

/* Titel in die Kopfzeile, sobald das Kopfbild verlassen wird; großen Titel einpassen */
function fit(){var h=document.querySelector('#stage .ph-t');if(!h)return;h.style.fontSize='';var z=parseFloat(getComputedStyle(h).fontSize),k=0;while(h.scrollWidth>h.clientWidth+1&&z>26&&k++<60){z-=2;h.style.fontSize=z+'px'}}
function past(){var st=$('#stage'),h=st&&st.querySelector('.ph');root.classList.toggle('ph-on',!!h);if(!h){root.classList.remove('ph-past');return}root.classList.toggle('ph-past',st.scrollTop>h.offsetHeight-90)}
var ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);var st=$('#stage');if(st){st.dataset.page=p;st.dataset.img=img(p)}past();fit()};
var raf=0;document.addEventListener('scroll',function(e){if(e.target.id!=='stage'||raf)return;raf=requestAnimationFrame(function(){raf=0;past();var st=$('#stage'),im=st.querySelector('.ph-img');if(im&&!RM)im.style.transform='translate3d(0,'+(st.scrollTop*.3).toFixed(1)+'px,0)'})},true);
var rz=0;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(fit,150)});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
})();
