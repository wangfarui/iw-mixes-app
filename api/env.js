export const baseUrl = 'http://localhost:18003/iw-eat'
// export const baseUrl = 'https://api.itwray.com/iw-eat'

export const token_key = 'iwtoken'

export const getTokenValue = () => {
	return uni.getStorageSync(token_key)
}

export const tokenHeader = () => {
	return {'iwtoken': getTokenValue()}
}
