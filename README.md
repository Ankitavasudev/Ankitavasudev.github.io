# ankitavasudev.github.io

My personal portfolio — a single, dependency-free HTML page that lists the tools I
build and the open-source work I do.

**Live:** https://ankitavasudev.github.io/

## What's here

| File | Purpose |
|------|---------|
| `index.html` | The whole site: markup, CSS and a small inline script. |
| `scripts/check-site.mjs` | Structural checks run in CI (see below). |
| `.github/workflows/ci.yml` | Runs `check-site.mjs` on every push and pull request. |

No build step, no framework, no `node_modules`. The page is served exactly as committed.

## Run locally

```bash
git clone https://github.com/Ankitavasudev/Ankitavasudev.github.io.git
cd Ankitavasudev.github.io
python -m http.server 8000
# open http://localhost:8000
```

Any static file server works; `python -m http.server` is just the shortest path.

## Checks

```bash
node scripts/check-site.mjs
```

The script fails if:

- `<!DOCTYPE html>`, `<html lang>`, `<title>`, the viewport meta or the description meta is missing;
- two elements share the same `id`;
- an in-page link (`href="#..."`) points at an id that does not exist;
- a local `src` / `href` points at a file that is not in the repo;
- the inline `<script>` does not parse.

These are the failures that actually break a static page, so they run on every push
instead of a full HTML validator with a large rule surface.

## Deploy

GitHub Pages serves the `main` branch root (`/`). Pushing to `main` republishes the
site; the CI check runs first, so a broken page shows up as a red check on the commit.

## License

MIT — see [LICENSE](LICENSE).
