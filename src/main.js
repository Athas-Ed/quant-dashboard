import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// GH Pages 部署后旧缓存可能引用失效分包，自动刷新可恢复页面。
if (import.meta.env.PROD) {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    window.location.reload()
  })
}

createApp(App).mount('#app')
