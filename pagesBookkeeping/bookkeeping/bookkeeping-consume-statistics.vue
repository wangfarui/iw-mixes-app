<template>
    <view class="consume-statistics">
        <!-- 顶部区域 -->
        <view class="header">
            <!-- 左侧时间选择 -->
            <view class="time-picker">
                <picker 
                    v-if="currentTab === 'month'" 
                    mode="date" 
                    fields="month" 
                    :value="formatDateForPicker(selectedDate)" 
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
                    :value="formatDateForPicker(selectedDate)" 
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

        <!-- 总支出展示 -->
        <view class="total-consume">
            <view class="consume-info">
                <view class="consume-amount-info">
                    <text class="label">总支出</text>
                    <text class="amount">¥{{ totalConsume }}</text>
                </view>
                <text class="count">共 {{ totalRecordNum }} 笔</text>
            </view>
            <view class="switch-item">
                <text>忽略不计入统计的账单</text>
                <switch :checked="ignoreNotStatistics" @change="switchIgnoreStatistics" style="transform:scale(0.6)" />
            </view>
        </view>

        <!-- 图表区域 -->
        <view class="chart-container">
            <view class="chart-title-container">
                <view class="chart-title">{{ currentTab === 'month' ? '本月支出占比' : '年度支出占比' }}</view>
                <!-- 对比上月开关 (月度统计时显示) -->
                <view class="compare-switch" v-if="currentTab === 'month'">
                    <text>对比上月</text>
                    <switch :checked="compareLastMonth" @change="switchLastMonth" style="transform:scale(0.6)" />
                </view>
            </view>
            <l-echart ref="chartRef" style="width:100%;height:750rpx"></l-echart>
            
            <!-- 分类列表 -->
            <view class="category-list">
                <view 
                    class="category-item" 
                    v-for="(item, idx) in getDisplayCategoryList()" 
                    :key="item.name"
                    @tap="goToRecords(item)"
                >
                    <view class="category-header">
                        <view class="category-name-info">
                            <text class="category-name">{{ item.name }}</text>
                            <text class="category-ratio">({{ item.ratio }}%)</text>
                            <text class="category-record">({{ item.recordNum }}笔)</text>
                        </view>
                        <view class="category-amount-info">
                            <text class="category-amount">¥{{ item.value }}</text>
                            <text v-if="compareLastMonth && item.lastAmount" 
                                  :class="['last-month-amount', item.isGreaterThan ? 'greater' : 'less']">
                                {{ item.isGreaterThan ? '+' : '-' }}¥{{ item.lastAmount }}
                            </text>
                        </view>
                    </view>
                    <view class="progress-bar-bg">
                        <view 
                            class="progress-bar" 
                            :style="{ width: item.ratio + '%'}"
                        ></view>
                    </view>
                </view>
                <view 
                    v-if="chartData.length > 3" 
                    class="expand-btn" 
                    @tap="showAllCategory = !showAllCategory"
                >
                    <text>{{ showAllCategory ? '收起' : '展开全部' }}</text>
                    <text :class="['arrow', showAllCategory ? 'up' : 'down']"></text>
                </view>
            </view>
        </view>

        <!-- 支出标签占比 -->
        <view class="chart-section tags-section">
            <view class="chart-title-container">
                <view class="chart-title">支出标签占比</view>
                <view class="view-toggle-btn" @tap="switchTagViewType">
                    <text>{{ tagViewType === 'count' ? '按次数' : '按金额' }}</text>
                </view>
            </view>
            <l-echart ref="tagPieChartRef" style="width:100%;height:750rpx"></l-echart>

            <view class="tag-list">
                <view
                    class="tag-item"
                    v-for="item in getDisplayTags(consumeTags)"
                    :key="item.name"
                >
                    <view class="tag-header">
                        <view class="tag-name">{{ item.name }}</view>
                        <view class="tag-info">
                            <text class="tag-ratio" v-if="tagViewType === 'count'">
                                {{ item.ratio }}% ({{ item.count }}次)
                            </text>
                            <text class="tag-ratio" v-else>
                                {{ item.amountRatio }}% (¥{{ item.amount }})
                            </text>
                        </view>
                    </view>
                    <view class="progress-bar-bg">
                        <view
                            class="progress-bar"
                            :style="{
                                width: (tagViewType === 'count' ? item.ratio : item.amountRatio) + '%',
                                backgroundColor: item.color
                            }"
                        ></view>
                    </view>
                </view>
                <view
                    v-if="consumeTags.length > 5"
                    class="expand-btn"
                    @tap="showAllTags = !showAllTags"
                >
                    <text>{{ showAllTags ? '收起' : '展开全部' }}</text>
                    <text :class="['arrow', showAllTags ? 'up' : 'down']"></text>
                </view>
            </view>
        </view>

        <!-- 年度趋势图 (仅在年度统计时显示) -->
        <view v-show="currentTab === 'year'" class="chart-section year-trend">
            <view class="chart-title-container">
                <view class="chart-title">年度支出趋势</view>
            </view>
            <l-echart ref="trendChartRef" style="width:100%;height:750rpx"></l-echart>
        </view>

        <!-- 月度每日消费图表 (仅在月度统计时显示) -->
        <view v-show="currentTab === 'month'" class="chart-section month-daily-trend">
            <view class="chart-title-container">
                <view class="chart-title">月度每日消费</view>
            </view>
            <l-echart ref="monthlyDailyChartRef" style="width:100%;height:750rpx"></l-echart>
        </view>
        <view class="consume-ranking">
            <view class="ranking-title">支出排行 TOP 10</view>
            <view class="ranking-list">
                <view 
                    class="ranking-item" 
                    v-for="(item, index) in consumeRanking" 
                    :key="index"
                    @tap="goToDetail(item)"
                >
                    <text class="rank">{{ index + 1 }}</text>
                    <view class="ranking-content">
                        <text class="name">{{ formatRankSource(item) }}</text>
                        <text v-if="shouldShowOwner(item)" class="owner">来自{{ item.userName }}</text>
                    </view>
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
import { useBookkeepingQueryScopeStore } from '@/stores/bookkeeping-query-scope.js'

