/* ═══ 플레이 존 탭 ═════════════════════════════════════════════════
   도감 맨 아래의 놀이 칸입니다. 놀이마다 탭이 하나씩 있습니다. (pp-mm: 브로치 짝맞추기, pp-mb: 마나 버블, pp-ct: 컬러 타일, pp-ws: 주문 제작소)
   새 놀이를 더할 때는 index.html 의 #ptabs 에 버튼(data-p)과, 같은 이름의 #pp-… 칸을 하나 추가하면 됩니다.
*/
(function(){
 var tabs=document.getElementById('ptabs');if(!tabs)return;
 function show(k){
  [].forEach.call(tabs.querySelectorAll('.chip'),function(c){c.setAttribute('aria-pressed',c.dataset.p===k)});
  [].forEach.call(document.querySelectorAll('.pp'),function(p){p.hidden=p.id!=='pp-'+k});
  try{localStorage.setItem('ptab',k)}catch(e){}}
 tabs.addEventListener('click',function(e){var b=e.target.closest('.chip');if(b)show(b.dataset.p)});
 try{var k=localStorage.getItem('ptab');if(k&&document.getElementById('pp-'+k))show(k)}catch(e){}
})();
