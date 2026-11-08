/* Aus MUNSCH Flow 5 übernommen (tools/extract-legacy.mjs). Logik-Kern.
   Nicht von Hand ändern, ohne test/core.test.mjs anzupassen. */
/* Original-MUNSCH-Logo als Vektor: Dreieck mit Laufrad im Ring, Schriftzug MUNSCH. Koordinaten 0..700 x 0..131 */
var PARTS=[{"k":"o","g":"l","s":[[[160.1,95.4],[176.3,95.4],[176.3,56.4],[176.5,56.4],[198.3,95.4],[210.7,95.4],[232.5,56.4],[232.7,56.4],[232.7,95.4],[248.9,95.4],[248.9,41.1],[223.3,41.1],[204.5,76],[185.7,41.1],[160.1,41.1]]]},{"k":"o","g":"l","s":[[[267.6,76],[267.7,79],[268.1,82.0],[268.9,84.9],[270.2,87.6],[272.0,90.0],[274.2,92.0],[276.8,93.5],[279.6,94.6],[282.5,95.3],[285.5,95.7],[288.5,95.9],[291.5,95.9],[294.5,95.9],[297.5,95.9],[300.5,95.9],[303.5,95.9],[306.5,95.9],[309.5,95.9],[312.5,95.9],[315.5,95.9],[318.5,95.7],[321.5,95.3],[324.4,94.5],[327.1,93.4],[329.7,91.8],[331.9,89.8],[333.6,87.3],[334.8,84.5],[335.5,81.7],[335.9,78.7],[336,75.7],[336,72.7],[336,69.7],[336,66.7],[336,63.7],[336,60.7],[336,57.7],[336,54.7],[336,51.7],[336,48.7],[336,45.7],[336,42.7],[334.6,41.1],[331.6,41.1],[328.6,41.1],[325.6,41.1],[322.6,41.1],[319.6,41.1],[319.4,44.0],[319.4,47.0],[319.4,50.0],[319.4,53.0],[319.4,56.0],[319.4,59.0],[319.4,62.0],[319.4,65.0],[319.4,68.0],[319.4,71.0],[319.4,74.0],[318.9,76.9],[317.5,79.6],[315.1,81.2],[312.1,81.9],[309.1,82],[306.1,82],[303.1,82],[300.1,82],[297.1,82],[294.1,82],[291.1,81.9],[288.2,81.1],[285.9,79.2],[284.7,76.5],[284.3,73.5],[284.3,70.5],[284.3,67.5],[284.3,64.5],[284.3,61.5],[284.3,58.5],[284.3,55.5],[284.3,52.5],[284.3,49.5],[284.3,46.5],[284.3,43.5],[283.7,41.1],[280.7,41.1],[277.7,41.1],[274.7,41.1],[271.7,41.1],[268.7,41.1],[267.7,43.1],[267.7,46.1],[267.7,49.1],[267.7,52.1],[267.7,55.1],[267.7,58.1],[267.7,61.1],[267.7,64.1],[267.7,67.1],[267.7,70.1],[267.7,73.1]]]},{"k":"o","g":"l","s":[[[354.8,95.4],[371.4,95.4],[371.4,55.9],[371.6,55.9],[402.8,95.4],[428.6,95.4],[428.6,41.1],[412,41.1],[412,80.5],[411.8,80.5],[380.6,41.1],[354.8,41.1]]]},{"k":"o","g":"l","s":[[[446.4,81.4],[446.6,84.9],[447.5,88.3],[449.3,91.4],[452.0,93.5],[455.3,94.8],[458.8,95.5],[462.3,95.8],[465.8,96.0],[469.4,96],[472.9,96],[476.4,96],[480.0,96],[483.5,96],[487.1,96],[490.6,96.0],[494.1,95.9],[497.6,95.7],[501.2,95.4],[504.6,94.8],[508.0,93.8],[511.0,92.0],[513.2,89.2],[514.3,85.8],[514.8,82.3],[514.9,78.8],[514.8,75.3],[514.2,71.8],[513.0,68.5],[510.8,65.8],[507.8,64.0],[504.4,62.9],[500.9,62.4],[497.4,62.0],[493.9,61.8],[490.3,61.7],[486.8,61.7],[483.2,61.7],[479.7,61.7],[476.2,61.7],[472.6,61.7],[469.1,61.5],[465.6,60.9],[463.2,58.6],[463.5,55.1],[466.3,53.1],[469.8,52.7],[473.3,52.7],[476.9,52.7],[480.4,52.7],[483.9,52.7],[487.5,52.7],[491,52.8],[494.4,53.8],[495.9,56.8],[497.9,58.3],[501.5,58.3],[505.0,58.3],[508.6,58.3],[512.1,58.3],[512.5,55.2],[512.2,51.6],[511.3,48.2],[509.4,45.3],[506.6,43.2],[503.3,41.9],[499.9,41.1],[496.4,40.8],[492.8,40.6],[489.3,40.6],[485.8,40.6],[482.2,40.6],[478.7,40.6],[475.1,40.6],[471.6,40.6],[468.1,40.6],[464.6,40.7],[461.0,41.0],[457.5,41.6],[454.1,42.6],[451.1,44.2],[448.6,46.8],[447.1,50.0],[446.6,53.4],[446.4,57.0],[446.4,60.5],[446.8,64.0],[447.7,67.4],[449.8,70.3],[452.8,72.1],[456.2,73.1],[459.6,73.7],[463.2,74.0],[466.7,74.2],[470.2,74.3],[473.8,74.3],[477.3,74.3],[480.8,74.3],[484.4,74.4],[487.9,74.5],[491.4,74.7],[494.9,75.3],[497.5,77.4],[497.5,80.9],[495.1,83.3],[491.6,83.9],[488.1,83.9],[484.5,83.9],[481,83.9],[477.5,83.9],[473.9,83.9],[470.4,83.9],[466.9,83.7],[463.9,82],[463.0,78.6],[460.4,77.7],[456.8,77.7],[453.3,77.7],[449.8,77.7],[446.4,77.9]]]},{"k":"o","g":"l","s":[[[531.4,76.3],[531.5,79.3],[531.9,82.3],[532.7,85.2],[534.0,87.9],[535.7,90.3],[538.0,92.3],[540.7,93.7],[543.5,94.7],[546.5,95.3],[549.5,95.7],[552.5,95.8],[555.5,95.9],[558.5,95.9],[561.5,95.9],[564.5,95.9],[567.5,95.9],[570.5,95.9],[573.6,95.9],[576.6,95.9],[579.6,95.9],[582.6,95.9],[585.6,95.8],[588.6,95.5],[591.5,94.8],[594.4,93.8],[597,92.3],[599.2,90.3],[600.7,87.7],[601.6,84.8],[602.0,81.8],[602.1,78.8],[602.1,75.8],[600.4,74.5],[597.4,74.5],[594.4,74.5],[591.4,74.5],[588.4,74.5],[585.5,74.7],[585.2,77.7],[584.0,80.3],[581.3,81.6],[578.3,82.0],[575.3,82],[572.3,82],[569.3,82],[566.3,82],[563.2,82],[560.2,82],[557.2,82.0],[554.2,81.7],[551.5,80.6],[549.5,78.3],[548.8,75.4],[548.5,72.4],[548.5,69.4],[548.5,66.4],[548.5,63.4],[549.0,60.4],[550.2,57.6],[552.4,55.7],[555.2,54.7],[558.2,54.4],[561.3,54.4],[564.3,54.4],[567.3,54.4],[570.3,54.4],[573.3,54.4],[576.3,54.4],[579.3,54.5],[582.2,55.2],[584.4,57.2],[584.8,60.2],[587.0,61],[590.0,61],[593,61],[596.0,61],[599.0,61],[601.4,60.4],[601.4,57.4],[601.1,54.3],[600.6,51.4],[599.7,48.5],[598.0,46],[595.8,44.0],[593.1,42.7],[590.2,41.8],[587.2,41.2],[584.3,40.9],[581.3,40.7],[578.2,40.5],[575.2,40.5],[572.2,40.5],[569.2,40.5],[566.2,40.5],[563.2,40.5],[560.2,40.5],[557.2,40.5],[554.1,40.5],[551.1,40.6],[548.1,40.9],[545.2,41.3],[542.2,42.1],[539.5,43.2],[536.9,44.9],[534.8,47],[533.3,49.6],[532.2,52.4],[531.6,55.3],[531.3,58.3],[531.3,61.3],[531.3,64.3],[531.3,67.4],[531.3,70.4],[531.3,73.4]]]},{"k":"o","g":"l","s":[[[619.7,95.4],[636.4,95.4],[636.4,74.8],[671.5,74.8],[671.5,95.4],[688.1,95.4],[688.1,41.1],[671.5,41.1],[671.5,60.4],[636.4,60.4],[636.4,41.1],[619.7,41.1]]]},{"k":"o","g":"t","s":[[[13.9,94.8],[116.8,94.8],[65.3,65.1]]]},{"k":"o","g":"t","s":[[[116.8,94.8],[65.3,5.7],[65.3,65.1]]]},{"k":"o","g":"t","s":[[[65.3,5.7],[13.9,94.8],[65.3,65.1]]]},{"k":"w","g":"w","s":[[[85,76.6],[84.9,73.6],[84.5,70.7],[83.6,67.8],[82.3,65.2],[80.5,62.7],[78.5,60.6],[76.1,58.9],[73.3,57.6],[70.5,57.0],[67.5,57.0],[64.9,58.1],[63.9,60.9],[66,60.4],[68.9,59.6],[71.8,59.8],[74.7,60.6],[77.2,62.2],[79.4,64.2],[81.2,66.6],[82.5,69.3],[83.3,72.1],[83.7,75.1],[83.7,78.1]]]},{"k":"w","g":"w","s":[[[69.8,87.5],[72.0,85.6],[74.0,83.3],[75.7,80.9],[76.9,78.2],[77.7,75.3],[78.0,72.4],[77.8,69.4],[77.0,66.5],[75.7,63.9],[73.9,61.5],[71.5,60.1],[68.7,61.1],[70.3,62.4],[72.7,64.1],[74.4,66.5],[75.6,69.2],[76.0,72.2],[75.9,75.2],[75.2,78.0],[74.0,80.8],[72.4,83.3],[70.4,85.5],[68.0,87.3]]]},{"k":"w","g":"w","s":[[[51.7,82.5],[54.6,83.1],[57.6,83.2],[60.5,83.0],[63.4,82.3],[66.2,81.1],[68.7,79.5],[70.8,77.4],[72.5,74.9],[73.7,72.2],[74.3,69.3],[73.7,66.7],[71.1,65.0],[71.1,67.2],[71.3,70.2],[70.5,73.0],[69.1,75.7],[67.2,77.9],[64.8,79.7],[62.1,81.0],[59.2,81.7],[56.3,82],[53.3,81.8],[50.4,81.1]]]},{"k":"w","g":"w","s":[[[44.3,65.1],[45.7,67.7],[47.4,70.1],[49.5,72.2],[51.8,74.0],[54.4,75.4],[57.2,76.4],[60.1,76.8],[63.1,76.6],[65.9,75.8],[68.6,74.5],[70.3,72.4],[70.0,69.5],[68.4,71.0],[66.2,73.0],[63.5,74.2],[60.6,74.7],[57.6,74.5],[54.8,73.7],[52.1,72.4],[49.8,70.6],[47.7,68.5],[46,66.1],[44.7,63.4]]]},{"k":"w","g":"w","s":[[[53,48.5],[51.9,51.3],[51.1,54.2],[50.8,57.1],[50.9,60.1],[51.5,63.0],[52.5,65.9],[54.1,68.4],[56.1,70.6],[58.5,72.4],[61.3,73.6],[64.0,73.6],[66.1,71.4],[64,71.0],[61.1,70.5],[58.4,69.2],[56.1,67.2],[54.4,64.8],[53.2,62.0],[52.5,59.1],[52.3,56.1],[52.7,53.2],[53.5,50.3],[54.7,47.6]]]},{"k":"w","g":"w","s":[[[85.9,57.3],[83.5,55.6],[80.8,54.2],[78.0,53.2],[75.1,52.6],[72.2,52.5],[69.2,52.8],[66.4,53.8],[63.8,55.2],[61.5,57.2],[59.7,59.6],[59.1,62.2],[60.7,64.8],[61.7,62.8],[62.8,60.1],[64.7,57.8],[67.1,56.1],[69.9,55.0],[72.8,54.4],[75.8,54.4],[78.7,54.9],[81.5,55.9],[84.1,57.4],[86.4,59.3]]]},{"k":"w","g":"w","s":[[[71.7,44.9],[68.8,45.7],[66.1,46.9],[63.6,48.5],[61.3,50.4],[59.4,52.6],[57.8,55.2],[56.8,57.9],[56.3,60.9],[56.4,63.8],[57.1,66.7],[58.8,68.9],[61.7,69.2],[60.8,67.2],[59.3,64.7],[58.7,61.8],[58.8,58.8],[59.6,55.9],[61,53.3],[62.8,51.0],[65.1,49.0],[67.6,47.5],[70.3,46.3],[73.2,45.6]]]}];
/* SVG-Logo: parts = 'all' | 'mark' (nur Ring+Dreieck+Laufrad) */
function logoSVG(o){o=o||{};var ring=o.ring||'#E9EEF5',mark=o.mark==='mark',h=o.h||34;
 var d=function(s){return 'M'+s[0].map(function(p){return p[0]+','+p[1]}).join('L')+'Z'};
 var out='<svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="'+(mark?'0 0 131 131':'0 0 700 131')+'" height="'+h+'" role="img" aria-label="MUNSCH"><circle cx="65.3" cy="65.3" r="62.3" fill="none" stroke="'+ring+'" stroke-width="6.4"/>';
 PARTS.forEach(function(p){if(mark&&p.g==='l')return;out+='<path d="'+d(p.s)+'" fill="'+(p.k==='o'?'#FF761B':'#F4F0EA')+'"/>'});
 return out+'</svg>'}

