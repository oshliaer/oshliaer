import path from 'path';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import rec from 'recursive-readdir';
import mustashe from 'mustache';

const PATH_ = './docs';

const dictStats: Record<string, fs.Stats> = {};

const ignore = (file: string, stat: fs.Stats) => {
  dictStats[file] = stat;
  return !stat.isDirectory() && path.extname(file) !== '.md';
};

async function run() {
  const list = await rec(PATH_, [ignore]);

  const lastItems = list
    .map((str: string) => {
      const parts = str.split('/');
      const index = parts.indexOf('docs');
      const link = parts.slice(index).join('/');
      const title = parts
        .slice(index + 1)
        .map((s) => s.replace(/\.md$/, ''))
        .join(' => ');
      return {
        parts,
        title,
        link,
        stat: dictStats[str],
      };
    })
    .map((part) => `- [${part.title}](${part.link})`)
    .join('\n');

  const tempalte = await fsp.readFile(path.join('./scripts/templates/readme.md'), 'utf8');

  const doc = mustashe.render(tempalte, { lastItems });

  fsp.writeFile(path.join('./readme.md'), doc, 'utf8');
}

run();
