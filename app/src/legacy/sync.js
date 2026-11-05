/* Aus MUNSCH Flow 5 übernommen (tools/extract-legacy.mjs). Synchronisierung.
   Nicht von Hand ändern, ohne test/core.test.mjs anzupassen. */
/* ===== ZENTRALE SYNCHRONISIERUNG (nur wenn von der Zentrale ausgeliefert) ===== */
var SY={on:!!window.MF_SERVER,tok:null,seq:0,last:{},busy:0,ok:0,at:0,pend:0,t:null};
function syTok(){try{return localStorage.getItem('mflow.tok')}catch(e){return null}}
function syApi(path,body){var h={'content-type':'application/json'};if(SY.tok)h.authorization='Bearer '+SY.tok;return fetch(path,{method:body?'POST':'GET',headers:h,body:body?JSON.stringify(body):undefined}).then(function(r){return r.json().catch(function(){return {}}).then(function(j){j._s=r.status;return j})})}
function syFlat(){var o={},obj=function(s,m){var r=o[s]={};Object.keys(m||{}).forEach(function(k){r[k]=JSON.stringify(m[k])})},arr=function(s,a,kf){var r=o[s]={};(a||[]).forEach(function(x){r[kf(x)]=JSON.stringify(x)})};
 obj('tz',S.tz);arr('fach',S.fach,function(x){return x.id});arr('fachlog',S.fachlog,function(x){return x.ts+'|'+x.f+'|'+x.k});obj('milk',S.milk);arr('vacs',S.vacs,function(x){return x.id});obj('carry',S.carry);obj('carryY',S.carryY);obj('plan',S.plan);obj('quali',S.quali);
 Object.keys(S.reg).forEach(function(k){arr('reg.'+k,S.reg[k],function(x){return x.id||x.ts})});arr('s5.items',S.s5.items,function(x){return x.n});arr('s5.mass',S.s5.mass,function(x){return x.id});arr('brett',S.brett,function(x){return x.id});
 Object.keys(S.funk).forEach(function(d){arr('funk.'+d,S.funk[d],function(x){return x.ts+'|'+x.by})});obj('runde',S.runde);obj('sich',S.sich);obj('term',S.term);obj('zust',S.zust);obj('todo',S.todo);obj('extra',S.extra);arr('dank',S.dank||[],function(x){return x.id});arr('mass',S.mass,function(x){return x.id});arr('log',S.log,function(x){return x.ts+'|'+x.u+'|'+x.t});return o}
var SYK={fach:function(x){return x.id},fachlog:function(x){return x.ts+'|'+x.f+'|'+x.k},vacs:function(x){return x.id},'s5.items':function(x){return x.n},'s5.mass':function(x){return x.id},brett:function(x){return x.id},mass:function(x){return x.id},log:function(x){return x.ts+'|'+x.u+'|'+x.t}};
function syTarget(sec){var m=sec.split('.');
 if(sec==='s5.items')return {a:S.s5.items,kf:SYK[sec]};if(sec==='s5.mass')return {a:S.s5.mass,kf:SYK[sec]};
 if(m[0]==='reg'){S.reg[m[1]]=S.reg[m[1]]||[];return {a:S.reg[m[1]],kf:function(x){return x.id||x.ts}}}
 if(m[0]==='funk'){S.funk[m[1]]=S.funk[m[1]]||[];return {a:S.funk[m[1]],kf:function(x){return x.ts+'|'+x.by}}}
 if(SYK[sec])return {a:S[sec],kf:SYK[sec]};return {o:(S[sec]=S[sec]||{})}}
function syApply(rows){var ch=0,sorts={};rows.forEach(function(r){var cur=(SY.last[r.s]||(SY.last[r.s]={}))[r.k];if(cur===r.v)return;if(r.v==null&&cur==null)return;SY.last[r.s][r.k]=r.v==null?undefined:r.v;var t=syTarget(r.s);if(r.s!=='dev')ch++;
  if(t.o){if(r.v==null)delete t.o[r.k];else t.o[r.k]=JSON.parse(r.v)}
  else{var i=-1;for(var j=0;j<t.a.length;j++)if(String(t.kf(t.a[j]))===r.k){i=j;break}
   if(r.v==null){if(i>=0)t.a.splice(i,1)}else{var v=JSON.parse(r.v);if(i>=0)t.a[i]=v;else{t.a.push(v);sorts[r.s]=1}}}});
 Object.keys(sorts).forEach(function(s){var t=syTarget(s);if(s==='fachlog'||s==='log')t.a.sort(function(a,b){return b.ts-a.ts});else if(s==='brett'||s.indexOf('funk.')===0)t.a.sort(function(a,b){return a.ts-b.ts})});
 if(S.log.length>400)S.log.length=400;return ch}
function syPull(done){if(!SY.tok||SY.busy)return done&&done();SY.busy=1;(function loop(){syApi('/api/sync?since='+SY.seq).then(function(r){if(r._s===401){SY.busy=0;SY.ok=0;return syExpired()}if(!r.rows){SY.busy=0;SY.ok=0;return done&&done()}
  var c=syApply(r.rows);SY.seq=r.seq;SY.ok=1;SY.at=Date.now();if(r.more)return loop();SY.busy=0;try{localStorage.setItem(KEY,JSON.stringify({v:2,ui:S.ui,user:S.user,dv:''}))}catch(e){}
  if(c){var us=$('#usr');if(us){us.classList.remove('sp');void us.offsetWidth;us.classList.add('sp')}var a=document.activeElement,typing=a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);if(typing)SY.pend=1;else{render();shellUpdate()}}done&&done(c)}).catch(function(){SY.busy=0;SY.ok=0;done&&done()})})()}
