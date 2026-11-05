/* Alarm „Bezwzględnie wstrzymać wypis” – ostrzeżenie przed wypisem (wyzwalany przez moduł „Ostateczny hamulec”).
   Decyzja lekarza: alarmu nie można wyciszyć, anulować ani obejść – trwa do zamknięcia karty/aplikacji. */
(function(){'use strict';
var audio=null,ov=null,active=false,list=[];
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function play(){try{if(!audio){audio=new Audio('audio/wypis_alarm.mp3');audio.loop=true;audio.addEventListener('pause',function(){if(active)setTimeout(play,50);});}audio.volume=1;audio.muted=false;var p=audio.play();if(p&&p.catch)p.catch(function(){});}catch(e){}}
function draw(){if(!ov||!document.body.contains(ov)){ov=document.createElement('div');ov.id='wypisAlarm';ov.setAttribute('role','alertdialog');ov.setAttribute('aria-modal','true');ov.tabIndex=-1;document.body.appendChild(ov);}
 ov.innerHTML='<div class="wa-box"><div class="wa-gp">BEZWZGLĘDNIE WSTRZYMAĆ WYPIS</div><h1>NIE WYPISUJ PACJENTA DO DOMU</h1><p class="wa-v">NIE WOLNO WYPISAĆ – wymaga hospitalizacji</p><p class="wa-l">🔊 „Wstrzymaj wypis. Powtarzam: wstrzymaj wypis.”</p><p class="wa-l">Przyczyny wykryte przez reguły:</p><ul>'+list.map(function(x){return'<li>'+esc(x)+'</li>';}).join('')+'</ul><p class="wa-n">Alarmu nie można wyciszyć, anulować ani pominąć – trwa do zamknięcia karty / aplikacji (decyzja lekarza). Wyciszenie telefonu może stłumić głos – czerwony ekran jest alarmem nadrzędnym. Reguły mogą przeoczyć lub błędnie ocenić – nie zastępują oceny lekarza.</p></div>';try{ov.focus();}catch(e){}}
function trigger(reasons){list=(reasons||[]).slice(0,40);active=true;draw();play();document.documentElement.classList.add('wa-on');
 if(!window._waGuard){window._waGuard=setInterval(function(){if(active){if(!ov||!document.body.contains(ov))draw();if(audio&&audio.paused)play();}},1000);
  document.addEventListener('keydown',function(e){if(active){e.stopPropagation();if(e.key==='Escape')e.preventDefault();}},true);
  window.addEventListener('beforeunload',function(e){if(active){e.preventDefault();e.returnValue='';}});}}
if(window.SKM&&SKM.list)(function(L){var i=L.findIndex(function(m){return m&&(m.id==='telszp'||m.id==='telefony');});L.splice(i<0?L.length:i,0,{id:'hamulec',icon:'🛑',name:'Ostateczny hamulec – kontrola przed wypisem',frame:'mod/hamulec/index.html'});})(SKM.list);
window.SORWypis={trigger:trigger,get active(){return active;},reasons:function(){return list.slice();}};
})();
