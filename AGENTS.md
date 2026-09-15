# AGENTS.md

本文件供 AI 编码助手阅读，帮助其快速了解本项目并正确开展工作。

## 项目概述

`easemob-demo-vue3` 是一款社区维护版环信（Easemob）IM Demo 应用，计划基于社区维护的 Vue3 UIKit（`vue3-uikit`）构建。**当前项目处于脚手架阶段**：路由、布局、axios 封装、Pinia store 已搭好骨架，登录态校验、token 注入、401 跳转、页面标题 i18n 化等基础链路已实现，登录 / 会话 / 通讯录等页面仍为占位页，IM 相关逻辑尚未接入（代码中留有 `TODO` 注释标注后续工作，如统一错误提示、接入 uikit 组件等）。

- 包管理器：pnpm 10+（`packageManager: pnpm@10.24.0`）
- Node.js：>= 20.19

## 技术栈

- Vue 3（`<script setup lang="ts">`）+ TypeScript（strict 模式）
- Vite 8（构建与开发服务器）
- Vue Router 5（路由，含全局守卫）
- Pinia 4（状态管理）
- Axios（HTTP 请求，二次封装见 `src/api/request.ts`）
- NProgress（路由进度条）
- Sass（样式预处理）
- eruda（H5 真机调试面板，仅开发环境且移动端加载）
- Vitest 4（单元测试，环境 happy-dom，配置见 `vitest.config.ts`，用例统一放 `tests/unit/` 并与 `src/` 镜像，详见 skill `unit-testing`）
- ESLint 10（flat config）+ Prettier 3

## 常用命令

```bash
pnpm install     # 安装依赖
pnpm dev         # 启动开发服务器（默认 5173 端口）
pnpm build       # 先 vue-tsc 类型检查，再 vite build 生产构建
pnpm preview     # 预览生产构建产物
pnpm test        # 运行单元测试（Vitest，一次执行）
pnpm test:watch  # 运行单元测试（watch 模式）
pnpm lint        # ESLint 检查
pnpm lint:fix    # ESLint 自动修复
pnpm format      # Prettier 格式化 src 下的 ts/vue/css/scss
pnpm release     # 正式打版：node scripts/release.mjs <major|minor|patch>（见 skill release）
```

**注意**：提交代码前以 `pnpm build`（含类型检查）、`pnpm lint`、`pnpm test` 全部通过为准；改动 `src/api`、`src/store`、`src/composables`、`src/utils`、`src/config` 等被测试覆盖的模块时，必须同步补充/更新 `tests/unit/` 下对应测试。

## 目录结构

```
├── index.html
├── vite.config.ts          # alias @、dev server proxy、环境变量加载
├── vitest.config.ts        # Vitest 单元测试配置（happy-dom 环境、@ 别名、include 只扫 tests/）
├── .env.development        # 开发环境变量（VITE_API_BASE_URL、VITE_PROXY_TARGET、VITE_API_TIMEOUT）
├── .env.production         # 生产环境变量（VITE_API_BASE_URL、VITE_API_TIMEOUT）
├── eslint.config.js        # ESLint flat config
├── .prettierrc             # Prettier 配置
├── tests/
│   └── unit/               # 单元测试（Vitest，*.spec.ts），目录结构与 src/ 镜像，导入被测模块用 @/ 别名
└── src/
    ├── main.ts             # 入口，挂载 pinia / router，引入全局样式
    ├── App.vue
    ├── env.d.ts            # import.meta.env 类型声明
    ├── api/                # axios 封装（request.ts）与接口模块（user.ts）
    ├── router/             # 路由表 + 全局守卫（index.ts）
    ├── store/              # Pinia 实例（index.ts）与模块（modules/）
    ├── locales/            # vue-i18n 语言包与实例（index.ts / zh-CN.ts / en-US.ts）
    ├── layout/             # 主布局（index.vue，左侧导航 + router-view）
    ├── views/              # 页面：login / chat / contacts（含 components/ 自研联系人、群组卡片）/ settings（含 components/ 子面板）/ error(404)
    ├── components/         # 公共组件（含 icons/ 自定义 SVG 图标组件）
    ├── composables/        # 组合式函数（useTheme/useMobileView/useDemoSettings 聚合层等，各域实现见 demo-settings/）
    ├── utils/              # 工具函数（env.ts、pinyin.ts、color.ts、uikit.ts）
    ├── styles/             # 全局样式：index.scss / reset.scss / themes.scss(主题 CSS 变量) / variables.scss
    └── types/              # 共享业务类型（index.d.ts：ApiResult / PageQuery / PageResult / LoginResult）
```

