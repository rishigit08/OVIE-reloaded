# Usability Test Plan: Ovie Home (`index.html`)

Status: **plan only. No participants have been run, so there are no findings yet.**
Prototype build tested: `index.html` on branch `local-work` (mobile-first, 480px max width).

## 1. Goals and decisions

The test should inform these decisions:

1. Do people understand "Needs your attention" and act on it? Today the rows only show a toast.
2. Can people find a specific policy and its premium, expiry date and source?
3. Does the premium breakdown (donut plus category rows) answer "what am I paying, and for what?"
4. Are the bottom navigation (Home, My Files, Upload, Insights, More), Ask Ovie and the profile drawer discoverable and correctly understood?

Out of scope: the Get Started flow, the upload flow internals, the quote comparison pages, and Ask Ovie answer quality. Test those separately.

## 2. Method

| Item | Choice | Why |
|---|---|---|
| Type | Moderated, remote or in person, think-aloud | Early prototype, and several controls are stubs. A moderator can probe expectations at the moment of the dead end. |
| Device | Phone (iOS and Android mix), prototype opened in the phone browser | The shell is a 480px mobile layout. A desktop browser shows a phone-width column and changes tap behaviour. |
| Sample | 5 to 8 per segment | Per the skill's guidance for moderated tests. |
| Session length | 45 minutes, 5 tasks plus debrief | |
| Pilot | 1 to 2 sessions before the main batch | Confirm tasks are not leaking labels such as "Insights" or "See all". |

### Segments (recruit 5 to 8 each)

- **A. Multi-policy holder:** 3 or more personal policies (auto, home, renters or umbrella) with different carriers, who manage them themselves.
- **B. Light holder:** 1 or 2 policies, who rarely open insurance documents.

Exclude employees, friends, family and anyone in insurance or UX. Recruit for a mix of age and phone OS.

## 3. Prototype constraints the moderator must know

These behaviours are in the code. Participants will hit them, so decide the moderator response up front. Do not apologise or explain during a task; note it and probe afterwards.

| Control | Prototype behaviour |
|---|---|
| "Needs your attention" rows (3) | Show a toast with the insight text. No navigation. |
| Search (header) | Toast only: "Search policies and documents". |
| My Files (nav) | Toast only: "My Files". |
| Upload (nav centre) | Opens the system file picker, then a toast. The deeper upload scripts are loaded from `assets/`. |
| Insights (nav) | Scrolls to "Needs your attention" on the same page. It is not a separate screen. |
| Bell (header) | Scrolls to "Upcoming expiry dates". It has a red dot. |
| More, "Compare Quotes" | Navigates to `ovie_upload_quote_comparison.html`. |
| More, "Manage Shared Documents" | Toast: "not connected in this prototype". |
| Profile drawer | "My Profile" navigates to `MyProfile.html`. Support, Log out, Settings sub-items and the legal links are toasts. |
| Policy rows | Real accordions with details. Two of the five policies are hidden until "See all 5". |

Because several likely destinations are stubs, **task success on those tasks means the participant went to the right control**, not that the flow completed. Define this in the scoring sheet.

## 4. Tasks (full script in `usability-tasks-ovie-home.md`)

| # | Goal | Decision it informs | Success definition |
|---|---|---|---|
| 1 | Orientation: say what this screen is for and what needs doing | 1, 4 | Correctly states it is a policy overview and names at least one flagged item. |
| 2 | Find when a specific policy ends and what it costs | 2 | Opens the correct policy detail or expiry row and reads the right value. |
| 3 | Act on a flagged problem (the Camry minimum coverage warning) | 1, 2 | Taps the insight, reads it, then tries to find the Camry policy. Record where they expect to go. |
| 4 | Work out what share of spend goes to auto, and which policies make it up | 3 | Opens the Auto row and names both vehicles with the correct total. |
| 5 | Add a new policy document received by email | 4 | Reaches the upload control, or finds the inbox address in the profile drawer. |

