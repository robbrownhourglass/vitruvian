# Vitruvian Lime: interim website

A static HTML/CSS/JS site with Home, About and Contact pages. It has no build step and no dependencies other than Google Fonts.

## Run locally

```sh
cd site
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy to GitHub Pages

1. Push the contents of this folder to the root of a repository (or keep it in `/docs` on `main`).
2. In the repository, go to **Settings → Pages → Build and deployment**, set Source to *Deploy from a branch*, and choose `main` with `/ (root)` (or `/docs`).
3. All links are relative, so the site works at both `username.github.io/repo/` and a custom domain.

### Custom domain (vitruvianlime.com)

1. Add a file named `CNAME` containing `vitruvianlime.com`, or set the domain in Settings → Pages.
2. At the DNS provider, point the apex domain's A records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`, and add a `www` CNAME to `username.github.io`.
3. Once the certificate is issued, tick **Enforce HTTPS**.

Note: switching DNS takes the current WordPress shop offline.

## Before going live

- **Contact email:** `CONTACT_EMAIL` in `js/main.js` is set to `info@vitruvianlime.com`. Send it a test email to confirm the inbox exists and is monitored.
- **Optional form service:** GitHub Pages can't send email itself. By default the form opens the visitor's email app (mailto). To have messages delivered directly, create a Formspree (or similar) form and set `FORM_ENDPOINT`.

## Structure

```
index.html  about.html  contact.html  404.html
css/styles.css
js/main.js
assets/img/        web-optimised images and logo marks
favicon.png  robots.txt  .nojekyll
```
