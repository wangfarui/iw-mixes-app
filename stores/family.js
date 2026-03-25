import { defineStore } from 'pinia'
import { getMyGroup } from '@/api/family.js'

export const useFamilyStore = defineStore('family', {
  state: () => ({
    myGroup: null, // 我的家庭组信息
    isLoading: false
  }),

  getters: {
    // 是否已加入家庭组
    hasGroup: (state) => state.myGroup !== null,

    // 家庭组名称
    groupName: (state) => state.myGroup?.groupName || '未加入',

    // 是否是群主
    isOwner: (state) => {
      if (!state.myGroup) return false
      const userInfo = uni.getStorageSync('userInfo')
      return state.myGroup.ownerUserId === userInfo?.id
    }
  },

  actions: {
    // 获取我的家庭组
    async fetchMyGroup() {
      if (this.isLoading) return
      this.isLoading = true
      try {
        const res = await getMyGroup()
        if (res.data) {
          this.myGroup = res.data
          uni.setStorageSync('myGroup', this.myGroup)
        } else {
          this.clearGroup()
        }
      } catch (e) {
        // 未加入家庭组或请求失败
        this.myGroup = null
        const cached = uni.getStorageSync('myGroup')
        if (cached) {
          this.myGroup = cached
        }
      } finally {
        this.isLoading = false
      }
    },

    // 清除家庭组信息
    clearGroup() {
      this.myGroup = null
      uni.removeStorageSync('myGroup')
    },

    // 更新家庭组信息
    updateGroup(groupData) {
      if (!groupData) {
        this.clearGroup()
        return
      }
      this.myGroup = groupData
      uni.setStorageSync('myGroup', this.myGroup)
    }
  }
})
