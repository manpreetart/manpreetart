<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { projects } from '../content'
import VimeoPlayer from '../components/VimeoPlayer.vue'

const route = useRoute()
const router = useRouter()

const index = computed(() => projects.findIndex((p) => p.slug === route.params.slug))
const project = computed(() => projects[index.value])

if (index.value < 0) router.replace('/')

// Go back to where you came from (keeps your scroll position in the grid);
// if the page was opened directly, go to the work grid instead.
function goBack() {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'home', hash: '#work' })
}
</script>

<template>
  <main v-if="project" class="project wrap">
    <button class="back" aria-label="Back to all work" @click="goBack" v-reveal>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" /></svg>
    </button>

    <header class="head">
      <h1 v-reveal>{{ project.title }}</h1>
      <div class="meta" v-reveal="120">
        <span class="num year">{{ project.year }}</span>
        <p class="desc">{{ project.description }}</p>
        <p v-if="project.tools" class="tools">Tools used: {{ project.tools }}</p>
      </div>
    </header>

    <figure v-for="(v, i) in project.videos" :key="v.vimeo" class="video" v-reveal="i ? 0 : 200">
      <VimeoPlayer :url="v.vimeo" :title="v.caption || project.title" />
      <figcaption v-if="v.caption">
        <span>{{ v.caption }}</span>
        <span v-if="project.videos.length > 1" class="num">{{ String(i + 1).padStart(2, '0') }}/{{ String(project.videos.length).padStart(2, '0') }}</span>
      </figcaption>
    </figure>

  </main>
</template>

<style scoped>
.project {
  padding-top: calc(var(--header-h) + clamp(48px, 9vw, 140px));
}
.back {
  display: block;
  margin-bottom: clamp(20px, 2.4vw, 36px);
  color: var(--fg);
}
.back svg {
  display: block;
  width: 32px;
  height: 32px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.5s var(--ease);
}
.back:hover svg {
  transform: translateX(-5px);
}
.head {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px var(--gap);
  align-items: end;
  margin-bottom: clamp(40px, 6vw, 88px);
}
h1 {
  grid-column: 1 / span 7;
  font-size: clamp(48px, 9.5vw, 168px);
  font-weight: 500;
  letter-spacing: -0.055em;
  line-height: 0.88;
  margin-left: -0.05em;
}
.meta {
  grid-column: 8 / -1;
  display: grid;
  gap: 14px;
}
.year {
  color: var(--muted);
}
.tools {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
  max-width: 46ch;
}
.desc {
  font-size: clamp(16px, 1.25vw, 19px);
  line-height: 1.45;
  letter-spacing: -0.01em;
  max-width: 48ch;
}

.video + .video {
  margin-top: clamp(48px, 7vw, 112px);
}
figcaption {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: baseline;
  padding-top: 18px;
  font-size: clamp(16px, 1.25vw, 19px);
  font-weight: 500;
  letter-spacing: -0.015em;
}
figcaption .num {
  color: var(--muted);
  font-weight: 400;
}


@media (max-width: 760px) {
  .back {
  display: block;
  margin-bottom: clamp(20px, 2.4vw, 36px);
  color: var(--fg);
}
.back svg {
  display: block;
  width: 32px;
  height: 32px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.5s var(--ease);
}
.back:hover svg {
  transform: translateX(-5px);
}
.head {
    grid-template-columns: 1fr;
  }
  h1,
  .meta {
    grid-column: auto;
  }
}
</style>
