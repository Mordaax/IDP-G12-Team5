# Events React Port Implementation Plan

**Goal:** Render every `/events/*` screen and both `/style-guide` themes in the site's React app while preserving the map, list, detail, discussion, filters, saved events, and deep links.

**Architecture:** Keep the existing framework-free event service and OneMap constants. Add React state and views under `src/features/events/react/`, register the routes in `src/App.jsx`, then make Vite serve the single React entry for every route. Retire the Vue entry and its cross-app navigation branch once React covers all URLs.

**Tech stack:** React 19, React Router 7, Tailwind CSS 4, Leaflet, Node test runner.

## Tasks

1. Add pure event filtering and sorting functions, with tests for artist, venue, query, distance, date, and sort behavior. Add React catalog and persistence hooks that keep current localStorage keys.
2. Build the shared React Events shell: existing React navigation, map/list switch, search and filter controls, sort, responsive layout, and result states.
3. Port the OneMap map and event cards. Preserve pin selection, card focus, legend, zoom controls, and event opening.
4. Port event details and discussion. Preserve save, share, ticket, lineup and venue links, comments, votes, and guest sign-in return behavior.
5. Port the optional team style guide, including section navigation and live examples, to React.
6. Wire every former Vue route and redirect in React Router. Remove the two-entry Vite rewrite, cross-framework link handling, and Vue runtime packages. Update README and verify direct loads and navigation.

## Verification

- Run focused filtering tests and `npm run build`.
- Verify `/events`, `/events/map`, `/events/list`, `/events/battlebox`, `/events/battlebox/forum`, `/events/:id`, and `/events/:id/discussions` as direct loads and in-app navigation.
- Check signed-out and signed-in actions, filter deep links, map selection, and local persistence.
