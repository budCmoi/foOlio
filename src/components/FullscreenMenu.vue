<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import MagneticLink from '@/components/MagneticLink.vue'
import { gsap } from '@/composables/useGSAP'
import { useUiState } from '@/composables/useUiState'

const ui = useUiState()
const panel = ref(null)
const menuOpen = ui.menuOpen
let activeTimeline = null

const navigation = [
  {
    label: 'Accueil',
    to: '/',
    cursor: 'Accueil',
  },
  {
    label: 'Projets',
    to: { path: '/', hash: '#projects' },
    cursor: 'Voir',
  },
  {
    label: 'Processus',
    to: { path: '/', hash: '#process' },
    cursor: 'Processus',
  },
  {
    label: 'Contact',
    to: { path: '/', hash: '#contact' },
    cursor: 'Contact',
  },
]

onMounted(() => {
  if (!panel.value) {
    return
  }

  gsap.set(panel.value, {
    autoAlpha: 0,
    pointerEvents: 'none',
    xPercent: 2,
  })
})

watch(ui.menuOpen, async (isOpen) => {
  await nextTick()

  if (!panel.value) {
    return
  }

  const items = panel.value.querySelectorAll('[data-menu-item]')
  const meta = panel.value.querySelectorAll('[data-menu-meta]')

  activeTimeline?.kill()
  gsap.killTweensOf([panel.value, items, meta])

  if (isOpen) {
    activeTimeline = gsap.timeline({ defaults: { ease: 'power4.out' } })
      .set(panel.value, { pointerEvents: 'auto' })
      .set(items, {
        autoAlpha: 0,
        x: 18,
        y: 12,
      })
      .set(meta, {
        autoAlpha: 0,
        y: 10,
      })
      .to(panel.value, {
        autoAlpha: 1,
        xPercent: 0,
        duration: 0.36,
        ease: 'power3.out',
      })
      .to(items, {
        x: 0,
        y: 0,
        autoAlpha: 1,
        stagger: 0.08,
        duration: 0.4,
      }, '-=0.1')
      .to(meta, {
        y: 0,
        autoAlpha: 1,
        stagger: 0.06,
        duration: 0.28,
      }, '-=0.24')

    return
  }

  activeTimeline = gsap.timeline({ defaults: { ease: 'power3.inOut' } })
    .to(items, {
      x: 22,
      autoAlpha: 0,
      stagger: -0.05,
      duration: 0.22,
    })
    .to(meta, {
      autoAlpha: 0,
      y: 10,
      duration: 0.18,
    }, '<')
    .to(panel.value, {
      autoAlpha: 0,
      xPercent: 2,
      duration: 0.24,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.set(panel.value, { pointerEvents: 'none' })
        gsap.set(items, { clearProps: 'all' })
        gsap.set(meta, { clearProps: 'all' })
      },
    }, '-=0.04')
}, { flush: 'post' })
</script>

<template>
  <aside id="fullscreen-menu" ref="panel" class="fullscreen-menu" :aria-hidden="!menuOpen">
    <div class="fullscreen-menu__inner">
      <nav class="fullscreen-menu__nav" aria-label="Navigation du site">
        <div v-for="item in navigation" :key="item.label" class="fullscreen-menu__link" data-menu-item>
          <MagneticLink
            class="fullscreen-menu__anchor"
            :to="item.to"
            :cursor="item.cursor"
            relaxed
            @click="ui.closeMenu"
          >
            <span>{{ item.label }}</span>
          </MagneticLink>
        </div>
      </nav>

      <!-- Meta supprimé pour simplification -->
    </div>
  </aside>
</template>