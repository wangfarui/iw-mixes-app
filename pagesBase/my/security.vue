<template>
    <view class="security-container">
        <!-- 密码管理 -->
        <view class="security-section">
            <view class="section-header">
                <text class="header-title">密码管理</text>
            </view>
            <view class="section-content">
                <view class="security-item" @click="handleChangePassword">
                    <text class="item-label">修改密码</text>
                    <text class="item-arrow">></text>
                </view>
                <view class="security-item">
                    <text class="item-label">密码强度</text>
                    <text class="item-value">强</text>
                </view>
            </view>
        </view>

        <!-- 手机号绑定 -->
        <view class="security-section">
            <view class="section-header">
                <text class="header-title">手机号绑定</text>
            </view>
            <view class="section-content">
                <view class="security-item" @click="handleChangePhone">
                    <text class="item-label">更换手机号</text>
                    <text class="item-arrow">></text>
                </view>
                <view class="security-item">
                    <text class="item-label">当前手机号</text>
                    <text class="item-value">{{ phoneNumber ? phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定' }}</text>
                </view>
            </view>
        </view>

        <!-- 邮箱绑定 -->
        <view class="security-section">
            <view class="section-header">
                <text class="header-title">邮箱绑定</text>
            </view>
            <view class="section-content">
                <view class="security-item" @click="handleChangeEmail">
                    <text class="item-label">更换邮箱</text>
                    <text class="item-arrow">></text>
                </view>
                <view class="security-item">
                    <text class="item-label">当前邮箱</text>
                    <text class="item-value">{{ emailAddress ? emailAddress.replace(/(.{3}).*(@.*)/, '$1****$2') : '未绑定' }}</text>
                </view>
            </view>
        </view>

        <!-- 登录安全 -->
        <view class="security-section">
            <view class="section-header">
                <text class="header-title">登录安全</text>
            </view>
            <view class="section-content">
                <view class="security-item" @click="handleDeviceManagement">
                    <text class="item-label">登录设备管理</text>
                    <text class="item-arrow">></text>
                </view>
                <view class="security-item" @click="handleLoginHistory">
                    <text class="item-label">登录记录</text>
                    <text class="item-arrow">></text>
                </view>
            </view>
        </view>

        <!-- 账号保护 -->
        <view class="security-section">
            <view class="section-header">
                <text class="header-title">账号保护</text>
            </view>
            <view class="section-content">
                <view class="security-item" @click="handleTwoFactorAuth">
                    <text class="item-label">二次验证</text>
                    <switch :checked="twoFactorEnabled" @change="toggleTwoFactor" />
                </view>
                <view class="security-item" @click="handleSecurityQuestions">
                    <text class="item-label">安全问题</text>
                    <text class="item-arrow">></text>
                </view>
                <view class="security-item delete-account" @click="handleDeleteAccount">
                    <text class="item-label">注销账号</text>
                    <text class="item-arrow">></text>
                </view>
            </view>
        </view>
    </view>

    <!-- 修改密码弹框 -->
    <uni-popup ref="passwordPopup" type="center">
        <view class="password-popup">
            <view class="popup-header">
                <text class="popup-title">修改密码</text>
                <text class="popup-close" @click="closePasswordPopup">×</text>
            </view>
            <view class="popup-content">
                <!-- 验证方式选择 -->
                <view class="verify-type">
                    <view 
                        v-for="(item, index) in verifyTypes" 
                        :key="index"
                        :class="['verify-type-item', { active: currentVerifyType === item.value }]"
                        @click="currentVerifyType = item.value"
                    >
                        {{ item.label }}
                    </view>
                </view>

                <!-- 原密码验证 -->
                <view v-if="currentVerifyType === 'password'" class="form-item">
                    <input 
                        type="password" 
                        v-model="oldPassword" 
                        placeholder="请输入原密码"
                        class="input-item"
                    />
                </view>

                <!-- 手机验证码 -->
                <view v-if="currentVerifyType === 'phone'" class="form-item">
                    <view class="code-input">
                        <input 
                            type="number" 
                            v-model="phoneCode" 
                            placeholder="请输入手机验证码"
                            class="input-item"
                        />
                        <button 
                            class="send-code-btn" 
                            :disabled="countdown > 0 || isSending"
                            @click="sendPhoneCode"
                        >
                            <text v-if="isSending">发送中...</text>
                            <text v-else-if="countdown > 0">{{ countdown }}s后重发</text>
                            <text v-else>获取验证码</text>
                        </button>
                    </view>
                </view>

                <!-- 邮箱验证码 -->
                <view v-if="currentVerifyType === 'email'" class="form-item">
                    <view class="code-input">
                        <input 
                            type="number" 
                            v-model="emailCode" 
                            placeholder="请输入邮箱验证码"
                            class="input-item"
                        />
                        <button 
                            class="send-code-btn" 
                            :disabled="countdown > 0 || isSending"
                            @click="sendEmailCode"
                        >
                            <text v-if="isSending">发送中...</text>
                            <text v-else-if="countdown > 0">{{ countdown }}s后重发</text>
                            <text v-else>获取验证码</text>
                        </button>
                    </view>
                </view>

                <!-- 新密码 -->
                <view class="form-item">
                    <input 
                        type="password" 
                        v-model="newPassword" 
                        placeholder="请输入新密码"
                        class="input-item"
                    />
                </view>
                <view class="form-item">
                    <input 
                        type="password" 
                        v-model="confirmPassword" 
                        placeholder="请确认新密码"
                        class="input-item"
                    />
                </view>

                <button class="submit-btn" @click="submitPasswordChange">确认修改</button>
            </view>
        </view>
    </uni-popup>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '@/api/request.js'

const twoFactorEnabled = ref(false)
const passwordPopup = ref(null)
const currentVerifyType = ref('password')
const oldPassword = ref('')
const phoneCode = ref('')
const emailCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const countdown = ref(0)
const isSending = ref(false)
const phoneNumber = ref('')
const emailAddress = ref('')

const verifyTypes = [
    { label: '原密码验证', value: 'password' },
    { label: '手机验证码', value: 'phone' },
    { label: '邮箱验证码', value: 'email' }
]

const handleChangePassword = () => {
    passwordPopup.value.open()
}

const closePasswordPopup = () => {
    passwordPopup.value.close()
    resetForm()
}

const resetForm = () => {
    currentVerifyType.value = 'password'
    oldPassword.value = ''
    phoneCode.value = ''
    emailCode.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    countdown.value = 0
    isSending.value = false
}

const startCountdown = () => {
    countdown.value = 60
    const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
            clearInterval(timer)
        }
    }, 1000)
}

