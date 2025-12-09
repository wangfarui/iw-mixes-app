<template>
	<view class="page">
		<!-- 顶部：搜索 + 筛选 + 新增 -->
		<view class="toolbar">
			<view class="toolbar-row">
				<uni-search-bar class="search-bar" v-model="searchKeyword" placeholder="搜索名称/备注" @confirm="applySearch" @cancel="resetSearch" />
			</view>
			<view class="toolbar-row single">
				<uni-data-select class="filter-select" v-model="filterType" :localdata="serviceTypeOptions" placeholder="服务类型" clear @change="onQueryChange"></uni-data-select>
				<uni-data-select class="filter-select" v-model="expiryType" :localdata="expiryTypeOptions" placeholder="到期类型" @change="onQueryChange"></uni-data-select>
				<uni-data-select class="filter-select" v-model="currentSortOption" :localdata="displaySortOptions" placeholder="排序" @change="onSortChange"></uni-data-select>
			</view>
		</view>

		<!-- 汇总卡片 -->
		<view class="summary">
			<view class="card">
				<text class="card-title">本月合计</text>
				<text class="card-value">￥{{ summary.monthlyTotal.toFixed(2) }}</text>
			</view>
			<view class="card">
				<text class="card-title">本年合计</text>
				<text class="card-value">￥{{ summary.yearlyTotal.toFixed(2) }}</text>
			</view>
			<view class="card">
				<text class="card-title">订阅数量</text>
				<text class="card-value">{{ filteredList.length }}</text>
			</view>
		</view>

		<!-- 列表 -->
		<uni-list>
			<uni-list-item v-for="item in filteredList" :key="item.id" :title="item.name" clickable @click="openEdit(item)">
				<template v-slot:body>
					<view class="item">
						<view class="item-left">
							<view class="item-title">
								<text class="name">{{ item.name }}</text>
								<text class="type">{{ mapServiceType(item.type) }}</text>
							</view>
							<view class="item-sub">
								<text class="price">￥{{ Number(item.price || 0).toFixed(2) }}</text>
								<text class="cycle">/{{ displayCycle(item) }}</text>
							</view>
							<view class="item-meta">
								<text>生效日期: {{ formatDate(item.startDate) }}</text>
								<text v-if="item.endDate">过期日期: {{ formatDate(item.endDate) }}</text>
							</view>
						</view>
						<view class="item-right">
							<view :class="['status', statusClass(calcStatus(item))]">{{ calcStatus(item).label }}</view>
							<view class="actions">
								<button class="icon-button warn" size="mini" @click.stop="removeItem(item.id)">
									<uni-icons type="trash" size="20" color="#dd524d"></uni-icons>
								</button>
							</view>
						</view>
					</view>
				</template>
			</uni-list-item>
		</uni-list>

		<button class="floating-add" @click="openCreate">
			<uni-icons type="plusempty" size="28" color="#fff"></uni-icons>
		</button>

		<!-- 弹窗：新增 / 编辑 -->
		<uni-popup ref="popupRef" type="bottom" :safe-area="true">
			<view class="popup">
				<view class="popup-header">{{ editingId ? '编辑订阅' : '新增订阅' }}</view>
				<uni-forms ref="formRef" :modelValue="form" :rules="rules" label-width="90">
					<uni-forms-item label="服务名称" name="name">
						<uni-easyinput v-model="form.name" placeholder="例如：QQ音乐/京东PLUS/ChatGPT" />
					</uni-forms-item>
					<uni-forms-item label="服务类型" name="type">
						<uni-data-select v-model="form.type" :localdata="serviceTypeOptions" placeholder="选择类型" />
					</uni-forms-item>
					<uni-forms-item label="费用" name="price">
						<uni-easyinput v-model="form.price" placeholder="最多100000，小数点后最多2位" @input="onPriceInput" />
					</uni-forms-item>
					<uni-forms-item label="计费周期" name="cycleType">
						<uni-data-select v-model="form.cycleType" :localdata="cycleOptions" :clear="false" placeholder="选择周期" />
					</uni-forms-item>
					<uni-forms-item v-if="isCustomCycle(form.cycleType)" label="自定义周期" name="customInterval">
						<view class="row">
							<uni-easyinput class="mr8" type="number" v-model="form.customInterval" placeholder="间隔数" />
							<uni-data-select v-model="form.customUnit" :localdata="customUnitOptions" :clear="false" placeholder="单位" />
						</view>
					</uni-forms-item>
					<uni-forms-item label="开始日期" name="startDate">
						<uni-datetime-picker type="date" :clear-icon="false" v-model="form.startDate" />
					</uni-forms-item>
					<uni-forms-item v-if="!form.autoRenew" label="结束日期" name="endDate">
						<uni-datetime-picker type="date" v-model="form.endDate" />
					</uni-forms-item>
					<uni-forms-item label="自动续费" name="autoRenew">
						<switch :checked="form.autoRenew" @change="e => form.autoRenew = e.detail.value" />
					</uni-forms-item>
					<uni-forms-item label="支付方式" name="paymentMethod">
						<uni-easyinput v-model="form.paymentMethod" placeholder="如 微信/支付宝/银行卡" />
					</uni-forms-item>
					<uni-forms-item label="提醒(天)" name="remindDays">
						<uni-easyinput type="number" v-model="form.remindDays" placeholder="到期前提醒天数" />
					</uni-forms-item>
					<uni-forms-item label="备注" name="remark">
						<uni-easyinput type="textarea" v-model="form.remark" placeholder="可填账号、权益等信息" />
					</uni-forms-item>
				</uni-forms>
				<view class="popup-actions">
					<button class="btn" @click="closePopup">取消</button>
					<button class="btn primary" :loading="submitting" :disabled="submitting" @click="submitForm">保存</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useDictStore } from '@/stores/dict.ts'
