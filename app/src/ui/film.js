/* ===== Monatsrückblick als Film =====
   Szenen aus den echten Tageszahlen eines Monats, mit Zählanimation, Diagrammen und Kinobalken.
   Farben der zwei Sägen geprüft mit dem Dataviz-Validator (dunkler Grund #14171B): Metall #E8620E, Kunststoff #3F93D6. */
(function(){
'use strict';
var M=window.MF,RM=M.RM,MN=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
var C_MET='#E8620E',C_KST='#3F93D6';
function days(ym){return Object.keys(S.tz).filter(function(k){return k.indexOf(ym)===0&&Object.keys(S.tz[k]).length}).sort()}
function lastYm(){var k=Object.keys(S.tz).filter(function(x){return Object.keys(S.tz[x]).length}).sort();return k.length?k[k.length-1].slice(0,7):todayIso().slice(0,7)}
function prevYm(ym){var y=+ym.slice(0,4),m=+ym.slice(5,7)-1;if(m<1){m=12;y--}return y+'-'+('0'+m).slice(-2)}
function data(ym){var D=days(ym),sum=function(f,ds){return (ds||D).reduce(function(a,d){return a+f(S.tz[d]||{})},0)},P=days(prevYm(ym));
 var st={};Object.keys(TZFIELDS).filter(function(f){return f.indexOf('st_')===0}).forEach(function(f){var c=sum(function(o){return o[f]||0});if(c)st[TZFIELDS[f].split(' · ')[1]]=c});
 var best=D.slice().sort(function(a,b){return (S.tz[b].we_pak||0)-(S.tz[a].we_pak||0)})[0];
 var si={ok:0,bei:0,unf:0};Object.keys(S.sich||{}).forEach(function(k){if(k.indexOf(ym)===0&&si[S.sich[k].t]!=null)si[S.sich[k].t]++});
 return {ym:ym,n:D.length,D:D,pak:sum(function(o){return o.we_pak||0}),pakP:sum(function(o){return o.we_pak||0},P),gb:sum(function(o){return o.we_gbpal||0}),
  met:sum(function(o){return o.ms_ist||0}),kst:sum(function(o){return o.ks_ist||0}),metP:sum(function(o){return o.ms_ist||0},P),kstP:sum(function(o){return o.ks_ist||0},P),
  milk:sum(function(o){return o.milkrun||0}),stoer:sum(function(o){return tzFn(o).stoer}),stoerP:sum(function(o){return tzFn(o).stoer},P),st:st,best:best,si:si,
  dank:(S.dank||[]).filter(function(x){return iso(new Date(x.ts)).indexOf(ym)===0}).length,series:D.map(function(d){return [d,S.tz[d].we_pak||0]})}}
function delta(a,b,inv){if(!b)return '';var p=Math.round((a-b)/b*100),good=(p>=0)!==!!inv;return '<span class="fd '+(p===0?'':good?'up':'dn')+'">'+(p>0?'+':'')+p+' % zum Vormonat</span>'}
function bars(series){var W=900,H=220,pb=26,mx=Math.max.apply(null,series.map(function(s){return s[1]}).concat([1])),bw=W/series.length,g='';
 series.forEach(function(s,i){var h=(H-pb-8)*s[1]/mx,x=i*bw+1,w=Math.max(2,bw-2);g+='<rect class="fb" style="--i:'+i+'" x="'+x.toFixed(1)+'" y="'+(H-pb-h).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+Math.max(h,1).toFixed(1)+'" rx="4"><title>'+fmtD(s[0],{weekday:'short',day:'2-digit',month:'2-digit'})+': '+s[1]+' Pakete</title></rect>';if(series.length<=23)g+='<text class="fx" x="'+(x+w/2).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle">'+(+s[0].slice(8))+'</text>'});
 return '<svg class="fchart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Pakete je Tag">'+g+'</svg>'}
function duo(d){var mx=Math.max(d.met,d.kst,1);return '<div class="fduo">'+[['Metall',d.met,d.metP,C_MET],['Kunststoff',d.kst,d.kstP,C_KST]].map(function(x){return '<div class="frow"><span class="fl">'+x[0]+'</span><div class="ftrack"><i style="width:'+(x[1]/mx*100).toFixed(1)+'%;background:'+x[3]+'"></i></div><b data-cu>'+x[1]+'</b>'+delta(x[1],x[2])+'</div>'}).join('')+'</div>'}
function scenes(d){var mon=MN[+d.ym.slice(5,7)-1]+' '+d.ym.slice(0,4),quote=d.n?Math.round(d.milk/(d.n*10)*100):0,R=88,C=2*Math.PI*R;
 var stL=Object.keys(d.st).sort(function(a,b){return d.st[b]-d.st[a]}).slice(0,5),smx=stL.length?d.st[stL[0]]:1;
 return [
  ['','<div class="fs-title"><div class="fk">MUNSCH Logistik · Monatsrückblick</div><h1>'+mon+'</h1><p>'+d.n+' erfasste Arbeitstage</p></div>'],
  ['Wareneingang','<div class="fh"><b data-cu>'+d.pak+'</b><span>Pakete gebucht</span>'+delta(d.pak,d.pakP)+'</div>'+bars(d.series)+'<p class="fsub">'+d.gb+' GB / Pal · Ø '+(d.n?Math.round(d.pak/d.n):0)+' Pakete je Tag</p>'],
  ['Sägen','<div class="fh"><b data-cu>'+(d.met+d.kst)+'</b><span>Teile gesägt</span></div>'+duo(d)],
  ['Milkrun','<div class="fring"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="'+R+'" class="rb"/><circle cx="100" cy="100" r="'+R+'" class="rf" style="--c:'+C.toFixed(1)+';--o:'+(C*(1-quote/100)).toFixed(1)+'"/></svg><b><span data-cu>'+quote+'</span><small>%</small></b></div><p class="fsub">'+d.milk+' von '+d.n*10+' Runden beendet</p>'],
  ['Störungen','<div class="fh"><b data-cu>'+d.stoer+'</b><span>Störungen und Abweichungen</span>'+delta(d.stoer,d.stoerP,true)+'</div>'+(stL.length?'<div class="fduo">'+stL.map(function(k){return '<div class="frow"><span class="fl">'+esc(k)+'</span><div class="ftrack"><i style="width:'+(d.st[k]/smx*100).toFixed(1)+'%;background:var(--warn)"></i></div><b>'+d.st[k]+'</b></div>'}).join('')+'</div>':'<p class="fsub">Keine Störungen erfasst.</p>')],
  ['Sicherheit','<div class="fh"><b data-cu>'+d.si.ok+'</b><span>unfallfreie Tage eingetragen</span></div><p class="fsub">'+d.si.bei+' Beinaheunfälle · '+d.si.unf+' Unfälle</p>'],
  ['Bestwert','<div class="fh"><b data-cu>'+(d.best?S.tz[d.best].we_pak||0:0)+'</b><span>Pakete am stärksten Tag</span></div><p class="fsub">'+(d.best?fmtD(d.best,{weekday:'long',day:'2-digit',month:'long'}):'')+'</p>'+(d.dank?'<p class="fsub" style="margin-top:22px"><b style="color:var(--signal)">'+d.dank+'</b> Mal Danke gesagt</p>':'')],
  ['','<div class="fs-title"><div class="fk">Danke, Team.</div><h1>Weiter so.</h1><p>'+logoSVG({h:42})+'</p></div>']]}
var F=null;
window.openFilm=function(ym){ym=ym||lastYm();var d=data(ym);if(!d.n)return toast('Für '+ym+' gibt es keine Tageszahlen');var sc=scenes(d),el=document.createElement('div');el.id='film';
 el.innerHTML='<div class="lb t"></div><div class="lb b"></div><div class="fsc">'+sc.map(function(s,i){return '<section class="fsn" data-i="'+i+'">'+(s[0]?'<div class="fk">'+s[0]+'</div>':'')+s[1]+'</section>'}).join('')+'</div><div class="fctl"><div class="fprog">'+sc.map(function(s,i){return '<i data-i="'+i+'"><b></b></i>'}).join('')+'</div><button class="btn sm ghost" data-act="flp" aria-label="Zurück">‹</button><button class="btn sm ghost" data-act="flpp" id="flpp">Pause</button><button class="btn sm ghost" data-act="fln" aria-label="Weiter">›</button><button class="btn sm" data-act="flx">Schließen</button></div>';
 document.body.appendChild(el);F={i:-1,n:sc.length,play:true,t:0};try{if(el.requestFullscreen&&M.FINE)el.requestFullscreen().catch(function(){})}catch(e){}flGo(0)};
function cu(root){if(RM)return;root.querySelectorAll('[data-cu]').forEach(function(e){var to=+e.textContent;if(!(to>1))return;var t0=performance.now(),D=1400;(function f(t){var k=Math.min(1,(t-t0)/D);e.textContent=Math.round(to*(1-Math.pow(1-k,4)));if(k<1)requestAnimationFrame(f)})(t0)})}
function flGo(i){if(!F)return;clearTimeout(F.t);F.i=Math.max(0,Math.min(F.n-1,i));var D=F.i===0||F.i===F.n-1?5000:7500;
 $$('#film .fsn').forEach(function(s){var on=+s.dataset.i===F.i;s.classList.toggle('on',on);if(on){s.classList.remove('go');void s.offsetWidth;s.classList.add('go');cu(s)}});
 $$('#film .fprog i').forEach(function(b){var k=+b.dataset.i;b.className=k<F.i?'done':k===F.i&&F.play?'on':k===F.i?'hold':'';b.style.setProperty('--d',D+'ms')});
 if(F.play)F.t=setTimeout(function(){if(F.i<F.n-1)flGo(F.i+1);else{F.play=false;flGo(F.i);$('#flpp').textContent='Nochmal'}},D)}
ACT.fln=function(){flGo(F.i+1)};ACT.flp=function(){flGo(F.i-1)};
ACT.flpp=function(){if(!F)return;if(!F.play&&F.i===F.n-1){F.play=true;$('#flpp').textContent='Pause';return flGo(0)}F.play=!F.play;$('#flpp').textContent=F.play?'Pause':'Weiter abspielen';flGo(F.i)};
ACT.flx=function(){if(!F)return;clearTimeout(F.t);var e=$('#film');if(e)e.remove();F=null;try{if(document.fullscreenElement)document.exitFullscreen()}catch(x){}};
ACT.film=function(d){openFilm(d&&d.ym)};
document.addEventListener('keydown',function(e){if(!F)return;if(e.key==='Escape'){e.stopPropagation();ACT.flx()}else if(e.key==='ArrowRight'){ACT.fln()}else if(e.key==='ArrowLeft'){ACT.flp()}else if(e.key===' '){e.preventDefault();ACT.flpp()}},true);
/* Einstieg aus der Auswertung (Monat des gewählten Zeitraums) */
var aw0=VIEW.ausw;VIEW.ausw=function(){var h=aw0.apply(this,arguments),ym=lastYm();try{if((S.ui.aw||'m')==='m'){var t=todayIso(),dt=new Date(+t.slice(0,4),+t.slice(5,7)-1+(S.ui.awo||0),1);ym=dt.getFullYear()+'-'+('0'+(dt.getMonth()+1)).slice(-2)}}catch(e){}
 return h.replace('<span style="flex:1"></span>','<button class="btn sm pri" data-act="film" data-ym="'+ym+'">▶ Monat als Film</button><span style="flex:1"></span>')};
window.filmData=data;
})();
