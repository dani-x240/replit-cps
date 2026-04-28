# CPS Mobile — Design System & UI/UX Specification

**Product:** CPS Mobile (Crime Prevention System)
**Region:** Uganda
**Platforms:** Mobile-first web app, packageable as APK for offline use
**Version:** 1.0
**Last updated:** April 28, 2026

---

## Table of Contents

1. [Vision & Principles](#1-vision--principles)
2. [User Personas](#2-user-personas)
3. [Information Architecture](#3-information-architecture)
4. [User Journeys](#4-user-journeys)
5. [Design Tokens](#5-design-tokens)
6. [Typography](#6-typography)
7. [Color System](#7-color-system)
8. [Spacing, Radius & Elevation](#8-spacing-radius--elevation)
9. [Iconography](#9-iconography)
10. [Motion & Animation](#10-motion--animation)
11. [Components](#11-components)
12. [Patterns](#12-patterns)
13. [Screen-by-Screen Specifications](#13-screen-by-screen-specifications)
14. [Critical Interaction: SOS Flow](#14-critical-interaction-sos-flow)
15. [Critical Interaction: Invisible Mode](#15-critical-interaction-invisible-mode)
16. [States & Edge Cases](#16-states--edge-cases)
17. [Accessibility](#17-accessibility)
18. [Content & Voice](#18-content--voice)
19. [Localization](#19-localization)
20. [Offline & APK Considerations](#20-offline--apk-considerations)
21. [Governance & Contribution](#21-governance--contribution)

---

## 1. Vision & Principles

### Vision
Empower every Ugandan citizen to report and prevent crime in seconds, while giving police a clear, role-aware command center.

### Design Principles

| Principle | Meaning in practice |
|---|---|
| **Calm under pressure** | The UI never panics. Even during an SOS, motion is purposeful and copy is short. |
| **One-thumb friendly** | Every primary action sits within thumb reach on a 5-inch screen. |
| **Trust through clarity** | Visual hierarchy makes legal and emergency actions unambiguous. |
| **Role-coded** | Citizens see green; police see blue. Color is a navigational anchor. |
| **Resilient** | Works offline; degrades gracefully on weak networks and old devices. |
| **Inclusive** | Readable typography, large touch targets, simple language. |

---

## 2. User Personas

### P1 — Daniel, the Citizen (Primary)
- 28, market vendor in Kampala
- Owns a 4.5-inch Android phone, intermittent data
- Speaks English and Luganda
- Goal: report a theft fast, stay anonymous when needed

### P2 — Otim Joshua, the Investigation Officer (IO)
- 34, field officer
- Goal: receive cases, capture evidence, update status

### P3 — Officer Jowie, the Officer-in-Charge (OC)
- 41, station supervisor
- Goal: assign cases, monitor SOS alerts, manage officers

### P4 — SSP Moses, the District Police Commander (DPC)
- 52, district oversight
- Goal: read district-wide trends, broadcast alerts

### P5 — System Administrator
- Goal: manage users, audit logs, system configuration

---

## 3. Information Architecture

```
/                                Welcome
├── /role-selection              Citizen vs Police force
├── /police/roles                IO / OC / DPC / Admin chooser
├── /auth/citizen                Citizen login & register
├── /auth/police                 Police login
├── /citizen/
│   ├── dashboard                Hub with menu + SOS
│   ├── sos                      Emergency SOS screen
│   ├── report                   AI-assisted crime report
│   ├── chat                     AI Assistant portal
│   ├── cases                    My cases
│   ├── vault                    Evidence vault
│   ├── map                      Safety map
│   ├── alerts                   Alerts feed
│   ├── forms                    Police forms
│   └── settings                 Profile & preferences
└── /police/dashboard/:role      Role-specific officer dashboard
```

---

## 4. User Journeys

### J1 — Citizen reports a theft (happy path)
1. Open app → Welcome → Tap **Citizen**
2. Login (or register)
3. Land on Dashboard → Tap **Report Crime**
4. Talk or type to AI Assistant
5. Review summary → Submit
6. See confirmation, return to dashboard

### J2 — Citizen triggers SOS
1. From Dashboard, tap **Emergency SOS**
2. Press and hold the red button **3 seconds**
3. Alert is sent with GPS
4. **6-second** window: pick *Call 999* or *Record Video*
5. If neither chosen → audio recording starts automatically
6. Recording auto-stops at **30 seconds**, evidence uploads
7. "Help is on the way" confirmation

### J3 — Citizen enables Invisible Mode
1. On Dashboard, swipe up
2. UI flips to dark anonymous theme
3. All subsequent reports are anonymous until swipe down

### J4 — IO reviews assigned case
1. Login → Police Force → IO
2. Dashboard shows assigned cases
3. Open case → view evidence → update status

---

## 5. Design Tokens

Tokens live in `client/src/index.css` as CSS variables and are exposed through Tailwind in `tailwind.config.ts`. **Always reference tokens, never hard-code.**

### Token format
- Color values are stored as `H S% L%` (no `hsl()` wrapper)
- Consumed via `hsl(var(--token))` or Tailwind utilities

### Naming convention
- Semantic: `--background`, `--foreground`, `--primary`, `--destructive`
- Role-coded: `--citizen`, `--police`
- Modifier: `--<token>-foreground` for paired text

---

## 6. Typography

### Font families
| Token | Family | Use |
|---|---|---|
| `--font-display` | **Outfit** (500, 600, 700) | Headings, hero numbers, branded buttons |
| `--font-sans` | **DM Sans** (400, 500, 600, 700) | Body, labels, inputs |

### Type scale (mobile-first)
| Role | Size / line-height | Weight | Usage |
|---|---|---|---|
| Display XL | 32 / 40 | 700 | Hero greetings (`text-2xl font-display`) |
| Display L | 24 / 32 | 700 | Section titles |
| Title | 20 / 28 | 700 | Card headers |
| Body L | 16 / 24 | 500 | Default body |
| Body | 14 / 20 | 400 | Secondary text |
| Caption | 12 / 16 | 400 | Helper, GPS coords, timestamps |
| Overline | 12 / 16 | 700 (uppercase, tracking-wider) | "Emergency SOS" label |

### Rules
- Never mix more than 2 type weights per screen
- Never set font size below 12 px on mobile
- Headings always use `font-display`; everything else inherits `font-sans`

---

## 7. Color System

### Brand & role colors

| Token | Light value (HSL) | Hex preview | Use |
|---|---|---|---|
| `--citizen` | `142 76% 36%` | #16A34A | Citizen primary actions |
| `--police` | `217 91% 60%` | #3B82F6 | Police primary actions |
| `--primary` | `221 83% 53%` | #2563EB | Default primary |
| `--destructive` | `0 84% 60%` | #EF4444 | Errors, SOS button, logout |

### Neutral / surface

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `210 20% 98%` | `222 47% 11%` | Page background |
| `--foreground` | `222 47% 11%` | `210 40% 98%` | Body text |
| `--card` | `0 0% 100%` | `222 47% 11%` | Card surface |
| `--muted` | `210 40% 96%` | `217 19% 27%` | Secondary surface |
| `--border` | `214 32% 91%` | `217 19% 27%` | Dividers, outlines |

### Tailwind shade extensions
Tailwind's default `green-50…900` and `blue-50…900` are used directly for granular shading inside citizen and police themes.

| Citizen | Use |
|---|---|
| `green-50/30` | Dashboard background tint |
| `green-100` | Icon chip background |
| `green-600` | Primary button, accents |
| `green-700` | Pressed state |
| `green-900` | Headings |

| Police | Use |
|---|---|
| `blue-50` | Background tint |
| `blue-600` | Primary action |
| `blue-700` | Pressed state |
| `blue-900` | Headings |

### Semantic colors

| Status | Token / class | Use |
|---|---|---|
| Success | `green-600` + `bg-green-50` | Confirmations |
| Warning | `amber-500` + `bg-amber-50` | Alerts, advisories |
| Error / SOS | `red-600` + `bg-red-50` | SOS, destructive, errors |
| Info | `blue-600` + `bg-blue-50` | Tips, AI assistant banners |

### Contrast rules
- Body text on background: **≥ 4.5:1**
- Large text (≥ 18 px bold or 24 px regular): **≥ 3:1**
- Button label on filled button: **≥ 4.5:1**
- Never rely on color alone — always pair with icon or text

---

## 8. Spacing, Radius & Elevation

### Spacing scale (Tailwind units; 1 = 4 px)
`1, 2, 3, 4, 6, 8, 12, 16, 24` → `4 px, 8 px, 12 px, 16 px, 24 px, 32 px, 48 px, 64 px, 96 px`

| Token | Use |
|---|---|
| `gap-2` (8) | Inline icon + label |
| `gap-4` (16) | Grid items |
| `p-4` (16) | Card padding |
| `p-6` (24) | Page padding |
| `mb-8` (32) | Section separation |
| `pt-12` (48) | Top safe area padding |
| `pb-24` (96) | Bottom safe area for nav bars |

### Border radius
| Token | Value | Use |
|---|---|---|
| `rounded-sm` | 3 px | Inline tags |
| `rounded-md` | 6 px | Inputs |
| `rounded-lg` | 9 px | Default cards |
| `rounded-xl` | 12 px | Banners, alert pills |
| `rounded-2xl` | 16 px | Cards, modals |
| `rounded-3xl` | 24 px | Hero buttons (SOS) |
| `rounded-full` | 9999 | Avatars, FABs, mic button |

### Elevation
| Level | Tailwind | Use |
|---|---|---|
| 0 | none | Flat content |
| 1 | `shadow-sm` | Cards |
| 2 | `shadow-md` | Hovered cards |
| 3 | `shadow-xl` | Sheets, hero CTAs |
| 4 | `shadow-2xl shadow-red-600/40` | SOS hero button |

---

## 9. Iconography

### Library
**Lucide React** (consistent stroke, 24 px grid). Brand logos use **react-icons/si** when needed.

### Sizes
| Class | Use |
|---|---|
| `w-4 h-4` (16) | Inline with text |
| `w-5 h-5` (20) | Buttons, header back |
| `w-6 h-6` (24) | Menu chips |
| `w-8 h-8` (32) | Choice buttons (SOS Call/Video) |
| `w-12 h-12` (48) | SOS button glyph |
| `w-20 h-20` (80) | SOS hero glyph |

### Pairings (SOS-related)
| Icon | Meaning |
|---|---|
| `Siren` | Emergency / SOS |
| `Phone` | Call action |
| `Video` | Video evidence |
| `Mic` | Audio evidence |
| `ShieldCheck` | Safe / verified / success |
| `EyeOff` | Invisible Mode |
| `AlertTriangle` | Warning / countdown |
| `Bot` | AI Assistant |
| `MapPin` | Location |
| `Bell` | Alerts feed |

### Rules
- Never combine icons from different libraries on the same screen unless representing brands
- Always pair an icon with a text label on primary actions
- Icon color inherits text color of its container

---

## 10. Motion & Animation

Powered by **Framer Motion**. Motion is intentional, never decorative-only.

### Duration tokens
| Token | Value | Use |
|---|---|---|
| Instant | 100 ms | Hover/press scale |
| Fast | 200 ms | Page transitions |
| Base | 300 ms | Card mount, modal fade |
| Slow | 500 ms | Theme switch (Invisible Mode) |
| Hold | 3000 ms | SOS press |
| Choice | 6000 ms | SOS choice window |
| Capture | 30000 ms | SOS auto-recording |

### Easing
- Default: `[0.4, 0, 0.2, 1]` (ease-out)
- Press feedback: `whileTap={{ scale: 0.95 }}`
- Hover lift: `whileHover={{ scale: 1.02 }}`

### Reserved animations
| Effect | Where | Spec |
|---|---|---|
| Pulse | SOS icon, recording dot | 1 s infinite |
| Progress ring | SOS press | Linear, syncs to 3000 ms |
| Slide+fade | New messages in AI chat | y: 10 → 0, opacity 0 → 1, 200 ms |
| Drag-y | Dashboard for Invisible Mode | 120 px threshold |
| Scale-in | "Help is on the way" panel | 0.9 → 1, 300 ms |

### Reduced motion
Honor `prefers-reduced-motion`: disable pulse and drag, keep fades.

---

## 11. Components

All components are based on **shadcn/ui** built on **Radix UI** primitives. Each is themed by tokens.

### Atomic

| Component | Variants | Notes |
|---|---|---|
| **Button** | default, destructive, outline, secondary, ghost, link | Sizes: sm, default, lg, icon. Use `bg-green-600` for citizen, `bg-blue-600` for police. |
| **Input** | default | Always pair with `Label`. Has password-toggle pattern (Eye/EyeOff). |
| **Label** | — | 12–14 px, font-sans, semibold |
| **Badge** | default, secondary, destructive, outline | For statuses (Pending, Investigating, Resolved) |
| **Toast** | default, destructive | Top-right; auto-dismiss 4 s. Used for SOS confirmations, mode switches. |

### Composite

| Component | Use |
|---|---|
| **Card** | Menu tiles, case cards, alert cards |
| **MobileLayout** | Wraps every screen, constrains to phone width on desktop preview |
| **AICrimeAssistant** | Voice + text chat surface |
| **ScrollArea** | Long lists (chat, cases) |

### Component anatomy — Button

```
[ icon (optional) ] [ label ]
       ↑                ↑
    16-20 px         body L, semibold
```
- Padding: `px-4 py-2` (default), `px-6 py-3` (lg)
- Radius: `rounded-md` default, `rounded-full` for FABs
- States: default, hover (+5% darken), active (`scale-95`), disabled (40% opacity), loading (spinner)
- Touch target: minimum 44 × 44 px

### Component anatomy — Card

```
┌─────────────────────────┐
│ [ icon chip 48×48 ]     │
│                         │
│ Title (Title token)     │
│ Subtitle (Caption)      │
└─────────────────────────┘
```
- Radius: `rounded-2xl`
- Padding: `p-4`
- Border: `border` (1 px, `--border`)
- Shadow: `shadow-sm`
- Interactive: add `cursor-pointer hover:border-green-300` (or police equivalent)

---

## 12. Patterns

### Form pattern
- Use `Form` + `useForm` + `zodResolver`
- Order: Label → Input → Helper text → Error
- Submit button is full-width on mobile (`w-full`)
- Password fields show Eye/EyeOff toggle, validate ≥ 8 chars + uppercase + number

### List pattern
- Each item is a Card
- Left: icon chip; Right: chevron
- Empty state shows illustration + one-line message + primary CTA

### Empty state pattern
```
[ centered icon 64 px, muted color ]
[ Title — "No reports yet" ]
[ Body — "When you file a report it will appear here." ]
[ Primary button — "Report a Crime" ]
```

### Confirmation pattern
- Green check on circle (96 px) → headline → 1-line body → 2 buttons (secondary + primary)

### Error pattern
- Toast with `variant: "destructive"`
- Inline form errors below the field, red-600 text, 12 px

---

## 13. Screen-by-Screen Specifications

### S1 — Welcome (`/`)
- Full-bleed gradient
- Logo + tagline
- Two CTAs: **Get Started**

### S2 — Role Selection (`/role-selection`)
- Two large cards: **Citizen** (green) and **Police Force** (blue)
- Each card: icon (64 px) + name + 1-line description
- Tap → routes to respective auth or sub-roles

### S3 — Police Roles (`/police/roles`)
- 4 cards in 2×2 grid: IO, OC, DPC, Admin
- Each routes to `/auth/police` carrying role context

### S4 — Auth Citizen (`/auth/citizen`)
- Tabs: Login | Sign Up
- Login fields: Username, Password (with Eye toggle)
- Sign-up fields: Full Name, Username, Phone, NIN, Password
- Submit: full-width green-600 button
- "Back" link top-left

### S5 — Auth Police (`/auth/police`)
- Same structure as citizen but blue-themed
- Includes Station ID field

### S6 — Citizen Dashboard (`/citizen/dashboard`)
- Layout: header + Invisible Mode hint + SOS hero + 4×2 grid menu
- Header: greeting + logout icon
- SOS hero: 128 px tall, red-600, full-width, `rounded-3xl`
- Menu items: Report, Cases, Vault, Map, Alerts, Forms, AI Assistant, Settings
- Drag-y enabled for Invisible Mode

### S7 — Citizen SOS (`/citizen/sos`)
*See section 14 for full interaction.*

### S8 — Citizen Report (`/citizen/report`)
- Header with back arrow + title
- Blue tip banner about AI assistant
- AICrimeAssistant component
- Summary panel slides in when AI returns structured data
- Submit button: green, full-width

### S9 — Citizen Chat (`/citizen/chat`)
- Header with avatar + "AI Assistant · Online"
- Full-height chat surface
- Mic + text input + send

### S10 — Police Dashboard (`/police/dashboard/:role`)
- Header: officer name + role badge + station
- Stats row: Open cases, Today's reports, Active alerts
- Tabs by role (IO: My Cases; OC: Officers + Cases; DPC: District; Admin: Users)

---

## 14. Critical Interaction: SOS Flow

This is the most safety-critical interaction in the app. Every state, timing, and fallback must be honored.

### State machine

```
   idle ──press──▶ pressing ──3s hold──▶ choice ──tap──▶ calling
     ▲                │                     │                │
     │            release < 3s            6s expire          │
     │                ▼                     ▼                ▼
     └──── reset ◀── idle              recording_audio    sent
                                             │              ▲
                                       30s or stop          │
                                             ▼              │
                                          uploaded ─────────┘

choice ──Video tap──▶ recording_video ── 30s or stop ──▶ uploaded ──▶ sent
```

### Timings (locked)

| Phase | Duration | Behavior |
|---|---|---|
| `pressing` | 3000 ms | Circular progress fills; release cancels |
| `choice` | 6000 ms | Two big buttons; countdown visible |
| `recording_audio` (auto) | 30000 ms | Pulsing mic, countdown |
| `recording_video` (chosen) | 30000 ms | Live preview, countdown |
| `sent` | indefinite | "Help is on the way" until user navigates |

### Visual specs

- **Hero button:** 240 × 240 px, red-600, `rounded-full`, `shadow-2xl shadow-red-600/40`
- **Progress ring:** SVG circle r=110, stroke 8 px, red-600 over red-600/15 track
- **Choice buttons:** 96 px tall, `rounded-2xl`, blue-600 (Call), purple-600 (Video)
- **Recording banner:** red-600 background, white text, pulsing white dot

### Data sent

`POST /api/sos`
```json
{
  "coords": { "lat": 0.3476, "lng": 32.5825 },
  "triggeredAt": "2026-04-28T13:37:42.000Z"
}
```

`POST /api/sos/recording`
```json
{
  "alertId": 12,
  "kind": "audio" | "video",
  "mimeType": "audio/webm",
  "dataBase64": "..."
}
```

### Fallbacks

| Failure | Behavior |
|---|---|
| GPS denied/unavailable | Header shows "Locating…" but alert still sends with `coords: null` |
| Mic denied | Toast: "Microphone unavailable" → jump to `sent` |
| Camera denied | Toast: "Camera unavailable" → fall back to audio recording |
| Network down | Toast: "Alert queued offline" → sync when online (future: service worker queue) |

### Accessibility

- Hero button: `aria-label="Press and hold for 3 seconds to send SOS"`
- Live region announces: "Alert sent. Choose Call 999 or Record Video. 6 seconds remaining."
- Keyboard alternative: hold Space for 3 s on focused button

---

## 15. Critical Interaction: Invisible Mode

### Trigger
- **Activate:** swipe up on dashboard with `offset.y < -120 px`
- **Deactivate:** swipe down with `offset.y > 120 px`

### Visual transformation
| Element | Visible mode | Invisible mode |
|---|---|---|
| Background | `bg-green-50/30` | `bg-neutral-900` |
| Greeting | "Hello, Daniel" (green-900) | "Anonymous Citizen" (white) |
| Subtitle | "Keep Uganda Safe" | "Identity hidden · Swipe down to disable" |
| Cards | white + green border | `bg-white/5` + white/10 border |
| Icon chips | green-100 / green-600 | white/10 / white |
| Logout | red-500 on red-50 | red-400 on white/10 |
| Banner | "Swipe up for Invisible Mode" hint | "Anonymous reporting enabled" pill |

### Side effects
- All reports filed in this mode are flagged anonymous on the backend
- AI Assistant header shows "Anonymous session" badge
- Emergency SOS still includes GPS (legal/safety requirement)

---

## 16. States & Edge Cases

Every component must define these states:

| State | Visual treatment |
|---|---|
| **Default** | Token-based |
| **Hover** | +5% darken / `scale-1.02` (cards) |
| **Active / Pressed** | `scale-95`, darker shade |
| **Focus** | 2 px ring `--ring`, 2 px offset |
| **Disabled** | 40% opacity, `cursor-not-allowed` |
| **Loading** | Spinner replaces label; button keeps width |
| **Error** | Red border, red helper text |
| **Empty** | Empty-state pattern (sect. 12) |
| **Offline** | Banner: "Offline — actions will sync" |
| **Locked / verified-required** | Lock icon overlay |

---

## 17. Accessibility

### Targets
- WCAG 2.1 **AA** compliance
- Touch targets ≥ 44 × 44 px
- Focus visible on every interactive element

### Required attributes
- Every interactive element: `data-testid` for testing AND `aria-label` for screen readers
- Every form input: `<label>` association
- Every icon-only button: `aria-label`
- Live regions for SOS state changes

### Color & contrast
- No information conveyed by color alone
- Text ≥ 4.5:1, large text ≥ 3:1
- Test both light and dark themes

### Motion
- Respect `prefers-reduced-motion`
- Provide non-motion alternative for swipe gestures (Settings toggle for Invisible Mode)

---

## 18. Content & Voice

### Voice
- **Calm, direct, action-oriented**
- Short sentences (≤ 12 words)
- Active voice
- No jargon ("incident report" not "case ticket")

### Capitalization
- Buttons: **Title Case** ("Report Crime", "Submit Report")
- Headings: **Title Case**
- Body: sentence case

### Microcopy library

| Context | String |
|---|---|
| SOS confirm | "SOS Alert Sent — Police have been notified of your location." |
| SOS recording | "Recording Audio · Auto-stop in 30s" |
| SOS done | "Help is on the way" |
| Invisible on | "Invisible Mode Activated — Your identity will be hidden in reports." |
| Invisible off | "Invisible Mode Off — Reports will use your verified identity." |
| Offline | "Alert queued offline — Will sync when network is available." |
| AI greeting | "Hello. I'm your AI Crime Assistant. Please describe what happened, and I'll help you file a report." |
| Logout | "Sign out of CPS Mobile?" |

### Numbers, dates, locations
- Dates: `28 Apr 2026, 13:37` (24-hour, English)
- GPS: 4 decimal places (`0.3476, 32.5825`)
- Phone: `0700 123 456` (Uganda spacing)
- Currency: `UGX 25,000`

---

## 19. Localization

### Languages (priority)
1. English (default)
2. Luganda
3. Swahili

### Rules
- All copy lives in a translations dictionary (future: `client/src/i18n/`)
- Allow up to 30% string expansion in layouts
- Date/number formats follow user locale
- Right-to-left not required

---

## 20. Offline & APK Considerations

The app is built as a mobile-first web app intended for APK packaging (e.g., via Capacitor or PWA wrapper).

### Offline strategy
- Service worker caches app shell (HTML/CSS/JS)
- Critical static pages (Welcome, Dashboards) load instantly
- Outgoing actions (reports, SOS, evidence) queue in IndexedDB and replay on reconnect
- Toast clearly states when something is queued vs sent

### APK considerations
- All assets local (Google Fonts must be self-hosted for full offline)
- Use `tel:` links for Call 999 (Android dialer)
- Request runtime permissions: location, microphone, camera
- Honor Android back button = browser back

### Performance budgets
- Initial JS ≤ 250 KB gzipped
- Time to interactive on a 2G connection ≤ 5 s after first load
- Images served as WebP with `srcset`

---

## 21. Governance & Contribution

### Ownership
- **Design lead:** owns tokens, components, patterns
- **Frontend lead:** enforces use of tokens and components
- **Product lead:** owns content, flows, user research

### Adding a new component
1. Propose in design doc with anatomy + variants + states
2. Implement in `client/src/components/ui/`
3. Document in this file (Section 11)
4. Add `data-testid` and accessibility attributes
5. Pair with at least one usage example in the codebase

### Versioning
- Major: breaking token rename or component API change
- Minor: new component, new variant
- Patch: visual tweak, bug fix

### Source of truth
- Tokens: `client/src/index.css` + `tailwind.config.ts`
- Components: `client/src/components/ui/`
- Patterns: this document
- Live preview: workflow `Start application` at `/`

---

## Appendix A — Demo accounts (testing)

| Role | Username | Password |
|---|---|---|
| Citizen | `ogwang_daiel` | `btynatqnavry` |
| Investigation Officer | `otim_joshua` | `iam josh` |
| Officer-in-Charge | `jowie` | `123456789` |
| District Police Commander | `dpc_demo` | `password123` |
| System Administrator | `admin` | `password123` |

## Appendix B — Component-to-file map

| Component | Location |
|---|---|
| Buttons, Cards, Inputs, Toasts | `client/src/components/ui/` |
| AI Crime Assistant | `client/src/components/crime/AICrimeAssistant.tsx` |
| Mobile Layout | `client/src/components/layout/MobileLayout.tsx` |
| SOS screen | `client/src/pages/CitizenSOS.tsx` |
| Citizen Dashboard | `client/src/pages/CitizenDashboard.tsx` |
| Police Dashboard | `client/src/pages/PoliceDashboard.tsx` |

## Appendix C — API contract for design-relevant endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/register` | Citizen sign up |
| GET | `/api/user` | Current session |
| POST | `/api/sos` | Trigger SOS alert |
| POST | `/api/sos/recording` | Upload SOS evidence |
| GET | `/api/sos` | List SOS alerts (police) |
| POST | `/api/reports` | File a crime report |
| GET | `/api/alerts` | List public alerts |

---

*End of Design System & UI/UX Specification — v1.0*
