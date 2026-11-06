/* ===== Lagebild als Bühne =====
   Statt gleich gewichteter Zahlen: ein Kopfbild (Halle, fotorealistisch erzeugt) mit einem Satz, der die Lage sagt,
   die Schicht als Panorama-Band, eine Hauptkennzahl als Bogen, die Tageszahlen auf einem Produktbild.
   Abschnitte gleiten beim Scrollen ins Bild, das Kopfbild zieht beim Scrollen langsamer mit (Parallaxe).
   Umschaltbar je Gerät: Einstellungen › Lagebild (Bühne / klassisch). Gestaltung in lage2.css.
   Bilder: app/src/img/halle.webp und pumpe.webp, KI-generiert, keine echten Aufnahmen von Munsch. */
(function(){
'use strict';
var M=window.MF,cp=M.cp,card=M.card,ic=M.ic,ls=M.ls,hhmm=M.hhmm,RM=M.RM,spark=M.spark,empty=M.empty;
var classic=VIEW.lage;
function mode(){return ls('mflow.lage')||'buehne'}
function kw(d){var x=new Date(d+'T12:00:00');x.setDate(x.getDate()+3-((x.getDay()+6)%7));var w=new Date(x.getFullYear(),0,4);return 1+Math.round(((x-w)/864e5-3+((w.getDay()+6)%7))/7)}
function mins(){var n=new Date();return n.getHours()*60+n.getMinutes()}

/* Die Lage in einem Satz */
function story(t,si,al,pr,fs){var crit=al.filter(function(a){return a.tone==='crit'}),warn=al.filter(function(a){return a.tone!=='crit'}),o={mood:'ok'};
 if(si.state==='frei'){o.h='Heute frei.';o.s='Nächster Arbeitstag: '+fmtD(nextWork(t),{weekday:'long',day:'numeric',month:'long'})+'.'}
 else if(crit.length){o.mood='crit';o.h='Handlungsbedarf.';o.s=crit[0].t+(al.length>1?' · und '+(al.length-1)+' weitere'+(al.length-1===1?'r Hinweis':' Hinweise'):'');o.go=crit[0].go}
 else if(warn.length){o.mood='warn';o.h='Fast im Plan.';o.s=warn[0].t+(warn.length>1?' · und '+(warn.length-1)+' weitere':'');o.go=warn[0].go}
 else if(si.state==='vor'){o.h='Gleich geht’s los.';o.s=si.txt+'.'}
 else if(si.state==='ende'){o.h='Feierabend.';o.s='Schicht beendet. Danke fürs Mitmachen.'}
 else{o.h='Alles im Fluss.';o.s='Keine offenen Warnungen. '+pr+' von '+CREW.length+' im Dienst.'}
 return o}

function band(t,now,si){var mk=mkDay(t),m=mins(),P=function(x){return Math.max(0,Math.min(100,(x-360)/540*100))},beads='';
 for(var i=0;i<10;i++){var pl=mkPlan(i),s=mkStatus(i,now),r=mk[i],cl=r&&r.x?'x':r&&r.e?'ok':r&&r.s?(s.tone==='crit'?'crit':'run'):s.tone==='crit'?'crit':s.tone==='warn'?'warn':'';
  beads+='<button class="bead '+cl+'" style="left:'+P(pl.min)+'%" data-act="mkq" data-i="'+i+'" title="Runde '+(i+1)+' · '+mkTime(i)+' · '+esc(s.s)+'">'+(i+1)+'</button>'}
 var marks=[360,480,600,720,840,900].map(function(x){return '<span class="mk" style="left:'+P(x)+'%">'+hhmm(x)+'</span>'}).join('');
 var nowEl=isWork(t)&&m>=360&&m<=900?'<span class="now" id="tnow" style="left:'+P(m)+'%"><span>'+hhmm(m)+'</span></span>':'';
 var rest=si.state==='lauf'?si.txt.split(' · ')[1]:si.txt;
 return '<section class="lb-band lb-rv">'+chap('01','Schicht')+'<div class="lb-bh"><span class="lb-k">06:00 bis 15:00</span><span class="lb-bp"><b data-lv="bp">'+Math.round(si.p*100)+'</b><small>%</small></span><span class="lb-br">'+esc(rest)+'</span></div>'
  +'<div class="tl" aria-label="Schichtverlauf 06:00 bis 15:00"><span class="base"></span><span class="done" style="width:'+(si.p*100).toFixed(1)+'%"></span><span class="ev" style="left:'+P(405)+'%">Shopfloor 06:45</span>'+beads+nowEl+marks+'</div></section>'}

/* Bogenanzeige */
function gauge(v,n){var p=n?v/n:0,L=Math.PI*120;return '<svg class="lb-g" viewBox="0 0 280 160" aria-hidden="true"><path d="M20 150 A120 120 0 0 1 260 150" class="g0"/><path d="M20 150 A120 120 0 0 1 260 150" class="g1" style="--L:'+L.toFixed(1)+';stroke-dasharray:'+L.toFixed(1)+';stroke-dashoffset:'+(L*(1-p)).toFixed(1)+'"/></svg>'}

function chap(n,t){return '<div class="lb-chap"><span>'+n+'</span><b>'+t+'</b><i></i></div>'}
/* Tageszeit im Bild: Farbe und Helligkeit des Fotos folgen der Uhrzeit */
function tod(){var n=new Date(),h=n.getHours()+n.getMinutes()/60;
 if(h<5.5||h>=19.5)return ['nacht',.5,.55,-14];if(h<9)return ['morgen',1.1,1.18,-5];if(h<13)return ['tag',1.14,.96,0];if(h<15.5)return ['nachmittag',1.06,1.1,-7];return ['abend',.78,.92,-11]}
/* Daten im Bild: Markierungen an Fenster, Regal und Stapler (Lage im gespiegelten Foto, Prozent der Bildfläche) */
function hs(x,y,k,v,go,tone,side){return '<button class="lb-hs'+(tone?' '+tone:'')+(side?' l':'')+'" style="left:'+x+'%;top:'+y+'%" data-act="go" data-go="'+go+'"><i></i><span><small>'+k+'</small><b data-lv="hs'+go+'">'+v+'</b></span></button>'}
function stage(){var now=new Date(),t=todayIso(),h=now.getHours(),si=shiftInfo(now),fs=fachStat(),al=alerts(now),nx=isWork(t)?t:nextWork(t),pr=presentOn(nx).length;
 var mk=mkDay(t),done=Object.keys(mk).filter(function(k){return mk[k].e}).length,st=story(t,si,al,pr,fs),gr=h<11?'Guten Morgen':h<17?'Guten Tag':'Guten Abend';
 var pc=Math.round(pct(fs.o,fs.n)),qs=regOpen('qs');
 var fact=function(v,of,k,go,tone){return '<button class="lb-f'+(tone?' '+tone:'')+'" data-act="go" data-go="'+go+'"><span class="lb-fv"><b data-cu data-lv="f'+go+'">'+v+'</b>'+(of?'<small>'+of+'</small>':'')+'</span><span class="lb-fl">'+k+'</span></button>'};
 var td=tod(),crit=al.some(function(a){return a.tone==='crit'&&a.go==='milk'});
 var hero='<section class="lb-hero" data-mood="'+st.mood+'" data-tod="'+td[0]+'" style="--gb:'+td[1]+';--gs:'+td[2]+';--gh:'+td[3]+'deg"><div class="lb-img"><div class="lb-pic" style="--kb:-'+(Date.now()/1000%92).toFixed(1)+'s"><div class="lb-photo" aria-hidden="true"></div>'
  +(si.state==='frei'?'':hs(71,27,'Schicht',Math.round(si.p*100)+' %','heute')+hs(89,46,'Fachlager',fs.o+' / '+fs.n,'fach','',1)+hs(87,68,'Milkrun',done+' / 10','milk',crit?'crit':'',1))
  +'</div></div><div class="lb-in">'
  +'<div class="lb-eb">'+esc(fmtD(t,{weekday:'long',day:'numeric',month:'long'}))+' · KW '+kw(t)+'</div>'
  +'<p class="lb-hi">'+gr+', '+esc(firstName(S.user))+'.</p>'
  +'<h2 class="lb-h">'+esc(st.h)+'</h2>'
  +'<p class="lb-s">'+esc(st.s)+(st.go?' <button class="lb-go" data-act="go" data-go="'+st.go+'">Ansehen '+ic('arrow')+'</button>':'')+'</p>'
  +'<div class="lb-facts">'+fact(pr,'/ '+CREW.length,'im Dienst '+(nx===t?'heute':fmtD(nx,{weekday:'short'})),'urlaub')+fact(done,'/ 10','Milkrun-Runden','milk')+fact(pc,'%','Fächer belegt','fach')+fact(al.length,'','Warnungen','heute',al.length?(st.mood==='crit'?'crit':'warn'):'ok')+'</div>'
  +'</div></section>';

 var l=tzLatest(isWork(t)?addDays(t,-1):t),f=l?tzFn(S.tz[l]):null,ser=function(fn){return Object.keys(S.tz).filter(function(k){return k<=t&&Object.keys(S.tz[k]).length}).sort().slice(-14).map(function(k){return fn(tzFn(S.tz[k]))})};
 var k='<div class="lb-rv">'+chap('02','Lager und Eingang')+'<div class="row r4 lb-kpi">'
  +'<button class="lb-main" data-act="go" data-go="fach"><span class="lb-k">Fachlager</span>'+gauge(fs.o,fs.n)+'<span class="lb-mv"><b data-cu data-lv="mv">'+fs.o+'</b><small>/ '+fs.n+'</small></span><span class="lb-ms">'+pc+' % belegt · '+fs.fr+' frei</span></button>'
  +'<div class="lb-side">'
  +'<button class="lb-sm '+(fs.l?'crit':'ok')+'" data-act="go" data-go="fach"><span class="lb-k">Langlieger</span><b data-cu data-lv="ll">'+fs.l+'</b><span>über 10 Tage im Fach</span></button>'
  +'<button class="lb-sm '+(qs?'warn':'ok')+'" data-act="go" data-go="qs"><span class="lb-k">Störmeldungen</span><b data-cu data-lv="qs">'+qs+'</b><span>offen</span></button>'
  +'<button class="lb-sm" data-act="go" data-go="tz"><span class="lb-k">Pakete</span><b data-cu data-lv="pk">'+(f?f.pakete:0)+'</b><span>'+(l?'Stand '+esc(fmtD(l,{weekday:'short',day:'2-digit',month:'2-digit'})):'noch keine Zahlen')+'</span>'+spark(ser(function(x){return x.pakete}))+'</button>'
  +'</div></div></div>';

 var film='<div class="lb-rv">'+chap('03','Produktion')+'<section class="lb-film"><div class="lb-pimg" aria-hidden="true" style="--kb:-'+(Date.now()/1000%92).toFixed(1)+'s"></div><div class="lb-fin"><span class="lb-k">Produktion'+(l?' · '+esc(fmtD(l,{weekday:'long',day:'numeric',month:'long'})):'')+'</span>'
  +(f?'<div class="lb-fn">'+[['Gesägt',f.gesaegt,'gesaegt'],['Vor Lack',f.lack,'lack'],['Vor Montage',f.mont,'mont'],['Störungen',f.stoer,'stoer']].map(function(x){return '<div><b data-cu data-lv="fn'+x[2]+'">'+x[1]+'</b><span>'+x[0]+'</span>'+spark(ser(function(y){return y[x[2]]}))+'</div>'}).join('')+'</div>'
   :'<p class="lb-s">Noch keine Tageszahlen erfasst.</p>')
  +'<button class="btn sm ghost" data-act="go" data-go="tz">Tageszahlen öffnen '+ic('arrow')+'</button></div></section></div>';

 var alH=al.length?'<div class="al">'+al.map(function(a){return '<button class="'+a.tone+'" data-act="go" data-go="'+a.go+'"><i></i><span>'+esc(a.t)+'</span>'+ic('arrow')+'</button>'}).join('')+'</div>':'<div class="calm"><b>Alles ruhig</b><span>Keine offenen Warnungen.</span></div>';
 var pins=S.brett.slice().sort(function(a,b){return (b.pin-a.pin)||b.ts-a.ts}).slice(0,3);
 var br=pins.length?'<div style="display:flex;flex-direction:column;gap:10px">'+pins.map(function(p){return '<div class="post'+(p.pin?' pin':'')+'"><div class="meta">'+(p.pin?cp('sig','angeheftet'):'')+esc(p.by)+' · '+fmtDT(p.ts)+'</div><p>'+esc(p.t)+'</p></div>'}).join('')+'</div>':empty('Keine Meldungen','');
 var ab=[],d=t;for(var q=0;q<6;q++){d=q?nextWork(d):(isWork(d)?d:nextWork(d));absentOn(d).forEach(function(v){ab.push([d,v])})}
 var abH=ab.length?'<table class="t"><tbody>'+ab.slice(0,7).map(function(x){return '<tr><td class="mono">'+fmtD(x[0],{weekday:'short',day:'2-digit',month:'2-digit'})+'</td><td>'+esc(x[1].emp)+'</td><td>'+cp(x[1].type==='Krank'?'crit':x[1].type==='FZA'?'warn':'info',x[1].type)+'</td></tr>'}).join('')+'</tbody></table>':empty('Alle an Bord','In den nächsten Werktagen keine Abwesenheiten.');
 var fc=window.fcBlock?fcBlock():'';
 return hero+band(t,now,si)+k+film+'<div class="lb-rv">'+chap('04','Ausblick und Lage')+(fc||'')+'</div>'
  +'<div class="row r-23 lb-rv">'+card('Warnlage',alH,{r:al.length?cp(al.some(function(a){return a.tone==='crit'})?'crit':'warn',al.length+' offen'):''})+card('Schwarzes Brett',br,{r:'<button class="btn sm" data-act="go" data-go="brett">Alle</button>'})+'</div>'
  +'<div class="lb-rv">'+card('Abwesenheiten',abH,{r:'<button class="btn sm" data-act="go" data-go="urlaub">Planen</button>'})+'</div>'}

VIEW.lage=function(){return mode()==='buehne'?stage():classic.apply(this,arguments)};

/* ---------- Scrollen: Einblenden und Parallaxe ---------- */
var IO=null,seen={};
function reveal(p){if(p!=='lage'||mode()!=='buehne'){if(IO){IO.disconnect();IO=null}return}var st=$('#stage');if(!st)return;
 var els=st.querySelectorAll('.lb-rv');els.forEach(function(e,i){e.dataset.rv=i;if(seen[i]||RM)e.classList.add('lb-on','nt')});
 if(RM||!window.IntersectionObserver)return;if(IO)IO.disconnect();
 IO=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('lb-on');seen[x.target.dataset.rv]=1;IO.unobserve(x.target)}})},{root:st,rootMargin:'0px 0px -8% 0px',threshold:.08});
 els.forEach(function(e){if(!e.classList.contains('lb-on'))IO.observe(e)})}
