<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  lead?: string
}>()
</script>

<template>
  <div class="max-w-2xl">
    <p class="label-mono">{{ eyebrow }}</p>
    <h2 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{{ title }}</h2>
    <p v-if="lead" class="mt-4 text-[15px] leading-relaxed text-[var(--ink-muted)]">{{ lead }}</p>
  </div>
</template>
