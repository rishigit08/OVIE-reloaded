# Ovie Insights Components

Version 2.1 · 13 Oct 2026 · Owner: Rishi Verma (design)
Status: working draft. Supersedes version 1. Not yet merged into DESIGN.md (see section 10).

This document is policy-agnostic. Every example uses placeholders in `{braces}`. Results and notes for specific test files are in `components_test_log.md`.

References
- **v2 prototype (one renderer, any payload):** https://claude.ai/artifact/5FGYLGx6krZZfEYSL882U1. Local copy: `insights-components/ovie-insights-v2.html`.
- v1 component catalog (visual options, still used inside sheets): https://claude.ai/artifact/6A1A4aZNDu2dTLXwN7vshP
- Test results per policy: `components_test_log.md`

---

## 1. Principles

1. **One item schema for every section.** A coverage, exclusion, insured subject, watch point and missing item all have the same shape. A new policy type brings new content, not new fields.
2. **Open edges.** Anything without a field goes into `detail.rows`, or arrives as an unknown field, and appears in the item's sheet. Unknown section types render with the standard list. Qualifiers are free text, not an enum.
3. **Upfront budget + drill-down.** The page shows only what a person needs to decide. Everything else is one tap away in a bottom sheet.
4. **The renderer never knows the policy type.** See section 6.

---

## 2. Payload

```json
{
  "contract": "ovie-insights/2",
  "label": "{short policy type name, optional}",
  "policy": {
    "line": "{line of business}",
    "insured": { "name": "{insured name}", "description": "{DBA or description}", "address": "{address}" },
    "carrier": "{insurer}", "policyNumber": "{policy number}",
    "term": { "start": "{YYYY-MM-DD}", "end": "{YYYY-MM-DD}" },
    "events": [ { "date": "{YYYY-MM-DD}", "label": "{what happened}", "effect": "ends_coverage", "sources": [] } ],
    "broker": { "name": "{broker}", "id": "{broker id}", "address": "{address}" },
    "form": { "number": "{form number}", "title": "{form title}" },
    "details": [ { "label": "{label}", "value": "{value}", "sources": [] } ],
    "sources": []
  },
  "sections": [ { "id": "{section id}", "type": "{section type}", "title": "{heading}", "items": [] } ],
  "qa": [ "{reviewer note, never shown to users}" ]
}
```

### 2.1 Section

| Field | Req | Notes |
|---|---|---|
| `type` | ✓ | `premium`, `coverage`, `subjects`, `watch`, `exclusions`, `conditions`, `forms`, `gaps`. Any other value renders as the standard list. |
| `title` | ✓ | Card heading. |
| `items[]` | ✓ | Item schema below. |
| `note` | | One neutral line shown upfront. |
| `complete` / `completeNote` | | `false` adds a "The full form may list more" style footer. |
| `groups[]` | | `{name, note?, complete?}`: metadata for `item.group`. |
| `chart` | | `{type: "stack", line, fees[], total}`: item ids (premium). |
| `ratedBy` | | `"ovie"` adds "Severity is rated by Ovie, not your insurer." |
| `documents[]` | | `{name, pages, citedPages[]}` (forms). |

Default order after the policy header: premium, coverage, subjects, watch, exclusions, conditions, forms, gaps. Sections the payload doesn't include are not shown.

### 2.2 Item (same for every section)

| Field | Notes |
|---|---|
| `id` | Unique in the payload. |
| `title` ✓ | Plain-language name; the upfront label. |
| `formal` | Policy wording or form name, shown in the sheet. |
| `summary` | One plain sentence, shown in the sheet (upfront only for `critical`). |
| `value` | Value (below). |
| `values[]` | Several Values, each with a `label` (`{limit label}`). |
| `appliesTo[]` | Plain scope labels (`{scope}`). |
| `severity` | `critical`, `serious`, `high`, `moderate`, `review`, `low`, `info`. Unknown text shows as a neutral pill. |
| `group` | Groups items inside a section. The extraction decides the labels. |
| `kind` | Icon hint for subjects. Unknown → dot. |
| `concept` | Icon hint for exclusions. Unknown → generic icon. |
| `status` | `excluded` greys out a subject. |
| `exceptions[]` | Carve-backs. |
| `keywords[]` | Domain words a person might use for this item (`{everyday term}`, `{synonym}`). Used by Ask Ovie search only, never shown. |
| `detail` | `{summary?, rows[]{label, value (string or Value), note?}, bullets[], table{columns[], rows[][]}, ladder[]{label, amount or text}}` |
| `related[]` | Item ids, shown as links in the sheet. |
| `sources[]` ✓ | `{doc, form?, page?, section?}` |
| `tag` | Short label shown next to the title. |

**Value:** `{type, amount?, text?, short?, qualifier?, note?}`
- `type`: `money`, `percent`, `number`, `text`, `date`, `not_stated`, `none_listed`, `removed`.
- `qualifier` is free text (`{basis, e.g. per occurrence}`). There is no enum to grow.
- `short` is used where space is tight.

