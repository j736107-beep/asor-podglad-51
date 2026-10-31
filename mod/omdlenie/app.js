(function(){
'use strict';
var R=window.RULES,E=window.SyncopeEngine,IDX=E.index(R),$=function(id){return document.getElementById(id)};
var SAFETY='To narzędzie wspomaga decyzję lekarza i nie zastępuje oceny klinicznej. Sugerowany kolor wynika z kryteriów ESC 2018 i Canadian Syncope Risk Score i może nie uwzględniać wszystkich okoliczności. Ostateczną decyzję o hospitalizacji, obserwacji lub wypisie podejmuje lekarz prowadzący. Aplikacja nie jest certyfikowanym wyrobem medycznym. Nie wprowadzaj danych umożliwiających identyfikację pacjenta. Dane nie są zapisywane ani wysyłane. Nie stosować u chorych z poważną przyczyną rozpoznaną na SOR, po urazie głowy z utratą przytomności, z T-LOC >5 min, napadem padaczkowym lub intoksykacją.';
var STEPS=R.groups.map(function(g){return{id:g.id,title:g.title}});
var state,step=0,current,ov=null,settings=load();
function load(){try{return Object.assign({},R.defaults,JSON.parse(localStorage.getItem('omdl_settings')||'{}'))}catch(e){return Object.assign({},R.defaults)}}
function fresh(){state={answers:{},troponin:null,dx:null}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function show(id){['form','result','settings','sources'].forEach(function(x){$(x).hidden=x!==id});var f=id==='form';$('bar').style.display=f?'flex':'none';$('prog').style.display=f?'block':'none';window.scrollTo(0,0)}
function input(){return{answers:state.answers,troponin:state.troponin||undefined,dx:state.dx||undefined}}
function visible(it){var a=state.answers;if(it.req==='ecg')return a['G-L1']==='no';if(it.req==='arr')return a['G-L1']==='no'&&Object.keys(IDX).some(function(c){return/^G-M/.test(c)&&a[c]==='yes'});return true}
function isGood(it){return it.type==='low'||it.type==='incl'}
function qRow(it){var v=state.answers[it.code],opt=it.req==='opt';
 return '<div class="q '+(isGood(it)?'good ':'')+(v?'ans':'unans')+'" id="row-'+it.code+'"><div class="ql"><span class="code">'+it.code+'</span>'+esc(it.label)+(it.pts!==undefined?' <span class="pts">('+E.fmt(it.pts)+' pkt)</span>':'')+(opt?' <span class="opt">· opcjonalnie</span>':'')+'</div>'+
 '<div class="yn"><button class="y'+(v==='yes'?' sel':'')+'" data-c="'+it.code+'" data-v="yes">TAK</button><button class="n'+(v==='no'?' sel':'')+'" data-c="'+it.code+'" data-v="no">NIE</button></div></div>'}
function choice(key,code,title,opts){var v=state[key];return '<div class="q '+(v?'ans':'unans')+'" id="row-'+code+'"><div class="ql"><span class="code">'+code+'</span>'+esc(title)+'</div><div class="yn three">'+opts.map(function(o){return'<button class="c'+(v===o[0]?' sel':'')+'" data-k="'+key+'" data-v="'+o[0]+'">'+esc(o[1])+'</button>'}).join('')+'</div></div>'}
function renderStep(){
 var g=R.groups[step],h='<div class="stepH"><h2>'+(step+1)+'. '+esc(g.title)+'</h2><button class="allno" id="allNo">Pozostałe: NIE</button></div>';
 if(g.id==='G')h+='<div class="note">Najpierw: czy EKG jest prawidłowe? <b>TAK</b> odpowiada NIE na wszystkie nieprawidłowości EKG (także oś, QRS i QTc w CSRS). <b>NIE</b> otwiera szczegółowe pytania.</div>';
 if(g.id==='K')h+='<div class="note">TAK przy K-2…K-7 lub NIE przy „Wiek ≥16 lat” = SZPITAL (nie jest to typowe omdlenie / poza zakresem). Zgłoszenie >24 h = tylko ostrzeżenie.</div>';
 g.items.forEach(function(it){if(visible(it))h+=qRow(it)});
 if(g.id==='L'){h=h.replace('<div class="stepH">','<div class="stepH">');
  h+=choice('troponin','C-4','Troponina (CSRS: podwyższona = +2 pkt)',[['pos','Podwyższona'],['neg','Prawidłowa'],['na','Nieoznaczona']]);
  h+=choice('dx','C-8/9','Rozpoznanie na SOR (CSRS)',[['vaso','Wazowagalne −2'],['cardiac','Kardiogenne +2'],['other','Inne / niejasne 0']]);}
 $('form').innerHTML=h;
 $('btnPrev').style.visibility=step>0?'visible':'hidden';$('btnNext').style.display=step<STEPS.length-1?'':'none';
 progress();
}
function progress(){
 var miss=E.requiredMissing(R,input()),total=0;
 R.groups.forEach(function(g){g.items.forEach(function(it){if(it.req==='always'||(it.req==='ecg'&&state.answers['G-L1']==='no')||(it.req==='arr'&&visible(it)))total++})});total+=2;
 var done=Math.max(0,total-miss.length);$('progFill').style.width=Math.round(100*done/total)+'%';
 $('progTxt').textContent='Odpowiedzi: '+done+' / '+total+(miss.length?' · brakuje '+miss.length:' · komplet ✓');
 var missBy={};miss.forEach(function(m){missBy[m.step]=(missBy[m.step]||0)+1});
 $('steps').innerHTML=STEPS.map(function(s,i){return'<button data-s="'+i+'" class="'+(i===step?'cur':(missBy[s.id]?'':'done'))+'">'+(i+1)+'. '+esc(s.title)+(missBy[s.id]?' ('+missBy[s.id]+')':' ✓')+'</button>'}).join('');
 var cur=$('steps').querySelector('.cur');if(cur&&cur.scrollIntoView)cur.scrollIntoView({inline:'center',block:'nearest'});
 var c=E.csrsScore(R,input());$('sc').textContent=E.fmt(c.score);$('cat').textContent=c.complete?c.category:'niepełny';
}
$('form').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
 if(b.id==='allNo'){R.groups[step].items.forEach(function(it){if(visible(it)&&!state.answers[it.code])state.answers[it.code]='no'});renderStep();return}
 if(b.dataset.c){var c=b.dataset.c;state.answers[c]===b.dataset.v?delete state.answers[c]:state.answers[c]=b.dataset.v;
  if(c==='G-L1'||/^G-M/.test(c)){var y=window.scrollY;renderStep();window.scrollTo(0,y);return}
  var row=$('row-'+c);row.outerHTML=qRow(IDX[c]);progress();return}
 if(b.dataset.k){state[b.dataset.k]=state[b.dataset.k]===b.dataset.v?null:b.dataset.v;var y2=window.scrollY;renderStep();window.scrollTo(0,y2)}});
$('steps').addEventListener('click',function(e){var b=e.target.closest('button[data-s]');if(b){step=+b.dataset.s;renderStep();window.scrollTo(0,0)}});
$('btnPrev').onclick=function(){if(step>0){step--;renderStep();window.scrollTo(0,0)}};
$('btnNext').onclick=function(){if(step<STEPS.length-1){step++;renderStep();window.scrollTo(0,0)}};
function goTo(stepId,code){step=STEPS.findIndex(function(s){return s.id===stepId});show('form');renderStep();
 var el=$('row-'+code);if(el){setTimeout(function(){el.scrollIntoView({block:'center',behavior:'smooth'});el.classList.add('flash');setTimeout(function(){el.classList.remove('flash')},2600)},60)}}
var LAB={red:['CZERWONE','SZPITAL — bezwzględnie zostań w szpitalu','r'],yellow:['ŻÓŁTE','UZUPEŁNIJ DANE','y'],green:['ZIELONE','DOM / diagnostyka ambulatoryjna','g']};
var RULEDESC={K0:'Kwalifikacja — nie jest to typowe omdlenie lub chory poza zakresem (CSRS CMAJ 2016; JAMA IM 2020) → diagnostyka szpitalna',R1:'R1 — ≥1 cecha DUŻA wysokiego ryzyka (ESC 2018 Tab. 6; zalecenie I-B, monitorowanie I-C)',R2:'R2 — cecha mała z warunkiem (ESC 2018 Tab. 6)',R3:'R3 — CSRS ≥ +4 (CSRS CMAJ 2016; JAMA IM 2020)',LAB:'Reguła laboratoryjna z Ustawień (P4/P5)',R4:'R4 — komplet danych i wszystkie warunki niskiego ryzyka (ESC 2018 Tab. 6, Ryc. 6; I-B)',R5:'R5 — ryzyko pośrednie przy komplecie danych → SZPITAL / obserwacja (wariant ostrożny)',MISSING:'Brak wymaganych odpowiedzi — nie można bezpiecznie zakwalifikować do DOMU'};
function renderResult(){
 var r=current,col=ov?ov.color:r.color,L=LAB[col],h='';
 if(col==='red')h+='<button id="mute" class="mute">🔇 Wycisz alarm</button>';
 h+='<div class="light"><i class="r'+(col==='red'?' on':'')+'"></i><i class="y'+(col==='yellow'?' on':'')+'"></i><i class="g'+(col==='green'?' on':'')+'"></i></div>';
 var sub={red:r.rule==='K0'?'Nie jest to typowe omdlenie / wymaga diagnostyki szpitalnej.':r.rule==='R5'?'Ryzyko pośrednie — hospitalizacja lub obserwacja z monitorowaniem EKG.':'Monitorowanie EKG w miejscu z możliwością resuscytacji (ESC: zwykle do 6 h na SOR / do 24 h w szpitalu).',yellow:'Uzupełnij '+r.missing.length+' brakujących odpowiedzi poniżej i naciśnij OCEŃ ponownie.',green:'Komplet danych, niskie ryzyko — wypis do domu / diagnostyka ambulatoryjna, z edukacją chorego (ESC I-B).'}[col];
 h+='<div class="banner b-'+col+'"><div class="big">'+L[0]+'</div><div class="lab">'+L[1]+'</div><div class="sub">'+esc(ov?'':sub)+'</div>';
 if(ov)h+='<div class="sub">⚑ Zmienione przez lekarza z: '+LAB[ov.original][1]+' — '+esc(ov.reason)+'</div>';
 if(r.oosPossible&&!ov)h+='<div class="sub">Brak kryteriów Tab. 7 — rozważ oddział obserwacyjny SOR / szybką ścieżkę (P1).</div>';
 h+='</div>';
 var mh='';if(r.missing.length){mh+='<div class="box warn"><h4>'+(col==='yellow'?'Brakujące dane — dotknij, aby uzupełnić':'Brakujące dane (nie zmieniają decyzji SZPITAL)')+'</h4>';
  r.missing.forEach(function(m){mh+='<button class="miss" data-step="'+m.step+'" data-code="'+esc(m.code)+'"><span><b>'+esc(m.code)+'</b> '+esc(m.label)+'<br><small>krok: '+esc(m.stepTitle)+'</small></span><span class="go">Uzupełnij ▶</span></button>'});mh+='</div>'}
 if(col==='yellow')h+=mh;
 h+='<div class="box"><h4>Reguła decydująca</h4>'+esc(RULEDESC[r.rule])+'</div>';
 if(r.decisive.length){h+='<div class="box"><h4>Powody</h4>';r.decisive.forEach(function(d){h+='<div class="rs"><b>'+esc(d.code)+'</b> '+esc(d.label)+'<small>'+esc(d.src)+(d.rule?' · '+d.rule:'')+'</small></div>'});h+='</div>'}
 if(col!=='yellow')h+=mh;
 var c=r.csrs;h+='<div class="box"><h4>Canadian Syncope Risk Score'+(c.complete?'':' (niepełny)')+'</h4><b style="font-size:22px">'+E.fmt(c.score)+'</b> — ryzyko '+c.category+', SAE w 30 dni ≈ '+c.risk+'% <small>(CSRS CMAJ 2016)</small>';
 c.parts.forEach(function(p){h+='<div class="rs">'+esc(p.code)+' · '+esc(p.label)+' <b>'+E.fmt(p.pts)+'</b></div>'});h+='</div>';
 if(r.warnings.length){h+='<div class="box warn"><h4>⚠ Ostrzeżenia</h4>';r.warnings.forEach(function(w){h+='<div class="rs">'+esc(w)+'</div>'});h+='</div>'}
 if(col==='red')h+='<div class="box"><h4>ESC Tab. 7 — przyjęcie czy OOS?</h4>Za przyjęciem: istotna choroba współistniejąca; uraz po omdleniu; potrzeba pilnej diagnostyki/leczenia niemożliwej inaczej (monitor EKG, echo, test wysiłkowy, EPS, angiografia, dysfunkcja urządzenia); potrzeba leczenia omdlenia. Przy ich braku u części chorych wysokiego ryzyka możliwy oddział obserwacyjny SOR / szybka ścieżka do jednostki omdleń.</div>';
 if(col==='green')h+='<div class="box"><h4>Przy wypisie</h4>Edukacja chorego (omdlenie odruchowe: unikanie wyzwalaczy, manewry przeciwdziałające). Przy nawrotach — skierowanie do poradni omdleń (ESC 2018 Ryc. 6).</div>';
 if(r.color==='red'||r.color==='green'){var other=col==='red'?'green':'red';h+='<div class="box"><h4>Zmień decyzję (N1)</h4><button class="oc '+other+'" style="width:100%" data-ov="'+other+'">Zmień na: '+LAB[other][1]+'</button>';
  h+='<select id="why"><option value="">— uzasadnienie (wymagane przy zmianie na DOM) —</option>'+R.downgradeReasons.map(function(x){return'<option>'+esc(x)+'</option>'}).join('')+'</select><div id="ovErr" style="color:var(--red);margin-top:6px"></div></div>'}
 h+='<div class="row"><button class="ghost" id="back">◀ Popraw dane</button><button class="primary" id="newA">Nowa ocena</button></div>';
 h+='<div class="box" style="margin-top:12px;font-size:12.5px">'+esc(SAFETY)+'</div>';
 $('result').innerHTML=h;show('result');
}
$('result').addEventListener('click',function(e){var t=e.target.closest('button');if(!t)return;
 if(t.dataset.step){goTo(t.dataset.step,t.dataset.code);return}
 if(t.dataset.ov){var res=E.override(current,t.dataset.ov,$('why').value);if(!res.ok){$('ovErr').textContent=res.error;return}ov=res.color===current.color?null:res;renderResult();return}
 if(t.id==='mute'){stopSiren();t.remove();return}
 if(t.id==='back'){stopSiren();show('form');renderStep()}if(t.id==='newA')reset()});
function reset(){stopSiren();fresh();ov=null;current=null;step=0;show('form');renderStep()}
var siren=new Audio('siren.wav');siren.preload='auto';
function playSiren(){if(settings.P_sound===false)return;try{siren.currentTime=0;var p=siren.play();if(p&&p.catch)p.catch(function(){})}catch(e){}
 try{if(navigator.vibrate)navigator.vibrate([400,200,400,200,400,200,800])}catch(e){}}
function stopSiren(){try{siren.pause();siren.currentTime=0}catch(e){}try{if(navigator.vibrate)navigator.vibrate(0)}catch(e){}}
$('btnEval').onclick=function(){current=E.evaluate(R,input(),settings);ov=null;renderResult();if(current.color==='red')playSiren();else stopSiren()};
function opt(key,title,desc,opts){var h='<div class="set"><b>'+title+'</b><small>'+desc+'</small><select data-s="'+key+'">';opts.forEach(function(o){h+='<option value="'+o[0]+'"'+(String(settings[key])===String(o[0])?' selected':'')+'>'+o[1]+'</option>'});return h+'</select></div>'}
function renderSettings(){var h='<div class="box"><h4>Ustawienia reguł (P1–P10)</h4><small>Domyślnie wybrano warianty ostrożne. Zmiany zapisują się tylko w telefonie.</small>';
 h+=opt('P_sound','Dźwięk alarmu','Syrena (ok. 4 s) i wibracja przy wyniku CZERWONYM',[['true','Włączony'],['false','Wyłączony']]);
 h+=opt('P1_splitRed','P1 · Czerwone a OOS','Czy przy braku kryteriów Tab. 7 podpowiadać oddział obserwacyjny',[['false','SZPITAL + podpowiedź Tab. 7'],['true','Pokaż też sugestię OOS / szybkiej ścieżki']]);
 h+=opt('P2_csrsRed','P2 · CSRS ≥ +4','',[['true','Samodzielnie daje SZPITAL'],['false','Tylko jako ryzyko pośrednie (też SZPITAL po komplecie danych)']]);
 h+=opt('P3_csrsGreenMax','P3 · Maks. CSRS dla ZIELONEGO','',[[0,'≤ 0 (średnie +1…+3 = SZPITAL/obserwacja)'],[1,'≤ +1'],[3,'≤ +3 (średnie mogą dać DOM)']]);
 h+=opt('P4_hb','P4 · Hb/Hct obniżone','',[['info','Tylko informacyjnie'],['yellow','Blokuje DOM (→ SZPITAL/obserwacja)'],['red','Daje SZPITAL']]);
 h+=opt('P5_bnp','P5 · BNP/NT-proBNP podwyższone','',[['info','Tylko informacyjnie'],['yellow','Blokuje DOM (→ SZPITAL/obserwacja)'],['red','Daje SZPITAL']]);
 h+=opt('P6_tropMissing','P6 · Brak troponiny','',[['zero','0 pkt (jak w CSRS) + ostrzeżenie'],['yellow','0 pkt + blokuje DOM']]);
 h+=opt('P7_presyncope','P7 · Stan przedomdleniowy','',[['warn','Reguły ESC + ostrzeżenie dla CSRS'],['yellow','Dodatkowo blokuje DOM']]);
 h+='<div class="set"><b>P8 · Definicje EKG</b><small>Wg ESC 2018 Tab. 6 (przegląd DO WERYFIKACJI) — bez opcji.</small></div>';
 h+=opt('P9_requireLow','P9 · DOM wymaga cechy niskiego ryzyka zdarzenia','',[['true','Tak (ESC Ryc. 6)'],['false','Nie — wystarczy brak cech wysokiego ryzyka']]);
 h+=opt('P10_ageThreshold','P10 · Próg „starszego wieku”','',[[60,'≥60 lat'],[65,'≥65 lat'],[75,'≥75 lat']]);
 h+=opt('P10_ageEffect','P10 · Wpływ starszego wieku','',[['warn','Tylko ostrzeżenie'],['yellow','Blokuje DOM']]);
 h+='<div class="row" style="margin-top:10px"><button class="ghost" id="defs">Przywróć domyślne</button><button class="primary" id="setBack">Gotowe</button></div></div>';
 $('settings').innerHTML=h;show('settings')}
$('settings').addEventListener('change',function(e){var k=e.target.dataset.s;if(!k)return;var v=e.target.value;settings[k]=v==='true'?true:v==='false'?false:isNaN(v)?v:Number(v);localStorage.setItem('omdl_settings',JSON.stringify(settings))});
$('settings').addEventListener('click',function(e){if(e.target.id==='defs'){settings=Object.assign({},R.defaults);localStorage.removeItem('omdl_settings');renderSettings()}if(e.target.id==='setBack'){show('form');renderStep()}});
$('btnSet').onclick=renderSettings;
$('btnSrc').onclick=function(){$('sources').innerHTML='<div class="box"><h4>Źródła</h4>'+
['[1] Brignole M i wsp. 2018 ESC Guidelines for the diagnosis and management of syncope. Eur Heart J 2018;39:1883–1948 (Tab. 6, Ryc. 6, Tab. 7).','[2] Practical Instructions for the 2018 ESC Guidelines. Eur Heart J 2018;39:e43–e80.','[3] Thiruganasambandamoorthy V i wsp. Canadian Syncope Risk Score. CMAJ 2016;188(12):E289–E298.','[4] Thiruganasambandamoorthy V i wsp. Multicenter ED Validation of the CSRS. JAMA Intern Med 2020;180(5).','[5–7] San Francisco Syncope Rule (Quinn 2004, 2006; Saccilotto 2011) — tylko informacyjnie.','[8] 2017 ACC/AHA/HRS Syncope Guideline. Circulation 2017;136:e60–e122.','Reguły: '+esc(R.version)+'. Przekład cech ESC własny.'].map(function(x){return'<div class="rs">'+x+'</div>'}).join('')+
'<button class="primary" style="margin-top:10px;width:100%" onclick="document.getElementById(\'btnSrcBack\').click()">Wróć</button><button id="btnSrcBack" hidden></button></div>';show('sources');$('btnSrcBack').onclick=function(){show('form');renderStep()}};

fresh();show('form');renderStep();
})();
