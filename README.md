# LittleRedMusic

A clickable prototype of **LittleRedMusic**, a music discovery app for the Singapore scene:
a web of artist dots you can explore by genre, artist pages, **events** (map, list, details)
and a forum. The signed-in user is always **Kit Tan**. There is no backend; all data lives in
one file, `src/data/db.json`.

**Tech:** React 19, React Router, Tailwind CSS 4, Leaflet and Vite, with plain JavaScript (no TypeScript). `index.html` → `src/main.jsx` serves every route.

The pages follow the Figma page **8 Hi Fi Screens** (file "Education LittleRedMusic IDP G12 Team 5")
and fill the whole browser window like a normal website.

---

## 1. Getting started

**Requirements:** Node.js 20.19+ or 22.12+ (includes `npm`) and Git.

```bash
npm install     # first time, and whenever package.json changes
npm run dev     # starts the dev server (prints http://localhost:5173/)
```

Then open **http://localhost:5173/** in your browser. Use `npm` so `package-lock.json` stays the
single lock file. The dev server reloads the page on every save. Stop it with **Ctrl + C** in the terminal.

---

## 2. Using the app

`/` is a map of **all the pages**, laid out like the Figma canvas with arrows showing how you get
from one page to the next. Drag or scroll to move around, Ctrl/⌘ + scroll to zoom, and click a page
to open it. **Open the site →** starts at Discover. From there everything links together:

**Discover → Sign up → Onboarding → For you → Your taste profile → FallingIslands → Artist page →
Upcoming events → Events list ⇄ map → Event details → Discussions → Forum thread → Buy tickets → Thank you**

| Section | Address | Notes |
| --- | --- | --- |
| Discover (signed out) | `/discover`, `/discover/electronic` | Genre filter dims dots, zoom, legend, welcome guide (? Help & tour) |
| Sign up / Log in | `/signup`, `/signup/filled`, `/login` | Real form with validation; Escape or × closes it |
| Onboarding | `/onboarding`, `/onboarding/spotify`, `/onboarding/manual` | Pick genres and songs; the taste profile updates as you pick |
| Discover (signed in) | `/discover/for-you`, `/discover/recommended`, `/discover/artist` | Genre chips, artist search, play previews, artist widget |
| Artist | `/artists/fallingislands` (+ `/events`, `/past`) | Save, share, portfolio, upcoming events |
| **Events – map** | `/events/map` | Map pins, filter panel, event cards, zoom |
| **Events – list** | `/events/list` | Cards, sort (earliest, nearest, most popular, price), filters |
| **Event details** | `/events/<id>` (+ `/discussions`) | Info, save, share, discussion |
| Forum | `/forum` (categories, saved, new discussion) and `/forum/battlebox` (+ `/reply`, `/replied`) | Browse threads, search and sort, post or edit replies, save and vote |
| Notifications | `/notifications` | Tabs filter, rows open what they're about, settings switches |
| Profile | `/profile` | Kit's profile, favourites, threads, events, following, edit profile |
| Messages | `/messages` | Conversations, search, send and get replies |

### Signed in and signed out

There is one mock account, **Kit Tan** (`src/data/db.json` → `"user"`). Nothing is checked:
**Log in** opens with Kit's email and password already filled in, **Log in with Google / Apple**
logs straight in, and **Sign up** signs you in as Kit too. **Log out** is in the account menu
(click **Kit Tan**). The state is kept in the browser (`localStorage`, key `lrm.session`) and
shared by all pages (`src/lib/session.js`).

- **Guests can browse** Discover, Events, artist pages and the Forum. Doing something there —
  commenting, voting, saving an event or artist, saving filter preferences, replying — first asks
  them to log in, then brings them straight back (a half-written comment is kept).
- **Members-only pages** (For you, onboarding, Notifications, Profile, Messages) send guests to
  Log in first, then back to the page they asked for.
- **Signed in:** Discover opens on *For you*; the nav shows Messages, the bell and Kit's account menu.
- Comments, votes, messages, profile edits and favourites you make **last for the browser
  session** (`sessionStorage`): they survive page changes and reloads, and clear when the browser
  is closed. Saved events and filter preferences stay in `localStorage` as before.
- Opening a page from the `/` diagram switches mode for you: pages 1–4 signed out, the rest as Kit.

### Profile and Messages

From the Figma page **5 Old Unused Screens Archive** ("Profile (Dashboard)" and "Profile (Messages)"),
built out with Kit's content in the Hi-Fi style:

- `/profile` — Kit's profile: stats, Favourites (♥ to remove), Threads, Events, Following (with
  Message buttons), recent activity and next events. **Edit profile** changes name, location, bio
  and tags; **Settings** opens notification settings.
- `/messages` — conversations with search; pick one (or open `/messages?c=rosa-park`), send a
  message and they reply a moment later.

### The web of dots (Discover)

