<script setup lang="ts">
import { personal, sections } from '~/data/profile'

const ids = sections.map(s => s.id)
const active = useScrollSpy(ids)
const open = ref(false)

// Plain anchors, no router. The whole page is one document, so there is
// nothing to route: the previous version pushed fake URLs like /experience
// that 404'd on refresh once deployed to static hosting.
function go(id: string) {
  open.value = false
}
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/85 backdrop-blur-md"
  >
    <div class="container-page flex h-16 items-center justify-between gap-4">
      <a href="#top" class="group flex items-center gap-2.5" @click="go('top')">
        <span
          class="grid h-8 w-8 place-items-center rounded-lg bg-[var(--ink)] font-mono text-[13px] font-semibold text-[var(--surface)]"
        >FD</span>
        <span class="hidden text-sm font-semibold tracking-tight sm:block">{{ personal.name }}</span>
      </a>

      <nav class="hidden items-center gap-1 md:flex" aria-label="Sections">
        <a
          v-for="s in sections"
          :key="s.id"
          :href="`#${s.id}`"
          class="relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          :class="active === s.id
            ? 'text-[var(--ink)]'
            : 'text-[var(--ink-subtle)] hover:text-[var(--ink)]'"
          :aria-current="active === s.id ? 'true' : undefined"
          @click="go(s.id)"
        >
          {{ s.label }}
          <span
            v-if="active === s.id"
            class="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[var(--accent)]"
          />
        </a>
      </nav>

      <div class="flex items-center gap-2">
        <a
          :href="personal.resumePath"
          download
          class="hidden items-center gap-1.5 rounded-lg bg-[var(--ink)] px-3.5 py-2 text-sm font-medium text-[var(--surface)] transition-opacity hover:opacity-90 sm:inline-flex"
        >
          <Icon name="lucide:download" class="h-4 w-4" />
          Resume
        </a>
        <ThemeToggle />
        <button
          type="button"
          class="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--ink-muted)] md:hidden"
          :aria-expanded="open"
          aria-label="Toggle navigation"
          @click="open = !open"
        >
          <Icon :name="open ? 'lucide:x' : 'lucide:menu'" class="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>

    <div v-if="open" class="border-t border-[var(--border)] bg-[var(--surface)] md:hidden">
      <nav class="container-page grid gap-0.5 py-3" aria-label="Sections">
        <a
          v-for="s in sections"
          :key="s.id"
          :href="`#${s.id}`"
          class="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
          :class="active === s.id
            ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
            : 'text-[var(--ink-muted)] hover:bg-[var(--surface-sunken)]'"
          @click="go(s.id)"
        >{{ s.label }}</a>
        <a
          :href="personal.resumePath"
          download
          class="mt-1 flex items-center gap-2 rounded-lg bg-[var(--ink)] px-3 py-2.5 text-sm font-medium text-[var(--surface)]"
          @click="open = false"
        >
          <Icon name="lucide:download" class="h-4 w-4" /> Download resume
        </a>
      </nav>
    </div>
  </header>
</template>
