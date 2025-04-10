<template>
	<view class="action-edit">
		<uni-forms ref="form" :model="formData" :rules="rules">
			<uni-forms-item label="记录类型" required>
				<uni-data-select
					v-model="formData.recordCategory"
					:localdata="recordCategoryOptions"
				/>
			</uni-forms-item>
			
			<uni-forms-item label="记录来源" required>
				<uni-easyinput
					v-model="formData.recordSource"
					placeholder="请输入记录来源"
				/>
			</uni-forms-item>
			
			<uni-forms-item label="记录分类" required>
				<uni-data-select
					v-model="formData.recordType"
					:localdata="dictStore.getDictDataWithDataSelectCode(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TYPE)"
				/>
			</uni-forms-item>
			
			<uni-forms-item label="记录图标">
				<view class="icon-selector" @click="showIconSelector">
					<image v-if="formData.recordIcon" :src="getIconUrl(formData.recordIcon)" class="selected-icon"></image>
					<text v-else>请选择图标</text>
				</view>
			</uni-forms-item>
			
			<uni-forms-item label="记录标签">
				<uni-data-checkbox
					multiple
					v-model="formData.recordTags"
					:localdata="dictStore.getDictDataWithDataSelectId(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TAG)"
				/>
			</uni-forms-item>
		</uni-forms>
		
		<!-- 图标选择弹框 -->
		<uni-popup ref="iconPopup" type="center">
			<view class="icon-popup">
				<view class="popup-header">
					<text class="popup-title">选择图标</text>
					<text class="popup-close" @click="closeIconSelector">×</text>
				</view>
				<scroll-view class="icon-list" scroll-y>
					<view v-for="categoryGroup in iconList" :key="categoryGroup.category" class="icon-category">
						<view class="category-title">{{categoryGroup.category}}</view>
						<view class="category-icons">
							<view class="icon-item" v-for="icon in categoryGroup.icons" :key="icon.path" @click="selectIcon(icon)" :class="getIconItemClass(icon)">
								<image :src="getIconUrl(icon.path)" class="icon-image"></image>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</uni-popup>
		
		<view class="form-actions">
			<button type="primary" @click="submitForm">保存</button>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDictStore } from '@/stores/dict'
import { onLoad } from '@dcloudio/uni-app'
import http from '@/api/request.js'

const dictStore = useDictStore()
const form = ref(null)
const iconPopup = ref(null)

const iconCategories = [
	{ dir: 'icon/yinshi', name: '饮食' },
	{ dir: 'icon/gouwu', name: '购物' },
	{ dir: 'icon/shenghuo', name: '生活' },
	{ dir: 'icon/jiaotong', name: '交通' },
	{ dir: 'icon/yule', name: '娱乐' },
	{ dir: 'icon/bangong', name: '办公' },
	{ dir: 'icon/jiating', name: '家庭' },
	{ dir: 'icon/shouru', name: '收入' },
	{ dir: 'icon/qita', name: '其他' }
].map(category => ({
	...category,
	icons: []
}))

const iconList = ref([])

const formData = ref({
	recordCategory: null,
	recordSource: '',
	recordType: null,
	recordIcon: '',
	recordTags: []
})

const recordCategoryOptions = [
	{ value: 1, text: '支出' },
	{ value: 2, text: '收入' }
]

const rules = {
	recordCategory: {
		rules: [{ required: true, errorMessage: '记录类型不能为空' }]
	},
	recordSource: {
		rules: [{ required: true, errorMessage: '记录来源不能为空' }]
	},
	recordType: {
		rules: [{ required: true, errorMessage: '记录分类不能为空' }]
	}
}

const detailId = ref('')

onLoad((options) => {
	detailId.value = options.id
	if (detailId.value) {
		fetchDetail(detailId.value)
	}
	loadIcons()
})

// 获取详情
function fetchDetail(id) {
	http.get(`/bookkeeping-service/actions/detail?id=${id}`)
		.then(res => {
			formData.value = res.data
		})
}

// 加载图标列表
const loadIcons = () => {
	iconList.value.length = 0 // 清空现有数据
	
	iconCategories.forEach(category => {
		// 获取目录下的所有SVG文件
		const files = uni.getFileSystemManager().readdirSync(`/static/bookkeeping/${category.dir}`)
		const icons = files
			.filter(file => file.endsWith('.svg'))
			.map(file => ({
				path: `/static/bookkeeping/${category.dir}/${file}`,
				recordIcon: `/icon/${category.dir.split('/')[1]}/${file.replace('.svg', '')}`
			}))
			
		iconList.value.push({
			category: category.name,
			icons: icons
		})
	})
}

// 选择图标
const selectIcon = (icon) => {
	formData.value.recordIcon = icon.recordIcon
	closeIconSelector()
}

// 获取图标URL
const getIconUrl = (iconPath) => {
	if (iconPath.startsWith('/icon/')) {
		// 如果是recordIcon格式，转换为实际文件路径
		return `/static/bookkeeping/${iconPath}.svg`
	}
	return iconPath
}

// 获取选中图标的样式
const getIconItemClass = (icon) => {
	return {
		'icon-item': true,
		'selected': formData.value.recordIcon === icon.recordIcon
	}
}

function showIconSelector() {
	iconPopup.value.open()
}

function closeIconSelector() {
	iconPopup.value.close()
}

function submitForm() {
	form.value.validate().then(() => {
		const submitData = {
			...formData.value
		}
		
		if (detailId.value) {
			submitData.id = detailId.value
		}
		
		const url = detailId.value ? '/bookkeeping-service/actions/update' : '/bookkeeping-service/actions/add'
		const method = detailId.value ? 'put' : 'post'
		
		http[method](url, submitData).then(() => {
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			})
			uni.navigateBack()
		})
	})
}
</script>

<style>
.action-edit {
	padding: 15px;
}

.icon-selector {
	border: 1px solid #ddd;
	padding: 12px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	gap: 10px;
	background: #f9f9f9;
}

.selected-icon {
	width: 24px;
	height: 24px;
}

.icon-popup {
	background-color: #fff;
	border-radius: 10px;
	width: 90vw;
	max-height: 80vh;
	padding: 20px;
}

.popup-header {
	padding: 0 0 15px 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid #eee;
}

.popup-title {
	font-size: 16px;
	font-weight: bold;
	color: #333;
}

.popup-close {
	font-size: 24px;
	color: #999;
	cursor: pointer;
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.icon-list {
	padding: 15px 0;
	max-height: calc(80vh - 80px);
}

.icon-category {
	margin-bottom: 20px;
}

.category-title {
	font-size: 15px;
	color: #333;
	font-weight: 500;
	padding: 10px 0;
	text-align: center;
}

.category-icons {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
	padding: 0 5px;
}

.icon-item {
	width: 50px;
	height: 50px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background-color: #f5f5f5;
	transition: all 0.3s ease;
}

.icon-item.selected {
	background-color: #FFE082;
}

.icon-item:active {
	transform: scale(0.95);
}

.icon-image {
	width: 24px;
	height: 24px;
	filter: grayscale(100%);
}

.selected .icon-image {
	filter: none;
}

.form-actions {
	margin-top: 20px;
	padding: 10px;
}
</style> 