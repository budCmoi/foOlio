<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { isMobileViewport, isReducedMotion } from '@/composables/useGSAP'

const root = ref(null)

let disposeScene = () => {}

function shouldSkipScene() {
  return typeof window === 'undefined' || isMobileViewport() || isReducedMotion()
}

function createShells(width, height) {
  const unit = Math.min(width, height)

  return [
    {
      x: width * 0.28,
      y: height * 0.34,
      radius: unit * 0.12,
      color: 'rgba(215, 255, 118, 0.22)',
      glow: 'rgba(215, 255, 118, 0.14)',
      sides: 6,
      speed: 0.00018,
      drift: 22,
      orbitScale: 1.1,
    },
    {
      x: width * 0.71,
      y: height * 0.7,
      radius: unit * 0.11,
      color: 'rgba(255, 185, 152, 0.2)',
      glow: 'rgba(255, 185, 152, 0.12)',
      sides: 5,
      speed: -0.00014,
      drift: 20,
      orbitScale: 1.2,
    },
    {
      x: width * 0.58,
      y: height * 0.22,
      radius: unit * 0.08,
      color: 'rgba(143, 214, 255, 0.22)',
      glow: 'rgba(143, 214, 255, 0.12)',
      sides: 4,
      speed: 0.00016,
      drift: 16,
      orbitScale: 0.9,
    },
  ]
}

function createParticles(width, height, shells) {
  const count = 42

  return Array.from({ length: count }, (_, index) => {
    const shell = shells[index % shells.length]
    return {
      shellIndex: index % shells.length,
      baseAngle: Math.random() * Math.PI * 2,
      orbitRadius: shell.radius * (1.25 + Math.random() * 1.9),
      size: 0.8 + Math.random() * 2.2,
      speed: 0.0003 + Math.random() * 0.00055,
      wobble: 8 + Math.random() * 18,
      opacity: 0.18 + Math.random() * 0.3,
      color: index % 3 === 0
        ? '255,255,255'
        : shell.color.includes('215, 255, 118')
          ? '215,255,118'
          : shell.color.includes('255, 185, 152')
            ? '255,185,152'
            : '143,214,255',
      offset: (Math.random() - 0.5) * Math.min(width, height) * 0.02,
    }
  })
}

function drawPolygon(context, shell, rotation) {
  const step = (Math.PI * 2) / shell.sides

  context.beginPath()

  for (let index = 0; index <= shell.sides; index += 1) {
    const angle = rotation + index * step
    const x = shell.x + Math.cos(angle) * shell.radius
    const y = shell.y + Math.sin(angle) * shell.radius * shell.orbitScale

    if (index === 0) {
      context.moveTo(x, y)
      continue
    }

    context.lineTo(x, y)
  }

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
  let width = 0
  let height = 0
  let dpr = 1
  let shells = []
  let particles = []

  const updateSize = () => {
    if (!root.value) {
      return
    }

    width = root.value.clientWidth
    height = root.value.clientHeight
    dpr = Math.min(window.devicePixelRatio || 1, 1.35)

    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    context.setTransform(dpr, 0, 0, dpr, 0, 0)

    shells = createShells(width, height)
    particles = createParticles(width, height, shells)
  }

  updateSize()

  const resizeObserver = new ResizeObserver(updateSize)
  resizeObserver.observe(root.value)

  const onPointerMove = (event) => {
    targetPointer.x = event.clientX / window.innerWidth - 0.5
    targetPointer.y = event.clientY / window.innerHeight - 0.5
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })

  let frameId = 0

  const animate = (time) => {
    const elapsed = time * 0.001

    pointer.x += (targetPointer.x - pointer.x) * 0.032
    pointer.y += (targetPointer.y - pointer.y) * 0.032

    context.clearRect(0, 0, width, height)

    shells.forEach((shell, index) => {
      const shiftX = pointer.x * shell.drift * (index % 2 === 0 ? 1 : -1)
      const shiftY = pointer.y * shell.drift * (index % 2 === 0 ? -1 : 1)
      const animatedShell = {
        ...shell,
        x: shell.x + shiftX,
        y: shell.y + shiftY,
      }

      const gradient = context.createRadialGradient(
        animatedShell.x,
        animatedShell.y,
        0,
        animatedShell.x,
        animatedShell.y,
        animatedShell.radius * 2.5,
      )

      gradient.addColorStop(0, animatedShell.glow)
      gradient.addColorStop(1, 'rgba(255,255,255,0)')

      context.fillStyle = gradient
      context.beginPath()
      context.arc(animatedShell.x, animatedShell.y, animatedShell.radius * 2.4, 0, Math.PI * 2)
      context.fill()

      context.save()
      context.strokeStyle = animatedShell.color
      context.lineWidth = 1
      context.setLineDash(index === 1 ? [6, 12] : [10, 10])
      drawPolygon(context, animatedShell, elapsed * animatedShell.speed * 1000)
      context.globalAlpha = 0.5
      drawPolygon(context, { ...animatedShell, radius: animatedShell.radius * 0.66 }, -elapsed * animatedShell.speed * 1250)
      context.restore()
    })

    const particlePositions = []

    particles.forEach((particle) => {
      const shell = shells[particle.shellIndex]
      const angle = particle.baseAngle + elapsed * (particle.speed * 1000)
      const x = shell.x
        + Math.cos(angle) * particle.orbitRadius
        + pointer.x * shell.drift * 1.2
      const y = shell.y
        + Math.sin(angle) * particle.orbitRadius * shell.orbitScale
        + Math.sin(elapsed * 0.8 + particle.baseAngle) * particle.wobble
        - pointer.y * shell.drift * 1.1
        + particle.offset

      particlePositions.push({
        x,
        y,
        opacity: particle.opacity,
      })

      context.fillStyle = `rgba(${particle.color}, ${particle.opacity})`
      context.beginPath()
      context.arc(x, y, particle.size, 0, Math.PI * 2)
      context.fill()
    })

    context.save()
    context.lineWidth = 0.65

    for (let index = 0; index < particlePositions.length; index += 1) {
      const current = particlePositions[index]
      const next = particlePositions[(index + 3) % particlePositions.length]
      const dx = next.x - current.x
      const dy = next.y - current.y
      const distance = Math.hypot(dx, dy)

      if (distance > Math.min(width, height) * 0.22) {
        continue
      }

      const opacity = Math.max(0, 0.12 - distance / 1800)
      context.strokeStyle = `rgba(255, 255, 255, ${opacity})`
      context.beginPath()
      context.moveTo(current.x, current.y)
      context.lineTo(next.x, next.y)
      context.stroke()
    }

    context.restore()

    frameId = window.requestAnimationFrame(animate)
  }

  frameId = window.requestAnimationFrame(animate)

  disposeScene = () => {
    window.cancelAnimationFrame(frameId)
    window.removeEventListener('pointermove', onPointerMove)
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