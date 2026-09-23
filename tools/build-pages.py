#!/usr/bin/env python3
"""同步三页共用的头部、导航与页脚（index / market / download）。

由来：三页的头、导航、页脚必须完全一致，手改容易漂移；而正文（首屏、功能区、界面
截图区、下载说明等）需要频繁调整排版。因此本脚本只维护**共用块**：

  · `<head>` 内的标题、描述、og 标签与样式/图标引用
  · `<header class="top">` 导航
  · `<footer class="bot">` 页脚

正文（`</header>` 之后到 `<footer>` 之前）不由本脚本改动，直接编辑 HTML 即可。
导航或页脚有变动时改本脚本，然后运行：

    python3 tools/build-pages.py

重复运行不产生改动：内容一致时不写盘；CI 以 `git diff --exit-code` 校验三页与脚本一致。
"""
import io
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

MAIN = "https://github.com/smartThise/OneTHU"
RELEASES = MAIN + "/releases/latest"
DOCS = "docs/"
MARKET_REPO = "https://github.com/smartThise/OneTHU-Market"
# 清华云盘（校内直连；与 Releases 同一批安装包，按平台分文件夹）
MIRROR = "https://cloud.tsinghua.edu.cn/d/56f78a2a0b144a6ab737/"

BRAND = ('<span class="brand" aria-label="OneTHU">'
         '<span class="b-r"><span class="p">(</span><span class="b-one">One</span></span>'
         '<span class="b-r b-r2"><span class="b-thu">THU</span><span class="p">)</span></span></span>')

# 页面 → (文件名, 导航高亮键, 标题, 描述)
PAGES = [
    (
        "index.html",
        "features",
        "OneTHU — One THUer should have OneTHU.",
        "OneTHU：统一身份、统一数据层、统一界面的清华校园 App 与 Agent，覆盖 macOS / Windows / "
        "Android；内置 OneTHU Harness（AI Agent），一句话覆盖作业、课表、预约、新闻等校园场景；"
        "插件与 SDK 开放生态、桌面小组件、三端系统通知。",
    ),
    (
        "market.html",
        "market",
        "插件市场 · OneTHU",
        "OneTHU 插件市场：官方与社区插件一览，点击卡片进入对应仓库。",
    ),
    (
        "download.html",
        "download",
        "下载 · OneTHU",
        "OneTHU 下载：macOS DMG / Windows EXE / Android APK，按平台直达最新版 Releases。",
    ),
    (
        "community.html",
        "community",
        "交流与反馈 · OneTHU",
        "OneTHU 交流与反馈：用户 QQ 群、Issues 提交指引与插件生态入口。",
    ),
]

ISSUES = MAIN + "/issues"

# (href, 文案, 高亮键, 附加 class, 下拉项 [(href, 文案)…])
NAV = [
    ("index.html#features", "功能", "features", "hide-sm", ()),
    ("index.html#shots", "界面", "shots", "hide-sm", ()),
    ("market.html", "插件市场", "market", "", ()),
    ("download.html", "下载", "download", "", ()),
    (DOCS, "文档", "docs", "", ()),
    ("community.html", "交流与反馈", "community", "", (
        ("community.html#qq", "用户交流群"),
        (ISSUES, "提交问题 / Issues"),
    )),
    (MAIN, "GitHub", "github", "hide-sm", ()),
]


def head(title, desc):
    return """<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>%s</title>
<meta name="description" content="%s"/>
<link rel="icon" href="assets/img/icon.png"/>
<link rel="stylesheet" href="assets/tokens.css"/>
<link rel="stylesheet" href="assets/site.css"/>
<meta property="og:title" content="%s"/>
<meta property="og:description" content="%s"/>
<meta property="og:image" content="assets/img/banner.png"/>
</head>""" % (title, desc, title, desc)


