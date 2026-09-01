# freddy-daniel.github.io

Personal site for **Freddy Daniel**, Senior Frontend Engineer (Vue and Nuxt).
Live at **https://freddydaniel.me**

Built with Nuxt 4, statically generated, deployed to GitHub Pages on every push
to `main`. No backend, no analytics, no trackers.

## Why it looks like this

Most engineering portfolios are a resume with a stylesheet. This one tries to be
the opposite: the case studies carry the reasoning and the trade-offs, and each
of the four demos is a working reconstruction of something I actually shipped,
running in your browser rather than shown as a screenshot.

| Demo | What it reconstructs |
| --- | --- |
| **Device manager** | The reusable camera and mic selection library. Permission states, the empty-label problem, `devicechange` hot-plug, persisted selection with a fallback when the hardware is gone. |
| **WebRTC handshake** | A full offer/answer/ICE negotiation between two `RTCPeerConnection`s on one page, logged step by step. Media source is a canvas via `captureStream()`, so it needs no server and no camera permission. |
| **Zone calibration** | The Fabric.js tool for the fall-detection alarm. Draw bed, chair and floor zones over a camera frame, export normalised polygon geometry. |
| **Render performance** | The analytics dashboard rebuild. The same dataset drawn naively and tuned, timed live. LTTB decimation, `pointRadius: 0`, `parsing: false`, animation off. |

## Stack

Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS v4 · Chart.js · Fabric.js

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

The demos need a secure context for `getUserMedia`. `localhost` and the
deployed HTTPS site both qualify; opening `index.html` from the filesystem
does not.

## Deploying

`.github/workflows/deploy.yml` runs `npm ci && npm run generate` and publishes
`.output/public`. The Pages source must be set to **GitHub Actions** under
Settings → Pages, not "Deploy from a branch".

The `github_pages` Nitro preset emits `.nojekyll` (without it Jekyll swallows
the `_nuxt/` directory) and a `404.html` fallback.

## Licence

Code is MIT. The written content, the resume and the personal details are not.
