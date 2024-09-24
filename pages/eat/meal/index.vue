<template>
	<view>
		<view>
			<!-- <uni-section title="点餐记录" type="line"> -->
				<uni-list>
					<uni-list-item v-for="item in page.list" :key="item.id"
						@click="handleMealClick(item)" clickable>
						<template v-slot:body>
							<view class="item">
								<uni-row class="demo-uni-row">
									<view>用餐日期：{{isToday(item.mealDate) ? '今天' : item.mealDate}}</view>
								</uni-row>
								<uni-row>
									<view>用餐时间：{{dictStore.getDictNameByCode(dictStore.dictTypeEnum.EAT_MEAL_TIME, item.mealTime)}}</view>
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
	import {
		useDictStore
	} from "@/stores/dict.ts";

	const dictStore = useDictStore()

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

	function searchPage() {
		mealListStatus.value = 'loading'
		http.post('/eat-service/meal/page', page.dto)
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
	
	function isToday(dateString) {
	  const today = new Date();
	  const date = new Date(dateString);
	 
	  return (
	    date.getDate() === today.getDate() &&
	    date.getMonth() === today.getMonth() &&
	    date.getFullYear() === today.getFullYear()
	  );
	}
	
	function handleMealClick(item) {
		uni.navigateTo({
			url: '/pages/eat/meal/meal-detail?id=' + item.id
		});
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