import { onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export function createRevealTrigger(trigger, options = {}) {
  return {
    trigger,
    start: 'top 80%',
    toggleActions: 'play none none reverse',
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
  const split = new SplitType(target, {
    types: options.types || 'lines,words',
    tagName: 'span',
  })

  const lines = split.lines?.length ? split.lines : split.words

  gsap.set(lines, {
    yPercent: 105,
    opacity: 0,
    transformOrigin: '0% 100%',
    willChange: 'transform, opacity',
  })

  const animationTarget = lines || split.words || []

  timeline.to(animationTarget, {
    yPercent: 0,
    opacity: 1,
    duration: options.duration || 1.1,
    stagger: options.stagger || 0.08,
    ease: options.ease || 'power4.out',
  }, options.position)

  return () => split.revert()
}