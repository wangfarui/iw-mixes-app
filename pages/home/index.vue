<!-- 首页 -->
<template>
	<view class="home-container">
		<!-- 天气卡片 -->
		<view class="weather-card">
			<template v-if="!weatherInfo.error">
				<view class="weather-info">
					<text class="temperature">{{ weatherInfo.temperature }}°C</text>
					<text class="weather-desc">{{ weatherInfo.weather }}</text>
				</view>
				<view class="weather-detail">
					<text class="location">{{ weatherInfo.city }}</text>
					<text class="date">{{ currentDate }}</text>
				</view>
			</template>
			<template v-else>
				<view class="weather-info">
					<text class="temperature">获取天气失败</text>
				</view>
				<view class="weather-detail">
					<text class="date">{{ currentDate }}</text>
				</view>
			</template>
		</view>

		<!-- 功能卡片区域 -->
		<view class="cards-container">
			<!-- 记账卡片 -->
			<view class="function-card">
				<view class="card-header">
					<view class="card-left">
						<view class="card-icon">
							<image class="card-icon-img" src="/static/tabbar/bill-active.png" mode="aspectFill" />
						</view>
						<view class="card-content">
							<text class="card-title">今日记账</text>
							<text class="card-value">¥ {{ billTotalAmount }}</text>
						</view>
					</view>
					<view class="quick-add-btn" @click="navigateToQuickBookkeep">
						<text class="iconfont icon-add"></text>
						<text>记一笔</text>
					</view>
				</view>
				<view class="card-details bill-list">
					<view class="detail-item" v-for="(item, index) in billRecords" :key="index">
						<text class="bill-time">{{ item.time }}</text>
						<text class="bill-source">{{ item.desc }}</text>
						<text class="bill-amount">-{{ item.amount }}</text>
					</view>
					<view class="more-link" v-if="showBillMore" @click="navigateToBill">
						<text>查看更多</text>
						<text class="iconfont icon-arrow-right"></text>
					</view>
				</view>
			</view>

			<!-- 待办任务卡片 -->
			<view class="function-card">
				<view class="card-header">
					<view class="card-icon">
						<image class="card-icon-img" src="/static/tabbar/task-active.png" mode="aspectFill" />
					</view>
					<view class="card-content">
						<text class="card-title">待办任务</text>
						<text class="card-value">{{ taskTotalCount }} 个待办</text>
					</view>
				</view>
				<view class="card-details task-list">
					<view class="detail-item" v-for="(item, index) in taskRecords" :key="index">
						<text class="detail-title">{{ item.title }}</text>
						<text class="detail-deadline" :class="getDeadlineColor(item.deadline)">{{ item.deadline }}</text>
					</view>
					<view class="more-link" v-if="showTaskMore" @click="navigateToTask">
						<text>查看更多</text>
						<text class="iconfont icon-arrow-right"></text>
					</view>
				</view>
			</view>

			<!-- 积分卡片 -->
			<view class="function-card">
				<view class="card-header">
					<view class="card-icon">
						<image class="card-icon-img" src="/static/tabbar/points.png" mode="aspectFill" />
					</view>
					<view class="card-content">
						<text class="card-title">剩余积分</text>
						<text class="card-value">{{ pointsBalance }} 分</text>
					</view>
				</view>
				<view class="card-details points-list">
					<view class="detail-item" v-for="(item, index) in pointsRecords" :key="index">
						<text class="points-time">{{ item.time }}</text>
						<text class="points-source">{{ item.desc }}</text>
						<text class="points-value" :class="{ 'add': item.type === 'add' }">{{ item.type === 'add' ? '+' : '' }}{{ item.points }}</text>
					</view>
					<view class="more-link" v-if="showPointsMore" @click="navigateToPoints">
						<text>查看更多</text>
						<text class="iconfont icon-arrow-right"></text>
					</view>
				</view>
			</view>
		</view>

		<!-- 推荐食谱区域 -->
		<view class="recipe-section">
			<view class="section-header">
				<text class="section-title">今日推荐食谱</text>
				<text class="more-link" @click="navigateToRecipes">查看更多</text>
			</view>
			<scroll-view class="recipe-scroll" scroll-x style="height: 280rpx;">
				<view class="recipe-card" v-for="(recipe, index) in recipes" :key="index" @click="navigateToDishesDetail(recipe.id)">
					<image class="recipe-image" :src="recipe.image" mode="aspectFill"></image>
					<text class="recipe-name">{{ recipe.name }}</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '@/api/request.js'
import { onPullDownRefresh } from '@dcloudio/uni-app'

const currentDate = ref('')
const billTotalAmount = ref('0.00')
const billRecords = ref([])
const showBillMore = ref(false)
const recipes = ref([])

const taskRecords = ref([])
const taskTotalCount = ref(0)
const showTaskMore = ref(false)

const pointsRecords = ref([])
const showPointsMore = ref(false)

const weatherInfo = ref({
	city: '',
	weather: '',
	temperature: '',
	error: false
})

const pointsBalance = ref(0)

