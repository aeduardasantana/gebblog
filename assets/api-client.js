/* Blog GEB: catálogo publicado no GitHub e entregue pela Locaweb. Sem dependência de Apps Script. */
(function(){
  "use strict";
  function normalizar(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
  function iso(a){var v=a.dataPublicacaoISO||"",m=String(a.dataPublicacao||"").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:m?m[3]+"-"+m[2].padStart(2,"0")+"-"+m[1].padStart(2,"0"):"";}
  function catalogo(){return (Array.isArray(window.GEB_PUBLICADOS)?window.GEB_PUBLICADOS:[]).filter(function(a){return a&&a.status==="Publicado"&&a.slug&&a.titulo&&a.conteudoHTML;}).slice().sort(function(a,b){return iso(b).localeCompare(iso(a))||a.titulo.localeCompare(b.titulo,"pt-BR");});}
  window.GEB_BLOG_API={
    endpoint:"./conteudo/publicados/catalogo.js",
    async consultar(p){
      p=p||{};var a=String(p.acao||"artigos"),list=catalogo(),dados;
      if(a==="artigo"){dados=list.find(function(x){return x.slug===p.slug;})||null;if(!dados)return {sucesso:false,dados:null,erro:{codigo:"ARTIGO_NAO_DISPONIVEL"}};}
      else if(a==="relacionados"){var current=list.find(function(x){return x.slug===p.slug;});dados=list.filter(function(x){return x.slug!==p.slug;}).sort(function(x,y){return Number(y.categoria===current?.categoria)-Number(x.categoria===current?.categoria);}).slice(0,Math.max(0,Number(p.limite)||3));}
      else if(a==="artigos"||a==="destaques"){
        dados=list.filter(function(x){return !p.categoria||normalizar(x.categoria)===normalizar(p.categoria);});
        if(p.tag)dados=dados.filter(function(x){return (x.tags||[]).some(function(t){return normalizar(t)===normalizar(p.tag);});});
        if(p.q)dados=dados.filter(function(x){return normalizar([x.titulo,x.resumo,(x.tags||[]).join(" ")].join(" ")).includes(normalizar(p.q));});
        if(p.limite)dados=dados.slice(0,Math.max(0,Number(p.limite)||50));
      }else return {sucesso:false,dados:null,erro:{codigo:"ACAO_INVALIDA"}};
      return {sucesso:true,dados:dados,meta:{origem:"github-estatico",total:catalogo().length},erro:null};
    }
  };
})();
