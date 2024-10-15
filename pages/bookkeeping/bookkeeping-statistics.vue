<!-- 收支分析 （改名为支出分析） -->
<template>
	<view>
		<view>
			<picker mode="date" fields="month" :value="currentMonth" @change="bindPickerChange">
				<view class="uni-input" style="margin-top: 10px;text-align: center;">
					{{formatMonthView()}}<uni-icons type="down" size="20"></uni-icons>
				</view>
			</picker>
		</view>
		<uni-section title="本月支出" type="line">
			<view style="padding-left: 20px;">
				<view style="font-size: 20px;">
					<text style="color: #1a53ff;">¥{{statistics.totalAmount}}</text>
				</view>
				<view style="color: #bfbfbf">
					共{{statistics.totalRecordNum}}笔
				</view>
			</view>
		</uni-section>
		<uni-section title="支出分类" type="line">
			<view style="width:100%; height:750rpx"><l-echart ref="chartRef"></l-echart></view>
			<view>
				<view style="color: #bfbfbf; font-size: 12px;text-align: end;">
					对比上月
					<switch :checked="compareLastMonth" @change="switchLastMonth" style="transform:scale(0.5)" />
				</view>
				<view>
					<view v-for="item in limitedCategoryList()" style="margin: 5px 20px;padding-bottom: 5px;">
						<uni-row :key="item.id">
							<uni-col :span="18">
								<view>
									<text class="normal-font-size">{{item.recordTypeName}}</text>
									<text v-if="item.amount != 0" style="color: #bfbfbf;font-size: 14px;">
										&nbsp;&nbsp;{{item.ratio}}%
										&nbsp;&nbsp;({{item.recordNum}}笔)</text>
								</view>
								<view><progress :percent="item.ratio" stroke-width="6" /></view>
							</uni-col>
							<uni-col :span="6">
								<view style="text-align: end;">
									<view class="normal-font-size" style="color: #000;">¥{{item.amount}}</view>
									<view v-if="compareLastMonth" style="font-size: 14px;">
										<text :style="item.isGreaterThan ? {color: '#ff3333'} : {color: '#00994d'}">
											{{item.isGreaterThan ? '+' : '-'}} ¥{{item.lastAmount}}
										</text>
									</view>
								</view>
							</uni-col>
						</uni-row>
					</view>

				</view>
				<view v-if="categoryData.categoryList.length > 3" style="line-height: 30px; text-align: center;"
					@click="toggleExpandCategory()">
					<view v-if="isExpandCategoryList">
						收起全部<uni-icons type="up" size="20"></uni-icons>
					</view>
					<view v-else>
						展开全部<uni-icons type="down" size="20"></uni-icons>
					</view>
				</view>
			</view>
		</uni-section>

		<uni-section title="支出排行" type="line">
			<uni-list>
				<uni-list-item v-for="item in limitedRankList()" :key="item.id" @click="handleRecordClick(item)"
					clickable>
					<template v-slot:body>
						<view style="width: 100%;">
							<uni-row>
								<uni-col :span="18">
									<view class="normal-font-size">{{formatSourceText(item)}}</view>
									<view style="color: #bfbfbf;font-size: 14px;">{{item.recordTime}}</view>
								</uni-col>
								<uni-col :span="6">
									<view class="normal-font-size" style="text-align: end;">¥{{item.amount}}</view>
								</uni-col>
							</uni-row>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
			<view v-if="statistics.rankList.length > 3" style="line-height: 30px; text-align: center;"
				@click="toggleExpandRank()">
				<view v-if="isExpandRankList">
					收起<uni-icons type="up" size="20"></uni-icons>
				</view>
				<view v-else>
					展开<uni-icons type="down" size="20"></uni-icons>
				</view>
			</view>
		</uni-section>
	</view>

</template>

