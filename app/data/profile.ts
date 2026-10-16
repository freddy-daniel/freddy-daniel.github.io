/**
 * Single source of truth for everything on the page.
 *
 * Sourced from Resume-2026-3.pdf so the site and the downloadable PDF never
 * drift apart. Deliberately excludes phone number, date of birth and postal
 * address: this page is public and gets scraped.
 */

export interface CaseStudy {
  id: string
  title: string
  context: string
  period: string
  stack: string[]
  problem: string
  approach: string[]
  result: string
  /** The honest caveat. Interviewers trust a candidate who names their own limits. */
  tradeoff?: string
}

export interface Role {
  title: string
  org: string
  period: string
  location: string
  highlights: string[]
}

export const personal = {
  name: 'Freddy Daniel',
  firstName: 'Freddy',
  title: 'Senior Software Engineer',
  specialism: 'Vue & Nuxt',
  location: 'Alappuzha, Kerala, India',
  locationNote: 'Remote since 2020',
  email: 'freddysend@gmail.com',
  github: 'https://github.com/freddy-daniel',
  githubHandle: 'freddy-daniel',
  linkedin: 'https://www.linkedin.com/in/freddy-daniel/',
  linkedinHandle: 'in/freddy-daniel',
  // Single place to change when the custom domain moves to freddydaniel.dev;
  // must match public/CNAME or the canonical and OG URLs will be wrong.
  site: 'https://freddydaniel.me',
  resumePath: '/Freddy-Daniel-Resume.pdf',
  availability: 'Open to Senior Software Engineer roles',
  headline:
    'Nine years building real-time web applications. Video conferencing, telehealth, and virtual classrooms, almost entirely in Vue and Nuxt.',
  positioning:
    'I work on the hard end of the browser: WebRTC sessions, canvas tooling, Electron desktop builds, and dashboards that have to stay fast with a lot of data on screen, backed by the Node services behind them. I am looking for a product-focused team where architecture actually matters.',
  languages: [
    { name: 'English', level: 'Full professional proficiency' },
    { name: 'Malayalam', level: 'Native' },
  ],
} as const

