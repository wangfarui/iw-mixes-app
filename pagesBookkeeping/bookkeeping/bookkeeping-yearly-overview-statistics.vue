<!-- 年度统计 - 总览 -->
<template>
    <view class="overview-statistics">
        <!-- 总体统计卡片 -->
        <view class="statistics-cards">
            <view class="card consume-card">
                <view class="card-label">年度支出</view>
                <view class="card-amount">¥{{ yearStatistics.totalConsume }}</view>
                <view class="card-detail">{{ yearStatistics.consumeCount }} 笔</view>
            </view>
            <view class="card income-card">
                <view class="card-label">年度收入</view>
                <view class="card-amount">¥{{ yearStatistics.totalIncome }}</view>
                <view class="card-detail">{{ yearStatistics.incomeCount }} 笔</view>
            </view>
        </view>

        <!-- 净收入统计 -->
        <view class="net-income-container">
            <view class="net-income-label">年度净收入</view>
            <view :class="['net-income-amount', yearStatistics.netIncome >= 0 ? 'positive' : 'negative']">
                {{ yearStatistics.netIncome >= 0 ? '+' : '-' }}¥{{ Math.abs(yearStatistics.netIncome) }}
            </view>
        </view>

        <!-- 月度趋势图 (支出、收入、净收入) -->
        <view class="chart-container">
            <view class="chart-title">年度趋势分析</view>
            <l-echart ref="trendChartRef" style="width:100%;height:600rpx"></l-echart>
        </view>

        <!-- 记账习惯统计 -->
        <view class="habits-container">
            <view class="habits-title">📊 记账习惯分析</view>

            <!-- 主要指标 -->
            <view class="habits-main-metrics">
                <view class="metric-item">
                    <view class="metric-icon">📅</view>
                    <view class="metric-content">
                        <view class="metric-label">记账天数</view>
                        <view class="metric-value">{{ recordingHabits.recordingDays }}</view>
                        <view class="metric-unit">天</view>
                    </view>
                </view>
                <view class="metric-item">
                    <view class="metric-icon">🔥</view>
                    <view class="metric-content">
                        <view class="metric-label">连续记账最长</view>
                        <view class="metric-value">{{ recordingHabits.maxContinuousDays }}</view>
                        <view class="metric-unit">天</view>
                    </view>
                </view>
                <view class="metric-item">
                    <view class="metric-icon">📝</view>
                    <view class="metric-content">
                        <view class="metric-label">记账次数最多</view>
                        <view class="metric-value">{{ recordingHabits.peakMonth }}</view>
                        <view class="metric-unit">{{ recordingHabits.peakCount }}次</view>
                    </view>
                </view>
            </view>

            <!-- 详细信息 -->
            <view class="habits-details">
                <view class="details-item">
                    <view class="details-label">全年记账次数</view>
                    <view class="details-value">{{ recordingHabits.recordingCount }}</view>
                </view>
                <view class="details-item">
                    <view class="details-label">平均每天记账次数</view>
                    <view class="details-value">{{ recordingHabits.avgPerDay }}次</view>
                </view>
                <view class="details-item">
                    <view class="details-label">遗漏次数</view>
                    <view class="details-value">{{ recordingHabits.missingCount }}次</view>
                </view>
                <view class="details-item">
                    <view class="details-label">遗漏率</view>
                    <view class="details-value">{{ recordingHabits.missingRate }}%</view>
                </view>
            </view>

            <!-- 评价 -->
            <view class="habits-evaluation">
                <view class="eval-icon">⭐</view>
                <view class="eval-text">{{ recordingHabits.evaluation }}</view>
            </view>
        </view>

        <!-- 忽略不计入统计的账单开关 -->
        <view class="settings-container">
            <view class="switch-item">
                <text>忽略不计入统计的账单</text>
                <switch :checked="ignoreNotStatistics" @change="switchIgnoreStatistics" style="transform:scale(0.6)" />
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { onReady } from '@dcloudio/uni-app'
import http from '@/api/request.js'

const props = defineProps({
    selectedYear: {
        type: String,
        default: new Date().getFullYear() + '年'
    },
    queryOnlyMyself: {
        type: Number,
        default: null
    },
    echarts: {
          type: Object,
          required: true
    }
})

