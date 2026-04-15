<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import MagneticLink from '@/components/MagneticLink.vue'
import { siteProfile } from '@/data/projects'
import { gsap, splitReveal, useGSAPContext } from '@/composables/useGSAP'

const root = ref(null)
const title = ref(null)
const { add } = useGSAPContext(root)
const cleanups = []

onMounted(() => {
  add(() => {
    const intro = gsap.timeline({
      defaults: {
        ease: 'power3.out',
      },
    })

    cleanups.push(splitReveal(title.value, intro, { position: 0 }))

    intro
      .from('[data-hero-fade]', {
        y: 30,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.78,
      }, 0.15)
      .from('.hero-card', {
        y: 48,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.82,
      }, 0.3)
      .from('.hero__orb', {
        scaleX: 0.55,
        scaleY: 0.55,
        autoAlpha: 0,
        duration: 1.1,
      }, 0.05)

    gsap.to('.hero__orb', {
      yPercent: -10,
      xPercent: 4,
      duration: 5.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    gsap.to('.hero-card--accent', {
      yPercent: -8,
      duration: 3.6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  })
})

onBeforeUnmount(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup?.())
})
</script>

<template>
  <section ref="root" class="hero page-block" data-page-intro>
    <div class="hero__eyebrow" data-hero-fade>
      <span>{{ siteProfile.role }}</span>
      <span>{{ siteProfile.location }}</span>
    </div>

    <div class="hero__grid">
      <div class="hero__copy">
        <p class="section-tag" data-hero-fade>Portfolio 2026</p>
        <h1 ref="title" class="hero__title">Des mouvements pensés pour donner de la gravité à une présence.</h1>
        <p class="hero__lead" data-hero-fade>
          {{ siteProfile.intro }}
        </p>

        <div class="hero__actions" data-hero-fade>
          <MagneticLink class="button button--primary" :to="{ path: '/', hash: '#projects' }" cursor="Voir">
            Projets choisis
          </MagneticLink>
          <MagneticLink class="button button--secondary" :to="{ path: '/', hash: '#contact' }" cursor="Contact">
            Démarrer la conversation
          </MagneticLink>
        </div>
      </div>

      <div class="hero__visual">
        <div class="hero__orb" aria-hidden="true"></div>

        <article class="hero-card hero-card--primary">
          <span>01</span>
          <strong>Systèmes de scroll fluides</strong>
          <p>Lenis et ScrollTrigger réglés pour sembler tactiles, jamais décoratifs.</p>
        </article>

        <article class="hero-card hero-card--accent">
          <span>02</span>
          <strong>Un motion maîtrisé</strong>
          <p>Assez expressif pour paraître premium, assez discipliné pour être livré proprement.</p>
        </article>

        <article class="hero-card hero-card--ghost">
          <span>03</span>
          <strong>Le système avant le spectacle</strong>
          <p>Sections réutilisables, données dynamiques et architecture de cas évolutive.</p>
        </article>
      </div>
    </div>
  </section>
</template>