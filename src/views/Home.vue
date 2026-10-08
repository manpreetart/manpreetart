<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Player from '@vimeo/player'
import { projects, showreel, vimeoEmbed, vimeoThumb } from '../content'
import ProjectCard from '../components/ProjectCard.vue'

const hero = ref(null)
const frame = ref(null)
const ready = ref(false)
const muted = ref(true)
const box = ref(null)
const fullscreen = ref(false)
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
  // Pause the reel (and its sound) when it's off-screen.
  io = new IntersectionObserver(([e]) => {
    e.isIntersecting ? player.play().catch(() => {}) : player.pause().catch(() => {})
  })
  io.observe(hero.value)
  document.addEventListener('fullscreenchange', onFsChange)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  onScroll()
})

// Fullscreen the whole frame (not just the video) so the sound and exit buttons stay available.
// iPhone Safari can only fullscreen the video itself.
function toggleFullscreen() {
  if (document.fullscreenElement) return document.exitFullscreen()
  const el = box.value
  if (el?.requestFullscreen) return el.requestFullscreen().catch(() => {})
  player?.requestFullscreen().catch(() => {})
}
const onFsChange = () => (fullscreen.value = document.fullscreenElement === box.value)

// The reel autoplays muted; this switches its sound on and off.
async function toggleSound() {
  muted.value = !muted.value
  try {
    await player.setMuted(muted.value)
    if (!muted.value) {
      await player.setVolume(1)
      await player.play()
    }
  } catch {
    muted.value = true
  }
}

onBeforeUnmount(() => {
  io?.disconnect()
  cancelAnimationFrame(raf)
  document.removeEventListener('fullscreenchange', onFsChange)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  player?.destroy().catch(() => {})
})
</script>

<template>
  <main>
    <section ref="hero" class="hero">
      <div class="hero-sticky">
      <div ref="box" class="hero-frame" :class="{ fs: fullscreen }">
      <img v-if="poster" :src="poster" class="hero-poster" alt="" />
      <div class="hero-media" :class="{ ready }">
        <iframe
          ref="frame"
          :src="vimeoEmbed(showreel, { autoplay: 1, muted: 1, loop: 1, controls: 0, autopause: 0, playsinline: 1, title: 0, byline: 0, portrait: 0, quality: '1080p' })"
          allow="autoplay; fullscreen; picture-in-picture"
          title="Showreel"
          tabindex="-1"
        />
      </div>
      <div class="hero-bar">
        <h1 class="name">Manpreet Singh<span>3D &amp; Motion Design</span></h1>
        <div class="controls">
          <button class="ctl" :class="{ on: !muted }" :aria-pressed="!muted" :aria-label="muted ? 'Turn sound on' : 'Turn sound off'" @click="toggleSound">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" class="body" />
              <g class="waves">
                <path d="M15.5 9.2a4 4 0 0 1 0 5.6" />
                <path d="M18 6.7a7.5 7.5 0 0 1 0 10.6" />
              </g>
              <path class="cross" d="M15.5 9.5l5 5m0-5l-5 5" />
            </svg>
          </button>
          <button class="ctl" :aria-label="fullscreen ? 'Exit fullscreen' : 'Fullscreen'" @click="toggleFullscreen">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path v-if="!fullscreen" class="line" d="M4.5 9V4.5H9M15 4.5h4.5V9M19.5 15v4.5H15M9 19.5H4.5V15" />
              <path v-else class="line" d="M9 4.5V9H4.5M19.5 9H15V4.5M15 19.5V15h4.5M4.5 15H9v4.5" />
            </svg>
          </button>
        </div>
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
.ctl {
  flex: none;
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: background 0.4s var(--ease), color 0.4s var(--ease);
}
.ctl:hover {
  background: #fff;
  color: #000;
}
.ctl svg {
  width: 24px;
  height: 24px;
}
.ctl .line {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.controls {
  display: flex;
  gap: 10px;
}
.ctl .body {
  fill: currentColor;
}
.ctl .waves,
.ctl .cross {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
/* Muted shows a cross, sound on shows the waves */
.ctl .waves {
  opacity: 0;
  transition: opacity 0.3s var(--ease);
}
.ctl.on .waves {
  opacity: 1;
}
.ctl.on .cross {
  opacity: 0;
}
.ctl .cross {
  transition: opacity 0.3s var(--ease);
}

.work {
  padding-top: calc(var(--header-h) + 8px);
  scroll-margin-top: 0;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap);
}
@media (max-width: 1000px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Fullscreen: show the whole video, centred, with only the buttons on top */
.hero-frame.fs {
  clip-path: none;
  background: #000;
}
.hero-frame.fs .hero-poster,
.hero-frame.fs .name {
  display: none;
}
.hero-frame.fs::after {
  display: none;
}
.hero-frame.fs .hero-media iframe {
  width: min(100cqw, 177.78cqh);
  height: min(100cqh, 56.25cqw);
}
.hero-frame.fs .hero-bar {
  left: 24px;
  right: 24px;
  bottom: 24px;
  justify-content: flex-end;
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
    row-gap: 36px;
  }
}
</style>
