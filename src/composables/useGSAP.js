import { onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export function createRevealTrigger(trigger, options = {}) {
  return {
    trigger,
    start: 'top 84%',
    toggleActions: 'play none none none',
    ...options,
  }
}

export function isReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isMobileViewport() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches
}

export function useGSAPContext(scope) {
  const contexts = []

  function add(callback) {
    const context = gsap.context(callback, scope?.value || scope)
    contexts.push(context)
    return context
  }

  onBeforeUnmount(() => {
    contexts.reverse().forEach((context) => context.revert())
  })

  return {
    add,
  }
}

export function splitReveal(target, timeline, options = {}) {
  if (!target || !timeline) {
    return () => {}
  }

  timeline.from(target, {
    y: options.y || 18,
    autoAlpha: 0,
    duration: options.duration || 0.45,
    ease: options.ease || 'power2.out',
  }, options.position)

  return () => {}
}