## 架构要点

- **路径别名**：`@` 指向 `src/`（`vite.config.ts` 与 `tsconfig.app.json` 均已配置），导入 src 内模块一律使用 `@/`。
- **接口代理**：开发环境 `/api` 代理到 `VITE_PROXY_TARGET`（默认 `http://localhost:8080`），代理时去掉 `/api` 前缀。
- **环境变量**：仅暴露 `VITE_` 前缀变量；新增变量需在 `src/env.d.ts` 的 `ImportMetaEnv` 中补充类型声明。`VITE_API_TIMEOUT` 为请求超时（毫秒），未配置时 request 默认 15000。
- **HTTP 封装**：`src/api/request.ts` 中 axios 实例读取 `VITE_API_BASE_URL` 作为 baseURL、`VITE_API_TIMEOUT` 作为超时；请求拦截器自动注入 `Authorization: Bearer <token>`；响应拦截器按后端统一结构 `{ code, message, data }` 拆包，`code !== 0` 视为业务错误并 reject，HTTP 401 时清除登录态并跳转 `/login`（带 `redirect` 参数，防抖避免并发重复跳转）。**接口模块一律用类型友好的 `http.get<T> / http.post<T> / http.put<T> / http.delete<T>`（`src/api/request.ts` 导出）声明返回类型，不要直接用 `request.post<unknown, unknown>(...)`**；共享响应类型见 `src/types/index.d.ts`（`ApiResult` / `PageQuery` / `PageResult` / `LoginResult`）。
- **路由**：全部页面组件使用动态 `import()` 懒加载；`beforeEach` 守卫负责 NProgress、登录态校验（`meta.requiresAuth`，未登录访问受保护页跳 `/login` 并携带 `redirect`，已登录访问 `/login` 跳 `/chat`）与页面标题（`meta.title` 存 i18n key，标题后缀为「环信 IM Demo」）；`/` 重定向到 `/chat`，未知路径落到 404 页。
- **Pinia**：使用选项式 `defineStore`（见 `src/store/modules/user.ts`），当前仅有用户 store 占位。
- **vue3-uikit 联调（tgz 方式，当前采用）**：`package.json` 的 dependencies 与 `pnpm.overrides` 均通过 `file:./easemob-uikit-core-2.6.0.tgz` / `file:./easemob-uikit-im-3.5.1.tgz` / `file:./easemob-uikit-sdk-contract-1.2.0.tgz` / `file:./easemob-uikit-sdk-websdk5-1.2.2.tgz` 引用本地 tgz（位于仓库根目录，不入库）。uikit 3.x 起为双 adapter 架构（D122）：除 core/im 外还需同步 `uikit-sdk-contract` 与 `uikit-sdk-websdk5`（5.x 适配器）两个 tgz，且入口必须 `import '@easemob/uikit-im/websdk5'` 注册默认适配器（见 `src/main.ts`）。uikit 源码仓库（`../UIKIT/easemob-uikit-vue/packages/uikit-core|uikit-im|uikit-sdk-contract|uikit-sdk-websdk5`）重新打包产出新 tgz 后，**必须把新打的 tgz 复制到本 demo 根目录、同步更新 `package.json` 依赖与 `pnpm.overrides` 的 tgz 文件名、执行 `pnpm install`，并重启 `pnpm dev`**——换 tgz 后运行中的 dev server 会继续服务旧版本的 vite 预打包缓存（`node_modules/.vite` 不自动刷新，典型症状：黑名单等新功能不出现、样式无变化）。`vite.config.ts` 已内置防呆（检测到已安装 uikit 产物比缓存新时自动清缓存），兜底可 `rm -rf node_modules/.vite` 后重启。**注意：uikit 仓库升级版本（如 2.6.0→2.7.0）后 tgz 文件名也会变，务必用新文件名重打/复制**。完整流程与排查见 skill `uikit-tgz-integration`。
- **vue3-uikit 联调（源码方式，备选）**：需要直接调试 uikit 源码时，可在 `vite.config.ts` 的 `resolve.alias` 中将其指向源码目录（配置文件中有注释示例）。
- **H5 适配**：桌面/H5 双模式响应式（`useMobileView` 768px 断点切换布局形态），样式统一直接写 px、不做 px→vw 转换（曾用 postcss-px-to-viewport，因双模式响应式下会放大桌面优先组件且转换量为 0 而移除，历史见 `.agent/skills/h5-adaptation`），安全区用 `safe-area-top/bottom` 工具类。细则见 `.agent/skills/h5-adaptation`。
- **设备判断**：启动期决策用 `isMobile`（`src/utils/env.ts`，UA 静态判断），运行期交互/布局切换用 `useMobileView`（`src/composables/useMobileView.ts`，768px 断点，响应式），勿混用。细则见 `.agent/skills/h5-adaptation`。
- **设置抽屉**：layout 主区右侧内置滑出抽屉（`src/layout/SettingsDrawer.vue`），开关由 `useSettingsDrawer`（`src/composables/useSettingsDrawer.ts`，模块级共享状态）控制；以挤占式布局展开（flex 兄弟节点宽度 0→360px 过渡动画，H5 占满主区），非遮盖，供 UIKit 特性设置按钮触发。
- **特性诱导展示**：navbar 特性图标右下角的诱导红点与右侧广告弹层（资源 `src/assets/feature-promo.png`）由 `useFeaturePromo`（`src/composables/useFeaturePromo.ts`，模块级共享状态）控制；登录成功时 `resetOnLogin()` 重置为展示，点特性图标隐藏红点、点弹层右上角 X 关闭弹层，下一次登录再次展示（内存态，不落盘）。
- **多语言**：`vue-i18n`，语言包在 `src/locales/`（zh-CN / en-US，key 需保持同步）；模板用 `$t`，脚本用 `useI18n()`。新增文案/语言的流程见 `.agent/skills/i18n`。
- **深色模式**：颜色一律用 `var(--color-*)` CSS 变量（定义在 `src/styles/themes.scss`），禁止写死色值；主题切换用 `useTheme`（`src/composables/useTheme.ts`）。约定与用法见 `.agent/skills/dark-mode`。
- **VueUse**：已安装 `@vueuse/core`（见 `package.json`），组合式工具优先从 VueUse 复用，不要重复造轮子。

