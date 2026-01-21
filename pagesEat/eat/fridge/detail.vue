<!-- 食材详情/编辑页面 -->
<template>
  <view class="detail-page">
    <!-- 表单内容 -->
    <scroll-view class="form-scroll" :scroll-y="true">
      <view class="form-content">
        <!-- 食材名称 -->
        <view class="form-item name-form-item">
          <text class="label">食材名称</text>
          <view class="name-input-group">
            <view class="emoji-btn" @click="showEmojiPicker">
              <text class="emoji-display">{{ formData.emoji }}</text>
            </view>
            <uni-easyinput
              v-model="formData.name"
              type="text"
              placeholder="请输入食材名称"
              class="name-input"
            />
          </view>
        </view>

        <!-- 食材分类 -->
        <view class="form-item">
          <text class="label">分类</text>
          <uni-data-select
            v-model="formData.category"
            :localdata="dictStore.getDictDataWithDataSelectCode(dictStore.dictTypeEnum.EAT_FRIDGE_CATEGORY)"
            placeholder="请选择分类"
            :clear="true"
          />
        </view>

        <!-- 冰箱分区 -->
        <view class="form-item">
          <text class="label">分区</text>
          <uni-data-select
            v-model="formData.section"
            :localdata="dictStore.getDictDataWithDataSelectCode(dictStore.dictTypeEnum.EAT_FRIDGE_SECTION)"
            placeholder="请选择分区"
            :clear="true"
          />
        </view>

        <!-- 数量 -->
        <view class="form-item">
          <text class="label">数量</text>
          <uni-easyinput
            v-model="formData.quantity"
            type="text"
            placeholder="例：500g / 3个 / 1盒"
            class="quantity-input"
          />
        </view>

        <!-- 入库日期 -->
        <view class="form-item">
          <text class="label">入库日期</text>
          <uni-datetime-picker type="date" :clear-icon="true" v-model="formData.addDate" placeholder="选择入库日期"/>
        </view>

        <!-- 过期日期 -->
        <view class="form-item">
          <text class="label">过期日期</text>
          <uni-datetime-picker
            v-model="formData.expireDate"
            type="date"
            placeholder="选择过期日期"
          />
        </view>

        <view style="height: 100rpx;"></view>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-buttons">
      <view class="btn-group">
        <view class="btn cancel-btn" @click="goBack">
          <text>取消</text>
        </view>
        <view class="btn save-btn" @click="saveFood">
          <text>{{ isEdit ? '保存' : '新增' }}</text>
        </view>
      </view>
    </view>

    <!-- 表情选择弹出框 -->
    <uni-popup ref="emojiPopup" type="bottom">
      <view class="emoji-picker-modal">
        <view class="modal-header">
          <text class="modal-title">选择图标</text>
          <view class="close-btn" @click="closeEmojiPicker">
            <uni-icons type="closeempty" size="24" color="#666"></uni-icons>
          </view>
        </view>
        <view class="modal-content">
          <view class="emoji-grid">
            <view
              v-for="emoji in emojiList"
              :key="emoji"
              class="emoji-item"
              :class="{ selected: formData.emoji === emoji }"
              @click="selectEmoji(emoji)"
            >
              {{ emoji }}
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import http from '@/api/request.js'
import { useDictStore } from '@/stores/dict.ts'

const dictStore = useDictStore()

const isEdit = ref(false)
const foodId = ref(null)
const emojiPopup = ref(null)
const isSaving = ref(false)

const formData = ref({
  name: '',
  emoji: '🍎',
  category: '',
  section: '',
  quantity: '',
  addDate: new Date().toISOString().split('T')[0],
  expireDate: ''
})


const emojiList = ['🍎', '🍌', '🍇', '🍓', '🍑', '🥬', '🌽', '🌶', '🍅', '🥔', '🥚', '🥩', '🥟', '🥙', '🍞','🐖', '🐔', '🐂', '🦆', '🐟', '🥛', '🥤', '🍦', '🍻', '🧂']

// 事件处理
const showEmojiPicker = () => {
  emojiPopup.value.open()
}

const closeEmojiPicker = () => {
  emojiPopup.value.close()
}

const selectEmoji = (emoji) => {
  formData.value.emoji = emoji
  emojiPopup.value.close()
}

// 验证表单 - 只需验证食材名称
const validateForm = () => {
  if (!formData.value.name.trim()) {
    uni.showToast({
      title: '请输入食材名称',
      icon: 'none'
    })
    return false
  }
  return true
}

