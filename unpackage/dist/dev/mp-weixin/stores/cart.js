"use strict";
const common_vendor = require("../common/vendor.js");
const useCartStore = common_vendor.defineStore("cart", () => {
  const cartItems = common_vendor.ref([]);
  const options = common_vendor.ref([{
    icon: "cart",
    text: "购物车"
    // info: 0
  }]);
  function initCart() {
    cartItems.value = [];
    options.value = [{
      icon: "cart",
      text: "购物车"
      // info: 0
    }];
  }
  function computedDishPrices() {
    let prices = 0;
    cartItems.value.forEach((item) => {
      prices += item.prices;
    });
    return prices;
  }
  function computedDishUseTime() {
    let useTimes = 0;
    cartItems.value.forEach((item) => {
      useTimes += item.useTime;
    });
    return useTimes;
  }
  function addItem(item) {
    const existingItem = cartItems.value.find((i) => i.id === item.id);
    if (existingItem) {
      return;
    } else {
      updateInfo();
      cartItems.value.push({
        ...item,
        quantity: 1
      });
    }
  }
  function subtractItem(item) {
    const index = cartItems.value.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      cartItems.value.splice(index, 1);
      options.value[0].info--;
    }
  }
  function updateInfo() {
    if (options.value[0].info !== void 0) {
      options.value[0].info++;
    } else {
      options.value[0].info = 1;
    }
  }
  return {
    cartItems,
    options,
    addItem,
    subtractItem,
    computedDishPrices,
    computedDishUseTime,
    initCart
  };
});
exports.useCartStore = useCartStore;
