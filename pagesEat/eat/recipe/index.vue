<!-- 食谱 -->
<template>
	<view class="recipe-container">
		<!-- 搜索栏 -->
		<view class="search-section">
			<uni-search-bar @confirm="initSearchData()" v-model="dishesName" @clear="initSearchData()" maxlength="32"
				placeholder="搜索菜品" cancelButton="none" radius="100" bgColor="#f5f5f5"></uni-search-bar>
		</view>

		<!-- 分类标签 -->
		<scroll-view class="category-scroll" scroll-x="true" show-scrollbar="false">
			<view class="category-list">
				<view v-for="(item, index) in dishesTypes" :key="index" class="category-item"
					:class="{ active: dishesTypeStyle(item) === 'primary' }" @click="() => clickDishesType(index)">
					{{ item.dictName }}
				</view>
			</view>
		</scroll-view>

		<!-- 菜品列表 -->
		<scroll-view class="dishes-scroll" scroll-y="true" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="initSearchData()" @scrolltolower="loadMoreDishes()">
			<view v-if="dishesPage.list.length > 0" class="dishes-grid">
				<view v-for="dish in dishesPage.list" :key="dish.id" class="dish-card" @click="intoDishDetail(dish.id)"
					@longpress="showActionSheet(dish)">
					<image :src="dish.dishesImage" :alt="dish.dishesName" class="dish-image" mode="aspectFill" />
					<view class="dish-info">
						<view class="dish-header">
							<text class="dish-name">{{ dish.dishesName }}</text>
							<view v-if="dish.userId === currentUserId" class="self-maintain-tag">
								<uni-icons type="person" size="12" color="#007AFF"></uni-icons>
								<text>我的</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<uni-load-more :status="dishesListStatus" :contentText="contentTextObj" />
		</scroll-view>

		<!-- 添加按钮 -->
		<view class="add-btn" @click="navigateToAdd">
			<uni-icons type="plusempty" size="24" color="#fff"></uni-icons>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		watch,
		reactive
	} from 'vue'
	import {
		onPullDownRefresh,
		onReachBottom,
		onLoad
	} from '@dcloudio/uni-app'
	import http from '@/api/request.js'

	import {
		useDictStore
	} from "@/stores/dict.ts"

	const dictStore = useDictStore()

	// 菜品名称搜索条件
	const dishesName = ref('')
	// 菜品列表加载页面
	const dishesListStatus = ref('more')
	// 下拉刷新状态
	const triggered = ref(false)

	// 滚动列表加载标题
	const contentTextObj = {
		contentdown: "上拉显示更多",
		contentrefresh: "正在加载...",
		contentnomore: "没有更多菜品了"
	}

	// 菜品类型
	const dishesTypes = ref([{
		dictCode: 0,
		dictName: '全部'
	}])

	// 菜品分页数据
	const dishesPage = reactive({
		pageParam: {
			currentPage: 1,
			pageSize: 10,
			dishesType: 0,
			dishesName: ''
		},
		list: []
	})

	const currentUserId = ref(null)

	onLoad(() => {
		// 获取当前登录用户信息
		const userInfo = uni.getStorageSync('userInfo')
		if (userInfo) {
			currentUserId.value = userInfo.id
		}
		
		dishesTypes.value = [{
			dictCode: 0,
			dictName: '全部'
		}]
		const types = dictStore.getDictDataArray(dictStore.dictTypeEnum.EAT_DISHES_TYPE)
		dishesTypes.value.push(...types)

		initSearchData()
	})
	
	// 菜品类型style样式
	const dishesTypeStyle = (dishesType) => {
		return dishesType.dictCode == dishesPage.pageParam.dishesType ? 'primary' : 'default'
	}

	/**
	 * 菜品类型点击事件
	 * @param index dishesTypes的数组下标
	 */
	function clickDishesType(index) {
		const dishesType = dishesTypes.value[index]
		if (dishesType && dishesType.dictCode != dishesPage.pageParam.dishesType) {
			dishesPage.pageParam.dishesType = dishesType.dictCode
			initSearchData()
		}
	}

	// 初始化查询菜品数据
	function initSearchData() {
		dishesPage.pageParam.currentPage = 1
		dishesPage.pageParam.pageSize = 10
		dishesPage.list = []
		fetchDishes()
	}

	// 加载更多菜品数据
	const loadMoreDishes = () => {
		if (dishesListStatus.value === 'noMore') {
			return
		}
		dishesPage.pageParam.currentPage++
		fetchDishes()
	}

	/**
	 * 拉取菜品数据
	 */
	const fetchDishes = () => {
		dishesPage.pageParam.dishesName = dishesName.value
		triggered.value = true
		dishesListStatus.value = 'loading'
		http.post('/eat-service/eat/dishes/page', dishesPage.pageParam)
			.then(res => {
				if (res.data.records && res.data.records.length == dishesPage.pageParam.pageSize) {
					dishesListStatus.value = 'more'
				} else {
					dishesListStatus.value = 'noMore'
				}
				dishesPage.list = [...dishesPage.list, ...res.data.records]
			})
			.catch(err => {
				dishesListStatus.value = 'more'
			})
			.finally(() => {
				triggered.value = false
			});
	}

	// 进入菜品详情页面
	const intoDishDetail = (dishId) => {
		uni.navigateTo({
			url: '/pagesEat/eat/dishes/dishes-detail?id=' + dishId
		});
	}

	// 跳转到添加菜品页面
	const navigateToAdd = () => {
		uni.navigateTo({
			url: '/pagesEat/eat/dishes/dishes-form'
		});
	}

	
	// 显示操作菜单
	const showActionSheet = (dish) => {
		if (dish.userId === currentUserId.value) {
			uni.showActionSheet({
				itemList: ['编辑菜品', '删除菜品'],
				success: (res) => {
					switch (res.tapIndex) {
						case 0: // 编辑菜品
							uni.navigateTo({
								url: `/pagesEat/eat/dishes/dishes-form?id=${dish.id}`
							})
							break
						case 1: // 删除菜品
							uni.showModal({
								title: '确认删除',
								content: '确定要删除这个菜品吗？',
								success: (res) => {
									if (res.confirm) {
										deleteDish(dish.id)
									}
								}
							})
							break
					}
				}
			})
		} else {
			uni.showToast({
				title: '无法操作他人维护的菜品',
				icon: 'none',
				duration: 2000
			})
		}
	}

	// 删除菜品
	const deleteDish = async (id) => {
		await http.delete(`/eat-service/eat/dishes/delete?id=${id}`)
		uni.showToast({
			title: '删除成功',
			icon: 'success'
		})
		// 刷新列表
		initSearchData()
	}
