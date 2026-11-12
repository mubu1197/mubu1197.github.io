# 문학 문장 수정 + 학생 제복 항목 추가 (한 번만 실행하는 편집 스크립트)
import io,sys
sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')
R='C:/Users/MSI/OneDrive/문서/GitHub/mubu1197.github.io/'
def sub(f,a,b):
    s=open(R+f,encoding='utf-8',newline='').read()
    assert s.count(a)==1,(f,a[:30],s.count(a))
    open(R+f,'w',encoding='utf-8',newline='').write(s.replace(a,b))

KO=[("마르셰가 제출하는 토벌 계획서는 예비 경로와 철수 신호까지 빠짐없이 적혀 있기로 유명합니다.","마르셰의 토벌 계획서는 예비 경로와 철수 신호까지 빠짐없이 적는 편입니다."),
("토니카의 하루는 새벽 다섯 시 훈련 소리로 시작합니다.","토니카의 하루는 이른 아침 훈련 소리로 시작합니다."),
("계승회에서 가장 조용한 학부이면서 가장 오래된 기록을 갖고 있습니다.","계승회 안에서도 가장 조용한 학부로, 오래된 기록을 소중히 이어 갑니다."),
("소화 마법 담당자가 따로 상주합니다.","소화 마법은 가장 먼저 익히는 기본기입니다."),
("시험 기간이면","수업이 바빠지면"),
("누구든 한 번은 배식 당번과 물자 관리를 맡아 봅니다.","배식이나 물자 정리 같은 궂은일은 서로 먼저 맡으려 합니다.")]
for a,b in KO:
    sub('content.js',a,b); sub('translation/units.tsv',a,b)

TR={
'en':[("A Marche subjugation plan is famous for listing every backup route and retreat signal.","A Marche subjugation plan tends to list every backup route and retreat signal."),
("begins with the sound of training at five in the morning.","begins with the sound of training in the early morning."),
("Within the Legacy Society they are the quietest faculty and keep the oldest records.","Even within the Legacy Society they are the quietest faculty, and they carry on old records with care."),
("so a fire-suppression mage is stationed full time.","so fire-suppression magic is the first basic skill everyone learns."),
("At exam time, study groups form","When classes get busy, study groups form"),
("Everyone takes a turn at serving meals and managing supplies.","They each try to be first to take on grunt work such as serving meals and sorting supplies.")],
'ja':[("マルシェの提出する討伐計画書は、予備の経路や撤退の合図まで漏れなく記されていることで有名です。","マルシェの討伐計画書は、予備の経路や撤退の合図まで漏れなく記すのが常です。"),
("明け方五時の訓練の音から","早朝の訓練の音から"),
("継承会で最も静かな学部でありながら、最も古い記録を持っています。","継承会の中でも最も静かな学部で、古い記録を大切に受け継いでいます。"),
("消火魔法の担当者が常駐しています。","消火魔法は真っ先に身につける基本です。"),
("試験期間になると","授業が忙しくなると"),
("誰でも一度は配膳当番と物資管理を務めます。","配膳や物資の整理のような面倒な仕事は、互いに先に引き受けようとします。")],
'zh-TW':[("馬爾榭提交的討伐計畫書，以連備用路線與撤退信號都寫得鉅細靡遺而聞名。","馬爾榭的討伐計畫書，連備用路線與撤退信號都習慣寫得鉅細靡遺。"),
("清晨五點的訓練聲","清晨的訓練聲"),
("在繼承會中是最安靜的學部，卻擁有最古老的紀錄。","在繼承會中也是最安靜的學部，用心延續古老的紀錄。"),
("所以另有專門的滅火魔法人員常駐。","所以滅火魔法是最先學會的基本功。"),
("考試期間不必開口","課業忙碌時不必開口"),
("每個人都至少輪過一次分餐值日與物資管理。","分餐與整理物資這類辛苦事，大家都搶著先做。")],
'es':[("Los planes de incursión de Marche son famosos por incluir hasta las rutas de reserva y las señales de retirada.","Los planes de incursión de Marche suelen incluir hasta las rutas de reserva y las señales de retirada."),
("empieza a las cinco de la mañana con el sonido","empieza de madrugada con el sonido"),
("Dentro de la Sociedad del Legado son la facultad más callada y la que guarda los registros más antiguos.","Incluso dentro de la Sociedad del Legado son la facultad más callada y continúan con esmero los registros antiguos."),
("así que hay un mago de extinción de incendios destinado de forma permanente.","así que la magia de extinción de incendios es lo primero que se aprende."),
("En época de exámenes se forman","Cuando las clases se ponen intensas se forman"),
("Todos hacen al menos un turno repartiendo comidas y gestionando provisiones.","Cada uno se adelanta a asumir tareas ingratas, como repartir comidas y ordenar provisiones.")]}
for l,pairs in TR.items():
    for a,b in pairs: sub('translation/src/%s.A.tsv'%l,a,b)

