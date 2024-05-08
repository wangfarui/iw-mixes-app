<template>
	<view>
		<button @click="logout">退出登录</button>
	</view>
</template>

<script setup>
	
	function logout() {
		uni.removeStorageSync('iwtoken')
		uni.reLaunch({
			url: '/pages/login/login'
		});
	}
</script>

<style>
	       
</style>
