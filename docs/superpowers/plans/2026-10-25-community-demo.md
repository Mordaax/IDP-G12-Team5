# Community demo implementation plan

> **For agentic workers:** Use executing-plans to implement the connected flow in this session.

**Goal:** Let Kit demonstrate event discussion → forum comment → listener message → notifications → event ticketing, with progress reset on application reload.

**Architecture:** Keep the existing React pages and visual style. A shared in-memory community store owns action-triggered replies, messages and notifications. Existing transient session state also moves to memory so a reload clears comments, saved artists and conversation history together.

**Tech Stack:** React, React Router, Vite, Node test runner.

**Spec:** User's scenario and clarification: “The demo resets when the application reloads”. Keep the branch's DJ Beatroot identity. Use the existing SISTIC destination, labelled honestly as a ticketing-site handoff rather than an event-specific checkout.

## Global constraints
- No backend or new production dependencies.
- Keep navigation and existing editing/attachment features working.
- Only the matching event thread advances this scenario.
- Keep account login, theme and taste preferences separate from transient demo progress.

## Review focus
- Reload clears posted comments, generated replies, sent messages, notifications and saved demo events/artists.
- Navigating away immediately after Send must not cancel a listener reply.
- Repeated comments and rerenders must not duplicate demo responses.
- Read status survives navigation; new responses remain unread until opened.
- Visiting Messages/Notifications early must not reveal future conversations or purchases.

### Task 1: Shared action-driven state
- [x] Add behavior tests for initially empty state, posting once, send/reply order, deduplication, read state, saved artist updates and fresh-store reset.
- [x] Run tests to see missing implementation fail.
- [x] Implement `createCommunityDemoStore` and its shared instance plus React subscription hook.
- [x] Change transient `sessionGet/sessionSet` to application-memory storage and keep event saves in that storage.

### Task 2: Connect pages
- [x] Wire the featured forum's real Comment action to replies; add suggested first-visit copy and Message listener link.
- [x] Replace future conversation fixtures with neutral initial messages; unlock Joel's conversation after the forum comment and add a suggested recommendation request.
- [x] Render shared notifications with read status, message filter, working destinations and live navbar unread dots.
- [x] Link forum back to event details; preserve external ticket handoff and label its generic destination.

### Task 3: Verify delivery
- [x] Install locked dependencies and run state tests, full existing Node tests and production build.
- [x] Exercise the browser flow, including navigation during reply delivery and reload reset.
- [x] Document the click sequence in README and report results and ticketing limitation.

Verification: browser walkthrough confirmed initially empty notifications/messages; guest draft survives login; Comment adds Kit and two replies; Send delivers after navigating away; notification links open message, comment anchor and artist; SISTIC opens externally; reload clears comments, messages, notifications and saved event/artist progress. Existing ForYou.test.js has two source-layout expectation failures on this branch.
