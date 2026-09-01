<script setup lang="ts">
const colorMode = useColorMode()

function toggle() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <!-- ClientOnly because the rendered icon depends on the visitor's stored
       preference, which the prerendered HTML cannot know. The placeholder is
       the same size so nothing shifts when it hydrates. -->
  <ClientOnly>
    <button
      type="button"
      class="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--ink-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--ink)]"
      :aria-label="colorMode.value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
      @click="toggle"
    >
      <Icon v-if="colorMode.value === 'dark'" name="lucide:sun" class="h-[18px] w-[18px]" />
      <Icon v-else name="lucide:moon" class="h-[18px] w-[18px]" />
    </button>
    <template #fallback>
      <div class="h-9 w-9 rounded-lg border border-[var(--border)]" />
    </template>
  </ClientOnly>
</template>
