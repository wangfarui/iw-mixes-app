"use strict";
const common_vendor = require("../../common/vendor.js");
const api_request = require("../../api/request.js");
if (!Array) {
  const _easycom_uni_row2 = common_vendor.resolveComponent("uni-row");
  const _easycom_uni_section2 = common_vendor.resolveComponent("uni-section");
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_row2 + _easycom_uni_section2 + _easycom_uni_popup_dialog2 + _easycom_uni_popup2)();
}
const _easycom_uni_row = () => "../../uni_modules/uni-row/components/uni-row/uni-row.js";
const _easycom_uni_section = () => "../../uni_modules/uni-section/components/uni-section/uni-section.js";
const _easycom_uni_popup_dialog = () => "../../uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_row + _easycom_uni_section + _easycom_uni_popup_dialog + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "meal-detail",
  setup(__props) {
    const mealDetail = common_vendor.ref({});
    const alertDialog = common_vendor.ref(null);
    common_vendor.onLoad((option) => {
      api_request.http.get("/meal/detail?id=" + option.id).then((res) => {
        mealDetail.value = res.data;
      });
    });
    const intoDishDetail = (dishId) => {
      common_vendor.index.navigateTo({
        url: "/pages/dishes/dishes-detail?id=" + dishId
      });
    };
    const deleteMeal = () => {
      alertDialog.value.open();
    };
    function dialogConfirm() {
      api_request.http.delete("/meal/delete?id=" + mealDetail.value.id).then((res) => {
        common_vendor.index.switchTab({
          url: "/pages/meal/meal"
        });
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(mealDetail.value.mealDate),
        b: common_vendor.t(mealDetail.value.mealTimeDesc),
        c: common_vendor.t(mealDetail.value.diners),
        d: common_vendor.t(mealDetail.value.remark),
        e: common_vendor.p({
          title: "基础信息",
          titleFontSize: "16px"
        }),
        f: mealDetail.value.mealMenuList && mealDetail.value.mealMenuList.length > 0
      }, mealDetail.value.mealMenuList && mealDetail.value.mealMenuList.length > 0 ? {
        g: common_vendor.f(mealDetail.value.mealMenuList, (dish, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: common_vendor.t(dish.dishesName),
            c: "ed2be3fe-6-" + i0 + ",ed2be3fe-5",
            d: dish.id,
            e: common_vendor.o(($event) => intoDishDetail(dish.dishesId), dish.id)
          };
        })
      } : {}, {
        h: common_vendor.p({
          title: "菜品信息"
        }),
        i: common_vendor.o(($event) => dialogConfirm()),
        j: common_vendor.p({
          type: "warn",
          cancelText: "取消",
          confirmText: "确认",
          title: "提示",
          content: "确认删除订单吗"
        }),
        k: common_vendor.sr(alertDialog, "ed2be3fe-7", {
          "k": "alertDialog"
        }),
        l: common_vendor.p({
          type: "dialog"
        }),
        m: common_vendor.o(($event) => deleteMeal())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "/Users/wangfarui/workspaces/wfr/iw-mixes-eat-app/pages/meal/meal-detail.vue"]]);
wx.createPage(MiniProgramPage);
