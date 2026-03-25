<template>
  <view v-if="scopeStore.hasGroup" class="query-scope">
    <text class="scope-label">查询口径</text>
    <view class="scope-actions">
      <view
        class="scope-action"
        :class="{ active: scopeStore.effectiveScope === 'shared' }"
        @tap="scopeStore.setScope('shared')"
      >
        家庭共享
      </view>
      <view
        class="scope-action"
        :class="{ active: scopeStore.effectiveScope === 'myself' }"
        @tap="scopeStore.setScope('myself')"
      >
        仅自己
      </view>
    </view>
  </view>
</template>

<script setup>
import { useBookkeepingQueryScopeStore } from '@/stores/bookkeeping-query-scope.js'

const scopeStore = useBookkeepingQueryScopeStore()
</script>

<style scoped>
.query-scope {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 18rpx 22rpx;
  background-color: #fff;
  border-radius: 16rpx;
}

.scope-label {
  color: #666;
  font-size: 24rpx;
}

.scope-actions {
  display: flex;
  gap: 12rpx;
}

.scope-action {
  min-width: 132rpx;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background-color: #f4f5f7;
  color: #666;
  font-size: 24rpx;
  text-align: center;
}

.scope-action.active {
  background-color: #007aff;
  color: #fff;
}
</style>
