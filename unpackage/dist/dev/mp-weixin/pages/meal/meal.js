"use strict";
const common_vendor = require("../../common/vendor.js");
const api_request = require("../../api/request.js");
if (!Array) {
  const _easycom_uni_row2 = common_vendor.resolveComponent("uni-row");
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  const _easycom_uni_section2 = common_vendor.resolveComponent("uni-section");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_row2 + _easycom_uni_list_item2 + _easycom_uni_list2 + _easycom_uni_section2 + _easycom_uni_load_more2)();
}
const _easycom_uni_row = () => "../../uni_modules/uni-row/components/uni-row/uni-row.js";
const _easycom_uni_list_item = () => "../../uni_modules/uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../uni_modules/uni-list/components/uni-list/uni-list.js";
const _easycom_uni_section = () => "../../uni_modules/uni-section/components/uni-section/uni-section.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_row + _easycom_uni_list_item + _easycom_uni_list + _easycom_uni_section + _easycom_uni_load_more)();
}
const _sfc_main = {
  __name: "meal",
  setup(__props) {
    const mealListStatus = common_vendor.ref("more");
    const page = common_vendor.reactive({
      dto: {
        currentPage: 1,
        pageSize: 5
      },
      list: []
    });
    common_vendor.onShow(() => {
      searchPage();
    });
    function searchPage() {
      mealListStatus.value = "loading";
      api_request.http.post("/meal/page", page.dto).then((res) => {
        const data = res.data;
        if (data.records && data.records.length > 0) {
          mealListStatus.value = "more";
        } else {
          mealListStatus.value = "noMore";
        }
        page.list = [...page.list, ...data.records];
        console.log(page.list);
      }).catch((error) => {
        mealListStatus.value = "more";
      }).finally(() => {
        common_vendor.index.stopPullDownRefresh();
      });
    }
    function associativeClick(item) {
      console.log(item);
    }
    common_vendor.onPullDownRefresh(() => {
      console.log("refresh");
      page.dto.currentPage = 1;
      page.list = [];
      searchPage();
    });
    common_vendor.onReachBottom(() => {
      page.dto.currentPage++;
      searchPage();
    });
    function handleMealAdd() {
      common_vendor.index.navigateTo({
        url: "/pages/meal/meal-add"
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(handleMealAdd),
        b: common_vendor.f(page.list, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.mealDate),
            b: "7266c54d-3-" + i0 + "," + ("7266c54d-2-" + i0),
            c: common_vendor.t(item.mealTime),
            d: "7266c54d-4-" + i0 + "," + ("7266c54d-2-" + i0),
            e: common_vendor.t(item.diners),
            f: "7266c54d-5-" + i0 + "," + ("7266c54d-2-" + i0),
            g: common_vendor.t(item.remark),
            h: "7266c54d-6-" + i0 + "," + ("7266c54d-2-" + i0),
            i: item.id,
            j: common_vendor.o(($event) => associativeClick(item), item.id),
            k: "7266c54d-2-" + i0 + ",7266c54d-1"
          };
        }),
        c: common_vendor.p({
          ellipsis: 0,
          title: "测试标题",
          clickable: true
        }),
        d: common_vendor.p({
          title: "点餐记录",
          type: "line"
        }),
        e: common_vendor.p({
          status: mealListStatus.value
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "/Users/wangfarui/workspaces/wfr/iw-mixes-eat-app/pages/meal/meal.vue"]]);
wx.createPage(MiniProgramPage);
