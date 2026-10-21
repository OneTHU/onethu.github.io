# OneTHU public website and documentation

[中文](#中文) · [English](#english)

## 中文

0.11 官网包含概览、下载、插件市场、开发者、交流五类页面及对应英文版。品牌沿用严格上下两行的 One / THU 标志；主题、壁纸和布局是用户可调整能力，不将某个默认主题作为固定产品外观。

- 官网：<https://onethu.github.io/>；英文：<https://onethu.github.io/en/>
- 文档：<https://onethu.github.io/docs/>；英文：<https://onethu.github.io/docs/en/>
- 内容真源：主仓 `dev3` 的 `docs/`，历史研究显式标注，现行指南分中英文。
- 开发者页显示全部 Git 作者与署名共同作者；可识别 GitHub 身份合并。累计新增代码严格超过 10,000 行标为主要贡献者，口径和提交时间可见。
- 预览仅为隔离模拟数据，使用真实应用界面；包含手机横竖屏、大屏及真实长按拖入录制。
- Three.js 本地打包，随滚动按需绘制；减少动态、无 JavaScript、WebGL 不可用时保留静态内容，不劫持滚轮。

```bash
npm ci --ignore-scripts
npm run build:studio
python3 tools/build-pages.py
npm test
python3 -m http.server 8766
```

文档构建（Python 3.13，建议虚拟环境）：

```bash
pip install -r requirements-docs.txt
python3 tools/sync-docs.py ../OneTHU/docs
mkdocs build --strict --site-dir .pages/docs
mkdocs build --strict -f mkdocs.en.yml --site-dir .pages/docs/en
```

网站正文由 `tools/build-pages.py` 生成，不手改生成 HTML。三维源码在 `src/studio.js`；公共交互在 `assets/site.js`。中英文是明确编写的静态页面，不依赖浏览器机器翻译。语言切换保留同名页面；历史中文材料在英文目录中标明原文性质。

更新模拟素材：在主仓运行采集脚本后，使用 `python3 tools/sync-preview-assets.py ../OneTHU/docs/assets/0.11`（需 `cwebp`）重新生成 WebP 与哈希清单。来源检查通过后才可公开。贡献者重新生成工具为主仓 `tools/contributors-report.py`；公开产物不包含邮箱。

推送 `main` 触发 Pages，同步主仓 `dev3` 后分别严格构建中英文文档。部署产物不含源工程、依赖、签名和临时文件。安装包只链接实际 Releases 与镜像，不宣称每个平台已发布新的同一批包。

## English

The 0.11 site has Overview, Download, Plugins, Developers and Community pages in Chinese and English. Preserve the original stacked One / THU logo. Themes, wallpapers and layouts remain customizable; a default theme is not a fixed product appearance.

The main repository’s `dev3/docs` owns documentation. Current user/developer guides have English counterparts; historical engineering records retain their original language with clear status labels. Contributors are reproducibly derived from reachable Git history. More than 10,000 cumulative added source-code lines qualifies as a major contributor; the public snapshot explains exclusions and dates and contains no email addresses.

The commands above build the static pages, locally bundled Three.js and both strict MkDocs sites. Edit `tools/build-pages.py`, not generated HTML. Public captures use fictional fixtures in the real UI. Do not replace them with private account screenshots. The 3D stage renders on scroll without hijacking the wheel, and provides reduced-motion, no-JavaScript and unavailable-WebGL fallbacks.

Pushes to `main` deploy the website and both documentation languages through Pages. Release links reflect actual available packages rather than promising a new build for every platform.
