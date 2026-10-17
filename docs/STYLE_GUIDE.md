# LittleRedMusic style guide — a human-led first draft

**Status: draft for team review, not a redesign mandate.** Open `/style-guide` after starting the app. Existing product pages intentionally keep their current appearance.

## You own the direction

This first draft was implemented with AI assistance. It is an editable hypothesis about the brand, not evidence of what your users need and not a substitute for the team's taste. A polished screen can make an untested idea feel settled; do not mistake implementation quality for research validity.

You do not need an AI's permission to change this guide. Bring your own references, sketches, disagreements, cultural context, and observations of music listeners and artists. Those can reveal directions the model did not imagine. Use AI to translate an intention into code or generate bounded alternatives—not to silently decide the intention.

### Decisions and proposals are different

The initial brief confirms:

- Vue/JavaScript with shadcn-vue for the new guide.
- Space Grotesk for headings and brand elements, not all interface text.
- A light-only guide; no automatic rollout to existing pages.
- Raspberry: primary `#C2185B`, hover `#9D1249`, selected `#7B0E39`, tint `#FBE3EE`.

Inter for body/interface text, warm neutrals, type sizes, spacing, radii, shadows, logo-clearance suggestions, and example copy are **proposals**. Genre colours are an example category system, not a new team-approved taxonomy. Even confirmed choices may be revisited by the human team; record the decision rather than treating this document as immutable.

## A practical research → revision loop

1. **Name the question before asking a model.** For example: “Does the interface feel like a local music community or a ticket marketplace?” or “Can listeners distinguish genre identity from selected filters?” Separate a preference question from an observable usability problem.
2. **Explore independently first.** Each teammate can bring a sketch, photo, event poster, reference site, or written direction before seeing AI alternatives. Include local artists and audiences where appropriate. Explain which quality matters; do not copy a whole brand.
3. **Write what you actually observed.** In a short usability session, ask someone to find an event, choose a genre, or save an artist. Capture where they hesitate and what they say, with consent. Do not turn model-generated personas, quotes, or imagined metrics into research findings.
4. **Compare meaningful alternatives.** Try different hierarchy, density, selection behaviour, wording, or image treatment—not just three colour swaps. Keep content and task comparable. Let participants describe their experience before asking leading questions about a preferred design.
5. **Make a human decision.** Review the evidence and your brand intent together. You may keep, adapt, or reject any AI suggestion. Record disagreement and uncertainty rather than asking a model to manufacture consensus.
6. **Change the smallest relevant layer.** Token for a shared value; component for a shared behaviour; specimen for an example. Recheck interaction and accessibility, not only the screenshot.
7. **Review the translation.** Put the original human sketch/notes next to the coded result. Ask: What did the implementation add, omit, flatten, or reinterpret? Correct drift explicitly. A plausible implementation is not necessarily the intended one.
8. **Approve before rollout.** Merge the guide first. Migrating Events, Discover, or other product screens is a separate reviewed change with its own scope and regression checks.

### A small decision record

Copy this into a PR description or a new file in `docs/design-decisions/` when useful:

```md
# Decision: [short name]
Status: exploring / accepted / rejected / superseded
Owner and reviewers:
Date:
Question and intended user/task:
Human references or original sketches:
Observed evidence (or explicitly: not yet researched):
Alternatives considered and trade-offs:
Decision and reason:
AI contribution and known interpretation drift:
What changed (tokens/components/specimens):
Accessibility and responsive checks:
What would make us revisit this:
Product-page rollout: none / separately approved scope
```

Avoid collecting identifying participant details in this repository. Link only to research material the team has permission to share.

## Run and edit

From the repository root:

```bash
npm install
npm run dev
```

Use the URL printed by Vite and append `/style-guide`. Do not assume port 5173 if another server is running. Changes to source files should refresh in the browser. Use npm consistently for this work rather than switching lockfile managers.

### Where to work

- `src/router/index.js`: route registration. The guide is a lazy-loaded sibling route, not part of the Events layout.
- `src/views/StyleGuideView.vue`: guide composition and live examples; follow its imports for individual section components.
- `src/components/guide-ui/`: locally owned shadcn-vue components. They are editable source, not untouchable vendor widgets. Utility classes use the `sgu:` prefix to avoid Bootstrap collisions.
- `components.json`: shadcn-vue generator settings, aliases, and the configured design-system CSS location.
- `src/style-guide/style-guide.css`: design tokens, scoped base rules, specimen layout, and Tailwind integration. Keep token values and their visual labels in `StyleGuideView.vue` in sync when editing.
- `src/style-guide/utils.js`: component class utilities.
- `scripts/isolate-guide-css.js`: targeted CSS isolation transform. It namespaces generated properties/keyframes and scopes fallback rules. Do not remove it without running the stylesheet-leak and navigation regression tests.
- `tests/style-guide.spec.js`: interactive, accessibility, responsive, and cross-route style regression tests.
- Guide specimens currently live in `StyleGuideView.vue`; edit the relevant section rather than adding unrelated logic to a shared primitive.

