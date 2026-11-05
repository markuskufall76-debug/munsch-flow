/* ===== Stationsmodus (Tablet in der Halle) =====
   Anmeldung mit dem Konto „Station“. Große Tasten, wenige Schritte, jede Aktion mit Rückgängig.
   Wer handelt, wählt sich per Antippen aus; nach 3 Minuten ohne Bedienung wird die Auswahl zurückgesetzt.
   Schreibt dieselben Daten wie die Seiten (Fächer, Milkrun, Register, Tageszahlen). */
(function(){
'use strict';
var M=window.MF,ic=M.ic;
var ST={sc:'home',who:'',at:0,undo:null,msg:'',sel:{},size:0};
try{ST.size=+(M.ls('mf.stn.size')||0)}catch(e){}
var IDLE=3*6e4;
function el(){return $('#stn')}
function act(label,fn){var u=S.user,snap=JSON.stringify(Object.assign({},S,{ui:undefined}));S.user=ST.who||u;var ok;try{ok=fn()}finally{S.user=u}
 if(ok===false)return;ST.undo={snap:snap,label:label,ts:Date.now()};ST.msg=label;ST.sc='done';save();draw();clearTimeout(ST.t);ST.t=setTimeout(function(){if(ST.sc==='done'){ST.sc='home';draw()}},9000)}
function needWho(next){if(ST.who&&Date.now()-ST.at<IDLE){ST.at=Date.now();return true}ST.who='';ST.next=next;ST.sc='who';draw();return false}
function head(){var lv=!window.SY||!SY.on?['demo','Ohne Zentrale']:SY.ok?['','Live']:['off','Offline – Änderungen werden gepuffert'];
 return '<header class="st-h"><span class="st-lg">'+logoCore(44)+'</span><div class="st-t"><b>Station</b><span>'+esc(new Date().toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'long'}))+'</span></div><span class="live '+lv[0]+'"><i></i>'+lv[1]+'</span>'
  +'<button class="st-who" data-act="stwho">'+(ST.who&&Date.now()-ST.at<IDLE?'<span class="av">'+esc(M.initials(ST.who))+'</span>'+esc(ST.who):'<span class="av">?</span>Wer bist du?')+'</button>'
  +'<button class="ib" data-act="stsz" aria-label="Schriftgröße">A'+['','+','++'][ST.size]+'</button><b class="st-clk mono" id="stck">'+new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})+'</b></header>'}
function home(){var fs=fachStat(),mk=mkDay(todayIso()),done=Object.keys(mk).filter(function(k){return mk[k].e}).length,nx=-1;for(var j=0;j<10;j++)if(!mk[j]){nx=j;break}
 var T=[['fein','Einlagern','Auftrag scannen',fs.fr+' Fächer frei','lager'],['faus','Auslagern','Auftrag oder Fach',fs.o+' belegt','lager'],['milk','Milkrun',nx>=0?'Runde '+(nx+1)+' um '+mkTime(nx):'alle Runden erfasst',done+' von 10','milk'],['qs','Störung melden','Säge, Werk, Wareneingang',regOpen('qs')+' offen','bell'],['we','Wareneingang','Lieferung erfassen',regOpen('we')+' offen','lager'],['mw','Materialwagen','Pumu und KST',regOpen('mw')+' offen','milk'],['tz','Tageszahlen','heute eintragen',Object.keys(tzOf(todayIso())).length+' Felder','tz']];
 var al=alerts(new Date()).filter(function(a){return a.tone==='crit'});
 return (al.length?'<div class="st-al">'+al.slice(0,2).map(function(a){return '<span><i></i>'+esc(a.t)+'</span>'}).join('')+'</div>':'')+'<div class="st-grid">'+T.map(function(t,i){return '<button class="st-tile" style="--n:'+i+'" data-act="stgo" data-s="'+t[0]+'">'+ic(t[4])+'<b>'+t[1]+'</b><span>'+t[2]+'</span><em>'+t[3]+'</em></button>'}).join('')+'</div><div style="display:flex;justify-content:flex-end;margin-top:26px"><button class="btn ghost sm" data-act="stout">Station abmelden</button></div>'}
