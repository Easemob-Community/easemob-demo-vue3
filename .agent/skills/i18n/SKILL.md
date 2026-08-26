---
name: i18n
description: 多语言（vue-i18n）使用与扩展流程。新增文案 key、页面接入多语言、新增语言种类时使用。
---

# 多语言（vue-i18n）

## 结构

- i18n 实例：`src/locales/index.ts`，Composition 模式（`legacy: false` + `globalInjection: true`）。
- 语言包：`src/locales/zh-CN.ts`、`src/locales/en-US.ts`。**两个包的 key 必须严格一一对应**。
- 默认语言跟随浏览器（`navigator.language`），不在支持列表内回退 `zh-CN`。

## 日常使用

- 模板：直接 `$t('nav.chat')`（已开 globalInjection）。
- 脚本：`const { t, locale } = useI18n()`。
- 新增文案 key：按模块分组命名（如 `nav.*`、`login.*`），**两个语言包同步添加**，否则另一语言会显示 key 原文。

## 新增一种语言

1. `src/locales/` 下新增语言包文件（如 `ja-JP.ts`），key 与现有语言包对齐。
2. `src/locales/index.ts` 中 import 该文件并挂到 `messages`。
3. 同步补充 `AppLocale` 联合类型与 `SUPPORT_LOCALES` 常量。

## 切换语言

- 修改 `useI18n()` 返回的 `locale.value` 即可，示例见 `src/layout/index.vue` 右上角临时切换按钮（后续挪到设置页）。

## 与 vue3-uikit 的联动

UIKit 的语言与 Demo **共用同一份语言状态**，由 `src/composables/useUIKitConfig.ts` 的 `useUIKitConfig()` 统一联动，`App.vue` 已接入：

- UIKit 只认 `zh-CN` / `en` 两种语言（`toUIKitLocale` 把 Demo 的 `en-US` 映射为 `en`）。
- 语言切换分两处：`EmUIKitProvider` 的 `:locale` 属性只在挂载时生效一次，运行期切换靠 UIKit 的 `setLocale` 响应式同步（见 `useUIKitConfig` 内的 `watch`）。
- 若新增 Demo 语言，需同步在 `UIKIT_LOCALE_MAP` 中补充到 UIKit 语言的映射（UIKit 无对应语言时回退 `zh-CN`）。
