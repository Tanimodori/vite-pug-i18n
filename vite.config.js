import { defineConfig } from 'vite';
import { resolve } from 'path';
import pugVitePlugin from './pug/vite-plugin-pug';
import { i18next, langs } from './pug/i18next';

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, './node_modules'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        'en/index.html': resolve(__dirname, 'src/pages', 'index.en.pug'),
        'fr/index.html': resolve(__dirname, 'src/pages', 'index.fr.pug'),
        'en/test/index.html': resolve(
          __dirname,
          'src/pages/test',
          'index.en.pug'
        ),
        'fr/test/index.html': resolve(
          __dirname,
          'src/pages/test',
          'index.fr.pug'
        ),
      },
    },
  },
  plugins: [
    pugVitePlugin({
      langs,
      i18next,
      locals: {},
    }),
  ],
});
