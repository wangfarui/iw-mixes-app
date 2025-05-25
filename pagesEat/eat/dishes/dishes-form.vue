<!-- 菜品添加 -->
<template>
  <view class="dishes-form">
    <form @submit="submitForm">
      <!-- 基本信息 -->
      <view class="form-item">
        <text class="label">菜品名称</text>
        <input v-model="formData.name" placeholder="请输入菜品名称" class="input" />
      </view>
      
      <view class="form-item">
        <text class="label">菜品封面</text>
        <view class="cover-uploader" @tap="chooseCoverImage">
          <image v-if="formData.coverImage" :src="formData.coverImage" mode="aspectFill" class="cover-image" />
          <view v-else class="cover-uploader-icon">
            <text class="iconfont icon-add">+</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">菜品分类</text>
        <uni-data-select
          v-model="formData.category"
          :localdata="dictStore.getDictDataWithDataSelectCode(dictStore.dictTypeEnum.EAT_DISHES_TYPE)"
          placeholder="请选择菜品分类"
        />
      </view>

      <view class="form-item">
        <text class="label">难度系数</text>
        <view class="difficulty-rating">
          <view 
            v-for="i in 8" 
            :key="i" 
            class="star"
            :class="{ active: i <= formData.difficulty }"
            @tap="formData.difficulty = i"
          >
            ★
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">预计用时</text>
        <view class="input-group">
          <input 
            type="number" 
            v-model="formData.estimatedTime" 
            class="input number-input" 
          />
          <text class="unit">分钟</text>
        </view>
      </view>

      <view class="form-item">
        <text class="label">菜品价格</text>
        <view class="input-group">
          <input 
            type="digit" 
            v-model="formData.price" 
            class="input number-input" 
          />
          <text class="unit">元</text>
        </view>
      </view>

      <view class="form-item">
        <text class="label">备注</text>
        <textarea 
          v-model="formData.remark" 
          placeholder="请输入备注信息" 
          class="textarea"
        />
      </view>

      <!-- 食材列表 -->
      <view class="form-item">
        <text class="label">食材列表</text>
        <view class="ingredients-list">
          <view v-for="(item, index) in formData.ingredients" :key="index" class="ingredient-item">
            <view class="ingredient-row">
              <input 
                v-model="item.name" 
                placeholder="食材名称" 
                class="input ingredient-input"
              />
              <input 
                v-model="item.amount" 
                placeholder="用量" 
                class="input ingredient-input"
              />
              <input 
                type="digit" 
                :value="item.price === 0 ? '' : item.price"
                @input="e => item.price = e.detail.value ? Number(e.detail.value) : 0"
                placeholder="价格" 
                class="input ingredient-input"
              />
              <view class="checkbox-group">
                <checkbox 
                  :checked="item.needToBuy" 
                  @tap="item.needToBuy = !item.needToBuy"
                />
                <text>需要购买</text>
              </view>
              <view class="button-group">
                <button 
                  type="warn" 
                  size="mini" 
                  @tap="removeIngredient(index)"
                >删除</button>
                <view class="move-buttons">
                  <button 
                    type="default" 
                    size="mini" 
                    :disabled="index === 0"
                    @tap="moveIngredient(index, 'up')"
                  >上移</button>
                  <button 
                    type="default" 
                    size="mini" 
                    :disabled="index === formData.ingredients.length - 1"
                    @tap="moveIngredient(index, 'down')"
                  >下移</button>
                </view>
              </view>
            </view>
          </view>
          <button type="default" class="add-button" @tap="addIngredient">添加食材</button>
        </view>
      </view>

      <!-- 制作步骤 -->
      <view class="form-item">
        <text class="label">制作步骤</text>
        <view class="steps-list">
          <view v-for="(item, index) in formData.steps" :key="index" class="step-item">
            <view class="step-row">
              <view class="step-image-uploader" @tap="chooseStepImage(index)">
                <image 
                  v-if="item.image" 
                  :src="item.image" 
                  mode="aspectFill" 
                  class="step-image" 
                />
                <view v-else class="step-uploader-icon">
                  <text class="iconfont icon-add">+</text>
                </view>
              </view>
              <textarea 
                v-model="item.description" 
                placeholder="请输入步骤说明" 
                class="textarea step-textarea"
              />
              <view class="button-group">
                <button 
                  type="warn" 
                  size="mini" 
                  @tap="removeStep(index)"
                >删除</button>
                <view class="move-buttons">
                  <button 
                    type="default" 
                    size="mini" 
                    :disabled="index === 0"
                    @tap="moveStep(index, 'up')"
                  >上移</button>
                  <button 
                    type="default" 
                    size="mini" 
                    :disabled="index === formData.steps.length - 1"
                    @tap="moveStep(index, 'down')"
                  >下移</button>
                </view>
              </view>
            </view>
          </view>
          <button type="default" class="add-button" @tap="addStep">添加步骤</button>
        </view>
      </view>

      <view class="form-buttons">
        <button type="primary" form-type="submit">保存</button>
      </view>
    </form>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { uploadFile } from '@/stores/file.js'
