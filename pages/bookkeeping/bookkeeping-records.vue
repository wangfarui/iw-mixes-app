<template>
	<view>
		<view>
			<!-- <uni-section title="点餐记录" type="line"> -->
			<uni-list>
				<uni-list-item v-for="item in page.list" :key="item.id" @click="handleMealClick(item)" clickable>
					<template v-slot:body>
						<view style="width: 100%;">
							<uni-row>
								<uni-col :span="18">{{formatSourceText(item)}}</uni-col>
								<uni-col :span="6">
									<view style="text-align: right;">{{item.recordCategory == '1' ? '-' : ''}}{{item.amount}}元</view>
								</uni-col>
							</uni-row>
							<uni-row>
								<view>{{item.recordTime}}</view>
							</uni-row>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
			<!-- </uni-section> -->
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

	const page = reactive({
		dto: {
			currentPage: 1,
			pageSize: 10
		},
		list: []
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

	function searchPage() {
		mealListStatus.value = 'loading'
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

	}

	function handleMealClick(item) {
		console.log("记录:" + item);
	}

	function initPage() {
		page.dto.currentPage = 1
		page.list = []
		searchPage()
	}

	onPullDownRefresh(() => {
		initPage()
	})

	// 上拉加载更多
	onReachBottom(() => {
		page.dto.currentPage++
		searchPage()
	})
</script>

<style>

</style>