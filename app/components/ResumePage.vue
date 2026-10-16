<script setup lang="ts">
import { personal, roles, caseStudies, skillTiers, education, certifications } from '~/data/profile'

const props = defineProps<{
  /** Rendered as the scaled-down copy on the laptop screen. */
  preview?: boolean
}>()

const sections = [
  { id: 'experience', label: 'Experience' },
  { id: 'work', label: 'Selected work' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
] as const

// The preview copies must not repeat ids, or #anchors would resolve to them.
// They still follow the real page's scroll position, so the nav highlight
// matches at the moment the intro hands over.
const anchor = (id: string) => (props.preview ? undefined : id)
const active = useScrollSpy(sections.map(s => s.id))
const year = new Date().getFullYear()

const contacts = [
  { label: personal.email, href: `mailto:${personal.email}` },
  { label: 'GitHub', href: personal.github, external: true },
  { label: 'LinkedIn', href: personal.linkedin, external: true },
  { label: 'Resume (PDF)', href: personal.resumePath, download: true },
]
</script>

<template>
  <div
    class="mx-auto max-w-[84rem] px-5 sm:px-8 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16 lg:px-12 xl:grid-cols-[20rem_minmax(0,1fr)] xl:gap-24"
  >
    <!-- Sticky and exactly one screen tall, sized to fit without scrolling of its
         own. On short screens the headline goes, and below 680px it stops
         being sticky and simply scrolls with the page. -->
    <aside
      class="relative pt-14 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:self-start lg:py-12 lg:[@media(max-height:680px)]:static lg:[@media(max-height:680px)]:h-auto"
    >
      <!-- Divider between the columns, stopping short of both ends. -->
      <span class="pointer-events-none absolute top-20 bottom-20 hidden w-px bg-rule lg:-right-8 lg:block xl:-right-12" aria-hidden="true" />

      <h1 class="font-serif text-[2.75rem] font-medium leading-[1.02] tracking-[-0.015em] text-navy">
        {{ personal.name }}
      </h1>
      <p class="mt-4 text-[1.0625rem] font-semibold">{{ personal.title }}</p>
      <p class="text-muted">{{ personal.specialism }} · {{ personal.location }}</p>
      <p class="mt-5 text-[0.9375rem] leading-relaxed text-muted lg:[@media(max-height:820px)]:hidden">{{ personal.headline }}</p>

      <nav class="mt-10 hidden lg:block" aria-label="Sections">
        <ul>
          <li v-for="s in sections" :key="s.id">
            <a
              :href="`#${s.id}`"
              class="group flex items-center gap-3 py-[3px] text-[0.9375rem] transition-colors"
              :class="active === s.id ? 'font-semibold text-navy' : 'text-faint hover:text-ink'"
              :aria-current="active === s.id ? 'true' : undefined"
            >
              <span
                class="h-1.5 w-1.5 rounded-full transition-colors"
                :class="active === s.id ? 'bg-navy' : 'bg-rule group-hover:bg-faint'"
              />
              {{ s.label }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="mt-8 lg:mt-auto lg:pt-8">
        <ul class="flex flex-wrap gap-x-5 gap-y-1 lg:block lg:space-y-0.5">
          <li v-for="c in contacts" :key="c.label">
            <a
              class="link text-[0.9375rem]"
              :href="c.href"
              :target="c.external ? '_blank' : undefined"
              :rel="c.external ? 'noopener noreferrer' : undefined"
              :download="c.download || undefined"
            >{{ c.label }}<svg
              v-if="c.download"
              class="ml-1.5 inline-block align-[-2px] text-navy"
              viewBox="0 0 16 16"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" />
            </svg></a>
          </li>
        </ul>
        <p class="mt-4 text-sm text-faint">{{ personal.availability }} · {{ personal.locationNote }}</p>
      </div>
    </aside>

    <div class="pb-16 lg:pt-16">
      <p class="mt-10 max-w-[48rem] text-[1.1875rem] leading-relaxed lg:mt-0 lg:text-[1.3125rem]">
        {{ personal.positioning }}
      </p>

      <ResumeSection
        :id="anchor('experience')"
        title="Experience"
        lead="Backend web services first, then real-time video and cross-platform desktop, then leading the web team while staying hands-on in the code."
      >
        <article v-for="role in roles" :key="role.title" class="entry">
          <div>
            <p class="font-medium tabular-nums">{{ role.period }}</p>
            <p class="text-sm text-faint">{{ role.location }}</p>
          </div>
          <div>
            <h3 class="text-[1.1875rem] font-semibold leading-snug">{{ role.title }}</h3>
            <p class="text-muted">{{ role.org }}</p>
            <ul class="dot-list mt-4 max-w-[48rem] space-y-2">
              <li v-for="(h, i) in role.highlights" :key="i">{{ h }}</li>
            </ul>
          </div>
        </article>
      </ResumeSection>

      <ResumeSection
        :id="anchor('work')"
        title="Selected work"
        lead="What I built, why it was built that way, and the trade-off I would want to talk through in an interview."
      >
        <article v-for="cs in caseStudies" :id="anchor(cs.id)" :key="cs.id" class="entry">
          <div>
            <p class="font-medium tabular-nums">{{ cs.period }}</p>
            <p class="text-sm text-faint">{{ cs.context }}</p>
            <ul class="mt-3 flex flex-wrap gap-1.5">
              <li v-for="t in cs.stack" :key="t" class="tag">{{ t }}</li>
            </ul>
          </div>
          <div>
            <h3 class="text-[1.1875rem] font-semibold leading-snug">{{ cs.title }}</h3>
            <p class="mt-2 max-w-[48rem]">{{ cs.problem }}</p>
            <ul class="dot-list mt-4 max-w-[48rem] space-y-2">
              <li v-for="(step, i) in cs.approach" :key="i">{{ step }}</li>
            </ul>
            <div class="mt-6 grid gap-4 md:grid-cols-2">
              <div class="rounded-lg bg-wash p-5" :class="cs.tradeoff ? '' : 'md:col-span-2'">
                <p class="text-sm font-semibold text-navy">Result</p>
                <p class="mt-1.5 text-[0.9375rem] leading-relaxed">{{ cs.result }}</p>
              </div>
              <div v-if="cs.tradeoff" class="rounded-lg border border-rule p-5">
                <p class="text-sm font-semibold text-navy">Trade-off</p>
                <p class="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{{ cs.tradeoff }}</p>
              </div>
            </div>
          </div>
        </article>
      </ResumeSection>

      <ResumeSection :id="anchor('skills')" title="Skills">
        <div class="grid gap-8 md:grid-cols-3">
          <div v-for="tier in skillTiers" :key="tier.tier">
            <h3 class="font-semibold">{{ tier.tier }}</h3>
            <p class="text-sm text-faint">{{ tier.note }}</p>
            <ul class="mt-4 flex flex-wrap gap-1.5">
              <li v-for="s in tier.skills" :key="s" class="tag">{{ s }}</li>
            </ul>
          </div>
        </div>
      </ResumeSection>

      <ResumeSection :id="anchor('education')" title="Education">
        <div class="grid gap-10 md:grid-cols-3">
          <div>
            <h3 class="font-semibold">{{ education.degree }}</h3>
            <p class="text-muted">{{ education.institution }}</p>
            <p class="text-sm tabular-nums text-faint">{{ education.period }}</p>
            <p class="mt-3 text-[0.9375rem] text-muted">{{ education.note }}</p>
          </div>
          <div>
            <h3 class="font-semibold">Certificates</h3>
            <ul class="dot-list mt-2 space-y-1.5 text-[0.9375rem]">
              <li v-for="c in certifications" :key="c">{{ c }}</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold">Languages</h3>
            <ul class="mt-2 space-y-1.5 text-[0.9375rem]">
              <li v-for="l in personal.languages" :key="l.name">
                {{ l.name }} <span class="text-faint">· {{ l.level }}</span>
              </li>
            </ul>
          </div>
        </div>
      </ResumeSection>

      <ResumeSection :id="anchor('contact')" title="Contact">
        <div class="grid gap-8 rounded-xl bg-navy px-7 py-9 text-white md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-10">
          <div>
            <p class="font-serif text-[1.75rem] leading-tight">{{ personal.availability }}</p>
            <p class="mt-3 max-w-[40rem] text-white/75">
              Vue and Nuxt roles first, senior engineering roles on any modern JavaScript stack second.
              Remote, hybrid or onsite in India, and open to relocating. Email is the fastest way to reach me.
            </p>
          </div>
          <div class="flex flex-wrap gap-3 md:flex-col">
            <a
              :href="`mailto:${personal.email}?subject=Senior%20Software%20Engineer%20role`"
              class="rounded-lg bg-white px-5 py-2.5 text-center font-semibold text-navy transition-opacity hover:opacity-90"
            >Email me</a>
            <a
              :href="personal.linkedin"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-lg border border-white/30 px-5 py-2.5 text-center font-medium transition-colors hover:border-white/70"
            >LinkedIn</a>
          </div>
        </div>
      </ResumeSection>

      <footer class="mt-16 border-t border-rule pt-6 text-sm text-faint">
        © {{ year }} {{ personal.name }}. Built with Nuxt, hosted on GitHub Pages.
      </footer>
    </div>
  </div>
</template>
