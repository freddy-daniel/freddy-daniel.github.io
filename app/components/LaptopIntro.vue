<script setup lang="ts">
import { personal } from '~/data/profile'

/*
 * A closed laptop on a desk in a plain room, seen from slightly in front.
 * Scrolling, clicking it, or waiting a moment opens the lid, turns the laptop
 * to face you while the view pulls back to show the room, then zooms into the
 * screen, which shows a scaled copy of the real page. At the end of the zoom
 * the copy lines up pixel for pixel with the page underneath.
 *
 * Progress is how far into the runway the visitor has scrolled. Once the
 * laptop is fully open the runway is removed ("collapsed"), so the top of the
 * page is a real top: a fast scroll back up stops there instead of running
 * on into the laptop. Only a fresh, deliberate scroll or pull upwards at the
 * top brings the runway back, and further scrolling then closes the laptop.
 *
 * The zoom is done on a flat copy of the screen laid over the 3D one.
 * Browsers render layers inside a perspective scene at their unzoomed size, so
 * zooming the 3D screen would blur the page right before the hand-off.
 */

// Viewing angle at rest (a little in front of straight down) and at the end
// (facing the screen), plus the slight twist on the desk at rest.
const TILT_START = 32
const TILT_END = 72
const YAW_START = -11
// Lid opening angle relative to the base. TILT_END + LID = 180 puts the screen
// exactly face-on at the end, so the zoom needs no 3D correction.
const LID = 180 - TILT_END

const AUTO_OPEN_DELAY = 2500
const AUTO_OPEN_DURATION = 2800

// Must match the inline script in nuxt.config.ts, which reads it before first
// paint so that a reload after opening goes straight to the page.
const STORAGE_KEY = 'laptop-open'

// How much upward intent at the top of the page closes the laptop again.
const PULL_WHEEL = 240
const PULL_TOUCH = 100
// Wheel events closer together than this are one gesture (or its momentum).
const GESTURE_GAP = 150
// After the page comes to rest at the top, scrolling only counts after this
// long, so arriving at the top never closes the laptop by itself.
const SETTLE = 500

// Thickness is built from stacked outlines, which keeps the rounded corners
// correct from every angle. Colours run from the lit chamfer to the underside.
const baseEdges = ['#58627a', '#3a4252', '#30374a', '#2a3141', '#252b39', '#202531', '#1b1f29']
const lidEdges = ['#08090c', '#2c3343', '#56607a']
const deskEdges = ['#e1b987', '#d3a671', '#cc9e69', '#c69763', '#c0905c', '#b98955', '#b2824f', '#aa7a48', '#a17142', '#97683b']
const deskLegs = [
  { x: 'left', y: 'front' },
  { x: 'right', y: 'front' },
  { x: 'left', y: 'back' },
  { x: 'right', y: 'back' },
] as const

const ones = (n: number) => Array.from({ length: n }, () => 1)
// Relative key widths per row, roughly a laptop layout.
const keyRows = [
  ones(14),
  [...ones(13), 1.5],
  [1.5, ...ones(13)],
  [1.8, ...ones(11), 1.8],
  [2.35, ...ones(10), 2.35],
  [1, 1, 1, 1.25, 5.1, 1.25, 1, 3],
]

const runway = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const camera = ref<HTMLElement | null>(null)
const world = ref<HTMLElement | null>(null)
const laptop = ref<HTMLElement | null>(null)
const lid = ref<HTMLElement | null>(null)
const display = ref<HTMLElement | null>(null)
const screen = ref<HTMLElement | null>(null)
const cta = ref<HTMLElement | null>(null)
const closeHint = ref(false)

// Where the display sits once the laptop faces the viewer, and where the page
// copy sits inside it so that at full zoom it maps exactly onto the viewport.
const layout = reactive({
  screen: { width: 0, height: 0, left: 0, top: 0 },
  replica: { width: 0, height: 0, left: 0, top: 0, scale: 1 },
})