/* Animiertes Markenzeichen: Ring, Dreieck, Laufrad (dreht) */
function logoCore(h){var d=function(a){return 'M'+a.map(function(p){return p[0]+','+p[1]}).join('L')+'Z'},t='',w='';
 PARTS.forEach(function(p){var x='<path d="'+d(p.s[0])+'" fill="'+(p.k==='o'?'#FF761B':'#F4F0EA')+'"/>';if(p.g==='t')t+=x;else if(p.g==='w')w+=x});
 return '<svg class="lcore" viewBox="0 0 131 131" width="'+h+'" height="'+h+'" role="img" aria-label="MUNSCH"><circle cx="65.3" cy="65.3" r="62.3" fill="none" stroke="#BFEFFF" stroke-width="3.4"/><circle class="lc-r" cx="65.3" cy="65.3" r="62.3" fill="none" stroke="#5FD3FF" stroke-width="1.6" stroke-dasharray="40 351"/>'+t+'<g class="lc-i">'+w+'</g></svg>'}

'use strict';
/* ===== Stammdaten ===== */
var TEAM=[{n:'M. Thiel',first:'Markus',role:'Teamleitung',lead:1},{n:'S. Schwan',first:'Simon',role:'Teamleitung',lead:1,nonop:1},{n:'Station',first:'Station',role:'Tablet in der Halle',station:1,nonop:1},{n:'D. Krämer',role:'Teamleitung',lead:1},{n:'M. Bode',role:'Logistik'},{n:'K. Braun',role:'Logistik'},{n:'J. Ehret',role:'Logistik'},{n:'M. Giesen',role:'Logistik'},{n:'M. Neifer',role:'Logistik'},{n:'F. Ahmadi',role:'Logistik'},{n:'D. Isola',role:'Logistik'},{n:'O. Bruckhoff',role:'Logistik'},{n:'Monitor',first:'Monitor',role:'Hallenmonitor, nur lesen',monitor:1,nonop:1}];
var CREW=TEAM.filter(function(m){return !m.nonop}),MIN_STAFF=7,JAHRESURLAUB=30;
var DEPTS=['Wareneingang','WEP','Werk 1','Werk 2','Säge Metall','Säge Kunststoff','Vorkommissionierung','Materialwagen','Werksverkehr','Teamleitung'];
var HOL=new Set(['2026-01-01','2026-04-03','2026-04-06','2026-05-01','2026-05-14','2026-05-25','2026-06-04','2026-10-03','2026-11-01','2026-12-25','2026-12-26','2027-01-01','2027-03-26','2027-03-29','2027-05-01','2027-05-06','2027-05-17','2027-05-27','2027-10-03','2027-11-01','2027-12-25','2027-12-26','2028-01-01','2028-04-14','2028-04-17','2028-05-01','2028-05-25','2028-06-05','2028-06-15','2028-10-03','2028-11-01','2028-12-25','2028-12-26']);
var TZ=[
 {g:'Wareneingang',f:[['we_pak','Pakete gebucht'],['we_gbpal','GB / Pal'],['we_metall','Lieferung Metall'],['we_kunst','Lieferung Kunststoff'],['we_sonst','sonstige WE'],['we_rueck','Rückstand heute'],['we_ges','WE gesamt']]},
 {g:'WE-Prüfung',f:[['wep_si','Silizium geprüft'],['wep_si_mom','Silizium momentan zu prüfen'],['wep_si_lief','Silizium heute geliefert'],['wep_si_ges','Silizium gesamt zu prüfen'],['wep_si_min','Silizium Prüfaufwand in Minuten'],['wep_sonst','Sonstiges geprüft'],['wep_so_mom','Sonstiges momentan zu prüfen'],['wep_so_lief','Sonstiges heute geliefert'],['wep_so_ges','Sonstiges gesamt zu prüfen'],['wep_so_min','Sonstiges Prüfaufwand in Minuten']]},
 {g:'Materialwagen',f:[['mw_rueck','Rückstand heute'],['mw_gel','geliefert'],['mw_ver','verräumt']]},
 {g:'Säge Metall',f:[['ms_rueck','Rückstand heute'],['ms_plan','heute geplant'],['ms_ist','heute gesägt'],['ms_schn','Schnitte heute']]},
 {g:'Säge Kunststoff',f:[['ks_rueck','Rückstand heute'],['ks_plan','heute geplant'],['ks_ist','heute gesägt'],['ks_schn','Schnitte heute']]},
 {g:'Grundplatten',f:[['gp_rueck','Rückstand heute'],['gp_gebohrt','heute gebohrt'],['gp_erdung','Erdungslasche']]},
 {g:'Pumpen vor Lack',f:[['lack_rueck','Rückstand heute'],['lack_hp','HP'],['lack_vp','VP'],['lack_most','MOST'],['lack_ges','Gesamt'],['lack_gpl','Grundplatten'],['lack_ers','Ersatzteile'],['lack_sonst','Sonstiges'],['lack_mf','Motorflansch flexen']]},
 {g:'Pumpen vor Montage',f:[['mont_rueck','Rückstand heute'],['mont_hp','HP'],['mont_vp','VP'],['mont_most','MOST'],['mont_ges','Gesamt']]},
 {g:'Tägliche Aufgaben',f:[['kisten','Kisten füllen'],['milkrun','Milkrun-Runden'],['tbkiste','TB-Kiste leeren']]},
 {g:'Störungen und Abweichungen',f:[['st_w1allg','Werk 1 allgemein'],['st_w1komm','Werk 1 Kommissionierung'],['st_w2','Werk 2'],['st_saege','Säge'],['st_we','Wareneingang'],['st_sonst','sonstige'],['st_neu','Neuanlagen'],['st_nach','Nacharbeit'],['st_fehl','Fehlteile'],['st_zeit','Störzeiten in Minuten']]}];
