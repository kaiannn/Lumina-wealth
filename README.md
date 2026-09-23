# Lumina Wealth

<div align="center">

<img src="public/favicon.svg" width="80" height="80" alt="Lumina Wealth Logo" />

**面向进阶个人投资者的理念验证实验室**

[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![ECharts](https://img.shields.io/badge/ECharts_6-AA344D?style=flat-square&logo=apacheecharts&logoColor=white)](https://echarts.apache.org/)

[Vercel](https://lumina-wealth.vercel.app) · [GitHub Pages](https://kaiannn.github.io/Lumina-wealth/) · [本地开发](#快速开始)

</div>

---

## 这是什么

不是又一个投资流水账本。

Lumina Wealth 把你的交易记录、建仓节奏和大牛持仓放在同一套时间线上，用可解释的指标与轻量分析，**验证公认投资理念是否适用于你自己的账户**。

所有数据存在浏览器 IndexedDB，没有后端，不会上传。

## 核心目标

**用小模型做低阶数据分析与对比，用于学习金融数据分析。**

更具体地说：

| 维度 | 含义 |
|------|------|
| **学什么** | 金融数据分析的基本范式：数据清洗 → 指标构造 → 对照/假设检验 → 可视化叙事 |
| **用什么模型** | 轻量、可解释的「小模型」：统计特征、相似度/距离、聚类、异常检测、简单回归/相关；而不是黑盒荐股或价格预测 |
| **分析什么** | ① 你自己的交易行为（换手、集中、持仓粘性）② 公开机构持仓（SEC 13F 等）的结构与季度变化 ③ 二者对照 + 理念假设验证 |
| **不做什么** | 不做实盘跟单、不承诺收益、不做不可解释的行情预测；结论仅供学习与复盘 |

### 为什么这样定

- **低阶方法足够出洞察**：风格指纹、权重重合、HHI/熵、季度换手，都是可复算、可讲清的。
- **数据源免费且可审计**：个人 CSV + SEC EDGAR 13F，不依赖付费行情也能跑通主路径。
- **和「理念验证」产品线一致**：每个分析卡都应回答一个可检验的问题，而不是堆算法名词。

### 成功标准（学习导向）

1. 能独立跑通：导入真实数据 → 算出指标 → 图表对比 → 写出一段结论。
2. 每个「模型」能用一句话说清：输入是什么、输出是什么、假设是什么。
3. 换一份数据（另一季度 13F / 另一份成交单）结论仍可复现。

> 若目标是量化交易或择时策略，本项目不合适；更适合当作**金融数据分析的练习场 + 个人复盘工具**。

### 学习资料

同类项目、书籍、数据源与学习路径见 **[LEARNING.md](./LEARNING.md)**。

## 目标用户

- 有实盘经验、习惯复盘的进阶散户
- 关注大牛调仓、想对照风格与节奏的学习者
- 希望本地隐私优先、拒绝云端账本的用户

> 只想「记一笔今天买了什么」的轻度记账场景，不是本项目主战场。

## 功能

- **持仓总览** — 总资产、已实现/未实现收益、持仓分布树状图
- **交易记录** — 买入/卖出管理，FIFO 成本基础自动计算
- **CSV 导入** — 券商成交单导入、字段映射、预览与去重
- **持仓分析** — 建仓成本线、收益拆分、交易回放时间轴
- **理念验证** — 集中度、换手纪律等理念假设 → 指标 → 你的数据对照
- **大牛对比** — 与名人持仓对比，重合度和风格雷达图
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
- **lucide-react** — 图标
- **uuid** — 交易 ID

## 项目结构

```
src/
├── pages/              # Dashboard、Transactions、Analysis、Ideas、Compare、Settings
├── components/
│   ├── charts/         # ECharts 图表
│   ├── dashboard/      # 总览组件
│   ├── layout/         # 侧边栏 / BrandLogo
│   └── transactions/   # 表单、时间线、CSV 导入
├── db/                 # IndexedDB
├── hooks/              # usePortfolio
├── types/              # 类型
└── utils/              # 组合计算、CSV、理念指标、真实 13F 数据
assets/13f/             # SEC 13F 原始 XML + 摘要（数据出处）
LEARNING.md             # 学习资料
AGENTS.md               # 给 AI 协作者的工程说明
```

## License

[MIT](LICENSE)
