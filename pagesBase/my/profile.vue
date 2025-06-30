<template>
  <view class="profile-container">
    <view class="profile-avatar-section">
      <image
        class="profile-avatar"
        :src="userInfo.avatar || defaultAvatar"
        mode="aspectFill"
        @tap="openUploadPopup"
      />
    </view>
    <view class="profile-info-list">
      <view class="profile-info-item clickable" @tap="showEditName = true">
        <text class="profile-info-label">姓名</text>
        <view class="profile-info-value-row">
          <text class="profile-info-value">{{ userInfo.name }}</text>
          <text class="profile-arrow">&gt;</text>
        </view>
      </view>
      <view class="profile-info-item">
        <text class="profile-info-label">手机号</text>
        <text class="profile-info-value">{{ userInfo.phoneNumber || '-' }}</text>
      </view>
      <view class="profile-info-item">
        <text class="profile-info-label">邮箱</text>
        <text class="profile-info-value">{{ userInfo.emailAddress || '-' }}</text>
      </view>
    </view>
    <!-- 编辑姓名弹窗 -->
    <uni-popup ref="editNamePopup" type="dialog" :mask-click="false">
      <view class="edit-name-popup">
        <view class="edit-name-title">编辑姓名</view>
        <input
          v-model="editName"
          class="edit-name-input"
          placeholder="请输入新姓名"
          maxlength="20"
        />
        <view class="edit-name-actions">
          <button size="mini" @tap="showEditName = false">取消</button>
          <button size="mini" type="primary" @tap="submitEditName">保存</button>
        </view>
      </view>
    </uni-popup>
    <!-- 上传图片弹窗 -->
    <uni-popup ref="uploadPopup" type="bottom" :animation="true">
      <view class="upload-popup-actions">
        <button class="upload-popup-btn" @tap="takePhoto">拍照</button>
        <button class="upload-popup-btn" @tap="chooseFromAlbum">从相册选择</button>
        <button class="upload-popup-btn cancel" @tap="closeUploadPopup">取消</button>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { uploadFile } from '@/stores/file.js'
import http from '@/api/request.js'
import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'

const defaultAvatar = 'https://cdn.uviewui.com/uview/common/avatar.png'
const userInfo = ref({})
const showEditName = ref(false)
const editName = ref('')
const editNamePopup = ref(null)
const uploadPopup = ref(null)

// 获取用户信息
async function fetchUserInfo() {
  try {
    const res = await http.get('/auth-service/user/getUserInfo')
    userInfo.value = res.data || {}
  } catch (e) {
    uni.showToast({ title: '获取信息失败', icon: 'error' })
  }
}

onMounted(() => {
  fetchUserInfo()
})

watch(showEditName, (val) => {
  if (val) {
    editName.value = userInfo.value.name || ''
    editNamePopup.value.open()
  } else {
    editNamePopup.value.close()
  }
})

// 头像相关
function openUploadPopup() {
  uploadPopup.value.open()
}
function closeUploadPopup() {
  uploadPopup.value.close()
}
function takePhoto() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera'],
    success: async (res) => {
      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        await uploadFileForAvatar(res.tempFilePaths[0])
        closeUploadPopup()
      }
    }
  })
}
function chooseFromAlbum() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album'],
    success: async (res) => {
      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        await uploadFileForAvatar(res.tempFilePaths[0])
        closeUploadPopup()
      }
    }
  })
}
// 上传头像并更新（新接口）
async function uploadFileForAvatar(filePath) {
  uni.showLoading({ title: '上传中...' })
  try {
    const fileRes = await uploadFile(filePath)
    const avatarUrl = fileRes.fileUrl
    await http.put('/auth-service/user/editUserInfo', { avatar: avatarUrl })
    userInfo.value.avatar = avatarUrl
    uni.setStorageSync('userInfo', userInfo.value)
    uni.showToast({ title: '更新成功', icon: 'success' })
  } finally {
    uni.hideLoading()
  }
}

// 修改姓名（新接口）
async function submitEditName() {
  const newName = editName.value.trim()
  if (!newName) {
    uni.showToast({ title: '姓名不能为空', icon: 'none' })
    return
  }
  uni.showLoading({ title: '保存中...' })
  try {
    await http.put('/auth-service/user/editUserInfo', { name: newName })
    userInfo.value.name = newName
    uni.setStorageSync('userInfo', userInfo.value)
    uni.showToast({ title: '修改成功', icon: 'success' })
    showEditName.value = false
  } finally {
    uni.hideLoading()
  }
}
</script>

<style lang="scss">
.profile-container {
  padding: 32rpx 24rpx;
  background: #f7f8fa;
  min-height: 100vh;
}
.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
}
.profile-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: #fff;
  border: 4rpx solid #eee;
  margin-bottom: 12rpx;
}
.profile-info-list {
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
  padding: 0 24rpx;
}
.profile-info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  &:last-child {
    border-bottom: none;
  }
}
.profile-info-label {
  color: #666;
  font-size: 28rpx;
}
.profile-info-value-row {
  display: flex;
  align-items: center;
}
.profile-info-value {
  color: #222;
  font-size: 30rpx;
  margin-right: 16rpx;
}
.profile-arrow {
  font-size: 32rpx;
  color: #bbb;
  margin-left: 8rpx;
}
.clickable {
  cursor: pointer;
}
.edit-name-popup {
  padding: 32rpx 24rpx;
  background: #fff;
  border-radius: 16rpx;
  width: 500rpx;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.edit-name-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24rpx;
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
.upload-popup-actions {
  display: flex;
  flex-direction: column;
  padding: 32rpx 0;
}
.upload-popup-btn {
  margin: 0 32rpx 24rpx 32rpx;
  font-size: 32rpx;
  border-radius: 12rpx;
  background: #f7f8fa;
  color: #222;
  border: none;
}
.upload-popup-btn.cancel {
  color: #888;
  background: #fff;
  border: 1rpx solid #eee;
}
</style>