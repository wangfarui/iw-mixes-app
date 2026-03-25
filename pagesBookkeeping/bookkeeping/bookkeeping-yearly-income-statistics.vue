<!-- 年度统计 - 收入 -->
<template>
    <view class="income-statistics">
        <!-- 1. 年度收入总额 -->
        <view class="statistics-card">
            <view class="card-label">年度收入总额</view>
            <view class="card-amount">¥{{ yearStatistics.totalIncome }}</view>
            <view class="card-detail">共 {{ yearStatistics.incomeCount }} 笔</view>
        </view>

        <!-- 2. 每月收入占比（柱状图） -->
        <view class="chart-container">
            <view class="chart-title">每月收入趋势</view>
            <l-echart ref="monthChartRef" style="width:100%;height:400rpx"></l-echart>
        </view>

        <!-- 3. 收入分类占比 -->
        <view class="chart-container">
            <view class="chart-title">收入分类占比</view>
            <l-echart ref="incomePieChartRef" style="width:100%;height:400rpx"></l-echart>

            <!-- 分类列表 -->
            <view class="category-list">
                <view
                    class="category-item"
                    v-for="(item, idx) in getDisplayIncomeCategory()"
                    :key="item.name"
                >
                    <view class="category-header">
                        <view class="category-name-info">
                            <text class="category-name">{{ item.name }}</text>
                            <text class="category-ratio">({{ item.ratio }}%)</text>
                        </view>
                        <view class="category-amount-info">
                            <text class="category-amount">¥{{ item.amount }}</text>
                        </view>
                    </view>
                    <view class="progress-bar-bg">
                        <view
                            class="progress-bar"
                            :style="{ width: item.ratio + '%', backgroundColor: item.color }"
                        ></view>
                    </view>
                </view>
                <view
                    v-if="incomeCategories.length > 5"
                    class="expand-btn"
                    @tap="showAllIncomeCategory = !showAllIncomeCategory"
                >
                    <text>{{ showAllIncomeCategory ? '收起' : '展开全部' }}</text>
                    <text :class="['arrow', showAllIncomeCategory ? 'up' : 'down']"></text>
                </view>
            </view>
        </view>

        <!-- 4. 收入Top10 -->
        <view class="chart-container">
            <view class="chart-title">收入Top10</view>
            <view class="top-list">
                <view
                    class="top-item"
                    v-for="(item, index) in topIncomeList"
                    :key="index"
                >
                    <view class="top-rank">{{ index + 1 }}</view>
                    <view class="top-content">
                        <view class="top-title">
                            <text class="top-category">{{ item.category }}</text>
                            <text class="top-date">{{ item.date }}</text>
                        </view>
                        <view class="top-desc">{{ item.description }}</view>
                        <view v-if="props.queryOnlyMyself !== 1 && item.userName" class="top-user">记账人：{{ item.userName }}</view>
                    </view>
                    <view class="top-amount">¥{{ item.amount }}</view>
                </view>
            </view>
        </view>

        <!-- 5. 收入洞察 -->
        <view class="insights-container">
            <view class="insights-title">💡 收入洞察</view>

            <view class="insights-grid">
                <view class="insight-item">
                    <view class="insight-label">收入最高的一天</view>
                    <view class="insight-value">¥{{ insights.maxDayAmount }}</view>
                    <view class="insight-detail">{{ insights.maxDayDate }}</view>
                </view>

                <view class="insight-item">
                    <view class="insight-label">收入最高的月份</view>
                    <view class="insight-value">¥{{ insights.maxMonthAmount }}</view>
                    <view class="insight-detail">{{ insights.maxMonthName }}</view>
                </view>

                <view class="insight-item highlight">
                    <view class="insight-label">大额收入占比</view>
                    <view class="insight-value">{{ insights.largeIncomeRatio }}%</view>
                    <view class="insight-detail">&gt;¥10000的金额占比</view>
                </view>

                <view class="insight-item highlight">
                    <view class="insight-label">月均收入</view>
                    <view class="insight-value">¥{{ insights.avgMonthAmount }}</view>
                    <view class="insight-detail">12月平均</view>
                </view>
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

const monthChartRef = ref(null)
const incomePieChartRef = ref(null)
const showAllIncomeCategory = ref(false)
const ignoreNotStatistics = ref(false)

// 年度统计数据
const yearStatistics = ref({
    totalIncome: 0,
    incomeCount: 0
})

// 分类数据
const incomeCategories = ref([])
const topIncomeList = ref([])

// 收入洞察数据
const insights = ref({
    maxDayAmount: 0,
    maxDayDate: '',
    maxMonthAmount: 0,
    maxMonthName: '',
    largeIncomeRatio: 0,
    avgMonthAmount: 0
})

