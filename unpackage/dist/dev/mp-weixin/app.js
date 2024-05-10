"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/meal/meal.js";
  "./pages/dishes/dishes.js";
  "./pages/meal/meal-detail.js";
  "./pages/my/my.js";
  "./pages/login/login.js";
  "./pages/dishes/dishes-detail.js";
  "./pages/dishes/cart-confirm.js";
}
const _sfc_main = {};
const App = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "/Users/wangfarui/workspaces/wfr/iw-mixes-eat-app/App.vue"]]);
function createApp() {
  const app = common_vendor.createSSRApp(App);
  app.use(common_vendor.createPinia());
  return {
    app,
    Pinia: common_vendor.Pinia
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
