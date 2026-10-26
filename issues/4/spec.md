<!-- pj:spec sha256:b7178f6a834dad1fcf50be3ed529642d95a62b2e897063dcfcdb4444c93105f5 -->
## Spec
### Acceptance criteria
- [ ] One token source defines color, typography, spacing, corner radius, and breakpoints.
- [ ] The system is built in Next.js + React and is the obligatory reference for all future work.
- [ ] The system ships in light mode and dark mode. The leading color is orange #F97316.
- [ ] The typeface is Inter, self-hosted.
- [ ] The theme follows the system by default. A manual toggle persists in the browser.
- [ ] /design-preview follows the mockup v2 layout (sticky left nav, token tables, framed component stage) and shows the palette, the type scale, spacing, corner radius, breakpoints, and the core components (button, card, input, text).
- [ ] Every page, including /design-preview, shows the footer "built on dgxspark in Jozefoslaw." with the branch and commit below it, from build-time environment variables.
Out of scope: no backend, no i18n, no animations, no pages besides /design-preview.
### Bug details
N/A. Not a bug.
### Data model
N/A. No server persistence. The theme preference stays in the browser localStorage.
### Mockup
Picked variant: v2 — Sticky spec sheet.
- v2: [light sheet](https://github.com/Piotr12/memorynote.io/blob/attachments/issues/4/mockups/v2/design-preview-light-sheet.png?raw=true) · [dark sheet](https://github.com/Piotr12/memorynote.io/blob/attachments/issues/4/mockups/v2/design-preview-dark-sheet.png?raw=true) · [html](https://github.com/Piotr12/memorynote.io/blob/attachments/issues/4/mockups/v2/design-preview-light.html?raw=true)
- v1 Linear gallery (not picked): [light sheet](https://github.com/Piotr12/memorynote.io/blob/attachments/issues/4/mockups/v1/design-preview-light-sheet.png?raw=true) · [dark sheet](https://github.com/Piotr12/memorynote.io/blob/attachments/issues/4/mockups/v1/design-preview-dark-sheet.png?raw=true)
### Edge cases
- Toggle before the stylesheet loads: no flash of the wrong mode.
- Missing branch or commit value: the footer degrades without an empty placeholder.
- Orange on white and on dark: contrast stays at WCAG 2.2 AA. The accent ramps darker in light mode (#C2410C) and lighter in dark mode (#FB923C); #F97316 is used for the brand mark and large decorative use.
- Mobile width: /design-preview stays usable at the 640 px breakpoint.
### Performance
No server logic. Inter is the only web font, self-hosted, with no runtime swap.
### Security
N/A. No input, no auth, no external data. The footer values come from build-time environment variables.
### Access
Public, no auth. WCAG 2.2 AA in both modes. The theme toggle works with the keyboard and shows a focus state.
### Human decisions
Q-001: Next.js + React.
Q-002: Generate mockups with pj-mock-it-up; the human picks the variant.
Q-003: Tokens, base styles, and core components: button, card, input, text.
Q-004: Leading orange #F97316.
Q-005: Inter, self-hosted.
Q-006: Follow the system; a manual toggle persists in the browser.
Q-007: Branch and commit injected at build time from environment variables.
Q-008: Breakpoints 640 / 768 / 1024 / 1280 px.
Q-009: Corner radius 8 px for controls, 12 px for cards.
Q-010: Out of scope: no backend, no i18n, no animations, no pages besides /design-preview.
Q-011: v2 — Sticky spec sheet.
### Agent decisions
None yet.