// 每月数据
const monthlyData = ref(Array(12).fill(0))

// 颜色数组
const chartColors = ['#5470c6', '#91419f', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']

// 获取显示的收入分类 (最多显示5个)
const getDisplayIncomeCategory = () => {
    if (showAllIncomeCategory.value) {
        return incomeCategories.value
    }
    return incomeCategories.value.slice(0, 5)
}

// 忽略不计入统计的账单
const switchIgnoreStatistics = (e) => {
    ignoreNotStatistics.value = e.detail.value
    // 重新获取数据
    fetchIncomeData()
}

// 初始化图表
onReady(() => {
    if (monthChartRef.value) {
        monthChartRef.value.init(props.echarts, () => {
            fetchIncomeData()
        })
    }
    if (incomePieChartRef.value) {
        incomePieChartRef.value.init(props.echarts)
    }
})

// 监听年份变化
watch(() => props.selectedYear, () => {
    fetchIncomeData()
})

watch(() => props.queryOnlyMyself, () => {
    fetchIncomeData()
})

// 获取收入统计数据
const fetchIncomeData = async () => {
    try {
        const year = props.selectedYear.replace('年', '')
        const params = {
            year: parseInt(year),
            ignoreNotStatistics: ignoreNotStatistics.value ? 0 : 1,
            queryOnlyMyself: props.queryOnlyMyself
        }

        const response = await http.post('/bookkeeping-service/bookkeeping/records/yearStatistics/income', params)

        // 赋值年度统计数据，确保数字字段被正确转换
        yearStatistics.value = {
            totalIncome: parseFloat(response.data.yearStatistics.totalIncome) || 0,
            incomeCount: parseInt(response.data.yearStatistics.incomeCount) || 0
        }

        // 赋值月度趋势数据
        monthlyData.value = response.data.monthlyData

        // 赋值收入分类数据，添加颜色
        incomeCategories.value = response.data.incomeCategories.map((item, index) => ({
            ...item,
            amount: parseFloat(item.amount) || 0,
            ratio: parseInt(item.ratio) || 0,
            color: chartColors[index % chartColors.length]
        }))

        // 赋值收入Top10数据
        topIncomeList.value = response.data.topIncomeList.map(item => ({
            ...item,
            amount: parseFloat(item.amount) || 0
        }))

        // 赋值收入洞察数据
        insights.value = {
            maxDayAmount: parseFloat(response.data.insights.maxDayAmount) || 0,
            maxDayDate: response.data.insights.maxDayDate || '',
            maxMonthAmount: parseFloat(response.data.insights.maxMonthAmount) || 0,
            maxMonthName: response.data.insights.maxMonthName || '',
            largeIncomeRatio: parseInt(response.data.insights.largeIncomeRatio) || 0,
            avgMonthAmount: parseFloat(response.data.insights.avgMonthAmount) || 0
        }

        // 延迟渲染图表
        setTimeout(() => {
            renderMonthChart()
            renderIncomePieChart()
        }, 300)
    } catch (error) {
        console.error('获取收入数据失败:', error)
        yearStatistics.value = {
            totalIncome: 0,
            incomeCount: 0
        }
        monthlyData.value = Array(12).fill(0)
        incomeCategories.value = []
        topIncomeList.value = []
        insights.value = {
            maxDayAmount: 0,
            maxDayDate: '',
            maxMonthAmount: 0,
            maxMonthName: '',
            largeIncomeRatio: 0,
            avgMonthAmount: 0
        }
        setTimeout(() => {
            renderMonthChart()
            renderIncomePieChart()
        }, 300)
    }
}

// 渲染每月收入柱状图
const renderMonthChart = () => {
    if (!monthChartRef.value) return

    const echarts2 = props.echarts

    try {
        // 找出最大值和最小值
        const maxValue = Math.max(...monthlyData.value)
        const minValue = Math.min(...monthlyData.value)
        const maxIndex = monthlyData.value.indexOf(maxValue)
        const minIndex = monthlyData.value.indexOf(minValue)

        const option = {
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    if (!params || params.length === 0) return ''
                    const month = params[0].name
                    const value = params[0].value
                    return `${month}月：¥${value.toLocaleString()}`
                }
            },
            grid: {
                left: '0%',
                right: '0%',
                bottom: 20,
                top: 10,
                containLabel: false
            },
            xAxis: {
                type: 'category',
                data: Array.from({length: 12}, (_, i) => `${i + 1}`),
                axisLabel: {
                    fontSize: 12
                }
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: monthlyData.value,
                type: 'bar',
                itemStyle: {
                    color: new echarts2.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#51cf66' },
                        { offset: 1, color: '#69db7c' }
                    ])
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: function(params) {
                        if (params.dataIndex === maxIndex) {
                            return `最高\n¥${params.value}`
                        } else if (params.dataIndex === minIndex) {
                            return `最低\n¥${params.value}`
                        }
                        return ''
                    },
                    fontSize: 11,
                    color: '#333',
                    lineHeight: 15
                }
            }]
        }

        monthChartRef.value.setOption(option, true)
    } catch (e) {
        console.error('每月收入图渲染失败:', e)
    }
}

