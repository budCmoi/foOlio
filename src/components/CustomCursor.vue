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
    duration: 0.22,
    ease: 'power3.out',
  })

  const yTo = gsap.quickTo(cursor.value, 'y', {
    duration: 0.22,
    ease: 'power3.out',
  })

  const scaleXTo = gsap.quickTo(cursor.value, 'scaleX', {
    duration: 0.18,
    ease: 'power3.out',
  })

  const scaleYTo = gsap.quickTo(cursor.value, 'scaleY', {
    duration: 0.18,
    ease: 'power3.out',
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
    const target = event.target.closest('[data-cursor]')

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

  onDown = () => setCursorScale(0.88)
  onUp = () => setCursorScale(ui.cursorText.value ? 1.08 : 1)
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
    <div class="custom-cursor__arrow">
      <svg width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 2L2 21L6.8 16.2L10.4 24L13.4 22.6L9.8 14.8L17 14.8L2 2Z" fill="white" stroke="#0C0C0B" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="custom-cursor__label">
      <span class="custom-cursor__dot"></span>
      <span class="custom-cursor__text">{{ displayLabel }}</span>
    </div>
  </div>
</template>