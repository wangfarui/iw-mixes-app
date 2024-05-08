<template>
	<view>
		<view class="container">
			<button type="primary" @click="handleMealAdd">点餐</button>
		</view>
		<view>
			<uni-section title="点餐记录" type="line">
				<uni-list>
					<uni-list-item v-for="item in page.list" :key="item.id" :ellipsis="0" title="测试标题"
						@click="associativeClick(item)" clickable>
						<template v-slot:body>
							<view class="item">
								<uni-row class="demo-uni-row">
									<view>用餐日期：{{item.mealDate}}</view>
								</uni-row>
								<uni-row>
									<view>用餐时间：{{item.mealTime}}</view>
								</uni-row>
								<uni-row>
									<view>用餐人数：{{item.diners}}</view>
								</uni-row>
								<uni-row>
									<view>备注：{{item.remark}}</view>
								</uni-row>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</uni-section>
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
			pageSize: 5
		},
		list: []
	})

	onShow(() => {
		searchPage()
	})

	function searchPage() {
		mealListStatus.value = 'loading'
		http.post('/meal/page', page.dto)
			.then(res => {
				const data = res.data
				if (data.records && data.records.length > 0) {
					mealListStatus.value = 'more'
				} else {
					mealListStatus.value = 'noMore'
				}
				page.list = [...page.list, ...data.records]
				console.log(page.list);
			})
			.catch(error => {
				mealListStatus.value = 'more'
			})
			.finally(() => {
				uni.stopPullDownRefresh();
			});

	}

	function associativeClick(item) {
		console.log(item);
	}

	onPullDownRefresh(() => {
		console.log('refresh');
		page.dto.currentPage = 1
		page.list = []
		searchPage()
	})

	// 上拉加载更多
	onReachBottom(() => {
		page.dto.currentPage++
		searchPage()
	})

	function handleMealAdd() {
		// mealStore.initFormData()
		uni.navigateTo({
			url: '/pages/meal/meal-add'
		});
	}
</script>

<style>

</style>