function whoS(){return '<h2 class="st-q">Wer bist du?</h2><div class="st-ppl">'+CREW.map(function(c){return '<button class="st-p" data-act="stpick" data-u="'+esc(c.n)+'"><span class="av">'+esc(M.initials(c.n))+'</span>'+esc(c.n)+'</button>'}).join('')+'</div>'+back()}
function back(){return '<button class="btn xl ghost st-back" data-act="sthome">‹ Zurück</button>'}
function fein(){var nf=S.fach.filter(function(f){return f.typ==='S'&&!f.auf&&!f.legacy})[0]||S.fach.filter(function(f){return !f.auf&&!f.legacy})[0];
 return '<h2 class="st-q">Einlagern</h2><div class="st-card"><label class="fl">Auftragsnummer scannen<input class="in scan mono" id="stin" inputmode="numeric" autocomplete="off" data-ent="stfein" placeholder="Scan"></label><div class="next"><span class="dim">Nächstes freies Fach</span><b>'+(nf?fachName(nf):'voll')+'</b></div><button class="btn pri xl st-w" data-act="stfein"'+(nf?'':' disabled')+'>Einlagern in '+(nf?fachName(nf):'–')+'</button></div>'+back()}
function faus(){var q=(ST.sel.q||'').trim().toLowerCase(),hits=q.length>=2?S.fach.filter(function(f){return (f.auf||f.legacy)&&((f.auf||'').indexOf(q)>=0||fachName(f).toLowerCase()===q||fachName(f).toLowerCase().indexOf(q)===0)}).slice(0,6):[];
 return '<h2 class="st-q">Auslagern</h2><div class="st-card"><label class="fl">Auftrag scannen oder Fach eingeben<input class="in scan mono" id="stin" autocomplete="off" data-in="stq" value="'+esc(ST.sel.q||'')+'" placeholder="4821907 oder S012"></label><div class="st-list" id="stres">'+(hits.length?hits.map(function(f){return '<button class="st-row" data-act="stfaus" data-id="'+f.id+'"><b class="mono">'+fachName(f)+'</b><span>'+(f.auf?esc(f.auf)+' · '+days(f.ts)+' Tage':'Altbestand')+'</span><em>Auslagern ›</em></button>'}).join(''):q.length>=2?'<p class="dim">Kein belegtes Fach gefunden.</p>':'')+'</div></div>'+back()}
function milk(){var now=new Date(),mk=mkDay(todayIso());var b='';for(var i=0;i<10;i++){var r=mk[i],s=mkStatus(i,now),cl=r&&r.x?'x':r&&r.e?'ok':r&&r.s?'run':s.tone;
  b+='<button class="st-run '+cl+'" data-act="stmk" data-i="'+i+'"><span>Runde '+(i+1)+'</span><b>'+mkTime(i)+'</b><em>'+(r&&r.e?'erledigt':r&&r.x?'ausgefallen':r&&r.s?'läuft – tippen zum Beenden':s.s==='nicht erfasst'?'nicht erfasst – nachtragen':s.tone==='crit'?'überfällig – tippen zum Starten':'tippen zum Starten')+'</em></button>'}
 return '<h2 class="st-q">Milkrun</h2><div class="st-runs">'+b+'</div>'+back()}
