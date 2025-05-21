<template>
	<view>
		<view class="profile-container">
			<view class="avatar-container">
				<image :src="userInfo.avatar" class="avatar" @tap="openPopup" />
			</view>
			<view class="user-info">
				{{ userInfo.name }}
			</view>
			<view class="logout-button-container">
				<button @click="refreshCache">刷新缓存</button>
			</view>
			<view class="logout-button-container">
				<button @click="clickLogout">退出登录</button>
			</view>
		</view>

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
		refreshDictCache
	} from "@/api/login.js";
	import { uploadFile } from "@/stores/file.js"

	const userInfo = ref({})

	onShow(() => {
		setUserInfo(uni.getStorageSync('userInfo'))
	})

	function setUserInfo(info) {
		userInfo.value = info
	}

	function handleTap() {
		// 跳转到修改头像页面
		uni.navigateTo({
			url: '/pages/my/edit-avatar'
		});
	}
	
	// 刷新缓存数据
	function refreshCache() {
		// 刷新字典缓存
		refreshDictCache()
	}

	function clickLogout() {
		uni.removeStorageSync('iwtoken')
		uni.removeStorageSync('userInfo')
		logout()
		uni.reLaunch({
			url: '/pages/login'
		});
	}

	const avatarPopup = ref(null);

	function openPopup() {
		avatarPopup.value.open();
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
				const tempFilePaths = res.tempFilePaths;
				uploadFileForAvatar(tempFilePaths[0]);
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
				const tempFilePaths = res.tempFilePaths;
				uploadFileForAvatar(tempFilePaths[0]);
			}
		})
	}

	async function uploadFileForAvatar(filePath) {
		const fileRes = await uploadFile(filePath)
		// 调用更新用户头像接口
		let avatarUrl = fileRes.fileUrl
		
		http.post('/auth-service/user/editAvatar', {
				'avatar': avatarUrl
			})
			.then(res => {
				userInfo.value.avatar = avatarUrl;
				uni.setStorageSync('userInfo', userInfo.value)
			})
	}
</script>

<style>
	.profile-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx;
	}

	.avatar-container {
		margin-bottom: 20rpx;
	}

	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		border: 2rpx solid #ccc;
	}

	.user-info {
		font-size: 18px;
		margin-bottom: 20rpx;
	}

	.logout-button-container {
		margin-top: 20rpx;
	}
</style>