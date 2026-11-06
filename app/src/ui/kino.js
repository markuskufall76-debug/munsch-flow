/* ===== Kino-Hintergrund =====
   Bewegter Hintergrund wie eine Filmaufnahme: Licht fällt schräg durch Hallendunst, Nebel zieht langsam,
   ein dezenter anamorpher Lichtstreifen, Vignette und feines Filmkorn. Gerechnet als WebGL-Shader in
   niedriger Auflösung (wirkt dadurch weich wie Footage), höchstens 30 Bilder je Sekunde.
   Stimmung aus der Warnlage: ruhig orange, Achtung bernstein, Problem rot, Übergang fließend.
   Eigenes Video je Gerät: eine MP4/WebM-Datei (z. B. Aufnahme der Halle) bleibt im Browser (IndexedDB),
   wird farblich abgedunkelt und vom Licht überlagert.
   Aus: ruhiger Modus, Station, helle Darstellung, Einstellung „Aus“, automatisierte Tests (außer window.__kino).
   Reduzierte Bewegung: ein stehendes Bild. Spart Leistung: pausiert bei verdecktem Tab und Vollbild-Szenen,
   senkt die Auflösung selbst, wenn das Gerät nicht mitkommt. */
(function(){
'use strict';
var M=window.MF,card=M.card,ls=M.ls,RM=M.RM,root=document.documentElement;
var VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
var FS=['precision mediump float;uniform vec2 R;uniform float T;uniform vec3 A;uniform vec3 B;uniform float V;uniform float G;uniform float X;uniform float S;uniform vec2 P;',
 'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
 'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}',
 'float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}',
 'void main(){vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;vec2 p=vec2(uv.x*ar,uv.y);float t=T;',
 /* Dunst mit Tiefe: zwei Schichten, die vordere folgt der Maus stärker (Parallaxe) */
 ' vec2 pf=p+P*.05,pb=p+P*.02;',
 ' vec2 q=vec2(fbm(pb*1.1+vec2(t*.016,0.)),fbm(pb*1.1+vec2(3.1,t*.012)));',
 ' float fog=fbm(pb*1.5+q*1.6+vec2(t*.022,-t*.009));float fog2=fbm(pf*3.2+q*2.+vec2(-t*.05,t*.02));',
 /* Sonne wandert mit der Uhrzeit von links nach rechts, Lichtkegel zielt zur Bildmitte */
 ' float lo=mix(.08,.2,clamp(1.-(ar-.6),0.,1.));vec2 sp=vec2(ar*mix(lo,1.-lo,S),1.2)+P*vec2(.12,.05);vec2 d=p-sp;float an=atan(d.y,d.x),di=length(d);vec2 c0=vec2(ar*.5,.42);vec2 dc=c0-sp;float ax=atan(dc.y,dc.x),rl=an-ax;',
 ' float w=fbm(vec2(an*1.8,t*.03))*3.;float r=pow(.5+.5*sin(an*12.+t*.05+w),3.)*.6+pow(.5+.5*sin(an*5.-t*.035+1.3+w*.5),2.)*.55;r+=pow(.5+.5*sin(an*31.+t*.02+w*.3),14.)*.75*(.4+.6*n(vec2(an*6.,t*.1)));',
 ' r*=smoothstep(.95,.4,abs(rl))*smoothstep(2.6,.15,di);',
 /* Wolkenschatten ziehen über die Lichtbahnen, Licht atmet */
 ' float cl=smoothstep(.28,.72,fbm(vec2(an*2.2-t*.045,t*.012)+3.));float br=.86+.14*sin(t*.11)*sin(t*.071+1.);',
 ' float beam=r*(.22+1.1*fog*fog)*(.3+.7*cl)*br;',
 ' vec3 g=mix(vec3(.034,.04,.05),vec3(0.),V);vec3 c=g;',
 ' c+=A*beam*.72;c+=mix(A,vec3(1.,.8,.6),.3)*pow(beam,2.)*.42;',
 ' c+=mix(A,B,.5)*fog*fog*.15+mix(A,vec3(.7,.8,1.),.5)*fog2*fog2*fog*.06;',
 ' c+=mix(A,vec3(1.,.86,.72),.4)*.32*exp(-di*2.)*br;',
 ' c+=A*.07*smoothstep(1.2,0.,length(p-vec2(ar*(1.-S*.8),.02)));',
 /* Objektiv: anamorpher Streifen durch die Lichtquelle und weiche Reflexe entlang der Achse */
 ' float sy=clamp(sp.y,.0,1.)-.06+.03*sin(t*.06);c+=mix(A,vec3(.75,.85,1.),.45)*.05*exp(-pow((uv.y-sy)*30.,2.))*exp(-pow((p.x-sp.x)*.9,2.))*(.6+.4*sin(t*.23));',
 ' for(int k=0;k<3;k++){float f=1.35+float(k)*.55;vec2 gp=sp+dc*f;float rr=.05+float(k)*.045;float e=smoothstep(rr,rr*.55,length(p-gp))-.6*smoothstep(rr*.8,rr*.4,length(p-gp));c+=mix(A,vec3(.45,.75,1.),float(k)*.4)*e*.05*br;}',
 /* Farbgebung: Schatten kühl, Lichter warm, weiche Kontrastkurve */
 ' c=g+(c-g)*G;c*=X;float lu=dot(c,vec3(.3,.59,.11));c=mix(c*vec3(.8,1.,1.22),c,smoothstep(.02,.16,lu));',
 ' c=pow(c,vec3(1.18))*1.3;c=c/(1.+c*.2);vec2 v=uv-.5;c*=1.-dot(v,v)*(1.2+.4*V);',
 ' c+=(h(gl_FragCoord.xy+fract(t*7.)*91.)-.5)/255.;gl_FragColor=vec4(c,1.);}'].join('\n');
var MOOD=[[[1,.46,.11],[1,.6,.3]],[[1,.56,.16],[1,.6,.28]],[[1,.36,.16],[.95,.4,.3]]];
var cv=null,gl=null,U={},run=false,raf=0,t0=performance.now(),last=0,lastR=0,scale=.42,ivs=[],cur=null,tgt=MOOD[0],mdT=0,vid=null,EX={v:1,from:1,to:1,t0:0,d:1},PT={x:0,y:0,tx:0,ty:0};

function mode(){return ls('mflow.kino')||'on'}
function dark(){var g=getComputedStyle(root).getPropertyValue('--ground').trim().toLowerCase();return !(g>'#8')}
function want(){return mode()!=='off'&&!root.classList.contains('lite')&&dark()&&!(window.isStation&&isStation())&&!$('#stn')&&!(navigator.webdriver&&!window.__kino)}
function covered(){return document.hidden||!!document.querySelector('#clip,#film,#mon,#amb,#sfi')}

function init(){if(gl)return true;try{cv=document.createElement('canvas');cv.id='kino';cv.setAttribute('aria-hidden','true');
 gl=cv.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'});if(!gl){cv=null;return false}
 var sh=function(ty,src){var s=gl.createShader(ty);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
 var pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error('link');gl.useProgram(pr);
 var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);var lp=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
 ['R','T','A','B','V','G','X','S','P'].forEach(function(k){U[k]=gl.getUniformLocation(pr,k)});
 cv.addEventListener('webglcontextlost',function(e){e.preventDefault();stop();gl=null;cv.remove();cv=null},false);
 var l=$('#light');(l&&l.parentNode?l.parentNode:document.body).insertBefore(cv,l?l.nextSibling:document.body.firstChild);return true}
 catch(e){console.warn('Kino-Hintergrund aus: '+e.message);gl=null;if(cv)cv.remove();cv=null;return false}}
function size(){if(!cv)return;var w=Math.max(160,Math.min(1100,Math.round(innerWidth*scale))),h=Math.max(90,Math.round(w*innerHeight/Math.max(1,innerWidth)));if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;gl.viewport(0,0,w,h)}}
function moodT(){try{var a=alerts(new Date());tgt=MOOD[a.some(function(x){return x.tone==='crit'})?2:a.length?1:0]}catch(e){}}
function draw(T){size();if(!cur)cur=JSON.parse(JSON.stringify(tgt));for(var i=0;i<2;i++)for(var k=0;k<3;k++)cur[i][k]+=(tgt[i][k]-cur[i][k])*.03;
 gl.uniform2f(U.R,cv.width,cv.height);gl.uniform1f(U.T,T);gl.uniform3fv(U.A,cur[0]);gl.uniform3fv(U.B,cur[1]);gl.uniform1f(U.V,vid?1:0);gl.uniform1f(U.G,innerWidth<820?(root.classList.contains('open')?1.05:1.45):(root.classList.contains('open')?.92:1));gl.uniform1f(U.X,expo());gl.uniform1f(U.S,sun());PT.x+=(PT.tx-PT.x)*.05;PT.y+=(PT.ty-PT.y)*.05;gl.uniform2f(U.P,PT.x,PT.y);gl.drawArrays(gl.TRIANGLES,0,3)}
function frame(now){if(!run)return;raf=requestAnimationFrame(frame);if(covered())return;
 if(lastR){ivs.push(now-lastR);if(ivs.length>120){var av=ivs.reduce(function(a,b){return a+b},0)/ivs.length;ivs=[];if(av>45&&scale>.2)scale=Math.max(.2,scale*.8)}}lastR=now;
 if(now-last<33)return;last=now;if(now-mdT>5000){mdT=now;moodT()}draw((now-t0)/1000+40)}
function start(){if(run||!init())return;run=true;if(!root.classList.contains('kino'))root.classList.add('kino');moodT();cur=null;
 if(RM){draw(52);run=false;return}ramp(0,1,$('#intro')?3200:1800);last=0;lastR=0;raf=requestAnimationFrame(frame)}
function stop(){run=false;cancelAnimationFrame(raf)}
/* Belichtung: Aufblenden aus Schwarz, kurzes Aufatmen beim Seitenwechsel */
function expo(){var k=Math.min(1,(performance.now()-EX.t0)/EX.d),e=1-Math.pow(1-k,3);return EX.from+(EX.to-EX.from)*e}
function ramp(from,to,d){EX.from=from;EX.to=to;EX.t0=performance.now();EX.d=d}
function pulse(){if(RM||!run)return;ramp(1.28,1,1400)}
/* Sonnenstand aus der Uhrzeit: 06:00 links, 15:00 rechts */
function sun(){var n=new Date(),h=n.getHours()+n.getMinutes()/60;return Math.max(0,Math.min(1,(h-6)/9))}
addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;PT.tx=e.clientX/innerWidth-.5;PT.ty=-(e.clientY/innerHeight-.5)},{passive:true});
var on=null;
function apply(force){var w=want();if(w===on&&!force)return;on=w;if(w)start();else{stop();if(root.classList.contains('kino'))root.classList.remove('kino');if(cv){cv.remove();cv=null;gl=null}}vShow(w)}

