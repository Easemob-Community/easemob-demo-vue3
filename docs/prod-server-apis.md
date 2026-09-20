# 环信 IM Demo（prod）实际在用的服务端接口清单

> 来源：`easemob-demo-vue3` 生产构建实际触发的接口，供服务端同事参考。
> 涉及两个服务地址：
>
> | 服务 | 地址 |
> |---|---|
> | App Server（登录、用户、头像） | `https://appserver.easesdk.com` |
> | 短信验证码 | `https://a1.easemob.com`（协议跟随页面） |
>
> 通用约定：所有接口超时 30s；HTTP ≥ 400 时从响应体 `errorInfo` / `error_description` 字段取错误文案。

## 一、登录链路（2 个，无需鉴权）

### 1. 发送登录短信验证码

生产环境先过阿里云验证码 2.0（滑块），验证参数经 AES-GCM-256 加密后随请求上送。

```bash
curl -X POST 'https://a1.easemob.com/inside/app/sms/send/v2' \
  -H 'Content-Type: application/json' \
  -d '{"phoneNumber":"13800000000","captchaVerifyParam":"<AES-GCM-256 加密后的阿里云验证参数，base64(iv+ciphertext)>"}'
```

- 成功响应：`{ "code": 200 }`

### 2. 手机号 + 短信验证码登录

```bash
curl -X POST 'https://appserver.easesdk.com/inside/app/user/login/V2' \
  -H 'Content-Type: application/json' \
  -d '{"phoneNumber":"13800000000","smsCode":"123456"}'
```

- 成功响应：`{ "token": "<chatToken>", "chatUserName": "<环信用户ID>" }`
- `token` 后续用于 IM SDK 登录及注销账户鉴权。

## 二、登录后功能（3 个，需 Bearer 鉴权）

### 3. 按手机号查询环信用户

添加联系人时把手机号解析为环信用户 ID（会话页 / 通讯录页的添加联系人弹窗在用）。

```bash
curl -X GET 'https://appserver.easesdk.com/inside/app/user/13800000000?operator=<当前用户ID>' \
  -H 'Authorization: Bearer <IM SDK 登录返回的 accessToken，YWMt 前缀>'
```

- 成功响应：`{ "chatUserName": "<环信用户ID>" }`

### 4. 上传用户头像

设置页修改头像。

```bash
curl -X POST 'https://appserver.easesdk.com/inside/app/user/<userId>/avatar/upload' \
  -H 'Authorization: Bearer <SDK 登录后的 accessToken>' \
  -F 'file=@avatar.jpg'
```

- 成功响应：`{ "avatarUrl": "<头像地址>" }`

### 5. 注销账户

设置页危险区，注销成功后客户端执行退出登录清理。

```bash
curl -X DELETE 'https://appserver.easesdk.com/inside/app/user/13800000000' \
  -H 'Authorization: Bearer <IM 登录返回的 chatToken>'
```
