import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './views/Home.vue'
import Project from './views/Project.vue'
import Contact from './views/Contact.vue'

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// Hash history: works on GitHub Pages without any 404 redirect tricks.
export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/work/:slug', name: 'project', component: Project },
    { path: '/contact', name: 'contact', component: Contact },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  async scrollBehavior(to, from, saved) {
    // Let the outgoing page fade before jumping.
    if (from.matched.length && to.path !== from.path) await wait(260)
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 0, behavior: to.path === from.path ? 'smooth' : 'auto' }
    return { top: 0 }
  },
})
