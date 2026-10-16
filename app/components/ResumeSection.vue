<script setup lang="ts">
defineProps<{
  title: string
  lead?: string
}>()
</script>

<template>
  <section class="pt-14 lg:pt-20">
    <div class="flex items-center gap-5">
      <h2 class="font-serif text-[1.75rem] font-medium leading-tight text-navy">{{ title }}</h2>
      <span class="h-px flex-1 bg-rule" aria-hidden="true" />
    </div>
    <p v-if="lead" class="mt-2 max-w-[46rem] text-muted">{{ lead }}</p>
    <div class="mt-8 space-y-12">
      <slot />
    </div>
  </section>
</template>
