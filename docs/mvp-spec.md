# VeraWell — MVP Spec (Draft v0.1)

Native iOS/Android app with two front doors: one for the community that
supports the shelter, one for the guests living in it. This document scopes
the MVP for discussion before any development starts.

See the shareable version: published as a Claude Artifact for reviewing
with the team (link shared separately — this file is the source of record
for the repo).

## Two audiences

Everything below is sorted by when it should ship, not by how it was
originally listed: **Launch** has to work day one, **Fast follow** lands
within a few weeks after, **Phase 2** waits until the core is stable.

### For the community (public, no login)

**Launch**
- Crisis contact button — one tap, always on screen, to the crisis line
- Contact staff — simple call / message form
- Current needs — what the shelter needs this week, staff-editable
- Donation — link out to existing donation processor
- Community resources — other agencies, hotlines, important numbers
- Website & socials — link-outs, near-zero build cost

**Fast follow**
- Newsfeed — needs a content pipeline before it's worth building
- Volunteer — sign-up form, routes to volunteer coordinator
- Ways to help — beyond money: drives, drop-offs, skills
- Training request — for orgs/individuals wanting shelter training

### For shelter guests (behind an anonymous guest login)

**Launch**
- Contact an advocate — the reason to install the app
- Safety — personal, fire, severe weather; clear and always reachable
- Staff status — who's around, without walking to the front
- Advocate count — how many are on shift, no names
- Guest guidelines — house rules, on the device guests already have
- House calendar — meals, groups, curfews, appointments
- Shelter-wide alerts — "delivery arrived," "storm warning" — anonymous, one-way

**Fast follow**
- Help desk chat — non-urgent questions, skip the walk to the office
- Chore checklist — anonymous check-off, mopping / dishes / common areas
- Amenities — what's available and where
- Neighborhood guide — transit, groceries, clinics nearby
- Resources — library of guides and referral info
- Anonymous story / feedback — concerns and ideas without a name attached
- Shopping wishlists — grocery + big-ticket; same list powers "Current Needs" publicly

**Phase 2**
- Referral requests — legal / housing / financial; needs case-management integration

## This spec implies a second app

Staff status, the advocate count, shelter-wide alerts, and the help desk
chat all need someone on the other end — an advocate updating status,
sending an alert, answering a message. That's a lightweight **Staff
Console** (could be a simple responsive web app, doesn't need to be native)
sitting behind the guest-facing launch features. Worth scoping alongside
this, since half of "Launch" for guests doesn't function without it.

## Safety & privacy come before features

Given who this app is for, the guest side needs to be designed like it
might end up on a shared or monitored phone. A few things that should be
non-negotiable in the MVP, not deferred to "later":

- **No legal name required** to create a guest account — a staff-issued
  code or PIN is enough.
- **No location tracking** beyond what a single feature explicitly needs,
  and never running in the background.
- **Generic app icon and name option** — something that doesn't read as
  "shelter app" on a home screen.
- **Quiet notifications** — lock-screen previews never name the shelter or
  show message content.
- **Auto-logout** after inactivity, with no cached guest data left behind
  on the device.
- **Data minimization** — anonymous means anonymous; don't collect what
  isn't used.

## Tech approach

Optimized for a small team getting a real MVP into two app stores, not for
scale that doesn't exist yet.

| Layer | Recommendation | Why |
|---|---|---|
| Frontend | React Native (Expo) | One codebase for iOS + Android, fastest path to something installable on both stores |
| Backend | Firebase or Supabase | Auth, database, and push notifications out of the box — no custom server to stand up for v1 |
| Guest auth | Anonymous / code-based | No email or legal name required, matches the safety constraints above |
| Chat | Managed realtime DB, not a full messaging SDK | Help desk chat is low-volume; don't pay for infrastructure it doesn't need yet |
| Staff console | Simple responsive web app | Advocates are usually at a desk — no need to build and maintain a third native app |

## Rough roadmap

0. **Spec & feedback** — this document. Get the group's eyes on scope and
   priority before writing code.
1. **Launch build** — public + guest "Launch" tiers, plus the minimum
   Staff Console needed to make them work.
2. **Fast follow** — chat, chore checklist, wishlists, resources — the
   features that round out day-to-day use.
3. **Phase 2** — referral requests and anything that needs deeper
   integration with how the shelter already tracks cases.

## Open questions for the group

- Who issues a guest their login code — front desk staff at intake, or
  something self-serve?
- Does anyone moderate the anonymous story/feedback submissions, and who
  sees them?
- Is there staffing to actually answer a live help-desk chat during shift
  hours?
- Does the shelter already use case-management software the referral
  feature (Phase 2) should plug into?
