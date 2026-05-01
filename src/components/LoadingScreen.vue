<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { siteProfile } from '@/data/projects'
import { gsap } from '@/composables/useGSAP'

const props = defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['complete'])

const progress = ref(0)
const screen = ref(null)
const bar = ref(null)
const nameWords = computed(() => siteProfile.name.split(/\s+/).filter(Boolean))

let hasCompleted = false

onMounted(() => {
  const state = { value: 0 }

  gsap.timeline({
    defaults: {
      ease: 'power2.out',
    },
    onComplete: () => {
      if (hasCompleted) {
        return
      }

      hasCompleted = true
      emit('complete')
    },
  })
    .from('.loading-screen__title .word', {
      y: 18,
      autoAlpha: 0,
      stagger: 0.04,
      duration: 0.42,
    })
    .to(state, {
      value: 100,
      duration: 0.72,
      onUpdate: () => {
        progress.value = Math.round(state.value)
      },
    }, 0.15)
    .fromTo(bar.value, {
      scaleX: 0,
    }, {
      scaleX: 1,
      transformOrigin: '0% 50%',
      duration: 0.72,
    }, 0.15)
})

watch(() => props.visible, (isVisible) => {
  if (isVisible || !screen.value) {
    return
  }

  gsap.to(screen.value, {
    autoAlpha: 0,
    duration: 0.32,
    ease: 'power2.out',
    pointerEvents: 'none',
  })
})
</script>

<template>
  <div ref="screen" class="loading-screen" :class="{ 'is-visible': visible }">
    <div class="loading-screen__inner">
      <p class="loading-screen__label">Chargement du portfolio</p>
      <h2 class="loading-screen__title">
        <span v-for="word in nameWords" :key="word" class="word">{{ word }}</span>
      </h2>
      <div class="loading-screen__progress">
        <div class="loading-screen__bar">
          <span ref="bar"></span>
        </div>
        <span>{{ progress }}%</span>
      </div>
    </div>
  </div>
</template>