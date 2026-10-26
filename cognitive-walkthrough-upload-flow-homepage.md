# Cognitive Walkthrough Report: Upload a file from the homepage

**Task**: Upload an insurance policy document starting from the Ovie homepage and reach the generated insights
**Interface**: `ovie_homepage.html` → upload options sheet (`assets/ovie-upload-options.js`) → `ovie_upload.html#review` → `#detail` (progress)
**Method**: Cognitive Walkthrough (Wharton et al., 1994), 4 questions per action
**Evidence**: Source read only (HTML/JS). Not run in a browser, no screenshots. Success rates are estimates, not measurements.

---

## User context

| | |
|---|---|
| **Persona** | First-time Ovie user, a policyholder (not an insurance professional) with 1–3 policies |
| **Device** | Phone, one-handed, inside the app shell |
| **Prior knowledge** | Knows "upload" from other apps. Doesn't know what "MiB" means. May not know which of their files is the "policy document" |
| **Motivation** | Wants to see what their policy covers without reading it |
| **Starting point** | Homepage, signed in, bottom nav visible |
| **Success** | Files confirmed, processing started, user can later find and open the generated insights |

---

## Action decomposition

1. Find the upload control on the homepage
2. Tap it and read the options sheet
3. Choose a source (Files / Camera / Request a link / Drive / OneDrive)
4. Notice and accept the privacy statement
5. Pick file(s) in the OS picker
6. Wait through "Preparing your files…" and the page change
7. On Review files: check, preview, add or remove files
8. Tap **Confirm & generate insights**
9. Understand the progress screen
10. Leave and come back (progress ring, completion toast)
11. Open the resulting insights

---

## Step-by-step

Ratings: ✅ good · ⚠️ risk · ❌ likely failure · – n/a

| # | Action | Q1 Right goal | Q2 Notice control | Q3 Associate | Q4 Progress seen |
|---|---|---|---|---|---|
| 1 | Find upload on homepage | ✅ | ⚠️ | ⚠️ | – |
| 2 | Tap Upload, read sheet | ✅ | ✅ | ⚠️ | ✅ |
| 3 | Choose a source | ✅ | ⚠️ | ⚠️ | ⚠️ |
| 4 | Privacy statement | ⚠️ | ❌ | ⚠️ | ❌ |
| 5 | OS file picker | ✅ | ✅ | ✅ | ⚠️ |
| 6 | Wait / page change | ⚠️ | – | – | ⚠️ |
| 7 | Review files | ✅ | ⚠️ | ⚠️ | ✅ |
| 8 | Confirm | ✅ | ✅ | ✅ | ⚠️ |
| 9 | Progress screen | ⚠️ | ⚠️ | ❌ | ✅ |
| 10 | Leave and return | ❌ | ⚠️ | ✅ | ⚠️ |
| 11 | Open insights | ❌ | ❌ | – | ❌ |

### Action 1: Find upload on homepage
- **Notice (⚠️)**: The raised centre button in the bottom nav has no visible label, only `aria-label="Upload"` (`ovie_homepage.html:1753`). Every other nav item has a text label. Novices tend to read an icon-only button as "share" or "export" more than as "add my document".
- **Associate (⚠️)**: Arrow-up-into-tray is a common upload icon, but nothing on the homepage body invites the first upload.
- **Fix**: Add a visible "Upload" label under the icon, or a first-run prompt ("Add your first policy") on the homepage that opens the same sheet.

### Action 2: Tap Upload, read the sheet
- **Associate (⚠️)**: Sheet title is "Upload your document" (singular) but the flow takes up to 10 files.
- Format line `PDF, PNG, JPG · 10 files · 25 MiB/file · 100 MiB total` is the first thing under the title. "MiB" is jargon and the line reads as a wall of limits before any option. Show it only after an error, or say "up to 10 files, 25 MB each".
- The sheet is a modal dialog with close button, backdrop-tap and Escape. Good escape routes.

