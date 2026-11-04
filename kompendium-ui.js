// Moduł „Interna: kompendium” (etap 0). Treść wyłącznie zaszyfrowana (AES-GCM 256, klucz PBKDF2-SHA-256 600 000 iteracji).
// Jawny kod nie zawiera tytułu źródła, tytułów jednostek ani słów kluczowych. Hasło nigdy nie jest zapisywane.
// Odszyfrowane dane i klucz tylko w pamięci strony; opcjonalnie nieeksportowalny CryptoKey w IndexedDB („Zapamiętaj na tym urządzeniu”).
(function(root,factory){var A=factory(root);if(typeof module==='object'&&module.exports){module.exports=A;return;}root.SORKomp=A;
 if(root.SKM&&root.SKM.list&&typeof document!=='undefined'){var L=root.SKM.list,i=L.findIndex(function(m){return m.id==='icd10';});if(i<0)i=L.findIndex(function(m){return m.id==='settings';});if(i<0)i=L.length;L.splice(i,0,A.mod);}
 if(root.SORReport&&root.SORReport.SKIP)root.SORReport.SKIP.kompendium=1; // „Ten ekran” nie zapisuje migawki tego modułu w localStorage
})(typeof window!=='undefined'?window:this,function(root){'use strict';
/*KRYPTO-START*/
// Wspólny blok kryptograficzny: identyczny w module i w szyfratorze (szyfrator.html budowany z tego bloku).
var KDF_ITER=600000,SALT_LEN=16,IV_LEN=12;
function subtle(){var c=(typeof crypto!=='undefined'&&crypto)||(root&&root.crypto);if(!c||!c.subtle)throw Error('Brak Web Crypto (wymagane https lub localhost/file).');return c.subtle;}
function rnd(n){var a=new Uint8Array(n);((typeof crypto!=='undefined'&&crypto)||root.crypto).getRandomValues(a);return a;}
function b64e(u8){var s='';for(var i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s);}
function b64d(s){var b=atob(String(s||'')),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;}
function kdfCheck(kdf){if(!kdf||kdf.alg!=='PBKDF2'||kdf.hash!=='SHA-256'||kdf.iter!==KDF_ITER||b64d(kdf.salt).length!==SALT_LEN)throw Error('Nieprawidłowe parametry klucza (klucz.js).');}
function newKdf(){return{alg:'PBKDF2',hash:'SHA-256',iter:KDF_ITER,salt:b64e(rnd(SALT_LEN))};}
// klucz AES-GCM 256 z hasła; extractable:false (nie da się go odczytać ani wyeksportować)
function deriveKey(pass,kdf){kdfCheck(kdf);var S=subtle();return S.importKey('raw',new TextEncoder().encode(String(pass)),'PBKDF2',false,['deriveKey']).then(function(bk){
 return S.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:b64d(kdf.salt),iterations:kdf.iter},bk,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);});}
function encryptJSON(key,obj){var iv=rnd(IV_LEN);return subtle().encrypt({name:'AES-GCM',iv:iv},key,new TextEncoder().encode(JSON.stringify(obj))).then(function(ct){return{iv:b64e(iv),ct:b64e(new Uint8Array(ct))};});}
function decryptJSON(key,rec){if(!rec||!rec.iv||!rec.ct)return Promise.reject(Error('Brak zaszyfrowanego pliku.'));var iv=b64d(rec.iv);if(iv.length!==IV_LEN)return Promise.reject(Error('Nieprawidłowy IV.'));
 return subtle().decrypt({name:'AES-GCM',iv:iv},key,b64d(rec.ct)).then(function(pt){return JSON.parse(new TextDecoder('utf-8').decode(pt));});}
