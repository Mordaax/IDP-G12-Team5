# Active artist catalogue and Discover network

## Sources of truth

- `src/data/artists.json`: the approved 100 fictional artists, seven main families, 28 child variants and 70 fresh proximity-based `sharedAudiences` pairs. The earlier network was removed, not reused.
- `src/data/index.js`: adds fictional DJ Beatroot as an Electronic / EDM artist to the untouched base roster (101 active artists). Exports `ARTISTS`, `ARTIST_BY_ID`, `GENRES`, `GENRE_BY_KEY`, `SUBGENRES`, `SUBGENRE_BY_ID`, `SHARED_AUDIENCES`.
- `src/style-guide/genrePalette.js`: an adapter over the same registry for the visual style guide; not a second palette.

The active catalogue is intentionally fictional. Null URLs/media and empty release/event lists are valid placeholders, not errors. Profiles show initials and empty states rather than borrowing another artist's content.

## Distribution

| Main family | Artists |
| --- | ---: |
| Pop | 20 |
| Rock & Alternative | 20 |
| Punk & Metal | 16 |
| Hip-Hop | 12 |
| R&B / Soul | 10 |
| Electronic / EDM | 17 |
| Traditional | 6 |
| **Total** | **101** |

These are editorial prototype weights, not measured scene proportions.

## Discover rendering

`src/components/discover/catalogueGraph.js` produces deterministic layout coordinates from stable artist IDs and their family/child classification. Coordinates do not determine artist identity. The 2000×1100 logical canvas uses broad genre anchors, deterministic repulsion and collision spacing, independently of audience connections rather than repeating tight circular subclusters. Artist-seeded positions, individual anchor offsets, different preferred gaps and irregular edge margins avoid equal-distance packing. A final 52-unit collision floor prevents overlap without making every nearest-neighbour distance identical. Layout is stable across reloads and record ordering. Every active artist produces one dot. All dots have the same base diameter because fan totals are absent.

The overview uses each main family's anchor colour for dots and the legend. At camera zoom 1.15 or above, dots reveal child shades and visible artists gain centred name labels above their dots, regardless of how the camera arrived. Below that scale, main-genre headings and family dot colours return. The detail legend follows the dominant visible family, updating when panning. Punk & Metal uses black/grey lightness steps instead. Bright variants use dark foregrounds on solid fills and a separate saturated same-hue `textCss` for zoomed artist labels on light backgrounds. Contrast checks apply to actual fill/text pairs across the guide, profiles and onboarding.

`WebOfDots.jsx` renders each `sharedAudiences` record directly as a line between its two IDs. It does not fetch legacy SVG geometry or guess relationships from line endpoints. Line width uses a clamped square-root scale of `sharedListenerCount`, multiplied by 1.3 for slightly more visible strokes; focus still adds its separate highlight. Hover/keyboard focus highlights the artist and actual neighbours; clicking pins its card. Related-artist counts are sorted by overlap. Genre buttons are camera shortcuts, not visibility filters: all 101 dots and the original 70 pairs remain in the graph. Recentre restores the overview, main colours and family legend.

### Genre navigation and semantic zoom

- `useGenreNavigation.js` connects guest/member shortcut buttons to the map's imperative camera. Repeating a shortcut recentres its family even after panning; it never toggles artist visibility.
- `genreCamera.js` fits a family's bounds into the map area to the right of the sidebar, with padding above dots and away from controls. Camera shortcuts do not change dot coordinates or audience edges; only the explicit personalised layout switch translates webs.
- `WebOfDots.jsx` pans/zooms over 450ms, cancels superseded/interrupted flights, and honours reduced-motion preferences. `cameraDetail` derives detail from camera scale and visible artists on every render, including during animated navigation. Wheel zoom, zoom buttons and drag/pan use exactly the same rule; there is no clicked-family label gate. Zooming below 1.15 restores main-genre headings; at detail scale those headings are hidden and visible artist labels across all families are eligible.
- On-map artist-name labels are screen-sized, use canonical child colours, avoid other badges/dots/sidebar bounds, and do not intercept map gestures. Long names wrap onto two lines in a bounded label instead of truncating; wider names are placed first to preserve collision-free space. The legend changes with the same detail state before paint. All main-family headings are suppressed at artist-detail scale; artists and edges remain present. Offscreen artists do not generate floating labels at the viewport edge.

