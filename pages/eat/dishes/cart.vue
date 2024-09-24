<template>
	<view>
		<view>
			<uni-drawer ref="showShoppingCart" mode="right" :width="300">
				<view>
					<view v-if="cartStore.cartItems.length > 0">
						已下单{{cartStore.cartItems.length}}个菜品哦~
					</view>
					<view v-else>
						还没有菜品加入购物车哦～
					</view>
					<view v-for="dish in cartStore.cartItems" :key="dish.id">
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
												<view @click.stop="subtractToCart(dish)">
													<uni-icons type="minus" size="30"></uni-icons>
												</view>
											</uni-col>
										</uni-row>
									</p>
								</view>
							</uni-col>
						</uni-row>
					</view>
				</view>
			</uni-drawer>
		</view>
		<view class="goods-carts">
			<uni-goods-nav :options="cartStore.options" :fill="true" :button-group="buttonGroup" @click="onClick"
				@buttonClick="buttonClick" />
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import {
		useCartStore
	} from '@/stores/cart'
	
	const cartStore = useCartStore()
	const showShoppingCart = ref(null);
	
	const buttonGroup = [{
		text: '去下单',
		backgroundColor: 'linear-gradient(90deg, #FE6035, #EF1224)',
		color: '#fff'
	}]
	
	const subtractToCart = (dish) => {
		cartStore.subtractItem(dish)
	}
	
	// 左侧点击事件
	function onClick(e) {
		showShoppingCart.value.open()
	}
	// 右侧按钮组点击事件
	function buttonClick(e) {
		uni.navigateTo({
			url: '/pages/eat/dishes/cart-confirm'
		});
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
</style>