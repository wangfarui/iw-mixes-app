import http from './request.js'

/**
 * 家庭组 API
 */

// 获取我的家庭组
export const getMyGroup = () => {
  return http.get('/auth-service/family/group/myGroup')
}

// 创建家庭组
export const createGroup = (data) => {
  return http.post('/auth-service/family/group/add', data)
}

// 修改家庭组信息
export const updateGroup = (data) => {
  return http.put('/auth-service/family/group/update', data)
}

// 解散家庭组
export const deleteGroup = (id) => {
  return http.delete('/auth-service/family/group/delete', { id })
}

// 查询家庭组详情
export const getGroupDetail = (id) => {
  return http.get('/auth-service/family/group/detail', { id })
}

// 生成邀请码
export const generateInvite = (data) => {
  return http.post('/auth-service/family/group/generateInvite', data)
}

// 验证邀请码
export const validateInvite = (inviteCode) => {
  return http.get('/auth-service/family/group/validateInvite', { inviteCode })
}

// 查询邀请码列表
export const getInviteList = (groupId) => {
  return http.get('/auth-service/family/group/inviteList', { groupId })
}

// 加入家庭组
export const joinGroup = (data) => {
  return http.post('/auth-service/family/group/join', data)
}

// 退出家庭组
export const quitGroup = (groupId) => {
  return http.post(`/auth-service/family/group/quit?groupId=${groupId}`)
}

// 移除成员
export const removeMember = (data) => {
  return http.post('/auth-service/family/group/removeMember', data)
}

// 查询成员列表
export const getMemberList = (groupId) => {
  return http.get('/auth-service/family/group/memberList', { groupId })
}

// 转让群主
export const transferOwner = (data) => {
  return http.post('/auth-service/family/group/transferOwner', data)
}
