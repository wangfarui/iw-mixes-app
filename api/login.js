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

// 退出登录
export const logout = () => {
	return http.get('/auth-service/login/logout')
}