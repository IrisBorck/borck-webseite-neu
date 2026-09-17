import { defineConfig } from 'astro/config';

// Ausschließlich die eigenständige GitHub-Pages-Vorschau. Keine Produktivdomain.
export default defineConfig({
  site: 'https://irisborck.github.io',
  base: '/borck-webseite-neu',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
