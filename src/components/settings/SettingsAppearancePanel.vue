<script setup lang="ts">
/**
 * UIKIT特性开关 - 外观面板
 *
 * 按参考图片一比一布局，包含：
 * - 主题与颜色：主题模式、主题色取色器（ColorPickerPanel，含 2D 色板 / 色相条 / 明度条 / Hex/RGB/HSL/HSB 标签页）。
 * - 颜色微调：对方气泡、自己气泡、输入区背景、聊天背景、悬停/选中/弱化图标颜色。
 * - 组件风格：Hover 风格、气泡形状、容器间距、字号、密度、动画开关、动画强度、Input 组件风格、语言。
 * - 一键重置。
 *
 * 接入 UIKit 2.6.0+ useTheme：
 * - primaryColorHsl 作为取色器唯一数据源，由 ColorPickerPanel 展示并通过 setPrimaryColor 写回。
 * - Hex/RGB/HSB 标签页的颜色换算见 @/utils/color（纯函数）。
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { EmInput, useLocale, useTheme as useUIKitTheme } from '@easemob/uikit-im'

import ColorPickerPanel from './color-picker/ColorPickerPanel.vue'
import { useTheme as useAppTheme } from '@/composables/useTheme'

type InputVariant = 'default' | 'search' | 'filled' | 'ghost' | 'underline'
type ThemeMode = 'light' | 'dark' | 'auto'
type HoverStyle = 'default' | 'rounded' | 'square'
type AvatarShape = 'circle' | 'square'
type ComponentsShape = 'ground' | 'square'
type BubbleShape = 'ground' | 'square'
type FontSizePreset = 'normal' | 'large' | 'xlarge'
type Density = 'compact' | 'normal' | 'comfortable'
type AnimationLevel = 'subtle' | 'normal' | 'expressive'

const { t } = useI18n()
const appTheme = useAppTheme()
const uikitTheme = useUIKitTheme()
const { locale, setLocale } = useLocale()

const {
  primaryColorHsl,
  bubbleBgOther,
  bubbleBgSelf,
  chatBg,
  inputBg,
  hoverColor,
  activeColor,
  iconMutedColor,
  setPrimaryColor,
  setBubbleBg,
  setChatBg,
  setInputBg,
  setHoverColor,
  setActiveColor,
  setIconMutedColor,
  setHeaderBorder,
  setAnimationRipple,
} = uikitTheme

/* ===== 主题模式 ===== */
function setThemeMode(mode: ThemeMode) {
  appTheme.setMode(mode)
  uikitTheme.setMode(mode)
}

/* ===== 组件风格 ===== */
function setHoverStyle(style: HoverStyle) {
  uikitTheme.setHoverStyle(style)
}

function setAvatarShape(shape: AvatarShape) {
  uikitTheme.setAvatarShape(shape)
}

function setComponentsShape(shape: ComponentsShape) {
  uikitTheme.setComponentsShape(shape)
}

function setBubbleShape(shape: BubbleShape) {
  uikitTheme.setBubbleShape(shape)
}

function setContainerGap(gap: number) {
  uikitTheme.setContainerGap(gap)
}

function setFontSize(preset: FontSizePreset) {
  uikitTheme.setFontSize(preset)
}

function setDensity(value: Density) {
  uikitTheme.setDensity(value)
}

function setAnimationEnabled(value: boolean) {
  uikitTheme.setAnimationEnabled(value)
}

function setAnimationLevel(level: AnimationLevel) {
  uikitTheme.setAnimationLevel(level)
}

/* ===== Input 组件风格演示 ===== */
const inputVariant = ref<InputVariant>('default')
const inputDemoValue = ref('')

