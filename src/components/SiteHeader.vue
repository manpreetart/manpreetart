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
    <!-- Progressive blur: stacked layers, each masked to a band, so the blur is strongest at the
         top edge and dissolves smoothly below the bar -->
    <i v-for="n in 5" :key="n" class="pb" aria-hidden="true" />
    <i class="tint" aria-hidden="true" />
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
/* Full-width bar; a progressive blur fades in (after a short delay) once scrolled */
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
/* The blur area runs past the bar so it fades out instead of ending on a hard edge */
.pb,
.tint {
  position: absolute;
  inset: 0 0 auto 0;
  height: calc(var(--header-h) + 44px);
  z-index: -1;
  opacity: 0;
  pointer-events: none;
  /* hide quickly, no delay */
  transition: opacity 0.35s ease;
}
.tint {
  background: linear-gradient(to bottom, rgba(10, 10, 10, 0.6) 0%, rgba(10, 10, 10, 0.34) 52%, rgba(10, 10, 10, 0) 100%);
}
.pb:nth-child(1) {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, transparent 40%);
  mask-image: linear-gradient(to bottom, #000 0%, transparent 40%);
}
.pb:nth-child(2) {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  -webkit-mask-image: linear-gradient(to bottom, #000 15%, transparent 55%);
  mask-image: linear-gradient(to bottom, #000 15%, transparent 55%);
}
.pb:nth-child(3) {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  -webkit-mask-image: linear-gradient(to bottom, #000 30%, transparent 70%);
  mask-image: linear-gradient(to bottom, #000 30%, transparent 70%);
}
.pb:nth-child(4) {
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  -webkit-mask-image: linear-gradient(to bottom, #000 45%, transparent 85%);
  mask-image: linear-gradient(to bottom, #000 45%, transparent 85%);
}
.pb:nth-child(5) {
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
  -webkit-mask-image: linear-gradient(to bottom, #000 60%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 60%, transparent 100%);
}
/* show: short delay, then a slow fade (the layers fade, not .header, so the blur keeps working) */
.header.on .pb,
.header.on .tint {
  opacity: 1;
  transition: opacity 0.9s var(--ease) 0.25s;
}
.header > :not(.pb):not(.tint) {
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
