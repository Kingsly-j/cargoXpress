import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

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
  content=content.replaceAll('Shipwave Global Logistics | Track Shipments Worldwide','Cargo Xpress | Worldwide Shipping &amp; Tracking')
    .replaceAll('# Shipwave Global Logistics','# Cargo Xpress')
    .replaceAll('Shipwave Global Logistics','Cargo Xpress')
    .replaceAll('Shipwave Logistics','Cargo Xpress Logistics')
    .replaceAll('Shipwave','Cargo Xpress')
    .replaceAll('/shipwave-logo.png','/cargoxpress-logo.png')
    .replaceAll('/shipwave-mark.png','/cargoxpress-mark.png')
    .replaceAll('support@shipwave.com','cargoxpress@gmail.com')
    .replaceAll('contact@iwebbtech.com','cargoxpress@gmail.com')
    .replaceAll('17749300000','17064521895')
    .replaceAll('+1 (774) 930-0000','+1 (706) 452-1895')
    .replaceAll('SW-','CX-')
    .replaceAll('shipwave/shipments','cargoxpress/shipments')
    .replaceAll('alt="" /></a>','alt="Cargo Xpress logo" /></a>')
    .replaceAll('aria-label="logo image"','aria-label="Cargo Xpress logo"');
  await writeFile(file,content);
}
console.log('Applied Cargo Xpress branding, contact details, and logo references across site pages and dashboard copy.');
