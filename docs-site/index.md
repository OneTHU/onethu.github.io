# OneTHU 文档

OneTHU 是清华大学校园助手应用：登录一次，网络学堂、信息门户、图书馆、校园卡、宿舍电费、
校园网、体育场馆与选课查询共用同一会话，覆盖 macOS / Windows / Android 三端，并通过插件
系统开放扩展能力。

本文档面向使用者、插件开发者与宿主贡献者，覆盖安装上手、插件与 API、系统架构、构建发布
与许可合规。

[:material-download: 下载最新版](https://github.com/smartThise/OneTHU/releases/latest){ .md-button .md-button--primary }
[:material-home: 官网](https://onethu.github.io/){ .md-button }
[:material-puzzle: 插件市场](https://onethu.github.io/market.html){ .md-button }

## 按角色进入

| 角色 | 阅读顺序 |
|---|---|
| **使用者**：安装、登录、排障 | [安装与上手](quickstart.md) → [外部作业源（接入）](external-homework.md) → [交流与反馈](community.md) |
| **插件开发者**：开发插件 | [插件开发指南](plugin-development.md) → [API 参考](api-reference.md) → [Rust sidecar 骨架](examples/harness-skel/README.md) |
| **宿主贡献者**：修改宿主实现 | [系统架构](architecture.md) → [构建与发布](build-and-release.md) → [安卓 release 陷阱与取证](android-release-traps.md) |
| **作业功能使用者与贡献者** | [作业区（聚合 / 忽略 / 提交）](homework.md) → [外部作业源（接入）](external-homework.md) |
| **外部作业源贡献者**：接入新平台 | [外部作业源（接入）](external-homework.md) → [外部作业源（设计与实测）](外部作业源-需求与实现方案.md) |
| **界面贡献者**：修改用户可见文案 | [UI 文案与信息密度](ui-copy-audit.md)；提交前执行 `pnpm lint:ui-copy` |
| **分发与合规**：确认许可范围 | [许可与致谢](license.md) |

## 文档全貌

| 页面 | 内容 |
|---|---|
| [文档导览](overview.md) | 全部文档索引、阅读路径与**接口真源**（以代码为准的权威文件清单） |
| [安装与上手](quickstart.md) | 三端安装、统一认证登录、首次使用与数据异常处理 |
| [构建与发布](build-and-release.md) | 环境要求、开发与生产构建命令、CI 发布链路、提交前自检 |
| [插件开发指南](plugin-development.md) | 插件形态与清单、权限模型、UI 通道与结构化结果、小组件、发版与市场收录、三种插件形态的通信协议 |
| [API 参考](api-reference.md) | `ctx.onethu.*` 命名空间与方法的完整参考 |
| [系统架构](architecture.md) | 进程模型、会话管线、插件宿主、主题系统、模型调度、构建流程 |
| [作业区（聚合 / 忽略 / 提交）](homework.md) | 作业分组与忽略、网络学堂附件上传与必交附件预检、雨课堂主观题原生作答、学术红线与测试工具 |
| [外部作业源（接入）](external-homework.md) | 雨课堂 / TUOJ / Tyche / DSA OJ 的接入方式、凭据维护与故障恢复 |
| [外部作业源（设计与实测）](外部作业源-需求与实现方案.md) | 接口探测、加密字体与 LaTeX 方案、原生详情页与嵌入式提交入口的实现记录 |
| [安卓 release 陷阱与取证](android-release-traps.md) | `@InvokeArg`、R8、UA 伪装等 release 专属故障与真机日志导出通道 |
| [脱敏演示版构建](demo-build.md) | `demo` 分支脱敏演示版与正式版的差异、脱敏规则与残余风险 |
| [UI 文案与信息密度](ui-copy-audit.md) | 文案禁用词与字数规则、历次用户反馈的根因与修法 |
| [许可与致谢](license.md) | MIT 附加限制、第三方组件授权范围与使用边界 |
| [交流与反馈](community.md) | 用户群、问题反馈与插件生态 |

## 关于本站

- **正文来源**：插件、API、架构等工程文档的正文位于主仓
  [`smartThise/OneTHU/docs`](https://github.com/smartThise/OneTHU/tree/dev3/docs)，
  由本站构建时同步；首页、快速开始、构建与发布、许可与致谢、交流与反馈在本站仓库维护。
- **更新方式**：文档随主仓更新自动重建，也可手动触发构建。文档与实现不一致时以代码为准，
  权威文件清单见 [文档导览](overview.md)。
- **许可**：文档站代码以 MIT 开源（见
  [本站 LICENSE](https://github.com/OneTHU/onethu.github.io/blob/main/LICENSE)）；
  正文中的名称、标识与截图归主仓所有。
