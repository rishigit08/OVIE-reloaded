# Mosey explorations

How the work is organised, and what has been tried.

## Versions

Versions are what the client sees. Each is a git tag (finished) or a branch
(in progress), and gets its own folder under `versions/` so it can be run
without switching branches.

| Version | State | Summary |
| --- | --- | --- |
| `v0-kickoff-concepts` | tagged | First full prototype: Home, Files, policy detail, Insights, Compare, Moe chat, upload flow. All data mocked. |
| `v1-policy-considerations` | in progress | Branches from v0. Focus: how a policy is summarised, cited and compared. |

## Clusters

Explorations live on branches named `<cluster>/<idea>`, cut from the current
version branch. When an idea is chosen it is merged into the version branch;
ideas that are dropped stay in the history.

| Cluster | Covers |
| --- | --- |
| `brand/` | Type, colour, icons, Moe's look |
| `policy/` | Policy detail, summaries, citations, compare |
| `agent/` | Moe: chat, voice, personality, entry points |

List a cluster with `git branch --list 'policy/*'`.

Alternatives that should be flipped between live in a meeting are flags, not
branches (e.g. `USE_3D` in `src/components/PolicyTile.tsx`).

## Log

### v0-kickoff-concepts
- Moe went through: a rolling mosaic ball, a ceramic-tile shard version, a
  mosaic tarsier, and finally a squircle with a lowercase "m", two eyes and a
  smirk. The version copied from a reference video was rejected as "creepy".
- Policy types: chunky three.js models first, then flat line icons (the 3D
  models are kept behind `USE_3D`).
- Typeface: Bricolage Grotesque + Figtree, then Hind Vadodara throughout.
- Chat: floating panel anchored to Moe, a pull-up sheet on policy screens, and
  a full tab.
- Known gap: on iOS, lit three.js materials and `InstancedMesh` failed to
  render on the Home tab; Moe uses one flat vertex-coloured mesh instead.
  Root cause not found.

### v1-policy-considerations
- 2026-10-07: replaced the invented demo policies with the client's. Twelve
  lines from their insight prototypes (personal + commercial auto, renters,
  condo, personal + commercial umbrella, general liability, commercial property,
  BOP, workers' comp, commercial package) plus two fictional term life policies
  written to the client's Notion template. Data model now mirrors the client's
  section framework; see `docs/client-framework.md`.
- Policy detail goes from four groups to the client's six (included,
  specifications, not included, limitations, watch points, deductibles), adds
  individuals covered, assets covered, document sources and "not available".
  Layout is deliberately a first pass; the structure is still open.
- Open: all but four of the client's sample policies are historical terms, so
  they show as Expired. Status is computed from the dates (`statusFor` in
  `src/lib/data.ts`).
- 2026-10-07: navigation pass. Documents moved from a section into a nav button
  (sheet at `/documents`). Insights tab groups cards under a sticky policy label
  (SectionList with `stickySectionHeadersEnabled`, needed on Android). Policy
  screen has sticky section headers, and "What Moe noticed" carries the same
  All / Gaps / Heads-up / Good news bubbles, pinned with its header. Home: profile
  moved left of the greeting, notifications button (stub screen) on the right.
- 2026-10-07: consolidated entity coverages with Policy details (option A of
  two mocked). The entity accordion repeated "What's included", so entities are
  now compact rows with the schedule in a sheet, and included items carry limit /
  deductible / premium copied from the schedule where they match (all of both
  autos, GL, commercial property, term life; part of renters, condo, BOP,
  package; none for umbrellas and workers' comp). Option B, rows inside Policy
  details scoped by entity, was dropped: only the autos group details by entity.
- Layout rule learned the hard way: every text style needs a whole-number
  `lineHeight`, and hairline borders must not change a row's height. Fractional
  heights put later text on third-of-a-point positions, where iOS can drop a
  paragraph's last line.
- 2026-10-07: details sheets and Files. Anything with evidence behind it (a
  covered person, a row on an entity's schedule, a detail card) opens the same
  source view: passage, PDF pages, form reference, facts, "View in document"
  (`/source`, `SourceDetails`). Sheets lose their close button on phones (swipe
  down); web keeps one because it has no swipe. "On schedule" became "coverages".
  Files: search in the header with the field above the segmented control, filter
  moved beside the view label, "Mine" is "My Policies", and a Documents segment
  holds non-policy files (ID card, declarations, endorsements, forms) with a
  preview screen (`/document`). Samples live in `src/lib/documents.ts`.
- 2026-10-07: Home shows five "needs your attention" rows with an inline "Show
  N more". Recent activity left Home for Notifications, which has two panes:
  Uploads (complete, read, failed) and Insights (new insights, new watch
  points). Files search is hidden until its header button is pressed and hides
  again when empty and unfocused. Insights tab pins "What Moe noticed" and its
  filters, with the current policy's name pinned beneath.
