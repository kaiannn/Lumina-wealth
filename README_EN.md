# Lumina Wealth

<div align="center">

<img src="public/favicon.svg" width="80" height="80" alt="Lumina Wealth Logo" />

**Personal investment portfolio tracker & visualization**

[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![ECharts](https://img.shields.io/badge/ECharts_6-AA344D?style=flat-square&logo=apacheecharts&logoColor=white)](https://echarts.apache.org/)

[Vercel](https://lumina-wealth.vercel.app) · [GitHub Pages](https://kaiannn.github.io/Lumina-wealth/) · [Local Dev](#quick-start)

</div>

---

## What it does

A local-only portfolio tracker. Record trades, visualize holdings, analyze returns.

All data lives in the browser's IndexedDB. No backend, nothing leaves your device.

## Features

- **Portfolio overview** — Total assets, realized/unrealized P&L, holdings treemap
- **Trade records** — Buy/sell management, FIFO cost basis auto-calculation
- **Holdings analysis** — Cost basis chart, P&L breakdown, transaction playback timeline
- **Comparison** — Compare with celebrity portfolios, overlap & style radar charts
- **Import/Export** — JSON format, easy backup and migration
- **Dark theme** — Default dark, responsive on desktop and mobile

## Quick Start

```bash
git clone https://github.com/kaiannn/Lumina-wealth.git
cd Lumina-wealth
npm install
npm run dev
```

Open http://localhost:5173.

> Demo data is built in. Load it from Settings to try things out.

## Tech Stack

- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS 4** — Styling
- **ECharts 6** — Charts (echarts-for-react)
- **idb** — IndexedDB wrapper
- **react-router-dom** — Routing
- **dayjs** — Date handling
- **lucide-react** — Icons

## Project Structure

```
src/
├── pages/              # Dashboard, Transactions, Analysis, Compare, Settings
├── components/
│   ├── charts/         # ECharts chart components
│   ├── dashboard/      # Dashboard widgets
│   ├── layout/         # Layout (sidebar + route outlet)
│   └── transactions/   # Transaction forms & lists
├── db/                 # IndexedDB operations
├── hooks/              # usePortfolio — core data hook
├── types/              # TypeScript type definitions
├── utils/              # Portfolio calculations, formatters, demo data
└── services/           # Business services
```

## License

[MIT](LICENSE)
