<script setup>
import { siteProfile } from '@/data/projects'

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__brand">
        <p class="site-footer__eyebrow">Navigation secondaire</p>
        <h2>{{ siteProfile.name }}</h2>
        <p>{{ siteProfile.role }} · {{ siteProfile.location }}</p>
      </div>

      <div class="site-footer__links">
        <a :href="`mailto:${siteProfile.contact.email}`">{{ siteProfile.contact.email }}</a>
        <a href="/#work">Projets</a>
        <a href="/#contact">Contact</a>
      </div>

      <div class="site-footer__meta">
        <span>© {{ currentYear }} Mohamed Ali</span>
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
  padding: 1rem 0 0.85rem;
  flex-shrink: 0;
}

.site-footer__inner {
  width: min(100%, var(--content-max, 1320px));
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) repeat(2, minmax(0, 1fr));
  gap: 1.1rem;
  align-items: end;
  padding: 1rem clamp(1rem, 3vw, 1.8rem) 0;
  border-top: 1px solid var(--border-strong, rgba(247, 242, 233, 0.2));
  background:
    linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--brown, #6b4c35) 8%, transparent) 100%);
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
  font-size: calc(0.58rem * 0.72);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft, rgba(247, 242, 233, 0.62));
}

.site-footer__brand h2 {
  font-family: var(--font-display, 'League Spartan', sans-serif);
  font-size: clamp(calc(1rem * 0.72), calc(1.4vw * 0.72), calc(1.25rem * 0.72));
  line-height: 1;
}

.site-footer__brand p,
.site-footer__links a {
  color: var(--text, rgba(247, 242, 233, 0.88));
  line-height: 1.45;
  font-size: calc(0.74rem * 0.72);
}

.site-footer__links {
  justify-items: start;
}

.site-footer__links a {
  width: fit-content;
  padding-bottom: 0.1rem;
  border-bottom: 1px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.site-footer__links a:hover {
  color: var(--text, #f7f2e9);
  border-color: color-mix(in srgb, var(--brown, #6b4c35) 60%, transparent);
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
