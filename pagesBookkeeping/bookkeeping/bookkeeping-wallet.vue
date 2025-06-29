<template>
    <view class="wallet-container">
        <!-- 钱包信息卡片 -->
        <view class="wallet-card">
            <view class="amount-section">
                <view class="amount-item">
                    <text class="amount-label">钱包余额</text>
                    <text class="amount-value">¥ {{ walletInfo.walletBalance || '0.00' }}</text>
                    <view class="update-btn" @click="showUpdateDialog(1)">修改</view>
                </view>
                <view class="divider"></view>
                <view class="amount-item">
                    <text class="amount-label">钱包资产</text>
                    <text class="amount-value">¥ {{ walletInfo.walletAssets || '0.00' }}</text>
                    <view class="update-btn" @click="showUpdateDialog(2)">修改</view>
                </view>
            </view>
        </view>

        <!-- 变动记录列表 -->
        <view class="records-section">
            <view class="type-tabs">
                <view 
                    class="tab-item" 
                    :class="{ active: currentType === 1 }"
                    @click="switchType(1)"
                >余额记录</view>
                <view 
                    class="tab-item" 
                    :class="{ active: currentType === 2 }"
                    @click="switchType(2)"
                >资产记录</view>
            </view>
            
            <view class="records-list-wrapper">
                <scroll-view 
                    scroll-y 
                    class="records-list"
                    @scrolltolower="loadMore"
                    :scroll-top="scrollTop"
                    :style="{ height: 'calc(100vh - 280px)' }"
                    :lower-threshold="50"
                >
                    <view 
                        v-for="(item, index) in records" 
                        :key="index"
                        class="record-item"
                    >
                        <view class="record-info">
                            <text class="change-amount" :class="{ 'increase': item.changeAmount > 0 }">
                                {{ item.changeAmount > 0 ? '+' : '' }}{{ item.changeAmount }}
                            </text>
                            <text class="time">{{ formatTime(item.createTime) }}</text>
                        </view>
                        <view class="amount-info">
                            <text class="before">变动前: {{ item.beforeAmount }}</text>
                            <text class="after">变动后: {{ item.afterAmount }}</text>
                        </view>
                    </view>
                    
                    <view v-if="loading" class="loading">加载中...</view>
                    <view v-if="!hasMore && records.length > 0" class="no-more">没有更多数据了</view>
                    <view v-if="!loading && records.length === 0" class="empty">暂无记录</view>
                </scroll-view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '@/api/request.js'

// 钱包信息
const walletInfo = ref({
    walletBalance: '0.00',
    walletAssets: '0.00'
})

// 记录列表相关
const records = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const hasMore = ref(true)
const currentType = ref(1) // 1: 余额记录, 2: 资产记录
const scrollTop = ref(0)

// 获取钱包详情
const getWalletDetail = async () => {
    try {
        const res = await http.get('/bookkeeping-service/bookkeeping/wallet/detail')
        if (res.data) {
            walletInfo.value = res.data
        }
    } catch (error) {
        console.error('获取钱包详情失败：', error)
    }
}

// 获取记录列表
const getRecords = async () => {
    if (loading.value || !hasMore.value) {
        return
    }
    
    loading.value = true
    try {
        const res = await http.post('/bookkeeping-service/bookkeeping/wallet/records/page', {
            changeType: currentType.value,
            currentPage: currentPage.value,
            pageSize: pageSize.value
        })
        
        if (res.data) {
            const { records: newRecords, total: totalCount } = res.data
            records.value = [...records.value, ...newRecords]
            total.value = totalCount
            hasMore.value = records.value.length < totalCount
        }
    } catch (error) {
        console.error('获取记录失败：', error)
    } finally {
        loading.value = false
    }
}

// 切换记录类型
const switchType = (type) => {
    if (currentType.value === type) return
    currentType.value = type
    resetRecords()
    scrollTop.value = 0 // 重置滚动位置
    getRecords()
}

// 重置记录列表
const resetRecords = () => {
    records.value = []
    currentPage.value = 1
    total.value = 0
    hasMore.value = true
}

// 加载更多
const loadMore = () => {
    if (hasMore.value && !loading.value) {
        currentPage.value++
        getRecords()
    }
}

