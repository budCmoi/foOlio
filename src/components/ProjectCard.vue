<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { gsap, isMobileViewport, isReducedMotion } from '@/composables/useGSAP'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})

const card = ref(null)
const media = ref(null)
const paddedIndex = computed(() => String(props.index + 1).padStart(2, '0'))
const projectMeta = computed(() => `${props.project.client || props.project.title} / ${props.project.year}`)
const projectTags = computed(() => {
  if (Array.isArray(props.project.tags) && props.project.tags.length) {
    return props.project.tags.slice(0, 2)
  }

  return props.project.tech.slice(0, 2)
})
const projectMetrics = computed(() => {
  if (Array.isArray(props.project.metrics) && props.project.metrics.length) {
    return props.project.metrics.slice(0, 2)
  }

  return props.project.results.slice(0, 2).map((entry, index) => ({
    value: String(index + 1).padStart(2, '0'),
    label: entry,
  }))
})

let onMove = null
let onLeave = null

onMounted(() => {
  if (!card.value || !media.value || isMobileViewport() || isReducedMotion()) {
    return
  }

  onMove = (event) => {
    const bounds = card.value.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5

    gsap.to(card.value, {
      rotateY: x * 6,
      rotateX: y * -5,
      y: -6,
      duration: 0.35,
      ease: 'power2.out',
      transformPerspective: 1200,
      transformOrigin: 'center center',
    })

    gsap.to(media.value, {
      x: x * 18,
      y: y * 18,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 0.42,
      ease: 'power3.out',
    })
  }

  onLeave = () => {
    gsap.to(card.value, {
      rotateX: 0,
      rotateY: 0,
      y: 0,
      duration: 0.45,
      ease: 'power3.out',
    })

    gsap.to(media.value, {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      duration: 0.45,
      ease: 'power3.out',
    })
  }

  card.value.addEventListener('pointermove', onMove)
  card.value.addEventListener('pointerleave', onLeave)
})

onBeforeUnmount(() => {
  card.value?.removeEventListener('pointermove', onMove)
  card.value?.removeEventListener('pointerleave', onLeave)
})
</script>

<template>
  <RouterLink :to="`/project/${project.id}`" custom v-slot="{ href, navigate }">
    <a
      ref="card"
      class="project-card work-card"
      :href="href"
      :style="{ '--project-accent': project.accent }"
      data-cursor="Ouvrir"
      @click="navigate"
    >
      <div class="work-card__copy">
        <div class="work-card__overview">
          <span class="work-card__index">{{ paddedIndex }}</span>

          <div class="work-card__headline">
            <p class="work-card__meta">{{ projectMeta }}</p>
            <h3>{{ project.title }}</h3>

            <div class="work-card__tags">
              <span v-for="tag in projectTags" :key="tag">{{ tag }}</span>
            </div>
          </div>
        </div>

        <div class="work-card__metrics">
          <div v-for="metric in projectMetrics" :key="`${metric.value}-${metric.label}`" class="work-card__metric">
            <strong>{{ metric.value }}</strong>
            <span>{{ metric.label }}</span>
          </div>
        </div>
      </div>

      <div class="work-card__media">
        <img
          ref="media"
          :src="project.images[0]"
          :alt="project.title"
          loading="lazy"
          decoding="async"
        />

        <div class="work-card__overlay" aria-hidden="true">
          <span>Voir le projet</span>
          <span>↗</span>
        </div>
      </div>
    </a>
  </RouterLink>
</template>