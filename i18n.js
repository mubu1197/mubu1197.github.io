/* ═══ 번역 로더 ═════════════════════════════════════════════════
   저장된 언어(localStorage 'lang')가 한국어가 아니면 번역 파일과 엔진을 먼저 불러옵니다.
   한국어일 때는 아무것도 하지 않으므로 속도에 영향이 없습니다.
*/
(function(){
 var L='ko',OK={en:1,ja:1,'zh-TW':1,es:1};
 try{L=localStorage.getItem('lang')||'ko'}catch(e){}
 if(!OK[L])L='ko';
 window.LANG=L;
 window.TR=function(s){return s};
 if(L=='ko')return;
 document.documentElement.lang=L;
 document.write('<script src="i18n/'+L+'.js"><\/script><script src="i18n/engine.js"><\/script>');
})();
