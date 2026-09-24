import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';

const errors = [];
const files = await readdir('public/site');
for (const file of files) {
  const html = await readFile(path.join('public/site',file),'utf8');
  for (const match of html.matchAll(/(?:src|href)="(\/(?:assets|storage)\/[^"?#]+)"/g)) {
    try { await access(path.join('public',match[1])); }
    catch { errors.push(file + ': ' + match[1]); }
  }
}
for (const route of ['/', '/about', '/services', '/contact', '/track']) {
  const response = await fetch('http://localhost:3001' + route);
  const html = await response.text();
  if (!response.ok || !html.includes('Revolve Courier')) errors.push(route + ': failed');
  console.log(route, response.status, html.includes('Revolve Courier'));
}
console.log('Pages checked:',files.length,'Missing assets / HTTP failures:',errors);
if (errors.length) process.exitCode = 1;
