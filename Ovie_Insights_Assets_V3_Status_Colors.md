# Ovie Insights Assets V3: coverage status colours

Colours for the four coverage statuses in [Ovie_Insights_Assets_V3.html](Ovie_Insights_Assets_V3.html). Rules for when each status applies are in [Ovie_Insights_Assets_V3_Rules.md](Ovie_Insights_Assets_V3_Rules.md).

## Colour codes

| Status | Tile background | Tile border | Status label | Value text | Chip dot | Shadow (5%) |
|---|---|---|---|---|---|---|
| **Covered** | `#E7FFF4` | `#BFE6CF` | `#0D7D07` | `#111111` | `#0D7D07` | `rgba(13, 125, 7, 0.05)` |
| **Gap** | `#FFEDED` | `#F0C9C6` | `#A63A33` | `#A63A33` | `#A63A33` | `rgba(166, 58, 51, 0.05)` |
| **Not covered** | `#FFF1E7` | `#F3D4C0` | `#C2410C` | `#C2410C` | `#C2410C` | `rgba(194, 65, 12, 0.05)` |
| **Overlap** | `#FEF9D7` | `#E8D868` | `#6B5A00` | `#111111` | `#E8D868` | `rgba(199, 170, 20, 0.05)` |

Shadows are `0 0 30px` with the colour above, the same blur as the card glow.

## At a glance

| Status | Colour | Icon | Value text on the tile |
|---|---|---|---|
| Covered | Green | Circle check | The limit or deductible |
| Gap | Red | Triangle alert | "Not included" |
| Not covered | Orange | Circle X | "Excluded" |
| Overlap | Yellow | Layers | The limit |

Colour is never the only signal. Each status also has a text label and an icon.

## Where each colour is used

| Place | What takes the status colour |
|---|---|
| Coverage map tile | Background, border, shadow, status label, and the value for Gap and Not covered |
| Status filter chips above the tiles | A 10px dot in the dot colour, next to the status name and count |
| Coverage sheet, "Also covered for" rows | The status word, in the label colour |

The sheet heading ("Covered", "Gap", "Overlap", "Not covered") stays in the normal text colour `#111111`.

## CSS names

| Role | CSS variable or value |
|---|---|
| Covered | `--success: #0D7D07`, `--success-soft: #E7FFF4`, `--success-line: #BFE6CF` |
| Gap | `--danger: #A63A33`, `--danger-soft: #FFEDED`, border `#F0C9C6` |
| Not covered | `--mod: #C2410C`, `--mod-soft: #FFF1E7`, border `#F3D4C0` |
| Overlap | `--yel-soft: #FEF9D7`, `--yel-line: #E8D868`, `--yel-ink: #6B5A00` |

The CSS classes use older letters from earlier colour swaps. **Gap is class `o` and Not covered is class `r`.** Covered is `g` and Overlap is `y`. The visible labels and colours are correct. Only the class names are crossed.