let runwayLength = 1
let lidHeight = 0
let zoomMax = 1
// How far the view pulls back while the laptop opens, to show the room.
let pullBack = 0.6
let frame = 0
let tween = 0
let autoTimer: ReturnType<typeof setTimeout> | undefined

let collapsed = false
let pull = 0
let pullTimer: ReturnType<typeof setTimeout> | undefined
// When the page last came to rest at the top, and the previous wheel event.
let restingSince = 0
let lastWheel = 0
let lastDelta = 0
let touchStartY: number | null = null

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
const px = (v: number) => `${v}px`

function remember(open: boolean) {
  try {
    if (open) sessionStorage.setItem(STORAGE_KEY, '1')
    else sessionStorage.removeItem(STORAGE_KEY)
  }
  catch {
    // Storage blocked: reloads simply show the laptop again.
  }
}

function measure() {
  if (!stage.value || !display.value || !laptop.value || !runway.value) return
  const sw = stage.value.clientWidth
  const sh = stage.value.clientHeight
  const dw = display.value.offsetWidth
  const dh = display.value.offsetHeight

  runwayLength = runway.value.offsetHeight
  lidHeight = laptop.value.offsetHeight
  // Cover, not contain: the screen must fill the viewport on any aspect ratio.
  zoomMax = Math.max(sw / dw, sh / dh) * 1.002
  // Enough to fit the whole desk (2.6 laptops wide) on screen, legs and all.
  pullBack = Math.min(0.62, Math.max(0.4, (0.9 * sw) / (2.6 * laptop.value.offsetWidth)))

  layout.screen = { width: dw, height: dh, left: (sw - dw) / 2, top: (sh - dh) / 2 }
  layout.replica = { width: sw, height: sh, left: (dw - sw) / 2, top: (dh - sh) / 2, scale: 1 / zoomMax }
}

function render() {
  frame = 0
  if (collapsed) return
  if (!stage.value || !camera.value || !world.value || !laptop.value || !lid.value || !screen.value || !cta.value) return

  if (window.scrollY >= runwayLength - 1) {
    collapse()
    return
  }

  const p = clamp(window.scrollY / runwayLength)
  const lift = easeInOut(clamp(p / 0.42))
  const turn = easeInOut(clamp((p - 0.08) / 0.42))
  const back = easeInOut(clamp(p / 0.5))
  const zoom = easeInOut(clamp((p - 0.6) / 0.4))

  const tilt = TILT_START + (TILT_END - TILT_START) * turn
  const open = LID * lift
  // Keep the lid centred on screen while it swings from below the hinge to above it.
  const shift = (lidHeight / 2) * (1 - Math.cos(((tilt + open) * Math.PI) / 180))
  // Pull back to show the room, then zoom from there into the screen.
  const scale = (1 + (pullBack - 1) * back) * (zoomMax / pullBack) ** zoom

  world.value.style.transform = `translateY(${shift}px) rotateX(${tilt}deg)`
  laptop.value.style.transform = `rotateZ(${YAW_START * (1 - turn)}deg)`
  lid.value.style.transform = `rotateX(${open}deg)`
  camera.value.style.transform = `scale(${scale})`
  // Once the laptop faces the viewer the flat screen takes over from the 3D one.
  // 'inherit', not 'visible': a visible child would outlast a hidden stage.
  screen.value.style.visibility = p >= 0.5 ? 'inherit' : ''
  screen.value.style.transform = `scale(${scale})`
  cta.value.style.opacity = String(1 - clamp(p / 0.08))
  cta.value.style.visibility = p > 0.08 ? 'hidden' : ''
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(render)
}

// The laptop is fully open: drop the runway so the page starts at the top.
function collapse() {
  stopAuto()
  const target = Math.max(0, window.scrollY - runwayLength)
  collapsed = true
  restingSince = performance.now()
  document.documentElement.classList.add('intro-done')
  remember(true)
  // Chrome's scroll anchoring usually compensates already; Safari does not.
  if (Math.abs(window.scrollY - target) > 1) window.scrollTo({ top: target, behavior: 'instant' })
}

