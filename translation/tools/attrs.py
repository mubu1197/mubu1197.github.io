import re,sys,io
sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')
files=['content.js','quiz.js','letter.js','worldcup.js','spells.js','workshop.js','memory.js','bubble.js','tiles.js','suika.js','water.js','play.js','index.html']
seen={}
pat=re.compile(r'(?:title|aria-label|placeholder|alt)=\\?"([^"\\]*[가-힣][^"\\]*)')
for f in files:
    s=open(f,encoding='utf-8').read()
    for m in pat.finditer(s):
        seen.setdefault(m.group(1),[]).append(f)
    for m in re.finditer(r"setAttribute\('(?:aria-label|title)',([^)]*)\)",s):
        for q in re.findall(r"'([^']*[가-힣][^']*)'",m.group(1)):
            seen.setdefault(q,[]).append(f+'*')
for i,(k,v) in enumerate(seen.items()):
    print('%d\t%s\t%s'%(1001+i,v[0],k))
