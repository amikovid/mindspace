# Mindspace — Full Project Documentation

> *"Real wisdom from real lives, mapped as a living constellation."*

---

## Table of Contents

1. [What Is Mindspace?](#1-what-is-mindspace)
2. [The Concept](#2-the-concept)
3. [Current State (v0)](#3-current-state-v0)
4. [How It Works — End-to-End](#4-how-it-works--end-to-end)
5. [Data Model](#5-data-model)
6. [Technology Stack](#6-technology-stack)
7. [Architecture](#7-architecture)
8. [Feature Reference](#8-feature-reference)
9. [The Embedding Pipeline](#9-the-embedding-pipeline)
10. [Backend & Database](#10-backend--database)
11. [Deployment](#11-deployment)
12. [Content Moderation Workflow](#12-content-moderation-workflow)
13. [Roadmap](#13-roadmap)
14. [Known Limitations & Debt](#14-known-limitations--debt)
15. [Frequently Asked Questions](#15-frequently-asked-questions)

---

## 1. What Is Mindspace?

**Mindspace** is an interactive 3D visualization of human wisdom. It takes short, first-person insights — things people have genuinely learned from life — and renders them as stars in space, positioned in 3D based on their semantic similarity to one another.

The core idea: when you look up at a real night sky, stars appear random. But if you knew their *meaning* — if conceptually similar stars pulled closer together — you'd start to see constellations of thought. Mindspace builds exactly that for human wisdom. Things like *"journal more"* cluster near *"stay with the problem"*, while *"God is everything you need"* finds itself close to *"Sab Moh Maaya hai"*, because at the level of embeddings, both are about acceptance and surrender.

It is simultaneously:
- **A crowdsourced oral history project** — anyone can contribute their most distilled insight
- **A data visualization art piece** — beautiful, meditative, navigable in 3D space
- **An AI-powered semantic search experience** — meaning determines position, not metadata
- **A social experiment** — what does a generation's collective wisdom actually look like when mapped?

---

## 2. The Concept

### The Prompt

Every contributor answers one question: *"What's one thing you know to be true?"*

They pair it with three pieces of context: their **age**, **gender**, and **occupation**. That context isn't decorative — it becomes part of how the wisdom is understood. "Be very cautious at every stage of your life" lands differently when you know it's from a 66-year-old retired accountant vs. a 23-year-old student.

### Why Stars?

Stars feel right for wisdom: distant, beautiful, individually small but collectively overwhelming. They have a long history as metaphors for knowledge and guidance (constellations *were* the original navigation system). The space aesthetic also creates a sense of calm and meditative exploration, as opposed to the aggressive data-dense look of most information tools.

### The Philosophical Tension

The interface is designed with a deliberate tension baked in:

- **Serendipity vs. Control**: The app resists the user's impulse to sort, filter, and search. When you click the search icon, it pushes back: *"The constellation was meant to be traversed without a guide — let serendipity lead you."* Same with the age/gender sort modes. The design philosophy is that accidental discovery is the point — but the option to structure your exploration is always available if you insist.
- **Individual vs. Collective**: Each star is one person's truth. The constellation is no one's truth — it's something that emerges only from all of them together.

---

## 3. Current State (v0)

As of April 2026, Mindspace has:

- **29 wisdom entries** collected manually by Kovid (the creator) from his personal network
- A fully working 3D visualization (Three.js/R3F) with semantic positioning via OpenAI embeddings + PCA
- Glassmorphic, dark-mode UI with Framer Motion animations
- Ambient generative audio (Tone.js) that responds to navigation
- Three view modes: **Semantic** (default), **Age sort**, **Gender split**
- A search function with philosophical resistance UX ("you're right" / "search anyway")
- A **Contribute page** where anyone can submit wisdom (stored in Supabase)
- An **Admin page** (password-protected) for reviewing and approving/rejecting submissions
- Deployed on **Vercel**, live and accessible

What it does NOT yet have: a closed-loop automated pipeline from submission → embeddings → live constellation update. Currently, new entries must be manually added to `learnings-raw.json` and the embedding script re-run.

---

## 4. How It Works — End-to-End

### The Full User Journey

```
User opens Mindspace
  → Landing screen: "Real wisdom from real lives, mapped as a living constellation."
  → Clicks "Enter the Universe"
  → Glassmorphic overlay fades, camera zooms into the star field
  → 29 stars floating in 3D space, positioned by semantic meaning
  → User orbits, clicks a star
  → The star's wisdom text + context appears in a side panel
  → Related learnings (3 most semantically similar) are shown, with connection lines drawn in space
  → User can click a related star to navigate to it
  → Ambient sine-wave pad drone plays throughout; clicking a star plays a pitch-mapped note
```

### The Contribution Journey

```
User clicks "Contribute" (bottom-right button or landing screen link)
  → Taken to /contribute — a form with floating particle background
  → Fills in: Age, Gender, Occupation, Wisdom (max 200 chars)
  → Submits → Supabase receives {age, gender, occupation, wisdom, status: 'pending'}
  → Success screen: "Your wisdom has been shared with Kovid"
  
Kovid (admin) goes to /admin
  → Enters password
  → Sees all pending submissions in a card grid
  → Clicks a card to open full detail modal
  → Clicks "Approve & Download": status updated to 'approved' in Supabase, JSON file auto-downloaded
  → Or "Reject": status set to 'rejected'
  
Kovid then:
  → Takes the downloaded JSON
  → Pastes the wisdom text into learnings-raw.json with a new ID
  → Runs `npm run generate-embeddings` to reprocess all data
  → Deploys updated build to Vercel
```

---

## 5. Data Model

### `learnings-raw.json` (source of truth for the constellation)

```json
[
  {
    "id": 1,
    "text": "It's okay to not have things figured out",
    "context": "24M Educator/entrepreneur"
  }
]
```

- **id**: Integer, sequential
- **text**: The wisdom statement (no length limit internally, capped at 200 chars in the UI)
- **context**: Free-text string, conventionally formatted as `{age}{gender initial} {occupation}` (e.g., `"62M Retired engineer"`, `"26F Community builder"`)

The context string convention is critical because `StarField.jsx` parses it with regex:
- Age: `/^(\d+)/` — extracts leading digits
- Gender: `/^\d+([MF])/` — extracts M or F immediately following the age

### `learnings-processed.json` (generated, committed to repo)

```json
[
  {
    "id": 1,
    "text": "It's okay to not have things figured out",
    "context": "24M Educator/entrepreneur",
    "position": { "x": -3.21, "y": 1.44, "z": 7.82 },
    "related": [9, 12, 14]
  }
]
```

- **position**: 3D coordinates produced by PCA on 1536-dimensional OpenAI embeddings (normalized to -10→+10 range)
- **related**: Array of IDs of the 3 most semantically similar learnings (by cosine similarity)

### `wisdom_submissions` (Supabase table)

| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| age | integer | Contributor's age |
| gender | text | M / F / NB / O / PNS |
| occupation | text | Free text, max 50 chars |
| wisdom | text | The submission, max 200 chars |
| status | text | `pending` / `approved` / `rejected` |
| created_at | timestamptz | Auto-set on insert |
| country | text (nullable) | Country of contributor (optional) |
| life_stage | text (nullable) | Student / Early career / Mid-career / Senior / Retired (optional) |
| wisdom_source | text (nullable) | How the contributor learned the wisdom (optional) |

---

## 6. Technology Stack

### Frontend

| Technology | Version | Role |
|---|---|---|
| **React** | 18.2 | UI framework |
| **Vite** | 5.0 | Build tool & dev server |
| **Three.js** | 0.160 | 3D rendering engine |
| **@react-three/fiber** | 8.15 | React renderer for Three.js |
| **@react-three/drei** | 9.92 | Three.js helpers (Stars, Line, TrackballControls) |
| **@react-three/postprocessing** | 2.15 | Post-processing effects (Bloom) |
| **Framer Motion** | 10.16 | UI animations and transitions |
| **Tone.js** | 14.7 | Web Audio + synthesis |
| **React Router DOM** | 7.13 | Client-side routing |
| **Tailwind CSS** | 3.4 | Utility CSS (for component styling) |

### Backend / Data

| Technology | Role |
|---|---|
| **Supabase** | PostgreSQL database for wisdom submissions |
| **@supabase/supabase-js** | Supabase client library |
| **OpenAI API** (`text-embedding-3-small`) | Generating 1536-dim embeddings from wisdom text |
| **ml-pca** | Principal Component Analysis for 3D coordinate generation |

### Infrastructure

| Technology | Role |
|---|---|
| **Vercel** | Hosting + serverless functions |
| **Notion API** | Alt submission backend (serverless function in `/api/submit.js`, currently unused in favour of Supabase) |
| **Git / GitHub** | Version control |

### Dev Dependencies

| Dependency | Role |
|---|---|
| **dotenv** | Loading `.env` in the Node embedding script |
| **openai** (npm) | OpenAI client for the embedding script |
| **@vitejs/plugin-react** | React Fast Refresh in Vite |
| **autoprefixer / postcss** | CSS toolchain for Tailwind |

---

## 7. Architecture

```
mindspace/
├── src/
│   ├── main.jsx                    # App entry point (ReactDOM.render)
│   ├── App.jsx                     # Router + top-level state (ConstellationView)
│   ├── components/
│   │   ├── LandingScreen.jsx       # Entry modal, audio pre-warm, tagline
│   │   ├── Scene.jsx               # Three.js Canvas, camera, lights, controls, bloom
│   │   ├── StarField.jsx           # Renders all stars; computes age/gender positional modes
│   │   ├── Star.jsx                # Individual star mesh; lerped animation, click/hover
│   │   ├── DetailPanel.jsx         # Slide-up/right panel showing selected wisdom + related
│   │   ├── AudioController.jsx     # Tone.js ambient drone + click sounds + mute toggle
│   │   ├── SearchBar.jsx           # Search with "resistance" UX pattern
│   │   ├── AgeToggle.jsx           # Sort-by-age toggle with resistance UX
│   │   ├── GenderToggle.jsx        # Split-by-gender toggle with resistance UX
│   │   ├── ContributePage.jsx      # Wisdom submission form + success state
│   │   └── AdminPage.jsx           # Password-gated submission review dashboard
│   ├── data/
│   │   ├── learnings-raw.json      # Source: manually curated wisdom entries
│   │   └── learnings-processed.json # Generated: raw + {position, related}
│   ├── lib/
│   │   └── supabase.js             # Supabase client (URL + anon key from env)
│   └── styles/
│       └── index.css               # Global styles, Tailwind directives, glassmorphism
├── scripts/
│   └── generateEmbeddings.js       # Node script: raw.json → OpenAI API → PCA → processed.json
├── api/
│   └── submit.js                   # Vercel serverless fn: POST /api/submit → Notion (legacy)
├── index.html                      # HTML shell
├── vite.config.js
├── tailwind.config.js
├── vercel.json                     # Routes /api/* to serverless functions
├── .env.example                    # Template for environment variables
└── package.json
```

### State Flow

```
App.jsx (ConstellationView state):
  - showLanding: bool          → controls LandingScreen visibility
  - selectedLearning: obj|null → drives DetailPanel + Star highlighting + audio
  - audioEnabled: bool         → controls ambient drone on/off
  - searchQuery: string        → filters star opacity via StarField → Star
  - showAge: bool              → triggers age-sort spatial rearrangement
  - showGender: bool           → triggers gender-split spatial rearrangement

Scene.jsx:
  - Receives all state, passes to ConstellationGroup → StarField
  - Handles camera animation on entry (spin + zoom via useFrame)

StarField.jsx:
  - Computes agePositions and genderPositions on mount (memoized)
  - Passes targetPosition to each Star (semantic | age | gender)
  - Manages camera lerp to selected star
  - Draws LINE segments to related stars

Star.jsx:
  - Per-frame lerp toward targetPosition (smooth rearrangement animation)
  - Scale lerp for hover/selected/related states
  - Opacity lerp for search dimming
  - Emissive pulse animation for related stars
```

### Routing

| Route | Component | Description |
|---|---|---|
| `/` | `ConstellationView` | The main 3D experience |
| `/contribute` | `ContributePage` | Wisdom submission form |
| `/admin` | `AdminPage` | Password-gated moderation dashboard |

---

## 8. Feature Reference

### Landing Screen (`LandingScreen.jsx`)

- Full-screen glassmorphic modal overlaying the (already-rendered, blurred + dimmed) star field
- Title: **Mindspace** + tagline: *"Real wisdom from real lives, mapped as a living constellation."*
- Two CTAs: **"Enter the Universe"** (enters constellation) and **"Contribute"** (navigates to `/contribute`)
- Plays an E4 sine note with reverb on entry click; pre-warms Tone.js audio context on hover
- Exit animation: card fades + scales up slightly as backdrop blur dissolves, revealing the star field

### Star Field (`Scene.jsx`, `StarField.jsx`, `Star.jsx`)

- **Canvas**: Black background, FOV 60°, camera starts at Z=30, enters to Z=22
- **5,000 background stars** via `@react-three/drei Stars` (decorative, no interaction)
- **29 wisdom stars**: White spheres (0.3 radius), metallic material with bloom
- **Bloom post-processing**: luminanceThreshold 0.3, intensity 1.5 — creates the ethereal glow
- **TrackballControls**: Rotate (left drag), zoom (scroll), no pan — preserves the space metaphor
- **Camera entry animation**: Cubic ease-out spin on X-axis + linear zoom via `isEntering` prop

### Star States

| State | Visual |
|---|---|
| Default | White, scale 1, emissiveIntensity 0.8 |
| Hovered | Scale 1.3 (lerped) |
| Selected | Blue (`#88ccff`), scale 1.5, emissiveIntensity 1.5 |
| Related | Orange (`#ffaa88`), scale 1.2, pulsing emissiveIntensity |
| Dimmed (search) | Opacity lerped to 0.08, emissiveIntensity 0.1 |

### Visual Modes

Three spatial arrangement modes, switchable at any time:

| Mode | What Changes | How Positioned |
|---|---|---|
| **Semantic** (default) | Stars in PCA-derived positions | OpenAI embedding dimensionality reduction |
| **Age Sort** | Stars rearranged: Y = age (young at bottom, old at top), X = spread within age cohort | Parsed from `context` field regex |
| **Gender Split** | Stars in hemispheres: M → right, F → left, arranged via golden angle on each half-sphere | Parsed from `context` field regex |

All transitions are animated via per-frame lerp in `Star.jsx` (factor 0.04 / frame). Connecting lines are hidden during non-semantic modes.

### Detail Panel (`DetailPanel.jsx`)

- Mobile: slides up from bottom (takes 60% viewport height)
- Desktop: fixed right panel, vertically centered
- Shows: wisdom text (large), context string (small), 3 related learnings (clickable)
- Clicking a related learning navigates to that star (updates `selectedLearning` in App state)

### Search (`SearchBar.jsx`)

Three-stage UX:
1. **Idle**: Small search icon at bottom-center
2. **Resisting**: Popup appears: *"The constellation was meant to be traversed without a guide — let serendipity lead you."* with two choices: *"you're right"* (close) or *"search anyway"*
3. **Active**: Pill-shaped input expands; query filters stars in real-time (dimming non-matching by text or context)

Matching is case-insensitive substring on both `learning.text` and `learning.context`.

### Age Toggle (`AgeToggle.jsx`)

- Same three-stage resistance UX as search
- Resistance copy: *"These stars were born equal — sorting them by age may deceive."*
- When active: stars rearrange so Y-axis = age spectrum (22yr at bottom → 66yr at top)
- Icon: concentric rings (inner dot = youth, outer dashed ring = age)

### Gender Toggle (`GenderToggle.jsx`)

- Same three-stage resistance UX
- Resistance copy: *"These stars were born whole — dividing them by gender may miss the point."*
- When active: M-coded stars cluster to right hemisphere, F-coded to left
- Icon: two dots with vertical dividing line

### Audio System (`AudioController.jsx`, `LandingScreen.jsx`)

Built on **Tone.js**:

- **Ambient drone**: PolySynth (sine oscillator) playing `['C2', 'G2', 'C3', 'E3']` — a C major chord in low register. Attack 4s, release 8s. Connected to Reverb (decay 4s, wet 0.5). Creates exactly the meditative deep-space atmosphere.
- **Click sounds**: Separate PolySynth with fast attack (10ms), short decay. Pitch is spatially mapped: a star's X position is remapped to a MIDI note in Middle C + 2 octave range. Stars on the left of the field play lower; stars on the right play higher.
- **Mute state**: Muting stops only the ambient drone (`releaseAll` + `disconnect`). Click sounds still play when muted (intentional — interaction feedback is preserved).
- **Browser autoplay restriction handling**: Tone.js is pre-warmed on the landing screen hover event to minimize latency on entry click.

### Contribute Page (`ContributePage.jsx`)

Form fields:
- **Age**: Number input (1-120)
- **Gender**: Dropdown (Male, Female, Non-binary, Other, Prefer not to say)
- **Occupation**: Text input (max 50 chars)
- **Wisdom**: Textarea (min 10, max 200 chars; live character counter, warning at 180)

**Optional extra context** (collapsed behind "Add more context ↓" toggle):
- **Country**: Text input — geography of wisdom
- **Life Stage**: Dropdown (Student / Early career / Mid-career / Senior / Retired)
- **How did you learn this?**: Dropdown (Lived it myself / Someone taught me / Read it somewhere / Figured it out the hard way)

Validation: All fields required, wisdom min length enforced; submit button disabled until valid.

On submit: POSTs to Supabase `wisdom_submissions` table. Shows animated success screen with sparkle ✨ emoji for 4 seconds, then resets.

Background: 30 animated floating particles (random position, size, drift duration).

### Admin Page (`AdminPage.jsx`)

- Password: `basssentence` (hardcoded in client — this is a low-security soft gate, not true auth)
- Loads all `pending` submissions from Supabase on login
- Displays in a responsive card grid (1 → 2 → 3 col)
- Click any card → full-screen modal with approve/reject buttons
- **Approve**: updates status to `approved` in Supabase + auto-downloads a JSON file formatted for pasting into `learnings-raw.json`
- **Reject**: updates status to `rejected` in Supabase

Downloaded JSON format:
```json
{
  "text": "the wisdom text",
  "context": "Shared by 25yr old Engineer",
  "related": []
}
```

---

## 9. The Embedding Pipeline

This is the technical core of what makes the visualization meaningful rather than arbitrary.

### Step 1: Generate Embeddings

`scripts/generateEmbeddings.js` reads `learnings-raw.json` and for each entry calls:

```
OpenAI API: text-embedding-3-small
Input: learning.text
Output: float[1536] — a 1536-dimensional vector
```

The `text-embedding-3-small` model produces vectors where semantically similar texts have high cosine similarity. It costs approximately $0.00002 per text entry.

### Step 2: PCA → 3D

With 29 entries → 29 vectors of 1536 dimensions, PCA reduces this to 3 principal components (the 3 axes of maximum variance). This is computed using `ml-pca`.

The 3D coordinates are then normalized to -10→+10 on each axis for comfortable scene placement.

This means: **the spatial distance between stars is a faithful (though imperfect) projection of their semantic distance.**

### Step 3: Similarity Relationships

For each entry, cosine similarity is computed against every other entry, and the top 3 most similar are stored as `related: [id, id, id]`. These drive:
- The visual connection lines in the constellation
- The "Related Learnings" list in the detail panel

### Running the Pipeline

```bash
# Requires VITE_OPENAI_API_KEY in .env
npm run generate-embeddings
# ~3 seconds for 29 entries, ~$0.01 total cost
```

Output: `src/data/learnings-processed.json` — committed to the repo so deployments don't need the OpenAI key.

---

## 10. Backend & Database

### Supabase (Active)

PostgreSQL database used for the contribution submission flow.

**Table**: `wisdom_submissions`

Row-level security (RLS) policies:
- INSERT: open (anyone can submit)
- SELECT: open (admin page reads all pending)
- UPDATE: open (admin can approve/reject)

> ⚠️ Note: The current RLS policy is intentionally permissive. For production scale, SELECT/UPDATE should be locked behind a proper auth role.

**Environment variables needed**:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

### Notion API (Legacy / Unused)

`api/submit.js` is a Vercel serverless function that was written to submit to a Notion database. This predates the Supabase integration and is currently unused by the frontend. The `@notionhq/client` dependency remains in `package.json`.

---

## 11. Deployment

Hosted on **Vercel**.

### Environment Variables Required on Vercel

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public key |
| `VITE_OPENAI_API_KEY` | Only needed if re-running embedding script in CI/CD |
| `NOTION_API_KEY` | Legacy; only needed if using `/api/submit` |
| `NOTION_DATABASE_ID` | Legacy; same as above |

### Build Process

```bash
npm run build   # Vite produces dist/
```

Vercel auto-deploys on push to main branch. The `vercel.json` routes `/api/*` to the `api/` serverless functions directory.

### Key Deployment Consideration

`learnings-processed.json` is committed to the repo. This means:
- New deployments show updated data without needing OpenAI at build time
- The downside: adding new wisdoms requires a manual PR cycle (run script → commit → push → deploy)

---

## 12. Content Moderation Workflow

Current (manual) flow:

```
1. Contributor submits via /contribute
2. Supabase stores as status='pending'
3. Kovid logs into /admin with password
4. Reviews each submission
5. Approves → JSON downloaded, status updated to 'approved'
6. Rejects → status updated to 'rejected'
7. Kovid manually appends approved entry to learnings-raw.json
8. Runs npm run generate-embeddings (requires OpenAI API key)
9. Commits learnings-processed.json to repo
10. Pushes → Vercel auto-deploys
```

This is the biggest operational bottleneck at current scale. See Roadmap for the automated pipeline plan.

---

## 13. Roadmap

### Near-term (v0.1 — Quality & Growth)

- [ ] **Automated embedding pipeline**: When admin approves a submission, trigger a GitHub Action that runs `generateEmbeddings.js` and commits the updated processed JSON automatically
- [ ] **Star labels on hover**: Show first 4-5 words of wisdom text as a 3D HTML label that fades in on hover, making exploration more legible without clicking
- [ ] **Color theming by theme cluster**: After embeddings, k-means cluster the stars and color each cluster distinctly (e.g., acceptance = blue, ambition = gold, relationships = rose)
- [ ] **Better admin auth**: Move from hardcoded password to Supabase session/magic link auth
- [ ] **Submission volume tracking**: Add a visible counter on the landing page ("X wisdoms contributed")
- [ ] **Share individual wisdom**: Generate a shareable URL like `/wisdom/14` that opens the constellation with that star pre-selected

### Medium-term (v1 — Public Scale)

- [ ] **Live constellation updates**: New approved submissions appear in the constellation without a full redeploy (load `learnings-processed.json` from a CDN/Supabase storage bucket, not bundled in the app)
- [ ] **Mobile touch controls**: The current TrackballControls have poor mobile UX. Implement pinch-to-zoom + touch-drag rotation
- [ ] **Filtered views**: Let users filter the constellation by age range or decade (e.g., "Show me only the 20s") — a more nuanced version of the current age sort
- [ ] **Thematic entry prompts**: Instead of one open prompt, offer optional theme prompts ("What changed your mind about something?", "What do you wish you'd known at 20?") — collects richer, more comparable data
- [ ] **Wisdom "echoes"**: When you select a star, show a text panel with not just its 3 most similar, but a miniature language model synthesis of what those stars have in common

### Long-term (v2 — Platform)

- [ ] **Multiple constellations**: Different galaxies for different questions/themes, navigable via a universe-level zoom-out
- [ ] **Time dimension**: A slider that shows which wisdoms were added when, or filters by the age of the contributor
- [ ] **Voice contributions**: Record a short voice note; speech-to-text populates the form; the voice clip plays when you select the star
- [ ] **API / embeddable widget**: Other projects can embed their own branded Mindspace constellation
- [ ] **Institutional versions**: Schools, organizations, conferences could run their own private constellation (e.g., "What did our team learn this year?")

---

## 14. Known Limitations & Debt

| Issue | Impact | Priority |
|---|---|---|
| Admin password is in plaintext client code | Low security (anyone can find it) | Medium |
| Full database re-embedding on any addition | All 29+ entries re-processed every time even if only 1 was added | Should optimize to incremental embedding |
| Notion serverless function is dead code | Unused dependency, minor bundle weight | Low — clean up |
| Gender parse regex only captures M/F | Non-binary, Other submissions appear on male side | Fix regex or use stored gender field directly |
| PCA-derived positions aren't stable | Adding new entries slightly repositions *all* existing stars | Needs a "fixed positions with incremental placement" strategy at scale |
| No rate limiting on Supabase insert | Spammable contribution form | Add basic frontend debounce + optional Supabase rate limiting |
| Search only matches exact substring | Doesn't catch synonyms or semantic variations | Long-term: semantic search over contributor text |

---

## 15. Frequently Asked Questions

**Who made this?**
Kovid Bhaduri, independently. Currently a personal/art project.

**How does a star's position get determined?**
OpenAI's `text-embedding-3-small` model converts each wisdom text into a 1536-dimensional vector representing its meaning. Principal Component Analysis (PCA) then compresses these 1536 dimensions down to 3, which become X/Y/Z coordinates in the scene.

**Why do related stars sometimes seem unrelated to me?**
Cosine similarity in embedding space captures statistical co-occurrence patterns across vast training data. It may find "related" themes that aren't obvious to a human reader, or miss thematic links that feel obvious. It's working on the level of language patterns, not human intuition.

**Can I contribute without a name/email?**
Yes. Mindspace collects no personally identifiable information. Age, gender, occupation, and the wisdom text are all that's stored.

**How long before my submission appears in the constellation?**
Currently, submissions go through manual review and a manual deployment cycle. There is no guaranteed timeline — it depends on when Kovid reviews and re-deploys.

**What's the maximum wisdom length?**
200 characters in the UI. There is no minimum enforced in the database, but the UI requires at least 10 characters.

**Is the app open source?**
Currently in a private GitHub repository. Open-source release is on the roadmap.

---

*Last updated: April 2026. For questions, contact Kovid Bhaduri.*
