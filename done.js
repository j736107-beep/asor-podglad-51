// „Co rzeczywiście wykonano”: (a) procedury z wyszukiwarki ICD-9, (b) kafelki leków i płynów z wariantami, (c) wolny wpis.
// Stan w localStorage 'sk_done' (czyszczony przez „Następny pacjent”). Lista kafelków jest STARTOWA – do dopracowania z lekarzem.
(function(root,factory){
  var D=factory();
  if(typeof module==='object'&&module.exports){module.exports=D;return;}
  root.SORDone=D;
})(typeof window!=='undefined'?window:this,function(){
  'use strict';
  var KEY='sk_done';
  // Każdy kafelek: nazwa + warianty. Wariant {t: tekst wpisu} albo {ask:[pola]} (wpis po uzupełnieniu pól).
  var TILES=[
    {id:'nacl',name:'0,9% NaCl',var:[{l:'500 ml',t:'0,9% NaCl 500 ml i.v.'},{l:'250 ml',t:'0,9% NaCl 250 ml i.v.'},{l:'100 ml',t:'0,9% NaCl 100 ml i.v.'}]},
    {id:'glu5',name:'Glukoza 5%',var:[{l:'250 ml',t:'Glukoza 5% 250 ml i.v.'},{l:'500 ml',t:'Glukoza 5% 500 ml i.v.'}]},
    {id:'glu10',name:'Glukoza 10%',var:[{l:'500 ml',t:'Glukoza 10% 500 ml i.v.'}]},
    {id:'glu20',name:'Glukoza 20%',var:[{l:'amp.',t:'Glukoza 20% amp. i.v.'}]},
    {id:'glu40',name:'Glukoza 40%',var:[{l:'amp.',t:'Glukoza 40% amp. i.v.'}]},
    {id:'teo',name:'Teospirex',var:[{l:'200 mg i.v.',t:'Teospirex 200 mg i.v.'}]},
    {id:'meto',name:'Metocard',var:[{l:'5 mg i.v.',t:'Metocard 5 mg i.v.'},{l:'2,5 mg i.v.',t:'Metocard 2,5 mg i.v.'}]},
    {id:'feno',name:'Fenozolina 100 mg i.m./i.v.',var:[{l:'i.m.',t:'Fenozolina 100 mg i.m.'},{l:'i.v.',t:'Fenozolina 100 mg i.v.'}]},
    {id:'digo',name:'Digoxin',var:[{l:'1 amp. i.v.',t:'Digoxin 1 amp. i.v.'},{l:'½ amp. i.v.',t:'Digoxin ½ amp. i.v.'}]},
    {id:'cord',name:'Cordaron (kroplówka)',var:[{l:'dawka do wpisania',ask:[{k:'single',l:'dawka pojedyncza [mg]'},{k:'total',l:'dawka łączna [mg]'}],tpl:function(v){return 'Cordaron w kroplówce i.v.'+(v.single?', dawka pojedyncza '+v.single+' mg':'')+(v.total?', dawka łączna '+v.total+' mg':'');}}]}
  ];
  // ---- karta zleceń z Optimedu (tylko w pamięci sesji, bez zapisu na urządzeniu) ----
  var RX_T=/(?:(\d{1,2})[.\/-](\d{1,2})(?:[.\/-](\d{2,4}))?[ ,T]+)?(?:godz\.?\s*)?\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/;
  var RX_DOSE=/(\d+(?:[.,]\d+)?\s*(?:-\s*\d+(?:[.,]\d+)?\s*)?(?:mg\/kg\/h|mg\/h|µg\/kg\/min|ug\/kg\/min|mcg|µg|ug|mg|g|ml\/h|ml|j\.?m\.?|j\.|IU|mmol|amp\.?|tabl?\.?|kropl?\.?)(?![a-ząęółśżźćń]))/i;
  var RX_ROUTE=/(?:^|[\s,;(])(i\.?v\.?|p\.?o\.?|s\.?c\.?|i\.?m\.?|p\.?r\.?|s\.?l\.?|doustnie|dożylnie|domięśniowo|podskórnie|wziewnie|nebulizacja|we wlewie|wlew(?: ciągły)?|pompa|bolus|doodbytniczo|podjęzykowo)(?=$|[\s,;)])/i;
  var RX_FREQ=/(?:co\s*\d+\s*h|\d\s*x\s*\d+|\d+\s*x\s*dziennie|jednorazowo|doraźnie|w razie potrzeby|prn)/i;
  var RX_BAD=/\b(morfologi|crp|prokalcyt|pct|troponin|d-?dimer|elektrolit|jonogram|kreatynin|mocznik|glukoz|glikemi|gazometri|mleczan|inr|aptt|koagulogram|lipaz|amylaz|alt|ast|bilirubin|bnp|ck\b|posiew|badanie|bad\.|oznaczeni|kontrol|grupa krwi|próba krzyżowa|rtg|tk\b|angio|usg|ekg|echo|rezonans|mr\b|moczu|mocz\b|test|wymaz|toksykolog|alkohol)/i;
  var RX_PROC=/\b(cewnik|wkłuci|kaniul|intubac|kardiowersj|defibryl|sond[aęy]|opatrun|szyci|unieruchom|gips|drenaż|nakłuci|punkcj|tlenoterap|tlen\b|niv\b|monitorowan|konsultacj|transfuzj|toaleta|płukani|ułożeni|izolac|pomiar|rr co|diureza)/i;
  function parseOrders(text){var rows=[],lines=String(text||'').replace(/\r/g,'').split('\n'),lastT='',seq=0;
    lines.forEach(function(raw){var l=raw.replace(/\u00a0/g,' ').replace(/\t+/g,'  ').replace(/\s+$/,'').trim();if(!l||l.length<3)return;
      if(/^karta zleceń/i.test(l))return;if(/^(karta zleceń|zlecenia|lp\.?|data|godz|nazwa|pacjent|pesel|oddział|lekarz)\b[^0-9]*$/i.test(l))return;
      var tm=l.match(RX_T),time='',date='';if(tm){time=(tm[4].length<2?'0':'')+tm[4]+':'+tm[5];if(tm[1])date=('0'+tm[1]).slice(-2)+'.'+('0'+tm[2]).slice(-2);l=(l.slice(0,tm.index)+' '+l.slice(tm.index+tm[0].length)).trim();}
      if(!/[a-ząęółśżźćń]{3}/i.test(l)){if(time)lastT=time;return;}
      var dm=l.match(RX_DOSE);if(dm&&/\d+\s*G$/.test(dm[1])&&/wkłuci|kaniul|venflon/i.test(l))dm=null;var rm=l.match(RX_ROUTE),fm=l.match(RX_FREQ);
      var type=RX_BAD.test(l)&&!dm?'badanie':RX_PROC.test(l)&&!rm?'procedura':(dm||rm)?'lek':RX_BAD.test(l)?'badanie':RX_PROC.test(l)?'procedura':'inne';
      var item=l;[dm,rm,fm].forEach(function(m){if(m)item=item.replace(m[0].trim(),' ');});item=item.replace(/^\s*\d{1,3}[.)]\s+/,'').replace(/^[\s\-–:;,|]+/,'').replace(/[\s\-–:;,|]+$/,'').replace(/\s{2,}/g,' ').trim();
      if(!item)item=l;
      rows.push({seq:seq++,date:date,time:time||lastT,timeGiven:!!time,type:type,item:item.slice(0,160),dose:dm?dm[1].replace(/\s+/g,' ').trim():'',route:rm?rm[1].trim():'',freq:fm?fm[0].trim():'',raw:raw.trim().slice(0,300)});if(time)lastT=time;});
    rows.sort(function(a,b){var ka=(a.date?a.date.split('.').reverse().join(''):'')+(a.time||'99:99'),kb=(b.date?b.date.split('.').reverse().join(''):'')+(b.time||'99:99');return ka<kb?-1:ka>kb?1:a.seq-b.seq;});return rows;}
  var SAMPLE_ORD=['KARTA ZLECEŃ – FIKCYJNY PRZYKŁAD (nie dotyczy żadnego pacjenta)','04.11.2026 18:42\tMorfologia, CRP, prokalcytonina, elektrolity, kreatynina','04.11.2026 18:42\tTroponina hs – 0 h','18:45\tEKG 12-odprowadzeniowe','18:50\t0,9% NaCl 500 ml i.v. wlew','18:50\tPyralgina 1 g i.v.','18:55\tWkłucie obwodowe 18G – założenie','19:05\tRTG klatki piersiowej PA','19:10\tKetonal 100 mg i.v. w 100 ml NaCl','19:42\tTroponina hs – kontrola 1 h','19:45\tPosiew krwi × 2','20:00\tCeftriakson 2 g i.v. jednorazowo','20:05\tTlenoterapia 2 l/min przez wąsy','21:42\tTroponina hs – kontrola 3 h'].join('\n');
  function ordMem(){try{return(window.SKS&&window.SKS.ordMem)||null;}catch(e){return null;}}
  function setOrd(v){try{if(window.SKS)window.SKS.ordMem=v;}catch(e){}}
  var TYPL={lek:'lek',badanie:'badanie',procedura:'procedura',inne:'inne'};
  function ordTable(rows,editable){if(!rows||!rows.length)return'';return '<table class="dn-ord"><thead><tr><th style="width:11%">Godz.</th><th style="width:13%">Rodzaj</th><th>Zlecenie</th><th style="width:16%">Dawka</th><th style="width:14%">Droga / częstość</th></tr></thead><tbody>'+rows.map(function(r){return '<tr class="t-'+r.type+'"><td>'+(r.date?esc(r.date)+' ':'')+esc(r.time||'—')+(r.time&&!r.timeGiven?' <small>(jak wyżej)</small>':'')+'</td><td><span class="dn-ty">'+esc(TYPL[r.type])+'</span></td><td>'+esc(r.item)+'</td><td>'+esc(r.dose)+'</td><td>'+esc([r.route,r.freq].filter(Boolean).join(', '))+'</td></tr>';}).join('')+'</tbody></table>';}
  function ordersReportHtml(){var m=ordMem();return m&&m.rows&&m.rows.length?ordTable(m.rows):'';}
  function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
  function hm(ts){return new Date(ts).toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Warsaw'});}
  function empty(){return[];}
  function validate(a){if(!Array.isArray(a))return[];return a.slice(0,500).filter(function(x){return x&&typeof x.text==='string'&&x.text.trim()&&Number.isFinite(+x.ts);}).map(function(x){return{id:String(x.id||uid()).slice(0,40),ts:+x.ts,text:x.text.trim().slice(0,300),src:['icd9','drug','free'].includes(x.src)?x.src:'free'};});}
  function add(list,text,src,ts){text=String(text==null?'':text).trim();if(!text)throw Error('Wpis nie może być pusty.');if(list.length>=500)throw Error('Maksymalnie 500 wpisów.');return list.concat([{id:uid(),ts:ts==null?Date.now():ts,text:text.slice(0,300),src:src||'free'}]);}
  function remove(list,id){return list.filter(function(x){return x.id!==id;});}
  function edit(list,id,patch){return list.map(function(x){if(x.id!==id)return x;var n=Object.assign({},x);if(patch.text!=null){var t=String(patch.text).trim();if(t)n.text=t.slice(0,300);}if(patch.ts!=null&&Number.isFinite(+patch.ts))n.ts=+patch.ts;return n;});}
  // zmiana godziny (HH:MM) w dniu wpisu
  function withTime(ts,hhmm){var m=/^(\d{1,2}):(\d{2})$/.exec(hhmm||'');if(!m)return ts;var d=new Date(ts);d.setHours(+m[1],+m[2],0,0);return d.getTime();}
  function sorted(list){return list.slice().sort(function(a,b){return a.ts-b.ts;});}
  function toText(list){return sorted(list).map(function(x){return hm(x.ts)+' – '+x.text;}).join('\n');}
  function load(){try{return validate(JSON.parse(localStorage.getItem(KEY)||'[]'));}catch(e){return[];}}
  function save(l){try{localStorage.setItem(KEY,JSON.stringify(l));}catch(e){}document.dispatchEvent(new CustomEvent('sor-done-changed'));}
  function clear(){try{localStorage.removeItem(KEY);}catch(e){}}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function reportHtml(){var l=sorted(load()),o=ordersReportHtml();if(!l.length&&!o)return '';return (o?'<h3>Karta zleceń (z Optimedu)</h3>'+o:'')+(!l.length?'':'<h3>Wykonane</h3>'+'<table><tr><th style="width:14%">Godz.</th><th>Wykonano / podano</th></tr>'+l.map(function(x){return '<tr><td>'+hm(x.ts)+'</td><td>'+esc(x.text)+'</td></tr>';}).join('')+'</table>');}
  // ---------------- interfejs ----------------
  function render(el){
    var list=load(),nowMode=true,icdSeq=0;
    el.innerHTML='<h3>Co rzeczywiście wykonano</h3><p class="mut">Wpisz tylko to, co faktycznie zrobiono. Wpisy trafiają do raportu i do zestawienia dokumentacji. Lista leków i płynów jest startowa – do dopracowania z lekarzem.</p>'+
     '<div class="dn-time"><label><input type="checkbox" id="dn-now" checked> czas wpisu: teraz</label> <label>lub godzina: <input type="time" id="dn-t" disabled></label></div>'+
     '<section class="dn-card"><h4>1. Procedura z ICD-9 (np. „kardiowersja”, „intubacja”, „EKG”)</h4><input id="dn-q" class="icd-q" type="search" autocomplete="off" spellcheck="false" placeholder="Szukaj procedury lub kodu ICD-9…" aria-label="Szukaj procedury ICD-9"><div id="dn-icd" class="dn-icd" aria-live="polite"></div></section>'+
     '<section class="dn-card"><h4>2. Leki i płyny – kafelki</h4><div class="dn-tiles">'+TILES.map(function(t){return '<div class="dn-tile" data-tile="'+t.id+'"><b>'+esc(t.name)+'</b><div class="dn-vars">'+t.var.map(function(v,i){return '<button type="button" class="dn-v" data-tile="'+t.id+'" data-i="'+i+'">'+esc(v.l)+'</button>';}).join('')+'</div><div class="dn-ask" hidden></div></div>';}).join('')+'</div></section>'+
     '<section class="dn-card"><h4>3. Wolny wpis</h4><div class="dn-free"><input id="dn-free" placeholder="np. założono wkłucie, ułożenie, konsultacja…" aria-label="Wolny wpis"><button type="button" class="tg" id="dn-add">Dodaj</button></div></section>'+
     '<section class="dn-card" id="dn-ordc"><h4>4. Karta zleceń z Optimedu – leki, badania, procedury z godzinami</h4><p class="mut">Skopiuj kartę zleceń z Optimedu i wklej. Program ułoży zlecenia w tabeli według godziny. Dane są tylko w pamięci tej sesji (bez zapisu na urządzeniu).</p><textarea id="dn-ord" rows="6" spellcheck="false" autocomplete="off" placeholder="Wklej kartę zleceń…"></textarea><div class="row"><button type="button" class="tg" id="dn-ord-go">Ułóż zlecenia</button> <button type="button" class="tg" id="dn-ord-ex">Wczytaj przykład</button> <button type="button" class="tg" id="dn-ord-clr">Wyczyść kartę</button> <button type="button" class="tg" id="dn-print2">🖨 Drukuj kartę zleceń + wykonane (A4)</button></div><div id="dn-ord-out"></div></section>'+
     '<div id="dn-err" class="r" role="alert"></div><h4>Wykonane (kolejność czasowa)</h4><div id="dn-list"></div><div class="row"><button type="button" class="tg" id="dn-print">🖨 Drukuj wykonane</button></div>';
    function when(){var c=el.querySelector('#dn-now').checked,t=el.querySelector('#dn-t').value;return c||!t?Date.now():withTime(Date.now(),t);}
    function draw(){var l=sorted(list);el.querySelector('#dn-list').innerHTML=l.length?'<table class="dn-table"><tbody>'+l.map(function(x){return '<tr data-id="'+esc(x.id)+'"><td><input type="time" class="dn-et" value="'+hm(x.ts)+'" aria-label="Godzina"></td><td><input class="dn-etxt" value="'+esc(x.text)+'" aria-label="Opis (można edytować dawkę)"></td><td><button type="button" class="tg" data-del="'+esc(x.id)+'" aria-label="Usuń">✕</button></td></tr>';}).join('')+'</tbody></table>':'<p class="mut">Nic jeszcze nie wpisano.</p>';}
    function commit(n){list=n;save(list);draw();el.querySelector('#dn-err').textContent='';}
    function addTxt(text,src){try{commit(add(list,text,src,when()));}catch(e){el.querySelector('#dn-err').textContent=e.message;}}
    el.querySelector('#dn-now').onchange=function(){el.querySelector('#dn-t').disabled=this.checked;if(!this.checked&&!el.querySelector('#dn-t').value){var d=new Date();el.querySelector('#dn-t').value=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}};
    // ICD-9
    var q=el.querySelector('#dn-q'),res=el.querySelector('#dn-icd'),timer=null;
    function icd(){var my=++icdSeq,text=q.value;if(text.trim().length<2){res.innerHTML='<span class="mut">Wpisz co najmniej 2 znaki.</span>';return;}
      if(!window.SORICDUI||!window.SORICD){res.innerHTML='<span class="mut">Wyszukiwarka ICD-9 niedostępna.</span>';return;}
      res.innerHTML='<span class="mut">Szukam…</span>';
      SORICDUI.ensure('icd9').then(function(cx){if(my!==icdSeq)return;var r=SORICD.search(cx.idx,text,{syn:cx.syn,common:cx.common,limit:12});
        var items=r.items||[];res.innerHTML=items.length?items.map(function(e){return '<button type="button" class="dn-icdb'+(e.leaf?'':' nonleaf')+'" data-code="'+esc(e.c)+'" title="Dodaj do wykonanych"><b>'+esc(e.c)+'</b> '+esc(e.n)+'</button>';}).join('')+(r.total>items.length?'<span class="mut"> …wpisz dokładniej, aby zawęzić ('+r.total+' wyników)</span>':''):'<span class="mut">Brak wyników.</span>';
        res._cx=cx;}).catch(function(){if(my===icdSeq)res.innerHTML='<span class="mut">Nie wczytano bazy ICD-9.</span>';});}
    q.oninput=function(){clearTimeout(timer);timer=setTimeout(icd,150);};
    res.onclick=function(e){var b=e.target.closest('.dn-icdb');if(!b||!res._cx)return;var en=res._cx.idx.by[b.dataset.code];if(en){addTxt(SORICD.line(en),'icd9');}};
    // kafelki
    el.querySelector('.dn-tiles').onclick=function(e){
      var b=e.target.closest('button');if(!b)return;var tl=b.closest('.dn-tile');if(!tl)return;var tile=TILES.find(function(t){return t.id===tl.dataset.tile;});
      if(b.classList.contains('dn-v')){var v=tile.var[+b.dataset.i];
        if(v.ask){var box=b.closest('.dn-tile').querySelector('.dn-ask');box.hidden=false;box.dataset.i=b.dataset.i;box.innerHTML=v.ask.map(function(a){return '<label>'+esc(a.l)+' <input data-k="'+a.k+'" inputmode="decimal"></label>';}).join('')+'<button type="button" class="tg dn-ok">Dodaj</button>';return;}
        addTxt(v.t,'drug');return;}
      if(b.classList.contains('dn-ok')){var box2=b.closest('.dn-ask'),vv=tile.var[+box2.dataset.i],vals={};box2.querySelectorAll('input').forEach(function(i){var s=i.value.trim().replace(',','.');if(s&&!/^\d+(\.\d+)?$/.test(s)){vals.bad=true;}vals[i.dataset.k]=i.value.trim();});
        if(vals.bad){el.querySelector('#dn-err').textContent='Dawka musi być liczbą.';return;}
        if(!vals.single&&!vals.total){el.querySelector('#dn-err').textContent='Wpisz dawkę pojedynczą lub łączną.';return;}
        addTxt(vv.tpl(vals),'drug');box2.hidden=true;box2.innerHTML='';}
    };
    el.querySelector('#dn-add').onclick=function(){var i=el.querySelector('#dn-free');if(i.value.trim()){addTxt(i.value,'free');i.value='';}};
    el.querySelector('#dn-free').onkeydown=function(e){if(e.key==='Enter')el.querySelector('#dn-add').click();};
    el.querySelector('#dn-list').onclick=function(e){var b=e.target.closest('[data-del]');if(b)commit(remove(list,b.dataset.del));};
    el.querySelector('#dn-list').onchange=function(e){var tr=e.target.closest('tr');if(!tr)return;var id=tr.dataset.id;
      if(e.target.classList.contains('dn-et')){var x=list.find(function(y){return y.id===id;});if(x)commit(edit(list,id,{ts:withTime(x.ts,e.target.value)}));}
      else if(e.target.classList.contains('dn-etxt')){commit(edit(list,id,{text:e.target.value}));}};
    var ot=el.querySelector('#dn-ord'),oo=el.querySelector('#dn-ord-out');
    function ordRun(){var rows=parseOrders(ot.value);setOrd(ot.value.trim()?{text:ot.value,rows:rows}:null);oo.innerHTML=rows.length?ordTable(rows)+'<p class="mut">'+rows.length+' zleceń: '+['lek','badanie','procedura','inne'].map(function(t){var n=rows.filter(function(r){return r.type===t;}).length;return n?n+' × '+t:'';}).filter(Boolean).join(', ')+'. Sprawdź z oryginałem – rozpoznawanie jest pomocnicze.</p>':(ot.value.trim()?'<p class="mut">Nie rozpoznano zleceń.</p>':'');try{document.dispatchEvent(new CustomEvent('sor-done-changed'));}catch(e){}}
    el.querySelector('#dn-ord-go').onclick=ordRun;el.querySelector('#dn-ord-ex').onclick=function(){ot.value=SAMPLE_ORD;ordRun();};el.querySelector('#dn-ord-clr').onclick=function(){ot.value='';ordRun();};
    el.querySelector('#dn-print2').onclick=function(){if(window.SORReport)SORReport.print(['done']);};
    var om=ordMem();if(om&&om.text){ot.value=om.text;ordRun();}
    el.querySelector('#dn-print').onclick=function(){if(window.SORReport)SORReport.print(['done']);};
    draw();
  }
  return{parseOrders:parseOrders,ordTable:ordTable,ordersReportHtml:ordersReportHtml,SAMPLE_ORD:SAMPLE_ORD,KEY:KEY,TILES:TILES,empty:empty,validate:validate,add:add,remove:remove,edit:edit,withTime:withTime,sorted:sorted,toText:toText,load:load,save:save,clear:clear,reportHtml:reportHtml,render:render,hm:hm};
});
