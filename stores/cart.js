import {
	ref,
	reactive
} from 'vue'
import {
	defineStore
} from 'pinia'

export const useCartStore = defineStore('cart', () => {
	const cartItems = ref([])
	const options = ref([{
		icon: 'cart',
		text: '购物车'
		// info: 0
	}])

	// 初始化购物车
	function initCart() {
		cartItems.value = []
		options.value = [{
			icon: 'cart',
			text: '购物车'
			// info: 0
		}]
	}

	// 计算菜品总价
	function computedDishPrices() {
		let prices = 0
		cartItems.value.forEach(item => {
			prices += item.prices
		})
		return prices
	}

	// 计算菜品总用时
	function computedDishUseTime() {
		let useTimes = 0
		cartItems.value.forEach(item => {
			useTimes += item.useTime
		})
		return useTimes
	}

	// 添加菜品
	function addItem(item) {
		const existingItem = cartItems.value.find(i => i.id === item.id)
		if (existingItem) {
			return
		} else {
			updateInfo()
			cartItems.value.push({
				...item,
				quantity: 1
			})
		}
	}

	// 移除菜品
	function subtractItem(item) {
		const index = cartItems.value.findIndex(i => i.id === item.id);
		if (index !== -1) {
			cartItems.value.splice(index, 1);
			options.value[0].info--;
		}
	}

	// 更新购物车数量
	function updateInfo() {
		// 检查第一个对象是否有 info 属性
		if (options.value[0].info !== undefined) {
			// 如果有，则自增 1
			options.value[0].info++;
		} else {
			// 如果没有，则添加 info 属性并初始化为 1
			options.value[0].info = 1;
		}
	}

	return {
		cartItems,
		options,
		addItem,
		subtractItem,
		computedDishPrices,
		computedDishUseTime,
		initCart
	}
})