// treść plików danych (JS przypisujący do window – działa także z file://)
function kluczJs(kdf){return 'window.SORKompEnc = '+JSON.stringify({v:1,kdf:kdf,pliki:{}})+';\n';}
function plikJs(id,rec){if(!/^[a-z0-9_-]{1,40}$/.test(id))throw Error('Nieprawidłowy identyfikator pliku: '+id);return 'SORKompEnc.pliki['+JSON.stringify(id)+'] = '+JSON.stringify({iv:rec.iv,ct:rec.ct})+';\n';}
/*KRYPTO-KONIEC*/
var SPZ=['spoza','her'+'olda'].join('_'); // nazwa pola ze schematu (jawny kod nie zawiera nazwy źródła)
var MODS_OK=['trop','pe','af','ahf','acoag','ana','sepsis','cap','tox','gib','dka','el','fluid','transf','neuro','se','omdl','leki','pompy','hamulec'];
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function norm(s){return String(s||'').toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l');}
// ---- czysta logika (Node) ----
function buildIx(index){return index.jednostki.map(function(j){return{j:j,t:norm([j.tytul].concat(j.slowa_kluczowe||[],j.synonimia||[]).join(' | '))};});}
function search(ix,q){var w=norm(q).trim().split(/\s+/).filter(Boolean);if(!w.length)return[];return ix.filter(function(x){return w.every(function(t){return x.t.indexOf(t)>=0;});}).map(function(x){return x.j;});}
function inDzial(index,d){return index.jednostki.filter(function(j){return j.dzial===d;});}
function neighbours(index,id){var j=index.jednostki.find(function(x){return x.id===id;});if(!j)return{};var L=inDzial(index,j.dzial),i=L.indexOf(j);return{prev:L[i-1]||null,next:L[i+1]||null,pos:i+1,n:L.length};}
// ---- stan (tylko pamięć) ----
var KEY=null,IDX=null,IX=null,DZ={},view={v:'home',id:null,d:null,q:''},lastErr='';
var IDB='sor-kompendium',ST='k',REC='klucz';
function idb(){return new Promise(function(res,rej){if(!root.indexedDB)return rej(Error('Brak IndexedDB'));var r=root.indexedDB.open(IDB,1);r.onupgradeneeded=function(){r.result.createObjectStore(ST);};r.onsuccess=function(){res(r.result);};r.onerror=function(){rej(r.error);};});}
function idbOp(mode,fn){return idb().then(function(db){return new Promise(function(res,rej){var t=db.transaction(ST,mode),s=t.objectStore(ST),r=fn(s);t.oncomplete=function(){db.close();res(r&&r.result);};t.onerror=function(){db.close();rej(t.error);};});});}
function remember(key,salt){return idbOp('readwrite',function(s){return s.put({key:key,salt:salt},REC);});}
function recall(){return idbOp('readonly',function(s){return s.get(REC);}).catch(function(){return null;});}
function forget(){return idbOp('readwrite',function(s){return s.delete(REC);}).catch(function(){});}
function loadScript(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=function(){s.remove();rej(Error('Nie wczytano '+src));};document.head.appendChild(s);});}
function E(){return root.SORKompEnc;}
function ensureEnc(){return (E()?Promise.resolve():loadScript('data/kompendium/klucz.js')).then(function(){if(!E()||!E().kdf)throw Error('brak');return E().pliki.index?null:loadScript('data/kompendium/index.js');}).then(function(){if(!E().pliki.index)throw Error('brak');});}
function unlockWith(key){return decryptJSON(key,E().pliki.index).then(function(ix){KEY=key;IDX=ix;IX=buildIx(ix);return ix;});}
function unlockPass(pass,rem){return deriveKey(pass,E().kdf).then(function(k){return unlockWith(k).then(function(){return rem?remember(k,E().kdf.salt):null;},function(){throw Error('Nieprawidłowe hasło');});});}
function lock(){KEY=null;IDX=null;IX=null;DZ={};view={v:'home',id:null,d:null,q:''};}
function ensureDzial(d){if(DZ[d])return Promise.resolve(DZ[d]);if(!/^[a-z0-9_-]{1,40}$/.test(d))return Promise.reject(Error('Zły dział'));
 return (E().pliki[d]?Promise.resolve():loadScript('data/kompendium/'+d+'.js')).then(function(){return decryptJSON(KEY,E().pliki[d]);}).then(function(o){DZ[d]=o;return o;});}
