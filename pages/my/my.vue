<template>
	<view class="my-container">
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="user-info">
				<image :src="userInfo.avatar" class="avatar" @tap="openPopup" />
				<view class="user-detail">
					<text class="username">{{ userInfo.name }}</text>
					<text class="user-id">ID: {{ userInfo.userId || '--' }}</text>
				</view>
			</view>
		</view>

		<!-- 功能列表 -->
		<view class="function-list">
			<!-- 个人信息 -->
			<view class="function-group">
				<view class="function-item" @tap="navigateTo('/pagesBase/my/profile')">
					<view class="function-item-left">
						<uni-icons type="person" size="24" color="#666"></uni-icons>
						<text>个人信息</text>
					</view>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
				
				<view class="function-item" @tap="navigateTo('/pagesBase/my/security')">
					<view class="function-item-left">
						<uni-icons type="locked" size="24" color="#666"></uni-icons>
						<text>账号安全</text>
					</view>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
			</view>

			<!-- 系统设置 -->
			<view class="function-group">
				<view class="function-item" @tap="navigateTo('/pagesBase/my/settings')">
					<view class="function-item-left">
						<uni-icons type="gear" size="24" color="#666"></uni-icons>
						<text>系统设置</text>
					</view>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>

				<view class="function-item" @tap="refreshCache">
					<view class="function-item-left">
						<uni-icons type="refresh" size="24" color="#666"></uni-icons>
						<text>刷新缓存</text>
					</view>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
			</view>

			<!-- 其他功能 -->
			<view class="function-group">
				<view class="function-item" @tap="navigateTo('/pagesBase/my/about')">
					<view class="function-item-left">
						<uni-icons type="info" size="24" color="#666"></uni-icons>
						<text>关于我们</text>
					</view>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>

				<view class="function-item" @tap="navigateTo('/pagesBase/my/feedback')">
					<view class="function-item-left">
						<uni-icons type="chat" size="24" color="#666"></uni-icons>
						<text>意见反馈</text>
					</view>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 退出登录按钮 -->
		<view class="logout-section">
			<button class="logout-button" @click="clickLogout">退出登录</button>
		</view>

		<!-- 头像选择弹窗 -->
		<uni-popup ref="avatarPopup" type="bottom" :animation="true">
			<view class="popup-content">
				<button class="popup-button" @click="takePhoto">拍照</button>
				<button class="popup-button" @click="chooseFromAlbum">从相册选择</button>
				<button class="popup-button cancel" @click="closePopup">取消</button>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'

	import {
		onShow
	} from '@dcloudio/uni-app'

	import http from '@/api/request.js'
	import {
		logout,
		refreshDictCache,
		stopVersionPolling
	} from "@/api/login.js";
	import { uploadFile } from "@/stores/file.js"

	const userInfo = ref({})
	const avatarPopup = ref(null)

	onShow(() => {
		setUserInfo(uni.getStorageSync('userInfo'))
	})

	function setUserInfo(info) {
		userInfo.value = info
	}

	function navigateTo(url) {
		uni.navigateTo({ url })
	}

	function refreshCache() {
		uni.showLoading({ title: '刷新中...' })
		refreshDictCache()
		uni.hideLoading()
		uni.showToast({ title: '刷新成功', icon: 'success' })
	}

	function clickLogout() {
		uni.showModal({
			title: '提示',
			content: '确定要退出登录吗？',
			success: (res) => {
				if (res.confirm) {
					stopVersionPolling()
					
					logout()
					uni.removeStorageSync('iwtoken')
					uni.removeStorageSync('userInfo')
					uni.reLaunch({
						url: '/pages/login'
					})
				}
			}
		})
	}

	function openPopup() {
		avatarPopup.value.open()
	}

	function closePopup() {
		avatarPopup.value.close()
	}

	function takePhoto() {
		closePopup()
		uni.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['camera'],
			success: (res) => {
				const tempFilePaths = res.tempFilePaths
				uploadFileForAvatar(tempFilePaths[0])
			}
		})
	}

	function chooseFromAlbum() {
		closePopup()
		uni.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album'],
			success: (res) => {
				const tempFilePaths = res.tempFilePaths
				uploadFileForAvatar(tempFilePaths[0])
			}
		})
	}

	async function uploadFileForAvatar(filePath) {
		uni.showLoading({ title: '上传中...' })
		try {
			const fileRes = await uploadFile(filePath)
			const avatarUrl = fileRes.fileUrl
			
			await http.post('/auth-service/user/editAvatar', {
				'avatar': avatarUrl
			})
			
			userInfo.value.avatar = avatarUrl
			uni.setStorageSync('userInfo', userInfo.value)
			uni.showToast({ title: '更新成功', icon: 'success' })
		} catch (error) {
			uni.showToast({ title: '更新失败', icon: 'error' })
		} finally {
			uni.hideLoading()
		}
	}
</script>

<style>
	.my-container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 40rpx;
	}

	.user-card {
		background-color: #ffffff;
		padding: 40rpx 30rpx;
		margin-bottom: 20rpx;
	}

	.user-info {
		display: flex;
		align-items: center;
	}

	.avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 60rpx;
		border: 2rpx solid #eee;
	}

	.user-detail {
		margin-left: 30rpx;
	}

	.username {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
		display: block;
	}

	.user-id {
		font-size: 24rpx;
		color: #999;
	}

	.function-list {
		padding: 0 20rpx;
	}

	.function-group {
		background-color: #ffffff;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
	}

	.function-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 20rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.function-item:last-child {
		border-bottom: none;
	}

	.function-item-left {
		display: flex;
		align-items: center;
	}

	.function-item-left text {
		margin-left: 20rpx;
		font-size: 28rpx;
		color: #333;
	}

	.logout-section {
		padding: 40rpx 20rpx;
	}

	.logout-button {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		background-color: #ffffff;
		color: #ff4d4f;
		font-size: 32rpx;
		border-radius: 12rpx;
	}

	.popup-content {
		background-color: #ffffff;
		border-radius: 24rpx 24rpx 0 0;
		padding: 20rpx;
	}

	.popup-button {
		height: 100rpx;
		line-height: 100rpx;
		text-align: center;
		font-size: 32rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.popup-button.cancel {
		color: #999;
		margin-top: 20rpx;
		border-bottom: none;
	}
</style>