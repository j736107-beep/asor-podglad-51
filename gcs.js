// GCS: wybór myszką z opisami; wynik liczy się dopiero po wybraniu wszystkich trzech składowych (bez wartości domyślnych).
// Stan współdzielony między modułami (jedno GCS pacjenta) w localStorage 'sk_gcs' (czyszczone przez „Następny pacjent”).
(function(root,f){var G=f();if(typeof module==='object'&&module.exports)module.exports=G;else root.SKGCS=G;})(typeof window!=='undefined'?window:this,function(){
  var KEY='sk_gcs';
  var OPT={
    e:{name:'Oczy (E)',list:[[4,'spontanicznie','Oczy otwarte spontanicznie'],[3,'na polecenie','Otwiera oczy na głos / polecenie słowne'],[2,'na ból','Otwiera oczy dopiero na bodziec bólowy'],[1,'brak','Nie otwiera oczu mimo bodźca bólowego']]},
    v:{name:'Reakcja słowna (V)',list:[[5,'zorientowana','Pełna orientacja: miejsce, czas, osoba'],[4,'splątana','Rozmawia, ale jest zdezorientowany'],[3,'nieadekwatne słowa','Pojedyncze słowa bez związku, bez zdań'],[2,'niezrozumiałe dźwięki','Jęki, pomruki bez słów'],[1,'brak','Brak reakcji słownej']]},
    m:{name:'Reakcja ruchowa (M)',list:[[6,'wykonuje polecenia','Wykonuje proste polecenia'],[5,'lokalizuje ból','Ręka celowo dąży do miejsca bólu'],[4,'ucieka od bólu','Wycofuje kończynę (odruch zgięciowy)'],[3,'zgięciowa','Zgięcie patologiczne (dekortykacja)'],[2,'wyprostna','Wyprost patologiczny (decerebracja)'],[1,'brak','Brak reakcji ruchowej']]}};
  function valid(p,n){n=+n;return OPT[p].list.some(function(o){return o[0]===n;});}
  function load(){var o={};try{o=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){}var s={};['e','v','m'].forEach(function(p){if(valid(p,o[p]))s[p]=+o[p];});return s;}
  function save(s){try{if(s.e||s.v||s.m)localStorage.setItem(KEY,JSON.stringify(s));else localStorage.removeItem(KEY);}catch(e){}}
  // wynik tylko przy komplecie trzech składowych
  function total(s){return(valid('e',s&&s.e)&&valid('v',s&&s.v)&&valid('m',s&&s.m))?(+s.e)+(+s.v)+(+s.m):null;}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  // HTML pola: ukryte inputy (id: gcs + opcjonalnie ge/gv/gm) + kontener widżetu
  function field(withParts){return '<span class="gcsfield"><input id="gcs" type="hidden">'+(withParts?'<input id="ge" type="hidden"><input id="gv" type="hidden"><input id="gm" type="hidden">':'')+'<span class="gcsw"></span></span>';}
  function setHidden(el,v){if(!el)return;v=v==null?'':String(v);if(el.value!==v){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));}}
  function mount(scope){
    var w=scope.querySelector('.gcsw');if(!w)return;
    var h={total:scope.querySelector('#gcs'),e:scope.querySelector('#ge'),v:scope.querySelector('#gv'),m:scope.querySelector('#gm')};
    function push(){var s=load(),t=total(s);setHidden(h.e,s.e);setHidden(h.v,s.v);setHidden(h.m,s.m);setHidden(h.total,t);}
    function draw(){var s=load(),t=total(s);
      w.innerHTML='<div class="gcs-box" role="group" aria-label="Skala Glasgow (GCS)"><b>GCS – wybierz po jednej odpowiedzi w każdej grupie</b>'+['e','v','m'].map(function(p){return '<div class="gcs-row"><span class="gcs-h">'+OPT[p].name+'</span>'+OPT[p].list.map(function(o){return '<button type="button" class="gcs-b'+(s[p]===o[0]?' on':'')+'" data-p="'+p+'" data-n="'+o[0]+'" title="'+esc(o[2])+'" aria-pressed="'+(s[p]===o[0])+'"><b>'+o[0]+'</b> '+esc(o[1])+'</button>';}).join('')+'</div>';}).join('')+
        '<div class="gcs-sum">'+(t!=null?'GCS = <b>'+t+'</b> (E'+s.e+' V'+s.v+' M'+s.m+')':'GCS: wybierz wszystkie trzy składowe'+((s.e||s.v||s.m)?' (brakuje: '+['e','v','m'].filter(function(p){return !s[p];}).map(function(p){return {e:'oczy',v:'słowna',m:'ruchowa'}[p];}).join(', ')+')':''))+'</div><button type="button" class="tg gcs-clr"'+((s.e||s.v||s.m)?'':' disabled')+'>Wyczyść GCS</button></div>';}
    w.onclick=function(ev){var b=ev.target.closest('button');if(!b)return;var s=load();
      if(b.classList.contains('gcs-clr')){s={};}else if(b.dataset.p){var n=+b.dataset.n;if(s[b.dataset.p]===n)delete s[b.dataset.p];else s[b.dataset.p]=n;}else return;
      save(s);draw();push();};
    draw();push();
  }
  return{KEY:KEY,OPT:OPT,load:load,save:save,total:total,field:field,mount:mount,valid:valid};
});
