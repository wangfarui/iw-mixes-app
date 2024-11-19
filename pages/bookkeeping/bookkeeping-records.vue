<!-- 记账记录 -->
<template>
	<view>
		<view class="container filter-container">
			<!-- 滑动按钮组 -->
			<scroll-view scroll-x="true" class="button-group">
				<view class="button-group-item" :class="{ active: selectedButtonCode === recordType.dictCode }"
					v-for="recordType in computeRecodTypeArray()" :key="recordType.id"
					@click="selectButton(recordType.dictCode)">
					{{ recordType.dictName }}
				</view>
			</scroll-view>
			<!-- 筛选按钮 -->
			<view class="filter-button" @click="openFilter">
				筛选
			</view>
		</view>
		<view class="container">
			<uni-datetime-picker v-model="page.range" type="daterange" start-placeholder="记账开始日期"
				end-placeholder="记账结束日期" @change="changeRange" />
			<view style="padding-top: 10px;">
				<uni-row>
					<uni-col :span="12"><template
							v-if="showCurrentMonth">本月</template>支出：{{page.statistics.consume}}元</uni-col>
					<uni-col :span="12"><template
							v-if="showCurrentMonth">本月</template>收入：{{page.statistics.income}}元</uni-col>
				</uni-row>
			</view>
		</view>
		<view>
			<uni-list>
				<uni-list-item v-for="item in page.list" :key="item.id" @click="handleRecordClick(item)" clickable>
					<template v-slot:body>
						<view style="width: 100%;">
							<uni-row>
								<view style="font-size: 16px;">
									<uni-col :span="18">{{formatSourceText(item)}}</uni-col>
									<uni-col :span="6">
										<view style="text-align: right;">
											{{item.recordCategory == '1' ? '-' : ''}}{{item.amount}}元
										</view>
									</uni-col>
								</view>
							</uni-row>
							<uni-row>
								<view style="color: #8c8c8c; font-size: 13px;">
									<view>{{item.recordTypeName}}</view>
									<view>{{item.recordTime}}</view>
								</view>
							</uni-row>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
			<view>
				<uni-load-more :status="mealListStatus" />
			</view>
		</view>

		<!-- 筛选弹出层 -->
		<uni-popup ref="filterDialog" type="bottom" :mask-click="false">
			<view class="popup-content">
				<view class="popup-header">
					<text class="popup-title">筛选条件</text>
				</view>
				<view class="popup-body">
					<!-- 金额范围输入 -->
					<view class="filter-item">
						<text class="filter-label">金额范围：</text>
						<uni-row>
							<uni-col :span="10">
								<input class="filter-input" placeholder="最低金额" type="number" />
							</uni-col>
							<uni-col :span="4" style="text-align: center;">-</uni-col>
							<uni-col :span="10">
								<input class="filter-input" placeholder="最高金额" type="number" />
							</uni-col>
						</uni-row>
					</view>
					<!-- 分类选择 -->
					<view class="filter-item">
						<text class="filter-label">分类：</text>
						<scroll-view scroll-x class="category-group">
							<view class="category-button"
								:class="{ selected: selectedCategoryCode == category.dictCode }"
								v-for="category in dictStore.getDictDataArray(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TYPE)"
								:key="category.id" @click="toggleCategory(category.dictCode)">
								{{ category.dictName }}
							</view>
						</scroll-view>
					</view>
				</view>
				<!-- 底部按钮 -->
				<view class="popup-footer">
					<button class="cancel-button" @click="cancelFilter">取消</button>
					<button class="confirm-button" @click="applyFilter">确定</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue'
	import {
		onPullDownRefresh,
		onReachBottom,
		onShow
	} from '@dcloudio/uni-app'
	import http from '@/api/request.js'
	import {
		useDictStore
	} from "@/stores/dict.ts";

	const dictStore = useDictStore()

	const mealListStatus = ref('more')

	const showCurrentMonth = ref(true)

	const buttonList = ['全部', '支出', '收入']
	const selectedButtonCode = ref(-1)
	const filterDialog = ref(null);
	const selectedCategoryCode = ref(0)

	const page = reactive({
		dto: {
			recordStartDate: '', // 记账记录开始时间
			recordEndDate: '', // 记账记录结束时间
			recordType: '', // 记录分类
			currentPage: 1,
			pageSize: 20
		},
		range: ['', ''],
		list: [],
		statistics: {}
	})

	onShow(() => {
		initPage()
	})

	function computeRecodTypeArray() {
		let recordTypeArray = [{
			id: '-1',
			dictCode: -1,
			dictName: '全部'
		}]
		return [...recordTypeArray, ...dictStore.getDictDataArray(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TYPE)]
	}

	function selectButton(code) {
		selectedButtonCode.value = code;
		initPage()
	}

	function openFilter() {
		filterDialog.value.open();
		console.log("2");
	}

	function cancelFilter() {
		filterDialog.value.close();
		// 重置筛选条件
		selectedCategoryCode.value = 0
	}

	function applyFilter() {
		filterDialog.value.close();
		// 执行筛选逻辑
		// 可以在这里发送请求，传递筛选条件
		console.log('筛选条件：');
	}

	function toggleCategory(code) {
		selectedCategoryCode.value = code
	}

	function formatSourceText(item) {
		if (item.recordSource != '') {
			return item.recordSource;
		}
		return item.recordCategory == 2 ? '收入' : '消费';
	}

	/**
	 * 日期选择的change⌚事件
	 */
	function changeRange(arr) {
		if (arr == undefined || arr.length == 0) {
			page.range = ['', '']
			showCurrentMonth.value = true
		} else {
			showCurrentMonth.value = false
		}
		// 日期筛选值变化后，初始化分页数据
		initPage()
	}

	/**
	 * 查询统计信息
	 */
	function searchStatistics() {
		return new Promise((resolve) => {
			http.post('/bookkeeping-service/records/statistics', page.dto)
				.then(res => {
					page.statistics = res.data
					resolve(true)
				})
		});
	}

	/**
	 * 查询分页信息
	 */
	function searchPage() {
		return new Promise((resolve) => {
			http.post('/bookkeeping-service/records/page', page.dto)
				.then(res => {
					const data = res.data
					if (data.records && data.records.length == page.dto.pageSize) {
						mealListStatus.value = 'more'
					} else {
						mealListStatus.value = 'noMore'
					}
					let newRecords = data.records.map(item => ({
						recordTypeName: dictStore.getDictNameByCode(dictStore.dictTypeEnum
							.BOOKKEEPING_RECORD_TYPE, item.recordType, "未知"),
						...item
					}))
					page.list = [...page.list, ...newRecords]
					resolve(true)
				})
				.catch(error => {
					mealListStatus.value = 'more'
				})
				.finally(() => {
					uni.stopPullDownRefresh();
				});
		});
	}

	/**
	 * 查询数据
	 */
	function searchData() {
		page.dto.recordStartDate = page.range[0]
		page.dto.recordEndDate = page.range[1]
		page.dto.recordType = selectedButtonCode.value == -1 ? '' : selectedButtonCode.value
		mealListStatus.value = 'loading'
		Promise.all([searchStatistics(), searchPage()])
			.then(([result1, result2]) => {
				// 这里可以进行后续的同步操作
			})
			.catch((error) => {
				console.error('请求失败:', error);
			});
	}

	function handleRecordClick(item) {
		uni.navigateTo({
			url: '/pages/bookkeeping/bookkeeping-detail?id=' + item.id
		});
	}

	function initPage() {
		page.dto.currentPage = 1
		page.list = []
		searchData()
	}

	onPullDownRefresh(() => {
		initPage()
	})

	// 上拉加载更多
	onReachBottom(() => {
		page.dto.currentPage++
		searchData()
	})
