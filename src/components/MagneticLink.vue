<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useAttrs } from 'vue'
import { RouterLink } from 'vue-router'
import { gsap, isMobileViewport, isReducedMotion } from '@/composables/useGSAP'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  as: {
    type: String,
    default: 'button',
  },
  to: {
    type: [String, Object],
    default: null,
  },
  href: {
    type: String,
    default: '',
  },
  cursor: {
    type: String,
    default: 'Open',
  },
  external: {
    type: Boolean,
    default: false,
  },
  relaxed: {
    type: Boolean,
    default: false,
  },
})

const root = ref(null)
const inner = ref(null)
const attrs = useAttrs()

const componentTag = computed(() => {
  if (props.href) {
    return 'a'
  }

  return props.as
})

const componentProps = computed(() => {
  if (props.href) {
    return {
      href: props.href,
      target: props.external ? '_blank' : undefined,
      rel: props.external ? 'noreferrer' : undefined,
    }
  }

  return {
    type: 'button',
  }
})

let onMove = null
let onLeave = null

onMounted(() => {
  if (!root.value || !inner.value || isMobileViewport() || isReducedMotion()) {
    return
  }

  const xTo = gsap.quickTo(inner.value, 'x', {
    duration: props.relaxed ? 0.38 : 0.24,
    ease: 'power3.out',
  })

  const yTo = gsap.quickTo(inner.value, 'y', {
    duration: props.relaxed ? 0.38 : 0.24,
    ease: 'power3.out',
  })

  onMove = (event) => {
    const bounds = root.value.getBoundingClientRect()
    const offsetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 16
    const offsetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 16

    xTo(offsetX)
    yTo(offsetY)
  }

  onLeave = () => {
    xTo(0)
    yTo(0)
  }

  root.value.addEventListener('pointermove', onMove)
  root.value.addEventListener('pointerleave', onLeave)
})

onBeforeUnmount(() => {
  root.value?.removeEventListener('pointermove', onMove)
  root.value?.removeEventListener('pointerleave', onLeave)
})
</script>

<template>
  <RouterLink v-if="props.to" :to="props.to" custom v-slot="{ href, navigate }">
    <a
      ref="root"
      class="magnetic-link"
      :href="href"
      :data-cursor="cursor"
      v-bind="attrs"
      @click="navigate"
    >
      <span ref="inner" class="magnetic-link__inner">
        <slot />
      </span>
    </a>
  </RouterLink>

  <component
    :is="componentTag"
    v-else
    ref="root"
    class="magnetic-link"
    :data-cursor="cursor"
    v-bind="{ ...componentProps, ...attrs }"
  >
    <span ref="inner" class="magnetic-link__inner">
      <slot />
    </span>
  </component>
</template>