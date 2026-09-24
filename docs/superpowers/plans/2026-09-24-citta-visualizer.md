# Citta Visualizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, responsive, Sinhala-language Next.js app that lets a teacher project and explore how the 89 cittas relate to the 52 cetasikas, 14 kiccas, ekacittakkhaṇika paṭiccasamuppāda links, puggalas and bhūmis.

**Architecture:** A single typed dataset in `src/data` (entities written out explicitly, relations *derived from Abhidhammattha Saṅgaha rules* in small rule modules, each row tagged `rule | chart | disputed`) feeds a lookup index. A Zustand selection store (mirrored to the URL) is shared by four views: Explorer (HTML treemap + profile panels), Matrix (full table + review mode), Graph (React Flow, focus-centred rings), and Presentation (keyboard/swipe scenes). Everything is statically exported, so it runs offline.

**Tech Stack:** Next.js (App Router, `output: 'export'`), React, TypeScript, Tailwind CSS v4, Zustand, Motion (`motion/react`), d3-hierarchy, @xyflow/react, Vitest + Testing Library + jsdom, Playwright, tsx.

**Spec:** `docs/superpowers/specs/2026-09-24-citta-visualizer-design.md`

**Spec adjustments made while planning (flag these to the reviewer):**
- `elkjs` dropped: the graph's ring layout is ~15 lines of trigonometry, and a layout engine adds nothing.
- PS relation rows do not store `labelSi`; the label is derived from the link entity (`psLabel()`), so it can't drift.
- The Explorer treemap is laid out with d3 but rendered as absolutely positioned HTML `<button>`s, not SVG, so Sinhala text wraps and shapes correctly (addresses spec risk "Sinhala rendering in SVG").
- The spec's example caption "පීති: සිත් 51" uses the 121-citta count; in the 89 scheme pīti occurs in **35** cittas. Tests use 35.
- Puggala relations exclude the 4 magga cittas (momentary), matching the chart header counts 37/41/41/54/50/50/48/44.
- Bhūmi relations are *vīthi cittas arising in that plane*, matching the chart header counts 80/64/42.
- Cetasika bands stack inside the narrow desktop side panel; they sit side by side only at ≥1536px (`2xl`).
- The PS chain renders as a vertical flow (↓), which fits the side column and phones.

## Global Constraints

- All user-visible text is Sinhala Unicode, NFC-normalised; Sinhala conjuncts keep their ZWJ (U+200D), e.g. `ප්‍ර`, `ධ්‍ය`.
- Fonts: **Noto Sans Sinhala** (body) and **Abhaya Libre** (headings) via `next/font/google`, `subsets: ['sinhala']`, self-hosted at build.
- `next.config.ts` has `output: 'export'`; no API routes, server actions, or dynamic routes.
- Breakpoints: **mobile** < 768px, **tablet** 768–1279px, **desktop** ≥ 1280px (Tailwind `md` = 768, `xl` = 1280).
- No horizontal page scroll at any viewport, except inside the matrix grid's own scroll container. Grid/flex children that hold scrollers get `min-w-0`.
- Minimum touch target 44px (`min-h-11` / `min-w-11`).
- Colour tokens (CSS variables in `globals.css`): akusala red, ahetuka yellow, kāmāvacara sobhana green, rūpa teal, arūpa violet, lokuttara gold; cetasika bands blue / red / light green. Light and dark themes.
- Views never hardcode counts or relationships; they read them from `src/data`.
- Node ≥ 20 (machine has v24).
- Commit after every task. Commit messages end with:
  `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`

## Review Focus

1. **Sinhala text corruption.** A name missing its ZWJ (`්ර` instead of `්‍ර`) or stored non-NFC renders as broken letters on the projector → every entity name must be NFC and contain no bare al-lakuna + ra/ya. *(Test added in Task 2.)*
2. **Garbage in a shared link.** A teacher pastes `?c=0`, `?c=`, `?ce=1,1,1`, `?k=JAVANA` or `?c=999` → the app keeps the valid parts, dedupes, shows the Sinhala notice, and never crashes. *(Tests added in Task 7.)*
3. **Combination with zero matches.** Selecting e.g. දෝස + පීති → caption reads "… සිත් 0 — පොදු සිතක් නැත", all tiles dim, nothing blank or broken. *(Test added in Task 10.)*
4. **Presenter pressing keys past the ends of a scene.** → at the last step → stays on the last step; ← at the first step stays; no crash. *(Test added in Task 13.)*
5. **Browser storage blocked** (private window, kiosk laptop at a venue): reading or writing theme/presenter preferences throws → app still loads and toggles work for the session. *(Test added in Task 8.)*

---

## File Structure

```
next.config.ts                     static export
vitest.config.mts                  unit test config
playwright.config.ts               e2e config (3 viewports)
scripts/export-review.ts           writes review/data-review.csv + review/disputed.md
e2e/smoke.spec.ts                  Task 1 smoke
e2e/app.spec.ts                    Task 14 cross-viewport e2e
src/
  app/
    layout.tsx                     fonts, <html lang="si">, AppShell
    globals.css                    Tailwind v4 + colour tokens + themes
    page.tsx                       Explorer route
    matrix/page.tsx                Matrix route
    graph/page.tsx                 Graph route
    present/page.tsx               Presentation route
  test/setup.ts                    jest-dom, jsdom stubs, store reset
  data/
    types.ts                       all entity + relation types
    range.ts                       range(a, b) helper
    entities/
      groups.ts                    17 citta groups, sphere + category labels
      cittas.ts                    the 89 cittas
      cetasikas.ts                 the 52 cetasikas, band + subgroup labels
      kiccas.ts                    the 14 kiccas with vīthi order
      psLinks.ts                   paṭiccasamuppāda link entities + psLabel + STANDARD_CHAIN
      puggalas.ts                  8 puggalas
      bhumis.ts                    3 bhūmis (planes)
      entities.test.ts
    relations/
      cetasikaRules.ts (+ .test.ts)
      kiccaRules.ts
      puggalaRules.ts
      bhumiRules.ts
      otherRules.test.ts           kicca/puggala/bhūmi tests
      psRules.ts (+ .test.ts)
    index.ts (+ index.test.ts)     profiles, reverse index, matching, labels, search, id parsing
  state/
    selection.ts (+ .test.ts)      Zustand selection store + applySelect
    url.ts (+ .test.ts)            parse/serialize selection <-> query string
    useUrlSync.ts                  hook: URL <-> store
    ui.ts (+ .test.ts)             theme + presenter store (safe storage)
  components/
    colors.ts                      category/band class + tone maps
    hooks.ts                       useElementSize, useMediaQuery
    useLongPress.ts (+ .test.tsx)
    shell/
      nav.ts                       nav items
      AppShell.tsx                 top bar + notice + main + bottom nav
      TopBar.tsx
      BottomNav.tsx
      SearchBox.tsx
      Legend.tsx
      Toggles.tsx                  ThemeToggle, PresenterToggle
      Notice.tsx
      shell.test.tsx
  views/
    explorer/
      tileState.ts (+ .test.ts)
      layoutTreemap.ts (+ .test.ts)
      TileButton.tsx
      CittaMap.tsx                 desktop/tablet treemap
      CittaList.tsx                mobile accordion
      chipState.ts (+ .test.ts)
      Chip.tsx
      CetasikaGrid.tsx
      VithiStrip.tsx
      PsChain.tsx
      PersonPlaneBadges.tsx
      ProfilePanels.tsx
      BottomSheet.tsx
      ExplorerView.tsx
      explorerMap.test.tsx
      explorerPanels.test.tsx
    matrix/
      columns.ts (+ .test.ts)
      csv.ts
      MatrixView.tsx (+ .test.tsx)
    graph/
      buildGraph.ts (+ .test.ts)
      GraphView.tsx
  present/
    scenes.ts
    presenter.ts                   reducer
    presenter.test.ts
    PresentView.tsx (+ .test.tsx)
```

---

### Task 1: Scaffold the Next.js app (static export, fonts, tokens, test runners)

**Files:**
- Create (via create-next-app, then edit): `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Create: `vitest.config.mts`, `src/test/setup.ts`, `playwright.config.ts`, `e2e/smoke.spec.ts`
- Delete: create-next-app sample assets in `public/` (`*.svg`)

**Interfaces:**
- Produces: CSS tokens `--color-{akusala,ahetuka,kama-sobhana,rupa,arupa,lokuttara,band-annasamana,band-akusala,band-sobhana,bg,surface,fg,muted,line,hover}` → Tailwind utilities `bg-akusala`, `text-fg`, `border-line`, etc.; `font-sans` (Noto Sans Sinhala), `font-display` (Abhaya Libre); `data-theme="dark"` and `data-presenter="on"` on `<html>` switch theme / enlarge type; npm scripts `dev`, `build`, `test`, `e2e`, `typecheck`, `export:review`.

- [ ] **Step 1: Scaffold with create-next-app**

create-next-app refuses non-empty folders containing unknown files, so move `.vscode` aside temporarily (`docs/` and `.git` are allowed):

```bash
mv .vscode ../.vscode-bak
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
mv ../.vscode-bak .vscode
rm -f public/*.svg
```

Expected: `package.json`, `src/app/…`, `next.config.ts` exist; Tailwind v4 (`@import "tailwindcss"` in `globals.css`).

- [ ] **Step 2: Install dependencies**

```bash
npm i zustand motion d3-hierarchy @xyflow/react
npm i -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event @types/d3-hierarchy @playwright/test serve tsx
npx playwright install chromium
```

- [ ] **Step 3: Configure static export**

Replace `next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
```

- [ ] **Step 4: Add npm scripts**

In `package.json` `"scripts"`, keep `dev` and `build`, and set:

```json
"test": "vitest run --passWithNoTests",
"test:watch": "vitest",
"e2e": "playwright test",
"typecheck": "tsc --noEmit",
"export:review": "tsx scripts/export-review.ts"
```

- [ ] **Step 5: Write tokens and themes**

Replace `src/app/globals.css`:

```css
@import "tailwindcss";

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

@theme {
  --font-sans: var(--font-noto-sinhala), "Noto Sans Sinhala", system-ui, sans-serif;
  --font-display: var(--font-abhaya), "Abhaya Libre", serif;

  --color-akusala: #d64545;
  --color-ahetuka: #e3c23a;
  --color-kama-sobhana: #5a9e3f;
  --color-rupa: #2f8f9d;
  --color-arupa: #6d5bd0;
  --color-lokuttara: #c7881c;

  --color-band-annasamana: #2f8fb8;
  --color-band-akusala: #d64545;
  --color-band-sobhana: #7fb24f;

  --color-bg: #fbfaf7;
  --color-surface: #ffffff;
  --color-fg: #1c1b19;
  --color-muted: #6b6760;
  --color-line: #e2ded6;
  --color-hover: #fff3c4;
}

[data-theme="dark"] {
  --color-bg: #121212;
  --color-surface: #1d1d1f;
  --color-fg: #f2efe8;
  --color-muted: #a39e94;
  --color-line: #34322e;
  --color-hover: #3a3420;
  color-scheme: dark;
}

html {
  background: var(--color-bg);
  color: var(--color-fg);
}

body {
  font-family: var(--font-sans);
  line-height: 1.6;
}

html[data-presenter="on"] {
  font-size: 125%;
}

html[data-presenter="on"] .chrome-optional {
  display: none !important;
}

.react-flow__node.graph-node {
  font-family: var(--font-sans);
  border-radius: 9999px;
  padding: 6px 12px;
  width: auto;
  max-width: 200px;
  font-size: 13px;
  line-height: 1.3;
  text-align: center;
}
```

- [ ] **Step 6: Root layout with Sinhala fonts**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Abhaya_Libre, Noto_Sans_Sinhala } from 'next/font/google';
import './globals.css';

const noto = Noto_Sans_Sinhala({
  subsets: ['sinhala'],
  variable: '--font-noto-sinhala',
  display: 'swap',
});

const abhaya = Abhaya_Libre({
  subsets: ['sinhala'],
  weight: ['400', '700'],
  variable: '--font-abhaya',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'චිත්ත දර්ශකය',
  description: 'සිත් 89 හා චෛතසික, කෘත්‍ය, පටිච්චසමුප්පාද, පුද්ගල හා භූමි සම්බන්ධතා',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="si">
      <body className={`${noto.variable} ${abhaya.variable} antialiased`}>{children}</body>
    </html>
  );
}
```

Replace `src/app/page.tsx` (temporary; Task 10 replaces it):

```tsx
export default function Home() {
  return (
    <main className="p-6">
      <h1 className="font-display text-3xl font-bold">චිත්ත දර්ශකය</h1>
    </main>
  );
}
```

- [ ] **Step 7: Vitest config and setup**

Create `vitest.config.mts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, vi } from 'vitest';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false;
    },
  })) as unknown as typeof window.matchMedia;
}

// jsdom may lack PointerEvent; tests pass pointerType/clientX through it.
if (!('PointerEvent' in window)) {
  class PointerEventStub extends MouseEvent {
    pointerType: string;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerType = init.pointerType ?? 'mouse';
    }
  }
  (window as unknown as { PointerEvent: unknown }).PointerEvent = PointerEventStub;
}

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href, ...rest }, children),
}));

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 8: Playwright config and failing smoke test**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'e2e-results',
  use: { baseURL: 'http://localhost:3100' },
  webServer: {
    command: 'npm run build && npx serve out -l 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  projects: [
    {
      name: 'phone',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 820, height: 1180 }, hasTouch: true },
    },
    {
      name: 'projector',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
  ],
});
```

Append to `.gitignore`:

```
/e2e-results
/playwright-report
```

Create `e2e/smoke.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('home renders Sinhala title with lang=si', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'si');
  await expect(page.getByRole('heading', { name: 'චිත්ත දර්ශකය' })).toBeVisible();
});
```

- [ ] **Step 9: Run the smoke test and unit runner**

Run: `npx playwright test e2e/smoke.spec.ts --project=projector`
Expected: PASS (build produces `out/`, the page renders the heading).

Run: `npm test`
Expected: exits 0 ("No test files found" is allowed via `--passWithNoTests`).

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js static app with Sinhala fonts, tokens, test runners

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Entity data (types, 89 cittas, 52 cetasikas, kiccas, PS links, puggalas, bhūmis)

**Files:**
- Create: `src/data/types.ts`, `src/data/range.ts`
- Create: `src/data/entities/groups.ts`, `cittas.ts`, `cetasikas.ts`, `kiccas.ts`, `psLinks.ts`, `puggalas.ts`, `bhumis.ts`
- Test: `src/data/entities/entities.test.ts`

**Interfaces:**
- Produces (types, `src/data/types.ts`): `Status`, `Sphere`, `Jati`, `Vedana`, `Hetu`, `Sankharika`, `Sampayutta`, `Category`, `GroupId`, `Group`, `Citta`, `Band`, `CetasikaSubgroup`, `Cetasika`, `KiccaId`, `Kicca`, `PsLinkId`, `PsLink`, `PuggalaId`, `Puggala`, `BhumiId`, `Bhumi`, `CetasikaRel`, `KiccaRel`, `PsRel`, `PuggalaRel`, `BhumiRel`.
- Produces (values): `range(a, b): number[]`; `GROUPS`, `groupById`, `SPHERES`, `SPHERE_LABELS`, `CATEGORY_LABELS`; `CITTAS`, `cittaById`; `CETASIKAS`, `cetasikaById`, `BAND_LABELS`, `SUBGROUP_LABELS`; `KICCAS`, `kiccaById`; `PS_LINKS`, `psLinkById`, `psLabel(link)`, `STANDARD_CHAIN`; `PUGGALAS`, `puggalaById`; `BHUMIS`, `bhumiById`.
- Convention: `Citta.jhana` is the jhāna-factor level: rūpa 1–5, **arūpa 5**, **lokuttara 1** (89-citta scheme counts lokuttara as first-jhāna), otherwise `null`.

- [ ] **Step 1: Write the types**

Create `src/data/types.ts`:

```ts
export type Status = 'rule' | 'chart' | 'disputed';

export type Sphere = 'kamavacara' | 'rupavacara' | 'arupavacara' | 'lokuttara';
export type Jati = 'akusala' | 'kusala' | 'vipaka' | 'kiriya';
export type Vedana = 'somanassa' | 'domanassa' | 'upekkha' | 'sukha' | 'dukkha';
export type Hetu = 'ahetuka' | 'ekahetuka' | 'dvihetuka' | 'tihetuka';
export type Sankharika = 'asankharika' | 'sasankharika';
export type Sampayutta =
  | 'ditthi'
  | 'ditthi-vippayutta'
  | 'patigha'
  | 'vicikiccha'
  | 'uddhacca'
  | 'nana'
  | 'nana-vippayutta';
export type Category = 'akusala' | 'ahetuka' | 'kama-sobhana' | 'rupa' | 'arupa' | 'lokuttara';

export type GroupId =
  | 'lobhamula'
  | 'dosamula'
  | 'mohamula'
  | 'akusala-vipaka'
  | 'ahetuka-kusala-vipaka'
  | 'ahetuka-kiriya'
  | 'kama-kusala'
  | 'kama-vipaka'
  | 'kama-kiriya'
  | 'rupa-kusala'
  | 'rupa-vipaka'
  | 'rupa-kiriya'
  | 'arupa-kusala'
  | 'arupa-vipaka'
  | 'arupa-kiriya'
  | 'magga'
  | 'phala';

export interface Group {
  id: GroupId;
  nameSi: string;
  sphere: Sphere;
  category: Category;
}

export interface Citta {
  id: number;
  nameSi: string;
  short: string;
  group: GroupId;
  sphere: Sphere;
  jati: Jati;
  vedana: Vedana;
  hetu: Hetu;
  sankharika: Sankharika | null;
  sampayutta: Sampayutta | null;
  /** Jhāna-factor level: rūpa 1–5, arūpa 5, lokuttara 1 (89 scheme), else null. */
  jhana: 1 | 2 | 3 | 4 | 5 | null;
}

export type Band = 'annasamana' | 'akusala' | 'sobhana';
export type CetasikaSubgroup =
  | 'sabbacitta'
  | 'pakinnaka'
  | 'moha-catuka'
  | 'lobha-tika'
  | 'dosa-catuka'
  | 'thina-duka'
  | 'vicikiccha'
  | 'sobhana-sadharana'
  | 'virati'
  | 'appamanna'
  | 'panna';

export interface Cetasika {
  id: number;
  nameSi: string;
  band: Band;
  subgroup: CetasikaSubgroup;
}

export type KiccaId =
  | 'patisandhi'
  | 'bhavanga'
  | 'cuti'
  | 'avajjana'
  | 'dassana'
  | 'savana'
  | 'ghayana'
  | 'sayana'
  | 'phusana'
  | 'sampaticchana'
  | 'santirana'
  | 'votthapana'
  | 'javana'
  | 'tadarammana';

export interface Kicca {
  id: KiccaId;
  nameSi: string;
  /** Column in the vīthi strip; the five sense functions share column 4. */
  vithiOrder: number;
}

export type PsLinkId =
  | 'avijja-sankhara'
  | 'kusalamula-sankhara'
  | 'akusalamula-sankhara'
  | 'sankhara-vinnana'
  | 'vinnana-nama'
  | 'nama-chatthayatana'
  | 'chatthayatana-phassa'
  | 'phassa-vedana'
  | 'vedana-tanha'
  | 'vedana-patigha'
  | 'vedana-vicikiccha'
  | 'vedana-uddhacca'
  | 'vedana-pasada'
  | 'vedana-adhimokkha'
  | 'vedana-bhava'
  | 'tanha-upadana'
  | 'tanha-adhimokkha'
  | 'patigha-adhimokkha'
  | 'uddhacca-adhimokkha'
  | 'pasada-adhimokkha'
  | 'vicikiccha-bhava'
  | 'upadana-bhava'
  | 'adhimokkha-bhava'
  | 'bhava-jati'
  | 'jati-jaramarana';

export interface PsLink {
  id: PsLinkId;
  fromSi: string;
  toSi: string;
  /** Position 1–11 in the chain. */
  slot: number;
}

export type PuggalaId =
  | 'duggati-ahetuka'
  | 'sugati-ahetuka'
  | 'dvihetuka'
  | 'tihetuka'
  | 'sotapanna'
  | 'sakadagami'
  | 'anagami'
  | 'arahant';

export interface Puggala {
  id: PuggalaId;
  nameSi: string;
}

export type BhumiId = 'kama' | 'rupa' | 'arupa';

export interface Bhumi {
  id: BhumiId;
  nameSi: string;
}

export interface CetasikaRel {
  citta: number;
  cetasika: number;
  kind: 'niyata' | 'aniyata';
  status: Status;
  note?: string;
}

export interface KiccaRel {
  citta: number;
  kicca: KiccaId;
  status: Status;
  note?: string;
}

export interface PsRel {
  citta: number;
  psLink: PsLinkId;
  status: Status;
  note?: string;
}

export interface PuggalaRel {
  citta: number;
  puggala: PuggalaId;
  status: Status;
  note?: string;
}

export interface BhumiRel {
  citta: number;
  bhumi: BhumiId;
  status: Status;
  note?: string;
}
```

Create `src/data/range.ts`:

```ts
/** Inclusive integer range: range(1, 3) → [1, 2, 3]. */
export const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);
```

- [ ] **Step 2: Write the failing entity tests**

Create `src/data/entities/entities.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { range } from '../range';
import { BHUMIS } from './bhumis';
import { CETASIKAS } from './cetasikas';
import { CITTAS, cittaById } from './cittas';
import { GROUPS, groupById } from './groups';
import { KICCAS } from './kiccas';
import { PS_LINKS, STANDARD_CHAIN, psLabel, psLinkById } from './psLinks';
import { PUGGALAS } from './puggalas';

const allNames = (): string[] => [
  ...CITTAS.flatMap((c) => [c.nameSi, c.short]),
  ...CETASIKAS.map((c) => c.nameSi),
  ...KICCAS.map((k) => k.nameSi),
  ...PS_LINKS.map(psLabel),
  ...PUGGALAS.map((p) => p.nameSi),
  ...BHUMIS.map((b) => b.nameSi),
  ...GROUPS.map((g) => g.nameSi),
];

describe('cittas', () => {
  it('has 89 cittas with ids 1..89 in order', () => {
    expect(CITTAS.map((c) => c.id)).toEqual(range(1, 89));
  });

  it('has the expected group sizes', () => {
    const size = (g: string) => CITTAS.filter((c) => c.group === g).length;
    expect(size('lobhamula')).toBe(8);
    expect(size('dosamula')).toBe(2);
    expect(size('mohamula')).toBe(2);
    expect(size('akusala-vipaka')).toBe(7);
    expect(size('ahetuka-kusala-vipaka')).toBe(8);
    expect(size('ahetuka-kiriya')).toBe(3);
    for (const g of ['kama-kusala', 'kama-vipaka', 'kama-kiriya']) expect(size(g)).toBe(8);
    for (const g of ['rupa-kusala', 'rupa-vipaka', 'rupa-kiriya']) expect(size(g)).toBe(5);
    for (const g of ['arupa-kusala', 'arupa-vipaka', 'arupa-kiriya']) expect(size(g)).toBe(4);
    expect(size('magga')).toBe(4);
    expect(size('phala')).toBe(4);
  });

  it('places key cittas where the chart has them', () => {
    expect(cittaById.get(1)).toMatchObject({ short: 'ලෝභ 1', sampayutta: 'ditthi', sankharika: 'asankharika', vedana: 'somanassa' });
    expect(cittaById.get(4)).toMatchObject({ sampayutta: 'ditthi-vippayutta', sankharika: 'sasankharika' });
    expect(cittaById.get(10)).toMatchObject({ group: 'dosamula', sankharika: 'sasankharika', vedana: 'domanassa' });
    expect(cittaById.get(11)).toMatchObject({ sampayutta: 'vicikiccha', hetu: 'ekahetuka' });
    expect(cittaById.get(17)).toMatchObject({ vedana: 'dukkha', group: 'akusala-vipaka' });
    expect(cittaById.get(24)).toMatchObject({ vedana: 'sukha', group: 'ahetuka-kusala-vipaka' });
    expect(cittaById.get(26)).toMatchObject({ vedana: 'somanassa' });
    expect(cittaById.get(30)).toMatchObject({ group: 'ahetuka-kiriya', vedana: 'somanassa' });
    expect(cittaById.get(33)).toMatchObject({ group: 'kama-kusala', sampayutta: 'nana-vippayutta', hetu: 'dvihetuka' });
    expect(cittaById.get(55)).toMatchObject({ group: 'rupa-kusala', jhana: 1 });
    expect(cittaById.get(69)).toMatchObject({ group: 'rupa-kiriya', jhana: 5, vedana: 'upekkha' });
    expect(cittaById.get(70)).toMatchObject({ group: 'arupa-kusala', jhana: 5 });
    expect(cittaById.get(82)).toMatchObject({ group: 'magga', jati: 'kusala', jhana: 1 });
    expect(cittaById.get(89)).toMatchObject({ group: 'phala', jati: 'vipaka' });
  });

  it('references only known groups, and every group has a sphere matching its cittas', () => {
    for (const c of CITTAS) {
      const g = groupById.get(c.group);
      expect(g, `citta ${c.id}`).toBeDefined();
      expect(g!.sphere).toBe(c.sphere);
    }
    expect(GROUPS).toHaveLength(17);
  });
});

describe('cetasikas', () => {
  it('has 52 with ids 1..52 and 13/14/25 per band', () => {
    expect(CETASIKAS.map((c) => c.id)).toEqual(range(1, 52));
    const band = (b: string) => CETASIKAS.filter((c) => c.band === b).length;
    expect([band('annasamana'), band('akusala'), band('sobhana')]).toEqual([13, 14, 25]);
  });

  it('has the standard subgroup sizes', () => {
    const size = (s: string) => CETASIKAS.filter((c) => c.subgroup === s).length;
    expect(size('sabbacitta')).toBe(7);
    expect(size('pakinnaka')).toBe(6);
    expect(size('moha-catuka')).toBe(4);
    expect(size('lobha-tika')).toBe(3);
    expect(size('dosa-catuka')).toBe(4);
    expect(size('thina-duka')).toBe(2);
    expect(size('vicikiccha')).toBe(1);
    expect(size('sobhana-sadharana')).toBe(19);
    expect(size('virati')).toBe(3);
    expect(size('appamanna')).toBe(2);
    expect(size('panna')).toBe(1);
  });

  it('puts pīti at 12 and paññā at 52', () => {
    expect(CETASIKAS[11].nameSi).toBe('පීති');
    expect(CETASIKAS[51].nameSi).toBe('පඤ්ඤින්ද්‍රිය');
  });
});

