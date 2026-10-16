# freddy-daniel.github.io

Personal site for **Freddy Daniel**, Senior Software Engineer (Vue and Nuxt).
Live at **https://freddydaniel.me**

Built with Nuxt 4, statically generated, deployed to GitHub Pages on every push
to `main`. No backend, no analytics, no trackers.

## Why it looks like this

It opens as a closed laptop on a wooden desk with my name on the lid. Scrolling,
clicking it, or waiting a moment opens it and zooms into the screen, and what
is on the screen is the site itself: a plain, resume-style page on a white
background. The case studies carry the reasoning and the trade-offs, and the
skills are grouped by how current they are rather than listed flat as a wall
of logos.

## Stack

Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS v4

All content lives in one typed file, [`app/data/profile.ts`](app/data/profile.ts),
so the site and the downloadable resume cannot drift apart.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run generate           # static output in .output/public
npx serve .output/public   # verify the real artifact, not the dev server
```

## Deploying

`.github/workflows/deploy.yml` runs `npm ci && npm run generate` and publishes
`.output/public`. The Pages source must be set to **GitHub Actions** under
Settings → Pages, not "Deploy from a branch".

The `github_pages` Nitro preset emits `.nojekyll` (without it Jekyll swallows
the `_nuxt/` directory) and a `404.html` fallback.

## Licence

Code is MIT. The written content, the resume and the personal details are not.

## Moving the custom domain

The site currently serves from `freddydaniel.me`. To move it to
`freddydaniel.dev`, repoint that domain's DNS at GitHub Pages, then run:

```bash
./scripts/cutover-to-dev.sh
```

It refuses to run until DNS has actually moved, so it cannot take the site
offline by being run too early.
