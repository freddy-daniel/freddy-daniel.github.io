<script setup lang="ts">
/**
 * Reconstruction of the fall-detection calibration tool.
 *
 * The ML model reports "a person is lying down" plus a bounding box. On its
 * own that is not actionable: lying down in a bed is normal, lying down on the
 * floor is an emergency. Ward staff draw the zones, so the tool has to be
 * usable by someone who is not an engineer.
 */
import * as fabric from 'fabric'

type ZoneType = 'bed' | 'chair' | 'floor'

const ZONES: Record<ZoneType, { label: string, stroke: string, fill: string, severity: string }> = {
  bed: { label: 'Bed', stroke: '#38bdf8', fill: 'rgba(56,189,248,0.22)', severity: 'expected' },
  chair: { label: 'Chair', stroke: '#fbbf24', fill: 'rgba(251,191,36,0.22)', severity: 'expected' },
  floor: { label: 'Floor', stroke: '#fb7185', fill: 'rgba(251,113,133,0.22)', severity: 'alert' },
}

const wrap = ref<HTMLDivElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
const active = ref<ZoneType>('bed')
const drawing = ref(false)
const pointCount = ref(0)
const zones = ref<{ id: number, type: ZoneType, points: number }[]>([])
const exported = ref('')

let canvas: fabric.Canvas | null = null
let pending: { x: number, y: number }[] = []
let markers: fabric.Object[] = []
let guide: fabric.Polyline | null = null
let nextId = 1

const W = 800
const H = 450

function scenePoint(opt: fabric.TPointerEventInfo) {
  // getScenePoint is the v6 replacement for the old getPointer.
  const c = canvas!
  return typeof c.getScenePoint === 'function' ? c.getScenePoint(opt.e) : c.getPointer(opt.e)
}

/** Stand-in for the still frame pulled off the room camera. */
function buildBackdrop() {
  const c = canvas!
  const base: Partial<fabric.FabricObject> = { selectable: false, evented: false, hoverCursor: 'crosshair' }

  c.add(new fabric.Rect({ left: 0, top: 0, width: W, height: H, fill: '#111827', ...base }))
  c.add(new fabric.Polygon(
    [{ x: 0, y: H }, { x: W, y: H }, { x: W * 0.82, y: H * 0.34 }, { x: W * 0.18, y: H * 0.34 }],
    { fill: '#1f2937', stroke: '#374151', strokeWidth: 1, ...base },
  ))
  c.add(new fabric.Rect({
    left: 70, top: 170, width: 250, height: 150, rx: 6,
    fill: '#334155', stroke: '#475569', strokeWidth: 2, ...base,
  }))
  c.add(new fabric.Rect({
    left: 80, top: 180, width: 230, height: 44, rx: 4, fill: '#475569', ...base,
  }))
  c.add(new fabric.Rect({
    left: 560, top: 210, width: 110, height: 110, rx: 6,
    fill: '#3f3f46', stroke: '#52525b', strokeWidth: 2, ...base,
  }))
  c.add(new fabric.FabricText('camera 01 · still frame', {
    left: 16, top: 16, fontSize: 13, fontFamily: 'ui-monospace, Menlo, monospace',
    fill: '#64748b', ...base,
  }))
}

function clearPending() {
  const c = canvas!
  markers.forEach(m => c.remove(m))
  markers = []
  if (guide) { c.remove(guide); guide = null }
  pending = []
  pointCount.value = 0
  drawing.value = false
  c.requestRenderAll()
}

function redrawGuide() {
  const c = canvas!
  if (guide) c.remove(guide)
  if (pending.length < 2) { guide = null; return }
  guide = new fabric.Polyline(pending, {
    stroke: ZONES[active.value].stroke,
    strokeWidth: 2,
    strokeDashArray: [5, 4],
    fill: 'transparent',
    selectable: false,
    evented: false,
    objectCaching: false,
  })
  c.add(guide)
}

