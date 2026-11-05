/* ===== MUNSCH Flow 6 · Oberfläche =====
   Daten, Regeln und Sync kommen unverändert aus dem Kern (core.js, aus base.html übernommen).
   Diese Datei baut Auftakt, Anmeldung, Gerüst, Szenen und Interaktionen neu. */
(function(){
'use strict';
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var FINE=window.matchMedia&&matchMedia('(hover: hover) and (pointer: fine)').matches;
var root=document.documentElement;
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){return null}}

/* ---------- Symbole ---------- */
var I={
 lage:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>',
 lager:'<path d="M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16z"/><path d="M3.5 8 12 12.5 20.5 8M12 12.5v8"/>',
 prod:'<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
 pers:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.5a3.3 3.3 0 0 1 0 6.6M18 14.6c1.8.7 3 2.5 3.5 5.4"/>',
 komm:'<path d="M4 5h16v11H9l-5 4z"/>',
 sys:'<path d="M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4z"/><circle cx="12" cy="12" r="3"/>',
 mon:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
 search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
 bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 more:'<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
 milk:'<path d="M3 16h13V7H3zM16 10h3.5l1.5 3v3h-5"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
 tz:'<path d="M4 19V5M4 19h16"/><path d="m7 15 4-4 3 3 5-6"/>',
 theme:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'};
function ic(n,c){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'+(c?' class="'+c+'"':'')+'>'+(I[n]||'')+'</svg>'}

/* ---------- Navigation ---------- */
var LATER={runde:'Shopfloor 06:45',chk:'Schichtaufgaben',fluss:'Materialfluss',s5:'5S-Board',plan:'Planungsboard',schicht:'Schichtplan',quali:'Qualifikationen',ausw:'Auswertung',imp:'Excel-Import',ber:'Berichte'};
var GROUPS=[
 {id:'lage',t:'Steuerung',ic:'lage',p:[['lage','Lagebild'],['runde','Shopfloor 06:45'],['chk','Schichtaufgaben'],['fluss','Materialfluss']]},
 {id:'lager',t:'Material und Lager',ic:'lager',p:[['fach','Fachverwaltung'],['milk','Milkrun'],['vork','Vorkommissionierung'],['wep','WEP Wareneingangsprüfung'],['we','Wareneingang'],['mw','Materialwagen'],['wv','Werksverkehr'],['tb','TB-Wagen und TB-Kiste']]},
 {id:'prod',t:'Produktion und Qualität',ic:'prod',p:[['tz','Tageszahlen'],['qs','QS und Störmeldungen'],['auf','Aufträge und Produktionsweg'],['mas','Maschinen und Wartung'],['aud','Audits'],['s5','5S-Board']]},
 {id:'pers',t:'Personal',ic:'pers',p:[['urlaub','Urlaub und Anwesenheit'],['gespr','Personalgespräche','lead'],['plan','Planungsboard'],['schicht','Schichtplan'],['quali','Qualifikationen']]},
 {id:'komm',t:'Kommunikation',ic:'komm',p:[['funk','Abteilungsfunk'],['brett','Schwarzes Brett']]},
 {id:'sys',t:'System',ic:'sys',p:[['adm','Einstellungen'],['verl','Verlauf'],['ausw','Auswertung'],['imp','Excel-Import','lead'],['ber','Berichte']]}];
var PAGE={},GOF={};GROUPS.forEach(function(g){g.p.forEach(function(p){PAGE[p[0]]={t:p[1],g:g,lead:p[2]==='lead'}})});
function pageOk(p){var x=PAGE[p];return x&&(!x.lead||isLead())}
function grpOf(p){return (PAGE[p]||PAGE.lage).g}

/* ---------- Bausteine ---------- */
function cp(t,tx){return '<span class="chip '+(t||'')+'"><i></i>'+esc(tx)+'</span>'}
function card(t,body,o){o=o||{};return '<section class="card'+(o.c?' '+o.c:'')+'"'+(o.id?' id="'+o.id+'"':'')+'>'+(t?'<div class="ch"><h2>'+t+'</h2><span class="ln"></span>'+(o.r?'<div class="r">'+o.r+'</div>':'')+'</div>':'')+body+'</section>'}
function meter(on,n,max){max=max||12;var k=n>0?Math.round(on/n*max):0,h='';for(var i=0;i<max;i++)h+='<i'+(i<k?' class="on" style="--i:'+i+'"':'')+'></i>';return '<div class="meter">'+h+'</div>'}
function sparkS(vals,col){if(!vals||vals.length<2)return '';var w=200,h=34,mx=Math.max.apply(null,vals),mn=Math.min.apply(null,vals),r=mx-mn||1,n=vals.length;
 var P=vals.map(function(v,i){return [(i/(n-1))*(w-4)+2,h-4-(v-mn)/r*(h-10)]}),d=P.map(function(p,i){return (i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)}).join(''),L=P[n-1];
 return '<svg class="spark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" width="100%" height="34" aria-hidden="true"><path d="'+d+'L'+L[0].toFixed(1)+','+h+'L2,'+h+'Z" fill="'+(col||'var(--signal)')+'" opacity=".12"/><path d="'+d+'" fill="none" stroke="'+(col||'var(--signal)')+'" stroke-width="1.8" vector-effect="non-scaling-stroke"/><circle cx="'+L[0].toFixed(1)+'" cy="'+L[1].toFixed(1)+'" r="3" fill="'+(col||'var(--signal)')+'"/></svg>'}
function tile(o){var tag=o.go||o.act?'button':'div',at=o.go?' data-act="go" data-go="'+o.go+'"':o.act?' data-act="'+o.act+'"':'';
 return '<'+tag+' class="tile '+(o.tone||'')+'"'+at+'><span class="stripe"></span><span class="k">'+esc(o.k)+'</span><span class="v"'+(o.cu!==false?' data-cu':'')+'>'+o.v+'</span>'+(o.s?'<span class="s">'+o.s+'</span>':'')+(o.m?meter(o.m[0],o.m[1]):'')+(o.sp?sparkS(o.sp,o.spc):'')+'</'+tag+'>'}
function emptyS(t,s){return '<div class="empty"><b>'+esc(t)+'</b><span>'+esc(s||'')+'</span></div>'}
function hhmm(min){return ('0'+Math.floor(min/60)).slice(-2)+':'+('0'+(min%60)).slice(-2)}
function minsNow(){var n=new Date();return n.getHours()*60+n.getMinutes()}
function initials(n){var p=String(n).replace('.','').split(' ');return ((p[0]||'')[0]||'')+((p[1]||'')[0]||'')}
function demoTag(){return S.demo?cp('info','Beispieldaten'):''}

/* ---------- Ebenen ---------- */
window.modal=function(html){closeModal();var v=document.createElement('div');v.className='veil';v.id='modal';v.innerHTML='<div class="dlg" role="dialog" aria-modal="true">'+html+'</div>';v.addEventListener('pointerdown',function(e){if(e.target===v)closeModal()});document.body.appendChild(v);var f=v.querySelector('input,select,textarea');if(f)setTimeout(function(){try{f.focus()}catch(e){}},60)};
window.closeModal=function(){var m=$('#modal');if(m)m.remove()};
var CONF=null;
window.confirmM=function(msg,fn,label,tone){CONF=fn;modal('<h3>Bestätigen</h3><p class="lead" style="margin-top:10px">'+msg+'</p><div class="acts"><button class="btn ghost" data-act="mclose">Abbrechen</button><button class="btn '+(tone==='no'?'no':'pri')+'" data-act="mconf">'+esc(label||'OK')+'</button></div>')};
ACT.mclose=function(){closeModal();closeDrawer()};
ACT.mconf=function(){var f=CONF;CONF=null;closeModal();if(f)f()};
function drawer(html){closeDrawer();var d=document.createElement('aside');d.className='drawer';d.id='drawer';d.innerHTML=html;document.body.appendChild(d);setTimeout(function(){document.addEventListener('pointerdown',drOut,true)},0)}
function drOut(e){var d=$('#drawer');if(d&&!d.contains(e.target)&&!e.target.closest('#modal,.toast,#pal'))closeDrawer()}
function closeDrawer(){var d=$('#drawer');if(d)d.remove();document.removeEventListener('pointerdown',drOut,true)}
window.toast=function(m){var o=$('.toast');if(o)o.remove();var t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},3400)};

/* ---------- Gerüst ---------- */
window.buildShell=function(){
 var rail='<div class="mark">'+logoCore(40)+'</div>'+GROUPS.map(function(g){return '<button class="rb" data-act="grp" data-g="'+g.id+'" aria-label="'+esc(g.t)+'">'+ic(g.ic)+'<span class="tip">'+esc(g.t)+'</span><span class="bd" hidden></span></button>'}).join('')
  +'<button class="rb" data-act="go" data-go="mon" aria-label="Werkstattmonitor">'+ic('mon')+'<span class="tip">Werkstattmonitor</span></button><span class="sp"></span><button class="av" data-act="go" data-go="adm" aria-label="Einstellungen">'+esc(initials(S.user))+'</button>';
 $('#app').innerHTML='<nav class="rail" aria-label="Bereiche">'+rail+'</nav>'
  +'<header class="top"><div class="ttl"><div class="eb" id="teb"></div><h1 id="tt"></h1></div>'
  +'<button class="srch" data-act="pal">'+ic('search')+'<span>Suchen oder fragen</span><kbd>Strg K</kbd></button>'
  +'<span class="live" id="live"><i></i><span>Demo</span></span>'
  +'<button class="ib" data-act="bell" aria-label="Warnlage">'+ic('bell')+'<span class="bd" id="bn" hidden></span></button>'
  +'<div class="clock"><b id="ck"></b><span id="cd"></span></div></header>'
  +'<div class="tick"><span class="lb"><i></i>Newsflash</span><div class="tr"><div class="tm" id="tm"></div></div></div>'
  +'<main id="stage" tabindex="-1"></main>'
  +'<nav class="tabs" aria-label="Schnellwahl">'+[['lage','lage','Lage'],['fach','lager','Fächer'],['milk','milk','Milkrun'],['tz','tz','Zahlen'],['more','more','Mehr']].map(function(t){return '<button data-act="'+(t[0]==='more'?'more':'go')+'" data-go="'+t[0]+'">'+ic(t[1])+t[2]+'<span class="bd" hidden></span></button>'}).join('')+'</nav>';
 var fo=document.createElement('div');fo.id='flyout';document.body.appendChild(fo);
 clock();ticker()};
function flyout(gid,all){var fo=$('#flyout'),gs=all?GROUPS:GROUPS.filter(function(g){return g.id===gid}),b=badges(new Date());
 fo.innerHTML=gs.map(function(g){return '<h3>'+esc(g.t)+'</h3><div class="sub">'+g.p.filter(function(p){return pageOk(p[0])}).length+' Bereiche</div>'+g.p.filter(function(p){return pageOk(p[0])}).map(function(p){var n=b[p[0]];return '<button class="'+(S.ui.page===p[0]?'on':'')+'" data-act="go" data-go="'+p[0]+'"><span class="dot"></span>'+esc(p[1])+(LATER[p[0]]?'<span class="later">folgt</span>':n?'<span class="n">'+n[0]+'</span>':'')+'</button>'}).join('')}).join('<div style="height:22px"></div>')
  +(all?'<div style="height:22px"></div><button data-act="go" data-go="mon"><span class="dot"></span>Werkstattmonitor</button>':'');
 fo.dataset.g=all?'all':gid;fo.classList.add('on')}
function flyClose(){var f=$('#flyout');if(f)f.classList.remove('on')}
ACT.grp=function(d){var f=$('#flyout');if(f.classList.contains('on')&&f.dataset.g===d.g)return flyClose();flyout(d.g)};
ACT.more=function(){var f=$('#flyout');if(f.classList.contains('on'))return flyClose();flyout(null,true)};
document.addEventListener('pointerdown',function(e){var f=$('#flyout');if(f&&f.classList.contains('on')&&!f.contains(e.target)&&!e.target.closest('.rb,.tabs'))flyClose()});

