/* Fachregeln, die Flow 5 außerhalb des Kerns ergänzt hat (wortgleiche Logik):
   - Sonderbetrieb: S.extra[Datum] macht Wochenend- oder Feiertage zu Arbeitstagen
   - an Tagen ohne Betrieb ruhen Milkrun-, Aufgaben- und Übergabe-Hinweise
   - Fristen aus den Registern (fällig am, Datum) mit Warnungen bei Überfälligkeit und in den nächsten 3 Tagen
   - Schulferien Rheinland-Pfalz als Hinweis */
(function(){
 var SF=[['Weihnachtsferien','2025-12-22','2026-01-07'],['Osterferien','2026-03-30','2026-04-10'],['Sommerferien','2026-06-29','2026-08-07'],['Herbstferien','2026-10-05','2026-10-16'],['Weihnachtsferien','2026-12-23','2027-01-08'],['Osterferien','2027-03-22','2027-04-02'],['Sommerferien','2027-06-28','2027-08-06'],['Herbstferien','2027-10-04','2027-10-15'],['Weihnachtsferien','2027-12-23','2028-01-07'],['Osterferien','2028-04-10','2028-04-21'],['Sommerferien','2028-07-03','2028-08-11'],['Herbstferien','2028-10-09','2028-10-20'],['Weihnachtsferien','2028-12-21','2029-01-08']];
 window._ferien=function(d){for(var i=0;i<SF.length;i++)if(d>=SF[i][1]&&d<=SF[i][2])return {n:SF[i][0],bis:SF[i][2]};return null};
 var base=isWork;
 window.isWorkRegular=base;
 isWork=function(i){return base(i)||!!(S&&S.extra&&S.extra[i])};
 window._dayKind=function(d){var w=new Date(d+'T12:00:00').getDay();if(HOL.has(d))return 'Feiertag';if(w===0||w===6)return 'Wochenende';if(/-12-(24|31)$/.test(d))return 'Brückentag';return ''};
 window.frDue=function(){var L=[],t=todayIso();Object.keys(REG).forEach(function(k){if(k==='gespr'&&!isLead())return;var R=REG[k];(S.reg[k]||[]).forEach(function(e){if(R.done.indexOf(e.st)>=0)return;var d=e.faellig||e.datum;if(!d)return;var dd=Math.round((new Date(d+'T12:00:00')-new Date(t+'T12:00:00'))/864e5);L.push({k:k,t:R.t,id:e.id,d:d,dd:dd,w:String(e.art||e.thema||e.txt||R.t),r:String(e.ref||'')})})});return L.sort(function(a,b){return a.dd-b.dd})};
 window.dayOk=function(d){var m=S.milk[d]||{},n=0;for(var i=0;i<10;i++)if(m[i]&&m[i].e)n++;var s=S.sich&&S.sich[d];return n===10&&!(s&&(s.t==='bei'||s.t==='unf'))};
 window.serie=function(){var d=todayIso(),n=0;if(!isWork(d)||!dayOk(d))d=prevWork(d);for(var g=0;g<120;g++){if(!d||!dayOk(d))break;n++;d=prevWork(d)}return n};
 var a0=alerts;
 alerts=function(n){var o=a0(n);
  try{var F=frDue(),L=F.filter(function(x){return x.k!=='mas'&&x.dd<0}),s=F.filter(function(x){return x.dd>=0&&x.dd<=3});if(L.length)o.push({tone:'crit',t:L.length+' Frist(en) überfällig',go:'frist'});if(s.length)o.push({tone:'warn',t:s.length+' Frist(en) in den nächsten 3 Tagen',go:'frist'})}catch(e){}
  try{if(!isWork(todayIso()))o=o.filter(function(a){return !/Milkrun|Schichtaufgaben|Übergabe/.test(a.t)})}catch(e){}
  return o};
})();
