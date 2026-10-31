// Bilans płynów: klikane pozycje (płyny dożylne, doustne, diureza), sumowanie za cały pobyt (przyjęcie → teraz). Stan w localStorage 'sk_fluid'.
(function(root,factory){
  var F=factory();
  if(typeof module==='object'&&module.exports){module.exports=F;return;}
  root.SORFluid=F;
  if(root.SKM&&root.SKM.list)F.register(root);
})(typeof window!=='undefined'?window:this,function(){
  'use strict';
  var KEY='sk_fluid';
  var IV=['0,9% NaCl','Glukoza 5%','Glukoza 10%','Inny płyn i.v.'];
  var KINDS={iv:'Płyn dożylny',po:'Doustnie',ur:'Diureza'};
  var MODES={cath:'zacewnikowany',self:'oddaje mocz samodzielnie'};
  var AMOUNTS={iv:[50,100,250,500,1000],po:[50,100,200,250,500],ur:[50,100,200,300,500]};
  function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
  function empty(){return{v:1,start:null,mode:'cath',e:[]};}
  function parseMl(v){var s=String(v==null?'':v).trim();if(!/^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(s))return NaN;var n=Number(s.replace(',','.'));return Number.isFinite(n)&&n>0&&n<=20000?Math.round(n*10)/10:NaN;}
  function validate(o){var st=empty();if(!o||typeof o!=='object')return st;
    if(Number.isFinite(+o.start)&&+o.start>0)st.start=+o.start;if(o.mode==='self')st.mode='self';
    if(Array.isArray(o.e))o.e.slice(0,1000).forEach(function(x){if(x&&KINDS[x.k]&&Number.isFinite(+x.ts)&&parseMl(x.ml)>0)st.e.push({id:String(x.id||uid()).slice(0,40),ts:+x.ts,k:x.k,label:String(x.label||'').slice(0,60),ml:parseMl(x.ml),mode:x.mode==='self'?'self':'cath'});});
    return st;}
  function add(st,kind,ml,opt,now){var n=parseMl(ml);if(!KINDS[kind])throw Error('Nieznany rodzaj wpisu.');if(!(n>0))throw Error('Podaj objętość 0,1–20000 ml.');opt=opt||{};
    var e={id:uid(),ts:now==null?Date.now():now,k:kind,label:kind==='ur'?(MODES[st.mode]):String(opt.label||(kind==='po'?'doustnie':'')).slice(0,60),ml:n,mode:st.mode};
    return Object.assign({},st,{e:st.e.concat([e])});}
  function remove(st,id){return Object.assign({},st,{e:st.e.filter(function(x){return x.id!==id;})});}
  // start: znacznik czasu przyjęcia (domyślnie st.start lub podany fallback); now: ms; wkg: masa pacjenta
  function summary(st,now,wkg,fallbackStart){
    var start=st.start||fallbackStart||(st.e.length?Math.min.apply(null,st.e.map(function(x){return x.ts;})):now);
    var sum={iv:0,po:0,ur:0};st.e.forEach(function(x){sum[x.k]+=x.ml;});
    var hours=Math.max(0,(now-start)/3600000),inn=sum.iv+sum.po;
    var r1=function(v){return Math.round(v*10)/10;};
    return{start:start,hours:hours,iv:r1(sum.iv),po:r1(sum.po),inn:r1(inn),ur:r1(sum.ur),balance:r1(inn-sum.ur),
      urPerH:hours>=0.25?r1(sum.ur/hours):null,urPerKgH:(hours>=0.25&&wkg>0)?Math.round(sum.ur/hours/wkg*100)/100:null};}
  function fmtDur(h){var m=Math.round(h*60);return Math.floor(m/60)+' h '+String(m%60).padStart(2,'0')+' min';}
  function fmtTs(ts){return new Date(ts).toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Warsaw'});}
  function fmtMl(v){return String(Math.round(v*10)/10).replace('.',',');}
  function signed(v){return (v>0?'+':v<0?'−':'')+fmtMl(Math.abs(v));}
  function load(){try{return validate(JSON.parse(localStorage.getItem(KEY)||'null'));}catch(e){return empty();}}
  function save(st){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}document.dispatchEvent(new CustomEvent('sk-fluid-changed'));}
  function admission(){var t=+localStorage.getItem('sk_t0');return t>0?t:null;}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  // HTML do raportu (druk)
  function reportHtml(now,wkg){var st=load();if(!st.e.length)return '';var s=summary(st,now||Date.now(),wkg,admission());
    var rows=st.e.slice().sort(function(a,b){return a.ts-b.ts;}).map(function(x){return '<tr><td>'+fmtTs(x.ts)+'</td><td>'+esc(KINDS[x.k]+(x.label?' – '+x.label:''))+'</td><td>'+(x.k==='ur'?'−':'+')+fmtMl(x.ml)+' ml</td></tr>';}).join('');
    return '<p>Okres bilansu: od '+new Date(s.start).toLocaleString('pl-PL',{timeZone:'Europe/Warsaw'})+' ('+fmtDur(s.hours)+'). Diureza: '+MODES[st.mode]+'.</p><table><tr><th>Dożylnie</th><th>Doustnie</th><th>Wejście razem</th><th>Diureza</th><th>BILANS</th></tr><tr><td>'+fmtMl(s.iv)+' ml</td><td>'+fmtMl(s.po)+' ml</td><td>'+fmtMl(s.inn)+' ml</td><td>'+fmtMl(s.ur)+' ml'+(s.urPerH!=null?' ('+fmtMl(s.urPerH)+' ml/h'+(s.urPerKgH!=null?', '+String(s.urPerKgH).replace('.',',')+' ml/kg/h':'')+')':'')+'</td><td><b>'+signed(s.balance)+' ml</b></td></tr></table><table><tr><th>Godz.</th><th>Pozycja</th><th>Objętość</th></tr>'+rows+'</table><p style="font-size:9pt">Bilans = wejście (i.v. + doustnie) − diureza; nie uwzględnia utrat pozanerkowych (wymioty, biegunka, krwawienie, perspiratio).</p>';}
  function render(el,X){
    var st=load(),ivType=IV[0],timer=null;
    el.innerHTML='<div class="eyebrow">SOR / BILANS</div><h2>Bilans płynów</h2><p class="lead">Klikaj ilości podanych i oddanych płynów. Suma liczy się od przyjęcia do teraz.</p>'+
      '<div class="fl-top"><label>Początek bilansu (przyjęcie) <input type="datetime-local" id="fl-start"></label><span id="fl-dur" class="pill"></span>'+
      '<span class="fl-mode" role="group" aria-label="Diureza"><b>Diureza:</b> <label><input type="radio" name="fl-mode" value="cath"> zacewnikowany</label> <label><input type="radio" name="fl-mode" value="self"> oddaje mocz samodzielnie</label></span></div>'+
      '<div id="fl-sum" class="fl-sum" aria-live="polite"></div>'+
      '<div class="fl-grid">'+['iv','po','ur'].map(function(k){return '<section class="fl-card fl-'+k+'"><h3>'+(k==='iv'?'Płyny dożylne':k==='po'?'Płyny doustne':'Diureza')+'</h3>'+
        (k==='iv'?'<div class="fl-types" role="group" aria-label="Rodzaj płynu">'+IV.map(function(t,i){return '<button type="button" class="tg fl-type'+(i===0?' on':'')+'" data-type="'+esc(t)+'">'+esc(t)+'</button>';}).join('')+'<input class="fl-other" placeholder="nazwa płynu" hidden></div>':'')+
        '<div class="fl-amt">'+AMOUNTS[k].map(function(a){return '<button type="button" class="fl-b" data-k="'+k+'" data-ml="'+a+'">'+(k==='ur'?'−':'+')+a+' ml</button>';}).join('')+'</div>'+
        '<div class="fl-cust"><input inputmode="decimal" data-cust="'+k+'" placeholder="inna ilość, ml" aria-label="Inna ilość ml"><button type="button" class="tg" data-addc="'+k+'">Dodaj</button></div></section>';}).join('')+'</div>'+
      '<div id="fl-err" class="r" role="alert"></div><h3>Wpisy</h3><div id="fl-list"></div>'+
      '<div class="row"><button id="fl-print" class="tg">🖨 Drukuj bilans</button><button id="fl-reset" class="tg">Zeruj bilans</button></div>'+
      '<p class="mut">Bilans = wejście (płyny i.v. + doustne) − diureza. Nie uwzględnia utrat pozanerkowych. Dane są zapisane na tym urządzeniu i znikają po „Następny pacjent”.</p>';
    function toLocalInput(ts){var d=new Date(ts),p=function(n){return String(n).padStart(2,'0');};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes());}
    function w(){var p=X&&X.P?X.P():null;return p&&p.w>0?p.w:NaN;}
    function draw(){
      var now=Date.now(),s=summary(st,now,w(),admission());
      el.querySelector('#fl-start').value=toLocalInput(s.start);
      el.querySelector('#fl-dur').textContent='Czas bilansu: '+fmtDur(s.hours);
      el.querySelectorAll('input[name=fl-mode]').forEach(function(r){r.checked=r.value===st.mode;});
      el.querySelector('#fl-sum').innerHTML='<div class="fl-n"><span>Dożylnie</span><b>'+fmtMl(s.iv)+' ml</b></div><div class="fl-n"><span>Doustnie</span><b>'+fmtMl(s.po)+' ml</b></div><div class="fl-n"><span>Wejście razem</span><b>'+fmtMl(s.inn)+' ml</b></div><div class="fl-n"><span>Diureza ('+MODES[st.mode]+')</span><b>'+fmtMl(s.ur)+' ml</b>'+(s.urPerH!=null?'<small>'+fmtMl(s.urPerH)+' ml/h'+(s.urPerKgH!=null?' · '+String(s.urPerKgH).replace('.',',')+' ml/kg/h':'')+'</small>':'')+'</div><div class="fl-n fl-bal '+(s.balance>0?'pos':s.balance<0?'neg':'')+'"><span>BILANS</span><b id="fl-bal">'+signed(s.balance)+' ml</b></div>';
      var list=st.e.slice().sort(function(a,b){return b.ts-a.ts;});
      el.querySelector('#fl-list').innerHTML=list.length?'<table class="fl-table"><tbody>'+list.map(function(x){return '<tr><td>'+fmtTs(x.ts)+'</td><td>'+esc(KINDS[x.k]+(x.label?' – '+x.label:''))+'</td><td class="fl-v">'+(x.k==='ur'?'−':'+')+fmtMl(x.ml)+' ml</td><td><button type="button" class="tg" data-del="'+esc(x.id)+'" aria-label="Usuń wpis">✕</button></td></tr>';}).join('')+'</tbody></table>':'<p class="mut">Brak wpisów.</p>';
    }
    function commit(next){st=next;save(st);draw();el.querySelector('#fl-err').textContent='';}
    function addEntry(k,ml){try{var opt={};if(k==='iv'){var o=el.querySelector('.fl-other');opt.label=ivType==='Inny płyn i.v.'?(o.value.trim()||'inny płyn'):ivType;}commit(add(st,k,ml,opt));}catch(e){el.querySelector('#fl-err').textContent=e.message;}}
    el.onclick=function(e){
      var t=e.target.closest('button');if(!t)return;
      if(t.dataset.type){ivType=t.dataset.type;el.querySelectorAll('.fl-type').forEach(function(b){b.classList.toggle('on',b===t);});el.querySelector('.fl-other').hidden=ivType!=='Inny płyn i.v.';return;}
      if(t.dataset.ml){addEntry(t.dataset.k,t.dataset.ml);return;}
      if(t.dataset.addc){var i=el.querySelector('[data-cust="'+t.dataset.addc+'"]');addEntry(t.dataset.addc,i.value);i.value='';return;}
      if(t.dataset.del){commit(remove(st,t.dataset.del));return;}
      if(t.id==='fl-reset'){if(confirm('Wyzerować bilans płynów (usunąć wszystkie wpisy)?')){st=empty();save(st);draw();}return;}
      if(t.id==='fl-print'){if(window.SORReport)SORReport.print(['fluid']);}
    };
    el.querySelectorAll('[data-cust]').forEach(function(i){i.onkeydown=function(e){if(e.key==='Enter'){addEntry(i.dataset.cust,i.value);i.value='';}};});
    el.querySelectorAll('input[name=fl-mode]').forEach(function(r){r.onchange=function(){st=Object.assign({},st,{mode:r.value});save(st);draw();};});
    el.querySelector('#fl-start').onchange=function(){var t=new Date(this.value).getTime();if(Number.isFinite(t)){st=Object.assign({},st,{start:t});save(st);draw();}};
    draw();timer=setInterval(function(){if(!document.body.contains(el)||!el.querySelector('#fl-start')){clearInterval(timer);return;}draw();},30000);
  }
  function register(root){var L=root.SKM.list,i=L.findIndex(function(m){return m.id==='elyte';});var m={id:'fluid',icon:'💧',name:'Bilans płynów',render:render};if(i<0)L.push(m);else L.splice(i+1,0,m);}
  function clear(){try{localStorage.removeItem(KEY);}catch(e){}}
  return{KEY:KEY,IV:IV,KINDS:KINDS,MODES:MODES,empty:empty,validate:validate,add:add,remove:remove,summary:summary,parseMl:parseMl,load:load,save:save,reportHtml:reportHtml,fmtMl:fmtMl,signed:signed,fmtDur:fmtDur,register:register,clear:clear,render:render};
});