function unitById(id){var j=IDX&&IDX.jednostki.find(function(x){return x.id===id;});if(!j)return Promise.reject(Error('Brak jednostki '+id));return ensureDzial(j.dzial).then(function(o){var r=(o.jednostki||[]).find(function(x){return x.id===id;});if(!r)throw Error('Brak jednostki '+id+' w pliku działu');return r;});}
function dzialInfo(d){return (IDX.dzialy||[]).find(function(x){return x.id===d;})||{id:d,nazwa:d,kolor:'#7b3fe4'};}
// ---- widok ----
var CSS='.kp{color:#000;font-size:1.15rem;line-height:1.45}.kp .kp-box{background:#fff;border:2px solid #333;border-radius:10px;padding:12px 14px;margin:10px 0}.kp input[type=password],.kp input[type=search]{width:100%;font-size:1.3rem;padding:12px;border:3px solid #000;border-radius:8px;color:#000;box-sizing:border-box;margin:8px 0}'+
'.kp button{font-size:1.1rem;font-weight:800;padding:10px 14px;border:3px solid #000;border-radius:10px;background:#fff;color:#000;margin:4px 6px 4px 0;cursor:pointer}.kp button.kp-pri{background:#7b3fe4;border-color:#7b3fe4;color:#fff}.kp .kp-err{color:#b00010;font-weight:800;font-size:1.2rem}.kp .kp-info{font-size:1rem;color:#222}'+
'.kp h2{font-size:1.5rem;margin:10px 0 4px;color:#000}.kp h3{font-size:1.25rem;margin:14px 0 6px;color:#000;border-bottom:3px solid #000}.kp .kp-it{display:block;width:100%;text-align:left;background:#fff;border:2px solid #333;border-left-width:10px;border-radius:10px;padding:10px 12px;margin:6px 0;font-size:1.2rem}.kp .kp-it small{display:block;font-weight:600;font-size:.95rem;color:#222}'+
'.kp .kp-sec{border:2px solid #555;border-left-width:10px;border-radius:10px;padding:8px 12px;margin:10px 0;background:#fff}.kp details.kp-sec>summary{font-weight:800;font-size:1.25rem;cursor:pointer}.kp .kp-red{border-color:#d81b30}.kp .kp-blue{border-color:#1d4ed8}.kp .kp-green{border-color:#1e9e4a}.kp .kp-yel{border-color:#e9b400;background:#fffbe8}.kp .kp-grey{border-color:#888;background:#f4f4f4}'+
'.kp .kp-red>h3{border:0;color:#b00010;margin-top:4px}.kp table{border-collapse:collapse;width:100%;margin:6px 0;font-size:1.05rem}.kp th,.kp td{border:1px solid #555;padding:6px 8px;text-align:left;vertical-align:top;color:#000}.kp th{background:#eee}.kp tr:nth-child(even) td{background:#faf7ff}'+
'.kp .kp-tag{display:inline-block;font-size:.9rem;font-weight:800;border:2px solid #000;border-radius:6px;padding:1px 6px;margin:2px 4px 2px 0}.kp .kp-nav{display:flex;flex-wrap:wrap;gap:4px;margin:8px 0}.kp figure{margin:8px 0}.kp figure img{max-width:100%;background:#fff;border:1px solid #999}.kp figcaption{font-size:1rem}'+
'@media print{.kp .kp-nav,.kp button,.kp input{display:none!important}.kp details.kp-sec>summary{list-style:none}}';
function H(el,h){el.innerHTML='<style>'+CSS+'</style><div class="kp" id="kp">'+h+'</div>';}
function lockScreen(el,msg){H(el,'<div class="kp-box"><h2>📘 Interna: kompendium</h2><p>Treść jest zaszyfrowana. Wpisz hasło, aby ją odczytać na tym ekranie. Hasło nie jest nigdzie zapisywane.</p>'+
 '<form id="kp-f" autocomplete="off"><input type="password" id="kp-p" placeholder="Hasło" autocomplete="current-password"><label style="display:block;margin:6px 0"><input type="checkbox" id="kp-rem"> Zapamiętaj na tym urządzeniu <span class="kp-info">(zapisuje nieeksportowalny klucz w przeglądarce, nigdy hasło)</span></label>'+
 '<button type="submit" class="kp-pri" id="kp-go">Odblokuj</button> <button type="button" id="kp-forget">Zapomnij hasło na tym urządzeniu</button></form><div id="kp-msg" class="kp-err">'+esc(msg||'')+'</div></div>');
 var f=el.querySelector('#kp-f');f.onsubmit=function(e){e.preventDefault();var p=el.querySelector('#kp-p'),m=el.querySelector('#kp-msg');m.className='kp-info';m.textContent='Odszyfrowywanie…';var pass=p.value;p.value='';
  ensureEnc().then(function(){return unlockPass(pass,el.querySelector('#kp-rem').checked);},function(){throw Error('brak');}).then(function(){draw(el);},function(e){if(e.message==='brak')return noData(el);m.className='kp-err';m.textContent=e.message==='Nieprawidłowe hasło'?'Nieprawidłowe hasło':'Błąd: '+e.message;});};
 el.querySelector('#kp-forget').onclick=function(){forget().then(function(){var m=el.querySelector('#kp-msg');m.className='kp-info';m.textContent='Zapamiętany klucz usunięty z tego urządzenia.';});};}
