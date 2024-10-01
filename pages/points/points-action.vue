<!-- 记账 -->
<template>
	<view>
		<view>
			<uni-section title="积分记录" type="line">
				<view class="example-body">
					<uni-segmented-control :current="current" :values="items" style-type="button" active-color="#007aff"
						@clickItem="onClickItem" />
				</view>
				<view class="example-body" style="margin: 10px 0;">
					<uni-row>
						<uni-col :span="6">
							<span>积分来源:</span>
						</uni-col>
						<uni-col :span="18">
							<uni-easyinput v-model="formData.source" maxlength="255"></uni-easyinput>
						</uni-col>
					</uni-row>
				</view>
				<view class="example-body" style="margin: 10px 0;font-size: 20px;">
					<uni-row>
						<uni-col :span="6">
							<p style="font-size: 16px;">积分数量:</p>
						</uni-col>
						<uni-col :span="18">
							<input
								style="font-size: 24px; display: inline-block; vertical-align: middle; padding: 10px; margin: 0; line-height: 1; width: 100; height: 40px; border: 2px solid #eee; border-radius: 4px;"
								v-model="formData.inputPoints" placeholder="请输入积分" />
						</uni-col>
					</uni-row>
				</view>
			</uni-section>
			<uni-section title="备注" type="line">
				<view class="example-body">
					<uni-easyinput v-model="formData.remark" placeholder="请输入内容"></uni-easyinput>
				</view>
			</uni-section>
			<view style="margin: 10px 20px">
				<button type="primary" @click="saveRecord">保存</button>
			</view>
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

	const items = ['增加', '扣减']

	const formData = ref({})

	const current = ref(0)

	onShow(() => {
		initFormData()
	})

	function initFormData() {
		formData.value = {
			source: '',
			inputPoints: '',
			points: 0,
			remark: '',
		}
	}

	function onClickItem(e) {
		current.value = e.currentIndex
	}

	function saveRecord() {
		if (formData.value.points == undefined || formData.value.points === '') {
			uni.showToast({
				icon: 'none',
				title: `积分不能为空`
			})
			return
		}
		
		formData.value.points = current.value == 1 ? -formData.value.inputPoints : formData.value.inputPoints

		http.post('/points-service/records/add', formData.value)
			.then(res => {
				uni.showToast({
					icon: 'success',
					title: `保存成功`
				})
				initFormData()
			})
	}
</script>

<style lang="scss">
	.example-body {
		// width: 750rpx;
		padding: 0px 30px;
	}
</style>