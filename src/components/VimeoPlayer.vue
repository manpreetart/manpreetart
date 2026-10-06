<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Player from '@vimeo/player'
import { vimeoEmbed } from '../content'

defineProps({ url: String, title: String })

// Size the frame to the video's real aspect ratio (handles vertical and square work too).
const w = ref(16)
const h = ref(9)
const frame = ref(null)
let player

onMounted(async () => {
  player = new Player(frame.value)
  try {
    const [vw, vh] = await Promise.all([player.getVideoWidth(), player.getVideoHeight()])
    if (vw && vh) [w.value, h.value] = [vw, vh]
  } catch {}
})
onBeforeUnmount(() => player?.destroy().catch(() => {}))
</script>

<template>
  <div class="player" :class="{ tall: h > w }" :style="{ aspectRatio: `${w} / ${h}` }">
    <iframe
      ref="frame"
      :src="vimeoEmbed(url, { title: 0, byline: 0, portrait: 0, color: 'ffffff' })"
      allow="autoplay; fullscreen; picture-in-picture"
      allowfullscreen
      :title="title"
    />
  </div>
</template>

<style scoped>
.player {
  width: 100%;
  background: #111;
  transition: aspect-ratio 0.4s var(--ease);
}
.player.tall {
  width: auto;
  height: min(88svh, 1100px);
  margin-inline: auto;
}
iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
