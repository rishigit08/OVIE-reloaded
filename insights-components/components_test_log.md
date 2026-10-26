# Ovie Insights Components: Test Log

This log holds the policy-specific results for the generic contract in `components.md` (ovie-insights/2). Every policy below renders with the same code; only the payload changes.

## Results, 13 Oct 2026

| | Commercial auto | Workers' comp | General liability |
|---|---|---|---|
| File | CPO-0632562-02 (Gallatin County Water District) | WWC3216474 (Personnel Staffing Group) | P000004748-00 (Reed Hartman Hospitality) |
| Facts | 44 | 91 | 79 |
| Upfront rows | 26 | 45 (incl. state chips) | 26 |
| Sheets opened without error | 53 | 100 | 88 |
| Unknown fields → Details | 0 | 1 (`stateOverrides`) | 0 |
| Renderer changes | none | none | none |

Other checks:
- **Mobile width:** 390px with no horizontal scroll.
- **Unknown section:** an unknown `loss_history` section rendered as the standard list, and its unknown fields went to Details.

Ask Ovie checks. These pass through payload `keywords`, not renderer synonyms:

| Policy | Question | Answer |
|---|---|---|
| Auto | "rented trucks" | Theft, fire, weather (hired autos) |
| WC | "employees hurt" | Injuries to employees |
| CGL | "guest slips" | Injury or damage you cause |
| CGL | "lost keys" | Lost keys |

## Generic-renderer audit (13 Oct 2026)

Policy-specific logic was removed from the prototype:

| Was | Now |
|---|---|
| Renderer synonyms such as rent → hired, truck → auto, staff → employees | Domain words come from item `keywords[]`. The renderer keeps only everyday synonyms. |
| `kind === "trailer"` decided the yellow bar | The minority kind in a group (`mainKind`) gets the yellow bar. |
| `kind === "state"` decided chips | Code items (no value, title ≤ 4 chars) become chips (`isCode`). |
| Suggested questions keyed by policy | Suggested questions are built from the sections present. |
| Hard-coded kind names | Kind names fall back to the capitalised plural. |

## How each file mapped

**Commercial auto:**
- **Header.**
- **Premium:** line, fees with breakdown rows, package total.
- **Coverage (6):** comprehensive and collision as 2 labelled values.
- **Subjects:** 7 autos, with VINs in the details; Drivers is missing.
- **Watch (4):** rated by Ovie.
- **Exclusions:** 9.
- **Conditions (5):** deductibles, valuation.
- **Forms:** 3.
- **Gaps:** 6.

**Workers' comp:**
- **Header:** cancellation event, so status shows Cancelled.
- **Premium:** estimated, assessments, total, deposit, minimum, experience mod; class-code table in the sheet.
- **Coverage (5):** Part One statutory, Part Two with 3 labelled limits, Part Three conditional, defense, terrorism.
- **Subjects:**
  - 39 states, with 4 monopolistic states excluded;
  - 8 locations (partial list);
  - 3 job classes (partial list).
- **Watch (4):** critical cancellation upfront with its sentence.
- **Exclusions:** 8.
- **Conditions:** 3.
- **Forms:** 6.
- **Gaps:** 5.

**General liability:**
- **Coverage (11):** includes limits with labelled values, a coverage deleted by endorsement as `removed`, and an unknown limit as `not_stated`.
- **Subjects:** premises and "who is an insured" groups.
- **Watch:** 7, rated by Ovie.
- **Exclusions:** 14. Unknown concepts fall back to the generic icon.
- **Conditions:** 5.
- **Forms:** 27, grouped by impact through `group`.
- **Gaps:** 2.

## Data notes

**Commercial auto:** the raw limitations repeated the watch points and the premium; they were merged.

**Workers' comp:**
- Location 15's ZIP 92840 doesn't match San Bernardino.
- "Limits may not be sufficient" is an adequacy judgement; it was reworded as a factual check.

**General liability:**
- Class premiums ($6,616.87) don't add up to the $9,105 policy premium.
- "New business" is a transaction type, not a status.
- The exposure basis was inferred in the raw text; it was dropped and listed as missing.
- The "$0" liquor and medical limits are rendered as an exclusion and a removed coverage, not as $0 limits.

## Renderer tweaks found by testing
- **Several values:** a row with several values shows the first value with its basis and "+{n} more", instead of "Varies".
