<template>
	<view class="page-container">
		<view class="login-container">
			<view class="logo">IW服务平台</view>
			<uni-forms ref="valiForm" :modelValue="loginForm" class="login-form">
				<uni-forms-item name="account">
					<uni-easyinput prefixIcon="person" v-model="loginForm.account" maxlength="11"
						:placeholder="loginWay == '1' ? '请输入用户名或手机号' : '请输入手机号'" />
				</uni-forms-item>
				<uni-forms-item v-if="loginWay == '1'" name="password">
					<uni-easyinput type="password" prefixIcon="locked" v-model="loginForm.password" placeholder="请输入密码" />
				</uni-forms-item>
				<uni-forms-item v-if="loginWay != '1'" name="verificationCode">
					<uni-easyinput v-model="loginForm.verificationCode" placeholder="请输入验证码" maxlength="6">
						<template #left>
							<uni-icons custom-prefix="iconfont" type="icon-yanzhengma" size="24" color="#cccccc"
								style="padding-left: 3px;"></uni-icons>
						</template>
						<template #right>
							<button :disabled="isCountingDown || isGettingCode" @click="getVerificationCode()"
								class="verification-btn" :class="{'verification-btn--loading': isGettingCode}">
								<template v-if="isGettingCode">
									<view class="loading-icon"></view>
									<text>获取中</text>
								</template>
								<template v-else>
									{{ isCountingDown ? `${count}s重试` : "获取验证码" }}
								</template>
							</button>
						</template>
					</uni-easyinput>
				</uni-forms-item>
				<uni-forms-item v-if="loginWay == '3'" name="password">
					<uni-easyinput type="password" prefixIcon="locked" v-model="loginForm.password" placeholder="请输入密码" />
				</uni-forms-item>
			</uni-forms>
			<button type="primary" class="login-btn" @click="loginFun('valiForm')">{{loginWay == '3' ? '注册/登录' : '登录'}}</button>
			<view class="login-options">
				<uni-row>
					<uni-col v-if="loginWay == '1'" :span="12">
						<view class="option-item" @click="clickLoginWay(2)">验证码登录</view>
					</uni-col>
					<uni-col v-if="loginWay != '1'" :span="12">
						<view class="option-item" @click="clickLoginWay(1)">账号登录</view>
					</uni-col>
					<uni-col v-if="loginWay == '3'" :span="12">
						<view class="option-item right" @click="clickLoginWay(2)">验证码登录</view>
					</uni-col>
					<uni-col v-if="loginWay != '3'" :span="12">
						<view class="option-item right" @click="clickLoginWay(3)">注册账号</view>
					</uni-col>
				</uni-row>
			</view>
		</view>

		<!-- 自定义加载提示 -->
		<view class="custom-loading" v-if="showLoading">
			<view class="loading-content">
				<view class="loading-text">首次登录，正在加载资源...</view>
				<view class="progress-bar">
					<view class="progress-inner" :style="{ width: loadingProgress + '%' }"></view>
				</view>
				<view class="progress-text">{{loadingProgress}}%</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted
	} from 'vue';

	import {
		loginByPasswordApi,
		loginByVerificationCodeApi,
		registerAndLoginApi,
		refreshDictCache,
		getVerificationCodeApi,
		getVerificationCodeByActionApi
	} from "@/api/login.js";

	import {
		useDictStore
	} from "@/stores/dict.ts";

	const dictStore = useDictStore()

	const loginForm = reactive({
		account: '',
		phoneNumber: '',
		password: '',
		verificationCode: ''
	})

	const loginWay = ref('1') // 登录方式 1密码登录 2验证码登录 3注册账号
	const isCountingDown = ref(false) // 标记是否处于倒计时状态
	const count = ref(60) // 初始倒计时时间
	const showLoading = ref(false)
	const loadingProgress = ref(0)
	const isGettingCode = ref(false) // 是否正在获取验证码

	// 从本地存储获取保存的账号密码
	onMounted(() => {
		const savedUsername = uni.getStorageSync('savedUsername')
		const savedPassword = uni.getStorageSync('savedPassword')
		if (savedUsername && savedPassword) {
			loginForm.account = savedUsername
			loginForm.password = savedPassword
		}
	})

	// 检查账号密码是否与保存的一致
	function checkSavedCredentials() {
		const savedUsername = uni.getStorageSync('savedUsername')
		const savedPassword = uni.getStorageSync('savedPassword')
		return savedUsername === loginForm.account && savedPassword === loginForm.password
	}

	// 保存账号密码到本地存储
	function saveCredentials() {
		uni.setStorageSync('savedUsername', loginForm.account)
		uni.setStorageSync('savedPassword', loginForm.password)
	}

	// 清除保存的账号密码
	function clearSavedCredentials() {
		uni.removeStorageSync('savedUsername')
		uni.removeStorageSync('savedPassword')
	}

	/**
	 * 切换登录方式
	 */
	function clickLoginWay(way) {
		loginWay.value = way
	}

	// 获取验证码
	async function getVerificationCode() {
		if (loginForm.account == '') {
			uni.showToast({
				icon: 'error',
				title: `请输入手机号`
			})
			return
		}
		if (isValidPhoneNumber(loginForm.account) === false) {
			uni.showToast({
				icon: 'error',
				title: `手机号格式错误`
			})
			return
		}
		
		try {
			isGettingCode.value = true
			await getVerificationCodeApi(loginForm.account)
			uni.showToast({
				icon: 'success',
				title: `验证码已发送`
			})
			startCountdown()
		} catch (error) {
			uni.showToast({
				icon: 'error',
				title: `获取验证码失败`
			})
		} finally {
			isGettingCode.value = false
		}
	}

	function isValidPhoneNumber(phone) {
		const regex = /^1[3-9]\d{9}$/;
		return regex.test(phone);
	}

	function startCountdown() {
		if (isCountingDown.value) return; // 如果已经在倒计时中，直接返回
		isCountingDown.value = true; // 标记开始倒计时

		// 倒计时逻辑
		const timer = setInterval(() => {
			count.value -= 1;
			if (count.value <= 0) {
				clearInterval(timer); // 清除定时器
				isCountingDown.value = false; // 恢复按钮状态
				count.value = 60; // 重置倒计时时间
			}
		}, 1000); // 每隔1秒执行一次
	}

	async function loginFun() {
		uni.showLoading({
			title: '登录中'
		});
		if (loginWay.value == '1') {
			// 检查是否与保存的账号密码一致
			if (!checkSavedCredentials()) {
				// 如果不一致，弹出提示框
				uni.showModal({
					title: '提示',
					content: '是否记住账号密码？',
					success: (res) => {
						if (res.confirm) {
							// 用户点击确定，保存账号密码
							saveCredentials()
						}
						// 无论用户点击确定还是取消，都继续登录流程
						doLogin()
					}
				})
			} else {
				// 如果一致，直接登录
				doLogin()
			}
		} else if (loginWay.value == '2') {
			loginForm.phoneNumber = loginForm.account
			loginByVerificationCodeApi(loginForm).then(res => {
				loginSuccessAfter(res)
			}).catch(err => {
				setTimeout(() => {
					uni.hideLoading();
				}, 1500);
			}).finally(() => {
				if (uni.getStorageSync('loading')) {
					uni.hideLoading();
				}
			})
		} else if (loginWay.value == '3') {
			loginForm.phoneNumber = loginForm.account
			registerAndLoginApi(loginForm).then(res => {
				loginSuccessAfter(res)
			}).catch(err => {
				setTimeout(() => {
					uni.hideLoading();
				}, 1500);
			}).finally(() => {
				if (uni.getStorageSync('loading')) {
					uni.hideLoading();
				}
			})
		} else {
			uni.hideLoading();
			uni.showToast({
				icon: 'error',
				title: `无法识别的操作`
			})
		}
	}

	function doLogin() {
		loginByPasswordApi(loginForm).then(res => {
				loginSuccessAfter(res)
			}).catch(err => {
				setTimeout(() => {
					uni.hideLoading();
				}, 1500);
			}).finally(() => {
				if (uni.getStorageSync('loading')) {
					uni.hideLoading();
				}
			})
	}

	function loginSuccessAfter(res) {
		uni.hideLoading();
		const userInfo = res.data
		uni.setStorageSync('iwtoken', userInfo.tokenValue)
		uni.setStorageSync('userInfo', userInfo)
		
		if (userInfo.newUser) {
			// 显示自定义加载提示
			showLoading.value = true;
			loadingProgress.value = 0;
			
			// 创建进度条
			const timer = setInterval(() => {
				loadingProgress.value += 1;
				
				if (loadingProgress.value >= 100) {
					clearInterval(timer);
					showLoading.value = false;
					// 加载字典缓存
					refreshDictCache();
					// 跳转到首页
					uni.switchTab({
						url: '/pages/home/index'
					});
				}
			}, 50); // 5秒内完成100次更新，每次间隔50ms
		} else {
			// 非新用户直接加载字典缓存并跳转
			refreshDictCache();
			uni.switchTab({
				url: '/pages/home/index'
			});
		}
	}
