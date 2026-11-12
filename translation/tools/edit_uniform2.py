import io,sys,re
sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')
R='C:/Users/MSI/OneDrive/문서/GitHub/mubu1197.github.io/'
def rd(f): return open(R+f,encoding='utf-8',newline='').read()
def wr(f,s): open(R+f,'w',encoding='utf-8',newline='').write(s)

# 1) content.js: UNIFORM 블록 교체
s=rd('content.js')
a=s.index('var UNIFORM = {'); b=s.index('};',a)+2
new='''var UNIFORM = {
 h:"학생 제복",
 lead:"캠퍼스 안에서는 제복을 단정하게 갖춰 입습니다.",
 items:[["여학생","img/uniform_female.jpg",["흰 셔츠","흰 치마","금단추 검은 코르셋","검은 리본","금테 남색 망토","보석 브로치"]],
        ["남학생","img/uniform_male.jpg",["흰 셔츠","흰 바지","은색 벨트","검은 리본","금테 남색 재킷","보석 브로치"]]],
 rules:[["리본","검은 리본을 칼라 바로 아래에서 나비매듭으로 묶습니다."],
        ["브로치","작은 보석 브로치를 매듭 자리에 답니다. 보석의 색은 소속 학부의 상징색이고, 마도구가 아니라 학부의 표지입니다."],
        ["입학식","신입생은 입학식 전까지 브로치 없이 제복만 입고, 입학식에서 담당 교관에게 브로치를 받습니다. 브로치에는 문장이나 각인이 없습니다."]]
};'''
s=s[:a]+new+s[b:]
wr('content.js',s)

# 2) index.html 렌더링 + CSS
h=rd('index.html')
i=h.index("if(typeof UNIFORM!=='undefined')"); j=h.index('\n',i)
line=("if(typeof UNIFORM!=='undefined')$('uniform').innerHTML=`<h3 class=\"sub\">${UNIFORM.h}</h3><p class=\"lead\" style=\"margin-bottom:20px\">${UNIFORM.lead}</p>"
 "<div class=\"unif\">${UNIFORM.items.map(x=>`<figure class=\"uf\"><img src=\"${x[1]}\" alt=\"${x[0]}\" loading=\"lazy\" decoding=\"async\"><figcaption><b>${x[0]}</b><div class=\"ut\">${x[2].map(t=>`<span>${t}</span>`).join('')}</div></figcaption></figure>`).join('')}</div>"
 "${dl(UNIFORM.rules)}`;")
if h[j-1]=='\r': j-=1
h=h[:i]+line+h[j:]
nl='\r\n' if '\r\n' in h else '\n'
i=h.index('.uf figcaption{'); j=h.index('@media(max-width:560px){.unif',i)
css=(".uf figcaption{padding:14px 18px 18px}.uf b{display:block;font:700 15.5px var(--serif);color:var(--gold);margin-bottom:10px}"+nl+
".ut{display:flex;flex-wrap:wrap;gap:6px}.ut span{font-size:13px;line-height:1;padding:7px 11px;border:1px solid var(--line);border-radius:99px;color:#b8ad99;background:rgba(255,255,255,.02)}"+nl+
"#uniform .dl{max-width:880px;margin-top:6px}"+nl)
h=h[:i]+css+h[j:]
wr('index.html',h)

# 3) 번역 단위
U=["캠퍼스 안에서는 제복을 단정하게 갖춰 입습니다.","흰 셔츠","흰 치마","금단추 검은 코르셋","검은 리본","금테 남색 망토","보석 브로치","흰 바지","은색 벨트","금테 남색 재킷","리본","입학식",
"검은 리본을 칼라 바로 아래에서 나비매듭으로 묶습니다.",
"작은 보석 브로치를 매듭 자리에 답니다. 보석의 색은 소속 학부의 상징색이고, 마도구가 아니라 학부의 표지입니다.",
"신입생은 입학식 전까지 브로치 없이 제복만 입고, 입학식에서 담당 교관에게 브로치를 받습니다. 브로치에는 문장이나 각인이 없습니다."]
with open(R+'translation/units.tsv','a',encoding='utf-8',newline='') as f:
    for k,t in enumerate(U): f.write('%d\tcontent\t%s\n'%(867+k,t))
T={'en':["On campus, uniforms are worn neatly.","White shirt","White skirt","Black corset with gold buttons","Black ribbon","Navy cloak with gold piping","Jeweled brooch","White pants","Silver belt","Navy jacket with gold piping","Ribbon","Entrance ceremony",
 "The black ribbon is tied in a bow just below the collar.",
 "A small jeweled brooch is pinned at the knot. The gem's color is the symbol color of the student's faculty; it is a faculty marker, not a magic tool.",
 "Freshmen wear the uniform without a brooch until the entrance ceremony, where their assigned instructor gives them their brooch. The brooches bear no crests or engravings."],
'ja':["キャンパス内では制服をきちんと着用します。","白いシャツ","白いスカート","金ボタンの黒いコルセット","黒いリボン","金縁の紺色のマント","宝石ブローチ","白いズボン","銀色のベルト","金縁の紺色のジャケット","リボン","入学式",
 "黒いリボンは襟のすぐ下で蝶結びにします。",
 "小さな宝石ブローチを結び目の位置につけます。宝石の色は所属学部の象徴色で、魔道具ではなく学部のしるしです。",
 "新入生は入学式までブローチなしで制服だけを着用し、入学式で担当の教官からブローチを受け取ります。ブローチに紋章や刻印はありません。"],
'zh-TW':["在校園內須整潔地穿著制服。","白襯衫","白裙","金釦黑色馬甲式束腰","黑色緞帶","金邊藏青斗篷","寶石胸針","白長褲","銀色皮帶","金邊藏青外套","緞帶","入學典禮",
 "黑色緞帶在領口正下方綁成蝴蝶結。",
 "小型寶石胸針別在結的位置。寶石的顏色是所屬學部的象徵色，它是學部的標誌，不是魔導具。",
 "新生在入學典禮前只穿制服、不佩戴胸針，並在典禮上由負責的教官領取胸針。胸針上沒有紋章或刻印。"],
'es':["En el campus, el uniforme se lleva con pulcritud.","Camisa blanca","Falda blanca","Corsé negro con botones dorados","Cinta negra","Capa azul marino con ribetes dorados","Broche de gema","Pantalón blanco","Cinturón plateado","Chaqueta azul marino con ribetes dorados","Cinta","Ceremonia de ingreso",
 "La cinta negra se anuda en lazo justo debajo del cuello.",
 "Un pequeño broche de gema se prende en el nudo. El color de la gema es el color simbólico de la facultad; es una insignia de la facultad, no un artefacto mágico.",
 "Los nuevos estudiantes llevan el uniforme sin broche hasta la ceremonia de ingreso, donde su instructor asignado les entrega el broche. Los broches no llevan emblemas ni grabados."]}
for l,rows in T.items():
    with open(R+'translation/src/%s.F.tsv'%l,'a',encoding='utf-8',newline='') as f:
        f.write('\n')
        for k,t in enumerate(rows): f.write('%d\t%s\n'%(867+k,t))
print('ok')