var TZFIELDS={};TZ.forEach(function(g){g.f.forEach(function(f){TZFIELDS[f[0]]=g.g+' · '+f[1]})});
var NAV=[
 ['Steuerung',[['lage','Lagebild'],['runde','Shopfloor 06:45'],['chk','Schichtaufgaben'],['fluss','Materialfluss']]],
 ['Material und Lager',[['fach','Fachverwaltung'],['vork','Vorkommissionierung'],['milk','Milkrun'],['wep','WEP Wareneingangsprüfung'],['we','Wareneingang'],['mw','Materialwagen'],['wv','Werksverkehr'],['tb','TB-Wagen und TB-Kiste']]],
 ['Produktion und Qualität',[['tz','Tageszahlen'],['auf','Aufträge und Produktionsweg'],['qs','QS und Störmeldungen'],['mas','Maschinen und Wartung'],['aud','Audits'],['s5','5S-Board']]],
 ['Personal',[['urlaub','Urlaub und Anwesenheit'],['plan','Planungsboard'],['schicht','Schichtplan'],['quali','Qualifikationen'],['gespr','Personalgespräche','lead']]],
 ['Kommunikation',[['funk','Abteilungsfunk'],['brett','Schwarzes Brett und Newsflash']]],
 ['System',[['ausw','Auswertung'],['imp','Excel-Import','lead'],['ber','Berichte'],['verl','Verlauf'],['adm','Administration','lead']]]];
