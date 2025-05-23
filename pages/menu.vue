<template>
	<view class="menu-container">
		<view class="search-box">
			<uni-search-bar
				v-model="searchValue"
				placeholder="搜索功能"
				@input="handleSearch"
				radius="100"
				cancelButton="none"
			/>
		</view>
		
		<scroll-view scroll-y class="menu-scroll">
			<view v-for="(menu, menuIndex) in filteredMenuList" :key="menuIndex" class="menu-section">
				<view class="section-title">{{ menu.title }}</view>
				<view class="menu-grid">
					<view 
						v-for="(item, index) in menu.components" 
						:key="index"
						class="menu-item"
						@tap="handleNavigate(item.path)"
					>
						<view class="icon-wrapper">
							<image :src="item.url" class="image" mode="aspectFill" />
						</view>
						<text class="text">{{ item.text }}</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchValue = ref('')

const menuList = [{
		title: '餐饮服务',
		components: [{
				url: '/static/menus/eat-recipe.png',
				text: '食谱',
				path: '/pagesEat/eat/recipe/index'
			},
			{
				url: '/static/menus/eat-dishes.png',
				text: '点餐',
				path: '/pagesEat/eat/dishes/index'
			},
			{
				url: '/static/menus/eat-meal.png',
				text: '用餐记录',
				path: '/pagesEat/eat/meal/index'
			}
		]
	},
	{
		title: '记账服务',
		components: [{
				url: '/static/menus/bookkeeping-action.png',
				text: '记账',
				path: '/pagesBookkeeping/bookkeeping/bookkeeping-action'
			},
			{
				url: '/static/menus/bookkeeping-records.png',
				text: '记账记录',
				path: '/pagesBookkeeping/bookkeeping/bookkeeping-records'
			},
			{
				url: '/static/menus/bookkeeping-statistics.png',
				text: '收支分析',
				path: '/pagesBookkeeping/bookkeeping/bookkeeping-statistics'
			},
			{
				url: '/static/menus/bookkeeping-wallet.png',
				text: '钱包',
				path: '/pagesBookkeeping/bookkeeping/bookkeeping-wallet'
			}
		],
	},
	{
		title: '积分服务',
		components: [{
				url: '/static/menus/points-action.png',
				text: '新增积分',
				path: '/pagesPoints/points/points-action'
			},
			{
				url: '/static/menus/points-records.png',
				text: '积分记录',
				path: '/pagesPoints/points/points-records'
			},
			{
				url: '/static/menus/points-task.png',
				text: '任务计划',
				path: '/pagesPoints/points/task-plan'
			},
			{
				url: '/static/menus/points-statistics.png',
				text: '积分分析',
				path: '/pagesPoints/points/points-statistics'
			},
			{
				url: '/static/menus/task-list.png',
				text: '任务列表',
				path: '/pagesPoints/points/task-list'
			}
		],
	},
	{
		title: '基础服务',
		components: [{
				url: '/static/menus/dict-manage.png',
				text: '字典管理',
				path: '/pagesBase/base/dict-manage'
			},
			{
				url: '/static/menus/account-manage.png',
				text: '账号管理',
				path: '/pagesBase/base/account-manage'
			}
		],
	}
]

const filteredMenuList = computed(() => {
	if (!searchValue.value) return menuList
	
	return menuList.map(menu => ({
		...menu,
		components: menu.components.filter(item => 
			item.text.toLowerCase().includes(searchValue.value.toLowerCase())
		)
	})).filter(menu => menu.components.length > 0)
})

function handleSearch(e) {
	searchValue.value = e.value
}

function handleNavigate(path) {
	uni.navigateTo({
		url: path
	})
}
</script>

<style lang="scss">
.menu-container {
	background-color: #f8f9fa;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
}

.search-box {
	background-color: #fff;
	position: sticky;
	top: 0;
	z-index: 100;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-scroll {
	flex: 1;
	height: calc(100vh - 60px);
}

.menu-section {
	margin: 12px 16px;
	background-color: #fff;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
	padding: 12px 16px;
	font-size: 16px;
	font-weight: 600;
	color: #333;
	border-bottom: 1px solid #f0f0f0;
}

.menu-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 1px;
	background-color: #f0f0f0;
}

.menu-item {
	background-color: #fff;
	padding: 16px;
	display: flex;
	align-items: center;
	gap: 12px;
	
	&:active {
		background-color: #f5f5f5;
	}
}

.icon-wrapper {
	width: 40px;
	height: 40px;
	background-color: #f0f7ff;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.image {
	width: 24px;
	height: 24px;
}

.text {
	font-size: 14px;
	color: #333;
	flex: 1;
}

:deep(.uni-searchbar) {
	padding: 0;
	
	.uni-searchbar__box {
		padding: 0 12px;
	}
}
</style>