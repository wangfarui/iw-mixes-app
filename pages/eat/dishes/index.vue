<template>
	<view class="container">
		<uni-row class="demo-uni-row">
			<uni-col :span="6">
				<view>
					<scroll-view :scroll-top="0" scroll-y="true" style="height: 90vh">
						<view v-for="category in categories" :key="category.dishesType"
							@click="selectCategory(category.dishesType)" :style="categoryStyle(category)">
							<view class="category-name">
								{{ category.name }}
							</view>
						</view>
					</scroll-view>
				</view>
			</uni-col>
			<uni-col :span="18">
				<scroll-view :scroll-top="0" scroll-y="true" style="height: 90vh" refresher-enabled="true"
					:refresher-triggered="triggered" @refresherrefresh="selectCategory(dishesPage.pageParam.dishesType)"
					@scrolltolower="loadMoreDishes()">
					<view v-if="dishesPage.list.length > 0">
						<view v-for="dish in dishesPage.list" :key="dish.id" @click="intoDishDetail(dish.id)">
							<uni-row class="demo-uni-row">
								<uni-col :span="12">
									<view>
										<image :src="dish.dishesImage" :alt="dish.dishesName"
											style="width: 20vh;height: 20vh;" />
									</view>
								</uni-col>
								<uni-col :span="12">
									<view class='dishes'>
										<p class='dishesName'>{{ dish.dishesName }}</p>
										<p>难度系数: {{ dish.difficultyFactor }}</p>
										<p>用时: {{ dish.useTime }}分钟</p>
										<p>
											<uni-row>
												<uni-col :span="18">
													价格: ¥<text
														style="font-size: 16px;font-weight: bolder;">{{ dish.prices }}</text>
												</uni-col>
												<uni-col :span="6">
													<view v-if="cartStore.cartItems.find(i => i.id === dish.id)"
														@click.stop="subtractToCart(dish)">
														<uni-icons type="minus" size="30"></uni-icons>
													</view>
													<view v-else @click.stop="addToCart(dish)">
														<uni-icons type="plus-filled" size="30"></uni-icons>
													</view>
												</uni-col>
											</uni-row>
										</p>
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
			</uni-col>
		</uni-row>

		<view>
			<Cart />
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
		useCartStore
	} from '@/stores/cart'
	import {
		onPullDownRefresh,
		onReachBottom,
		onLoad
	} from '@dcloudio/uni-app'
	import Cart from '@/pages/eat/dishes/cart.vue'
	import http from '@/api/request.js'

	const categories = ref([])
	const dishesListStatus = ref('more')
	const triggered = ref(false)
	const cartStore = useCartStore()
	const dishesPage = reactive({
		pageParam: {
			currentPage: 1,
			pageSize: 10,
			dishesType: 0
		},
		list: []
	})

	const contentTextObj = {
		contentdown: "上拉显示更多",
		contentrefresh: "正在加载...",
		contentnomore: "没有更多菜品了"
	}

	// Simulated API data
	categories.value = [{
			dishesType: 0,
			name: '全部',
			selected: true
		},
		{
			dishesType: 1,
			name: '荤菜',
			selected: false
		},
		{
			dishesType: 2,
			name: '素菜',
			selected: false
		},
		{
			dishesType: 3,
			name: '荤素搭配',
			selected: false
		}
	]

	const categoryStyle = (category) => {
		return {
			marginBottom: '10px',
			fontSize: '16px',
			backgroundColor: category.selected ? 'lightblue' : 'transparent'
		}
	}

	onLoad(() => {
		selectCategory(0)
	})

	const fetchDishes = (dishesType) => {
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

	const loadMoreDishes = () => {
		dishesPage.pageParam.currentPage++
		fetchDishes()
	}

	const selectCategory = (dishesType) => {
		dishesPage.pageParam.currentPage = 1
		dishesPage.pageParam.pageSize = 10
		dishesPage.pageParam.dishesType = dishesType
		dishesPage.list = []
		categories.value.forEach((category) => {
			category.selected = category.dishesType === dishesType
		})
		fetchDishes()
	}

	const intoDishDetail = (dishId) => {
		uni.navigateTo({
			url: '/pages/eat/dishes/dishes-detail?operate=edit&id=' + dishId
		});
	}

	const addToCart = (dish) => {
		cartStore.addItem(dish)
	}

	const subtractToCart = (dish) => {
		cartStore.subtractItem(dish)
	}
</script>

<style lang="scss">
	.goods-carts {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		position: fixed;
		left: 0;
		right: 0;
		/* #ifdef H5 */
		left: var(--window-left);
		right: var(--window-right);
		/* #endif */
		bottom: 0;
	}

	.demo-uni-row {
		margin-bottom: 10px;

		// 组件在小程序端display为inline
		// QQ、抖音小程序文档写有 :host，但实测不生效
		// 百度小程序没有 :host
		/* #ifdef MP-TOUTIAO || MP-QQ || MP-BAIDU */
		display: block;
		/* #endif */
	}

	.category-name {
		padding: 10px;
		cursor: pointer;
	}

	.dishes {
		font-size: 14px;
		font-weight: normal;
	}

	.dishesName {
		font-weight: bolder;
		font-size: 18px;
	}
</style>