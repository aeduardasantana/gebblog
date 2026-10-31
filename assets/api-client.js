/* Blog GEB — publicacao estatica por editoria; Google Drive e Apps Script nao sao consultados. */
(function(){
"use strict";
const ROOT=new URL("./conteudo/",document.baseURI);
const SHARDS=["indices/legado.json","indices/lote-01.json","indices/lote-02.json","indices/lote-03.json","indices/lote-04.json","indices/lote-05.json","indices/lote-06.json","indices/lote-07.json","indices/lote-08.json","indices/lote-09.json","indices/lote-10.json","indices/lote-11.json","indices/lote-12.json","indices/lote-13.json","indices/lote-14.json","indices/lote-15.json","indices/lote-16.json","indices/lote-17.json"];
let promise=null;
function norm(x){return String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function date(x){const v=String(x.dataPublicacaoISO||"");if(/^\d{4}-\d\d-\d\d$/.test(v))return v;const m=String(x.dataPublicacao||"").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);return m?m[3]+"-"+m[2].padStart(2,"0")+"-"+m[1].padStart(2,"0"):"0000-00-00";}
function sort(a){return a.sort((x,y)=>date(y).localeCompare(date(x))||String(x.titulo||"").localeCompare(String(y.titulo||""),"pt-BR"));}
function fallback(){return (Array.isArray(window.GEB_PUBLICADOS)?window.GEB_PUBLICADOS:[]).filter(x=>x&&x.status==="Publicado");}
async function catalog(){
  if(!promise)promise=(async()=>{
    /* Fonte única e atômica: jamais exibir contagem parcial por falha de um lote. */
    const response=await fetch(new URL("indices/manifesto-completo.json",ROOT),{cache:"no-store"});
    if(!response.ok)throw new Error("Catálogo integral indisponível (HTTP "+response.status+")");
    const articles=await response.json();
    if(!Array.isArray(articles)||!articles.length)throw new Error("Catálogo integral vazio ou inválido");
    const valid=articles.filter(a=>a&&a.slug&&a.arquivo&&a.status==="Publicado");
    if(valid.length!==articles.length||new Set(valid.map(a=>a.slug)).size!==valid.length)
      throw new Error("Catálogo integral inconsistente; não exibir acervo parcial");
    return sort(valid);
  })().catch(error=>{promise=null;throw error;});
  return promise;
}
async function full(meta){
  if(!meta) return null;
  if(meta.conteudoHTML)return meta;
  if(!meta.arquivo)return null;
  const p=new URL(meta.arquivo,ROOT);
  if(p.origin!==location.origin||!p.pathname.startsWith(ROOT.pathname))throw new Error("Arquivo de artigo fora do acervo");
  const r=await fetch(p,{cache:"no-cache"});
  if(!r.ok)throw new Error("Artigo "+meta.slug+": HTTP "+r.status);
  const a=await r.json();
  if(a.slug!==meta.slug||a.status!=="Publicado")throw new Error("Artigo nao corresponde ao indice: "+meta.slug);
  return a;
}
window.GEB_BLOG_API={
 endpoint:ROOT.href,
 async consultar(p){
   p=p||{};
   const acao=String(p.acao||"artigos"),all=await catalog();
   let dados;
   if(acao==="artigo"){
     const meta=all.find(a=>a.slug===p.slug);
     if(!meta)return {sucesso:false,dados:null,erro:{codigo:"ARTIGO_NAO_DISPONIVEL"}};
     dados=await full(meta);
   }else if(acao==="relacionados"){
     const cur=all.find(a=>a.slug===p.slug);
     dados=all.filter(a=>a.slug!==p.slug);
     if(cur)dados.sort((a,b)=>Number(b.categoria===cur.categoria)-Number(a.categoria===cur.categoria));
     dados=dados.slice(0,Math.max(0,Number(p.limite)||3));
   }else if(acao==="artigos"||acao==="destaques"){
     dados=all.filter(a=>!p.categoria||[a.categoria,...(Array.isArray(a.categorias)?a.categorias:[])].some(c=>{const label=norm(c)==="eduarda"?"desenvolvimento":norm(c);return label===(norm(p.categoria)==="eduarda"?"desenvolvimento":norm(p.categoria));}));
     if(p.tag)dados=dados.filter(a=>(a.tags||[]).some(t=>norm(t)===norm(p.tag)));
     if(p.q)dados=dados.filter(a=>norm([a.titulo,a.resumo,(a.tags||[]).join(" ")].join(" ")).includes(norm(p.q)));
     if(p.limite)dados=dados.slice(0,Math.max(0,Number(p.limite)||50));
   }else return {sucesso:false,dados:null,erro:{codigo:"ACAO_INVALIDA"}};
   return {sucesso:true,dados,meta:{origem:"github-arquivos-individuais",total:all.length},erro:null};
 }
};
})();