import http from '@/api/request.js'

const dictStore = useDictStore()
const STORAGE_KEY = 'membership_subscriptions'

/**
 * 订阅数据结构
 * id: string
 * name: string
 * type: string (serviceTypeOptions.value)
 * price: number
 * cycleType: 'monthly'|'yearly'|'weekly'|'daily'|'one_time'|'custom'
 * customInterval?: number
 * customUnit?: 'day'|'week'|'month'|'year'
 * startDate: string (yyyy-MM-dd)
 * endDate?: string (yyyy-MM-dd)
 * autoRenew: boolean
 * paymentMethod?: string
 * remindDays?: number
 * remark?: string
 */

// 会员类型字典
const serviceTypeOptions = computed(() => {
	return dictStore.getDictDataWithDataSelectCode(dictStore.dictTypeEnum.BOOKKEEPING_MEMBERSHIP_TYPE)
})

// 从字典获取计费周期选项
const cycleOptions = computed(() => {
	return dictStore.getDictDataWithDataSelectCode(dictStore.dictTypeEnum.BOOKKEEPING_MEMBERSHIP_BILLING_CYCLE)
})

// 从字典获取自定义周期单位选项
const customUnitOptions = computed(() => {
	return dictStore.getDictDataWithDataSelectCode(dictStore.dictTypeEnum.BOOKKEEPING_MEMBERSHIP_CYCLE_UNIT)
})

// 排序字段（后端枚举code）
const sortTypeOptions = [
	{ text: '创建时间', value: 0 },
	{ text: '金额', value: 1 },
	{ text: '结束时间', value: 2 },
	{ text: '开始时间', value: 3 }
]
// 排序方式（后端：1升序，2降序）
const sortWayOptions = [
	{ text: '升序', value: 1 },
	{ text: '降序', value: 2 }
]
// 到期类型（后端枚举code）
const expiryTypeOptions = [
	{ text: '全部', value: 0 },
	{ text: '有效期内', value: 1 },
	{ text: '即将到期', value: 2 },
	{ text: '已过期', value: 3 }
]

const list = ref(loadList())
const loadingList = ref(false)
const searchKeyword = ref('')
const filterType = ref('')
const sortType = ref(0) // DEFAULT
const sortWay = ref(2) // 默认降序
const expiryType = ref('') // 默认为空
const currentSortOption = ref('') // 当前选中的排序选项，用于下拉框显示

// 计算属性：生成显示用的排序选项（带箭头指示器）
const displaySortOptions = computed(() => {
	return sortTypeOptions.map(opt => {
		if (opt.value === currentSortOption.value) {
			// 当前选中的选项，添加箭头指示符
			const arrow = sortWay.value === 1 ? ' ↑' : ' ↓'
			return { ...opt, text: opt.text + arrow }
		}
		return opt
	})
})

const summary = computed(() => {
	let monthly = 0
	let yearly = 0
	for (const s of list.value) {
		const c = normalizeCost(s)
		monthly += c.monthly
		yearly += c.yearly
	}
	return { monthlyTotal: monthly, yearlyTotal: yearly }
})

const filteredList = computed(() => {
	let arr = list.value.slice()
	if (searchKeyword.value) {
		const k = searchKeyword.value.trim().toLowerCase()
		arr = arr.filter(i =>
			(i.name || '').toLowerCase().includes(k) ||
			(i.remark || '').toLowerCase().includes(k)
		)
	}
	if (filterType.value !== '' && filterType.value !== undefined && filterType.value !== null) {
		arr = arr.filter(i => Number(i.type) === Number(filterType.value))
	}
	// 排序交由服务端处理
	return arr
})

