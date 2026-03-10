<template>
  <view class="family-index">
    <view class="header">
      <text class="icon">👨‍👩‍👧‍👦</text>
      <text class="title">家庭组</text>
      <text class="subtitle">与家人共享账单、任务等数据</text>
    </view>

    <view class="actions">
      <view class="action-btn primary" @tap="goCreate">
        <text class="btn-text">创建家庭组</text>
      </view>
      <view class="action-btn secondary" @tap="goJoin">
        <text class="btn-text">加入家庭组</text>
      </view>
    </view>

    <view class="features">
      <view class="feature-item">
        <text class="feature-icon">📊</text>
        <text class="feature-text">共享账单数据</text>
      </view>
      <view class="feature-item">
        <text class="feature-icon">✅</text>
        <text class="feature-text">共享任务清单</text>
      </view>
      <view class="feature-item">
        <text class="feature-icon">🍽️</text>
        <text class="feature-text">共享餐饮记录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
function goCreate() {
  uni.navigateTo({ url: '/pagesBase/family/create' })
}

function goJoin() {
  uni.navigateTo({ url: '/pagesBase/family/join' })
}
</script>

<style scoped>
.family-index {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 120rpx;
}

.icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.title {
  font-size: 48rpx;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.actions {
  width: 100%;
  margin-bottom: 80rpx;
}

.action-btn {
  width: 100%;
  height: 96rpx;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.action-btn.primary {
  background: #ffffff;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
}

.action-btn.primary .btn-text {
  color: #667eea;
  font-size: 32rpx;
  font-weight: 600;
}

.action-btn.secondary .btn-text {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
}

.action-btn:active {
  opacity: 0.8;
}

.features {
  width: 100%;
  display: flex;
  justify-content: space-around;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.feature-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}
</style>