window.shellUpdate=function(){var now=new Date(),b=badges(now),p=S.ui.page,al=alerts(now);
 var g=grpOf(p);$('#teb').textContent=PAGE[p]?g.t:'';$('#tt').textContent=PAGE[p]?PAGE[p].t:'';
 $$('.rb[data-g]').forEach(function(r){var G=GROUPS.filter(function(x){return x.id===r.dataset.g})[0],n=0;G.p.forEach(function(x){if(b[x[0]])n+=b[x[0]][0]});r.classList.toggle('on',G===g);var bd=r.querySelector('.bd');bd.hidden=!n;bd.textContent=n});
 $$('.tabs button').forEach(function(t){var on=t.dataset.go===p||(t.dataset.go==='more'&&['lage','fach','milk','tz'].indexOf(p)<0);t.classList.toggle('on',on)});
 var bn=$('#bn');bn.hidden=!al.length;bn.textContent=al.length;
 var lv=$('#live');if(lv){var st=!window.SY||!SY.on?'demo':SY.ok?'':'off';lv.className='live '+st;lv.querySelector('span').textContent=st==='demo'?'Demo':st==='off'?'Offline':'Live';lv.title=st==='demo'?'Ohne Zentrale, Daten nur auf diesem Gerät':st==='off'?'Zentrale nicht erreichbar, Änderungen werden gepuffert':'Mit der Zentrale verbunden'}
 root.classList.toggle('crit',al.some(function(a){return a.tone==='crit'}));
 document.title=(al.length?'('+al.length+') ':'')+'MUNSCH Flow · '+(PAGE[p]?PAGE[p].t:'')};
function clock(){var n=new Date(),c=$('#ck');if(!c)return;c.textContent=n.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});$('#cd').textContent=n.toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'long'})}
var lastTick='';
function ticker(){var a=[],now=new Date();S.brett.filter(function(x){return x.pin}).forEach(function(x){a.push(['Meldung',x.t])});alerts(now).forEach(function(x){a.push(['Lage',x.t])});a.push(['Schicht',shiftInfo(now).txt]);
 var l=tzLatest(todayIso());if(l){var f=tzFn(S.tz[l]);a.push(['Zahlen',fmtD(l,{weekday:'short',day:'2-digit',month:'2-digit'})+': '+f.pakete+' Pakete, '+f.gesaegt+' gesägt, '+f.stoer+' Störungen'])}
 var fs=fachStat();a.push(['Lager',fs.o+' von '+fs.n+' Fächern belegt']);
 var h=a.map(function(x){return '<span><b>'+esc(x[0])+'</b>'+esc(x[1])+'</span>'}).join(''),el=$('#tm');if(!el||h===lastTick)return;lastTick=h;el.innerHTML=h+h;el.style.setProperty('--dur',Math.max(30,a.length*9)+'s')}

/* ---------- Router und Render ---------- */
var lastPg=null,pgAt=0;
window.go=function(p){if(p==='mon')return openMon();if(!PAGE[p])p='lage';if(!pageOk(p))return toast('Nur für die Teamleitung');flyClose();closeDrawer();
 var changed=p!==S.ui.page||lastPg===null;S.ui.page=p;save();try{history.replaceState(null,'','#'+p)}catch(e){}
 if(changed&&document.startViewTransition&&!RM&&lastPg!==null){try{document.startViewTransition(function(){render()})}catch(e){render()}}else render()};
window.render=function(){var st=$('#stage');if(!st)return;var p=S.ui.page,isNew=p!==lastPg,before=isNew?null:tileVals();
 var a=document.activeElement,id=a&&a.id,sel=a&&a.selectionStart,sc=st.scrollTop;
 try{st.innerHTML='<div class="scene">'+(VIEW[p]||VIEW.lage)()+'</div>'}catch(e){console.error(e);st.innerHTML='<div class="scene">'+card('Fehler in dieser Ansicht','<p>'+esc(e.message)+'</p><button class="btn" data-act="go" data-go="lage">Zum Lagebild</button>')+'</div>'}
 if(isNew){lastPg=p;pgAt=Date.now();st.scrollTop=0;$$('.scene > *',st).forEach(function(c,i){c.style.setProperty('--n',i)});if(!RM){st.classList.remove('enter');void st.offsetWidth;st.classList.add('enter');clearTimeout(render.t);render.t=setTimeout(function(){st.classList.remove('enter')},1900);countUp(st)}}
 else{st.scrollTop=sc;if(id){var n=document.getElementById(id);if(n){try{n.focus();if(sel!=null)n.setSelectionRange(sel,sel)}catch(e){}}}if(before&&Date.now()-pgAt>1500)liveDiff(before)}
 shellUpdate();ticker();if(window.afterRender)afterRender(p)};
function countUp(st){if(RM)return;$$('[data-cu]',st).forEach(function(e){var tx=e.innerHTML,m=/^(\d{1,5})(.*)$/s.exec(tx);if(!m)return;var to=+m[1],rest=m[2],t0=performance.now(),D=900+Math.min(600,to*4);if(to<2)return;
  (function f(t){var k=Math.min(1,(t-t0)/D),e2=1-Math.pow(1-k,4);e.innerHTML=Math.round(to*e2)+rest;if(k<1)requestAnimationFrame(f)})(t0)})}
function tileVals(){var m={};$$('#stage .tile').forEach(function(t){var k=t.querySelector('.k'),v=t.querySelector('.v');if(k&&v)m[k.textContent]=v.textContent});return m}
function liveDiff(before){$$('#stage .tile').forEach(function(t){var k=t.querySelector('.k').textContent,v=t.querySelector('.v').textContent;if(!(k in before)||before[k]===v)return;var a=parseFloat(v),o=parseFloat(before[k]);if(!isFinite(a)||!isFinite(o)||a===o)return;
  t.classList.remove('fx-chg');void t.offsetWidth;t.classList.add('fx-chg');var d=document.createElement('span');d.className='dlt'+(a<o?' dn':'');var df=Math.round((a-o)*10)/10;d.textContent=(df>0?'+':'−')+String(Math.abs(df)).replace('.',',');t.appendChild(d);setTimeout(function(){d.remove();t.classList.remove('fx-chg')},2700)})}
ACT.go=function(d){go(d.go)};

/* =====================================================================
   SZENEN
   ===================================================================== */

/* ---------- Lagebild ---------- */
VIEW.lage=function(){var now=new Date(),t=todayIso(),h=now.getHours(),si=shiftInfo(now),fs=fachStat(),al=alerts(now),nx=isWork(t)?t:nextWork(t),pr=presentOn(nx).length;
 var mk=mkDay(t),done=Object.keys(mk).filter(function(k){return mk[k].e}).length,gr=h<11?'Guten Morgen':h<17?'Guten Tag':'Guten Abend';
 var m=minsNow(),P=function(min){return Math.max(0,Math.min(100,(min-360)/540*100))};
 var beads='';for(var i=0;i<10;i++){var pl=mkPlan(i),s=mkStatus(i,now),r=mk[i],cl=r&&r.x?'x':r&&r.e?'ok':r&&r.s?(s.tone==='crit'?'crit':'run'):s.tone==='crit'?'crit':s.tone==='warn'?'warn':'';
  beads+='<button class="bead '+cl+'" style="left:'+P(pl.min)+'%" data-act="mkq" data-i="'+i+'" title="Runde '+(i+1)+' · '+mkTime(i)+' · '+esc(s.s)+'">'+(i+1)+'</button>'}
 var marks=[360,480,600,720,840,900].map(function(x){return '<span class="mk" style="left:'+P(x)+'%">'+hhmm(x)+'</span>'}).join('');
 var evs='<span class="ev" style="left:'+P(405)+'%">Shopfloor 06:45</span>';
 var nowEl=isWork(t)&&m>=360&&m<=900?'<span class="now" id="tnow" style="left:'+P(m)+'%"><span>'+hhmm(m)+'</span></span>':'';
 var hero='<section class="hero"><div class="hl"><h2 class="gr">'+gr+',<br><em>'+esc(firstName(S.user))+'</em></h2><div class="st"><b>'+esc(si.txt.split(' · ')[0])+'</b><span>'+esc(si.txt.split(' · ').slice(1).join(' · ')||fmtD(t,{weekday:'long',day:'2-digit',month:'long'}))+'</span></div></div>'
  +'<div class="tl" aria-label="Schichtverlauf 06:00 bis 15:00"><span class="base"></span><span class="done" style="width:'+(si.p*100).toFixed(1)+'%"></span>'+evs+beads+nowEl+marks+'</div>'
  +'<div class="kp"><div><b>'+pr+'<small class="dim"> / '+CREW.length+'</small></b><span>Besetzung '+(nx===t?'heute':fmtD(nx,{weekday:'short'}))+'</span></div><div><b>'+done+'<small class="dim"> / 10</small></b><span>Milkrun</span></div><div><b>'+Math.round(pct(fs.o,fs.n))+' %</b><span>Fächer belegt</span></div><div><b style="color:'+(al.length?'var(--warn)':'var(--ok)')+'">'+al.length+'</b><span>Warnungen</span></div></div></section>';
 var l=tzLatest(isWork(t)?addDays(t,-1):t),f=l?tzFn(S.tz[l]):null,ser=function(fn){return Object.keys(S.tz).filter(function(k){return k<=t&&Object.keys(S.tz[k]).length}).sort().slice(-12).map(function(k){return fn(tzFn(S.tz[k]))})};
 var tiles='<div class="row r4">'
  +tile({k:'Fächer belegt',v:fs.o+'<small>/ '+fs.n+'</small>',s:fs.fr+' frei',m:[fs.o,fs.n],go:'fach'})
  +tile({k:'Langlieger',v:String(fs.l),s:'über 10 Tage im Fach',tone:fs.l?'crit':'ok',go:'fach'})
  +tile({k:'Störmeldungen',v:String(regOpen('qs')),s:'offen',tone:regOpen('qs')?'warn':'ok',go:'qs'})
  +tile({k:'Pakete',v:String(f?f.pakete:0),s:l?'Stand '+fmtD(l,{weekday:'short',day:'2-digit',month:'2-digit'}):'noch keine Zahlen',sp:ser(function(x){return x.pakete}),go:'tz'})+'</div>';
 var alH=al.length?'<div class="al">'+al.map(function(a){return '<button class="'+a.tone+'" data-act="go" data-go="'+a.go+'"><i></i><span>'+esc(a.t)+'</span>'+ic('arrow')+'</button>'}).join('')+'</div>':'<div class="calm"><b>Alles ruhig</b><span>Keine offenen Warnungen.</span></div>';
 var zahl=f?'<div class="row r2" style="gap:14px">'+[['Gesägt',f.gesaegt,ser(function(x){return x.gesaegt})],['Vor Lack',f.lack,ser(function(x){return x.lack})],['Vor Montage',f.mont,ser(function(x){return x.mont})],['Störungen',f.stoer,ser(function(x){return x.stoer})]].map(function(x){return '<div><div class="dim mono" style="font-size:11px;letter-spacing:.14em;text-transform:uppercase">'+x[0]+'</div><div style="font:700 38px/1 var(--display)" data-cu>'+x[1]+'</div>'+sparkS(x[2])+'</div>'}).join('')+'</div>':emptyS('Noch keine Tageszahlen','Trag sie unter Tageszahlen ein.');
 var pins=S.brett.slice().sort(function(a,b){return (b.pin-a.pin)||b.ts-a.ts}).slice(0,3);
 var br=pins.length?'<div style="display:flex;flex-direction:column;gap:10px">'+pins.map(function(p){return '<div class="post'+(p.pin?' pin':'')+'"><div class="meta">'+(p.pin?cp('sig','angeheftet'):'')+esc(p.by)+' · '+fmtDT(p.ts)+'</div><p>'+esc(p.t)+'</p></div>'}).join('')+'</div>':emptyS('Keine Meldungen','');
 var ab=[],d=t;for(var k=0;k<6;k++){d=k?nextWork(d):(isWork(d)?d:nextWork(d));absentOn(d).forEach(function(v){ab.push([d,v])})}
 var abH=ab.length?'<table class="t"><tbody>'+ab.slice(0,7).map(function(x){return '<tr><td class="mono">'+fmtD(x[0],{weekday:'short',day:'2-digit',month:'2-digit'})+'</td><td>'+esc(x[1].emp)+'</td><td>'+cp(x[1].type==='Krank'?'crit':x[1].type==='FZA'?'warn':'info',x[1].type)+'</td></tr>'}).join('')+'</tbody></table>':emptyS('Alle an Bord','In den nächsten Werktagen keine Abwesenheiten.');
 return hero+tiles+'<div class="row r-23">'+card('Warnlage',alH,{r:al.length?cp(al.some(function(a){return a.tone==='crit'})?'crit':'warn',al.length+' offen'):''})+card('Tageszahlen'+(l?' · '+fmtD(l,{weekday:'short',day:'2-digit',month:'2-digit'}):''),zahl,{r:'<button class="btn sm" data-act="go" data-go="tz">Eintragen</button>'})+'</div>'
  +'<div class="row r2">'+card('Schwarzes Brett',br,{r:'<button class="btn sm" data-act="go" data-go="brett">Alle</button>'})+card('Abwesenheiten',abH,{r:'<button class="btn sm" data-act="go" data-go="urlaub">Planen</button>'})+'</div>'};