function noData(el){H(el,'<div class="kp-box"><h2>📘 Interna: kompendium</h2><p><b>Brak danych – zaszyfruj w szyfratorze.</b></p><p class="kp-info">Moduł jest gotowy, ale w aplikacji nie ma jeszcze zaszyfrowanych plików (data/kompendium/klucz.js, index.js i pliki działów). Pliki tworzy lokalne narzędzie szyfrator.html.</p></div>');}
function navBar(extra){return '<div class="kp-nav">'+(extra||'')+'<button data-go="home">☰ Spis działów</button><button data-act="forget">Zapomnij hasło na tym urządzeniu</button><button data-act="lock">🔒 Zablokuj</button></div>';}
function homeHtml(){var ds=IDX.dzialy||[];return navBar()+'<input type="search" id="kp-q" placeholder="Szukaj: nazwa, skrót, objaw, lek… (bez polskich znaków też)" autocomplete="off" value="'+esc(view.q)+'"><div id="kp-res"></div>'+
 '<h3>Spis działów</h3>'+ds.map(function(d){var n=inDzial(IDX,d.id).length;return '<button class="kp-it" data-dz="'+esc(d.id)+'" style="border-left-color:'+esc(d.kolor)+'">'+esc(d.nr?d.nr+'. ':'')+esc(d.nazwa)+'<small>'+n+' jedn.</small></button>';}).join('')+(IDX.uwaga?'<p class="kp-info">'+esc(IDX.uwaga)+'</p>':'');}
