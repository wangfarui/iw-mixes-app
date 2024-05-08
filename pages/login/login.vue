<template>
	<view>
		<uni-forms ref="valiForm" :modelValue="loginForm">
			<uni-forms-item label="用户名" required name="username">
				<uni-easyinput v-model="loginForm.username" placeholder="请输入用户名" />
			</uni-forms-item>
			<uni-forms-item label="密码" required name="password">
				<uni-easyinput type="password" v-model="loginForm.password" placeholder="请输入密码" />
			</uni-forms-item>
			<uni-forms-item label="" name="isRemeber">
				<checkbox-group @change='isRemeberChange'>
					<label>
						<checkbox value="isRemeber" :checked="loginForm.isRemeber" />记住账号密码
					</label>
				</checkbox-group>
			</uni-forms-item>
		</uni-forms>
		<button type="primary" @click="loginFun('valiForm')">登录</button>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue';
	import http from '@/api/request.js'
	import {
		useLoginStore
	} from "@/stores/login.js";
	import {
		onLoad
	} from '@dcloudio/uni-app'


	const loginStore = useLoginStore()

	const loginForm = reactive({
		username: '',
		password: '',
		isRemeber: true
	})

	onLoad(() => {
		loginForm.username = loginStore.loginForm.username
		loginForm.password = loginStore.loginForm.password
		loginForm.isRemeber = loginStore.loginForm.isRemeber
	})

	function isRemeberChange(e) {
		const values = e.detail.value
		if (values.includes('isRemeber')) {
			console.log('remeber true');
			loginForm.isRemeber = true
		} else {
			loginForm.isRemeber = false
		}
	}

	function loginFun() {
		if (loginForm.username == undefined || loginForm.username == '') {
			uni.showToast({
				icon: 'error',
				title: `用户名不能为空`
			})
			return
		}

		if (loginForm.password == undefined || loginForm.password == '') {
			uni.showToast({
				icon: 'error',
				title: `密码不能为空`
			})
			return
		}

		uni.showLoading({
			title: '登录中'
		});

		http.post('/login/doLogin', loginForm)
			.then(res => {
				const userInfo = res.data
				uni.setStorageSync('iwtoken', userInfo.tokenValue)

				if (loginForm.isRemeber) {
					console.log('保存');
					loginStore.saveAccount(loginForm)
				} else {
					loginStore.clearAccount()
				}

				uni.switchTab({
					url: '/pages/meal/meal'
				})
			})
			.finally(() => {
				uni.hideLoading();
			})
	}
</script>

<style>

</style>