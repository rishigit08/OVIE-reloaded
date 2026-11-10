# Ovie Insights Assets V3: screen rules and use cases

Companion to [Ovie_Insights_Assets_V3.html](Ovie_Insights_Assets_V3.html). It explains what each screen shows, the rules that decide it, and every use case the prototype covers.

Visual tokens, typography, bottom-sheet behaviour, accessibility and motion come from the workspace-root [DESIGN.md](DESIGN.md). This file does not restate them. Where V3 departs from that contract, the departure is listed in [section 12](#12-known-drift-from-designmd-and-open-questions).

The sample household (Jordan Rivera and family) is illustrative prototype data, not product content.

---

## 1. Purpose

The Insights screen answers one question: **for each thing I own or care about, what is covered, by which policy, and where are the holes?**

- An **asset** is a person, pet, home, vehicle, item or business that policies protect.
- A **coverage** is one type of protection on an asset, such as Collision or Flood.
- A **policy** is an uploaded document that provides, or explicitly excludes, coverages.
- A **watchpoint** is a finding that needs attention, with a severity of Critical, Moderate or Low.

V3 changes the asset detail page. Its coverage list is now a **Coverage map**: colour-coded tiles, one per coverage. Tapping a tile opens a bottom sheet that shows the coverage and the other assets that carry it.

---

## 2. Screen map

```
Insights list (tabs: Assets | Watchpoints)
├── Assets tab ──────────► Asset detail
│                           ├── Watchpoints section ──► Ask Ovie sheet
│                           ├── Coverage map (tiles) ─► Coverage sheet
│                           │                            ├── "Also covered for" row ─► Asset detail (other asset)
│                           │                            ├── Source policy row ──────► toast (placeholder)
│                           │                            └── Ask Ovie about this coverage ─► Ask Ovie sheet
│                           └── Policies included ───► toast (placeholder)
└── Watchpoints tab ─► Watchpoint details sheet
                        ├── Policy row ─► toast (placeholder)
                        ├── Asset row ──► Asset detail
                        └── Ask Ovie about this watchpoint ─► Ask Ovie sheet

Floating Ask Ovie button (every screen) ─► Ask Ovie sheet (scoped to the current screen)
Bottom navigation: Insights returns to the list (or scrolls it to the top); Home, Files and More show a toast.
```

Only one screen, one sheet and one toast are active at a time. Opening an asset from inside a sheet closes the sheet first.

---

## 3. Domain model

| Field | Meaning |
|---|---|
| `asset.name` | Role label: "You", "Your spouse", "Your car". Used only in the detail page title bar. |
| `asset.d` | The asset's own name or description: "Jordan Rivera", "2022 Subaru Outback", an address. **This is the name shown in lists and sheets.** |
| `asset.group` | People, Home, Property, Vehicles or Business. Sets list grouping and order. |
| `coverage.n / v / t` | Name, value (limit or deductible), and basis (for example "Split limit"). |
| `coverage.s` | Source flag: `in` provided, `ex` explicitly excluded, `no` not included. |
| `coverage.ov` | Flag: more than one policy provides this coverage at the same level. |
| `coverage.p` | Policies behind the coverage. May hold several policies, or none. |
| `watchpoint` | Severity, kind, text, question set, related policies. Belongs to an asset, not to a coverage. |

---

## 4. Coverage status rules

Every coverage on an asset has exactly one of four statuses.

| Status | Meaning in one line |
|---|---|
| **Covered** | One policy provides it. |
| **Overlap** | Two or more policies provide it at the same level. |
| **Not covered** | A document explicitly excludes it, and nothing provides it. |
| **Gap** | Nothing provides it, and no document addresses it. |

### 4.1 How the status is worked out when several policies attach to one asset

Look at every policy linked to the asset. Each one either **provides** the coverage, **excludes** it, or says **nothing**. Check in this order and stop at the first match:

1. **Overlap** — two or more policies provide the same coverage at the same level, so one loss could be claimed twice.
2. **Covered** — exactly one policy provides it.
3. **Not covered** — no policy provides it, and at least one explicitly excludes it.
4. **Gap** — no policy provides it, and none mentions it.

### 4.2 Edge cases

| Situation | Result | Why |
|---|---|---|
| One policy excludes it and another provides it | **Covered**, plus a watchpoint | The providing policy wins; the exclusion is a finding, not a status. |
| An umbrella sits above the auto liability limit | **Covered**, not Overlap | Layers are by design. Overlap means duplicate cover at the same level. |
| A coverage is limited by location (home vs business address) | **Covered**, plus a watchpoint | Business equipment is the example: the limit is lower at home. |
| A policy exists but does not extend to this asset | **Gap**, with that policy still named on the tile | Motorcycle / Umbrella liability: the umbrella does not list the motorcycle as underlying. |
| Coverage shared by several assets, with mixed results | Each asset gets its own status | Umbrella liability is Covered on the car and a Gap on the motorcycle. |

### 4.3 Gap is "not found", not "proven absent"

Ovie only knows what is in uploaded documents. A Gap therefore means **not found in your documents**. To call something a Gap, Ovie also needs a list of the coverages an asset of that type usually has, such as rental reimbursement for a car. Without that list, silence in the documents proves nothing. A Not covered status is a documented fact, because a document says so.

### 4.4 How the prototype assigns status

The prototype does not run these rules. Status is set by hand in the data:

| Data | Status |
|---|---|
| `s:'ex'` | Not covered |
| `s:'no'` | Gap |
| `s:'in'` with `ov:1` | Overlap |
| `s:'in'` | Covered |

A production version should compute status from the per-policy findings in 4.1.

---

## 5. Status encoding

Colour is never the only signal. Every status pairs a colour with a word and an icon.

| Status | Label | Icon | Colour | Tile value text |
|---|---|---|---|---|
| Covered | Covered | circle check | Green | The limit or deductible, for example `$500` |
| Gap | Gap | triangle alert | Red | "Not included" |
| Not covered | Not covered | circle X | Orange | "Excluded" |
| Overlap | Overlap | layers | Yellow | The limit, for example `25 miles` |

The colour is applied to the tile background and border, the status label, the value (Gap and Not covered only), a 5% tinted shadow in the same colour, the dot on the filter chip, and the status word in the sheet's "Also covered for" rows.

The prototype defines these colours itself. See section 12.

---

## 6. Insights list

### 6.1 Header and tabs

- Title bar: "Insights", no back action.
- Two tabs in a radio-style tablist: **Assets** (default) and **Watchpoints**. Selecting a tab re-renders the list and keeps focus on the tab.

### 6.2 Assets tab

- Heading "Your covered assets", with a summary of `N assets · N coverages · N policies`.
  - Coverages counts only coverages that are provided (Covered and Overlap), across all assets.
  - Policies counts distinct policies behind those coverages.
- Assets are grouped under Self and family, Home, Property, Vehicles and Business. A group with no assets is not shown.
- Each row is one asset, in data order:
  - Leading plum-tinted icon.
  - **Title: the asset's name or description** (`asset.d`), such as "Jordan Rivera" or "142 Maple Ridge Dr, Nashville, TN".
  - Second line: `N watchpoints · N coverages · N policies`.
    - Watchpoint count is bold plum when there is at least one, and regular weight when there are none ("No watchpoints").
    - Coverages and policies use the same "provided only" counts as above.
  - Trailing chevron. The whole row opens the asset.

### 6.3 Watchpoints tab

- Heading "Watchpoints across your policies", with `N watchpoints across N assets`.
- Cards are grouped by severity in the order Critical, Moderate, Low. A severity with no cards is not shown.
- Each card shows a severity pill, the watchpoint text and a chevron. Tapping it opens **Watchpoint details** (section 9.1).

---

## 7. Asset detail

Title bar: back action to the list, and the asset's **role label** (`asset.name`).

Below it, a summary line with the same `N watchpoints · N coverages · N policies` format as the list row.

### 7.1 Watchpoints section

- Section label "Watchpoints" with a count chip.
- Cards are sorted by severity, Critical first.
- Each card shows a severity pill, an **Ask Ovie** text action, the watchpoint text, and a footer listing each related policy with a file icon.
- **No watchpoints:** a white card reads "Nothing to flag for this asset."
- Watchpoints belong to the asset. Tiles do not carry watchpoint badges, so the watchpoints list is the single place they appear on this page.

### 7.2 Coverage map

- Section label **"Coverage map"** with a count chip. The chip counts **all tiles**, including Gap and Not covered.
- A row of **status filter chips** sits above the tiles, in place of the old colour legend (see 7.2.1).
- Tiles sit in a two-column grid with 8px gaps.

**Tile order.** Provided coverages first (Covered and Overlap, in data order), then Not covered, then Gap. Overlap is not pulled forward.

**Tile content, top to bottom:**

| Row | Rule |
|---|---|
| Status | Icon and label, for example "Covered". |
| Name | The coverage name. |
| Value | See section 5. Long values wrap and are never cut off. |
| Basis | The coverage basis, such as "Deductible". Hidden for a Gap, which has no basis. |

Tiles show no policy names and no "also on other assets" text. The policies behind a coverage and the other assets that carry it are in the coverage sheet.

#### 7.2.1 Status filter chips

| Rule | Behaviour |
|---|---|
| Options | **All** (default), then one chip for each status that has at least one tile on this asset, in the order Covered, Gap, Overlap, Not covered. A status with no tiles gets no chip. |
| Single status | If every tile on the asset has the same status, the chip row is hidden. Each tile already names its status. Example: Your child (two Covered tiles). |
| Chip content | A status-coloured dot (none on All), the status name, and the number of tiles. |
| Selection | Single-select. Selecting a chip shows only the matching tiles, instantly, in the same order as the unfiltered grid. |
| Reset | The filter returns to All each time an asset page is opened. It is not remembered per asset. |
| Count chip | The "Coverage map" count chip keeps showing the total number of tiles. It does not change with the filter. |
| Scrolling | The row scrolls horizontally with no visible scrollbar when the chips do not fit. |
| Tile behaviour | Filtered tiles open the same coverage sheet. |
| Footprint | 44px touch target with a 36px pill face. The selected chip is plum-tinted with a plum border and text. The others are white. |

**Accessibility.** The row is a radio group named "Filter coverages by status" with one tab stop (the selected chip). Arrow keys move and select, and Home and End jump to the first and last chip. Focus stays on the selected chip after each change. A hidden status message announces the result, for example "Showing 1 of 8 coverages · Overlap".

**Motion.** None. Selection is an instant state change, so no transition was added.

### 7.3 Policies included

- Section label **"Policies included"** with a count chip.
- Lists each distinct policy that provides at least one coverage on this asset, in order of first appearance.
- Row: file icon, policy name, and `N coverages: A, B +M` (the first two coverage names, then a count of the rest). Tapping it shows a toast ("Opens … in policy insights"), a placeholder for the policy insights page.
- A policy that only appears on Gap or Not covered tiles is not listed here. The Motorcycle's umbrella is the example.
- The count chip here is the number of policies, which is not the same as the number of tiles above it.

---

## 8. Coverage sheet

Opens when a tile is tapped. It is a modal bottom sheet over a dark scrim, 12px top corners, with a drag handle.

### 8.1 Layout, in order

| # | Element | Rule |
|---|---|---|
| 1 | **Heading** | The **status word**: Covered, Gap, Overlap or Not covered. There is no separate status badge. |
| 2 | Close | 44px icon button at the right of the heading. |
| 3 | Coverage header | Left: coverage name (14px semibold) and basis below it. Right: the value (14px semibold). The basis line is omitted for a Gap. |
| 4 | **Asset details** | Label and a plum-tinted box with the tapped asset: its name, then the value and basis on one line. **The status word is not repeated here**, because the heading already states it. Not tappable, since the user is already on that asset. |
| 5 | **Also covered for** | Label and a plum-tinted box, one tappable row per **other** asset carrying a coverage with the same name. Each row shows the asset's name, then the status word, then the value and basis. **The whole section, label included, is hidden when no other asset has the coverage.** |
| 6 | **Source policy / Source policies** | Label and a box with one row per policy. Hidden when the coverage has no policy. |
| 7 | **Ask Ovie about this coverage** | Outlined full-width action. |

**Watch points are not shown in the sheet.** They live only on the asset page.

### 8.2 Content rules by status

| Status | Heading | Value (header) | Asset details line | Policy label |
|---|---|---|---|---|
| Covered | Covered | The limit | `$100K/$300K/$100K · Split limit` | "Source policy" |
| Overlap | Overlap | The limit | `25 miles · Towing distance` | "Source policies" (both policies listed) |
| Not covered | Not covered | "Excluded" | "Excluded" | "Source policy", naming the policy whose exclusion applies |
| Gap | Gap | "Not included" | "Not included" | "Source policy" only if a policy is named (see 4.2), otherwise the section is hidden |

The label is singular or plural to match the number of policies.

### 8.3 How "Also covered for" is built

- Coverages match across assets by **exact name**. "Collision" on the car matches "Collision" on the motorcycle. "Dwelling · A" does not match "Dwelling", so those are not linked.
- The tapped asset is never listed in its own sheet.
- Each other asset keeps **its own status and value**. A Covered coverage can list a Gap asset.
- Tapping a row closes the sheet and opens that asset's detail page.

### 8.4 Closing and focus

- Close with the X button, a tap on the scrim, or the Escape key.
- On open, focus moves to the close button. On close, focus returns to the element that opened the sheet, if that element still exists.
- If the sheet is closed by navigating to another asset, the opening tile is gone, so focus does not return to it.

---

## 9. Other sheets

### 9.1 Watchpoint details

- Heading "Watchpoint details" and a close button.
- Severity pill and the watchpoint text.
- **Policies**: one row per related policy, with the names of up to two coverages it provides on this asset and a "+N" for the rest. Tapping shows the placeholder toast.
- **Asset**: one row with the asset's role label and its name. Tapping opens the asset detail page.
- **Ask Ovie about this watchpoint** action.

### 9.2 Ask Ovie

- Heading "Ask Ovie" with the Ovie sparkle icon, and a close button.
- A context card shows what the question is about, if anything:
  - **Coverage** (from the coverage sheet): asset and coverage name, then the value and basis, or "Excluded" / "Not included".
  - **Watchpoint**: asset and severity, then the watchpoint text.
  - **Asset** (from the floating button on an asset page) or **global** (list page): no context card.
- Suggested questions depend on the context:

| Context | Question set |
|---|---|
| Layer seam watchpoint | Required underlying limits, where the auto policy lists its limits, what happens if the limit is lower |
| Overlap watchpoint | What the club covers that the policy does not, which source pays first |
| Location seam watchpoint | What the homeowners policy says, which address the business policy lists, whether a garage is covered |
| Gap watchpoint | Which documents were checked, what the coverage usually includes |
| Coverage | What it pays for, sub-limits or conditions, which document it is from |
| Asset or global | Most important watchpoints, which policies overlap, what the policies do not include |

- Each question shows a placeholder toast, and a note says Ovie answers from your documents and to review with an insurance professional.

---

## 10. Use-case catalogue

Examples are from the sample household. "Result" is what the screen does.

| # | Use case | Example | Result |
|---|---|---|---|
| 1 | Covered by a single policy | Your car / Collision | Green tile. Sheet: Covered heading, Also covered for lists Second car and Motorcycle. |
| 2 | Covered, shared across assets | You / Medical | Sheet lists Your spouse and Your child under Also covered for, each with its own value. |
| 3 | Covered, unique to one asset | Your home / Dwelling · A | No Also covered for section. |
| 4 | Overlap | Your car / Roadside help | Yellow tile. Sheet lists both policies under Source policies. The related Low watchpoint is on the asset page. |
| 5 | Not covered | Your home / Flood | Orange tile, "Excluded". Sheet policy label reads "Source policy". Vacation cabin also has Flood as Not covered. |
| 6 | Not covered on several assets | Flood (home and cabin) | Each sheet lists the other asset with its status word, "Not covered · Excluded". |
| 7 | Gap, no policy | You / Short-term disability | Red tile, "Not included", no basis. Sheet has no policy section. |
| 8 | Gap, policy named | Motorcycle / Umbrella liability | Red tile. The sheet still names the Personal umbrella under Source policy. The policy is not in the asset page's Policies included section, since it provides nothing on this asset. |
| 9 | Same coverage, mixed status | Umbrella liability (car Covered, motorcycle Gap) | The car's sheet lists the motorcycle as "Gap · Not included". |
| 10 | Gap on several assets | Rental reimbursement (both cars) | Each sheet lists the other car as a Gap. |
| 11 | Asset with no watchpoints | Your child, Scheduled jewelry, Landscaping business | Watchpoints section shows "Nothing to flag for this asset." |
| 12 | Asset with one coverage | Your pet, Scheduled jewelry | One tile in the grid. |
| 13 | Long limit value | Auto liability, `$100K/$300K/$100K` | The value wraps onto a second line inside the tile. |
| 14 | Long policy name | Business owner's policy | Truncated with an ellipsis in the tile. See section 12. |
| 15 | Asset with many coverages | Your car, 8 tiles | Grid scrolls with the page. Ordering follows 7.2. |
| 16 | Open another asset from a sheet | Also covered for row | Sheet closes, asset page opens at the top, floating Ask Ovie button re-scopes to that asset. |
| 17 | Return from an asset page | Back arrow | Returns to the list at its previous scroll position. |
| 18 | Watchpoint to asset | Watchpoint details / Asset row | Opens the asset page. |
| 19 | Placeholder destinations | Policy rows, Home, Files, More | Show a short toast. No real navigation in the prototype. |
| 20 | Filter by status | Your car, tap Gap | One tile left (Rental reimbursement). Chips: All 8, Covered 5, Gap 1, Overlap 1, Not covered 1. Tap All to restore the full grid. |
| 21 | Filter hidden | Your child, Your pet, Scheduled jewelry | Only one status present, so no chip row. |
| 22 | Fewer statuses on an asset | You (Covered and Gap only) | Chips: All 6, Covered 4, Gap 2. No Overlap or Not covered chips. |
| 23 | Filter reset | Filter your car by Gap, go back, open You | You opens on All. |

### Prototype data at a glance

| Measure | Value |
|---|---|
| Assets | 12 |
| Tiles across all assets | 51 (35 Covered, 1 Overlap, 8 Not covered, 7 Gap) |
| Assets with a single overlap | Your car only |
| Coverages shared by name across assets | Medical, Term life, Personal liability, Flood, Auto liability, Collision, Comprehensive, Umbrella liability, Rental reimbursement |

---

## 11. Counts and derived values

Several numbers on this screen are computed differently on purpose. They can look inconsistent unless you know the rule.

| Where | What it counts |
|---|---|
| List header "N coverages" | Provided coverages (Covered and Overlap) across all assets. |
| Row or page summary "N coverages" | Provided coverages on that asset only. |
| Coverage map chip | **All tiles** on the asset, including Gap and Not covered. |
| "N policies" (list and page) | Distinct policies behind provided coverages. |
| Policies included chip | Same as "N policies" for that asset. |
| Watchpoints chip | Watchpoints on that asset. |

Example: "You" shows 4 coverages in its summary but 6 tiles in the Coverage map, because two of the six are Gaps.

---

## 12. Known drift from DESIGN.md and open questions

DESIGN.md is authoritative. These are differences in V3 that need a decision before the design is treated as final.

| # | Area | Difference | Decision needed |
|---|---|---|---|
| 1 | Status colours | Red is used for Gap, orange for Not covered and yellow for Overlap. DESIGN.md reserves red for errors and destructive states, and defines amber as the only attention colour. Orange and yellow are not design tokens. | Approve these as a durable status palette, or map the four states onto existing tokens. |
| 2 | Tile shadow | Tiles and cards use a soft glow. DESIGN.md says static cards have no shadow. | Confirm the glow is an intended exception. |
| 3 | Section headings | Small uppercase labels with letter spacing. DESIGN.md calls for sentence case and no decorative uppercase tracking. | Inherited from earlier prototypes; confirm or restyle. |
| 4 | Sheet implementation | A `div` with `role="dialog"`, not a native modal dialog. Focus moves to the close button and is restored, but it is not trapped inside the sheet. | Move to a native dialog with a focus trap. |
| 5 | Sheet motion | 250ms slide and 200ms scrim fade. DESIGN.md sets the overlay token at 260ms. | Align to the shared tokens. |
| 6 | Truncation | Long policy names are cut with an ellipsis in tiles. DESIGN.md says do not truncate essential content. | Let policy names wrap. |
| 7 | Sheet heading | The status word replaces a descriptive title. | Confirm this is acceptable for assistive technology; the coverage name is the first content line. |
| 8 | Gap meaning | A Gap needs an expected-coverage list per asset type to be reliable. | Define the list with the SME template. |
| 9 | Status logic | Status is hand-tagged in the prototype. | Specify the per-policy findings that feed section 4.1. |
| 10 | "Also covered for" matching | Matches by exact coverage name. Variants such as "Dwelling · A" and "Dwelling" are not linked. | Decide whether to normalise names. |
| 11 | Watchpoint to coverage link | Tiles no longer link to watchpoints. | Decide whether a coverage should deep-link to its related watchpoints. |
