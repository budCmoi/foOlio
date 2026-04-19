<script setup>
import { onMounted, ref } from 'vue'
import { siteProfile } from '@/data/projects'
import { gsap, useGSAPContext } from '@/composables/useGSAP'
import { scrollToTarget } from '@/composables/useLenis'

const root = ref(null)
const { add } = useGSAPContext(root)

function scrollToWork() {
  scrollToTarget('#work', { offset: -96, force: true })
}

onMounted(() => {
  add(() => {
    gsap.set('.hero__title-line', {
      yPercent: 112,
      autoAlpha: 0,
    })

    gsap.timeline({
      defaults: {
        ease: 'power3.out',
      },
    })
      .from('.hero__eyebrow', {
        y: 22,
        autoAlpha: 0,
        duration: 0.58,
      })
      .to('.hero__title-line', {
        yPercent: 0,
        autoAlpha: 1,
        stagger: 0.12,
        duration: 1.05,
      }, 0.06)
      .from('.hero__lead', {
        y: 36,
        autoAlpha: 0,
        duration: 0.72,
      }, 0.26)
      .from('.hero-pill', {
        y: 26,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.56,
      }, 0.38)
      .from('.hero__scroll', {
        y: 22,
        autoAlpha: 0,
        duration: 0.48,
      }, 0.46)
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