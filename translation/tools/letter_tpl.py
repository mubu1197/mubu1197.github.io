# 입학 통지서 문장틀 (언어별). build.py 가 I18N_PACK.letter 로 넣습니다.
LOW='o.charAt(0).toLowerCase()+o.slice(1)'
LETTER={
'en':'''function(i,name,L,f,hn){name=name==L.defaultName?TR(name):name;var fn=TR(f[0]),g=TR(L.gems[i]),d=TR(L.date),t=TR(L.time),pl=TR(L.place),o=TR(L.orient);
return {to:"Dear "+name+",",body:["Northeia Academy is pleased to inform you that you have been accepted as a new student.",
"The faculty you chose before admission is *"+fn+"*. When you receive the "+g+" jeweled brooch at the entrance ceremony, you will formally become a member of "+fn+".",
"The entrance ceremony will be held on *"+d+", "+L.year+", at "+t+"* in "+pl+". Afterward you will be guided to your faculty hall, and "+LOW+". The classmates with whom you will share your three years of study are waiting for you there.",
"Please arrive at the Academy by the appointed time. We wish you good fortune in all that lies ahead."],from:TR(L.from),sent:TR(L.sent),head:TR(L.headTitle),sign:TR(hn)}}''',
'ja':'''function(i,name,L,f,hn){name=name==L.defaultName?TR(name):name;var fn=TR(f[0]),g=TR(L.gems[i]),d=TR(L.date),t=TR(L.time),pl=TR(L.place),o=TR(L.orient);
return {to:name+" 様",body:["ノルテイア・アカデミーは、あなたを新入生としてお迎えすることをお知らせいたします。",
"あなたが入学前にお選びになった学部は*"+fn+"*です。入学式で"+g+"の宝石ブローチを受け取ると、あなたは正式に"+fn+"の一員となります。",
"入学式は*"+L.year+"年"+d+" "+t+"*、"+pl+"で開かれます。式の後は所属の学部館へご案内し、"+o+"。3年間の教育課程を共にする同期たちが、そこであなたを待っています。",
"どうか指定された時刻までにアカデミーへお越しください。あなたの前途に幸運がありますよう祈っています。"],from:TR(L.from),sent:TR(L.sent),head:TR(L.headTitle),sign:TR(hn)}}''',
'zh-TW':'''function(i,name,L,f,hn){name=name==L.defaultName?TR(name):name;var fn=TR(f[0]),g=TR(L.gems[i]),d=TR(L.date),t=TR(L.time),pl=TR(L.place),o=TR(L.orient);
return {to:"致 "+name,body:["諾爾泰亞學院很高興通知您，您已獲錄取為新生。",
"您在入學前選擇的學部是*"+fn+"*。在入學典禮上領取"+g+"寶石胸針後，您將正式成為"+fn+"的一員。",
"入學典禮將於*"+L.year+"年"+d+" "+t+"*在"+pl+"舉行。典禮結束後會引導您前往所屬學部館，"+o+"。將與您共度三年課程的同屆同學們正在那裡等著您。",
"請務必在指定時間前抵達學院。祝您前程幸運。"],from:TR(L.from),sent:TR(L.sent),head:TR(L.headTitle),sign:TR(hn)}}''',
'es':'''function(i,name,L,f,hn){name=name==L.defaultName?TR(name):name;var fn=TR(f[0]),g=TR(L.gems[i]),d=TR(L.date),t=TR(L.time),pl=TR(L.place),o=TR(L.orient);
return {to:"Estimado/a "+name,body:["La Academia de Northeia tiene el placer de informarle de que ha sido admitido/a como nuevo estudiante.",
"La facultad que eligió antes del ingreso es *"+fn+"*. Cuando reciba el broche de gema "+g+" en la ceremonia de ingreso, pasará a ser formalmente miembro de "+fn+".",
"La ceremonia de ingreso se celebrará el *"+d+" de "+L.year+", a las "+t+"* en "+pl+". Después se le guiará a su sede de facultad, y "+LOW+". Los compañeros de promoción con quienes compartirá tres años de estudios le esperan allí.",
"Por favor, preséntese en la Academia a la hora indicada. Le deseamos mucha suerte en su futuro."],from:TR(L.from),sent:TR(L.sent),head:TR(L.headTitle),sign:TR(hn)}}''',
}
for k in LETTER: LETTER[k]=LETTER[k].replace('LOW',LOW)
