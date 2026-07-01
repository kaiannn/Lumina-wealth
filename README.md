# Lumina Wealth

<div align="center">

<img src="public/favicon.svg" width="80" height="80" alt="Lumina Wealth Logo" />

**个人投资持仓记录与可视化**

[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![ECharts](https://img.shields.io/badge/ECharts_6-AA344D?style=flat-square&logo=apacheecharts&logoColor=white)](https://echarts.apache.org/)

[Vercel](https://lumina-wealth.vercel.app) · [GitHub Pages](https://kaiannn.github.io/Lumina-wealth/) · [本地开发](#快速开始)

</div>

---

## 这是什么

一个纯本地的投资持仓管理工具。记录交易、看持仓结构、分析收益。

所有数据存在浏览器 IndexedDB，没有后端，不会上传。

## 功能

- **持仓总览** — 总资产、已实现/未实现收益、持仓分布树状图
- **交易记录** — 买入/卖出管理，FIFO 成本基础自动计算
- **持仓分析** — 建仓成本线、收益拆分、交易回放时间轴
- **对比分析** — 与名人持仓对比，重合度和风格雷达图
- **数据导入导出** — JSON 格式，方便备份迁移
- **深色主题** — 默认深色，适配桌面和移动端

## 快速开始

```bash
git clone https://github.com/kaiannn/Lumina-wealth.git
cd Lumina-wealth
npm install
npm run dev
```

打开 http://localhost:5173。

> 内置 Demo 数据，设置页一键加载，方便体验。

## 技术栈

- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS 4** — 样式
- **ECharts 6** — 图表（echarts-for-react）
- **idb** — IndexedDB 封装
- **react-router-dom** — 路由
- **dayjs** — 日期处理
- **lucide-react** — 图标

## 项目结构

```
src/
├── pages/              # 页面：Dashboard、Transactions、Analysis、Compare、Settings
├── components/
│   ├── charts/         # ECharts 图表组件
│   ├── dashboard/      # 仪表盘组件
│   ├── layout/         # 布局（侧边栏 + 路由出口）
│   └── transactions/   # 交易表单和列表
├── db/                 # IndexedDB 操作
├── hooks/              # usePortfolio — 核心数据 hook
├── types/              # TypeScript 类型定义
├── utils/              # 持仓计算、格式化、Demo 数据
└── services/           # 业务服务
```

## License

[MIT](LICENSE)
