<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Player from '@vimeo/player'
import { vimeoEmbed, vimeoThumb } from '../content'

const props = defineProps({ project: Object })

const loaded = ref(false)
const thumb = ref(props.project.thumbnail)
if (!thumb.value && props.project.videos[0]) vimeoThumb(props.project.videos[0].vimeo).then((t) => (thumb.value = t))

// Desktop only: the first video preloads once the card is near the viewport,
// so hovering starts it instantly and it fades in over the thumbnail.
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
const card = ref(null)
const frame = ref(null)
const preview = ref(false)
const playing = ref(false)
let player, io, hovering = false, fadeOut

onMounted(() => {
  if (!canHover || !props.project.videos[0]) return
  io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return
    io.disconnect()
    preview.value = true
    nextTick(() => {
      player = new Player(frame.value)
      // Let it start so Vimeo buffers real frames, then park it at 0 until hovered.
      const park = () => {
        player.off('playing', park)
        if (!hovering) player.pause().then(() => player.setCurrentTime(0)).catch(() => {})
      }
      player.on('playing', park)
      player.on('timeupdate', ({ seconds }) => hovering && seconds > 0 && (playing.value = true))
    })
  }, { rootMargin: '300px 0px' })
  io.observe(card.value.$el)
})

function enter() {
  hovering = true
  clearTimeout(fadeOut)
  player?.play().catch(() => {})
}
function leave() {
  hovering = false
  playing.value = false
  // Rewind after the fade so every hover starts from the top.
  fadeOut = setTimeout(() => player?.pause().then(() => player.setCurrentTime(0)).catch(() => {}), 600)
}
onBeforeUnmount(() => {
  io?.disconnect()
  clearTimeout(fadeOut)
  player?.destroy().catch(() => {})
})
</script>

<template>
  <router-link ref="card" :to="`/work/${project.slug}`" class="card" @mouseenter="enter" @mouseleave="leave">
    <div class="media">
      <img v-if="thumb" :src="thumb" :alt="project.title" loading="lazy" :class="{ in: loaded }" @load="loaded = true" />
      <div v-if="preview" class="preview" :class="{ playing }">
        <iframe
          ref="frame"
          :src="vimeoEmbed(project.videos[0].vimeo, { background: 1, quality: '540p' })"
          allow="autoplay"
          tabindex="-1"
          :title="`${project.title} preview`"
        />
      </div>
      <div class="info">
        <h2>{{ project.title }}</h2>
        <span class="num">{{ project.year }}</span>
      </div>
    </div>
    <!-- Phones: title and year sit under the tile instead of over it -->
    <div class="info-below">
      <h2>{{ project.title }}</h2>
      <span class="num">{{ project.year }}</span>
    </div>
  </router-link>
</template>

<style scoped>
.card {
  display: block;
}
.media {
  position: relative;
  overflow: hidden;
  background: #151515;
  aspect-ratio: 4 / 3;
  border-radius: 2px;
  container-type: size;
}
.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: transform 1.2s var(--ease), opacity 0.6s var(--ease);
}
.media img.in {
  opacity: 1;
}
@media (hover: hover) and (pointer: fine) {
  .card:hover .media img {
    transform: scale(1.035);
  }
}
.preview {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.6s var(--ease);
}
.preview.playing {
  opacity: 1;
}
/* Once the video has faded in, drop the thumbnail so it can never peek out underneath */
.media:has(.preview.playing) img {
  opacity: 0;
  transition: transform 1.2s var(--ease), opacity 0s linear 0.7s;
}
/* 16:9 frame that always covers the box, with a few px of bleed so sub-pixel
   rounding can't leave a hairline gap at any edge (the box clips the overflow) */
.preview iframe {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(max(100cqw, 177.78cqh) + 6px);
  height: calc(max(100cqh, 56.25cqw) + 6px);
  max-width: none;
  transform: translate(-50%, -50%);
  border: 0;
  pointer-events: none;
}
/* Title and year sit inside the tile, over a soft dark gradient, and appear on hover */
.info {
  position: absolute;
  inset: auto 0 0 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding: 72px clamp(14px, 1.4vw, 20px) clamp(14px, 1.4vw, 20px);
  color: #fff;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.55));
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.5s var(--ease), transform 0.6s var(--ease);
  pointer-events: none;
}
.card:hover .info,
.card:focus-visible .info {
  opacity: 1;
  transform: none;
}
/* No hover on touch screens, so the title is always shown there */
@media (hover: none) {
  .info {
    opacity: 1;
    transform: none;
  }
}
.info-below {
  display: none;
}
@media (max-width: 760px) {
  .info {
    display: none;
  }
  .info-below {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
    padding-top: 14px;
  }
  .info-below .num {
    color: var(--muted);
  }
}
h2 {
  font-size: clamp(17px, 1.4vw, 21px);
  font-weight: 500;
  letter-spacing: -0.02em;
}
.num {
  color: rgba(255, 255, 255, 0.7);
}
</style>
