<template>
	<view class="menu-container">
		<view class="search-box">
			<view class="search-bar-wrapper">
				<uni-search-bar
					v-model="searchValue"
					placeholder="搜索功能"
					@input="handleSearch"
					@confirm="handleAsk"
					radius="100"
					cancelButton="none"
					:style="showDialog ? 'width: calc(100% - 90px);' : 'width: 100%;'"
				/>
				<view v-if="showDialog" class="exit-btn-inline">
					<button class="exit-btn" @click="exitDialog">退出对话</button>
				</view>
			</view>
		</view>
		
		<scroll-view v-if="!showDialog" scroll-y class="menu-scroll">
			<view v-for="(menu, menuIndex) in filteredMenuList" :key="menuIndex" class="menu-section">
				<view class="section-title">{{ menu.title }}</view>
				<view class="menu-grid">
					<view 
						v-for="(item, index) in menu.components" 
						:key="index"
						class="menu-item"
						@tap="handleNavigate(item.path)"
					>
						<view class="icon-wrapper">
							<image :src="item.url" class="image" mode="aspectFill" />
						</view>
						<text class="text">{{ item.text }}</text>
					</view>
				</view>
			</view>
		</scroll-view>
		<view v-else class="dialog-container">
			<scroll-view scroll-y class="dialog-scroll" :scroll-into-view="scrollToId">
				<view v-for="(item, idx) in dialogList" :key="idx" :id="`dialog-item-${idx}`">
					<view class="dialog-row user-row">
						<view class="dialog-bubble user-bubble" @longpress="copyText(item.question)">{{ item.question }}</view>
					</view>
					<view class="dialog-row ai-row">
						<view class="dialog-bubble ai-bubble" @longpress="copyText(item.answer)">
							<view class="ai-md-content" v-html="parseMarkdown(item.answer)"></view>
						</view>
					</view>
				</view>
				<view v-if="loading" class="dialog-row ai-row">
					<view class="dialog-bubble ai-bubble"><text style="color: #999">正在思考...</text></view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import http from '@/api/request.js'
import { baseUrl, tokenHeader } from '@/api/env.js'
import MarkdownIt from 'markdown-it'

const searchValue = ref('')
const showDialog = ref(false)
const loading = ref(false)
const answer = ref('')
const lastQuestion = ref('')
const dialogList = ref([])
const scrollViewRef = ref(null)
const scrollToId = ref('')
let ws = null

const md = new MarkdownIt()

function parseMarkdown(text) {
	if (!text) return ''
	// 先将Unicode转义字符（如\uD83D\uDCCC）转为真实字符
	text = text.replace(/\\u([a-fA-F0-9]{4})/g, (m, g1) => String.fromCharCode(parseInt(g1, 16)))
	// 处理代理对（高低位代理）
	text = text.replace(/\\u\{([a-fA-F0-9]+)\}/g, (m, g1) => String.fromCodePoint(parseInt(g1, 16)))
	// markdown-it渲染
	let html = md.render(text)
	// 换行符替换为<br>
	html = html.replace(/\\n|\\r\\n|\\r|\n/g, '<br>')
	// 如果字符串以<br>结尾，则删除它
	if (html.endsWith('<br>')) {
		html = html.slice(0, -4)
	}
	return html
}

