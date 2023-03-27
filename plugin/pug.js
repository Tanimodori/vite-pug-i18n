import glob from "fast-glob";
import path from "path";
import fs from "fs";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import pug from "pug";

export default function vitePluginPugI18n({
  pages,
  langs,
  locals,
  options = {},
}) {
  const langMap = new Map();
  let langsFound = [];
  let pagesFound = [];

  return {
    name: "vite-plugin-pug-i18n",
    apply: "build",

    // Glob pages and langs on buildStart
    async buildStart() {
      const loadPages = async () => {
        pagesFound = await glob(pages.glob);
      };
      const loadLangs = async () => {
        langsFound = await glob(langs.glob);
        await Promise.all(langsFound.map(loadLang));
      };
      const loadLang = async (lang) => {
        const langCode = path.basename(lang, ".json");
        const langJson = await fs.promises.readFile(lang, "utf-8");
        langMap.set(langCode, langJson);
      };
      await Promise.all([loadPages(), loadLangs()]);
    },

    // Emit files on generateBundle
    async generateBundle() {
      // Initalize I18n
      const initI18n = () => {
        const resources = {};
        for (const [lang, json] of langMap.entries()) {
          resources[lang] = { translation: JSON.parse(json) };
        }
        i18next.use(LanguageDetector).init({
          fallbackLng: langMap.keys(),
          supportedLngs: langsFound,
          detection: {
            order: ["querystring", "navigator", "htmlTag", "path"],
            lookupQuerystring: "lng",
            lookupFromPathIndex: 0,
          },
          resources,
        });
      };

      // Generate all language versions for a page
      const transformPage = async (page) => {
        const template = await fs.promises.readFile(page, "utf-8");
        const compiledTemplate = pug.compile(template, options);
        // Get the relative path from actual path to each page.
        // And replace the extension to `html`
        const relativePath = path
          .relative(pages.root, page)
          .replace(/\.pug$/, ".html");
        for (const langCode of langMap.keys()) {
          // Compiled HTML source
          const source = compiledTemplate({
            __: i18next.getFixedT(langCode),
            ...locals,
          });
          // Emit as asset and specify filename
          this.emitFile({
            type: "asset",
            fileName: path.normalize(`${langCode}/${relativePath}`),
            source,
          });
        }
      };

      // Get works done here
      initI18n();
      await Promise.all(pagesFound.map(transformPage));
    },
  };
}
