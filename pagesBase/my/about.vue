<template>
  <view class="about-page">
    <view class="brand-card">
      <image class="brand-logo" :src="aboutConfig.logo" mode="aspectFill" />
      <text class="brand-name">{{ appName }}</text>
      <text class="brand-version">版本 {{ appVersion }}</text>
      <text class="brand-desc">{{ aboutConfig.desc }}</text>
    </view>

    <view class="info-card" v-if="aboutConfig.features.length">
      <view class="card-title">产品亮点</view>
      <view class="feature-row" v-for="(item, index) in aboutConfig.features" :key="index">
        <view class="feature-dot"></view>
        <text class="feature-text">{{ item }}</text>
      </view>
    </view>

    <view class="info-card" v-if="contactList.length">
      <view class="card-title">联系我们</view>
      <view
        class="info-row"
        v-for="(item, index) in contactList"
        :key="index"
      >
        <text class="info-label">{{ item.label }}</text>
        <view class="info-right">
          <text class="info-value">{{ item.value }}</text>
        </view>
      </view>
    </view>

    <view class="info-card" v-if="linkList.length">
      <view class="card-title">协议与政策</view>
      <view
        class="info-row clickable"
        v-for="(item, index) in linkList"
        :key="index"
        @tap="openLink(item)"
      >
        <text class="info-label">{{ item.label }}</text>
        <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
      </view>
    </view>

    <text class="copyright">
      © {{ currentYear }} {{ aboutConfig.owner }}
    </text>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const appName = ref('瑞菁小帮手')
const appVersion = ref('1.0.0')

const aboutConfig = {
  logo: '/static/logo.png',
  desc: '为个人、家庭提供生活服务帮助的小帮手。',
  owner: 'Wray',
  features: [
    '多场景生活管理，帮助建立清晰习惯',
    '轻量记录与提醒，让日常更高效',
    '数据汇总与趋势洞察，辅助规划'
  ],
  contacts: [
    { label: '联系邮箱', value: 'wray20156294@gmail.com' }
  ],
  links: []
}

const contactList = computed(() => aboutConfig.contacts.filter(item => item.value))
const linkList = computed(() => aboutConfig.links.filter(item => item.url))
const currentYear = new Date().getFullYear()

onMounted(() => {
  if (typeof uni.getAppBaseInfo === 'function') {
    const info = uni.getAppBaseInfo()
    appName.value = info?.appName || appName.value
    appVersion.value = info?.appVersion || appVersion.value
  }
})

function openLink(item) {
  if (!item?.url) return
  uni.setClipboardData({
    data: item.url,
    success() {
      uni.showToast({ title: '链接已复制', icon: 'none' })
    }
  })
}
</script>

<style lang="scss">
.about-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 24rpx;
  box-sizing: border-box;
}

.brand-card {
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20rpx;
}

.brand-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  background: #f0f0f0;
  margin-bottom: 16rpx;
}

.brand-name {
  font-size: 34rpx;
  font-weight: 600;
  color: #222;
  margin-bottom: 6rpx;
}

.brand-version {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.brand-desc {
  font-size: 26rpx;
  color: #666;
  text-align: center;
  line-height: 1.6;
}

.info-card {
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  padding: 0 24rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.card-title {
  padding: 24rpx 0 12rpx;
  font-size: 26rpx;
  color: #666;
  font-weight: 600;
  border-bottom: 1rpx solid #f0f0f0;
}

.feature-row {
  display: flex;
  align-items: flex-start;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.feature-row:last-child {
  border-bottom: none;
}

.feature-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #007aff;
  margin-top: 10rpx;
  margin-right: 12rpx;
}

.feature-text {
  font-size: 26rpx;
  color: #444;
  line-height: 1.6;
  flex: 1;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row.clickable:active {
  background-color: #f7f8fa;
}

.info-label {
  font-size: 28rpx;
  color: #333;
}

.info-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
  max-width: 60%;
}

.info-value {
  font-size: 26rpx;
  color: #666;
  text-align: right;
  word-break: break-all;
}

.copyright {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
}
</style>
