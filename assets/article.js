(function(){
window.addEventListener("message",function(e){var frame=document.querySelector("#conteudo-artigo .inline-experience iframe");if(frame&&e.source===frame.contentWindow&&e.data&&Number.isFinite(e.data.gebFrameHeight)){frame.style.height=Math.max(220,Math.min(1800,e.data.gebFrameHeight))+"px";}});
var articles=[];var params=new URLSearchParams(location.search);var slug=params.get("slug")||location.pathname.split("/").filter(Boolean).pop().replace(/\.html$/,"");var a=null;var article=document.getElementById("artigo"),error=document.getElementById("erro-artigo");
function esc(v){return String(v||"").replace(/[&<>"']/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m];});}
function cats(x){var c=Array.isArray(x.categorias)?x.categorias:(x.categoria?[x.categoria]:[]);return c.filter(Boolean).map(function(y){return String(y).trim().toLowerCase()==="eduarda"?"Desenvolvimento":y;});}
function catsLabel(x){return cats(x).join(" · ");}
function cleanText(v){return String(v||"").replace(/\s+/g," ").trim();}
function isMetaLeak(v){return /^(SLUG|RESUMO|CATEGORIA|CATEGORIAS|TAGS|GÊNERO EDITORIAL|AUTOR PÚBLICO|DATA DE PUBLICAÇÃO|DATA DE ATUALIZAÇÃO|IMAGEM DE CAPA|TEXTO ALTERNATIVO|TÍTULO SEO|DESCRIÇÃO SEO|CANONICAL URL|REFERÊNCIAS PÚBLICAS)\s*:?$/i.test(cleanText(v));}
function isJunkSummary(v){var s=cleanText(v);return !s||/^\[?https?:\/\//i.test(s)||/blogger\.googleusercontent/i.test(s)||isMetaLeak(s);}
function fallbackSummary(x){var w=document.createElement("div");w.innerHTML=x.conteudoHTML||"";var ps=[].slice.call(w.querySelectorAll("p")).map(function(p){return cleanText(p.textContent);}).filter(function(t){return t.length>55&&!/^Nota de enquadramento:/i.test(t)&&!/^\[?https?:\/\//i.test(t)&&!/blogger\.googleusercontent/i.test(t);});var s=ps[0]||cleanText(x.titulo);return s.length>230?s.slice(0,227).replace(/\s+\S*$/,"")+"…":s;}
function summary(x){return isJunkSummary(x.resumo)?fallbackSummary(x):cleanText(x.resumo);}
function articleUrl(x){return "./artigo/"+encodeURIComponent(x.slug)+"/";}function canonical(x){return "https://blog.grupoeduardabispo.com.br/artigo/"+x.slug+"/";}

function normalizeEditorialComponents(root){
  var known={DESTAQUE:"destaque",REFLEXAO:"reflexao",AVISO:"aviso",FONTE:"fonte",CTA:"cta",OFERTA:"oferta",CARDS:"cards",ASSINATURA:"assinatura"};
  var nodes=[].slice.call(root.children),active=null;
  nodes.forEach(function(node){
    if(node.tagName!=="P"){if(active)active.appendChild(node);return;}
    var raw=node.textContent||"",open=raw.match(/^\s*\[(DESTAQUE|REFLEXAO|AVISO|FONTE|CTA|OFERTA|CARDS|ASSINATURA)\]\s*/i);
    var close=raw.match(/\s*\[\/(DESTAQUE|REFLEXAO|AVISO|FONTE|CTA|OFERTA|CARDS|ASSINATURA)\]\s*$/i);
    if(open&&known[open[1].toUpperCase()]){
      if(active){active=null;}
      active=document.createElement("section");active.dataset.gebComponent=known[open[1].toUpperCase()];
      root.insertBefore(active,node);
    }
    if(open||close){
      var clean=raw;
      if(open)clean=clean.slice(open[0].length);
      if(close)clean=clean.slice(0,clean.length-close[0].length);
      if(clean.trim()){node.textContent=clean; if(active)active.appendChild(node);}
      else node.remove();
      if(close)active=null;
    }else if(active)active.appendChild(node);
  });
}
function linkEditorialServices(root){
  var sites={
    "GEB Empresarial":"https://gebempresarial.grupoeduardabispo.com.br/",
    "GEB Educação":"https://gebeducacao.grupoeduardabispo.com.br/",
    "GEB Saúde":"https://gebsaude.grupoeduardabispo.com.br/",
    "GEB Inclusão":"https://gebinclusao.grupoeduardabispo.com.br/",
    "GEB Tecnologia":"https://gebtecnologia.grupoeduardabispo.com.br/",
    "EJA Mais Brasil":"https://ejamaisbrasil.com.br/consultor/geb",
    "Bolsa Mais Brasil":"https://bolsamaisbrasil.com.br/geb/bolsas/",
    "Grupo Eduarda Bispo":"https://grupoeduardabispo.com.br/"
  };
  var used={};var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[],node;
  while(node=walker.nextNode())nodes.push(node);
  nodes.forEach(function(n){
    if(n.parentElement.closest("a,script,style"))return;
    var text=n.nodeValue,keys=Object.keys(sites).filter(function(k){return !used[k]&&text.indexOf(k)>=0;});
    if(!keys.length)return;
    keys.sort(function(a,b){return text.indexOf(a)-text.indexOf(b);});
    var key=keys[0],at=text.indexOf(key);if(at<0)return;
    var a=document.createElement("a");a.href=sites[key];a.textContent=key;
    a.className="editorial-service-link";var after=n.splitText(at);after.nodeValue=after.nodeValue.slice(key.length);n.parentNode.insertBefore(a,after);used[key]=true;
  });
}

var REGIONAL_NR1_PAGES=[["Acre","Rio Branco","acre"],["Alagoas","Maceió","alagoas"],["Amapá","Macapá","amapa"],["Amazonas","Manaus","amazonas"],["Bahia","Salvador","bahia"],["Ceará","Fortaleza","ceara"],["Distrito Federal","Brasília","distrito-federal"],["Espírito Santo","Vitória","espirito-santo"],["Goiás","Goiânia","goias"],["Maranhão","São Luís","maranhao"],["Mato Grosso","Cuiabá","mato-grosso"],["Mato Grosso do Sul","Campo Grande","mato-grosso-do-sul"],["Minas Gerais","Belo Horizonte","minas-gerais"],["Pará","Belém","para"],["Paraíba","João Pessoa","paraiba"],["Paraná","Curitiba","parana"],["Pernambuco","Recife","pernambuco"],["Piauí","Teresina","piaui"],["Rio de Janeiro","Rio de Janeiro","rio-de-janeiro"],["Rio Grande do Norte","Natal","rio-grande-do-norte"],["Rio Grande do Sul","Porto Alegre","rio-grande-do-sul"],["Rondônia","Porto Velho","rondonia"],["Roraima","Boa Vista","roraima"],["Santa Catarina","Florianópolis","santa-catarina"],["São Paulo","São Paulo","sao-paulo"],["Sergipe","Aracaju","sergipe"],["Tocantins","Palmas","tocantins"]];

function linkRegionalNR1(root,articleSlug){
  if(!/^nr-1-na-regiao-(norte|nordeste|centro-oeste|sudeste|sul)(?:-|$)/i.test(String(articleSlug||"")))return;
  var regions={
    norte:["acre","amapa","amazonas","para","rondonia","roraima","tocantins"],
    nordeste:["alagoas","bahia","ceara","maranhao","paraiba","pernambuco","piaui","rio-grande-do-norte","sergipe"],
    "centro-oeste":["distrito-federal","goias","mato-grosso","mato-grosso-do-sul"],
    sudeste:["espirito-santo","minas-gerais","rio-de-janeiro","sao-paulo"],
    sul:["parana","rio-grande-do-sul","santa-catarina"]
  };
  var region=String(articleSlug).match(/^nr-1-na-regiao-(centro-oeste|nordeste|sudeste|norte|sul)(?:-|$)/i)[1].toLowerCase();
  var keys=[],seen={};
  REGIONAL_NR1_PAGES.forEach(function(r){
    if(regions[region].indexOf(r[2])<0)return;
    [r[0],r[1]].forEach(function(label){
      if(!seen[label]){keys.push({label:label,slug:r[2]});seen[label]=true;}
    });
  });
  keys.sort(function(a,b){return b.label.length-a.label.length;});
  var escaped=keys.map(function(k){return k.label.replace(/[.*+?^$()|[\]{}\\]/g,"\\$&");});
  var pattern=new RegExp("(^|[^\\p{L}])("+escaped.join("|")+")(?![\\p{L}])","giu");
  var lookup={};keys.forEach(function(k){lookup[k.label.toLocaleLowerCase("pt-BR")]=k.slug;});
  var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[],node;
  while(node=walker.nextNode())if(node.parentElement&&!node.parentElement.closest("a,script,style,button,textarea"))nodes.push(node);
  nodes.forEach(function(n){
    var value=n.nodeValue||"";pattern.lastIndex=0;
    if(!pattern.test(value))return;
    pattern.lastIndex=0;
    var frag=document.createDocumentFragment(),at=0,m;
    while((m=pattern.exec(value))){
      var start=m.index+m[1].length;
      if(start>at)frag.appendChild(document.createTextNode(value.slice(at,start)));
      var a=document.createElement("a");
      a.href="https://gebempresarial.grupoeduardabispo.com.br/nr-1/"+lookup[m[2].toLocaleLowerCase("pt-BR")]+"/";
      a.className="editorial-service-link regional-nr1-link";
      a.textContent=m[2];a.title="NR-1 em "+m[2]+" | GEB Empresarial";
      frag.appendChild(a);at=start+m[2].length;
    }
    if(at<value.length)frag.appendChild(document.createTextNode(value.slice(at)));
    n.parentNode.replaceChild(frag,n);
  });
}

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
function renderArticle(a){if(!a){article.hidden=true;error.hidden=false;document.title="Artigo não encontrado — Blog GEB";return;}error.hidden=true;article.hidden=false;var editoria=cats(a)[0]||"Institucional";document.body.dataset.editoria=editoria;document.getElementById("categoria").innerHTML=cats(a).map(function(c){return '<a class="category-link" href="./?categoria='+encodeURIComponent(c)+'">'+esc(c)+'</a>';}).join('<span aria-hidden="true"> · </span>');document.getElementById("titulo").textContent=a.titulo;var sub=document.getElementById("subtitulo");var subtitle=cleanText(a.subtitulo);if(isMetaLeak(subtitle))subtitle="";sub.textContent=subtitle;sub.hidden=!subtitle;document.getElementById("autor").textContent=a.autorPublico;document.getElementById("data").textContent=a.dataPublicacao;document.getElementById("tags").innerHTML=(a.tags||[]).map(function(t){return '<a class="tag" href="./?tag='+encodeURIComponent(t)+'">'+esc(t)+'</a>';}).join("");var body=document.getElementById("conteudo-artigo");body.innerHTML=a.conteudoHTML||"";
[].slice.call(body.children).forEach(function(el){
  if(el.tagName!=="P") return;
  var t=cleanText(el.textContent);
  if(t===a.titulo || /^Por\s+/i.test(t) || /^\[?https?:\/\//i.test(t) || /blogger\.googleusercontent/i.test(t) || /^\[Trecho\b/i.test(t)){
    el.remove();return;
  }
  if(/^Nota de enquadramento:/i.test(t)) el.classList.add("editorial-note");
  if(/^(\(?E-?book\)?|workshop Ser Coach IBC)$/i.test(t)) el.classList.add("legacy-context");
});
normalizeEditorialComponents(body);enhance(body);linkEditorialServices(body);linkRegionalNR1(body,a.slug);enhanceLinks(body);var refs=a.referenciasPublicas||[];if(typeof refs==="string")refs=refs.split(/\n\s*\n|\n(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ][A-ZÁÉÍÓÚÂÊÔÃÕÇ .;-]{2,}:?)/).map(function(x){return x.trim();}).filter(Boolean);if(refs.length){
  // Evita duas secoes de fontes quando a conversao preservou referencias no HTML
  // e o artigo tambem possui referenciasPublicas estruturadas.
  [].slice.call(body.querySelectorAll("h2,h3,h4")).forEach(function(h){
    var name=cleanText(h.textContent).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s*[:.]\s*$/,"");
    if(!/^(fontes e referencias|referencias bibliograficas|referencias|fontes consultadas)$/.test(name))return;
    var next=h.nextElementSibling;
    if(!next || !/^(UL|OL)$/.test(next.tagName))return;
    // O bloco completo do fim do artigo e gerado na area propria abaixo.
    next.remove();h.remove();
  });
  var refSec=document.getElementById("referencias"),refList=document.getElementById("lista-referencias");refSec.hidden=false;refList.innerHTML=refs.map(function(r){var m=String(r).match(/https?:\/\/\S+/);if(m){var raw=m[0].replace(/[).,;]+$/,"");var before=esc(String(r).replace(m[0],"").trim());return '<p class="reference-item">'+before+' <a href="'+esc(raw)+'" target="_blank" rel="noopener noreferrer">Acessar fonte ↗</a></p>';}return '<p class="reference-item">'+esc(r)+'</p>';}).join("");}
var more=document.getElementById("mais-editoria");
if(more){more.href="./?categoria="+encodeURIComponent(editoria);more.firstChild.textContent="Mais em "+editoria+" ";}
var share=document.getElementById("compartilhar-artigo");
if(share&&!share.dataset.wired){share.dataset.wired="1";share.setAttribute("aria-label","Compartilhar artigo pelo WhatsApp");share.addEventListener("click",function(){
  var link=canonical(a),msg=document.getElementById("feedback-compartilhamento");
  var texto=[cleanText(a.titulo),summary(a),link].filter(Boolean).join("\n\n");
  var whatsapp="https://api.whatsapp.com/send?text="+encodeURIComponent(texto);
  var popup=window.open(whatsapp,"_blank","noopener,noreferrer");
  if(!popup)window.location.href=whatsapp;
  if(msg){msg.hidden=false;msg.textContent="Abrindo o WhatsApp com título, resumo e link do artigo.";}
});}
var c=canonical(a);document.title=(a.tituloSEO||a.titulo)+" — Blog GEB";document.querySelector('meta[name="description"]').setAttribute("content",a.descricaoSEO||a.resumo||"");document.getElementById("canonical-link").setAttribute("href",c);document.getElementById("og-title").setAttribute("content",a.titulo);document.getElementById("og-description").setAttribute("content",a.descricaoSEO||a.resumo||"");document.getElementById("og-url").setAttribute("content",c);var ld=document.createElement("script");ld.type="application/ld+json";ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":a.titulo,"description":summary(a),"datePublished":a.dataPublicacao.split("/").reverse().join("-"),"author":{"@type":"Organization","name":a.autorPublico},"publisher":{"@type":"Organization","name":"GEB — Grupo Eduarda Bispo"},"mainEntityOfPage":c});document.head.appendChild(ld);related();
}
window.GEB_BLOG_API.consultar({acao:"artigo",slug:slug}).then(function(r){if(!r.sucesso||!r.dados){error.hidden=false;return;}articles=[r.dados];renderArticle(r.dados);if(error){error.hidden=true;error.style.display="none";error.remove();}window.GEB_BLOG_API.consultar({acao:"relacionados",slug:slug,limite:"3"}).then(function(rel){if(rel.sucesso&&Array.isArray(rel.dados)){articles=[r.dados].concat(rel.dados);related();}}).catch(function(){});}).catch(function(e){if(article&&article.hidden){error.hidden=false;error.style.display="block";}console.error("Blog GEB: artigo indisponível",e);});
})();