# EEHEO Website (static)

Plain HTML / CSS / JS — no build step. Five separate pages.

## Run locally with Live Server (VS Code)
1. Install the "Live Server" extension (by Ritwick Dey).
2. Open this folder in VS Code.
3. Right-click `index.html` -> "Open with Live Server".
   (Use Live Server so the Google Maps iframe and fonts load over http;
   opening the file directly via file:// mostly works too.)

## Files
- index.html, about.html, services.html, gallery.html, contact.html
- css/styles.css   — all styles + design tokens (:root)
- js/main.js       — animations & interactions (contours, scroll reveals,
                     counters, accordion, gallery + lightbox, nav, mobile menu)
- images/          — drop your photos here (see images/README.txt)
- favicon.svg

## Adding images
- Gallery: images/gallery1.jpg ... gallery40.jpg
- Homepage strip: images/home1.jpg, home2.jpg, home3.jpg
Names are case-sensitive. The gallery extension is set via data-ext on the
.masonry div in gallery.html (default "jpg"). A teal placeholder renders until
real files exist, so nothing breaks while you build.

## Editing content
- Page copy lives directly in each .html file.
- Colors / fonts / spacing: css/styles.css :root block.
- Nav and footer are duplicated in each page (no build step / no includes) —
  if you change a nav link, update it in all five files.
- Email + social links are placeholders (# / info@eeheo.org) — update in
  contact.html and the footer of each page.

## Hosting
It's already static, so the folder you develop in is the folder you deploy.
- Netlify / Cloudflare Pages / Vercel: drag the folder in, or connect a repo.
  No build command; publish directory = this folder.
- GitHub Pages: push to a repo and enable Pages.

## Design
Signature motif: Mount Elgon topographic contour lines (the org is named for
the mountain), drawn as animated SVG on teal sections. Palette: deep teal +
clay amber on warm sand. Fonts: Sora (display) / Plus Jakarta Sans (body).
