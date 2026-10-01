# Play / Learn — portfolio starter

A personal portfolio for a graduate student working at the intersection of computer science, physics, and games for learning. React + TypeScript + Vite serve the frontend; Flask exposes a small read-only content API and serves the production build. No database, account, API key, or external font service is required. `backend/requirements.txt` records direct dependencies; `backend/requirements-lock.txt` pins the tested Python environment. The frontend uses its committed npm lockfile.

## Run locally

Requirements: Node.js 22+ and Python 3.9+.

From this repository's root:

```sh
npm --prefix frontend ci
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements-lock.txt
python -m flask --app backend.app run --debug --port 5001
```

In a second terminal, also at the repository root:

```sh
npm run dev
```

Open http://127.0.0.1:5173. Keep both terminals running. Vite forwards `/api` to Flask on port 5001 (avoiding the common macOS AirPlay conflict on port 5000). React refreshes on edits; Flask reloads Python changes; refreshing the page picks up JSON edits. Ctrl+C stops either server.

## Personalize

Edit **backend/content.json**:

- `profile.name`: your display name (currently deliberately set to `Your name`).
- `profile.intro`: your biography. The supplied education is reflected in the starter; no institution or graduation date is assumed.
- `profile.email`: your real address. A blank value shows “Contact details coming soon” instead of a broken mail link.
- `profile.links`: optional objects such as `{ "label": "GitHub", "url": "https://github.com/YOUR_USERNAME" }`. Use trusted HTTPS URLs.
- `projects`: replace the three explicitly labeled fictional examples with your work. Give each a unique `id`. Categories automatically populate the filter buttons.
- `question`, `approach`, and `reflection`: the case-study text. `tags` is an array of short strings; `art` can be `orbit`, `tiles`, or `wave`. Set `sample` to `false` and update `year` after replacing the example.

The sample-collection note disappears automatically once every project has `sample: false`. `frontend/src/App.tsx` contains the education labels, introductory headline, and contact copy. Edit the title and description in `frontend/index.html`. Update the footer name through the JSON profile.

Colors are CSS variables at the top of `frontend/src/styles.css`. The visuals are locally rendered mathematical diagrams and typographic compositions, not copied reference artwork. To use real project screenshots, place your images in `frontend/public/images/` and extend the `Project` interface and `ProjectArt` component to accept an image path and descriptive alt text.

## How it works

```text
Browser → Vite (development) → /api/portfolio → Flask → content.json
Browser → Flask (production) → frontend/dist + /api/portfolio
```

- `frontend/src/App.tsx`: typed data model, API state, filters, accessible native dialog, and interactive orbital visualization.
- `frontend/src/styles.css`: design tokens, responsive layout, focus styles, and reduced-motion support.
- `frontend/vite.config.ts`: development API proxy.
- `backend/app.py`: testable Flask application factory, API, and safe static serving.
- `backend/tests/test_app.py`: API and static-file safety tests.
- `.vscode/launch.json`: debugger configurations for Flask and browser React code.

The content API is read-only. There is no contact submission, admin interface, database, or analytics. The orbital control changes the wireframe geometry; it is a visual exploration, not a physically accurate simulation. Profile `role` is available in the data model for future use; displayed introductory copy is in App.tsx.

## Debugging

Select `.venv` as the Python interpreter in VS Code, install the Python Debugger extension, and run **Flask API (port 5001)**. Then start `npm run dev` and run **React (start npm run dev first)**. Set breakpoints in `backend/app.py` or `frontend/src/App.tsx`. The Vite development server includes source maps automatically.

If projects do not load, visit http://127.0.0.1:5001/api/health. Confirm Flask is running, inspect its terminal for invalid JSON, and inspect `/api/portfolio` in the browser Network panel. The frontend displays a retry state on failure, rather than silently substituting sample data. If port 5173 is occupied, stop the conflicting process or change Vite's configured port and the debugger URL.

## Verify

```sh
npm run build
.venv/bin/python -m unittest discover -s backend/tests -v
```

The build includes strict TypeScript checking. Browser checks should cover category filtering, dialog opening/closing (Escape and the close button), the orbital slider, keyboard navigation, and mobile layout. Requests for unknown API endpoints return 404; missing/invalid content returns a structured 503 error.

## Run the production build

```sh
npm run build
source .venv/bin/activate
# macOS/Linux; on Windows use a WSGI server such as Waitress instead.
gunicorn --bind 127.0.0.1:5001 backend.app:app
```

Open http://127.0.0.1:5001. Flask now serves the compiled assets and API from one origin. For public hosting, use a Python-capable platform with Node available during the build, bind the WSGI server to the platform's assigned host/port, and let the platform terminate HTTPS. Do not expose Flask's development debugger publicly. GitHub Pages deployment is configured separately below.

## Design references

The [New York Games Week site](https://nygamesweek.com/) informed the editorial showcase, bold section rhythm, and category-based browsing. The supplied reference images informed the amber-on-black instrument diagrams and orange/cream poster palette. Their characters, artwork, and text are not reproduced. No assertions in the attached references were treated as task instructions.

### Verification notes

The starter was checked with a successful production build, four backend tests, and browser checks for project filtering, modal opening/Escape dismissal and focus return, slider updates, and layouts at desktop and 390px mobile widths. No browser warnings or errors were observed during the production checks. The initial package installation stalled while building optional macOS `fsevents`; it was completed with `npm --prefix frontend install --ignore-scripts`. Both the production build and Vite development server then ran successfully. If the same optional build stalls on your machine, that flag is a possible workaround; verify `npm run build` afterward.

## GitHub Pages

The `main` branch deploys through `.github/workflows/pages.yml`. Set repository **Settings → Pages → Source** to **GitHub Actions**. Push updates to `main` and check the Actions tab. The published URL is https://cntipping.github.io/CeciliaTipping/.

The Pages build exports `backend/content.json` as `portfolio.json` and uses `/CeciliaTipping/` as its asset base. No Python server is needed on Pages. Continue editing `backend/content.json` for content updates. Normal development and the default production build still use Flask.

Preview locally:

```sh
npm --prefix frontend run build:pages
npm --prefix frontend run preview -- --base=/CeciliaTipping/
```

Open http://127.0.0.1:4173/CeciliaTipping/.
