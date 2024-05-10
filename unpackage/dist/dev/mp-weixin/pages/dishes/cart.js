"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_cart = require("../../stores/cart.js");
if (!Array) {
  const _easycom_uni_col2 = common_vendor.resolveComponent("uni-col");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_row2 = common_vendor.resolveComponent("uni-row");
  const _easycom_uni_drawer2 = common_vendor.resolveComponent("uni-drawer");
  const _easycom_uni_goods_nav2 = common_vendor.resolveComponent("uni-goods-nav");
  (_easycom_uni_col2 + _easycom_uni_icons2 + _easycom_uni_row2 + _easycom_uni_drawer2 + _easycom_uni_goods_nav2)();
}
const _easycom_uni_col = () => "../../uni_modules/uni-row/components/uni-col/uni-col.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_row = () => "../../uni_modules/uni-row/components/uni-row/uni-row.js";
const _easycom_uni_drawer = () => "../../uni_modules/uni-drawer/components/uni-drawer/uni-drawer.js";
const _easycom_uni_goods_nav = () => "../../uni_modules/uni-goods-nav/components/uni-goods-nav/uni-goods-nav.js";
if (!Math) {
  (_easycom_uni_col + _easycom_uni_icons + _easycom_uni_row + _easycom_uni_drawer + _easycom_uni_goods_nav)();
}
const _sfc_main = {
  __name: "cart",
  setup(__props) {
    const cartStore = stores_cart.useCartStore();
    const showShoppingCart = common_vendor.ref(null);
    const buttonGroup = [{
      text: "去下单",
      backgroundColor: "linear-gradient(90deg, #FE6035, #EF1224)",
      color: "#fff"
    }];
    const subtractToCart = (dish) => {
      cartStore.subtractItem(dish);
    };
    function onClick(e) {
      showShoppingCart.value.open();
    }
    function buttonClick(e) {
      common_vendor.index.navigateTo({
        url: "/pages/dishes/cart-confirm"
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(cartStore).cartItems.length > 0
      }, common_vendor.unref(cartStore).cartItems.length > 0 ? {
        b: common_vendor.t(common_vendor.unref(cartStore).cartItems.length)
      } : {}, {
        c: common_vendor.f(common_vendor.unref(cartStore).cartItems, (dish, k0, i0) => {
          return {
            a: dish.dishesImage,
            b: dish.dishesName,
            c: "522d1245-2-" + i0 + "," + ("522d1245-1-" + i0),
            d: common_vendor.t(dish.dishesName),
            e: common_vendor.t(dish.difficultyFactor),
            f: common_vendor.t(dish.useTime),
            g: common_vendor.t(dish.prices),
            h: "522d1245-5-" + i0 + "," + ("522d1245-4-" + i0),
            i: "522d1245-7-" + i0 + "," + ("522d1245-6-" + i0),
            j: common_vendor.o(($event) => subtractToCart(dish), dish.id),
            k: "522d1245-6-" + i0 + "," + ("522d1245-4-" + i0),
            l: "522d1245-4-" + i0 + "," + ("522d1245-3-" + i0),
            m: "522d1245-3-" + i0 + "," + ("522d1245-1-" + i0),
            n: "522d1245-1-" + i0 + ",522d1245-0",
            o: dish.id
          };
        }),
        d: common_vendor.p({
          span: 12
        }),
        e: common_vendor.p({
          span: 18
        }),
        f: common_vendor.p({
          type: "minus",
          size: "30"
        }),
        g: common_vendor.p({
          span: 6
        }),
        h: common_vendor.p({
          span: 12
        }),
        i: common_vendor.sr(showShoppingCart, "522d1245-0", {
          "k": "showShoppingCart"
        }),
        j: common_vendor.p({
          mode: "right",
          width: 300
        }),
        k: common_vendor.o(onClick),
        l: common_vendor.o(buttonClick),
        m: common_vendor.p({
          options: common_vendor.unref(cartStore).options,
          fill: true,
          ["button-group"]: buttonGroup
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "/Users/wangfarui/workspaces/wfr/iw-mixes-eat-app/pages/dishes/cart.vue"]]);
wx.createComponent(Component);
