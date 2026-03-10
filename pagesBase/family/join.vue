<template>
  <view class="join-page">
    <view class="header">
      <text class="title">输入邀请码</text>
      <text class="subtitle">请输入8位邀请码加入家庭组</text>
    </view>

    <view class="code-input-section">
      <view class="code-inputs">
        <input
          v-for="(item, index) in 8"
          :key="index"
          :id="`code-input-${index}`"
          v-model="codeArray[index]"
          class="code-input"
          type="text"
          maxlength="1"
          :focus="focusIndex === index"
          @input="handleInput(index, $event)"
          @focus="focusIndex = index"
        />
      </view>
    </view>

    <view v-if="inviteInfo" class="preview-section">
      <view class="preview-card">
        <view class="preview-header">
          <image v-if="inviteInfo.groupAvatar" :src="inviteInfo.groupAvatar" class="group-avatar" mode="aspectFill" />
          <view v-else class="group-avatar-placeholder">👨‍👩‍👧‍👦</view>
          <view class="group-info">
            <text class="group-name">{{ inviteInfo.groupName }}</text>
            <text class="group-meta">邀请人：{{ inviteInfo.inviterName }}</text>
          </view>
        </view>
        <view class="preview-footer">
          <text class="expire-text">有效期至：{{ formatExpireTime(inviteInfo.expireTime) }}</text>
        </view>
      </view>

      <view v-if="hasCurrentGroup" class="warning-tip">
        <text class="warning-icon">⚠️</text>
        <text class="warning-text">加入后将自动退出当前家庭组</text>
      </view>
    </view>

    <view class="btn-group">
      <button v-if="!inviteInfo" class="btn btn-primary" @tap="handleValidate" :loading="isValidating">验证邀请码</button>
      <button v-else class="btn btn-primary" @tap="handleJoin" :loading="isJoining">确认加入</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { validateInvite, joinGroup } from '@/api/family.js'
import { useFamilyStore } from '@/stores/family.js'

const familyStore = useFamilyStore()
const codeArray = ref(['', '', '', '', '', '', '', ''])
const focusIndex = ref(0)
const inviteInfo = ref(null)
const isValidating = ref(false)
const isJoining = ref(false)

const inviteCode = computed(() => codeArray.value.join(''))
const hasCurrentGroup = computed(() => familyStore.hasGroup)

onMounted(() => {
  // 页面加载后自动聚焦到第一个输入框
  setTimeout(() => {
    focusIndex.value = 0
  }, 100)
})

function handleInput(index, event) {
  const value = event.detail.value.toUpperCase()

  // 只保留第一个字符（防止粘贴多个字符）
  const char = value.charAt(0)
  codeArray.value[index] = char

  // 自动聚焦下一个输入框
  if (char && index < 7) {
    focusIndex.value = index + 1
  }
}

async function handleValidate() {
  if (inviteCode.value.length !== 8) {
    uni.showToast({
      title: '请输入完整的邀请码',
      icon: 'none'
    })
    return
  }

  if (isValidating.value) return
  isValidating.value = true

  try {
    const res = await validateInvite(inviteCode.value)
    inviteInfo.value = res.data
  } catch (e) {
    // 失败后的业务处理：不做任何操作，错误提示已在 request.js 中统一处理
  } finally {
    isValidating.value = false
  }
}

async function handleJoin() {
  if (isJoining.value) return
  isJoining.value = true

  try {
    await joinGroup({ inviteCode: inviteCode.value })
    uni.showToast({
      title: '加入成功',
      icon: 'success'
    })

    // 刷新家庭组信息
    await familyStore.fetchMyGroup()

    // 加入成功后，清除所有页面栈，重新导航
    setTimeout(() => {
      const pages = getCurrentPages()
      const delta = pages.length - 1

      if (delta > 0) {
        uni.navigateBack({
          delta: delta,
          success: () => {
            setTimeout(() => {
              uni.navigateTo({ url: '/pagesBase/family/detail' })
            }, 100)
          },
          fail: () => {
            uni.redirectTo({ url: '/pagesBase/family/detail' })
          }
        })
      } else {
        uni.redirectTo({ url: '/pagesBase/family/detail' })
      }
    }, 1500)
  } catch (e) {
    // 失败后的业务处理：不做任何操作，错误提示已在 request.js 中统一处理
  } finally {
    isJoining.value = false
  }
}

function formatExpireTime(time) {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.join-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 48rpx 24rpx;
}

.header {
  text-align: center;
  margin-bottom: 64rpx;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #999;
}

.code-input-section {
  margin-bottom: 48rpx;
}

.code-inputs {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
}

.code-input {
  flex: 1;
  height: 96rpx;
  background: #ffffff;
  border-radius: 12rpx;
  text-align: center;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  border: 2rpx solid #e4e7ed;
}

.code-input:focus {
  border-color: #667eea;
}

.preview-section {
  margin-bottom: 48rpx;
}

.preview-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.preview-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.group-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 16rpx;
  margin-right: 24rpx;
}

.group-avatar-placeholder {
  width: 96rpx;
  height: 96rpx;
  border-radius: 16rpx;
  background: #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  margin-right: 24rpx;
}

.group-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.group-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.group-meta {
  font-size: 24rpx;
  color: #999;
}

.preview-footer {
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.expire-text {
  font-size: 24rpx;
  color: #999;
}

.warning-tip {
  display: flex;
  align-items: center;
  background: #fff3e0;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
}

.warning-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.warning-text {
  font-size: 26rpx;
  color: #ff9800;
}

.btn-group {
  padding: 0 24rpx;
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

.btn-primary:active {
  opacity: 0.8;
}
</style>
