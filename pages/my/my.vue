<template>
  <view class="my-page">
    <view class="profile-card" @tap="goProfile">
      <image
        :src="userInfo.avatar || defaultAvatar"
        class="avatar"
        mode="aspectFill"
        @tap.stop="previewAvatar"
      />
      <view class="profile-main">
        <text class="profile-name">{{ userInfo.name || '未登录' }}</text>
        <text class="profile-sub">{{ profileSub }}</text>
      </view>
      <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
    </view>

    <view class="section-card">
      <view class="list-row" @tap="navigateTo('/pagesBase/my/security')">
        <text class="row-label">账号安全</text>
        <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
      </view>
      <view class="list-row" @tap="navigateTo('/pagesBase/my/settings')">
        <text class="row-label">系统设置</text>
        <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
      </view>
    </view>

    <view class="section-card logout-card">
      <view class="list-row logout-row" @tap="clickLogout">
        <text class="row-label logout-text">退出登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import http from '@/api/request.js'
import { logout, stopVersionPolling } from '@/api/login.js'

const defaultAvatar = 'https://cdn.uviewui.com/uview/common/avatar.png'
const userInfo = ref({})
const isLoading = ref(false)

const profileSub = computed(() => {
  if (userInfo.value?.phoneNumber) return userInfo.value.phoneNumber
  if (userInfo.value?.emailAddress) return userInfo.value.emailAddress
  return '点击完善个人资料'
})

async function fetchUserInfo() {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const res = await http.get('/auth-service/user/getUserInfo')
    userInfo.value = res.data || {}
    uni.setStorageSync('userInfo', userInfo.value)
  } catch (e) {
    const cached = uni.getStorageSync('userInfo')
    if (cached) {
      userInfo.value = cached
    }
  } finally {
    isLoading.value = false
  }
}

onShow(() => {
  fetchUserInfo()
})

function goProfile() {
  navigateTo('/pagesBase/my/profile')
}

function navigateTo(url) {
  uni.navigateTo({ url })
}

function clickLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        stopVersionPolling()
        logout()
        uni.removeStorageSync('iwtoken')
        uni.removeStorageSync('userInfo')
        uni.reLaunch({ url: '/pagesAuth/login/index' })
      }
    }
  })
}

function previewAvatar() {
  const avatarUrl = userInfo.value?.avatar || defaultAvatar
  uni.previewImage({
    current: avatarUrl,
    urls: [avatarUrl]
  })
}
</script>

<style>
.my-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 24rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.profile-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid #f0f0f0;
  background-color: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.profile-main {
  flex: 1;
  margin-left: 24rpx;
}

.profile-name {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #222;
  margin-bottom: 6rpx;
}

.profile-sub {
  font-size: 24rpx;
  color: #999;
}

.section-card {
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  margin-bottom: 20rpx;
  overflow: hidden;
}

.list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.list-row:last-child {
  border-bottom: none;
}

.list-row:active {
  background-color: #f7f8fa;
}

.row-label {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.logout-card {
  margin-bottom: 0;
}

.logout-row {
  justify-content: center;
}

.logout-text {
  color: #f56c6c;
  font-weight: 600;
}
</style>
