<script setup lang="ts">
import { roles, education, certifications, personal } from '~/data/profile'
const showCerts = ref(false)
</script>

<template>
  <section id="experience" class="border-b border-[var(--border)] py-20 sm:py-24">
    <div class="container-page">
      <SectionHeading
        eyebrow="Experience"
        title="From PHP services to real-time video platforms"
        lead="Three roles and a widening remit: backend web services first, then real-time video and cross-platform desktop, then leading the web team while staying hands-on in the code. Most of what is below I owned end to end, from first spec through to production."
      />

      <div class="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <ol class="relative space-y-10 border-l border-[var(--border)] pl-6 sm:pl-8">
          <li v-for="role in roles" :key="role.title" class="relative">
            <span
              class="absolute -left-[calc(1.5rem+4.5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--accent)] ring-4 ring-[var(--surface)] sm:-left-[calc(2rem+4.5px)]"
            />
            <p class="label-mono">{{ role.period }} · {{ role.location }}</p>
            <h3 class="mt-2 text-xl font-semibold tracking-tight">{{ role.title }}</h3>
            <p class="mt-1 text-sm text-[var(--ink-muted)]">{{ role.org }}</p>
            <ul class="mt-4 space-y-2.5">
              <li
                v-for="(h, i) in role.highlights"
                :key="i"
                class="flex gap-3 text-[15px] leading-relaxed text-[var(--ink-muted)]"
              >
                <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{{ h }}</span>
              </li>
            </ul>
          </li>
        </ol>

        <aside class="space-y-4">
          <div class="surface-card p-5">
            <p class="label-mono">Education</p>
            <h3 class="mt-2.5 font-semibold">{{ education.degree }}</h3>
            <p class="mt-1 text-sm text-[var(--ink-muted)]">{{ education.institution }}</p>
            <p class="mt-0.5 font-mono text-xs text-[var(--ink-subtle)]">{{ education.period }}</p>
            <p class="mt-3 border-t border-[var(--border)] pt-3 text-sm leading-relaxed text-[var(--ink-subtle)]">
              {{ education.note }}
            </p>
          </div>

          <div class="surface-card p-5">
            <p class="label-mono">Languages</p>
            <dl class="mt-2.5 space-y-2">
              <div v-for="l in personal.languages" :key="l.name" class="flex items-baseline justify-between gap-3">
                <dt class="text-sm font-medium">{{ l.name }}</dt>
                <dd class="text-xs text-[var(--ink-subtle)]">{{ l.level }}</dd>
              </div>
            </dl>
          </div>

          <div class="surface-card p-5">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 text-left"
              :aria-expanded="showCerts"
              @click="showCerts = !showCerts"
            >
              <span class="label-mono">Certifications ({{ certifications.length }})</span>
              <Icon
                name="lucide:chevron-down"
                class="h-4 w-4 text-[var(--ink-subtle)] transition-transform"
                :class="showCerts ? 'rotate-180' : ''"
              />
            </button>
            <ul v-show="showCerts" class="mt-3 space-y-2 border-t border-[var(--border)] pt-3">
              <li v-for="c in certifications" :key="c" class="text-xs leading-relaxed text-[var(--ink-subtle)]">
                {{ c }}
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>
