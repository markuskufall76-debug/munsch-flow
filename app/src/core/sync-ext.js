/* Ergänzungen zum Sync-Kern (app/src/legacy/sync.js).
   1. Abschnitte, die Flow 5 außerhalb des Kerns zum Sync hinzugefügt hat: dev (Geräte), chk und chkdef (Schichtaufgaben).
   2. Sicherheitsnetz: Abschnitte, die die Zentrale liefert, die dieses Gerät aber nicht selbst erzeugt, werden
      unverändert weitergereicht. Ohne das würde syOps sie als gelöscht melden und in der Zentrale entfernen. */
(function(){
 /* 3. Danke-Brett ist eine Liste: ohne Anmeldung legt syTarget es beim ersten Eingang als Objekt an und syFlat bricht ab (auch in Flow 5) */
 SYK.dank=function(x){return x.id};
 var tgt=syTarget;syTarget=function(sec){if(sec==='dank'&&!Array.isArray(S.dank))S.dank=S.dank&&typeof S.dank==='object'?Object.keys(S.dank).map(function(k){return S.dank[k]}):[];return tgt(sec)};
 var base=syFlat;
 syFlat=function(){
  var o=base();
  ['dev','chk','chkdef','home','cfg','use'].forEach(function(s){var r=o[s]={};Object.keys(S[s]||{}).forEach(function(k){r[k]=JSON.stringify(S[s][k])})});
  Object.keys(SY.last||{}).forEach(function(s){
   if(o[s])return;
   var t=syTarget(s),r=o[s]={};
   if(t.o)Object.keys(t.o).forEach(function(k){r[k]=JSON.stringify(t.o[k])});
   else (t.a||[]).forEach(function(x){r[String(t.kf(x))]=JSON.stringify(x)});
  });
  return o};
})();
