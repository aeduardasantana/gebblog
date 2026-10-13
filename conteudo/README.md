# Organização editorial — Blog GEB

## Produção

- `/index.html` — página inicial do blog.
- `/artigo.html` — página de leitura dos artigos.
- `/assets/` — JavaScript, CSS, fontes/imagens e demais recursos do site.
- `/conteudo/publicados/catalogo.js` — **única origem pública** dos artigos publicados.
- `/.github/workflows/deploy-blog.yml` — deploy automático do GitHub para a Locaweb.
- `/api.php` — proxy editorial antigo, mantido temporariamente para eventual reversão; **não é usado** pelo catálogo atual.

## Regras editoriais

1. Não enviar rascunhos, textos em revisão, notas internas ou cópias confidenciais para o repositório público ou para a Locaweb.
2. Manter os originais em Google Docs/Drive como arquivo de produção e cópia de segurança, separados da publicação técnica.
3. Acrescentar ao catálogo apenas artigos aprovados para publicação, preservando título, slug, categoria, tags, data e conteúdo.
4. As oito editorias oficiais são: Empresarial, Educação, Saúde, Inclusão, Tecnologia, Institucional, Eduarda e Fé.
5. Ao modificar arquivos em `conteudo/**`, o GitHub Actions envia as alterações à Locaweb, se os secrets FTP e a rotina de deploy estiverem válidos.
6. Não alterar slugs publicados sem configurar redirecionamento para os links antigos.
7. Para muitos artigos, preferir futuramente um arquivo por artigo, organizado por editoria/ano, e gerar o catálogo por uma etapa de build.

## Cópia de segurança

O repositório público **não substitui** o Google Drive. Manter os Google Docs originais, versões de revisão e cópias/exportações independentes no Drive. Evitar mover pastas do Drive enquanto integrações antigas ainda estiverem ativas.

## Migração

O catálogo atual contém **11 artigos** confirmados como publicados no Controle Editorial GEB. Outros 56 registros em `Aguardando publicação` não foram exportados para produção.
