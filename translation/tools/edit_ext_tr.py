import io,sys,re
sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')
R='C:/Users/MSI/OneDrive/문서/GitHub/mubu1197.github.io/'
def rd(f): return open(R+f,encoding='utf-8',newline='').read()
def wr(f,s): open(R+f,'w',encoding='utf-8',newline='').write(s)

# spells_ext.js 에서 이름과 콘셉트를 읽는다
ext=rd('spells_ext.js')
rows=re.findall(r'\[\[([0-9,]+)\],"([^"]+)","([^"]+)","#[0-9a-f]{6}"\]',ext)
assert len(rows)==22,len(rows)
names=[r[1] for r in rows]; concepts=[r[2] for r in rows]

# units.tsv: 882.. 이름, 904.. 콘셉트, 926.. 묶음 이름. 682/688 은 6계열 문구로 교체
ids=[]
with open(R+'translation/units.tsv','a',encoding='utf-8',newline='') as f:
    for i,n in enumerate(names): f.write('%d\tspells_ext\t%s\n'%(882+i,n))
    for i,c in enumerate(concepts): f.write('%d\tspells_ext\t%s\n'%(904+i,c))
    for i,g in enumerate(['네 계열','다섯 계열','여섯 계열']): f.write('%d\tworkshop\t%s\n'%(926+i,g))
u=rd('translation/units.tsv')
a="(최대 3개 · 구슬을 끌어다 놓거나 아래 버튼을 눌러요 · 합치면 고리가 그 조합의 색으로 물들어요)"
b="(최대 6개 · 구슬을 끌어다 놓거나 아래 버튼을 눌러요 · 합치면 고리가 그 조합의 색으로 물들어요)"
assert u.count(a)==1; u=u.replace(a,b)
a="마나는 한 번에 세 가지까지만 합칠 수 있어요. 먼저 하나를 빼 주세요."
b="마나는 한 번에 여섯 가지까지만 합칠 수 있어요. 먼저 하나를 빼 주세요."
assert u.count(a)==1; u=u.replace(a,b)
wr('translation/units.tsv',u)