### Action 3: Choose a source
- **Notice (⚠️)**: Google Drive and OneDrive sit under a collapsed **More**. Many policy PDFs live in email or Drive, so the likely source is hidden.
- **Associate (⚠️)**: "Request a link" doesn't say what it does or who the link goes to. In the preview it dead-ends with "Link requests are not connected in this HTML preview…".
- **Associate (⚠️)**: Drive/OneDrive open the same local file picker, with the message "Direct cloud sign-in is not connected in this preview." A user expecting a Drive sign-in gets a device picker.
- **Camera (⚠️)**: Accepts JPEG/PNG only, one capture at a time. A multi-page policy needs repeat trips through the sheet. The later screen shows "merged-images.pdf" with no earlier explanation.
- **Fix**: Hide or disable options that don't work in the build. Rename "Request a link" (e.g. "Ask someone to send it"). Tell camera users they can add more pages on the review screen.

### Action 4: Privacy statement
- The consent text sits at the bottom of the sheet as small plain text: "I understand that I am uploading sensitive insurance documents and confirm…". It is worded as a first-person agreement but has no checkbox and no button.
- **Notice (❌)**: Most users tap an option above it and never read it. If this is meant to be consent, tapping a source is the only act and that isn't visible. Either make it a "By continuing, you agree…" line placed directly above the options, or add a real checkbox.
- **Progress (❌)**: No acknowledgement that consent was recorded.

### Action 5: OS file picker
- `accept=".pdf,.png,.jpg,.jpeg"` filters well. Multi-select is on.
- **Progress (⚠️)**: Validation errors appear in the sheet after the picker closes (`role="alert"`). Messages are plain ("Choose PDF, PNG or JPG files."). But one bad file rejects the whole batch and doesn't name the offender.
- **Fix**: Name the file that failed and keep the valid ones.

### Action 6: Wait and page change
- The sheet shows "Preparing your files for review…", then a full page navigation to `ovie_upload.html#review`. Files are stored in IndexedDB, so this is quick.
- **Right goal (⚠️)**: The user leaves the homepage context and the sheet's close button is replaced by a new header. No transition tells them they've moved to a review step.
- **Progress (⚠️)**: Fine on a fast device, but nothing signals "step 1 of 2".

### Action 7: Review files
- Strong step. Header "Review files", helper "Preview your files and remove anything you don't want to upload.", "N files selected", tap a row to preview, bin icon to remove, **Add files** text link.
- **Notice (⚠️)**: Preview is the whole row, but nothing hints the row is tappable beyond the file icon. Add a chevron or "Preview".
- **Associate (⚠️)**: The trash icon removes immediately with no confirmation and no undo. Only a screen-reader announcement confirms it. One mis-tap loses a file.
- Removing every file leaves a disabled **Confirm** button with the explanation only in muted text above it.
- No duplicate check at this step. The same file added twice is accepted here and handled later as a "Duplicate" outcome.
- Header **X** (cancel) abandons the draft without a confirmation.

### Action 8: Confirm
- **Confirm & generate insights** is sticky, full width, clear. It changes to "Confirming…" while disabled.
- **Progress (⚠️)**: The button text promises insights. Nothing says how long that takes.

### Action 9: Progress screen
- Title "Upload & Generate Insights", copy "Reading your policy documents and generating insights.", stage labels **Extracting and Reading Data** → **Generating Insights** → **Insights generated**, with a progress bar. Clear and honest.
- **Right goal (⚠️)**: No expected time and no "you can leave this screen" message. The user doesn't know whether leaving will cancel processing.
- **Associate (❌)**: The header **X** here is labelled "Cancel" but only navigates back (`data-go="files"`). Processing continues. The icon promises a cancel that doesn't exist.
- Uploaded files are grouped under a generic "Uploaded documents" folder, collapsed by default. A user who picked 3 files sees none of them until they expand it.

### Action 10: Leave and return
- **Right goal (❌)**: The only cue on the homepage is a progress ring around the Upload icon (`ovie-upload-indicator.js`) plus an `aria-label` change. Without a visible label, a ring around an icon reads as decoration.
- Tapping Upload during processing opens the sheet with **View current upload status** as the first item. This is the right recovery path, but it relies on the user trying that button.
- **Progress (⚠️)**: The completion toast ("All policy insights are now generated.") shows for 5 s and has no action. It is dismissed if the user isn't looking, and it doesn't link to the insights.
- The user must reopen the sheet to see a finished upload, but `currentUpload()` hides the status item once stage 4 is reached, so a completed upload has no path back to its summary.

