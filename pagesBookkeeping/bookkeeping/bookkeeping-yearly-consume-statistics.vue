<!-- 年度统计 - 支出 -->
<template>
    <view class="consume-statistics">
        <!-- 1. 年度支出总额 -->
        <view class="statistics-card">
            <view class="card-label">年度支出</view>
            <view class="card-amount">¥{{ yearStatistics.totalConsume }}</view>
            <view class="card-detail">共 {{ yearStatistics.consumeCount }} 笔</view>
        </view>

        <!-- 2. 每月支出金额（柱状图） -->
        <view class="chart-container">
            <view class="chart-title">每月支出趋势</view>
            <l-echart ref="monthChartRef" style="width:100%;height:400rpx"></l-echart>
        </view>

        <!-- 3. 支出分类占比（饼图+列表） -->
        <view class="chart-container">
            <view class="chart-title">支出分类占比</view>
            <l-echart ref="categoryPieChartRef" style="width:100%;height:400rpx"></l-echart>

            <view class="category-list">
                <view
                    class="category-item"
                    v-for="(item, idx) in getDisplayCategory(consumeCategories)"
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
                    v-if="consumeCategories.length > 5"
                    class="expand-btn"
                    @tap="showAllCategory = !showAllCategory"
                >
                    <text>{{ showAllCategory ? '收起' : '展开全部' }}</text>
                    <text :class="['arrow', showAllCategory ? 'up' : 'down']"></text>
                </view>
            </view>
        </view>

        <!-- 4. 支出标签占比（饼图） -->
        <view class="chart-container">
            <view class="chart-title">支出标签占比</view>
            <l-echart ref="tagPieChartRef" style="width:100%;height:400rpx"></l-echart>

            <view class="tag-list">
                <view class="tag-item" v-for="item in consumeTags" :key="item.name">
                    <view class="tag-header">
                        <view class="tag-name">{{ item.name }}</view>
                        <view class="tag-info">
                            <text class="tag-ratio">{{ item.ratio }}%</text>
                            <text class="tag-count">{{ item.count }}次</text>
                        </view>
                    </view>
                    <view class="progress-bar-bg">
                        <view
                            class="progress-bar"
                            :style="{ width: item.ratio + '%', backgroundColor: item.color }"
                        ></view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 5. 支出Top10 -->
        <view class="chart-container">
            <view class="chart-title">支出Top10</view>
            <view class="top-list">
                <view class="top-item" v-for="(item, index) in topConsumeList" :key="index">
                    <view class="top-rank">{{ index + 1 }}</view>
                    <view class="top-content">
                        <view class="top-title">
                            <text class="top-category">{{ item.category }}</text>
                            <text class="top-date">{{ item.date }}</text>
                        </view>
                        <view class="top-desc">{{ item.description }}</view>
                    </view>
                    <view class="top-amount">¥{{ item.amount }}</view>
                </view>
            </view>
        </view>

        <!-- 6. 支出洞察 -->
        <view class="insights-container">
            <view class="insights-title">💡 支出洞察</view>

            <view class="insights-grid">
                <view class="insight-item">
                    <view class="insight-label">支出最高的一天</view>
                    <view class="insight-value">¥{{ insights.maxDayAmount }}</view>
                    <view class="insight-detail">{{ insights.maxDayDate }}</view>
                </view>

                <view class="insight-item">
                    <view class="insight-label">支出最高的月份</view>
                    <view class="insight-value">¥{{ insights.maxMonthAmount }}</view>
                    <view class="insight-detail">{{ insights.maxMonthName }}</view>
                </view>

                <view class="insight-item">
                    <view class="insight-label">最常用支出标签</view>
                    <view class="insight-value">{{ insights.topTag }}</view>
                    <view class="insight-detail">{{ insights.topTagCount }}次</view>
                </view>

                <view class="insight-item">
                    <view class="insight-label">最少用支出标签</view>
                    <view class="insight-value">{{ insights.bottomTag }}</view>
                    <view class="insight-detail">{{ insights.bottomTagCount }}次</view>
                </view>

                <view class="insight-item highlight">
                    <view class="insight-label">大额支出比例</view>
                    <view class="insight-value">{{ insights.largeExpenseRatio }}%</view>
                    <view class="insight-detail">&gt;¥100的笔数占比</view>
                </view>

                <view class="insight-item highlight">
                    <view class="insight-label">月均支出</view>
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
    echarts: {
        type: Object,
        required: true
    }
})

