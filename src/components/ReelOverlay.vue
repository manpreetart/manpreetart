<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { vimeoEmbed } from '../content'

defineProps({ url: String })
const emit = defineEmits(['close'])

const onKey = (e) => e.key === 'Escape' && emit('close')
onMounted(() => {
  document.documentElement.style.overflow = 'hidden'
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <div class="overlay" role="dialog" aria-label="Showreel" @click.self="emit('close')">
      <button class="close link" @click="emit('close')">Close</button>
      <div class="frame">
        <iframe
          :src="vimeoEmbed(url, { autoplay: 1, title: 0, byline: 0, portrait: 0, color: 'ffffff' })"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
          title="Showreel"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: #000;
  display: grid;
  place-items: center;
  padding: var(--header-h) var(--gutter) var(--gutter);
  animation: fade 0.5s var(--ease);
}
.close {
  position: absolute;
  top: 0;
  right: var(--gutter);
  height: var(--header-h);
  font-weight: 500;
  color: #fff;
}
.frame {
  width: min(100%, calc((100svh - var(--header-h) - var(--gutter)) * 16 / 9));
  aspect-ratio: 16 / 9;
}
.frame iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
@keyframes fade {
  from {
    opacity: 0;
  }
}
</style>
