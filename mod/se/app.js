(function(){var E=window.SE,S=E.S,f=E.fmt,$=function(s){return document.querySelector(s)};
var KEY='se4state:'+document.title,st={w:NaN,zrmDoses:0,crcl:NaN,co:{},sel:null,ed:{},log:[]};
try{var sv=JSON.parse(localStorage.getItem(KEY)||'null');if(sv)Object.assign(st,sv);}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}}
function num(v){v=String(v==null?'':v).replace(',','.').trim();return v===''?NaN:parseFloat(v);}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]});}
var SH={dzp:'Relanium amp. 10 mg/2 ml',midim:'Midanium 5 mg/ml',midiv:'Midanium 5 mg/ml',czp:'Klonazepam amp. 1 mg/1 ml',lzp:'Lorabex amp. 2 mg/1 ml',lev:'Keppra fiol. 500 mg/5 ml',vpa:'Depakine fiol. 400 mg (100 mg/ml)',pht:'Epanutin fiol. 250 mg/5 ml',lcm:'Lakozamid fiol. 200 mg/20 ml',mid3:'Midanium 5 mg/ml, strzykawka 50 ml',pro:'Propofol 1% (10 mg/ml), 50 ml',tpn:'Tiopental 25 mg/ml (1 g w 40 ml)',ket:'Ketalar 50 mg/ml, 50 ml'};
var LINES=[['0–5 min','Stabilizacja · glikemia · tiamina',[]],
 ['5–20 min','I rzut: benzodiazepina — jedna pełna dawka, można powtórzyć RAZ',[['midim','Midazolam','i.m.'],['lzp','Lorazepam','i.v.'],['dzp','Diazepam','i.v.'],['midbuc','Midazolam','podpoliczk./donos.'],['dzpr','Diazepam','doodbytn.'],['midiv','Midazolam','i.v.'],['czp','Klonazepam','i.v.']]],
 ['20–40 min','II rzut: jedna dawka (ESETT: LEV = VPA = fPHT)',[['lev','Lewetyracetam','i.v.'],['vpa','Walproinian','i.v.'],['fos','Fosfenytoina','i.v. (brak w PL)'],['pht','Fenytoina','i.v.'],['pb','Fenobarbital','i.v. (brak w PL)'],['lcm','Lakozamid','i.v.']]],
 ['>40 min','Stan oporny: intubacja + wlew anestetyku z ciągłym EEG',[['mid3','Midazolam','bolus+wlew'],['pro','Propofol','bolus+wlew'],['tpn','Tiopental','bolus+wlew'],['ket','Ketamina','bolus+wlew']]]];
SH.midbuc='Buccolam 10 mg/2 ml · Epistatus 10 mg/1 ml';SH.dzpr='Relsed 10 mg/2,5 ml (mikrowlewka)';SH.fos='Fosfenytoina — brak w RPL';SH.pb='Fenobarbital i.v. — brak w RPL';SH.pht='Epanutin 250 mg/5 ml · Phenytoin Hikma 250 mg/5 ml';
function given(){var g={dzpMg:0};st.log.forEach(function(e){g[e.k]=(g[e.k]||0)+1;if(e.k==='dzp')g.dzpMg+=e.mg||0;});return g;}
function R(){return E.compute({w:st.w,zrmDoses:st.zrmDoses,zrmDzp:0,crcl:st.crcl,co:st.co,given:given()});}
function vals(k,r){var d=E.defaults(k,r),u=st.ed[k]||{},o={};Object.keys(d).forEach(function(x){o[x]=u[x]!=null?u[x]:d[x];});return o;}
function tagLine(x){var n=[],c=false;x.src.forEach(function(s){if(s.t==='C')c=true;else if(s.t==='W'&&n.indexOf(S[s.k].n)<0)n.push(S[s.k].n);});
 return(n.length?'<b>Wytyczne (off-label):</b> '+n.join(', '):'')+(c?(n.length?' · ':'')+'<b>ChPL</b>':'');}
