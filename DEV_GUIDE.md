# iw-mixes-app 开发规范

## API 调用规范

### 1. 错误提示统一处理

**原则：** `request.js` 已经对所有接口调用失败的情况做了统一的错误提示处理，业务代码中**不需要**再次显示错误提示。

**request.js 中的统一错误处理：**
```javascript
// request.js
if (result.code != 200) {
  uni.showToast({
    icon: 'none',
    title: result.message  // 统一显示后端返回的错误信息
  });
  reject(new Error(result.message));
  return
}
```

### 2. 业务代码调用规范

**✅ 正确示例：**

```javascript
async function handleSubmit() {
  try {
    // 调用接口
    await createGroup(formData.value)

    // 成功后的业务处理
    uni.showToast({
      title: '创建成功',
      icon: 'success'
    })

    // 刷新数据
    await familyStore.fetchMyGroup()

    // 页面跳转
    uni.navigateTo({ url: '/pagesBase/family/detail' })
  } catch (e) {
    // ❌ 不要在这里显示错误提示（request.js 已经处理）
    // ❌ uni.showToast({ title: e.message, icon: 'error' })

    // ✅ 只处理失败后的业务逻辑（如果需要）
    // 例如：重置表单、停止 loading 等
  }
}
```

**❌ 错误示例：**

```javascript
async function handleSubmit() {
  try {
    await createGroup(formData.value)
    uni.showToast({ title: '创建成功', icon: 'success' })
  } catch (e) {
    // ❌ 错误：重复显示错误提示
    uni.showToast({
      title: e.message || '创建失败',
      icon: 'error'
    })
  }
}
```

### 3. 特殊场景处理

**场景 1：需要显示详细错误信息**

如果业务场景需要显示更详细的错误信息（如转让群主等重要操作），可以使用 `showModal` 替代 `showToast`：

```javascript
async function handleTransfer() {
  try {
    await transferOwner(data)
    uni.showToast({ title: '转让成功', icon: 'success' })
  } catch (e) {
    // ✅ 特殊场景：使用 modal 显示完整错误信息
    uni.showModal({
      title: '转让失败',
      content: e.message || '转让失败，请稍后重试',
      showCancel: false,
      confirmText: '知道了'
    })
  }
}
```

**场景 2：需要根据错误类型做不同处理**

```javascript
async function handleLogin() {
  try {
    await login(formData.value)
    uni.showToast({ title: '登录成功', icon: 'success' })
    uni.switchTab({ url: '/pages/home/index' })
  } catch (e) {
    // ✅ 根据错误类型做不同的业务处理
    if (e.message.includes('密码错误')) {
      // 清空密码输入框
      formData.value.password = ''
    } else if (e.message.includes('账号不存在')) {
      // 跳转到注册页面
      uni.navigateTo({ url: '/pagesAuth/register/index' })
    }
    // 注意：错误提示已经在 request.js 中显示，这里不需要再显示
  }
}
```

**场景 3：静默调用（不显示任何提示）**

如果某些接口调用失败时不需要显示错误提示（如轮询、预加载等），需要在 `request.js` 中添加配置支持：

```javascript
// 未来扩展：支持静默调用
export const createGroup = (data, options = {}) => {
  return http.post('/auth-service/family/group/add', data, { silent: options.silent })
}

// 使用
await createGroup(data, { silent: true })  // 失败时不显示错误提示
```

### 4. Loading 状态管理

**推荐模式：**

```javascript
const isLoading = ref(false)

async function handleSubmit() {
  if (isLoading.value) return  // 防止重复提交
  isLoading.value = true

  try {
    await createGroup(formData.value)
    uni.showToast({ title: '创建成功', icon: 'success' })
    // 成功后的业务处理
  } catch (e) {
    // 失败后的业务处理（如果需要）
  } finally {
    isLoading.value = false  // 确保 loading 状态被重置
  }
}
```

### 5. 总结

**核心原则：**
1. ✅ **成功提示**：业务代码负责显示
2. ❌ **失败提示**：`request.js` 统一处理，业务代码不显示
3. ✅ **业务逻辑**：业务代码负责处理成功/失败后的逻辑走向

**好处：**
- 避免重复显示错误提示
- 统一错误提示样式和交互
- 业务代码更简洁，专注于业务逻辑
- 便于统一修改错误提示行为（如改为 modal、添加错误日志等）

**检查清单：**
- [ ] 接口调用成功后，是否显示了成功提示？
- [ ] 接口调用失败后，是否**没有**显示错误提示？
- [ ] 是否使用了 `finally` 确保 loading 状态被重置？
- [ ] 是否处理了失败后的业务逻辑（如清空表单、停止轮询等）？

---

## 其他开发规范

### 路由跳转规范

**成功操作后的路由处理：**

对于创建、加入等操作成功后，需要清除中间页面，避免页面缓存问题：

```javascript
// 获取当前页面栈
const pages = getCurrentPages()
const delta = pages.length - 1

if (delta > 0) {
  // 返回到第一个页面
  uni.navigateBack({
    delta: delta,
    success: () => {
      // 跳转到目标页面
      setTimeout(() => {
        uni.navigateTo({ url: '/target/page' })
      }, 100)
    }
  })
} else {
  // 如果已经是第一个页面，直接跳转
  uni.redirectTo({ url: '/target/page' })
}
```

---

*最后更新：2024-03-10*
