/* ═══ 번역 엔진 ═════════════════════════════════════════════════
   화면에 나타나는 한국어 문장을 번역 사전(i18n/언어.js)에서 찾아 바꿉니다.
   · 사전은 '한국어 원문 → 번역' 입니다. 줄바꿈이 있는 원문은 줄 단위로도 찾습니다.
   · 사전에 없는 합성 문장은 패턴(P.p)과 구분자(' · ', ', ')로 쪼개서 번역합니다.
   · 나중에 생기는 요소도 MutationObserver 가 잡아 번역합니다.
*/
(function(){
 var P=window.I18N_PACK;if(!P)return;
 var H=/[가-힣]/,D=Object.create(null),PAT=P.p||[],ATTR=['placeholder','aria-label','title','alt'];
 Object.keys(P.d).forEach(function(k){
  var v=P.d[k];D[k]=v;
  if(k.indexOf('\n')>=0){var a=k.split('\n'),b=v.split('\n');if(a.length==b.length)a.forEach(function(x,i){x=x.trim();if(x&&!(x in D))D[x]=b[i].trim()})}
 });

 function tr0(s){
  if(D[s]!==undefined)return D[s];
  for(var i=0;i<PAT.length;i++){var m=PAT[i][0].exec(s);if(m){var r=PAT[i][1](m,tr0);if(r!=null)return r}}
  var parts=s.split(/( · |, | \+ |· |\/)/);
  if(parts.length>1){var ch=false,out=parts.map(function(p,k){if(k%2||!H.test(p))return p;var x=p.trim(),t=tr0(x);if(t==null){var u=tr0('· '+x);if(u!=null)t=u.replace(/^·\s*/,'')}if(t==null)return p;ch=true;return t});
   if(ch)return out.join('')}
  return null;
 }
 function tr(s){
  if(!H.test(s))return s;
  var m=/^(\s*)([\s\S]*?)(\s*)$/.exec(s),r=tr0(m[2]);
  return r==null?s:m[1]+r+m[3];
 }
 window.TR=tr;

 function skip(n){for(var e=n.nodeType==1?n:n.parentNode;e;e=e.parentNode){var t=e.nodeName;if(t=='SCRIPT'||t=='STYLE'||t=='NOSCRIPT'||t=='TEXTAREA'||e.id=='lang')return true}return false}
 function text(n){var v=n.nodeValue;if(v&&H.test(v)&&!skip(n)){var p=n.parentNode,t=p&&p.id&&P.byId&&P.byId[p.id]!==undefined?P.byId[p.id]:tr(v);if(t!==v)n.nodeValue=t}}
 function attrs(e){for(var i=0;i<ATTR.length;i++){var v=e.getAttribute&&e.getAttribute(ATTR[i]);if(v&&H.test(v)){var t=tr(v);if(t!==v)e.setAttribute(ATTR[i],t)}}}
 function walk(n){
  if(n.nodeType==3)return text(n);
  if(n.nodeType!=1)return;
  attrs(n);
  if(skip(n))return;
  for(var c=n.firstChild;c;c=c.nextSibling)walk(c);
 }
 new MutationObserver(function(ms){
  for(var i=0;i<ms.length;i++){var m=ms[i];
   if(m.type=='childList')for(var j=0;j<m.addedNodes.length;j++)walk(m.addedNodes[j]);
   else if(m.type=='characterData')text(m.target);
   else attrs(m.target);
  }
 }).observe(document,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTR});
 document.addEventListener('DOMContentLoaded',function(){walk(document.documentElement)});

 // 글꼴: 일본어·번체는 해당 글꼴, 영어·스페인어는 라틴 글꼴을 쓴다
 var F={ja:['Noto+Serif+JP:wght@500;700','Noto+Sans+JP:wght@400;500;700',"'Noto Serif JP'","'Noto Sans JP'"],
  'zh-TW':['Noto+Serif+TC:wght@500;700','Noto+Sans+TC:wght@400;500;700',"'Noto Serif TC'","'Noto Sans TC'"],
  en:['Cormorant+Garamond:wght@500;700','Noto+Sans:wght@400;500;700',"'Cormorant Garamond'","'Noto Sans'"],
  es:['Cormorant+Garamond:wght@500;700','Noto+Sans:wght@400;500;700',"'Cormorant Garamond'","'Noto Sans'"]}[window.LANG];
 if(F){
  var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family='+F[0]+'&family='+F[1]+'&display=swap';document.head.appendChild(l);
  var s=document.createElement('style');s.textContent=':root:root{--serif:'+F[2]+',\'Noto Serif KR\',serif;--sans:\'Trebuchet MS\','+F[3]+',\'Noto Sans KR\',sans-serif}'+(P.css||'');document.head.appendChild(s);
 }
})();
