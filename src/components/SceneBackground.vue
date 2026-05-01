<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { isMobileViewport, isReducedMotion } from '@/composables/useGSAP'

const root = ref(null)
const TAU = Math.PI * 2

let disposeScene = () => {}

function shouldSkipScene() {
  return typeof window === 'undefined' || isMobileViewport() || isReducedMotion()
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function lerp(start, end, factor) {
  return start + (end - start) * factor
}

function rgba(value, opacity) {
  return `rgba(${value}, ${value}, ${value}, ${opacity})`
}

function rotatePoint(x, y, angle) {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  }
}

function createBlobs(width, height) {
  const unit = Math.min(width, height)

  return [
    {
      x: width * 0.22,
      y: height * 0.3,
      radius: unit * 0.34,
      stretchX: 1.18,
      stretchY: 0.86,
      rotation: -0.34,
      driftX: width * 0.055,
      driftY: height * 0.04,
      scrollX: width * 0.04,
      scrollY: height * 0.16,
      ampA: 0.13,
      ampB: 0.06,
      freqA: 2.2,
      freqB: 4.9,
      pointerPull: 0.08,
      layerCount: 3,
      phase: 0.12,
      motionSpeed: 0.6,
      driftAmpX: width * 0.02,
      driftAmpY: height * 0.016,
      scalePulse: 0.034,
      phaseDrift: 0.24,
      strokeWidth: 1.1,
    },
    {
      x: width * 0.56,
      y: height * 0.56,
      radius: unit * 0.42,
      stretchX: 0.98,
      stretchY: 1.08,
      rotation: 0.2,
      driftX: width * 0.04,
      driftY: height * 0.055,
      scrollX: -width * 0.03,
      scrollY: -height * 0.12,
      ampA: 0.1,
      ampB: 0.08,
      freqA: 2.8,
      freqB: 5.4,
      pointerPull: 0.09,
      layerCount: 4,
      phase: 1.24,
      motionSpeed: 0.48,
      driftAmpX: width * 0.024,
      driftAmpY: height * 0.022,
      scalePulse: 0.042,
      phaseDrift: 0.21,
      strokeWidth: 1,
    },
    {
      x: width * 0.82,
      y: height * 0.26,
      radius: unit * 0.24,
      stretchX: 0.92,
      stretchY: 1.16,
      rotation: 0.56,
      driftX: width * 0.06,
      driftY: height * 0.03,
      scrollX: -width * 0.055,
      scrollY: height * 0.14,
      ampA: 0.12,
      ampB: 0.05,
      freqA: 3.1,
      freqB: 6,
      pointerPull: 0.075,
      layerCount: 3,
      phase: 2.1,
      motionSpeed: 0.72,
      driftAmpX: width * 0.018,
      driftAmpY: height * 0.014,
      scalePulse: 0.03,
      phaseDrift: 0.27,
      strokeWidth: 0.95,
    },
  ]
}

function getPalette() {
  const isLight = document.documentElement.dataset.theme === 'light'

  return isLight
    ? {
        composite: 'multiply',
        fill: 10,
        stroke: 16,
        halo: 18,
        fillAlpha: 0.12,
        fillAlphaSoft: 0.06,
        strokeAlpha: 0.14,
        ringAlpha: 0.08,
      }
    : {
        composite: 'screen',
        fill: 248,
        stroke: 255,
        halo: 230,
        fillAlpha: 0.12,
        fillAlphaSoft: 0.055,
        strokeAlpha: 0.16,
        ringAlpha: 0.1,
      }
}

function traceBlobPath(context, config) {
  const {
    centerX,
    centerY,
    radius,
    stretchX,
    stretchY,
    rotation,
    ampA,
    ampB,
    freqA,
    freqB,
    phaseA,
    phaseB,
    pointerAngle,
    pointerMagnitude,
    pointerPull,
  } = config

  const steps = 88

  context.beginPath()

  for (let step = 0; step <= steps; step += 1) {
    const angle = (step / steps) * TAU
    const modulation = 1
      + Math.sin(angle * freqA + phaseA) * ampA
      + Math.cos(angle * freqB + phaseB) * ampB
      + Math.cos(angle - pointerAngle) * pointerMagnitude * pointerPull

    const localX = Math.cos(angle) * radius * stretchX * modulation
    const localY = Math.sin(angle) * radius * stretchY * (1 + Math.sin(angle * 1.5 + phaseB) * ampA * 0.45) * modulation
    const point = rotatePoint(localX, localY, rotation)
    const x = centerX + point.x
    const y = centerY + point.y

    if (step === 0) {
      context.moveTo(x, y)
    }
    else {
      context.lineTo(x, y)
    }
  }

  context.closePath()
}

