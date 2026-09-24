# Citta Visualizer — Design Spec

**Date:** 2026-09-24
**Status:** Draft for review

## 1. Purpose

A Next.js app for **teaching and presenting** the relationships in the chart
"සම්මාසම්බුද්ධ සරණයි – කාලත්‍රයේම ලෝක ධාතුවේ පහළවන චිත්ත…" (source image:
`c:\Users\Sumudu\Books\Low Reso All Bhuddha Dhamma (from Hon. Ajantha Sampath).jpg`).
A teacher projects it in a class or dhamma talk and uses it to show how the
89 cittas combine with cetasikas, kiccas, paṭiccasamuppāda factors, puggalas and bhūmis.

**Success criteria**

- Readable from the back of a hall (large type, high contrast, dark theme available).
- Any "which cittas have X (and Y)?" question is answered in one or two clicks.
- A teacher can step through prepared scenes with the keyboard alone.
- All UI text is Sinhala Unicode.
- Fully responsive: usable on phones, tablets, desktops and projectors (see section 6).
- Runs offline from a laptop (static export, self-hosted fonts).
- Data has been reviewed and approved by the user before being treated as correct.

**What the user said vs. assumed**

- Said: Next.js; Sinhala Unicode font; audience = teaching/presenting; scope = all four
  relationship blocks; data = Claude drafts, user reviews; build all three views (A, B, C);
  responsive.
- Assumed: static export for offline use; standard Abhidhammattha Saṅgaha scheme as the rule
  source; ārammaṇa/dvāra columns out of scope for v1.

## 2. Scope

**In scope (v1)**

1. Citta ↔ Cetasika (52 cetasikas, niyata/aniyata distinction)
2. Citta ↔ Kicca (14 functions)
3. Ekacittakkhaṇika paṭiccasamuppāda factors per citta (incl. the chart's arrow links)
4. Citta ↔ Puggala and Citta ↔ Bhūmi

**Out of scope (v1)**

- Ārammaṇa / dvāra columns
- Editing data from the UI
- Accounts, backend, database
- Languages other than Sinhala (Pāli names are stored but secondary)

## 3. Architecture

- **Framework:** Next.js (App Router) + TypeScript, `output: 'export'` (fully static).
- **Styling:** Tailwind CSS; colour tokens follow the chart's own conventions
  (akusala red, ahetuka yellow, kāmāvacara sobhana green, distinct tones for rūpa / arūpa /
  lokuttara; cetasika bands blue / red / light green). Light and dark themes.
- **Fonts:** `next/font/google` (self-hosted at build): **Noto Sans Sinhala** (body),
  **Abhaya Libre** (headings).
- **State:** Zustand store holding the current selection; mirrored to the URL query string.
- **Animation:** Framer Motion (highlight, reveal, re-layout transitions).
- **Libraries per view:** D3 (`d3-hierarchy`) for the treemap layout only, rendered as React SVG;
  React Flow + `elkjs` for the graph; custom CSS grid for the matrix.
- **Testing:** Vitest (data + logic), Playwright (smoke/E2E).

### Routes

| Route      | View                    | Purpose                                                       |
|------------|-------------------------|---------------------------------------------------------------|
| `/`        | Explorer (A)            | Citta map + profile panels, linked highlighting               |
| `/matrix`  | Full chart (B)          | 89 × ~150 grid, filterable; also the data-review screen       |
| `/graph`   | Relationship graph (C)  | Focus-centred graph, expand one hop at a time                 |
| `/present` | Presentation mode       | Full-screen keyboard-driven scenes built on A and C           |

### Shared shell

- Top bar: view switcher, Sinhala search (e.g. "පීති"), legend, presenter toggle
  (bigger type, hidden chrome), theme toggle.
- One selection store shared by all views; switching views keeps the selection.
- One data layer consumed by all views.

### Units

| Unit                     | Responsibility                                               | Depends on         |
|--------------------------|--------------------------------------------------------------|--------------------|
| `src/data/entities/*`    | Typed entity lists (citta, cetasika, kicca, psLink, puggala, bhumi) | —           |
| `src/data/relations/*`   | Flat relation arrays with `status`                           | entities           |
| `src/data/index.ts`      | Builds forward + reverse lookup indexes; query helpers (`cittasMatching(selection)`) | entities, relations |
| `src/state/selection.ts` | Zustand store, URL sync, parse/serialize selection           | data/index         |
| `src/components/shell/*` | Top bar, search, legend, theme/presenter toggles             | state              |
| `src/views/explorer/*`   | Citta map, cetasika grid, vīthi strip, PS chain, puggala/bhūmi badges | data, state |
| `src/views/matrix/*`     | Grid, column blocks, review mode                              | data, state        |
| `src/views/graph/*`      | Focus graph build + layout, grouping cap                      | data, state        |
| `src/present/*`          | Scene definitions + player                                    | state, views       |

## 4. Data model

All data lives in `src/data/` as typed TypeScript. No runtime fetching.

### Entities

Every entity has `id`, `nameSi`, optional `namePali`, optional `short` (compact label for tiles).

- **Citta (89):** `id` 1–89 in chart order; grouping path `bhumi → jati → group`
  (e.g. kāmāvacara → akusala → lobhamūla); attributes `vedana`, `hetu`
  (ahetuka / dvihetuka / tihetuka), `sankharika` (asaṅkhārika / sasaṅkhārika / n/a),
  `sampayutta` (ñāṇa / diṭṭhi / paṭigha / vicikicchā / uddhacca / n/a), `jhana` (1–5, mahaggata and lokuttara only).
- **Cetasika (52):** `band` (aññasamāna / akusala / sobhana) and `subgroup`
  (sabbacitta-sādhāraṇa 7, pakiṇṇaka 6, moha-catuka, lobha-tika, dosa-catuka, thina-duka,
  vicikicchā, sobhana-sādhāraṇa 19, virati 3, appamaññā 2, paññā 1).
- **Kicca (14):** with `vithiOrder` for the vīthi strip.
- **PS link:** a paṭiccasamuppāda link as the chart presents it, e.g. `vedana-tanha`
  ("වේදනා පච්චයා තණ්හා").
- **Puggala / Bhūmi:** the chart's person columns and plane columns. Exact lists are fixed
  during data drafting from the chart headers.

### Relations

```ts
type Status = 'rule' | 'chart' | 'disputed';

{ citta: number; cetasika: number; kind: 'niyata' | 'aniyata'; status: Status; note?: string }
{ citta: number; kicca: KiccaId; status: Status; note?: string }
{ citta: number; psLink: PsLinkId; labelSi: string; status: Status; note?: string }
{ citta: number; puggala: PuggalaId; status: Status; note?: string }
{ citta: number; bhumi: BhumiId; status: Status; note?: string }
```

- `kind` encodes the chart's ✓ (always present) vs ● (sometimes present: issā, macchariya,
  kukkucca, virati, appamaññā, …).
