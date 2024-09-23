<template>
	<view>
		<uni-grid :column="3" :highlight="true" @change="change">
			<uni-grid-item v-for="(item, index) in list" :index="index" :key="index">
				<view class="grid-item-box">
					<image :src="item.url" class="image" mode="aspectFill" />
					<text class="text">{{ item.text }}</text>
				</view>
			</uni-grid-item>
		</uni-grid>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue'

	const list = [{
			url: '/static/menus/dishes.png',
			text: '点餐',
			path: '/pages/dishes/dishes'
		},
		{
			url: '/static/menus/meal.png',
			text: '用餐记录',
			path: '/pages/meal/meal'
		},
		{
			url: '/static/menus/bookkeeping.png',
			text: '记账',
			path: '/pages/bookkeeping/bookkeeping'
		},
		{
			url: '/static/menus/bookkeeping-records.png',
			text: '记账记录',
			path: '/pages/bookkeeping/bookkeeping-records'
		}
	]


	function change(e) {
		let {
			index
		} = e.detail
		const obj = list[index]
		
		uni.navigateTo({
			url: obj.path
		})
	}
</script>

<style lang="scss">
	.image {
		width: 30px;
		height: 30px;
	}

	.text {
		font-size: 16px;
		margin-top: 5px;
	}

	.grid-item-box {
		flex: 1;
		// position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 15px 0;
	}

	.grid-item-box-row {
		flex: 1;
		// position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 15px 0;
	}
</style>