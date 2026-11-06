# GIF 动画表情消息与会话摘要多端协议

| 文档信息 | 内容 |
| --- | --- |
| 文档版本 | v1.0 |
| 文档状态 | 对外评审稿 |
| 适用客户端 | Android / iOS / Web |
| 适用场景 | 单聊、群聊中的 GIF 动画表情 |
| 评审目标 | 统一消息字段、表情编码、多语言摘要、兼容规则和联调标准 |

> 本文是自包含的多端协议说明，各端无需依赖 Web Demo 源码即可阅读和实现。评审通过前，字段名和英文文案以最终确认结果为准。

## 1. 背景与目标

当前 GIF 动画表情使用图片消息承载。为了实现 Android、iOS、Web 之间一致的表情识别和会话摘要展示，各端需要统一：

1. 如何区分普通 GIF 图片与动画表情。
2. 如何标识具体是哪一个表情。
3. 如何根据接收端语言展示对应表情含义。
4. 历史消息、旧版本和异常数据如何兼容。
5. 本地回显、在线接收、漫游恢复和语言切换如何保持一致。

### 1.1 核心结论

- GIF 动画表情继续使用**图片消息**，不改为自定义消息。
- 使用 SDK 标准字段 `isGif` 标识 GIF 图片。
- 保留现有业务字段 `ext.isSticker: true`，用于区分动画表情和普通 GIF 图片。
- 新增唯一表情元数据字段 `ext.stickerCode`，用于标识具体表情。
- **消息不携带中文或英文含义**。各端根据 `stickerCode` 查询本地多语言常量。
- 会话摘要展示当前语言的表情含义；无法解析时展示当前语言的动画表情兜底文案。

协议示例：

```json
{
  "isSticker": true,
  "stickerCode": "huanxin.biubiu"
}
```

对应会话摘要：

```text
zh-CN: [亮个相吧]
en-US: [Ta-da!]
```

## 2. 术语与边界

| 术语 | 定义 |
| --- | --- |
| 普通 GIF 图片 | 通过图片消息发送的 GIF 文件，但不具有动画表情业务身份 |
| 动画表情 | 从表情包面板选择并发送的 GIF 表情，具有 `ext.isSticker` 和 `ext.stickerCode` |
| `stickerCode` | 表情的稳定业务编码，与语言、资源 URL、文件名无关 |
| 表情含义 | 各端本地语言资源中，与 `stickerCode` 对应的展示文案 |
| 会话摘要 | 会话列表中根据最后一条消息实时或恢复生成的预览文本 |

### 2.1 本期范围

- 单聊、群聊中的 GIF 动画表情消息协议。
- 会话列表最后一条消息摘要。
- zh-CN、en-US 两种语言。
- 新旧版本、历史数据、漫游和异常数据兼容。

### 2.2 不在本期范围

- GIF 上传、下载、缩略图和消息气泡渲染方式调整。
- 普通 Emoji（Unicode 字符）文本消息。
- 撤回、草稿、输入中、系统通知等已有更高优先级状态的规则调整。
- APNs、厂商推送等服务端推送文案配置。

## 3. SDK 标准字段与业务字段

环信 Web SDK 已定义 GIF 图片的收发方式：

