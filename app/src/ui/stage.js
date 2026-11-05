/* ===== Shopfloor-Bühne mit Handy-Fernbedienung =====
   Die gewählte Folie steht in S.runde[Tag].cur und läuft über den normalen Sync.
   „Großer Monitor“ folgt ihr (Abgleich alle 2,5 s), das Handy steuert per „Fernbedienung“. */
(function(){
'use strict';
var M=window.MF,RM=M.RM;
function rd(){var t=todayIso();S.runde[t]=S.runde[t]||{};return S.runde[t]}
function slides(){return [].slice.call(document.querySelectorAll('.sf-n span')).map(function(e){return e.textContent})}
function setCur(i){var r=rd();if(r.cur!==i){r.cur=i;r.curBy=S.user;r.curTs=Date.now();save();try{if(window.syPush)setTimeout(syPush,60)}catch(e){}}}
['rpi','rnext','rstart'].forEach(function(k){var f=ACT[k];if(!f)return;ACT[k]=function(){var r=f.apply(this,arguments);if(S.ui.page==='runde')setCur(S.ui.rp||0);remoteDraw();setTimeout(remoteDraw,120);return r}});

/* Bühne folgt der Fernbedienung */
setInterval(function(){if(S.ui.page!=='runde'||!S.ui.rpm||!window.SY||!SY.on||!SY.tok||$('#remote'))return;syPull(function(){var c=rd().cur;if(c!=null&&c!==(S.ui.rp||0)){document.documentElement.dataset.sfdir=c>(S.ui.rp||0)?'f':'b';S.ui.rp=c;render()}})},2500);

/* Zahlen der Folie zählen im Bühnenmodus hoch */
var ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);if(p!=='runde')return;var bar=document.querySelector('.sf-bar .sf-ctr');if(bar&&!bar.querySelector('[data-act="rfern"]'))bar.insertAdjacentHTML('beforeend','<button class="btn sm ghost" data-act="rfern">Fernbedienung</button>'+(S.ui.rpm&&window.SY&&SY.on?M.cp('sig','folgt der Fernbedienung'):''));var st=document.querySelector('.sf-stage.sf-in');if(!st||RM)return;
 st.querySelectorAll('.sf-t b, .sf-big b').forEach(function(e){var to=+e.textContent;if(!(to>1)||to>99999)return;e.dataset.to=to;var t0=performance.now(),D=900;(function f(t){var k=Math.min(1,(t-t0)/D);e.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(t0)});};

/* Fernbedienung (Handy) */
ACT.rfern=function(){if($('#remote'))return;var d=document.createElement('div');d.id='remote';document.body.appendChild(d);remoteDraw();try{if(navigator.wakeLock)navigator.wakeLock.request('screen').catch(function(){})}catch(e){}};
ACT.rfx=function(){var d=$('#remote');if(d)d.remove();render()};
function remoteDraw(){var d=$('#remote');if(!d)return;var L=slides(),i=S.ui.rp||0,n=L.length,r=rd(),ids=['open','anw','ter','sich','we','saw','sawk','w2','w1','wep','wv','s5','abs'],id=ids[i],x=r[id]||{},dep=i>=4&&i<n-1,el=r.t0&&!r.fin?Math.floor((Date.now()-r.t0)/1e3):0;
 d.innerHTML='<div class="rm-h"><span>'+logoCore(34)+'</span><b>Fernbedienung</b><span class="mono dim" id="rmclk">'+(r.t0?('0'+Math.floor(el/60)).slice(-2)+':'+('0'+el%60).slice(-2):'–:–')+'</span><button class="btn sm ghost" data-act="rfx">Schließen</button></div>'
  +'<div class="rm-now"><div class="rm-no">'+(i+1)+' von '+n+'</div><div class="rm-t">'+esc(L[i]||'')+'</div><div class="rm-nx dim">'+(i<n-1?'als Nächstes: '+esc(L[i+1]):'letzte Folie')+'</div>'+pv()+'</div>'
  +(dep?'<div class="rm-amp">'+[['g','Läuft','ok'],['y','Achtung','warn'],['r','Problem','crit']].map(function(a){return '<button class="'+a[2]+(x.amp===a[0]?' on':'')+'" data-act="ramp" data-i="'+id+'" data-v="'+a[0]+'">'+a[1]+'</button>'}).join('')+'</div>':'')
  +'<div class="rm-nav"><button class="btn xl" data-act="rpi" data-i="'+Math.max(0,i-1)+'"'+(i?'':' disabled')+'>‹</button>'+(i===0&&!r.t0?'<button class="btn pri xl" data-act="rstart">Eröffnen</button>':i<n-1?'<button class="btn pri xl" data-act="rnext" data-i="'+i+'">'+(x.ok?'Weiter ›':'Besprochen ›')+'</button>':'<button class="btn pri xl" data-act="rfin">Abschließen</button>')+'</div>'
  +'<div class="rm-dots">'+L.map(function(t,k){var ok=r[ids[k]]&&r[ids[k]].ok;return '<button class="'+(k===i?'cur ':'')+(ok?'ok':'')+'" data-act="rpi" data-i="'+k+'" aria-label="'+esc(t)+'"></button>'}).join('')+'</div>'}
/* Vorschau der Folie: Vortrag und bis zu drei Kennzahlen, direkt aus der gerenderten Folie */
function txt(e){return e?e.innerHTML.replace(/<br\s*\/?>/g,' ').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim():''}
function pv(){var st=document.querySelector('.sf-stage');if(!st)return '';var P=st.querySelector('.sf-pb b'),K=[];
 function take(sel,hot){st.querySelectorAll(sel).forEach(function(t){if(K.length>=3)return;var b=t.querySelector('b'),l=t.querySelector('span');if(b&&l)K.push([txt(l),b.dataset.to||b.textContent,t.classList.contains(hot)])})}
 take('.sf-t','hot');if(!K.length)take('.sf-big, .sf-st4 > div','crit');
 return (K.length?'<div class="rm-k">'+K.map(function(k){return '<div'+(k[2]?' class="hot"':'')+'><b>'+esc(k[1])+'</b><span>'+esc(k[0])+'</span></div>'}).join('')+'</div>':'')+(P?'<div class="rm-p'+(st.querySelector('.sf-pb .sf-av')?'':' none')+'">'+(st.querySelector('.sf-pb .sf-av')?'<i>'+esc(MF.initials(P.textContent))+'</i>':'<i>?</i>')+'<div><small>Vortrag</small><b>'+esc(P.textContent)+'</b></div></div>':'')}
var ramp0=ACT.ramp;if(ramp0)ACT.ramp=function(){var r=ramp0.apply(this,arguments);remoteDraw();return r};
setInterval(function(){var c=$('#rmclk'),r=S.runde&&S.runde[todayIso()];if(c&&r&&r.t0&&!r.fin){var s=Math.floor((Date.now()-r.t0)/1e3);c.textContent=('0'+Math.floor(s/60)).slice(-2)+':'+('0'+s%60).slice(-2)}},1000);
})();
