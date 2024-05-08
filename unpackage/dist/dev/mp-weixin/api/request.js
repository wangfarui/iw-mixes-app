"use strict";
const common_vendor = require("../common/vendor.js");
const baseUrl = "https://api.itwray.com/iw-eat";
const token_key = "iwtoken";
const http = (url, method, data) => {
  const iwtoken = common_vendor.index.getStorageSync(token_key);
  console.log("iwtoken" + iwtoken);
  if (!iwtoken && !url.includes("login")) {
    common_vendor.index.reLaunch({
      url: "/pages/login/login"
    });
    return;
  }
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: baseUrl + url,
      method,
      data,
      header: {
        "iwtoken": iwtoken
      },
      success: (res) => {
        console.log("统一响应");
        console.log(res.data);
        const result = res.data;
        if (result == void 0) {
          common_vendor.index.showToast({
            icon: "exception",
            title: "数据加载异常"
          });
          return;
        }
        if (result.code == 401) {
          common_vendor.index.removeStorageSync(token_key);
          common_vendor.index.reLaunch({
            url: "/pages/login/login"
          });
          return;
        }
        if (result.code != 200) {
          common_vendor.index.showToast({
            icon: "none",
            title: result.message
          });
          return;
        }
        resolve(result);
      },
      fail: (res) => {
        console.log("请求失败");
        console.log(res);
        reject(res);
      }
    });
  });
};
class Request {
  async get(url) {
    try {
      const response = await http(url, "get", {});
      return response;
    } catch (error) {
      throw error;
    }
  }
  async post(url, data) {
    try {
      const response = await http(url, "post", data);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
const http$1 = new Request();
exports.http = http$1;
