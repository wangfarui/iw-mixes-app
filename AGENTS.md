# AGENTS.md - iw-mixes-app 历史归档项目指南

## 项目定位

`iw-mixes-app` 是 IW 系统旧 uni-app 小程序归档项目，不再作为默认开发入口。当前微信小程序迭代统一进入 `../iw-mixes-app-wx`，用户说 `wx项目`、`前端微信小程序`、`微信小程序`、`小程序` 或 `移动端` 时也默认指向 `../iw-mixes-app-wx`。

本项目只用于：

- 追溯旧 uni-app 页面、分包、样式、接口调用和状态逻辑。
- 对照迁移前交互，辅助 `../iw-mixes-app-wx` 原生微信小程序实现。
- 用户明确要求维护历史归档内容时，才进行编辑。

## 路由规则

- 新微信小程序页面、新交互、新接口调用：进入 `../iw-mixes-app-wx`。
- 后端接口、数据、权限、服务配置：进入 `../iw-mixes-server`。
- Web 管理端或用户单独说 `前端`：进入 `../iw-mixes-web-platform`。
- 只有用户明确说要查看或修改 `iw-mixes-app` 旧项目时，才在本目录操作。

## 只读参照原则

- 默认不要修改本项目代码、配置、脚本、页面或静态资源。
- 不要在本项目新增业务能力来满足当前生产需求。
- 不要把 `uni.*`、`uni_modules`、Vue SFC 写法迁入 `../iw-mixes-app-wx`。
- 读取旧实现时，要在最终说明中明确哪些结论来自归档项目，哪些改动落在新项目。

## 常见参照位置

- `pages.json`：旧页面、分包、tabBar 路由参照。
- `api`：旧请求封装和业务 API 参照。
- `stores`：旧登录态、字典、家庭组、共享范围等逻辑参照。
- `pagesBookkeeping`、`pagesEat`、`pagesPoints`、`pagesBase`、`pagesAuth`：旧业务页面参照。

## 禁止触碰

- `node_modules/`
- `unpackage/`
- `.git/`
- `config/index.js`、真实 appid、真实密钥等本地敏感配置

如果确实需要修改归档内容，先确认用户明确要求的是历史归档维护，而不是微信小程序新项目需求。
