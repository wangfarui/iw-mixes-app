import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import * as Pinia from 'pinia';

// 引入 uCharts 组件
import qiunDataCharts from './uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue'

export function createApp() {
  const app = createSSRApp(App)
  app.use(Pinia.createPinia())
  
  // 注册 uCharts 组件
  app.component('qiun-data-charts', qiunDataCharts)
  
  return {
    app,
    Pinia
  }
}
// #endif