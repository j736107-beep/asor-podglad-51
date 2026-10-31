(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.neuro=m;}})(this,function(){
function nz(x){return typeof x==='number'&&isFinite(x);}
var SRC=['AHA/ASA 2019 – Guidelines for Early Management of Acute Ischemic Stroke (Powers, Stroke 2019)','AHA/ASA 2026 – Guideline for the Early Management of Patients With Acute Ischemic Stroke','ESO 2021 – trombolityczne leczenie udaru (Berge, Eur Stroke J 2021)','ESO 2023 – tenekteplaza w udarze (Alamowitch, Eur Stroke J 2023)','AHA/ASA 2022 – krwotok śródmózgowy (Greenberg, Stroke 2022)','ESO 2025 – krwotok śródmózgowy / ESO 2014–2021','ChPL Actilyse (alteplaza) · ChPL Metalyse (tenekteplaza)','AHA/ASA 2023 – SAH (Hoh)','Ottawa SAH Rule – Perry, JAMA 2013','ESO 2017 / EAN – CVT (Ferro)','ESO 2019 – trombektomia (Turc); ESO 2023 – LVO','PTN 2019 – wytyczne postępowania w udarze mózgu','HINTS – Kattah 2009','RACE – Pérez de la Ossa 2014 · FAST-ED – Lima 2016',
 'NIHSS – Brott 1989 / NINDS','ICH score – Hemphill, Stroke 2001','ABCD² – Johnston, Lancet 2007','mRS – van Swieten 1988','GCS – Teasdale & Jennett 1974','AMTS – Hodkinson 1972','Mini-Cog – Borson 2000','MoCA – Nasreddine 2005','CDR – Morris 1993','4AT – Bellelli 2014 / Tieges 2021','MMSE – Folstein 1975 (© PAR – tylko wpis wyniku)'];
// ---------- NIHSS: [id, nazwa, [punkty-opis...]] ----------
var NIH=[['1a','1a Przytomność',['czujny','senny (budzi się na lekki bodziec)','stupor (silny/powtarzany bodziec)','śpiączka / tylko odruchy']],
 ['1b','1b Pytania (miesiąc, wiek)',['obie poprawne','jedna poprawna','żadna']],
 ['1c','1c Polecenia (oczy, ręka)',['oba wykonane','jedno','żadne']],
 ['2','2 Spojrzenie',['prawidłowe','częściowe porażenie','zwrot wymuszony']],
 ['3','3 Pole widzenia',['bez ubytków','częściowe niedowidzenie','całkowite niedowidzenie połowicze','obustronne / ślepota']],
 ['4','4 Porażenie twarzy',['brak','niewielkie','częściowe (dolna twarz)','całkowite']],
 ['5a','5a Ruch – ręka L',['bez opadania 10 s','opada przed 10 s','pewien wysiłek przeciw grawitacji','brak wysiłku przeciw grawitacji','brak ruchu']],
 ['5b','5b Ruch – ręka P',['bez opadania 10 s','opada przed 10 s','pewien wysiłek przeciw grawitacji','brak wysiłku przeciw grawitacji','brak ruchu']],
 ['6a','6a Ruch – noga L',['bez opadania 5 s','opada przed 5 s','pewien wysiłek przeciw grawitacji','brak wysiłku przeciw grawitacji','brak ruchu']],
 ['6b','6b Ruch – noga P',['bez opadania 5 s','opada przed 5 s','pewien wysiłek przeciw grawitacji','brak wysiłku przeciw grawitacji','brak ruchu']],
 ['7','7 Ataksja kończyn',['brak','w 1 kończynie','w 2 kończynach']],
 ['8','8 Czucie',['prawidłowe','łagodne/umiarkowane zaburzenie','ciężkie / całkowite']],
 ['9','9 Mowa (afazja)',['bez afazji','łagodna/umiarkowana','ciężka','globalna / mutyzm']],
 ['10','10 Dyzartria',['prawidłowa','łagodna/umiarkowana','ciężka / anartria']],
 ['11','11 Zaniedbywanie',['brak','w 1 modalności','w >1 modalności / głębokie']]];
// v: obiekt id->punkty; pozycja 'UN' (nie do oceny, np. amputacja) = 0 pkt
function nihss(v){var s=0,n=0;NIH.forEach(function(it){var x=v[it[0]];if(x==='UN'||x===''||x==null)return;x=+x;if(!nz(x))return;x=Math.max(0,Math.min(it[2].length-1,Math.round(x)));s+=x;n++;});
 var sev=s===0?'brak objawów':s<=4?'udar łagodny':s<=15?'udar umiarkowany':s<=20?'udar umiarkowanie ciężki':'udar ciężki';
 return{score:s,done:n,sev:sev,lvl:s>=5?'orange':'ok'};}
// ---------- tromboliza ----------
function alteplase(w){if(!(w>0))return null;var dw=Math.min(w,100),tot=Math.round(dw*0.9*10)/10,bol=Math.round(tot*0.1*10)/10,inf=Math.round((tot-bol)*10)/10;
 return{tot:tot,bol:bol,inf:inf,mlh:inf,capped:w>100,conc:1};} // 1 mg/ml → ml = mg; wlew 60 min → ml/h = mg reszty
// Metalyse w ostrym udarze (EPAR/ChPL, p. 4.2): DAWKA WG PRZEDZIAŁÓW MASY, nie 0,25 mg/kg: <60 kg 15 mg; 60–<70 17,5; 70–<80 20; 80–<90 22,5; ≥90 kg 25 mg (5 mg/ml → 3,0–5,0 ml).
// ChPL: przy masie ≤50 kg dokładna ocena korzyści/ryzyka; ostrożność >80 lat. Wytyczne AHA/ESO podają 0,25 mg/kg (maks. 25 mg) – różnica do ~2,5 mg (masa 50–59 kg: 12,5–14,75 vs 15 mg).
function tenecteplase(w){if(!(w>0))return null;var mg=w<60?15:w<70?17.5:w<80?20:w<90?22.5:25;var gl=Math.round(Math.min(w*0.25,25)*10)/10;
 return{mg:mg,ml:Math.round(mg/5*10)/10,capped:w>=90,band:(w<60?'<60':w<70?'60–<70':w<80?'70–<80':w<90?'80–<90':'≥90')+' kg',lowWeight:w<=50,conc:5,guideline025:gl,diff:Math.round((mg-gl)*10)/10};}
// okno czasowe: h od ostatniego widzenia zdrowego
function window_(h,wake,mm){if(wake)return mm?{lvl:'orange',txt:'Wake-up / nieznany czas – tylko przy niedopasowaniu DWI-FLAIR (lub perfuzji) – ESO 2021 / AHA'}:{lvl:'red',txt:'Wake-up bez niedopasowania DWI-FLAIR/perfuzji – brak wskazań'};
 if(!nz(h))return{lvl:'',txt:'Podaj czas od zachorowania'};if(h<0)return{lvl:'red',txt:'Nieprawidłowy czas'};
 if(h<=4.5)return{lvl:'ok',txt:'≤4,5 h – okno trombolizy'};if(h<=9&&mm)return{lvl:'orange',txt:'4,5–9 h z niedopasowaniem perfuzji (ESO 2021, EXTEND) – decyzja neurologa'};
 return{lvl:'red',txt:'>4,5 h – poza standardowym oknem'};}
var CI_ABS=[['ich','krwawienie śródczaszkowe w TK'],['hypo','rozległa hipodensja w TK (> 1/3 MCA)'],['sah','podejrzenie SAH'],['tbi','ciężki uraz głowy / udar niedokrwienny <3 mies.'],['neuro','operacja wewnątrzczaszkowa/rdzenia <3 mies.'],['gi','krwawienie z p.pok. <21 dni / aktywne krwawienie'],
 ['coag','PLT <100 tys., INR >1,7 (ChPL Actilyse u VKA: >1,3), APTT >40 s'],['lmwh','pełna dawka HDCz <24 h'],['doac','NOAC <48 h (bez prawidłowych testów)'],['endo','infekcyjne zapalenie wsierdzia'],['aorta','rozwarstwienie aorty'],['tumor','nowotwór wewnątrzosiowy OUN']];
var CI_REL=[['surg','duża operacja / uraz <14 dni'],['preg','ciąża / połóg'],['seiz','napad padaczkowy na początku'],['mi','zawał <3 mies.'],['art','nakłucie tętnicy niezaciskalnej <7 dni'],['bleed','przebyte krwawienie śródczaszkowe']];
function ci(v){var a=CI_ABS.filter(function(c){return v[c[0]]}).map(function(c){return c[1]}),r=CI_REL.filter(function(c){return v[c[0]]}).map(function(c){return c[1]});return{abs:a,rel:r,lvl:a.length?'red':r.length?'orange':'ok'};}
// ciśnienie: phase 'pre' <185/110, 'post' <180/105 (24 h)
function bp(sbp,dbp,phase){var L=phase==='post'?[180,105]:[185,110];if(!nz(sbp)&&!nz(dbp))return{lvl:'',lim:L};var hi=(nz(sbp)&&sbp>=L[0])||(nz(dbp)&&dbp>=L[1]);return{lvl:hi?'red':'ok',lim:L,hi:hi};}
// glikemia mg/dl: <50 → korekta przed (mimik), >400 ostrożnie
function glu(mg){if(!nz(mg))return{lvl:''};if(mg<50)return{lvl:'red',txt:'Hipoglikemia <50 mg/dl (2,8 mmol/l) – wyrównaj i oceń ponownie (mimik udaru)'};if(mg>400)return{lvl:'orange',txt:'Glikemia >400 mg/dl (22,2 mmol/l) – ostrożnie (ChPL: przeciwwskazanie Actilyse)'};if(mg>180)return{lvl:'orange',txt:'>180 mg/dl (10 mmol/l) – celuj 140–180 mg/dl (7,8–10 mmol/l)'};return{lvl:'ok',txt:'Glikemia w normie dla trombolizy'};}
// ---------- ICH score ----------
var ICH_MORT=[0,13,26,72,97,100,100];
function ichScore(i){var s=0;if(nz(i.gcs)){s+=i.gcs<=4?2:i.gcs<=12?1:0;}if(i.vol>=30)s++;if(i.ivh)s++;if(i.infra)s++;if(nz(i.age)&&i.age>=80)s++;return{score:s,mort:ICH_MORT[s],lvl:s>=3?'orange':'ok'};}
function abc2(a,b,c){if(!(a>0&&b>0&&c>0&&a<=25&&b<=25&&c<=25))return NaN;return a*b*c/2;} // cm → ml
function ichBP(sbp){if(!nz(sbp))return{lvl:''};if(sbp>220)return{lvl:'red',txt:'SBP >220 – pilnie obniżaj (wlew), cel 140'};if(sbp>150)return{lvl:'orange',txt:'SBP 150–220 → obniż do ~140 mmHg (AHA 2022: 140; unikaj <130)'};if(sbp<130)return{lvl:'orange',txt:'SBP <130 – unikaj dalszego obniżania (AHA 2022: potencjalnie szkodliwe)'};return{lvl:'ok',txt:'SBP w celu (130–150)'};}
// ---------- triage ----------
var MRS=['0 – bez objawów','1 – bez istotnej niesprawności','2 – lekka niesprawność, samodzielny','3 – umiarkowana, chodzi sam, potrzebuje pomocy','4 – średnio ciężka, nie chodzi sam','5 – ciężka, leżący, stała opieka','6 – zgon'];
function abcd2(i){var s=0;if(nz(i.age)&&i.age>=60)s++;if((nz(i.sbp)&&i.sbp>=140)||(nz(i.dbp)&&i.dbp>=90))s++;s+=i.clin==='w'?2:i.clin==='s'?1:0;s+=nz(i.dur)?(i.dur>=60?2:i.dur>=10?1:0):0;if(i.dm)s++;
 return{score:s,risk:s<=3?'niskie (2 dni ~1%)':s<=5?'umiarkowane (2 dni ~4%)':'wysokie (2 dni ~8%)',lvl:s>=4?'orange':'ok'};}
function gcs(e,v,m){if(!(nz(e)&&nz(v)&&nz(m)))return null;var s=e+v+m;return{score:s,lvl:s<=8?'red':s<=12?'orange':'ok',txt:s<=8?'ciężkie (≤8) – zabezpiecz drogi oddechowe':s<=12?'umiarkowane (9–12)':'łagodne (13–15)'};}
// ---------- funkcje poznawcze ----------
function amts(n){if(!nz(n))return null;n=Math.max(0,Math.min(10,Math.round(n)));return{score:n,abn:n<=6,lvl:n<=6?'orange':'ok'};}
function minicog(rec,clock){if(!nz(rec))return null;rec=Math.max(0,Math.min(3,rec));var c=clock?2:0,s=rec+c;return{score:s,pos:s<3,lvl:s<3?'orange':'ok'};}
function moca(raw,eduLe12){if(!nz(raw))return null;raw=Math.max(0,Math.min(30,Math.round(raw)));var s=Math.min(30,raw+(eduLe12?1:0));return{raw:raw,score:s,abn:s<26,lvl:s<26?'orange':'ok'};}
var CDR=[['0','0 – brak otępienia'],['0.5','0,5 – wątpliwe / bardzo łagodne'],['1','1 – łagodne'],['2','2 – umiarkowane'],['3','3 – ciężkie']];
function fourAT(i){var s=(i.alert?4:0)+Math.max(0,Math.min(2,i.amt4|0))+Math.max(0,Math.min(2,i.att|0))+(i.acute?4:0);
 return{score:s,lvl:s>=1?'orange':'ok',txt:s>=4?'możliwe majaczenie ± zaburzenia poznawcze':s>=1?'możliwe zaburzenia poznawcze':'majaczenie / ciężkie zab. poznawcze mało prawdopodobne'};}
function mmse(n){if(!nz(n))return null;n=Math.max(0,Math.min(30,Math.round(n)));return{score:n,cat:n>=24?'w normie (24–30)':n>=18?'łagodne zaburzenia (18–23)':'umiarkowane/ciężkie (0–17)',lvl:n>=24?'ok':'orange'};}

// ---------- ALGORYTM: podejrzenie udaru na SOR ----------
var S_A='AHA/ASA 2019',S_A26='AHA/ASA 2026 DO WERYFIKACJI',S_E='ESO 2021/2023',S_PTN='PTN 2019';
function ottawa(i){var c=[];if(nz(i.age)&&i.age>=40)c.push('wiek ≥40');if(i.neck)c.push('ból/sztywność karku');if(i.loc)c.push('utrata przytomności');if(i.ex)c.push('początek przy wysiłku');if(i.inst)c.push('ból piorunujący');if(i.flex)c.push('ogr. zgięcia karku');return{pos:c.length>0,crit:c};}
// i: h, wake, unk, s{foc,aph,neg,gaze,vf,post,loc,head,hdp,seiz,neck}, o{ex,inst,flex}, cvt{young,oc,thr,pap,inf}, tu{prog,ca,morn,hern}, ac (''|vka|dabi|xa|lmwh), acH, gluMg, sbp, dbp, nihss, race, hints (''|central|peripheral), mimic(bool), sex, age
function stroke(i){var s=i.s||{},o=i.o||{},c=i.cvt||{},tu=i.tu||{},R=[],add=function(l,t,d,src){R.push({lvl:l,t:t,d:d,s:src})};
 var unk=!!(i.wake||i.unk)||!nz(i.h),h=i.h;
 var deficit=!!(s.foc||s.aph||s.neg||s.gaze||s.vf||s.post),any=deficit||!!s.loc;
 var lvo=(nz(i.race)&&i.race>=5)||(nz(i.nihss)&&i.nihss>=6)||!!(s.gaze&&(s.aph||s.neg));
 var code=deficit&&(unk||h<=4.5||(h<=24&&lvo));
 var f={code:false,lvo:lvo,sah:false,cvt:false,tumor:false,post:false,late:false};
 if(code){f.code=true;var ctp=unk||h>6;
  add('red','KOD UDAROWY – teraz','NCCT + angio-TK głowy i szyi (łuk aorty → wierzchołek) natychmiast'+(ctp?'; perfuzja TK (CTP)'+(unk?' lub MR DWI/FLAIR, jeśli szybko dostępny (wake-up/nieznany czas)':' (6–24 h)'):'')+'. Nie czekaj na wyniki – poza glikemią. Neurolog natychmiast. Ścieżka tromboliza / trombektomia.',S_A+' · '+S_E+' · '+S_A26);
  if(lvo)add('red','Podejrzenie LVO','LAMS dodatni → ośrodek trombektomii (okno do 24 h) – zgłoś neuroradiologii interwencyjnej równolegle',S_E+' (trombektomia 2019/2023) · '+S_A);}
 else if(deficit&&h>24){f.late=true;add('orange','Udar >24 h, stabilny','NCCT + angio-TK; MR na oddziale następnego dnia; konsultacja neurologa po wynikach',S_A+' · '+S_PTN);}
 else if(deficit){add('orange','Udar 4,5–24 h, bez cech LVO','NCCT + angio-TK teraz (szukaj LVO); neurolog pilnie',S_A+' · '+S_E);}
 if(s.head){var ot=ottawa({age:i.age,neck:s.neck,loc:s.loc,ex:o.ex,inst:o.inst,flex:o.flex});
  if(ot.pos){f.sah=true;add('red','Podejrzenie SAH ('+ot.crit.join(', ')+')','NCCT teraz. Ujemne TK ≤6 h od początku (odczyt radiologa) → SAH wykluczony. >6 h ujemne → nakłucie lędźwiowe (≥12 h: ksantochromia) lub angio-TK. Krew w TK → angio-TK (tętniak), neurochirurg.','AHA/ASA SAH 2023 · Ottawa SAH Rule (Perry 2013)');}
  else add('ok','Ottawa SAH ujemna','SAH mało prawdopodobny (tylko przytomny ≥15 lat, bez deficytu, ból ≤1 h od szczytu)','Ottawa SAH Rule (Perry 2013)');}
 var cvtR=!!(c.oc||c.thr||c.pap||c.inf||c.young),cvtS=!!(s.head||s.hdp||s.seiz||c.pap||deficit);
 if(cvtR&&cvtS){f.cvt=true;add(s.loc?'red':'orange','Podejrzenie zakrzepicy zatok (CVT)','TK + angio-TK fazy żylnej (venografia) lub MR + MRV. D-dimer: prawidłowy nie wyklucza (izolowany ból głowy, objawy >1 tydz.)','ESO 2017 / EAN CVT · AHA 2024 CVT');}
 if(tu.prog||tu.ca||tu.morn||tu.hern){f.tumor=true;if(tu.hern)add('red','Objawy wgłobienia','NCCT natychmiast, neurochirurg; uniesienie wezgłowia 30°','AHA 2019 · '+S_PTN);
  else add('orange','Podejrzenie guza / proces podostry','NCCT teraz; MR z kontrastem planowo (oddział, nie w trybie pilnym)',S_PTN+' · EANO');}
 if(s.post){f.post=true;if(i.hints==='central')add('red','HINTS centralny','Traktuj jak udar tylnego krążenia: angio-TK; MR DWI pilnie przy ujemnym TK (TK mało czułe)','AHA 2019 · Kattah 2009 (HINTS)');
  else add('orange','Tylne krążenie','HINTS (tylko ostry ciągły zespół przedsionkowy z oczopląsem); niski próg angio-TK; MR DWI pilnie, jeśli TK ujemne a podejrzenie trwa'+(i.hints==='peripheral'?' · HINTS obwodowy (nie wyklucza przy deficycie)':''),'AHA 2019 · ESO 2021 · Kattah 2009');}
 if(i.ac){var noac=i.ac==='dabi'||i.ac==='xa';add('orange','Antykoagulacja: '+({vka:'VKA',dabi:'dabigatran',xa:'anty-Xa',lmwh:'HDCz'}[i.ac])+(nz(i.acH)?' (ost. dawka '+i.acH+' h)':''),
  (i.ac==='vka'?'INR stat; INR >1,7 → brak trombolizy':noac?'Stężenie '+(i.ac==='dabi'?'dabigatranu (dTT/ECT)':'anty-Xa (kalibrowane)')+'; '+(nz(i.acH)&&i.acH>=48?'≥48 h – tromboliza możliwa przy prawidłowych testach':'<48 h / nieznany – tromboliza przeciwwskazana (rozważ trombektomię; dabigatran: idarucyzumab wg decyzji)'):'Pełna dawka <24 h → brak trombolizy')+'. Przy krwawieniu → odwracanie (moduł Antykoagulacja)',S_A+' · ESO 2021');}
 if(nz(i.gluMg)){if(i.gluMg<50)add('red','Hipoglikemia','Glukoza i.v. teraz, oceń deficyt ponownie',S_A);else if(i.gluMg>400)add('orange','Hiperglikemia >400 mg/dl (22,2 mmol/l)','Wyrównaj; ChPL Actilyse – przeciwwskazanie',S_A+' · ChPL');}
 else if(any)add('orange','Glikemia','Oznacz glikemię z palca TERAZ – jedyny wynik wymagany przed trombolizą',S_A);
 if(nz(i.sbp)||nz(i.dbp)){if(code&&((i.sbp>=185)||(i.dbp>=110)))add('red','RR ≥185/110','Obniż <185/110 przed trombolizą (urapidil / labetalol)',S_A+' · '+S_E);
  else if(i.sbp>220||i.dbp>120)add('orange','RR >220/120','Bez trombolizy: obniż o ~15% w 24 h',S_A);
  else if(i.sbp<100)add('orange','Hipotensja','Unikaj hipotensji/hipowolemii – płyny izotoniczne',S_A);}
 if(any||f.sah||f.cvt||f.tumor){add('ok','Krew','Glukoza stat · morfologia, INR/APTT, elektrolity, kreatynina, troponina'+((f.sah||i.ac||tu.hern||code)?' · grupa krwi':'')+(i.ac==='dabi'||i.ac==='xa'?' · stężenie NOAC':'')+' – nie opóźniają obrazowania',S_A+' · '+S_PTN);
  add('ok','EKG','EKG 12-odpr. (AF, zawał) – nie opóźnia obrazowania; monitorowanie ≥24 h',S_A);
  if(i.sex==='f'&&nz(i.age)&&i.age>=12&&i.age<=50)add('orange','Test ciążowy','Kobieta w wieku rozrodczym – β-hCG (nie opóźnia obrazowania/trombolizy)',S_A+' · ChPL');
  add('ok','Na oddziale','Test połykania przed czymkolwiek doustnie (NPO); SpO₂ >94% (tlen tylko przy hipoksji); temp. <38 °C; wezgłowie płasko/≤30° (30° przy ↑ICP/aspiracji); unikaj hipotensji',S_A+' · '+S_PTN);}
 if(i.mimic)add('orange','Możliwy mimik','Nie wyklucza udaru – nie opóźniaj obrazowania; tromboliza u mimików ma niskie ryzyko',S_A);
 if(s.seiz&&deficit)add('orange','Napad na początku','Porażenie Todda vs udar – angio-TK/perfuzja rozstrzyga; wg ChPL Actilyse drgawki na początku udaru to przeciwwskazanie (Metalyse – tylko po wykluczeniu mimiku), wg AHA/ESO nie jest bezwzględne – DO DECYZJI LEKARZA',S_A);
 if(!R.length)add('','','Zaznacz objawy / czas.','');
 var lvl=R.some(function(r){return r.lvl==='red'})?'red':R.some(function(r){return r.lvl==='orange'})?'orange':'ok';return{list:R,lvl:lvl,f:f};}

// ---------- PESEL ----------
function pesel(x,now){x=String(x||'').replace(/\s/g,'');if(!/^\d{11}$/.test(x))return{ok:false,err:'PESEL musi mieć 11 cyfr'};var d=x.split('').map(Number),W=[1,3,7,9,1,3,7,9,1,3],sum=0;for(var k=0;k<10;k++)sum+=d[k]*W[k];
 if((10-sum%10)%10!==d[10])return{ok:false,err:'Błędna cyfra kontrolna PESEL'};var y=d[0]*10+d[1],m=d[2]*10+d[3],dd=d[4]*10+d[5],c=Math.floor(m/20),cent=[1900,2000,2100,2200,1800][c];m=m%20;y+=cent;
 var dt=new Date(y,m-1,dd);if(dt.getFullYear()!==y||dt.getMonth()!==m-1||dt.getDate()!==dd)return{ok:false,err:'Błędna data w PESEL'};
 now=now||new Date();var age=now.getFullYear()-y-((now.getMonth()<m-1||(now.getMonth()===m-1&&now.getDate()<dd))?1:0);
 return{ok:true,birth:y+'-'+('0'+m).slice(-2)+'-'+('0'+dd).slice(-2),age:age,sex:d[9]%2?'m':'f'};}
// ---------- RACE (Pérez de la Ossa 2014): face 0–2, arm 0–2, leg 0–2, gaze 0–1, aphasia (P niedowład) / agnozja (L niedowład) 0–2 ----------
var RACE_MAX={face:2,arm:2,leg:2,gaze:1,cort:2};
function race(v){var s=0,n=0;Object.keys(RACE_MAX).forEach(function(k){var x=v[k];if(x===''||x==null||!nz(+x))return;s+=Math.max(0,Math.min(RACE_MAX[k],Math.round(+x)));n++;});return{score:s,n:n,lvo:s>=5};}
// z NIHSS (konwersja wg Pérez de la Ossa 2014)
function raceFromNihss(v){var g=function(k){var x=v[k];return x==='UN'||x===''||x==null?0:+x||0};var arm=Math.max(g('5a'),g('5b')),leg=Math.max(g('6a'),g('6b'));
 var right=Math.max(g('5b'),g('6b'))>=Math.max(g('5a'),g('6a'));
 return{face:g('4')>=2?2:g('4')>=1?1:0,arm:arm>=3?2:arm>=2?1:0,leg:leg>=3?2:leg>=2?1:0,gaze:g('2')>=1?1:0,cort:right?(g('9')>=2?2:g('9')>=1?1:0):(g('11')>=2?2:g('11')>=1?1:0)};}
// podpowiedź z zaznaczonych objawów (ostrożna)
function raceFromSym(s){return{face:s.foc?1:'',arm:s.foc?1:'',leg:'',gaze:s.gaze?1:'',cort:(s.aph||s.neg)?2:''};}

return{pesel:pesel,race:race,RACE_MAX:RACE_MAX,raceFromNihss:raceFromNihss,raceFromSym:raceFromSym,ottawa:ottawa,stroke:stroke,SRC:SRC,NIH:NIH,nihss:nihss,alteplase:alteplase,tenecteplase:tenecteplase,window:window_,CI_ABS:CI_ABS,CI_REL:CI_REL,ci:ci,bp:bp,glu:glu,ichScore:ichScore,ICH_MORT:ICH_MORT,abc2:abc2,ichBP:ichBP,MRS:MRS,abcd2:abcd2,gcs:gcs,amts:amts,minicog:minicog,moca:moca,CDR:CDR,fourAT:fourAT,mmse:mmse};});