</script>

<style>
	/* 主容器布局 */
	.container {
		padding: 10px;
	}

	/* 筛选容器布局 */
	.filter-container {
		display: flex;
		align-items: center;
		background-color: #f5f5f5;
		justify-content: space-between;
		/* 确保两边对齐 */
		overflow: hidden;
		/* 避免内容溢出 */
	}

	/* 滑动区域 */
	.button-group {
		white-space: nowrap;
		width: calc(100% - 60px);
		/* 保留筛选按钮的空间 */
	}

	/* 按钮样式 */
	.button-group-item {
		display: inline-block;

		flex-shrink: 0;
		padding: 5px 10px;
		margin-right: 10px;
		background-color: #fff;
		border: 1px solid #ddd;
		border-radius: 4px;
		text-align: center;
		font-size: 14px;
		cursor: pointer;
	}

	.button-group-item.active {
		border-color: #007aff;
		color: #007aff;
	}

	/* 筛选按钮 */
	.filter-button {
		flex-shrink: 0;
		padding: 5px 10px;
		background-color: #007aff;
		color: #fff;
		border-radius: 4px;
		font-size: 14px;
		text-align: center;
		cursor: pointer;
	}

	/* 筛选弹出层样式 */
	.popup-content {
		background-color: #fff;
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;
		overflow: hidden;
	}

	.popup-header {
		padding: 15px;
		border-bottom: 1px solid #eee;
	}

	.popup-title {
		font-size: 16px;
		font-weight: bold;
	}

	.popup-body {
		padding: 15px;
	}

	.filter-item {
		margin-bottom: 15px;
	}

	.filter-label {
		font-size: 14px;
		margin-bottom: 5px;
		display: block;
	}

	.category-group {
		display: flex;
		overflow-x: scroll;
	}

	.category-button {
		flex-shrink: 0;
		padding: 5px 10px;
		margin-right: 10px;
		background-color: #f5f5f5;
		border-radius: 4px;
		font-size: 14px;
		cursor: pointer;
	}

	.category-button.selected {
		background-color: #007aff;
		color: #fff;
	}

	.popup-footer {
		display: flex;
		justify-content: space-between;
		padding: 10px;
		border-top: 1px solid #eee;
	}

	.cancel-button,
	.confirm-button {
		flex: 1;
		padding: 10px;
		font-size: 16px;
		cursor: pointer;
		border: none;
		border-radius: 4px;
	}

	.cancel-button {
		background-color: #ccc;
		color: #fff;
		margin-right: 10px;
	}

	.confirm-button {
		background-color: #007aff;
		color: #fff;
	}
</style>