# AGENTS.md - iw-mixes-app 小程序项目指南

## 项目定位

`iw-mixes-app` 是 IW 系统的移动端项目，目前主要用于微信小程序。项目覆盖首页、账单、菜单、任务、我的、登录认证、家庭组、记账、餐食、积分等移动端场景，并通过后端网关访问 `../iw-mixes` 服务。

该项目是面向用户日常使用的端，开发时优先保证页面路径、分包、请求封装、登录态、微信小程序兼容性和移动端体验。

## 技术栈

- uni-app / Vue 单文件组件。
- 目标端目前以微信小程序为主。
- npm 脚本辅助维护 manifest 和图标。
- `uni_modules` 中使用了 uni-ui 相关组件，如 `uni-forms`、`uni-popup`、`uni-icons`、`uni-list`、`uni-datetime-picker`、`uni-data-select`、`uni-search-bar` 等。
- `markdown-it` 用于 Markdown 解析相关能力。
- 状态和工具以本地 `stores`、`utils`、`api` 目录为主，未使用完整现代前端脚手架结构。

## 目录地图

- `pages.json`：页面、分包、tabBar 等小程序路由配置。新增页面必须同步注册。
- `manifest.json`：应用配置，由脚本根据本地配置更新 appid。
- `config/index.example.js`：本地小程序 appid 配置示例；实际 `config/index.js` 不应提交。
- `api`：请求封装和部分领域 API，如登录、家庭组。
- `stores`：登录态、字典、文件、家庭组、共享范围、日期工具等状态或工具模块。
- `utils`：通用工具。
- `components`：跨页面复用组件。
- `style`、`static`：全局样式、字体、菜单图标、tabbar 图标、记账图标等静态资源。
- `pages`：主包页面，如首页、账单、菜单、任务、我的。
- `pagesAuth`：登录相关页面。
- `pagesBase`：基础设置、账号、字典、个人信息、系统设置、家庭组。
- `pagesBookkeeping`：记账相关页面。
- `pagesEat`：餐食、菜品、冰箱、菜谱相关页面。
- `pagesPoints`：积分、任务计划、积分记录相关页面。
- `scripts`：更新 manifest、转换 SVG 图标等脚本。
- `unpackage`、`node_modules`：构建产物和依赖目录，不要手工修改。

## 页面与业务分包

主包 `pages` 当前包含：

- `pages/home/index`：首页聚合视图。
- `pages/bill/index`：账单。
- `pages/menu`：菜单入口。
- `pages/task/index`：任务。
- `pages/my/my`：我的。

业务分包：

- `pagesBookkeeping/bookkeeping`：快速记账、表单记账、类别设置、记账记录、详情、预算、钱包、会员订阅、月度/年度收支统计。
- `pagesEat/eat`：菜品、点餐、菜谱、冰箱食材。
- `pagesPoints/points` 和 `pagesPoints/task`：积分动作、积分记录、积分统计、任务列表、任务计划、任务编辑。
- `pagesBase/base`：字典管理、账号管理。
- `pagesBase/family`：家庭组创建、加入、详情、邀请、管理、转让。
- `pagesBase/my`：个人资料、安全、设置、关于、反馈。
- `pagesAuth/login`：登录注册入口。

新增页面时先判断是否属于已有分包，优先放入对应业务分包，避免主包膨胀。

## 请求与登录态

- 请求统一封装在 `api/request.js`。
- 后端基础地址在 `api/env.js`，本地默认是 `http://localhost:18000`，生产可切换到 `https://api.itwray.com`。
- token key 是 `iwtoken`，请求 header 也是 `iwtoken`。
- 响应约定：`code == 200` 成功，`code == 401` 登录失效并跳转 `pagesAuth/login/index`，其他 code 统一 toast。
- 登录、注册、字典刷新和字典版本轮询主要在 `api/login.js`。
- 文件上传等需要直接使用 `baseUrl` 的能力，先查看 `stores/file.js`。

后端网关路径约定：

- 认证/用户/字典/家庭组/文件：`/auth-service/...`
- 记账：`/bookkeeping-service/...`
- 餐食：`/eat-service/...`
- 积分/任务：`/points-service/...`
- 外部 API：`/external-service/...`

## 开发流程

新增小程序页面：

1. 确认业务域和分包，参考同分包已有页面命名。
2. 新建 `.vue` 页面，沿用同类页面的布局、生命周期、请求和 toast 风格。
3. 在 `pages.json` 对应 `subPackages` 或 `pages` 中注册页面路径和标题。
4. 如需要菜单入口，同步检查 `pages/menu.vue`、`static/menus`、后端网站导航或本地菜单数据来源。
5. 如需要 tabbar，检查 `pages.json` tabBar 配置和 `static/tabbar` 图标。
6. 接口调用优先沉淀到 `api`，若当前业务已有页面内直接调用风格，可先保持局部一致。
7. 涉及字典、家庭组共享范围、登录态时，同步检查 `stores` 中已有状态。

新增或调整接口联调：

1. 先确认后端 Controller 的完整网关路径。
2. 检查请求方法、query/body 参数、返回 `data` 结构。
3. 页面中只依赖 `res.data`，错误提示交给 `request.js` 统一处理，除非页面需要额外恢复 UI 状态。
4. 涉及列表分页、下拉刷新、统计图表时，注意小程序端性能和空状态。

## 样式与交互规则

- 移动端页面优先保持简洁、可点击区域充足、反馈明确。
- 图标资源优先复用 `static` 下已有业务图标和 `uni-icons`。
- 新增静态资源按业务放入 `static/menus`、`static/tabbar`、`static/bookkeeping` 等已有目录。
- 避免把大段业务逻辑堆在模板中，复杂转换放到 script 的方法或 computed 中。
- 注意微信小程序兼容性，不随意引入浏览器专属 API。
- 分包页面互相跳转使用 uni-app 路由 API，并确认路径以 `/` 开头。

## 脚本与配置

常用脚本：

```bash
npm run update-manifest
npm run update-icons
```

`package.json` 定义了：

- `predev`：开发前运行 `update-manifest`。
- `prebuild`：构建前运行 `update-manifest`。

配置规则：

- 复制 `config/index.example.js` 为 `config/index.js` 后填写真实 appid。
- 不要提交真实 `config/index.js` 和包含本地敏感 appid 的 `manifest.json` 变更，除非用户明确要求。
- 修改 `manifest.json` 前先确认是否应通过脚本生成。

## AI 开发约定

- 先读本文件，再读根目录 `../AGENTS.md` 了解三端关系。
- 不要修改 `node_modules/`、`unpackage/`、构建缓存、真实本地配置。
- 新增页面必须检查 `pages.json`，否则小程序无法访问。
- 新增接口调用必须和 `../iw-mixes` 的网关路径一致。
- 涉及 Web 平台也有相同业务能力时，检查 `../iw-mixes-web-platform/src/api` 和 `src/views`，保持字段语义一致。
- 页面改动后，至少做语法和路径检查；能启动时再用 HBuilderX 或微信开发者工具验证。
- 不要把后端返回结构猜死，先看同模块已有页面如何读取 `res.data`。

