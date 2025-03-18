<template>
  <view class="container">
    <!-- 表单状态提示 -->
    <uni-section v-if="isUpdateForm" title="表单状态" type="line">
      <view class="status-warning">当前为编辑状态</view>
    </uni-section>

    <!-- 记账日期 -->
    <uni-section title="记账日期" subTitle="为空时默认为当天" type="line">
      <view class="form-item">
        <uni-datetime-picker type="date" :clear-icon="false" v-model="formData.recordDate" return-type="string" />
      </view>
    </uni-section>

    <!-- 记账记录 -->
    <uni-section title="记账记录" type="line">
      <view class="form-item segmented-control">
        <uni-segmented-control
          :current="current"
          :values="items"
          style-type="button"
          active-color="#007aff"
          @clickItem="onClickItem"
        />
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
        <switch :checked="isNotStatistics" @change="switchNotStatistics" />
      </view>
    </uni-section>

    <!-- 分类 -->
   <uni-section title="分类" type="line">
       <view class="form-item full-width">
         <uni-data-select
           v-model="formData.recordType"
           :localdata="dictStore.getDictDataWithDataSelectCode(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TYPE)"
         />
       </view>
    </uni-section>

    <!-- 标签 -->
    <uni-section title="标签" type="line">
      <view class="form-item">
        <uni-data-checkbox
          multiple
          v-model="formData.recordTags"
          :localdata="dictStore.getDictDataWithDataSelectId(dictStore.dictTypeEnum.BOOKKEEPING_RECORD_TAG)"
        />
      </view>
    </uni-section>

    <!-- 备注 -->
    <uni-section title="备注" type="line">
      <view class="form-item">
        <uni-easyinput v-model="formData.remark" placeholder="请输入内容"></uni-easyinput>
      </view>
    </uni-section>

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
  </view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue'

	import http from '@/api/request.js'

	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app'

	import {
		useDictStore
	} from "@/stores/dict.ts";

	const dictStore = useDictStore()
	const items = ['支出', '收入']
	const formData = ref({}) // 记账表单数据
	const current = ref(0) // 当前所选的记录类型 对应items下表
	const toDayRecords = ref([]) // 今日记账记录列表
	const toDayConsume = ref(0) // 今日总消费
	const isExcitationRecord = ref(false) // 是否为激励记录
	const isNotStatistics = ref(false) // 是否不计入统计
	const isUpdateForm = ref(false) // 是否为编辑表单
	const updateFormId = ref('')
	
	onLoad((option) => {
		if (option.id) {
			isUpdateForm.value = true
			updateFormId.value = option.id
		}
	})

	onShow(() => {
		initFormData()
		loadTodayConsume()
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
			formData.value = {
				recordDate: '',
				recordCategory: current.value + 1,
				recordSource: '',
				amount: '',
				recordType: '',
				remark: '',
				recordTags: [],
				isStatistics: ''
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
</style>
