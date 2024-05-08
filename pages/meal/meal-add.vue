<template>
	<view class="meal-form">
		<uni-section class="mb-10" title="基础信息">
			<uni-forms ref="baseForm" :rules="rules" :modelValue="formData">
				<uni-forms-item label="用餐日期" required>
					<uni-datetime-picker type="date" return-type="date" v-model="formData.mealDate" />
				</uni-forms-item>
				<uni-forms-item label="用餐时间" required>
					<uni-data-checkbox v-model="formData.mealTime" :localdata="mealTimeArray" />
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
			<uni-grid :column="4" :highlight="true" @change="dishesChange">
				<uni-grid-item v-for="(item, index) in formData.mealMenuList" :index="index" :key="index">
					<view class="grid-item-box" style="background-color: #fff;justify-content: center;
    align-items: center;text-align: center;">
						<view v-if="item.dishesUrl != undefined && item.dishesUrl != ''">
							<image :src="item.dishesUrl" style="height: 55px;width: 55px;" />
						</view>
						<view style=""><text class="text">{{item.dishesName}}</text></view>
					</view>
				</uni-grid-item>
			</uni-grid>
		</uni-section>

		<view class="meal-form-button">
			<button type="primary" @click="formSubmit()">提交</button>
			<button type="default" @click="formReset()">重置</button>
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
		toRefs
	} from 'vue';

	const nowDate = ref()

	const formData = ref({
		"mealDate": new Date(),
		"mealTime": '0',
		"diners": '0',
		"remark": '',
		"mealMenuList": [{
				"dishesUrl": 'https://itwray-bucket.oss-cn-wuhan-lr.aliyuncs.com/img/20240419173545.png',
				"dishesName": '菜1'
			},
			{
				"dishesUrl": 'https://itwray-bucket.oss-cn-wuhan-lr.aliyuncs.com/img/20240419173545.png',
				"dishesName": '菜2'
			},
			{
				"dishesName": '菜3'
			},
			{
				"dishesUrl": 'https://itwray-bucket.oss-cn-wuhan-lr.aliyuncs.com/img/20240419173545.png',
				"dishesName": '菜4'
			},
			{
				"dishesUrl": 'https://itwray-bucket.oss-cn-wuhan-lr.aliyuncs.com/img/20240419173545.png',
				"dishesName": '菜5'
			}
		]
	})

	const mealTimeArray = ref([{
		text: '任意时间',
		value: 0
	}, {
		text: '早餐',
		value: 1
	}, {
		text: '午餐',
		value: 2
	}, {
		text: '晚餐',
		value: 3
	}])

	const rules = ref({
		mealDate: {
			rules: [{
				required: true,
				errorMessage: '用餐日期不能为空'
			}]
		},
		dinners: {
			rules: [{
				required: true,
				errorMessage: '用餐人数不能为空'
			}, {
				format: 'number',
				errorMessage: '用餐人数只能输入数字'
			}]
		}
	})

	onMounted(() => {
		nowDate.value = getDate()
	})

	function bindDateChange(e) {
		nowDate.value = e.detail.value
	}

	function getDate() {
		const date = new Date();
		let year = date.getFullYear();
		let month = date.getMonth() + 1;
		let day = date.getDate();

		month = month > 9 ? month : '0' + month;
		day = day > 9 ? day : '0' + day;
		return `${year}-${month}-${day}`;
	}

	function formSubmit() {

		console.log(formData.value.mealDate);
		// toRefs[ref].validate().then(res => {
		// 	console.log('success', res);
		// 	uni.showToast({
		// 		title: `校验通过`
		// 	})
		// }).catch(err => {
		// 	console.log('err', err);
		// })
	}

	function formReset(e) {
		console.log('清空数据')
	}

	function dishesChange(e) {
		console.log(e);
	}
</script>

<style lang="scss">
	.meal-form-button button {
		margin: 10px;
	}

	.meal-form {
		padding: 15px;
		background-color: #fff;
	}

	.segmented-control {
		margin-bottom: 15px;
	}

	.button-group {
		margin-top: 15px;
		display: flex;
		justify-content: space-around;
	}

	.form-item {
		display: flex;
		align-items: center;
	}

	.button {
		display: flex;
		align-items: center;
		height: 35px;
		margin-left: 10px;
	}
</style>