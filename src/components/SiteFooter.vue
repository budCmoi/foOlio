<script setup>
import { siteProfile } from '@/data/projects'

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__brand">
        <p class="site-footer__eyebrow">foOlio / Portfolio</p>
        <h2>{{ siteProfile.name }}</h2>
        <p>{{ siteProfile.role }} · {{ siteProfile.location }}</p>
      </div>

      <div class="site-footer__links">
        <a :href="`mailto:${siteProfile.email}`">{{ siteProfile.email }}</a>
        <a href="/#projects">Projets</a>
        <a href="/#contact">Contact</a>
      </div>

      <div class="site-footer__meta">
        <span>© {{ currentYear }} foOlio</span>
        <span>{{ siteProfile.availability }}</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  position: relative;
  z-index: 2;
  width: 100%;
  margin-top: auto;
  padding: 0 0 0.85rem;
  flex-shrink: 0;
}

.site-footer__inner {
  width: min(100%, var(--content-max, 1320px));
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) repeat(2, minmax(0, 1fr));
  gap: 1rem;
  align-items: end;
  padding: 0.9rem clamp(1rem, 3vw, 1.8rem) 0;
  border-top: 1px solid var(--border, rgba(247, 242, 233, 0.12));
  color: var(--text, #f7f2e9);
}

.site-footer__brand,
.site-footer__links,
.site-footer__meta {
  display: grid;
  gap: 0.55rem;
}

.site-footer__eyebrow,
.site-footer__meta span {
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft, rgba(247, 242, 233, 0.62));
}

.site-footer__brand h2 {
  font-family: 'Syne', sans-serif;
  font-size: clamp(1rem, 1.4vw, 1.25rem);
  line-height: 1;
}

.site-footer__brand p,
.site-footer__links a {
  color: var(--text, rgba(247, 242, 233, 0.88));
  line-height: 1.45;
  font-size: 0.74rem;
}

.site-footer__links {
  justify-items: start;
}

.site-footer__links a {
  transition: color 0.25s ease;
}

.site-footer__links a:hover {
  color: var(--accent, #d7ff76);
}

.site-footer__meta {
  justify-items: end;
  text-align: right;
}

@media (max-width: 820px) {
  .site-footer__inner {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding-top: 0.8rem;
  }

  .site-footer__links,
  .site-footer__meta {
    justify-items: start;
    text-align: left;
  }
}
</style>