// Bring the runway back, positioned at the fully open end, so that further
// scrolling up closes the laptop.
function reopen() {
  resetPull()
  collapsed = false
  document.documentElement.classList.remove('intro-done')
  remember(false)
  measure()
  window.scrollTo({ top: runwayLength - 3, behavior: 'instant' })
  render()
}

function resetPull() {
  clearTimeout(pullTimer)
  pull = 0
  closeHint.value = false
}

function addPull(amount: number, threshold: number) {
  pull += amount
  closeHint.value = true
  clearTimeout(pullTimer)
  pullTimer = setTimeout(resetPull, 900)
  if (pull >= threshold) reopen()
}

function onScroll() {
  if (!collapsed) return schedule()
  // Each arrival at the top restarts the settle time.
  if (window.scrollY > 0) {
    restingSince = Infinity
    if (pull) resetPull()
  }
  else if (restingSince === Infinity) {
    restingSince = performance.now()
  }
}

// Upward scrolling at the top counts towards closing the laptop, except:
// - during the settle time after arriving there, unless it is a fresh gesture
//   after a pause, and
// - trackpad momentum, which arrives as a stream of steadily shrinking deltas.
// A mouse wheel (equal steps) or fingers still moving on a trackpad keep counting.
function onWheel(e: WheelEvent) {
  if (!collapsed) return
  const now = performance.now()
  const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
  const delta = Math.abs(e.deltaY) * unit
  const fresh = now - lastWheel >= GESTURE_GAP
  const coasting = !fresh && delta < lastDelta
  lastWheel = now
  lastDelta = delta
  if (window.scrollY > 0 || e.deltaY >= 0) return
  if (!fresh && now - restingSince < SETTLE) return
  if (coasting || delta < 2) return
  addPull(delta, PULL_WHEEL)
}

function onTouchStart(e: TouchEvent) {
  touchStartY = collapsed && window.scrollY === 0 ? e.touches[0]!.clientY : null
}

// Also counts a drag that began lower down: once the page reaches the top,
// further pulling is measured from there.
function onTouchMove(e: TouchEvent) {
  if (!collapsed || window.scrollY > 0) return
  const y = e.touches[0]!.clientY
  if (touchStartY === null) {
    touchStartY = y
    return
  }
  const distance = y - touchStartY
  if (distance > 12) {
    pull = 0
    addPull(distance, PULL_TOUCH)
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (!collapsed || window.scrollY > 0) return
  if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'Home') addPull(PULL_WHEEL / 2, PULL_WHEEL)
}

function onResize() {
  if (collapsed) return
  measure()
  schedule()
}

function stopAuto() {
  clearTimeout(autoTimer)
  cancelAnimationFrame(tween)
  tween = 0
}

// Opening is just scrolling to the end of the runway, so the button, a click
// on the laptop, the timer and the scroll wheel all end up in the same place.
function openLaptop() {
  stopAuto()
  if (collapsed) return
  const from = window.scrollY
  const to = runwayLength
  if (from >= to) return
  const duration = Math.max(600, AUTO_OPEN_DURATION * (1 - from / to))
  const start = performance.now()

  const step = (now: number) => {
    const t = clamp((now - start) / duration)
    window.scrollTo({ top: from + (to - from) * easeInOut(t), behavior: 'instant' })
    tween = t < 1 ? requestAnimationFrame(step) : 0
  }
  tween = requestAnimationFrame(step)
}

// Any sign of the visitor taking control cancels the automatic opening.
const userInput = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const

const route = useRoute()

// A link straight to a section of the page skips the laptop. Collapse first,
// then jump: a smooth scroll aimed at the section's position with the runway
// still in place would overshoot by the runway's height once it collapses.
// On first load the router has the hash before the address bar does.
function goToLinkedSection() {
  const id = decodeURIComponent((window.location.hash || route.hash).slice(1))
  const target = id ? document.getElementById(id) : null
  if (!target?.closest('main')) return
  if (!collapsed) collapse()
  target.scrollIntoView({ behavior: 'instant' })
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  collapsed = document.documentElement.classList.contains('intro-done')
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  window.addEventListener('wheel', onWheel, { passive: true })
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: true })
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('hashchange', goToLinkedSection)
  for (const type of userInput) window.addEventListener(type, stopAuto, { passive: true })

  if (!collapsed) {
    measure()
    goToLinkedSection()
  }
  if (!collapsed) {
    measure()
    render()
    if (window.scrollY === 0) autoTimer = setTimeout(openLaptop, AUTO_OPEN_DELAY)
  }
})

