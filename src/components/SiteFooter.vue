<script setup>
import { contact } from '../content'
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer wrap">
    <div class="row">
      <span class="muted">© {{ year }} Manpreet Singh</span>
      <nav class="social">
        <a v-for="l in contact.links" :key="l.url" :href="l.url" target="_blank" rel="noopener" class="link">{{ l.label }}</a>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding-top: clamp(80px, 10vw, 160px);
  padding-bottom: var(--gutter);
}
.row {
  padding-top: 16px;
  border-top: 1px solid var(--line);
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  justify-content: space-between;
}
.muted {
  color: var(--muted);
}
.social {
  display: flex;
  gap: 24px;
}
</style>