export const caseStudies: CaseStudy[] = [
  {
    id: 'device-library',
    title: 'Reusable media device selection library',
    context: 'Video conferencing platform, Techgentsia',
    period: '2025',
    stack: ['JavaScript', 'Vue 3', 'Nuxt', 'MediaDevices API'],
    problem:
      'Camera and microphone pickers had been rewritten by hand in every surface of the product: the web client, the admin console, the Electron desktop app and the pre-call test page. Each one handled permissions, device labels and hot-plug slightly differently, so a bug fixed in one place stayed broken in three others.',
    approach: [
      'Pulled device enumeration, permission state and selection persistence out of the UI layer and into one framework-agnostic module.',
      'Handled the case most implementations miss: device labels are empty strings until permission is granted, so enumeration has to be re-run after the first getUserMedia call.',
      'Subscribed to the devicechange event so plugging in a headset mid-call updates the list and the active track without a page reload.',
      'Persisted the chosen deviceId and fell back cleanly when that device disappears between sessions, instead of throwing OverconstrainedError at the user.',
    ],
    result:
      'One implementation behind a small API, adopted across every surface. Feature work that touched device handling dropped by roughly 60%, and a fix now lands everywhere at once.',
    tradeoff:
      'It is deliberately not a UI component. Each product surface still owns its own markup, which was the right call for white-labelling but means the library cannot enforce consistent UX on its own.',
  },
  {
    id: 'cowatch',
    title: 'Real-time co-watch inside live conferencing',
    context: 'Video conferencing platform, Techgentsia',
    period: '2023 - 2024',
    stack: ['WebRTC', 'WebSocket', 'Video.js', 'Vue 3'],
    problem:
      'Participants in a live call needed to watch the same video together, covering both hosted platforms (YouTube, Vimeo, Dailymotion) and a local file on one participant\'s machine.',
    approach: [
      'Split the problem in two, because the two cases are not the same problem. For hosted platforms nothing needs to be streamed: every participant already has the source.',
      'Hosted video is pure state sync. A shared link plus WebSocket events for play, pause, seek and volume, with the host as the source of truth. No media flows peer to peer at all.',
      'Local video is a media problem. captureStream() on the video element produces a MediaStream, which is fed into a separate content peer connection alongside the existing camera track.',
      'Keeping content on its own peer connection means video quality degradation never competes with the participants\' camera and audio tracks.',
    ],
    result:
      'Both paths shipped behind one feature toggle. The hosted path costs effectively no bandwidth, which mattered because most sessions used it.',
    tradeoff:
      'Signalling was hand-rolled over WebSocket for SDP offer and answer, on a mesh topology with a third-party TURN service. Mesh is simple and was fine at our participant counts, but it does not scale to large rooms. An SFU would be the correct next step.',
  },
  {
    id: 'fall-detection',
    title: 'Canvas zone calibration for fall detection',
    context: 'Healthcare platform, Techgentsia',
    period: '2022 - 2023',
    stack: ['Fabric.js', 'Canvas', 'Vue', 'Nuxt 3'],
    problem:
      'An ML model detected people and actions in a room camera feed, but it had no idea what the room meant. Someone lying down is normal in a bed and an emergency on the floor. Nurses, not engineers, had to be the ones to draw that distinction, per room, on site.',
    approach: [
      'Built a calibration tool on top of a still frame from the camera, where a non-technical user draws polygon zones and labels them bed, chair or floor.',
      'Used Fabric.js for the interaction layer: draggable vertices, live area feedback, snapping, and undo on a stack of canvas states.',
      'Exported normalised zone coordinates as JSON so the geometry stays correct regardless of the resolution the model runs at.',
      'Combined zone plus detected action into the alert rule, so the same detection produces different severity depending on where it happened.',
    ],
    result:
      'Room setup moved from an engineering task to something ward staff do themselves in a couple of minutes, and false alarms dropped once zones reflected the real room layout.',
  },
  {
    id: 'analytics-perf',
    title: 'Analytics dashboard, 20 seconds to 3',
    context: 'Techgentsia',
    period: '2022 - 2023',
    stack: ['Vue 3', 'Vuetify', 'Chart.js', 'Performance'],
    problem:
      'The dashboard took around 20 seconds to become usable on the largest customer datasets. Every chart rendered every raw point, and the whole page waited on the slowest query before showing anything.',
    approach: [
      'Profiled first. The bottleneck was not the network, it was Chart.js drawing tens of thousands of points into canvases only a few hundred pixels wide.',
      'Applied decimation so the number of points drawn is bounded by the pixel width of the chart, not by the size of the dataset. Visually identical, dramatically cheaper.',
      'Turned off entry animation on large series. Animating thirty thousand points is pure cost with no information gained.',
      'Stopped blocking the page on the slowest widget: each chart resolves and paints independently rather than waiting on a single combined request.',
    ],
    result:
      'Initial load dropped from roughly 20 seconds to 3, with chart rendering itself around 30% faster. On a later dashboard the same approach took data load from 3s to 0.8s.',
    tradeoff:
      'Decimation means the rendered line is an approximation. That is correct for trend charts and wrong for anything where a single outlier point is the signal, so those charts kept full fidelity.',
  },
  {
    id: 'electron',
    title: 'White-labelled cross-platform desktop client',
    context: 'Video conferencing platform, Techgentsia',
    period: '2021 - 2023',
    stack: ['Electron.js', 'Node.js', 'Vue', 'CI builds'],
    problem:
      'Enterprise customers wanted the conferencing client as an installable desktop app under their own brand, on both Windows and macOS. Maintaining a hand-built fork per customer was not going to survive more than two or three of them.',
    approach: [
      'Kept a single codebase and moved everything customer-specific into build-time configuration: branding, icons, app identifiers, update endpoints.',
      'Automated packaging so a new tenant is a config entry and a build, not a branch.',
      'Used the desktop layer for what the browser could not do at the time, notably screen source selection and OS-level window handling.',
    ],
    result:
      'Multiple branded desktop clients shipping from one codebase, adopted by enterprise customers on both platforms.',
  },
  {
    id: 'business-tracker',
    title: 'Business Tracker, a B2B queue and profit app',
    context: 'Own product, solo',
    period: '2025 - now',
    stack: ['React Native', 'Expo', 'Node.js', 'Web Push'],
    problem:
      'Small shops in India run customer queues on paper and track profit in their heads. I am building a mobile app for token-based queuing and daily profit tracking, and selling it to non-technical shop owners.',
    approach: [
      'Customers were notified over WhatsApp. Four messages per token, at roughly ₹0.15 each, against shops serving 100 to 500 customers a day. The cost was survivable; the dependency was not.',
      'The real risk was never the per-message price. It was that a single Meta policy change could take the product offline overnight, and I would have no way to reach a single customer.',
      'Constraints made the usual answers unavailable: nothing can be installed on the customer\'s phone, and not every customer has a smartphone.',
      'Current direction is to move the customer off messaging entirely, onto a shareable status link backed by web push, with an installable PWA as the primary channel and plain web as the fallback.',
      'Wrote a phased resilience plan first: early warning, a permanent web QR entry point, a notification outbox, degraded mode, then SMS and spare numbers as the last resort.',
    ],
    result:
      'A working product built end to end on my own, and the first architecture decision I have had to make where the deciding factor was platform risk rather than anything technical.',
    tradeoff:
      'Shop owners compare the product to the WhatsApp messages they get from Bajaj Finance and PhonePe, so reducing WhatsApp usage is a real sales objection. Solving the engineering risk creates a positioning problem I still have to answer.',
  },
]