ACT.mkq=function(d){var i=+d.i,r=mkDay(todayIso())[i];if(r&&r.e)return toast('Runde '+(i+1)+' ist erledigt');if(r&&r.s)return ACT.mke(d);ACT.mks(d)};

/* ---------- Fachverwaltung ---------- */
/* Aus MUNSCH Flow 5 wortgleich übernommen, damit Fachverlauf, Protokoll und Sync identisch bleiben */
window.fachIn=function(f,raw){var a=aufNr(raw);if(!a){toast('Auftragsnummer muss mit 7 Ziffern beginnen');return false}var dup=S.fach.filter(function(x){return x.auf===a&&x.id!==f.id})[0];f.auf=a;f.ts=Date.now();f.legacy=0;S.fachlog.unshift({ts:Date.now(),u:S.user,f:f.id,a:a,k:'ein'});logA('Eingelagert: '+a+' in '+fachName(f));save();toast(a+' in '+fachName(f)+' eingelagert'+(dup?' · liegt auch in '+fachName(dup):''));return true};
window.mkSync=function(){var t=todayIso(),day=mkDay(t);tzSet(t,'milkrun',Object.keys(day).filter(function(k){return day[k].e}).length)};
function nextFree(){return S.fach.filter(function(f){return f.typ==='S'&&!f.auf&&!f.legacy})[0]||S.fach.filter(function(f){return !f.auf&&!f.legacy})[0]||null}
function fachSel(){var f=S.ui.fsel&&S.fach.filter(function(x){return x.id===S.ui.fsel&&!x.auf&&!x.legacy})[0];return f||nextFree()}
function cellCls(f){if(f.auf&&fachLang(f))return 'll';if(f.auf)return 'o';if(f.legacy)return 'lg';return ''}
function cellOk(f,flt){if(flt==='frei')return !f.auf&&!f.legacy;if(flt==='belegt')return !!(f.auf||f.legacy);if(flt==='lang')return fachLang(f);if(flt==='alt')return f.legacy&&!f.auf;return true}
VIEW.fach=function(){var fs=fachStat(),nf=fachSel(),flt=S.ui.fflt||'alle',q=(S.ui.fq||'').trim().toLowerCase();
 var cnt={alle:fs.n,frei:fs.fr,belegt:fs.o,lang:fs.l,alt:fs.a};
 var cells=function(typ){var i=0;return '<div class="map">'+S.fach.filter(function(f){return f.typ===typ}).map(function(f){var d=f.auf?days(f.ts):0,hit=q&&((f.auf||'').indexOf(q)>=0||fachName(f).toLowerCase().indexOf(q)>=0);
  return '<button class="cell '+cellCls(f)+(cellOk(f,flt)?'':' dim2')+(hit?' hit':'')+'" style="--i:'+(i++)+';--a:'+Math.min(100,28+d*7)+'" data-act="fo" data-id="'+f.id+'" title="'+fachName(f)+' · '+(f.auf?f.auf+' · '+d+' Tage':f.legacy?'Altbestand':'frei')+'">'+f.nr+'</button>'}).join('')+'</div>'};
 return '<div class="row r4">'+tile({k:'Belegt',v:Math.round(pct(fs.o,fs.n))+'<small>%</small>',s:fs.o+' von '+fs.n+' Fächern',m:[fs.o,fs.n]})+tile({k:'Frei',v:String(fs.fr),s:'Fächer',tone:'ok',m:[fs.fr,fs.n]})+tile({k:'Langlieger',v:String(fs.l),s:'über 10 Tage',tone:fs.l?'crit':''})+tile({k:'Altbestand',v:String(fs.a),s:'ohne Auftragsnummer',tone:fs.a?'warn':''})+'</div>'
 +'<div class="row r-32">'+card('Einlagern','<div class="frm"><label class="fl w2">Auftragsnummer scannen oder tippen<input class="in scan mono" id="fscan" inputmode="numeric" autocomplete="off" placeholder="Scan" data-ent="fein"></label></div><div class="next" style="margin-top:18px"><span class="dim mono" style="font-size:11px;letter-spacing:.14em;text-transform:uppercase">'+(S.ui.fsel&&nf&&nf.id===S.ui.fsel?'Gewähltes Fach':'Nächstes freies Fach')+'</span><b>'+(nf?fachName(nf):'voll')+'</b>'+(S.ui.fsel?'<button class="btn sm ghost" data-act="fselx">Auswahl aufheben</button>':'')+'</div><button class="btn pri xl" style="width:100%;margin-top:14px" data-act="fein"'+(nf?'':' disabled')+'>Einlagern in '+(nf?fachName(nf):'–')+'</button><p class="dim" style="margin:12px 0 0;font-size:13px">Scanner bestätigt mit Enter. Ein freies Fach in der Karte antippen, um es gezielt zu wählen.</p>')
 +card('Suchen und auslagern','<label class="fl">Auftrag oder Fach (z. B. 4821907, S012)<input class="in" id="fq" autocomplete="off" value="'+esc(S.ui.fq||'')+'" data-in="fq"></label><div id="fqr" style="margin-top:14px">'+fqRes()+'</div>')+'</div>'
 +card('Lagerkarte','<div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:16px"><div class="seg">'+[['alle','Alle'],['frei','Frei'],['belegt','Belegt'],['lang','Langlieger'],['alt','Altbestand']].map(function(x){return '<button class="'+(flt===x[0]?'on':'')+'" data-act="fflt" data-f="'+x[0]+'">'+x[1]+'<span class="c">'+cnt[x[0]]+'</span></button>'}).join('')+'</div><div class="legend"><span><i style="background:var(--stage)"></i>frei</span><span><i style="background:color-mix(in srgb,var(--signal) 55%,var(--stage))"></i>belegt (je älter, desto kräftiger)</span><span><i style="background:color-mix(in srgb,var(--ink3) 30%,var(--stage))"></i>Altbestand</span><span><i style="background:var(--crit)"></i>Langlieger</span></div></div>'
 +'<div class="dim mono" style="font-size:11px;letter-spacing:.14em;margin:4px 0 10px">STANDARD S001 – S'+('00'+S.fach.filter(function(f){return f.typ==='S'}).length).slice(-3)+'</div>'+cells('S')
 +'<div class="dim mono" style="font-size:11px;letter-spacing:.14em;margin:22px 0 10px">PUFFER P001 – P'+('00'+S.fach.filter(function(f){return f.typ==='P'}).length).slice(-3)+'</div>'+cells('P'),{r:demoTag()})};
function fqRes(){var q=(S.ui.fq||'').trim().toLowerCase();if(q.length<2)return '<p class="dim" style="margin:0;font-size:13.5px">Tipp eine Auftragsnummer oder ein Fach. Treffer leuchten in der Karte auf.</p>';
 var hits=S.fach.filter(function(f){return (f.auf||'').indexOf(q)>=0||fachName(f).toLowerCase().indexOf(q)>=0}).slice(0,6);
 if(!hits.length)return '<p class="dim" style="margin:0">Kein Treffer für „'+esc(q)+'“.</p>';
 return '<div class="al">'+hits.map(function(f){return '<button data-act="fo" data-id="'+f.id+'"><i style="background:'+(f.auf?'var(--signal)':f.legacy?'var(--ink3)':'var(--ok)')+'"></i><span><b class="mono">'+fachName(f)+'</b> · '+(f.auf?esc(f.auf)+' · '+days(f.ts)+' Tage':f.legacy?'Altbestand':'frei')+'</span>'+ic('arrow')+'</button>'}).join('')+'</div>'}
ACT.fflt=function(d){S.ui.fflt=d.f;save();render()};
ACT.fselx=function(){S.ui.fsel='';save();render()};
ACT.fein=function(){var el=$('#fscan'),raw=el?el.value:'',f=fachSel();if(!f)return toast('Kein freies Fach');if(fachIn(f,raw)){S.ui.fsel='';render();var n=$('#fscan');if(n){n.value='';n.focus()}}};
ACT.fo=function(d){var f=S.fach.filter(function(x){return x.id===d.id})[0];if(!f)return;var lg=S.fachlog.filter(function(x){return x.f===f.id}).slice(0,6);
 var st=f.auf?(fachLang(f)?cp('crit','Langlieger'):cp('sig','belegt')):f.legacy?cp('warn','Altbestand'):cp('ok','frei');
 drawer('<div class="fd"><div class="dim mono" style="font-size:11px;letter-spacing:.2em">'+(f.typ==='S'?'STANDARDFACH':'PUFFERFACH')+'</div><div class="big">'+fachName(f)+'</div><div>'+st+'</div>'
  +'<dl class="kv">'+(f.auf?'<dt>Auftrag</dt><dd class="mono" style="font-size:18px">'+esc(f.auf)+'</dd><dt>Seit</dt><dd>'+(days(f.ts)?days(f.ts)+(days(f.ts)===1?' Tag':' Tagen'):'heute')+' · '+fmtDT(f.ts)+'</dd>':'')+'</dl>'
  +(f.auf||f.legacy?'<button class="btn no xl" data-act="fout" data-id="'+f.id+'">Auslagern</button>':'<label class="fl">Auftragsnummer<input class="in scan mono" id="fa" inputmode="numeric" data-ent="fin" data-id="'+f.id+'"></label><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn pri" data-act="fin" data-id="'+f.id+'">Hier einlagern</button><button class="btn" data-act="fpick" data-id="'+f.id+'">Als nächstes Fach wählen</button></div>')
  +'<div class="ch" style="margin:10px 0 0"><h2>Verlauf</h2><span class="ln"></span></div>'+(lg.length?'<table class="t"><tbody>'+lg.map(function(x){return '<tr><td class="mono">'+fmtDT(x.ts)+'</td><td>'+(x.k==='ein'?'eingelagert':'ausgelagert')+'</td><td class="mono">'+esc(x.a||'')+'</td><td class="dim">'+esc(x.u||'')+'</td></tr>'}).join('')+'</tbody></table>':'<p class="dim">Noch kein Verlauf.</p>')
  +'<button class="btn ghost" data-act="mclose">Schließen</button></div>');
 var a=$('#fa');if(a)setTimeout(function(){a.focus()},80)};
ACT.fin=function(d){var f=S.fach.filter(function(x){return x.id===d.id})[0];if(f&&fachIn(f,($('#fa')||{}).value)){closeDrawer();render()}};
ACT.fpick=function(d){S.ui.fsel=d.id;save();closeDrawer();render();var n=$('#fscan');if(n)n.focus()};
ACT.fout=function(d){var f=S.fach.filter(function(x){return x.id===d.id})[0];if(!f)return;confirmM(fachName(f)+' auslagern'+(f.auf?' (Auftrag '+esc(f.auf)+')':'')+'?',function(){var a=f.auf||'Altbestand';S.fachlog.unshift({ts:Date.now(),u:S.user,f:f.id,a:a,k:'aus'});f.auf='';f.ts=0;f.legacy=0;logA('Ausgelagert: '+a+' aus '+fachName(f));save();closeDrawer();render();toast(fachName(f)+' ist wieder frei')},'Auslagern','no')};

