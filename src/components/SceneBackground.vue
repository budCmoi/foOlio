<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { isMobileViewport, isReducedMotion } from '@/composables/useGSAP'

const root = ref(null)

let disposeScene = () => {}

function shouldSkipScene() {
  return typeof window === 'undefined' || isMobileViewport() || isReducedMotion()
}

function rgba(color, opacity) {
  return `rgba(${color}, ${opacity})`
}

function pickColor(colors) {
  return colors[Math.floor(Math.random() * colors.length)]
}

function createGalaxies(width, height) {
  const unit = Math.min(width, height)

  return [
    {
      x: width * 0.5,
      y: height * 0.46,
      radius: unit * 0.3,
      flatten: 0.58,
      twist: 2.45,
      arms: 3,
      drift: 28,
      rotationSpeed: 0.000026,
      pulseSpeed: 0.082,
      pulseOffset: 0.12,
      glowColor: '143,214,255',
      coreColor: '255,255,255',
      accentColor: '215,255,118',
      dustPalette: ['255,255,255', '143,214,255', '215,255,118'],
      clouds: [
        {
          orbit: unit * 0.05,
          sizeX: unit * 0.22,
          sizeY: unit * 0.1,
          speed: 0.22,
          offset: 0,
          color: '143,214,255',
          opacity: 0.16,
        },
        {
          orbit: unit * 0.08,
          sizeX: unit * 0.18,
          sizeY: unit * 0.09,
          speed: -0.18,
          offset: Math.PI * 0.74,
          color: '215,255,118',
          opacity: 0.12,
        },
        {
          orbit: unit * 0.11,
          sizeX: unit * 0.2,
          sizeY: unit * 0.095,
          speed: 0.15,
          offset: Math.PI * 1.42,
          color: '255,185,152',
          opacity: 0.11,
        },
      ],
    },
    {
      x: width * 0.24,
      y: height * 0.7,
      radius: unit * 0.16,
      flatten: 0.72,
      twist: 2.1,
      arms: 2,
      drift: 16,
      rotationSpeed: -0.000034,
      pulseSpeed: 0.11,
      pulseOffset: 0.48,
      glowColor: '255,185,152',
      coreColor: '255,255,255',
      accentColor: '143,214,255',
      dustPalette: ['255,255,255', '255,185,152', '143,214,255'],
      clouds: [
        {
          orbit: unit * 0.036,
          sizeX: unit * 0.13,
          sizeY: unit * 0.065,
          speed: -0.24,
          offset: Math.PI * 0.24,
          color: '255,185,152',
          opacity: 0.15,
        },
        {
          orbit: unit * 0.058,
          sizeX: unit * 0.11,
          sizeY: unit * 0.052,
          speed: 0.17,
          offset: Math.PI * 1.18,
          color: '255,255,255',
          opacity: 0.09,
        },
      ],
    },
    {
      x: width * 0.79,
      y: height * 0.22,
      radius: unit * 0.11,
      flatten: 0.66,
      twist: 1.8,
      arms: 2,
      drift: 14,
      rotationSpeed: 0.000031,
      pulseSpeed: 0.095,
      pulseOffset: 0.76,
      glowColor: '215,255,118',
      coreColor: '255,255,255',
      accentColor: '143,214,255',
      dustPalette: ['255,255,255', '215,255,118', '143,214,255'],
      clouds: [
        {
          orbit: unit * 0.028,
          sizeX: unit * 0.095,
          sizeY: unit * 0.046,
          speed: 0.28,
          offset: Math.PI * 0.42,
          color: '215,255,118',
          opacity: 0.14,
        },
        {
          orbit: unit * 0.046,
          sizeX: unit * 0.082,
          sizeY: unit * 0.038,
          speed: -0.19,
          offset: Math.PI * 1.26,
          color: '143,214,255',
          opacity: 0.1,
        },
      ],
    },
  ]
}

