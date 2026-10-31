(function(){var E=window.EL,S=E.S,f=E.fmt,$=function(s){return document.querySelector(s)};
var KEY='el1state:'+document.title,st={w:NaN,sex:'',age:NaN,dis:'hiperK',lab:{mgu:'mgdl',cau:'mgdl',pu:'mgdl',albu:'gdl'},opt:{},ed:{}};
try{var sv=JSON.parse(localStorage.getItem(KEY)||'null');if(sv)Object.assign(st,sv);}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}}
function num(v){v=String(v==null?'':v).replace(',','.').trim();return v===''?NaN:parseFloat(v);}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]});}
function v(x){return isFinite(x)?String(x).replace('.',','):'';}
// pola laboratoryjne i opcje dla każdego zaburzenia
var LAB={hiperK:[['k','K⁺ [mmol/l]'],['glu','Glikemia [mmol/l]'],['be','BE [mmol/l]']],hipoK:[['k','K⁺ [mmol/l]']],hipoNa:[['na','Na⁺ [mmol/l]'],['glu','Glikemia [mmol/l]']],hiperNa:[['na','Na⁺ [mmol/l]']],
 hipoMg:[['mg','Mg','mgu']],hiperMg:[['mg','Mg','mgu']],hipoCa:[['ca','Ca','cau'],['alb','Albumina','albu']],hiperCa:[['ca','Ca','cau'],['alb','Albumina','albu']],hipoP:[['p','Fosforany','pu']]};
var OPT={hiperK:[['ecg','zmiany EKG'],['arrest','NZK'],['acid','kwasica'],['dig','digoksyna']],hipoK:[['ecg','EKG/niedowład'],['cvc','cewnik centralny'],['dka','DKA/HHS']],
 hipoNa:[['sympt:severe','objawy ciężkie'],['sympt:mod','umiarkowane'],['vol:hypo','hipowolemia'],['vol:eu','euwolemia'],['vol:hyper','hiperwolemia'],['odsRisk','ryzyko ODS']],
 hiperNa:[['acute','ostra <48 h'],['shock','wstrząs']],hipoMg:[['tdp','TdP'],['sympt','objawy/arytmia']],hiperMg:[['sympt','objawy']],hipoCa:[['sympt','objawy'],['ion','Ca zjonizowany']],hiperCa:[['sympt','objawy']],hipoP:[['complex','złożona/długotrwała']]};
var UN={mgu:[['mgdl','mg/dl'],['mmol','mmol/l']],cau:[['mgdl','mg/dl'],['mmol','mmol/l']],pu:[['mgdl','mg/dl'],['mmol','mmol/l']],albu:[['gdl','g/dl'],['gl','g/l']]};
function optOn(k){var p=k.split(':');return p.length>1?st.opt[p[0]]===p[1]:!!st.opt[k];}
function lab(){var h='<div class="lab">';LAB[st.dis].forEach(function(l){var key=l[0]==='ca'&&st.opt.ion?'Ca²⁺ zjonizowany':l[1];h+='<label>'+esc(key)+'<input id="L_'+l[0]+'" data-l="'+l[0]+'" inputmode="decimal" autocomplete="off" value="'+v(st.lab[l[0]])+'">'+(l[2]?'<span class="u">'+UN[l[2]].map(function(u){return'<button data-u="'+l[2]+'" data-v="'+u[0]+'" class="'+(st.lab[l[2]]===u[0]?'on':'')+'">'+u[1]+'</button>'}).join('')+'</span>':'')+'</label>';});
 h+='</div><div class="opt">'+OPT[st.dis].map(function(o){return'<button class="tg'+(optOn(o[0])?' on':'')+'" data-o="'+o[0]+'">'+esc(o[1])+'</button>'}).join('')+'</div>';return h;}
function src(l){return'<div class="cmp"><div class="ch">'+(l.some(function(z){return z.t==='W'})&&l.some(function(z){return z.t==='C'})?'Wytyczne i ChPL obok siebie':'Źródła')+'</div>'+l.map(function(z){var q=S[z.k];return'<div class="cr '+z.t+'"><a href="'+q.url+'" target="_blank" rel="noopener">'+esc(q.n)+'</a> '+esc(z.txt)+'</div>'}).join('')+'</div>';}
function edK(){var e=st.ed.kcl||{},r=R();var d=r.kcl||{mmol:20,vol:500,rate:10};var m=e.mmol!=null?e.mmol:d.mmol,vo=e.vol!=null?e.vol:d.vol,ra=e.rate!=null?e.rate:d.rate;return{mmol:m,vol:vo,rate:ra,k:st.lab.k,line:st.opt.cvc?'cvc':'per'};}
function kOut(){var i=edK(),o=E.kcl(i);if(!o)return'<div class="mx">Uzupełnij pola</div>';var h='<div class="out">'+f(i.mmol)+' mmol = '+f(o.ml15)+' ml KCl 15% ('+o.amp+' amp. 10 ml) → '+f(i.vol)+' ml = '+f(o.conc)+' mmol/l · '+f(i.rate)+' mmol/h = <b id="kmlh">'+f(o.mlh)+' ml/h</b> · czas '+f(o.hours)+' h · ≈ +'+f(o.rise)+' mmol/l K⁺</div>';
 o.warn.forEach(function(w){h+='<div class="'+(o.bad?'mx':'rr caution')+'">⚠ '+esc(w)+'</div>'});return h;}
