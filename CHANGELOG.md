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

- 特性设置抽屉：layout 主区右侧滑出（挤占式布局，H5 占满主区），含外观面板（主题模式、主题色取色器、颜色微调、组件风格、一键重置），接入 UIKit 2.6.0 `useTheme`
- 特性诱导展示：navbar 特性图标诱导红点 + 右侧广告弹层，登录成功重置展示、关闭后下次登录再展示
- 短信验证码登录链路：`src/api/sms.ts` 接口封装（登录 v2 / 注册重置 / 图片验证码三条链路，独立 axios 实例 + AES-GCM 加密）、`useSmsCode` 发送与倒计时组合式函数、登录页接入
- 设置页 `src/views/settings/`（账号信息 / 通用设置 / 关于我们）
- 自定义 SVG 图标组件集 `src/components/icons/`

### 变更

- **移除 px→vw 转换**：删除 `postcss-px-to-viewport-8-plugin` 依赖与 `postcss.config.js`，H5 适配回归纯响应式（768px 断点切换 + 固定 px 布局），样式一律直接写 px；约定与历史背景见 `.agent/skills/h5-adaptation`
- uikit 升级：`@easemob/uikit-core` 1.3.0 → 1.4.0，`@easemob/uikit-im` 2.5.0 → 2.6.0（本地 tgz 方式）
- 登录页接入短信验证码（含生产环境阿里云验证码 2.0 配置项，见 `.env.production.local.example`）
- 开发者模式相关组合式函数（`useDevMode` / `useUIKitConfig`）完善

### 修复

- 修复特性抽屉外观面板被 postcss px→vw 静默转换导致的桌面端异常放大（字级/尺寸按视口等比放大数倍）

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
