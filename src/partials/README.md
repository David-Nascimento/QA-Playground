# Partials

Blocos de layout compartilhados por todas as páginas de `public/`.

Uma página inclui um partial com um comentário no lugar onde ele deve aparecer:

```html
<!-- @include header -->
...
<!-- @include footer -->
```

O build (`tools/build/build-site.mjs`) substitui o comentário pelo conteúdo do
arquivo `src/partials/<nome>.html`, mantendo a indentação, e:

- converte `href`/`src` que começam com `{{root}}` no caminho relativo mínimo
  da página até o alvo (ex.: em `pages/junior/index.html`, `{{root}}pages/desafio/pleno.html`
  vira `../desafio/pleno.html`);
- marca com `aria-current="page"` o link que aponta para a própria página.

Páginas sem o comentário (ex.: `forgot-password.html`, `test-register.html`)
continuam sem header/footer.
