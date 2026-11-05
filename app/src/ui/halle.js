/* ===== Hallenplan: Werk 2 und Werk 1 als lebendes Schema =====
   Alle 204 Fächer nach Belegung, Bereiche mit offenen Vorgängen und eingeteilten Personen,
   Störmeldungen pulsieren am Ort, Milkrun-Route und Werksverkehr bewegen sich, Suche zoomt zum Fach.
   Schema, nicht maßstäblich: die Lage der Bereiche steht in Z und lässt sich hier anpassen. */
(function(){
'use strict';
var M=window.MF,RM=M.RM,cp=M.cp,card=M.card,VB=[0,56,1200,628];
/* Bereiche: [Kennung, Titel, x, y, b, h, Seite, Schichtplan-Bereich, QS-Bereich] */
var Z=[
 ['we','Wareneingang',40,124,320,150,'we','Wareneingang','Wareneingang'],
 ['wep','WEP Prüfung',40,290,320,140,'wep','WEP',''],
 ['mw','Materialwagen',40,446,320,200,'mw','Materialwagen',''],
 ['ms','Säge Metall',926,124,234,140,'tz','Säge Metall','Säge'],
 ['ks','Säge Kunststoff',926,280,234,140,'tz','Säge Kunststoff','Säge'],
 ['vork','Vorkommissionierung',500,470,250,84,'vork','Vorkommissionierung','Vorkommissionierung'],
 ['lack','Vor Lack',770,470,180,84,'tz','',''],
 ['mont','Vor Montage',970,470,190,84,'tz','',''],
 ['aus','Ausschleusung und Versand',500,570,660,76,'auf','','']];
function last(){var t=todayIso();return tzLatest(isWork(t)?prevWork(t):t)}
function lv(k){var l=last();return l?+((S.tz[l]||{})[k]||0):0}
function qsAt(b){return b?S.reg.qs.filter(function(e){return REG.qs.done.indexOf(e.st)<0&&e.bereich===b}).length:0}
function crew(area){var p=S.plan[todayIso()]||{};return area?Object.keys(p).filter(function(n){return p[n]===area&&!absentOn(todayIso()).some(function(v){return v.emp===n})}):[]}
function info(z){var id=z[0],t=todayIso(),o=S.tz[t]||{};
 if(id==='we')return [regOpen('we'),'Lieferungen offen',lv('we_pak')+' Pakete am letzten Tag'];
 if(id==='wep')return [regOpen('wep'),'Prüfungen offen',lv('wep_si')+' Silizium am letzten Tag'];
 if(id==='mw')return [regOpen('mw'),'Wagen offen',lv('mw_rueck')+' Rückstand am letzten Tag'];
 if(id==='ms'||id==='ks'){var f=window.fcast&&isWork(t)?fcast(id):null;return [+o[id+'_ist']||0,'heute gesägt',f&&f.run!=='ende'?'Prognose '+f.mid+(f.tg!=null?' von '+f.tg:''):lv(id+'_ist')+' am letzten Tag']}
 if(id==='vork')return [regOpen('vork'),'Aufträge offen',''];
 if(id==='lack')return [lv('lack_hp')+lv('lack_vp'),'Pumpen','HP und VP'];
 if(id==='mont')return [lv('mont_hp')+lv('mont_vp'),'Pumpen','HP und VP'];
 if(id==='aus')return [regOpen('auf'),'Aufträge im Produktionsweg',''];return [0,'','']}
function av(n,x,y,i){return '<g class="hav" transform="translate('+(x-i*22)+','+y+')"><circle r="12"/><text y="4" text-anchor="middle">'+esc(M.initials(n))+'</text><title>'+esc(n)+' · heute eingeteilt</title></g>'}
function zone(z,i){var x=z[2],y=z[3],w=z[4],h=z[5],q=qsAt(z[8]),I=info(z),cr=crew(z[7]),small=h<100;
 return '<g class="hz'+(q?' crit':'')+'" style="--i:'+i+'" data-act="go" data-go="'+z[6]+'" role="button" tabindex="0" aria-label="'+esc(z[1]+': '+I[0]+' '+I[1]+(q?', '+q+' Störmeldung offen':''))+'">'
  +(q&&!RM?'<rect class="hpulse" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="16"/>':'')
  +'<rect class="hzr" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="16"/>'
  +'<text class="hzt" x="'+(x+18)+'" y="'+(y+26)+'">'+esc(z[1].toUpperCase())+'</text>'
  +'<text class="hzv" x="'+(x+18)+'" y="'+(y+(small?66:h-34))+'">'+I[0]+'</text>'
  +'<text class="hzs" x="'+(x+(small?18+String(I[0]).length*22+12:18))+'" y="'+(y+(small?64:h-14))+'">'+esc(I[1])+(small||!I[2]?'':' · '+esc(I[2]))+'</text>'
  +(q?'<g transform="translate('+(x+w-20)+','+(y+22)+')"><circle class="hqb" r="12"/><text class="hqt" y="5" text-anchor="middle">'+q+'</text><title>'+q+' offene Störmeldung(en)</title></g>':'')
  +cr.slice(0,3).map(function(n,k){return av(n,x+w-(q?54:24),y+22,k)}).join('')+'</g>'}
function cells(){var g='',S0=S.fach.filter(function(f){return f.typ==='S'}),P0=S.fach.filter(function(f){return f.typ==='P'}),X=520,c=14,gp=3;
 function one(f,x,y,i){var cl=f.auf?(fachLang(f)?'lang':'bel'):f.legacy?'alt':'frei';return '<rect class="hc '+cl+'" style="--i:'+i+'" x="'+x+'" y="'+y+'" width="'+c+'" height="'+c+'" rx="3" data-act="fo" data-id="'+f.id+'" data-f="'+fachName(f)+'" data-a="'+(f.auf||'')+'"><title>'+fachName(f)+' · '+(f.auf?f.auf+' · seit '+days(f.ts)+' Tagen':f.legacy?'Altbestand':'frei')+'</title></rect>'}
 S0.forEach(function(f,i){g+=one(f,X+(i%22)*(c+gp),176+Math.floor(i/22)*(c+gp),i)});
 P0.forEach(function(f,i){g+=one(f,X+(i%18)*(c+gp),318+Math.floor(i/18)*(c+gp),132+i)});
 return g}
function milk(){var t=todayIso(),mk=mkDay(t),done=0,run=-1;for(var i=0;i<10;i++){var r=mk[i];if(r&&r.e)done++;else if(r&&r.s&&run<0)run=i}
 var p='M495,446 H1166 V562 H495 Z',moving=run>=0&&!RM;
 return '<g class="hmk" data-act="go" data-go="milk" role="button" tabindex="0" aria-label="Milkrun: '+done+' von 10 Runden'+(run>=0?', Runde '+(run+1)+' läuft':'')+'"><path id="hmkp" class="hmkr'+(run>=0?' on':'')+'" d="'+p+'"/>'
  +'<g class="hmkv">'+(moving?'<animateMotion dur="14s" repeatCount="indefinite" rotate="0"><mpath href="#hmkp"/></animateMotion>':'')+'<circle r="9" '+(moving?'':'cx="495" cy="446"')+'/><circle class="hmkh" r="16" '+(moving?'':'cx="495" cy="446"')+'/></g>'
  +'<g transform="translate(760,446)"><rect class="hchip" x="-74" y="-13" width="148" height="26" rx="13"/><text class="hchipt" y="5" text-anchor="middle">MILKRUN '+(run>=0?'· RUNDE '+(run+1):done+' / 10')+'</text></g></g>'}
function road(){var wv=S.reg.wv.filter(function(e){return e.st===1}),mw=S.reg.mw.filter(function(e){return e.st===1}),veh=wv.map(function(e){return ['wv',e.ref||'Fahrt',e.route&&/^Werk 1/.test(e.route)?-1:1]}).concat(mw.map(function(e){return ['mw',e.ref||'Pappamobil',1]})),q=qsAt('Werksverkehr');
 var g='<g class="hrd'+(q?' crit':'')+'" data-act="go" data-go="wv" role="button" tabindex="0" aria-label="Werksverkehr: '+veh.length+' unterwegs"><rect class="hrdr" x="392" y="70" width="72" height="600" rx="12"/><path class="hrdl" d="M428,84 V656"/>'
  +'<text class="hzt" transform="translate(436,370) rotate(-90)" text-anchor="middle">WERKSVERKEHR'+(veh.length?' · '+veh.length+' UNTERWEGS':'')+'</text>';
 veh.slice(0,4).forEach(function(v,i){var x=414+(i%2)*28,d=(9+i*2.3).toFixed(1);g+='<g class="hveh '+v[0]+'"><title>'+esc(v[1])+'</title>'+(RM?'':'<animateTransform attributeName="transform" type="translate" values="'+x+','+(v[2]>0?640:100)+';'+x+','+(v[2]>0?100:640)+'" dur="'+d+'s" repeatCount="indefinite"/>')+'<rect x="-9" y="-14" width="18" height="28" rx="5"'+(RM?' transform="translate('+x+','+(140+i*110)+')"':'')+'/></g>'});
 return g+'</g>'}
function svg(){var fs=fachStat(),pw2=crew('Werk 2'),pw1=crew('Werk 1');
 return '<svg id="hsvg" class="hsvg" viewBox="'+VB.join(' ')+'" role="group" aria-label="Hallenplan Werk 2 und Werk 1">'
  +'<defs><pattern id="hgrid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" class="hgl"/></pattern></defs>'
  +'<rect x="0" y="0" width="1200" height="700" fill="url(#hgrid)" class="hbg"/>'
  +'<rect class="hhall" x="20" y="70" width="360" height="600" rx="22"/><text class="hht" x="40" y="104">WERK 2</text>'+(pw2.length?'<text class="hhp" x="360" y="104" text-anchor="end">'+esc(pw2.join(' · '))+'</text>':'')
  +'<rect class="hhall" x="480" y="70" width="700" height="600" rx="22"/><text class="hht" x="500" y="104">WERK 1</text>'+(pw1.length?'<text class="hhp" x="1160" y="104" text-anchor="end">'+esc(pw1.join(' · '))+'</text>':'')
  +road()+Z.map(zone).join('')
  +'<g class="hz hfz" style="--i:3" role="group" aria-label="Fachlager: '+fs.o+' von '+fs.n+' belegt"><rect class="hzr" x="500" y="124" width="410" height="300" rx="16"/>'
  +'<text class="hzt" x="518" y="150">FACHLAGER</text><text class="hzs" x="892" y="150" text-anchor="end">'+fs.o+' / '+fs.n+' belegt'+(fs.l?' · '+fs.l+' Langlieger':'')+'</text>'
  +'<text class="hzk" x="520" y="170">S · 132 FÄCHER</text><text class="hzk" x="520" y="312">P · 72 FÄCHER</text>'+cells()+'</g>'
  +milk()+'</svg>'}
function hits(q){q=(q||'').trim().toLowerCase().replace(/\s+/g,'');if(q.length<2)return [];return S.fach.filter(function(f){return (f.auf||'').indexOf(q)>=0||fachName(f).toLowerCase()===q||fachName(f).toLowerCase().indexOf(q)===0&&q.length>=3})}
function resH(q,H){if(!q||q.trim().length<2)return '<span class="dim">Auftragsnummer oder Fach eingeben, der Plan zoomt hin.</span>';if(!H.length)return '<span class="dim">Kein Fach gefunden für „'+esc(q)+'“.</span>';
 var f=H[0];return '<b>'+(f.auf?esc(f.auf)+'</b> liegt in <b>'+fachName(f)+'</b>'+(f.ts?' seit '+days(f.ts)+' Tagen':''):fachName(f)+'</b> ist '+(f.legacy?'mit Altbestand belegt':'frei'))+(H.length>1?' <span class="dim">· '+(H.length-1)+' weitere Treffer</span>':'')+' <button class="btn sm" data-act="fo" data-id="'+f.id+'">Öffnen</button>'}
var anim=0;function zoomTo(vb,fast){var s=$('#hsvg');if(!s)return;cancelAnimationFrame(anim);var from=(s.getAttribute('viewBox')||VB.join(' ')).split(' ').map(Number);if(RM||fast){s.setAttribute('viewBox',vb.join(' '));return}
 var t0=performance.now(),D=750;(function f(t){var k=Math.min(1,(t-t0)/D),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;s.setAttribute('viewBox',from.map(function(a,i){return (a+(vb[i]-a)*e).toFixed(1)}).join(' '));if(k<1)anim=requestAnimationFrame(f)})(t0)}
function apply(fast){var q=S.ui.hq||'',H=hits(q),ids={};H.forEach(function(f){ids[f.id]=1});$$('#hsvg .hc').forEach(function(c){c.classList.toggle('hit',!!ids[c.dataset.id]);c.classList.toggle('dimc',H.length>0&&!ids[c.dataset.id])});
 var r=$('#hres');if(r)r.innerHTML=resH(q,H);
 var c=H.length?document.querySelector('#hsvg .hc[data-id="'+H[0].id+'"]'):null;if(c){var x=+c.getAttribute('x'),y=+c.getAttribute('y'),w=600,h=314;pin(H[0],x,y);zoomTo([Math.max(0,Math.min(1200-w,x-w/2)),Math.max(56,Math.min(684-h,y-h/2)),w,h],fast)}else{pin(null);zoomTo(VB,fast)}}
/* Markierung am gefundenen Fach: Stecknadel mit Fachname */
function pin(f,x,y){var o=$('#hpin');if(o)o.remove();if(!f)return;var s=$('#hsvg');if(!s)return;var g=document.createElementNS('http://www.w3.org/2000/svg','g');g.id='hpin';g.setAttribute('transform','translate('+(x+7)+','+y+')');var lb=fachName(f)+(f.auf?' · '+f.auf:''),w=lb.length*7.4+22;
 g.innerHTML='<g class="hpi"><circle class="hpr" r="14" cy="7"/><path class="hpn" d="M0,-6 l-7,-10 h14 z"/><rect class="hpb" x="'+(-w/2)+'" y="-42" width="'+w+'" height="26" rx="13"/><text class="hpt" y="-24" text-anchor="middle">'+esc(lb)+'</text></g>';s.appendChild(g)}
VIEW.halle=function(){var fs=fachStat(),qo=regOpen('qs');
 return '<div class="hpbar"><label class="hpq">'+M.ic('search')+'<input class="in" data-hq placeholder="Auftrag oder Fach, z. B. 3501234 oder S012" value="'+esc(S.ui.hq||'')+'" inputmode="search" aria-label="Auftrag oder Fach suchen"></label><div id="hres" class="hpres"></div>'
  +'<button class="btn sm ghost" data-act="hall0">Ganze Halle</button></div>'
  +'<section class="card hcard"><div class="hwrap">'+svg()+'</div>'
  +'<div class="hlg"><span><i class="frei"></i>frei</span><span><i class="bel"></i>belegt</span><span><i class="lang"></i>Langlieger über 10 Tage</span><span><i class="alt"></i>Altbestand</span><span><i class="crit"></i>offene Störmeldung</span><span class="dim">Schema, nicht maßstäblich · Bereich antippen öffnet ihn</span></div></section>'
  +'<div class="row r3">'+card('Fächer',cp(fs.l?'vio':'ok',fs.l+' Langlieger')+' '+cp('',fs.fr+' frei')+' '+cp('',fs.a+' Altbestand'),{r:'<button class="btn sm" data-act="go" data-go="fach">Fachverwaltung</button>'})
  +card('Störmeldungen',qo?cp('crit',qo+' offen')+' <span class="dim">pulsieren im Plan an ihrem Bereich</span>':cp('ok','keine offen'),{r:'<button class="btn sm" data-act="go" data-go="qs">Öffnen</button>'})
  +card('Heute eingeteilt',(function(){var p=S.plan[todayIso()]||{},n=Object.keys(p).length;return n?cp('sig',n+' Personen')+' <span class="dim">stehen als Kürzel im Bereich</span>':'<span class="dim">Für heute ist noch niemand eingeteilt.</span>'})(),{r:'<button class="btn sm" data-act="go" data-go="schicht">Schichtplan</button>'})+'</div>'};
ACT.hall0=function(){S.ui.hq='';var i=document.querySelector('[data-hq]');if(i)i.value='';apply()};
document.addEventListener('input',function(e){if(!e.target.hasAttribute||!e.target.hasAttribute('data-hq'))return;S.ui.hq=e.target.value;clearTimeout(window._hq);window._hq=setTimeout(function(){apply()},180)});
document.addEventListener('keydown',function(e){var g=e.target;if((e.key==='Enter'||e.key===' ')&&g&&g.closest&&g.closest('#hsvg')&&g.getAttribute('role')==='button'){e.preventDefault();g.dispatchEvent(new MouseEvent('click',{bubbles:true}))}});
var ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);if(p==='halle'&&S.ui.hq)apply(true)};
window.hallHits=hits;
})();
