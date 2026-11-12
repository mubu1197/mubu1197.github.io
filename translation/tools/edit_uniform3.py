import io,sys
sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')
R='C:/Users/MSI/OneDrive/문서/GitHub/mubu1197.github.io/'
def rd(f): return open(R+f,encoding='utf-8',newline='').read()
def wr(f,s): open(R+f,'w',encoding='utf-8',newline='').write(s)
KO=[("금단추 검은 코르셋","검은 코르셋"),("금테 남색 망토","남색 망토"),("금테 남색 재킷","남색 재킷"),
 ("작은 보석 브로치를 매듭 자리에 답니다. 보석의 색은 소속 학부의 상징색이고, 마도구가 아니라 학부의 표지입니다.","보석 브로치는 매듭 자리에 답니다.")]
for f in ('content.js','translation/units.tsv'):
    s=rd(f)
    for a,b in KO:
        if f=='content.js' and a=="작은 보석 브로치를 매듭 자리에 답니다. 보석의 색은 소속 학부의 상징색이고, 마도구가 아니라 학부의 표지입니다.":
            assert s.count(a)==1; s=s.replace(a,b); continue
        if f=='content.js':
            # 제복 블록 안의 항목만 바꾼다 (다른 곳에 같은 말이 없는지 확인)
            assert s.count('"'+a+'"')>=1,a
            s=s.replace('"'+a+'"','"'+b+'"')
        else:
            s=s.replace('\t'+a+'\n','\t'+b+'\n')
    wr(f,s)
NEW={870:{'en':'Black corset','ja':'黒いコルセット','zh-TW':'黑色馬甲式束腰','es':'Corsé negro'},
 872:{'en':'Navy cloak','ja':'紺色のマント','zh-TW':'藏青斗篷','es':'Capa azul marino'},
 876:{'en':'Navy jacket','ja':'紺色のジャケット','zh-TW':'藏青外套','es':'Chaqueta azul marino'},
 880:{'en':'A jeweled brooch is pinned at the knot.','ja':'宝石ブローチは結び目の位置につけます。','zh-TW':'寶石胸針別在結的位置。','es':'El broche de gema se prende en el nudo.'}}
for l in ('en','ja','zh-TW','es'):
    f='translation/src/%s.F.tsv'%l
    lines=rd(f).split('\n')
    for i,ln in enumerate(lines):
        k=ln.split('\t')[0]
        if k.isdigit() and int(k) in NEW: lines[i]='%s\t%s'%(k,NEW[int(k)][l])
    wr(f,'\n'.join(lines))
print('ok')
