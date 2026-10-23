/* ═══ 학부 선택 도우미 ═══════════════════════════════════════════
   질문은 아래 RITUAL 에서 고칩니다.
   선택지 한 줄 = [문장, {학부번호:점수, ...}]
   학부 번호는 content.js 의 FAC 순서입니다.
   0 마르셰  1 로시에  2 바르체  3 토니카  4 브론테  5 카스텔
   6 에르바  7 레반트  8 볼테르  9 벨로아  10 야누스  11 오르덴
   ※ 문장에 ` (백틱) 은 넣지 마세요.
*/
var RITUAL=[
{q:"입학 첫날, 강당 한복판에서 예기치 못한 소란이 벌어졌다. 당신은?",o:[
 ["격식을 갖춰 자리를 정돈하며 소란을 가라앉힌다.",{0:2,11:1}],
 ["소란이 왜 일어났고 누가 이득을 볼지부터 읽는다.",{1:2,9:1}],
 ["일단 앞으로 뛰어나가 부딪쳐 본다.",{4:2,2:1}],
 ["멀찍이서 조용히 모두를 관찰한다.",{10:2,6:1}],
 ["사람들을 한곳에 모아 안전한 길을 만든다.",{5:2,11:1}]]},
{q:"마을 근처에 게이트가 열렸다는 보고가 들어왔다. 당신이 토벌에 나서는 이유는?",o:[
 ["게이트는 반드시 처단해야 할 악이기 때문이다.",{3:2,5:1}],
 ["게이트의 구조와 우두머리의 정체가 궁금하다.",{6:2,8:1}],
 ["보상과 전리품이 위험보다 큰지 계산해 본 결과다.",{9:2,10:1}],
 ["내 이름을 드높일 가장 좋은 무대이기 때문이다.",{2:2,4:1}],
 ["주변 생태에 어떤 영향을 주는지 이해하고 싶다.",{7:2,6:1}]]},
{q:"마법 수업에서 가장 마음이 끌리는 방식은?",o:[
 ["우아하고 정교하게 다듬은 격식 있는 마법.",{0:2,7:1}],
 ["여럿이 함께 오래 쓸 수 있는 안정적인 마법.",{11:2,5:1}],
 ["정해진 방식을 비틀어 새로운 쓰임새를 시험하는 마법.",{8:2,6:1}],
 ["누구든 눈길을 줄 수밖에 없는 화려한 마법.",{2:2,4:1}],
 ["한순간에 터뜨리는 압도적인 폭발력.",{4:2,3:1}]]},
{q:"동료와 의견이 크게 갈렸다. 어떻게 푸는가?",o:[
 ["대화를 이끌며 상황을 내게 유리한 쪽으로 끌고 간다.",{1:2,2:1}],
 ["학칙과 선례를 근거로 정리한다.",{0:2,11:1}],
 ["결투로 가리고, 결과에는 깨끗이 승복한다.",{3:2,4:1}],
 ["상대의 약점을 조용히 파악해 두고 한발 물러선다.",{10:2,9:1}],
 ["자리를 피해 숲길을 걸으며 마음을 가라앉힌다.",{7:2,10:1}]]},
{q:"수업 사이 쉬는 시간, 발길이 향하는 곳은?",o:[
 ["서고 깊숙한 곳에서 오래된 기록을 뒤적인다.",{6:2,8:1}],
 ["연무장. 땀을 흘려야 직성이 풀린다.",{3:2,4:1}],
 ["연회장. 사람들 사이를 오가며 인맥을 넓힌다.",{1:2,2:1}],
 ["상점가에서 시세를 살피고 흥정을 구경한다.",{9:2,1:1}],
 ["공용 휴게실에서 흐트러진 자리와 비품을 정돈해 둔다.",{11:2,5:1}]]},
{q:"팀 과제에서 가장 맡고 싶은 역할은?",o:[
 ["전체를 이끄는 조장.",{5:2,0:1}],
 ["자료를 모아 몰래 분석하는 정보 담당.",{10:2,6:1}],
 ["물자와 일정을 관리하는 총무.",{11:2,9:1}],
 ["결과를 발표하며 시선을 한몸에 받는 발표자.",{2:2,1:1}],
 ["새 재료를 이것저것 섞어 시험하는 실험 담당.",{8:2,7:1}]]},
{q:"가장 존경하는 인물을 고른다면?",o:[
 ["의리를 지키며 끝까지 싸운 기사.",{3:2,5:1}],
 ["수완 하나로 대국과 협상을 이끈 외교관.",{1:2,0:1}],
 ["이름 하나 남기지 않고 모든 것을 알았던 첩자.",{10:2,9:1}],
 ["이단 소리를 들으면서도 새 원리를 찾아낸 연금술사.",{8:2,7:1}],
 ["오래된 숲을 평생 지켜 온 은자.",{7:2,11:1}]]},
{q:"위기의 순간, 가장 마음에 와닿는 말은?",o:[
 ["위험할수록 가치가 있다.",{4:2,2:1}],
 ["격식을 잃으면 모든 것을 잃는다.",{0:2,5:1}],
 ["손익이 맞지 않으면 물러서는 것도 용기다.",{9:2,10:1}],
 ["진실은 끝까지 파헤쳐야 한다.",{6:2,8:1}],
 ["약한 이를 지키는 것이 강한 이의 본분이다.",{5:2,3:1}]]},
{q:"졸업 후 가장 해 보고 싶은 일은?",o:[
 ["궁정의 의전관이 되어 나라의 격을 세운다.",{0:2,1:1}],
 ["최전선 토벌대에 들어가 가장 앞에서 싸운다.",{4:2,3:1}],
 ["연구소를 세워 아무도 몰랐던 원리를 증명한다.",{8:2,7:1}],
 ["상단을 키워 대륙의 흐름을 쥔다.",{9:2,11:1}],
 ["정보국에서 그림자 속의 일을 맡는다.",{10:2,9:1}]]},
{q:"이상적인 하루의 마무리는?",o:[
 ["정원을 거닐며 바람과 정령의 기척에 귀를 기울인다.",{7:2,11:1}],
 ["오늘의 일을 장부와 일지에 꼼꼼히 정리해 둔다.",{11:2,10:1}],
 ["무대 위에서 박수를 받으며 막을 내린다.",{2:2,1:1}],
 ["뒤처진 동기의 훈련을 도와주고, 전우들과 잔을 부딪친다.",{5:2,3:1}],
 ["해독하지 못한 문서를 붙들고 밤을 새운다.",{6:2,8:1}]]}
];

