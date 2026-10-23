/* ═══ 브로치 짝맞추기 ═══════════════════════════════════════════════
   카드 뒷면은 교무청 인장입니다. 눌러서 뒤집으면 학부의 상징색 브로치가 나오고,
   같은 학부의 브로치 두 장을 찾으면 그 학부의 소개가 열립니다.
   학부 이름·색·상징은 content.js 의 FAC(index.html 의 F)를 그대로 씁니다.
*/
(function(){
 if(typeof F==="undefined"||typeof ID==="undefined")return;
 var root=document.getElementById('mmr');if(!root)return;
 var LV=[[8,'쉬움'],[16,'보통'],[24,'어려움']],size=16,cards=[],picked=[],lock=false,moves=0,found=0,secs=0,tm=0,started=false,best={};
 var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches,FL=reduce?0:180;
 try{best=JSON.parse(localStorage.getItem('mmbest')||'{}')||{}}catch(e){best={}}
 function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
 function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
 function dark(c){return (parseInt(c.substr(1,2),16)*.299+parseInt(c.substr(3,2),16)*.587+parseInt(c.substr(5,2),16)*.114)/255<.3}
 function mmss(s){return Math.floor(s/60)+':'+(s%60<10?'0':'')+(s%60)}

 root.innerHTML='<div class="mm"><p class="mm-lead">같은 학부의 브로치 두 장을 찾아 보세요. 짝을 맞추면 그 학부의 소개가 열려요.</p>'
  +'<div class="mm-bar"><div class="chips" id="mmlv">'+LV.map(function(l){return '<button class="chip" data-n="'+l[0]+'" aria-pressed="'+(l[0]===size)+'">'+l[1]+' <small>'+l[0]+'장</small></button>'}).join('')+'</div><div class="mm-stat" id="mmstat"></div></div>'
  +'<div class="mm-board" id="mmb" role="group" aria-label="카드판"></div><div class="mm-info" id="mminfo" aria-live="polite"></div>'
  +'<div class="mm-bar"><button class="rlink" id="mmre">다시 섞기</button></div></div>';
 var board=document.getElementById('mmb'),stat=document.getElementById('mmstat'),info=document.getElementById('mminfo');

 function drawStat(){var b=best[size];stat.innerHTML='이동 <b>'+moves+'</b> · 맞춤 <b>'+found+' / '+size/2+'</b> · 시간 <b>'+mmss(secs)+'</b>'+(b?' · 최고 <b>'+b+'번</b>':'')}
 function stop(){clearInterval(tm);tm=0}
 function start(){
  stop();var idx=shuf(F.slice(0,12).map(function(_,i){return i})).slice(0,size/2),list=[];
  idx.forEach(function(i){list.push(i,i)});list=shuf(list);
  cards=list.map(function(f,n){return {n:n,f:f,on:false,ok:false}});picked=[];lock=false;moves=0;found=0;secs=0;started=false;info.innerHTML='';
  board.className='mm-board c'+(size===24?6:4);
  board.innerHTML=cards.map(function(c){var col=F[c.f][2];
   return '<button class="mm-card" data-n="'+c.n+'" aria-label="카드 '+(c.n+1)+'"><span class="mm-in"><span class="mm-b"></span>'
    +'<span class="mm-f'+(dark(col)?' dk':'')+'" style="--c:'+col+'"><img src="img/'+ID[c.f]+'.png" alt=""><b>'+esc(F[c.f][0])+'</b></span></span></button>'}).join('');
  drawStat()}
 function setFace(c,on){var el=board.children[c.n];el.classList.add('flip');
  setTimeout(function(){c.on=on;el.classList.toggle('on',on);el.setAttribute('aria-label',on?F[c.f][0]+' 브로치':'카드 '+(c.n+1));el.classList.remove('flip')},FL)}
 function match(f){
  var i=f,x=F[i];
  info.innerHTML='<span class="mm-chip" style="background:'+x[2]+';box-shadow:0 0 10px '+x[2]+'"></span><b>'+esc(x[0])+'</b> <small>'+esc(x[1])+'</small> · 상징 '+esc(x[3])+(x[7]?' · 전공 '+esc(x[7]):'')+' · '+esc(x[4])
   +' <button class="go" data-f="'+i+'">학부 보기</button>'}
 function pick(n){
  var c=cards[n];if(lock||c.on||c.ok)return;
  if(!started){started=true;tm=setInterval(function(){secs++;drawStat()},1000)}
  picked.push(c);setFace(c,true);
  if(picked.length<2)return;
  moves++;lock=true;var a=picked[0],b=picked[1];picked=[];
  setTimeout(function(){
   if(a.f===b.f){a.ok=b.ok=true;board.children[a.n].classList.add('ok');board.children[b.n].classList.add('ok');found++;match(a.f);lock=false;
    if(found===size/2){stop();var prev=best[size];if(!prev||moves<prev){best[size]=moves;try{localStorage.setItem('mmbest',JSON.stringify(best))}catch(e){}}
     info.innerHTML='<b>모두 찾았어요!</b> '+moves+'번 만에, '+mmss(secs)+'에 끝냈어요'+(prev&&moves>=prev?' (최고 기록 '+prev+'번)':' — 새 최고 기록이에요')+' <button class="go" id="mmagain">다시 하기</button>'}
   }else{setFace(a,false);setFace(b,false);setTimeout(function(){lock=false},FL+60)}
   drawStat()},FL+420)}

 root.addEventListener('click',function(e){
  var card=e.target.closest('.mm-card');if(card)return pick(+card.dataset.n);
  var chip=e.target.closest('#mmlv .chip');
  if(chip){size=+chip.dataset.n;[].forEach.call(root.querySelectorAll('#mmlv .chip'),function(x){x.setAttribute('aria-pressed',x===chip)});return start()}
  var go=e.target.closest('button[data-f]');if(go&&typeof openF==="function")return openF(+go.dataset.f);
  if(e.target.id==='mmre'||e.target.id==='mmagain')start()});
 start();
})();
