<template>
  <view class="container">
    <!-- 表单状态提示 -->
    <uni-section v-if="isUpdateForm" title="表单状态" type="line">
      <view class="status-warning">当前为编辑状态</view>
    </uni-section>

    <view class="form-item segmented-control">
        <uni-segmented-control
          :current="current"
          :values="items"
          style-type="button"
          active-color="#007aff"
          @clickItem="onClickItem"
        />
      </view>

    <!-- 记账日期 -->
    <view class="form-item">
      <view class="label">记账日期:</view>
      <uni-datetime-picker type="date" :clear-icon="false" v-model="formData.recordDate" return-type="string" />
    </view>

      <!-- 支出项目 / 收入来源 -->
    <view class="form-item">
      <view class="label">
        <span v-if="formData.recordCategory === 1">支出项目:</span>
        <span v-if="formData.recordCategory === 2">收入来源:</span>
      </view>
      <uni-easyinput v-model="formData.recordSource" maxlength="64"></uni-easyinput>
    </view>

    <!-- 记账金额 -->
    <view class="form-item">
      <view class="label">记账金额:</view>
      <input class="amount-input" v-model="formData.amount" placeholder="请输入金额" />
    </view>

    <!-- 激励记录（仅收入） -->
    <view v-if="formData.recordCategory === 2" class="form-item">
      <view class="label">激励记录:</view>
      <switch :checked="isExcitationRecord" @change="switchExcitationRecord" />
    </view>

    <!-- 不计入统计（仅支出） -->
    <view v-if="formData.recordCategory === 1" class="form-item">
      <view class="label">不计入统计:</view>
      <switch :checked="isNotStatistics" @change="switchNotStatistics" size="20px" />
    </view>

    <!-- 分类 -->
    <view class="form-item full-width">
      <view class="label">分类:</view>
        <uni-data-select
          v-model="formData.recordType"
          :localdata="dictStore.getDictDataWithDataSelectCode(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TYPE)"
        />
    </view>

    <view class="form-item full-width">
      <view class="label">图标:</view>
      <view class="icon-selector" @click="showIconSelector">
        <view v-if="formData.recordIcon" class="icon-container">
          <image :src="getIconUrl(formData.recordIcon)" class="selected-icon"></image>
          <view class="delete-icon" @click.stop="clearIcon">×</view>
        </view>
        <text v-else>请选择图标</text>
      </view>
    </view>

    <!-- 标签 -->
    <view class="form-item">
        <view class="label">标签:</view>
        <uni-data-checkbox
          multiple
          v-model="formData.recordTags"
          :localdata="dictStore.getDictDataWithDataSelectId(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TAG)"
        />
    </view>

    <!-- 备注 -->
    <view class="form-item">
        <view class="label">备注:</view>
        <uni-easyinput v-model="formData.remark" placeholder="请输入内容"></uni-easyinput>
    </view>

    <!-- 图片上传 -->
    <view class="form-item">
      <view class="label">附件:</view>
      <view class="file-upload-container">
        <view class="file-list">
          <view v-for="(file, index) in formData.fileList" :key="index" class="file-item">
            <image :src="file.fileUrl" class="file-thumbnail" @click="previewImage(file.fileUrl)" mode="aspectFill"></image>
            <view class="delete-file" @click="deleteFile(index)">×</view>
          </view>
        </view>
        <button size="mini" @click="showUploadPopup">上传图片</button>
      </view>
    </view>

    <!-- 上传附图片弹窗 -->
    <uni-popup ref="uploadPopup" type="bottom" :animation="true">
      <view class="popup-content">
        <button class="popup-button" @click="takePhoto">拍照</button>
        <button class="popup-button" @click="chooseFromAlbum">从相册选择</button>
        <button class="popup-button cancel" @click="closeUploadPopup">取消</button>
      </view>
    </uni-popup>

    <!-- 保存按钮 -->
    <view class="save-button">
      <button type="primary" @click="saveRecord">保存</button>
    </view>

    <!-- 今日记录 -->
    <uni-section title="今日记录" type="line">
      <template v-slot:right> 今日总消费：{{ toDayConsume }} 元 </template>
      <view>
        <uni-list>
          <uni-list-item v-for="(item, index) in toDayRecords" :key="item.id">
            <template v-slot:body>
              <view class="record-item">
                <uni-row>
                  <uni-col :span="18">{{ formatSourceText(item) }}</uni-col>
                  <uni-col :span="6">
                    <view class="amount">{{ item.recordCategory == '1' ? '-' : '' }}{{ item.amount }}元</view>
                  </uni-col>
                </uni-row>
                <uni-row>
                  <view>{{ item.recordTime }}</view>
                </uni-row>
              </view>
            </template>
          </uni-list-item>
        </uni-list>
      </view>
    </uni-section>

    <!-- 图标选择弹框 -->
		<uni-popup ref="iconPopup" type="center">
			<view class="icon-popup">
				<view class="popup-header">
					<text class="popup-title">选择图标</text>
					<text class="popup-close" @click="closeIconSelector">×</text>
				</view>
				<scroll-view class="icon-list" scroll-y>
					<view v-for="categoryGroup in iconList" :key="categoryGroup.category" class="icon-category">
						<view class="category-title">{{categoryGroup.category}}</view>
						<view class="category-icons">
							<view class="icon-item" v-for="icon in categoryGroup.icons" :key="icon.path" @click="selectIcon(icon)" :class="getIconItemClass(icon)">
								<image :src="icon.path" class="icon-image"></image>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</uni-popup>
  </view>
