/* ===== Feinschliff: gleitende Markierung =====
   Leiste links und Tab-Leiste am Handy bekommen je eine Markierung, die zum aktiven Eintrag gleitet,
   statt zu springen. Beim ersten Setzen ohne Bewegung. Gestaltung in polish.css. */
(function(){
'use strict';
var RM=window.MF&&window.MF.RM;
function place(host,cls,sel,fn){if(!host)return;var ind=host.querySelector('.'+cls),on=host.querySelector(sel);
 if(!ind){ind=document.createElement('span');ind.className=cls;ind.setAttribute('aria-hidden','true');host.insertBefore(ind,host.firstChild)}
 if(!on||!on.offsetParent){host.classList.remove('slide');return}
 var first=!host.classList.contains('slide');if(first)ind.style.transition='none';
 fn(ind,on);host.classList.add('slide');
 if(first){void ind.offsetWidth;ind.style.transition=''}}
function sync(){
 place(document.querySelector('.rail'),'rind','.rb.on',function(ind,on){ind.style.setProperty('--y',on.offsetTop+'px')});
 place(document.querySelector('.tabs'),'tind','button.on',function(ind,on){ind.style.setProperty('--x',on.offsetLeft+'px');ind.style.setProperty('--w',on.offsetWidth+'px')});
}
/* Seitentitel wie ein Filmtitel aufdecken, nur beim Wechsel (Gestaltung in kino.css) */
/* Lange Einzelwörter im Titel passend verkleinern statt abschneiden (nur schmale Bildschirme) */
function fit(){var h=document.getElementById('tt');if(!h)return;h.style.fontSize='';if(innerWidth>560)return;var z=parseFloat(getComputedStyle(h).fontSize),n=0;while(h.scrollWidth>h.clientWidth+1&&z>17&&n++<14){z-=1;h.style.fontSize=z+'px'}}
var lastT=null;function title(){var h=document.getElementById('tt'),e=document.getElementById('teb');if(!h)return;var k=h.textContent;if(k===lastT)return;fit();var first=lastT===null;lastT=k;if(first||RM)return;
 [h,e].forEach(function(x){if(!x)return;x.classList.remove('rv');void x.offsetWidth;x.classList.add('rv')});if(window.kino&&kino.pulse)kino.pulse()}
var su=window.shellUpdate;window.shellUpdate=function(){var r=su.apply(this,arguments);sync();title();return r};
/* Seitengestaltung je Gerät: offen (Standard) oder Kacheln. Gestaltung in open.css */
var M=window.MF;function lay(){return (M.ls('mflow.layout')||'open')}
function layApply(){document.documentElement.classList.toggle('open',lay()==='open')}layApply();
var adm=VIEW.adm;VIEW.adm=function(){var h=adm.apply(this,arguments),o=lay()==='open';
 return h+M.card('Seitengestaltung','<div class="seg"><button class="'+(o?'on':'')+'" data-act="layset" data-v="open">offen</button><button class="'+(o?'':'on')+'" data-act="layset" data-v="tiles">Kacheln</button></div><p class="dim" style="font-size:12.5px;margin:12px 0 0">Offen: Schrift und Zahlen stehen direkt auf dem Hintergrund, gegliedert durch Linien. Kacheln: jede Kennzahl und jeder Abschnitt in einem eigenen Kasten. Gilt für dieses Gerät.</p>')};
ACT.layset=function(d){M.ls('mflow.layout',d.v);layApply();render()};
/* Heller Modus erkennen (Einstellung oder System), Gestaltung in hell.css */
function isLight(){var r=document.documentElement,g=getComputedStyle(r).getPropertyValue('--ground').trim().toLowerCase();r.classList.toggle('is-light',g>'#8')}
isLight();new MutationObserver(isLight).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});try{matchMedia('(prefers-color-scheme: light)').addEventListener('change',isLight)}catch(e){}
var t=0;window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(function(){sync();fit()},120)});
})();
