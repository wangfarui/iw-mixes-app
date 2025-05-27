<!-- 账单 -->
<template>
	<view>
		<view class="container">
			<!-- 固定区域 -->
			<view class="fixed-section">
				<!-- 顶部统计区域 -->
				<view class="statistics-section">
					<view class="statistics-row">
						<view class="date-picker">
							<picker mode="date" fields="month" :value="currentDate" @change="handleDateChange">
								<view class="date-content">
									<view class="date-wrapper">
										<text class="year-text">{{formatYear(currentDate)}}年</text>
										<text class="month-text">{{formatMonth(currentDate)}}月</text>
									</view>
									<text class="arrow-down">▼</text>
								</view>
							</picker>
						</view>
						<view class="amount-item">
							<text class="amount-label">收入</text>
							<text class="amount-value">{{statistics.income}}</text>
						</view>
						<view class="amount-item">
							<text class="amount-label">支出</text>
							<text class="amount-value">{{statistics.consume}}</text>
						</view>
					</view>
				</view>

				<!-- 功能按钮区域 -->
				<view class="function-section">
					<view class="function-item" v-for="(item, index) in functionButtons" :key="index" @click="handleFunctionClick(item)">
						<image :src="item.icon" mode="aspectFit" class="function-icon"></image>
						<text class="function-text">{{item.text}}</text>
					</view>
				</view>
			</view>

			<!-- 账单列表区域 -->
			<scroll-view class="bill-list" scroll-y @scrolltolower="handleScrollToLower" @refresherrefresh="handleRefresh" refresher-enabled :refresher-triggered="isRefreshing">
				<uni-list>
					<uni-list-item v-for="item in billList" :key="item.id" @click="handleRecordClick(item)" clickable>
						<template v-slot:header>
							<image :src="getRecordIcon(item)" mode="aspectFit" class="record-icon"></image>
						</template>
						<template v-slot:body>
							<view class="record-info">
								<text class="record-source">{{item.recordSource}}</text>
								<text class="record-type">{{item.recordTypeName}}</text>
								<text class="record-time">{{item.recordTimeStr}}</text>
							</view>
						</template>
						<template v-slot:footer>
							<text class="record-amount">
								{{item.recordCategory === 1 ? '-' : ''}}{{item.amount}}
							</text>
						</template>
					</uni-list-item>
				</uni-list>
				<uni-load-more :status="loadMoreStatus" />
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
	import { ref, reactive, onMounted } from 'vue'
	import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
	import http from '@/api/request.js'
	import {
		useDictStore
	} from "@/stores/dict.ts";

	const dictStore = useDictStore()

	// 当前选择的日期
	const currentDate = ref(new Date().toISOString().split('T')[0])

	// 统计数据
	const statistics = reactive({
		income: '0.00',
		consume: '0.00'
	})

	// 功能按钮配置
	const functionButtons = [
		{ text: '明细', icon: '/static/bookkeeping/zhangdanmingxi.png' },
		{ text: '预算', icon: '/static/bookkeeping/yusuan.png' },
		{ text: '支出统计', icon: '/static/bookkeeping/zhichutongji.png' },
		{ text: '收入统计', icon: '/static/bookkeeping/shourutongji.png' },
		{ text: '记账', icon: '/static/bookkeeping/jizhang.png' }
	]

	// 账单列表数据
	const billList = ref([])
	const loadMoreStatus = ref('more')
	const page = reactive({
		currentPage: 1,
		pageSize: 10
	})
	const isRefreshing = ref(false)

	onShow(() => {
		initPage()
	})

	// 格式化年份显示
	function formatYear(date) {
		const d = new Date(date)
		return d.getFullYear()
	}

	// 格式化月份显示
	function formatMonth(date) {
		const d = new Date(date)
		return (d.getMonth() + 1).toString().padStart(2, '0')
	}

	// 获取月份的起止日期
	function getMonthRange(date) {
		const d = new Date(date)
		const year = d.getFullYear()
		const month = d.getMonth() + 1
		const lastDay = new Date(year, month, 0).getDate()
		return {
			start: `${year}-${month.toString().padStart(2, '0')}-01`,
			end: `${year}-${month.toString().padStart(2, '0')}-${lastDay}`
		}
	}

	// 获取统计数据
	function getStatistics() {
		const dateRange = getMonthRange(currentDate.value)
		http.post('/bookkeeping-service/bookkeeping/records/statistics', {
			recordStartDate: dateRange.start,
			recordEndDate: dateRange.end
		}).then(res => {
			const data = res.data
			statistics.income = parseFloat(data.income || 0).toFixed(2)
			statistics.consume = parseFloat(data.consume || 0).toFixed(2)
		})
	}

	// 获取账单列表
	function getBillList() {
		loadMoreStatus.value = 'loading'
		const dateRange = getMonthRange(currentDate.value)
		http.post('/bookkeeping-service/bookkeeping/records/page', {
			currentPage: page.currentPage,
			pageSize: page.pageSize,
			recordStartDate: dateRange.start,
			recordEndDate: dateRange.end
		}).then(res => {
			let data = res.data.records.map(item => ({
				recordTypeName: dictStore.getDictNameByCode(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TYPE, item.recordType, "未知"),
				...item
			}))
			if (page.currentPage === 1) {
				billList.value = data
			} else {
				billList.value = [...billList.value, ...data]
			}
			loadMoreStatus.value = data.length >= page.pageSize ? 'more' : 'noMore'
		}).catch(() => {
			loadMoreStatus.value = 'more'
		}).finally(() => {
			isRefreshing.value = false
		})
	}

	// 日期选择变化
	function handleDateChange(e) {
		currentDate.value = e.detail.value
		page.currentPage = 1
		getStatistics()
		getBillList()
	}

	// 功能按钮点击
	function handleFunctionClick(item) {
		if (item.text === '记账') {
			uni.navigateTo({
				url: '/pagesBookkeeping/bookkeeping/bookkeeping-quick'
			})
		} else if (item.text === '明细') {
			uni.navigateTo({
				url: '/pagesBookkeeping/bookkeeping/bookkeeping-records'
			})
		} else if (item.text === '支出统计') {
			uni.navigateTo({
				url: '/pagesBookkeeping/bookkeeping/bookkeeping-statistics'
			})
		} else if (item.text === '预算') {
			uni.navigateTo({
				url: '/pagesBookkeeping/bookkeeping/bookkeeping-budget'
			})
		} else if (item.text === '收入统计') {
			uni.navigateTo({
				url: '/pagesBookkeeping/bookkeeping/bookkeeping-income-statistics'
			})
		} else {
			uni.showToast({
				title: `点击了${item.text}`,
				icon: 'none'
			})
		}
	}

	function handleRecordClick(item) {
		uni.navigateTo({
			url: '/pagesBookkeeping/bookkeeping/bookkeeping-detail?id=' + item.id
		});
	}

	// 初始化页面
	function initPage() {
		page.currentPage = 1
		getStatistics()
		getBillList()
	}

	// 处理滚动到底部
	function handleScrollToLower() {
		if (loadMoreStatus.value === 'more') {
			page.currentPage++
			getBillList()
		}
	}

	// 处理下拉刷新
	function handleRefresh() {
		isRefreshing.value = true
		initPage()
	}

	// 获取记录图标
	function getRecordIcon(item) {
		if (item.recordIcon) {
			return '/static/bookkeeping' + item.recordIcon + '.svg'
		}
		
		switch (item.recordCategory) {
			case 1:
				return '/static/bookkeeping/icon/zhichu.svg'
			case 2:
				return '/static/bookkeeping/icon/shouru.svg'
			default:
				return '/static/bookkeeping/icon/amount.svg'
		}
	}

