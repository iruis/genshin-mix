import Vue from 'vue'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

import App from './App.vue'
import './main.scss'

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) { s = "0" + s; }
  return s;
}

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)

new Vue({
  render: h => h(App),
}).$mount('#app')