function addPoint(x: number, y: number) {
  const c = canvas!
  pending.push({ x, y })
  pointCount.value = pending.length
  drawing.value = true
  const dot = new fabric.Circle({
    left: x, top: y, radius: 4, originX: 'center', originY: 'center',
    fill: ZONES[active.value].stroke, stroke: '#0b1220', strokeWidth: 1,
    selectable: false, evented: false,
  })
  markers.push(dot)
  c.add(dot)
  redrawGuide()
  c.requestRenderAll()
}

function closeZone() {
  if (pending.length < 3) return
  const c = canvas!
  const type = active.value
  const poly = new fabric.Polygon(pending, {
    fill: ZONES[type].fill,
    stroke: ZONES[type].stroke,
    strokeWidth: 2,
    objectCaching: false,
    cornerColor: ZONES[type].stroke,
    cornerStyle: 'circle',
    transparentCorners: false,
    borderColor: ZONES[type].stroke,
  })
  // Stash the zone type on the object so export can read it back.
  ;(poly as fabric.Polygon & { zoneType?: ZoneType, zoneId?: number }).zoneType = type
  ;(poly as fabric.Polygon & { zoneType?: ZoneType, zoneId?: number }).zoneId = nextId

  zones.value = [...zones.value, { id: nextId, type, points: pending.length }]
  nextId += 1
  c.add(poly)
  clearPending()
  c.setActiveObject(poly)
  c.requestRenderAll()
}

function deleteSelected() {
  const c = canvas!
  const obj = c.getActiveObject() as (fabric.Polygon & { zoneId?: number }) | undefined
  if (!obj?.zoneId) return
  zones.value = zones.value.filter(z => z.id !== obj.zoneId)
  c.remove(obj)
  c.discardActiveObject()
  c.requestRenderAll()
}

function reset() {
  const c = canvas!
  c.getObjects()
    .filter(o => (o as fabric.Polygon & { zoneId?: number }).zoneId !== undefined)
    .forEach(o => c.remove(o))
  zones.value = []
  exported.value = ''
  clearPending()
}

/**
 * Coordinates are normalised to 0..1 so the geometry survives the model running
 * at a different resolution than the calibration screenshot.
 */
function exportZones() {
  const c = canvas!
  const out = c.getObjects()
    .filter(o => (o as fabric.Polygon & { zoneId?: number }).zoneId !== undefined)
    .map((o) => {
      const poly = o as fabric.Polygon & { zoneType: ZoneType, zoneId: number }
      const m = poly.calcTransformMatrix()
      const pts = poly.points.map((p) => {
        const t = fabric.util.transformPoint(
          new fabric.Point(p.x - poly.pathOffset.x, p.y - poly.pathOffset.y),
          m,
        )
        return [+(t.x / W).toFixed(4), +(t.y / H).toFixed(4)]
      })
      return {
        id: poly.zoneId,
        type: poly.zoneType,
        onLyingDown: ZONES[poly.zoneType].severity,
        polygon: pts,
      }
    })
  exported.value = JSON.stringify({ camera: 'camera-01', zones: out }, null, 2)
}

function resize() {
  const el = wrap.value
  if (!el || !canvas) return
  const scale = Math.min(1, el.clientWidth / W)
  canvas.setZoom(scale)
  canvas.setDimensions({ width: W * scale, height: H * scale })
  canvas.requestRenderAll()
}

