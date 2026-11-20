# Sterling Research Explorer

A modern Angular application for searching and exploring academic research papers using the [CORE API](https://core.ac.uk/) — the world's largest aggregator of open access research.

Built as part of the SterlingCode senior software engineering assessment.

---

## Features

- **Boolean Keyword Search** — Full support for CORE's boolean query syntax (e.g. `drone AND (package OR delivery)`, `machine learning OR deep learning NOT supervised`)
- **Configurable Results Limit** — Choose how many papers to retrieve (1–100)
- **Paper Cards** — Each result displays title (linked to full paper), authors, year, publisher/journal, truncated abstract with expand toggle, citation count, and DOI link
- **Publication Year Chart** — Interactive Chart.js bar chart aggregating results by publication year — visualise research trends for any query
- **Responsive Design** — Works cleanly on desktop and tablet
- **Loading Skeletons** — Shimmer placeholder cards during API requests
- **Error Handling** — Graceful error states with actionable messages (e.g. missing API key notice)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 22 (standalone components, signals, OnPush CD) |
| Language | TypeScript |
| Styles | SCSS with CSS custom properties |
| Charts | Chart.js 4 |
| HTTP | Angular `HttpClient` with `withFetch()` |
| API | [CORE API v3](https://api.core.ac.uk/docs/v3) |

---

## Getting Started

### Prerequisites

- Node.js v22+ (v26 recommended)
- npm v10+
- Angular CLI v22+

```bash
npm install -g @angular/cli@latest
```

### 1. Get a Free CORE API Key

The app works without a key but is rate-limited. For best results:

1. Register at [https://core.ac.uk/services/api](https://core.ac.uk/services/api)
2. Copy your API key

### 2. Configure the API Key

Open `src/environments/environment.ts` and add your key:

```ts
export const environment = {
  production: false,
  coreApiUrl: 'https://api.core.ac.uk/v3',
  coreApiKey: 'YOUR_API_KEY_HERE'   // ← paste your key here
};
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Dev Server

```bash
ng serve
```

Navigate to `http://localhost:4200`. The app hot-reloads on file changes.

### 5. Build for Production

```bash
ng build
```

Output is placed in `dist/sterling-research-explorer/browser/`.

---

## Boolean Search Syntax

The search bar supports CORE's full boolean query language:

| Syntax | Example |
|--------|---------|
| AND | `drone AND delivery` |
| OR | `machine learning OR deep learning` |
| NOT | `climate NOT economics` |
| Grouping | `drone AND (package OR delivery)` |
| Phrase | `"neural network"` |
| Field search | `title:drone AND author:smith` |

See the [CORE Search Guide](https://api.core.ac.uk/docs/v3#section/How-to-search) for the full syntax reference.

---

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── search-bar/          # Query input + results limit control
│   │   ├── paper-card/          # Individual paper display card
│   │   └── papers-chart/        # Chart.js bar chart by publication year
│   ├── models/
│   │   └── paper.model.ts       # TypeScript interfaces
│   ├── services/
│   │   └── core-api.service.ts  # CORE API HTTP client
│   ├── app.ts                   # Root component (signals-based state)
│   ├── app.html                 # Root template
│   ├── app.scss                 # Component styles
│   └── app.config.ts            # Angular bootstrap config
├── environments/
│   ├── environment.ts           # Dev config
│   └── environment.prod.ts      # Prod config
└── styles.scss                  # Global styles
```

---

## Extras Beyond Requirements

- **Angular Signals** — State managed with `signal()` and `computed()` following Angular's modern reactivity model
- **OnPush Change Detection** — All components use `ChangeDetectionStrategy.OnPush` for maximum rendering performance
- **Show More / Less** — Abstract text toggle on paper cards to keep the UI compact
- **Citation Count Badge** — Visually highlights highly-cited papers
- **Authors Overflow** — Shows first 3 authors then `+N more` to prevent card overflow
- **Keyboard Support** — Press Enter in the search field to trigger a search

---

## License

MIT
