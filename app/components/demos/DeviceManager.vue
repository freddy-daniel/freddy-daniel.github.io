<script setup lang="ts">
/**
 * Reconstruction of the device selection library described in the case study.
 *
 * The parts that matter, and that most naive implementations get wrong:
 *  - device.label is an empty string until permission is granted, so the list
 *    has to be enumerated a second time after the first getUserMedia call
 *  - devicechange fires on plug/unplug and the active track must be swapped
 *  - a persisted deviceId can point at hardware that is no longer present
 */

type Kind = 'videoinput' | 'audioinput'

const supported = ref(true)
const permission = ref<'idle' | 'prompt' | 'granted' | 'denied'>('idle')
// Tracked separately from `permission`: a returning visitor already has the
// grant, but there is still no stream until they ask for one.
const streaming = ref(false)
const errorMessage = ref('')
const devices = ref<MediaDeviceInfo[]>([])
const selected = reactive<Record<Kind, string>>({ videoinput: '', audioinput: '' })
const videoEl = ref<HTMLVideoElement | null>(null)
const level = ref(0)
const log = ref<string[]>([])

let stream: MediaStream | null = null
let audioCtx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let raf = 0

const STORAGE_KEY = 'demo:device-prefs'

const cameras = computed(() => devices.value.filter(d => d.kind === 'videoinput'))
const mics = computed(() => devices.value.filter(d => d.kind === 'audioinput'))
const hasLabels = computed(() => devices.value.some(d => d.label !== ''))

function note(message: string) {
  const t = new Date().toLocaleTimeString('en-GB', { hour12: false })
  log.value = [`${t}  ${message}`, ...log.value].slice(0, 40)
}

async function enumerate() {
  const list = await navigator.mediaDevices.enumerateDevices()
  devices.value = list.filter(d => d.kind === 'videoinput' || d.kind === 'audioinput')
  note(`enumerateDevices() → ${devices.value.length} devices, labels ${hasLabels.value ? 'present' : 'hidden'}`)
}

function stopStream() {
  stream?.getTracks().forEach(t => t.stop())
  stream = null
  streaming.value = false
  cancelAnimationFrame(raf)
  analyser = null
  level.value = 0
}

function meter() {
  if (!analyser) return
  const buf = new Uint8Array(analyser.fftSize)
  analyser.getByteTimeDomainData(buf)
  // RMS around the 128 midpoint, scaled to something that reads on a bar.
  let sum = 0
  for (const v of buf) sum += (v - 128) ** 2
  level.value = Math.min(1, Math.sqrt(sum / buf.length) / 40)
  raf = requestAnimationFrame(meter)
}

async function open() {
  errorMessage.value = ''
  stopStream()

  const constraints: MediaStreamConstraints = {
    video: selected.videoinput ? { deviceId: { exact: selected.videoinput } } : true,
    audio: selected.audioinput ? { deviceId: { exact: selected.audioinput } } : true,
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints)
  }
  catch (err) {
    const e = err as DOMException
    // The failure mode that matters: a saved deviceId whose hardware is gone.
    // Falling back beats showing the user an OverconstrainedError.
    if (e.name === 'OverconstrainedError' || e.name === 'NotFoundError') {
      note(`${e.name} on saved deviceId, falling back to defaults`)
      selected.videoinput = ''
      selected.audioinput = ''
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      }
      catch (err2) {
        permission.value = 'denied'
        errorMessage.value = (err2 as DOMException).message
        note(`getUserMedia failed: ${(err2 as DOMException).name}`)
        return
      }
    }
    else {
      permission.value = e.name === 'NotAllowedError' ? 'denied' : 'idle'
      errorMessage.value = e.message
      note(`getUserMedia failed: ${e.name}`)
      return
    }
  }

  permission.value = 'granted'
  streaming.value = true
  note('getUserMedia() granted')

  if (videoEl.value) {
    videoEl.value.srcObject = stream
    await videoEl.value.play().catch(() => {})
  }

  // Labels only become readable after permission, so re-enumerate now.
  await enumerate()

  const vTrack = stream.getVideoTracks()[0]
  const aTrack = stream.getAudioTracks()[0]
  if (vTrack) selected.videoinput = vTrack.getSettings().deviceId ?? ''
  if (aTrack) selected.audioinput = aTrack.getSettings().deviceId ?? ''
  persist()

  if (aTrack) {
    audioCtx ||= new AudioContext()
    if (audioCtx.state === 'suspended') await audioCtx.resume()
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 1024
    audioCtx.createMediaStreamSource(stream).connect(analyser)
    meter()
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected))
  }
  catch {
    // Private windows and blocked site data both throw here. Not fatal.
  }
}

function restore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw) as Partial<Record<Kind, string>>
    if (saved.videoinput) selected.videoinput = saved.videoinput
    if (saved.audioinput) selected.audioinput = saved.audioinput
    note('restored saved device preference')
  }
  catch { /* ignore */ }
}

async function switchDevice(kind: Kind, id: string) {
  selected[kind] = id
  persist()
  note(`switching ${kind} → ${devices.value.find(d => d.deviceId === id)?.label || id.slice(0, 8)}`)
  if (permission.value === 'granted') await open()
}

