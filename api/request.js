// const baseUrl = 'http://localhost:18003/iw-eat'
const baseUrl = 'https://api.itwray.com/iw-eat'

const token_key = 'iwtoken'

const http = (url, method, data) => {
	const iwtoken = uni.getStorageSync(token_key)
	if (!iwtoken && !url.includes('login')) {
		uni.reLaunch({
			url: '/pages/login/login'
		});
		return
	}
	return new Promise((resolve, reject) => {
		uni.request({
			url: baseUrl + url,
			method: method,
			data: data,
			header: {
				'iwtoken': iwtoken
			},
			success: (res) => {
				const result = res.data;
				if (result == undefined) {
					uni.showToast({
						icon: 'exception',
						title: '数据加载异常'
					});
					return
				}
				if (result.code == 401) {
					uni.removeStorageSync(token_key)
					uni.reLaunch({
						url: '/pages/login/login'
					});
					return
				}
				if (result.code != 200) {
					uni.showToast({
						icon: 'none',
						title: result.message
					});
					return
				}
				resolve(result);
			},
			fail: (res) => {
				reject(res);
			}
		});
	});
};

class Request {
	async get(url) {
		try {
			const response = await http(url, 'get', {});
			return response;
		} catch (error) {
			throw error;
		}
	}
	
	async delete(url) {
		try {
			const response = await http(url, 'delete', {});
			return response;
		} catch (error) {
			throw error;
		}
	}

	async post(url, data) {
		try {
			const response = await http(url, 'post', data);
			return response;
		} catch (error) {
			throw error;
		}
	}
}

export default new Request();