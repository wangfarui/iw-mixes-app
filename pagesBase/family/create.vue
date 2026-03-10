<template>
  <view class="create-page">
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">家庭组头像</text>
        <view class="avatar-upload" @tap="chooseAvatar">
          <image v-if="formData.groupAvatar" :src="formData.groupAvatar" class="avatar-preview" mode="aspectFill" />
          <view v-else class="avatar-placeholder">
            <text class="placeholder-icon">📷</text>
            <text class="placeholder-text">点击上传</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">家庭组名称 <text class="required">*</text></text>
        <input
          v-model="formData.groupName"
          class="form-input"
          placeholder="请输入家庭组名称"
          maxlength="32"
        />
      </view>

      <view class="form-item">
        <text class="form-label">家庭组描述</text>
        <textarea
          v-model="formData.groupDesc"
          class="form-textarea"
          placeholder="请输入家庭组描述（可选）"
          maxlength="255"
        />
      </view>

      <view class="form-item">
        <text class="form-label">最大成员数</text>
        <input
          v-model.number="formData.maxMember"
          class="form-input"
          type="number"
          placeholder="默认10人"
        />
      </view>
    </view>

    <view class="btn-group">
      <button class="btn btn-primary" @tap="handleSubmit" :loading="isSubmitting">创建家庭组</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { createGroup } from '@/api/family.js'
import { uploadFile } from '@/stores/file.js'
import { useFamilyStore } from '@/stores/family.js'

const familyStore = useFamilyStore()
const isSubmitting = ref(false)

const formData = ref({
  groupName: '',
  groupAvatar: '',
  groupDesc: '',
  maxMember: 10
})

function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uni.showLoading({ title: '上传中...' })
      try {
        const fileRecord = await uploadFile(tempFilePath)
        formData.value.groupAvatar = fileRecord.fileUrl
        uni.hideLoading()
      } catch (e) {
        uni.hideLoading()
        uni.showToast({
          title: '上传失败',
          icon: 'error'
        })
      }
    }
  })
}

async function handleSubmit() {
  if (!formData.value.groupName) {
    uni.showToast({
      title: '请输入家庭组名称',
      icon: 'none'
    })
    return
  }

  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    await createGroup(formData.value)
    uni.showToast({
      title: '创建成功',
      icon: 'success'
    })

    // 刷新家庭组信息
    await familyStore.fetchMyGroup()

    // 创建成功后，清除所有页面栈，重新导航
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
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.create-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 24rpx;
}

.form-section {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.required {
  color: #f56c6c;
}

.avatar-upload {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-preview {
  width: 100%;
  height: 100%;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.placeholder-text {
  font-size: 24rpx;
  color: #999;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f7f8fa;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  background: #f7f8fa;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #333;
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
