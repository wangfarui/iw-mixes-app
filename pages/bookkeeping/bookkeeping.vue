<template>
	<view>
		<view>
			<uni-section title="记账日期" subTitle="为空时默认为当天" type="line">
				<view class="example-body">
					<uni-datetime-picker type="date" :clear-icon="false" v-model="formData.recordDate"
						return-type="string" />
				</view>
			</uni-section>

			<uni-section title="记账记录" type="line">
				<view class="example-body">
					<uni-segmented-control :current="current" :values="items" style-type="button" active-color="#007aff"
						@clickItem="onClickItem" />
				</view>
				<view class="example-body" style="margin: 10px 0;">
					<uni-row>
						<uni-col :span="6">
							<span v-if="formData.recordCategory === 1">支出项目:</span>
							<span v-if="formData.recordCategory === 2">收入来源:</span>
						</uni-col>
						<uni-col :span="18">
							<uni-easyinput v-model="formData.recordSource" maxlength="64"></uni-easyinput>
						</uni-col>
					</uni-row>
				</view>
				<view class="example-body" style="margin: 10px 0;font-size: 20px;">
					<uni-row>
						<uni-col :span="6">
							<p style="font-size: 16px;">记账金额(¥):</p>
						</uni-col>
						<uni-col :span="18">
							<input
								style="font-size: 24px; display: inline-block; vertical-align: middle; padding: 10px; margin: 0; line-height: 1; width: 100; height: 40px; border: 2px solid #eee; border-radius: 4px;"
								v-model="formData.amount" placeholder="请输入金额" />
						</uni-col>
					</uni-row>
				</view>
			</uni-section>
			<uni-section title="分类" type="line">
				<view class="example-body">
					<uni-data-select v-model="formData.recordType" :localdata="classify.range"
						@change="classifyChange"></uni-data-select>
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
		<view>
			<uni-section title="今日记录" type="line">
				<template v-slot:right>
					今日总消费：{{toDayConsume}} 元
				</template>
				<view>
					<uni-list>
						<uni-list-item v-for="(item, index) in toDayRecords" :key="item.id">
							<template v-slot:body>
								<view style="width: 100%;">
									<uni-row>
										<uni-col :span="18">{{formatSourceText(item)}}</uni-col>
										<uni-col :span="6">
											<view style="text-align: right;">
												{{item.recordCategory == '1' ? '-' : ''}}{{item.amount}}元
											</view>
										</uni-col>
									</uni-row>
									<uni-row>
										<view>{{item.recordTime}}</view>
									</uni-row>
								</view>
							</template>
						</uni-list-item>
					</uni-list>
				</view>

			</uni-section>
		</view>
	</view>

</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue'

	import {
		onShow
	} from '@dcloudio/uni-app'

	import {
		baseUrl
	} from '@/api/env.js'
	import http from '@/api/request.js'

	const items = ['支出', '收入']

	const formData = ref({
		recordDate: '',
		recordCategory: 1,
		recordSource: '',
		amount: '',
		recordType: '',
		remark: ''
	})

	const current = ref(0)

	const classify = reactive({
		range: [{
				value: 1,
				text: "餐饮美食"
			},
			{
				value: 2,
				text: "日用百货"
			},
			{
				value: 3,
				text: "交通出行"
			},
			{
				value: 4,
				text: "充值缴费"
			},
			{
				value: 5,
				text: "生活服务"
			},
			{
				value: 6,
				text: "其他"
			},
		]
	})

	const toDayRecords = ref([])

	const toDayConsume = ref(0)

	onShow(() => {
		http.post('/bookkeeping-service/records/list', {})
			.then(res => {
				toDayRecords.value = res.data
				if (res.data != null) {
					toDayConsume.value = res.data.reduce((sum, item) => {
						// 先将金额放大100倍，避免小数运算精度问题，然后相加，最后再除以100
						return Math.round((sum + item.amount) * 100) / 100;
					}, 0);
				}
			})
	})

	function onClickItem(e) {
		formData.value.recordCategory = e.currentIndex + 1
	}

	function classifyChange(e) {

	}

	function saveRecord() {
		if (formData.value.amount == undefined || formData.value.amount === '') {
			uni.showToast({
				icon: 'none',
				title: `记账金额不能为空`
			})
			return
		}

		http.post('/bookkeeping-service/records/add', formData.value)
			.then(res => {
				uni.redirectTo({
					url: '/pages/bookkeeping/bookkeeping-records'
				});
			})
	}

	function formatSourceText(item) {
		if (item.recordSource != '') {
			return item.recordSource;
		}
		return item.recordCategory == 2 ? '收入' : '消费';
	}
</script>

<style lang="scss">
	.example-body {
		// width: 750rpx;
		padding: 0px 30px;
	}
</style>