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

The spec sorts features by ship order, and the roadmap makes step 1 the Launch
build. That is what this is: **both Launch tiers in full, plus the minimum
console to make them work.** Fast-follow and Phase 2 are not started — better a
complete Launch than a thin slice of everything.

**Community (no login)** — crisis contact docked on every screen, contact staff
(call + message form), current needs, donation link-out, community resources,
website and socials.

**Guest (anonymous code login)** — contact an advocate with threaded replies,
safety guides (personal, fire, severe weather, medical), staff status, advocate
count, guest guidelines, house calendar, shelter-wide alerts.

**Staff Console (responsive)** — shift status and advocate count, post and
retire house notices, inbox for guest threads and community messages, needs
editor, calendar editor, issue and retire guest codes. It lays out as a desk app
above 820px and a phone app below.

Not built, per the spec's own phasing: newsfeed, volunteer sign-up, ways to
help, training requests, help desk chat, chore checklist, amenities,
neighbourhood guide, resource library, anonymous story/feedback, shopping
wishlists, referral requests.

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

Moderation of anonymous feedback and case-management integration are untouched —
both belong to features that aren't in this tier.

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
(`npm run export:web`). Every screen and both sign-in flows were driven in a
headless browser with no console or page errors. The data layer is a local
stand-in — there is no server, no auth, and no push yet, and the staff PIN is
checked on the device, so it protects nothing. It is a prototype to react to,
not something to put in front of guests.
