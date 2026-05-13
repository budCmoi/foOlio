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
    duration: 0.06,
    ease: 'none',
  })

  const yTo = gsap.quickTo(cursor.value, 'y', {
    duration: 0.06,
    ease: 'none',
  })

  const scaleXTo = gsap.quickTo(cursor.value, 'scaleX', {
    duration: 0.12,
    ease: 'power2.out',
  })

  const scaleYTo = gsap.quickTo(cursor.value, 'scaleY', {
    duration: 0.12,
    ease: 'power2.out',
  })

  const setCursorScale = (value) => {
    scaleXTo(value)
    scaleYTo(value)
  }

  gsap.set(cursor.value, {
    scaleX: 1,
    scaleY: 1,
  })

  onMove = (event) => {
    const target = event.target instanceof Element
      ? event.target.closest('[data-cursor]')
      : null

    active.value = true
    xTo(event.clientX)
    yTo(event.clientY)

    if (target) {
      ui.setCursor(
        target.getAttribute('data-cursor') || 'Open',
        target.getAttribute('data-cursor-theme') || 'accent',
      )
      setCursorScale(1.08)
      return
    }

    ui.clearCursor()
    setCursorScale(1)
  }

  onDown = () => setCursorScale(0.92)
  onUp = () => setCursorScale(ui.cursorText.value ? 1.04 : 1)
  onLeave = () => {
    active.value = false
    ui.clearCursor()
    setCursorScale(1)
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown)
  window.addEventListener('pointerup', onUp)
  document.addEventListener('mouseleave', onLeave)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerdown', onDown)
  window.removeEventListener('pointerup', onUp)
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