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
        <a href="mailto:hello@foolio.dev">hello@foolio.dev</a>
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
  width: min(100%, var(--content-max, 1320px));
  margin: 0 auto;
  margin-top: auto;
  padding: 0 clamp(1rem, 3vw, 1.8rem) clamp(1.2rem, 3vw, 2rem);
  flex-shrink: 0;
}

.site-footer__inner {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) repeat(2, minmax(0, 1fr));
  gap: 1.4rem;
  align-items: end;
  padding: 1.4rem clamp(1rem, 3vw, 1.6rem);
  border: 1px solid rgba(17, 17, 13, 0.08);
  border-radius: calc(var(--radius-lg) + 0.1rem);
  background: rgba(21, 22, 16, 0.92);
  color: var(--text-inverse, #f7f2e9);
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
}

.site-footer__brand,
.site-footer__links,
.site-footer__meta {
  display: grid;
  gap: 0.55rem;
}

.site-footer__eyebrow,
.site-footer__meta span {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(247, 242, 233, 0.62);
}

.site-footer__brand h2 {
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.35rem, 2vw, 2rem);
  line-height: 0.98;
}

.site-footer__brand p,
.site-footer__links a {
  color: rgba(247, 242, 233, 0.82);
  line-height: 1.6;
}

.site-footer__links {
  justify-items: start;
}

.site-footer__links a {
  transition: color 0.25s ease, transform 0.25s ease;
}

.site-footer__links a:hover {
  color: rgba(247, 242, 233, 1);
  transform: translateX(4px);
}

.site-footer__meta {
  justify-items: end;
  text-align: right;
}

@media (max-width: 820px) {
  .site-footer__inner {
    grid-template-columns: 1fr;
  }

  .site-footer__links,
  .site-footer__meta {
    justify-items: start;
    text-align: left;
  }
}
</style>
