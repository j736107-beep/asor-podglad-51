// ETAP B2 – skale otępienia z punktacją pozycji: AMTS (10), MoCA (30), MMSE (30), CDR (6 domen + algorytm globalny wg Morrisa 1993).
// Pozycje: własne, skrócone sformułowania poleceń (nie jest to oryginalny formularz). MMSE (© PAR) i MoCA (© MoCA Clinic & Institute) –
// użycie kliniczne wymaga licencji/szkolenia wg właściciela praw: DO DECYZJI LEKARZA. CDR® – znak Washington University.
(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.dementiaB2=m;}})(this,function(){
var DEC='DO DECYZJI LEKARZA';
function nz(x){return typeof x==='number'&&isFinite(x);}
var SRC={amts:'Hodkinson HM. Evaluation of a mental test score for assessment of mental impairment in the elderly. Age Ageing 1972;1:233–238',
 moca:'Nasreddine ZS i wsp. The Montreal Cognitive Assessment, MoCA. J Am Geriatr Soc 2005;53:695–699 (licencja: mocacognition.com)',
 mmse:'Folstein MF, Folstein SE, McHugh PR. „Mini-Mental State”. J Psychiatr Res 1975;12:189–198 (© PAR)',
 cdr:'Morris JC. The Clinical Dementia Rating (CDR): current version and scoring rules. Neurology 1993;43:2412–2414; Knight ADRC (WashU) „Assignment of CDR rating”',
 fourat:'Bellelli G i wsp. 4AT. Age Ageing 2014;43:496–502; Tieges Z i wsp. Age Ageing 2021'};
// ---- AMTS ----
var AMTS=[
 ['a1','Wiek pacjenta','[Zapytaj: „Ile ma Pan/Pani lat?”]'],
 ['a2','Godzina (z dokładnością do 1 h)','[Zapytaj o przybliżoną godzinę – nie pokazuj zegarka; błąd do 1 h dopuszczalny]'],
 ['a3','Adres do zapamiętania – powtórzony na końcu testu','[Na początku podaj adres typu „ul. Kwiatowa 42” i poproś o powtórzenie; zapytaj ponownie na końcu testu]'],
 ['a4','Rok','[„Jaki jest teraz rok?”]'],
 ['a5','Nazwa miejsca (szpital / oddział / miasto)','[„Jak nazywa się to miejsce?”]'],
 ['a6','Rozpoznanie dwóch osób (np. lekarz, pielęgniarka)','[Wskaż 2 osoby i zapytaj o ich funkcje; oba rozpoznania poprawne = 1 pkt]'],
 ['a7','Data urodzenia','[„Kiedy się Pan/Pani urodził(a)?” – dzień, miesiąc, rok]'],
 ['a8','Rok ważnego wydarzenia historycznego','[Oryginał: początek I wojny światowej (1914); lokalnie stosuje się inne wydarzenie – wybór wydarzenia: '+DEC+']'],
 ['a9','Nazwisko obecnego prezydenta / premiera','[„Kto jest teraz prezydentem / premierem?”]'],
 ['a10','Liczenie wstecz od 20 do 1','[„Proszę liczyć od 20 do 1 wstecz” – bezbłędnie = 1 pkt]']];
function amts(v){v=v||{};var n=0,known=0;AMTS.forEach(function(it){if(v[it[0]]===true){n++;known++;}else if(v[it[0]]===false)known++;});
 if(!known)return null;var abn=n<=6;return{score:n,known:known,complete:known===AMTS.length,abn:abn,lvl:abn?'orange':'ok',txt:abn?'nieprawidłowy (≤6) – wskazana dalsza ocena (majaczenie / otępienie)':'prawidłowy (≥7)',note:'Próg ≤6 wg przyjętej wersji aplikacji; w literaturze progi ≤6 lub <8 – '+DEC+'. Skrining ≠ rozpoznanie; przy ostrej zmianie stanu psychicznego oceń majaczenie (4AT).'};}
// ---- MoCA ----
var MOCA=[
 {g:'Funkcje wzrokowo-przestrzenne i wykonawcze (5 pkt)',items:[
  ['m_trail','Połączenie punktów na przemian cyfra–litera (1 pkt)','[Poproś o narysowanie linii 1→A→2→B→3→C…; bez przecięć = 1 pkt]'],
  ['m_cube','Przerysowanie sześcianu (1 pkt)','[Poproś o skopiowanie rysunku 3D; poprawna struktura = 1 pkt]'],
  ['m_cl1','Zegar – kontur (1 pkt)','[„Narysuj zegar z godziną 11:10” – okrągła tarcza]'],
  ['m_cl2','Zegar – cyfry (1 pkt)','[Wszystkie cyfry 1–12 we właściwej kolejności i miejscu]'],
  ['m_cl3','Zegar – wskazówki (1 pkt)','[Obie wskazówki poprawnie wskazują 11:10, godzinowa krótsza]']]},
 {g:'Nazywanie (3 pkt)',items:[
  ['m_n1','Nazwanie zwierzęcia 1 (lew) (1 pkt)','[Pokaż obrazek i poproś o nazwę]'],['m_n2','Nazwanie zwierzęcia 2 (nosorożec) (1 pkt)','[Pokaż obrazek]'],['m_n3','Nazwanie zwierzęcia 3 (wielbłąd) (1 pkt)','[Pokaż obrazek]']]},
 {g:'Uwaga (6 pkt)',items:[
  ['m_df','Powtórzenie cyfr w kolejności (1 pkt)','[Odczytaj 5 cyfr, 1 na sekundę; powtórzenie bezbłędne = 1 pkt]'],
  ['m_db','Powtórzenie cyfr wspak (1 pkt)','[Odczytaj 3 cyfry; powtórzenie w odwrotnej kolejności = 1 pkt]'],
  ['m_tap','Stukanie przy literze „A” w serii liter (1 pkt)','[Odczytaj serię liter; pacjent stuka przy każdym „A”; ≤1 błąd = 1 pkt]']],
  sel:{id:'m_s7',label:'Odejmowanie 7 od 100 – liczba poprawnych odejmowań (0–5): 4–5 → 3 pkt; 2–3 → 2 pkt; 1 → 1 pkt; 0 → 0 pkt',opts:5}},
 {g:'Język (3 pkt)',items:[
  ['m_r1','Powtórzenie zdania 1 (1 pkt)','[Dokładne powtórzenie zdania]'],['m_r2','Powtórzenie zdania 2 (1 pkt)','[Dokładne powtórzenie zdania]'],
  ['m_flu','Płynność słowna: ≥11 słów na jedną literę w 1 min (1 pkt)','[„Proszę wymienić jak najwięcej słów na literę F w ciągu minuty” – bez imion własnych]']]},
 {g:'Abstrakcja (2 pkt)',items:[['m_ab1','Podobieństwo – para 1 (1 pkt)','[„W czym są podobne: pociąg – rower?” – odpowiedź abstrakcyjna (środek transportu)]'],['m_ab2','Podobieństwo – para 2 (1 pkt)','[„Zegarek – linijka?” – przyrząd pomiarowy]']]},
 {g:'Odroczone przypominanie (5 pkt) – bez podpowiedzi',items:[
  ['m_w1','Słowo 1 przypomniane spontanicznie (1 pkt)','[Pięć słów podanych na początku; podpowiedzi nie dają punktów]'],['m_w2','Słowo 2 (1 pkt)',''],['m_w3','Słowo 3 (1 pkt)',''],['m_w4','Słowo 4 (1 pkt)',''],['m_w5','Słowo 5 (1 pkt)','']]},
 {g:'Orientacja (6 pkt)',items:[
  ['m_o1','Data (dzień miesiąca) (1 pkt)','[Dokładnie]'],['m_o2','Miesiąc (1 pkt)',''],['m_o3','Rok (1 pkt)',''],['m_o4','Dzień tygodnia (1 pkt)',''],['m_o5','Miejsce (nazwa placówki) (1 pkt)',''],['m_o6','Miejscowość (1 pkt)','']]}];
function mocaItemIds(){var a=[];MOCA.forEach(function(g){g.items.forEach(function(i){a.push(i[0]);});});return a;}
function serial7(n){n=+n;if(!(n>=0&&n<=5))return NaN;return n>=4?3:n>=2?2:n===1?1:0;}
function moca(v,eduLe12){v=v||{};var raw=0,known=0,total=0;var ids=mocaItemIds();ids.forEach(function(id){total++;if(v[id]===true){raw++;known++;}else if(v[id]===false)known++;});
 var s7=v.m_s7===''||v.m_s7==null?NaN:serial7(v.m_s7);total++;if(nz(s7)){raw+=s7;known++;}
 if(!known)return null;var edu=eduLe12===true&&raw<30,sc=raw+(edu?1:0);if(sc>30)sc=30;
 var complete=known===total&&(eduLe12===true||eduLe12===false);var abn=sc<26;
 return{raw:raw,score:sc,eduAdded:edu,known:known,total:total,complete:complete,abn:abn,lvl:abn?'orange':'ok',txt:abn?'poniżej normy (<26)':'w normie (≥26)',partial:!complete,
  note:'Jeśli pacjent miał ≤12 lat nauki, dodaj 1 punkt (jeśli wynik <30). Wynik przy niepełnej ocenie to „co najmniej” – nie traktuj nieocenionych pozycji jako prawidłowych.'};}
// ---- MMSE ----
var MMSE=[
 {g:'Orientacja w czasie (5 pkt)',items:[['s_t1','Rok (1 pkt)','[„Jaki jest rok?”]'],['s_t2','Pora roku (1 pkt)',''],['s_t3','Miesiąc (1 pkt)',''],['s_t4','Data (dzień miesiąca) (1 pkt)',''],['s_t5','Dzień tygodnia (1 pkt)','']]},
 {g:'Orientacja w miejscu (5 pkt)',items:[['s_p1','Państwo (1 pkt)','[„W jakim kraju jesteśmy?”]'],['s_p2','Województwo (1 pkt)',''],['s_p3','Miejscowość (1 pkt)',''],['s_p4','Placówka / szpital (1 pkt)',''],['s_p5','Oddział / piętro (1 pkt)','']]},
 {g:'Zapamiętywanie (3 pkt)',items:[['s_r1','Powtórzył słowo 1 (1 pkt)','[Podaj 3 niezwiązane słowa po 1 na sekundę; liczy się pierwsze powtórzenie]'],['s_r2','Powtórzył słowo 2 (1 pkt)',''],['s_r3','Powtórzył słowo 3 (1 pkt)','']]},
 {g:'Uwaga i liczenie (5 pkt)',sel:{id:'s_att',label:'Odejmowanie 7 od 100 (do 5 prób) LUB literowanie 5-literowego słowa wspak – liczba poprawnych (0–5). Wybierz jedną metodę (według lokalnego formularza – '+DEC+')',opts:5},items:[]},
 {g:'Przypominanie (3 pkt)',items:[['s_c1','Przypomniał słowo 1 (1 pkt)','[3 słowa z zapamiętywania]'],['s_c2','Przypomniał słowo 2 (1 pkt)',''],['s_c3','Przypomniał słowo 3 (1 pkt)','']]},
 {g:'Język i praksja (9 pkt)',items:[['s_n1','Nazwał przedmiot 1 (np. zegarek) (1 pkt)','[Pokaż przedmiot]'],['s_n2','Nazwał przedmiot 2 (np. ołówek) (1 pkt)',''],['s_rep','Powtórzył zdanie (1 pkt)','[Jedna próba]'],
  ['s_k1','Polecenie 3-etapowe – etap 1 (1 pkt)','[„Weź kartkę prawą ręką…”]'],['s_k2','Polecenie 3-etapowe – etap 2 (1 pkt)','[„…złóż ją na pół…”]'],['s_k3','Polecenie 3-etapowe – etap 3 (1 pkt)','[„…i połóż na podłodze/stole”]'],
  ['s_read','Przeczytał i wykonał polecenie pisemne (1 pkt)','[Karta z napisem „ZAMKNIJ OCZY”]'],['s_wr','Napisał zdanie (1 pkt)','[Samodzielne zdanie z podmiotem i orzeczeniem]'],['s_cp','Przerysował dwa przecinające się pięciokąty (1 pkt)','[Wszystkie 10 kątów i przecięcie tworzące czworokąt]']]}];
function mmseItemIds(){var a=[];MMSE.forEach(function(g){g.items.forEach(function(i){a.push(i[0]);});});return a;}
function mmse(v){v=v||{};var raw=0,known=0,total=0;mmseItemIds().forEach(function(id){total++;if(v[id]===true){raw++;known++;}else if(v[id]===false)known++;});
 total++;var a=v.s_att===''||v.s_att==null?NaN:+v.s_att;if(nz(a)&&a>=0&&a<=5){raw+=a;known++;}
 if(!known)return null;var complete=known===total;var cat=raw>=24?'w normie (24–30)':raw>=18?'łagodne zaburzenia (18–23)':'umiarkowane/ciężkie (0–17)';
 return{score:raw,known:known,total:total,complete:complete,cat:cat,lvl:raw>=24?'ok':'orange',partial:!complete,note:'Progi MMSE zależą od wieku i wykształcenia (poprawki) – '+DEC+'. Wynik niepełny = „co najmniej”. MMSE jest chroniony prawem autorskim (PAR).'};}
// ---- CDR ----
var CDR_DOM=[['M','Pamięć',[0,0.5,1,2,3]],['O','Orientacja',[0,0.5,1,2,3]],['J','Ocena sytuacji i rozwiązywanie problemów',[0,0.5,1,2,3]],['C','Sprawy społeczne',[0,0.5,1,2,3]],['H','Dom i zainteresowania',[0,0.5,1,2,3]],['P','Dbałość o siebie',[0,1,2,3]]];
var CDR_LAB={'0':'brak (0)','0.5':'wątpliwe (0,5)','1':'łagodne (1)','2':'umiarkowane (2)','3':'ciężkie (3)'};
var CDR_DESC={
 M:{'0':'bez utraty pamięci lub nieznaczne okresowe zapominanie','0.5':'stałe, niewielkie zapominanie, częściowe przypominanie zdarzeń („łagodne zapominanie”)','1':'umiarkowana utrata pamięci, bardziej nasilona dla niedawnych zdarzeń, wpływa na codzienne czynności','2':'ciężka utrata pamięci – zachowany tylko dobrze utrwalony materiał, nowy szybko ginie','3':'ciężka utrata pamięci – zachowane tylko fragmenty'},
 O:{'0':'w pełni zorientowany','0.5':'w pełni zorientowany, z niewielką trudnością w relacjach czasowych','1':'umiarkowana trudność w relacjach czasowych; zorientowany w miejscu badania, możliwa dezorientacja geograficzna gdzie indziej','2':'zwykle zdezorientowany w czasie, często także w miejscu','3':'orientacja tylko co do osoby'},
 J:{'0':'dobrze rozwiązuje codzienne problemy; sprawny osąd','0.5':'niewielkie upośledzenie w rozwiązywaniu problemów i podobieństw/różnic','1':'umiarkowana trudność w problemach, osąd społeczny zwykle zachowany','2':'ciężka trudność w problemach; osąd społeczny zwykle upośledzony','3':'niezdolny do osądu i rozwiązywania problemów'},
 C:{'0':'samodzielne funkcjonowanie w pracy, zakupach, grupach społecznych','0.5':'niewielkie upośledzenie w tych czynnościach','1':'nie funkcjonuje samodzielnie poza domem, ale wygląda na zdolnego do udziału w życiu społecznym przy wsparciu','2':'brak pretensji do samodzielnego funkcjonowania poza domem; wygląda na zbyt chorego do udziału','3':'jak wyżej – wyraźnie zbyt chory, aby uczestniczyć w życiu poza domem'},
 H:{'0':'dom, hobby i zainteresowania intelektualne zachowane','0.5':'życie domowe, hobby i zainteresowania nieznacznie upośledzone','1':'wyraźne upośledzenie czynności domowych; trudniejsze prace i hobby porzucone','2':'zachowane tylko proste czynności; ograniczone zainteresowania','3':'brak znaczących czynności w domu'},
 P:{'0':'w pełni samodzielny','1':'wymaga zachęty/przypominania','2':'wymaga pomocy w ubieraniu, higienie i dbaniu o rzeczy osobiste','3':'wymaga dużej pomocy; często nietrzymanie moczu/stolca'}};
function cdrGlobal(b){b=b||{};var keys=['M','O','J','C','H','P'];var miss=keys.filter(function(k){return !nz(b[k]);});if(miss.length)return{ok:false,missing:miss,msg:'Brak wyniku: oceń wszystkie 6 domen (M, O, J, C, H, P).'};
 var M=b.M,s=['O','J','C','H','P'].map(function(k){return b[k];});var c,rule;
 var valid=[0,0.5,1,2,3];for(var i=0;i<keys.length;i++){if(valid.indexOf(b[keys[i]])<0)return{ok:false,msg:'Nieprawidłowa wartość domeny '+keys[i]+'.'};}
 if(b.P===0.5)return{ok:false,msg:'Domena „Dbałość o siebie” nie ma wartości 0,5 (dozwolone 0, 1, 2, 3).'};
 if(M===0){var imp=s.filter(function(x){return x>=0.5;}).length;c=imp>=2?0.5:0;rule='M=0: CDR 0, chyba że ≥2 domeny drugorzędne ≥0,5 → 0,5.';}
 else if(M===0.5){var ge1=s.filter(function(x){return x>=1;}).length;c=ge1>=3?1:0.5;rule='M=0,5: CDR=1, jeśli ≥3 domeny drugorzędne ≥1; w przeciwnym razie 0,5 (nie może być 0).';}
 else{var same=s.filter(function(x){return x===M;}).length,hi=s.filter(function(x){return x>M;}),lo=s.filter(function(x){return x<M;});
  if(same>=3){c=M;rule='≥3 domeny drugorzędne równe pamięci → CDR=M.';}
  else{var side=null;if(hi.length>=3&&!(hi.length===3&&lo.length===2))side=hi;else if(lo.length>=3&&!(lo.length===3&&hi.length===2))side=lo;
   if(hi.length===3&&lo.length===2||lo.length===3&&hi.length===2){c=M;rule='3 domeny po jednej stronie M i 2 po drugiej → CDR=M.';}
   else if(side){var cnt={};side.forEach(function(x){cnt[x]=(cnt[x]||0)+1;});var best=null,bc=0,tie=false;Object.keys(cnt).forEach(function(k){var n=cnt[k];if(n>bc){bc=n;best=+k;tie=false;}else if(n===bc){tie=true;if(Math.abs(+k-M)<Math.abs(best-M))best=+k;}});c=best;rule='≥3 domeny drugorzędne po jednej stronie M → wynik większości na tej stronie'+(tie?'; remis → wartość najbliższa M (reguła nietypowa) – '+DEC:'')+'.';}
   else{c=M;rule='Nie więcej niż 2 domeny po każdej stronie M → CDR=M (reguła nietypowa 2).';}}
  if(M>=1&&c===0){c=0.5;rule+=' M≥1: CDR nie może być 0 → 0,5.';}}
 var lab={'0':'brak otępienia','0.5':'wątpliwe (bardzo łagodne)','1':'łagodne otępienie','2':'umiarkowane otępienie','3':'ciężkie otępienie'}[String(c)];
 return{ok:true,cdr:c,label:lab,rule:rule,sum:keys.reduce(function(a,k){return a+b[k];},0),lvl:c>=1?'orange':c===0.5?'orange':'ok',note:'Algorytm: Morris 1993 / Knight ADRC. Domeny oceniaj jako spadek względem zwykłego poziomu z powodu zaburzeń poznawczych (nie z powodu chorób somatycznych/depresji); wątpliwość między dwoma stopniami → wyższy.'};}
// ---- Wyjaśnienia ----
var ACUTE='Ostra zmiana / fluktuacje – wybierz „tak”, gdy potwierdzi to rodzina, opiekun lub dokumentacja: nagły początek w ciągu godzin–dni; nasilenie i ustępowanie w ciągu doby (np. splątanie, senność, pobudzenie) – wystarczy jedno z dwóch. Wolne, stałe pogarszanie przez miesiące to NIE jest ostra zmiana.';
return{SRC:SRC,AMTS:AMTS,amts:amts,MOCA:MOCA,moca:moca,serial7:serial7,mocaItemIds:mocaItemIds,MMSE:MMSE,mmse:mmse,mmseItemIds:mmseItemIds,CDR_DOM:CDR_DOM,CDR_LAB:CDR_LAB,CDR_DESC:CDR_DESC,cdrGlobal:cdrGlobal,ACUTE:ACUTE,DEC:DEC};});
