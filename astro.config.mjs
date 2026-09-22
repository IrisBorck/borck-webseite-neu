import { defineConfig } from 'astro/config';

// Ausschließlich die eigenständige GitHub-Pages-Vorschau. Keine Produktivdomain.
export default defineConfig({
  site: 'https://irisborck.github.io',
  base: '/borck-webseite-neu',
  output: 'static',
  // Separate CSS-Dateien, damit die bestehende Sicherheitsrichtlinie auch kleine Styles erlaubt.
  build: { inlineStylesheets: 'never' },
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
