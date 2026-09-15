<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { EmAddContactModal, useToast } from '@easemob/uikit-im'

import { useContactAdd } from '@/composables/useContactAdd'

/**
 * 添加联系人弹窗：复用 UIKit 内置 EmAddContactModal（单输入框 + 附言，无短信验证码链路）。
 * 输入支持手机号或环信用户 ID——手机号由 useContactAdd.addByKeyword 经 App Server
 * 解析为用户 ID 后发送好友申请；已是好友 / 用户不存在等错误由 UIKit 弹窗错误区展示。
 */

defineOptions({ name: 'AddContactModal' })

const props = defineProps<{
  /** 是否显示弹窗（v-model:show 受控） */
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'added'): void
}>()

const { t } = useI18n()
const { show: showToast } = useToast()
const { addByKeyword } = useContactAdd()

const visible = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

/** 接管添加动作：错误抛给 UIKit 弹窗错误区展示，由 useContactAdd 统一拦截校验 */
async function addFn(userId: string, message?: string): Promise<void> {
  await addByKeyword(userId, message)
}

function handleAdded() {
  showToast(t('contacts.addContact.addSuccess'), 'success')
  emit('added')
}
</script>

<template>
  <EmAddContactModal v-model:show="visible" :add-fn="addFn" @added="handleAdded" />
</template>
