"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  const _easycom_uni_section2 = common_vendor.resolveComponent("uni-section");
  const _easycom_uni_grid_item2 = common_vendor.resolveComponent("uni-grid-item");
  const _easycom_uni_grid2 = common_vendor.resolveComponent("uni-grid");
  (_easycom_uni_datetime_picker2 + _easycom_uni_forms_item2 + _easycom_uni_data_checkbox2 + _easycom_uni_easyinput2 + _easycom_uni_forms2 + _easycom_uni_section2 + _easycom_uni_grid_item2 + _easycom_uni_grid2)();
}
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
const _easycom_uni_section = () => "../../uni_modules/uni-section/components/uni-section/uni-section.js";
const _easycom_uni_grid_item = () => "../../uni_modules/uni-grid/components/uni-grid-item/uni-grid-item.js";
const _easycom_uni_grid = () => "../../uni_modules/uni-grid/components/uni-grid/uni-grid.js";
if (!Math) {
  (_easycom_uni_datetime_picker + _easycom_uni_forms_item + _easycom_uni_data_checkbox + _easycom_uni_easyinput + _easycom_uni_forms + _easycom_uni_section + _easycom_uni_grid_item + _easycom_uni_grid)();
}
const _sfc_main = {
  __name: "meal-add",
  setup(__props) {
    const nowDate = common_vendor.ref();
    const formData = common_vendor.ref({
      "mealDate": /* @__PURE__ */ new Date(),
      "mealTime": "0",
      "diners": "0",
      "remark": "",
      "mealMenuList": [
        {
          "dishesUrl": "https://itwray-bucket.oss-cn-wuhan-lr.aliyuncs.com/img/20240419173545.png",
          "dishesName": "菜1"
        },
        {
          "dishesUrl": "https://itwray-bucket.oss-cn-wuhan-lr.aliyuncs.com/img/20240419173545.png",
          "dishesName": "菜2"
        },
        {
          "dishesName": "菜3"
        },
        {
          "dishesUrl": "https://itwray-bucket.oss-cn-wuhan-lr.aliyuncs.com/img/20240419173545.png",
          "dishesName": "菜4"
        },
        {
          "dishesUrl": "https://itwray-bucket.oss-cn-wuhan-lr.aliyuncs.com/img/20240419173545.png",
          "dishesName": "菜5"
        }
      ]
    });
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
    const rules = common_vendor.ref({
      mealDate: {
        rules: [{
          required: true,
          errorMessage: "用餐日期不能为空"
        }]
      },
      dinners: {
        rules: [{
          required: true,
          errorMessage: "用餐人数不能为空"
        }, {
          format: "number",
          errorMessage: "用餐人数只能输入数字"
        }]
      }
    });
    common_vendor.onMounted(() => {
      nowDate.value = getDate();
    });
    function getDate() {
      const date = /* @__PURE__ */ new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      month = month > 9 ? month : "0" + month;
      day = day > 9 ? day : "0" + day;
      return `${year}-${month}-${day}`;
    }
    function formSubmit() {
      console.log(formData.value.mealDate);
    }
    function formReset(e) {
      console.log("清空数据");
    }
    function dishesChange(e) {
      console.log(e);
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => formData.value.mealDate = $event),
        b: common_vendor.p({
          type: "date",
          ["return-type"]: "date",
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
        m: common_vendor.sr("baseForm", "6008f3be-1,6008f3be-0"),
        n: common_vendor.p({
          rules: rules.value,
          modelValue: formData.value
        }),
        o: common_vendor.p({
          title: "基础信息"
        }),
        p: common_vendor.f(formData.value.mealMenuList, (item, index, i0) => {
          return common_vendor.e({
            a: item.dishesUrl != void 0 && item.dishesUrl != ""
          }, item.dishesUrl != void 0 && item.dishesUrl != "" ? {
            b: item.dishesUrl
          } : {}, {
            c: common_vendor.t(item.dishesName),
            d: index,
            e: "6008f3be-12-" + i0 + ",6008f3be-11",
            f: common_vendor.p({
              index
            })
          });
        }),
        q: common_vendor.o(dishesChange),
        r: common_vendor.p({
          column: 4,
          highlight: true
        }),
        s: common_vendor.p({
          title: "菜品信息"
        }),
        t: common_vendor.o(($event) => formSubmit()),
        v: common_vendor.o(($event) => formReset())
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "/Users/wangfarui/workspaces/wfr/iw-mixes-eat-app/pages/meal/meal-add.vue"]]);
wx.createPage(MiniProgramPage);
