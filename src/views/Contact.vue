<script setup>
import { contact, asset } from '../content'
</script>

<template>
  <main class="contact wrap">
    <div class="portrait" v-reveal>
      <img :src="asset(contact.portrait)" alt="Manpreet Singh" />
    </div>

    <div class="text">
      <header v-reveal="80">
        <h1>{{ contact.title }}</h1>
        <p v-if="contact.role" class="role">{{ contact.role }}</p>
      </header>

      <div class="bio" v-reveal="160">
        <p v-for="(para, i) in [].concat(contact.description)" :key="i">{{ para }}</p>
      </div>

      <dl v-if="contact.toolkit" class="toolkit" v-reveal="200">
        <div v-for="t in contact.toolkit" :key="t.label">
          <dt>{{ t.label }}</dt>
          <dd>{{ t.items }}</dd>
        </div>
      </dl>

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
  gap: clamp(28px, 3vw, 44px);
  align-self: start;
  max-width: 640px;
}
h1 {
  font-size: clamp(34px, 4.4vw, 72px);
  font-weight: 500;
  letter-spacing: -0.05em;
  line-height: 0.98;
  text-wrap: balance;
}
.role {
  margin-top: 14px;
  color: var(--muted);
  font-size: clamp(16px, 1.25vw, 19px);
  letter-spacing: -0.01em;
}
.bio {
  display: grid;
  gap: 1.1em;
  font-size: clamp(16px, 1.15vw, 18px);
  line-height: 1.5;
  letter-spacing: -0.005em;
  color: rgba(236, 235, 231, 0.78);
  max-width: 56ch;
}
.toolkit {
  margin: 0;
  display: grid;
  gap: 14px;
  font-size: 15px;
  line-height: 1.45;
}
.toolkit div {
  display: grid;
  grid-template-columns: 7.5em 1fr;
  gap: 16px;
}
.toolkit dt {
  color: var(--muted);
}
.toolkit dd {
  margin: 0;
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
  .toolkit div {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
</style>