---

## 3. Upfront vs. drill-down

**Upfront (always visible):**
- title;
- one value and its basis;
- who it applies to (first chip);
- severity;
- anything missing (amber);
- "Has exception" tag;
- for critical watch points, their sentence.

**Drill-down (bottom sheet, one tap):**
- formal name and summary;
- every value;
- all applies-to chips and exceptions;
- ladder, bullets, tables and detail rows;
- unknown fields;
- related facts and sources;
- the actions View in document and Ask Ovie.

Rules
1. A row is complete on its own; the sheet only adds depth. Never move a limit, status, severity or missing flag into a sheet.
2. Only rows with more to show get a chevron.
3. One level of sheets. Inside a sheet you may go to a related item, a source, or back, never deeper.
4. **Long lists:** show the top items, then "See all {n}", with search when n > 8.
   - Caps: coverage 6, watch 5, exclusions 5, conditions 4, gaps 4, others 5.
   - Watch sorts by severity.
5. A sheet shows only data from the payload. No invented explanations.
6. No boxes inside rows or sheets: 1px #ECEFED dividers separate items. Only the neutral note and the amber missing-data note have a fill.
7. A sheet doesn't repeat fields already shown upfront on the same card.
8. Every sheet ends with two actions:
   - **View in document:** opens the first cited source; hidden when there is no source.
   - **Ask Ovie:** asks about this item or section.
9. Section sheets organise items by `group` whenever items carry one.

---

## 4. Section renderers (fixed set, chosen by `type`)

| Type | Upfront | Section sheet | Item sheet |
|---|---|---|---|
| policy header | `{line}` heading + status pill. Rows: Policyholder `{insured name}`, Insurer `{carrier}`, Policy no., Term (+ the ends-coverage event line). "Policy details". | Only what isn't upfront: description, address, other events, broker, form, `details[]`, sources. | — |
| `premium` | **Yearly** `{amount}` (the `chart.line` item, else the first money item). **Monthly** = yearly ÷ 12, computed only when the headline is annual. Stack bar: line turquoise, fees yellow, other lines grey. One caption: if total − line − fees > 0, "{line} is {n}% of the {total} package"; otherwise "+ {fees} {fee label} = {total} {total label}". | Items by `group`. The group holding line and total renders as a sum: bar, line, + fees, + other lines (computed), = total. Other groups are label/value rows. | rows, tables |
| `coverage` | Title + value. Several values: if the amounts are the same, "{amount} · {n} limits"; if different, the first value with its basis + "+{n} more". First applies-to chip. | All items with summaries | values, ladder, bullets, rows |
| `subjects` | Per group: name, count, "Partial list" if `complete: false`, kind-count chips, top 3 rows by value with mini bars. Code-only items (see 6.3) render as chips (14 + "+{n}"), and `excluded` items are struck through. | Groups with notes, all items, chip grid, search | rows |
| `watch` | Severity pill over the title, sorted by severity. Critical items show their sentence. | All, with summaries | summary, ladder, related |
| `exclusions` | Concept icon with red ✕, title, "Has exception". | All, with summaries and exceptions | formal, summary, exceptions |
| `conditions` | Title + value | All, with summaries | summary, rows |
| `forms` | One row: "{n} forms and endorsements" | Forms by `group` + documents used + page strip | formal, summary |
| `gaps` | Amber "?" + title | All, with reasons + neutral "Missing doesn't mean not covered" | reason, related |
| any other | Standard list rows | All items | everything |

**Status (computed):** an event with `effect: "ends_coverage"` on or before today shows **Cancelled**. Otherwise the term gives Not started, Active, Ends soon (≤ 30 days) or Expired.

---

## 5. Contract check

Run for every payload; the prototype runs it for every bundled policy on load. Check:

- sections and facts;
- rows shown upfront;
- sheets opened without error;
- unknown section types (→ standard list);
- unknown fields (→ Details);
- renderer changes needed, which must be **none**.

Reviewer notes go in `qa[]`. Per-policy results go in `components_test_log.md`, not here.

---

## 6. Keeping it generic (rules for every prototype or front-end change)

1. **No branching on content.** The renderer may branch only on `section.type`, `value.type`, `severity`, `status`, `effect` and field presence. It never branches on policy line, `label`, item `id`, `title` or a specific `kind` or `concept` value.
2. **Icons are registries with fallbacks.** `kind` and `concept` map to icons through lookup tables. An unknown value gets a dot or a generic icon, and the kind's label falls back to its capitalised plural. Adding an icon is a table entry, not logic.
3. **Code chips are structural.** An item with no value and a title of 4 characters or fewer (a code) renders as a chip. This rule doesn't depend on the item's kind.
4. **Secondary series are structural.** In a subjects group, items of the group's most frequent `kind` use turquoise and the other kinds use yellow.
5. **Search vocabulary comes from the payload.** Ask Ovie's built-in synonyms hold everyday language only (hurt → injury, cost → premium, missing → gaps). Domain words come from item `keywords[]`.
6. **Suggested questions come from the payload.** They are built from the sections present: status, the first coverage's title, exclusions, gaps.
7. **Labels come from the payload.** Group names, the fee label, the total label and the line name are read from items. Only the computed parts (monthly, other lines, share, status) are produced by the front end.
8. **Docs and examples use placeholders.** No policy names, numbers or carriers in this file.
9. **Gate.** Every change must render all bundled policies with 0 errors and 0 renderer changes in the contract check, keep the policy switcher built from `POLICIES` keys, and keep the 390px mobile width without horizontal scroll.

