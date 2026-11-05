// Wersja 5.1 (na bazie 5.0-D): moduł „O programie” (informacje, źródła danych, lista „Do uzupełnienia / zweryfikowania”, konfiguracja lokalna, kontrola ChPL).
// Dane źródeł (dist/data/zrodla.js, ~140 kB) ładowane leniwie – dopiero przy otwarciu „Źródeł”, druku lub raportu.
(function(root){
'use strict';
var VERSION='5.1',DATE='05.11.2026',LKEY='sor_local_cfg';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function safeUrl(u){u=String(u||'');return /^https?:\/\//i.test(u)?u:'#';}
function a(u,t){return '<a href="'+esc(safeUrl(u))+'" target="_blank" rel="noopener noreferrer">'+esc(t||u)+'</a>';}
// ------------------------------------------------------------------ konfiguracja lokalna
// Pola z otwartych walidacji katalogu (MAPA_MODULOW) i LUKI_DO_WALIDACJI. Wartości tylko w tej przeglądarce (localStorage, klucz sor_local_cfg),
// NIE są czyszczone przez „Następny pacjent”; usuwa je „Resetuj wszystkie dane i ustawienia”. Wartości nie zmieniają obliczeń – są informacją dla lekarza i trafiają do wydruku.
var FIELDS=[
 {k:'ufh_recipe',l:'UFH – zatwierdzona receptura pompy (j.m. w ml, j.m./ml)',mods:['pompy','pe','acoag'],area:23,ph:'np. 25 000 j.m./50 ml = 500 j.m./ml'},
 {k:'aptt_range',l:'Zakres terapeutyczny aPTT (s) / anty-Xa (j./ml) – laboratorium szpitalne',mods:['pe','acoag'],area:4,ph:'np. aPTT 60–85 s; anty-Xa 0,3–0,7'},
 {k:'ufh_nomogram',l:'Nomogram modyfikacji UFH – nazwa i wersja dokumentu szpitalnego',mods:['pe','acoag'],area:23},
 {k:'nor_recipe',l:'Noradrenalina – lokalna receptura (mg/ml końcowe; obwodowo/centralnie)',mods:['pompy','ahf','sepsis'],area:21,ph:'ChPL: 2 mg/50 ml = 40 µg/ml'},
 {k:'amine_extrav',l:'Wynaczynienie amin – procedura i dostępność fentolaminy',mods:['pompy','ahf'],area:21},
 {k:'adr_infusion',l:'Adrenalina – wlew w anafilaksji opornej: receptura i pompa',mods:['ana','pompy'],area:22},
 {k:'ins_iv',l:'Insulina do wlewu i.v. – preparat i opakowanie (fiolka / pen – off-label)',mods:['dka','pompy'],area:19},
 {k:'nacl3',l:'3% NaCl – gotowy preparat lub sposób przygotowania (apteka)',mods:['elyte'],area:17},
 {k:'kcl_bags',l:'KCl – dostępne gotowe worki / stężenia',mods:['elyte','dka'],area:16},
 {k:'antibiogram',l:'Lokalny antybiogram – wersja / data / link wewnętrzny',mods:['sepsis','cap','neuroinf'],area:14},
 {k:'tnk_avail',l:'Tromboliza – dostępne preparaty (Actilyse / Metalyse 25 mg) i protokół udarowy',mods:['neuro','acoag'],area:3},
 {k:'se_drugs',l:'Stan padaczkowy – dostępne benzodiazepiny i leki II linii (preparaty, ampułki)',mods:['se'],area:26},
 {k:'nac_prep',l:'NAC – dostępny preparat i.v.',mods:['tox'],area:27},
 {k:'fomepizol',l:'Fomepizol / etanol / dializa – dostępność',mods:['tox'],area:28},
 {k:'tel_id',l:'Oddział zakaźny / dyżur (neuroinfekcje) – telefon',mods:['neuroinf'],area:9,tel:1},
 {k:'tel_pharm',l:'Apteka szpitalna – telefon',mods:['tox','pompy'],area:33,tel:1},
 {k:'tel_psse',l:'PSSE Nowy Targ (grzyboznawca) – telefon',mods:['tox'],area:27,tel:1},
 {k:'tel_tx',l:'Ośrodek transplantacji wątroby – telefon',mods:['tox'],area:27,tel:1},
 {k:'endo',l:'Pracownia endoskopii – godziny i telefon',mods:['gib'],area:0},
 {k:'rckik',l:'RCKiK – czas dostawy KKP / procedura MTP',mods:['transf'],area:0},
 {k:'hs_ctn',l:'hs-cTn – test laboratorium (producent, 99. centyl, algorytm 0/1 h lub 0/2 h)',mods:['trop'],area:1}];
function lget(){try{var o=JSON.parse(localStorage.getItem(LKEY));return o&&typeof o==='object'&&!Array.isArray(o)?o:{};}catch(e){return {};}}
function clean(v){return String(v==null?'':v).replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,300);}
function validTel(v){return v===''||/^[+0-9 ()\-\/]{6,24}$/.test(v)&&(v.replace(/\D/g,'').length>=6);}
function lset(k,v){var f=FIELDS.filter(function(x){return x.k===k;})[0];if(!f)throw Error('Nieznane pole');v=clean(v);
 if(f.tel&&!validTel(v))throw Error('Numer telefonu: dozwolone cyfry, spacje, +, -, ( ) – min. 6 cyfr.');
 var o=lget();if(v==='')delete o[k];else o[k]={v:v,ts:Date.now()};try{localStorage.setItem(LKEY,JSON.stringify(o));}catch(e){}return o;}
function filled(){var o=lget();return FIELDS.filter(function(f){return o[f.k]&&o[f.k].v;});}
function fmtTs(ts){try{return new Date(ts).toLocaleDateString('pl-PL',{timeZone:'Europe/Warsaw'});}catch(e){return '';}}
function localFor(mid){var o=lget();return FIELDS.filter(function(f){return !mid||f.mods.indexOf(mid)>=0;}).map(function(f){return{f:f,v:o[f.k]&&o[f.k].v||'',ts:o[f.k]&&o[f.k].ts};});}
function localReportHtml(ids){var l=FIELDS.filter(function(f){return !ids||f.mods.some(function(m){return ids.indexOf(m)>=0;});}),o=lget(),rows=l.filter(function(f){return o[f.k]&&o[f.k].v;});
 if(!rows.length)return '';return '<table><tr><th>Ustawienie lokalne</th><th>Wartość (wpis lekarza/szpitala)</th></tr>'+rows.map(function(f){return '<tr><td>'+esc(f.l)+'</td><td>'+esc(o[f.k].v)+'</td></tr>';}).join('')+'</table>';}
root.SORLocal={FIELDS:FIELDS,get:lget,set:lset,filled:filled,forModule:localFor,reportHtml:localReportHtml,validTel:validTel,KEY:LKEY};
// ------------------------------------------------------------------ dane źródeł (leniwie)
var loading=null;
function ensure(){if(root.SOR_ZRODLA)return Promise.resolve(root.SOR_ZRODLA);if(loading)return loading;
 loading=new Promise(function(res,rej){var s=document.createElement('script');s.src='data/zrodla.js';s.onload=function(){root.SOR_ZRODLA?res(root.SOR_ZRODLA):rej(Error('Brak danych źródeł'));};s.onerror=function(){loading=null;rej(Error('Nie udało się wczytać data/zrodla.js'));};document.head.appendChild(s);});return loading;}
function modOf(Z,id){return Z.mods.filter(function(m){return m.id===id;})[0];}
function areaOf(Z,n){return Z.areas.filter(function(x){return x.n===n;})[0];}
function srcLinks(Z,ids){return ids.map(function(i){var s=Z.src[i];return a(s.u,s.t);}).join('; ');}
// stopka wydruku: źródła modułów w raporcie (wymaga wczytanych danych; bez nich – odsyłacz)
function footerHtml(ids){var Z=root.SOR_ZRODLA,h='';
 if(Z&&ids&&ids.length){ids.forEach(function(id){var m=modOf(Z,id);if(!m)return;var ar=m.areas.map(function(n){return areaOf(Z,n);}).filter(Boolean);
   h+='<p><b>'+esc(m.name)+':</b> '+(ar.length?ar.map(function(x){return esc(x.name)+' – podstawowe: '+srcLinks(Z,x.g)+'; uzupełniające: '+srcLinks(Z,x.s)+'; <i>otwarta walidacja: '+esc(x.open)+'</i>';}).join(' · '):esc(m.none||'brak obszaru w katalogu'))+'</p>';});}
 var loc=localReportHtml(ids&&ids.length?ids:null);
 return (h?'<h2>Źródła modułów (katalog 24.10.2026)</h2>'+h:'')+(loc?'<h2>Konfiguracja lokalna</h2>'+loc:'')+'<p class="sub">Źródła danych: „O programie → Źródła danych” (docs/ZRODLA_DANYCH.md). ICD-10: Centrum e-Zdrowia (CC BY 4.0); ICD-9 PL CM v5.90: NFZ; ChPL: Rejestr Produktów Leczniczych / EMA. Wersja '+VERSION+'.</p>';}
// ------------------------------------------------------------------ interfejs
var TABS=[['info','Informacje'],['src','Źródła danych'],['todo','Do uzupełnienia / zweryfikowania'],['local','Konfiguracja lokalna'],['chpl','Kontrola ChPL'],['data','Dane i licencje']];
var state={tab:'info',mod:'',q:'',kind:'',todoMod:'',todoQ:''};
function menuMods(){return (root.SKM&&SKM.list||[]).filter(function(m){return !m.sep;});}
function infoHtml(){var mods=menuMods().map(function(m){return esc(m.name);}).join(', ');
 return '<div class="box"><div class="big">Asystent lekarza SOR</div><p><b>Wersja '+VERSION+'</b> · '+DATE+' · faza testów klinicznych (wersja testowa)</p>'+
 '<p><b>Narzędzie pomocnicze – niecertyfikowane, nie jest wyrobem medycznym.</b> Każdą dawkę, przeliczenie i decyzję weryfikuje lekarz z aktualną ChPL i procedurą szpitala. Katalog źródeł przypisuje dokumenty do obszarów – <b>nie jest walidacją kliniczną</b>.</p></div>'+
 '<div class="box"><h3>Jak korzystać</h3><ol><li>Uzupełnij pasek pacjenta (masa, wiek, płeć, kreatynina, wzrost) – moduły przeliczają dawki i CrCl/eGFR.</li><li>Wybierz moduł z menu (☰, skrót „/” – wyszukiwanie). Kolory: zielony – OK, pomarańczowy – ostrożnie, czerwony – niebezpieczne (lampa i syrena).</li><li>„📚 Źródła” w górnym pasku pokazuje źródła i otwarte walidacje bieżącego modułu.</li><li>Wydruk: „🖨 Ten ekran” lub „🖨 Raport zbiorczy” (dołączana stopka źródeł i konfiguracji lokalnej).</li><li>„Następny pacjent” usuwa dane pacjenta; ustawienia i konfiguracja lokalna pozostają.</li></ol></div>'+
 '<div class="box"><h3>Zakres</h3><p>'+mods+'.</p><p class="mut">Działa offline (Service Worker); dane zapisywane tylko w tej przeglądarce. Dokumentacja nie jest przesyłana do systemu szpitalnego.</p></div>'+
 '<div class="box orange"><h3>Ograniczenia</h3><ul><li>Brak walidacji klinicznej całego produktu; testy automatyczne są techniczne (także przypadki kliniczne liczone ręcznie – to nie walidacja).</li><li>Wartości oznaczone „DO DECYZJI LEKARZA” / „ROBOCZE – ustalić lokalnie” wymagają decyzji lekarza lub procedury szpitala.</li><li>Rozbieżności ChPL ↔ wytyczne są pokazywane, nie rozstrzygane (np. INR przed alteplazą, bolus 3% NaCl, receptura noradrenaliny 80 µg/ml).</li><li>Obszary katalogu bez modułu: resuscytacja, NIV/HFNO, POCUS (źródła przypisane, brak kalkulatora).</li></ul></div>'+
 '<div class="box"><h3>Zmiany w wersji '+VERSION+'</h3><ul>'+
 '<li><b>5.1:</b> nowy moduł „💊 Leki – karty dawkowania”: 121 kart substancji z ChPL (RPL/EMA) i wytycznych, statusy zweryfikowane / DO DECYZJI LEKARZA, wyszukiwanie w katalogu RPL (20 295 produktów, link do ChPL), kopiowanie tekstu zalecenia, dodanie do „Co wykonano” i lista leków na wypis. Pozostałe moduły bez zmian względem 5.0-D.</li>'+
 '<li><b>Podgląd 5.1 pw36 (05.11.2026):</b> Sepsa – FiO₂ tylko automatycznie z trybu tlenoterapii + przepływu (bez pola ręcznego); puste „nie ustalono” = brak FiO₂.</li>'+
 '<li><b>Podgląd 5.1 pw35 (05.11.2026):</b> Sepsa Ocena – FiO₂ z trybu tlenu (powietrze/wąsy/maska/NRB) + przepływ 1–15 l/min i szacunek; diureza godzinowa ml/kg/h (bez ml/dobę na starcie; do SOFA cicho × masa × 24).</li>'+
 '<li><b>Podgląd 5.1 pw34 (05.11.2026):</b> Sepsa – MAP aktualizuje się natychmiast przy każdym znaku SBP/DBP (także po zaznaczeniu zakażenia); ciężkie przeliczenie z opóźnieniem 120 ms.</li>'+
 '<li><b>Podgląd 5.1 pw33 (05.11.2026):</b> Sepsa – MAP auto zaraz przy SBP/DBP (nie wymaga checkboxa zakażenia), widoczny przy polach.</li>'+
 '<li><b>Podgląd 5.1 (pw21–pw30, 05.11.2026):</b> PSSE Nowy Targ 18 266 29 14 przy grzybach; schemat pomostowy amatoksyn (NAC i.v., Legalon opcjonalnie); mniej fałszywych alarmów radiologii w Hamulcu/PW; Kompendium interny poza app z powrotem; jedna wersja Elektrolitów SOR; jedno czyszczenie tylko przez „Następny pacjent”; moduł Lekowrażliwość EUCAST (Lekify/KORLD); Hamulec w menu tuż pod Przeglądem wyników; poprawiona literówka KOMPENDIUM; Neuroinfekcje – empiria ABX+deksametazon (i acyklowir przy HSV) od razu, bez blokady na brak wieku/ciąży/alergii.</li>'+
 '<li><b>Podgląd 5.1 (pw32, 05.11.2026):</b> Sepsa – MAP liczony automatycznie z SBP/DBP; PaO₂ + FiO₂ → P/F z podpowiedzią (gazometria, szacunek FiO₂ na tlenie); ocena wstępna bez noradrenaliny (wazopresor opcjonalnie przy re-ocenie); mniej „DO DECYZJI”; antybiotyki: ścieżka lokalna SOR NT – ceftriakson 2 g i.v. teraz + lista leków do zamówienia z apteki, schemat wytycznych jako cel; Ponowna ocena – MAP/diureza/mleczany, przy MAP <65 okno płynów (30 ml/kg, pozostało) + przyciski do Pomp SOR (noradrenalina, dopamina, dobutamina) i Bilansu płynów.</li>'+
 '<li><b>Podgląd 5.1 (pw31, 05.11.2026):</b> Neuroinfekcje – usunięta myląca kolumna dawki std (2 g/24 h vs ZOMR 2 g/12 h); alergia β-laktamów → meropenem 2 g co 8 h + wanko ± TMP-SMX na Listerię (DO DECYZJI); Telefony/Książka wysoko pod Hamulcem; EUCAST jasno jako link Lekify (nie matryca offline); Troponina – rule-out nie = automatyczny wypis (weryfikacja karty lab NT); Hamulec sticky + zwinięte zaprzeczenia; Dokumentacja – szablon lokalny bez ChatGPT; CAP – blokada skrótu przy niepełnym CURB; Neurologia – MoCA/MMSE/CDR jako „nie SOR”; Omdlenie – tryb Szybki; Sepsa↔Neuroinf link przy OUN.</li>'+
 '<li>Katalog źródeł 24.10.2026 (32 obszary + wspólna baza leków, 311 adresów + 8 z mapy modułów) w aplikacji: źródło podstawowe / uzupełniające / otwarta walidacja dla każdego modułu; lista „Do uzupełnienia / zweryfikowania”; konfiguracja lokalna; stopka źródeł w wydruku.</li>'+
 '<li>Kontrola ChPL/EPAR (24.10.2026): tenekteplaza w udarze wg przedziałów masy (EPAR Metalyse), INR 1,3 vs 1,7 i drgawki na początku udaru (ChPL Actilyse), adrenalina i.m. u niemowląt &lt;6 mies. 0,01 mg/kg, heparyna w pompie (≤1000 j.m./ml – blokada), noradrenalina &gt;40 µg/ml – ostrzeżenie, insulina 0,05–1,0 j./ml – blokada, KCl (6 h, dobutamina, cewnik centralny), 3% NaCl (100 ml/h z ChPL vs ESE).</li>'+
 '<li>Pompy SOR: twarde limity dawek (np. noradrenalina 2, adrenalina 1 µg/kg/min) – wynik wstrzymywany przy podejrzeniu pomyłki jednostek; stężenie poza limitem ChPL wstrzymuje wynik.</li>'+
 '<li>Audyt kodu z macierzą ryzyk (docs/MACIERZ_RYZYK.md) i niezależne przypadki kliniczne (tests/etapD.cjs).</li></ul></div>'+
 '<div class="box"><h3>Status testów</h3><p id="abTests">Testy automatyczne: 10 zestawów (run, treatment, clinical, icd, etapA, etapB1, etapB2, etapC, etapD, leki51) – szczegóły w TESTY.md. Test techniczny, nie walidacja kliniczna; nie testowano na sprzęcie szpitalnym.</p></div>';}
function srcHtml(Z){var mods=Z.mods,sel=state.mod||'';
 var h='<div class="box"><p><b>Katalog źródeł:</b> '+esc(Z.meta.catalog)+' · '+Z.meta.nAreas+' pozycji (32 obszary + baza leków) · '+Z.meta.nSrc+' adresów. <span class="dw">'+esc(Z.meta.status)+'</span></p>'+
  '<div class="row"><label>Moduł <select id="abMod"><option value="">— wszystkie obszary (tabela) —</option>'+mods.map(function(m){return '<option value="'+esc(m.id)+'"'+(m.id===sel?' selected':'')+'>'+esc(m.name)+'</option>';}).join('')+'</select></label></div></div>';
 if(!sel){h+='<div class="box"><h3>32 obszary kliniczne + wspólna baza leków</h3><div class="b1tw"><table class="b1t ab-t"><tr><th>Nr</th><th>Obszar</th><th>Źródło podstawowe</th><th>Źródło uzupełniające</th><th>Otwarta walidacja</th><th>Moduły</th></tr>'+
   Z.areas.map(function(x){return '<tr><td>'+x.n+'</td><td>'+esc(x.name)+'</td><td>'+srcLinks(Z,x.g)+'</td><td>'+srcLinks(Z,x.s)+'</td><td><span class="dw">DO UZUPEŁNIENIA</span> '+esc(x.open)+'</td><td>'+(x.mods.length?x.mods.map(function(id){var m=modOf(Z,id);return esc(m?m.name:id);}).join(', '):'<i>brak modułu</i>')+'</td></tr>';}).join('')+'</table></div></div>';}
 else{var m=modOf(Z,sel);h+='<div class="box" id="abModCard"><h3>'+esc(m.name)+'</h3>';
   if(m.none)h+='<p class="o">'+esc(m.none)+'</p>';
   m.areas.forEach(function(n){var x=areaOf(Z,n);h+='<div class="ab-area"><b>'+x.n+'. '+esc(x.name)+'</b><div>Źródło podstawowe: '+srcLinks(Z,x.g)+'</div><div>Źródło uzupełniające: '+srcLinks(Z,x.s)+'</div><div>Otwarta walidacja: <span class="dw">DO UZUPEŁNIENIA</span> '+esc(x.open)+'</div></div>';});
   if(m.rules.length)h+='<h4>Źródła reguł użytych w kodzie</h4><div class="b1tw"><table class="b1t"><tr><th>Obszar</th><th>Reguła</th><th>Źródło</th></tr>'+m.rules.map(function(r){return '<tr><td>'+esc(r.o)+'</td><td>'+esc(r.r)+'</td><td>'+esc(r.z)+'</td></tr>';}).join('')+'</table></div>';
   if(m.src.length)h+='<h4>Adresy z indeksu przypisane tematycznie ('+m.src.length+')</h4><ol class="ab-src">'+m.src.map(function(i){var s=Z.src[i];return '<li>'+a(s.u,s.t)+' <span class="mut">['+esc(s.r)+' · '+esc(Z.kinds[s.k])+(s.new?' · spoza indeksu 311':'')+']</span></li>';}).join('')+'</ol>';
   h+='</div>';}
 h+='<div class="box"><h3>Szukaj w indeksie ('+Z.src.length+')</h3><div class="row"><input id="abQ" placeholder="np. heparyna, ESC, RPL 2861" value="'+esc(state.q)+'" style="min-width:240px"> <select id="abKind"><option value="">każdy rodzaj</option>'+Object.keys(Z.kinds).map(function(k){return '<option value="'+k+'"'+(state.kind===k?' selected':'')+'>'+esc(Z.kinds[k])+'</option>';}).join('')+'</select></div><div id="abRes"></div><p class="mut">Wiarygodność: A – urzędowe / rejestr / towarzystwo; B – publikacja / producent; C – agregator lub strona szpitala (nie podstawa reguł); L – materiał lokalny. Status każdego adresu: link z katalogu – aktualność i wersja do potwierdzenia.</p></div>'+
 '<div class="box"><h3>Rozbieżności nowego katalogu względem poprzednich plików</h3><ul>'+Z.disc.map(function(d){return '<li>'+esc(d)+'</li>';}).join('')+'</ul></div>';
 return h;}
function searchRes(Z){var q=state.q.toLowerCase().trim(),k=state.kind;if(!q&&!k)return '<p class="mut">Wpisz frazę lub wybierz rodzaj.</p>';
 var r=Z.src.filter(function(s){return (!k||s.k===k)&&(!q||(s.t+' '+s.u+' '+s.c).toLowerCase().indexOf(q)>=0);});
 return '<p>'+r.length+' wyników'+(r.length>60?' (pokazano 60)':'')+'</p><ol class="ab-src">'+r.slice(0,60).map(function(s){return '<li>'+a(s.u,s.t)+' <span class="mut">['+esc(s.r)+' · '+esc(Z.kinds[s.k])+']</span></li>';}).join('')+'</ol>';}
// lista „Do uzupełnienia / zweryfikowania”: otwarte walidacje katalogu + DO DECYZJI z README + konfiguracja lokalna + ChPL DO DECYZJI + luki ogólne
function todoItems(Z){var it=[];
 Z.areas.forEach(function(x){(x.mods.length?x.mods:['—']).forEach(function(mid){it.push({mod:mid,kind:'Otwarta walidacja (katalog, obszar '+x.n+')',t:x.name+': '+x.open});});});
 Z.mods.forEach(function(m){m.dec.forEach(function(d){it.push({mod:m.id,kind:'DO DECYZJI LEKARZA (README, lista '+d.e+')',t:d.t});});});
 var o=lget();FIELDS.forEach(function(f){if(!(o[f.k]&&o[f.k].v))f.mods.forEach(function(mid){it.push({mod:mid,kind:'Konfiguracja lokalna – NIE UZUPEŁNIONO',t:f.l,local:f.k});});});
 Z.chpl.forEach(function(c){if(c.status==='DO DECYZJI')it.push({mod:'drugbase',kind:'ChPL ↔ praktyka – DO DECYZJI',t:c.name+': '+c.result});});
 Z.rpl.forEach(function(r){if(!r.cmp&&r.doc==='characteristic')it.push({mod:'drugbase',kind:'ChPL pobrana, nieporównana z regułami',t:'RPL '+r.id+' – '+r.name});});
 Z.luki.forEach(function(l){it.push({mod:'ogolne',kind:'Luka z poprzedniego audytu',t:l});});
 return it;}
function todoHtml(Z){var it=todoItems(Z),mods=Z.mods,sel=state.todoMod,q=state.todoQ.toLowerCase();
 var f=it.filter(function(x){return (!sel||x.mod===sel)&&(!q||(x.t+' '+x.kind).toLowerCase().indexOf(q)>=0);});
 var cnt={};it.forEach(function(x){cnt[x.mod]=(cnt[x.mod]||0)+1;});
 var h='<div class="box orange"><p><b>Do uzupełnienia / zweryfikowania: '+it.length+' pozycji.</b> Lista łączy otwarte walidacje z katalogu 24.10.2026, pozycje „DO DECYZJI LEKARZA”, nieuzupełnioną konfigurację lokalną i dokumenty ChPL bez porównania. Pozycja zniknie z listy dopiero po uzupełnieniu w kodzie/katalogu lub (konfiguracja) w zakładce „Konfiguracja lokalna”.</p>'+
  '<div class="row"><label>Moduł <select id="abTodoMod"><option value="">wszystkie</option>'+mods.map(function(m){return cnt[m.id]?'<option value="'+esc(m.id)+'"'+(m.id===sel?' selected':'')+'>'+esc(m.name)+' ('+cnt[m.id]+')</option>':'';}).join('')+'</select></label> <input id="abTodoQ" placeholder="szukaj…" value="'+esc(state.todoQ)+'"></div></div>';
 var by={};f.forEach(function(x){(by[x.mod]=by[x.mod]||[]).push(x);});
 Object.keys(by).forEach(function(mid){var m=modOf(Z,mid);h+='<div class="box"><h3>'+esc(m?m.name:'Bez modułu (obszary 30–31)')+' <span class="mut">('+by[mid].length+')</span></h3><ul class="ab-todo">'+by[mid].map(function(x){return '<li><span class="dw">'+esc(x.kind)+'</span> '+esc(x.t)+(x.local?' <button class="tg" data-goto-local="'+esc(x.local)+'">uzupełnij</button>':'')+'</li>';}).join('')+'</ul></div>';});
 if(!f.length)h+='<div class="box">Brak pozycji dla wybranego filtra.</div>';
 return h;}
function localHtml(){var o=lget();return '<div class="box"><p>Pola ustala szpital/lekarz. Zapis tylko w tej przeglądarce; <b>nie zmienia obliczeń</b> – wartości są pokazywane jako informacja i dołączane do wydruku. „Następny pacjent” ich nie usuwa.</p></div><div class="box">'+
 FIELDS.map(function(f){var v=o[f.k]&&o[f.k].v||'';return '<div class="ab-lf" data-k="'+f.k+'"><label><b>'+esc(f.l)+'</b><br><input data-local="'+f.k+'" maxlength="300" value="'+esc(v)+'" placeholder="'+esc(f.ph||(f.tel?'+48 …':'do uzupełnienia'))+'"'+(f.tel?' inputmode="tel"':'')+'></label> <span class="mut" data-lst="'+f.k+'">'+(v?'uzupełniono '+esc(fmtTs(o[f.k].ts)):'<span class="dw">NIE UZUPEŁNIONO</span>')+'</span>'+(f.tel&&v?' '+'<a href="tel:'+esc(v.replace(/[^+0-9]/g,''))+'">zadzwoń</a>':'')+'</div>';}).join('')+'</div>';}
function chplHtml(Z){return '<div class="box"><p>Dokumenty pobrane i porównane z regułami aplikacji 24.10.2026 (ChPL z RPL, EPAR z EMA). Status: <b>zmieniono</b> – kod poprawiony; <b>DO DECYZJI</b> – rozbieżność ChPL ↔ wytyczne/praktyka pokazana w module; <b>zgodne</b>.</p><div class="b1tw"><table class="b1t ab-t"><tr><th>Produkt</th><th>Dokument</th><th>Sekcje</th><th>Wynik</th><th>Zmiana</th><th>Status</th></tr>'+
 Z.chpl.map(function(c){return '<tr><td>'+esc(c.name)+'</td><td>'+a(c.url,c.doc)+'</td><td>'+esc(c.sections)+'</td><td>'+esc(c.result)+'</td><td>'+esc(c.change)+'</td><td><span class="dw">'+esc(c.status)+'</span></td></tr>';}).join('')+'</table></div></div>'+
 '<div class="box"><h3>RPL – wykaz z audytu (40 dokumentów)</h3><p class="mut">Pobrano 24.10.2026; „porównano” = sekcje 4.2–4.4/6.6 zestawione z regułami aplikacji. Pozostałe – otwarta walidacja.</p><ul class="ab-src">'+Z.rpl.map(function(r){return '<li>RPL '+esc(r.id)+' ('+esc(r.doc)+'): '+esc(r.name)+' – '+(r.cmp?'<b>porównano</b>':'pobrano, nieporównano')+'</li>';}).join('')+'</ul></div>';}
function dataHtml(Z){return '<div class="box"><h3>Klasyfikacje</h3><ul><li><b>ICD-10</b>: ICD-10-2008-PL – Centrum e-Zdrowia, Rejestr Systemów Kodowania (dane.gov.pl, zbiór 27), licencja CC BY 4.0, stan 31.03.2021.</li><li><b>ICD-9 PL CM</b> v5.90 – NFZ, Centralne Zasoby Słownikowe (publikacja 25.09.2026, pobrano 23.10.2026); strona NFZ nie podaje jawnej licencji pliku.</li></ul></div>'+
 '<div class="box"><h3>Wytyczne i ChPL</h3><p>Reguły modułów cytują wytyczne towarzystw (m.in. ESC, AHA/ASA, ERC/RCUK, SSC, NICE, ADA/JBDS, ESE, KDIGO, IDSA, ESCMID, ESGE) oraz ChPL z Rejestru Produktów Leczniczych i EPAR EMA – w aplikacji przechowywane są wyłącznie odnośniki i krótkie streszczenia reguł, bez kopii chronionych tekstów (ESC zastrzega prawa do ponownego wykorzystania).</p></div>'+
 '<div class="box"><h3>Leki – karty dawkowania (5.1)</h3><p>121 kart substancji (217 wskazań; 177 zgodnych z cytowanym źródłem, pozostałe „DO DECYZJI LEKARZA”). Źródła: ChPL z Rejestru Produktów Leczniczych (126 dokumentów, odnośnik przy każdym wskazaniu), EPAR/SmPC EMA (2) oraz wytyczne z odczytaną sekcją:</p><ul><li>'+a('https://doi.org/10.1093/eurheartj/ehae176','ESC AF 2024')+'</li><li>'+a('https://doi.org/10.1093/eurheartj/ehad191','ESC ACS 2023')+'</li><li>'+a('https://www.esge.com/assets/downloads/pdfs/guidelines/2021_a_1369_5274.pdf','ESGE NVUGIH 2021')+'</li><li>'+a('https://cms.aesnet.org/docs/default-source/press-releases-assets/cse-treatment-chart-final_rerelease.pdf','AES 2016 – stan padaczkowy')+'</li><li>'+a('https://idmp.ucsf.edu/adult-antimicrobial-dosing-non-dialysis','UCSF IDMP – dawkowanie antybiotyków')+'</li><li>'+a('https://www.ginasthma.org/wp-content/uploads/2024/05/GINA-2024-Strategy-Report-24_05_22_WMS.pdf','GINA 2024')+'</li><li>'+a('https://goldcopd.org/wp-content/uploads/2024/11/GOLD-2025-Report-v1.0-15Nov2024_WMV.pdf','GOLD 2025')+'</li><li>'+a('https://doi.org/10.1186/s13054-023-04327-7','European trauma bleeding guideline 2023')+'</li><li>'+a('https://abcd.care/sites/default/files/site_uploads/JBDS_Guidelines_Current/JBDS_02_DKA_Guideline_with_QR_code_March_2023.pdf','JBDS-IP DKA 2023')+'</li></ul><p class="mut">Katalog produktów: RPL – eksport CSV, stan 24.10.2026 (20 295 produktów ludzkich). Karty nie są walidacją kliniczną.</p></div>'+
 '<div class="box"><h3>Fotografie grzybów (Wikimedia Commons)</h3><ul>'+Z.credits.map(function(c){return '<li>'+esc(c.file)+' – '+esc(c.author)+', '+a(c.licenseUrl,c.license)+' – '+a(c.source,'plik źródłowy')+'</li>';}).join('')+'</ul></div>'+
 '<div class="box"><h3>Kontakty toksykologiczne</h3><p>Numery ośrodków toksykologicznych i Pracowni Toksykologicznej SU w Krakowie sprawdzono na stronach oficjalnych 23.10.2026 (moduł Zatrucia). Numery lokalne (apteka szpitalna, PSSE, ośrodek transplantacji) – „NUMER DO UZUPEŁNIENIA” w „Konfiguracji lokalnej”.</p></div>'+
 '<div class="box"><h3>Zasoby użytkownika (Dysk Google)</h3><p>Herold Innere Medizin 2026; Standard SOR pompy/wstrząs; Algorytmy SOR – materiały lokalne, nie dołączane do aplikacji (katalog 24.10.2026).</p></div>';}
function render(el){
 el.innerHTML='<h2>O programie</h2><div class="tabs ab-tabs">'+TABS.map(function(t){return '<button data-ab="'+t[0]+'"'+(state.tab===t[0]?' class="on"':'')+'>'+esc(t[1])+'</button>';}).join('')+'</div><div class="row"><button class="tg" id="abPrint">🖨 Drukuj tę zakładkę</button></div><div id="abBody"></div>';
 el.querySelector('.ab-tabs').onclick=function(e){var b=e.target.closest('button[data-ab]');if(!b)return;state.tab=b.dataset.ab;render(el);};
 el.querySelector('#abPrint').onclick=function(){print(state.tab);};
 var body=el.querySelector('#abBody');
 if(state.tab==='info'){body.innerHTML=infoHtml();return;}
 if(state.tab==='local'){body.innerHTML=localHtml();bindLocal(body);return;}
 body.innerHTML='<div class="box">Wczytywanie danych źródeł…</div>';
 ensure().then(function(Z){if(!body.isConnected)return;
  if(state.tab==='src'){body.innerHTML=srcHtml(Z);var r=body.querySelector('#abRes');r.innerHTML=searchRes(Z);
   body.querySelector('#abMod').onchange=function(){state.mod=this.value;render(el);};
   body.querySelector('#abQ').oninput=function(){state.q=this.value;r.innerHTML=searchRes(Z);};
   body.querySelector('#abKind').onchange=function(){state.kind=this.value;r.innerHTML=searchRes(Z);};}
  else if(state.tab==='todo'){body.innerHTML=todoHtml(Z);
   body.querySelector('#abTodoMod').onchange=function(){state.todoMod=this.value;render(el);};
   var tq=body.querySelector('#abTodoQ');tq.onchange=function(){state.todoQ=this.value;render(el);};
   body.onclick=function(e){var b=e.target.closest('[data-goto-local]');if(b){state.tab='local';render(el);var i=el.querySelector('[data-local="'+b.dataset.gotoLocal+'"]');if(i)i.focus();}};}
  else if(state.tab==='chpl')body.innerHTML=chplHtml(Z);
  else if(state.tab==='data')body.innerHTML=dataHtml(Z);
 }).catch(function(e){body.innerHTML='<div class="box red">'+esc(e.message)+'</div>';});}
function bindLocal(body){body.querySelectorAll('input[data-local]').forEach(function(i){i.onchange=function(){var k=i.dataset.local,st=body.querySelector('[data-lst="'+k+'"]');
  try{lset(k,i.value);i.classList.remove('bad');var o=lget();st.innerHTML=o[k]?'uzupełniono '+esc(fmtTs(o[k].ts)):'<span class="dw">NIE UZUPEŁNIONO</span>';}
  catch(e){i.classList.add('bad');st.innerHTML='<span class="r">'+esc(e.message)+'</span>';}};});}
function print(tab){var go=function(){var h='';var Z=root.SOR_ZRODLA;
  if(tab==='info')h=infoHtml();else if(tab==='src')h=srcHtml(Z).replace(/<select[\s\S]*?<\/select>|<input[^>]*>/g,'');else if(tab==='todo')h=todoHtml(Z).replace(/<select[\s\S]*?<\/select>|<input[^>]*>|<button[^>]*>[^<]*<\/button>/g,'');else if(tab==='local')h=localReportHtml(null)||'<p>Konfiguracja lokalna nie została uzupełniona.</p>';else if(tab==='chpl')h=chplHtml(Z);else h=dataHtml(Z);
  var p=document.getElementById('printArea');if(!p){p=document.createElement('div');p.id='printArea';document.body.appendChild(p);}
  p.innerHTML='<h1>Asystent lekarza SOR '+VERSION+' – '+esc((TABS.filter(function(t){return t[0]===tab;})[0]||['',''])[1])+'</h1><div class="sub">Wydruk informacyjny · narzędzie pomocnicze – niecertyfikowane</div>'+h;root.print();};
 if(tab==='info'||tab==='local')go();else ensure().then(go);}
function openFor(id){state.tab='src';state.mod=id&&id!=='about'&&id!=='dashboard'?id:'';if(root.SKS&&SKS.show)SKS.show('about');}
root.SORSources={ensure:ensure,footerHtml:footerHtml,todoItems:todoItems,VERSION:VERSION};
root.SORAbout={render:render,print:print,openFor:openFor,state:state,VERSION:VERSION};
if(root.SKM&&SKM.list){var ab=SKM.list.filter(function(m){return m.id==='about';})[0];if(ab){ab.render=render;ab.name='O programie';}
 var set=SKM.list.filter(function(m){return m.id==='settings';})[0];if(set){var orig=set.render;set.render=function(el,X){orig(el,X);var d=document.createElement('div');d.className='box';d.innerHTML='<b>Informacje, źródła danych, konfiguracja lokalna</b><div class="row"><button class="tg" id="setAbout">ℹ️ O programie</button> <button class="tg" id="setLocal">🏥 Konfiguracja lokalna</button> <button class="tg" id="setTodo">📋 Do uzupełnienia</button></div>';el.appendChild(d);
  d.querySelector('#setAbout').onclick=function(){state.tab='info';SKS.show('about');};d.querySelector('#setLocal').onclick=function(){state.tab='local';SKS.show('about');};d.querySelector('#setTodo').onclick=function(){state.tab='todo';SKS.show('about');};};}
 var dash=SKM.list.filter(function(m){return m.id==='dashboard';})[0];if(dash){var od=dash.render;dash.render=function(el,X){od.apply(this,arguments);var d=document.createElement('div');d.className='notice ab-dash';d.innerHTML='Wersja '+VERSION+' (test kliniczny) · <a href="#" data-ab-go="info">O programie</a> · <a href="#" data-ab-go="src">Źródła danych</a> · <a href="#" data-ab-go="todo">Do uzupełnienia / zweryfikowania</a> · <a href="#" data-ab-go="local">Konfiguracja lokalna</a>';el.appendChild(d);d.onclick=function(e){var t=e.target.closest('[data-ab-go]');if(t){e.preventDefault();state.tab=t.dataset.abGo;SKS.show('about');}};};}}
if(typeof document!=='undefined'&&typeof setTimeout==='function'){setTimeout(function(){ensure().catch(function(){});},4000);}
if(typeof document!=='undefined'){var sb=document.getElementById('srcMod');if(sb)sb.onclick=function(){var cur=root.SKS&&SKS.active?SKS.active():null;openFor(cur&&cur.id);};}
})(typeof window!=='undefined'?window:this);