async function onDeviceChange() {
  note('devicechange event fired')
  const before = devices.value.length
  await enumerate()
  const after = devices.value.length
  note(after > before ? 'device added' : after < before ? 'device removed' : 'device list changed')

  // If the hardware we were using has gone, reopen on whatever is left.
  const stillThere = devices.value.some(d => d.deviceId === selected.videoinput)
  if (permission.value === 'granted' && selected.videoinput && !stillThere) {
    selected.videoinput = ''
    await open()
  }
}

onMounted(async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    supported.value = false
    return
  }
  restore()
  await enumerate()
  try {
    const status = await navigator.permissions.query({ name: 'camera' as PermissionName })
    permission.value = status.state as typeof permission.value
    note(`permissions.query(camera) → ${status.state}`)
  }
  catch {
    // Safari and Firefox do not expose the camera permission here.
    note('permissions.query(camera) unsupported, will find out on request')
  }
  navigator.mediaDevices.addEventListener('devicechange', onDeviceChange)
})

onBeforeUnmount(() => {
  navigator.mediaDevices?.removeEventListener?.('devicechange', onDeviceChange)
  stopStream()
  audioCtx?.close()
})
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
    <div class="surface-card overflow-hidden">
      <div class="relative aspect-video bg-[var(--surface-sunken)]">
        <video
          ref="videoEl"
          class="h-full w-full object-cover"
          :class="streaming ? '' : 'invisible'"
          playsinline
          muted
          autoplay
        />
        <div
          v-if="!streaming"
          class="absolute inset-0 grid place-items-center p-6 text-center"
        >
          <div class="max-w-xs">
            <Icon name="lucide:video-off" class="mx-auto h-8 w-8 text-[var(--ink-subtle)]" />
            <p v-if="!supported" class="mt-3 text-sm text-[var(--ink-muted)]">
              This browser does not expose the MediaDevices API.
            </p>
            <p v-else-if="permission === 'denied'" class="mt-3 text-sm text-[var(--ink-muted)]">
              Camera access was blocked. The demo handles this path deliberately rather than
              failing silently. Re-allow it in the address bar to continue.
            </p>
            <p v-else class="mt-3 text-sm text-[var(--ink-muted)]">
              Nothing is recorded or sent anywhere. The stream stays in this tab.
            </p>
            <button
              v-if="supported && permission !== 'denied'"
              type="button"
              class="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--surface)]"
              @click="open"
            >
              <Icon name="lucide:video" class="h-4 w-4" /> Start camera and mic
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-4 border-t border-[var(--border)] p-4">
        <label class="block">
          <span class="label-mono">Camera ({{ cameras.length }})</span>
          <select
            :value="selected.videoinput"
            class="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            @change="switchDevice('videoinput', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">System default</option>
            <option v-for="d in cameras" :key="d.deviceId" :value="d.deviceId">
              {{ d.label || `Camera ${d.deviceId.slice(0, 6)} (label hidden until permission)` }}
            </option>
          </select>
        </label>

        <label class="block">
          <span class="label-mono">Microphone ({{ mics.length }})</span>
          <select
            :value="selected.audioinput"
            class="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            @change="switchDevice('audioinput', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">System default</option>
            <option v-for="d in mics" :key="d.deviceId" :value="d.deviceId">
              {{ d.label || `Microphone ${d.deviceId.slice(0, 6)} (label hidden until permission)` }}
            </option>
          </select>
        </label>

        <div>
          <span class="label-mono">Input level</span>
          <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--surface-sunken)]">
            <div
              class="h-full rounded-full bg-[var(--accent)] transition-[width] duration-75"
              :style="{ width: `${Math.round(level * 100)}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="surface-card flex flex-col overflow-hidden">
      <div class="border-b border-[var(--border)] p-4">
        <p class="label-mono">What to watch for</p>
        <ul class="mt-2.5 space-y-2 text-sm leading-relaxed text-[var(--ink-muted)]">
          <li class="flex gap-2">
            <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
            Before you grant permission the device labels are empty strings. That is the browser
            protecting you from fingerprinting, and it is why the list is enumerated twice.
          </li>
          <li class="flex gap-2">
            <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
            Plug in or unplug a headset while this is running. The devicechange handler updates
            the list and reopens the stream if the active device disappeared.
          </li>
          <li class="flex gap-2">
            <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
            Your selection is persisted. Reload the page and it comes back, with a fallback if
            that hardware is no longer attached.
          </li>
        </ul>
      </div>

      <div class="flex min-h-0 flex-1 flex-col p-4">
        <p class="label-mono">Event log</p>
        <div class="mt-2 max-h-64 flex-1 overflow-y-auto rounded-lg bg-[var(--surface-sunken)] p-3">
          <p v-if="!log.length" class="font-mono text-xs text-[var(--ink-subtle)]">Waiting…</p>
          <p
            v-for="(line, i) in log"
            :key="i"
            class="font-mono text-[11px] leading-relaxed text-[var(--ink-muted)]"
          >{{ line }}</p>
        </div>
        <p v-if="errorMessage" class="mt-2 font-mono text-[11px] text-red-500">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>
