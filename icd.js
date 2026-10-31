// Rdzeń wyszukiwarki ICD-10 / ICD-9 (offline, bez sieci). Moduł testowalny w Node (tests/icd.cjs).
(function(root,factory){
  var A=factory();
  if(typeof module==='object'&&module.exports){module.exports=A;return;}
  root.SORICD=A;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  var STOP={z:1,w:1,i:1,na:1,do:1,po:1,u:1,o:1,ze:1,we:1,a:1,oraz:1,lub:1};
  // najczęstsze kody SOR (tylko istniejące w bazie trafiają na listę)
  var COMMON10=['J18.9','I21.9','I20.0','K92.2','R55','R07.4','I48','N39.0','A41.9','I63.9','E87.5','E11.1','I50.9','I46.9','J44.1','J45.9','R06.0','R10.4','I26.9','I10','G40.9','R56.8','T78.2','T58','T51.0','S06.0','K29.7','N23','R57.9','E16.2','G45.9','I64','R42','R51','R11'];
  var COMMON9=['99.601','99.621','99.622','99.623','99.624','99.625','99.626','99.630','99.631','96.04','96.05','89.521','89.522','34.041','34.042','89.002','89.005','96.33','88.721','93.921'];
  function norm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/\u00ad/g,'').replace(/[^a-z0-9]+/g,' ').trim();}
  function ncode(s){return String(s==null?'':s).toLowerCase().replace(/[^a-z0-9]/g,'');}
  function buildIndex(db,kind){
    var rows=[],by=Object.create(null),kids=Object.create(null),i,r,e,parent;
    for(i=0;i<db.rows.length;i++){
      r=db.rows[i];
      if(kind==='icd10'){e={c:r[0],n:r[1],m:r[2]||'',lvl:r[0].length===3?0:1,p:r[0].indexOf('.')>0?r[0].split('.')[0]:''};}
      else{e={c:r[0],n:r[1],m:'',lvl:r[2],p:r[3]||'',g:db.groups?db.groups[r[4]]:''};}
      e.nn=norm(e.n);e.w=e.nn.split(' ');e.k=ncode(e.c);e.i=i;
      rows.push(e);by[e.c]=e;
      if(e.p){(kids[e.p]=kids[e.p]||[]).push(e.c);}
    }
    rows.forEach(function(x){x.leaf=!kids[x.c];x.kids=kids[x.c]?kids[x.c].length:0;});
    return {kind:kind,rows:rows,by:by,kids:kids,version:db.v||''};
  }
  function rootOf(c){return c.split('.')[0];}
  function compileSyn(idx,list){
    return (list||[]).map(function(s){
      var codes=[],seen=Object.create(null);
      function add(c){if(idx.by[c]&&!seen[c]){seen[c]=1;codes.push(c);}}
      (s.c||[]).forEach(add);
      (s.r||[]).forEach(function(rg){idx.rows.forEach(function(e){var rt=rootOf(e.c);if(rt>=rg[0]&&rt<=rg[1]&&(s.deep||e.c===rt))add(e.c);});});
      (s.p||[]).forEach(function(p){idx.rows.forEach(function(e){if(e.c.indexOf(p)===0)add(e.c);});});
      return {keys:s.k.map(norm),codes:codes,pos:Object.create(null),src:s};
    }).map(function(x){x.codes.forEach(function(c,i){x.pos[c]=i;});return x;});
  }
  function synForQuery(syn,q){
    var out=[];
    syn.forEach(function(s){for(var i=0;i<s.keys.length;i++){var k=s.keys[i];if(k===q||(q.length>=3&&k.indexOf(q)===0)){out.push(s);return;}}});
    return out;
  }
  function synForToken(syn,t){
    var out=[];
    syn.forEach(function(s){for(var i=0;i<s.keys.length;i++){var k=s.keys[i];if(k.indexOf(' ')<0&&(k===t||(t.length>=3&&k.indexOf(t)===0))){out.push(s);return;}}});
    return out;
  }
  function stem(t){return t.length>=6?t.slice(0,t.length-2):(t.length===5?t.slice(0,4):null);}
  function tokScore(e,t){
    var best=0,st=stem(t),k;
    for(k=0;k<e.w.length;k++){var w=e.w[k];if(w===t)return 3;if(t.length>=3&&w.indexOf(t)===0){if(best<2.5)best=2.5;}else if(st&&w.indexOf(st)===0&&best<1.5)best=1.5;}
    if(!best&&t.length>=4&&e.nn.indexOf(t)>=0)best=.5;
    return best;
  }
  function isCodeQuery(q,kind){var c=String(q).replace(/\s+/g,'').replace(',','.');return kind==='icd10'?/^[A-Za-z]\d[\d.]*$/.test(c):/^[A-Za-z]{0,2}\d[\d.]*$/.test(c);}
  // opts: {syn:compiled, common:[codes], recent:[codes], limit:number}
  function search(idx,q,opts){
    opts=opts||{};var limit=opts.limit||60,syn=opts.syn||[],qs=String(q==null?'':q).trim();
    var commonPos=Object.create(null),recentPos=Object.create(null);
    (opts.common||[]).forEach(function(c,i){if(idx.by[c]&&!(c in commonPos))commonPos[c]=i;});
    (opts.recent||[]).forEach(function(c,i){if(idx.by[c]&&!(c in recentPos))recentPos[c]=i;});
    var res=[];
    if(qs.replace(/\s+/g,'').length<2&&!/\d/.test(qs)){
      var rc=(opts.recent||[]).filter(function(c){return idx.by[c];}).map(function(c){return idx.by[c];});
      var cm=(opts.common||[]).filter(function(c){return idx.by[c];}).map(function(c){return idx.by[c];});
      return {mode:'empty',items:[],recent:rc,common:cm,total:0,synonyms:[]};
    }
    if(isCodeQuery(qs,idx.kind)){
      var c0=qs.replace(/\s+/g,'').replace(',','.').toLowerCase(),qn=ncode(c0),dot=c0.indexOf('.')>=0;
      idx.rows.forEach(function(e){
        if(e.k.indexOf(qn)!==0)return;
        if(dot&&e.c.toLowerCase().indexOf(c0)!==0)return;
        res.push({e:e,s:(e.k===qn?100:50)-e.i*1e-6});
      });
      res.sort(function(a,b){
        if(idx.kind==='icd9'&&a.e.leaf!==b.e.leaf)return a.e.leaf?-1:1;
        return b.s-a.s;});
      return {mode:'code',items:res.slice(0,limit).map(function(x){return x.e;}),total:res.length,synonyms:[]};
    }
    var nq=norm(qs),tokens=nq.split(' ').filter(function(t){return t&&!STOP[t]&&(t.length>1||/\d/.test(t));});
    if(!tokens.length)return {mode:'text',items:[],total:0,synonyms:[]};
    var wholeSyn=synForQuery(syn,nq),wholePos=Object.create(null);
    wholeSyn.forEach(function(s,si){s.codes.forEach(function(c,i){var v=30-si*.5-i*.05;if(!(c in wholePos)||wholePos[c]<v)wholePos[c]=v;});});
    var tokSets=tokens.map(function(t){var set=Object.create(null);synForToken(syn,t).forEach(function(s){s.codes.forEach(function(c){set[c]=1;});});return set;});
    var onlySyn=wholeSyn.length>0&&nq.length<=3;
    idx.rows.forEach(function(e){
      var sum=0,ok=true,t;
      if(onlySyn){if(wholePos[e.c]===undefined)return;}
      for(t=0;t<tokens.length;t++){var sc=tokScore(e,tokens[t]);if((tokSets[t][e.c]||(e.p&&tokSets[t][e.p]))&&sc<2)sc=2;if(!sc){ok=false;break;}sum+=sc;}
      var wp=wholePos[e.c];
      if(!ok&&wp===undefined)return;
      var score=(ok?sum:0)+(wp!==undefined?wp:0)+(e.c in commonPos?1+(40-commonPos[e.c])*.005:0)+(e.c in recentPos?2-recentPos[e.c]*.05:0)+(e.lvl===0&&idx.kind==='icd10'?.3:0)-e.nn.length/20000-e.i*1e-7-(opts.demoteExternal&&/^[VWXY]/.test(e.c)?5:0);
      res.push({e:e,s:score});
    });
    res.sort(function(a,b){if(idx.kind==='icd9'&&a.e.leaf!==b.e.leaf)return a.e.leaf?-1:1;return b.s-a.s;});
    return {mode:'text',items:res.slice(0,limit).map(function(x){return x.e;}),total:res.length,synonyms:wholeSyn.map(function(s){return s.src.k[0];})};
  }
  // ---------- pary kodów: przyczyna zewnętrzna (rozdział XX) ----------
  // Rodzina X4n/X6n/Y1n (n=0..9) wg grupy substancji T36–T65 (ICD-10, tabela substancji; weryfikowane z nazwami w bazie w tests/icd.cjs).
  var FAM=[[36,38,4],[39,39,0],[40,40,2],[41,41,4],[42,43,1],[44,44,3],[45,50,4],[51,51,5],[52,53,6],[54,57,9],[58,59,7],[60,60,8],[61,62,9],[64,65,9]];
  function poisonFamily(code){
    var m=/^T(\d\d)/.exec(code||'');if(!m)return null;var n=+m[1];
    if(n===63)return 'venom';
    for(var i=0;i<FAM.length;i++)if(n>=FAM[i][0]&&n<=FAM[i][1])return FAM[i][2];
    return null;
  }
  function assaultSuggest(code){var n=+/^T(\d\d)/.exec(code)[1];if(n>=36&&n<=50)return 'X85';if(n===54)return 'X86';if(n===60)return 'X87';if(n===58||n===59)return 'X88';return 'X89';}
  function range(idx,a,b,pre){var out=[];for(var n=a;n<=b;n++){var c=pre+(n<10?'0':'')+n;if(idx.by[c])out.push(idx.by[c]);}return out;}
  function pick(idx,list){return list.filter(function(c){return idx.by[c];}).map(function(c){return idx.by[c];});}
  var INJ_OTHER=['W20','W22','W23','W25','W26','W45','W50','W54','W57','X00','X10','X19','X78','X99','Y00','Y04','V03','V09','V89','V99'];
  // zwraca {type, groups:[{id,label,codes:[entry],suggest:entry|null,more:[entry]}], note}
  function externalCauses(idx,code){
    var e=idx.by[code];if(!e||idx.kind!=='icd10')return null;
    var ch=code.charAt(0);if(ch!=='S'&&ch!=='T')return null;
    var fam=poisonFamily(code);
    if(fam==='venom')return {type:'venom',groups:[{id:'venom',label:'Kontakt z jadowitym zwierzęciem lub rośliną (X20–X29)',codes:range(idx,20,29,'X'),suggest:null,more:[]}],note:'Dla tej substancji nie zgadujemy pary: wybierz właściwy kod z grupy.'};
    if(typeof fam==='number'){
      var n=fam,g=[];
      g.push({id:'acc',label:'Przypadkowe zatrucie',codes:pick(idx,['X4'+n]),suggest:null,more:[]});
      g.push({id:'self',label:'Zamierzone (samozatrucie)',codes:pick(idx,['X6'+n]),suggest:null,more:[]});
      var as=assaultSuggest(code);
      g.push({id:'assault',label:'Napaść',codes:pick(idx,[as]),suggest:idx.by[as]||null,more:range(idx,85,90,'X')});
      g.push({id:'undet',label:'Nieokreślony zamiar',codes:pick(idx,['Y1'+n]),suggest:null,more:[]});
      return {type:'poison',family:n,groups:g,note:'Kod przyczyny zewnętrznej dobrany do grupy substancji; dla napaści sprawdź pełną grupę X85–X90.'};
    }
    // urazy i pozostałe S/T: opcjonalna przyczyna zewnętrzna ogólna
    if(ch==='T'&&!/^T([0-2]\d|3[0-5]|9\d)/.test(code))return null;
    return {type:'injury',groups:[
      {id:'falls',label:'Upadki (W00–W19)',codes:range(idx,0,19,'W'),suggest:null,more:[]},
      {id:'other',label:'Inne częste przyczyny',codes:pick(idx,INJ_OTHER),suggest:null,more:[]}
    ],note:'Miejsce zdarzenia (Y92) nie występuje w tej wersji słownika ICD-10.'};
  }
  // wyszukiwanie przyczyn zewnętrznych (V01–Y98) po słowie: „upadek”, „poślizgnięcie”, „schody”
  function searchExternal(idx,q,syn,limit){
    var sub={kind:'icd10',rows:idx.rows.filter(function(e){return /^[VWXY]/.test(e.c);}),by:idx.by,kids:idx.kids};
    return search(sub,q,{syn:syn,limit:limit||30});
  }
  // kody podwójne † / *
  function daggerInfo(idx,e){
    if(!e||(e.m!=='†'&&e.m!=='*'))return null;
    var refs=[],seen=Object.create(null);
    var m=/\(([A-Z]\d{2}(?:\.\d)?)[*†]\)/.exec(e.n);
    if(m&&idx.by[m[1]]){refs.push(idx.by[m[1]]);seen[m[1]]=1;}
    if(e.m==='*'){idx.rows.forEach(function(x){if(x.m==='†'){var mm=/\(([A-Z]\d{2}(?:\.\d)?)\*\)/.exec(x.n);if(mm&&mm[1]===e.c&&!seen[x.c]){seen[x.c]=1;refs.push(x);}}});}
    return {mark:e.m,refs:refs};
  }
  function line(e){return e.c+' '+e.n;}
  function pairText(a,b){return line(a)+'\n'+line(b);}
  function pairTitle(a,b){return a.c+' + '+b.c;}
  return {norm:norm,ncode:ncode,buildIndex:buildIndex,compileSyn:compileSyn,search:search,isCodeQuery:isCodeQuery,poisonFamily:poisonFamily,externalCauses:externalCauses,searchExternal:searchExternal,daggerInfo:daggerInfo,line:line,pairText:pairText,pairTitle:pairTitle,COMMON10:COMMON10,COMMON9:COMMON9,FAM:FAM};
});
