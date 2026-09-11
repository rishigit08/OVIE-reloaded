# Commercial workers compensation insights

Page: `ovie_commercial_workers_compensation_insights.html`.
Rebuild: `node audit/build-workers-comp.cjs`.
Interaction and responsive checks: `node audit/workers-comp/validate.cjs`.

The builder uses the checked-in `workers-comp/template.html` shell plus `pages.json`, `classes.json`, and `locations.json`; it does not require the commercial property draft. The runtime page, source PDF, and script work as local files or from a static web server. Browser checks require Playwright and Microsoft Edge. Playwright resolves from the installed `playwright` package, or from the module path supplied through `OVIE_PLAYWRIGHT_MODULE` when using a bundled runtime.

Uses the root DESIGN.md and established Insights primitives. Later review decisions are recorded in the root contract. The current implementation preserves the approved workers compensation visibility and source-alignment decisions; it does not copy BOP-specific exceptions.

## September 11 review against the revised Insights contract

Completed the section 12.8 checklist for the updated standard Insights template. The full SME mapping is in `sme-mapping.md`; it records every required category, supporting evidence, qualifiers, applicability, presentation and initial disclosure state. Dedicated premium and watch-point blocks retain the WC SME order. No BOP-only specifications/sublimit inventories or closed-by-default requirements were imported.

Resolved drift:

- Source views now show recognizable document names, explicit PDF page numbers and separately labeled form references. References use the prescribed 14px semibold plum treatment.
- Source tables use stacked labeled values. Original clause line/list boundaries are preserved instead of flattening all text into one paragraph. Combined claims expose all supporting sources, including rating exceptions, employee/classification scope, other-state conditions, elections, and cancellation/deposit context.
- Source surfaces use mobile bottom sheets and the standard right-side drawer at 860px and above; keyboard and reduced-motion paths remain immediate.
- Added semantic static subheadings and two explicit coverage-part groups. Principal limit labels retain regular tertiary typography; amounts remain 18px semibold. Removed extra disclosure-row indentation.
- Disclosure counts now identify 2 coverage parts and 39 state groups. The complete 145-class-entry scope remains explicit in the classification disclosure.
- Supporting condition text uses the tertiary role, emphasized headings use primary, and header utility containers use the standard control background. Neutral notes and prior simplified-card/cancellation edits are preserved.

Checks passed at 320, 390, 456 and 1440 pixels, including all disclosures expanded. Verified source target dimensions, semantic/count structure, original PDF links, composite page references, responsive source geometry, search/filter behavior, keyboard focus restoration, Ask Ovie and feedback validation. Source tables, the desktop drawer and included-coverage hierarchy were visually inspected. No page script errors were observed. These checks cover the revised Insights presentation and do not imply production sharing or AI services are connected.

## Document verification

The matching 346-page Wesco policy was found in the existing `policy-samples.zip` and copied to `assets/policies/workers-compensation__wesco__06.pdf`. All document links point to this original PDF. Page numbers include the exhibit cover; the Information Page is PDF page 20, not PDF page 1.

- 51 declared location entries across 39 states, with addresses and non-specific entries retained. Locations 50–51 belong to MVP Workforce, LLC; 1–49 to Personnel Staffing Group, LLC DBA Barnett Management. Repeated later location schedules do not create duplicate locations.
- 145 state/class entries across 39 state premium schedules, including rows with blank payroll. Those blanks are shown as Not stated. MA LCM Deviation (9037) is a rating adjustment, not a job class, and is omitted from the employee-class count.
- State/class codes, remuneration and rates are drawn from the original schedules on PDF pages 24–63. Plain descriptions expand manufacturing and NOC abbreviations. Location OCR letter substitutions were checked against rendered PDF pages.
- The supplied SME summary's blanket 0.75 factor does not apply to every state. 34 schedules show 0.75; California shows 0.94; Delaware, Michigan, Pennsylvania and Wisconsin show N/A. Michigan shows a 0% merit rating credit. WC 00 04 03 says the scheduled factors are estimates.
- General Section E, page 65, also covers other workplaces in Item 3.A states unless separately insured or self-insured. The page therefore treats undeclared locations as verification concerns, rather than stating an automatic exclusion.
- Part Three, pages 68–69, contains a 30-day notification condition for work already underway outside Item 3.A at inception. This qualification replaces the supplied summary's unconditional no-coverage statement.
- Cancellation on August 5, 2016 is prominently shown. The page avoids equating a later claim-reporting date with an uncovered injury and distinguishes annual estimates from final earned premium after cancellation.
- The premium illustration correctly divides payroll by 100 and applies California's 0.94 factor. It is explicitly before other adjustments and is not presented as the quoted final class premium.
- No separate deductible section, state-benefit limit repository, or inferred individual officer elections.

## Verification

Passed browser checks at 320px, 390px and 1440px without horizontal overflow. Verified complete schedule counts, every source control, PDF page links, filtering including empty results, search opening containing disclosures, modal focus restoration, Ask Ovie input focus and sample response, and feedback validation. No browser script errors. Representative screenshots were visually inspected.

Motion gate: disclosures and sheets are occasional state indication / spatial continuity; use the inherited CSS tokens and recipes. Keyboard interactions are instant. Reduced motion removes movement. Reading content has no entrance animation.

This remains a standalone design prototype, matching the reference's scope: Ask Ovie uses local sample answers; sharing, voice input and feedback are not connected to services.
