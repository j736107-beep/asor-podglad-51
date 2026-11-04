/* Propofol 1% – bolus do sedacji proceduralnej przed kardiowersją elektryczną. Bez sieci, bez zapisu. */
(function(g){'use strict';
var SRC={
 CHPL:'ChPL Propofol 1% MCT/LCT Fresenius 10 mg/ml (RPL 14789), pkt 4.2 i 4.4',
 MB:'Miner JR, Burton JH. Clinical practice advisory: Emergency department procedural sedation with propofol. Ann Emerg Med 2007;50:182–187',
 ACEP:'ACEP Clinical Policy: Procedural Sedation and Analgesia in the Emergency Department. Godwin SA i wsp., Ann Emerg Med 2014;63:247–258'};
var C={conc:10,ind:[0.5,1.0],incMg:[10,20],incKg:0.5,incMin:3,redKg:[0.25,0.5],ageRed:55};
function r1(x){return Math.round(x*10)/10;}
function fm(x){return String(r1(x)).replace('.',',');}
function calc(o){var w=+o.w,age=+o.age,risk=!!o.asa||!!o.unstable,old=isFinite(age)&&age>C.ageRed,red=risk||old;
 if(!(w>0)||w>300)return{ok:false,msg:'Podaj masę ciała (pasek pacjenta lub pole obok).'};
 var r={ok:true,w:w,red:red,old:old,risk:risk,conc:C.conc};
 r.ind={kg:C.ind,mg:[w*C.ind[0],w*C.ind[1]],tag:'ChPL',src:'CHPL',txt:'ChPL: sedacja zabiegowa dorosłych – 0,5–1,0 mg/kg w ciągu 1–5 min, dawkowanie wg odpowiedzi klinicznej.'};
 if(red){r.redInd={kg:C.redKg,mg:[w*C.redKg[0],w*C.redKg[1]],tag:'STANDARD LOKALNY – zatwierdzony przez lekarza',txt:'ChPL: '+(old?'wiek > 55 lat':'')+(old&&risk?' i ':'')+(risk?'ASA III–IV / niestabilność':'')+' – „mogą być wymagane mniejsze dawki i wolniejsze podawanie” (bez liczby). 0,25–0,5 mg/kg – STANDARD LOKALNY zatwierdzony przez lekarza.'};}
 var incKg=w*C.incKg;r.inc={mg:C.incMg,kgMg:incKg,tag:'ChPL / Miner 2007',txt:'Dawki kolejne: ChPL – bolus 10–20 mg (1–2 ml); Miner i Burton 2007 – 0,5 mg/kg co 3 min do uzyskania sedacji.'};
 r.inc.useMg=red?C.incMg[0]:Math.min(C.incMg[1],incKg);
 return r;}
function rng(a,b,u){return fm(a)+'–'+fm(b)+' '+u;}
function html(){return '<details class="card" id="ppb" open><summary><b>Propofol – bolus do sedacji przed kardiowersją elektryczną</b></summary>'+
 '<div class="row"><label>Masa [kg]</label><input id="ppw" inputmode="decimal"></div><div class="row"><label>Wiek [lata]</label><input id="ppa" inputmode="numeric"></div>'+
 '<div class="row"><label><input type="checkbox" id="ppasa"> ASA III–IV</label> <label><input type="checkbox" id="ppun"> Niestabilność hemodynamiczna</label></div><div id="ppo" class="conc"></div></details>';}
function out(r){if(!r.ok)return '<div class="warn">'+r.msg+'</div>';var ml=function(mg){return fm(mg/r.conc)+' ml';};
 var h='<div class="ppbig"><b>Dawka wstępna (ChPL 0,5–1,0 mg/kg):</b> '+rng(r.ind.mg[0],r.ind.mg[1],'mg')+' = <b>'+fm(r.ind.mg[0]/r.conc)+'–'+fm(r.ind.mg[1]/r.conc)+' ml</b> propofolu 1% (10 mg/ml), powoli w ciągu 1–5 min <span class="tag lok">ChPL</span></div>';
 if(r.red)h+='<div class="ppbig warn"><b>Zmniejszona dawka wstępna (0,25–0,5 mg/kg):</b> '+rng(r.redInd.mg[0],r.redInd.mg[1],'mg')+' = <b>'+fm(r.redInd.mg[0]/r.conc)+'–'+fm(r.redInd.mg[1]/r.conc)+' ml</b> <span class="tag dec">DO DECYZJI LEKARZA</span><br><small>'+r.redInd.txt+'</small></div>';
 h+='<div class="ppbig"><b>Dawki kolejne:</b> 10–20 mg = 1–2 ml (ChPL)'+(r.red?'':'; wg Miner 2007 0,5 mg/kg = '+fm(r.inc.kgMg)+' mg = '+ml(r.inc.kgMg))+', co 3 min (Miner 2007) do uzyskania sedacji. Odstęp 1–3 min i liczba dawek <span class="tag ok">STANDARD LOKALNY – zatwierdzony przez lekarza</span></div>';
 h+='<div class="warn"><b>Ostrożnie:</b> ChPL nie podaje dawki maksymalnej dla sedacji zabiegowej – dawkuj do efektu. Działania: spadek ciśnienia, bezdech, niedrożność dróg oddechowych, desaturacja (ChPL 4.4). Przy niestabilności rozważ kardiowersję ze wsparciem anestezjologa.</div>';
 h+='<div class="bp"><b>Monitorowanie i warunki (ChPL 4.2, 4.4; ACEP 2014):</b><ul><li>stale EKG i pulsoksymetria (SpO₂), ciśnienie tętnicze;</li><li>kapnografia – ACEP 2014 (zalecenie poziomu B: może pomóc wcześniej wykryć hipowentylację);</li><li>natychmiastowy dostęp do sprzętu do udrażniania dróg oddechowych, wentylacji, tlenu i resuscytacji;</li><li>propofolu nie podaje osoba wykonująca zabieg; wg ChPL – lekarz z doświadczeniem w anestezjologii / intensywnej terapii (lokalne zasady obecności anestezjologa <span class="tag dec">DO DECYZJI LEKARZA</span>);</li><li>pomiar RR przed sedacją, po każdej dawce i do wybudzenia – częstość <span class="tag dec">DO DECYZJI LEKARZA</span>.</li></ul></div>';
 h+='<p class="src">Źródła: '+SRC.CHPL+'; '+SRC.MB+'; '+SRC.ACEP+'.</p>';return h;}
function bind($,pw){var X=null;try{X=parent.SKS&&parent.SKS.P?parent.SKS.P():null;}catch(e){}
 var w=$('#ppw'),a=$('#ppa');if(!w)return;w.value=pw()||'';if(X&&isFinite(X.age))a.value=X.age;
 function up(){$('#ppo').innerHTML=out(calc({w:parseFloat(String(w.value).replace(',','.')),age:a.value===''?NaN:+a.value,asa:$('#ppasa').checked,unstable:$('#ppun').checked}));}
 ['#ppw','#ppa'].forEach(function(k){$(k).oninput=up;});['#ppasa','#ppun'].forEach(function(k){$(k).onchange=up;});up();}
var api={calc:calc,out:out,html:html,bind:bind,C:C,SRC:SRC};if(typeof module!=='undefined'&&module.exports)module.exports=api;g.PROPO=api;
})(typeof window!=='undefined'?window:globalThis);
