<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Player from '@vimeo/player'
import { vimeoEmbed } from '../content'

defineProps({ url: String, title: String })

// Vimeo's own controls are off (controls=0); this component draws the only four we want:
// play/pause, timeline, volume and fullscreen.
const root = ref(null)
const frame = ref(null)

// Size the frame to the video's real aspect ratio (handles vertical and square work too).
const w = ref(16)
const h = ref(9)

const started = ref(false)
const playing = ref(false)
const time = ref(0)
const duration = ref(0)
const volume = ref(1)
const awake = ref(true)
const fullscreen = ref(false)

let player
let idle
let lastVolume = 1
let seeking = false

const progress = computed(() => (duration.value ? time.value / duration.value : 0))
const showBar = computed(() => awake.value || !playing.value)
const fmt = (s) => {
  s = Math.max(0, Math.floor(s || 0))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// Show the bar on activity, hide it again after a moment while playing.
function wake() {
  awake.value = true
  clearTimeout(idle)
  if (playing.value) idle = setTimeout(() => (awake.value = false), 2500)
}

let rewinding = false
async function rewind() {
  if (rewinding) return
  rewinding = true
  try {
    await player.pause()
    await player.setCurrentTime(0)
    time.value = 0
  } catch {}
  playing.value = false
  awake.value = true
  setTimeout(() => (rewinding = false), 600)
}

const toggle = () => (playing.value ? player.pause() : player.play()).catch(() => {})

function seek(e) {
  const t = (e.target.value / 1000) * duration.value
  time.value = t
  player.setCurrentTime(t).catch(() => {})
}

function setVolume(e) {
  const v = e.target.value / 100
  volume.value = v
  if (v > 0) lastVolume = v
  player.setVolume(v).catch(() => {})
}
function toggleMute() {
  const v = volume.value > 0 ? 0 : lastVolume || 1
  volume.value = v
  player.setVolume(v).catch(() => {})
}

// Fullscreen the whole wrapper so our bar stays; iPhone Safari only supports video fullscreen.
function toggleFullscreen() {
  const el = root.value
  if (document.fullscreenElement) return document.exitFullscreen()
  if (el.requestFullscreen) return el.requestFullscreen().catch(() => {})
  player.requestFullscreen().catch(() => {})
}
const onFsChange = () => (fullscreen.value = document.fullscreenElement === root.value)

onMounted(async () => {
  player = new Player(frame.value)
  player.on('play', () => {
    started.value = true
    playing.value = true
    wake()
  })
  player.on('pause', () => {
    playing.value = false
    awake.value = true
  })
  // Vimeo shows a "More from ..." end screen when a video finishes. Stop just short of the
  // end and rewind instead, so it never appears.
  player.on('ended', rewind)
  player.on('timeupdate', (d) => {
    if (!seeking) time.value = d.seconds
    duration.value = d.duration || duration.value
    if (d.duration && d.duration - d.seconds < 0.25 && playing.value) rewind()
  })
  player.on('volumechange', (d) => {
    volume.value = d.volume
    if (d.volume > 0) lastVolume = d.volume
  })
  document.addEventListener('fullscreenchange', onFsChange)

  try {
    const [vw, vh, d, v] = await Promise.all([player.getVideoWidth(), player.getVideoHeight(), player.getDuration(), player.getVolume()])
    if (vw && vh) [w.value, h.value] = [vw, vh]
    duration.value = d
    volume.value = v
  } catch {}
})

onBeforeUnmount(() => {
  clearTimeout(idle)
  document.removeEventListener('fullscreenchange', onFsChange)
  player?.destroy().catch(() => {})
})
</script>

<template>
  <div
    ref="root"
    class="player"
    :class="{ tall: h > w, started, playing, idle: playing && !showBar, fs: fullscreen }"
    :style="{ aspectRatio: `${w} / ${h}` }"
    @pointermove="wake"
    @pointerdown="wake"
  >
    <iframe
      ref="frame"
      :src="vimeoEmbed(url, { controls: 0, title: 0, byline: 0, portrait: 0, color: 'ffffff' })"
      allow="autoplay; fullscreen; picture-in-picture"
      :title="title"
      tabindex="-1"
    />

    <!-- Click anywhere on the picture to play / pause -->
    <button class="surface" tabindex="-1" aria-hidden="true" @click="toggle" />

    <button v-if="!started" class="big" aria-label="Play" @click="toggle">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
    </button>

    <div class="bar" :class="{ show: showBar }">
      <button class="btn" :aria-label="playing ? 'Pause' : 'Play'" @click="toggle">
        <svg v-if="!playing" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
      </button>

      <span class="time num">{{ fmt(time) }}</span>
      <input
        class="range seek"
        type="range"
        min="0"
        max="1000"
        step="1"
        aria-label="Timeline"
        :value="Math.round(progress * 1000)"
        :style="{ '--p': progress * 100 + '%' }"
        @pointerdown="seeking = true"
        @pointerup="seeking = false"
        @pointercancel="seeking = false"
        @input="seek"
      />
      <span class="time num">{{ fmt(duration) }}</span>

      <div class="vol">
        <button class="btn" :aria-label="volume > 0 ? 'Mute' : 'Unmute'" @click="toggleMute">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
            <template v-if="volume > 0">
              <path class="line" d="M15.5 9.2a4 4 0 0 1 0 5.6" />
              <path v-if="volume > 0.5" class="line" d="M18 6.7a7.5 7.5 0 0 1 0 10.6" />
            </template>
            <path v-else class="line" d="M15.5 9.5l5 5m0-5l-5 5" />
          </svg>
        </button>
        <input
          class="range volume"
          type="range"
          min="0"
          max="100"
          step="1"
          aria-label="Volume"
          :value="Math.round(volume * 100)"
          :style="{ '--p': volume * 100 + '%' }"
          @input="setVolume"
        />
      </div>

      <button class="btn" :aria-label="fullscreen ? 'Exit fullscreen' : 'Fullscreen'" @click="toggleFullscreen">
        <svg v-if="!fullscreen" viewBox="0 0 24 24" aria-hidden="true">
          <path class="line" d="M4.5 9V4.5H9M15 4.5h4.5V9M19.5 15v4.5H15M9 19.5H4.5V15" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path class="line" d="M9 4.5V9H4.5M19.5 9H15V4.5M15 19.5V15h4.5M4.5 15H9v4.5" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.player {
  position: relative;
  width: 100%;
  background: #111;
  overflow: hidden;
  color: #fff;
  transition: aspect-ratio 0.4s var(--ease);
}
.player.tall {
  width: auto;
  height: min(88svh, 1100px);
  margin-inline: auto;
}
.player.idle {
  cursor: none;
}
iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  pointer-events: none;
}
.surface {
  position: absolute;
  inset: 0;
  cursor: pointer;
}