function stage0(r){var z=r.stage0;return'<ol class="s0">'+z.steps.map(function(t){return'<li>'+esc(t)+'</li>'}).join('')+'</ol>'+z.rows.map(function(x){return'<div class="s0r"><b>'+esc(x[0])+':</b> '+esc(x[1])+'</div>'}).join('')+'<div class="st">'+srcLine(z.src)+'</div>';}
function srcLine(l){return'Źródła: '+l.map(function(s){var q=S[s.k];return'<a href="'+q.url+'" target="_blank" rel="noopener">'+esc(q.n==='ChPL'?q.label.replace(/^ChPL /,'ChPL '):q.n)+'</a>'}).join(' · ');}
function grid(r){var h='<div class="tl">';LINES.forEach(function(L,i){h+='<section class="stg s'+i+'"><div class="sh"><span class="tm">'+L[0]+'</span><span class="sn">'+esc(L[1])+'</span></div>';
 if(i===0)h+=r.W>0?stage0(r):'<div class="hint">Wpisz masę ciała</div>';
 if(i===1)h+='<div class="rr '+r.benzoMsg.cls+'" id="bz">'+esc(r.benzoMsg.txt)+'</div>';
 if(L[2].length)h+='<div class="bt">'+L[2].map(function(b){var x=r.drugs[b[0]];
 return'<button class="d '+(x.cls||'')+(x.na?' na':'')+(st.sel===b[0]?' sel':'')+'" data-k="'+b[0]+'">'+b[1]+'<small>'+b[2]+'</small>'+(r.W>0?'<em>'+esc(x.head)+'</em>':'')+'</button>'}).join('')+'</div>';
 h+='<div class="slot" data-slot="'+i+'"></div></section>';});$('#grid').innerHTML=h+'</div>';
 var k=st.sel;if(k){var ln=r.drugs[k].line;var sl=document.querySelector('[data-slot="'+ln+'"]');if(sl)sl.appendChild($('#res'));}}
function out(k,r){var x=r.drugs[k],v=vals(k,r),o=E.edit(k,v,r.W,r),h='';
 if(!o.lines.length)return'<div class="mx">'+esc(o.warn[0]||'Wpisz masę ciała')+'</div>';
 var p=o.lines[0].split(' = ');h+='<div class="mk">'+esc(o.lines[0])+'</div>';
 o.lines.slice(1).forEach(function(l){h+='<div class="ln2">'+esc(l)+'</div>';});
 if(o.bad)o.warn.forEach(function(w){h+='<div class="mx">⚠ '+esc(w)+'</div>';});
 var fz=x.flags.filter(function(z){return z[0]!=='ok'})[0];if(fz)h+='<div class="rr '+fz[0]+'">'+esc(fz[1].split(';')[0].split(' — ')[0])+'</div>';return h;}
function result(){var r=R(),k=st.sel,h='';
 if(!(r.W>0)){$('#res').innerHTML='<div class="hint">'+(r.weight==='red'?'Masa poza zakresem 30–250 kg':'Wpisz masę ciała')+'</div>';return;}
 if(!k){$('#res').innerHTML='<div class="hint">Wybierz lek ↑</div>';return;}
 var x=r.drugs[k],e=E.ED[k],v=vals(k,r);
 h+='<div class="rn">'+esc(SH[k])+'</div>';
 if(x.line===1&&r.benzoTotal>=2)h+='<div class="mx">Już 2 dawki BZD → 2. rzut</div>';
 h+='<div class="fr">'+e.f.map(function(fl){return'<label>'+esc(fl[1])+'<input type="text" inputmode="decimal" autocomplete="off" data-ef="'+fl[0]+'" value="'+f(v[fl[0]])+'"></label>'}).join('')+'<button class="rs" id="rs">↺</button></div>';
 h+='<div id="o">'+out(k,r)+'</div><div class="st">'+tagLine(x)+'</div>';
 h+='<table class="rows">'+x.rows.map(function(rw){return'<tr><th>'+esc(rw[0])+'</th><td>'+esc(rw[1])+'</td></tr>'}).join('')+'</table>';
 var gs=x.src.filter(function(z){return z.t==='W'}),cs=x.src.filter(function(z){return z.t!=='W'});
 h+='<div class="cmp"><div class="ch">'+(gs.length&&cs.length?'Wytyczne i ChPL obok siebie — przy rozbieżności DO DECYZJI LEKARZA':'Źródła dawek')+'</div>'+x.src.map(function(z){var q=S[z.k];return'<div class="cr '+z.t+'"><a href="'+q.url+'" target="_blank" rel="noopener">'+esc(q.n)+'</a> '+esc(z.txt)+'</div>'}).join('')+'</div>';
 h+='<div class="pg"><button class="give" id="give">✔ Podano</button><span class="lg" id="lg"></span></div>';
 $('#res').innerHTML=h;logLine();}