/* ---------- Milkrun ---------- */
VIEW.milk=function(){var now=new Date(),t=todayIso(),mk=mkDay(t),done=0,od=mkOverdue(now),cards='';
 for(var i=0;i<10;i++){var r=mk[i],s=mkStatus(i,now),cl=r&&r.x?'x':r&&r.e?'ok':r&&r.s?'run-on'+(s.tone==='crit'?' crit':''):s.tone,acts='';if(r&&r.e)done++;
  if(!r)acts='<button class="btn sm pri" data-act="mks" data-i="'+i+'">Start</button><button class="btn sm ghost" data-act="mkx" data-i="'+i+'">Ausgefallen</button>';
  else if(r.s&&!r.e)acts='<button class="btn sm pri" data-act="mke" data-i="'+i+'">Beenden</button><button class="btn sm ghost" data-act="mkr" data-i="'+i+'">Zurück</button>';
  else acts='<button class="btn sm ghost" data-act="mkr" data-i="'+i+'">Zurücksetzen</button>';
  var info=r&&r.e?'erledigt '+fmtT(r.e)+(r.s?' · '+Math.round((r.e-r.s)/6e4)+' Min.':''):r&&r.x?'ausgefallen':r&&r.s?'<span data-since="'+r.s+'">läuft</span>':esc(s.s);
  var bar=r&&r.s&&!r.e?'<div class="bar"><i data-bar="'+r.s+'" style="width:'+Math.min(100,(Date.now()-r.s)/12e3)+'%"></i></div>':'<div class="bar"><i style="width:'+(r&&r.e?100:0)+'%;background:var(--ok)"></i></div>';
  cards+='<div class="run '+cl+'"><span class="no">Runde '+(i+1)+'</span><span class="tm">'+mkTime(i)+'</span><span class="ss">'+info+'</span>'+bar+'<div class="acts">'+acts+'</div></div>'}
 return '<div class="row r3">'+tile({k:'Runden fertig',v:done+'<small>/ 10</small>',m:[done,10],tone:done===10?'ok':''})+tile({k:'Überfällig',v:String(od),s:'mehr als 10 Minuten nach Plan oder 20 Minuten offen',tone:od?'crit':'ok'})+tile({k:'Nächste Runde',v:(function(){for(var j=0;j<10;j++)if(!mk[j])return mkTime(j);return '–'})(),s:isWork(t)?'heute':'heute keine Produktion',cu:false})+'</div>'
  +card('Takt heute','<div class="runs">'+cards+'</div><p class="dim" style="margin:16px 0 0;font-size:13px">Runden 1 bis 9 stündlich ab 06:00, Runde 10 um 14:25. Eine Runde, die länger als 20 Minuten offen ist, eskaliert. Beendete Runden zählen automatisch in die Tageszahlen.</p>',{r:isWork(t)?cp('sig','Werktag'):cp('','frei')})};
ACT.mks=function(d){mkDay(todayIso())[d.i]={s:Date.now()};logA('Milkrun Runde '+(+d.i+1)+' gestartet');save();render();toast('Runde '+(+d.i+1)+' läuft')};
ACT.mke=function(d){var r=mkDay(todayIso())[d.i];if(r){r.e=Date.now();mkSync();logA('Milkrun Runde '+(+d.i+1)+' beendet')}save();render();toast('Runde '+(+d.i+1)+' erledigt')};
ACT.mkx=function(d){mkDay(todayIso())[d.i]={x:Date.now()};mkSync();logA('Milkrun Runde '+(+d.i+1)+' ausgefallen');save();render();toast('Runde '+(+d.i+1)+' als ausgefallen eingetragen')};
ACT.mkr=function(d){delete mkDay(todayIso())[d.i];mkSync();save();render()};