const menuList = [{
		title: '餐饮服务',
		components: [{
				url: '/static/menus/eat-recipe.png',
				text: '食谱',
				path: '/pagesEat/eat/recipe/index'
			},
			{
				url: '/static/menus/eat-dishes.png',
				text: '点餐',
				path: '/pagesEat/eat/dishes/index'
			},
			{
				url: '/static/menus/eat-meal.png',
				text: '用餐记录',
				path: '/pagesEat/eat/meal/index'
			}
		]
	},
	{
		title: '记账服务',
		components: [{
				url: '/static/menus/bookkeeping-action.png',
				text: '记账',
				path: '/pagesBookkeeping/bookkeeping/bookkeeping-action'
			},
			{
				url: '/static/menus/bookkeeping-records.png',
				text: '记账记录',
				path: '/pagesBookkeeping/bookkeeping/bookkeeping-records'
			},
			{
				url: '/static/menus/bookkeeping-statistics.png',
				text: '支出统计',
				path: '/pagesBookkeeping/bookkeeping/bookkeeping-consume-statistics'
			},
			{
				url: '/static/menus/bookkeeping-income-statistics.png',
				text: '收入统计',
				path: '/pagesBookkeeping/bookkeeping/bookkeeping-income-statistics'
			},
			{
				url: '/static/menus/bookkeeping-wallet.png',
				text: '钱包',
				path: '/pagesBookkeeping/bookkeeping/bookkeeping-wallet'
			}
		],
	},
	{
		title: '积分服务',
		components: [{
				url: '/static/menus/points-action.png',
				text: '新增积分',
				path: '/pagesPoints/points/points-action'
			},
			{
				url: '/static/menus/points-records.png',
				text: '积分记录',
				path: '/pagesPoints/points/points-records'
			},
			{
				url: '/static/menus/points-task.png',
				text: '任务计划',
				path: '/pagesPoints/points/task-plan'
			},
			{
				url: '/static/menus/task-list.png',
				text: '常用任务',
				path: '/pagesPoints/points/task-list'
			},
			{
				url: '/static/menus/points-statistics.png',
				text: '积分分析',
				path: '/pagesPoints/points/points-statistics'
			}
		],
	},
	{
		title: '基础服务',
		components: [{
				url: '/static/menus/dict-manage.png',
				text: '字典管理',
				path: '/pagesBase/base/dict-manage'
			},
			{
				url: '/static/menus/account-manage.png',
				text: '账号管理',
				path: '/pagesBase/base/account-manage'
			}
		],
	}
]

const filteredMenuList = computed(() => {
	if (!searchValue.value) return menuList
	
	return menuList.map(menu => ({
		...menu,
		components: menu.components.filter(item => 
			item.text.toLowerCase().includes(searchValue.value.toLowerCase())
		)
	})).filter(menu => menu.components.length > 0)
})

function handleSearch(e) {
	searchValue.value = e.value
}

function handleAsk(e) {
	const value = e.value || searchValue.value
	if (!value) return
	showDialog.value = true
	loading.value = true
	lastQuestion.value = value
	answer.value = ''
	searchValue.value = ''
	dialogList.value.push({ question: value, answer: '' })
	if (dialogList.value.length > 10) {
		dialogList.value.shift()
	}
	nextTick(() => {
		scrollToId.value = `dialog-item-${dialogList.value.length - 1}`
	})
	
	// 如果WebSocket未连接，先建立连接
	if (!ws || ws.readyState !== 1) {
		connectWebSocket(() => {
			// 连接成功后发送消息
			sendMessage(value)
		})
	} else {
		// 已连接，直接发送消息
		sendMessage(value)
	}
}

function connectWebSocket(onConnected) {
	// 关闭之前的连接
	if (ws) {
		ws.close()
	}

	const domain = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://')
	
	ws = uni.connectSocket({
		url: `${domain}/external-service/wb/chat-ws`,
		header: tokenHeader(),
		success: () => {
		}
	})
	
	ws.onOpen(() => {
		loading.value = false
		// 连接成功后回调
		if (onConnected) {
			onConnected()
		}
	})
	
	ws.onMessage((res) => {
		loading.value = false
		// 更新当前对话的answer内容
		if (dialogList.value.length > 0) {
			const currentDialog = dialogList.value[dialogList.value.length - 1]
			currentDialog.answer += res.data
			// 滚动到底部
			nextTick(() => {
				scrollToId.value = `dialog-item-${dialogList.value.length - 1}`
			})
		}
	})
	
	ws.onClose((res) => {
		loading.value = false
	})
	
	ws.onError((err) => {
		// 显示错误信息
		if (dialogList.value.length > 0) {
			dialogList.value[dialogList.value.length - 1].answer = '连接失败，请重试'
		}
		uni.showToast({ title: '连接失败', icon: 'none' })
	})
}

