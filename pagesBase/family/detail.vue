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
            <view class="member-actions">
              <view v-if="canShowRoleAction(member)" class="member-action role" @tap="handleAssignRole(member)">
                <text class="member-action-text">角色</text>
              </view>
              <view v-if="isOwner && member.role !== ROLE.OWNER" class="member-action danger" @tap="handleRemoveMember(member)">
                <text class="member-action-text">移除</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="action-section">
        <view class="action-btn" @tap="handleQueryScopeChange">
          <text class="action-text">查看范围</text>
          <view class="action-right">
            <text class="action-value">{{ queryScopeText }}</text>
            <uni-icons v-if="!isChildRole" type="right" size="16" color="#c0c4cc"></uni-icons>
          </view>
        </view>
        <view class="setting-tip">
          <text v-if="isChildRole">儿童固定为仅自己</text>
          <text v-else>共享功能会按此范围展示</text>
        </view>
      </view>

      <view class="action-section">
        <view class="action-btn setting">
          <text class="action-text">新建自动共享</text>
          <switch
            :checked="defaultShared"
            :disabled="isChildRole || isUpdatingDefaultShared"
            color="#4cd964"
            @change="handleDefaultSharedChange"
          />
        </view>
        <view class="setting-tip">
          <text v-if="isChildRole">儿童固定为开启</text>
          <text v-else>新建内容时会自动共享给家庭</text>
        </view>
      </view>

      <view v-if="canInvite" class="action-section">
        <view class="action-btn" @tap="goInvite">
          <text class="action-icon">📨</text>
          <text class="action-text">邀请成员</text>
          <uni-icons type="right" size="16" color="#c0c4cc"></uni-icons>
        </view>
        <view v-if="isOwner" class="action-btn" @tap="goManage">
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
import {
  getMyGroup,
  getMemberList,
  quitGroup,
  removeMember,
  assignMemberRole,
  updateMyDefaultShared,
  updateMyQueryScope
} from '@/api/family.js'
import { useFamilyStore } from '@/stores/family.js'
import { useFamilySharedScopeStore } from '@/stores/family-shared-scope.js'

const ROLE = {
  OWNER: 1,
  PARENT: 2,
  MEMBER: 3,
  CHILD: 4
}

const familyStore = useFamilyStore()
const sharedScopeStore = useFamilySharedScopeStore()
const groupInfo = ref(null)
const memberList = ref([])
const defaultShared = ref(false)
const queryOnlyMyself = ref(0)
const isUpdatingDefaultShared = ref(false)

const currentUserId = computed(() => uni.getStorageSync('userInfo')?.id)
const currentMemberRole = computed(() => {
  if (groupInfo.value?.currentUserRole != null) {
    return Number(groupInfo.value.currentUserRole)
  }
  const currentMember = memberList.value.find(member => member.userId === currentUserId.value)
  return currentMember?.role || null
})
const isOwner = computed(() => {
  return groupInfo.value?.ownerUserId === currentUserId.value
})
const canInvite = computed(() => isOwner.value || currentMemberRole.value === ROLE.PARENT)
const isChildRole = computed(() => currentMemberRole.value === ROLE.CHILD)
const queryScopeText = computed(() => queryOnlyMyself.value === 1 ? '仅自己' : '家庭共享')

onMounted(() => {
  fetchData()
})

