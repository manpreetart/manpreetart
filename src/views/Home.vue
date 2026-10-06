<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Player from '@vimeo/player'
import { projects, showreel, vimeoEmbed, vimeoThumb } from '../content'
import ProjectCard from '../components/ProjectCard.vue'
import ReelOverlay from '../components/ReelOverlay.vue'

const hero = ref(null)
const frame = ref(null)
const ready = ref(false)
const reelOpen = ref(false)
const poster = ref(null)
vimeoThumb(showreel).then((t) => (poster.value = t))
let player, io, raf

// 0 → 1 as you scroll through the hero; drives the frame opening to full bleed.
function onScroll() {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    const el = hero.value
    if (!el) return
    const range = el.offsetHeight - window.innerHeight
    const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / range))
    el.style.setProperty('--p', p.toFixed(4))
  })
}

onMounted(() => {
  player = new Player(frame.value)
  player.on('playing', () => (ready.value = true))
  // Pause the background reel when it's off-screen.
  io = new IntersectionObserver(([e]) => {
    if (reelOpen.value) return
    e.isIntersecting ? player.play().catch(() => {}) : player.pause().catch(() => {})
  })
  io.observe(hero.value)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  onScroll()
})

watch(reelOpen, (open) => (open ? player?.pause() : player?.play())?.catch(() => {}))

onBeforeUnmount(() => {
  io?.disconnect()
  cancelAnimationFrame(raf)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  player?.destroy().catch(() => {})
})
</script>

<template>
  <main>
    <section ref="hero" class="hero">
      <div class="hero-sticky">
      <div class="hero-frame">
      <img v-if="poster" :src="poster" class="hero-poster" alt="" />
      <div class="hero-media" :class="{ ready }">
        <iframe
          ref="frame"
          :src="vimeoEmbed(showreel, { background: 1, quality: '1080p' })"
          allow="autoplay; fullscreen; picture-in-picture"
          title="Showreel"
          tabindex="-1"
        />
      </div>
      <div class="hero-bar">
        <h1 class="name">Manpreet Singh<span>3D &amp; Motion Design</span></h1>
        <button class="play" @click="reelOpen = true">
          <span class="dot" aria-hidden="true" />Play reel
        </button>
      </div>
      </div>
      </div>
    </section>

    <section id="work" class="work wrap">
      <div class="grid">
        <ProjectCard
          v-for="(p, i) in projects"
          :key="p.slug"
          :project="p"
          v-reveal="(i % 3) * 100"
        />
      </div>
    </section>

    <ReelOverlay v-if="reelOpen" :url="showreel" @close="reelOpen = false" />
  </main>
</template>

<style scoped>
/*
  At rest the reel is framed by the site gutter (top clears the header).
  Scrolling through the extra height opens it to full bleed while it stays pinned.
*/
.hero {
  --p: 0;
  --q: calc(1 - var(--p));
  --top: max(var(--gutter), var(--header-h));
  --inner: clamp(20px, 2.4vw, 40px);
  height: 170vh;
  height: 170svh;
}
.hero-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh;
}
.hero-frame {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #000;
  container-type: size;
  clip-path: inset(
    calc(var(--top) * var(--q)) calc(var(--gutter) * var(--q))
    calc(var(--gutter) * var(--q)) calc(var(--gutter) * var(--q))
  );
  will-change: clip-path;
}
/* Covers the slight letterbox of the 1080p poster */
.hero-poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
  animation: fade 1.2s var(--ease);
}
@keyframes fade {
  from {
    opacity: 0;
  }
}
.hero-media {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: scale(1.04);
  transition: opacity 1.6s var(--ease), transform 2.4s var(--ease);
}
.hero-media.ready {
  opacity: 1;
  transform: none;
}
/* 16:9 iframe that always covers the frame */
.hero-media iframe {
  position: absolute;
  top: 50%;
  left: 50%;
  width: max(100cqw, 177.78cqh);
  height: max(100cqh, 56.25cqw);
  max-width: none;
  transform: translate(-50%, -50%);
  border: 0;
  pointer-events: none;
}
.hero-frame::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 40%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.55));
  pointer-events: none;
}
/* Text tracks the frame edge, landing on the site gutter at full bleed */
.hero-bar {
  position: absolute;
  left: calc(var(--gutter) + var(--inner) * var(--q));
  right: calc(var(--gutter) + var(--inner) * var(--q));
  bottom: calc(var(--gutter) + var(--inner) * var(--q));
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  color: #fff;
}
.name {
  font-size: clamp(34px, 5.6vw, 92px);
  font-weight: 500;
  letter-spacing: -0.05em;
  line-height: 0.92;
}
.name span {
  display: block;
  margin-top: 0.55em;
  font-size: 15px;
  letter-spacing: -0.005em;
  line-height: 1.2;
  opacity: 0.7;
  font-weight: 400;
}
.play {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  white-space: nowrap;
  padding: 12px 18px 12px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: background 0.4s var(--ease), color 0.4s var(--ease);
}
.play:hover {
  background: #fff;
  color: #000;
}
.dot {
  width: 0;
  height: 0;
  border-left: 8px solid currentColor;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
}

.work {
  padding-top: calc(var(--header-h) + 8px);
  scroll-margin-top: 0;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(32px, 4vw, 56px) var(--gap);
}
@media (max-width: 1000px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 760px) {
  /* Mobile: reel is full bleed from the start; no scroll-driven expansion */
  .hero {
    --q: 0;
    height: 100vh;
    height: 100svh;
  }
  .hero-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  .grid {
    grid-template-columns: 1fr;
    row-gap: 40px;
  }
}
</style>
