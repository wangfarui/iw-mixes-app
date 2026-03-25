import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useFamilyStore } from './family.js'

const QUERY_SCOPE_SHARED = 'shared'
const QUERY_SCOPE_MYSELF = 'myself'
const CHILD_ROLE_CODE = 4

function getCachedGroup() {
  return uni.getStorageSync('myGroup') || null
}

export const useFamilySharedScopeStore = defineStore('familySharedScope', () => {
  const familyStore = useFamilyStore()

  const currentGroup = computed(() => familyStore.myGroup || getCachedGroup())

  const hasGroup = computed(() => Boolean(currentGroup.value))

  const currentUserRole = computed(() => {
    const role = currentGroup.value?.currentUserRole
    return role == null ? null : Number(role)
  })

  const isChildRole = computed(() => currentUserRole.value === CHILD_ROLE_CODE)

  const effectiveScope = computed(() => {
    if (!hasGroup.value || isChildRole.value) {
      return QUERY_SCOPE_MYSELF
    }
    return Number(currentGroup.value?.queryOnlyMyself) === 1 ? QUERY_SCOPE_MYSELF : QUERY_SCOPE_SHARED
  })

  const queryOnlyMyself = computed(() => {
    return effectiveScope.value === QUERY_SCOPE_MYSELF ? 1 : null
  })

  const scopeText = computed(() => {
    return effectiveScope.value === QUERY_SCOPE_MYSELF ? '仅自己' : '家庭共享'
  })

  const canChangeScope = computed(() => hasGroup.value && !isChildRole.value)

  const defaultShared = computed(() => {
    if (!hasGroup.value) {
      return false
    }
    if (isChildRole.value) {
      return true
    }
    return Number(currentGroup.value?.defaultShared) === 1
  })

  const canControlRecordShared = computed(() => hasGroup.value && !isChildRole.value)

  const defaultRecordShared = computed(() => {
    if (!hasGroup.value) {
      return 0
    }
    return defaultShared.value ? 1 : 0
  })

  function setScope(scope) {
    if (!currentGroup.value || isChildRole.value) {
      return
    }
    familyStore.updateGroup({
      ...currentGroup.value,
      queryOnlyMyself: scope === QUERY_SCOPE_MYSELF ? 1 : 0
    })
  }

  function setDefaultShared(enabled) {
    if (!currentGroup.value) {
      return
    }
    familyStore.updateGroup({
      ...currentGroup.value,
      defaultShared: enabled ? 1 : 0
    })
  }

  return {
    hasGroup,
    currentUserRole,
    isChildRole,
    effectiveScope,
    queryOnlyMyself,
    scopeText,
    canChangeScope,
    defaultShared,
    canControlRecordShared,
    defaultRecordShared,
    setScope,
    setDefaultShared
  }
})
