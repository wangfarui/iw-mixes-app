import http from '@/api/request.js'
import {
	useDictStore
} from "@/stores/dict.ts";

// 账号密码登录
export const loginByPasswordApi = (loginForm) => {
    return http.post('/auth-service/login/password', loginForm);
}

// 验证码登录
export const loginByVerificationCodeApi = (loginForm) => {
    return http.post('/auth-service/login/verificationCode', loginForm);
}

// 账号注册并登录
export const registerAndLoginApi = (loginForm) => {
    return http.post('/auth-service/register/form', loginForm);
}

// 注册获取手机验证码
export const getPhoneVerificationCodeApi = (phoneNumber) => {
    return http.get('/auth-service/register/getPhoneVerificationCode?phoneNumber=' + phoneNumber);
}

// 注册获取邮箱验证码
export const getEmailVerificationCodeApi = (emailAddress) => {
    return http.get('/auth-service/register/getEmailVerificationCode?emailAddress=' + emailAddress);
}

// 用户根据操作行为获取验证码（例如验证码登录）
export const getVerificationCodeByActionApi = (action) => {
    return http.get('/auth-service/user/getVerificationCode?action=' + action);
}

// 修改密码
export const editPasswordApi = (passwordEditDto) => {
    return http.post('/auth-service/user/editPassword', passwordEditDto);
}

// 查询字典类型集合
export const getDictTypeList = () => {
	return http.get('/auth-service/dict/getDictTypeList');
}

// 查询所有数据字典集合
export const getAllDictList = () => {
	return http.get('/auth-service/dict/getAllDictList');
}

// 刷新字典缓存
export const refreshDictCache = () => {
	const dictStore = useDictStore()
	
	// 加载字典类型
	getDictTypeList().then(res => {
		dictStore.setDictTypeArray(res.data)
	})

	// 加载所有数据字典
	getAllDictList().then(res => {
		dictStore.setDictDataArrayMap(res.data)
	})
}

// 获取字典版本号
export const getDictVersionApi = () => {
	return http.get('/auth-service/dict/version');
}

// 全局轮询管理
let versionPollingTimer = null // 轮询定时器
let currentDictVersion = null // 当前字典版本号

/**
 * 启动版本号轮询
 */
export function startVersionPolling() {
	// 清除可能存在的旧定时器
	if (versionPollingTimer) {
		clearInterval(versionPollingTimer)
	}
	
	// 立即执行一次版本号检查
	checkDictVersion()
	
	// 设置30分钟轮询间隔 (30 * 60 * 1000 = 1800000毫秒)
	versionPollingTimer = setInterval(() => {
		checkDictVersion()
	}, 1800000)
}

/**
 * 检查字典版本号
 */
async function checkDictVersion() {
	try {
		const res = await getDictVersionApi()
		const newVersion = res.data
		
		// 如果是第一次获取版本号，直接保存
		if (currentDictVersion === null) {
			currentDictVersion = newVersion
			return
		}
		
		// 如果版本号发生变化，刷新字典缓存
		if (currentDictVersion !== newVersion) {
			currentDictVersion = newVersion
			refreshDictCache()
		}
	} catch (error) {
		// 静默处理错误，不输出日志
	}
}

/**
 * 停止版本号轮询
 */
export function stopVersionPolling() {
	if (versionPollingTimer) {
		clearInterval(versionPollingTimer)
		versionPollingTimer = null
	}
	currentDictVersion = null
}

// 退出登录
export const logout = () => {
	return http.get('/auth-service/login/logout')
}