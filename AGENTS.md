# AGENTS.md

## Project overview

Lumina Wealth — a client-side personal investment portfolio visualization tool. All data lives in IndexedDB (no backend). Deployed to Vercel.

## Tech stack

- React 19 + TypeScript 6 + Vite 8
- Tailwind CSS 4 (via `@tailwindcss/vite` plugin, NOT PostCSS)
- ECharts 6 (via `echarts-for-react`)
- React Router 7 for client-side routing
- `idb` library for IndexedDB
- Lucide React for icons

## Commands

```bash
npm run dev        # Start dev server (localhost:5173)
npm run build      # Typecheck (tsc -b) then vite build
npm run lint       # ESLint on **/*.{ts,tsx}
npm run preview    # Preview production build
```

No test framework is configured. No Prettier.

## Path aliases

`@/` maps to `src/` — configured in both `vite.config.ts` and `tsconfig.app.json`.

## TypeScript quirks

- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- `erasableSyntaxOnly: true` — no `enum`, no `namespace`, no parameter properties
- `noUnusedLocals: true` and `noUnusedParameters: true` — unused vars will fail typecheck

## Project structure

```
src/
  main.tsx          # Entry point
  App.tsx           # Router setup (5 routes)
  index.css         # Tailwind import + dark theme base styles
  db/index.ts       # IndexedDB via idb — all persistence lives here
  types/index.ts    # All TypeScript interfaces (Transaction, Holding, etc.)
  utils/
    portfolio.ts    # Core calculations: holdings, PnL, analytics
    demoData.ts     # Random demo transaction generator
    visualizationAdapter.ts  # ECharts config adapters (user level, theme, responsive)
  hooks/
    usePortfolio.ts # Central data hook — wraps DB + calculations
  services/
    InsightGenerator.ts
  pages/            # Route-level components (Dashboard, Transactions, Analysis, Compare, Settings)
  components/
    charts/         # ECharts wrapper components
    dashboard/      # Dashboard widgets
    layout/         # AppLayout (sidebar + outlet)
    transactions/   # Transaction forms/lists
    visualization/  # Advanced visualization components
```

## Architecture notes

- **Data flow**: IndexedDB → `usePortfolio` hook → `calculateHoldings`/`calculatePortfolioSummary` → components
- **Cost basis**: FIFO method for realized PnL calculation (`utils/portfolio.ts`)
- **PnL colors follow Chinese market convention**: red = positive/gain, green = negative/loss (opposite of Western convention)
- **No global state management** — React hooks + props drilling. The `stores/` directory exists but is empty.
- **Demo data**: `loadDemo()` in `usePortfolio` clears all real data first

## UI conventions

- Dark theme only (`html { color-scheme: dark }`, body classes: `bg-gray-950 text-gray-100`)
- Chinese-language UI (labels, tooltips, README)
- Currency formatting uses 万/亿 suffixes for large numbers (`formatCurrency` in `utils/portfolio.ts`)
- Supports CNY, USD, HKD currencies

## Build & deploy

- Vercel deployment with SPA rewrites (`vercel.json`)
- Build output: `dist/`
- No environment variables needed (all client-side)