function sendMessage(message) {
	if (ws && ws.readyState === 1) {
		ws.send({
			data: message,
			fail: (res) => {
				uni.showToast({ title: res, icon: 'none' })
			}
		})
	}
}

function exitDialog() {
	showDialog.value = false
	searchValue.value = ''
	answer.value = ''
	lastQuestion.value = ''
	dialogList.value = []
	// 关闭WebSocket连接
	if (ws) {
		ws.close()
		ws = null
	}
}

function copyText(text) {
	if (!text) return
	uni.setClipboardData({
		data: text,
		success() {
			uni.showToast({ title: '已复制', icon: 'none' })
		}
	})
}

function handleNavigate(path) {
	uni.navigateTo({
		url: path
	})
}
</script>

<style lang="scss">
.menu-container {
	background-color: #f8f9fa;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
}

.search-box {
	background-color: #fff;
	position: sticky;
	top: 0;
	z-index: 100;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	position: relative;
}

.menu-scroll {
	flex: 1;
	height: calc(100vh - 60px);
}

.menu-section {
	margin: 12px 16px;
	background-color: #fff;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
	padding: 12px 16px;
	font-size: 16px;
	font-weight: 600;
	color: #333;
	border-bottom: 1px solid #f0f0f0;
}

.menu-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 1px;
	background-color: #f0f0f0;
}

.menu-item {
	background-color: #fff;
	padding: 16px;
	display: flex;
	align-items: center;
	gap: 12px;
	
	&:active {
		background-color: #f5f5f5;
	}
}

.icon-wrapper {
	width: 40px;
	height: 40px;
	background-color: #f0f7ff;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.image {
	width: 24px;
	height: 24px;
}

.text {
	font-size: 14px;
	color: #333;
	flex: 1;
}

:deep(.uni-searchbar) {
	padding: 0;
	
	.uni-searchbar__box {
		padding: 0 12px;
	}
}

.dialog-container {
	background: #fff;
	border-radius: 12px;
	padding: 16px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.05);
	height: 86vh;
	min-height: 300px;
	display: flex;
	flex-direction: column;
}
.dialog-scroll {
	flex: 1;
	height: 100%;
	overflow-y: auto;
}
.dialog-footer-fixed {
	display: none;
}
.search-bar-wrapper {
	display: flex;
	align-items: center;
	position: relative;
}
.exit-btn-inline {
	position: absolute;
	top: 50%;
	right: 18px;
	transform: translateY(-50%);
	z-index: 101;
	display: flex;
	align-items: center;
	height: 100%;
}
.exit-btn {
	display: inline-block;
	background: #f0f0f0;
	color: #666;
	border: none;
	border-radius: 16px;
	padding: 0 14px;
	height: 32px;
	font-size: 13px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.05);
	margin: 0;
	line-height: 32px;
	cursor: pointer;
	transition: background 0.2s;
}
.exit-btn:active {
	background: #e0e0e0;
}
.dialog-row {
	display: flex;
	margin-bottom: 8px;
}
.user-row {
	justify-content: flex-end;
}
.ai-row {
	justify-content: flex-start;
}
.dialog-bubble {
	max-width: 70%;
	padding: 10px 16px;
	border-radius: 16px;
	font-size: 15px;
	line-height: 1.6;
	word-break: break-all;
}
.user-bubble {
	background: #e6f7ff;
	color: #333;
	border-top-right-radius: 4px;
}
.ai-bubble {
	background: #f5f5f5;
	color: #333;
	border-top-left-radius: 4px;
}
.ai-md5-content {
	font-size: 15px;
	line-height: 1.6;
	word-break: break-all;
	white-space: pre-wrap;
}
</style>