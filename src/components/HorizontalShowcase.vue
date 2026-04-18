<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from '@/composables/useGSAP'

const root = ref(null)
const pin = ref(null)
const track = ref(null)

const panels = [
  {
    index: '01',
    title: 'Concevoir le frontend comme un produit',
    description: 'Les composants, les états et les transitions doivent rester clairs sous charge réelle, pas seulement dans une maquette propre.',
    tags: ['Composants robustes', 'États lisibles', 'UX de production'],
  },
  {
    index: '02',
    title: 'Relier UI, logique et données',
    description: 'Je préfère une app où le studio, le routing et la persistence avancent ensemble plutôt qu\'une interface belle mais fragile au premier changement.',
    tags: ['Vue 3', 'Firebase', 'Architecture évolutive'],
  },
  {
    index: '03',
    title: 'Automatiser avec l\'IA quand ça vaut le coup',
    description: 'Résumé, génération assistée, enrichissement ou outils internes : l\'IA entre dans le produit quand elle réduit du travail utile et reste maîtrisable.',
    tags: ['Workflows IA', 'Assistant interne', 'Automatisation ciblée'],
  },
]

let sliderTween = null
let resizeFrame = 0
let resizeHandler = null
let resizeObserver = null
let loopClones = []

function removeLoopClones() {
  loopClones.forEach((clone) => clone.remove())
  loopClones = []
}

function destroySlider() {
  if (resizeFrame) {
    cancelAnimationFrame(resizeFrame)
    resizeFrame = 0
  }

  sliderTween?.kill()
  sliderTween = null

  if (track.value) {
    gsap.killTweensOf(track.value)
    gsap.set(track.value, { clearProps: 'transform,willChange' })
  }

  removeLoopClones()
}

function syncLoopPanels() {
  const el = track.value
  if (!el) return []

  removeLoopClones()

  const originals = Array.from(el.querySelectorAll('.services-rail__panel'))
    .filter((panel) => panel.dataset.loopClone !== 'true')

  originals.slice().reverse().forEach((panel) => {
    const clone = panel.cloneNode(true)
    clone.dataset.loopClone = 'true'
    clone.setAttribute('aria-hidden', 'true')
    el.insertBefore(clone, el.firstChild)
    loopClones.unshift(clone)
  })

  return originals
}

function buildSlider() {
  const el = track.value
  const frame = pin.value
  if (!el || !frame) return

  const originals = syncLoopPanels()
  const firstOriginal = originals[0]
  const firstClone = loopClones[0]
  if (!firstOriginal || !firstClone) return

  const compactViewport = window.matchMedia('(max-width: 820px)').matches

  const loopDistance = Math.abs(firstOriginal.offsetLeft - firstClone.offsetLeft)
  if (!loopDistance) return

  const pixelsPerSecond = compactViewport ? 24 : 30
  const duration = Math.max(loopDistance / pixelsPerSecond, compactViewport ? 18 : 24)

  gsap.set(el, { x: -loopDistance, willChange: 'transform' })

  sliderTween = gsap.to(el, {
    x: 0,
    duration,
    ease: 'none',
    repeat: -1,
  })
}

function rebuildSlider() {
  destroySlider()

  buildSlider()
}

function scheduleRebuild() {
  if (resizeFrame) {
    cancelAnimationFrame(resizeFrame)
  }

  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0
    rebuildSlider()
  })
}

onMounted(async () => {
  await nextTick()
  rebuildSlider()

  if (typeof window !== 'undefined') {
    resizeHandler = () => scheduleRebuild()
    window.addEventListener('resize', resizeHandler, { passive: true })
  }

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => scheduleRebuild())
    if (root.value) {
      resizeObserver.observe(root.value)
    }
    if (pin.value) {
      resizeObserver.observe(pin.value)
    }
    if (track.value) {
      resizeObserver.observe(track.value)
    }
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }

  resizeObserver?.disconnect()
  resizeObserver = null
  resizeHandler = null

  destroySlider()
})
</script>

<template>
  <section id="process" ref="root" class="services-rail page-block" data-page-intro>
    <div class="section-heading">
      <p class="section-tag">Processus</p>
      <div>
        <h2>Du code propre, une base solide et juste assez de mouvement pour donner du relief.</h2>
        <p>
          Le but n\'est pas de mettre de l\'effet partout. Le but est de livrer un produit qui reste clair, rapide et extensible.
        </p>
      </div>
    </div>

    <div ref="pin" class="services-rail__pin">
      <div ref="track" class="services-rail__track">
        <article v-for="panel in panels" :key="panel.index" class="services-rail__panel">
          <span class="services-rail__index">{{ panel.index }}</span>
          <div class="services-rail__content">
            <h3>{{ panel.title }}</h3>
            <p>{{ panel.description }}</p>
          </div>
          <ul class="services-rail__tags">
            <li v-for="tag in panel.tags" :key="tag">{{ tag }}</li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>