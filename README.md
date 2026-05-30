# Pixelverse

An all-pixel-art creative PWA — **create**, **view**, and **play** with pixel art. Every screen,
panel, button, and cursor is pixel art. Works great on phone and desktop, installs as an app, and
runs fully offline.

> Status: in active construction. See [`docs`](#) and the milestone list below.

## Features (target)

- **Studio** — a full pixel editor: pencil/eraser/fill/shapes/eyedropper/select, mirror & dither,
  layers, undo/redo, palettes, and a frame-by-frame **animation timeline** with onion-skinning.
- **Gallery** — your creations saved on-device (IndexedDB), with import/export and a featured set.
- **Playground** — a falling-sand **sandbox**, auto-generated **nonogram** puzzles, **Pixel Snake**,
  and a **Pixelizer** that turns photos into editable pixel art.
- **Daily** — a daily prompt + palette-of-the-day with a streak.
- **Themes** — Neon Arcade, Retro Console, Cozy Pastel, Clean Monochrome — switch live.
- **Share** — artwork is compressed straight into a link; also export PNG / animated GIF / spritesheet.

## Tech

Vite · React · TypeScript · Zustand · Tailwind v4 (CSS-first tokens) · HTML5 Canvas · IndexedDB (`idb`)
· `vite-plugin-pwa` · `gifenc` · `lz-string`.

## Develop

```bash
pnpm install
node scripts/gen-icons.mjs   # generate PWA icons into public/
pnpm dev                     # start the dev server
pnpm build                   # typecheck + production build
pnpm preview                 # preview the production build
pnpm test                    # run unit tests
```

## Deploy (Vercel)

```bash
node scripts/gen-icons.mjs
git init && git add -A && git commit -m "Pixelverse"
gh repo create pixelverse --public --source=. --push
vercel --prod                # outputs the live URL
```

The app is a static SPA (`vercel.json` sets the Vite framework + SPA fallback), so any
static host works too.

## License

MIT