function drawLayeredBlob(context, blob, state, palette, depth) {
  const depthRatio = depth / Math.max(blob.layerCount - 1, 1)
  const autoPhase = state.time * blob.motionSpeed + blob.phase + depth * 0.42
  const autoWaveA = Math.sin(autoPhase)
  const autoWaveB = Math.cos(autoPhase * 0.82 + depth * 0.58)
  const layerScale = 1
    - depthRatio * 0.16
    + state.scroll * 0.04 * (depth % 2 === 0 ? 1 : -1)
    + autoWaveA * blob.scalePulse
    + autoWaveB * blob.scalePulse * 0.42
  const centerX = blob.x
    + state.pointer.x * blob.driftX * (1 - depthRatio * 0.2)
    + state.scroll * blob.scrollX * (depth % 2 === 0 ? 1 : -0.48)
    + autoWaveA * blob.driftAmpX * (1 - depthRatio * 0.24)
    + autoWaveB * blob.driftAmpX * 0.36
  const centerY = blob.y
    - state.pointer.y * blob.driftY * (1 - depthRatio * 0.2)
    + state.scroll * blob.scrollY * (depth % 2 === 0 ? 1 : -0.34)
    + autoWaveB * blob.driftAmpY * (1 - depthRatio * 0.24)
    - autoWaveA * blob.driftAmpY * 0.34
  const radius = blob.radius * layerScale
  const rotation = blob.rotation
    + state.scroll * (0.34 + depth * 0.08)
    + state.pointer.x * 0.18
    + autoWaveA * 0.22
    - autoWaveB * 0.08
  const phaseA = blob.phase
    + state.scroll * TAU * (0.42 + depth * 0.08)
    + state.pointer.x * 1.4
    + state.time * blob.phaseDrift
  const phaseB = blob.phase * 0.6
    - state.scroll * TAU * (0.3 + depth * 0.06)
    + state.pointer.y * 1.1
    - state.time * blob.phaseDrift * 0.78
  const pointerMagnitude = Math.hypot(state.pointer.x, state.pointer.y)
  const pointerAngle = Math.atan2(state.pointer.y || 0.0001, state.pointer.x || 0.0001)

  const halo = context.createRadialGradient(
    centerX - state.pointer.x * radius * 0.22,
    centerY - state.pointer.y * radius * 0.18,
    radius * 0.1,
    centerX,
    centerY,
    radius * 1.2,
  )

  halo.addColorStop(0, rgba(palette.halo, palette.fillAlphaSoft * (1 - depthRatio * 0.28)))
  halo.addColorStop(0.5, rgba(palette.halo, palette.fillAlphaSoft * 0.34))
  halo.addColorStop(1, rgba(palette.halo, 0))

  context.fillStyle = halo
  context.beginPath()
  context.arc(centerX, centerY, radius * 1.14, 0, TAU)
  context.fill()

  traceBlobPath(context, {
    centerX,
    centerY,
    radius,
    stretchX: blob.stretchX,
    stretchY: blob.stretchY,
    rotation,
    ampA: blob.ampA * (1 - depthRatio * 0.26),
    ampB: blob.ampB * (1 - depthRatio * 0.12),
    freqA: blob.freqA,
    freqB: blob.freqB,
    phaseA,
    phaseB,
    pointerAngle,
    pointerMagnitude,
    pointerPull: blob.pointerPull,
  })

  const fill = context.createRadialGradient(
    centerX - state.pointer.x * radius * 0.24,
    centerY - state.pointer.y * radius * 0.2,
    radius * 0.12,
    centerX,
    centerY,
    radius * 1.18,
  )

  fill.addColorStop(0, rgba(palette.fill, palette.fillAlpha * (1 - depthRatio * 0.18)))
  fill.addColorStop(0.48, rgba(palette.fill, palette.fillAlphaSoft * (1.1 - depthRatio * 0.2)))
  fill.addColorStop(1, rgba(palette.fill, 0))

  context.fillStyle = fill
  context.fill()

  context.lineWidth = blob.strokeWidth - depthRatio * 0.2
  context.strokeStyle = rgba(palette.stroke, palette.strokeAlpha * (1 - depthRatio * 0.22))
  context.stroke()

  traceBlobPath(context, {
    centerX,
    centerY,
    radius: radius * (0.74 - depthRatio * 0.06),
    stretchX: blob.stretchX * 0.96,
    stretchY: blob.stretchY * 0.96,
    rotation: rotation * 1.08,
    ampA: blob.ampA * 0.56,
    ampB: blob.ampB * 0.38,
    freqA: blob.freqA + 0.8,
    freqB: blob.freqB - 0.7,
    phaseA: phaseA * 1.06,
    phaseB: phaseB * 0.82,
    pointerAngle,
    pointerMagnitude,
    pointerPull: blob.pointerPull * 0.52,
  })

  context.lineWidth = 0.7
  context.strokeStyle = rgba(palette.stroke, palette.ringAlpha * (1 - depthRatio * 0.2))
  context.stroke()
}

