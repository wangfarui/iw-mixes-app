<template>
  <view class="budget-container">
    <view class="budget-type-selector" @click="showBudgetTypePopup">
      {{ budgetTypeText }} ▼
    </view>
    
    <!-- 总预算展示区域 -->
    <view class="total-budget" v-if="totalBudget">
      <view class="budget-actions">
        <text class="edit-btn" @click="showBudgetActions" v-if="totalBudget.budgetAmount > 0">编辑</text>
      </view>
      <view class="budget-chart" v-if="totalBudget.budgetAmount > 0">
        <view class="budget-content">
          <view class="chart-container">
            <l-echart ref="chartRef"></l-echart>
          </view>
          <view class="budget-info">
            <view class="info-item">
              <text class="label">剩余预算：</text>
              <text :class="['value', totalBudget.remainingAmount < 0 ? 'negative' : '']">{{ formatAmount(totalBudget.remainingAmount) }}</text>
            </view>
            <view class="info-item">
              <text class="label">{{ budgetType === 1 ? '本月支出：' : '年度支出：' }}</text>
              <text class="value">{{ formatAmount(totalBudget.usedAmount) }}</text>
            </view>
            <view class="info-item">
              <text class="label">{{ budgetType === 1 ? '本月预算：' : '年度预算：' }}</text>
              <text class="value">{{ formatAmount(totalBudget.budgetAmount) }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="no-budget" v-else>
        <text>暂无预算</text>
        <button class="add-budget-btn" @click="addBudget">添加总预算</button>
      </view>
    </view>

    <!-- 分类预算列表 -->
    <view class="category-budget-list">
      <view class="category-header">分类预算</view>
      <view class="category-item" 
        v-for="(item, index) in categoryBudgets" 
        :key="index"
        @longpress="showCategoryBudgetActions(item)"
        @click="navigateToRecords(item)"
      >
        <view class="category-info">
          <text class="category-name">{{ dictStore.getDictNameByCode(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TYPE, item.recordType) }}</text>
          <text class="category-amount">{{ formatAmount(item.usedAmount) }} / {{ formatAmount(item.budgetAmount) }}</text>
        </view>
        <view class="progress-bar-container">
          <view class="progress-bar">
            <view 
              class="progress-bar-inner" 
              :style="{ width: calculateProgress(item.usedAmount, item.budgetAmount) + '%', backgroundColor: getProgressColor(item.usedAmount, item.budgetAmount) }"
            ></view>
          </view>
          <text class="progress-text">{{ calculateProgress(item.usedAmount, item.budgetAmount) }}%</text>
        </view>
      </view>
      <view class="no-category-budget" v-if="!categoryBudgets.length">
        <text>暂无分类预算</text>
      </view>
	  <view>
		<button class="add-budget-btn" @click="addCategoryBudget">添加分类预算</button>
	  </view>
    </view>

    <!-- 预算类型选择弹窗 -->
    <uni-popup :ref="el => budgetTypePopup = el" type="top">
      <view class="popup-content">
        <view class="popup-item" @click="selectBudgetType(1)">月预算</view>
        <view class="popup-item" @click="selectBudgetType(2)">年预算</view>
      </view>
    </uni-popup>

    <!-- 添加预算弹窗 -->
    <uni-popup :ref="el => addBudgetPopup = el" type="center">
      <view class="add-budget-popup">
        <view class="popup-header">
          {{ isAddingCategory ? '添加分类预算' : '添加总预算' }}
        </view>
        <view class="popup-content">
          <view class="form-item" v-if="isAddingCategory">
            <view class="label">记录分类:</view>
            <uni-data-select
              v-model="budgetForm.recordType"
              :localdata="dictStore.getDictDataWithDataSelectCode(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TYPE)"
            ></uni-data-select>
          </view>
          <view class="form-item">
            <view class="label">预算金额:</view>
            <input 
              type="digit" 
              v-model="budgetForm.budgetAmount"
              placeholder="请输入预算金额"
              class="input"
            >
          </view>
        </view>
        <view class="popup-footer">
          <button class="btn cancel" @click="closeAddBudgetPopup">取消</button>
          <button class="btn confirm" @click="saveBudget">确认</button>
        </view>
      </view>
    </uni-popup>

    <!-- 底部操作菜单 -->
    <uni-popup :ref="el => budgetActionsPopup = el" type="bottom">
      <view class="actions-popup">
        <view class="action-item" @click="editBudget">
          <text>编辑预算</text>
        </view>
        <view class="action-item delete" @click="deleteBudget">
          <text>删除预算</text>
        </view>
        <view class="action-item cancel" @click="closeBudgetActions">
          <text>取消</text>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import http from '@/api/request.js'
import { useDictStore } from '@/stores/dict'
import { ref, computed, watch } from 'vue'
import { onShow, onReady } from '@dcloudio/uni-app'

const dictStore = useDictStore()

const echarts = require('../../uni_modules/lime-echart/static/echarts.min');

// 组件引用
const budgetTypePopup = ref(null)
const addBudgetPopup = ref(null)
const budgetActionsPopup = ref(null)
const chartRef = ref(null)

// 数据定义
const budgetType = ref(1) // 1: 月预算, 2: 年预算
const totalBudget = ref(null)
const categoryBudgets = ref([])
const isAddingCategory = ref(false)
const isEditing = ref(false)
const budgetForm = ref({
  recordType: null,
  budgetAmount: ''
})
const currentBudget = ref(null)
const isCategoryBudget = ref(false)

// 图表数据
const myChart = ref(null)

function renderChart() {
  if (!totalBudget.value || !totalBudget.value.budgetAmount || totalBudget.value.budgetAmount <= 0) {
    return;
  }

  const usedAmount = Number(totalBudget.value.usedAmount) || 0;
  const remainingAmount = Number(totalBudget.value.remainingAmount) || 0;
  
  const option = {
    legend: {
      orient: 'vertical',
      left: 'left',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 10
      }
    },
    series: [{
      type: 'pie',
      data: [
        {
          name: '已使用',
          value: usedAmount,
          itemStyle: {
            color: '#FFD700'
          }
        },
        {
          name: '剩余',
          value: remainingAmount,
          itemStyle: {
            color: '#91d5ff'
          }
        }
      ],
      radius: ['0%', '40%'],
      label: {
        position: 'inside',
        formatter: '{b}\n{d}%',
        fontSize: 10,
        lineHeight: 12
      }
    }]
  };

  if (chartRef.value) {
    chartRef.value.setOption(option, true);
  }
}