watch(
	[cycleOptions, customUnitOptions, serviceTypeOptions],
	() => {
		list.value = list.value.map(normalizeStoredItem)
	},
	{ deep: true }
)

watch(serviceTypeOptions, (options) => {
	if ((!form.type && form.type !== 0) && options.length) {
		form.type = options[0].value
	}
}, { deep: true })

watch(cycleOptions, (options) => {
	if ((!form.cycleType && form.cycleType !== 0) && options.length) {
		form.cycleType = options[0].value
	}
}, { deep: true })

watch(customUnitOptions, (options) => {
	if ((!form.customUnit && form.customUnit !== 0) && options.length) {
		form.customUnit = options[0].value
	}
}, { deep: true })

function sortComparator(a, b) {
	if (sortKey.value === 'price_desc' || sortKey.value === 'price_asc') {
		const ca = normalizeCost(a).monthly
		const cb = normalizeCost(b).monthly
		return sortKey.value === 'price_desc' ? cb - ca : ca - cb
	}
	if (sortKey.value === 'expire') {
		const da = getNextRelevantDate(a)
		const db = getNextRelevantDate(b)
		return da - db
	}
	// created 默认按 id 时间戳倒序
	return (b.createdAt || 0) - (a.createdAt || 0)
}

function applySearch() {}
function resetSearch() { searchKeyword.value = '' }
function onQueryChange() { refreshList() }

/**
 * 处理排序选项变化
 * 如果点击的是当前已选项，则切换排序方式（升序/降序）
 * 如果点击的是新选项，则更新sortType，排序方式重置为降序
 */
function onSortChange() {
	const newSortType = currentSortOption.value
	if (newSortType === sortType.value) {
		// 切换排序方式
		sortWay.value = sortWay.value === 2 ? 1 : 2
	} else {
		// 更换排序字段，重置为降序
		sortType.value = newSortType
		sortWay.value = 2
	}
	refreshList()
}

// 弹窗/表单
const popupRef = ref()
const formRef = ref()
const editingId = ref('')
const form = reactive(defaultForm())
const submitting = ref(false)

const rules = {
	name: { required: true, errorMessage: '请输入服务名称' },
	type: { required: true, errorMessage: '请选择服务类型' },
	price: {
		required: true,
		validateFunction: (rule, value, data, callback) => {
			const numValue = Number(value)
			if (isNaN(numValue)) return callback('请输入有效金额')
			if (numValue < 0) return callback('金额不能为负数')
			if (numValue > 100000) return callback('金额不能超过100000')
			// 检查小数位最多两位
			const decimalMatch = String(value).match(/\.(\d+)$/)
			if (decimalMatch && decimalMatch[1].length > 2) return callback('小数位最多保留两位')
			callback()
		}
	},
	cycleType: { required: true, errorMessage: '请选择计费周期' },
	startDate: { required: true, errorMessage: '请选择开始日期' },
	endDate: {
		validateFunction: (rule, value, data, callback) => {
			if (!data.autoRenew && !value) return callback('非自动续费需填写结束日期')
			callback()
		}
	},
	customInterval: {
		validateFunction: (rule, value, data, callback) => {
			if (!isCustomCycle(data.cycleType)) return callback()
			if (!value || value <= 0) return callback('请输入自定义间隔')
			if (!data.customUnit) return callback('请选择自定义单位')
			callback()
		}
	}
}

function defaultForm() {
	// 获取默认的计费周期（按月）的code值
	const monthlyCycleCode = getCycleCodeByName('按月') || getCycleCodeByName('monthly') || (cycleOptions.value[0]?.value ?? '')
	const defaultCustomUnit = getCustomUnitCodeByName('月') || getCustomUnitCodeByName('month') || (customUnitOptions.value[0]?.value ?? '')
	return {
		name: '',
		type: '',
		price: '',
		cycleType: monthlyCycleCode,
		customInterval: '',
		customUnit: defaultCustomUnit,
		startDate: formatDateStr(new Date()),
		endDate: '',
		autoRenew: false,
		paymentMethod: '',
		remindDays: '',
		remark: ''
	}
}

function openCreate() {
	Object.assign(form, defaultForm())
	editingId.value = ''
	popupRef.value?.open()
}

