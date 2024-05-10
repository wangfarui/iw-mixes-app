"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_cart = require("../../stores/cart.js");
const api_request = require("../../api/request.js");
if (!Array) {
  const _easycom_uni_col2 = common_vendor.resolveComponent("uni-col");
  const _easycom_uni_row2 = common_vendor.resolveComponent("uni-row");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_section2 = common_vendor.resolveComponent("uni-section");
  (_easycom_uni_col2 + _easycom_uni_row2 + _easycom_uni_icons2 + _easycom_uni_section2)();
}
const _easycom_uni_col = () => "../../uni_modules/uni-row/components/uni-col/uni-col.js";
const _easycom_uni_row = () => "../../uni_modules/uni-row/components/uni-row/uni-row.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_section = () => "../../uni_modules/uni-section/components/uni-section/uni-section.js";
if (!Math) {
  (_easycom_uni_col + _easycom_uni_row + _easycom_uni_icons + _easycom_uni_section + Cart)();
}
const Cart = () => "./cart.js";
const _sfc_main = {
  __name: "dishes-detail",
  setup(__props) {
    const cartStore = stores_cart.useCartStore();
    const dishDetail = common_vendor.ref({});
    const isEditOperate = common_vendor.ref(false);
    common_vendor.onLoad((option) => {
      if (option.operate && option.operate == "edit") {
        isEditOperate.value = true;
      }
      api_request.http.get("/dishes/detail?id=" + option.id).then((res) => {
        dishDetail.value = res.data;
      });
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: dishDetail.value.dishesImage,
        b: dishDetail.value.dishesName,
        c: common_vendor.t(dishDetail.value.dishesName),
        d: common_vendor.p({
          span: 17
        }),
        e: isEditOperate.value
      }, isEditOperate.value ? common_vendor.e({
        f: common_vendor.unref(cartStore).cartItems.find((i) => i.id === dishDetail.value.id)
      }, common_vendor.unref(cartStore).cartItems.find((i) => i.id === dishDetail.value.id) ? {
        g: common_vendor.o(($event) => common_vendor.unref(cartStore).subtractItem(dishDetail.value)),
        h: common_vendor.o(($event) => _ctx.subtractToCart(_ctx.dish))
      } : {
        i: common_vendor.o(($event) => common_vendor.unref(cartStore).addItem(dishDetail.value))
      }, {
        j: common_vendor.p({
          span: 7
        })
      }) : {}, {
        k: common_vendor.p({
          span: 5
        }),
        l: common_vendor.f(dishDetail.value.difficultyFactor, (item, index, i0) => {
          return {
            a: "ca5d90be-7-" + i0 + "," + ("ca5d90be-6-" + i0),
            b: index,
            c: "ca5d90be-6-" + i0 + ",ca5d90be-4"
          };
        }),
        m: common_vendor.p({
          type: "star-filled",
          size: "30"
        }),
        n: common_vendor.p({
          span: 2
        }),
        o: common_vendor.t(dishDetail.value.useTime),
        p: common_vendor.t(dishDetail.value.prices),
        q: common_vendor.p({
          title: "基础信息",
          type: "circle",
          titleFontSize: "18px"
        }),
        r: common_vendor.p({
          title: "所需食材",
          type: "circle",
          titleFontSize: "18px"
        }),
        s: common_vendor.p({
          title: "制作方法",
          type: "circle",
          titleFontSize: "18px"
        }),
        t: isEditOperate.value
      }, isEditOperate.value ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "/Users/wangfarui/workspaces/wfr/iw-mixes-eat-app/pages/dishes/dishes-detail.vue"]]);
wx.createPage(MiniProgramPage);