onBeforeUnmount(() => {
  stopAuto()
  resetPull()
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('wheel', onWheel)
  window.removeEventListener('touchstart', onTouchStart)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('hashchange', goToLinkedSection)
  for (const type of userInput) window.removeEventListener(type, stopAuto)
})

const replicaStyle = computed(() => ({
  width: px(layout.replica.width),
  height: px(layout.replica.height),
  left: px(layout.replica.left),
  top: px(layout.replica.top),
  transform: `scale(${layout.replica.scale})`,
}))
</script>

<template>
  <div ref="runway" class="intro-runway" />

  <div ref="stage" class="intro-stage">
    <div ref="camera" class="camera" @click="openLaptop">
      <div ref="world" class="world" aria-hidden="true">
        <!-- The room: a wall with a framed photo and a print, the floor and
             skirting board, and a desk with a top, an edge and legs. -->
        <div class="wall" />
        <div class="wall-art">
          <div class="print print-photo">
            <img src="/robodog-print.jpg" alt="" width="600" height="600" decoding="async">
          </div>
          <div class="print print-arches">
            <svg viewBox="0 0 100 130" preserveAspectRatio="none">
              <rect width="100" height="130" fill="#f2ece1" />
              <path d="M18 108V70a32 32 0 0 1 64 0v38Z" fill="#243042" />
              <path d="M30 108V72a20 20 0 0 1 40 0v36Z" fill="#c8643f" />
              <path d="M41 108V74a9 9 0 0 1 18 0v34Z" fill="#e9ddc6" />
              <rect x="10" y="108" width="80" height="3" fill="#243042" />
            </svg>
          </div>
        </div>
        <div class="floor" />
        <div class="skirting" />
        <div
          v-for="(leg, i) in deskLegs"
          :key="`leg${i}`"
          class="desk-leg"
          :class="[`desk-leg-${leg.x}`, `desk-leg-${leg.y}`]"
        />
        <div
          v-for="(color, i) in deskEdges"
          :key="`d${i}`"
          class="desk-edge"
          :style="{ borderColor: color, transform: `translateZ(calc(var(--desk-z) - var(--desk-t) * ${(i + 1) / deskEdges.length}))` }"
        />
        <div class="desk-top" />

        <div ref="laptop" class="laptop">
          <div class="contact-shadow" />
          <div
            v-for="(color, i) in baseEdges"
            :key="`b${i}`"
            class="edge"
            :style="{ borderColor: color, transform: `translateZ(calc(var(--base-t) * ${-(i + 1) / baseEdges.length}))` }"
          />
          <div class="notch" />

          <div class="deck">
            <div class="keyboard">
              <div v-for="(row, r) in keyRows" :key="r" class="key-row">
                <span v-for="(w, k) in row" :key="k" class="key" :style="{ flexGrow: w }" />
              </div>
            </div>
            <div class="trackpad" />
          </div>

          <div ref="lid" class="lid">
            <div class="lid-inside">
              <div ref="display" class="display">
                <div class="replica" inert :style="replicaStyle">
                  <ClientOnly>
                    <ResumePage preview />
                  </ClientOnly>
                </div>
              </div>
            </div>
            <div
              v-for="(color, i) in lidEdges"
              :key="`l${i}`"
              class="edge"
              :style="{ borderColor: color, transform: `translateZ(calc(var(--lid-t) * ${(i + 0.5) / lidEdges.length}))` }"
            />
            <div class="lid-outside">
              <span class="brand-name">{{ personal.name }}</span>
              <span class="brand-title">{{ personal.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      ref="screen"
      class="flat-screen"
      aria-hidden="true"
      :style="{
        width: px(layout.screen.width),
        height: px(layout.screen.height),
        left: px(layout.screen.left),
        top: px(layout.screen.top),
      }"
    >
      <div class="replica" inert :style="replicaStyle">
        <ClientOnly>
          <ResumePage preview />
        </ClientOnly>
      </div>
    </div>

    <div ref="cta" class="cta">
      <button type="button" class="open-button" @click="openLaptop">
        Open the laptop
        <span class="open-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </span>
      </button>
      <p class="cta-hint">or just scroll</p>
    </div>
  </div>

  <div class="close-hint" :class="{ show: closeHint }" aria-hidden="true">
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 13V3M4 7l4-4 4 4" />
    </svg>
    Keep scrolling up to close the laptop
  </div>
</template>

<style scoped>
/* Shown only with JavaScript (see nuxt.config.ts), only when motion is
   welcome, and not once the laptop has been opened in this tab. */
.intro-runway,
.intro-stage {
  display: none;
}

:global(html.js .intro-runway) {
  display: block;
  height: 160vh;
}

:global(html.js .intro-stage) {
  display: block;
}

:global(html.js.intro-done .intro-runway),
:global(html.js.intro-done .intro-stage) {
  display: none;
}

@media (prefers-reduced-motion: reduce), print {
  :global(html.js .intro-runway),
  :global(html.js .intro-stage) {
    display: none;
  }
}

.intro-stage {
  /* 74vw leaves room for the twist and perspective on a phone. */
  --lw: min(560px, 74vw, 60svh);
  --lh: calc(var(--lw) * 0.69);
  --radius: calc(var(--lw) * 0.034);
  --bezel: calc(var(--lw) * 0.025);
  --base-t: calc(var(--lw) * 0.021);
  --lid-t: calc(var(--lw) * 0.01);

  /* The desk, in laptop units: about 80 x 52 cm, 2.6 cm thick, 73 cm high,
     with the laptop near its front edge. Small enough that the whole desk,
     all four legs included, fits on screen when the view pulls back. */
  --desk-w: calc(var(--lw) * 2.6);
  --desk-d: calc(var(--lh) * 2.4);
  --desk-front: calc(var(--lh) * 1.45);
  --desk-t: calc(var(--lh) * 0.12);
  --desk-h: calc(var(--lh) * 3.4);
  --desk-z: calc(var(--base-t) * -1 - 2px);
  --floor-z: calc(var(--desk-z) - var(--desk-t) - var(--desk-h));
  /* The wall line, about 25 cm behind the desk, and the wall's height above the floor. */
  --wall-gap: calc(var(--lh) * 1.2);
  --wall-y: calc(var(--desk-front) - var(--desk-d) - var(--wall-gap));
  --wall-h: calc(var(--desk-h) + var(--desk-t) + var(--lh) * 5);

  position: fixed;
  inset: 0;
  z-index: 40;
  overflow: hidden;
  /* Behind the room's wall, in case any of the stage is not covered by it. */
  background-color: #ece9e3;
}

.camera {
  position: absolute;
  inset: 0;
  perspective: calc(var(--lw) * 4);
  transform-origin: 50% 50%;
  cursor: pointer;
}

/* The room and the laptop share this space; it tilts as a whole. */
.world {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--lw);
  height: var(--lh);
  margin-top: calc(var(--lh) / -2);
  margin-left: calc(var(--lw) / -2);
  transform-style: preserve-3d;
  /* The hinge. Both the tilt and the lid rotate around this edge. */
  transform-origin: 50% 0;
  /* Resting pose, so the first paint matches what the script renders at the top. */
  transform: translateY(calc(var(--lh) * 0.5 * (1 - cos(32deg)))) rotateX(32deg);
}

