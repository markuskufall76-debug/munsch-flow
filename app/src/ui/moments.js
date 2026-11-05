/* ===== Momente: Rekord-Szene, Ruhemodus, Morgenauftakt im Shopfloor ===== */
(function(){
'use strict';
var M=window.MF,RM=M.RM,ls=M.ls;
function host(){return $('#mon')||document.body}
function cu(e,from,to,D){if(RM){e.textContent=to;return}var t0=performance.now();(function f(t){var k=Math.min(1,(t-t0)/D);e.textContent=Math.round(from+(to-from)*(1-Math.pow(1-k,4)));if(k<1)requestAnimationFrame(f)})(t0)}
function dd(d){return fmtD(d,{weekday:'short',day:'2-digit',month:'2-digit',year:'2-digit'})}

/* ---------- 1  Rekord-Momente ----------
   Liegt ein heutiger Wert über dem Höchstwert aller bisherigen Tage, zeigt jedes Gerät einmal die Rekord-Szene.
   Prüfung lokal nach jeder Eingabe und alle 5 s (so kommen Rekorde von der Station auch auf dem Monitor an). */
var REC=[['we_pak','Pakete im Wareneingang',function(o){return o.we_pak}],['ms_ist','Teile an der Metallsäge',function(o){return o.ms_ist}],['ks_ist','Teile an der Kunststoffsäge',function(o){return o.ks_ist}],
 ['saege','Teile gesägt, beide Sägen',function(o){return o.ms_ist==null&&o.ks_ist==null?null:(+o.ms_ist||0)+(+o.ks_ist||0)}],['we_gbpal','GB / Pal im Wareneingang',function(o){return o.we_gbpal}]];
function best(r,t){var mx=0,at=null;Object.keys(S.tz).forEach(function(d){if(d>=t)return;var v=r[2](S.tz[d]||{});if(v!=null&&+v>mx){mx=+v;at=d}});return {v:mx,d:at}}
window.recNow=function(t){t=t||todayIso();var o=S.tz[t]||{},out=[];REC.forEach(function(r){var v=r[2](o);if(v==null||!(+v>0))return;var b=best(r,t);if(b.v>0&&+v>b.v)out.push({k:r[0],t:r[1],v:+v,b:b})});return out};
function recCheck(){if(!S||!S.user||$('#rec'))return;var t=todayIso(),R=recNow(t);for(var i=0;i<R.length;i++){var r=R[i],key='mf.rec.'+t+'.'+r.k;if(ls(key))continue;ls(key,String(r.v));recShow(r);return}}
window.recShow=function(r){var o=$('#rec');if(o)o.remove();var d=document.createElement('div');d.id='rec';d.setAttribute('role','alert');
 var conf='';if(!RM)for(var i=0;i<70;i++){var c=['var(--signal)','#FFB07A','#F3EFEA','var(--ok)'][i%4];conf+='<i style="--x:'+(Math.random()*100).toFixed(1)+'%;--d:'+(Math.random()*.9).toFixed(2)+'s;--r:'+Math.round(Math.random()*720-360)+'deg;--s:'+(.6+Math.random()*.9).toFixed(2)+';background:'+c+'"></i>'}
 d.innerHTML='<div class="rc-conf">'+conf+'</div><div class="rc-in"><div class="rc-k">Neuer Rekord</div><div class="rc-v"><b id="rcv">'+r.b.v+'</b></div><div class="rc-t">'+esc(r.t)+'</div><div class="rc-s">bisher '+r.b.v+(r.b.d?' am '+dd(r.b.d):'')+' · heute '+r.v+' · '+(r.v-r.b.v>0?'+'+(r.v-r.b.v):'')+'</div></div>';
 host().appendChild(d);try{fx.ok(true)}catch(e){}setTimeout(function(){var e=$('#rcv');if(e)cu(e,r.b.v,r.v,1600)},450);
 d.addEventListener('click',function(){d.remove()});setTimeout(function(){if(d.parentNode){d.classList.add('out');setTimeout(function(){d.remove()},600)}},6500)};
var ts0=window.tzSet;if(ts0)window.tzSet=function(){var r=ts0.apply(this,arguments);setTimeout(recCheck,350);return r};
setInterval(recCheck,5000);

/* ---------- 2  Ruhemodus ----------
   Wird ein Bildschirm eine Weile nicht bedient, zeigt er Uhr, Schicht als Lichtband und wechselnde Kennzahlen.
   Warnungen erscheinen sofort oben. Jede Berührung oder Taste beendet den Ruhemodus. Einstellung je Gerät. */
var AMB={t:0,i:0,rot:0,upd:0,last:Date.now()};
function idleMin(){var v=S.ui.idle;if(v==null)return M.FINE?5:0;return +v}
function busy(){return !S||!S.user||$('#modal')||$('#film')||$('#remote')||$('#rec')||$('#tour')||$('#sfi')||$('#mon')||$('#pal')||(window.isStation&&isStation())||!$('#stage')}
function figs(){var t=todayIso(),fs=fachStat(),mk=mkDay(t),done=0,i;for(i=0;i<10;i++)if(mk[i]&&mk[i].e)done++;var F=[],w=isWork(t),o=S.tz[t]||{};
 F.push([fs.o,'/ '+fs.n,'Fächer belegt',fs.l?fs.l+' Langlieger':fs.fr+' frei']);
 if(w)F.push([done,'/ 10','Milkrun-Runden',done===10?'alle erledigt':'heute']);
 if(w&&window.fcast)['ms','ks'].forEach(function(id){var r=fcast(id);if(r&&(r.n||r.ist))F.push([r.mid,r.tg!=null?'/ '+r.tg:'',id==='ms'?'Säge Metall · Prognose':'Säge Kunststoff · Prognose',r.ist+' bisher gesägt'])});
 if(w)F.push([+o.we_pak||0,'','Pakete heute gebucht','Wareneingang']);
 var nx=w?t:nextWork(t);F.push([presentOn(nx).length,'/ '+CREW.length,'im Dienst',w?'heute':fmtD(nx,{weekday:'long'})]);
 return F}
function ambDraw(){var a=$('#amb');if(!a)return;var now=new Date(),si=shiftInfo(now),al=alerts(now).filter(function(x){return x.tone==='crit'||x.tone==='warn'}),F=figs();AMB.F=F;
 var beads='';for(var i=0;i<10;i++){var p=mkPlan(i).min,r=mkDay(todayIso())[i];beads+='<i class="'+(r&&r.e?'ok':'')+'" style="left:'+((p-360)/540*100).toFixed(1)+'%"></i>'}
 a.querySelector('.am-al').innerHTML=al.length?al.slice(0,3).map(function(x){return '<div class="'+x.tone+'"><i></i>'+esc(x.t)+'</div>'}).join(''):'';
 a.querySelector('.am-st').textContent=si.txt;
 a.querySelector('.am-band').innerHTML='<span class="fill" style="width:'+(si.p*100).toFixed(1)+'%"></span>'+beads+(si.state==='lauf'?'<span class="now" style="left:'+(si.p*100).toFixed(1)+'%"></span>':'');
 a.querySelector('.am-lbl').innerHTML='<span>06:00</span><span>'+(si.state==='lauf'?'Schicht '+Math.round(si.p*100)+' %':si.state==='vor'?'vor Schichtbeginn':si.state==='ende'?'Schicht beendet':'kein Betrieb')+'</span><span>15:00</span>';
 ambClock()}
function ambClock(){var a=$('#amb');if(!a)return;var n=new Date();a.querySelector('.am-clk').innerHTML=('0'+n.getHours()).slice(-2)+'<i>:</i>'+('0'+n.getMinutes()).slice(-2);a.querySelector('.am-dt').textContent=n.toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'long'})}
function ambFig(){var a=$('#amb');if(!a||!AMB.F||!AMB.F.length)return;var f=AMB.F[AMB.i%AMB.F.length],box=a.querySelector('.am-fig');AMB.i++;
 var n=document.createElement('div');n.className='am-f';n.innerHTML='<div class="am-n"><b>'+f[0]+'</b><small>'+esc(f[1])+'</small></div><div class="am-l">'+esc(f[2])+'</div><div class="am-s">'+esc(f[3])+'</div>';
 var old=box.querySelector('.am-f');if(old){old.classList.add('out');setTimeout(function(){old.remove()},900)}box.appendChild(n);var b=n.querySelector('b');if(+f[0]>1)cu(b,0,+f[0],1100);
 a.querySelector('.am-dots').innerHTML=AMB.F.map(function(x,k){return '<i class="'+(k===(AMB.i-1)%AMB.F.length?'on':'')+'"></i>'}).join('')}
