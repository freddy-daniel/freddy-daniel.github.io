<script setup lang="ts">
import { personal } from '~/data/profile'
</script>

<template>
  <section id="contact" class="py-20 sm:py-24">
    <div class="container-page">
      <div class="surface-card relative overflow-hidden p-8 sm:p-12">
        <div class="grid-backdrop absolute inset-0 opacity-60" aria-hidden="true" />
        <div class="relative max-w-2xl">
          <p class="label-mono">Contact</p>
          <h2 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {{ personal.availability }}
          </h2>
          <p class="mt-4 text-[15px] leading-relaxed text-[var(--ink-muted)]">
            Vue and Nuxt roles first, senior frontend on any modern JavaScript stack second.
            Remote, hybrid or onsite in India, and open to relocating. Email is the fastest way to reach me.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <a
              :href="`mailto:${personal.email}?subject=Senior%20Frontend%20role`"
              class="inline-flex items-center gap-2 rounded-lg bg-[var(--ink)] px-5 py-3 text-sm font-medium text-[var(--surface)] transition-opacity hover:opacity-90"
            >
              <Icon name="lucide:mail" class="h-4 w-4" /> {{ personal.email }}
            </a>
            <a
              :href="personal.linkedin" target="_blank" rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-lg border border-[var(--border-strong)] px-5 py-3 text-sm font-medium transition-colors hover:bg-[var(--surface-sunken)]"
            >
              <Icon name="lucide:linkedin" class="h-4 w-4" /> {{ personal.linkedinHandle }}
            </a>
            <a
              :href="personal.resumePath" download
              class="inline-flex items-center gap-2 rounded-lg border border-[var(--border-strong)] px-5 py-3 text-sm font-medium transition-colors hover:bg-[var(--surface-sunken)]"
            >
              <Icon name="lucide:file-text" class="h-4 w-4" /> Resume (PDF)
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