Every dot is an artist, every line a shared audience (both from the Figma file).
**Drag** to move, **scroll** or **+ / –** to zoom, **Recentre** to reset. **Hover** a dot to see
the artist and light up who shares their fans; **click** it for a card with those artists, Follow,
and their gigs. Artists from `db.json` sit on the biggest dots of their genre; the other dots get
stable made-up names (`src/components/discover/artists.js`). The genre filter / chips fade the
other genres.

### Theme: fonts and colours

All fonts and colours are in **one file, `src/theme/theme.css`**, taken from the Discover page:
Inter everywhere (SF Pro for nav links on Apple devices), ink and greys for text and lines, and
the LittleRedMusic red (`--lrm-brand`, also `--lrm-accent`) for the main action:

- Pages use Tailwind classes named after the tokens — `text-ink`, `text-muted`, `bg-accent`,
  `border-line`, `bg-soft`, `font-nav` … (mapped in `src/styles.css`). The Events styles use the same theme variables.

Change a value in `theme.css` and every page follows. **`/style-guide`** shows every token and
the shared components, read live from that file.

**Two themes.** The radio buttons at the top of the `/` page (also on `/style-guide`) pick
which guide the whole site follows. **Style Guide 1** is this site's own look (from the
Discover page). **Style Guide 2** is the team's guide from the `feat/style-guide` branch:

- `/style-guide` then shows **the team's guide**, implemented in `src/components/TeamStyleGuide.jsx` with styles in `src/style-guide/style-guide.css`. Switch off to see this site's own guide.
- Every page uses **the guide's colours and fonts**: raspberry
  `#C2185B` / `#9D1249` / `#7B0E39` / `#FBE3EE`, the warm neutrals, the success / warning /
  error / info pairs, Space Grotesk 600 for headings and Inter for everything else. Kept as
  they are: genre colours (the guide uses them too), photos, and third-party logos (Google,
  Spotify, Apple Music).
- The values are the `:root[data-theme="style-guide"]` blocks in `src/theme/theme.css` and
  `src/theme/raw-colours.css`. The second file lists every one-off colour from the Figma
  screens and old Events pages: the pages use `var(--lrm-raw-<hex>)`, which is the original
  colour by default and a guide colour in this theme.
- The choice is remembered in this browser (`src/theme/theme.js`).

The team's draft guide (raspberry, Space Grotesk) originated on the `feat/style-guide` branch. Its React view lives in this app now.

### Events map (OneMap)