onMounted(() => {
  if (!root.value || shouldSkipScene()) {
    return
  }

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    return
  }

  canvas.className = 'scene-background__canvas'
  root.value.appendChild(canvas)

  const pointer = { x: 0, y: 0 }
  const targetPointer = { x: 0, y: 0 }
  const scroll = { value: 0, target: 0 }
  let width = 0
  let height = 0
  let dpr = 1
  let blobs = []
  let frameId = 0

  const updateSize = () => {
    if (!root.value) {
      return
    }

    width = root.value.clientWidth
    height = root.value.clientHeight
    dpr = Math.min(window.devicePixelRatio || 1, 1.6)

    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    blobs = createBlobs(width, height)
  }

  const updateScrollTarget = () => {
    const maxScroll = Math.max(window.innerHeight * 2.2, 1)
    scroll.target = clamp(window.scrollY / maxScroll, 0, 1.15)
  }

  updateSize()
  updateScrollTarget()

  const resizeObserver = new ResizeObserver(updateSize)
  resizeObserver.observe(root.value)

  const onPointerMove = (event) => {
    targetPointer.x = (event.clientX / window.innerWidth - 0.5) * 2
    targetPointer.y = (event.clientY / window.innerHeight - 0.5) * 2
  }

  const onPointerLeave = () => {
    targetPointer.x = 0
    targetPointer.y = 0
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerleave', onPointerLeave)
  window.addEventListener('scroll', updateScrollTarget, { passive: true })

  const animate = (time) => {
    const elapsed = time * 0.001

    pointer.x = lerp(pointer.x, targetPointer.x, 0.08)
    pointer.y = lerp(pointer.y, targetPointer.y, 0.08)
    scroll.value = lerp(scroll.value, scroll.target, 0.08)

    context.clearRect(0, 0, width, height)

    const palette = getPalette()

    context.save()
    context.globalCompositeOperation = palette.composite

    blobs.forEach((blob) => {
      for (let depth = 0; depth < blob.layerCount; depth += 1) {
        drawLayeredBlob(context, blob, { pointer, scroll: scroll.value, time: elapsed }, palette, depth)
      }
    })

    context.restore()

    frameId = window.requestAnimationFrame(animate)
  }

  frameId = window.requestAnimationFrame(animate)

  disposeScene = () => {
    window.cancelAnimationFrame(frameId)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerleave', onPointerLeave)
    window.removeEventListener('scroll', updateScrollTarget)
    resizeObserver.disconnect()

    if (root.value?.contains(canvas)) {
      root.value.removeChild(canvas)
    }
  }
})

onBeforeUnmount(() => {
  disposeScene()
})
</script>

<template>
  <div ref="root" class="scene-background" aria-hidden="true"></div>
</template>