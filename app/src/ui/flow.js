/* ===== Bewegung mit Bedeutung =====
   1 Materialfluss im Hallenplan: Lichtpunkte folgen dem echten Weg, Dichte aus den Tageszahlen,
     Stau vor Bereichen mit offener Störmeldung.
   2 Kamerafahrt durch den Hallenplan (für den Monitor): ganze Halle, dann jeder Bereich mit Handlungsbedarf.
   3 Lebender Hintergrund: ruhig in Orange, unruhiger und rötlich bei Warnungen.
   4 Bauchbinde im Shopfloor-Bühnenmodus: wer vorträgt, für welchen Bereich. */
(function(){
'use strict';
var M=window.MF,RM=M.RM,NS='http://www.w3.org/2000/svg';
function last(){var t=todayIso();return tzLatest(isWork(t)?prevWork(t):t)}
function lv(k){var l=last();return l?+((S.tz[l]||{})[k]||0):0}
function qsAt(b){return S.reg.qs.filter(function(e){return REG.qs.done.indexOf(e.st)<0&&e.bereich===b}).length}

/* ---------- 1  Materialfluss ----------
   Strecken als Punktfolgen in Plan-Koordinaten (wie in halle.js). w: Menge, j: Bereich der QS (Stau davor). */
function routes(){return [
 {id:'we-wep',p:[[200,274],[200,290]],w:lv('we_pak'),j:''},
 {id:'wep-mw',p:[[200,430],[200,446]],w:lv('we_pak'),j:''},
 {id:'mw-w1',p:[[360,600],[428,600],[428,250],[500,250]],w:Math.max(lv('we_pak'),lv('mw_gel')+lv('mw_ver')),j:'Werksverkehr'},
 {id:'lag-ms',p:[[705,424],[705,435],[918,435],[918,194],[926,194]],w:lv('ms_ist'),j:'Säge'},
 {id:'lag-ks',p:[[760,424],[760,435],[918,435],[918,350],[926,350]],w:lv('ks_ist'),j:'Säge'},
 {id:'saw-vk',p:[[1043,420],[1043,458],[625,458],[625,470]],w:lv('ms_ist')+lv('ks_ist'),j:'Vorkommissionierung'},
 {id:'vk-w1',p:[[750,512],[770,512]],w:lv('lack_hp')+lv('lack_vp'),j:'Werk 1'},
 {id:'w1-aus',p:[[1065,554],[1065,570]],w:lv('mont_hp')+lv('mont_vp'),j:'Werk 1'}]}
function geo(r){var L=[0],i;for(i=1;i<r.p.length;i++){var a=r.p[i-1],b=r.p[i];L.push(L[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1]))}r.L=L;r.len=L[L.length-1];
 r.at=function(s){s=Math.max(0,Math.min(r.len,s));for(var k=1;k<L.length;k++)if(s<=L[k]){var a=r.p[k-1],b=r.p[k],f=(s-L[k-1])/((L[k]-L[k-1])||1);return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]}return r.p[r.p.length-1]};return r}
var FL=null;
function flowStart(){var svg=$('#hsvg');if(!svg||svg.querySelector('#hflow'))return;if(FL)cancelAnimationFrame(FL.raf);
 var R=routes().map(geo),mx=Math.max.apply(null,R.map(function(r){return r.w}).concat([1])),g=document.createElementNS(NS,'g');g.id='hflow';g.setAttribute('aria-hidden','true');
 R.forEach(function(r){r.jam=r.j?qsAt(r.j)>0:false;r.rate=r.w>0?.35+1.6*r.w/mx:0;r.P=[];r.acc=Math.random();var pl=document.createElementNS(NS,'path');pl.setAttribute('d','M'+r.p.map(function(x){return x.join(',')}).join(' L'));pl.setAttribute('class','hfl'+(r.jam?' jam':'')+(r.w?'':' off'));g.appendChild(pl)});
 svg.appendChild(g);FL={R:R,g:g,t:performance.now(),raf:0};
 if(RM){R.forEach(function(r){if(!r.rate)return;for(var k=1;k<4;k++)dot(r,r.len*k/4)});return}
 FL.raf=requestAnimationFrame(tick)}