function hhmm(t){var d=new Date(t);return('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);}
function logLine(){var l=$('#lg');if(!l)return;l.innerHTML=st.log.length?st.log.slice(-4).map(function(e){return'<b>'+hhmm(e.t)+'</b> '+esc(e.txt)}).join('<br>')+(st.log.length?' <a href="#" id="clr">wyczyść</a>':''):'brak podań';}
function render(){var r=R();document.body.appendChild($('#res'));$('#w').classList.toggle('bad',r.weight==='red');grid(r);result();
 document.querySelectorAll('.tg').forEach(function(b){b.classList.toggle('on',!!st.co[b.dataset.c])});$('#crr').hidden=!st.co.renal;$('#zn').textContent=st.zrmDoses;}
function info(){var h='<button class="rs" id="ix" style="float:right">✕</button><h2>Stan padaczkowy</h2><p>Napad ≥5 min lub ≥2 napady bez powrotu świadomości (ILAE 2015; PTE 2018).</p><p><b>OIOM:</b> napad trwa mimo benzodiazepiny + leku 2. rzutu (SE oporny) → wlew anestetyku z ciągłym EEG, cel: ustąpienie napadów / burst-suppression, 24–48 h (PTE 2018; NCS 2012).</p><p>Benzodiazepina maks. 2 dawki łącznie z ZRM. Glukoza &lt;60 mg/dl (3,3 mmol/l): tiamina 100 mg, potem 50 ml glukozy 50% (AES 2016).</p><p>Kolory: zielony = preferowany, pomarańczowy = ostrożnie, czerwony = unikać.</p><h2>Źródła</h2>'+Object.keys(S).map(function(k){return'<div><a href="'+S[k].url+'" target="_blank" rel="noopener">'+esc(S[k].label)+'</a></div>'}).join('');
 var b=$('#infoBox');b.innerHTML=h;b.hidden=false;$('#ix').onclick=function(){b.hidden=true;};}
$('#w').value=isFinite(st.w)?String(st.w).replace('.',','):'';$('#crcl').value=isFinite(st.crcl)?st.crcl:'';
$('#w').oninput=function(){st.w=num(this.value);st.ed={};save();render();};
$('#crcl').oninput=function(){st.crcl=num(this.value);save();render();};
$('#zm').onclick=function(){st.zrmDoses=Math.max(0,st.zrmDoses-1);save();render();};$('#zp').onclick=function(){st.zrmDoses=Math.min(3,st.zrmDoses+1);save();render();};
document.querySelectorAll('.tg').forEach(function(b){b.onclick=function(){st.co[b.dataset.c]=!st.co[b.dataset.c];save();render();}});
$('#info').onclick=info;
function table(){var r=R();if(!(r.W>0)){alert('Wpisz masę ciała');return;}var h='<button class="rs" id="ix" style="float:right">✕</button><h2>Tabela dawek — '+f(r.W)+' kg</h2><table class="rows dt"><tr><th>Etap</th><th>Lek / preparat</th><th>Dawka dla masy</th><th>Źródła</th></tr>';
 LINES.forEach(function(L){L[2].forEach(function(b){var x=r.drugs[b[0]];h+='<tr><td>'+L[0]+'</td><td>'+esc(x.name)+'</td><td>'+esc(x.head)+'</td><td>'+x.src.map(function(z){return esc(S[z.k].n)}).filter(function(v,i,a){return a.indexOf(v)===i}).join(', ')+'</td></tr>';});});
 var bx=$('#infoBox');bx.innerHTML=h+'</table>';bx.hidden=false;$('#ix').onclick=function(){bx.hidden=true;};}
$('#tab').onclick=table;
$('#grid').addEventListener('click',function(e){var b=e.target.closest('[data-k]');if(!b)return;st.sel=b.dataset.k;save();render();$('#res').scrollIntoView({behavior:'smooth',block:'nearest'});});
$('#res').addEventListener('input',function(e){var t=e.target;if(!t.dataset.ef)return;var k=st.sel;st.ed[k]=st.ed[k]||{};st.ed[k][t.dataset.ef]=num(t.value);save();$('#o').innerHTML=out(k,R());});
$('#res').addEventListener('click',function(e){if(e.target.id==='rs'){delete st.ed[st.sel];save();render();return;}
 if(e.target.id==='clr'){e.preventDefault();if(confirm('Wyczyścić dziennik podań?')){st.log=[];save();render();}return;}
 if(e.target.id==='give'){var r=R(),k=st.sel,v=vals(k,r),o=E.edit(k,v,r.W,r);if(!o.lines.length)return;
  if(o.bad&&!confirm('Uwaga: '+o.warn.join('; ')+'. Zapisać mimo to?'))return;
  st.log.push({t:Date.now(),k:k,txt:E.logText(k,v,r.W,r),mg:(v.dose!=null?v.dose:v.bolus)});save();render();}});
render();})();
