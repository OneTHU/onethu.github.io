# OneTHU public website and documentation

[中文](#中文) · [English](#english)

## 中文

OneTHU 0.11 官网包含**概览、下载、插件市场、开发者、交流**五大板块及完整英文版。网站沿用经典的上下双行 One / THU 品牌标志；在体验介绍中展示可自由定制的主题、壁纸与界面布局。

- 官网主页：<https://onethu.github.io/> · 英文版：<https://onethu.github.io/en/>
- 在线文档：<https://onethu.github.io/docs/> · 英文版：<https://onethu.github.io/docs/en/>
- 文档来源：主仓 `docs/` 目录，通过 `docs-source.json` 锁定经过审阅的公开提交（当前跟踪 `web` 分支）。架构文档清晰区分开发中的原型能力与已打包发布的功能；现行指南提供中英双语，早期工程调研与验收记录按原貌归档。
- 贡献者展示：开发者页完整收录所有 Git 提交作者与署名共同作者，并自动合并可识别的 GitHub 身份；累计新增源码超过 10,000 行的贡献者标为主要贡献者，统计口径与快照时间公开透明。
- 界面预览：全站配图均截取自真实运行的应用界面，填充离线模拟数据，涵盖手机横竖屏、桌面大屏以及长按拖入暂存箱的实机交互录制。
- 交互与无障碍：Three.js 本地打包并随页面滚动平滑渲染；遇到开启「减少动态效果」、禁用 JavaScript 或缺乏 WebGL 的环境时，会自动切换为清晰的静态图文展示，保持原生顺畅滚动。

本地预览官网静态页：

```bash
npm ci --ignore-scripts
npm run build:studio
python3 tools/build-pages.py
npm test
python3 -m http.server 8766
```

本地构建文档站（推荐在 Python 3.13 虚拟环境中执行）：

```bash
pip install -r requirements-docs.txt
npm ci --ignore-scripts
python3 tools/sync-docs.py ../OneTHU/docs
mkdocs build --strict --site-dir .pages/docs
mkdocs build --strict -f mkdocs.en.yml --site-dir .pages/docs/en
```

网站各双语页面由 `tools/build-pages.py` 统一生成（修改文案请直接编辑该脚本，再重新运行生成 HTML）；三维舞台逻辑位于 `src/studio.js`，公共页面交互位于 `assets/site.js`。中英文均为独立编写的静态页面，切换语言时会自动跳转到同名对应页面。

更新预览截图：在主仓跑完采集脚本后，执行 `python3 tools/sync-preview-assets.py ../OneTHU/docs/assets/0.11`（需安装 `cwebp`）即可更新 WebP 素材与校验清单。贡献者数据可通过主仓 `tools/contributors-report.py` 刷新（公开产物已隐去个人邮箱）。

向 `main` 分支推送提交会自动触发 GitHub Pages 部署：工作流按 `docs-source.json` 检出技术文档并严格构建中英文文档站，同时使用主仓 `main` 上的发布脚本核验各端下载渠道与校验值。

## English

The OneTHU 0.11 website features Overview, Download, Plugins, Developers, and Community pages in both Chinese and English, built around the signature stacked One / THU mark and customizable themes, wallpapers, and layouts.

Documentation lives in `docs/` in the main repository, with `docs-source.json` pinning the reviewed public snapshot (currently tracking `web`). Architecture chapters clearly note what ships in current installers versus active source prototypes; current user and developer guides are available in both languages, while earlier engineering records remain archived in their original language. Contributors are compiled reproducibly from Git history (with emails omitted for privacy), recognizing contributors above 10,000 cumulative added source lines alongside every commit author and credited coauthor.

Run the commands above to build the static pages, locally bundled Three.js stage, and both strict MkDocs sites. Update page copy in `tools/build-pages.py` and regenerate the HTML files. All public previews are captured from the live UI using offline sample fixtures, and the scroll-driven 3D stage gracefully falls back to clean static posters when reduced motion is enabled or JavaScript/WebGL is unavailable.

Pushing to `main` deploys both the website and bilingual documentation via GitHub Pages, verifying release mirrors and serving Mermaid locally.
