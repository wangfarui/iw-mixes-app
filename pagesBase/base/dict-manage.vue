<!-- 字典管理 -->
<template>
	<view>
		<view class="container">
			<view class="filter-section">
				<view class="filter-row">
					<view class="filter-item">
						<uni-data-select
							v-model="filterForm.dictType"
							:localdata="dictTypeOptions"
							placeholder="请选择字典类型"
							@change="handleFilterChange"
						/>
					</view>
					<view class="filter-item">
						<uni-easyinput
							v-model="filterForm.dictName"
							placeholder="请输入字典名称"
							@blur="handleFilterChange"
							@clear="handleFilterChange"
						/>
					</view>
					<view class="filter-item">
						<uni-data-select
							v-model="filterForm.dictStatus"
							:localdata="[{value: 1, text: '启用'}, {value: 0, text: '禁用'}]"
							placeholder="请选择状态"
							@change="handleFilterChange"
						/>
					</view>
					<view class="filter-action">
						<button class="add-btn" @click="handleAddDict">新增</button>
					</view>
				</view>
			</view>
			<view class="content">
				<uni-list>
					<uni-list-item v-for="item in dictList" :key="item.id" @click="handleDictClick(item)" clickable>
						<template v-slot:body>
							<view class="item">
								<uni-row>
									<view>字典名称：{{item.dictName}}</view>
								</uni-row>
								<uni-row>
									<view>字典类型：{{dictStore.getDictTypeName(item.dictType)}}</view>
								</uni-row>
								<uni-row>
									<view>字典状态：{{item.dictStatus == 1 ? '启用' : '禁用'}}</view>
								</uni-row>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
				<view>
					<uni-load-more :status="dictListStatus" />
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, reactive } from 'vue'
	import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
	import http from '@/api/request.js'
	import {
		useDictStore
	} from "@/stores/dict.ts"

	const dictStore = useDictStore()
	const dictListStatus = ref('more')
	const dictList = ref([])

	const filterForm = reactive({
		dictType: '',
		dictName: '',
		dictStatus: ''
	})

	const dictTypeOptions = ref(dictStore.getDictTypeArray().map(item => ({
		value: item.code,
		text: item.name
	})))

	const page = reactive({
		dto: {
			currentPage: 1,
			pageSize: 10,
			dictType: '',
			dictName: '',
			dictStatus: ''
		}
	})

	function handleFilterChange() {
		page.dto.dictType = filterForm.dictType
		page.dto.dictName = filterForm.dictName
		page.dto.dictStatus = filterForm.dictStatus
		initPage()
	}

	function searchPage() {
		dictListStatus.value = 'loading'
		http.post('/auth-service/dict/page', page.dto)
			.then(res => {
				const data = res.data
				if (data.records && data.records.length == page.dto.pageSize) {
					dictListStatus.value = 'more'
				} else {
					dictListStatus.value = 'noMore'
				}
				dictList.value = [...dictList.value, ...data.records]
			})
			.catch(error => {
				dictListStatus.value = 'more'
			})
			.finally(() => {
				uni.stopPullDownRefresh();
			});
	}

	function handleDictClick(item) {
		uni.navigateTo({
			url: '/pagesBase/base/dict-detail?id=' + item.id
		});
	}

	function handleAddDict() {
		uni.navigateTo({
			url: '/pagesBase/base/dict-detail'
		});
	}

	function initPage() {
		page.dto.currentPage = 1
		dictList.value = []
		searchPage()
	}

	onPullDownRefresh(() => {
		initPage()
	})

	onReachBottom(() => {
		page.dto.currentPage++
		searchPage()
	})

	onShow(() => {
		initPage()
	})
</script>

<style>
	.container {
		padding: 10px;
	}
	.filter-section {
		margin-bottom: 10px;
		background-color: #fff;
		padding: 10px;
		border-radius: 5px;
	}
	.filter-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.filter-item {
		flex: 1;
	}
	.filter-action {
		width: 60px;
		display: flex;
		justify-content: flex-end;
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
	.content {
		background-color: #fff;
	}
	.item {
		padding: 10px 0;
	}
</style> 