function dot(r,s){var c=document.createElementNS(NS,'circle');c.setAttribute('r','3.4');c.setAttribute('class','hfd'+(r.jam?' jam':''));FL.g.appendChild(c);var p={s:s,c:c};r.P.push(p);var xy=r.at(s);c.setAttribute('cx',xy[0].toFixed(1));c.setAttribute('cy',xy[1].toFixed(1));return p}
function tick(now){if(!FL||!$('#hsvg')||!FL.g.isConnected){FL=null;return}var dt=Math.min(.05,(now-FL.t)/1000);FL.t=now;
 FL.R.forEach(function(r){if(!r.rate)return;var sp=70*(r.jam?.45:1);
  r.acc+=dt*r.rate;var cap=r.jam?Math.floor(r.len/9):99;if(r.acc>=1&&r.P.length<cap){r.acc=0;dot(r,0)}else if(r.acc>=1)r.acc=1;
  for(var i=0;i<r.P.length;i++){var p=r.P[i],lim=r.jam?r.len-4-i*9:r.len+1;p.s=Math.min(lim,p.s+sp*dt);
   if(!r.jam&&p.s>=r.len){p.c.remove();r.P.splice(i,1);i--;continue}var xy=r.at(p.s);p.c.setAttribute('cx',xy[0].toFixed(1));p.c.setAttribute('cy',xy[1].toFixed(1))}
  /* im Stau rückt die Schlange nach: der vorderste verlässt sie langsam */
  if(r.jam&&r.P.length&&Math.random()<dt*.1){r.P[0].c.remove();r.P.shift()}});
 FL.raf=requestAnimationFrame(tick)}
document.addEventListener('visibilitychange',function(){if(!FL)return;if(document.hidden)cancelAnimationFrame(FL.raf);else{FL.t=performance.now();FL.raf=requestAnimationFrame(tick)}});

/* ---------- 2  Kamerafahrt ---------- */
var ZB={we:[40,124,320,150,'Wareneingang','we'],wep:[40,290,320,140,'WEP Prüfung','wep'],mw:[40,446,320,200,'Materialwagen','mw'],lag:[500,124,410,300,'Fachlager','fach'],ms:[926,124,234,140,'Säge Metall','ms'],ks:[926,280,234,140,'Säge Kunststoff','ks'],vork:[500,470,250,84,'Vorkommissionierung','vork'],w1:[770,470,390,84,'Lack und Montage','w1'],aus:[500,570,660,76,'Ausschleusung und Versand','aus'],wv:[392,70,72,600,'Werksverkehr','wv']};
function shots(){var S0=[],fs=fachStat(),add=function(k,t,tone){S0.push({k:k,t:t,tone:tone})};
 var qMap={'Wareneingang':'we','Säge':'ms','Vorkommissionierung':'vork','Werk 1':'w1','Werk 2':'mw','Werksverkehr':'wv'};
 Object.keys(qMap).forEach(function(b){var n=qsAt(b);if(n)add(qMap[b],n+' offene Störmeldung'+(n>1?'en':'')+(b==='Säge'?' an den Sägen':''),'crit')});
 if(window.fcast&&isWork(todayIso()))['ms','ks'].forEach(function(id){var r=fcast(id);if(r&&r.tg!=null)add(id,(r.v==='ok'?'schafft das Ziel voraussichtlich: ':r.v==='warn'?'wird knapp: voraussichtlich ':'schafft voraussichtlich nur ')+r.mid+' von '+r.tg,r.v)});
 if(fs.l)add('lag',fs.l+' Langlieger über 10 Tage im Fach','vio');
 [['we','we','Lieferungen offen'],['wep','wep','Prüfungen offen'],['mw','mw','Materialwagen offen'],['vork','vork','Aufträge in der Vorkommissionierung']].forEach(function(x){var n=regOpen(x[1]);if(n)add(x[0],n+' '+x[2],'warn')});
 var seen={};S0=S0.filter(function(s){if(seen[s.k+s.t])return false;seen[s.k+s.t]=1;return true});
 if(!S0.length)add('lag',fs.o+' von '+fs.n+' Fächern belegt · alles ruhig','ok');
 return S0}
var TOUR=null;
function setVB(vb,D){var s=$('#hsvg');if(!s)return;var from=(s.getAttribute('viewBox')||'0 56 1200 628').split(' ').map(Number),t0=performance.now();if(RM){s.setAttribute('viewBox',vb.join(' '));return}
 (function f(t){if(!TOUR&&D>0)return;var k=Math.min(1,(t-t0)/D),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;s.setAttribute('viewBox',from.map(function(a,i){return (a+(vb[i]-a)*e).toFixed(1)}).join(' '));if(k<1)requestAnimationFrame(f)})(t0)}
