<!-- 积分任务列表 -->
<template>
	<view>
		<uni-grid :column="4" :highlight="true">
			<uni-grid-item v-for="(item, index) in list" :index="index" :key="index">
				<view class="grid-item-box" style="background-color: #fff;" @click="clickTask(item)" @longpress="handleLongPress(item)">
					<view style="font-size: 16px; font-weight: bolder;">{{item.taskName}}</view>
					<text style="font-size: 12px; color: #999;">{{item.taskPoints > 0 ? '+' : ''}}{{item.taskPoints}}分</text>
				</view>
			</uni-grid-item>
			<uni-grid-item >
				<view class="grid-item-box" style="background-color: #fff;" @click="navigateToAdd()">
					<uni-icons type="plusempty" size="30"></uni-icons>
				</view>
			</uni-grid-item>
		</uni-grid>
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

	const list = ref([])

	onShow(() => {
		loadPointsTaskList()
	})

	function loadPointsTaskList() {
		http.get('/points-service/task/list')
			.then(res => {
				list.value = res.data
			})
	}
	
	function clickTask(item) {
		uni.showModal({
			content: '是否提交【' + item.taskName + '】任务',
			success: function (res) {
				if (res.confirm) {
					http.get('/points-service/task/submit?id=' + item.id)
						.then(res => {
							uni.showToast({
								icon: 'success',
								title: `提交成功`
							})
						})
				}
			}
		});
	}
	
	function handleLongPress(item) {
		uni.showModal({
			content: '是否删除【' + item.taskName + '】任务',
			success: function (res) {
				if (res.confirm) {
					http.delete('/points-service/task/delete?id=' + item.id)
						.then(res => {
							uni.showToast({
								icon: 'success',
								title: `删除成功`
							})
							loadPointsTaskList()
						})
				}
			}
		});
	}
	
	function navigateToAdd() {
		uni.navigateTo({
			url: '/pagesPoints/points/points-task-add'
		})
	}
</script>

<style lang="scss">
	.text {
		font-size: 16px;
		margin-top: 5px;
	}

	.grid-item-box {
		flex: 1;
		// position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 15px 0;
	}

	.grid-item-box-row {
		flex: 1;
		// position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 15px 0;
	}
</style>