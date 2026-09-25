import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const shareImage = 'https://raw.githubusercontent.com/Kingsly-j/cargoXpress/main/public/corgoxpress-logo.jpeg';

async function files(dir) {
  const result=[];
  for(const item of await readdir(dir,{withFileTypes:true})) {
    const file=path.join(dir,item.name);
    if(item.isDirectory())result.push(...await files(file));
    else if(/\.(html|ts|tsx)$/.test(item.name))result.push(file);
  }
  return result;
}
for(const file of [...await files('src'),...await files('public/site'),'README.md','scripts/verify-cloud.mjs','scripts/check-shipment-history.mjs']) {
  let content=await readFile(file,'utf8');
  content=content.replaceAll('Shipwave Global Logistics | Track Shipments Worldwide','corgoXpress | Worldwide Shipping &amp; Tracking')
    .replaceAll('# Shipwave Global Logistics','# corgoXpress')
    .replaceAll('Shipwave Global Logistics','corgoXpress')
    .replaceAll('Shipwave Logistics','corgoXpress Logistics')
    .replaceAll('Shipwave','corgoXpress')
    .replaceAll('CargoXpress','corgoXpress')
    .replaceAll('/shipwave-logo.png','/corgoxpress-logo.jpeg')
    .replaceAll('/cargoxpress-logo.png','/corgoxpress-logo.jpeg')
    .replaceAll('cargoxpress-social.png','corgoxpress-logo.jpeg')
    .replaceAll('og:image:width" content="1200"','og:image:width" content="1408"')
    .replaceAll('og:image:height" content="630"','og:image:height" content="768"')
    .replaceAll('/shipwave-mark.png','/cargoxpress-mark.png')
    .replaceAll('support@shipwave.com','cargoxpress@gmail.com')
    .replaceAll('contact@iwebbtech.com','cargoxpress@gmail.com')
    .replaceAll('cargoxpress@gmail.com','cargoxpress83@gmail.com')
    .replaceAll('17749300000','17064521895')
    .replaceAll('+1 (774) 930-0000','+1 (706) 452-1895')
    .replaceAll('SW-','CX-')
    .replaceAll('shipwave/shipments','cargoxpress/shipments')
    .replaceAll('alt="" /></a>','alt="corgoXpress logo" /></a>')
    .replaceAll('aria-label="logo image"','aria-label="corgoXpress logo"');
  if(file.includes(`${path.sep}site${path.sep}`) && !content.includes('property="og:image"')) {
    const social = `\n    <meta property="og:type" content="website" />\n    <meta property="og:site_name" content="corgoXpress" />\n    <meta property="og:title" content="corgoXpress | Global Logistics &amp; Tracking" />\n    <meta property="og:description" content="Reliable worldwide air, sea, and road freight with live shipment tracking." />\n    <meta property="og:image" content="${shareImage}" />\n    <meta property="og:image:width" content="1408" />\n    <meta property="og:image:height" content="768" />\n    <meta property="og:image:alt" content="corgoXpress global logistics — air, sea, and road shipping" />\n    <meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:title" content="corgoXpress | Global Logistics &amp; Tracking" />\n    <meta name="twitter:description" content="Reliable worldwide air, sea, and road freight with live shipment tracking." />\n    <meta name="twitter:image" content="${shareImage}" />\n`;
    content=content.replace('</head>',`${social}</head>`);
  }
  if(file.includes(`${path.sep}site${path.sep}`) && !content.includes('cargoxpress-brand.css')) {
    content=content.replace('</head>','    <link rel="stylesheet" href="/cargoxpress-brand.css" />\n</head>');
  }
  await writeFile(file,content);
}
console.log('Applied corgoXpress branding, share-card metadata, logo styling, contact details, and logo references across site pages and dashboard copy.');
