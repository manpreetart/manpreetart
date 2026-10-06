<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Logo from './Logo.vue'

// On the homepage the bar waits until the pinned showreel has fully expanded
// and starts scrolling away; elsewhere it appears as soon as you scroll.
const scrolled = ref(false)
function onScroll() {
  const hero = document.querySelector('.hero')
  const threshold = hero ? hero.offsetTop + hero.offsetHeight - window.innerHeight : 8
  scrolled.value = window.scrollY > threshold
}
watch(useRoute(), () => setTimeout(() => nextTick(onScroll), 300))
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="header" :class="{ on: scrolled }">
    <router-link to="/" class="mark" aria-label="Manpreet Singh, home">
      <Logo />
    </router-link>
    <nav class="nav">
      <router-link :to="{ name: 'home', hash: '#work' }" class="link">Work</router-link>
      <router-link to="/contact" class="link" :class="{ active: $route.name === 'contact' }">Contact</router-link>
    </nav>
  </header>
</template>

<style scoped>
/* Full-width bar; the frosted background fades in (after a short delay) once scrolled */
.header {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  height: var(--header-h);
  padding-inline: var(--gutter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  pointer-events: none;
}
.header::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: rgba(10, 10, 10, 0.55);
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
  opacity: 0;
  /* hide quickly, no delay */
  transition: opacity 0.35s ease;
}
/* show: short delay, then a slow fade */
.header.on::before {
  opacity: 1;
  transition: opacity 0.9s var(--ease) 0.25s;
}
.header > * {
  pointer-events: auto;
}
.mark {
  display: block;
  width: 34px;
  transition: transform 0.6s var(--ease);
}
.mark:hover {
  transform: rotate(-8deg);
}
.mark svg {
  display: block;
  width: 100%;
  height: auto;
}
.nav {
  display: flex;
  gap: 28px;
  font-weight: 500;
}
</style>