</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted
	} from 'vue'

	import http from '@/api/request.js'

	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app'

	import {
		useDictStore
	} from "@/stores/dict.ts";
	import { getIconUrl, getIconList} from '@/utils/icon.js'
	import {
		baseUrl,
		tokenHeader
	} from '@/api/env.js'

	const dictStore = useDictStore()
	const items = ['支出', '收入']
	const formData = ref({
		fileList: [], // 初始化文件列表
		recordDate: '',
		recordCategory: 1,
		recordSource: '',
		amount: '',
		recordType: '',
		remark: '',
		recordTags: [],
		isStatistics: ''
	}) // 记账表单数据
	const current = ref(0) // 当前所选的记录类型 对应items下表
	const toDayRecords = ref([]) // 今日记账记录列表
	const toDayConsume = ref(0) // 今日总消费
	const isExcitationRecord = ref(false) // 是否为激励记录
	const isNotStatistics = ref(false) // 是否不计入统计
	const isUpdateForm = ref(false) // 是否为编辑表单
	const updateFormId = ref('')
	const iconList = ref([])
	const iconPopup = ref(null)
	const uploadPopup = ref(null)
	
	onLoad((option) => {
		if (option.id) {
			isUpdateForm.value = true
			updateFormId.value = option.id
		}
		initFormData()
		loadTodayConsume()
	})

  onMounted(() => {
    iconList.value = getIconList()
  })

	

	function initFormData() {
		if (isUpdateForm.value) {
			http.get('/bookkeeping-service/bookkeepingRecords/detail?id=' + updateFormId.value)
				.then(res => {
					isExcitationRecord.value = res.data.isExcitationRecord == 1
					isNotStatistics.value = res.data.isStatistics == 0
					formData.value = res.data			
				})
		} else {
			isExcitationRecord.value = false
			// 获取当前日期并格式化为 YYYY-MM-DD
			const today = new Date()
			const year = today.getFullYear()
			const month = String(today.getMonth() + 1).padStart(2, '0')
			const day = String(today.getDate()).padStart(2, '0')
			const formattedDate = `${year}-${month}-${day}`
			
			formData.value = {
				recordDate: formattedDate,
				recordCategory: current.value + 1,
				recordSource: '',
				amount: '',
				recordType: '',
				remark: '',
				recordTags: [],
				isStatistics: '',
				fileList: []
			}
		}
	}

	function loadTodayConsume() {
		http.post('/bookkeeping-service/bookkeepingRecords/list', {})
			.then(res => {
				toDayRecords.value = res.data
				if (res.data != null) {
					toDayConsume.value = res.data.reduce((sum, item) => {
						// 先将金额放大100倍，避免小数运算精度问题，然后相加，最后再除以100
						if (item.recordCategory == 2) {
							return Math.round((sum - item.amount) * 100) / 100;
						}
						return Math.round((sum + item.amount) * 100) / 100;
					}, 0);
				}
			})
	}

  function showIconSelector() {
    iconPopup.value.open()
  }

  // 获取选中图标的样式
  const getIconItemClass = (icon) => {
    return {
      'icon-item': true,
      'selected': formData.value.recordIcon === icon.recordIcon
    }
  }

   // 选择图标
  const selectIcon = (icon) => {
    formData.value.recordIcon = icon.recordIcon
    closeIconSelector()
  }

  function closeIconSelector() {
    iconPopup.value.close()
  }

	function switchExcitationRecord() {
		isExcitationRecord.value = !isExcitationRecord.value
	}

	function switchNotStatistics() {
		isNotStatistics.value = !isNotStatistics.value
	}

	function onClickItem(e) {
		current.value = e.currentIndex
		formData.value.recordCategory = current.value + 1
	}

	function saveRecord() {
		if (formData.value.amount == undefined || formData.value.amount === '') {
			uni.showToast({
				icon: 'none',
				title: `记账金额不能为空`
			})
			return
		}

		if (isExcitationRecord.value) {
			formData.value.isExcitationRecord = 1
		}
		formData.value.isStatistics = isNotStatistics.value ? 0 : 1

		let url = '/bookkeeping-service/bookkeepingRecords/add';
		if (isUpdateForm.value) {
			url = '/bookkeeping-service/bookkeepingRecords/update';
		}
		const method = isUpdateForm.value ? 'put' : 'post';
		http.request(url, method, formData.value)
			.then(res => {
				uni.showToast({
					icon: 'success',
					title: `保存成功`
				})
				if (isUpdateForm.value) {
					// 返回上一页
					uni.navigateBack({})
				} else {
					initFormData()
					loadTodayConsume()
				}
			})
	}

	function formatSourceText(item) {
		if (item.recordSource != '') {
			return item.recordSource;
		}
		return item.recordCategory == 2 ? '收入' : '消费';
	}

  // 清除图标
  const clearIcon = () => {
    formData.value.recordIcon = ''
  }

  // 显示上传弹窗
  function showUploadPopup() {
    uploadPopup.value.open()
  }

  // 关闭上传弹窗
  function closeUploadPopup() {
    uploadPopup.value.close()
  }

  // 拍照上传
  function takePhoto() {
    closeUploadPopup()
    uni.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        uploadFile(tempFilePaths[0]);
      }
    })
  }

  // 从相册选择
  function chooseFromAlbum() {
    closeUploadPopup()
    uni.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        tempFilePaths.forEach(filePath => {
          uploadFile(filePath);
        });
      }
    })
  }

  // 上传文件
  function uploadFile(filePath) {
    uni.uploadFile({
      url: baseUrl + '/auth-service/file/upload',
      filePath: filePath,
      name: 'file',
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
        } else {
          const responseData = JSON.parse(uploadFileRes.data).data;
          if (!formData.value.fileList) {
            formData.value.fileList = [];
          }
          formData.value.fileList.push({
            fileName: responseData.fileName,
            fileUrl: responseData.fileUrl
          });
        }
      },
      fail: (err) => {
        console.error('上传失败', err);
        uni.showToast({
          icon: 'error',
          title: '上传失败'
        });
      }
    })
  }

  // 预览图片
  function previewImage(url) {
    uni.previewImage({
      urls: formData.value.fileList.map(file => file.fileUrl),
      current: url
    });
  }

  // 删除文件
  function deleteFile(index) {
    formData.value.fileList.splice(index, 1);
  }