var NAVMAP={};NAV.forEach(function(g){g[1].forEach(function(n){NAVMAP[n[0]]=n[1]})});
var VIEW={},ACT={},S=null,KEY='mflow.v2';

/* ===== Helfer ===== */
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function iso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function todayIso(){return iso(new Date())}
function addDays(i,n){var d=new Date(i+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)}
function fmtD(i,o){return new Date(i+'T12:00:00').toLocaleDateString('de-DE',o||{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'})}
function fmtT(ts){return new Date(ts).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}
function fmtDT(ts){var d=new Date(ts);return d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})+' '+fmtT(ts)}
function isWork(i){var w=new Date(i+'T12:00:00').getDay();return w>0&&w<6&&!HOL.has(i)&&!/-12-(24|31)$/.test(i)}
function prevWork(i){var d=addDays(i,-1),n=0;while(!isWork(d)&&n++<14)d=addDays(d,-1);return d}
function nextWork(i){var d=addDays(i,1),n=0;while(!isWork(d)&&n++<14)d=addDays(d,1);return d}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function num(v){var n=parseFloat(String(v).replace(',','.'));return isFinite(n)?n:0}
function pct(a,b){return b>0?Math.max(0,Math.min(100,a/b*100)):0}
function me(){return TEAM.filter(function(m){return m.n===S.user})[0]||TEAM[0]}
function isStation(){return !!(window.SY&&SY.name==='Station')}
function isLead(){return !!me().lead}
function firstName(n){var m=TEAM.filter(function(x){return x.n===n})[0];return m&&m.first&&m.first.length>2?m.first:n}
function aufNr(raw){var s=String(raw==null?'':raw).trim().slice(0,7);return /^\d{7}$/.test(s)?s:''}
function chip(t,tx){return '<span class="chip '+(t||'')+'"><i></i>'+esc(tx)+'</span>'}
function days(ts){return Math.floor((Date.now()-ts)/864e5)}
function toast(m){var o=$('.toast');if(o)o.remove();var t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},3200)}
function copyText(t,msg){function fb(){var a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();try{document.execCommand('copy');toast(msg||'Kopiert')}catch(e){toast('Kopieren nicht möglich')}a.remove()}
 try{navigator.clipboard.writeText(t).then(function(){toast(msg||'Kopiert')},fb)}catch(e){fb()}}

