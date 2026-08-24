---
name: dark-mode
description: 深色模式约定与使用方式。编写组件样式、新增主题色、接入 uikit 主题时使用。
---

# 深色模式

## 机制

- 主题色全部为 CSS 变量，定义在 `src/styles/themes.scss`：`:root` 是浅色默认值，`html.dark` 覆盖为深色值。
- 切换方式：`<html>` 上加/去 `dark` 类，由 `src/composables/useTheme.ts` 统一管理。
- `useTheme` 返回 `{ mode, isDark, setMode }`；`mode` 支持 `light` / `dark` / `auto`（跟随系统 `prefers-color-scheme`），通过 VueUse `useStorage` 持久化到 localStorage（key：`app-theme-mode`）。
- 入口 `src/main.ts` 已调用 `useTheme()` 初始化；切换时同步更新 `<html>` 的 `color-scheme` 和 `index.html` 的 `theme-color` meta（H5 状态栏）。

## 写样式的硬性约定

- **颜色一律使用 `var(--color-*)`**，不要在任何组件里写死色值，否则深色模式下会穿帮。
- 现有变量：`--color-primary`、`--color-text`、`--color-text-secondary`、`--color-bg`、`--color-bg-secondary`、`--color-border`。
- 新增颜色：在 `themes.scss` 的 `:root` 与 `html.dark` 中**成对**添加。
- 激活态反白文字（如按钮选中白字）允许固定 `#fff`。
- `src/styles/variables.scss` 只放与主题无关的 Sass 变量，不再定义色值。

## 与 vue3-uikit 的约定

UIKit 接入后遵循同一约定：监听 `html.dark` 类 + 复用同名 CSS 变量，Demo 侧切换主题时 UIKit 无需额外 API 调用即可联动。
