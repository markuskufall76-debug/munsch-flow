/* ===== Kino, zweite Stufe =====
   1. Zeitreise im Schichtpuls: über die Zeitleiste fahren zeigt, was zu dieser Uhrzeit passiert ist
   2. Kachel-Zoom: eine angetippte Kachel fliegt auf und wird zur Seite
   3. Tageslicht: das Hallenlicht folgt der Uhrzeit
   4. Tiefe im Lagebild: Begrüßung und Zeitleiste reagieren leicht auf die Maus
   5. Shopfloor: Folienwechsel mit Richtung */
(function(){
'use strict';
var M=window.MF,RM=M.RM,FINE=M.FINE;
function hhmm(m){return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+(m%60)).slice(-2)}

/* ---------- 1. Zeitreise ---------- */
function evAt(min){var t=todayIso(),L=[];(S.log||[]).forEach(function(x){var d=new Date(x.ts);if(iso(d)!==t)return;var m=d.getHours()*60+d.getMinutes();if(Math.abs(m-min)<=20)L.push([Math.abs(m-min),m,x])});
 var mk=mkDay(t);for(var i=0;i<10;i++){var r=mk[i];if(!r)continue;[['s','gestartet'],['e','beendet']].forEach(function(k){if(r[k[0]]){var d=new Date(r[k[0]]),m=d.getHours()*60+d.getMinutes();if(Math.abs(m-min)<=20&&!L.some(function(y){return y[2].t==='Milkrun Runde '+(i+1)+' '+k[1]}))L.push([Math.abs(m-min),m,{t:'Milkrun Runde '+(i+1)+' '+k[1],u:''}])}})}
 return L.sort(function(a,b){return a[0]-b[0]}).slice(0,4).sort(function(a,b){return a[1]-b[1]})}
function scrub(tl,x){var r=tl.getBoundingClientRect(),p=Math.max(0,Math.min(1,(x-r.left)/r.width)),min=Math.round(360+p*540),c=tl.querySelector('.scrub');
 if(!c){c=document.createElement('div');c.className='scrub';c.innerHTML='<i></i><div class="sc-card"></div>';tl.appendChild(c)}
 c.style.left=(p*100)+'%';var ev=evAt(min),plan=[];for(var i=0;i<10;i++){var pm=mkPlan(i).min;if(Math.abs(pm-min)<=15)plan.push('Runde '+(i+1)+' geplant '+mkTime(i))}if(Math.abs(405-min)<=10)plan.push('Shopfloor 06:45');
 c.querySelector('.sc-card').innerHTML='<b>'+hhmm(min)+'</b>'+(ev.length?ev.map(function(e){return '<span><em>'+hhmm(e[1])+'</em>'+esc(e[2].t)+(e[2].u?' <small>· '+esc(firstName(e[2].u))+'</small>':'')+'</span>'}).join(''):'<span class="dim">'+(min>minsNowSafe()?'liegt noch vor uns':'nichts erfasst')+'</span>')+(plan.length?'<span class="pl">'+esc(plan.join(' · '))+'</span>':'');
 c.classList.toggle('r',p>.7);c.hidden=false}
function minsNowSafe(){var n=new Date();return n.getHours()*60+n.getMinutes()}
document.addEventListener('pointermove',function(e){var tl=e.target.closest&&e.target.closest('#stage .tl');if(!tl){var c=$('#stage .tl .scrub');if(c&&e.pointerType!=='touch')c.hidden=true;return}if(e.target.closest('.bead'))return;scrub(tl,e.clientX)},{passive:true});
document.addEventListener('pointerdown',function(e){var tl=e.target.closest&&e.target.closest('#stage .tl');if(tl&&!e.target.closest('.bead'))scrub(tl,e.clientX)},{passive:true});

/* ---------- 2. Kachel-Zoom ---------- */
document.addEventListener('click',function(e){if(RM)return;var t=e.target.closest&&e.target.closest('#stage button.tile[data-go]');if(!t)return;var st=$('#stage');if(!st)return;
 var r=t.getBoundingClientRect(),s=st.getBoundingClientRect(),g=document.createElement('div');g.className='zoom';g.style.cssText='left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px';document.body.appendChild(g);
 requestAnimationFrame(function(){g.style.cssText='left:'+s.left+'px;top:'+s.top+'px;width:'+s.width+'px;height:'+s.height+'px;opacity:0'});setTimeout(function(){g.remove()},650)},true);

/* ---------- 3. Tageslicht ---------- */
function daylight(){var h=new Date().getHours()+new Date().getMinutes()/60,root=document.documentElement,a,b;
 if(h>=5&&h<9){a='255,170,80,.20';b='255,200,140,.08'}        // Morgen: golden
 else if(h>=9&&h<14){a='255,128,48,.15';b='255,160,90,.07'}    // Tag: neutral orange
 else if(h>=14&&h<19){a='255,96,40,.19';b='255,120,60,.09'}    // Nachmittag: tief
 else{a='120,140,255,.10';b='255,118,27,.05'}                  // Nacht: kühl
 if(root.getAttribute('data-theme')==='light')return;root.style.setProperty('--light-a','rgba('+a+')');root.style.setProperty('--light-b','rgba('+b+')')}
daylight();setInterval(daylight,6e5);

/* ---------- 4. Tiefe im Lagebild ---------- */
if(FINE&&!RM){var raf=0,mx=0,my=0;document.addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;if(raf)return;raf=requestAnimationFrame(function(){raf=0;var h=$('#stage .hero');if(!h)return;var r=h.getBoundingClientRect();if(my<r.top-80||my>r.bottom+80){h.style.removeProperty('--px');h.style.removeProperty('--py');return}h.style.setProperty('--px',((mx-r.left)/r.width-.5).toFixed(3));h.style.setProperty('--py',((my-r.top)/r.height-.5).toFixed(3))})},{passive:true})}

/* ---------- 5. Shopfloor: Richtung beim Blättern ---------- */
var rpi0=ACT.rpi;if(rpi0)ACT.rpi=function(d){var from=S.ui.rp||0;document.documentElement.dataset.sfdir=(+d.i>=from)?'f':'b';return rpi0.apply(this,arguments)};
var rn0=ACT.rnext;if(rn0)ACT.rnext=function(d){document.documentElement.dataset.sfdir='f';return rn0.apply(this,arguments)};
})();