def header(active):
    links = []
    for href, label, key, cls, menu in NAV:
        cls_attr = ' class="%s"' % cls if cls else ""
        cur = ' aria-current="page"' % () if key == active else ""
        link = '<a href="%s"%s%s>%s</a>' % (href, cls_attr, cur, label)
        if menu:
            items = "".join(
                '<a href="%s"%s>%s</a>' % (h, ' target="_blank" rel="noopener"' if h.startswith("http") else "", t)
                for h, t in menu
            )
            links.append('<div class="nav-item">%s<div class="nav-menu">%s</div></div>' % (link, items))
        else:
            links.append(link)
    links.append('<a class="btn btn-primary btn-sm" href="%s">下载最新版</a>' % RELEASES)
    return """<header class="top">
  <div class="wrap top-in">
    <a href="index.html" style="color:inherit">%s</a>
    <nav>%s</nav>
  </div>
</header>""" % (BRAND, "".join(links))


FOOTER = """<footer class="bot">
  <div class="wrap">
    <div class="cols">
      <div>
        <h5>下载</h5>
        <a href="%s">最新版 Releases</a>
        <a href="%s/releases" target="_blank" rel="noopener">历史版本</a>
        <a href="%s" target="_blank" rel="noopener" data-cloud>清华云盘下载</a>
      </div>
      <div>
        <h5>文档</h5>
        <a href="%s">全部文档</a>
        <a href="%splugin-development/">插件开发指南</a>
        <a href="%sapi-reference/">API 参考</a>
        <a href="%sbuild-and-release/">构建与发布</a>
      </div>
      <div>
        <h5>生态</h5>
        <a href="market.html">插件市场</a>
        <a href="%s" target="_blank" rel="noopener">市场名单仓库</a>
        <a href="https://github.com/smartThise/OneTHU-plugin-hello" target="_blank" rel="noopener">示例插件</a>
        <a href="https://github.com/smartThise/OneTHU-Harness" target="_blank" rel="noopener">Harness</a>
        <a href="community.html">交流与反馈</a>
        <a href="https://github.com/smartThise/OneTHU/issues" target="_blank" rel="noopener">提交问题 / Issues</a>
      </div>
      <div>
        <h5>说明</h5>
        <a href="%s/blob/dev3/LICENSE" target="_blank" rel="noopener">许可（MIT + 使用限制）</a>
        <a href="%s/blob/dev3/LICENSES/THIRD-PARTY.md" target="_blank" rel="noopener">第三方组件许可</a>
      </div>
    </div>
    <div class="fine">
      OneTHU 是非官方的个人效率工具，与清华大学无关；所有数据均来自学校公开系统的网页接口，仅供个人学习与日常使用。<br/>
      自有代码以 MIT 许可开源，<strong>附两条限制</strong>：严禁商业用途；严禁用于对清华大学信息服务的攻击性访问（抢课、自动预约提交等）。详见
      <a href="%s/blob/dev3/LICENSE" target="_blank" rel="noopener">LICENSE</a>。
    </div>
  </div>
</footer>""" % (RELEASES, MAIN, MIRROR, DOCS, DOCS, DOCS, DOCS, MARKET_REPO, MAIN, MAIN, MAIN)


def sync(name, active, title, desc):
    path = os.path.join(ROOT, name)
    src = io.open(path, encoding="utf-8").read()
    out = re.sub(r"<head>[\s\S]*?</head>", lambda _: head(title, desc), src, count=1)
    out = re.sub(
        r'<header class="top">[\s\S]*?</header>', lambda _: header(active), out, count=1
    )
    out = re.sub(r'<footer class="bot">[\s\S]*?</footer>', lambda _: FOOTER, out, count=1)
    if out == src:
        print("未变", name)
        return
    io.open(path, "w", encoding="utf-8").write(out)
    print("写入", name, len(out), "字符")


if __name__ == "__main__":
    for name, active, title, desc in PAGES:
        sync(name, active, title, desc)