## 代码风格

- **注释与文档使用中文**（项目内注释、README 均为中文），遵循现有风格。
- 组件一律使用 `<script setup lang="ts">`，并用 `defineOptions({ name: '...' })` 显式命名（如 `AppLayout`、`LoginPage`）。
- CSS 类名使用 BEM 风格（如 `app-layout__aside`）；颜色用 `themes.scss` 的 CSS 变量，与主题无关的 Sass 变量集中在 `src/styles/variables.scss`。
- Prettier：无分号、单引号、尾随逗号、行宽 100、LF 换行。
- ESLint：`js.configs.recommended` + `typescript-eslint` recommended + `eslint-plugin-vue` flat/recommended + `eslint-config-prettier`（忽略 `dist` 和 `node_modules`）。
- TypeScript 开启 `strict`、`noUnusedLocals`、`noUnusedParameters`、`verbatimModuleSyntax` 等严格选项，注意类型导入使用 `import type`。

## 安全注意事项

- `.env.development` / `.env.production` 只存放非敏感配置（当前仅 API 地址）；**不要**把密钥、token 等敏感信息提交进仓库。
- 滑块验证（阿里云验证码 2.0）与短信相关配置放在 `.env.production.local`（已被 `.gitignore` 的 `*.local` 规则排除，仅生产构建加载）；入库模板为 `.env.production.local.example`，新增配置项时同步更新模板；业务侧通过 `src/config/captcha.ts` 的 `captchaConfig` 读取，`enabled` 仅在生产且配置齐全时为 true。
- 登录态链路已打通：请求拦截器注入 token、响应拦截器 401 统一跳转登录（`src/api/request.ts`）、路由守卫 `requiresAuth` 校验（`src/router/index.ts`）；登录页面本身仍是占位页，接入 uikit/真实接口时注意不要硬编码凭据，登录成功后调用 `useUserStore().setToken(...)` 即可由守卫自动放行。

## 部署

通过 `pnpm build` 产出静态资源到 `dist/`，可用 `pnpm preview` 本地预览。目前仓库中没有 CI/CD、Docker 等部署配置。

## Skills

项目级 skills 存放在 `.agent/skills/`，按需加载：

- `h5-adaptation`：H5 适配细则（双模式响应式断点、px 不转换的约定与历史、安全区、设备判断、eruda 调试）
- `i18n`：多语言使用与扩展流程（新增文案 key、新增语言）
- `dark-mode`：深色模式约定与使用（CSS 变量、useTheme、uikit 主题联动约定）
- `uikit-tgz-integration`：uikit tgz 换版流程、vite 预打包缓存坑与防呆（新功能/样式不生效时优先查）
- `unit-testing`：单元测试目录约定（tests/unit/ 与 src/ 镜像）、Vitest 用法、改代码必须同步更新测试的硬性约束
- `release`：提交规范（Conventional Commits 中文描述）与打版发布流程（`pnpm release`、CHANGELOG 纪律）
