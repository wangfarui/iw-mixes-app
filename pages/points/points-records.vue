<!-- 记账记录 -->
<template>
	<view>
		<view style="text-align: center;font-size: 20px;margin: 10px 0">
			总积分：{{page.totalPoints}}分
		</view>
		<view style="margin: 3px 0;">
			<uni-datetime-picker v-model="page.range" type="daterange" start-placeholder="记录开始日期"
				end-placeholder="记录结束日期" @change="changeRange" />
			<view v-if="showCurrentMonth">
				<view>本月新增积分：{{page.statistics.increasePoints}}分</view>
				<view>本月扣减积分：{{page.statistics.deductPoints}}分</view>
			</view>
			<view v-else>
				<view>日期筛选下新增的积分：{{page.statistics.increasePoints}}分</view>
				<view>日期筛选下扣减的积分：{{page.statistics.deductPoints}}分</view>
			</view>
		</view>
		<view>
			<uni-list>
				<uni-list-item v-for="item in page.list" :key="item.id" @click="handleRecordClick(item)" clickable>
					<template v-slot:body>
						<view style="width: 100%;">
							<uni-row>
								<uni-col :span="18">{{item.source}}</uni-col>
								<uni-col :span="6">
									<view style="text-align: right;">
										<text>{{item.points > 0 ? '+' : ''}}</text>{{item.points}}分
									</view>
								</uni-col>
							</uni-row>
							<uni-row>
								<view>{{item.createTime}}</view>
							</uni-row>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
			<view>
				<uni-load-more :status="pointsListStatus" />
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

	const pointsListStatus = ref('more')

	const showCurrentMonth = ref(true)

	const page = reactive({
		dto: {
			createStartTime: '',
			createEndTime: '',
			currentPage: 1,
			pageSize: 20
		},
		range: ['', ''],
		list: [],
		statistics: {},
		totalPoints: 0
	})

	onShow(() => {
		initPage()
		searchTotalPonts()
	})
	
	function searchTotalPonts() {
		http.get('/points-service/total/getPointsBalance')
			.then(res => {
				page.totalPoints = res.data
			})
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
			http.post('/points-service/records/statistics', page.dto)
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
			http.post('/points-service/records/page', page.dto)
				.then(res => {
					const data = res.data
					if (data.records && data.records.length == page.dto.pageSize) {
						pointsListStatus.value = 'more'
					} else {
						pointsListStatus.value = 'noMore'
					}
					page.list = [...page.list, ...data.records]
				})
				.catch(error => {
					pointsListStatus.value = 'more'
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
		page.dto.createStartTime = page.range[0]
		page.dto.createEndTime = page.range[1]
		pointsListStatus.value = 'loading'
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
			url: '/pages/points/points-detail?id=' + item.id
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