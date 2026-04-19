<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import CustomCursor from '@/components/CustomCursor.vue'
import FullscreenMenu from '@/components/FullscreenMenu.vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { gsap, ScrollTrigger } from '@/composables/useGSAP'
import { scrollToTarget, useLenis } from '@/composables/useLenis'
import { findProjectById } from '@/composables/useProjects'
import { useUiState } from '@/composables/useUiState'
import { consumePendingScrollInstruction } from '@/router'

const route = useRoute()
const ui = useUiState()
const { startLenis, stopLenis } = useLenis()
const transitionVeil = ref(null)
const viewKey = computed(() => route.path)
const loaderVisible = ui.loaderVisible
const showSiteFooter = computed(() => route.name !== 'home')

const transitionLabel = computed(() => {
  if (route.name === 'project' && typeof route.params.id === 'string') {
    return findProjectById(route.params.id)?.title || 'Etude de cas'
  }

  if (route.name === 'home') {
    return 'Projets choisis'
  }

  if (route.name === 'studio-vault') {
    return 'Atelier prive'
  }

  return 'Transition'
})

watch([ui.menuOpen, ui.loaderVisible, ui.transitioning], ([isMenuOpen, isLoading, isTransitioning]) => {
  const shouldStopScroll = isMenuOpen || isLoading || isTransitioning
  const shouldLockHtml = isMenuOpen || isLoading || isTransitioning

  document.documentElement.classList.toggle('is-locked', shouldLockHtml)

  if (shouldStopScroll) {
    stopLenis()
    return
  }

  startLenis()

  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
  })
}, { immediate: true })

watch(() => route.fullPath, async () => {
  ui.closeMenu()
  ui.clearCursor()

  await applyRouteScroll()
})

onMounted(() => {
  document.documentElement.classList.remove('is-locked')
  setTransitionVeilState()
  void applyRouteScroll()
})

async function applyRouteScroll() {
  await nextTick()

  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
  })

  const pendingScroll = consumePendingScrollInstruction()
  const hashTarget = pendingScroll?.hash ?? route.hash

  if (hashTarget) {
    scrollToTarget(hashTarget, { offset: -96, force: true })
    return
  }

  if (typeof pendingScroll?.top === 'number') {
    scrollToTarget(pendingScroll.top, { immediate: true, force: true })
    return
  }

  scrollToTarget(0, { immediate: true, force: true })
}

function getTransitionNodes() {
  const panels = transitionVeil.value?.querySelectorAll('.route-transition__panel') || []
  const label = transitionVeil.value?.querySelector('.route-transition__label')

  return {
    panels,
    label,
  }
}

function setTransitionVeilState() {
  const { panels, label } = getTransitionNodes()

  if (!transitionVeil.value || panels.length < 2 || !label) {
    return
  }

  gsap.set(transitionVeil.value, {
    autoAlpha: 0,
    pointerEvents: 'none',
  })
  gsap.set(panels[0], { xPercent: -106 })
  gsap.set(panels[1], { xPercent: 106 })
  gsap.set(label, {
    autoAlpha: 0,
    y: 18,
  })
}

function createVeilInTimeline() {
  const { panels, label } = getTransitionNodes()
  const timeline = gsap.timeline({
    defaults: {
      ease: 'power4.inOut',
    },
  })

  if (!transitionVeil.value || panels.length < 2 || !label) {
    return timeline
  }

  timeline
    .set(transitionVeil.value, { autoAlpha: 1 })
    .to(panels[0], {
      xPercent: 0,
      duration: 0.82,
    }, 0)
    .to(panels[1], {
      xPercent: 0,
      duration: 0.82,
    }, 0.08)
    .to(label, {
      autoAlpha: 1,
      y: 0,
      duration: 0.28,
      ease: 'power2.out',
    }, 0.24)

  return timeline
}

function createVeilOutTimeline() {
  const { panels, label } = getTransitionNodes()
  const timeline = gsap.timeline({
    defaults: {
      ease: 'power4.inOut',
    },
  })

  if (!transitionVeil.value || panels.length < 2 || !label) {
    return timeline
  }

  timeline
    .to(label, {
      autoAlpha: 0,
      y: -18,
      duration: 0.24,
      ease: 'power2.in',
    }, 0)
    .to(panels[0], {
      xPercent: -106,
      duration: 0.96,
    }, 0.1)
    .to(panels[1], {
      xPercent: 106,
      duration: 0.96,
    }, 0.18)
    .set(transitionVeil.value, { autoAlpha: 0 }, '>-0.06')

  return timeline
}

function onBeforeEnter(element) {
  ui.setTransitioning(true)
  gsap.set(element, {
    autoAlpha: 0,
    y: 36,
    clipPath: 'inset(0% 0% 12% 0% round 1.5rem)',
  })
}

function onEnter(element, done) {
  const pageIntroNodes = element.querySelectorAll('[data-page-intro]')

  gsap.timeline({
    defaults: {
      ease: 'power3.out',
    },
    onComplete: () => {
      ui.setTransitioning(false)
      ScrollTrigger.refresh()
      done()
    },
  })
    .add(createVeilOutTimeline(), 0)
    .to(element, {
      autoAlpha: 1,
      y: 0,
      clipPath: 'inset(0% 0% 0% 0% round 0rem)',
      duration: 1.1,
    }, 0.18)

  if (pageIntroNodes.length) {
    gsap.from(pageIntroNodes, {
      y: 28,
      autoAlpha: 0,
      stagger: 0.05,
      duration: 0.7,
      delay: 0.48,
      ease: 'power3.out',
    })
  }
}

function onLeave(element, done) {
  ui.setTransitioning(true)

  gsap.timeline({
    defaults: {
      ease: 'power2.inOut',
    },
    onComplete: done,
  })
    .add(createVeilInTimeline(), 0)
    .to(element, {
      autoAlpha: 0,
      y: -24,
      duration: 0.44,
    }, 0.24)
}
</script>

<template>
  <div class="app-shell">
    <div class="app-shell__backdrop" aria-hidden="true"></div>
    <div ref="transitionVeil" class="route-transition" aria-hidden="true">
      <div class="route-transition__panel route-transition__panel--left"></div>
      <div class="route-transition__panel route-transition__panel--right"></div>
      <p class="route-transition__label">{{ transitionLabel }}</p>
    </div>
    <LoadingScreen :visible="loaderVisible" @complete="ui.completeLoading" />
    <CustomCursor />
    <AppHeader />
    <FullscreenMenu />

    <RouterView v-slot="{ Component }">
      <Transition mode="out-in" @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave">
        <component :is="Component" :key="viewKey" />
      </Transition>
    </RouterView>
    <SiteFooter v-if="showSiteFooter" />
  </div>
</template>
