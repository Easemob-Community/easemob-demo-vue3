<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineOptions({ name: 'LoginHero' })

const heroLoaded = ref(false)
const heroImageRef = ref<HTMLImageElement | null>(null)

const barHeights = [3, 5, 4, 7, 5, 8, 6, 9, 7, 10, 8, 6]

const chips = [
  {
    text: 'SDK.connect()',
    top: '12%',
    left: '8%',
    delay: '0s',
    color: 'rgba(0,158,255,0.5)',
    border: 'rgba(0,158,255,0.15)',
    bg: 'rgba(0,158,255,0.06)',
  },
  {
    text: '<ChatMessage />',
    top: '28%',
    left: '2%',
    delay: '1.2s',
    color: 'rgba(167,139,250,0.55)',
    border: 'rgba(108,99,255,0.18)',
    bg: 'rgba(108,99,255,0.07)',
  },
  {
    text: 'onMessage(cb)',
    bottom: '22%',
    left: '5%',
    delay: '0.6s',
    color: 'rgba(56,189,248,0.5)',
    border: 'rgba(56,189,248,0.15)',
    bg: 'rgba(56,189,248,0.06)',
  },
  {
    text: 'status: "online"',
    top: '15%',
    right: '6%',
    delay: '1.8s',
    color: 'rgba(134,239,172,0.5)',
    border: 'rgba(134,239,172,0.15)',
    bg: 'rgba(134,239,172,0.06)',
  },
  {
    text: 'latency: 12ms',
    bottom: '18%',
    right: '4%',
    delay: '0.9s',
    color: 'rgba(251,191,36,0.5)',
    border: 'rgba(251,191,36,0.15)',
    bg: 'rgba(251,191,36,0.06)',
  },
]

onMounted(() => {
  // 若图片已从缓存加载完成，手动触发 loaded 状态
  if (heroImageRef.value?.complete) {
    heroLoaded.value = true
  }
})
</script>