/* ---------- eigenes Video ---------- */
function idb(){return new Promise(function(ok,no){if(!window.indexedDB)return no(new Error('kein IndexedDB'));var r=indexedDB.open('mflow-kino',1);r.onupgradeneeded=function(){r.result.createObjectStore('v')};r.onsuccess=function(){ok(r.result)};r.onerror=function(){no(r.error)}})}
function tx(m,fn){return idb().then(function(db){return new Promise(function(ok,no){var t=db.transaction('v',m),q=fn(t.objectStore('v'));t.oncomplete=function(){ok(q&&q.result)};t.onerror=function(){no(t.error)}})})}
var vBlob=null;
function vShow(on){var el=$('#kinov');if(!on||!vBlob){if(el){URL.revokeObjectURL(el.src);el.remove()}vid=null;if(root.classList.contains('kino-vid'))root.classList.remove('kino-vid');return}
 if(el)return;el=document.createElement('video');el.id='kinov';el.muted=true;el.loop=true;el.autoplay=true;el.playsInline=true;el.setAttribute('playsinline','');el.setAttribute('aria-hidden','true');el.src=URL.createObjectURL(vBlob);
 var l=$('#light');(l&&l.parentNode||document.body).insertBefore(el,l?l.nextSibling:document.body.firstChild);vid=el;root.classList.add('kino-vid');var p=el.play();if(p&&p.catch)p.catch(function(){});
 if(RM&&cv&&gl)draw(52)}
