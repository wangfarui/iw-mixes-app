<template>
	<view class="quick-bookkeeping">
		<!-- 顶部分类选项 -->
		<view class="category-selector">
			<text :class="{'active-text': selectedCategory === 1}" @click="selectCategory(1)">支出</text>
			<text :class="{'active-text': selectedCategory === 2}" @click="selectCategory(2)">收入</text>
		</view>

		<!-- 记账行为列表 -->
		<view class="actions-list">
			<view class="action-item" 
				v-for="action in actions" 
				:key="action.id" 
				@click="openBookkeepingPopup(action)"
			>
				<view :class="['icon-wrapper', {'icon-wrapper-selected': action.id === selectedAction}]">
					<image :src="getIconUrl(action.recordIcon)" mode="aspectFit" class="action-icon">
					</image>
				</view>
				<text class="action-text">{{action.recordSource}}</text>
			</view>
			<!-- 设置行为 -->
			<view class="action-item" @click="openSettings">
				<view class="icon-wrapper">
					<image src="/static/bookkeeping/icon/qita/shezhi.svg" mode="aspectFit" class="action-icon"></image>
				</view>
				<text class="action-text">设置</text>
			</view>
		</view>

		<!-- 记账输入器弹框 -->
		<uni-popup ref="bookkeepingPopup" type="bottom" @maskClick="closeBookkeepingPopup">
			<view class="popup-content">
				<!-- 金额显示 -->
				<view class="amount-display">{{ displayAmount }}</view>

				<!-- 备注输入框 -->
				<view class="remark-input">
					<text class="remark-label">备注：</text>
					<input v-model="remark" placeholder="点击填写备注" class="remark-field" />
				</view>

				<!-- 数字键盘 -->
				<view class="number-keyboard">
					<view class="keyboard-row">
						<button class="key-btn" @click="addNumber('7')">7</button>
						<button class="key-btn" @click="addNumber('8')">8</button>
						<button class="key-btn" @click="addNumber('9')">9</button>
						<picker 
							mode="date" 
							:value="selectedDate" 
							:start="startDate" 
							:end="endDate"
							@change="onDateChange"
							class="date-picker"
						>
							<view class="date-btn-wrapper">
								<template v-if="isToday">
									<view class="date-content">
										<text class="calendar-icon">📅</text>
										<text class="date-text">今天</text>
									</view>
								</template>
								<template v-else>
									<view class="date-content">
										<text class="date-text">{{ dateDisplay }}</text>
									</view>
								</template>
							</view>
						</picker>
					</view>
					<view class="keyboard-row">
						<button class="key-btn" @click="addNumber('4')">4</button>
						<button class="key-btn" @click="addNumber('5')">5</button>
						<button class="key-btn" @click="addNumber('6')">6</button>
						<button class="key-btn function-btn" @click="openTagsPopup">标签</button>
					</view>
					<view class="keyboard-row">
						<button class="key-btn" @click="addNumber('1')">1</button>
						<button class="key-btn" @click="addNumber('2')">2</button>
						<button class="key-btn" @click="addNumber('3')">3</button>
						<button class="key-btn function-btn" @click="openMorePopup">更多</button>
					</view>
					<view class="keyboard-row">
						<button class="key-btn" @click="addDecimal">.</button>
						<button class="key-btn" @click="addNumber('0')">0</button>
						<button class="key-btn" @click="deleteNumber">⌫</button>
						<button class="key-btn submit-btn" @click="submitBookkeeping">完成</button>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 标签选择弹框 -->
		<uni-popup ref="tagsPopup" type="bottom" @maskClick="closeTagsPopup">
			<view class="tags-popup-content">
				<uni-data-checkbox
					multiple
					v-model="formData.recordTags"
					:localdata="dictStore.getDictDataWithDataSelectId(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TAG)"
				/>
			</view>
		</uni-popup>

		<!-- 更多选项弹框 -->
		<uni-popup ref="morePopup" type="bottom" @maskClick="closeMorePopup">
			<view class="more-popup-content">
				<!-- 激励记录（仅收入） -->
				<view v-if="selectedCategory === 2" class="more-item">
					<text class="more-label">激励记录:</text>
					<switch :checked="formData.isExcitationRecord === 1" @change="switchExcitationRecord" />
				</view>

				<!-- 不计入统计（仅支出） -->
				<view v-if="selectedCategory === 1" class="more-item">
					<text class="more-label">不计入统计:</text>
					<switch :checked="formData.isStatistics === 0" @change="switchStatistics" />
				</view>
				
				<!-- 汇率转换 -->
				<view class="more-item">
					<text class="more-label">货币:</text>
					<uni-data-select
					  v-model="formData.fromCurrency"
					  :localdata="currencyTypes"
					  placement="top"
					/>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDictStore } from '@/stores/dict'
import { onShow } from '@dcloudio/uni-app'
import http from '@/api/request.js'
import { getIconUrl } from '@/utils/icon.js'