// 监控预算数据变化
watch(() => totalBudget.value, (newVal) => {
  if (myChart.value && newVal && newVal.budgetAmount > 0) {
    renderChart();
  }
}, { deep: true });

onReady(() => {
  setTimeout(() => {
    if (chartRef.value) {
      chartRef.value.init(echarts, chart => {
        myChart.value = chart;
        if (totalBudget.value && totalBudget.value.budgetAmount > 0) {
          renderChart();
        }
      });
    }
  }, 300);
});

// 计算属性
const budgetTypeText = computed(() => {
  return budgetType.value === 1 ? '月预算' : '年预算'
})

// 方法定义
const fetchBudgetData = async () => {
  try {
    // 获取总预算
    const totalRes = await http.get(
      `/bookkeeping-service/bookkeeping/budget/totalBudget?budgetType=${budgetType.value}`
    )
    totalBudget.value = totalRes.data

    // 获取分类预算
    const categoryRes = await http.get(
      `/bookkeeping-service/bookkeeping/budget/categoryBudget?budgetType=${getCategoryBudgetType()}`
    )
    categoryBudgets.value = categoryRes.data

    // 数据加载完成后重新渲染图表
    if (myChart.value) {
      renderChart();
    }
  } catch (error) {
    uni.showToast({
      title: '获取预算数据失败',
      icon: 'none'
    })
  }
}

const getCategoryBudgetType = () => {
  // 月预算时返回11，年预算时返回21
  return budgetType.value === 1 ? 11 : 21
}

const showBudgetTypePopup = () => {
  budgetTypePopup.value.open()
}

const selectBudgetType = async (type) => {
  budgetType.value = type
  budgetTypePopup.value.close()
  await fetchBudgetData()
  if (chartRef.value) {
    chartRef.value.init(echarts, chart => {
      myChart.value = chart;
      renderChart();
    });
  }
}

const addBudget = () => {
  isAddingCategory.value = false
  isEditing.value = false
  resetBudgetForm()
  addBudgetPopup.value.open()
}

const addCategoryBudget = () => {
  isAddingCategory.value = true
  isEditing.value = false
  resetBudgetForm()
  addBudgetPopup.value.open()
}

const closeAddBudgetPopup = () => {
  addBudgetPopup.value.close()
  resetBudgetForm()
}

const resetBudgetForm = () => {
  budgetForm.value = {
    recordType: null,
    budgetAmount: ''
  }
}

