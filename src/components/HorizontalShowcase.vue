<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { siteProfile } from '@/data/projects'
import { gsap } from '@/composables/useGSAP'

const root = ref(null)
const track = ref(null)
const marqueeItems = computed(() => [...siteProfile.marquee, ...siteProfile.marquee])

let marqueeTween = null
let resizeObserver = null

function buildMarquee() {
  if (!track.value) {
    return
  }

  marqueeTween?.kill()

  const distance = track.value.scrollWidth / 2

  if (!distance) {
    return
  }

  gsap.set(track.value, { x: 0 })

  marqueeTween = gsap.to(track.value, {
    x: -distance,
    duration: 26,
    ease: 'none',
    repeat: -1,
  })
}

onMounted(async () => {
  await nextTick()
  buildMarquee()

  if (typeof ResizeObserver !== 'undefined' && root.value) {
    resizeObserver = new ResizeObserver(() => buildMarquee())
    resizeObserver.observe(root.value)
  }
})

onBeforeUnmount(() => {
  marqueeTween?.kill()
  resizeObserver?.disconnect()
})
</script>

<template>
  <section class="marquee-strip page-block" data-page-intro aria-label="Bandeau expertise">
    <div ref="root" class="marquee-strip__viewport">
      <div ref="track" class="marquee-strip__track">
        <span v-for="(item, index) in marqueeItems" :key="`${item}-${index}`" class="marquee-strip__item">
          {{ item }}
          <i aria-hidden="true">✦</i>
        </span>
      </div>
    </div>
  </section>
</template>