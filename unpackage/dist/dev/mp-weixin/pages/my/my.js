"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "my",
  setup(__props) {
    function logout() {
      common_vendor.index.removeStorageSync("iwtoken");
      common_vendor.index.reLaunch({
        url: "/pages/login/login"
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(logout)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "/Users/wangfarui/workspaces/wfr/iw-mixes-eat-app/pages/my/my.vue"]]);
wx.createPage(MiniProgramPage);
