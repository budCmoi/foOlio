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
  add(() => {
    if (isReducedMotion()) {
      gsap.set('.scroll-hint', { autoAlpha: 1 })
      return
    }

    gsap.timeline({
      defaults: {
        ease: 'power3.out',
      },
    })
      .from('.hero-eyebrow span', {
        y: '110%',
        duration: 0.72,
      })
      .from('.hero-title .tl span', {
        y: '110%',
        stagger: 0.1,
        duration: 0.96,
      }, 0.06)
      .from('.hero-desc span', {
        y: 18,
        autoAlpha: 0,
        duration: 0.62,
      }, 0.26)
      .from('.hero-right .pill', {
        x: 24,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.46,
      }, 0.34)
      .to('.scroll-hint', {
        autoAlpha: 1,
        duration: 0.4,
      }, 0.84)
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

    <button class="scroll-hint" type="button" aria-label="Defiler vers les projets" data-cursor="Scroll" @click="scrollToWork">
      <span class="sh-line" aria-hidden="true"></span>
      <span>Scroll</span>
    </button>
  </section>
</template>