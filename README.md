# LittleRedMusic

A clickable prototype of **LittleRedMusic**, a music discovery app for the Singapore scene:
a web of artist dots you can explore by genre, artist pages, **events** (map, list, details)
and a forum. The signed-in user is always **Kit Tan**. There is no backend; all data lives in
one file, `src/data/db.json`.

**Tech:** Vue 3 · vue-router · Pinia · Bootstrap 5 · Vite (plain JavaScript, no TypeScript)

---

## 1. Getting started

**Requirements:** Node.js 20.19+ or 22.12+ (includes `npm`) and Git.

```bash
npm install     # first time, and whenever package.json changes
npm run dev     # starts the dev server (prints http://localhost:5173/)
```

`pnpm install` and `pnpm dev` also work. Stick to one package manager so the lock files
(`package-lock.json` / `pnpm-lock.yaml`) don't diverge.

The dev server reloads the page on every save. The app is a single-page Vue app, so any
address is served by `index.html`.

---

## 2. Using the app

`/` is the screen directory, with a link to every screen. The screens also link to each other,
so you can click through the whole flow.

| Section | Address | Notes |
| --- | --- | --- |
| Discover (signed out) | `/discover` | Web of artist dots, legend, welcome guide |
| Sign up | `/signup`, `/signup/filled` | Click the email box for the filled form, then **Create account** |
| Onboarding | `/onboarding` | Spotify, Apple Music or manual taste profile |
| Discover (signed in) | `/discover/for-you` | Taste profile, recommendations, artist widget |
| Artist | `/artists/fallingislands` | Artist page and upcoming events |
| **Events – map** | `/events/map` | Map pins, filter panel, event cards, zoom |
| **Events – list** | `/events/list` | Cards, sort (earliest, nearest, most popular, price), filters |
| **Event details** | `/events/battlebox`, or any event card | Info, save, share, discussion |
| Forum | `/forum/battlebox` | **Join the conversation…** → **Comment** steps through posting a reply (click-through, not a real text box) |
| Notifications | `/notifications` | Feed and settings |

- **Events** (map, list, details) is fully working and responsive.
- **Everything else** is a click-through copy of the Figma design: fixed 1440px wide, and most
  non-link buttons do nothing.
- Saved events and "Your Preferences" are kept in `localStorage`; clear the site data to reset.

---

## 3. Project layout

```
index.html              Entry page
src/
  main.js               Starts the Vue app
  router/index.js       Address → screen
  views/                The Figma screens (Discover, Artist, Forum, Onboarding, ...)
  components/screens/   Pieces used by those screens
  components/layout/    Navbar and toast for the Events screens
  layouts/              EventsLayout.vue, the Bootstrap shell for Events
  features/events/      Events map, list, details (views, components, filters, data service)
  data/db.json          All app data: user, routes, images, genres, graph dots, events
  data/index.js         Reads db.json
  assets/styles/        main.css (Events) and screens.css (Figma screens)
public/assets/          Icons, images, logo
scripts/                fetch-figma-images.mjs, screens.src.css
legacy-astro/           Previous Astro version, kept for reference only
```

| To change... | Edit |
| --- | --- |
| The user (Kit Tan) | `src/data/db.json` → `"user"` |
| Events, venues, artists | `src/data/db.json` → `"events"` |
| Add a page | `src/views/MyView.vue`, then a route in `src/router/index.js` |
| Events colours and look | `src/assets/styles/main.css` |
| Events filtering and sorting | `src/features/events/composables/useEventFilters.js` |

Link between screens with plain `<a href="/events/map">` tags. Each is a full page load, which
keeps Bootstrap (Events) and `screens.css` (Figma screens) from affecting each other.

---

## 4. Other commands

| Command | What it does |
| --- | --- |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves `dist/` locally |
| `npm run fetch-images` | Replaces the placeholder images with the Figma photos |

**`fetch-images`:** create a Figma personal access token (*Settings → Security*, scope
*File content: read-only*) and pass it as `FIGMA_TOKEN`:

```bash
FIGMA_TOKEN=your-token npm run fetch-images                 # macOS / Linux
$env:FIGMA_TOKEN = "your-token"; npm run fetch-images       # Windows PowerShell
```

It writes to `public/assets/img/figma/` and updates the `images` entry in `db.json`. Don't
commit the token.

`screens.css` is pre-built from the utility classes used by the Figma screens. After adding
new classes, regenerate it with:

```bash
npx @tailwindcss/cli -i scripts/screens.src.css -o src/assets/styles/screens.css
```

---

## 5. Troubleshooting

| Problem | Fix |
| --- | --- |
| `Cannot find module ...` after pulling | Run `npm install` again |
| Server starts on `5174` or another port | If an old dev server is still running; close it or use the printed link |
| Events page looks stale or broken | Delete `node_modules/.vite` and restart `npm run dev` |
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
