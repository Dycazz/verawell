# VeraWell

A working prototype of the two-audience shelter app described in
[`docs/mvp-spec.md`](docs/mvp-spec.md), plus the Staff Console that spec
correctly points out the guest features depend on.

One Expo (React Native) codebase covers all three surfaces — iOS, Android, and
the web build the console runs on.

```bash
npm install
npx expo start          # then press i / a, or scan with Expo Go
npx expo start --web    # the console is easiest to review here
```

## Signing in

| Surface | How to get in |
|---|---|
| Community | No login. Open the app, tap **Support the shelter**. |
| Guest | Tap **I'm staying here**, code `HARBOR-482` (or `WILLOW-315`). |
| Staff Console | **Staff sign in** at the bottom of the front door, PIN `2468`. |

Two things worth trying together: change the advocate count or post a notice in
the console, then open the guest side — the Today screen reflects it straight
away. Editing **Needs** in the console changes the public **Needs** tab the same
way. That shared state is the point of the console existing.

**Quick exit**: the discreet *Exit* button on every guest screen drops the
session and replaces the screen with a plain notes app. To come back, press and
hold the **Notes** heading for about a second. That gesture is deliberately
undiscoverable — a visible "return to shelter app" control would defeat it.

## What's built

Everything the spec lists for the MVP: **Launch, Fast follow and Phase 2**, plus
the Staff Console that makes the guest features work.

**Community (no login)** — crisis contact docked on every screen, contact staff,
current needs, donation link-out, community resources, website and socials.
*Fast follow:* newsfeed (pinned posts first), volunteer sign-up, ways to help
(drives, drop-offs, skills, events), training requests.

**Guest (anonymous code login)** — contact an advocate with threaded replies,
safety guides, staff status, advocate count, guest guidelines, house calendar,
shelter-wide alerts. *Fast follow:* help desk chat, anonymous chore checklist,
amenities, neighbourhood guide, guides & resources library, anonymous feedback
with a public "You said, we did" board, and a shared shopping wishlist.
*Phase 2:* referral requests (legal, housing, financial, health) with status and
an advocate note the guest can see.

**Staff Console (responsive)** — shift status and advocate count, house notices,
inbox (advocate threads and help desk questions are labelled), needs editor,
calendar editor, guest codes, and: volunteer & training requests, referral
queue, feedback triage with optional public replies, wishlist review, chore list
with daily reset, and a content editor for news, ways to help, amenities,
neighbourhood places and guides. On a phone the console shows five tabs and a
**More** hub for the rest.

Two design decisions worth knowing about:

- **One list, two audiences.** Approving a guest's wishlist item publishes it to
  the public Current Needs list; marking it received flips it to *stocked*;
  declining withdraws it. The spec asked for exactly this.
- **Feedback carries no identity.** No guest code, session or device is passed
  to `submitFeedback`, so there is nothing to look up. The trade-off is that
  staff cannot reply privately — the only reply channel is the public board.

## Safety and privacy

The spec calls these non-negotiable, so they are infrastructure rather than a
settings screen:

- **No legal name.** A staff-issued code is the entire account. Staff see the
  code and a room label they chose — there is no name field anywhere in the data
  model.
- **No location.** No location permission is requested and no location API is
  called, foreground or background.
- **Auto-logout.** Idle timeout (1/2/5/15 min, default 5) plus lock-on-
  background. Guest session state is plain React state in
  `src/safety/session.tsx` — never written to disk, so there is nowhere for it to
  leak from.
- **Nothing cached about a guest.** The only things written to the device are
  four privacy preferences, none of which identify anyone.
- **Discreet mode.** Presents the app as "Daily Notes" in-app.
- **Quick exit.** One tap to a cover screen that shares no styling, strings, or
  branding with the rest of the app.

Two of these need native work a prototype can't finish, and are honestly
partial today:

- **Generic app icon and name** works in-app, but swapping the actual home-screen
  icon and label needs iOS alternate icons and an Android activity-alias. That
  requires a dev build (not Expo Go) and a config plugin.
- **Quiet notifications** is wired as a preference, but push itself isn't
  connected — that needs an APNs/FCM project, which is a real-backend task.

## How it's put together

