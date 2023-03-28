import { defineConfig } from "vite";
import { resolve } from "path";
import vitePluginPugI18n from "./plugins/pug";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {},
    },
  },
  plugins: [
    vitePluginPugI18n({
      pages: {
        glob: "./src/pages/**/*.pug",
        root: resolve(__dirname, "src/pages"),
      },
      langs: {
        glob: "./src/language/*.json",
      },
      locals: {},
      options: {},
    }),
  ],
});