/* ---------- Tageszahlen ---------- */
VIEW.tz=function(){var t=S.ui.td||todayIso(),o=tzOf(t),f=tzFn(o),ks=Object.keys(S.tz).filter(function(k){return k<=t&&Object.keys(S.tz[k]).length}).sort().slice(-12),ser=function(fn){return ks.map(function(k){return fn(tzFn(S.tz[k]))})};
 var groups=TZ.map(function(g){var sum=g.f.reduce(function(a,x){return a+(o[x[0]]||0)},0);return card(esc(g.g),g.f.map(function(x){var id='tz_'+x[0];return '<div class="tzf"><label for="'+id+'">'+esc(x[1])+'</label><div class="step"><button data-act="tzs" data-k="'+x[0]+'" data-n="-1" aria-label="weniger">−</button><input id="'+id+'" inputmode="numeric" value="'+(o[x[0]]!=null?o[x[0]]:'')+'" placeholder="–" data-in="tz" data-k="'+x[0]+'"><button data-act="tzs" data-k="'+x[0]+'" data-n="1" aria-label="mehr">+</button></div></div>'}).join(''),{r:'<span class="mono dim" style="font-size:12px">Σ '+sum+'</span>'})}).join('');
 return '<div class="card" style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:16px 20px"><div class="dsw"><button class="btn sm" data-act="tzd" data-n="-1" aria-label="Vortag">◀</button><b>'+fmtD(t,{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'})+'</b><button class="btn sm" data-act="tzd" data-n="1" aria-label="Folgetag"'+(t>=todayIso()?' disabled':'')+'>▶</button>'+(t!==todayIso()?'<button class="btn sm ghost" data-act="tzd" data-n="0">Heute</button>':'')+'</div><div style="display:flex;gap:8px;flex-wrap:wrap">'+(isWork(t)?cp('sig','Werktag'):cp('','kein Werktag'))+'<button class="btn sm" data-act="tzcp">Text kopieren</button></div></div>'
  +'<div class="row r4">'+tile({k:'Pakete',v:String(f.pakete),sp:ser(function(x){return x.pakete})})+tile({k:'Gesägt',v:String(f.gesaegt),s:'Metall und Kunststoff',sp:ser(function(x){return x.gesaegt})})+tile({k:'Vor Lack · Montage',v:f.lack+'<small>· '+f.mont+'</small>',sp:ser(function(x){return x.lack+x.mont})})+tile({k:'Störungen',v:String(f.stoer),tone:f.stoer?'warn':'ok',sp:ser(function(x){return x.stoer}),spc:'var(--warn)'})+'</div>'
  +'<div class="tzg">'+groups+'</div>'};
ACT.tzd=function(d){var t=S.ui.td||todayIso();S.ui.td=+d.n===0?todayIso():+d.n<0?prevWork(t):nextWork(t);if(S.ui.td>todayIso())S.ui.td=todayIso();save();render()};
ACT.tzs=function(d){var t=S.ui.td||todayIso(),v=Math.max(0,(tzOf(t)[d.k]||0)+ +d.n);tzSet(t,d.k,v);var el=$('#tz_'+d.k);if(el)el.value=v;tzSoft()};
ACT.tzcp=function(){var t=S.ui.td||todayIso(),o=tzOf(t),L=['Tageszahlen '+fmtD(t)];TZ.forEach(function(g){var r=g.f.filter(function(x){return o[x[0]]!=null}).map(function(x){return x[1]+': '+o[x[0]]});if(r.length)L.push(g.g+' – '+r.join(', '))});copyText(L.join('\n'),'Tageszahlen kopiert')};
var tzT;function tzSoft(){clearTimeout(tzT);tzT=setTimeout(function(){var a=document.activeElement;if(!(a&&a.dataset&&a.dataset.in==='tz'))render()},1400)}

/* ---------- Urlaub und Anwesenheit ---------- */
var VT={Urlaub:'U',Krank:'K',FZA:'F'};
VIEW.urlaub=function(){var t=todayIso(),nx=isWork(t)?t:nextWork(t),yr=+t.slice(0,4),k=konto(S.user,yr),pend=S.vacs.filter(function(v){return v.st==='beantragt'}).sort(function(a,b){return a.d0<b.d0?-1:1});
 var dd=[];for(var i=0;i<15;i++)dd.push(addDays(t,i));
 var cols='minmax(130px,170px) repeat('+dd.length+',minmax(30px,1fr))';
 var hd='<div></div>'+dd.map(function(d){var w=new Date(d+'T12:00:00');return '<div class="hd'+(isWork(d)?'':' we')+(d===t?' today':'')+'">'+w.toLocaleDateString('de-DE',{weekday:'short'}).slice(0,2)+'<br>'+w.getDate()+'</div>'}).join('');
 var rows=CREW.map(function(c){return '<div class="nm">'+esc(c.n)+'</div>'+dd.map(function(d){if(!isWork(d))return '<div class="c we"></div>';var v=S.vacs.filter(function(x){return x.emp===c.n&&vcover(x,d)&&x.st!=='abgelehnt'})[0];return '<button class="c '+(v?VT[v.type]||'U':'')+(v&&v.st==='beantragt'?' b':'')+'" data-act="vq" data-e="'+esc(c.n)+'" data-d="'+d+'" title="'+esc(c.n)+' · '+fmtD(d,{weekday:'short',day:'2-digit',month:'2-digit'})+(v?' · '+v.type+(v.st==='beantragt'?' (beantragt)':''):' · im Dienst')+'"></button>'}).join('')}).join('');
 var sum='<div class="nm dim">im Dienst</div>'+dd.map(function(d){if(!isWork(d))return '<div></div>';var p=presentOn(d).length;return '<div class="sum'+(p<MIN_STAFF?' low':'')+'">'+p+'</div>'}).join('');
 var pH=pend.length?'<table class="t"><tbody>'+pend.map(function(v){return '<tr><td>'+esc(v.emp)+'</td><td>'+cp(v.type==='Krank'?'crit':v.type==='FZA'?'warn':'info',v.type)+'</td><td class="mono">'+fmtD(v.d0,{day:'2-digit',month:'2-digit'})+' – '+fmtD(v.d1,{day:'2-digit',month:'2-digit'})+'</td><td class="n">'+wdays(v.d0,v.d1)+' T</td><td style="text-align:right;white-space:nowrap">'+(isLead()?'<button class="btn sm pri" data-act="vok" data-id="'+v.id+'">Genehmigen</button> <button class="btn sm ghost" data-act="vno" data-id="'+v.id+'">Ablehnen</button>':cp('warn','wartet'))+'</td></tr>'}).join('')+'</tbody></table>':emptyS('Keine offenen Anträge','');
 return '<div class="row r4">'+tile({k:'Heute im Dienst',v:presentOn(t).length+'<small>/ '+CREW.length+'</small>',s:isWork(t)?'Minimum '+MIN_STAFF:'heute keine Produktion',tone:isWork(t)&&presentOn(t).length<MIN_STAFF?'crit':''})+tile({k:'Nächster Werktag',v:presentOn(nextWork(t)).length+'<small>/ '+CREW.length+'</small>',s:fmtD(nextWork(t),{weekday:'long',day:'2-digit',month:'2-digit'})})+tile({k:'Offene Anträge',v:String(pend.length),tone:pend.length?'warn':'ok'})+tile({k:'Mein Resturlaub '+yr,v:String(k.rest).replace('.',','),s:k.g+' genehmigt · '+k.b+' beantragt',cu:false})+'</div>'
  +card('Anwesenheit · 15 Tage','<div class="tw"><div class="board" style="grid-template-columns:'+cols+'">'+hd+rows+sum+'</div></div><div class="legend" style="margin-top:14px"><span><i style="background:var(--info-soft);border-color:var(--info)"></i>Urlaub</span><span><i style="background:var(--warn-soft);border-color:var(--warn)"></i>FZA</span><span><i style="background:var(--crit-soft);border-color:var(--crit)"></i>Krank</span><span><i style="background:repeating-linear-gradient(45deg,transparent 0 3px,var(--info) 3px 4px)"></i>beantragt</span><span class="dim">Feld antippen, um einzutragen</span></div>',{r:'<button class="btn sm pri" data-act="vq" data-e="'+esc(S.user)+'" data-d="'+nx+'">Antrag stellen</button>'})
  +card('Anträge',pH,{r:demoTag()})};
ACT.vq=function(d){var lead=isLead(),ex=S.vacs.filter(function(x){return x.emp===d.e&&vcover(x,d.d)&&x.st!=='abgelehnt'})[0];
 if(ex)return confirmM(esc(ex.emp)+': '+ex.type+' '+fmtD(ex.d0,{day:'2-digit',month:'2-digit'})+' – '+fmtD(ex.d1,{day:'2-digit',month:'2-digit'})+' ('+ex.st+'). Eintrag löschen?',function(){S.vacs=S.vacs.filter(function(x){return x.id!==ex.id});logA('Abwesenheit gelöscht: '+ex.emp);save();render()},'Löschen','no');
 var ppl=lead?CREW.map(function(c){return '<option'+(c.n===d.e?' selected':'')+'>'+esc(c.n)+'</option>'}).join(''):'<option>'+esc(S.user)+'</option>';
 modal('<h3>Abwesenheit</h3><div class="frm" style="margin-top:16px"><label class="fl w2">Person<select class="in" id="ve">'+ppl+'</select></label><label class="fl">Art<select class="in" id="vt"><option>Urlaub</option><option>FZA</option>'+(lead?'<option>Krank</option>':'')+'</select></label><label class="fl">Von<input class="in" type="date" id="v0" value="'+d.d+'"></label><label class="fl">Bis<input class="in" type="date" id="v1" value="'+d.d+'"></label></div><p class="dim" style="font-size:13px">'+(lead?'Als Teamleitung trägst du direkt genehmigt ein.':'Der Antrag geht an die Teamleitung.')+'</p><div class="acts"><button class="btn ghost" data-act="mclose">Abbrechen</button><button class="btn pri" data-act="vadd">'+(lead?'Eintragen':'Beantragen')+'</button></div>')};
ACT.vadd=function(){var e=$('#ve').value,ty=$('#vt').value,a=$('#v0').value,b=$('#v1').value;if(!a||!b||b<a)return toast('Bitte einen gültigen Zeitraum wählen');var c=vconf(e,a,b);if(c.length&&ty!=='Krank')return toast('Überschneidet sich mit einem bestehenden Eintrag');
 var v={id:uid(),emp:e,type:ty,d0:a,d1:b,st:isLead()?'genehmigt':'beantragt',by:S.user,ts:Date.now()};S.vacs.push(v);logA(ty+' '+(v.st==='genehmigt'?'eingetragen':'beantragt')+': '+e+' '+a+' bis '+b);save();closeModal();render();toast(v.st==='genehmigt'?'Eingetragen':'Antrag gestellt')};
ACT.vok=function(d){var v=S.vacs.filter(function(x){return x.id===d.id})[0];if(!v)return;v.st='genehmigt';logA('Genehmigt: '+v.emp+' '+v.type+' '+v.d0);save();render();toast('Genehmigt')};
ACT.vno=function(d){var v=S.vacs.filter(function(x){return x.id===d.id})[0];if(!v)return;v.st='abgelehnt';logA('Abgelehnt: '+v.emp+' '+v.type+' '+v.d0);save();render();toast('Abgelehnt')};

/* ---------- Register (WEP, WE, MW, WV, TB, Vorkommissionierung, Aufträge, QS, Maschinen, Audits, Gespräche) ---------- */
function regView(k){var R=REG[k],fl=S.ui['rf'+k]||'offen',t=todayIso(),all=S.reg[k].slice().sort(function(a,b){return b.ts-a.ts}),list=all.filter(function(e){return fl==='alle'||R.done.indexOf(e.st)<0}),op=regOpen(k);
 var form=R.f.map(function(f){var id='rf_'+k+'_'+f[0];if(f[2]==='s')return '<label class="fl">'+esc(f[1])+'<select class="in" id="'+id+'">'+f[3].map(function(o){return '<option>'+esc(o)+'</option>'}).join('')+'</select></label>';if(f[2]==='d')return '<label class="fl">'+esc(f[1])+'<input class="in" type="date" id="'+id+'" value="'+t+'"></label>';return '<label class="fl'+(f[2]==='t'?' w2':'')+'">'+esc(f[1])+'<input class="in'+(f[2]==='a'?' mono':'')+'" id="'+id+'" '+(f[2]==='n'?'type="number" min="0" inputmode="numeric"':f[2]==='a'?'inputmode="numeric" maxlength="20"':'')+' data-ent="radd" data-k="'+k+'"></label>'}).join('');
 var rows=list.map(function(e){var done=R.done.indexOf(e.st)>=0,od=k==='mas'&&e.faellig&&e.faellig<t&&!done,pipe='<div class="pipe'+(done?' done':'')+'">'+R.st.map(function(s,i){return '<i class="'+(i<=e.st?'on':'')+'" title="'+esc(s)+'"></i>'}).join('')+'</div>';
  return '<tr>'+R.f.map(function(f,i){return '<td'+(f[2]==='n'?' class="n"':i===0?' style="font-weight:600"':'')+'>'+regRow(k,e,f[0])+'</td>'}).join('')+'<td><div class="stp"><button data-act="rst" data-k="'+k+'" data-id="'+e.id+'" data-n="-1" aria-label="Status zurück"'+(e.st?'':' disabled')+'>‹</button><div class="lbl">'+(od?cp('crit','überfällig'):'')+'<div style="margin-bottom:5px">'+esc(R.st[e.st])+'</div>'+pipe+'</div><button data-act="rst" data-k="'+k+'" data-id="'+e.id+'" data-n="1" aria-label="Status weiter"'+(e.st>=R.st.length-1?' disabled':'')+'>›</button></div></td><td class="mono dim" style="white-space:nowrap">'+fmtDT(e.ts)+(e.demo?' · Bsp.':'')+'</td><td style="text-align:right"><button class="btn sm ghost" data-act="rdel" data-k="'+k+'" data-id="'+e.id+'" aria-label="Löschen">✕</button></td></tr>'}).join('');
 var th=R.f.map(function(f){return '<th'+(f[2]==='n'?' class="n"':'')+'>'+esc(f[1].replace(' (7 Ziffern)',''))+'</th>'}).join('')+'<th>Status</th><th>Seit</th><th></th>';
 var byst=R.st.map(function(s,i){return [s,S.reg[k].filter(function(e){return e.st===i}).length]});
 return '<p class="lead">'+esc(R.k)+(R.hint?' · '+esc(R.hint):'')+'</p>'
  +'<div class="row r4">'+tile({k:'Offen',v:String(op),tone:op?'warn':'ok'})+tile({k:'Gesamt',v:String(all.length)})+tile({k:byst[0][0],v:String(byst[0][1]),s:'erster Schritt'})+tile({k:byst[byst.length-1][0],v:String(byst[byst.length-1][1]),tone:'ok',s:'abgeschlossen'})+'</div>'
  +card('Neuer Eintrag','<div class="frm">'+form+'<button class="btn pri" data-act="radd" data-k="'+k+'" style="height:46px">Eintragen</button></div>')
  +card('Einträge',list.length?'<div class="tw"><table class="t"><thead><tr>'+th+'</tr></thead><tbody>'+rows+'</tbody></table></div>':emptyS(all.length?'Alles erledigt':'Noch keine Einträge',all.length?'Keine offenen Einträge.':'Der erste Eintrag kommt über das Formular oben.'),{r:'<div class="seg"><button class="'+(fl==='offen'?'on':'')+'" data-act="rfl" data-k="'+k+'" data-f="offen">Offen<span class="c">'+op+'</span></button><button class="'+(fl==='alle'?'on':'')+'" data-act="rfl" data-k="'+k+'" data-f="alle">Alle<span class="c">'+all.length+'</span></button></div>'+demoTag()})}
['wep','we','mw','wv','tb','vork','auf','qs','mas','aud','gespr'].forEach(function(k){VIEW[k]=function(){return regView(k)}});
ACT.rfl=function(d){S.ui['rf'+d.k]=d.f;save();render()};
ACT.radd=function(d){var R=REG[d.k],e={id:uid(),ts:Date.now(),u:S.user,st:0};for(var i=0;i<R.f.length;i++){var f=R.f[i],el=$('#rf_'+d.k+'_'+f[0]),v=el?el.value.trim():'';if(f[2]==='a'){v=aufNr(v);if(!v)return toast('Auftragsnummer: die ersten 7 Stellen müssen Ziffern sein')}else if(f[2]==='n')v=v===''?0:Math.round(num(v));else if(i===0&&!v)return toast('Bitte „'+f[1]+'“ ausfüllen');e[f[0]]=v}
 S.reg[d.k].push(e);logA(R.t+': neuer Eintrag '+(e[R.f[0][0]]||''));save();render();toast('Eingetragen')};
ACT.rst=function(d){var e=S.reg[d.k].filter(function(x){return x.id===d.id})[0],R=REG[d.k];if(!e)return;e.st=Math.max(0,Math.min(R.st.length-1,e.st+ +d.n));logA(R.t+': '+(e[R.f[0][0]]||'')+' → '+R.st[e.st]);save();render()};
ACT.rdel=function(d){confirmM('Eintrag wirklich löschen?',function(){S.reg[d.k]=S.reg[d.k].filter(function(x){return x.id!==d.id});save();render()},'Löschen','no')};

/* ---------- Schwarzes Brett ---------- */
VIEW.brett=function(){var ps=S.brett.slice().sort(function(a,b){return (b.pin-a.pin)||b.ts-a.ts});
 return card('Neue Meldung','<label class="fl">Text<textarea class="in" id="bt" maxlength="400" placeholder="Was soll das Team wissen?"></textarea></label><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:12px;flex-wrap:wrap"><label style="display:flex;gap:8px;align-items:center;font-size:14px"><input type="checkbox" id="bp"> Anheften (läuft im Newsflash)</label><button class="btn pri" data-act="badd">Veröffentlichen</button></div>')
  +'<div style="display:flex;flex-direction:column;gap:12px">'+(ps.length?ps.map(function(p){return '<div class="post'+(p.pin?' pin':'')+'"><div class="meta">'+(p.pin?cp('sig','angeheftet'):'')+esc(p.by)+' · '+fmtDT(p.ts)+(p.demo?' · Beispiel':'')+'<span style="flex:1"></span><button class="btn sm ghost" data-act="bpin" data-id="'+p.id+'">'+(p.pin?'Lösen':'Anheften')+'</button><button class="btn sm ghost" data-act="bdel" data-id="'+p.id+'" aria-label="Löschen">✕</button></div><p>'+esc(p.t)+'</p></div>'}).join(''):emptyS('Noch keine Meldungen',''))+'</div>'};
ACT.badd=function(){var t=$('#bt').value.trim();if(!t)return toast('Bitte einen Text eingeben');S.brett.push({id:uid(),t:t,by:S.user,pin:$('#bp').checked?1:0,ts:Date.now()});logA('Meldung: '+t);save();render();toast('Veröffentlicht')};
ACT.bpin=function(d){S.brett.forEach(function(p){if(p.id===d.id)p.pin=p.pin?0:1});save();render()};
ACT.bdel=function(d){confirmM('Meldung löschen?',function(){S.brett=S.brett.filter(function(p){return p.id!==d.id});save();render()},'Löschen','no')};

/* ---------- Abteilungsfunk ---------- */
VIEW.funk=function(){var ch=S.ui.fk||DEPTS[0],ms=(S.funk[ch]||[]).slice(-60);
 return '<div class="card"><div class="funk"><div class="chs">'+DEPTS.map(function(d){var n=(S.funk[d]||[]).length;return '<button class="'+(d===ch?'on':'')+'" data-act="fk" data-c="'+esc(d)+'"><span>'+esc(d)+'</span><span class="mono dim" style="font-size:11px">'+(n||'')+'</span></button>'}).join('')+'</div>'
  +'<div style="display:flex;flex-direction:column;gap:14px;min-width:0"><div class="ch" style="margin:0"><h2>'+esc(ch)+'</h2><span class="ln"></span></div><div class="msgs" id="msgs">'+(ms.length?ms.map(function(m){return '<div class="msg'+(m.by===S.user?' me':'')+'"><small>'+esc(m.by)+' · '+fmtDT(m.ts)+'</small>'+esc(m.t)+'</div>'}).join(''):emptyS('Noch still hier','Schreib die erste Nachricht.'))+'</div>'
  +'<div style="display:flex;gap:10px"><input class="in" id="fkm" placeholder="Nachricht an '+esc(ch)+'" maxlength="500" data-ent="fks" autocomplete="off"><button class="btn pri" data-act="fks">Senden</button></div></div></div></div>'};
ACT.fk=function(d){S.ui.fk=d.c;save();render()};
ACT.fks=function(){var i=$('#fkm'),t=i&&i.value.trim();if(!t)return;var ch=S.ui.fk||DEPTS[0];S.funk[ch]=S.funk[ch]||[];S.funk[ch].push({by:S.user,t:t,ts:Date.now()});save();render();var n=$('#fkm');if(n)n.focus()};
window.afterRender=function(p){if(p==='funk'){var m=$('#msgs');if(m)m.scrollTop=1e9}};

/* ---------- Verlauf ---------- */
VIEW.verl=function(){var q=(S.ui.vq||'').toLowerCase(),L=S.log.filter(function(x){return !q||(x.t+' '+x.u).toLowerCase().indexOf(q)>=0}).slice(0,150);
 return card('Verlauf','<label class="fl" style="max-width:420px;margin-bottom:14px">Filtern<input class="in" id="vfq" value="'+esc(S.ui.vq||'')+'" data-in="vq"></label>'+(L.length?'<div class="tw"><table class="t"><thead><tr><th>Zeit</th><th>Person</th><th>Ereignis</th></tr></thead><tbody>'+L.map(function(x){return '<tr><td class="mono dim" style="white-space:nowrap">'+fmtDT(x.ts)+'</td><td style="white-space:nowrap">'+esc(x.u)+'</td><td>'+esc(x.t)+'</td></tr>'}).join('')+'</tbody></table></div>':emptyS('Nichts gefunden','')),{r:cp('',S.log.length+' Einträge')})};

/* ---------- Einstellungen ---------- */
VIEW.adm=function(){var th=S.ui.theme||'dark',srv=window.SY&&SY.on;
 var pins=srv&&isLead()?card('Zugang und PINs','<p class="lead" style="margin-bottom:14px">Jede Person meldet sich mit Name und eigener PIN an (mindestens 6 Zeichen). Eine neue PIN meldet die Person auf allen Geräten ab.</p><table class="t"><tbody>'+TEAM.map(function(m){return '<tr><td><b>'+esc(m.n)+'</b> <span class="dim">'+esc(m.role)+'</span></td><td data-pinst="'+esc(m.n)+'"><span class="dim">…</span></td><td style="text-align:right"><button class="btn sm" data-act="sypin" data-n="'+esc(m.n)+'">PIN setzen</button></td></tr>'}).join('')+'</tbody></table>'):'';
 if(pins)setTimeout(syUsers,60);
 var rest=srv&&isLead()?card('Umzug aus Flow 5','<p class="lead" style="margin-bottom:14px">In MUNSCH Flow 5 unter Einstellungen „Sicherung als Text kopieren“ wählen und den Text hier einfügen. Der Zustand der Zentrale wird dann durch die Sicherung ersetzt und an alle Geräte verteilt.</p><label class="fl">Sicherung (JSON)<textarea class="in mono" id="rsj" spellcheck="false" style="min-height:120px;font-size:12px" placeholder="{&quot;v&quot;:2,…}"></textarea></label><div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn pri" data-act="rsk">Prüfen und einspielen</button></div>'):'';
 return '<div class="row r2">'+card('Darstellung','<div style="display:flex;flex-direction:column;gap:16px"><div><div class="fl" style="margin-bottom:8px">Farbschema</div><div class="seg">'+[['system','Wie das Gerät'],['dark','Dunkel'],['light','Hell']].map(function(x){return '<button class="'+(th===x[0]?'on':'')+'" data-act="theme" data-t="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div></div><div><div class="fl" style="margin-bottom:8px">Auftakt</div><div class="seg">'+[['day','Einmal am Tag'],['always','Bei jedem Start'],['off','Aus']].map(function(x){return '<button class="'+((S.ui.intro||'day')===x[0]?'on':'')+'" data-act="intro" data-t="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div></div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-act="replay">Auftakt jetzt zeigen</button><button class="btn" data-act="keys">Tastenkürzel</button></div></div>')
  +card('Konto','<dl class="kv"><dt>Angemeldet</dt><dd><b>'+esc(S.user)+'</b> · '+esc(me().role)+'</dd><dt>Verbindung</dt><dd>'+(srv?(SY.ok?'Zentrale verbunden':'Zentrale nicht erreichbar'):'ohne Zentrale (Daten nur auf diesem Gerät)')+'</dd><dt>Version</dt><dd class="mono">'+esc(window.MF_BUILD||'')+'</dd></dl><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px">'+(srv?'<button class="btn" data-act="syout">Abmelden</button>':'<button class="btn" data-act="relog">Person wechseln</button>')+(S.demo?'<button class="btn" data-act="demox">Beispieldaten entfernen</button>':'')+'<button class="btn ghost" data-act="bk">Sicherung als Text kopieren</button></div>')+'</div>'+pins+rest};
ACT.rsk=function(){var t=($('#rsj')||{}).value||'',b;try{b=JSON.parse(t)}catch(e){return toast('Kein gültiges JSON')}if(!b||b.v!==2||!Array.isArray(b.fach)||!b.reg)return toast('Das ist keine Sicherung aus MUNSCH Flow 5');
 var n={f:b.fach.filter(function(f){return f.auf}).length,v:(b.vacs||[]).length,r:Object.keys(b.reg).reduce(function(a,k){return a+(b.reg[k]||[]).length},0),z:Object.keys(b.tz||{}).length};
 confirmM('Sicherung einspielen? Enthalten: '+n.f+' belegte Fächer, '+n.v+' Abwesenheiten, '+n.r+' Registereinträge, '+n.z+' Tage Tageszahlen. Der aktuelle Stand der Zentrale wird ersetzt.',function(){var ui=S.ui,u=S.user,ns=newState();S=Object.assign(ns,b);S.reg=Object.assign(ns.reg,b.reg);S.ui=ui;S.user=u;logA('Sicherung aus Flow 5 eingespielt');syPush();render();toast('Sicherung wird an die Zentrale gesendet')},'Einspielen')};
ACT.theme=function(d){S.ui.theme=d.t;save();applyTheme();render()};
ACT.intro=function(d){S.ui.intro=d.t;save();render()};
ACT.replay=function(){intro(function(){})};
ACT.relog=function(){ls('mflow.name',null);location.reload()};
ACT.demox=function(){confirmM('Alle Beispieldaten (Urlaub, Register, Meldungen) entfernen?',function(){clearDemo();S.demo=0;save();render();toast('Beispieldaten entfernt')},'Entfernen','no')};
ACT.bk=function(){copyText(JSON.stringify(S),'Sicherung kopiert')};
ACT.syout=function(){syApi('/api/logout',{}).then(function(){ls('mflow.tok',null);location.reload()})};
ACT.sypin=function(d){if(!isLead())return toast('Nur Teamleitung');modal('<h3>PIN für '+esc(d.n)+'</h3><label class="fl" style="margin-top:16px">Neue PIN (mindestens 6 Zeichen)<input class="in" id="npin" type="password" autocomplete="new-password" data-ent="sypin2" data-n="'+esc(d.n)+'"></label><div class="acts"><button class="btn ghost" data-act="mclose">Abbrechen</button><button class="btn pri" data-act="sypin2" data-n="'+esc(d.n)+'">Speichern</button></div>')};
ACT.sypin2=function(d){var p=$('#npin').value;if(p.length<6)return toast('Mindestens 6 Zeichen');syApi('/api/pin',{name:d.n,pin:p}).then(function(r){closeModal();toast(r.ok?'PIN für '+d.n+' gesetzt':(r.error||'Fehler'));syUsers()})};
window.syUsers=function(){if(!window.syApi)return;syApi('/api/users').then(function(r){if(!r.set)return;$$('[data-pinst]').forEach(function(e){var on=r.set.indexOf(e.getAttribute('data-pinst'))>=0;e.innerHTML=on?cp('ok','PIN gesetzt'):cp('','noch keine PIN')})})};
function applyTheme(){var t=(S&&S.ui&&S.ui.theme)||'dark';if(t==='dark'||t==='light')root.setAttribute('data-theme',t);else root.removeAttribute('data-theme');var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',getComputedStyle(root).getPropertyValue('--ground').trim()||'#0A0B0D')}

/* ---------- Seiten, die in Etappe 2 neu gebaut werden ---------- */
Object.keys(LATER).forEach(function(k){VIEW[k]=function(){return '<section class="hero"><div class="hl"><h2 class="gr">'+esc(LATER[k])+'<br><em>folgt</em></h2></div><p class="lead" style="margin-top:18px">Dieser Bereich wird in der nächsten Etappe im neuen Design gebaut. Die Daten bleiben vollständig erhalten und laufen weiter über die Zentrale. Bis dahin ist der Bereich in MUNSCH Flow 5 erreichbar.</p><div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap"><button class="btn pri" data-act="go" data-go="lage">Zum Lagebild</button><button class="btn" data-act="pal">Suchen</button></div></section>'}});

/* =====================================================================
   WERKSTATTMONITOR
   ===================================================================== */
var MON=null;
function monSlides(){var now=new Date(),t=todayIso(),si=shiftInfo(now),fs=fachStat(),mk=mkDay(t),done=Object.keys(mk).filter(function(k){return mk[k].e}).length,al=alerts(now),nr=-1;for(var j=0;j<10;j++)if(!mk[j]){nr=j;break}
 var l=tzLatest(isWork(t)?addDays(t,-1):t),f=l?tzFn(S.tz[l]):null,pins=S.brett.filter(function(p){return p.pin});
 var sl=[
  ['Schicht','<div class="hv">'+(si.state==='lauf'?hhmm(Math.max(0,900-minsNow()))+'<small> bis Feierabend</small>':esc(si.txt.split(' · ')[0]))+'</div><div class="hs">'+esc(si.txt)+' · Besetzung '+presentOn(isWork(t)?t:nextWork(t)).length+' von '+CREW.length+'</div>'],
  ['Milkrun','<div class="hv">'+done+'<small> / 10 Runden</small></div><div class="hs">'+(nr>=0?'Nächste Runde '+(nr+1)+' um '+mkTime(nr)+' · '+esc(mkStatus(nr,now).s):'Alle Runden durch')+'</div>'],
  ['Lager','<div class="hv">'+Math.round(pct(fs.o,fs.n))+'<small> % belegt</small></div><div class="hs">'+fs.o+' von '+fs.n+' Fächern · '+fs.fr+' frei · '+fs.l+' Langlieger</div>'],
  ['Lage','<div class="gridm"><div><span>Warnungen</span><b style="color:'+(al.length?'var(--warn)':'var(--ok)')+'">'+al.length+'</b></div><div><span>Störungen offen</span><b>'+regOpen('qs')+'</b></div><div><span>Pakete '+(l?fmtD(l,{weekday:'short'}):'')+'</span><b>'+(f?f.pakete:'–')+'</b></div><div><span>Gesägt</span><b>'+(f?f.gesaegt:'–')+'</b></div></div><div class="hs">'+(al.length?esc(al.slice(0,2).map(function(a){return a.t}).join(' · ')):'Alles ruhig.')+'</div>']];
 if(pins.length)sl.push(['Meldung','<div class="hv" style="font-size:clamp(48px,6vw,96px);line-height:1;text-transform:none">'+esc(pins[0].t)+'</div><div class="hs">'+esc(pins[0].by)+' · '+fmtDT(pins[0].ts)+'</div>']);
 return sl}
window.openMon=function(){if($('#mon'))return;var m=document.createElement('div');m.id='mon';document.body.appendChild(m);MON={i:-1,t:0};monDraw();monNext();
 try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(function(w){MON.wl=w}).catch(function(){})}catch(e){}
 try{if(m.requestFullscreen&&FINE)m.requestFullscreen().catch(function(){})}catch(e){}};
function monDraw(){var m=$('#mon');if(!m)return;var sl=monSlides();MON.n=sl.length;
 m.innerHTML='<div class="mh"><span>'+logoCore(46)+'</span><div class="t"><i></i>Heute live<span class="dim mono" style="font-size:13px;letter-spacing:.2em">WERKSTATTMONITOR</span></div><div class="clk" id="mck">'+new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})+'</div><button class="btn" data-act="monx">Beenden</button></div><div class="sc">'+sl.map(function(s,i){return '<div class="sl" data-i="'+i+'"><div class="kk">'+esc(s[0])+'</div>'+s[1]+'</div>'}).join('')+'</div><div class="mf">'+sl.map(function(s,i){return '<i data-i="'+i+'"><b></b></i>'}).join('')+'</div>'}
function monNext(){if(!$('#mon'))return;clearTimeout(MON.t);MON.i=(MON.i+1)%MON.n;if(MON.i===0)monDraw();var D=12000;
 $$('#mon .sl').forEach(function(s){s.classList.toggle('on',+s.dataset.i===MON.i)});$$('#mon .mf i').forEach(function(b){var i=+b.dataset.i;b.className=i<MON.i?'done':i===MON.i?'on':'';b.style.setProperty('--d',D+'ms')});
 MON.t=setTimeout(monNext,D)}
ACT.monx=function(){var m=$('#mon');if(!m)return;clearTimeout(MON.t);try{if(MON.wl)MON.wl.release()}catch(e){}try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}m.remove();MON=null};

/* =====================================================================
   SUCHE (Strg K) mit Perplexity
   ===================================================================== */
var PAL={i:0,it:[]};
function palItems(q){var out=[],s=q.toLowerCase().trim(),add=function(k,t,sub,run){out.push({k:k,t:t,s:sub||'',run:run})};
 var pages=[];GROUPS.forEach(function(g){g.p.forEach(function(p){if(pageOk(p[0]))pages.push([p[0],p[1],g.t])})});
 var acts=[['Einlagern','Fachverwaltung',function(){go('fach');setTimeout(function(){var n=$('#fscan');if(n)n.focus()},400)}],['Nächste Milkrun-Runde starten','Milkrun',function(){var mk=mkDay(todayIso());for(var j=0;j<10;j++)if(!mk[j]){ACT.mks({i:j});return}toast('Alle Runden sind erfasst')}],['Störung melden','QS und Störmeldungen',function(){go('qs')}],['Tageszahlen eintragen','Tageszahlen',function(){S.ui.td=todayIso();go('tz')}],['Werkstattmonitor starten','Ansicht',openMon],['Farbschema wechseln','Darstellung',function(){var o=['dark','light','system'];S.ui.theme=o[(o.indexOf(S.ui.theme||'dark')+1)%3];save();applyTheme();render();toast('Farbschema: '+{system:'wie das Gerät',dark:'dunkel',light:'hell'}[S.ui.theme])}],['Tastenkürzel anzeigen','Hilfe',function(){ACT.keys()}]];
 if(!s){(S.ui.rec||[]).slice(0,4).forEach(function(p){if(PAGE[p])add('Zuletzt',PAGE[p].t,'',function(){go(p)})});acts.slice(0,5).forEach(function(a){add('Aktion',a[0],a[1],a[2])});return out}
 var m=s.match(/\d{7}/);if(m){var a=m[0],hits=S.fach.filter(function(f){return f.auf===a});hits.forEach(function(f){add('Auftrag',a+' liegt in '+fachName(f),days(f.ts)+' Tage',function(){go('fach');setTimeout(function(){ACT.fo({id:f.id})},350)})});Object.keys(REG).forEach(function(k){S.reg[k].forEach(function(e){if(String(e.ref||'').indexOf(a)>=0)add(REG[k].t,a+' · '+REG[k].st[e.st],fmtDT(e.ts),function(){go(k)})})});if(!hits.length)add('Auftrag',a+' liegt in keinem Fach','einlagern?',function(){go('fach');setTimeout(function(){var n=$('#fscan');if(n){n.value=a;n.focus()}},400)})}
 var fm=s.match(/^(s|p)\s*0*(\d{1,3})$/);if(fm){var id=fm[1].toUpperCase()+(+fm[2]),f=S.fach.filter(function(x){return x.id===id})[0];if(f)add('Fach',fachName(f)+' · '+(f.auf||(f.legacy?'Altbestand':'frei')),'',function(){go('fach');setTimeout(function(){ACT.fo({id:f.id})},350)})}
 pages.forEach(function(p){if((p[1]+' '+p[2]).toLowerCase().indexOf(s)>=0)add('Seite',p[1],p[2],function(){go(p[0])})});
 acts.forEach(function(a){if((a[0]+' '+a[1]).toLowerCase().indexOf(s)>=0)add('Aktion',a[0],a[1],a[2])});
 TEAM.forEach(function(p){if(!p.station&&p.n.toLowerCase().indexOf(s)>=0)add('Person',p.n,p.role,function(){go('urlaub')})});
 out=out.slice(0,12);var raw=(($('#palq')||{}).value||'').trim();if(window.SY&&SY.on&&SY.tok&&PX.on!==0&&raw.length>=4)add('Perplexity','Fragen: „'+raw.slice(0,60)+'“','KI-Antwort mit Websuche',function(){pxAsk(raw)});
 return out}
function palDraw(){var l=$('#pall');if(!l)return;l.innerHTML=PAL.it.map(function(x,i){return '<button class="pi'+(i===PAL.i?' on':'')+'" data-act="palgo" data-i="'+i+'"><span class="pk">'+esc(x.k)+'</span><span class="pt">'+esc(x.t)+'</span><span class="ps">'+esc(x.s)+'</span></button>'}).join('')||'<div class="empty"><b>Kein Treffer</b><span>Versuch eine Auftragsnummer, ein Fach wie S012 oder einen Seitennamen.</span></div>';var on=l.querySelector('.on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest'})}
function openPal(){if($('#pal'))return closePal();var o=document.createElement('div');o.id='pal';o.innerHTML='<div class="pb" role="dialog" aria-label="Suche"><div class="pq">'+ic('search')+'<input id="palq" autocomplete="off" placeholder="Seite, Auftrag, Fach, Person, Aktion oder Frage"><kbd>Esc</kbd></div><div class="pl" id="pall"></div><div class="pf"><span><kbd>↑</kbd> <kbd>↓</kbd> wählen</span><span><kbd>Enter</kbd> öffnen</span><span><kbd>?</kbd> Tastenkürzel</span></div></div>';
 o.addEventListener('pointerdown',function(e){if(e.target===o)closePal()});document.body.appendChild(o);var q=$('#palq');PAL.i=0;PAL.it=palItems('');palDraw();q.focus();
 q.addEventListener('input',function(){PAL.i=0;PAL.it=palItems(q.value);palDraw()});
 q.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){e.preventDefault();PAL.i=Math.min(PAL.it.length-1,PAL.i+1);palDraw()}else if(e.key==='ArrowUp'){e.preventDefault();PAL.i=Math.max(0,PAL.i-1);palDraw()}else if(e.key==='Enter'){e.preventDefault();palRun(PAL.i)}else if(e.key==='Escape'){e.stopPropagation();closePal()}})}
