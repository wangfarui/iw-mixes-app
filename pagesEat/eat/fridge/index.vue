<!-- 冰箱首页 -->
<template>
  <view class="fridge-page">
    <!-- 筛选区域 -->
    <view class="filter-section">
      <!-- 第一行：食材名称 + 排序 + 展开按钮 -->
      <view class="filter-row primary">
        <!-- 食材名称搜索 -->
        <view class="filter-item flex-2">
          <uni-easyinput
            v-model="filters.name"
            type="text"
            placeholder="食材名称"
            :clearable="true"
            @blur="onNameChange"
            @clear="onNameChange"
            class="filter-easyinput"
          />
        </view>

        <!-- 排序 -->
        <view class="filter-item flex-1">
          <uni-data-select
            v-model="currentSortOption"
            :localdata="displaySortOptions"
            placeholder="排序"
            :clear="true"
            class="filter-select"
            @change="onSortChange"
          />
        </view>

        <!-- 展开/收起按钮 -->
        <view class="expand-btn" @click="toggleFilterExpand">
          <uni-icons :type="isFilterExpanded ? 'up' : 'down'" size="20" color="#007aff"></uni-icons>
        </view>
      </view>

      <!-- 第二行：其他筛选项（展开时显示） -->
      <view v-if="isFilterExpanded" class="filter-row secondary">
        <!-- 过期类型筛选 -->
        <view class="filter-item flex-1">
          <uni-data-select
            v-model="filters.expireType"
            :localdata="expireTypes"
            @change="onExpireTypeChange"
            placeholder="过期类型"
            :clear="true"
            class="filter-select"
          />
        </view>

        <!-- 冰箱分区筛选 -->
        <view class="filter-item flex-1">
          <uni-data-select
            v-model="filters.section"
            :localdata="dictStore.getDictDataWithDataSelectCode(dictStore.dictTypeEnum.EAT_FRIDGE_SECTION)"
            @change="onSectionChange"
            placeholder="分区"
            :clear="true"
            class="filter-select"
          />
        </view>

        <!-- 食材分类筛选 -->
        <view class="filter-item flex-1">
          <uni-data-select
            v-model="filters.category"
            :localdata="dictStore.getDictDataWithDataSelectCode(dictStore.dictTypeEnum.EAT_FRIDGE_CATEGORY)"
            @change="onCategoryChange"
            placeholder="分类"
            :clear="true"
            class="filter-select"
          />
        </view>
      </view>
    </view>

    <!-- 食材列表 -->
    <scroll-view
      class="food-list-scroll"
      :scroll-y="true"
      @scrolltolower="loadMore"
      @refresherrefresh="onRefresh"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
    >
      <view class="food-list">

        <!-- 食材项目 -->
        <view
          v-for="(item, index) in displayedFoodItems"
          :key="item.id"
          class="food-item"
          :class="{ 'is-expired': isExpired(item.expireDate), 'is-expiring': isExpiringSoon(item.expireDate) }"
          @click="goToDetail(item.id)"
          @longpress="showItemActions(index, item)"
        >
          <!-- 食材信息 -->
          <view class="food-content">
            <!-- 图标和基本信息 -->
            <view class="food-header">
              <text class="food-emoji">{{ item.emoji }}</text>
              <view class="food-basic">
                <text class="food-name">{{ item.name }}</text>
                <text class="food-category">{{dictStore.getDictNameByCode(dictStore.dictTypeEnum.EAT_FRIDGE_CATEGORY, item.category)}}</text>
              </view>
            </view>

            <!-- 详细信息 -->
            <view class="food-detail">
              <view class="detail-item">
                <text class="detail-label">分区：</text>
                <text class="detail-value">{{dictStore.getDictNameByCode(dictStore.dictTypeEnum.EAT_FRIDGE_SECTION, item.section)}}</text>
              </view>
              <view class="detail-item">
                <text class="detail-label">数量：</text>
                <text class="detail-value">{{ item.quantity }}</text>
              </view>
              <view class="detail-item">
                <text class="detail-label">入库：</text>
                <text class="detail-value">{{ item.addDate }}</text>
              </view>
              <view class="detail-item">
                <text class="detail-label">过期：</text>
                <text class="detail-value" :class="getExpireClass(item.expireDate)">
                  {{ item.expireDate }}
                </text>
              </view>
            </view>

            <!-- 过期状态标签 -->
            <view v-if="isExpired(item.expireDate)" class="status-badge expired">
              <text>已过期</text>
            </view>
            <view v-else-if="isExpiringSoon(item.expireDate)" class="status-badge expiring">
              <text>即将过期</text>
            </view>
          </view>

          <!-- 右侧指示器 -->
          <view class="item-arrow">
            <uni-icons type="right" size="20" color="#ccc"></uni-icons>
          </view>
        </view>

        <!-- 加载更多 -->
        <view class="load-more">
          <text v-if="isLoading" class="loading-text">加载中...</text>
          <text v-else-if="isNoMore" class="no-more-text">没有更多了</text>
          <text v-else class="load-text">上拉加载更多</text>
        </view>
      </view>
    </scroll-view>

    <!-- 长按操作菜单 -->
    <uni-popup ref="actionPopup" type="bottom">
      <view class="action-menu">
        <view class="menu-item" @click="markAsUsed">
          <uni-icons type="checkmarkempty" size="24" color="#4cd964"></uni-icons>
          <text>用完</text>
        </view>
        <view class="menu-item delete" @click="deleteFood">
          <uni-icons type="trash" size="24" color="#dd524d"></uni-icons>
          <text>删除</text>
        </view>
      </view>
    </uni-popup>

    <!-- 新增按钮 -->
    <view class="add-btn-container">
      <view class="add-btn" @click="goToAddFood">
        <uni-icons type="plus" size="32" color="white"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import http from '@/api/request.js'
