<template>
	<view class="container">
		<view>
			<image :src="dishDetail.dishesImage" :alt="dishDetail.dishesName" style="width: 100vw;height: 20vh;" />
		</view>
		<view class="container-item" style="font-weight: bolder;font-size: 18px;">
			<uni-row>
				<uni-col :span="17">
					<view style="line-height: 5vh;">
						{{dishDetail.dishesName}}
					</view>
				</uni-col>
				<uni-col v-if="isEditOperate" :span="7">
					<view v-if="cartStore.cartItems.find(i => i.id === dishDetail.id)" @click="subtractToCart(dish)">
						<view class='add-card' @click="cartStore.subtractItem(dishDetail)"> ➖ 移除购物车</view>
					</view>
					<view v-else class='add-card' @click="cartStore.addItem(dishDetail)"> ➕ 加入购物车</view>
				</uni-col>
			</uni-row>
		</view>

		<uni-section title="基础信息" type="circle" titleFontSize="18px">
			<view class="container-item">
				<uni-row>
					<view style="line-height: 5vh;">
						<uni-col :span="5">难度系数：</uni-col>
						<uni-col :span="2" v-for="(item, index) in dishDetail.difficultyFactor" :key="index">
							<uni-icons type="star-filled" size="30"></uni-icons>
						</uni-col>
					</view>

				</uni-row>
			</view>
			<view class="container-item">
				用时：{{dishDetail.useTime}}分钟
			</view>
			<view class="container-item">
				价格: ¥<text style="font-size: 16px;font-weight: bolder;">{{ dishDetail.prices }}</text>
			</view class="container-item">
			<view class="container-item">
				备注：{{dishDetail.remark}}
			</view>
		</uni-section>

		<uni-section title="所需食材" type="circle" titleFontSize="18px">
			<view class="container-item">
				<view v-for="(item, index) in dishDetail.dishesMaterialList" :key="index" class="dishes-material-item">
					<view class="row" style="margin-bottom: 10px;">
						<view class="col material-key" style="flex: 1;">
							{{item.materialName}}<text class="material-value">{{item.materialDosage}}</text>
						</view>
					</view>
				</view>
			</view>
		</uni-section>

		<view style="padding-bottom: 6vh;">
			<uni-section title="制作方法" type="circle" titleFontSize="18px">
				<view class="container-item">
					<view v-for="(item, index) in dishDetail.dishesCreationMethodList" :key="index" class=".dishes-creation-method-item">
						<view class="row" style="font-size: 17px;">
								步骤 {{ index + 1 }}
						</view>
						<view v-if="item.stepImage" style="margin-bottom: 10px;">
							<image :src="item.stepImage" mode="heightFix"  />
						</view>
						<view style="font-size: 14px;">
							{{item.stepContent}}
						</view>
					</view>
				</view>
			</uni-section>
		</view>

		<view v-if="isEditOperate">
			<Cart />
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		useCartStore
	} from '@/stores/cart'
	import Cart from '@/pages/dishes/cart.vue'
	import http from '@/api/request.js'

	const cartStore = useCartStore()
	const dishDetail = ref({})
	const isEditOperate = ref(false)

	onLoad((option) => {
		if (option.operate && option.operate == 'edit') {
			isEditOperate.value = true
		}
		http.get('/dishes/detail?id=' + option.id)
			.then(res => {
				dishDetail.value = res.data
			})
	})
</script>

<style>
	.container-item {
		padding: 0 10px;
		margin-bottom: 10px;
	}

	.add-card {
		-webkit-tap-highlight-color: transparent;
		background-color: yellow;
		border-radius: 5px;
		box-sizing: border-box;
		color: #000;
		cursor: pointer;
		display: block;
		font-size: 12px;
		line-height: 5vh;
		margin-left: auto;
		margin-right: auto;
		overflow: hidden;
		position: relative;
		text-align: center;
		text-decoration: none;
	}

	.dishes-material-item {
		margin: 10px 0;
		border-bottom: 2px dashed #999999;
	}
	
	.dishes-creation-method-item {
		margin: 15px 0;
	}

	.material-key {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.material-key .material-value {
		margin-left: auto;
	}
	
	.uni-section .uni-section-header {
		
	}
</style>