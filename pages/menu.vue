<template>
	<view>
		<uni-section v-for="(menu, menuIndex) in menuList" :title="menu.title" type="line" padding>
			<uni-grid :column="3" :highlight="true" @change="(detail) => handleChange(detail, menuIndex)">
				<uni-grid-item v-for="(item, index) in menu.components" :index="index" :key="index">
					<view class="grid-item-box">
						<image :src="item.url" class="image" mode="aspectFill" />
						<text class="text">{{ item.text }}</text>
					</view>
				</uni-grid-item>
			</uni-grid>
		</uni-section>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue'

	const menuList = [{
			title: '餐饮服务',
			components: [{
					url: '/static/menus/eat-recipe.png',
					text: '食谱',
					path: '/pages/eat/recipe/index'
				},
				{
					url: '/static/menus/eat-dishes.png',
					text: '点餐',
					path: '/pages/eat/dishes/index'
				},
				{
					url: '/static/menus/eat-meal.png',
					text: '用餐记录',
					path: '/pages/eat/meal/index'
				}
			]
		},
		{
			title: '记账服务',
			components: [{
					url: '/static/menus/bookkeeping-action.png',
					text: '记账',
					path: '/pages/bookkeeping/bookkeeping-action'
				},
				{
					url: '/static/menus/bookkeeping-records.png',
					text: '记账记录',
					path: '/pages/bookkeeping/bookkeeping-records'
				},
				{
					url: '/static/menus/bookkeeping-statistics.png',
					text: '收支分析',
					path: '/pages/bookkeeping/bookkeeping-statistics'
				}
			],
		}
	]

	function handleChange(e, menuIndex) {
		let {
			index
		} = e.detail
		const menu = menuList[menuIndex]
		const obj = menu.components[index]

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