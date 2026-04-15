<script setup>
import { onBeforeUpdate, onMounted, ref } from 'vue'
import { createRevealTrigger, gsap, isMobileViewport, isReducedMotion, useGSAPContext } from '@/composables/useGSAP'

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: '',
  },
})

const root = ref(null)
const cards = ref([])
const imageNodes = ref([])
const { add } = useGSAPContext(root)

function setCardRef(element) {
  if (element) {
    cards.value.push(element)
  }
}

function setImageRef(element) {
  if (element) {
    imageNodes.value.push(element)
  }
}

onBeforeUpdate(() => {
  cards.value = []
  imageNodes.value = []
})

onMounted(() => {
  add(() => {
    cards.value.forEach((card, index) => {
      gsap.from(card, {
        y: 48,
        autoAlpha: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: createRevealTrigger(card),
      })

      if (isMobileViewport() || isReducedMotion()) {
        return
      }

      gsap.to(imageNodes.value[index], {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })
    })
  })
})
</script>

<template>
  <section ref="root" class="project-gallery page-block">
    <figure v-for="(image, index) in props.images" :key="`${image}-${index}`" :ref="setCardRef" class="project-gallery__item">
      <div class="project-gallery__frame">
        <img
          :ref="setImageRef"
          :src="image"
          :alt="`${props.title} visuel ${index + 1}`"
          loading="lazy"
          decoding="async"
        />
      </div>
      <figcaption>{{ String(index + 1).padStart(2, '0') }} / Étude visuelle</figcaption>
    </figure>
  </section>
</template>