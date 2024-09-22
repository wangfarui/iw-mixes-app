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
		refreshDictCache
	} from "@/api/login.js";

	onLaunch(() => {
		// 确保 pinia 挂载之后再调用 API
		nextTick(() => {
			// 加载字典缓存
			refreshDictCache()
		})

	})
</script>

<style>
	/*每个页面公共css */
	@import './style/iconfont.css';
</style>