"use strict";
const common_vendor = require("../../common/vendor.js");
const api_request = require("../../api/request.js");
const stores_login = require("../../stores/login.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_forms2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_forms)();
}
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const loginStore = stores_login.useLoginStore();
    const loginForm = common_vendor.reactive({
      username: "",
      password: "",
      isRemeber: true
    });
    common_vendor.onLoad(() => {
      loginForm.username = loginStore.loginForm.username;
      loginForm.password = loginStore.loginForm.password;
      loginForm.isRemeber = loginStore.loginForm.isRemeber;
    });
    function isRemeberChange(e) {
      const values = e.detail.value;
      if (values.includes("isRemeber")) {
        loginForm.isRemeber = true;
      } else {
        loginForm.isRemeber = false;
      }
    }
    function loginFun() {
      if (loginForm.username == void 0 || loginForm.username == "") {
        common_vendor.index.showToast({
          icon: "error",
          title: `用户名不能为空`
        });
        return;
      }
      if (loginForm.password == void 0 || loginForm.password == "") {
        common_vendor.index.showToast({
          icon: "error",
          title: `密码不能为空`
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "登录中"
      });
      api_request.http.post("/login/doLogin", loginForm).then((res) => {
        const userInfo = res.data;
        common_vendor.index.setStorageSync("iwtoken", userInfo.tokenValue);
        if (loginForm.isRemeber) {
          loginStore.saveAccount(loginForm);
        } else {
          loginStore.clearAccount();
        }
        common_vendor.index.switchTab({
          url: "/pages/meal/meal"
        });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => loginForm.username = $event),
        b: common_vendor.p({
          placeholder: "请输入用户名",
          modelValue: loginForm.username
        }),
        c: common_vendor.p({
          label: "用户名",
          required: true,
          name: "username"
        }),
        d: common_vendor.o(($event) => loginForm.password = $event),
        e: common_vendor.p({
          type: "password",
          placeholder: "请输入密码",
          modelValue: loginForm.password
        }),
        f: common_vendor.p({
          label: "密码",
          required: true,
          name: "password"
        }),
        g: loginForm.isRemeber,
        h: common_vendor.o(isRemeberChange),
        i: common_vendor.p({
          label: "",
          name: "isRemeber"
        }),
        j: common_vendor.sr("valiForm", "023b0efe-0"),
        k: common_vendor.p({
          modelValue: loginForm
        }),
        l: common_vendor.o(($event) => loginFun())
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "/Users/wangfarui/workspaces/wfr/iw-mixes-eat-app/pages/login/login.vue"]]);
wx.createPage(MiniProgramPage);
