<template>
  <view class="manage-page">
    <view class="section">
      <text class="section-title">基本信息</text>
      <view class="section-card">
        <view class="list-row" @tap="goEdit">
          <text class="row-label">修改家庭组信息</text>
          <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
        </view>
        <view class="list-row" @tap="goTransfer">
          <text class="row-label">转让群主</text>
          <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">邀请管理</text>
      <view class="section-card">
        <view class="list-row" @tap="goInviteList">
          <text class="row-label">查看邀请码列表</text>
          <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">危险操作</text>
      <view class="section-card">
        <view class="list-row danger" @tap="handleDissolve">
          <text class="row-label">解散家庭组</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { deleteGroup } from '@/api/family.js'
import { useFamilyStore } from '@/stores/family.js'

const familyStore = useFamilyStore()

function goEdit() {
  uni.navigateTo({ url: '/pagesBase/family/edit' })
}

function goTransfer() {
  uni.navigateTo({ url: '/pagesBase/family/transfer' })
}

function goInviteList() {
  uni.navigateTo({ url: '/pagesBase/family/inviteList' })
}

function handleDissolve() {
  uni.showModal({
    title: '警告',
    content: '解散后所有成员将退出家庭组，此操作不可恢复，确定要解散吗？',
    confirmText: '确定解散',
    confirmColor: '#f56c6c',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteGroup(familyStore.myGroup.id)
          uni.showToast({
            title: '解散成功',
            icon: 'success'
          })
          familyStore.clearGroup()
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/my/my' })
          }, 1500)
        } catch (e) {
          uni.showToast({
            title: e.message || '解散失败',
            icon: 'error'
          })
        }
      }
    }
  })
}
</script>

<style scoped>
.manage-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 24rpx;
}

.section {
  margin-bottom: 32rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  color: #999;
  margin-bottom: 16rpx;
  padding: 0 8rpx;
}

.section-card {
  background: #ffffff;
  border-radius: 16rpx;
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

.list-row.danger {
  justify-content: center;
}

.row-label {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.list-row.danger .row-label {
  color: #f56c6c;
  font-weight: 600;
}
</style>
