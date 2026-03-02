<template>
  <view class="security-page">
    <view class="list-card">
      <view class="list-row" @tap="handleEditName">
        <text class="row-label">账号名</text>
        <view class="row-right">
          <text class="row-value">{{ userInfo.name || '-' }}</text>
          <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
        </view>
      </view>
      <view class="list-row" @tap="handleChangePhone">
        <text class="row-label">手机号</text>
        <view class="row-right">
          <text class="row-value">{{ userInfo.phoneNumber || '未绑定' }}</text>
          <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
        </view>
      </view>
      <view class="list-row" @tap="handleChangeEmail">
        <text class="row-label">邮箱</text>
        <view class="row-right">
          <text class="row-value">{{ userInfo.emailAddress || '未绑定' }}</text>
          <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
        </view>
      </view>
      <view class="list-row" @tap="handleChangePassword">
        <text class="row-label">修改密码</text>
        <view class="row-right">
          <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
        </view>
      </view>
      <view class="list-row danger-row" @tap="handleDeleteAccount">
        <text class="row-label danger-text">注销账号</text>
        <view class="row-right">
          <uni-icons type="right" size="16" color="#f56c6c"></uni-icons>
        </view>
      </view>
    </view>
    <text class="danger-tip">注销后账号将被永久删除，数据无法恢复。</text>
  </view>

  <uni-popup ref="passwordPopup" type="center">
    <view class="password-popup">
      <view class="popup-header">
        <text class="popup-title">修改密码</text>
        <text class="popup-close" @tap="closePasswordPopup">×</text>
      </view>
      <view class="popup-content">
        <view class="form-item">
          <input
            type="password"
            v-model="oldPassword"
            placeholder="请输入原密码"
            class="input-item"
          />
        </view>
        <view class="form-item">
          <input
            type="password"
            v-model="newPassword"
            placeholder="请输入新密码"
            class="input-item"
          />
        </view>
        <view class="form-item">
          <input
            type="password"
            v-model="confirmPassword"
            placeholder="请确认新密码"
            class="input-item"
          />
        </view>
        <button class="submit-btn" :disabled="isSubmitting" @tap="submitPasswordChange">
          {{ isSubmitting ? '提交中...' : '确认修改' }}
        </button>
      </view>
    </view>
  </uni-popup>

  <uni-popup ref="editNamePopup" type="dialog" :mask-click="false">
    <view class="edit-name-popup">
      <view class="edit-name-title">编辑账号名</view>
      <input
        v-model="editName"
        class="edit-name-input"
        placeholder="请输入账号名"
        maxlength="20"
      />
      <view class="edit-name-actions">
        <button size="mini" @tap="closeEditNamePopup">取消</button>
        <button size="mini" type="primary" @tap="submitEditName">保存</button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import http from '@/api/request.js'
import { stopVersionPolling } from '@/api/login.js'

const userInfo = ref({
  name: '',
  phoneNumber: '',
  emailAddress: ''
})

const passwordPopup = ref(null)
const editNamePopup = ref(null)
const editName = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)
const isLoading = ref(false)

async function fetchUserInfo() {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const res = await http.get('/auth-service/user/getUserInfo')
    userInfo.value = res.data || {}
    uni.setStorageSync('userInfo', userInfo.value)
  } catch (e) {
    uni.showToast({ title: '获取用户信息失败', icon: 'none' })
  } finally {
    isLoading.value = false
  }
}

onShow(() => {
  fetchUserInfo()
})

function handleEditName() {
  editName.value = userInfo.value.name || ''
  editNamePopup.value.open()
}

function closeEditNamePopup() {
  editNamePopup.value.close()
}

async function submitEditName() {
  const newName = editName.value.trim()
  if (!newName) {
    uni.showToast({ title: '账号名不能为空', icon: 'none' })
    return
  }
  uni.showLoading({ title: '保存中...' })
  try {
    await http.put('/auth-service/user/editUserInfo', { name: newName })
    userInfo.value.name = newName
    uni.setStorageSync('userInfo', userInfo.value)
    uni.showToast({ title: '修改成功', icon: 'success' })
    closeEditNamePopup()
  } catch (e) {
    uni.showToast({ title: '修改失败', icon: 'error' })
  } finally {
    uni.hideLoading()
  }
}

function handleChangePassword() {
  passwordPopup.value.open()
}

function closePasswordPopup() {
  passwordPopup.value.close()
  resetPasswordForm()
}

function resetPasswordForm() {
  oldPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  isSubmitting.value = false
}

async function submitPasswordChange() {
  if (isSubmitting.value) return
  if (!oldPassword.value) {
    uni.showToast({ title: '请输入原密码', icon: 'none' })
    return
  }
  if (!newPassword.value) {
    uni.showToast({ title: '请输入新密码', icon: 'none' })
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
    return
  }

  isSubmitting.value = true
  try {
    await http.post('/auth-service/user/editPassword', {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    })
    uni.showToast({ title: '密码修改成功', icon: 'success' })
    closePasswordPopup()
  } catch (e) {
    uni.showToast({ title: '密码修改失败', icon: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

function handleChangePhone() {
  uni.showToast({ title: '更换手机号功能待接入', icon: 'none' })
}

function handleChangeEmail() {
  uni.showToast({ title: '更换邮箱功能待接入', icon: 'none' })
}

function handleDeleteAccount() {
  uni.showModal({
    title: '确认注销',
    content: '注销后账号将被永久删除，且无法恢复。是否继续？',
    confirmText: '确认注销',
    cancelText: '取消',
    success: async (res) => {
      if (!res.confirm) return
      uni.showLoading({ title: '处理中...' })
      try {
        await http.get('/auth-service/user/deletion')
        stopVersionPolling()
        uni.removeStorageSync('iwtoken')
        uni.removeStorageSync('userInfo')
        uni.reLaunch({ url: '/pagesAuth/login/index' })
      } catch (e) {
        uni.showToast({ title: '注销失败', icon: 'error' })
      } finally {
        uni.hideLoading()
      }
    }
  })
}
</script>

<style lang="scss">
.security-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 24rpx;
  box-sizing: border-box;
}

.list-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
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

.row-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.row-value {
  font-size: 28rpx;
  color: #666;
  max-width: 360rpx;
  text-align: right;
  word-break: break-all;
}

.danger-row .row-label {
  color: #f56c6c;
}

.danger-tip {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999;
}

.password-popup {
  width: 600rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
}

.popup-close {
  font-size: 36rpx;
  color: #999;
  padding: 0 12rpx;
}

.popup-content {
  padding: 24rpx;
}

.form-item {
  margin-bottom: 20rpx;
}

.input-item {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #007aff;
  color: #fff;
  font-size: 28rpx;
  border-radius: 8rpx;
  margin-top: 12rpx;
}

.submit-btn:disabled {
  opacity: 0.7;
}

.edit-name-popup {
  padding: 32rpx 24rpx;
  background: #fff;
  border-radius: 16rpx;
  width: 520rpx;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.edit-name-title {
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
  margin-bottom: 24rpx;
  color: #222;
}

.edit-name-input {
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 16rpx;
  font-size: 28rpx;
  margin-bottom: 24rpx;
}

.edit-name-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}
</style>
