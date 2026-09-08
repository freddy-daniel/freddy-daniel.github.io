import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // Prerendered at build time, shipped to GitHub Pages as plain files.
  ssr: true,

  modules: [
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
    '@nuxt/icon',
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // Puts a bare `.dark` / `.light` class on <html> before first paint,
  // which is what kills the theme flash on load.
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'freddy-theme',
  },

  // Only the icons actually referenced in templates get bundled, so the
  // static build never calls the Iconify API at runtime.
  icon: {
    clientBundle: {
      scan: true,
      sizeLimitKb: 256,
      // Bound to :name in templates, so the scanner cannot see them.
      icons: [
        'lucide:mic',
        'lucide:monitor-play',
        'lucide:scan-line',
        'lucide:activity',
        'lucide:app-window',
        'lucide:store',
        'lucide:zap',
        'lucide:package-check',
        'lucide:archive',
        'lucide:menu',
        'lucide:x',
      ],
    },
  },

  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700, 800] },
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
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  devtools: { enabled: true },
})