function openEdit(item) {
	// 获取默认的自定义单位code（如果不存在）
	const defaultCustomUnit = getCustomUnitCodeByName('月') || getCustomUnitCodeByName('month') || (customUnitOptions.value[0]?.value ?? '')
	const defaultType = getMembershipTypeDefault()
	
	Object.assign(form, {
		name: item.name,
		type: item.type ?? defaultType,
		price: String(item.price ?? ''),
		cycleType: item.cycleType,
		customInterval: item.customInterval ? String(item.customInterval) : '',
		customUnit: item.customUnit || defaultCustomUnit,
		startDate: item.startDate,
		endDate: item.endDate || '',
		autoRenew: !!item.autoRenew,
		paymentMethod: item.paymentMethod || '',
		remindDays: item.remindDays,
		remark: item.remark || ''
	})
	editingId.value = item.id
	popupRef.value?.open()
}

function closePopup() { popupRef.value?.close() }

/**
 * 处理价格输入，实时限制小数位最多两位和最大值100000
 */
function onPriceInput(value) {
	if (!value && value !== '0') {
		form.price = ''
		return
	}

	let inputValue = String(value).trim()

	// 使用正则表达式：只允许数字和最多一个小数点
	// 匹配：数字 + 可选的（小数点 + 最多2位数字）
	const regex = /^\d+(\.\d{0,2})?$/

	if (!regex.test(inputValue)) {
		// 如果不符合规则，尝试修复
		// 先移除多余的小数点
		let parts = inputValue.split('.')
		if (parts.length > 2) {
			inputValue = parts[0] + '.' + parts.slice(1).join('')
		}

		// 截断小数位至2位
		if (inputValue.includes('.')) {
			const [intPart, decPart] = inputValue.split('.')
			inputValue = intPart + '.' + decPart.substring(0, 2)
		}

		// 移除非数字字符（除小数点）
		inputValue = inputValue.replace(/[^\d.]/g, '')
	}

	// 检查最大值
	const numValue = parseFloat(inputValue)
	if (numValue > 100000) {
		uni.showToast({ icon: 'none', title: '金额不能超过100000' })
		form.price = '100000'
		return
	}

	form.price = inputValue
}

async function submitForm() {
	if (!formRef.value?.validate) return

	// 额外校验服务名称不能为空
	const trimmedName = (form.name || '').trim()
	if (!trimmedName) {
		uni.showToast({ icon: 'error', title: '请输入名称' })
		return
	}

	// 额外校验费用
	const price = String(form.price || '').trim()
	const numPrice = Number(!price ? 0 : price)
	if (isNaN(numPrice) || numPrice < 0) {
		uni.showToast({ icon: 'error', title: '金额格式错误' })
		return
	}

	if (numPrice > 100000) {
		uni.showToast({ icon: 'error', title: '金额过高' })
		return
	}

	// 检查小数位最多两位
	if (price.includes('.')) {
		const decimalPart = price.split('.')[1]
		if (decimalPart.length > 2) {
			uni.showToast({ icon: 'error', title: '最多两位小数' })
			return
		}
	}

	try {
		await formRef.value.validate()
		const isEdit = !!editingId.value
		if (isEdit) {
			if (submitting.value) return
			submitting.value = true
			const submitBody = { id: Number(editingId.value), ...buildSubmitPayload(form) }
			await http.put('/bookkeeping-service/bookkeeping/membership/update', submitBody)
			closePopup()
			uni.showToast({ icon: 'success', title: '保存成功' })
			await refreshList()
			return
		}

		if (submitting.value) return
		submitting.value = true
		const submitBody = buildSubmitPayload(form)
		await http.post('/bookkeeping-service/bookkeeping/membership/add', submitBody)
		closePopup()
		uni.showToast({ icon: 'success', title: '新增成功' })
		await refreshList()
	} catch (err) {
		// 已在请求封装中提示，这里无需重复
	} finally {
		submitting.value = false
	}
}

function removeItem(id) {
	uni.showModal({
		title: '确认删除',
		content: '删除后不可恢复，确认删除该订阅？',
		success: async (res) => {
			if (res.confirm) {
				try {
					await http.delete(`/bookkeeping-service/bookkeeping/membership/delete?id=${id}`)
					uni.showToast({ icon: 'success', title: '已删除' })
					await refreshList()
				} catch (error) {
					// 请求封装内已处理toast
				}
			}
		}
	})
}

// 映射/显示
function mapServiceType(v) {
	return dictStore.getDictNameByCode(
		dictStore.dictTypeEnum.BOOKKEEPING_MEMBERSHIP_TYPE,
		Number(v),
		'未分类'
	)
}