The map on `/events/map` is [OneMap](https://www.onemap.gov.sg/) (Singapore Land Authority)
drawn with Leaflet — see `src/features/events/react/EventMap.jsx` and
`src/features/events/utils/onemap.js`. The map tiles need no key. A OneMap access token in
`.env` (copy `.env.example`, set `ONEMAP_API=…`) adds the "near …" place under *Your location*.
Tokens expire after 3 days; renew at https://www.onemap.gov.sg/apidocs/ and restart
`npm run dev`. `.env` is git-ignored. The token is built into the page's JavaScript, so treat
a deployed copy's token as public.

### Navigation

Every page, Events included, uses `src/components/NavBar.jsx`, built from `src/lib/nav.js`.
- Saved events and "Your Preferences" are kept in `localStorage`; clear the site data to reset.
- Links into Events: `/events/list?artist=fallingislands`, `?venue=battlebox`, `?q=synthwave`.

---

## 3. Project layout

```
index.html              Entry page for every route
vite.config.js          React and Tailwind build setup
src/
  main.jsx · App.jsx    React: start-up and routes
  pages/                React pages (Overview "/", Discover, Auth, Onboarding, Artist, Thread, ...)
  features/forum/       Forum categories, discussion data and sorting
  components/           NavBar, layout, AppLink, Discover and onboarding components, team style guide
  lib/                  Session, nav, toast and viewport helpers
  styles.css            Tailwind + design tokens from Figma
  features/events/react/  Events map, list, details, filters and state
  features/events/services/  Shared event data service
  features/events/utils/     Dates, geography and OneMap helpers
  data/db.json          All app data: user, routes, images, genres, graph dots, events
  data/index.js         Reads db.json
public/assets/          Icons, logo, Figma photos (img/figma/), page thumbnails for "/" (img/pages/)
```

| To change... | Edit |
| --- | --- |
| The user (Kit Tan) | `src/data/db.json` → `"user"` |
| Events, venues, artists | `src/data/db.json` → `"events"` |
| Add a React page | `src/pages/MyPage.jsx`, a `<Route>` in `src/App.jsx`, and a box in `src/pages/Overview.jsx` |
| Add an Events page | `src/features/events/react/…`, then a route in `src/App.jsx` |
| Nav links / account menu | `src/lib/nav.js` |
| Which pages need an account | `src/lib/session.js` → `MEMBERS_ONLY` |
| Discover dots, lines, artist names | `src/components/discover/graphs.js`, `artists.js`, `WebOfDots.jsx` |
| Colours and fonts (all pages) | `src/theme/theme.css` (see `/style-guide`) |
| Events-only styles | `src/features/events/react/events.css` (colours come from the theme) |
| Events filtering and sorting | `src/features/events/react/eventModel.js` |

Use `<Link>` from `@/components/AppLink` for in-app navigation.

---

## 4. Other commands

| Command | What it does |
| --- | --- |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves `dist/` locally |

**Page thumbnails** on `/` use screenshots saved as `public/assets/img/pages/<name>.jpg`
for Style Guide 1 and `public/assets/img/pages/sg2/<name>.jpg` for Style Guide 2
(960 × 600, taken at 1440 × 900). Selected Events and Forum frames switch to live, non-interactive
previews when zoomed in, so those frames follow the running site. The overview frames and
preview settings are listed in `src/pages/Overview.jsx`.

**Hosting:** the server must send unknown addresses to `index.html`. For example, Netlify `public/_redirects`:

```
/*         /index.html   200
```

---

## 5. Troubleshooting

| Problem | Fix |
| --- | --- |
| `Cannot find module ...` after pulling | Run `npm install` again |
| Server starts on `5174` or another port | If an old dev server is still running; close it or use the printed link |
| Events page looks stale or broken | Delete `node_modules/.vite` and restart `npm run dev` |
| `/events/...` is blank once deployed | Add the hosting rewrite from section 4 |
| Direct links give 404 once deployed | The host must fall back to `index.html` for unknown paths |

## 6. Team workflow (Git and GitHub)

**The idea:** the `main` branch always holds the working version of the app. Nobody edits it
directly. Each person does their work on their own **branch** (a separate copy of the code),
then asks the team to merge it into `main` with a **pull request** (PR) on GitHub.

### One-time setup

```bash
git clone https://github.com/Mordaax/IDP-G12-Team5.git   # download the project (creates the folder)
cd IDP-G12-Team5                                         # go into it
git config --global user.name "Your Name"                # shown on your commits
git config --global user.email "you@example.com"         # use the email of your GitHub account
```

Then follow section 1 to install and run. The first time you `git push`, GitHub will ask you to
sign in. If it asks for a password, use a
[personal access token](https://github.com/settings/tokens), not your account password.

### Every time you work on something

```bash
git checkout main                  # switch to the main branch
git pull                           # download the latest changes from GitHub
git checkout -b events-filter-fix  # make your own branch and switch to it (pick a short, descriptive name)
```

Now edit the code. Check it works with `npm run dev`. When you reach a good stopping point:

```bash
git status                         # see which files you changed (red = not yet staged)
git add src/features/events        # stage the files you want in this commit; `git add .` stages everything
git commit -m "Fix event list sorting by price"   # save a snapshot locally, with a short message
git push -u origin events-filter-fix              # upload your branch to GitHub (-u is only needed the first time)
```

| Command | What it does |
| --- | --- |
| `git status` | Shows what changed and what is staged. Run it often. |
| `git add <file or folder>` | Marks changes to be included in the next commit. |
| `git commit -m "..."` | Saves the staged changes as one snapshot on your computer. Nothing is on GitHub yet. |
| `git push` | Uploads your commits to GitHub so others can see them. |
| `git pull` | Downloads other people's commits and merges them into your current branch. |
| `git checkout <branch>` | Switches to another branch. `-b` creates it first. |
| `git log --oneline` | Lists recent commits. |

**Commit messages:** say what changed in plain words ("Add saved events to the list page"), not
"update" or "fix stuff". Small, frequent commits are easier to review and to undo.

### Opening a pull request

1. Run `npm run build` first. If it shows an error, fix it before going further.
2. After `git push`, open the repository on GitHub. A yellow banner shows
   **Compare & pull request**. Click it.
3. Write a title and a couple of lines on what you changed and how to test it. Add a screenshot
   if it is a visual change.
4. Click **Create pull request** and ask a teammate to review it.
5. When a teammate has approved it, click **Merge pull request**. Your branch can then be deleted.
6. Back on your computer, run `git checkout main` then `git pull` so you have the merged code
   before starting your next task.

### When things go wrong

| Situation | What to do |
| --- | --- |
| `main` has moved on while you were working | On your branch: `git pull origin main`. This brings the latest `main` into your branch. |
| **Merge conflict** (Git says two people changed the same lines) | Open the file; the conflicting part is marked with `<<<<<<<`, `=======` and `>>>>>>>`. Keep the correct version, delete the markers, then `git add <file>` and `git commit`. If unsure, ask the other person. |
| You started working while still on `main` | Before committing, run `git checkout -b my-branch-name`. Your changes come with you. |
| You want to throw away your edits to one file | `git checkout -- <file>` puts it back to the last commit. This cannot be undone. |
| `git push` is rejected | Someone else pushed to the same branch. Run `git pull`, then push again. |

### Ground rules

- Never push straight to `main`; always use a branch and a pull request.
- One task per branch, and pull `main` often so your branch doesn't drift.
- Don't commit `node_modules/`, `dist/`, passwords or tokens. `node_modules` and `dist` are
  already in `.gitignore`.
- Only one of you should edit a given screen at a time, or tell the others first. That avoids
  most merge conflicts.
