#!/usr/bin/env python3
"""index.html + data.js + verses.js -> 단일 파일 qoheleth-31days.html (다운로드/오프라인용)"""
import re
h=open('index.html',encoding='utf8').read()
for f in ('data.js','verses.js'):
    js=open(f,encoding='utf8').read()
    h=h.replace(f'<script src="{f}"></script>','<script>\n'+js+'</script>')
open('qoheleth-31days.html','w',encoding='utf8').write(h)
print('built',len(h),'bytes')
