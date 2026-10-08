/* Leitura exclusivamente pela API editorial v2.1; sem dados simulados. */
(function(){
  "use strict";
  var BASE="./api.php";
  window.GEB_BLOG_API={
    endpoint:BASE,
    async consultar(params){
      var u=new URL(BASE);
      Object.keys(params||{}).forEach(function(k){u.searchParams.set(k,params[k]);});
      var resp=await fetch(u.toString(),{method:"GET",mode:"cors",credentials:"omit",redirect:"follow"});
      if(!resp.ok)throw new Error("API HTTP "+resp.status);
      var dados=await resp.json();
      if(!dados||typeof dados.sucesso!=="boolean")throw new Error("Resposta inválida da API.");
      return dados;
    }
  };
})();