function frame(z){var cx=z[0]+z[2]/2,cy=z[1]+z[3]/2,w=Math.min(1200,Math.max(z[2]*2.6,z[3]*2.6*1200/628,560)),h=w*628/1200;return [Math.max(0,Math.min(1200-w,cx-w/2)),Math.max(56,Math.min(684-h,cy-h/2)),w,h]}
function cap(s,still){var c=$('#hcap');if(!c){var w=$('.hcard');if(!w)return;c=document.createElement('div');c.id='hcap';w.appendChild(c)}
 if(!s){c.className='';return}var z=ZB[s.k];c.className='on '+(s.tone||'')+(still?' still':'');c.innerHTML='<i></i><div><small>'+esc(z[4])+'</small><b>'+esc(s.t)+'</b></div><span class="mono">'+(TOUR.i)+' / '+TOUR.L.length+'</span>'}
function foc(k){$$('#hsvg [data-z]').forEach(function(g){var z=g.dataset.z;g.classList.toggle('foc',!!k&&(z===k||(k==='w1'&&(z==='lack'||z==='mont'))))})}
function step(){if(!TOUR||!$('#hsvg')){tourStop();return}var L=TOUR.L;
 if(TOUR.i>=L.length){TOUR.i=0;TOUR.L=shots();TOUR.cur=null;TOUR.vb=[0,56,1200,628];cap(null);foc(null);setVB(TOUR.vb,1600);TOUR.t=setTimeout(step,5000);return}
 var s=L[TOUR.i++];TOUR.cur=null;TOUR.vb=frame(ZB[s.k]);cap(null);setVB(TOUR.vb,1800);foc(s.k);
 TOUR.c=setTimeout(function(){if(!TOUR)return;TOUR.cur=s;cap(s)},900);TOUR.t=setTimeout(step,7000)}
/* nach neuem Zeichnen (Live-Abgleich) genau dort weitermachen, ohne Sprung */
function tourResume(){if(!TOUR)return;var s=$('#hsvg');if(s&&TOUR.vb)s.setAttribute('viewBox',TOUR.vb.join(' '));var k=TOUR.L[TOUR.i-1];foc(TOUR.vb&&TOUR.vb[2]<1200&&k?k.k:null);if(TOUR.cur)cap(TOUR.cur,true);htx()}
function htx(){if(!TOUR)return;if(!$('#htx')){var b=document.createElement('button');b.id='htx';b.className='btn sm';b.setAttribute('data-act','htour');b.textContent='Fahrt beenden';document.body.appendChild(b)}}
function tourStop(){if(!TOUR)return;clearTimeout(TOUR.t);clearTimeout(TOUR.c);TOUR=null;cap(null);foc(null);var x=$('#htx');if(x)x.parentNode.removeChild(x);var b=$('.hpbar [data-act="htour"]');if(b)b.textContent='Kamerafahrt';document.documentElement.classList.remove('htour')}
ACT.htour=function(){if(TOUR){tourStop();setVB([0,56,1200,628],900);try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}return}
 S.ui.hq='';var i=$('[data-hq]');if(i)i.value='';TOUR={i:0,L:shots(),t:0};var b=$('.hpbar [data-act="htour"]');if(b)b.textContent='Fahrt beenden';document.documentElement.classList.add('htour');htx();
 try{var d=document.documentElement;if(d.requestFullscreen&&M.FINE)d.requestFullscreen().catch(function(){})}catch(e){}step()};
var wasFs=false;document.addEventListener('fullscreenchange',function(){if(document.fullscreenElement){wasFs=true;return}if(wasFs&&TOUR){wasFs=false;tourStop();setVB([0,56,1200,628],600)}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&TOUR){e.stopPropagation();ACT.htour()}},true);
window.hallTour=function(){return TOUR?{i:TOUR.i,n:TOUR.L.length,L:TOUR.L}:null};

/* Knopf im Hallenplan und Start des Flusses nach jedem Zeichnen */
var hv=VIEW.halle;VIEW.halle=function(){return hv.apply(this,arguments).replace('<button class="btn sm ghost" data-act="hall0">Ganze Halle</button>','<button class="btn sm ghost" data-act="hall0">Ganze Halle</button><button class="btn sm pri" data-act="htour">'+(TOUR?'Fahrt beenden':'Kamerafahrt')+'</button>')};
var ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);if(p==='halle'){flowStart();tourResume()}else if(TOUR)tourStop()};