```
app/                  Expo Router routes
  index.tsx           front door
  cover.tsx           quick-exit decoy
  public/             community tabs
  guest/              guest tabs (guarded)
  staff/              console (guarded, responsive nav)
src/
  theme/              tokens, system type ramp, light + dark
  components/         Screen, Group, Row, Button, Segmented, Conversation, CrisisBar…
  data/               types, seed, backend adapter, reactive store
  safety/             session + auto-lock, privacy prefs, quick exit
  lib/                phone/URL handoff, date and time formatting
```

**Swapping in a real backend** is one line. `src/data/backend.ts` defines a
`Backend` interface; the prototype ships `LocalBackend`, which persists through
AsyncStorage and notifies subscribers. Write a Supabase-backed class against the
same interface and change `const backend: Backend = new LocalBackend()` in
`src/data/store.tsx`. No screen touches storage directly.

What `LocalBackend` persists stands in for *server* state, not a device cache of
guest data — that distinction is what keeps the privacy promise above intact.

## Design

The app is built to feel like part of the operating system rather than like an
app with opinions. Someone opening it may be in a bad moment, on a phone they
are not sure is private; familiarity is worth more here than personality.

That means platform conventions rather than a house style:

- **System typeface** at the iOS Dynamic Type sizes. No bundled webfont, so text
  scales with the user's accessibility settings instead of ignoring them.
- **Inset grouped lists** — the iOS Settings structure — instead of a page of
  drop-shadowed cards. Containers read as raised because their fill differs from
  the grouped background, which is why native lists stay calm at density.
- **iOS system greys** and one institutional accent, so that **red belongs to the
  crisis bar alone** and never stops meaning emergency.
- **Small saturated icon chips** at Settings scale (29pt, white glyph) where they
  help scanning, not large pastel ones as decoration.
- Dark mode is true black and first-class — this app gets used at night in shared
  rooms.

The references it was built against: **iOS Settings and Health** for list
structure and the status summary, **Watch Duty** for a persistent incident bar
that reads as system chrome, and **Signal** for the plain, dense, trust-by-
legibility posture. The staff console borrows from desk tools instead — denser
rows, a horizontal nav, muted chrome — because advocates use it at a keyboard.

The one earned deviation is the crisis bar: full-bleed, square-cornered, and
pinned inside the navigator so it survives every tab change.

## Open questions this build takes a position on

The spec ends with four questions for the group. Two of them the prototype had
to answer to work, so treat these as proposals, not decisions:

- **Who issues a guest code** — the console assumes front-desk staff at intake,
  labelled by room rather than by name. Codes can be retired and reissued; they
  cannot be recovered, because nothing links a code to a person.
- **Staffing a live chat** — advocate messages are modelled as threads, not live
  chat, with an explicit "this can't wait" flag and copy telling guests to use
  911 or the front office for emergencies. That way it degrades safely when
  nobody is watching the queue.

The other two now have working defaults, also proposals rather than decisions:

- **Moderating anonymous feedback** — staff-only. Guests never see raw
  submissions; staff choose whether to publish a reply as "You said, we did".
- **Case-management integration** — referrals are an internal queue whose shape
  (kind, status, details, timestamps, guest code) is ready to be exported or
  pushed to a case-management system. The integration itself depends on which
  system the shelter uses, so it is not built.

## Hosting the web build

`npm run export:web` writes a static SPA to `dist/`. Expo Router resolves its
initial route from `location.pathname`, so a build served from a sub-path would
otherwise land on "Unmatched Route" — `app/+not-found.tsx` redirects anything
unmatched to the front door, which makes the export portable to any base URL
without knowing it at build time.

The exported page also references its bundle and icon fonts by absolute paths,
so it expects to be served from the root of its origin. To host it somewhere
else, either set a base URL at export time or inline the bundle and the Ionicons
font as data URIs to make a single self-contained HTML file.

## Status

TypeScript is clean (`npm run typecheck`) and the web export builds
(`npm run export:web`). Every screen, including all the Fast follow and Phase 2
features and both sign-in flows, was driven in a headless browser — 34 checks
across the public app, guest app, staff console on desktop, and the phone nav —
with no console or page errors. The data layer is a local
stand-in — there is no server, no auth, and no push yet, and the staff PIN is
checked on the device, so it protects nothing. It is a prototype to react to,
not something to put in front of guests.