const selectedCategory = ref(1)
const actions = ref([])
const amount = ref('0')
const remark = ref('')
const formData = ref({
	recordCategory: null,
	recordIcon: '',
	recordSource: '',
	recordTags: [],
	recordType: null,
	isExcitationRecord: 0,
	isStatistics: 1,
	fromCurrency: ''
})
const dictStore = useDictStore()
const bookkeepingPopup = ref(null)
const selectedDate = ref(new Date())
const tagsPopup = ref(null)
const morePopup = ref(null)
const selectedAction = ref(null)

const numberRows = ref([
	[7, 8, 9, '今天'],
	[4, 5, 6, '+'],
	[1, 2, 3, '标签'],
	['.', 0, '⌫', '完成']
])

const currencyTypes = ref([
	{
		value: 'KRW',
		text: '韩元'
	},
	{
		value: 'USD',
		text: '美元'
	},
	{
		value: 'JPY',
		text: '日元'
	},
	{
		value: 'EUR',
		text: '欧元'
	},
	{
		value: 'HKD',
		text: '港币'
	}
])

onMounted(() => {
	fetchActions()
})

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

function openSettings() {
	uni.navigateTo({
		url: '/pages/bookkeeping/bookkeeping-action-setting'
	})
}

function openBookkeepingPopup(action) {
	selectedAction.value = action.id
	formData.value = {
		...formData.value,
		recordCategory: selectedCategory.value,
		recordIcon: action.recordIcon,
		recordSource: action.recordSource,
		recordTags: action.recordTags || [],
		recordType: action.recordType
	}
	bookkeepingPopup.value.open()
}

function addNumber(num) {
	const currentAmount = amount.value.toString()
	// 检查是否已经有两位小数
	if (currentAmount.includes('.')) {
		const [integer, decimal] = currentAmount.split('.')
		if (decimal.length >= 2) {
			return // 如果已经有两位小数，忽略新输入的数字
		}
	}
	
	// 如果当前值是0且没有小数点，则直接替换
	if (currentAmount === '0' && !currentAmount.includes('.')) {
		amount.value = num
	} else {
		amount.value = currentAmount + num
	}
}

function addDecimal() {
	const currentAmount = amount.value.toString()
	if (!currentAmount.includes('.')) {
		amount.value = currentAmount + '.'
	}
}

function deleteNumber() {
	const currentAmount = amount.value.toString()
	if (currentAmount.length <= 1) {
		amount.value = '0'
	} else {
		amount.value = currentAmount.slice(0, -1)
		// 如果删除后是一个空的小数点，则也删除小数点
		if (amount.value === '.') {
			amount.value = '0'
		}
	}
}

function showDatePicker() {
	// 触发picker的点击
	const picker = document.querySelector('picker')
	if (picker) {
		picker.click()
	}
}

function onDateChange(e) {
	selectedDate.value = e.detail.value
}

function toggleStatus() {
	// 切换状态逻辑
}

function openTagsPopup() {
	tagsPopup.value.open()
}

function closeTagsPopup() {
	tagsPopup.value.close()
}

function openMorePopup() {
	morePopup.value.open()
}

function closeMorePopup() {
	morePopup.value.close()
}

function switchExcitationRecord(e) {
	formData.value.isExcitationRecord = e.detail.value ? 1 : 0
}

function switchStatistics(e) {
	formData.value.isStatistics = e.detail.value ? 0 : 1
}

function submitBookkeeping() {
	// 验证必填字段
	if (!formData.value.recordCategory) {
		uni.showToast({
			title: '请选择记账类别',
			icon: 'none'
		})
		return
	}

	if (parseFloat(amount.value) <= 0) {
		uni.showToast({
			title: '请输入有效金额',
			icon: 'none'
		})
		return
	}

	// 处理备注
	if (remark.value) {
		formData.value.recordSource = remark.value
		remark.value = ''
	}

	const submitData = {
		recordDate: selectedDate.value,
		recordCategory: formData.value.recordCategory,
		recordIcon: formData.value.recordIcon,
		recordSource: formData.value.recordSource,
		recordType: formData.value.recordType,
		amount: parseFloat(amount.value),
		remark: '', // remark 永远为空
		recordTags: formData.value.recordTags,
		isExcitationRecord: formData.value.isExcitationRecord,
		isStatistics: formData.value.isStatistics,
		fromCurrency: formData.value.fromCurrency
	}

	http.post('/bookkeeping-service/bookkeepingRecords/add', submitData)
		.then(() => {
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			})
			closeBookkeepingPopup() // 关闭弹框并重置表单
			uni.navigateBack()
		})
		.catch(error => {
			uni.showToast({
				title: error.message || '保存失败',
				icon: 'none'
			})
		})
}

function handleKeyPress(key) {
	switch (key) {
		case '今天':
			showDatePicker()
			break
		case '+':
			toggleStatus()
			break
		case '-':
			openTagsPopup()
			break
		case '⌫':
			deleteNumber()
			break
		case '完成':
			submitBookkeeping()
			break
		default:
			if (key === '.') {
				addDecimal()
			} else {
				addNumber(key)
			}
	}
}

