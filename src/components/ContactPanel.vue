<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import MagneticLink from '@/components/MagneticLink.vue'
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
    <div class="contact-panel__surface">
      <p class="section-tag contact-panel__status" data-contact-item>
        <span class="contact-panel__status-dot" aria-hidden="true"></span>
        Ouvert aux missions
      </p>
      <h2 ref="title" class="contact-panel__title">Construisons une présence numérique impossible à ignorer.</h2>
      <p class="contact-panel__copy" data-contact-item>
        Du portfolio signature au microsite pensé pour un lancement, je conçois et livre des interfaces tactiles avec du mouvement, de la clarté et une vraie discipline de production.
      </p>
      <div class="contact-panel__actions" data-contact-item>
        <MagneticLink class="button button--primary button--light" href="mailto:hello@foolio.dev" cursor="Mail">
          hello@foolio.dev
        </MagneticLink>
        <MagneticLink class="button button--ghost button--light" :to="{ path: '/', hash: '#projects' }" cursor="Voir">
          Revoir les projets
        </MagneticLink>
      </div>
    </div>
  </section>
</template>