/* Fullscreen: the wrapper fills the screen, Vimeo letterboxes the picture inside */
.player:fullscreen {
  width: 100%;
  height: 100%;
  aspect-ratio: auto;
  background: #000;
}

/* Big centre play button, before the first play */
.big {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 84px;
  height: 84px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: rgba(10, 10, 10, 0.5);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transform: translate(-50%, -50%);
  transition: background 0.4s var(--ease), color 0.4s var(--ease), transform 0.5s var(--ease);
}
.big svg {
  width: 30px;
  height: 30px;
  fill: currentColor;
  margin-left: 3px;
}
.big:hover {
  background: #fff;
  color: #000;
  transform: translate(-50%, -50%) scale(1.06);
}

/* Control bar */
.bar {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 40px clamp(12px, 1.6vw, 24px) clamp(10px, 1.2vw, 18px);
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  opacity: 0;
  transform: translateY(6px);
  pointer-events: none;
  transition: opacity 0.4s var(--ease), transform 0.4s var(--ease);
}
.bar.show {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}
.btn {
  flex: none;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  transition: background 0.3s var(--ease);
}
.btn:hover {
  background: rgba(255, 255, 255, 0.16);
}
.btn svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
}
.btn svg .line {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.time {
  flex: none;
  min-width: 2.6em;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

/* Sliders */
.range {
  --p: 0%;
  -webkit-appearance: none;
  appearance: none;
  height: 20px;
  margin: 0;
  background: transparent;
  cursor: pointer;
}
.seek {
  flex: 1;
  min-width: 0;
}
.volume {
  width: 0;
  opacity: 0;
  transition: width 0.4s var(--ease), opacity 0.3s var(--ease);
}
.range::-webkit-slider-runnable-track {
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(#fff, #fff) 0 / var(--p) 100% no-repeat, rgba(255, 255, 255, 0.28);
}
.range::-moz-range-track {
  height: 3px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.28);
}
.range::-moz-range-progress {
  height: 3px;
  border-radius: 3px;
  background: #fff;
}
.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  margin-top: -4.5px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  transform: scale(0);
  transition: transform 0.25s var(--ease);
}
.range::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  transform: scale(0);
  transition: transform 0.25s var(--ease);
}
.range:hover::-webkit-slider-thumb,
.range:focus-visible::-webkit-slider-thumb,
.range:active::-webkit-slider-thumb {
  transform: scale(1);
}
.range:hover::-moz-range-thumb,
.range:focus-visible::-moz-range-thumb,
.range:active::-moz-range-thumb {
  transform: scale(1);
}

.vol {
  flex: none;
  display: flex;
  align-items: center;
}
.vol:hover .volume,
.vol:focus-within .volume {
  width: 76px;
  opacity: 1;
  margin: 0 6px 0 2px;
}
/* On touch devices the volume is the phone's own */
@media (hover: none) {
  .vol {
    display: none;
  }
}

@media (max-width: 600px) {
  .bar {
    gap: 6px;
  }
  .time:last-of-type {
    display: none;
  }
}
</style>
