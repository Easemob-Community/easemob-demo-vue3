---
name: release
description: 提交规范（Conventional Commits）与正式打版发布流程（release 脚本、CHANGELOG 纪律）。当需要提交代码、发版、打 tag 或更新 CHANGELOG 时使用。
---

# 提交规范与打版发布

## 提交规范（Conventional Commits）

格式：`<type>(<scope>): <中文描述>`（与仓库现有历史一致，描述用中文，句尾不加句号）

| type | 用途 | 示例 |
| --- | --- | --- |
| `feat` | 新功能、新页面、新组件 | `feat(demo): 接入 GIF 表情包` |
| `fix` | Bug 修复 | `fix(login): 修正登录参数传递` |
| `refactor` | 不改变行为的结构调整/抽取/拆分 | `refactor(settings): 拆分 AccountInfo` |
| `style` | 纯样式、格式化，不改逻辑 | `style: 登录框去阴影` |
| `docs` | 文档、注释、AGENTS.md/skills | `docs: 补充 0.1.0 changelog` |
| `test` | 测试的新增、迁移、修复 | `test: 单测迁移至 tests/unit` |
| `chore` | 依赖、构建、发布等杂项 | `chore(deps): 同步 lockfile` |

- **scope**：用模块名（`login` / `chat` / `contacts` / `settings` / `layout` / `composables` / `api` / `store` / `deps` / `release` / `demo`），可省略。
- 一个提交只做一件事；结构重构与行为变更不要混在同一个提交里。
- 提交前必须通过 `pnpm build`、`pnpm lint`、`pnpm test`（硬性，见 AGENTS.md）。

## 打版发布流程

版本号遵循语义化版本（当前 0.x 阶段：`feat` 级变更走 minor，修复走 patch）。

1. **累积变更记录**：功能合并后，把变更写入 `CHANGELOG.md` 的 `[Unreleased]` 小节（分类：`新增` / `修复` / `变更` / `文档`，与 Keep a Changelog 一致）。
2. **发版**：执行 `pnpm release <major|minor|patch>`，脚本会自动依次完成：
   - 全量检查（`pnpm build` + `pnpm lint` + `pnpm test`），任一失败即中止；
   - 提升 `package.json` version；
   - 把 `[Unreleased]` 小节转为 `[x.y.z] - 当天日期`，并重建空的 `[Unreleased]`；
   - 提交 `chore(release): x.y.z` 并打 tag `vx.y.z`。
3. **推送**：脚本不自动 push，完成后手动执行输出的 `git push --follow-tags origin <branch>`。
4. **合入 main**：发版在 `dev` 分支进行，推送后必须把 release 提交合入 `main` 并推送（`main` 始终是 `dev` 的祖先，走快进合并即可）：

   ```bash
   git checkout main && git merge --ff-only dev && git push origin main && git checkout dev
   ```

   tag 打在 release 提交上，快进合并后 `main` 自然带上该 tag；合完切回 `dev` 继续日常开发。若合并时报 non-fast-forward（main 被单独改过），停下来确认差异，不要强推。
5. **重新构建再部署**：脚本的全量检查构建发生在提升版本号**之前**，release 完成时 `dist/` 里打包的仍是旧版本号（`DEMO_VERSION` 构建期从 package.json 读入）。部署前必须再跑一次 `pnpm build`，否则线上底部版本号会落后一个版本。

注意：`pnpm release` 要求 `[Unreleased]` 非空，空则拒绝发版——强迫先写 changelog。紧急 hotfix 可直接指定精确版本号：`pnpm release 0.2.1`。