function kRev(){var i=edK(),x=num(($('#krev')||{}).value);if(!(x>0))return'';var mh=E.kclFromMlh(x,i.mmol,i.vol);return f(x)+' ml/h = <b id="krevo">'+f(mh)+' mmol/h</b>'+(mh>(i.k<3?20:10)+1e-9?' <span class="mx">> maks. ChPL</span>':'');}
function edM(){var e=st.ed.mg||{};return{g:e.g!=null?e.g:2,vol:e.vol!=null?e.vol:100,min:e.min!=null?e.min:60,tdp:!!st.opt.tdp};}
function mOut(){var i=edM(),o=E.mgso4(i);if(!o)return'<div class="mx">Uzupełnij pola</div>';var h='<div class="out">'+f(i.g)+' g = '+f(o.ml20)+' ml MgSO₄ 20% ('+o.amp+' amp. 10 ml) = '+f(o.mmol)+' mmol = '+f(o.meq)+' mEq → '+f(i.vol)+' ml w '+f(i.min)+' min = <b id="mmlh">'+f(o.mlh)+' ml/h</b> ('+f(o.gph)+' g/h)</div>';
 o.warn.forEach(function(w){h+='<div class="'+(o.bad?'mx':'rr caution')+'">⚠ '+esc(w)+'</div>'});return h;}
function calcBox(t){if(t==='kcl'){var i=edK();return'<div class="calc"><b>Kalkulator KCl (obie strony)</b><div class="fr"><label>K⁺ [mmol]<input data-ed="kcl.mmol" value="'+v(i.mmol)+'" inputmode="decimal"></label><label>Objętość [ml]<input data-ed="kcl.vol" value="'+v(i.vol)+'" inputmode="decimal"></label><label>Szybkość [mmol/h]<input data-ed="kcl.rate" value="'+v(i.rate)+'" inputmode="decimal"></label></div><div id="kout">'+kOut()+'</div><div class="fr"><label>Pompa [ml/h] → mmol/h<input id="krev" inputmode="decimal"></label><span id="krevout"></span></div></div>';}
 if(t==='mg'){var m=edM();return'<div class="calc"><b>Kalkulator MgSO₄ 20%</b><div class="fr"><label>MgSO₄ [g]<input data-ed="mg.g" value="'+v(m.g)+'" inputmode="decimal"></label><label>Objętość [ml]<input data-ed="mg.vol" value="'+v(m.vol)+'" inputmode="decimal"></label><label>Czas [min]<input data-ed="mg.min" value="'+v(m.min)+'" inputmode="decimal"></label></div><div id="mout">'+mOut()+'</div></div>';}return'';}
function R(){return E.compute({w:st.w,sex:st.sex,age:st.age,dis:st.dis,lab:st.lab,opt:st.opt});}
function item(x){var h='<div class="it">'+(x.lok?'<div class="lok">STANDARD LOKALNY – zatwierdzony przez lekarza</div>':'')+'<div class="nm">'+esc(x.name)+'</div><div class="mk">'+esc(x.main)+'</div>';
 if(x.rows)h+='<table class="rows">'+x.rows.map(function(r){return'<tr><th>'+esc(r[0])+'</th><td>'+esc(r[1])+'</td></tr>'}).join('')+'</table>';
 if(x.edit)h+=calcBox(x.edit);if(x.disc)h+='<div class="rr caution">DO DECYZJI LEKARZA: '+esc(x.disc.replace(/ – DO DECYZJI LEKARZA\.?$/,''))+'</div>';if(x.src)h+=src(x.src);return h+'</div>';}
