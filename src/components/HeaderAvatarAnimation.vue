<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvasRef = ref(null)
let rafId = 0

function drawFigure(ctx, cx, cy, s, t) {
  // Dark skin silhouette — bob up/down
  const bob = Math.sin(t * 2.2) * 0.8 * s

  // Breathing scale
  const breathe = 1 + Math.sin(t * 1.6) * 0.03

  ctx.save()
  ctx.translate(cx, cy + bob)

  // Body torso
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.ellipse(0, 4.5 * s, 5 * s * breathe, 4 * s, 0, 0, Math.PI * 2)
  ctx.fill()

  // Neck
  ctx.fillStyle = '#222'
  ctx.fillRect(-1.5 * s, -2.5 * s, 3 * s, 3.5 * s)

  // Head
  ctx.fillStyle = '#2a2a2a'
  ctx.beginPath()
  ctx.arc(0, -4.5 * s, 5.2 * s * breathe, 0, Math.PI * 2)
  ctx.fill()

  // Hair — afro-style halo
  ctx.fillStyle = '#111'
  ctx.beginPath()
  ctx.arc(0, -5.5 * s, 6.4 * s * breathe, Math.PI * 0.85, Math.PI * 2.15)
  ctx.closePath()
  ctx.fill()

  // Eyes whites
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.beginPath()
  ctx.arc(-1.9 * s, -4.8 * s, 1.1 * s, 0, Math.PI * 2)
  ctx.arc(1.9 * s, -4.8 * s, 1.1 * s, 0, Math.PI * 2)
  ctx.fill()

  // Pupils — slight side-to-side glance
  const glance = Math.sin(t * 0.55) * 0.4 * s
  ctx.fillStyle = '#111'
  ctx.beginPath()
  ctx.arc(-1.9 * s + glance, -4.8 * s, 0.6 * s, 0, Math.PI * 2)
  ctx.arc(1.9 * s + glance, -4.8 * s, 0.6 * s, 0, Math.PI * 2)
  ctx.fill()

  // Smile — changes with breathing rhythm
  const smileAmt = 0.5 + Math.sin(t * 0.8) * 0.18
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.lineWidth = 0.9 * s
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(0, -3.6 * s, 2.4 * s, 0.3 + smileAmt * 0.2, Math.PI - 0.3 - smileAmt * 0.2)
  ctx.stroke()

  ctx.restore()
}

function drawOrbits(ctx, cx, cy, s, t) {
  for (let i = 0; i < 2; i += 1) {
    const angle = t * (0.4 + i * 0.18)
    const rx = (10 + i * 4) * s
    const ry = (4 + i * 1.5) * s

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.strokeStyle = `rgba(0,0,0,${0.13 + i * 0.06})`
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.ellipse(0, 1.5 * s, rx, ry, 0, 0, Math.PI * 2)
    ctx.stroke()

    // Orbiting dot
    const dotX = Math.cos(angle * 1.4) * rx
    const dotY = Math.sin(angle * 1.4) * ry + 1.5 * s
    ctx.fillStyle = `rgba(0,0,0,${0.25 + i * 0.1})`
    ctx.beginPath()
    ctx.arc(dotX, dotY, 1.2 * s, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

function loop(canvas, ctx, dpr) {
  const t = performance.now() * 0.001
  const w = canvas.width / dpr
  const h = canvas.height / dpr
  const s = Math.min(w, h) / 28

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  drawOrbits(ctx, w * 0.5, h * 0.5, s, t)
  drawFigure(ctx, w * 0.5, h * 0.5 + 1, s, t)

  rafId = requestAnimationFrame(() => loop(canvas, ctx, dpr))
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))

  // Force canvas pixel size from its CSS-rendered size
  const initSize = () => {
    const rect = canvas.getBoundingClientRect()
    const w = Math.max(34, Math.floor(rect.width))
    const h = Math.max(34, Math.floor(rect.height))
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
  }

  initSize()

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Refit on resize
  const ro = new ResizeObserver(() => {
    initSize()
  })
  ro.observe(canvas)

  loop(canvas, ctx, dpr)
})

onBeforeUnmount(() => {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
})
</script>

<template>
  <span class="header-avatar" aria-hidden="true">
    <canvas ref="canvasRef" class="header-avatar__canvas"></canvas>
  </span>
</template>
