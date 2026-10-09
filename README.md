# Blog GEB — Front-end v2

## URL canônica oficial
https://blog.grupoeduardabispo.com.br/

## URL anterior (não canônica)
https://grupoeduardabispo.com.br/blog/

O caminho anterior deve redirecionar permanentemente para o subdomínio oficial, sem manter uma segunda versão indexável dos artigos. A criação do redirecionamento depende da configuração da hospedagem.

## Estado atual
- Front-end em ambiente de teste.
- Sem implantação pública.
- API Apps Script v2 validada, mas ainda sem implantação.
- Os dados em `assets/test-data.js` são fixtures de teste para validar interface e componentes antes da integração pública com a API.

## Estrutura
- `index.html`: página inicial, categorias, tags e busca.
- `artigo.html`: artigo individual, relacionados, SEO e componentes editoriais.
- `assets/styles.css`: padrão visual responsivo.
- `assets/app.js`: listagem, busca e filtros.
- `assets/article.js`: artigo, componentes, relacionados, canonical, Open Graph e JSON-LD.
- `assets/test-data.js`: espelho de homologação sincronizado com os três Google Docs legados + o artigo v2 real de teste, sem inferir gênero editorial nos legados.
- `.htaccess`: rotas amigáveis para Locaweb/Apache.
- `404.html`: estado de página não encontrada.

## Rotas canônicas planejadas (subdomínio oficial)
- `/`
- `/artigo/{slug}/`
- `/categoria/{categoria}/`
- `/tag/{tag}/`

No ambiente de teste, `artigo.html?slug=...` funciona diretamente.

## Componentes editoriais
Os componentes presentes nos Docs reais são renderizados a partir do conteúdo sincronizado. A massa sintética usada anteriormente foi removida do artigo v2 para não misturar artigo real com conteúdo técnico de teste.

Componentes previstos pelo renderer:
- DESTAQUE
- REFLEXAO
- CARDS
- OFERTA
- CTA
- AVISO
- FONTE
- ASSINATURA

## Próximo passo técnico
No Bloco 7, após implantação homologada da API, substituir a fonte de fixtures pelo endpoint público e disponibilizar a pasta de produção `/public_html/blog/` pelo endereço `https://blog.grupoeduardabispo.com.br/`. A pasta FTP não determina, por si só, a URL pública: o subdomínio deve apontar para o diretório correto na hospedagem.

A URL anterior `https://grupoeduardabispo.com.br/blog/` deverá redirecionar para o subdomínio oficial.

Não criar implantação pública durante o Bloco 4.


## Regra de fidelidade documental
Os artigos usados em homologação devem reproduzir o conteúdo dos Google Docs de origem. Não resumir, reescrever nem preencher metadados editoriais ausentes apenas para facilitar o teste do front-end.

Para artigos legados, `generoEditorial` permanece vazio até migração formal para o Schema Editorial v2.