const monthChartRef = ref(null)
const categoryPieChartRef = ref(null)
const tagPieChartRef = ref(null)
const showAllCategory = ref(false)
const expandTopList = ref(false)
const ignoreNotStatistics = ref(true)


// 年度统计数据
const yearStatistics = ref({
    totalConsume: 0,
    consumeCount: 0
})

// 分类数据
const consumeCategories = ref([])
const consumeTags = ref([])
const topConsumeList = ref([])

// 支出洞察数据
const insights = ref({
    maxDayAmount: 0,
    maxDayDate: '',
    maxMonthAmount: 0,
    maxMonthName: '',
    topTag: '',
    topTagCount: 0,
    bottomTag: '',
    bottomTagCount: 0,
    largeExpenseRatio: 0,
    avgMonthAmount: 0
})

// 每月数据
const monthlyData = ref(Array(12).fill(0))

// 颜色数组
const chartColors = ['#5470c6', '#91419f', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']

// 获取显示的分类 (最多显示5个)
const getDisplayCategory = (categories) => {
    if (showAllCategory.value) {
        return categories
    }
    return categories.slice(0, 5)
}

// 忽略不计入统计的账单
const switchIgnoreStatistics = (e) => {
    ignoreNotStatistics.value = e.detail.value
    // 重新获取数据
    fetchConsumeData()
}

// 初始化图表
onReady(() => {
    if (monthChartRef.value) {
        monthChartRef.value.init(props.echarts, () => {
            fetchConsumeData()
        })
    }
    if (categoryPieChartRef.value) {
        categoryPieChartRef.value.init(props.echarts)
    }
    if (tagPieChartRef.value) {
        tagPieChartRef.value.init(props.echarts)
    }
})

// 监听年份变化
watch(() => props.selectedYear, () => {
    fetchConsumeData()
})

// 获取支出统计数据
const fetchConsumeData = async () => {
    try {
        const year = props.selectedYear.replace('年', '')
        const params = {
            year: parseInt(year),
            ignoreNotStatistics: ignoreNotStatistics.value ? 1 : 0
        }

        const response = await http.post('/bookkeeping-service/bookkeeping/records/yearStatistics/consume', params)

        // 赋值年度统计数据，确保数字字段被正确转换
        yearStatistics.value = {
            totalConsume: parseFloat(response.data.yearStatistics.totalConsume) || 0,
            consumeCount: parseInt(response.data.yearStatistics.consumeCount) || 0
        }

        // 赋值月度趋势数据
        monthlyData.value = response.data.monthlyData

        // 赋值支出分类数据，添加颜色
        consumeCategories.value = response.data.consumeCategories.map((item, index) => ({
            ...item,
            amount: parseFloat(item.amount) || 0,
            ratio: parseInt(item.ratio) || 0,
            color: chartColors[index % chartColors.length]
        }))

        // 赋值支出标签数据，添加颜色
        consumeTags.value = response.data.consumeTags.map((item, index) => ({
            ...item,
            count: parseInt(item.count) || 0,
            ratio: parseInt(item.ratio) || 0,
            color: chartColors[index % chartColors.length]
        }))

        // 赋值支出Top10数据
        topConsumeList.value = response.data.topConsumeList.map(item => ({
            ...item,
            amount: parseFloat(item.amount) || 0
        }))

        // 赋值支出洞察数据
        insights.value = {
            maxDayAmount: parseFloat(response.data.insights.maxDayAmount) || 0,
            maxDayDate: response.data.insights.maxDayDate || '',
            maxMonthAmount: parseFloat(response.data.insights.maxMonthAmount) || 0,
            maxMonthName: response.data.insights.maxMonthName || '',
            topTag: response.data.insights.topTag || '',
            topTagCount: parseInt(response.data.insights.topTagCount) || 0,
            bottomTag: response.data.insights.bottomTag || '',
            bottomTagCount: parseInt(response.data.insights.bottomTagCount) || 0,
            largeExpenseRatio: parseInt(response.data.insights.largeExpenseRatio) || 0,
            avgMonthAmount: parseFloat(response.data.insights.avgMonthAmount) || 0
        }

        // 延迟渲染图表
        setTimeout(() => {
            renderMonthChart()
            renderCategoryPieChart()
            renderTagPieChart()
        }, 300)
    } catch (error) {
        console.error('获取支出数据失败:', error)
        // 失败时使用模拟数据
        mockConsumeData()
    }
}

// 模拟数据生成
const mockConsumeData = () => {
    // 年度统计
    yearStatistics.value = {
        totalConsume: 15234.56,
        consumeCount: 287
    }

    // 每月支出数据
    monthlyData.value = [1200, 1400, 1100, 1300, 1500, 1600, 1400, 1200, 1800, 1900, 1700, 1300]

    // 支出分类
    consumeCategories.value = [
        { name: '食物', amount: 3500, ratio: 23, color: chartColors[0] },
        { name: '交通', amount: 2800, ratio: 18, color: chartColors[1] },
        { name: '娱乐', amount: 2500, ratio: 16, color: chartColors[2] },
        { name: '购物', amount: 3200, ratio: 21, color: chartColors[3] },
        { name: '居住', amount: 2000, ratio: 13, color: chartColors[4] },
        { name: '其他', amount: 234.56, ratio: 9, color: chartColors[5] }
    ].sort((a, b) => b.amount - a.amount)

    // 支出标签
    consumeTags.value = [
        { name: '必需', count: 156, ratio: 54, color: chartColors[0] },
        { name: '娱乐', count: 89, ratio: 31, color: chartColors[1] },
        { name: '投资', count: 42, ratio: 15, color: chartColors[2] }
    ]

    // 支出Top10
    topConsumeList.value = [
        { rank: 1, category: '购物', date: '2025-12-15', description: '衣服', amount: 580 },
        { rank: 2, category: '娱乐', date: '2025-11-20', description: '电影票', amount: 520 },
        { rank: 3, category: '食物', date: '2025-10-10', description: '大餐', amount: 450 },
        { rank: 4, category: '交通', date: '2025-09-05', description: '高铁', amount: 420 },
        { rank: 5, category: '购物', date: '2025-08-12', description: '手机壳', amount: 350 },
        { rank: 6, category: '食物', date: '2025-07-18', description: '超市购物', amount: 320 },
        { rank: 7, category: '居住', date: '2025-06-01', description: '房租', amount: 3000 },
        { rank: 8, category: '娱乐', date: '2025-05-22', description: '游戏充值', amount: 280 },
        { rank: 9, category: '交通', date: '2025-04-15', description: '打车', amount: 250 },
        { rank: 10, category: '购物', date: '2025-03-08', description: '书籍', amount: 220 }
    ]

    // 支出洞察
    insights.value = {
        maxDayAmount: 580,
        maxDayDate: '2025-12-15',
        maxMonthAmount: 1900,
        maxMonthName: '10月',
        topTag: '必需',
        topTagCount: 156,
        bottomTag: '投资',
        bottomTagCount: 42,
        largeExpenseRatio: 28,
        avgMonthAmount: 1269.5
    }

    // 延迟渲染图表
    setTimeout(() => {
        renderMonthChart()
        renderCategoryPieChart()
        renderTagPieChart()
    }, 300)
}

// 渲染每月支出柱状图
const renderMonthChart = () => {
    if (!monthChartRef.value) return

    const echarts2 = props.echarts;

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
                        { offset: 0, color: '#ff6b6b' },
                        { offset: 1, color: '#ff8787' }
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
        console.error('每月支出图渲染失败:', e)
    }
}

