import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import Lenis from '@studio-freight/lenis'
import { ScrollTrigger, gsap, isReducedMotion } from '@/composables/useGSAP'

const lenis = shallowRef(null)
let tickerCallback = null
const defaultScrollToDuration = 0.45
const defaultLenisOptions = {
  smoothWheel: false,
  smoothTouch: false,
  syncTouch: false,
  wheelMultiplier: 1,
  touchMultiplier: 1,
}

function shouldUseNativeScroll() {
  if (typeof window === 'undefined') {
    return true
  }

  return isReducedMotion()
}

function destroyLenis() {
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback)
    tickerCallback = null
  }

  lenis.value?.destroy()
  lenis.value = null
}

export function scrollToTarget(target, options = {}) {
  const { immediate = false, offset = 0, duration, force } = options

  if (lenis.value && !shouldUseNativeScroll()) {
    const lenisOptions = {
      immediate,
      offset,
    }

    if (typeof duration === 'number') {
      lenisOptions.duration = duration
    }
    else if (!immediate) {
      lenisOptions.duration = defaultScrollToDuration
    }

    if (typeof force === 'boolean') {
      lenisOptions.force = force
    }

    lenis.value.scrollTo(target, lenisOptions)
    return
  }

  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'auto' })
    return
  }

  const element = typeof target === 'string' ? document.querySelector(target) : target

  if (!element) {
    return
  }

  const top = window.scrollY + element.getBoundingClientRect().top + offset
  window.scrollTo({ top, behavior: 'auto' })
}

export function useLenis(customOptions = {}) {
  function initLenis() {
    if (shouldUseNativeScroll() || lenis.value) {
      return
    }

    lenis.value = new Lenis({
      ...defaultLenisOptions,
      ...customOptions,
    })

    lenis.value.on('scroll', ScrollTrigger.update)

    tickerCallback = (time) => {
      lenis.value?.raf(time * 1000)
    }

    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })
  }

  function startLenis() {
    lenis.value?.start()
  }

  function stopLenis() {
    lenis.value?.stop()
  }

  onMounted(() => {
    initLenis()
  })

  onBeforeUnmount(() => {
    destroyLenis()
  })

  return {
    lenis,
    startLenis,
    stopLenis,
    destroyLenis,
  }
}