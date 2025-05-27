<template>
    <view class="income-statistics">
        <!-- 顶部区域 -->
        <view class="header">
            <!-- 左侧时间选择 -->
            <view class="time-picker">
                <picker 
                    v-if="currentTab === 'month'" 
                    mode="date" 
                    fields="month" 
                    :value="selectedDate" 
                    @change="onMonthChange"
                >
                    <view class="picker-content">
                        <text>{{ selectedDate }}</text>
                        <text class="uni-icon-arrowdown"></text>
                    </view>
                </picker>
                <picker 
                    v-else 
                    mode="date" 
                    fields="year" 
                    :value="selectedDate" 
                    @change="onYearChange"
                >
                    <view class="picker-content">
                        <text>{{ selectedDate }}</text>
                        <text class="uni-icon-arrowdown"></text>
                    </view>
                </picker>
            </view>

            <!-- 右侧统计维度切换 -->
            <view class="tab-bar">
                <view 
                    class="tab-item" 
                    :class="{ active: currentTab === 'month' }"
                    @tap="switchTab('month')"
                >月度</view>
                <view 
                    class="tab-item" 
                    :class="{ active: currentTab === 'year' }"
                    @tap="switchTab('year')"
                >年度</view>
            </view>
        </view>

        <!-- 总收入展示 -->
        <view class="total-income">
            <text class="label">总收入</text>
            <text class="amount">¥{{ totalIncome }}</text>
        </view>

        <!-- 图表区域 -->
        <view class="chart-container">
            <view class="chart-title">{{ currentTab === 'month' ? '本月收入趋势' : '年度收入趋势' }}</view>
            <view style="width:100%; height:750rpx">
                <l-echart ref="chartRef"></l-echart>
            </view>
        </view>

        <!-- 收入排行 -->
        <view class="income-ranking">
            <view class="ranking-title">收入排行 TOP 10</view>
            <view class="ranking-list">
                <view 
                    class="ranking-item" 
                    v-for="(item, index) in incomeRanking" 
                    :key="index"
                >
                    <text class="rank">{{ index + 1 }}</text>
                    <text class="name">{{ item.name }}</text>
                    <text class="amount">¥{{ item.amount }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
		onShow,
		onReady
	} from '@dcloudio/uni-app'
import http from '@/api/request.js'

const currentTab = ref('month')
const totalIncome = ref(0)
const incomeRanking = ref([])
const chartRef = ref(null)
const myChart = ref(null)
const echarts = require('../../uni_modules/lime-echart/static/echarts.min')

// 当前选中的日期
const selectedDate = ref(formatDate(new Date()))

// 格式化日期
function formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return currentTab.value === 'month' ? `${year}年${month}月` : `${year}年`
}

// 月份选择变化
const onMonthChange = (e) => {
    const [year, month] = e.detail.value.split('-')
    selectedDate.value = `${year}年${month}月`
    fetchIncomeData()
    renderChart()
}

// 年份选择变化
const onYearChange = (e) => {
    const year = e.detail.value.split('-')[0]
    selectedDate.value = `${year}年`
    fetchIncomeData()
    renderChart()
}

// 切换统计维度
const switchTab = (tab) => {
    currentTab.value = tab
    // 切换时重置为当前年月
    selectedDate.value = formatDate(new Date())
    fetchIncomeData()
    renderChart()
}

// 渲染图表
const renderChart = () => {
    if (!chartRef.value) return
    
    // 生成模拟数据
    const generateMockData = () => {
        if (currentTab.value === 'month') {
            // 月度数据：生成31天的数据
            return Array.from({length: 31}, () => Math.floor(Math.random() * 2000) + 500)
        } else {
            // 年度数据：生成12个月的数据
            return Array.from({length: 12}, () => Math.floor(Math.random() * 10000) + 5000)
        }
    }

    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                const value = params[0].value
                return `${params[0].name}：¥${value.toLocaleString()}`
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: currentTab.value === 'month' 
                ? Array.from({length: 31}, (_, i) => `${i + 1}日`) 
                : ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            axisLabel: {
                interval: currentTab.value === 'month' ? 4 : 0
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: function(value) {
                    return '¥' + value.toLocaleString()
                }
            }
        },
        series: [{
            data: generateMockData(),
            type: 'bar',
            barWidth: '60%',
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#83bff6' },
                    { offset: 0.5, color: '#188df0' },
                    { offset: 1, color: '#188df0' }
                ])
            },
            emphasis: {
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#2378f7' },
                        { offset: 0.7, color: '#2378f7' },
                        { offset: 1, color: '#83bff6' }
                    ])
                }
            }
        }]
    }
    
    chartRef.value.setOption(option, true)
}

