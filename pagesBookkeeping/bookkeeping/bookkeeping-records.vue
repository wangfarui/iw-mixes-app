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
			<uni-datetime-picker v-model="pageRange" type="daterange" start-placeholder="记账开始日期"
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
									<view>{{item.recordTimeStr}}</view>
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
		<uni-popup ref="filterDialog" type="bottom" :is-mask-click="true">
			<view class="popup-content">
				<view class="popup-header">
					<text class="popup-title">筛选条件</text>
				</view>
				<view class="popup-body">
					<!-- 过滤不计入统计的账单 -->
					<view class="filter-item">
						<view class="switch-container" style="color: #bfbfbf; font-size: 12px;">
							<view style="text-align: start;">
								<text class="filter-label">过滤不计入统计的账单：</text>
							</view>
							<view style="text-align: end;">
								<switch :checked="ignoreNotStatistics" @change="switchIgnoreStatistics" style="transform:scale(0.7)" />
							</view>
						</view>
					</view>
					<!-- 记录来源模糊查询 -->
					<view class="filter-item">
						<text class="filter-label">记录来源：</text>
						<uni-row>
							<uni-easyinput v-model="page.dto.recordSource" maxlength="64"></uni-easyinput>
						</uni-row>
					</view>
					<!-- 金额范围输入 -->
					<view class="filter-item">
						<text class="filter-label">金额范围：</text>
						<uni-row>
							<uni-col :span="10">
								<input class="filter-input" v-model="page.dto.mixAmount" placeholder="最低金额" type="number" />
							</uni-col>
							<uni-col :span="4" style="text-align: center;">-</uni-col>
							<uni-col :span="10">
								<input class="filter-input" v-model="page.dto.maxAmount" placeholder="最高金额" type="number" />
							</uni-col>
						</uni-row>
					</view>
					<!-- 标签选择 -->
					<view class="filter-item">
						<text class="filter-label">标签：</text>
						<scroll-view scroll-y class="category-group">
							<view class="category-button"
								:class="{ selected: tagIdList.includes(category.id) }"
								v-for="category in dictStore.getDictDataArray(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TAG)"
								:key="category.id" @click="toggleCategory(category.id)">
								{{ category.dictName }}
							</view>
						</scroll-view>
					</view>
				</view>
				<!-- 底部按钮 -->
				<view class="popup-footer">
					<button class="cancel-button" @click="resetFilter">重置</button>
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
		onLoad,
		onReady
	} from '@dcloudio/uni-app'
	import http from '@/api/request.js'
	import {getMonthStartAndEnd, formatDate} from'@/stores/date-utils.js'
	import {
		useDictStore
	} from "@/stores/dict.ts";

	const dictStore = useDictStore()

	const mealListStatus = ref('more')

	const showCurrentMonth = ref(true)

	const buttonList = ['全部', '支出', '收入']
	const selectedButtonCode = ref(-1)
	const filterDialog = ref(null);
	// 忽略不计入统计数据
	const ignoreNotStatistics = ref(false)
	// 筛选的标签
	const tagIdList = ref([])
	
	const pageRange = ref(['', ''])
	const page = reactive({
		dto: {
			currentPage: 1,
			pageSize: 20,
			recordStartDate: '', // 记账记录开始时间
			recordEndDate: '', // 记账记录结束时间
			recordType: '', // 记录分类
			recordSource: '', // 记录来源
			mixAmount: '', // 最小金额
			maxAmount: '', // 最大金额
			tagIdList: [], // 记账标签id集合
			isSearchAll: '', // 是否查询所有记录
		},
		list: [],
		statistics: {}
	})
	
	function initFormSearchDto() {
		page.dto.recordStartDate = ''; // 记账记录开始时间
		page.dto.recordEndDate = ''; // 记账记录结束时间
		page.dto.recordType = ''; // 记录分类
		page.dto.recordSource = ''; // 记录来源
		page.dto.mixAmount = ''; // 最小金额
		page.dto.maxAmount = ''; // 最大金额
		page.dto.tagIdList = []; // 记账标签id集合
		page.dto.isSearchAll = ''; // 是否查询所有记录
	}
	
	function initFormPageDto() {
		page.list = []
		page.dto.currentPage = 1;
		page.dto.pageSize = 20;
	}
	
	onLoad((option) => {
		if (option.recordDate) {
			const [year, month] = option.recordDate.split("-").map(Number);
			const {firstDay, lastDay} = getMonthStartAndEnd(new Date(year, month, 1))
			pageRange.value[0] = firstDay
			pageRange.value[1] = lastDay
		}
		if (option.recordType) {
			selectedButtonCode.value = option.recordType
		}
		if (option.ignoreNotStatistics) {
			ignoreNotStatistics.value = option.ignoreNotStatistics
		}
	})
	
	onReady(() => {
		if (pageRange.value[0] != '') {
			const firstDate = new Date(pageRange.value[0]);
			const lastDate = new Date(pageRange.value[1]);
			pageRange.value = [formatDate(firstDate), formatDate(lastDate)]
		}
		
		selectedButtonCode.value = selectedButtonCode.value - 1 + 1
		
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
	
	function switchIgnoreStatistics() {
		ignoreNotStatistics.value = !ignoreNotStatistics.value
	}

	function openFilter() {
		filterDialog.value.open();
	}

	function resetFilter() {
		// 重置高级筛选中的筛选条件
		tagIdList.value = []
		ignoreNotStatistics.value = false;
		// 并且重置查询表单
		initFormSearchDto();
		
		filterDialog.value.close();
		
		initPage()
	}

	function applyFilter() {
		// 应用筛选项
		page.dto.isSearchAll = ignoreNotStatistics.value ? 0 : 1
		page.dto.tagIdList = tagIdList.value
		
		filterDialog.value.close();
		
		initPage()
	}

	function toggleCategory(id) {
		const index = tagIdList.value.indexOf(id);
		if (index !== -1) {
			tagIdList.value.splice(index, 1)
		} else {
			tagIdList.value.push(id)
		}
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
			pageRange.value = ['', '']
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
			http.post('/bookkeeping-service/bookkeepingRecords/statistics', page.dto)
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
			http.post('/bookkeeping-service/bookkeepingRecords/page', page.dto)
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
		// 记录日期
		page.dto.recordStartDate = pageRange.value[0]
		page.dto.recordEndDate = pageRange.value[1]
		// 记录分类
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
			url: '/pagesBookkeeping/bookkeeping/bookkeeping-detail?id=' + item.id
		});
	}

	function initPage() {
		initFormPageDto()
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
		height: 150px;
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
	
	.switch-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10rpx 20rpx;
	}
</style>