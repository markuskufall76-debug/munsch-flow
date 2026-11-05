/* ===== Mein Tag: persönliche Startseite =====
   Bereich laut Schichtplan, dessen Kennzahlen, eigene Aufgaben (Vortrag, Maßnahmen, Nachrichten), eigene Woche.
   Personen aus dem Team starten hier, die Teamleitung im Lagebild. */
(function(){
'use strict';
var M=window.MF,cp=M.cp,card=M.card,tile=M.tile,ic=M.ic,empty=M.empty;
function mon(d){var x=new Date(d+'T12:00:00');return addDays(d,-((x.getDay()+6)%7))}
function ln(){var t=todayIso();return tzLatest(isWork(t)?prevWork(t):t)}
function o(k){var l=ln();return l?(S.tz[l]||{})[k]:null}
/* Kennzahlen je Bereich (Bereichsnamen wie im Schichtplan) */
var AREA={
 'Wareneingang':function(){return [{k:'Lieferungen offen',v:String(regOpen('we')),go:'we',tone:regOpen('we')?'warn':'ok'},{k:'Pakete Vortag',v:String(o('we_pak')||0),go:'tz'},{k:'GB / Pal Vortag',v:String(o('we_gbpal')||0),go:'tz'}]},
 'WEP':function(){return [{k:'Prüfungen offen',v:String(regOpen('wep')),go:'wep',tone:regOpen('wep')?'warn':'ok'},{k:'Silizium Vortag',v:String(o('wep_si')||0),go:'tz'}]},
 'Säge Metall':function(){var pl=(S.tz[todayIso()]||{}).ms_plan,ru=(S.tz[prevWork(todayIso())]||{}).ms_rueck||0;return [{k:'Tagesziel',v:pl==null?'–':String(pl+ru),s:pl==null?'Plan noch nicht erfasst':pl+' geplant + '+ru+' Rückstand',cu:false,go:'tz'},{k:'Gesägt Vortag',v:String(o('ms_ist')||0),go:'tz'},{k:'Rückstand',v:String(o('ms_rueck')||0),go:'tz',tone:(o('ms_rueck')||0)>3?'warn':''}]},
 'Säge Kunststoff':function(){var pl=(S.tz[todayIso()]||{}).ks_plan,ru=(S.tz[prevWork(todayIso())]||{}).ks_rueck||0;return [{k:'Tagesziel',v:pl==null?'–':String(pl+ru),s:pl==null?'Plan noch nicht erfasst':pl+' geplant + '+ru+' Rückstand',cu:false,go:'tz'},{k:'Gesägt Vortag',v:String(o('ks_ist')||0),go:'tz'},{k:'Rückstand',v:String(o('ks_rueck')||0),go:'tz',tone:(o('ks_rueck')||0)>3?'warn':''}]},
 'Vorkommissionierung':function(){return [{k:'Aufträge offen',v:String(regOpen('vork')),go:'vork'}]},
 'Materialwagen':function(){return [{k:'Wagen offen',v:String(regOpen('mw')),go:'mw'},{k:'Rückstand Vortag',v:String(o('mw_rueck')||0),go:'tz'}]},
 'Werksverkehr':function(){return [{k:'Fahrten offen',v:String(regOpen('wv')),go:'wv'},{k:'TB-Wagen offen',v:String(regOpen('tb')),go:'tb'}]},
 'Werk 1':function(){return [{k:'Vor Lack (HP+VP)',v:String((o('lack_hp')||0)+(o('lack_vp')||0)),go:'tz'},{k:'Vor Montage',v:String((o('mont_hp')||0)+(o('mont_vp')||0)),go:'tz'}]},
 'Werk 2':function(){return [{k:'Störungen Werk 2',v:String(o('st_w2')||0),go:'tz'}]},
 'Teamleitung':function(){var a=alerts(new Date());return [{k:'Warnungen',v:String(a.length),act:'bell',tone:a.length?'warn':'ok'}]}};
VIEW.mein=function(){var t=todayIso(),me_=S.user,w=isWork(t),plan=(S.plan[t]||{})[me_],ab=absentOn(t).filter(function(v){return v.emp===me_})[0],h=new Date().getHours();
 var vt=(window._presToday?_presToday(t):[]).filter(function(x){return x.n===me_});
 var ms=(S.mass||[]).filter(function(m){return !m.done&&m.wer===me_}).map(function(m){return ['Shopfloor',m.txt,m.bis]}).concat((S.s5.mass||[]).filter(function(m){return !m.done&&m.wer===me_}).map(function(m){return ['5S',m.txt,m.bis]}));
 var pm=window.pmKey?(S.funk[pmKey(me_)]||[]).filter(function(m){return m.by!==me_&&m.ts>(+(S.ui.pmr||0))}):[];
 var chk=window.chkOpen?chkOpen():[];
 var hero='<section class="hero"><div class="hl"><div><h2 class="gr">'+(h<11?'Guten Morgen':h<17?'Hallo':'Guten Abend')+',<br><em>'+esc(firstName(me_))+'</em></h2><p class="lead" style="margin-top:14px">'+(ab?'Heute: <b>'+esc(ab.type)+'</b> bis '+fmtD(ab.d1,{day:'2-digit',month:'2-digit'})+'. Gute Erholung.':!w?'Heute kein regulärer Betrieb.':plan?'Heute eingeteilt: <b style="color:var(--signal)">'+esc(plan)+'</b>':'Heute noch keinem Bereich zugeteilt.')+'</p></div>'
  +'<div class="st"><b>'+esc(shiftInfo(new Date()).txt.split(' · ')[0])+'</b><span>'+fmtD(t,{weekday:'long',day:'2-digit',month:'long'})+'</span></div></div></section>';
 var area=plan&&AREA[plan]?'<div class="row r4">'+AREA[plan]().map(function(x){return tile(x)}).join('')+'</div>':'';
 var todo=[];
 vt.forEach(function(x){todo.push(['sig','Vortrag im Shopfloor 06:45: '+x.t,'runde'])});
 pm.slice(-3).forEach(function(m){todo.push(['crit','Nachricht von '+m.by+': '+m.t,'funk'])});
 ms.forEach(function(m){todo.push([m[2]<t?'crit':'warn',m[0]+'-Maßnahme: '+m[1]+' · bis '+fmtD(m[2],{day:'2-digit',month:'2-digit'}),m[0]==='5S'?'s5':'runde'])});
 if(w&&chk.length)todo.push(['warn',chk.length+' Schichtaufgaben im Team noch offen','chk']);
 var wk=[],m0=mon(t);for(var i=0;i<5;i++){var d=addDays(m0,i),a=absentOn(d).filter(function(v){return v.emp===me_})[0],p=(S.plan[d]||{})[me_];wk.push('<div class="mw'+(d===t?' today':'')+(a?' off':'')+'"><small>'+fmtD(d,{weekday:'short',day:'2-digit',month:'2-digit'})+'</small><b>'+(!isWork(d)?'frei':a?esc(a.type):p?esc(p):'–')+'</b></div>')}
 var k=konto(me_,+t.slice(0,4)),nx=S.vacs.filter(function(v){return v.emp===me_&&v.d0>t&&v.st!=='abgelehnt'}).sort(function(a,b){return a.d0<b.d0?-1:1})[0];
 return hero+area
  +'<div class="row r-32">'+card('Für dich heute',todo.length?'<div class="al">'+todo.map(function(x){return '<button class="'+x[0]+'" data-act="go" data-go="'+x[2]+'"><i></i><span>'+esc(x[1])+'</span>'+ic('arrow')+'</button>'}).join('')+'</div>':'<div class="calm"><b>Nichts offen</b><span>Keine Maßnahmen, kein Vortrag, keine neuen Nachrichten.</span></div>',{r:cp('',todo.length+'')})
  +card('Deine Woche','<div class="mwk">'+wk.join('')+'</div><dl class="kv big" style="margin-top:16px"><dt>Resturlaub '+t.slice(0,4)+'</dt><dd>'+String(k.rest).replace('.',',')+' Tage</dd><dt>Nächste Abwesenheit</dt><dd>'+(nx?esc(nx.type)+' ab '+fmtD(nx.d0,{weekday:'short',day:'2-digit',month:'2-digit'})+(nx.st==='beantragt'?' (beantragt)':''):'keine geplant')+'</dd></dl>',{r:'<button class="btn sm" data-act="vq" data-e="'+esc(me_)+'" data-d="'+(isWork(t)?nextWork(t):nextWork(t))+'">Urlaub beantragen</button>'})+'</div>'};
/* Team startet in „Mein Tag“ (einmal je Sitzung, wenn noch im Lagebild) */
var homed=false,ar=window.afterRender;window.afterRender=function(p){if(ar)ar(p);if(!homed){homed=true;if(!isLead()&&p==='lage'&&!(window.isStation&&isStation()))setTimeout(function(){go('mein')},50)}};
})();
