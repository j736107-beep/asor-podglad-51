(function(){var C=SK.core,$=function(s,r){return (r||document).querySelector(s)};
var DEF={sound:true,vol:0.7,tone:'bells',units:'conv',fs:16,syr:50};
function load(k,d){try{return Object.assign({},d,JSON.parse(localStorage.getItem(k)||'{}'))}catch(e){return Object.assign({},d)}}
var S=load('sk_settings',DEF),PT=load('sk_patient',{w:'',age:'',sex:'',crea:'',h:'',co:{}}),UN=SK.units,
 LEG=S.units==='mmol'?'si':S.units==='mgdl'?'conv':S.units==='si'?'si':'conv';
// v3.8: jedno globalne ustawienie jednostek (domyślnie mg/dl); kreatynina pacjenta przechowywana kanonicznie (crMg, mg/dl)
if(S.uv!==38){if(PT.crMg==null&&PT.crea!==''&&PT.crea!=null){var _c=C.num(PT.crea);PT.crMg=isFinite(_c)?(S.crea==='umol'?_c/88.42:_c):'';}S.units='conv';delete S.crea;S.uv=38;localStorage.setItem('sk_settings',JSON.stringify(S));}
if(PT.crMg==null)PT.crMg='';delete PT.crea;
cur='dashboard',muted=false,alarms={};
function saveS(){localStorage.setItem('sk_settings',JSON.stringify(S))}function saveP(){localStorage.setItem('sk_patient',JSON.stringify(PT))}
window.SKS={get S(){return S},P:function(){var p=C.patient({w:PT.w,h:PT.h,age:PT.age,sex:PT.sex,crea:PT.crMg,creaU:'mgdl',co:PT.co});return p;},alarm:alarm,saveS:saveS,legacy:function(){return LEG},DEF:DEF,setS:function(k,v){S[k]=v;saveS();applyS();}};
// ---------- alarm: czerwona lampa + syrena ----------
// czas przyjęcia (domyślny początek bilansu płynów): pierwsze uruchomienie po „Następny pacjent”
if(!localStorage.getItem('sk_t0'))localStorage.setItem('sk_t0',String(Date.now()));
var siren=$('#siren');
// syrena WebAudio (niezależna od pliku, odblokowana pierwszym kliknięciem/klawiszem)
var AC=null,osc=null,lfo=null,gn=null,stopT=null;
function ac(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state!=='running')AC.resume();}catch(e){}return AC}
['pointerdown','keydown','touchstart'].forEach(function(ev){document.addEventListener(ev,function(){ac()},{passive:true})});
function sirenStop(){try{window.SORSound&&SORSound.stop()}catch(e){}clearTimeout(stopT);try{siren.pause()}catch(e){}}
function sirenPlay(){sirenStop();try{var len=SORSound.play(S.tone||'bells',S.vol,{repeat:2});}catch(e){}}
function alarm(key,on){var isNew=on&&!alarms[key];if(on)alarms[key]=1;else delete alarms[key];var any=Object.keys(alarms).length>0;$('#lamp').classList.toggle('on',any);
 if(isNew&&S.sound&&!muted){sirenPlay()}
 if(!any){sirenStop()}}
