# easemob-demo-vue3

一款全新的社区维护版 Vue Demo，底层基于社区维护的 Vue3 UIKit。

## 技术栈

- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 8](https://vite.dev/) 构建
- [Vue Router](https://router.vuejs.org/) 路由
- [Pinia](https://pinia.vuejs.org/) 状态管理
- [VueUse](https://vueuse.org/) 组合式工具库（`useMediaQuery` 等）
- [Vue I18n](https://vue-i18n.intlify.dev/) 多语言（zh-CN / en-US，配置见 `src/locales/`）
- [Axios](https://axios-http.com/) HTTP 请求（已做二次封装，见 `src/api/request.ts`）
- [NProgress](https://ricostacruz.com/nprogress/) 路由进度条
- [Sass](https://sass-lang.com/) 样式预处理
- [Vitest](https://vitest.dev/) 单元测试（`pnpm test`，用例与被测模块同目录 `*.spec.ts`）
- ESLint + Prettier 代码规范
- H5 适配：响应式布局（`useMobileView`，768px 断点切换桌面/H5 双模式，样式直接写 px 不做转换）+ 安全区样式 + eruda 调试面板（仅开发环境且移动端加载）
- 深色模式：CSS 变量 + `useTheme`（浅色 / 深色 / 跟随系统，localStorage 持久化）

## 深色模式

- 颜色一律使用 CSS 变量 `var(--color-*)`，定义在 `src/styles/themes.scss`（`:root` 浅色、`html.dark` 深色），组件内不要写死色值
- 通过 `useTheme()`（`src/composables/useTheme.ts`）切换：`light` / `dark` / `auto`（跟随系统），选择持久化到 localStorage
- 切换时同步 `<html>` 的 `color-scheme` 与 `theme-color` meta（H5 状态栏）
- `index.html` 内置首帧同步脚本（读取 localStorage 中的主题，与 `useTheme` 的 key 一致），避免深色模式下首屏白闪
- 后续 `vue3-uikit` 遵循同一约定：`html.dark` 类 + 同名 CSS 变量，即可与 Demo 联动

## H5 适配说明

- 桌面 / H5 双模式响应式：布局、抽屉及会话/通讯录/设置页通过 `useMobileView`（768px 断点，基于 VueUse `useMediaQuery`）切换布局形态
- 样式统一直接写 **px**，不做 px→vw 转换（曾用 postcss-px-to-viewport，因双模式响应式下会导致桌面优先组件在宽屏被异常放大、且 exclude 白名单覆盖全部文件后转换量为 0，已移除；历史背景见 `.agent/skills/h5-adaptation`）
- 刘海屏 / Home 指示条使用全局工具类 `safe-area-top` / `safe-area-bottom`（`env(safe-area-inset-*)`）
- 开发环境且移动端（按 UA 判断，见 `src/utils/env.ts`）自动加载 eruda 调试面板，PC 与生产构建不加载
- 运行期切换交互/布局逻辑（响应窗口缩放、横竖屏）用 `src/composables/useMobileView.ts`；UA 判断是静态的，仅用于启动期决策
- `index.html` 的 viewport 已配置 `viewport-fit=cover` 并禁用用户缩放

## 环境要求

- Node.js >= 20.19
- pnpm 10+

## 常用命令

```bash
pnpm install     # 安装依赖
pnpm dev         # 启动开发服务器（默认 5173 端口）
pnpm build       # 类型检查 + 生产构建
pnpm preview     # 预览生产构建产物
pnpm test        # 运行单元测试（Vitest，一次执行）
pnpm test:watch  # 运行单元测试（watch 模式）
pnpm lint        # ESLint 检查
pnpm lint:fix    # ESLint 自动修复
pnpm format      # Prettier 格式化
```

## 目录结构

```
├── index.html
├── vite.config.ts          # alias @、dev server proxy、环境变量加载
├── vitest.config.ts        # Vitest 单元测试配置（happy-dom 环境、@ 别名）
├── .env.development        # 开发环境变量（VITE_API_BASE_URL 等）
├── .env.production         # 生产环境变量
└── src/
    ├── main.ts             # 入口，挂载 pinia / router
    ├── App.vue
    ├── api/                # axios 封装与接口模块
    ├── router/             # 路由表 + 全局守卫（nprogress、登录态校验、页面标题）
    ├── store/              # Pinia store
    ├── layout/             # 主布局
    ├── views/              # 页面（login / chat / contacts / 404）
    ├── components/         # 公共组件
    ├── composables/        # 组合式函数
    ├── utils/              # 工具函数
    ├── styles/             # 全局样式与变量
    └── types/              # 共享业务类型（ApiResult / PageQuery / PageResult / LoginResult）
```

## 开发说明

- 路径别名：`@` 指向 `src/`
- 开发环境接口代理：`/api` -> `VITE_PROXY_TARGET`（见 `vite.config.ts`）；生产环境 `VITE_API_BASE_URL=/api` 需由部署侧（如 Nginx）将 `/api` 同路径代理到后端服务
- HTTP 封装：`src/api/request.ts` 的 `http.get<T> / http.post<T> / http.put<T> / http.delete<T>` 已做统一拆包与类型声明（自动注入 token、401 统一跳转登录）；共享类型见 `src/types/index.d.ts`
- 登录态链路：路由守卫 `meta.requiresAuth` 控制页面访问，未登录跳 `/login` 并携带 `redirect` 回跳；登录成功后 `useUserStore().setToken(...)` 即放行
- 自研 `vue3-uikit` 本地联调时，可在 `vite.config.ts` 的 `resolve.alias` 中指向其源码目录
- 滑块验证（阿里云验证码 2.0）/ 短信等敏感配置：复制 `.env.production.local.example` 为 `.env.production.local` 并填写真实值（该文件不入库、仅生产构建生效）；代码中通过 `src/config/captcha.ts` 的 `captchaConfig` 读取，`captchaConfig.enabled` 为 false 时业务应跳过滑块验证流程
