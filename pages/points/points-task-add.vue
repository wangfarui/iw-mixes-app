<!-- 新建积分任务 -->
<template>
	<view>
		<view class="example-body" style="margin: 10px 0;">
			<uni-row>
				<uni-col :span="6">
					<span>任务名称:</span>
				</uni-col>
				<uni-col :span="18">
					<uni-easyinput v-model="formData.taskName" maxlength="64"></uni-easyinput>
				</uni-col>
			</uni-row>
		</view>
		<view class="example-body" style="margin: 10px 0;font-size: 20px;">
			<uni-row>
				<uni-col :span="6">
					<p style="font-size: 16px;">任务积分:</p>
				</uni-col>
				<uni-col :span="18">
					<input
						style="font-size: 24px; display: inline-block; vertical-align: middle; padding: 10px; margin: 0; line-height: 1; width: 100; height: 40px; border: 2px solid #eee; border-radius: 4px;"
						v-model="formData.taskPoints" placeholder="请输入积分数量" />
				</uni-col>
			</uni-row>
		</view>
		<view style="margin: 10px 20px">
			<button type="primary" @click="saveRecord">保存</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue'

	import http from '@/api/request.js'

	import {
		onShow
	} from '@dcloudio/uni-app'

	const formData = ref({})


	onShow(() => {
		initFormData()
	})

	function initFormData() {
		formData.value = {
			taskName: '',
			taskPoints: ''
		}
	}

	function saveRecord() {
		if (formData.value.taskName == undefined || formData.value.taskName === '') {
			uni.showToast({
				icon: 'none',
				title: `积分名称不能为空`
			})
			return
		}
		if (formData.value.taskPoints == undefined || formData.value.taskPoints === '') {
			uni.showToast({
				icon: 'none',
				title: `积分不能为空`
			})
			return
		}

		http.post('/points-service/task/add', formData.value)
			.then(res => {
				uni.showToast({
					icon: 'success',
					title: `保存成功`
				})
				uni.navigateBack()
			})
	}
</script>

<style lang="scss">
	.example-body {
		// width: 750rpx;
		padding: 0px 30px;
	}
</style>