const sendPhoneCode = async () => {
    if (isSending.value) return
    isSending.value = true
    try {
        const res = await http.get('/auth-service/user/getVerificationCode?action=1')
        if (res.code === 200) {
            uni.showToast({
                title: '验证码已发送',
                icon: 'success'
            })
        }
        startCountdown()
    } finally {
        isSending.value = false
    }
}

const sendEmailCode = async () => {
    if (isSending.value) return
    isSending.value = true
    try {
        const res = await http.get('/auth-service/user/getVerificationCode?action=4')
        if (res.code === 200) {
            uni.showToast({
                title: '验证码已发送',
                icon: 'success'
            })
        }
        startCountdown()
    } finally {
        isSending.value = false
    }
}

const submitPasswordChange = async () => {
    // 表单验证
    if (!newPassword.value) {
        uni.showToast({
            title: '请输入新密码',
            icon: 'none'
        })
        return
    }
    if (newPassword.value !== confirmPassword.value) {
        uni.showToast({
            title: '两次密码输入不一致',
            icon: 'none'
        })
        return
    }

    // 根据验证方式构建请求参数
    const params = {
        newPassword: newPassword.value
    }

    if (currentVerifyType.value === 'password') {
        if (!oldPassword.value) {
            uni.showToast({
                title: '请输入原密码',
                icon: 'none'
            })
            return
        }
        params.oldPassword = oldPassword.value
    } else if (currentVerifyType.value === 'phone') {
        if (!phoneCode.value) {
            uni.showToast({
                title: '请输入手机验证码',
                icon: 'none'
            })
            return
        }
        params.verificationCode = phoneCode.value
    } else if (currentVerifyType.value === 'email') {
        if (!emailCode.value) {
            uni.showToast({
                title: '请输入邮箱验证码',
                icon: 'none'
            })
            return
        }
        params.emailVerificationCode = emailCode.value
    }

    await http.post('/auth-service/user/editPassword', params)
    uni.showToast({
        title: '密码修改成功',
        icon: 'success'
    })
    closePasswordPopup()
}

