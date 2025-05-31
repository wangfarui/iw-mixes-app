<!-- 任务计划页面 -->
<template>
	<view class="container">
		<!-- 搜索区域 -->
		<view class="search-box">
			<view class="search-row">
				<uni-search-bar
					v-model="searchForm.taskName"
					placeholder="请输入任务名称"
					@confirm="search"
					@clear="search"
					class="search-input"
					cancelButton="false"
				/>
				<view class="status-filter">
					<uni-data-select
						v-model="searchForm.status"
						:localdata="statusOptions"
						@change="search"
					/>
				</view>
			</view>
		</view>
		
		<!-- 列表区域 -->
		<view class="list-box">
			<view class="list-item" v-for="(item, index) in list" :key="index" @longpress="handleLongPress(item)">
				<view class="item-header">
					<text class="task-name">{{item.taskName}}</text>
					<text :class="['status-tag', item.status === 1 ? 'status-active' : 'status-inactive']">
						{{item.status === 1 ? '启用' : '禁用'}}
					</text>
				</view>
				<view class="item-content">
					<view class="date-item">
						<text class="label">计划日期：</text>
						<text class="value">{{item.planDate}}</text>
					</view>
					<view class="date-item">
						<text class="label">下次生成日期：</text>
						<text class="value">{{item.nextPlanDate}}</text>
					</view>
				</view>
			</view>
			
			<!-- 加载更多提示 -->
			<view class="loading-more" v-if="list.length > 0">
				<text v-if="loading">加载中...</text>
				<text v-else-if="!hasMore">没有更多数据了</text>
			</view>
		</view>
		
		<!-- 分页组件 -->
		<view class="pagination-box">
			<uni-pagination
				:total="total"
				:pageSize="pageSize"
				:current="currentPage"
				@change="handlePageChange"
			/>
		</view>
		
		<!-- 添加按钮 -->
		<view class="add-btn" @click="navigateToAdd">
			<uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
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
		onShow,
		onPullDownRefresh,
		onReachBottom
	} from '@dcloudio/uni-app'

	const list = ref([])
	const total = ref(0)
	const currentPage = ref(1)
	const pageSize = ref(10)
	const loading = ref(false)
	const hasMore = ref(true)

	const searchForm = reactive({
		taskName: '',
		status: ''
	})

	const statusOptions = [
		{ value: '', text: '全部状态' },
		{ value: '1', text: '启用' },
		{ value: '0', text: '禁用' }
	]

	onShow(() => {
		loadTaskPlanList()
	})

	// 下拉刷新
	onPullDownRefresh(() => {
		currentPage.value = 1
		loadTaskPlanList().then(() => {
			uni.stopPullDownRefresh()
		})
	})

	// 上拉加载更多
	onReachBottom(() => {
		if (hasMore.value && !loading.value) {
			currentPage.value++
			loadTaskPlanList(true)
		}
	})

	async function loadTaskPlanList(isLoadMore = false) {
		if (loading.value) return
		
		loading.value = true
		const params = {
			taskName: searchForm.taskName,
			status: searchForm.status,
			currentPage: currentPage.value,
			pageSize: pageSize.value
		}
		
		try {
			const res = await http.post('/bookkeeping-service/points/task/plan/page', params)
			const { records, total: totalCount } = res.data
			
			if (isLoadMore) {
				list.value = [...list.value, ...records]
			} else {
				list.value = records
			}
			
			total.value = totalCount
			hasMore.value = list.value.length < totalCount
		} catch (error) {
			uni.showToast({
				icon: 'error',
				title: '加载失败'
			})
		} finally {
			loading.value = false
		}
	}

	function search() {
		currentPage.value = 1
		loadTaskPlanList()
	}

	function handlePageChange(e) {
		currentPage.value = e.current
		loadTaskPlanList()
	}

	function handleLongPress(item) {
		const itemList = [
			'编辑',
			item.status === 1 ? '禁用' : '启用',
			'删除'
		]
		uni.showActionSheet({
			itemList,
			success: (res) => {
				if (res.tapIndex === 0) {
					handleEdit(item)
				} else if (res.tapIndex === 1) {
					handleUpdateStatus(item)
				} else if (res.tapIndex === 2) {
					handleDelete(item)
				}
			}
		})
	}

	function handleUpdateStatus(item) {
		const newStatus = item.status === 1 ? 0 : 1
		http.put('/bookkeeping-service/points/task/plan/updateStatus', {
			id: item.id,
			status: newStatus
		}).then(() => {
			uni.showToast({
				icon: 'success',
				title: newStatus === 1 ? '已启用' : '已禁用'
			})
			loadTaskPlanList()
		}).catch(() => {
			uni.showToast({
				icon: 'error',
				title: '操作失败'
			})
		})
	}

	function handleEdit(item) {
		uni.navigateTo({
			url: `/pagesPoints/points/task-plan-add?id=${item.id}`
		})
	}

	function handleDelete(item) {
		uni.showModal({
			content: `是否删除【${item.taskName}】任务计划？`,
			success: function (res) {
				if (res.confirm) {
					http.delete(`/bookkeeping-service/points/task/plan/delete?id=${item.id}`)
						.then(() => {
							uni.showToast({
								icon: 'success',
								title: '删除成功'
							})
							loadTaskPlanList()
						})
				}
			}
		})
	}

	function navigateToAdd() {
		uni.navigateTo({
			url: '/pagesPoints/points/task-plan-add'
		})
	}
</script>

<style lang="scss">
	.container {
		padding: 20rpx;
	}

	.search-box {
		background-color: #fff;
		padding: 20rpx;
		border-radius: 10rpx;
		margin-bottom: 20rpx;
		
		.search-row {
			display: flex;
			align-items: center;
			gap: 20rpx;
			
			.search-input {
				flex: 1;
			}
			
			.status-filter {
				width: 200rpx;
				
				:deep(.uni-data-select) {
					width: 100%;
				}
			}
		}
	}

	.list-box {
		.list-item {
			background-color: #fff;
			border-radius: 10rpx;
			padding: 20rpx;
			margin-bottom: 20rpx;
			
			.item-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;
				
				.task-name {
					font-size: 32rpx;
					font-weight: bold;
				}
				
				.status-tag {
					padding: 4rpx 16rpx;
					border-radius: 20rpx;
					font-size: 24rpx;
					
					&.status-active {
						background-color: #e8f5e9;
						color: #4caf50;
					}
					
					&.status-inactive {
						background-color: #ffebee;
						color: #f44336;
					}
				}
			}
			
			.item-content {
				.date-item {
					display: flex;
					margin-bottom: 10rpx;
					
					.label {
						color: #666;
						width: 240rpx;
					}
					
					.value {
						color: #333;
					}
				}
			}
		}
		
		.loading-more {
			text-align: center;
			padding: 20rpx 0;
			color: #999;
			font-size: 24rpx;
		}
	}

	.pagination-box {
		background-color: #fff;
		padding: 20rpx;
		border-radius: 10rpx;
		margin-bottom: 20rpx;
		display: flex;
		justify-content: center;
	}

	.add-btn {
		position: fixed;
		right: 40rpx;
		bottom: 40rpx;
		width: 100rpx;
		height: 100rpx;
		background-color: #2196f3;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.15);
	}
</style>