### Personalised and default maps

After either onboarding preference path saves, `/discover/for-you` opens the **Personalised map** when a valid saved genre choice exists. The top-right segmented text-button toggle above the song playlist is accessibly named **Map view**, with no visible label chip, and switches between Default map and Personalised map using explicit pressed states. An edit-icon link sits immediately to its right; its “Edit taste profile” tooltip appears on hover/focus and dismisses on Escape. With no recognised preferences it opens Default map and links to the taste-profile editor; it does not invent a profile. Reloading restores saved taste selections. Editing and saving rebuilds the view from those choices.

- `src/lib/tasteProfile.js` persists `{ selected, songs }` at `lrm.taste-profile`, safely normalises stored arrays and uses page-memory fallback when storage is blocked. `preferredGenreIds` maps canonical main names/IDs and child names/IDs to deduplicated parent family IDs. A Dream pop selection centres **all Pop artists**, not only Dream pop; songs do not affect family relevance.
- `personalisedGraph.js` translates whole preferred genre webs into a central grouping. It retains the default local shape, spacing and artist identities rather than squeezing webs into a thin ring. Non-preferred webs move beyond a guaranteed empty band toward the wider map's periphery. The opening camera frames preferred artists; distant webs can extend beyond that viewport and remain reachable by panning or genre shortcuts.
- The 100 base artist records and 70 audience pairs/counts are unchanged. Those artists retain one or two connections; the added DJ Beatroot dot has no fabricated audience links. Proximity eligibility belongs to the original default-map fixture; personalisation deliberately keeps those relationships, so some cross-web lines become longer. It never fabricates new listener overlaps when switching views.
- Default map restores the original positions exactly. Switching mode resets camera/hover/detail state; Recentre returns to the overview of the **current** mode. Artist-name labels above dots, child shades, the subgenre legend, and all seven shortcuts continue to work in both modes. Genre headings are available throughout the map at overview scale, including when panning to peripheral webs; artist names replace them at detail scale.
- With every family selected there is no irrelevant rim: the full balanced default layout remains relevant. With no recognised selection, `personaliseGraph` returns the default graph unchanged.

### Discover song playlist

The right-side **Recommended for you** panel opens by default and retains the original six demo song titles and play/pause equaliser interaction. It stays open when switching map modes or choosing genre shortcuts; only its close button collapses it, with a button to reopen. The retained recommendations route uses the same playlist.

These are explicitly labelled **demo tracks**, not catalogue releases or real audio previews. Their artist links and subgenre colours use the active fictional roster, without changing artist release arrays or borrowing legacy event links. The footer opens the artist directory; it does not claim a fabricated recommendation total or taste percentage.

### Seeded proximity-based connections

The preserved base network fixture has **70 pairs involving its 100 artists**, with **no isolated base dots**. DJ Beatroot is an additional unlinked EDM dot; the active map has 101 artists. `sharedAudienceModel.scope` makes clear that the historical generator settings and summary describe the original seeded network. Exactly **60 artists have one neighbour and 40 have two**. All seven family colours and all 28 child shades participate. There are 60 within-family pairs and ten cross-family pairs; these are placement outcomes, not quotas. `allArtistsHaveConnections` describes coverage; `all100ArtistsConnected` describes whether the graph is a single connected component, which is not required.

`src/components/discover/proximityConnections.js` exports `generateProximityConnections(dots, { seed })`. It is an offline fixture generator, not a render-time effect. The active seed is **91273**, recorded in `sharedAudienceModel.generationSeed`; tests reproduce the persisted JSON exactly.