function displayCycle(item) {
	// 从字典获取周期名称
	let cycleName = dictStore.getDictNameByCode(
		dictStore.dictTypeEnum.BOOKKEEPING_MEMBERSHIP_BILLING_CYCLE,
		Number(item.cycleType),
		''
	)
	if (!cycleName) {
		cycleName = getLegacyCycleName(item.cycleType)
	}
	
	// 如果是自定义周期，显示间隔和单位
	if (isCustomCycle(item.cycleType)) {
		let unitName = dictStore.getDictNameByCode(
			dictStore.dictTypeEnum.BOOKKEEPING_MEMBERSHIP_CYCLE_UNIT,
			Number(item.customUnit),
			''
		)
		if (!unitName) {
			unitName = getLegacyCycleUnitName(item.customUnit)
		}
		return `${item.customInterval || ''}${unitName}`
	}
	
	return cycleName || ''
}

function mapCustomUnit(u) {
	// 从字典获取单位名称
	const unitName = dictStore.getDictNameByCode(
		dictStore.dictTypeEnum.BOOKKEEPING_MEMBERSHIP_CYCLE_UNIT,
		Number(u),
		''
	)
	return unitName || getLegacyCycleUnitName(u) || ''
}

function formatDateStr(d) {
	const y = d.getFullYear()
	const m = `${d.getMonth() + 1}`.padStart(2, '0')
	const day = `${d.getDate()}`.padStart(2, '0')
	return `${y}-${m}-${day}`
}

function formatDate(s) { return s || '-' }

function parseDate(s) {
	if (!s) return null
	const [y, m, d] = s.split('-').map(n => Number(n))
	return new Date(y, m - 1, d)
}

function addByUnit(date, unit, interval) {
	const d = new Date(date)
	switch (unit) {
		case 'day': d.setDate(d.getDate() + interval); break
		case 'week': d.setDate(d.getDate() + interval * 7); break
		case 'month': d.setMonth(d.getMonth() + interval); break
		case 'year': d.setFullYear(d.getFullYear() + interval); break
	}
	return d
}

function getNextRelevantDate(item) {
	const now = new Date()
	if (item.autoRenew) {
		// 计算下一次扣费日
		let unit = 'month'
		let interval = 1
		
		// 获取周期类型名称来判断
		const cycleName = dictStore.getDictNameByCode(
			dictStore.dictTypeEnum.BOOKKEEPING_MEMBERSHIP_BILLING_CYCLE,
			Number(item.cycleType),
			''
		)
		
		if (cycleName.includes('月') || cycleName === '按月') {
			unit = 'month'
			interval = 1
		} else if (cycleName.includes('年') || cycleName === '按年') {
			unit = 'year'
			interval = 1
		} else if (cycleName.includes('周') || cycleName === '按周') {
			unit = 'week'
			interval = 1
		} else if (cycleName.includes('天') || cycleName === '按天') {
			unit = 'day'
			interval = 1
		} else if (isCustomCycle(item.cycleType)) {
			// 自定义周期：从字典获取单位
			const unitName = dictStore.getDictNameByCode(
				dictStore.dictTypeEnum.BOOKKEEPING_MEMBERSHIP_CYCLE_UNIT,
				Number(item.customUnit),
				''
			)
			if (unitName.includes('天')) unit = 'day'
			else if (unitName.includes('周')) unit = 'week'
			else if (unitName.includes('月')) unit = 'month'
			else if (unitName.includes('年')) unit = 'year'
			interval = Number(item.customInterval || 1)
		} else {
			return now
		}
		
		let d = parseDate(item.startDate)
		if (!d) return now
		while (addByUnit(d, unit, interval) <= now) {
			d = addByUnit(d, unit, interval)
		}
		return addByUnit(d, unit, interval)
	}
	// 非续费：结束日
	return parseDate(item.endDate) || now
}

function nextBillingDateText(item) {
	const d = getNextRelevantDate(item)
	return formatDateStr(d)
}

function daysBetween(a, b) {
	const MS = 24 * 60 * 60 * 1000
	return Math.floor((a - b) / MS)
}

function calcStatus(item) {
	const now = new Date()
	const remind = Number(item.remindDays ?? 7)
	const end = parseDate(item.endDate)
	if (!end) return { value: 'active', label: '有效' }
	if (end < now) return { value: 'expired', label: '已过期' }
	if (daysBetween(end, now) <= remind) {
		return { value: 'expiring', label: item.autoRenew ? '即将扣费' : '即将到期' }
	}
	return { value: 'active', label: '有效' }
}

function statusClass(s) {
	if (s.value === 'expired') return 'expired'
	if (s.value === 'expiring') return 'expiring'
	return 'active'
}