function closePal(){var o=$('#pal');if(o)o.remove()}
function palRun(i){var x=PAL.it[i];closePal();if(x)x.run()}
ACT.pal=function(){openPal()};ACT.palgo=function(d){palRun(+d.i)};
ACT.bell=function(){var al=alerts(new Date());modal('<h3>Warnlage</h3>'+(al.length?'<div class="al" style="margin-top:16px">'+al.map(function(a){return '<button class="'+a.tone+'" data-act="bgo" data-go="'+a.go+'"><i></i><span>'+esc(a.t)+'</span>'+ic('arrow')+'</button>'}).join('')+'</div>':'<div class="calm" style="margin-top:16px"><b>Alles ruhig</b></div>')+'<div class="acts"><button class="btn ghost" data-act="mclose">Schließen</button></div>')};
ACT.bgo=function(d){closeModal();go(d.go)};

/* Perplexity über den Worker (/api/ask). Personennamen und Abwesenheiten werden vor dem Senden entfernt. */
var PX={on:null,t:[],busy:0};
function pxCtx(){var now=new Date(),t=todayIso(),fs=fachStat(),mk=mkDay(t),L=[];L.push('Jetzt: '+now.toLocaleString('de-DE')+'. '+shiftInfo(now).txt+'.');L.push('Fächer: '+fs.o+' von '+fs.n+' belegt, '+fs.fr+' frei, '+fs.l+' Langlieger, '+fs.a+' Altbestand.');L.push('Milkrun heute: '+Object.keys(mk).filter(function(k){return mk[k].e}).length+' von 10 beendet.');
 var al=alerts(now).map(function(a){return a.t}).filter(function(x){return !/Krank|Besetzung/.test(x)});L.push('Warnlage: '+(al.join('; ')||'ruhig')+'.');var d=tzLatest(t);if(d){var f=tzFn(S.tz[d]);L.push('Letzte Tageszahlen ('+d+'): '+f.pakete+' Pakete, '+f.gesaegt+' gesägt, '+f.lack+' vor Lack, '+f.mont+' vor Montage, '+f.stoer+' Störungen.')}
 var c=L.join('\n');TEAM.forEach(function(m){if(m.n)c=c.split(m.n).join('Mitarbeiter')});return c}
