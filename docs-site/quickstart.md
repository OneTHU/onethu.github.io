# 安装与上手

## 1. 安装

安装包发布在 [GitHub Releases](https://github.com/smartThise/OneTHU/releases/latest)，
也可从 [官网下载页](https://onethu.github.io/download.html) 按平台直达。

| 平台 | 安装包 | 说明 |
|---|---|---|
| macOS | `.dmg` | Apple Silicon 与 Intel |
| Windows | `.exe` | x64 安装器（NSIS） |
| Android | `.apk` | arm64 与 universal；与桌面端功能对齐 |

首次打开 macOS 版若被 Gatekeeper 拦下，在「系统设置 → 隐私与安全性」中允许即可；
Android 版需允许「安装未知来源应用」。

## 2. 登录

1. 用清华大学统一认证账号登录，支持二次验证；
2. 登录一次后，网络学堂、信息门户、图书馆、校园卡等模块共用同一会话，无需重复登录；
3. 登录页可先进入**演示模式**查看界面与功能结构，再决定是否登录。

凭据只保存在本机，不会上传到任何第三方服务。

## 3. 首次使用建议

- **通知与提醒**：首次安装或导览结束后会申请通知权限（Android 13+ 不授权则提醒静默失效）。
  授权后可在「设置 → 通知」调整提前量与静默时段，并用「诊断」核对系统侧状态。
- **桌面小组件（Android）**：可在桌面添加 1×1 快捷方式、图标组或详情卡片；倒计时与
  「正在上课」按当前时间原生重算，深色模式自动跟随系统。
- **首页卡片**：导览可选今日页保留哪些卡片；插件原子（课程、作业、场馆等）可收藏后固定在首页。
- **外部作业源**：在「设置 → 外部作业源」登录雨课堂 / TUOJ / Tyche / DSA OJ，即可把各平台
  DDL 合并进「全部作业」与「今日」；只读，不提交、不答题。详见
  [外部作业源（接入）](external-homework.md)。

## 4. 数据异常怎么办

| 现象 | 处理 |
|---|---|
| 列表为空或数据陈旧 | 点页面右下角**刷新按钮**重试 |
| 反复失败 | 「设置 → 关于 → 导出日志」，把日志附在 Issue 中 |
| 通知不响 | 「设置 → 通知 → 诊断」核对授权与排程状态 |
| 在线服务 / 体育页打不开 | 应用内打开失败会给出原因提示，并回调系统浏览器 |

反馈入口见 [交流与反馈](community.md)。反馈时请附上应用版本、平台与「诊断」结果，
定位会快很多。

## 5. 开发者：跑起来

环境要求：Node ≥ 20、pnpm、Rust toolchain；Android 构建另需 Android SDK 与 NDK。

```bash
git clone https://github.com/smartThise/OneTHU.git
cd OneTHU
pnpm install                                  # workspace 全量装依赖

pnpm dev                                      # 纯浏览器预览（Vite dev server）
pnpm --filter @onethu/desktop tauri:dev       # 原生桌面壳开发模式（改前端即时热更）
```

浏览器预览直连校园网接口会受同源策略限制，接口相关的验证请在原生壳里做。
完整的构建、发布与提交前自检见 [构建与发布](build-and-release.md)。

!!! warning "使用边界"

    体育场馆模块**仅提供查询**（场馆 / 场次 / 余量 / 我的预约 / 退订），不提供应用内预约提交。
    严禁将本项目源码用于任何形式的自动预约、抢场或抢课。详见 [许可与致谢](license.md)。
