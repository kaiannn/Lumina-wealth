# Lumina Wealth - 个人投资持仓可视化分析平台

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.5-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6.0.2-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.0.10-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-4.2.4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/ECharts-6.0.0-AA344D?style=for-the-badge&logo=apacheecharts" alt="ECharts" />
</p>

<p align="center">
  <strong>专业的个人投资持仓管理与可视化分析工具</strong>
</p>

<p align="center">
  <a href="#-项目简介">项目简介</a> •
  <a href="#-核心功能">核心功能</a> •
  <a href="#-技术栈">技术栈</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-项目结构">项目结构</a> •
  <a href="#-开发计划">开发计划</a> •
  <a href="#-贡献指南">贡献指南</a>
</p>

<p align="center">
  <img src="public/favicon.svg" alt="Lumina Wealth Logo" width="120" />
</p>

<p align="center">
  <small>🌐 <a href="README_EN.md">English Version</a></small>
</p>

## 📋 项目简介

**Lumina Wealth** 是一个现代化的个人投资持仓可视化分析平台，旨在为个人投资者提供专业级的持仓管理、收益分析和投资行为洞察工具。

### 🎯 设计理念
- **财经严谨性**：采用正确的财经口径，区分已实现/未实现收益，避免误导性指标
- **数据透明**：明确标注数据来源和计算口径，确保用户理解数据含义
- **本地优先**：所有数据存储在浏览器本地，保护用户隐私
- **专业可视化**：基于ECharts提供丰富的图表展示，支持深度交互分析

### ✨ 核心价值
- 帮助投资者清晰了解持仓结构和成本分布
- 提供专业的收益分析和投资行为评估
- 支持多维度对比分析，发现投资风格差异
- 为投资决策提供数据支持和可视化洞察

## 🚀 核心功能

### 📊 投资总览
- **实时持仓概览**：展示总资产、总收益、已实现/未实现收益等关键指标
- **持仓结构分析**：通过树状图和饼图可视化资产配置和行业分布
- **持仓列表**：详细展示每只标的的成本、市值、收益率等信息

### 📈 持仓分析
- **成本分析**：展示建仓形状、平均成本线和价格轨迹
- **收益拆分**：清晰区分已实现收益和未实现收益
- **交易回放**：通过时间轴回放交易行为，理解持仓形成过程

### 🔍 对比分析
- **持仓对比**：支持与名人持仓或自定义组合进行对比
- **重合度分析**：计算标的重合率和权重相似度
- **风格识别**：通过雷达图展示投资风格差异

### 📝 交易管理
- **交易记录**：完整的买入/卖出交易记录管理
- **成本计算**：基于FIFO原则自动计算成本基础
- **数据导入**：支持JSON格式数据导入导出

### 📱 响应式设计
- 完美适配桌面端和移动端
- 深色主题设计，保护视力
- 流畅的动画和交互体验

## 🛠️ 技术栈

### 前端框架
- **React 19** - 现代化的React框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 极速的开发构建工具

### UI & 样式
- **Tailwind CSS 4** - 实用优先的CSS框架
- **Lucide React** - 精美的图标库
- **ECharts** - 强大的可视化图表库

### 数据管理
- **IndexedDB** - 浏览器本地数据库
- **React Router** - 客户端路由管理
- **Day.js** - 轻量级日期处理库

### 开发工具
- **ESLint** - 代码质量检查
- **TypeScript ESLint** - TypeScript代码检查
- **React Compiler** - React性能优化

## 🚦 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/yourusername/holdingsViz.git
cd holdingsViz
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
```

4. **访问应用**
打开浏览器访问 [http://localhost:5173](http://localhost:5173)

### 构建生产版本
```bash
npm run build
# 或
yarn build
```

### 预览生产版本
```bash
npm run preview
# 或
yarn preview
```

## 📁 项目结构

```
holdingsViz/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React组件
│   │   ├── charts/        # 图表组件
│   │   ├── dashboard/     # 仪表板组件
│   │   ├── layout/        # 布局组件
│   │   └── transactions/  # 交易组件
│   ├── db/                # 数据库相关
│   ├── hooks/             # 自定义Hooks
│   ├── pages/             # 页面组件
│   ├── types/             # TypeScript类型定义
│   ├── utils/             # 工具函数
│   ├── App.tsx            # 应用根组件
│   ├── index.css          # 全局样式
│   └── main.tsx           # 应用入口
├── package.json           # 项目配置
├── vite.config.ts         # Vite配置
├── tsconfig.json          # TypeScript配置
└── README.md              # 项目说明
```

## 🎯 开发计划

### ✅ 已完成
- [x] 基础项目架构搭建
- [x] 核心数据模型设计
- [x] 主要页面开发
- [x] 基础图表可视化
- [x] 财经口径修正
- [x] 收益拆分功能
- [x] 交易回放时间轴
- [x] 持仓对比功能

### 🔄 进行中
- [ ] 接入实时行情接口
- [ ] 多币种汇率支持
- [ ] 高级风险分析指标
- [ ] 投资行为识别
- [ ] 移动端优化

### 📋 计划中
- [ ] 多账户管理
- [ ] 现金分红支持
- [ ] 拆股/送股处理
- [ ] 行业分析模块
- [ ] 投资报告生成

## 🤝 贡献指南

我们欢迎各种形式的贡献！如果您想为项目做出贡献，请遵循以下步骤：

### 报告问题
1. 在GitHub Issues中搜索是否已有类似问题
2. 如果没有，请创建新Issue，详细描述问题
3. 提供复现步骤、预期行为和实际行为

### 提交代码
1. Fork项目到您的账户
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

### 开发规范
- 遵循TypeScript类型定义
- 使用ESLint进行代码检查
- 添加必要的注释和文档
- 确保代码通过所有测试

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢以下开源项目的贡献：
- [React](https://reactjs.org/) - 用于构建用户界面的JavaScript库
- [Vite](https://vitejs.dev/) - 下一代前端工具
- [ECharts](https://echarts.apache.org/) - 强大的可视化图表库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架

## 📞 联系方式

如有问题或建议，请通过以下方式联系我们：
- 提交 [GitHub Issue](https://github.com/yourusername/holdingsViz/issues)
- 发送邮件至 [kaiannlee1@gmail.com](mailto:kaiannlee1@gmail.com)

---

<p align="center">
  Made with ❤️ by the kai
</p>

<p align="center">
  <sub>如果这个项目对您有帮助，请给个 ⭐️ 支持我们！</sub>
</p>