function result(){$('#res').innerHTML='<div id="labbox">'+lab()+'</div><div id="out"></div>';out();}
function out(){var r=R(),h='';
 if(!r.val){h+='<div class="hint">Wpisz wynik'+(r.W>0?'':' i masę ciała')+'</div>';$('#out').innerHTML=h;return;}
 h+='<div class="sev '+r.lvl+'" id="sev">'+esc(r.val)+' — '+esc(r.sev||'')+'</div>';
 if(!(r.W>0))h+='<div class="rr caution">'+(r.weight==='red'?'Masa poza zakresem 30–250 kg':'Wpisz masę ciała – część dawek zależy od masy')+'</div>';
 r.flags.forEach(function(x){h+='<div class="rr caution">'+esc(x)+'</div>'});
 r.steps.forEach(function(s){h+='<div class="step '+s.k+'">'+(s.lok?'<div class="lok">STANDARD LOKALNY – zatwierdzony przez lekarza</div>':'')+'<h3>'+esc(s.t)+'</h3>'+(s.text?'<p>'+esc(s.text)+'</p>':'')+(s.list?'<ul>'+s.list.map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ul>':'')+(s.items||[]).map(item).join('')+(s.src&&!s.items?src(s.src):'')+'</div>';});
 if(r.formula)h+='<div class="frm">'+esc(r.formula)+(r.W>0?' · 1 l bolus lokalny (570 mmol/l): +'+f(r.d3)+' mmol/l; 1 l 0,9% NaCl: '+(r.d09>=0?'+':'')+f(r.d09)+' mmol/l':'')+'</div>';
 if(r.mon.length)h+='<div class="mc"><div><b>Monitorowanie</b><ul>'+r.mon.map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ul></div><div><b>Kontrola</b><ul>'+r.ctl.map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ul></div></div>';
 $('#out').innerHTML=h;}
function grid(){$('#grid').innerHTML='<div class="dg">'+E.DIS.map(function(d){return'<button class="d'+(st.dis===d[0]?' sel':'')+'" data-k="'+d[0]+'">'+d[2]+'<small>'+d[1]+'</small></button>'}).join('')+'</div>';}
function render(){$('#w').classList.toggle('bad',E.checkWeight(st.w)==='red');grid();result();document.querySelectorAll('.sx').forEach(function(b){b.classList.toggle('on',st.sex===b.dataset.s)});}
function info(){var h='<button class="rs" id="ix" style="float:right">✕</button><h2>Elektrolity SOR</h2><p>Przeliczniki: Ca mg/dl = mmol/l × 4,008; Mg × 2,431; P × 3,097. Ca skorygowany = Ca + 0,02 × (40 − albumina g/l) [mmol/l] = Ca + 0,8 × (4 − albumina g/dl) [mg/dl].</p><h2>STANDARD LOKALNY – zatwierdzony przez lekarza</h2><ol>'+E.LOCAL.map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ol><h2>DO DECYZJI LEKARZA</h2><ol>'+E.DECISIONS.map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ol><h2>Źródła</h2>'+Object.keys(S).map(function(k){return'<div><a href="'+S[k].url+'" target="_blank" rel="noopener">'+esc(S[k].label)+'</a></div>'}).join('');
 var b=$('#infoBox');b.innerHTML=h;b.hidden=false;$('#ix').onclick=function(){b.hidden=true;};}
$('#w').value=v(st.w);$('#age').value=v(st.age);
$('#w').oninput=function(){st.w=num(this.value);save();$('#w').classList.toggle('bad',E.checkWeight(st.w)==='red');if($('#out'))out();else render();};$('#age').oninput=function(){st.age=num(this.value);save();if($('#out'))out();};
document.querySelectorAll('.sx').forEach(function(b){b.onclick=function(){st.sex=st.sex===b.dataset.s?'':b.dataset.s;save();render();}});
$('#info').onclick=info;
$('#grid').addEventListener('click',function(e){var b=e.target.closest('[data-k]');if(!b)return;if(st.dis!==b.dataset.k){st.dis=b.dataset.k;st.opt={};st.ed={};}save();render();});
$('#res').addEventListener('input',function(e){var t=e.target;
 if(t.dataset.l){st.lab[t.dataset.l]=num(t.value);save();out();return;}
 if(t.dataset.ed){var p=t.dataset.ed.split('.');st.ed[p[0]]=st.ed[p[0]]||{};st.ed[p[0]][p[1]]=num(t.value);save();if(p[0]==='kcl'){$('#kout').innerHTML=kOut();$('#krevout').innerHTML=kRev();}else $('#mout').innerHTML=mOut();return;}
 if(t.id==='krev')$('#krevout').innerHTML=kRev();});
$('#res').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
 if(b.dataset.u){var uk=b.dataset.u,old=st.lab[uk],nv=b.dataset.v,ion={mgu:'mg',cau:'ca',pu:'p',albu:'alb'}[uk],x=st.lab[ion];if(old!==nv&&isFinite(x)){if(ion==='alb')x=nv==='gl'?x*10:x/10;else x=nv==='mgdl'?E.toMgdl(ion,x):E.toMmol(ion,x,'mgdl');st.lab[ion]=Math.round(x*100)/100;}st.lab[uk]=nv;save();result();return;}
 if(b.dataset.o){var p=b.dataset.o.split(':');if(p.length>1)st.opt[p[0]]=st.opt[p[0]]===p[1]?'':p[1];else st.opt[p[0]]=!st.opt[p[0]];if(p[0]==='ecg'||p[0]==='arrest'||p[0]==='cvc')delete st.ed.kcl;save();result();}});
render();})();