<script setup>
	import {
		ref,
		reactive,
		watch
	} from 'vue'

	import {
		onShow,
		onReady
	} from '@dcloudio/uni-app'

	import http from '@/api/request.js'

	import {
		useDictStore
	} from "@/stores/dict.ts";

	const dictStore = useDictStore()

	const echarts = require('../../uni_modules/lime-echart/static/echarts.min');

	// 对比上月
	const compareLastMonth = ref(false)
	// 记载过上个月数据
	const loadedLastMonth = ref(false)

	// 当前选择月份
	const currentMonth = ref(getNowDate())

	// 是否展开分类列表数据
	const isExpandCategoryList = ref(false)

	// 是否展开排行列表数据
	const isExpandRankList = ref(false)

	// 支出分类列表数据
	const categoryData = reactive({
		categoryList: []
	})

	// 支出分类图表数据
	const categoryDataRef = ref({
		chartList: [] // 确保 chartList 是响应式的
	});

	// 统计数据，除支出分类以外的所有数据
	const statistics = reactive({
		pageDto: {
			currentMonth: '',
			isQueryLastMonth: false
		},
		totalAmount: 0,
		totalRecordNum: 0,
		// 排行数据
		rankList: []
	})

	// 图表数据
	const chartRef = ref(null)

	// 监控 chartList 的变化
	watch(() => categoryDataRef.value.chartList.slice(), (newVal, oldVal) => {
		if (myChart.value) {
			renderChart();
		}
	}, {
		deep: true
	});

	// 切换分类列表的展开和收起状态
	function toggleExpandCategory() {
		isExpandCategoryList.value = !isExpandCategoryList.value
	}

	// 切换排行列表的展开和收起状态
	function toggleExpandRank() {
		isExpandRankList.value = !isExpandRankList.value
	}

	// 分类列表数据
	function limitedCategoryList() {
		const list = isExpandCategoryList.value ? categoryData.categoryList : categoryData.categoryList.slice(0, 3);
		return compareLastMonth.value ? list : list.filter(t => t.amount != 0)
	}

	// 排行列表数据
	function limitedRankList() {
		return isExpandRankList.value ? statistics.rankList : statistics.rankList.slice(0, 3);
	}

	function formatSourceText(item) {
		if (item.recordSource != '') {
			return item.recordSource;
		}
		return item.recordCategory == 2 ? '收入' : '消费';
	}

	function handleRecordClick(item) {
		uni.navigateTo({
			url: '/pages/bookkeeping/bookkeeping-detail?id=' + item.id
		});
	}

	function switchLastMonth() {
		compareLastMonth.value = !compareLastMonth.value
		// 加载上个月和当前月数据
		if (compareLastMonth.value && !loadedLastMonth.value) {
			statistics.pageDto.isQueryLastMonth = compareLastMonth.value
			http.post('/bookkeeping-service/consume/categoryStatistics', statistics.pageDto)
				.then(res => {
					categoryData.categoryList = res.data.map(item => ({
						recordTypeName: dictStore.getDictNameByCode(dictStore.dictTypeEnum
							.BOOKKEEPING_RECORD_TYPE, item.recordType, "未知"),
						...item
					}))
					loadedLastMonth.value = true
				})
		}
	}

	function bindPickerChange(e) {
		currentMonth.value = e.detail.value
		// 关闭对比上月的开关
		compareLastMonth.value = false
		loadedLastMonth.value = false
		// 加载选择月的数据
		searchData()
	}

	function formatMonthView() {
		const [year, month] = currentMonth.value.split("-");
		return `${year}年${month}月`;
	}

	// 获取当前时间的年月
	function getNowDate() {
		const date = new Date();
		let year = date.getFullYear();
		let month = date.getMonth() + 1;
		return `${year}-${month}`;
	}

	function loadTotalStatisticsData() {
		return new Promise((resolve) => {
			http.post('/bookkeeping-service/consume/totalStatistics', statistics.pageDto)
				.then(res => {
					statistics.totalAmount = res.data.totalAmount
					statistics.totalRecordNum = res.data.totalRecordNum
					resolve(true)
				})
		});
	}

	function loadRankStatisticsData() {
		return new Promise((resolve) => {
			http.post('/bookkeeping-service/consume/rankStatistics', statistics.pageDto)
				.then(res => {
					statistics.rankList = res.data
					resolve(true)
				})
		});
	}

	function loadCategoryStatisticsData() {
		return new Promise((resolve) => {
			http.post('/bookkeeping-service/consume/categoryStatistics', statistics.pageDto)
				.then(res => {
					categoryData.categoryList = res.data.map(item => ({
						recordTypeName: dictStore.getDictNameByCode(dictStore.dictTypeEnum
							.BOOKKEEPING_RECORD_TYPE, item.recordType, "未知"),
						...item
					}))
					resolve(true)
				})
		});
	}

	/**
	 * 查询数据
	 */
	function searchData() {
		statistics.pageDto.currentMonth = `${currentMonth.value}-01`
		statistics.pageDto.isQueryLastMonth = compareLastMonth.value
		Promise.all([loadTotalStatisticsData(), loadRankStatisticsData(), loadCategoryStatisticsData()])
			.then(([result1, result2, result3]) => {
				categoryDataRef.value.chartList = categoryData.categoryList.map(item => ({
					name: item.recordTypeName,
					value: item.amount
				}))
			})
			.catch((error) => {
				console.error('请求失败:', error);
			});
	}

	const myChart = ref(null)


	function renderChart() {
		const option = {
			series: [{
				name: '图表',
				type: 'pie',
				data: categoryDataRef.value.chartList,
				radius: '80%',
				label: {
					position: 'inside',
					formatter: '{b}\n{d}%'
				}
			}]
		}

		chartRef.value.setOption(option, true)
	}


	onReady(() => {
		if (!chartRef.value) return
		chartRef.value.init(echarts, chart => {
			myChart.value = chart
			searchData()
		})
	})
</script>

<style>
	.normal-font-size {
		font-size: 14px;
	}
</style>