async function fetchData() {
  try {
    // 先获取家庭组信息
    const groupRes = await getMyGroup()
    groupInfo.value = groupRes.data
    if (groupInfo.value) {
      familyStore.updateGroup(groupInfo.value)
      defaultShared.value = isChildRole.value ? true : Number(groupInfo.value.defaultShared) === 1
      queryOnlyMyself.value = isChildRole.value ? 1 : Number(groupInfo.value.queryOnlyMyself) === 1 ? 1 : 0
    }

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
  const roleMap = {
    [ROLE.OWNER]: '群主',
    [ROLE.MEMBER]: '成员',
    [ROLE.PARENT]: '家长',
    [ROLE.CHILD]: '儿童'
  }
  return roleMap[role] || '未知角色'
}

function goInvite() {
  uni.navigateTo({ url: '/pagesBase/family/invite' })
}

function goManage() {
  uni.navigateTo({ url: '/pagesBase/family/manage' })
}

function canShowRoleAction(member) {
  if (member.userId === currentUserId.value) return false
  if (member.role === ROLE.OWNER) return false
  if (currentMemberRole.value === ROLE.OWNER) return true
  if (currentMemberRole.value === ROLE.PARENT) {
    return member.role === ROLE.MEMBER || member.role === ROLE.CHILD
  }
  return false
}

function getRoleOptions(member) {
  if (currentMemberRole.value === ROLE.OWNER) {
    return [
      { label: '设为家长', role: ROLE.PARENT },
      { label: '设为成员', role: ROLE.MEMBER },
      { label: '设为儿童', role: ROLE.CHILD }
    ].filter(option => option.role !== member.role)
  }
  if (currentMemberRole.value === ROLE.PARENT) {
    return [
      { label: '设为成员', role: ROLE.MEMBER },
      { label: '设为儿童', role: ROLE.CHILD }
    ].filter(option => option.role !== member.role)
  }
  return []
}

function handleAssignRole(member) {
  const roleOptions = getRoleOptions(member)
  if (roleOptions.length === 0) {
    uni.showToast({
      title: '当前角色无需调整',
      icon: 'none'
    })
    return
  }

  uni.showActionSheet({
    itemList: roleOptions.map(option => option.label),
    success: async (res) => {
      const selectedOption = roleOptions[res.tapIndex]
      if (!selectedOption) return
      try {
        await assignMemberRole({
          groupId: groupInfo.value.id,
          userId: member.userId,
          role: selectedOption.role
        })
        uni.showToast({
          title: '角色调整成功',
          icon: 'success'
        })
        fetchData()
      } catch (e) {
        // 失败后的业务处理：不做任何操作，错误提示已在 request.js 中统一处理
      }
    }
  })
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

async function handleDefaultSharedChange(e) {
  if (!groupInfo.value?.id) {
    return
  }
  if (isChildRole.value) {
    defaultShared.value = true
    uni.showToast({
      title: '儿童角色不可修改',
      icon: 'none'
    })
    return
  }
  if (isUpdatingDefaultShared.value) {
    return
  }

  const previousValue = defaultShared.value
  const currentValue = !!e.detail.value
  defaultShared.value = currentValue
  isUpdatingDefaultShared.value = true
  try {
    await updateMyDefaultShared({
      groupId: groupInfo.value.id,
      defaultShared: currentValue ? 1 : 0
    })
    groupInfo.value = {
      ...groupInfo.value,
      defaultShared: currentValue ? 1 : 0
    }
    familyStore.updateGroup(groupInfo.value)
    sharedScopeStore.setDefaultShared(currentValue)
    uni.showToast({
      title: '设置成功',
      icon: 'success'
    })
  } catch (err) {
    defaultShared.value = previousValue
  } finally {
    isUpdatingDefaultShared.value = false
  }
}

function handleQueryScopeChange() {
  if (!groupInfo.value?.id) {
    return
  }
  if (isChildRole.value) {
    uni.showToast({
      title: '儿童固定为仅自己',
      icon: 'none'
    })
    return
  }

  uni.showActionSheet({
    itemList: ['家庭共享', '仅自己'],
    success: async (res) => {
      const nextValue = res.tapIndex === 1 ? 1 : 0
      if (nextValue === queryOnlyMyself.value) {
        return
      }
      const previousValue = queryOnlyMyself.value
      queryOnlyMyself.value = nextValue
      try {
        await updateMyQueryScope({
          groupId: groupInfo.value.id,
          queryOnlyMyself: nextValue
        })
        groupInfo.value = {
          ...groupInfo.value,
          queryOnlyMyself: nextValue
        }
        familyStore.updateGroup(groupInfo.value)
        sharedScopeStore.setScope(nextValue === 1 ? 'myself' : 'shared')
        uni.showToast({
          title: '设置成功',
          icon: 'success'
        })
      } catch (e) {
        queryOnlyMyself.value = previousValue
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

.member-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.member-action {
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  background: #f7f8fa;
}

.member-action.role .member-action-text {
  color: #667eea;
}

.member-action.danger .member-action-text {
  color: #f56c6c;
}

.member-action-text {
  font-size: 24rpx;
  font-weight: 500;
}

.action-section {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.action-section + .action-section {
  margin-top: 24rpx;
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

.action-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.action-value {
  font-size: 26rpx;
  color: #999;
}

.action-btn.danger {
  justify-content: center;
}

.action-btn.danger .action-text {
  color: #f56c6c;
  font-weight: 600;
}

.action-btn.setting {
  justify-content: space-between;
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

.setting-tip {
  padding: 0 32rpx 24rpx 32rpx;
}

.setting-tip text {
  font-size: 24rpx;
  color: #999;
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
