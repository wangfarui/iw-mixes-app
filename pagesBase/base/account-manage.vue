<!-- 账号管理 -->
<template>
	<view>
		<view class="container">
			<view class="filter-section">
				<view class="filter-row">
					<view class="filter-item">
						<uni-easyinput
							v-model="filterForm.name"
							placeholder="请输入应用名称"
							@blur="handleFilterChange"
							@clear="handleFilterChange"
						/>
					</view>
					<view class="filter-item">
						<uni-easyinput
							v-model="filterForm.address"
							placeholder="请输入应用地址"
							@blur="handleFilterChange"
							@clear="handleFilterChange"
						/>
					</view>
					<view class="filter-action">
						<button class="add-btn" @click="handleAddAccount">新增</button>
					</view>
				</view>
			</view>
			<view class="content">
				<uni-list>
					<uni-list-item v-for="item in accountList" :key="item.id" @click="handleAccountClick(item)" clickable>
						<template v-slot:body>
							<view class="item-left">
								<uni-row>
									<view>应用名称：{{item.name}}</view>
								</uni-row>
								<uni-row>
									<view>应用地址：{{item.address}}</view>
								</uni-row>
								<uni-row>
									<view>账号：{{item.account}}</view>
								</uni-row>
							</view>
						</template>
						<template v-slot:footer>
							<view class="footer-content-fixed">
								<button class="view-password-btn" @click.stop="handleViewPassword(item)">查看密码</button>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
				<view>
					<uni-load-more :status="accountListStatus" />
				</view>
			</view>
		</view>
	</view>
	<!-- 密码弹窗 -->
	<uni-popup ref="passwordPopup" type="center">
		<view style="padding: 20px; min-width: 200px; max-width: 80vw; background: #fff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);">
			<text
				style="font-size: 18px; word-break: break-all; text-align: center; display: block; width: 100%;"
			>
				{{ passwordToShow }}
			</text>
			<view style="margin-top: 20px; display: flex; justify-content: space-between;">
				<button @click="handleCopyPassword">复制</button>
				<button @click="closePasswordPopup">关闭</button>
			</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import { ref, reactive } from 'vue'
	import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
	import http from '@/api/request.js'

	const accountListStatus = ref('more')
	const accountList = ref([])

	const filterForm = reactive({
		name: '',
		address: ''
	})

	const page = reactive({
		currentPage: 1,
		pageSize: 10,
		name: '',
		address: ''
	})

	const showPasswordPopup = ref(false)
	const passwordToShow = ref('')
	const passwordPopup = ref(null)

	function handleFilterChange() {
		page.name = filterForm.name
		page.address = filterForm.address
		initPage()
	}

	function searchPage() {
		accountListStatus.value = 'loading'
		http.post('/auth-service/application/account/page', page)
			.then(res => {
				const data = res.data
				if (data.records && data.records.length == page.pageSize) {
					accountListStatus.value = 'more'
				} else {
					accountListStatus.value = 'noMore'
				}
				accountList.value = [...accountList.value, ...data.records]
			})
			.catch(error => {
				accountListStatus.value = 'more'
			})
			.finally(() => {
				uni.stopPullDownRefresh();
			});
	}

	function handleAccountClick(item) {
		uni.navigateTo({
			url: '/pagesBase/base/account-detail?id=' + item.id
		});
	}

	function handleAddAccount() {
		uni.navigateTo({
			url: '/pagesBase/base/account-detail'
		});
	}

	function handleViewPassword(item) {
		http.get('/auth-service/application/account/viewPassword?id=' + item.id)
			.then(res => {
				passwordToShow.value = res.data
				passwordPopup.value.open() // 关键：手动打开弹窗
			})
	}

	function handleCopyPassword() {
		uni.setClipboardData({
			data: passwordToShow.value,
			success: () => {
				uni.showToast({ title: '已复制', icon: 'success' })
			}
		})
	}

	function closePasswordPopup() {
		passwordPopup.value.close()
	}

	function initPage() {
		page.currentPage = 1
		accountList.value = []
		searchPage()
	}

	onPullDownRefresh(() => {
		initPage()
	})

	onReachBottom(() => {
		page.currentPage++
		searchPage()
	})

	onShow(() => {
		initPage()
	})
</script>

<style>
	.container {
		padding: 10px;
	}
	.filter-section {
		margin-bottom: 10px;
		background-color: #fff;
		padding: 10px;
		border-radius: 5px;
	}
	.filter-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.filter-item {
		flex: 1;
	}
	.filter-action {
		width: 60px;
		display: flex;
		justify-content: flex-end;
	}
	.add-btn {
		font-size: 16px;
		padding: 2px 8px;
		height: 30px;
		line-height: 24px;
		background-color: #007aff;
		color: #fff;
		border-radius: 4px;
	}
	.content {
		background-color: #fff;
	}
	.item {
		padding: 10px 0;
		flex: 1;
	}
	.item-left {
		flex: 1 1 0%;
		min-width: 0;
		overflow: hidden;
	}
	.footer-content-fixed {
		width: 80px;
		min-width: 80px;
		max-width: 80px;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-right: 0;
	}
	.footer-content {
		display: flex;
		justify-content: flex-end;
		padding-right: 0;
		width: 70px;
	}
	.view-password-btn {
		font-size: 12px;
		padding: 2px 8px;
		height: 28px;
		line-height: 24px;
		background-color: #007aff;
		color: #fff;
		border-radius: 4px;
		white-space: nowrap;
	}
</style> 