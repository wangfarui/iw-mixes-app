<!-- 食谱 -->
<template>
	<view>
		<view>
			<uni-search-bar @confirm="initSearchData()" v-model="dishesName" @clear="initSearchData()" maxlength="32"
				placeholder="请输入菜品名称" cancelButton="none"></uni-search-bar>
		</view>
		<view style="margin-bottom: 10px;">
			<uni-tag v-for="(item, index) in dishesTypes" :circle="true" :text="item.dictName" :type="dishesTypeStyle(item)"
				@click="() => clickDishesType(index)" style="margin-left: 5px" />
		</view>
		<view style="margin-left: 5px">
			<scroll-view :scroll-top="0" scroll-y="true" style="height: 90vh" refresher-enabled="true"
				:refresher-triggered="triggered" @refresherrefresh="initSearchData()" @scrolltolower="loadMoreDishes()">
				<view v-if="dishesPage.list.length > 0">
					<view v-for="dish in dishesPage.list" :key="dish.id" @click="intoDishDetail(dish.id)" @longpress="showActionSheet(dish)">
						<uni-row class="demo-uni-row">
							<uni-col :span="12">
								<view>
									<image :src="dish.dishesImage" :alt="dish.dishesName"
										style="width: 20vh;height: 20vh;border-radius: 10%;" />
								</view>
							</uni-col>
							<uni-col :span="12">
								<view class='dishes'>
									<p class='dishesName'>{{ dish.dishesName }}</p>
									<p>难度系数: {{ dish.difficultyFactor }}</p>
									<p>用时: {{ dish.useTime }}分钟</p>
								</view>
							</uni-col>
						</uni-row>
					</view>
					<view>
						<uni-load-more :status="dishesListStatus" :contentText="contentTextObj" />
					</view>
				</view>
				<view v-else>展示没有菜品哦~</view>
			</scroll-view>
		</view>

		<!-- 添加按钮 -->
		<view class="add-btn" @click="navigateToAdd">
			<uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
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

	onLoad(() => {
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
		http.post('/eat-service/dishes/page', dishesPage.pageParam)
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
	}

	// 删除菜品
	const deleteDish = async (id) => {
		await http.delete(`/bookkeeping-service/eat/dishes/delete?id=${id}`)
		uni.showToast({
			title: '删除成功',
			icon: 'success'
		})
		// 刷新列表
		initSearchData()
	}
</script>

<style lang="scss">
	.demo-uni-row {
		margin-bottom: 10px;

		// 组件在小程序端display为inline
		// QQ、抖音小程序文档写有 :host，但实测不生效
		// 百度小程序没有 :host
		/* #ifdef MP-TOUTIAO || MP-QQ || MP-BAIDU */
		display: block;
		/* #endif */
	}

	.dishes {
		font-size: 14px;
		font-weight: normal;
	}

	.dishesName {
		font-weight: bolder;
		font-size: 18px;
	}

	.add-btn {
		position: fixed;
		right: 20px;
		bottom: 20px;
		width: 50px;
		height: 50px;
		background-color: #007AFF;
		border-radius: 25px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	}
</style>