describe('kiccas, PS links, puggalas, bhūmis', () => {
  it('has 14 kiccas, 5 of them sharing vīthi column 4', () => {
    expect(KICCAS).toHaveLength(14);
    expect(KICCAS.filter((k) => k.vithiOrder === 4)).toHaveLength(5);
  });

  it('has unique PS link ids with slots 1..11 and a valid standard chain', () => {
    expect(new Set(PS_LINKS.map((l) => l.id)).size).toBe(PS_LINKS.length);
    for (const l of PS_LINKS) {
      expect(l.slot).toBeGreaterThanOrEqual(1);
      expect(l.slot).toBeLessThanOrEqual(11);
    }
    expect(STANDARD_CHAIN).toHaveLength(11);
    STANDARD_CHAIN.forEach((id, i) => expect(psLinkById.get(id)!.slot).toBe(i + 1));
    expect(psLabel(psLinkById.get('vedana-tanha')!)).toBe('වේදනා පච්චයා තණ්හා');
  });

  it('has 8 puggalas and 3 bhūmis', () => {
    expect(PUGGALAS).toHaveLength(8);
    expect(BHUMIS).toHaveLength(3);
  });
});

describe('Sinhala text integrity', () => {
  it('every name is non-empty and NFC-normalised', () => {
    for (const n of allNames()) {
      expect(n.trim().length, n).toBeGreaterThan(0);
      expect(n, n).toBe(n.normalize('NFC'));
    }
  });

  it('no name has al-lakuna directly before ra/ya without ZWJ (broken rakāransaya/yansaya)', () => {
    for (const n of allNames()) {
      expect(n, n).not.toMatch(/්[රය]/);
    }
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run src/data/entities`
Expected: FAIL — cannot resolve `./bhumis`, `./cetasikas`, … (modules don't exist yet).

- [ ] **Step 4: Write groups**

Create `src/data/entities/groups.ts`:

```ts
import type { Category, Group, GroupId, Sphere } from '../types';

export const SPHERES: Sphere[] = ['kamavacara', 'rupavacara', 'arupavacara', 'lokuttara'];

export const SPHERE_LABELS: Record<Sphere, string> = {
  kamavacara: 'කාමාවචර',
  rupavacara: 'රූපාවචර',
  arupavacara: 'අරූපාවචර',
  lokuttara: 'ලෝකෝත්තර',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  akusala: 'අකුසල',
  ahetuka: 'අහේතුක',
  'kama-sobhana': 'කාමාවචර සෝභන',
  rupa: 'රූපාවචර',
  arupa: 'අරූපාවචර',
  lokuttara: 'ලෝකෝත්තර',
};

export const GROUPS: Group[] = [
  { id: 'lobhamula', nameSi: 'ලෝභමූල සිත්', sphere: 'kamavacara', category: 'akusala' },
  { id: 'dosamula', nameSi: 'ද්වේෂමූල සිත්', sphere: 'kamavacara', category: 'akusala' },
  { id: 'mohamula', nameSi: 'මෝහමූල සිත්', sphere: 'kamavacara', category: 'akusala' },
  { id: 'akusala-vipaka', nameSi: 'අකුසල විපාක සිත්', sphere: 'kamavacara', category: 'ahetuka' },
  { id: 'ahetuka-kusala-vipaka', nameSi: 'අහේතුක කුසල විපාක සිත්', sphere: 'kamavacara', category: 'ahetuka' },
  { id: 'ahetuka-kiriya', nameSi: 'අහේතුක ක්‍රියා සිත්', sphere: 'kamavacara', category: 'ahetuka' },
  { id: 'kama-kusala', nameSi: 'කාමාවචර කුසල සිත්', sphere: 'kamavacara', category: 'kama-sobhana' },
  { id: 'kama-vipaka', nameSi: 'කාමාවචර විපාක සිත්', sphere: 'kamavacara', category: 'kama-sobhana' },
  { id: 'kama-kiriya', nameSi: 'කාමාවචර ක්‍රියා සිත්', sphere: 'kamavacara', category: 'kama-sobhana' },
  { id: 'rupa-kusala', nameSi: 'රූපාවචර කුසල සිත්', sphere: 'rupavacara', category: 'rupa' },
  { id: 'rupa-vipaka', nameSi: 'රූපාවචර විපාක සිත්', sphere: 'rupavacara', category: 'rupa' },
  { id: 'rupa-kiriya', nameSi: 'රූපාවචර ක්‍රියා සිත්', sphere: 'rupavacara', category: 'rupa' },
  { id: 'arupa-kusala', nameSi: 'අරූපාවචර කුසල සිත්', sphere: 'arupavacara', category: 'arupa' },
  { id: 'arupa-vipaka', nameSi: 'අරූපාවචර විපාක සිත්', sphere: 'arupavacara', category: 'arupa' },
  { id: 'arupa-kiriya', nameSi: 'අරූපාවචර ක්‍රියා සිත්', sphere: 'arupavacara', category: 'arupa' },
  { id: 'magga', nameSi: 'ලෝකෝත්තර මාර්ග සිත්', sphere: 'lokuttara', category: 'lokuttara' },
  { id: 'phala', nameSi: 'ලෝකෝත්තර ඵල සිත්', sphere: 'lokuttara', category: 'lokuttara' },
];

export const groupById = new Map<GroupId, Group>(GROUPS.map((g) => [g.id, g]));
```

- [ ] **Step 5: Write the 89 cittas**

Create `src/data/entities/cittas.ts`:

```ts
import type { Citta, GroupId, Jati, Sankharika, Vedana } from '../types';

type Draft = Omit<Citta, 'id'>;

const V: Record<Vedana, string> = {
  somanassa: 'සෝමනස්ස සහගත',
  upekkha: 'උපේක්ෂා සහගත',
  domanassa: 'දෝමනස්ස සහගත',
  sukha: 'සුඛ සහගත',
  dukkha: 'දුක්ඛ සහගත',
};
const SANKH: Record<Sankharika, string> = { asankharika: 'අසංස්කාරික', sasankharika: 'සසංස්කාරික' };
const SANKHARIKAS: Sankharika[] = ['asankharika', 'sasankharika'];
const plain = { sankharika: null, sampayutta: null, jhana: null } as const;

const drafts: Draft[] = [];

// 1–8 ලෝභමූල
let n = 0;
for (const vedana of ['somanassa', 'upekkha'] as const)
  for (const ditthi of [true, false])
    for (const sankharika of SANKHARIKAS) {
      n += 1;
      drafts.push({
        nameSi: `${V[vedana]} දෘෂ්ටිගත ${ditthi ? 'සම්ප්‍රයුක්ත' : 'විප්‍රයුක්ත'} ${SANKH[sankharika]} සිත`,
        short: `ලෝභ ${n}`,
        group: 'lobhamula',
        sphere: 'kamavacara',
        jati: 'akusala',
        vedana,
        hetu: 'dvihetuka',
        sankharika,
        sampayutta: ditthi ? 'ditthi' : 'ditthi-vippayutta',
        jhana: null,
      });
    }

// 9–10 ද්වේෂමූල
SANKHARIKAS.forEach((sankharika, i) =>
  drafts.push({
    nameSi: `${V.domanassa} ප්‍රතිඝ සම්ප්‍රයුක්ත ${SANKH[sankharika]} සිත`,
    short: `ද්වේෂ ${i + 1}`,
    group: 'dosamula',
    sphere: 'kamavacara',
    jati: 'akusala',
    vedana: 'domanassa',
    hetu: 'dvihetuka',
    sankharika,
    sampayutta: 'patigha',
    jhana: null,
  }),
);

// 11–12 මෝහමූල
drafts.push(
  {
    ...plain,
    nameSi: `${V.upekkha} විචිකිච්ඡා සම්ප්‍රයුක්ත සිත`,
    short: 'විචිකිච්ඡා',
    group: 'mohamula',
    sphere: 'kamavacara',
    jati: 'akusala',
    vedana: 'upekkha',
    hetu: 'ekahetuka',
    sampayutta: 'vicikiccha',
  },
  {
    ...plain,
    nameSi: `${V.upekkha} උද්ධච්ච සම්ප්‍රයුක්ත සිත`,
    short: 'උද්ධච්ච',
    group: 'mohamula',
    sphere: 'kamavacara',
    jati: 'akusala',
    vedana: 'upekkha',
    hetu: 'ekahetuka',
    sampayutta: 'uddhacca',
  },
);

// 13–27 අහේතුක විපාක
const ahetuka = (group: GroupId, vedana: Vedana, nameSi: string, short: string, jati: Jati = 'vipaka'): Draft => ({
  ...plain,
  nameSi: `${V[vedana]} ${nameSi}`,
  short,
  group,
  sphere: 'kamavacara',
  jati,
  vedana,
  hetu: 'ahetuka',
});
const SENSES: [string, string][] = [
  ['චක්ඛු විඤ්ඤාණය', 'චක්ඛු'],
  ['සෝත විඤ්ඤාණය', 'සෝත'],
  ['ඝාණ විඤ්ඤාණය', 'ඝාණ'],
  ['ජිව්හා විඤ්ඤාණය', 'ජිව්හා'],
];
for (const [name, short] of SENSES) drafts.push(ahetuka('akusala-vipaka', 'upekkha', name, short));
drafts.push(
  ahetuka('akusala-vipaka', 'dukkha', 'කාය විඤ්ඤාණය', 'කාය'),
  ahetuka('akusala-vipaka', 'upekkha', 'සම්පටිච්ඡනය', 'සම්පටිච්ඡන'),
  ahetuka('akusala-vipaka', 'upekkha', 'සන්තීරණය', 'සන්තීරණ'),
);
for (const [name, short] of SENSES) drafts.push(ahetuka('ahetuka-kusala-vipaka', 'upekkha', name, short));
drafts.push(
  ahetuka('ahetuka-kusala-vipaka', 'sukha', 'කාය විඤ්ඤාණය', 'කාය'),
  ahetuka('ahetuka-kusala-vipaka', 'upekkha', 'සම්පටිච්ඡනය', 'සම්පටිච්ඡන'),
  ahetuka('ahetuka-kusala-vipaka', 'somanassa', 'සන්තීරණය', 'සන්තීරණ (සෝ.)'),
  ahetuka('ahetuka-kusala-vipaka', 'upekkha', 'සන්තීරණය', 'සන්තීරණ (උ.)'),
);

// 28–30 අහේතුක ක්‍රියා
drafts.push(
  ahetuka('ahetuka-kiriya', 'upekkha', 'පඤ්චද්වාරාවජ්ජනය', 'පඤ්චද්වාරාවජ්ජන', 'kiriya'),
  ahetuka('ahetuka-kiriya', 'upekkha', 'මනෝද්වාරාවජ්ජනය', 'මනෝද්වාරාවජ්ජන', 'kiriya'),
  ahetuka('ahetuka-kiriya', 'somanassa', 'හසිතුප්පාදය', 'හසිතුප්පාද', 'kiriya'),
);

// 31–54 කාමාවචර සෝභන
const KAMA_SOBHANA: [GroupId, Jati, string, string][] = [
  ['kama-kusala', 'kusala', 'කුසල සිත', 'මහා කුසල'],
  ['kama-vipaka', 'vipaka', 'විපාක සිත', 'මහා විපාක'],
  ['kama-kiriya', 'kiriya', 'ක්‍රියා සිත', 'මහා ක්‍රියා'],
];
for (const [group, jati, suffix, shortPrefix] of KAMA_SOBHANA) {
  let k = 0;
  for (const vedana of ['somanassa', 'upekkha'] as const)
    for (const nana of [true, false])
      for (const sankharika of SANKHARIKAS) {
        k += 1;
        drafts.push({
          nameSi: `${V[vedana]} ඥාන ${nana ? 'සම්ප්‍රයුක්ත' : 'විප්‍රයුක්ත'} ${SANKH[sankharika]} ${suffix}`,
          short: `${shortPrefix} ${k}`,
          group,
          sphere: 'kamavacara',
          jati,
          vedana,
          hetu: nana ? 'tihetuka' : 'dvihetuka',
          sankharika,
          sampayutta: nana ? 'nana' : 'nana-vippayutta',
          jhana: null,
        });
      }
}

// 55–69 රූපාවචර
const JHANA_ORDINAL = ['ප්‍රථම', 'ද්විතීය', 'තෘතීය', 'චතුර්ථ', 'පඤ්චම'];
const JHANA_FACTORS = [
  'විතක්ක විචාර ප්‍රීති සුඛ ඒකාග්‍රතා සහිත',
  'විචාර ප්‍රීති සුඛ ඒකාග්‍රතා සහිත',
  'ප්‍රීති සුඛ ඒකාග්‍රතා සහිත',
  'සුඛ ඒකාග්‍රතා සහිත',
  'උපේක්ෂා ඒකාග්‍රතා සහිත',
];
const MAHAGGATA_JATI: [Jati, string][] = [
  ['kusala', 'කුසල සිත'],
  ['vipaka', 'විපාක සිත'],
  ['kiriya', 'ක්‍රියා සිත'],
];
for (const [jati, suffix] of MAHAGGATA_JATI)
  for (const j of [1, 2, 3, 4, 5] as const) {
    drafts.push({
      nameSi: `${JHANA_FACTORS[j - 1]} ${JHANA_ORDINAL[j - 1]} ධ්‍යාන ${suffix}`,
      short: `${JHANA_ORDINAL[j - 1]} ධ්‍යාන`,
      group: `rupa-${jati}` as GroupId,
      sphere: 'rupavacara',
      jati,
      vedana: j <= 4 ? 'somanassa' : 'upekkha',
      hetu: 'tihetuka',
      sankharika: null,
      sampayutta: 'nana',
      jhana: j,
    });
  }

// 70–81 අරූපාවචර
const ARUPA: [string, string][] = [
  ['ආකාසානඤ්චායතන', 'ආකාසානඤ්චා.'],
  ['විඤ්ඤාණඤ්චායතන', 'විඤ්ඤාණඤ්චා.'],
  ['ආකිඤ්චඤ්ඤායතන', 'ආකිඤ්චඤ්ඤා.'],
  ['නේවසඤ්ඤානාසඤ්ඤායතන', 'නේවසඤ්ඤා.'],
];
for (const [jati, suffix] of MAHAGGATA_JATI)
  for (const [name, short] of ARUPA)
    drafts.push({
      nameSi: `${name} ${suffix}`,
      short,
      group: `arupa-${jati}` as GroupId,
      sphere: 'arupavacara',
      jati,
      vedana: 'upekkha',
      hetu: 'tihetuka',
      sankharika: null,
      sampayutta: 'nana',
      jhana: 5,
    });

// 82–89 ලෝකෝත්තර (89 scheme: counted as first jhāna)
const ARIYA = ['සෝතාපත්ති', 'සකදාගාමී', 'අනාගාමී', 'අර්හත්'];
for (const [group, jati, word] of [
  ['magga', 'kusala', 'මාර්ග'],
  ['phala', 'vipaka', 'ඵල'],
] as const)
  for (const a of ARIYA)
    drafts.push({
      nameSi: `${a} ${word} සිත`,
      short: `${a} ${word}`,
      group,
      sphere: 'lokuttara',
      jati,
      vedana: 'somanassa',
      hetu: 'tihetuka',
      sankharika: null,
      sampayutta: 'nana',
      jhana: 1,
    });

export const CITTAS: Citta[] = drafts.map((d, i) => ({ id: i + 1, ...d }));
export const cittaById = new Map<number, Citta>(CITTAS.map((c) => [c.id, c]));
```

- [ ] **Step 6: Write the 52 cetasikas**

Create `src/data/entities/cetasikas.ts`:

```ts
import type { Band, Cetasika, CetasikaSubgroup } from '../types';

const NAMES = [
  'ඵස්ස', 'වේදනා', 'සඤ්ඤා', 'චේතනා', 'ඒකග්ගතා', 'ජීවිතින්ද්‍රිය', 'මනසිකාර',
  'විතක්ක', 'විචාර', 'අධිමොක්ඛ', 'විරිය', 'පීති', 'ඡන්ද',
  'මෝහ', 'අහිරික', 'අනොත්තප්ප', 'උද්ධච්ච',
  'ලෝභ', 'දිට්ඨි', 'මාන',
  'දෝස', 'ඉස්සා', 'මච්ඡරිය', 'කුක්කුච්ච',
  'ථීන', 'මිද්ධ',
  'විචිකිච්ඡා',
  'සද්ධා', 'සති', 'හිරි', 'ඔත්තප්ප', 'අලෝභ', 'අදෝස', 'තත්‍රමජ්ඣත්තතා',
  'කායපස්සද්ධි', 'චිත්තපස්සද්ධි', 'කායලහුතා', 'චිත්තලහුතා', 'කායමුදුතා', 'චිත්තමුදුතා',
  'කායකම්මඤ්ඤතා', 'චිත්තකම්මඤ්ඤතා', 'කායපාගුඤ්ඤතා', 'චිත්තපාගුඤ්ඤතා', 'කායුජ්ජුකතා', 'චිත්තුජ්ජුකතා',
  'සම්මාවාචා', 'සම්මාකම්මන්ත', 'සම්මාආජීව',
  'කරුණා', 'මුදිතා',
  'පඤ්ඤින්ද්‍රිය',
];

const SUBGROUP_RANGES: [CetasikaSubgroup, number, number][] = [
  ['sabbacitta', 1, 7],
  ['pakinnaka', 8, 13],
  ['moha-catuka', 14, 17],
  ['lobha-tika', 18, 20],
  ['dosa-catuka', 21, 24],
  ['thina-duka', 25, 26],
  ['vicikiccha', 27, 27],
  ['sobhana-sadharana', 28, 46],
  ['virati', 47, 49],
  ['appamanna', 50, 51],
  ['panna', 52, 52],
];

export const BAND_LABELS: Record<Band, string> = {
  annasamana: 'අඤ්ඤසමාන',
  akusala: 'අකුසල',
  sobhana: 'සෝභන',
};

export const SUBGROUP_LABELS: Record<CetasikaSubgroup, string> = {
  sabbacitta: 'සබ්බචිත්ත සාධාරණ',
  pakinnaka: 'පකිණ්ණක',
  'moha-catuka': 'මෝහ චතුෂ්කය',
  'lobha-tika': 'ලෝභ ත්‍රිකය',
  'dosa-catuka': 'ද්වේෂ චතුෂ්කය',
  'thina-duka': 'ථීන ද්වය',
  vicikiccha: 'විචිකිච්ඡා',
  'sobhana-sadharana': 'සෝභන සාධාරණ',
  virati: 'විරති',
  appamanna: 'අප්පමඤ්ඤා',
  panna: 'පඤ්ඤා',
};

export const CETASIKAS: Cetasika[] = NAMES.map((nameSi, i) => {
  const id = i + 1;
  const [subgroup] = SUBGROUP_RANGES.find(([, from, to]) => id >= from && id <= to)!;
  const band: Band = id <= 13 ? 'annasamana' : id <= 27 ? 'akusala' : 'sobhana';
  return { id, nameSi, band, subgroup };
});

export const cetasikaById = new Map<number, Cetasika>(CETASIKAS.map((c) => [c.id, c]));
```

- [ ] **Step 7: Write kiccas, PS links, puggalas, bhūmis**

Create `src/data/entities/kiccas.ts`:

```ts
import type { Kicca, KiccaId } from '../types';

export const KICCAS: Kicca[] = [
  { id: 'patisandhi', nameSi: 'පටිසන්ධි', vithiOrder: 1 },
  { id: 'bhavanga', nameSi: 'භවාංග', vithiOrder: 2 },
  { id: 'avajjana', nameSi: 'ආවජ්ජන', vithiOrder: 3 },
  { id: 'dassana', nameSi: 'දස්සන', vithiOrder: 4 },
  { id: 'savana', nameSi: 'සවන', vithiOrder: 4 },
  { id: 'ghayana', nameSi: 'ඝායන', vithiOrder: 4 },
  { id: 'sayana', nameSi: 'සායන', vithiOrder: 4 },
  { id: 'phusana', nameSi: 'ඵුසන', vithiOrder: 4 },
  { id: 'sampaticchana', nameSi: 'සම්පටිච්ඡන', vithiOrder: 5 },
  { id: 'santirana', nameSi: 'සන්තීරණ', vithiOrder: 6 },
  { id: 'votthapana', nameSi: 'වොට්ඨබ්බන', vithiOrder: 7 },
  { id: 'javana', nameSi: 'ජවන', vithiOrder: 8 },
  { id: 'tadarammana', nameSi: 'තදාරම්මණ', vithiOrder: 9 },
  { id: 'cuti', nameSi: 'චුති', vithiOrder: 10 },
];

export const kiccaById = new Map<KiccaId, Kicca>(KICCAS.map((k) => [k.id, k]));
```

Create `src/data/entities/psLinks.ts`:

```ts
import type { PsLink, PsLinkId } from '../types';

const L = (id: PsLinkId, fromSi: string, toSi: string, slot: number): PsLink => ({ id, fromSi, toSi, slot });

export const PS_LINKS: PsLink[] = [
  L('avijja-sankhara', 'අවිජ්ජා', 'සංඛාර', 1),
  L('kusalamula-sankhara', 'කුසලමූල', 'සංඛාර', 1),
  L('akusalamula-sankhara', 'අකුසලමූල', 'සංඛාර', 1),
  L('sankhara-vinnana', 'සංඛාර', 'විඤ්ඤාණ', 2),
  L('vinnana-nama', 'විඤ්ඤාණ', 'නාම', 3),
  L('nama-chatthayatana', 'නාම', 'ඡට්ඨායතන', 4),
  L('chatthayatana-phassa', 'ඡට්ඨායතන', 'ඵස්ස', 5),
  L('phassa-vedana', 'ඵස්ස', 'වේදනා', 6),
  L('vedana-tanha', 'වේදනා', 'තණ්හා', 7),
  L('vedana-patigha', 'වේදනා', 'පටිඝ', 7),
  L('vedana-vicikiccha', 'වේදනා', 'විචිකිච්ඡා', 7),
  L('vedana-uddhacca', 'වේදනා', 'උද්ධච්ච', 7),
  L('vedana-pasada', 'වේදනා', 'පසාද', 7),
  L('vedana-adhimokkha', 'වේදනා', 'අධිමොක්ඛ', 7),
  L('vedana-bhava', 'වේදනා', 'භව', 7),
  L('tanha-upadana', 'තණ්හා', 'උපාදාන', 8),
  L('tanha-adhimokkha', 'තණ්හා', 'අධිමොක්ඛ', 8),
  L('patigha-adhimokkha', 'පටිඝ', 'අධිමොක්ඛ', 8),
  L('uddhacca-adhimokkha', 'උද්ධච්ච', 'අධිමොක්ඛ', 8),
  L('pasada-adhimokkha', 'පසාද', 'අධිමොක්ඛ', 8),
  L('vicikiccha-bhava', 'විචිකිච්ඡා', 'භව', 8),
  L('upadana-bhava', 'උපාදාන', 'භව', 9),
  L('adhimokkha-bhava', 'අධිමොක්ඛ', 'භව', 9),
  L('bhava-jati', 'භව', 'ජාති', 10),
  L('jati-jaramarana', 'ජාති', 'ජරාමරණ', 11),
];

export const psLinkById = new Map<PsLinkId, PsLink>(PS_LINKS.map((l) => [l.id, l]));

export const psLabel = (l: PsLink): string => `${l.fromSi} පච්චයා ${l.toSi}`;

/** The textbook 11-link chain; used as greyed placeholders for empty slots. */
export const STANDARD_CHAIN: PsLinkId[] = [
  'avijja-sankhara',
  'sankhara-vinnana',
  'vinnana-nama',
  'nama-chatthayatana',
  'chatthayatana-phassa',
  'phassa-vedana',
  'vedana-tanha',
  'tanha-upadana',
  'upadana-bhava',
  'bhava-jati',
  'jati-jaramarana',
];
```

Create `src/data/entities/puggalas.ts`:

```ts
import type { Puggala, PuggalaId } from '../types';

export const PUGGALAS: Puggala[] = [
  { id: 'duggati-ahetuka', nameSi: 'දුග්ගති අහේතුක' },
  { id: 'sugati-ahetuka', nameSi: 'සුගති අහේතුක' },
  { id: 'dvihetuka', nameSi: 'ද්විහේතුක' },
  { id: 'tihetuka', nameSi: 'ත්‍රිහේතුක පෘථග්ජන' },
  { id: 'sotapanna', nameSi: 'සෝතාපන්න' },
  { id: 'sakadagami', nameSi: 'සකදාගාමී' },
  { id: 'anagami', nameSi: 'අනාගාමී' },
  { id: 'arahant', nameSi: 'අර්හත්' },
];

export const puggalaById = new Map<PuggalaId, Puggala>(PUGGALAS.map((p) => [p.id, p]));
```

Create `src/data/entities/bhumis.ts`:

```ts
import type { Bhumi, BhumiId } from '../types';

export const BHUMIS: Bhumi[] = [
  { id: 'kama', nameSi: 'කාම භූමි' },
  { id: 'rupa', nameSi: 'රූප භූමි' },
  { id: 'arupa', nameSi: 'අරූප භූමි' },
];

export const bhumiById = new Map<BhumiId, Bhumi>(BHUMIS.map((b) => [b.id, b]));
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npx vitest run src/data/entities`
Expected: PASS. If the ZWJ test fails, the failing string is printed: re-type the conjunct with `‍` between `්` and `ර`/`ය` (e.g. `'ප්‍ර'`).

- [ ] **Step 9: Commit**

```bash
git add src/data
git commit -m "feat(data): add citta, cetasika, kicca, PS link, puggala and bhumi entities

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---
### Task 3: Citta ↔ Cetasika relations (sampayoga rules)

**Files:**
- Create: `src/data/relations/cetasikaRules.ts`
- Test: `src/data/relations/cetasikaRules.test.ts`

**Interfaces:**
- Consumes: `CITTAS` (Task 2), `range` (Task 2), types `Citta`, `CetasikaRel`.
- Produces: `CETASIKA_RELS: CetasikaRel[]`, sorted by citta then cetasika id; every row `status: 'rule'`.

Domain background for the implementer (Abhidhammattha Saṅgaha, ch. 2): each cetasika has a rule for which cittas it joins. "Aniyata" (●) means it *may* be present (māna, issā, macchariya, kukkucca, thīna, middha, virati in kāma kusala, karuṇā, muditā); everything else present is "niyata" (✓). The expected numbers in the test are the textbook maxima per citta (counting aniyata as present).

- [ ] **Step 1: Write the failing tests**

Create `src/data/relations/cetasikaRules.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { range } from '../range';
import { CETASIKA_RELS } from './cetasikaRules';

/** Textbook maximum cetasika count for citta 1..89 (index = id - 1). */
const EXPECTED_PER_CITTA = [
  19, 21, 19, 21, 18, 20, 18, 20, 20, 22, 15, 15, // 1–12 akusala
  7, 7, 7, 7, 7, 10, 10, // 13–19 akusala vipāka
  7, 7, 7, 7, 7, 10, 11, 10, // 20–27 ahetuka kusala vipāka
  10, 11, 12, // 28–30 ahetuka kiriya
  38, 38, 37, 37, 37, 37, 36, 36, // 31–38 mahā kusala
  33, 33, 32, 32, 32, 32, 31, 31, // 39–46 mahā vipāka
  35, 35, 34, 34, 34, 34, 33, 33, // 47–54 mahā kiriya
  35, 34, 33, 32, 30, // 55–59 rūpa kusala
  35, 34, 33, 32, 30, // 60–64 rūpa vipāka
  35, 34, 33, 32, 30, // 65–69 rūpa kiriya
  ...Array(12).fill(30), // 70–81 arūpa
  ...Array(8).fill(36), // 82–89 lokuttara
];

/** Number of cittas each cetasika 1..52 occurs in (89 scheme). */
const EXPECTED_PER_CETASIKA: Record<number, number> = {
  1: 89, 2: 89, 3: 89, 4: 89, 5: 89, 6: 89, 7: 89,
  8: 55, 9: 58, 10: 78, 11: 73, 12: 35, 13: 69,
  14: 12, 15: 12, 16: 12, 17: 12,
  18: 8, 19: 4, 20: 4,
  21: 2, 22: 2, 23: 2, 24: 2,
  25: 5, 26: 5, 27: 1,
  ...Object.fromEntries(range(28, 46).map((id) => [id, 59])),
  47: 16, 48: 16, 49: 16,
  50: 28, 51: 28,
  52: 47,
};

const cetasikasOf = (citta: number) => CETASIKA_RELS.filter((r) => r.citta === citta);
const kindOf = (citta: number, cetasika: number) =>
  CETASIKA_RELS.find((r) => r.citta === citta && r.cetasika === cetasika)?.kind;

describe('CETASIKA_RELS', () => {
  it('matches the textbook count for every citta', () => {
    const actual = range(1, 89).map((id) => cetasikasOf(id).length);
    expect(actual).toEqual(EXPECTED_PER_CITTA);
  });

  it('matches the textbook count for every cetasika', () => {
    for (const [id, expected] of Object.entries(EXPECTED_PER_CETASIKA)) {
      expect(CETASIKA_RELS.filter((r) => r.cetasika === Number(id)).length, `cetasika ${id}`).toBe(expected);
    }
  });

  it('gives citta 1 exactly the 19 textbook cetasikas', () => {
    expect(cetasikasOf(1).map((r) => r.cetasika)).toEqual([...range(1, 19)]);
  });

  it('has the 7 universals in all 89 cittas', () => {
    for (const citta of range(1, 89)) {
      for (const u of range(1, 7)) expect(kindOf(citta, u), `citta ${citta}`).toBe('niyata');
    }
  });

  it('marks the occasional cetasikas as aniyata', () => {
    expect(kindOf(3, 20)).toBe('aniyata'); // māna
    expect(kindOf(9, 22)).toBe('aniyata'); // issā
    expect(kindOf(2, 25)).toBe('aniyata'); // thīna
    expect(kindOf(31, 47)).toBe('aniyata'); // virati in kāma kusala
    expect(kindOf(82, 47)).toBe('niyata'); // virati in magga
    expect(kindOf(55, 50)).toBe('aniyata'); // karuṇā
  });

  it('never puts akusala cetasikas in sobhana cittas', () => {
    expect(CETASIKA_RELS.filter((r) => r.citta >= 31 && r.cetasika >= 14 && r.cetasika <= 27)).toEqual([]);
  });

  it('has no duplicate pairs and only rule status', () => {
    const keys = CETASIKA_RELS.map((r) => `${r.citta}:${r.cetasika}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(CETASIKA_RELS.every((r) => r.status === 'rule')).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/data/relations/cetasikaRules.test.ts`
Expected: FAIL — cannot resolve `./cetasikaRules`.

- [ ] **Step 3: Implement the rules**

Create `src/data/relations/cetasikaRules.ts`:

```ts
/**
 * Citta ↔ cetasika combinations derived from the sampayoga rules of the
 * Abhidhammattha Saṅgaha (ch. 2), 89-citta scheme.
 */
import { CITTAS } from '../entities/cittas';
import { range } from '../range';
import type { CetasikaRel, Citta } from '../types';

const DVIPANCA = new Set([...range(13, 17), ...range(20, 24)]);
const SAMPATICCHANA_OR_PANCADVARAVAJJANA = new Set([18, 25, 28]);
const SANTIRANA = new Set([19, 26, 27]);

const isKama = (c: Citta) => c.sphere === 'kamavacara';
const jhanaAtMost = (c: Citta, level: number) => c.jhana !== null && c.jhana <= level;

interface Rule {
  cetasikas: number[];
  applies: (c: Citta) => boolean;
  kind?: (c: Citta) => 'niyata' | 'aniyata';
}

const aniyata = () => 'aniyata' as const;

const RULES: Rule[] = [
  // අඤ්ඤසමාන
  { cetasikas: range(1, 7), applies: () => true },
  { cetasikas: [8], applies: (c) => (isKama(c) ? !DVIPANCA.has(c.id) : c.jhana === 1) },
  { cetasikas: [9], applies: (c) => (isKama(c) ? !DVIPANCA.has(c.id) : jhanaAtMost(c, 2)) },
  { cetasikas: [10], applies: (c) => !DVIPANCA.has(c.id) && c.sampayutta !== 'vicikiccha' },
  {
    cetasikas: [11],
    applies: (c) => !DVIPANCA.has(c.id) && !SAMPATICCHANA_OR_PANCADVARAVAJJANA.has(c.id) && !SANTIRANA.has(c.id),
  },
  { cetasikas: [12], applies: (c) => (isKama(c) ? c.vedana === 'somanassa' : jhanaAtMost(c, 3)) },
  { cetasikas: [13], applies: (c) => c.hetu !== 'ahetuka' && c.group !== 'mohamula' },
  // අකුසල
  { cetasikas: range(14, 17), applies: (c) => c.jati === 'akusala' },
  { cetasikas: [18], applies: (c) => c.group === 'lobhamula' },
  { cetasikas: [19], applies: (c) => c.sampayutta === 'ditthi' },
  { cetasikas: [20], applies: (c) => c.sampayutta === 'ditthi-vippayutta', kind: aniyata },
  { cetasikas: [21], applies: (c) => c.group === 'dosamula' },
  { cetasikas: [22, 23, 24], applies: (c) => c.group === 'dosamula', kind: aniyata },
  { cetasikas: [25, 26], applies: (c) => c.jati === 'akusala' && c.sankharika === 'sasankharika', kind: aniyata },
  { cetasikas: [27], applies: (c) => c.sampayutta === 'vicikiccha' },
  // සෝභන
  { cetasikas: range(28, 46), applies: (c) => c.id >= 31 },
  {
    cetasikas: [47, 48, 49],
    applies: (c) => c.group === 'kama-kusala' || c.sphere === 'lokuttara',
    kind: (c) => (c.sphere === 'lokuttara' ? 'niyata' : 'aniyata'),
  },
  {
    cetasikas: [50, 51],
    applies: (c) =>
      c.group === 'kama-kusala' || c.group === 'kama-kiriya' || (c.sphere === 'rupavacara' && jhanaAtMost(c, 4)),
    kind: aniyata,
  },
  { cetasikas: [52], applies: (c) => c.hetu === 'tihetuka' },
];

export const CETASIKA_RELS: CetasikaRel[] = CITTAS.flatMap((c) =>
  RULES.flatMap((rule) =>
    rule.applies(c)
      ? rule.cetasikas.map((cetasika) => ({
          citta: c.id,
          cetasika,
          kind: rule.kind?.(c) ?? ('niyata' as const),
          status: 'rule' as const,
        }))
      : [],
  ),
);
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/data/relations/cetasikaRules.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/relations
git commit -m "feat(data): derive citta-cetasika combinations from sampayoga rules

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Kicca, puggala and bhūmi relations

**Files:**
- Create: `src/data/relations/kiccaRules.ts`, `src/data/relations/puggalaRules.ts`, `src/data/relations/bhumiRules.ts`
- Test: `src/data/relations/otherRules.test.ts`

**Interfaces:**
- Consumes: `range`, `CITTAS`, types.
- Produces: `KICCA_RELS: KiccaRel[]`, `PUGGALA_RELS: PuggalaRel[]`, `BHUMI_RELS: BhumiRel[]` (all `status: 'rule'`, sorted by citta).

Domain background: kicca assignments follow Saṅgaha ch. 3. Puggala and bhūmi columns on the chart count **vīthi cittas** (the 9 mahaggata vipāka only ever do paṭisandhi/bhavaṅga/cuti, so they are not counted) and exclude the 4 momentary magga cittas; the chart header numbers are the test targets.

- [ ] **Step 1: Write the failing tests**

Create `src/data/relations/otherRules.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { range } from '../range';
import { BHUMI_RELS } from './bhumiRules';
import { KICCA_RELS } from './kiccaRules';
import { PUGGALA_RELS } from './puggalaRules';

const count = <T extends { citta: number }>(rels: T[], pred: (r: T) => boolean) => rels.filter(pred).length;

describe('KICCA_RELS', () => {
  it('has the textbook number of cittas per kicca', () => {
    const k = (id: string) => count(KICCA_RELS, (r) => r.kicca === id);
    expect(k('patisandhi')).toBe(19);
    expect(k('bhavanga')).toBe(19);
    expect(k('cuti')).toBe(19);
    expect(k('avajjana')).toBe(2);
    for (const sense of ['dassana', 'savana', 'ghayana', 'sayana', 'phusana']) expect(k(sense)).toBe(2);
    expect(k('sampaticchana')).toBe(2);
    expect(k('santirana')).toBe(3);
    expect(k('votthapana')).toBe(1);
    expect(k('javana')).toBe(55);
    expect(k('tadarammana')).toBe(11);
  });

  it('gives every citta at least one kicca', () => {
    for (const id of range(1, 89)) expect(count(KICCA_RELS, (r) => r.citta === id), `citta ${id}`).toBeGreaterThan(0);
  });

  it('gives upekkhā santīraṇa (19) its five functions', () => {
    expect(KICCA_RELS.filter((r) => r.citta === 19).map((r) => r.kicca).sort()).toEqual(
      ['bhavanga', 'cuti', 'patisandhi', 'santirana', 'tadarammana'],
    );
  });
});

describe('PUGGALA_RELS', () => {
  it('matches the chart header counts', () => {
    const p = (id: string) => count(PUGGALA_RELS, (r) => r.puggala === id);
    expect(p('duggati-ahetuka')).toBe(37);
    expect(p('sugati-ahetuka')).toBe(41);
    expect(p('dvihetuka')).toBe(41);
    expect(p('tihetuka')).toBe(54);
    expect(p('sotapanna')).toBe(50);
    expect(p('sakadagami')).toBe(50);
    expect(p('anagami')).toBe(48);
    expect(p('arahant')).toBe(44);
  });

  it('removes diṭṭhi and vicikicchā cittas from the sotāpanna and dosa from the anāgāmī', () => {
    const has = (puggala: string, citta: number) => PUGGALA_RELS.some((r) => r.puggala === puggala && r.citta === citta);
    expect(has('sotapanna', 1)).toBe(false);
    expect(has('sotapanna', 11)).toBe(false);
    expect(has('sotapanna', 3)).toBe(true);
    expect(has('anagami', 9)).toBe(false);
    expect(has('arahant', 30)).toBe(true);
    expect(has('tihetuka', 30)).toBe(false);
  });

  it('does not assign the momentary magga cittas to any puggala', () => {
    expect(PUGGALA_RELS.filter((r) => r.citta >= 82 && r.citta <= 85)).toEqual([]);
  });
});

describe('BHUMI_RELS', () => {
  it('matches the chart header counts 80 / 64 / 42', () => {
    const b = (id: string) => count(BHUMI_RELS, (r) => r.bhumi === id);
    expect(b('kama')).toBe(80);
    expect(b('rupa')).toBe(64);
    expect(b('arupa')).toBe(42);
  });

  it('keeps dosa out of the brahma worlds and sense consciousness out of arūpa', () => {
    const has = (bhumi: string, citta: number) => BHUMI_RELS.some((r) => r.bhumi === bhumi && r.citta === citta);
    expect(has('rupa', 9)).toBe(false);
    expect(has('rupa', 13)).toBe(true); // cakkhu viññāṇa arises in rūpa world
    expect(has('arupa', 13)).toBe(false);
    expect(has('arupa', 29)).toBe(true); // manodvārāvajjana
    expect(has('arupa', 82)).toBe(false); // sotāpatti magga
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/data/relations/otherRules.test.ts`
Expected: FAIL — cannot resolve `./bhumiRules`.

- [ ] **Step 3: Implement kicca rules**

Create `src/data/relations/kiccaRules.ts`:

```ts
/** Citta ↔ kicca (function), Abhidhammattha Saṅgaha ch. 3. */
import { range } from '../range';
import type { KiccaId, KiccaRel } from '../types';

const PATISANDHI_CITTAS = [19, 27, ...range(39, 46), ...range(60, 64), ...range(74, 77)];

const KICCA_CITTAS: Record<KiccaId, number[]> = {
  patisandhi: PATISANDHI_CITTAS,
  bhavanga: PATISANDHI_CITTAS,
  cuti: PATISANDHI_CITTAS,
  avajjana: [28, 29],
  dassana: [13, 20],
  savana: [14, 21],
  ghayana: [15, 22],
  sayana: [16, 23],
  phusana: [17, 24],
  sampaticchana: [18, 25],
  santirana: [19, 26, 27],
  votthapana: [29],
  javana: [
    ...range(1, 12), // akusala
    30, // hasituppāda
    ...range(31, 38), // mahā kusala
    ...range(47, 54), // mahā kiriya
    ...range(55, 59), // rūpa kusala
    ...range(65, 69), // rūpa kiriya
    ...range(70, 73), // arūpa kusala
    ...range(78, 81), // arūpa kiriya
    ...range(82, 89), // magga + phala
  ],
  tadarammana: [19, 26, 27, ...range(39, 46)],
};

export const KICCA_RELS: KiccaRel[] = (Object.entries(KICCA_CITTAS) as [KiccaId, number[]][])
  .flatMap(([kicca, cittas]) => cittas.map((citta) => ({ citta, kicca, status: 'rule' as const })))
  .sort((a, b) => a.citta - b.citta);
```

- [ ] **Step 4: Implement puggala rules**

Create `src/data/relations/puggalaRules.ts`:

```ts
/**
 * Vīthi cittas available to each puggala (chart column "පුද්ගලයන්ට ලැබෙන සිත්").
 * The four magga cittas are momentary and, as on the chart, are not counted.
 */
import { range } from '../range';
import type { PuggalaId, PuggalaRel } from '../types';

const AKUSALA = range(1, 12);
const AHETUKA_NO_HASITUPPADA = range(13, 29);
const MAHA_KUSALA = range(31, 38);
const MAHA_VIPAKA_NANA_VIPPAYUTTA = [41, 42, 45, 46];
const MAHA_VIPAKA = range(39, 46);
const MAHAGGATA_KUSALA = [...range(55, 59), ...range(70, 73)];
const without = (xs: number[], remove: number[]) => xs.filter((x) => !remove.includes(x));

const DUGGATI = [...AKUSALA, ...AHETUKA_NO_HASITUPPADA, ...MAHA_KUSALA];
const SUGATI = [...DUGGATI, ...MAHA_VIPAKA_NANA_VIPPAYUTTA];
const TIHETUKA = [...AKUSALA, ...AHETUKA_NO_HASITUPPADA, ...MAHA_KUSALA, ...MAHA_VIPAKA, ...MAHAGGATA_KUSALA];
const SEKHA_BASE = without(TIHETUKA, [1, 2, 5, 6, 11]); // diṭṭhi + vicikicchā removed

const PUGGALA_CITTAS: Record<PuggalaId, number[]> = {
  'duggati-ahetuka': DUGGATI,
  'sugati-ahetuka': SUGATI,
  dvihetuka: SUGATI,
  tihetuka: TIHETUKA,
  sotapanna: [...SEKHA_BASE, 86],
  sakadagami: [...SEKHA_BASE, 87],
  anagami: [...without(SEKHA_BASE, [9, 10]), 88],
  arahant: [...range(13, 30), ...MAHA_VIPAKA, ...range(47, 54), ...range(65, 69), ...range(78, 81), 89],
};

export const PUGGALA_RELS: PuggalaRel[] = (Object.entries(PUGGALA_CITTAS) as [PuggalaId, number[]][])
  .flatMap(([puggala, cittas]) => cittas.map((citta) => ({ citta, puggala, status: 'rule' as const })))
  .sort((a, b) => a.citta - b.citta);
```

- [ ] **Step 5: Implement bhūmi rules**

Create `src/data/relations/bhumiRules.ts`:

```ts
/**
 * Vīthi cittas arising in each plane (chart column "භූමි වලට ලැබෙන සිත්": 80 / 64 / 42).
 */
import { range } from '../range';
import type { BhumiId, BhumiRel } from '../types';

const ALL = range(1, 89);
const without = (remove: number[]) => ALL.filter((x) => !remove.includes(x));

const MAHAGGATA_VIPAKA = [...range(60, 64), ...range(74, 77)];
const DOSA = [9, 10];
const NOSE_TONGUE_BODY = [15, 16, 17, 22, 23, 24];
const MAHA_VIPAKA = range(39, 46);

const BHUMI_CITTAS: Record<BhumiId, number[]> = {
  kama: without(MAHAGGATA_VIPAKA),
  rupa: without([...DOSA, ...NOSE_TONGUE_BODY, ...MAHA_VIPAKA, ...MAHAGGATA_VIPAKA]),
  arupa: without([
    ...range(55, 69), // all rūpāvacara
    ...DOSA,
    ...range(13, 28), // ahetuka except manodvārāvajjana (29)…
    30, // …and hasituppāda
    ...MAHA_VIPAKA,
    ...range(74, 77), // arūpa vipāka (vīthimutta)
    82, // sotāpatti magga
  ]),
};

export const BHUMI_RELS: BhumiRel[] = (Object.entries(BHUMI_CITTAS) as [BhumiId, number[]][])
  .flatMap(([bhumi, cittas]) => cittas.map((citta) => ({ citta, bhumi, status: 'rule' as const })))
  .sort((a, b) => a.citta - b.citta);
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run src/data/relations/otherRules.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 7: Commit**

```bash
git add src/data/relations
git commit -m "feat(data): derive kicca, puggala and bhumi relations

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Ekacittakkhaṇika paṭiccasamuppāda relations

**Files:**
- Create: `src/data/relations/psRules.ts`
- Test: `src/data/relations/psRules.test.ts`

**Interfaces:**
- Consumes: `CITTAS`, `psLinkById`, `STANDARD_CHAIN`, `DVIPANCA` logic (re-declared locally), types.
- Produces: `PS_RELS: PsRel[]` (sorted by citta, then slot).

Domain background: Vibhaṅga, Paṭiccasamuppādavibhaṅga, Abhidhammabhājanīya — the chain inside one citta-moment varies by citta type (taṇhā for lobha, paṭigha for dosa, vicikicchā/uddhacca for moha, pasāda for kusala, adhimokkha for vipāka/kiriya). Where the chart marks **avijjā** for kusala cittas it is recorded as `status: 'chart'`; where the chart shows "?????" (magga) it is `status: 'disputed'`. The user reviews all of these in Task 15.

- [ ] **Step 1: Write the failing tests**

Create `src/data/relations/psRules.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { STANDARD_CHAIN, psLinkById } from '../entities/psLinks';
import { range } from '../range';
import { PS_RELS } from './psRules';

const linksOf = (citta: number) => PS_RELS.filter((r) => r.citta === citta).map((r) => r.psLink);

describe('PS_RELS', () => {
  it('gives a lobha diṭṭhi citta the standard 11-link chain', () => {
    expect(linksOf(1)).toEqual(STANDARD_CHAIN);
  });

  it('varies the vedanā link by citta type', () => {
    expect(linksOf(3)).toContain('tanha-adhimokkha');
    expect(linksOf(9)).toEqual(expect.arrayContaining(['vedana-patigha', 'patigha-adhimokkha', 'adhimokkha-bhava']));
    expect(linksOf(11)).toEqual(expect.arrayContaining(['vedana-vicikiccha', 'vicikiccha-bhava']));
    expect(linksOf(12)).toEqual(expect.arrayContaining(['vedana-uddhacca', 'uddhacca-adhimokkha']));
    expect(linksOf(31)).toEqual(expect.arrayContaining(['vedana-pasada', 'pasada-adhimokkha']));
    expect(linksOf(13)).toEqual(expect.arrayContaining(['akusalamula-sankhara', 'vedana-bhava']));
    expect(linksOf(39)).toEqual(expect.arrayContaining(['kusalamula-sankhara', 'vedana-adhimokkha']));
  });

  it('gives kiriya cittas no root link', () => {
    for (const id of [28, 29, 30, 47, 65, 78]) {
      expect(linksOf(id).filter((l) => psLinkById.get(l)!.slot === 1), `citta ${id}`).toEqual([]);
    }
  });

  it('every citta has phassa → vedanā and bhava → jāti → jarāmaraṇa', () => {
    for (const id of range(1, 89)) {
      expect(linksOf(id), `citta ${id}`).toEqual(
        expect.arrayContaining(['phassa-vedana', 'bhava-jati', 'jati-jaramarana']),
      );
    }
  });

  it('has at most one link per slot, except slot 1 for kusala (avijjā + kusalamūla)', () => {
    for (const id of range(1, 89)) {
      const slots = linksOf(id).map((l) => psLinkById.get(l)!.slot).filter((s) => s !== 1);
      expect(new Set(slots).size, `citta ${id}`).toBe(slots.length);
    }
  });

  it('tags chart-only and disputed links for review', () => {
    const rel = (citta: number, link: string) => PS_RELS.find((r) => r.citta === citta && r.psLink === link);
    expect(rel(31, 'avijja-sankhara')?.status).toBe('chart');
    expect(rel(82, 'avijja-sankhara')?.status).toBe('disputed');
    expect(rel(1, 'avijja-sankhara')?.status).toBe('rule');
    expect(rel(82, 'avijja-sankhara')?.note).toBeTruthy();
  });

  it('is sorted by citta then slot', () => {
    const order = PS_RELS.map((r) => r.citta * 100 + psLinkById.get(r.psLink)!.slot);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/data/relations/psRules.test.ts`
Expected: FAIL — cannot resolve `./psRules`.

- [ ] **Step 3: Implement the PS rules**

Create `src/data/relations/psRules.ts`:

```ts
/**
 * Ekacittakkhaṇika paṭiccasamuppāda per citta.
 * Source: Vibhaṅga, Paṭiccasamuppādavibhaṅga, Abhidhammabhājanīya; cross-checked
 * against the chart. Non-rule rows must be reviewed by the user (Task 15).
 */
import { CITTAS } from '../entities/cittas';
import { psLinkById } from '../entities/psLinks';
import { range } from '../range';
import type { Citta, PsLinkId, PsRel, Status } from '../types';

const DVIPANCA = new Set([...range(13, 17), ...range(20, 24)]);
const MIDDLE: PsLinkId[] = [
  'sankhara-vinnana',
  'vinnana-nama',
  'nama-chatthayatana',
  'chatthayatana-phassa',
  'phassa-vedana',
];
const END: PsLinkId[] = ['bhava-jati', 'jati-jaramarana'];

type Draft = { psLink: PsLinkId; status: Status; note?: string };
const rule = (...ids: PsLinkId[]): Draft[] => ids.map((psLink) => ({ psLink, status: 'rule' }));

function rootLinks(c: Citta): Draft[] {
  if (c.jati === 'akusala') return rule('avijja-sankhara');
  if (c.jati === 'kiriya') return [];
  if (c.group === 'akusala-vipaka') return rule('akusalamula-sankhara');
  if (c.jati === 'vipaka') return rule('kusalamula-sankhara');
  // kusala
  if (c.group === 'magga') {
    return [
      { psLink: 'avijja-sankhara', status: 'disputed', note: 'චාර්ටයේ "?????" ලෙස සලකුණු කර ඇත' },
      ...rule('kusalamula-sankhara'),
    ];
  }
  return [
    { psLink: 'avijja-sankhara', status: 'chart', note: 'චාර්ටයේ කුසල සිත් සඳහා "අවි.සං." සලකුණු කර ඇත' },
    ...rule('kusalamula-sankhara'),
  ];
}

function vedanaOnward(c: Citta): Draft[] {
  switch (c.sampayutta) {
    case 'ditthi':
      return rule('vedana-tanha', 'tanha-upadana', 'upadana-bhava');
    case 'ditthi-vippayutta':
      return rule('vedana-tanha', 'tanha-adhimokkha', 'adhimokkha-bhava');
    case 'patigha':
      return rule('vedana-patigha', 'patigha-adhimokkha', 'adhimokkha-bhava');
    case 'vicikiccha':
      return rule('vedana-vicikiccha', 'vicikiccha-bhava');
    case 'uddhacca':
      return rule('vedana-uddhacca', 'uddhacca-adhimokkha', 'adhimokkha-bhava');
    default:
      if (c.jati === 'kusala') return rule('vedana-pasada', 'pasada-adhimokkha', 'adhimokkha-bhava');
      return DVIPANCA.has(c.id) ? rule('vedana-bhava') : rule('vedana-adhimokkha', 'adhimokkha-bhava');
  }
}

const slotOf = (id: PsLinkId) => psLinkById.get(id)!.slot;

export const PS_RELS: PsRel[] = CITTAS.flatMap((c) =>
  [...rootLinks(c), ...rule(...MIDDLE), ...vedanaOnward(c), ...rule(...END)]
    .sort((a, b) => slotOf(a.psLink) - slotOf(b.psLink))
    .map((d) => ({ citta: c.id, ...d })),
);
```

Note: `Array.prototype.sort` is stable, so in slot 1 the `avijja` row stays before `kusalamula`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/data/relations/psRules.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/relations
git commit -m "feat(data): derive single-moment paticcasamuppada links per citta

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Data index — profiles, reverse lookups, matching, labels, search, id parsing

**Files:**
- Create: `src/data/index.ts`
- Test: `src/data/index.test.ts`

**Interfaces:**
- Consumes: all entities (Task 2) and relations (Tasks 3–5).
- Produces (all exported from `@/data`):
  - re-exports every type and entity constant/map from Tasks 2–5 (`CITTAS`, `cittaById`, `GROUPS`, `groupById`, `SPHERES`, `SPHERE_LABELS`, `CATEGORY_LABELS`, `CETASIKAS`, `cetasikaById`, `BAND_LABELS`, `SUBGROUP_LABELS`, `KICCAS`, `kiccaById`, `PS_LINKS`, `psLinkById`, `psLabel`, `STANDARD_CHAIN`, `PUGGALAS`, `puggalaById`, `BHUMIS`, `bhumiById`, `CETASIKA_RELS`, `KICCA_RELS`, `PS_RELS`, `PUGGALA_RELS`, `BHUMI_RELS`)
  - `type FilterKind = 'cetasika' | 'kicca' | 'psLink' | 'puggala' | 'bhumi'`
  - `type EntityKind = 'citta' | FilterKind`
  - `type EntityId = number | string`
  - `FILTER_KINDS: FilterKind[]`
  - `interface Selection { citta: number[]; cetasika: number[]; kicca: KiccaId[]; psLink: PsLinkId[]; puggala: PuggalaId[]; bhumi: BhumiId[] }`
  - `emptySelection(): Selection`
  - `interface CittaProfile { cetasikas: CetasikaRel[]; kiccas: KiccaRel[]; psLinks: PsRel[]; puggalas: PuggalaRel[]; bhumis: BhumiRel[] }`
  - `profileOf(cittaId: number): CittaProfile` (throws on unknown id)
  - `cittasFor(kind: FilterKind, id: EntityId): Set<number>`
  - `hasFilters(sel: Selection): boolean`, `hasAnySelection(sel: Selection): boolean`
  - `cittasMatching(sel: Selection): Set<number> | null` (null = no filters; otherwise AND of all filters)
  - `activeFilters(sel: Selection): { kind: FilterKind; id: EntityId }[]` (in FILTER_KINDS order)
  - `labelOf(kind: EntityKind, id: EntityId): string`
  - `KIND_LABELS: Record<EntityKind, string>`
  - `parseEntityId(kind: EntityKind, token: string): EntityId | null`
  - `searchEntities(query: string, limit?: number): { kind: EntityKind; id: EntityId; label: string }[]`

- [ ] **Step 1: Write the failing tests**

Create `src/data/index.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  activeFilters,
  cittasFor,
  cittasMatching,
  emptySelection,
  hasAnySelection,
  labelOf,
  parseEntityId,
  profileOf,
  searchEntities,
} from '@/data';

const sel = (patch: Partial<ReturnType<typeof emptySelection>>) => ({ ...emptySelection(), ...patch });

describe('profileOf', () => {
  it('returns every relation block for a citta', () => {
    const p = profileOf(1);
    expect(p.cetasikas).toHaveLength(19);
    expect(p.kiccas.map((k) => k.kicca)).toEqual(['javana']);
    expect(p.psLinks).toHaveLength(11);
    expect(p.puggalas.map((x) => x.puggala)).toEqual(['duggati-ahetuka', 'sugati-ahetuka', 'dvihetuka', 'tihetuka']);
    expect(p.bhumis.map((x) => x.bhumi)).toEqual(['kama', 'rupa', 'arupa']);
  });

  it('throws on an unknown citta', () => {
    expect(() => profileOf(999)).toThrow();
  });
});

describe('cittasFor / cittasMatching', () => {
  it('finds the 35 cittas with pīti', () => {
    expect(cittasFor('cetasika', 12).size).toBe(35);
  });

  it('returns null when nothing is filtered', () => {
    expect(cittasMatching(emptySelection())).toBeNull();
    expect(cittasMatching(sel({ citta: [1] }))).toBeNull();
  });

  it('intersects filters (pīti AND sotāpanna = 15)', () => {
    expect(cittasMatching(sel({ cetasika: [12], puggala: ['sotapanna'] }))!.size).toBe(15);
  });

  it('intersects kicca and puggala (javana AND arahant = 19)', () => {
    expect(cittasMatching(sel({ kicca: ['javana'], puggala: ['arahant'] }))!.size).toBe(19);
  });

  it('returns an empty set for an impossible combination (dosa AND pīti)', () => {
    expect(cittasMatching(sel({ cetasika: [21, 12] }))!.size).toBe(0);
  });

  it('accepts string ids for numeric kinds', () => {
    expect(cittasFor('cetasika', '12').size).toBe(35);
  });
});

describe('selection helpers', () => {
  it('lists active filters in kind order', () => {
    expect(activeFilters(sel({ puggala: ['arahant'], cetasika: [12] }))).toEqual([
      { kind: 'cetasika', id: 12 },
      { kind: 'puggala', id: 'arahant' },
    ]);
  });

  it('detects any selection', () => {
    expect(hasAnySelection(emptySelection())).toBe(false);
    expect(hasAnySelection(sel({ citta: [3] }))).toBe(true);
  });
});

describe('labels and parsing', () => {
  it('labels every kind in Sinhala', () => {
    expect(labelOf('citta', 1)).toBe('1. ලෝභ 1');
    expect(labelOf('cetasika', 12)).toBe('පීති');
    expect(labelOf('kicca', 'javana')).toBe('ජවන');
    expect(labelOf('psLink', 'vedana-tanha')).toBe('වේදනා පච්චයා තණ්හා');
    expect(labelOf('puggala', 'sotapanna')).toBe('සෝතාපන්න');
    expect(labelOf('bhumi', 'kama')).toBe('කාම භූමි');
  });

  it('parses valid ids and rejects everything else', () => {
    expect(parseEntityId('citta', '89')).toBe(89);
    expect(parseEntityId('citta', '0')).toBeNull();
    expect(parseEntityId('citta', '')).toBeNull();
    expect(parseEntityId('citta', '1.5')).toBeNull();
    expect(parseEntityId('cetasika', '52')).toBe(52);
    expect(parseEntityId('cetasika', '53')).toBeNull();
    expect(parseEntityId('kicca', 'javana')).toBe('javana');
    expect(parseEntityId('kicca', 'JAVANA')).toBeNull();
    expect(parseEntityId('psLink', 'vedana-tanha')).toBe('vedana-tanha');
    expect(parseEntityId('puggala', 'arahant')).toBe('arahant');
    expect(parseEntityId('bhumi', 'moon')).toBeNull();
  });
});

describe('searchEntities', () => {
  it('finds a cetasika by Sinhala name', () => {
    expect(searchEntities('පීති')[0]).toEqual({ kind: 'cetasika', id: 12, label: 'පීති' });
  });

  it('finds a citta by exact number', () => {
    expect(searchEntities('31')).toEqual([{ kind: 'citta', id: 31, label: labelOf('citta', 31) }]);
  });

  it('returns nothing for blank input and respects the limit', () => {
    expect(searchEntities('   ')).toEqual([]);
    expect(searchEntities('සිත', 5)).toHaveLength(5);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/data/index.test.ts`
Expected: FAIL — `@/data` has no exports (`src/data/index.ts` missing).

- [ ] **Step 3: Implement the index**

Create `src/data/index.ts`:

```ts
import { BHUMIS, bhumiById } from './entities/bhumis';
import { BAND_LABELS, CETASIKAS, SUBGROUP_LABELS, cetasikaById } from './entities/cetasikas';
import { CITTAS, cittaById } from './entities/cittas';
import { CATEGORY_LABELS, GROUPS, SPHERES, SPHERE_LABELS, groupById } from './entities/groups';
import { KICCAS, kiccaById } from './entities/kiccas';
import { PS_LINKS, STANDARD_CHAIN, psLabel, psLinkById } from './entities/psLinks';
import { PUGGALAS, puggalaById } from './entities/puggalas';
import { BHUMI_RELS } from './relations/bhumiRules';
import { CETASIKA_RELS } from './relations/cetasikaRules';
import { KICCA_RELS } from './relations/kiccaRules';
import { PS_RELS } from './relations/psRules';
import { PUGGALA_RELS } from './relations/puggalaRules';
import type {
  BhumiId,
  BhumiRel,
  CetasikaRel,
  KiccaId,
  KiccaRel,
  PsLinkId,
  PsRel,
  PuggalaId,
  PuggalaRel,
} from './types';

export * from './types';
export {
  BAND_LABELS,
  BHUMIS,
  BHUMI_RELS,
  CATEGORY_LABELS,
  CETASIKAS,
  CETASIKA_RELS,
  CITTAS,
  GROUPS,
  KICCAS,
  KICCA_RELS,
  PS_LINKS,
  PS_RELS,
  PUGGALAS,
  PUGGALA_RELS,
  SPHERES,
  SPHERE_LABELS,
  STANDARD_CHAIN,
  SUBGROUP_LABELS,
  bhumiById,
  cetasikaById,
  cittaById,
  groupById,
  kiccaById,
  psLabel,
  psLinkById,
  puggalaById,
};

export type FilterKind = 'cetasika' | 'kicca' | 'psLink' | 'puggala' | 'bhumi';
export type EntityKind = 'citta' | FilterKind;
export type EntityId = number | string;

export const FILTER_KINDS: FilterKind[] = ['cetasika', 'kicca', 'psLink', 'puggala', 'bhumi'];

export interface Selection {
  citta: number[];
  cetasika: number[];
  kicca: KiccaId[];
  psLink: PsLinkId[];
  puggala: PuggalaId[];
  bhumi: BhumiId[];
}

export const emptySelection = (): Selection => ({
  citta: [],
  cetasika: [],
  kicca: [],
  psLink: [],
  puggala: [],
  bhumi: [],
});

export interface CittaProfile {
  cetasikas: CetasikaRel[];
  kiccas: KiccaRel[];
  psLinks: PsRel[];
  puggalas: PuggalaRel[];
  bhumis: BhumiRel[];
}

const profiles = new Map<number, CittaProfile>(
  CITTAS.map((c) => [c.id, { cetasikas: [], kiccas: [], psLinks: [], puggalas: [], bhumis: [] }]),
);
const reverse: Record<FilterKind, Map<string, Set<number>>> = {
  cetasika: new Map(),
  kicca: new Map(),
  psLink: new Map(),
  puggala: new Map(),
  bhumi: new Map(),
};
const addReverse = (kind: FilterKind, id: EntityId, citta: number) => {
  const key = String(id);
  let set = reverse[kind].get(key);
  if (!set) reverse[kind].set(key, (set = new Set()));
  set.add(citta);
};

for (const r of CETASIKA_RELS) {
  profiles.get(r.citta)!.cetasikas.push(r);
  addReverse('cetasika', r.cetasika, r.citta);
}
for (const r of KICCA_RELS) {
  profiles.get(r.citta)!.kiccas.push(r);
  addReverse('kicca', r.kicca, r.citta);
}
for (const r of PS_RELS) {
  profiles.get(r.citta)!.psLinks.push(r);
  addReverse('psLink', r.psLink, r.citta);
}
for (const r of PUGGALA_RELS) {
  profiles.get(r.citta)!.puggalas.push(r);
  addReverse('puggala', r.puggala, r.citta);
}
for (const r of BHUMI_RELS) {
  profiles.get(r.citta)!.bhumis.push(r);
  addReverse('bhumi', r.bhumi, r.citta);
}

export function profileOf(cittaId: number): CittaProfile {
  const p = profiles.get(cittaId);
  if (!p) throw new Error(`Unknown citta ${cittaId}`);
  return p;
}

export function cittasFor(kind: FilterKind, id: EntityId): Set<number> {
  return reverse[kind].get(String(id)) ?? new Set();
}

export function activeFilters(sel: Selection): { kind: FilterKind; id: EntityId }[] {
  return FILTER_KINDS.flatMap((kind) => (sel[kind] as EntityId[]).map((id) => ({ kind, id })));
}

export const hasFilters = (sel: Selection): boolean => FILTER_KINDS.some((k) => sel[k].length > 0);
export const hasAnySelection = (sel: Selection): boolean => sel.citta.length > 0 || hasFilters(sel);

export function cittasMatching(sel: Selection): Set<number> | null {
  const filters = activeFilters(sel);
  if (filters.length === 0) return null;
  let result: Set<number> | null = null;
  for (const { kind, id } of filters) {
    const set = cittasFor(kind, id);
    result = result === null ? new Set(set) : new Set([...result].filter((c) => set.has(c)));
  }
  return result!;
}

export const KIND_LABELS: Record<EntityKind, string> = {
  citta: 'සිත',
  cetasika: 'චෛතසික',
  kicca: 'කෘත්‍ය',
  psLink: 'පටිච්චසමුප්පාද',
  puggala: 'පුද්ගල',
  bhumi: 'භූමි',
};

export function labelOf(kind: EntityKind, id: EntityId): string {
  switch (kind) {
    case 'citta': {
      const c = cittaById.get(Number(id));
      return c ? `${c.id}. ${c.short}` : String(id);
    }
    case 'cetasika':
      return cetasikaById.get(Number(id))?.nameSi ?? String(id);
    case 'kicca':
      return kiccaById.get(id as KiccaId)?.nameSi ?? String(id);
    case 'psLink': {
      const l = psLinkById.get(id as PsLinkId);
      return l ? psLabel(l) : String(id);
    }
    case 'puggala':
      return puggalaById.get(id as PuggalaId)?.nameSi ?? String(id);
    case 'bhumi':
      return bhumiById.get(id as BhumiId)?.nameSi ?? String(id);
  }
}

export function parseEntityId(kind: EntityKind, token: string): EntityId | null {
  const asInt = (m: Map<number, unknown>) => {
    if (!/^\d+$/.test(token)) return null;
    const n = Number(token);
    return m.has(n) ? n : null;
  };
  switch (kind) {
    case 'citta':
      return asInt(cittaById);
    case 'cetasika':
      return asInt(cetasikaById);
    case 'kicca':
      return kiccaById.has(token as KiccaId) ? token : null;
    case 'psLink':
      return psLinkById.has(token as PsLinkId) ? token : null;
    case 'puggala':
      return puggalaById.has(token as PuggalaId) ? token : null;
    case 'bhumi':
      return bhumiById.has(token as BhumiId) ? token : null;
  }
}

export interface SearchResult {
  kind: EntityKind;
  id: EntityId;
  label: string;
}

export function searchEntities(query: string, limit = 10): SearchResult[] {
  const q = query.normalize('NFC').trim();
  if (!q) return [];
  if (/^\d+$/.test(q)) {
    const c = cittaById.get(Number(q));
    return c ? [{ kind: 'citta', id: c.id, label: labelOf('citta', c.id) }] : [];
  }
  const out: SearchResult[] = [];
  const consider = (kind: EntityKind, id: EntityId, label: string, haystack: string[]) => {
    if (out.length < limit && haystack.some((h) => h.includes(q))) out.push({ kind, id, label });
  };
  for (const c of CETASIKAS) consider('cetasika', c.id, c.nameSi, [c.nameSi]);
  for (const k of KICCAS) consider('kicca', k.id, k.nameSi, [k.nameSi]);
  for (const l of PS_LINKS) consider('psLink', l.id, psLabel(l), [psLabel(l)]);
  for (const p of PUGGALAS) consider('puggala', p.id, p.nameSi, [p.nameSi]);
  for (const b of BHUMIS) consider('bhumi', b.id, b.nameSi, [b.nameSi]);
  for (const c of CITTAS) consider('citta', c.id, labelOf('citta', c.id), [c.nameSi, c.short]);
  return out;
}
```

- [ ] **Step 4: Run all data tests**

Run: `npx vitest run src/data`
Expected: PASS (entities, cetasika, other, ps, index suites).

- [ ] **Step 5: Commit**

```bash
git add src/data/index.ts src/data/index.test.ts
git commit -m "feat(data): add profile, reverse-index, matching, label and search helpers

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Selection store and URL sync

**Files:**
- Create: `src/state/selection.ts`, `src/state/url.ts`, `src/state/useUrlSync.ts`
- Modify: `src/test/setup.ts` (reset the store after each test)
- Test: `src/state/selection.test.ts`, `src/state/url.test.ts`

**Interfaces:**
- Consumes: `Selection`, `EntityKind`, `EntityId`, `emptySelection`, `parseEntityId` from `@/data`.
- Produces:
  - `applySelect(sel: Selection, kind: EntityKind, id: EntityId, additive: boolean): Selection`
  - `useSelection` Zustand hook with state `{ selection: Selection; notice: string | null; select(kind, id, additive?): void; set(sel: Selection): void; clear(): void; dismissNotice(): void }`
  - `INVALID_LINK_NOTICE: string`
  - `serializeSelection(sel: Selection): string` → `''` or `'?c=1&ce=12,14'`
  - `parseSelection(search: string): { selection: Selection; invalid: boolean }`
  - `useUrlSync(): void` (reads URL on mount, writes URL on change)

Selection semantics: a plain click replaces the whole selection with just that item; clicking the item that is already the *only* selection clears it; an additive click (shift-click or long-press) toggles the item within its own kind and keeps everything else.

URL keys: `c` citta, `ce` cetasika, `k` kicca, `ps` psLink, `p` puggala, `b` bhūmi; values comma-separated.

- [ ] **Step 1: Write the failing tests**

Create `src/state/selection.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { emptySelection } from '@/data';
import { applySelect, useSelection } from './selection';

describe('applySelect', () => {
  it('replaces the selection on a plain click', () => {
    const start = { ...emptySelection(), cetasika: [12], puggala: ['arahant' as const] };
    expect(applySelect(start, 'citta', 3, false)).toEqual({ ...emptySelection(), citta: [3] });
  });

  it('clears when clicking the only selected item again', () => {
    const start = { ...emptySelection(), citta: [3] };
    expect(applySelect(start, 'citta', 3, false)).toEqual(emptySelection());
  });

  it('does not clear when other items are also selected', () => {
    const start = { ...emptySelection(), citta: [3], cetasika: [12] };
    expect(applySelect(start, 'citta', 3, false)).toEqual({ ...emptySelection(), citta: [3] });
  });

  it('toggles within a kind on an additive click and keeps other kinds', () => {
    const start = { ...emptySelection(), cetasika: [12] };
    const added = applySelect(start, 'puggala', 'sotapanna', true);
    expect(added).toEqual({ ...emptySelection(), cetasika: [12], puggala: ['sotapanna'] });
    expect(applySelect(added, 'cetasika', 12, true)).toEqual({ ...emptySelection(), puggala: ['sotapanna'] });
  });
});

describe('useSelection store', () => {
  it('selects, clears and dismisses the notice', () => {
    useSelection.getState().select('cetasika', 12);
    expect(useSelection.getState().selection.cetasika).toEqual([12]);
    useSelection.getState().clear();
    expect(useSelection.getState().selection).toEqual(emptySelection());
    useSelection.setState({ notice: 'x' });
    useSelection.getState().dismissNotice();
    expect(useSelection.getState().notice).toBeNull();
  });
});
```

Create `src/state/url.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { emptySelection } from '@/data';
import { parseSelection, serializeSelection } from './url';

describe('serializeSelection', () => {
  it('returns an empty string for an empty selection', () => {
    expect(serializeSelection(emptySelection())).toBe('');
  });

  it('writes compact keys in a fixed order', () => {
    const sel = { ...emptySelection(), citta: [1], cetasika: [12, 14], kicca: ['javana' as const], bhumi: ['kama' as const] };
    expect(serializeSelection(sel)).toBe('?c=1&ce=12,14&k=javana&b=kama');
  });
});

describe('parseSelection', () => {
  it('round-trips', () => {
    const sel = {
      ...emptySelection(),
      citta: [1, 31],
      cetasika: [12],
      psLink: ['vedana-tanha' as const],
      puggala: ['sotapanna' as const],
    };
    expect(parseSelection(serializeSelection(sel))).toEqual({ selection: sel, invalid: false });
  });

  it('ignores unknown keys without flagging', () => {
    expect(parseSelection('?c=1&utm=x')).toEqual({ selection: { ...emptySelection(), citta: [1] }, invalid: false });
  });

  it('drops invalid ids and flags the link (Review Focus #2)', () => {
    expect(parseSelection('?c=999')).toEqual({ selection: emptySelection(), invalid: true });
    expect(parseSelection('?c=0')).toEqual({ selection: emptySelection(), invalid: true });
    expect(parseSelection('?c=')).toEqual({ selection: emptySelection(), invalid: true });
    expect(parseSelection('?k=JAVANA')).toEqual({ selection: emptySelection(), invalid: true });
    expect(parseSelection('?c=1,abc&ce=12')).toEqual({
      selection: { ...emptySelection(), citta: [1], cetasika: [12] },
      invalid: true,
    });
  });

  it('dedupes repeated ids silently', () => {
    expect(parseSelection('?ce=1,1,1')).toEqual({ selection: { ...emptySelection(), cetasika: [1] }, invalid: false });
  });

  it('handles an empty search string', () => {
    expect(parseSelection('')).toEqual({ selection: emptySelection(), invalid: false });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/state`
Expected: FAIL — cannot resolve `./selection` and `./url`.

- [ ] **Step 3: Implement the store**

Create `src/state/selection.ts`:

```ts
import { create } from 'zustand';
import { emptySelection, type EntityId, type EntityKind, type Selection } from '@/data';

export const INVALID_LINK_NOTICE = 'සබැඳියේ හඳුනා නොගත් කොටස් ඉවත් කරන ලදී.';

const KINDS: EntityKind[] = ['citta', 'cetasika', 'kicca', 'psLink', 'puggala', 'bhumi'];

export function applySelect(sel: Selection, kind: EntityKind, id: EntityId, additive: boolean): Selection {
  const list = sel[kind] as EntityId[];
  if (additive) {
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    return { ...sel, [kind]: next } as Selection;
  }
  const onlyThis = list.length === 1 && list[0] === id && KINDS.every((k) => k === kind || sel[k].length === 0);
  if (onlyThis) return emptySelection();
  return { ...emptySelection(), [kind]: [id] } as Selection;
}

interface SelectionStore {
  selection: Selection;
  notice: string | null;
  select: (kind: EntityKind, id: EntityId, additive?: boolean) => void;
  set: (selection: Selection) => void;
  clear: () => void;
  dismissNotice: () => void;
}

export const useSelection = create<SelectionStore>((set) => ({
  selection: emptySelection(),
  notice: null,
  select: (kind, id, additive = false) => set((s) => ({ selection: applySelect(s.selection, kind, id, additive) })),
  set: (selection) => set({ selection }),
  clear: () => set({ selection: emptySelection() }),
  dismissNotice: () => set({ notice: null }),
}));
```

- [ ] **Step 4: Implement URL parse/serialize**

Create `src/state/url.ts`:

```ts
import { emptySelection, parseEntityId, type EntityId, type EntityKind, type Selection } from '@/data';

const KEYS: [EntityKind, string][] = [
  ['citta', 'c'],
  ['cetasika', 'ce'],
  ['kicca', 'k'],
  ['psLink', 'ps'],
  ['puggala', 'p'],
  ['bhumi', 'b'],
];

export function serializeSelection(sel: Selection): string {
  const parts = KEYS.filter(([kind]) => sel[kind].length > 0).map(
    ([kind, key]) => `${key}=${(sel[kind] as EntityId[]).map((v) => encodeURIComponent(String(v))).join(',')}`,
  );
  return parts.length ? `?${parts.join('&')}` : '';
}

export function parseSelection(search: string): { selection: Selection; invalid: boolean } {
  const params = new URLSearchParams(search);
  const selection = emptySelection();
  let invalid = false;
  for (const [kind, key] of KEYS) {
    const raw = params.get(key);
    if (raw === null) continue;
    const tokens = raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (tokens.length === 0) {
      invalid = true;
      continue;
    }
    const seen = new Set<string>();
    for (const token of tokens) {
      const id = parseEntityId(kind, token);
      if (id === null) {
        invalid = true;
        continue;
      }
      if (seen.has(String(id))) continue;
      seen.add(String(id));
      (selection[kind] as EntityId[]).push(id);
    }
  }
  return { selection, invalid };
}
```

- [ ] **Step 5: Implement the sync hook**

Create `src/state/useUrlSync.ts`:

```ts
'use client';

import { useEffect, useRef } from 'react';
import { INVALID_LINK_NOTICE, useSelection } from './selection';
import { parseSelection, serializeSelection } from './url';

/** Reads the selection from the URL once, then mirrors every change back with replaceState. */
export function useUrlSync(): void {
  const selection = useSelection((s) => s.selection);
  const hydrated = useRef(false);

  // Write effect is declared first so that, on mount, it runs before hydration and is skipped.
  useEffect(() => {
    if (!hydrated.current) return;
    const url = window.location.pathname + serializeSelection(selection);
    if (url !== window.location.pathname + window.location.search) {
      window.history.replaceState(window.history.state, '', url);
    }
  }, [selection]);

  useEffect(() => {
    const { selection: parsed, invalid } = parseSelection(window.location.search);
    useSelection.setState({ selection: parsed, notice: invalid ? INVALID_LINK_NOTICE : null });
    hydrated.current = true;
  }, []);
}
```

- [ ] **Step 6: Reset the store between tests**

In `src/test/setup.ts`, add these imports at the top:

```ts
import { emptySelection } from '@/data';
import { useSelection } from '@/state/selection';
```

and change the `afterEach` block to:

```ts
afterEach(() => {
  cleanup();
  useSelection.setState({ selection: emptySelection(), notice: null });
});
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run src/state src/data`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/state src/test/setup.ts
git commit -m "feat(state): add shared selection store with URL parse/serialize and sync

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---
### Task 8: App shell — top bar, bottom nav, search, legend, theme & presenter toggles, notice

**Files:**
- Create: `src/state/ui.ts`, `src/components/colors.ts`, `src/components/hooks.ts`, `src/components/useLongPress.ts`
- Create: `src/components/shell/nav.ts`, `AppShell.tsx`, `TopBar.tsx`, `BottomNav.tsx`, `SearchBox.tsx`, `Legend.tsx`, `Toggles.tsx`, `Notice.tsx`
- Modify: `src/app/layout.tsx` (wrap children in `AppShell`), `src/app/page.tsx` (drop its `<h1>`; the shell owns it)
- Test: `src/state/ui.test.ts`, `src/components/useLongPress.test.tsx`, `src/components/shell/shell.test.tsx`

**Interfaces:**
- Consumes: `useSelection`, `serializeSelection`, `useUrlSync` (Task 7); `searchEntities`, `KIND_LABELS`, `CATEGORY_LABELS` (Task 6).
- Produces:
  - `useUi` store `{ theme: 'light' | 'dark'; presenter: boolean; hydrate(): void; toggleTheme(): void; togglePresenter(): void }` and `useApplyUi(): void`
  - `CATEGORY_CLASSES: Record<Category, string>`, `CATEGORY_TONE: Record<Category, string>` (CSS var suffix), `chipToneClass(tone: ChipTone, state: ChipState): string`, types `ChipTone = 'annasamana' | 'akusala' | 'sobhana' | 'neutral'`, `ChipState = 'selected' | 'niyata' | 'aniyata' | 'on' | 'off'`
  - `useElementSize<T extends HTMLElement>(): [RefObject<T | null>, { width: number; height: number }]`, `useMediaQuery(query: string): boolean`
  - `useLongPress({ onClick, onLongPress, ms? })` → pointer/click handlers to spread on a button
  - `AppShell` (client component wrapping every page)

- [ ] **Step 1: Write the failing tests**

Create `src/state/ui.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUi } from './ui';

afterEach(() => {
  vi.restoreAllMocks();
  useUi.setState({ theme: 'light', presenter: false });
});

describe('useUi', () => {
  it('toggles theme and presenter and persists them', () => {
    useUi.getState().toggleTheme();
    useUi.getState().togglePresenter();
    expect(useUi.getState()).toMatchObject({ theme: 'dark', presenter: true });
    expect(localStorage.getItem('citta.theme')).toBe('dark');
    expect(localStorage.getItem('citta.presenter')).toBe('on');
  });

  it('hydrates from storage', () => {
    localStorage.setItem('citta.theme', 'dark');
    localStorage.setItem('citta.presenter', 'on');
    useUi.getState().hydrate();
    expect(useUi.getState()).toMatchObject({ theme: 'dark', presenter: true });
    localStorage.clear();
  });

  it('keeps working when storage throws (Review Focus #5)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => useUi.getState().hydrate()).not.toThrow();
    expect(() => useUi.getState().toggleTheme()).not.toThrow();
    expect(useUi.getState().theme).toBe('dark');
  });
});
```

Create `src/components/useLongPress.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useLongPress } from './useLongPress';

function Probe({ onClick, onLongPress }: { onClick: () => void; onLongPress: () => void }) {
  const handlers = useLongPress({ onClick, onLongPress });
  return (
    <button type="button" {...handlers}>
      x
    </button>
  );
}

afterEach(() => vi.useRealTimers());

describe('useLongPress', () => {
  it('fires onClick for a short press', () => {
    const onClick = vi.fn();
    const onLongPress = vi.fn();
    render(<Probe onClick={onClick} onLongPress={onLongPress} />);
    const b = screen.getByRole('button');
    fireEvent.pointerDown(b);
    fireEvent.pointerUp(b);
    fireEvent.click(b);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('fires onLongPress after 500ms and swallows the following click', () => {
    vi.useFakeTimers();
    const onClick = vi.fn();
    const onLongPress = vi.fn();
    render(<Probe onClick={onClick} onLongPress={onLongPress} />);
    const b = screen.getByRole('button');
    fireEvent.pointerDown(b);
    vi.advanceTimersByTime(600);
    fireEvent.pointerUp(b);
    fireEvent.click(b);
    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});
```

Create `src/components/shell/shell.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { useSelection } from '@/state/selection';
import { useUi } from '@/state/ui';
import { AppShell } from './AppShell';

// AppShell reads the selection from the URL on mount and writes it back on change.
afterEach(() => window.history.replaceState(null, '', '/'));

describe('AppShell', () => {
  it('shows the Sinhala title and the four views', () => {
    render(<AppShell>content</AppShell>);
    expect(screen.getByRole('heading', { name: 'චිත්ත දර්ශකය' })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'දර්ශන' });
    expect(within(nav).getAllByRole('link').map((a) => a.textContent)).toEqual([
      'ගවේෂකය',
      'සම්පූර්ණ සටහන',
      'සම්බන්ධතා ජාලය',
      'ඉදිරිපත් කිරීම',
    ]);
  });

  it('hydrates the selection from the URL and carries it in nav links', async () => {
    window.history.replaceState(null, '', '/?ce=12');
    render(<AppShell>content</AppShell>);
    const nav = screen.getByRole('navigation', { name: 'දර්ශන' });
    expect(await within(nav).findByRole('link', { name: 'සම්පූර්ණ සටහන' })).toHaveAttribute('href', '/matrix?ce=12');
    expect(useSelection.getState().selection.cetasika).toEqual([12]);
  });

  it('selects an entity from search', async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);
    await user.type(screen.getAllByRole('combobox', { name: 'සොයන්න' })[0], 'පීති');
    await user.click(screen.getAllByRole('option')[0].querySelector('button')!);
    expect(useSelection.getState().selection.cetasika).toEqual([12]);
  });

  it('toggles the theme on <html>', async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);
    await user.click(screen.getAllByRole('button', { name: 'තේමාව මාරු කරන්න' })[0]);
    expect(useUi.getState().theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('shows and dismisses the invalid-link notice', async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, '', '/?c=999');
    render(<AppShell>content</AppShell>);
    expect(await screen.findByRole('status')).toHaveTextContent('සබැඳියේ');
    await user.click(screen.getByRole('button', { name: 'දැනුම්දීම වසන්න' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/state/ui.test.ts src/components`
Expected: FAIL — cannot resolve `./ui`, `./useLongPress`, `./AppShell`.

- [ ] **Step 3: UI store**

Create `src/state/ui.ts`:

```ts
'use client';

import { useEffect } from 'react';
import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(`citta.${key}`);
  } catch {
    return null;
  }
};
const safeSet = (key: string, value: string) => {
  try {
    localStorage.setItem(`citta.${key}`, value);
  } catch {
    // storage blocked: keep the in-memory value for this session
  }
};

interface UiState {
  theme: Theme;
  presenter: boolean;
  hydrate: () => void;
  toggleTheme: () => void;
  togglePresenter: () => void;
}

export const useUi = create<UiState>((set, get) => ({
  theme: 'light',
  presenter: false,
  hydrate: () => {
    const stored = safeGet('theme');
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme: Theme = stored === 'dark' || stored === 'light' ? stored : prefersDark ? 'dark' : 'light';
    set({ theme, presenter: safeGet('presenter') === 'on' });
  },
  toggleTheme: () => {
    const theme: Theme = get().theme === 'dark' ? 'light' : 'dark';
    safeSet('theme', theme);
    set({ theme });
  },
  togglePresenter: () => {
    const presenter = !get().presenter;
    safeSet('presenter', presenter ? 'on' : 'off');
    set({ presenter });
  },
}));

/** Hydrates preferences once and mirrors them onto <html data-theme data-presenter>. */
export function useApplyUi(): void {
  const theme = useUi((s) => s.theme);
  const presenter = useUi((s) => s.presenter);
  useEffect(() => {
    useUi.getState().hydrate();
  }, []);
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.theme = theme;
    if (presenter) el.dataset.presenter = 'on';
    else delete el.dataset.presenter;
  }, [theme, presenter]);
}
```

- [ ] **Step 4: Shared colour maps and hooks**

Create `src/components/colors.ts`:

```ts
import type { Band, Category } from '@/data';

/** Tile/badge background per citta category. Literal class names so Tailwind picks them up. */
export const CATEGORY_CLASSES: Record<Category, string> = {
  akusala: 'bg-akusala text-white',
  ahetuka: 'bg-ahetuka text-black',
  'kama-sobhana': 'bg-kama-sobhana text-white',
  rupa: 'bg-rupa text-white',
  arupa: 'bg-arupa text-white',
  lokuttara: 'bg-lokuttara text-black',
};

/** CSS variable suffix (`--color-<tone>`) for inline styles (React Flow nodes). */
export const CATEGORY_TONE: Record<Category, string> = {
  akusala: 'akusala',
  ahetuka: 'ahetuka',
  'kama-sobhana': 'kama-sobhana',
  rupa: 'rupa',
  arupa: 'arupa',
  lokuttara: 'lokuttara',
};

export const BAND_HEADER_CLASSES: Record<Band, string> = {
  annasamana: 'bg-band-annasamana text-white',
  akusala: 'bg-band-akusala text-white',
  sobhana: 'bg-band-sobhana text-black',
};

export type ChipTone = Band | 'neutral';
export type ChipState = 'selected' | 'niyata' | 'aniyata' | 'on' | 'off';

const SOLID: Record<ChipTone, string> = {
  annasamana: 'bg-band-annasamana border-band-annasamana text-white',
  akusala: 'bg-band-akusala border-band-akusala text-white',
  sobhana: 'bg-band-sobhana border-band-sobhana text-black',
  neutral: 'bg-fg border-fg text-bg',
};
const OUTLINE: Record<ChipTone, string> = {
  annasamana: 'border-band-annasamana bg-transparent',
  akusala: 'border-band-akusala bg-transparent',
  sobhana: 'border-band-sobhana bg-transparent',
  neutral: 'border-fg bg-transparent',
};

export function chipToneClass(tone: ChipTone, state: ChipState): string {
  switch (state) {
    case 'selected':
      return `${SOLID[tone]} ring-4 ring-fg ring-offset-2 ring-offset-bg`;
    case 'niyata':
    case 'on':
      return SOLID[tone];
    case 'aniyata':
      return OUTLINE[tone];
    default:
      return 'border-line text-muted bg-transparent';
  }
}
```

Create `src/components/hooks.ts`:

```ts
'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

export function useElementSize<T extends HTMLElement>(): [RefObject<T | null>, { width: number; height: number }] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}
```

Create `src/components/useLongPress.ts`:

```ts
'use client';

import { useRef, type MouseEvent } from 'react';

/** Long-press (touch) acts like shift-click: adds to the selection instead of replacing it. */
export function useLongPress({
  onClick,
  onLongPress,
  ms = 500,
}: {
  onClick: (e: MouseEvent) => void;
  onLongPress: () => void;
  ms?: number;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fired = useRef(false);
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  return {
    onPointerDown: () => {
      fired.current = false;
      cancel();
      timer.current = setTimeout(() => {
        fired.current = true;
        onLongPress();
      }, ms);
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onClick: (e: MouseEvent) => {
      if (fired.current) {
        fired.current = false;
        return;
      }
      onClick(e);
    },
    onContextMenu: (e: MouseEvent) => {
      if (fired.current) e.preventDefault();
    },
  };
}
```

- [ ] **Step 5: Shell components**

Create `src/components/shell/nav.ts`:

```ts
export const NAV = [
  { href: '/', labelSi: 'ගවේෂකය', icon: '▦' },
  { href: '/matrix', labelSi: 'සම්පූර්ණ සටහන', icon: '▤' },
  { href: '/graph', labelSi: 'සම්බන්ධතා ජාලය', icon: '◎' },
  { href: '/present', labelSi: 'ඉදිරිපත් කිරීම', icon: '▶' },
] as const;
```

Create `src/components/shell/Toggles.tsx`:

```tsx
'use client';

import { useUi } from '@/state/ui';

const BTN = 'min-h-11 min-w-11 rounded-md border border-line px-2 hover:bg-hover';

export function ThemeToggle() {
  const theme = useUi((s) => s.theme);
  const toggle = useUi((s) => s.toggleTheme);
  return (
    <button type="button" className={BTN} onClick={toggle} aria-label="තේමාව මාරු කරන්න" title="තේමාව මාරු කරන්න">
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}

export function PresenterToggle() {
  const presenter = useUi((s) => s.presenter);
  const toggle = useUi((s) => s.togglePresenter);
  return (
    <button type="button" className={BTN} onClick={toggle} aria-pressed={presenter} aria-label="විශාල අකුරු">
      අ+
    </button>
  );
}
```

Create `src/components/shell/SearchBox.tsx`:

```tsx
'use client';

import { useId, useMemo, useState } from 'react';
import { KIND_LABELS, searchEntities, type SearchResult } from '@/data';
import { useSelection } from '@/state/selection';

export function SearchBox() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchEntities(query), [query]);
  const select = useSelection((s) => s.select);
  const listId = useId();

  const choose = (r: SearchResult) => {
    select(r.kind, r.id, false);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="chrome-optional relative">
      <input
        type="search"
        role="combobox"
        aria-label="සොයන්න"
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        placeholder="සොයන්න… (උදා: පීති)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) choose(results[0]);
          if (e.key === 'Escape') setOpen(false);
        }}
        className="min-h-11 w-full rounded-md border border-line bg-bg px-3 md:w-56"
      />
      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-80 w-full min-w-64 overflow-auto rounded-md border border-line bg-surface shadow-lg"
        >
          {results.map((r) => (
            <li key={`${r.kind}:${r.id}`} role="option" aria-selected={false}>
              <button
                type="button"
                className="flex min-h-11 w-full items-center gap-2 px-3 text-left hover:bg-hover"
                onClick={() => choose(r)}
              >
                <span className="text-xs text-muted">{KIND_LABELS[r.kind]}</span>
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

Create `src/components/shell/Legend.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { CATEGORY_LABELS, type Category } from '@/data';
import { CATEGORY_CLASSES } from '@/components/colors';

function LegendList() {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
      {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
        <li key={c} className="flex items-center gap-2">
          <span className={`inline-block h-4 w-4 rounded ${CATEGORY_CLASSES[c]}`} aria-hidden />
          {CATEGORY_LABELS[c]}
        </li>
      ))}
      <li>✓ නියත</li>
      <li>● අනියත</li>
    </ul>
  );
}

export function Legend({ inline = false }: { inline?: boolean }) {
  const [open, setOpen] = useState(false);
  if (inline) return <LegendList />;
  return (
    <div className="chrome-optional relative">
      <button
        type="button"
        className="min-h-11 rounded-md border border-line px-3 hover:bg-hover"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        වර්ණ
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-72 rounded-md border border-line bg-surface p-3 shadow-lg">
          <LegendList />
        </div>
      )}
    </div>
  );
}
```

Create `src/components/shell/Notice.tsx`:

```tsx
'use client';

import { useSelection } from '@/state/selection';

export function Notice() {
  const notice = useSelection((s) => s.notice);
  const dismiss = useSelection((s) => s.dismissNotice);
  if (!notice) return null;
  return (
    <div role="status" className="mx-auto flex max-w-[1800px] items-center gap-3 bg-hover px-4 py-2 text-sm">
      <span className="flex-1">{notice}</span>
      <button type="button" onClick={dismiss} aria-label="දැනුම්දීම වසන්න" className="min-h-11 min-w-11">
        ×
      </button>
    </div>
  );
}
```

Create `src/components/shell/TopBar.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSelection } from '@/state/selection';
import { serializeSelection } from '@/state/url';
import { Legend } from './Legend';
import { NAV } from './nav';
import { SearchBox } from './SearchBox';
import { PresenterToggle, ThemeToggle } from './Toggles';

export function TopBar() {
  const pathname = usePathname();
  const qs = serializeSelection(useSelection((s) => s.selection));
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2">
        <h1 className="font-display text-xl font-bold md:text-2xl">චිත්ත දර්ශකය</h1>
        <nav aria-label="දර්ශන" className="hidden flex-wrap gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={`${n.href}${qs}`}
              aria-current={pathname === n.href ? 'page' : undefined}
              className="flex min-h-11 items-center rounded-md px-3 hover:bg-hover aria-[current=page]:bg-fg aria-[current=page]:text-bg"
            >
              {n.labelSi}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <SearchBox />
          <Legend />
          <ThemeToggle />
          <PresenterToggle />
        </div>
        <button
          type="button"
          className="ml-auto min-h-11 min-w-11 text-xl md:hidden"
          aria-label="මෙනුව"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          ☰
        </button>
      </div>
      {menuOpen && (
        <div className="space-y-3 border-t border-line px-4 py-3 md:hidden">
          <SearchBox />
          <div className="flex gap-2">
            <ThemeToggle />
            <PresenterToggle />
          </div>
          <Legend inline />
        </div>
      )}
    </header>
  );
}
```

Create `src/components/shell/BottomNav.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelection } from '@/state/selection';
import { serializeSelection } from '@/state/url';
import { NAV } from './nav';

export function BottomNav() {
  const pathname = usePathname();
  const qs = serializeSelection(useSelection((s) => s.selection));
  return (
    <nav
      aria-label="දර්ශන (ජංගම)"
      className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-4 border-t border-line bg-surface md:hidden"
    >
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={`${n.href}${qs}`}
          aria-current={pathname === n.href ? 'page' : undefined}
          className="flex flex-col items-center justify-center text-[0.7rem] leading-tight aria-[current=page]:font-bold aria-[current=page]:text-fg text-muted"
        >
          <span aria-hidden className="text-lg">
            {n.icon}
          </span>
          {n.labelSi}
        </Link>
      ))}
    </nav>
  );
}
```

Create `src/components/shell/AppShell.tsx`:

```tsx
'use client';

import type { ReactNode } from 'react';
import { useApplyUi } from '@/state/ui';
import { useUrlSync } from '@/state/useUrlSync';
import { BottomNav } from './BottomNav';
import { Notice } from './Notice';
import { TopBar } from './TopBar';

export function AppShell({ children }: { children: ReactNode }) {
  useUrlSync();
  useApplyUi();
  return (
    <div className="min-h-dvh pb-20 md:pb-0">
      <TopBar />
      <Notice />
      <main className="mx-auto max-w-[1800px] px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 6: Wire the shell into the layout**

In `src/app/layout.tsx` add `import { AppShell } from '@/components/shell/AppShell';` and change the body to:

```tsx
<body className={`${noto.variable} ${abhaya.variable} antialiased`}>
  <AppShell>{children}</AppShell>
</body>
```

Replace `src/app/page.tsx` (the shell now owns the `<h1>`; Task 10 fills this page):

```tsx
export default function Home() {
  return <p className="text-muted">සිත් 89</p>;
}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run src/state src/components`
Expected: PASS.

Run: `npx playwright test e2e/smoke.spec.ts --project=projector`
Expected: PASS (heading now comes from the shell).

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "feat(shell): add top bar, bottom nav, search, legend, theme and presenter toggles

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Explorer — citta map (treemap on tablet/desktop, accordion on phones)

**Files:**
- Create: `src/views/explorer/tileState.ts`, `layoutTreemap.ts`, `TileButton.tsx`, `CittaMap.tsx`, `CittaList.tsx`
- Test: `src/views/explorer/tileState.test.ts`, `src/views/explorer/layoutTreemap.test.ts`, `src/views/explorer/explorerMap.test.tsx`

**Interfaces:**
- Consumes: `CITTAS`, `GROUPS`, `SPHERES`, `SPHERE_LABELS`, `groupById`, `cittasMatching`, `Selection` (`@/data`); `useSelection`; `CATEGORY_CLASSES`, `useElementSize`, `useLongPress`.
- Produces:
  - `type TileState = 'selected' | 'match' | 'dim' | 'normal'`
  - `tileState(cittaId: number, selection: Selection, matching: Set<number> | null): TileState`
  - `interface Rect { x0: number; y0: number; x1: number; y1: number }`
  - `layoutTreemap(width: number, height: number): { spheres: (Rect & { sphere: Sphere })[]; groups: (Rect & { group: Group })[]; tiles: (Rect & { citta: Citta })[] }`
  - `TileButton`, `CittaMap` (`data-testid="citta-map"`), `CittaList` (`data-testid="citta-list"`)
  - Tile buttons have accessible name `"<id>. <nameSi>"` and `data-state` = TileState.

Tile state rules: with filters active, matching cittas are `match` (or `selected` if also picked) and all others `dim`; with only cittas picked, picked are `selected` and others `dim`; with nothing, `normal`.

- [ ] **Step 1: Write the failing tests**

Create `src/views/explorer/tileState.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { cittasMatching, emptySelection } from '@/data';
import { tileState } from './tileState';

const state = (id: number, patch: Partial<ReturnType<typeof emptySelection>>) => {
  const sel = { ...emptySelection(), ...patch };
  return tileState(id, sel, cittasMatching(sel));
};

describe('tileState', () => {
  it('is normal with nothing selected', () => {
    expect(state(1, {})).toBe('normal');
  });

  it('marks picked cittas selected and dims the rest', () => {
    expect(state(1, { citta: [1] })).toBe('selected');
    expect(state(2, { citta: [1] })).toBe('dim');
  });

  it('marks filter matches and dims non-matches', () => {
    expect(state(1, { cetasika: [12] })).toBe('match');
    expect(state(5, { cetasika: [12] })).toBe('dim');
  });

  it('prefers selected over match', () => {
    expect(state(1, { citta: [1], cetasika: [12] })).toBe('selected');
  });

  it('dims everything when a combination has no matches (Review Focus #3)', () => {
    expect(state(1, { cetasika: [21, 12] })).toBe('dim');
    expect(state(9, { cetasika: [21, 12] })).toBe('dim');
  });
});
```

Create `src/views/explorer/layoutTreemap.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { layoutTreemap, type Rect } from './layoutTreemap';

const overlap = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

describe('layoutTreemap', () => {
  const layout = layoutTreemap(1000, 620);

  it('lays out 89 tiles, 17 groups and 4 spheres', () => {
    expect(layout.tiles).toHaveLength(89);
    expect(layout.groups).toHaveLength(17);
    expect(layout.spheres).toHaveLength(4);
  });

  it('keeps every tile inside the canvas with positive size', () => {
    for (const t of layout.tiles) {
      expect(t.x0).toBeGreaterThanOrEqual(0);
      expect(t.y0).toBeGreaterThanOrEqual(0);
      expect(t.x1).toBeLessThanOrEqual(1000);
      expect(t.y1).toBeLessThanOrEqual(620);
      expect(t.x1 - t.x0).toBeGreaterThan(0);
      expect(t.y1 - t.y0).toBeGreaterThan(0);
    }
  });

  it('never overlaps two tiles', () => {
    for (let i = 0; i < layout.tiles.length; i++)
      for (let j = i + 1; j < layout.tiles.length; j++)
        expect(overlap(layout.tiles[i], layout.tiles[j]), `${i} vs ${j}`).toBe(0);
  });
});
```

Create `src/views/explorer/explorerMap.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useSelection } from '@/state/selection';
import { CittaList } from './CittaList';
import { CittaMap } from './CittaMap';

describe('CittaMap', () => {
  it('renders 89 tile buttons and selects one on click', async () => {
    const user = userEvent.setup();
    render(<CittaMap />);
    const map = screen.getByTestId('citta-map');
    const tiles = within(map).getAllByRole('button');
    expect(tiles).toHaveLength(89);
    await user.click(within(map).getByRole('button', { name: /^1\. / }));
    expect(useSelection.getState().selection.citta).toEqual([1]);
    expect(within(map).getByRole('button', { name: /^1\. / })).toHaveAttribute('data-state', 'selected');
    expect(within(map).getByRole('button', { name: /^2\. / })).toHaveAttribute('data-state', 'dim');
  });

  it('adds to the selection on shift-click', async () => {
    const user = userEvent.setup();
    render(<CittaMap />);
    const map = screen.getByTestId('citta-map');
    await user.click(within(map).getByRole('button', { name: /^1\. / }));
    await user.keyboard('{Shift>}');
    await user.click(within(map).getByRole('button', { name: /^9\. / }));
    await user.keyboard('{/Shift}');
    expect(useSelection.getState().selection.citta).toEqual([1, 9]);
  });

  it('never truncates Sinhala labels with an ellipsis', () => {
    render(<CittaMap />);
    for (const b of within(screen.getByTestId('citta-map')).getAllByRole('button')) {
      expect(b.className).not.toMatch(/\btruncate\b/);
    }
  });
});

describe('CittaList (phone)', () => {
  it('renders all 89 tiles grouped under the four spheres', () => {
    render(<CittaList />);
    const list = screen.getByTestId('citta-list');
    expect(within(list).getAllByRole('button')).toHaveLength(89);
    for (const s of ['කාමාවචර', 'රූපාවචර', 'අරූපාවචර', 'ලෝකෝත්තර']) {
      expect(within(list).getByText(s)).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/views/explorer`
Expected: FAIL — cannot resolve `./tileState`, `./layoutTreemap`, `./CittaMap`, `./CittaList`.

- [ ] **Step 3: Implement tileState and layoutTreemap**

Create `src/views/explorer/tileState.ts`:

```ts
import type { Selection } from '@/data';

export type TileState = 'selected' | 'match' | 'dim' | 'normal';

export function tileState(cittaId: number, selection: Selection, matching: Set<number> | null): TileState {
  const picked = selection.citta.includes(cittaId);
  if (matching) {
    if (picked) return 'selected';
    return matching.has(cittaId) ? 'match' : 'dim';
  }
  if (selection.citta.length > 0) return picked ? 'selected' : 'dim';
  return 'normal';
}
```

Create `src/views/explorer/layoutTreemap.ts`:

```ts
import { hierarchy, treemap } from 'd3-hierarchy';
import { CITTAS, GROUPS, SPHERES, type Citta, type Group, type Sphere } from '@/data';

export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface TreemapLayout {
  spheres: (Rect & { sphere: Sphere })[];
  groups: (Rect & { group: Group })[];
  tiles: (Rect & { citta: Citta })[];
}

interface TNode {
  key: string;
  sphere?: Sphere;
  group?: Group;
  citta?: Citta;
  children?: TNode[];
}

export function layoutTreemap(width: number, height: number): TreemapLayout {
  const data: TNode = {
    key: 'root',
    children: SPHERES.map((sphere) => ({
      key: sphere,
      sphere,
      children: GROUPS.filter((g) => g.sphere === sphere).map((group) => ({
        key: group.id,
        group,
        children: CITTAS.filter((c) => c.group === group.id).map((citta) => ({ key: String(citta.id), citta })),
      })),
    })),
  };

  const root = hierarchy(data).sum((d) => (d.citta ? 1 : 0));
  const laid = treemap<TNode>()
    .size([width, height])
    .paddingOuter(2)
    .paddingInner(3)
    .paddingTop((n) => (n.depth === 1 ? 26 : n.depth === 2 ? 20 : 2))
    .round(true)(root);

  const out: TreemapLayout = { spheres: [], groups: [], tiles: [] };
  for (const n of laid.descendants()) {
    const r = { x0: n.x0, y0: n.y0, x1: n.x1, y1: n.y1 };
    if (n.data.sphere) out.spheres.push({ ...r, sphere: n.data.sphere });
    else if (n.data.group) out.groups.push({ ...r, group: n.data.group });
    else if (n.data.citta) out.tiles.push({ ...r, citta: n.data.citta });
  }
  return out;
}
```

- [ ] **Step 4: Implement the tile button, map and list**

Create `src/views/explorer/TileButton.tsx`:

```tsx
'use client';

import { motion } from 'motion/react';
import type { CSSProperties } from 'react';
import { groupById, type Citta } from '@/data';
import { CATEGORY_CLASSES } from '@/components/colors';
import { useLongPress } from '@/components/useLongPress';
import { useSelection } from '@/state/selection';
import type { TileState } from './tileState';

const STATE_CLASSES: Record<TileState, string> = {
  selected: 'z-10 ring-4 ring-fg ring-offset-2 ring-offset-bg',
  match: 'z-10 ring-2 ring-fg',
  dim: '',
  normal: '',
};

export function TileButton({
  citta,
  state,
  style,
  className = '',
}: {
  citta: Citta;
  state: TileState;
  style?: CSSProperties;
  className?: string;
}) {
  const select = useSelection((s) => s.select);
  const handlers = useLongPress({
    onClick: (e) => select('citta', citta.id, e.shiftKey),
    onLongPress: () => select('citta', citta.id, true),
  });
  const category = groupById.get(citta.group)!.category;

  return (
    <motion.button
      type="button"
      {...handlers}
      data-state={state}
      aria-pressed={state === 'selected'}
      aria-label={`${citta.id}. ${citta.nameSi}`}
      title={citta.nameSi}
      animate={{ opacity: state === 'dim' ? 0.22 : 1, scale: state === 'match' ? 1.04 : 1 }}
      transition={{ duration: 0.2 }}
      style={style}
      className={`flex min-h-11 flex-col items-center justify-center overflow-hidden rounded-md p-1 text-center leading-tight break-words ${CATEGORY_CLASSES[category]} ${STATE_CLASSES[state]} ${className}`}
    >
      <span className="text-xs font-bold opacity-80">{citta.id}</span>
      <span className="text-[0.78rem]">{citta.short}</span>
    </motion.button>
  );
}
```

Create `src/views/explorer/CittaMap.tsx`:

```tsx
'use client';

import { useMemo } from 'react';
import { SPHERE_LABELS, cittasMatching } from '@/data';
import { useElementSize } from '@/components/hooks';
import { useSelection } from '@/state/selection';
import { layoutTreemap, type Rect } from './layoutTreemap';
import { TileButton } from './TileButton';
import { tileState } from './tileState';

const box = (r: Rect) => ({ left: r.x0, top: r.y0, width: r.x1 - r.x0, height: r.y1 - r.y0 });

export function CittaMap() {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const width = size.width || 1000;
  const height = Math.max(420, Math.round(width * 0.62));
  const layout = useMemo(() => layoutTreemap(width, height), [width, height]);
  const selection = useSelection((s) => s.selection);
  const matching = useMemo(() => cittasMatching(selection), [selection]);

  return (
    <div ref={ref} data-testid="citta-map" className="relative w-full overflow-hidden" style={{ height }}>
      {layout.spheres.map((s) => (
        <div key={s.sphere} className="absolute rounded-lg border border-line bg-surface" style={box(s)}>
          <span className="absolute left-2 top-0.5 font-display text-sm font-bold">{SPHERE_LABELS[s.sphere]}</span>
        </div>
      ))}
      {layout.groups.map((g) => (
        <div key={g.group.id} className="absolute" style={box(g)}>
          <span className="absolute inset-x-1 top-0 h-5 overflow-hidden text-[0.7rem] leading-5 text-muted">
            {g.group.nameSi}
          </span>
        </div>
      ))}
      {layout.tiles.map((t) => (
        <TileButton
          key={t.citta.id}
          citta={t.citta}
          state={tileState(t.citta.id, selection, matching)}
          className="absolute"
          style={box(t)}
        />
      ))}
    </div>
  );
}
```

Create `src/views/explorer/CittaList.tsx`:

```tsx
'use client';

import { useMemo } from 'react';
import { CITTAS, GROUPS, SPHERES, SPHERE_LABELS, cittasMatching } from '@/data';
import { useSelection } from '@/state/selection';
import { TileButton } from './TileButton';
import { tileState } from './tileState';

export function CittaList() {
  const selection = useSelection((s) => s.selection);
  const matching = useMemo(() => cittasMatching(selection), [selection]);

  return (
    <div data-testid="citta-list" className="space-y-2">
      {SPHERES.map((sphere) => (
        <details key={sphere} open className="rounded-lg border border-line bg-surface">
          <summary className="flex min-h-11 cursor-pointer items-center px-3 font-display text-lg font-bold">
            {SPHERE_LABELS[sphere]}
          </summary>
          <div className="space-y-3 px-3 pb-3">
            {GROUPS.filter((g) => g.sphere === sphere).map((g) => {
              const cittas = CITTAS.filter((c) => c.group === g.id);
              return (
                <section key={g.id}>
                  <h3 className="mb-1 text-sm text-muted">
                    {g.nameSi} ({cittas.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                    {cittas.map((c) => (
                      <TileButton key={c.id} citta={c} state={tileState(c.id, selection, matching)} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </details>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/views/explorer`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/views/explorer
git commit -m "feat(explorer): add citta treemap and phone accordion with linked highlighting

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Explorer — profile panels, match caption, bottom sheet, Explorer route

**Files:**
- Create: `src/views/explorer/chipState.ts`, `Chip.tsx`, `CetasikaGrid.tsx`, `VithiStrip.tsx`, `PsChain.tsx`, `PersonPlaneBadges.tsx`, `ProfilePanels.tsx`, `BottomSheet.tsx`, `ExplorerView.tsx`
- Modify: `src/app/page.tsx`
- Test: `src/views/explorer/chipState.test.ts`, `src/views/explorer/explorerPanels.test.tsx`

**Interfaces:**
- Consumes: `profileOf`, `cittasMatching`, `activeFilters`, `labelOf`, `hasAnySelection`, `CETASIKAS`, `BAND_LABELS`, `KICCAS`, `PS_LINKS`, `psLinkById`, `psLabel`, `STANDARD_CHAIN`, `PUGGALAS`, `BHUMIS`, `cittaById`, `range` (`@/data`, `@/data/range`); `useSelection`; `chipToneClass`, `ChipTone`, `ChipState`, `useLongPress`, `useMediaQuery`; `CittaMap`, `CittaList` (Task 9).
- Produces:
  - `chipState(kind: FilterKind, id: EntityId, selection: Selection, profile: CittaProfile | null): ChipState`
  - `matchCaption(selection: Selection): string | null`
  - `ExplorerView({ presenting?: boolean })` — used by `/` and by Presentation (Task 13).
  - Profile aside has `data-testid="profile-aside"`; bottom sheet has `data-testid="bottom-sheet"`.

- [ ] **Step 1: Write the failing tests**

Create `src/views/explorer/chipState.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { emptySelection, profileOf } from '@/data';
import { chipState, matchCaption } from './chipState';

describe('chipState', () => {
  const sel1 = { ...emptySelection(), citta: [1] };
  const p1 = profileOf(1);

  it('reflects niyata / aniyata / off for a citta profile', () => {
    expect(chipState('cetasika', 18, sel1, p1)).toBe('niyata');
    expect(chipState('cetasika', 20, { ...emptySelection(), citta: [3] }, profileOf(3))).toBe('aniyata');
    expect(chipState('cetasika', 21, sel1, p1)).toBe('off');
  });

  it('marks present kiccas, PS links, puggalas and bhūmis as on', () => {
    expect(chipState('kicca', 'javana', sel1, p1)).toBe('on');
    expect(chipState('kicca', 'patisandhi', sel1, p1)).toBe('off');
    expect(chipState('psLink', 'vedana-tanha', sel1, p1)).toBe('on');
    expect(chipState('puggala', 'arahant', sel1, p1)).toBe('off');
    expect(chipState('bhumi', 'kama', sel1, p1)).toBe('on');
  });

  it('marks selected filters as selected even without a profile', () => {
    expect(chipState('cetasika', 12, { ...emptySelection(), cetasika: [12] }, null)).toBe('selected');
    expect(chipState('cetasika', 13, { ...emptySelection(), cetasika: [12] }, null)).toBe('off');
  });
});

describe('matchCaption', () => {
  it('is null without filters', () => {
    expect(matchCaption(emptySelection())).toBeNull();
  });

  it('names the filters and counts the cittas', () => {
    expect(matchCaption({ ...emptySelection(), cetasika: [12] })).toBe('පීති: සිත් 35');
    expect(matchCaption({ ...emptySelection(), cetasika: [12], puggala: ['sotapanna'] })).toBe(
      'පීති + සෝතාපන්න: සිත් 15',
    );
  });

  it('explains an empty combination (Review Focus #3)', () => {
    expect(matchCaption({ ...emptySelection(), cetasika: [21, 12] })).toBe('දෝස + පීති: සිත් 0 — පොදු සිතක් නැත');
  });
});
```

Create `src/views/explorer/explorerPanels.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useSelection } from '@/state/selection';
import { ExplorerView } from './ExplorerView';

const aside = () => screen.getByTestId('profile-aside');

describe('ExplorerView', () => {
  it('shows a hint before anything is selected', () => {
    render(<ExplorerView />);
    expect(within(aside()).getByText('සිතක් හෝ චෛතසිකයක් තෝරන්න')).toBeInTheDocument();
  });

  it('fills the profile when a citta is clicked', async () => {
    const user = userEvent.setup();
    render(<ExplorerView />);
    await user.click(within(screen.getByTestId('citta-map')).getByRole('button', { name: /^1\. / }));
    const panel = aside();
    expect(within(panel).getByText('19 / 52')).toBeInTheDocument();
    const lit = within(panel)
      .getAllByRole('button')
      .filter((b) => b.dataset.state === 'niyata' || b.dataset.state === 'aniyata');
    expect(lit).toHaveLength(19);
    expect(within(panel).getByRole('button', { name: 'ජවන' })).toHaveAttribute('data-state', 'on');
    expect(within(panel).getByRole('button', { name: 'වේදනා පච්චයා තණ්හා' })).toHaveAttribute('data-state', 'on');
  });

  it('reverses direction when a cetasika chip is clicked, and combines with shift', async () => {
    const user = userEvent.setup();
    render(<ExplorerView />);
    await user.click(within(aside()).getByRole('button', { name: 'පීති' }));
    expect(within(aside()).getByText('පීති: සිත් 35')).toBeInTheDocument();
    await user.keyboard('{Shift>}');
    await user.click(within(aside()).getByRole('button', { name: 'සෝතාපන්න' }));
    await user.keyboard('{/Shift}');
    expect(within(aside()).getByText('පීති + සෝතාපන්න: සිත් 15')).toBeInTheDocument();
    expect(useSelection.getState().selection.puggala).toEqual(['sotapanna']);
  });

  it('renders placeholders for empty PS slots', async () => {
    const user = userEvent.setup();
    render(<ExplorerView />);
    await user.click(within(screen.getByTestId('citta-map')).getByRole('button', { name: /^13\. / }));
    const chain = within(aside()).getByTestId('ps-chain');
    expect(within(chain).getAllByRole('listitem')).toHaveLength(11);
    expect(within(chain).getByText('තණ්හා පච්චයා උපාදාන')).toHaveAttribute('data-state', 'off');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/views/explorer/chipState.test.ts src/views/explorer/explorerPanels.test.tsx`
Expected: FAIL — cannot resolve `./chipState`, `./ExplorerView`.

- [ ] **Step 3: Implement chipState and the caption**

Create `src/views/explorer/chipState.ts`:

```ts
import {
  activeFilters,
  cittasMatching,
  labelOf,
  type CittaProfile,
  type EntityId,
  type FilterKind,
  type Selection,
} from '@/data';
import type { ChipState } from '@/components/colors';

export function chipState(
  kind: FilterKind,
  id: EntityId,
  selection: Selection,
  profile: CittaProfile | null,
): ChipState {
  if ((selection[kind] as EntityId[]).includes(id)) return 'selected';
  if (!profile) return 'off';
  switch (kind) {
    case 'cetasika':
      return profile.cetasikas.find((r) => r.cetasika === id)?.kind ?? 'off';
    case 'kicca':
      return profile.kiccas.some((r) => r.kicca === id) ? 'on' : 'off';
    case 'psLink':
      return profile.psLinks.some((r) => r.psLink === id) ? 'on' : 'off';
    case 'puggala':
      return profile.puggalas.some((r) => r.puggala === id) ? 'on' : 'off';
    case 'bhumi':
      return profile.bhumis.some((r) => r.bhumi === id) ? 'on' : 'off';
  }
}

export function matchCaption(selection: Selection): string | null {
  const matching = cittasMatching(selection);
  if (!matching) return null;
  const names = activeFilters(selection)
    .map((f) => labelOf(f.kind, f.id))
    .join(' + ');
  const suffix = matching.size === 0 ? ' — පොදු සිතක් නැත' : '';
  return `${names}: සිත් ${matching.size}${suffix}`;
}
```

- [ ] **Step 4: Implement the chip and panels**

Create `src/views/explorer/Chip.tsx`:

```tsx
'use client';

import { chipToneClass, type ChipState, type ChipTone } from '@/components/colors';
import { useLongPress } from '@/components/useLongPress';
import type { EntityId, FilterKind } from '@/data';
import { useSelection } from '@/state/selection';

export function Chip({
  kind,
  id,
  label,
  state,
  tone,
  reviewNote,
}: {
  kind: FilterKind;
  id: EntityId;
  label: string;
  state: ChipState;
  tone: ChipTone;
  reviewNote?: string;
}) {
  const select = useSelection((s) => s.select);
  const handlers = useLongPress({
    onClick: (e) => select(kind, id, e.shiftKey),
    onLongPress: () => select(kind, id, true),
  });
  return (
    <button
      type="button"
      {...handlers}
      data-state={state}
      aria-pressed={state === 'selected'}
      aria-label={label}
      title={reviewNote}
      className={`min-h-11 rounded-full border-2 px-3 py-1 text-sm leading-tight transition ${chipToneClass(tone, state)}`}
    >
      {label}
      {state === 'aniyata' && <span aria-hidden> ●</span>}
      {reviewNote && (
        <sup aria-hidden className="ml-0.5 font-bold">
          ?
        </sup>
      )}
    </button>
  );
}
```

Create `src/views/explorer/CetasikaGrid.tsx`:

```tsx
'use client';

import { BAND_LABELS, CETASIKAS, type Band, type CittaProfile, type Selection } from '@/data';
import { Chip } from './Chip';
import { chipState } from './chipState';

const BANDS: Band[] = ['annasamana', 'akusala', 'sobhana'];

export function CetasikaGrid({ selection, profile }: { selection: Selection; profile: CittaProfile | null }) {
  return (
    <div className="grid gap-3 2xl:grid-cols-3">
      {BANDS.map((band) => (
        <div key={band} className="min-w-0">
          <h4 className="mb-1 text-sm font-bold">{BAND_LABELS[band]}</h4>
          <div className="flex flex-wrap gap-1.5">
            {CETASIKAS.filter((c) => c.band === band).map((c) => (
              <Chip
                key={c.id}
                kind="cetasika"
                id={c.id}
                label={c.nameSi}
                tone={band}
                state={chipState('cetasika', c.id, selection, profile)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

Create `src/views/explorer/VithiStrip.tsx`:

```tsx
'use client';

import { Fragment } from 'react';
import { KICCAS, type CittaProfile, type Kicca, type Selection } from '@/data';
import { Chip } from './Chip';
import { chipState } from './chipState';

const COLUMNS: Kicca[][] = [...new Set(KICCAS.map((k) => k.vithiOrder))]
  .sort((a, b) => a - b)
  .map((order) => KICCAS.filter((k) => k.vithiOrder === order));

export function VithiStrip({ selection, profile }: { selection: Selection; profile: CittaProfile | null }) {
  return (
    <div data-testid="vithi-strip" className="flex snap-x gap-2 overflow-x-auto pb-2">
      {COLUMNS.map((column, i) => (
        <Fragment key={column[0].vithiOrder}>
          {i > 0 && (
            <span aria-hidden className="self-center text-muted">
              →
            </span>
          )}
          <div className="flex shrink-0 snap-start flex-col justify-center gap-1">
            {column.map((k) => (
              <Chip
                key={k.id}
                kind="kicca"
                id={k.id}
                label={k.nameSi}
                tone="neutral"
                state={chipState('kicca', k.id, selection, profile)}
              />
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
```

Create `src/views/explorer/PsChain.tsx`:

```tsx
'use client';

import {
  PS_LINKS,
  STANDARD_CHAIN,
  psLabel,
  psLinkById,
  type CittaProfile,
  type PsRel,
  type Selection,
} from '@/data';
import { range } from '@/data/range';
import { Chip } from './Chip';
import { chipState } from './chipState';

export function PsChain({ selection, profile }: { selection: Selection; profile: CittaProfile | null }) {
  if (!profile) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {PS_LINKS.map((l) => (
          <Chip
            key={l.id}
            kind="psLink"
            id={l.id}
            label={psLabel(l)}
            tone="neutral"
            state={chipState('psLink', l.id, selection, null)}
          />
        ))}
      </div>
    );
  }

  const bySlot = new Map<number, PsRel[]>();
  for (const r of profile.psLinks) {
    const slot = psLinkById.get(r.psLink)!.slot;
    bySlot.set(slot, [...(bySlot.get(slot) ?? []), r]);
  }

  return (
    <ol data-testid="ps-chain" className="flex flex-col items-start gap-1">
      {range(1, 11).map((slot) => {
        const rels = bySlot.get(slot);
        if (!rels) {
          return (
            <li
              key={slot}
              data-state="off"
              className="rounded-full border-2 border-dashed border-line px-3 py-1 text-sm text-muted"
            >
              {psLabel(psLinkById.get(STANDARD_CHAIN[slot - 1])!)}
            </li>
          );
        }
        return (
          <li key={slot} className="flex flex-wrap gap-1">
            {rels.map((r) => (
              <Chip
                key={r.psLink}
                kind="psLink"
                id={r.psLink}
                label={psLabel(psLinkById.get(r.psLink)!)}
                tone="neutral"
                state={chipState('psLink', r.psLink, selection, profile)}
                reviewNote={r.status === 'rule' ? undefined : (r.note ?? r.status)}
              />
            ))}
          </li>
        );
      })}
    </ol>
  );
}
```

Create `src/views/explorer/PersonPlaneBadges.tsx`:

```tsx
'use client';

import { BHUMIS, PUGGALAS, type CittaProfile, type Selection } from '@/data';
import { Chip } from './Chip';
import { chipState } from './chipState';

export function PersonPlaneBadges({ selection, profile }: { selection: Selection; profile: CittaProfile | null }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {PUGGALAS.map((p) => (
          <Chip
            key={p.id}
            kind="puggala"
            id={p.id}
            label={p.nameSi}
            tone="neutral"
            state={chipState('puggala', p.id, selection, profile)}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {BHUMIS.map((b) => (
          <Chip
            key={b.id}
            kind="bhumi"
            id={b.id}
            label={b.nameSi}
            tone="neutral"
            state={chipState('bhumi', b.id, selection, profile)}
          />
        ))}
      </div>
    </div>
  );
}
```

Create `src/views/explorer/ProfilePanels.tsx`:

```tsx
'use client';

import type { ReactNode } from 'react';
import { cittaById, profileOf, type CittaProfile, type Selection } from '@/data';
import { useSelection } from '@/state/selection';
import { CetasikaGrid } from './CetasikaGrid';
import { matchCaption } from './chipState';
import { PersonPlaneBadges } from './PersonPlaneBadges';
import { PsChain } from './PsChain';
import { VithiStrip } from './VithiStrip';

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-lg border border-line bg-surface p-3">
      <h3 className="mb-2 font-display text-lg font-bold">{title}</h3>
      {children}
    </section>
  );
}

function Header({ selection, profile }: { selection: Selection; profile: CittaProfile | null }) {
  const caption = matchCaption(selection);
  let body: ReactNode;
  if (profile && selection.citta.length === 1) {
    const c = cittaById.get(selection.citta[0])!;
    body = (
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="font-display text-2xl font-bold">
          {c.id}. {c.nameSi}
        </h2>
        <span className="rounded-full bg-fg px-3 py-0.5 text-bg">{profile.cetasikas.length} / 52</span>
      </div>
    );
  } else if (caption) {
    body = <h2 className="font-display text-2xl font-bold">{caption}</h2>;
  } else if (selection.citta.length > 1) {
    body = <h2 className="font-display text-2xl font-bold">තෝරාගත් සිත් {selection.citta.length}</h2>;
  } else {
    body = <p className="text-muted">සිතක් හෝ චෛතසිකයක් තෝරන්න</p>;
  }
  return <div className="min-w-0 md:col-span-2 xl:col-span-1">{body}</div>;
}

export function ProfilePanels() {
  const selection = useSelection((s) => s.selection);
  const profile = selection.citta.length === 1 ? profileOf(selection.citta[0]) : null;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
      <Header selection={selection} profile={profile} />
      <Panel title="චෛතසික">
        <CetasikaGrid selection={selection} profile={profile} />
      </Panel>
      <Panel title="චිත්ත වීථිය — කෘත්‍ය">
        <VithiStrip selection={selection} profile={profile} />
      </Panel>
      <Panel title="පටිච්චසමුප්පාදය">
        <PsChain selection={selection} profile={profile} />
      </Panel>
      <Panel title="පුද්ගල / භූමි">
        <PersonPlaneBadges selection={selection} profile={profile} />
      </Panel>
    </div>
  );
}
```

Create `src/views/explorer/BottomSheet.tsx`:

```tsx
'use client';

import { AnimatePresence, motion, useDragControls } from 'motion/react';
import type { ReactNode } from 'react';

export function BottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const controls = useDragControls();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="bottom-sheet"
          role="dialog"
          aria-label="විස්තර"
          className="fixed inset-x-0 bottom-16 z-40 max-h-[70dvh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface px-4 pb-4 shadow-2xl md:hidden"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          drag="y"
          dragControls={controls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 100) onClose();
          }}
        >
          <div className="sticky top-0 z-10 -mx-4 flex touch-none items-center bg-surface px-4 py-2" onPointerDown={(e) => controls.start(e)}>
            <div className="mx-auto h-1.5 w-12 rounded-full bg-line" aria-hidden />
            <button type="button" onClick={onClose} aria-label="වසන්න" className="absolute right-2 min-h-11 min-w-11 text-xl">
              ×
            </button>
          </div>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

Create `src/views/explorer/ExplorerView.tsx`:

```tsx
'use client';

import { hasAnySelection } from '@/data';
import { useMediaQuery } from '@/components/hooks';
import { useSelection } from '@/state/selection';
import { BottomSheet } from './BottomSheet';
import { CittaList } from './CittaList';
import { CittaMap } from './CittaMap';
import { ProfilePanels } from './ProfilePanels';

export function ExplorerView({ presenting = false }: { presenting?: boolean }) {
  const selection = useSelection((s) => s.selection);
  const clear = useSelection((s) => s.clear);
  const isPhone = useMediaQuery('(max-width: 767px)');

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section className="min-w-0" aria-label="සිත් 89">
        <div className="hidden md:block">
          <CittaMap />
        </div>
        <div className="md:hidden">
          <CittaList />
        </div>
      </section>
      <aside data-testid="profile-aside" className={presenting ? 'min-w-0' : 'hidden min-w-0 md:block'}>
        <ProfilePanels />
      </aside>
      {!presenting && isPhone && (
        <BottomSheet open={hasAnySelection(selection)} onClose={clear}>
          <ProfilePanels />
        </BottomSheet>
      )}
    </div>
  );
}
```

Replace `src/app/page.tsx`:

```tsx
import { ExplorerView } from '@/views/explorer/ExplorerView';

export default function Home() {
  return <ExplorerView />;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/views/explorer`
Expected: PASS.

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Look at it**

Run: `npm run dev`, open `http://localhost:3000`, click citta 1, then the පීති chip, then shift-click සෝතාපන්න. Check: tiles dim and highlight, caption reads "පීති + සෝතාපන්න: සිත් 15", Sinhala conjuncts in tile names (e.g. "සම්ප්‍රයුක්ත") render joined, not as separate letters. Resize the window to phone width: the accordion shows and the bottom sheet slides up on selection. Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add src/views/explorer src/app/page.tsx
git commit -m "feat(explorer): add cetasika grid, vithi strip, PS chain, badges and bottom sheet

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---
### Task 11: Matrix view (full chart) with review mode and CSV export

**Files:**
- Create: `src/views/matrix/columns.ts`, `src/views/matrix/csv.ts`, `src/views/matrix/MatrixView.tsx`, `src/app/matrix/page.tsx`
- Test: `src/views/matrix/columns.test.ts`, `src/views/matrix/MatrixView.test.tsx`

**Interfaces:**
- Consumes: entities, `profileOf`, `cittasMatching`, `groupById`, `BAND_LABELS`, `psLabel` (`@/data`); `useSelection`; `CATEGORY_CLASSES`, `BAND_HEADER_CLASSES`, `useMediaQuery`.
- Produces:
  - `interface MatrixColumn { key: string; kind: FilterKind; id: EntityId; labelSi: string }` (`key` = `"<kind>:<id>"`)
  - `interface MatrixBlock { id: string; titleSi: string; headerClass: string; columns: MatrixColumn[] }`
  - `buildBlocks(): MatrixBlock[]` — blocks `kicca`, `cetasika-annasamana`, `cetasika-akusala`, `cetasika-sobhana`, `ps`, `puggala`, `bhumi`
  - `interface Cell { mark: '✓' | '●'; status: Status; note?: string }`, `cellFor(cittaId: number, column: MatrixColumn): Cell | null`
  - `toCsv(blocks?: MatrixBlock[]): string` — UTF-8 BOM, CRLF, header + 89 rows; non-rule cells read `"✓ [chart: note]"`
  - `MatrixView` — `data-testid="matrix-scroll"` wraps the table; body rows carry `data-citta`; cells carry `data-col` and `data-status`.

- [ ] **Step 1: Write the failing tests**

Create `src/views/matrix/columns.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildBlocks, cellFor, type MatrixColumn } from './columns';
import { toCsv } from './csv';

const col = (key: string): MatrixColumn =>
  buildBlocks()
    .flatMap((b) => b.columns)
    .find((c) => c.key === key)!;

describe('buildBlocks', () => {
  it('has 102 columns in 7 blocks', () => {
    const blocks = buildBlocks();
    expect(blocks.map((b) => b.id)).toEqual([
      'kicca',
      'cetasika-annasamana',
      'cetasika-akusala',
      'cetasika-sobhana',
      'ps',
      'puggala',
      'bhumi',
    ]);
    expect(blocks.flatMap((b) => b.columns)).toHaveLength(14 + 52 + 25 + 8 + 3);
  });

  it('orders kicca columns by vīthi order', () => {
    expect(buildBlocks()[0].columns[0].key).toBe('kicca:patisandhi');
    expect(buildBlocks()[0].columns.at(-1)!.key).toBe('kicca:cuti');
  });
});

describe('cellFor', () => {
  it('marks niyata ✓, aniyata ●, absent null', () => {
    expect(cellFor(1, col('cetasika:18'))).toEqual({ mark: '✓', status: 'rule' });
    expect(cellFor(3, col('cetasika:20'))?.mark).toBe('●');
    expect(cellFor(1, col('cetasika:21'))).toBeNull();
    expect(cellFor(19, col('kicca:tadarammana'))?.mark).toBe('✓');
  });

  it('carries review status and note', () => {
    const cell = cellFor(82, col('psLink:avijja-sankhara'));
    expect(cell?.status).toBe('disputed');
    expect(cell?.note).toBeTruthy();
  });
});

describe('toCsv', () => {
  const csv = toCsv();
  const lines = csv.split('\r\n');

  it('starts with a BOM and has a header plus 89 rows', () => {
    expect(csv.startsWith('﻿')).toBe(true);
    expect(lines).toHaveLength(90);
    expect(lines[0]).toContain('"පීති"');
  });

  it('annotates non-rule cells', () => {
    expect(lines[82]).toMatch(/\[disputed: /);
    expect(lines[31]).toMatch(/\[chart: /);
  });
});
```

Create `src/views/matrix/MatrixView.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useSelection } from '@/state/selection';
import { MatrixView } from './MatrixView';

describe('MatrixView', () => {
  it('renders one body row per citta', () => {
    const { container } = render(<MatrixView />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(89);
  });

  it('outlines disputed cells in review mode', async () => {
    const user = userEvent.setup();
    const { container } = render(<MatrixView />);
    const cell = () => container.querySelector('tr[data-citta="82"] td[data-col="psLink:avijja-sankhara"]')!;
    expect(cell().className).not.toMatch(/outline-akusala/);
    await user.click(screen.getByRole('button', { name: 'සමාලෝචන ප්‍රකාරය' }));
    expect(cell()).toHaveAttribute('data-status', 'disputed');
    expect(cell().className).toMatch(/outline-akusala/);
  });

  it('collapses a block', async () => {
    const user = userEvent.setup();
    const { container } = render(<MatrixView />);
    expect(container.querySelectorAll('td[data-col^="psLink:"]').length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: /ඒකචිත්තක්ඛණික පටිච්චසමුප්පාදය/ }));
    expect(container.querySelectorAll('td[data-col^="psLink:"]')).toHaveLength(0);
  });

  it('selects from row and column headers', async () => {
    const user = userEvent.setup();
    render(<MatrixView />);
    await user.click(screen.getByRole('button', { name: /^1\. / }));
    expect(useSelection.getState().selection.citta).toEqual([1]);
    await user.click(screen.getByRole('button', { name: 'පීති' }));
    expect(useSelection.getState().selection).toMatchObject({ citta: [], cetasika: [12] });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/views/matrix`
Expected: FAIL — cannot resolve `./columns`, `./csv`, `./MatrixView`.

- [ ] **Step 3: Implement columns and CSV**

Create `src/views/matrix/columns.ts`:

```ts
import {
  BAND_LABELS,
  BHUMIS,
  CETASIKAS,
  KICCAS,
  PS_LINKS,
  PUGGALAS,
  profileOf,
  psLabel,
  type Band,
  type EntityId,
  type FilterKind,
  type Status,
} from '@/data';
import { BAND_HEADER_CLASSES } from '@/components/colors';

export interface MatrixColumn {
  key: string;
  kind: FilterKind;
  id: EntityId;
  labelSi: string;
}

export interface MatrixBlock {
  id: string;
  titleSi: string;
  headerClass: string;
  columns: MatrixColumn[];
}

const column = (kind: FilterKind, id: EntityId, labelSi: string): MatrixColumn => ({
  key: `${kind}:${id}`,
  kind,
  id,
  labelSi,
});

const BANDS: Band[] = ['annasamana', 'akusala', 'sobhana'];

export function buildBlocks(): MatrixBlock[] {
  return [
    {
      id: 'kicca',
      titleSi: 'චිත්ත කෘත්‍ය',
      headerClass: 'bg-line',
      columns: [...KICCAS].sort((a, b) => a.vithiOrder - b.vithiOrder).map((k) => column('kicca', k.id, k.nameSi)),
    },
    ...BANDS.map((band) => ({
      id: `cetasika-${band}`,
      titleSi: `${BAND_LABELS[band]} චෛතසික`,
      headerClass: BAND_HEADER_CLASSES[band],
      columns: CETASIKAS.filter((c) => c.band === band).map((c) => column('cetasika', c.id, c.nameSi)),
    })),
    {
      id: 'ps',
      titleSi: 'ඒකචිත්තක්ඛණික පටිච්චසමුප්පාදය',
      headerClass: 'bg-line',
      columns: PS_LINKS.map((l) => column('psLink', l.id, psLabel(l))),
    },
    {
      id: 'puggala',
      titleSi: 'පුද්ගලයන්ට ලැබෙන සිත්',
      headerClass: 'bg-line',
      columns: PUGGALAS.map((p) => column('puggala', p.id, p.nameSi)),
    },
    {
      id: 'bhumi',
      titleSi: 'භූමි වලට ලැබෙන සිත්',
      headerClass: 'bg-line',
      columns: BHUMIS.map((b) => column('bhumi', b.id, b.nameSi)),
    },
  ];
}

export interface Cell {
  mark: '✓' | '●';
  status: Status;
  note?: string;
}

const present = (r: { status: Status; note?: string } | undefined, mark: Cell['mark'] = '✓'): Cell | null =>
  r ? { mark, status: r.status, ...(r.note ? { note: r.note } : {}) } : null;

export function cellFor(cittaId: number, col: MatrixColumn): Cell | null {
  const p = profileOf(cittaId);
  switch (col.kind) {
    case 'cetasika': {
      const r = p.cetasikas.find((x) => x.cetasika === col.id);
      return present(r, r?.kind === 'aniyata' ? '●' : '✓');
    }
    case 'kicca':
      return present(p.kiccas.find((x) => x.kicca === col.id));
    case 'psLink':
      return present(p.psLinks.find((x) => x.psLink === col.id));
    case 'puggala':
      return present(p.puggalas.find((x) => x.puggala === col.id));
    case 'bhumi':
      return present(p.bhumis.find((x) => x.bhumi === col.id));
  }
}
```

Create `src/views/matrix/csv.ts`:

```ts
import { CITTAS } from '@/data';
import { buildBlocks, cellFor, type MatrixBlock } from './columns';

const quote = (s: string) => `"${s.replaceAll('"', '""')}"`;

export function toCsv(blocks: MatrixBlock[] = buildBlocks()): string {
  const cols = blocks.flatMap((b) => b.columns);
  const header = ['අංකය', 'සිත', ...cols.map((c) => c.labelSi)].map(quote).join(',');
  const rows = CITTAS.map((citta) =>
    [
      String(citta.id),
      citta.nameSi,
      ...cols.map((c) => {
        const cell = cellFor(citta.id, c);
        if (!cell) return '';
        if (cell.status === 'rule') return cell.mark;
        return `${cell.mark} [${cell.status}${cell.note ? `: ${cell.note}` : ''}]`;
      }),
    ]
      .map(quote)
      .join(','),
  );
  return `﻿${[header, ...rows].join('\r\n')}`;
}
```

- [ ] **Step 4: Implement the matrix view and route**

Create `src/views/matrix/MatrixView.tsx`:

```tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { CITTAS, cittasMatching, groupById, type EntityId } from '@/data';
import { CATEGORY_CLASSES } from '@/components/colors';
import { useMediaQuery } from '@/components/hooks';
import { useSelection } from '@/state/selection';
import { buildBlocks, cellFor } from './columns';
import { toCsv } from './csv';

const BTN = 'min-h-11 rounded-md border border-line px-3 hover:bg-hover aria-pressed:bg-fg aria-pressed:text-bg';

export function MatrixView() {
  const blocks = useMemo(buildBlocks, []);
  const cells = useMemo(
    () => new Map(CITTAS.map((ct) => [ct.id, new Map(blocks.flatMap((b) => b.columns).map((c) => [c.key, cellFor(ct.id, c)]))])),
    [blocks],
  );
  const isPhone = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1279px)');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  useEffect(() => {
    setCollapsed(new Set(isPhone ? blocks.filter((b) => b.id !== 'kicca').map((b) => b.id) : isTablet ? ['ps'] : []));
  }, [isPhone, isTablet, blocks]);
  const [review, setReview] = useState(false);
  const [hoverCol, setHoverCol] = useState<string | null>(null);
  const selection = useSelection((s) => s.selection);
  const select = useSelection((s) => s.select);
  const matching = useMemo(() => cittasMatching(selection), [selection]);

  const toggleBlock = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const download = () => {
    const url = URL.createObjectURL(new Blob([toCsv(blocks)], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'citta-data-review.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isSelected = (kind: string, id: EntityId) =>
    (selection[kind as keyof typeof selection] as EntityId[]).includes(id);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={BTN} aria-pressed={review} onClick={() => setReview((r) => !r)}>
          සමාලෝචන ප්‍රකාරය
        </button>
        <button type="button" className={BTN} onClick={download}>
          CSV බාගන්න
        </button>
        {review && (
          <span className="text-sm text-muted">තිත් රාමුව = චාර්ටයෙන් පමණි · රතු රාමුව = විවාදාත්මක</span>
        )}
      </div>
      {hoverCol && <style>{`[data-col="${hoverCol}"]{background:var(--color-hover)}`}</style>}
      <div data-testid="matrix-scroll" className="max-h-[calc(100dvh-11rem)] overflow-auto rounded-lg border border-line">
        <table className="border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-20 bg-surface">
            <tr>
              <th rowSpan={2} className="sticky left-0 z-30 border-b border-line bg-surface px-2 text-left align-bottom">
                සිත
              </th>
              {blocks.map((b) => (
                <th
                  key={b.id}
                  colSpan={collapsed.has(b.id) ? 1 : b.columns.length}
                  className={`${b.headerClass} border-l border-line px-2 text-left`}
                >
                  <button
                    type="button"
                    className="min-h-11 whitespace-nowrap font-bold"
                    aria-expanded={!collapsed.has(b.id)}
                    onClick={() => toggleBlock(b.id)}
                  >
                    {collapsed.has(b.id) ? '▸' : '▾'} {b.titleSi}
                  </button>
                </th>
              ))}
            </tr>
            <tr>
              {blocks.flatMap((b) =>
                collapsed.has(b.id)
                  ? [
                      <th key={`${b.id}-collapsed`} className="border-b border-l border-line px-2">
                        …
                      </th>,
                    ]
                  : b.columns.map((c) => (
                      <th
                        key={c.key}
                        data-col={c.key}
                        onMouseEnter={() => setHoverCol(c.key)}
                        onMouseLeave={() => setHoverCol(null)}
                        className="h-40 border-b border-line px-0.5 align-bottom"
                      >
                        <button
                          type="button"
                          aria-label={c.labelSi}
                          aria-pressed={isSelected(c.kind, c.id)}
                          onClick={(e) => select(c.kind, c.id, e.shiftKey)}
                          className="rotate-180 whitespace-nowrap px-1 py-1 text-xs [writing-mode:vertical-rl] aria-pressed:font-bold aria-pressed:underline"
                        >
                          {c.labelSi}
                        </button>
                      </th>
                    )),
              )}
            </tr>
          </thead>
          <tbody>
            {CITTAS.map((ct) => {
              const on = selection.citta.includes(ct.id) || (matching?.has(ct.id) ?? false);
              const dim = matching !== null && !matching.has(ct.id);
              const category = groupById.get(ct.group)!.category;
              return (
                <tr
                  key={ct.id}
                  data-citta={ct.id}
                  data-state={on ? 'on' : dim ? 'dim' : 'normal'}
                  className={`[&:hover>td]:bg-hover ${dim ? 'opacity-40' : ''}`}
                >
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 max-w-[15rem] border-b border-line bg-surface px-2 py-1 text-left font-normal ${on ? 'font-bold' : ''}`}
                  >
                    <button
                      type="button"
                      aria-label={`${ct.id}. ${ct.nameSi}`}
                      onClick={(e) => select('citta', ct.id, e.shiftKey)}
                      className="flex min-h-11 items-center gap-1 text-left"
                    >
                      <span className={`inline-block min-w-7 rounded px-1 text-center text-xs ${CATEGORY_CLASSES[category]}`}>
                        {ct.id}
                      </span>
                      {ct.short}
                    </button>
                  </th>
                  {blocks.flatMap((b) =>
                    collapsed.has(b.id)
                      ? [<td key={b.id} className="border-b border-l border-line" />]
                      : b.columns.map((c) => {
                          const cell = cells.get(ct.id)!.get(c.key) ?? null;
                          const outline =
                            review && cell && cell.status !== 'rule'
                              ? cell.status === 'disputed'
                                ? 'outline outline-2 -outline-offset-2 outline-akusala'
                                : 'outline outline-1 -outline-offset-2 outline-dashed outline-muted'
                              : '';
                          return (
                            <td
                              key={c.key}
                              data-col={c.key}
                              data-status={cell?.status}
                              title={cell?.note}
                              className={`border-b border-line text-center ${outline}`}
                            >
                              {cell?.mark ?? ''}
                            </td>
                          );
                        }),
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

Create `src/app/matrix/page.tsx`:

```tsx
import { MatrixView } from '@/views/matrix/MatrixView';

export default function MatrixPage() {
  return <MatrixView />;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/views/matrix`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/views/matrix src/app/matrix
git commit -m "feat(matrix): add full-chart table with review mode and CSV export

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 12: Relationship graph (focus-centred rings, grouping cap)

**Files:**
- Create: `src/views/graph/buildGraph.ts`, `src/views/graph/GraphView.tsx`, `src/app/graph/page.tsx`
- Test: `src/views/graph/buildGraph.test.ts`

**Interfaces:**
- Consumes: `profileOf`, `cittasFor`, `cittaById`, `cetasikaById`, `groupById`, `kiccaById`, `psLinkById`, `psLabel`, `puggalaById`, `bhumiById`, `labelOf`, `SUBGROUP_LABELS`, `FILTER_KINDS`, `Selection` (`@/data`); `CATEGORY_TONE`; `useSelection`; `useMediaQuery`.
- Produces:
  - `type RelKind = 'cetasika' | 'kicca' | 'psLink' | 'puggala' | 'bhumi'`, `ALL_KINDS: RelKind[]`
  - `interface Focus { kind: EntityKind; id: EntityId }`
  - `interface GraphNode { id: string; kind: EntityKind | 'group'; entityId?: EntityId; label: string; tone: string; x: number; y: number; groupKey?: string; count?: number; dashed: boolean; isFocus?: boolean }`
  - `interface GraphEdge { id: string; source: string; target: string; dashed: boolean }`
  - `buildGraph(focus: Focus, opts: { kinds: RelKind[]; cap: number; expanded: string[] }): { nodes: GraphNode[]; edges: GraphEdge[] }`
  - `focusFromSelection(sel: Selection): Focus`
  - `GraphView` (`data-testid="graph"`)

Rules: a citta focus shows its related entities (one ring, sectors in kind order); any other focus shows its cittas. If neighbours exceed `cap`, they collapse into group nodes (cetasika subgroup, or the kind itself, or citta group), except groups listed in `expanded`. Node `tone` is a `--color-<tone>` suffix.

- [ ] **Step 1: Write the failing tests**

Create `src/views/graph/buildGraph.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { emptySelection } from '@/data';
import { ALL_KINDS, buildGraph, focusFromSelection } from './buildGraph';

describe('buildGraph', () => {
  it('shows every neighbour of citta 31 when under the cap', () => {
    const g = buildGraph({ kind: 'citta', id: 31 }, { kinds: ALL_KINDS, cap: 100, expanded: [] });
    expect(g.nodes).toHaveLength(62); // focus + 38 cetasika + 1 kicca + 12 PS + 7 puggala + 3 bhūmi
    expect(g.edges).toHaveLength(61);
    expect(g.nodes[0]).toMatchObject({ id: 'focus', isFocus: true, x: 0, y: 0, label: '31. මහා කුසල 1' });
  });

  it('groups neighbours above the cap and expands a chosen group', () => {
    const grouped = buildGraph({ kind: 'citta', id: 31 }, { kinds: ALL_KINDS, cap: 60, expanded: [] });
    expect(grouped.nodes).toHaveLength(11); // focus + 6 cetasika subgroups + kicca + PS + puggala + bhūmi
    expect(grouped.nodes.find((n) => n.id === 'grp:cetasika:pakinnaka')).toMatchObject({ kind: 'group', count: 6 });
    const expanded = buildGraph(
      { kind: 'citta', id: 31 },
      { kinds: ALL_KINDS, cap: 60, expanded: ['cetasika:pakinnaka'] },
    );
    expect(expanded.nodes).toHaveLength(16);
  });

  it('filters by relation kind', () => {
    const g = buildGraph({ kind: 'citta', id: 1 }, { kinds: ['kicca', 'bhumi'], cap: 60, expanded: [] });
    expect(g.nodes.map((n) => n.id)).toEqual(['focus', 'kicca:javana', 'bhumi:kama', 'bhumi:rupa', 'bhumi:arupa']);
  });

  it('shows the cittas around a cetasika, grouped under a small cap', () => {
    expect(buildGraph({ kind: 'cetasika', id: 12 }, { kinds: ALL_KINDS, cap: 60, expanded: [] }).nodes).toHaveLength(36);
    const phone = buildGraph({ kind: 'cetasika', id: 12 }, { kinds: ALL_KINDS, cap: 30, expanded: [] });
    expect(phone.nodes).toHaveLength(12);
    expect(phone.nodes.find((n) => n.id === 'grp:group:lobhamula')?.label).toBe('ලෝභමූල සිත් 4');
  });

  it('groups the 89 cittas of a universal cetasika into 17 groups', () => {
    expect(buildGraph({ kind: 'cetasika', id: 1 }, { kinds: ALL_KINDS, cap: 60, expanded: [] }).nodes).toHaveLength(18);
  });

  it('dashes edges to aniyata cetasikas', () => {
    const g = buildGraph({ kind: 'citta', id: 3 }, { kinds: ['cetasika'], cap: 60, expanded: [] });
    expect(g.edges.find((e) => e.target === 'cetasika:20')?.dashed).toBe(true);
    expect(g.edges.find((e) => e.target === 'cetasika:18')?.dashed).toBe(false);
  });

  it('places ring nodes around the origin without duplicates', () => {
    const g = buildGraph({ kind: 'citta', id: 31 }, { kinds: ALL_KINDS, cap: 100, expanded: [] });
    expect(new Set(g.nodes.map((n) => n.id)).size).toBe(g.nodes.length);
    for (const n of g.nodes.slice(1)) expect(Math.hypot(n.x, n.y)).toBeGreaterThan(200);
  });
});

describe('focusFromSelection', () => {
  it('prefers the first citta, then the first filter, then citta 1', () => {
    expect(focusFromSelection({ ...emptySelection(), citta: [5], cetasika: [12] })).toEqual({ kind: 'citta', id: 5 });
    expect(focusFromSelection({ ...emptySelection(), puggala: ['arahant'] })).toEqual({ kind: 'puggala', id: 'arahant' });
    expect(focusFromSelection(emptySelection())).toEqual({ kind: 'citta', id: 1 });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/views/graph`
Expected: FAIL — cannot resolve `./buildGraph`.

- [ ] **Step 3: Implement buildGraph**

Create `src/views/graph/buildGraph.ts`:

```ts
import {
  FILTER_KINDS,
  SUBGROUP_LABELS,
  bhumiById,
  cetasikaById,
  cittaById,
  cittasFor,
  groupById,
  kiccaById,
  labelOf,
  profileOf,
  psLabel,
  psLinkById,
  puggalaById,
  type EntityId,
  type EntityKind,
  type FilterKind,
  type Selection,
} from '@/data';
import { CATEGORY_TONE } from '@/components/colors';

export type RelKind = FilterKind;
export const ALL_KINDS: RelKind[] = ['cetasika', 'kicca', 'psLink', 'puggala', 'bhumi'];

export interface Focus {
  kind: EntityKind;
  id: EntityId;
}

export interface GraphNode {
  id: string;
  kind: EntityKind | 'group';
  entityId?: EntityId;
  label: string;
  tone: string;
  x: number;
  y: number;
  groupKey?: string;
  count?: number;
  dashed: boolean;
  isFocus?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  dashed: boolean;
}

interface Item {
  kind: EntityKind;
  entityId: EntityId;
  label: string;
  tone: string;
  groupKey: string;
  groupLabel: string;
  dashed: boolean;
}

type Placed = Omit<GraphNode, 'x' | 'y'>;

function neighboursOfCitta(id: number, kinds: RelKind[]): Item[] {
  const p = profileOf(id);
  const out: Item[] = [];
  if (kinds.includes('cetasika'))
    for (const r of p.cetasikas) {
      const c = cetasikaById.get(r.cetasika)!;
      out.push({
        kind: 'cetasika',
        entityId: c.id,
        label: c.nameSi,
        tone: `band-${c.band}`,
        groupKey: `cetasika:${c.subgroup}`,
        groupLabel: SUBGROUP_LABELS[c.subgroup],
        dashed: r.kind === 'aniyata' || r.status !== 'rule',
      });
    }
  if (kinds.includes('kicca'))
    for (const r of p.kiccas)
      out.push({
        kind: 'kicca',
        entityId: r.kicca,
        label: kiccaById.get(r.kicca)!.nameSi,
        tone: 'muted',
        groupKey: 'kicca',
        groupLabel: 'කෘත්‍ය',
        dashed: r.status !== 'rule',
      });
  if (kinds.includes('psLink'))
    for (const r of p.psLinks)
      out.push({
        kind: 'psLink',
        entityId: r.psLink,
        label: psLabel(psLinkById.get(r.psLink)!),
        tone: 'muted',
        groupKey: 'psLink',
        groupLabel: 'පටිච්චසමුප්පාද',
        dashed: r.status !== 'rule',
      });
  if (kinds.includes('puggala'))
    for (const r of p.puggalas)
      out.push({
        kind: 'puggala',
        entityId: r.puggala,
        label: puggalaById.get(r.puggala)!.nameSi,
        tone: 'fg',
        groupKey: 'puggala',
        groupLabel: 'පුද්ගල',
        dashed: r.status !== 'rule',
      });
  if (kinds.includes('bhumi'))
    for (const r of p.bhumis)
      out.push({
        kind: 'bhumi',
        entityId: r.bhumi,
        label: bhumiById.get(r.bhumi)!.nameSi,
        tone: 'fg',
        groupKey: 'bhumi',
        groupLabel: 'භූමි',
        dashed: r.status !== 'rule',
      });
  return out;
}

function neighboursOfEntity(kind: FilterKind, id: EntityId): Item[] {
  return [...cittasFor(kind, id)]
    .sort((a, b) => a - b)
    .map((cid) => {
      const c = cittaById.get(cid)!;
      const g = groupById.get(c.group)!;
      return {
        kind: 'citta',
        entityId: cid,
        label: labelOf('citta', cid),
        tone: CATEGORY_TONE[g.category],
        groupKey: `group:${g.id}`,
        groupLabel: g.nameSi,
        dashed: false,
      };
    });
}

const toNode = (it: Item): Placed => ({
  id: `${it.kind}:${it.entityId}`,
  kind: it.kind,
  entityId: it.entityId,
  label: it.label,
  tone: it.tone,
  groupKey: it.groupKey,
  dashed: it.dashed,
});

function focusTone(focus: Focus): string {
  if (focus.kind === 'citta') {
    const c = cittaById.get(Number(focus.id));
    return c ? CATEGORY_TONE[groupById.get(c.group)!.category] : 'fg';
  }
  if (focus.kind === 'cetasika') {
    const c = cetasikaById.get(Number(focus.id));
    return c ? `band-${c.band}` : 'fg';
  }
  return 'fg';
}

function placeRing(items: Placed[]): GraphNode[] {
  const n = items.length;
  const radius = Math.max(240, (n * 70) / (2 * Math.PI));
  const stagger = n > 24;
  return items.map((it, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const r = stagger && i % 2 === 1 ? radius + 90 : radius;
    return { ...it, x: Math.round(r * Math.cos(angle)), y: Math.round(r * Math.sin(angle)) };
  });
}

export function buildGraph(
  focus: Focus,
  opts: { kinds: RelKind[]; cap: number; expanded: string[] },
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const items =
    focus.kind === 'citta' ? neighboursOfCitta(Number(focus.id), opts.kinds) : neighboursOfEntity(focus.kind, focus.id);

  let ringItems: Placed[];
  if (items.length <= opts.cap) {
    ringItems = items.map(toNode);
  } else {
    const groups = new Map<string, Item[]>();
    for (const it of items) groups.set(it.groupKey, [...(groups.get(it.groupKey) ?? []), it]);
    ringItems = [...groups].flatMap(([key, members]): Placed[] =>
      opts.expanded.includes(key)
        ? members.map(toNode)
        : [
            {
              id: `grp:${key}`,
              kind: 'group',
              label: `${members[0].groupLabel} ${members.length}`,
              tone: members[0].tone,
              groupKey: key,
              count: members.length,
              dashed: false,
            },
          ],
    );
  }

  const focusNode: GraphNode = {
    id: 'focus',
    kind: focus.kind,
    entityId: focus.id,
    label: labelOf(focus.kind, focus.id),
    tone: focusTone(focus),
    x: 0,
    y: 0,
    dashed: false,
    isFocus: true,
  };
  const ring = placeRing(ringItems);
  return {
    nodes: [focusNode, ...ring],
    edges: ring.map((n) => ({ id: `e:${n.id}`, source: 'focus', target: n.id, dashed: n.dashed })),
  };
}

export function focusFromSelection(sel: Selection): Focus {
  if (sel.citta.length > 0) return { kind: 'citta', id: sel.citta[0] };
  for (const kind of FILTER_KINDS) {
    const first = (sel[kind] as EntityId[])[0];
    if (first !== undefined) return { kind, id: first };
  }
  return { kind: 'citta', id: 1 };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/views/graph`
Expected: PASS (8 tests).

- [ ] **Step 5: Implement the React Flow view and route**

Create `src/views/graph/GraphView.tsx`:

```tsx
'use client';

import { Background, Controls, ReactFlow, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from '@/components/hooks';
import { useSelection } from '@/state/selection';
import { ALL_KINDS, buildGraph, focusFromSelection, type GraphNode, type RelKind } from './buildGraph';

const KIND_LABELS: Record<RelKind, string> = {
  cetasika: 'චෛතසික',
  kicca: 'කෘත්‍ය',
  psLink: 'පටිච්චසමුප්පාද',
  puggala: 'පුද්ගල',
  bhumi: 'භූමි',
};
const DARK_TEXT = new Set(['ahetuka', 'lokuttara', 'band-sobhana']);

function nodeStyle(n: GraphNode) {
  const color = n.tone === 'fg' ? 'var(--color-bg)' : DARK_TEXT.has(n.tone) ? '#111' : '#fff';
  return {
    background: `var(--color-${n.tone})`,
    color,
    border: n.kind === 'group' ? '2px dashed var(--color-fg)' : '1px solid var(--color-line)',
    fontSize: n.isFocus ? 18 : 13,
    fontWeight: n.isFocus ? 700 : 400,
  };
}

export function GraphView() {
  const selection = useSelection((s) => s.selection);
  const select = useSelection((s) => s.select);
  const isPhone = useMediaQuery('(max-width: 767px)');
  const [kinds, setKinds] = useState<RelKind[]>(ALL_KINDS);
  useEffect(() => setKinds(isPhone ? ['cetasika', 'kicca'] : ALL_KINDS), [isPhone]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const focus = focusFromSelection(selection);
  const focusKey = `${focus.kind}:${focus.id}`;
  useEffect(() => setExpanded([]), [focusKey]);

  const graph = useMemo(
    () => buildGraph(focus, { kinds, cap: isPhone ? 30 : 60, expanded }),
    // focus is derived from focusKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusKey, kinds, isPhone, expanded],
  );
  const byId = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph]);
  const nodes: Node[] = graph.nodes.map((n) => ({
    id: n.id,
    position: { x: n.x, y: n.y },
    data: { label: n.label },
    className: 'graph-node',
    style: nodeStyle(n),
    draggable: false,
    connectable: false,
  }));
  const edges: Edge[] = graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    style: e.dashed ? { strokeDasharray: '4 4' } : undefined,
  }));

  const refocus = (n: GraphNode | undefined) => {
    if (!n || n.isFocus || n.kind === 'group' || n.entityId === undefined) return;
    select(n.kind, n.entityId, false);
  };
  const toggleGroup = (key: string) =>
    setExpanded((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  const toggleKind = (k: RelKind) =>
    setKinds((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : ALL_KINDS.filter((x) => x === k || prev.includes(x))));

  return (
    <div className="space-y-2">
      {focus.kind === 'citta' && (
        <div className="flex flex-wrap gap-1.5">
          {ALL_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kinds.includes(k)}
              onClick={() => toggleKind(k)}
              className="min-h-11 rounded-full border-2 border-fg px-3 aria-pressed:bg-fg aria-pressed:text-bg"
            >
              {KIND_LABELS[k]}
            </button>
          ))}
        </div>
      )}
      <p className="text-sm text-muted">
        {isPhone ? 'තට්ටු කර' : 'ද්විත්ව-ක්ලික් කර'} කේන්ද්‍රය වෙනස් කරන්න · කණ්ඩායම් නෝඩ් මත ක්ලික් කර විහිදන්න
      </p>
      <div data-testid="graph" className="h-[calc(100dvh-15rem)] min-h-[360px] rounded-lg border border-line bg-surface">
        <ReactFlow
          key={`${focusKey}|${kinds.join()}|${expanded.join()}`}
          nodes={nodes}
          edges={edges}
          fitView
          minZoom={0.2}
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnDoubleClick={false}
          onNodeClick={(_, node) => {
            const n = byId.get(node.id);
            if (n?.kind === 'group' && n.groupKey) toggleGroup(n.groupKey);
            else if (isPhone) refocus(n);
          }}
          onNodeDoubleClick={(_, node) => refocus(byId.get(node.id))}
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
```

Create `src/app/graph/page.tsx`:

```tsx
import { GraphView } from '@/views/graph/GraphView';

export default function GraphPage() {
  return <GraphView />;
}
```

- [ ] **Step 6: Typecheck and look at it**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run dev`, open `http://localhost:3000/graph?c=31`: 11 nodes (grouped). Click "සෝභන සාධාරණ 19" to expand it; double-click "පීති" to refocus on pīti (36 nodes). Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add src/views/graph src/app/graph
git commit -m "feat(graph): add focus-centred relationship graph with grouping cap

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 13: Presentation mode (scenes, keyboard, swipe, freeze)

**Files:**
- Create: `src/present/scenes.ts`, `src/present/presenter.ts`, `src/present/PresentView.tsx`, `src/app/present/page.tsx`
- Test: `src/present/presenter.test.ts`, `src/present/PresentView.test.tsx`

**Interfaces:**
- Consumes: `cittasFor`, `emptySelection`, `parseEntityId`, `kiccaById`, `labelOf`, `Selection`, `EntityKind` (`@/data`); `range`; `useSelection`; `ExplorerView` (Task 10); `GraphView` (Task 12).
- Produces:
  - `interface SceneStep { view: 'explorer' | 'graph'; select: Partial<Selection>; captionSi: string }`, `interface Scene { id: string; titleSi: string; steps: SceneStep[] }`, `SCENES: Scene[]`
  - `interface PresenterState { stepIdx: number; frozen: boolean; captionHidden: boolean }`, `INITIAL_PRESENTER`, `presenterReducer(state, action)` with actions `{type:'next', total}`, `{type:'prev'}`, `{type:'freeze'}`, `{type:'toggleCaption'}`, `{type:'reset'}`
  - `PresentView` (`data-testid="presenter"`, caption `data-testid="caption"`, overlay `data-testid="freeze-overlay"`)

Keys: `→` / `PageDown` / `Space` next, `←` / `PageUp` previous, `Esc` back to the scene list, `F` freeze (an invisible overlay swallows clicks). Touch: swipe left/right (>60px) to step; tap the caption to hide/show it.

- [ ] **Step 1: Write the failing tests**

Create `src/present/presenter.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { emptySelection, parseEntityId, type EntityId, type EntityKind } from '@/data';
import { INITIAL_PRESENTER, presenterReducer } from './presenter';
import { SCENES } from './scenes';

describe('presenterReducer', () => {
  it('steps forward and back within bounds (Review Focus #4)', () => {
    let s = INITIAL_PRESENTER;
    s = presenterReducer(s, { type: 'prev' });
    expect(s.stepIdx).toBe(0);
    for (let i = 0; i < 10; i++) s = presenterReducer(s, { type: 'next', total: 3 });
    expect(s.stepIdx).toBe(2);
    s = presenterReducer(s, { type: 'prev' });
    expect(s.stepIdx).toBe(1);
  });

  it('toggles freeze and caption, and resets', () => {
    let s = presenterReducer(INITIAL_PRESENTER, { type: 'freeze' });
    s = presenterReducer(s, { type: 'toggleCaption' });
    expect(s).toMatchObject({ frozen: true, captionHidden: true });
    expect(presenterReducer(s, { type: 'reset' })).toEqual(INITIAL_PRESENTER);
  });
});

describe('SCENES', () => {
  it('has 5 scenes, each with captioned steps', () => {
    expect(SCENES).toHaveLength(5);
    for (const scene of SCENES) {
      expect(scene.steps.length).toBeGreaterThan(0);
      for (const step of scene.steps) expect(step.captionSi.trim()).not.toBe('');
    }
  });

  it('only references valid entity ids', () => {
    for (const scene of SCENES)
      for (const step of scene.steps)
        for (const [kind, ids] of Object.entries({ ...emptySelection(), ...step.select }))
          for (const id of ids as EntityId[])
            expect(parseEntityId(kind as EntityKind, String(id)), `${scene.id}: ${kind}=${id}`).not.toBeNull();
  });
});
```

Create `src/present/PresentView.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useSelection } from '@/state/selection';
import { PresentView } from './PresentView';

vi.mock('@/views/graph/GraphView', () => ({ GraphView: () => <div>graph</div> }));

const key = (k: string) => fireEvent.keyDown(window, { key: k });

describe('PresentView', () => {
  it('runs a scene with the keyboard', async () => {
    const user = userEvent.setup();
    render(<PresentView />);
    await user.click(screen.getByRole('button', { name: /අකුසල චෛතසික එකින් එක/ }));
    expect(screen.getByTestId('caption')).toHaveTextContent('මෝහ');
    expect(useSelection.getState().selection.cetasika).toEqual([14]);

    key('ArrowRight');
    expect(useSelection.getState().selection.cetasika).toEqual([15]);

    for (let i = 0; i < 20; i++) key('ArrowRight');
    expect(screen.getByText('8 / 8')).toBeInTheDocument();

    key('f');
    expect(screen.getByTestId('freeze-overlay')).toBeInTheDocument();

    key('Escape');
    expect(screen.getByRole('heading', { name: 'ඉදිරිපත් කිරීම් දර්ශන' })).toBeInTheDocument();
  });

  it('steps with a touch swipe', async () => {
    const user = userEvent.setup();
    render(<PresentView />);
    await user.click(screen.getByRole('button', { name: /අකුසල චෛතසික එකින් එක/ }));
    const stage = screen.getByTestId('presenter');
    fireEvent.pointerDown(stage, { pointerType: 'touch', clientX: 300 });
    fireEvent.pointerUp(stage, { pointerType: 'touch', clientX: 100 });
    expect(screen.getByText('2 / 8')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/present`
Expected: FAIL — cannot resolve `./presenter`, `./scenes`, `./PresentView`.

- [ ] **Step 3: Implement reducer and scenes**

Create `src/present/presenter.ts`:

```ts
export interface PresenterState {
  stepIdx: number;
  frozen: boolean;
  captionHidden: boolean;
}

export type PresenterAction =
  | { type: 'next'; total: number }
  | { type: 'prev' }
  | { type: 'freeze' }
  | { type: 'toggleCaption' }
  | { type: 'reset' };

export const INITIAL_PRESENTER: PresenterState = { stepIdx: 0, frozen: false, captionHidden: false };

export function presenterReducer(state: PresenterState, action: PresenterAction): PresenterState {
  switch (action.type) {
    case 'next':
      return { ...state, stepIdx: Math.max(0, Math.min(state.stepIdx + 1, action.total - 1)) };
    case 'prev':
      return { ...state, stepIdx: Math.max(0, state.stepIdx - 1) };
    case 'freeze':
      return { ...state, frozen: !state.frozen };
    case 'toggleCaption':
      return { ...state, captionHidden: !state.captionHidden };
    case 'reset':
      return INITIAL_PRESENTER;
  }
}
```

Create `src/present/scenes.ts`:

```ts
import { cittasFor, kiccaById, labelOf, type FilterKind, type EntityId, type KiccaId, type Selection } from '@/data';
import { range } from '@/data/range';

export interface SceneStep {
  view: 'explorer' | 'graph';
  select: Partial<Selection>;
  captionSi: string;
}

export interface Scene {
  id: string;
  titleSi: string;
  steps: SceneStep[];
}

const n = (kind: FilterKind, id: EntityId) => cittasFor(kind, id).size;
const ex = (select: Partial<Selection>, captionSi: string): SceneStep => ({ view: 'explorer', select, captionSi });
const cet = (id: number, note: string) => ex({ cetasika: [id] }, `${labelOf('cetasika', id)} — සිත් ${n('cetasika', id)} (${note})`);

const VITHI: KiccaId[] = [
  'patisandhi',
  'bhavanga',
  'avajjana',
  'dassana',
  'sampaticchana',
  'santirana',
  'votthapana',
  'javana',
  'tadarammana',
  'cuti',
];

export const SCENES: Scene[] = [
  {
    id: 'spheres',
    titleSi: 'සිත් 89 — භූමි අනුව',
    steps: [
      ex({}, 'චිත්ත 89ම'),
      ex({ citta: range(1, 54) }, 'කාමාවචර සිත් 54'),
      ex({ citta: range(55, 69) }, 'රූපාවචර සිත් 15'),
      ex({ citta: range(70, 81) }, 'අරූපාවචර සිත් 12'),
      ex({ citta: range(82, 89) }, 'ලෝකෝත්තර සිත් 8'),
    ],
  },
  {
    id: 'akusala',
    titleSi: 'අකුසල චෛතසික එකින් එක',
    steps: [
      cet(14, 'සියලු අකුසල සිත්'),
      cet(15, 'සියලු අකුසල සිත්'),
      cet(18, 'ලෝභමූල'),
      cet(19, 'දෘෂ්ටිගත සම්ප්‍රයුක්ත'),
      cet(20, 'දෘෂ්ටිගත විප්‍රයුක්ත — අනියත'),
      cet(21, 'ද්වේෂමූල'),
      cet(25, 'සසංස්කාරික — අනියත'),
      cet(27, 'එක් සිතක් පමණි'),
    ],
  },
  {
    id: 'vithi',
    titleSi: 'චිත්ත වීථිය',
    steps: VITHI.map((k) => ex({ kicca: [k] }, `${kiccaById.get(k)!.nameSi} — සිත් ${n('kicca', k)}`)),
  },
  {
    id: 'ariya',
    titleSi: 'ආර්‍ය පුද්ගලයන්ට ලැබෙන සිත්',
    steps: [
      ...(['tihetuka', 'sotapanna', 'anagami', 'arahant'] as const).map((p) =>
        ex({ puggala: [p] }, `${labelOf('puggala', p)} — සිත් ${n('puggala', p)}`),
      ),
      { view: 'graph', select: { puggala: ['arahant'] }, captionSi: 'අර්හත් — සම්බන්ධතා ජාලය' },
    ],
  },
  {
    id: 'ps',
    titleSi: 'එක් සිතක් තුළ පටිච්චසමුප්පාදය',
    steps: [
      ex({ citta: [1] }, 'ලෝභමූල (දෘෂ්ටිගත) — තණ්හා පච්චයා උපාදාන'),
      ex({ citta: [3] }, 'ලෝභමූල (දෘෂ්ටි විප්‍රයුක්ත) — තණ්හා පච්චයා අධිමොක්ඛ'),
      ex({ citta: [9] }, 'ද්වේෂමූල — වේදනා පච්චයා පටිඝ'),
      ex({ citta: [11] }, 'විචිකිච්ඡා — වේදනා පච්චයා විචිකිච්ඡා'),
      ex({ citta: [31] }, 'කුසල — වේදනා පච්චයා පසාද'),
      ex({ citta: [13] }, 'චක්ඛු විඤ්ඤාණය — වේදනා පච්චයා භව'),
    ],
  },
];
```

- [ ] **Step 4: Implement the player and route**

Create `src/present/PresentView.tsx`:

```tsx
'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { emptySelection } from '@/data';
import { useSelection } from '@/state/selection';
import { ExplorerView } from '@/views/explorer/ExplorerView';
import { GraphView } from '@/views/graph/GraphView';
import { INITIAL_PRESENTER, presenterReducer } from './presenter';
import { SCENES } from './scenes';

const NEXT_KEYS = ['ArrowRight', 'PageDown', ' '];
const PREV_KEYS = ['ArrowLeft', 'PageUp'];

export function PresentView() {
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [state, dispatch] = useReducer(presenterReducer, INITIAL_PRESENTER);
  const setSelection = useSelection((s) => s.set);
  const scene = SCENES.find((s) => s.id === sceneId) ?? null;
  const step = scene?.steps[state.stepIdx];
  const swipeStart = useRef<number | null>(null);

  useEffect(() => {
    if (step) setSelection({ ...emptySelection(), ...step.select });
  }, [step, setSelection]);

  const exit = useCallback(() => {
    setSceneId(null);
    dispatch({ type: 'reset' });
    if (document.fullscreenElement) document.exitFullscreen()?.catch(() => {});
  }, []);

  useEffect(() => {
    if (!scene) return;
    const total = scene.steps.length;
    const onKey = (e: KeyboardEvent) => {
      if (NEXT_KEYS.includes(e.key)) {
        e.preventDefault();
        dispatch({ type: 'next', total });
      } else if (PREV_KEYS.includes(e.key)) {
        e.preventDefault();
        dispatch({ type: 'prev' });
      } else if (e.key === 'Escape') {
        exit();
      } else if (e.key === 'f' || e.key === 'F') {
        dispatch({ type: 'freeze' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scene, exit]);

  const start = (id: string) => {
    dispatch({ type: 'reset' });
    setSceneId(id);
    document.documentElement.requestFullscreen?.()?.catch(() => {});
  };

  if (!scene || !step) {
    return (
      <section className="mx-auto max-w-2xl space-y-4">
        <h2 className="font-display text-3xl font-bold">ඉදිරිපත් කිරීම් දර්ශන</h2>
        <p className="text-muted">යතුරු: → ඊළඟ · ← පෙර · Esc පිටවීම · F නිශ්චල කිරීම · ජංගම: ස්වයිප් කරන්න</p>
        <ul className="space-y-2">
          {SCENES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => start(s.id)}
                className="flex min-h-14 w-full items-center justify-between rounded-lg border border-line bg-surface px-4 text-left text-lg hover:bg-hover"
              >
                <span>{s.titleSi}</span>
                <span className="text-sm text-muted">පියවර {s.steps.length}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const total = scene.steps.length;
  return (
    <div
      data-testid="presenter"
      className="fixed inset-0 z-50 flex flex-col bg-bg"
      onPointerDown={(e) => {
        if (e.pointerType !== 'mouse') swipeStart.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (swipeStart.current === null) return;
        const dx = e.clientX - swipeStart.current;
        swipeStart.current = null;
        if (dx < -60) dispatch({ type: 'next', total });
        else if (dx > 60) dispatch({ type: 'prev' });
      }}
    >
      <div className="relative min-h-0 flex-1 overflow-auto p-4">
        {step.view === 'graph' ? <GraphView /> : <ExplorerView presenting />}
        {state.frozen && <div data-testid="freeze-overlay" className="absolute inset-0 z-10" aria-hidden />}
      </div>
      <footer className="border-t border-line bg-surface px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex-1 text-left"
            aria-label="විස්තරය සඟවන්න / පෙන්වන්න"
            onClick={() => dispatch({ type: 'toggleCaption' })}
          >
            <p data-testid="caption" className={`font-display text-2xl md:text-4xl ${state.captionHidden ? 'invisible' : ''}`}>
              {step.captionSi}
            </p>
          </button>
          {state.frozen && <span aria-label="නිශ්චල කර ඇත">❄</span>}
          <span className="tabular-nums text-muted">
            {state.stepIdx + 1} / {total}
          </span>
        </div>
      </footer>
    </div>
  );
}
```

Create `src/app/present/page.tsx`:

```tsx
import { PresentView } from '@/present/PresentView';

export default function PresentPage() {
  return <PresentView />;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/present`
Expected: PASS.

Run: `npm test && npm run typecheck`
Expected: all unit suites PASS, no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/present src/app/present
git commit -m "feat(present): add keyboard/swipe presentation scenes with freeze

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 14: Cross-viewport end-to-end tests on the static build

**Files:**
- Create: `e2e/app.spec.ts`

**Interfaces:**
- Consumes: the built static site (`npm run build` → `out/`, served by `npx serve out -l 3100` from `playwright.config.ts`), and the test ids from Tasks 9–13.
- Produces: e2e coverage for phone (390×844), tablet (820×1180) and projector (1280×720).

- [ ] **Step 1: Write the e2e tests**

Create `e2e/app.spec.ts`:

```ts
import { expect, test, type Page } from '@playwright/test';

const noHorizontalScroll = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

for (const path of ['/', '/matrix', '/graph', '/present']) {
  test(`${path} renders without horizontal page scroll`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: 'චිත්ත දර්ශකය' })).toBeVisible();
    await noHorizontalScroll(page);
  });
}

test('selecting citta 1 shows its 19 cetasikas', async ({ page }, info) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^1\. / }).click();
  const where = info.project.name === 'phone' ? page.getByTestId('bottom-sheet') : page.getByTestId('profile-aside');
  await expect(where.getByText('19 / 52')).toBeVisible();
  await expect(page).toHaveURL(/\?c=1$/);
  await noHorizontalScroll(page);
});

test('the phone bottom sheet closes and clears the selection', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone', 'phone only');
  await page.goto('/?c=1');
  await expect(page.getByTestId('bottom-sheet')).toBeVisible();
  await page.getByRole('button', { name: 'වසන්න' }).click();
  await expect(page.getByTestId('bottom-sheet')).toBeHidden();
  await expect(page).toHaveURL(/\/$/);
});

test('search selects pīti and shows the caption', async ({ page }, info) => {
  await page.goto('/');
  if (info.project.name === 'phone') await page.getByRole('button', { name: 'මෙනුව' }).click();
  await page.getByRole('combobox', { name: 'සොයන්න' }).filter({ visible: true }).fill('පීති');
  await page.getByRole('option').first().click();
  const where = info.project.name === 'phone' ? page.getByTestId('bottom-sheet') : page.getByTestId('profile-aside');
  await expect(where.getByText('පීති: සිත් 35')).toBeVisible();
});

test('a broken shared link shows the notice', async ({ page }) => {
  await page.goto('/?c=999');
  await expect(page.getByRole('status')).toContainText('සබැඳියේ');
});

test('the graph centres on pīti and groups on phones', async ({ page }, info) => {
  await page.goto('/graph?ce=12');
  const nodes = page.locator('.react-flow__node');
  await expect(nodes).toHaveCount(info.project.name === 'phone' ? 12 : 36);
});

test('presentation steps with the keyboard', async ({ page }) => {
  await page.goto('/present');
  await page.getByRole('button', { name: /අකුසල චෛතසික එකින් එක/ }).click();
  await expect(page.getByText('1 / 8')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByText('2 / 8')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'ඉදිරිපත් කිරීම් දර්ශන' })).toBeVisible();
});

test('matrix review mode outlines disputed cells', async ({ page }) => {
  await page.goto('/matrix');
  await page.getByRole('button', { name: 'සමාලෝචන ප්‍රකාරය' }).click();
  // The PS block starts collapsed on phones (and tablets); expand it if needed.
  const psHeader = page.getByRole('button', { name: /ඒකචිත්තක්ඛණික පටිච්චසමුප්පාදය/ });
  if ((await psHeader.getAttribute('aria-expanded')) === 'false') await psHeader.click();
  const disputed = page.locator('td[data-status="disputed"]').first();
  await expect(disputed).toBeAttached();
  await expect(disputed).toHaveClass(/outline-akusala/);
});
```

- [ ] **Step 2: Run the e2e suite**

Run: `npx playwright test`
Expected: all tests PASS on `phone`, `tablet` and `projector`. If a no-horizontal-scroll assertion fails, find the overflowing element with
`await page.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > innerWidth).map(e => e.outerHTML.slice(0, 120)))`
and add `min-w-0` / `flex-wrap` to its container.

- [ ] **Step 3: Screenshot check for Sinhala rendering**

Temporarily add this line at the end of the "selecting citta 1" test:

```ts
await page.screenshot({ path: `e2e-results/${info.project.name}-explorer.png`, fullPage: true });
```

Run `npx playwright test -g "selecting citta 1"`, open the three PNGs and confirm conjuncts (සම්ප්‍රයුක්ත, ධ්‍යාන, ප්‍රථම) render joined and tile labels aren't clipped mid-word. Remove the line afterwards.

- [ ] **Step 4: Commit**

```bash
git add e2e
git commit -m "test(e2e): cover explorer, search, graph, matrix and presentation on 3 viewports

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 15: Data review export and hand-off (human gate)

**Files:**
- Create: `scripts/export-review.ts`
- Create (generated): `review/data-review.csv`, `review/disputed.md`

**Interfaces:**
- Consumes: `toCsv` (Task 11); `CETASIKA_RELS`, `KICCA_RELS`, `PS_RELS`, `PUGGALA_RELS`, `BHUMI_RELS`, `labelOf`, `cittaById` (`@/data`).
- Produces: `npm run export:review` writes the two review files.

- [ ] **Step 1: Write the export script**

Create `scripts/export-review.ts`:

```ts
import { mkdirSync, writeFileSync } from 'node:fs';
import {
  BHUMI_RELS,
  CETASIKA_RELS,
  KICCA_RELS,
  PS_RELS,
  PUGGALA_RELS,
  labelOf,
  type EntityId,
  type EntityKind,
  type Status,
} from '@/data';
import { toCsv } from '@/views/matrix/csv';

type Row = { citta: number; kind: EntityKind; id: EntityId; status: Status; note?: string };

const rows: Row[] = [
  ...CETASIKA_RELS.map((r) => ({ citta: r.citta, kind: 'cetasika' as const, id: r.cetasika, status: r.status, note: r.note })),
  ...KICCA_RELS.map((r) => ({ citta: r.citta, kind: 'kicca' as const, id: r.kicca, status: r.status, note: r.note })),
  ...PS_RELS.map((r) => ({ citta: r.citta, kind: 'psLink' as const, id: r.psLink, status: r.status, note: r.note })),
  ...PUGGALA_RELS.map((r) => ({ citta: r.citta, kind: 'puggala' as const, id: r.puggala, status: r.status, note: r.note })),
  ...BHUMI_RELS.map((r) => ({ citta: r.citta, kind: 'bhumi' as const, id: r.bhumi, status: r.status, note: r.note })),
].filter((r) => r.status !== 'rule');

const md = [
  '# දත්ත සමාලෝචනය — Data review',
  '',
  '## Interpretation choices to confirm',
  '',
  '- 89-citta scheme: the 8 lokuttara cittas are treated as first-jhāna (vitakka, vicāra, pīti present).',
  '- Appamaññā (karuṇā, muditā) occur in rūpāvacara jhānas 1–4 including vipāka (28 cittas).',
  '- Puggala columns count vīthi cittas and exclude the 4 magga cittas (chart header 37/41/41/54/50/50/48/44).',
  '- Bhūmi columns count vīthi cittas per plane (chart header 80/64/42).',
  '- Paṭiccasamuppāda chains follow the Vibhaṅga Abhidhammabhājanīya; kusala cittas show both avijjā (from the chart) and kusalamūla.',
  '',
  `## Rows not derived purely from rules (${rows.length})`,
  '',
  '| සිත | සම්බන්ධය | තත්ත්වය | සටහන |',
  '| --- | --- | --- | --- |',
  ...rows.map((r) => `| ${labelOf('citta', r.citta)} | ${labelOf(r.kind, r.id)} | ${r.status} | ${r.note ?? ''} |`),
  '',
].join('\n');

mkdirSync('review', { recursive: true });
writeFileSync('review/data-review.csv', toCsv(), 'utf8');
writeFileSync('review/disputed.md', md, 'utf8');
console.log(`Wrote review/data-review.csv and review/disputed.md (${rows.length} non-rule rows)`);
```

- [ ] **Step 2: Run it**

Run: `npm run export:review`
Expected: `Wrote review/data-review.csv and review/disputed.md (21 non-rule rows)` — 17 kusala `avijjā` rows marked `chart` (cittas 31–38, 55–59, 70–73) + 4 magga rows marked `disputed`.

- [ ] **Step 3: Final verification**

Run: `npm test && npm run typecheck && npx playwright test`
Expected: everything PASS.

- [ ] **Step 4: Commit**

```bash
git add scripts review
git commit -m "chore: add data review export (CSV + disputed list)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 5: STOP — hand the data to the user for review**

Tell the user: the app is built; before the data is treated as correct, please review `review/disputed.md` (interpretation choices + the 21 flagged rows) and `review/data-review.csv` (opens in Excel/LibreOffice with Sinhala intact), or use `/matrix` → "සමාලෝචන ප්‍රකාරය". Corrections go into the rule modules in `src/data/relations/`; each correction gets a test and a re-run of `npm run export:review`. Do not mark the project done until the user approves the data.