</script>

<style lang="scss">
.recipe-container {
	min-height: 100vh;
	background-color: #ffffff;
}

.search-section {
	padding: 16px;
	background-color: #ffffff;

	:deep(.uni-searchbar) {
		padding: 0 !important;
	}
}

.category-scroll {
	white-space: nowrap;
	padding: 0 16px;
}

.category-list {
	display: inline-flex;
	padding: 4px 0;
}

.category-item {
	padding: 8px 16px;
	margin-right: 12px;
	border-radius: 20px;
	font-size: 14px;
	background-color: #f5f5f5;
	color: #666;
	transition: all 0.3s ease;

	&.active {
		background-color: #007AFF;
		color: #ffffff;
	}
}

.dishes-scroll {
	height: calc(100vh - 180px);
}

.dishes-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16px;
	padding: 16px;
}

.dish-card {
	background: #ffffff;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	transition: transform 0.2s ease;

	&:active {
		transform: scale(0.98);
	}
}

.dish-image {
	width: 100%;
	height: 160px;
	object-fit: cover;
}

.dish-info {
	padding: 12px;
}

.dish-header {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.dish-name {
	font-size: 16px;
	font-weight: 600;
	color: #333;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	line-height: 1.4;
}

.self-maintain-tag {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	background-color: rgba(0, 122, 255, 0.1);
	padding: 4px 8px;
	border-radius: 12px;
	width: fit-content;
	
	text {
		font-size: 12px;
		color: #007AFF;
	}
}

.empty-state {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 200px;
	color: #999;
	font-size: 14px;
}

.add-btn {
	position: fixed;
	right: 24px;
	bottom: 24px;
	width: 56px;
	height: 56px;
	background-color: #007AFF;
	border-radius: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
	transition: transform 0.2s ease;

	&:active {
		transform: scale(0.95);
	}
}
</style>