1. Measure Euclidean distances between dot centres in the untransformed map. Pan, zoom and responsive fitting must not change eligibility.
2. Find each artist's nearest and second-nearest dots across the full map. A pair is eligible when **either endpoint ranks the other among its nearest two**. The user approved this relaxation because mutual nearest-two eligibility left 28 artists without a possible partner on the unchanged layout.
3. Start with all eligible pairs. Incoming nearest-neighbour choices can exceed two even though each artist chooses only two outgoing neighbours. Explicitly prune overloaded endpoints in seeded distance-weighted order, never removing the last link from either endpoint. Retry the random order if any artist remains over the cap or fewer than 40% retain two links; never silently widen eligibility or move dots.
4. Thin remaining links only when both endpoint degrees stay at least one and at least 40% of artists retain two connections. Every artist must finish with one or two neighbours. Do not force a single connected component or a genre quota.
5. Generate fresh positive fictional overlap counts (40–800) solely as prototype pair-count fixtures, preserving the current line-weight and profile schema. They are not real analytics, simulated unique listeners or fan totals. Never sum them into artist audience totals.
6. Persist the selected pairs and seed in `src/data/artists.json`. Reloads do not reroll the network. The renderer draws only persisted pairs, and changing edges must not reposition the dots used to determine proximity.

The catalogue, default-map dot positions and genre colours are unchanged; the personalised mode applies display-only translations. Generator tests check multiple seeds, stable ordering, scale/translation invariance, no self-links or duplicate pairs, positive fictional counts, all artists participating and at least 40% with two links, and a maximum degree of two. Dataset tests check either-endpoint nearest-two eligibility against independently calculated distances and exact seed replay.

The guest and member main maps use the same catalogue. The retained Electronic route starts the same full graph focused on Electronic; the older Recommended/artist-widget map routes now use the active whole-catalogue view rather than obsolete identities and coordinates.

## Artist navigation

- `/artists`: searchable/filterable active catalogue; shared navigation now points here.
- `/artists/:artistId`: data-driven profile with child colours and actual shared-audience relationships.
- Discover search and map cards link to these profiles, including for guests.

## Legacy event boundary

`src/data/db.json` retains the existing 15 artist records **only as legacy event/profile fixtures**, exposed as `LEGACY_EVENTS_DB` and the compatibility alias `EVENTS_DB`. Their existing headliner/support references, event details and discussions remain intact. The featured real-artist fixture has been replaced by fictional DJ Beatroot at `/artists/dj-beatroot`, using the supplied profile image. Its legacy internal ID, event IDs and saved-state keys remain stable; old artist URLs redirect to the renamed profile. Other legacy artists and all 100 base catalogue records are unchanged. DJ Beatroot also appears in the active catalogue and map as the 101st artist, with the EDM family colour and existing profile destination. Its dot is appended beside the electronic scene without moving original dots or changing existing nearest-two rankings, audience pairs or counts. They are **not** added to the active 100, placed on the new map or suggested by Discover search. No event has been silently reassigned to an unrelated new artist.

The `GENRE_BY_KEY` lookup retains a few compatibility aliases for legacy consumers; `GENRES` contains exactly seven active families. Do not treat lookup aliases as additional main genres. Legacy Events keeps its own palette until a separate Events migration is requested.

## Verification

Run `node --test`, `npm run build`, and `git diff --check`.

Tests cover dataset identity/counts, the sparse proximity network, graph endpoints and layout independence from connections, deterministic geometry, assigned child colours, all 101 profile renders, null-safe content and onboarding taxonomy. Browser-check both guest/member Discover, all seven camera shortcuts, semantic colour/label reveal, reduced-motion navigation, hover/pin/keyboard interactions, pairwise counts, search/profile navigation, catalogue filtering, zoom/recentre and preserved Events. Inspect desktop and fitted narrow viewports; preserve the existing 1440px viewport-fit behaviour.