function syOps(cur){var ops=[],secs={};Object.keys(cur).concat(Object.keys(SY.last)).forEach(function(s){secs[s]=1});Object.keys(secs).forEach(function(s){var L=SY.last[s]||{},C=cur[s]||{};Object.keys(C).forEach(function(k){if(L[k]!==C[k])ops.push({s:s,k:k,v:C[k]})});if(s!=='log'&&s!=='fachlog')Object.keys(L).forEach(function(k){if(L[k]!=null&&C[k]==null)ops.push({s:s,k:k,v:null})})});return ops}
/* Offline-Puffer: ungesendete Änderungen bleiben im Browser erhalten */
function syQSave(ops){try{if(ops.length)localStorage.setItem('mflow.q',JSON.stringify({u:S.user,o:ops}));else localStorage.removeItem('mflow.q')}catch(e){}}
function syQLoad(){try{var q=JSON.parse(localStorage.getItem('mflow.q')||'null');return q&&q.u===S.user&&q.o?q.o:[]}catch(e){return []}}
function syPush(){if(!SY.tok||!SY.on)return;var cur=syFlat(),ops=syOps(cur);syQSave(ops);SY.n=ops.length;
 if(!ops.length)return;var snap=cur,chunks=[];for(var i=0;i<ops.length;i+=60)chunks.push(ops.slice(i,i+60));
 (function next(i){if(i>=chunks.length){SY.last=snap;SY.n=0;syQSave([]);return}syApi('/api/push',{ops:chunks[i]}).then(function(r){if(r._s===401)return syExpired();if(r.ok){chunks[i].forEach(function(o){(SY.last[o.s]||(SY.last[o.s]={}))[o.k]=o.v==null?undefined:o.v});if(r.rej&&r.rej.length){try{syApply(r.rej);render()}catch(x){}toast('Eine Änderung ist nicht erlaubt und wurde zurückgesetzt.')}SY.ok=1;next(i+1)}else{SY.ok=0;toast('Speichern in der Zentrale fehlgeschlagen. Es wird erneut versucht.')}}).catch(function(){SY.ok=0})})(0)}
window.addEventListener('pagehide',function(){if(SY.tok&&SY.on&&SY.last)try{syQSave(syOps(syFlat()))}catch(e){}});
window.addEventListener('online',function(){if(SY.tok){syPull(function(){syPush()})}});
function syKick(){if(!SY.on||!SY.tok)return;clearTimeout(SY.t);SY.t=setTimeout(syPush,500)}
function syExpired(){SY.tok=null;try{localStorage.removeItem('mflow.tok')}catch(e){}toast('Sitzung abgelaufen. Bitte neu anmelden.');setTimeout(function(){location.reload()},1500)}
function syStart(r,cb){/* Zustand komplett aus der Zentrale aufbauen */var ui=S.ui,u=S.user;S=newState();S.ui=ui;S.user=u;SY.last={};SY.seq=0;
 var go2=function(){syPull(function(){SY.last=syFlat();var qo=syQLoad();if(qo.length){var base=syFlat(),rows=qo.map(function(x){return {s:x.s,k:x.k,v:x.v}});syApply(rows);SY.last=base;render();toast(qo.length+' ungesendete Änderungen werden jetzt gesendet');setTimeout(syPush,800)}setInterval(function(){if(document.visibilityState==='visible'){syPull();syPush()}},12000);document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')syPull()});document.addEventListener('focusout',function(){if(SY.pend){SY.pend=0;setTimeout(function(){render();shellUpdate()},50)}});cb&&cb()})};
 syApi('/api/sync?since=0').then(function(j){if(j.empty&&isLead()){syApi('/api/seed').then(function(sd){if(sd&&sd.tz){window.MFDATA=sd;S=newState();S.ui=ui;S.user=u;SY.last={};var cur=syFlat(),ops=[];Object.keys(cur).forEach(function(s){Object.keys(cur[s]).forEach(function(k){ops.push({s:s,k:k,v:cur[s][k]})})});var ch=[];for(var i=0;i<ops.length;i+=60)ch.push(ops.slice(i,i+60));(function nx(i){if(i>=ch.length){SY.seq=0;SY.last={};return go2()}syApi('/api/push',{ops:ch[i]}).then(function(){nx(i+1)})})(0)}else go2()})}else go2()})}
function syLogin(cb){var pin=($('#bpin')||{}).value||'';if(!pin&&syTok()){return syResume(function(ok){if(ok)syStart(null,cb);else toast('Bitte die PIN eingeben')})}if(!pin)return toast('Bitte die PIN eingeben');
 syApi('/api/login',{name:S.user,pin:pin}).then(function(r){if(r.token){SY.tok=r.token;SY.name=S.user;try{localStorage.setItem('mflow.tok',r.token);localStorage.setItem('mflow.name',S.user)}catch(e){}syStart(r,cb)}else toast(r.error||'Anmeldung nicht möglich')})}
function syResume(cb){var t=syTok();if(!t)return cb(false);SY.tok=t;syApi('/api/me').then(function(r){if(r.name){SY.name=r.name;S.user=r.name;cb(true)}else{SY.tok=null;cb(false)}}).catch(function(){SY.tok=null;cb(false)})}