// 保存食材
const saveFood = async () => {
  if (!validateForm()) return

  if (isSaving.value) return
  isSaving.value = true

  try {
    // 准备请求数据，移除空值
    const requestData = {
      name: formData.value.name,
      emoji: formData.value.emoji || undefined,
      category: formData.value.category ? parseInt(formData.value.category) : undefined,
      section: formData.value.section ? parseInt(formData.value.section) : undefined,
      quantity: formData.value.quantity || undefined,
      addDate: formData.value.addDate || undefined,
      expireDate: formData.value.expireDate || undefined
    }

    // 如果是编辑模式，需要添加 id
    if (isEdit.value) {
      requestData.id = foodId.value
    }

    // 移除 undefined 的字段
    Object.keys(requestData).forEach(key =>
      requestData[key] === undefined && delete requestData[key]
    )

    // 根据编辑/新增模式选择不同的接口和方法
    let response
    if (isEdit.value) {
      // 编辑模式：PUT 请求到 /update
      response = await http.put('/eat-service/fridge/food/update', requestData)
    } else {
      // 新增模式：POST 请求到 /add
      response = await http.post('/eat-service/fridge/food/add', requestData)
    }

    if (response.code === 200) {
      uni.showToast({
        title: isEdit.value ? '保存成功' : '新增成功',
        icon: 'success'
      })

      setTimeout(() => {
        uni.navigateBack()
      }, 500)
    } else {
      uni.showToast({
        title: response.message || (isEdit.value ? '保存失败' : '新增失败'),
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('保存食材失败:', error)
    uni.showToast({
      title: isEdit.value ? '保存失败，请稍后重试' : '新增失败，请稍后重试',
      icon: 'none'
    })
  } finally {
    isSaving.value = false
  }
}

// 获取食材详情
const fetchFoodDetail = async (id) => {
  try {
    const response = await http.get(`/eat-service/fridge/food/detail?id=${id}`)

    if (response.code === 200) {
      const detail = response.data
      // 填充表单数据
      formData.value = {
        name: detail.name || '',
        emoji: detail.emoji || '🍎',
        category: detail.category || '',
        section: detail.section || '',
        quantity: detail.quantity || '',
        addDate: detail.addDate || new Date().toISOString().split('T')[0],
        expireDate: detail.expireDate || ''
      }
      console.log('获取食材详情成功:', detail)
    } else {
      uni.showToast({
        title: response.message || '获取详情失败',
        icon: 'none'
      })
      // 获取失败后返回
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    console.error('获取食材详情失败:', error)
    uni.showToast({
      title: '获取详情失败，请稍后重试',
      icon: 'none'
    })
    // 获取失败后返回
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
}

const goBack = () => {
  uni.navigateBack()
}

onLoad((option) => {
  if (option && option.id) {
    isEdit.value = true
    foodId.value = option.id
    console.log('获取到食材 ID:', option.id)
    // 编辑模式下，获取食材详情
    fetchFoodDetail(option.id)
  } else {
    isEdit.value = false
    console.log('新增食材模式')
  }
})
</script>

<style lang="scss" scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f9fa;
}

// ============ 表单内容 ============
.form-scroll {
  flex: 1;
  overflow-y: auto;
}

.form-content {
  padding: 24rpx 32rpx;
  background: white;

  .form-item {
    margin-bottom: 32rpx;

    &.name-form-item {
      .label {
        display: block;
        font-size: 24rpx;
        color: #666;
        margin-bottom: 8rpx;
        font-weight: 500;
      }

      .name-input-group {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .emoji-btn {
          flex-shrink: 0;
          width: 56rpx;
          height: 56rpx;
          background: #f8f9fa;
          border: 1rpx solid #e0e0e0;
          border-radius: 8rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;

          &:active {
            background: #f0f0f0;
            border-color: #007aff;
          }

          .emoji-display {
            font-size: 28rpx;
          }
        }

        .name-input {
          flex: 1;
          font-size: 26rpx !important;
          height: 56rpx !important;
        }
      }
    }

    .label {
      display: block;
      font-size: 24rpx;
      color: #666;
      margin-bottom: 8rpx;
      font-weight: 500;
    }

    .input-field {
      width: 100%;
      padding: 12rpx 16rpx;
      border: 1rpx solid #e0e0e0;
      border-radius: 8rpx;
      font-size: 26rpx;
      background: #f8f9fa;
      box-sizing: border-box;
      height: 48rpx;

      &:focus {
        border-color: #007aff;
        background: white;
      }
    }

    .quantity-input {
      font-size: 26rpx !important;
      height: 48rpx !important;
    }

    .picker-field {
      width: 100%;
      padding: 12rpx 16rpx;
      border: 1rpx solid #e0e0e0;
      border-radius: 8rpx;
      font-size: 26rpx;
      background: #f8f9fa;
      color: #333;
      height: 48rpx;
    }
  }
}

// ============ 底部按钮 ============
.bottom-buttons {
  background: white;
  padding: 20rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;

  .btn-group {
    display: flex;
    gap: 12rpx;

    .btn {
      flex: 1;
      padding: 24rpx;
      border-radius: 12rpx;
      text-align: center;
      font-size: 28rpx;
      font-weight: 500;
      transition: all 0.3s;

      text {
        color: inherit;
      }

      &.cancel-btn {
        background: #f0f0f0;
        color: #666;

        &:active {
          opacity: 0.8;
        }
      }

      &.save-btn {
        background: #007aff;
        color: white;

        &:active {
          opacity: 0.9;
        }
      }
    }
  }
}

// ============ 表情选择弹出框 ============
.emoji-picker-modal {
  background: white;
  border-radius: 24rpx 24rpx 0 0;
  padding: 0;

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 32rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .modal-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      width: 40rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .modal-content {
    padding: 24rpx 32rpx 40rpx;
    max-height: 60vh;
    overflow-y: auto;

    .emoji-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12rpx;

      .emoji-item {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        border: 2rpx solid #e0e0e0;
        border-radius: 8rpx;
        background: white;
        transition: all 0.3s;

        &.selected {
          border-color: #007aff;
          background: #f0f8ff;
          transform: scale(1.1);
        }

        &:active {
          opacity: 0.8;
        }
      }
    }
  }
}
</style>

