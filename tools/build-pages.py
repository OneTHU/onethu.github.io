#!/usr/bin/env python3
"""由本脚本生成站点页面（index / market / download）。

页面本身是普通静态 HTML（提交在仓库里，Pages 直接托管，**浏览时无需构建**）。
本脚本只用来统一「头部 / 页脚 / 品牌标识」三块共用标记：改完共用部分跑一次
`python3 tools/build-pages.py` 重新生成，避免多页漂移。
tokens.html 的令牌表格同样由本脚本解析 assets/tokens.css 生成。
"""
import io, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

MAIN = "https://github.com/smartThise/OneTHU"
RELEASES = MAIN + "/releases/latest"
DOCS = MAIN + "/blob/dev3/docs"
MARKET_REPO = "https://github.com/smartThise/OneTHU-Market"

BRAND = ('<span class="brand" style="font-size:15px" aria-label="OneTHU">'
         '<span class="p">(</span>'
         '<span class="word"><i>O</i><i>n</i><i>e</i></span><span></span><span class="p"> </span>'
         '<span class="u">T</span><span class="u">H</span><span class="u">U</span>'
         '<span class="p">)</span></span>')


def head(title, desc, active):
    def nav(href, label, key, cls=""):
        cur = ' aria-current="page"' if key == active else ""
        c = ' class="%s"' % cls if cls else ""
        return '<a href="%s"%s%s>%s</a>' % (href, c, cur, label)
    links = "".join([
        nav("index.html#features", "功能", "features", "hide-sm"),
        nav("index.html#shots", "界面", "shots", "hide-sm"),
        nav("market.html", "插件市场", "market"),
        nav("download.html", "下载", "download"),
        nav("tokens.html", "设计令牌", "tokens", "hide-sm"),
        nav(MAIN, "GitHub", "github", "hide-sm"),
        '<a class="btn btn-primary btn-sm" href="%s">下载最新版</a>' % RELEASES,
    ])
    return """<!doctype html>
<html lang="zh-CN">
<head>
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
</head>
<body>

<header class="top">
  <div class="wrap top-in">
    <a href="index.html" style="color:inherit">%s</a>
    <nav>%s</nav>
  </div>
</header>
""" % (title, desc, title, desc, BRAND, links)


FOOTER = """<footer class="bot">
  <div class="wrap">
    <div class="cols">
      <div>
        <h5>下载</h5>
        <a href="%s">最新版 Releases</a>
        <a href="download.html">三端安装包</a>
        <a href="%s/releases" target="_blank" rel="noopener">历史版本</a>
      </div>
      <div>
        <h5>文档</h5>
        <a href="%s/plugin-development.md" target="_blank" rel="noopener">插件开发指南</a>
        <a href="%s/api-reference.md" target="_blank" rel="noopener">API 参考</a>
        <a href="%s/architecture.md" target="_blank" rel="noopener">架构说明</a>
        <a href="tokens.html">设计令牌</a>
      </div>
      <div>
        <h5>生态</h5>
        <a href="market.html">插件市场</a>
        <a href="%s" target="_blank" rel="noopener">市场名单仓库</a>
        <a href="https://github.com/smartThise/OneTHU-plugin-hello" target="_blank" rel="noopener">示例插件</a>
        <a href="https://github.com/smartThise/OneTHU-Harness" target="_blank" rel="noopener">Harness</a>
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
</footer>

<script src="assets/site.js"></script>
</body>
</html>
""" % (RELEASES, MAIN, DOCS, DOCS, DOCS, MARKET_REPO, MAIN, MAIN, MAIN)


def write(name, html):
    io.open(os.path.join(ROOT, name), 'w', encoding='utf-8').write(html)
    print('写入', name, len(html), '字符')


def card(title, desc, items=None, tags=None, cls=""):
    li = "".join("<li>%s</li>" % x for x in (items or []))
    tg = "".join('<span class="tag">%s</span>' % x for x in (tags or []))
    return """        <div class="card reveal">
          <div class="sq %s"></div>
          <h3>%s</h3>
          <p>%s</p>
          %s
          %s
        </div>
""" % (cls, title, desc, "<ul>%s</ul>" % li if li else "", '<div class="tag-row">%s</div>' % tg if tg else "")


