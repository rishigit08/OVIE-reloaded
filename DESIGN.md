---
version: beta
name: "Ovie Product Design System"
description: "Canonical visual, interaction, accessibility, content, responsive, and motion rules for every Ovie module and platform."
scope: "app-wide"
platform: "mobile-and-desktop-web"
colors:
  primary: "#6B4062"
  primary-dark: "#54324D"
  primary-disabled-background: "#E8DEE5"
  primary-disabled-text: "#795972"
  ai-gradient-start: "#BD4BA5"
  ai-gradient-end: "#5C2E8B"
  text-primary: "#111111"
  text-secondary: "#333A3D"
  text-tertiary: "#5F6368"
  icon-default: "#5F6368"
  icon-strong: "#111111"
  icon-brand: "#6B4062"
  icon-warning: "#8A5A06"
  icon-success: "#0D7D07"
  icon-danger: "#A63A33"
  icon-inverse: "#FFFFFF"
  background-primary: "#FFFFFF"
  background-canvas: "#F6F6F6"
  background-subtle: "#F6F6F6"
  background-control: "#E3E3E3"
  prototype-backdrop: "#E3E3E3"
  success: "#0D7D07"
  warning: "#8A5A06"
  danger: "#A63A33"
  info-background: "#F5EDF3"
  success-background: "#E7FFF4"
  warning-background: "#FFF5DF"
  warning-border: "#E7C982"
  warning-text: "#634106"
  warning-copy: "#71551F"
  danger-background: "#FFEDED"
  critical-text: "#7A3000"
  border-default: "#D8DDDB"
  border-subtle: "#ECEFED"
  overlay: "rgba(17, 24, 23, 0.58)"
focus:
  ring: "0 0 0 3px rgba(107, 64, 98, 0.24)"
  border: "#6B4062"
elevation:
  small: "0 2px 8px rgba(17, 17, 17, 0.07)"
  overlay: "0 6px 16px rgba(17, 17, 17, 0.12)"
  navigation: "0 4px 8px rgba(17, 17, 17, 0.10)"
  upload-action: "0 2px 4px rgba(84, 50, 77, 0.22)"
  ai-fab: "inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 4px 8px rgba(84, 50, 77, 0.28)"
typography:
  family: "Figtree, system-ui, sans-serif"
  body: "14px/20px regular"
  body-emphasis: "14px/20px semibold"
  heading: "18px/24px semibold"
  display: "32px/36px semibold"
  caption: "12px/16px regular or semibold"
  micro: "11px/16px semibold"
shape:
  radius: "12px"
  pill: "999px"
spacing:
  page-gutter: "16px"
  section-gap: "18px"
  control-minimum: "44px"
  card-padding: "16px"
components:
  app-shell: {}
  top-bar: {}
  card: {}
  list-row: {}
  button: {}
  icon-button: {}
  form-control: {}
  select-listbox: {}
  disclosure: {}
  bottom-sheet: {}
  chat-dock: {}
  feedback: {}
---

# Ovie Product Design System

## 1. Purpose and authority

This workspace-root file is the single design contract for the full Ovie product, including mobile and desktop modules, Home, policies, Insights, My Files, Ask Ovie, Access, profile, prototypes, and future flows. It is not limited to the umbrella-policy experience or any one implementation module.