import { useDictStore } from "@/stores/dict.ts";

const dictStore = useDictStore()
const scopeStore = useBookkeepingQueryScopeStore()
const currentTab = ref('month')
const totalConsume = ref(0)
const consumeRanking = ref([])
const totalRecordNum = ref(0)
const chartRef = ref(null)
const myChart = ref(null)
const trendChartRef = ref(null)
const trendChart = ref(null)
const trendChartData = ref([])
const monthlyDailyChartRef = ref(null)
const monthlyDailyChart = ref(null)
const monthlyDailyChartData = ref([])
const tagPieChartRef = ref(null)
const tagPieChart = ref(null)
const echarts = require('../../uni_modules/lime-echart/static/echarts.min')

// 忽略不计入统计数据开关状态
const ignoreNotStatistics = ref(false)
// 对比上月开关状态
const compareLastMonth = ref(false)
// 是否已加载上个月数据 (用于对比)
const loadedLastMonth = ref(false)
// 标签视图类型 'count' or 'amount'
const tagViewType = ref('count')
// 是否显示全部标签
const showAllTags = ref(false)

// 用于存储图表实际数据
const chartData = ref([]);
// 标签数据
const consumeTags = ref([]);

// 当前选中的日期
const selectedDate = ref(formatDate(new Date()))

// 格式化日期
function formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return currentTab.value === 'month' ? `${year}年${month}月` : `${year}年`
}

// 格式化日期为 yyyy-MM 格式
const formatDateForApi = (dateStr) => {
    // 处理 "yyyy年MM月" 或 "yyyy年" 格式
    const year = dateStr.split('年')[0];
    const month = dateStr.includes('月') ? dateStr.split('年')[1].replace('月', '') : '01';
    return `${year}-${month.padStart(2, '0')}`;
};

