<!-- 任务 -->
<template>
	<view class="task-container">
		<!-- 视图切换 -->
		<view class="view-switch">
			<view 
				:class="['switch-item', currentView === 'recent' ? 'active' : '']" 
				@tap="switchView('recent')"
			>最近任务</view>
			<view 
				:class="['switch-item', currentView === 'inbox' ? 'active' : '']" 
				@tap="switchView('inbox')"
			>收集箱</view>
			<view 
				:class="['switch-item', currentView === 'done' ? 'active' : '']" 
				@tap="switchView('done')"
			>已完成</view>
		</view>

		<!-- 滑动视图 -->
		<swiper 
			class="swiper-container" 
			:current="swiperCurrent" 
			@change="onSwiperChange"
			:duration="300"
			:circular="false"
			:disable-programmatic-animation="false"
		>
			<swiper-item>
				<scroll-view 
					scroll-y 
					class="swiper-scroll"
					:scroll-top="0"
					:show-scrollbar="true"
					:enhanced="true"
					:bounces="true"
				>
					<view class="task-list">
						<view 
							v-for="task in taskList" 
							:key="task.id" 
							class="task-item"
							@longpress="showActionSheet(task)"
						>
							<view class="task-content">
								<view class="task-name">{{ task.taskName }}</view>
								<view class="task-info">
									<view v-if="currentView === 'recent'" class="task-group">{{ task.taskGroupName }}</view>
									<view v-if="currentView === 'done'" class="task-group">{{ task.taskGroupName }}</view>
									<view v-if="task.deadlineDate && currentView !== 'done'" class="task-deadline">
										截止日期：{{ task.deadlineDate }}
									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
			<swiper-item>
				<scroll-view 
					scroll-y 
					class="swiper-scroll"
					:scroll-top="0"
					:show-scrollbar="true"
					:enhanced="true"
					:bounces="true"
				>
					<view class="task-list">
						<view 
							v-for="task in taskList" 
							:key="task.id" 
							class="task-item"
							@longpress="showActionSheet(task)"
						>
							<view class="task-content">
								<view class="task-name">{{ task.taskName }}</view>
								<view class="task-info">
									<view v-if="currentView === 'recent'" class="task-group">{{ task.taskGroupName }}</view>
									<view v-if="currentView === 'done'" class="task-group">{{ task.taskGroupName }}</view>
									<view v-if="task.deadlineDate && currentView !== 'done'" class="task-deadline">
										截止日期：{{ task.deadlineDate }}
									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
			<swiper-item>
				<scroll-view 
					scroll-y 
					class="swiper-scroll"
					:scroll-top="0"
					:show-scrollbar="true"
					:enhanced="true"
					:bounces="true"
				>
					<view class="task-list">
						<view 
							v-for="task in taskList" 
							:key="task.id" 
							class="task-item"
							@longpress="showActionSheet(task)"
						>
							<view class="task-content">
								<view class="task-name">{{ task.taskName }}</view>
								<view class="task-info">
									<view v-if="currentView === 'recent'" class="task-group">{{ task.taskGroupName }}</view>
									<view v-if="currentView === 'done'" class="task-group">{{ task.taskGroupName }}</view>
									<view v-if="task.deadlineDate && currentView !== 'done'" class="task-deadline">
										截止日期：{{ task.deadlineDate }}
									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>

		<!-- 快速添加任务 -->
		<view class="quick-add">
			<input 
				v-model="newTaskName" 
				placeholder="输入任务名称" 
				class="task-input"
			/>
			<picker 
				mode="date" 
				:value="newTaskDeadline" 
				@change="onDateChange"
				class="date-picker"
			>
				<view class="picker-text">
					{{ newTaskDeadline || '选择截止日期' }}
				</view>
			</picker>
			<button 
				class="add-btn" 
				@tap="addTask"
				:disabled="!newTaskName"
			>添加</button>
		</view>

		<!-- 积分设置对话框 -->
		<uni-popup ref="pointsPopup" type="dialog">
			<uni-popup-dialog
				title="设置积分"
				:before-close="true"
				@confirm="savePoints"
				@close="closePointsPopup"
				@cancel="closePointsPopup"
			>
				<view class="points-form">
					<view class="points-item">
						<text class="label">奖励积分：</text>
						<input 
							type="number" 
							v-model="pointsForm.rewardPoints" 
							class="points-input"
							placeholder="请输入正整数"
						/>
					</view>
					<view class="points-item">
						<text class="label">处罚积分：</text>
						<input 
							type="number" 
							v-model="pointsForm.punishPoints" 
							class="points-input"
							placeholder="请输入正整数"
						/>
					</view>
				</view>
			</uni-popup-dialog>
		</uni-popup>

		<!-- 删除确认对话框 -->
		<uni-popup ref="deletePopup" type="dialog">
			<uni-popup-dialog
				title="确认删除"
				content="确定要删除该任务吗？"
				:before-close="true"
				@confirm="confirmDelete"
				@close="closeDeletePopup"
				@cancel="closeDeletePopup"
			></uni-popup-dialog>
		</uni-popup>

		<!-- 截止日期设置对话框 -->
		<uni-popup ref="deadlinePopup" type="dialog">
			<uni-popup-dialog
				title="设置截止日期"
				:before-close="true"
				@confirm="saveDeadline"
				@close="closeDeadlinePopup"
				@cancel="closeDeadlinePopup"
				type="info"
			>
				<view class="deadline-form">
					<picker 
						mode="date" 
						:value="deadlineForm.deadlineDate" 
						@change="onDeadlineDateChange"
						class="date-picker"
					>
						<view class="picker-text">
							{{ deadlineForm.deadlineDate || '选择截止日期' }}
						</view>
					</picker>
				</view>
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
import { ref, onMounted } from 'vue'
import http from '@/api/request.js'

