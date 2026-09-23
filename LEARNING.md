# 学习资料

配合项目核心目标：**用小模型做低阶数据分析与对比，用于学习金融数据分析**。  
按「先能跑通本项目 → 再扩展方法 → 再补投资认知」排序。链接以可访问的公开资源为主；部分站点可能有地区/反爬限制。

---

## 1. 官方数据与规范（本项目直接相关）

| 资料 | 说明 |
|------|------|
| [SEC EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces) | 13F / 提交历史 / XBRL 的官方 JSON API，**无需 key** |
| [Form 13F FAQ](https://www.sec.gov/rules-regulations/staff-guidance/division-investment-management-frequently-asked-questions) | 13F 是什么、谁必须交、字段含义 |
| [EDGAR 全文检索](https://www.sec.gov/edgar/search/) | 按公司/表格搜 13F-HR |
| [GitHub topic: 13f](https://github.com/topics/13f) · [portfolio-analysis](https://github.com/topics/portfolio-analysis) | 相关开源项目列表 |
| 本地 `assets/13f/` | 本仓库已抓取的伯克希尔 / ARK / 桥水 / Scion 多季 XML |

**练习：** 用 `data.sec.gov/submissions/CIK##########.json` 拉某机构 13F 列表 → 下载 info table XML → 算 Top3、HHI、季度权重变化。

---

## 2. 类似 / 可对照的开源项目

### 与本项目最像（持仓可视化 / 机构持仓）

| 项目 | 为何看 |
|------|--------|
| [leftmove/wallstreetlocal](https://github.com/leftmove/wallstreetlocal) | 开源「机构持仓跟踪站」，SEC + 13F，产品形态参考 |
| [vibeyclaw/awesome-sec-filings](https://github.com/vibeyclaw/awesome-sec-filings) | SEC 披露（13F/10-K 等）工具与数据源清单 |
| [SEC-API-io/sec-api-python](https://github.com/SEC-API-io/sec-api-python) | EDGAR 封装思路（注意：部分能力付费） |
| [santoshlite/EigenLedger](https://github.com/santoshlite/EigenLedger) | 开源组合回测，学「假设 → 检验」 |
| [engineerinvestor/Portfolio-Analysis](https://github.com/engineerinvestor/Portfolio-Analysis) | DIY 投资者向的组合分析笔记/工具 |

### 方法与工程（小模型 / 可解释分析）

| 项目 | 为何看 |
|------|--------|
| [stefan-jansen/machine-learning-for-trading](https://github.com/stefan-jansen/machine-learning-for-trading) | 金融 ML 经典配套仓库，章节清晰，从数据到因子 |
| [stefan-jansen/alphalens-reloaded](https://github.com/stefan-jansen/alphalens-reloaded) | **因子 IC、分层收益**——低阶但极有用 |
| [stefan-jansen/pyfolio-reloaded](https://github.com/stefan-jansen/pyfolio-reloaded) | 组合绩效归因图 |
| [stefan-jansen/zipline-reloaded](https://github.com/stefan-jansen/zipline-reloaded) | 事件驱动回测框架 |
| [ranaroussi/quantstats](https://github.com/ranaroussi/quantstats) | 一行生成夏普/回撤/滚动收益报告 |
| [polakowo/vectorbt](https://github.com/polakowo/vectorbt) | 向量化回测，适合批量对比参数 |
| [microsoft/qlib](https://github.com/microsoft/qlib) | 微软量化平台；**看 pipeline 分层，不必一上来跑全量** |
| [scikit-learn](https://github.com/scikit-learn/scikit-learn) · [pandas](https://github.com/pandas-dev/pandas) | 聚类、异常检测、相关——本项目「小模型」底座 |

### 中文数据源（A 股 / 基金扩展时）

| 项目 | 说明 |
|------|------|
| [akfamily/akshare](https://github.com/akfamily/akshare) | 免费综合行情与公开数据接口 |
| [waditu/tushare](https://github.com/waditu/tushare) | A 股常用数据；部分接口需积分 |

---

## 3. 书籍（按优先级）

### A. 金融数据分析 / 组合（先读）

1. **《Python for Finance》— Yves Hilpisch**  
   数据、回测、衍生品入门，偏工程。
2. **《Quantitative Portfolio Management》— Michael Isichenko**  
   组合构建与统计思维（进阶）。
3. **《Active Portfolio Management》— Grinold & Kahn**  
   信息系数 IC、主动收益——和 alphalens 对照着看。
4. **《Expectations Investing》— Mauboussin & Rappaport**  
   从「预期」而不是「预测价格」思考，适合理念验证叙事。

### B. 投资理念（对照你的「理念验证」页）

5. **《The Intelligent Investor》— Benjamin Graham**  
6. **《Security Analysis》— Graham & Dodd**（工具书，可选读章节）  
7. **《Thinking, Fast and Slow》— Kahneman**  
   行为偏差 → 对应换手、追涨杀跌类指标。  
8. **《Financial Shenanigans》— Howard Schilit**  
   看报表陷阱；读 13F/新闻时更清醒。

### C. 方法进阶（可选）

9. **《Advances in Financial Machine Learning》— López de Prado**  
   交叉验证、标签构造；**重思路，不必照搬全部代码**。  
10. **《Quantitative Value》/《Quantitative Momentum》— Gray & Carlisle**  
    因子化价值/动量，和「可检验假设」一致。

---

## 4. 文章 / 论文 / 课程（短路径）

| 类型 | 资源 | 关联本项目 |
|------|------|------------|
| 因子基础 | [Alphalens 文档思路](https://github.com/stefan-jansen/alphalens-reloaded) | IC、分层、换手 |
| 机器学习课程 | [CMU 10-708 Probabilistic ML](https://www.cs.cmu.edu/~epxing/Class/10708-17/) | 聚类/概率模型 |
| 优化 | [Boyd Convex Optimization](https://web.stanford.edu/~boyd/cvxbook/) | 均值方差等（选读） |
| 13F 方法讨论 | 搜「13F replication」「13F lag」学术/博客 | 季度延迟与复制误差 |
| 行为金融 | Kahneman/Tversky 系列综述（任意导读文） | 换手与偏差指标 |
| HHI 定义 | Herfindahl–Hirschman Index（百科/教材） | 集中度卡 |

> 避免：只收藏「稳赚公式」类短视频；优先能复现的 notebook / 文档。

---

## 5. 视频与检索式学习

用搜索词比固定链接更耐用（平台链接常变）：

**YouTube / Bilibili 建议搜索：**

- `SEC 13F holdings analysis python`
- `portfolio risk analysis pandas`
- `alphalens tutorial factor IC`
- `portfolio concentration HHI`
- `13F filing explained`
- 中文：`量化投资 因子分析 入门`、`Python 金融数据分析 组合回测`、`13F 持仓`

**推荐课程平台（自行检索当前开课）：**

- Coursera：*Machine Learning for Trading* 相关（Georgia Tech 等曾开课）
- CFA Institute：组合管理与职业道德（体系化，偏考试）
- fast.ai / sklearn 官方教程：先把聚类、异常检测跑通

---

## 6. 推荐学习路径（贴合本仓库）

```text
第 1 周  数据层
  读 Form 13F FAQ + 本仓库 assets/13f
  手算：权重、Top3、HHI、有效持仓数

第 2 周  对照层
  自己 CSV ↔ 13F：符号映射、重合率、权重相似度
  实现/读懂 Compare 页雷达与结构指纹

第 3 周  行为层
  换手、持有期、集中度时间序列（理念验证页）
  对照 Grinold 的 IC 思想：你的「信号」解释了多少差异？

第 4 周  小模型层
  sklearn：持仓向量 KMeans / 层次聚类（大牛风格簇）
  异常检测：单月交易笔数、单票权重突变
  alphalens：若有因子序列，做分层收益

第 5 周+ 扩展（可选）
  多季 13F 旋转；akshare 补 A 股；quantstats 出报告
```

**每张分析卡自检三问：**

1. 输入是什么（哪些字段）？  
2. 输出是什么（一个数 / 一条线 / 一个簇）？  
3. 假设是什么（不成立会怎样）？  

---

## 7. 本仓库内相关文档

- [README](./README.md) — 产品定位与核心目标  
- [AGENTS.md](./AGENTS.md) — 工程结构说明  
- `assets/13f/` — 真实 13F 原始 XML + 摘要  
- `src/utils/ideas.ts` — 理念指标实现  
- `src/utils/celebrityData.ts` — 真实大牛持仓（由 13F 生成）  

---

*维护说明：新增资料请优先「能复现 + 与低阶可解释分析相关」；失效链接可直接删。*