</script>

<style scoped>
/* 容器 */
.container {
  padding: 10px;
}

/* 编辑状态提示 */
.status-warning {
  color: red;
  font-weight: bold;
  padding: 5px 0;
}

/* 通用表单项 */
.form-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

/* label 样式，固定宽度 */
.label {
  width: 90px;
  color: #666;
  font-size: 14px;
  text-align: right;
  flex-shrink: 0;
}

.segmented-control {
  display: flex;
  width: 100%;
}

.segmented-control uni-segmented-control {
  flex: 1;
}

.full-width uni-data-select {
  width: 100%; /* 让下拉框占满整行 */
}

/* 金额输入框 */
.amount-input {
  height: 40px;
  flex: 1;
  font-size: 18px;
  font-weight: bold;
  padding: 8px;
  border: 2px solid #eee;
  border-radius: 6px;
}

/* 记录项样式 */
.record-item {
  width: 100%;
}

/* 右侧金额对齐 */
.amount {
  text-align: right;
}

/* 保存按钮样式 */
.save-button {
  margin: 20px 10px;
}

.icon-selector {
	border: 1px solid #ddd;
	padding: 12px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	gap: 10px;
	background: #f9f9f9;
}

.selected-icon {
	width: 24px;
	height: 24px;
}

.icon-container {
  position: relative;
  display: flex;
  align-items: center;
}

.delete-icon {
  position: absolute;
  right: -8px;
  top: -8px;
  width: 20px;
  height: 20px;
  background-color: #ff4d4f;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  z-index: 1;
}

.delete-icon:hover {
  background-color: #ff7875;
}

.icon-popup {
	background-color: #fff;
	border-radius: 10px;
	width: 90vw;
	max-height: 80vh;
	padding: 20px;
}

.popup-header {
	padding: 0 0 15px 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid #eee;
}

.popup-title {
	font-size: 16px;
	font-weight: bold;
	color: #333;
}

.popup-close {
	font-size: 24px;
	color: #999;
	cursor: pointer;
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.icon-list {
	padding: 15px 0;
	max-height: calc(80vh - 80px);
}

.icon-category {
	margin-bottom: 20px;
}

.category-title {
	font-size: 15px;
	color: #333;
	font-weight: 500;
	padding: 10px 0;
	text-align: center;
}

.category-icons {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
	padding: 0 5px;
}

.icon-item {
	width: 50px;
	height: 50px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background-color: #f5f5f9;
	transition: all 0.3s ease;
}

.icon-item.selected {
	background-color: #FFE082;
}

.icon-item:active {
	transform: scale(0.95);
}

.icon-image {
	width: 24px;
	height: 24px;
	filter: grayscale(100%);
}

.selected .icon-image {
	filter: none;
}

.file-upload-container {
  padding: 10px;
}

.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.file-item {
  position: relative;
  width: 100px;
  height: 100px;
}

.file-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.delete-file {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  cursor: pointer;
}

</style>
