(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.b3=m;}})(this,function(){
function nz(x){return typeof x==='number'&&isFinite(x);}
var SRC={
 ana:['EAACI 2021 anafilaksja (Muraro 2022)','ERC 2021 / Resuscitation Council UK 2021 – anafilaksja','WAO 2020 Anaphylaxis Guidance','AAAAI/ACAAI Anaphylaxis Practice Parameter 2023','ChPL Adrenalina 1 mg/ml'],
 sep:['Surviving Sepsis Campaign 2021 (SCCM/ESICM)','ChPL Tazocin (piperacylina/tazobaktam)','ChPL Meronem (meropenem)','ChPL ceftriakson','ASHP/IDSA/PIDS/SIDP 2020 – wankomycyna (monitorowanie AUC)'],
 tox:['UK MHRA 2012 / ChPL acetylocysteina i.v. (schemat 21 h, linia 100 mg/l)','Rumack–Matthew (linia 150 mg/l, AACT/ACEP)','AHA 2023 – zatrucia (nalokson)','ERC 2021 – zatrucia','ChPL Naloxone','ChPL Flumazenil (Anexate)'],
 af:['ESC 2024 AF (Van Gelder)','ACC/AHA/ACCP/HRS 2023 AF','ChPL Betaloc (metoprolol i.v.)','ChPL Cordarone (amiodaron)','ChPL Lanoxin (digoksyna)','ChPL Tambocor (flekainid)'],
 gi:['ESGE 2021 – krwawienie z górnego odc. nieżylakowe','ACG 2021 – UGIB','Baveno VII 2022 – nadciśnienie wrotne','ChPL Glypressin (terlipresyna)','ChPL pantoprazol i.v.','Blatchford 2000 (Lancet)']};
// ---------- ANAFILAKSJA ----------
// Adrenalina i.m. 1 mg/ml (ChPL Adrenalina WZF 1 mg/ml, p. 4.2): <6 mies. 0,01 mg/kg; 6 mies.–6 lat 0,15 mg; 6–12 lat 0,3 mg; >12 lat 0,5 mg (tekst ChPL: 10 µg/kg, maks. 0,5 mg).
// Wiek w LATACH (ułamek dozwolony: 0,25 = 3 mies.). Niemowlę <6 mies. bez masy → brak dawki (needW) – dawka stała 0,15 mg byłaby >10× za duża.
function adrIM(w,age){var mg=null,needW=false,note='';
 if(nz(age)&&age>=0&&age<0.5){if(nz(w)&&w>0)mg=Math.round(0.01*w*1000)/1000;else needW=true;note='Niemowlę <6 mies.: 0,01 mg/kg (ChPL) – dawki stałej nie stosować.';}
 else if(nz(age)&&age>=0.5&&age<6){mg=0.15;}
 else if(nz(age)&&age>=6&&age<12){mg=0.3;}
 else{mg=nz(w)&&w>0?Math.min(0.01*w,0.5):0.5;if(nz(w)&&w>0&&w<50&&nz(age)&&age>=12)note='ChPL (tabela wiekowa): >12 lat 0,5 mg; tu 10 µg/kg (maks. 0,5 mg) wg tekstu ChPL – DO DECYZJI LEKARZA.';}
 return{mg:mg,ml:mg==null?null:mg/1,needW:needW,note:note};}
function anaFluid(w,age){if(nz(age)&&age<18&&w>0)return{ml:10*w,txt:'10 ml/kg krystaloidu'};return{ml:[500,1000],txt:'500–1000 ml krystaloidu'};}
function glucagon(){return{lo:1,hi:5,txt:'Glukagon 1–5 mg i.v. w 5 min, potem 5–15 µg/min (beta-bloker)'};}
// ---------- SEPSA ----------
function map(sbp,dbp){return nz(sbp)&&nz(dbp)&&sbp>0&&dbp>0&&sbp<=300&&dbp<=200?(sbp+2*dbp)/3:NaN;}
function sepsis(i){var o={lvl:'ok',w:[]};o.map=nz(i.map)?i.map:map(i.sbp,i.dbp);
 o.hypo=(nz(o.map)&&o.map<65)||(nz(i.sbp)&&i.sbp<90);o.lacHi=nz(i.lac)&&i.lac>=4;
 o.fluid=(o.hypo||o.lacHi)&&i.w>0?30*i.w:0;if(o.hypo||o.lacHi)o.lvl='red';else if(nz(i.lac)&&i.lac>=2)o.lvl='orange';
 o.shock=o.hypo&&nz(i.lac)&&i.lac>2; if(i.heart||i.renal)o.fluidCaution=true;return o;}
function abx(crcl){var c=nz(crcl)?crcl:999,o=[];
 o.push({n:'Piperacylina/tazobaktam',d:c>40?'4,5 g co 6 h':c>=20?'4,5 g co 8 h':'4,5 g co 12 h',adj:c<=40});
 o.push({n:'Meropenem',d:c>50?'1 g co 8 h':c>=26?'1 g co 12 h':c>=10?'0,5 g co 12 h':'0,5 g co 24 h',adj:c<=50});
 o.push({n:'Ceftriakson',d:'2 g co 24 h (bez korekty)',adj:false});
 return o;}
function vancoLoad(w){if(!(w>0))return null;return{lo:25*w,hi:30*w,txt:'25–30 mg/kg nasycająco, dalej wg stężeń/AUC'};}
// ---------- ZATRUCIA ----------
var NAC_CAP=110;
function nac21(w){if(!(w>0))return null;var wc=Math.min(w,NAC_CAP),b=[[150,200,1],[50,500,4],[100,1000,16]];
 return{capped:w>NAC_CAP,w:wc,bags:b.map(function(x){var mg=x[0]*wc;return{mgkg:x[0],mg:mg,ml:mg/200,vol:x[1],h:x[2],mlh:(x[1]+mg/200)/x[2]};}),total:300*wc};}
function paraLine(t,line){if(!nz(t)||t<4||t>24)return NaN;return line*Math.pow(0.5,(t-4)/4);} // linia 100 (UK) / 150 (Rumack); T½ 4 h
function paraDose(mg,w){return w>0&&nz(mg)?mg/w:NaN;}
function para(i){var o={lvl:'ok'};o.mgkg=paraDose(i.mg,i.w);o.uk=paraLine(i.t,100);o.us=paraLine(i.t,150);
 if(nz(i.level)&&nz(o.uk)){o.aboveUK=i.level>=o.uk;o.aboveUS=i.level>=o.us;}
 if(o.aboveUK||(nz(o.mgkg)&&o.mgkg>=150)||i.stag)o.lvl='red';else if(nz(o.mgkg)&&o.mgkg>=75)o.lvl='orange';return o;}
function naloxone(dep){return dep?{start:0.04,txt:'40 µg i.v., powtarzaj co 2–3 min (uzależnienie – ryzyko odstawienia)'}:{start:0.4,txt:'0,4 mg i.v./i.m./i.n., powtarzaj co 2–3 min do 2 mg'};}
function naloxInf(eff){return nz(eff)&&eff>0&&eff<=20?eff*2/3:NaN;} // 2/3 dawki skutecznej na godzinę
function flumazenil(i){var o={lvl:'ok',txt:'0,2 mg i.v. w 15 s, potem 0,1 mg co 60 s, maks. 1 mg',max:1};
 var bad=[];if(i.tca)bad.push('TLPD/leki prodrgawkowe');if(i.chronic)bad.push('przewlekłe BZD');if(i.seiz)bad.push('padaczka');if(i.unk)bad.push('nieznana mieszanina');
 if(bad.length){o.lvl='red';o.bad=bad;}return o;}
// ---------- AF ----------
function cha(i){var s=0;if(i.chf)s++;if(i.htn)s++;if(i.age>=75)s+=2;else if(i.age>=65)s++;if(i.dm)s++;if(i.stroke)s+=2;if(i.vasc)s++;
 var va=s,vasc=s+(i.sex==='f'?1:0);return{va:va,vasc:vasc,oacVA:va>=2?'zalecana':va===1?'rozważ':'nie',oacVASc:(i.sex==='f'?vasc>=3:vasc>=2)?'zalecana':(i.sex==='f'?vasc===2:vasc===1)?'rozważ':'nie'};}
function afRate(w,i){var o=[];o.push({n:'Metoprolol i.v.',d:'2,5–5 mg w 2 min, powtarzaj do 15 mg',lvl:i.hfDecomp?'red':i.hf?'orange':'ok'});
 o.push({n:'Diltiazem i.v.',d:w>0?'0,25 mg/kg = '+fmtn(0.25*w)+' mg w 2 min':'0,25 mg/kg w 2 min',lvl:i.hf||i.hfDecomp?'red':'ok',dw:true});
 o.push({n:'Digoksyna i.v.',d:'0,5 mg, potem 0,25 mg co 6 h, maks. 1,5 mg/24 h',lvl:nz(i.crcl)&&i.crcl<30?'orange':'ok'});
 o.push({n:'Amiodaron i.v.',d:'300 mg w 250 ml G5% w 30–60 min, potem 900 mg/24 h',lvl:'ok'});return o;}
function fmtn(x){return (Math.round(x*10)/10).toString().replace('.',',');}
function afRhythm(w,i){var o=[];if(w>0&&w<=250){var lo=5*w,hi=7*w;o.push({n:'Amiodaron',d:fmtn(lo)+'–'+fmtn(hi)+' mg (5–7 mg/kg) w 1–2 h, potem 50 mg/h, maks. 1,2 g/24 h',lvl:'ok'});
 var fl=Math.min(2*w,150);o.push({n:'Flekainid',d:fmtn(fl)+' mg (2 mg/kg, maks. 150) w 10 min',lvl:i.structural?'red':'ok'});}
 return o;}
// ---------- GI ----------
function gbs(i){var s=0,u=i.urea,hb=i.hb;
 if(nz(u)){if(u>=25)s+=6;else if(u>=10)s+=4;else if(u>=8)s+=3;else if(u>=6.5)s+=2;}
 if(nz(hb)){if(i.sex==='f'){if(hb<10)s+=6;else if(hb<12)s+=1;}else{if(hb<10)s+=6;else if(hb<12)s+=3;else if(hb<13)s+=1;}}
 if(nz(i.sbp)){if(i.sbp<90)s+=3;else if(i.sbp<100)s+=2;else if(i.sbp<110)s+=1;}
 if(nz(i.hr)&&i.hr>=100)s+=1;if(i.melena)s+=1;if(i.syncope)s+=2;if(i.liver)s+=2;if(i.hf)s+=2;
 return{score:s,low:s<=1,lvl:s<=1?'ok':s>=7?'red':'orange'};}
function terli(w){if(!(w>0))return null;var mg=w<50?1:w<=70?1.5:2;return{mg:mg,txt:fmtn(mg)+' mg i.v. co 4 h'};}
function hbThreshold(cardiac){return cardiac?{t:8,target:'≥10 g/dl'}:{t:7,target:'7–9 g/dl'};}
return{SRC:SRC,adrIM:adrIM,anaFluid:anaFluid,glucagon:glucagon,map:map,sepsis:sepsis,abx:abx,vancoLoad:vancoLoad,NAC_CAP:NAC_CAP,nac21:nac21,paraLine:paraLine,para:para,naloxone:naloxone,naloxInf:naloxInf,flumazenil:flumazenil,cha:cha,afRate:afRate,afRhythm:afRhythm,gbs:gbs,terli:terli,hbThreshold:hbThreshold};});
