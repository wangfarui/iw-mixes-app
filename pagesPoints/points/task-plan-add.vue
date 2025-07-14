<!-- 任务计划新增/编辑页面 -->
<template>
	<view class="container">
		<uni-forms ref="form" :model="formData" :rules="rules">
			<uni-forms-item label="任务名称" required name="taskName">
				<uni-easyinput v-model="formData.taskName" placeholder="请输入任务名称" />
			</uni-forms-item>
			
			<uni-forms-item label="任务备注" name="taskRemark">
				<uni-easyinput v-model="formData.taskRemark" type="textarea" placeholder="请输入任务备注" />
			</uni-forms-item>
			
			<uni-forms-item label="计划周期" required name="planCycle">
				<uni-data-select
					v-model="formData.planCycle"
					:localdata="planCycleOptions"
					@change="handlePlanCycleChange"
				/>
			</uni-forms-item>
			
			<uni-forms-item label="计划日期" required name="planDate">
				<uni-datetime-picker
					v-model="formData.planDate"
					type="date"
					@change="handleDateChange"
				/>
			</uni-forms-item>
			
			<uni-forms-item label="计划天数" name="cycleDays" v-if="formData.planCycle === 5">
				<uni-easyinput v-model="formData.cycleDays" type="number" placeholder="请输入计划天数" />
			</uni-forms-item>
			
			<uni-forms-item label="提前提醒天数" name="remindDays">
				<uni-easyinput v-model="formData.remindDays" type="number" placeholder="请输入提前提醒天数" />
			</uni-forms-item>
			
			<uni-forms-item label="截止天数" name="deadlineDays">
				<uni-easyinput v-model="formData.deadlineDays" type="number" placeholder="请输入截止天数" />
			</uni-forms-item>
			
			<uni-forms-item label="奖励积分" name="rewardPoints">
				<uni-easyinput v-model="formData.rewardPoints" type="number" placeholder="请输入奖励积分" />
			</uni-forms-item>
			
			<uni-forms-item label="处罚积分" name="punishPoints">
				<uni-easyinput v-model="formData.punishPoints" type="number" placeholder="请输入处罚积分" />
			</uni-forms-item>
		</uni-forms>
		
		<view class="btn-group">
			<button class="btn-save" @click="handleSubmit">保存</button>
			<button class="btn-cancel" @click="handleCancel">取消</button>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import http from '@/api/request.js'

const form = ref(null)
const isEdit = ref(false)
const taskId = ref('')

const planCycleOptions = [
	{ value: 1, text: '每日' },
	{ value: 2, text: '每周' },
	{ value: 3, text: '每月' },
	{ value: 4, text: '每年' },
	{ value: 5, text: '自定义' }
]

const formData = reactive({
	taskName: '',
	taskRemark: '',
	planCycle: 1,
	planDate: '',
	cycleDays: null,
	remindDays: null,
	deadlineDays: null,
	rewardPoints: null,
	punishPoints: null
})

const rules = {
	taskName: {
		rules: [{
			required: true,
			errorMessage: '请输入任务名称'
		}]
	},
	planCycle: {
		rules: [{
			required: true,
			errorMessage: '请选择计划周期'
		}]
	},
	planDate: {
		rules: [{
			required: true,
			errorMessage: '请选择计划日期'
		}]
	},
	cycleDays: {
		rules: [{
			required: true,
			errorMessage: '请输入计划天数',
			validateFunction: (rule, value, data, callback) => {
				if (data.planCycle === 5 && !value) {
					return false
				}
				return true
			}
		}]
	}
}

onMounted(() => {
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	const options = currentPage.options
	
	if (options.id) {
		taskId.value = options.id
		isEdit.value = true
		loadTaskDetail()
	}
})

async function loadTaskDetail() {
	try {
		const res = await http.get(`/points-service/points/task/plan/detail?id=${taskId.value}`)
		const detail = res.data
		
		// 更新表单数据
		Object.keys(formData).forEach(key => {
			if (detail[key] !== undefined) {
				formData[key] = detail[key]
			}
		})
	} catch (error) {
		uni.showToast({
			icon: 'error',
			title: '获取详情失败'
		})
	}
}

function handlePlanCycleChange(value) {
	if (value !== 5) {
		formData.cycleDays = null
	}
}

function handleDateChange(value) {
	formData.planDate = value
}

async function handleSubmit() {
	await form.value.validate()

	// 处理默认值
	const submitData = {
		...formData,
		planDate: formData.planDate.split(' ')[0] // 只保留日期部分
	}
	// 如果为null、undefined或空字符串，则赋值为0
	submitData.remindDays = submitData.remindDays == null || submitData.remindDays === '' ? 0 : submitData.remindDays
	submitData.deadlineDays = submitData.deadlineDays == null || submitData.deadlineDays === '' ? 0 : submitData.deadlineDays
	submitData.rewardPoints = submitData.rewardPoints == null || submitData.rewardPoints === '' ? 0 : submitData.rewardPoints
	submitData.punishPoints = submitData.punishPoints == null || submitData.punishPoints === '' ? 0 : submitData.punishPoints

	if (isEdit.value) {
		submitData.id = taskId.value
		await http.put('/points-service/points/task/plan/update', submitData)
	} else {
		await http.post('/points-service/points/task/plan/add', submitData)
	}

	uni.showToast({
		icon: 'success',
		title: '保存成功'
	})

	// 返回上一页
	setTimeout(() => {
		uni.navigateBack()
	}, 1500)
}

function handleCancel() {
	uni.navigateBack()
}
</script>

<style lang="scss">
.container {
	padding: 20rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.btn-group {
	margin-top: 40rpx;
	padding: 0 20rpx;
	
	button {
		margin-bottom: 20rpx;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 40rpx;
		font-size: 28rpx;
		
		&.btn-save {
			background-color: #2196f3;
			color: #fff;
		}
		
		&.btn-cancel {
			background-color: #fff;
			color: #666;
			border: 1px solid #ddd;
		}
	}
}

:deep(.uni-forms-item) {
	background-color: #fff;
	padding: 20rpx;
	margin-bottom: 20rpx;
	border-radius: 10rpx;
	
	.uni-forms-item__label {
		font-size: 28rpx;
		color: #333;
		width: 200rpx !important;
	}
	
	.uni-easyinput__content {
		min-height: 80rpx;
	}
	
	.uni-data-select {
		width: 100%;
	}
}
</style>