(function(){
 if(typeof F==="undefined"||typeof RITUAL==="undefined")return;
 var root=document.getElementById('rt');if(!root)return;
 var N=RITUAL.length,st=null;
 function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
 function saved(){try{var s=localStorage.getItem('house');return s!==null&&F[+s]&&+s<12?+s:-1}catch(e){return -1}}
 function meta(i){return F[i][4]+" · "+F[i][5]+" 중심 · 상징 "+F[i][3]}

 function intro(){
  var h=saved(),prev=h<0?"":'<p class="rprev">지난 추천 결과 —<button class="rlink" data-a="last">'+F[h][0]+'</button></p>';
  root.innerHTML='<div class="rintro">'+(typeof gem==="function"?'<div class="rgw" aria-hidden="true">'+gem(12).replace('<button','<button tabindex="-1"')+'</div>':'<div class="rgem"></div>')+'<p>'+N+'개의 질문에 답하면, 당신에게 어울리는 학부를 알려 드립니다.<br>정답은 없으니 마음 가는 대로 골라 주세요.</p><button class="go" data-a="start">시작하기</button>'+prev+'</div>';
 }
 function start(){
  st={n:0,pick:[],ord:RITUAL.map(function(d){return shuf(d.o.map(function(_,k){return k}))}),tie:shuf(F.slice(0,12).map(function(_,i){return i}))};
  ask();
 }
 function ask(){
  var d=RITUAL[st.n];
  root.innerHTML='<div class="rq"><div class="rp"><i style="width:'+(st.n/N*100)+'%"></i></div><div class="rc">'+(st.n+1)+' / '+N+'</div><h3>'+d.q+'</h3><div class="ro">'+st.ord[st.n].map(function(k){return '<button data-k="'+k+'">'+d.o[k][0]+'</button>'}).join('')+'</div>'+(st.n?'<button class="rlink" data-a="back">← 이전 질문</button>':'')+'</div>';
 }
 function tally(){
  var sc=[],pr=[],i;for(i=0;i<12;i++){sc.push(0);pr.push(0)}
  st.pick.forEach(function(k,n){var w=RITUAL[n].o[k][1],m=0,x;for(x in w)if(w[x]>m)m=w[x];for(x in w){sc[x]+=w[x];if(w[x]==m)pr[x]++}});
  var rk=st.tie.slice().sort(function(a,b){return sc[b]-sc[a]||pr[b]-pr[a]});
  return {rk:rk,sc:sc};
 }
 function result(i,t){
  var f=F[i],top=t?t.sc[t.rk[0]]:0;
  var bars=t?'<div class="cap">성향 분포</div>'+t.rk.slice(0,3).map(function(j){return '<div class="rb2" style="--c:'+F[j][2]+'"><span>'+F[j][0]+'</span><i style="width:'+Math.round(t.sc[j]/top*100)+'%"></i></div>'}).join(''):'';
  root.innerHTML='<div class="rr" style="--c:'+f[2]+'"><div class="cap">당신에게 어울리는 학부</div><div class="rh">'+ic(i,110)+'<div><h3>'+f[0]+' <small>'+f[1]+'</small></h3><div class="m">'+meta(i)+'</div></div></div><p>'+f[6]+'</p>'+bars+(window.letterBlock?window.letterBlock(i):'')+'<div class="more rbt"><button class="go" onclick="openF('+i+')">학부 자세히 보기</button><button class="go" data-a="copy" data-i="'+i+'">결과 복사</button><button class="go" data-a="start">다시 하기</button></div></div>';
 }
 root.addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b||!st&&!b.dataset.a)return;
  var a=b.dataset.a;
  if(a=="start")return start();
  if(a=="last")return result(saved(),null);
  if(a=="back"){st.n--;st.pick.length=st.n;return ask()}
  if(a=="copy"){var i=+b.dataset.i,s="나에게 어울리는 노르테이아 아카데미의 학부는 "+F[i][0]+"! "+location.href.split('#')[0];
   try{navigator.clipboard.writeText(s).then(function(){b.textContent="복사되었어요"},function(){b.textContent="복사하지 못했어요"})}catch(x){b.textContent="복사하지 못했어요"}return}
  if(b.dataset.k!==undefined&&st){
   st.pick[st.n]=+b.dataset.k;st.n++;
   if(st.n<N)return ask();
   var t=tally();try{localStorage.setItem('house',t.rk[0])}catch(x){}
   result(t.rk[0],t);
  }
 });
 intro();
})();
