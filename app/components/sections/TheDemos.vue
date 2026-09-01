<script setup lang="ts">
const tabs = [
  {
    id: 'devices',
    label: 'Device manager',
    icon: 'lucide:mic',
    blurb: 'The reusable camera and microphone picker, rebuilt. Permission states, hidden labels, hot-plug and persisted selection.',
  },
  {
    id: 'webrtc',
    label: 'WebRTC handshake',
    icon: 'lucide:radio',
    blurb: 'Two peer connections negotiating in this page: offer, answer, ICE, connected. No server, no camera permission.',
  },
  {
    id: 'zones',
    label: 'Zone calibration',
    icon: 'lucide:scan-line',
    blurb: 'Draw the bed, the chair and the floor over a camera frame so a detection can be read as normal or as an emergency.',
  },
  {
    id: 'charts',
    label: 'Render performance',
    icon: 'lucide:activity',
    blurb: 'The same dataset drawn twice, timed. Four settings are the whole difference.',
  },
] as const

type TabId = (typeof tabs)[number]['id']

const activeTab = ref<TabId>('devices')
const current = computed(() => tabs.find(t => t.id === activeTab.value)!)

// #demo-webrtc and friends open straight onto one demo, so a single demo can
// be linked directly in an application or an outreach message.
function isTabId(v: string): v is TabId {
  return tabs.some(t => t.id === v)
}

onMounted(() => {
  const id = location.hash.replace('#demo-', '')
  if (location.hash.startsWith('#demo-') && isTabId(id)) {
    activeTab.value = id
    // Wait for the demo chunk to mount before scrolling to it.
    nextTick(() => document.getElementById('demos')?.scrollIntoView())
  }
})

watch(activeTab, (id) => {
  history.replaceState(null, '', `#demo-${id}`)
})
</script>

<template>
  <section id="demos" class="border-b border-[var(--border)] bg-[var(--surface-sunken)] py-20 sm:py-24">
    <div class="container-page">
      <SectionHeading
        eyebrow="Live demos"
        title="Not screenshots. Running code."
        lead="Each of these rebuilds a piece of something I shipped at work, cut down to the part worth looking at. They run entirely in your browser: nothing is uploaded, and nothing here talks to a server."
      />

      <div class="mt-10 flex gap-2 overflow-x-auto pb-1 scrollbar-thin-x">
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          class="flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors"
          :class="activeTab === t.id
            ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]'
            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--border-strong)]'"
          @click="activeTab = t.id"
        >
          <Icon :name="t.icon" class="h-4 w-4" />
          {{ t.label }}
        </button>
      </div>

      <p class="mt-5 max-w-3xl text-[15px] leading-relaxed text-[var(--ink-muted)]">
        {{ current.blurb }}
      </p>

      <div class="mt-6">
        <!-- Every demo touches browser-only APIs, and each is a separate chunk
             so Chart.js and Fabric.js never land in the initial bundle. -->
        <ClientOnly>
          <LazyDemosDeviceManager v-if="activeTab === 'devices'" />
          <LazyDemosWebrtcLoopback v-else-if="activeTab === 'webrtc'" />
          <LazyDemosZoneCalibration v-else-if="activeTab === 'zones'" />
          <LazyDemosChartPerf v-else />

          <template #fallback>
            <div class="surface-card grid h-96 place-items-center">
              <p class="label-mono">Loading demo…</p>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>