// 日期格式化方法
const formatDate = (date) => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

export default {
	setup() {
		const currentView = ref('recent')
		const swiperCurrent = ref(0)
		const taskList = ref([])
		const newTaskName = ref('')
		const newTaskDeadline = ref('')
		const pointsPopup = ref(null)
		const deletePopup = ref(null)
		const deadlinePopup = ref(null)
		const pointsForm = ref({
			taskId: null,
			rewardPoints: '',
			punishPoints: ''
		})
		const deadlineForm = ref({
			taskId: null,
			deadlineDate: ''
		})
		const currentTask = ref(null)

		// 滑动切换视图
		const onSwiperChange = (e) => {
			const index = e.detail.current
			swiperCurrent.value = index
			const views = ['recent', 'inbox', 'done']
			switchView(views[index])
		}

		// 切换视图
		const switchView = (view) => {
			currentView.value = view
			const views = ['recent', 'inbox', 'done']
			swiperCurrent.value = views.indexOf(view)
			if (view === 'recent') {
				fetchRecentTasks()
			} else if (view === 'inbox') {
				fetchInboxTasks()
			} else {
				fetchDoneTasks()
			}
		}

		// 显示操作菜单
		const showActionSheet = (task) => {
			const itemList = []
			if (currentView.value === 'done') {
				itemList.push('取消完成')
			} else {
				if (task.taskStatus === 0) {
					itemList.push('完成')
				}
				itemList.push('设置积分')
				itemList.push('设置截止日期')
				itemList.push('删除')
			}
			
			uni.showActionSheet({
				itemList,
				success: (res) => {
					if (currentView.value === 'done') {
						cancelCompleteTask(task)
					} else {
						if (task.taskStatus === 0 && res.tapIndex === 0) {
							completeTask(task)
						} else if (res.tapIndex === itemList.length - 1) {
							showDeleteConfirm(task)
						} else if (res.tapIndex === 1) {
							showPointsPopup(task)
						} else if (res.tapIndex === 2) {
							showDeadlinePopup(task)
						}
					}
				}
			})
		}

		// 显示删除确认框
		const showDeleteConfirm = (task) => {
			currentTask.value = task
			deletePopup.value.open()
		}

		// 确认删除
		const confirmDelete = () => {
			if (currentTask.value) {
				deleteTask(currentTask.value)
				deletePopup.value.close()
			} else {
				deletePopup.value.close()
			}
		}

		// 关闭删除确认框
		const closeDeletePopup = () => {
			currentTask.value = null
			deletePopup.value.close()
		}

		// 显示积分设置弹窗
		const showPointsPopup = async (task) => {
			try {
				const response = await http.get('/bookkeeping-service/task/relation/getByTaskId?taskId=' + task.id)
				pointsForm.value = {
					taskId: task.id,
					rewardPoints: response?.data?.rewardPoints || '',
					punishPoints: response?.data?.punishPoints || ''
				}
				pointsPopup.value.open()
			} catch (error) {
				uni.showToast({
					title: '获取积分失败',
					icon: 'none'
				})
			}
		}

		// 保存积分设置
		const savePoints = async () => {
			const { taskId, rewardPoints, punishPoints } = pointsForm.value
			
			// 验证输入
			if (rewardPoints && (!Number.isInteger(Number(rewardPoints)) || Number(rewardPoints) < 0)) {
				uni.showToast({
					title: '奖励积分必须为正整数',
					icon: 'none'
				})
				return
			}
			if (punishPoints && (!Number.isInteger(Number(punishPoints)) || Number(punishPoints) < 0)) {
				uni.showToast({
					title: '处罚积分必须为正整数',
					icon: 'none'
				})
				return
			}

			try {
				await http.post('/bookkeeping-service/task/relation/save', {
					taskId,
					rewardPoints: rewardPoints ? Number(rewardPoints) : 0,
					punishPoints: punishPoints ? Number(punishPoints) : 0
				})
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				})
				pointsPopup.value.close()
			} catch (error) {
				uni.showToast({
					title: '保存失败',
					icon: 'none'
				})
			}
		}

		// 关闭积分设置弹窗
		const closePointsPopup = () => {
			pointsForm.value = {
				taskId: null,
				rewardPoints: '',
				punishPoints: ''
			}
			pointsPopup.value.close()
		}

		// 获取最近任务
		const fetchRecentTasks = async () => {
			try {
				const endDate = new Date()
				endDate.setDate(endDate.getDate() + 7)
				const response = await http.post('/bookkeeping-service/task/basics/list', {
					endDeadlineDate: formatDate(endDate)
				})
				taskList.value = response.data
			} catch (error) {
				uni.showToast({
					title: '获取任务失败',
					icon: 'none'
				})
			}
		}

		// 获取收集箱任务
		const fetchInboxTasks = async () => {
			try {
				const response = await http.post('/bookkeeping-service/task/basics/list', {
					taskGroupId: 0
				})
				taskList.value = response.data
			} catch (error) {
				uni.showToast({
					title: '获取任务失败',
					icon: 'none'
				})
			}
		}

		// 获取已完成任务
		const fetchDoneTasks = async () => {
			try {
				const response = await http.get('/bookkeeping-service/task/basics/doneList')
				taskList.value = response.data
			} catch (error) {
				uni.showToast({
					title: '获取任务失败',
					icon: 'none'
				})
			}
		}

		// 添加任务
		const addTask = async () => {
			if (!newTaskName.value) return
			try {
				await http.post('/bookkeeping-service/task/basics/add', {
					taskGroupId: 0,
					taskName: newTaskName.value,
					deadlineDate: newTaskDeadline.value
				})
				newTaskName.value = ''
				newTaskDeadline.value = ''
				if (currentView.value === 'recent') {
					fetchRecentTasks()
				} else {
					fetchInboxTasks()
				}
				uni.showToast({
					title: '添加成功',
					icon: 'success'
				})
			} catch (error) {
				uni.showToast({
					title: '添加失败',
					icon: 'none'
				})
			}
		}

		// 完成任务
		const completeTask = async (task) => {
			try {
				await http.put('/bookkeeping-service/task/basics/updateStatus', {
					id: task.id,
					taskStatus: 1
				})
				if (currentView.value === 'recent') {
					fetchRecentTasks()
				} else {
					fetchInboxTasks()
				}
				uni.showToast({
					title: '已完成',
					icon: 'success'
				})
			} catch (error) {
				uni.showToast({
					title: '操作失败',
					icon: 'none'
				})
			}
		}

		// 取消完成任务
		const cancelCompleteTask = async (task) => {
			try {
				await http.put('/bookkeeping-service/task/basics/updateStatus', {
					id: task.id,
					taskStatus: 0
				})
				fetchDoneTasks()
				uni.showToast({
					title: '已取消完成',
					icon: 'success'
				})
			} catch (error) {
				uni.showToast({
					title: '操作失败',
					icon: 'none'
				})
			}
		}

		// 删除任务
		const deleteTask = async (task) => {
			try {
				await http.put('/bookkeeping-service/task/basics/updateStatus', {
					id: task.id,
					taskStatus: 3
				})
				if (currentView.value === 'recent') {
					fetchRecentTasks()
				} else {
					fetchInboxTasks()
				}
				uni.showToast({
					title: '已删除',
					icon: 'success'
				})
			} catch (error) {
				uni.showToast({
					title: '删除失败',
					icon: 'none'
				})
			}
		}

		// 日期选择器变化
		const onDateChange = (e) => {
			newTaskDeadline.value = e.detail.value
		}

		// 显示截止日期设置弹窗
		const showDeadlinePopup = (task) => {
			deadlineForm.value = {
				taskId: task.id,
				deadlineDate: task.deadlineDate || ''
			}
			deadlinePopup.value.open()
		}

		// 保存截止日期
		const saveDeadline = async () => {
			try {
				await http.put('/bookkeeping-service/task/basics/updateTaskParam', {
					id: deadlineForm.value.taskId,
					deadlineDate: deadlineForm.value.deadlineDate
				})
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				})
				deadlinePopup.value.close()
				if (currentView.value === 'recent') {
					fetchRecentTasks()
				} else {
					fetchInboxTasks()
				}
			} catch (error) {
				uni.showToast({
					title: '保存失败',
					icon: 'none'
				})
			}
		}

		// 关闭截止日期设置弹窗
		const closeDeadlinePopup = () => {
			deadlineForm.value = {
				taskId: null,
				deadlineDate: ''
			}
			deadlinePopup.value.close()
		}

		// 截止日期选择器变化
		const onDeadlineDateChange = (e) => {
			deadlineForm.value.deadlineDate = e.detail.value
		}

		onMounted(() => {
			fetchRecentTasks()
		})

		return {
			currentView,
			swiperCurrent,
			taskList,
			newTaskName,
			newTaskDeadline,
			pointsPopup,
			deletePopup,
			deadlinePopup,
			pointsForm,
			deadlineForm,
			switchView,
			onSwiperChange,
			addTask,
			completeTask,
			cancelCompleteTask,
			deleteTask,
			onDateChange,
			onDeadlineDateChange,
			showActionSheet,
			savePoints,
			closePointsPopup,
			confirmDelete,
			closeDeletePopup,
			saveDeadline,
			closeDeadlinePopup
		}
	}
}
</script>

