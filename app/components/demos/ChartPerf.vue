<script setup lang="ts">
/**
 * The dashboard performance story, made runnable.
 *
 * Both modes draw the same dataset. The only differences are the four settings
 * listed in the table, and those four settings are what took the real dashboard
 * from roughly 20 seconds to 3.
 */
import Chart from 'chart.js/auto'
import type { ChartConfiguration } from 'chart.js'

const canvasEl = ref<HTMLCanvasElement | null>(null)
const size = ref(50_000)
const results = reactive<{ naive: number | null, tuned: number | null }>({ naive: null, tuned: null })
const mode = ref<'naive' | 'tuned' | null>(null)
const drawn = ref(0)
const busy = ref(false)

let chart: Chart | null = null
let data: { x: number, y: number }[] = []

/** Random walk, so the series has real shape rather than noise. */
function generate(n: number) {
  const out = new Array<{ x: number, y: number }>(n)
  let y = 500
  for (let i = 0; i < n; i++) {
    y += (Math.random() - 0.5) * 12
    if (i % 5000 === 0) y += (Math.random() - 0.5) * 90
    out[i] = { x: i, y }
  }
  return out
}

function config(tuned: boolean): ChartConfiguration<'line'> {
  return {
    type: 'line',
    data: {
      datasets: [{
        label: `${size.value.toLocaleString()} points`,
        data,
        borderColor: tuned ? '#0d9488' : '#f43f5e',
        borderWidth: tuned ? 1 : 1.5,
        // Drawing a marker per point is the single most expensive thing you
        // can ask a canvas chart to do at this dataset size.
        pointRadius: tuned ? 0 : 2,
        tension: 0,
        spanGaps: tuned,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // Skipping Chart.js's object parsing requires pre-sorted {x, y} data,
      // which we already have.
      parsing: !tuned,
      normalized: tuned,
      animation: false,
      scales: {
        x: { type: 'linear', ticks: { maxTicksLimit: 8, color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.12)' } },
        y: { ticks: { maxTicksLimit: 6, color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.12)' } },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        // LTTB keeps the visual shape while bounding the number of points
        // actually drawn to roughly the pixel width of the chart.
        decimation: tuned
          ? { enabled: true, algorithm: 'lttb', samples: 500, threshold: 1000 }
          : { enabled: false },
      },
    },
  }
}

async function render(tuned: boolean) {
  if (busy.value) return
  busy.value = true
  mode.value = tuned ? 'tuned' : 'naive'

  chart?.destroy()
  chart = null

  // Generate outside the measured window: this is about render cost, not
  // about how fast JavaScript can fill an array.
  if (data.length !== size.value) data = generate(size.value)

  // Let the destroy settle and the button repaint before we start the clock.
  await nextTick()
  await new Promise(r => requestAnimationFrame(() => r(null)))

  const t0 = performance.now()
  chart = new Chart(canvasEl.value!, config(tuned))
  const elapsed = performance.now() - t0

  results[tuned ? 'tuned' : 'naive'] = Math.round(elapsed)
  drawn.value = tuned ? Math.min(500, size.value) : size.value
  busy.value = false
}

const speedup = computed(() => {
  if (!results.naive || !results.tuned) return null
  return (results.naive / results.tuned).toFixed(1)
})

watch(size, () => {
  data = []
  results.naive = results.tuned = null
})

onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="space-y-4">
    <div class="surface-card flex flex-wrap items-center gap-3 p-4">
      <label class="flex items-center gap-2">
        <span class="label-mono">Points</span>
        <select
          v-model.number="size"
          class="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm"
        >
          <option :value="10000">10,000</option>
          <option :value="50000">50,000</option>
          <option :value="150000">150,000</option>
          <option :value="400000">400,000</option>
        </select>
      </label>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-[var(--border-strong)] px-4 py-2 text-sm font-medium disabled:opacity-40"
        :disabled="busy"
        @click="render(false)"
      >
        <Icon name="lucide:turtle" class="h-4 w-4" /> Render naive
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--surface)] disabled:opacity-40"
        :disabled="busy"
        @click="render(true)"
      >
        <Icon name="lucide:rabbit" class="h-4 w-4" /> Render tuned
      </button>

      <p v-if="speedup" class="ml-auto font-mono text-sm">
        <span class="text-[var(--ink-subtle)]">speedup</span>
        <span class="ml-2 font-semibold text-[var(--accent)]">{{ speedup }}×</span>
      </p>
    </div>

    <div class="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div class="surface-card overflow-hidden">
        <div class="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2.5">
          <p class="label-mono">
            {{ mode ? `${mode} render` : 'Pick a mode' }}
          </p>
          <p v-if="mode" class="font-mono text-xs text-[var(--ink-subtle)]">
            {{ drawn.toLocaleString() }} points drawn
          </p>
        </div>
        <div class="h-[340px] p-3">
          <canvas ref="canvasEl" />
        </div>
      </div>

      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div class="surface-card p-4">
            <p class="label-mono">Naive</p>
            <p class="mt-1.5 font-mono text-2xl font-semibold" :class="results.naive ? 'text-rose-500' : 'text-[var(--ink-subtle)]'">
              {{ results.naive !== null ? `${results.naive}ms` : '—' }}
            </p>
          </div>
          <div class="surface-card p-4">
            <p class="label-mono">Tuned</p>
            <p class="mt-1.5 font-mono text-2xl font-semibold" :class="results.tuned ? 'text-[var(--accent)]' : 'text-[var(--ink-subtle)]'">
              {{ results.tuned !== null ? `${results.tuned}ms` : '—' }}
            </p>
          </div>
        </div>

        <div class="surface-card overflow-hidden">
          <p class="label-mono border-b border-[var(--border)] px-4 py-2.5">The four changes</p>
          <dl class="divide-y divide-[var(--border)] text-sm">
            <div class="px-4 py-3">
              <dt class="font-medium">LTTB decimation</dt>
              <dd class="mt-0.5 text-[13px] leading-relaxed text-[var(--ink-subtle)]">
                Bounds points drawn to the pixel width of the chart. The line looks the same
                because there were never enough pixels to show the difference.
              </dd>
            </div>
            <div class="px-4 py-3">
              <dt class="font-medium">pointRadius: 0</dt>
              <dd class="mt-0.5 text-[13px] leading-relaxed text-[var(--ink-subtle)]">
                One arc per data point is the most expensive instruction on the canvas.
              </dd>
            </div>
            <div class="px-4 py-3">
              <dt class="font-medium">parsing: false</dt>
              <dd class="mt-0.5 text-[13px] leading-relaxed text-[var(--ink-subtle)]">
                Skips Chart.js re-reading every object, which is safe when the data is already
                sorted {{ '{x, y}' }} pairs.
              </dd>
            </div>
            <div class="px-4 py-3">
              <dt class="font-medium">animation: false</dt>
              <dd class="mt-0.5 text-[13px] leading-relaxed text-[var(--ink-subtle)]">
                Animating a hundred thousand points costs a great deal and communicates nothing.
              </dd>
            </div>
          </dl>
        </div>

        <p class="text-xs leading-relaxed text-[var(--ink-subtle)]">
          The trade-off: a decimated line is an approximation. Correct for trend charts, wrong
          when a single outlier is the whole signal, so those charts kept full fidelity.
        </p>
      </div>
    </div>
  </div>
</template>