function createOrbitStars(galaxies) {
  return galaxies.flatMap((galaxy, galaxyIndex) => {
    const count = galaxyIndex === 0 ? 186 : galaxyIndex === 1 ? 112 : 84

    return Array.from({ length: count }, (_, index) => {
      const radiusRatio = Math.pow(Math.random(), 0.74)

      return {
        galaxyIndex,
        armIndex: index % galaxy.arms,
        orbitRadius: galaxy.radius * (0.16 + radiusRatio * 1.28),
        radiusRatio,
        phaseJitter: (Math.random() - 0.5) * (0.3 + (1 - radiusRatio) * 0.32),
        axialShift: (Math.random() - 0.5) * galaxy.radius * 0.08,
        size: 0.45 + Math.random() * (galaxyIndex === 0 ? 1.75 : 1.25),
        speed: galaxy.rotationSpeed * (0.72 + Math.random() * 1.18),
        opacity: 0.16 + Math.random() * 0.56,
        color: pickColor(galaxy.dustPalette),
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.7 + Math.random() * 1.6,
        wobble: 2 + Math.random() * 8,
        wobbleOffset: Math.random() * Math.PI * 2,
        halo: Math.random() > 0.8 ? 1.8 + Math.random() * 3.6 : 0,
        streak: Math.random() > 0.74,
      }
    })
  })
}

function createFieldStars(width, height) {
  const palette = ['255,255,255', '143,214,255', '255,185,152', '215,255,118']

  return Array.from({ length: 240 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 0.25 + Math.random() * 1.3,
    opacity: 0.08 + Math.random() * 0.28,
    color: pickColor(palette),
    twinkleOffset: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.45 + Math.random() * 1.4,
    drift: 0.18 + Math.random() * 0.65,
    floatX: 1.5 + Math.random() * 9,
    floatY: 1.5 + Math.random() * 7,
    halo: Math.random() > 0.95 ? 3 + Math.random() * 5.5 : 0,
  }))
}

function createComets(width, height) {
  const palette = ['255,255,255', '143,214,255', '255,185,152', '215,255,118']

  return Array.from({ length: 6 }, (_, index) => {
    const fromLeft = index % 2 === 0
    const startX = fromLeft
      ? -width * (0.12 + Math.random() * 0.14)
      : width * (1.08 + Math.random() * 0.12)
    const startY = height * (0.04 + Math.random() * 0.54)
    const endX = fromLeft
      ? width * (0.74 + Math.random() * 0.26)
      : -width * (0.08 + Math.random() * 0.18)
    const endY = startY + height * (0.05 + Math.random() * 0.22)

    return {
      startX,
      startY,
      endX,
      endY,
      duration: 1.6 + Math.random() * 2.2,
      delay: 3.4 + Math.random() * 5.2,
      offset: Math.random() * 9 + index * 0.9,
      color: pickColor(palette),
      opacity: 0.22 + Math.random() * 0.18,
      headSize: 1.6 + Math.random() * 2.2,
      trail: 140 + Math.random() * 210,
      thickness: 0.8 + Math.random() * 1.15,
    }
  })
}

