/* ═══ 컬러 타일 ═════════════════════════════════════════════════════
   색 타일이 어지럽게 놓인 판에서 빈칸을 누르면, 그 칸에서 위·아래·왼쪽·오른쪽으로 가장 가까운 타일 넷(최대)이 골라집니다.
   그중 같은 색이 둘 이상이면 그 타일들이 모두 사라지고 점수가 오릅니다. 맞는 곳이 없으면 시간이 줄어듭니다.
   타일은 12학부의 상징색과 문양입니다. 난이도마다 쓰는 학부 수(색 수)가 다릅니다. 이미지 파일은 학부 문양만 씁니다.
   화면 밖이거나 탭이 가려져 있으면 멈춥니다.
*/
(function(){
 if(typeof F==="undefined"||typeof ID==="undefined")return;
 var root=document.getElementById('ctr');if(!root)return;
 var U=32,PEN=3,FILL=.55;                                                 // 칸 하나의 그림 크기 / 실수 시 줄어드는 초 / 타일이 차 있는 비율
 var LV=[['쉬움',[3,4,6,8,11,0],150,110],['보통',[3,4,6,8,11,0,1,2],120,120],['어려움',[3,4,6,8,11,0,1,2,5,7],120,130],['극한',[0,1,2,3,4,5,6,7,8,9,10,11],120,140]];   // 이름, 쓰는 학부, 제한 시간(초), 목표 점수
 var lv=1,cols,rows,g,score,left,state,started,hov,pops,beams,floats,miss,hit,best={},vis=false,raf=0,last=0,lastAt=0,cw=0,lastSec=-1,goal=false,emb=true;
 var COL=[],IMG=[],LI=[],DK=[];
 var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
 try{best=JSON.parse(localStorage.getItem('ctbest')||'{}')||{};emb=localStorage.getItem('ctemb')!=='0'}catch(e){best={}}
 function mix(h,t,k){var n=parseInt(h.slice(1),16),r=n>>16,gg=n>>8&255,b=n&255,T=t?255:0;return 'rgb('+Math.round(r+(T-r)*k)+','+Math.round(gg+(T-gg)*k)+','+Math.round(b+(T-b)*k)+')'}
 for(var fi=0;fi<12;fi++){var fc=F[fi][2],lum=(parseInt(fc.substr(1,2),16)*.299+parseInt(fc.substr(3,2),16)*.587+parseInt(fc.substr(5,2),16)*.114)/255;
  if(lum<.3){var q=parseInt(fc.slice(1),16),m=function(v){return Math.min(255,Math.round(v+(255-v)*.4))};fc='#'+[q>>16,q>>8&255,q&255].map(function(v){return ('0'+m(v).toString(16)).slice(-2)}).join('')}
  COL.push(fc);LI.push(mix(fc,1,.35));DK.push(mix(fc,0,.3));var im=new Image();im.src='img/'+ID[fi]+'.png';IMG.push(im)}
 function mmss(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+(s%60<10?'0':'')+(s%60)}

 root.innerHTML='<div class="mm"><p class="mm-lead">빈칸을 누르면 위·아래·왼쪽·오른쪽에서 가장 가까운 타일이 골라져요.<br>그중 같은 색이 둘 이상이면 모두 사라지고 점수가 올라요.<br>맞는 곳이 없으면 시간이 '+PEN+'초 줄어요.</p>'
  +'<div class="mm-bar"><div class="chips" id="ctlv">'+LV.map(function(l,i){return '<button class="chip" data-l="'+i+'" aria-pressed="'+(i===lv)+'">'+l[0]+' <small>'+l[1].length+'색</small></button>'}).join('')+'<button class="chip" id="cttg" aria-pressed="'+emb+'" title="타일의 학부 문양을 켜고 꺼요">문양 표시</button></div><div class="mm-stat" id="ctstat"></div></div>'
  +'<canvas id="ctc" class="mb-cv ct-cv" aria-label="컬러 타일 판. 빈칸을 눌러 같은 색 타일을 지워요"></canvas>'
  +'<div class="mm-info" id="ctinfo" aria-live="polite"></div><div class="mm-bar"><button class="rlink" id="ctre">다시 시작</button></div></div>';
 var cv=document.getElementById('ctc'),ctx=cv.getContext('2d'),stat=document.getElementById('ctstat'),info=document.getElementById('ctinfo');

 // ── 규칙 ──
 function near(r,c){var o=[],d=[[-1,0],[1,0],[0,-1],[0,1]];
  for(var i=0;i<4;i++){var rr=r+d[i][0],cc=c+d[i][1];while(rr>=0&&rr<rows&&cc>=0&&cc<cols&&g[rr][cc]<0){rr+=d[i][0];cc+=d[i][1]}
   if(rr>=0&&rr<rows&&cc>=0&&cc<cols)o.push([rr,cc])}
  return o}
 function matches(r,c){var t=near(r,c),n={};t.forEach(function(x){var v=g[x[0]][x[1]];n[v]=(n[v]||0)+1});return t.filter(function(x){return n[g[x[0]][x[1]]]>=2})}
 function anyMove(){for(var r=0;r<rows;r++)for(var c=0;c<cols;c++)if(g[r][c]<0&&matches(r,c).length)return true;return false}
 function tilesLeft(){var n=0;g.forEach(function(row){row.forEach(function(v){if(v>=0)n++})});return n}

 function newGame(){
  var wide=window.innerWidth>=600;cols=wide?23:15;rows=15;      // 좁은 화면은 칸이 너무 작아지지 않게 판을 줄입니다
  var set=LV[lv][1];
  do{g=[];for(var r=0;r<rows;r++){var row=[];for(var c=0;c<cols;c++)row.push(Math.random()<FILL?set[Math.floor(Math.random()*set.length)]:-1);g.push(row)}}while(!anyMove());
  score=0;left=LV[lv][2];state='play';started=false;hov=null;pops=[];beams=[];floats=[];miss=[];hit=null;goal=false;lastSec=-1;info.innerHTML='';
  cv.style.aspectRatio=cols+'/'+rows;cw=0;drawStat();wake()}
 function drawStat(){var b=best[lv];lastSec=Math.ceil(left);
  stat.innerHTML='점수 <b>'+score+'</b> / '+LV[lv][3]+' · 시간 <b>'+mmss(left)+'</b> · 타일 <b>'+tilesLeft()+'</b>'+(b?' · 최고 <b>'+b+'</b>':'')}
 function finish(why){
  state='over';var prev=best[lv],rec=!prev||score>prev;if(score>0&&rec){best[lv]=score;try{localStorage.setItem('ctbest',JSON.stringify(best))}catch(e){}}
  drawStat();
  var ok=score>=LV[lv][3];
  var head=why==='clear'?'<b>모든 타일을 지웠어요!</b> ':why==='stuck'?'<b>더 지울 수 있는 곳이 없어요.</b> ':'<b>시간이 끝났어요.</b> ';
  info.innerHTML=head+score+'점 · '+(ok?'목표를 달성했어요':'목표까지 '+(LV[lv][3]-score)+'점')+(score>0&&rec&&prev?' — 새 최고 점수예요':'')
   +' <button class="go" id="ctagain">다시 하기</button>'}

 function press(r,c){
  if(state!=='play'||g[r][c]>=0)return;
  if(!started)started=true;
  var m=matches(r,c);
  if(m.length){
   var cx=c*U+U/2,cy=r*U+U/2;
   m.forEach(function(x){var v=g[x[0]][x[1]];g[x[0]][x[1]]=-1;
    pops.push({x:x[1]*U+U/2,y:x[0]*U+U/2,c:v,age:0});beams.push({x0:cx,y0:cy,x1:x[1]*U+U/2,y1:x[0]*U+U/2,c:v,age:0})});
   score+=m.length;floats.push({x:cx,y:cy,t:'+'+m.length,c:'#fff',age:0});
   if(!goal&&score>=LV[lv][3]){goal=true;floats.push({x:cols*U/2,y:rows*U/2,t:'목표 달성!',c:'#ffe7a8',age:-.15,big:true})}
   drawStat();
   if(!tilesLeft())return finish('clear');
   if(!anyMove())return finish('stuck');
  }else{
   left-=PEN;miss.push({x:c*U+U/2,y:r*U+U/2,age:0});floats.push({x:c*U+U/2,y:r*U+U/2,t:'−'+PEN+'초',c:'#ff7b7b',age:0});
   if(left<=0){left=0;finish('time');return}
   drawStat()}
  wake()}

 // ── 장면 갱신과 그리기 ──
 function update(dt){
  if(state==='play'&&started){left-=dt;if(left<=0){left=0;finish('time')}else if(Math.ceil(left)!==lastSec)drawStat()}
  [pops,beams,miss,floats].forEach(function(a){a.forEach(function(p){p.age+=dt})});
  pops=pops.filter(function(p){return p.age<.3});beams=beams.filter(function(p){return p.age<.25});miss=miss.filter(function(p){return p.age<.35});floats=floats.filter(function(p){return p.age<(p.big?1.3:.8)})}
 function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
 function tile(x,y,v,s,a){
  s=s||1;var w=(U-4)*s,x0=x+(U-w)/2,y0=y+(U-w)/2;
  ctx.save();ctx.globalAlpha=a==null?1:a;
  var gr=ctx.createLinearGradient(0,y0,0,y0+w);gr.addColorStop(0,LI[v]);gr.addColorStop(.5,COL[v]);gr.addColorStop(1,DK[v]);
  ctx.fillStyle=gr;rr(x0,y0,w,w,6*s);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;ctx.stroke();
  var im=IMG[v];if(emb&&im&&im.complete&&im.naturalWidth){var q=w*.66;ctx.globalCompositeOperation='multiply';ctx.globalAlpha=(a==null?1:a)*.72;ctx.drawImage(im,x0+(w-q)/2,y0+(w-q)/2,q,q);ctx.globalCompositeOperation='source-over'}
  ctx.restore()}
 function draw(){
  if(!cw)return;
  var W=cols*U,H=rows*U;ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#14110d';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(217,194,138,.07)';ctx.lineWidth=1;ctx.beginPath();
  for(var c=0;c<=cols;c++){ctx.moveTo(c*U+.5,0);ctx.lineTo(c*U+.5,H)}for(var r=0;r<=rows;r++){ctx.moveTo(0,r*U+.5);ctx.lineTo(W,r*U+.5)}ctx.stroke();
  // 마우스를 올린 빈칸의 십자 안내 (어느 타일이 골라지는지만 보여 주고, 맞는지는 알려 주지 않습니다)
  if(hov&&state==='play'&&g[hov[0]][hov[1]]<0){
   var t=near(hov[0],hov[1]),hx=hov[1]*U+U/2,hy=hov[0]*U+U/2;
   ctx.strokeStyle='rgba(240,230,200,.28)';ctx.lineWidth=1.5;ctx.beginPath();
   t.forEach(function(x){ctx.moveTo(hx,hy);ctx.lineTo(x[1]*U+U/2,x[0]*U+U/2)});ctx.stroke();
   ctx.fillStyle='rgba(240,230,200,.1)';rr(hov[1]*U+2,hov[0]*U+2,U-4,U-4,6);ctx.fill();
   ctx.strokeStyle='rgba(240,230,200,.6)';ctx.lineWidth=2;t.forEach(function(x){rr(x[1]*U+1.5,x[0]*U+1.5,U-3,U-3,7);ctx.stroke()})}
  for(var r2=0;r2<rows;r2++)for(var c2=0;c2<cols;c2++)if(g[r2][c2]>=0)tile(c2*U,r2*U,g[r2][c2]);
  ctx.save();ctx.globalCompositeOperation='lighter';
  beams.forEach(function(b){var u=b.age/.25;ctx.globalAlpha=(1-u)*.8;ctx.strokeStyle=COL[b.c];ctx.lineWidth=3*(1-u)+1;ctx.beginPath();ctx.moveTo(b.x0,b.y0);ctx.lineTo(b.x0+(b.x1-b.x0)*Math.min(1,u*3),b.y0+(b.y1-b.y0)*Math.min(1,u*3));ctx.stroke()});
  pops.forEach(function(p){var u=p.age/.3;ctx.globalAlpha=(1-u)*.9;ctx.fillStyle=COL[p.c];ctx.beginPath();ctx.arc(p.x,p.y,U*(.4+u*.7),0,6.2832);ctx.fill()});
  ctx.restore();
  pops.forEach(function(p){var u=p.age/.3;tile(p.x-U/2,p.y-U/2,p.c,1-u*.6,1-u)});
  miss.forEach(function(m){var u=m.age/.35;ctx.strokeStyle='rgba(255,100,100,'+(1-u)+')';ctx.lineWidth=3;rr(m.x-U/2+2,m.y-U/2+2,U-4,U-4,6);ctx.stroke()});
  var ff=getComputedStyle(root).fontFamily;
  floats.forEach(function(f){if(f.age<0)return;var u=f.age/(f.big?1.3:.8);ctx.globalAlpha=1-u*u;ctx.fillStyle=f.c;ctx.font=(f.big?'700 30px ':'700 15px ')+ff;ctx.textAlign='center';ctx.shadowColor='#000';ctx.shadowBlur=6;ctx.fillText(f.t,f.x,f.y-u*(f.big?18:26));ctx.shadowBlur=0});
  ctx.globalAlpha=1;
  if(state!=='play'){ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(0,0,W,H)}}
 function layout(){
  var w=cv.clientWidth;if(!w){cw=0;return}
  if(w===cw)return;cw=w;var d=Math.min(2,window.devicePixelRatio||1),k=w*d/(cols*U);
  cv.width=Math.round(w*d);cv.height=Math.round(rows*U*k);ctx.setTransform(k,0,0,k,0,0)}
 function frame(t){raf=0;if(!vis)return;layout();var dt=Math.min(.05,(t-last)/1000);last=t;lastAt=performance.now();update(dt);draw();raf=requestAnimationFrame(frame)}
 function wake(){if(vis&&!raf){last=performance.now();raf=requestAnimationFrame(frame)}}

 // ── 입력 ──
 function cell(e){var r=cv.getBoundingClientRect();if(!r.width)return null;
  var c=Math.floor((e.clientX-r.left)/r.width*cols),rw=Math.floor((e.clientY-r.top)/r.height*rows);
  return c>=0&&c<cols&&rw>=0&&rw<rows?[rw,c]:null}
 cv.style.touchAction='manipulation';
 cv.addEventListener('pointerdown',function(e){var p=cell(e);if(!p)return;if(e.pointerType!=='mouse')hov=null;press(p[0],p[1]);e.preventDefault()});
 cv.addEventListener('pointermove',function(e){if(e.pointerType==='mouse')hov=cell(e)});
 cv.addEventListener('pointerleave',function(){hov=null});
 root.addEventListener('click',function(e){
  var tg=e.target.closest('#cttg');
  if(tg){emb=!emb;tg.setAttribute('aria-pressed',emb);try{localStorage.setItem('ctemb',emb?'1':'0')}catch(_){}return wake()}
  var chip=e.target.closest('#ctlv .chip[data-l]');
  if(chip){lv=+chip.dataset.l;[].forEach.call(root.querySelectorAll('#ctlv .chip[data-l]'),function(x){x.setAttribute('aria-pressed',x===chip)});return newGame()}
  if(e.target.id==='ctre'||e.target.id==='ctagain')newGame()});

 if('IntersectionObserver' in window)new IntersectionObserver(function(en){vis=en[0].isIntersecting;if(vis)wake()},{threshold:.01}).observe(cv);else{vis=true}
 if('ResizeObserver' in window)new ResizeObserver(function(){cw=0;wake()}).observe(cv);
 document.addEventListener('visibilitychange',function(){if(!document.hidden)wake()});
 setInterval(function(){if(vis&&performance.now()-lastAt>800){cancelAnimationFrame(raf);raf=0;wake()}},1000);
 newGame();
})();