- 发送方调用 `createImageMessage` 时设置 `isGif: true`，见[发送 GIF 图片](https://doc.easemob.com/document/web/message_send.html#%E5%8F%91%E9%80%81-gif-%E5%9B%BE%E7%89%87)。
- 接收方在 `onImageMessage` 回调中读取 `message.isGif`，见[接收 GIF 图片消息](https://doc.easemob.com/document/web/message_receive.html)。

`isGif` 只能表示“GIF 图片”，不能表示“动画表情”，也不能标识具体表情。完整语义分为三层：

| 层级 | 字段 | 作用 | 注意事项 |
| --- | --- | --- | --- |
| SDK 图片字段 | `isGif` | 标识图片是否为 GIF | 普通 GIF 图片也可能为 `true` |
| 业务类型字段 | `ext.isSticker` | 区分动画表情和普通 GIF 图片 | 必须严格判断布尔值 `true` |
| 表情身份字段 | `ext.stickerCode` | 标识具体表情 | 用于查询本地多语言常量 |

**动画表情摘要的业务识别以 `ext.isSticker === true` 为准，不得仅凭 `isGif === true` 将所有 GIF 都识别为动画表情。**

## 4. 消息协议

### 4.1 消息类型

- 使用各端现有的图片消息类型。
- GIF 图片按 SDK 要求设置 `isGif: true`。
- 图片 URL、宽高、缩略图等附件字段继续沿用各端现有结构。

### 4.2 ext 字段定义

| 字段 | 类型 | 新版本发送端 | 示例 | 说明 |
| --- | --- | --- | --- | --- |
| `isSticker` | Boolean | 必填，固定为 `true` | `true` | 动画表情业务识别字段 |
| `stickerCode` | String | 必填 | `huanxin.biubiu` | 全局稳定的表情编码 |

### 4.3 stickerCode 规则

- 当前编码形式为：`表情包ID.表情key`。
- 当前环信表情包统一使用前缀 `huanxin`，例如 `huanxin.biubiu`。
- 编码大小写敏感，接收端使用完整字符串精确匹配。
- 接收端将编码视为不透明值，不依赖拆分后的 pack/key 单独查询。
- 同一表情在所有端、所有语言、所有资源环境中共用同一个编码。
- 编码不得随 CDN 地址、文件名、显示文案或语言调整而变化。
- 新增编码前应确认全局唯一，不复用已经发布过的其他表情编码。

### 4.4 发送端要求

1. 在同一条图片消息中设置 GIF 标记并写入 `ext.isSticker`、`ext.stickerCode`。
2. 写入时合并已有 `ext`，不得整体覆盖消息的其他业务扩展字段。
3. `stickerCode` 必须来自稳定的表情配置，不得从显示名称、资源 URL 或文件名临时推导。
4. 不传输 `stickerName`、中文含义、英文含义或已经格式化的摘要文案。
5. 同一条消息的本地发送回显也必须保留完整 `ext`，不能只在接收端补字段。

“只传 code”是指表情元数据只新增 `stickerCode`；既有 `isSticker` 和其他业务 `ext` 字段继续保留。

### 4.5 接收端要求

1. 严格判断 `ext.isSticker === true`，字符串 `"true"` 不视为有效标记。
2. `stickerCode` 仅接受字符串，使用前去除首尾空白。
3. 使用完整编码查询本地常量，命中后展示当前语言含义。
4. 编码缺失、为空、类型错误、未知或缺少对应语言文案时，展示动画表情兜底文案。
5. 不直接展示原始 `stickerCode`，不展示 `undefined`、`null` 或原始 JSON。
6. 单条异常消息不得影响其他消息和整个会话列表的渲染。

## 5. 报文示例

以下为协议字段示意，附件 URL、宽高等无关字段已省略。原始 Web SDK 接收模型可读取 `message.isGif`；如客户端 UI 模型对消息进行了 `body` 归一化，以本端实际模型为准。

### 5.1 动画表情：亮个相吧

```json
{
  "type": "image",
  "isGif": true,
  "ext": {
    "isSticker": true,
    "stickerCode": "huanxin.biubiu"
  }
}
```

预期摘要：

```text
zh-CN: [亮个相吧]
en-US: [Ta-da!]
```

### 5.2 动画表情：谢谢老板

```json
{
  "type": "image",
  "isGif": true,
  "ext": {
    "isSticker": true,
    "stickerCode": "huanxin.thanks"
  }
}
```

预期摘要：

```text
zh-CN: [谢谢老板]
en-US: [Thanks, Boss!]
```

### 5.3 历史动画表情：缺少 stickerCode

```json
{
  "type": "image",
  "isGif": true,
  "ext": {
    "isSticker": true
  }
}
```

预期摘要：

```text
zh-CN: [动画表情]
en-US: [Animated Sticker]
```

### 5.4 普通 GIF 图片：没有 isSticker

```json
{
  "type": "image",
  "isGif": true,
  "ext": {}
}
```

预期摘要仍为普通图片：

```text
zh-CN: [图片]
en-US: [Image]
```

## 6. 多语言常量与摘要生成

### 6.1 常量组织原则

- 各端维护相同的 `stickerCode` 集合。
- 中文、英文含义分别存放在各端本地语言资源中。
- 语言资源只保存含义文本，不保存外层方括号；摘要生成时统一添加 `[]`。
- `stickerCode → i18n key` 的映射与语言解耦。
- 新增语言只增加本地语言资源，不修改消息协议。
- 新增表情应先在各端发布常量，再开放该表情的线上发送。

Web 可采用以下结构，其他端使用等价的资源映射。建议使用 `Map` 或无条件查询的等价结构，避免 `__proto__` 等特殊字符串触发对象原型链问题：

```ts
const STICKER_I18N_KEY_BY_CODE: ReadonlyMap<string, string> = new Map([
  ['huanxin.biubiu', 'chat.sticker.huanxin.biubiu'],
  ['huanxin.thanks', 'chat.sticker.huanxin.thanks'],
])
```

```ts
// zh-CN
chat: {
  sticker: {
    fallback: '动画表情',
    huanxin: {
      biubiu: '亮个相吧',
      thanks: '谢谢老板',
    },
  },
}
```

```ts
// en-US
chat: {
  sticker: {
    fallback: 'Animated Sticker',
    huanxin: {
      biubiu: 'Ta-da!',
      thanks: 'Thanks, Boss!',
    },
  },
}
```

### 6.2 摘要解析伪代码

以下仅描述图片消息分支，其他消息类型继续使用原有解析规则：

```ts
function resolveImageMessagePreview(message, i18n): string {
  const ext = message.ext

  if (ext?.isSticker !== true) {
    return `[${i18n.t('message.preview.image')}]`
  }

  const code = typeof ext.stickerCode === 'string' ? ext.stickerCode.trim() : ''
  const labelKey = code ? STICKER_I18N_KEY_BY_CODE.get(code) : undefined
  const label = labelKey && i18n.te(labelKey)
    ? i18n.t(labelKey)
    : i18n.t('chat.sticker.fallback')

  return `[${label}]`
}
```

### 6.3 群聊发送者前缀

群聊先生成动画表情摘要，再沿用现有发送者前缀规则：

```text
zh-CN: 张三: [亮个相吧]
en-US: Zhang San: [Ta-da!]
```

发送者显示名继续按照各端现有用户资料规则解析，与 `stickerCode` 无关。

### 6.4 语言切换

- 同一条历史消息应能随客户端语言切换展示不同语言。
- 切换语言后，应根据原始最后一条消息或保留的 `stickerCode` 重新计算现有会话摘要。
- 不得只缓存第一次生成的中文字符串或英文字符串，并在语言切换后继续复用。
- 摘要属于派生展示数据，不写回消息 `ext`，也不作为消息事实来源上传。

## 7. 当前环信表情编码与中英文文案

统一编码规则：`stickerCode = huanxin.表情key`。

以下英文文案为本次对外评审建议值，各端确认后作为同一版协议的固定文案。

| 序号 | `stickerCode` | zh-CN 含义 | en-US 含义 | zh-CN 摘要 | en-US 摘要 |
| --- | --- | --- | --- | --- | --- |
| 1 | `huanxin.biubiu` | 亮个相吧 | Ta-da! | `[亮个相吧]` | `[Ta-da!]` |
| 2 | `huanxin.caffe` | 辛苦啦 | Thanks for Your Hard Work | `[辛苦啦]` | `[Thanks for Your Hard Work]` |
| 3 | `huanxin.debug` | Bug终结者 | Bug Slayer | `[Bug终结者]` | `[Bug Slayer]` |
| 4 | `huanxin.dont_wanna` | 你说神嘛 | What Did You Say? | `[你说神嘛]` | `[What Did You Say?]` |
| 5 | `huanxin.error` | 报错了 | Something Went Wrong | `[报错了]` | `[Something Went Wrong]` |
| 6 | `huanxin.like` | 真棒 | Awesome! | `[真棒]` | `[Awesome!]` |
| 7 | `huanxin.insane` | 厉害 | Impressive! | `[厉害]` | `[Impressive!]` |
| 8 | `huanxin.jajaja` | 笑死 | LOL | `[笑死]` | `[LOL]` |
| 9 | `huanxin.likes` | 真棒棒 | So Awesome! | `[真棒棒]` | `[So Awesome!]` |
| 10 | `huanxin.success` | 成功啦 | Success! | `[成功啦]` | `[Success!]` |
| 11 | `huanxin.roll_out` | 上线了 | It's Live! | `[上线了]` | `[It's Live!]` |
| 12 | `huanxin.OKDK` | 好的收到 | Got It! | `[好的收到]` | `[Got It!]` |
| 13 | `huanxin.thanks` | 谢谢老板 | Thanks, Boss! | `[谢谢老板]` | `[Thanks, Boss!]` |

兜底文案：

| 语言 | 含义 | 会话摘要 |
| --- | --- | --- |
| zh-CN | 动画表情 | `[动画表情]` |
| en-US | Animated Sticker | `[Animated Sticker]` |

注意：`huanxin.caffe` 和 `huanxin.OKDK` 必须按表中值原样传输，不得自行修正拼写或改变大小写。

## 8. 会话摘要一致性要求

各端应在统一的消息摘要解析层实现协议，不能只修改某个会话列表 Item 的显示文案。至少覆盖：

| 场景 | 一致性要求 |
| --- | --- |
| 本地发送回显 | 发送后立即按完整 `ext` 和当前语言生成摘要 |
| 在线接收新消息 | 接收端独立根据 `stickerCode` 解析，不依赖发送端显示语言 |
| 本地缓存恢复 | 根据原始消息重新生成，不信任历史缓存中的固定文案 |
| 刷新 / 重新登录 | 不退化为 `[图片]`，不丢失 `stickerCode` |
| 离线消息 / 漫游恢复 | 与在线接收使用同一解析规则 |
| SDK 会话快照 | 能读取最后一条消息 `ext` 时，复用同一业务解析入口 |
| 语言切换 | 现有会话摘要重新计算为当前语言 |

如果某端 SDK 的会话快照未携带完整 `ext`，应在适配层通过完整最后一条消息或本地消息记录补齐；无法确认是动画表情时，不得仅凭 `isGif` 猜测。

## 9. 兼容策略

### 9.1 新旧版本兼容

| 场景 | 预期行为 |
| --- | --- |
| 新版本发送 → 新版本接收 | 按 `stickerCode` 和接收端当前语言展示含义 |
| 旧版本发送，仅有 `isSticker` → 新版本接收 | 展示当前语言的动画表情兜底文案 |
| 新版本发送 → 旧版本接收 | 旧版本忽略 `stickerCode`，保持其原有摘要行为 |
| 新表情 code → 尚未内置该 code 的版本 | 展示当前语言的动画表情兜底文案 |
| 普通 GIF 图片 → 任意新版本 | 没有 `isSticker: true`，继续按普通图片处理 |

新增字段属于向后兼容的增量协议，但不要求未升级的旧客户端获得新展示能力。

### 9.2 异常数据兼容

| 输入情况 | 预期摘要行为 |
| --- | --- |
| `isSticker: true`，`stickerCode` 缺失 | 当前语言动画表情兜底 |
| `isSticker: true`，`stickerCode: null`、数字或对象 | 当前语言动画表情兜底 |
| `isSticker: true`，`stickerCode` 全为空白 | 当前语言动画表情兜底 |
| `isSticker: true`，`stickerCode` 未命中映射 | 当前语言动画表情兜底，不展示 code 原文 |
| 命中 code，但当前语言缺少文案或文案为空字符串 | 当前语言动画表情兜底，不展示 `[]` |
| `isSticker` 缺失 | 按普通图片处理 |
| `isSticker: "true"` | 按普通图片处理 |
| `isGif: true`，但没有 `ext.isSticker` | 普通 GIF 图片，按普通图片处理 |
| `stickerCode` 包含 HTML 或脚本字符串 | 不展示、不执行；未命中时走兜底 |

## 10. 各端实现要求

### 10.1 Android / iOS

发送侧：

- 保持图片消息和 GIF 发送方式不变。
- 按 SDK 要求设置 GIF 标记。
- 合并写入 `isSticker`、`stickerCode`，保留其他 `ext`。
- 本地回显使用同一份消息数据，不额外硬编码摘要。

接收侧：

- 建立统一的 `stickerCode → 多语言文案` 映射。
- 本地回显、在线接收、数据库恢复、漫游和会话快照复用同一摘要解析器。
- 支持 zh-CN、en-US 及动画表情兜底。
- 语言切换后重新计算现有会话摘要。

### 10.2 Web

Web Demo 与通用 UIKit 的职责必须分开，避免把某个 Demo 的表情协议固化进通用组件：

| 层级 | 职责 |
| --- | --- |
| UIKit IM | PC/H5 透传 `packId`；写入通用 `ext.isSticker: true`；调用并合并业务 `input.stickerExt`；不定义 `stickerCode` 规则、表情常量或业务文案 |
| WebSDK5 adapter | 将完整消息和 `SessionMessageSnippet` 归一化后交给通用 `lastMessageTextResolver`；resolver 不接管时走原默认摘要；不包含具体 code 或多语言文案 |
| Web Demo | 通过 `input.stickerExt` 生成 `stickerCode`；维护 13 个编码、多语言含义、图片文案和动画表情兜底 |

发送侧：

- UIKit 表情选择链路保留 `pack.id` 和完整 `sticker`，并将两者传给 Demo 的 `input.stickerExt`。
- Demo 根据稳定配置生成 `${pack.id}.${sticker.key}`，返回 `{ stickerCode }`；UIKit 合并该返回值与通用 `isSticker`。
- `sticker.name` 只用于选择器等本地 UI，不写入消息 `ext`。

接收侧：

- Demo 常量维护 `stickerCode → i18n key`，语言包维护具体含义。
- Demo 业务摘要解析器按当前语言解析 `stickerCode`，同时注入 ChatConfig 和 WebSDK5 adapter。
- 完整消息摘要与 `SessionMessageSnippet` 会话快照摘要复用同一业务解析入口。
- 切换语言时基于原始最后一条消息重新计算摘要，**只更新现有会话的 `lastMessageText`**；不得全量覆盖草稿、免打扰、名称、头像等本地字段，也不得增删本地独有会话。
- 不只通过列表插槽替换文本，避免漫游和会话快照链路出现不同结果。

## 11. 联调验收标准

### 11.1 多端与多语言

| 编号 | 测试场景 | 预期结果 |
| --- | --- | --- |
| 1 | 中文环境按 Web → Android、Android → iOS、iOS → Web 发送 `huanxin.biubiu` | 每条链路的发送端和接收端均展示 `[亮个相吧]` |
| 2 | 英文环境按 Web → iOS、iOS → Android、Android → Web 发送 `huanxin.thanks` | 每条链路的发送端和接收端均展示 `[Thanks, Boss!]` |
| 3 | Web、Android、iOS 分别作为发送端，将 13 个表情各发送一轮 | 每端结果均与第 7 节一致；六个有向平台组合至少抽测 `biubiu`、`OKDK`、`thanks` |
| 4 | 同一条历史表情消息在 zh-CN 与 en-US 之间切换 | 现有会话摘要随之更新，无需重新收发消息 |
| 5 | 群聊接收动画表情，至少包含一个 iOS 接收场景 | 展示 `发送者: [当前语言含义]` |

### 11.2 历史与异常数据

| 编号 | 测试场景 | 预期结果 |
| --- | --- | --- |
| 6 | 历史消息仅有 `isSticker: true` | 中文 `[动画表情]`，英文 `[Animated Sticker]` |
| 7 | `stickerCode` 缺失、空白、null 或类型错误 | 当前语言兜底，列表不崩溃 |
| 8 | `stickerCode` 未知或包含 HTML/脚本字符串 | 当前语言兜底，不展示或执行 code 原文 |
| 9 | 普通 GIF 图片，`isGif: true`，但没有 `isSticker` | 按普通图片处理，不误判为动画表情 |
| 10 | `isSticker` 为字符串 `"true"` | 不通过严格校验，按普通图片处理 |
| 11 | 命中 code，但刻意移除当前语言文案 | 当前语言兜底，不显示 i18n key 或 code |

异常字段用例应通过测试发送入口、消息注入工具或漫游 fixture 构造原始 `ext` 并记录数据。至少将一条异常消息走真实的“接收 → 会话更新 → 刷新恢复”链路，不能只调用本地摘要函数。

### 11.3 原始报文与恢复链路

| 编号 | 测试场景 | 预期结果 |
| --- | --- | --- |
| 12 | 发送后立即查看会话列表 | 本地回显立即符合当前语言规则 |
| 13 | 刷新、重登、清缓存后重新同步、离线漫游恢复 | 摘要保持一致，不退回 `[图片]`，`stickerCode` 未丢失 |
| 14 | 消息预置其他 `ext` 字段后发送，在在线接收和漫游恢复后检查原始报文 | `isSticker` 为布尔 `true`，`stickerCode` 正确，预置字段仍保留，不存在 `stickerName` |
| 15 | 同一表情在不同语言、不同资源环境中重复发送 | `stickerCode` 完全一致，不随语言或 URL 改变 |
| 16 | 新版本与旧版本互发 | 符合第 9.1 节，新增字段不影响旧版本接收图片 |

## 12. 发布与后续扩展建议

### 12.1 推荐发布顺序

1. 各端先确认字段、编码和中英文常量。
2. 各端优先发布接收解析与兜底能力。
3. 再开放新版本发送端写入 `stickerCode`。
4. 完成六个有向平台组合和漫游链路验收后全量发布。

接收端先发布可以让旧消息、未知编码和灰度期间的数据始终以动画表情兜底展示，降低跨版本差异。

### 12.2 新增表情

1. 先分配全局唯一且稳定的 `stickerCode`。
2. 各端补充对应语言常量并发布。
3. 确认旧版本收到时能够使用动画表情兜底。
4. 再开放发送入口。

### 12.3 新增语言

- 只增加各端本地语言资源。
- 不修改 `stickerCode`，不增加消息字段。
- 缺少对应语言文案时使用该语言约定的动画表情兜底；如果产品需要其他默认语言策略，应另行评审。

## 13. 评审确认表

请各端负责人逐项确认：

| 评审项 | 建议值 | Android | iOS | Web |
| --- | --- | --- | --- | --- |
| 图片消息承载 GIF 动画表情 | 同意 | 待确认 | 待确认 | 待确认 |
| 保留 `ext.isSticker: true` | 同意 | 待确认 | 待确认 | 待确认 |
| 新增 `ext.stickerCode` | 同意 | 待确认 | 待确认 | 待确认 |
| 编码形式 | `huanxin.表情key` | 待确认 | 待确认 | 待确认 |
| 消息不传含义，使用本地多语言常量 | 同意 | 待确认 | 待确认 | 待确认 |
| 中文兜底 | `[动画表情]` | 待确认 | 待确认 | 待确认 |
| 英文兜底 | `[Animated Sticker]` | 待确认 | 待确认 | 待确认 |
| 13 个表情的中英文文案 | 按第 7 节 | 待确认 | 待确认 | 待确认 |
| 漫游、会话快照与语言切换 | 按第 8 节 | 待确认 | 待确认 | 待确认 |
| 联调版本、负责人和上线顺序 | 各端补充 | 待补充 | 待补充 | 待补充 |

评审通过后，本文中的字段名、编码和文案即作为对应版本的联调基线；后续变更应保持增量兼容，不直接复用或改变已发布 `stickerCode` 的含义。
