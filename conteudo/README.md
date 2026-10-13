# Acervo editorial público — Blog GEB

Fonte de produção: **GitHub**, publicado na **Locaweb** por GitHub Actions.
Originais e cópias de segurança: **Google Drive**; não executar Apps Script para publicação deste acervo.

## Organização
- `conteudo/<editoria>/<slug>.json`: um arquivo por artigo, conteúdo completo.
- Editorias: `empresarial`, `educacao`, `saude`, `inclusao`, `tecnologia`, `institucional`, `eduarda` e `fe`.
- `conteudo/indices/*.json`: índices leves usados pelo site para lista, busca e categorias.
- `conteudo/publicados/catalogo.js`: cópia de contingência dos 11 artigos publicados anteriormente à migração.
- `assets/api-client.js`: carrega índices e o arquivo individual do artigo, sem API Apps Script.
- `api.php`: legado inativo na navegação atual; retirar somente após verificar toda a operação.

## Origem
31 artigos do arquivo legado histórico (incluindo três presentes no controle) e 64 novos documentos do Controle Editorial Interno: **95 slugs únicos**, publicados por autorização da direção em 13/10/2026.

## Atualização
Para inserir, editar ou excluir conteúdo publicado, alterar o JSON individual e atualizar seu registro no índice da editoria correspondente. O deploy de `conteudo/**` ocorre automaticamente quando GitHub Actions e FTP Locaweb estiverem operacionais.

## Segurança
Não versionar dados privados, rascunhos ou documentos de auditoria internos. A autorização de publicação não substitui revisão técnica quando exigível.
