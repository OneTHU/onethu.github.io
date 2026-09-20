# onethu.github.io

OneTHU 官网：几何方块与线条风格的静态站点（无构建步骤，GitHub Pages 直接托管）。

- **在线**：https://onethu.github.io/（若该域名尚未启用，见下方「域名」）
- **主程序仓库**：[smartThise/OneTHU](https://github.com/smartThise/OneTHU)
- **下载**：站点所有下载入口都指向 [https://github.com/smartThise/OneTHU/releases/latest](https://github.com/smartThise/OneTHU/releases/latest)

## 页面

| 页面 | 内容 |
|---|---|
| `index.html` | 首屏（线条跳动动效 + `(One THU)` 标识）、为什么是 OneTHU、功能总览（12 组）、界面截图、插件市场（实时）、下载、仓库与上游、许可摘要 |
| `tokens.html` | 设计令牌全貌：面 / 线 / 字色 / 品牌与强调 / 功能色 / 交互 / 字体与字号 / 间距 / 形状 / 阴影。**由 `assets/tokens.css` 解析生成**，改令牌即改此页 |

## 本地预览

```bash
python3 -m http.server 4173      # 然后打开 http://localhost:4173
```

无需 npm、无需构建：改完 HTML/CSS/JS 直接刷新。

## 目录

```
assets/tokens.css    设计令牌（与主仓 packages/ui/src/tokens.css 同步）
assets/site.css      站点样式（几何方块 + 线条）
assets/site.js       线条动效 canvas · 插件市场拉取 · 滚动显现 · 平台识别
assets/img/          logo.svg（(One THU) 标识）· icon.png（favicon）· banner.png
assets/shots/        界面截图位（当前为几何占位 SVG，待替换）
```

## 替换截图

`assets/shots/` 下 8 个占位文件，替换时保持 **1600×1000（16:10）** 即可，文件名不变就不用改 HTML：

| 文件 | 画面 |
|---|---|
| `today.svg` | 今日：课程 · 截止 · 日程 |
| `learn.svg` | 网络学堂：作业 / 通知 / 文件 / 讨论区 |
| `ykt.svg` | 雨课堂详情：题干渲染 · 分数与评语 |
| `schedule.svg` | 日程与提醒：课表 · 云日历 · 三端通知 |
| `widget.svg` | 桌面小组件：1×1 / 图标组 / 详情 |
| `life.svg` | 校园生活：校园卡 · 电费 · 洗衣机 · 图书馆 |
| `trace.svg` | 寻迹：日程地图 · POI · ETA |
| `plugins.svg` | 插件与市场 |

替换 PNG/JPG 时把 `index.html` 里对应的 `.svg` 后缀改掉即可（或直接另存为同名 SVG）。

## 插件市场

市场页签读的是 [OneTHU-Market](https://github.com/smartThise/OneTHU-Market) 的 `registry.json`
（与应用内“插件 → 市场”同一份名单）：先取 GitHub contents API（无 CDN 缓存），失败回落 `raw.githubusercontent.com`；
卡片上的 ★ 实时取各仓库的 `stargazers_count`（sessionStorage 缓存 10 分钟，匿名 API 限额 60 次/小时，
故并发限制为 4）。点卡片跳转对应仓库。

## 设计令牌

`assets/tokens.css` 是主仓 `packages/ui/src/tokens.css` 的副本，同步方式：

```bash
cp ../OneTHU/packages/ui/src/tokens.css assets/tokens.css   # 需保留文件头的来源注释
```

## 许可

站点代码以 **MIT** 开源（见 [LICENSE](./LICENSE)）。站点中引用的 OneTHU 名称、标识与截图归主程序仓库，
主程序自有代码为 MIT **并附两条限制**（严禁商业用途；严禁用于对清华大学信息服务的攻击性访问），
第三方组件（thu-info-app / thu-info-lib、LearnX 等）另按其自带许可与授权——
详见 [主仓 LICENSE](https://github.com/smartThise/OneTHU/blob/dev3/LICENSE) 与 [LICENSES/THIRD-PARTY.md](https://github.com/smartThise/OneTHU/blob/dev3/LICENSES/THIRD-PARTY.md)。
