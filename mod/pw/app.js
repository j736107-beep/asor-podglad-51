(function(){'use strict';
var $=function(s){return document.querySelector(s);},E=PW,ta=$('#paste'),out=$('#out');
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var f=E.fmt,SEVL={crit:'KRYTYCZNE',alert:'PILNE',warn:'UWAGA'};
var MODN={el:'Elektrolity SOR',pompy:'Pompy SOR',cap:'Zapalenie płuc',sepsis:'Sepsa',trop:'Troponina / OZW',dka:'DKA / HHS',acoag:'Antykoagulacja',transf:'Transfuzjologia',gib:'Krwawienie z GI',fluid:'Bilans płynów',pe:'Zatorowość płucna',ahf:'Ostra niewydolność serca',neuro:'Neurologia',af:'AF',tox:'Zatrucia'};
function inApp(){try{return window.parent!==window&&window.parent.SKS&&typeof window.parent.SKS.show==='function';}catch(e){return false;}}
function vals(r){return r.points.map(function(p){return r.sameUnit?p.val:p.v;});}
function abn(p){return!!(p.flag&&/H|L|\*|↑|↓|!/.test(p.flag))||(p.lo!=null&&p.val<p.lo)||(p.hi!=null&&p.val>p.hi);}
function spark(r){var v=vals(r),n=v.length;if(n<2)return'';var lp=r.points[n-1],lo=r.sameUnit?lp.lo:null,hi=r.sameUnit?lp.hi:null;var all=v.slice();if(lo!=null)all.push(lo);if(hi!=null)all.push(hi);
 var mn=Math.min.apply(null,all),mx=Math.max.apply(null,all),sp=(mx-mn)||Math.abs(mx)*.2||1;mn-=sp*.12;mx+=sp*.12;var W=240,H=64,x=function(i){return 14+i*(W-28)/(n-1);},y=function(q){return H-8-(H-24)*(q-mn)/(mx-mn);};
 var band=lo!=null&&hi!=null?'<rect x="0" y="'+y(hi).toFixed(1)+'" width="'+W+'" height="'+(y(lo)-y(hi)).toFixed(1)+'" fill="#e3f2e7"/>':hi!=null?'<line x1="0" x2="'+W+'" y1="'+y(hi).toFixed(1)+'" y2="'+y(hi).toFixed(1)+'" stroke="#1b7a3a" stroke-dasharray="4 3"/>':'';
 var pts=v.map(function(q,i){return x(i).toFixed(1)+','+y(q).toFixed(1);}).join(' ');
 var lab=v.map(function(q,i){return(n<=6||i===0||i===n-1)?'<text x="'+x(i).toFixed(1)+'" y="'+(y(q)-7).toFixed(1)+'" text-anchor="middle" font-size="12" font-weight="700" fill="#111">'+esc(f(q))+'</text>':'';}).join('');
 return '<svg class="pw-spark" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Trend: '+esc(v.map(f).join(' → '))+'">'+band+'<polyline points="'+pts+'" fill="none" stroke="#111" stroke-width="2.5"/>'+v.map(function(q,i){return'<circle cx="'+x(i).toFixed(1)+'" cy="'+y(q).toFixed(1)+'" r="3.5" fill="'+(abn(r.points[i])?'#b71c1c':'#111')+'"/>';}).join('')+lab+'</svg>';}
function rng(p){if(p.lo!=null&&p.hi!=null)return'norma '+f(p.lo)+'–'+f(p.hi);if(p.hi!=null)return'norma < '+f(p.hi);if(p.lo!=null)return'norma > '+f(p.lo);return'';}
function row(r,sev){var p=r.points,l=p[p.length-1],v=vals(r),d='';if(p.length>1){var dv=v[v.length-1]-v[v.length-2];d=(dv>0?'↑ +':dv<0?'↓ −':'→ ')+f(Math.abs(dv));}
 var cls=sev==='crit'?'crit':(sev||abn(l))?'abn':'';var when=l.t!=null?E.fmtT(l.t):'';
 return '<div class="row '+cls+'" data-k="'+esc(r.key)+'"><div class="n">'+esc(r.label)+'</div><div class="v"><b>'+esc(l.raw.replace('.',','))+'</b><span class="u">'+esc(r.unit)+'</span>'+(l.flag?'<span class="fl">'+esc(l.flag)+'</span>':'')+'</div><div class="d" title="zmiana względem poprzedniego wyniku">'+d+'</div><div class="r">'+esc([rng(l),when,p.length>1?p.length+' pomiary':''].filter(Boolean).join(' · '))+(l.unitOk===false?' <span class="unc">jednostka nierozpoznana</span>':'')+(!r.sameUnit?' <span class="unc">różne jednostki – wykres po przeliczeniu</span>':'')+'</div><div class="sp">'+spark(r)+'</div></div>';}
function modBtn(m){if(!m||!inApp())return m&&MODN[m]?'<span class="tag" style="border:1.5px solid #111">'+esc(MODN[m])+'</span>':'';return'<button class="go" data-mod="'+m+'">'+esc(MODN[m]||m)+' →</button>';}
function render(o){var h='';var P=o.parsed,R=P.res,keys=Object.keys(R);
 if(!keys.length&&!P.descs.length){out.innerHTML='<div class="sec"><div class="ok" style="background:#fff7e6;border-color:#a16207;color:#5a3b00">Nie rozpoznano wyników. Sprawdź, czy wklejony tekst zawiera nazwy badań i wartości.</div></div>';return;}
 h+='<section class="sec" id="s-alerts">'+(o.alerts.length?'<div class="bar"><h2>⚠ Nie przeocz</h2><ul>'+o.alerts.map(function(a){return'<li><span class="s '+a.sev+'">'+SEVL[a.sev]+'</span>'+esc(a.text)+'</li>';}).join('')+'</ul></div>':'<div class="ok">Nie wykryto wartości alarmowych według ustawionych progów. Przeczytaj mimo to pełne wyniki.</div>')+'</section>';
 if(o.actions.length)h+='<section class="sec" id="s-act"><h2>Co zrobić teraz</h2><ul class="list">'+o.actions.map(function(a){return'<li><span class="t">'+esc(a.text)+'</span><span class="tag '+a.tag+'">'+(a.tag==='lok'?'STANDARD LOKALNY – zatwierdzony przez lekarza':'DO DECYZJI LEKARZA')+'</span>'+modBtn(a.mod)+'</li>';}).join('')+'</ul></section>';
 if(o.missing.length)h+='<section class="sec" id="s-miss"><h2>Czego brakuje</h2><ul class="list miss">'+o.missing.map(function(m){return'<li><span class="t">'+esc(m)+'</span></li>';}).join('')+'</ul></section>';
 h+='<div class="tiles">';E.GROUPS.forEach(function(g){if(g[0]==='opis'){if(!P.descs.length)return;h+='<section class="tile" data-g="opis"><h3>'+g[1]+'</h3>'+P.descs.map(function(d){var hs=d.hits.slice().sort(function(a,b){return(a.neg?1:0)-(b.neg?1:0);});return'<div class="dsc"><div class="ti">'+esc(d.title)+'</div>'+(hs.length?hs.map(function(x){return'<div class="hit '+(x.neg?'neg':x.sev)+'"><b>'+esc(x.label)+(x.neg?' – zaprzeczone w opisie, sprawdź':'')+'</b>„'+esc(x.snippet)+'”</div>';}).join(''):'<div class="r">Nie znaleziono słów alarmowych – przeczytaj pełny opis.</div>')+'<details><summary>Pełny opis</summary><pre>'+esc(d.text)+'</pre></details></div>';}).join('')+'</section>';return;}
  var ks=keys.filter(function(k){return R[k].group===g[0];});if(!ks.length)return;h+='<section class="tile" data-g="'+g[0]+'"><h3>'+g[1]+'</h3>'+ks.map(function(k){return row(R[k],o.sev[k]);}).join('')+'</section>';});
 h+='</div>';out.innerHTML=h;
 out.querySelectorAll('button.go').forEach(function(b){b.onclick=function(){try{window.parent.SKS.show(b.dataset.mod);window.parent.scrollTo(0,0);}catch(e){}};});}
function run(){var t=ta.value;if(!t.trim()){out.innerHTML='';return;}render(E.analyze(t));}
$('#go').onclick=run;$('#ex').onclick=function(){ta.value=window.PW_SAMPLE;run();};$('#clr').onclick=function(){ta.value='';out.innerHTML='';ta.focus();};
window.PWApp={run:run};
})();
