import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes, createHash } from 'node:crypto';

const source = path.resolve('../jmlogisticts');
const adapt = text => text.replaceAll('Bluecrest Logistics','Revolve Courier').replaceAll('Bluecrest','Revolve').replaceAll('bluecrest-logistics','shipwave-logistics').replaceAll('bluecrest-verification','shipwave-verification').replaceAll('support@bluecrestshipping.com','support@shipwave.com').replaceAll('contact@iwebbtech.com','support@shipwave.com').replaceAll('19152019157','17749300000').replaceAll('+1 (915) 201-9157','+1 (774) 930-0000').replaceAll('BC-','SW-');
const modules = ['app/admin/page.tsx','app/admin/shipment-details-editor.tsx','app/admin/shipment-note-editor.tsx','app/track/page.tsx','app/track/shipment-result.tsx','app/track/shipment-route.tsx','app/trackingresult/page.tsx','app/admin-access.tsx','app/language-provider.tsx','app/floating-tools.tsx','lib/shipments.ts','lib/shipment-route.ts','lib/shipment-progress.ts','lib/whatsapp.ts','lib/languages.ts','lib/italian-translations.ts','lib/international-translations.ts','utils/firebase/client.ts','utils/supabase/client.ts'];
for (const file of modules) {
  const target = path.join('src',file);
  await mkdir(path.dirname(target),{recursive:true});
  let text = adapt(await readFile(path.join(source,file),'utf8'));
  if(file === 'app/admin/page.tsx') text = text.replace('`shipments/${trackingCode}', '`shipwave/shipments/${trackingCode}');
  await writeFile(target,text);
}
let css = await readFile(path.join(source,'app/globals.css'),'utf8');
css = css.replace('@import "../public/reference/fontawesome.css";','').replace('@source "./content/*.html";','').replaceAll('var(--font-site-inter)', '"Poppins"');
for(const [from,to] of Object.entries({'#2563eb':'#4a3aff','#1d4ed8':'#3828df','#214bdd':'#062f3a','#182b3e':'#062f3a','#102b46':'#062f3a'})) css=css.replaceAll(from,to);
await writeFile('src/app/globals.css',css);
const envText = await readFile(path.join(source,'.env'),'utf8') + '\n' + await readFile(path.join(source,'.env.local'),'utf8');
const sourceEnv = Object.fromEntries(envText.split(/\r?\n/).filter(line=>/^[A-Z_]+=/.test(line)).map(line=>{const n=line.indexOf('=');return [line.slice(0,n),line.slice(n+1).trim().replace(/^['"]|['"]$/g,'')];}));
const password = randomBytes(18).toString('base64url');
const config = {
NEXT_PUBLIC_FIREBASE_API_KEY:'AIzaSyCil5hcfTiB_qHGKsxCVH2M69P6jdVnF10',
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:'shipwave-3a12a.firebaseapp.com',
NEXT_PUBLIC_FIREBASE_PROJECT_ID:'shipwave-3a12a',
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:'shipwave-3a12a.firebasestorage.app',
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:'923883507129',
NEXT_PUBLIC_FIREBASE_APP_ID:'1:923883507129:web:7265a5870744458a46fa68',
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:'G-RGNRNK12J8',
NEXT_PUBLIC_SUPABASE_URL:sourceEnv.NEXT_PUBLIC_SUPABASE_URL,
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:sourceEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
NEXT_PUBLIC_SUPABASE_SHIPMENT_PHOTOS_BUCKET:sourceEnv.NEXT_PUBLIC_SUPABASE_SHIPMENT_PHOTOS_BUCKET || 'blue',
S3_BUCKET_NAME:sourceEnv.S3_BUCKET_NAME || 'blue',
SHIPWAVE_SUPER_ADMIN_EMAIL:'support@shipwave.com',
SHIPWAVE_SUPER_ADMIN_PASSWORD:password,
};
for(const key of ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY']) if(!config[key]) throw Error('Source configuration missing '+key);
await writeFile('.env.local',Object.entries(config).map(([key,value])=>`${key}=${value}`).join('\n')+'\n');
await writeFile('.env.example',Object.keys(config).map(key=>`${key}=`).join('\n')+'\n');
await writeFile('src/lib/admin-bootstrap.ts',`// Matches the browser-local account architecture of the source project.\nexport const bootstrapPasswordHash = "${createHash('sha256').update(password).digest('hex')}";\n`);
for(const file of ['check-shipment-history.mjs','verify-cloud.mjs']) {
 let text=adapt(await readFile(path.join(source,'scripts',file),'utf8')).replaceAll("'lib/", "'src/lib/").replaceAll('public/testimonials/portrait-1.jpg','public/assets/images/resources/banner-one-review-1-1.jpg').replace('`shipments/SW-VERIFY-', '`shipwave/shipments/SW-VERIFY-');
 await writeFile(path.join('scripts',file),text);
}
console.log('Imported tracking, dashboard, localization, and storage modules. Firebase configured for Shipwave; shared storage configured without printing credentials.');
