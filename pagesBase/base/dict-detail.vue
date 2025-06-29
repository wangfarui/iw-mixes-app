<!-- 字典详情 -->
<template>
	<view>
		<view class="container">
			<uni-section title="字典详情" type="line">
				<view class="form-section">
					<uni-forms ref="form" :model="formData" :rules="rules">
						<uni-forms-item label="字典类型" required>
							<uni-data-select
								v-model="formData.dictType"
								:localdata="dictTypeOptions"
								placeholder="请选择字典类型"
							/>
						</uni-forms-item>
						<uni-forms-item label="字典编码">
							<uni-easyinput
								v-model="formData.dictCode"
								type="number"
								placeholder="请输入字典编码"
							/>
						</uni-forms-item>
						<uni-forms-item label="字典名称" required>
							<uni-easyinput
								v-model="formData.dictName"
								placeholder="请输入字典名称"
							/>
						</uni-forms-item>
						<uni-forms-item label="字典状态" required>
							<uni-data-select
								v-model="formData.dictStatus"
								:localdata="dictStatusOptions"
								placeholder="请选择字典状态"
							/>
						</uni-forms-item>
					</uni-forms>
				</view>
                <!-- 底部按钮 -->
                <view class="popup-footer">
                    <button v-if="isEdit" class="cancel-button" @click="handleDelete">删除</button>
					<button class="confirm-button" @click="handleSave">保存</button>
				</view>
			</uni-section>
		</view>
	</view>
</template>

<script setup>
	import { ref, reactive, onMounted } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import http from '@/api/request.js'
	import {
		useDictStore
	} from "@/stores/dict.ts"
	import {
		refreshDictCache
	} from "@/api/login.js";

	const dictStore = useDictStore()
	const form = ref(null)
	const isEdit = ref(false)

	const formData = reactive({
		id: '',
		dictType: '',
		dictName: '',
		dictStatus: '1',
		dictCode: ''
	})

	const dictTypeOptions = ref(dictStore.getDictTypeArray().map(item => ({
		value: item.code,
		text: item.name
	})))
	const dictStatusOptions = ref([
		{ value: 1, text: '启用' },
		{ value: 0, text: '禁用' }
	])

	const rules = {
		dictType: {
			rules: [{
				required: true,
				errorMessage: '请选择字典类型'
			}]
		},
		dictName: {
			rules: [{
				required: true,
				errorMessage: '请输入字典名称'
			}]
		},
		dictStatus: {
			rules: [{
				required: true,
				errorMessage: '请选择字典状态'
			}]
		}
	}

	onLoad((option) => {
		if (option.id) {
			isEdit.value = true
			getDictDetail(option.id)
		}
	})

	function getDictDetail(id) {
		http.get('/auth-service/dict/detail?id=' + id)
			.then(res => {
				const data = res.data
				formData.id = data.id
				formData.dictType = data.dictType
				formData.dictName = data.dictName
				formData.dictStatus = data.dictStatus
				formData.dictCode = data.dictCode
			})
	}

	function handleSave() {
		form.value.validate().then(res => {
			const url = isEdit.value ? '/auth-service/dict/update' : '/auth-service/dict/add'
			const method = isEdit.value ? 'put' : 'post'
			
			http[method](url, formData)
				.then(res => {
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					})
					refreshDictCache()
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				})
		})
	}

	function handleDelete() {
		uni.showModal({
			title: '提示',
			content: '确认删除该字典吗？',
			success: (res) => {
				if (res.confirm) {
					http.delete('/auth-service/dict/delete?id=' + formData.id)
						.then(res => {
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							})
							setTimeout(() => {
								uni.navigateBack()
							}, 1500)
						})
				}
			}
		})
	}
</script>

<style>
	.container {
		padding: 10px;
	}
	.form-section {
		background-color: #fff;
		padding: 10px;
		border-radius: 5px;
		margin-bottom: 10px;
	}
	:deep(.uni-forms-item__label) {
		width: 100px !important;
	}
	.button-section {
		display: flex;
		justify-content: center;
		gap: 10px;
		padding: 10px;
	}

    .popup-footer {
		display: flex;
		justify-content: space-between;
		padding: 10px;
		border-top: 1px solid #eee;
	}
    .cancel-button,
	.confirm-button {
		flex: 1;
		padding: 10px;
		font-size: 16px;
		cursor: pointer;
		border: none;
		border-radius: 4px;
	}

	.cancel-button {
		background-color: #ccc;
		color: #fff;
		margin-right: 10px;
	}

	.confirm-button {
		background-color: #007aff;
		color: #fff;
	}
</style> 