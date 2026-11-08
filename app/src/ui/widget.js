/* ===== Zahlen-Widgets =====
   Tageszahlen einer Abteilung direkt dort erfassen, wo gearbeitet wird.
   1 Eigenes Fenster: Adresse /w/<id> (z. B. /w/saege) öffnet nach der Anmeldung nur das Widget.
     Jede Adresse hat ein eigenes App-Manifest, lässt sich in Edge als App installieren und mit Windows starten.
     Schmales hohes Fenster: Abteilungen als Spalten; breites flaches Fenster: als Zeilen.
     Ohne Zentrale (Datei) zum Ausprobieren über #w-saege.
   2 Zahlen-Leiste in der App: unten auf jeder Seite die eigene Abteilung, deckend oder durchsichtig (Einstellung je Gerät).
   Geschrieben wird in die Tageszahlen von heute (tzSet), „Rückstand heute“ mit dem Vortag darunter.
   Gestaltung in widget.css. */
(function(){
'use strict';
var M=window.MF,ls=M.ls,root=document.documentElement;
var WD={
 we:{n:'Wareneingang',g:'Wareneingang',img:'lager',hl:['we_pak'],hlL:'Pakete gebucht',key:['we_pak','we_gbpal','we_rueck']},
 ms:{n:'Säge Metall',g:'Säge Metall',img:'prod',hl:['ms_ist'],plan:'ms_plan',rueck:'ms_rueck',hlL:'gesägt vom Tagesziel',key:['ms_ist','ms_plan','ms_schn','ms_rueck']},
 ks:{n:'Säge Kunststoff',g:'Säge Kunststoff',img:'prod',hl:['ks_ist'],plan:'ks_plan',rueck:'ks_rueck',hlL:'gesägt vom Tagesziel',key:['ks_ist','ks_plan','ks_schn','ks_rueck']},
 saege:{n:'Beide Sägen',parts:['ms','ks']},
 gp:{n:'Grundplatten',g:'Grundplatten',img:'prod',hl:['gp_gebohrt'],hlL:'heute gebohrt',key:['gp_gebohrt','gp_erdung','gp_rueck']},
 lack:{n:'Pumpen vor Lack',g:'Pumpen vor Lack',img:'pumpe',hl:['lack_hp','lack_vp'],hlL:'HP und VP gemeinsam',key:['lack_hp','lack_vp','lack_rueck']},
 mont:{n:'Pumpen vor Montage',g:'Pumpen vor Montage',img:'pumpe',hl:['mont_hp','mont_vp'],hlL:'HP und VP gemeinsam',key:['mont_hp','mont_vp','mont_rueck']},
 mw:{n:'Materialwagen',g:'Materialwagen',img:'halle',hl:['mw_ver'],goalK:'mw_gel',hlL:'verräumt von geliefert',key:['mw_ver','mw_gel','mw_rueck']},
 wep:{n:'WE-Prüfung',g:'WE-Prüfung',img:'lager',hl:['wep_si','wep_sonst'],hlL:'heute geprüft',key:['wep_si','wep_sonst','wep_si_mom','wep_so_mom']},
 w1:{n:'Werk 1',parts:['wep','mw']},
 vork:{n:'Vorkommissionierung',parts:['lack','mont','gp']},
 w2:{n:'Werk 2',g:'Kommissionierung Werk 2',img:'komm',hl:['w2_auf'],hlL:'Aufträge kommissioniert',key:['w2_auf','w2_pos','w2_rueck','st_w2'],xf:['st_w2']},
 wv:{n:'Werksverkehr',g:'Werksverkehr',img:'halle',hl:['wv_21','wv_12'],hlL:'Fahrten heute',key:['wv_21','wv_12','wv_rueck','st_wv'],xf:['st_wv']}
};
var ORDER=['we','w1','wep','mw','ms','ks','saege','vork','lack','mont','gp','w2','wv'];
window.WIDGETS={WD:WD,ORDER:ORDER};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function parts(id){var w=WD[id];return w?(w.parts||[id]):[]}
function fields(id){var w=WD[id],g=TZ.filter(function(x){return x.g===w.g})[0];return (g?g.f:[]).concat((w.xf||[]).map(function(k){return [k,lab(k)]}))}
/* Störungsfelder aus der Gruppe „Störungen und Abweichungen“ heißen im Widget einfach „Störungen“ */
var XL={st_w2:'Störungen',st_wv:'Störungen'};
function lab(k){if(XL[k])return XL[k];var l=TZFIELDS[k]||k;return l.split(' · ')[1]||l}
function val(k){var o=S.tz[todayIso()]||{};return o[k]==null||o[k]===''?null:+o[k]}
function hlv(w){return w.hl.reduce(function(a,k){return a+(val(k)||0)},0)}
function goal(w){if(w.plan){var p=val(w.plan);return p==null?null:p+(rueckVortag(w.rueck)||0)}if(w.goalK)return val(w.goalK);return null}
function ro(){return root.classList.contains('ro')||!S.user}

/* ---------- Darstellung ---------- */
function head(id){var w=WD[id],g=goal(w),v=hlv(w),p=g?Math.min(100,Math.round(v/g*100)):0;
 return '<div class="zw-h" data-img="'+w.img+'"><div class="zw-hk"><i></i>heute</div><div class="zw-hn">'+esc(w.n)+'</div><div class="zw-hl"><b>'+v+'</b>'+(g!=null?'<small>/ '+g+'</small>':'')+'</div><div class="zw-hs">'+esc(g!=null&&w.plan?'gesägt vom Tagesziel':w.hlL)+'</div>'+(g?'<div class="zw-bar'+(p>=100?' done':'')+'"><i style="width:'+p+'%"></i></div>':'')+'</div>'}
function cell(k){var v=val(k),rk=/_rueck$/.test(k),vt=rk?rueckVortag(k):null,L=lab(k);
 return '<div class="zw-c'+(rk?' rk':'')+'"><div class="zw-t"><span title="'+esc(L)+'">'+esc(L)+'</span><button class="zw-v" data-act="zwpad" data-k="'+k+'" aria-label="'+esc(L)+': Zahl eingeben"'+(ro()?' disabled':'')+'>'+(v==null?'–':v)+'</button>'+(rk?'<em>Vortag '+(vt==null?'–':vt)+'</em>':'')+'</div>'
 +(ro()?'':'<div class="zw-pm"><button class="p" data-act="zwstep" data-k="'+k+'" data-n="1" aria-label="'+esc(L)+' plus eins">+</button><button data-act="zwstep" data-k="'+k+'" data-n="-1" aria-label="'+esc(L)+' minus eins">−</button></div>')+'</div>'}
function block(id,few){var w=WD[id],F=few?w.key:fields(id).map(function(f){return f[0]});return '<section class="zw-b">'+head(id)+'<div class="zw-f">'+F.map(cell).join('')+'</div></section>'}
function wHTML(id,few){var P=parts(id);return P.map(function(p){return block(p,few||P.length>1)}).join('')}
function sync(){return '<div class="zw-s'+(window.SY&&SY.on&&!SY.ok?' off':'')+'">'+(window.SY&&SY.on?(SY.ok?'in der Zentrale gespeichert':'offline · wird nachgereicht'):'nur auf diesem Gerät')+'</div>'}

/* ---------- Buchen ---------- */
function put(k,v){if(ro())return;tzSet(todayIso(),k,v);try{if(window.syPush)syPush()}catch(e){}draw(true);var L=lab(k);toast(L+': '+(val(k)==null?0:val(k)));
 document.querySelectorAll('.zw-v[data-k="'+k+'"]').forEach(function(e){e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump')})}
ACT.zwstep=function(d){put(d.k,(val(d.k)||0)+ +d.n)};
var PK=null,PV='';
ACT.zwpad=function(d){if(ro())return;PK=d.k;PV=String(val(d.k)||0);var m=document.createElement('div');m.id='zwkp';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
 m.innerHTML='<div class="zw-kc"><div class="zw-kl">'+esc(TZFIELDS[d.k]||d.k)+'</div><div class="zw-kv" id="zwkv">'+PV+'</div><div class="zw-kg">'+[1,2,3,4,5,6,7,8,9].map(function(n){return '<button data-act="zwkey" data-v="'+n+'">'+n+'</button>'}).join('')+'<button data-act="zwkey" data-v="del" aria-label="Löschen">⌫</button><button data-act="zwkey" data-v="0">0</button><button class="ok" data-act="zwkey" data-v="ok">Fertig</button></div></div>';
 m.addEventListener('click',function(e){if(e.target===m)kpClose()});document.body.appendChild(m);var ok=m.querySelector('.ok');if(ok)ok.focus()};
function kpClose(){var m=$('#zwkp');if(m)m.remove();PK=null}
ACT.zwkey=function(d){var x=d.v;if(x==='ok'){var k=PK;kpClose();if(k)put(k,+PV||0);return}if(x==='del')PV=PV.slice(0,-1)||'0';else PV=(PV==='0'?'':PV)+x;if(PV.length>4)PV=PV.slice(0,4);var e=$('#zwkv');if(e)e.textContent=PV};
document.addEventListener('keydown',function(e){if(!$('#zwkp'))return;e.stopPropagation();if(e.key==='Escape')kpClose();else if(e.key==='Enter')ACT.zwkey({v:'ok'});else if(e.key==='Backspace')ACT.zwkey({v:'del'});else if(/^[0-9]$/.test(e.key))ACT.zwkey({v:e.key})},true);

/* ---------- 1 Eigenes Fenster ---------- */
function wid(){var m=location.pathname.match(/^\/w\/([a-z0-9]+)\/?$/)||location.hash.match(/^#w-([a-z0-9]+)$/);return m&&WD[m[1]]?m[1]:null}
window.widgetId=wid;
var WID=wid(),T=0,last='';
function lay(){var w=innerWidth,h=innerHeight;return w>h*1.6?'row':'col'}
function draw(force){var el=$('#zwin');if(!el)return;var h='<div class="zw-wt"><span class="zw-logo">'+(window.logoCore?logoCore(22):'')+'</span><b>'+esc(WD[WID].n)+'</b><span class="zw-d">'+fmtD(todayIso(),{weekday:'short',day:'2-digit',month:'2-digit'})+'</span><button class="zw-x" data-act="zwapp" title="MUNSCH Flow öffnen">App</button></div><div class="zw-body">'+wHTML(WID)+'</div>'+sync();
 el.dataset.lay=lay();if(force||h!==last){last=h;el.innerHTML=h}
 var z=$('#zbar');if(z)zbDraw(force)}
ACT.zwapp=function(){var e=$('#zwin');if(e)e.remove();clearInterval(T);root.classList.remove('zw-on');if(location.pathname.indexOf('/w/')===0)location.href='/'};
function openWin(){if(!WID||$('#zwin')||!S||!S.user||!($('#stage')||$('#stn')))return;var e=document.createElement('div');e.id='zwin';e.setAttribute('aria-label','Zahlen '+WD[WID].n);document.body.appendChild(e);root.classList.add('zw-on');
 try{document.title='MUNSCH Zahlen · '+WD[WID].n}catch(x){}last='';draw(true);clearInterval(T);T=setInterval(function(){draw()},2000);addEventListener('resize',function(){draw(true)})}
var ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);if(WID)setTimeout(openWin,0);else zbDraw()};
/* auch für das Station-Konto (eigene Oberfläche ohne afterRender) */
setInterval(function(){if(WID)openWin()},1000);

/* ---------- 2 Zahlen-Leiste in der App ---------- */
/* Bereich im Schichtplan → Widget (Festlegung der Teamleitung, 8.11.) */
var AUTO={'Wareneingang':'we','Säge Metall':'ms','Säge Kunststoff':'ks','Werk 1':'w1','WEP':'wep','Materialwagen':'mw','Vorkommissionierung':'vork','Werk 2':'w2','Werksverkehr':'wv'};
function zbSel(){return ls('mflow.zbar')||'auto'}
function zbId(){var s=zbSel();if(s==='off')return null;if(s!=='auto')return WD[s]?s:null;if(!S.user||isLead()||ro())return null;var a=(S.plan[todayIso()]||{})[S.user];return AUTO[a]||null}
function zbLook(){return ls('mflow.zblook')||'glass'}
function zbOp(){var o=+(ls('mflow.zbop')||60);return o>=10&&o<=100?o:60}
var zl='';
function zbDraw(force){var id=WID?null:zbId(),z=$('#zbar'),on=!!id&&!!$('#stage')&&!$('#stn')&&innerWidth>820;
 root.classList.toggle('zb-on',on);if(!on){if(z)z.remove();zl='';return}
 if(!z){z=document.createElement('div');z.id='zbar';z.setAttribute('aria-label','Zahlen-Leiste');document.body.appendChild(z)}
 z.className=zbLook()==='glass'?'glass':'';z.style.setProperty('--wa',zbOp()/100);z.dataset.lay='row';
 var h='<div class="zw-body">'+wHTML(id,true)+'</div>';if(force||h!==zl){zl=h;z.innerHTML=h}root.style.setProperty('--zbh',z.offsetHeight+'px')}
setInterval(function(){if(!WID)zbDraw()},2500);

/* Einstellungen: Leiste je Gerät, Widget-Adressen für die Teamleitung */
var adm=VIEW.adm;VIEW.adm=function(){var h=adm.apply(this,arguments),s=zbSel(),g=zbLook()==='glass';
 var opt=[['auto','Automatisch (Bereich laut Schichtplan)'],['off','Aus']].concat(ORDER.map(function(k){return [k,WD[k].n]}));
 h+=M.card('Zahlen-Leiste','<label class="fl">Abteilung<select class="in" id="zbsel" data-in="zbsel">'+opt.map(function(o){return '<option value="'+o[0]+'"'+(o[0]===s?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')+'</select></label>'
  +'<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-top:14px"><div class="seg"><button class="'+(g?'':'on')+'" data-act="zblook" data-v="solid">Deckend</button><button class="'+(g?'on':'')+'" data-act="zblook" data-v="glass">Durchsichtig</button></div>'
  +'<label class="dim" style="display:flex;gap:10px;align-items:center;font-size:13px">Deckkraft<input type="range" id="zbop" data-in="zbop" min="10" max="100" step="5" value="'+zbOp()+'"'+(g?'':' disabled')+'><b id="zbopv">'+zbOp()+' %</b></label></div>'
  +'<p class="dim" style="font-size:12.5px;margin:12px 0 0">Unten auf jeder Seite: die Tageszahlen der Abteilung mit + und −. Automatisch zeigt die Leiste den Bereich, in dem du heute laut Schichtplan eingeteilt bist. Nur am PC und Tablet, gilt für dieses Gerät.</p>');
 if(isLead())h+=M.card('Zahlen-Widgets','<p class="dim" style="font-size:13.5px;margin:0 0 12px">Jede Adresse öffnet nach der Anmeldung nur das Widget. In Edge über „…“ → Apps → „Als App installieren“ einrichten, Autostart unter edge://apps. Schmales hohes Fenster: Spalten, breites flaches Fenster: Zeilen.</p>'
  +'<div class="zw-links">'+ORDER.map(function(k){var u=location.origin+'/w/'+k;return '<div><b>'+esc(WD[k].n)+'</b><span class="mono dim">'+(window.MF_SERVER?esc(u):'/w/'+k)+'</span><button class="btn sm" data-act="zwcopy" data-k="'+k+'"'+(window.MF_SERVER?'':' disabled')+'>Kopieren</button><button class="btn sm ghost" data-act="zwopen" data-k="'+k+'">Öffnen</button></div>'}).join('')+'</div>'
  +(window.MF_SERVER?'':'<p class="dim" style="font-size:12.5px;margin:12px 0 0">Die Adressen funktionieren mit der Zentrale. In dieser Datei öffnet „Öffnen“ das Widget zum Ausprobieren.</p>'));
 return h};
ACT.zblook=function(d){ls('mflow.zblook',d.v);render();zbDraw(true)};
ACT.zwcopy=function(d){if(window.copyText)copyText(location.origin+'/w/'+d.k,'Adresse kopiert')};
ACT.zwopen=function(d){if(window.MF_SERVER)window.open('/w/'+d.k,'_blank','noopener');else{location.hash='w-'+d.k;WID=d.k;openWin()}};
document.addEventListener('input',function(e){var el=e.target;if(!el||!el.dataset)return;
 if(el.dataset.in==='zbop'){ls('mflow.zbop',el.value);var v=$('#zbopv');if(v)v.textContent=el.value+' %';zbDraw(true)}});
document.addEventListener('change',function(e){var el=e.target;if(el&&el.dataset&&el.dataset.in==='zbsel'){ls('mflow.zbar',el.value);zbDraw(true);toast(el.value==='off'?'Zahlen-Leiste aus':'Zahlen-Leiste eingestellt')}});
addEventListener('hashchange',function(){var n=wid();if(n&&n!==WID){WID=n;var e=$('#zwin');if(e)e.remove();openWin()}});
})();
