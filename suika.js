/* ═══ 학부 합치기 ═══════════════════════════════════════════════════
   위에서 학부 구슬을 떨어뜨려 쌓는 놀이입니다. 같은 학부의 구슬끼리 닿으면 다음 학부로 합쳐지고,
   마지막에는 교무청이 됩니다. 구슬이 선 위로 쌓여 버티지 못하면 끝납니다.
   구슬은 학부의 상징색에 학부 문양을 찍은 모양이고, 물리는 lib/matter.min.js (Matter.js 0.19, MIT)가 처리합니다.
   합쳐지는 순서는 마르셰 → 로시에 → … → 오르덴 → 교무청 입니다. 화면 밖이거나 탭이 가려져 있으면 멈춥니다.
*/
(function(){
 if(typeof Matter==="undefined"||typeof F==="undefined"||typeof ID==="undefined")return;
 var root=document.getElementById('sgr');if(!root)return;
 var W=420,H=620,LINE=112,SY=58,N=13;                                   // 판 크기 / 넘으면 끝나는 선 / 떨어뜨리는 높이 / 단계 수
 var D=[28,35,43,52,62,73,85,98,112,128,146,166,190];                   // 단계별 구슬의 지름
 var SC=[0,1,3,6,10,15,21,28,36,45,55,66,100];                          // 합쳐서 그 단계가 만들어질 때의 점수
 var M=Matter,E=M.Engine,B=M.Bodies,Bd=M.Body;
 var eng,world,bodies,pending,pops,parts,floats,score,state,aimX,cur,nxt,cool,overT,best=0,vis=false,raf=0,last=0,lastAt=0,cw=0,acc=0,aiming=false,done12=false,ready=false;
 var COL=[],BALL=[],EMB=[],BOX=[];
 var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
 try{best=+localStorage.getItem('sgbest')||0}catch(e){}
 function rnd(a,b){return a+Math.random()*(b-a)}
 function mix(c,t,k){var T=t?255:0;return 'rgb('+c.map(function(v){return Math.round(v+(T-v)*k)}).join(',')+')'}
 function lift(h){var v=[1,3,5].map(function(j){return parseInt(h.substr(j,2),16)});if((v[0]*.299+v[1]*.587+v[2]*.114)/255<.3)v=v.map(function(x){return Math.round(x+(255-x)*.4)});return v}

 root.innerHTML='<div class="mm"><p class="mm-lead">화면을 눌러 위치를 정하고 손을 떼면 떨어져요.<br>같은 학부끼리 닿으면 다음 학부로 합쳐져요.<br>교무청까지 모아 보세요. 구슬이 선을 넘어 쌓이면 끝나요.</p>'
  +'<div class="mm-bar"><div class="mm-stat sg-stat" id="sgstat"></div></div>'
  +'<canvas id="sgc" class="mb-cv sg-cv" tabindex="0" aria-label="학부 합치기 판. 눌러서 위치를 정하고 손을 떼면 떨어져요"></canvas>'
  +'<canvas id="sgchain" class="sg-chain" aria-label="합쳐지는 순서"></canvas>'
  +'<div class="mm-info" id="sginfo" aria-live="polite"></div><div class="mm-bar"><button class="rlink" id="sgre">다시 시작</button></div></div>';
 var cv=document.getElementById('sgc'),ctx=cv.getContext('2d'),chain=document.getElementById('sgchain'),stat=document.getElementById('sgstat'),info=document.getElementById('sginfo');

 // ── 구슬 그림 준비: 색 구슬(BALL)과 문양(EMB)을 단계마다 한 번만 그려 둡니다 ──
 function prep(k,im){
  var sw=160,sh=Math.round(160*im.naturalHeight/im.naturalWidth),c=document.createElement('canvas');c.width=sw;c.height=sh;var x=c.getContext('2d');x.drawImage(im,0,0,sw,sh);
  var d=x.getImageData(0,0,sw,sh).data,minx=sw,maxx=0,miny=sh,maxy=0;
  for(var i=0;i<sw*sh;i++){if(d[i*4]*.299+d[i*4+1]*.587+d[i*4+2]*.114<130){var px=i%sw,py=(i/sw)|0;if(px<minx)minx=px;if(px>maxx)maxx=px;if(py<miny)miny=py;if(py>maxy)maxy=py}}
  var f=im.naturalWidth/sw;BOX[k]=[minx*f,miny*f,(maxx-minx+1)*f,(maxy-miny+1)*f]}
 function build(k){
  var col=lift(F[k][2]);COL[k]=col;var S=2,px=Math.round(D[k]*S),r=px/2;
  var b=document.createElement('canvas');b.width=b.height=px;var x=b.getContext('2d');
  var g=x.createRadialGradient(r*.62,r*.52,r*.08,r,r,r);g.addColorStop(0,mix(col,1,.55));g.addColorStop(.45,'rgb('+col.join(',')+')');g.addColorStop(1,mix(col,0,.5));
  x.fillStyle=g;x.beginPath();x.arc(r,r,r-1,0,6.2832);x.fill();x.strokeStyle='rgba(255,255,255,.22)';x.lineWidth=2;x.stroke();
  BALL[k]=b;
  // 문양: 검은 부분만 반투명한 어두운 색으로 (구슬과 함께 돌아가도록 따로 둠)
  var bx=BOX[k],m=Math.max(bx[2],bx[3]),ew=Math.max(6,Math.round(px*.56*bx[2]/m)),eh=Math.max(6,Math.round(px*.56*bx[3]/m)),e=document.createElement('canvas');e.width=ew;e.height=eh;var y=e.getContext('2d');
  y.imageSmoothingQuality='high';y.fillStyle='#fff';y.fillRect(0,0,ew,eh);y.drawImage(IM[k],bx[0],bx[1],bx[2],bx[3],0,0,ew,eh);
  var im=y.getImageData(0,0,ew,eh),dd=im.data;
  for(var i=0;i<ew*eh;i++){var l=dd[i*4]*.299+dd[i*4+1]*.587+dd[i*4+2]*.114,a=Math.max(0,Math.min(1,(205-l)/110));dd[i*4]=14;dd[i*4+1]=12;dd[i*4+2]=16;dd[i*4+3]=a*190}
  y.putImageData(im,0,0);EMB[k]=e}
 var IM=[];
 function load(){
  var n=0;
  for(var k=0;k<N;k++)(function(k){var im=new Image();im.onload=function(){IM[k]=im;prep(k,im);if(++n===N){for(var j=0;j<N;j++)build(j);ready=true;drawChain();newGame()}};im.onerror=function(){info.textContent='문양 이미지를 불러오지 못했어요.'};im.src='img/'+ID[k]+'.png'})(k)}
 function ball(t,x,y,ang,a,s){
  var d=D[t]*(s||1);ctx.save();ctx.globalAlpha=a==null?1:a;ctx.translate(x,y);
  ctx.drawImage(BALL[t],-d/2,-d/2,d,d);
  ctx.rotate(ang||0);var e=EMB[t],k=d/(D[t]*2);ctx.drawImage(e,-e.width*k/2,-e.height*k/2,e.width*k,e.height*k);ctx.restore()}
 function drawChain(){
  var w=chain.clientWidth||W,d=Math.min(2,window.devicePixelRatio||1),h=44;chain.width=Math.round(w*d);chain.height=Math.round(h*d);
  var x=chain.getContext('2d'),k=w*d/W;x.setTransform(k,0,0,k,0,0);
  var step=W/N,save=ctx;ctx=x;for(var t=0;t<N;t++){var s=Math.min(1,26/D[t]);ball(t,t*step+step/2,22,0,1,s)}ctx=save}

 // ── 규칙 ──
 function mk(t,px,py){
  var b=B.circle(px,py,D[t]/2,{restitution:.18,friction:.2,frictionStatic:.4,frictionAir:.004,slop:.04,density:.001});
  b.tier=t;b.age=0;b.dead=false;return b}
 function spawn(){return Math.random()<.5?Math.floor(Math.random()*3):3+Math.floor(Math.random()*2)}
 function newGame(){
  if(!ready)return;
  eng=E.create({gravity:{x:0,y:1,scale:.0012}});eng.positionIterations=10;eng.velocityIterations=8;world=eng.world;
  var T=40,wall={isStatic:true,friction:.2,restitution:0};
  M.Composite.add(world,[B.rectangle(W/2,H+T/2,W+2*T,T,wall),B.rectangle(-T/2,H/2,T,H*3,wall),B.rectangle(W+T/2,H/2,T,H*3,wall)]);
  M.Events.on(eng,'collisionStart',function(ev){ev.pairs.forEach(function(p){var a=p.bodyA,b=p.bodyB;if(a.tier!=null&&a.tier===b.tier&&!a.dead&&!b.dead&&a.tier<N-1){a.dead=b.dead=true;pending.push([a,b])}})});
  bodies=[];pending=[];pops=[];parts=[];floats=[];score=0;state='play';cur=spawn();nxt=spawn();cool=0;overT=0;aimX=W/2;aiming=false;done12=false;acc=0;info.innerHTML='';
  drawStat();wake()}
 function drawStat(){stat.innerHTML='점수 <b>'+score+'</b>'+(best?' · 최고 <b>'+best+'</b>':'')}
 function drop(){
  if(state!=='play'||cool>0)return;
  var t=cur,hx=D[t]/2,x=Math.max(hx+2,Math.min(W-hx-2,aimX)),b=mk(t,x,SY);M.Composite.add(world,b);bodies.push(b);
  cur=nxt;nxt=spawn();cool=.5;wake()}
 function fx(x,y,t){
  pops.push({x:x,y:y,r:D[t]*.6,age:0,c:COL[t]});
  for(var i=0;i<(reduce?3:10);i++){var a=rnd(0,6.283),s=rnd(40,150);parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:0,max:rnd(.3,.6),c:COL[t]})}}
 function merge(){
  var q=pending;pending=[];
  q.forEach(function(pr){var a=pr[0],b=pr[1],t=a.tier,x=(a.position.x+b.position.x)/2,y=(a.position.y+b.position.y)/2;
   M.Composite.remove(world,a);M.Composite.remove(world,b);bodies=bodies.filter(function(o){return o!==a&&o!==b});
   var nb=mk(t+1,x,y);nb.age=1;Bd.setVelocity(nb,{x:(a.velocity.x+b.velocity.x)/4,y:(a.velocity.y+b.velocity.y)/4});Bd.setAngle(nb,(a.angle+b.angle)/2);
   M.Composite.add(world,nb);bodies.push(nb);fx(x,y,t+1);
   score+=SC[t+1];floats.push({x:x,y:y,t:'+'+SC[t+1],age:0});
   if(t+1===N-1&&!done12){done12=true;floats.push({x:W/2,y:H/2,t:'교무청 완성!',age:-.2,big:true})}});
  if(score>best){best=score;try{localStorage.setItem('sgbest',best)}catch(e){}}
  drawStat()}
 function finish(){
  state='over';drawStat();
  info.innerHTML='<b>구슬이 선을 넘었어요.</b> '+score+'점'+(score&&score>=best?' — 최고 점수예요':'')+' <button class="go" id="sgagain">다시 하기</button>'}

 // ── 장면 갱신과 그리기 ──
 function update(dt){
  if(state==='play'){
   acc+=dt;var n=0;while(acc>=1/60&&n<4){E.update(eng,1000/60);acc-=1/60;n++;bodies.forEach(function(b){b.age+=1/60})}if(n>=4)acc=0;
   if(pending.length)merge();
   if(cool>0)cool-=dt;
   var over=false;bodies.forEach(function(b){if(b.age>1.6&&b.bounds.min.y<LINE)over=true});
   overT=over?overT+dt:0;if(overT>1.4)finish()}
  pops.forEach(function(p){p.age+=dt});pops=pops.filter(function(p){return p.age<.4});
  parts.forEach(function(p){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=260*dt});parts=parts.filter(function(p){return p.age<p.max});
  floats.forEach(function(f){f.age+=dt});floats=floats.filter(function(f){return f.age<(f.big?1.4:.9)})}
 function draw(){
  if(!cw||!ready)return;
  ctx.clearRect(0,0,W,H);
  var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#17141f');bg.addColorStop(1,'#0c0b10');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle=overT>0?'rgba(255,110,110,'+(.5+.4*Math.sin(performance.now()/90))+')':'rgba(217,194,138,.4)';ctx.setLineDash([7,7]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,LINE);ctx.lineTo(W,LINE);ctx.stroke();ctx.setLineDash([]);
  if(state==='play'){
   var hx=D[cur]/2,x=Math.max(hx+2,Math.min(W-hx-2,aimX));
   ctx.strokeStyle='rgba(240,230,200,.18)';ctx.lineWidth=1;ctx.setLineDash([4,6]);ctx.beginPath();ctx.moveTo(x,SY);ctx.lineTo(x,H);ctx.stroke();ctx.setLineDash([]);
   ball(cur,x,SY,0,cool>0?.45:1)}
  bodies.forEach(function(b){ball(b.tier,b.position.x,b.position.y,b.angle)});
  ctx.save();ctx.globalCompositeOperation='lighter';
  pops.forEach(function(p){var u=p.age/.4;ctx.globalAlpha=(1-u)*.8;ctx.strokeStyle='rgb('+p.c.join(',')+')';ctx.lineWidth=4*(1-u)+1;ctx.beginPath();ctx.arc(p.x,p.y,p.r*(.5+u),0,6.2832);ctx.stroke()});
  parts.forEach(function(p){ctx.globalAlpha=1-p.age/p.max;ctx.fillStyle='rgb('+p.c.join(',')+')';ctx.beginPath();ctx.arc(p.x,p.y,2.6,0,6.2832);ctx.fill()});
  ctx.restore();
  var ff=getComputedStyle(root).fontFamily;
  floats.forEach(function(f){if(f.age<0)return;var u=f.age/(f.big?1.4:.9);ctx.globalAlpha=1-u*u;ctx.fillStyle=f.big?'#ffe7a8':'#fff';ctx.font=(f.big?'700 32px ':'700 16px ')+ff;ctx.textAlign='center';ctx.shadowColor='#000';ctx.shadowBlur=6;ctx.fillText(f.t,f.x,f.y-u*28);ctx.shadowBlur=0});
  ctx.globalAlpha=1;
  // 다음 구슬
  ctx.fillStyle='rgba(240,230,200,.5)';ctx.font='12px '+ff;ctx.textAlign='right';ctx.fillText('다음',W-50,28);
  ball(nxt,W-30,24,0,1,Math.min(1,30/D[nxt]));
  if(state!=='play'){ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(0,0,W,H)}}
 function layout(){
  var w=cv.clientWidth;if(!w){cw=0;return}
  if(w===cw)return;cw=w;var d=Math.min(2,window.devicePixelRatio||1),k=w*d/W;
  cv.width=Math.round(w*d);cv.height=Math.round(H*k);ctx.setTransform(k,0,0,k,0,0)}
 function frame(t){raf=0;if(!vis)return;layout();var dt=Math.min(.05,(t-last)/1000);last=t;lastAt=performance.now();update(dt);draw();raf=requestAnimationFrame(frame)}
 function wake(){if(vis&&!raf&&ready){last=performance.now();raf=requestAnimationFrame(frame)}}

 // ── 입력 ──
 function setAim(e){var r=cv.getBoundingClientRect();if(r.width)aimX=(e.clientX-r.left)/r.width*W}
 cv.style.touchAction='none';
 cv.addEventListener('pointerdown',function(e){aiming=true;try{cv.setPointerCapture(e.pointerId)}catch(_){}setAim(e);e.preventDefault()});
 cv.addEventListener('pointermove',function(e){if(aiming||e.pointerType==='mouse')setAim(e)});
 cv.addEventListener('pointerup',function(e){if(!aiming)return;aiming=false;setAim(e);drop()});
 cv.addEventListener('pointercancel',function(){aiming=false});
 cv.addEventListener('keydown',function(e){
  if(e.key==='ArrowLeft')aimX=Math.max(0,aimX-14);else if(e.key==='ArrowRight')aimX=Math.min(W,aimX+14);
  else if(e.key===' '||e.key==='Enter')drop();else return;e.preventDefault()});
 root.addEventListener('click',function(e){if(e.target.id==='sgre'||e.target.id==='sgagain')newGame()});

 if('IntersectionObserver' in window)new IntersectionObserver(function(en){vis=en[0].isIntersecting;if(vis)wake()},{threshold:.01}).observe(cv);else{vis=true}
 if('ResizeObserver' in window)new ResizeObserver(function(){cw=0;wake()}).observe(cv);
 window.addEventListener('resize',function(){if(ready)drawChain()});
 document.addEventListener('visibilitychange',function(){if(!document.hidden)wake()});
 setInterval(function(){if(vis&&ready&&performance.now()-lastAt>800){cancelAnimationFrame(raf);raf=0;wake()}},1000);
 load();
})();
