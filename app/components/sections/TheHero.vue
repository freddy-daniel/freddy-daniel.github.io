<script setup lang="ts">
import { personal, metrics } from '~/data/profile'
</script>

<template>
  <section id="top" class="relative overflow-hidden border-b border-[var(--border)]">
    <div class="grid-backdrop absolute inset-0" aria-hidden="true" />
    <!-- Fades the grid out toward the bottom so it reads as texture, not decoration. -->
    <div
      class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--surface)]"
      aria-hidden="true"
    />

    <div class="container-page relative py-20 sm:py-28">
      <div class="grid items-start gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
        <div>
          <p
            class="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]"
          >
            <span class="relative flex h-1.5 w-1.5">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-70" />
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
            </span>
            {{ personal.availability }}
          </p>

          <h1 class="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            {{ personal.name }}
          </h1>

          <p class="mt-4 text-xl font-medium text-[var(--ink-muted)] sm:text-2xl">
            {{ personal.title }}<span class="text-[var(--ink-subtle)]">&nbsp;·&nbsp;</span><span class="text-[var(--accent)]">{{ personal.specialism }}</span>
          </p>

          <p class="mt-7 max-w-xl text-[17px] leading-relaxed text-[var(--ink-muted)]">
            {{ personal.headline }}
          </p>
          <p class="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--ink-subtle)]">
            {{ personal.positioning }}
          </p>

          <div class="mt-9 flex flex-wrap items-center gap-3">
            <a
              :href="personal.resumePath"
              download
              class="inline-flex items-center gap-2 rounded-lg bg-[var(--ink)] px-5 py-3 text-sm font-medium text-[var(--surface)] transition-opacity hover:opacity-90"
            >
              <Icon name="lucide:download" class="h-4 w-4" /> Download resume
            </a>
            <a
              href="#demos"
              class="inline-flex items-center gap-2 rounded-lg border border-[var(--border-strong)] px-5 py-3 text-sm font-medium transition-colors hover:bg-[var(--surface-sunken)]"
            >
              <Icon name="lucide:play" class="h-4 w-4" /> See it running
            </a>
            <a
              :href="`mailto:${personal.email}`"
              class="inline-flex items-center gap-2 px-2 py-3 text-sm font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
            >
              <Icon name="lucide:mail" class="h-4 w-4" /> {{ personal.email }}
            </a>
          </div>
        </div>

        <!-- Identity card instead of the usual circular headshot. To use a real
             photo, drop it in public/ and replace the monogram block below. -->
        <aside class="surface-card w-full max-w-sm overflow-hidden lg:justify-self-end">
          <div class="flex items-center gap-4 border-b border-[var(--border)] p-5">
            <div
              class="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[var(--ink)] font-mono text-lg font-semibold text-[var(--surface)]"
            >FD</div>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold">{{ personal.name }}</p>
              <p class="truncate text-xs text-[var(--ink-subtle)]">{{ personal.title }}</p>
            </div>
          </div>

          <dl class="divide-y divide-[var(--border)] text-sm">
            <div class="flex items-center justify-between gap-4 px-5 py-3">
              <dt class="text-[var(--ink-subtle)]">Based in</dt>
              <dd class="text-right font-medium">Kerala, India</dd>
            </div>
            <div class="flex items-center justify-between gap-4 px-5 py-3">
              <dt class="text-[var(--ink-subtle)]">Setup</dt>
              <dd class="text-right font-medium">{{ personal.locationNote }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4 px-5 py-3">
              <dt class="text-[var(--ink-subtle)]">Primary stack</dt>
              <dd class="text-right font-medium">Vue 3, Nuxt, TypeScript</dd>
            </div>
            <div class="flex items-center justify-between gap-4 px-5 py-3">
              <dt class="text-[var(--ink-subtle)]">Domain</dt>
              <dd class="text-right font-medium">Real-time, WebRTC</dd>
            </div>
          </dl>

          <div class="flex gap-2 border-t border-[var(--border)] p-3">
            <a
              :href="personal.github" target="_blank" rel="noopener noreferrer"
              class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] py-2 text-xs font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
            ><Icon name="lucide:github" class="h-4 w-4" /> GitHub</a>
            <a
              :href="personal.linkedin" target="_blank" rel="noopener noreferrer"
              class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] py-2 text-xs font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
            ><Icon name="lucide:linkedin" class="h-4 w-4" /> LinkedIn</a>
          </div>
        </aside>
      </div>

      <!-- Proof strip: every number here traces back to a line on the resume. -->
      <dl class="mt-16 grid gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="m in metrics" :key="m.label" class="bg-[var(--surface)] p-5">
          <dd class="font-mono text-2xl font-semibold tracking-tight text-[var(--accent)]">{{ m.value }}</dd>
          <dt class="mt-1.5 text-sm font-medium">{{ m.label }}</dt>
          <p class="mt-1 text-xs leading-relaxed text-[var(--ink-subtle)]">{{ m.detail }}</p>
        </div>
      </dl>
    </div>
  </section>
</template>
