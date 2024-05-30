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
				<button @click="logout">退出登录</button>
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

	import {
		baseUrl,
		tokenHeader
	} from '@/api/env.js'
	import http from '@/api/request.js'

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

	function logout() {
		uni.removeStorageSync('iwtoken')
		uni.removeStorageSync('userInfo')
		uni.reLaunch({
			url: '/pages/login/login'
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
				uploadFile(tempFilePaths[0]);
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
				uploadFile(tempFilePaths[0]);
			}
		})
	}

	function uploadFile(filePath) {
		uni.uploadFile({
			url: baseUrl + '/file/upload',
			filePath: filePath,
			name: 'file', // 文件参数名，根据你的接口设置
			header: {
				'Content-Type': 'multipart/form-data',
				...tokenHeader()
			},
			success: (uploadFileRes) => {
				console.log('上传成功', uploadFileRes);
				if (uploadFileRes.statusCode !== 200 || JSON.parse(uploadFileRes.data).code !== 200) {
					uni.showToast({
						icon: 'error',
						title: `上传失败`
					})
				} else {
					// 调用更新用户头像接口
					let avatarUrl = JSON.parse(uploadFileRes.data).data.fileUrl
					http.post('/user/editAvatar', {
							'avatar': avatarUrl
						})
						.then(res => {
							userInfo.value.avatar = avatarUrl;
							uni.setStorageSync('userInfo', userInfo.value)
						})
				}
			},
			fail: (err) => {
				console.error('上传失败', err);
				// 处理上传失败的逻辑
			}
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