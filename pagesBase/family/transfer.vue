<template>
  <view class="transfer-page">
    <view class="tip-card">
      <text class="tip-icon">⚠️</text>
      <text class="tip-text">转让群主后，您将成为普通成员，新群主将拥有管理家庭组的所有权限</text>
    </view>

    <view v-if="memberList.length > 0" class="member-section">
      <text class="section-title">选择新群主</text>
      <view class="member-list">
        <view
          v-for="member in memberList"
          :key="member.id"
          class="member-item"
          :class="{ selected: selectedMember?.id === member.id }"
          @tap="selectMember(member)"
        >
          <image v-if="member.avatar" :src="member.avatar" class="member-avatar" mode="aspectFill" />
          <view v-else class="member-avatar-placeholder">👤</view>
          <view class="member-info">
            <text class="member-name">{{ member.name || member.username }}</text>
          </view>
          <view v-if="selectedMember?.id === member.id" class="check-icon">
            <text>✓</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty">
      <text class="empty-text">暂无可转让的成员</text>
    </view>

    <view class="btn-group">
      <button class="btn btn-primary" @tap="handleTransfer" :disabled="!selectedMember" :loading="isTransferring">
        确认转让
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMemberList, transferOwner } from '@/api/family.js'
import { useFamilyStore } from '@/stores/family.js'

const familyStore = useFamilyStore()
const memberList = ref([])
const selectedMember = ref(null)
const isTransferring = ref(false)

onMounted(() => {
  fetchMembers()
})

async function fetchMembers() {
  try {
    const res = await getMemberList(familyStore.myGroup.id)
    // 过滤掉群主（只显示普通成员）
    memberList.value = (res.data || []).filter(m => m.role !== 1)
  } catch (e) {
    // 失败后的业务处理：不做任何操作，错误提示已在 request.js 中统一处理
  }
}

function selectMember(member) {
  selectedMember.value = member
}

function handleTransfer() {
  if (!selectedMember.value) {
    uni.showToast({
      title: '请选择新群主',
      icon: 'none'
    })
    return
  }

  uni.showModal({
    title: '确认转让',
    content: `确定要将群主转让给"${selectedMember.value.name || selectedMember.value.username}"吗？此操作不可撤销。`,
    confirmText: '确定转让',
    confirmColor: '#667eea',
    success: async (res) => {
      if (res.confirm) {
        await doTransfer()
      }
    }
  })
}

async function doTransfer() {
  if (isTransferring.value) return
  isTransferring.value = true

  try {
    await transferOwner({
      groupId: familyStore.myGroup.id,
      newOwnerUserId: selectedMember.value.userId
    })
    uni.showToast({
      title: '转让成功',
      icon: 'success'
    })

    // 刷新家庭组信息
    await familyStore.fetchMyGroup()

    // 转让成功后，返回到我的页面（清除所有中间页面）
    setTimeout(() => {
      const pages = getCurrentPages()
      const delta = pages.length - 1

      if (delta > 0) {
        uni.navigateBack({ delta: delta })
      } else {
        uni.switchTab({ url: '/pages/my/my' })
      }
    }, 1500)
  } catch (e) {
    // 失败后的业务处理：不做任何操作，错误提示已在 request.js 中统一处理
  } finally {
    isTransferring.value = false
  }
}
</script>

<style scoped>
.transfer-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 24rpx;
}

.tip-card {
  background: #fff3e0;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.tip-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.tip-text {
  flex: 1;
  font-size: 26rpx;
  color: #ff9800;
  line-height: 1.6;
}

.member-section {
  margin-bottom: 24rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  color: #999;
  margin-bottom: 16rpx;
  padding: 0 8rpx;
}

.member-list {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}

.member-item:last-child {
  border-bottom: none;
}

.member-item:active {
  background-color: #f7f8fa;
}

.member-item.selected {
  background-color: #f0f4ff;
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
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.check-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
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

.btn-primary:disabled {
  background: #e4e7ed;
  color: #c0c4cc;
}

.btn-primary:active:not(:disabled) {
  opacity: 0.8;
}
</style>
