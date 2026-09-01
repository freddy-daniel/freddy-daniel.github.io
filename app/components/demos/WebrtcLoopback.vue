<script setup lang="ts">
/**
 * A complete WebRTC offer/answer negotiation between two RTCPeerConnections
 * in this one page. No server, no camera permission.
 *
 * The media source is a canvas fed through captureStream(), which is the same
 * technique the local-video co-watch feature used: take a MediaStream off an
 * element and push it through a peer connection as a normal video track.
 *
 * iceServers is deliberately empty. Both peers are in this tab, so host
 * candidates connect directly. Production needs STUN and a TURN relay for the
 * roughly one in five sessions that cannot traverse NAT.
 */

const localVideo = ref<HTMLVideoElement | null>(null)
const remoteVideo = ref<HTMLVideoElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)

const running = ref(false)
const states = reactive({ signaling: '—', ice: '—', connection: '—' })
const steps = ref<{ t: number, side: 'A' | 'B' | '—', text: string }[]>([])
const sdpPreview = ref('')

let pcA: RTCPeerConnection | null = null
let pcB: RTCPeerConnection | null = null
let localStream: MediaStream | null = null
let raf = 0
let t0 = 0

function log(side: 'A' | 'B' | '—', text: string) {
  steps.value = [...steps.value, { t: Math.round(performance.now() - t0), side, text }]
}

/** Animated source so you can see frames actually crossing the connection. */
function paint() {
  const c = canvasEl.value
  const ctx = c?.getContext('2d')
  if (!c || !ctx) return
  const now = performance.now() / 1000
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.strokeStyle = 'rgba(148,163,184,0.18)'
  ctx.lineWidth = 1
  for (let x = 0; x <= c.width; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke()
  }
  for (let y = 0; y <= c.height; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke()
  }
  const cx = c.width / 2 + Math.cos(now * 1.1) * (c.width / 3.4)
  const cy = c.height / 2 + Math.sin(now * 1.6) * (c.height / 3.4)
  ctx.fillStyle = '#2dd4bf'
  ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#f1f5f9'
  ctx.font = '600 20px ui-monospace, Menlo, monospace'
  ctx.fillText(new Date().toLocaleTimeString('en-GB', { hour12: false }), 18, 34)
  ctx.font = '500 13px ui-monospace, Menlo, monospace'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText('synthetic source · canvas.captureStream()', 18, c.height - 18)
  raf = requestAnimationFrame(paint)
}

async function start() {
  await stop()
  t0 = performance.now()
  steps.value = []
  running.value = true

  const canvas = canvasEl.value!
  canvas.width = 640
  canvas.height = 360
  paint()

  localStream = canvas.captureStream(30)
  if (localVideo.value) {
    localVideo.value.srcObject = localStream
    await localVideo.value.play().catch(() => {})
  }
  log('—', 'canvas.captureStream(30) produced a MediaStream')

  pcA = new RTCPeerConnection({ iceServers: [] })
  pcB = new RTCPeerConnection({ iceServers: [] })
  log('—', 'created two RTCPeerConnections')

  // Trickle ICE: candidates are exchanged as they are discovered rather than
  // waiting for gathering to finish. In production this hop is a WebSocket.
  pcA.onicecandidate = e => e.candidate && pcB?.addIceCandidate(e.candidate)
    .then(() => log('A', `ICE candidate → B (${e.candidate!.type ?? 'host'})`))
    .catch(() => {})
  pcB.onicecandidate = e => e.candidate && pcA?.addIceCandidate(e.candidate)
    .then(() => log('B', `ICE candidate → A (${e.candidate!.type ?? 'host'})`))
    .catch(() => {})

  pcA.onsignalingstatechange = () => { states.signaling = pcA?.signalingState ?? '—' }
  pcA.oniceconnectionstatechange = () => { states.ice = pcA?.iceConnectionState ?? '—' }
  pcA.onconnectionstatechange = () => {
    states.connection = pcA?.connectionState ?? '—'
    log('A', `connectionState → ${pcA?.connectionState}`)
  }

  pcB.ontrack = (e) => {
    log('B', `ontrack fired, kind=${e.track.kind}`)
    if (remoteVideo.value) {
      remoteVideo.value.srcObject = e.streams[0] ?? new MediaStream([e.track])
      remoteVideo.value.play().catch(() => {})
    }
  }

  for (const track of localStream.getTracks()) {
    pcA.addTrack(track, localStream)
    log('A', `addTrack(${track.kind})`)
  }

  const offer = await pcA.createOffer()
  log('A', 'createOffer()')
  await pcA.setLocalDescription(offer)
  log('A', 'setLocalDescription(offer)')

  // This is the line that would travel over the signalling socket.
  await pcB.setRemoteDescription(offer)
  log('B', 'setRemoteDescription(offer)')

  const answer = await pcB.createAnswer()
  log('B', 'createAnswer()')
  await pcB.setLocalDescription(answer)
  log('B', 'setLocalDescription(answer)')
  await pcA.setRemoteDescription(answer)
  log('A', 'setRemoteDescription(answer)')

  const media = (offer.sdp ?? '').split('\n').filter(l =>
    l.startsWith('m=') || l.startsWith('a=rtpmap') || l.startsWith('a=setup') || l.startsWith('a=fingerprint'),
  ).slice(0, 8).join('\n')
  sdpPreview.value = media
}