window.ambientOn=function(){if($('#amb'))return;var a=document.createElement('div');a.id='amb';a.setAttribute('aria-label','Ruhemodus, Taste oder Berührung beendet ihn');
 a.innerHTML='<div class="am-glow"></div><div class="am-al" aria-live="assertive"></div><div class="am-top">'+logoSVG({h:34})+'<span class="am-st"></span></div><div class="am-mid"><div><div class="am-clk"></div><div class="am-dt"></div></div><div class="am-fig"></div></div><div class="am-bot"><div class="am-band"></div><div class="am-lbl"></div><div class="am-dots"></div><div class="am-hint">Tippen oder Taste drücken zum Fortsetzen</div></div>';
 document.body.appendChild(a);AMB.i=0;ambDraw();ambFig();clearInterval(AMB.rot);clearInterval(AMB.upd);AMB.rot=setInterval(ambFig,8000);AMB.upd=setInterval(function(){ambDraw()},10000);AMB.ck=setInterval(ambClock,5000);
 try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(function(w){AMB.wl=w}).catch(function(){})}catch(e){}};
window.ambientOff=function(){var a=$('#amb');if(!a)return;clearInterval(AMB.rot);clearInterval(AMB.upd);clearInterval(AMB.ck);try{if(AMB.wl)AMB.wl.release()}catch(e){}a.classList.add('out');setTimeout(function(){a.remove()},500);AMB.last=Date.now()};
['pointerdown','keydown','wheel','touchstart'].forEach(function(ev){document.addEventListener(ev,function(e){AMB.last=Date.now();if($('#amb')&&!$('#amb').classList.contains('out')){e.preventDefault();e.stopPropagation();ambientOff()}},{capture:true,passive:false})});
document.addEventListener('pointermove',function(){AMB.last=Date.now()},{passive:true});
setInterval(function(){var m=idleMin();if(!m||$('#amb')||busy())return;if(Date.now()-AMB.last>m*60000)ambientOn()},15000);
/* Einstellung */
var adm1=VIEW.adm;VIEW.adm=function(){var h=adm1.apply(this,arguments),v=idleMin();
 return h+M.card('Ruhemodus','<div class="fl" style="margin-bottom:8px">Nach wie vielen Minuten ohne Bedienung</div><div class="seg">'+[[0,'aus'],[3,'3 Min.'],[5,'5 Min.'],[10,'10 Min.'],[30,'30 Min.']].map(function(x){return '<button class="'+(v===x[0]?'on':'')+'" data-act="idleset" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div><div style="display:flex;gap:10px;margin-top:14px"><button class="btn" data-act="ambnow">Jetzt zeigen</button></div><p class="dim" style="font-size:12.5px;margin:12px 0 0">Gilt für dieses Gerät. Uhr, Schicht als Lichtband und wechselnde Kennzahlen, Warnungen erscheinen sofort. Auf Tablets der Station nie.</p>')};
ACT.idleset=function(d){S.ui.idle=+d.v;save();render()};ACT.ambnow=function(){setTimeout(ambientOn,120)};

/* ---------- 3  Morgenauftakt im Shopfloor ----------
   Beim Eröffnen der Runde: fünf Sekunden „Gestern in Zahlen“, danach die erste Folie. Klick oder Esc überspringt.
   Der große Monitor spielt den Auftakt auch, wenn die Runde am Handy eröffnet wurde. */
function introData(){var t=todayIso(),l=tzLatest(prevWork(t)),o=l?S.tz[l]||{}:{},f=l?tzFn(o):null;if(!l)return null;
 var N=[[+o.we_pak||0,'Pakete gebucht'],[+o.ms_ist||0,'Teile Metallsäge'],[+o.ks_ist||0,'Teile Kunststoffsäge'],[(+o.milkrun||0)+'/10','Milkrun-Runden'],[f?f.stoer:0,'Störungen']];
 return {d:l,N:N}}
window.sfIntro=function(){if($('#sfi')||$('#remote'))return;var D=introData();if(!D)return;var d=document.createElement('div');d.id='sfi';d.setAttribute('role','dialog');d.setAttribute('aria-label','Gestern in Zahlen');
 var h=new Date().getHours();
 d.innerHTML='<div class="si-glow"></div><div class="si-in"><div class="si-k">Shopfloor 06:45 · '+(h<11?'Guten Morgen':'Hallo')+', Team</div><h2>'+(D.d===prevWork(todayIso())?'Gestern':'Zuletzt')+' in Zahlen</h2><div class="si-d">'+fmtD(D.d,{weekday:'long',day:'2-digit',month:'long'})+'</div>'
  +'<div class="si-n">'+D.N.map(function(n,i){return '<div style="--i:'+i+'"><b data-to="'+n[0]+'">'+n[0]+'</b><span>'+esc(n[1])+'</span></div>'}).join('')+'</div></div><div class="si-bar"><i></i></div><button class="btn sm ghost si-x" data-act="sfix">Überspringen</button>';
 document.body.appendChild(d);
 if(!RM)d.querySelectorAll('.si-n b').forEach(function(b,i){var v=b.dataset.to,m=/^(\d+)(\/10)?$/.exec(v);if(!m)return;var to=+m[1];b.textContent='0'+(m[2]||'');setTimeout(function(){var t0=performance.now();(function f(t){var k=Math.min(1,(t-t0)/1100);b.textContent=Math.round(to*(1-Math.pow(1-k,4)))+(m[2]||'');if(k<1)requestAnimationFrame(f)})(t0)},500+i*180)});
 d.addEventListener('click',function(e){if(e.target===d||e.target.closest('.si-in'))ACT.sfix()});
 SFI=setTimeout(ACT.sfix,RM?3500:5600)};
var SFI=0;ACT.sfix=function(){clearTimeout(SFI);var d=$('#sfi');if(!d)return;d.classList.add('out');setTimeout(function(){d.remove()},600)};
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('#sfi')){e.stopPropagation();ACT.sfix()}},true);
/* In automatisierten Tests nur auf ausdrücklichen Wunsch, damit Klickfolgen nicht unterbrochen werden */
function introOk(){return !navigator.webdriver||window.__sfi}
var rs0=ACT.rstart;if(rs0)ACT.rstart=function(){var had=!!(S.runde[todayIso()]||{}).t0,r=rs0.apply(this,arguments);if(!had&&introOk())sfIntro();return r};
/* Monitor folgt: Runde wurde woanders gerade eröffnet */
var seenT0=null;setInterval(function(){if(S.ui.page!=='runde'||!S.ui.rpm)return;var r=(S.runde||{})[todayIso()]||{};if(seenT0===null){seenT0=r.t0||0;return}if(r.t0&&r.t0!==seenT0){seenT0=r.t0;if(Date.now()-r.t0<120000&&introOk())sfIntro()}},1500);
})();