<template>
  <div class="login-page__hero">
    <div class="login-page__hero-wrap">
      <!-- 后方装饰层 -->
      <div class="login-page__hero-deco">
        <!-- 外圈旋转代码环 -->
        <div class="login-page__ring login-page__ring--outer">
          <svg viewBox="0 0 520 520">
            <defs>
              <path
                id="outerRing"
                d="M260,260 m-230,0 a230,230 0 1,1 460,0 a230,230 0 1,1 -460,0"
              />
            </defs>
            <text>
              <textPath href="#outerRing">
                const conn = new SDK() · await conn.open() · conn.send(msg) · conn.listen() ·
                websocket.connect() · IM.init() ·
              </textPath>
            </text>
          </svg>
        </div>

        <!-- 内圈反向代码环 -->
        <div class="login-page__ring login-page__ring--inner">
          <svg viewBox="0 0 360 360">
            <defs>
              <path
                id="innerRing"
                d="M180,180 m-160,0 a160,160 0 1,1 320,0 a160,160 0 1,1 -320,0"
              />
            </defs>
            <text>
              <textPath href="#innerRing">
                { type: 'chat' } · msg.send() · async/await · WebSocket · EventEmitter ·
              </textPath>
            </text>
          </svg>
        </div>

        <!-- 第三圈 -->
        <div class="login-page__ring login-page__ring--third">
          <svg viewBox="0 0 660 660">
            <defs>
              <path
                id="ring3"
                d="M330,330 m-300,0 a300,300 0 1,1 600,0 a300,300 0 1,1 -600,0"
              />
            </defs>
            <text>
              <textPath href="#ring3">
                import SDK from 'easemob-websdk' · new Connection() · EventEmitter.on() ·
                Promise.resolve() · RTC.join() ·
              </textPath>
            </text>
          </svg>
        </div>

        <!-- 第四圈 -->
        <div class="login-page__ring login-page__ring--fourth">
          <svg viewBox="0 0 430 430">
            <defs>
              <path
                id="ring4"
                d="M215,215 m-195,0 a195,195 0 1,1 390,0 a195,195 0 1,1 -390,0"
              />
            </defs>
            <text>
              <textPath href="#ring4">
                msg.type · conn.login() · token.refresh() · user.presence · group.create() ·
                channel.join() ·
              </textPath>
            </text>
          </svg>
        </div>

        <!-- 中心脉冲环 -->
        <div class="login-page__pulse-ring" />

        <!-- 漂浮代码标签 -->
        <div
          v-for="(chip, idx) in chips"
          :key="idx"
          class="login-page__chip"
          :style="{
            top: chip.top,
            left: chip.left,
            right: chip.right,
            bottom: chip.bottom,
            animationDelay: chip.delay,
            color: chip.color,
            borderColor: chip.border,
            background: chip.bg,
          }"
        >
          {{ chip.text }}
        </div>

        <!-- 上方代码窗口 -->
        <div class="login-page__code-window login-page__code-window--top">
          <div class="login-page__code-window-header">
            <span />
            <span />
            <span />
            <span class="login-page__code-window-title">chat.ts</span>
          </div>
          <div class="login-page__code-window-body">
            <div>
              <span class="kw">const</span> <span class="var">msg</span>
              <span class="op">=</span> <span class="obj">{</span>
            </div>
            <div class="indent">
              <span class="prop">type</span><span class="op">:</span>
              <span class="str">"chat"</span><span class="op">,</span>
            </div>
            <div class="indent">
              <span class="prop">to</span><span class="op">:</span>
              <span class="str">"easemob"</span><span class="op">,</span>
            </div>
            <div class="indent">
              <span class="prop">body</span><span class="op">:</span>
              <span class="str">"Hello!"</span>
            </div>
            <div><span class="obj">}</span></div>
            <div class="mt">
              <span class="kw">await</span> <span class="var">conn</span
              ><span class="op">.</span><span class="fn">send</span
              ><span class="op">(msg)</span>
            </div>
          </div>
        </div>

        <!-- 下方代码窗口 -->
        <div class="login-page__code-window login-page__code-window--bottom">
          <div class="login-page__code-window-header">
            <span />
            <span />
            <span />
            <span class="login-page__code-window-title">connect.ts</span>
          </div>
          <div class="login-page__code-window-body">
            <div>
              <span class="kw">import</span> <span class="var">SDK</span>
              <span class="kw">from</span>
            </div>
            <div class="indent"><span class="str">"easemob-websdk"</span></div>
            <div class="mt">
              <span class="kw">const</span> <span class="var">conn</span>
              <span class="op">=</span> <span class="fn">new</span>
            </div>
            <div class="indent">
              <span class="obj">SDK.connection</span><span class="op">()</span>
            </div>
          </div>
        </div>

        <!-- 消息气泡 -->
        <div class="login-page__chat-bubbles">
          <div class="login-page__bubble login-page__bubble--left">
            <div class="login-page__avatar">👩</div>
            <div class="login-page__bubble-text">
              消息已送达 <span class="login-page__bubble-check">✓✓</span>
            </div>
          </div>
          <div class="login-page__bubble login-page__bubble--right">
            <div class="login-page__bubble-text">
              在线 <span class="login-page__bubble-highlight">2.4M</span> 用户 🚀
            </div>
            <div class="login-page__avatar">🐱</div>
          </div>
        </div>

        <!-- 实时连接卡片 -->
        <div class="login-page__latency-card">
          <div class="login-page__latency-header">
            <span />
            <span>实时连接</span>
          </div>
          <div class="login-page__latency-bars">
            <div
              v-for="(h, i) in barHeights"
              :key="i"
              class="login-page__latency-bar"
              :style="{
                height: `${h * 2}px`,
                background:
                  i > 8
                    ? 'linear-gradient(to top, #009EFF, #6C63FF)'
                    : 'rgba(255,255,255,0.15)',
                animationDuration: `${1.4 + (i % 5) * 0.3}s`,
                animationDelay: `${i * 0.12}s`,
              }"
            />
          </div>
          <p class="login-page__latency-desc">消息延迟 &lt; 50ms</p>
        </div>
      </div>

      <!-- 骨架屏 -->
      <div
        class="login-page__hero-skeleton"
        :class="{ 'login-page__hero-skeleton--hidden': heroLoaded }"
      />

      <!-- 环境 lift -->
      <div class="login-page__hero-lift" />

      <!-- 主视觉图 -->
      <img
        ref="heroImageRef"
        src="/login-assets/hero.png"
        alt="环信即时通讯云主视觉"
        class="login-page__hero-image"
        :class="{ 'login-page__hero-image--loaded': heroLoaded }"
        fetchpriority="high"
        decoding="async"
        loading="eager"
        @load="heroLoaded = true"
      />
    </div>
  </div>
</template>

<style src="./index.scss" scoped lang="scss"></style>