function normalizeFormToItem(f, id) {
	const isCustom = isCustomCycle(f.cycleType)
	return {
		id: id || String(Date.now()),
		createdAt: id ? (list.value.find(i => i.id === id)?.createdAt || Date.now()) : Date.now(),
		name: (f.name || '').trim(),
		type: Number(f.type),
		price: Number(f.price || 0),
		cycleType: Number(f.cycleType),
		customInterval: isCustom ? Number(f.customInterval || 1) : undefined,
		customUnit: isCustom ? Number(f.customUnit) : undefined,
		startDate: f.startDate,
		endDate: f.autoRenew ? '' : (f.endDate || ''),
		autoRenew: !!f.autoRenew,
		paymentMethod: (f.paymentMethod || '').trim(),
		remindDays: Number(f.remindDays || 7),
		remark: (f.remark || '').trim()
	}
}

function normalizeCost(item) {
	const price = Number(item.price || 0)
	
	// 获取周期类型名称来判断
	const cycleName = dictStore.getDictNameByCode(
		dictStore.dictTypeEnum.BOOKKEEPING_MEMBERSHIP_BILLING_CYCLE,
		Number(item.cycleType),
		''
	)
	
	if (cycleName.includes('一次性')) {
		return { monthly: 0, yearly: 0 }
	}
	
	if (cycleName.includes('月') || cycleName === '按月') {
		return { monthly: price, yearly: price * 12 }
	}
	if (cycleName.includes('年') || cycleName === '按年') {
		return { monthly: price / 12, yearly: price }
	}
	if (cycleName.includes('周') || cycleName === '按周') {
		return { monthly: (price * 52) / 12, yearly: price * 52 }
	}
	if (cycleName.includes('天') || cycleName === '按天') {
		return { monthly: price * 30, yearly: price * 365 }
	}
	if (isCustomCycle(item.cycleType)) {
		const interval = Number(item.customInterval || 1)
		const unitName = dictStore.getDictNameByCode(
			dictStore.dictTypeEnum.BOOKKEEPING_MEMBERSHIP_CYCLE_UNIT,
			Number(item.customUnit),
			''
		)
		
		if (unitName.includes('天')) {
			return { monthly: price * (30 / interval), yearly: price * (365 / interval) }
		}
		if (unitName.includes('周')) {
			return { monthly: price * ((52 / 12) / interval), yearly: price * (52 / interval) }
		}
		if (unitName.includes('月')) {
			return { monthly: price / interval, yearly: (price * 12) / interval }
		}
		if (unitName.includes('年')) {
			return { monthly: (price * 12) / interval, yearly: price / interval }
		}
		return { monthly: price, yearly: price * 12 }
	}
	
	return { monthly: 0, yearly: 0 }
}

function loadList() {
	try {
		const s = uni.getStorageSync(STORAGE_KEY)
		if (!s) return []
		const arr = JSON.parse(s)
		return Array.isArray(arr) ? arr.map(normalizeStoredItem) : []
	} catch (e) { return [] }
}

function saveList(arr) {
	try { uni.setStorageSync(STORAGE_KEY, JSON.stringify(arr || [])) } catch (e) {}
}

// 服务端列表获取
async function fetchList() {
	if (loadingList.value) return
	loadingList.value = true
	try {
		const reqBody = removeEmpty({
			membershipType: filterType.value !== '' && filterType.value !== null && filterType.value !== undefined ? Number(filterType.value) : undefined,
			sortType: Number(sortType.value),
			sortWay: Number(sortWay.value),
			expiryType: Number(expiryType.value)
		})
		const res = await http.post('/bookkeeping-service/bookkeeping/membership/list', reqBody)
		if (res && Array.isArray(res.data)) {
			const mapped = res.data.map(normalizeServerItemToLocal)
			list.value = mapped
			saveList(list.value)
		}
	} finally {
		loadingList.value = false
	}
}

async function refreshList() {
	await fetchList()
}

// 辅助函数：判断是否为自定义周期
function isCustomCycle(cycleTypeCode) {
	if (!cycleTypeCode) return false
	const cycleName = dictStore.getDictNameByCode(
		dictStore.dictTypeEnum.BOOKKEEPING_MEMBERSHIP_BILLING_CYCLE,
		Number(cycleTypeCode),
		''
	)
	if (cycleName) return cycleName.includes('自定义') || cycleName.toLowerCase() === 'custom'
	if (typeof cycleTypeCode === 'string') {
		return cycleTypeCode === 'custom'
	}
	return false
}

// 辅助函数：根据名称获取周期code
function getCycleCodeByName(name) {
	const option = cycleOptions.value.find(opt => 
		opt.text === name || opt.text.includes(name)
	)
	return option ? Number(option.value) : undefined
}