/* ===== Zustand ===== */
function newState(){
 var D=window.MFDATA,fach=[],i=0;
 D.fach.forEach(function(f){var typ=i<132?'S':'P',nr=typ==='S'?i+1:i-131;fach.push({id:typ+nr,typ:typ,nr:nr,auf:'',ts:0,legacy:f[1]?1:0});i++});
 var st={v:2,user:'M. Thiel',demo:0,ui:{page:'lage'},tz:JSON.parse(JSON.stringify(D.tz)),fach:fach,fachlog:[],milk:{},vacs:[],carry:window.MF_SERVER?{}:{'M. Thiel':-4},plan:{},quali:{},
  reg:{wep:[],we:[],mw:[],wv:[],tb:[],vork:[],auf:[],qs:[],mas:[],aud:[],gespr:[]},s5:{items:[],mass:[]},brett:[],funk:{},runde:{},mass:[],log:[],seen:0};
 for(var k=1;k<=12;k++)st.s5.items.push({n:'M'+('0'+k).slice(-2),t:'',st:'UNGEPRÜFT'});
 if(!window.MF_SERVER)st.vacs.push({id:'v0',emp:'M. Thiel',type:'Urlaub',d0:'2026-11-17',d1:'2026-12-08',st:'genehmigt'});
 impVac(st);st.dv=D.dv;return st}
function impVac(st){var D=window.MFDATA;if(!D.vac)return;st.vacs=st.vacs.filter(function(v){return !v.demo&&!v.imp&&v.id!=='v0'});D.vac.forEach(function(a,i){st.vacs.push({id:'x'+i,imp:1,emp:a[0],type:a[1],d0:a[2],d1:a[3],h:a[4]?1:0,st:'genehmigt'})});st.carry=Object.assign(st.carry||{},D.carry||{})}
function seedDemo(st){
 var t=todayIso(),d=function(n){return addDays(t,n)},X=function(o){o.demo=1;o.id=o.id||uid();return o};
 [['K. Braun',3,5,'Urlaub','genehmigt'],['M. Giesen',9,11,'Urlaub','genehmigt'],['J. Ehret',21,25,'Urlaub','beantragt'],['D. Isola',27,29,'Urlaub','beantragt'],['F. Ahmadi',4,4,'FZA','genehmigt']].forEach(function(a){st.vacs.push(X({emp:a[0],type:a[3],d0:d(a[1]),d1:d(a[2]),st:a[4]}))});
 st.reg.we.push(X({ref:'Lieferschein 88412',pak:6,kat:'Pakete',st:1,ts:Date.now()-36e5}),X({ref:'Palette Metall / Lieferant Süd',pak:2,kat:'Metall',st:0,ts:Date.now()-18e5}));
 st.reg.mw.push(X({ref:'Wagen 3 · Auftrag 4821907',ziel:'Auftrag',st:1,ts:Date.now()-9e5}),X({ref:'Wagen 5 · Lager Werk 1',ziel:'Lager Werk 1',st:0,ts:Date.now()-12e5}));
 st.reg.qs.push(X({bereich:'Säge',art:'Störung',txt:'Metallsäge Bandwechsel läuft länger',min:35,st:1,ts:Date.now()-72e5}),X({bereich:'Werk 1',art:'Fehlteil',txt:'Fehlteil Auftrag 4821755 gemeldet',min:0,st:0,ts:Date.now()-30e5}));
 st.reg.mas.push(X({ref:'Metallsäge',art:'Wartung Sägeband',faellig:d(-2),st:0,ts:Date.now()}),X({ref:'Stapler Wareneingang',art:'Sichtprüfung',faellig:d(6),st:0,ts:Date.now()}));
 st.reg.vork.push(X({ref:'4822031',bereich:'Werk 1',st:1,ts:Date.now()-5e5}));
 st.reg.auf.push(X({ref:'4821907',kunde:'Beispielkunde',st:3,ts:Date.now()-4e7}));
 st.s5.mass.push(X({txt:'Laufweg Werk 1 Regal 3 freiräumen',wer:'D. Krämer',prio:'hoch',bis:d(3),done:0}));
 [[1,'STABIL'],[2,'STABIL'],[3,'MASSNAHME'],[4,'UNGEPRÜFT'],[5,'STABIL'],[6,'DRINGEND']].forEach(function(a){st.s5.items[a[0]-1].st=a[1]});
 st.brett.push(X({t:'Schichtstart 06:00. Shopfloorrunde 06:45.',by:'M. Thiel',pin:1,ts:Date.now()-864e5}),X({t:'Beispielmeldung: Hallenboden Werk 2 nass, bitte vorsichtig fahren.',by:'D. Krämer',pin:0,ts:Date.now()-36e5}));
 st.funk.Wareneingang=[X({by:'M. Bode',t:'Beispiel: Palette 4 steht noch am Tor.',ts:Date.now()-26e5})];
 st.qdemo=1}
function clearDemo(){var f=function(a){return a.filter(function(x){return !x.demo})};
 S.vacs=f(S.vacs);Object.keys(S.reg).forEach(function(k){S.reg[k]=f(S.reg[k])});S.s5.mass=f(S.s5.mass);S.brett=f(S.brett);Object.keys(S.funk).forEach(function(k){S.funk[k]=f(S.funk[k])});S.s5.items.forEach(function(i){i.st='UNGEPRÜFT'});S.demo=0;save()}
function loadState(){var s=null;try{s=JSON.parse(localStorage.getItem(KEY))}catch(e){}
 if(s&&s.v===2){var n=newState();S=Object.assign(n,s);S.ui=Object.assign({page:'lage'},s.ui||{});S.reg=Object.assign(n.reg,s.reg||{});var D=window.MFDATA;if(D.dv&&s.dv!==D.dv){Object.keys(D.tz).forEach(function(k){S.tz[k]=JSON.parse(JSON.stringify(D.tz[k]))});impVac(S);if(S.demo)clearDemo();S.dv=D.dv;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}}else S=newState();}
var saveT;function save(){clearTimeout(saveT);saveT=setTimeout(function(){try{localStorage.setItem(KEY,JSON.stringify(window.MF_SERVER?{v:2,ui:S.ui,user:S.user,dv:''}:S))}catch(e){}if(window.syKick)syKick()},250)}
function logA(t){S.log.unshift({ts:Date.now(),u:S.user,t:t});if(S.log.length>400)S.log.length=400;save()}

