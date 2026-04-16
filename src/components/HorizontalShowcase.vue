<script setup>
import { onMounted, ref, computed, nextTick } from 'vue'
import { gsap, isMobileViewport, isReducedMotion, useGSAPContext } from '@/composables/useGSAP'


const root = ref(null)
const track = ref(null)
const { add } = useGSAPContext(root)

// Duplicate panels for infinite loop
const panels = [
  {
    index: '01',
    title: 'Scénariser le défilement',
    description: 'Chaque section est cadrée comme une scène avec un temps émotionnel clair, une vitesse précise et une logique de transition nette.',
    tags: ['Rythme narratif', 'Hiérarchie de l\'information', 'Transitions de scène'],
  },
  {
    index: '02',
    title: 'Construire le motion comme un système',
    description: 'Des timelines réutilisables, des moments épinglés, du split text et des retours au survol qui restent modulaires au lieu d\'être improvisés.',
    tags: ['Timelines GSAP', 'Split text', 'Parallaxe maîtrisée'],
  },
  {
    index: '03',
    title: 'Régler pour les vrais appareils',
    description: 'Les effets lourds s\'effacent sur mobile pendant que la typographie, le rythme et la hiérarchie conservent une sensation premium.',
    tags: ['Réduction mobile', 'Chargement différé', 'Discipline performance'],
  },
]

const allPanels = computed(() => [...panels, ...panels])

onMounted(async () => {
  // Mobile/reduced motion: fade-in only
  if (isMobileViewport() || isReducedMotion()) {
    gsap.from('.services-rail__panel', {
      y: 40,
      autoAlpha: 0,
      stagger: 0.1,
      duration: 0.7,
    })
    return
  }

  await nextTick()
  const el = track.value
  if (!el) return

  // Duplicate panels already in template (allPanels)
  const panelEls = el.querySelectorAll('.services-rail__panel')
  let totalWidth = 0
  panelEls.forEach(panel => {
    totalWidth += panel.offsetWidth + parseFloat(getComputedStyle(panel).marginRight || 0)
  })

  // Animation
  gsap.set(el, { x: 0, willChange: 'transform' })
  gsap.to(el, {
    x: totalWidth / 2,
    duration: 20,
    ease: 'none',
    repeat: -1,
    onRepeat: () => {
      gsap.set(el, { x: 0 })
    },
  })
})
</script>

<template>
  <section id="process" ref="root" class="services-rail page-block" data-page-intro>
    <div class="section-heading">
      <p class="section-tag">Processus</p>
      <div>
        <h2>Du mouvement avec de la structure, pas de la décoration.</h2>
        <p>
          Le but n\'est pas d\'animer partout. Le but est que chaque mouvement semble inévitable.
        </p>
      </div>
    </div>

    <div class="services-rail__pin">
      <div ref="track" class="services-rail__track">
        <article v-for="(panel, i) in allPanels" :key="panel.index + '-' + i" class="services-rail__panel">
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