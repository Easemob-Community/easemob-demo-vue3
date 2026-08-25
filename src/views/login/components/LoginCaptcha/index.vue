<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

defineOptions({ name: 'LoginCaptcha' })

const emit = defineEmits<{ refresh: [] }>()

const captchaChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCaptchaText() {
  return Array.from(
    { length: 5 },
    () => captchaChars[Math.floor(Math.random() * captchaChars.length)],
  ).join('')
}

const captchaText = ref(generateCaptchaText())
const canvasRef = ref<HTMLCanvasElement | null>(null)

function drawCaptcha() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)
  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, 'rgba(0,158,255,0.15)')
  bg.addColorStop(1, 'rgba(108,99,255,0.15)')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgba(0,158,255,${Math.random() * 0.4 + 0.1})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(Math.random() * w, Math.random() * h)
    ctx.lineTo(Math.random() * w, Math.random() * h)
    ctx.stroke()
  }

  const colors = ['#009EFF', '#a78bfa', '#38bdf8', '#e879f9']
  captchaText.value.split('').forEach((char, i) => {
    ctx.save()
    ctx.font = `bold ${20 + Math.random() * 5}px Outfit, sans-serif`
    ctx.fillStyle = colors[i % colors.length]
    ctx.shadowColor = colors[i % colors.length]
    ctx.shadowBlur = 6
    ctx.translate(14 + i * 21, h / 2 + 7)
    ctx.rotate((Math.random() - 0.5) * 0.45)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })
}

watch(captchaText, drawCaptcha, { flush: 'post' })
onMounted(drawCaptcha)

/** 刷新验证码：重新生成并重绘，通知父组件清空输入 */
function refresh() {
  captchaText.value = generateCaptchaText()
  emit('refresh')
}

// 向父组件暴露当前验证码文本（用于校验）与刷新方法
defineExpose({ text: captchaText, refresh })
</script>

<template>
  <div class="login-page__captcha-image" @click="refresh">
    <canvas ref="canvasRef" width="124" height="44" />
  </div>
</template>

<style src="./index.scss" scoped lang="scss"></style>
