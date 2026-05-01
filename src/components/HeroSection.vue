<script setup>
import { onMounted, ref } from 'vue'
import { siteProfile } from '@/data/projects'
import { gsap, isReducedMotion, useGSAPContext } from '@/composables/useGSAP'
import { scrollToTarget } from '@/composables/useLenis'

const root = ref(null)
const { add } = useGSAPContext(root)

function scrollToWork() {
  scrollToTarget('#work', { offset: -96, force: true })
}

onMounted(() => {
  if (isReducedMotion()) {
    return
  }

  add(() => {
    gsap.set('.hero__title-line', {
      yPercent: 42,
      autoAlpha: 0,
    })

    gsap.timeline({
      defaults: {
        ease: 'power2.out',
      },
    })
      .from('.hero__eyebrow', {
        y: 14,
        autoAlpha: 0,
        duration: 0.3,
      })
      .to('.hero__title-line', {
        yPercent: 0,
        autoAlpha: 1,
        stagger: 0.05,
        duration: 0.48,
      }, 0.06)
      .from('.hero__lead, .hero-pill, .hero__scroll', {
        y: 18,
        autoAlpha: 0,
        stagger: 0.04,
        duration: 0.34,
      }, 0.14)
  })
})
</script>

<template>
  <section id="hero" ref="root" class="hero page-block" data-page-intro>
    <p class="hero__eyebrow">{{ siteProfile.role }}</p>

    <h1 class="hero__title" aria-label="Mohamed Ali">
      <span v-for="line in siteProfile.headline" :key="line" class="hero__title-wrap">
        <span class="hero__title-line">{{ line }}</span>
      </span>
    </h1>

    <div class="hero__bottom">
      <div class="hero__support">
        <p class="hero__lead">{{ siteProfile.heroIntro }}</p>
      </div>

      <div class="hero-right">
        <div
            v-for="pill in siteProfile.heroPills"
            :key="pill.label"
            class="pill hero-pill"
            :class="pill.tone ? pill.tone : ''"
          >
          <span v-if="pill.tone === 'active'" class="pill-dot" aria-hidden="true"></span>
          <span class="pill-label">{{ pill.label }}</span>
        </div>
      </div>

      <button class="hero__scroll" type="button" data-cursor="Scroll" @click="scrollToWork">
        <span class="hero__scroll-line" aria-hidden="true"></span>
        <span>Scroll</span>
      </button>
    </div>
  </section>
</template>