/* ═══ 마나 버블 ═════════════════════════════════════════════════════
   천장에 매달린 마나 구슬에 같은 색 구슬을 쏘아 맞추는 놀이입니다. 같은 색이 셋 이상 모이면 터지고,
   터진 뒤 천장에서 떨어진 구슬은 함께 떨어집니다. 쏘고도 터뜨리지 못하면 천장이 한 줄씩 내려옵니다.
   구슬은 12학부의 상징색과 문양입니다. 난이도마다 쓰는 학부 수가 다릅니다. 화면 밖이거나 탭이 가려져 있으면 멈춥니다.
*/
(function(){
 var root=document.getElementById('mbr');if(!root)return;
 var R=18,W=360,H=520,RH=R*Math.sqrt(3),SX=W/2,SY=H-44,LIM=11,V=820;       // 구슬 반지름 / 판 크기 / 행 간격 / 발사 위치 / 이 행에 닿으면 끝 / 발사 속도
 var COL=[];
 var NM=0,IMG=[];                                                             // 구슬 번호 = 학부 번호(FAC 순서). 상징색 구슬에 학부 문양을 찍습니다
 if(typeof F!=="undefined"&&typeof ID!=="undefined")for(var fi=0;fi<12;fi++){
  var fc=F[fi][2],lum=(parseInt(fc.substr(1,2),16)*.299+parseInt(fc.substr(3,2),16)*.587+parseInt(fc.substr(5,2),16)*.114)/255;
  if(lum<.3){var q=parseInt(fc.slice(1),16),m=function(v){return Math.min(255,Math.round(v+(255-v)*.4))};fc='#'+[q>>16,q>>8&255,q&255].map(function(v){return ('0'+m(v).toString(16)).slice(-2)}).join('')}
  COL.push(fc);var im=new Image();im.src='img/'+ID[fi]+'.png';IMG.push(im)}
 var LV=[['쉬움',[3,4,8,11],7,6],['보통',[3,4,6,8,11],6,6],['어려움',[0,3,4,6,8,11],5,6],['극한',[0,1,2,3,4,5,6,7,8,9,10,11],7,4]];  // 이름, 쓰는 학부, 하강 발수, 시작 줄 수
 var lv=1,g,par,cur,nxt,miss,score,state,ang,proj,aiming,yoff,pops,parts,falls,shots,secs,tm,best={},vis=false,raf=0,last=0,lastAt=0,cw=0;
 var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
 try{best=JSON.parse(localStorage.getItem('mbbest')||'{}')||{}}catch(e){best={}}
 function mix(h,t,k){var n=parseInt(h.slice(1),16),r=n>>16,gg=n>>8&255,b=n&255,T=t?255:0;return 'rgb('+Math.round(r+(T-r)*k)+','+Math.round(gg+(T-gg)*k)+','+Math.round(b+(T-b)*k)+')'}
 var LI=COL.map(function(c){return mix(c,1,.6)}),DK=COL.map(function(c){return mix(c,0,.5)});
 function mmss(s){return Math.floor(s/60)+':'+(s%60<10?'0':'')+(s%60)}
 function rnd(a,b){return a+Math.random()*(b-a)}

 root.innerHTML='<div class="mm"><p class="mm-lead">화면을 눌러 조준하고 손을 떼면 발사해요. 같은 색 구슬 셋 이상을 모아 터뜨려 보세요. 왼쪽 아래의 작은 구슬을 누르면 순서가 바뀌어요.</p>'
  +'<div class="mm-bar"><div class="chips" id="mblv">'+LV.map(function(l,i){return '<button class="chip" data-l="'+i+'" aria-pressed="'+(i===lv)+'">'+l[0]+'</button>'}).join('')+'</div><div class="mm-stat" id="mbstat"></div></div>'
  +'<canvas id="mbc" class="mb-cv" tabindex="0" aria-label="마나 버블 판. 방향키로 조준하고 스페이스로 발사해요"></canvas>'
  +'<div class="mm-info" id="mbinfo" aria-live="polite"></div><div class="mm-bar"><button class="rlink" id="mbre">다시 시작</button></div></div>';
 var cv=document.getElementById('mbc'),ctx=cv.getContext('2d'),stat=document.getElementById('mbstat'),info=document.getElementById('mbinfo');

 // ── 격자 ── 줄마다 반 칸씩 어긋납니다. 천장이 내려올 때 줄이 하나 늘며 par 가 뒤집혀 기존 줄의 모양은 그대로 유지됩니다.
 function cols(i){return ((i+par)&1)?9:10}
 function pos(i,c){return [R+c*2*R+(((i+par)&1)?R:0),R+i*RH]}
 function ensure(r){while(g.length<=r)g.push(new Array(cols(g.length)).fill(-1))}
 function nb(i,c){
  var o=[],odd=(i+par)&1,rr,k;
  if(c>0)o.push([i,c-1]);if(c<cols(i)-1)o.push([i,c+1]);
  [i-1,i+1].forEach(function(r){if(r<0||r>=g.length)return;
   (odd?[c,c+1]:[c-1,c]).forEach(function(cc){if(cc>=0&&cc<cols(r))o.push([r,cc])})});
  return o}
 function present(){var s={},a=[];g.forEach(function(row){row.forEach(function(v){if(v>=0)s[v]=1})});for(var k in s)a.push(+k);return a}
 function pick(){var p=present();if(!p.length)p=LV[lv][1];return p[Math.floor(Math.random()*p.length)]}


 function newGame(){
  clearInterval(tm);tm=0;
  g=[];par=0;var set=LV[lv][1];
  for(var i=0;i<LV[lv][3];i++){var row=[];for(var c=0;c<cols(i);c++)row.push(set[Math.floor(Math.random()*set.length)]);g.push(row)}
  cur=pick();nxt=pick();miss=0;score=0;shots=0;secs=0;state='play';ang=Math.PI/2;proj=null;aiming=false;yoff=0;pops=[];parts=[];falls=[];info.innerHTML='';
  drawStat();wake()}
 function drawStat(){var b=best[lv];stat.innerHTML='점수 <b>'+score+'</b> · 하강까지 <b>'+Math.max(0,LV[lv][2]-miss)+'</b>발 · 시간 <b>'+mmss(secs)+'</b>'+(b?' · 최고 <b>'+b+'</b>':'')}
 function timer(){if(!tm)tm=setInterval(function(){if(state==='play'){secs++;drawStat()}},1000)}

 // ── 발사와 충돌 ──
 function setAim(e){var r=cv.getBoundingClientRect();if(!r.width)return;
  var x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H;
  ang=Math.max(.21,Math.min(Math.PI-.21,Math.atan2(SY-y,x-SX)))}
 function fire(){if(proj||state!=='play')return;timer();proj={x:SX,y:SY,vx:Math.cos(ang)*V,vy:-Math.sin(ang)*V,c:cur};cur=nxt;nxt=pick();wake()}
 function swap(){if(proj||state!=='play')return;var t=cur;cur=nxt;nxt=t}
 function hit(x,y){if(y<=R)return true;
  for(var i=0;i<g.length;i++)for(var c=0;c<g[i].length;c++)if(g[i][c]>=0){var p=pos(i,c),dx=p[0]-x,dy=p[1]-y;if(dx*dx+dy*dy<R*R*3.4)return true}
  return false}
 function moveProj(dt){
  var n=Math.max(1,Math.ceil(V*dt/5)),h=dt/n;
  for(var s=0;s<n;s++){
   proj.x+=proj.vx*h;proj.y+=proj.vy*h;
   if(proj.x<R){proj.x=R;proj.vx=-proj.vx}else if(proj.x>W-R){proj.x=W-R;proj.vx=-proj.vx}
   if(hit(proj.x,proj.y)){land();return}}}
 function findCell(px,py){
  var r0=Math.round((py-R)/RH),best=1e9,bc=null;ensure(Math.max(r0+1,LIM+2));
  for(var r=Math.max(0,r0-1);r<=r0+1;r++)for(var c=0;c<cols(r);c++){
   if(g[r][c]>=0)continue;
   var ok=r===0||nb(r,c).some(function(q){return g[q[0]][q[1]]>=0});if(!ok)continue;
   var p=pos(r,c),d=(p[0]-px)*(p[0]-px)+(p[1]-py)*(p[1]-py);if(d<best){best=d;bc=[r,c]}}
  return bc}
 function land(){
  var cell=findCell(proj.x,proj.y),col=proj.c;proj=null;shots++;
  if(!cell){finish(false);return}
  g[cell[0]][cell[1]]=col;
  var seen={},grp=[[cell[0],cell[1],0]],q=[[cell[0],cell[1]]];seen[cell[0]+','+cell[1]]=1;
  while(q.length){var a=q.shift();nb(a[0],a[1]).forEach(function(n){var k=n[0]+','+n[1];if(!seen[k]&&g[n[0]][n[1]]===col){seen[k]=1;grp.push([n[0],n[1],grp.length]);q.push(n)}})}
  if(grp.length>=3){
   grp.forEach(function(m,i){remove(m[0],m[1],i*.035)});score+=grp.length*10;miss=0;
   var reach={},st=[];
   g[0].forEach(function(v,c){if(v>=0){reach['0,'+c]=1;st.push([0,c])}});
   while(st.length){var a=st.pop();nb(a[0],a[1]).forEach(function(n){var k=n[0]+','+n[1];if(!reach[k]&&g[n[0]][n[1]]>=0){reach[k]=1;st.push(n)}})}
   var fell=0;
   g.forEach(function(row,i){row.forEach(function(v,c){if(v>=0&&!reach[i+','+c]){var p=pos(i,c);falls.push({x:p[0],y:p[1]+yoff,vx:rnd(-60,60),vy:rnd(-160,-40),c:v});row[c]=-1;fell++}})});
   score+=fell*20*(fell>1?2:1);
  }else miss++;
  if(!present().length){finish(true);return}
  if(miss>=LV[lv][2]){addRow();miss=0}
  if(over())return finish(false);
  var p=present();if(p.indexOf(cur)<0)cur=pick();if(p.indexOf(nxt)<0)nxt=pick();
  drawStat()}
 function remove(r,c,delay){var p=pos(r,c),v=g[r][c];g[r][c]=-1;pops.push({x:p[0],y:p[1]+yoff,c:v,age:-delay});
  for(var i=0;i<(reduce?2:7);i++){var a=rnd(0,6.283),s=rnd(60,200);parts.push({x:p[0],y:p[1]+yoff,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:-delay,max:rnd(.3,.6),c:v})}}
 function addRow(){par^=1;var row=[],set=present();if(!set.length)set=LV[lv][1];
  for(var c=0;c<cols(0);c++)row.push(set[Math.floor(Math.random()*set.length)]);g.unshift(row);yoff=-RH}
 function over(){for(var r=LIM;r<g.length;r++)for(var c=0;c<g[r].length;c++)if(g[r][c]>=0)return true;return false}
 function finish(win){
  state=win?'win':'over';clearInterval(tm);tm=0;drawStat();
  if(win)score+=Math.max(0,300-shots*5);
  var prev=best[lv],rec=win&&(!prev||score>prev);if(rec){best[lv]=score;try{localStorage.setItem('mbbest',JSON.stringify(best))}catch(e){}}
  drawStat();
  info.innerHTML=(win?'<b>마나를 모두 정화했어요!</b> '+shots+'발, '+mmss(secs)+'에 끝냈어요'+(rec?' — 새 최고 점수예요':''):'<b>구슬이 선까지 내려왔어요.</b> 한 번 더 해 볼까요?')
   +' <button class="go" id="mbagain">다시 하기</button>'}

 // ── 장면 갱신 ──
 function update(dt){
  if(state==='play'&&proj)moveProj(dt);
  if(yoff<0){yoff=Math.min(0,yoff+RH*dt*5)}
  pops.forEach(function(p){p.age+=dt});pops=pops.filter(function(p){return p.age<.24});
  parts.forEach(function(p){p.age+=dt;if(p.age>0){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=260*dt}});parts=parts.filter(function(p){return p.age<p.max});
  falls.forEach(function(f){f.vy+=900*dt;f.x+=f.vx*dt;f.y+=f.vy*dt});falls=falls.filter(function(f){return f.y<H+R*2})}

 // ── 그리기 ──
 function ball(x,y,c,s,a){
  s=s||1;ctx.save();ctx.globalAlpha=a==null?1:a;
  var gr=ctx.createRadialGradient(x-R*.35*s,y-R*.4*s,R*.08*s,x,y,R*s);
  gr.addColorStop(0,LI[c]);gr.addColorStop(.45,COL[c]);gr.addColorStop(1,DK[c]);
  ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,(R-1)*s,0,6.2832);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=1;ctx.stroke();
  if(c>=NM&&IMG[c-NM]&&IMG[c-NM].complete&&IMG[c-NM].naturalWidth){var q=R*1.15*s;ctx.globalCompositeOperation='multiply';ctx.globalAlpha=(a==null?1:a)*.7;ctx.drawImage(IMG[c-NM],x-q/2,y-q/2,q,q);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=a==null?1:a}
  ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.ellipse(x-R*.3*s,y-R*.38*s,R*.2*s,R*.12*s,-.6,0,6.2832);ctx.fill();
  ctx.restore()}
 function ray(){
  var x=SX,y=SY,vx=Math.cos(ang),vy=-Math.sin(ang),d=0,out=[];
  for(var i=0;i<420;i++){x+=vx*3;y+=vy*3;d+=3;
   if(x<R){x=R;vx=-vx}else if(x>W-R){x=W-R;vx=-vx}
   if(hit(x,y))break;if(d%12===0)out.push([x,y])}
  return out}
 function draw(){
  if(!cw)return;
  ctx.clearRect(0,0,W,H);
  var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#17141f');bg.addColorStop(1,'#0c0b10');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  var cy=R+(LIM-1)*RH+R+3;
  ctx.strokeStyle='rgba(217,194,138,.35)';ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(W,cy);ctx.stroke();ctx.setLineDash([]);
  for(var i=0;i<g.length;i++)for(var c=0;c<g[i].length;c++)if(g[i][c]>=0){var p=pos(i,c);ball(p[0],p[1]+yoff,g[i][c])}
  if(state==='play'&&!proj){ray().forEach(function(p,i,a){ctx.fillStyle='rgba(240,230,200,'+(.65-i/a.length*.4)+')';ctx.beginPath();ctx.arc(p[0],p[1],2.2,0,6.2832);ctx.fill()})}
  ctx.save();ctx.globalCompositeOperation='lighter';
  pops.forEach(function(p){if(p.age<0)return;var u=p.age/.24;ctx.globalAlpha=1-u;ctx.fillStyle=COL[p.c];ctx.beginPath();ctx.arc(p.x,p.y,R*(1+u*.8),0,6.2832);ctx.fill()});
  parts.forEach(function(p){if(p.age<0)return;ctx.globalAlpha=1-p.age/p.max;ctx.fillStyle=COL[p.c];ctx.beginPath();ctx.arc(p.x,p.y,2.4,0,6.2832);ctx.fill()});
  ctx.restore();
  falls.forEach(function(f){ball(f.x,f.y,f.c)});
  // 발사대
  ctx.save();ctx.translate(SX,SY);ctx.rotate(Math.PI/2-ang);
  ctx.fillStyle='#d9c28a';ctx.fillRect(-4,-R-16,8,20);ctx.restore();
  ctx.fillStyle='#2a2620';ctx.strokeStyle='#d9c28a';ctx.beginPath();ctx.arc(SX,SY,R+5,0,6.2832);ctx.fill();ctx.stroke();
  if(proj)ball(proj.x,proj.y,proj.c);else if(state==='play')ball(SX,SY,cur);
  ball(R*1.6,SY+8,nxt,.72);
  ctx.fillStyle='rgba(240,230,200,.5)';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText('다음',R*1.6,SY+34);
  if(state!=='play'){ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(0,0,W,H)}}
 function layout(){
  var w=cv.clientWidth;if(!w){cw=0;return}
  if(w===cw)return;cw=w;var d=Math.min(2,window.devicePixelRatio||1);
  cv.width=Math.round(w*d);cv.height=Math.round(w*H/W*d);var k=cv.width/W;ctx.setTransform(k,0,0,k,0,0)}
 function frame(t){raf=0;if(!vis)return;layout();var dt=Math.min(.05,(t-last)/1000);last=t;lastAt=performance.now();update(dt);draw();raf=requestAnimationFrame(frame)}
 function wake(){if(vis&&!raf){last=performance.now();raf=requestAnimationFrame(frame)}}

 // ── 입력 ──
 cv.style.touchAction='none';
 cv.addEventListener('pointerdown',function(e){
  var r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H;
  if(Math.hypot(x-R*1.6,y-(SY+8))<R*1.5){swap();return}
  aiming=true;try{cv.setPointerCapture(e.pointerId)}catch(_){}setAim(e);e.preventDefault()});
 cv.addEventListener('pointermove',function(e){if(aiming||e.pointerType==='mouse')setAim(e)});
 cv.addEventListener('pointerup',function(e){if(!aiming)return;aiming=false;setAim(e);fire()});
 cv.addEventListener('pointercancel',function(){aiming=false});
 cv.addEventListener('keydown',function(e){
  if(e.key==='ArrowLeft')ang=Math.min(Math.PI-.21,ang+.05);
  else if(e.key==='ArrowRight')ang=Math.max(.21,ang-.05);
  else if(e.key===' '||e.key==='Enter')fire();
  else if(e.key==='x'||e.key==='X')swap();else return;
  e.preventDefault()});
 root.addEventListener('click',function(e){
  var chip=e.target.closest('#mblv .chip');
  if(chip){lv=+chip.dataset.l;[].forEach.call(root.querySelectorAll('#mblv .chip'),function(x){x.setAttribute('aria-pressed',x===chip)});return newGame()}
  if(e.target.id==='mbre'||e.target.id==='mbagain')newGame()});

 if('IntersectionObserver' in window)new IntersectionObserver(function(en){vis=en[0].isIntersecting;if(vis)wake()},{threshold:.01}).observe(cv);else{vis=true}
 if('ResizeObserver' in window)new ResizeObserver(function(){cw=0;wake()}).observe(cv);
 document.addEventListener('visibilitychange',function(){if(!document.hidden)wake()});
 setInterval(function(){if(vis&&performance.now()-lastAt>800){cancelAnimationFrame(raf);raf=0;wake()}},1000);
 newGame();
})();
