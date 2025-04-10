<template>
	<view class="action-setting">
		<!-- 顶部分类选项 -->
		<view class="category-selector">
			<text :class="{'active-text': selectedCategory === 1}" @click="selectCategory(1)">支出</text>
			<text :class="{'active-text': selectedCategory === 2}" @click="selectCategory(2)">收入</text>
		</view>

		<!-- 可拖拽排序列表 -->
		<scroll-view class="sortable-list" scroll-y>
			<view class="sortable-item" v-for="(action, index) in actions" :key="action.id" 
				:class="{'dragging': draggingIndex === index}"
				@touchstart="startDrag($event, index)"
				@touchmove.prevent="onDrag($event, index)"
				@touchend="endDrag">
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

const selectedCategory = ref(1)
const actions = ref([])
const draggingIndex = ref(-1)
const startY = ref(0)
const currentY = ref(0)
const isDragging = ref(false)
const deletePopup = ref(null)
const actionToDelete = ref(null)

onShow(() => {
	fetchActions()
})

function selectCategory(category) {
	selectedCategory.value = category
	fetchActions()
}

function fetchActions() {
	http.get(`/bookkeeping-service/actions/list?recordCategory=${selectedCategory.value}`)
		.then(res => {
			actions.value = res.data
		})
}

function getIconUrl(icon) {
	return `/static/bookkeeping/${icon}.svg`
}

function startDrag(event, index) {
	isDragging.value = true
	draggingIndex.value = index
	startY.value = event.touches[0].pageY
	currentY.value = startY.value
}

function onDrag(event, index) {
	if (draggingIndex.value === -1) return
	isDragging.value = true
	currentY.value = event.touches[0].pageY
	const moveY = currentY.value - startY.value
	const itemHeight = 50 // 假设每个项目高度为50px
	
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
	if (!isDragging.value) return
	isDragging.value = false
	
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
		
		http.put('/bookkeeping-service/actions/update', {
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
		http.delete(`/bookkeeping-service/actions/delete?id=${actionToDelete.value.id}`)
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
		url: `/pages/bookkeeping/bookkeeping-action-edit?id=${action.id}`
	})
}

function addCategory() {
	uni.navigateTo({
		url: '/pages/bookkeeping/bookkeeping-action-edit'
	})
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