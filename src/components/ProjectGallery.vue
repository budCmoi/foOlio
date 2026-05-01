<script setup>
import { onBeforeUpdate, onMounted, ref } from 'vue'
import { createRevealTrigger, gsap, useGSAPContext } from '@/composables/useGSAP'

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
  imageDetails: {
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
const { add } = useGSAPContext(root)

function setCardRef(element) {
  if (element) {
    cards.value.push(element)
  }
}

onBeforeUpdate(() => {
  cards.value = []
})

onMounted(() => {
  add(() => {
    cards.value.forEach((card) => {
      gsap.from(card, {
        y: 24,
        autoAlpha: 0,
        duration: 0.42,
        ease: 'power2.out',
        scrollTrigger: createRevealTrigger(card, { start: 'top 88%' }),
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
          :src="image"
          :alt="props.imageDetails[index]?.alt || `${props.title} visuel ${index + 1}`"
          loading="lazy"
          decoding="async"
        />
      </div>
      <figcaption>{{ props.imageDetails[index]?.caption || `${String(index + 1).padStart(2, '0')} / Etude visuelle` }}</figcaption>
    </figure>
  </section>
</template>