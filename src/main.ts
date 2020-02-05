import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

let abc = new Vue({
  render: h => h(App),
});

abc.$mount('#app');
