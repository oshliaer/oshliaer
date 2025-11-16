import * as fs from 'fs';
import * as fsp from 'fs/promises';
import { DateTime } from 'luxon';
import mustashe from 'mustache';
import path from 'path';
import rec from 'recursive-readdir';
import { loadFront } from './services/yaml-front-matter';

type Post = {
  date?: Date;
  title?: string;
  __content: string;
};

type Item = {
  data: Post;
  path: string;
  parts: string[];
  title: string;
  link: string;
  stat: fs.Stats;
};

const PATH_ = './docs';

const dictStats: Record<string, fs.Stats> = {};

const ignore = (file: string, stat: fs.Stats) => {
  dictStats[file] = stat;
  return !stat.isDirectory() && path.extname(file) !== '.md';
};

async function loadContent(filePath: string) {
  const content = await fsp.readFile(path.join(filePath), 'utf-8');
  const data = loadFront(content);
  console.log(`done read ${filePath}`);
  return data;
}

function anyToDate(any: any, pref?: string, suff?: string): string {
  if (any && any.toISOString) {
    return `${pref}${any.toISOString().split('T')[0]}${suff}`;
  }
  return '';
}

async function run() {
  const list = await rec(PATH_, [ignore]);

  const lastItems = list.map((str: string) => {
    const parts = str.split('/');
    const index = parts.indexOf('docs');
    const link = parts.slice(index).join('/');
    const title = parts
      .slice(index + 1)
      .map((s) => s.replace(/\.md$/, ''))
      .join(' => ');
    return {
      data: {} as Post,
      path: str,
      parts,
      title,
      link,
      stat: dictStats[str],
    } as Item;
  });

  const lastItemsWithData = await Promise.all(
    lastItems.map(async (part) => {
      console.log(`read ${part.link}`);
      part.data = (await loadContent(part.link)) as Post;
      return part;
    })
  );

  const lastItemsValue = lastItemsWithData
    .sort((a, b) => {
      const aD = a.data?.date?.getTime ? a.data.date.getTime() : 0;
      const bD = b.data?.date?.getTime ? b.data.date.getTime() : 0;
      if (aD < bD) {
        return 1;
      } else if (aD > bD) {
        return -1;
      }
      return 0;
    })
    .slice(0, 10)
    .map((part) => `- ${anyToDate(part.data.date, '', ' ')}[${part.title}](${part.link.replaceAll(' ', '%20')})`)
    .join('\n');

  const tempalte = await fsp.readFile(path.join('./scripts/templates/readme.md'), 'utf8');

  // Create DateTime instance with Moscow timezone
  const moscowTime = DateTime.now().setZone('Europe/Moscow');

  const doc = mustashe.render(tempalte, {
    lastItems: lastItemsValue,
    lastUpdated: moscowTime.setLocale('ru-RU').toLocaleString(DateTime.DATETIME_SHORT),
  });

  fsp.writeFile(path.join('./README.md'), doc, 'utf8');
}

run();
