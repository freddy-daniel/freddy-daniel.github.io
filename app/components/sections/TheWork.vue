<script setup lang="ts">
import { caseStudies } from '~/data/profile'

// First one open by default so the section is never a wall of collapsed rows.
const openId = ref<string | null>(caseStudies[0]?.id ?? null)

function toggle(id: string) {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <section id="work" class="border-b border-[var(--border)] py-20 sm:py-24">
    <div class="container-page">
      <SectionHeading
        eyebrow="Case studies"
        title="Work, with the reasoning attached"
        lead="Six things I built, why they were built that way, and what I would do differently. The trade-off note on each one is the part I would want to talk through in an interview."
      />

      <div class="mt-12 space-y-3">
        <article
          v-for="cs in caseStudies"
          :key="cs.id"
          class="surface-card overflow-hidden transition-colors"
          :class="openId === cs.id ? 'border-[var(--border-strong)]' : ''"
        >
          <h3>
            <button
              type="button"
              class="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-[var(--surface-sunken)] sm:p-6"
              :aria-expanded="openId === cs.id"
              :aria-controls="`panel-${cs.id}`"
              @click="toggle(cs.id)"
            >
              <span
                class="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"
              >
                <Icon :name="cs.icon" class="h-5 w-5" />
              </span>

              <span class="min-w-0 flex-1">
                <span class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span class="text-lg font-semibold tracking-tight">{{ cs.title }}</span>
                  <span class="label-mono">{{ cs.context }} · {{ cs.period }}</span>
                </span>
                <span class="mt-2 flex flex-wrap gap-1.5">
                  <span
                    v-for="t in cs.stack"
                    :key="t"
                    class="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--ink-subtle)]"
                  >{{ t }}</span>
                </span>
              </span>

              <Icon
                name="lucide:chevron-down"
                class="mt-1 h-5 w-5 shrink-0 text-[var(--ink-subtle)] transition-transform duration-200"
                :class="openId === cs.id ? 'rotate-180' : ''"
              />
            </button>
          </h3>

          <div v-show="openId === cs.id" :id="`panel-${cs.id}`" class="border-t border-[var(--border)]">
            <div class="grid gap-8 p-5 sm:p-6 lg:grid-cols-[1fr_1.15fr]">
              <div class="space-y-6">
                <div>
                  <p class="label-mono">The problem</p>
                  <p class="mt-2 text-[15px] leading-relaxed text-[var(--ink-muted)]">{{ cs.problem }}</p>
                </div>
                <div>
                  <p class="label-mono">Outcome</p>
                  <p class="mt-2 text-[15px] leading-relaxed text-[var(--ink-muted)]">{{ cs.result }}</p>
                </div>
                <div v-if="cs.tradeoff" class="rounded-lg border-l-2 border-[var(--accent)] bg-[var(--surface-sunken)] p-4">
                  <p class="label-mono">Trade-off</p>
                  <p class="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{{ cs.tradeoff }}</p>
                </div>
              </div>

              <div>
                <p class="label-mono">How it was built</p>
                <ol class="mt-3 space-y-3">
                  <li
                    v-for="(step, i) in cs.approach"
                    :key="i"
                    class="flex gap-3 text-[15px] leading-relaxed text-[var(--ink-muted)]"
                  >
                    <span class="mt-0.5 font-mono text-xs text-[var(--ink-subtle)]">{{ String(i + 1).padStart(2, '0') }}</span>
                    <span>{{ step }}</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