document.addEventListener('visibilitychange',function(){var v=$('#kinov');if(!v)return;if(document.hidden)v.pause();else{var p=v.play();if(p&&p.catch)p.catch(function(){})}});
function vLoad(){return tx('readonly',function(s){return s.get('bg')}).then(function(b){vBlob=b||null;apply(true)}).catch(function(){})}

/* ---------- Einstellungen ---------- */
var adm=VIEW.adm;VIEW.adm=function(){var h=adm.apply(this,arguments),m=mode(),ok=!!window.WebGLRenderingContext;
 return h+card('Kino-Hintergrund','<div class="seg"><button class="'+(m!=='off'?'on':'')+'" data-act="kinoset" data-v="on">an</button><button class="'+(m==='off'?'on':'')+'" data-act="kinoset" data-v="off">aus</button></div>'
  +'<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px"><button class="btn" data-act="kinofile">'+(vBlob?'Anderes Video wählen':'Eigenes Video wählen')+'</button>'+(vBlob?'<button class="btn ghost" data-act="kinodel">Video entfernen</button>':'')+'</div>'
  +'<p class="dim" style="font-size:12.5px;margin:12px 0 0">Bewegtes Licht wie im Film, Stimmung folgt der Warnlage. Eigenes Video (MP4 oder WebM, z. B. eine Aufnahme der Halle) bleibt nur auf diesem Gerät, läuft stumm und abgedunkelt. Aus im ruhigen Modus, an der Station und in heller Darstellung.'+(ok?'':' Dieses Gerät kann kein WebGL, es bleibt beim einfachen Hintergrund.')+'</p>')};