FEATURES = [
    ("统一身份与数据层", "登录一次，全校通行：网络学堂、信息门户、图书馆、校园卡共用同一次登录，二次验证支持。会话失效自动重漫游，弱网与前台挂起后可自愈。",
     ["一次登录 · 全模块共用会话", "二次认证（2FA）与凭证本机加密", "会话保活 / 健康检查 / Cookie 导出导入"], ["内核"], ""),
    ("网络学堂全景", "课程、作业、通知、文件、讨论区一屏管完；作业 DDL 与提交状态真实查询，不做“已提交”的乐观猜测。",
     ["课程详情 · 作业 / 通知 / 文件 / 分组 / 讨论区", "全局搜索（课程 / 作业 / 通知 / 文件）", "讨论区阅读与回复 · 附件下载"], ["学习"], "blue"),
    ("外部作业源聚合", "雨课堂、TUOJ（AI 版 / 经典版）、Tyche、DSA OJ 四个系统的作业统一进「全部作业」与「今日」，一处看全。",
     ["只读：标题 / 课程 / 截止 / 状态，不代提交", "雨课堂题干原生渲染：加密字体 + KaTeX 公式 + 图片代理", "已批改显示 X/Y 与老师评语；试卷不显示提交入口"], ["雨课堂", "TUOJ", "Tyche", "DSA OJ"], "amber"),
    ("日程 · 课表 · 提醒", "课表、云日历、自定义日程（含重复规则）合成时间轴；提醒落到系统通知，不是应用内弹窗。",
     ["三端系统通知（Windows / macOS / Android）", "静默时段三结局：顺延 / DDL 改静默前最后一分钟 / 课程丢弃", "每日早报只在有安排的日子发"], ["通知"], "green"),
    ("桌面小组件（Android）", "一块小组件显示什么按块绑定：日程与 DDL、某个原子占满看详情、收藏夹图标组、1×1 快捷方式各占一块。",
     ["五种初始形态：1×1 / 2×1 / 2×2 / 3×2 / 4×1", "图标组每格独立可点；详情形态拉得越高行数越多", "实时数据：教室本节空闲、洗衣机剩余分钟"], ["小组件"], "blue"),
    ("万物原子化", "页面、组件、实体（课程 / 作业 / 文件 / 通知 / 新闻 / 洗衣机 / 教室 / 场馆 / 图书馆）统一成“原子”：可搜、可收藏、可深链、可上桌面。",
     ["原子注册表：唯一事实来源", "收藏夹 = 可嵌套的原子面板", "寻迹：今日日程地图 + POI + ETA + 一键前往"], ["原子"], ""),
    ("校园生活", "校园卡流水、宿舍电费、校园网、电子发票、银行代发、研究生收入；洗衣机接三家数据源。",
     ["洗衣机：捷利 / 海乐生活 / 小兰智慧", "教学楼教室实时占用 · 图书馆座位", "邮箱（IMAP/SMTP）· 清华云盘 · THUbook · 在线服务"], ["生活"], "amber"),
    ("预约查询", "图书馆座位、研讨间、空教室、公共空间与体育场馆余量一处查。",
     ["场馆 / 场次 / 余量 / 我的预约 / 退订", "体育场馆仅提供查询——预约请到官方网页完成"], ["预约"], "red"),
    ("文件与下载", "课件、附件、云盘文件都能预览（Office / PDF / 图片 / 压缩包树），并决定存到哪儿。",
     ["三端自定义下载位置（Android 走 SAF 目录授权）", "「另存为」：这一次落哪儿由你当场选", "大文件超限会明说，而不是转圈到超时"], ["文件"], ""),
    ("插件系统", "三种形态：JS 插件、Rust sidecar、Android 内嵌；能力覆盖命令、功能页、弹窗、剪贴板、原子、桌面小组件、系统通知。",
     ["插件市场：人工审查收录，一键安装", "主题插件：配色令牌 / 品牌标识 / 附加 CSS", "插件 API 124 个方法、18 个命名空间"], ["扩展"], "blue"),
    ("OneTHU Harness", "内置 Rust 骨干插件：左下角常驻对话面板，一句话查课表、成绩、电费、订座位。",
     ["工具调用 + 两段式预约确认", "token 预算与模型调度", "与外部插件双向联动（插件可调 OH，OH 可调插件）"], ["Harness"], "green"),
    ("设计与文档", "一套设计令牌贯穿三端与站点；文档覆盖插件开发、API 参考、架构与外部作业源。",
     ["设计令牌全貌（本站 /tokens.html）", "插件开发指南 · API 参考 · 架构说明", "外部作业源接入与实测记录"], ["设计"], ""),
]

