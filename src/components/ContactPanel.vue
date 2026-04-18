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
    <div class="contact-panel__surface">
      <p class="section-tag contact-panel__status" data-contact-item>
        <span class="contact-panel__status-dot" aria-hidden="true"></span>
        Disponible pour des produits web et workflows IA
      </p>
      <h2 ref="title" class="contact-panel__title">Parlons produit, frontend, full-stack et automatisation IA.</h2>
      <p class="contact-panel__copy" data-contact-item>
        Si tu veux un site qui ressemble à un produit, une app métier plus propre, un studio interne connecté à Firebase ou une couche IA bien cadrée, on peut le construire sérieusement.
      </p>
      <div class="contact-panel__actions" data-contact-item>
        <MagneticLink class="button button--primary button--light" :href="`mailto:${siteProfile.email}`" cursor="Mail">
          {{ siteProfile.email }}
        </MagneticLink>
        <MagneticLink class="button button--ghost button--light" :to="{ path: '/', hash: '#projects' }" cursor="Voir">
          Revoir les projets
        </MagneticLink>
      </div>
    </div>
  </section>
</template>