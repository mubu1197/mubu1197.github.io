# translation/src 의 번역 원고를 모아 i18n/<언어>.js 를 만듭니다.
#   python translation/tools/build.py
import re,json,glob,os,sys,io
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from letter_tpl import LETTER
sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
T=os.path.join(ROOT,'translation')
LANGS=['en','ja','zh-TW','es']
COL={'en':0,'ja':1,'zh-TW':2,'es':3}
H=re.compile(r'[가-힣]')

def clean(s):
    s=s.replace('\\n','\n')
    i=s.rfind('>')
    if i>=0 and H.search(s[i+1:]): s=s[i+1:]
    elif i>=0 and s.find('>')<(H.search(s).start() if H.search(s) else 0): s=s[s.find('>')+1:]
    s=s.split('<')[0]
    return s.strip().strip('"').strip()

units={}
for line in open(os.path.join(T,'units.tsv'),encoding='utf-8').read().split('\n'):
    p=line.split('\t')
    if len(p)>=3: units[int(p[0])]=p[2]

def read_tsv(path,n):
    rows=[]
    for line in open(path,encoding='utf-8').read().split('\n'):
        if not line.strip(): continue
        p=line.split('\t')
        if len(p)>=n: rows.append(p)
    return rows

# ── 사람 이름 (characters.psv)
names=[r for r in read_tsv(os.path.join(T,'characters.psv').replace('.psv','.psv'),1)]
names=[l.split('|') for l in open(os.path.join(T,'characters.psv'),encoding='utf-8').read().split('\n')[1:] if l.strip()]

ANIMAL={'토끼':['rabbit','ウサギ','兔','conejo'],'여우':['fox','キツネ','狐狸','zorro'],'늑대':['wolf','オオカミ','狼','lobo'],
 '백호':['white tiger','白虎','白虎','tigre blanco'],'곰':['bear','クマ','熊','oso'],'사자':['lion','ライオン','獅子','león'],
 '호랑이':['tiger','トラ','老虎','tigre'],'상어':['shark','サメ','鯊魚','tiburón'],'문어':['octopus','タコ','章魚','pulpo'],
 '범고래':['orca','シャチ','虎鯨','orca'],'고양이':['cat','ネコ','貓','gato'],'양':['sheep','ヒツジ','綿羊','oveja'],
 '쥐':['mouse','ネズミ','老鼠','ratón'],'개':['dog','イヌ','狗','perro']}
RACE_T=['{a} Beastfolk','{a}の獣人','{a}獸人','Raza bestial ({a})']
WEAPON={'레이피어':['Rapier','レイピア','刺劍','Estoque'],'채찍':['Whip','鞭','鞭子','Látigo'],'쌍단검':['Twin Daggers','双短剣','雙短劍','Dagas gemelas'],
 '대낫':['Great Scythe','大鎌','大鐮刀','Gran guadaña'],'한손검과 단검':['Sword and Dagger','片手剣と短剣','單手劍與短劍','Espada y daga'],
 '전투 도끼':['Battle Axe','戦斧','戰斧','Hacha de guerra'],'플레일':['Flail','フレイル','連枷','Mangual'],'장창':['Long Spear','長槍','長槍','Lanza larga'],
 '대도':['Great Saber','大刀','大刀','Gran sable'],'망치':['Hammer','ハンマー','錘子','Martillo'],'대검':['Greatsword','大剣','大劍','Espadón'],
 '체술':['Martial Arts','体術','體術','Artes marciales'],'할버드':['Halberd','ハルバード','戟','Alabarda'],'삼지창':['Trident','三叉槍','三叉戟','Tridente'],
 '메이스':['Mace','メイス','釘頭錘','Maza'],'롱소드':['Longsword','ロングソード','長劍','Espada larga'],
 '롱소드와 방패':['Longsword and Shield','ロングソードと盾','長劍與盾牌','Espada larga y escudo'],'쌍검':['Twin Swords','双剣','雙劍','Espadas gemelas'],
 '장봉':['Long Staff','長棍','長棍','Bastón largo'],'단궁':['Short Bow','短弓','短弓','Arco corto'],'단검 두 자루':['Two Daggers','短剣二本','雙持短劍','Dos dagas'],
 '장궁':['Longbow','長弓','長弓','Arco largo'],'투척용 포션들':['Throwing Potions','投擲用ポーション','投擲用藥水','Pociones arrojadizas'],
 '투척용 손도끼':['Throwing Axes','投擲用手斧','投擲用手斧','Hachas arrojadizas'],'철퇴':['Spiked Mace','鉄槌','鐵鎚','Maza de pinchos'],
 '투척용 단검':['Throwing Daggers','投擲用短剣','投擲用短劍','Dagas arrojadizas'],'석궁':['Crossbow','クロスボウ','弩','Ballesta'],
 '한손검':['One-handed Sword','片手剣','單手劍','Espada de una mano'],'창':['Spear','槍','長矛','Lanza'],'대형 방패':['Tower Shield','大型の盾','大型盾牌','Escudo grande']}
