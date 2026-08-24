# AGENTS.md

本文件供 AI 编码助手阅读，帮助其快速了解本项目并正确开展工作。

## 项目概述

`easemob-demo-vue3` 是一款社区维护版环信（Easemob）IM Demo 应用，计划基于社区维护的 Vue3 UIKit（`vue3-uikit`）构建。**当前项目处于脚手架阶段**：路由、布局、axios 封装、Pinia store 已搭好骨架，登录 / 会话 / 通讯录等页面均为占位页，IM 相关逻辑尚未接入（代码中留有 `TODO` 注释标注后续工作，如登录态校验、token 注入、401 跳转等）。

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
- postcss-px-to-viewport-8-plugin（H5 端 px 转 vw，配置见 `postcss.config.js`）
- eruda（H5 真机调试面板，仅开发环境且移动端加载）
- ESLint 10（flat config）+ Prettier 3

## 常用命令

```bash
pnpm install     # 安装依赖
pnpm dev         # 启动开发服务器（默认 5173 端口）
pnpm build       # 先 vue-tsc 类型检查，再 vite build 生产构建
pnpm preview     # 预览生产构建产物
pnpm lint        # ESLint 检查
pnpm lint:fix    # ESLint 自动修复
pnpm format      # Prettier 格式化 src 下的 ts/vue/css/scss
```

**注意**：项目目前没有任何测试框架（无 Vitest / Jest / Playwright 等依赖和配置），提交代码前以 `pnpm build`（含类型检查）和 `pnpm lint` 通过为准。

## 目录结构

```
├── index.html
├── vite.config.ts          # alias @、dev server proxy、环境变量加载
├── .env.development        # 开发环境变量（VITE_API_BASE_URL、VITE_PROXY_TARGET）
├── .env.production         # 生产环境变量（VITE_API_BASE_URL）
├── eslint.config.js        # ESLint flat config
├── .prettierrc             # Prettier 配置
├── postcss.config.js       # H5 适配：px 自动转 vw（375 设计稿基准）
└── src/
    ├── main.ts             # 入口，挂载 pinia / router，引入全局样式
    ├── App.vue
    ├── env.d.ts            # import.meta.env 类型声明
    ├── api/                # axios 封装（request.ts）与接口模块（user.ts）
    ├── router/             # 路由表 + 全局守卫（index.ts）
    ├── store/              # Pinia 实例（index.ts）与模块（modules/）
    ├── layout/             # 主布局（index.vue，左侧导航 + router-view）
    ├── views/              # 页面：login / chat / contacts / error(404)，均为占位页
    ├── components/         # 公共组件（空，含 .gitkeep）
    ├── composables/        # 组合式函数（空，含 .gitkeep）
    ├── utils/              # 工具函数（空，含 .gitkeep）
    ├── styles/             # 全局样式：index.scss / reset.scss / variables.scss
    └── types/              # 全局类型声明（index.d.ts）
```

## 架构要点

- **路径别名**：`@` 指向 `src/`（`vite.config.ts` 与 `tsconfig.app.json` 均已配置），导入 src 内模块一律使用 `@/`。
- **接口代理**：开发环境 `/api` 代理到 `VITE_PROXY_TARGET`（默认 `http://localhost:8080`），代理时去掉 `/api` 前缀。
- **环境变量**：仅暴露 `VITE_` 前缀变量；新增变量需在 `src/env.d.ts` 的 `ImportMetaEnv` 中补充类型声明。
- **HTTP 封装**：`src/api/request.ts` 中 axios 实例读取 `VITE_API_BASE_URL` 作为 baseURL；响应拦截器按后端统一结构 `{ code, message, data }` 拆包，`code !== 0` 视为业务错误并 reject；拦截器已把返回值拆包为 `data`，接口模块调用签名写成 `request.post<unknown, unknown>(...)` 的形式。
- **路由**：全部页面组件使用动态 `import()` 懒加载；`beforeEach` 守卫负责 NProgress 与页面标题（标题后缀为「环信 IM Demo」），登录态校验为 TODO；`/` 重定向到 `/chat`，未知路径落到 404 页。
- **Pinia**：使用选项式 `defineStore`（见 `src/store/modules/user.ts`），当前仅有用户 store 占位。
- **vue3-uikit 联调**：自研 `vue3-uikit` 本地联调时，可在 `vite.config.ts` 的 `resolve.alias` 中将其指向源码目录（配置文件中有注释示例）。
- **H5 适配**：样式按 375 设计稿写 px，`postcss-px-to-viewport-8-plugin`（`postcss.config.js`）构建时自动转 vw；个别不需转换的元素加 `keep-px` 类；`node_modules` 默认排除不转换；刘海屏用全局工具类 `safe-area-top` / `safe-area-bottom`；开发环境且移动端（UA 判断，见 `src/utils/env.ts`）自动加载 eruda，PC 与生产不加载。
- **设备判断**：分两套，勿混用——UA 静态判断 `isMobile`（`src/utils/env.ts`）只用于启动期决策（如 eruda 加载）；运行期响应式判断用 `useMobileView`（`src/composables/useMobileView.ts`，基于 VueUse `useMediaQuery`，768px 断点），窗口变化自动更新。
- **VueUse**：已安装 `@vueuse/core`（见 `package.json`），组合式工具优先从 VueUse 复用，不要重复造轮子。

## 代码风格

- **注释与文档使用中文**（项目内注释、README 均为中文），遵循现有风格。
- 组件一律使用 `<script setup lang="ts">`，并用 `defineOptions({ name: '...' })` 显式命名（如 `AppLayout`、`LoginPage`）。
- CSS 类名使用 BEM 风格（如 `app-layout__aside`）；Sass 全局变量集中在 `src/styles/variables.scss`。
- Prettier：无分号、单引号、尾随逗号、行宽 100、LF 换行。
- ESLint：`js.configs.recommended` + `typescript-eslint` recommended + `eslint-plugin-vue` flat/recommended + `eslint-config-prettier`（忽略 `dist` 和 `node_modules`）。
- TypeScript 开启 `strict`、`noUnusedLocals`、`noUnusedParameters`、`verbatimModuleSyntax` 等严格选项，注意类型导入使用 `import type`。

## 安全注意事项

- `.env.development` / `.env.production` 只存放非敏感配置（当前仅 API 地址）；**不要**把密钥、token 等敏感信息提交进仓库。
- 登录 token 的注入与 401 跳转仍是 TODO（`src/api/request.ts`、`src/router/index.ts`），实现时注意不要硬编码凭据。

## 部署

通过 `pnpm build` 产出静态资源到 `dist/`，可用 `pnpm preview` 本地预览。目前仓库中没有 CI/CD、Docker 等部署配置。
