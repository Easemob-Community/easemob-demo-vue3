---
name: unit-testing
description: 单元测试（Vitest）目录约定、编写规范与同步更新约束。新增/修改 src 下可测模块（api、store、composables、utils、config 等）时使用。
---

# 单元测试（Vitest）

## 目录结构

- 单测统一放在仓库根的 `tests/unit/` 目录，**目录结构与 `src/` 镜像**：
  - `src/composables/useSidebarWidth.ts` → `tests/unit/composables/useSidebarWidth.spec.ts`
  - `src/utils/color.ts` → `tests/unit/utils/color.spec.ts`
  - `src/api/request.ts` → `tests/unit/api/request.spec.ts`
  - `src/store/modules/user.ts` → `tests/unit/store/modules/user.spec.ts`
  - `src/config/demo.ts` → `tests/unit/config/demo.spec.ts`
  - 直接位于 `src/` 根层的模块（如 `src/uikit-smoke.spec.ts`）对应 `tests/unit/` 根层。
- `src/` 下**禁止**再存放 `*.spec.ts`；测试辅助文件（helper/fixture）也放 `tests/unit/` 下对应位置。
- 对被测模块的导入一律使用 `@/` 别名（如 `@/composables/useSidebarWidth`），不要写相对路径；mock 的第三方包导入保持原样。

## 技术约定

- 框架：Vitest 4 + happy-dom 环境（配置见 `vitest.config.ts`，`include: ['tests/**/*.spec.ts']`）。
- 命名：被测模块同名 `*.spec.ts`；用例从 `vitest` 显式导入 `describe / it / expect / vi`（不使用全局注入）。
- HTTP 封装测试用 `axios-mock-adapter`（参考 `tests/unit/api/request.spec.ts`）。
- `tests/**/*.ts` 已纳入 `tsconfig.app.json`，`pnpm build` 的 vue-tsc 会类型检查测试代码。

## 硬性约束：改代码必须同步更新测试

- 修改 `src/api`、`src/store`、`src/composables`、`src/utils`、`src/config` 等被测模块的**行为或接口**（函数签名、返回值结构、状态流转、错误处理等）时，**必须同步更新 `tests/unit/` 下对应测试**，保持用例与实现一致。
- 新增可测逻辑（纯函数、composable、store、api 封装、配置解析等）时应**补充对应测试**；页面组件等重 UI 逻辑可暂不覆盖。
- 只改样式、文案、类型不改行为时，可不改动测试，但需确认 `pnpm test` 仍全绿。

## 常用命令

```bash
pnpm test        # 全量跑单测（vitest run，一次性）
pnpm test:watch  # watch 模式
```

## 提交前检查

`pnpm build`（含 vue-tsc 类型检查）、`pnpm lint`、`pnpm test` 必须全部通过。
