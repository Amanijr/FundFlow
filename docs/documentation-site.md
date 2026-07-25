# Documentation Site Setup

FundFlow ERP uses [MkDocs](https://www.mkdocs.org/) with the [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) theme.

## Prerequisites

- Python 3.10+
- `pip`

## Install

From the project root:

```bash
pip install -r requirements-docs.txt
```

Use a virtual environment (recommended):

```bash
python3 -m venv .venv-docs
source .venv-docs/bin/activate   # Windows: .venv-docs\Scripts\activate
pip install -r requirements-docs.txt
```

## Commands

| Command | Description |
|---------|-------------|
| `mkdocs serve` | Live preview at http://127.0.0.1:8000 (auto-reload on save) |
| `mkdocs build` | Build static site into `site/` |
| `mkdocs build --strict` | Fail on warnings (useful in CI) |
| `mkdocs gh-deploy` | Build and push to `gh-pages` branch on GitHub |

## Project layout

```
mkdocs.yml              # Site configuration and theme
requirements-docs.txt   # Python dependencies
docs/
  index.md              # Site homepage
  .pages                # Navigation (awesome-pages plugin)
  USER_MANUAL.md        # Full user manual
  guides/               # Role-based guides
  developer/            # Architecture & project overview
  frontend/             # Frontend phase documentation
  stylesheets/extra.css # Custom styling
```

## Edit navigation

Navigation is controlled by `.pages` files ( [mkdocs-awesome-pages-plugin](https://github.com/lukasgeiter/mkdocs-awesome-pages-plugin) ):

- `docs/.pages` — top-level sections
- `docs/guides/.pages` — user guides order
- `docs/frontend/phase-XX/.pages` — phase titles

After editing markdown or `.pages`, refresh the browser (or rely on `mkdocs serve` auto-reload).

## Deploy to GitHub Pages

1. Update `site_url` and `repo_url` in `mkdocs.yml` with your repository URL.
2. Run:

```bash
mkdocs gh-deploy
```

Or use the included GitHub Actions workflow (`.github/workflows/docs.yml`) on push to `main`.

## Deploy elsewhere

Build static files and upload the `site/` folder to any static host (Netlify, S3, nginx, etc.):

```bash
mkdocs build
# Deploy contents of site/
```

## Screenshots

Guides include UI screenshots from `docs/assets/images/screenshots/`. To refresh them:

1. Start the frontend with mock API: `cd frontend && npm run dev`
2. Run: `cd docs/scripts && node capture-screenshots.mjs`

Requires Playwright (`npm install` in `docs/scripts/` once).

## Customize theme

Edit `mkdocs.yml`:

- `theme.palette` — colors and dark/light mode
- `site_name`, `site_description` — branding
- `extra.social` — footer links

Custom CSS: `docs/stylesheets/extra.css`
