# Architecture

```
Browser or iPad app
  index.html + index.tsx            React entry
  App.tsx                           ErrorBoundary, Studio, offline badge, update toast, install prompt
  components/Studio.tsx             injects components/studioMarkup.ts and starts the engine once
  services/studioEngine.ts          touch UI engine: canvas, tools, text, layers, nails, strings, build
  lib/ + services/                  typed, tested algorithms (geometry, nails, threads, text outlines, projects)
  public/sw.js                      offline cache, file list filled in by vite.config.ts at build time
  localStorage                      current design and saved designs, on the device only
```

## Data model (types.ts)

- **Stroke**: what you draw. Polygons keep corners, curves are resampled evenly. Text becomes several strokes sharing a `lid`.
- **Nail**: a point on the board in mm. **Group**: the nails of one shape in order. **Thread**: a line between two nails with a color and the group it belongs to.
- Hiding a shape or color in Layers only filters what is shown and what Build lists. Nothing is deleted.

## Pipeline

1. Draw: strokes. 2. Nails: `generateNails(strokes, spacing)` places nails along visible strokes and merges nails that touch.
3. Strings: `outlineThreads`, `jumpThreads`, `multiplyThreads` or hand-made threads. 4. Build: `buildInstructions` lists positions, angles and threads in order.

## Text

`renderTextMask` draws the text with a device font on an offscreen canvas. `maskToContours` traces the outlines with marching squares and simplifies them. Each outline becomes a closed stroke.
Fonts are whatever is installed on the device, so Hindi, Sanskrit and Gujarati work on iPad without downloading anything.

## Why the engine is one file

The studio engine was built and tested as a single script, then moved here unchanged so behaviour stays identical.
New logic goes into typed modules with QA scripts. The plan is to move the engine over piece by piece.

## Dark studio (default UI)

`public/studio.html` is a single self-contained page (no build step, works offline through the service worker).
`App.tsx` shows it full screen in an iframe. `?legacy=1` mounts the previous engine (`components/Studio.tsx`).
Text uses the iPad font list (Latin, Japanese, Chinese, Korean, Arabic, Hebrew, Indic) and is converted to nail outlines. Layer masks (eraser hides, pen reveals; mask layer contents), pixel layers (raster painting that is traced into nails) and custom brushes and shapes (stored in localStorage) are built in. Not yet ported from the legacy engine: pen-tool Bezier editing.

Photo trace tool: with a reference photo loaded, Edge mode snaps a live-wire path to image edges as you drag, and Region mode grows a colour-similarity selection and outlines it. Layers can have a sized canvas (grid and axis, hideable in Precision). Brushes: Pen, Pencil, Pencil soft canvas, Toothy Pencil.

Auto-correct: freehand pen and lasso strokes are recognised as line, rectangle/square, triangle, regular polygon, circle or ellipse and replaced with the exact shape (toggle in Precision, Drawing aids). Photos can be moved, scaled and rotated with the Transform tool. Layers can have their own canvas colour; the board background defaults to white.