SHOTS = [
    ("today", "今日", "课程 · 截止 · 日程一屏"),
    ("learn", "网络学堂", "作业 / 通知 / 文件 / 讨论区"),
    ("ykt", "雨课堂详情", "题干原生渲染 · 分数与评语"),
    ("schedule", "日程与提醒", "课表 · 云日历 · 三端通知"),
    ("widget", "桌面小组件", "1×1 快捷方式 / 图标组 / 详情"),
    ("life", "校园生活", "校园卡 · 电费 · 洗衣机 · 图书馆"),
    ("trace", "寻迹", "今日日程地图 · POI · ETA"),
    ("plugins", "插件与市场", "能力清单 · 市场 · 主题"),
]


def page_index():
    cards = "".join(card(t, d, i, g, c) for t, d, i, g, c in FEATURES)
    shots = "".join("""      <figure class="shot reveal">
        <img src="assets/shots/%s.svg" alt="%s 截图（占位，待替换）" loading="lazy" width="1600" height="1000"/>
        <figcaption class="cap"><b>%s</b><span>%s</span></figcaption>
      </figure>
""" % (n, t, t, sub) for n, t, sub in SHOTS)
    body = """<section class="hero">
  <div class="grid-bg"></div>
  <canvas id="bg" aria-hidden="true"></canvas>
  <div class="wrap hero-in">
    <div class="lockup" role="img" aria-label="(One THU)">
      <div class="row"><span class="p p-lg">(</span><span class="one">One</span></div>
      <div class="row r2"><span class="thu">THU</span><span class="p p-lg">)</span></div>
    </div>
    <h1>One THUer should have OneTHU.</h1>
    <p class="slogan"><b>One App · One Identity · One Campus</b> —— 统一身份、统一数据层、统一界面的清华校园套件。</p>
    <div class="cta">
      <a class="btn btn-primary" href="%s">下载最新版（Releases）</a>
      <a class="btn" href="#features">看看能做什么</a>
      <a class="btn btn-ghost" href="%s" target="_blank" rel="noopener">源码与文档</a>
    </div>
  </div>
</section>

<section class="block" id="why">
  <div class="wrap">
    <div class="sec-head"><span class="sec-num">01</span><h2 class="sec-title">为什么是 OneTHU</h2></div>
    <p class="sec-sub">清华的服务散在十几个系统里，各自登录、各自界面、各自过期。OneTHU 把它们收成一套：一个身份、一份数据、一套界面，三端同构。</p>
    <div class="cards">
      <div class="card reveal"><div class="sq"></div><h3>一个身份</h3><p>登录一次，全网通行；会话失效自动恢复，不让你在“已掉登录”的状态里白点。</p></div>
      <div class="card reveal"><div class="sq blue"></div><h3>处处一致</h3><p>所有页面读同一份数据、用同一套设计令牌；同一个实体在任何页面都是同一个原子。</p></div>
      <div class="card reveal"><div class="sq green"></div><h3>一个对话入口</h3><p>OneTHU Harness：一句话查课表、成绩、电费、订座位——校园助手就在左下角。</p></div>
      <div class="card reveal"><div class="sq amber"></div><h3>数据可靠</h3><p>只读校方公开接口，状态判定不做乐观猜测；查不到就说查不到，不谎报“已提交”。</p></div>
      <div class="card reveal"><div class="sq red"></div><h3>全平台</h3><p>macOS / Windows / Android 功能对齐：通知、小组件、下载位置都在三端可用。</p></div>
    </div>
  </div>
</section>

<section class="block" id="features">
  <div class="wrap">
    <div class="sec-head"><span class="sec-num">02</span><h2 class="sec-title">功能总览</h2></div>
    <p class="sec-sub">十二组能力，从登录到插件、从手机通知到桌面小组件。每条都对应应用内的真实入口，不是规划。</p>
    <div class="cards">
%s    </div>
  </div>
</section>

<section class="block" id="shots">
  <div class="wrap">
    <div class="sec-head"><span class="sec-num">03</span><h2 class="sec-title">界面</h2></div>
    <p class="sec-sub">下方为界面截图位（当前是几何占位图，替换时保持 1600×1000 即可对齐）。</p>
    <div class="shots">
%s    </div>
  </div>
</section>

<section class="block" id="next" style="border-bottom:0">
  <div class="wrap">
    <div class="cards">
      <a class="card reveal" href="download.html" style="color:inherit"><div class="sq"></div><h3>下载安装</h3><p>macOS DMG · Windows EXE · Android APK，按平台直达最新版 Releases。</p></a>
      <a class="card reveal" href="market.html" style="color:inherit"><div class="sq blue"></div><h3>插件市场</h3><p>与应用内同一份名单，实时星数，点进仓库即可安装。</p></a>
      <a class="card reveal" href="tokens.html" style="color:inherit"><div class="sq green"></div><h3>设计令牌</h3><p>三端与站点共用的一套令牌：颜色、字号、间距、形状、阴影。</p></a>
    </div>
  </div>
</section>
""" % (RELEASES, MAIN, cards, shots)
    return head("OneTHU — One THUer should have OneTHU.",
                "OneTHU：统一身份、统一数据层、统一界面的清华校园套件，覆盖 macOS / Windows / Android；万物原子化、三端系统通知、桌面小组件、插件市场与 Harness 对话助手。",
                "features") + body + FOOTER


