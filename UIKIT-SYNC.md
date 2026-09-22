# uikit → demo 同步工作流（临时文档）

> ⚠️ **临时文档**：本流程的价值仅存在于「一边开发 demo、一边发现 uikit 问题并修改、再同步到 demo」的阶段。
> 当 demo 与 uikit 进入稳定期（不再频繁改 uikit 内核）后，本文档可整体删除；长期规则以 `AGENTS.md` 与
> skill `uikit-tgz-integration` 为准。

## 一、背景与适用阶段

- demo（本仓库 `easemob-demo-vue3`）通过**本地 tgz** 集成 uikit：
  `@easemob-community/uikit-im` / `@easemob-community/uikit-core` 均以 `file:./easemob-uikit-<pkg>-<version>.tgz` 引用（tgz 位于仓库根目录、不入库）。
- uikit 源码仓库：`../UIKIT/easemob-uikit-vue`（相对本仓库）。
- 典型节奏：demo 开发中发现 uikit 问题/缺能力 → 在 uikit 仓库改源码 → 提交 → 打新 tgz → 同步到 demo → 验证。

## 二、完整步骤（按顺序执行）

### 1. 查 uikit 仓库状态（**先查版本号！**）
```bash
cd ../UIKIT/easemob-uikit-vue
grep '"version"' packages/uikit-im/package.json packages/uikit-core/package.json   # 当前版本（可能已被提交升版）
git status --short                                                                  # 未提交改动
git log --oneline -3                                                                # 最近提交（新特性可能已由人提交）
node scripts/check-version-sync.mjs                                                 # changelog:check（版本段一致）
```

### 2. 若有未提交改动：验证 + 提交
```bash
pnpm -F @easemob-community/uikit-im exec vue-tsc --noEmit        # 类型检查（门禁）
pnpm -F @easemob-community/uikit-core build && pnpm -F @easemob-community/uikit-im build   # 构建（门禁）
git add <改动的文件> && git commit -m "中文 message"
# 提交前确认未混入产物：git diff --cached --name-only | grep -E 'dist/|node_modules/|\.tgz$' 应为空
# 不主动 push（除非用户明确要求）
```

### 3. 重建产物 + 打 tgz
```bash
# dist 已在第 2 步构建过；若没构建则先 build
(cd packages/uikit-core && pnpm pack)   # 产出 easemob-uikit-core-<ver>.tgz
(cd packages/uikit-im && pnpm pack)     # 产出 easemob-uikit-im-<ver>.tgz
# ⚠️ 产物文件名 = 包名-当前版本号.tgz。版本号变了文件名就会变（如 2.6.0→2.7.0），
#    不要沿用旧文件名——用旧文件名复制的是旧 tgz（真实踩坑）。
# 校验包内 dist 与当前 dist 一致：
#   tar -xzOf easemob-uikit-im-<ver>.tgz package/dist/easemob-uikit-im.js | md5
#   md5 -q packages/uikit-im/dist/easemob-uikit-im.js   # 两值应相同
```

### 4. 迁入 demo
```bash
cp <两个新 tgz> /Users/neohuang/Desktop/WorkCommonUse/Demo/easemob-demo-vue3/   # 覆盖
# 更新 demo package.json：
#   dependencies 与 pnpm.overrides 中 @easemob-community/uikit-im / @easemob-community/uikit-core 的 file: 指向
#   （版本号变了 → 换成新文件名）
pnpm install    # pnpm 按 tgz 完整性校验重新安装
```

### 5. 破坏性变更同步（若 uikit 版本段有「破坏性变更」）
看 uikit `CHANGELOG.md` 对应版本段的「破坏性变更」，demo 侧同步改。已踩：
- `InputStyle` `'wechat'|'feishu'` → `'toolbar-top'|'toolbar-bottom'`（`useDemoSettings.ts` / `SettingsChatPanel.vue` / spec 全部要改，注意按「底部↔toolbar-bottom、顶部↔toolbar-top」语义配对）。

### 6. demo 验证
```bash
pnpm build   # vue-tsc（对已装 dist 类型校验新 API）+ vite build
pnpm lint
pnpm test
```

### 7. 重启 dev server + 验证预打包
```bash
pkill -f "easemob-demo-vue3.*vite.*vite.js"; sleep 1
pnpm dev      # 用裸 pnpm dev 起后台任务；不要 `| head` 管道截断（会被 SIGPIPE 杀）
```
- `vite.config.ts` 已内置防呆：检测到已安装 uikit 产物比 `.vite` 预打包新时**自动清缓存**重新预打包（重启即自愈）。
- 验证预打包真的换新：
  ```bash
  # 注意 core 可能被 vite 单独预打包（@easemob_uikit-core.js），im/core 两个文件都要查
  grep -c <新符号> node_modules/.vite/deps/@easemob_uikit-im.js
  grep -c <新符号> node_modules/.vite/deps/@easemob_uikit-core.js
  ```

### 8.（可选）把新特性接进 demo 特性面板
如主题颜色 API（hoverColor/activeColor/iconMutedColor）→ 在外观面板「颜色微调」区加取色器行 + i18n 文案 + 一键重置。

## 三、踩坑清单（经验沉淀）

| 坑 | 现象 | 对策 |
|---|---|---|
| **版本号变了还打旧文件名** | 复制的是旧 tgz，demo 没有新功能 | 打包前先查 `package.json` 版本；用 `pnpm pack` 输出的真实文件名 |
| **vite 预打包缓存** | 换 tgz 后 dev 页面仍是旧功能（如黑名单不出现） | 重启 `pnpm dev`；已加防呆自动清 `.vite`；兜底 `rm -rf node_modules/.vite` |
| **破坏性变更** | 升级后 demo 类型报错/行为异常 | 先看 CHANGELOG 破坏性段，同步改 demo 引用（如 InputStyle 枚举） |
| **minify 混淆** | grep 预打包局部变量名为 0 | 换不会被压缩的标记：CSS 值（`fit-content`）、DOM API（`removeProperty`）、导出符号 |
| **core 独立预打包** | grep im 预打包查不到 core 的 API | `@easemob_uikit-core.js` 可能是独立文件，两个都查 |
| **vue-tsc 增量缓存** | 报已修复的 TS6133（如 FIT_MIN_SCALE 误报） | `rm -f tsconfig.app.tsbuildinfo` 后重跑 vue-tsc |
| **pnpm pack 静默输出** | 看不出实际产物文件名 | 不重定向，直接看 `pnpm pack` 输出的文件名 |
| **后台 dev server 被杀** | `pnpm dev \| head` 启动后管道关闭被 SIGPIPE 杀 | 后台任务用裸 `pnpm dev`，不接管道截断 |
| **demo 侧 WIP 类型错误** | 门禁被用户未完成的文件卡住 | 核实是 pre-existing 后最小化修复（如删未用 import）并说明 |

## 四、结束/清理

- 该阶段结束（demo 与 uikit 稳定、不再频繁同步）后：**删除本文档**，并把 `AGENTS.md` 里 tgz 版本引用更新为最终版本。
- 长期维护流程看 skill：`.agent/skills/uikit-tgz-integration/SKILL.md`。