const handleChangePhone = () => {
    // 处理更换手机号
}

const handleChangeEmail = () => {
    // 处理更换邮箱
}

const handleDeviceManagement = () => {
    // 处理设备管理
}

const handleLoginHistory = () => {
    // 处理登录记录
}

const toggleTwoFactor = (e) => {
    twoFactorEnabled.value = e.detail.value
}

const handleTwoFactorAuth = () => {
    // 处理二次验证
}

const handleSecurityQuestions = () => {
    // 处理安全问题
}

const handleDeleteAccount = () => {
    // 处理注销账号
}

// 获取用户信息
const getUserInfo = () => {
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
        phoneNumber.value = userInfo.phoneNumber || ''
        emailAddress.value = userInfo.emailAddress || ''
    }
}

// 在组件挂载时获取用户信息
onMounted(() => {
    getUserInfo()
})
</script>

<style lang="scss">
.security-container {
    padding: 20rpx;
    background-color: #f5f5f5;
    min-height: 100vh;
}

.security-section {
    background-color: #fff;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
}

.section-header {
    padding: 20rpx;
    border-bottom: 1rpx solid #eee;
}

.header-title {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
}

.section-content {
    padding: 0 20rpx;
}

.security-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #eee;

    &:last-child {
        border-bottom: none;
    }
}

.item-label {
    font-size: 28rpx;
    color: #333;
}

.item-value {
    font-size: 28rpx;
    color: #666;
}

.item-arrow {
    color: #999;
    font-size: 28rpx;
}

.delete-account {
    .item-label {
        color: #ff4d4f;
    }
}

.password-popup {
    width: 600rpx;
    background-color: #fff;
    border-radius: 12rpx;
    overflow: hidden;
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #eee;
}

.popup-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.popup-close {
    font-size: 40rpx;
    color: #999;
    padding: 0 20rpx;
}

.popup-content {
    padding: 30rpx;
}

.verify-type {
    display: flex;
    margin-bottom: 30rpx;
    border-bottom: 1rpx solid #eee;
}

.verify-type-item {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    font-size: 28rpx;
    color: #666;
    position: relative;

    &.active {
        color: #007AFF;
        &::after {
            content: '';
            position: absolute;
            bottom: -1rpx;
            left: 50%;
            transform: translateX(-50%);
            width: 40rpx;
            height: 4rpx;
            background-color: #007AFF;
        }
    }
}

.form-item {
    margin-bottom: 20rpx;
}

.input-item {
    width: 100%;
    height: 80rpx;
    border: 1rpx solid #eee;
    border-radius: 8rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
}

.code-input {
    display: flex;
    gap: 20rpx;
}

.send-code-btn {
    width: 200rpx;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 24rpx;
    color: #007AFF;
    background-color: #fff;
    border: 1rpx solid #007AFF;
    border-radius: 8rpx;
    padding: 0;

    &:disabled {
        color: #999;
        border-color: #999;
        background-color: #f5f5f5;
    }
}

.submit-btn {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    background-color: #007AFF;
    color: #fff;
    font-size: 28rpx;
    border-radius: 8rpx;
    margin-top: 30rpx;
}
</style>