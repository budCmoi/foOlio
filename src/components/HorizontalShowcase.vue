<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from '@/composables/useGSAP'

const root = ref(null)
const pin = ref(null)
const track = ref(null)

const panels = [
  {
    index: '01',
    title: 'Cadrer le problème, clarifier la solution',
    description: 'Je transforme un besoin flou en interface et en parcours clairs, pensés pour l\'usage réel et pas seulement pour une démo.',
    tags: ['Cadrage', 'UX claire', 'Décision rapide'],
  },
  {
    index: '02',
    title: 'Relier interface, logique et système',
    description: 'Je préfère une solution où le studio, la donnée, les routes, l\'admin et la synchro avancent ensemble plutôt qu\'un assemblage fragile.',
    tags: ['Stack complète', 'Firebase', 'Architecture évolutive'],
  },
  {
    index: '03',
    title: 'Déployer l\'IA partout dans la chaîne',
    description: 'Génération, recherche, automatisation, assistants, scoring, enrichissement et outils internes : l\'IA traverse toute la solution et accélère chaque couche.',
    tags: ['Workflows IA', 'Assistants', 'Automatisation continue'],
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
        <h2>Des solutions propres, solides et assez vivantes pour marquer.</h2>
        <p>
          Le but n\'est pas de vendre un effet. Le but est de résoudre un besoin avec une base rapide, claire et extensible, IA incluse dès le départ.
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