const fetchWeather = async () => {
	try {
		const res = await http.get('/external-service/api/system/getWeather')
		const lives = res?.data?.lives
		if (Array.isArray(lives) && lives.length > 0) {
			weatherInfo.value = {
				city: lives[0].city,
				weather: lives[0].weather,
				temperature: lives[0].temperature,
				error: false
			}
		} else {
			weatherInfo.value = { city: '', weather: '', temperature: '', error: true }
		}
	} catch (e) {
		weatherInfo.value = { city: '', weather: '', temperature: '', error: true }
	}
}

// 获取当天日期 yyyy-MM-dd
const getToday = () => {
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

// 获取今日记账总金额
const fetchBillTotalAmount = async () => {
	const today = getToday()
	try {
		const res = await http.post('/bookkeeping-service/bookkeeping/consume/totalStatistics', {
			recordCategory: 1,
			currentStartMonth: today,
			currentEndMonth: today
		})
		billTotalAmount.value = res?.data?.totalAmount || '0.00'
	} catch (e) {
		billTotalAmount.value = '0.00'
	}
}

// 获取今日记账明细
const fetchBillRecords = async () => {
	const today = getToday()
	try {
		const res = await http.post('/bookkeeping-service/bookkeeping/records/page', {
			recordStartDate: today,
			recordEndDate: today,
			recordCategory: 1,
			pageSize: 4
		})
		let records = res?.data?.records || []
		showBillMore.value = records.length > 3
		billRecords.value = records.slice(0, 3).map(item => ({
			time: (item.recordTime || '').slice(11, 16),
			desc: item.recordSource,
			amount: item.amount
		}))
	} catch (e) {
		billRecords.value = []
		showBillMore.value = false
	}
}

// 获取未来7天日期 yyyy-MM-dd
const get7DaysLater = () => {
	const now = new Date()
	now.setDate(now.getDate() + 7)
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

// 获取代办任务列表
const fetchTaskRecords = async () => {
	try {
		const endDeadlineDate = get7DaysLater()
		const res = await http.post('/points-service/points/task/basics/list', {
			endDeadlineDate
		})
		const records = res?.data || []
		taskTotalCount.value = records.length
		showTaskMore.value = records.length > 3
		taskRecords.value = records.slice(0, 3).map(item => ({
			title: item.taskName,
			deadline: item.deadlineDate
		}))
	} catch (e) {
		taskRecords.value = []
		taskTotalCount.value = 0
		showTaskMore.value = false
	}
}

const updateCurrentDate = () => {
	const now = new Date()
	currentDate.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
}

const navigateToBill = () => {
	uni.navigateTo({
		url: '/pagesBookkeeping/bookkeeping/bookkeeping-records'
	})
}

const navigateToTask = () => {
	uni.switchTab({
		url: '/pages/task/index'
	})
}

const navigateToPoints = () => {
	uni.navigateTo({
		url: '/pagesPoints/points/points-records'
	})
}

const navigateToRecipes = () => {
	uni.navigateTo({
		url: '/pagesEat/eat/recipe/index'
	})
}

const navigateToQuickBookkeep = () => {
	uni.navigateTo({
		url: '/pagesBookkeeping/bookkeeping/bookkeeping-quick'
	})
}

const navigateToDishesDetail = (id) => {
	uni.navigateTo({
		url: '/pagesEat/eat/dishes/dishes-detail?id=' + id
	});
}

// 计算截止日期颜色
const getDeadlineColor = (deadline) => {
	const today = new Date()
	today.setHours(0,0,0,0)
	const end = new Date(deadline)
	end.setHours(0,0,0,0)
	const diff = (end - today) / (1000 * 60 * 60 * 24)
	if (diff <= 0) return 'deadline-red'
	if (diff > 0 && diff <= 7) return 'deadline-yellow'
	return 'deadline-black'
}

const fetchPointsBalance = async () => {
	try {
		const res = await http.get('/points-service/points/total/getPointsBalance')
		pointsBalance.value = res?.data ?? 0
	} catch (e) {
		pointsBalance.value = 0
	}
}

const fetchPointsRecords = async () => {
	const today = getToday()
	try {
		const res = await http.post('/points-service/points/records/page', {
			createStartTime: today,
			createEndTime: today,
			pageSize: 4
		})
		const records = res?.data?.records || []
		showPointsMore.value = records.length > 3
		pointsRecords.value = records.slice(0, 3).map(item => ({
			time: (item.createTime || '').slice(11, 16), // yyyy-MM-dd HH:mm:ss -> HH:mm
			desc: item.source,
			points: item.points,
			type: item.points >= 0 ? 'add' : 'reduce'
		}))
	} catch (e) {
		pointsRecords.value = []
		showPointsMore.value = false
	}
}

const fetchRecipes = async () => {
	try {
		const res = await http.get('/eat-service/eat/dishes/recommendDishes')
		const arr = res?.data || []
		recipes.value = arr.map(item => ({
			id: item.id,
			name: item.dishesName,
			image: item.dishesImage
		}))
	} catch (e) {
		recipes.value = []
	}
}

const refreshAll = async () => {
	await Promise.all([
		fetchBillTotalAmount(),
		fetchBillRecords(),
		fetchWeather(),
		fetchTaskRecords(),
		fetchPointsBalance(),
		fetchPointsRecords(),
		fetchRecipes()
	])
	uni.stopPullDownRefresh()
}

onMounted(() => {
	updateCurrentDate()
	refreshAll()
})

onPullDownRefresh(() => {
	updateCurrentDate()
	refreshAll()
})
</script>

<style lang="scss">
.home-container {
	min-height: 100vh;
	background-color: #f5f6fa;
	padding: 20rpx;
}

.weather-card {
	background: linear-gradient(135deg, #6e8efb, #a777e3);
	border-radius: 20rpx;
	padding: 30rpx;
	color: #fff;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);

	.weather-info {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.temperature {
			font-size: 60rpx;
			font-weight: bold;
			margin-right: 20rpx;
		}

		.weather-desc {
			font-size: 32rpx;
		}
	}

	.weather-detail {
		display: flex;
		justify-content: space-between;
		font-size: 28rpx;
		opacity: 0.9;
	}
}

.cards-container {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	margin-bottom: 30rpx;
}

.function-card {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	.card-left {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.card-icon {
		width: 80rpx;
		height: 80rpx;
		background-color: #f0f3ff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
	}

	.card-icon-img {
		width: 40rpx;
		height: 40rpx;
		border-radius: 12rpx;
	}

	.card-content {
		flex: 1;
		display: flex;
		flex-direction: column;

		.card-title {
			font-size: 28rpx;
			color: #666;
			margin-bottom: 10rpx;
		}

		.card-value {
			font-size: 36rpx;
			color: #333;
			font-weight: bold;
			white-space: normal;
			word-break: break-all;
		}
	}

	.quick-add-btn {
		background-color: #f0f3ff;
		border-radius: 30rpx;
		padding: 10rpx 20rpx;
		color: #6e8efb;
		font-size: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		white-space: nowrap;

		.iconfont {
			margin-right: 5rpx;
			font-size: 24rpx;
		}

		&:active {
			opacity: 0.8;
		}
	}

	.card-details {
		border-top: 1rpx solid #f0f0f0;
		padding-top: 20rpx;

		.detail-item {
			display: flex;
			align-items: center;
			padding: 10rpx 0;
			font-size: 26rpx;

			.detail-title {
				flex: 2;
				color: #333;
				margin-right: 10rpx;
			}
			.detail-group {
				flex: 1;
				color: #888;
				margin-right: 10rpx;
			}
			.detail-deadline {
				flex: 1;
				font-weight: bold;
			}
			.deadline-red {
				color: #ff4d4f;
			}
			.deadline-yellow {
				color: #faad14;
			}
			.deadline-black {
				color: #333;
			}
		}

		.more-link {
			display: flex;
			align-items: center;
			justify-content: center;
			color: #6e8efb;
			font-size: 26rpx;
			padding-top: 10rpx;
			margin-top: 10rpx;
			border-top: 1rpx dashed #f0f0f0;

			.iconfont {
				margin-left: 10rpx;
				font-size: 24rpx;
			}
		}
	}
}

.recipe-section {
	background-color: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}

		.more-link {
			font-size: 26rpx;
			color: #6e8efb;
		}
	}

	.recipe-scroll {
		white-space: nowrap;
		width: 100%;
		padding-left: 0;
	}

	.recipe-card {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		width: 240rpx;
		margin-right: 20rpx;
		vertical-align: top;

		&:first-child {
			margin-left: 0;
		}
		&:not(:first-child) {
			margin-left: 0;
		}

		.recipe-image {
			width: 240rpx;
			height: 240rpx;
			border-radius: 12rpx;
			margin-bottom: 10rpx;
		}

		.recipe-name {
			font-size: 26rpx;
			color: #333;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			text-align: center;
		}
	}
}

.bill-list .detail-item {
	display: flex;
	align-items: center;
	padding: 10rpx 0;
	font-size: 26rpx;
}
.bill-list .bill-time {
	flex: 1;
	color: #999;
	margin-right: 10rpx;
}
.bill-list .bill-source {
	flex: 2;
	color: #333;
	margin-right: 10rpx;
}
.bill-list .bill-amount {
	flex: 1;
	font-weight: bold;
	color: #ff4d4f;
	text-align: right;
}
.bill-list .bill-amount.income {
	color: #52c41a;
}

.points-list .detail-item {
	display: flex;
	align-items: center;
	padding: 10rpx 0;
	font-size: 26rpx;
}
.points-list .points-time {
	flex: 1;
	color: #999;
	margin-right: 10rpx;
}
.points-list .points-source {
	flex: 2;
	color: #333;
	margin-right: 10rpx;
}
.points-list .points-value {
	flex: 1;
	font-weight: bold;
	color: #ff4d4f;
	text-align: right;
}
.points-list .points-value.add {
	color: #52c41a;
}

.task-list .detail-item, .task-list .detail-title, .task-list .detail-deadline {
	/* 保证样式不乱 */
}

.task-list .detail-deadline {
	flex: 1;
	text-align: right;
}
</style> 