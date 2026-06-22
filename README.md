# SafeDPI Simulator

A browser-based simulation of deploying national Digital Public Infrastructure (DPI) safely. Built as a static site for GitHub Pages — no build step required.

## Run locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In repo Settings → Pages, set source to the `main` branch, root folder.
3. Your simulator will be live at `https://<user>.github.io/<repo>/`.

## Structure

Flat structure — everything lives at the repo root:

- `index.html`, `scenarios.html`, `simulator.html`, `report.html` — the four pages of the flow.
- `countries.json`, `decisions.json`, `events.json`, `lifecycle.json`, `risks.json`, `safeguards.json`, `scenarios.json` — game data.
- `engine.js` — shared state (localStorage) and dashboard rendering.
- `report.js` — builds the final report and WhatsApp/email/LinkedIn share links.
- `style.css` — styling.

## Current scope

Only the **Digital ID** scenario is implemented. Other scenarios (Health Exchange, Payments, Education, Agriculture) are listed but marked "coming soon" — add entries to `decisions.json` keyed by scenario id to enable them.