// 辅助函数：根据名称获取自定义单位code
function getCustomUnitCodeByName(name) {
	const option = customUnitOptions.value.find(opt => 
		opt.text === name || opt.text.includes(name)
	)
	return option ? Number(option.value) : undefined
}

// 辅助函数：获取默认会员类型
function getMembershipTypeDefault() {
	const option = serviceTypeOptions.value[0]
	return option ? option.value : ''
}

// 构建提交参数
function buildSubmitPayload(f) {
	const isCustom = isCustomCycle(f.cycleType)
	const payload = {
		membershipType: Number(f.type),
		membershipName: (f.name || '').trim(),
		amount: Number(f.price || 0),
		billingCycle: Number(f.cycleType),
		cycleNum: isCustom ? Number(f.customInterval || 0) : undefined,
		cycleUnit: isCustom ? Number(f.customUnit) : undefined,
		startDate: f.startDate,
		endDate: f.autoRenew ? undefined : (f.endDate || undefined),
		autoRenew: !!f.autoRenew,
		payWay: (f.paymentMethod || '').trim(),
		remindDays: f.remindDays !== '' && f.remindDays !== null && f.remindDays !== undefined ? Number(f.remindDays) : undefined,
		remark: (f.remark || '').trim()
	}
	return removeEmpty(payload)
}

// 移除 undefined / null 值（保留 0 和 false）
function removeEmpty(obj) {
	const result = {}
	Object.keys(obj).forEach(key => {
		const value = obj[key]
		if (value === undefined || value === null) return
		result[key] = value
	})
	return result
}

// 将本地存储的数据升级为最新结构
function normalizeStoredItem(raw) {
	const normalized = { ...raw }
	if (normalized.type !== undefined) normalized.type = normalizeMembershipTypeCode(normalized.type)
	if (normalized.cycleType !== undefined) normalized.cycleType = normalizeCycleTypeCode(normalized.cycleType)
	if (normalized.customUnit !== undefined) normalized.customUnit = normalizeCycleUnitCode(normalized.customUnit)
	if (normalized.customInterval !== undefined && normalized.customInterval !== null && normalized.customInterval !== '') {
		normalized.customInterval = Number(normalized.customInterval)
	}
	return normalized
}

function normalizeMembershipTypeCode(value) {
	if (value === undefined || value === null || value === '') return getMembershipTypeDefault()
	if (typeof value === 'number') return value
	const numeric = Number(value)
	if (!Number.isNaN(numeric)) return numeric
	const legacyMap = {
		music: '音乐',
		video: '视频',
		shopping: '购物',
		ai: 'AI',
		tools: '工具',
		life: '生活',
		cloud: '云服务',
		edu: '教育',
		other: '其他'
	}
	const name = legacyMap[value] || value
	const option = serviceTypeOptions.value.find(opt => opt.text.includes(name))
	return option ? option.value : getMembershipTypeDefault()
}

function normalizeCycleTypeCode(value) {
	if (value === undefined || value === null || value === '') return getCycleCodeByName('按月') || value
	if (typeof value === 'number') return value
	const numeric = Number(value)
	if (!Number.isNaN(numeric)) return numeric
	const legacyMap = {
		monthly: '按月',
		yearly: '按年',
		weekly: '按周',
		daily: '按天',
		one_time: '一次性',
		custom: '自定义'
	}
	const name = legacyMap[value] || value
	const code = getCycleCodeByName(name)
	return code !== undefined ? code : value
}

function normalizeCycleUnitCode(value) {
	if (value === undefined || value === null || value === '') return value
	if (typeof value === 'number') return value
	const numeric = Number(value)
	if (!Number.isNaN(numeric)) return numeric
	const legacyMap = {
		day: '天',
		week: '周',
		month: '月',
		year: '年'
	}
	const name = legacyMap[value] || value
	const code = getCustomUnitCodeByName(name)
	return code !== undefined ? code : value
}

function getLegacyCycleName(value) {
	const legacyMap = {
		monthly: '按月',
		yearly: '按年',
		weekly: '按周',
		daily: '按天',
		one_time: '一次性',
		custom: '自定义'
	}
	if (typeof value === 'string') {
		return legacyMap[value] || value
	}
	return ''
}

function getLegacyCycleUnitName(value) {
	const legacyMap = {
		day: '天',
		week: '周',
		month: '月',
		year: '年'
	}
	if (typeof value === 'string') {
		return legacyMap[value] || value
	}
	return ''
}

