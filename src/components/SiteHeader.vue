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
/*
  Floating bar: 12px from the top, left and right of the window.
  At rest the logo and nav line up with the site gutter; once the frosted
  background fades in they slide to an even inner padding all round.
*/
.header {
  --edge: 12px; /* gap to the window */
  --pad: 18px; /* inner padding, all sides */
  --h: 64px;
  position: fixed;
  top: var(--edge);
  left: var(--edge);
  right: var(--edge);
  z-index: 50;
  height: var(--h);
  padding-inline: calc(var(--gutter) - var(--edge));
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  pointer-events: none;
  /* hide quickly, no delay */
  transition: padding 0.35s ease;
}
.header::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: 16px;
  background: rgba(10, 10, 10, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
  opacity: 0;
  transform: translateY(-6px) scale(0.985);
  transition: opacity 0.35s ease, transform 0.35s ease;
}
/* show: short delay, then a slow settle */
.header.on {
  padding-inline: var(--pad);
  transition: padding 0.9s var(--ease) 0.25s;
}
.header.on::before {
  opacity: 1;
  transform: none;
  transition: opacity 0.9s var(--ease) 0.25s, transform 0.9s var(--ease) 0.25s;
}
.header > * {
  pointer-events: auto;
}
.mark {
  display: block;
  width: calc(var(--h) - var(--pad) * 2);
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