<style lang="scss" scoped>
.task-container {
	padding: 20rpx;
	min-height: 100vh;
	background-color: #f5f5f5;
	display: flex;
	flex-direction: column;
}

.view-switch {
	display: flex;
	background-color: #fff;
	border-radius: 10rpx;
	margin-bottom: 20rpx;
	padding: 10rpx;

	.switch-item {
		flex: 1;
		text-align: center;
		padding: 20rpx 0;
		font-size: 28rpx;
		color: #666;
		position: relative;

		&.active {
			color: #007AFF;
			font-weight: bold;

			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 40rpx;
				height: 4rpx;
				background-color: #007AFF;
				border-radius: 2rpx;
			}
		}
	}
}

.swiper-container {
	width: 100%;
	height: calc(100vh - 240rpx);
}

.swiper-scroll {
	width: 100%;
	height: 100%;
}

.task-list {
	padding-bottom: 20rpx;
}

.task-item {
	background-color: #fff;
	border-radius: 10rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;

	.task-content {
		.task-name {
			font-size: 28rpx;
			color: #333;
			margin-bottom: 10rpx;
		}

		.task-info {
			display: flex;
			flex-direction: column;
			gap: 10rpx;
			font-size: 24rpx;
			color: #999;

			.task-group {
				color: #999;
			}

			.task-deadline {
				color: #999;
			}
		}
	}
}

.quick-add {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #fff;
	padding: 20rpx;
	display: flex;
	gap: 20rpx;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);

	.task-input {
		flex: 1;
		height: 80rpx;
		border: 1rpx solid #ddd;
		border-radius: 8rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
	}

	.date-picker {
		width: 200rpx;
		height: 80rpx;
		border: 1rpx solid #ddd;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.picker-text {
			font-size: 24rpx;
			color: #666;
		}
	}

	.add-btn {
		width: 160rpx;
		height: 80rpx;
		background-color: #007AFF;
		color: #fff;
		border-radius: 8rpx;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		&:disabled {
			background-color: #ccc;
		}
	}
}

.points-form {
	padding: 20rpx;

	.points-item {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.label {
			width: 160rpx;
			font-size: 28rpx;
			color: #333;
		}

		.points-input {
			flex: 1;
			height: 80rpx;
			border: 1rpx solid #ddd;
			border-radius: 8rpx;
			padding: 0 20rpx;
			font-size: 28rpx;
		}
	}
}

.deadline-form {
	padding: 20rpx;

	.date-picker {
		width: 100%;
		height: 80rpx;
		border: 1rpx solid #ddd;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.picker-text {
			font-size: 28rpx;
			color: #666;
		}
	}
}
</style> 