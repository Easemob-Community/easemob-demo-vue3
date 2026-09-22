/**
 * 打版发布脚本（无第三方依赖）。
 *
 * 用法：node scripts/release.mjs <major|minor|patch|x.y.z>
 *
 * 流程：build + lint + test 全量检查 → 提升 package.json 版本号 →
 * 将 CHANGELOG.md 的 [Unreleased] 小节转为正式版本 → 提交并打 tag。
 * 不会自动 push，完成后按提示手动推送。
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: 'inherit' })

const arg = process.argv[2]
if (!arg) {
  console.error('用法：node scripts/release.mjs <major|minor|patch|x.y.z>')
  process.exit(1)
}

const pkgPath = resolve(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const [major, minor, patch] = pkg.version.split('.').map(Number)

let next
if (arg === 'major') next = `${major + 1}.0.0`
else if (arg === 'minor') next = `${major}.${minor + 1}.0`
else if (arg === 'patch') next = `${major}.${minor}.${patch + 1}`
else if (/^\d+\.\d+\.\d+$/.test(arg)) next = arg
else {
  console.error(`无法识别的版本参数：${arg}`)
  process.exit(1)
}

console.log(`\n==> 当前版本 ${pkg.version} → ${next}，先执行全量检查\n`)
run('pnpm', ['build'])
run('pnpm', ['lint'])
run('pnpm', ['test'])

// 提升版本号
pkg.version = next
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

// 将 [Unreleased] 小节转为正式版本，并重建空的 [Unreleased]
const changelogPath = resolve(root, 'CHANGELOG.md')
const changelog = readFileSync(changelogPath, 'utf8')
const date = new Date().toISOString().slice(0, 10)
const unreleasedRe = /## \[Unreleased\]\n([\s\S]*?)(?=\n## \[)/
const match = changelog.match(unreleasedRe)
if (!match) {
  console.error('CHANGELOG.md 中未找到 [Unreleased] 小节')
  process.exit(1)
}
const body = match[1].trim()
if (!body) {
  console.error('CHANGELOG.md 的 [Unreleased] 小节为空，请先补充变更记录再发版')
  process.exit(1)
}
const nextChangelog = changelog.replace(
  unreleasedRe,
  `## [Unreleased]\n\n## [${next}] - ${date}\n\n${body}\n\n`,
)
writeFileSync(changelogPath, nextChangelog)

console.log(`\n==> 提交并打 tag v${next}\n`)
run('git', ['add', 'package.json', 'CHANGELOG.md'])
run('git', ['commit', '-m', `chore(release): ${next}`])
run('git', ['tag', '-a', `v${next}`, '-m', `release ${next}`])

console.log(`\n完成。请执行：git push --follow-tags origin $(git branch --show-current)\n`)
console.log(`推送后别忘了把 release 提交合入 main：`)
console.log(`  git checkout main && git merge --ff-only dev && git push origin main && git checkout dev\n`)