function choice(id,opts,cur){return '<div class="st-ch">'+opts.map(function(o){return '<button class="'+(cur===o?'on':'')+'" data-act="stch" data-k="'+id+'" data-v="'+esc(o)+'">'+esc(o)+'</button>'}).join('')+'</div>'}
function reg(k){var R=REG[k],f=R.f,sel=ST.sel,open=S.reg[k].filter(function(e){return R.done.indexOf(e.st)<0}).sort(function(a,b){return b.ts-a.ts}).slice(0,8);
 var form=f.map(function(x){if(x[2]==='s'){if(!sel[x[0]])sel[x[0]]=x[3][0];return '<div class="fl">'+esc(x[1])+choice(x[0],x[3],sel[x[0]])+'</div>'}if(x[2]==='n')return '<div class="fl">'+esc(x[1])+'<div class="st-step"><button data-act="stn" data-k="'+x[0]+'" data-n="-1">−</button><b>'+(sel[x[0]]||0)+'</b><button data-act="stn" data-k="'+x[0]+'" data-n="1">+</button></div></div>';return '<label class="fl">'+esc(x[1])+'<input class="in" id="st_'+x[0]+'" value="'+esc(sel[x[0]]||'')+'" data-in="stv" data-k="'+x[0]+'" autocomplete="off"></label>'}).join('');
 var list=open.length?'<div class="sf-lbl" style="margin-top:22px">Offen</div><div class="st-list">'+open.map(function(e){return '<button class="st-row" data-act="stadv" data-k="'+k+'" data-id="'+e.id+'"><b>'+esc(e[f[0][0]]||'')+'</b><span>'+esc(R.st[e.st])+'</span><em>'+(e.st<R.st.length-1?esc(R.st[e.st+1])+' ›':'')+'</em></button>'}).join('')+'</div>':'';
 return '<h2 class="st-q">'+esc(k==='qs'?'Störung melden':R.t)+'</h2><div class="st-card">'+form+'<button class="btn pri xl st-w" data-act="stadd" data-k="'+k+'">'+(k==='qs'?'Störung melden':'Eintragen')+'</button></div>'+list+back()}
function tz(){var t=todayIso(),o=tzOf(t),G=TZ.filter(function(g){return !/Störungen/.test(g.g)});return '<h2 class="st-q">Tageszahlen · heute</h2><div class="st-tz">'+G.map(function(g){return '<div class="st-card"><div class="sf-lbl">'+esc(g.g)+'</div>'+g.f.map(function(x){return '<div class="st-tzf"><span>'+esc(x[1])+'</span><div class="st-step"><button data-act="sttz" data-k="'+x[0]+'" data-n="-1">−</button><b>'+(o[x[0]]!=null?o[x[0]]:'–')+'</b><button data-act="sttz" data-k="'+x[0]+'" data-n="1">+</button></div></div>'}).join('')+'</div>'}).join('')+'</div>'+back()}
function doneS(){return '<div class="st-done"><div class="st-ok">✓</div><h2>'+esc(ST.msg)+'</h2>'+(ST.who?'<p class="lead">eingetragen für '+esc(ST.who)+'</p>':'')+'<div class="st-acts"><button class="btn xl" data-act="stundo">Rückgängig</button><button class="btn pri xl" data-act="sthome">Fertig</button></div></div>'}
function body(){switch(ST.sc){case 'who':return whoS();case 'fein':return fein();case 'faus':return faus();case 'milk':return milk();case 'qs':return reg('qs');case 'we':return reg('we');case 'mw':return reg('mw');case 'tz':return tz();case 'done':return doneS();default:return home()}}
function draw(){var e=el();if(!e)return;e.className='st-sz'+ST.size;e.innerHTML=head()+'<main class="st-b'+(ST.anim?' st-in':'')+'">'+body()+'</main>';ST.anim=false;var i=$('#stin');if(i)setTimeout(function(){try{i.focus()}catch(x){}},60)}
window.stnRender=function(){var a=document.activeElement;if(a&&/INPUT|TEXTAREA/.test(a.tagName)&&el()&&el().contains(a))return;draw()};
window.openStation=function(){if(el())return;var d=document.createElement('div');d.id='stn';document.body.appendChild(d);ST.sc='home';draw();
 try{if(navigator.wakeLock)navigator.wakeLock.request('screen').catch(function(){})}catch(e){}};