/* Überschrift passt sich der Breite an, statt abgeschnitten zu werden */
function fitH(){var h=document.querySelector('#stage .lb-h');if(!h)return;h.style.fontSize='';var z=parseFloat(getComputedStyle(h).fontSize),n=0;while(h.scrollWidth>h.clientWidth+1&&z>28&&n++<60){z-=2;h.style.fontSize=z+'px'}}
var ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);reveal(p);if(p==='lage'){par();fitH();live()}else LV=null};
var rz=0;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(fitH,150)});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitH);
var go0=window.go;window.go=function(p){if(p!==S.ui.page)seen={};return go0.apply(this,arguments)};
function par(){var st=$('#stage'),im=st&&st.querySelector('.lb-img');if(!im||RM)return;var y=st.scrollTop;im.style.transform='translate3d(0,'+(y*.35).toFixed(1)+'px,0)';var hi=st.querySelector('.lb-in');if(hi)hi.style.opacity=Math.max(0,1-y/560).toFixed(3)}
var raf=0;document.addEventListener('scroll',function(e){if(e.target.id!=='stage'||raf)return;raf=requestAnimationFrame(function(){raf=0;par()})},true);

/* ---------- Lebende Zahlen: geänderte Werte rollen um und leuchten kurz ---------- */
var LV=null,LT=0;function snap(){var c={};document.querySelectorAll('#stage [data-lv]').forEach(function(e){c[e.dataset.lv]=e.textContent});return c}
function live(){if(LV===null){LV={};clearTimeout(LT);LT=setTimeout(function(){if(LV)LV=snap()},1900);return}document.querySelectorAll('#stage [data-lv]').forEach(function(e){var k=e.dataset.lv,v=e.textContent;if(k in LV&&LV[k]!==v&&!RM){e.classList.remove('lb-chg');void e.offsetWidth;e.classList.add('lb-chg')}if(k in LV||!Object.keys(LV).length)LV[k]=v})}
/* ---------- Tiefe: das Hallenbild folgt leicht der Maus ---------- */
var mr=0;document.addEventListener('pointermove',function(e){if(RM||e.pointerType!=='mouse'||mr)return;mr=requestAnimationFrame(function(){mr=0;var p=document.querySelector('#stage .lb-pic');if(!p)return;var x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;p.style.translate=(-x*22).toFixed(1)+'px '+(-y*12).toFixed(1)+'px'})},{passive:true});

/* ---------- Einstellung ---------- */
var adm=VIEW.adm;VIEW.adm=function(){var h=adm.apply(this,arguments),b=mode()==='buehne';
 return h+card('Lagebild','<div class="seg"><button class="'+(b?'on':'')+'" data-act="lageset" data-v="buehne">Bühne</button><button class="'+(b?'':'on')+'" data-act="lageset" data-v="klassisch">klassisch</button></div><p class="dim" style="font-size:12.5px;margin:12px 0 0">Bühne: Hallenbild, die Lage in einem Satz, Schicht als Band, Kennzahlen mit Bildern. Die Bilder sind KI-generiert, keine Aufnahmen aus dem Werk. Gilt für dieses Gerät.</p>')};
ACT.lageset=function(d){ls('mflow.lage',d.v);render()};
})();