import { useDictStore } from "@/stores/dict.ts";
import http from '@/api/request.js'
import { onLoad } from '@dcloudio/uni-app'

const dictStore = useDictStore()

const formData = reactive({
  id: '',
  name: '',
  coverImage: '',
  category: '',
  difficulty: '',
  estimatedTime: '',
  price: '',
  remark: '',
  ingredients: [],
  steps: []
})

// 页面加载
onLoad((options) => {
  if (options.id) {
    // 编辑模式，获取菜品详情
    getDishDetail(options.id)
  }
})

// 获取菜品详情
const getDishDetail = async (id) => {
  try {
    const res = await http.get(`/bookkeeping-service/eat/dishes/detail?id=${id}`)
    const detail = res.data
    
    // 填充表单数据
    formData.id = detail.id
    formData.name = detail.dishesName
    formData.coverImage = detail.dishesImage
    formData.category = detail.dishesType
    formData.difficulty = detail.difficultyFactor
    formData.estimatedTime = detail.useTime
    formData.price = detail.prices
    formData.remark = detail.remark
    
    // 填充食材列表
    formData.ingredients = detail.dishesMaterialList.map(item => ({
      name: item.materialName,
      amount: item.materialDosage,
      price: item.materialPrice,
      needToBuy: item.isPurchase === 1
    }))
    
    // 填充步骤列表
    formData.steps = detail.dishesCreationMethodList.map(item => ({
      image: item.stepImage,
      description: item.stepContent
    }))
  } catch (error) {
    uni.showToast({
      title: '获取菜品详情失败',
      icon: 'none'
    })
  }
}

// 食材相关方法
const addIngredient = () => {
  formData.ingredients.push({
    name: '',
    amount: '',
    price: 0,
    needToBuy: false
  })
}

const removeIngredient = (index) => {
  formData.ingredients.splice(index, 1)
}

const moveIngredient = (index, direction) => {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  const temp = formData.ingredients[index]
  formData.ingredients[index] = formData.ingredients[newIndex]
  formData.ingredients[newIndex] = temp
}

// 步骤相关方法
const addStep = () => {
  formData.steps.push({
    image: '',
    description: ''
  })
}

const removeStep = (index) => {
  formData.steps.splice(index, 1)
}

const moveStep = (index, direction) => {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  const temp = formData.steps[index]
  formData.steps[index] = formData.steps[newIndex]
  formData.steps[newIndex] = temp
}

// 图片上传相关方法
const chooseCoverImage = async () => {
    const res = await uni.chooseImage({
      count: 1
    })
    const fileRes = await uploadFile(res.tempFilePaths[0])
    formData.coverImage = fileRes.fileUrl
}

const chooseStepImage = async (index) => {
    const res = await uni.chooseImage({
        count: 1
    })
    const fileRes = await uploadFile(res.tempFilePaths[0])
    formData.steps[index].image = fileRes.fileUrl
}

