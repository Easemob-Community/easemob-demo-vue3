---
name: uikit-tgz-integration
description: vue3-uikit（@easemob/uikit-im / uikit-core / uikit-sdk-contract / uikit-sdk-websdk5）本地 tgz 联调流程与 vite 预打包缓存坑。换 uikit 版本、升级后新功能（如黑名单）不生效、dev 页面无变化时使用。
---

# vue3-uikit tgz 联调

## 概述

- 本 demo 通过**本地 tgz** 集成 uikit 四包：`@easemob/uikit-im` / `@easemob/uikit-core` / `@easemob/uikit-sdk-contract` / `@easemob/uikit-sdk-websdk5`（uikit-im 3.x 起为双 adapter 架构 D122，SDK 层拆为中立契约 + 适配器两个独立包）：`package.json` 的 `dependencies` 与 `pnpm.overrides` 均以 `file:./easemob-uikit-<pkg>-<version>.tgz` 引用（tgz 位于仓库根目录，**不入库**，已被 `.gitignore` 排除）。
- tgz 是 uikit 源仓库（`../UIKIT/easemob-uikit-vue/packages/uikit-im|uikit-core|uikit-sdk-contract|uikit-sdk-websdk5`）的**构建产物**（`files: ["dist"]`，`pnpm pack` 打出）。
- 入口必须 `import '@easemob/uikit-im/websdk5'` 注册默认适配器（见 `src/main.ts`），否则 Provider/useClient 无 adapter 可用。

## 换新 tgz 的完整流程

1. 在 uikit 源仓库构建并打包（版本号按需修改）：
   ```bash
   cd ../UIKIT/easemob-uikit-vue
   pnpm -F @easemob/uikit-sdk-contract build && (cd packages/uikit-sdk-contract && pnpm pack)
   pnpm -F @easemob/uikit-core build && (cd packages/uikit-core && pnpm pack)
   pnpm -F @easemob/uikit-sdk-websdk5 build && (cd packages/uikit-sdk-websdk5 && pnpm pack)
   pnpm -F @easemob/uikit-im build && (cd packages/uikit-im && pnpm pack)
   ```
   产出 `easemob-uikit-{sdk-contract,core,sdk-websdk5,im}-<v>.tgz`（在各自 package 目录下，注意按依赖序构建）。
2. 把四个新 tgz **复制到本 demo 根目录**。
3. 更新 `package.json`：`dependencies` 与 `pnpm.overrides` 中四个 `@easemob/uikit-*` 包的 `file:` 指向**新文件名**（版本号变了文件名也会变）。
4. `pnpm install`（pnpm 按 tgz 完整性校验重新安装）。
5. **必须重启 `pnpm dev`**（见下节缓存坑；`Ctrl+C` 后重新运行）。

## vite 预打包缓存坑（重点）

- **现象**：换新 tgz 并 `pnpm install` 后，dev 页面仍显示旧版本行为——典型如**黑名单入口不出现**、联系人等样式无变化；但 `pnpm build` 是正常的。
- **原因**：vite 会把依赖**预打包**到 `node_modules/.vite/deps`。运行中的 dev server 不会自动察觉 tgz 内容变化，继续服务旧的预打包产物（旧版本，自然没有新功能）。
- **解法**：
  - 首选：**重启 `pnpm dev`**（vite 启动时按依赖变化重新预打包）。
  - 兜底：`rm -rf node_modules/.vite` 后再重启。
  - 本 demo 的 `vite.config.ts` 已内置**防呆**：启动时检测到已安装的 uikit 产物（im/core dist）mtime 比 `.vite` 缓存新，则自动清空缓存、强制重新预打包——所以只要重启 dev server 就自愈；但「不重启」依然无法生效。
- **验证是否已是新版本**：
  ```bash
  # 已安装产物含黑名单（>0 为新版）
  grep -c EmBlockList node_modules/@easemob/uikit-im/dist/easemob-uikit-im.js
  # dev 预打包产物也是新版（重启后 >0）
  grep -c EmBlockList node_modules/.vite/deps/@easemob_uikit-im.js
  ```

## 与 uikit 源码仓库的关系

- 源码仓库是 `../UIKIT/easemob-uikit-vue`（相对本仓库），其中的 `apps/demo` 是**另一个**源码直连模式的示例，与本仓库（tgz 产物模式）互不相同；改动 uikit 源码后需**重新构建 + 打包 + 按本 skill 流程**同步到这里。
- 直接调试 uikit 源码的备选：`vite.config.ts` 的 `resolve.alias` 中有注释示例，可临时指向源码目录（改回时注意还原）。

## 黑名单功能参考（已接入示例）

- 入口：Provider `enableBlocklist`（`App.vue` → `DEMO_PROVIDER_CONFIG.enableBlocklist`）+ 通讯录容器 `showBlocklist`（`views/contacts/index.vue` → `DEMO_CONTACT_CONFIG.showBlocklist`）。
- 事件：`blocklist-item-click`（打开联系人详情）、组件内部右键「移出黑名单」。
- 在 uikit 侧对应 `EmBlockList` / `EmBlockListContainer` 与 `contact.blocklist.*` i18n 文案。
