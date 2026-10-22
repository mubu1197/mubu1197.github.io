/* ═══ 입학 통지서 ═══════════════════════════════════════════════
   학부 선택 도우미 결과 화면에 봉인된 편지가 나타나고, 봉인을 누르면 편지가 열립니다.
   아래 LETTER 의 값만 고치면 편지에 그대로 반영됩니다.
   ※ 총장 이름은 명단(ROSTER)의 '총장'에서 가져옵니다. 문장에 ` (백틱) 은 넣지 마세요.
   ※ 문장 안에서 *이렇게* 별표로 감싼 부분은 굵게 나옵니다.
*/
var LETTER={
 year:1232,                 // 입학하는 해
 date:"3월 1일",            // 입학식 날짜
 time:"오전 10시",          // 입학식 시각
 place:"노르테이아 아카데미 대강당",
 orient:"3월 1일부터 7일까지는 오리엔테이션 주간이 이어집니다",  // 문장 끝의 '.' 은 자동으로 붙습니다
 from:"노르테이아에서",      // 날짜 윗줄(편지를 쓴 곳)
 sent:"1231년 10월 30일",   // 편지를 보낸 날
 title:"입학 통지서",         // 편지 제목
 headTitle:"노르테이아 아카데미 총장",
 signEn:"Eleonora Valdemar", // 총장 서명 (영문 필기체로 나옵니다)
 defaultName:"유저",         // 받는 분 이름을 비워 뒀을 때 쓰는 이름
 // 학부별 보석 브로치 색 (FAC 순서: 마르셰 로시에 바르체 토니카 브론테 카스텔 에르바 레반트 볼테르 벨로아 야누스 오르덴)
 gems:["흰색","주황색","분홍색","빨간색","노란색","하늘색","파란색","연두색","보라색","갈색","검은색","초록색"]
};