// 在 script setup 部分添加新的格式化函数
const formatDateForPicker = (dateStr) => {
    // 处理 "yyyy年MM月" 或 "yyyy年" 格式
    const year = dateStr.split('年')[0];
    const month = dateStr.includes('月') ? dateStr.split('年')[1].replace('月', '') : '01';
    return currentTab.value === 'month' ? `${year}-${month.padStart(2, '0')}` : `${year}`;
};

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
        statisticsType: statisticsTypeParam,
        isSearchAll: ignoreNotStatistics.value ? 0 : 1, // 根据开关设置参数
        isQueryLastMonth: compareLastMonth.value, // 根据开关设置参数
        queryOnlyMyself: scopeStore.queryOnlyMyself
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
    // 重置对比上月状态，年度统计不支持对比上月
    compareLastMonth.value = false;
    loadedLastMonth.value = false;
    // watch 会触发数据获取和图表渲染
}

// 忽略不计入统计的账单开关变化
const switchIgnoreStatistics = (e) => {
    ignoreNotStatistics.value = e.detail.value;
    // 状态变化后重新获取数据
    fetchConsumeData();
}

// 对比上月开关变化
const switchLastMonth = (e) => {
    compareLastMonth.value = e.detail.value;
    // 如果开启对比上月且未加载过上月数据，则单独加载上月数据（用于列表对比展示），然后重新加载主数据
    if (compareLastMonth.value && !loadedLastMonth.value) {
        // 这里需要一个单独的接口或调整现有接口来获取上月数据用于对比列表
        // 目前先只重新加载主数据，如果需要列表对比，再实现单独加载逻辑
         fetchConsumeData();
         loadedLastMonth.value = true; // 标记已尝试加载上月数据
    } else {
         // 如果关闭对比上月，或者上月数据已加载过，直接重新加载主数据
         fetchConsumeData();
    }
}

// 渲染饼图
const renderChart = () => {
    if (!chartRef.value || !myChart.value) {
        return;
    }
    
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b} : {c} ({d}%)'
        },
        legend: {
            type: 'scroll',
            orient: 'horizontal',
            left: 'left',
        },
        series: [{
            type: 'pie',
            radius: '80%',
            center: ['50%', '50%'],
            data: chartData.value.map(item => ({
                name: item.name, 
                value: item.value
            })),
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
            label: {
                position: 'inside',
                formatter: '{b}\n{d}%'
            }
        }]
    };
    
    chartRef.value.setOption(option, true);
}

// 渲染年度趋势图
const renderTrendChart = () => {
    if (!trendChartRef.value || !trendChart.value) {
        return;
    }
    
    const maxIndex = trendChartData.value.indexOf(Math.max(...trendChartData.value));
    
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                const labelNumber = params[0].name;
                return `${labelNumber}月：¥${params[0].value.toLocaleString()}`;
            }
        },
        grid: {
            left: '0%',
            right: '5%',
            bottom: 20,
            top: 30,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: Array.from({length: trendChartData.value.length}, (_, i) => `${i + 1}`),
            axisLabel: {
                show: true,
                fontSize: 12
            },
            axisTick: { show: false },
            axisLine: { show: true },
            boundaryGap: true
        },
        yAxis: {
            type: 'value',
            show: true,
            axisLabel: {
                show: true,
                fontSize: 12,
                formatter: function(value) {
                    if (value >= 10000) {
                        return (value / 10000).toFixed(0) + 'w';
                    }
                    return value;
                }
            },
            axisTick: { show: true },
            axisLine: { show: true },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#f0f0f0',
                    type: 'dashed'
                }
            }
        },
        series: [{
            data: trendChartData.value,
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
                    if (!trendChartData.value || trendChartData.value.length === 0) return '';
                    return params.dataIndex === maxIndex ? `¥${params.value}` : '';
                },
                fontWeight: 'bold',
                color: '#2378f7',
                fontSize: 14
            },
            barCategoryGap: '10%'
        }]
    };
    
    trendChartRef.value.setOption(option, true);
    
    // 高亮最大值
    if (trendChartData.value && trendChartData.value.length > 0) {
        setTimeout(() => {
            trendChart.value.dispatchAction({
                type: 'highlight',
                seriesIndex: 0,
                dataIndex: maxIndex
            });
        }, 500);
    }
};