onMounted(() => {
  canvas = new fabric.Canvas(canvasEl.value!, {
    width: W,
    height: H,
    selection: false,
    preserveObjectStacking: true,
    backgroundColor: '#0b1220',
  })
  buildBackdrop()

  canvas.on('mouse:down', (opt) => {
    // Clicking an existing zone selects it; clicking empty space adds a vertex.
    if (opt.target && (opt.target as fabric.Polygon & { zoneId?: number }).zoneId !== undefined) return
    const p = scenePoint(opt)
    addPoint(p.x, p.y)
  })

  resize()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  canvas?.dispose()
  canvas = null
})
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
    <div class="space-y-3">
      <div class="surface-card flex flex-wrap items-center gap-2 p-3">
        <div class="flex gap-1 rounded-lg bg-[var(--surface-sunken)] p-1">
          <button
            v-for="(z, key) in ZONES"
            :key="key"
            type="button"
            class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
            :class="active === key ? 'bg-[var(--surface)] shadow-sm' : 'text-[var(--ink-subtle)]'"
            @click="active = key as ZoneType; clearPending()"
          >
            <span class="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" :style="{ background: z.stroke }" />
            {{ z.label }}
          </button>
        </div>

        <button
          type="button"
          class="rounded-lg bg-[var(--ink)] px-3 py-1.5 text-xs font-medium text-[var(--surface)] disabled:opacity-35"
          :disabled="pointCount < 3"
          @click="closeZone"
        >Close zone ({{ pointCount }}/3)</button>
        <button
          v-if="drawing"
          type="button"
          class="rounded-lg border border-[var(--border-strong)] px-3 py-1.5 text-xs font-medium"
          @click="clearPending"
        >Cancel</button>

        <div class="ml-auto flex gap-2">
          <button
            type="button"
            class="rounded-lg border border-[var(--border-strong)] px-3 py-1.5 text-xs font-medium"
            @click="deleteSelected"
          >Delete selected</button>
          <button
            type="button"
            class="rounded-lg border border-[var(--border-strong)] px-3 py-1.5 text-xs font-medium"
            @click="reset"
          >Reset</button>
        </div>
      </div>

      <div ref="wrap" class="surface-card overflow-hidden p-0 leading-[0]">
        <canvas ref="canvasEl" />
      </div>

      <p class="text-xs leading-relaxed text-[var(--ink-subtle)]">
        Click to drop vertices, then close the zone. Closed zones can be dragged, scaled and
        rotated, and the exported geometry follows.
      </p>
    </div>

    <div class="space-y-3">
      <div class="surface-card p-4">
        <p class="label-mono">Why zones instead of a smarter model</p>
        <p class="mt-2.5 text-sm leading-relaxed text-[var(--ink-muted)]">
          The detection was already good. What it lacked was context. "Person lying down" means
          nothing until you know whether that region is a bed or the floor, and only someone
          standing in the room can say which is which. Making that a two-minute job for ward
          staff was worth more than any accuracy work on the model.
        </p>
      </div>

      <div class="surface-card p-4">
        <div class="flex items-center justify-between gap-3">
          <p class="label-mono">Zones ({{ zones.length }})</p>
          <button
            type="button"
            class="rounded-md border border-[var(--border)] px-2.5 py-1 text-xs font-medium disabled:opacity-35"
            :disabled="!zones.length"
            @click="exportZones"
          >Export JSON</button>
        </div>

        <ul v-if="zones.length" class="mt-3 space-y-1.5">
          <li
            v-for="z in zones"
            :key="z.id"
            class="flex items-center gap-2 rounded-md bg-[var(--surface-sunken)] px-2.5 py-1.5 text-xs"
          >
            <span class="h-2 w-2 rounded-full" :style="{ background: ZONES[z.type].stroke }" />
            <span class="font-medium">{{ ZONES[z.type].label }}</span>
            <span class="text-[var(--ink-subtle)]">{{ z.points }} pts</span>
            <span
              class="ml-auto font-mono text-[10px]"
              :class="ZONES[z.type].severity === 'alert' ? 'text-red-500' : 'text-[var(--ink-subtle)]'"
            >lying → {{ ZONES[z.type].severity }}</span>
          </li>
        </ul>
        <p v-else class="mt-3 text-xs text-[var(--ink-subtle)]">No zones yet.</p>

        <pre
          v-if="exported"
          class="mt-3 max-h-56 overflow-auto rounded-lg bg-[var(--surface-sunken)] p-3 font-mono text-[10px] leading-relaxed text-[var(--ink-muted)]"
        >{{ exported }}</pre>
      </div>
    </div>
  </div>
</template>
