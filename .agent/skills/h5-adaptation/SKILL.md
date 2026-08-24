---
name: h5-adaptation
description: H5 移动端适配细则。编写移动端样式、处理 px 转 vw、刘海屏安全区、设备判断、真机调试时使用。
---

# H5 适配细则

## px 转 vw

- 设计稿基准宽度 **375px**，样式直接写 px，构建时由 `postcss-px-to-viewport-8-plugin`（`postcss.config.js`）自动转 vw。
- 个别不需要转换的元素，加 `keep-px` 类跳过（selectorBlackList）。
- `node_modules` 默认排除不转换。若后续接入的 `vue3-uikit` 内部样式也是按 375 px 写的，删除 `postcss.config.js` 中的 `exclude` 项让其一并转换；若 uikit 自己处理适配则保持排除。

## 安全区（刘海屏 / Home 指示条）

- 使用全局工具类 `safe-area-top` / `safe-area-bottom`（定义在 `src/styles/index.scss`，基于 `env(safe-area-inset-*)`）。
- `index.html` 的 viewport 已配置 `viewport-fit=cover` 并禁用用户缩放，不要改回。

## 设备判断（两套，勿混用）

| 场景 | 用什么 | 说明 |
|---|---|---|
| 启动期一次性决策（如是否加载 eruda） | `src/utils/env.ts` 的 `isMobile` | UA 静态判断，只算一次 |
| 运行期切换交互 / 布局逻辑 | `src/composables/useMobileView.ts` 的 `useMobileView()` | 基于 VueUse `useMediaQuery`，768px 断点，响应式，窗口缩放/横竖屏切换自动更新 |

- 断点常量统一从 `useMobileView.ts` 的 `MOBILE_BREAKPOINT` 取，不要各处硬编码 768。
- 响应式用法示例见 `src/layout/index.vue`（PC 侧边栏 / H5 底部 tabbar 切换）。

## 真机调试

- 开发环境且移动端 UA 时，`src/main.ts` 自动加载 eruda 调试面板；PC 与生产构建不加载（生产已 tree-shake）。
- PC 上想触发 H5 调试：Chrome DevTools 设备模拟会改 UA，可触发 eruda 与移动端视口。