Do **not** edit `main.css`, `screens.css`, `scripts/screens.src.css`, `ScreenFrame.vue`, or `EventsLayout.vue` to revise this draft: those currently belong to the existing product screens. Do not make a new global import in `src/main.js` just to style the guide.

### Change a colour or shape

1. Find the guide token declaration by searching for the existing value or semantic name.
2. Edit the semantic source token, not every generated class or example separately. A brand primitive may feed primary, hover, selected, and tint tokens; keep those roles distinct.
3. Check all consumers in the guide: solid actions, outlines, selected filters, active navigation, text, focus rings, and overlays.
4. Check text contrast and non-text control boundaries. A visually attractive tint is not automatically an accessible text or input-border colour.
5. If changing the supplied palette, note that it is a proposed brand revision and get human review.

Do not search-and-replace a hex value across the entire repository. That could unintentionally recolour the existing screens or category data.

### Change typography or spacing

Keep Space Grotesk on headings/brand and Inter on body and controls unless the team deliberately revisits that decision. Change the shared token or type rule, then inspect long artist names, descriptions, validation text, and narrow mobile layouts. Use the declared font weights rather than relying on synthetic extra-bold text. Inspect both line height and wrapping; a type scale is not just a list of sizes.

Spacing changes should express a reason—such as separating groups more clearly or improving mobile reach—not only a model's preference for more whitespace. Check container widths, gutters, component padding, and hit targets together.

### Add or change a component

1. Find an existing primitive before creating another one. Use its variant API for shared visual states.
2. If adding a shadcn-vue component, inspect `components.json` first; generate only that component using the project's configured CLI workflow. Review the diff. Do not rerun an initializer or overwrite customised components blindly.
3. Keep all styling within the guide boundary. Tailwind resets, generic `body`/`button` rules, and root-level theme variables can affect unrelated pages after navigation.
4. Keep dialogs, tooltips, menus, and other portalled content inside the guide's themed container; otherwise scoped fonts, colours, and isolation can break.
5. Add a live specimen with its intended use, variants, keyboard behaviour, and relevant disabled/loading/error states. Demonstrations should not write to real user data or imply that a demo save is a backend operation.
6. Recheck focus visibility, accessible names, focus return after dialogs, and Escape dismissal. Do not use a tooltip as the only label for an important control.
7. Keep specimen labels and code snippets truthful to the actual component API.

## Verification before sharing a revision

```bash
npx playwright install chromium  # first-time browser setup
npm run test:guide
npm run build
```

The browser tests start or reuse the development server on port 5173. To test another running server, set `PLAYWRIGHT_BASE_URL` to its origin. Tests currently cover Chromium only; automated screenshots and test artifacts are ignored by Git. A build alone does not verify interactions.

Manual review:

- Open `/style-guide` directly and refresh it.
- Try a narrow phone viewport, tablet, and desktop; check long labels and horizontal overflow.
- Tab through controls; operate the dialog and forms without a mouse.
- Check hover, pressed, persistent selection, focus, disabled, loading, and error states separately.
- Check colour contrast, readable supporting text, reduced motion, and non-colour state indicators.
- Navigate to existing Discover and Events screens, then back. Compare them against their previous appearance; confirm no stylesheet or overlay leaks.
- Read the original brief/research beside the result. Ask a human reviewer to identify where the result diverged—not just whether it looks polished.

Automated checks catch some regressions; they do not prove usability, cultural fit, or full accessibility. A team member still owns review.

## Giving an AI a bounded implementation task

Use your own question and references first, then a prompt such as:

> We decided [human decision] because [observation/intention]. Implement only [token/component/specimen] in the isolated style guide. Preserve [specific constraints]. Do not change existing product pages. If the request is ambiguous, list the ambiguity instead of inventing a design decision. Show alternatives before expanding scope. Report the exact files changed, tests run, and remaining uncertainty. Do not fabricate research or describe unverified output as approved.

Review the diff and the browser, not only the assistant's summary. If implementation repeatedly drifts, narrow the task, provide a concrete human example, and revise the wording together. You can also stop using AI for an exploration; human sketching and discussion are first-class tools here.

## Reference, not authority

The supplied Mockplus UI-style-guide article informed the breadth of sections (brand, typography, layout, UI elements, imagery/data, and feedback). It does not decide LittleRedMusic's identity. shadcn-vue supplies component starting points, not a finished brand. The team decides what to keep.

Reference URLs:
- https://www.mockplus.com/blog/post/ui-style-guide
- https://www.shadcn-vue.com/docs/theming
- https://www.shadcn-vue.com/docs/installation/vite
- https://fonts.google.com/specimen/Space+Grotesk
