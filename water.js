/* ═══ 시험관 정리 ═══════════════════════════════════════════════════
   시험관마다 색 층이 섞여 있습니다. 시험관을 눌러 고른 뒤 옮길 시험관을 누르면 맨 위의 물이 부어집니다.
   '자유 붓기'(기본)를 켜면 자리만 있으면 다른 색 위에도 부을 수 있고, 끄면 맨 위가 같은 색이거나 빈 시험관에만 부을 수 있습니다. 한 시험관에 한 색씩 모으면 끝납니다.
   색은 12학부의 상징색이고 층마다 학부 문양이 찍힙니다(끌 수 있음). 풀 수 있는 판만 만들도록, 섞은 뒤 풀이가 있는지 확인합니다.
*/
(function(){
 if(typeof F==="undefined"||typeof ID==="undefined")return;
 var root=document.getElementById('wtr');if(!root)return;
 var CAP=4,EMPTY=2;                                                      // 시험관 하나에 담기는 층 수 / 처음에 비어 있는 시험관 수
 var LV=[['쉬움',[3,4,6,8,11]],['보통',[3,4,6,8,11,0,1]],['어려움',[3,4,6,8,11,0,1,2,5]],['극한',[0,1,2,3,4,5,6,7,8,9,10,11]]];   // 이름, 쓰는 학부(색)
 var lv=1,tubes=[],start=[],sel=-1,hist=[],moves=0,done=false,best={},emb=true,free=true,prev=null;
 try{best=JSON.parse(localStorage.getItem('wtbest')||'{}')||{};emb=localStorage.getItem('wtemb')!=='0';free=localStorage.getItem('wtfree')!=='0'}catch(e){best={}}
 function lift(h){var v=[1,3,5].map(function(j){return parseInt(h.substr(j,2),16)});if((v[0]*.299+v[1]*.587+v[2]*.114)/255<.3)v=v.map(function(x){return Math.round(x+(255-x)*.4)});return '#'+v.map(function(x){return ('0'+x.toString(16)).slice(-2)}).join('')}
 function shuf(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}

 root.innerHTML='<div class="mm"><p class="mm-lead" id="wtlead"></p>'
  +'<div class="mm-bar"><div class="chips" id="wtlv">'+LV.map(function(l,i){return '<button class="chip" data-l="'+i+'" aria-pressed="'+(i===lv)+'">'+l[0]+' <small>'+l[1].length+'색</small></button>'}).join('')+'<button class="chip" id="wtfr" aria-pressed="'+free+'" title="켜면 다른 색 위에도 부을 수 있어요">자유 붓기</button><button class="chip" id="wttg" aria-pressed="'+emb+'" title="층의 학부 문양을 켜고 꺼요">문양 표시</button></div><div class="mm-stat" id="wtstat"></div></div>'
  +'<div class="wt-board" id="wtb" role="group" aria-label="시험관"></div>'
  +'<div class="mm-info" id="wtinfo" aria-live="polite"></div>'
  +'<div class="mm-bar"><button class="rlink" id="wtundo">되돌리기</button><button class="rlink" id="wtreset">처음부터</button><button class="rlink" id="wtnew">새로 섞기</button></div></div>';
 var board=document.getElementById('wtb'),stat=document.getElementById('wtstat'),info=document.getElementById('wtinfo');

 // ── 규칙 ──
 function canPour(t,i,j){var a=t[i],b=t[j];return i!==j&&a.length>0&&b.length<CAP&&(free||!b.length||b[b.length-1]===a[a.length-1])&&!(b.length===0&&a.every(function(v){return v===a[0]}))}
 function pour(t,i,j){var a=t[i],b=t[j],c=a[a.length-1],n=0;while(a.length&&a[a.length-1]===c&&b.length<CAP){b.push(a.pop());n++}return n}
 function solved(t){return t.every(function(a){return !a.length||(a.length===CAP&&a.every(function(v){return v===a[0]}))})}
 function key(t){return t.map(function(a){return a.join(',')}).join('|')}
 function solvable(t0,limit){                                              // 깊이 우선으로 풀이가 있는지 확인합니다 (너무 오래 걸리면 포기하고 다시 섞습니다)
  var seen={},stack=[t0.map(function(a){return a.slice()})],nodes=0;
  while(stack.length){var t=stack.pop();if(solved(t))return true;var k=key(t);if(seen[k])continue;seen[k]=1;if(++nodes>limit)return false;
   for(var i=0;i<t.length;i++)for(var j=0;j<t.length;j++)if(canPour(t,i,j)){var u=t.map(function(a){return a.slice()});pour(u,i,j);stack.push(u)}}
  return false}
 function make(){
  var set=LV[lv][1],tries=0,t;
  do{var units=[];set.forEach(function(c){for(var n=0;n<CAP;n++)units.push(c)});shuf(units);
   t=[];for(var i=0;i<set.length;i++)t.push(units.slice(i*CAP,i*CAP+CAP));for(var e=0;e<EMPTY;e++)t.push([]);
   var ok=!t.some(function(a){return a.length===CAP&&a.every(function(v){return v===a[0]})});
   if(ok&&(free||solvable(t,25000)))return t;tries++}while(tries<40);
  return t}

 // ── 화면 ──
 function build(){
  board.innerHTML=tubes.map(function(_,i){return '<button class="wt-tube" data-i="'+i+'" aria-label="시험관 '+(i+1)+'">'+[0,1,2,3].map(function(){return '<span class="wt-sl"></span>'}).join('')+'</button>'}).join('');prev=null}
 function render(){
  var tb=board.children;
  tubes.forEach(function(a,i){var el=tb[i],sl=el.children;
   el.classList.toggle('sel',i===sel);el.classList.toggle('done',a.length===CAP&&a.every(function(v){return v===a[0]}));
   for(var s=0;s<CAP;s++){var c=a[s],o=prev?prev[i][s]:undefined,e=sl[s];
    if(c===o&&e.dataset.e===(emb?'1':'0'))continue;
    e.dataset.e=emb?'1':'0';
    if(c===undefined){e.className='wt-sl';e.style.removeProperty('--c');e.innerHTML=''}
    else{e.className='wt-sl on'+(o===undefined&&prev?' in':'');e.style.setProperty('--c',lift(F[c][2]));e.innerHTML=emb?'<img src="img/'+ID[c]+'.png" alt="">':''}}});
  prev=tubes.map(function(a){return a.slice()});
  var b=best[bk()];stat.innerHTML='이동 <b>'+moves+'</b>'+(b?' · 최고 <b>'+b+'번</b>':'')}
 function bk(){return lv+(free?'f':'s')}
 function lead(){document.getElementById('wtlead').innerHTML='시험관을 눌러 고른 뒤, 옮길 시험관을 누르세요.<br>'+(free?'자리만 있으면 다른 색 위에도 부을 수 있어요.':'맨 위의 물과 같은 색이거나 빈 시험관에만 부을 수 있어요.')+'<br>한 시험관에 한 색씩 모으면 끝나요.'}
 function stuck(){for(var i=0;i<tubes.length;i++)for(var j=0;j<tubes.length;j++)if(canPour(tubes,i,j))return false;return true}
 function newGame(){
  lead();tubes=make();start=tubes.map(function(a){return a.slice()});begin()}
 function begin(){
  sel=-1;hist=[];moves=0;done=false;info.innerHTML='';build();render()}
 function click(i){
  if(done)return;
  if(sel<0){if(tubes[i].length)sel=i;render();return}
  if(sel===i){sel=-1;render();return}
  if(canPour(tubes,sel,i)){var n=pour(tubes,sel,i);hist.push([sel,i,n]);moves++;sel=-1;info.innerHTML='';render();
   if(solved(tubes)){done=true;var p=best[bk()],rec=!p||moves<p;if(rec){best[bk()]=moves;try{localStorage.setItem('wtbest',JSON.stringify(best))}catch(e){}}render();
    info.innerHTML='<b>모두 정리했어요!</b> '+moves+'번 만에 끝냈어요'+(rec&&p?' — 새 최고 기록이에요':'')+' <button class="go" id="wtagain">다시 하기</button>'}
   else if(stuck())info.innerHTML='더 옮길 곳이 없어요. <b>되돌리기</b>를 눌러 보세요.'}
  else{sel=tubes[i].length?i:-1;render()}}
 function undo(){
  if(!hist.length||done)return;var h=hist.pop(),a=tubes[h[0]],b=tubes[h[1]];for(var n=0;n<h[2];n++)a.push(b.pop());moves=Math.max(0,moves-1);sel=-1;info.innerHTML='';render()}

 board.addEventListener('click',function(e){var t=e.target.closest('.wt-tube');if(t)click(+t.dataset.i)});
 root.addEventListener('click',function(e){
  var id=e.target.id;
  if(id==='wtfr'){free=!free;e.target.setAttribute('aria-pressed',free);try{localStorage.setItem('wtfree',free?'1':'0')}catch(_){}return newGame()}
  if(id==='wttg'){emb=!emb;e.target.setAttribute('aria-pressed',emb);try{localStorage.setItem('wtemb',emb?'1':'0')}catch(_){}return render()}
  var chip=e.target.closest('#wtlv .chip[data-l]');
  if(chip){lv=+chip.dataset.l;[].forEach.call(root.querySelectorAll('#wtlv .chip[data-l]'),function(x){x.setAttribute('aria-pressed',x===chip)});return newGame()}
  if(id==='wtundo')undo();else if(id==='wtreset'){tubes=start.map(function(a){return a.slice()});begin()}else if(id==='wtnew'||id==='wtagain')newGame()});
 newGame();
})();