### Action 11: Open insights
- In `ovie-upload.js:64`, the **View insights** link is rendered only when `policy !== 'local'`. A real user upload uses the `local` group (`confirmDraft` sets `insightPolicies:['local']`).
- So after their own upload completes, the user sees the "Insights generated" badge and **no link to the insights**. This is the highest-impact finding: the task cannot be completed from this screen.
- **Fix**: Show a **View insights** link for `local` once ready, and make the completion toast tap-through.

---

## Failure points

### Critical blockers
1. **No "View insights" for the user's own upload** (Action 11). Completion is a dead end. Estimated to affect ~100% of users who finish a real upload.
2. **Completion has no route back** (Action 10). The toast is transient and non-interactive, the sheet's status item disappears at completion, and the nav ring just goes away.

### Major friction
3. **Icon-only Upload button** (Action 1). The entry point is the least discoverable control in the nav.
4. **Misleading "Cancel" X on the progress screen** (Action 9). It leaves; it doesn't cancel.
5. **Consent statement is passive and below the options** (Action 4). Likely unread; unclear whether it's binding.
6. **Non-working sources shown as live** (Action 3). Request a link, Drive and OneDrive all reach a dead-end or a different picker than their label promises.

### Minor
7. "MiB" jargon and limits line before any action (Action 2).
8. Whole batch rejected for one bad file, offender unnamed (Action 5).
9. Remove-file has no undo; Cancel has no confirm (Action 7).
10. No expected duration or "you can leave" message (Action 9).
11. Uploaded files hidden in a collapsed folder (Action 9).

### Code drift to be aware of
`ovie_homepage.html:2675-2685` still has an inline `#uploadPolicy` click handler that opens `#policyFilePicker` and shows a "selected for upload" toast. The capture-phase handler in `ovie-upload-indicator.js:69-88` calls `stopImmediatePropagation`, so this code never runs. It's dead code and a trap for anyone editing the homepage.

---

## Estimated success (first attempt, from this analysis only)

| User | Reaches Review | Confirms upload | Reaches insights afterwards |
|---|---|---|---|
| Novice | ~85% | ~80% | **~0% as built** (no link), ~50% with the link but without other fixes |
| Intermediate | ~95% | ~92% | ~0% as built |
| Expert | ~98% | ~95% | ~0% as built |

Upload itself is learnable. The failure is at the end of the task, not the start.

---

## Prioritised recommendations

**P0**
1. Render **View insights** for the `local` group when ready (`assets/ovie-upload.js:64`). Make the completion toast tappable.
2. Keep a "View last upload" route available after completion.

**P1**
3. Add a visible "Upload" label to the nav button, and consider a first-run homepage prompt.
4. Replace the progress-screen "Cancel" X with a plain Back/Close, or implement real cancel with a confirm.
5. Move the privacy statement above the options as "By continuing you agree…", or use a checkbox.
6. Disable or relabel sources that are not connected.

**P2**
7. Plain-language limits ("up to 10 files, 25 MB each"), shown on error.
8. Name the rejected file; keep valid ones.
9. Undo toast for remove-file; confirm on cancel with a non-empty draft.
10. Say "You can leave this screen. We'll tell you when it's ready." and give a time range.
11. Show file names on the progress screen without needing to expand.
12. Delete the dead inline picker code in `ovie_homepage.html`.

---

## Limits and next step
This is a predictive review from source. Validate with 5 first-time users on a phone, with particular attention to (a) finding Upload without a label, (b) what they do after "Insights generated", and (c) whether they notice the privacy statement. The existing `usability-test-plan-ovie-home.md` can be extended with these tasks.

Design-contract note: I did not read the root `DESIGN.md`, since this review proposes no UI changes. Read it before implementing any of the fixes above.
