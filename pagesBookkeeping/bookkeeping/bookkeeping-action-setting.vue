<template>
	<view class="action-setting">
		<!-- 顶部分类选项 -->
		<view class="category-selector">
			<text :class="{'active-text': selectedCategory === 1}" @click="selectCategory(1)">支出</text>
			<text :class="{'active-text': selectedCategory === 2}" @click="selectCategory(2)">收入</text>
		</view>

		<!-- 可拖拽排序列表 -->
		<scroll-view class="sortable-list" scroll-y ref="scrollView" @scroll="handleScroll">
			<view class="sortable-item" v-for="(action, index) in actions" :key="action.id" 
				:class="{'dragging': draggingIndex === index}"
				@touchstart="startDrag($event, index)"
				@touchmove="onDrag($event, index)"
				@touchend="endDrag"
				@touchcancel="endDrag">
                <image src="/static/bookkeeping/icon/delete.svg" class="delete-icon" @click="confirmDelete(action)"></image>
				<image :src="getIconUrl(action.recordIcon)" class="action-icon"></image>
				<text class="action-text">{{action.recordSource}}</text>
				<image src="/static/bookkeeping/icon/settings.svg" class="settings-icon" @click="(event) => { event.stopPropagation(); editAction(action); }"></image>
			</view>
		</scroll-view>

		<!-- 添加类别按钮 -->
		<view class="add-category" @click="addCategory">+添加类别</view>

		<!-- 删除确认弹框 -->
		<uni-popup ref="deletePopup" type="bottom">
			<view class="popup-content" style="background-color: white;">
				<text>删除后不会影响已存在账单中的记录，是否确认删除？</text>
				<view class="popup-actions">
					<button @click="deleteAction">确认</button>
					<button @click="closeDeletePopup">取消</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import http from '@/api/request.js'
import { getIconUrl } from '@/utils/icon.js'

const selectedCategory = ref(1)
const actions = ref([])
const draggingIndex = ref(-1)
const startY = ref(0)
const currentY = ref(0)
const isDragging = ref(false)
const deletePopup = ref(null)
const actionToDelete = ref(null)
const scrollView = ref(null)
const longPressTimer = ref(null)
const isLongPressing = ref(false)
const lastScrollTop = ref(0)
const scrollTimer = ref(null)

onShow(() => {
	fetchActions()
})

function selectCategory(category) {
	selectedCategory.value = category
	fetchActions()
}

function fetchActions() {
	http.get(`/bookkeeping-service/bookkeeping/actions/list?recordCategory=${selectedCategory.value}`)
		.then(res => {
			actions.value = res.data
		})
}

function startDrag(event, index) {
	// 清除之前的定时器
	if (longPressTimer.value) {
		clearTimeout(longPressTimer.value)
	}
	
	// 设置长按定时器
	longPressTimer.value = setTimeout(() => {
		isLongPressing.value = true
		isDragging.value = true
		draggingIndex.value = index
		startY.value = event.touches[0].pageY
		currentY.value = startY.value
		
		// 触发震动效果
		uni.vibrateShort({
			success: function () {
				// console.log('震动成功')
			}
		})
	}, 1000) // 1秒后触发
}

function onDrag(event, index) {
	// 如果不是长按状态，则只处理滚动
	if (!isLongPressing.value) {
		return
	}
	
	if (draggingIndex.value === -1) return
	currentY.value = event.touches[0].pageY
	const moveY = currentY.value - startY.value
	
	const itemHeight = 50 // 假设每个项目高度为50px
	
	// 只有当垂直移动距离超过阈值时才触发排序
	if (Math.abs(moveY) > itemHeight / 2) {
		const targetIndex = draggingIndex.value + (moveY > 0 ? 1 : -1)
		if (targetIndex >= 0 && targetIndex < actions.value.length) {
			// 交换位置
			const temp = actions.value[draggingIndex.value]
			actions.value[draggingIndex.value] = actions.value[targetIndex]
			actions.value[targetIndex] = temp
			
			draggingIndex.value = targetIndex
			startY.value = currentY.value
		}
	}
}

function endDrag(event) {
	// 清除长按定时器
	if (longPressTimer.value) {
		clearTimeout(longPressTimer.value)
		longPressTimer.value = null
	}
	
	if (!isDragging.value) return
	isDragging.value = false
	isLongPressing.value = false
	
	if (draggingIndex.value !== -1) {
		const currentAction = actions.value[draggingIndex.value]
		const prevAction = actions.value[draggingIndex.value - 1]
		const nextAction = actions.value[draggingIndex.value + 1]
		
		let newSort
		if (prevAction && nextAction) {
			// 如果前后都有元素，取中间值
			newSort = (prevAction.sort + nextAction.sort) / 2
		} else if (prevAction) {
			// 如果只有前一个元素
			newSort = prevAction.sort + 1
		} else if (nextAction) {
			// 如果只有后一个元素
			newSort = nextAction.sort - 1
		} else {
			// 如果是唯一的元素
			newSort = currentAction.sort
		}
		
		http.put('/bookkeeping-service/bookkeeping/actions/update', {
			...currentAction,
			sort: newSort
		})
	}
	draggingIndex.value = -1
}

function confirmDelete(action) {
	actionToDelete.value = action
	deletePopup.value.open()
}

function deleteAction() {
	if (actionToDelete.value) {
		http.delete(`/bookkeeping-service/bookkeeping/actions/delete?id=${actionToDelete.value.id}`)
			.then(() => {
				fetchActions()
				closeDeletePopup()
			})
	}
}

function closeDeletePopup() {
	deletePopup.value.close()
}

function editAction(action) {
	uni.navigateTo({
		url: `/pagesBookkeeping/bookkeeping/bookkeeping-action-edit?id=${action.id}`
	})
}

function addCategory() {
	uni.navigateTo({
		url: '/pagesBookkeeping/bookkeeping/bookkeeping-action-edit'
	})
}

function handleScroll(event) {
	// 处理滚动事件
}
</script>

<style>
.action-setting {
	display: flex;
	flex-direction: column;
	height: 100vh;
}

.category-selector {
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #ffd700;
	padding: 10px 0;
}

.category-selector text {
	margin: 0 20px;
	font-size: 16px;
	color: #333;
	cursor: pointer;
}

.active-text {
	font-weight: bold;
	border-bottom: 2px solid #333;
}

.sortable-list {
	flex: 1;
	margin-top: 20px;
	overflow-y: auto;
}

.sortable-item {
	display: flex;
	align-items: center;
	padding: 10px;
	border-bottom: 1px solid #eee;
	background-color: #f8f8f8;
	transition: transform 0.2s ease;
}

.sortable-item.dragging {
	background-color: #f0f0f0;
	opacity: 0.8;
	transform: scale(1.02);
}

.delete-icon {
	width: 20px;
	height: 20px;
	margin-right: 10px;
	border-radius: 50%;
	text-align: center;
	line-height: 20px;
	color: #fff;
}

.action-icon {
	width: 30px;
	height: 30px;
	margin-right: 10px;
	filter: grayscale(100%);
}

.action-text {
	flex: 1;
	font-size: 16px;
	color: #333;
}

.settings-icon {
	width: 20px;
	height: 20px;
	margin-left: auto;
	filter: grayscale(100%);
}

.add-category {
	text-align: center;
	padding: 10px;
	font-size: 16px;
	color: #007aff;
	cursor: pointer;
}

.popup-content {
	padding: 20px;
	text-align: center;
}

.popup-actions {
	display: flex;
	justify-content: space-around;
	margin-top: 20px;
}
</style> 