/* ===== Tageszahlen ===== */
function tzOf(i){return S.tz[i]||{}}
/* Rückstand: „Rückstand heute“ ist, was heute nicht abgearbeitet wurde. Am nächsten Arbeitstag ist derselbe Wert der „Rückstand Vortag“. */
function rueckVortag(k,t){var l=tzLatest(prevWork(t||todayIso())),o=l&&S.tz[l]||{};return o[k]==null||o[k]===''?null:+o[k]}
function tzLatest(before){var ks=Object.keys(S.tz).filter(function(k){return k<=before&&Object.keys(S.tz[k]).length}).sort();return ks.length?ks[ks.length-1]:null}
function tzSet(i,k,v){S.tz[i]=S.tz[i]||{};if(v===''||v==null)delete S.tz[i][k];else S.tz[i][k]=Math.max(0,Math.round(num(v)));save()}
function tzSum(o,keys){return keys.reduce(function(a,k){return a+(o[k]||0)},0)}
function tzSeries(key,n,end){var out=[],ks=Object.keys(S.tz).filter(function(k){return k<=end&&S.tz[k][key]!=null}).sort().slice(-n);ks.forEach(function(k){out.push([k,S.tz[k][key]])});return out}
function tzFn(o){return {pakete:o.we_pak||0,gesaegt:(o.ms_ist||0)+(o.ks_ist||0),lack:(o.lack_hp||0)+(o.lack_vp||0),mont:(o.mont_hp||0)+(o.mont_vp||0),stoer:tzSum(o,['st_w1allg','st_w1komm','st_w2','st_saege','st_we','st_sonst','st_neu','st_nach']),milk:o.milkrun||0,gb:o.we_gbpal||0}}

/* ===== Urlaub, Anwesenheit ===== */
function vcover(v,d){return v.d0<=d&&v.d1>=d}
function vconf(emp,d0,d1,skipId,half){return S.vacs.filter(function(v){return v.emp===emp&&v.id!==skipId&&v.d0<=d1&&v.d1>=d0&&!(half&&v.h)})}
function vconfAll(){var out={};S.vacs.forEach(function(a,i){S.vacs.forEach(function(b,j){if(j>i&&a.emp===b.emp&&a.type!==b.type&&(a.type==='Krank'||b.type==='Krank')&&a.d0<=b.d1&&a.d1>=b.d0&&!(a.h&&b.h))out[a.emp]=1})});return Object.keys(out)}
function absentOn(d){var out=[];S.vacs.forEach(function(v){if(vcover(v,d)&&v.st==='genehmigt'&&!v.h&&CREW.some(function(c){return c.n===v.emp}))out.push(v)});return out}
function presentOn(d){if(!isWork(d))return [];var a=absentOn(d).map(function(v){return v.emp});return CREW.filter(function(c){return a.indexOf(c.n)<0}).map(function(c){return c.n})}
function wdays(d0,d1,year){var n=0;for(var d=d0;d<=d1;d=addDays(d,1)){if(year&&d.slice(0,4)!==String(year))continue;var w=new Date(d+'T12:00:00').getDay();if(w===0||w===6||HOL.has(d))continue;n+=/-12-(24|31)$/.test(d)?.5:1}return n}
function konto(n,year){var mine=S.vacs.filter(function(v){return v.emp===n&&v.type==='Urlaub'}),s=function(st){return mine.filter(function(v){return v.st===st}).reduce(function(a,v){return a+wdays(v.d0,v.d1,year)*(v.h?.5:1)},0)},c=(year>2026&&!(S.carryY&&S.carryY[year]&&S.carryY[year][n]!=null))?konto(n,year-1).rest:num(S.carryY&&S.carryY[year]&&S.carryY[year][n]!=null?S.carryY[year][n]:(S.carry[n]||0)),g=s('genehmigt'),b=s('beantragt');return {c:c,g:g,b:b,rest:JAHRESURLAUB+c-g-b}}

/* ===== Schicht ===== */
function shiftInfo(now){var d=iso(now),m=now.getHours()*60+now.getMinutes();
 if(!isWork(d))return {txt:HOL.has(d)?'Feiertag · heute keine Produktion':'Heute keine Produktion',p:0,state:'frei'};
 if(m<360){var r=360-m;return {txt:'Schichtbeginn 06:00 · in '+Math.floor(r/60)+' Std. '+(r%60)+' Min.',p:0,state:'vor'}}
 if(m<900){var r2=900-m;return {txt:'Schicht läuft · noch '+Math.floor(r2/60)+' Std. '+(r2%60)+' Min.',p:(m-360)/540,state:'lauf'}}
 return {txt:'Schicht beendet · Feierabend',p:1,state:'ende'}}

/* ===== Milkrun-Takt: stündlich 06:00 bis 14:00, letzte Runde 14:25, zehn Runden ===== */
function mkPlan(i){var a=i<9?360+i*60:865;return {h:Math.floor(a/60),m:a%60,min:a}}
function mkTime(i){var p=mkPlan(i);return ('0'+p.h).slice(-2)+':'+('0'+p.m).slice(-2)}
function mkDay(d){S.milk[d]=S.milk[d]||{};return S.milk[d]}
function mkStatus(i,now){var r=mkDay(todayIso())[i],m=now.getHours()*60+now.getMinutes(),p=mkPlan(i).min;
 if(r&&r.x)return {s:'ausgefallen',tone:'warn'};
 if(r&&r.e)return {s:'erledigt',tone:'ok'};
 if(r&&r.s){var open=(now.getTime()-r.s)/6e4;return open>20?{s:'eskaliert · '+Math.round(open)+' Min. offen',tone:'crit'}:{s:'läuft · '+Math.round(open)+' Min.',tone:'ice'}}
 if(!isWork(todayIso()))return {s:'geplant',tone:''};
 if(m>=900)return {s:'nicht erfasst',tone:''};if(m>=p+10)return {s:'überfällig',tone:'crit'};if(m>=p)return {s:'fällig',tone:'warn'};return {s:'geplant',tone:''}}
