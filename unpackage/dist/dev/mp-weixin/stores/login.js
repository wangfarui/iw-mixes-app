"use strict";
const common_vendor = require("../common/vendor.js");
const useLoginStore = common_vendor.defineStore("login", () => {
  const loginForm = common_vendor.reactive({
    username: "",
    password: "",
    isRemeber: false
  });
  function saveAccount(account) {
    loginForm.username = account.username;
    loginForm.password = account.password;
    loginForm.isRemeber = true;
  }
  function clearAccount() {
    loginForm.username = "";
    loginForm.password = "";
    loginForm.isRemeber = false;
  }
  return { loginForm, saveAccount, clearAccount };
});
exports.useLoginStore = useLoginStore;