// 计算属性用于显示金额
const displayAmount = computed(() => {
	const amountStr = amount.value.toString()
	if (amountStr.endsWith('.')) {
		return amountStr
	}
	// 如果包含小数点，确保最多显示两位小数
	if (amountStr.includes('.')) {
		const [integer, decimal] = amountStr.split('.')
		return `${integer}.${decimal.slice(0, 2)}`
	}
	// 如果是整数，直接返回
	return amountStr
})

// 格式化日期显示
const dateDisplay = computed(() => {
	const today = new Date()
	const yesterday = new Date(today)
	yesterday.setDate(yesterday.getDate() - 1)
	
	const todayStr = formatDate(today)
	const yesterdayStr = formatDate(yesterday)
	const selectedStr = selectedDate.value
	
	if (selectedStr === yesterdayStr) {
		return '昨天'
	} else {
		return selectedStr
	}
})

// 格式化日期为 yyyy/MM/dd
function formatDate(date) {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

// 初始化选中日期为今天
const today = new Date()
selectedDate.value = formatDate(today)

// 设置日期范围（比如前后5年）
const startDate = computed(() => {
	const date = new Date()
	date.setFullYear(date.getFullYear() - 5)
	return formatDate(date)
})

const endDate = computed(() => {
	const date = new Date()
	date.setFullYear(date.getFullYear() + 5)
	return formatDate(date)
})

const isToday = computed(() => {
	const today = new Date()
	return formatDate(today) === selectedDate.value
})

function resetFormData() {
	// 重置所有表单数据
	amount.value = '0'
	remark.value = ''
	formData.value = {
		recordCategory: null,
		recordIcon: '',
		recordSource: '',
		recordTags: [],
		recordType: null,
		isExcitationRecord: 0,
		isStatistics: 1
	}
	selectedDate.value = formatDate(new Date()) // 重置为今天
	selectedAction.value = null // 重置选中状态
}

function closeBookkeepingPopup() {
	bookkeepingPopup.value.close()
	resetFormData()
}
</script>

<style>
.quick-bookkeeping {
	padding: 10px;
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

.actions-list {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-start;
	margin-top: 20px;
}

.action-item {
	flex: 0 0 25%;
	margin-bottom: 20px;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.icon-wrapper {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	margin-bottom: 5px;
}

.icon-wrapper-selected {
	background-color: #ffd700;
}

.action-icon {
	width: 24px;
	height: 24px;
	filter: grayscale(100%);
}

.icon-wrapper-selected .action-icon {
	filter: none;
}

.action-text {
	font-size: 14px;
	color: #333;
}

.popup-content {
	background-color: #f5f5f5;
}

.amount-display {
	font-size: 32px;
	text-align: right;
	padding: 0 20px;
	color: #333;
}

.remark-input {
	background-color: #fff;
	padding: 12px 15px;
	border-radius: 4px;
	display: flex;
	align-items: center;
}

.remark-label {
	color: #666;
	margin-right: 10px;
	white-space: nowrap;
}

.remark-field {
	flex: 1;
	border: none;
	font-size: 14px;
	height: 20px;
	line-height: 20px;
}

.number-keyboard {
	background-color: #fff;
	border: 1px solid #eee;
	border-radius: 4px;
}

.keyboard-row {
	display: flex;
	justify-content: space-between;
	border-bottom: 1px solid #eee;
	height: 50px;
}

.keyboard-row:last-child {
	border-bottom: none;
}

.key-btn {
	flex: 1;
	height: 100%;
	margin: 0;
	padding: 0;
	border: none;
	border-right: 1px solid #eee;
	background-color: #fff;
	font-size: 20px;
	border-radius: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
}

.key-btn:last-child {
	border-right: none;
}

.function-btn {
	background-color: #f8f8f8;
	font-size: 16px;
	color: #333;
}

.submit-btn {
	background-color: #ffd700;
	color: #333;
}

.date-picker {
	flex: 1;
	height: 100%;
	background-color: #f8f8f8;
	border-right: 1px solid #eee;
	display: flex;
	align-items: center;
	justify-content: center;
}

.date-btn-wrapper {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.date-content {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
}

.calendar-icon {
	font-size: 14px;
	margin-right: 2px;
}

.date-text {
	font-size: 12px;
	line-height: 1;
}

.tags-popup-content {
	background-color: #fff;
	padding: 20px;
	border-radius: 10px 10px 0 0;
	max-height: 400px;
	overflow-y: auto;
}

.more-popup-content {
	background-color: #fff;
	padding: 20px;
	border-radius: 10px 10px 0 0;
}

.more-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 0;
	border-bottom: 1px solid #eee;
}

.more-item:last-child {
	border-bottom: none;
}

.more-label {
	font-size: 14px;
	color: #333;
}
</style> 