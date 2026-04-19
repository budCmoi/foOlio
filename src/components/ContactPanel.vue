<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import MagneticLink from '@/components/MagneticLink.vue'
import { siteProfile } from '@/data/projects'
import { createRevealTrigger, gsap, splitReveal, useGSAPContext } from '@/composables/useGSAP'

const root = ref(null)
const title = ref(null)
const { add } = useGSAPContext(root)
const cleanups = []

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
    <p class="section-tag" data-contact-item>{{ siteProfile.contact.eyebrow }}</p>

    <div class="contact-panel__hero">
      <div>
        <p class="contact-panel__overline" data-contact-item>{{ siteProfile.contact.overline }}</p>
        <h2 ref="title" class="contact-panel__title">{{ siteProfile.contact.title }}</h2>
      </div>
    </div>

    <div class="contact-panel__grid" data-contact-item>
      <div class="contact-panel__mail">
        <div>
          <MagneticLink class="button button--primary contact-panel__mail-button" :href="`mailto:${siteProfile.contact.email}`" cursor="Email">
            {{ siteProfile.contact.email }}
          </MagneticLink>
          <span>{{ siteProfile.location }}</span>
        </div>
      </div>

      <div class="contact-panel__links">
        <a v-for="link in siteProfile.contact.links" :key="link.label" :href="link.href">
          {{ link.label }}
        </a>
      </div>
    </div>

    <p class="contact-panel__footer" data-contact-item>© 2026 Mohamed Ali · {{ siteProfile.role }}</p>
  </section>
</template>