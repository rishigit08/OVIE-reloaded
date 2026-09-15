# Commercial Auto insights

## Scope and reference

Standalone HTML design prototype, using the root `DESIGN.md` and `ovie_commercial_property_insights.html` shell, typography, cards, source rows, feedback and Ask Ovie primitives. September 15 review decisions are recorded in the root contract. Source panels follow the umbrella reference at every width: a bottom-attached sheet with a stable header, one scrolling body, neutral inset evidence and a single “View in document” action. Verified at 320×568, 456×698 and 1440×920: bottom attachment, reachable document action and focus restoration.

The supplied SME brief (Session 8 and January 14 / March 6 / March 13 decisions) is mapped below. The bundled Metropolitan policy was selected after checking candidate samples for the required declarations, base form, endorsements, drivers, VINs and coverage limits. This is a document-grounded preview, not a connected extraction or secure-sharing service. Ask Ovie uses limited, clearly identified sample answers. `regenerateCommercialAuto` accepts a reviewed package from a future upstream service; it does not parse newly uploaded PDFs.

## SME mapping and evidence

| Requirement | Destination / applicability | Evidence and qualifications | Interaction |
|---|---|---|---|
| Required-document gate | Before rendering any insights; failed result is `red-stored` | Declarations, full form and endorsements required. Scheduled policies also need a complete vehicle schedule, human drivers, VINs and limits. Original documents remain separate from generation status. | Red incomplete state with missing-item inventory and re-upload destination; stale dialog content cleared. |
| Hired/non-owned exception | Covered autos; schedule and driver requirements waived only for verified HNO-only symbols | Symbols 8 and 9 must be selected for liability, with all selected designations restricted to 8/9. The sample has symbol 7 and does not use this exception. | Tested with explicitly synthetic QA inputs; no invented HNO policy is presented as a real sample. |
| Policy simplified | First card | Revised declarations PDF p52; term, carrier, identity, premium. Full identifier is always visible. | Per September 15 review: no source icons or eye toggle in this card. Retain the term-only Expired badge. |
| Mandatory business classification | Required row plus unavailable inventory | Common declarations p92: business-description box is blank. No class code supplies the missing operation. **Unavailable, not inferred from the company name.** This prevents full completion of the SME's definitive-classification content requirement for this sample; request a completed business description from the agent. | Sourced availability state. |
| Named Insured / Additional Named Insureds / Drivers | Who's covered, separate rows | p52–53: ATH Wonder Consulting LLC; Kenny Garrett. No additional named entities listed. Coverage-specific insured wording p58–59,82. | Separate entity arrays; driver gate rejects non-person records. Commonly-owned multi-entity presentation supported when explicitly supplied. |
| Covered-auto symbols | Covered autos introduction and coverage data | p54,57: symbol 7, specifically scheduled autos; no general HNO grant from unselected symbols or employee-insured wording. | Plain-language designation translation; sourced detail. |
| Assets and large fleets | Covered autos: identity and schedule fields only; list at 7+ | p54–55: revised 2017 International 4000, VIN 1HTMMMML5HH167780, garaging and $9,424 vehicle premium. | 6 initial list rows, See more in batches of 20, live name/VIN search, modal details. Tested with 125 clearly synthetic QA records. |
| Per-asset coverage content | Per September 15 review: What's included / What's not included / Coverage limitations / Coverage watch points are standard disclosures in Policy details | Declaration-selected coverage only; per-coverage limit, basis, deductible and premium retained. Group inline coverages by vehicle. Physical damage selected p54–55. No default comprehensive/collision from base-form presence. | Shared native disclosures on the landing page. Per-vehicle tabs remain in large-fleet detail surfaces; sources at first line. Supports per-vehicle arrays. One policy-level watch-point disclosure. |
| Applicable extensions | Included rows | Rental reimbursement p71–72: $50/day, 50 days, $2,500/period, 24-hour wait, reserve-auto limitation. Electronics p75,83; media p73–74. Private-passenger theft transportation benefit is not applied to the truck. Broad hired-auto physical damage not applied without liability prerequisite. | Extensions filtered by explicit declaration applicability. |
| Policy specifications | Policy details | Practical adds/requires only; p71–75,82–84. Endorsement inventory p53. Routine state and legal forms excluded from highlights but retained in sources. | Shared disclosure and source surface. |
| Mid-term changes | Revised snapshot + Endorsement summary | Later p51–98 package takes precedence over initial p3–50 schedule. Revised endorsements effective April 9, 2020. p51 notice dated November 25 describes correction of missing forms, not a new coverage change on that notice date. Revised premium $9,479; no gap coverage. | Snapshot replacement adapter reruns gate, renders new data/citations, retains previous snapshot on service rejection. Latest-effective snapshot resolver rejects ambiguous same-date inputs. |
| Critical watch points | Conditional only | No physical-damage-on-financed-auto or outside-declared-use conclusion for this sample: financing and operations evidence is absent. | Conditional flags tested; never inferred from presence/absence of a loan/lease gap endorsement. |
| Moderate watch points | Policy / asset watch points | Medical limit basis conflict p54,69–70; HNO prerequisite p54,56,82–83. HNO liability-only rule for applicable HNO inputs. | Severity chip, consequence, source. Agent guidance for fleet and ownership changes. |
| Low watch points | Coverage watch points | Audit/ownership provisions p65–66,85; no predicted premium or renewal decision. | Sourced factual note. |
| Footer | About these insights | Exact approved disclaimer, document accordion, separate unresolved-evidence inventory. UM property-damage conflict p54–55 retained as unresolved rather than offered as coverage. | Original PDF links open at explicit PDF page; readable structured schedule evidence. |
| Prohibitions | Whole page | No claims-handling summary. No dedicated deductible section. No business entity in Drivers. No synthesis of initial and revised vehicle schedules. | Gate precedes rendering. |

## Animation gate

Applied global animate skill. Occasional sheets: spatial continuity, inherited 260ms transform/opacity with drawer easing. Disclosure chevrons: state indication, 200ms shared easing; native content expansion instant. Frequent fleet browsing and tabs: instant. Keyboard and reduced-motion changes: instant; hover styling restricted to hover-capable fine pointers. No load animation.

## Validation

The published page is `ovie_commercial_auto_insights.html`. Its model, reviewed data, renderer, interactions and CSS are in `assets/commercial-auto-*`. The original supplied PDF is retained in `assets/policies/commercial-auto-ath-wonder.pdf`.

`node audit/commercial-auto/check.cjs` checks:

- Required documents, missing drivers/VINs/limits, business-as-driver rejection and HNO-only exception.
- Declaration-conditioned extensions, financed-auto watchpoint, 125-auto pagination/search and revised snapshot precedence.
- Browser layouts at 320, 390, 480 and 1440 pixels, with no horizontal overflow.
- Tabs and keyboard navigation, correct original PDF links, dialog focus restoration, search across hidden panels, Ask Ovie input/answer, feedback validation, incomplete-state suppression and generation success/failure.
- Reduced-motion behavior and browser script errors.

Original declarations/schedules were visually reviewed to verify the table relationships. Screenshots are produced locally when the validation script runs. The primary preview contains real policy data only; synthetic stress-test assets never persist into the delivered page.
