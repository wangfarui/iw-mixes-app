<template>
	<view>
		<uni-row>
			<uni-col :span="8">记账日期</uni-col>
			<uni-col :span="16">{{recordDetail.recordDate}}</uni-col>
		</uni-row>

		<uni-row>
			<uni-col :span="8">
				<span v-if="recordDetail.recordCategory === 1">支出项目:</span>
				<span v-if="recordDetail.recordCategory === 2">收入来源:</span>
			</uni-col>
			<uni-col :span="16">{{recordDetail.recordSource}}</uni-col>
		</uni-row>

		<uni-row>
			<uni-col :span="8">记账金额</uni-col>
			<uni-col :span="16">{{recordDetail.amount}}</uni-col>
		</uni-row>

		<uni-row>
			<uni-col :span="8">分类</uni-col>
			<uni-col :span="16">{{dictStore.getDictNameByCode(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TYPE, recordDetail.recordType)}}</uni-col>
		</uni-row>
		
		<uni-row>
			<uni-col :span="4">标签</uni-col>
			<uni-row>
				<uni-tag v-for="item in recordDetail.recordTags" :circle="true"
				:text="dictStore.getDictNameById(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TAG, item)" 
				type="primary" size="small" style="margin-right: 5px;" />
			</uni-row>
		</uni-row>

		<uni-row>
			<uni-col :span="8">备注</uni-col>
			<uni-col :span="16">{{recordDetail.remark}}</uni-col>
		</uni-row>

		<view style="margin: 10px 20px">
			<button class="button popup-warn" @click="dialogToggle()">
				<text class="button-text warn-text">删除</text>
			</button>
		</view>

		<view>
			<!-- 提示窗示例 -->
			<uni-popup ref="alertDialog" type="dialog">
				<uni-popup-dialog type="warn" cancelText="取消" confirmText="确认" title="删除提示" content="是否删除这笔记录？"
					@confirm="deleteRecord()" ></uni-popup-dialog>
			</uni-popup>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue'

	import {
		onLoad
	} from '@dcloudio/uni-app'

	import {
		baseUrl
	} from '@/api/env.js'
	import http from '@/api/request.js'
	
	import {
		useDictStore
	} from "@/stores/dict.ts";
	
	const dictStore = useDictStore()

	const recordDetail = ref({})
	const alertDialog = ref(null);

	onLoad((option) => {
		http.get('/bookkeeping-service/bookkeepingRecords/detail?id=' + option.id)
			.then(res => {
				recordDetail.value = res.data
			})
	})
	
	function deleteRecord() {
		http.delete('/bookkeeping-service/bookkeepingRecords/delete?id=' + recordDetail.value.id)
			.then(res => {
				uni.navigateBack({});
			})
		alertDialog.value.close();
	}

	function dialogToggle() {
		alertDialog.value.open();
	}
</script>

<style lang="scss">
	.button {
		align-items: center;
		justify-content: center;
		flex: 1;
		height: 35px;
		margin: 0 5px;
		border-radius: 5px;
	}

	.popup-warn {
		color: #fff;
		background-color: #faecd8;
	}

	.warn-text {
		color: #e6a23c;
	}
</style>