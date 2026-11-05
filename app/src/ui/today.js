/* ===== Heute, Fristen, Wochenrückblick, Tagesabschluss, Probelauf =====
   Daten wie Flow 5: S.dank [{id,from,to,txt,ts}], S.ziel {n}, S.extra[Datum] (Sonderbetrieb). */
(function(){
'use strict';
var M=window.MF,cp=M.cp,card=M.card,tile=M.tile,ic=M.ic,empty=M.empty;
function dd(d){return d.slice(8)+'.'+d.slice(5,7)+'.'}
function mon(d){var x=new Date(d+'T12:00:00');return addDays(d,-((x.getDay()+6)%7))}
function weekDays(){var m=mon(todayIso()),o=[];for(var i=0;i<5;i++)o.push(addDays(m,i));return o}
function mkDone(d){var m=S.milk[d]||{},n=0;for(var i=0;i<10;i++)if(m[i]&&m[i].e)n++;return n}
function dk(){S.dank=S.dank||[];return S.dank}
function zl(){S.ziel=S.ziel||{n:5};return S.ziel}
function zProg(){var t=todayIso(),c=0;weekDays().forEach(function(d){if(d<=t&&isWork(d)&&mkDone(d)===10)c++});return c}
function frTone(x){return x.dd<0?'crit':x.dd<=3?'warn':''}
function frTxt(x){return x.dd<0?'seit '+(-x.dd)+' Tg. überfällig':x.dd===0?'heute':x.dd===1?'morgen':'in '+x.dd+' Tg.'}
function frRow(x){return '<button class="'+frTone(x)+'" data-act="go" data-go="'+x.k+'"><i></i><span><b>'+esc(x.w)+(x.r?' · '+esc(x.r):'')+'</b><small class="dim" style="display:block;font-size:12.5px">'+esc(x.t)+' · '+fmtD(x.d,{weekday:'short',day:'2-digit',month:'2-digit'})+'</small></span><em class="frt '+frTone(x)+'">'+frTxt(x)+'</em>'+ic('arrow')+'</button>'}
function dayKey(ts){return iso(new Date(ts))}

/* ---------- Heute ---------- */
VIEW.heute=function(){var now=new Date(),t=todayIso(),h=now.getHours(),si=shiftInfo(now),al=alerts(now),D=window.chkOpen?chkOpen():[],F=frDue(),F7=F.filter(function(x){return x.dd<=7}),w=isWork(t),pres=w?presentOn(t):[],ab=w?CREW.filter(function(c){return pres.indexOf(c.n)<0}).map(function(c){return c.n}):[];
 var total=(window.chkOpen?D.length:0),doneChk=0;try{var all=Object.keys(S.chk||{}).filter(function(k){return k.indexOf(t+'|')===0}).length;doneChk=all;total=all+D.length}catch(e){}
 var mk=mkDone(t),prog=w?Math.round((doneChk+mk)/Math.max(1,total+10)*100):0,R=52,C=2*Math.PI*R;
 var imp=[];Object.keys(S.funk).forEach(function(c){if(c.charAt(0)==='@')return;(S.funk[c]||[]).forEach(function(m){if(m.imp&&Date.now()-m.ts<864e5)imp.push([c,m])})});
 var kind=_dayKind(t),sb=S.extra&&S.extra[t],fe=_ferien(t),ns=Object.keys(S.extra||{}).filter(function(d){return d>t}).sort();
 var betr=(!isWorkRegular(t)&&(kind||sb))?(sb?'<b>Sonderbetrieb heute</b> · eingerichtet von '+esc(firstName(sb.by))+'. Es gelten die normalen Abläufe.':'<b>'+esc(kind)+': kein regulärer Betrieb.</b> Arbeit nur nach Bedarf, Erinnerungen und Milkrun-Hinweise ruhen.'):'Regulärer Arbeitstag. Nächster Arbeitstag: '+fmtD(nextWork(t),{weekday:'short',day:'2-digit',month:'2-digit'})+'.';
 var hero='<section class="hero"><div class="hl"><div><h2 class="gr">'+(h<11?'Guten Morgen':h<17?'Hallo':'Guten Abend')+',<br><em>'+esc(firstName(S.user))+'</em></h2><p class="lead" style="margin-top:14px">'+betr+(fe?' · Schulferien RLP: '+esc(fe.n)+' bis '+dd(fe.bis)+', mit weniger Besetzung rechnen.':'')+(ns.length?' · Geplanter Sonderbetrieb: '+ns.slice(0,3).map(function(d){return fmtD(d,{weekday:'short',day:'2-digit',month:'2-digit'})}).join(', ')+'.':'')+'</p>'+(isLead()?'<button class="btn sm" style="margin-top:14px" data-act="sbm">Sonderbetrieb nach Bedarf</button>':'')+'</div>'
  +'<div class="ring big"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="'+R+'" class="rb"/><circle cx="60" cy="60" r="'+R+'" class="rf" style="stroke-dasharray:'+C.toFixed(1)+';stroke-dashoffset:'+(C*(1-prog/100)).toFixed(1)+'"/></svg><b>'+prog+'<small>% Tag</small></b></div></div>'
  +'<div class="kp"><div><b>'+esc(si.txt.split(' · ')[0])+'</b><span>Schicht</span></div><div><b>'+mk+'<small class="dim"> / 10</small></b><span>Milkrun</span></div><div><b>'+doneChk+'<small class="dim"> / '+total+'</small></b><span>Schichtaufgaben</span></div></div></section>';
 var tiles='<div class="row r4">'+tile({k:'Im Dienst',v:w?pres.length+'<small>/ '+CREW.length+'</small>':'–',s:ab.length?'nicht da: '+ab.join(', '):w?'alle da':'heute kein Betrieb',tone:w&&pres.length<MIN_STAFF?'crit':'',go:'urlaub'})+tile({k:'Meldungen',v:String(al.length),tone:al.some(function(a){return a.tone==='crit'})?'crit':al.length?'warn':'ok',act:'bell'})+tile({k:'Schichtaufgaben offen',v:String(D.length),tone:D.length?'warn':'ok',go:'chk'})+tile({k:'Fristen ≤ 7 Tage',v:String(F7.length),tone:F7.some(function(x){return x.dd<0})?'crit':F7.length?'warn':'ok',go:'frist'})+'</div>';
 var calm=!al.length&&!imp.length&&!D.length&&!F7.length;
 var z=zl(),zc=zProg(),zp=Math.min(100,Math.round(zc/z.n*100));
 var L=dk().slice().sort(function(a,b){return b.ts-a.ts}).slice(0,4),sr=serie();
 return hero+tiles
  +(calm?card('Lage','<div class="calm"><b>Alles ruhig</b><span>Keine offenen Meldungen, keine Fristen in dieser Woche.</span></div>'):'')
  +'<div class="row r2">'
  +(al.length?card('Jetzt wichtig',' <div class="al">'+al.map(function(a){return '<button class="'+a.tone+'" data-act="go" data-go="'+a.go+'"><i></i><span>'+esc(a.t)+'</span>'+ic('arrow')+'</button>'}).join('')+'</div>',{r:cp(al.some(function(a){return a.tone==='crit'})?'crit':'warn',al.length+' offen')}):'')
  +(imp.length?card('Wichtig im Funk','<div class="al">'+imp.map(function(x){return '<button class="crit" data-act="go" data-go="funk"><i></i><span><b>'+esc(x[1].t)+'</b><small class="dim" style="display:block">'+esc(x[0]+' · '+x[1].by+' · '+fmtT(x[1].ts))+'</small></span>'+ic('arrow')+'</button>'}).join('')+'</div>'):'')
  +(D.length?card('Schichtaufgaben offen','<div class="al">'+D.slice(0,6).map(function(x){return '<button class="warn" data-act="go" data-go="chk"><i></i><span>'+esc(x.t)+'</span>'+ic('arrow')+'</button>'}).join('')+'</div>',{r:'<button class="btn sm" data-act="go" data-go="chk">Abhaken</button>'}):'')
  +(F7.length?card('Fristen','<div class="al fr">'+F7.slice(0,5).map(frRow).join('')+'</div>',{r:'<button class="btn sm" data-act="go" data-go="frist">Alle</button>'}):'')
  +card('Wochenziel des Teams','<div class="goal"><b>'+zc+'<small>/ '+z.n+'</small></b><span>Tage mit kompletter Milkrun diese Woche</span></div><div class="sf-mbar" style="margin-top:12px"><i style="width:'+zp+'%;background:'+(zc>=z.n?'var(--ok)':'var(--signal)')+'"></i></div>',{r:isLead()?'<button class="btn sm" data-act="zl">Ziel ändern</button>':''})
  +card('Danke-Brett',(L.length?'<div class="thx">'+L.map(function(x){return '<div><span class="sf-av">'+esc(M.initials(x.to))+'</span><p><b>'+esc(firstName(x.to))+'</b> '+esc(x.txt)+'<small class="dim"> · von '+esc(firstName(x.from))+', '+fmtDT(x.ts)+'</small></p></div>'}).join('')+'</div>':'<p class="dim" style="margin:0">Noch kein Danke. Wer hat heute etwas besonders gut gemacht?</p>')+'<p class="dim" style="margin:14px 0 0;font-size:13px">Team-Serie: <b style="color:var(--signal)">'+sr+'</b> Arbeitstag'+(sr===1?'':'e')+' in Folge mit kompletter Milkrun und ohne Unfall oder Beinaheunfall.</p>',{r:'<button class="btn sm pri" data-act="dkn">Danke sagen</button>'})
  +'</div>'};
ACT.dkn=function(){modal('<h3>Danke sagen</h3><div class="frm" style="margin-top:16px"><label class="fl">An<select class="in" id="dk_t">'+CREW.filter(function(c){return c.n!==S.user}).map(function(c){return '<option>'+esc(c.n)+'</option>'}).join('')+'</select></label><label class="fl w2">Wofür?<input class="in" id="dk_x" maxlength="90" data-ent="dks" placeholder="z. B. hat die Rampe schnell frei gemacht"></label></div><div class="acts"><button class="btn ghost" data-act="mclose">Abbrechen</button><button class="btn pri" data-act="dks">Absenden</button></div>')};
ACT.dks=function(){var to=$('#dk_t').value,tx=$('#dk_x').value.trim();if(!tx)return toast('Bitte kurz schreiben, wofür');dk().push({id:uid(),from:S.user,to:to,txt:tx,ts:Date.now()});dk().splice(0,Math.max(0,dk().length-40));closeModal();save();render();toast('Danke verschickt')};
ACT.zl=function(){if(!isLead())return;var n=zl().n%5+1;zl().n=n;save();render();toast('Wochenziel: '+n+' Tage mit kompletter Milkrun')};
ACT.sbm=function(){if(!isLead())return;var t=todayIso(),L=Object.keys(S.extra||{}).sort();modal('<h3>Sonderbetrieb</h3><p class="lead" style="margin-top:8px">An Wochenenden und Feiertagen ist kein regulärer Betrieb. Hier legst du einzelne Tage fest, an denen trotzdem gearbeitet wird. Dann gelten Milkrun-Takt, Besetzung und Warnlage wie an jedem Arbeitstag.</p><div class="frm" style="margin-top:14px"><label class="fl">Datum<input class="in" id="sb_d" type="date" value="'+t+'"></label><button class="btn pri" data-act="sbs" style="height:46px">Einrichten</button></div>'+(L.length?'<div class="sf-lbl" style="margin-top:18px">Eingerichtet</div><table class="t"><tbody>'+L.map(function(d){return '<tr><td>'+fmtD(d,{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'})+'</td><td class="dim">'+esc(S.extra[d].by||'')+'</td><td style="text-align:right"><button class="btn sm no" data-act="sbx" data-d="'+d+'">Entfernen</button></td></tr>'}).join('')+'</tbody></table>':'')+'<div class="acts"><button class="btn ghost" data-act="mclose">Schließen</button></div>')};
ACT.sbs=function(){var t=$('#sb_d').value;if(!t)return;if(isWorkRegular(t))return toast('Das ist ein regulärer Arbeitstag');S.extra=S.extra||{};S.extra[t]={by:S.user,ts:Date.now()};logA('Sonderbetrieb eingerichtet: '+t);save();ACT.sbm();render();toast('Sonderbetrieb am '+dd(t)+' eingerichtet')};
ACT.sbx=function(d){delete (S.extra||{})[d.d];logA('Sonderbetrieb entfernt: '+d.d);save();ACT.sbm();render()};

/* ---------- Fristen ---------- */
VIEW.frist=function(){var L=frDue(),G=[['Überfällig',L.filter(function(x){return x.dd<0}),'crit'],['Diese Woche',L.filter(function(x){return x.dd>=0&&x.dd<=7}),'warn'],['Später',L.filter(function(x){return x.dd>7}),'']];
 return '<div class="row r3">'+G.map(function(g){return tile({k:g[0],v:String(g[1].length),tone:g[1].length?g[2]||'':'ok'})}).join('')+'</div>'
  +(L.length?G.map(function(g){return g[1].length?card(g[0],'<div class="al fr">'+g[1].map(frRow).join('')+'</div>',{r:cp(g[2],g[1].length+'')}):''}).join(''):card('Fristen',empty('Keine offenen Fristen','Wartungen, Audits und Personalgespräche mit Datum erscheinen hier automatisch.')))};

/* ---------- Wochenrückblick ---------- */
function trend(label,vals,unit,col){var last=vals.length?vals[vals.length-1]:null,avg=vals.length?vals.reduce(function(a,b){return a+b},0)/vals.length:0;return '<div class="trd"><span class="k">'+esc(label)+'</span><b>'+(last==null?'–':Math.round(last))+(unit?'<small> '+unit+'</small>':'')+'</b><span class="dim">Ø '+(Math.round(avg*10)/10).toString().replace('.',',')+(unit?' '+unit:'')+' · '+vals.length+' Tage</span>'+M.spark(vals,col)+'</div>'}
VIEW.woche=function(){var D=weekDays(),t=todayIso(),W=D.filter(function(d){return d<=t&&isWork(d)}),mk=0,pers=0,sc={ok:0,bei:0,unf:0},from=new Date(D[0]+'T00:00:00').getTime(),to=new Date(D[4]+'T23:59:59').getTime();
 W.forEach(function(d){mk+=mkDone(d);pers+=presentOn(d).length;var s=S.sich&&S.sich[d];if(s&&sc[s.t]!=null)sc[s.t]++});
 var wp=(S.reg.wep||[]).filter(function(e){var x=e.tst||e.ts;return e.pruefer&&x>=from&&x<=to}),wmin=wp.reduce(function(a,e){return a+(+e.dauer||0)},0);
 var mw=function(b){return (S.reg.mw||[]).filter(function(e){var x=e.tst||e.ts;return e.st>=2&&(e.bereich||'Pumu')===b&&x>=from&&x<=to}).length};
 var ein=0,aus=0;(S.fachlog||[]).forEach(function(e){if(e.ts>=from&&e.ts<=to){if(e.k==='ein')ein++;else aus++}});
 var openM=(S.mass||[]).filter(function(x){return !x.done}).length,F7=frDue().filter(function(x){return x.dd<=7}).length;
 window._wk='WOCHENRÜCKBLICK '+fmtD(D[0])+' bis '+fmtD(D[4])+'\nMilkrun: '+mk+' von '+W.length*10+' Runden\nAnwesenheit: '+pers+' Personentage\nSicherheit: '+sc.ok+' unfallfrei, '+sc.bei+' Beinaheunfall, '+sc.unf+' Unfall\nWEP: '+wp.length+' Prüfberichte, '+wmin+' Minuten\nMaterialwagen verräumt/angekommen: Pumu '+mw('Pumu')+', KST '+mw('KST')+'\nFächer: '+ein+' eingelagert, '+aus+' ausgelagert\nOffene Maßnahmen: '+openM;
 var bz='',m0=mon(t);for(var w=0;w<8;w++){var mn=99,anyW=false;for(var i=0;i<5;i++){var x=addDays(m0,w*7+i);if(isWork(x)){anyW=true;mn=Math.min(mn,presentOn(x).length)}}var tone=!anyW?'':mn<MIN_STAFF?'crit':mn===MIN_STAFF?'warn':'ok',fe=_ferien(addDays(m0,w*7));bz+='<div class="bz '+tone+'"><small>KW · '+dd(addDays(m0,w*7))+(fe?' · Ferien':'')+'</small><b>'+(anyW?mn:'–')+'</b><span>'+(anyW?'niedrigste Besetzung':'kein Betrieb')+'</span></div>'}
 var ks=Object.keys(S.tz).filter(function(k){return k<=t&&Object.keys(S.tz[k]).length}).sort().slice(-20),ser=function(f){return ks.map(function(k){return f(S.tz[k])})};
 return '<div class="card" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 18px"><b style="font:700 24px var(--display);text-transform:uppercase">'+fmtD(D[0],{day:'2-digit',month:'2-digit'})+' bis '+fmtD(D[4],{day:'2-digit',month:'2-digit',year:'numeric'})+'</b>'+cp('',W.length+' Arbeitstage bisher')+'<span style="flex:1"></span><button class="btn sm pri" data-act="wkc">Als Text kopieren</button></div>'
  +'<div class="row r4">'+tile({k:'Milkrun',v:mk+'<small>/ '+W.length*10+'</small>',m:[mk,Math.max(1,W.length*10)],tone:W.length&&mk===W.length*10?'ok':''})+tile({k:'Personentage',v:String(pers)})+tile({k:'Unfallfrei',v:String(sc.ok),s:sc.bei+' Beinahe · '+sc.unf+' Unfall',tone:sc.unf?'crit':sc.bei?'warn':'ok'})+tile({k:'Team-Serie',v:String(serie()),s:'Arbeitstage in Folge'})+'</div>'
  +'<div class="row r2">'+card('Material und Lager','<dl class="kv big"><dt>WEP-Prüfberichte</dt><dd>'+wp.length+' · '+wmin+' Min.</dd><dt>Materialwagen Pumu angekommen</dt><dd>'+mw('Pumu')+'</dd><dt>Materialwagen KST angekommen</dt><dd>'+mw('KST')+'</dd><dt>Fächer ein / aus</dt><dd>'+ein+' / '+aus+'</dd></dl>')+card('Offene Punkte','<dl class="kv big"><dt>Offene Maßnahmen</dt><dd>'+openM+'</dd><dt>Fristen in 7 Tagen</dt><dd>'+F7+'</dd></dl>')+'</div>'
  +card('Besetzung der nächsten 8 Wochen','<div class="bzg">'+bz+'</div><p class="dim" style="font-size:12.5px;margin:12px 0 0">Niedrigste Besetzung je Woche. Mindestbesetzung ist '+MIN_STAFF+'.</p>')
  +card('Verläufe · letzte 20 erfasste Tage','<div class="trg">'+trend('Pakete gebucht',ser(function(o){return o.we_pak||0}))+trend('Gesägt Metall',ser(function(o){return o.ms_ist||0}))+trend('Gesägt Kunststoff',ser(function(o){return o.ks_ist||0}))+trend('Milkrun-Quote',ser(function(o){return (o.milkrun||0)*10}),'%','var(--ok)')+'</div>')};
ACT.wkc=function(){copyText(window._wk||'','Wochenrückblick kopiert')};

/* ---------- Tagesabschluss ---------- */
VIEW.tag=function(){var t=todayIso(),now=new Date(),mk=0;for(var i=0;i<10;i++)if(mkStatus(i,now).tone==='ok')mk++;
 var wp=(S.reg.wep||[]).filter(function(e){return e.pruefer&&dayKey(e.tst||e.ts)===t}),wm=wp.reduce(function(a,e){return a+(+e.dauer||0)},0),op=function(k,b){return (S.reg[k]||[]).filter(function(e){return REG[k].done.indexOf(e.st)<0&&(!b||(e.bereich||'Pumu')===b)}).length};
 var s=S.sich&&S.sich[t],sx=s?{ok:'unfallfrei',bei:'Beinaheunfall',unf:'Unfall'}[s.t]:'nicht eingetragen',pr=presentOn(t),ab=absentOn(t).map(function(v){return v.emp}),ein=0,aus=0;(S.fachlog||[]).forEach(function(e){if(dayKey(e.ts)===t){if(e.k==='ein')ein++;else aus++}});
 var mo=(S.mass||[]).filter(function(x){return !x.done}).length;
 var rows=[['Anwesend',pr.length+' von '+CREW.length+(ab.length?' · abwesend: '+ab.join(', '):'')],['Sicherheit',sx+(s&&s.txt?': '+s.txt:'')],['Milkrun',mk+' von 10 Runden'],['WEP',wp.length+' Prüfberichte, '+wm+' Minuten'],['Materialwagen Pumu offen',op('mw','Pumu')],['Materialwagen KST offen',op('mw','KST')],['TB-Wagen offen',op('tb')],['Lieferungen offen (WE)',op('we')],['Fächer',ein+' ein, '+aus+' aus'],['Offene Maßnahmen',mo]];
 window._tg='TAGESABSCHLUSS '+fmtD(t)+'\n'+rows.map(function(r){return r[0]+': '+r[1]}).join('\n');
 return '<div class="card" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 18px"><b style="font:700 24px var(--display);text-transform:uppercase">'+fmtD(t,{weekday:'long',day:'2-digit',month:'long'})+'</b>'+(isWork(t)?cp('sig','Arbeitstag'):cp('','kein Betrieb'))+'<span style="flex:1"></span><button class="btn sm" data-act="go" data-go="ber">Tageszahlen-Bericht</button><button class="btn sm pri" data-act="tgc">Als Text kopieren</button></div>'
  +'<div class="row r4">'+tile({k:'Anwesend',v:pr.length+'<small>/ '+CREW.length+'</small>',s:ab.join(', ')||'alle da'})+tile({k:'Sicherheit',v:s?(s.t==='ok'?'✓':'!'):'–',s:sx,tone:s?(s.t==='ok'?'ok':'crit'):'warn',cu:false,go:'runde'})+tile({k:'Milkrun',v:mk+'<small>/ 10</small>',m:[mk,10],tone:mk===10?'ok':''})+tile({k:'Fächer ein / aus',v:ein+'<small>/ '+aus+'</small>',go:'fach'})+'</div>'
  +card('Stand heute','<dl class="kv big">'+rows.map(function(r){return '<dt>'+esc(r[0])+'</dt><dd>'+esc(String(r[1]))+'</dd>'}).join('')+'</dl>')};
ACT.tgc=function(){copyText(window._tg||'','Tagesabschluss kopiert')};

/* ---------- Probelauf: nichts wird gespeichert oder gesendet ---------- */
window.TRAIN=0;
(function(){var s0=save,k0=window.syKick,p0=window.syPush,l0=window.syPull;
 save=function(){if(TRAIN)return;return s0.apply(this,arguments)};
 if(k0)syKick=function(){if(TRAIN)return;return k0.apply(this,arguments)};
 if(p0)syPush=function(){if(TRAIN)return;return p0.apply(this,arguments)};
 if(l0)syPull=function(d){if(TRAIN)return d&&d();return l0.apply(this,arguments)}})();
VIEW.train=function(){return '<section class="hero"><div class="hl"><h2 class="gr">Üben<br><em>ohne Folgen</em></h2>'+(TRAIN?cp('warn','Probelauf läuft'):cp('ok','aus'))+'</div><p class="lead" style="margin-top:18px">Im Probelauf arbeitest du mit einer Kopie der echten Daten. Alles, was du einträgst, einlagerst oder löschst, bleibt nur auf diesem Gerät im Arbeitsspeicher. Nichts wird gespeichert und nichts an andere Geräte gesendet. Beim Beenden lädt die App die echten Daten neu.</p><p class="dim">Gut für Schulungen neuer Mitarbeiter oder zum Ausprobieren von Importen.</p><div style="margin-top:18px">'+(TRAIN?'<button class="btn pri xl" data-act="trx">Probelauf beenden</button>':'<button class="btn pri xl" data-act="trs">Probelauf starten</button>')+'</div></section>'};
ACT.trs=function(){if(!isLead())return toast('Nur Teamleitung');TRAIN=1;trBar();toast('Probelauf gestartet. Nichts wird gespeichert.');render()};
ACT.trx=function(){TRAIN=0;location.reload()};
function trBar(){var b=$('#trb');if(!TRAIN){if(b)b.remove();return}if(!b){b=document.createElement('div');b.id='trb';document.body.appendChild(b)}b.innerHTML='<span>Probelauf · Änderungen werden nicht gespeichert</span><button class="btn sm" data-act="trx">Beenden</button>'}
})();