const ignoreNotStatistics = ref(false)
const trendChartRef = ref(null)

// 年度统计数据
const yearStatistics = ref({
    totalConsume: 0,
    consumeCount: 0,
    totalIncome: 0,
    incomeCount: 0,
    netIncome: 0
})

// 趋势数据 (12个月)
const consumeTrendData = ref(Array(12).fill(0))
const incomeTrendData = ref(Array(12).fill(0))
const netIncomeTrendData = ref(Array(12).fill(0))

// 记账习惯数据
const recordingHabits = ref({
    recordingDays: 0,
    maxContinuousDays: 0,
    maxContinuousStartDate: '',
    maxContinuousEndDate: '',
    peakMonth: '',
    peakCount: 0,
    missingCount: 0,
    missingRate: 0,
    recordingCount: 0,
    avgPerDay: 0,
    evaluation: ''
})

// 颜色数组
const chartColors = ['#5470c6', '#91419f', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']

// 忽略不计入统计的账单
const switchIgnoreStatistics = (e) => {
    ignoreNotStatistics.value = e.detail.value
    // 重新获取数据
    fetchYearStatistics()
}

// 初始化图表
onReady(() => {
    if (trendChartRef.value) {
        trendChartRef.value.init(props.echarts, (chart) => {
            // init 完成后立即获取数据
            fetchYearStatistics()
        })
    } else {
        fetchYearStatistics()
    }
})

// 监听年份变化
watch(() => props.selectedYear, () => {
    fetchYearStatistics()
})

watch(() => props.queryOnlyMyself, () => {
    fetchYearStatistics()
})

// 获取年度统计数据
const fetchYearStatistics = async () => {
    try {
        const year = props.selectedYear.replace('年', '')
        const params = {
            year: parseInt(year),
            ignoreNotStatistics: ignoreNotStatistics.value ? 0 : 1,
            queryOnlyMyself: props.queryOnlyMyself
        }

        const response = await http.post('/bookkeeping-service/bookkeeping/records/yearStatistics/overview', params)

        // 赋值年度统计数据
        yearStatistics.value = response.data.yearStatistics

        // 赋值月度趋势数据
        consumeTrendData.value = response.data.monthlyData.consumeTrendData
        incomeTrendData.value = response.data.monthlyData.incomeTrendData
        netIncomeTrendData.value = response.data.monthlyData.netIncomeTrendData

        // 赋值记账习惯数据
        recordingHabits.value = response.data.recordingHabits

        // 延迟渲染图表
        setTimeout(() => {
            renderTrendChart()
        }, 300)
    } catch (error) {
        console.error('获取年度统计数据失败:', error)
        yearStatistics.value = {
            totalConsume: 0,
            consumeCount: 0,
            totalIncome: 0,
            incomeCount: 0,
            netIncome: 0
        }
        consumeTrendData.value = Array(12).fill(0)
        incomeTrendData.value = Array(12).fill(0)
        netIncomeTrendData.value = Array(12).fill(0)
        recordingHabits.value = {
            recordingDays: 0,
            maxContinuousDays: 0,
            maxContinuousStartDate: '',
            maxContinuousEndDate: '',
            peakMonth: '',
            peakCount: 0,
            missingCount: 0,
            missingRate: 0,
            recordingCount: 0,
            avgPerDay: 0,
            evaluation: ''
        }
        setTimeout(() => {
            renderTrendChart()
        }, 300)
    }
}

// 渲染年度趋势图 (支出、收入、净收入)
const renderTrendChart = () => {
    if (!trendChartRef.value) {
        console.warn('趋势图实例未初始化')
        return
    }

    try {
        const option = {
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    if (!params || params.length === 0) return ''
                    const month = params[0].name
                    let result = `${month}月\n`
                    params.forEach((param, index) => {
                        result += `${param.seriesName}: ¥${param.value.toLocaleString()}`
                        if (index < params.length - 1) {
                            result += '\n'
                        }
                    })
                    return result
                }
            },
            legend: {
                data: ['每月支出', '每月收入', '每月净收入'],
                top: '0'
            },
            grid: {
                left: '0%',
                right: '0%',
                bottom: 20,
                top: 40,
                containLabel: false
            },
            xAxis: {
                type: 'category',
                data: Array.from({length: 12}, (_, i) => `${i + 1}`),
                axisLabel: {
                    fontSize: 12
                },
                axisTick: { show: false },
                axisLine: { show: false }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    fontSize: 12
                }
            },
            series: [
                {
                    name: '每月支出',
                    data: consumeTrendData.value,
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                        color: '#ee6666'
                    },
                    lineStyle: {
                        color: '#ee6666',
                        width: 2
                    }
                },
                {
                    name: '每月收入',
                    data: incomeTrendData.value,
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                        color: '#51cf66'
                    },
                    lineStyle: {
                        color: '#51cf66',
                        width: 2
                    }
                },
                {
                    name: '每月净收入',
                    data: netIncomeTrendData.value,
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                        color: '#5470c6'
                    },
                    lineStyle: {
                        color: '#5470c6',
                        width: 2
                    }
                }
            ]
        }

        trendChartRef.value.setOption(option, true)
    } catch (e) {
        console.error('趋势图渲染失败:', e)
    }
}
</script>

