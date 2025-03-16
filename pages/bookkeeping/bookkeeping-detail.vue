<template>
	<view>
		 <view class="container">
		    <!-- 记录详情 -->
		    <view class="record-card">
		      <view class="item">
		        <text class="label">时间</text>
		        <text class="value">{{ detail.recordTime }}</text>
		      </view>
		      <view class="item">
		        <text class="label">类型</text>
		        <text class="value">{{ detail.recordCategory == '2' ? '收入' : '支出' }}</text>
		      </view>
			  <view class="item">
			    <text class="label">来源</text>
			    <text class="value">{{ detail.recordSource }}</text>
			  </view>
		      <view class="item">
		        <text class="label">金额</text>
		        <text class="value">{{ detail.amount }}</text>
		      </view>
		      <view class="item">
		        <text class="label">分类</text>
		        <text class="value">{{dictStore.getDictNameByCode(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TYPE, detail.recordType)}}</text>
		      </view>
		      <view class="item">
		        <text class="label">标签</text>
		        <text class="value">
					<text v-for="(item, index) in detail.recordTags">
						{{ index != 0 ? '、' : ''}}
						{{ dictStore.getDictNameById(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TAG, item) }}
					</text>
				</text>
		      </view>
		      <view class="item">
		        <text class="label">备注</text>
		        <text class="value">{{ detail.remark }}</text>
		      </view>
		      <view class="item">
		        <text class="label">订单编号</text>
		        <text class="value">{{ detail.orderNo }}</text>
		      </view>
		    </view>
		
		    <!-- 操作按钮 -->
		    <view class="bottom-actions">
		      <button class="edit-btn" @click="clickUpdateButton()">编辑</button>
		      <button class="delete-btn" @click="dialogToggle()">删除</button>
		    </view>
		</view>

		<view>
			<!-- 提示窗示例 -->
			<uni-popup ref="alertDialog" type="dialog">
				<uni-popup-dialog type="warn" cancelText="取消" confirmText="确认" title="提示" content="确认删除这笔记录？"
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
		onLoad,
		onShow
	} from '@dcloudio/uni-app'

	import {
		baseUrl
	} from '@/api/env.js'
	import http from '@/api/request.js'
	
	import {
		useDictStore
	} from "@/stores/dict.ts";
	
	const dictStore = useDictStore()

	const detail = ref({})
	const alertDialog = ref(null)
	const detailId = ref('')

	onLoad((option) => {
		detailId.value = option.id;
	})
	
	onShow(() => {
		http.get('/bookkeeping-service/bookkeepingRecords/detail?id=' + detailId.value)
			.then(res => {
				detail.value = res.data
			})
	})
	
	function clickUpdateButton() {
		uni.navigateTo({
			url: '/pages/bookkeeping/bookkeeping-action?id=' + detail.value.id
		});
	}
	
	function deleteRecord() {
		http.delete('/bookkeeping-service/bookkeepingRecords/delete?id=' + detail.value.id)
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
	.container {
	  background-color: #f5f5f5;
	  min-height: 100vh;
	}
	
	.record-card {
	  background-color: #fff;
	  margin: 16px;
	  padding: 0 16px;
	  margin-top: 0px;
	  border-radius: 8px;
	}
	
	.item {
	  display: flex;
	  align-items: center; /* 确保 label 和 value 在同一水平线上 */
	  padding: 10px 0;
	}
	
	.label {
	  flex: none; /* 不允许 label 伸缩 */
	  width: 80px; /* 固定 label 宽度 */
	  color: #888;
	  font-size: 16px; /* 与 value 保持一致 */
	}
	
	.value {
	  flex: 1; /* 让 value 占据剩余空间 */
	  font-size: 16px; /* 确保字体大小一致 */
	  font-weight: bold; /* 仅加粗 */
	  word-wrap: break-word; /* 允许换行 */
	  word-break: break-word; /* 长单词时换行 */
	}
	
	.bottom-actions {
	  display: flex;
	  justify-content: space-around;
	  padding: 12px;
	}
	
	.edit-btn,
	.delete-btn {
	  width: 40%;
	}
	.delete-btn {
	  background-color: red;
	  color: white;
	}
</style>