const showBudgetActions = () => {
  currentBudget.value = totalBudget.value
  isCategoryBudget.value = false
  budgetActionsPopup.value.open()
}

const showCategoryBudgetActions = (item) => {
  currentBudget.value = item
  isCategoryBudget.value = true
  budgetActionsPopup.value.open()
}

const closeBudgetActions = () => {
  budgetActionsPopup.value.close()
  currentBudget.value = null
  isCategoryBudget.value = false
}

const editBudget = () => {
  budgetActionsPopup.value.close()
  isEditing.value = true
  budgetForm.value = {
    budgetAmount: currentBudget.value.budgetAmount,
    recordType: isCategoryBudget.value ? currentBudget.value.recordType : null
  }
  isAddingCategory.value = isCategoryBudget.value
  addBudgetPopup.value.open()
}

const deleteBudget = async () => {
  budgetActionsPopup.value.close()
  
  try {
    await uni.showModal({
      title: '提示',
      content: '确定要删除该预算吗？',
      confirmColor: '#FFD700'
    })
    
    await http.delete(`/bookkeeping-service/bookkeeping/budget/delete?id=${currentBudget.value.id}`)
    
    uni.showToast({
      title: '删除成功',
      icon: 'success'
    })
    
    // 重置状态
    isEditing.value = false
    currentBudget.value = null
    
    await fetchBudgetData()
  } catch (error) {
    if (error.errMsg !== 'showModal:fail cancel') {
      uni.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  }
}

const saveBudget = async () => {
  // 验证金额
  const amount = Number(budgetForm.value.budgetAmount)
  if (!amount || isNaN(amount) || amount <= 0) {
    uni.showToast({
      title: '请输入大于0的金额',
      icon: 'none'
    })
    return
  }
  
  // 验证小数位
  if (amount.toString().split('.')[1]?.length > 2) {
    uni.showToast({
      title: '金额最多保留2位小数',
      icon: 'none'
    })
    return
  }
  
  // 如果是分类预算，验证分类
  if ((isAddingCategory.value && !isEditing.value) && !budgetForm.value.recordType) {
    uni.showToast({
      title: '请选择记录分类',
      icon: 'none'
    })
    return
  }
  
  const params = {
    budgetType: isAddingCategory.value ? getCategoryBudgetType() : budgetType.value,
    budgetAmount: amount
  }
  
  // 如果是分类预算，添加recordType参数
  if (isAddingCategory.value) {
    params.recordType = budgetForm.value.recordType
  }
  
  // 如果是编辑，添加id参数
  if (isEditing.value) {
    params.id = currentBudget.value.id
  }
  
  const url = isEditing.value ? 
    '/bookkeeping-service/bookkeeping/budget/update' : 
    '/bookkeeping-service/bookkeeping/budget/add'
  
  await http[isEditing.value ? 'put' : 'post'](url, params)
  
  uni.showToast({
    title: isEditing.value ? '修改成功' : '添加成功',
    icon: 'success'
  })
  
  closeAddBudgetPopup()
  await fetchBudgetData() // 刷新数据
  
  // 如果是总预算，重新初始化图表
  if (!isAddingCategory.value && chartRef.value) {
    chartRef.value.init(echarts, chart => {
      myChart.value = chart;
      renderChart();
    });
  }
}

const formatAmount = (amount) => {
  return Number(amount || 0).toFixed(2)
}

const calculateProgress = (used, total) => {
  if (!total || total <= 0) return 0
  const progress = (Number(used) / Number(total)) * 100
  return Math.min(progress, 100).toFixed(1)
}

const getProgressColor = (used, total) => {
  const progress = (Number(used) / Number(total)) * 100
  if (progress >= 90) {
    return '#ff4d4f' // 红色，预算即将用完
  } else if (progress >= 70) {
    return '#faad14' // 橙色，预算使用超过70%
  }
  return '#52c41a' // 绿色，预算充足
}

const navigateToRecords = (item) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const currentDate = `${year}-${month}-${day}`
  
  let url = '/pagesBookkeeping/bookkeeping/bookkeeping-records?recordType=' + item.recordType
  
  if (budgetType.value === 1) {
    // 月预算
    url += '&recordDate=' + currentDate
  } else {
    // 年预算
    url += '&recordYear=' + currentDate
  }
  
  uni.navigateTo({
    url: url
  })
}

// 页面加载时获取数据
onShow(() => {
  fetchBudgetData();
})
</script>

