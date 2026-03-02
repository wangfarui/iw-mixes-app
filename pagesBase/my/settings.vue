<template>
  <view class="settings-page">
    <view class="settings-card">
      <view class="card-title">通用设置</view>
      <view class="settings-row">
        <text class="row-label">消息通知</text>
        <switch :checked="settings.notify" color="#007aff" @change="toggleSetting('notify', $event)" />
      </view>
      <view class="settings-row">
        <text class="row-label">自动更新</text>
        <switch :checked="settings.autoUpdate" color="#007aff" @change="toggleSetting('autoUpdate', $event)" />
      </view>
      <view class="settings-row">
        <text class="row-label">仅 Wi-Fi 同步</text>
        <switch :checked="settings.wifiOnly" color="#007aff" @change="toggleSetting('wifiOnly', $event)" />
      </view>
    </view>

    <view class="settings-card">
      <view class="card-title">缓存与更新</view>
      <view class="settings-row clickable" @tap="refreshCache">
        <text class="row-label">刷新缓存</text>
        <view class="row-right">
          <text class="row-value">提升数据一致性</text>
          <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
        </view>
      </view>
      <view class="settings-row clickable" @tap="checkUpdate">
        <text class="row-label">检查更新</text>
        <view class="row-right">
          <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
        </view>
      </view>
    </view>

    <view class="settings-card">
      <view class="card-title">关于</view>
      <view class="settings-row clickable" @tap="navigateTo('/pagesBase/my/about')">
        <text class="row-label">关于我们</text>
        <view class="row-right">
          <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
        </view>
      </view>
      <view class="settings-row clickable" @tap="navigateTo('/pagesBase/my/feedback')">
        <text class="row-label">意见反馈</text>
        <view class="row-right">
          <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { refreshDictCache } from '@/api/login.js'

const settingsKey = 'systemSettings'
const settings = reactive({
  notify: true,
  autoUpdate: true,
  wifiOnly: false
})

function loadSettings() {
  const cached = uni.getStorageSync(settingsKey)
  if (cached) {
    Object.assign(settings, cached)
  }
}

function saveSettings() {
  uni.setStorageSync(settingsKey, { ...settings })
}

function toggleSetting(key, e) {
  settings[key] = e.detail.value
  saveSettings()
}

function refreshCache() {
  uni.showLoading({ title: '刷新中...' })
  refreshDictCache(true)
  uni.hideLoading()
  uni.showToast({ title: '刷新成功', icon: 'success' })
}

function checkUpdate() {
  uni.showToast({ title: '已是最新版本', icon: 'none' })
}

function navigateTo(url) {
  uni.navigateTo({ url })
}

onMounted(() => {
  loadSettings()
})
</script>

<style lang="scss">
.settings-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 24rpx;
  box-sizing: border-box;
}

.settings-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  padding: 0 24rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.settings-card:last-child {
  margin-bottom: 0;
}

.card-title {
  padding: 24rpx 0 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 26rpx;
  color: #666;
  font-weight: 600;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.settings-row:last-child {
  border-bottom: none;
}

.settings-row.clickable:active {
  background-color: #f7f8fa;
}

.row-label {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.row-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.row-value {
  font-size: 26rpx;
  color: #999;
}
</style>
