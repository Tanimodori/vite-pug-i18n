import { defineConfig } from "vite";
import { resolve } from "path";
import vitePluginPugI18n from "./plugin/pug";

export default defineConfig({
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