ACT.kinoset=function(d){ls('mflow.kino',d.v);apply();render()};
ACT.kinofile=function(){var i=document.createElement('input');i.type='file';i.accept='video/mp4,video/webm,video/*';i.onchange=function(){var f=i.files&&i.files[0];if(!f)return;if(f.size>400*1048576)return toast('Video zu groß (höchstens 400 MB)');
  tx('readwrite',function(s){return s.put(f,'bg')}).then(function(){vBlob=f;var el=$('#kinov');if(el){URL.revokeObjectURL(el.src);el.remove()}if(mode()==='off')ls('mflow.kino','on');apply(true);render();toast('Video als Hintergrund gesetzt')}).catch(function(){toast('Video konnte nicht gespeichert werden')})};i.click()};
ACT.kinodel=function(){tx('readwrite',function(s){return s.delete('bg')}).catch(function(){}).then(function(){vBlob=null;apply(true);render();toast('Video entfernt')})};

/* ---------- Start und Beobachtung ---------- */
var mo=new MutationObserver(function(){apply()});mo.observe(root,{attributes:true,attributeFilter:['class','data-theme']});
var rt=0;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){if(gl&&RM)draw(52)},150)});
window.kino={pulse:pulse,ramp:ramp,mood:function(i){tgt=MOOD[i];cur=null;mdT=1e15},apply:apply,state:function(){return {run:run,gl:!!gl,scale:scale,vid:!!vid}}};
vLoad();apply();
})();
