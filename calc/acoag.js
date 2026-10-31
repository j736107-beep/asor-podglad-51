(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.acoag=m;}})(this,function(){
// Źródła: ACCP/CHEST (Garcia 2012, Raschke 1993 nomogram), ESC 2023 ACS, ACC/AHA 2025 ACS, ChPL Clexane, ChPL Beriplex P/N, ChPL Praxbind,
// ChPL Ondexxya, ChPL Siarczan protaminy, ACC 2020 ECDP bleeding on OAC, EHRA 2021 NOAC guide, ESC 2019 PE.
var SRC={ACCP:'ACCP/CHEST 2012 (Garcia) – UFH wg masy (nomogram Raschke)',ESCACS:'ESC 2023 ACS',ACC:'ACC 2020 ECDP – krwawienie u leczonych antykoagulantami',EHRA:'EHRA 2021 Practical Guide NOAC',CLX:'ChPL Clexane (enoksaparyna)',BER:'ChPL Beriplex P/N (4F-PCC)',PRX:'ChPL Praxbind (idarucizumab)',OND:'ChPL Ondexxya (andeksanet alfa)',PROT:'ChPL Siarczan protaminy',VITK:'ChPL Konakion / Vitacon'};
function nz(x){return typeof x==='number'&&isFinite(x);}
var HEP={units:25000,ml:50}; // 25 000 j. w 50 ml = 500 j./ml (DO WERYFIKACJI – protokół szpitala)
function ufh(w,ind){if(!(w>0&&w<=250))return null; // 5.0-D: masa nierealna (>250 kg) → brak wyniku
var c=HEP.units/HEP.ml,o;
 if(ind==='acs'){var b=Math.min(60*w,4000),r=Math.min(12*w,1000);o={bolus:b,rate:r,bolusCap:60*w>4000,rateCap:12*w>1000,txt:'ACS bez PCI (ACC/AHA): 60 j./kg (maks. 4000) + 12 j./kg/h (maks. 1000 j./h); w PCI wg ESC 70–100 j./kg'};}
 else o={bolus:80*w,rate:18*w,txt:'ŻChZZ/ZP: 80 j./kg + 18 j./kg/h'};
 o.mlh=o.rate/c;o.conc=c;return o;}
// Enoksaparyna (ChPL Clexane)
function enox(w,crcl,mode){if(!(w>0&&w<=250))return null;var o={lvl:'ok'};
 if(mode==='proph'){o.dose=40;o.freq='1×/d';if(nz(crcl)&&crcl<30){o.dose=20;o.lvl='orange';o.note='CrCl <30: 20 mg 1×/d';}}
 else{o.dose=w;o.freq='co 12 h';if(nz(crcl)&&crcl<30){o.freq='co 24 h';o.lvl='orange';o.note='CrCl <30: 1 mg/kg co 24 h';}}
 if(nz(crcl)&&crcl<15){o.lvl='red';o.note='CrCl <15: niezalecana (ChPL)';}
 o.ml=o.dose/100; // 100 mg/ml
 if(mode!=='proph'&&w>100){o.lvl=o.lvl==='red'?'red':'orange';o.note2='Masa >100 kg – dawkowanie DO WERYFIKACJI (anty-Xa)';}
 return o;}
// 4F-PCC wg INR (ChPL Beriplex): 25/35/50 j./kg, maks. 2500/3500/5000
function pccInr(w,inr){if(!(w>0&&w<=250&&nz(inr)&&inr>0&&inr<20))return null;if(inr<2)return{iu:0,txt:'INR <2 – PCC wg ChPL nie dotyczy tabeli'};
 var k=inr<4?25:inr<=6?35:50,cap=inr<4?2500:inr<=6?3500:5000,iu=Math.min(k*w,cap);return{perKg:k,iu:iu,cap:k*w>cap,ml:iu/25};}
function vitK(){return{mg:10,txt:'Witamina K 10 mg i.v. powoli (ACC 2020: 5–10 mg)'};}
function idaru(){return{g:5,txt:'Idarucyzumab 5 g i.v. (2 × 2,5 g/50 ml, bolus lub wlew)'};}
// Andeksanet (ChPL Ondexxya): wysoka dawka gdy apiksaban >5 mg / riwaroksaban >10 mg / nieznana, ostatnia dawka <8 h
function andex(drug,lastDose,hoursAgo){var hi=(drug==='api'&&!(lastDose<=5))||(drug==='riva'&&!(lastDose<=10));if(nz(hoursAgo)&&hoursAgo>=8)hi=false;
 return hi?{reg:'wysoka',bolus:800,inf:8,txt:'800 mg bolus (30 mg/min) + 8 mg/min przez 120 min'}:{reg:'niska',bolus:400,inf:4,txt:'400 mg bolus (30 mg/min) + 4 mg/min przez 120 min'};}
function pccXa(w){if(!(w>0&&w<=250))return null;return{iu:50*w,ml:50*w/25,txt:'PCC 50 j./kg (EHRA 2021), gdy brak andeksanetu'};}
// Protamina (ChPL): 1 mg / 100 j. UFH; enoksaparyna: 1 mg/1 mg (<8 h), 0,5 mg/1 mg (>8 h); maks. 50 mg
function protUfh(rateUh,bolusU,hBolus){if(!(nz(rateUh)&&rateUh>0||nz(bolusU)&&bolusU>0))return null;var u=(nz(rateUh)&&rateUh>0?rateUh*2:0)+(nz(bolusU)&&bolusU>0&&nz(hBolus)&&hBolus>=0&&hBolus<=2?bolusU:0);var mg=u/100;return{units:u,mg:Math.min(mg,50),cap:mg>50,ml:Math.min(mg,50)/10};}
function protEnox(mgEnox,hours){if(!(nz(mgEnox)&&mgEnox>0&&mgEnox<=300))return null;var f=nz(hours)&&hours>8?0.5:1,mg=mgEnox*f;return{mg:Math.min(mg,50),cap:mg>50,f:f,ml:Math.min(mg,50)/10};}
return{SRC:SRC,HEP:HEP,ufh:ufh,enox:enox,pccInr:pccInr,vitK:vitK,idaru:idaru,andex:andex,pccXa:pccXa,protUfh:protUfh,protEnox:protEnox};});
