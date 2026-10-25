# Discover: Follow versus Heart

PostHog US project: 687139. Experiment: https://us.posthog.com/project/687139/experiments/514918

## Treatment and task

Only the signed-in Discover map's pinned artist-card save control varies:

- `control` (50%): Follow → Following ✓.
- `heart` (50%): outlined heart → filled heart, with accessible Like/Unlike labels.

Both controls occupy the same space, persist the same collection, and support removal. Other page save controls remain unchanged. This tests wording and icon presentation together; it cannot isolate the icon's effect from the wording's effect.

Give each participant the same neutral task: “Explore Discover and keep any artists you’re interested in. When you’re done, select Finish exploring.” Keep task duration and starting taste profile consistent. Do not explain the lower-commitment hypothesis beforehand.

Hypothesis: The heart control increases the mean number of distinct artists newly saved per exposed participant.

## Assignment and events

Feature flag: `discover-artist-save-control`, variants `control` and `heart`.
PostHog assigns participants using its persistent anonymous browser ID. Do not identify participants as the shared demo account, Kit. Each participant needs a separate browser profile or a fresh private browsing session; different tabs in one profile are not different participants.

The app waits for flags before enabling the control. A missing/disabled flag or failed request falls back to Follow without enrolling anyone. A participant's treatment is retained after exposure. Use a new flag/ledger version for a genuinely new experiment.

| Event | Meaning |
| --- | --- |
| `$feature_flag_called` | Standard PostHog exposure, requested when the real control first renders. Reading assignment suppresses this event. |
| `artist_save_experiment_exposed` | Explicit exposure record; one per enrolled browser participant. |
| `artist_save_control_viewed` | Once per distinct artist card, with `already_saved`. |
| `artist_save_toggled` | Save/remove action during the task, with `artist_id` and `saved`. |
| `artist_saved_first_time` | Once per newly saved artist per participant; pre-existing saves and remove/re-save loops are excluded. |
| `artist_save_task_completed` | Finish exploring, including zero saves, count and duration in milliseconds. |
| `artist_save_feedback_submitted` | Preferred control (`control`, `heart`, `no_preference`), ease rating 1–5 and optional reason. |

Every custom study event includes `experiment_key`, `variant`, `$feature/discover-artist-save-control`, and `source=discover_artist_card`. The browser ledger deduplicates across reloads. Finish exploring ends quantitative collection for that participant; subsequent saves still work. Feedback is submitted once, after the task.

No email, shared demo identity, messages, or forum content is deliberately sent. Autocapture, automatic page views, and session recording are disabled. Browser analytics can still be blocked by browser settings or extensions; local saving works when tracking is unavailable. This prototype persists saves locally, not to a backend account.

## Results

Primary metric configured in the draft: **Mean → Total count of `artist_saved_first_time` per exposed participant**. Because the app emits once per artist, this represents distinct new artists saved. Exposed participants with no saves belong in the denominator.

Secondary metric configured: **Funnel → `artist_saved_first_time` after exposure**, the proportion saving at least one new artist. Further exploratory measures available from the events: removal actions, completion duration, task completion and feedback. The custom feedback form sends events; it is not a PostHog Surveys resource or the experiment's native User feedback tab. Use Product analytics filtered to `artist_save_feedback_submitted` to review it.

Choose recruitment count and stopping rule before launch. Compare participants, not total clicks. Report uncertainty; preference and ease ratings help interpret the result but do not establish the proposed psychological mechanism. Saved-artists state is a browser prototype; clearing storage can re-enrol someone and defeat deduplication.

One labelled setup event was sent to register `artist_saved_first_time` (`is_test=true`, `source=implementation_verification`, distinct ID `lrm-implementation-check-20261025`). It has no flag/exposure and is outside the experiment analysis. Preview actions are never sent.

## Preview and launch

Local development previews (open a dot after login):

- A: http://127.0.0.1:5176/discover/for-you?save_artist_variant=control
- B: http://127.0.0.1:5176/discover/for-you?save_artist_variant=heart

These development-only overrides use separate preview collections and never initialize PostHog. They are for visual QA, not participant data collection. Query-based preview choice is read at page load; use a full navigation/reload to change it.

The public project key and US ingestion host are configured locally in ignored `.env.local`. For a deployment, set `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST=https://us.i.posthog.com` in that deployment's build environment, then rebuild.

The experiment is saved as a **draft**, with its flag disabled. Review both previews and the study protocol, deploy the instrumented code, then launch the experiment from PostHog. Participants should use the normal `/discover/for-you` URL without preview parameters. Changing the remote flag alone does not deploy this code.
