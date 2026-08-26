---
name: h5-adaptation
description: H5 移动端适配细则。编写移动端样式、处理 px 转 vw、刘海屏安全区、设备判断、真机调试时使用。
---

# H5 适配细则

## 样式与响应式（px 不转换）

- 本项目是**桌面 / H5 双模式响应式**：布局形态由 `useMobileView`（768px 断点，见 `src/composables/useMobileView.ts`）运行时切换，各模式内部用固定 px 布局。
- 样式统一直接写 **px**，**不做 px→vw 转换**（已移除 `postcss-px-to-viewport` 及其 `postcss.config.js`）。写 px 就是 px，无需任何 exclude / keep-px 处理。
- 若未来产品要求「375 设计稿在更宽手机上等比放大」的流式缩放，再按需引入方案并吸取下面的教训：
  - [postcss-mobile-forever](https://github.com/wswmsword/postcss-mobile-forever)：px 同时产出移动端 vw + 桌面端 px（包在 `min-width` 媒体查询内），运行时按视口宽度切换；默认假设移动优先，桌面优先组件仍要逐个处理；
  - [postcss-px-to-clamp](https://github.com/wangguangyou/postcss-px-to-clamp)：px → `clamp(min, vw, max)` 有界缩放，不是桌面固定；
  - rem + 动态根字号：移动端根字号随视口、桌面端固定，需全量改写 px 为 rem。

### 历史教训：全局 px→vw 与双模式响应式冲突（已移除的原因）

曾用 `postcss-px-to-viewport-8-plugin`（375 设计稿基准）做全局转换，引发「特性抽屉控制面板异常大字」事故，最终整体移除。教训如下：

- 该插件只对 **exclude 白名单之外** 的文件做 px→vw，且是**静默**的：目录不在白名单里的组件，其所有 px 都会被转成 vw，桌面优先固定像素布局在宽屏下会按视口等比放大（375 设计稿的 13px 转成 3.4667vw，在 1440px 视口下 ≈ 50px）。
- 事故案例：`src/components/settings/SettingsAppearancePanel.vue`（挂在布局壳抽屉内的桌面优先面板）目录不在 exclude 内，抽屉框架正常、内部面板全部被转 vw。
- 根本矛盾：px→vw 是为「纯 H5、永远铺满视口缩放」设计的；双模式响应式应用要么靠 exclude 白名单「保桌面、弃 H5 流式」，而白名单最终覆盖了全部文件（转换量为 0），插件名存实亡。
- 结论：**双模式响应式项目不要引入全局 px→vw 转换**；若某页面确实需要流式缩放，用上面的按需方案（media query / clamp / rem）局部处理。

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
