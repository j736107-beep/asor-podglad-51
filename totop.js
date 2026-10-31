// 5.1-3: pływający przycisk „↑ do góry” we wszystkich modułach (przewijany jest #main; moduły w ramce – jeśli dostępna).
(function(){'use strict';if(typeof document==='undefined')return;
 var LIMIT=300,btn,frameWin=null;
 function main(){return document.getElementById('main');}
 function frameScroll(){try{return frameWin?(frameWin.scrollY||frameWin.document.documentElement.scrollTop||0):0;}catch(e){return 0;}}
 function pos(){var m=main();return Math.max(m?m.scrollTop:0,window.scrollY||0,frameScroll());}
 function upd(){if(btn)btn.hidden=pos()<LIMIT;}
 function top(){var m=main(),o={top:0,behavior:'smooth'};if(m&&m.scrollTo)m.scrollTo(o);else if(m)m.scrollTop=0;window.scrollTo(o);try{if(frameWin)frameWin.scrollTo(o);}catch(e){}setTimeout(upd,400);}
 function hookFrame(){var f=document.querySelector('#main iframe');frameWin=null;if(!f)return;var h=function(){try{frameWin=f.contentWindow;var d=frameWin.document;if(!d.getElementById('toTopPad')){var st=d.createElement('style');st.id='toTopPad';st.textContent='body{padding-bottom:84px!important}';(d.head||d.documentElement).appendChild(st);}frameWin.addEventListener('scroll',upd,{passive:true});}catch(e){frameWin=null;}};try{if(f.contentDocument&&f.contentDocument.readyState==='complete')h();}catch(e){}f.addEventListener('load',h);}
 function init(){if(document.getElementById('toTop'))return;
  var st=document.createElement('style');st.textContent='#toTop{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:calc(16px + env(safe-area-inset-bottom));z-index:35;min-width:48px;height:48px;padding:0 14px;border-radius:24px;border:1px solid #164d63;background:#164d63;color:#fff;font:600 .85rem "Segoe UI",Arial,sans-serif;box-shadow:0 4px 14px #12334840;cursor:pointer;opacity:.92}#toTop:hover{opacity:1}#toTop[hidden]{display:none}#main:not(.fr){padding-bottom:84px!important}@media(max-width:760px){#toTop{right:12px;bottom:calc(12px + env(safe-area-inset-bottom));padding:0;width:48px}#toTop span{display:none}}@media print{#toTop{display:none!important}}';
  document.head.appendChild(st);
  btn=document.createElement('button');btn.id='toTop';btn.type='button';btn.hidden=true;btn.title='Do góry';btn.setAttribute('aria-label','Przewiń do góry');btn.innerHTML='↑<span> do góry</span>';btn.onclick=top;document.body.appendChild(btn);
  document.addEventListener('scroll',upd,{capture:true,passive:true});window.addEventListener('resize',upd);
  var m=main();if(m&&window.MutationObserver)new MutationObserver(function(){hookFrame();upd();}).observe(m,{childList:true});hookFrame();upd();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 window.SORToTop={update:upd,top:top};
})();
