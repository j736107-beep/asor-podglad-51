(function(){var C=SK.core,F=C.fmt,U=SKM.util,inp=U.inp,bx=U.bx,src=U.src,chk=U.chk,tabbed=U.tabbed,N=SK.neuro;
function dw(t){return ' <span class="dw">'+(t||'DO WERYFIKACJI')+'</span>';}
function sl(t){return ' <span class="mut">['+t+']</span>';}
function sel(id,lab,opts){return '<label>'+lab+' <select id="'+id+'">'+opts.map(function(o){return '<option value="'+o[0]+'">'+o[1]+'</option>'}).join('')+'</select></label>';}
function lnk(id,t){return '<button class="tg" onclick="SKS.show(\''+id+'\')">→ '+t+'</button>';}
function lnk2(t,x){return '<button class="tg" onclick="document.querySelector(&quot;#main .tabs [data-t='+t+']&quot;).click()">→ '+x+'</button>';}
var LAST=null;
function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
window.SKN={print:function(){if(!LAST){alert('Otwórz zakładkę „Algorytm: podejrzenie udaru”.');return;}var L=LAST,i=L.i,s=i.s,P=L.P,F2=function(x){return isFinite(x)?x:'—'};
 var lab={foc:'niedowład/zab. czucia',aph:'afazja',neg:'zaniedbywanie (neglect)',gaze:'zwrot gałek ocznych',vf:'ubytek pola widzenia',post:'objawy tylnego krążenia (zawroty, ataksja, podwójne widzenie, dyzartria, dysfagia)',loc:'zaburzenia przytomności',head:'nagły najsilniejszy ból głowy',hdp:'narastający ból głowy',seiz:'napad na początku',neck:'sztywność/ból karku'};
 var sym=Object.keys(lab).filter(function(k){return s[k]}).map(function(k){return lab[k]});
 var lkw=i.wake?'udar ze snu (wake-up)':i.unk||!isFinite(i.h)?'nieznany':i.h+' h przed oceną (ok. '+(function(){var d=new Date(Date.now()-i.h*3600e3);return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)})()+')';
 var ac={'':'brak',vka:'VKA',dabi:'dabigatran',xa:'anty-Xa',lmwh:'HDCz'}[i.ac||''];
 var ot=N.ottawa({age:P.age,neck:s.neck,loc:s.loc,ex:i.o.ex,inst:i.o.inst,flex:i.o.flex});
 var row=function(a,b){return '<tr><th>'+a+'</th><td>'+b+'</td></tr>'};
 var h='<h1>Protokół postępowania – podejrzenie udaru</h1><div class="sub">SOR Szpital w Nowym Targu · wydruk '+new Date().toLocaleString('pl-PL')+'</div><table>'+
  row('Pacjent',esc(L.name)||'..............................................')+row('PESEL',esc(L.pesel)||'...........................')+row('Data ur. / wiek / płeć',(L.pz&&L.pz.ok?L.pz.birth+' / ':'')+F2(P.age)+' lat / '+({m:'M',f:'K'}[P.sex]||'—'))+
  row('Przyjęcie na SOR',esc(L.adm))+row('Ostatnio widziany zdrowy (LKW)',lkw)+
  row('Objawy',sym.join(', ')||'—')+row('RACE (0–9)',L.rc.n?L.rc.score+(L.rc.lvo?' – podejrzenie LVO':''):'—')+row('NIHSS (0–42)',F2(L.nih))+row('HINTS',{'':'nie badano',central:'centralny',peripheral:'obwodowy'}[i.hints||''])+
  row('Ottawa SAH',s.head?(ot.pos?'dodatnia: '+ot.crit.join(', '):'ujemna'):'nie dotyczy')+row('RR / glikemia',F2(i.sbp)+'/'+F2(i.dbp)+' mmHg · '+esc(L.gluTxt))+row('Antykoagulacja',ac+(isFinite(i.acH)?' (ostatnia dawka '+i.acH+' h temu)':''))+
  row('Masa ciała',F2(P.w)+' kg')+'</table><h2>Wnioski / zlecenia</h2><ol>'+L.r.list.map(function(x){return '<li class="'+x.lvl+'"><b>'+esc(x.t)+'</b> – '+esc(x.d)+(x.s?' <i>['+esc(x.s)+']</i>':'')+'</li>'}).join('')+'</ol>'+
  '<h2>Uwagi lekarza</h2><div class="lines"></div><div class="sig"><div>Godzina: ..............</div><div>Podpis i pieczątka lekarza<br><br>.......................................</div></div><div class="foot">Asystent lekarza SOR – narzędzie pomocnicze, niecertyfikowane. Decyzję podejmuje lekarz.</div>';
 var a=document.getElementById('printArea');if(!a){a=document.createElement('div');a.id='printArea';document.body.appendChild(a);}a.innerHTML=h;if(window.SKG)SKG.run(a);window.print();}};
var MOT={'5a':1,'5b':1,'6a':1,'6b':1,'7':1};
var NEU=tabbed({id:'neuro',icon:'🧠',name:'Neurologia'},'Neurologia – udar',[['a','Algorytm: podejrzenie udaru'],['n','NIHSS'],['t','Tromboliza'],['i','Krwotok (ICH)'],['p','Rokowanie / TIA / GCS'],['d','Otępienie / majaczenie (4AT, szybki wpis)'],['d2','AMTS (pozycje)'],['d3','MoCA (pozycje)'],['d4','MMSE (pozycje)'],['d5','CDR (domeny)']],
 function(t){
  if(t==='d2'||t==='d3'||t==='d4'||t==='d5')return window.SORB2?SORB2.dementiaForm(t):'';
  if(t==='a'){var G=function(h,x){return '<div style="width:100%"><b>'+h+'</b> '+x+'</div>'};
   var rs=function(id,lab,o){return sel(id,lab,[['','— auto']].concat(o))};
   return '<div style="width:100%"><button class="tg np" onclick="SKS.nextPatient()">🆕 Następny pacjent</button> <button class="tg" onclick="SKN.print()">🖨 Drukuj protokół udarowy</button></div>'+
   G('Pacjent','<label>Imię i nazwisko <input id="pname" style="width:200px"></label><label>PESEL <input id="pesel" inputmode="numeric" maxlength="11" style="width:130px"></label><label>Przyjęcie (data, godz.) <input id="adm" style="width:140px"></label><span id="pinfo" class="mut"></span>')+
   G('Czas',inp('h','od ostatniego widzenia zdrowego (LKW – last known well)','h')+chk('wake','wake-up (udar ze snu – objawy zauważone po przebudzeniu)')+chk('unk','nieznany (czas początku nieznany)'))+
   G('Objawy',chk('foc','niedowład/czucie')+chk('aph','afazja (zaburzenia mowy – rozumienie/mówienie)')+chk('neg','zaniedbywanie (neglect – pacjent ignoruje jedną stronę ciała/przestrzeni, np. nie widzi środka sznurka)')+chk('gaze','zwrot gałek ocznych')+chk('vf','ubytek pola widzenia')+chk('post','zawroty/ataksja (niezborność)/podwójne widzenie/dyzartria (bełkotliwa mowa)/dysfagia (zab. połykania)')+chk('loc','↓ przytomność')+chk('head','nagły najsilniejszy ból głowy (szczyt ≤1 h)')+chk('hdp','ból głowy narastający')+chk('seiz','napad na początku')+chk('neck','sztywność/ból karku'))+
   G('RACE (skala zamknięcia dużego naczynia 0–9; ≥5 = podejrzenie LVO – niedrożność dużego naczynia)',rs('rc_face','Twarz',[[0,'0 brak'],[1,'1 łagodny'],[2,'2 umiark./ciężki']])+rs('rc_arm','Ręka',[[0,'0 norma/łagodny'],[1,'1 umiark.'],[2,'2 ciężki']])+rs('rc_leg','Noga',[[0,'0 norma/łagodny'],[1,'1 umiark.'],[2,'2 ciężki']])+rs('rc_gaze','Zwrot głowy/oczu',[[0,'0 brak'],[1,'1 obecny']])+rs('rc_cort','Afazja (niedowład P) / agnozja (niedowład L – nie rozpoznaje niedowładu/ręki)',[[0,'0 wykonuje oba'],[1,'1 jedno'],[2,'2 żadne']])+'<span id="raceInfo" class="mut nopl"></span>')+
   G('NIHSS (skala ciężkości udaru 0–42)',inp('nih','wynik (puste = z zakładki NIHSS)','')+lnk2('n','wypełnij NIHSS'))+
   G('HINTS (test 3 kroków przy zawrotach: impuls głowy, oczopląs, skew – skośne ustawienie gałek)','<input type="hidden" id="hints"><label><input type="radio" name="hintsR" value=""> nie badano</label><label><input type="radio" name="hintsR" value="central"> centralny (podejrzenie udaru pnia/móżdżku)</label><label><input type="radio" name="hintsR" value="peripheral"> obwodowy (błędnik)</label>')+
   G('Ottawa SAH (reguła wykluczenia krwotoku podpajęczynówkowego – czy potrzebne TK/dalsza diagnostyka)',chk('ex','początek przy wysiłku')+chk('inst','ból piorunujący (szczyt natychmiast)')+chk('flex','ograniczone zgięcie karku'))+
   G('CVT (zakrzepica zatok żylnych mózgu) – czynniki',chk('cy','młoda kobieta')+chk('coc','antykoncepcja/ciąża/połóg')+chk('cthr','trombofilia (skłonność do zakrzepów)')+chk('cpap','tarcza zastoinowa (obrzęk tarczy n. II)')+chk('cinf','infekcja ucha/zatok'))+
   G('Guz',chk('tprog','narastanie przez dni/tyg.')+chk('tca','nowotwór w wywiadzie')+chk('tmorn','ból głowy rano')+chk('thern','objawy wgłobienia'))+
   G('Leki / parametry',sel('ac','Antykoagulant',[['','brak'],['vka','VKA (acenokumarol/warfaryna)'],['dabi','dabigatran (Pradaxa)'],['xa','anty-Xa (riwaroksaban/apiksaban/edoksaban)'],['lmwh','HDCz (heparyna drobnocząsteczkowa)']])+inp('ach','ostatnia dawka','h temu')+inp('glu','Glukoza','@glu')+inp('sbp','SBP (ciśn. skurczowe)','')+inp('dbp','DBP (rozkurczowe)','')+chk('mim','możliwy mimik (stan udający udar: hipoglikemia, napad, migrena, konwersja)'));}
  if(t==='n')return '<div class="nih">'+N.NIH.map(function(it){var o=it[2].map(function(d,k){return [k,k+' – '+d]});if(MOT[it[0]])o.push(['UN','UN – nie do oceny']);return sel('n'+it[0],it[1],o)}).join('')+'</div>';
  if(t==='t')return inp('h','Od zachorowania','h')+chk('wake','wake-up / nieznany czas')+chk('mm','niedopasowanie DWI-FLAIR / perfuzji')+'<br>'+
   sel('ph','RR',[['pre','przed trombolizą'],['post','po trombolizie (24 h)']])+inp('sbp','SBP','mmHg')+inp('dbp','DBP','mmHg')+inp('glu','Glukoza','@glu')+
   '<div style="width:100%"><b class="r">Przeciwwskazania bezwzględne</b><br>'+N.CI_ABS.map(function(c){return chk('a_'+c[0],c[1])}).join(' ')+'</div><div style="width:100%"><b class="o">Względne / ostrożnie</b><br>'+N.CI_REL.map(function(c){return chk('r_'+c[0],c[1])}).join(' ')+'</div>';
  if(t==='i')return SKGCS.field(false)+inp('vol','Objętość','ml')+'<span class="mut">lub ABC/2:</span>'+inp('ca','A','cm')+inp('cb','B','cm')+inp('cc','C','cm')+chk('ivh','krew w komorach (IVH)')+chk('inf','podnamiotowy')+inp('sbp','SBP','mmHg')+chk('ac','leczenie przeciwkrzepliwe');
  if(t==='p')return sel('mrs','mRS',N.MRS.map(function(m,k){return [k,m]}))+'<br><b>ABCD² (TIA)</b> '+inp('sbp','SBP','mmHg')+inp('dbp','DBP','mmHg')+sel('clin','Objawy',[['','inne'],['s','zab. mowy bez niedowładu'],['w','niedowład jednostronny']])+inp('dur','Czas trwania','min')+chk('dm','cukrzyca')+
   '<br>'+SKGCS.field(true);
  return '<b>AMTS</b> '+inp('amts','Punkty','0–10')+' <b>Mini-Cog</b> '+sel('mcr','Odtworzone słowa',[['','—'],[0,'0'],[1,'1'],[2,'2'],[3,'3']])+chk('mcc','zegar prawidłowy')+
   '<br><b>MoCA</b> '+inp('moca','Punkty','0–30')+chk('edu','wykształcenie ≤12 lat')+' <b>MMSE</b> '+inp('mmse','Wynik','0–30')+sel('cdr','CDR globalnie',[['','—']].concat(N.CDR))+
   '<br><b>4AT</b> '+chk('fa','zaburzona czujność')+sel('fm','AMT4',[[0,'0 bez błędów'],[1,'1 błąd'],[2,'≥2 / nie do oceny']])+sel('ft','Miesiące wstecz',[[0,'≥7 poprawnie'],[1,'<7 / odmowa'],[2,'nie do oceny']])+chk('fc','ostra zmiana / fluktuacje')+'<span class="mut" style="width:100%">'+(SK.dementiaB2?SK.dementiaB2.ACUTE:'')+'</span><span class="mut" style="width:100%">Skale AMTS, MoCA, MMSE i CDR z punktacją pozycji – osobne zakładki obok.</span>';},
 function(t,g,P,X){var w=P.w,H='',lvl='ok';
  if(t==='d2'||t==='d3'||t==='d4'||t==='d5')return window.SORB2?SORB2.dementiaCalc(t,g,P):{H:'',lvl:'ok'};
  if(t==='a'){var gm=isFinite(g('glu'))?g('glu')*18.016:NaN,$i=function(id){return document.getElementById(id)};
   // pacjent
   var adm=$i('adm');if(adm&&!adm.value){var d=new Date();adm.value=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);setTimeout(function(){adm.dispatchEvent(new Event('input'))},0);}
   var pv=($i('pesel')||{}).value||'',pz=pv?N.pesel(pv):null,pi=$i('pinfo');
   if(pi)pi.innerHTML=!pz?'':pz.ok?'<span class="g">✔ ur. '+pz.birth+' · '+pz.age+' lat · '+(pz.sex==='m'?'M':'K')+'</span>':'<span class="r">✖ '+pz.err+'</span>';
   if(pz&&pz.ok)SKS.setP({age:pz.age,sex:pz.sex});
   // HINTS radio
   var hv=$i('hints').value;document.querySelectorAll('input[name=hintsR]').forEach(function(r){r.checked=r.value===hv;r.onchange=function(){$i('hints').value=r.value;$i('hints').dispatchEvent(new Event('input'))}});
   // NIHSS z zakładki
   var nv={};try{var st=JSON.parse(localStorage.getItem('sk_m_neuro_n')||'{}');N.NIH.forEach(function(it){if(st['n'+it[0]]!=null)nv[it[0]]=st['n'+it[0]]})}catch(e){}
   var nFill=Object.keys(nv).some(function(k){return nv[k]!=='0'&&nv[k]!==''});var nih=isFinite(g('nih'))?g('nih'):nFill?N.nihss(nv).score:NaN;
   // RACE
   var sy={foc:g('foc'),aph:g('aph'),neg:g('neg'),gaze:g('gaze')},auto=nFill?N.raceFromNihss(nv):N.raceFromSym(sy),rv={},man=0;
   Object.keys(N.RACE_MAX).forEach(function(k){var e=$i('rc_'+k).value;if(e!==''){rv[k]=e;man++}else rv[k]=auto[k];});var rc=N.race(rv);
   $i('raceInfo').innerHTML=rc.n?'= <b>'+rc.score+'/9</b>'+(rc.lvo?' <span class="r">≥5 → podejrzenie LVO</span>':'')+' <span class="mut">('+(man===5?'ręcznie':man?'częściowo auto ':'auto ')+(man<5?(nFill?'z NIHSS':'z objawów'):'')+')</span>':'';
   var inp_={h:g('h'),wake:g('wake'),unk:g('unk'),s:{foc:g('foc'),aph:g('aph'),neg:g('neg'),gaze:g('gaze'),vf:g('vf'),post:g('post'),loc:g('loc'),head:g('head'),hdp:g('hdp'),seiz:g('seiz'),neck:g('neck')},o:{ex:g('ex'),inst:g('inst'),flex:g('flex')},
    cvt:{young:g('cy'),oc:g('coc'),thr:g('cthr'),pap:g('cpap'),inf:g('cinf')},tu:{prog:g('tprog'),ca:g('tca'),morn:g('tmorn'),hern:g('thern')},ac:g('ac'),acH:g('ach'),gluMg:gm,sbp:g('sbp'),dbp:g('dbp'),nihss:nih,race:rc.n?rc.score:NaN,hints:hv,mimic:g('mim'),sex:P.sex,age:P.age};
   var r=N.stroke(inp_);
   H='<h3>WNIOSKI – co zlecić teraz</h3>'+r.list.map(function(x){return bx(x.lvl,x.t+(x.s?sl(x.s):''),x.d)}).join('');
   if(r.f.code)H+='<div>'+lnk2('t','Tromboliza')+lnk2('n','NIHSS')+'</div>';if(g('ac'))H+=lnk('acoag','Antykoagulacja');
   LAST={i:inp_,r:r,rc:rc,nih:nih,name:($i('pname')||{}).value||'',pesel:pv,pz:pz,adm:adm?adm.value:'',P:P,gluTxt:isFinite(g('glu'))?SK.units.round('glu',SK.units.fromSI('glu',g('glu'),SKS.S.units),SKS.S.units)+' '+SK.units.label('glu',SKS.S.units):'—'};
   return{H:H,lvl:r.lvl==='red'?'red':'ok'};}
  if(t==='n'){var v={};N.NIH.forEach(function(it){var e=document.getElementById('n'+it[0]);v[it[0]]=e?e.value:''});var r=N.nihss(v);
   H=bx(r.lvl,'NIHSS'+sl('NINDS / AHA'),'<span class="big">'+r.score+' / 42</span> – '+r.sev);}
  if(t==='t'){var wi=N.window(g('h'),g('wake'),g('mm'));H+=bx(wi.lvl,'Okno czasowe'+sl('ESO 2021 / AHA 2019'),'<b>'+wi.txt+'</b>');
   var cv={};N.CI_ABS.concat(N.CI_REL).forEach(function(c){cv[c[0]]=g((N.CI_ABS.indexOf(c)>=0?'a_':'r_')+c[0])});var ci=N.ci(cv);
   if(ci.abs.length)H+=bx('red','PRZECIWWSKAZANIE'+sl('AHA 2019 / ChPL'),'<div class="r">⚠ '+ci.abs.join('<br>⚠ ')+'</div>');if(ci.rel.length)H+=bx('orange','Ostrożnie'+sl('AHA 2019 / ESO 2021'),ci.rel.join(', '));
   var b=N.bp(g('sbp'),g('dbp'),g('ph'));if(b.lvl)H+=bx(b.lvl,'RR '+(g('ph')==='post'?'po':'przed')+' – cel <'+b.lim[0]+'/'+b.lim[1]+sl('AHA 2019 / ESO 2021'),'<span class="big">'+F(g('sbp'),0)+'/'+F(g('dbp'),0)+'</span>'+(b.hi?'<div class="r">⚠ '+(g('ph')==='post'?'Obniż RR (urapidil/labetalol) – kontrola co 15 min':'Obniż RR przed podaniem – bez obniżenia NIE podawaj')+'</div>':''));
   var gm=g('glu')*18.016,gl=N.glu(gm);if(gl.lvl)H+=bx(gl.lvl,'Glikemia'+sl('AHA 2019 / ChPL'),gl.txt);
   var bad=wi.lvl==='red'||ci.abs.length||!wi.lvl,pend=b.hi&&g('ph')!=='post'||gl.lvl==='red';
   if(bad)H+=bx('','Leki trombolityczne',wi.lvl?'Brak wskazań wg wprowadzonych danych.':'Uzupełnij czas zachorowania.');
   else if(!(w>0))H+=bx('orange','','Podaj masę ciała w pasku pacjenta.');
   else{var a=N.alteplase(w),k=N.tenecteplase(w),c=pend?'orange':'ok',pn=pend?'<div class="o">Dopiero po wyrównaniu RR / glikemii</div>':'';
    H+=bx(c,'Alteplaza (Actilyse 1 mg/ml) 0,9 mg/kg, maks. 90 mg'+sl('ChPL / AHA / ESO'),'<span class="big">'+F(a.tot,1)+' mg = '+F(a.tot,1)+' ml</span><div>Bolus 10%: <b>'+F(a.bol,1)+' ml</b> w 1 min · reszta <b>'+F(a.inf,1)+' ml w 60 min = '+F(a.mlh,1)+' ml/h</b></div>'+(a.capped?'<div class="o">Masa >100 kg → dawka maks.</div>':'')+pn);
    H+=bx(c,'Tenekteplaza (Metalyse 5 mg/ml) – dawka wg przedziału masy (EPAR/ChPL)'+sl('EMA EPAR Metalyse, p. 4.2'),'<span class="big">'+F(k.mg,1)+' mg = '+F(k.ml,1)+' ml</span> jednorazowy bolus 5–10 s <span class="mut">(przedział '+k.band+')</span>'+(k.capped?'<div class="o">Masa ≥90 kg → dawka maks. 25 mg.</div>':'')+(k.lowWeight?'<div class="o">Masa ≤50 kg: ChPL – dokładnie oceń stosunek korzyści do ryzyka (ograniczone dane).</div>':'')+(Math.abs(k.diff)>=0.1?'<div class="mut">Wytyczne AHA/ESO (0,25 mg/kg, maks. 25 mg) = '+F(k.guideline025,1)+' mg; różnica '+F(k.diff,1)+' mg – stosuj schemat zgodny z ChPL/protokołem szpitala.</div>':'')+pn+dw('preparat 25 mg/5 ml w szpitalu; dawka wg ChPL vs wytyczne'));}
   lvl=(ci.abs.length||b.hi||gl.lvl==='red')?'red':'ok';}
  if(t==='i'){var vol=isFinite(g('vol'))?g('vol'):N.abc2(g('ca'),g('cb'),g('cc'));var s=N.ichScore({gcs:g('gcs'),vol:vol,ivh:g('ivh'),infra:g('inf'),age:P.age});
   H+=bx(s.lvl,'ICH score'+sl('Hemphill 2001'),'<span class="big">'+s.score+' / 6</span> – śmiertelność 30 dni ~'+s.mort+'%'+(isFinite(vol)?'<div class="mut">objętość '+F(vol,0)+' ml'+(isFinite(P.age)?' · wiek '+P.age:' · podaj wiek w pasku')+'</div>':'')+'<div class="mut">Nie służy do ograniczania leczenia</div>');
   var bp=N.ichBP(g('sbp'));if(bp.lvl)H+=bx(bp.lvl,'RR w ICH – cel SBP ~140'+sl('AHA 2022 / ESO 2021'),'<b>'+bp.txt+'</b>');
   if(g('ac'))H+=bx('red','Odwróć antykoagulację natychmiast'+sl('AHA 2022 / ESO 2019'),'VKA → PCC + wit. K · dabigatran → idarucyzumab · anty-Xa → andeksanet/PCC<div>'+lnk('acoag','Antykoagulacja – dawki')+'</div>');
   lvl=bp.lvl==='red'||g('ac')?'red':'ok';}
  if(t==='p'){var m=g('mrs');H+=bx(m>=3?'orange':'ok','mRS'+sl('van Swieten 1988'),'<b>'+N.MRS[m]+'</b>');
   var a2=N.abcd2({age:P.age,sbp:g('sbp'),dbp:g('dbp'),clin:g('clin'),dur:g('dur'),dm:g('dm')});H+=bx(a2.lvl,'ABCD²'+sl('Johnston 2007'),'<span class="big">'+a2.score+' / 7</span> – ryzyko '+a2.risk+(isFinite(P.age)?'':'<div class="o">Podaj wiek w pasku</div>')+'<div class="mut">Diagnostyka pilna niezależnie od wyniku (AHA/ESO)</div>');
   var gc=N.gcs(+g('ge')||NaN,+g('gv')||NaN,+g('gm')||NaN);H+=gc?bx(gc.lvl,'GCS'+sl('Teasdale 1974'),'<span class="big">'+gc.score+'</span> – '+gc.txt):bx('','GCS','Wybierz E, V, M.');
   H+=bx('','CHA₂DS₂-VA / VASc',lnk('af','moduł AF'));lvl=gc&&gc.lvl==='red'?'red':'ok';}
  if(t==='d'){var r1=N.amts(g('amts')),mcr=document.getElementById('mcr').value,r2=mcr===''?null:N.minicog(+mcr,g('mcc')),r3=N.moca(g('moca'),g('edu')),r5=N.mmse(g('mmse')),cd=document.getElementById('cdr').value,r4=N.fourAT({alert:g('fa'),amt4:+g('fm'),att:+g('ft'),acute:g('fc')});
   H+=bx(r4.lvl,'4AT – majaczenie'+sl('Bellelli 2014'),'<span class="big">'+r4.score+' / 12</span> – '+r4.txt);
   if(r1)H+=bx(r1.lvl,'AMTS'+sl('Hodkinson 1972'),'<span class="big">'+r1.score+' / 10</span> – '+(r1.abn?'nieprawidłowy (≤6)':'prawidłowy'));
   if(r2)H+=bx(r2.lvl,'Mini-Cog'+sl('Borson 2000'),'<span class="big">'+r2.score+' / 5</span> – '+(r2.pos?'dodatni (<3) – dalsza ocena':'ujemny'));
   if(r3)H+=bx(r3.lvl,'MoCA'+sl('Nasreddine 2005'),'<span class="big">'+r3.score+' / 30</span>'+(r3.score!==r3.raw?' (surowy '+r3.raw+' +1)':'')+' – '+(r3.abn?'poniżej normy (<26)':'w normie (≥26)'));
   if(r5)H+=bx(r5.lvl,'MMSE'+sl('Folstein 1975'),'<span class="big">'+r5.score+' / 30</span> – '+r5.cat+'<div class="mut">© PAR – tylko wpis wyniku z licencjonowanego formularza</div>');
   if(cd)H+=bx(+cd>=1?'orange':'ok','CDR'+sl('Morris 1993'),'<b>'+N.CDR.filter(function(c){return c[0]===cd})[0][1]+'</b>');
   H+=bx('','','Skrining ≠ rozpoznanie. Przy majaczeniu testy otępienne niewiarygodne.');}
  return{H:H,lvl:lvl};},
 '<h3>Źródła</h3>'+src(N.SRC)+'<p>'+dw()+': stężenie tenekteplazy (Metalyse 25 mg/5 ml vs 50 mg/10 ml) i protokół szpitala; okno 4,5–9 h / wake-up wg kwalifikacji neurologa; progi Mini-Cog (<3) i AMTS (≤6) różnią się w literaturze.</p>');
var L=SKM.list;for(var i=0;i<L.length;i++)if(L[i].id==='transf'){L.splice(i+1,0,NEU);break;}})();
