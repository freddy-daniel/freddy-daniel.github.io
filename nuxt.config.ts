import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // Prerendered at build time, shipped to GitHub Pages as plain files.
  ssr: true,

  modules: ['@nuxt/fonts'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  fonts: {
    families: [
      { name: 'Newsreader', provider: 'google', weights: [400, 500], styles: ['normal'] },
      { name: 'IBM Plex Sans', provider: 'google', weights: [400, 500, 600], styles: ['normal'] },
    ],
  },

  // `github_pages` emits .nojekyll (so /_nuxt/ isn't swallowed by Jekyll)
  // and a 404.html fallback.
  nitro: {
    preset: 'github_pages',
    prerender: {
      crawlLinks: true,
      routes: ['/'],
      failOnError: true,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        // The desk under the laptop in the intro; wanted on first paint.
        { rel: 'preload', as: 'image', href: '/wood.jpg' },
      ],
      // The laptop intro only renders when `js` is present, so without
      // JavaScript the page is a plain resume instead of a laptop that never
      // opens. `intro-done` skips the intro on reloads after it has been opened
      // in this tab (key shared with LaptopIntro.vue). Runs in <head>, before
      // first paint, so there is no flash either way.
      script: [{
        innerHTML: 'document.documentElement.classList.add(\'js\');'
          + 'try{if(sessionStorage.getItem(\'laptop-open\'))document.documentElement.classList.add(\'intro-done\')}catch(e){}',
      }],
    },
  },

  devtools: { enabled: true },
})