def page_market():
    body = """<section class="page-head">
  <div class="grid-bg"></div>
  <canvas id="bg" aria-hidden="true"></canvas>
  <div class="wrap page-head-in">
    <div class="crumb">MARKET / PLUGINS</div>
    <h1>插件市场</h1>
    <p>与应用内「插件 → 市场」同一份名单：<a href="%s" target="_blank" rel="noopener">OneTHU-Market</a> 的
      <code>registry.json</code>，人工审查收录。星数实时取自 GitHub，点卡片进仓库。</p>
  </div>
</section>

<section class="block" style="border-bottom:0">
  <div class="wrap">
    <div class="market-bar">
      <div class="market-search">
        <span aria-hidden="true">⌕</span>
        <input id="market-search" type="search" placeholder="搜索插件：名称 / 描述 / 仓库 / 作者" aria-label="搜索插件"/>
      </div>
      <div class="tabs" id="market-tabs" role="tablist">
        <button class="tab" role="tab" data-cat="all" aria-selected="true">全部</button>
      </div>
    </div>
    <div class="market-grid" id="market-grid"></div>
    <div class="market-empty" id="market-empty" hidden>没有匹配的插件。</div>

    <div class="feature-row" style="margin-top:34px">
      <span class="idx">i</span>
      <div>
        <h4>数据来源与限制</h4>
        <p>名单来自市场仓库，星数取自 GitHub 公开 API（匿名限额 60 次/小时，本站缓存 10 分钟，刚打开时星数可能短暂为空）。
          想自己写插件：从 <a href="%s/plugin-development.md" target="_blank" rel="noopener">插件开发指南</a> 与
          <a href="https://github.com/smartThise/OneTHU-plugin-hello" target="_blank" rel="noopener">示例插件</a> 开始，
          收录标准与提交方式见 <a href="%s" target="_blank" rel="noopener">市场仓库</a>。</p>
      </div>
    </div>
  </div>
</section>
""" % (MARKET_REPO, DOCS, MARKET_REPO)
    return head("插件市场 · OneTHU", "OneTHU 插件市场：与应用内同一份名单（OneTHU-Market registry.json），实时星数，点卡片进仓库。", "market") + body + FOOTER


