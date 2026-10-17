# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal site for Freddy Daniel, live at https://freddydaniel.me. Nuxt 4, Vue 3, TypeScript, Tailwind CSS v4. A single page, statically generated, hosted on GitHub Pages. No backend, no analytics.

## Commands

```bash
npm install                # postinstall runs `nuxt prepare`, which generates .nuxt/ types
npm run dev                # http://localhost:3000
npm run generate           # prerendered static site in .output/public (this is what deploys)
npx serve .output/public   # check the real build, not the dev server
npm run typecheck          # vue-tsc via nuxt typecheck
```

There are no tests and no linter. `npm run typecheck` prints a `Load plugin failed: vue-router/volar/sfc-route-blocks` stack trace on every run; that is noise from vue-tsc 2.x. Judge it by the exit code and any `error TS` lines.

`dist` in the repo root is a local, gitignored symlink to `.output/public`.

## Architecture

The page has two parts: a laptop intro (`app/components/LaptopIntro.vue`) and a plain resume-style page (`app/components/ResumePage.vue`) that sits underneath it.

**Content lives in one file.** `app/data/profile.ts` holds the text and data (`personal`, `caseStudies`, `roles`, `skillTiers`, `education`, `certifications`), typed and sourced from the PDF resume. Components are presentation only. Exceptions written inline: the section leads in `ResumePage.vue`, the contact paragraph there, and the SEO meta and JSON-LD `Person` block in `app/app.vue`.

**The laptop intro is driven by scroll position.** `LaptopIntro` renders a `160vh` empty runway in normal flow and a `position: fixed` stage over the page. Progress is `scrollY / runway height`. In the first half the lid opens, the laptop untwists, the view turns from slightly above to facing the screen and pulls back to show the room. In the second half the camera zooms into the screen. Opening automatically, the Open button, a click on the laptop and the scroll wheel all just scroll to the end of the runway. Any wheel, touch, key or pointer input cancels the automatic opening.

**Once fully open, the intro collapses.** Reaching the end of the runway hides the stage, and once scrolling has stopped for 180ms with no finger on the screen, adds `intro-done` to `<html>`, which hides the runway and stage, and shifts the scroll position up by the runway height so nothing moves on screen. The top of the page is then a real top, so a fast scroll back up stops there. Only continued upward intent at the top reopens it. Wheel scrolling counts once the page has rested at the top for 500ms (or straight away for a fresh gesture after a pause), and trackpad momentum, a stream of steadily shrinking deltas, never counts; mouse wheel steps and moving fingers do. On touch it is a 100px pull: one that starts at the top, or a drag that brought the page to the top and keeps pulling after it has rested there for 500ms. On the keyboard it is two ArrowUp/PageUp/Home presses. A small "Keep scrolling up to close the laptop" hint shows while that builds up. Reopening restores the runway at its end, and further scrolling up closes the laptop. `overscroll-behavior-y: none` on `html` stops pull-to-refresh from eating the touch gesture. The open state is kept in `sessionStorage` (`laptop-open`), and the inline head script in `nuxt.config.ts` reads it before first paint, so a reload after opening goes straight to the page at its restored position. Links to a section (`/#work`) collapse the intro first and then jump, using the router's hash because the address bar does not have it yet when the component mounts.

The scene is CSS 3D: a `world` element (room plus laptop) tilts around the hinge, the laptop twists on the desk, and the lid rotates around the hinge. The laptop body's thickness is a few stacked outlined rounded rectangles (`.edge`), which keeps corners right from every angle; the desk's thickness is a single front face (`.desk-front`). The desk top uses `public/wood.jpg` (procedurally generated, no photo). The wall, floor and skirting board are planes, with the desk about 25 cm off the wall (`--wall-gap`). A terracotta mug of latte (currently switched off with `SHOW_MUG = false` while its rendering issues are fixed) stands to the right of the laptop (the latte art is `public/latte-art.svg`, drawn for this site, not a stock photo); its shadow is a gradient in the desk top's background, positioned by hand from the `--mug-*` variables. On the wall hang Freddy's photo (`public/robodog-print.jpg`, a 600px copy of `public/robodog.jpg`; regenerate it with `sips` if the original changes) in a CSS frame and mat, and an inline SVG print. The desk is deliberately small (2.6 laptops wide) so the whole desk, all four legs included, fits on screen when the view pulls back; a wider desk pushes the front legs off screen and leaves the back legs looking detached.