// 将服务端记录映射到本地结构
function normalizeServerItemToLocal(server) {
	return normalizeStoredItem({
		id: server.id,
		createdAt: server.createTime ? new Date(server.createTime).getTime?.() || Date.now() : Date.now(),
		name: server.membershipName,
		type: server.membershipType,
		price: server.amount,
		cycleType: server.billingCycle,
		customInterval: server.cycleNum,
		customUnit: server.cycleUnit,
		startDate: server.startDate,
		endDate: server.endDate || '',
		autoRenew: !!server.autoRenew,
		paymentMethod: server.payWay || '',
		remindDays: server.remindDays,
		remark: server.remark || ''
	})
}

onMounted(async () => {
	try {
		// 首次加载列表数据
		await refreshList()
	} catch (e) {}
})
</script>

<style scoped>
.page { padding: 8px 8px 12px; }
.toolbar { margin-bottom: 0; }
.toolbar-row { display: flex; align-items: center; margin: 0 0 0; }
.toolbar-row.single { gap: 4px; overflow: visible; flex-wrap: nowrap; justify-content: space-between; }
.search-bar { flex: 1; min-width: 0; margin-bottom: 8px; }
.filter-select { flex: 1; min-width: 80px; font-size: 12px; }
.mr8 { margin-right: 20px; }

/* 穿透uni-searchbar组件样式，强制padding为0 */
:deep(.uni-searchbar) { padding: 0 !important; }
:deep(.uni-searchbar__box) { padding: 0 !important; }

.summary { display: flex; gap: 8px; margin: 8px 0 12px; }
.card { flex: 1; background: #fff; border-radius: 8px; padding: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; flex-direction: column; }
.card-title { color: #666; font-size: 12px; }
.card-value { margin-top: 6px; font-weight: 600; font-size: 18px; }

.item { display: flex; justify-content: space-between; width: 100%; gap: 8px; }
.item-left { flex: 1; min-width: 0; }
.item-title { display: flex; align-items: center; gap: 8px; }
.name { font-weight: 600; }
.type { font-size: 12px; color: #888; background: #f6f6f6; padding: 2px 6px; border-radius: 4px; }
.item-sub { display: flex; align-items: baseline; gap: 6px; margin-top: 4px; }
.price { font-size: 16px; color: #333; }
.cycle { font-size: 12px; color: #999; }
.item-meta { margin-top: 4px; color: #888; font-size: 12px; display: flex; gap: 10px; flex-wrap: wrap; }
.item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.mini-btn { line-height: 1; }
.mini-btn.warn { background: #fff0f0; color: #dd524d; }
.actions { display: flex; gap: 8px; }
.icon-button { width: 32px; height: 32px; border-radius: 16px; background: #fff0f0; display: flex; align-items: center; justify-content: center; padding: 0; border: none; }
.icon-button.warn { background: #fff0f0; }
.icon-button.warn::after { border: none; }

.status { padding: 2px 6px; font-size: 12px; border-radius: 4px; }
.status.active { background: #effaf3; color: #2db55d; }
.status.expiring { background: #fff7e6; color: #faad14; }
.status.expired { background: #fff1f0; color: #ff4d4f; }

/* 弹框样式优化 - 自适应小屏幕 */
.popup {
	background: #fff;
	border-top-left-radius: 12px;
	border-top-right-radius: 12px;
	padding: 0;
	display: flex;
	flex-direction: column;
	max-height: 90vh;
	overflow: hidden;
}
.popup-header {
	text-align: center;
	font-weight: 600;
	padding: 12px 12px 8px;
	flex-shrink: 0;
	border-bottom: 1px solid #f0f0f0;
}
/* 穿透uni-forms组件，使其支持滚动 */
:deep(.uni-forms) {
	flex: 1;
	overflow-y: auto;
	padding: 12px;
	overflow-x: hidden;
}
/* 调整表单项间距 */
:deep(.uni-forms-item) {
	margin-bottom: 12px !important;
}
:deep(.uni-forms-item__inner) {
	padding: 0 !important;
}
.popup-actions {
	display: flex;
	gap: 8px;
	padding: 12px;
	flex-shrink: 0;
	border-top: 1px solid #f0f0f0;
}
.btn { flex: 1; }
.btn.primary { background: #007aff; color: #fff; }
.row { display: flex; align-items: center; }
.floating-add {
	position: fixed;
	right: 24px;
	bottom: 24px;
	width: 52px;
	height: 52px;
	border-radius: 26px;
	background: #007aff;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 6px 16px rgba(0, 122, 255, 0.3);
	z-index: 50;
	padding: 0;
	border: none;
}
.floating-add::after {
	border: none;
}
</style>