// 渲染收入分类饼图
const renderIncomePieChart = () => {
    if (!incomePieChartRef.value) return

    try {
        const pieData = incomeCategories.value.map((item, index) => ({
            value: item.amount,
            name: item.name,
            itemStyle: {
                color: chartColors[index % chartColors.length]
            }
        }))

        const option = {
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    if (!params) return ''
                    return `${params.name} ¥${params.value}\n占比 ${params.percent}%`
                }
            },
            series: [{
                name: '收入分类',
                type: 'pie',
                radius: ['30%', '60%'],
                data: pieData,
                label: {
                    show: true,
                    formatter: '{b} {d}%',
                    fontSize: 12,
                    color: '#333'
                },
                labelLine: {
                    show: true,
                    length: 10,
                    length2: 5
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    },
                    label: {
                        show: true
                    }
                }
            }]
        }

        incomePieChartRef.value.setOption(option, true)
    } catch (e) {
        console.error('收入分类饼图渲染失败:', e)
    }
}
</script>

<style lang="scss" scoped>
.income-statistics {
    padding-bottom: 30rpx;
    background-color: #f5f5f5;
}

.statistics-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30rpx 20rpx;
    margin: 20rpx;
    background: linear-gradient(135deg, #51cf66 0%, #69db7c 100%);
    border-radius: 12rpx;
    color: white;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
    min-height: 180rpx;
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

.category-list {
    margin-top: 30rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #eee;
}

.category-item {
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
        border-bottom: none;
    }
}

.category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
}

.category-name-info {
    display: flex;
    align-items: center;
    gap: 10rpx;
    flex: 1;
}

.category-name {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
}

.category-ratio {
    font-size: 22rpx;
    color: #999;
}

.category-amount-info {
    display: flex;
    align-items: center;
    gap: 10rpx;
}

.category-amount {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
}

.progress-bar-bg {
    width: 100%;
    height: 8rpx;
    background-color: #e8e8e8;
    border-radius: 4rpx;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    border-radius: 4rpx;
    transition: width 0.3s ease;
}

.top-list {
    margin-top: 20rpx;
}

.top-item {
    display: flex;
    gap: 15rpx;
    padding: 15rpx;
    background-color: #f9f9f9;
    border-radius: 8rpx;
    margin-bottom: 12rpx;
    align-items: center;
}

.top-rank {
    min-width: 40rpx;
    width: 40rpx;
    height: 40rpx;
    background: linear-gradient(135deg, #51cf66 0%, #69db7c 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 24rpx;
}

.top-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5rpx;
}

.top-title {
    display: flex;
    gap: 10rpx;
    align-items: center;
}

.top-category {
    font-size: 26rpx;
    font-weight: 500;
    color: #333;
}

.top-date {
    font-size: 20rpx;
    color: #999;
}

.top-desc {
    font-size: 22rpx;
    color: #666;
}

.top-user {
    font-size: 20rpx;
    color: #007aff;
}

.top-amount {
    font-size: 28rpx;
    font-weight: bold;
    color: #51cf66;
    min-width: 100rpx;
    text-align: right;
}

.insights-container {
    background-color: white;
    margin: 20rpx;
    padding: 20rpx;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.insights-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    padding-bottom: 15rpx;
    border-bottom: 2rpx solid #f0f0f0;
}

.insights-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15rpx;
}

.insight-item {
    padding: 15rpx;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-radius: 10rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;

    &.highlight {
        background: linear-gradient(135deg, #fff5f0 0%, #fffaf0 100%);
        border: 1rpx solid #ffd7a8;
    }
}

.insight-label {
    font-size: 22rpx;
    color: #666;
    text-align: center;
}

.insight-value {
    font-size: 32rpx;
    font-weight: bold;
    color: #51cf66;
}

.insight-detail {
    font-size: 18rpx;
    color: #999;
    text-align: center;
}

.expand-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16rpx;
    gap: 8rpx;
    color: #5470c6;
    font-size: 24rpx;
    margin-top: 20rpx;

    .arrow {
        display: inline-block;
        width: 20rpx;
        height: 20rpx;
        border-right: 2rpx solid #5470c6;
        border-bottom: 2rpx solid #5470c6;

        &.down {
            transform: rotate(-45deg);
        }

        &.up {
            transform: rotate(135deg);
        }
    }
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