An optional task 6 covers finding a way to compare quotes. It checks whether More is a discoverable home for that.

## 5. Metrics to collect per task

- Completion: success, success with assistance, fail, abandon. The assistance rule is in the task script.
- Time on task, and path taken against the expected path.
- Errors and wrong taps, including taps on stubs.
- Post-task Single Ease Question (SEQ, 1 to 7).
- Verbatim language: what they call the sections and what they expected the insights to do.
- Debrief: System Usability Scale (SUS) is optional at this sample size. Report it only as a descriptive score.

## 6. Pre-test hypotheses from reading the code

**These are expert-review hypotheses, not usability findings.** They come from reading the HTML and JS, not from observing users. Each one should be confirmed or dropped by the sessions.

| ID | Hypothesis | Task | Evidence in code |
|---|---|---|---|
| H1 | Insight rows look like links (chevron, hover state) but only raise a transient toast. People may feel the app did nothing, or miss the toast before reading it. | 3 | `index.html` line 3163 to 3165 |
| H2 | The Camry policy that has the warning is hidden behind "See all 5". People may not find it from the insight. | 3 | `extra-policy` elements are `hidden`, line 1899 to 1907 |
| H3 | The bottom-nav "Insights" tab is an in-page scroll to a section above, not a separate screen. People expecting a destination may think it did nothing, or lose their place. | 1, 3 | `#insightsNav href="#insights-heading"`, line 1971 |
| H4 | The bell has a red notification dot but goes to expiry dates, not to notifications. Its label is "Go to upcoming dates". | 1 | lines 1822 to 1825, 3158 |
| H5 | The centre Upload button is icon-only with no visible text label, unlike the other four nav items. | 5 | line 1970 |
| H6 | The "Home policy ends in 12 days" insight and the first expiry row repeat the same fact. People may read this as emphasis or as clutter. | 1, 2 | lines 1834 and 1914 |
| H7 | Date formats differ: "Sep 12" has no year, while "Jan 20, 2027" does. It may be unclear whether the year is next year or this year. | 2 | policy rows, lines 1867 to 1903 |
| H8 | The donut segments are not interactive; only the list rows are. People may tap the chart and nothing happens. | 4 | `.donut-segment` has no click handler, lines 1928 to 1931 |
| H9 | The premium list groups by type, but the home policy is named "Austin home" and the renters policy is "Downtown apartment". Mapping the "Renters" category to a named policy may be non-obvious. | 4 | lines 1949 and 1957 |
| H10 | Several expected destinations (Search, My Files, Support, Settings sub-items) are stubs. Test results for those will say little about the final design. | all | lines 2459, 2568, 3166, 3167 |

## 7. Accessibility check (separate from user testing)

Run a screen-reader and keyboard pass (VoiceOver and TalkBack) before or alongside the sessions. Include at least one participant who uses a screen reader if recruitment allows. The page already has labelled controls and focus styles, but nothing here has been tested with assistive tech.

## 8. Reporting

After the sessions, produce `usability-findings-ovie-home.md` using the skill's report structure (severity: critical, major, minor, cosmetic; frequency; evidence; recommendation; what worked). Hypotheses H1 to H10 move into findings only when at least two participants in a segment show the problem.

## 9. Data gaps (stated, not estimated)

- No participant data exists. Completion rates, times, SEQ and SUS are all unobtained.
- Recruit counts, dates and tooling (video platform, recording) are not yet decided.
- No analytics or support-ticket data was provided, so task priority is based on the screen's contents, not on usage.

## 10. Next steps

1. Confirm segments, devices and the recording tool.
2. Decide whether to wire the insight rows and My Files to real destinations before testing, or to test with the stubs and use the sessions to learn what people expect there.
3. Pilot with 1 or 2 people, adjust the script, then run the main batch.
4. Synthesise after session 4 or 5, and re-test after fixes.
