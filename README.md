# Manpreet Singh — Portfolio

Vue 3 + Vite. All content lives in **`src/content/content.json`**.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
```

## Editing content

```jsonc
{
  "showreel": "https://vimeo.com/123456789",   // plays full screen, muted, on load
  "contact": { "title", "description", "portrait", "resume", "email", "links": [{ "label", "url" }] },
  "projects": [
    {
      "title": "Project name",                  // URL slug is generated from this
      "year": "2025",
      "thumbnail": "thumb.jpg",                 // optional — leave out to always use the video's current Vimeo thumbnail
      "description": "Short description.",
      "videos": [                               // one or more
        { "vimeo": "https://vimeo.com/123456789", "caption": "Launch film, 60s" }
      ]
    }
  ]
}
```

- Order in the JSON = order in the grid.
- Unlisted Vimeo links (`vimeo.com/123456789/abcdef1234`) work.
- Local files (portrait, résumé, thumbnails) go in `public/` and are referenced by filename, e.g. `"portrait.jpg"`.

## Deploying to GitHub Pages

The build uses a relative base and hash routing (`/#/work/slug`), so `dist/` works on any
GitHub Pages URL without extra config.

Pushing to `main` builds and deploys automatically via `.github/workflows/deploy.yml`
(repo Settings → Pages → Source: **GitHub Actions**).