# ── 학생 제복
UK=[("학생 제복",'index'),
("캠퍼스 안에서는 제복을 단정하게 갖춰 입습니다. 검은 리본은 칼라 바로 아래에서 나비매듭으로 묶고, 작은 보석 브로치는 매듭 자리에 답니다. 브로치 보석의 색은 소속 학부의 상징색이며, 마도구가 아니라 학부의 표지일 뿐입니다.",'content'),
("여학생",'content'),("남학생",'content'),
("흰 셔츠, 흰 치마, 금단추 검은 코르셋, 검은 리본, 금테 남색 망토, 보석 브로치",'content'),
("흰 셔츠, 흰 바지, 은색 벨트, 검은 리본, 금테 남색 재킷, 보석 브로치",'content'),
("신입생은 입학식 전까지 브로치 없이 제복만 입고, 입학식에서 담당 교관에게 학부의 브로치를 받습니다. 브로치에는 문장이나 각인이 없습니다.",'content')]
with open(R+'translation/units.tsv','a',encoding='utf-8',newline='') as f:
    for i,(k,src) in enumerate(UK): f.write('%d\t%s\t%s\n'%(860+i,src,k))
T={'en':["Student Uniform","On campus, uniforms are worn neatly. The black ribbon is tied in a bow just below the collar, and a small jeweled brooch is pinned at the knot. The brooch's gem color is the symbol color of the student's faculty; it is a faculty marker, not a magic tool.","Female students","Male students","White shirt, white skirt, black corset with gold buttons, black ribbon, navy cloak with gold piping, jeweled brooch","White shirt, white pants, silver belt, black ribbon, navy jacket with gold piping, jeweled brooch","Freshmen wear the uniform without a brooch until the entrance ceremony, where their assigned instructor awards them their faculty's brooch. The brooches bear no crests or engravings."],
'ja':["学生の制服","キャンパス内では制服をきちんと着用します。黒いリボンは襟のすぐ下で蝶結びにし、小さな宝石ブローチは結び目の位置につけます。ブローチの宝石の色は所属学部の象徴色で、魔道具ではなく学部のしるしにすぎません。","女子学生","男子学生","白いシャツ、白いスカート、金ボタンの黒いコルセット、黒いリボン、金縁の紺色のマント、宝石ブローチ","白いシャツ、白いズボン、銀色のベルト、黒いリボン、金縁の紺色のジャケット、宝石ブローチ","新入生は入学式までブローチなしで制服だけを着用し、入学式で担当の教官から学部のブローチを授与されます。ブローチに紋章や刻印はありません。"],
'zh-TW':["學生制服","在校園內須整潔地穿著制服。黑色緞帶在領口正下方綁成蝴蝶結，小型寶石胸針別在結的位置。胸針寶石的顏色是所屬學部的象徵色，它只是學部的標誌，不是魔導具。","女學生","男學生","白襯衫、白裙、金釦黑色馬甲式束腰、黑色緞帶、金邊藏青斗篷、寶石胸針","白襯衫、白長褲、銀色皮帶、黑色緞帶、金邊藏青外套、寶石胸針","新生在入學典禮前只穿制服、不佩戴胸針，並在入學典禮上由負責的教官頒發所屬學部的胸針。胸針上沒有紋章或刻印。"],
'es':["Uniforme estudiantil","En el campus, el uniforme se lleva con pulcritud. La cinta negra se anuda en lazo justo debajo del cuello y un pequeño broche de gema se prende en el nudo. El color de la gema es el color simbólico de la facultad del estudiante; es una insignia de la facultad, no un artefacto mágico.","Estudiantes mujeres","Estudiantes hombres","Camisa blanca, falda blanca, corsé negro con botones dorados, cinta negra, capa azul marino con ribetes dorados, broche de gema","Camisa blanca, pantalón blanco, cinturón plateado, cinta negra, chaqueta azul marino con ribetes dorados, broche de gema","Los nuevos estudiantes llevan el uniforme sin broche hasta la ceremonia de ingreso, donde su instructor asignado les entrega el broche de su facultad. Los broches no llevan emblemas ni grabados."]}
for l,rows in T.items():
    with open(R+'translation/src/%s.F.tsv'%l,'a',encoding='utf-8',newline='') as f:
        f.write('\n')
        for i,t in enumerate(rows): f.write('%d\t%s\n'%(860+i,t))

# 데이터와 화면
sub('content.js',"var WORLD_IMG = \"world_banner\";",
 'var UNIFORM = {\n h:"학생 제복",\n lead:"캠퍼스 안에서는 제복을 단정하게 갖춰 입습니다. 검은 리본은 칼라 바로 아래에서 나비매듭으로 묶고, 작은 보석 브로치는 매듭 자리에 답니다. 브로치 보석의 색은 소속 학부의 상징색이며, 마도구가 아니라 학부의 표지일 뿐입니다.",\n items:[["여학생","img/uniform_female.jpg","흰 셔츠, 흰 치마, 금단추 검은 코르셋, 검은 리본, 금테 남색 망토, 보석 브로치"],["남학생","img/uniform_male.jpg","흰 셔츠, 흰 바지, 은색 벨트, 검은 리본, 금테 남색 재킷, 보석 브로치"]],\n note:"신입생은 입학식 전까지 브로치 없이 제복만 입고, 입학식에서 담당 교관에게 학부의 브로치를 받습니다. 브로치에는 문장이나 각인이 없습니다."\n};\nvar WORLD_IMG = "world_banner";')
print('done')