// 渲染月度每日消费柱状图
const renderMonthlyDailyChart = () => {
    if (!monthlyDailyChartRef.value || !monthlyDailyChart.value) {
        return;
    }

    if (!monthlyDailyChartData.value || monthlyDailyChartData.value.length === 0) {
        monthlyDailyChartRef.value.setOption({
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: [] },
            yAxis: { type: 'value' },
            series: [{ data: [], type: 'bar' }]
        }, true);
        return;
    }

    const maxIndex = monthlyDailyChartData.value.indexOf(Math.max(...monthlyDailyChartData.value));

    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                const dayNumber = params[0].name;
                return `${dayNumber}日：¥${params[0].value.toLocaleString()}`;
            }
        },
        grid: {
            left: '0%',
            right: '5%',
            bottom: 20,
            top: 30,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: Array.from({length: monthlyDailyChartData.value.length}, (_, i) => `${i + 1}`),
            axisLabel: {
                show: true,
                fontSize: 12
            },
            axisTick: { show: false },
            axisLine: { show: true },
            boundaryGap: true
        },
        yAxis: {
            type: 'value',
            show: true,
            axisLabel: {
                show: true,
                fontSize: 12,
                formatter: function(value) {
                    if (value >= 10000) {
                        return (value / 10000).toFixed(0) + 'w';
                    }
                    return value;
                }
            },
            axisTick: { show: true },
            axisLine: { show: true },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#f0f0f0',
                    type: 'dashed'
                }
            }
        },
        series: [{
            data: monthlyDailyChartData.value,
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
                    if (!monthlyDailyChartData.value || monthlyDailyChartData.value.length === 0) return '';
                    return params.dataIndex === maxIndex ? `¥${params.value}` : '';
                },
                fontWeight: 'bold',
                color: '#2378f7',
                fontSize: 14
            },
            barCategoryGap: '10%'
        }]
    };

    monthlyDailyChartRef.value.setOption(option, true);

    // 高亮最大值
    if (monthlyDailyChartData.value && monthlyDailyChartData.value.length > 0) {
        setTimeout(() => {
            monthlyDailyChart.value.dispatchAction({
                type: 'highlight',
                seriesIndex: 0,
                dataIndex: maxIndex
            });
        }, 500);
    }
};

