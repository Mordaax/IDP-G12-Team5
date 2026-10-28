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
- Keep existing artwork and third-party identity colours. Genre colours are data encodings, not brand colours; use the seven-family reference below. Discover and the active artist catalogue use it; legacy event fixtures retain their own genre IDs and colours.
- Keep labels, nearby help/error text, accessible names for icon buttons, and a visible keyboard focus cue. Do not remove focus feedback to achieve a quieter appearance.

## Genre colours

The **Genre colours** section of `/style-guide` is the visual reference. The canonical taxonomy and colours live in `src/data/artists.json`; `src/style-guide/genrePalette.js` adapts that registry for the guide. Discover, artist profiles and onboarding use the same family/child colours. Legacy event fixtures remain separate and are not silently reclassified.

### Family and variant rules

- Coloured main families use vibrant saturated anchors. Subgenres and language/regional variants retain the parent HSL hue while varying both saturation and lightness. **Punk & Metal is the intentional exception:** a black anchor with neutral grey children (zero saturation, different lightness).
- Use a controlled mix of deeper, brighter, richer and softer child shades, not a uniform saturation ladder. Coloured children span at least 35 saturation points and 20 HSL lightness points; do not achieve variation by washing a shade out to near-grey. Punk & Metal remains neutral with child lightness levels of 11%, 22%, 35% and 46%. Use `variantColour(family, variant)` and the canonical child values rather than reconstructing colours from a percentage multiplier.
- Saturation identifies a stable category, not popularity, ranking, selection or taxonomy depth. Keep names visible; shades alone are not sufficient identification.
- Keep language metadata independent of genre: Tamil rap uses Hip-Hop’s hue, while Tamil pop uses Pop’s hue. Mandopop and Indian pop are browse variants, not interchangeable language names.
- Hybrids may have multiple browse connections but keep a stable display colour. Unknown classifications remain neutral rather than defaulting to Experimental.
- Traditional is an app-specific umbrella that also accommodates folk, jazz and reggae; it is not a historical classification of all its children. Examples are reference labels, not verified artist assignments.

### Discover semantic zoom

Discover's genre widget is a camera-navigation list, not checkbox filters. At overview scale, show main-genre headings and main-family dot colours. At detail scale, hide the main-genre headings and show visible artist names centred above their dots with child shades. Derive this directly from camera zoom and viewport on every wheel, pan, zoom-control and shortcut update—not from the last clicked genre. The legend follows the dominant visible family at detail scale. Keep the full graph intact; Recentre restores the overview. Honour reduced motion and keep label sizes readable independently of map scale. Do not add prototype-generation or line-thickness explanations to the legend.

### Personalised Discover

Discover also uses dot size for artist recency: established artists retain their normal diameter, while a stable sample of 15 new artists uses 1.5× diameter. DJ Beatroot is excluded and unchanged. This display-only treatment preserves every artist centre, genre colour and audience relationship in both map modes. Show matching normal/new neutral-dot samples in the legend; size does not represent listener totals or popularity.

The top-right segmented button group above the song playlist, accessibly named **Map view** without a visible label chip, offers text buttons for **Default map** and **Personalised map**. Use an explicit selected state and `aria-pressed`. Place an icon-only **Edit taste profile** link immediately to its right, with a text tooltip on hover or keyboard focus that dismisses on Escape. Personalised is disabled until recognised genre preferences exist. Personalisation uses three concentric regions: aligned genre **and selected subgenre** inside, aligned genre only in the middle, and other genres outside. Within each ring, keep same-family artists in compact patches at stable family angles, expanding the ring radius as needed for spacing rather than scattering a family across full-circle lanes. Use subtle semantic-token circular guides with readable labels and counts. Broad genre selections do not fabricate child matches. Preserve all artists, relationships, genre colours and name-label behaviour. Fit all three regions between the genre menu and recommendations panel; retain pan, zoom and genre shortcuts. A shortcut may frame one complete tier patch of a split family, but the legend must still follow the actual visible camera content. Default restores the original layout without guides. Empty preferences must not imply a fabricated taste profile.

