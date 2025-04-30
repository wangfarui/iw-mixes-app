<template>
	<view>
		<uni-row>
			<uni-col :span="8">积分记录时间</uni-col>
			<uni-col :span="16">{{recordDetail.createTime}}</uni-col>
		</uni-row>
		
		<uni-row>
			<uni-col :span="8">积分来源</uni-col>
			<uni-col :span="16">{{recordDetail.source}}</uni-col>
		</uni-row>

		<uni-row>
			<uni-col :span="8">积分变动数量</uni-col>
			<uni-col :span="16">{{recordDetail.points > 0 ? '+' : ''}}{{recordDetail.points}}分</uni-col>
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

	const recordDetail = ref({})
	const alertDialog = ref(null);

	onLoad((option) => {
		http.get('/points-service/points/records/detail?id=' + option.id)
			.then(res => {
				recordDetail.value = res.data
			})
	})
	
	function deleteRecord() {
		http.delete('/points-service/points/records/delete?id=' + recordDetail.value.id)
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