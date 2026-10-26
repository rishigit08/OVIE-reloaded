# Client section framework and where it lives in our data

The demo policies come from the client's insight prototypes
(`rishigit08.github.io/OVIE-reloaded`) and their Notion "Insights Templates"
pages. We take the **data and section framework**, not their layout. How it is
shown here is ours and will change; the data shape (`src/lib/policyTypes.ts`)
is meant to survive that.

## The client's landing page, in order

| # | Client section | Our field | Shown today |
| --- | --- | --- | --- |
| 1 | Policy simplified (carrier, policy name + form, number, policyholder, period, premium + term, payment) | `carrier`, `form`, `number`, `policyholder`, `effective`/`expires`, `premium` + `premiumLabel`, `payment` | Hero, stats row, facts card |
| 2 | Individuals / entities covered (drivers, named + additional insureds, beneficiaries) | `coveredLabel`, `covered[]` | "Individuals covered" card |
| 3 | Assets covered, each with coverage / limit / deductible / premium | `assetsLabel`, `assets[]` | One compact row per entity ("10 on schedule · 1 declined"); tap for the full schedule in a sheet (`/asset`). "See more" past 6. Entities with no schedule are plain rows. |
| 4a | What's included | `details.included` (+ `limit` / `deductible` / `premium` when the item is a scheduled coverage) | Tile + carousel; cards show whichever of the three exist |
| 4b | Policy specifications / key endorsements, sub-limits, discounts, state limits | `details.specs` | Tile + carousel |
| 4c | What's not included | `details.excluded` | Tile + carousel |
| 4d | Coverage limitations | `details.limits` | Tile + carousel |
| 4e | Coverage watch points (Critical / Moderate / Low) | `details.watch` + `severity` | Tile + carousel, severity chip |
| 5 | Deductibles | `details.deductibles` | Tile + carousel |
| 6 | Document sources | `sources[]` (evidence), `documentMap[]` (forms per page) | Citation on each section; "Document sources" list |
| 7 | Not available in the pages analyzed | `notAvailable[]` | "Not available" list |

Each detail item cites a `Source` by id: titled passage, PDF pages, form number,
fact rows and sometimes a verbatim excerpt. The section sheet shows all of it.

Scope bubbles above the carousel come from the `group` values of the selected
kind (a vehicle, a coverage part, "Across your policy"); one group means no
bubbles. None of this branches on policy type.

Two flat lists are kept for the older screens: `coverages[]` (limits at a
glance, Compare) and `insights[]` (Insights tab, Moe). They are derived from the
client's content, not new claims.

## Client rules we kept (Notion "Universal content rules")

Real asset names, never "Vehicle 1". Severity words are exactly Critical /
Moderate / Low. Statements are definitive and cite their source. Missing data
is listed under "Not available", not inferred.

## Per-line differences worth knowing

- **Personal auto / commercial auto**: assets are vehicles. Commercial adds
  named vs additional named insureds and covered-auto symbols.
- **Renters / condo**: one asset (the rented home / the unit). No dwelling
  limit. The condo page has no HOA section by design.
- **Personal / commercial umbrella**: assets are the underlying policies (and
  the layer), shown at a high level only.
- **General liability, property, BOP, package**: assets are locations or
  buildings; package and BOP use `group` to keep the client's part headings.
- **Workers' comp**: 196 assets (51 locations, 145 employee classes) with facts
  only, no coverage rows.
- **Term life**: the client has a template but no sample policy, so the two
  examples are fictional and written to the template (see below).

## Where each demo policy comes from

| id | Source | Real sample PDF linked |
| --- | --- | --- |
| `personalAuto` | ovie_personal_auto_insights | yes |
| `commercialAuto` | ovie_commercial_auto_insights | yes |
| `renters` | ovie_renters_insights | no |
| `condo` | ovie_condo_insights | no |
| `personalUmbrella` | ovie_umbrella_insights | no |
| `commercialUmbrella` | ovie_commercial_umbrella_insights | yes |
| `generalLiability` | ovie_commercial_general_liability_insights | no |
| `commercialProperty` | ovie_commercial_property_insights | no (hosted file 404s) |
| `bop` | Ovie_business_owners_insights | yes |
| `workersComp` | ovie_commercial_workers_compensation_insights | yes |
| `commercialPackage` | ovie_commercial_package_insights | yes |
| `termLifeLevel20`, `termLifeConvertible10` | Notion "Term Life — Insight Template" (fictional policies) | no |

Documents without a hosted PDF keep a file name and page count, as before.
Term life policies are invented but follow the template's order and caution
rules (suicide vs contestability kept separate, no premium-vs-benefit framing).