// 获取收入数据
const fetchIncomeData = async () => {
    // 模拟总收入数据
    totalIncome.value = currentTab.value === 'month' 
        ? (Math.random() * 50000 + 20000).toFixed(2)
        : (Math.random() * 200000 + 100000).toFixed(2)

    // 模拟收入排行数据
    incomeRanking.value = [
        { name: '工资收入', amount: (Math.random() * 10000 + 5000).toFixed(2) },
        { name: '奖金', amount: (Math.random() * 5000 + 2000).toFixed(2) },
        { name: '兼职收入', amount: (Math.random() * 3000 + 1000).toFixed(2) },
        { name: '投资收入', amount: (Math.random() * 2000 + 500).toFixed(2) },
        { name: '其他收入', amount: (Math.random() * 1000 + 200).toFixed(2) }
    ].sort((a, b) => b.amount - a.amount) // 按金额降序排序
}

onReady(() => {
    if (!chartRef.value) return
    chartRef.value.init(echarts, chart => {
        myChart.value = chart
        fetchIncomeData()
        renderChart()
    })
})

onUnmounted(() => {
    if (myChart.value) {
        myChart.value.dispose()
    }
})
</script>

<style lang="scss">
.income-statistics {
    padding: 20rpx;
    
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30rpx;
        background-color: #fff;
        padding: 20rpx 30rpx;
        border-radius: 20rpx;
        box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);

        .time-picker {
            flex: 1;
            margin-right: 30rpx;

            .picker-content {
                display: flex;
                align-items: center;
                font-size: 32rpx;
                color: #333;

                .uni-icon-arrowdown {
                    font-size: 24rpx;
                    color: #666;
                    margin-left: 10rpx;
                    border: solid #666;
                    border-width: 0 2rpx 2rpx 0;
                    display: inline-block;
                    padding: 4rpx;
                    transform: rotate(45deg);
                }
            }
        }
        
        .tab-bar {
            display: flex;
            background-color: #f5f5f5;
            border-radius: 30rpx;
            padding: 4rpx;
            
            .tab-item {
                padding: 12rpx 30rpx;
                border-radius: 26rpx;
                font-size: 28rpx;
                transition: all 0.3s;
                
                &.active {
                    background-color: #007AFF;
                    color: #fff;
                }
            }
        }
    }
    
    .total-income {
        background-color: #fff;
        padding: 30rpx;
        border-radius: 20rpx;
        margin-bottom: 30rpx;
        box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
        
        .label {
            font-size: 28rpx;
            color: #666;
        }
        
        .amount {
            font-size: 48rpx;
            font-weight: bold;
            color: #333;
            margin-left: 20rpx;
        }
    }
    
    .chart-container {
        background-color: #fff;
        padding: 30rpx;
        border-radius: 20rpx;
        margin-bottom: 30rpx;
        box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
        
        .chart-title {
            font-size: 32rpx;
            font-weight: bold;
            margin-bottom: 20rpx;
        }
    }
    
    .income-ranking {
        background-color: #fff;
        padding: 30rpx;
        border-radius: 20rpx;
        box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
        
        .ranking-title {
            font-size: 32rpx;
            font-weight: bold;
            margin-bottom: 20rpx;
        }
        
        .ranking-list {
            .ranking-item {
                display: flex;
                align-items: center;
                padding: 20rpx 0;
                border-bottom: 1rpx solid #eee;
                
                &:last-child {
                    border-bottom: none;
                }
                
                .rank {
                    width: 60rpx;
                    height: 60rpx;
                    line-height: 60rpx;
                    text-align: center;
                    background-color: #f5f5f5;
                    border-radius: 50%;
                    margin-right: 20rpx;
                }
                
                .name {
                    flex: 1;
                    font-size: 28rpx;
                }
                
                .amount {
                    font-size: 28rpx;
                    color: #007AFF;
                    font-weight: bold;
                }
            }
        }
    }
}
</style>