/* Room */

/* Stands up from the floor along the wall line, a pixel behind it so the two
   planes never touch. Laid out at a third of its size and scaled up, like the
   floor: it is a soft gradient, so this costs nothing visible. */
.wall {
  position: absolute;
  top: calc(var(--wall-y) - 1px - var(--wall-h) / 3);
  left: 50%;
  width: calc(var(--lw) * 16 / 3);
  height: calc(var(--wall-h) / 3);
  margin-left: calc(var(--lw) * -8 / 3);
  transform-origin: 50% 100%;
  transform: translateZ(calc(var(--floor-z) + 1px)) rotateX(-90deg) scale(3);
  /* Daylight from the upper left. */
  background: linear-gradient(165deg, #f4f2ed 0%, #eeebe5 45%, #e4dfd6 100%);
}

/* A framed photo and a print above the desk, either side of the laptop. A plane
   just in front of the wall, from 0.8 to 2.2 laptop-depths above the desk top. */
.wall-art {
  position: absolute;
  top: calc(var(--wall-y) - var(--lh) * 1.4);
  left: 50%;
  width: calc(var(--lw) * 2.9);
  height: calc(var(--lh) * 1.4);
  margin-left: calc(var(--lw) * -1.45);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  transform-origin: 50% 100%;
  transform: translateZ(calc(var(--desk-z) + var(--lh) * 0.8)) rotateX(-90deg);
}

.print {
  padding: calc(var(--lw) * 0.032);
  border: calc(var(--lw) * 0.011) solid #2b2723;
  background-color: #faf8f3;
  box-shadow:
    calc(var(--lw) * -0.012) calc(var(--lw) * 0.022) calc(var(--lw) * 0.045) rgb(50 36 22 / 0.2),
    inset 0 0 0 1px rgb(0 0 0 / 0.04);
}

.print svg,
.print img {
  display: block;
  width: 100%;
  height: 100%;
}

/* public/robodog.jpg, square, in a black frame with a wide white mat. */
.print-photo {
  width: calc(var(--lw) * 0.74);
  aspect-ratio: 1;
  padding: calc(var(--lw) * 0.06);
}

.print-photo img {
  object-fit: cover;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.1);
}

