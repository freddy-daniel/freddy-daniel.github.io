<script setup lang="ts">
import { personal } from '~/data/profile'
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-[var(--border)] bg-[var(--surface-sunken)]">
    <div class="container-page flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <p class="text-sm font-medium">{{ personal.name }}</p>
        <p class="text-xs text-[var(--ink-subtle)]">
          Built with Nuxt 4, Vue 3 and Tailwind. Statically generated, hosted on GitHub Pages.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <a
          :href="personal.github" target="_blank" rel="noopener noreferrer"
          class="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          aria-label="GitHub"
        ><Icon name="lucide:github" class="h-[18px] w-[18px]" /></a>
        <a
          :href="personal.linkedin" target="_blank" rel="noopener noreferrer"
          class="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          aria-label="LinkedIn"
        ><Icon name="lucide:linkedin" class="h-[18px] w-[18px]" /></a>
        <a
          :href="`mailto:${personal.email}`"
          class="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          aria-label="Email"
        ><Icon name="lucide:mail" class="h-[18px] w-[18px]" /></a>
      </div>
    </div>
    <div class="container-page pb-8">
      <p class="text-xs text-[var(--ink-subtle)]">© {{ year }} {{ personal.name }}</p>
    </div>
  </footer>
</template>
