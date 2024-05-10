"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_cart = require("../../stores/cart.js");
const api_request = require("../../api/request.js");
if (!Array) {
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  const _easycom_uni_section2 = common_vendor.resolveComponent("uni-section");
  const _easycom_uni_col2 = common_vendor.resolveComponent("uni-col");
  const _easycom_uni_row2 = common_vendor.resolveComponent("uni-row");
  (_easycom_uni_datetime_picker2 + _easycom_uni_forms_item2 + _easycom_uni_data_checkbox2 + _easycom_uni_easyinput2 + _easycom_uni_forms2 + _easycom_uni_section2 + _easycom_uni_col2 + _easycom_uni_row2)();
}
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
const _easycom_uni_section = () => "../../uni_modules/uni-section/components/uni-section/uni-section.js";
const _easycom_uni_col = () => "../../uni_modules/uni-row/components/uni-col/uni-col.js";
const _easycom_uni_row = () => "../../uni_modules/uni-row/components/uni-row/uni-row.js";
if (!Math) {
  (_easycom_uni_datetime_picker + _easycom_uni_forms_item + _easycom_uni_data_checkbox + _easycom_uni_easyinput + _easycom_uni_forms + _easycom_uni_section + _easycom_uni_col + _easycom_uni_row)();
}
const _sfc_main = {
  __name: "cart-confirm",
  setup(__props) {
    const cartStore = stores_cart.useCartStore();
    const formData = common_vendor.ref({});
    initFormData();
    const mealTimeArray = common_vendor.ref([{
      text: "任意时间",
      value: 0
    }, {
      text: "早餐",
      value: 1
    }, {
      text: "午餐",
      value: 2
    }, {
      text: "晚餐",
      value: 3
    }]);
    function initFormData() {
      formData.value = {
        "mealDate": /* @__PURE__ */ new Date(),
        "mealTime": 0,
        "diners": "2",
        "remark": "",
        "mealMenuList": []
      };
    }
    function submitCartOrder() {
      if (formData.value.mealDate == void 0 || formData.value.mealDate === "") {
        common_vendor.index.showToast({
          icon: "none",
          title: `用餐日期不能为空`
        });
        return;
      }
      if (formData.value.mealTime == void 0 || formData.value.mealTime === "") {
        common_vendor.index.showToast({
          icon: "none",
          title: `用餐时间不能为空`
        });
        return;
      }
      if (!isNumberInRange(formData.value.diners)) {
        common_vendor.index.showToast({
          icon: "none",
          title: `用餐人数格式有误`
        });
        return;
      }
      formData.value.mealMenuList = [];
      if (cartStore.cartItems.length > 0) {
        cartStore.cartItems.forEach((item) => {
          formData.value.mealMenuList.push({
            "dishesId": item.id,
            "dishesName": item.dishesName
          });
        });
      }
      api_request.http.post("/meal/add", formData.value).then((res) => {
        initFormData();
        cartStore.initCart();
        common_vendor.index.switchTab({
          url: "/pages/meal/meal"
        });
      });
    }
    function isNumberInRange(str) {
      if (/^\d+$/.test(str)) {
        const num = parseInt(str, 10);
        if (num >= 0 && num < 99) {
          return true;
        }
      }
      return false;
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => formData.value.mealDate = $event),
        b: common_vendor.p({
          type: "date",
          ["return-type"]: "string",
          modelValue: formData.value.mealDate
        }),
        c: common_vendor.p({
          label: "用餐日期",
          required: true
        }),
        d: common_vendor.o(($event) => formData.value.mealTime = $event),
        e: common_vendor.p({
          localdata: mealTimeArray.value,
          modelValue: formData.value.mealTime
        }),
        f: common_vendor.p({
          label: "用餐时间",
          required: true
        }),
        g: common_vendor.o(($event) => formData.value.diners = $event),
        h: common_vendor.p({
          type: "number",
          placeholder: "请输入用餐人数",
          modelValue: formData.value.diners
        }),
        i: common_vendor.p({
          label: "用餐人数"
        }),
        j: common_vendor.o(($event) => formData.value.remark = $event),
        k: common_vendor.p({
          type: "textarea",
          placeholder: "请输入用餐备注",
          modelValue: formData.value.remark
        }),
        l: common_vendor.p({
          label: "备注"
        }),
        m: common_vendor.sr("baseForm", "3b92a490-1,3b92a490-0"),
        n: common_vendor.p({
          modelValue: formData.value,
          ["label-width"]: 100
        }),
        o: common_vendor.p({
          title: "基础信息"
        }),
        p: common_vendor.unref(cartStore).cartItems.length > 0
      }, common_vendor.unref(cartStore).cartItems.length > 0 ? {
        q: common_vendor.f(common_vendor.unref(cartStore).cartItems, (dish, k0, i0) => {
          return {
            a: dish.dishesImage,
            b: dish.dishesName,
            c: "3b92a490-12-" + i0 + "," + ("3b92a490-11-" + i0),
            d: common_vendor.t(dish.dishesName),
            e: common_vendor.t(dish.difficultyFactor),
            f: common_vendor.t(dish.useTime),
            g: common_vendor.t(dish.prices),
            h: "3b92a490-14-" + i0 + "," + ("3b92a490-13-" + i0),
            i: "3b92a490-13-" + i0 + "," + ("3b92a490-11-" + i0),
            j: "3b92a490-11-" + i0 + ",3b92a490-10",
            k: dish.id
          };
        }),
        r: common_vendor.p({
          span: 12
        }),
        s: common_vendor.p({
          span: 12
        })
      } : {}, {
        t: common_vendor.p({
          title: "菜品信息"
        }),
        v: common_vendor.t(common_vendor.unref(cartStore).computedDishPrices()),
        w: common_vendor.p({
          span: 8
        }),
        x: common_vendor.t(common_vendor.unref(cartStore).computedDishUseTime()),
        y: common_vendor.p({
          span: 8
        }),
        z: common_vendor.o(($event) => submitCartOrder()),
        A: common_vendor.p({
          span: 8
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "/Users/wangfarui/workspaces/wfr/iw-mixes-eat-app/pages/dishes/cart-confirm.vue"]]);
wx.createPage(MiniProgramPage);