import { useDictStore } from '@/stores/dict.ts'

const dictStore = useDictStore()

// ============ 数据定义 ============
const filters = ref({
  name: '',
  expireType: '',
  section: '',
  category: ''
})

const actionPopup = ref(null)
const selectedItem = ref(null)
const selectedIndex = ref(null)
const isFilterExpanded = ref(false) // 筛选项展开状态

const isRefreshing = ref(false)
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = 10
const isNoMore = ref(false)
const totalCount = ref(0)

// 分类和分区定义（用于展示的中文）
const expireTypes = ref([
  { text: '即将过期', value: 'expiring' },
  { text: '已过期', value: 'expired' }
])

// 排序字段选项
const sortTypeOptions = [
  { text: '创建时间', value: 0 },
  { text: '入库日期', value: 1 },
  { text: '过期日期', value: 2 }
]
// 排序方式（升序：1，降序：2）
const sortWayOptions = [
  { text: '升序', value: 1 },
  { text: '降序', value: 2 }
]

const sortType = ref(0) // 默认按创建时间
const sortWay = ref(2) // 默认降序
const currentSortOption = ref(0) // 当前选中的排序选项，默认为0（创建时间）
const lastSortType = ref(null) // 记录上一次选择的排序字段，用于判断是否切换字段

// ============ 食材列表数据 ============
const allFoodItems = ref([])

// ============ 辅助函数 ============
// 获取当前日期（YYYY-MM-DD 格式）
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ============ 过期判断方法 ============
const isExpired = (expireDate) => {
  // 过期日期为空，则不判断为过期
  if (!expireDate) {
    return false
  }
  const today = new Date()
  // 获取今天的日期（只比较年月日，忽略时间）
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const expire = new Date(expireDate)
  // 只有小于今天的日期才是已过期
  return expire < todayDate
}

const isExpiringSoon = (expireDate) => {
  // 过期日期为空，则不判断为即将过期
  if (!expireDate) {
    return false
  }
  const today = new Date()
  const expire = new Date(expireDate)
  const diffTime = expire.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  // 即将过期：3天内（包括今天）
  return diffDays >= 0 && diffDays <= 3
}

