/* ===== Monatsrückblick als Videodatei =====
   Zeichnet den Film in 1920×1080 auf eine Leinwand und nimmt ihn im Browser auf (MediaRecorder).
   Kein Server, keine Zusatzsoftware. MP4, wo der Browser es kann (Chrome, Edge, Safari), sonst WebM.
   Gleiche Zahlen wie der Film in der App (filmData). */
(function(){
'use strict';
var M=window.MF,W=1920,H=1080,BAR=110,MN=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
var C={bg:'#050506',ink:'#F3EFEA',dim:'#B8B1A9',mute:'#7B756E',sig:'#FF761B',met:'#E8620E',kst:'#3F93D6',ok:'#4FD1A1',warn:'#F5B14A',track:'rgba(255,236,220,.09)'};
var F={d:"'Big Shoulders Display','Barlow Condensed','Arial Narrow',sans-serif",b:"'Instrument Sans','Segoe UI',system-ui,sans-serif",m:"'JetBrains Mono','Cascadia Mono',ui-monospace,monospace"};
function ease(k){k=Math.max(0,Math.min(1,k));return 1-Math.pow(1-k,4)}
function de(n){return String(n).replace('.',',')}
function mime(){var L=['video/mp4;codecs=avc1.42E01E','video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];if(!window.MediaRecorder)return null;for(var i=0;i<L.length;i++)if(MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(L[i]))return L[i];return null}
window.filmVideoMime=mime;

/* Szenen: [Dauer s, Zeichenfunktion(ctx, Fortschritt t in s, Dauer)] */
function scenes(d,logo){var mon=MN[+d.ym.slice(5,7)-1]+' '+d.ym.slice(0,4),quote=d.n?Math.round(d.milk/(d.n*10)*100):0;
 var stL=Object.keys(d.st).sort(function(a,b){return d.st[b]-d.st[a]}).slice(0,5);
 function kick(x,t,s,y){x.globalAlpha=ease(t/.5);x.fillStyle=C.sig;x.font='600 26px '+F.m;x.textAlign='left';spaced(x,s.toUpperCase(),170,y||300,7)}
 function big(x,t,v,y,sz,col,lab){var k=ease((t-.25)/1.4);x.globalAlpha=ease((t-.1)/.6);x.fillStyle=col||C.ink;x.font='800 '+(sz||260)+'px '+F.d;x.textAlign='left';var s=String(Math.round(v*k));x.fillText(s,170,y);
  if(lab){var w=x.measureText(s).width;x.font='500 44px '+F.b;x.fillStyle=C.dim;x.fillText(lab,170+w+36,y)}}
 function delta(x,t,a,b,inv,X,Y){if(!b)return;var p=Math.round((a-b)/b*100),good=(p>=0)!==!!inv,col=p===0?C.dim:good?C.ok:C.warn,s=(p>0?'+':'')+p+' % zum Vormonat';x.globalAlpha=ease((t-1)/.6);x.font='600 28px '+F.m;var w=x.measureText(s).width+40;
  x.strokeStyle=col;x.lineWidth=2;rr(x,X,Y-40,w,56,28);x.stroke();x.fillStyle=col;x.fillText(s,X+20,Y-3)}
 function track(x,t,lab,v,mx,col,y,i,P){var k=ease((t-.5-i*.2)/1.3);x.globalAlpha=ease((t-.3-i*.2)/.5);x.fillStyle=C.ink;x.font='600 40px '+F.b;x.textAlign='left';x.fillText(lab,170,y+14);
  x.fillStyle=C.track;rr(x,520,y-16,680,34,17);x.fill();x.fillStyle=col;rr(x,520,y-16,Math.max(34,680*v/mx*k),34,17);x.fill();
  x.fillStyle=C.ink;x.font='800 84px '+F.d;x.textAlign='right';x.fillText(String(Math.round(v*k)),1390,y+30);x.textAlign='left';if(P!=null)delta(x,t,v,P,false,1430,y+24)}
 return [
  [3.6,function(x,t){x.textAlign='center';x.globalAlpha=ease(t/.6);x.fillStyle=C.sig;x.font='600 28px '+F.m;spaced(x,'MUNSCH LOGISTIK · MONATSRÜCKBLICK',W/2,380,8,true);
   x.globalAlpha=ease((t-.3)/.8);x.fillStyle=C.ink;x.font='800 230px '+F.d;var sc=1.06-.06*ease(t/3.6);x.save();x.translate(W/2,600);x.scale(sc,sc);x.fillText(mon.toUpperCase(),0,0);x.restore();
   x.globalAlpha=ease((t-.8)/.6);x.fillStyle=C.dim;x.font='500 34px '+F.m;x.fillText(d.n+' erfasste Arbeitstage',W/2,700);x.textAlign='left'}],
  [5.5,function(x,t){kick(x,t,'Wareneingang');big(x,t,d.pak,560,260,C.ink,'Pakete gebucht');delta(x,t,d.pak,d.pakP,false,170,650);
   var S0=d.series,mx=Math.max.apply(null,S0.map(function(s){return s[1]}).concat([1])),bw=1580/S0.length;x.globalAlpha=1;
   S0.forEach(function(s,i){var k=ease((t-.6-i*.035)/.7),h=200*s[1]/mx*k;x.fillStyle=C.sig;rr(x,170+i*bw+2,900-h,Math.max(3,bw-4),Math.max(2,h),5);x.fill()});
   x.globalAlpha=ease((t-1.4)/.6);x.fillStyle=C.dim;x.font='500 30px '+F.b;x.fillText(d.gb+' GB / Pal  ·  Ø '+(d.n?Math.round(d.pak/d.n):0)+' Pakete je Tag',170,955)}],
  [5.5,function(x,t){kick(x,t,'Sägen');big(x,t,d.met+d.kst,540,240,C.ink,'Teile gesägt');var mx=Math.max(d.met,d.kst,1);
   track(x,t,'Metall',d.met,mx,C.met,700,0,d.metP);track(x,t,'Kunststoff',d.kst,mx,C.kst,830,1,d.kstP)}],
  [5,function(x,t){kick(x,t,'Milkrun');var k=ease((t-.4)/1.8),cx=W/2+120,cy=620,R=230;x.globalAlpha=ease(t/.5);x.lineCap='round';x.lineWidth=34;x.strokeStyle=C.track;x.beginPath();x.arc(cx,cy,R,0,Math.PI*2);x.stroke();
   x.strokeStyle=C.sig;x.beginPath();x.arc(cx,cy,R,-Math.PI/2,-Math.PI/2+Math.PI*2*quote/100*k);x.stroke();x.fillStyle=C.ink;x.font='800 200px '+F.d;x.textAlign='center';x.fillText(String(Math.round(quote*k)),cx-30,cy+70);
   x.font='800 80px '+F.d;x.fillStyle=C.mute;x.fillText('%',cx+110,cy+70);x.textAlign='left';x.globalAlpha=ease((t-1)/.6);x.fillStyle=C.dim;x.font='500 40px '+F.b;x.fillText(d.milk+' von '+d.n*10,170,560);x.fillText('Runden beendet',170,620)}],
  [5.5,function(x,t){kick(x,t,'Störungen');big(x,t,d.stoer,540,240,C.ink,'Störungen und Abweichungen');delta(x,t,d.stoer,d.stoerP,true,170,630);
   if(!stL.length){x.globalAlpha=ease((t-1)/.6);x.fillStyle=C.dim;x.font='500 40px '+F.b;x.fillText('Keine Störungen erfasst.',170,760);return}var mx=d.st[stL[0]];
   stL.forEach(function(k,i){var y=720+i*70,e=ease((t-.8-i*.15)/1);x.globalAlpha=ease((t-.6-i*.15)/.5);x.fillStyle=C.ink;x.font='600 34px '+F.b;x.fillText(k,170,y+12);x.fillStyle=C.track;rr(x,700,y-12,800,24,12);x.fill();x.fillStyle=C.warn;rr(x,700,y-12,Math.max(24,800*d.st[k]/mx*e),24,12);x.fill();
    x.fillStyle=C.ink;x.font='800 52px '+F.d;x.textAlign='right';x.fillText(String(d.st[k]),1640,y+18);x.textAlign='left'})}],
  [4.5,function(x,t){kick(x,t,'Sicherheit');big(x,t,d.si.ok,600,280,C.ok,'unfallfreie Tage');x.globalAlpha=ease((t-1)/.6);x.fillStyle=C.dim;x.font='500 40px '+F.b;x.fillText(d.si.bei+' Beinaheunfälle  ·  '+d.si.unf+' Unfälle',170,720)}],
  [4.8,function(x,t){kick(x,t,'Bestwert');var v=d.best?(S.tz[d.best].we_pak||0):0;big(x,t,v,600,280,C.sig,'Pakete am stärksten Tag');x.globalAlpha=ease((t-1)/.6);x.fillStyle=C.dim;x.font='500 40px '+F.b;
   x.fillText(d.best?fmtD(d.best,{weekday:'long',day:'2-digit',month:'long'}):'',170,720);if(d.dank){x.globalAlpha=ease((t-1.6)/.6);x.fillStyle=C.ink;x.font='600 40px '+F.b;x.fillText(d.dank+' Mal Danke gesagt',170,820)}}],
  [4,function(x,t){x.textAlign='center';x.globalAlpha=ease(t/.6);x.fillStyle=C.sig;x.font='600 30px '+F.m;spaced(x,'DANKE, TEAM.',W/2,400,10,true);x.globalAlpha=ease((t-.3)/.8);x.fillStyle=C.ink;x.font='800 220px '+F.d;x.fillText('WEITER SO.',W/2,620);
   if(logo){x.globalAlpha=ease((t-.9)/.6);var lh=90,lw=lh*logo.width/logo.height;x.drawImage(logo,W/2-lw/2,690,lw,lh)}x.textAlign='left'}]]}
function rr(x,X,Y,w,h,r){r=Math.min(r,h/2,w/2);x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
function spaced(x,s,X,Y,sp,center){var w=0,i;for(i=0;i<s.length;i++)w+=x.measureText(s[i]).width+sp;w-=sp;var al=x.textAlign;x.textAlign='left';var cx=center?X-w/2:X;for(i=0;i<s.length;i++){x.fillText(s[i],cx,Y);cx+=x.measureText(s[i]).width+sp}x.textAlign=al}
/* ein Bild zum Zeitpunkt T (s) */
function paint(x,SC,T){var acc=0,i;for(i=0;i<SC.length;i++){if(T<acc+SC[i][0])break;acc+=SC[i][0]}if(i>=SC.length){i=SC.length-1;acc-=SC[i][0]}var t=T-acc,D=SC[i][0];
 x.globalAlpha=1;x.fillStyle=C.bg;x.fillRect(0,0,W,H);var g=x.createRadialGradient(W*.3,H*.45,0,W*.3,H*.45,W*.7);g.addColorStop(0,'rgba(255,118,27,'+(.10+.04*Math.sin(T*.7)).toFixed(3)+')');g.addColorStop(1,'rgba(255,118,27,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.save();var fade=Math.min(1,t/.35,(D-t)/.35);x.globalAlpha=1;SC[i][1](x,t,D);x.restore();
 if(fade<1){x.globalAlpha=1-fade;x.fillStyle=C.bg;x.fillRect(0,0,W,H)}
 x.globalAlpha=1;x.fillStyle='#000';x.fillRect(0,0,W,BAR);x.fillRect(0,H-BAR,W,BAR);
 var tot=SC.reduce(function(a,s){return a+s[0]},0);x.fillStyle='rgba(255,236,220,.15)';x.fillRect(170,H-56,W-340,4);x.fillStyle=C.sig;x.fillRect(170,H-56,(W-340)*Math.min(1,T/tot),4);
 x.fillStyle=C.mute;x.font='500 22px '+F.m;x.textAlign='right';x.fillText('MUNSCH Flow',W-170,H-72);x.textAlign='left';return tot}
window.filmVideoPaint=function(ym,T){var c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');paint(x,scenes(filmData(ym),null),T);return c};
function loadLogo(){return new Promise(function(ok){try{var s=logoSVG({h:90});if(s.indexOf('xmlns=')<0)s=s.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');var i=new Image();i.onload=function(){ok(i)};i.onerror=function(){ok(null)};i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s)}catch(e){ok(null)}})}
function fonts(){try{return Promise.all(['800 100px '+F.d,'600 30px '+F.b,'500 30px '+F.b,'600 30px '+F.m].map(function(f){return document.fonts.load(f)})).catch(function(){})}catch(e){return Promise.resolve()}}
var REC=null;
function lastYm(){var k=Object.keys(S.tz).filter(function(x){return Object.keys(S.tz[x]).length}).sort();return k.length?k[k.length-1].slice(0,7):todayIso().slice(0,7)}
window.recordFilm=function(ym){ym=ym||lastYm();var d=filmData(ym);if(!d.n)return toast('Für '+ym+' gibt es keine Tageszahlen');
 recordScenes({title:'Monatsrückblick als Video',sub:MN[+ym.slice(5,7)-1]+' '+ym.slice(0,4),fn:'MUNSCH-Monatsrueckblick-'+ym,make:function(logo){return scenes(d,logo)}})};
/* Allgemeine Aufnahme: o = {title, sub, fn (ohne Endung), make(logo) → Szenen} */
function recordScenes(o){var mt=mime();if(!mt)return toast('Dieser Browser kann keine Videos aufnehmen. Bitte Chrome oder Edge nehmen.');
 modal('<h3>'+esc(o.title)+'</h3><p class="dim" style="margin:0 0 14px">'+esc(o.sub)+' · 1920 × 1080 · '+(mt.indexOf('mp4')>=0?'MP4':'WebM')+'. Die Aufnahme läuft in Echtzeit, bitte dieses Fenster offen lassen.</p><div class="vr-prev"><canvas id="vrc" width="'+W+'" height="'+H+'"></canvas></div><div class="vr-bar"><i id="vrb"></i></div><div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px"><span class="dim mono" id="vrt" style="margin-right:auto;align-self:center"></span><button class="btn" data-act="vrx">Abbrechen</button></div>');
 var c=$('#vrc'),x=c.getContext('2d');Promise.all([fonts(),loadLogo()]).then(function(r){if(!$('#vrc'))return;var SC=o.make(r[1]),tot=SC.reduce(function(a,s){return a+s[0]},0),st=c.captureStream(30),mr=new MediaRecorder(st,{mimeType:mt,videoBitsPerSecond:8e6}),parts=[];
  REC={mr:mr,stop:false};mr.ondataavailable=function(e){if(e.data&&e.data.size)parts.push(e.data)};
  mr.onstop=function(){st.getTracks().forEach(function(t){t.stop()});if(REC&&REC.stop){REC=null;return}REC=null;var b=new Blob(parts,{type:mt.split(';')[0]}),u=URL.createObjectURL(b),ext=mt.indexOf('mp4')>=0?'mp4':'webm',fn=o.fn+'.'+ext;
   var a=document.createElement('a');a.href=u;a.download=fn;document.body.appendChild(a);a.click();setTimeout(function(){a.parentNode.removeChild(a);URL.revokeObjectURL(u)},4000);
   closeModal();toast('Video gespeichert: '+fn+' ('+(b.size/1048576).toFixed(1).replace('.',',')+' MB)');try{fx.ok()}catch(e){}};
  paint(x,SC,0);mr.start(500);var t0=performance.now();
  (function f(){if(!REC)return;var T=(performance.now()-t0)/1000;paint(x,SC,Math.min(T,tot));var b=$('#vrb'),tt=$('#vrt');if(b)b.style.width=(Math.min(1,T/tot)*100).toFixed(1)+'%';if(tt)tt.textContent=Math.min(Math.ceil(T),Math.ceil(tot))+' / '+Math.ceil(tot)+' s';
   if(T>=tot+.4){mr.stop();return}requestAnimationFrame(f)})()})}

ACT.vrx=function(){if(REC){REC.stop=true;try{REC.mr.stop()}catch(e){}}closeModal()};
ACT.filmvid=function(d){recordFilm(d&&d.ym)};
/* Knopf in der Auswertung neben „Monat als Film“ */
var aw=VIEW.ausw;VIEW.ausw=function(){var h=aw.apply(this,arguments),m=/data-act="film" data-ym="([0-9-]+)"/.exec(h);if(!m||!mime())return h;return h.replace('▶ Monat als Film</button>','▶ Monat als Film</button><button class="btn sm" data-act="filmvid" data-ym="'+m[1]+'">Als Video speichern</button>')};
/* und im Film selbst */
var of=window.openFilm;window.openFilm=function(ym){of.apply(this,arguments);var c=$('#film .fctl');if(c&&mime()&&!c.querySelector('[data-act="filmvid2"]')){var b=document.createElement('button');b.className='btn sm ghost';b.setAttribute('data-act','filmvid2');b.textContent='Als Video';c.insertBefore(b,c.lastChild)}FYM=ym};
window.filmKit={W:W,H:H,C:C,F:F,ease:ease,rr:rr,spaced:spaced,paint:paint,fonts:fonts,loadLogo:loadLogo,mime:mime,record:recordScenes};
var FYM=null;ACT.filmvid2=function(){var y=FYM;ACT.flx();setTimeout(function(){recordFilm(y)},200)};
})();
