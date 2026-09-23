# AGENTS.md

## Project overview

Lumina Wealth — client-side **investment philosophy verification lab** for advanced retail investors.
Personal trades + public 13F holdings → explainable metrics and comparisons. All data in IndexedDB (no backend). Deployed to Vercel.

## Tech stack

- React 19 + TypeScript 6 + Vite 8
- Tailwind CSS 4 (via `@tailwindcss/vite` plugin, NOT PostCSS)
- ECharts 6 (via `echarts-for-react`)
- React Router 7 for client-side routing
- `idb` library for IndexedDB
- Lucide React for icons
- `uuid` for transaction ids

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Typecheck (tsc -b) then vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

No test framework. No Prettier.

## Path aliases

`@/` maps to `src/` — configured in both `vite.config.ts` and `tsconfig.app.json`.

## TypeScript quirks

- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- `erasableSyntaxOnly: true` — no `enum`, no `namespace`, no parameter properties
- `noUnusedLocals: true` and `noUnusedParameters: true` — unused vars fail typecheck

## Project structure

```
src/
  main.tsx                 # Entry
  App.tsx                  # Router (Dashboard, Transactions, Analysis, Ideas, Compare, Settings)
  index.css                # Tailwind + dark theme
  db/index.ts              # IndexedDB (transactions, celebrities)
  types/index.ts           # Shared types
  hooks/usePortfolio.ts    # DB + holdings/summary calculations
  utils/
    portfolio.ts           # Holdings, PnL, analytics, formatters
    demoData.ts            # Demo transactions; re-exports real celebrity data
    celebrityData.ts       # Bundled real SEC 13F holdings
    csvImport.ts           # Broker CSV parse / map / dedupe
    ideas.ts               # Philosophy checks (concentration, turnover)
  pages/                   # Route pages
  components/
    layout/                # AppLayout, Sidebar, BrandLogo
    charts/                # ECharts wrappers
    dashboard/             # Summary + holdings list
    transactions/          # Form, timelines, CSV dialog
assets/13f/                # Raw SEC 13F XML + summary JSON (provenance)
LEARNING.md                # Learning resources
README.md                  # Product positioning
```

## Architecture notes

- **Data flow**: IndexedDB → `usePortfolio` → `calculateHoldings` / `calculatePortfolioSummary` → pages
- **Cost basis**: Moving average in `utils/portfolio.ts` (README may still say FIFO in places — trust code)
- **PnL colors**: Chinese convention — red = gain, green = loss
- **No global store** — hooks + props only
- **Celebrity data**: Prefer `REAL_CELEBRITY_HOLDINGS` from `utils/celebrityData.ts` (SEC 13F); Compare page refreshes IndexedDB cache from it
- **Demo data**: `loadDemo()` clears real transactions first

## UI conventions

- Dark theme only
- Chinese UI labels
- Currency: 万/亿 suffixes via `formatCurrency`
- CNY / USD / HKD

## Build & deploy

- Vercel SPA rewrites (`vercel.json`)
- GitHub Pages workflow (`.github/workflows/pages.yml`)
- Build output: `dist/`
- No env vars (all client-side)
