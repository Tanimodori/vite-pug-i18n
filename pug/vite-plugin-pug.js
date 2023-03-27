import fs from 'fs';
import path from 'path';
import pug from 'pug';

export default function pugVitePlugin(
  { langs, i18next, locals = {} },
  options = {}
) {
  const map = new Map();
  return {
    name: 'vite-plugin-pug',
    enforce: 'pre',
    apply: 'build',
    load(id) {
      if (path.extname(id) === '.html') {
        if (map.has(id)) {
          const parsed = path.parse(map.get(id));
          parsed.lang = path.extname(parsed.name).replace('.', '');
          parsed.name = path.basename(parsed.name, `.${parsed.lang}`);
          const realPath = path.join(parsed.dir, '/', `${parsed.name}.pug`);

          const compiledTemplate = pug.compileFile(realPath, options);
          const html = compiledTemplate({
            __: i18next.getFixedT(parsed.lang),
            ...locals,
          });
          console.log(
            `PUG Compiled (${parsed.lang.toUpperCase()} version):`,
            path.relative(process.cwd(), realPath)
          );
          return html;
        }
        return fs.readFileSync(id, { encoding: 'utf8' });
      }
      return null;
    },
    resolveId(source) {
      const parsed = path.parse(source);
      if (parsed.ext === '.pug') {
        const htmlPath = path.format({
          dir: parsed.dir,
          name: parsed.name,
          ext: '.html',
        });
        map.set(htmlPath, source);
        return htmlPath;
      }
      return null;
    },
  };
}
