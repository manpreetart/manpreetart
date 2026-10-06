import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

const io = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      }
    }, { rootMargin: '0px 0px -8% 0px' })
  : null

createApp(App)
  .use(router)
  .directive('reveal', {
    mounted(el, { value }) {
      el.dataset.reveal = ''
      if (value) el.style.setProperty('--delay', `${value}ms`)
      io ? io.observe(el) : el.classList.add('is-in')
    },
    unmounted(el) {
      io?.unobserve(el)
    },
  })
  .mount('#app')