</script>

<style>
	.container {
		padding: 10px;
		height: 100vh;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	/* 固定区域样式 */
	.fixed-section {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1;
		background-color: #f8f8f8;
		padding: 10px;
	}

	/* 统计区域样式 */
	.statistics-section {
		background-color: #fff;
		padding: 15px;
		border-radius: 8px;
		padding-bottom: 0;
	}
	.statistics-row {
		display: flex;
		align-items: center;
	}
	.date-picker {
		flex: 2;
	}
	.date-content {
		display: flex;
		align-items: center;
	}
	.date-wrapper {
		display: flex;
		flex-direction: column;
		margin-right: 4px;
	}
	.year-text {
		font-size: 12px;
		color: #999;
		margin-bottom: 2px;
	}
	.month-text {
		font-size: 20px;
		font-weight: bold;
		color: #333;
	}
	.arrow-down {
		font-size: 12px;
		color: #666;
		margin-top: 12px;
	}
	.amount-item {
		flex: 4;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.amount-label {
		font-size: 14px;
		color: #999;
		margin-bottom: 2px;
	}
	.amount-value {
		font-size: 18px;
		font-weight: bold;
		color: #333;
	}

	/* 功能按钮区域样式 */
	.function-section {
		display: flex;
		justify-content: space-between;
		background-color: #fff;
		padding: 15px 0;
		border-radius: 8px;
	}
	.function-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}
	.function-icon {
		width: 24px;
		height: 24px;
		margin-bottom: 5px;
	}
	.function-text {
		font-size: 12px;
		color: #666;
	}

	/* 账单列表区域样式 */
	.bill-list {
		background-color: #fff;
		border-radius: 8px;
		margin-top: 150px; /* 根据固定区域的高度调整 */
		height: calc(100vh - 170px); /* 计算剩余可用高度 */
	}
	.record-icon {
		width: 24px;
		height: 24px;
		padding: 8px;
		border-radius: 50%;
		filter: invert(77%) sepia(59%) saturate(638%) hue-rotate(359deg) brightness(103%) contrast(107%);
	}
	.record-info {
		display: flex;
		flex-direction: column;
		flex: 1;
	}
	.record-source {
		font-size: 16px;
		margin-bottom: 2px;
	}
	.record-type {
		font-size: 12px;
		color: #999;
		margin-bottom: 2px;
	}
	.record-time {
		font-size: 12px;
		color: #999;
	}
	.record-amount {
		font-size: 16px;
		font-weight: bold;
		color: #333;
		min-width: 100px;
		text-align: right;
		padding-right: 15px;
	}

	/* 覆盖 uni-list-item 的默认样式 */
	:deep(.uni-list-item__container) {
		padding: 10px 0;
	}
	:deep(.uni-list-item__content) {
		flex: 1;
	}
	:deep(.uni-list-item__extra) {
		flex: none;
	}
</style> 