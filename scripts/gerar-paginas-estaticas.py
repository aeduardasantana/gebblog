#!/usr/bin/env python3
"""Generate crawlable static HTML for all published Blog GEB articles."""
import json, pathlib, html, re, urllib.parse
ROOT=pathlib.Path(__file__).resolve().parent.parent
BASE="https://blog.grupoeduardabispo.com.br"
manifest=json.loads((ROOT/"conteudo/indices/manifesto-completo.json").read_text(encoding="utf-8"))
template=(ROOT/"artigo.html").read_text(encoding="utf-8")
def esc(x): return html.escape(str(x or ""),quote=True)
def clean(x): return re.sub(r"<[^>]+>"," ",str(x or "")).strip()
count=0
for item in manifest:
    slug=item["slug"]
    if not re.fullmatch(r"[a-zA-Z0-9_-]+",slug): raise ValueError("Invalid slug: "+slug)
    source=(ROOT/"conteudo"/item["arquivo"].removeprefix("./")).resolve()
    if not source.is_relative_to((ROOT/"conteudo").resolve()): raise ValueError("Unsafe path")
    data=json.loads(source.read_text(encoding="utf-8"))
    if data.get("slug")!=slug or data.get("status")!="Publicado": raise ValueError("Article mismatch: "+slug)
    url=BASE+"/artigo/"+urllib.parse.quote(slug)+"/"
    title=esc(data.get("tituloSEO") or data.get("titulo") or "Blog GEB")
    description=esc(data.get("descricaoSEO") or data.get("resumo") or "")
    category=esc(data.get("categoria") or "")
    content=data.get("conteudoHTML") or ""
    if not content.strip(): raise ValueError("Empty article: "+slug)
    output=template
    output=re.sub(r"<title>.*?</title>","<title>"+title+" | Blog GEB</title>",output,count=1,flags=re.S)
    output=re.sub(r'<meta name="description" content="[^"]*">','<meta name="description" content="'+description+'">',output,count=1)
    output=re.sub(r'<link id="canonical-link" rel="canonical" href="[^"]*">','<link id="canonical-link" rel="canonical" href="'+url+'">',output,count=1)
    output=output.replace('<meta id="og-title" property="og:title" content="Blog GEB">','<meta id="og-title" property="og:title" content="'+title+'">')
    output=output.replace('<meta id="og-description" property="og:description" content="">','<meta id="og-description" property="og:description" content="'+description+'">')
    output=output.replace('<meta id="og-url" property="og:url" content="">','<meta id="og-url" property="og:url" content="'+url+'">')
    output=output.replace('<article id="artigo" class="article-shell" hidden>','<article id="artigo" class="article-shell">')
    output=output.replace('<p id="categoria" class="eyebrow"></p>','<p id="categoria" class="eyebrow">'+category+'</p>')
    output=output.replace('<h1 id="titulo"></h1>','<h1 id="titulo">'+esc(data.get("titulo"))+'</h1>')
    output=output.replace('<p id="subtitulo" class="article-subtitle"></p>','<p id="subtitulo" class="article-subtitle">'+esc(data.get("subtitulo"))+'</p>')
    output=output.replace('<span id="autor"></span>','<span id="autor">'+esc(data.get("autorPublico") or "Blog GEB")+'</span>')
    output=output.replace('<time id="data"></time>','<time id="data" datetime="'+esc(data.get("dataPublicacaoISO"))+'">'+esc(data.get("dataPublicacao"))+'</time>')
    output=output.replace('<div id="conteudo-artigo" class="article-body container narrow"></div>','<div id="conteudo-artigo" class="article-body container narrow">'+content+'</div>')
    output=output.replace('<script src="./assets/api-client.js?v=20261025lote10correcao23"></script>','<script src="./assets/api-client.js?v=20261029manifesto214"></script>')
    output=output.replace('<script src="./assets/article.js?v=20261025refs-unicas"></script>','<script src="./assets/article.js?v=20261029static"></script>')
    output=output.replace('</head>','<script type="application/ld+json">'+json.dumps({"@context":"https://schema.org","@type":"Article","headline":data.get("titulo"),"description":data.get("descricaoSEO") or data.get("resumo"),"datePublished":data.get("dataPublicacaoISO"),"mainEntityOfPage":url,"inLanguage":"pt-BR"},ensure_ascii=False).replace("</","<\\/")+'</script></head>',1)
    dest=ROOT/"artigo"/slug/"index.html"
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(output,encoding="utf-8")
    count+=1
print("Generated crawlable article HTML pages:",count)