$('#mute').onclick=function(){muted=!muted;this.textContent=muted?'🔇':'🔊';if(muted)sirenStop();else ac();};
$('#lamp').onclick=function(){sirenStop()};
// ---------- pasek pacjenta ----------
function applyS(){document.documentElement.style.setProperty('--fs',S.fs+'px');$('#pcu').textContent=UN.label('crea',S.units);}
function bmiTxt(p){return isFinite(p.bmi)?'BMI '+p.bmi.toFixed(1).replace('.',','):'BMI —';}
function patBar(){var p=SKS.P();$('#ph').classList.toggle('bad',p.hFlag==='red');$('#ph').classList.toggle('warn',p.hFlag==='orange');var bm=$('#pbmi');bm.textContent=bmiTxt(p);bm.title=isFinite(p.bmi)?'BMI = masa / wzrost² ('+C.fmt(p.w,1)+' kg, '+C.fmt(p.h,0)+' cm)':'Podaj masę i wzrost (50–250 cm), aby policzyć BMI';$('#pw').classList.toggle('bad',p.wFlag==='red');$('#pw').classList.toggle('warn',p.wFlag==='orange');
 var gf=$('#pgf');gf.textContent='eGFR '+(isFinite(p.egfr)?C.fmt(p.egfr,0):'—');gf.title='CKD-EPI 2021, ml/min/1,73 m²';gf.style.background=isFinite(p.egfr)&&p.egfr<30?'#ffd9de':isFinite(p.egfr)&&p.egfr<60?'#ffeccc':'';
 $('#pcr').textContent='CrCl '+(isFinite(p.crcl)?C.fmt(p.crcl,0)+' ml/min':(PT.sex?'—':'— (płeć?)'));$('#pcr').style.background=isFinite(p.crcl)&&p.crcl<30?'#ffd9de':isFinite(p.crcl)&&p.crcl<60?'#ffeccc':'';
 document.querySelectorAll('#psex button').forEach(function(b){b.classList.toggle('on',b.dataset.s===PT.sex)});
 document.querySelectorAll('.tg').forEach(function(b){b.classList.toggle('on',!!PT.co[b.dataset.c])});}
$('#pw').value=PT.w;$('#ph').value=PT.h||'';$('#pa').value=PT.age;function pcShow(){$('#pc').value=PT.crMg===''?'':UN.round('crea',UN.fromSI('crea',UN.toSI('crea',+PT.crMg,'conv'),S.units),S.units)}pcShow();
$('#pc').oninput=function(){var x=C.num(this.value);PT.crMg=isFinite(x)?UN.conv('crea',x,S.units,'conv'):'';saveP();patBar();refresh();};
[['#pw','w'],['#ph','h'],['#pa','age']].forEach(function(a){$(a[0]).oninput=function(){PT[a[1]]=this.value;saveP();patBar();refresh();}});
document.querySelectorAll('#psex button').forEach(function(b){b.onclick=function(){PT.sex=b.dataset.s;saveP();patBar();refresh();}});
document.querySelectorAll('.tg').forEach(function(b){b.onclick=function(){PT.co[b.dataset.c]=!PT.co[b.dataset.c];saveP();patBar();refresh();}});
// ---------- nawigacja ----------
// pw25: klasyczne Elektrolity (elyte) ukryte – jedna wersja: Elektrolity SOR (el)
(function(L){for(var i=L.length-1;i>=0;i--)if(L[i]&&L[i].id==='elyte')L.splice(i,1);})(SKM.list);
var MODS=SKM.list,active=null;
function side(){$('#side').innerHTML=MODS.map(function(m){return m.sep?'<hr>':'<button data-id="'+m.id+'" class="'+(m.id===cur?'on ':'')+(m.soon?'soon':'')+'">'+m.icon+' '+m.name+'</button>'}).join('');}
var navS=[];function go(id){if(id===cur){show();return;}navS.push(cur);try{history.pushState({sk:id},'')}catch(e){}cur=id;localStorage.setItem('sk_mod',cur);show();}
function back(){if(!navS.length){if(cur!=='dashboard'){cur='dashboard';localStorage.setItem('sk_mod',cur);show();}return;}cur=navS.pop();localStorage.setItem('sk_mod',cur);show();}
window.addEventListener('popstate',function(){back();});
window.SKS.back=function(){if(navS.length)history.back();else back();};
$('#side').onclick=function(e){var b=e.target.closest('button');if(b){go(b.dataset.id);return;cur=b.dataset.id;localStorage.setItem('sk_mod',cur);show();}};
var navBar=null,navBot=null,navObs=null;
function mkNav(m){var pv=navS.length&&MODS.filter(function(x){return x.id===navS[navS.length-1]})[0],home=m.id==='dashboard';
 navBar=document.createElement('div');navBar.id='skNav';navBar.className='sk-nav';
 var bk=document.createElement('button');bk.id='skBack';bk.type='button';bk.onclick=function(){SKS.back()};bk.hidden=home&&!pv;bk.innerHTML='&#x2190; Wróć'+(pv?' <span>do: '+pv.name+'</span>':' <span>do: Pulpit dyżuru</span>');
 var hm=document.createElement('button');hm.id='skHome';hm.type='button';hm.hidden=home;hm.innerHTML='&#x2302; Pulpit dyżuru';hm.onclick=function(){go('dashboard')};
 navBar.appendChild(bk);navBar.appendChild(hm);
 navBot=document.createElement('div');navBot.id='skNavBot';navBot.className='sk-nav bot';var cl=document.createElement('button');cl.id='skClear';cl.type='button';cl.innerHTML='&#x1F5D1; Wyczyść dane pacjenta';cl.title='Czyści wszystkie dane pacjenta we wszystkich modułach (ustawienia zostają)';cl.onclick=function(){SKS.clearData()};navBot.appendChild(cl);}
