<!-- 常用任务 -->
<template>
	<view class="container">
		<!-- 顶部筛选输入框 -->
		<view class="filter-bar">
			<uni-easyinput v-model="filterKeyword" placeholder="输入任务名称进行筛选" clearable />
		</view>
		<view v-for="item in filteredTaskList" :key="item.id" class="task-card" @longpress="handleLongPress(item)">
			<view class="card-content">
				<view class="left">
					<text class="task-name">{{ item.taskName }}</text>
				</view>
				<view class="right">
					<text class="task-points" :class="{'points-positive': item.taskPoints > 0, 'points-negative': item.taskPoints < 0}">
						{{ item.taskPoints > 0 ? '+' : '' }}{{ item.taskPoints }}积分
					</text>
					<button class="submit-btn" @click.stop="handleSubmit(item)">提交</button>
				</view>
			</view>
		</view>
		<view style="height: 60px;"></view>
		<!-- 新增按钮 -->
		<view class="add-btn" @click="showAddModal">
			<uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
		</view>
		<!-- 新增/编辑任务弹窗 -->
		<uni-popup ref="taskPopup" type="center">
			<view class="popup-content">
				<view class="popup-title">{{isEdit ? '编辑任务' : '新增任务'}}</view>
				<view class="form-item">
					<text class="label">任务名称</text>
					<uni-easyinput v-model="formData.taskName" placeholder="请输入任务名称" />
				</view>
				<view class="form-item">
					<text class="label">任务积分</text>
					<uni-easyinput v-model="formData.taskPoints" type="number" placeholder="请输入积分（可以是正数或负数）" />
				</view>
				<view class="form-item">
					<text class="label">任务备注</text>
					<uni-easyinput v-model="formData.taskRemark" type="textarea" placeholder="请输入任务备注" />
				</view>
				<view class="popup-buttons">
					<button class="cancel-btn" @click="closePopup">取消</button>
					<button class="confirm-btn" @click="handleSave">确定</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import http from '@/api/request.js'

const taskList = ref([])
const taskPopup = ref(null)
const isEdit = ref(false)
const formData = reactive({
	taskName: '',
	taskPoints: '',
	taskRemark: '',
	id: null
})

const filterKeyword = ref('')

const filteredTaskList = computed(() => {
	if (!filterKeyword.value) return taskList.value
	return taskList.value.filter(item => item.taskName && item.taskName.includes(filterKeyword.value))
})

// 获取任务列表
function getTaskList() {
	http.get('/points-service/points/task/fixed/list').then(res => {
		taskList.value = res.data
	})
}

// 长按任务项
function handleLongPress(item) {
	uni.showActionSheet({
		itemList: ['编辑', '删除'],
		success: (res) => {
			if (res.tapIndex === 0) {
				handleEdit(item)
			} else if (res.tapIndex === 1) {
				handleDelete(item)
			}
		}
	})
}

// 显示新增弹窗
function showAddModal() {
	isEdit.value = false
	formData.taskName = ''
	formData.taskPoints = ''
	formData.taskRemark = ''
	formData.id = null
	taskPopup.value.open()
}

// 显示编辑弹窗
function handleEdit(item) {
	isEdit.value = true
	formData.taskName = item.taskName
	formData.taskPoints = item.taskPoints
	formData.taskRemark = item.taskRemark
	formData.id = item.id
	taskPopup.value.open()
}

// 关闭弹窗
function closePopup() {
	taskPopup.value.close()
}

// 保存任务
function handleSave() {
	if (!formData.taskName || formData.taskPoints === '') {
		uni.showToast({
			title: '请填写完整信息',
			icon: 'none'
		})
		return
	}

	const url = isEdit.value ? '/points-service/points/task/fixed/update' : '/points-service/points/task/fixed/add'
	const method = isEdit.value ? 'put' : 'post'
	const data = {
		taskName: formData.taskName,
		taskPoints: Number(formData.taskPoints),
		taskRemark: formData.taskRemark
	}

	if (isEdit.value) {
		data.id = formData.id
	}

	http.request(url, method, data).then(() => {
		uni.showToast({
			title: isEdit.value ? '修改成功' : '添加成功',
			icon: 'success'
		})
		closePopup()
		getTaskList()
	})
}

// 删除任务
function handleDelete(item) {
	uni.showModal({
		title: '提示',
		content: '确定要删除该任务吗？',
		success: (res) => {
			if (res.confirm) {
				http.delete(`/points-service/points/task/fixed/delete?id=${item.id}`).then(() => {
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
					getTaskList()
				})
			}
		}
	})
}

// 提交任务
function handleSubmit(item) {
	uni.showLoading({
		title: '正在提交...'
	})
	http.get('/points-service/points/task/fixed/submit?id=' + item.id).then(() => {
		uni.hideLoading()
		uni.showToast({
			title: '提交成功',
			icon: 'success'
		})
		getTaskList()
	}).catch(() => {
		uni.hideLoading()
	})
}

onShow(() => {
	getTaskList()
})
</script>

<style>
.container {
	padding: 15px;
	background-color: #f5f5f5;
	min-height: 100vh;
	position: relative;
}

.task-card {
	background: #fff;
	border-radius: 12px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.06);
	margin-bottom: 16px;
	padding: 0 16px;
	transition: box-shadow 0.2s;
}

.task-card:active {
	box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.card-content {
	display: flex;
	align-items: center;
	min-height: 56px;
}

.left {
	flex: 1;
	min-width: 0;
}

.task-name {
	font-size: 17px;
	font-weight: 600;
	color: #222;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.right {
	display: flex;
	align-items: center;
	margin-left: 10px;
}

.task-points {
	font-size: 15px;
	margin-right: 12px;
	white-space: nowrap;
}

.points-positive {
	color: #ff6b6b;
}

.points-negative {
	color: #4cd964;
}

.submit-btn {
	background-color: #007aff;
	color: #fff;
	font-size: 15px;
	font-weight: bold;
	padding: 0 20px;
	height: 36px;
	border-radius: 18px;
	min-width: 70px;
	text-align: center;
	border: none;
	box-shadow: 0 2px 8px rgba(0,0,0,0.08);
	transition: background 0.2s;
	margin: 0;
}

.submit-btn:active {
	background-color: #005bb5;
}

.add-btn {
	position: fixed;
	right: 20px;
	bottom: 20px;
	width: 50px;
	height: 50px;
	background-color: #007aff;
	border-radius: 25px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	z-index: 100;
}

.popup-content {
	background-color: #fff;
	border-radius: 8px;
	padding: 20px;
	width: 80vw;
}

.popup-title {
	font-size: 18px;
	font-weight: bold;
	text-align: center;
	margin-bottom: 20px;
}

.form-item {
	margin-bottom: 15px;
}

.label {
	display: block;
	margin-bottom: 5px;
	font-size: 14px;
	color: #666;
}

.popup-buttons {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	margin-top: 20px;
}

.cancel-btn, .confirm-btn {
	font-size: 14px;
	padding: 6px 15px;
	border-radius: 4px;
}

.cancel-btn {
	background-color: #f5f5f5;
	color: #666;
}

.confirm-btn {
	background-color: #007aff;
	color: #fff;
}

.filter-bar {
	margin-bottom: 16px;
	background: #fff;
	border-radius: 8px;
	padding: 10px 12px 2px 12px;
}
</style> 