<!-- 账号详情 -->
<template>
	<view>
		<view class="container">
			<uni-section title="账号详情" type="line">
				<view class="form-section">
					<uni-forms ref="form" :model="formData">
						<uni-forms-item label="应用名称">
							<uni-easyinput
								v-model="formData.name"
								placeholder="请输入应用名称"
							/>
						</uni-forms-item>
						<uni-forms-item label="应用地址">
							<uni-easyinput
								v-model="formData.address"
								placeholder="请输入应用地址"
							/>
						</uni-forms-item>
						<uni-forms-item label="账号">
							<uni-easyinput
								v-model="formData.account"
								placeholder="请输入账号"
							/>
						</uni-forms-item>
						<uni-forms-item label="应用分类">
							<uni-data-select
								v-model="formData.type"
								:localdata="typeOptions"
								placeholder="请选择应用分类"
							/>
						</uni-forms-item>
						<uni-forms-item label="密码">
							<uni-easyinput
								v-model="formData.password"
								placeholder="请输入密码"
								type="password"
							/>
						</uni-forms-item>
						<uni-forms-item label="备注">
							<uni-easyinput
								v-model="formData.remark"
								placeholder="请输入备注"
								type="textarea"
							/>
						</uni-forms-item>
					</uni-forms>
				</view>
                <!-- 底部按钮 -->
                <view class="popup-footer">
                    <button class="cancel-button" @click="handleDelete">删除</button>
					<button class="confirm-button" @click="handleSave">保存</button>
				</view>
			</uni-section>
		</view>
	</view>
</template>

<script setup>
	import { ref, reactive, onMounted, computed } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import http from '@/api/request.js'
	import { useDictStore } from '@/stores/dict.ts'

	const dictStore = useDictStore()
	const form = ref(null)
	const isEdit = ref(false)

	const formData = reactive({
		id: '',
		name: '',
		address: '',
		account: '',
		type: '',
		remark: '',
		password: ''
	})

	const typeOptions = computed(() => {
		const dictData = dictStore.getDictDataArray(dictStore.dictTypeEnum.AUTH_APPLICATION_ACCOUNT_TYPE)
		return dictData.map(item => ({
			value: item.dictCode,
			text: item.dictName
		}))
	})

	onLoad((option) => {
		if (option.id) {
			isEdit.value = true
			getAccountDetail(option.id)
		}
	})

	function getAccountDetail(id) {
		http.get('/auth-service/applicationAccount/detail?id=' + id)
			.then(res => {
				const data = res.data
				formData.id = data.id
				formData.name = data.name
				formData.address = data.address
				formData.account = data.account
				formData.type = data.type
				formData.remark = data.remark
				formData.password = data.password
			})
	}

	function handleSave() {
		// 自定义验证：应用名称、应用地址、账号至少有一项不能为空
		if (!formData.name && !formData.address && !formData.account) {
			uni.showToast({
				title: '应用名称、应用地址、账号至少填写一项',
				icon: 'none'
			})
			return
		}

		form.value.validate().then(res => {
			const url = isEdit.value ? '/auth-service/applicationAccount/update' : '/auth-service/applicationAccount/add'
			const method = isEdit.value ? 'put' : 'post'
			
			http[method](url, formData)
				.then(res => {
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				})
		})
	}

	function handleDelete() {
		uni.showModal({
			title: '提示',
			content: '确认删除该账号吗？',
			success: (res) => {
				if (res.confirm) {
					http.delete('/auth-service/applicationAccount/delete?id=' + formData.id)
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