(function(){
var articles=[];var params=new URLSearchParams(location.search);var slug=params.get("slug")||location.pathname.split("/").filter(Boolean).pop();var a=null;var article=document.getElementById("artigo"),error=document.getElementById("erro-artigo");
function esc(v){return String(v||"").replace(/[&<>"']/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m];});}
function cats(x){var c=Array.isArray(x.categorias)?x.categorias:(x.categoria?[x.categoria]:[]);return c.filter(Boolean);}
function catsLabel(x){return cats(x).join(" · ");}
function cleanText(v){return String(v||"").replace(/\s+/g," ").trim();}
function isMetaLeak(v){return /^(SLUG|RESUMO|CATEGORIA|CATEGORIAS|TAGS|GÊNERO EDITORIAL|AUTOR PÚBLICO|DATA DE PUBLICAÇÃO|DATA DE ATUALIZAÇÃO|IMAGEM DE CAPA|TEXTO ALTERNATIVO|TÍTULO SEO|DESCRIÇÃO SEO|CANONICAL URL|REFERÊNCIAS PÚBLICAS)\s*:?$/i.test(cleanText(v));}
function isJunkSummary(v){var s=cleanText(v);return !s||/^\[?https?:\/\//i.test(s)||/blogger\.googleusercontent/i.test(s)||isMetaLeak(s);}
function fallbackSummary(x){var w=document.createElement("div");w.innerHTML=x.conteudoHTML||"";var ps=[].slice.call(w.querySelectorAll("p")).map(function(p){return cleanText(p.textContent);}).filter(function(t){return t.length>55&&!/^Nota de enquadramento:/i.test(t)&&!/^\[?https?:\/\//i.test(t)&&!/blogger\.googleusercontent/i.test(t);});var s=ps[0]||cleanText(x.titulo);return s.length>230?s.slice(0,227).replace(/\s+\S*$/,"")+"…":s;}
function summary(x){return isJunkSummary(x.resumo)?fallbackSummary(x):cleanText(x.resumo);}
function articleUrl(x){return "./artigo.html?slug="+encodeURIComponent(x.slug);}function canonical(x){return "https://grupoeduardabispo.com.br/blog/artigo/"+x.slug+"/";}
function enhance(root){root.querySelectorAll("[data-geb-component]").forEach(function(sec){var type=sec.dataset.gebComponent;sec.classList.add("geb-component");sec.dataset.type=type;if(type==="cards"){sec.classList.add("cards-component");var nodes=[].slice.call(sec.children),current=null;sec.innerHTML="";nodes.forEach(function(n){if(/^H[2-4]$/.test(n.tagName)){current=document.createElement("div");current.className="mini-card";current.appendChild(n);sec.appendChild(current);}else{if(!current){current=document.createElement("div");current.className="mini-card";sec.appendChild(current);}current.appendChild(n);}});}if(type==="oferta")sec.classList.add("offer-component");if(type==="cta")sec.classList.add("cta-component");if(type==="cta"||type==="oferta"){var label="",url="";[].slice.call(sec.querySelectorAll("p")).forEach(function(p){var t=p.textContent.trim();if(t.indexOf("BOTÃO:")===0){label=t.replace(/^BOTÃO:\s*/,"");p.remove();}if(t.indexOf("LINK:")===0){url=t.replace(/^LINK:\s*/,"");p.remove();}});if(label&&url){var link=document.createElement("a");link.className="component-button";link.href=url;link.textContent=label;link.target="_blank";link.rel="noopener noreferrer";sec.appendChild(link);}}});}
function enhanceLinks(root){
  [].slice.call(root.querySelectorAll("p")).forEach(function(p){
    var a=p.querySelector("a");
    if(!a || p.textContent.trim()!==a.textContent.trim()) return;
    var href=a.getAttribute("href")||"";
    if(!/^https?:\/\//i.test(href)) return;

    var prev=p.previousElementSibling;
    var label="";
    if(prev && prev.tagName==="P"){
      var t=prev.textContent.trim();
      if(t.endsWith(":") && t.length<=90){
        label=t.replace(/:$/,"").trim();
        prev.remove();
      }
    }

    var host="";
    try{host=(new URL(href)).hostname.replace(/^www\./,"");}catch(e){}
    a.className="article-external-link";
    a.textContent=label || (host ? "Acessar "+host : "Acessar link");
    a.setAttribute("aria-label",(label || "Acessar link")+" (abre em nova aba)");
    p.classList.add("article-link-row");
  });
}
function related(){var ac=cats(a).map(function(c){return c.toLowerCase();});var rel=articles.filter(function(x){return x.slug!==a.slug&&(cats(x).some(function(c){return ac.indexOf(c.toLowerCase())!==-1;})||(x.tags||[]).some(function(t){return (a.tags||[]).indexOf(t)!==-1;}));}).slice(0,3);if(!rel.length)return;document.getElementById("relacionados").hidden=false;document.getElementById("lista-relacionados").innerHTML=rel.map(function(x){return '<article class="article-card"><p class="eyebrow">'+esc(catsLabel(x))+'</p><h3><a class="stretched" href="'+articleUrl(x)+'">'+esc(x.titulo)+'</a></h3><p>'+esc(summary(x))+'</p><div class="card-meta">'+esc(x.dataPublicacao)+'</div></article>';}).join("");}
function renderArticle(a){if(!a){error.hidden=false;document.title="Artigo não encontrado — Blog GEB";return;}article.hidden=false;document.getElementById("categoria").innerHTML=cats(a).map(function(c){return '<a class="category-link" href="./?categoria='+encodeURIComponent(c)+'">'+esc(c)+'</a>';}).join('<span aria-hidden="true"> · </span>');document.getElementById("titulo").textContent=a.titulo;var sub=document.getElementById("subtitulo");var subtitle=cleanText(a.subtitulo);if(isMetaLeak(subtitle))subtitle="";sub.textContent=subtitle;sub.hidden=!subtitle;document.getElementById("autor").textContent=a.autorPublico;document.getElementById("data").textContent=a.dataPublicacao;document.getElementById("tags").innerHTML=(a.tags||[]).map(function(t){return '<a class="tag" href="./?tag='+encodeURIComponent(t)+'">'+esc(t)+'</a>';}).join("");var body=document.getElementById("conteudo-artigo");body.innerHTML=a.conteudoHTML||"";
[].slice.call(body.children).forEach(function(el){
  if(el.tagName!=="P") return;
  var t=cleanText(el.textContent);
  if(t===a.titulo || /^Por\s+/i.test(t) || /^\[?https?:\/\//i.test(t) || /blogger\.googleusercontent/i.test(t) || /^\[Trecho\b/i.test(t)){
    el.remove();return;
  }
  if(/^Nota de enquadramento:/i.test(t)) el.classList.add("editorial-note");
  if(/^(\(?E-?book\)?|workshop Ser Coach IBC)$/i.test(t)) el.classList.add("legacy-context");
});
enhance(body);enhanceLinks(body);var refs=a.referenciasPublicas||[];if(typeof refs==="string")refs=refs.split(/\n\s*\n|\n(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ][A-ZÁÉÍÓÚÂÊÔÃÕÇ .;-]{2,}:?)/).map(function(x){return x.trim();}).filter(Boolean);if(refs.length){var refSec=document.getElementById("referencias"),refList=document.getElementById("lista-referencias");refSec.hidden=false;refList.innerHTML=refs.map(function(r){var m=String(r).match(/https?:\/\/\S+/);if(m){var raw=m[0].replace(/[).,;]+$/,"");var before=esc(String(r).replace(m[0],"").trim());return '<p class="reference-item">'+before+' <a href="'+esc(raw)+'" target="_blank" rel="noopener noreferrer">Acessar fonte ↗</a></p>';}return '<p class="reference-item">'+esc(r)+'</p>';}).join("");}
var c=canonical(a);document.title=(a.tituloSEO||a.titulo)+" — Blog GEB";document.querySelector('meta[name="description"]').setAttribute("content",a.descricaoSEO||a.resumo||"");document.getElementById("canonical-link").setAttribute("href",c);document.getElementById("og-title").setAttribute("content",a.titulo);document.getElementById("og-description").setAttribute("content",a.descricaoSEO||a.resumo||"");document.getElementById("og-url").setAttribute("content",c);var ld=document.createElement("script");ld.type="application/ld+json";ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":a.titulo,"description":summary(a),"datePublished":a.dataPublicacao.split("/").reverse().join("-"),"author":{"@type":"Organization","name":a.autorPublico},"publisher":{"@type":"Organization","name":"GEB — Grupo Eduarda Bispo"},"mainEntityOfPage":c});document.head.appendChild(ld);related();
}
window.GEB_BLOG_API.consultar({acao:"artigo",slug:slug}).then(function(r){if(!r.sucesso||!r.dados){error.hidden=false;return;}articles=[r.dados];renderArticle(r.dados);window.GEB_BLOG_API.consultar({acao:"relacionados",slug:slug,limite:"3"}).then(function(rel){if(rel.sucesso&&Array.isArray(rel.dados)){articles=[r.dados].concat(rel.dados);related();}}).catch(function(){});}).catch(function(e){error.hidden=false;console.error("Blog GEB: artigo indisponível",e);});
})();