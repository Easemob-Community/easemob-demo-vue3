import { describe, expect, it } from 'vitest'

import { encryptAES, mapLoginSmsError, mapRegisterSmsError, PHONE_REGEX } from '@/api/sms'

describe('sms 工具函数', () => {
  describe('PHONE_REGEX', () => {
    it('校验合法手机号', () => {
      expect(PHONE_REGEX.test('13800138000')).toBe(true)
      expect(PHONE_REGEX.test('15912345678')).toBe(true)
    })

    it('拒绝非法手机号', () => {
      expect(PHONE_REGEX.test('12345678901')).toBe(false)
      expect(PHONE_REGEX.test('1380013800')).toBe(false)
      expect(PHONE_REGEX.test('138001380000')).toBe(false)
      expect(PHONE_REGEX.test('')).toBe(false)
    })
  })

  describe('encryptAES', () => {
    it('能正确加密并输出 base64', async () => {
      const plaintext = 'test-captcha-verify-param'
      // 生成一个 32 字节（256 位）的随机密钥并转为 base64
      const keyBuffer = crypto.getRandomValues(new Uint8Array(32))
      const secretKey = btoa(String.fromCharCode.apply(null, Array.from(keyBuffer) as number[]))

      const encrypted = await encryptAES(plaintext, secretKey)
      expect(typeof encrypted).toBe('string')
      expect(encrypted.length).toBeGreaterThan(0)
    })

    it('相同明文不同密钥输出不同密文（IV 随机）', async () => {
      const plaintext = 'same-text'
      const key1 = btoa(
        String.fromCharCode.apply(
          null,
          Array.from(crypto.getRandomValues(new Uint8Array(32))) as number[],
        ),
      )
      const key2 = btoa(
        String.fromCharCode.apply(
          null,
          Array.from(crypto.getRandomValues(new Uint8Array(32))) as number[],
        ),
      )

      const encrypted1 = await encryptAES(plaintext, key1)
      const encrypted2 = await encryptAES(plaintext, key2)

      expect(encrypted1).not.toBe(encrypted2)
    })
  })

  describe('mapLoginSmsError', () => {
    it('映射手机号非法', () => {
      expect(mapLoginSmsError('phone number illegal')).toBe('请输入正确的手机号码')
    })

    it('映射频繁发送', () => {
      expect(mapLoginSmsError('Please wait a moment while trying to send.')).toBe(
        '操作过于频繁，请稍后再试',
      )
    })

    it('映射达上限', () => {
      expect(mapLoginSmsError('exceed the limit')).toBe('验证码获取已达上限，请明日再试')
      expect(mapLoginSmsError('SMS verification code exceeds the limit')).toBe(
        '验证码获取已达上限，请明日再试',
      )
    })

    it('兜底返回原文', () => {
      expect(mapLoginSmsError('unknown error')).toBe('unknown error')
      expect(mapLoginSmsError('')).toBe('验证码获取失败')
    })
  })

  describe('mapRegisterSmsError', () => {
    it('映射频繁发送', () => {
      expect(mapRegisterSmsError(400, 'Please wait a moment while trying to send.')).toBe(
        '验证码在有效期内，请勿重复发送！',
      )
    })

    it('映射图片验证码错误', () => {
      expect(mapRegisterSmsError(400, 'Image verification code error.')).toBe(
        '图片验证码错误，请更换验证码或重新输入！',
      )
    })

    it('映射未授权注册', () => {
      expect(mapRegisterSmsError(17, 'unauthorized')).toBe('未开放授权注册！')
    })

    it('映射注册达上限', () => {
      expect(mapRegisterSmsError(17, 'resource_limited')).toBe('注册已达上限请开通企业版！')
    })

    it('兜底返回原文', () => {
      expect(mapRegisterSmsError(400, 'other')).toBe('other')
      expect(mapRegisterSmsError(500, '')).toBe('验证码获取失败')
    })
  })
})
