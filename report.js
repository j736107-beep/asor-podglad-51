// Raport / druk (okno druku przeglądarki, offline): dokumentacja, wykonane, pompy (zapisane nastawy), bilans płynów, moduły użyte u pacjenta.
(function(root,factory){
  var R=factory(root);
  if(typeof module==='object'&&module.exports){module.exports=R;return;}
  root.SORReport=R;
})(typeof window!=='undefined'?window:this,function(root){
  'use strict';
  var PUMPS='sk_pumps',SNAP='sk_snap';
  var SKIP={dashboard:1,documentation:1,trends:1,'treatment-log':1,fluid:1,settings:1,about:1,icd10:1,icd9:1,pompy:1};
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function now(){return new Date().toLocaleString('pl-PL',{timeZone:'Europe/Warsaw',dateStyle:'short',timeStyle:'short'});}
  function hm(ts){return new Date(ts).toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Warsaw'});}
  function jget(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}}
  function jset(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  // ------------- pompy: zapis nastaw -------------
  function pumpList(){var l=jget(PUMPS,[]);return Array.isArray(l)?l.filter(function(x){return x&&typeof x.text==='string'&&Number.isFinite(+x.ts);}):[];}
  function addPump(text){text=String(text||'').trim();if(!text)throw Error('Brak nastawy do zapisania.');var l=pumpList();if(l.length>=100)l.shift();l.push({ts:Date.now(),text:text.slice(0,500)});jset(PUMPS,l);return l;}
  function clearPumps(){try{localStorage.removeItem(PUMPS);}catch(e){}}
  // ------------- migawki modułów (tekst wyników i wpisanych pól) -------------
  var BLOCK={DIV:1,P:1,H1:1,H2:1,H3:1,H4:1,LI:1,TR:1,SECTION:1,TABLE:1,UL:1,OL:1,FIELDSET:1,BR:1,HR:1,LEGEND:1,HEADER:1,MAIN:1};
  function visible(el){if(el.hidden)return false;var w=el.ownerDocument.defaultView;try{var cs=w.getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden')return false;}catch(e){}return true;}
  function walk(n,ctx){
    if(n.nodeType===3){ctx.out.push(n.nodeValue.replace(/\s+/g,' '));return;}
    if(n.nodeType!==1)return;
    var t=n.tagName;
    if(/^(SCRIPT|STYLE|SVG|BUTTON|OPTION|TEXTAREA|NOSCRIPT|IFRAME)$/.test(t)||!visible(n))return;
    if(n.classList&&(n.classList.contains('info')||n.classList.contains('infobox')||n.classList.contains('disc')||n.classList.contains('tabs')||false))return;
    if(n.classList&&n.classList.contains('gcs-box')){var sm=n.querySelector('.gcs-sum');var st=sm?sm.textContent.replace(/\s+/g,' ').trim():'';if(/^GCS =/.test(st)){ctx.filled++;ctx.out.push('\n'+st);}return;}
    if(t==='INPUT'||t==='SELECT'){return;}
    if(t==='LABEL'){var c=n.querySelector('input,select');
      if(c&&n.querySelectorAll('input,select').length===1){
        if(c.type==='checkbox'){if(c.checked){ctx.filled++;ctx.out.push('\n☑ '+n.textContent.replace(/\s+/g,' ').trim());}return;}
        if(c.type==='radio'){if(c.checked){ctx.filled++;ctx.out.push('\n◉ '+n.textContent.replace(/\s+/g,' ').trim());}return;}
        if(c.type==='hidden')return;
        var val=c.tagName==='SELECT'?(c.selectedIndex>0&&c.value!==''?c.options[c.selectedIndex].text:''):c.value;
        if(String(val).trim()==='')return;
        ctx.filled++;var lab=n.textContent.replace(/\s+/g,' ').trim();ctx.out.push('\n'+lab.replace(/\s*$/,'')+': '+String(val).trim());return;}
    }
    var blk=BLOCK[t];if(blk)ctx.out.push('\n');
    if(t==='TD'||t==='TH')ctx.out.push(' | ');
    for(var ch=n.firstChild;ch;ch=ch.nextSibling)walk(ch,ctx);
    if(blk)ctx.out.push('\n');
  }
  // standalone pola (poza label) – uwzględnij jako wypełnione
  function countLoose(root0,ctx){root0.querySelectorAll('input:not([type=hidden]),select').forEach(function(c){if(c.closest('label'))return;if(c.type==='checkbox'||c.type==='radio'){if(c.checked)ctx.filled++;}else if(c.tagName==='SELECT'){if(c.selectedIndex>0&&c.value!=='')ctx.filled++;}else if(String(c.value).trim()!=='')ctx.filled++;});}
  function snapText(rootEl){var ctx={out:[],filled:0};walk(rootEl,ctx);countLoose(rootEl,ctx);
    var txt=ctx.out.join('').replace(/[ \t]+\n/g,'\n').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').replace(/ {2,}/g,' ').trim();
    return{text:txt,filled:ctx.filled};}
  function snaps(){var o=jget(SNAP,{});return o&&typeof o==='object'?o:{};}
  // zapisuje migawkę aktywnego modułu, gdy użytkownik cokolwiek wypełnił
  function capture(mod){
    try{if(!mod||!mod.id||SKIP[mod.id])return;var host=document.getElementById('main'),rootEl=host;
      if(typeof mod.snapshot==='function'){var sn=mod.snapshot();if(sn&&sn.text){var all0=snaps();all0[mod.id]={name:mod.name,ts:Date.now(),text:String(sn.text).slice(0,12000)};jset(SNAP,all0);return;}}
      if(mod.frame){var f=host.querySelector('iframe');if(!f||!f.contentDocument||!f.contentDocument.body)return;rootEl=f.contentDocument.body;}
      var r=snapText(rootEl),all=snaps();
      if(r.filled>0&&r.text){all[mod.id]={name:mod.name,ts:Date.now(),text:r.text.slice(0,12000)};}else delete all[mod.id];
      jset(SNAP,all);}catch(e){}}
  function clearSnaps(){try{localStorage.removeItem(SNAP);}catch(e){}}
  // ------------- składanie raportu -------------
  function patientHtml(){
    var S=root.SKS&&root.SKS.S,p=root.SKS&&root.SKS.P?root.SKS.P():null;if(!p)return '';var U=root.SK&&root.SK.units,C=root.SK&&root.SK.core;
    function f(x,d){return isFinite(x)?C.fmt(x,d):'—';}
    var cr=isFinite(p.crMg)?U.round('crea',U.fromSI('crea',U.toSI('crea',p.crMg,'conv'),S.units),S.units)+' '+U.label('crea',S.units):'—';
    var co=[['liver','wątroba'],['renal','nerki'],['heart','serce'],['preg','ciąża']].filter(function(x){return p.co&&p.co[x[0]];}).map(function(x){return x[1];});
    return '<table><tr><th>Wiek / płeć</th><td>'+f(p.age,0)+' lat / '+({m:'M',f:'K'}[p.sex]||'—')+'</td><th>Masa / wzrost / BMI</th><td>'+(isFinite(p.w)?f(p.w,1):isFinite(p.wRaw)?f(p.wRaw,1)+' (nierealna – nie użyta w obliczeniach)':'—')+' kg / '+f(p.h,0)+' cm / '+(isFinite(p.bmi)?p.bmi.toFixed(1).replace('.',','):'—')+'</td></tr><tr><th>Kreatynina</th><td>'+esc(cr)+'</td><th>CrCl / eGFR</th><td>'+f(p.crcl,0)+' ml/min / '+f(p.egfr,0)+' ml/min/1,73 m²</td></tr><tr><th>Obciążenia</th><td colspan="3">'+(co.length?esc(co.join(', ')):'nie zaznaczono')+'</td></tr></table>';}
  function section(title,html){return html?'<h2>'+esc(title)+'</h2>'+html:'';}
  function docHtml(){var W=root.SORWorkbench&&root.SORWorkbench.getState?root.SORWorkbench.getState():null;if(!W)return '';
    var txt=W.draft&&W.draft.trim()?W.draft:W.compose;if(!txt||!txt.trim())return '';
    var tag=W.draft&&W.draft.trim()?(W.accepted?'tekst zatwierdzony przez lekarza':'TEKST NIEZATWIERDZONY (roboczy)'):'materiał lekarza (niezestawiony do dokumentu)';
    return '<p class="sub">Tryb: '+esc(W.mode)+' · '+esc(tag)+'</p><div class="rp-text">'+esc(txt)+'</div>';}
  function doneHtml(){var h=root.SORDone?root.SORDone.reportHtml():'';var conf=root.SORTreatment&&root.SORTreatment.confirmedText?root.SORTreatment.confirmedText():'';
    if(conf)h+='<h3>Potwierdzone w rejestrze leczenia</h3><div class="rp-text">'+esc(conf)+'</div>';return h;}
  function pumpsHtml(){var l=pumpList();if(!l.length)return '';return '<table><tr><th style="width:12%">Godz.</th><th>Zapisana nastawa (wyliczona przez kalkulator – do weryfikacji przez lekarza)</th></tr>'+l.map(function(x){return '<tr><td>'+hm(x.ts)+'</td><td>'+esc(x.text)+'</td></tr>';}).join('')+'</table>';}
  function fluidHtml(){var p=root.SKS&&root.SKS.P?root.SKS.P():null;return root.SORFluid?root.SORFluid.reportHtml(Date.now(),p&&p.w):'';}
  function modulesHtml(ids){var all=snaps(),keys=Object.keys(all).filter(function(k){return !ids||ids.indexOf(k)>=0;});
    return keys.map(function(k){var s=all[k];return '<h3>'+esc(s.name)+' <span class="sub">(stan z '+hm(s.ts)+')</span></h3><div class="rp-text">'+esc(s.text)+'</div>';}).join('');}
  var TITLES={doc:'Dokumentacja',done:'Co rzeczywiście wykonano',pumps:'Pompy – zapisane nastawy',fluid:'Bilans płynów',modules:'Moduły użyte u pacjenta'};
  function build(parts){
    parts=parts&&parts.length?parts:['doc','done','pumps','fluid','modules'];var out='',any=false;
    var mids=[];parts.forEach(function(p){if(p==='modules')mids=mids.concat(Object.keys(snaps()));else if(p&&p.module)mids.push(p.module);else if(p==='pumps')mids.push('pompy');else if(p==='fluid')mids.push('fluid');});
    parts.forEach(function(p){var h='';
      if(p==='doc')h=docHtml();else if(p==='done')h=doneHtml();else if(p==='pumps')h=pumpsHtml();else if(p==='fluid')h=fluidHtml();else if(p==='modules')h=modulesHtml();
      else if(p&&p.module)h=modulesHtml([p.module]);
      if(h){any=true;out+=section(p&&p.module?'Moduł':TITLES[p],h);}});
    if(!any)out='<p><b>Brak danych do wydruku w wybranym zakresie.</b> Wypełnij moduł lub dodaj wpisy.</p>';
    var title=parts.length>=4?'Raport zbiorczy – Asystent lekarza SOR':'Wydruk – Asystent lekarza SOR';
    return '<h1>'+title+'</h1><div class="sub">Wydruk: '+esc(now())+' (Europe/Warsaw) · Narzędzie pomocnicze – niecertyfikowane</div>'+section('Dane pacjenta',patientHtml())+out+(any&&root.SORSources?root.SORSources.footerHtml(mids):'')+
      '<div class="sig"><div>Lekarz: .......................................</div><div>Podpis i pieczątka<br><br>.......................................</div></div><div class="foot">Asystent lekarza SOR – narzędzie pomocnicze, niecertyfikowane. Wartości i dawki weryfikuje lekarz; wydruk nie zastępuje dokumentacji medycznej szpitala.</div>';}
  function fill(parts){var a=document.getElementById('printArea');if(!a){a=document.createElement('div');a.id='printArea';document.body.appendChild(a);}a.innerHTML=build(parts);return a;}
  function print(parts){var cur=root.SKS&&root.SKS.active?root.SKS.active():null;if(cur)capture(cur);fill(parts);root.print();}
  return{esc:esc,pumpList:pumpList,addPump:addPump,clearPumps:clearPumps,snapText:snapText,capture:capture,snaps:snaps,clearSnaps:clearSnaps,build:build,fill:fill,print:print,SKIP:SKIP};
});
