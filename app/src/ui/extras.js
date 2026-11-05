/* ===== Persönliche Nachrichten, Fach-Etikett mit Barcode, Geräteübersicht =====
   Daten wie Flow 5: S.funk['@Name'] (persönlicher Kanal), S.dev[Gerät] = {n, m, b, t}.
   Vertraulichkeit sichert der Server: persönliche Kanäle sehen nur Empfänger und Teamleitung. */
(function(){
'use strict';
var M=window.MF,cp=M.cp,card=M.card,ic=M.ic,empty=M.empty;
window.pmKey=function(n){return '@'+String(n).replace(/[^A-Za-z0-9]/g,'')};
function pmName(k){var m=CREW.concat(TEAM).filter(function(x){return pmKey(x.n)===k})[0];return m?m.n:k.slice(1)}
function myPm(){return (S.funk[pmKey(S.user)]||[]).filter(function(m){return m.by!==S.user})}
function unread(){var r=+(S.ui.pmr||0);return myPm().filter(function(m){return m.ts>r&&Date.now()-m.ts<7*864e5})}

/* ---------- Persönliche Nachrichten im Funk ---------- */
VIEW.funk=function(){var lead=isLead(),own=pmKey(S.user),ch=S.ui.fk||DEPTS[0];
 var pms=lead?Object.keys(S.funk).filter(function(k){return k.charAt(0)==='@'&&(S.funk[k]||[]).length}).sort():[own];
 if(!lead&&ch.charAt(0)==='@'&&ch!==own)ch=DEPTS[0];
 var isPm=ch.charAt(0)==='@',ms=(S.funk[ch]||[]).slice(-60),title=isPm?(ch===own?'Persönlich':'An '+pmName(ch)):ch;
 if(isPm&&ch===own){S.ui.pmr=Date.now();save()}
 var nU=unread().length;
 var list=DEPTS.map(function(d){var n=(S.funk[d]||[]).length;return '<button class="'+(d===ch?'on':'')+'" data-act="fk" data-c="'+esc(d)+'"><span>'+esc(d)+'</span><span class="mono dim" style="font-size:11px">'+(n||'')+'</span></button>'}).join('')
  +'<div class="sf-lbl" style="margin:14px 0 6px">Persönlich</div>'+pms.map(function(k){var n=(S.funk[k]||[]).length;return '<button class="'+(k===ch?'on':'')+'" data-act="fk" data-c="'+esc(k)+'"><span>'+(k===own?'Meine Nachrichten':esc(pmName(k)))+'</span><span class="mono" style="font-size:11px;color:'+(k===own&&nU?'var(--crit)':'var(--ink3)')+'">'+(k===own&&nU?nU+' neu':(n||''))+'</span></button>'}).join('')
  +(lead?'<button class="btn sm" style="margin-top:8px" data-act="pmn">Persönliche Nachricht</button>':'');
 return '<div class="card"><div class="funk"><div class="chs">'+list+'</div>'
  +'<div style="display:flex;flex-direction:column;gap:14px;min-width:0"><div class="ch" style="margin:0"><h2>'+esc(title)+'</h2><span class="ln"></span>'+(isPm?cp('','vertraulich: nur '+(lead&&ch!==own?esc(pmName(ch))+' und Teamleitung':'du und die Teamleitung')):'')+'</div><div class="msgs" id="msgs">'+(ms.length?ms.map(function(m){return '<div class="msg'+(m.by===S.user?' me':'')+(m.rej?' rej':'')+'"><small>'+esc(m.by)+' · '+fmtDT(m.ts)+'</small>'+esc(m.t)+'</div>'}).join(''):empty(isPm?'Keine Nachrichten':'Noch still hier',isPm?'Persönliche Mitteilungen der Teamleitung erscheinen hier.':'Schreib die erste Nachricht.'))+'</div>'
  +'<div style="display:flex;gap:10px"><input class="in" id="fkm" placeholder="'+esc(isPm?(ch===own?'Antwort an die Teamleitung':'Nachricht an '+pmName(ch)):'Nachricht an '+title)+'" maxlength="500" data-ent="fks" autocomplete="off"><button class="btn pri" data-act="fks">Senden</button></div></div></div></div>'};
ACT.pmn=function(){if(!isLead())return;modal('<h3>Persönliche Nachricht</h3><p class="lead" style="margin-top:8px">Sieht nur die Person selbst und die Teamleitung.</p><div class="frm" style="margin-top:14px"><label class="fl">An<select class="in" id="pm_t">'+CREW.filter(function(c){return c.n!==S.user}).map(function(c){return '<option>'+esc(c.n)+'</option>'}).join('')+'</select></label><label class="fl w2">Nachricht<input class="in" id="pm_x" maxlength="500" data-ent="pms"></label></div><div class="acts"><button class="btn ghost" data-act="mclose">Abbrechen</button><button class="btn pri" data-act="pms">Senden</button></div>')};
ACT.pms=function(){var to=$('#pm_t').value,t=$('#pm_x').value.trim();if(!t)return toast('Bitte eine Nachricht eingeben');var k=pmKey(to);(S.funk[k]=S.funk[k]||[]).push({id:uid(),by:S.user,t:t,ts:Date.now()});logA('Persönliche Nachricht an '+to);S.ui.fk=k;save();closeModal();go('funk');toast('Nachricht an '+to+' gesendet')};
/* Urlaub ablehnen wie in Flow 5: Antrag entfernen und die Person persönlich benachrichtigen */
ACT.vno=function(d){if(!isLead())return toast('Nur Teamleitung');var v=S.vacs.filter(function(x){return x.id===d.id})[0];if(!v)return;
 confirmM('Antrag von <b>'+esc(v.emp)+'</b> ablehnen? Die Person bekommt eine persönliche Nachricht.',function(){S.vacs=S.vacs.filter(function(x){return x.id!==v.id});var c=pmKey(v.emp);(S.funk[c]=S.funk[c]||[]).push({id:uid(),by:S.user,ts:Date.now(),t:'Dein '+v.type+' '+fmtD(v.d0,{day:'2-digit',month:'2-digit'})+' bis '+fmtD(v.d1,{day:'2-digit',month:'2-digit'})+' wurde abgelehnt. Bitte kurz mit der Teamleitung sprechen.',rej:1});logA('Antrag abgelehnt: '+v.emp);save();render();toast('Abgelehnt, '+v.emp+' ist benachrichtigt')},'Ablehnen','no')};

/* ---------- Geräteübersicht ---------- */
function devId(){try{var d=localStorage.getItem('mflow.dev');if(!d){d=Math.random().toString(36).slice(2,8);localStorage.setItem('mflow.dev',d)}return d}catch(e){return window._dv=window._dv||'x'+Math.random().toString(36).slice(2,6)}}
function devMode(){return $('#stn')?'Station':$('#mon')?'Werkstattmonitor':$('#lfm')?'Lagerfachmonitor':'Leitstand'}
window.devBeat=function(){if(!window.MF_SERVER||!window.SY||!SY.tok||!S||window.TRAIN)return;S.dev=S.dev||{};var o=S.dev[devId()];S.dev[devId()]={n:S.user,m:devMode(),b:window.MF_BUILD||'',t:Date.now(),u:(o&&o.u)||''};try{syPush()}catch(e){}};
setTimeout(function(){devBeat()},8000);setInterval(function(){devBeat()},9e4);
function devList(){var L=[];Object.keys(S.dev||{}).forEach(function(k){var d=S.dev[k];if(d&&Date.now()-d.t<7*864e5)L.push(Object.assign({id:k},d))});return L.sort(function(a,b){return b.t-a.t})}
(function(){var a0=alerts;alerts=function(n){var o=a0(n);
 try{unread().slice(-3).forEach(function(m){o.unshift({tone:'crit',t:'Persönlich von '+m.by+': '+m.t,go:'funk'})})}catch(e){}
 try{if(isLead()&&!(window.isStation&&isStation())&&window.MF_SERVER){var h=n.getHours();if(isWork(todayIso())&&h>=6&&h<15)devList().forEach(function(d){if((d.m==='Station'||/monitor/i.test(d.m))&&Date.now()-d.t>15*6e4&&Date.now()-d.t<3*864e5)o.push({tone:'warn',t:d.m+' ('+d.id+') meldet sich seit '+Math.round((Date.now()-d.t)/6e4)+' Min. nicht',go:'adm'})})}}catch(e){}
 return o}})();
var adm0=VIEW.adm;VIEW.adm=function(){var h=adm0.apply(this,arguments);if(!isLead()||!window.MF_SERVER)return h;var L=devList(),me=devId();
 var rows=L.map(function(d){var m=Math.round((Date.now()-d.t)/6e4),st=m<4?['ok','online']:m<15?['warn','vor '+m+' Min.']:['crit','seit '+(m<120?m+' Min.':Math.round(m/60)+' Std.')+' still'];return '<tr><td><b>'+esc(d.n||'')+'</b>'+(d.id===me?' '+cp('sig','dieses Gerät'):'')+'<br><span class="dim mono" style="font-size:11.5px">Gerät '+esc(d.id)+'</span></td><td>'+esc(d.m)+'</td><td>'+(d.b===window.MF_BUILD?cp('ok','aktuell'):cp('warn','alte Version'))+'<br><span class="dim mono" style="font-size:11px">'+esc(d.b||'–')+'</span></td><td>'+cp(st[0],st[1])+'</td></tr>'}).join('');
 return h+card('Geräte','<p class="lead" style="margin-bottom:14px">Jedes Gerät meldet sich etwa alle 90 Sekunden. So siehst du, ob Station und Monitore laufen und die neueste Version haben. Schweigt eine Station oder ein Monitor während der Schicht länger als 15 Minuten, erscheint eine Warnung.</p>'+(L.length?'<div class="tw"><table class="t"><thead><tr><th>Benutzer</th><th>Darstellung</th><th>Version</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table></div>':empty('Noch keine Meldungen','Geräte erscheinen, sobald sie mit der Zentrale verbunden sind.')),{r:cp('',L.length+' Geräte')})};

/* ---------- Fach-Etikett mit Barcode ---------- */
/* Etikettengrößen: Vorlagen gängiger Drucker plus eigene Maße. Gespeichert je Gerät (S.ui bleibt lokal). */
var LBL=[['100x50','100 × 50 mm','Standard, Zebra und Thermodrucker',100,50],['102x51','102 × 51 mm','Zebra 4 × 2 Zoll',102,51],['62x29','62 × 29 mm','Brother DK-11209, klein',62,29],['62x100','62 × 100 mm','Brother DK-11202, hoch',62,100],['57x32','57 × 32 mm','kleines Regaletikett',57,32],['105x74','105 × 74 mm','A7 quer, Regalschild',105,74],['148x105','148 × 105 mm','A6 quer, Fachschild groß',148,105],['eigen','Eigene Größe','Breite und Höhe frei',0,0]];
function clamp(v,a,b){return Math.max(a,Math.min(b,Math.round(v)))}
function lbl(){var u=S.ui.lbl||{},p=LBL.filter(function(x){return x[0]===u.p})[0]||LBL[0],w=p[0]==='eigen'?clamp(+u.w||100,20,210):p[3],h=p[0]==='eigen'?clamp(+u.h||50,15,297):p[4];return {p:p[0],w:w,h:h,date:u.date!==0,bar:u.bar||'n'}}
window.lblSize=lbl;
/* Maße in mm, aus der Etikettenhöhe abgeleitet; sehr flache Etiketten setzen Fach und Auftrag nebeneinander */
function lblFlat(L){return L.h<35||L.w/L.h>=2.6}
function lblHTML(f,L){var a=f.auf||'',flat=lblFlat(L),H=L.h,bh=H*(L.bar==='g'?0.42:L.bar==='k'?0.24:0.32),W=L.w,name=Math.min(flat?H*0.30:H*0.26,flat?W*0.2:W*0.36),auf=Math.min(flat?H*0.15:H*0.12,flat?W*0.09:W*0.165),dt=Math.min(Math.max(2.2,H*0.055),W/24); // Höhe und Breite begrenzen, damit nichts umbricht
 return '<div class="etk'+(flat?' flat':'')+'" id="etk" style="--w:'+L.w+'mm;--h:'+L.h+'mm;--fn:'+name.toFixed(2)+'mm;--fa:'+auf.toFixed(2)+'mm;--fb:'+bh.toFixed(2)+'mm;--fd:'+dt.toFixed(2)+'mm">'
  +'<div class="ett"><div class="etn">'+esc(fachName(f))+'</div>'+(a?'<div class="eta">'+esc(a)+'</div>':'')+'</div>'
  +(a?'<svg id="etbc" role="img" aria-label="Barcode '+esc(a)+'" preserveAspectRatio="none"></svg>'+(L.date?'<div class="etd">Eingelagert '+(f.ts?fmtD(iso(new Date(f.ts)),{day:'2-digit',month:'2-digit',year:'numeric'}):'')+' · MUNSCH Logistik</div>':''):'<div class="etd">Fach frei oder Altbestand ohne Auftragsnummer</div>')+'</div>'}
function lblDraw(f){var L=lbl(),box=$('#etbox');if(!box)return;box.innerHTML=lblHTML(f,L);
 try{if(f.auf&&window.JsBarcode)JsBarcode('#etbc',f.auf,{format:'CODE128',width:2,height:100,displayValue:false,margin:0,background:'#ffffff',lineColor:'#000000'})}catch(e){}
 var e=$('#etk'),pv=$('#etpv');if(e&&pv){var pw=L.w*96/25.4,ph=L.h*96/25.4,sc=Math.min(1,(pv.clientWidth-8)/pw,300/ph);e.style.transform='scale('+sc.toFixed(3)+')';pv.style.height=(ph*sc+8)+'px'}
 var i=$('#etinfo');if(i)i.textContent=L.w+' × '+L.h+' mm'+(lblFlat(L)?' · flach: Fach und Auftrag nebeneinander':'')}
ACT.fet=function(d){var f=S.fach.filter(function(x){return x.id===d.id})[0];if(!f)return;M.closeDrawer();var L=lbl();window._etf=f.id;
 modal('<h3>Fach-Etikett</h3><div class="frm" style="margin-top:14px"><label class="fl w2">Etikettengröße<select class="in" id="et_p" data-in="etp">'+LBL.map(function(x){return '<option value="'+x[0]+'"'+(x[0]===L.p?' selected':'')+'>'+x[1]+' · '+x[2]+'</option>'}).join('')+'</select></label>'
  +'<label class="fl" id="et_wl"'+(L.p==='eigen'?'':' hidden')+'>Breite (mm)<input class="in" id="et_w" type="number" min="20" max="210" value="'+L.w+'" data-in="etw"></label><label class="fl" id="et_hl"'+(L.p==='eigen'?'':' hidden')+'>Höhe (mm)<input class="in" id="et_h" type="number" min="15" max="297" value="'+L.h+'" data-in="eth"></label></div>'
  +'<div class="frm" style="margin-top:10px;align-items:center"><div class="fl">Barcode<div class="seg" style="margin-top:6px">'+[['k','klein'],['n','normal'],['g','groß']].map(function(x){return '<button class="'+(L.bar===x[0]?'on':'')+'" data-act="etbar" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div></div><label style="display:flex;gap:8px;align-items:center;font-size:14px;margin-top:18px"><input type="checkbox" id="et_d" data-in="etd"'+(L.date?' checked':'')+'> Datum und Absender</label></div>'
  +'<div class="etpv" id="etpv"><div id="etbox"></div></div><div class="dim mono" id="etinfo" style="font-size:11.5px;text-align:center;margin-top:6px"></div>'
  +'<p class="dim" style="font-size:12.5px;margin:8px 0 0">Die Größe gilt für dieses Gerät. Im Druckdialog Ränder „keine“ und Maßstab 100 % wählen.</p><div class="acts"><button class="btn ghost" data-act="mclose">Schließen</button>'+(f.auf?'<button class="btn pri" data-act="etprint">Etikett drucken</button>':'')+'</div>');
 setTimeout(function(){lblDraw(f)},30)};
function lblSet(o){S.ui.lbl=Object.assign({},S.ui.lbl||{},o);save();var f=S.fach.filter(function(x){return x.id===window._etf})[0];if(f)lblDraw(f)}
ACT.etbar=function(d,el){lblSet({bar:d.v});$$('#modal .seg button').forEach(function(b){b.classList.toggle('on',b===el)})};
document.addEventListener('input',function(e){var t=e.target,k=t.dataset&&t.dataset.in;if(!k||!/^et[pwhd]$/.test(k))return;
 if(k==='etp'){var eig=t.value==='eigen',L=lbl();lblSet(eig?{p:'eigen',w:(S.ui.lbl&&S.ui.lbl.w)||L.w,h:(S.ui.lbl&&S.ui.lbl.h)||L.h}:{p:t.value});$('#et_wl').hidden=!eig;$('#et_hl').hidden=!eig;if(eig){$('#et_w').value=lbl().w;$('#et_h').value=lbl().h}}
 else if(k==='etw'||k==='eth'){if(t.value!=='')lblSet(k==='etw'?{w:+t.value}:{h:+t.value})}
 else if(k==='etd')lblSet({date:t.checked?1:0})});
ACT.etprint=function(){var L=lbl(),st=$('#lblpage');if(!st){st=document.createElement('style');st.id='lblpage';document.head.appendChild(st)}
 st.textContent='@media print{@page{size:'+L.w+'mm '+L.h+'mm;margin:0}}';var e=$('#etk');if(e)e.style.transform='';
 document.body.classList.add('prlbl');var off=function(){document.body.classList.remove('prlbl');removeEventListener('afterprint',off);var f=S.fach.filter(function(x){return x.id===window._etf})[0];if(f)lblDraw(f)};addEventListener('afterprint',off);try{window.print()}catch(x){off()}setTimeout(function(){if(document.body.classList.contains('prlbl'))off()},4000)};
var fo0=ACT.fo;ACT.fo=function(d){fo0(d);var f=S.fach.filter(function(x){return x.id===d.id})[0],dr=$('#drawer');if(!f||!f.auf||!dr)return;var b=dr.querySelector('[data-act="fout"]');if(b)b.insertAdjacentHTML('beforebegin','<button class="btn xl" data-act="fet" data-id="'+f.id+'">'+ic('lager')+'Etikett mit Barcode</button>')};
})();
