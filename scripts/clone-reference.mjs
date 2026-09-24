import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://iwebbtech.com';
const root = path.resolve('public');
const assets = new Set();
const failures = [];
function discover(text, base) {
  for (const m of text.matchAll(/(?:src|href)=["']([^"']+)|url\(\s*["']?([^\s)'";]+)|["'](https:\/\/iwebbtech\.com\/assets\/[^"']+)["']/g)) {
    try {
      const u = new URL((m[1] || m[2] || m[3]).replaceAll('&amp;', '&'), base);
      if (u.origin === origin && /\.(css|js|png|jpe?g|webp|svg|gif|woff2?|ttf|eot|ico)(\?|$)/i.test(u.pathname)) assets.add(u.href);
    } catch { /* Ignore non-URL template values. */ }
  }
}
function localize(text) { return text.replaceAll(origin + '/public/index.php', '').replaceAll(origin, '').replaceAll('https://www.iwebbtech.com', ''); }
const home = await readFile('reference.html', 'utf8');
const routes = new Set(['/']);
for (const m of home.matchAll(/href="https:\/\/iwebbtech\.com([^"#]*)"/g)) if (!m[1].includes('.') && m[1]) routes.add(m[1]);
await mkdir(path.join(root, 'site'), {recursive:true});
await Promise.all([...routes].map(async route => {
  try {
    const response = route === '/' ? null : await fetch(origin + route);
    if (response && !response.ok) throw new Error(String(response.status));
    let html = response ? await response.text() : home;
    discover(html, origin + route);
    html = localize(html).replace(/<!-- Translator Begins -->[\s\S]*?<!-- Translator Ends -->/g, '');
    html = html.replace('</body>', '<script src="/local-interactions.js"></script></body>');
    await writeFile(path.join(root, 'site', route === '/' ? 'index.html' : route.slice(1).replaceAll('/', '-') + '.html'), html);
    console.log('Page:', route);
  } catch(e) { failures.push({url:origin+route, error:e.message}); }
}));
const done = new Set();
while ([...assets].some(u => !done.has(u))) {
  const batch = [...assets].filter(u => !done.has(u)).slice(0, 12);
  await Promise.all(batch.map(async url => {
    done.add(url);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(String(response.status));
      const destination = path.join(root, decodeURIComponent(new URL(url).pathname));
      await mkdir(path.dirname(destination), {recursive:true});
      if (/\.(css|js)(\?|$)/.test(url)) {
        let text = await response.text();
        discover(text, url);
        await writeFile(destination, localize(text));
      } else await writeFile(destination, Buffer.from(await response.arrayBuffer()));
    } catch(e) { failures.push({url, error:e.message}); }
  }));
  console.log('Assets:', done.size, '/', assets.size);
}
await writeFile('clone-report.json', JSON.stringify({pages:[...routes],assets:done.size,failures},null,2));
console.log(JSON.stringify(failures));