<style lang="scss" scoped>
.overview-statistics {
    padding-bottom: 30rpx;
    background-color: #f5f5f5;
}

.statistics-cards {
    display: flex;
    gap: 20rpx;
    padding: 20rpx;
    background-color: white;
    margin: 20rpx;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.card {
    flex: 1;
    padding: 20rpx;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 180rpx;

    &.consume-card {
        background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
        color: white;
    }

    &.income-card {
        background: linear-gradient(135deg, #51cf66 0%, #69db7c 100%);
        color: white;
    }
}

.card-label {
    font-size: 24rpx;
    opacity: 0.8;
    margin-bottom: 10rpx;
}

.card-amount {
    font-size: 48rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
}

.card-detail {
    font-size: 20rpx;
    opacity: 0.7;
}

.net-income-container {
    padding: 30rpx 20rpx;
    background-color: white;
    margin: 0 20rpx 20rpx;
    border-radius: 12rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.net-income-label {
    font-size: 28rpx;
    color: #333;
}

.net-income-amount {
    font-size: 42rpx;
    font-weight: bold;

    &.positive {
        color: #51cf66;
    }

    &.negative {
        color: #ff6b6b;
    }
}

.chart-container {
    background-color: white;
    margin: 20rpx;
    padding: 20rpx;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.chart-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
}

.habits-container {
    background-color: white;
    margin: 20rpx;
    padding: 20rpx;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.habits-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    padding-bottom: 15rpx;
    border-bottom: 2rpx solid #f0f0f0;
}

.habits-main-metrics {
    display: flex;
    gap: 15rpx;
    margin-bottom: 25rpx;
    padding: 15rpx 0;
}

.metric-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
    padding: 15rpx;
    background: linear-gradient(135deg, #f0f4ff 0%, #f5f0ff 100%);
    border-radius: 10rpx;
}

.metric-icon {
    font-size: 40rpx;
    line-height: 40rpx;
}

.metric-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5rpx;
}

.metric-label {
    font-size: 22rpx;
    color: #666;
    text-align: center;
}

.metric-value {
    font-size: 36rpx;
    font-weight: bold;
    color: #5470c6;
}

.metric-unit {
    font-size: 18rpx;
    color: #999;
}

.habits-details {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    padding: 15rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
}

.details-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 15rpx;
    background-color: #f9f9f9;
    border-radius: 8rpx;
}

.details-label {
    font-size: 24rpx;
    color: #666;
    font-weight: 500;
}

.details-value {
    font-size: 24rpx;
    color: #333;
    font-weight: bold;
}

.habits-evaluation {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
    padding: 20rpx 15rpx;
    margin-top: 15rpx;
    background: linear-gradient(135deg, #fffaf0 0%, #fff5f0 100%);
    border-left: 4rpx solid #ff9c6e;
    border-radius: 8rpx;
}

.eval-icon {
    font-size: 36rpx;
    line-height: 36rpx;
}

.eval-text {
    font-size: 24rpx;
    color: #333;
    text-align: center;
    line-height: 1.5;
}

.settings-container {
    background-color: white;
    margin: 20rpx;
    padding: 20rpx;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.switch-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 28rpx;
    color: #333;
}
</style>
