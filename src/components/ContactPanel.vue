<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import MagneticLink from '@/components/MagneticLink.vue'
import { siteProfile } from '@/data/projects'
import { createRevealTrigger, gsap, splitReveal, useGSAPContext } from '@/composables/useGSAP'

const root = ref(null)
const title = ref(null)
const { add } = useGSAPContext(root)
const cleanups = []
const copied = ref(false)

let copyResetTimer = 0

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(siteProfile.contact.email)
    copied.value = true

    window.clearTimeout(copyResetTimer)
    copyResetTimer = window.setTimeout(() => {
      copied.value = false
    }, 1800)
  }
  catch {
    copied.value = false
  }
}

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
  window.clearTimeout(copyResetTimer)
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

      <MagneticLink class="button button--primary" :href="`mailto:${siteProfile.contact.email}`" cursor="Email" data-contact-item>
        {{ siteProfile.contact.cta }}
      </MagneticLink>
    </div>

    <div class="contact-panel__grid" data-contact-item>
      <div class="contact-panel__mail">
        <div>
          <p>{{ siteProfile.contact.email }}</p>
          <span>{{ siteProfile.location }}</span>
        </div>

        <button class="button button--ghost" type="button" @click="copyEmail">
          {{ copied ? 'Adresse copiee' : 'Copier l email' }}
        </button>
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