def page_download():
    body = """<section class="page-head">
  <div class="grid-bg"></div>
  <canvas id="bg" aria-hidden="true"></canvas>
  <div class="wrap page-head-in">
    <div class="crumb">DOWNLOAD</div>
    <h1>下载</h1>
    <p>安装包都在 GitHub Releases。下面按平台直达最新版；也可以进 Releases 页面自行选择架构与版本。</p>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <div class="sec-head"><span class="sec-num">01</span><h2 class="sec-title">按平台获取</h2></div>
    <p class="sec-sub">当前系统会按 UA 高亮；点任意一张卡都到「最新版」页面。</p>
    <div class="dl">
      <a data-os="macos" href="%s"><span class="sq"></span><span><span class="t">macOS</span><br/><span class="s">.dmg · Apple Silicon / Intel</span></span></a>
      <a data-os="windows" href="%s"><span class="sq"></span><span><span class="t">Windows</span><br/><span class="s">.exe · x64 安装器</span></span></a>
      <a data-os="android" href="%s"><span class="sq"></span><span><span class="t">Android</span><br/><span class="s">.apk · arm64 / universal</span></span></a>
    </div>
    <div class="cta" style="display:flex;gap:var(--gap-3);flex-wrap:wrap;margin-top:22px">
      <a class="btn btn-primary" href="%s">前往最新版 Releases</a>
      <a class="btn" href="%s#下载与上手" target="_blank" rel="noopener">安装与上手说明</a>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <div class="sec-head"><span class="sec-num">02</span><h2 class="sec-title">上手三步</h2></div>
    <div class="feature-row"><span class="idx">01</span><div><h4>安装并登录</h4><p>用清华统一认证账号登录，支持二次验证；登录一次后网络学堂、信息门户、图书馆、校园卡共用同一会话。</p></div></div>
    <div class="feature-row"><span class="idx">02</span><div><h4>先逛演示模式（可选）</h4><p>登录页可进入演示模式，先看界面与功能结构，再决定登录。</p></div></div>
    <div class="feature-row"><span class="idx">03</span><div><h4>按需打开提醒与小组件</h4><p>设置 → 通知：打开提醒、设提前量与静默时段，并可一键自检；Android 还可在桌面添加小组件（1×1 快捷方式 / 图标组 / 详情）。</p></div></div>
  </div>
</section>

<section class="block" style="border-bottom:0">
  <div class="wrap">
    <div class="sec-head"><span class="sec-num">03</span><h2 class="sec-title">说明</h2></div>
    <div class="feature-row"><span class="idx">i</span><div><h4>数据与许可</h4><p>只读校方公开接口，仅供个人学习与日常使用。自有代码以 MIT 开源并
      <strong>附两条限制</strong>（严禁商业用途；严禁用于对清华大学信息服务的攻击性访问），第三方组件按其自带许可——
      见 <a href="%s/blob/dev3/LICENSE" target="_blank" rel="noopener">LICENSE</a> 与
      <a href="%s/blob/dev3/LICENSES/THIRD-PARTY.md" target="_blank" rel="noopener">第三方许可</a>。</p></div></div>
    <div class="feature-row"><span class="idx">i</span><div><h4>数据异常怎么办</h4><p>点右下角刷新按钮重试；仍异常时在
      <a href="%s/issues" target="_blank" rel="noopener">Issues</a> 反馈，带上设置页「自检」的结果最有效。</p></div></div>
  </div>
</section>
""" % (RELEASES, RELEASES, RELEASES, RELEASES, MAIN, MAIN, MAIN, MAIN)
    return head("下载 · OneTHU", "OneTHU 下载：macOS DMG / Windows EXE / Android APK，直达最新版 Releases。", "download") + body + FOOTER


