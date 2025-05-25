<template>
	<view class="container">
		<view class="content">
			<uni-section class="mb-10" title="基础信息">
				<uni-forms ref="baseForm" :modelValue="formData" :label-width="100">
					<uni-forms-item label="用餐日期" required>
						<uni-datetime-picker type="date" return-type="string" v-model="formData.mealDate" />
					</uni-forms-item>
					<uni-forms-item label="用餐时间" required>
						<uni-data-checkbox v-model="formData.mealTime" :localdata="dictStore.getDictDataWithDataSelectCode(dictStore.dictTypeEnum.EAT_MEAL_TIME)" />
					</uni-forms-item>
					<uni-forms-item label="用餐人数">
						<uni-easyinput type="number" v-model="formData.diners" placeholder="请输入用餐人数" />
					</uni-forms-item>
					<uni-forms-item label="备注">
						<uni-easyinput type="textarea" v-model="formData.remark" placeholder="请输入用餐备注" />
					</uni-forms-item>
				</uni-forms>
			</uni-section>
			<uni-section class="mb-10" title="菜品信息">
				<view v-if="cartStore.cartItems.length > 0">
					<view v-for="dish in cartStore.cartItems" :key="dish.id">
						<uni-row class="demo-uni-row">
							<uni-col :span="12">
								<view>
									<image :src="dish.dishesImage" :alt="dish.dishesName"
										style="width: 20vh;height: 20vh;" />
								</view>
							</uni-col>
							<uni-col :span="12">
								<view class='dishes'>
									<p class='dishesName'>{{ dish.dishesName }}</p>
									<p>难度系数: {{ dish.difficultyFactor }}</p>
									<p>用时: {{ dish.useTime }}分钟</p>
									<p>
										<uni-row>
											价格: ¥<text
												style="font-size: 16px;font-weight: bolder;">{{ dish.prices }}</text>
										</uni-row>
									</p>
								</view>
							</uni-col>
						</uni-row>
					</view>
				</view>
				<view v-else>
					还没有点菜哦~只能下单全看备注吃啥了
				</view>
			</uni-section>
		</view>

		<view class="footer">
			<uni-row>
				<uni-col :span="8">
					<view>
						<view>合计金额：</view>
						<view>¥{{cartStore.computedDishPrices()}}</view>
					</view>
				</uni-col>
				<uni-col :span="8">
					<view>
						<view>合计用时：</view>
						<view>{{cartStore.computedDishUseTime()}}分钟</view>
					</view>
				</uni-col>
				<uni-col :span="8">
					<view>
						<button type="primary" @click="submitCartOrder()">提交订单</button>
					</view>
				</uni-col>
			</uni-row>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		useCartStore
	} from '@/pagesEat/js/cart'
	import http from '@/api/request.js'
	import {
		useDictStore
	} from "@/stores/dict.ts";
	
	const dictStore = useDictStore()
	const cartStore = useCartStore()

	const formData = ref({})

	initFormData()

	function initFormData() {
		formData.value = {
			"mealDate": new Date(),
			"mealTime": 0,
			"diners": '1',
			"remark": '',
			"mealMenuList": []
		}
	}

	function submitCartOrder() {
		if (formData.value.mealDate == undefined || formData.value.mealDate === '') {
			uni.showToast({
				icon: 'none',
				title: `用餐日期不能为空`
			})
			return
		}
		if (formData.value.mealTime == undefined || formData.value.mealTime === '') {
			uni.showToast({
				icon: 'none',
				title: `用餐时间不能为空`
			})
			return
		}
		if (!isNumberInRange(formData.value.diners)) {
			uni.showToast({
				icon: 'none',
				title: `用餐人数格式有误`
			})
			return
		}

		// 清空菜单明细
		formData.value.mealMenuList = []
		if (cartStore.cartItems.length > 0) {
			cartStore.cartItems.forEach(item => {
				formData.value.mealMenuList.push({
					'dishesId': item.id,
					'dishesName': item.dishesName
				})
			})
		}

		http.post('/eat-service/eat/meal/add', formData.value)
			.then(res => {
				initFormData()
				cartStore.initCart()
				uni.switchTab({
					url: '/pages/menu'
				});
			})
	}

	function isNumberInRange(str) {
		// 使用正则表达式检查字符串是否是纯数字
		if (/^\d+$/.test(str)) {
			// 将字符串转换为数字
			const num = parseInt(str, 10);

			// 判断数字是否大于等于0且小于99
			if (num >= 0 && num < 99) {
				return true; // 字符串是纯数字且在范围内
			}
		}

		return false; // 字符串不是纯数字或不在范围内
	}
</script>

<style>
	.container {
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

	.mb-10 {
		font-size: 14px;
	}
</style>