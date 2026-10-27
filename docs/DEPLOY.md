# Deploy

## GitHub Pages (recommended)

1. Push to a repository named `StringArtStudio` (any name works).
2. **Settings, Pages, Source: GitHub Actions**.
3. The **Deploy to GitHub Pages** workflow builds with `VITE_BASE=/<repo-name>/` and publishes `dist`.

## Cloudflare Pages

Build command `npm run build`, output directory `dist`. `functions/_middleware.ts` and `public/_headers` add the security headers.

## Any static host

```bash
npm run build
npx serve dist
```

Serve over HTTPS (or localhost) so the service worker and install prompt work. Do not open `dist/index.html` from the filesystem.

## Releases

Push a tag such as `v1.0.0`. The **Release** workflow attaches `string-art-studio-v1.0.0.zip` to a GitHub release.
Bump `version` in `package.json` first. The build stamps it into the offline cache so installed copies update.
