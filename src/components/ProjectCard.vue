<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
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
      class="project-card"
      :href="href"
      :style="{ '--project-accent': project.accent }"
      data-cursor="Ouvrir"
      @click="navigate"
    >
      <div class="project-card__media">
        <img
          ref="media"
          :src="project.images[0]"
          :alt="project.title"
          loading="lazy"
          decoding="async"
        />
        <span class="project-card__index">{{ String(index + 1).padStart(2, '0') }}</span>
      </div>

      <div class="project-card__body">
        <div class="project-card__meta">
          <span>{{ project.year }}</span>
          <span>{{ project.role }}</span>
        </div>

        <div class="project-card__copy">
          <h3>{{ project.title }}</h3>
          <p>{{ project.description }}</p>
        </div>

        <ul class="project-card__tech">
          <li v-for="item in project.tech.slice(0, 3)" :key="item">{{ item }}</li>
        </ul>
      </div>
    </a>
  </RouterLink>
</template>