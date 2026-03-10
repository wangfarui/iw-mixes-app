<template>
  <view class="invite-list-page">
    <view v-if="inviteList.length > 0" class="list">
      <view v-for="invite in inviteList" :key="invite.id" class="invite-item">
        <view class="invite-header">
          <text class="invite-code">{{ invite.inviteCode }}</text>
          <view class="status-tag" :class="getStatusClass(invite.status)">
            <text class="status-text">{{ getStatusText(invite.status) }}</text>
          </view>
        </view>
        <view class="invite-info">
          <text class="info-text">邀请人：{{ invite.inviterName }}</text>
          <text class="info-text">有效期：{{ invite.validHours }}小时</text>
          <text class="info-text">过期时间：{{ formatTime(invite.expireTime) }}</text>
          <text class="info-text">创建时间：{{ formatTime(invite.createTime) }}</text>
        </view>
        <view v-if="invite.status === 1" class="invite-actions">
          <button class="btn-copy" @tap="handleCopy(invite.inviteCode)">
            <text>复制邀请码</text>
          </button>
        </view>
      </view>
    </view>

    <view v-else class="empty">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无邀请记录</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getInviteList } from '@/api/family.js'
import { useFamilyStore } from '@/stores/family.js'

const familyStore = useFamilyStore()
const inviteList = ref([])

onMounted(() => {
  fetchInviteList()
})

async function fetchInviteList() {
  try {
    const res = await getInviteList(familyStore.myGroup.id)
    inviteList.value = res.data || []
  } catch (e) {
    // 失败后的业务处理：不做任何操作，错误提示已在 request.js 中统一处理
  }
}

function getStatusText(status) {
  const statusMap = {
    1: '待使用',
    2: '已使用',
    4: '已过期'
  }
  return statusMap[status] || '未知'
}

function getStatusClass(status) {
  const classMap = {
    1: 'pending',
    2: 'accepted',
    4: 'expired'
  }
  return classMap[status] || ''
}

function handleCopy(inviteCode) {
  uni.setClipboardData({
    data: inviteCode,
    success: () => {
      uni.showToast({
        title: '已复制到剪贴板',
        icon: 'success'
      })
    }
  })
}

function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.invite-list-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 24rpx;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.invite-item {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.invite-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.invite-code {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  letter-spacing: 4rpx;
}

.status-tag {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.status-tag.pending {
  background: #e1f3d8;
}

.status-tag.accepted {
  background: #e4e7ed;
}

.status-tag.expired {
  background: #fef0f0;
}

.status-text {
  font-size: 24rpx;
  font-weight: 500;
}

.status-tag.pending .status-text {
  color: #67c23a;
}

.status-tag.accepted .status-text {
  color: #909399;
}

.status-tag.expired .status-text {
  color: #f56c6c;
}

.invite-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.info-text {
  font-size: 26rpx;
  color: #666;
}

.invite-actions {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn-copy {
  width: 100%;
  height: 64rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 32rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-copy:active {
  opacity: 0.8;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;
}

.empty-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