- Treat this file as the sole normative visual, interaction, accessibility, content, responsive, and motion source for every Ovie module.
- Do not create or use module-specific `DESIGN.md` files. Put durable module or platform variants in a clearly scoped section of this file so the underlying system remains shared.
- Every agent must read this complete root contract before planning, reviewing, or implementing Ovie UI. A nested module document, mock, or implementation cannot silently override it.
- Module-level `AGENTS.md`, README files, and implementation notes may document operational constraints and link here, but must not duplicate design tokens or establish a competing design system.
- If code or a selected mock conflicts with this contract, surface the drift. Change the root contract only when the user approves a durable system decision; otherwise bring the implementation back into compliance.
- Map these tokens into shared runtime variables or components. Do not copy and independently alter values per screen.
- Reuse established primitives before creating screen-specific equivalents.
- A current, explicit product decision can extend this system. Record durable changes here and update the shared implementation in the same change.
- The dedicated [Insights pages](#12-insights-pages) section adds rules for document-grounded insurance summaries without changing the app-wide foundations.

## 2. Product character

### Creative north star

Ovie should feel like a careful insurance guide held in one hand: calm, legible, factual, and clear about what the available documents do and do not establish.

### Audience and use

- People reviewing policies, documents, tasks, and insurance questions on phones and desktop browsers.
- Sessions may be brief, but decisions can be consequential. Prioritize comprehension over density or decoration.
- The initial market is United States personal insurance in English. Preserve exact policy terminology and locale-appropriate dates, currencies, and identifiers.
- Ovie is a document-based policy wallet with AI-generated insights and Ask Ovie. It has no direct carrier integration, so every policy fact, date, premium, and finding must be grounded in a user-uploaded document.

### Visual character

- Plum is the recognizable Ovie brand signal; use it deliberately for primary actions, selected states, and one focal area—not every surface.
- Most surfaces are flat, white, and content-led on a soft neutral page background.
- Avoid marketing-dashboard styling, decorative finance graphics, generic insurance imagery, excess gradients, and repeated hero-metric cards.
- Never let presentation imply that Ovie guarantees coverage or replaces an agent or carrier.

## 3. Color system

### Core roles

| Role | Token | Value | Use |
|---|---|---:|---|
| Primary action | `primary` | `#6B4062` | Primary buttons, selected controls, focal panels |
| Primary hover/pressed | `primary-dark` | `#54324D` | Pressed and hover state on plum controls |
| Primary disabled surface | `primary-disabled-background` | `#E8DEE5` | Disabled primary-button background |
| Primary disabled text | `primary-disabled-text` | `#795972` | Disabled primary-button label and icon; 4.59:1 contrast on the disabled surface |
| AI gradient start | `ai-gradient-start` | `#BD4BA5` | Left endpoint for the Ask Ovie focal action only |
| AI gradient end | `ai-gradient-end` | `#5C2E8B` | Right endpoint for the Ask Ovie focal action only |
| Primary text | `text-primary` | `#111111` | Headings, values, core copy |
| Secondary text | `text-secondary` | `#333A3D` | Supporting copy and labels |
| Tertiary text | `text-tertiary` | `#5F6368` | Metadata, placeholder text, explanatory copy |
| Default icon | `icon-default` | `#5F6368` | Neutral icons, navigation, chevrons, share, close, search, and information actions |
| Strong icon | `icon-strong` | `#111111` | High-emphasis icons that need the same visual weight as primary text |
| Brand icon | `icon-brand` | `#6B4062` | Icons in plum-tinted containers and selected brand actions |
| Warning icon | `icon-warning` | `#8A5A06` | Icons communicating attention, verification, or missing evidence |
| Success icon | `icon-success` | `#0D7D07` | Icons communicating confirmed success or positive feedback |
| Danger icon | `icon-danger` | `#A63A33` | Icons communicating errors, destructive actions, or negative feedback |
| Inverse icon | `icon-inverse` | `#FFFFFF` | Icons on plum, gradient, or other dark surfaces |
| Primary surface | `background-primary` | `#FFFFFF` | Cards, sheets, inputs |
| App canvas | `background-canvas` | `#F6F6F6` | Main application background behind content surfaces |
| Subtle background | `background-subtle` | `#F6F6F6` | Quiet inset regions, neutral pills, and low-emphasis hover states |
| Neutral control background | `background-control` | `#E3E3E3` | Persistent neutral-filled icon buttons and compact controls |
| Prototype backdrop | `prototype-backdrop` | `#E3E3E3` | Preview-only area outside a centered app shell; do not use as the application canvas |
| Success | `success` | `#0D7D07` | Confirmed positive state |
| Warning | `warning` | `#8A5A06` | Verification needed or missing evidence |
| Danger | `danger` | `#A63A33` | Errors and negative feedback |
| Focus ring color | `focus-ring-color` | `rgba(107, 64, 98, 0.24)` | Three-pixel outer focus ring for keyboard-focused controls |

### Rules

- Body text must meet WCAG AA contrast: at least 4.5:1. Large or semibold text must meet at least 3:1.
- Do not use color as the only signal. Pair status color with text, an icon, or a state label.
- Text and icon roles are separate semantic APIs. Bind text layers only to `text-*` tokens and bind icon fills or strokes only to `icon-*` tokens, even when the resolved hex values are identical. Do not bind icons to text-color variables in Figma or implementation code.
- Use amber only for something that needs attention or verification; it is not a generic accent.
- Keep Home attention rows on the neutral card surface. Use the alert palette consistently for every attention item: soft amber icon containers, `icon-warning` strokes, and headings in alert text `#634106`.
- Use green only for confirmed success or positive feedback. Use red only for errors, destructive states, or negative feedback.
- The premium donut alone may use the ten-step primary-plum scale `#40243A`, `#54324D`, `#6B4062`, `#7D5274`, `#916781`, `#A67D9B`, `#BA94B0`, `#CDAFC5`, `#DFC9D9`, and `#F0E5ED` to distinguish policy categories. These shades are categorical, not semantic, and must not replace the established colors used by category icons, text, alerts, cards, navigation, or other components.
- In the premium-breakdown area, every category icon uses `icon-brand` (`#6B4062`) for a consistent, visible stroke. The icon containers and donut segments carry the different plum saturations used to distinguish categories; the icons themselves do not change color by category.
- Neutral information icons, accordion chevrons, navigation icons, and top-bar utility icons use `icon-default`.
- Explanatory copy inside expanded detail sections, Insights disclaimer copy, and the helpfulness prompt use `text-tertiary` (`#5F6368`). Keep headings, labels, titles, and highlighted values in `text-primary` unless a semantic state requires another token.
- Evidence-gap callouts use `text-secondary` (`#333A3D`) for both their semibold label and supporting sentence. This distinguishes unresolved evidence from tertiary explanatory copy without implying an error or exclusion.
- Lucide icons inside plum-tinted containers use the `icon-brand` stroke.

## 4. Typography

- Use Figtree throughout the app, with system sans-serif as fallback.
- Body copy, labels, list content, metadata, and controls: 14px regular with 20px line height.
- Highlights, values, active labels, and important phrases: 14px semibold.
- Page titles, card headings, section headings, sheet headings: 18px semibold with 24px line height.
- Captions and compact statuses: 12px with 16px line height; use semibold when the text represents status.
- Reserve 32px/36px semibold display text for a single high-priority value when the page genuinely needs it.
- Use sentence case. Do not use decorative uppercase tracking.
- Let long names, identifiers, dates, and policy requirements wrap. Do not truncate essential content.
- Prefer stacked label/value layouts when values can be long or unpredictable.

## 5. Layout and responsive behavior

- Design from the shared content hierarchy outward. The mobile reference canvas is 390px wide and may expand to 480px; the layout must also work at narrower phone widths and desktop browser sizes without changing the visual identity.
- Use 16px page gutters and 18px vertical spacing between major sections.
- Default card content padding is 16px. A dense list may use 14px horizontal padding if every row in that component uses it consistently.
- Align page-level content with the text inside neighboring cards. A control placed on the page background still inherits the card-content alignment.
- Use Flexbox for rows and stacked layouts. Avoid fixed heights for content regions.
- Sticky headers and composers must not obscure focused fields, final content, or system safe areas.
- Hide visible scrollbars without disabling scrolling.
- Use one-column layouts on phone. Desktop modules may use a persistent 240px navigation rail, a restrained top bar, and a max-width two-column content area when the secondary column contains genuinely supporting information. Below 860px, collapse to the shared one-column reading order.

## 6. Surfaces, shape, and elevation

- Cards, buttons, icon containers, inputs, textareas, and sheets use a 12px radius.
- Status chips may use a full pill radius.
- Static cards have no drop shadow and normally no stroke. Separate them from the page using surface color and spacing.
- Use subtle dividers inside list and disclosure cards; do not outline every group.
- Use the small elevation `0 2px 8px rgba(17, 17, 17, 0.07)` only for open dropdowns, selects, and small anchored popovers.
- Drawers, dialogs, and bottom sheets use the same overlay elevation: `0 6px 16px rgba(17, 17, 17, 0.12)`. Do not create direction-specific drawer or sheet shadows.
- The floating bottom navigation uses `0 4px 8px rgba(17, 17, 17, 0.10)`.
- The centered Upload action inside the bottom navigation uses its own plum elevation: `0 2px 4px rgba(84, 50, 77, 0.22)`.
- The Ask Ovie floating action button uses its dedicated two-layer elevation: `inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 4px 8px rgba(84, 50, 77, 0.28)`.
- The top bar, persistent chat dock, static cards, list rows, inputs, and ordinary buttons have no elevation. Focus rings are accessibility indicators and are not elevation.
- Shadows used only to represent an operating-system keyboard or to separate a centered mobile prototype from the surrounding review canvas are preview treatments, not product elevation tokens.
- Avoid nested cards. Use a divider, grouped rows, or an inset neutral note instead.

### Inset neutral notes

- Use an inset neutral note for a short supporting qualification, interpretation aid, or evidence clarification that needs to be distinct from the surrounding facts. Examples include how to read blank schedule values, exceptions to a displayed rating, and whether a deposit is included in an annual cost.
- Use `background-subtle` (`#F6F6F6`), 12px corners, 12px internal padding, and no border or shadow. Keep the note inside the parent card's standard 16px content gutters; when it follows content within those gutters, give it 12px top spacing.
- Use 14px/20px body text. Explanatory notes use `text-tertiary`; evidence-gap labels and supporting sentences use `text-secondary`. Any short heading or highlighted fact uses its normal text role.
- Keep the note beside or immediately after the facts it qualifies. Group related explanatory sentences in one note; do not create a separate box for every paragraph or put another box inside a note.
- Keep ordinary introductions, primary facts, limits, exclusions, and severity-marked watch points in their established layouts. Use semantic alerts for actionable warnings; a neutral note must not weaken or replace their warning treatment.

## 7. App shell and navigation

### Top bar

- The top bar contains a back or menu action, an 18px semibold page title, and up to two utility actions when both are useful. When search and share are shown together, place search immediately before share and give both the canonical homepage utility treatment: 44×44 targets, 12px radius, `background-control`, `icon-default` through `currentColor` outline icons, primary-soft hover, a 0.96 pressed scale, and the shared plum focus ring.
- Icon-only actions have an accessible name and at least a 44×44px target.
- Use icons without redundant labels when the meaning is familiar and an accessible label exists; for example, show only the share icon.
- On scrolling pages, including Home and long detail pages, the top bar slides out after deliberate downward scrolling and returns as soon as upward scrolling is detected. Keep it visible near the top and while any header control has focus. Use a smooth 180–260ms ease-out transition and preserve keyboard access.
- Do not add a shadow to the top bar. A subtle divider is sufficient when separation is needed.

### Bottom navigation and focused flows

- Use the app's global navigation only on primary destinations such as Home, My Files, Insights, and Access. Use the Lucide Brain Circuit icon for the Insights destination.
- Give the centered Upload action a 48px solid-plum circular container. Keep its Lucide Upload glyph at 22px so it matches the visual size and stroke weight of the other navigation icons.
- Do not show the global bottom navigation inside a focused detail or Insights flow when it competes with the task.
- When Ask Ovie is contextually available, use the persistent composer defined below instead of duplicating a separate promotional card.

### Ask Ovie composer

- The persistent composer sits at the bottom safe area and contains one input plus a microphone or send action.
- On umbrella and commercial property Insights, the persistent bar is an entry point: show a microphone action, and open the Ask Ovie sheet when the input or action is selected. Focus the editable sheet input immediately. In the sheet, show the microphone for empty or whitespace-only input and Arrow Right for a nonempty question; Enter submits a question. Restore focus to the originating control when the sheet closes. Reuse the Home keyboard-preview and mobile keyboard handling rules below.
- Its container is transparent at approximately 30% surface opacity with a subtle background blur and no top stroke.
- The input remains opaque enough for legibility and has an accessible label.
- Reserve sufficient bottom padding so page content can scroll above the composer.
- On Home, contextual Ask Ovie access uses a 56px floating action button at the lower-right, positioned above the global navigation and safe area. As the app's single AI-specific focal action, it uses a left-to-right linear gradient from `ai-gradient-start` to `ai-gradient-end`, with the custom Ovie assistant mark in crisp white. Do not reuse this expressive gradient for routine actions or informational surfaces. The button opens the canonical native modal bottom sheet rather than adding another card to the content stack.
- The Home Ask Ovie sheet focuses its labeled question field immediately so the device keyboard opens from the same tap. Dim and inert the homepage, support Escape and safe backdrop dismissal, restore focus to the floating button, and keep the active field and send action above the virtual keyboard.
- The sheet send action uses Lucide Arrow Right. Desktop previews render a non-interactive Android/Gboard-style light keyboard representation, including suggestions and gesture navigation, for design review even when the outer desktop browser is wider than the centered mobile app shell. Hide that representation on coarse-pointer touch devices so Android uses its native mobile keyboard without duplication.
- Reserve a stable scrollbar gutter on the application root before locking page scroll for a modal sheet. Do not compensate with body padding: fixed navigation and floating controls do not share that body box and can shift independently. Opening or closing the sheet must not change the homepage content width, app-shell centering, bottom-navigation width, or card geometry.

## 8. Shared components

### Cards and section headings

- Put a card's heading inside the card it labels.
- Use 18px semibold headings. Remove routine subtext beneath headings unless it changes a decision or prevents misunderstanding.
- Do not use a separate floating heading followed by a visually unrelated card.

### Lists and rows

- Rows use a minimum 44px target; 56–64px is preferred when they contain an icon and two text lines.
- A list row may include: leading icon container, primary label, secondary metadata, optional status, and a trailing chevron.
- Carrier or source metadata sits below the primary label, not inline with it.
- Keep row status short, explicit, and right-aligned. Never hide an unavailable status behind a tap.
- Destination lists on the app background use separate white rows with a 12px radius, an 8px gap between rows, no static shadow, and no visible outline. Use the shared card/list padding and let row height grow when labels or identifiers wrap.
- When a row has secondary actions, keep the full row as the primary destination and place a trailing Lucide Ellipsis Vertical button in its own 44×44px target. The secondary-action button must not trigger the row destination.
- A masked policy identifier may include an adjacent 44px reveal control using Lucide Eye/Eye Off. Give the control an explicit “Show policy number” or “Hide policy number” accessible name and never reveal or hide the value when the surrounding row is selected.

### Buttons

- Primary button: solid plum with white semibold label.
- Secondary button: white or transparent with an explicit neutral border only when needed for affordance.
- Ghost/icon button: transparent with a 44px target.
- Disabled primary buttons use the muted plum surface `#E8DEE5` with muted plum label/icon `#795972`, retain full opacity, remove elevation, and use the non-interactive cursor. Do not use generic gray for disabled primary actions. The disabled treatment must remain legible and must not be the only explanation for what is unavailable.
- Every action has hover/pressed, focus-visible, loading, success, and failure behavior where applicable.

### Forms

- Labels remain visible; placeholders are examples, not substitutes for labels.
- All placeholder text in inputs, textareas, search fields, and other form controls uses `text-tertiary` (`#5F6368`).
- Inputs, textareas, search fields, selects, and other form controls use the shared focus treatment: change the control border to primary plum `#6B4062` and apply `focus-ring` as `0 0 0 3px rgba(107, 64, 98, 0.24)`.
- Apply the focus treatment with `:focus-visible` for a single control. For a composite control such as a search field or composer, remove the inner input outline only after applying the same treatment to the outer control with `:focus-within`, so the complete control receives one ring.
- Do not create component-specific focus-ring opacities, widths, colors, or shadow values. A focus ring is an accessibility indicator, not elevation.
- The compact list-search field is a minimum 44px white surface with a 12px radius, a leading Lucide Search icon using `icon-default`, and a visually hidden persistent label. When the field sits on `background-primary` or another white surface, give it a 1px `border-default` stroke so its boundary remains visible; when it sits directly on `background-canvas`, keep it borderless. On focus, change that stroke to the shared primary focus border and apply the canonical focus ring. Show the trailing 44px Lucide X clear action using `icon-default` only while the field contains text; clearing returns focus to the search input.
- A compact filter trigger is a minimum 44px white control with a Lucide filter icon using `icon-default`, the active filter label, and a small neutral count pill for the currently visible results. It opens the canonical modal filter sheet and exposes its expanded state to assistive technology.
- Dropdown triggers and menus use the Ovie primary plum (`#6B4062`) for active borders, selected text, chevrons, and focus treatment. Both trigger and menu use the shared 12px radius; the open menu matches the trigger width and uses the shared small elevation token.
- When dropdown popup geometry is part of the design, use the maintained accessible Select/Listbox pattern rather than a native menu. Preserve visible labels, Arrow/Home/End navigation, Enter/Space selection, Escape dismissal, typeahead, selected-state announcements, focus restoration, collision-aware placement, and the underlying form value.
- Validation appears adjacent to the relevant control, uses direct language, and is announced to assistive technology.
- Preserve user input after validation errors.
- Use radio buttons for a mutually exclusive set; do not simulate them with unrelated buttons.
- In a radio filter sheet, make the full option row a label with a minimum 56px target, a 40×40px neutral icon container, a semibold option label, an adjacent count pill, and the native 20px radio control at the trailing edge. Use primary plum for the selected label, radio, icon container, and count treatment; retain a visible focus ring and native checked semantics.
- Use a labeled switch only for an immediate binary filter or setting. Place the text label before a 44×24px pill track with a 20px white thumb; use `border-default` for off and primary plum for on. Implement it with an accessible checkbox, keep the full label tappable, expose the checked state, and show the shared plum focus ring around the track.
- Search, policy-type filtering, and binary ownership filtering combine as an intersection. Update the visible-result count immediately and show the standard actionable empty state when no rows match.

### Accordions and disclosures

- Use native disclosure behavior where possible.
- The full summary row is tappable and has a minimum 44px target.
- Place the title first, optional item count second, and the neutral chevron last.
- Rotate the chevron smoothly when expanded. Do not change the title or count position.
- Keep headings and their disclosure rows within the same card.

### Statuses, alerts, and empty states

- Success confirms an achieved state. Warning identifies an action or evidence gap. Danger communicates an error or destructive consequence.
- Alerts use a tinted semantic background, matching icon and copy, and an explicit heading.
- Empty states explain what is missing and, when possible, offer one next action.
- “Not available” means the supplied evidence does not establish a fact; it does not mean the policy excludes it.

## 9. Icons

- Use Lucide outline icons as editable vectors rather than raster images.
- Ask Ovie is the single icon-system exception: use the canonical custom Ovie assistant mark from `assets/ovie-assistant-mark.svg`. Its 1.5px continuous rounded speech contour, lower-right integrated tail, and two vertical pill eyes identify the assistant without implying a generic message action.
- Render the mark as inline current-color vector geometry when an external SVG mask is unreliable, including local `file://` previews. Preserve the canonical asset's path, proportions, and stroke exactly rather than substituting a different icon.
- Render the assistant mark through `currentColor`, resolving to `icon-inverse` on the Ask Ovie gradient and `icon-brand` on light surfaces. Use it only for Ask Ovie entry points, composers, and conversation headers; never reuse it for Insights, alerts, support, or ordinary messaging.
- Default stroke width is visually consistent with Lucide's standard weight.
- Icons inherit an `icon-*` semantic color from the component; avoid hardcoded per-image filters when inline SVG or `currentColor` is available. When using `currentColor`, set the component's color property from an icon token, not a text token.
- In Figma, bind vector stroke and fill properties to `color/icon/default`, `color/icon/strong`, `color/icon/brand`, `color/icon/warning`, `color/icon/success`, `color/icon/danger`, or `color/icon/inverse` as appropriate. Never bind an icon vector to `color/text/*`.
- Use `icon-default` for info icons, neutral navigation, search, share, close, and accordion chevrons.
- Use `icon-brand` for icons inside plum-tinted icon containers and selected brand actions.
- Use `icon-warning` for icons inside warning components, including source/info actions.
- Use `icon-success` and `icon-danger` for positive and negative feedback or state icons respectively.
- Use `icon-inverse` for icons placed on plum, gradient, or other dark surfaces.
- Decorative icons use empty alternative text; icon-only controls require an accessible name.

## 10. Overlays, bottom sheets, and transient feedback

### Bottom sheets and dialogs

- Use native modal dialogs for sheets and modal forms.
- A mobile sheet spans the full app width, attaches to the bottom edge, and uses 12px top corners.
- Use the shared layer order for sticky content, navigation, floating actions, backdrops, sheets, and toasts; a sheet and its backdrop always sit above the floating action and global navigation, while toasts remain topmost.
- Include a drag handle, 18px semibold title, 44px close target, and scrollable body.
- Support Escape, backdrop dismissal where safe, focus trapping, and focus restoration.
- Keep primary actions visible within the sheet's reading flow; do not cover content with them.
- Use a dark translucent backdrop. Background content must not remain interactive.
- Action-sheet rows use a minimum 60px target, a 40×40px plum-tinted Lucide icon container, a 14px semibold label, and subtle full-width dividers between actions. Keep the row surface flat and restore focus to the originating ellipsis button after dismissal or selection.
- Filter sheets use an 18px semibold descriptive title, such as “Filter by policy type,” followed by full-width native radio rows. Selecting an option applies it immediately and dismisses the sheet; closing without selection preserves the current filter.
- When a filter option set can grow beyond a short scan, use the established full-height bottom-sheet pattern from the Ask Ovie policy picker. Inset the sheet 52px from the viewport top, include the drag handle and close action, place the compact list-search field directly below the sheet header with 16px gutters, and let the option list scroll independently. Selecting an option applies it immediately and dismisses the sheet; Close or Escape preserves the current filter and restores focus to the trigger.
- The top-bar Share action opens a bottom sheet titled “Share.” Present the privacy disclaimer and acknowledgement first, then place “Confirm Sharing” as the final full-width action. Use the same “Confirm Sharing” term in the acknowledgement copy. Do not add a separate Cancel button; the close icon, Escape key, and safe backdrop dismissal provide the non-confirming exit paths. Confirming closes the sheet and continues to the platform share options.

### Toasts

- Toasts confirm lightweight completed actions and disappear automatically.
- Do not use a toast for validation, destructive confirmation, or information the user must retain.
- Keep language short and describe the result, not the implementation.

### Sharing flow

- After the privacy confirmation sheet, open a dedicated full-page Share view rather than another modal.
- Keep the page heading generic (“Share”) so the same view can support policy insights, policy files, and future shareable objects.
- Identify the current object in a local “What you’re sharing” element inside the page body. For policy insights, show the policy type followed by “Insights only · Based on policy ••1234”; for files, show the file name and related policy when available.
- Left-align the generic Share heading and place the orientation copy “Send a secure, time-limited copy.” directly below it as 12px/16px regular secondary text with a 4px gap. Do not repeat that copy in the page body.
- Use the Lucide Brain Circuit icon for an Insights object and the Lucide File icon for a shared file. Keep both in the standard plum-tinted icon treatment.
- Place one regular 14px/20px secondary-text masking paragraph 12px below the “What you’re sharing” element: “Personal information will be masked. Sensitive details are hidden before sharing.” Keep the semibold plum “Manage what’s shared” action inline at the end of the same paragraph. Do not split the masking guidance into a title and description or repeat it below the email or expiry controls.
- Label the fields “Recipient email” and “Link expires after.” Use “Share by email” as the primary action and “Copy secure link” as the secondary action.
- Keep Share by email disabled until the recipient email is valid. Copy secure link may remain independently available.
- Center the regular notice “Anyone with the link can view the shared information until it expires.” 8px below the secondary action. End with centered 12px/16px semibold “Privacy Policy · Terms & Conditions” links in the established primary text color, with no additional legal paragraph.
- Closing the page returns focus to the Share action on the originating view.

## 11. Accessibility, motion, and resilient states

- All interactive targets are at least 44×44px.
- Provide visible focus states and logical keyboard order.
- Use semantic headings, buttons, lists, fieldsets, labels, status regions, and dialogs.
- Provide loading, empty, error, offline, and retry states for network-backed experiences.
- Never let sticky UI obscure the active element. Scroll focused fields into view above the composer or keyboard.

### Motion principles and workflow

- Motion is functional, restrained, and subordinate to policy content. Animate only to provide feedback, preserve spatial continuity, indicate a state change, or prevent a jarring visual jump. If none of those purposes applies, change the state instantly.
- **Mandatory invocation:** use the globally installed `$animate` skill before introducing or changing any Ovie transition, animation, keyframe, spring, gesture motion, layout motion, or programmatic motion.
- Invoke `$animate` whenever the user explicitly asks for animation, motion, a transition, or an animated feel—even when the correct result is to reject motion and keep the state change instant.
- Do not apply or revise motion until `$animate` has classified the interaction frequency and named one valid purpose. When the gate passes, start from its component recipe when one exists and use this contract's shared tokens rather than module-local values.
- Apply a frequency gate before choosing an effect. Do not animate keyboard-initiated actions or interactions used 100+ times per day. Frequent actions receive only immediate press/color feedback. Standard motion is reserved for occasional overlays, disclosures, toasts, and meaningful state changes. Delight is limited to rare onboarding or confirmed-success moments and must never delay the task.
- Do not add page-load choreography, scroll reveals, parallax, decorative looping motion, ambient movement, or animated policy values to product surfaces. People may be reading consequential information; content must remain still unless movement explains a change.
- Use the cheapest capable tool: CSS transitions for hover, press, open/closed state, color, opacity, and transforms; CSS `@starting-style` for simple mount entrances; Web Animations API for programmatic control without a dependency; and Motion only for interruptible gestures, layout animation, or exit coordination that CSS cannot provide.

### Motion tokens

Use shared runtime tokens rather than screen-local timing values:

```css
--motion-duration-tooltip: 125ms;
--motion-duration-press: 160ms;
--motion-duration-standard: 200ms;
--motion-duration-overlay: 260ms;
--motion-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--motion-ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--motion-ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

- Entering and exiting use `--motion-ease-out`; movement or morphing already on screen uses `--motion-ease-in-out`; drawers and bottom sheets use `--motion-ease-drawer`; hover and color changes use CSS `ease`; determinate progress uses `linear`.
- Keep routine UI motion at or below 260ms. A gesture-driven surface may use the spring `{ type: "spring", duration: 0.5, bounce: 0.2 }` when velocity and interruption need to carry through; do not add bounce to ordinary controls or overlays.

### Component motion

- Buttons and pressable rows: use `transform 160ms var(--motion-ease-out)` and `scale(0.97)` while pressed. Gate hover-only styling with `@media (hover: hover) and (pointer: fine)`.
- Tooltips: use opacity plus `scale(0.97)` for 125ms from the trigger origin. Once one tooltip in a group is open, neighboring tooltips may appear instantly.
- Dropdowns, selects, and small popovers: transition opacity plus `scale(0.95)` for 200ms from the trigger-provided transform origin. Never grow from the center when the surface is anchored to a control.
- Dialogs: transition the centered surface and backdrop opacity together for 260ms; use `scale(0.96)` for the surface entrance, never `scale(0)`.
- Right drawers: enter and leave through the right edge using `translateX(100%)` and `--motion-duration-overlay`. Bottom sheets enter and leave through the bottom edge using `translateY(100%)`, the same duration, and `--motion-ease-drawer`. The backdrop fades on the same schedule.
- Accordions and disclosures: rotate the chevron for 200ms with `--motion-ease-in-out`. Animate content height and opacity for 200ms only when height is measured by the maintained disclosure primitive; otherwise keep native content expansion instant rather than approximating it.
- Toasts: use retargetable opacity and vertical-transform transitions for 200ms; do not use keyframes because consecutive toasts must interrupt cleanly. Exit through the same edge used for entry.
- The auto-hiding top bar and mobile navigation drawer may use the overlay tokens to preserve spatial continuity. The Ask Ovie dock itself does not float, pulse, or loop; only its controls and modal sheet respond to state.

### Implementation and accessibility rules

- Animate `transform` and `opacity`. Do not animate `width`, `height`, margins, padding, `top`, or `left` when a transform can express the change; measured disclosure height is the narrow exception.
- Never use `transition: all`, `ease-in`, `scale(0)`, or ungated hover motion. Name every transitioned property.
- Use transitions rather than keyframes for rapidly triggered UI so interruption begins from the current visual state. Preserve velocity with a spring for drag gestures. Exit through the same path as entry.
- Motion must not delay focus placement, keyboard interaction, screen-reader announcements, or pointer input. Staggered content must never block interaction and is not permitted for routine policy lists.
- Under `prefers-reduced-motion: reduce`, remove position, scale, parallax, and spring movement. Preserve only brief opacity or color transitions when they aid comprehension, and keep focus, state, and content changes immediate and stable.

## 12. Insights pages

Insights pages translate supplied insurance documents into a scannable, evidence-grounded summary. They may cover umbrella, auto, home, watercraft, or other policy types, but must follow the same evidence rules.

This section defines one standard Insights template for every policy type. The applicable SME template determines policy-specific content, required sections, qualifications, and watch points; this design contract determines their visual and interaction treatment. Use the [SME mapping workflow](#127-adapting-the-standard-template-from-sme-instructions) for each policy type, and the shared foundations in sections 3–11 for tokens, controls, responsive behavior, and motion. Reference HTML pages demonstrate implementation but do not override this contract. Keep sample policyholders, policy numbers, limits, premiums, and endorsement counts in document-grounded content rather than in these design rules.

- The primary Insights destination uses the same page shell, list geometry, search, policy-type filter, “Shared with me” switch, and responsive navigation pattern as My Files.
- Include one row per policy with generated insights; do not include non-policy document folders. Use the policy's actual user-facing name as the primary label, not its policy category, form type, or subcategory.
- Each row uses the Lucide Brain Circuit icon in the standard plum-tinted container, followed by the policy name, a policy-type chip, the masked policy number with its reveal control, and “Generated on Month D, YYYY.” Omit carrier metadata from this list.
- Selecting the row opens that policy's Insights detail page. The trailing ellipsis opens an action sheet titled with the policy name and containing “Regenerate insights” with Lucide Refresh Cw and “View policy documents” with the standard Lucide document icon.
- Regeneration is a secondary action and must communicate pending, success, and failure states without replacing the current insights until a new generation succeeds. “View policy documents” opens the related policy document collection.

### 12.1 Standard policy Insights template

Assemble every policy Insights page from the slots below. The SME template determines which conditional slots apply, their policy-specific labels, and any required ordering changes. A missing document is not a reason to silently omit an SME-required section: retain a concise availability state. Omit a conditional slot when it does not apply, without leaving an empty card.

| Order | Standard slot | Shared presentation | Determined by the SME template and supplied policy |
|---|---|---|---|
| Shell | Insights header | Back action, page title, contextual search/share; shared shell and composer | Applicable utility actions and any explicitly approved variant |
| 1 | Your policy simplified | Canonical label/value fields in one white card; documented term-status badge | Policyholder, type, identifier, carrier, term, premium, and relevant classification or jurisdiction fields; approved naming/visibility exceptions |
| 2, conditional | Primary coverage | Standard white coverage card using section 12.1.1 | Whether a prominent coverage summary is needed; principal limits and their bases |
| 3, conditional | Action or verification alert | Semantic alert only for an established consequence requiring attention | Missing required limits, lapse conditions, or other policy-specific verification needs |
| 4, conditional | Covered subjects and schedules | Grouped sourced rows for people, locations, buildings, vehicles, or other scheduled subjects | The subjects and schedules applicable to this policy type; exact identifiers and relationships |
| 5, conditional | Linked or underlying policies | Schedule references and separate policy destinations | Whether underlying insurance exists as a requirement; documented minimums and dependencies |
| 6 | Policy details | One white card with the standard disclosure slots below | Applicable coverage groups, endorsements, sublimits, exclusions, conditions, and watch points |
| 7 | About these insights | Approved disclaimer, Document sources, and unavailable-evidence inventory | Analyzed files, forms, pages, and unresolved facts |
| 8 | Helpfulness feedback | Shared feedback control on the canvas | No policy-specific visual treatment |

Keep the persistent Ask Ovie entry point available without adding a promotional card or global navigation inside the focused detail page. Show premium and term separately. Avoid repeating the same coverage value in both the primary card and Policy details unless the second occurrence conveys a necessary qualification. Existing approved pages may retain their named variants; do not derive a universal layout from one sample policy.

#### Standard Policy details slots

Use this default order, adapting applicability and grouping from the SME template:

1. **What’s included** — coverage names, limits or benefits, applicable bases, and necessary qualifications. Use static subheadings for multiple coverage parts.
2. **Policy specifications** — practical effects of key endorsements, riders, or policy-specific provisions. Include an endorsement summary where relevant.
3. **Sub-limits** — grouped coverage caps with their amounts, bases, periods, and conditions.
4. **What’s not included** — explicit exclusions or documented absence of coverage, written concisely.
5. **Coverage limitations** — deductibles, retained amounts, waiting periods, duties, safeguards, and other conditions affecting coverage.
6. **Coverage watch points** — practical consequences and supported verification actions, using the applicable severity treatment.

An SME-required category that does not fit these slots may add a clearly named disclosure using the same primitives; for example, documented underlying minimums. Do not force unrelated policy concepts into a BOP property/liability split. For commercial policies, keep deductibles under the affected coverage or Coverage limitations, without a dedicated deductible section. For other policy types, add one only when the applicable SME template or approved policy structure requires it.

### 12.1.1 Primary coverage card

- Do not use a plum-filled hero treatment for the primary policy limit. Preserve hierarchy through section order, the standard card heading, and semibold values.
- Every limit row uses a 14px tertiary label above an 18px semibold primary value, with a neutral source-info action when evidence is available.
- Give occurrence and aggregate limits equal row structure. Separate consecutive rows with the standard subtle full-width divider.
- Keep the card surface white so different policy types can reuse the same coverage-summary pattern without introducing a new focal color treatment.

### 12.1.2 Detail-page hierarchy and typography

- Use “Insights” as the page title. Put each card heading inside its white card. Retain the shared back action and contextual search/share controls; follow the applicable variant for their container color.
- Distinguish a simplified-field label, a primary-coverage label, and a policy-detail heading. They are different text roles even when their wording is similar.

| Element | Treatment |
|---|---|
| Page, card, and source-sheet title | 18px/24px semibold, `text-primary` |
| Simplified-field label | 14px/20px regular, `text-tertiary` |
| Simplified-field value | 14px/20px semibold, `text-primary` |
| Coverage label above a principal value, in a card or disclosure | 14px/20px regular, `text-tertiary`; value below at 18px/24px semibold, `text-primary` |
| Disclosure title, static subsection heading, and detail-item heading | 14px/20px semibold, `text-primary` |
| Supporting coverage explanation and conditions | 14px/20px regular, `text-tertiary` |
| Source page/form reference | 14px/20px semibold, primary plum |

- A static subsection heading has no chevron, button role, or hover affordance. Use a real heading in the document hierarchy. A disclosure is an actual expandable control with an accessible expanded state.
- Choose the text role from the row's structure, not its location. A coverage label above a separate amount or principal value remains regular and tertiary inside “What’s included.” A detail-item heading introducing an explanation, without a separate principal value, remains semibold and primary. Moving a coverage row into a disclosure does not turn its label into a heading.
- Let headings, policy numbers, amounts, and qualifications wrap. Maintain the shared content gutters and consistent trailing source-control alignment across short and multiline rows.
- Use the term-status badge to describe the uploaded policy term only. An expired term does not establish that the business is currently uninsured or that no renewal exists.

### 12.2 Evidence and content rules

- Every material insight must trace to supplied policy text.
- Do not infer insured people, exclusions, territory, defense-cost treatment, or coverage breadth from common policy conventions.
- Distinguish these states explicitly:
  - **What's not included:** the supplied policy text explicitly excludes or does not provide the coverage.
  - **Not available in the pages analyzed:** the necessary text was not present, so Ovie cannot determine the answer.
- Underlying policies are schedule references only. Never fetch, merge, or blend their details into umbrella-policy insights.
- If an underlying policy also exists in the user's wallet, link to it as a separate policy experience.
- Show exact required underlying limits from the schedule. Use a group-level alert for a missing-data state shared by every linked policy; reserve row-level status for a meaningful difference specific to that row.
- “Umbrella is not standalone coverage,” follow-form behavior, maintain-underlying requirements, drop-down/DIC wording, and lapse consequences must only be stated when supported by the supplied form.
- Keep summaries in plain language without changing the legal meaning.

### 12.2.1 Classifying information before styling it

| Information | Placement and presentation |
|---|---|
| Included coverage or an endorsement's effect | Ordinary sourced fact under “What’s included” or “Policy specifications”; state what is added, changed, required, limited, or excluded |
| Explicit exclusion | Concise sourced statement under “What’s not included” |
| Deductible, waiting period, safeguard, or other coverage condition | Sourced limitation beside the affected coverage or under “Coverage limitations” |
| Practical consequence requiring attention | Coverage watch point with a supported severity label and a concise consequence or verification action |
| Missing or ambiguous policy evidence | Explicit availability statement; use the neutral evidence-gap treatment unless an actionable warning is established |
| Endorsement counts or summary scope | Neutral “Endorsement summary” disclosure; a count alone is not a caution or severity signal |

- Explain endorsement effects in the title or sentence. Avoid an isolated “Adds coverage” badge whose subject and practical effect must be guessed.
- Distinguish highlighted changes, endorsement documents, and the complete forms/notices inventory. Derive each count from the supplied documents and label what is counted; grouped highlights need not equal the document count.
- Prioritize endorsements that materially affect the reader's coverage or duties. Keep routine state amendments and legal notices out of the practical highlight list, while retaining them in document sources and explaining a material effect when one is established.
- Keep a summary disclosure on a neutral surface with a descriptive heading and a source action when it cites the schedule. If an inset note is needed, reuse section 6; do not invent a warning badge for administrative context.
- An upload prompt for a companion policy describes the limits of the available documents. It must not imply a purchase recommendation, missing insurance, or inadequate coverage solely because another document has not been uploaded.

### 12.3 Source information buttons

- Commercial workers compensation Insights (approved September 11, 2026): title the opening card “Your policy simplified” and omit source-info buttons throughout that card. End the card after the covered-state list; omit the “Additional policy information” disclosure and its fields. Retain source controls in the remaining sections. In the cancellation alert, place the source-info control at the top-right alongside the heading, aligned with its first line; keep the explanation below and preserve the 44×44px target.
- Commercial property Insights variant (approved September 8, 2026): source-info controls have transparent backgrounds, including on hover, while retaining the neutral icon color, 44×44px targets, and shared focus ring. The header back control also has a transparent background and uses `icon-strong`. Begin the content with “Policy simplified”; omit the separate policy-type icon and label row above it.
- In the commercial property “Policy simplified” heading row, show the policy-term status badge instead of a source-info action, matching the umbrella/condo placement. Use an “Expired” pill with `danger` text and status dot on `danger-background` when the documented end date is past (approved September 8, 2026). This describes the supplied term, not live carrier status or whether a renewal exists.
- Commercial property missing-information values and statements use their component’s normal text roles: primary for headings and values, tertiary for explanatory copy, and secondary for evidence-gap callouts. Do not apply alert text color solely because information is unavailable or missing. Dedicated warning cards and severity badges retain their semantic alert colors. Warning callouts use the standard Lucide Triangle Alert geometry with rounded strokes and `icon-warning`.
- The commercial property “Property schedule needed” warning card uses a 1px `warning-border` (`#E7C982`) stroke around its warning-tinted surface.

- Place a neutral `icon-default` info icon beside each sourced fact or grouped section.
- The icon opens the canonical responsive source surface: a right-side drawer on desktop and a full-width bottom sheet below 860px, with:
  - a title describing the fact;
  - page/form reference;
  - the relevant policy excerpt;
  - a primary “View in document” action.
- Do not add a generic “Ovie explanation” label or repeated interpretation disclaimer inside every source sheet.
- Commercial property sheet close controls use transparent backgrounds, including on hover, with `icon-default` strokes. Apply this consistently to source, search/share utility, feedback, and Ask Ovie sheets; preserve the 44×44px target and shared focus ring.
- In the commercial property HTML prototype, source details use the bottom sheet at every browser width, including desktop. Keep it centered on the mobile app shell with its bottom attachment and visible drag handle; do not switch this prototype to a side drawer at a desktop breakpoint.
- The sheet excerpt is evidence, not a second summary. Keep it focused on the selected fact.
- Source-sheet page/form references use 14px semibold primary plum, matching umbrella and condo. Select concise policy wording and retain relevant qualifications; mark omissions with an ellipsis and leave the complete clause in the document view.

### 12.3.1 Readable source content

- Lead with a recognizable document or endorsement name and an explicit PDF page reference. Put the technical form identifier on a separate labeled line, such as “Form reference: … · form page … of …”. Distinguish a form's printed page number from the PDF viewer's page number; show the total PDF page count only when known.
- Preserve identifiers exactly, but do not make an unexplained sequence of form codes the sole description of the source. Allow references to wrap naturally without truncation.
- Keep paragraph and list boundaries in extracted clauses. Repair extraction spacing only when the original supports the correction; preserve qualifications, exceptions, and omission markers.
- Never flatten a policy table into a continuous paragraph. Render its headings and row relationships explicitly. On narrow screens, use stacked entries with labeled values; for a limit-change schedule, distinguish the base-form limit from the revised limit. Retain units, per-person/per-location/per-occurrence bases, aggregate periods, and conditions stated beside or above the table.
- Verify reconstructed tables against the original page. Do not silently interpret an ambiguous slash, blank cell, or missing schedule value as a definitive amount, zero, or absence of coverage.
- Each info action should open the evidence for its associated fact. A grouped overview also needs a source action when it makes material coverage claims. Cite all supporting pages for a composite statement, and provide a clear route to the relevant original pages.
- “View in document” must open the correct supplied file at the referenced PDF page. If the original file is unavailable, communicate that state instead of presenting a broken link or substituting another policy.

### 12.4 Policy-detail accordions

- Commercial property sublimits use full-width list rows within the single “Property sublimits” disclosure. Stack the loss-type heading, limit, basis, and conditions; separate items with subtle dividers instead of narrow table columns. Keep the source-info action beside the item heading.
- In commercial property policy-detail text rows, align the source-info glyph with the first line of text rather than vertically centering it against the entire paragraph. Preserve the 44×44px control target.
- Commercial property landing pages keep excess-layer amounts and the TIV availability state in the primary coverage card, without repeating that value row under “What’s included.” Keep the full missing-document inventory in the footer, use only concise contextual availability statements elsewhere, and make watch points explain consequences or verification actions. Include claims-notification duties, first named insured responsibilities, and appraisal provisions in Coverage limitations. Put claims contact details in a supporting block under Document sources; do not add a separate Policy administration & claims disclosure.

- Keep the “Policy details” heading inside the disclosure card.
- Use 14px semibold disclosure titles, item-count pills, and neutral chevrons.
- Expand one or more sections as needed; do not force a single-open accordion unless the content becomes unwieldy.
- Use one-line insights first. Add a second line only when a condition or consequence is necessary.
- Attach an info button to each material item that has a document citation.
- By default, in coverage watchpoints, place the severity chip and source info button on the first line. Wrap the related explanation directly beneath them and let it span the full content width; do not reserve the icon column beside the copy. Separate consecutive watchpoints with the same subtle full-width divider used by other disclosure lists; omit the divider above the first item and below the last. The BOP variant uses its explicitly approved centered source column.

### 12.4.1 Grouping and disclosure depth

- Keep related policy details in one card, using dividers and full-width rows rather than a separate card for every coverage. Nest disclosures only when they reduce the reading burden of a genuinely long group.
- A count pill describes the entries immediately inside its disclosure. If those entries are groups, the count represents groups; do not imply that it is the number of all underlying coverages.
- Use a static heading when a subsection and its content should remain visible inside an open parent. Do not add an accordion solely to make its heading resemble another row.
- Present short sublimit lists directly with the applicable amounts and bases. For long inventories, show a sourced presence-first introduction and meaningful groups, each exposing the limits and qualifications on expansion.
- Preserve independent disclosure state. Search results must reveal their containing disclosures and lead to the matching fact without changing policy content.

### 12.5 Disclaimer and document availability

Use this approved disclaimer unless legal or product provides a newer version:

> Insights are based on the documents provided; incomplete or missing documents may result in incomplete or inaccurate insights. OVIE is not intended to serve as evidence of insurance for third parties, nor does OVIE provide advice or guidance on the adequacy of coverage. Users should consult their agent or insurance carrier for coverage-related questions or determinations.

- “Document sources” is an accordion and lists the analyzed declarations, forms, amendments, and page ranges.
- “Not available in the pages analyzed” is a separate accordion and lists unresolved facts.
- These sections belong inside the final “About these insights” card.

### 12.6 Helpfulness feedback

- Place “Were these insights helpful?” after the final card, directly on the page background.
- Use 14px copy and align the row's left and right padding with card content: 16px inside the page gutter.
- Use outline thumbs with 44px targets. Do not fill the icons when selected.
- Positive selection changes the thumbs-up stroke to `icon-success`. Negative selection changes the thumbs-down stroke to `icon-danger`.
- Selecting positive feedback shows a brief thank-you confirmation.
- Selecting negative feedback opens a full-width modal sheet titled “Tell us more” with these mutually exclusive reasons:
  - Insights are unclear or confusing
  - Information is incorrect
  - Missing or incomplete details
  - Other (tell us more)
- Reveal a labeled concern textarea only when “Other” is selected.
- Validate that a reason is selected and that the concern is entered when required. Preserve the user's input on validation errors.
- Provide Submit, Cancel, close, Escape, and safe backdrop-dismissal behavior.

### 12.7 Adapting the standard template from SME instructions

Use this workflow whenever building or revising Insights for a policy type. The SME template supplies the domain requirements; it is not a separate visual design system. The uploaded policy supplies the facts. This root contract supplies the shared layout, components, typography, interactions, and evidence presentation.

#### Required mapping before implementation

Create a working mapping from every SME requirement to a standard slot. Keep it with the implementation or task notes, not in a module-specific `DESIGN.md`. For each requirement, record:

| Mapping field | What to establish |
|---|---|
| Policy type and SME reference | Applicable SME template, version/date when provided, and any later approved product decisions |
| Required content | Fields, covered subjects, coverage parts, endorsements, limits, exclusions, conditions, and watch-point topics required by that SME |
| Destination | Standard page slot, disclosure, subsection, and reader-facing label; note any necessary ordering change |
| Applicability | Always required, conditional on a documented feature, or not applicable; define the visible state when required evidence is missing |
| Evidence | Supplied document, form, PDF page, excerpt, and any modifying endorsement supporting the fact |
| Qualifications | Currency/unit, coverage basis, period, waiting duration, deductible, exception, or other condition needed to avoid changing the meaning |
| Grouping and prominence | Direct row, static subsection, long grouped disclosure, primary summary, neutral note, or supported caution |
| Interaction | Source action, initial disclosure state, document destination, and any SME-required contextual CTA |
| Variation | Content variation handled by existing components, or an explicitly approved design exception scoped to that policy type |

- Account for every SME requirement. A mapped item must be displayed, explicitly identified as unavailable, or omitted for a documented applicability reason; do not drop it because the reference HTML lacks that section.
- Preserve SME rules about required classification, schedule completeness, conditions, severity, prohibited inference, and informational wording. Never fill a required value from a typical policy or from another policy type's sample.
- Resolve the actual policy terms before rendering: a modifying endorsement may change the base form. If supplied documents conflict and precedence cannot be established, show the ambiguity rather than selecting a convenient value.
- Use the SME's watch-point conditions and severity guidance with the actual evidence. A topic's presence in the template does not by itself establish a risk, a missing policy, or a renewal outcome.
- Keep exclusions, unavailable evidence, and conditional applicability distinct. A missing schedule means its contents cannot be determined; it does not establish that no subjects are insured.
- If the SME template is unavailable, build the shared shell and document-grounded sections that can be established, record the missing domain requirements, and obtain the applicable SME template before claiming complete SME coverage. Do not invent a policy-type template from a sibling page.

#### What varies and what stays shared

- Policy types may vary in canonical fields, scheduled subjects, coverage groups, limits and their bases, endorsement/rider effects, sublimits, deductibles, duties, exclusions, watch points, and necessary companion-policy references. Express these through the mapping above.
- Keep colors, type scale, spacing, card geometry, heading hierarchy, source-sheet behavior, accessible targets, focus handling, disclaimer, and feedback components shared. Reuse the existing primitives for new SME categories before introducing a new component.
- Record a durable visual or interaction exception here with its policy scope and approval. Do not treat a policy-specific content difference as permission to restyle the page or copy all exceptions from its reference implementation.
- Later explicit user decisions override the original SME presentation when they conflict. Retain the domain meaning and record the resolved placement or behavior. For example, moving endorsements inside Policy details changes placement, not their evidence requirements.

#### Approved BOP adaptation example

Approved September 11, 2026. This is one adaptation of the standard template, not the template for other policy types. The published reference is `Ovie_business_owners_insights.html`; `ovie_bop_insights.html` is the local authoring preview.

- **Slot selection:** Your policy simplified → Covered locations & buildings → Policy details → About these insights → feedback, with the persistent composer. Property and liability coverage belong under What’s included; omit a separate primary coverage card. Use the six standard Policy details disclosures, initially closed and independently expandable, with no divider immediately under the card heading.
- **Simplified card:** include documented canonical fields and definitive business classification from class codes or business description. Show the full policy number with no eye toggle, omit all source-info controls in this card, and omit More policy information. These visibility rules do not alter masking or source controls on other policy types.
- **Covered subjects:** list the explicit location/building schedule with text and trailing source controls, without leading building icons. Do not infer missing buildings or transfer limits between scheduled subjects.
- **Coverage grouping:** Property, Income coverage conditions, and Liability are static subsection headings inside What’s included. Income conditions remain visible with the open parent. Coverage labels above a separate principal value use 14px/20px regular tertiary text; principal values below use 18px/24px semibold primary text. Subsection and explanatory detail-item headings remain 14px semibold primary text. This label/value distinction supersedes the earlier BOP semibold-label treatment. Supporting disclosures such as Other liability features may remain where useful.
- **SME content:** map building/BPP limits per scheduled subject, business income/extra expense basis and timing, liability trigger and aggregates, practical endorsements, grouped sublimits, factual exclusions, coverage conditions, and supported watch points to the standard slots. Preserve separate start/waiting conditions; do not assume actual-loss-sustained duration. Omit coinsurance unless clearly interpretable. Identify general eligibility/growth context as informational, with an agent CTA rather than an undocumented renewal prediction.
- **Endorsements:** keep Policy specifications inside Policy details, state effects plainly, and retain a neutral Endorsement summary with schedule linkage. Omit the separate Ask Ovie about endorsements CTA; this later review decision supersedes that CTA in the original BOP SME template.
- **Header exception:** solid white header; both search/share containers use `background-subtle`, with the shared neutral icons and 44×44px targets. Back remains transparent.
- **Source-alignment exception:** outside the simplified card, use transparent source controls centered vertically against the complete associated text, including supporting paragraphs, on a consistent trailing alignment. This includes building, coverage, specification, sublimit, limitation, summary, and watch-point rows, superseding the default watchpoint first-line placement for BOP only. Retain the standard mobile sheet/desktop drawer behavior and readable source formatting.

### 12.8 Insights review checklist

Before considering an Insights page ready, verify the relevant items below against its supplied documents and selected variant:

- Section order, field visibility, disclosure defaults, heading roles, and source alignment match the contract. Variant exceptions are scoped explicitly rather than implemented as global overrides.
- Every requirement in the applicable SME template has a recorded destination and applicability/evidence state. Policy-specific differences are driven by that mapping rather than copied from a different policy's sample page.
- Every displayed limit retains its basis and period, every material claim has evidence, and endorsement effects are reconciled with the base form. Missing evidence is not converted into a coverage conclusion.
- Source references are readable, excerpts preserve qualifications, reconstructed tables match the original, and document links resolve to the correct file/page.
- On narrow and wide layouts, long headings and references wrap without horizontal overflow; source targets remain at least 44×44px and the composer does not cover the final content or focused controls.
- Disclosures, source sheets, search, and contextual actions work with keyboard and touch. Focus returns to the initiating control after sheet dismissal. Apply section 11's motion gate and reduced-motion rules without introducing page-load animation.
- Summary notes, exclusions, limitations, evidence gaps, and cautions use their intended text and surface roles. Counts describe their actual scope and are not treated as severity signals.

## 13. Page-family guidance

### Home

- Organize Home in this order: Insights, Your policies, Upcoming expiry dates, and Your premium breakdown. Place the compact portfolio status strip inside the Your policies card instead of presenting a separate overview card.
- In the Your policies portfolio strip, use three evenly spaced stacked stats—Policies, Insurers, and Per year—with the numeric value above its label. Expanded policy details use the full card content width rather than preserving the leading-icon indent; anchor the premium column to the far edge, place the monthly equivalent directly below the annual premium, place the source directly below the policy period, and let the policy-period column consume the remaining width.
- Lead with a single card titled “Needs your attention” containing the most important document-grounded alerts—not a premium hero or marketing message. Keep rows concise, omit routine source subtext beneath the heading, and open the detailed insight on selection.
- Treat Search as finding a policy or document and Ask Ovie as understanding policy content or cross-policy relationships.
- Never present live carrier status, payment status, claim status, cancellation state, or renewal issuance unless an uploaded document explicitly establishes it. Prefer factual policy-term dates and contextual source-freshness copy.
- Keep collapsed Insights rows to a finding and its policy context; reserve explanations for the opened insight. On Home, prioritize an expiring-policy warning, possible duplicate coverage, and missing state-required minimum coverage. Use the established warning treatment for all findings that need attention.
- In Upcoming expiry dates, show only the insurer on each row's secondary line; the section heading already establishes that the dates are policy expiries.
- Use at most one plum focal component. Keep the rest of the page on neutral surfaces.
- Keep premium analysis near the bottom and preserve consistent annual and monthly values across portfolio totals, policy details, and category breakdowns.

### Policies and policy details

- List policies using type, carrier, masked identifier, period/status, and a clear destination.
- Policy-detail summaries use stacked labels and values for resilience.
- Keep policy-specific Insights separate from files, billing, and proof-of-insurance actions unless the task requires them together.

### My Files

- Prioritize document name/type, related policy, upload date, and processing status.
- Use search and filters only when the collection is large enough to need them.
- Processing, failed, and incomplete states must explain what happens next.

### Upload processing and outcomes

- Start the upload preview from the homepage and its Upload action. Opening the upload prototype without a detail route, its legacy My Files route, or resetting the preview returns to the homepage by default. Preserve explicit originating destinations when entered from My Files or Insights.
- Uploads from the navigation action and Ovie Inbox begin processing each file independently after transfer. Policy grouping is automatic. Discard duplicate copies automatically while retaining the existing documents. Do not ask for a discard-or-replace decision or pause processing for duplicate review.
- The bottom-navigation Upload button carries a progress ring without a visible numeric step count. Keep the current step available in its accessible label. Tapping it again opens the current batch detail directly, without an intermediate activity screen or a separate page-level status card. Preserve access after leaving; leaving after acceptance does not cancel processing.
- Use two main stages: Uploading files, then Generating insights. Grouping happens after extraction without a separate timed organizing step. Duplicate handling happens automatically within processing, without a separate review step. Use plain caption text “Uploading & Extracting data” for active individual file statuses during either phase. Show actual stage changes, not an invented completion percentage or estimated duration.
- Use the current processing step as the main page heading beside the back arrow in the top bar. Place “Step N of 2” beside the heading in 11px/16px semibold; wrap it within the title group on narrow screens. Keep the stage description below on the page canvas without a white card. Omit the generic “Upload details” title, the full step list, the “Files in this upload” heading, and the decorative upload-source/file-count/date row. Completed outcomes do not imply skipped stages ran successfully.
- Upload details use a focused page with Back and an X icon labeled “Cancel” for accessibility. Both icons use icon-strong on transparent backgrounds, including hover, with 44px targets. Both actions return to the originating primary destination; Cancel dismisses this view without cancelling accepted background work. Omit the routine reassurance paragraph about leaving and returning to check progress. Do not show global bottom navigation in upload details.
- Omit “Upload more files” from completion screens and repeated exit CTAs such as “Continue using Ovie” and “Return to Ovie” from processing and outcome screens; keep contextual actions such as retry and document destinations.
- The initial screen shows each document’s current upload or extraction progress as a determinate bar and percentage. Start extraction as soon as that file uploads; a phase change starts its own labeled progress bar rather than animating upload progress backwards. Active upload and extraction use the same plain caption text “Uploading & Extracting data”, without a badge background or loading dots. Queued files show “Waiting to upload” in the same plain caption treatment, without a badge. Once both phases are complete, show a green “Uploaded” badge and hide both the progress bar and percentage. The stage description reads “Each document is uploaded and its data is extracted.” The default preview includes a completed extraction, a file actively extracting, and a file uploading. Production percentages must come from measured progress for the named phase; preview values are simulated and disclosed outside the product.
- Upload feedback is occasional state indication. Insight generation and regeneration status labels use fixed-width, aria-hidden trailing dots with opacity-only CSS motion over a 1200ms status cycle (200ms stagger), an exception to routine transition durations for ongoing work. Progress fills retarget using transform over the shared 200ms duration with linear easing. Under reduced motion, show static dots and update progress instantly. Stop pending motion when that state ends; never animate filenames or announce each dot.
- During Generating insights, show grouped new-policy documents, additions to existing policies, and standalone policy documents in distinct cards. Policy grouping does not imply merging file contents. Tag retained non-policy documents “Non-policy” and excluded duplicate copies “Discarded”; do not process these for insights. Account for every uploaded file, including automatically discarded duplicates, without treating an ungrouped policy document as non-policy.
- Upload insight results reuse My Files item styling: a 40px plum folder icon, 14px/20px semibold item name, metadata below, and neutral file icons in 36px alignment slots without filled containers in the document rows. Apply the transparent document-icon treatment to ungrouped files as well. Condo policy headers use Lucide Building 2. Umbrella and auto policy headers use the same Lucide Umbrella and Car glyphs as My Files, in the standard 40px plum-tinted policy-icon container. Place New policy and Existing policy secondary neutral badges below the policy-number/document-count metadata row. Single-document policies use the same row and a New policy badge; show an unavailable state when no policy number is known. Omit the Standalone policy badge. Use 11px/16px compact sizing for category badges. Policy category badges use the neutral secondary treatment. Non-policy uses the secondary neutral badge treatment; place it below the file metadata, matching the policy badge reading order. Discarded sits below the file metadata and uses the same badge sizing with danger text on danger-background. Vertically center document-row contents within policy groups. Top-align icons and content in ungrouped non-policy and discarded rows. Filenames within policy groups use regular 14px/20px; standalone non-policy and discarded file rows use medium (500) weight. Align the completed insight status and View insights action in one row, with the action at the right edge; allow wrapping only when needed at narrow widths. Omit View documents actions from the upload-result cards. Remove redundant Policy tags on individual policy documents and the Other documents and Discarded documents headings. Pending generation and regeneration use plain tertiary caption text with the existing animated trailing dots, without a badge background or progress bar; uploading and extraction share the plain caption status “Uploading & Extracting data” without a badge background or dots. The initial upload preview must include a document actively extracting alongside another still uploading.
- Policy folders in upload results are native disclosures, closed by default for each batch. Make the entire policy header tappable, with a neutral trailing chevron; reveal only its document list. Keep insight status and View insights visible outside the disclosure, separated by a subtle full-width top divider. Preserve each folder’s expanded state during processing updates, and allow folders to open independently. Use the shared disclosure chevron motion; keyboard and reduced-motion changes are instant.
- Automatically discard duplicate copies, keep the existing file, and list the skipped copies as Discarded with “Duplicate copy · Existing file kept.” Continue directly from uploading/extraction to insight generation for eligible policies. An all-duplicate batch completes without generating insights or showing an all-insights-generated toast. Omit the duplicate-review preview state, dialog, and replacement actions.
- Generate insights for new policy folders and standalone policy documents, and automatically regenerate insights for existing policies receiving new documents. Show Generating insights or Regenerating insights while pending and Insights generated on each policy’s success, immediately exposing its View insights action even while other policies are still processing. Retain previous existing-policy insights if regeneration fails. Batches containing only non-policy or discarded documents finish without implying insight generation ran.
- Keep the generation page and its policy cards in place after success; do not add a separate insights-generated screen or completion hero. As each policy completes, show the Insights generated success badge with View insights at the right. When all eligible policy insights have succeeded, show “All policy insights are now generated.” once per batch in a dismissible, five-second toast, including when processing completes after leaving the upload view. Exclude non-policy and discarded documents from the completion count; never show the all-generated toast for failed or empty batches. Use the shared 200ms ease-out opacity transition for this occasional feedback, shortened to 125ms under reduced motion.
- Separate document persistence from insight completion. Outcomes identify saved documents and their policy or My Files destination, skipped files, and insight success or failure. A saved document with failed insights must not be described as a failed file upload.
- Distinguish exact duplicate outcomes from an addition that could not safely be made when the service supplies that distinction. Never infer a precise skip reason from an ambiguous duplicate result.
- User-facing copy must not promise restart recovery, automatic retries, or indefinite activity history beyond the available backend contract. Design previews may retain simulated activity locally, with that simulation disclosed outside the product surface.

### Ask Ovie

- Use the full conversation surface for extended questions; use the persistent composer for contextual questions on other pages.
- Clearly distinguish user messages, Ovie responses, document citations, pending states, and failed responses.
- Keep source links attached to the claim they support.

### Access, profile, and settings

- Group settings by user-recognizable purpose rather than technical ownership.
- In the profile drawer, use the avatar and user's name as a horizontally aligned top-left identity group opposite the close action; do not add a separate “Your profile” heading. Follow the identity group closely with the generated upload-address row titled “My Ovie Inbox.” Show the full address directly below the heading in `text-tertiary`, with no explanatory subtext or leading icon in the row. Place a Lucide Info action using `icon-default` beside the heading; it opens a native bottom sheet titled “About your Ovie inbox” explaining that documents sent to the address upload automatically and that the address can be shared with someone else. Place the trailing Lucide Copy action using `icon-default` in the same 44×44 `background-control` container used by header utility icons. Do not repeat the account identifier beneath the user's name when it already forms part of the generated inbox address. Confirm a successful copy with a brief toast.
- Use explicit labels and current values. Confirm destructive changes and explain their consequence before completion.
- Authentication, permissions, and privacy states must never rely on color alone.

## 14. Do and don't checklist

### Do

- Keep content factual, plain-language, and traceable.
- Use 16px page gutters, 18px section rhythm, 12px radii, and flat cards.
- Use Figtree, 14px body copy, and 18px semibold headings.
- Make every interaction keyboard- and touch-accessible.
- Show missing evidence as missing evidence.
- Reuse app-wide primitives and semantic tokens.

### Don't

- Do not infer insurance coverage from conventions or from another policy.
- Do not merge underlying-policy insights into an umbrella-policy summary.
- Do not use shadows on static cards or strokes around every container.
- Do not repeat headings outside the cards they label.
- Do not use raster icons when Lucide vectors are available.
- Do not hide essential values, statuses, or evidence gaps behind a tap.
- Do not let sticky UI cover content or focused controls.
