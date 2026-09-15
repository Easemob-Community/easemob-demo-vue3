# Changelog

本项目的所有重要变更均记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。新增条目遵循以下分类：

- `新增`：新功能、新组件、新页面
- `修复`：Bug 修复
- `变更`：行为变化、重构、依赖调整
- `文档`：文档与注释的增补

## [Unreleased]

### 新增

- 新版本检测提示：轮询部署后 index.html 的 ETag/Last-Modified 指纹，检测到新构建后弹不可关闭弹窗引导刷新（`useCheckUpdates` + `CheckUpdates`，挂载于 AppLayout）
- 添加联系人支持手机号或用户 ID：自定义添加联系人弹窗（`AddContactModal` + `useContactAdd`，替换 `useContactSearch`），手机号经 App Server 解析为用户 ID，前置拦截「添加自己 / 已是好友」，并覆盖 UIKit 内置弹窗文案（`uikit-locale.ts`）
- 自动登录加载与失败态：刷新后自动登录期间全屏 loading，失败展示错误详情与「重新登录」入口（AppInitializer）

### 变更

- uikit-im tgz 刷新至 3.5.1
- 设置各子面板头部对齐 UIKit 会话列表头部（48px、无底线），关于我们注册链接补充 utm 参数

## [0.3.0] - 2026-09-15

UIKit 接入后的首轮结构优化：消除复制样板、拆分巨型组件、测试体系独立成目录，并建立提交规范与自动打版流程。

### 新增

- 组合式函数：`useSidebarWidth`（侧边栏宽度持久化）、`usePresenceSubscription`（presence 订阅/退订）、`initUIKit`（`src/utils/uikit.ts`，统一 SDK 初始化入口）
- 颜色工具 `src/utils/color.ts`（hsl/rgb/hsb/hex 互转纯函数）与取色器组件组 `src/components/settings/color-picker/`（2D 饱和度面板、色相条、明度条、取色器容器）
- `src/composables/demo-settings/`：useDemoSettings 按域拆分为 chat / conversation / contacts / notice / logger / ai / provider 七个单域单例 composable
- 账户信息子组件组 `src/views/settings/components/account/`（ProfileDisplay / ProfileEditor / AvatarSection / DangerZone）
- 单元测试独立目录 `tests/unit/`（与 `src/` 镜像，导入用 `@/` 别名）与项目 skill `unit-testing`（改被测模块必须同步更新测试的硬性约束）
- 提交规范与打版流程：skill `release` + `scripts/release.mjs`（`pnpm release <major|minor|patch>`：全量检查 → 升版本 → 归档 CHANGELOG → 提交打 tag）

### 变更

- **拆分巨型组件**：SettingsAppearancePanel 1420 → 838 行（颜色工具与取色器外移）、AccountInfo 726 → 85 行（薄编排层 + 四个子组件）
- **消除复制样板**：三处侧边栏宽度持久化逻辑收敛为 `useSidebarWidth`；ContactCard/AccountInfo 的 presence 订阅样板收敛为 `usePresenceSubscription`；AppInitializer/LoginForm 的 init 断言收敛为 `initUIKit`；SettingsDrawer 的 PC/H5 重复面板链收敛为动态组件
- **测试迁移**：16 个 spec 从 src/ 迁至 `tests/unit/` 镜像目录，`vitest.config.ts` 只扫 tests/，`tsconfig.app.json` 纳入 tests 保持类型检查
- 开发者配置移除 `useCustomServer` 开关，私有服务器（imServer/restServer）字段仅在开启 `usePrivateServer` 时显示

### 修复

- 修复 AppInitializer 初始化 IM SDK 未 `await` 的潜在时序问题

### 文档

- AGENTS.md 同步目录结构（tests/unit、composables、utils 实际内容）、Skills 列表新增 `unit-testing` 与 `release`


## [0.2.0] - 2026-08-28

预生产发布阶段：在 0.1.0 脚手架基础上完成账户信息、消息通知、GIF 表情包、UIKIT 特性开关等核心 Demo 能力。

### 新增

