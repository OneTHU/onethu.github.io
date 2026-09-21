# 构建与发布

本文档说明 OneTHU 从源码到安装包的完整链路：环境要求、开发与生产构建、sidecar（Harness）
的构建位置、CI 发布与提交前自检。宿主实现细节见 [系统架构](architecture.md)，
安卓 release 专属故障见 [安卓 release 陷阱与取证](android-release-traps.md)。

## 1. 环境要求

| 用途 | 要求 |
|---|---|
| 全平台 | Node ≥ 20、pnpm、Rust toolchain（桌面 / 移动壳需 Rust 编译） |
| Android | Android SDK + NDK；`apps/desktop/src-tauri/gen/android` 为 git 跟踪的软链，目标目录必须在支持符号链接的卷上（如 APFS） |
| 桌面原生模块 | macOS 需 Xcode 命令行工具；Windows 需 MSVC 生成工具 |

!!! tip "载体选择"

    Rust 与前端构建都应在本地磁盘（APFS / NTFS）上进行。仓库放在 exFAT 等外置卷时，
    用 `CARGO_TARGET_DIR` 把 Cargo 产物指到本地磁盘，避免硬链接与权限相关的构建失败。

## 2. 仓库结构

```
OneTHU/
├── packages/
│   ├── core/        @onethu/core      统一 API 客户端与数据层
│   ├── info-lib/    thu-info-lib 移植 信息门户数据层
│   └── ui/          @onethu/ui        设计令牌与基础样式
├── apps/
│   └── desktop/     @onethu/desktop   桌面端 + Android（Tauri 2，Vite + React）
├── plugins/
│   └── OneTHU-Harness/                官方骨干插件（Rust sidecar / Android 内嵌）
├── tools/                             各类 Node 侧测试与检查脚本
└── docs/                              本文档正文来源
```

## 3. 日常开发

```bash
pnpm install                                  # workspace 全量装依赖

pnpm dev                                      # 纯浏览器预览（Vite dev server）
pnpm --filter @onethu/desktop tauri:dev       # 原生桌面壳开发模式（前端热更）

bash apps/desktop/scripts/dev-launch.sh       # tauri:dev 的实际入口（含前置清理）
node apps/desktop/scripts/build-harness.mjs   # 重建 Harness sidecar
```

浏览器预览读不到原生传输层的响应头与会话 Cookie，涉及登录态、插件宿主、通知、
小组件的验证必须在原生壳中进行。

## 4. 生产构建

```bash
pnpm build                                              # 构建全部包；web 资产产出到 apps/desktop/dist
pnpm --filter @onethu/desktop build:harness             # 构建 sidecar（必须先于打包）

pnpm --filter @onethu/desktop tauri:build               # 桌面安装包（自动先跑前端构建）
pnpm --filter @onethu/desktop exec tauri android build --apk   # Android APK（arm64 / universal）
bash apps/desktop/scripts/build-demo-apk.sh             # 脱敏演示版 APK（见「脱敏演示版构建」）
```

| 产物 | 路径 |
|---|---|
| 桌面安装包 | `apps/desktop/src-tauri/target/release/bundle/` |
| Android APK | `apps/desktop/src-tauri/gen/android/.../build/outputs/apk/` |
| 前端资产 | `apps/desktop/dist/` |

!!! warning "sidecar 必须在目标平台现场构建"

    仓库不携带任何架构的二进制。Harness sidecar 若在错误平台上构建并打进安装包，
    插件宿主拉起必然失败。CI 在目标平台现场构建，本地跨平台打包时同样需要先重建。

## 5. CI 发布链路

`.github/workflows/release.yml`：

| 触发 | 行为 |
|---|---|
| 推送 `v*` 标签 | 构建 macOS（aarch64，`.dmg`）与 Windows（NSIS `.exe`）安装包并上传为 Release 产物 |
| 手动触发 | 可只跑 Windows job，用于日常验证 Windows 构建链 |

Android APK **不在 CI 构建**：`gen/android` 不入库，签名在本机完成。发布前请核对
签名版本号与 `tauri.conf.json` 中的版本号一致。

## 6. 分支约定

| 分支 | 用途 |
|---|---|
| `dev2` | 日常开发（推送到远端的 `dev3`） |
| `dev3` | 发布线（GitHub 与清华 GitLab 两个远端同步） |
| `demo` | 脱敏演示版：包名 `app.onethu.demo`，可与正式版共存，见 [脱敏演示版构建](demo-build.md) |

## 7. 提交前自检

```bash
pnpm typecheck                                  # 全包类型检查
pnpm lint:ui-copy                               # 用户可见文案纪律（见「UI 文案与信息密度」）

node --import ./tools/ts-resolve-register.mjs tools/plugin-ui-test.mjs   # 需要编译 TS 的测试
node tools/exthw-status-test.mjs                                          # 纯 JS 测试

cd apps/desktop/src-tauri && cargo check && cargo test --lib              # Rust 侧
cd apps/desktop/src-tauri/gen/android && ./gradlew :tauri-plugin-onethu-mobile:compileDebugKotlin
```

`tools/` 下的测试脚本覆盖通知编排、小组件快照与原生重画、外部作业源状态、插件 UI 逻辑、
主题联动、市场名单解析等链路，是改动的第一道护栏。完整的命令清单（含 Android 目标交叉
检查、macOS 通知探针、Windows 通知模块编译检查）见
[系统架构 §8](architecture.md#8-构建与发布)。

## 8. 常见构建陷阱

| 陷阱 | 现象 | 处理 |
|---|---|---|
| exFAT / 网络卷上构建 | 链接与权限错误、构建产物异常 | 产物目录指向本地磁盘 |
| 新增 Tauri Android 命令参数类缺 `@InvokeArg` | release 包调用即抛 `no Creators`，debug 包正常 | 参数类必须加注解，并在 release 包真机验证 |
| XML 注释中出现 `--` | AAPT 资源解析直接失败 | 注释内不要写连续短横线 |
| `res/` 下出现 `._*` 文件 | AppleDouble 被当作资源 | 构建前 `find res -name '._*' -delete` |
| 裸 UA 字符串判定安卓 | 主窗口伪装导致判定恒假 | 多信号判定，见对应文档 |

详细成因、复现与取证通道见 [安卓 release 陷阱与取证](android-release-traps.md)。

## 9. 文档站自身的构建

本站（`onethu.github.io` 的 `/docs/` 路径）由 Material for MkDocs 构建，正文同步自主仓
`docs/`：

```bash
bash tools/sync-docs.sh          # 主仓文档 → docs-src/（本仓库预览用；CI 会检出主仓）
bash tools/docs-serve.sh         # 本地预览 http://127.0.0.1:8000
```

构建与部署细节（Pages 托管、定时重建、依赖锁定）见
[本站仓库 README](https://github.com/OneTHU/onethu.github.io#文档站)。
