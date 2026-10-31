// Pompy SOR v2 (26.10.2026): strzykawka 20/50 ml -> receptura (ampułki + rozcieńczalnik, stałe stężenie), dawka <-> ml/h, korekta przepływu, heparyna (bolus, wlew, nomogram APTT Raschke).
(function(){var E=window.Engine,DB=null,st={};var $=function(s){return document.querySelector(s)};
var AK='sor_pompy_zatw_v2';
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function num(v){v=String(v==null?'':v).replace(',','.').trim();return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(v)?parseFloat(v):(/^-(?:\d+(?:\.\d*)?|\.\d+)$/.test(v)?parseFloat(v):NaN);}
function UL(u){return (DB.unitLabels||{})[u]||u;}
function cu(u){return u==='ug'?'µg':u==='j'?'j.':u;}
function srcs(l){return (l||[]).map(function(k){var s=DB.sources[k];if(!s)return esc(k);return s.url?'<a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.label)+'</a>':esc(s.label);}).join('; ');}
function approvals(){try{return JSON.parse(localStorage.getItem(AK)||'{}')||{}}catch(e){return{}}}
function setApproval(id,on){var a=approvals();if(on)a[id]={at:new Date().toISOString()};else delete a[id];try{localStorage.setItem(AK,JSON.stringify(a))}catch(e){}}
function isLocal(d){return d.status!=='chpl';}
function approved(d){return !isLocal(d)||!!approvals()[d.id];}
function badge(d){return isLocal(d)?'<span class="badge loc">'+esc(DB.localLabel)+(approvals()[d.id]?' · zatwierdzono lokalnie':'')+'</span>':'<span class="badge ok">ZGODNE Z ChPL</span>';}
function parentW(){try{var p=parent.SKS&&parent.SKS.P&&parent.SKS.P();return p&&p.w>0?String(p.w).replace('.',','):''}catch(e){return''}}
function defSyr(){try{return parent.SKS.S.syr||50}catch(e){return 50}}
function home(){$('#title').textContent='Pompy SOR';$('#back').hidden=true;
 $('#main').innerHTML='<input class="search" id="q" placeholder="Szukaj leku…"><div class="list" id="l"></div>'+
 '<button class="link" id="goSet">⚙ Ustawienia: zatwierdzanie standardów lokalnych</button>'+
 '<details class="src"><summary>Receptury wyłączone ('+DB.excluded.length+')</summary><ul>'+DB.excluded.map(function(x){return'<li><b>'+esc(x.name)+'</b>: '+esc(x.reason)+'</li>'}).join('')+'</ul></details>';
 function draw(){var q=$('#q').value.toLowerCase();$('#l').innerHTML=DB.drugs.filter(function(d){return d.name.toLowerCase().indexOf(q)>=0}).map(function(d){return'<button class="dbtn'+(isLocal(d)?' loc':'')+'" data-id="'+d.id+'">'+esc(d.name)+'<small>'+(isLocal(d)?(approvals()[d.id]?'lokalny ✓ zatwierdzony':'STANDARD LOKALNY'):'ChPL')+'</small></button>'}).join('');}
 $('#q').oninput=draw;draw();$('#l').onclick=function(e){var b=e.target.closest('.dbtn');if(b)location.hash='d/'+b.dataset.id;};$('#goSet').onclick=function(){location.hash='ustawienia';};}
function settings(){$('#title').textContent='Ustawienia pomp';$('#back').hidden=false;var a=approvals();
 $('#main').innerHTML='<p class="warn">Receptury oznaczone „'+esc(DB.localLabel)+'” nie wynikają wprost z ChPL. Lekarz zatwierdza je jednorazowo (zapis tylko w tej przeglądarce). Bez zatwierdzenia kalkulator liczy, ale nie przenosi nastawy do rejestru ani raportu.</p>'+
 DB.drugs.filter(isLocal).map(function(d){var r=Object.keys(d.rec).map(function(s){var p=E.recipe(d,+s);return s+' ml: '+E.fmt(p.amount)+' '+cu(d.amp.unit)+' → '+E.fmt(p.conc)+' '+cu(d.amp.unit)+'/ml'}).join(' · ');
  return '<div class="card"><label class="chk"><input type="checkbox" data-ap="'+d.id+'"'+(a[d.id]?' checked':'')+'> <b>'+esc(d.name)+'</b></label><div class="src">'+esc(r)+'<br>'+esc(d.why)+'</div>'+(a[d.id]?'<div class="src">Zatwierdzono: '+esc(new Date(a[d.id].at).toLocaleString('pl-PL'))+'</div>':'')+'</div>';}).join('');
 document.querySelectorAll('[data-ap]').forEach(function(c){c.onchange=function(){var d=DB.drugs.find(function(x){return x.id===c.dataset.ap});
  if(c.checked){var ok=true;try{ok=window.confirm('Zatwierdzam standard lokalny: '+d.name+'. Odpowiedzialność za recepturę ponosi lekarz.');}catch(e){}if(!ok){c.checked=false;return;}}
  setApproval(d.id,c.checked);settings();};});}
function drug(d){$('#title').textContent=d.name;$('#back').hidden=false;
 var SY=Object.keys(d.rec).map(Number).sort(function(a,b){return a-b});
 var s=st[d.id]||(st[d.id]={syr:defSyr(),unit:d.units[0].u,w:parentW(),dose:'',mlh:'',last:'dose',dil:d.diluents.length===1?d.diluents[0]:''});
 if(SY.indexOf(s.syr)<0)s.syr=SY[SY.length-1];
 var c=cu(d.amp.unit),pk=E.isPerKg(s.unit),loc=isLocal(d);
 $('#main').innerHTML='<div class="hd">'+badge(d)+'<p class="amp">Preparat: <b>'+esc(d.product)+'</b> · <a href="'+esc(d.url)+'" target="_blank" rel="noopener">ChPL</a></p></div>'+
 (loc&&!approved(d)?'<div class="err" id="locw">'+esc(DB.localLabel)+'. Receptura nie wynika wprost z ChPL – przed przeniesieniem nastawy zatwierdź ją w <a href="#ustawienia">ustawieniach</a>.</div>':'')+
 '<div class="tog" id="sy">'+SY.map(function(v){return '<button data-s="'+v+'">STRZYKAWKA '+v+' ml</button>'}).join('')+'</div>'+
 '<div id="pr"></div>'+
 (d.diluted?'<div class="row"><label>Rozcieńczalnik'+(d.id==='amiodaron'?' (tylko G5%)':'')+'</label><select id="dil">'+(d.diluents.length>1?'<option value="">— wybierz —</option>':'')+d.diluents.map(function(x){return '<option'+(s.dil===x?' selected':'')+'>'+esc(x)+'</option>'}).join('')+'</select></div>':'')+
 (d.units.length>1?'<div class="tog" id="ut">'+d.units.map(function(x){return'<button data-u="'+x.u+'">'+esc(UL(x.u))+'</button>'}).join('')+'</div>':'')+
 '<p class="rng" id="r"></p>'+
 (pk?'<div class="row"><label>Masa ciała [kg]</label><input id="w" inputmode="decimal"></div>':'')+
 '<div class="row"><label>Dawka ['+esc(UL(s.unit))+']</label><input id="ds" inputmode="decimal"></div>'+
 '<div class="row"><label>lub przepływ [ml/h]</label><input id="ml" inputmode="decimal"></div>'+
 '<div class="out" id="o"></div>'+
 '<details class="card" id="adj"><summary><b>Korekta przepływu</b></summary><div class="row"><label>Zmień</label><select id="am"><option value="abs">dawkę o (± '+esc(UL(s.unit))+')</option><option value="pct">dawkę o (± %)</option><option value="mlh">przepływ o (± ml/h)</option></select></div><div class="row"><label>Wartość zmiany</label><input id="ax" inputmode="decimal" placeholder="np. 0,05 lub -10"></div><div id="ao" class="conc"></div></details>'+
 (d.heparin?hepHtml(d):'')+(d.glyc?'<div class="warn" id="glyc">'+esc(d.glyc)+'</div>':'')+(d.bolus?'<p class="src">Bolus/nasycenie: '+esc(d.bolus)+'</p>':'')+
 '<div class="src">Dostęp: '+esc(d.access)+' Monitorowanie: '+esc(d.monitor)+'<br>Status: '+esc(d.why)+'</div>'+
 '<p class="src">Źródła: '+srcs(d.src)+'</p>'+
 '<button id="recordCalc" class="pbtn">Przenieś do rejestru leczenia</button><p id="recordStatus" role="status"></p><div class="row"><button id="savePump" class="sbtn">Zapisz nastawę do raportu</button> <button id="printPump" class="sbtn">🖨 Drukuj nastawy</button></div><p id="saveStatus" role="status"></p>';
 if(pk)$('#w').value=s.w;$('#ds').value=s.dose;$('#ml').value=s.mlh;
 var cur={};
 function upd(){document.querySelectorAll('#sy button').forEach(function(b){b.classList.toggle('on',+b.dataset.s===s.syr)});
  document.querySelectorAll('#ut button').forEach(function(b){b.classList.toggle('on',b.dataset.u===s.unit)});
  var p=E.recipe(d,s.syr),o=$('#o');cur={p:p};o.classList.remove('bad');$('#ds').classList.remove('bad');
  var dil=d.diluted?(s.dil||'rozcieńczalnika (wybierz)'):'';
  var ampTxt=E.fmt(p.amps)+' '+(d.heparin?'fiolki':d.id==='pantoprazol'?'fiolki 40 mg':'amp.')+' ('+E.fmt(p.drugVol)+' ml leku)';
  $('#pr').innerHTML='<div class="conc" id="recipe"><div>Receptura: <b>'+ampTxt+'</b>'+(d.diluted?' + <b>'+E.fmt(p.diluent)+' ml</b> '+esc(dil):' bez rozcieńczania')+' = <b>'+s.syr+' ml</b></div><div>Ilość leku: <b>'+E.fmt(p.amount)+' '+c+'</b> · stężenie: <b id="cc">'+E.fmt(p.conc)+' '+c+'/ml</b>'+(d.amp.unit==='mg'&&p.conc<1?' <small>('+E.fmt(p.conc*1000)+' µg/ml)</small>':'')+'</div></div>';
  var R=E.rangeFor(d,s.unit),rt=R.text||'';$('#r').textContent='Zakres: '+rt;$('#r').classList.remove('bad');
  var w=pk?num(s.w):1,ww=pk?E.checkWeight(w):null,wmsg='';
  if(pk){$('#w').classList.toggle('bad',ww==='red');if(ww==='red')wmsg='<div class="err">Nieprawidłowa masa ciała (30–250 kg) — nie liczę.</div>';else if(ww)wmsg='<div class="warn">Nietypowa masa ciała — sprawdź.</div>';
   if(!(w>0)||ww==='red'){o.innerHTML=wmsg||'<div class="s">Podaj masę ciała</div>';cur.ok=false;adjUpd();hepUpd();return;}}
  var dose,mlh;
  if(s.last==='dose'){dose=num(s.dose);mlh=dose>=0?E.toMlh(d,p.conc,s.unit,dose,w):NaN;if(document.activeElement!==$('#ml'))$('#ml').value=isFinite(mlh)&&mlh!=null?E.fmt(mlh,2):'';}
  else{mlh=num(s.mlh);dose=mlh>=0?E.fromMlh(d,p.conc,s.unit,mlh,w):NaN;if(document.activeElement!==$('#ds'))$('#ds').value=isFinite(dose)&&dose!=null?E.fmt(dose):'';}
  if(!isFinite(mlh)||!isFinite(dose)||mlh==null||dose==null){o.innerHTML=wmsg+'<div class="s">Wpisz dawkę lub ml/h</div>';cur.ok=false;adjUpd();hepUpd();return;}
  var aph=E.perHour(p.conc,mlh),a=E.assess(d,s.unit,dose,aph);
  var dh=E.fmt(aph)+' '+c+'/h';if(d.amp.unit==='mg'&&aph<1)dh+=' = '+E.fmt(aph*1000)+' µg/h';if(/\/min$/.test(s.unit))dh+=' = '+E.fmt(aph*(d.amp.unit==='mg'?1000:1)/60)+' '+(d.amp.unit==='mg'?'µg':c)+'/min';if(d.maxD||/\/d$/.test(s.unit))dh+=' = '+E.fmt(aph*24)+' '+c+'/24 h';
  var msgs=[];if(a.flags.indexOf('max')>=0)msgs.push('POWYŻEJ DAWKI MAKSYMALNEJ ('+E.fmt(R.max)+' '+UL(s.unit)+')');if(a.flags.indexOf('maxH')>=0)msgs.push('POWYŻEJ MAKSIMUM: '+d.maxH.text);if(a.flags.indexOf('maxD')>=0)msgs.push('POWYŻEJ MAKSIMUM DOBOWEGO: '+d.maxD.text);
  if(!a.overMax&&(a.flags.indexOf('hi')>=0||a.flags.indexOf('lo')>=0))msgs.push('POZA ZAKRESEM TERAPEUTYCZNYM');
  o.innerHTML=wmsg+'<div class="grid2"><div><div class="lab">Wynik 1 – przepływ</div><div class="v" id="vml">'+E.fmt(mlh,2)+' ml/h</div></div><div><div class="lab">Wynik 2 – dawka leku na godzinę</div><div class="v2" id="vdh">'+dh+'</div></div></div><div class="s">'+E.fmt(dose)+' '+UL(s.unit)+(pk?' × '+E.fmt(w)+' kg':'')+' · strzykawka wystarczy na '+E.fmt(p.finalVol/mlh)+' h</div>'+(msgs.length?'<div class="err" id="oor">'+msgs.join('<br>')+'</div>':'');
  o.classList.toggle('bad',a.out);$('#ds').classList.toggle('bad',a.out);if(a.out){$('#r').textContent='POZA ZAKRESEM — '+rt;$('#r').classList.add('bad');}
  cur={p:p,dose:dose,mlh:mlh,w:w,aph:aph,a:a,ok:!a.overMax};adjUpd();hepUpd();}
 function adjUpd(){var ao=$('#ao');if(!ao)return;var x=num($('#ax').value);if(!cur.mlh&&cur.mlh!==0||!isFinite(x)){ao.innerHTML='<span class="s">Najpierw wylicz bieżący przepływ, potem wpisz zmianę.</span>';return;}
  var r=E.adjust(d,cur.p.conc,s.unit,cur.w,cur.mlh,$('#am').value,x);if(!r){ao.textContent='—';return;}if(r.error){ao.innerHTML='<span class="err">'+esc(r.error)+'</span>';return;}
  var aa=E.assess(d,s.unit,r.newDose,E.perHour(cur.p.conc,r.newMlh));
  ao.innerHTML='Obecnie: '+E.fmt(cur.dose)+' '+UL(s.unit)+' = '+E.fmt(cur.mlh,2)+' ml/h<br><b>Nowa dawka: '+E.fmt(r.newDose)+' '+UL(s.unit)+' → nowy przepływ: <span id="anew">'+E.fmt(r.newMlh,2)+' ml/h</span></b> ('+(r.deltaMlh>=0?'+':'')+E.fmt(r.deltaMlh,2)+' ml/h; '+E.fmt(E.perHour(cur.p.conc,r.newMlh))+' '+c+'/h)'+(aa.out?'<div class="err">'+(aa.overMax?'POWYŻEJ DAWKI MAKSYMALNEJ':'POZA ZAKRESEM')+'</div>':'');}
 function hepUpd(){if(!d.heparin)return;var H=d.heparin,w=num($('#hw').value),bo=H.bolusOpts.find(function(x){return x.k===$('#hb').value}),pkb=num($('#hbk').value),res='';
  if(!(w>0)||E.checkWeight(w)==='red'){$('#hbo').innerHTML='<span class="s">Podaj masę ciała (30–250 kg).</span>';$('#hio').innerHTML='';$('#hao').innerHTML='';return;}
  var b=E.hepBolus(w,pkb,H.vialConc,bo&&bo.cap);$('#hbo').innerHTML=b?'Bolus: <b id="hbu">'+E.fmt(b.units,0)+' j.</b> = <b>'+E.fmt(b.mlVial,2)+' ml</b> z fiolki 5000 j./ml'+(b.capped?' (ograniczono do '+bo.cap+' j.)':'')+'<br><small>'+esc(bo.l)+' – '+srcs([bo.src])+'</small>':'';
  var ik=num($('#hik').value),p=E.recipe(d,s.syr);if(ik>=0){var uh=ik*w,ml=uh/p.conc;$('#hio').innerHTML='Wlew: <b>'+E.fmt(ik)+' j./kg/h × '+E.fmt(w)+' kg = <span id="hiu">'+E.fmt(uh,0)+' j./h</span></b> → <b id="himl">'+E.fmt(ml,2)+' ml/h</b> (stężenie '+E.fmt(p.conc)+' j./ml)'+((ik<15||ik>25)?'<div class="err">POZA ZAKRESEM ChPL 15–25 j./kg/h</div>':'');}else $('#hio').innerHTML='';
  var ap=num($('#hap').value),r=E.raschke(ap,ik,w,p.conc);if(r){$('#hao').innerHTML='<b>'+esc(r.txt)+'</b><br>'+(r.bolusU?'Dodatkowy bolus: <b>'+E.fmt(r.bolusU,0)+' j.</b> = '+E.fmt(r.bolusU/H.vialConc,2)+' ml z fiolki<br>':'')+(r.stopH?'<b>Wstrzymaj wlew na 1 h</b>, potem:<br>':'')+'Nowy wlew: <b>'+E.fmt(r.newUkgh)+' j./kg/h = '+E.fmt(r.newUh,0)+' j./h → <span id="hanew">'+E.fmt(r.newMlh,2)+' ml/h</span></b> (było '+E.fmt(r.oldMlh,2)+' ml/h)<br>Następne APTT za 6 h. <small>Progi APTT w sekundach wg Raschke – lokalny zakres terapeutyczny (odczynnik laboratorium) DO DECYZJI LEKARZA.</small>';}else $('#hao').innerHTML='<span class="s">Wpisz APTT [s] i aktualny wlew j./kg/h.</span>';}
 $('#sy').onclick=function(e){var b=e.target.closest('button');if(b){s.syr=+b.dataset.s;upd();}};
 if($('#ut'))$('#ut').onclick=function(e){var b=e.target.closest('button');if(b&&b.dataset.u!==s.unit){s.unit=b.dataset.u;s.last='dose';s.dose='';s.mlh='';drug(d);}};
 if($('#dil'))$('#dil').onchange=function(){s.dil=this.value;upd();};
 if(pk)$('#w').oninput=function(){s.w=this.value;upd();};
 $('#ds').oninput=function(){s.dose=this.value;s.last='dose';upd();};$('#ml').oninput=function(){s.mlh=this.value;s.last='ml';upd();};
 $('#ax').oninput=adjUpd;$('#am').onchange=adjUpd;
 if(d.heparin){if(!$('#hw').value)$('#hw').value=s.w||parentW();['#hw','#hbk','#hik','#hap'].forEach(function(k){$(k).oninput=hepUpd;});$('#hb').onchange=function(){var bo=d.heparin.bolusOpts.find(function(x){return x.k===$('#hb').value});$('#hbk').value=String(bo.v).replace('.',',');hepUpd();};}
 upd();
 function vgate(){if(!approved(d))throw Error(DB.localLabel+': najpierw zatwierdź recepturę w ustawieniach modułu.');if(d.id==='amiodaron'&&/NaCl/.test(s.dil))throw Error('Amiodaron – wyłącznie glukoza 5%.');if(d.diluted&&d.diluents.indexOf(s.dil)<0)throw Error('Wybierz rozcieńczalnik.');
  if(!cur.ok||!(cur.dose>0)||!(cur.mlh>0))throw Error('Uzupełnij poprawne dane (dawka/ml/h'+(pk?', masa':'')+') i wyjaśnij ostrzeżenia – powyżej dawki maksymalnej nie przenoszę.');}
 function txt(){var p=cur.p;return d.name+' — strzykawka '+s.syr+' ml: '+E.fmt(p.amount)+' '+c+' ('+E.fmt(p.drugVol)+' ml leku'+(d.diluted?' + '+E.fmt(p.diluent)+' ml '+s.dil:', bez rozcieńczania')+'), stężenie '+E.fmt(p.conc)+' '+c+'/ml; dawka '+E.fmt(cur.dose)+' '+UL(s.unit)+' = '+E.fmt(cur.mlh,2)+' ml/h = '+E.fmt(cur.aph)+' '+c+'/h'+(pk?' (masa '+E.fmt(cur.w)+' kg)':'')+(loc?' ['+DB.localLabel+' – zatwierdzono lokalnie]':' [ChPL]');}
 $('#savePump').onclick=function(){try{vgate();if(parent===window||!parent.SORReport)throw Error('Otwórz kalkulator we wspólnym Asystencie SOR.');parent.SORReport.addPump(txt());$('#saveStatus').textContent='Zapisano nastawę do raportu.';}catch(err){$('#saveStatus').textContent=err.message;}};
 $('#printPump').onclick=function(){try{if(parent===window||!parent.SORReport)throw Error('Otwórz kalkulator we wspólnym Asystencie SOR.');parent.SORReport.print(['pumps']);}catch(err){$('#saveStatus').textContent=err.message;}};
 $('#recordCalc').onclick=function(){try{vgate();if(parent===window||!parent.SORTreatment)throw Error('Otwórz kalkulator we wspólnym Asystencie SOR.');var p=cur.p;
  parent.SORTreatment.seed({kind:'infusion',name:d.name,dose:E.fmt(cur.dose)+' '+UL(s.unit),route:'i.v.'+(/CENTRALNY/.test(d.access)?' centralnie':/OBWODOWY/.test(d.access)?' obwodowo':''),amount:E.fmt(p.amount)+' '+c,diluent:d.diluted?s.dil:'bez rozcieńczania',volume:String(p.finalVol).replace('.',','),concentration:E.fmt(p.conc)+' '+c+'/ml',rate:E.fmt(cur.mlh,2),note:(loc?DB.localLabel+' – zatwierdzono lokalnie; ':'Receptura zgodna z ChPL; ')+d.product+' ('+d.url+')'});
  $('#recordStatus').textContent='Przeniesiono do rejestru leczenia.';}catch(err){$('#recordStatus').textContent=err.message;}};
}
function hepHtml(d){var H=d.heparin;return '<details class="card" id="hep" open><summary><b>Heparyna: bolus, wlew j./kg/h, korekta wg APTT (6 h)</b></summary>'+
 '<div class="row"><label>Masa ciała [kg]</label><input id="hw" inputmode="decimal"></div>'+
 '<div class="row"><label>Schemat bolusa</label><select id="hb">'+H.bolusOpts.map(function(o){return'<option value="'+o.k+'">'+esc(o.l)+'</option>'}).join('')+'</select></div>'+
 '<div class="row"><label>Bolus [j./kg]</label><input id="hbk" inputmode="decimal" value="'+H.bolusOpts[0].v+'"></div><div class="conc" id="hbo"></div>'+
 '<div class="row"><label>Wlew [j./kg/h]</label><input id="hik" inputmode="decimal" value="'+String(H.startUkgh)+'"></div><div class="conc" id="hio"></div>'+
 '<div class="row"><label>APTT po 6 h [s]</label><input id="hap" inputmode="decimal"></div><div class="conc" id="hao"></div>'+
 '<table class="nomo"><tr><th>APTT [s]</th><th>Bolus</th><th>Wlew</th></tr><tr><td>&lt;35</td><td>80 j./kg</td><td>+4 j./kg/h</td></tr><tr><td>35–45</td><td>40 j./kg</td><td>+2 j./kg/h</td></tr><tr><td>46–70</td><td>—</td><td>bez zmian</td></tr><tr><td>71–90</td><td>—</td><td>−2 j./kg/h</td></tr><tr><td>&gt;90</td><td>—</td><td>stop 1 h, −3 j./kg/h</td></tr></table>'+
 '<p class="src">Nomogram: '+srcs(['RASCHKE'])+' (poza ChPL). Start Raschke: 80 j./kg + 18 j./kg/h.</p></details>';}
function route(){var h=location.hash.replace('#','');if(h==='ustawienia')return settings();if(h.indexOf('d/')===0){var d=DB.drugs.find(function(x){return x.id===h.slice(2)});if(d)return drug(d);}home();}
$('#back').onclick=function(){location.hash='';};window.onhashchange=route;
DB=window.DRUGS_DB;route();})();
