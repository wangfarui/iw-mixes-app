<!-- 记账 -->
<template>
	<view>
		<view>
			<uni-section v-if="isUpdateForm" title="表单状态" type="line">
				<view class="example-body" style="color: red">
					当前为编辑状态
				</view>
			</uni-section>
			
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
				<view v-if="formData.recordCategory === 2" class="example-body" style="margin: 10px 0;">
					<uni-row>
						<uni-col :span="6">
							<p style="font-size: 16px;">激励记录:</p>
						</uni-col>
						<uni-col :span="18">
							<switch :checked="isExcitationRecord" @change="switchExcitationRecord"
								style="transform:scale(0.8)" />
						</uni-col>
					</uni-row>
				</view>
				<view v-if="formData.recordCategory === 1" class="example-body" style="margin: 10px 0;">
					<uni-row>
						<uni-col :span="6">
							<p style="font-size: 16px;">不计入统计:</p>
						</uni-col>
						<uni-col :span="18">
							<switch :checked="isNotStatistics" @change="switchNotStatistics"
								style="transform:scale(0.8)" />
						</uni-col>
					</uni-row>
				</view>
			</uni-section>
			<uni-section title="分类" type="line">
				<view class="example-body">
					<uni-data-select v-model="formData.recordType"
						:localdata="dictStore.getDictDataWithDataSelectCode(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TYPE)">
					</uni-data-select>
				</view>
			</uni-section>
			<uni-section title="标签" type="line">
				<view class="example-body">
					<uni-data-checkbox multiple v-model="formData.recordTags"
						:localdata="dictStore.getDictDataWithDataSelectId(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TAG)"></uni-data-checkbox>
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

	import http from '@/api/request.js'

	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app'

	import {
		useDictStore
	} from "@/stores/dict.ts";

	const dictStore = useDictStore()
	const items = ['支出', '收入']
	const formData = ref({}) // 记账表单数据
	const current = ref(0) // 当前所选的记录类型 对应items下表
	const toDayRecords = ref([]) // 今日记账记录列表
	const toDayConsume = ref(0) // 今日总消费
	const isExcitationRecord = ref(false) // 是否为激励记录
	const isNotStatistics = ref(false) // 是否不计入统计
	const isUpdateForm = ref(false) // 是否为编辑表单
	const updateFormId = ref('')
	
	onLoad((option) => {
		console.log(option)
		if (option.id) {
			isUpdateForm.value = true
			updateFormId.value = option.id
		}
	})

	onShow(() => {
		initFormData()
		loadTodayConsume()
	})

	function initFormData() {
		console.log(isUpdateForm.value);
		if (isUpdateForm.value) {
			http.get('/bookkeeping-service/bookkeepingRecords/detail?id=' + updateFormId.value)
				.then(res => {
					isExcitationRecord.value = res.data.isExcitationRecord == 1
					isNotStatistics.value = res.data.isStatistics == 0
					formData.value = res.data			
				})
		} else {
			isExcitationRecord.value = false
			formData.value = {
				recordDate: '',
				recordCategory: current.value + 1,
				recordSource: '',
				amount: '',
				recordType: '',
				remark: '',
				recordTags: [],
				isStatistics: ''
			}
		}
	}

	function loadTodayConsume() {
		http.post('/bookkeeping-service/bookkeepingRecords/list', {})
			.then(res => {
				toDayRecords.value = res.data
				if (res.data != null) {
					toDayConsume.value = res.data.reduce((sum, item) => {
						// 先将金额放大100倍，避免小数运算精度问题，然后相加，最后再除以100
						if (item.recordCategory == 2) {
							return Math.round((sum - item.amount) * 100) / 100;
						}
						return Math.round((sum + item.amount) * 100) / 100;
					}, 0);
				}
			})
	}

	function switchExcitationRecord() {
		isExcitationRecord.value = !isExcitationRecord.value
	}

	function switchNotStatistics() {
		isNotStatistics.value = !isNotStatistics.value
	}

	function onClickItem(e) {
		current.value = e.currentIndex
		formData.value.recordCategory = current.value + 1
	}

	function saveRecord() {
		if (formData.value.amount == undefined || formData.value.amount === '') {
			uni.showToast({
				icon: 'none',
				title: `记账金额不能为空`
			})
			return
		}

		if (isExcitationRecord.value) {
			formData.value.isExcitationRecord = 1
		}
		formData.value.isStatistics = isNotStatistics.value ? 0 : 1

		let url = '/bookkeeping-service/bookkeepingRecords/add';
		if (isUpdateForm.value) {
			url = '/bookkeeping-service/bookkeepingRecords/update';
		}
		const method = isUpdateForm.value ? 'put' : 'post';
		http.request(url, method, formData.value)
			.then(res => {
				uni.showToast({
					icon: 'success',
					title: `保存成功`
				})
				if (isUpdateForm.value) {
					// 返回上一页
					uni.navigateBack({})
				} else {
					initFormData()
					loadTodayConsume()
				}
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