async function stop() {
  cancelAnimationFrame(raf)
  localStream?.getTracks().forEach(t => t.stop())
  localStream = null
  pcA?.close(); pcB?.close()
  pcA = null; pcB = null
  if (localVideo.value) localVideo.value.srcObject = null
  if (remoteVideo.value) remoteVideo.value.srcObject = null
  running.value = false
  states.signaling = states.ice = states.connection = '—'
  sdpPreview.value = ''
}

const badge = (s: string) =>
  s === 'connected' || s === 'completed' || s === 'stable'
    ? 'text-emerald-500'
    : s === 'failed' || s === 'closed' || s === 'disconnected'
      ? 'text-red-500'
      : 'text-[var(--ink-muted)]'

onBeforeUnmount(stop)
</script>

<template>
  <div class="space-y-4">
    <!-- The media source. Hidden because the local <video> below already shows
         it; rAF and captureStream both work on an off-screen canvas. -->
    <canvas ref="canvasEl" class="hidden" aria-hidden="true" />

    <div class="surface-card flex flex-wrap items-center gap-3 p-4">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--surface)]"
        @click="start"
      >
        <Icon name="lucide:plug-zap" class="h-4 w-4" /> {{ running ? 'Renegotiate' : 'Connect the two peers' }}
      </button>
      <button
        v-if="running"
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-[var(--border-strong)] px-4 py-2 text-sm font-medium"
        @click="stop"
      >
        <Icon name="lucide:square" class="h-4 w-4" /> Hang up
      </button>

      <div class="ml-auto flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs">
        <span class="text-[var(--ink-subtle)]">signaling <span :class="badge(states.signaling)">{{ states.signaling }}</span></span>
        <span class="text-[var(--ink-subtle)]">ice <span :class="badge(states.ice)">{{ states.ice }}</span></span>
        <span class="text-[var(--ink-subtle)]">connection <span :class="badge(states.connection)">{{ states.connection }}</span></span>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="surface-card overflow-hidden">
          <p class="label-mono border-b border-[var(--border)] px-3 py-2">Peer A · sending</p>
          <video ref="localVideo" class="aspect-video w-full bg-[var(--surface-sunken)] object-cover" playsinline muted autoplay />
        </div>
        <div class="surface-card overflow-hidden">
          <p class="label-mono border-b border-[var(--border)] px-3 py-2">Peer B · received</p>
          <video ref="remoteVideo" class="aspect-video w-full bg-[var(--surface-sunken)] object-cover" playsinline muted autoplay />
        </div>

        <div v-if="sdpPreview" class="surface-card overflow-hidden sm:col-span-2">
          <p class="label-mono border-b border-[var(--border)] px-3 py-2">Offer SDP, the lines that matter</p>
          <pre class="scrollbar-thin-x overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-[var(--ink-muted)]">{{ sdpPreview }}</pre>
        </div>
      </div>

      <div class="surface-card flex flex-col overflow-hidden">
        <p class="label-mono border-b border-[var(--border)] px-4 py-3">Negotiation, in order</p>
        <ol class="max-h-[26rem] flex-1 overflow-y-auto p-3">
          <li v-if="!steps.length" class="p-2 text-sm text-[var(--ink-subtle)]">
            Press connect. Every step below is a real API call, in the order a
            production client makes them.
          </li>
          <li
            v-for="(s, i) in steps"
            :key="i"
            class="flex items-baseline gap-2.5 rounded px-2 py-1 font-mono text-[11px] leading-relaxed"
          >
            <span class="w-9 shrink-0 text-right text-[var(--ink-subtle)]">{{ s.t }}ms</span>
            <span
              class="w-4 shrink-0 font-semibold"
              :class="s.side === 'A' ? 'text-[var(--accent)]' : s.side === 'B' ? 'text-indigo-400' : 'text-[var(--ink-subtle)]'"
            >{{ s.side }}</span>
            <span class="text-[var(--ink-muted)]">{{ s.text }}</span>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>
