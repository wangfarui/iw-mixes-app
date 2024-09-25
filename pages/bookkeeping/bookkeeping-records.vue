<!-- 记账记录 -->
<template>
	<view>
		<view>
			<uni-datetime-picker v-model="page.range" type="daterange" start-placeholder="记账开始日期"
				end-placeholder="记账结束日期" @change="changeRange" />
			<view v-if="showCurrentMonth">
				<view>本月消费金额：{{page.statistics.consume}}元</view>
				<view>本月收入金额：{{page.statistics.income}}元</view>
			</view>
			<view v-else>
				<view>日期筛选下的消费金额：{{page.statistics.consume}}元</view>
				<view>日期筛选下的收入金额：{{page.statistics.income}}元</view>
			</view>
		</view>
		<view>
			<uni-list>
				<uni-list-item v-for="item in page.list" :key="item.id" @click="handleRecordClick(item)" clickable>
					<template v-slot:body>
						<view style="width: 100%;">
							<uni-row>
								<uni-col :span="18">{{formatSourceText(item)}}</uni-col>
								<uni-col :span="6">
									<view style="text-align: right;">
										{{item.recordCategory == '1' ? '-' : ''}}{{item.amount}}元
									</view>
								</uni-col>
							</uni-row>
							<uni-row>
								<view>{{item.recordTime}}</view>
							</uni-row>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
			<view>
				<uni-load-more :status="mealListStatus" />
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue'
	import {
		onPullDownRefresh,
		onReachBottom,
		onShow
	} from '@dcloudio/uni-app'
	import http from '@/api/request.js'

	const mealListStatus = ref('more')

	const showCurrentMonth = ref(true)

	const page = reactive({
		dto: {
			recordStartDate: '',
			recordEndDate: '',
			currentPage: 1,
			pageSize: 20
		},
		range: ['', ''],
		list: [],
		statistics: {}
	})

	onShow(() => {
		initPage()
	})

	function formatSourceText(item) {
		if (item.recordSource != '') {
			return item.recordSource;
		}
		return item.recordCategory == 2 ? '收入' : '消费';
	}

	/**
	 * 日期选择的change⌚事件
	 */
	function changeRange(arr) {
		if (arr == undefined || arr.length == 0) {
			page.range = ['', '']
			showCurrentMonth.value = true
		} else {
			showCurrentMonth.value = false
		}
		// 日期筛选值变化后，初始化分页数据
		initPage()
	}

	/**
	 * 查询统计信息
	 */
	function searchStatistics() {
		return new Promise((resolve) => {
			http.post('/bookkeeping-service/records/statistics', page.dto)
				.then(res => {
					page.statistics = res.data
				})
		});
	}

	/**
	 * 查询分页信息
	 */
	function searchPage() {
		return new Promise((resolve) => {
			http.post('/bookkeeping-service/records/page', page.dto)
				.then(res => {
					const data = res.data
					if (data.records && data.records.length == page.dto.pageSize) {
						mealListStatus.value = 'more'
					} else {
						mealListStatus.value = 'noMore'
					}
					page.list = [...page.list, ...data.records]
				})
				.catch(error => {
					mealListStatus.value = 'more'
				})
				.finally(() => {
					uni.stopPullDownRefresh();
				});
		});
	}

	/**
	 * 查询数据
	 */
	function searchData() {
		page.dto.recordStartDate = page.range[0]
		page.dto.recordEndDate = page.range[1]
		mealListStatus.value = 'loading'
		Promise.all([searchStatistics(), searchPage()])
			.then(([result1, result2]) => {
				// 这里可以进行后续的同步操作
			})
			.catch((error) => {
				console.error('请求失败:', error);
			});
	}

	function handleRecordClick(item) {
		uni.navigateTo({
			url: '/pages/bookkeeping/bookkeeping-detail?id=' + item.id
		});
	}

	function initPage() {
		page.dto.currentPage = 1
		page.list = []
		searchData()
	}

	onPullDownRefresh(() => {
		initPage()
	})

	// 上拉加载更多
	onReachBottom(() => {
		page.dto.currentPage++
		searchData()
	})
</script>

<style>

</style>