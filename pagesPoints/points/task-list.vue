<!-- 任务列表 -->
<template>
	<view>
		<view class="container">
			<!-- 添加任务区域 -->
			<view class="add-task-section">
				<view class="input-group">
					<uni-easyinput
						v-model="taskName"
						placeholder="请输入任务名称"
						@confirm="handleAddTask"
					/>
					<button class="add-btn" @click="handleAddTask">添加</button>
				</view>
			</view>
			
			<!-- 待完成任务列表 -->
			<view class="task-section">
				<view class="section-title">待完成任务</view>
				<uni-list>
					<uni-list-item v-for="item in todoList" :key="item.id">
						<template v-slot:header>
							<view class="task-item" :class="{ 'task-complete': item.isCompleting }">
								<checkbox :checked="false" @tap="handleTodoCheck(item)" />
								<text class="task-name">{{item.taskName}}</text>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
			
			<!-- 已完成任务列表 -->
			<view class="task-section">
				<view class="section-title">已完成任务</view>
				<uni-list>
					<uni-list-item v-for="item in doneList" :key="item.id">
						<template v-slot:header>
							<view class="task-item done">
								<checkbox :checked="true" @tap="handleDoneCheck(item)" style="transform:scale(0.7)" color="#999" />
								<text class="task-name">{{item.taskName}}</text>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
				<view>
					<uni-load-more :status="loadMoreStatus" />
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, reactive } from 'vue'
	import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
	import http from '@/api/request.js'

	const taskName = ref('')
	const todoList = ref([])
	const doneList = ref([])
	const loadMoreStatus = ref('more')
	const page = reactive({
		currentPage: 1,
		pageSize: 10
	})

	// 获取待完成任务列表
	function getTodoList() {
		http.post('/bookkeeping-service/points/task/basics/list', {
			taskGroupId: 0
		}).then(res => {
			todoList.value = res.data.map(item => ({
				...item,
				isCompleting: false
			}))
		})
	}

	// 获取已完成任务列表
	function getDoneList() {
		loadMoreStatus.value = 'loading'
		http.get('/bookkeeping-service/points/task/basics/doneList?taskGroupId=0&currentPage=' + page.currentPage).then(res => {
			const data = res.data
			if (page.currentPage === 1) {
				doneList.value = data
			} else {
				doneList.value = [...doneList.value, ...data]
			}
			loadMoreStatus.value = data.length >= page.pageSize ? 'more' : 'noMore'
		}).catch(() => {
			loadMoreStatus.value = 'more'
		})
	}

	// 添加任务
	function handleAddTask() {
		if (!taskName.value.trim()) {
			uni.showToast({
				title: '请输入任务名称',
				icon: 'none'
			})
			return
		}
		
		http.post('/bookkeeping-service/points/task/basics/add', {
			taskGroupId: 0,
			taskName: taskName.value
		}).then(() => {
			taskName.value = ''
			getTodoList()
		})
	}

	// 待完成任务勾选
	function handleTodoCheck(item) {
		// 设置动画状态
		item.isCompleting = true
		
		// 等待动画完成后执行接口调用
		setTimeout(() => {
			http.put('/bookkeeping-service/points/task/basics/updateStatus', {
				id: item.id,
				taskStatus: 1
			}).then(() => {
				// 从待完成列表中移除
				const index = todoList.value.findIndex(task => task.id === item.id)
				if (index > -1) {
					todoList.value.splice(index, 1)
				}
				// 添加到已完成列表开头
				doneList.value.unshift(item)
			})
		}, 300) // 动画持续时间为300ms
	}

	// 已完成任务取消勾选
	function handleDoneCheck(item) {
		http.put('/bookkeeping-service/points/task/basics/updateStatus', {
			id: item.id,
			taskStatus: 0
		}).then(() => {
			// 从已完成列表中移除
			const index = doneList.value.findIndex(task => task.id === item.id)
			if (index > -1) {
				doneList.value.splice(index, 1)
			}
			// 刷新待完成列表
			getTodoList()
		})
	}

	// 初始化页面
	function initPage() {
		page.currentPage = 1
		doneList.value = []
		getTodoList()
		getDoneList()
	}

	onPullDownRefresh(() => {
		initPage()
	})

	onReachBottom(() => {
		if (loadMoreStatus.value === 'more') {
			page.currentPage++
			getDoneList()
		}
	})

	onShow(() => {
		initPage()
	})
</script>

<style>
	.container {
		padding: 10px;
	}
	.add-task-section {
		margin-bottom: 10px;
		background-color: #fff;
		padding: 10px;
		border-radius: 5px;
	}
	.input-group {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.add-btn {
		font-size: 12px;
		padding: 2px 8px;
		height: 28px;
		line-height: 24px;
		background-color: #007aff;
		color: #fff;
		border-radius: 4px;
	}
	.task-section {
		margin-bottom: 10px;
		background-color: #fff;
		padding: 10px;
		border-radius: 5px;
	}
	.section-title {
		font-size: 16px;
		font-weight: bold;
		margin-bottom: 10px;
	}
	.task-item {
		display: flex;
		align-items: center;
		gap: 10px;
		transition: all 0.3s ease;
	}
	.task-complete {
		opacity: 0;
		transform: translateX(20px);
	}
	.task-name {
		flex: 1;
	}
	.done {
		color: #999;
	}
</style> 