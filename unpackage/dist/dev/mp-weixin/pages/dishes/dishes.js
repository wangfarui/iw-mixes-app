"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_cart = require("../../stores/cart.js");
const api_request = require("../../api/request.js");
if (!Array) {
  const _easycom_uni_col2 = common_vendor.resolveComponent("uni-col");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_row2 = common_vendor.resolveComponent("uni-row");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_col2 + _easycom_uni_icons2 + _easycom_uni_row2 + _easycom_uni_load_more2)();
}
const _easycom_uni_col = () => "../../uni_modules/uni-row/components/uni-col/uni-col.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_row = () => "../../uni_modules/uni-row/components/uni-row/uni-row.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_col + _easycom_uni_icons + _easycom_uni_row + _easycom_uni_load_more + Cart)();
}
const Cart = () => "./cart.js";
const _sfc_main = {
  __name: "dishes",
  setup(__props) {
    const categories = common_vendor.ref([]);
    const dishesListStatus = common_vendor.ref("more");
    const triggered = common_vendor.ref(false);
    const cartStore = stores_cart.useCartStore();
    const dishesPage = common_vendor.reactive({
      pageParam: {
        currentPage: 1,
        pageSize: 10,
        dishesType: 0
      },
      list: []
    });
    const contentTextObj = {
      contentdown: "上拉显示更多",
      contentrefresh: "正在加载...",
      contentnomore: "没有更多菜品了"
    };
    categories.value = [
      {
        dishesType: 0,
        name: "全部",
        selected: true
      },
      {
        dishesType: 1,
        name: "荤菜",
        selected: false
      },
      {
        dishesType: 2,
        name: "素菜",
        selected: false
      },
      {
        dishesType: 3,
        name: "荤素搭配",
        selected: false
      }
    ];
    const categoryStyle = (category) => {
      return {
        marginBottom: "10px",
        fontSize: "16px",
        backgroundColor: category.selected ? "lightblue" : "transparent"
      };
    };
    common_vendor.onLoad(() => {
      selectCategory(0);
    });
    const fetchDishes = (dishesType) => {
      triggered.value = true;
      dishesListStatus.value = "loading";
      api_request.http.post("/dishes/page", dishesPage.pageParam).then((res) => {
        if (res.data.records && res.data.records.length == dishesPage.pageParam.pageSize) {
          dishesListStatus.value = "more";
        } else {
          dishesListStatus.value = "noMore";
        }
        dishesPage.list = [...dishesPage.list, ...res.data.records];
      }).catch((err) => {
        dishesListStatus.value = "more";
      }).finally(() => {
        triggered.value = false;
      });
    };
    const loadMoreDishes = () => {
      dishesPage.pageParam.currentPage++;
      fetchDishes();
    };
    const selectCategory = (dishesType) => {
      dishesPage.pageParam.currentPage = 1;
      dishesPage.pageParam.pageSize = 10;
      dishesPage.pageParam.dishesType = dishesType;
      dishesPage.list = [];
      categories.value.forEach((category) => {
        category.selected = category.dishesType === dishesType;
      });
      fetchDishes();
    };
    const intoDishDetail = (dishId) => {
      common_vendor.index.navigateTo({
        url: "/pages/dishes/dishes-detail?operate=edit&id=" + dishId
      });
    };
    const addToCart = (dish) => {
      cartStore.addItem(dish);
    };
    const subtractToCart = (dish) => {
      cartStore.subtractItem(dish);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(categories.value, (category, k0, i0) => {
          return {
            a: common_vendor.t(category.name),
            b: category.dishesType,
            c: common_vendor.o(($event) => selectCategory(category.dishesType), category.dishesType),
            d: common_vendor.s(categoryStyle(category))
          };
        }),
        b: common_vendor.p({
          span: 6
        }),
        c: dishesPage.list.length > 0
      }, dishesPage.list.length > 0 ? {
        d: common_vendor.f(dishesPage.list, (dish, k0, i0) => {
          return common_vendor.e({
            a: dish.dishesImage,
            b: dish.dishesName,
            c: "5c452fad-4-" + i0 + "," + ("5c452fad-3-" + i0),
            d: common_vendor.t(dish.dishesName),
            e: common_vendor.t(dish.difficultyFactor),
            f: common_vendor.t(dish.useTime),
            g: common_vendor.t(dish.prices),
            h: "5c452fad-7-" + i0 + "," + ("5c452fad-6-" + i0),
            i: common_vendor.unref(cartStore).cartItems.find((i) => i.id === dish.id)
          }, common_vendor.unref(cartStore).cartItems.find((i) => i.id === dish.id) ? {
            j: "5c452fad-9-" + i0 + "," + ("5c452fad-8-" + i0),
            k: common_vendor.p({
              type: "minus",
              size: "30"
            }),
            l: common_vendor.o(($event) => subtractToCart(dish), dish.id)
          } : {
            m: "5c452fad-10-" + i0 + "," + ("5c452fad-8-" + i0),
            n: common_vendor.p({
              type: "plus-filled",
              size: "30"
            }),
            o: common_vendor.o(($event) => addToCart(dish), dish.id)
          }, {
            p: "5c452fad-8-" + i0 + "," + ("5c452fad-6-" + i0),
            q: "5c452fad-6-" + i0 + "," + ("5c452fad-5-" + i0),
            r: "5c452fad-5-" + i0 + "," + ("5c452fad-3-" + i0),
            s: "5c452fad-3-" + i0 + ",5c452fad-2",
            t: dish.id,
            v: common_vendor.o(($event) => intoDishDetail(dish.id), dish.id)
          });
        }),
        e: common_vendor.p({
          span: 12
        }),
        f: common_vendor.p({
          span: 18
        }),
        g: common_vendor.p({
          span: 6
        }),
        h: common_vendor.p({
          span: 12
        }),
        i: common_vendor.p({
          status: dishesListStatus.value,
          contentText: contentTextObj
        })
      } : {}, {
        j: triggered.value,
        k: common_vendor.o(($event) => selectCategory(dishesPage.pageParam.dishesType)),
        l: common_vendor.o(($event) => loadMoreDishes()),
        m: common_vendor.p({
          span: 18
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "/Users/wangfarui/workspaces/wfr/iw-mixes-eat-app/pages/dishes/dishes.vue"]]);
wx.createPage(MiniProgramPage);
