<img src="icons/logo.svg" width="96" height="96" alt="">

# Slabikovač

Splits Czech text into syllables (`má-ma`, `ses-tra`, `Pe-tr`) and joins the non-syllabic
prepositions k, s, v, z to the following word with `+` (`v+do-mě`).

**App:** https://juhyxx.github.io/sylab/ — installable as a PWA and works offline.

## Run locally

No build step. Open `index.html` directly, or serve the folder to get the service worker
(offline mode, install prompt):

```sh
python3 -m http.server 8000
# http://localhost:8000
```

## Tests

```sh
node test/syllabify.test.js
```

Without Node, macOS JavaScriptCore works too:

```sh
/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc test/syllabify.test.js
```

## Deploy

Every push to `main` runs the tests and deploys to GitHub Pages
([.github/workflows/pages.yml](.github/workflows/pages.yml)).

When adding a new file the app needs offline, add it to `ASSETS` in `sw.js`, bump `CACHE`,
and add it to the "Assemble site" step of the workflow.

## Logo

`icons/logo.svg` (rounded) and `icons/logo-maskable.svg` (full-bleed, for Android/iOS) are the
sources; the PNG icons are rendered from them at 512 px and scaled down (192 px, 180 px).
