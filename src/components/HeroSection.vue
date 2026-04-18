<script setup>
import anime from 'animejs/lib/anime.es.js'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import MagneticLink from '@/components/MagneticLink.vue'
import { siteProfile } from '@/data/projects'
import { gsap, isMobileViewport, isReducedMotion, splitReveal, useGSAPContext } from '@/composables/useGSAP'

const root = ref(null)
const title = ref(null)
const visual = ref(null)
const { add } = useGSAPContext(root)
const cleanups = []
const heroCardAnimations = []

function stopHeroCardAnimations() {
  heroCardAnimations.splice(0).forEach((animation) => animation.pause())

  if (root.value) {
    anime.remove(root.value.querySelectorAll('.hero-card'))
  }
}

function startHeroCardAnimations() {
  if (!root.value) {
    return
  }

  stopHeroCardAnimations()

  const primaryCard = root.value.querySelector('.hero-card--primary')
  const accentCard = root.value.querySelector('.hero-card--accent')
  const ghostCard = root.value.querySelector('.hero-card--ghost')

  if (!primaryCard || !accentCard || !ghostCard) {
    return
  }

  heroCardAnimations.push(
    anime({
      targets: primaryCard,
      translateY: [-10, 10],
      rotate: [-1.4, 0.8],
      duration: 5600,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true,
    }),
    anime({
      targets: accentCard,
      translateX: [-6, 8],
      translateY: [-16, 8],
      rotate: [1.2, -1.6],
      duration: 4700,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true,
    }),
    anime({
      targets: ghostCard,
      translateX: [8, -7],
      translateY: [-9, 11],
      rotate: [-0.9, 1.1],
      duration: 6200,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true,
    }),
  )
}

onMounted(() => {
  add(() => {
    const prefersReducedMotion = isReducedMotion()
    const compactViewport = isMobileViewport()

    const intro = gsap.timeline({
      defaults: {
        ease: 'expo.out',
      },
    })

    gsap.set('.hero__visual', {
      transformPerspective: 1400,
      transformStyle: 'preserve-3d',
    })

    gsap.set('.hero-card', {
      transformPerspective: 1200,
      transformOrigin: '50% 100%',
      willChange: 'transform, opacity',
    })

    cleanups.push(splitReveal(title.value, intro, {
      position: 0.08,
      duration: 1.22,
      stagger: 0.1,
      ease: 'expo.out',
    }))

    intro
      .from('.hero__copy', {
        y: 24,
        autoAlpha: 0,
        filter: 'blur(10px)',
        duration: 1,
        clearProps: 'filter',
      }, 0)
      .from('[data-hero-fade]', {
        y: 34,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.9,
      }, 0.16)
      .from('.hero__visual', {
        y: 54,
        autoAlpha: 0,
        rotateX: 10,
        scale: 0.96,
        transformOrigin: '50% 100%',
        duration: 1.12,
      }, 0.12)
      .from('.hero-card', {
        y: 54,
        rotateX: 12,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 1,
      }, 0.28)
      .from('.hero__orb', {
        scaleX: 0.4,
        scaleY: 0.4,
        autoAlpha: 0,
        filter: 'blur(18px)',
        duration: 1.35,
        clearProps: 'filter',
      }, 0.05)

    intro.call(() => {
      if (!prefersReducedMotion) {
        startHeroCardAnimations()
      }
    })

    if (prefersReducedMotion) {
      return
    }

    gsap.to('.hero__orb', {
      yPercent: -12,
      xPercent: 6,
      scale: 1.08,
      rotate: 8,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    cleanups.push(stopHeroCardAnimations)

    if (!compactViewport && visual.value) {
      const rotateXTo = gsap.quickTo(visual.value, 'rotateX', {
        duration: 0.8,
        ease: 'power3.out',
      })
      const rotateYTo = gsap.quickTo(visual.value, 'rotateY', {
        duration: 0.8,
        ease: 'power3.out',
      })
      const xTo = gsap.quickTo(visual.value, 'x', {
        duration: 0.9,
        ease: 'power3.out',
      })
      const yTo = gsap.quickTo(visual.value, 'y', {
        duration: 0.9,
        ease: 'power3.out',
      })
      const orbXTo = gsap.quickTo('.hero__orb', 'x', {
        duration: 1.1,
        ease: 'power3.out',
      })
      const orbYTo = gsap.quickTo('.hero__orb', 'y', {
        duration: 1.1,
        ease: 'power3.out',
      })

      const handlePointerMove = (event) => {
        const bounds = visual.value.getBoundingClientRect()
        const xRatio = ((event.clientX - bounds.left) / bounds.width) - 0.5
        const yRatio = ((event.clientY - bounds.top) / bounds.height) - 0.5

        rotateXTo(yRatio * -8)
        rotateYTo(xRatio * 10)
        xTo(xRatio * 12)
        yTo(yRatio * 10)
        orbXTo(xRatio * 28)
        orbYTo(yRatio * 22)
      }

      const handlePointerLeave = () => {
        rotateXTo(0)
        rotateYTo(0)
        xTo(0)
        yTo(0)
        orbXTo(0)
        orbYTo(0)
      }

      visual.value.addEventListener('pointermove', handlePointerMove)
      visual.value.addEventListener('pointerleave', handlePointerLeave)
      cleanups.push(() => {
        visual.value?.removeEventListener('pointermove', handlePointerMove)
        visual.value?.removeEventListener('pointerleave', handlePointerLeave)
        handlePointerLeave()
      })
    }
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
        <h1 ref="title" class="hero__title">Je conçois des systèmes digitaux ambitieux, du web au jeu vidéo, avec une IA native à chaque couche.</h1>
        <p class="hero__lead" data-hero-fade>
          {{ siteProfile.intro }}
        </p>

        <div class="hero__actions" data-hero-fade>
          <MagneticLink class="button button--primary" :to="{ path: '/', hash: '#projects' }" cursor="Voir">
            Voir les projets
          </MagneticLink>
          <MagneticLink class="button button--secondary" :to="{ path: '/', hash: '#contact' }" cursor="Contact">
            Me contacter
          </MagneticLink>
        </div>
      </div>

      <div ref="visual" class="hero__visual">
        <div class="hero__orb" aria-hidden="true"></div>

        <article class="hero-card hero-card--primary">
          <span>01</span>
          <strong>Solutions lisibles</strong>
          <p>Web, mobile ou jeu : j'organise l'interface pour résoudre un besoin clairement, sans bruit inutile.</p>
        </article>

        <article class="hero-card hero-card--accent">
          <span>02</span>
          <strong>Systèmes complets</strong>
          <p>Frontend, backend, données, outils internes et delivery sont pensés comme une seule solution solide.</p>
        </article>

        <article class="hero-card hero-card--ghost">
          <span>03</span>
          <strong>IA partout dans la chaîne</strong>
          <p>Conception, génération, recherche, automatisation, enrichissement et assistants : l'IA traverse tout le système.</p>
        </article>
      </div>
    </div>
  </section>
</template>