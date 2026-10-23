/* ═══ 주문 제작소 ═══════════════════════════════════════════════════
   여섯 계열의 마나 구슬을 끌어다 가운데 고리에 합치고(최대 3개), 형태를 고르면 마법이 펼쳐집니다.
   · 계열을 합치면 그 조합만의 고유한 색이 나옵니다 (색은 spells.js 의 SPELL_COMBOS 4번째 값).
   · 효과는 그 조합색의 팔레트(주색·밝은색·강조색)로 그리고, 합친 계열의 입자 모양을 조금 섞습니다.
   · 계열이 많이 섞일수록, 큰 형태일수록 더 밝고 크고 풍성하게 펼쳐집니다. (연출의 세기일 뿐입니다)
   ※ 이 칸은 챗봇의 설정과 무관한 순수 미니게임입니다. 서클 같은 챗봇 속 규칙은 여기에 나오지 않습니다.
   처음 만든 주문은 '마법서'에 기록되어 이 브라우저에 저장됩니다.
*/
(function(){
 if(typeof SPELL_COMBOS==="undefined"||typeof SCHOOLS==="undefined")return;
 var root=document.getElementById('wsr');if(!root)return;
 var TAU=Math.PI*2,NF=SPELL_FORMS.length,NC=SPELL_COMBOS.length,TOTAL=NF*NC;
 // 구슬 하나(단일 계열)의 색: 마법 설명에 쓴 그림의 색감
 var PAL=[['#8fd3ff','#ff9b3d','#eef5ff','#7ed957','#ffd93d'],
          ['#ffe7a8','#fff6de','#ffc76b'],
          ['#8a5cff','#5a45e0','#b58cff','#4a5cff'],
          ['#3dff6e','#7dff5a','#1fd65c'],
          ['#4f9bff','#7a7bff','#b9a8ff','#6fd6ff'],
          ['#ff8a2a','#ffb347','#ff6a1a','#ffd27a']];
 var COL=PAL.map(function(p){return p[0]});
 var GRAD=PAL.map(function(p){return 'linear-gradient(135deg,'+p.slice(0,3).join(',')+')'});
 var TYPE=['leaf','mote','smoke','heart','star','streak'];            // 계열마다 입자의 모양이 다릅니다 (조합 효과에 조금씩 섞임)
 var KEY={};SPELL_COMBOS.forEach(function(c,i){KEY[c[0].join('')]=i});
 var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
 function rnd(a,b){return a+Math.random()*(b-a)}
 function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
 function rgba(h,a){return 'rgba('+parseInt(h.substr(1,2),16)+','+parseInt(h.substr(3,2),16)+','+parseInt(h.substr(5,2),16)+','+a+')'}

 // ── 색 계산: 조합색 하나에서 팔레트(주색·밝은색·강조색·짙은색)를 만듭니다 ──────────
 function h2r(h){return [parseInt(h.substr(1,2),16),parseInt(h.substr(3,2),16),parseInt(h.substr(5,2),16)]}
 function r2h(r){return '#'+r.map(function(v){v=Math.max(0,Math.min(255,Math.round(v)));return (v<16?'0':'')+v.toString(16)}).join('')}
 function mixc(a,b,t){var x=h2r(a),y=h2r(b);return r2h([0,1,2].map(function(i){return x[i]+(y[i]-x[i])*t}))}
 function rotHue(h,deg){
  var r=h2r(h).map(function(v){return v/255}),mx=Math.max(r[0],r[1],r[2]),mn=Math.min(r[0],r[1],r[2]),l=(mx+mn)/2,d=mx-mn,s=d?d/(1-Math.abs(2*l-1)):0,hh=0;
  if(d){if(mx===r[0])hh=((r[1]-r[2])/d+6)%6;else if(mx===r[1])hh=(r[2]-r[0])/d+2;else hh=(r[0]-r[1])/d+4}
  hh=(hh*60+deg+360)%360;l=Math.min(.82,Math.max(.58,l));
  var c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((hh/60)%2-1)),m=l-c/2,q=hh<60?[c,x,0]:hh<120?[x,c,0]:hh<180?[0,c,x]:hh<240?[0,x,c]:hh<300?[x,0,c]:[c,0,x];
  return r2h(q.map(function(v){return (v+m)*255}))}
 var infoCache={};
 // 흑자색처럼 아주 어두운 색은 어두운 배경에 묻히므로, 효과에 쓰는 색(vis·팔레트)만 밝게 끌어올립니다 (칩·카드 색은 원래 색 그대로)
 function info(ci){if(infoCache[ci])return infoCache[ci];var m=SPELL_COMBOS[ci][3]||'#d9c28a',rgb=h2r(m),dark=(rgb[0]*.299+rgb[1]*.587+rgb[2]*.114)/255<.3,
   tint=mixc(m,'#ffffff',dark?.62:.55),acc=rotHue(m,28),vis=dark?mixc(m,'#ffffff',.38):m;
  return infoCache[ci]={main:m,vis:vis,tint:tint,accent:acc,deep:mixc(m,'#000000',.4),pal:dark?[vis,tint,tint,tint,acc,acc]:[m,m,m,tint,tint,acc]}}

 // ── 마법서(발견한 주문) ───────────────────────────────────────────
 var got={};
 try{JSON.parse(localStorage.getItem('spellbook')||'[]').forEach(function(n){if(n>=0&&n<TOTAL)got[n]=1})}catch(e){}
 function saveBook(){try{localStorage.setItem('spellbook',JSON.stringify(Object.keys(got).map(Number)))}catch(e){}}
 function count(){return Object.keys(got).length}
 function comboFound(ci){var n=0,f;for(f=0;f<NF;f++)if(got[ci*NF+f])n++;return n}
 function spellName(ci,fi){return SPELL_COMBOS[ci][1]+'의 '+SPELL_FORMS[fi][0]}
 function spellText(ci,fi){return (typeof SPELL_TEXT!=="undefined"&&SPELL_TEXT[ci+'-'+fi])||(SPELL_COMBOS[ci][2]+'. '+SPELL_FORMS[fi][1]+'.')}
 function power(ci,fi){return Math.max(0,Math.min(1,((SPELL_COMBOS[ci][0].length-1)*3+SPELL_FORMS[fi][2])/10))}   // 연출의 세기 0~1
 function mixText(ci){return SPELL_COMBOS[ci][0].map(function(k){return SCHOOLS[k][0].replace(/계$/,'')}).join(' + ')}

 // ── 화면 뼈대 ─────────────────────────────────────────────────────
 root.innerHTML='<div class="ws"><div class="ws-stage"><canvas id="wscv" role="img" aria-label="마나 구슬을 끌어다 합치는 칸"></canvas>'
  +'<div class="ws-core" id="wscore" aria-live="polite"></div><div class="ws-hint" id="wshint">아래 구슬을 끌어 고리에 넣어 보세요</div><div class="ws-res" id="wsres" aria-live="polite"></div></div>'
  +'<div class="cap">1. 마나 모으기 <span>(최대 3개 · 구슬을 끌어다 놓거나 아래 버튼을 눌러요 · 합치면 고리가 그 조합의 색으로 물들어요)</span></div>'
  +'<div class="ws-sch" id="wssch">'+SCHOOLS.map(function(s,i){return '<button data-k="'+i+'" style="--c:'+COL[i]+'" aria-pressed="false"><i style="background:'+GRAD[i]+'"></i>'+s[0]+'</button>'}).join('')+'<button class="ws-clear" id="wsclear">비우기</button></div>'
  +'<div class="cap">2. 형태 고르기</div>'
  +'<div class="ws-forms" id="wsforms">'+SPELL_FORMS.map(function(f,i){return '<button data-f="'+i+'"><b>'+f[0]+'</b><span>'+f[1]+'</span></button>'}).join('')+'</div>'
  +'<details class="ac ws-box" id="wsbox"><summary>마법서<small id="wscount"></small></summary><div class="in"><div class="ws-prog"><i id="wsprog"></i></div><div id="wsbook"></div>'
  +'<div class="ws-bar"><button class="rlink" id="wsreset">기록 지우기</button></div></div></details></div>';
 var cv=document.getElementById('wscv'),ctx=cv.getContext('2d'),coreEl=document.getElementById('wscore'),hintEl=document.getElementById('wshint'),resEl=document.getElementById('wsres');

 // ── 상태 ──────────────────────────────────────────────────────────
 var W=0,H=0,dpr=1,raf=0,last=0,visible=true,G={},sel=[],drag=null,parts=[],fx=[],hintGone=false,resTimer=0,t0=performance.now();
 function layout(){var r=cv.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);var w=Math.round(r.width),h=Math.round(r.height);
  if(w===W&&h===H&&cv.width===Math.round(w*dpr))return;W=w;H=h;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  var m=Math.min(W,H),wide=W>H;
  G.R=m*(wide?.17:.15);G.cx=W*.3;G.cy=H*(wide?.42:.34);G.tx=W*(wide?.78:.76);G.ty=G.cy;G.or=Math.max(14,Math.min(24,m*.05));G.sp=W/6;
  G.home=SCHOOLS.map(function(_,k){return{x:W*(k+.5)/6,y:H*(wide?.86:.88)}});placeCore()}
 // 조합 안내(암흑계 + 생명계 → 광란)를 합쳐진 구슬의 고리 아래, 아래쪽 구슬 줄 사이에 가운데 정렬로 놓습니다 (결과 카드에 가려지지 않게)
 function placeCore(){
  if(!G.home)return;
  var ringBottom=G.cy+G.R,orbTop=G.home[0].y-G.or*2.1,w=coreEl.offsetWidth||0;
  coreEl.style.left=Math.max(w/2+8,Math.min(W-w/2-8,G.cx))+'px';
  coreEl.style.top=((ringBottom+orbTop)/2+2)+'px'}
 // 다음 프레임 예약이 사라져(창이 가려졌다 돌아올 때 등) 그림이 멈춘 채로 남는 일이 없게, 오래 응답이 없으면 예약을 새로 합니다
 var lastFrameAt=0;
 function wake(){if(raf&&performance.now()-lastFrameAt>400){cancelAnimationFrame(raf);raf=0}if(!raf)raf=requestAnimationFrame(frame)}
 document.addEventListener('visibilitychange',function(){if(!document.hidden)wake()});
 function alive(){return reduce?(drag||fx.length||parts.length):true}
 function sortedSel(){return sel.slice().sort(function(a,b){return a-b})}
 function curCombo(){return sel.length?KEY[sortedSel().join('')]:-1}

 // ── 입자 ──────────────────────────────────────────────────────────
 // S: 이번 마법의 정보 {k:합친 계열들, pal:조합색 팔레트, main/tint/accent, inten:연출의 세기(0~1)}
 function mk(S,x,y,o){if(parts.length>1100)return null;var k=S.k[(Math.random()*S.k.length)|0],acc=Math.random()<.4,
   p={x:x,y:y,vx:0,vy:0,life:0,max:60,s:4,k:k,c:S.pal[(Math.random()*S.pal.length)|0],t:acc?TYPE[k]:'mote',rot:rnd(0,TAU),vr:rnd(-.08,.08),drag:1,g:0},q;   // 40%는 합친 계열의 입자 모양, 나머지는 부드러운 빛알갱이
  if(o)for(q in o)if(o[q]!==undefined)p[q]=o[q];parts.push(p);return p}
 function burst(S,x,y,n,sp){var i,a,v;n=Math.round(n*(.8+.7*S.inten)*(reduce?.4:1));for(i=0;i<n;i++){a=rnd(0,TAU);v=rnd(.4,1)*sp;mk(S,x,y,{vx:Math.cos(a)*v,vy:Math.sin(a)*v,drag:.95,max:rnd(30,70),s:rnd(3,8)})}}
 function ring(S,x,y,r0,rEnd,max,w,delay){mk(S,x,y,{t:'ring',c:S.pal[(Math.random()*S.pal.length)|0],r:r0,vr:(rEnd-r0)/max,max:max,w:(w||2.5)*(1+S.inten*.8),d:delay?-delay:0})}
 function flash(S,x,y,r){mk(S,x,y,{t:'glow',s:r*(.7+S.inten*.9),max:10+S.inten*10,c:S.tint})}      // 세기가 높을수록 크고 오래 번쩍인다
 function heartPath(s){ctx.beginPath();ctx.moveTo(0,s*.35);ctx.bezierCurveTo(-s,-s*.3,-s*.55,-s,0,-s*.45);ctx.bezierCurveTo(s*.55,-s,s,-s*.3,0,s*.35)}
 function starPath(s){ctx.beginPath();for(var k=0;k<8;k++){var rr=k%2?s*.3:s,a=k*Math.PI/4;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath()}
 // st: 이번 프레임이 60fps 기준으로 몇 프레임어치인지 (주사율이 높아도 같은 속도로 보이도록)
 function drawParts(st){
  ctx.globalCompositeOperation='lighter';
  for(var i=parts.length-1;i>=0;i--){var p=parts[i];p.life+=st;
   if(p.d){p.d+=st;if(p.d<0)continue;p.d=0;p.life=1}
   var u=p.life/p.max;if(u>=1){parts.splice(i,1);continue}var al=1-u,dr=Math.pow(p.drag,st);
   p.x+=p.vx*st;p.y+=p.vy*st;p.vx*=dr;p.vy*=dr;p.vy+=p.g*st;ctx.fillStyle=ctx.strokeStyle=p.c;
   if(p.t==='ring'){p.r+=p.vr*st;ctx.globalAlpha=al*.8;ctx.lineWidth=p.w;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.stroke()}
   else if(p.t==='glow'){var gr=p.s*(1+u*.5),gg=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,gr);gg.addColorStop(0,p.c);gg.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=al*.75;ctx.fillStyle=gg;ctx.beginPath();ctx.arc(p.x,p.y,gr,0,TAU);ctx.fill()}
   else if(p.t==='beam'){var bx=Math.cos(p.ang)*p.len,by=Math.sin(p.ang)*p.len;ctx.globalAlpha=al;ctx.lineWidth=p.w||3;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-bx,p.y-by);ctx.stroke()}
   else if(p.t==='streak'){ctx.globalAlpha=al*.85;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*3.2,p.y-p.vy*3.2);ctx.stroke()}
   else if(p.t==='smoke'){var rr=p.s*(1+u*1.5),g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,rr);g.addColorStop(0,p.c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=al*.22;ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,rr,0,TAU);ctx.fill()}
   else if(p.t==='star'){p.rot+=.08*st;ctx.globalAlpha=al*(.6+.4*Math.sin(p.life*.5));ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);starPath(p.s);ctx.fill();ctx.restore()}
   else if(p.t==='leaf'){p.rot+=p.vr*st;ctx.globalAlpha=al*.85;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.beginPath();ctx.ellipse(0,0,p.s*1.3,p.s*.55,0,0,TAU);ctx.fill();ctx.restore()}
   else if(p.t==='heart'){ctx.globalAlpha=al*.85;ctx.save();ctx.translate(p.x,p.y);heartPath(p.s*1.2);ctx.fill();ctx.restore()}
   else{ctx.globalAlpha=al;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,TAU);ctx.fill()}}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}

 // ── 형태별 연출 (모두 조합색 팔레트로 그립니다) ────────────────────────────
 function lerp(a,b,u){return a+(b-a)*u}
 function ang(){return Math.atan2(G.ty-G.cy,G.tx-G.cx)}
 function addFx(o){o.age=0;fx.push(o)}
 function blendGrad(S,x0,y0,x1,y1){var g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,S.deep);g.addColorStop(.5,S.main);g.addColorStop(1,S.tint);return g}
 function clamp01(u){return Math.max(0,Math.min(1,u))}
 function ease(u){u=clamp01(u);return u*u*(3-2*u)}
 var FORM_FX=[
  // 0 구체: 마나 덩어리가 날아가 표적에서 터진다
  function(S){addFx({dur:.55,tick:function(a){var u=a/.55,e=u*u,x=lerp(G.cx,G.tx,e),y=lerp(G.cy,G.ty,e);
    mk(S,x,y,{t:'glow',s:G.R*.38*(1+S.inten*.5),max:5,c:S.tint});for(var i=0;i<(reduce?1:3);i++)mk(S,x+rnd(-6,6),y+rnd(-6,6),{s:rnd(2,6),vx:rnd(-.5,.5),vy:rnd(-.5,.5),max:rnd(18,34)})},
   end:function(){flash(S,G.tx,G.ty,G.R*.9);burst(S,G.tx,G.ty,52,6);ring(S,G.tx,G.ty,6,G.R*1.1,34,3)}})},
  // 1 창: 가늘고 빠르게 꿰뚫는다 (빛무리가 한 줄로 딱 나간다)
  function(S){var A=ang();addFx({dur:.26,tick:function(a){var u=Math.min(1,a/.26),x=lerp(G.cx,G.tx,u),y=lerp(G.cy,G.ty,u);
    mk(S,x,y,{t:'beam',ang:A,len:rnd(90,150),w:3,max:10});for(var i=0;i<(reduce?1:3);i++)mk(S,x,y+rnd(-5,5),{t:'streak',vx:Math.cos(A)*rnd(2,6),vy:Math.sin(A)*rnd(2,6)+rnd(-1,1),max:rnd(14,26)})},
   end:function(){burst(S,G.tx,G.ty,26,7);ring(S,G.tx,G.ty,4,G.R*.7,20,3)}})},
  // 2 화살: 상·중·하 세 발이 서로 다른 높이의 포물선(높게·완만하게·거의 곧게)을 그리며 날아간다 (빛무리 꼬리)
  function(S){
   var d=Math.hypot(G.tx-G.cx,G.ty-G.cy),FT=.62,DU=.9,AR=[{lift:.34,off:-.36,dl:0},{lift:.16,off:0,dl:.06},{lift:.02,off:.36,dl:.12}],hits=[false,false,false];
   function pt(r,u){return [lerp(G.cx,G.tx,u),lerp(G.cy,G.ty+r.off*G.R,u)-Math.sin(u*Math.PI)*d*r.lift]}       // 화살이 지나는 포물선 위의 점
   function dir(r,u){var a0=pt(r,Math.max(0,u-.02)),a1=pt(r,Math.min(1,u+.02));return Math.atan2(a1[1]-a0[1],a1[0]-a0[0])}
   addFx({dur:DU,tick:function(a){
     AR.forEach(function(r,i){var t=a-r.dl,u,p,q;
      if(t>=0&&t<FT){u=t/FT;p=pt(r,u);mk(S,p[0],p[1],{t:'beam',ang:dir(r,u),len:26,w:3,max:6});mk(S,p[0],p[1],{s:rnd(2,4),vx:rnd(-.3,.3),vy:rnd(-.3,.3),max:rnd(16,30)})}
      if(!hits[i]&&t>=FT){hits[i]=true;q=pt(r,1);burst(S,q[0],q[1],16,5);ring(S,q[0],q[1],4,G.R*.6,24,2.5)}})},
    end:function(){}})},
  // 3 장벽: 바닥에서 솟아올라 앞을 가로막는다
  function(S){var wx=lerp(G.cx,G.tx,.5),by=G.cy+G.R*.9,hh=G.R*2.5;addFx({dur:2.4,tick:function(a){var rise=Math.min(1,a/.3),n=Math.round((reduce?2:6)*(.8+.5*S.inten)),i;
    for(i=0;i<n;i++){var y=by-rnd(0,hh*rise);mk(S,wx+rnd(-8,8),y,{vx:rnd(-.2,.2),vy:-rnd(.2,1),s:rnd(2,5),max:rnd(30,60)})}
    if(a<.3)for(i=0;i<4;i++)mk(S,wx+rnd(-30,30),by,{t:'streak',vx:0,vy:-rnd(4,8),max:rnd(10,18)})},
   draw:function(a){var al=a<.3?a/.3:a>2?Math.max(0,(2.4-a)/.4):1,rise=Math.min(1,a/.3);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(.14+.1*S.inten)*al;ctx.fillStyle=blendGrad(S,wx,by-hh,wx,by);ctx.fillRect(wx-9,by-hh*rise,18,hh*rise);ctx.restore()},
   end:function(){}})},
  // 4 영역: 표적 아래에 마나의 장판이 깔린다
  function(S){var R=G.R*(1.7+.5*S.inten);ring(S,G.tx,G.ty+G.R*.5,6,R,26,3);ring(S,G.tx,G.ty+G.R*.5,6,R*.7,40,2,6);
   addFx({dur:2.6,tick:function(a){var n=Math.round((reduce?2:5)*(.8+.5*S.inten)),i,t,rr;for(i=0;i<n;i++){t=rnd(0,TAU);rr=Math.sqrt(Math.random())*R;mk(S,G.tx+Math.cos(t)*rr,G.ty+G.R*.5+Math.sin(t)*rr*.42,{vx:rnd(-.1,.1),vy:-rnd(.2,.9),s:rnd(2,5),max:rnd(34,64)})}},
   draw:function(a){var al=a<.3?a/.3:a>2.1?Math.max(0,(2.6-a)/.5):1;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(.15+.1*S.inten)*al;ctx.translate(G.tx,G.ty+G.R*.5);ctx.scale(1,.42);var g=ctx.createRadialGradient(0,0,0,0,0,R);g.addColorStop(0,S.tint);g.addColorStop(.5,S.main);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.fill();ctx.restore()},end:function(){}})},
  // 5 파동: 고리에서 사방으로 번져 나간다
  function(S){var Rm=Math.max(W,H)*(.6+.2*S.inten);ring(S,G.cx,G.cy,G.R*.3,Rm,70,4);ring(S,G.cx,G.cy,G.R*.3,Rm*.9,76,3,10);ring(S,G.cx,G.cy,G.R*.3,Rm*.8,82,2,20);flash(S,G.cx,G.cy,G.R*.9);
   for(var i=0;i<Math.round((reduce?10:30)*(.8+.6*S.inten));i++){var a=rnd(0,TAU),v=rnd(2,7);mk(S,G.cx,G.cy,{t:'streak',vx:Math.cos(a)*v,vy:Math.sin(a)*v,drag:.97,max:rnd(24,50)})}},
  // 6 사슬: 번갈아 선 고리 마디가 맞물린 사슬이 처지며 뻗어 나가 표적에 닿으면 팽팽해지고, 표적을 감아 죄었다가 풀린다 (세기가 높으면 두 가닥)
  function(S){
   var A=ang(),n=S.inten>.5?2:1,NL=20,ax=G.cx+Math.cos(A)*G.R*.7,ay=G.cy+Math.sin(A)*G.R*.7,bx=G.tx,by=G.ty+G.R*.2,dist=Math.hypot(bx-ax,by-ay),
       nx=-Math.sin(A),ny=Math.cos(A),sag=G.R*.5,hit=false,Tw=.5,TF=2,DU=2.7;
   function P(c,u,a){                                                   // 사슬이 지나는 곡선 위의 점: 처짐 + 출렁임
    var tg=1-.6*ease((a-Tw)/.5),s=sag*4*u*(1-u)*tg*(c?-.6:1),w=Math.sin(a*8-u*9+c*2)*G.R*.06*(1-u)*(a<1.1?1:.3)*(c?-1:1);
    return [lerp(ax,bx,u)+nx*w,lerp(ay,by,u)+ny*w+s]}
   function link(x,y,an,len,odd,col,al){                                // 고리 하나: 정면으로 선 마디(둥글게)와 옆으로 선 마디(납작하게)가 번갈아 맞물린다
    ctx.save();ctx.translate(x,y);ctx.rotate(an);ctx.globalAlpha=al;ctx.strokeStyle=col;ctx.shadowColor=col;ctx.shadowBlur=10;ctx.lineWidth=Math.max(1.6,G.R*.045);
    ctx.beginPath();ctx.ellipse(0,0,len*.56,odd?len*.12:len*.3,0,0,TAU);ctx.stroke();
    ctx.shadowBlur=0;ctx.globalAlpha=al*.5;ctx.lineWidth=1;ctx.strokeStyle='#fff';ctx.beginPath();ctx.ellipse(-len*.06,odd?-len*.02:-len*.08,len*.36,odd?len*.05:len*.14,0,Math.PI*1.05,Math.PI*1.75);ctx.stroke();ctx.restore()}   // 쇠의 반짝임
   addFx({dur:DU,
    tick:function(a){
     if(a>.15&&a<TF&&Math.random()<.5){var u=Math.random()*ease(a/.45),p=P(0,u,a);mk(S,p[0],p[1],{s:rnd(1.5,3.5),vy:-rnd(.2,.7),vx:rnd(-.2,.2),max:rnd(20,38)})}      // 마디에서 튀는 불티
     if(!hit&&a>=Tw+.55){hit=true;flash(S,bx,by,G.R*.7);ring(S,bx,by+G.R*.1,6,G.R*.9,30,3);burst(S,bx,by,22,4)}                                                   // 표적을 꽉 죌 때의 번쩍임
     if(a>=TF&&a<TF+.4&&Math.random()<.7){var u2=Math.min(1,clamp01((a-TF)/(DU-TF))+Math.random()*.1),p2=P(0,u2,a);mk(S,p2[0],p2[1],{s:rnd(2,4),vx:rnd(-1,1),vy:-rnd(.5,1.5),max:rnd(20,40)})}},   // 풀리며 흩어지는 마디
    draw:function(a){
     var ext=ease(a/.45),fade=a>TF?clamp01((a-TF)/(DU-TF)):0,c,i,u,p0,p1,p,an;
     ctx.save();ctx.globalCompositeOperation='lighter';
     for(c=0;c<n;c++){for(i=0;i<NL;i++){u=(i+.5)/NL;if(u>ext)break;if(fade>0&&u<fade*1.05)continue;                    // 풀릴 때는 시전자 쪽 마디부터 사라진다
       p0=P(c,Math.max(0,u-.012),a);p1=P(c,Math.min(1,u+.012),a);p=P(c,u,a);an=Math.atan2(p1[1]-p0[1],p1[0]-p0[0]);
       link(p[0],p[1],an,dist/NL*1.5,i%2,(i+c)%3===2?S.tint:S.main,1-fade*.5)}}
     if(a>Tw){var k=clamp01((a-Tw)/.45),tight=ease((a-Tw-.1)/.6),rw=G.R*(1.1-.5*tight),M=10,rot=a*1.6,th,x,y;                  // 표적을 감아 조이는 고리
      for(i=0;i<M;i++){th=i/M*TAU+rot;x=bx+Math.cos(th)*rw;y=by+Math.sin(th)*rw*.38;an=Math.atan2(Math.cos(th)*rw*.38,-Math.sin(th)*rw);
       link(x,y,an,rw*TAU/M*1.35,i%2,i%3===2?S.tint:S.accent,k*(1-fade))}}
     ctx.restore()},
    end:function(){}})},
  // 7 화신: 마나가 형상을 이룬 존재가 발밑의 마나진에서 솟아오른다. 합친 계열에 따라 모습이 달라진다
  //   신성=빛의 날개  암흑=뿔과 찢긴 망토  자연=가지뿔  생명=가슴의 심장  비전=궤도 고리  강화=어깨 갑옷
  function(S){
   var ax=lerp(G.cx,G.tx,.5),ay=G.cy+G.R*1.35,H=G.R*2.3*(.9+.3*S.inten),TR=.9,TP=1.5,TO=2.8,DU=3.4,hit=false,out=false;
   function has(k){return S.k.indexOf(k)>=0}
   function qp(p0,c,p1,t){var u=1-t;return [u*u*p0[0]+2*u*t*c[0]+t*t*p1[0],u*u*p0[1]+2*u*t*c[1]+t*t*p1[1]]}
   function stk(c,w,al){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.globalAlpha=al;ctx.lineCap='round';ctx.lineJoin='round'}
   addFx({dur:DU,
    tick:function(a){
     var up=a>.4&&a<TO,i;
     if(up&&Math.random()<.9)mk(S,ax+rnd(-H*.2,H*.2),ay-rnd(0,H*.9),{vx:rnd(-.2,.2),vy:-rnd(.3,1),s:rnd(2,5),max:rnd(30,56)});
     if(up&&has(5)&&Math.random()<.6)mk(S,ax+(Math.random()<.5?-1:1)*H*.17,ay-H*.72,{t:'streak',vx:rnd(-.3,.3),vy:-rnd(2,4),max:rnd(14,26)});                       // 어깨에서 치솟는 불꽃
     if(up&&has(0)&&Math.random()<.2)mk(S,ax+rnd(-H*.15,H*.15),ay-H*.9,{t:'leaf',vx:rnd(-.4,.4),vy:rnd(.2,.8),s:rnd(3,6),max:rnd(60,100)});                        // 가지뿔에서 떨어지는 잎
     if(up&&has(3)&&Math.random()<.04)ring(S,ax,ay-H*.6,4,H*.4,36,2);                                                                                               // 심장 박동
     if(up&&has(2)&&Math.random()<.4)mk(S,ax+rnd(-H*.2,H*.2),ay-rnd(0,H*.15),{t:'smoke',vx:rnd(-.3,.3),vy:-rnd(.2,.5),s:rnd(10,22),max:rnd(60,100)});               // 발밑에 깔리는 어둠
     if(!hit&&a>=TP){hit=true;flash(S,ax,ay-H*.85,H*.25);ring(S,ax,ay,H*.2,Math.hypot(G.tx-ax,G.ty-ay)+G.R*.6,45,3);burst(S,ax,ay-H*.5,20,4)}                        // 눈을 뜨며 마나의 파동을 내보낸다
     if(!out&&a>=TO){out=true;burst(S,ax,ay-H*.55,40,4);for(i=0;i<20;i++)mk(S,ax+rnd(-H*.2,H*.2),ay-rnd(0,H*.9),{vx:rnd(-.5,.5),vy:-rnd(1,3),s:rnd(2,5),max:rnd(30,60)})}},   // 사라질 때는 입자가 되어 흩어진다
    draw:function(a){
     var rise=ease(a/TR),dis=a>TO?clamp01((a-TO)/(DU-TO)):0,al=(1-dis)*Math.min(1,a/.25),raise=ease((a-.5)/.7),eye=(a>TP&&a<TP+.4)?1:0,
         sway=Math.sin(a*1.7)*H*.012,breath=1+.012*Math.sin(a*2.2),
         sw=H*.17,ww=H*.07,hw=H*.21,sy=-H*.72,wy=-H*.45,hy=-H*.03,hy2=-H*.86,hr=H*.075,i,g,gr=H*.3*(.4+.6*ease(a/.5));
     ctx.save();ctx.globalCompositeOperation='lighter';
     g=ctx.createRadialGradient(ax,ay,0,ax,ay,gr);g.addColorStop(0,rgba(S.tint,.45*al));g.addColorStop(.6,rgba(S.main,.25*al));g.addColorStop(1,'rgba(0,0,0,0)');       // 발밑의 마나진
     ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(ax,ay,gr,gr*.34,0,0,TAU);ctx.fill();
     stk(S.main,1.6,.7*al);ctx.beginPath();ctx.ellipse(ax,ay,gr,gr*.34,0,0,TAU);ctx.stroke();
     ctx.setLineDash([5,7]);ctx.lineDashOffset=-a*30;ctx.beginPath();ctx.ellipse(ax,ay,gr*.7,gr*.24,0,0,TAU);ctx.stroke();ctx.setLineDash([]);
     ctx.save();ctx.beginPath();ctx.rect(ax-H,ay-H*1.3*rise,H*2,H*1.3*rise+3);ctx.clip();                                                                                // 발밑에서 위로 드러난다
     ctx.translate(ax+sway,ay);ctx.scale(breath,breath);
     if(has(1)){var fl=Math.sin(a*2)*.07,LEN=[.3,.44,.5,.4],THS=[1,.72,.45,.2];                                                                                         // 신성: 빛의 날개
      [-1,1].forEach(function(sd){var tips=[],j,L,th,tx,ty,cx2,cy2;
       for(j=0;j<4;j++){L=H*LEN[j]*(.75+.25*rise);th=THS[j]+fl;tx=sd*(sw*.8+Math.cos(th)*L);ty=sy+H*.03-Math.sin(th)*L;cx2=sd*(sw*.8+Math.cos(th)*L*.45);cy2=sy+H*.03-Math.sin(th)*L*.45-L*.25;tips.push([tx,ty]);
        stk(S.tint,H*.017,.7*al);ctx.shadowColor=S.main;ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(sd*sw*.8,sy+H*.03);ctx.quadraticCurveTo(cx2,cy2,tx,ty);ctx.stroke()}
       ctx.shadowBlur=0;ctx.globalAlpha=.1*al;ctx.fillStyle=S.main;ctx.beginPath();ctx.moveTo(sd*sw*.8,sy+H*.03);tips.forEach(function(p){ctx.lineTo(p[0],p[1])});ctx.closePath();ctx.fill()})}
     var steps=has(2)?9:5;g=ctx.createLinearGradient(0,sy,0,hy);g.addColorStop(0,rgba(S.tint,.85*al));g.addColorStop(.45,rgba(S.main,.6*al));g.addColorStop(1,rgba(S.accent,0));   // 몸통과 망토
     ctx.fillStyle=g;ctx.globalAlpha=1;ctx.beginPath();ctx.moveTo(-sw,sy);ctx.quadraticCurveTo(-sw*.9,sy+H*.12,-ww,wy);ctx.quadraticCurveTo(-hw*.7,wy+H*.2,-hw,hy);
     for(i=1;i<=steps;i++)ctx.lineTo(-hw+2*hw*i/steps,hy+(has(2)?(i%2?H*.07:-H*.02):Math.sin(i*1.3+a*3)*H*.015));                                                    // 암흑이면 밑단이 찢어져 있다
     ctx.quadraticCurveTo(hw*.7,wy+H*.2,ww,wy);ctx.quadraticCurveTo(sw*.9,sy+H*.12,sw,sy);ctx.quadraticCurveTo(0,sy-H*.05,-sw,sy);ctx.closePath();ctx.fill();
     ctx.shadowColor=S.main;ctx.shadowBlur=8;stk(S.tint,1.1,.6*al);ctx.stroke();ctx.shadowBlur=0;
     stk(S.tint,1,.16*al);for(i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*ww*.8,wy);ctx.lineTo(i*hw*.7,hy-H*.03);ctx.stroke()}                                         // 옷의 주름
     var hxA=H*.27,hyA=lerp(-H*.3,-H*.52,raise);                                                                                                                       // 팔과 손의 빛
     [-1,1].forEach(function(sd){stk(S.tint,H*.028,.8*al);ctx.beginPath();ctx.moveTo(sd*sw*.9,sy+H*.02);ctx.quadraticCurveTo(sd*H*.3,sy+H*.12,sd*hxA,hyA);ctx.stroke();
      var og=ctx.createRadialGradient(sd*hxA,hyA,0,sd*hxA,hyA,H*.07);og.addColorStop(0,'rgba(255,255,255,'+.9*al+')');og.addColorStop(.4,rgba(S.accent,.7*al));og.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=og;ctx.globalAlpha=1;ctx.beginPath();ctx.arc(sd*hxA,hyA,H*.07,0,TAU);ctx.fill()});
     if(has(5))[-1,1].forEach(function(sd){ctx.save();ctx.translate(sd*sw*.95,sy);ctx.fillStyle=rgba(S.tint,.75*al);ctx.globalAlpha=1;ctx.shadowColor=S.main;ctx.shadowBlur=10;                      // 강화: 어깨 갑옷
      ctx.beginPath();ctx.moveTo(-sd*H*.03,-H*.02);ctx.lineTo(sd*H*.11,-H*.05);ctx.lineTo(sd*H*.15,H*.04);ctx.lineTo(sd*H*.04,H*.08);ctx.closePath();ctx.fill();ctx.shadowBlur=0;stk('#fff',1,.5*al);ctx.stroke();ctx.restore()});
     g=ctx.createRadialGradient(0,hy2,0,0,hy2,hr*1.6);g.addColorStop(0,rgba(S.tint,.95*al));g.addColorStop(.6,rgba(S.main,.55*al));g.addColorStop(1,'rgba(0,0,0,0)');                                      // 머리
     ctx.fillStyle=g;ctx.globalAlpha=1;ctx.beginPath();ctx.arc(0,hy2,hr*1.6,0,TAU);ctx.fill();
     ctx.globalAlpha=al;ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=eye?14:5;ctx.beginPath();ctx.ellipse(-hr*.42,hy2,hr*.2,hr*(eye?.34:.2),.15,0,TAU);ctx.ellipse(hr*.42,hy2,hr*.2,hr*(eye?.34:.2),-.15,0,TAU);ctx.fill();ctx.shadowBlur=0;   // 눈
     if(has(2))[-1,1].forEach(function(sd){stk(S.main,H*.024,.95*al);ctx.shadowColor=S.accent;ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(sd*hr*.6,hy2-hr*.7);ctx.quadraticCurveTo(sd*hr*2.6,hy2-hr*1.2,sd*hr*1.7,hy2-hr*3.3);ctx.stroke();ctx.shadowBlur=0});   // 암흑: 뿔
     if(has(0))[-1,1].forEach(function(sd){var p0=[sd*hr*.5,hy2-hr*.9],c=[sd*hr*2.6,hy2-hr*1.6],p1=[sd*hr*2,hy2-hr*4.2];stk(S.main,H*.02,.9*al);ctx.shadowColor=S.tint;ctx.shadowBlur=8;                // 자연: 가지뿔
      ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.quadraticCurveTo(c[0],c[1],p1[0],p1[1]);ctx.stroke();
      [.38,.62,.85].forEach(function(t,j){var q=qp(p0,c,p1,t);ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0]+sd*hr*(1.1+.3*j),q[1]-hr*(.9+.2*j));ctx.stroke()});ctx.shadowBlur=0});
     var hal=has(1)?1.25:1;stk(S.tint,1.8,al*(.55+.2*Math.sin(a*3)));ctx.beginPath();ctx.ellipse(0,hy2-hr*.9,hr*2.2*hal,hr*.55*hal,0,0,TAU);ctx.stroke();                         // 후광
     if(has(1)){stk(S.main,1.2,al*.5);ctx.beginPath();ctx.ellipse(0,hy2-hr*.9,hr*3*hal,hr*.8*hal,0,0,TAU);ctx.stroke()}
     var cp=1+.12*Math.sin(a*4);                                                                                                                                         // 가슴의 핵
     if(has(3)){ctx.save();ctx.translate(0,-H*.6);ctx.scale(cp,cp);ctx.globalAlpha=al*.95;ctx.fillStyle=S.tint;ctx.shadowColor=S.main;ctx.shadowBlur=16;heartPath(H*.06);ctx.fill();ctx.restore()}
     else{var cg=ctx.createRadialGradient(0,-H*.6,0,0,-H*.6,H*.06*cp);cg.addColorStop(0,'rgba(255,255,255,'+al+')');cg.addColorStop(.5,rgba(S.tint,.9*al));cg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=cg;ctx.globalAlpha=1;ctx.beginPath();ctx.arc(0,-H*.6,H*.06*cp,0,TAU);ctx.fill()}
     if(has(4))for(i=0;i<2;i++){ctx.save();ctx.translate(0,-H*.55);ctx.rotate((i?1:-1)*.5+Math.sin(a*.8+i)*.15);stk(S.accent,1.4,.55*al);ctx.beginPath();ctx.ellipse(0,0,H*.36,H*.1,0,0,TAU);ctx.stroke();   // 비전: 궤도 고리와 별
      var t2=a*1.6*(i?-1:1)+i*2;ctx.globalAlpha=al;ctx.fillStyle='#fff';ctx.shadowColor=S.tint;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(Math.cos(t2)*H*.36,Math.sin(t2)*H*.1,H*.018,0,TAU);ctx.fill();ctx.shadowBlur=0;ctx.restore()}
     ctx.restore();ctx.restore()},
    end:function(){}})}
 ];

 // ── 원소 구슬: 밝게 빛나는 구체와 은은한 후광 (계열 색) ──────────────────────
 function aura(x,y,r,k,t,al){
  var pal=PAL[k],i,g,rh=r*2.4;
  ctx.save();ctx.globalCompositeOperation='lighter';
  g=ctx.createRadialGradient(x,y,r*.3,x,y,rh);g.addColorStop(0,rgba(pal[0],.34*al));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,rh,0,TAU);ctx.fill();   // 은은한 후광
  ctx.globalAlpha=al;                                                                                                                       // 중심 구체
  g=ctx.createRadialGradient(x-r*.25,y-r*.3,0,x,y,r);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.35,rgba(pal[0],.92));g.addColorStop(1,rgba(pal[1%pal.length],.55));
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=Math.max(1,r*.07);                                                                    // 구체 속에서 도는 마나의 결
  for(i=0;i<3;i++){ctx.beginPath();ctx.arc(x,y,r*(.42+.17*i),t*(1+i*.3)+i*2,t*(1+i*.3)+i*2+1.5);ctx.stroke()}
  ctx.strokeStyle=rgba(pal[0],.55);ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();
  ctx.restore()}

 // ── 그리기(구슬·고리·표적) ────────────────────────────────────────
 function drawStage(now){
  var t=reduce?0:(now-t0)/1000,i,pulse=.5+.5*Math.sin(t*2),n=sel.length,has=n>0,ci=curCombo(),inf=has?info(ci):null;
  // 표적
  ctx.save();ctx.strokeStyle='rgba(166,138,84,.28)';ctx.lineWidth=1.5;ctx.translate(G.tx,G.ty+G.R*.5);ctx.scale(1,.42);[G.R*.9,G.R*.55,G.R*.2].forEach(function(r){ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke()});ctx.restore();
  ctx.save();ctx.strokeStyle='rgba(166,138,84,.35)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(G.tx,G.ty-G.R*.9);ctx.lineTo(G.tx,G.ty+G.R*.5);ctx.stroke();ctx.restore();
  // 공방 고리: 합친 마나의 조합색으로 물든다 (어떤 색이 나올지 미리 보여 줌)
  ctx.save();ctx.lineWidth=has?2.6:1.6;ctx.strokeStyle=has?rgba(inf.vis,.7+.2*pulse):'rgba(166,138,84,.35)';ctx.setLineDash(has?[]:[6,8]);ctx.beginPath();ctx.arc(G.cx,G.cy,G.R,0,TAU);ctx.stroke();
  ctx.setLineDash([]);ctx.globalAlpha=.5;ctx.lineWidth=1;ctx.beginPath();ctx.arc(G.cx,G.cy,G.R*.82,0,TAU);ctx.stroke();ctx.restore();
  // 고리 안: 합쳐진 마나
  if(has){
   ctx.save();ctx.globalCompositeOperation='lighter';var g=ctx.createRadialGradient(G.cx,G.cy,0,G.cx,G.cy,G.R*.95);
   g.addColorStop(0,rgba(inf.tint,.4+.1*pulse));g.addColorStop(.55,rgba(inf.vis,.26+.06*pulse));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(G.cx,G.cy,G.R*.95,0,TAU);ctx.fill();ctx.restore();
   var orbitR=n>1?G.R*.4*(1-.14*pulse):0;
   sel.forEach(function(k,j){var a=t*1.5+j*TAU/n;aura(G.cx+Math.cos(a)*orbitR,G.cy+Math.sin(a)*orbitR,n>1?G.R*.17:G.R*.3,k,t+j,n>1?.8:1)})}
  // 아래쪽 구슬들
  for(i=0;i<6;i++){var h=G.home[i],on=sel.indexOf(i)>=0;
   aura(h.x,h.y,G.or*.85,i,t+i*1.7,on?1:.82);
   if(on){ctx.save();ctx.strokeStyle=COL[i];ctx.globalAlpha=.7;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(h.x,h.y,G.or+7,0,TAU);ctx.stroke();ctx.restore()}}
  if(drag)aura(drag.x,drag.y,G.or*.95,drag.k,t,1)}
 function frame(now){
  raf=0;lastFrameAt=performance.now();if(!visible)return;layout();var dt=Math.min(.05,(now-(last||now))/1000);last=now;
  ctx.clearRect(0,0,W,H);drawStage(now);
  for(var i=fx.length-1;i>=0;i--){var f=fx[i];f.age+=dt;
   if(f.tick&&f.age<f.dur){f.acc=(f.acc||0)+dt*60;var nt=0;while(f.acc>=1&&nt<4){f.acc-=1;nt++;f.tick(f.age,1/60)}}   // 입자 생성은 주사율과 상관없이 초당 60번
   if(f.draw)f.draw(f.age);
   if(f.age>=f.dur){if(f.end)f.end();fx.splice(i,1)}}
  drawParts(dt*60);
  if(alive())raf=requestAnimationFrame(frame);else last=0}

 // ── 선택 상태·글자 ────────────────────────────────────────────────
 function say(html,keep){resEl.innerHTML=html;resEl.classList.add('on');clearTimeout(resTimer);if(!keep)resTimer=setTimeout(function(){resEl.classList.remove('on')},5200)}
 function hideHint(){if(!hintGone){hintGone=true;hintEl.classList.add('off')}}
 function chip(ci){var i=info(ci);return '<i class="ws-chip" style="background:'+i.main+';box-shadow:0 0 8px '+i.vis+'"></i>'}
 function renderSel(){
  [].forEach.call(document.querySelectorAll('#wssch button[data-k]'),function(b){b.setAttribute('aria-pressed',sel.indexOf(+b.dataset.k)>=0)});
  var s=sortedSel(),ci=s.length?KEY[s.join('')]:-1;
  if(!s.length)coreEl.innerHTML='';
  else coreEl.innerHTML=s.map(function(k){return '<span style="color:'+COL[k]+'">'+SCHOOLS[k][0]+'</span>'}).join(' + ')+' '+chip(ci)+'<em>→ '+(comboFound(ci)?SPELL_COMBOS[ci][1]:'이름 모를 마나')+'</em>';
  placeCore();wake()}
 function addSel(k){if(sel.indexOf(k)>=0)return;if(sel.length>=3){say('마나는 한 번에 세 가지까지만 합칠 수 있어요. 먼저 하나를 빼 주세요.');return}sel.push(k);hideHint();renderSel()}
 function delSel(k){var i=sel.indexOf(k);if(i>=0){sel.splice(i,1);renderSel()}}
 function toggleSel(k){sel.indexOf(k)>=0?delSel(k):addSel(k)}

 // ── 주문 펼치기 ───────────────────────────────────────────────────
 function cast(fi){
  if(!sel.length){say('먼저 마나 구슬을 하나 이상 고리에 모아 주세요.');return}
  var s=sortedSel(),ci=KEY[s.join('')],id=ci*NF+fi,isNew=!got[id],inf=info(ci);
  var S={k:s.slice(),pal:inf.pal,main:inf.vis,tint:inf.tint,accent:inf.accent,deep:inf.deep,inten:power(ci,fi)};   // 연출의 세기 (많이 섞고 큰 형태일수록 크게)
  hideHint();flash(S,G.cx,G.cy,G.R*.7);FORM_FX[fi](S);
  if(isNew){got[id]=1;saveBook()}
  say('<b>'+chip(ci)+esc(spellName(ci,fi))+'</b>'+(isNew?' <u>새로 발견!</u>':'')+'<small>'+esc(spellText(ci,fi))+'</small>');
  renderSel();updateBook(ci);wake()}

 // ── 마법서 ────────────────────────────────────────────────────────
 function cardInner(ci){var c=SPELL_COMBOS[ci],n=comboFound(ci),f,rows='',m=info(ci).main;
  for(f=0;f<NF;f++){var id=ci*NF+f;rows+=got[id]?'<li class="on"><b>'+esc(spellName(ci,f))+'</b><span>'+esc(spellText(ci,f))+'</span></li>':'<li><b>? ? ?</b><span>'+esc(SPELL_FORMS[f][0])+' 형태 · 아직 발견하지 못했어요</span></li>'}
  return {sum:'<i class="ws-sw" style="background:'+m+';box-shadow:0 0 10px '+info(ci).vis+'88"></i><b>'+(n?esc(c[1]):'? ? ?')+'</b><small>'+n+' / '+NF+'</small>',body:'<ul><li class="mix"><span>'+esc(mixText(ci))+'</span><code>'+m+'</code></li>'+rows+'</ul>',full:n===NF}}
 function renderBook(){
  var groups=[['단일 계열',1],['두 계열',2],['세 계열',3]],h='';
  groups.forEach(function(g){h+='<h4 class="ws-gh">'+g[0]+'</h4><div class="ws-cards">';
   SPELL_COMBOS.forEach(function(c,ci){if(c[0].length!==g[1])return;var x=cardInner(ci);h+='<details class="ws-card'+(x.full?' full':'')+'" data-ci="'+ci+'"><summary>'+x.sum+'</summary>'+x.body+'</details>'});h+='</div>'});
  document.getElementById('wsbook').innerHTML=h;updateCount()}
 function updateCount(){var n=count();document.getElementById('wscount').textContent=n+' / '+TOTAL;document.getElementById('wsprog').style.width=(n/TOTAL*100)+'%'}
 function updateBook(ci){var d=document.querySelector('#wsbook details[data-ci="'+ci+'"]');if(d){var x=cardInner(ci);d.querySelector('summary').innerHTML=x.sum;d.querySelector('ul').outerHTML=x.body;d.classList.toggle('full',x.full)}updateCount()}

 // ── 입력 ──────────────────────────────────────────────────────────
 function pos(e){var r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
 cv.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;layout();var p=pos(e),k,h;   // 창 크기가 막 바뀌었어도 구슬 위치가 어긋나지 않게 먼저 맞춥니다
  for(k=0;k<6;k++){h=G.home[k];if(Math.hypot(p.x-h.x,p.y-h.y)<=G.or*1.7){e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(x){}drag={k:k,x:p.x,y:p.y,sx:p.x,sy:p.y,moved:false};wake();return}}});
 cv.addEventListener('pointermove',function(e){if(!drag)return;var p=pos(e);drag.x=p.x;drag.y=p.y;if(Math.hypot(p.x-drag.sx,p.y-drag.sy)>8)drag.moved=true;wake()});
 function drop(){if(!drag)return;var d=drag;drag=null;
  if(d.moved){if(Math.hypot(d.x-G.cx,d.y-G.cy)<=G.R*1.3)addSel(d.k)}else toggleSel(d.k);wake()}
 cv.addEventListener('pointerup',drop);cv.addEventListener('pointercancel',function(){drag=null;wake()});
 root.addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  if(b.dataset.k!==undefined&&b.closest('#wssch'))return toggleSel(+b.dataset.k);
  if(b.id==='wsclear'){sel=[];resEl.classList.remove('on');return renderSel()}
  if(b.dataset.f!==undefined&&b.closest('#wsforms'))return cast(+b.dataset.f);
  if(b.id==='wsreset'){if(window.confirm('마법서의 모든 기록을 지울까요?')){got={};saveBook();renderBook();say('마법서를 비웠어요.')}}});
 if('IntersectionObserver' in window)new IntersectionObserver(function(en){visible=en[0].isIntersecting;if(visible)wake()}).observe(cv);
 if(window.ResizeObserver)new ResizeObserver(wake).observe(cv);else window.addEventListener('resize',wake);

 renderBook();renderSel();layout();wake();
})();
