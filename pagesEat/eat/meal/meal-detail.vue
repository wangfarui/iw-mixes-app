<template>
	<view class="container">
		<view class="content">
			<uni-section class="mb-10" title="基础信息" titleFontSize="18px">
				<view style="font-size: 16px;">
					<uni-row>
						<view>用餐日期：{{mealDetail.mealDate}}</view>
					</uni-row>
					<uni-row>
						<view>用餐时间：{{dictStore.getDictNameByCode(dictStore.dictTypeEnum.EAT_MEAL_TIME, mealDetail.mealTime)}}</view>
					</uni-row>
					<uni-row>
						<view>用餐人数：{{mealDetail.diners}}</view>
					</uni-row>
					<uni-row>
						<view>备注：{{mealDetail.remark}}</view>
					</uni-row>
				</view>
			</uni-section>
			<uni-section class="mb-10" title="菜品信息" titleFontSize="18px">
				<view style="font-size: 16px;">
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
			<uni-section v-if="mealDetail.mealMenuList && mealDetail.mealMenuList.length > 0" class="mb-10"
				title="所需食材" titleFontSize="18px">
				<view style="font-size: 16px;margin-bottom: 10px;">
					需要采购的食材:
					<view v-for="(item, index) in dishesMaterialDetail.needPurchaseMaterialList" :key="index">
							<view class="col material-key" style="flex: 1;">
								{{item.materialName}}<text class="material-value">{{item.materialDosages.join('，')}}</text>
							</view>
					</view>
				</view>
				<view style="font-size: 16px;">
					常用食材:
					<view v-for="(item, index) in dishesMaterialDetail.commonMaterialList" :key="index">
						<text>{{item}}</text>
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
	import {
		useDictStore
	} from "@/stores/dict.ts";
	
	const dictStore = useDictStore()

	const mealDetail = ref({})
	const dishesMaterialDetail = ref({})
	const alertDialog = ref(null)

	onLoad((option) => {
		http.get('/eat-service/meal/detail?id=' + option.id)
			.then(res => {
				mealDetail.value = res.data
			})
		http.get('/eat-service/meal/dishes/materialDetail?id=' + option.id)
			.then(res => {
				dishesMaterialDetail.value = res.data
			})
	})

	const intoDishDetail = (dishId) => {
		uni.navigateTo({
			url: '/pagesEat/eat/dishes/dishes-detail?id=' + dishId
		});
	}

	const deleteMeal = () => {
		alertDialog.value.open()
	}

	function dialogConfirm() {
		http.delete('/eat-service/meal/delete?id=' + mealDetail.value.id)
			.then(res => {
				uni.switchTab({
					url: '/pagesEat/eat/meal/index'
				});
			})
	}
</script>

<style>
	.dishesName {
		font-weight: normal;
		font-size: 18px;
		margin-bottom: 10px;
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
	
	.material-key {
		flex: 1;
		display: flex;
		align-items: center;
	}
	
	.material-key .material-value {
		margin-left: auto;
	}
</style>