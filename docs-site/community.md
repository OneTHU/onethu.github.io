# 交流与反馈

## 1. 用户交流群

问题反馈、功能需求与使用经验可在 QQ 群交流：

![OneTHU 用户 QQ 群](qrcode_group.jpg){ width="240" }

## 2. 问题反馈

在 [Issues](https://github.com/smartThise/OneTHU/issues) 反馈时，附上以下信息可显著缩短定位时间：

| 信息 | 位置 |
|---|---|
| 应用版本与平台 | 设置 → 关于 |
| 诊断结果 | 设置 → 通知 → 诊断（核对权限与排程状态） |
| 运行日志 | 设置 → 关于 → 导出日志（Android 转存至系统下载目录） |
| 复现步骤 | 具体操作路径与预期结果 |

功能请求请说明使用场景；涉及校方接口变更的反馈，请勿附带账号、学号或成绩等个人信息。

## 3. 插件生态

| 入口 | 内容 |
|---|---|
| [插件市场](https://onethu.github.io/market.html) | 与应用内同一份名单，按主题 / 官方 / 社区分类 |
| [OneTHU-Market](https://github.com/smartThise/OneTHU-Market) | 市场名单仓库（`registry.json`），收录申请的提交处 |
| [OneTHU-plugin-hello](https://github.com/smartThise/OneTHU-plugin-hello) | JS 插件特性示例，可作为新插件模板 |
| [OneTHU-theme-barbie](https://github.com/smartThise/OneTHU-theme-barbie) | 主题插件示例（令牌覆盖、标识替换、附加 CSS） |
| [OneTHU-Harness](https://github.com/smartThise/OneTHU-Harness) | 官方骨干插件：对话助手与模型调度 |

插件开发从 [插件开发指南](plugin-development.md) 开始，接口细节查 [API 参考](api-reference.md)。

## 4. 参与贡献

- **分支**：日常开发在 `dev2`，发布线为 `dev3`；改动须先通过
  [构建与发布 §7](build-and-release.md#7-提交前自检) 的自检。
- **文案**：用户可见文案遵循 [UI 文案与信息密度](ui-copy-audit.md)，提交前执行 `pnpm lint:ui-copy`。
- **文档**：工程文档正文在主仓
  [`docs/`](https://github.com/smartThise/OneTHU/tree/dev3/docs)；
  首页、快速开始、构建与发布、许可与致谢、交流与反馈在本站仓库
  [`docs-site/`](https://github.com/OneTHU/onethu.github.io/tree/main/docs-site)。