<style lang="scss" scoped>
.budget-container {
  padding: 20rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.budget-type-selector {
  background-color: #fff;
  padding: 20rpx;
  text-align: center;
  font-size: 32rpx;
  margin-bottom: 20rpx;
  border-radius: 8rpx;
  position: relative;
  z-index: 2;
}

.total-budget {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 8rpx;
  margin-bottom: 20rpx;

  .budget-actions {
    display: flex;
    justify-content: flex-end;
    padding: 0;
    margin-bottom: 4rpx;
    
    .edit-btn {
      padding: 4rpx 0;
      font-size: 28rpx;
      color: #666;
      
      &:active {
        opacity: 0.7;
      }
    }
  }

  .budget-chart {
    .budget-content {
      display: flex;
      align-items: center;
      gap: 40rpx;
      position: relative;
      z-index: 1;
    }

    .chart-container {
      width: 100px !important;
      height: 100px !important;
      flex-shrink: 0;
      background-color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .budget-info {
      flex: 1;
      
      .info-item {
        margin: 20rpx 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .label {
          color: #666;
          font-size: 28rpx;
        }
        
        .value {
          color: #333;
          font-size: 32rpx;
          font-weight: bold;

          &.negative {
            color: #ff4d4f;
          }
        }
      }
    }
  }
}

.no-budget {
  text-align: center;
  padding: 40rpx 0;
  
  text {
    color: #999;
    font-size: 28rpx;
    margin-bottom: 20rpx;
    display: block;
  }
}

.add-budget-btn {
  background-color: #FFD700;
  color: #333;
  border: none;
  padding: 20rpx 60rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
}

.category-budget-list {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 20rpx;

  .category-header {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    padding: 20rpx;
    border-bottom: 1rpx solid #eee;
  }

  .category-item {
    padding: 30rpx 20rpx;
    border-bottom: 1rpx solid #eee;

    &:last-child {
      border-bottom: none;
    }

    .category-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15rpx;
      
      .category-name {
        color: #333;
        font-size: 28rpx;
      }
      
      .category-amount {
        color: #666;
        font-size: 26rpx;
      }
    }

    .progress-bar-container {
      display: flex;
      align-items: center;
      gap: 20rpx;

      .progress-bar {
        flex: 1;
        height: 12rpx;
        background-color: #f0f0f0;
        border-radius: 6rpx;
        overflow: hidden;

        .progress-bar-inner {
          height: 100%;
          transition: width 0.3s ease-in-out;
        }
      }

      .progress-text {
        font-size: 24rpx;
        color: #999;
        min-width: 70rpx;
      }
    }
  }
}

.no-category-budget {
  text-align: center;
  padding: 40rpx 0;
  
  text {
    color: #999;
    font-size: 28rpx;
    margin-bottom: 20rpx;
    display: block;
  }
}

.popup-content {
  background-color: #fff;
  
  .popup-item {
    padding: 30rpx;
    text-align: center;
    border-bottom: 1rpx solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.budget-chart {
  .chart-container {
    width: 100px !important;
    height: 100px !important;
    flex-shrink: 0;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.add-budget-popup {
  background-color: #fff;
  border-radius: 12rpx;
  width: 600rpx;
  
  .popup-header {
    padding: 30rpx;
    text-align: center;
    font-size: 32rpx;
    font-weight: bold;
    border-bottom: 1rpx solid #eee;
  }
  
  .popup-content {
    padding: 30rpx;
    
    .form-item {
      margin-bottom: 30rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 20rpx;
      }
      
      .input {
        border: 1rpx solid #ddd;
        border-radius: 6rpx;
        padding: 16rpx;
        font-size: 28rpx;
      }
    }
  }
  
  .popup-footer {
    display: flex;
    border-top: 1rpx solid #eee;
    
    .btn {
      flex: 1;
      border: none;
      background: none;
      padding: 24rpx;
      font-size: 30rpx;
      
      &.cancel {
        color: #999;
        border-right: 1rpx solid #eee;
      }
      
      &.confirm {
        color: #FFD700;
      }
    }
  }
}

.actions-popup {
  background-color: #fff;
  border-radius: 16rpx 16rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  
  .action-item {
    height: 110rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    color: #333;
    border-bottom: 1rpx solid #eee;
    
    &.delete {
      color: #ff4d4f;
    }
    
    &.cancel {
      color: #999;
      border-bottom: none;
      
      &:active {
        background-color: #f5f5f5;
      }
    }
    
    &:active {
      background-color: #f5f5f5;
    }
  }
}
</style> 