function mkOverdue(now){if(!isWork(todayIso()))return 0;var c=0;for(var i=0;i<10;i++){var s=mkStatus(i,now).s;if(/überfällig|eskaliert/.test(s))c++}return c}

/* ===== Fächer ===== */
function fachLang(f){return f.auf&&f.ts&&days(f.ts)>10}
function fachStat(){var o=0,l=0,fr=0,a=0;S.fach.forEach(function(f){if(f.auf||f.legacy){o++;if(fachLang(f))l++;if(f.legacy&&!f.auf)a++}else fr++});return {o:o,l:l,fr:fr,a:a,n:S.fach.length}}
function fachName(f){return f.typ+('00'+f.nr).slice(-3)}

/* ===== Register ===== */
var REG={
 wep:{t:'WEP Wareneingangsprüfung',k:'Prüfbestand',st:['offen','in Prüfung','freigegeben','gesperrt'],done:[2],f:[['ref','Lieferung (Auftrag oder Artikel)','t'],['menge','Liefermenge','n'],['art','Prüfart','s',['Silizium','Sonstiges']],['umfang','Prüfumfang','s',['5 %','10 %','100 %']],['pruefer','Prüfer','s',CREW.map(function(m){return m.n})],['dauer','Dauer in Minuten','n']],cols:['ref','menge','art','umfang','pruefer','dauer']},
 we:{t:'Wareneingang Werk 2',k:'Lieferungen',st:['angeliefert','vereinnahmt','WE-Prüfung','Rückstand','erledigt'],done:[4],f:[['ref','Lieferant oder Lieferschein','t'],['pak','Pakete','n'],['kat','Kategorie','s',['Pakete','GB / Pal','Metall','Kunststoff','sonstige']]],cols:['ref','pak','kat']},
 mw:{t:'Materialwagen',k:'Vom Wareneingang nach Werk 1 per Pappamobil, getrennt nach Pumu und KST',st:['Werk 2 vereinnahmt','Pappamobil unterwegs','in Werk 1 angekommen','verräumt'],done:[3],f:[['ref','Wagen und Inhalt','t'],['bereich','Bereich','s',['Pumu','KST']],['ziel','Ziel','s',['Lager Werk 1','Auftrag','Säge','Vorkommissionierung','Montage']]],cols:['ref','bereich','ziel']},
 wv:{t:'Werksverkehr',k:'Fahrten zwischen den Werken',st:['geplant','unterwegs','erledigt'],done:[2],f:[['ref','Fahrt oder Auftrag','t'],['fz','Fahrzeug','s',['Zugmaschine','Pappamobil','Stapler Werksverkehr']],['route','Strecke','s',['Werk 2 nach Werk 1','Werk 1 nach Werk 2','intern Werk 1','intern Werk 2']]],cols:['ref','fz','route'],hint:'Der Stapler im Wareneingang (Werk 2) gehört immer zum Wareneingang. Probleme damit an den Wareneingang melden.'},
 tb:{t:'TB-Wagen und TB-Kiste',k:'Kisten und Wagen',st:['gefüllt','bereitgestellt','geleert'],done:[2],f:[['ref','Wagen oder Kiste (Nummer)','t'],['inh','Inhalt','t']],cols:['ref','inh']},
 vork:{t:'Vorkommissionierung',k:'Aufträge im Bereich',st:['offen','in Arbeit','bereitgestellt','abgeholt'],done:[3],f:[['ref','Auftragsnummer (7 Ziffern)','a'],['bereich','Ziel','s',['Werk 1','Werk 2','Montage','Lack']]],cols:['ref','bereich']},
 auf:{t:'Aufträge und Produktionsweg',k:'Weg durch die Produktion',st:['Wareneingang','Säge','Vorkommissionierung','Werk 1','Werk 2','Ausschleusung','Versand','erledigt'],done:[7],f:[['ref','Auftragsnummer (7 Ziffern)','a'],['kunde','Kunde','t']],cols:['ref','kunde'],track:1},
 qs:{t:'QS und Störmeldungen',k:'Störungen, Fehlteile, Ausschuss',st:['gemeldet','in Bearbeitung','behoben'],done:[2],f:[['bereich','Bereich','s',['Wareneingang','Säge','Vorkommissionierung','Werk 1','Werk 2','Werksverkehr']],['art','Art','s',['Störung','Fehlteil','Ausschuss','Neuanlage','Nacharbeit']],['txt','Beschreibung','t'],['min','Dauer in Minuten','n']],cols:['bereich','art','txt','min']},
 mas:{t:'Maschinen und Wartung',k:'Wartungen und Prüfungen',st:['geplant','erledigt'],done:[1],f:[['ref','Maschine oder Gerät','t'],['art','Wartung oder Prüfung','t'],['faellig','Fällig am','d']],cols:['ref','art','faellig'],hint:'Prüfnachweise (UVV Stapler, Regale, Leitern, Anschlagmittel) beginnen bei null. Alte Belege bei Bedarf heraussuchen und hier eintragen.'},
 aud:{t:'Audits',k:'Rundgänge und Prüfungen',st:['geplant','durchgeführt','Maßnahmen offen','abgeschlossen'],done:[3],f:[['ref','Audit','t'],['bereich','Bereich','t'],['datum','Datum','d']],cols:['ref','bereich','datum']},
 gespr:{t:'Personalgespräche',k:'Nur Teamleitung',st:['geplant','geführt','nachverfolgen','abgeschlossen'],done:[3],f:[['ref','Mitarbeiter','s',CREW.map(function(c){return c.n})],['thema','Thema','t'],['datum','Datum','d']],cols:['ref','thema','datum']}};
function regOpen(k){return S.reg[k].filter(function(e){return REG[k].done.indexOf(e.st)<0}).length}
function regRow(k,e,c){var v=e[c];if(k==='wep'){if(c==='umfang'&&v){var p=parseInt(v,10)||0;return esc(v)+' <span class="dim">('+Math.ceil((e.menge||0)*p/100)+' Stk)</span>'}if(c==='dauer')return v?esc(v)+' min':'–'}if(c==='faellig'||c==='datum')return v?fmtD(v,{day:'2-digit',month:'2-digit',year:'numeric'}):'–';return esc(v==null||v===''?'–':v)}