</script>

<style>
	@import "@/static/iconfont.css";

	.page-container {
		min-height: 100vh;
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 20px;
	}

	.login-container {
		width: 100%;
		max-width: 400px;
		margin-top: 15vh;
		box-sizing: border-box;
	}

	.logo {
		font-size: 32px;
		font-weight: bold;
		color: #333;
		margin-bottom: 40px;
		text-align: center;
	}

	.login-form {
		background-color: #fff;
		border-radius: 16px;
		padding: 25px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		width: 100%;
	}

	/* 自定义输入框样式 */
	:deep(.uni-easyinput__content) {
		min-height: 48px !important;
		height: 48px !important;
	}

	:deep(.uni-easyinput__content-input) {
		height: 48px !important;
		font-size: 16px !important;
	}

	:deep(.uni-icons) {
		font-size: 20px !important;
	}

	:deep(.uni-easyinput__placeholder-class) {
		font-size: 16px !important;
	}

	.verification-btn {
		border-radius: 10px;
		font-size: 14px;
		height: 36px;
		line-height: 36px;
		color: #007AFF;
		background: none;
		border: none;
		padding: 0 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 80px;
		transition: all 0.3s ease;
	}

	.verification-btn:disabled {
		color: #999;
		opacity: 0.7;
	}

	.verification-btn--loading {
		opacity: 0.7;
	}

	.loading-icon {
		width: 14px;
		height: 14px;
		border: 2px solid #007AFF;
		border-radius: 50%;
		border-top-color: transparent;
		margin-right: 4px;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.login-btn {
		margin-top: 30px;
		height: 48px;
		line-height: 48px;
		border-radius: 24px;
		font-size: 16px;
		font-weight: 500;
		background: linear-gradient(to right, #007AFF, #0056b3);
		border: none;
		width: 100%;
		box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
	}

	.login-options {
		margin-top: 20px;
		font-size: 14px;
		color: #606266;
		width: 100%;
	}

	.option-item {
		padding: 8px 0;
		color: #007AFF;
		font-weight: 500;
	}

	.option-item.right {
		text-align: right;
	}

	/* 自定义加载提示样式 */
	.custom-loading {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
	}

	.loading-content {
		background-color: #ffffff;
		border-radius: 16px;
		padding: 25px;
		width: 85%;
		max-width: 320px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
	}

	.loading-text {
		font-size: 16px;
		color: #333;
		text-align: center;
		margin-bottom: 20px;
		font-weight: 500;
	}

	.progress-bar {
		height: 8px;
		background-color: #f0f0f0;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 10px;
	}

	.progress-inner {
		height: 100%;
		background: linear-gradient(to right, #007AFF, #0056b3);
		border-radius: 4px;
		transition: width 0.05s linear;
	}

	.progress-text {
		font-size: 14px;
		color: #666;
		text-align: center;
		font-weight: 500;
	}
</style>