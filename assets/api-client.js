/* Leitura exclusivamente pela API editorial v2.1; sem dados simulados. */
(function(){
  "use strict";
  var BASE="./api.php";
  window.GEB_BLOG_API={
    endpoint:BASE,
    async consultar(params){
      params=params||{};
      var u=new URL(BASE,document.baseURI);
      Object.keys(params).forEach(function(k){u.searchParams.set(k,params[k]);});
      try{
        var resp=await fetch(u.toString(),{method:"GET",credentials:"same-origin",redirect:"follow"});
        if(!resp.ok)throw new Error("API HTTP "+resp.status);
        var dados=await resp.json();
        if(!dados||dados.sucesso!==true)throw new Error("API: "+(dados&&dados.erro&&dados.erro.codigo||"resposta inválida"));
        return dados;
      }catch(err){
        // Recuperação de contingência: apenas os 3 artigos já publicados.
        // O arquivo legado de referência não é fonte para publicar outros rascunhos.
        var ids=[
          "processo-seletivo-saude-trindade-acs-ace",
          "geb-educacao-trindade-oportunidades-formacao",
          "o-tempo-nao-espera-futuro-dos-nossos-filhos"
        ];
        var fonte=Array.isArray(window.GEB_TEST_ARTICLES)?window.GEB_TEST_ARTICLES:[];
        var acervo=fonte.filter(function(a){return a&&ids.includes(a.slug);});
        if(acervo.length!==3)throw err;
        var acao=String(params.acao||"artigos");
        var dados;
        if(acao==="artigo"){
          dados=acervo.find(function(a){return a.slug===params.slug;})||null;
          if(!dados)return {sucesso:false,dados:null,erro:{codigo:"ARTIGO_NAO_DISPONIVEL"}};
        }else if(acao==="relacionados"){
          dados=acervo.filter(function(a){return a.slug!==params.slug;}).slice(0,3);
        }else if(acao==="artigos"||acao==="destaques"){
          dados=acervo.slice().sort(function(a,b){
            function chave(x){var d=String(x.dataPublicacao||"").split("/");return d.length===3?d[2]+d[1].padStart(2,"0")+d[0].padStart(2,"0"):"";}
            return chave(b).localeCompare(chave(a))||String(a.titulo||"").localeCompare(String(b.titulo||""),"pt-BR");
          });
        }else{throw err;}
        console.warn("Blog GEB: API indisponível; usando somente arquivo dos três artigos previamente publicados.",err);
        return {sucesso:true,dados:dados,meta:{origem:"recuperacao-artigos-publicados"},erro:null};
      }
    }
  };
})();
