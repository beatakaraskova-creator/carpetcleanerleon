# Carpet Cleaner Leon — carpetcleanerleon.co.uk

Static HTML, CSS and JavaScript. Open `index.html` locally, or:

```bash
npx --yes serve .
```

## Deploy to GitHub, then Hostinger

This is a static site. Hostinger only needs the files in the repo root (`index.html`, `privacy.html`, `css/`, `js/`, `image/`, `robots.txt`, `sitemap.xml`).

### GitHub

```bash
git init
git add .
git commit -m "Carpet Cleaner Leon site"
gh repo create carpetcleanerleon --public --source=. --push
```

### Hostinger

1. In hPanel open the site for **carpetcleanerleon.co.uk**.
2. **Files → File Manager** and go to `public_html`.
3. Upload everything from this repo **except** `.git`, `README.md` and `SOURCE.md` (those are optional).
4. Confirm `index.html` sits in `public_html` (not in a subfolder).
5. Point the domain’s document root at `public_html` if it is not already.

Or use **Hostinger Git**: connect the GitHub repo and set the deploy path to `public_html`.
