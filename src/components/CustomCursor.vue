<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { computed } from 'vue'
import { gsap } from '@/composables/useGSAP'
import { useUiState } from '@/composables/useUiState'

const ui = useUiState()
const cursor = ref(null)
const active = ref(false)
const loaderVisible = ui.loaderVisible
const transitioning = ui.transitioning
const cursorText = ui.cursorText
const cursorTheme = ui.cursorTheme
const menuOpen = ui.menuOpen
const displayLabel = computed(() => cursorText.value || 'Guest')

let onMove = null
let onDown = null
let onUp = null
let onLeave = null

watch(ui.menuOpen, (isOpen) => {
  if (isOpen) {
    ui.clearCursor()
  }
})

onMounted(() => {
  if (!cursor.value || window.matchMedia('(pointer: coarse)').matches) {
    return
  }

  const getHalfSize = () => cursor.value?.offsetWidth / 2 || 8

  const xTo = gsap.quickTo(cursor.value, 'x', {
    duration: 0,
  })

  const yTo = gsap.quickTo(cursor.value, 'y', {
    duration: 0,
  })

  onMove = (event) => {
    const target = event.target instanceof Element
      ? event.target.closest('[data-cursor]')
      : null

    active.value = true
    gsap.set(cursor.value, { x: event.clientX, y: event.clientY })

    if (target) {
      ui.setCursor(
        target.getAttribute('data-cursor') || 'Open',
        target.getAttribute('data-cursor-theme') || 'accent',
      )
      return
    }

    ui.clearCursor()
  }

  onLeave = () => {
    active.value = false
    ui.clearCursor()
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('mouseleave', onLeave)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMove)
  document.removeEventListener('mouseleave', onLeave)
})
</script>

<template>
  <div
    ref="cursor"
    class="custom-cursor"
    :class="[
      `is-${cursorTheme}`,
      {
        'is-active': active,
        'is-hidden': loaderVisible || transitioning || menuOpen,
        'is-hovering': Boolean(cursorText),
      },
    ]"
    aria-hidden="true"
  >
    <div class="custom-cursor__label">
      <span class="custom-cursor__dot"></span>
      <span class="custom-cursor__text">{{ displayLabel }}</span>
    </div>
  </div>
</template>