import {
    baseUrl,
    tokenHeader
} from '@/api/env.js'

export const uploadFile = (filePath) => {
    return new Promise((resolve, reject) => {
        uni.uploadFile({
            url: baseUrl + '/auth-service/file/upload',
            filePath: filePath,
            name: 'file', // 文件参数名，根据你的接口设置
            header: {
                'Content-Type': 'multipart/form-data',
                ...tokenHeader()
            },
            success: (uploadFileRes) => {
                if (uploadFileRes.statusCode !== 200 || JSON.parse(uploadFileRes.data).code !== 200) {
                    uni.showToast({
                        icon: 'error',
                        title: `上传失败`
                    })
                    reject(new Error('上传失败'))
                }
                
                resolve(JSON.parse(uploadFileRes.data).data);
            },
            fail: (err) => {
                console.error('上传失败', err);
                // 处理上传失败的逻辑
                reject(err);
            }
        })
    })
}