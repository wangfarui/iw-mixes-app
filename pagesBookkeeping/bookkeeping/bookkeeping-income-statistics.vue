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
            <view class="income-amount-info">
                <text class="label">总收入</text>
                <text class="amount">¥{{ totalIncome }}</text>
            </view>
            <text class="count">共 {{ totalRecordNum }} 笔</text>
        </view>

        <!-- 图表区域 -->
        <view class="chart-container">
            <view class="chart-title">{{ currentTab === 'month' ? '本月收入趋势' : '年度收入趋势' }}</view>
            <l-echart ref="chartRef" style="width:100%;height:750rpx"></l-echart>
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
                    <text class="name">{{ item.recordSource }}</text>
                    <text class="amount">¥{{ item.amount }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { onReady } from '@dcloudio/uni-app'
import http from '@/api/request.js'

const currentTab = ref('month')
const totalIncome = ref(0)
const incomeRanking = ref([])
const totalRecordNum = ref(0)
const chartRef = ref(null)
const myChart = ref(null)
const echarts = require('../../uni_modules/lime-echart/static/echarts.min')

// 用于存储图表实际数据
const chartData = ref([]);

// 当前选中的日期
const selectedDate = ref(formatDate(new Date()))

// 格式化日期
function formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return currentTab.value === 'month' ? `${year}年${month}月` : `${year}年`
}

// 获取请求参数
const getRequestParams = () => {
    const [yearStr, monthStr] = selectedDate.value.replace('年', '-').replace('月', '').split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    let currentMonthParam = '';
    let statisticsTypeParam = '';

    if (currentTab.value === 'month') {
        currentMonthParam = `${year}-${monthStr.padStart(2, '0')}-01`;
        statisticsTypeParam = '1';
    } else {
        currentMonthParam = `${year}-01-01`;
        statisticsTypeParam = '2';
    }

    return {
        currentMonth: currentMonthParam,
        statisticsType: statisticsTypeParam
    };
};

// 月份选择变化
const onMonthChange = (e) => {
    const [year, month] = e.detail.value.split('-')
    selectedDate.value = `${year}年${month}月`
    // watch 会触发数据获取和图表渲染
}

// 年份选择变化
const onYearChange = (e) => {
    const year = e.detail.value.split('-')[0]
    selectedDate.value = `${year}年`
    // watch 会触发数据获取和图表渲染
}

// 切换统计维度
const switchTab = (tab) => {
    currentTab.value = tab
    // 切换时重置为当前年月
    selectedDate.value = formatDate(new Date())
    // watch 会触发数据获取和图表渲染
}

// 渲染图表
const renderChart = () => {
    if (!chartRef.value || !myChart.value) {
        console.error('renderChart: 图表实例未准备好');
        return;
    }
    
    // 找到最大值索引 (用于标签显示和高亮)
    const maxIndex = chartData.value.indexOf(Math.max(...chartData.value));

    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                // 获取x轴标签的数字部分
                const labelNumber = params[0].name;
                // 根据当前维度决定是"日"还是"月"
                const suffix = currentTab.value === 'month' ? '日' : '月';
                // 组合成完整的标签，用于tooltip显示
                const fullLabel = `${labelNumber}${suffix}`;
                const value = params[0].value;
                return `${fullLabel}：¥${value.toLocaleString()}`;
            }
        },
        grid: {
            left: '0%',
            right: '0%',
            bottom: 20,
            top: 30,
            containLabel: false
        },
        xAxis: {
            type: 'category',
            data: currentTab.value === 'month' 
                ? Array.from({length: chartData.value.length}, (_, i) => `${i + 1}`)
                : Array.from({length: chartData.value.length}, (_, i) => `${i + 1}`),
            axisLabel: {
                show: true, // 显式设置显示
                fontSize: 12,
                // 可以尝试自动旋转标签，避免重叠
                // rotate: 45 
            },
            axisTick: { show: false },
            axisLine: { show: false },
            boundaryGap: true
        },
        yAxis: {
            show: false
        },
        series: [{
            data: chartData.value,
            type: 'bar',
            barWidth: '70%',
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
            },
            label: {
                show: true,
                position: 'top',
                formatter: function(params) {
                    // 只显示最大值的label
                     if (!chartData.value || chartData.value.length === 0) return '';
                     return params.dataIndex === maxIndex ? `¥${params.value}` : '';
                },
                fontWeight: 'bold',
                color: '#2378f7',
                fontSize: 14
            },
            barCategoryGap: '10%'
        }],
        // 默认高亮最大值
        animation: true,
        animationDuration: 800,
        animationEasing: 'cubicOut',
        // 高亮最大值
        graphic: []
    }
    // 设置默认高亮最大值
    // 只有当 chartData 有数据时才高亮
    if (chartData.value && chartData.value.length > 0 && myChart.value) {
         setTimeout(() => {
            myChart.value.dispatchAction({
                type: 'highlight',
                seriesIndex: 0,
                dataIndex: maxIndex
            });
        }, 500);
    }

    chartRef.value.setOption(option, true);
}

// 获取收入数据
const fetchIncomeData = async () => {
    const params = getRequestParams();

    try {
        const [totalRes, chartRes, rankingRes] = await Promise.all([
            http.post('/bookkeeping-service/bookkeeping/income/totalStatistics', params),
            http.post('/bookkeeping-service/bookkeeping/income/chartStatistics', params),
            http.post('/bookkeeping-service/bookkeeping/income/rankStatistics', params)
        ]);

        // 处理总收入结果
        if (totalRes.data) {
            totalIncome.value = totalRes.data.totalAmount;
            totalRecordNum.value = totalRes.data.totalRecordNum;
        } else {
            totalIncome.value = 0;
            totalRecordNum.value = 0;
        }

        // 处理图表数据结果并在成功后渲染图表
        if (chartRes.data && Array.isArray(chartRes.data)) {
            chartData.value = chartRes.data;
            renderChart(); // 图表数据成功后渲染
        } else {
            chartData.value = []; // 清空数据如果返回格式不正确
            renderChart(); // 渲染空图表
        }

        // 处理收入排行结果
        if (rankingRes.data && Array.isArray(rankingRes.data)) {
            incomeRanking.value = rankingRes.data;
        } else {
            incomeRanking.value = []; // 清空数据如果返回格式不正确
        }

    } catch (error) {
        console.error('获取收入数据失败:', error);
        // 清空数据，防止显示旧数据
        totalIncome.value = 0;
        totalRecordNum.value = 0;
        chartData.value = [];
        incomeRanking.value = [];
        // 渲染空图表
        renderChart();
    }
};

// 监听统计维度和日期变化，自动刷新数据和图表
watch([currentTab, selectedDate], () => {
    fetchIncomeData()
})

onReady(() => {
    if (!chartRef.value) return
    chartRef.value.init(echarts, chart => {
        myChart.value = chart
        // 初始化后立即获取数据并渲染
        fetchIncomeData()
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
        display: flex; /* 启用flex布局 */
        justify-content: space-between; /* 子元素左右对齐 */
        align-items: center; /* 垂直居中 */

        .income-amount-info {
            display: flex;
            align-items: center;
        }

        .label {
            font-size: 28rpx;
            color: #666;
            margin-right: 20rpx; /* 标签和金额之间的间距 */
        }
        
        .amount {
            font-size: 48rpx;
            font-weight: bold;
            color: #333;
        }

        .count {
            font-size: 28rpx;
            color: #999; /* 笔数颜色稍浅 */
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