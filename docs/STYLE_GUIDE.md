# LittleRedMusic style guide

The visual reference is `/style-guide`, rendered by `src/components/TeamStyleGuide.jsx` and scoped by `src/style-guide/style-guide.css`. The team guide is the default site theme. The overview retains an explicitly labelled **Legacy comparison** for reviewing the original Discover design; it is not the design target.

## Shared foundations

- Use semantic tokens in `src/theme/theme.css`, exposed as Tailwind utilities in `src/styles.css`. Do not add page-specific brand colours or new raw-colour aliases.
- Actions: raspberry `#C2185B`, hover `#9D1249`, selected `#7B0E39`, tint `#FBE3EE`.
- Neutrals: canvas `#F7F6F2`, surface white, soft `#F1F0EC`, border `#DEDBD5`, muted `#65605B`, ink `#272522`.
- Typography: Space Grotesk headings at weight 600; Inter for body, navigation and controls. Guide specimens use 44/53, 27/33 and 18/22 headings and 14/23 body. Adapt size to context: map legends and compact filter labels are not page headings.
- Shapes: `rounded-control` (7px), `rounded-card` (12px), `rounded-panel` (16px). Keep truly circular avatars, map markers, switches, and metadata pills circular/pill-shaped.
- Elevation: use `--lrm-shadow-card`, `shadow-panel`, and `shadow-pop`, not individual heavy search/card shadows.
- Use a raspberry primary action, outlined alternatives, quiet neutral secondary actions and the semantic danger colour for destructive actions. Provide hover, focus, selected and disabled states.
- Keep existing artwork and third-party identity colours. Genre colours are data encodings, not brand colours; the guide explicitly leaves Discover/Events genre-palette harmonisation for a team decision.
- Keep labels, nearby help/error text, accessible names for icon buttons, and a visible keyboard focus cue. Do not remove focus feedback to achieve a quieter appearance.

## Verification

Run:

```sh
node --test
npm run build
```

Check routes in a clean browser (no `lrm.theme` preference), then test the comparison toggle and reload. New browsers and browsers with blocked storage must show the team guide before first paint.

Inspect Discover (guest and member), authentication, all onboarding steps, artist tabs, Events map/list/split/details/discussions, Forum categories/new/topic/reply states, Notifications, Profile, Messages, Thanks, the overview and the guide. Include desktop and narrow widths. Test client-side navigation away from lazy-loaded routes so CSS does not leak.

For visual checks use screenshots as well as computed fonts, colours, radii, overflow and focus styles. Preserve the prototype's existing 1440px viewport-fit behaviour; changing its mobile interaction model is a separate task.