function pxSys(){return 'Du bist der Assistent im Leitstand „MUNSCH Flow“ der Logistik bei Munsch Chemiepumpen (Ransbach-Baumbach). Antworte auf Deutsch, per Du, knapp und sachlich in wenigen Sätzen, ohne Überschriften. Betriebsdaten NUR aus der Lage unten, nichts erfinden. Du kannst in der App nichts ändern; für Änderungen nennst du die passende Seite. Allgemeine Fach-, Norm-, Gefahrgut- oder Technikfragen beantwortest du mit Websuche.\n\nLAGE\n'+pxCtx()}
function pxShow(){var b=$('#pxb');if(!b)return;b.innerHTML=PX.t.map(function(m){return m.role==='user'?'<div class="pxq">'+esc(m.content)+'</div>':'<div class="pxa">'+esc(m.content.replace(/\s*\[\d+\]/g,'')).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>')+(m.src&&m.src.length?'<div class="pxs">'+m.src.slice(0,4).map(function(u,i){return '<a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+(i+1)+' '+esc(String(u).replace(/^https?:\/\/(www\.)?/,'').split('/')[0])+'</a>'}).join('')+'</div>':'')+'</div>'}).join('')+(PX.busy?'<div class="pxa dim">Perplexity sucht …</div>':'');b.scrollTop=1e9}
function pxAsk(q){if(!$('#pxb'))modal('<h3>Perplexity</h3><p class="dim" style="margin:4px 0 0;font-size:13px">Antworten ohne Personendaten. Bitte prüfen, bevor du danach handelst.</p><div class="pxb" id="pxb"></div><div style="display:flex;gap:10px"><input class="in" id="pxq" autocomplete="off" placeholder="Nachfrage …" maxlength="800" data-ent="pxgo"><button class="btn pri" data-act="pxgo">Fragen</button></div>');
 if(PX.busy)return;q=String(q||'').trim().slice(0,800);if(!q)return;PX.t.push({role:'user',content:q});PX.busy=1;pxShow();
 fetch('/api/ask',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+SY.tok},body:JSON.stringify({messages:[{role:'system',content:pxSys()}].concat(PX.t.slice(-8).map(function(m){return {role:m.role,content:m.content}}))})})
 .then(function(r){if(r.status===401){syExpired();throw 'Sitzung abgelaufen'}if(r.status===404||r.status===501){PX.on=0;throw 'Perplexity ist im Worker noch nicht eingerichtet.'}return r.json().catch(function(){return {}}).then(function(j){if(!r.ok||!j.text)throw (j.error||'Keine Antwort');return j})})
 .then(function(j){PX.on=1;PX.t.push({role:'assistant',content:j.text,src:j.src||[]})})
 .catch(function(e){PX.t.pop();toast(typeof e==='string'?e:'Perplexity nicht erreichbar')})
 .then(function(){PX.busy=0;pxShow();var i=$('#pxq');if(i)try{i.focus()}catch(e){}})}
ACT.pxgo=function(){var i=$('#pxq');if(!i)return;var v=i.value;i.value='';pxAsk(v)};

/* =====================================================================
   AUFTAKT, ANMELDUNG, BEGRÜSSUNG
   ===================================================================== */
function intro(done){if(RM){done();return}var d=new Date(),el=document.createElement('div');el.id='intro';
 el.innerHTML='<div class="lb t"></div><div class="lb b"></div><div class="flare"></div><div class="core"><div class="ring">'+introMark()+'</div><div class="word">'+introWord()+'</div><div class="line"></div><div class="cap">Flow · Logistik-Leitstand<br><br><b>'+esc(d.toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}))+'</b></div></div><div class="skip">Tippen zum Überspringen</div>';
 document.body.appendChild(el);var fin=false,end=function(){if(fin)return;fin=true;el.classList.add('out');setTimeout(function(){el.remove()},1300);done()};
 el.addEventListener('pointerdown',end);document.addEventListener('keydown',function k(){document.removeEventListener('keydown',k);end()});setTimeout(end,3600)}
function introWord(){var d=function(a){return 'M'+a.map(function(p){return p[0]+','+p[1]}).join('L')+'Z'},o='';PARTS.forEach(function(p){if(p.g==='l')p.s.forEach(function(s){o+='<path d="'+d(s)+'" fill="'+(p.k==='o'?'#FF761B':'#F4F0EA')+'"/>'})});return '<svg viewBox="156 36 536 64" role="img" aria-label="MUNSCH">'+o+'</svg>'}
function introMark(){var d=function(a){return 'M'+a.map(function(p){return p[0]+','+p[1]}).join('L')+'Z'},t='',w='';PARTS.forEach(function(p){var x='<path d="'+d(p.s[0])+'" fill="'+(p.k==='o'?'#FF761B':'#F4F0EA')+'"/>';if(p.g==='t')t+=x;else if(p.g==='w')w+=x});
 return '<svg viewBox="0 0 131 131" role="img" aria-label="MUNSCH"><circle cx="65.3" cy="65.3" r="62.3" fill="none" stroke="#FF761B" stroke-width="3" stroke-dasharray="392" stroke-dashoffset="392"><animate attributeName="stroke-dashoffset" from="392" to="0" dur="1.6s" begin=".2s" fill="freeze" calcMode="spline" keySplines=".2 .8 .2 1"/></circle>'+t+'<g class="imp">'+w+'</g></svg>'}
function shouldIntro(){var m=S.ui.intro||'day';if(m==='off')return false;if(m==='always')return true;return ls('mf6.intro')!==todayIso()}
var LOG={cur:null,pin:'',busy:0};
function showLogin(){var last=ls('mflow.name'),ppl=TEAM.slice().sort(function(a,b){return (b.n===last)-(a.n===last)}),h=new Date().getHours();
 var el=document.createElement('div');el.id='login';el.innerHTML='<div class="in2"><div><div class="eb">MUNSCH Flow · Anmeldung</div><h1>'+(h<11?'Guten Morgen':h<17?'Guten Tag':'Guten Abend')+'.<br><span style="color:var(--signal)">Wer bist du?</span></h1></div><div class="ppl" id="ppl">'+ppl.map(function(m,i){return '<button class="pc'+(m.n===last?' last':'')+'" style="--n:'+i+'" data-act="lsel" data-u="'+esc(m.n)+'"><span class="av">'+esc(initials(m.n))+'</span><span><b>'+esc(m.n)+'</b><small>'+esc(m.role)+'</small></span></button>'}).join('')+'</div><div id="lpin"></div></div>';
 document.body.appendChild(el)}
