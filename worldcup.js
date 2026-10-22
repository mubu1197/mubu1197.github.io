/* ═══ 단짝 월드컵 ═══════════════════════════════════════════════
   content.js 의 명단(ROSTER)을 index.html 이 만든 CH 로 받아 씁니다.
   캐릭터는 img/ 폴더의 사진(명단 마지막 칸)으로 보여 줍니다.
   ※ 이 파일은 데이터가 없습니다. 문구만 아래에서 고치면 됩니다.
*/
(function(){
 if(typeof CH==="undefined"||typeof sq==="undefined")return;
 var root=document.getElementById('wcr');if(!root)return;
 var WHO=[["s","학생만"],["all","교관·교직원 포함"]],SIZES=[16,32,64,0];
 // 성별 제외 옵션: [값, 라벨의 앞부분]  (참가자가 '학생만'이면 '남학생', 아니면 '남성'으로 표시)
 var GEN=[["all","전체"],["noM","남# 제외"],["noF","여# 제외"]];
 var opt={who:"s",size:32,gen:"all",kw:false},st=null;

 function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
 function pool(){return CH.filter(function(c){return (opt.who=="all"||c.r=="학생")&&!(opt.gen=="noM"&&c.g=="남성")&&!(opt.gen=="noF"&&c.g=="여성")})}
 function pow2(n){var p=1;while(p<n)p*=2;return p}
 function saved(){try{var id=localStorage.getItem('wc');return CH.find(function(c){return c.id==id})||null}catch(e){return null}}
 function label(r){return r==2?"결승":r==4?"준결승":r+"강"}
 // 월드컵에는 가벼운 축소본(img/thumb/이름.jpg)을 씁니다. 원본(img/이름.png)은 한 장에 1~2MB 라 로딩이 느려요.
 // 축소본이 없거나 받기에 실패하면 원본으로 대신합니다.
 function thumb(c){return "img/thumb/"+c.img+".jpg"}
 function pre(c){if(c){var i=new Image();i.src=thumb(c)}}
 // 사진을 다 받은 뒤에 경기 화면을 그립니다 (사진이 늦게 뜨며 깜빡이는 것을 막음). 4초가 지나면 그냥 그립니다.
 function load(c){return new Promise(function(res){var i=new Image();i.onload=i.onerror=function(){res()};i.src=thumb(c);setTimeout(res,4000)})}
 // 사진 칸: 실패하면 사진을 지우지 않고 다시 시도 → 원본으로 대체 → 그래도 안 되면 빈 칸(브로치 아이콘)
 window.wcRetry=function(i){var n=+i.dataset.r||0;if(n>=3){i.remove();return}i.dataset.r=n+1;
  var u=[i.dataset.t+"?r=1",i.dataset.o,i.dataset.o+"?r=1"][n];setTimeout(function(){i.src=u},400*(n+1))};
 function port(c){return '<div class="sq" style="--c:'+K[c.f].c+'"><div class="ph">'+ic(c.f,60,dim(K[c.f].c))+'</div><img src="'+thumb(c)+'" data-t="'+thumb(c)+'" data-o="img/'+c.img+'.png" alt="'+c.s+'" decoding="async" onerror="wcRetry(this)"></div>'}

 function chip(g,v,t,on){return '<button class="chip" data-g="'+g+'" data-v="'+v+'" aria-pressed="'+on+'">'+t+'</button>'}
 function intro(){
  var n=pool().length,pv=saved();
  // 참가자가 적어서 못 채우는 규모(예: 남학생 12명으로 16강)는 보여 주지 않고, 선택돼 있었다면 가능한 가장 큰 규모로 바꿉니다
  var ok=SIZES.filter(function(s){return !s||s<=n});
  if(ok.indexOf(opt.size)<0)opt.size=ok.filter(function(s){return s}).pop()||0;
  var who=opt.who=="s"?"학생":"";
  root.innerHTML='<div class="rintro wcs"><p>마음에 드는 쪽을 고르다 보면, 마지막에 남는 한 명이 당신의 단짝입니다.<br>성격은 제쳐 두고, 끌리는 쪽을 직감대로 눌러 주세요.</p>'
   +'<div class="cap">참가자</div><div class="chips">'+WHO.map(function(w){return chip("who",w[0],w[1],opt.who==w[0])}).join('')+'</div>'
   +'<div class="cap">성별</div><div class="chips">'+GEN.map(function(g){return chip("gen",g[0],g[1].replace("#",who?"학생":"성"),opt.gen==g[0])}).join('')+'</div>'
   +'<div class="cap">규모</div><div class="chips">'+ok.map(function(s){return chip("size",s,s?s+"강":"전원 ("+n+"명)",opt.size==s)}).join('')+'</div>'
   +'<button class="go" data-a="start">월드컵 시작</button>'
   +(pv?'<p class="rprev">지난 단짝 — <button class="rlink" data-a="last">'+pv.s+'</button></p>':'')+'</div>';
 }

 function start(){
  var pl=shuf(pool()),S=opt.size?Math.min(opt.size,pl.length):pl.length,P=pow2(S);
  pl=pl.slice(0,S);
  var by=P-S;
  st={mode:"match",round:P,cur:pl.slice(by),next:pl.slice(0,by),i:0,done:0,total:S-1,out:[]};
  var sb=root.querySelector('[data-a=start]');if(sb){sb.textContent="불러오는 중…";sb.disabled=true}
  match();
 }
 function card(c,w){
  return '<button class="wcc" data-w="'+w+'" style="--c:'+K[c.f].c+'">'+port(c)+'<b>'+c.s+'</b><span>'+K[c.f].n+' · '+c.r+'</span><em>'+c.pers+'</em></button>';
 }
 function match(){
  var a=st.cur[st.i*2],b=st.cur[st.i*2+1],tok=st;
  st.busy=true;
  Promise.all([load(a),load(b)]).then(function(){if(st!==tok)return;st.busy=false;draw(a,b)});
 }
 function draw(a,b){
  root.innerHTML='<div class="wcm'+(opt.kw?' wck':'')+'"><div class="wch"><span>'+label(st.round)+' · '+(st.i+1)+' / '+(st.cur.length/2)+'</span><label><input type="checkbox" id="wckb"'+(opt.kw?' checked':'')+'> 성격 키워드 보기</label></div>'
   +'<div class="rp"><i style="width:'+(st.done/st.total*100)+'%"></i></div>'
   +'<div class="wcv">'+card(a,0)+'<div class="wcvs">VS</div>'+card(b,1)+'</div>'
   +'<button class="rlink" data-a="reset">← 처음으로</button></div>';
  pre(st.cur[(st.i+1)*2]);pre(st.cur[(st.i+1)*2+1]);
 }
 function choose(w){
  var a=st.cur[st.i*2],b=st.cur[st.i*2+1],win=w?b:a,lose=w?a:b;
  st.next.push(win);st.out.push({c:lose,size:st.round});st.i++;st.done++;
  if(st.i*2>=st.cur.length){st.cur=st.next;st.next=[];st.i=0;st.round/=2;if(st.cur.length==1)return finish(st.cur[0])}
  match();
 }
 function mini(c,t){return '<div class="wcf1" style="--c:'+K[c.f].c+'">'+port(c)+'<span>'+t+'</span><b>'+c.s+'</b></div>'}
 function finish(c,full){
  st=null;try{localStorage.setItem('wc',c.id)}catch(e){}
  var fin=full||[];
  root.innerHTML='<div class="rr wcw" style="--c:'+K[c.f].c+'"><div class="cap">당신의 단짝</div><div class="wcw2">'+port(c)+'<div class="info"><h3>'+c.n+'</h3><div class="m">'+K[c.f].n+' · '+c.r+'</div>'+kv([["종족",c.race],["나이",c.a],["성격",c.pers]])+'</div></div>'
   +(fin.length?'<div class="cap" style="margin-top:26px">마지막까지 겨룬 후보</div><div class="wcf">'+fin.map(function(f){return mini(f[0],f[1])}).join('')+'</div>':'')
   +'<div class="more rbt"><button class="go" onclick="openC(\''+c.id+'\')">상세 정보 보기</button><button class="go" data-a="copy" data-id="'+c.id+'">결과 복사</button><button class="go" data-a="reset">다시 하기</button></div></div>';
 }
 function end(c){
  var ru=st.out.filter(function(o){return o.size==2}).map(function(o){return [o.c,"준우승"]}),
      sf=st.out.filter(function(o){return o.size==4}).map(function(o){return [o.c,"4강"]});
  finish(c,ru.concat(sf));
 }

 root.addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  if(b.dataset.g){opt[b.dataset.g]=b.dataset.g=="size"?+b.dataset.v:b.dataset.v;return intro()}
  var a=b.dataset.a;
  if(a=="start")return start();
  if(a=="reset"){st=null;return intro()}
  if(a=="last"){var c=saved();return c&&finish(c)}
  if(a=="copy"){var c2=CH.find(function(x){return x.id==b.dataset.id}),s="내 단짝은 노르테이아 아카데미의 "+c2.s+"("+K[c2.f].n+")! "+location.href.split('#')[0];
   try{navigator.clipboard.writeText(s).then(function(){b.textContent="복사되었어요"},function(){b.textContent="복사하지 못했어요"})}catch(x){b.textContent="복사하지 못했어요"}return}
  if(b.dataset.w!==undefined&&st&&st.mode=="match"&&!st.busy){
   var last=st.cur.length==2&&st.round==2,w=+b.dataset.w,pair=[st.cur[0],st.cur[1]];
   if(last){var win=pair[w];st.out.push({c:pair[1-w],size:2});st.done++;return end(win)}
   choose(w);
  }
 });
 root.addEventListener('change',function(e){
  if(e.target.id!="wckb")return;
  opt.kw=e.target.checked;root.querySelector('.wcm').classList.toggle('wck',opt.kw);
 });
 document.addEventListener('keydown',function(e){
  if(!st||st.mode!="match"||st.busy||(e.key!="ArrowLeft"&&e.key!="ArrowRight"))return;
  var r=root.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
  e.preventDefault();var bs=root.querySelectorAll('.wcc');bs[e.key=="ArrowLeft"?0:1].click();
 });
 intro();
})();
