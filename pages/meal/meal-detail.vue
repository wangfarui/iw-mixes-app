<template>
	<view class="container">
		<view class="content">
			<uni-section class="mb-10" title="基础信息" titleFontSize="16px">
				<view>
					<uni-row>
						<view>用餐日期：{{mealDetail.mealDate}}</view>
					</uni-row>
					<uni-row>
						<view>用餐时间：{{mealDetail.mealTimeDesc}}</view>
					</uni-row>
					<uni-row>
						<view>用餐人数：{{mealDetail.diners}}</view>
					</uni-row>
					<uni-row>
						<view>备注：{{mealDetail.remark}}</view>
					</uni-row>
				</view>
			</uni-section>
			<uni-section class="mb-10" title="菜品信息">
				<view>
					<view v-if="mealDetail.mealMenuList && mealDetail.mealMenuList.length > 0">
						<view v-for="(dish, index) in mealDetail.mealMenuList" :key="dish.id"
							@click="intoDishDetail(dish.dishesId)">
							<uni-row class="">
								<p class='dishesName'>{{index + 1}}. {{ dish.dishesName }}</p>
							</uni-row>
						</view>
					</view>
					<view v-else>
						没有点菜哦~只能下单全看备注吃啥了
					</view>
				</view>
			</uni-section>
			<uni-popup ref="alertDialog" type="dialog">
				<uni-popup-dialog type="warn" cancelText="取消" confirmText="确认" title="提示" content="确认删除订单吗"
					@confirm="dialogConfirm()">
				</uni-popup-dialog>
			</uni-popup>
		</view>
		<view class="footer">
			<button type="default" @click="deleteMeal()">删除订单</button>
		</view>
	</view>

</template>

<script setup>
	import {
		computed,
		onMounted,
		reactive,
		ref
	} from 'vue';

	import {
		onLoad
	} from '@dcloudio/uni-app'
	import http from '@/api/request.js'

	const mealDetail = ref({})
	const alertDialog = ref(null)

	onLoad((option) => {
		http.get('/meal/detail?id=' + option.id)
			.then(res => {
				mealDetail.value = res.data
			})
	})

	const intoDishDetail = (dishId) => {
		uni.navigateTo({
			url: '/pages/dishes/dishes-detail?id=' + dishId
		});
	}

	const deleteMeal = () => {
		alertDialog.value.open()
	}

	function dialogConfirm() {
		http.delete('/meal/delete?id=' + mealDetail.value.id)
			.then(res => {
				uni.switchTab({
					url: '/pages/meal/meal'
				});
			})
	}
</script>

<style>
	.dishesName {
		font-weight: normal;
		font-size: 18px;
		margin: 10px 0;
	}

	.container {
		padding: 10px;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.content {
		flex: 1;
	}

	.footer {
		position: sticky;
		bottom: 0;
		padding: 10px;
		background-color: #f0f0f0;
	}
</style>