MONTHS={'en':['January','February','March','April','May','June','July','August','September','October','November','December'],
 'ja':['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
 'zh-TW':['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
 'es':['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']}
# 패턴용 문구: $1 $2 … 는 정규식 그룹으로 바뀝니다
PT={
 'age':['$1 years old','$1歳','$1歲','$1 años'],
 'circle':['Circle $1','サークル$1','$1圈','Círculo $1'],
 'items':['$1 items','$1項目','$1項','$1 elementos'],
 'fac':['$1 faculties','$1学部','$1個學部','$1 facultades'],
 'merit':['Merit $1','功勲 $1','功勳 $1','Mérito $1'],
 'people':['$1 characters','$1人','$1人','$1 personajes'],
 'alln':['All ($1)','全員($1人)','全員（$1人）','Todos ($1)'],
 'round':['Round of $1','ベスト$1','$1強','Ronda de $1'],
 'moves':['$1 moves','$1手','$1步','$1 movimientos'],
 'quiz':['Answer $1 questions and we will tell you which faculty suits you.','$1個の質問に答えると、あなたにふさわしい学部をお知らせします。','回答 $1 個問題，就能告訴你適合的學部。','Responde $1 preguntas y te diremos qué facultad te conviene.'],
 'symbol':['Symbol: $1','象徴:$1','象徵：$1','Símbolo: $1'],
 'major':['Major: $1','専攻:$1','主修：$1','Especialidad: $1'],
 'focus':['$1-focused','$1中心','以$1為主','Centrada en $1'],
 'card':['Card $1','カード$1','卡片$1','Carta $1'],
 'tube':['Test tube $1','試験管$1','試管$1','Tubo $1'],
 'brooch':['$1 brooch','$1のブローチ','$1的胸針','Broche de $1'],
 'colors':['$1 colors','$1色','$1色','$1 colores'],
 'cards':['$1 cards','$1枚','$1張','$1 cartas'],
 'spell':['$2 of $1','$1の$2','$1之$2','$2 de $1'],
 'm_end':['In $1 moves, finished in $2','$1手、$2で終わりました','$1 步，花了 $2 完成','En $1 movimientos, terminado en $2'],
 'm_best':[' (best record: $1 moves)','(最高記録 $1手)','（最佳紀錄 $1 步）',' (mejor récord: $1 movimientos)'],
 'm_new':[' — a new best record!',' — 新記録です','— 刷新最佳紀錄',' — ¡nuevo récord!'],
 'b_end':['$1 shots, finished in $2','$1発、$2で終わりました','$1 發，花了 $2 完成','$1 disparos, terminado en $2'],
 'h_new':[' — a new high score!',' — 新しい最高スコアです',' — 刷新最高分',' — ¡nueva puntuación máxima!'],
 't_goal':['$1 pts · goal reached','$1点 · 目標を達成しました','$1 分 · 達成目標','$1 puntos · objetivo alcanzado'],
 't_left':['$1 pts · $2 to the goal','$1点 · 目標まであと$2点','$1 分 · 距離目標還差 $2 分','$1 puntos · $2 para el objetivo'],
 's_end':['$1 points','$1点','$1 分','$1 puntos'],
 's_new':[' — high score!',' — 最高スコアです',' — 最高分',' — ¡puntuación máxima!'],
 'w_end':['Finished in $1 moves','$1手で終わりました','$1 步完成','Terminado en $1 movimientos'],
 't_pen':['If nothing matches, time drops by $1 seconds.','合うところがなければ、時間が$1秒減ります。','如果沒有符合的地方，時間會減少 $1 秒。','Si no hay coincidencias, el tiempo baja $1 segundos.'],
 'pen':['−$1s','−$1秒','−$1 秒','−$1 s'],
 'undisc':['$1 form · not yet discovered','$1の形 · まだ発見していません','$1形態 · 尚未發現','Forma $1 · aún sin descubrir'],
 'office':['Office','教務庁','教務處','Oficina'],
}
BYID={'fh1':['Instructors','教官','教官','Instructores'],'fh2':['Students','学生','學生','Estudiantes']}
PAREN=[(' (',')'),('(',')'),('（','）'),(' (',')')]

def js_str(s): return json.dumps(s,ensure_ascii=False)

def build(lang):
    c=COL[lang]
    d={}
    def put(k,v):
        if v is None or v=='' or v=='-': return
        d[k]=v
    # 1) 문장 단위 번역
    for ch in 'ABCDEF':
        path=os.path.join(T,'src','%s.%s.tsv'%(lang,ch))
        for line in open(path,encoding='utf-8').read().split('\n'):
            if not line.strip(): continue
            i,_,v=line.partition('\t')
            ko=units.get(int(i))
            if ko is None or v.strip()=='-': continue
            k=clean(ko)
            if H.search(k): put(k,v.replace('\\n','\n'))
    # 2) 성격 키워드
    for line in open(os.path.join(T,'src','pers.tsv'),encoding='utf-8').read().split('\n'):
        p=line.split('\t')
        if len(p)<5: continue
        pers=open(os.path.join(T,'pers.txt'),encoding='utf-8').read().split('\n')
    pk={}
    for l in open(os.path.join(T,'pers.txt'),encoding='utf-8').read().split('\n'):
        if '\t' in l: a,b=l.split('\t'); pk[int(a)]=b
    for line in open(os.path.join(T,'src','pers.tsv'),encoding='utf-8').read().split('\n'):
        p=line.split('\t')
        if len(p)>=5 and int(p[0]) in pk: put(pk[int(p[0])],p[1+c])
    # 3) 이름
    sep={'en':' ','es':' ','ja':'・','zh-TW':'·'}[lang]
    for ko,*tr in names:
        full=tr[c]
        put(ko,full)
        g=ko.split(' ')[0]
        if g not in d: put(g,full.split(sep)[0])
    # 4) 종족, 무기
    for k,a in ANIMAL.items(): put(k+' 수인',RACE_T[c].format(a=(a[c].title() if lang=='en' else a[c])))
    pa=PAREN[c]
    for k,w in WEAPON.items(): put(k,w[c])
    warrior=None
    # 5) 직접 쓴 사전 (extra.tsv)  — 앞의 것을 덮어씁니다
    for line in open(os.path.join(T,'src','extra.tsv'),encoding='utf-8').read().split('\n'):
        p=line.split('\t')
        if len(p)>=5: put(p[0],p[1+c])
    if '전사' in d:
        for k,w in WEAPON.items(): put('전사 (%s)'%k,'%s%s%s%s'%(d['전사'],pa[0],w[c],pa[1]))
    return d

def pat(lang):
    c=COL[lang]
    def t(name): return PT[name][c]
    def T_(name):  # 정규식 그룹 $n → JS 치환 함수 본문
        return json.dumps(t(name),ensure_ascii=False)
    def F(name): return 'F(%s)'%T_(name)
    mo=js_str(MONTHS[lang])
    es=lang=='es'
    pa=PAREN[c]
    low='.charAt(0).toLowerCase()+x.slice(1)' if es else ''
    lines=[
     "function F(t){return function(m){return t.replace(/\\$(\\d)/g,function(_,i){return m[+i]})}}",
     "var STG='입문|기초|숙련|전문|대가|대마도|초월|미지';",
     "var P=[",
     "[/^(\\d+)세$/,%s],"%F('age'),
     "[/^(\\d+)서클$/,%s],"%F('circle'),
     "[/^(\\d+)항목$/,%s],"%F('items'),
     "[/^(\\d+)학부$/,%s],"%F('fac'),
     "[/^공훈 (\\d+)$/,%s],"%F('merit'),
     "[/^(\\d+)명$/,%s],"%F('people'),
     "[/^전원 \\((\\d+)명\\)$/,%s],"%F('alln'),
     "[/^(\\d+)강$/,%s],"%F('round'),
     "[/^(\\d+)번$/,%s],"%F('moves'),
     "[/^(\\d+)색$/,%s],"%F('colors'),
     "[/^(\\d+)장$/,%s],"%F('cards'),
     "[/^(\\d+)개의 질문에 답하면, 당신에게 어울리는 학부를 알려 드립니다\\.$/,%s],"%F('quiz'),
     "[/^상징 (.+)$/,function(m,tr){return %s(m,tr)}],"%("function(m,tr){var x=tr(m[1])||m[1];return %s.replace('$1',x)}"%T_('symbol')),
     "[/^전공 (.+)$/,function(m,tr){var x=tr(m[1])||m[1];return %s.replace('$1',x)}],"%T_('major'),
     "[/^(.+) 중심$/,function(m,tr){var x=tr(m[1])||m[1];x=x%s;return %s.replace('$1',x)}],"%(low if es else '',T_('focus')),
     "[/^카드 (\\d+)$/,%s],"%F('card'),
     "[/^시험관 (\\d+)$/,%s],"%F('tube'),
     "[/^(.+) 브로치$/,function(m,tr){var x=tr(m[1])||m[1];return %s.replace('$1',x)}],"%T_('brooch'),
     "[/^(%s) ([A-Za-z]+)$/.source?null:null,null],"%'STG',
    ]
    # 서클 단계 이름 뒤에 영문이 붙은 합성
    lines[-1]="[new RegExp('^('+STG+') [A-Za-z]+$'),function(m,tr){return tr(m[1])}],"
    lines+=[
     "[/^(.+)의 (구체|창|화살|장벽|영역|파동|사슬|화신)$/,function(m,tr){var a=tr(m[1])||m[1],b=tr(m[2])||m[2];return %s.replace('$1',a).replace('$2',b)}],"%T_('spell'),
     "[/^(.+) \\(교무청 소속\\)$/,function(m,tr){return (tr(m[1])||m[1])+' '+(tr('(교무청 소속)')||'')}],",
     "[/^(귀족|비귀족|교직원) \\((.+)\\)$/,function(m,tr){return (tr(m[1])||m[1])+'%s'+(tr(m[2])||m[2])+'%s'}],"%(pa[0],pa[1]),
     "[/^전사 \\((.+)\\)$/,function(m,tr){return (tr('전사')||'전사')+'%s'+(tr(m[1])||m[1])+'%s'}],"%(pa[0],pa[1]),
     "[/^(구체|창|화살|장벽|영역|파동|사슬|화신) 형태 · 아직 발견하지 못했어요$/,function(m,tr){return %s.replace('$1',tr(m[1])||m[1])}],"%T_('undisc'),
     "[/^(\\d+)월$/,function(m){return %s[+m[1]-1]}],"%mo,
     "[/^(\\d+)번 만에, (\\d+:\\d+)에 끝냈어요( \\(최고 기록 (\\d+)번\\)| — 새 최고 기록이에요)?$/,function(m){var r=%s(m);return r+(m[4]?%s.replace('$1',m[4]):m[3]?%s:'')}],"%(F('m_end'),T_('m_best'),T_('m_new')),
     "[/^(\\d+)발, (\\d+:\\d+)에 끝냈어요( — 새 최고 점수예요)?$/,function(m){return %s(m)+(m[3]?%s:'')}],"%(F('b_end'),T_('h_new')),
     "[/^(\\d+)점 · (목표를 달성했어요|목표까지 (\\d+)점)( — 새 최고 점수예요)?$/,function(m){return (m[3]?%s(m):%s(m))+(m[4]?%s:'')}],"%("F(%s.replace('$2','$3'))"%T_('t_left'),F('t_goal'),T_('h_new')),
     "[/^(\\d+)점( — 최고 점수예요)?$/,function(m){return %s(m)+(m[2]?%s:'')}],"%(F('s_end'),T_('s_new')),
     "[/^(\\d+)번 만에 끝냈어요( — 새 최고 기록이에요)?$/,function(m){return %s(m)+(m[2]?%s:'')}],"%(F('w_end'),T_('m_new')),
     "[/^맞는 곳이 없으면 시간이 (\\d+)초 줄어요\\.$/,%s],"%F('t_pen'),
     "[/^−(\\d+)초$/,%s]"%F('pen'),
     "];",
    ]
    return '\n'.join(lines)

for lang in LANGS:
    d=build(lang)
    out=[ '/* ═══ 번역 사전(%s) — translation/tools/build.py 가 만듭니다. 직접 고치지 마세요 ═══ */'%lang,
          '(function(){',
          pat(lang),
          'window.I18N_PACK={d:%s,p:P,byId:%s};'%(json.dumps(d,ensure_ascii=False,separators=(',',':')),json.dumps({k:v[COL[lang]] for k,v in BYID.items()},ensure_ascii=False)),
          'window.I18N_PACK.letter=%s;'%LETTER[lang],
          '})();']
    p=os.path.join(ROOT,'i18n',lang+'.js')
    open(p,'w',encoding='utf-8',newline='\n').write('\n'.join(out)+'\n')
    print(lang,len(d),'entries',os.path.getsize(p),'bytes')
