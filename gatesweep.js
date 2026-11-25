/* ═══ 지뢰 찾기 (게이트 테마) ═════════════════════════════════════════
   게이트 안쪽의 칸을 하나씩 열어 길을 내는 놀이입니다. 숫자는 둘레 여덟 칸에 숨은 마물의 수이고,
   마물이 없는 칸을 모두 열면 게이트를 돌파합니다. 첫 칸과 그 둘레에는 마물이 없습니다.
   난이도마다 게이트의 등급과 지형이 달라서 블록 모양도 다릅니다. (숲 지대 / 수정 동굴 / 용암 협곡 / 심연의 균열)
   조작: 누르면 열기, PC는 오른쪽 클릭·폰은 길게 누르기(또는 '표식 모드')로 표식 남기기,
         열린 숫자를 누르면 표식 수가 맞을 때 둘레 칸을 한꺼번에 엽니다.
   그림은 모두 캔버스로 그리고, 이미지 파일은 쓰지 않습니다.
*/
(function(){
 var root=document.getElementById('gsr');if(!root)return;
 var U=40;                                                                // 칸 하나의 그림 크기
 // 이름, 등급, 지형, [가로,세로,마물] (넓은 화면), [가로,세로,마물] (좁은 화면)
 var LV=[
  {n:'쉬움',g:'F급',z:'숲 지대',    th:0,w:[9,9,10],  s:[9,9,10]},
  {n:'보통',g:'D급',z:'수정 동굴',  th:1,w:[16,12,30],s:[10,12,20]},
  {n:'어려움',g:'B급',z:'용암 협곡',th:2,w:[24,14,60],s:[12,16,38]},
  {n:'극한',g:'SS급',z:'심연의 균열',th:3,w:[30,16,99],s:[14,18,55]}];
 var TH=[
  {a:'#6a9a4e',b:'#3f6b36',hi:'#b6e08c',sh:'#1d3319',floor:'#1b2619',speck:'#2f4228',eye:'#ffe27a',acc:'#ffd36a'},      // 숲
  {a:'#86bdeb',b:'#4b7fb6',hi:'#e3f5ff',sh:'#1f4268',floor:'#0e1a2b',speck:'#1e3a5c',eye:'#7ff3ff',acc:'#ffd36a'},      // 수정
  {a:'#54403b',b:'#2b1b19',hi:'#8a5f52',sh:'#120807',floor:'#190c0a',speck:'#4a2418',eye:'#ffb04a',acc:'#ffd36a',cr:'#ff7a2a'}, // 용암
  {a:'#40306a',b:'#1b1031',hi:'#8d6fd6',sh:'#09050f',floor:'#0a0612',speck:'#2a1c4a',eye:'#ff58dc',acc:'#ffd36a',ru:'#c98aff'}];  // 심연
 var NC=['','#8fd3ff','#7be08a','#ff8a8a','#b79cff','#ffb36b','#6ee7d8','#f4f4f4','#b8b8b8'];
 var lv=1,cols,rows,mines,mine,num,st,over,won,first,flags,opened,boom,hv,t0,secs,tm,best={},fmode=false,wideKey='w';
 try{best=JSON.parse(localStorage.getItem('gsbest')||'{}')||{};lv=Math.min(3,Math.max(0,+localStorage.getItem('gslv')||1))}catch(e){best={}}

 root.innerHTML='<div class="mm"><p class="mm-lead">지뢰 찾기예요. 칸을 눌러 열고, 숫자는 그 칸 주변 8칸에 숨은 마물(지뢰)의 수예요. 마물이 없는 칸을 전부 열면 클리어!<br>마물이 있을 것 같은 칸에는 표식을 남겨요. PC는 오른쪽 클릭, 폰은 길게 누르거나 “표식 모드”를 켜세요.</p>'
  +'<div class="mm-bar"><div class="chips" id="gslv">'+LV.map(function(l,i){return '<button class="chip" data-l="'+i+'" aria-pressed="'+(i===lv)+'">'+l.n+' <small>'+l.g+'</small></button>'}).join('')+'<button class="chip" id="gsfl" aria-pressed="false" title="켜면 누르는 칸에 표식을 남겨요">표식 모드</button></div><div class="mm-stat" id="gsstat"></div></div>'
  +'<div class="gs-zone" id="gszone"></div>'
  +'<canvas id="gsc" class="mb-cv gs-cv" aria-label="지뢰 찾기 판. 칸을 눌러 열어요"></canvas>'
  +'<div class="mm-info" id="gsinfo" aria-live="polite"></div><div class="mm-bar"><button class="rlink" id="gsre">다시 시작</button></div></div>';
 var cv=document.getElementById('gsc'),ctx=cv.getContext('2d'),stat=document.getElementById('gsstat'),info=document.getElementById('gsinfo'),zone=document.getElementById('gszone');

 function mmss(s){return Math.floor(s/60)+':'+(s%60<10?'0':'')+s%60}
 function rnd(r,c,k){var x=Math.sin((r*131+c*17+k*7.13)*12.9898)*43758.5453;return x-Math.floor(x)}
 function nb(r,c,f){for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;var rr=r+dr,cc=c+dc;if(rr>=0&&rr<rows&&cc>=0&&cc<cols)f(rr,cc)}}

 // ── 규칙 ──
 function newGame(){
  var wide=window.innerWidth>=600,L=LV[lv],d=wide?L.w:L.s;cols=d[0];rows=d[1];mines=d[2];wideKey=wide?'w':'n';
  mine=[];num=[];st=[];for(var r=0;r<rows;r++){mine.push(new Array(cols).fill(false));num.push(new Array(cols).fill(0));st.push(new Array(cols).fill(0))}
  over=false;won=false;first=true;flags=0;opened=0;boom=null;hv=null;secs=0;clearInterval(tm);tm=0;t0=0;info.innerHTML='';
  cv.width=cols*U;cv.height=rows*U;cv.style.aspectRatio=cols+'/'+rows;cv.style.maxWidth=cols*46+'px';
  zone.textContent=L.g+' 게이트 · '+L.z;drawStat();draw()}
 function plant(r0,c0){
  var cand=[];for(var r=0;r<rows;r++)for(var c=0;c<cols;c++)if(Math.abs(r-r0)>1||Math.abs(c-c0)>1)cand.push([r,c]);
  for(var i=cand.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=cand[i];cand[i]=cand[j];cand[j]=t}
  for(var k=0;k<mines&&k<cand.length;k++)mine[cand[k][0]][cand[k][1]]=true;
  for(r=0;r<rows;r++)for(c=0;c<cols;c++){var n=0;nb(r,c,function(a,b){if(mine[a][b])n++});num[r][c]=n}}
 function open(r,c){
  if(over||st[r][c]!==0)return;
  if(first){first=false;plant(r,c);t0=Date.now();tm=setInterval(tick,250)}
  if(mine[r][c]){boom=[r,c];return lose()}
  var q=[[r,c]];
  while(q.length){var p=q.pop(),a=p[0],b=p[1];if(st[a][b]!==0)continue;st[a][b]=1;opened++;
   if(!num[a][b])nb(a,b,function(x,y){if(st[x][y]===0&&!mine[x][y])q.push([x,y])})}
  if(opened===rows*cols-mines)win()}
 function chord(r,c){
  if(st[r][c]!==1||!num[r][c])return;var f=0;nb(r,c,function(a,b){if(st[a][b]===2)f++});
  if(f!==num[r][c])return;nb(r,c,function(a,b){if(!over&&st[a][b]===0)open(a,b)})}
 function flag(r,c){
  if(over||st[r][c]===1)return;if(first)return;                              // 첫 칸을 열기 전에는 표식을 남기지 않습니다
  st[r][c]=st[r][c]===2?0:2;flags+=st[r][c]===2?1:-1;drawStat();draw()}
 function tick(){if(t0&&!over){secs=Math.floor((Date.now()-t0)/1000);drawStat()}}
 function drawStat(){var k=lv+wideKey,b=best[k];stat.innerHTML='마물 <b>'+(mines-flags)+'</b> · 시간 <b>'+mmss(secs)+'</b>'+(b?' · 최고 <b>'+mmss(b)+'</b>':'')}
 function end(){over=true;clearInterval(tm);tm=0;if(t0)secs=Math.floor((Date.now()-t0)/1000);drawStat()}
 function win(){
  end();won=true;for(var r=0;r<rows;r++)for(var c=0;c<cols;c++)if(mine[r][c]&&st[r][c]!==2){st[r][c]=2}
  flags=mines;var k=lv+wideKey,prev=best[k],rec=!prev||secs<prev;
  if(rec){best[k]=secs;try{localStorage.setItem('gsbest',JSON.stringify(best))}catch(e){}}
  drawStat();draw();
  info.innerHTML='<b>게이트 돌파!</b> 마물이 숨은 칸을 모두 피했어요.'+(rec&&prev?' — 새 최고 기록이에요':'')+' <button class="go" id="gsagain">다시 하기</button>'}
 function lose(){
  end();drawStat();draw();
  info.innerHTML='<b>마물에게 들켰어요.</b> 숨어 있던 마물이 모두 드러났어요. <button class="go" id="gsagain">다시 하기</button>'}

 // ── 그리기 ──
 function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
 function floor(x,y,r,c,T){
  ctx.fillStyle=T.floor;ctx.fillRect(x,y,U,U);
  ctx.fillStyle=T.speck;for(var i=0;i<2;i++){ctx.fillRect(x+4+rnd(r,c,i)*(U-10),y+4+rnd(r,c,i+9)*(U-10),2,2)}
  ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,U-1,U-1)}
 function block(x,y,r,c,T,th,hot){
  ctx.save();rr(x+2,y+2,U-4,U-4,6);ctx.clip();
  var g=ctx.createLinearGradient(x,y,x+U,y+U);g.addColorStop(0,T.a);g.addColorStop(1,T.b);ctx.fillStyle=g;ctx.fillRect(x,y,U,U);
  if(th===0){                                                             // 숲: 풀잎과 작은 꽃
   ctx.strokeStyle=T.hi;ctx.globalAlpha=.55;ctx.lineWidth=1.6;ctx.lineCap='round';
   for(var i=0;i<4;i++){var bx=x+7+i*8+rnd(r,c,i)*3,by=y+U-6;ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(bx+(rnd(r,c,i+4)-.5)*6,by-8,bx+(rnd(r,c,i+8)-.5)*8,by-13-rnd(r,c,i+2)*5);ctx.stroke()}
   ctx.globalAlpha=1;if(rnd(r,c,30)>.82){ctx.fillStyle=rnd(r,c,31)>.5?'#fff3f7':'#ffe58a';ctx.beginPath();ctx.arc(x+10+rnd(r,c,32)*20,y+9+rnd(r,c,33)*8,2.2,0,6.3);ctx.fill()}
  }else if(th===1){                                                       // 수정: 면
   ctx.fillStyle='rgba(255,255,255,.28)';ctx.beginPath();ctx.moveTo(x+2,y+2);ctx.lineTo(x+U*.62,y+2);ctx.lineTo(x+2,y+U*.62);ctx.fill();
   ctx.fillStyle='rgba(20,50,100,.25)';ctx.beginPath();ctx.moveTo(x+U-2,y+U-2);ctx.lineTo(x+U*.35,y+U-2);ctx.lineTo(x+U-2,y+U*.35);ctx.fill();
   if(rnd(r,c,5)>.8){ctx.fillStyle='#fff';var sx=x+U*(.55+rnd(r,c,6)*.3),sy=y+U*(.2+rnd(r,c,7)*.3);ctx.fillRect(sx-1,sy-4,2,8);ctx.fillRect(sx-4,sy-1,8,2)}
  }else if(th===2){                                                       // 용암: 갈라진 틈
   if(rnd(r,c,40)>=.4){
   var px=x+6+rnd(r,c,1)*10,py=y+4,pts=[[px,py]];for(i=1;i<5;i++){px+=(rnd(r,c,i+10)-.35)*12;py+=8+rnd(r,c,i+20)*4;pts.push([Math.min(x+U-4,Math.max(x+4,px)),py])}
   ctx.lineJoin='round';ctx.lineCap='round';
   [[5,'rgba(255,110,30,.25)'],[1.8,T.cr]].forEach(function(s){ctx.lineWidth=s[0];ctx.strokeStyle=s[1];ctx.beginPath();pts.forEach(function(p,j){j?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.stroke()})}
  }else{                                                                  // 심연: 룬 (일부 칸에만, 나머지는 흐린 고리)
   var cx=x+U/2,cy=y+U/2,rd=U*.2,k=rnd(r,c,2);ctx.strokeStyle=T.ru;ctx.lineWidth=1.3;
   if(k>.72){ctx.globalAlpha=.6;ctx.beginPath();ctx.arc(cx,cy,rd*1.15,0,6.3);ctx.stroke();ctx.beginPath();
    var a0=rnd(r,c,3)*3.14;for(i=0;i<3;i++){var an=a0+i*2.094;ctx.lineTo(cx+Math.cos(an)*rd,cy+Math.sin(an)*rd)}ctx.closePath();ctx.stroke()}
   else if(k>.4){ctx.globalAlpha=.25;ctx.beginPath();ctx.arc(cx,cy,rd*1.15,0,6.3);ctx.stroke()}
   ctx.globalAlpha=1}
  // 모서리 빛과 그림자
  ctx.fillStyle=T.hi;ctx.globalAlpha=.5;ctx.fillRect(x+2,y+2,U-4,3);ctx.fillRect(x+2,y+2,3,U-4);
  ctx.fillStyle=T.sh;ctx.globalAlpha=.55;ctx.fillRect(x+2,y+U-5,U-4,3);ctx.fillRect(x+U-5,y+2,3,U-4);ctx.globalAlpha=1;
  if(hot){ctx.fillStyle='rgba(255,255,255,.16)';ctx.fillRect(x,y,U,U)}
  ctx.restore()}
 function monster(x,y,T){
  var cx=x+U/2,cy=y+U/2+2;ctx.fillStyle='#0a0709';ctx.beginPath();ctx.ellipse(cx,cy+1,U*.33,U*.28,0,0,6.3);ctx.fill();
  ctx.beginPath();ctx.moveTo(cx-U*.28,cy-U*.12);ctx.lineTo(cx-U*.2,cy-U*.34);ctx.lineTo(cx-U*.08,cy-U*.18);ctx.moveTo(cx+U*.28,cy-U*.12);ctx.lineTo(cx+U*.2,cy-U*.34);ctx.lineTo(cx+U*.08,cy-U*.18);ctx.fill();
  ctx.fillStyle=T.eye;ctx.shadowColor=T.eye;ctx.shadowBlur=6;
  [-1,1].forEach(function(s){ctx.beginPath();ctx.ellipse(cx+s*U*.13,cy-U*.02,U*.07,U*.09,s*.35,0,6.3);ctx.fill()});ctx.shadowBlur=0}
 function flagIcon(x,y,T,bad){
  var px=x+U*.42;ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(x+U*.5,y+U*.78,U*.2,U*.06,0,0,6.3);ctx.fill();
  ctx.strokeStyle='#f1e6d0';ctx.lineWidth=2.2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(px,y+U*.78);ctx.lineTo(px,y+U*.2);ctx.stroke();
  ctx.fillStyle=T.acc;ctx.beginPath();ctx.moveTo(px,y+U*.2);ctx.lineTo(px+U*.34,y+U*.34);ctx.lineTo(px,y+U*.5);ctx.closePath();ctx.fill();
  if(bad){ctx.strokeStyle='#ff4d4d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+8,y+8);ctx.lineTo(x+U-8,y+U-8);ctx.moveTo(x+U-8,y+8);ctx.lineTo(x+8,y+U-8);ctx.stroke()}}
 function draw(){
  var T=TH[LV[lv].th],th=LV[lv].th;
  for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
   var x=c*U,y=r*U,s=st[r][c],shown=s===1||(over&&!won&&mine[r][c]&&s!==2);
   if(shown){
    floor(x,y,r,c,T);
    if(mine[r][c]){if(boom&&boom[0]===r&&boom[1]===c){ctx.fillStyle='rgba(255,60,60,.4)';ctx.fillRect(x,y,U,U)}monster(x,y,T)}
    else if(num[r][c]){ctx.font='800 '+Math.round(U*.58)+'px "Trebuchet MS",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
     ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillText(num[r][c],x+U/2+1,y+U/2+2);ctx.fillStyle=NC[num[r][c]];ctx.fillText(num[r][c],x+U/2,y+U/2+1)}
   }else{
    block(x,y,r,c,T,th,hv&&hv[0]===r&&hv[1]===c&&!over);
    if(s===2)flagIcon(x,y,T,over&&!won&&!mine[r][c]);
   }}}

 // ── 조작 ──
 function cellAt(e){var b=cv.getBoundingClientRect(),c=Math.floor((e.clientX-b.left)/b.width*cols),r=Math.floor((e.clientY-b.top)/b.height*rows);
  return (r>=0&&r<rows&&c>=0&&c<cols)?[r,c]:null}
 function act(r,c){
  if(over)return;
  if(fmode){flag(r,c);return}
  if(st[r][c]===1)chord(r,c);else if(st[r][c]===0)open(r,c);
  draw();if(!over)drawStat()}
 var press=null;
 cv.addEventListener('pointerdown',function(e){
  if(e.pointerType==='mouse'&&e.button!==0)return;var p=cellAt(e);if(!p)return;
  press={p:p,x:e.clientX,y:e.clientY,lp:false,t:e.pointerType};
  if(e.pointerType!=='mouse'){press.tm=setTimeout(function(){if(press){press.lp=true;flag(p[0],p[1]);if(navigator.vibrate)try{navigator.vibrate(18)}catch(x){}}},380)}});
 cv.addEventListener('pointermove',function(e){
  if(press&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>10){clearTimeout(press.tm);press=null}
  if(e.pointerType==='mouse'){var p=cellAt(e),k=p?p[0]+','+p[1]:'',h=hv?hv[0]+','+hv[1]:'';if(k!==h){hv=p;if(!over)draw()}}});
 cv.addEventListener('pointerleave',function(){if(hv){hv=null;if(!over)draw()}});
 cv.addEventListener('pointerup',function(e){
  if(!press)return;clearTimeout(press.tm);var q=press;press=null;if(q.lp)return;act(q.p[0],q.p[1])});
 cv.addEventListener('pointercancel',function(){if(press){clearTimeout(press.tm);press=null}});
 cv.addEventListener('contextmenu',function(e){e.preventDefault();var p=cellAt(e);if(p)flag(p[0],p[1])});
 document.getElementById('gslv').addEventListener('click',function(e){
  var b=e.target.closest('.chip');if(!b||!b.dataset.l)return;lv=+b.dataset.l;try{localStorage.setItem('gslv',lv)}catch(x){}
  [].forEach.call(this.querySelectorAll('.chip[data-l]'),function(c){c.setAttribute('aria-pressed',c===b)});newGame()});
 document.getElementById('gsfl').addEventListener('click',function(){fmode=!fmode;this.setAttribute('aria-pressed',fmode)});
 document.getElementById('gsre').addEventListener('click',newGame);
 info.addEventListener('click',function(e){if(e.target.id==='gsagain')newGame()});
 newGame();
})();