### Primary colours and child specimens

Synthwave is Electronic / EDM's fifth child shade. Its teal fill uses the family hue, dark `#272522` foreground (5.90:1 contrast), and the canonical dark same-hue `textCss` for labels on light surfaces; never put white text on this bright fill.

| Main family | Primary | Subgenre / variant examples (HSL saturation / lightness) | White contrast |
| --- | --- | --- | --- |
| Pop | `#DC167C` | Indie pop (80.2% / 48.4%); Dream pop (72.0% / 66.0%); Mandopop (57.3% / 30.0%); Indian pop (39.3% / 51.8%) | 4.72:1 |
| Rock & Alternative | `#D14500` | Indie rock (98.0% / 41.2%); Shoegaze (72.0% / 64.0%); Post-rock (70.0% / 30.0%); Math rock (48.0% / 45.7%) | 4.60:1 |
| Punk & Metal | `#181818` | Punk rock (0.0% / 11.0%); Hardcore punk (0.0% / 22.0%); Black metal (0.0% / 35.0%); Metalcore (0.0% / 46.0%) | 17.76:1 |
| Hip-Hop | `#8033EA` | Boom bap (79.7% / 60.0%); Trap (72.0% / 70.0%); Drill (56.9% / 30.0%); Alternative hip-hop (39.0% / 56.1%) | 5.87:1 |
| R&B / Soul | `#2463EB` | Contemporary R&B (81.6% / 56.1%); Alternative R&B (72.0% / 68.0%); Soul (58.3% / 30.0%); Neo-soul (40.0% / 52.4%) | 5.17:1 |
| Electronic / EDM | `#007F9B` | House (98.0% / 30.8%); Techno (72.0% / 60.0%); Drum & bass (70.0% / 30.0%); Ambient electronic (48.0% / 38.0%); Synthwave (88.0% / 44.0%) | 4.66:1 |
| Traditional | `#008444` | Folk (98.0% / 26.7%); Xinyao (72.0% / 58.0%); Jazz (70.0% / 30.0%); Reggae (48.0% / 34.9%) | 4.79:1 |

### Visibility on white

All seven primary colours and the darker child specimens meet **4.5:1 against pure white** at full opacity. The formerly near-black coloured variants (Dream pop, Shoegaze, Trap, Alternative R&B, Techno and Xinyao) instead use richer same-hue fills at 72% saturation with varied 58–70% lightness, paired with their canonical dark `foreground` value. Do not use these bright fills as text on white or put white text on them. Use dark labels beside bright dots and dark text on bright artwork/swatches. Zoomed artist-name labels use each bright variant’s separate `textCss` (same hue, 65% saturation, 30% lightness), not the fill. Automated tests in `src/style-guide/genrePalette.test.js` verify contrast, family count, shade variation and neutral grey ordering. Never assume new shades, transparency, gradients, other backgrounds or overlapping map nodes inherit this result: recheck the actual rendered combination. Pale decorative tints require separately validated dark text. Use explicit labels and non-colour selection/focus cues.

## Verification

Run:

```sh
node --test
npm run build
```

Check routes in a clean browser (no `lrm.theme` preference), then test the comparison toggle and reload. New browsers and browsers with blocked storage must show the team guide before first paint.

Inspect Discover (guest and member), authentication, all onboarding steps, artist tabs, Events map/list/split/details/discussions, Forum categories/new/topic/reply states, Notifications, Profile, Messages, Thanks, the overview and the guide. Include desktop and narrow widths. Test client-side navigation away from lazy-loaded routes so CSS does not leak.

For visual checks use screenshots as well as computed fonts, colours, radii, overflow and focus styles. Preserve the prototype's existing 1440px viewport-fit behaviour; changing its mobile interaction model is a separate task.
