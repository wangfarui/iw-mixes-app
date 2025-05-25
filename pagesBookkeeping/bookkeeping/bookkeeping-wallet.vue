<template>
    <view class="wallet-container">
        <view class="balance-card">
            <text class="balance-label">钱包余额</text>
            <text class="balance-value">¥ {{ walletBalance }}</text>
            <view class="update-btn" @click="showUpdateDialog">修改余额</view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '@/api/request.js'

const walletBalance = ref('0.00')
const newBalance = ref('')

const getWalletBalance = async () => {
    try {
        const res = await http.get('/bookkeeping-service/bookkeeping/wallet/balance')
        if (res.data) {
            walletBalance.value = res.data.walletBalance
        }
    } catch (error) {
        console.error('获取钱包余额失败：', error)
    }
}

const showUpdateDialog = () => {
    uni.showModal({
        title: '修改余额',
        editable: true,
        placeholderText: '请输入新的余额',
        success: async (res) => {
            if (res.confirm && res.content) {
                try {
                    await http.put('/bookkeeping-service/bookkeeping/wallet/updateBalance', {
                        walletBalance: res.content
                    })
                    uni.showToast({
                        title: '更新成功',
                        icon: 'success'
                    })
                    // 更新成功后重新获取余额
                    await getWalletBalance()
                } catch (error) {
                    console.error('更新余额失败：', error)
                    uni.showToast({
                        title: '更新失败',
                        icon: 'error'
                    })
                }
            }
        }
    })
}

onMounted(() => {
    getWalletBalance()
})
</script>

<style lang="scss">
.wallet-container {
    padding: 20px;
    
    .balance-card {
        background-color: #ffffff;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        
        .balance-label {
            font-size: 16px;
            color: #666;
            display: block;
            margin-bottom: 10px;
        }
        
        .balance-value {
            font-size: 32px;
            color: #333;
            font-weight: bold;
            display: block;
            margin-bottom: 20px;
        }

        .update-btn {
            width: 100%;
            height: 45px;
            background-color: #007AFF;
            color: #ffffff;
            border-radius: 8px;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            &:active {
                opacity: 0.8;
            }
        }
    }
}
</style>