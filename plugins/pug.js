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
  const langMetaMap = new Map();
  const pageMap = new Map();
  let langsFound = [];
  let pagesFound = [];

  return {
    name: "vite-plugin-pug-i18n",
    enforce: "pre",
    apply: "build",

    async config(config) {
      // Glob pages and langs
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
        langMap.set(langCode, JSON.parse(langJson));
      };
      await Promise.all([loadPages(), loadLangs()]);

      const input = [];

      // inject entry files here
      for (const page of pagesFound) {
        for (const langCode of langMap.keys()) {
          const relativePath = path
            .relative(pages.root, page)
            .replace(/\.pug$/, ".html");
          const distPath = path.normalize(`${langCode}/${relativePath}`);
          input.push(distPath);
          langMetaMap.set(distPath, { langCode, page });
        }
      }

      return {
        build: {
          rollupOptions: { input },
        },
      };
    },

    // Init I18n on buildStart
    buildStart() {
      const resources = {};
      for (const [langCode, langObject] of langMap.entries()) {
        resources[langCode] = { translation: langObject };
      }
      i18next.use(LanguageDetector).init({
        fallbackLng: "en",
        supportedLngs: [...langMap.keys()],
        detection: {
          order: ["querystring", "navigator", "htmlTag", "path"],
          lookupQuerystring: "lng",
          lookupFromPathIndex: 0,
        },
        resources,
      });
    },

    resolveId(id) {
      if (langMetaMap.has(id)) {
        return id;
      }
    },

    // Transform pug to html on load
    async load(id) {
      let meta = langMetaMap.get(id);
      if (!meta) {
        return;
      }
      const { langCode, page } = meta;

      // Get the compiled template
      let template = pageMap.get(page);
      if (!template) {
        const rawTemplate = await fs.promises.readFile(page, "utf-8");
        template = pug.compile(rawTemplate, options);
        pageMap.set(page, template);
      }

      // Return the compiled template
      const source = compiledTemplate({
        __: i18next.getFixedT(langCode),
        ...locals,
      });
      return source;
    },
  };
}