Things that are easy to break there:
- **There are three copies of the page.** The real one, a copy inside the laptop's display (seen while the lid opens), and a flat copy (`.flat-screen`) laid over the display once the laptop faces the viewer, which is what gets zoomed. The flat copy exists because browsers rasterise layers inside a perspective scene at their unzoomed size, so zooming the 3D display blurs the text right before the hand-off. Both copies are `<ResumePage preview />`, `inert` and client-only. With `preview` set the page leaves out element ids, so `#anchors` still resolve to the real page.
- **The hand-off must be pixel exact.** The copies are sized to the stage and centred on the display, so at full zoom the flat copy lines up exactly with the real page, which sits right under the viewport when the runway ends. The stage then hides itself. Anything that makes the copies render differently from the real page (ids, conditional rendering on `preview`, layout that depends on the scroll container) shows up as a jump. `.replica` has `overflow: hidden` so the page's sticky sidebar sticks to the copy, not to the display edge around it.
- `TILT_END + LID = 180` is what makes the screen exactly face-on at the end, and the twist must be back to zero by then. The bezel is equal on all sides because the zoom is anchored on the lid centre.
- Visibility on stage children is set to `inherit`, never `visible`, or a child stays on screen after the stage hides.
- **Chrome drops pieces of 3D planes that other planes cut through.** A desk leg whose plane crossed the desk top made whole regions of the top vanish, showing the wall through it. Keep vertical planes (legs, skirting) just outside the horizontal ones they meet and a pixel or two clear of touching. Check any new scene element by screenshotting the first frame, where the problem shows most.
- **The desk's front face must overlap the top on screen.** It stands half a pixel in front of the top's edge and rises half a pixel above its surface. Any gap between the two, however thin, shows the back legs through it as a dark dash.
- **Phones have a graphics memory budget.** Every 3D element is its own composited layer, held at device resolution (3x on iPhones). An earlier version used 37 layers and roughly 400MB, which made phones lag and flicker. Keep slice counts low, and lay out large soft surfaces (wall, floor, skirting, desk top) at a fraction of their size and `scale()` them up. Check with the Chrome DevTools Layers panel at DPR 3 before adding scene elements.
- **The mug's pieces live outside the room's 3D scene.** Its base, body and rim are each in their own `.world` copy after the room (all `.world` elements get the same transform in `render()`), so they are drawn on top in that order. Inside the room's scene the upright body plane cut through the desk and laptop, and Chrome drew a hairline across the coffee.
- **`will-change: transform` on `.camera` and `.flat-screen` is what keeps the zoom smooth.** Without it Chrome re-renders every layer at the new size on each frame of the zoom (about 500 re-renders over 60 frames on a phone). Do not remove it.
- **The stage is `100lvh` tall,** so a phone's toolbars sliding in and out do not resize it, and `onResize` only re-measures when the stage's size really changed. Re-measuring on every toolbar move made the zoom jump.
- **Collapsing waits for scrolling to stop.** Changing the scroll position while an iOS swipe is still coasting stops the momentum dead or jumps a frame.
- No point in the scene may get near the camera (`perspective` is `4 × --lw`), or Chrome renders it wrongly. That limits how far the floor extends towards the viewer.
- Playwright's WebKit on macOS renders 3D transforms flat, so it cannot be used to check the scene. Test 3D on Chrome, and on a real iPhone over the local network (`npm run generate`, then serve `.output/public` on `0.0.0.0` and open the Mac's IP on the phone).
- The intro only appears when `html` has the `js` class, which an inline script in `nuxt.config.ts` adds in `<head>`. Without JavaScript, with `prefers-reduced-motion`, or when printing, the visitor gets the plain resume. Deep links and restored scroll positions land past the runway and skip the intro.

