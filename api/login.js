import http from '@/api/request.js'
import {
	useDictStore
} from "@/stores/dict.ts";
const dictStore = useDictStore()

// 登录
export const login = (user) => {
	return http.post('/auth-service/login/password', user);
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
	// 加载字典类型
	getDictTypeList().then(data => {
		dictStore.setDictTypeArray(data.data)
	})

	// 加载所有数据字典
	getAllDictList().then(data => {
		dictStore.setDictDataArrayMap(data.data)
	})
}

// 退出登录
export const logout = () => {
	return http.get('/api/logout')
}