.print-arches {
  width: calc(var(--lw) * 0.52);
  height: calc(var(--lh) * 0.97);
  margin-top: calc(var(--lh) * 0.12);
}

/* Laid out at a third of its size and scaled up: it is a soft gradient, so
   the browser can rasterise far less of it with no visible difference. */
.floor {
  position: absolute;
  top: calc(var(--wall-y) + 1px);
  left: 50%;
  width: calc(var(--lw) * 16 / 3);
  height: calc(var(--lh) * 2);
  margin-left: calc(var(--lw) * -8 / 3);
  transform-origin: 50% 0;
  transform: translateZ(var(--floor-z)) scale(3);
  /* The soft shadow sits under the desk: its centre is 2.4 laptop-depths from
     the wall (the gap plus half the desk), 40% of the floor's depth. */
  background:
    radial-gradient(ellipse 10% 14% at 50% 40%, rgb(60 45 30 / 0.2), transparent 100%),
    linear-gradient(180deg, #cbc5bb 0%, #d5d0c7 40%, #dcd8d0 100%);
}

.skirting {
  position: absolute;
  top: calc(var(--wall-y) - var(--lh) * 0.22 / 3);
  left: 50%;
  width: calc(var(--lw) * 16 / 3);
  height: calc(var(--lh) * 0.22 / 3);
  margin-left: calc(var(--lw) * -8 / 3);
  transform-origin: 50% 100%;
  /* Raised a hair off the floor, for the same reason as the desk legs. */
  transform: translateZ(calc(var(--floor-z) + 1px)) rotateX(-90deg) scale(3);
  background: linear-gradient(180deg, #faf9f6, #ece9e3);
  box-shadow: 0 1px 0 rgb(0 0 0 / 0.08);
}

.desk-top,
.desk-edge {
  position: absolute;
  top: calc(var(--desk-front) - var(--desk-d));
  left: 50%;
  width: var(--desk-w);
  height: var(--desk-d);
  margin-left: calc(var(--desk-w) / -2);
  border-radius: calc(var(--lw) * 0.03);
}

.desk-top {
  transform: translateZ(var(--desk-z));
  background:
    radial-gradient(ellipse 60% 70% at 60% 55%, rgb(255 246 230 / 0.22), transparent 70%),
    url('/wood.jpg') 0 0 / calc(var(--lw) * 2.3) auto repeat;
  box-shadow: inset 0 0 0 1px rgb(255 240 215 / 0.35);
}

/* One slice of the desk's edge. */
.desk-edge {
  border: calc(var(--lw) * 0.03) solid;
}

/* Slim black steel legs at the corners, hanging from the underside of the top.
   Each leg's plane sits just outside the desk's front or back edge and stops a
   hair short of the top and the floor. A leg plane that cuts through the desk
   top makes Chrome drop whole pieces of it from the 3D scene. */
.desk-leg {
  position: absolute;
  width: calc(var(--lw) * 0.05);
  height: calc(var(--desk-h) - 4px);
  transform-origin: 50% 0;
  transform: translateZ(calc(var(--desk-z) - var(--desk-t) - 2px)) rotateX(-90deg);
  background: linear-gradient(90deg, #1b1c1f, #3b3d42 45%, #1b1c1f);
}

.desk-leg-left {
  left: calc(50% - var(--desk-w) / 2 + var(--lw) * 0.02);
}

.desk-leg-right {
  left: calc(50% + var(--desk-w) / 2 - var(--lw) * 0.07);
}

.desk-leg-front {
  top: calc(var(--desk-front) + 1px);
}

.desk-leg-back {
  top: calc(var(--desk-front) - var(--desk-d) - 1px);
}

/* Laptop */

.laptop {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
  transform: rotateZ(-11deg);
}

.contact-shadow {
  position: absolute;
  inset: 1.5%;
  border-radius: var(--radius);
  background-color: #14100c;
  transform: translateZ(calc(var(--base-t) * -1 - 1px));
  box-shadow:
    0 0 calc(var(--lw) * 0.012) calc(var(--lw) * 0.004) rgb(20 12 4 / 0.55),
    calc(var(--lw) * -0.025) calc(var(--lw) * 0.04) calc(var(--lw) * 0.1) rgb(60 34 10 / 0.45);
}

/* One slice of the laptop body's side wall. */
.edge {
  position: absolute;
  inset: 0;
  border: calc(var(--lw) * 0.012) solid;
  border-radius: var(--radius);
}

/* The finger recess at the front edge, where you lift the lid. */
.notch {
  position: absolute;
  top: 100%;
  left: 43%;
  right: 43%;
  height: calc(var(--base-t) * 0.7);
  margin-top: 0.5px;
  border-radius: 0 0 calc(var(--lw) * 0.02) calc(var(--lw) * 0.02);
  background: linear-gradient(180deg, #07080b, #1a1f29);
  transform-origin: 50% 0;
  transform: rotateX(-90deg);
}

.deck {
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
  background: linear-gradient(180deg, #313a4b 0%, #2a3242 100%);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.07);
}

.keyboard {
  position: absolute;
  top: 7%;
  left: 6.5%;
  right: 6.5%;
  height: 46%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--lw) * 0.006);
  padding: calc(var(--lw) * 0.007);
  border-radius: calc(var(--lw) * 0.008);
  background-color: #151a21;
}

.key-row {
  display: flex;
  flex: 1;
  gap: calc(var(--lw) * 0.006);
}

.key-row:first-child {
  flex: 0.6;
}

.key {
  flex-basis: 0;
  border-radius: calc(var(--lw) * 0.004);
  background-color: #0c0f13;
  box-shadow: inset 0 -1px 0 rgb(255 255 255 / 0.05);
}

.trackpad {
  position: absolute;
  top: 59%;
  bottom: 6%;
  left: 30%;
  right: 30%;
  border-radius: calc(var(--lw) * 0.012);
  background-color: #323b4c;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.06);
}

.lid {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform-origin: 50% 0;
}

.lid-inside,
.lid-outside {
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

/* Pre-flipped so it reads the right way up once the lid has swung 180 degrees. */
.lid-inside {
  transform: rotateX(180deg);
  background-color: #0a0c10;
}

/* Bezel is equal on all sides so the screen centre is the lid centre,
   which is what the zoom is anchored on. */
.display {
  position: absolute;
  inset: var(--bezel);
  overflow: hidden;
  border-radius: calc(var(--lw) * 0.006);
  background-color: #ffffff;
}

/* Anodised midnight aluminium: a broad sheen from the top right, a faint
   grain, and a lit rim along the chamfer. */
.lid-outside {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(var(--lw) * 0.012);
  transform: translateZ(var(--lid-t));
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0.07 0 0 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"),
    linear-gradient(118deg, #1d2331 0%, #242b3a 30%, #2f384b 60%, #343d51 74%, #2a3142 100%);
  box-shadow:
    inset -1.5px 1.5px 0 rgb(255 255 255 / 0.16),
    inset 0 0 0 1px rgb(255 255 255 / 0.07),
    inset 0 0 calc(var(--lw) * 0.008) rgb(255 255 255 / 0.05);
}

/* Dark lettering pressed into the lid, like the logo on a midnight finish:
   a faint light edge underneath sells the engraving. */
.brand-name {
  font-family: var(--font-serif);
  font-size: calc(var(--lw) * 0.072);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.005em;
  color: #11151b;
  text-shadow: 0 1px 0 rgb(255 255 255 / 0.08);
}

.brand-title {
  /* Floor keeps it legible on a phone, where the lid is small. */
  font-size: max(calc(var(--lw) * 0.024), 10px);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #6f7a90;
}

/* Flat copy of the screen used for the zoom (see the note at the top). */
.flat-screen {
  position: absolute;
  z-index: 1;
  overflow: hidden;
  visibility: hidden;
  border-radius: calc(var(--lw) * 0.006);
  background-color: #ffffff;
  transform-origin: 50% 50%;
  pointer-events: none;
}

/* Its own scroll container, so the page's sticky sidebar sticks to the top of
   the copy rather than to the edge of the display around it. */
.replica {
  position: absolute;
  overflow: hidden;
  transform-origin: 50% 50%;
  background-color: #ffffff;
}

/* Call to action */

.cta {
  position: absolute;
  bottom: max(6vh, 1.5rem);
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  pointer-events: none;
}

.open-button {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.55rem 0.55rem 0.55rem 1.6rem;
  border-radius: 999px;
  background-color: rgb(255 255 255 / 0.94);
  color: var(--color-navy);
  font-family: var(--font-sans);
  font-size: 1.0625rem;
  font-weight: 600;
  letter-spacing: 0.005em;
  cursor: pointer;
  pointer-events: auto;
  box-shadow:
    0 1px 2px rgb(40 24 8 / 0.18),
    0 12px 32px -10px rgb(40 24 8 / 0.55);
  transition: transform 180ms, box-shadow 180ms;
}

.open-button:hover {
  transform: translateY(-2px);
  box-shadow:
    0 1px 2px rgb(40 24 8 / 0.18),
    0 18px 38px -10px rgb(40 24 8 / 0.6);
}

.open-icon {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 999px;
  background-color: var(--color-navy);
  color: #ffffff;
  transition: transform 180ms;
}

.open-button:hover .open-icon {
  transform: translateX(3px);
}

.cta-hint {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: rgb(255 255 255 / 0.92);
  text-shadow: 0 1px 3px rgb(40 24 8 / 0.6);
}

/* Shown while the visitor is pulling up at the top of the page. */
.close-hint {
  position: fixed;
  top: 1rem;
  left: 50%;
  z-index: 50;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.95rem;
  border-radius: 999px;
  background-color: var(--color-navy);
  color: #ffffff;
  font-size: 0.875rem;
  opacity: 0;
  transform: translate(-50%, -6px);
  transition: opacity 180ms, transform 180ms;
  pointer-events: none;
}

.close-hint.show {
  opacity: 1;
  transform: translate(-50%, 0);
}
</style>