(function(){
 if(typeof F==="undefined"||typeof ID==="undefined"||typeof CH==="undefined")return;
 var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
 var ov=null;

 function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
 function bold(s){return esc(s).replace(/\*(.+?)\*/g,"<b>$1</b>")}
 function savedName(){try{return localStorage.getItem('lname')||""}catch(e){return ""}}
 function headName(){var h=CH.find(function(c){return c.r=="총장"});return h?h.n:"엘레오노라 발데마르"}
 // 밀랍 도장: 학부 색 + 학부 상징(브로치 그림을 곱하기로 얹어 눌러 찍은 느낌)
 function seal(i){return '<span class="lt-seal" style="--c:'+F[i][2]+'"><img src="img/'+ID[i]+'.png" alt="" onerror="this.remove()"></span>'}

 // 편지 문장 (화면과 '편지 복사'가 같은 문장을 씁니다)
 function lines(i,name){
  var f=F[i],L=LETTER;
  return {
   to:name+" 귀하",
   body:[
    "노르테이아 아카데미는 귀하를 신입생으로 맞이하게 되었음을 기쁘게 알려 드립니다.",
    "귀하께서 입학 전에 선택하신 학부는 *"+f[0]+"*입니다. 입학식에서 "+L.gems[i]+" 보석 브로치를 받으면, 귀하는 정식으로 "+f[0]+"의 일원이 됩니다.",
    "입학식은 *"+L.year+"년 "+L.date+" "+L.time+"*, "+L.place+"에서 열립니다. 식을 마치면 소속 학부관으로 안내해 드리며, "+L.orient+". 3년의 교육 과정을 함께할 동기들이 그곳에서 귀하를 기다리고 있습니다.",
    "부디 지정된 시각까지 아카데미로 오십시오. 귀하의 앞날에 행운이 함께하기를 바랍니다."],
   from:L.from,sent:L.sent,head:L.headTitle,sign:headName()
  };
 }
 function paper(i,name){
  var L=lines(i,name);
  return '<div class="lt-scroll"><div class="lt-crest">NORTEIA ACADEMY</div><h3>'+esc(LETTER.title)+'</h3><div class="lt-orn"><i></i></div>'
   +'<p class="lt-to">'+esc(L.to)+'</p>'
   +L.body.map(function(p){return '<p>'+bold(p)+'</p>'}).join('')
   +'<div class="lt-date"><span>'+esc(L.from)+'</span><span>'+esc(L.sent)+'</span></div>'
   +'<div class="lt-sign"><div class="lt-sg"><span>'+esc(L.head)+'</span><b aria-label="'+esc(L.sign)+'">'+esc(LETTER.signEn)+'</b></div>'+seal(i)+'</div>'
   +'<div class="lt-act"><button data-lt="close">닫기</button></div></div>';
 }

 // 학부 선택 도우미 결과 화면에 들어가는 '도착한 편지' 칸 (quiz.js 가 불러 씁니다)
 window.letterBlock=function(i){
  return '<div class="lt-box"><div class="cap">도착한 편지</div><div class="lt-row">'
   +'<button class="lt-mini" data-lt="open" data-i="'+i+'" aria-label="봉인된 편지 열기">'+seal(i)+'</button>'
   +'<div class="lt-tx"><p>노르테이아 아카데미에서 당신 앞으로 편지가 도착했습니다.</p>'
   +'<label>받는 분 <input class="lt-name" maxlength="12" placeholder="'+esc(LETTER.defaultName)+'" value="'+esc(savedName())+'"></label>'
   +'<button class="go" data-lt="open" data-i="'+i+'">봉인 열기</button></div></div></div>';
 };

 function close(now){
  if(!ov)return;var o=ov;ov=null;document.body.classList.remove('lt-lock');
  if(now){o.remove();return}
  o.classList.remove('in');setTimeout(function(){o.remove()},reduce?0:350);
 }
 function open(i,name){
  close(true);
  ov=document.createElement('div');ov.className='lt-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label',LETTER.title);
  ov.innerHTML='<button class="lt-x" data-lt="close" aria-label="닫기">×</button>'
   +'<div class="lt-stage"><div class="lt-e"><div class="lt-back"></div><div class="lt-flap2"></div><div class="lt-front"></div>'
   +'<button class="lt-s" data-lt="break" aria-label="봉인 열기">'+seal(i)+'</button></div><p class="lt-hint">봉인을 눌러 열어 보세요</p></div>'
   +'<div class="lt-paper" hidden>'+paper(i,name)+'</div>';
  document.body.appendChild(ov);document.body.classList.add('lt-lock');
  requestAnimationFrame(function(){ov&&ov.classList.add('in')});
  var s=ov.querySelector('.lt-s');if(s)s.focus({preventScroll:true});
 }
 function breakSeal(){
  if(!ov||ov.classList.contains('cracked'))return;
  var o=ov,p=o.querySelector('.lt-paper'),t=reduce?0:1;
  o.classList.add('cracked');
  setTimeout(function(){o.classList.add('opened')},250*t);
  setTimeout(function(){o.classList.add('rise');p.hidden=false;p.querySelector('.lt-scroll').scrollTop=0;requestAnimationFrame(function(){p.classList.add('in')});var b=p.querySelector('.lt-act button');if(b)b.focus({preventScroll:true})},950*t);
 }

 document.addEventListener('click',function(e){
  var b=e.target.closest('[data-lt]');
  if(!b){if(ov&&e.target===ov)close();return}
  var a=b.dataset.lt;
  if(a=="open"){
   var box=b.closest('.lt-box'),inp=box&&box.querySelector('.lt-name'),name=(inp&&inp.value.trim())||LETTER.defaultName;
   try{if(inp&&inp.value.trim())localStorage.setItem('lname',inp.value.trim());else localStorage.removeItem('lname')}catch(x){}
   open(+b.dataset.i,name);
  }else if(a=="break")breakSeal();
  else if(a=="close")close();
 });
 document.addEventListener('keydown',function(e){if(e.key=="Escape"&&ov)close()});
})();