function resHtml(q){if(!norm(q).trim())return '';var r=search(IX,q);return r.length?r.map(function(j){var d=dzialInfo(j.dzial);return '<button class="kp-it" data-u="'+esc(j.id)+'" style="border-left-color:'+esc(d.kolor)+'">'+esc(j.tytul)+'<small>'+esc(d.nazwa)+(j.rozdzial?' · '+esc(j.rozdzial):'')+'</small></button>';}).join(''):'<div class="kp-box">Brak wyników dla „'+esc(q)+'”.</div>';}
function dzialHtml(d){var D=dzialInfo(d),L=inDzial(IDX,d),rz='';return navBar()+'<h2 style="border-left:12px solid '+esc(D.kolor)+';padding-left:8px">'+esc(D.nazwa)+'</h2>'+L.map(function(j){var h='';if(j.rozdzial!==rz){rz=j.rozdzial;h='<h3>'+esc(rz||'')+'</h3>';}return h+'<button class="kp-it" data-u="'+esc(j.id)+'" style="border-left-color:'+esc(D.kolor)+'">'+esc(j.tytul)+'</button>';}).join('');}
function li(a){return a&&a.length?'<ul>'+a.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>':'';}
function tbl(h,rows){return '<table><thead><tr>'+h.map(function(x){return '<th>'+esc(x)+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+esc(c)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table>';}
function sec(cls,title,body,open){return body?'<details class="kp-sec '+cls+'"'+(open?' open':'')+'><summary>'+title+'</summary>'+body+'</details>':'';}
function svgSrc(g){if(g.svg)return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(g.svg);return /^[a-z0-9._-]+\.svg$/i.test(g.plik||'')?'assets/kompendium/'+g.plik:'';}
function cardHtml(r){var D=dzialInfo(r.dzial),nb=neighbours(IDX,r.id),dg=r.diagnostyka||{},lc=r.leczenie||{},t=dg.tabela;
 var nav=navBar((nb.prev?'<button data-u="'+esc(nb.prev.id)+'">← Poprzednia</button>':'')+(nb.next?'<button data-u="'+esc(nb.next.id)+'">Następna →</button>':'')+'<button data-dz="'+esc(r.dzial)+'">≡ Lista działu</button>');
 var h=nav+'<div style="border-left:12px solid '+esc(D.kolor)+';padding-left:10px"><div class="kp-info">'+esc(D.nazwa)+(r.rozdzial?' · '+esc(r.rozdzial):'')+' · '+nb.pos+'/'+nb.n+'</div><h2>'+esc(r.tytul)+'</h2><div>'+(r.slowa_kluczowe||[]).map(function(k){return '<span class="kp-tag">'+esc(k)+'</span>';}).join('')+'</div>'+((r.synonimia||[]).length?'<div class="kp-info">Synonimy: '+esc(r.synonimia.join(', '))+'</div>':'')+'</div>';
 h+='<div class="kp-sec kp-red" id="kp-dyz"><h3>🚨 Na dyżurze</h3>'+li(r.na_dyzurze)+'</div>';
 h+=sec('','Definicja i etiologia',r.definicja?'<p>'+esc(r.definicja)+'</p>':'');
 h+=sec('','Obraz kliniczny',li(r.obraz_kliniczny));
 h+=sec('kp-blue','Diagnostyka',li(dg.tekst)+(t&&t.naglowki&&t.naglowki.length?tbl(t.naglowki,t.wiersze||[]):''));
 h+=sec('','Różnicowanie',(r.roznicowanie||[]).length?tbl(['Jednostka','Co odróżnia','Badanie rozstrzygające'],r.roznicowanie.map(function(x){return[x.jednostka,x.co_odroznia,x.badanie];})):'');
 h+=sec('kp-green','Leczenie',((lc.ostre||[]).length?'<b>Postępowanie ostre</b>'+li(lc.ostre):'')+((lc.przewlekle||[]).length?'<b>Leczenie przewlekłe</b>'+li(lc.przewlekle):'')+((lc.leki||[]).length?tbl(['Lek','Dawka','Droga','Uwagi'],lc.leki.map(function(x){return[x.lek,x.dawka,x.droga,x.uwagi];})):''));
 h+=sec('','Powikłania i rokowanie',r.powiklania?'<p>'+esc(r.powiklania)+'</p>':'');
 h+=sec('kp-yel','⚠ Pułapki',li(r.pulapki));
 h+=sec('kp-grey','Spoza głównego źródła (nowsze wytyczne)',(r[SPZ]||[]).length?'<ul>'+r[SPZ].map(function(x){return '<li>'+esc(x.tekst)+' <i>('+esc(x.wytyczne)+', '+esc(x.rok)+') ['+esc(x.pewnosc)+']</i></li>';}).join('')+'</ul>':'');
 h+=sec('','Rysunki',(r.grafiki||[]).map(function(g){var s=svgSrc(g);return s?'<figure><img alt="'+esc(g.podpis)+'" src="'+esc(s)+'"><figcaption>'+esc(g.podpis)+'</figcaption></figure>':'';}).join(''));
 var ods=(r.odsylacze||[]).map(function(id){var j=IDX.jednostki.find(function(x){return x.id===id;});return j?'<button data-u="'+esc(id)+'">↪ '+esc(j.tytul)+'</button>':'';}).join('');
 var mods=(r.moduly_aplikacji||[]).filter(function(m){return MODS_OK.indexOf(m)>=0;}).map(function(m){var M=root.SKM&&root.SKM.list.find(function(x){return x.id===m;});return M?'<button class="kp-mod" data-mod="'+esc(m)+'">'+esc(M.icon||'')+' '+esc(M.name)+'</button>':'';}).join('');
 h+=sec('','Odsyłacze i moduły aplikacji',(ods?'<div>'+ods+'</div>':'')+(mods?'<div><b>Moduły aplikacji:</b><br>'+mods+'</div>':''),true);
 var z=r.zrodlo||{};h+='<p class="kp-info">Źródło: '+esc(z.ksiazka||'')+(z.strony?', s. '+esc(z.strony):'')+' · status: <b>'+esc(r.status||'')+'</b> (zgodność ze źródłem, nie walidacja kliniczna) · '+esc(r.data||'')+'</p>';return h;}
function wire(el){var k=el.querySelector('#kp');k.onclick=function(e){var b=e.target.closest&&e.target.closest('button');if(!b)return;
 if(b.dataset.u){view={v:'card',id:b.dataset.u,q:view.q};draw(el);return;}if(b.dataset.dz){view={v:'dz',d:b.dataset.dz,q:view.q};draw(el);return;}if(b.dataset.go==='home'){view={v:'home',q:view.q};draw(el);return;}
 if(b.dataset.mod){if(root.SKS)root.SKS.show(b.dataset.mod);return;}
 if(b.dataset.act==='lock'){lock();draw(el);return;}if(b.dataset.act==='forget'){forget().then(function(){b.textContent='✓ Zapomniano na tym urządzeniu';});}};
 var q=el.querySelector('#kp-q');if(q){var r=el.querySelector('#kp-res');r.innerHTML=resHtml(q.value);q.oninput=function(){view.q=q.value;r.innerHTML=resHtml(q.value);};}}
var SEQ=0;
function draw(el){var my=++SEQ;if(!KEY){
  // przy otwarciu bez zapytań sieciowych: najpierw zapamiętany klucz; pliki danych dopiero przy odblokowaniu
  recall().then(function(rc){if(my!==SEQ)return;if(!(rc&&rc.key))return lockScreen(el,lastErr);
   return ensureEnc().then(function(){if(rc.salt!==E().kdf.salt)throw Error('sól');return unlockWith(rc.key);}).then(function(){if(my===SEQ)draw(el);},function(e){if(my!==SEQ)return;if(e&&e.message==='brak')return noData(el);forget();lockScreen(el,'Zapamiętany klucz nie pasuje do danych – wpisz hasło.');});}).catch(function(e){if(my===SEQ)lockScreen(el,'Błąd: '+(e&&e.message));});return;}
 if(view.v==='card'){H(el,'Wczytywanie…');unitById(view.id).then(function(r){if(my!==SEQ)return;H(el,cardHtml(r));wire(el);root.scrollTo&&root.scrollTo(0,0);},function(e){H(el,navBar()+'<div class="kp-err">'+esc(e.message)+'</div>');wire(el);});return;}
 H(el,view.v==='dz'?dzialHtml(view.d):homeHtml());wire(el);}
// „Ten ekran”: drukujemy bieżącą kartę (tylko DOM w pamięci; po wydruku czyszczone)
if(typeof window!=='undefined'&&window.addEventListener){window.addEventListener('beforeprint',function(){var a=document.getElementById('printArea'),k=document.getElementById('kp'),act=root.SKS&&root.SKS.active&&root.SKS.active();if(!a||!k||!act||act.id!=='kompendium'||!KEY)return;
  var c=k.cloneNode(true);c.querySelectorAll('details').forEach(function(d){d.setAttribute('open','');});c.querySelectorAll('.kp-nav,button,input,#kp-res').forEach(function(x){x.remove();});a.innerHTML='<style>'+CSS+'</style>';a.appendChild(c);a.dataset.kp='1';if(root.SORReport&&root.SORReport.brand)try{root.SORReport.brand(a);}catch(e){}});
 window.addEventListener('afterprint',function(){var a=document.getElementById('printArea');if(a&&a.dataset.kp){a.innerHTML='';delete a.dataset.kp;}});}
var mod={id:'kompendium',icon:'📘',name:'Interna: kompendium',render:function(el){draw(el);}};
return{mod:mod,MODS_OK:MODS_OK,norm:norm,buildIx:buildIx,search:search,neighbours:neighbours,deriveKey:deriveKey,encryptJSON:encryptJSON,decryptJSON:decryptJSON,newKdf:newKdf,kluczJs:kluczJs,plikJs:plikJs,b64e:b64e,b64d:b64d,KDF_ITER:KDF_ITER,_lock:lock,_isUnlocked:function(){return !!KEY;}};});
