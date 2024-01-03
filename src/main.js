import { createApp } from 'vue'
import {createPinia} from 'pinia'
import './style.css'
import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import VueLoaders from 'vue-loaders'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

const app=createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(createPinia())
app.use(VueLoaders)
app.use(Antd)
app.mount('#app')
