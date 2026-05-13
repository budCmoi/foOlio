<script setup>
import { onMounted, ref } from 'vue'
import { siteProfile } from '@/data/projects'
import { gsap, isReducedMotion, useGSAPContext } from '@/composables/useGSAP'

const root = ref(null)
const { add } = useGSAPContext(root)

onMounted(() => {
  add(() => {
    if (isReducedMotion()) return

    gsap.from('.hero-eyebrow span, .hero-title .tl span, .hero-desc span, .hero-right .pill', {
      autoAlpha: 0,
      duration: 0.4,
      ease: 'power2.out',
    })
  })
})
</script>

<template>
  <section id="hero" ref="root" class="hero page-block" data-page-intro>
    <p class="hero-eyebrow"><span>{{ siteProfile.role }}</span></p>

    <h1 class="hero-title" :aria-label="siteProfile.name">
      <span v-for="line in siteProfile.headline" :key="line" class="tl">
        <span>{{ line }}</span>
      </span>
    </h1>

    <div class="hero-bottom">
      <p class="hero-desc">
        <span>{{ siteProfile.heroIntro }}</span>
      </p>

      <div class="hero-right">
        <div
          v-for="pill in siteProfile.heroPills"
          :key="pill.label"
          class="pill"
          :class="pill.tone === 'active' ? 'available' : ''"
          :data-cursor="pill.label"
        >
          <span v-if="pill.tone === 'active'" class="pill-dot" aria-hidden="true"></span>
          <span>{{ pill.label }}</span>
        </div>
      </div>
    </div>

  </section>
</template>