**Static prerender.** `nuxt.config.ts` uses `ssr: true` with the `github_pages` Nitro preset (emits `.nojekyll` so `/_nuxt/` survives, plus a `404.html`). Prerender has `failOnError: true`, so a render error fails the build and the deploy.

**The page.** On large screens `ResumePage` is a sticky left sidebar (name, title, section nav driven by `useScrollSpy`, contact links) and a wide right column, with a short divider between them. The sidebar is exactly one screen tall and must never scroll on its own: on screens under 820px tall the headline is hidden, and under 680px the sidebar stops being sticky. Each experience and case-study row uses the `entry` grid: dates, context and stack tags on the left, content on the right. Skills and education run as three columns.

**Styling.** Tailwind v4 is configured in CSS (`app/assets/css/main.css`), not a `tailwind.config`. The theme block is `@theme static` because the intro's scoped CSS reads `--font-*` and `--color-navy` directly. Light only, on purpose: white background, IBM Plex Sans for text and Newsreader serif for the name and headings (both via `@nuxt/fonts`). Colour tokens are `ink`, `muted`, `faint`, `rule`, `wash` and `navy` (the laptop's finish, used for the name, headings, accents and the contact block). Shared utilities: `link`, `entry`, `tag` and `dot-list`. No em or en dashes anywhere in site copy (Freddy reads them as a sign of AI writing): date ranges use a plain hyphen, and list markers are dots, not dashes. Keep the styling simple: no gradients, glows, icons, pulsing badges or decorative backgrounds on the page.

## Deploy and domain

Every push to `main` deploys: `.github/workflows/deploy.yml` runs `npm ci && npm run generate` on Node 24 and publishes `.output/public`. The Pages source must be set to "GitHub Actions". There is no staging, so check `npm run generate` locally before pushing.

`public/CNAME` and `personal.site` in `profile.ts` must name the same domain; the canonical URL and OG image URLs come from `personal.site`. `public/og.png` is a capture of the closed laptop on the desk. `scripts/cutover-to-dev.sh` moves the site from `freddydaniel.me` to `freddydaniel.dev`: it checks DNS first, then rewrites both files and the README, commits, pushes and calls the GitHub Pages API itself. Only run it when asked.

## Content rules

The repo and the site are public and read by recruiters. These were agreed with Freddy and must hold through future edits:

- Nothing on the site may present work Freddy did not do himself. Do not add demos, sample projects or generated artefacts as portfolio content; a live-demos section was removed for exactly this reason.
- Every case study keeps its `tradeoff` note. It is the part meant for an interviewer to dig into.
- No phone number, date of birth or postal address on the page. Email, city and social links only.
- The title is "Senior Software Engineer" (`personal.title`), matching the resume headline. Do not narrow it to "Frontend" or raise it to "Tech Lead".
- `skillTiers` lists only what Freddy has used hands-on in shipped work. Ask before adding a skill or framework that is not already there. The tier names and notes are deliberate wording; do not make them self-deprecating.
- Experience copy leads with progression (backend web services, then real-time video and desktop, then leading the web team), not tenure. Anything about the employer stays neutral.
- `freddy-context-export.md` and `Resume-2026-3.pdf` in the repo root are private and gitignored. Never commit them or quote `freddy-context-export.md` into the site.
- `public/Freddy-Daniel-Resume.pdf` is the downloadable resume. Keep it and `profile.ts` in step when either changes.

Commits use conventional prefixes (`feat:`, `fix:`, `refactor:`, `chore:`).
