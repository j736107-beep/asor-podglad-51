// Interfejs wyszukiwarki ICD-10 / ICD-9: panel w menu oraz podpowiedzi przy rozpoznaniu w Dokumentacji. Bez sieci; bazy ładowane leniwie.
(function(){
  'use strict';
  var A=window.SORICD;if(!A||!window.SKM)return;
  var KEY='sor_icd_recent',SRC={
    icd10:'Źródło ICD-10: Centrum e-Zdrowia, Rejestr Systemów Kodowania — ICD-10-2008-PL ze stanem na 31.03.2021 (z kodami COVID-19), dane.gov.pl, licencja CC BY 4.0.',
    icd9:'Źródło ICD-9: Narodowy Fundusz Zdrowia, Centralne Zasoby Słownikowe — ICD-9 PL CM, wersja 5.90 (opublikowana 25.09.2026). Do sprawozdawania używa się kodu najbardziej szczegółowego.'};
  var cache={},loading={};
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function loadScript(src){
    if(loading[src])return loading[src];
    loading[src]=new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=function(){res();};s.onerror=function(){delete loading[src];rej(new Error('Nie wczytano '+src));};document.head.appendChild(s);});
    return loading[src];
  }
  // kind: 'icd10' | 'icd9'
  function ensure(kind){
    if(cache[kind])return Promise.resolve(cache[kind]);
    return Promise.all([loadScript('data/'+kind+'.js'),loadScript('data/icd-synonyms.js')]).then(function(){
      var D=window.SORICD_DATA||{};if(!D[kind])throw new Error('Brak bazy '+kind);
      var idx=A.buildIndex(D[kind],kind);
      cache[kind]={idx:idx,syn:A.compileSyn(idx,(D.synonyms||{})[kind]||[]),common:kind==='icd10'?A.COMMON10:A.COMMON9};
      return cache[kind];
    });
  }
  function recentGet(kind){try{var o=JSON.parse(localStorage.getItem(KEY)||'{}');return Array.isArray(o[kind])?o[kind].filter(function(x){return typeof x==='string';}):[];}catch(e){return [];}}
  function recentAdd(kind,code){try{var o={};try{o=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){}var l=(Array.isArray(o[kind])?o[kind]:[]).filter(function(c){return c!==code;});l.unshift(code);o[kind]=l.slice(0,12);localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}}
  function ctxFor(kind,cx,limit){return {syn:cx.syn,common:cx.common,recent:recentGet(kind),limit:limit};}
  function copyText(text){
    function fallback(){var t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();var ok=false;try{ok=document.execCommand('copy');}catch(e){}t.remove();return ok;}
    if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(text).then(function(){return true;},function(){return fallback();});
    return Promise.resolve(fallback());
  }
  // ---------------- panel ----------------
  var STS={icd10:{kind:'icd10',q:'',limit:60},icd9:{kind:'icd9',q:'',limit:60}};
  function render(el,kind){var st=STS[kind==='icd9'?'icd9':'icd10'];
    var is9=st.kind==='icd9';
    el.innerHTML='<div class="eyebrow">SOR / KODOWANIE</div><h2>'+(is9?'ICD-9 — procedury':'ICD-10 — rozpoznania')+'</h2><p class="lead">Wpisz numer ('+(is9?'99.624, 99624':'J18, J18.9, j189')+') albo słowo lub fragment ('+(is9?'np. „kardiowersja”, „defibrylacja”':'np. „zawal”, „tlenek wegla”')+'). Kilka słów: wszystkie muszą pasować. Polskie znaki i wielkość liter nie mają znaczenia. Kliknięcie wyniku kopiuje „kod nazwa” do schowka.</p>'+
     '<input id="icd-q" class="icd-q" type="search" autocomplete="off" spellcheck="false" aria-label="Szukaj kodu lub słowa"><div id="icd-note" class="icd-note"></div><div id="icd-status" class="wb-status" role="status" aria-live="polite"></div><div id="icd-res" class="icd-res"></div><div id="icd-more"></div><div class="notice icd-src" id="icd-src"></div>';
    var q=el.querySelector('#icd-q'),res=el.querySelector('#icd-res'),status=el.querySelector('#icd-status'),more=el.querySelector('#icd-more'),note=el.querySelector('#icd-note');
    var seq=0;
    q.value=st.q;
    function tabs(){
      q.placeholder=st.kind==='icd10'?'Np. J18.9, zawal, tlenek wegla, alkohol, upadek…':'Np. 99.624, defibrylacja, kardiowersja, intubacja, EKG…';
      el.querySelector('#icd-src').textContent=SRC[st.kind]+' Narzędzie pomocnicze: wybór kodu należy do lekarza.';
      note.innerHTML=st.kind==='icd9'?'<b>Uwaga:</b> wybór kodu zależy od lekarza. Kardiowersja farmakologiczna nie ma dedykowanego kodu w tym słowniku. W słowniku PL 99.61 oznacza kardiowersję przedsionków, a 99.62 — inne elektryczne umiarawianie serca.':'';}
    function itemHtml(e,kind){
      var badge=e.m?'<i class="icd-badge" title="'+(e.m==='†'?'Kod z krzyżykiem (etiologia) — wymaga kodu z gwiazdką':'Kod z gwiazdką (manifestacja) — występuje z kodem z krzyżykiem')+'">'+esc(e.m)+'</i>':'';
      var sub='';if(kind==='icd9'&&!e.leaf)sub='<i class="icd-badge icd-head" title="Kategoria lub podrozdział — zwykle wybiera się kod szczegółowy">'+(e.lvl===0?'podrozdział':'kategoria')+'</i>';
      var more2=e.kids?'<button type="button" class="icd-sub" data-sub="'+esc(e.c)+'" title="Pokaż kody szczegółowe">'+(kind==='icd9'?'szczegółowe':'podkody')+' ('+e.kids+') ▸</button>':'';
      return '<div class="icd-item'+(kind==='icd9'&&!e.leaf?' icd-nonleaf':'')+'" data-code="'+esc(e.c)+'"><button type="button" class="icd-main" data-pick="'+esc(e.c)+'"><b class="icd-code">'+esc(e.c)+'</b><span class="icd-name">'+esc(e.n)+'</span>'+badge+sub+'</button>'+more2+'<div class="icd-extra" hidden></div></div>';}
    function list(items,kind){var html='',leafDone=false,hdr=false;
      items.forEach(function(e){if(kind==='icd9'&&!e.leaf&&!hdr&&items.some(function(x){return x.leaf;})){html+='<div class="icd-subhead">Kategorie i podrozdziały (zwykle wybierz kod szczegółowy)</div>';hdr=true;}html+=itemHtml(e,kind);});return html;}
    function run(){
      var my=++seq,kind=st.kind;status.textContent='';more.innerHTML='';
      res.innerHTML='<p class="mut">Wczytywanie bazy kodów…</p>';
      ensure(kind).then(function(cx){
        if(my!==seq)return;
        var r=A.search(cx.idx,st.q,ctxFor(kind,cx,st.limit));
        if(r.mode==='empty'){
          var h='';if(r.recent.length)h+='<h3 class="icd-h">Ostatnio używane</h3>'+list(r.recent,kind);
          h+='<h3 class="icd-h">'+(kind==='icd10'?'Najczęstsze kody SOR':'Najczęstsze procedury SOR')+'</h3>'+list(r.common,kind);res.innerHTML=h;return;}
        if(!r.items.length){res.innerHTML='<p class="mut">Brak wyników. Spróbuj krótszego fragmentu albo innego słowa.</p>';return;}
        res.innerHTML=list(r.items,kind);
        status.textContent='Wyniki: '+r.total+(r.total>r.items.length?' (pokazano '+r.items.length+')':'')+(r.synonyms.length?'. Uwzględniono synonim: '+r.synonyms.join(', ')+'.':'');
        if(r.total>r.items.length)more.innerHTML='<button type="button" class="tg" id="icd-more-btn">Pokaż więcej</button>';
      }).catch(function(){if(my!==seq)return;res.innerHTML='<div class="notice">Nie udało się wczytać bazy '+(kind==='icd10'?'ICD-10':'ICD-9')+' z plików aplikacji. Odśwież stronę po zapisaniu zasobów offline (pierwsze uruchomienie wymaga sieci).</div>';});
    }
    var timer=null;q.oninput=function(){st.q=q.value;st.limit=60;clearTimeout(timer);timer=setTimeout(run,120);};
    more.onclick=function(e){if(e.target.id==='icd-more-btn'){st.limit+=120;run();}};
    res.onclick=function(e){
      var sb=e.target.closest('[data-sub]');if(sb){st.q=sb.dataset.sub;q.value=st.q;st.limit=200;run();q.focus();return;}
      var pb=e.target.closest('[data-pick]');if(pb){
        ensure(st.kind).then(function(cx){
          var en=cx.idx.by[pb.dataset.pick],item=pb.closest('.icd-item'),extra=item.querySelector('.icd-extra');
          copyText(A.line(en)).then(function(ok){status.textContent=(ok?'Skopiowano: ':'Schowek niedostępny, zaznacz ręcznie: ')+A.line(en);});
          recentAdd(st.kind,en.c);
          if(st.kind==='icd10')toggleExtra(cx,en,extra);
        });return;}
      var cb=e.target.closest('[data-cause]');if(cb){
        var host=cb.closest('.icd-extra');ensure('icd10').then(function(cx){
          var base=cx.idx.by[host.dataset.base],cause=cx.idx.by[cb.dataset.cause];
          var txt=A.pairText(base,cause);copyText(txt).then(function(ok){
            var box=host.querySelector('.icd-pair');box.hidden=false;
            box.innerHTML='<b>'+esc(A.pairTitle(base,cause))+'</b> <span class="mut">'+(ok?'skopiowano parę do schowka':'schowek niedostępny — zaznacz ręcznie')+'</span><pre>'+esc(txt)+'</pre><button type="button" class="tg" data-copy-pair="'+esc(txt)+'">Kopiuj parę ponownie</button>';
            recentAdd('icd10',cause.c);});});return;}
      var cp=e.target.closest('[data-copy-pair]');if(cp){copyText(cp.dataset.copyPair).then(function(){status.textContent='Skopiowano parę kodów.';});return;}
      var ms=e.target.closest('[data-show-more]');if(ms){var nx=ms.nextElementSibling;nx.hidden=!nx.hidden;return;}
    };
    res.addEventListener('input',function(e){var si=e.target.closest('[data-ext-search]');if(!si)return;var host=si.closest('.icd-extra'),out=host.querySelector('.icd-ext-out');
      ensure('icd10').then(function(cx){var r=A.searchExternal(cx.idx,si.value,cx.syn,12);out.innerHTML=si.value.trim().length<2?'':(r.items.length?r.items.map(function(e){return causeBtn(e);}).join(''):'<span class="mut">Brak wyników w przyczynach zewnętrznych.</span>');});});
    tabs();run();
    if(!window.__icdNoFocus)setTimeout(function(){try{q.focus();}catch(e){}},0);
  }
  function causeBtn(e){return '<button type="button" class="icd-cause" data-cause="'+esc(e.c)+'"><b>'+esc(e.c)+'</b> '+esc(e.n)+'</button>';}
  function extraHtml(cx,e){
    var h='',dg=A.daggerInfo(cx.idx,e),ec=A.externalCauses(cx.idx,e.c);
    if(dg){h+='<div class="icd-dagger"><b>Kod podwójny '+esc(dg.mark)+'.</b> '+(dg.mark==='†'?'Wymaga drugiego kodu z gwiazdką: ':'Występuje z kodem z krzyżykiem: ')+(dg.refs.length?dg.refs.map(function(r){return '<span class="icd-ref"><b>'+esc(r.c)+'</b> '+esc(r.n)+'</span>';}).join(' '):'<span class="mut">baza nie wskazuje konkretnego kodu — dobierz ręcznie.</span>')+'</div>';}
    if(ec){
      h+='<div class="icd-ec"><h4>Dodaj przyczynę zewnętrzną <span class="mut">(opcjonalnie)</span></h4><div class="icd-pair" hidden></div>';
      if(ec.type==='injury')h+='<div class="icd-group"><div class="icd-glabel">Szukaj przyczyny zewnętrznej (V01–Y98)</div><input type="search" class="icd-q icd-ext-q" data-ext-search placeholder="np. upadek, poślizgnięcie, schody, pies" autocomplete="off"><div class="icd-ext-out"></div></div>';
      ec.groups.forEach(function(g){
        if(ec.type==='injury'){h+='<details class="icd-group"><summary class="icd-glabel">'+esc(g.label)+' ('+g.codes.length+')</summary>'+g.codes.map(causeBtn).join('')+'</details>';return;}
        h+='<div class="icd-group"><div class="icd-glabel">'+esc(g.label)+'</div>';
        if(ec.type==='poison'){h+=g.codes.map(causeBtn).join('');if(g.more.length)h+='<button type="button" class="icd-linkbtn" data-show-more>pokaż całą grupę X85–X90 ▾</button><div hidden>'+g.more.map(causeBtn).join('')+'</div>';}
        else h+=g.codes.map(causeBtn).join('');
        h+='</div>';});
      h+='<p class="mut">'+esc(ec.note)+'</p></div>';
    }
    return h;
  }
  function toggleExtra(cx,e,host){
    if(!host)return;
    if(!host.hidden&&host.dataset.base===e.c){host.hidden=true;return;}
    var h=extraHtml(cx,e);if(!h){host.hidden=true;return;}
    host.dataset.base=e.c;host.innerHTML=h;host.hidden=false;
  }
  // ---------------- podpowiedzi przy polach rozpoznania ----------------
  var CODELINE=/^[A-Z]\d{2}(?:\.\d)?\s/;
  function attach(ta){
    if(!ta||ta.dataset.icdAttached)return;ta.dataset.icdAttached='1';
    var wrap=document.createElement('div');wrap.className='icd-wrap';ta.parentNode.insertBefore(wrap,ta);
    var bar=document.createElement('div');bar.className='wb-toolbar wb-mini icd-bar';
    var btn=document.createElement('button');btn.type='button';btn.className='tg';btn.textContent='Podpowiedzi ICD-10';btn.title='Najczęstsze i ostatnio używane kody; możesz też zacząć pisać słowo lub numer w bieżącym wierszu';
    var hint=document.createElement('span');hint.className='mut icd-barhint';hint.textContent='Pisz słowo lub numer w wierszu — wybór z listy wstawia „KOD Nazwa”.';
    bar.appendChild(btn);bar.appendChild(hint);wrap.appendChild(bar);wrap.appendChild(ta);
    var pop=document.createElement('div');pop.className='icd-pop';pop.setAttribute('role','listbox');pop.hidden=true;wrap.appendChild(pop);
    var active=-1,opts=[],seq=0,silent=false,stage=null;
    function close(){pop.hidden=true;pop.innerHTML='';active=-1;opts=[];stage=null;}
    function lineBounds(){var v=ta.value,pos=ta.selectionStart,s=v.lastIndexOf('\n',pos-1)+1,e=v.indexOf('\n',pos);if(e<0)e=v.length;return {s:s,e:e,text:v.slice(s,e)};}
    function setVal(v,caret){silent=true;ta.value=v;ta.setSelectionRange(caret,caret);ta.dispatchEvent(new Event('input',{bubbles:true}));silent=false;}
    function setActive(i){active=i;var all=pop.querySelectorAll('.icd-opt');all.forEach(function(o,k){o.classList.toggle('on',k===i);o.setAttribute('aria-selected',String(k===i));});if(all[i])all[i].scrollIntoView({block:'nearest'});}
    function showList(title,entries,cx,mode){
      opts=entries;active=-1;
      pop.innerHTML=(title?'<div class="icd-pop-h">'+esc(title)+'</div>':'')+entries.map(function(e,i){return '<button type="button" class="icd-opt" role="option" data-i="'+i+'"><b>'+esc(e.c)+'</b> '+esc(e.n)+(e.m?' <i class="icd-badge">'+esc(e.m)+'</i>':'')+'</button>';}).join('')+(mode==='cause'?'<button type="button" class="icd-opt icd-skip" data-skip="1">Pomiń przyczynę zewnętrzną</button>':'');
      pop.hidden=false;}
    function suggest(forceEmpty){
      var my=++seq;var lb=lineBounds(),text=lb.text.trim();
      if(!forceEmpty&&(text.length<2||CODELINE.test(lb.text))){close();return;}
      pop.hidden=false;pop.innerHTML='<div class="icd-pop-h">Wczytywanie bazy ICD-10…</div>';
      ensure('icd10').then(function(cx){
        if(my!==seq)return;
        var co=ctxFor('icd10',cx,8);co.demoteExternal=true;var r=A.search(cx.idx,forceEmpty?'':text,co);
        var items=r.mode==='empty'?r.recent.concat(r.common.filter(function(c){return r.recent.indexOf(c)<0;})).slice(0,10):r.items;
        stage='main';
        if(!items.length){pop.innerHTML='<div class="icd-pop-h">Brak podpowiedzi — pisz dalej lub wpisz ręcznie.</div>';opts=[];return;}
        showList(r.mode==='empty'?'Ostatnio używane i najczęstsze':'Podpowiedzi ICD-10',items,cx,'main');
      }).catch(function(){if(my===seq)pop.innerHTML='<div class="icd-pop-h">Baza ICD-10 niedostępna. Możesz pisać ręcznie.</div>';});
    }
    function choose(e){
      var cx=cache.icd10;if(!cx)return;
      if(stage==='cause'){
        var v=ta.value,end=lineBounds().e,ins='\n'+A.line(e);setVal(v.slice(0,end)+ins+v.slice(end),end+ins.length);recentAdd('icd10',e.c);close();return;}
      var lb=lineBounds(),v2=ta.value,newLine=A.line(e);
      setVal(v2.slice(0,lb.s)+newLine+v2.slice(lb.e),lb.s+newLine.length);recentAdd('icd10',e.c);
      var ec=A.externalCauses(cx.idx,e.c);
      if(ec){var list=[];ec.groups.forEach(function(g){if(ec.type==='poison'){if(g.suggest)list.push(g.suggest);else g.codes.forEach(function(x){list.push(x);});}else if(g.id==='other'||g.id==='falls'){(g.id==='falls'?['W01','W10','W19','W18','W06','W17']:['W22','W50','W54']).forEach(function(c){if(cx.idx.by[c])list.push(cx.idx.by[c]);});}else g.codes.slice(0,8).forEach(function(x){list.push(x);});});
        stage='cause';showList('Dodać przyczynę zewnętrzną do '+e.c+'? (opcjonalnie)',list,cx,'cause');}
      else close();
    }
    pop.addEventListener('pointerdown',function(ev){ev.preventDefault();});
    pop.addEventListener('click',function(ev){var o=ev.target.closest('.icd-opt');if(!o)return;if(o.dataset.skip){close();ta.focus();return;}choose(opts[+o.dataset.i]);ta.focus();});
    ta.addEventListener('input',function(){if(silent)return;suggest(false);});
    btn.addEventListener('click',function(){ta.focus();suggest(true);});
    ta.addEventListener('blur',function(){setTimeout(close,180);});
    ta.addEventListener('keydown',function(ev){
      if(pop.hidden)return;
      if(ev.key==='Escape'){ev.preventDefault();close();seq++;return;}
      if(!opts.length)return;
      if(ev.key==='ArrowDown'){ev.preventDefault();setActive(Math.min(opts.length-1,active+1));}
      else if(ev.key==='ArrowUp'){ev.preventDefault();setActive(Math.max(0,active-1));}
      else if((ev.key==='Enter'||ev.key==='Tab')&&active>=0){ev.preventDefault();choose(opts[active]);}
      else if(ev.key==='Escape'){ev.preventDefault();close();}
    });
  }
  window.SORICDUI={attach:attach,ensure:ensure,state:STS.icd10,states:STS,copyText:copyText};
  // ---------------- rejestracja panelu w menu: na końcu modułów, przed Ustawieniami i O programie ----------------
  var L=window.SKM.list,m10={id:'icd10',icon:'🔎',name:'ICD-10 — rozpoznania',render:function(el){render(el,'icd10');}},m9={id:'icd9',icon:'🔎',name:'ICD-9 — procedury',render:function(el){render(el,'icd9');}},si=L.findIndex(function(m){return m.id==='settings';});
  // kolejność: …, Neurologia, [tu wstawić „Neuroinfekcje”], ICD-10, ICD-9, ───, Ustawienia, O programie
  if(si<0){L.push(m10,m9);}else{var at=(si>0&&L[si-1].sep)?si-1:si;L.splice(at,0,m10,m9);}
})();