/* ===== 一键重置 ===== */
function resetAll() {
  setThemeMode('auto')
  setPrimaryColor({ h: 203, s: 100, l: 60 })
  setHoverStyle('default')
  setAvatarShape('circle')
  setComponentsShape('ground')
  setBubbleShape('ground')
  setContainerGap(8)
  setFontSize('normal')
  setDensity('normal')
  setHeaderBorder(false)
  setAnimationEnabled(true)
  setAnimationLevel('normal')
  setAnimationRipple(true)
  setBubbleBg(null, null)
  setChatBg(undefined)
  setInputBg(undefined)
  setHoverColor(undefined)
  setActiveColor(undefined)
  setIconMutedColor(undefined)
  inputVariant.value = 'default'
  setLocale('zh-CN')
}
</script>

<template>
  <div class="settings-appearance-panel">
    <!-- ===== 主题与颜色 ===== -->
    <section class="settings-appearance-panel__section">
      <h3 class="settings-appearance-panel__section-title">
        {{ t('features.appearance.themeAndColor') }}
      </h3>

      <div class="settings-appearance-panel__row">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.switchTheme') }}
        </span>
        <div class="settings-appearance-panel__segmented">
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active': appTheme.mode.value === 'light',
            }"
            @click="setThemeMode('light')"
          >
            {{ t('features.appearance.themeLight') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active': appTheme.mode.value === 'dark',
            }"
            @click="setThemeMode('dark')"
          >
            {{ t('features.appearance.themeDark') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active': appTheme.mode.value === 'auto',
            }"
            @click="setThemeMode('auto')"
          >
            {{ t('features.appearance.themeAuto') }}
          </button>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">{{ t('features.appearance.themeDesc') }}</p>

      <div class="settings-appearance-panel__column">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.themeColorHue') }}
        </span>
        <p class="settings-appearance-panel__desc">
          {{ t('features.appearance.themeColorDesc') }}
        </p>

        <!-- 主题色取色器（2D 色板 + 色相条 + 明度条 + 数值标签页） -->
        <ColorPickerPanel :color="primaryColorHsl" @change="setPrimaryColor" />
      </div>
    </section>

    <!-- ===== 颜色微调 ===== -->
    <section class="settings-appearance-panel__section">
      <h3 class="settings-appearance-panel__section-title">
        {{ t('features.appearance.colorFineTune') }}
      </h3>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.bubbleOther') }}
        </span>
        <div class="settings-appearance-panel__right">
          <input
            type="color"
            :value="bubbleBgOther || '#f3f4f6'"
            class="settings-appearance-panel__color-input"
            @input="(e: Event) => setBubbleBg((e.target as HTMLInputElement).value, undefined)"
          />
          <button class="settings-appearance-panel__text-btn" @click="setBubbleBg(null, undefined)">
            {{ t('features.appearance.restore') }}
          </button>
        </div>
      </div>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.bubbleSelf') }}
        </span>
        <div class="settings-appearance-panel__right">
          <input
            type="color"
            :value="bubbleBgSelf || '#3bb1ff'"
            class="settings-appearance-panel__color-input"
            @input="(e: Event) => setBubbleBg(undefined, (e.target as HTMLInputElement).value)"
          />
          <button class="settings-appearance-panel__text-btn" @click="setBubbleBg(undefined, null)">
            {{ t('features.appearance.restore') }}
          </button>
        </div>
      </div>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.inputBg') }}
        </span>
        <div class="settings-appearance-panel__right">
          <input
            type="color"
            :value="inputBg || '#ffffff'"
            class="settings-appearance-panel__color-input"
            @input="(e: Event) => setInputBg((e.target as HTMLInputElement).value)"
          />
          <button class="settings-appearance-panel__text-btn" @click="setInputBg(undefined)">
            {{ t('features.appearance.restore') }}
          </button>
        </div>
      </div>

      <div class="settings-appearance-panel__column settings-appearance-panel__row--bordered">
        <div class="settings-appearance-panel__spread">
          <span class="settings-appearance-panel__label">
            {{ t('features.appearance.chatBg') }}
          </span>
          <button class="settings-appearance-panel__text-btn" @click="setChatBg(undefined)">
            {{ t('features.appearance.restore') }}
          </button>
        </div>
        <input
          :value="chatBg || ''"
          type="text"
          :placeholder="t('features.appearance.chatBgPlaceholder')"
          class="settings-appearance-panel__text-input"
          @input="(e: Event) => setChatBg((e.target as HTMLInputElement).value || undefined)"
        />
      </div>

      <!-- 悬停 / 选中 / 弱化图标颜色（2.7.0+ 主题 API） -->
      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.hoverColor') }}
        </span>
        <div class="settings-appearance-panel__right">
          <input
            type="color"
            :value="hoverColor || '#e5e7eb'"
            class="settings-appearance-panel__color-input"
            @input="(e: Event) => setHoverColor((e.target as HTMLInputElement).value)"
          />
          <button class="settings-appearance-panel__text-btn" @click="setHoverColor(undefined)">
            {{ t('features.appearance.restore') }}
          </button>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">
        {{ t('features.appearance.hoverColorDesc') }}
      </p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.activeColor') }}
        </span>
        <div class="settings-appearance-panel__right">
          <input
            type="color"
            :value="activeColor || '#33b1ff'"
            class="settings-appearance-panel__color-input"
            @input="(e: Event) => setActiveColor((e.target as HTMLInputElement).value)"
          />
          <button class="settings-appearance-panel__text-btn" @click="setActiveColor(undefined)">
            {{ t('features.appearance.restore') }}
          </button>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">
        {{ t('features.appearance.activeColorDesc') }}
      </p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.iconMutedColor') }}
        </span>
        <div class="settings-appearance-panel__right">
          <input
            type="color"
            :value="iconMutedColor || '#b6b8bf'"
            class="settings-appearance-panel__color-input"
            @input="(e: Event) => setIconMutedColor((e.target as HTMLInputElement).value)"
          />
          <button class="settings-appearance-panel__text-btn" @click="setIconMutedColor(undefined)">
            {{ t('features.appearance.restore') }}
          </button>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">
        {{ t('features.appearance.iconMutedColorDesc') }}
      </p>
    </section>

    <!-- ===== 组件风格 ===== -->
    <section class="settings-appearance-panel__section">
      <h3 class="settings-appearance-panel__section-title">
        {{ t('features.appearance.componentStyle') }}
      </h3>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.hoverStyle') }}
        </span>
        <div class="settings-appearance-panel__segmented">
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.hoverStyle.value === 'default',
            }"
            @click="setHoverStyle('default')"
          >
            {{ t('features.appearance.hoverDefault') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.hoverStyle.value === 'rounded',
            }"
            @click="setHoverStyle('rounded')"
          >
            {{ t('features.appearance.hoverRounded') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.hoverStyle.value === 'square',
            }"
            @click="setHoverStyle('square')"
          >
            {{ t('features.appearance.hoverSquare') }}
          </button>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">{{ t('features.appearance.hoverDesc') }}</p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.avatarShape') }}
        </span>
        <div class="settings-appearance-panel__segmented">
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.avatarShape.value === 'circle',
            }"
            @click="setAvatarShape('circle')"
          >
            {{ t('features.appearance.avatarCircle') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.avatarShape.value === 'square',
            }"
            @click="setAvatarShape('square')"
          >
            {{ t('features.appearance.avatarSquare') }}
          </button>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">{{ t('features.appearance.avatarShapeDesc') }}</p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.componentsShape') }}
        </span>
        <div class="settings-appearance-panel__segmented">
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.componentsShape.value === 'ground',
            }"
            @click="setComponentsShape('ground')"
          >
            {{ t('features.appearance.componentsGround') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.componentsShape.value === 'square',
            }"
            @click="setComponentsShape('square')"
          >
            {{ t('features.appearance.componentsSquare') }}
          </button>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">
        {{ t('features.appearance.componentsShapeDesc') }}
      </p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.bubbleShape') }}
        </span>
        <div class="settings-appearance-panel__segmented">
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.bubbleShape.value === 'ground',
            }"
            @click="setBubbleShape('ground')"
          >
            {{ t('features.appearance.bubbleGround') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.bubbleShape.value === 'square',
            }"
            @click="setBubbleShape('square')"
          >
            {{ t('features.appearance.bubbleSquare') }}
          </button>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">{{ t('features.appearance.bubbleDesc') }}</p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.containerGap') }}
        </span>
        <div class="settings-appearance-panel__right">
          <input
            type="range"
            min="0"
            max="24"
            :value="uikitTheme.containerGap.value"
            class="settings-appearance-panel__range-input"
            @input="(e: Event) => setContainerGap(Number((e.target as HTMLInputElement).value))"
          />
          <span class="settings-appearance-panel__range-value">{{
            uikitTheme.containerGap.value
          }}</span>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">{{ t('features.appearance.containerGapDesc') }}</p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.fontSize') }}
        </span>
        <div class="settings-appearance-panel__segmented">
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.fontSizeScale.value === 1,
            }"
            @click="setFontSize('normal')"
          >
            {{ t('features.appearance.fontSizeNormal') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.fontSizeScale.value === 1.125,
            }"
            @click="setFontSize('large')"
          >
            {{ t('features.appearance.fontSizeLarge') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.fontSizeScale.value === 1.25,
            }"
            @click="setFontSize('xlarge')"
          >
            {{ t('features.appearance.fontSizeXlarge') }}
          </button>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">{{ t('features.appearance.fontSizeDesc') }}</p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.density') }}
        </span>
        <div class="settings-appearance-panel__segmented">
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.density.value === 'compact',
            }"
            @click="setDensity('compact')"
          >
            {{ t('features.appearance.densityCompact') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.density.value === 'normal',
            }"
            @click="setDensity('normal')"
          >
            {{ t('features.appearance.densityNormal') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.density.value === 'comfortable',
            }"
            @click="setDensity('comfortable')"
          >
            {{ t('features.appearance.densityComfortable') }}
          </button>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">{{ t('features.appearance.densityDesc') }}</p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.headerBorder') }}
        </span>
        <button
          class="settings-appearance-panel__switch"
          :class="{
            'settings-appearance-panel__switch--active': uikitTheme.headerBorder.value,
          }"
          @click="setHeaderBorder(!uikitTheme.headerBorder.value)"
        >
          <span class="settings-appearance-panel__switch-thumb" />
        </button>
      </div>
      <p class="settings-appearance-panel__desc">
        {{ t('features.appearance.headerBorderDesc') }}
      </p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.animationEnabled') }}
        </span>
        <button
          class="settings-appearance-panel__switch"
          :class="{
            'settings-appearance-panel__switch--active': uikitTheme.animationEnabled.value,
          }"
          @click="setAnimationEnabled(!uikitTheme.animationEnabled.value)"
        >
          <span class="settings-appearance-panel__switch-thumb" />
        </button>
      </div>
      <p class="settings-appearance-panel__desc">
        {{ t('features.appearance.animationEnabledDesc') }}
      </p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.animationLevel') }}
        </span>
        <div class="settings-appearance-panel__segmented">
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.animationLevel.value === 'subtle',
            }"
            @click="setAnimationLevel('subtle')"
          >
            {{ t('features.appearance.animationLevelSubtle') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.animationLevel.value === 'normal',
            }"
            @click="setAnimationLevel('normal')"
          >
            {{ t('features.appearance.animationLevelNormal') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{
              'settings-appearance-panel__segmented-item--active':
                uikitTheme.animationLevel.value === 'expressive',
            }"
            @click="setAnimationLevel('expressive')"
          >
            {{ t('features.appearance.animationLevelExpressive') }}
          </button>
        </div>
      </div>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.animationRipple') }}
        </span>
        <button
          class="settings-appearance-panel__switch"
          :class="{
            'settings-appearance-panel__switch--active': uikitTheme.animationRipple.value,
          }"
          @click="setAnimationRipple(!uikitTheme.animationRipple.value)"
        >
          <span class="settings-appearance-panel__switch-thumb" />
        </button>
      </div>
      <p class="settings-appearance-panel__desc">
        {{ t('features.appearance.animationRippleDesc') }}
      </p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.inputVariant') }}
        </span>
        <select v-model="inputVariant" class="settings-appearance-panel__select">
          <option value="default">default</option>
          <option value="search">search</option>
          <option value="filled">filled</option>
          <option value="ghost">ghost</option>
          <option value="underline">underline</option>
        </select>
      </div>
      <p class="settings-appearance-panel__desc">{{ t('features.appearance.inputVariantDesc') }}</p>
      <div class="settings-appearance-panel__input-preview">
        <EmInput
          v-model="inputDemoValue"
          :variant="inputVariant"
          :placeholder="t('features.appearance.inputPlaceholder')"
        />
      </div>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.language') }}
        </span>
        <div class="settings-appearance-panel__segmented">
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': locale === 'zh-CN' }"
            @click="setLocale('zh-CN')"
          >
            {{ t('features.appearance.langZh') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': locale === 'en' }"
            @click="setLocale('en')"
          >
            {{ t('features.appearance.langEn') }}
          </button>
        </div>
      </div>
    </section>

    <!-- ===== 一键重置 ===== -->
    <button class="settings-appearance-panel__reset-all" @click="resetAll">
      {{ t('features.appearance.resetAll') }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.settings-appearance-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__section-title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 44px;

    &--bordered {
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border);
    }
  }

  &__column {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  &__spread {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__label {
    font-size: 15px;
    font-weight: 500;
    color: var(--color-text);
  }

  &__desc {
    margin: -6px 0 0;
    font-size: 12px;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  /* 分段按钮 */
  &__segmented {
    display: inline-flex;
    padding: 3px;
    border-radius: 999px;
    background-color: var(--color-bg-secondary);
  }

  &__segmented-item {
    height: 30px;
    padding: 0 14px;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: var(--color-text);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    &--active {
      background-color: var(--uikit-primary-color, var(--color-primary));
      color: #ffffff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }

  /* 行内颜色选择 */
  &__color-input {
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: none;
    cursor: pointer;

    &::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    &::-webkit-color-swatch {
      border: none;
      border-radius: 5px;
    }
  }

  &__text-btn {
    padding: 0;
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
      color: var(--uikit-primary-color, var(--color-primary));
    }
  }

  /* 文本输入 */
  &__text-input {
    width: 100%;
    height: 36px;
    padding: 0 12px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background-color: var(--color-bg);
    color: var(--color-text);
    font-size: 14px;
    outline: none;
    box-sizing: border-box;

    &:focus {
      border-color: var(--uikit-primary-color, var(--color-primary));
    }

    &--full {
      flex: 1;
    }
  }

  /* 滑块 */
  &__range-input {
    flex: 1;
    width: 120px;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    border-radius: 3px;
    background: linear-gradient(
      to right,
      var(--color-border),
      var(--uikit-primary-color, var(--color-primary))
    );
    outline: none;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #ffffff;
      border: 2px solid var(--uikit-primary-color, var(--color-primary));
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }
  }

  &__range-value {
    min-width: 24px;
    text-align: right;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  /* Toggle switch */
  &__switch {
    position: relative;
    width: 44px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 12px;
    background-color: var(--color-bg-secondary);
    cursor: pointer;
    transition: background-color 0.2s;

    &--active {
      background-color: var(--uikit-primary-color, var(--color-primary));
    }
  }

  &__switch-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s;
  }

  &__switch--active &__switch-thumb {
    transform: translateX(20px);
  }

  /* 下拉选择 */
  &__select {
    height: 32px;
    padding: 0 28px 0 12px;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background-color: var(--color-bg);
    color: var(--color-text);
    font-size: 14px;
    cursor: pointer;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 14px;

    &:focus {
      border-color: var(--uikit-primary-color, var(--color-primary));
    }
  }

  /* Input 预览 */
  &__input-preview {
    margin-top: 4px;
  }

  /* 一键重置 */
  &__reset-all {
    width: 100%;
    height: 40px;
    margin-top: 8px;
    border: none;
    border-radius: 999px;
    background-color: var(--color-bg-secondary);
    color: var(--color-text);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-border);
    }
  }
}
</style>