// 渲染支出标签饼图
const renderTagPieChart = () => {
    if (!tagPieChartRef.value || !tagPieChart.value) {
        return;
    }

    try {
        let pieData, tooltipFormatter, seriesName

        if (tagViewType.value === 'count') {
            pieData = consumeTags.value.map((item, index) => ({
                value: item.count,
                name: item.name,
                itemStyle: {
                    color: item.color
                }
            }))
            tooltipFormatter = function(params) {
                if (!params) return ''
                return `${params.name} ${params.value}次\n占比 ${params.percent}%`
            }
            seriesName = '支出标签'
        } else {
            pieData = consumeTags.value.map((item, index) => ({
                value: item.amount,
                name: item.name,
                itemStyle: {
                    color: item.color
                }
            }))
            tooltipFormatter = function(params) {
                if (!params) return ''
                return `${params.name} ¥${params.value}\n占比 ${params.percent}%`
            }
            seriesName = '支出标签金额'
        }

        const option = {
            tooltip: {
                trigger: 'item',
                formatter: tooltipFormatter
            },
            series: [{
                name: seriesName,
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

// 获取支出数据
const fetchConsumeData = async () => {
    const params = getRequestParams();

    try {
        // 获取饼图数据的接口
        const pieChartApi = '/bookkeeping-service/bookkeeping/consume/pieChartStatistics';
        // 获取柱状图数据的接口
        const barChartApi = '/bookkeeping-service/bookkeeping/consume/barChartStatistics';
        // 获取标签数据的接口
        const tagsApi = '/bookkeeping-service/bookkeeping/consume/tagsStatistics';

        const [totalRes, pieChartRes, rankingRes, barChartRes, tagsRes] = await Promise.all([
            http.post('/bookkeeping-service/bookkeeping/consume/totalStatistics', params),
            http.post(pieChartApi, params),
            http.post('/bookkeeping-service/bookkeeping/consume/rankStatistics', params),
            http.post(barChartApi, params),
            http.post(tagsApi, params)
        ]);

        // 处理总支出结果
        if (totalRes.data) {
            totalConsume.value = totalRes.data.totalAmount;
            totalRecordNum.value = totalRes.data.totalRecordNum;
        } else {
            totalConsume.value = 0;
            totalRecordNum.value = 0;
        }

        // 处理饼图数据
        if (pieChartRes.data && Array.isArray(pieChartRes.data)) {
            chartData.value = pieChartRes.data.map(item => ({
                recordType: item.recordType,
                name: dictStore.getDictNameByCode(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TYPE, item.recordType, "未知"),
                value: item.amount,
                ratio: item.ratio,
                recordNum: item.recordNum,
                lastAmount: item.lastAmount,
                isGreaterThan: item.isGreaterThan
            }));
            renderChart();
        } else {
            chartData.value = [];
            renderChart();
        }

        // 处理标签数据
        if (tagsRes.data && Array.isArray(tagsRes.data)) {
            const chartColors = ['#5470c6', '#91419f', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
            consumeTags.value = tagsRes.data.map((item, index) => ({
                ...item,
                count: parseInt(item.count) || 0,
                amount: parseFloat(item.amount) || 0,
                ratio: parseInt(item.ratio) || 0,
                amountRatio: parseInt(item.amountRatio) || 0,
                color: chartColors[index % chartColors.length]
            }));
            renderTagPieChart();
        } else {
            consumeTags.value = [];
            renderTagPieChart();
        }

        // 处理年度趋势图数据或月度每日消费数据
        if (barChartRes.data && Array.isArray(barChartRes.data)) {
            if (currentTab.value === 'year') {
                trendChartData.value = barChartRes.data;
                renderTrendChart();
            } else {
                // 月度统计时使用barChartRes数据作为每日消费数据
                monthlyDailyChartData.value = barChartRes.data;
                renderMonthlyDailyChart();
            }
        } else {
            if (currentTab.value === 'year') {
                trendChartData.value = [];
                renderTrendChart();
            } else {
                monthlyDailyChartData.value = [];
                renderMonthlyDailyChart();
            }
        }

        // 处理支出排行结果
        if (rankingRes.data && Array.isArray(rankingRes.data)) {
            consumeRanking.value = rankingRes.data;
        } else {
            consumeRanking.value = [];
        }

    } catch (error) {
        // 清空数据
        totalConsume.value = 0;
        totalRecordNum.value = 0;
        chartData.value = [];
        trendChartData.value = [];
        monthlyDailyChartData.value = [];
        consumeRanking.value = [];
        consumeTags.value = [];
        // 渲染空图表
        renderChart();
        renderTrendChart();
        renderMonthlyDailyChart();
        renderTagPieChart();
    }
};

// 监听统计维度和日期变化，自动刷新数据和图表
watch([currentTab, selectedDate], () => {
    // 切换维度时重置展开状态
    if (currentTab.value === 'month') {
        showAllCategory.value = false;
    }
    fetchConsumeData();
});

watch(() => scopeStore.effectiveScope, () => {
    fetchConsumeData();
});

// 修改 onReady 方法
onReady(() => {
     // 初始化趋势图
     if (trendChartRef.value) {
        trendChartRef.value.init(echarts, chart => {
            trendChart.value = chart;
        });
    }

    // 初始化月度每日消费图表
    if (monthlyDailyChartRef.value) {
        monthlyDailyChartRef.value.init(echarts, chart => {
            monthlyDailyChart.value = chart;
        });
    }

    // 初始化标签饼图
    if (tagPieChartRef.value) {
        tagPieChartRef.value.init(echarts, chart => {
            tagPieChart.value = chart;
        });
    }

    // 初始化饼图
    if (chartRef.value) {
        chartRef.value.init(echarts, chart => {
            myChart.value = chart;
            // 初始化后立即获取数据并渲染
            fetchConsumeData();
        });
    }
});

// 修改 onUnmounted 方法
onUnmounted(() => {
    if (myChart.value) {
        myChart.value.dispose();
        myChart.value = null;
    }
    if (trendChart.value) {
        trendChart.value.dispose();
        trendChart.value = null;
    }
    if (monthlyDailyChart.value) {
        monthlyDailyChart.value.dispose();
        monthlyDailyChart.value = null;
    }
    if (tagPieChart.value) {
        tagPieChart.value.dispose();
        tagPieChart.value = null;
    }
});

// 在 script setup 中添加新的响应式变量和方法
const showAllCategory = ref(false)
const getDisplayCategoryList = () => {
    if (!chartData.value) return []
    return showAllCategory.value ? chartData.value : chartData.value.slice(0, 3)
}

// 切换标签视图类型
const switchTagViewType = () => {
    tagViewType.value = tagViewType.value === 'count' ? 'amount' : 'count'
    renderTagPieChart()
}

// 获取显示的标签 (按照当前视图类型排序，最多显示5个)
const getDisplayTags = (tags) => {
    let sortedTags = [...tags]
    // 按照当前视图类型排序 (倒序)
    if (tagViewType.value === 'count') {
        sortedTags.sort((a, b) => b.count - a.count)
    } else {
        sortedTags.sort((a, b) => (b.amount || 0) - (a.amount || 0))
    }

    if (showAllTags.value) {
        return sortedTags
    }
    return sortedTags.slice(0, 5)
}

// 跳转到账单详情
const goToDetail = (item) => {
    uni.navigateTo({
        url: '/pagesBookkeeping/bookkeeping/bookkeeping-detail?id=' + item.id
    });
};

// 跳转到账单明细
const goToRecords = (item) => {
    let url = '/pagesBookkeeping/bookkeeping/bookkeeping-records?recordType=' + item.recordType +
        '&ignoreNotStatistics=' + ignoreNotStatistics.value;
    
    // 根据统计维度决定传递日期参数
    if (currentTab.value === 'month') {
        url += '&recordDate=' + formatDateForApi(selectedDate.value);
    } else {
        url += '&recordYear=' + formatDateForApi(selectedDate.value);
    }

    // 固定只查支出
    url += '&recordCategory=1'
    
    uni.navigateTo({ url });
};

const shouldShowOwner = (item) => {
    return scopeStore.effectiveScope === 'shared' && item.userName && !item.canEdit
}

const formatRankSource = (item) => {
    return item.recordSource || '消费'
}
</script>

<style lang="scss">
.consume-statistics {
    padding: 20rpx;

    .scope-panel {
        margin-bottom: 20rpx;
    }
    
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
    
    .total-consume {
        background-color: #fff;
        padding: 30rpx;
        border-radius: 20rpx;
        margin-bottom: 30rpx;
        box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;

        .consume-info {
            display: flex;
            flex-direction: column;
        }

        .consume-amount-info {
            display: flex;
            align-items: center;
            margin-bottom: 8rpx;
        }

        .label {
            font-size: 28rpx;
            color: #666;
            margin-right: 20rpx;
        }
        
        .amount {
            font-size: 48rpx;
            font-weight: bold;
            color: #333;
        }

        .count {
            font-size: 28rpx;
            color: #999;
        }

        .switch-item {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            text {
                font-size: 24rpx;
                margin-bottom: 8rpx;
                color: #999;
            }
        }
    }
    
    .chart-container {
        background-color: #fff;
        padding: 30rpx;
        border-radius: 20rpx;
        margin-bottom: 30rpx;
        box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
        
        .chart-title-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20rpx;

            .chart-title {
                font-size: 32rpx;
                font-weight: bold;
            }

            .compare-switch {
                display: flex;
                align-items: center;

                text {
                    font-size: 24rpx;
                    margin-right: 10rpx;
                    color: #999;
                }
            }
        }
    }
    
    .consume-ranking {
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
                
                .ranking-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .name {
                    font-size: 28rpx;
                }

                .owner {
                    margin-top: 6rpx;
                    font-size: 22rpx;
                    color: #007aff;
                }
                
                .amount {
                    font-size: 28rpx;
                    color: #007AFF;
                    font-weight: bold;
                }
            }
        }
    }

    .category-list {
        margin-top: 30rpx;
        .category-item {
            margin-bottom: 24rpx;
            .category-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                font-size: 28rpx;
                color: #333;
                margin-bottom: 8rpx;

                .category-name-info {
                    display: flex;
                    align-items: center;
                    .category-name {
                        font-weight: bold;
                    }
                    .category-ratio, .category-record {
                        font-size: 24rpx;
                        color: #888;
                        margin-left: 12rpx;
                    }
                }
                .category-amount-info {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    .category-amount {
                        font-weight: bold;
                    }
                    .last-month-amount {
                        font-size: 24rpx;
                        margin-top: 4rpx;
                        &.greater {
                            color: #ff4d4f;
                        }
                        &.less {
                            color: #52c41a;
                        }
                    }
                }
            }
            .progress-bar-bg {
                width: 100%;
                height: 16rpx;
                background: #f0f0f0;
                border-radius: 8rpx;
                overflow: hidden;
                .progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #83bff6, #188df0);
                    border-radius: 8rpx;
                }
            }
        }
        .expand-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #007AFF;
            font-size: 26rpx;
            margin-top: 10rpx;
            .arrow {
                display: inline-block;
                margin-left: 8rpx;
                border: solid #007AFF;
                border-width: 0 3rpx 3rpx 0;
                padding: 6rpx;
                &.down {
                    transform: rotate(45deg);
                }
                &.up {
                    transform: rotate(-135deg);
                }
            }
        }
    }

    .year-trend {
        background-color: #fff;
        padding: 30rpx;
        border-radius: 20rpx;
        margin-bottom: 30rpx;
        box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);

        .chart-title-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20rpx;

            .chart-title {
                font-size: 32rpx;
                font-weight: bold;
            }
        }
    }

    .month-daily-trend {
        background-color: #fff;
        padding: 30rpx;
        border-radius: 20rpx;
        margin-bottom: 30rpx;
        box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);

        .chart-title-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20rpx;

            .chart-title {
                font-size: 32rpx;
                font-weight: bold;
            }
        }
    }

    .chart-section {
        background-color: #fff;
        padding: 30rpx;
        border-radius: 20rpx;
        margin-bottom: 30rpx;
        box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);

        .chart-title-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20rpx;

            .chart-title {
                font-size: 32rpx;
                font-weight: bold;
            }

            .view-toggle-btn {
                padding: 8rpx 16rpx;
                background-color: #f0f0f0;
                border-radius: 6rpx;
                font-size: 22rpx;
                color: #5470c6;
                border: 1rpx solid #e0e0e0;
                transition: all 0.3s ease;

                &:active {
                    background-color: #e8e8e8;
                }
            }
        }

        .tag-list {
            margin-top: 20rpx;
            padding-top: 20rpx;
            border-top: 1rpx solid #eee;

            .tag-item {
                margin-bottom: 16rpx;
                padding-bottom: 16rpx;
                border-bottom: 1rpx solid #f0f0f0;

                &:last-child {
                    border-bottom: none;
                }

                .tag-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10rpx;

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

                        .tag-ratio {
                            color: #999;
                        }
                    }
                }

                .progress-bar-bg {
                    width: 100%;
                    height: 8rpx;
                    background-color: #e8e8e8;
                    border-radius: 4rpx;
                    overflow: hidden;

                    .progress-bar {
                        height: 100%;
                        border-radius: 4rpx;
                        transition: width 0.3s ease;
                    }
                }
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
        }
    }
}
</style>