// 渲染支出分类饼图
const renderCategoryPieChart = () => {
    if (!categoryPieChartRef.value) return

    try {
        const pieData = consumeCategories.value.map((item, index) => ({
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
                name: '支出分类',
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

        categoryPieChartRef.value.setOption(option, true)
    } catch (e) {
        console.error('分类饼图渲染失败:', e)
    }
}

// 渲染支出标签饼图
const renderTagPieChart = () => {
    if (!tagPieChartRef.value) return

    try {
        const pieData = consumeTags.value.map((item, index) => ({
            value: item.count,
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
                    return `${params.name} ${params.value}次\n占比 ${params.percent}%`
                }
            },
            series: [{
                name: '支出标签',
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

        tagPieChartRef.value.setOption(option, true)
    } catch (e) {
        console.error('标签饼图渲染失败:', e)
    }
}
</script>

<style lang="scss" scoped>
.consume-statistics {
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
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
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
    margin-top: 20rpx;
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

.tag-list {
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #eee;
}

.tag-item {
    margin-bottom: 16rpx;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
        border-bottom: none;
    }
}

.tag-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10rpx;
}

.tag-name {
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
}

.tag-info {
    display: flex;
    gap: 15rpx;
    font-size: 22rpx;
    color: #666;
}

.tag-count {
    color: #999;
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
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
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

.top-amount {
    font-size: 28rpx;
    font-weight: bold;
    color: #ff6b6b;
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
    background: linear-gradient(135deg, #f0f4ff 0%, #f5f0ff 100%);
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
    color: #5470c6;
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