function drawNebulaBlob(context, x, y, sizeX, sizeY, rotation, color, opacity) {
  context.save()
  context.translate(x, y)
  context.rotate(rotation)
  context.scale(1, sizeY / sizeX)

  const gradient = context.createRadialGradient(0, 0, 0, 0, 0, sizeX)
  gradient.addColorStop(0, rgba(color, opacity))
  gradient.addColorStop(0.52, rgba(color, opacity * 0.38))
  gradient.addColorStop(1, rgba(color, 0))

  context.fillStyle = gradient
  context.beginPath()
  context.arc(0, 0, sizeX, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

function drawStarGlow(context, x, y, radius, color, opacity) {
  const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
  gradient.addColorStop(0, rgba(color, opacity))
  gradient.addColorStop(1, rgba(color, 0))

  context.fillStyle = gradient
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.fill()
}

function drawPulseRing(context, x, y, radiusX, radiusY, rotation, color, opacity) {
  if (opacity <= 0) {
    return
  }

  context.save()
  context.strokeStyle = rgba(color, opacity)
  context.lineWidth = 1
  context.beginPath()
  context.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2)
  context.stroke()
  context.restore()
}

function drawComet(context, comet, elapsed, pointer) {
  const cycle = comet.duration + comet.delay
  const timeInCycle = (elapsed + comet.offset) % cycle

  if (timeInCycle > comet.duration) {
    return
  }

  const progress = timeInCycle / comet.duration
  const eased = 1 - Math.pow(1 - progress, 3)
  const x = comet.startX + (comet.endX - comet.startX) * eased + pointer.x * 14
  const y = comet.startY + (comet.endY - comet.startY) * eased - pointer.y * 10
  const dx = comet.endX - comet.startX
  const dy = comet.endY - comet.startY
  const distance = Math.hypot(dx, dy) || 1
  const tailX = x - (dx / distance) * comet.trail
  const tailY = y - (dy / distance) * comet.trail
  const fade = Math.sin(progress * Math.PI)

  const gradient = context.createLinearGradient(x, y, tailX, tailY)
  gradient.addColorStop(0, rgba(comet.color, comet.opacity * fade))
  gradient.addColorStop(0.16, rgba(comet.color, comet.opacity * fade * 0.44))
  gradient.addColorStop(1, rgba(comet.color, 0))

  context.save()
  context.strokeStyle = gradient
  context.lineWidth = comet.thickness
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(x, y)
  context.lineTo(tailX, tailY)
  context.stroke()
  context.restore()

  drawStarGlow(context, x, y, comet.headSize * 6.2, comet.color, comet.opacity * fade * 0.22)

  context.fillStyle = rgba(comet.color, comet.opacity * fade)
  context.beginPath()
  context.arc(x, y, comet.headSize, 0, Math.PI * 2)
  context.fill()
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
  let galaxies = []
  let orbitStars = []
  let fieldStars = []
  let comets = []

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

    galaxies = createGalaxies(width, height)
    orbitStars = createOrbitStars(galaxies)
    fieldStars = createFieldStars(width, height)
    comets = createComets(width, height)
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

    fieldStars.forEach((star) => {
      const x = star.x
        + Math.sin(elapsed * star.drift + star.twinkleOffset) * star.floatX
        + pointer.x * star.drift * 16
      const y = star.y
        + Math.cos(elapsed * star.drift * 0.82 + star.twinkleOffset) * star.floatY
        - pointer.y * star.drift * 12
      const opacity = star.opacity * (0.7 + (Math.sin(elapsed * star.twinkleSpeed + star.twinkleOffset) + 1) * 0.17)

      if (star.halo) {
        drawStarGlow(context, x, y, star.halo, star.color, opacity * 0.22)
      }

      context.fillStyle = rgba(star.color, opacity)
      context.beginPath()
      context.arc(x, y, star.size, 0, Math.PI * 2)
      context.fill()
    })

    const galaxyPositions = galaxies.map((galaxy, index) => ({
      galaxy,
      x: galaxy.x
        + Math.sin(elapsed * 0.18 + index * 2.2) * 3.4
        + pointer.x * galaxy.drift * (index % 2 === 0 ? 1 : -1),
      y: galaxy.y
        + Math.cos(elapsed * 0.16 + index * 1.7) * 2.6
        - pointer.y * galaxy.drift * 0.92 * (index % 2 === 0 ? 1 : -1),
    }))

    galaxyPositions.forEach(({ galaxy, x, y }, index) => {
      const corePulse = 0.92 + Math.sin(elapsed * 1.3 + galaxy.pulseOffset * Math.PI * 2) * 0.08
      const gradient = context.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        galaxy.radius * 2.8 * corePulse,
      )

      gradient.addColorStop(0, rgba(galaxy.glowColor, 0.2))
      gradient.addColorStop(0.42, rgba(galaxy.glowColor, 0.08))
      gradient.addColorStop(1, rgba(galaxy.glowColor, 0))

      context.fillStyle = gradient
      context.beginPath()
      context.arc(x, y, galaxy.radius * 2.55 * corePulse, 0, Math.PI * 2)
      context.fill()

      galaxy.clouds.forEach((cloud, cloudIndex) => {
        const cloudAngle = elapsed * cloud.speed + cloud.offset
        drawNebulaBlob(
          context,
          x + Math.cos(cloudAngle) * cloud.orbit,
          y + Math.sin(cloudAngle) * cloud.orbit * galaxy.flatten,
          cloud.sizeX,
          cloud.sizeY,
          cloudAngle * 0.6 + cloudIndex * 0.22,
          cloud.color,
          cloud.opacity,
        )
      })

      drawStarGlow(context, x, y, galaxy.radius * 0.92, galaxy.coreColor, 0.12)
      drawStarGlow(context, x, y, galaxy.radius * 0.42, galaxy.coreColor, 0.18)

      const pulseA = (elapsed * galaxy.pulseSpeed + galaxy.pulseOffset) % 1
      const pulseB = (pulseA + 0.48) % 1
      drawPulseRing(
        context,
        x,
        y,
        galaxy.radius * (0.34 + pulseA * 1.28),
        galaxy.radius * galaxy.flatten * (0.16 + pulseA * 0.52),
        elapsed * galaxy.rotationSpeed * 1600,
        galaxy.glowColor,
        (1 - pulseA) * 0.12,
      )
      drawPulseRing(
        context,
        x,
        y,
        galaxy.radius * (0.28 + pulseB * 1.18),
        galaxy.radius * galaxy.flatten * (0.14 + pulseB * 0.46),
        -elapsed * galaxy.rotationSpeed * 1420,
        galaxy.accentColor,
        (1 - pulseB) * 0.09,
      )

      context.save()
      context.strokeStyle = rgba(galaxy.accentColor, 0.16)
      context.lineWidth = 0.85
      context.setLineDash(index === 0 ? [8, 12] : [5, 10])
      context.beginPath()
      context.ellipse(
        x,
        y,
        galaxy.radius * 1.18,
        galaxy.radius * galaxy.flatten * 0.44,
        elapsed * galaxy.rotationSpeed * 2200,
        Math.PI * 0.16,
        Math.PI * 0.84,
      )
      context.stroke()

      context.strokeStyle = rgba(galaxy.glowColor, 0.14)
      context.beginPath()
      context.ellipse(
        x,
        y,
        galaxy.radius * 1.02,
        galaxy.radius * galaxy.flatten * 0.36,
        -elapsed * galaxy.rotationSpeed * 1950,
        Math.PI * 1.18,
        Math.PI * 1.82,
      )
      context.stroke()
      context.restore()
    })

    orbitStars.forEach((star) => {
      const galaxy = galaxies[star.galaxyIndex]
      const center = galaxyPositions[star.galaxyIndex]
      const armAngle = star.armIndex * ((Math.PI * 2) / galaxy.arms)
      const rotation = elapsed * star.speed * 1000
      const spiralAngle = armAngle + rotation + star.phaseJitter + star.radiusRatio * galaxy.twist
      const x = center.x
        + Math.cos(spiralAngle) * star.orbitRadius
        + Math.cos(elapsed * 0.72 + star.wobbleOffset) * star.wobble * 0.22
      const y = center.y
        + Math.sin(spiralAngle) * star.orbitRadius * galaxy.flatten
        + Math.sin(elapsed * 0.9 + star.wobbleOffset) * star.wobble * 0.16
        + star.axialShift
      const opacity = star.opacity * (0.76 + (Math.sin(elapsed * star.twinkleSpeed + star.twinkleOffset) + 1) * 0.12)

      if (star.halo) {
        drawStarGlow(context, x, y, star.halo, star.color, opacity * 0.18)
      }

      if (star.streak && opacity > 0.22) {
        context.save()
        context.strokeStyle = rgba(star.color, opacity * 0.1)
        context.lineWidth = 0.8
        context.beginPath()
        context.moveTo(x, y)
        context.lineTo(
          x - Math.cos(spiralAngle) * (7 + star.size * 4),
          y - Math.sin(spiralAngle) * (4 + star.size * 3) * galaxy.flatten,
        )
        context.stroke()
        context.restore()
      }

      context.fillStyle = rgba(star.color, opacity)
      context.beginPath()
      context.arc(x, y, star.size, 0, Math.PI * 2)
      context.fill()
    })

    comets.forEach((comet) => {
      drawComet(context, comet, elapsed, pointer)
    })

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