export const roles: Role[] = [
  {
    title: 'Senior Software Engineer, Web Team Lead',
    org: 'Techgentsia Software Technologies Pvt Ltd',
    period: 'Feb 2020 - Present',
    location: 'Infopark Kochi, remote',
    highlights: [
      'Lead a team of five to six engineers on the web client and admin console for the company\'s video conferencing product, while staying roughly 80% hands-on in the code.',
      'Built a reusable device selection library in JavaScript, cutting feature development time by around 60% through standardisation and reuse.',
      'Developed real-time co-watch, synchronising playback of YouTube, Vimeo, Dailymotion and local video inside live conferencing sessions.',
      'Engineered a canvas-based alarm calibration tool with Fabric.js, combining video segmentation with ML action detection to define bed, chair and floor zones for fall and inactivity alerts.',
      'Modernised the analytics dashboard with Vuetify and Chart.js, improving chart rendering by about 30% and cutting initial load from 20s to 3s on large datasets.',
      'Architected and delivered a cross-platform Electron.js client with multi-tenant white-labelling, dynamic branding and build automation.',
      'Designed a Node.js backend (Express, MongoDB, Socket.io) for an education conferencing platform, handling real-time chat and signalling for high-concurrency classroom sessions.',
      'Led the migration of a large dashboard from Vue 2 to Vue 3 with the Composition API.',
    ],
  },
  {
    title: 'Software Engineer',
    org: 'Techgentsia Software Technologies Pvt Ltd',
    period: 'Feb 2017 - Feb 2020',
    location: 'Cherthala, Kerala',
    highlights: [
      'Built and maintained RESTful APIs with PHP, CodeIgniter and MySQL for scalable web applications.',
      'Optimised MySQL queries and schema design, improving API response times by up to 30%.',
      'Implemented real-time video conferencing, live chat and notifications with WebRTC and Socket.io for multi-user collaboration at low latency.',
      'Created cross-platform desktop apps with NW.js, email and calendar add-ins, and responsive admin panels.',
      'Delivered interactive interfaces with jQuery, Bootstrap and Knockout.js on a virtual classroom platform.',
    ],
  },
]

/**
 * Grouped by how current each skill is rather than dumped as a flat wall of
 * badges. Being specific about what is daily versus what came earlier is what
 * makes the first two groups believable.
 */
export const skillTiers = [
  {
    tier: 'Core',
    note: 'Daily, for years. Ask me anything here.',
    skills: [
      'Vue 3',
      'Nuxt 3 / 4',
      'TypeScript',
      'JavaScript (ES6+)',
      'Composition API',
      'Pinia',
      'Vuetify',
      'Tailwind CSS',
      'HTML5 / CSS3',
    ],
  },
  {
    tier: 'Shipped in production',
    note: 'Built and maintained real features with these.',
    skills: [
      'WebRTC',
      'WebSocket / Socket.io',
      'Electron.js',
      'Fabric.js / Canvas',
      'Chart.js',
      'Node.js / Express',
      'MongoDB',
      'MySQL',
      'REST APIs',
      'Vue 2 / Vuex',
      'Vite',
      'Git',
    ],
  },
  {
    tier: 'Used in earlier work',
    note: 'Shipped production work with these earlier in my career.',
    skills: [
      'PHP / CodeIgniter',
      'jQuery',
      'Knockout.js',
      'NW.js',
      'Java / Spring Boot',
    ],
  },
]

export const education = {
  degree: 'Bachelor of Computer Applications',
  institution: 'Annamalai University, Tamil Nadu',
  period: '2017 - 2022',
  note: 'Studied by distance while working full time. Self-taught into software before that.',
}

export const certifications = [
  'Developing Back-End Apps with Node.js and Express (IBM, Coursera)',
  'Introduction to Software Engineering (IBM, Coursera)',
  'Introduction to Cloud Computing (IBM, Coursera)',
  'Front-End Web UI Frameworks and Tools: Bootstrap 4 (HKUST)',
  'Getting Started with Git and GitHub (IBM, Coursera)',
  'Introduction to Web Development with HTML, CSS, JavaScript (IBM, Coursera)',
]

