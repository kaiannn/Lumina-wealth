# Lumina Wealth

<div align="center">

<img src="public/favicon.svg" width="80" height="80" alt="Lumina Wealth Logo" />

**Investment philosophy verification lab for advanced retail investors**

[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![ECharts](https://img.shields.io/badge/ECharts_6-AA344D?style=flat-square&logo=apacheecharts&logoColor=white)](https://echarts.apache.org/)

[Vercel](https://lumina-wealth.vercel.app) · [GitHub Pages](https://kaiannn.github.io/Lumina-wealth/) · [Local Dev](#quick-start)

</div>

---

## What it is

Not another trade ledger.

Lumina Wealth puts your trades, position-building rhythm, and institutional (13F) holdings on one timeline, then uses explainable metrics to **test whether common investment ideas fit your account**.

All data stays in browser IndexedDB — no backend, nothing uploaded.

See also: [README (中文)](./README.md) · [LEARNING.md](./LEARNING.md)

## Features

- **Overview** — Totals, realized/unrealized P&L, holdings treemap
- **Trades** — Buy/sell records, cost-basis P&L
- **CSV import** — Broker fills, field mapping, preview & dedupe
- **Philosophy checks** — Concentration, turnover discipline vs your data
- **Whale compare** — Real SEC 13F structure fingerprint, radar, overlap
- **Import/Export** — JSON backup
- **Dark UI**

## Quick start

```bash
git clone https://github.com/kaiannn/Lumina-wealth.git
cd Lumina-wealth
npm install
npm run dev
```

Open http://localhost:5173.

## Tech stack

- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS 4** — styling
- **ECharts 6** — charts
- **idb** — IndexedDB
- **react-router-dom** — routing
- **lucide-react** / **uuid**

## Structure

```
src/pages, components, db, hooks, types, utils
assets/13f/   # raw SEC 13F provenance
LEARNING.md   # study resources
AGENTS.md     # engineering notes for agents
```

## License

[MIT](LICENSE)
