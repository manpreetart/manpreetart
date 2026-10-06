<script setup>
import { contact, asset } from '../content'
</script>

<template>
  <main class="contact wrap">
    <div class="portrait" v-reveal>
      <img :src="asset(contact.portrait)" alt="Manpreet Singh" />
    </div>

    <div class="text">
      <h1 v-reveal="80">{{ contact.title }}</h1>
      <p class="desc" v-reveal="160">{{ contact.description }}</p>

      <ul class="actions" v-reveal="240">
        <li><a :href="`mailto:${contact.email}`" class="link">{{ contact.email }}</a></li>
        <li><a :href="asset(contact.resume)" download="Manpreet-Singh-Resume.pdf" class="link">Download résumé ↓</a></li>
        <li v-for="l in contact.links" :key="l.url">
          <a :href="l.url" target="_blank" rel="noopener" class="link">{{ l.label }} ↗</a>
        </li>
      </ul>
    </div>
  </main>
</template>

<style scoped>
.contact {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 40px var(--gap);
  padding-top: calc(var(--header-h) + clamp(24px, 4vw, 64px));
  align-items: start;
}
.portrait {
  grid-column: 1 / span 5;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: #151515;
}
.portrait img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.text {
  grid-column: 7 / -1;
  display: grid;
  gap: clamp(24px, 3vw, 40px);
  align-self: end;
}
h1 {
  font-size: clamp(30px, 3.6vw, 60px);
  font-weight: 500;
  letter-spacing: -0.045em;
  line-height: 1.02;
  text-wrap: balance;
}
.desc {
  color: var(--muted);
  font-size: clamp(16px, 1.25vw, 19px);
  line-height: 1.45;
  max-width: 44ch;
}
.actions {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
  font-size: clamp(16px, 1.25vw, 19px);
  font-weight: 500;
}

@media (max-width: 760px) {
  .contact {
    grid-template-columns: 1fr;
  }
  .portrait,
  .text {
    grid-column: auto;
  }
}
</style>