def page_tokens():
    """设计令牌全貌：解析 assets/tokens.css 生成（改令牌即改此页）。"""
    import re
    css = io.open(os.path.join(ROOT, 'assets/tokens.css'), encoding='utf-8').read()
    vars_ = re.findall(r'--([\w-]+):\s*([^;]+);', css)

    def val(name):
        for k, v in vars_:
            if k == name:
                return v.strip()
        return ''

    def swatch(name, note=''):
        return '''        <div class="swatch">
          <div class="c" style="background: var(--%s)"></div>
          <div class="m"><b>--%s</b><span class="v">%s</span>%s</div>
        </div>
''' % (name, name, val(name), note)

    groups = [
        ("面 Surface", [("bg", "页面底"), ("bg-soft", "次级底"), ("surface", "卡片"),
                        ("surface-2", "卡片次级"), ("surface-3", "控件底"), ("skeleton", "骨架")]),
        ("线 Line", [("border", "常规边线"), ("border-soft", "发丝线"), ("border-strong", "强调边线")]),
        ("字色 Text", [("text-1", "正文"), ("text-2", "次要"), ("text-3", "三级"), ("text-dim", "禁用/占位")]),
        ("品牌与强调 Brand", [("primary", "主按钮（黑）"), ("primary-hover", "主按钮悬停"),
                              ("on-primary", "按钮前景"), ("accent", "业务蓝"),
                              ("accent-soft", "蓝浅底"), ("accent-border", "蓝描边")]),
        ("功能色 Functional", [("red", "危险/占用"), ("red-soft", "危险浅底"),
                               ("amber", "提醒/进行中"), ("amber-soft", "提醒浅底"),
                               ("green", "空闲/成功"), ("green-soft", "成功浅底")]),
        ("交互 Interaction", [("hover", "悬停"), ("active", "按下")]),
    ]

    blocks = []
    for i, (title, items) in enumerate(groups):
        blocks.append('''      <div class="token-block" id="t%d">
        <h3>%s</h3>
        <div class="token-grid">
%s        </div>
      </div>
''' % (i, title, ''.join(swatch(n, note) for n, note in items)))

    type_rows = ''.join('''        <div class="type-row"><span class="k">--text-%s</span>
          <span style="font-size: var(--text-%s)">%s</span></div>
''' % (n, n, sample) for n, sample in [
        ("xxs", "11px 极小：标签、脚注"), ("xs", "12px 小：辅助信息"), ("sm", "13px 次要正文"),
        ("base", "14px 正文（默认值）"), ("md", "16px 小标题"), ("lg", "20px 区块标题"),
        ("xl", "24px 页面标题")])

    gap_rows = ''.join('''        <div class="type-row"><span class="k">--gap-%s</span>
          <span style="display:inline-block;height:12px;width:var(--gap-%s);background:var(--primary)"></span></div>
''' % (n, n) for n in ["1", "2", "3", "4", "5", "6"])

    shape_rows = ''.join('''        <div class="shape" style="border-radius: var(--r-%s)">--r-%s<span>%s</span></div>
''' % (n, n, val('r-' + n)) for n in ["sm", "md", "lg", "pill"])

    shadow_rows = ''.join('''        <div class="shadow-box" style="box-shadow: var(--shadow-%s)">--shadow-%s</div>
''' % (n, n) for n in ["1", "2", "3"])
    shadow_rows += '''        <div class="shadow-box" style="box-shadow: var(--ring)">--ring 焦点环</div>
'''

    toc = ''.join('        <a href="#t%d">%s</a>\n' % (i, t) for i, (t, _) in enumerate(groups))
    body = '''<section class="page-head">
  <div class="grid-bg"></div>
  <canvas id="bg" aria-hidden="true"></canvas>
  <div class="wrap page-head-in">
    <div class="crumb">DESIGN TOKENS</div>
    <h1>设计令牌全貌</h1>
    <p>桌面端 / 安卓端 / 插件界面与本站共用同一套令牌：中性蓝灰阶 + 黑色 primary 按钮 + 业务蓝强调，
      配 pill 控件与紧凑字号刻度。本页内容直接解析 <code>assets/tokens.css</code> 生成——改令牌即改此页。</p>
  </div>
</section>

<section class="block" style="border-bottom: 0">
  <div class="wrap token-cols">
    <aside class="toc">
      <strong>本页目录</strong>
%s      <a href="#type">字体与字号</a>
      <a href="#gap">间距</a>
      <a href="#shape">形状</a>
      <a href="#shadow">阴影与焦点环</a>
    </aside>
    <div>
%s      <div class="token-block" id="type">
        <h3>字体与字号</h3>
        <div class="type-row"><span class="k">--font-ui</span>
          <span style="font-family: var(--font-ui)">中文界面字体栈：PingFang SC / Hiragino Sans GB / Noto Sans SC …</span></div>
        <div class="type-row"><span class="k">--font-mono</span>
          <span style="font-family: var(--font-mono)">ui-monospace / SF Mono / JetBrains Mono</span></div>
%s      </div>
      <div class="token-block" id="gap">
        <h3>间距</h3>
        <p class="hint">方块宽度即间距值（4 / 8 / 12 / 16 / 24 / 32 像素）。</p>
%s      </div>
      <div class="token-block" id="shape">
        <h3>形状</h3>
        <div class="shape-row">
%s        </div>
      </div>
      <div class="token-block" id="shadow">
        <h3>阴影与焦点环</h3>
        <div class="shadow-row">
%s        </div>
        <p class="hint">布局令牌：<code>--sidebar-w: %s</code>（桌面端侧栏宽度）。</p>
      </div>
    </div>
  </div>
</section>
''' % (toc, ''.join(blocks), type_rows, gap_rows, shape_rows, shadow_rows, val('sidebar-w'))
    return head("设计令牌 · OneTHU",
                "OneTHU 设计令牌全貌：面 / 线 / 字色 / 品牌与强调 / 功能色 / 字体 / 字号 / 间距 / 形状 / 阴影——三端与站点共用同一套令牌。",
                "tokens") + body + FOOTER

if __name__ == '__main__':
    write('index.html', page_index())
    write('market.html', page_market())
    write('download.html', page_download())
    write('tokens.html', page_tokens())