/* ---------- 3  Lebender Hintergrund ----------
   Weiche Lichtflächen, langsam bewegt. Stimmung aus der Warnlage: ruhig, Achtung, Problem. */
function mood(){var a=alerts(new Date());return a.some(function(x){return x.tone==='crit'})?2:a.length?1:0}
function live(host){if(!host||host.querySelector(':scope > canvas.livebg'))return;var c=document.createElement('canvas');c.className='livebg';c.setAttribute('aria-hidden','true');host.insertBefore(c,host.firstChild);
 var x=c.getContext('2d'),B=[],i,md=mood(),mdT=0,t0=performance.now(),last=0,dpr=Math.min(1.5,window.devicePixelRatio||1);
 for(i=0;i<6;i++)B.push({x:Math.random(),y:Math.random(),r:.25+Math.random()*.25,a:Math.random()*6.28,s:.04+Math.random()*.05});
 function size(){c.width=Math.round(c.clientWidth*dpr/2);c.height=Math.round(c.clientHeight*dpr/2)}size();
 var light=function(){return getComputedStyle(document.documentElement).getPropertyValue('--ground').trim().toLowerCase()>'#8'};
 function draw(now){if(!c.isConnected)return;requestAnimationFrame(draw);if(now-last<50)return;last=now;if(now-mdT>10000){md=mood();mdT=now}
  if(c.width!==Math.round(c.clientWidth*dpr/2))size();var W=c.width,H=c.height,t=(now-t0)/1000,sp=[1,1.6,2.4][md],L=light();x.clearRect(0,0,W,H);x.globalCompositeOperation=L?'multiply':'screen';
  B.forEach(function(b,k){var px=(b.x+.18*Math.sin(t*b.s*sp+b.a))*W,py=(b.y+.18*Math.cos(t*b.s*.8*sp+b.a*1.3))*H,r=b.r*Math.max(W,H);
   var col=md===2&&k%2===0?[255,70,80]:md===1&&k%3===0?[245,177,74]:[255,118,27],al=(L?.10:.16)*(md===2?1.25:1)*(.75+.25*Math.sin(t*.6+k));
   var g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,'rgba('+col.join(',')+','+al.toFixed(3)+')');g.addColorStop(1,'rgba('+col.join(',')+',0)');x.fillStyle=g;x.fillRect(0,0,W,H)});
  x.globalCompositeOperation='source-over'}
 if(RM){draw(performance.now());return}requestAnimationFrame(draw)}
window.liveBg=live;
/* Ruhemodus, Werkstattmonitor und Shopfloor-Bühne bekommen ihn */
var mo=new MutationObserver(function(){['#amb','#mon'].forEach(function(s){var e=$(s);if(e)live(e)});var st=document.querySelector('html.rpm-live .sf-stage');if(st)live(st)});
mo.observe(document.body,{childList:true});
var ar2=window.afterRender;window.afterRender=function(p){if(ar2)ar2(p);document.documentElement.classList.toggle('rpm-live',p==='runde'&&!!S.ui.rpm);if(p==='runde'&&S.ui.rpm){var st=$('.sf-stage');if(st)live(st);lower3()}};

/* ---------- 4  Bauchbinde im Bühnenmodus ---------- */
var L3={k:null,t:0};
function lower3(){var st=$('.sf-stage');if(!st)return;var P=st.querySelector('.sf-pb b'),av=st.querySelector('.sf-pb .sf-av'),h=st.querySelector('.sf-th h2'),key=(S.ui.rp||0)+'|'+(P?P.textContent:'');
 if(!P||!av||key===L3.k)return;L3.k=key;var o=$('#l3');if(o)o.remove();var d=document.createElement('div');d.id='l3';var sub=st.querySelector('.sf-pb small');
 d.innerHTML='<i></i><div><small>'+esc(sub?sub.textContent:'Vortrag')+'</small><b>'+esc(P.textContent)+'</b><span>'+esc(h?h.textContent:'')+'</span></div>';document.body.appendChild(d);clearTimeout(L3.t);L3.t=setTimeout(function(){d.classList.add('out');setTimeout(function(){d.remove()},700)},6000)}
})();
