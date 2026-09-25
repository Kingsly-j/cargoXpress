# corgoXpress

A local copy of the public design at https://iwebbtech.com, served by Next.js.

Run `npm install`, then `npm run dev`. Open http://localhost:3000.

The 14 public pages live in `public/site`; images, CSS, fonts, and original animation libraries live in `public/assets` and `public/storage`. `next.config.ts` maps the original routes to those HTML pages. This retains the reference's responsive layout and interactions without an iframe. Google Fonts and embedded third-party media still require an internet connection.

Tracking runs through Firestore with live updates at `/track?code=CX-...`. The admin dashboard at `/admin?admin=1` creates and edits shipments, route stops, milestone dates, parcel fees, history, and cargo photos. Type `admin` outside a form to open it. Photos use the shared Supabase Storage `blue` bucket under a `cargoxpress/` prefix. The source project calls this bucket `S3_BUCKET_NAME`, but its upload implementation is Supabase Storage.

The floating customer chat writes conversations to Firestore. It is mounted on both the Next.js tracking screens and the 14 static reference pages. Admins can answer in the dashboard inbox and set their availability; leaving the dashboard marks support offline. Site visits record a random tab session, page path, referring hostname, and timestamp. They do not record IP addresses or contact details. The traffic panel summarizes the latest 500 page views. Firestore rules must allow the `supportChats`, `siteVisits`, and `supportPresence` collections to be read and written for those features to work.

The supplied logo is used in the site header and as a 1200�-630 link preview image for Open Graph and Twitter. Static pages point to the share image in this repository's public `main` branch.

Sign in as `corgoxpress@gmail.com`. The initial password is stored locally in ignored `.env.local` as `SHIPWAVE_SUPER_ADMIN_PASSWORD`. Admin accounts and sessions follow the source project's browser-local model; account roles are not server-side access control. Shipment writes are in Firestore and report failure when Firebase does not confirm them.

The source downloader is `scripts/clone-reference.mjs`. Its download report is `clone-report.json`; the three reported 404 routes were also missing on the source site. `scripts/import-logistics.mjs` records the import and environment setup used for the tracking dashboard.

Validation: `npm run build` and `npm run lint` (downloaded third-party scripts are excluded from lint).
