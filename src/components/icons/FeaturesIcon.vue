<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 20,
})

defineOptions({ name: 'FeaturesIcon' })

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))
</script>

<template>
  <svg
    :style="style"
    :width="size"
    :height="size"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 0C18.2091 0 20 1.79086 20 4V16C20 18.2091 18.2091 20 16 20H4C1.79086 20 0 18.2091 0 16V4C0 1.79086 1.79086 0 4 0H16ZM4 2C2.89543 2 2 2.89543 2 4V16C2 17.1046 2.89543 18 4 18H16C17.1046 18 18 17.1046 18 16V4C18 2.89543 17.1046 2 16 2H4ZM14 11C15.1046 11 16 11.8954 16 13C16 14.1046 15.1046 15 14 15C12.8954 15 12 14.1046 12 13C12 11.8954 12.8954 11 14 11ZM10 12C10.5523 12 11 12.4477 11 13C11 13.5523 10.5523 14 10 14H5C4.44772 14 4 13.5523 4 13C4 12.4477 4.44772 12 5 12H10ZM6 5C7.10457 5 8 5.89543 8 7C8 8.10457 7.10457 9 6 9C4.89543 9 4 8.10457 4 7C4 5.89543 4.89543 5 6 5ZM15 6C15.5523 6 16 6.44772 16 7C16 7.55228 15.5523 8 15 8H10C9.44771 8 9 7.55228 9 7C9 6.44772 9.44771 6 10 6H15Z"
      fill="currentColor"
    />
  </svg>
</template>