function goSc(sc){ST.sel={};ST.sc=sc;ST.anim=true;draw()}
ACT.stgo=function(d){if(d.s==='tz'||d.s==='milk'||needWho(d.s))goSc(d.s)};
ACT.sthome=function(){goSc('home')};
ACT.stout=function(){confirmM('Station abmelden? Zum Weiterarbeiten wird die PIN der Station gebraucht.',function(){if(window.SY&&SY.on)ACT.syout();else{M.ls('mflow.name',null);location.reload()}},'Abmelden','no')};
ACT.stwho=function(){ST.who='';ST.next='home';goSc('who')};
ACT.stpick=function(d){ST.who=d.u;ST.at=Date.now();goSc(ST.next||'home')};
ACT.stsz=function(){ST.size=(ST.size+1)%3;M.ls('mf.stn.size',String(ST.size));draw()};
ACT.stfein=function(){var raw=($('#stin')||{}).value||'',nf=S.fach.filter(function(f){return f.typ==='S'&&!f.auf&&!f.legacy})[0]||S.fach.filter(function(f){return !f.auf&&!f.legacy})[0];if(!nf)return toast('Kein freies Fach');var a=aufNr(raw);if(!a)return toast('Auftragsnummer muss mit 7 Ziffern beginnen');act(a+' in '+fachName(nf)+' eingelagert',function(){return fachIn(nf,raw)})};
ACT.stfaus=function(d){var f=S.fach.filter(function(x){return x.id===d.id})[0];if(!f)return;var a=f.auf||'Altbestand';act(fachName(f)+' ausgelagert',function(){S.fachlog.unshift({ts:Date.now(),u:S.user,f:f.id,a:a,k:'aus'});f.auf='';f.ts=0;f.legacy=0;logA('Ausgelagert: '+a+' aus '+fachName(f))})};
ACT.stmk=function(d){var i=+d.i,day=mkDay(todayIso()),r=day[i];if(r&&(r.e||r.x))return toast('Runde '+(i+1)+' ist schon erfasst');act(r&&r.s?'Runde '+(i+1)+' beendet':'Runde '+(i+1)+' gestartet',function(){if(r&&r.s){r.e=Date.now();mkSync();logA('Milkrun Runde '+(i+1)+' beendet')}else{day[i]={s:Date.now()};logA('Milkrun Runde '+(i+1)+' gestartet')}})};
ACT.stch=function(d){ST.sel[d.k]=d.v;draw()};
ACT.stn=function(d){ST.sel[d.k]=Math.max(0,(ST.sel[d.k]||0)+ +d.n);draw()};
ACT.stadd=function(d){var R=REG[d.k],e={id:uid(),ts:Date.now(),st:0};for(var i=0;i<R.f.length;i++){var f=R.f[i],v=ST.sel[f[0]];if(f[2]==='n')v=v||0;else v=String(v==null?'':v).trim();if(f[2]==='t'&&i===0&&!v)return toast('Bitte „'+f[1]+'“ ausfüllen');e[f[0]]=v}
 if(d.k==='qs'&&!e.txt)return toast('Bitte kurz beschreiben, was los ist');
 act(d.k==='qs'?'Störung gemeldet':R.t+': eingetragen',function(){e.u=S.user;S.reg[d.k].push(e);logA(R.t+': neuer Eintrag '+(e[R.f[0][0]]||''))})};
ACT.stadv=function(d){var R=REG[d.k],e=S.reg[d.k].filter(function(x){return x.id===d.id})[0];if(!e||e.st>=R.st.length-1)return;act((e[R.f[0][0]]||'Eintrag')+' → '+R.st[e.st+1],function(){e.st++;e.tst=Date.now();logA(R.t+': '+(e[R.f[0][0]]||'')+' → '+R.st[e.st])})};
ACT.sttz=function(d){var t=todayIso(),v=Math.max(0,(tzOf(t)[d.k]||0)+ +d.n);var u=S.user;S.user=ST.who||u;tzSet(t,d.k,v);S.user=u;draw()};
ACT.stundo=function(){var U=ST.undo;if(!U||Date.now()-U.ts>60000)return toast('Rückgängig ist nicht mehr möglich');var ui=S.ui,u=S.user;S=JSON.parse(U.snap);S.ui=ui;S.user=u;ST.undo=null;logA('Rückgängig: '+U.label);save();toast('Rückgängig gemacht');goSc('home')};
document.addEventListener('input',function(e){var t=e.target,k=t.dataset&&t.dataset.in;if(!el()||!k)return;if(k==='stq'){ST.sel.q=t.value;var r=$('#stres');if(r){var tmp=document.createElement('div');tmp.innerHTML=faus();var n=tmp.querySelector('#stres');if(n)r.innerHTML=n.innerHTML}}else if(k==='stv')ST.sel[t.dataset.k]=t.value});
setInterval(function(){var c=$('#stck');if(c)c.textContent=new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});if(el()&&ST.who&&Date.now()-ST.at>IDLE&&ST.sc==='home'){ST.who='';draw()}},1000);
})();