function ensureNav(){var el=$('#main');if(!navBar)return;if(el.firstChild!==navBar)el.insertBefore(navBar,el.firstChild);if(el.lastChild!==navBot)el.appendChild(navBot);}
function show(){if(window.SORReport&&active)SORReport.capture(active);side();alarms={};alarm('_',false);var m=MODS.filter(function(x){return x.id===cur})[0]||MODS[0],el=$('#main');active=m;el.className='';if(navObs)navObs.disconnect();el.innerHTML='';mkNav(m);el.appendChild(navBar);
 if(m.frame){el.className='fr';var f=document.createElement('iframe');f.src=m.frame;f.onload=function(){bridge(f,m)};el.appendChild(f);m.sync=function(){sync(f,m)};}
 else m.render(el,SKS);
 ensureNav();if(!navObs)navObs=new MutationObserver(function(){ensureNav()});navObs.observe(el,{childList:true});}
function refresh(){if(active&&active.sync)active.sync();else if(active&&active.update)active.update();}
// ---------- most do modułów v6/v4 (ten sam origin) ----------
function bridge(f,m){var w=f.contentWindow,d=w.document,st=d.createElement('style');
 st.textContent='#startDisc{display:none!important}'+(m.hide||'');d.head.appendChild(st);
 ['pointerdown','keydown','touchstart'].forEach(function(ev){d.addEventListener(ev,function(){ac()},{passive:true})});['input','change'].forEach(function(ev){d.addEventListener(ev,capSoon,true)});
 var P=w.HTMLMediaElement.prototype,op=P.play;P.play=function(){alarm(m.id+':int',true);return Promise.resolve();};
 P.pause=function(){alarm(m.id+':int',false);};
 if(window.SKG)SKG.obs(d.body);new w.MutationObserver(function(){sync(f,m)}).observe(d.body,{childList:true,subtree:true});sync(f,m);}
function setVal(el,v,m,k){v=String(v);if(!el||el.value===v)return;var L=m['_'+k];if(el.value!==''&&el.value!==L)return;el.value=v;m['_'+k]=v;el.dispatchEvent(new Event('input',{bubbles:true}));}
function sync(f,m){var d;try{d=f.contentWindow.document}catch(e){return}if(!d||!d.body)return;var p=SKS.P(),wv=String(PT.w||'');
 var wi=d.getElementById('w');if(wi&&wv)setVal(wi,wv,m,'w');
 if(m.id==='se'){var map={liver:'liver',renal:'renal',heart:'cardiac',preg:'preg'};Object.keys(map).forEach(function(k){var b=d.querySelector('.tg[data-c="'+map[k]+'"]');if(b&&b.classList.contains('on')!==!!PT.co[k])b.click();});
  var cr=d.getElementById('crcl');if(cr&&isFinite(p.crcl))setVal(cr,Math.round(p.crcl),m,'cr');}
 if(m.id==='el'){var ea=d.getElementById('age');if(ea&&PT.age!=='')setVal(ea,String(PT.age),m,'age');if(PT.sex){var eb=d.querySelector('.sx[data-s="'+(PT.sex==='k'||PT.sex==='f'?'f':'m')+'"]');if(eb&&!eb.classList.contains('on'))eb.click();}}
 if(m.id==='trop'){var ag=d.getElementById('age'),sx=d.getElementById('sex');if(ag&&PT.age!=='')setVal(ag,String(PT.age),m,'age');if(sx&&PT.sex)setVal(sx,PT.sex,m,'sex');}
 if(m.red)alarm(m.id+':dom',!!d.querySelector(m.red));}
