// Troponina / OZW – czyste funkcje (Roche Elecsys hs-TnT, karta lokalna SOR Nowy Targ + ESC 2023)
(function(R){
function algo(i){var c0=i.c0,c1=i.c1,c3=i.c3,oh=i.oh,U=i.url||14;
 if(c0==null)return{k:'none',txt:'Wpisz wynik 0 h.'};
 if(c0>=52)return{k:'in',txt:'RULE-IN (rozpoznanie wstępne): 0 h = '+c0+' ≥ 52 ng/l.'};
 if(c1==null){if(c0<5&&oh!=null&&oh>3)return{k:'out',txt:'RULE-OUT (wykluczenie) jednym oznaczeniem: 0 h = '+c0+' < 5 ng/l i początek bólu > 3 h ('+oh.toFixed(1)+' h) temu.'};
  return{k:'wait',txt:(oh!=null&&oh<=3?'Początek bólu ≤ 3 h – pojedynczy wynik nie wyklucza. ':'')+'Pobierz drugą próbkę po 1 h (lub 2 h).'}}
 var dt=i.dt!=null?i.dt:60,d=c1-c0,A=dt<=90?'1h':'2h',r,ad=Math.abs(d).toFixed(1);
 if(A==='1h'){if(c0<12&&Math.abs(d)<3)r={k:'out',txt:'RULE-OUT 0/1 h: 0 h '+c0+' < 12 i |Δ1h| '+ad+' < 3 ng/l.'};else if(d>=5)r={k:'in',txt:'RULE-IN 0/1 h: Δ1h = '+d.toFixed(1)+' ≥ 5 ng/l.'};else r={k:'obs',txt:'STREFA OBSERWACJI 0/1 h (0 h '+c0+', Δ1h '+d.toFixed(1)+' ng/l).'}}
 else{if(c0<6&&Math.abs(d)<4)r={k:'out',txt:'RULE-OUT 0/2 h: 0 h '+c0+' < 6 i |Δ2h| '+ad+' < 4 ng/l.'};else if(d>=10)r={k:'in',txt:'RULE-IN 0/2 h: Δ2h = '+d.toFixed(1)+' ≥ 10 ng/l.'};else r={k:'obs',txt:'STREFA OBSERWACJI 0/2 h (0 h '+c0+', Δ2h '+d.toFixed(1)+' ng/l).'};r.txt+=' <span class="wer">progi 0/2 h z ESC 2023, nie z karty lokalnej – DO WERYFIKACJI z laboratorium</span>'}
 r.A=A;r.dt=dt;if(dt>180||dt<30)r.txt+=' ⚠️ odstęp '+dt+' min – poza oknem algorytmu.';
 if(r.k==='obs'&&c3!=null){var d3=c3-c0;if(d3>=5&&c3>U)r={k:'in3',txt:'3 h: '+c3+' ng/l (> URL), Δ0–3h '+d3.toFixed(1)+' ≥ 5 → istotna dynamika, traktuj jak rule-in. <span class="wer">DO WERYFIKACJI</span>'};
  else if(Math.abs(d3)<5&&c3<=U)r={k:'out3',txt:'3 h: '+c3+' ng/l ≤ URL, bez istotnej dynamiki (Δ '+d3.toFixed(1)+') → wykluczenie po obserwacji. <span class="wer">DO WERYFIKACJI</span>'};
  else r={k:'obs3',txt:'3 h: '+c3+' ng/l, Δ '+d3.toFixed(1)+' – wynik niejednoznaczny / stabilnie podwyższony (przewlekłe uszkodzenie?).'}}
 return r}
function heart(i){var h=i.h||{},r=i.r||{},e=i.e||{},age=i.age,U=i.url||14;
 var ty=[h.typ===1,h.rad===1,h.diaph===1].filter(Boolean).length,aty=[h.insp===1,h.palp===1,h.atyp===1].filter(Boolean).length;
 var H=(ty>=2&&aty==0)?2:(ty>=1?1:0),E=(e.std||e.avr||e.dew||e.post||e.stemi||e.sgar||e.rv)?2:(e.ti||e.lbbb||e.nonsp||e.well)?1:0;
 var A=age==null?null:age>=65?2:age>=45?1:0,nrf=['htn','dm','lip','smk','fam','obes'].filter(function(k){return r[k]===1}).length,Rk=(r.cad===1||r.pad===1||nrf>=3)?2:nrf>=1?1:0;
 var tv=(i.trops||[]).filter(function(x){return x!=null}),c=tv.length?Math.max.apply(null,tv):-1,T=c<0?null:c<=U?0:c<=3*U?1:2,tot=H+E+(A||0)+Rk+(T||0);
 return{H:H,E:E,A:A,R:Rk,T:T,tot:tot,done:A!=null&&T!=null,cat:tot<=3?'low':tot<=6?'mid':'high',mace:tot<=3?'≈1,7%':tot<=6?'≈12–17%':'≈50–65%'}}
function edacs(i){var a=i.age,sx=i.sex,h=i.h||{},r=i.r||{};if(a==null||!sx)return null;var p=a<=45?2:a>=86?20:2+2*Math.ceil((a-45)/5);if(a<18)p=0;if(sx==='m')p+=6;
 var nrf=['htn','dm','lip','smk','fam'].filter(function(k){return r[k]===1}).length;if(a<=50&&(r.cad===1||nrf>=3))p+=4;if(h.diaph===1)p+=3;if(h.rad===1)p+=5;if(h.insp===1)p-=4;if(h.palp===1)p-=6;return p}
function light(i,a){var e=i.e||{},v=i.v||{},why=[],L=null;var stemi=['stemi','post','rv','dew','sgar'].some(function(k){return e[k]}),vhr=Object.keys(v).some(function(k){return v[k]===1}),isch=e.std||e.ti,ongo=(i.h||{}).ongo===1;
 if(stemi){L='red';why.push('STEMI lub równoważnik w EKG – nie czekaj na troponinę')}
 if(vhr){L='red';why.push('Cecha bardzo wysokiego ryzyka (natychmiastowa strategia inwazyjna &lt;2 h)')}
 if(e.avr||e.well){L='red';why.push(e.avr?'Uniesienie ST w aVR z rozlanymi obniżeniami':'Zespół Wellensa – nie wykonuj próby wysiłkowej')}
 if(a.k==='in'||a.k==='in3'){L='red';why.push('Troponina: rule-in (podejrzenie NSTEMI – zawał bez uniesienia ST)')}
 if(!L){if(a.k==='out'||a.k==='out3'){if(ongo||isch){L='yel';why.push(ongo?'Troponina wykluczająca, ale ból trwa/nawraca':'Troponina wykluczająca, ale niedokrwienne zmiany EKG')}else{L='grn';why.push('Troponina: wykluczenie NSTEMI wg algorytmu')}}
  else if(a.k==='obs'||a.k==='obs3'){L='yel';why.push('Strefa obserwacji algorytmu troponinowego')}else if(a.k==='wait'){L='yel';why.push('Algorytm niezakończony – czekamy na kolejną próbkę')}else L='gry'}
 if(L==='yel'&&isch)why.push('Niedokrwienne EKG (obniżenie ST / odwrócenie T) – wypis niemożliwy');
 return{L:L,why:why,stemi:stemi,vhr:vhr}}
function referral(Hs,ed,r){return Hs.tot>=4||(r||{}).cad===1||(ed!=null&&ed>=16)}
var X={algo:algo,heart:heart,edacs:edacs,light:light,referral:referral};
if(typeof module!=='undefined')module.exports=X;else{R.SK=R.SK||{};R.SK.trop=X}})(typeof window!=='undefined'?window:this);
