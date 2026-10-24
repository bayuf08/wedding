<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
const props = defineProps<{ text: string }>()
const canvas = ref<HTMLCanvasElement | null>(null)
let frame = 0
let media: MediaQueryList | undefined
let points: { x: number; y: number }[] = []
let cleanup = () => {}
function draw(instant = false) {
  const targetCanvas = canvas.value
  const context = targetCanvas?.getContext('2d')
  if (!targetCanvas || !context) return
  cancelAnimationFrame(frame)
  const width = 480, height = 130
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  targetCanvas.width = width * ratio; targetCanvas.height = height * ratio
  context.scale(ratio, ratio)
  const stencil = document.createElement('canvas')
  stencil.width = width; stencil.height = height
  const ink = stencil.getContext('2d')
  if (!ink) return
  const text = props.text.toUpperCase()
  ink.font = '600 64px Arial, sans-serif'
  const size = Math.min(64, 64 * (width - 24) / Math.max(1, ink.measureText(text).width))
  ink.font = `600 ${size}px Arial, sans-serif`; ink.textAlign = 'center'; ink.textBaseline = 'middle'
  ink.fillText(text, width / 2, height / 2)
  const pixels = ink.getImageData(0, 0, width, height).data
  const targets: { x: number; y: number }[] = []
  for (let y = 12; y < height - 12; y += 3) for (let x = 12; x < width - 12; x += 3) if ((pixels[(y * width + x) * 4 + 3] || 0) > 100) targets.push({ x, y })
  const start = targets.map((point, index) => points[index] || { x: point.x, y: height / 2 })
  const color = getComputedStyle(targetCanvas).color
  const paint = (progress: number) => {
    context.clearRect(0, 0, width, height); context.fillStyle = color
    points = targets.map((point, index) => {
      const from = start[index] || point
      const current = { x: from.x + (point.x - from.x) * progress, y: from.y + (point.y - from.y) * progress }
      context.beginPath(); context.arc(current.x, current.y, .85, 0, Math.PI * 2); context.fill()
      return current
    })
  }
  if (instant || media?.matches || targetCanvas.getBoundingClientRect().width === 0) { paint(1); return }
  const started = performance.now()
  const tick = (now: number) => {
    const time = Math.min(1, (now - started) / 450)
    paint(1 - (1 - time) ** 5)
    if (time < 1) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
}
onMounted(() => {
  media = window.matchMedia('(prefers-reduced-motion: reduce)')
  const updateMotion = () => draw(true)
  media.addEventListener('change', updateMotion)
  cleanup = () => media?.removeEventListener('change', updateMotion)
  draw(true)
})
watch(() => props.text, () => draw())
onBeforeUnmount(() => { cancelAnimationFrame(frame); cleanup() })
</script>
<template>
  <div class="form-companion" aria-hidden="true" :data-context="text">
    <span class="companion-caption">A moment for you</span>
    <canvas ref="canvas" />
    <span class="companion-caption">Bayu &amp; Hilwa</span>
  </div>
</template>
