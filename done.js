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
  function reportHtml(){var l=sorted(load());if(!l.length)return '';return '<table><tr><th style="width:14%">Godz.</th><th>Wykonano / podano</th></tr>'+l.map(function(x){return '<tr><td>'+hm(x.ts)+'</td><td>'+esc(x.text)+'</td></tr>';}).join('')+'</table>';}
  // ---------------- interfejs ----------------
  function render(el){
    var list=load(),nowMode=true,icdSeq=0;
    el.innerHTML='<h3>Co rzeczywiście wykonano</h3><p class="mut">Wpisz tylko to, co faktycznie zrobiono. Wpisy trafiają do raportu i do zestawienia dokumentacji. Lista leków i płynów jest startowa – do dopracowania z lekarzem.</p>'+
     '<div class="dn-time"><label><input type="checkbox" id="dn-now" checked> czas wpisu: teraz</label> <label>lub godzina: <input type="time" id="dn-t" disabled></label></div>'+
     '<section class="dn-card"><h4>1. Procedura z ICD-9 (np. „kardiowersja”, „intubacja”, „EKG”)</h4><input id="dn-q" class="icd-q" type="search" autocomplete="off" spellcheck="false" placeholder="Szukaj procedury lub kodu ICD-9…" aria-label="Szukaj procedury ICD-9"><div id="dn-icd" class="dn-icd" aria-live="polite"></div></section>'+
     '<section class="dn-card"><h4>2. Leki i płyny – kafelki</h4><div class="dn-tiles">'+TILES.map(function(t){return '<div class="dn-tile" data-tile="'+t.id+'"><b>'+esc(t.name)+'</b><div class="dn-vars">'+t.var.map(function(v,i){return '<button type="button" class="dn-v" data-tile="'+t.id+'" data-i="'+i+'">'+esc(v.l)+'</button>';}).join('')+'</div><div class="dn-ask" hidden></div></div>';}).join('')+'</div></section>'+
     '<section class="dn-card"><h4>3. Wolny wpis</h4><div class="dn-free"><input id="dn-free" placeholder="np. założono wkłucie, ułożenie, konsultacja…" aria-label="Wolny wpis"><button type="button" class="tg" id="dn-add">Dodaj</button></div></section>'+
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
    el.querySelector('#dn-print').onclick=function(){if(window.SORReport)SORReport.print(['done']);};
    draw();
  }
  return{KEY:KEY,TILES:TILES,empty:empty,validate:validate,add:add,remove:remove,edit:edit,withTime:withTime,sorted:sorted,toText:toText,load:load,save:save,clear:clear,reportHtml:reportHtml,render:render,hm:hm};
});