- `status`: `rule` = derived from Saṅgaha rules; `chart` = taken from the chart only;
  `disputed` = rules and chart disagree, or chart shows "?????". Disputed cells are **never
  silently resolved**; they are surfaced in matrix review mode.
- Reverse lookups are computed at module load in `src/data/index.ts`, not stored.

### Data sourcing workflow

1. Claude drafts the relations from Abhidhammattha Saṅgaha rules.
2. Claude cross-checks against the chart image and marks each row's `status`.
3. The user reviews in `/matrix` review mode (plus an exported CSV); corrections go into the data files.

### Invariants (Vitest)

- Exactly 89 cittas and 52 cetasikas; ids contiguous.
- The 7 sabbacitta-sādhāraṇa cetasikas occur in all 89 cittas.
- Per-citta cetasika totals match the Saṅgaha (e.g. citta 1 = 19; the dvipañcaviññāṇa = 7).
- Every citta has at least one kicca.
- Lokuttara cittas have no akusala cetasikas.
- Every relation references existing entity ids.

## 5. Views and interactions

### Explorer (A)

- **Citta map:** treemap tiles grouped by bhūmi → jāti → group with Sinhala group labels;
  each tile shows number + short name; full name on hover/tap.
- **Selecting a citta** dims all other tiles and fills the profile panels:
  - **Cetasika grid:** 52 chips in 3 bands; lit (niyata), outlined (aniyata), or off;
    count badge (e.g. "19 / 52").
  - **Vīthi strip:** 14 kiccas as a timeline (āvajjana → dassana … → javana ×7 → tadārammaṇa);
    this citta's functions highlighted.
  - **PS chain:** left-to-right flow of this citta's links; absent links greyed.
  - **Puggala / bhūmi:** two rows of badges.
- **Selecting a chip / kicca / puggala / bhūmi** reverses the direction: matching tiles light up
  with a caption count (e.g. "පීති: සිත් 51").
