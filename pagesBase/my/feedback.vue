<template>
  <view class="feedback-page">
    <view class="card">
      <view class="card-title">反馈类型</view>
      <view class="type-list">
        <view
          v-for="item in feedbackTypes"
          :key="item.value"
          :class="['type-item', { active: selectedType === item.value }]"
          @tap="selectedType = item.value"
        >
          {{ item.label }}
        </view>
      </view>
    </view>

    <view class="card">
      <view class="card-title">反馈内容</view>
      <textarea
        v-model="content"
        class="feedback-input"
        :maxlength="maxLength"
        placeholder="请描述你遇到的问题或建议"
        placeholder-class="input-placeholder"
      />
      <view class="input-counter">{{ contentLength }}/{{ maxLength }}</view>
    </view>

    <view class="card">
      <view class="card-title">联系方式（选填）</view>
      <input
        v-model="contact"
        class="contact-input"
        placeholder="邮箱/手机号/微信"
        placeholder-class="input-placeholder"
      />
      <text class="contact-tip">便于我们与您联系</text>
    </view>

    <button class="submit-btn" :disabled="isSubmitting" @tap="submitFeedback">
      {{ isSubmitting ? '提交中...' : '提交反馈' }}
    </button>
    <text class="footer-tip">感谢你的建议，我们会尽快处理</text>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const feedbackTypes = [
  { label: '功能异常', value: 'bug' },
  { label: '产品建议', value: 'suggestion' },
  { label: '体验问题', value: 'experience' },
  { label: '其他', value: 'other' }
]

const selectedType = ref(feedbackTypes[0].value)
const content = ref('')
const contact = ref('')
const maxLength = 300
const isSubmitting = ref(false)

const contentLength = computed(() => content.value.length)

async function submitFeedback() {
  if (isSubmitting.value) return
  if (!content.value.trim()) {
    uni.showToast({ title: '请填写反馈内容', icon: 'none' })
    return
  }
  isSubmitting.value = true
  uni.showLoading({ title: '提交中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '提交成功', icon: 'success' })
    content.value = ''
    contact.value = ''
    selectedType.value = feedbackTypes[0].value
    isSubmitting.value = false
  }, 400)
}
</script>

<style lang="scss">
.feedback-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 24rpx;
  box-sizing: border-box;
}

.card {
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 26rpx;
  color: #666;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.type-item {
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  background: #f5f6f8;
  color: #555;
  font-size: 26rpx;
}

.type-item.active {
  background: #eef4ff;
  color: #007aff;
  border: 1rpx solid #cfe0ff;
}

.feedback-input {
  width: 100%;
  min-height: 200rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.input-counter {
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.contact-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.contact-tip {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 12rpx;
}

.input-placeholder {
  color: #bbb;
}

.submit-btn {
  margin-top: 12rpx;
  height: 88rpx;
  line-height: 88rpx;
  background: #007aff;
  color: #fff;
  font-size: 30rpx;
  border-radius: 16rpx;
}

.submit-btn:disabled {
  opacity: 0.7;
}

.submit-btn::after {
  border: none;
}

.footer-tip {
  display: block;
  text-align: center;
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