/* ===== 5S ===== */
var S5ST=['UNGEPRÜFT','STABIL','MASSNAHME','DRINGEND','ÜBERFÄLLIG'],S5T={'UNGEPRÜFT':'','STABIL':'ok','MASSNAHME':'warn','DRINGEND':'crit','ÜBERFÄLLIG':'vio'};
function s5Open(){return S.s5.items.filter(function(i){return i.st==='MASSNAHME'||i.st==='DRINGEND'||i.st==='ÜBERFÄLLIG'}).length}

/* ===== Warnlage ===== */
function alerts(now){var out=[],fs=fachStat(),t=todayIso();
 if(fs.l)out.push({tone:'vio',t:fs.l+' Langlieger über 10 Tage',go:'fach'});
 var mo=mkOverdue(now);if(mo)out.push({tone:'crit',t:mo+' Milkrun-Runde(n) überfällig oder eskaliert',go:'milk'});
 var qo=regOpen('qs');if(qo)out.push({tone:'warn',t:qo+' offene Störmeldung(en)',go:'qs'});
 var so=s5Open();if(so)out.push({tone:'warn',t:so+' 5S-Punkte mit Handlungsbedarf',go:'s5'});
 var vc=vconfAll();if(vc.length)out.push({tone:'crit',t:'Krank und Urlaub/FZA gleichzeitig: '+vc.join(', '),go:'urlaub'});var pend=S.vacs.filter(function(v){return v.st==='beantragt'}).length;if(pend)out.push({tone:'ice',t:pend+' Urlaubsantrag/-anträge warten auf Freigabe',go:'urlaub'});
 var mm=regOpen('mas'),od=S.reg.mas.filter(function(e){return e.st===0&&e.faellig&&e.faellig<t}).length;if(od)out.push({tone:'crit',t:od+' Wartung(en) überfällig',go:'mas'});
 if(isWork(t)){var p=presentOn(t).length;if(p<MIN_STAFF)out.push({tone:'crit',t:'Besetzung '+p+' von '+CREW.length+' · Minimum '+MIN_STAFF,go:'urlaub'})}
 return out}
function badges(now){var b={},fs=fachStat();if(fs.l)b.fach=[fs.l,0];var mo=mkOverdue(now);if(mo)b.milk=[mo,0];var q=regOpen('qs');if(q)b.qs=[q,1];var p=S.vacs.filter(function(v){return v.st==='beantragt'}).length;if(p)b.urlaub=[p,1];var s=s5Open();if(s)b.s5=[s,1];
 var od=S.reg.mas.filter(function(e){return e.st===0&&e.faellig&&e.faellig<todayIso()}).length;if(od)b.mas=[od,0];return b}

/* ===== Diagramme ===== */
function spark(vals,o){o=o||{};var w=o.w||160,h=o.h||40,c=o.c||'#FF761B';if(!vals.length)return '';var mx=Math.max.apply(null,vals.concat([1])),mn=Math.min.apply(null,vals.concat([0])),r=mx-mn||1,n=vals.length,
 X=function(i){return n>1?3+i/(n-1)*(w-6):w/2},Y=function(v){return h-4-(v-mn)/r*(h-10)},d='';vals.forEach(function(v,i){d+=(i?'L':'M')+X(i).toFixed(1)+','+Y(v).toFixed(1)});
 return '<svg viewBox="0 0 '+w+' '+h+'" width="100%" height="'+h+'" preserveAspectRatio="none" aria-hidden="true"><path d="'+d+'L'+X(n-1).toFixed(1)+','+(h-2)+'L'+X(0).toFixed(1)+','+(h-2)+'Z" fill="'+c+'" opacity=".14"/><path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="1.8" vector-effect="non-scaling-stroke" stroke-linejoin="round"/><circle cx="'+X(n-1).toFixed(1)+'" cy="'+Y(vals[n-1]).toFixed(1)+'" r="3" fill="#fff"/></svg>'}
function ring(p,o){o=o||{};var s=o.s||110,r=s/2-8,c=2*Math.PI*r,col=o.c||'#FF761B';
 return '<div style="position:relative;width:'+s+'px;height:'+s+'px;margin:0 auto"><svg viewBox="0 0 '+s+' '+s+'" width="'+s+'" height="'+s+'" style="transform:rotate(-90deg)" aria-hidden="true"><circle cx="'+s/2+'" cy="'+s/2+'" r="'+r+'" fill="none" stroke="rgba(241,211,184,.16)" stroke-width="6"/><circle cx="'+s/2+'" cy="'+s/2+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+(c*Math.max(0,Math.min(1,p/100))).toFixed(1)+' '+c.toFixed(1)+'" style="filter:drop-shadow(0 0 5px '+col+')"/></svg><div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><b class="hud" style="font-size:'+Math.round(s*.27)+'px;line-height:1;font-weight:600">'+esc(o.v)+'</b>'+(o.u?'<span class="mono dim" style="font-size:10px">'+esc(o.u)+'</span>':'')+'</div></div><div class="lab" style="text-align:center;margin-top:8px">'+esc(o.l||'')+'</div>'}
function pn(title,body,o){o=o||{};return '<section class="sec '+(o.c||'')+'"'+(o.id?' id="'+o.id+'"':'')+'><div class="sh"><span>'+title+'</span><i></i>'+(o.r||'')+'</div>'+body+'</section>'}
function sec(t,body,o){o=o||{};return '<section class="sec"><div class="sh"><span>'+t+'</span><i></i>'+(o.r||'')+'</div>'+body+'</section>'}
function head(k,t,r){return '<div class="vh"><div><div class="k">'+esc(k)+'</div><h1>'+esc(t)+'</h1></div><div class="ra">'+(r||'')+'</div></div>'}
function demoChip(){return S.demo?chip('or','Beispieldaten'):''}

