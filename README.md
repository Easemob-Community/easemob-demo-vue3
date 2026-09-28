# easemob-demo-vue3

Easemob Demo Vue3 是基于环信 IM SDK构建的 Web 即时通讯 Demo，为开发者提供可直接体验的 IM 功能演示与集成参考。项目覆盖单聊、群聊、消息收发、群组管理、联系人等常用即时通讯能力，同时提供环信 Vue3 UIKit 功能概览，可直观体验 UIKit 的组件能力及可配置效果，助力开发者快速了解环信 Web IM 的产品能力与接入方式。

## ⚡ 快速上手：接入你自己的环信应用

想把本 Demo 改造成连接**自己的环信应用**？只需三步：换 AppKey → 创建用户 → 登录。全程在开发模式（`pnpm dev`）下即可完成，无需改动核心代码。

### 前置准备

1. 前往 [环信控制台](https://console.easemob.com) 注册账号并创建应用；
2. 在应用详情页获取 **AppKey**（格式为 `orgName#appName`，例如 `1111222233334444#demo`）。

### 第一步：换成你的 AppKey

两种方式任选其一，**优先级：登录页开发者配置 > 环境变量**（实现见 `src/config/dev.ts` 的 `getEffectiveAppKey()`）。

**方式一：环境变量（推荐，随仓库走）**

在项目根目录的 `.env.development` 中追加一行，然后重启 `pnpm dev`：

```bash
VITE_APP_KEY=你的orgName#你的appName
```

**方式二：登录页开发者配置面板（不改文件，即配即用）**

1. 启动 `pnpm dev` 后打开登录页，开发模式下表单右上角的 `</>` 开发者面板默认已展开（生产构建需连点该图标 7 次进入）；
2. 在「开发者配置」中填入你的 AppKey，点击保存 —— 配置写入 localStorage（key：`easemob-demo-dev-config`）后页面自动刷新生效；
3. 如使用私有部署的环信服务器，可同时在面板中开启「私有服务器」并填写 IM / REST 服务器地址。

> 提示：在面板配置过 AppKey 后想回退到环境变量，清除 localStorage 中的 `easemob-demo-dev-config` 即可。

### 第二步：创建用户（注册）

环信 IM 的用户体系挂在应用（AppKey）之下，本 Demo 不含注册页面。在你自己的应用下创建用户有两种途径：

- **环信控制台**：进入你的应用 →「用户管理」→ 创建用户（设置用户 ID 与密码）；
- **服务端 REST API**：调用环信服务端接口注册用户（详见[环信文档中心](https://docs.easemob.com)，搜索「用户体系集成 / 注册用户」）。

### 第三步：登录

**使用开发者模式登录（推荐）**：在登录页 `</>` 开发者面板中切换到 userId + token 登录表单，填入：

- `userId`：上一步创建的环信用户 ID；
- `token`：该用户的访问 token（可通过环信服务端 REST API 用「用户 ID + 密码」换取，见文档中心「获取用户 token」；token 通常以 `YWMt` 开头）。

点击登录即可进入会话页，此时所有消息收发都发生在你自己的应用下。

> **关于默认的「手机号 + 短信验证码」登录**：该链路依赖环信官方 Demo 的 App Server（`appserver.easesdk.com`）与官方短信服务，只服务于官方 Demo 的 AppKey。**换成自己的 AppKey 后这条链路不可用**，请使用上面的开发者模式登录；如需保留手机号验证码登录体验，见下方「进阶」。

### 进阶：跳过 Demo 登录页，用自有接口登录直达聊天页

如果你的业务已有自己的账号体系/后端，可以完全不用 Demo 的登录页：自己调接口换取环信 `userId` + `token`，在代码里完成 IM 登录后直接进入 `/chat`。前提仍是第一步已配置好 `VITE_APP_KEY`。

**1. 了解登录态链路（改造前必读）**

- 路由守卫（`src/router/index.ts`）只看 `userStore.token`：有 token 放行 `/chat` 等受保护页，且访问 `/login` 会被自动重定向到 `/chat`；
- 登录态持久化在 sessionStorage（key：`webImAuth`，见 `src/store/modules/user.ts` 的 `persistToStorage()`），刷新页面后由 `src/components/AppInitializer.vue` 自动恢复并用凭证重连 IM SDK；
- IM SDK 的初始化与登录必须在 `EmUIKitProvider` 作用域内通过 `useClient()` 拿到 `init` / `login`（所有路由页面都在 Provider 之下）。

**2. 替换登录页为你自己的登录逻辑**

把 `src/views/login/index.vue` 换成自己的组件（或新增路由），核心代码如下：

```vue
<script setup lang="ts">
import { useClient } from '@easemob-community/uikit-im'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { getEffectiveAppKey } from '@/config/dev'
import { initUIKit } from '@/utils/uikit'

const router = useRouter()
const userStore = useUserStore()
// 必须在 setup 顶层调用（依赖 Provider 注入），不能放到点击回调里
const { login, init } = useClient()

async function loginWithMyBackend() {
  // 1. 调你自己的后端接口，换取环信 userId 与 token
  const { userId, token } = await fetch('/my-api/im-token', { method: 'POST' }).then((r) => r.json())

  // 2. 初始化 IM SDK 并登录（appKey 来自环境变量或开发者面板）
  await initUIKit(init, getEffectiveAppKey())
  await login({ user: userId, accessToken: token })

  // 3. 写入 Demo 登录态（路由守卫凭此放行，persistToStorage 支撑刷新后自动重连）
  userStore.setToken(token)
  userStore.setUserId(userId)
  userStore.setChatToken(token) // 注销账户等接口鉴权用
  userStore.setAccessToken(token) // 头像上传等 REST 接口鉴权用
  userStore.setLoginMode('dev')
  userStore.persistToStorage()

  // 4. 直达会话页
  await router.push('/chat')
}
</script>
```

**3. 后端侧**：你的服务端用环信 App 的 `client_id` / `client_secret` 调环信服务端 REST API 完成「注册用户 → 获取用户 token」（见[环信文档中心](https://docs.easemob.com)），再把 `userId` / `token` 下发给前端。切勿把 AppSecret 放到前端代码里。

完成以上改造后，用户进入应用即由你的逻辑静默登录并落在 `/chat`；刷新页面也会经 AppInitializer 自动重连，不会再看到 Demo 登录页。

### 进阶：接入自己的服务端

若要完整复刻「手机号验证码登录 / 按手机号添加联系人 / 头像上传 / 注销账户」等能力，需要自建一个 App Server 对接环信服务端 API：

- Demo 实际使用的接口清单（可直接照抄实现）：[`docs/prod-server-apis.md`](docs/prod-server-apis.md)
- 前端对接点：
  - `.env.development` 的 `VITE_APP_SERVER_URL`：改为你的 App Server 地址（`src/api/user.ts` 统一读取）；
  - `src/api/sms.ts`：短信验证码服务地址默认固定为环信官方域名，自建后改为你的短信服务；
  - `src/config/captcha.ts`：阿里云滑块验证（仅生产环境启用），自建时替换为你自己的人机验证方案。

### 关键代码索引

| 文件 | 作用 |
|---|---|
| `src/config/dev.ts` | AppKey / 私有服务器 / 开发者登录凭据的读取与优先级 |
| `src/utils/uikit.ts` | IM SDK 统一初始化入口（`initUIKit`） |
| `src/App.vue` | `EmUIKitProvider` 挂载点，appKey 注入处 |
| `src/components/AppInitializer.vue` | 刷新后用已持久化的凭证自动重连 IM SDK |
| `src/views/login/components/LoginForm/index.vue` | 登录表单（手机号验证码 / 开发者模式两种登录） |
| `src/views/login/components/LoginDevConfig/index.vue` | 登录页开发者配置面板（AppKey / 私有服务器） |
| `src/composables/useDevMode.ts` | 开发者模式开关（dev 默认开启，生产连点 `</>` 7 次） |
| `src/api/user.ts` / `src/api/sms.ts` | App Server 与短信服务接口封装 |

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
