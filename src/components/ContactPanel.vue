<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { siteProfile } from '@/data/projects'
import { createRevealTrigger, gsap, splitReveal, useGSAPContext } from '@/composables/useGSAP'

const root = ref(null)
const title = ref(null)
const { add } = useGSAPContext(root)
const cleanups = []
const currentYear = new Date().getFullYear()

onMounted(() => {
  add(() => {
    const intro = gsap.timeline({
      scrollTrigger: createRevealTrigger(root.value),
    })

    cleanups.push(splitReveal(title.value, intro, { position: 0 }))

    intro.from('[data-contact-item]', {
      y: 26,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.72,
      ease: 'power3.out',
    }, 0.12)
  })
})

onBeforeUnmount(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup?.())
})
</script>

<template>
  <section id="contact" ref="root" class="contact-panel page-block" data-page-intro>
    <p class="s-label" data-contact-item>{{ siteProfile.contact.eyebrow }}</p>

    <div class="contact-home__headline">
      <div>
        <p class="contact-home__overline" data-contact-item>{{ siteProfile.contact.overline }}</p>
        <h2 ref="title" class="contact-home__title">{{ siteProfile.contact.title }}</h2>
      </div>
    </div>

    <div class="contact-home__footer" data-contact-item>
      <div class="contact-home__meta">
        <a class="contact-home__email" :href="`mailto:${siteProfile.contact.email}`">{{ siteProfile.contact.email }}</a>
        <p>{{ siteProfile.location }}</p>
      </div>

      <div class="contact-home__links">
        <a v-for="link in siteProfile.contact.links" :key="link.label" :href="link.href">{{ link.label }}</a>
      </div>
    </div>

    <p class="contact-home__copy" data-contact-item>© {{ currentYear }} {{ siteProfile.name }} · {{ siteProfile.role }}</p>
  </section>
</template>