// 表单提交
const submitForm = async () => {
  // 表单验证
  if (!formData.name) {
    uni.showToast({
      title: '请输入菜品名称',
      icon: 'none'
    })
    return
  }
  if (!formData.category) {
    uni.showToast({
      title: '请选择菜品分类',
      icon: 'none'
    })
    return
  }
  
  // 构建请求数据
  const requestData = {
    dishesName: formData.name,
    dishesImage: formData.coverImage,
    dishesType: formData.category,
    difficultyFactor: formData.difficulty || 0,
    useTime: formData.estimatedTime || 0,
    prices: formData.price || 0,
    remark: formData.remark,
    dishesMaterialList: formData.ingredients.map(item => ({
      materialName: item.name,
      materialDosage: item.amount,
      materialPrice: item.price || 0,
      isPurchase: item.needToBuy ? 1 : 0
    })),
    dishesCreationMethodList: formData.steps.map(item => ({
      stepImage: item.image,
      stepContent: item.description
    }))
  }

  try {
    if (formData.id) {
      // 编辑模式
      requestData.id = formData.id
      await http.put('/bookkeeping-service/eat/dishes/update', requestData)
    } else {
      // 新增模式
      await http.post('/bookkeeping-service/eat/dishes/add', requestData)
    }
    
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
    // 保存成功后返回上一页
    uni.navigateBack()
  } catch (error) {
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  }
}
</script>

<style lang="scss">
.dishes-form {
  padding: 20px;

  .form-item {
    margin-bottom: 20px;

    .label {
      display: block;
      margin-bottom: 10px;
      font-size: 28rpx;
      color: #333;
    }

    .input {
      width: 100%;
      height: 80rpx;
      padding: 0 20rpx;
      border: 1px solid #dcdfe6;
      border-radius: 4rpx;
      font-size: 28rpx;
    }

    .input-group {
      display: flex;
      align-items: center;
      gap: 10rpx;

      .number-input {
        width: 200rpx;
      }

      .unit {
        color: #666;
        white-space: nowrap;
      }
    }

    .textarea {
      width: 100%;
      height: 200rpx;
      padding: 20rpx;
      border: 1px solid #dcdfe6;
      border-radius: 4rpx;
      font-size: 28rpx;
    }
  }

  .cover-uploader {
    width: 100%;
    height: 400rpx;
    border: 1px dashed #d9d9d9;
    border-radius: 8rpx;
    overflow: hidden;

    .cover-image {
      width: 100%;
      height: 100%;
    }

    .cover-uploader-icon {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 60rpx;
      color: #8c939d;
    }
  }

  .difficulty-rating {
    display: flex;
    gap: 10rpx;

    .star {
      font-size: 40rpx;
      color: #dcdfe6;
      cursor: pointer;

      &.active {
        color: #f7ba2a;
      }
    }
  }

  .ingredients-list,
  .steps-list {
    .ingredient-item,
    .step-item {
      margin-bottom: 20rpx;
      padding: 20rpx;
      border: 1px solid #ebeef5;
      border-radius: 8rpx;

      .ingredient-row,
      .step-row {
        display: flex;
        flex-wrap: wrap;
        gap: 20rpx;
        align-items: flex-start;
      }

      .ingredient-input {
        flex: 1;
        min-width: 200rpx;
      }

      .checkbox-group {
        display: flex;
        align-items: center;
        gap: 10rpx;
      }

      .button-group {
        display: flex;
        gap: 10rpx;
        align-items: center;
      }
    }
  }

  .step-image-uploader {
    width: 100%;
    height: 300rpx;
    border: 1px dashed #d9d9d9;
    border-radius: 8rpx;
    overflow: hidden;
    margin-bottom: 20rpx;

    .step-image {
      width: 100%;
      height: 100%;
    }

    .step-uploader-icon {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 60rpx;
      color: #8c939d;
    }
  }

  .step-textarea {
    flex: 1;
    min-width: 400rpx;
  }

  .form-buttons {
    margin-top: 40rpx;
    display: flex;
    gap: 20rpx;

    button {
      flex: 1;
    }
  }

  .add-button {
    background-color: #f5f7fa;
    color: #409eff;
    border: 1px solid #dcdfe6;
    margin-top: 20rpx;
    
    &:active {
      background-color: #ecf5ff;
    }
  }
}
</style>