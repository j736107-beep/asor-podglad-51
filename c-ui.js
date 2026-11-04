// ETAP C – warstwa UI: Neuroinfekcje, kardiowersja AF, zatrucie paracetamolem (NAC + nomogram), krwawienie z GI (endoskopia).
// Silnik: calc/etapC.js (testy Node: tests/etapC.cjs). Każda reguła ma źródło; czego nie zweryfikowano – „DO DECYZJI LEKARZA”.
(function(){
var C=SK.core,F=C.fmt,N=C.num,U=SKM.util,bx=U.bx,inp=U.inp,chk=U.chk,tabbed=U.tabbed,store=U.store,srcList=U.src;
var E=SK.etapC,DEC=E.DEC,UN=SK.units;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function rich(s){return esc(s).replace(/DO DECYZJI LEKARZA/g,'<span class="dw">DO DECYZJI LEKARZA</span>');}
function pn(s){return String(s).replace(/(\d)\.(\d)/g,'$1,$2');}
function nz(x){return typeof x==='number'&&isFinite(x);}
function ul(a){return a&&a.length?'<ul>'+a.map(function(x){return '<li>'+rich(x)+'</li>';}).join('')+'</ul>':'';}
function tbl(head,rows){return '<div class="b1tw"><table class="b1t"><thead><tr>'+head.map(function(x){return '<th>'+x+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr'+(r.cls?' class="'+r.cls+'"':'')+'>'+(r.cells||r).map(function(x){return '<td>'+x+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>';}
function srcl(a){a=[].concat(a);return '<details class="ccsrc"><summary>Źródła tej sekcji</summary><ul>'+a.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></details>';}
function nt(t){return '<div class="b2nt">'+rich(t)+'</div>';}
function tri(v){return v==='yes'?true:v==='no'?false:undefined;}
function go(id,t){return '<button type="button" class="tg" onclick="SKS.show(\''+id+'\')">→ '+t+'</button>';}
function opt(v,t){return '<option value="'+v+'">'+t+'</option>';}
function sel(id,label,opts){return '<label>'+label+' <select id="'+id+'">'+opts.map(function(o){return opt(o[0],o[1]);}).join('')+'</select></label>';}
function sysU(){return window.SKS&&SKS.S&&SKS.S.units==='si'?'si':'conv';}
function h3(t){return '<h4 class="b1h">'+t+'</h4>';}
(function(){var s=document.createElement('style');s.textContent='.cnom{width:100%;max-width:560px;height:auto;border:1px solid #ccd;border-radius:8px;background:#fff}.ccsrc{margin:6px 0;font-size:.85rem}.ccsrc summary{cursor:pointer;color:#55318f}.ccrl{font-size:1.15rem;font-weight:800}.ccsym{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:6px}.ccsym label{border:1px solid #d6cdea;border-radius:8px;padding:6px 8px;background:#fff;display:flex;gap:6px;align-items:flex-start;line-height:1.25}.ccsym input{min-width:22px;min-height:22px}.ccbanner{border:3px solid #c4001a;border-radius:10px;background:#fff7f8;padding:8px 12px;margin:6px 0}.ccbanner b{color:#7a0010}.ccpre{white-space:pre-wrap;font-family:inherit;border:1px solid #ccd;border-radius:8px;padding:8px;background:#fafafa}.cc3{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}.cc3>div{border:1px solid #d6cdea;border-radius:8px;padding:6px 8px;background:#fff}.cc3 .y{border:2px solid #c4001a;background:#fff4f5}.cc3 .n{border:2px solid #157a2b}';document.head.appendChild(s);})();
function htmlText(h){var t=String(h).replace(/<style[\s\S]*?<\/style>/g,'').replace(/<svg[\s\S]*?<\/svg>/g,'').replace(/<br\s*\/?>/g,'\n').replace(/<li[^>]*>/g,'\n• ').replace(/<(div|p|h\d|tr|table|ul|section|summary)[^>]*>/g,'\n').replace(/<\/(div|h\d|li|tr|p|ul|table|section|details|summary)>/g,'\n').replace(/<\/t[dh]>/g,' | ').replace(/<[^>]+>/g,'');var d=document.createElement('textarea');d.innerHTML=t;return d.value.replace(/[ \t]+/g,' ').replace(/ ?\n ?/g,'\n').replace(/\n{3,}/g,'\n\n').trim();}
// getter odtwarzający g() z zapisanych wartości (do migawki raportu, gdy zakładka nie jest otwarta)
function mkG(modId,tab){var v=store(modId+'_'+tab).get();return function(id){var x=v[id];var k=id.slice(0,2);if(k==='k_')return x===true;if(k==='o_')return x==null?'':String(x);if(x==null||x==='')return NaN;var n=N(String(x));return n;};}
// ============================================================ NEUROINFEKCJE ============================================================
var MID='neuroinf';
function symState(){var v=store(MID+'_s').get(),o={};E.SYMP.forEach(function(s){o[s[0]]=v['k_'+s[0]]===true;});return o;}
function crclBox(c){if(!c)return '';if(!c.ok)return bx('orange','CrCl nieobliczony','Brakuje: <b>'+esc(c.missing.join(', '))+'</b> (pasek pacjenta). Korekta nerkowa nie została wykonana.');
 return bx(c.crcl<30?'orange':'ok','CrCl (Cockcroft–Gault z korektą masy): <span class="b2res">'+F(c.crcl,0)+' ml/min</span>','Kreatynina '+(sysU()==='si'?c.crUmol+' µmol/l ('+F(c.crMg,2)+' mg/dl)':F(c.crMg,2)+' mg/dl ('+c.crUmol+' µmol/l)')+' · masa użyta '+F(c.wUsed,0)+' kg ('+esc(c.basis)+')');}
var NS={
 s:function(g){var s=symState();var any=E.SYMP.some(function(x){return s[x[0]];});var r=E.redLight(s);
  var H='';if(!any)return{H:bx('orange','Brak wyniku','Zaznacz objawy. Brak objawów klasycznych nie wyklucza zapalenia opon (ESCMID 2016: triada tylko u ok. 41–51%).'),lvl:'ok'};
  var cls=r.lvl==='red'?'red':r.lvl==='orange'?'orange':'ok';
  H+=bx(cls,'<span class="ccrl">'+(r.lvl==='red'?'🔴 CZERWONE ŚWIATŁO':r.lvl==='orange'?'🟠 POMARAŃCZOWE':'🟢 Brak kryteriów czerwonego światła')+'</span>',esc(r.txt)+ul(r.reasons));
  if(r.hints.length)H+=bx('orange','Dodatkowe wskazówki',ul(r.hints));
  H+=nt('Nie opóźniaj antybiotyku (cel ≤1 h od przyjęcia) z powodu LP, TK ani oczekiwania na wyniki – ESCMID 2016 (A). Posiewy krwi ×2 PRZED pierwszą dawką, jeśli nie wydłuża to czasu do antybiotyku.');
  H+=srcl([E.SRC.escmid16,E.SRC.koroun]);return{H:H,lvl:r.lvl==='red'?'red':'ok'};},
 l:function(g,P){var s=symState(),H='';var gcsRaw=g('gcs');var ci={focal:g('k_focal')||s.focal,cranOnly:g('k_cran'),seizNew:g('k_seiz'),gcs:isNaN(gcsRaw)?undefined:gcsRaw,immuno:g('k_immuno')||s.immuno,papil:g('k_papil'),cnsHx:g('k_cns'),altCons:g('k_alt')||s.alt,bradyHtn:g('k_brady'),pupils:g('k_pupil')};
  var ct=E.ctBeforeLP(ci);
  if(!ct.ok)H+=bx('orange','TK przed LP – brak wyniku',esc(ct.msg));
  else{H+=bx(ct.strict?'red':ct.ct?'orange':'ok','TK głowy przed LP','<b>'+rich(ct.txt)+'</b>'+'<div class="cc3" style="margin-top:6px">'+
   [['ESCMID 2016',ct.escmid,ct.escmidWhy],['IDSA 2004',ct.idsa,ct.idsaWhy],['KOROUN 2026',ct.koroun,ct.korounWhy]].map(function(x){return '<div class="'+(x[1]?'y':'n')+'"><b>'+x[0]+': '+(x[1]?'TK TAK':'TK nie')+'</b>'+(x[2].length?'<div class="mut">'+x[2].map(esc).join('; ')+'</div>':'')+'</div>';}).join('')+'</div><div class="o">'+esc(ct.note)+'</div>'+srcl([E.SRC.escmid16,E.SRC.idsa04,E.SRC.koroun]));}
  var plt=g('plt'),inr=g('inr');var lp=E.lpContra({plt:isNaN(plt)?undefined:plt,inr:isNaN(inr)?undefined:inr,shock:g('k_shock'),skin:g('k_skin'),bleeding:g('k_bleed'),resp:g('k_resp')});
  H+=!lp.ok?bx('orange','Przeciwwskazania do LP – brak wyniku',esc(lp.msg)):bx(lp.contra?'red':'ok','Przeciwwskazania do LP',rich(lp.txt)+srcl(E.SRC.koroun));
  H+=bx('','Przed punkcją / antybiotykiem – pobierz (propozycja zestawu)',ul(['POSIEWY KRWI ×2 z dwóch odrębnych wkłuć – PRZED pierwszą dawką antybiotyku (ESCMID 2016, A; KOROUN). Poza godzinami pracy mikrobiologii: przechowywanie butelek w 15–30 °C (KOROUN).','Morfologia z rozmazem (neutrocyty krwi – potrzebne do skali BMS), CRP, prokalcytonina, glukoza (do współczynnika glukozy PMR/surowica), mleczany, układ krzepnięcia (PLT, INR – przeciwwskazania do LP), gazometria, kreatynina (korekta dawek). Pełny zakres: '+DEC+'.','NIE opóźniaj antybiotyku z powodu pobierania materiału ani TK (ESCMID: antybiotyk ≤1 h; jeśli LP opóźniona – podaj empirycznie od razu).'])+srcl([E.SRC.escmid16,E.SRC.koroun]));
  return{H:H,lvl:ct.ok&&ct.strict||lp.contra?'red':'ok'};},
 p:function(g,P){var H='';
  H+=bx('','Probówki z PMR – liczba i kolejność',tbl(['#','Do czego','Dokąd','Uwagi'],E.TUBES.map(function(t){return [t.n,esc(t.use),esc(t.lab),esc(t.note)];}))+ul(E.CSF_NOTES)+srcl([E.SRC.koroun,E.SRC.escmid16]));
  H+=bx('','Badania dodatkowe wg wskazań (DO DECYZJI – dostępność i zestaw zależą od laboratorium)',tbl(['Badanie','Kiedy','Uwagi'],[
   ['PCR: HSV-1/2, VZV, enterowirusy','zapalenie mózgu / opon z limfocytozą, drgawki, objawy ogniskowe','trzecia probówka; wynik nie powinien opóźniać acyklowiru (KOROUN)'],
   ['PCR: meningokok, pneumokok (±Hib)','posiew ujemny po antybiotyku; podejrzenie bakteryjne','ESCMID 2016: PCR przy ujemnym posiewie'],
   ['Borrelia (przeciwciała w PMR i surowicy, wskaźnik)','ekspozycja na kleszcze / wieś / Podhale; limfocytoza, porażenie nn. czaszkowych','interpretację wskaźnika PMR/surowica '+DEC],
   ['KZM IgM / IgG','ekspozycja na kleszcze, przebieg dwufazowy','wg KOROUN endemiczne: woj. podlaskie, warmińsko-mazurskie; poza tym '+DEC],
   ['Cryptococcus (antygen / tusz chiński)','niedobór odporności (HIV, immunosupresja)','dostępność lokalnie: '+DEC],
   ['Gruźlica (BK, PCR, ADA)','przebieg podostry, glukoza ↓, białko ↑↑, limfocytoza','w ośrodku referencyjnym: '+DEC]].map(function(r){return r.map(rich);}))+srcl([E.SRC.koroun]));
  var sg=g('glu'),sgl=g('sglu');var gMg=isNaN(sg)?NaN:UN.fromSI('glu',sg,'conv'),sMg=isNaN(sgl)?NaN:UN.fromSI('glu',sgl,'conv');
  var ci=E.csfInterp({cells:g('cells'),neutPct:g('neut'),prot:g('prot'),glu:gMg,sglu:sMg,lac:g('lac'),gram:g('k_gram'),csfNeut:g('cneut'),bloodNeut:g('bneut'),seiz:g('k_seiz')});
  if(!ci.ok)H+=bx('orange','Interpretacja PMR – brak wyniku',esc(ci.msg));
  else{var cl={bact:'red',viral:'ok',mixed:'orange',tbfungal:'orange','':'orange'}[ci.cls];
   H+=bx(cl,'Interpretacja PMR','<b>'+rich(ci.txt)+'</b>'+(isFinite(ci.ratio)?'<div>Współczynnik glukozy PMR/surowica: <b>'+F(ci.ratio,2)+'</b> (prawidłowo ≥0,6; <0,4 – bakteryjne)</div>':'')+
    '<div class="cc3" style="margin-top:6px"><div class="y"><b>Cechy bakteryjne</b>'+(ci.bact.length?ul(ci.bact):'<div class="mut">brak</div>')+'</div><div class="n"><b>Cechy wirusowe</b>'+(ci.viral.length?ul(ci.viral):'<div class="mut">brak</div>')+'</div>'+(ci.mid.length?'<div><b>Pośrednie</b>'+ul(ci.mid)+'</div>':'')+'</div>'+
    (ci.bms!==null?'<div>Bacterial Meningitis Score: <b>'+ci.bms+'</b> '+(ci.bms===0?'(0 – raczej aseptyczne)':ci.bms>=2?'(≥2 – prawdopodobnie bakteryjne)':'(1 – niejednoznaczne)')+' <span class="mut">(skala opisana w KOROUN; walidacja populacji nie została zweryfikowana: '+DEC+')</span></div>':'')+
    '<div class="o">'+esc(ci.warn)+'</div>'+srcl([E.SRC.koroun,E.SRC.escmid16]));}
  H+=bx('','Tabela odniesienia (KOROUN 2026, Tab. 23)',tbl(['','Bakteryjne','Wirusowe'],[['wygląd','mętny','przejrzysty'],['cytoza','kilkaset – >1000/µl, neutrofile','kilka – kilkaset/µl, limfocyty'],['białko','często >100 mg/dl','prawidłowe / nieznacznie podwyższone'],['glukoza PMR/surowica','<0,4','>0,6'],['mleczany','podwyższone (>2,4 mmol/l)','prawidłowe / niskie (1,1–2,4)']])+'<div class="mut">Mleczany >2,4 mmol/l przemawiają za etiologią bakteryjną, grzybiczą lub gruźliczą.</div>');
  return{H:H,lvl:ci.ok&&ci.cls==='bact'?'red':'ok'};},
 t:function(g,P){var s=symState();var enc=g('k_enc')||(s.fever&&(s.alt||s.seiz||s.focal));var pr=tri(g('o_preg')),ba=tri(g('o_beta'));
  var r=E.neuroTreat({age:P.age,w:P.w,h:P.h,sex:P.sex,crMg:P.crMg,rrt:g('o_rrt')||'none',pregnancy:pr,betaAllergy:ba,encephalitis:!!enc,listeriaRisk:g('k_list')||g('k_dm')||g('k_ca'),immuno:s.immuno});
  var H='';if(!r.ok)return{H:bx('orange','Uzupełnij – brak propozycji leczenia','Brakuje: <b>'+esc(r.needs.join(', '))+'</b>. Nie wyliczono dawek.'),lvl:'ok'};
  H+=crclBox(r.crcl);if(r.warnings.length)H+=bx('orange','Uwagi',ul(r.warnings));
  if(enc&&!g('k_enc'))H+=bx('orange','Acyklowir dodany automatycznie','Gorączka + zaburzenia świadomości / drgawki / objawy ogniskowe → podejrzenie zapalenia mózgu (z karty „Objawy”).');
  H+=bx('red','Antybiotykoterapia empiryczna – pierwsza dawka ≤1 h od przyjęcia'+(r.listeria?' · <span class="dw">+ Listeria (ampicylina)</span>':''),
   tbl(['Lek / rola','Dawka w ZOMR (dorośli)','Korekta nerkowa wg CrCl','Dawka standardowa w silniku'],r.drugs.map(function(d){return {cls:d.mod?'warn':'',cells:['<b>'+esc(d.drug)+'</b><div class="mut">'+esc(d.role)+'</div>','<b>'+rich(d.dose)+'</b>',rich(d.text),esc(d.std)]};}))+
   '<div class="mut">Pierwsza dawka zawsze pełna; korekta dotyczy kolejnych. Dawki w ZOMR różnią się od standardowych dawek aplikacji – tabela korekt dotyczy odstępów, nie podmienia dawki.</div>'+srcl(r.src.concat([E.SRC.escmid16])));
  H+=bx('orange','Deksametazon – dawka i KIEDY',rich(r.steroid.dose)+ul(r.steroid.when)+srcl([E.SRC.escmid16,E.SRC.idsa04,E.SRC.koroun]));
  if(r.decisions.length)H+=bx('orange','DO DECYZJI LEKARZA',ul(r.decisions));
  H+=bx('',"Postępowanie towarzyszące",ul(r.notes));
  H+=bx('','Profilaktyka kontaktów po zachorowaniu meningokokowym (informacja)',tbl(['Lek','Dawka'],E.PROPH.map(function(x){return [esc(x[0]),esc(x[1])];}))+'<div>'+rich(E.PROPH_NOTE)+'</div>'+srcl(E.SRC.escmid16));
  return{H:H,lvl:'ok'};},
 r:function(g,P){var s=symState();var enc=g('k_enc')||(s.fever&&(s.alt||s.seiz||s.focal));
  var tr=E.transferNeuro({gcs:isNaN(g('gcs2'))?undefined:g('gcs2'),shock:g('k_shock'),seizRep:g('k_seizrep'),icp:g('k_icp'),imaging:g('k_img'),encephalitis:enc,susp:g('k_susp')});
  var H='';H+=!tr.ok?bx('orange','Kryteria przekazania – brak wyniku',esc(tr.msg||'Zaznacz kryteria.')):bx(tr.items.some(function(x){return /^OIT/.test(x);})?'red':'orange','Kryteria przekazania (propozycja)',ul(tr.items)+'<div>'+rich(tr.txt)+'</div>');
  var sn=NEUROSNAP();H+=bx('','Podgląd treści w raporcie zbiorczym','<div class="mut">Wypełnione karty modułu trafiają do raportu (Raport → drukuj). Poniżej – to, co zostanie zapisane.</div><pre class="ccpre">'+esc(sn||'(nic jeszcze nie wypełniono)')+'</pre>');
  H+=(window.SORTel&&SORTel.kprHtml?SORTel.kprHtml():'');H+=nt('Przekazanie: dane do rozmowy z konsultantem – wiek, masa, objawy i czas ich początku, czas pierwszej dawki antybiotyku / acyklowiru, posiewy krwi (pobrane TAK/NIE przed antybiotykiem), wynik LP i TK, alergie, kreatynina, GCS.');
  return{H:H,lvl:'ok'};}
};
function neuroForm(t){
 if(t==='s')return '<div class="ccsym">'+E.SYMP.map(function(s){return '<label><input type="checkbox" id="k_'+s[0]+'"> '+esc(s[1])+'</label>';}).join('')+'</div>';
 if(t==='l')return h3('Dane do oceny TK i LP')+inp('gcs','GCS (3–15)','','np. 15')+chk('k_focal','ogniskowy deficyt neurologiczny')+chk('k_cran','…ograniczony do porażeń nerwów czaszkowych')+chk('k_seiz','NOWE drgawki (≤1 tyg.)')+chk('k_immuno','ciężki niedobór odporności')+chk('k_papil','tarcza zastoinowa')+chk('k_cns','choroba OUN w wywiadzie')+chk('k_alt','zaburzenia świadomości')+chk('k_brady','bradykardia z nadciśnieniem')+chk('k_pupil','nierówne / szerokie / słabo reagujące źrenice')+
  h3('Przeciwwskazania do LP')+inp('plt','PLT','G/l','np. 180')+inp('inr','INR','','np. 1,1')+chk('k_shock','wstrząs / niestabilność hemodynamiczna')+chk('k_skin','zakażenie skóry w miejscu nakłucia')+chk('k_bleed','czynne krwawienie / koagulopatia')+chk('k_resp','niewydolność oddechowa');
 if(t==='p')return h3('Wyniki PMR (wpisz po otrzymaniu)')+inp('cells','Cytoza','/µl')+inp('neut','Neutrofile w PMR','%')+inp('prot','Białko','mg/dl')+inp('glu','Glukoza PMR','@glu')+inp('sglu','Glukoza surowica','@glu')+inp('lac','Mleczany PMR','mmol/l')+chk('k_gram','Gram: bakterie widoczne')+h3('Do skali BMS (opcjonalnie)')+inp('cneut','Neutrofile PMR','/µl')+inp('bneut','Neutrofile krwi','/µl')+chk('k_seiz','drgawki');
 if(t==='t')return h3('Dane uzupełniające (wiek, masa, wzrost, płeć i kreatynina – z paska pacjenta)')+chk('k_enc','podejrzenie zapalenia mózgu (HSV/VZV) – acyklowir')+chk('k_list','czynnik ryzyka Listeria (immunosupresja)')+chk('k_dm','cukrzyca')+chk('k_ca','nowotwór')+sel('o_preg','Ciąża / karmienie',[['','nie ustalono'],['no','nie'],['yes','tak']])+sel('o_beta','Alergia na β-laktamy',[['','nie ustalono'],['no','nie'],['yes','tak']])+sel('o_rrt','Leczenie nerkozastępcze',[['none','brak'],['hd','hemodializa'],['crrt','CRRT'],['pd','dializa otrzewnowa']]);
 return h3('Kryteria przekazania')+inp('gcs2','GCS','')+chk('k_susp','podejrzenie ZOMR / neuroinfekcji – przekazanie na oddział zakaźny')+chk('k_shock','wstrząs / sepsa')+chk('k_seizrep','powtarzające się drgawki / stan padaczkowy')+chk('k_icp','objawy wzmożonego ciśnienia śródczaszkowego')+chk('k_img','ropień / wodogłowie w obrazowaniu')+chk('k_enc','zapalenie mózgu')+(window.SORTel&&SORTel.zakazneHtml?SORTel.zakazneHtml():'');}
function neuroCalc(t,g,P,X){return NS[t](g,P,X);}
var NEURO_TABS=[['s','1. Objawy'],['l','2. Przed LP'],['p','3. PMR'],['t','4. Leczenie'],['r','5. Przekazanie / raport']];
var NEURO_NAMES={s:'Objawy – czerwone światło',l:'Przed LP',p:'PMR',t:'Leczenie',r:'Przekazanie'};
function NEUROSNAP(){try{var P=SKS.P(),out=[];['s','l','p','t','r'].forEach(function(t){if(t==='r')return;var v=store(MID+'_'+t).get();var any=Object.keys(v).some(function(k){return k.indexOf('__')!==0&&(v[k]===true||(typeof v[k]==='string'&&v[k]!==''&&k!=='o_rrt'));});if(!any)return;var r=NS[t](mkG(MID,t),P,{});out.push('== '+NEURO_NAMES[t]+' ==\n'+htmlText(r.H));});return out.join('\n\n');}catch(e){return '';}}
var NEURO=tabbed({id:MID,icon:'🦠',name:'Neuroinfekcje'},'Neuroinfekcje – zapalenie opon i mózgu',NEURO_TABS,neuroForm,neuroCalc,
 '<h3>Źródła</h3>'+srcList([esc(E.SRC.escmid16),esc(E.SRC.idsa04),esc(E.SRC.koroun)])+'<p>Rozbieżności źródeł pokazano jawnie (czas deksametazonu, INR do LP, kryteria TK). <span class="dw">DO DECYZJI LEKARZA</span>: lokalna cieplarka vs mikrobiologia, rezygnacja z posiewu, zakres empiryczny przy alergii / immunosupresji, izolacja, profilaktyka kontaktów.</p>');
NEURO.snapshot=function(){var t=NEUROSNAP();return t?{text:t}:null;};
SKM.insertAfter('neuro',NEURO);
// ============================================================ AF – kardiowersja ============================================================
function efState(){var g=mkG('af','e');var st=g('o_stab');return{unstable:st==='yes'?true:st==='no'?false:undefined,hours:g('hrs'),unknown:g('k_unk'),oac3w:g('k_oac'),tee:g('o_tee')||undefined,start:g('k_start')};}
function cvBox(){var s=efState();var o=E.cvEligibility(s);if(!o.ok)return bx('orange','Warunki kardiowersji – brak wyniku (zakładka „Czas i warunki”)',esc(o.msg||'Uzupełnij zakładkę.'));
 return bx(o.lvl,'Warunki kardiowersji: '+rich(o.title),ul(o.reasons.concat(o.actions)));}
var AFX={
 e:function(g,P){var s={unstable:tri(g('o_stab')),hours:g('hrs'),unknown:g('k_unk'),oac3w:g('k_oac'),tee:g('o_tee')||undefined,start:g('k_start')};var o=E.cvEligibility(s);var H='';
  if(!o.ok)H=bx('orange','Brak wyniku',esc(o.msg||'Uzupełnij dane.'));else H=bx(o.lvl,rich(o.title),ul(o.reasons)+(o.actions.length?'<b>Działania:</b>'+ul(o.actions):'')+srcl(o.src));
  H+=bx('','Antykoagulacja',go('acoag','Moduł Antykoagulacja i odwracanie (heparyna, enoksaparyna, NOAC)')+'<div class="mut">Włączenie antykoagulacji jak najszybciej przy kardiowersji nieplanowanej: ESC 2024 (IIa, B). Oblicz CHA₂DS₂-VA w zakładce „CHA₂DS₂-VA”.</div>');
  return{H:H,lvl:o.ok&&o.lvl==='red'&&s.unstable===true?'red':'ok'};},
 ec:function(g,P){var rh=g('o_rh');var pl=E.ecPlan({rhythm:rh});var H=cvBox();H+='<p><button type="button" class="tg" id="goPropofol" onclick="SKS.openPropofol()">→ Propofol – bolus do sedacji (Pompy SOR)</button></p>';
  if(!pl.ok)H+=bx('orange','Energia – brak wyniku','Wybierz rytm: migotanie / trzepotanie.');
  else{H+=bx('red','Kardiowersja elektryczna – energia: <span class="b2res">'+pl.seq.join(' → ')+' J</span>',rich(pl.energy)+ul(pl.steps)+srcl(pl.src));}
  var sp=E.sedationPlan(P.w);H+=bx('orange','Sedacja do kardiowersji – leki i dawki (ESC 2024: midazolam, propofol lub etomidat)',(sp.ok?'<div class="mut">Masa: '+F(P.w,0)+' kg</div>':'<div class="o">Podaj masę ciała w pasku – dawki mg/kg nie zostały wyliczone.</div>')+tbl(['Lek','Dawka','Rachunek wg masy','Źródło'],sp.drugs.map(function(d){return [ '<b>'+esc(d.drug)+'</b>',esc(d.dose),esc(d.calc||'—'),esc(d.src)];}))+ul(sp.notes)+srcl(sp.src));
  return{H:H,lvl:'ok'};},
 k:function(g,P){var w=P.w,H=cvBox();
  H+=nt('Kardiowersja FARMAKOLOGICZNA wymaga tego samego zabezpieczenia przeciwzakrzepowego co elektryczna (≥3 tyg. OAC lub TOE, gdy AF >24 h / czas nieznany) – ESC 2024. '+DEC+' przy rozbieżnościach.');
  var sc=E.pharmaScreen({hfref:g('k_hf'),cad:g('k_cad'),lvh:g('k_lvh'),valve:g('k_valve'),avb:g('k_avb'),qrs:g('k_qrs'),qt:g('k_qt'),sss:g('k_sss')});
  H+=!sc.ok?bx('orange','Choroby strukturalne / EKG – brak oceny','Zaznacz występujące (lub brak) – bez tego nie ma oceny przeciwwskazań.'):bx(sc.shd.length||sc.ecg.length?'red':'ok','Ocena wstępna',esc(sc.txt));
  var avoid=sc.ok&&(sc.shd.length>0||sc.ecg.length>0);
  var am=E.amiodarone(w);H+=bx(avoid?'orange':'ok','1) Amiodaron i.v. – '+(sc.ok&&sc.shd.length?'wybór u chorych ze strukturalną chorobą serca (ESC 2024)':'opcja'),'<b>'+rich(am.dose)+'</b>'+(am.mgkg?'<div class="mut">'+esc(am.mgkg)+'</div>':'')+'<div class="o">'+rich(am.alt)+'</div>'+ul(am.how)+srcl(am.src));
  var pp=E.propafenonePIP(w);var ppH='';
  if(!pp.ok)ppH='<div class="o">'+esc(pp.msg)+'</div>';
  else{ppH='<div class="ok"><b>'+esc(pp.local)+'</b></div>'+(pp.noWeight?'<div><span class="big">≤70 kg: 450 mg · >70 kg: 600 mg</span></div><div class="o">⚠ '+esc(pp.warn)+'</div>':'<div><span class="big">'+pp.escMg+' mg p.o. ('+pp.tabsEsc+' tabl. po 150 mg)</span></div>')+'<div class="mut">'+esc(pp.txt)+'</div>';}
  H+=bx(avoid||g('k_flutter')?'red':'orange','2) Propafenon p.o. – „pill in the pocket” w SOR (Rytmonorm 150 mg) – STANDARD LOKALNY',ppH+'<div class="o">Jednorazowa dawka 450 mg (≤70 kg) / 600 mg (>70 kg) – standard lokalny zatwierdzony przez lekarza, zgodny z ESC 2024 (p.o. 450–600 mg); schemat NIE pochodzi z ChPL – ChPL Rytmonorm 150 podaje wyłącznie dawki dobowe (450–600 mg/dobę w 2–3 dawkach, maks. 900 mg). '+DEC+'.</div>'+
   ul(['Przed dawką: lek hamujący przewodzenie w węźle AV (β-bloker / niedihydropirydynowy bloker kanału Ca) – ok. 30 min wcześniej (źródło wtórne MP 2026; ESC 2024: wymagany blokujący węzeł AV).','Obserwacja w monitorze EKG 4–6 h (założenie użytkownika; ESC 2024: konwersja po 3–8 h; PAMW 2023: monitorowanie ≥2 h po lekach i.v.). Brak konwersji po 6 h – konsultacja / EC. Nie powtarzać dawki w ciągu 24 h (źródło wtórne).','Przerwij i działaj, gdy QRS poszerza się >25% (ESC 2024); ryzyko przewodzenia 1:1 przy trzepotaniu – NIE stosować przy trzepotaniu.','Propafenon i.v. 1,5–2 mg/kg w 10 min (ESC 2024, Tab. 13)'+(nz(w)&&w>=30?' = '+F(1.5*w,0)+'–'+F(2*w,0)+' mg':'')+' – dostępność i.v. w szpitalu: '+DEC+'.'])+
   '<b>Przeciwwskazania (ChPL Rytmonorm 150; ESC 2024):</b>'+ul(E.PIP_CONTRA)+srcl(pp.ok?pp.src:[E.SRC.rytm]));
  var fl=E.flecainideIv(w);H+=bx('','3) Flekainid i.v. – NIEDOSTĘPNY w tym szpitalu',rich(fl.txt)+srcl(fl.src));
  var az=E.antazoline({});H+=bx(avoid?'red':'orange','4) Antazolina (Phenazolinum) i.v. – praktyka off-label / poza zaleceniami ESC '+'<span class="dw">DO DECYZJI LEKARZA</span>','<div class="b2nt">'+rich(az.evid)+'</div>'+tbl(['Schemat','Opis i źródło'],az.regimens.map(function(r){return ['<b>'+esc(r.id)+'</b>',rich(r.t)+'<div class="mut">'+esc(r.src)+'</div>'];}))+'<div>'+esc(az.ampule)+'; maks. łącznie 300 mg w tej aplikacji (górna granica z ChPL i badań).</div><b>Przeciwwskazania / ostrożność:</b>'+ul(az.contra)+'<div>'+rich(az.effects)+'</div>'+srcl(az.src));
  return{H:H,lvl:g('k_flutter')?'orange':'ok'};},
 po:function(g,P){var sr=tri(g('o_sr'));var cv=store('af_s').get();var CH=SK.b3.cha({chf:cv.chf||(P.co&&P.co.heart),htn:cv.htn,dm:cv.dm,stroke:cv.stroke,vasc:cv.vasc,age:P.age,sex:P.sex});
  var va=isFinite(P.age)?CH.va:undefined;var o=E.postCv({sr:sr,va:va});var H=cvBox();
  if(!o.ok)H+=bx('orange','Po kardiowersji – brak wyniku',esc(o.msg));
  else{H+=bx('red','ANTYKOAGULACJA PO KARDIOWERSJI','<span class="big">'+rich(o.main)+'</span><div class="o">'+rich(o.excl)+'</div><div class="o">'+rich(o.pamw)+'</div>'+srcl(o.src));
   H+=bx(o.longLvl||'orange','Co dalej – decyzja wg CHA₂DS₂-VA','<b>'+(isFinite(P.age)?'CHA₂DS₂-VA = '+CH.va+' (z zakładki „CHA₂DS₂-VA” i paska pacjenta)':'Brak wieku w pasku – nie obliczono')+'</b><div>'+rich(o.long)+'</div>'+(o.fail?'<div class="o">'+rich(o.fail)+'</div>':''));}
  H+=bx('',"Antykoagulacja – dawki",go('acoag','Moduł Antykoagulacja i odwracanie'));
  return{H:H,lvl:'ok'};}
};
var AF_NAMES={e:'Czas i warunki',ec:'Kardiowersja elektryczna',k:'Farmakologicznie',po:'Po kardiowersji'};
function afForm(t){
 if(t==='e')return sel('o_stab','Stan hemodynamiczny',[['','nie ustalono'],['no','stabilny'],['yes','NIESTABILNY (wstrząs, obrzęk płuc, ból wieńcowy, zaburzenia świadomości)']])+inp('hrs','Czas trwania AF','h','np. 6')+chk('k_unk','czas trwania nieznany')+chk('k_start','początek arytmii dokładnie znany (godzina)')+chk('k_oac','skuteczna OAC ≥3 tyg. (DOAK regularnie / INR ≥2)')+sel('o_tee','TOE',[['','nie wykonano'],['clear','bez skrzepliny'],['thrombus','skrzeplina w uszku LP']]);
 if(t==='ec')return sel('o_rh','Rytm',[['','wybierz'],['af','migotanie przedsionków'],['flutter','trzepotanie przedsionków']]);
 if(t==='k')return chk('k_flutter','TRZEPOTANIE przedsionków')+chk('k_hf','niewydolność serca / niska EF')+chk('k_cad','choroba wieńcowa')+chk('k_lvh','przerost lewej komory')+chk('k_valve','istotna wada zastawkowa')+chk('k_avb','blok AV / bradykardia')+chk('k_qrs','szerokie QRS / BBB')+chk('k_qt','QTc >500 ms')+chk('k_sss','zespół chorego węzła');
 return sel('o_sr','Rytm zatokowy przywrócony?',[['','nie ustalono'],['yes','tak'],['no','nie']]);}
function afSnap(){try{var P=SKS.P(),out=[];['e','ec','k','po'].forEach(function(t){var v=store('af_'+t).get();var any=Object.keys(v).some(function(k){return k.indexOf('__')!==0&&(v[k]===true||(typeof v[k]==='string'&&v[k]!==''));});if(!any)return;var r=AFX[t](mkG('af',t),P,{});out.push('== '+AF_NAMES[t]+' ==\n'+htmlText(r.H));});
 if(!out.length)return '';var cv=store('af_s').get();if(isFinite(P.age)){var CH=SK.b3.cha({chf:cv.chf||(P.co&&P.co.heart),htn:cv.htn,dm:cv.dm,stroke:cv.stroke,vasc:cv.vasc,age:P.age,sex:P.sex});out.unshift('== CHA₂DS₂-VA ==\nCHA₂DS₂-VA = '+CH.va+' (antykoagulacja długoterminowa: '+CH.oacVA+')');}
 return out.join('\n\n');}catch(e){return '';}}
// ============================================================ PARACETAMOL (zakładka w module Zatrucia) ============================================================
function paraTabs(H){var number=H.number,select=H.select,check=H.check,group=H.group,box=H.box,table=H.table,sources=H.sources,reviewed=H.reviewed,gate=H.gate,transfer=H.transfer,esc2=H.esc;
 function rr(s){return rich(s);}
 return [{id:'para',name:'Paracetamol: NAC + nomogram',
  form:function(){var si=sysU()==='si';return group('Spożycie',number('mg','Zadeklarowana dawka','mg','',0,200000)+number('hrs','Czas od spożycia do teraz','h','',0,720)+check('tu','Czas nieznany / niewiarygodny')+check('stag','Spożycie rozłożone / wielokrotne / przewlekłe')+check('du','Dawka nieznana / niepewna')+check('risk','Czynniki ryzyka (niedożywienie, przewlekły alkohol, leki indukujące CYP, choroba wątroby)')+check('hep','Podwyższone ALT/AST lub cechy uszkodzenia wątroby'))+
   group('Stężenie paracetamolu i nomogram Rumack–Matthew',number('conc','Stężenie paracetamolu','','',0,20000,'para')+number('chr','Godziny od spożycia do POBRANIA krwi','h','',0,720)+'<button type="button" class="tg" data-cunit>⇄ przełącz jednostki laboratoryjne ('+(si?'teraz µmol/l → na µg/ml':'teraz µg/ml → na µmol/l')+')</button>')+
   group('Kalkulator NAC',select('t1','Czas 1. wlewu (150 mg/kg)',[['60','60 min (domyślnie; Dart 2023: ≥60 min)'],['30','30 min'],['15','15 min (ChPL)']]))+reviewed();},
  calc:function(g,P){var w=P.w,h='',alarm=false;
   var un=E.urgentNac({w:w,mg:g('mg'),hours:g('hrs'),timeUnknown:g('tu'),staggered:g('stag'),doseUnknown:g('du'),risk:g('risk'),hepatic:g('hep')});
   var unit=sysU()==='si'?'umol':'ug';var concUmol=g('conc');
   var nonAcute=g('stag')===true||g('tu')===true;
   var nm=E.nomogram({conc:concUmol,hours:g('chr'),unit:'umol',nonAcute:nonAcute,risk:g('risk')});
   h+=box('Zasada: nie czekaj na stężenie, gdy dawka lub czas są niepewne','<p>Przy nieznanym czasie, spożyciu rozłożonym, &gt;8 h od spożycia lub dawce ≥150 mg/kg (≥10 g) – <b>NAC od razu</b>, równolegle pobierz krew (Dart 2023; BPC 2026). Stężenie i nomogram służą do ODSTAWIENIA decyzji o NAC tylko w jednorazowym, dokładnie znanym spożyciu.</p>','');
   if(!un.ok)h+=box('NAC natychmiast? – brak wyniku',esc(un.msg),'orange');
   else{h+=box(un.now?'🔴 NAC OD RAZU':'Poniżej progu natychmiastowego NAC',pn(rr(un.txt)),un.now?'red':'orange');if(un.now)alarm=true;}
   // nomogram
   var chart=E.nomogramSvg(nm.ok&&nm.usable?nm:null,unit);
   if(!nm.ok)h+=box('Nomogram Rumack–Matthew – brak punktu',esc(nm.msg)+'<div>'+chart+'</div>','orange');
   else if(!nm.usable)h+=box('Nomogram: NIE interpretować',rr(nm.txt)+'<div>'+chart+'</div>',nm.lvl);
   else{var conv=unit==='umol'?F(nm.ug,1)+' µg/ml':F(nm.umol,0)+' µmol/l';var linU=unit==='umol'?F(nm.lineUmol,0)+' µmol/l':F(nm.line,1)+' µg/ml';
    h+=box('Nomogram Rumack–Matthew: '+(nm.above?'POWYŻEJ linii leczenia':'poniżej linii leczenia'),'<b>'+pn(esc(nm.txt))+'</b><div>Wynik: '+(unit==='umol'?F(nm.umol,0)+' µmol/l':F(nm.ug,1)+' µg/ml')+' (= '+conv+') w '+F(nm.hours,1)+' h od spożycia; linia leczenia w tym czasie: '+linU+'. '+(nm.above?'Stężenie jest powyżej linii.':'Stężenie jest poniżej linii.')+'</div>'+chart+(nm.caveats.length?'<ul>'+nm.caveats.map(function(x){return '<li>'+rr(x)+'</li>';}).join('')+'</ul>':'')+(nm.highTxt?'<div class="r">'+rr(nm.highTxt)+'</div>':'')+(nm.riskTxt?'<div class="o">'+rr(nm.riskTxt)+'</div>':'')+'<div class="mut">Nomogram: wyłącznie jednorazowe spożycie ze znanym czasem, próbki 4–24 h (Dart 2023; BPC 2026). Przeliczenie 1 µg/ml = 6,615 µmol/l.</div>',nm.above?'red':'');if(nm.above)alarm=true;}
   // NAC
   var t1=Number(g('t1'));var np=E.nacPlan({w:w,t1:t1});
   var need=(un.ok&&un.now)||(nm.ok&&nm.usable&&nm.above);
   if(!np.ok)h+=box('Kalkulator NAC – brak wyniku',esc(np.msg),'orange');
   else{var tb=table(['Worek','Dawka','NAC 100 mg/ml','Rozpuszczalnik (NaCl 0,9% lub G5%)','Czas','Prędkość'],np.bags.map(function(b){return [esc(b.n),F(b.mg,0)+' mg ('+b.mgkg+' mg/kg)',F(b.conc,1)+' ml',b.vol?b.vol+' ml':'<span class="dw">DO DECYZJI LEKARZA</span>',b.h<1?F(b.h*60,0)+' min':F(b.h,b.h%1?2:0)+' h',b.mlh?F(b.mlh,0)+' ml/h':'—'];}));
    var body='<div class="mut">Masa '+F(np.w,0)+' kg'+(np.capped?' (obliczenia dla '+np.wc+' kg)':'')+' · łącznie '+F(np.total,0)+' mg (300 mg/kg) · '+esc(np.duration)+'</div>'+tb+(np.warnings.length?'<ul>'+np.warnings.map(function(x){return '<li class="o">'+rr(x)+'</li>';}).join('')+'</ul>':'')+'<ul>'+np.decisions.map(function(x){return '<li>'+rr(x)+'</li>';}).join('')+'</ul><div class="mut">'+rr(np.alt)+'</div>';
    h+=need?box('NAC – schemat 3-workowy',body,'red'):'<details class="clinical-sources"><summary>Kalkulator NAC (poza wskazaniem wg wprowadzonych danych)</summary>'+body+'</details>';
    if(need){var en=false;h+=box('NAC – przeniesienie zablokowane','Schemat 3-workowy i stężenie 100 mg/ml nie zostały zweryfikowane z polską ChPL konkretnego preparatu NAC i.v. – zapis ręczny, <span class="dw">DO DECYZJI LEKARZA</span>.','orange');np.bags.forEach(function(b,k){if(b.vol)h+=transfer('Propozycja: '+b.n+' → rejestr',{kind:'infusion',name:'acetylocysteina (NAC)',dose:F(b.mg,0)+' mg i.v. w '+(b.h<1?F(b.h*60,0)+' min':F(b.h,0)+' h'),route:'i.v.',amount:F(b.mg,0)+' mg',diluent:'NaCl 0,9% lub glukoza 5%',volume:String(b.vol),concentration:F(b.mg/b.vol,2)+' mg/ml',rate:String(b.mlh),note:'Zatrucie paracetamolem, '+b.mgkg+' mg/kg. Przygotowanie według potwierdzonej procedury.'},en);});}}
   h+=box('Monitorowanie',ul(E.PARA_MONITOR),'');
   h+=box('Kiedy ZAKOŃCZYĆ NAC',rr(E.PARA_STOP.dart)+'<br>'+rr(E.PARA_STOP.bpc)+'<div class="o">'+rr(E.PARA_STOP.note)+'</div>','');
   h+=box('Transfer – kryteria King’s College (BPC 2026) – ośrodek transplantacyjny / OIT','<ul>'+E.KINGS.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul><div class="o">Rosnące ALT/AST z koagulopatią lub encefalopatią → wczesny kontakt z ośrodkiem hepatologicznym / transplantacyjnym (Dart 2023). '+rr(DEC)+' (miejsce przekazania). Kontakty ośrodków toksykologicznych: stały panel u góry modułu.</div>'+(window.SORTel&&SORTel.kprHtml?SORTel.kprHtml():'')+(window.SORTel&&SORTel.liverHtml?SORTel.liverHtml():''),'');
   h+=box('Dializa','Hemodializa rozważana przy stężeniu paracetamolu ≥900 µg/ml z kwasicą lub zaburzeniami świadomości (Dart 2023, wg wyszukiwania) – decyzja z ośrodkiem toksykologicznym: '+rr(DEC)+'.','');
   h+='<details class="clinical-sources"><summary>Źródła, rozbieżności i ograniczenia (paracetamol)</summary><ul>'+[E.SRC.dart23,E.SRC.nacchpl,E.SRC.bpc26].map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul><p>Rozbieżności: masa maks. do liczenia NAC 110 kg (BPC 2026, wcześniejsze wersje aplikacji) vs 100 kg (Dart 2023); czas 1. wlewu 15 min (ChPL) vs ≥60 min (Dart 2023) vs 15–60 min (BPC); kryteria zakończenia NAC (INR &lt;2,0 vs ≤1,3). Oryginał MHRA 2012 i pełny tekst Fig. 3 Dart 2023 nie zostały otwarte – '+DEC+'.</p></details>';
   return{html:h,alarm:alarm};},
  after:function(el){var b=el.querySelector('[data-cunit]');if(b)b.onclick=function(){SKS.setUnits(sysU()==='si'?'conv':'si');};}}];}
// ============================================================ KRWAWIENIE Z GI – endoskopia ============================================================
function giBanner(){var d=new Date(),st=E.endoStatus(d);var wait=E.hoursToNextOpen(d);
 return '<div class="ccbanner"><b>⚠ Pracownia endoskopii Powiatowego Szpitala w Nowym Targu pracuje obecnie tylko 8:00–15:00 i nie jest w systemie dyżurowym.</b> <span class="mut">(informacja od użytkownika, stan z 23.10.2026 – potwierdź telefonicznie; święta nie są uwzględnione)</span><div>Teraz: '+esc(st.time)+' (Europe/Warsaw): <b>'+(st.inside?'w godzinach pracowni':'POZA godzinami pracowni')+'</b>'+(st.inside?'':(isFinite(wait)?' · najbliższe otwarcie za ok. '+pn(String(Math.round(wait*10)/10))+' h':''))+'.</div><div>Poza godzinami pracowni: <b>rozważyć transfer / konsultację</b> – <span class="dw">DO DECYZJI LEKARZA</span>.</div></div>';}
function giE(g){var pl=E.giEndoPlan({variceal:g('k_var'),unstable:g('k_uns'),when:new Date().toISOString()});var H=giBanner();
 H+=bx('red','Kiedy endoskopia jest PILNA – co mówią źródła',tbl(['Sytuacja','Czas endoskopii','Źródło'],[
  ['Podejrzenie krwawienia z żylaków','w ciągu 12 h od zgłoszenia, PO resuscytacji; wcześniej: terlipresyna, antybiotyk, PPI','ESGE 2022'],
  ['Niestabilne krwawienie mimo resuscytacji','brak ustalonego w źródłach okna; endoskopia ≤6 h nie jest zalecana (gorsze wyniki, zwłaszcza u chorych niestabilnych lub z dużym ryzykiem anestezjologicznym) – eskalacja (endoskopia / radiologia zabiegowa / chirurgia): <span class="dw">DO DECYZJI LEKARZA</span>','ESGE 2021'],
  ['Krwawienie niezależne od żylaków, stabilne po resuscytacji','w ciągu 24 h (silna rekomendacja, wysoka jakość); pilna ≤12 h NIE zalecana (wyniki nie lepsze)','ESGE 2021'],
  ['INR / leki przeciwzakrzepowe','nie powinny wyznaczać terminu endoskopii','ESGE 2021']])+
  '<div class="o">Wg ESGE „bezwzględna, natychmiastowa” gastroskopia nie jest wskazana w krwawieniu niezależnym od żylaków. Jedyne ustalone w źródłach okno czasowe dotyczy żylaków (≤12 h po stabilizacji). '+rich(DEC)+' w pozostałych sytuacjach.</div>'+srcl([E.SRC.esge21,E.SRC.esgev22]));
 H+=bx('','Ocena dla tego pacjenta (zaznacz) – zakładka „Endoskopia”','Zaznacz w formularzu: podejrzenie żylaków lub niestabilność – pojawi się ocena względem godzin pracowni.');
 if(pl.ok&&(g('k_var')||g('k_uns')||true)){H+=bx(pl.items.some(function(x){return x.lvl==='red';})?'red':pl.items.some(function(x){return x.lvl==='orange';})?'orange':'ok','Czas a godziny pracowni',pl.items.map(function(x){return '<div class="'+(x.lvl==='red'?'r':x.lvl==='orange'?'o':'')+'">'+rich(pn(x.t))+'</div>';}).join('')+'<div class="mut">Stan: '+({Mon:'pn',Tue:'wt',Wed:'śr',Thu:'czw',Fri:'pt',Sat:'sob',Sun:'niedz'}[pl.status.wd]||'')+' '+esc(pl.status.time)+' (Europe/Warsaw).</div>');}
 return{H:H,lvl:pl.items.some(function(x){return x.lvl==='red';})?'red':'ok'};}
window.SORC={paraTabs:paraTabs,afForm:afForm,afCalc:function(t,g,P,X){return AFX[t](g,P,X);},afSnap:afSnap,giBanner:giBanner,giE:giE,giForm:function(){return chk('k_var','podejrzenie krwawienia z żylaków (marskość)')+chk('k_uns','niestabilne krwawienie (wstrząs, brak odpowiedzi na resuscytację)');},neuro:NEURO,htmlText:htmlText,mkG:mkG,symState:symState,NS:NS};
})();
