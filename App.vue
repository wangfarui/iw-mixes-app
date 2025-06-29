<template>
	<RouterView />
</template>

<script setup>
	import {
		onMounted,
		nextTick
	} from 'vue';
	import { RouterView } from 'vue-router'
	import {
		onLaunch
	} from '@dcloudio/uni-app'

	import http from '@/api/request.js'

	import {
		refreshDictCache,
		startVersionPolling
	} from "@/api/login.js";

	onLaunch(() => {
		// 确保 pinia 挂载之后再调用 API
		nextTick(() => {
			// 检查用户是否已登录
			const token = uni.getStorageSync('iwtoken')
			const userInfo = uni.getStorageSync('userInfo')
			
			if (token && userInfo) {
				// 用户已登录，启动版本号轮询
				startVersionPolling()
			}
			
			// 加载字典缓存
			refreshDictCache()
		})

	})
</script>

<style>
	/*每个页面公共css */
	@import './style/iconfont.css';
</style>