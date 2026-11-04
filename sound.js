/* Sygnały alarmowe – Web Audio API, offline. Wybór: localStorage sk_settings.tone (domyślnie 'bells'). */
(function(g){
var TONES=[['classic','Klasyczny (obecny)'],['guitar','Gitara (szarpnięta struna)'],['piano','Pianino (akord)'],['bells','Dzwoneczki'],['marimba','Miękki gong / marimba']];
var AC=null,live=[],timer=null;
function ctx(){try{if(!AC)AC=new (g.AudioContext||g.webkitAudioContext)();if(AC.state!=='running')AC.resume();}catch(e){}return AC}
function set(){try{return JSON.parse(localStorage.getItem('sk_settings')||'{}')||{}}catch(e){return{}}}
function tone(){var t=set().tone;return TONES.some(function(x){return x[0]===t})?t:'bells'}
function vol(v){var s=set();v=v!=null?v:(typeof s.vol==='number'?s.vol:0.7);return Math.max(0.05,Math.min(1,v))}
function out(c,v){var m=c.createGain();m.gain.value=0.35*v;var cp=c.createDynamicsCompressor?c.createDynamicsCompressor():null;if(cp){m.connect(cp);cp.connect(c.destination)}else m.connect(c.destination);live.push(m);return m}
function env(c,node,dst,t,a,peak,dec){var gg=c.createGain();gg.gain.setValueAtTime(0.0001,t);gg.gain.linearRampToValueAtTime(peak,t+a);gg.gain.exponentialRampToValueAtTime(0.0001,t+a+dec);node.connect(gg);gg.connect(dst);return gg}
function osc(c,dst,type,f,t,a,peak,dec){var o=c.createOscillator();o.type=type;o.frequency.value=f;env(c,o,dst,t,a,peak,dec);o.start(t);o.stop(t+a+dec+0.05);live.push(o);return o}
function pluck(c,dst,f,t,peak){var sr=c.sampleRate,len=Math.floor(sr*2.2),buf=c.createBuffer(1,len,sr),d=buf.getChannelData(0),N=Math.max(2,Math.round(sr/f)),ring=new Float32Array(N),i;
 for(i=0;i<N;i++)ring[i]=Math.random()*2-1;var p=0;for(i=0;i<len;i++){var nx=(p+1)%N,v=ring[p];ring[p]=0.996*0.5*(v+ring[nx]);d[i]=v;p=nx}
 var s=c.createBufferSource();s.buffer=buf;var lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;s.connect(lp);env(c,lp,dst,t,0.005,peak,2.1);s.start(t);live.push(s)}
var P={
 guitar:function(c,d,t){[196,246.94,293.66,392,493.88].forEach(function(f,i){pluck(c,d,f,t+i*0.045,0.55)});return 2.4},
 piano:function(c,d,t){[261.63,329.63,392,523.25].forEach(function(f,i){var tt=t+i*0.03;osc(c,d,'triangle',f,tt,0.01,0.28,1.8);osc(c,d,'sine',f*2,tt,0.01,0.08,0.9)});return 2},
 bells:function(c,d,t){[[1046.5,0],[1318.5,0.18],[1568,0.36]].forEach(function(n){var tt=t+n[1];osc(c,d,'sine',n[0],tt,0.005,0.3,1.4);osc(c,d,'sine',n[0]*2.76,tt,0.005,0.06,0.5)});return 2},
 marimba:function(c,d,t){[[392,0],[523.25,0.22]].forEach(function(n){var tt=t+n[1];osc(c,d,'sine',n[0],tt,0.008,0.45,1.1);osc(c,d,'sine',n[0]*4,tt,0.003,0.07,0.15)});osc(c,d,'sine',196,t,0.02,0.18,2.2);return 2.4},
 classic:function(c,d,t){var o=c.createOscillator();o.type='sawtooth';o.frequency.value=750;var l=c.createOscillator();l.type='triangle';l.frequency.value=1.2;var lg=c.createGain();lg.gain.value=300;l.connect(lg);lg.connect(o.frequency);var gg=c.createGain();gg.gain.value=2.8;o.connect(gg);gg.connect(d);o.start(t);l.start(t);o.stop(t+4);l.stop(t+4);live.push(o,l);return 4}
};
function stop(){clearInterval(timer);timer=null;live.forEach(function(n){try{n.stop?n.stop():n.disconnect()}catch(e){}try{n.disconnect()}catch(e){}});live=[]}
function play(name,v,opts){var c=ctx();if(!c)return 0;stop();name=P[name]?name:tone();var d=out(c,vol(v));var len=P[name](c,d,c.currentTime+0.03);
 if(opts&&opts.repeat&&name!=='classic'){var n=1;timer=setInterval(function(){if(n++>=opts.repeat){clearInterval(timer);return}var d2=out(c,vol(v));P[name](c,d2,c.currentTime+0.03)},(len+0.6)*1000)}
 g.__sorLastTone=name;return len}
g.SORSound={TONES:TONES,tone:tone,play:play,stop:stop,ctx:ctx};
})(window);
