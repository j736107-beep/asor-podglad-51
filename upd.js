// automatyczna aktualizacja – użytkownik nigdy nie musi czyścić danych przeglądarki
(function(){if(!('serviceWorker' in navigator)||location.protocol==='file:')return;var had=!!navigator.serviceWorker.controller,done=false;
 navigator.serviceWorker.addEventListener('controllerchange',function(){if(done||!had)return;done=true;location.reload();});
 navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(function(r){r.update().catch(function(){});if(r.waiting)r.waiting.postMessage('skip');
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')r.update().catch(function(){})});}).catch(function(){});
 // usuń stare cache innych wersji (dowolna nazwa) – gdy SW już aktywny, robi to też SW
})();