NAMES={'en':"Providence|Constellation|Fierce Battle|Paradise|Safeguard|Dawnlight|Poison Mist|Fiend|Ruins|Stirring|Purgatory|Martyrdom|Execution|Holy Body|Demonkin|Myth|Demon God|Flower Garden|Divine Wrath|Primal|Effortless|Myriad",
'ja':"摂理|星座|激戦|楽園|守護|曙光|毒霧|魔獣|廃墟|胎動|煉獄|殉教|執行|聖体|魔人|神話|魔神|花園|天罰|原始|無為|万象",
'zh-TW':"天理|星座|激戰|樂園|守護|曙光|毒霧|魔獸|廢墟|胎動|煉獄|殉教|執行|聖體|魔人|神話|魔神|花園|天罰|原始|無為|萬象",
'es':"Providencia|Constelación|Batalla encarnizada|Paraíso|Salvaguarda|Primera luz|Niebla venenosa|Engendro|Ruinas|Despertar|Purgatorio|Martirio|Ejecución|Cuerpo sagrado|Semidemonio|Mito|Dios demoníaco|Jardín floral|Ira divina|Primigenio|Sin esfuerzo|Miríada"}
CON={'en':["Life and death, light and darkness continue within nature's cycle","A weave of the heavens where all energies join beneath starlight","A fight in which one marches on clad in the power of light, darkness and nature","A place where nature and sacred life bloom through mana","A blessing in which nature and the divine protect the body","The energy of nature and the divine spreads like dawn light, lending strength","A poison that gnaws at life spreads like mist on the mana","Wilderness stained by darkness, a body harboring venomous fangs","Nature's decay amplified by mana; everything crumbles","Nature and life, mana and strength all awaken at once","A boundary where life and death, light and darkness are entangled by mana","A sacred body that bears pain and still does not fall","A verdict struck down, forging the principles of light and darkness with mana","Sacred life shaped by mana and made to dwell in the body","A body remade through darkness and life with mana, beyond the human","Light and darkness, life and mana dwell in a single body","A colossal being shaped from nature and darkness without the divine","A paradise without darkness where every life blooms to the full","Judgment delivered by light and darkness, nature and strength, without life","Primal power that strikes with the body, bypassing mana","Providence moves by itself without any effort","The mana of six schools gathers to become every phenomenon of the world"],
'ja':["生と死、光と闇が自然の循環の中でつながる","星明かりの下、すべての気がつながった天の織り目","光と闇、自然の力を身にまとって突き進む戦い","自然と神聖な生命がマナで咲き誇る場所","自然と神聖が肉体を守ってくれる加護","夜明けの光のように広がる自然と神聖の気に力を乗せる","生命を蝕む毒がマナに乗り、霧のように広がっていく","闇に染まった野生、毒牙を秘めた肉体","マナで増幅した衰退の自然、すべてが崩れ落ちる","自然と生命、マナと力が一斉に目覚める","生と死、光と闇がマナで絡み合う境界","苦痛を背負っても倒れない神聖な肉体","光と闇の理をマナで鍛え上げて振り下ろす判決","神聖な生命をマナで形作り、身に宿らせる","闇と生命をマナで作り変えた、人を超えた肉体","一つの体に光と闇、生命とマナが宿る","神聖なしに自然と闇で形作った巨大な存在","闇のない楽園、あらゆる生命が思いきり咲き誇る","生命なしに光と闇、自然と力で下す審判","マナを介さず、体でぶつかる原初の力","力を入れなくても摂理がひとりでに動く","六つの系統のマナが一つになり、世界のあらゆる現象となる"],
'zh-TW':["生與死、光與暗在自然的循環中相連","星光之下萬般氣息相連的天幕織紋","披著光與暗、自然之力向前衝鋒的戰鬥","自然與神聖的生命藉魔力盛開之處","自然與神聖共同守護肉體的庇佑","如曙光般擴散的自然與神聖氣息，為力量加持","侵蝕生命的毒藉魔力如迷霧般蔓延","被黑暗浸染的野性，藏著毒牙的肉體","以魔力增幅的衰敗自然，一切都在崩塌","自然與生命、魔力與力量同時甦醒","生與死、光與暗被魔力糾纏的邊界","承受痛苦仍不倒下的神聖身軀","以魔力鍛造光與暗的道理後落下的判決","以魔力塑造神聖的生命，使其寄宿於身","以魔力將黑暗與生命改造而成、超越人類的肉體","光與暗、生命與魔力寄宿於同一副身軀","不借神聖、以自然與黑暗塑成的巨大存在","沒有黑暗的樂園，萬物生命盡情綻放","不借生命，以光與暗、自然與力量降下的審判","不經魔力、以身體衝撞的原初之力","不費吹灰之力，天理自會運行","六個系別的魔力匯聚一處，化為世間所有現象"],
'es':["La vida y la muerte, la luz y la oscuridad se enlazan en el ciclo de la naturaleza","Un tejido celeste donde todas las energías se unen bajo la luz de las estrellas","Un combate en el que se avanza revestido del poder de la luz, la oscuridad y la naturaleza","Un lugar donde la naturaleza y la vida sagrada florecen gracias al maná","Un amparo en el que la naturaleza y lo divino protegen el cuerpo","La energía de la naturaleza y lo divino se extiende como luz del alba y presta fuerza","Un veneno que carcome la vida se propaga sobre el maná como una niebla","Un instinto salvaje teñido de oscuridad, un cuerpo que oculta colmillos venenosos","La decadencia de la naturaleza amplificada por el maná; todo se derrumba","La naturaleza y la vida, el maná y la fuerza despiertan a la vez","Una frontera donde la vida y la muerte, la luz y la oscuridad se entrelazan con el maná","Un cuerpo sagrado que soporta el dolor y aun así no cae","Una sentencia que cae, forjada con el maná a partir de las leyes de la luz y la oscuridad","Vida sagrada moldeada con maná y hecha morar en el cuerpo","Un cuerpo rehecho con maná a partir de oscuridad y vida, más allá de lo humano","La luz y la oscuridad, la vida y el maná habitan en un solo cuerpo","Un ser colosal moldeado con naturaleza y oscuridad, sin lo divino","Un paraíso sin oscuridad donde toda vida florece a plenitud","Un juicio dictado con luz y oscuridad, naturaleza y fuerza, sin vida","Poder primigenio que golpea con el cuerpo, sin pasar por el maná","La providencia se mueve sola, sin esfuerzo alguno","El maná de seis escuelas se reúne y se convierte en todos los fenómenos del mundo"]}
GRP={'en':['Four schools','Five schools','Six schools'],'ja':['四系統','五系統','六系統'],'zh-TW':['四個系別','五個系別','六個系別'],'es':['Cuatro escuelas','Cinco escuelas','Seis escuelas']}
CAP={'en':("(Up to 3 ·","(Up to 6 ·"),'ja':("(最大3つ ·","(最大6つ ·"),'zh-TW':("（最多3個 ·","（最多6個 ·"),'es':("(Hasta 3 ·","(Hasta 6 ·")}
MSG={'en':("You can combine at most three mana at once. Remove one first.","You can combine at most six mana at once. Remove one first."),
'ja':("マナは一度に三つまでしか合わせられません。まず一つ外してください。","マナは一度に六つまでしか合わせられません。まず一つ外してください。"),
'zh-TW':("魔力一次最多只能合併三種。請先取出一個。","魔力一次最多只能合併六種。請先取出一個。"),
'es':("Solo se pueden combinar tres maná a la vez. Quita uno primero.","Solo se pueden combinar seis maná a la vez. Quita uno primero.")}
for l in ('en','ja','zh-TW','es'):
    nm=NAMES[l].split('|'); assert len(nm)==22 and len(CON[l])==22
    with open(R+'translation/src/%s.G.tsv'%l,'w',encoding='utf-8',newline='') as f:
        for i,n in enumerate(nm): f.write('%d\t%s\n'%(882+i,n))
        for i,c in enumerate(CON[l]): f.write('%d\t%s\n'%(904+i,c))
        for i,g in enumerate(GRP[l]): f.write('%d\t%s\n'%(926+i,g))
    fd=R and 'translation/src/%s.D.tsv'%l
    s=rd(fd)
    assert s.count(CAP[l][0])==1,(l,'cap'); s=s.replace(CAP[l][0],CAP[l][1])
    assert s.count(MSG[l][0])==1,(l,'msg'); s=s.replace(MSG[l][0],MSG[l][1])
    wr(fd,s)
b=rd('translation/tools/build.py')
if "'ABCDEFG'" not in b:
    b=b.replace("for ch in 'ABCDEF':","for ch in 'ABCDEFG':"); wr('translation/tools/build.py',b)
print('ok')
