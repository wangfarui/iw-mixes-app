<!-- 年度统计 - 主入口 -->
<template>
    <view class="year-statistics">
        <!-- 顶部区域 - 年份选择和统计维度 -->
        <view class="header">
            <!-- 年份选择 -->
            <view class="time-picker">
                <picker
                    mode="date"
                    fields="year"
                    :value="formatDateForPicker(selectedYear)"
                    @change="onYearChange"
                >
                    <view class="picker-content">
                        <text>{{ selectedYear }}</text>
                        <text class="uni-icon-arrowdown"></text>
                    </view>
                </picker>
            </view>

            <!-- 统计维度切换 -->
            <view class="tab-bar">
                <view
                    class="tab-item"
                    :class="{ active: statisticsType === 'all' }"
                    @tap="switchStatisticsType('all')"
                >总览</view>
                <view
                    class="tab-item"
                    :class="{ active: statisticsType === 'consume' }"
                    @tap="switchStatisticsType('consume')"
                >支出</view>
                <view
                    class="tab-item"
                    :class="{ active: statisticsType === 'income' }"
                    @tap="switchStatisticsType('income')"
                >收入</view>
            </view>
        </view>

        <!-- 根据统计维度加载相应的子组件 -->
        <view v-if="statisticsType === 'all'" class="tab-content">
            <bookkeeping-yearly-overview-statistics
                :selectedYear="selectedYear"
                :echarts="echarts"
                :queryOnlyMyself="scopeStore.queryOnlyMyself"
            />
        </view>
        <view v-if="statisticsType === 'consume'" class="tab-content">
            <bookkeeping-yearly-consume-statistics
                :selectedYear="selectedYear"
                :echarts="echarts"
                :queryOnlyMyself="scopeStore.queryOnlyMyself"
            />
        </view>
        <view v-if="statisticsType === 'income'" class="tab-content">
            <bookkeeping-yearly-income-statistics
                :selectedYear="selectedYear"
                :echarts="echarts"
                :queryOnlyMyself="scopeStore.queryOnlyMyself"
            />
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import BookkeepingYearlyOverviewStatistics from './bookkeeping-yearly-overview-statistics.vue'
import BookkeepingYearlyConsumeStatistics from './bookkeeping-yearly-consume-statistics.vue'
import BookkeepingYearlyIncomeStatistics from './bookkeeping-yearly-income-statistics.vue'
import { useBookkeepingQueryScopeStore } from '@/stores/bookkeeping-query-scope.js'

const echarts = require('../../uni_modules/lime-echart/static/echarts.min')

const selectedYear = ref(new Date().getFullYear() + '年')
const statisticsType = ref('all')
const scopeStore = useBookkeepingQueryScopeStore()

// 格式化日期
const formatDateForPicker = (dateStr) => {
    const year = dateStr.replace('年', '')
    return year
}

// 切换统计维度
const switchStatisticsType = (type) => {
    statisticsType.value = type
}

// 年份选择变化
const onYearChange = (e) => {
    const year = e.detail.value.split('-')[0]
    selectedYear.value = year + '年'
}
</script>

<style lang="scss" scoped>
.year-statistics {
    min-height: 100vh;
    background-color: #f5f5f5;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    background-color: white;
    gap: 20rpx;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 10;
}

.time-picker {
    flex: 1;
}

.picker-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12rpx 16rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    font-size: 28rpx;
    min-height: 70rpx;
}

.tab-bar {
    display: flex;
    gap: 10rpx;
}

.tab-item {
    padding: 10rpx 20rpx;
    border-radius: 20rpx;
    font-size: 26rpx;
    color: #666;
    background-color: #f5f5f5;
    transition: all 0.3s;

    &.active {
        background-color: #5470c6;
        color: white;
    }
}

.tab-content {
    animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>
