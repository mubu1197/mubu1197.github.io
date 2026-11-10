# 사이트 소스에서 한글이 들어간 문장 조각을 뽑아 translation/units.tsv 로 저장합니다.
import re,sys,io
sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')
H=re.compile(r'[가-힣]')
FILES=['content.js','quiz.js','letter.js','worldcup.js','spells.js','workshop.js','memory.js','bubble.js','tiles.js','suika.js','water.js','play.js','index.html']
ESC={'n':'\n','t':'\t',chr(92):chr(92),"'":"'",'"':'"','`':'`','$':'$'}

def parse_code(s,i,end=None):
    """코드 영역을 훑으며 (종류, 원문) 문자열 리터럴 목록을 반환."""
    out=[];n=len(s);depth=0
    while i<n:
        c=s[i]
        if end and c=='}' and depth==0: return out,i+1
        if c=='{' : depth+=1
        elif c=='}': depth-=1
        if c=='/' and s[i+1:i+2]=='/':
            j=s.find('\n',i);i=n if j<0 else j;continue
        if c=='/' and s[i+1:i+2]=='*':
            j=s.find('*/',i+2);i=n if j<0 else j+2;continue
        if c in '"\'':
            j=i+1;buf=[]
            while j<n and s[j]!=c and s[j]!='\n':
                if s[j]==chr(92) and j+1<n: buf.append(ESC.get(s[j+1],s[j+1]));j+=2
                else: buf.append(s[j]);j+=1
            out.append(('s',''.join(buf)));i=j+1;continue
        if c=='`':
            j=i+1;buf=[];segs=[]
            while j<n and s[j]!='`':
                if s[j]==chr(92) and j+1<n: buf.append(ESC.get(s[j+1],s[j+1]));j+=2
                elif s[j]=='$' and s[j+1:j+2]=='{':
                    segs.append(''.join(buf));buf=[]
                    inner,j=parse_code(s,j+2,'}');out+=inner
                else: buf.append(s[j]);j+=1
            segs.append(''.join(buf))
            for x in segs: out.append(('t',x))
            i=j+1;continue
        i+=1
    return out,i

def frags(kind,text):
    if not H.search(text): return []
    res=[]
    parts=re.split(r'<[^>]*>',text) if '<' in text else [text]
    for p in parts:
        for q in re.split(r'\n\s*\n',p):
            q=q.strip()
            if H.search(q): res.append(q)
    return res

units={}
def add(u,src):
    if u not in units: units[u]=[]
    if src not in units[u]: units[u].append(src)

for f in FILES:
    s=open(f,encoding='utf-8').read()
    if f=='index.html':
        # <script> 바깥은 HTML 텍스트, 안쪽은 JS
        pos=0
        for m in re.finditer(r'<script[^>]*>(.*?)</script>',s,re.S):
            html=s[pos:m.start()];pos=m.end()
            html=re.sub(r'<style.*?</style>','',html,flags=re.S)
            for a in re.findall(r'(?:placeholder|aria-label|title|alt)="([^"]*[가-힣][^"]*)"',html): add(a.strip(),f)
            for t in re.findall(r'>([^<>]*[가-힣][^<>]*)<',html): add(t.strip(),f)
            lits,_=parse_code(m.group(1),0)
            for k,t in lits:
                for u in frags(k,t): add(u,f)
        html=re.sub(r'<style.*?</style>','',s[pos:],flags=re.S)
        for t in re.findall(r'>([^<>]*[가-힣][^<>]*)<',html): add(t.strip(),f)
    else:
        lits,_=parse_code(s,0)
        for k,t in lits:
            if f=='content.js' and t.count('|')>200: continue   # ROSTER 본문은 규칙으로 처리
            for u in frags(k,t): add(u,f)

with open('translation/units.tsv','w',encoding='utf-8') as o:
    for i,(u,src) in enumerate(units.items()):
        o.write('%d\t%s\t%s\n'%(i+1,','.join(x.replace('.js','').replace('.html','') for x in src),u.replace(chr(10),chr(92)+'n')))
print(len(units),sum(len(u) for u in units))
