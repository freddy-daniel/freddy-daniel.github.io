<script setup lang="ts">
import { skillTiers } from '~/data/profile'
</script>

<template>
  <section id="skills" class="border-b border-[var(--border)] bg-[var(--surface-sunken)] py-20 sm:py-24">
    <div class="container-page">
      <SectionHeading
        eyebrow="Skills"
        title="Sorted by how well I actually know them"
        lead="A flat list of thirty logos tells you nothing. This is tiered, and the bottom tier is the honest one: things I have shipped with but would need to warm up before being tested on."
      />

      <div class="mt-12 grid gap-4 md:grid-cols-3">
        <div v-for="tier in skillTiers" :key="tier.tier" class="surface-card flex flex-col p-6">
          <div class="flex items-center gap-2.5">
            <Icon :name="tier.icon" class="h-[18px] w-[18px] text-[var(--accent)]" />
            <h3 class="font-semibold tracking-tight">{{ tier.tier }}</h3>
          </div>
          <p class="mt-2 text-sm leading-relaxed text-[var(--ink-subtle)]">{{ tier.note }}</p>
          <ul class="mt-5 flex flex-wrap gap-1.5">
            <li
              v-for="s in tier.skills"
              :key="s"
              class="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[13px] font-medium text-[var(--ink-muted)]"
            >{{ s }}</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
