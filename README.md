# onethu.github.io

OneTHU 官网与文档站。官网为几何方块与线条风格的静态站点，页面直接提交在仓库中，浏览时无需构建；
文档站（`/docs/`）由 Material for MkDocs 从**主仓文档**构建。两者由同一个工作流发布到 GitHub Pages。

- **官网**：**https://onethu.github.io/**
- **文档**：**https://onethu.github.io/docs/**（组织 [OneTHU](https://github.com/OneTHU) 的根站点）
- **主程序仓库**：[smartThise/OneTHU](https://github.com/smartThise/OneTHU)
- **下载**：站点所有下载入口均指向 [https://github.com/smartThise/OneTHU/releases/latest](https://github.com/smartThise/OneTHU/releases/latest)

## 页面

| 页面 | 内容 |
|---|---|
| `index.html` | 首屏（几何交织背景 + `(One THU)` 双行标识）、01 为什么是 OneTHU、02 功能总览（12 组）、03 界面、04 插件与生态入口 |
| `market.html` | 插件市场：实时读取 OneTHU-Market 名单，分类页签（主题 / 官方 / 社区）+ 搜索 + ★ |
| `download.html` | 下载：三端（macOS / Windows / Android）安装包、系统要求、安装说明、历史版本 |
| `/docs/`（构建产物，不入库） | 文档站：安装与上手、构建与发布、插件开发、API 参考、系统架构、外部作业源、许可与交流 |

前三页共用同一套头部、页脚、品牌标识与页面骨架，由 `tools/build-pages.py` 生成。

## 部署

仓库名 `onethu.github.io` 位于组织 `OneTHU` 下，因此它是**组织根站点**。
发布源为 **GitHub Actions**（`Settings → Pages → Source = GitHub Actions`），
由 [`.github/workflows/pages.yml`](.github/workflows/pages.yml) 构建并部署：

| 触发 | 说明 |
|---|---|
| 推送到 `main` | 官网改动即发布（约 1 分钟） |
| 每天 04:17（UTC+8） | 重建一次，跟进主仓文档更新 |
| 手动触发 | 可指定主仓文档来源分支（默认 `dev3`） |

**主仓文档更新不会自动触发本仓库**。需要立即生效时手动触发工作流（或推送任意提交）：

```bash
gh workflow run pages.yml -R OneTHU/onethu.github.io     # 默认取主仓 dev3
gh workflow run pages.yml -R OneTHU/onethu.github.io -f onethu_ref=demo
```

工作流还会校验 `index/market/download.html` 与生成脚本一致（不一致即失败），避免导航与页脚漂移。

## 文档站

文档正文**不在本仓库**：本仓库只负责主题、导航、构建与部署。

| 位置 | 角色 |
|---|---|
| 主仓 [`OneTHU/docs`](https://github.com/smartThise/OneTHU/tree/dev3/docs) | 工程文档真源（插件、API、架构、外部作业源、安卓陷阱、文案规范） |
| 本仓库 `docs-site/` | 文档站自有页面：首页、快速开始、构建与发布、许可与致谢、交流与反馈 |
| 本仓库 `mkdocs.yml` | 主题（Material，配色取自官网设计令牌）、导航结构、Markdown 扩展 |
| 本仓库 `tools/sync-docs.py` | 同步脚本：主仓 `docs/` → `docs-src/`（仅构建时生成，不入库） |
| 本仓库 `requirements-docs.txt` | 构建依赖（`mkdocs-material==9.7.7`） |

同步脚本依次执行四步：复制主仓文档（跳过 exFAT 的 `._*` 旁文件）；主仓 `README.md` 改名为
`overview.md`（站内首页由本站的 `index.md` 提供）；将指向仓库其他文件的相对链接
（`../LICENSE` 等）改写为主仓 GitHub 地址；叠加 `docs-site/`。

**文档改动位置**

- 插件开发、API 参考、系统架构、外部作业源、安卓陷阱、文案规范 → **主仓 `docs/`**
  （随代码同步，可在 GitHub 直接阅读）
- 安装上手、构建发布、许可、交流等站点页面 → **本仓库 `docs-site/`**
- 导航标题与分组 → 本仓库 `mkdocs.yml` 的 `nav`

**本地预览**

```bash
bash tools/docs-serve.sh                 # 同步并启动服务，http://127.0.0.1:8000/docs/
ONETHU_REPO=/path/to/OneTHU bash tools/docs-serve.sh
```

构建环境（venv）默认位于 `~/Library/Caches/onethu/docs-venv`：本仓库位于 exFAT 卷时，
不支持在仓库内创建符号链接。仅同步而不预览：

```bash
python3 tools/sync-docs.py ../OneTHU/docs
```

## 本地预览（官网）

```bash
python3 -m http.server 4173      # 然后打开 http://localhost:4173
```

官网无 npm 依赖与构建步骤：修改 HTML/CSS/JS 后刷新即可。

## 重新生成页面

头部导航、页脚、品牌标识与页面骨架由脚本统一生成，避免多页漂移：

```bash
python3 tools/build-pages.py     # 写入 index.html · market.html · download.html
```

仅修改正文文案时可直接编辑 HTML；导航或页脚有变动时须修改脚本并重新生成，否则各页不一致
（CI 会校验两者是否一致）。

## 目录

```
index.html           官网首页          market.html   插件市场
download.html        下载页            404.html      构建时取自文档站
robots.txt           sitemap 指向      .nojekyll     产物标记
mkdocs.yml           文档站配置        requirements-docs.txt  文档站依赖
docs-site/           文档站自有页面（首页 / 快速开始 / 构建与发布 / 许可 / 交流 + 品牌 CSS）
overrides/           Material 主题覆盖（仅首页标题，见 overrides/main.html）
docs-src/            文档源（构建时生成，不入库）
assets/tokens.css    设计令牌（与主仓 packages/ui/src/tokens.css 同步）
assets/site.css      官网样式（几何方块 + 线条）
assets/site.js       几何交织背景 canvas · 插件市场拉取 · 滚动显现 · 平台识别
assets/img/          logo.svg（(One THU) 标识）· icon.png（favicon）· banner.png
assets/shots/        界面实拍截图（720×1600 WebP，首页横滑轨道）
tools/build-pages.py 官网页面生成      tools/sync-docs.py   文档同步
tools/docs-serve.sh  文档站本地预览    tools/pages-exclude.txt  产物排除清单
.github/workflows/pages.yml  构建并部署到 Pages
```

## 替换截图

`assets/shots/` 下为应用实拍截图（emulator 脱敏截图，720×1600 WebP），首页「界面」横滑轨道使用。
替换时保持 **720×1600（9:20）**、文件名不变即可，无需修改 HTML：

| 文件 | 画面 |
|---|---|
| `jintian.webp` | 今日：作业 · 课程 · 日程 |
| `wangluo.webp` | 网络学堂：作业 / 通知 / 文件 / 讨论区 |
| `richeng.webp` | 日程与提醒：课表 · 云日历 · 三端通知 |
| `xunji2.webp` | 寻迹：日程地图 · POI · ETA |
| `yunpan.webp` | 云盘：清华云盘 · 文件预览与下载 |
| `shenghuo.webp` | 校园生活：校园卡 · 电费 · 洗衣机 |
| `yuyue.webp` | 预约：场馆 · 座位 · 我的预约 |
| `xuanke.webp` | 选课：筛选 · 余量 · 收藏夹 |
| `zaixian.webp` | 在线服务：常用服务 · 办事进度 |
| `plugins.webp` | 插件与Agent：OH 对话 · 工具调用 |

## 插件市场

市场页签读取 [OneTHU-Market](https://github.com/smartThise/OneTHU-Market) 的 `registry.json`
（与应用内「插件 → 市场」同一份名单）：先取 GitHub contents API（无 CDN 缓存），失败时回落
`raw.githubusercontent.com`；卡片上的 ★ 实时取各仓库的 `stargazers_count`（sessionStorage
缓存 10 分钟，匿名 API 限额 60 次/小时，故并发限制为 4）。点击卡片跳转对应仓库。

## 样式来源

`assets/tokens.css` 是主仓 `packages/ui/src/tokens.css` 的副本（仅作为站点自身的 CSS 变量，
不单独成页），同步方式：

```bash
cp ../OneTHU/packages/ui/src/tokens.css assets/tokens.css   # 需保留文件头的来源注释
```

文档站配色取自同一套令牌，定义在 `docs-site/assets/extra.css`（`--md-primary-fg-color` 等）。

## 许可

站点代码以 **MIT** 开源（见 [LICENSE](./LICENSE)）。站点中引用的 OneTHU 名称、标识与截图归主程序仓库，
主程序自有代码为 MIT **并附两条限制**（严禁商业用途；严禁用于对清华大学信息服务的攻击性访问），
第三方组件（thu-info-app / thu-info-lib、LearnX 等）另按其自带许可与授权——
详见 [主仓 LICENSE](https://github.com/smartThise/OneTHU/blob/dev3/LICENSE) 与 [LICENSES/THIRD-PARTY.md](https://github.com/smartThise/OneTHU/blob/dev3/LICENSES/THIRD-PARTY.md)。
