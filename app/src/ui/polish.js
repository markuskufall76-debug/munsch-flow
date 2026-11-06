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
var lastT=null;function title(){var h=document.getElementById('tt'),e=document.getElementById('teb');if(!h)return;var k=h.textContent;if(k===lastT)return;var first=lastT===null;lastT=k;if(first||RM)return;
 [h,e].forEach(function(x){if(!x)return;x.classList.remove('rv');void x.offsetWidth;x.classList.add('rv')})}
var su=window.shellUpdate;window.shellUpdate=function(){var r=su.apply(this,arguments);sync();title();return r};
var t=0;window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(sync,120)});
})();
