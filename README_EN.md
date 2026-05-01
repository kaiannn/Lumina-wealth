# Lumina Wealth - Personal Investment Holdings Visualization Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.5-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6.0.2-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.0.10-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-4.2.4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/ECharts-6.0.0-AA344D?style=for-the-badge&logo=apacheecharts" alt="ECharts" />
</p>

<p align="center">
  <strong>Professional Personal Investment Holdings Management & Visualization Tool</strong>
</p>

<p align="center">
  <a href="#-introduction">Introduction</a> •
  <a href="#-core-features">Core Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-development-plan">Development Plan</a> •
  <a href="#-contributing">Contributing</a>
</p>

<p align="center">
  <img src="public/favicon.svg" alt="Lumina Wealth Logo" width="120" />
</p>

<p align="center">
  <small>🌐 <a href="README.md">中文版本</a></small>
</p>

## 📋 Introduction

**Lumina Wealth** is a modern personal investment holdings visualization and analysis platform designed to provide professional-grade portfolio management, profit/loss analysis, and investment behavior insights for individual investors.

### 🎯 Design Philosophy
- **Financial Accuracy**: Adopts proper financial terminology, distinguishes between realized/unrealized profits, and avoids misleading metrics
- **Data Transparency**: Clearly labels data sources and calculation methodologies to ensure users understand data meanings
- **Local-First**: All data is stored locally in the browser, protecting user privacy
- **Professional Visualization**: Rich chart presentations based on ECharts with deep interactive analysis capabilities

### ✨ Core Value
- Helps investors clearly understand portfolio structure and cost distribution
- Provides professional profit/loss analysis and investment behavior evaluation
- Supports multi-dimensional comparative analysis to discover investment style differences
- Offers data support and visual insights for investment decision-making

## 🚀 Core Features

### 📊 Investment Overview
- **Real-time Portfolio Overview**: Displays key metrics like total assets, total returns, realized/unrealized profits
- **Portfolio Structure Analysis**: Visualizes asset allocation and sector distribution through treemap and pie charts
- **Holdings List**: Detailed display of cost, market value, return rate for each position

### 📈 Holdings Analysis
- **Cost Analysis**: Shows position building patterns, average cost lines, and price trajectories
- **Profit/Loss Breakdown**: Clearly distinguishes between realized and unrealized profits
- **Transaction Playback**: Replays trading behavior through timeline to understand position formation

### 🔍 Comparative Analysis
- **Portfolio Comparison**: Supports comparison with celebrity holdings or custom portfolios
- **Overlap Analysis**: Calculates symbol overlap rate and weight similarity
- **Style Recognition**: Displays investment style differences through radar charts

### 📝 Transaction Management
- **Transaction Records**: Complete buy/sell transaction record management
- **Cost Calculation**: Automatically calculates cost basis using FIFO principle
- **Data Import/Export**: Supports JSON format data import and export

### 📱 Responsive Design
- Perfectly adapts to desktop and mobile devices
- Dark theme design for eye protection
- Smooth animations and interactive experiences

## 🛠️ Tech Stack

### Frontend Framework
- **React 19** - Modern React framework
- **TypeScript** - Type-safe JavaScript superset
- **Vite** - Next-generation frontend build tool

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **ECharts** - Powerful visualization chart library

### Data Management
- **IndexedDB** - Browser local database
- **React Router** - Client-side routing management
- **Day.js** - Lightweight date processing library

### Development Tools
- **ESLint** - Code quality checking
- **TypeScript ESLint** - TypeScript code checking
- **React Compiler** - React performance optimization

## 🚦 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation Steps

1. **Clone the Repository**
```bash
git clone https://github.com/kaiannn/Lumina-wealth.git
cd Lumina-wealth
```

2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

3. **Start Development Server**
```bash
npm run dev
# or
yarn dev
```

4. **Access the Application**
Open your browser and visit [http://localhost:5173](http://localhost:5173)

### Build for Production
```bash
npm run build
# or
yarn build
```

### Preview Production Build
```bash
npm run preview
# or
yarn preview
```

## 📁 Project Structure

```
Lumina-wealth/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── charts/        # Chart components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── layout/        # Layout components
│   │   └── transactions/  # Transaction components
│   ├── db/                # Database related
│   ├── hooks/             # Custom Hooks
│   ├── pages/             # Page components
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Root application component
│   ├── index.css          # Global styles
│   └── main.tsx           # Application entry point
├── package.json           # Project configuration
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation (Chinese)
```

## 🎯 Development Plan

### ✅ Completed
- [x] Basic project architecture setup
- [x] Core data model design
- [x] Main page development
- [x] Basic chart visualization
- [x] Financial terminology corrections
- [x] Profit/Loss breakdown functionality
- [x] Transaction playback timeline
- [x] Portfolio comparison functionality

### 🔄 In Progress
- [ ] Real-time market data API integration
- [ ] Multi-currency exchange rate support
- [ ] Advanced risk analysis metrics
- [ ] Investment behavior recognition
- [ ] Mobile optimization

### 📋 Planned
- [ ] Multi-account management
- [ ] Cash dividend support
- [ ] Stock split/bonus share handling
- [ ] Sector analysis module
- [ ] Investment report generation

## 🤝 Contributing

We welcome contributions of all kinds! If you'd like to contribute to the project, please follow these steps:

### Reporting Issues
1. Search GitHub Issues to see if a similar issue already exists
2. If not, create a new Issue with detailed description
3. Provide reproduction steps, expected behavior, and actual behavior

### Submitting Code
1. Fork the project to your account
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

### Development Standards
- Follow TypeScript type definitions
- Use ESLint for code checking
- Add necessary comments and documentation
- Ensure code passes all tests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Thanks to the following open-source projects:
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Vite](https://vitejs.dev/) - Next-generation frontend tool
- [ECharts](https://echarts.apache.org/) - Powerful visualization chart library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 📞 Contact

For questions or suggestions, please contact us:
- Submit a [GitHub Issue](https://github.com/kaiannn/Lumina-wealth/issues)
- Send email to [kaiannlee1@gmail.com](mailto:kaiannlee1@gmail.com)

---

<p align="center">
  Made with ❤️ by kai
</p>

<p align="center">
  <sub>If this project helps you, please give it a ⭐️ to support us!</sub>
</p>