const getExpireClass = (expireDate) => {
  if (!expireDate) {
    return ''
  }
  if (isExpired(expireDate)) {
    return 'expire-danger'
  } else if (isExpiringSoon(expireDate)) {
    return 'expire-warning'
  }
  return ''
}

// ============ 数据请求 ============
const fetchFoodList = async () => {
  try {
    isLoading.value = true

    // 根据 expireType 设置日期范围
    let expireStartDate = null
    let expireEndDate = null
    const today = getTodayDate()

    if (filters.value.expireType === 'expiring') {
      // 即将过期：今天到后3天
      expireStartDate = today
      const futureDate = new Date(today)
      futureDate.setDate(futureDate.getDate() + 3)
      expireEndDate = futureDate.toISOString().split('T')[0]
    } else if (filters.value.expireType === 'expired') {
      // 已过期：只需传结束日期为昨天
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      expireEndDate = yesterday.toISOString().split('T')[0]
    }

    const requestData = {
      currentPage: currentPage.value,
      pageSize: pageSize,
      name: filters.value.name || undefined,
      category: filters.value.category ? parseInt(filters.value.category) : undefined,
      section: filters.value.section ? parseInt(filters.value.section) : undefined,
      expireStartDate: expireStartDate,
      expireEndDate: expireEndDate,
      sortType: sortType.value,
      sortWay: sortWay.value
    }

    // 移除 undefined 的字段
    Object.keys(requestData).forEach(key =>
      requestData[key] === undefined && delete requestData[key]
    )

    const response = await http.post('/eat-service/fridge/food/page', requestData)

    if (response.code === 200) {
      const data = response.data
      if (currentPage.value === 1) {
        allFoodItems.value = []
      }

      // 处理返回数据，转换分类和分区为中文
      const processedItems = (data.records || []).map(item => ({
        ...item,
        category: dictStore.getDictNameById(dictStore.dictTypeEnum.EAT_FRIDGE_CATEGORY, item.category) || item.category,
        section: dictStore.getDictNameById(dictStore.dictTypeEnum.EAT_FRIDGE_SECTION, item.section) || item.section
      }))

      allFoodItems.value = allFoodItems.value.concat(processedItems)
      totalCount.value = data.total || 0

      // 判断是否已加载全部
      if (allFoodItems.value.length >= totalCount.value) {
        isNoMore.value = true
      }
    }
  } catch (error) {
    console.error('获取食材列表失败:', error)
    uni.showToast({
      title: '获取列表失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// ============ 计算属性 ============
// 生成显示用的排序选项（带箭头指示器）
const displaySortOptions = computed(() => {
  return sortTypeOptions.map(opt => {
    if (opt.value === currentSortOption.value) {
      // 当前选中的选项，添加箭头指示符
      const arrow = sortWay.value === 1 ? ' ↑' : ' ↓'
      return { ...opt, text: opt.text + arrow }
    }
    return opt
  })
})

const displayedFoodItems = computed(() => {
  return allFoodItems.value
})

// ============ 事件处理 ============
const resetPage = () => {
  currentPage.value = 1
  isNoMore.value = false
  isLoading.value = false
  allFoodItems.value = []
  fetchFoodList()
}

const onNameChange = () => {
  // 食材名称改变时重新查询
  resetPage()
}

const onExpireTypeChange = () => {
  resetPage()
}

const onSectionChange = () => {
  resetPage()
}

const onCategoryChange = () => {
  resetPage()
}

const onSortChange = () => {
  const newSortType = currentSortOption.value

  // 清空操作由 watch 处理，这里只处理实际的排序选择
  if (newSortType === '' || newSortType === null || newSortType === undefined) {
    return
  }

  if (lastSortType.value === newSortType) {
    // 点击了同一个排序字段，切换排序方式
    sortWay.value = sortWay.value === 2 ? 1 : 2
    sortType.value = newSortType
  } else {
    // 选择了新的排序字段，第一次默认用升序
    sortType.value = newSortType
    sortWay.value = 1
    lastSortType.value = newSortType
  }

  resetPage()
}

const toggleFilterExpand = () => {
  isFilterExpanded.value = !isFilterExpanded.value
}

// 监听排序选项的变化
watch(currentSortOption, (newVal) => {
  // 当用户清空排序选择时（值变为空）
  if (newVal === '' || newVal === null || newVal === undefined) {
    sortType.value = 0
    sortWay.value = 2
    lastSortType.value = null
    resetPage()
  }
})

const loadMore = () => {
  if (isLoading.value || isNoMore.value) return

  currentPage.value++
  fetchFoodList()
}

const onRefresh = () => {
  isRefreshing.value = true
  currentPage.value = 1
  isNoMore.value = false
  allFoodItems.value = []

  fetchFoodList().then(() => {
    isRefreshing.value = false
  }).catch(() => {
    isRefreshing.value = false
  })
}

const showItemActions = (index, item) => {
  selectedIndex.value = index
  selectedItem.value = item
  actionPopup.value.open()
}

const closeActionMenu = () => {
  actionPopup.value.close()
  selectedItem.value = null
  selectedIndex.value = null
}

const goToDetail = (foodId) => {
  uni.navigateTo({
    url: `/pagesEat/eat/fridge/detail?id=${foodId}`
  })
}

const markAsUsed = () => {
  if (!selectedItem.value) return
  const item = selectedItem.value // 保存引用
  uni.showModal({
    title: '确认操作',
    content: `确定要标记 ${item.name} 为已用完吗？`,
    success: (res) => {
      closeActionMenu()
      if (res.confirm) {
        // 调用删除接口
        deleteItemFromServer(item.id, '标记为用完')
      }
    }
  })
}

const deleteFood = () => {
  if (!selectedItem.value) return
  const item = selectedItem.value // 保存引用
  uni.showModal({
    title: '确认删除',
    content: `确定要删除 ${item.name} 吗？`,
    success: (res) => {
      closeActionMenu()
      if (res.confirm) {
        deleteItemFromServer(item.id, '删除')
      }
    }
  })
}

const deleteItemFromServer = async (id, action) => {
  try {
    let response

    if (action === '标记为用完') {
      // 调用用完接口：PUT /eat-service/fridge/food/markAsUsed?id=xxx
      response = await http.put(`/eat-service/fridge/food/markAsUsed?id=${id}`)
    } else {
      // 调用删除接口：DELETE /eat-service/fridge/food/delete?id=xxx
      response = await http.delete(`/eat-service/fridge/food/delete?id=${id}`)
    }

    if (response.code === 200) {
      const index = allFoodItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        allFoodItems.value.splice(index, 1)
        totalCount.value--
        uni.showToast({
          title: `已${action}`,
          icon: 'success'
        })
      }
    } else {
      uni.showToast({
        title: response.message || `${action}失败`,
        icon: 'none'
      })
    }
  } catch (error) {
    console.error(`${action}失败:`, error)
    uni.showToast({
      title: `${action}失败，请稍后重试`,
      icon: 'none'
    })
  }
}

const goToAddFood = () => {
  uni.navigateTo({
    url: '/pagesEat/eat/fridge/detail'
  })
}

onMounted(() => {
  // 初始化时获取列表
  fetchFoodList()
})

onShow(() => {
  // 每次进入页面时重新加载列表数据
  // 重置分页和列表
  currentPage.value = 1
  isNoMore.value = false
  allFoodItems.value = []
  fetchFoodList()
})
</script>

<style lang="scss" scoped>
.fridge-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f9fa;
}

// ============ 筛选区域 ============
.filter-section {
  background: white;
  border-bottom: 1rpx solid #f0f0f0;
  padding: 12rpx 16rpx;
  transition: all 0.3s ease;

  .filter-row {
    display: flex;
    gap: 8rpx;
    align-items: center;

    &.primary {
      padding: 4rpx 0;

      .filter-item {
        &.flex-2 {
          flex: 2;
        }

        &.flex-1 {
          flex: 1;
        }

        min-width: 0;

        .filter-easyinput {
          font-size: 24rpx !important;
          height: 56rpx !important;
        }

        .filter-easyinput :deep(input) {
          font-size: 24rpx !important;
        }

        .filter-select {
          font-size: 24rpx !important;
          height: 56rpx !important;
        }

        .filter-select :deep(.uni-select) {
          font-size: 12px !important;
        }

        .filter-select :deep(.uni-select-input) {
          font-size: 24rpx !important;
        }
      }
    }

    &.secondary {
      padding: 8rpx 0 4rpx 0;
      animation: slideDown 0.3s ease-out;

      .filter-item {
        flex: 1;
        min-width: 0;

        .filter-select {
          font-size: 24rpx !important;
          height: 56rpx !important;
        }

        .filter-select :deep(.uni-select) {
          font-size: 12px !important;
        }

        .filter-select :deep(.uni-select-input) {
          font-size: 24rpx !important;
        }
      }
    }
  }

  .expand-btn {
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8rpx;
    background: #f5f5f5;
    transition: all 0.3s;
    flex-shrink: 0;

    &:active {
      background: #e8e8e8;
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ============ 食材列表 ============
.food-list-scroll {
  flex: 1;
  overflow-y: auto;
}

.food-list {
  padding: 12rpx 32rpx 120rpx;


  .food-item {
    display: flex;
    align-items: center;
    background: white;
    border-radius: 12rpx;
    padding: 16rpx;
    margin-bottom: 8rpx;
    transition: all 0.3s;

    &.is-expired {
      border-left: 4rpx solid #dd524d;
      background: #fff5f5;
    }

    &.is-expiring {
      border-left: 4rpx solid #f0ad4e;
      background: #fffbf0;
    }

    &:active {
      background-color: #f8f9fa;
    }

    .food-content {
      flex: 1;
      position: relative;

      .food-header {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;

        .food-emoji {
          font-size: 32rpx;
          margin-right: 12rpx;
        }

        .food-basic {
          flex: 1;

          .food-name {
            display: block;
            font-size: 28rpx;
            font-weight: 500;
            color: #333;
            margin-bottom: 4rpx;
          }

          .food-category {
            display: block;
            font-size: 22rpx;
            color: #999;
          }
        }
      }

      .food-detail {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8rpx 16rpx;
        margin-bottom: 8rpx;
        font-size: 22rpx;

        .detail-item {
          display: flex;
          align-items: center;
          gap: 4rpx;

          .detail-label {
            color: #999;
            font-weight: 500;
            white-space: nowrap;
          }

          .detail-value {
            color: #666;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
          }
        }
      }

      .status-badge {
        position: absolute;
        top: 0;
        right: 0;
        padding: 4rpx 12rpx;
        border-radius: 20rpx;
        font-size: 20rpx;

        &.expired {
          background: #dd524d;
          color: white;
        }

        &.expiring {
          background: #f0ad4e;
          color: white;
        }

        text {
          color: inherit;
        }
      }
    }

    .item-arrow {
      margin-left: 12rpx;
      padding-right: 8rpx;
    }
  }

  .load-more {
    text-align: center;
    padding: 24rpx 0;
    font-size: 24rpx;
    color: #999;

    .loading-text,
    .no-more-text,
    .load-text {
      display: block;
    }
  }
}

// ============ 长按菜单 ============
.action-menu {
  background: white;
  border-radius: 24rpx 24rpx 0 0;
  padding: 24rpx 0;

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    font-size: 28rpx;
    color: #333;

    &.delete {
      color: #dd524d;
      border-bottom: none;
    }

    text {
      color: inherit;
    }
  }
}

// ============ 新增按钮 ============
.add-btn-container {
  position: fixed;
  bottom: 32rpx;
  right: 32rpx;
  z-index: 999;

  .add-btn {
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.3);
    transition: all 0.3s;

    &:active {
      transform: scale(0.9);
      box-shadow: 0 2rpx 8rpx rgba(0, 122, 255, 0.2);
    }
  }
}
</style>