- **Combining:** shift-click adds a second (or further) selection; the map shows the
  intersection (AND).

### Matrix (B)

- Sticky citta rows and column headers; collapsible column blocks coloured like the chart.
- Hovering highlights the whole row and column.
- Filters use the shared selection.
- **Review mode** toggle: outlines `chart` / `disputed` cells and shows each cell's `note`;
  "Export CSV" for offline review.

### Graph (C)

- Focus node in the centre; rings for cetasikas, kiccas, PS links, puggala/bhūmi
  (elkjs radial / layered layout inside React Flow).
- Double-click a node to make it the new focus (animated re-layout).
- Filter chips choose which relation types are shown.
- **Cap:** above ~60 visible nodes, related nodes collapse into group nodes
  (e.g. "අකුසල සිත් 12"); clicking a group node expands it.

### Presentation mode

- Full screen; `←` / `→` step, `Esc` exits, `F` freezes (ignores clicks).
- A **scene** is data: an ordered list of steps
  `{ view: 'explorer' | 'graph', select: Selection, captionSi: string }`.
- Ships with 5 scenes:
  1. The 89 cittas by bhūmi
  2. Building up the akusala cetasikas one by one
  3. Vīthi walkthrough
  4. What the ariya puggalas cannot experience
  5. The PS chain inside an akusala citta

## 6. Responsive behaviour

The app must work on phones (≥360px), tablets and desktops/projectors. Tailwind breakpoints:
**mobile** < 768px, **tablet** 768–1279px, **desktop** ≥ 1280px. No horizontal page scroll
except inside the matrix grid.

| View / element   | Desktop                               | Tablet                                   | Mobile                                                             |
|------------------|---------------------------------------|------------------------------------------|--------------------------------------------------------------------|
| Top bar          | Full: switcher, search, legend, toggles | Same, legend in a popover             | Bottom tab bar for views; search and toggles behind a menu icon    |
| Explorer map     | Treemap left, profile panels right    | Treemap top, panels in a 2-column grid below | Treemap replaced by a grouped, collapsible tile list (accordion by bhūmi → jāti) |
| Profile panels   | Side column                           | Below the map                            | Bottom sheet that slides up on selection; swipe down to close      |
| Cetasika grid    | 3 bands side by side                  | 3 bands stacked                          | Bands stacked, chips wrap, min touch target 44px                   |
| Vīthi strip      | Full horizontal timeline              | Full horizontal timeline                 | Horizontally scrollable strip with snap                            |
| Matrix           | Full grid                             | Grid, some blocks collapsed by default   | Grid scrolls both ways with sticky citta column; blocks collapsed by default |
| Graph            | Full rings                            | Full rings                               | Pinch-zoom/pan; defaults to 2 relation types; lower grouping cap (~30 nodes) |
| Presentation     | Keyboard                              | Keyboard + swipe                         | Swipe left/right to step; tap to show/hide caption                 |

- Hover-only affordances get tap equivalents (a tap shows the full name; long-press = shift-click
  for combining selections).
- Sinhala labels must not be truncated mid-conjunct; use wrapping or `short` names on small tiles.

## 7. Error handling

- Unknown ids in the URL or a scene fall back to the default view with a small Sinhala notice.
- Selection is mirrored to the URL (e.g. `?c=1&ce=14`) so views can be bookmarked and shared.
- Data invariant failures fail the test suite (and therefore the build in CI), never at runtime.

## 8. Testing

- **Vitest:** data invariants (section 4), index/query helpers (`cittasMatching`),
  selection ↔ URL round-trip, graph grouping cap.
- **Playwright smoke:** each route renders; clicking citta 1 lights the expected 19 chips;
  selecting pīti highlights the expected cittas; presentation keys advance a scene.
- **Playwright viewports:** run the smoke suite at 390×844 (phone), 820×1180 (tablet) and
  1280×720 (projector); assert no horizontal page scroll and that the mobile bottom sheet opens on selection.

## 9. Risks

- **Data accuracy** is the main risk (~13k cells). Mitigated by rule-based drafting,
  `status` tagging, invariant tests, and the user review step.
- **Sinhala rendering:** conjuncts and yansaya/rakaransaya must render correctly in SVG text;
  verify in the Explorer tiles and graph nodes early.
- **Projector legibility:** verify tile/label sizes at 1280×720 in presenter mode.
