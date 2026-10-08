(function(){
var articles=[];var params=new URLSearchParams(location.search);
var categoria=params.get("categoria")||"",tag=params.get("tag")||"",q=params.get("q")||"";
var lista=document.getElementById("lista-artigos"),vazio=document.getElementById("estado-vazio"),busca=document.getElementById("busca"),limpar=document.getElementById("limpar-filtros"),titulo=document.getElementById("titulo-lista"),contexto=document.getElementById("contexto-lista");
function esc(v){return String(v||"").replace(/[&<>"']/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m];});}
function norm(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function cats(a){var c=Array.isArray(a.categorias)?a.categorias:(a.categoria?[a.categoria]:[]);return c.filter(Boolean);}
function catsLabel(a){return cats(a).join(" · ");}
function url(a){return "./artigo.html?slug="+encodeURIComponent(a.slug);}
function cleanText(v){return String(v||"").replace(/\s+/g," ").trim();}
function isJunkSummary(v){
  var s=cleanText(v);
  return !s || /^\[?https?:\/\//i.test(s) || /blogger\.googleusercontent/i.test(s) || /^(SLUG|TAGS|CATEGORIA|CATEGORIAS|GÊNERO EDITORIAL|AUTOR PÚBLICO|DATA DE PUBLICAÇÃO)\s*:/i.test(s);
}
function fallbackSummary(a){
  var wrap=document.createElement("div");wrap.innerHTML=a.conteudoHTML||"";
  var ps=[].slice.call(wrap.querySelectorAll("p")).map(function(p){return cleanText(p.textContent);}).filter(function(t){
    return t.length>55 && !/^Nota de enquadramento:/i.test(t) && !/^\[?https?:\/\//i.test(t) && !/blogger\.googleusercontent/i.test(t);
  });
  var s=ps[0]||cleanText(a.titulo);
  return s.length>230?s.slice(0,227).replace(/\s+\S*$/,"")+"…":s;
}
function summary(a){return isJunkSummary(a.resumo)?fallbackSummary(a):cleanText(a.resumo);}
function card(a){return '<article class="article-card"><p class="eyebrow">'+esc(catsLabel(a))+'</p><h3><a class="stretched" href="'+url(a)+'">'+esc(a.titulo)+'</a></h3><p>'+esc(summary(a))+'</p><div class="tag-list">'+(a.tags||[]).slice(0,3).map(function(t){return '<a class="tag" href="./?tag='+encodeURIComponent(t)+'">'+esc(t)+'</a>';}).join("")+'</div><div class="card-meta">'+esc(a.autorPublico)+' · '+esc(a.dataPublicacao)+'</div></article>';}
function render(){var nq=norm(q);var out=articles.filter(function(a){if(categoria&&!cats(a).some(function(c){return norm(c)===norm(categoria);}))return false;if(tag&&!(a.tags||[]).some(function(t){return norm(t)===norm(tag);}))return false;if(nq){var hay=norm([a.titulo,summary(a),catsLabel(a),(a.tags||[]).join(" ")].join(" "));if(hay.indexOf(nq)===-1)return false;}return true;});lista.innerHTML=out.map(card).join("");vazio.hidden=out.length>0;limpar.hidden=!(categoria||tag||q);if(categoria){contexto.textContent="Categoria";titulo.textContent=categoria;}else if(tag){contexto.textContent="Tag";titulo.textContent=tag;}else if(q){contexto.textContent="Busca";titulo.textContent='Resultados para “'+q+'”';}else{contexto.textContent="Últimos conteúdos";titulo.textContent="Conteúdos recentes";}}
document.getElementById("btn-buscar").addEventListener("click",function(){q=busca.value.trim();categoria="";tag="";history.replaceState(null,"","./"+(q?"?q="+encodeURIComponent(q):""));render();});
busca.addEventListener("keydown",function(e){if(e.key==="Enter")document.getElementById("btn-buscar").click();});
limpar.addEventListener("click",function(){categoria=tag=q="";busca.value="";history.replaceState(null,"","./");render();});
render();
window.GEB_BLOG_API.consultar({acao:"artigos",limite:"50"}).then(function(r){if(!r.sucesso||!Array.isArray(r.dados))throw new Error("API sem lista autorizada");articles=r.dados;render();}).catch(function(e){articles=[];render();vazio.hidden=false;vazio.innerHTML="<h3>Conteúdos temporariamente indisponíveis</h3><p>Não foi possível consultar a API editorial. A implantação pode exigir autenticação Google ou bloquear requisições de outro domínio. Nenhum artigo de teste será exibido.</p>";console.error("Blog GEB: falha na API",e);});
})();