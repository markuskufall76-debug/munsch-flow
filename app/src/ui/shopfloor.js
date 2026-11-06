/* ===== Shopfloor 06:45 · gemeinsame Runde =====
   Datenmodell unverändert aus Flow 5, damit bisherige Runden, Maßnahmen, Termine und Sicherheitstage erhalten bleiben:
   S.runde[Tag] = {t0, open, fin, mod, who:{Name:ts}, <Folie>:{ok, amp, note}, themen:{note}}
   S.mass = [{id, src, txt, wer, bis, done}]   S.zust[Folie] = {m, v, s:{d, n}}
   S.term[id] = {id, d, t, by}                 S.sich[Tag] = {t:'ok'|'bei'|'unf', txt, by, ts} */
(function(){
'use strict';
var M=window.MF,cp=M.cp,card=M.card,ic=M.ic;
delete M.LATER.runde;
var AMP={g:['Läuft','ok'],y:['Achtung','warn'],r:['Problem','crit']};
var MN=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
var SYM={ok:'Unfallfrei',bei:'Beinaheunfall',unf:'Unfall'};
var MODS=['M. Thiel','D. Krämer','S. Schwan'];
function cnt(k,st){return (S.reg[k]||[]).filter(function(e){return e.st===st}).length}
function cb(k,st,b){return (S.reg[k]||[]).filter(function(e){return e.st===st&&(e.bereich||'Pumu')===b}).length}
function ob(k,b){var R=REG[k],n=Date.now();return (S.reg[k]||[]).filter(function(e){return R.done.indexOf(e.st)<0&&n-e.ts>864e5&&(!b||(e.bereich||'Pumu')===b)}).length}
function tod(k,st){var t=todayIso();return (S.reg[k]||[]).filter(function(e){return e.st===st&&iso(new Date(e.tst||e.ts))===t}).length}
function mkN(){var d=mkDay(todayIso());return Object.keys(d).filter(function(k){return d[k].e}).length}
var SL=[
 {id:'open',t:'Eröffnung',ty:'open'},{id:'anw',t:'Anwesenheit',ty:'anw'},{id:'ter',t:'Termine',ty:'ter'},{id:'sich',t:'Arbeitssicherheit',s:'Sicherheit',ty:'sich'},
 {id:'we',t:'Wareneingang',ty:'dep',P:[{h:'Wareneingang',k:['we_pak','we_gbpal','we_metall','we_kunst','we_sonst']},{h:'Materialwagen laut Tageszahlen',k:['mw_rueck','mw_gel','mw_ver']}],X:function(){return [{h:'Live',F:[['Lieferungen offen',regOpen('we'),1],['Materialwagen Pumu unterwegs',cb('mw',1,'Pumu'),1],['Pumu in Werk 1 angekommen',cb('mw',2,'Pumu')],['KST wartet im Wareneingang',cb('mw',0,'KST')],['Länger als 1 Tag offen',ob('mw')]]}]}},
 /* Metall und Kunststoff haben verschiedene Zuständige: zwei Folien. 'saw' bleibt die Kennung der Metallsäge,
    damit bisherige Zuständigkeit und Maßnahmen erhalten bleiben. */
 {id:'saw',t:'Säge Metall',s:'Metallsäge',ty:'dep',P:[{h:'Säge Metall',k:['ms_rueck','ms_plan','ms_ist','ms_schn'],saw:'ms'}]},
 {id:'sawk',t:'Säge Kunststoff',s:'Kunststoffsäge',ty:'dep',P:[{h:'Säge Kunststoff',k:['ks_rueck','ks_plan','ks_ist','ks_schn'],saw:'ks'}]},
 {id:'w2',t:'Werk 2',ty:'dep',P:[{h:'Werk 2',k:['st_w2']}],X:function(){return [{h:'Live',F:[['Materialwagen Pumu unterwegs nach Werk 1',cb('mw',1,'Pumu'),1]]}]}},
 {id:'w1',t:'Werk 1, Vorkommissionierung und Milkrun',s:'Werk 1',ty:'dep',P:[{h:'Werk 1',k:['lack_rueck','lack_hp','lack_vp','mont_rueck','mont_hp','mont_vp','gp_rueck','gp_gebohrt','st_w1allg','st_w1komm']},{h:'Vorkommissionierung',k:['st_saege','st_we','st_sonst']},{h:'Milkrun',k:['milkrun','kisten']}],X:function(){return [{h:'Live',F:[['Aufträge offen in der Vorkommissionierung',regOpen('vork'),1],['Milkrun-Runden heute',mkN()+'/10',1]]}]}},
 {id:'wep',t:'Wareneingangsprüfung',s:'WEP',ty:'dep',P:[{h:'Prüfung',k:['wep_si','wep_sonst']}],X:function(){return [{h:'Live',F:[['Prüfungen offen',regOpen('wep'),1],['Gesperrt',cnt('wep',3)],['Heute freigegeben',tod('wep',2)]]}]}},
 {id:'wv',t:'Werksverkehr',ty:'dep',P:[],X:function(){return [{h:'TB-Wagen ins Technische Büro',F:[['Gefüllt, abholbereit',cnt('tb',0),1],['Im TB bereitgestellt',cnt('tb',1)],['Heute geleert',tod('tb',2)],['Länger als 1 Tag offen',ob('tb')]]},{h:'Fahrten zwischen den Werken',F:[['Geplant',cnt('wv',0)],['Unterwegs',cnt('wv',1),1],['Heute erledigt',tod('wv',2)]]}]}},
 {id:'s5',t:'5S',ty:'dep',P:[],X:function(){return [{h:'Stand der 5S-Punkte',F:S5ST.map(function(x){return [x,S.s5.items.filter(function(i){return i.st===x}).length]})}]}},
 {id:'abs',t:'Abschluss',ty:'abs'}];
var DEPS=SL.filter(function(x){return x.ty==='dep'}).map(function(x){return x.id});
function rDay(){var t=todayIso();S.runde[t]=S.runde[t]||{};return S.runde[t]}
function who(rd){if(!rd.who||typeof rd.who!=='object')rd.who={};return rd.who}
function away(n,t){return isWork(t)&&CREW.some(function(c){return c.n===n})&&presentOn(t).indexOf(n)<0}
window.sfMod=function(t){t=t||todayIso();return modOf((S.runde||{})[t]||{},t)};
function modOf(rd,t){if(rd.mod&&MODS.indexOf(rd.mod)>=0)return rd.mod;for(var i=0;i<MODS.length;i++)if(!away(MODS[i],t))return MODS[i];return MODS[0]}
function pres(id,t){var z=(S.zust||{})[id]||{},m=z.m||'',v=z.v||'',x=(z.s&&z.s.d===t)?z.s.n:'';if(!m&&!v&&!x)return {n:''};if(m&&!away(m,t))return {n:m};if(x&&!away(x,t))return {n:x,sub:1,for:m||v};if(v&&!away(v,t))return {n:v,sub:m?1:0,for:m};return {n:'',miss:1,for:m||v}}
window._presToday=function(t){t=t||todayIso();return DEPS.map(function(id){var p=pres(id,t),x=SL.filter(function(s){return s.id===id})[0];return {id:id,t:x.s||x.t,n:p.n,miss:!!p.miss}})};
function dd(d){return d.slice(8)+'.'+d.slice(5,7)+'.'}
function mon(d){var x=new Date(d+'T12:00:00');return addDays(d,-((x.getDay()+6)%7))}
function kw(d){var x=new Date(d+'T12:00:00');x.setDate(x.getDate()+3-((x.getDay()+6)%7));var w=new Date(x.getFullYear(),0,4);return 1+Math.round(((x-w)/864e5-3+((w.getDay()+6)%7))/7)}
function SI(){if(!S.sich||typeof S.sich!=='object')S.sich={};return S.sich}
function okN(rd){var n=0;SL.forEach(function(x){if(rd[x.id]&&rd[x.id].ok)n++});return n}
function av(n,c){return '<span class="sf-av'+(c?' '+c:'')+'" title="'+esc(n)+'">'+esc(M.initials(n))+'</span>'}

/* ---------- Folien ---------- */
function sOpen(t,rd){var h=new Date().getHours(),pr=presentOn(t).length;
 return '<div class="sf-open"><div class="sf-lg">'+logoSVG({h:72})+'</div><h2 class="sf-g">'+(h<11?'Guten Morgen':h<17?'Hallo':'Guten Abend')+', <em>Team.</em></h2><div class="sf-meta">Shopfloor 06:45 · '+esc(fmtD(t,{weekday:'long',day:'numeric',month:'long'}))+' · KW '+kw(t)+'</div><div class="sf-mod">Es moderiert '+av(modOf(rd,t))+' <b>'+esc(modOf(rd,t))+'</b></div><p class="lead">'+(isWork(t)?pr+' von '+CREW.length+' im Dienst. ':'')+'Sicherheit zuerst, dann der Rest.</p>'
  +(rd.t0?'<button class="btn xl" data-act="rpi" data-i="1">Weiter zur Anwesenheit</button>':'<button class="btn pri xl" data-act="rstart">Shopfloor eröffnen</button>')+'</div>'}
function sAnw(t){var w=isWork(t),pr=presentOn(t),ab=absentOn(t),nx=nextWork(t),abn=absentOn(nx),W=who(rDay()),low=w&&pr.length<MIN_STAFF;
 var cards=CREW.map(function(c){var v=ab.filter(function(x){return x.emp===c.n})[0],here=w&&!v;return '<div class="sf-pc'+(here?'':' off')+(W[c.n]?' dabei':'')+'">'+av(c.n,'big')+'<b>'+esc(c.n)+'</b><span>'+(!w?'frei':here?'im Dienst':esc(v.type)+' bis '+dd(v.d1))+'</span></div>'}).join('');
 return '<div class="sf-two"><div class="sf-col"><div class="sf-big'+(low?' crit':'')+'"><b>'+(w?pr.length:'–')+'</b><span>von '+CREW.length+'<br>im Dienst</span></div><div class="sf-mbar"><i style="width:'+(w?pr.length/CREW.length*100:0)+'%"></i><u style="left:'+(MIN_STAFF/CREW.length*100)+'%" title="Minimum '+MIN_STAFF+'"></u></div><div class="dim">Minimum '+MIN_STAFF+(low?' · <b style="color:var(--crit)">unterbesetzt</b>':'')+'</div>'
  +'<div class="sf-nx"><span>Fehlt am nächsten Arbeitstag, '+fmtD(nx,{weekday:'short',day:'2-digit',month:'2-digit'})+'</span><b>'+(abn.map(function(v){return esc(v.emp)}).join(', ')||'niemand')+'</b></div>'
  +'<button class="btn'+(W[S.user]?'':' pri')+'" data-act="rdab">'+(W[S.user]?'Ich bin nicht mehr dabei':'Ich bin dabei')+'</button><div class="dim">In der Runde: '+Object.keys(W).length+'</div></div><div class="sf-pg">'+cards+'</div></div>'}
function sTer(t){S.term=S.term||{};var wk=[mon(t),addDays(mon(t),7)].map(function(m,wi){var days='';for(var k=0;k<5;k++){var d=addDays(m,k),ev=Object.keys(S.term).map(function(i){return S.term[i]}).filter(function(x){return x&&x.d===d}),ab=absentOn(d),hol=HOL.has(d);
  days+='<div class="sf-dy'+(d===t?' today':'')+(hol?' hol':'')+'"><div class="sf-dh"><b>'+fmtD(d,{weekday:'short'})+'</b><span>'+dd(d)+'</span></div>'+(hol?'<div class="sf-ev h">Feiertag</div>':'')+ev.map(function(x){return '<div class="sf-ev"><span>'+esc(x.t)+'</span><button data-act="rtdel" data-id="'+x.id+'" aria-label="Termin löschen">×</button></div>'}).join('')+(ab.length?'<div class="sf-ab">'+ab.map(function(v){return av(v.emp)}).join('')+'</div>':'')+'</div>'}
  return '<div class="sf-wk"><div class="sf-lbl">'+(wi?'Folgewoche':'Diese Woche')+' · KW '+kw(m)+'</div><div class="sf-dg">'+days+'</div></div>'}).join('');
 return wk+'<div class="frm" style="margin-top:16px"><label class="fl">Datum<input class="in" type="date" id="td" value="'+t+'"></label><label class="fl w2">Neuer Termin<input class="in" id="tt" data-ent="rtadd" placeholder="z. B. Audit, Lieferantenbesuch, Unterweisung"></label><button class="btn pri" data-act="rtadd" style="height:46px">Eintragen</button></div>'}
function sichCnt(pre){var o={ok:0,bei:0,unf:0},I=SI();Object.keys(I).forEach(function(k){if(k.indexOf(pre)===0&&I[k]&&o[I[k].t]!=null)o[I[k].t]++});return o}
function sSich(t){var I=SI(),vm=S.ui.sm||t.slice(0,7),y=+vm.slice(0,4),m=+vm.slice(5,7)-1,sd=S.ui.sd||t,c=sichCnt(vm),last=null;
 Object.keys(I).forEach(function(k){if(I[k]&&I[k].t==='unf'&&k<=t&&(!last||k>last))last=k});var first=Object.keys(I).sort()[0];
 var days=last?Math.round((new Date(t+'T12:00:00')-new Date(last+'T12:00:00'))/864e5):first?Math.round((new Date(t+'T12:00:00')-new Date(first+'T12:00:00'))/864e5):null;
 var st='<div class="sf-st4"><div><b>'+(days==null?'–':days)+'</b><span>Tage '+(last?'seit dem letzten Unfall':'ohne Unfall erfasst')+'</span></div><div class="ok"><b>'+c.ok+'</b><span>unfallfrei · '+MN[m]+'</span></div><div class="warn"><b>'+c.bei+'</b><span>Beinaheunfälle</span></div><div class="crit"><b>'+c.unf+'</b><span>Unfälle</span></div></div>';
 var f1=new Date(y,m,1),off=(f1.getDay()+6)%7,nd=new Date(y,m+1,0).getDate(),cells='';for(var q=0;q<off;q++)cells+='<i></i>';
 for(var d=1;d<=nd;d++){var k=vm+'-'+('0'+d).slice(-2),e=I[k],w=isWork(k);cells+='<button class="sf-dc'+(k===t?' today':'')+(k===sd?' sel':'')+(!w?' nw':'')+(e?' '+e.t:'')+'" data-act="rsd" data-d="'+k+'" title="'+(e?esc(SYM[e.t]+(e.txt?': '+e.txt:'')):'')+'">'+d+'</button>'}
 var cur=I[sd],dr=S.ui.sdt,need=dr==='bei'||dr==='unf'||(cur&&cur.t!=='ok'&&!dr);
 var ed='<div class="sf-ed"><div class="sf-lbl">'+fmtD(sd,{weekday:'long',day:'2-digit',month:'long'})+'</div><div class="sf-sb">'+['ok','bei','unf'].map(function(k){return '<button class="sf-sbn '+k+((cur&&cur.t===k&&!dr)||dr===k?' on':'')+'" data-act="rss" data-v="'+k+'"><i></i>'+SYM[k]+'</button>'}).join('')+'</div>'
  +(need?'<label class="fl">Kurze Beschreibung<textarea class="in" id="sx" placeholder="Was ist passiert? Wo? Wer war beteiligt? Was wurde getan?">'+esc(cur&&cur.t===(dr||cur.t)?cur.txt||'':'')+'</textarea></label><button class="btn pri" data-act="rssv">Speichern</button>':'')+(cur?'<button class="btn ghost sm" data-act="rsx">Eintrag löschen</button>':'')+'</div>';
 return st+'<div class="sf-two"><div><div class="sf-mh"><button class="btn sm" data-act="rsmv" data-n="-1" aria-label="Vormonat">‹</button><b>'+MN[m]+' '+y+'</b><button class="btn sm" data-act="rsmv" data-n="1" aria-label="Folgemonat">›</button><span style="flex:1"></span><button class="btn sm" data-act="rsall">Offene Arbeitstage unfallfrei</button></div><div class="sf-cal"><b>Mo</b><b>Di</b><b>Mi</b><b>Do</b><b>Fr</b><b>Sa</b><b>So</b>'+cells+'</div></div>'+ed+'</div>'}
function groups(p,t){var w=isWork(t),vd=tzLatest(w?prevWork(t):t),pv=vd?tzLatest(addDays(vd,-1)):null,G=[];
 p.P.forEach(function(P){var F=P.k.map(function(k){var a=(S.tz[vd]||{})[k],b=pv?(S.tz[pv]||{})[k]:null;return [TZFIELDS[k].split(' · ')[1],a==null?'–':a,0,a!=null&&b!=null?a-b:null]});
  if(P.saw){var pl=(S.tz[t]||{})[P.saw+'_plan'],ru=((S.tz[prevWork(t)]||{})[P.saw+'_rueck'])||0;F.push(['Tagesziel heute',pl==null?'–':pl+ru,1,null,pl==null?'Plan heute noch nicht erfasst':pl+' geplant + '+ru+' Rückstand'])}
  G.push({h:P.h,F:F})});
 if(p.X)p.X().forEach(function(g){G.push({h:g.h,F:g.F.filter(function(f){return !(/Länger als/.test(f[0])&&!f[1])})})});
 return {G:G,vd:vd}}
function sDep(p,t,rd){var r=rd[p.id]||{},ms=S.mass.filter(function(m){return m.src===p.id}),g=groups(p,t);
 var tiles=g.G.map(function(x){return '<div class="sf-lbl">'+esc(x.h)+'</div><div class="sf-f">'+x.F.map(function(f){var d=f[3];return '<div class="sf-t'+(f[2]?' hot':'')+'"><span>'+esc(f[0])+'</span><b>'+f[1]+'</b>'+(d!=null?'<em class="'+(d>0?'up':d<0?'dn':'')+'">'+(d>0?'▲ +'+d:d<0?'▼ '+d:'= 0')+' zum Vortag</em>':'')+(f[4]?'<em>'+esc(f[4])+'</em>':'')+'</div>'}).join('')+'</div>'}).join('');
 var amp=Object.keys(AMP).map(function(k){return '<button class="sf-a '+AMP[k][1]+(r.amp===k?' on':'')+'" data-act="ramp" data-i="'+p.id+'" data-v="'+k+'"><i></i>'+AMP[k][0]+'</button>'}).join('');
 return '<div class="sf-two"><div>'+tiles+'<div class="sf-src'+(g.vd?'':' warn')+'">'+(g.vd?'Zahlen vom '+fmtD(g.vd,{weekday:'short',day:'2-digit',month:'2-digit'}):'Keine Vortageszahlen erfasst')+'</div></div>'
  +'<div class="sf-side"><div class="sf-card"><div class="sf-lbl">Lage im Bereich</div><div class="sf-amp">'+amp+'</div></div>'
  +'<div class="sf-card"><label class="fl">Notiz<textarea class="in" id="rn" data-in="rnote" data-i="'+p.id+'" placeholder="Was läuft, was klemmt?">'+esc(r.note||'')+'</textarea></label></div>'
  +'<div class="sf-card"><div class="sf-lbl">Maßnahmen</div>'+(ms.length?ms.map(function(m){return '<label class="sf-m'+(m.done?' done':'')+'"><input type="checkbox" '+(m.done?'checked':'')+' data-act="mdone" data-id="'+m.id+'"><span>'+esc(m.txt)+'</span><b>'+esc(m.wer)+' · '+dd(m.bis)+'</b></label>'}).join(''):'<p class="dim" style="margin:2px 0 10px">Keine. Wer etwas sieht, trägt es ein.</p>')
  +'<div class="frm"><label class="fl w2">Neu<input class="in" id="mt" data-ent="addm" data-i="'+p.id+'" placeholder="Was ist zu tun?"></label><label class="fl">Wer<select class="in" id="mw2">'+CREW.map(function(c){return '<option'+(c.n===S.user?' selected':'')+'>'+esc(c.n)+'</option>'}).join('')+'</select></label><label class="fl">Bis<input class="in" type="date" id="mb2" value="'+addDays(t,3)+'"></label><button class="btn" data-act="addm" data-i="'+p.id+'" style="height:46px">Hinzufügen</button></div></div></div></div>'}
function sAbs(t,rd){var open=S.mass.filter(function(m){return !m.done});
 var g=SL.filter(function(x){return x.ty==='dep'}).map(function(p){var r=rd[p.id]||{};return '<button class="sf-ds'+(r.ok?' ok':'')+'" data-act="rpi" data-i="'+SL.indexOf(p)+'"><i class="'+(r.amp?AMP[r.amp][1]:'')+'"></i><b>'+esc(p.s||p.t)+'</b><span>'+esc(pres(p.id,t).n||'ohne Vortrag')+'</span><small>'+(r.ok?'besprochen':'offen')+'</small></button>'}).join('');
 return '<div class="sf-two"><div><div class="sf-lbl">Bereiche</div><div class="sf-dsg">'+g+'</div><div class="sf-lbl" style="margin-top:22px">Offene Maßnahmen · '+open.length+'</div>'+(open.length?open.slice(0,12).map(function(m){var s=SL.filter(function(x){return x.id===m.src})[0];return '<label class="sf-m"><input type="checkbox" data-act="mdone" data-id="'+m.id+'"><span>'+esc(m.txt)+'</span><b>'+esc(s?(s.s||s.t):'')+' · '+esc(m.wer)+' · '+dd(m.bis)+'</b></label>'}).join(''):'<p class="dim">Keine offenen Maßnahmen.</p>')+'</div>'
  +'<div class="sf-side"><div class="sf-card"><label class="fl">Weitere Themen<textarea class="in" id="rn" data-in="rnote" data-i="themen" placeholder="Was soll noch besprochen werden?">'+esc((rd.themen||{}).note||'')+'</textarea></label></div><div class="sf-card"><div class="sf-big sm"><b>'+okN(rd)+'</b><span>von '+SL.length+'<br>Folien besprochen</span></div><button class="btn pri" data-act="rfin" style="width:100%;margin-top:14px">Runde abschließen und Protokoll</button></div></div></div>'}
/* Vorschläge für den Vortrag: zuerst wer heute laut Schichtplan im Bereich ist, dann wer ihn laut Qualifikation sicher kann */
var BEREICH={we:['Wareneingang','Wareneingang'],saw:['Säge Metall','Säge Metall'],sawk:['Säge Kunststoff','Säge Kunststoff'],w2:['Werk 2',''],w1:['Werk 1','Vorkommissionierung'],wep:['WEP','WEP'],wv:['Werksverkehr','Werksverkehr'],s5:['','']};
function sugg(id,t,z){var b=BEREICH[id]||['',''],here=presentOn(t).filter(function(n){return n!==z.m&&n!==z.v}),plan=(S.plan[t]||{}),out=[];
 var byPlan=here.filter(function(n){return b[0]&&plan[n]===b[0]});
 var byQ=here.filter(function(n){return b[1]&&((S.quali[n]||{})[b[1]]||0)>=2&&byPlan.indexOf(n)<0}).sort(function(x,y){return ((S.quali[y]||{})[b[1]]||0)-((S.quali[x]||{})[b[1]]||0)});
 out=byPlan.concat(byQ).slice(0,3);out.why=byPlan.length?'laut Schichtplan heute in '+b[0]:byQ.length?'laut Qualifikation sicher in '+b[1]:'';
 if(!out.length){out=here.filter(function(n){return MODS.indexOf(n)<0}).slice(0,3);out.why='im Dienst'}
 return out}
function pbox(id,t){var p=pres(id,t),z=(S.zust||{})[id]||{},opt=function(sel){return '<option value="">–</option>'+CREW.map(function(c){return '<option'+(c.n===sel?' selected':'')+'>'+esc(c.n)+'</option>'}).join('')};
 var sug=sugg(id,t,z);
 return '<div class="sf-pb'+(p.miss?' miss':'')+'">'+(p.n?av(p.n,'big')+'<div><small>'+(p.sub?'Vertretung für '+esc(p.for):'Vortrag')+'</small><b>'+esc(p.n)+'</b></div>':'<div><small>Vortrag</small><b>'+(p.miss?esc(p.for)+' fehlt heute':'noch niemand festgelegt')+'</b>'+(sug.length?'<div class="sf-sug"><small class="dim" style="width:100%">'+(sug.why||'Vorschlag')+'</small>'+sug.map(function(n){return '<button class="btn sm" data-act="rzu" data-i="'+id+'" data-n="'+esc(n)+'">'+esc(n)+'</button>'}).join('')+'</div>':'')+'</div>')
  +(isLead()?'<details class="sf-zd"><summary>Zuständigkeit</summary><label class="fl">Vortragende Person<select class="in" data-in="rzm" data-i="'+id+'">'+opt(z.m)+'</select></label><label class="fl">Vertretung<select class="in" data-in="rzv" data-i="'+id+'">'+opt(z.v)+'</select></label></details>':'')+'</div>'}
function path(rd,cur){var n=okN(rd);return '<div class="sf-path" style="--cols:'+SL.length+';--p:'+(n/(SL.length-1)).toFixed(3)+'"><div class="sf-line"><i></i></div>'+SL.map(function(x,j){var r=rd[x.id]||{};return '<button class="sf-n'+(r.ok?' ok':'')+(j===cur?' cur':'')+(r.amp?' '+AMP[r.amp][1]:'')+'" data-act="rpi" data-i="'+j+'"><b>'+(r.ok?'✓':j+1)+'</b><span>'+esc(x.s||x.t)+'</span></button>'}).join('')+'</div>'}
var lastI=-1;
VIEW.runde=function(){var t=todayIso(),rd=rDay(),i=Math.max(0,Math.min(S.ui.rp||0,SL.length-1)),p=SL[i],mo=modOf(rd,t),anim=i!==lastI,r=rd[p.id]||{};lastI=i;
 var body=p.ty==='open'?sOpen(t,rd):p.ty==='anw'?sAnw(t):p.ty==='ter'?sTer(t):p.ty==='sich'?sSich(t):p.ty==='abs'?sAbs(t,rd):sDep(p,t,rd);
 var el=rd.t0&&!rd.fin?Math.floor((Date.now()-rd.t0)/1e3):0;
 var bar='<div class="sf-bar"><button class="btn" data-act="rpi" data-i="'+Math.max(0,i-1)+'"'+(i?'':' disabled')+'>‹ Zurück</button><div class="sf-ctr"><span class="sf-clk mono'+(el>1200?' late':'')+'" id="rtm" data-t0="'+(rd.t0&&!rd.fin?rd.t0:0)+'">'+(rd.fin?'fertig':rd.t0?('0'+Math.floor(el/60)).slice(-2)+':'+('0'+el%60).slice(-2):'–:–')+'</span><span class="sf-mo">'+av(mo)+'<select class="in" data-in="rmod" aria-label="Moderation"><option value="">Moderation: '+esc(mo)+'</option>'+MODS.filter(function(n){return n!==mo}).map(function(n){return '<option>'+esc(n)+'</option>'}).join('')+'</select></span><button class="btn sm ghost" data-act="rpm">'+(S.ui.rpm?'Normalansicht':'Großer Monitor')+'</button></div>'
  +(i<SL.length-1&&p.ty!=='open'?'<button class="btn'+(r.ok?'':' pri')+'" data-act="rnext" data-i="'+i+'">'+(r.ok?'Weiter ›':'Besprochen, weiter ›')+'</button>':'<span></span>')+'</div>';
 return '<div class="sf">'+path(rd,i)+'<section class="sf-stage'+(anim?' sf-in':'')+'">'+(p.ty==='open'?'':'<div class="sf-th"><div><div class="sf-no">'+i+' von '+(SL.length-1)+'</div><h2>'+esc(p.t)+'</h2></div>'+(p.ty==='dep'?pbox(p.id,t):'')+'</div>')+body+'</section>'+bar+'</div>'};

/* ---------- Aktionen ---------- */
ACT.rpi=function(d){S.ui.rp=+d.i;save();render()};
ACT.rstart=function(){var rd=rDay();if(!rd.t0)rd.t0=Date.now();rd.open={by:S.user,ts:Date.now(),ok:true};S.ui.rp=1;logA('Shopfloor 06:45 eröffnet');save();render();toast('Shopfloor 06:45 ist eröffnet')};
ACT.rnext=function(d){var i=+d.i,p=SL[i],rd=rDay(),r=rd[p.id]=rd[p.id]||{};if(!rd.t0)rd.t0=Date.now();var was=r.ok;r.ok=true;S.ui.rp=Math.min(SL.length-1,i+1);save();render();if(!was&&okN(rd)>=SL.length-1)toast('Alle Folien besprochen')};
ACT.ramp=function(d){var r=rDay();r[d.i]=r[d.i]||{};r[d.i].amp=r[d.i].amp===d.v?'':d.v;save();render();if(r[d.i].amp==='r'){toast('Problem gemeldet. Bitte eine Maßnahme eintragen.');setTimeout(function(){var m=$('#mt');if(m)m.focus()},250)}};
ACT.rdab=function(){var W=who(rDay());if(W[S.user])delete W[S.user];else W[S.user]=Date.now();save();render()};
ACT.rzu=function(d){S.zust=S.zust||{};(S.zust[d.i]=S.zust[d.i]||{}).s={d:todayIso(),n:d.n};save();render()};
ACT.addm=function(d){var tx=$('#mt').value.trim();if(!tx)return toast('Bitte die Maßnahme beschreiben');S.mass.push({id:uid(),src:d.i,txt:tx,wer:$('#mw2').value,bis:$('#mb2').value,done:0});logA('Maßnahme: '+tx);save();render()};
ACT.mdone=function(d){S.mass.forEach(function(m){if(m.id===d.id){m.done=m.done?0:1;logA('Maßnahme '+(m.done?'erledigt':'wieder offen')+': '+m.txt)}});save();render()};
ACT.rtadd=function(){var d=$('#td').value,tx=$('#tt').value.trim();if(!d||!tx)return toast('Bitte Datum und Text eintragen');S.term=S.term||{};var id=uid();S.term[id]={id:id,d:d,t:tx,by:S.user};logA('Termin: '+tx);save();render()};
ACT.rtdel=function(d){S.term=S.term||{};delete S.term[d.id];save();render()};
ACT.rsd=function(d){S.ui.sd=d.d;S.ui.sdt='';save();render()};
ACT.rsmv=function(d){var vm=S.ui.sm||todayIso().slice(0,7),x=new Date(+vm.slice(0,4),+vm.slice(5,7)-1+(+d.n),1);S.ui.sm=x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2);S.ui.sd=S.ui.sm===todayIso().slice(0,7)?todayIso():S.ui.sm+'-01';S.ui.sdt='';save();render()};
function sput(k,t,txt){SI()[k]={t:t,txt:txt||'',by:S.user,ts:Date.now()};save()}
ACT.rss=function(d){var k=S.ui.sd||todayIso();if(d.v==='ok'){sput(k,'ok','');S.ui.sdt='';logA('Arbeitssicherheit '+k+': unfallfrei');save();render();toast('Unfallfrei eingetragen')}else{S.ui.sdt=d.v;save();render();setTimeout(function(){var x=$('#sx');if(x)x.focus()},80)}};
ACT.rssv=function(){var k=S.ui.sd||todayIso(),t=S.ui.sdt||(SI()[k]||{}).t,x=(($('#sx')||{}).value||'').trim();if(!t||t==='ok')return;if(!x)return toast('Bitte kurz beschreiben, was passiert ist');sput(k,t,x);S.ui.sdt='';logA('Arbeitssicherheit '+k+': '+SYM[t]);save();render();toast(SYM[t]+' gespeichert')};
ACT.rsx=function(){delete SI()[S.ui.sd||todayIso()];S.ui.sdt='';save();render()};
ACT.rsall=function(){var t=todayIso(),vm=S.ui.sm||t.slice(0,7),I=SI(),n=0,nd=new Date(+vm.slice(0,4),+vm.slice(5,7),0).getDate();for(var d=1;d<=nd;d++){var k=vm+'-'+('0'+d).slice(-2);if(k<=t&&isWork(k)&&!I[k]){I[k]={t:'ok',txt:'',by:S.user,ts:Date.now()};n++}}save();render();toast(n?n+' Arbeitstage als unfallfrei eingetragen':'Alle Arbeitstage sind schon eingetragen')};
ACT.rpm=function(){S.ui.rpm=!S.ui.rpm;save();try{if(S.ui.rpm&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(function(){});else if(!S.ui.rpm&&document.fullscreenElement)document.exitFullscreen()}catch(e){}render()};
ACT.rfin=function(){var t=todayIso(),rd=rDay(),W=who(rd),ab=absentOn(t),sc=SI()[t],L=['SHOPFLOOR 06:45 · '+fmtD(t),'Moderation: '+modOf(rd,t),'Dabei: '+(Object.keys(W).join(', ')||'–'),'Anwesend: '+presentOn(t).length+' von '+CREW.length];
 if(ab.length)L.push('Abwesend: '+ab.map(function(v){return v.emp+' ('+v.type+')'}).join(', '));
 L.push('Arbeitssicherheit heute: '+(sc?SYM[sc.t]+(sc.txt?' · '+sc.txt:''):'nicht eingetragen'));
 SL.filter(function(x){return x.ty==='dep'}).forEach(function(p){var r=rd[p.id]||{},pn=pres(p.id,t).n;L.push('');L.push(p.t+(r.amp?' ['+AMP[r.amp][0]+']':'')+(r.ok?' [besprochen]':'')+(pn?' · '+pn:''));if(r.note)L.push(r.note);S.mass.filter(function(m){return m.src===p.id}).forEach(function(m){L.push(' - Maßnahme: '+m.txt+' ('+m.wer+', bis '+dd(m.bis)+')'+(m.done?' erledigt':''))})});
 if((rd.themen||{}).note){L.push('');L.push('Weitere Themen');L.push(rd.themen.note)}
 var mins=rd.t0?Math.round((Date.now()-rd.t0)/6e4):0;L.push('');L.push('Dauer: '+mins+' Min.');rd.fin=Date.now();logA('Shopfloor 06:45 abgeschlossen');save();render();
 var tx=L.join('\n');window._sfp=tx;modal('<h3>Protokoll</h3><textarea class="in mono" readonly style="min-height:320px;margin-top:14px;font-size:12px">'+esc(tx)+'</textarea><div class="acts"><button class="btn ghost" data-act="mclose">Schließen</button><button class="btn pri" data-act="rcpy">Kopieren</button></div>');toast('Runde abgeschlossen in '+mins+' Min.')};
ACT.rcpy=function(){copyText(window._sfp||'','Protokoll kopiert')};

/* Eingaben ohne Neuzeichnen (Notizen, Auswahlfelder) */
document.addEventListener('input',function(e){var el=e.target,k=el.dataset&&el.dataset.in;if(!k||!/^r(note|zm|zv|mod)$/.test(k))return;var r=rDay();
 if(k==='rnote'){r[el.dataset.i]=r[el.dataset.i]||{};r[el.dataset.i].note=el.value;save()}
 else if(k==='rmod'){if(el.value&&MODS.indexOf(el.value)>=0){r.mod=el.value;save();render()}}
 else{S.zust=S.zust||{};(S.zust[el.dataset.i]=S.zust[el.dataset.i]||{})[k==='rzm'?'m':'v']=el.value;save();render()}});
document.addEventListener('keydown',function(e){if(!window.S||S.ui.page!=='runde'||!$('#stage')||$('#modal')||$('#pal'))return;var tg=e.target&&e.target.tagName;if(/INPUT|TEXTAREA|SELECT/.test(tg))return;
 if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();ACT.rpi({i:Math.min(SL.length-1,(S.ui.rp||0)+1)})}else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();ACT.rpi({i:Math.max(0,(S.ui.rp||0)-1)})}});
setInterval(function(){var e=document.getElementById('rtm');if(!e)return;var t0=+e.getAttribute('data-t0');if(!t0)return;var s=Math.floor((Date.now()-t0)/1e3);e.textContent=('0'+Math.floor(s/60)).slice(-2)+':'+('0'+s%60).slice(-2);e.classList.toggle('late',s>1200)},1000);
var r0=window.afterRender;window.afterRender=function(p){if(r0)r0(p);document.documentElement.classList.toggle('rpm',p==='runde'&&!!S.ui.rpm)};
})();
