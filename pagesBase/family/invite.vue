<template>
  <view class="invite-page">
    <view v-if="!inviteCode" class="select-section">
      <text class="section-title">选择有效期</text>
      <view class="period-options">
        <view
          v-for="option in periodOptions"
          :key="option.value"
          class="period-option"
          :class="{ active: selectedPeriod === option.value }"
          @tap="selectedPeriod = option.value"
        >
          <text class="option-text">{{ option.label }}</text>
        </view>
      </view>

      <view class="button-group">
        <button class="btn btn-primary" @tap="handleGenerate" :loading="isGenerating">生成邀请码</button>
        <button class="btn btn-secondary" @tap="goInviteList">
          <text>查看邀请记录</text>
        </button>
      </view>
    </view>

    <view v-else class="code-section">
      <view class="code-card">
        <text class="code-title">邀请码</text>
        <view class="code-display">
          <text class="code-text">{{ formatInviteCode(inviteCode.inviteCode) }}</text>
        </view>
        <text class="expire-text">有效期至：{{ formatExpireTime(inviteCode.expireTime) }}</text>
      </view>

      <view class="action-buttons">
        <button class="btn btn-secondary" @tap="handleCopy">
          <text>复制邀请码</text>
        </button>
        <button class="btn btn-secondary" @tap="goInviteList">
          <text>查看邀请记录</text>
        </button>
      </view>

      <button class="btn btn-primary" @tap="handleReset">
        <text>重新生成</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { generateInvite } from '@/api/family.js'
import { useFamilyStore } from '@/stores/family.js'

const familyStore = useFamilyStore()
const selectedPeriod = ref(168)
const inviteCode = ref(null)
const isGenerating = ref(false)

const periodOptions = [
  { label: '1天', value: 24 },
  { label: '3天', value: 72 },
  { label: '7天', value: 168 }
]

async function handleGenerate() {
  if (isGenerating.value) return
  isGenerating.value = true

  try {
    const res = await generateInvite({
      groupId: familyStore.myGroup.id,
      validHours: selectedPeriod.value
    })
    inviteCode.value = res.data
    uni.showToast({
      title: '生成成功',
      icon: 'success'
    })
  } catch (e) {
    // 失败后的业务处理：不做任何操作，错误提示已在 request.js 中统一处理
  } finally {
    isGenerating.value = false
  }
}

function handleCopy() {
  uni.setClipboardData({
    data: inviteCode.value.inviteCode,
    success: () => {
      uni.showToast({
        title: '已复制到剪贴板',
        icon: 'success'
      })
    }
  })
}

function goInviteList() {
  uni.navigateTo({ url: '/pagesBase/family/inviteList' })
}

function handleReset() {
  inviteCode.value = null
}

function formatInviteCode(code) {
  if (!code) return ''
  return code.match(/.{1,4}/g).join(' ')
}

function formatExpireTime(time) {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.invite-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 48rpx 24rpx;
}

.select-section {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 32rpx;
  text-align: center;
}

.period-options {
  display: flex;
  gap: 24rpx;
  margin-bottom: 64rpx;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.period-option {
  flex: 1;
  height: 96rpx;
  background: #ffffff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #e4e7ed;
}

.period-option.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.period-option .option-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.period-option.active .option-text {
  color: #ffffff;
}

.code-section {
  display: flex;
  flex-direction: column;
}

.code-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
}

.code-title {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 32rpx;
}

.code-display {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  padding: 32rpx 48rpx;
  margin-bottom: 24rpx;
}

.code-text {
  font-size: 48rpx;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 8rpx;
}

.expire-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.btn-secondary {
  background: #ffffff;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.btn-link {
  background: transparent;
  color: #667eea;
  height: 64rpx;
}

.btn:active {
  opacity: 0.8;
}
</style>
