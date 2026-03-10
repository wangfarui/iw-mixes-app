<template>
  <view class="detail-page">
    <view v-if="groupInfo" class="content">
      <view class="header-card">
        <image v-if="groupInfo.groupAvatar" :src="groupInfo.groupAvatar" class="group-avatar" mode="aspectFill" />
        <view v-else class="group-avatar-placeholder">👨‍👩‍👧‍👦</view>
        <text class="group-name">{{ groupInfo.groupName }}</text>
        <text v-if="groupInfo.groupDesc" class="group-desc">{{ groupInfo.groupDesc }}</text>
        <text class="member-count">{{ memberList.length }}/{{ groupInfo.maxMember }} 成员</text>
      </view>

      <view class="member-section">
        <text class="section-title">成员列表</text>
        <view class="member-list">
          <view v-for="member in memberList" :key="member.id" class="member-item">
            <image v-if="member.avatar" :src="member.avatar" class="member-avatar" mode="aspectFill" />
            <view v-else class="member-avatar-placeholder">👤</view>
            <view class="member-info">
              <text class="member-name">{{ member.name || member.username }}</text>
              <text class="member-role">{{ getRoleText(member.role) }}</text>
            </view>
            <view v-if="isOwner && member.role !== 1" class="member-action" @tap="handleRemoveMember(member)">
              <text class="action-text">移除</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="isOwner" class="action-section">
        <view class="action-btn" @tap="goInvite">
          <text class="action-icon">📨</text>
          <text class="action-text">邀请成员</text>
          <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
        </view>
        <view class="action-btn" @tap="goManage">
          <text class="action-icon">⚙️</text>
          <text class="action-text">管理家庭组</text>
          <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
        </view>
      </view>

      <view v-if="!isOwner" class="action-section">
        <view class="action-btn danger" @tap="handleQuit">
          <text class="action-text">退出家庭组</text>
        </view>
      </view>
    </view>

    <view v-else class="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getMyGroup, getMemberList, quitGroup, removeMember } from '@/api/family.js'
import { useFamilyStore } from '@/stores/family.js'

const familyStore = useFamilyStore()
const groupInfo = ref(null)
const memberList = ref([])

const isOwner = computed(() => {
  if (!groupInfo.value) return false
  const userInfo = uni.getStorageSync('userInfo')
  return groupInfo.value.ownerUserId === userInfo?.id
})

onMounted(() => {
  fetchData()
})

async function fetchData() {
  try {
    // 先获取家庭组信息
    const groupRes = await getMyGroup()
    groupInfo.value = groupRes.data

    // 使用获取到的家庭组ID查询成员列表
    if (groupInfo.value?.id) {
      const memberRes = await getMemberList(groupInfo.value.id)
      memberList.value = memberRes.data || []
    }
  } catch (e) {
    // 失败后的业务处理：不做任何操作，错误提示已在 request.js 中统一处理
  }
}

function getRoleText(role) {
  return role === 1 ? '群主' : '成员'
}

function goInvite() {
  uni.navigateTo({ url: '/pagesBase/family/invite' })
}

function goManage() {
  uni.navigateTo({ url: '/pagesBase/family/manage' })
}

function handleRemoveMember(member) {
  uni.showModal({
    title: '提示',
    content: `确定要移除成员"${member.name || member.username}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await removeMember({
            groupId: groupInfo.value.id,
            userId: member.userId
          })
          uni.showToast({
            title: '移除成功',
            icon: 'success'
          })
          fetchData()
        } catch (e) {
          // 失败后的业务处理：不做任何操作，错误提示已在 request.js 中统一处理
        }
      }
    }
  })
}

function handleQuit() {
  uni.showModal({
    title: '提示',
    content: `确定要退出"${groupInfo.value.groupName}"吗？退出后将无法查看家庭组的共享数据。`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await quitGroup(groupInfo.value.id)
          uni.showToast({
            title: '退出成功',
            icon: 'success'
          })
          familyStore.clearGroup()
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (e) {
          // 失败后的业务处理：不做任何操作，错误提示已在 request.js 中统一处理
        }
      }
    }
  })
}
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 24rpx;
}

.header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24rpx;
}

.group-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-bottom: 24rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.group-avatar-placeholder {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  margin-bottom: 24rpx;
}

.group-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12rpx;
}

.group-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12rpx;
  text-align: center;
}

.member-count {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.member-section {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.member-list {
  display: flex;
  flex-direction: column;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.member-item:last-child {
  border-bottom: none;
}

.member-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 20rpx;
}

.member-avatar-placeholder {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  background: #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.member-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 6rpx;
}

.member-role {
  font-size: 24rpx;
  color: #999;
}

.member-action {
  padding: 8rpx 20rpx;
}

.action-text {
  font-size: 26rpx;
  color: #f56c6c;
}

.action-section {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.action-btn:last-child {
  border-bottom: none;
}

.action-btn:active {
  background-color: #f7f8fa;
}

.action-btn.danger {
  justify-content: center;
}

.action-btn.danger .action-text {
  color: #f56c6c;
  font-weight: 600;
}

.action-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.action-btn .action-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;
  font-size: 28rpx;
  color: #999;
}
</style>
