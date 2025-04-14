<template>
	<view class="login-container">
		<view class="logo">IW服务平台</view>
		<uni-forms ref="valiForm" :modelValue="loginForm">
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
						<button :disabled="isCountingDown" @click="getVerificationCode()"
							style="border-radius: 10px;font-size: 14px;height: 30px;line-height: 30px;color: #606266;">
							{{ isCountingDown ? `${count}s重试` : "获取验证码" }}
						</button>
					</template>
				</uni-easyinput>
			</uni-forms-item>
			<uni-forms-item v-if="loginWay == '3'" name="password">
				<uni-easyinput type="password" prefixIcon="locked" v-model="loginForm.password" placeholder="请输入密码" />
			</uni-forms-item>
		</uni-forms>
		<button type="primary" @click="loginFun('valiForm')">{{loginWay == '3' ? '注册/登录' : '登录'}}</button>
		<view style="font-size: 14px; color: #606266; margin-top: 10px">
			<uni-row>
				<uni-col v-if="loginWay == '1'" :span="12">
					<view @click="clickLoginWay(2)">验证码登录</view>
				</uni-col>
				<uni-col v-if="loginWay != '1'" :span="12">
					<view @click="clickLoginWay(1)">账号登录</view>
				</uni-col>
				<uni-col v-if="loginWay == '3'" :span="12">
					<view @click="clickLoginWay(2)" style="text-align: end">验证码登录</view>
				</uni-col>
				<uni-col v-if="loginWay != '3'" :span="12">
					<view @click="clickLoginWay(3)" style="text-align: end">注册账号</view>
				</uni-col>
			</uni-row>
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
	function getVerificationCode() {
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
		getVerificationCodeApi(loginForm.account).then(res => {
			uni.showToast({
				icon: 'success',
				title: `验证码已发送`
			})
			startCountdown();
		})
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
		if (loginWay.value === '1') {
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
		const userInfo = res.data
		uni.setStorageSync('iwtoken', userInfo.tokenValue)
		uni.setStorageSync('userInfo', userInfo)
		
		// 3. 加载字典缓存
		refreshDictCache()
		
		uni.switchTab({
			url: '/pages/bill/index'
		})
	}
</script>

<style>
	@import "@/static/iconfont.css";

	.login-container {
		position: absolute;
		top: 40%;
		left: 50%;
		transform: translate(-50%, -50%);
		/* 使容器垂直居中 */
		width: 100%;
		max-width: 400px;
		/* 控制登录表单的最大宽度 */
		padding: 20px;
		box-sizing: border-box;
	}

	.logo {
		font-size: 24px;
		font-weight: bold;
		color: #333;
		/* 文字颜色，可以根据需要调整 */
		margin-bottom: 20px;
		/* Logo和表单之间的距离 */
		text-align: center;
	}
</style>