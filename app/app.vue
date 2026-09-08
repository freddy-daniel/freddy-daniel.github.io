<script setup lang="ts">
import { personal } from '~/data/profile'

const description = `${personal.name}, ${personal.title} with 9+ years building real-time web applications in Vue and Nuxt. WebRTC, Electron, canvas tooling, Node services and web performance.`

useSeoMeta({
  title: `${personal.name} — ${personal.title}, Vue & Nuxt`,
  description,
  ogTitle: `${personal.name} — ${personal.title}`,
  ogDescription: description,
  ogType: 'website',
  ogUrl: personal.site,
  ogImage: `${personal.site}/og.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: `${personal.name}, ${personal.title} specialising in Vue and Nuxt`,
  twitterCard: 'summary_large_image',
  twitterTitle: `${personal.name} — ${personal.title}`,
  twitterDescription: description,
  twitterImage: `${personal.site}/og.png`,
})

useHead({
  link: [{ rel: 'canonical', href: personal.site }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: personal.name,
        jobTitle: personal.title,
        email: `mailto:${personal.email}`,
        url: personal.site,
        sameAs: [personal.github, personal.linkedin],
        address: { '@type': 'PostalAddress', addressLocality: 'Alappuzha', addressRegion: 'Kerala', addressCountry: 'IN' },
        knowsAbout: ['Vue.js', 'Nuxt.js', 'TypeScript', 'WebRTC', 'Electron.js', 'Node.js', 'Web performance'],
      }),
    },
  ],
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
    >
      Skip to content
    </a>
    <SiteHeader />
    <main id="main" class="flex-1">
      <NuxtPage />
    </main>
    <SiteFooter />
  </div>
</template>