- 特性设置抽屉：layout 主区右侧滑出（挤占式布局，H5 占满主区），含外观面板（主题模式、主题色取色器、颜色微调、组件风格、一键重置），接入 UIKit `useTheme`
- 特性诱导展示：navbar 特性图标诱导红点 + 右侧广告弹层，登录成功重置展示、关闭后下次登录再展示
- 短信验证码登录链路：`src/api/sms.ts` 接口封装（登录 v2 / 注册重置 / 图片验证码三条链路，独立 axios 实例 + AES-GCM 加密）、`useSmsCode` 发送与倒计时组合式函数、登录页接入
- 设置页 `src/views/settings/`（账号信息 / 通用设置 / 关于我们）
- 账户信息页：昵称 / 签名编辑、ID 复制、头像上传与裁剪、`AvatarCropperModal` 组件、在线状态展示、账户注销
- 设置 - 通用：消息通知总开关（与 UIKit `useNotification` 联动），默认关闭
- 自定义 GIF 表情包：`src/assets/emojis/` 资源与 `stickerPacks` 注入，emoji picker sticker 标签页 4 列等比展示
- 自定义 SVG 图标组件集 `src/components/icons/`

### 变更

- **移除 px→vw 转换**：删除 `postcss-px-to-viewport-8-plugin` 依赖与 `postcss.config.js`，H5 适配回归纯响应式（768px 断点切换 + 固定 px 布局），样式一律直接写 px；约定与历史背景见 `.agent/skills/h5-adaptation`
- uikit 升级：`@easemob/uikit-core` 1.3.0 → 1.5.2，`@easemob/uikit-im` 2.5.0 → 2.8.2（本地 tgz 方式）
- 消息通知总开关默认状态由开启改为关闭
- 登录页接入短信验证码（含生产环境阿里云验证码 2.0 配置项，见 `.env.production.local.example`）
- 开发者模式相关组合式函数（`useDevMode` / `useUIKitConfig`）完善

### 修复

- 修复特性抽屉外观面板被 postcss px→vw 静默转换导致的桌面端异常放大（字级/尺寸按视口等比放大数倍）
- 修复 emoji picker 的 4 列 grid 样式误作用于「常用」普通 emoji 标签页，改为仅 sticker（GIF）标签页生效

### 文档

- 新增 `CHANGELOG.md`（本文件）
- 新增「短信验证码接口接入文档.md」
- README / AGENTS.md / `h5-adaptation` skill 同步更新为新的 H5 适配约定

## [0.1.0] - 2026-08-26

脚手架与基础能力阶段（2026-07-29 ～ 2026-08-26），涵盖仓库初始化至开发者模式完善的 13 个提交。

### 新增

- 项目脚手架：Vue 3 + TypeScript + Vite + Vue Router + Pinia + Axios + Sass + Vitest + ESLint/Prettier，主布局壳、路由守卫与 AGENTS.md / skills 骨架（2026-08-24）
- 多语言（vue-i18n，zh-CN / en-US）与深色模式（`themes.scss` CSS 变量 + `useTheme`，light / dark / auto，localStorage 持久化）（2026-08-24）
- 登录页：组件化拆分（LoginHero / LoginForm / LoginCaptcha / LoginDevConfig），复刻 Figma 视觉，接入多语言与动态版本号（`src/config/version.ts`）（2026-08-25）
- uikit（vue3-uikit）接入：本地 tgz 方式（`file:` 依赖 + `pnpm.overrides`），会话 / 通讯录页接入会话列表与联系人列表，provider 开启 `enable-presence` 展示侧边栏在线状态（2026-08-25）
- 开发者模式：dev 环境配置 appKey、支持 userId / token 直登；`useDevMode` / `useUIKitConfig` 统一触发与配置持久化开关（2026-08-25 ～ 08-26）
- 单元测试体系（Vitest + happy-dom）：axios 封装、user store、captcha、config 等模块用例
- 项目 skills：`dark-mode` / `h5-adaptation` / `i18n` / `uikit-tgz-integration`

### 变更

- axios 二次封装完善：token 自动注入、HTTP 401 统一跳转登录（redirect 防抖）、按 `{ code, message, data }` 拆包并类型化 `http.get/post/put/delete`（2026-08-24）
- 路由守卫：`requiresAuth` 登录态校验、页面标题 i18n、NProgress（2026-08-24）
- 滑块验证（阿里云验证码 2.0）配置准备：`src/config/captcha.ts` + `.env.production.local.example`，请求层与配置模块补单测（2026-08-24）
- 登录页、布局壳、会话 / 通讯录 / 设置页加入 postcss px→vw 的 exclude（桌面优先固定像素布局不参与转换；该机制后续已在 Unreleased 中整体移除）（2026-08-25）
- uikit 主题联动：UIKit Provider 传入主题配置、优化布局容器（2026-08-25）

### 修复

- 让开发者配置中的 appKey 真正传入 UIKit 并修正登录参数（2026-08-25）

### 文档

- README / AGENTS.md 随各里程碑持续更新
