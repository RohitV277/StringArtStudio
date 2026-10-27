# Contributing

Thanks for helping. This project has one rule that matters most: **it must keep working offline and keep your designs on the device.** No analytics, no uploads, no required accounts.

## Set up

```bash
npm install
npm run dev
```

Node 20 or newer runs the app. Node 22.18 or newer is needed for the QA scripts, because they import the TypeScript modules directly.

## Before you open a pull request

```bash
npm run lint           # type check
npm run test:catalog   # tools, markup ids, engine ids and PWA files agree
npm run test:qa        # geometry, nails, threads, text outlines, storage, end to end
npm run build
```

## Where things live

- `lib/` and `services/` hold the typed, tested algorithms. Add new logic here first, with a `qa-*.mjs` check.
- `services/studioEngine.ts` is the touch UI engine carried over from the original build. It binds to element ids in `components/studioMarkup.ts`. If you rename an id, `npm run test:catalog` tells you what to update.
- `components/` and `hooks/` are the React shell: offline badge, install prompt, update toast, storage.
- `public/sw.js` is the offline cache. The build fills in the file list and version.

## Good first areas

- Moving more of the engine into typed modules in `services/`
- Accessibility (VoiceOver labels on tools and handles)
- Tests for the select, rotate and pinch maths
- More fonts and scripts for the Text tool