---

## 7. Shared visual rules

### 7.1 Color roles

| Role | Color | Used for |
|---|---|---|
| Brand / UI | plum #6B4062, soft #F5EDF3, dark #54324D | Buttons, selected chips, count pills, source links, Review severity. |
| Negative | red #EF4444 (text: DS danger #A63A33 on #FFEDED) | Expired dot, exclusion ✕ badge, Critical stroke. |
| Attention | orange #EA580C (text #C2410C) | Serious dot, pill and text. |
| Positive | green #16A34A (text: DS success #0D7D07) | ✓ covered, exception lines. |
| Accent 1 | turquoise #14B8A6, soft #CCFBF1, ink #0F766E | Primary chart series: line premium, value bars, "policy pays", page marks, kind-count chips. |
| Accent 2 | yellow #FACC15, soft #FEF9C3 | Secondary series: fees, secondary kinds, "you pay". |
| Missing data | DS warning: bg #FFF5DF, border #E7C982, text #634106 | Anything the documents don't establish. |
| Neutral | text #111111 / #333A3D / #5F6368, canvas #F6F6F6, divider #ECEFED, border #D8DDDB | Everything else. |

Red, orange and green are semantic only. Text always uses an AA-contrast token.

### 7.2 Pills and chips
- **Status pill:** filled. Cancelled and Expired use danger; Active uses success; Ends soon uses warning; Not started uses plum.
- **Severity pill:** stroke only.
- **Scope chip:** stroke only, 1px #D8DDDB.
- **Count pill:** plum soft fill.
- **Kind-count chip:** turquoise soft fill.

### 7.3 Missing data
- **Highlight:** the DS warning colours, used for `not_stated`, `none_listed`, empty groups and gap icons.
- **Neutral note:** "Missing doesn't mean not covered" stays grey.
- **Never ✕:** missing data is never shown as ✕ or under Not covered.

### 7.4 Ladder (you pay → policy pays)
- **Steps:** 2–3, not to scale, rising in height.
- **Colours:** "You pay" is yellow; "Policy pays" is turquoise.
- **Accessible label:** lists every step and says "Not to scale".

### 7.5 Source action
- **Look:** info glyph + "{short doc name} p.{page}" in plum, with a transparent background.
- **Behaviour:** opens the source sheet.
- **Doc names:** short names come from the payload's `doc` value.

### 7.6 Typography
- **Font:** Figtree.
- **Headings:** 18/24 semibold.
- **Labels:** 14/20 tertiary.
- **Values:** 14/20 semibold.
- **Premium hero:** 32/36 semibold.
- **Captions:** 12/16.
- **Case:** sentence case only.

---

## 8. Ask Ovie (prototype)
- **Source:** answers come only from the payload.
- **Matching:**
  - item text: title, formal, summary, applies-to, group, keywords and detail rows;
  - everyday synonyms;
  - section type cues: "isn't covered" → exclusions, "missing" → gaps.
- **Answer:**
  - a lead sentence with the value;
  - other matches;
  - "Open {item}" chips;
  - "Answered only from this policy's documents."

## 9. LLM extraction rules
- **Payload:**
  - Return `{contract: "ovie-insights/2", label?, policy, sections[], qa[]}`.
  - Use only the item fields in 2.2. Anything that doesn't fit goes in `detail.rows` as `{label, value}`.
- **Wording:**
  - `title` and `summary` in plain language; policy wording goes in `formal`.
  - Add `keywords[]` with the everyday words a policyholder would use for each item.
- **Values:**
  - Money as numbers, with a free-text `qualifier`.
  - Multiple limits go in `values[]` with labels.
- **Gaps:**
  - Anything not found becomes a `gaps` item, never an exclusion.
  - Uncertainty goes in `gaps`, not in hedged wording.
- **Structure:**
  - Use `group` to organise long sections; the extraction picks the labels.
  - Merge items about the same concept and link them with `related`.
- **Don't compute:** status, monthly amounts, other lines or shares.

## 10. Deviations from DESIGN.md (need approval)
1. Turquoise and yellow accent colours.
2. Missing data uses the warning highlight; DS uses neutral text.
3. Orange Serious pill and red Critical stroke pill.
4. Detail lives in bottom sheets instead of DS accordions.
5. The source sheet has no clause excerpt yet.

## 11. Open items
- Clause excerpt in the source sheet when clause text is extracted.
- Decide caps per section with usability testing.
- Add `keywords` to the extraction prompt and measure Ask Ovie hit rate.
