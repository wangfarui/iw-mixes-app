// export const baseUrl = 'http://localhost:18000'
export const baseUrl = 'https://api.itwray.com'

export const token_key = 'iwtoken'

export const getTokenValue = () => {
	return uni.getStorageSync(token_key)
}

export const tokenHeader = () => {
	return {
		'iwtoken': getTokenValue()
	}
}