// ---------- start ----------
applyS();patBar();show();
window.SKS.show=function(id){go(id);};
window.SKS.openPropofol=function(){go('pompy');var f=$('#main iframe');if(!f)return;var set=function(){try{f.contentWindow.location.hash='d/propofol';}catch(e){}};f.addEventListener('load',set);set();};
window.SKS.active=function(){return active};
// migawki modułów do raportu: po zmianie danych (z opóźnieniem) i przy wyjściu z modułu
var capT=null;function capSoon(){clearTimeout(capT);capT=setTimeout(function(){if(window.SORReport&&active)SORReport.capture(active)},900);}
['input','change','click'].forEach(function(ev){$('#main').addEventListener(ev,capSoon,true);});
window.SKS.capSoon=capSoon;
function printParts(){var id=active&&active.id;if(id==='documentation')return['doc','done'];if(id==='fluid')return['fluid'];if(id==='pompy')return['pumps'];if(id==='treatment-log')return['done'];if(id==='trends')return['pw'];if(!id||['dashboard','settings','about','icd10','icd9'].indexOf(id)>=0)return null;return[{module:id}];}
$('#printMod').onclick=function(){if(active&&active.id==='about'&&window.SORAbout){SORAbout.print(SORAbout.state.tab);return;}SORReport.print(printParts()||undefined);};
$('#printAll').onclick=function(){SORReport.print();};
// globalna zmiana jednostek: przelicza wpisane wartości (przechowywane w SI), etykiety i wyniki na żywo, bez przeładowania
window.SKS.setUnits=function(u){u=u==='si'?'si':'conv';if(S.units===u)return;S.units=u;saveS();applyS();pcShow();patBar();
 var y=window.scrollY;show();window.scrollTo(0,y);document.dispatchEvent(new CustomEvent('sk-units',{detail:u}));};
$('#pcu').onclick=function(){SKS.setUnits(S.units==='si'?'conv':'si');};
window.SKS.setP=function(o){var ch=false;if(o.age!=null&&String(PT.age)!==String(o.age)){PT.age=String(o.age);$('#pa').value=PT.age;ch=true}if(o.sex&&PT.sex!==o.sex){PT.sex=o.sex;ch=true}if(o.w!=null&&String(PT.w)!==String(o.w)){PT.w=String(o.w);$('#pw').value=PT.w;ch=true}if(o.crMg!=null&&String(PT.crMg)!==String(o.crMg)){PT.crMg=o.crMg;pcShow();ch=true}if(ch){saveP();patBar();setTimeout(refresh,0);}};
function wipe(){window.SKS.pwMem=null;window.SKS.ordMem=null;try{window.SORClinicalUI?.reset();}catch(e){}
 if(window.SORClearCase)window.SORClearCase();
 Object.keys(localStorage).forEach(function(k){if(k==='sk_settings'||k==='omdl_settings'||k==='sk_mod'||k==='sor_favorites')return;if(k.indexOf('sk_')===0||k.indexOf('omdl_')===0||k.indexOf('se4state:')===0)localStorage.removeItem(k)});location.reload();}
window.SKS.clearData=function(){if(window.SORWypis&&SORWypis.active)return;if(!confirm('Wyczyścić wszystkie dane pacjenta we wszystkich modułach (pasek pacjenta, wklejone wyniki, karta zleceń, wykonane, dokumentacja)? Ustawienia i ulubione zostają.'))return;wipe();};
window.SKS.nextPatient=function(){if(window.SORWypis&&SORWypis.active)return;if(!confirm('Następny pacjent: wyczyścić dane pacjenta i wszystkie moduły, również tekst dokumentacji i trendy? (ustawienia i ulubione zostają)'))return;wipe();};
$('#nextPt').onclick=window.SKS.nextPatient;
if(window.SKG)SKG.obs($('#main'));})();