// 格式化时间
const formatTime = (timeStr) => {
    if (!timeStr) return ''
    // 将日期字符串转换为 iOS 支持的格式
    const formattedStr = timeStr.replace(' ', 'T')
    const date = new Date(formattedStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 显示修改弹框
const showUpdateDialog = (type) => {
    const title = type === 1 ? '修改余额' : '修改资产'
    const currentAmount = type === 1 ? walletInfo.value.walletBalance : walletInfo.value.walletAssets
    
    uni.showActionSheet({
        itemList: ['直接修改金额', '输入变动金额'],
        success: (res) => {
            if (res.tapIndex === 0) {
                // 直接修改金额
                uni.showModal({
                    title,
                    editable: true,
                    placeholderText: '请输入新的金额',
                    success: async (res) => {
                        if (res.confirm && res.content) {
                            const amount = parseFloat(res.content)
                            if (isNaN(amount) || amount < 0 || amount > 99999999 || !/^\d+(\.\d{0,2})?$/.test(res.content)) {
                                uni.showToast({
                                    title: '请输入正确的金额（最多8位整数，2位小数）',
                                    icon: 'none'
                                })
                                return
                            }
                            
                            try {
                                await http.put('/bookkeeping-service/bookkeeping/wallet/updateAmount', {
                                    changeType: type,
                                    updateAmount: amount
                                })
                                uni.showToast({
                                    title: '更新成功',
                                    icon: 'success'
                                })
                                await getWalletDetail()
                                resetRecords()
                                getRecords()
                            } catch (error) {
                                console.error('更新失败：', error)
                                uni.showToast({
                                    title: '更新失败',
                                    icon: 'error'
                                })
                            }
                        }
                    }
                })
            } else {
                // 输入变动金额
                uni.showModal({
                    title: '输入变动金额',
                    editable: true,
                    placeholderText: '请输入变动金额',
                    success: async (res) => {
                        if (res.confirm && res.content) {
                            const changeAmount = parseFloat(res.content)
                            if (isNaN(changeAmount) || !/^-?\d+(\.\d{0,2})?$/.test(res.content)) {
                                uni.showToast({
                                    title: '请输入正确的变动金额（最多8位整数，2位小数）',
                                    icon: 'none'
                                })
                                return
                            }
                            
                            // 计算变动后的金额
                            const newAmount = parseFloat(currentAmount) + changeAmount
                            if (newAmount < 0 || newAmount > 99999999) {
                                uni.showToast({
                                    title: '变动后的金额超出范围',
                                    icon: 'none'
                                })
                                return
                            }
                            
                            try {
                                await http.put('/bookkeeping-service/bookkeeping/wallet/updateAmount', {
                                    changeType: type,
                                    updateAmount: newAmount
                                })
                                uni.showToast({
                                    title: '更新成功',
                                    icon: 'success'
                                })
                                await getWalletDetail()
                                resetRecords()
                                getRecords()
                            } catch (error) {
                                console.error('更新失败：', error)
                                uni.showToast({
                                    title: '更新失败',
                                    icon: 'error'
                                })
                            }
                        }
                    }
                })
            }
        }
    })
}

onMounted(() => {
    getWalletDetail()
    getRecords()
})
</script>

<style lang="scss">
.wallet-container {
    padding: 20px;
    min-height: 100vh;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    
    .wallet-card {
        background-color: #ffffff;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
        flex-shrink: 0;
        
        .amount-section {
            display: flex;
            align-items: center;
            
            .amount-item {
                flex: 1;
                text-align: center;
                
                .amount-label {
                    font-size: 14px;
                    color: #666;
                    display: block;
                    margin-bottom: 8px;
                }
                
                .amount-value {
                    font-size: 24px;
                    color: #333;
                    font-weight: bold;
                    display: block;
                    margin-bottom: 12px;
                }
                
                .update-btn {
                    display: inline-block;
                    padding: 4px 16px;
                    background-color: #f5f5f5;
                    color: #666;
                    border-radius: 12px;
                    font-size: 12px;
                    border: 1px solid #ddd;
                    
                    &:active {
                        background-color: #e8e8e8;
                    }
                }
            }
            
            .divider {
                width: 1px;
                height: 40px;
                background-color: #eee;
                margin: 0 20px;
            }
        }
    }
    
    .records-section {
        background-color: #ffffff;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        
        .type-tabs {
            display: flex;
            background-color: #f5f5f5;
            border-radius: 8px;
            padding: 4px;
            flex-shrink: 0;
            
            .tab-item {
                flex: 1;
                text-align: center;
                padding: 8px 0;
                font-size: 14px;
                color: #666;
                position: relative;
                border-radius: 6px;
                transition: all 0.3s;
                
                &.active {
                    color: #007AFF;
                    background-color: #ffffff;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }
            }
        }
        
        .records-list-wrapper {
            flex: 1;
            min-height: 0;
            position: relative;
            
            .records-list {
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                
                .record-item {
                    padding: 15px 0;
                    border-bottom: 1px solid #eee;
                    
                    &:last-child {
                        border-bottom: none;
                    }
                    
                    .record-info {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                        
                        .change-amount {
                            font-size: 16px;
                            font-weight: bold;
                            color: #ff4d4f;
                            
                            &.increase {
                                color: #52c41a;
                            }
                        }
                        
                        .time {
                            font-size: 12px;
                            color: #999;
                        }
                    }
                    
                    .amount-info {
                        display: flex;
                        justify-content: space-between;
                        font-size: 12px;
                        color: #666;
                    }
                }
                
                .loading, .no-more, .empty {
                    text-align: center;
                    padding: 20px 0;
                    color: #999;
                    font-size: 14px;
                }
            }
        }
    }
}
</style>