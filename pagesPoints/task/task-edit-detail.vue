<template>
  <view class="task-detail-container">
    <!-- 加载中状态 -->
    <view v-if="loading" class="loading-container">
      <uni-load-more status="loading"></uni-load-more>
    </view>

    <!-- 任务详情内容 -->
    <view v-else-if="!error" class="detail-content">
      <!-- 第一行：任务名称 + 保存按钮 -->
      <view class="header-row">
        <view class="task-name">{{ taskDetail.taskName }}</view>
        <button class="save-btn" @tap="saveTask" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </view>

      <!-- 任务备注编辑框 - 占满剩余空间 -->
      <textarea
        v-model="taskDetail.taskRemark"
        class="remark-textarea"
        placeholder="添加备注..."
        @blur="onRemarkBlur"
      ></textarea>
    </view>

    <!-- 错误状态 -->
    <view v-if="error && !loading" class="error-container">
      <view class="error-message">{{ error }}</view>
      <button class="retry-btn" @tap="fetchTaskDetail">重试</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import http from '@/api/request.js'

// 响应式数据
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const taskId = ref(null)

const taskDetail = reactive({
  id: null,
  taskName: '',
  taskRemark: '',
  parentId: null,
  taskGroupId: null,
  taskStatus: null,
  deadlineDate: null,
  deadlineTime: null,
  priority: null,
  isTop: null,
  sort: null,
  createTime: null,
  updateTime: null,
  rewardPoints: null,
  punishPoints: null,
  fileList: []
})


// 从路由参数获取 taskId
const getTaskId = () => {
  if (taskId.value) {
    return taskId.value
  }

  // uni-app 方式获取参数
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    const options = currentPage.$route?.query || currentPage.options || {}
    taskId.value = options.taskId
  }

  return taskId.value
}

// 获取任务详情
const fetchTaskDetail = async () => {
  try {
    loading.value = true
    error.value = ''

    const id = getTaskId()
    if (!id) {
      error.value = '无效的任务ID'
      loading.value = false
      return
    }

    const response = await http.get(`/points-service/points/task/basics/detail?id=${id}`)

    if (response && response.data) {
      Object.assign(taskDetail, response.data)
    }
  } catch (err) {
    error.value = err.message || '加载任务详情失败'
    console.error('获取任务详情失败:', err)
  } finally {
    loading.value = false
  }
}

// 保存任务备注
const saveTask = async () => {
  try {
    saving.value = true

    await http.put('/points-service/points/task/basics/updateTaskParam', {
      id: taskDetail.id,
      taskRemark: taskDetail.taskRemark
    })


    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  } catch (err) {
    console.error('保存任务备注失败:', err)
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  } finally {
    saving.value = false
  }
}

// 备注框失焦时的处理
const onRemarkBlur = () => {
  // 可以在这里添加自动保存逻辑
}

// 页面挂载时获取任务详情
onMounted(() => {
  fetchTaskDetail()
})
</script>

<style lang="scss" scoped>
.task-detail-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  box-sizing: border-box;
}

// 详情内容
.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

// 第一行：任务名称 + 保存按钮
.header-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 12rpx 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  .task-name {
    flex: 1;
    font-size: 30rpx;
    font-weight: 500;
    color: #333;
    line-height: 1.3;
    word-break: break-word;
  }

  .save-btn {
    background-color: #007aff;
    color: #fff;
    padding: 8rpx 20rpx;
    border-radius: 6rpx;
    font-size: 26rpx;
    font-weight: 400;
    border: none;
    white-space: nowrap;

    &:active {
      background-color: #0051cc;
    }

    &:disabled {
      background-color: #ccc;
      color: #999;
    }
  }
}

// 任务备注编辑框 - 占满剩余空间
.remark-textarea {
  flex: 1;
  width: 100%;
  padding: 20rpx;
  border: 1px solid #e5e5e5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  box-sizing: border-box;
  background-color: #fff;
  resize: none;

  &:focus {
    border-color: #007aff;
    outline: none;
  }

  &::placeholder {
    color: #999;
    font-size: 28rpx;
  }
}

// 加载状态
.loading-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 错误状态
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 20rpx;

  .error-message {
    font-size: 28rpx;
    color: #ff3b30;
    text-align: center;
    margin-bottom: 30rpx;
  }

  .retry-btn {
    background-color: #007aff;
    color: #fff;
    padding: 16rpx 40rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
    border: none;
  }
}
</style>