ACT.lsel=function(d){var el=$('#login');if(LOG.cur===d.u){return lback()}LOG.cur=d.u;LOG.pin='';$$('.pc',el).forEach(function(p){p.classList.toggle('cur',p.dataset.u===d.u)});el.classList.add('sel');
 var srv=window.SY&&SY.on;$('#lpin').innerHTML=srv?'<div class="pin"><div class="fl">PIN für '+esc(d.u)+' · mindestens 6 Zeichen</div><div class="dots" id="ldots"></div><input id="lpi" class="in mono" type="password" inputmode="numeric" autocomplete="current-password" style="position:absolute;opacity:0;pointer-events:none;width:1px" aria-label="PIN"><div class="pad">'+['1','2','3','4','5','6','7','8','9','⌫','0','✓'].map(function(k){return '<button data-act="lk" data-k="'+k+'"'+(k==='✓'?' style="background:linear-gradient(180deg,var(--signal2),var(--signal));color:var(--signal-ink)"':'')+'>'+k+'</button>'}).join('')+'</div><button class="btn ghost" data-act="lback">Andere Person</button></div>'
  :'<div class="pin"><p class="lead">Ohne Zentrale: Daten bleiben auf diesem Gerät, Anmeldung ohne PIN.</p><div style="display:flex;gap:10px"><button class="btn pri xl" data-act="lgo">Als '+esc(firstName(d.u))+' starten</button><button class="btn ghost xl" data-act="lback">Zurück</button></div></div>';
 ldots();var i=$('#lpi');if(i){i.addEventListener('input',function(){LOG.pin=i.value.slice(0,16);ldots()});i.addEventListener('keydown',function(e){if(e.key==='Enter')lcheck()});setTimeout(function(){i.focus()},120)}}
function lback(){LOG.cur=null;LOG.pin='';var el=$('#login');el.classList.remove('sel');$$('.pc',el).forEach(function(p){p.classList.remove('cur')});$('#lpin').innerHTML=''}
ACT.lback=lback;
function ldots(){var e=$('#ldots');if(!e)return;var n=Math.max(6,LOG.pin.length),h='';for(var i=0;i<n;i++)h+='<i class="'+(i<LOG.pin.length?'on':'')+'"></i>';e.innerHTML=h;e.classList.remove('bad')}
ACT.lk=function(d){if(LOG.busy)return;var i=$('#lpi');if(d.k==='⌫')LOG.pin=LOG.pin.slice(0,-1);else if(d.k==='✓')return lcheck();else if(LOG.pin.length<16)LOG.pin+=d.k;if(i)i.value=LOG.pin;ldots()};
function lfail(t){var p=$('.pin');LOG.pin='';ldots();var e=$('#ldots');if(e)e.classList.add('bad');if(p){p.classList.remove('shake');void p.offsetWidth;p.classList.add('shake')}toast(t);var i=$('#lpi');if(i){i.value='';i.focus()}LOG.busy=0}
function lcheck(){if(LOG.busy)return;if(LOG.pin.length<6)return lfail('Mindestens 6 Zeichen');LOG.busy=1;S.user=LOG.cur;
 syApi('/api/login',{name:LOG.cur,pin:LOG.pin}).then(function(r){if(!r.token)return lfail(r.error||'PIN stimmt nicht');SY.tok=r.token;SY.name=LOG.cur;ls('mflow.tok',r.token);ls('mflow.name',LOG.cur);syStart(r,function(){enter(true)})}).catch(function(){lfail('Zentrale nicht erreichbar')})}
ACT.lgo=function(){S.user=LOG.cur;ls('mflow.name',LOG.cur);save();enter(true)};
function enter(greet){var lg=$('#login');var start=function(){buildShell();applyTheme();lastPg=null;go(S.ui.page&&PAGE[S.ui.page]&&pageOk(S.ui.page)?S.ui.page:'lage')};
 if(!greet||RM){if(lg)lg.remove();start();return}
 var w=document.createElement('div');w.className='welcome';var h=new Date().getHours();w.innerHTML='<h2><span><i>'+(h<11?'Guten Morgen':h<17?'Guten Tag':'Guten Abend')+'</i></span><span><i>'+esc(firstName(S.user))+'</i></span></h2>';document.body.appendChild(w);
 setTimeout(function(){if(lg)lg.remove();start();w.classList.add('out');setTimeout(function(){w.remove()},800)},1300)}

/* =====================================================================
   INTERAKTION: Aktionen, Eingaben, Tastenkürzel, Licht, Welle
   ===================================================================== */
document.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-act]');if(!el)return;var f=ACT[el.getAttribute('data-act')];if(f){e.preventDefault();f(el.dataset,el,e)}});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){var el=e.target.closest&&e.target.closest('[data-ent]');if(el&&el.tagName!=='TEXTAREA'){e.preventDefault();var f=ACT[el.getAttribute('data-ent')];if(f)f(el.dataset,el,e)}}});
document.addEventListener('input',function(e){var el=e.target,k=el.dataset&&el.dataset.in;if(!k)return;
 if(k==='fq'){S.ui.fq=el.value;var r=$('#fqr');if(r)r.innerHTML=fqRes();var q=el.value.trim().toLowerCase();$$('#stage .cell').forEach(function(c){var f=S.fach.filter(function(x){return x.id===c.dataset.id})[0];c.classList.toggle('hit',!!(q.length>=2&&f&&((f.auf||'').indexOf(q)>=0||fachName(f).toLowerCase().indexOf(q)>=0)))})}
 else if(k==='tz'){var t=S.ui.td||todayIso(),v=el.value.replace(/\D/g,'');if(v!==el.value)el.value=v;tzSet(t,el.dataset.k,v);tzSoft()}
 else if(k==='vq'){S.ui.vq=el.value;clearTimeout(window._vq);window._vq=setTimeout(render,250)}});
document.addEventListener('focusout',function(e){if(e.target&&e.target.dataset&&e.target.dataset.in==='tz')tzSoft()});

var GO=[['l','lage','Lagebild'],['f','fach','Fachverwaltung'],['m','milk','Milkrun'],['t','tz','Tageszahlen'],['q','qs','QS und Störmeldungen'],['u','urlaub','Urlaub und Anwesenheit'],['b','brett','Schwarzes Brett'],['k','funk','Abteilungsfunk'],['v','verl','Verlauf'],['e','adm','Einstellungen'],['w','mon','Werkstattmonitor']],gT=0,gEl=null;
function gOff(){gT=0;if(gEl){gEl.remove();gEl=null}}
ACT.keys=function(){modal('<h3>Tastenkürzel</h3><div class="keys"><span><kbd>Strg</kbd><kbd>K</kbd></span><span>Suche und Perplexity</span><span><kbd>/</kbd></span><span>Suche öffnen</span>'+GO.map(function(g){return '<span><kbd>G</kbd><kbd>'+g[0].toUpperCase()+'</kbd></span><span>'+g[2]+'</span>'}).join('')+'<span><kbd>Esc</kbd></span><span>Schließen</span><span><kbd>?</kbd></span><span>Diese Übersicht</span></div><div class="acts"><button class="btn ghost" data-act="mclose">Schließen</button></div>')};
document.addEventListener('keydown',function(e){
 if(e.key==='Escape'){if($('#pal'))return closePal();if($('#modal'))return closeModal();if($('#drawer'))return closeDrawer();if($('#flyout.on'))return flyClose();if($('#mon'))return ACT.monx()}
 if(!$('#stage')||$('#login')||$('#intro'))return;
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();return openPal()}
 if(e.ctrlKey||e.metaKey||e.altKey)return;var a=document.activeElement,tg=(a&&a.tagName)||'';if(/INPUT|TEXTAREA|SELECT/.test(tg))return;if($('#mon')||$('#pal')||$('#modal'))return;
 if(e.key==='/'){e.preventDefault();return openPal()}
 if(e.key==='?'){e.preventDefault();gOff();return ACT.keys()}
 var k=e.key.toLowerCase();if(gT&&Date.now()-gT<1400){var g=GO.filter(function(x){return x[0]===k})[0];gOff();if(g){e.preventDefault();go(g[1])}return}
 if(k==='g'){gT=Date.now();gEl=document.createElement('div');gEl.className='gh';gEl.innerHTML='<b>G</b> und dann: L Lage · F Fächer · M Milkrun · T Zahlen · <b>?</b> alle';document.body.appendChild(gEl);setTimeout(function(){if(gT&&Date.now()-gT>=1350)gOff()},1450)}});

if(FINE&&!RM){var SP='.tile,.card,.run,.post',cur=null,raf=0,lx=0,ly=0;
 document.addEventListener('pointermove',function(e){lx=e.clientX;ly=e.clientY;if(raf)return;raf=requestAnimationFrame(function(){raf=0;var t=document.elementFromPoint(lx,ly),el=t&&t.closest&&t.closest(SP);if(el&&!el.closest('#stage'))el=null;
  if(el&&el.classList.contains('card')){var inner=t.closest('.tile,.run,.post');if(inner&&el.contains(inner))el=inner}
  if(el!==cur){if(cur)cur.classList.remove('hov');cur=el;if(el){if(!el.querySelector(':scope > .spot')){var s=document.createElement('i');s.className='spot';s.setAttribute('aria-hidden','true');el.appendChild(s)}el.classList.add('hov')}}
  if(cur){var r=cur.getBoundingClientRect();cur.style.setProperty('--mx',(lx-r.left)+'px');cur.style.setProperty('--my',(ly-r.top)+'px')}})},{passive:true})}
if(!RM)document.addEventListener('pointerdown',function(e){var b=e.target.closest&&e.target.closest('.btn');if(!b)return;var r=b.getBoundingClientRect(),s=document.createElement('span');s.className='rp';s.style.left=(e.clientX-r.left)+'px';s.style.top=(e.clientY-r.top)+'px';b.appendChild(s);setTimeout(function(){s.remove()},650)},{passive:true});

/* Takt: Uhr jede Sekunde, laufende Milkrun-Zeiten, Lagebild jede Minute */
var lastMin=-1;
setInterval(function(){clock();var mc=$('#mck');if(mc)mc.textContent=new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
 $$('[data-since]').forEach(function(e){var s=Math.floor((Date.now()- +e.dataset.since)/1e3);e.textContent='läuft · '+Math.floor(s/60)+':'+('0'+(s%60)).slice(-2)+' Min.'});
 $$('[data-bar]').forEach(function(e){e.style.width=Math.min(100,(Date.now()- +e.dataset.bar)/12e3)+'%'});
 var m=new Date().getMinutes();if(m!==lastMin&&lastMin!==-1&&$('#stage')){var a=document.activeElement,typing=a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName);if(!typing&&!$('#modal')&&!$('#drawer')&&['lage','milk'].indexOf(S.ui.page)>=0)render();else if($('#stage'))shellUpdate()}lastMin=m},1000);

/* =====================================================================
   START
   ===================================================================== */
function boot(){
 if(window.MF_SERVER){S=newState();try{var u=JSON.parse(ls(KEY)||'null');if(u&&u.ui)S.ui=Object.assign(S.ui,u.ui)}catch(e){}}
 else{loadState();if(!S.qdemo&&!S.demo&&!S.vacs.some(function(v){return v.demo})){seedDemo(S);S.demo=1;save()}}
 applyTheme();
 var next=function(){if(window.MF_SERVER&&window.syResume){if(!syTok())return showLogin();syResume(function(ok){if(!ok)return showLogin();syStart(null,function(){enter(false)})})}
  else{var nm=ls('mflow.name');if(nm&&TEAM.some(function(t){return t.n===nm})){S.user=nm;enter(false)}else showLogin()}};
 if(shouldIntro()){ls('mf6.intro',todayIso());intro(next)}else next()}
window.addEventListener('hashchange',function(){var h=location.hash.slice(1);if(h&&PAGE[h]&&h!==S.ui.page&&$('#stage'))go(h)});
(function(){var h=location.hash.slice(1);if(h&&(PAGE[h]||h==='mon'))window.__hash=h})();
var _boot=boot;boot=function(){_boot();if(window.__hash){var h=window.__hash;window.__hash=null;var w=setInterval(function(){if($('#stage')){clearInterval(w);go(h)}},200);setTimeout(function(){clearInterval(w)},15000)}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
