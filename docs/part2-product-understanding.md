# Part 2 — Product Understanding: AbleSpace Caseload → Take Data

## Scope and how this was produced

I did not have a live AbleSpace login for this assessment — only the single
screenshot of the **Caseload** tab embedded in the assessment PDF (reproduced
below), which shows the entry point to "Take Data" but not the data-entry
screen itself. Rather than invent screens I never saw, this document is split
into two clearly labeled parts:

1. **What I can observe directly** — a walkthrough of the Caseload screen
   itself, in my own words, with concrete UX critique.
2. **What I can reasonably infer** — how the "Take Data" flow most likely
   works, based on the button's placement/labeling and how this class of
   product (special-education / IEP caseload and therapy-session tracking
   software) is conventionally built, flagged explicitly as inference rather
   than observation.

If a walkthrough of the actual Take Data screen is wanted, I'd need either a
sandbox login or a couple more screenshots of that flow — happy to redo this
section properly against the real screen.

> The source screenshot referenced throughout this document is the Caseload
> screen embedded on page 2 of `AbleSpace Assignment.pdf` (the assessment
> brief itself) — reproduced there rather than duplicated here since it's
> the assessment's own material, not something I captured myself.

## 1. What the Caseload screen is, in my own words

This is a caseload roster for a special-education or related-services
provider (an occupational therapist, given the "OT" service-time entries).
It's the hub a clinician opens every day to see **who is on their caseload**
and **jump into logging a session** for any one of them.

- **Top-level framing.** The left rail groups navigation into `CAPTURE`
  (Calendar, Caseload, Data, Accommodations, Service Time) and `TRACK`
  (Report, Billing, Collaborators, History), which tells you this screen is
  the "capture" half of a capture → track loop: Caseload is where you find a
  student, Take Data is where you capture something about them, and Report/
  History is where that capture later surfaces.
- **Three student buckets as tabs**: `Students (15)`, `Groups (12)`,
  `Unassigned (39)`. The count badges are doing real work — 39 unassigned
  records is a large, hard-to-ignore number sitting right next to "Students
  (15)", which reads as "there's a backlog waiting for you."
- **The table** is the roster: Full Name, Last Name, IEP Due, Eval Due,
  Collaborators (an avatar stack — the other providers/teachers on this
  student's team), Service Time (a free-text-looking summary like
  "OT - 30mins/Wk"), School, and an Actions column.
- **The Actions column is the real call to action**: a solid **Take Data**
  button on every row, plus an overflow `⋮` menu. It's visually the only
  filled/colored button in the entire table — everything else is text,
  outlines, or avatars — so the whole screen is designed to funnel you
  toward that one action per row.

**In one sentence:** Caseload is a triage list of students, and "Take Data"
is the one-click bridge from "here's who I'm responsible for" to "let me log
what happened in their session today," which matters a lot in special
education because IEP/Eval compliance dates (visible right there in the
table) create legal deadlines around exactly this kind of documentation.

## 2. The Take Data flow — inferred, not observed

I did not click through to this screen, so treat this as an informed
hypothesis rather than a report of what I saw:

1. Clicking **Take Data** on a row most likely opens a session/data-entry
   view scoped to that one student — probably their active IEP goals or
   accommodations, each with a way to log a trial/attempt outcome (e.g.
   correct/incorrect, prompted/independent, a rating scale, or a free-text
   note), consistent with how goal-based data collection works in IEP
   software (this is the standard pattern in comparable tools like Otus,
   SpedTrack, and Frontline's caseload modules).
2. Given the "Service Time" column values like `OT - 30mins/Wk`, the session
   being logged is probably time-boxed and tied to a specific service type,
   so the Take Data screen likely also captures session duration and service
   type alongside goal data, feeding directly into **Billing** (visible in
   the left rail under `TRACK`) and **Service Time** tracking for compliance
   ("did this student actually receive their mandated 30 min/week").
3. The `⋮` overflow menu next to Take Data probably holds secondary actions
   that don't warrant a full row-width button — editing the student record,
   viewing history, or unassigning/reassigning them — mirroring the
   Take-Data-is-primary, everything-else-is-secondary hierarchy the table
   already establishes visually.

## 3. UX / functionality observations (based on what's directly visible)

These are grounded in the actual Caseload screenshot, not the inferred flow:

1. **"Service Time" is inconsistent and partly unreadable.** Some rows show
   a real value (`OT - 30mins/Wk`), one shows a compound value that gets cut
   off mid-string (`OT - 30mins/Wk, Spe…`), and several rows just show `0`.
   A `0` in a column named "Service Time" reads as an error state, not a
   "no service configured yet" state — those are very different facts for a
   compliance-sensitive field, and the UI currently can't tell them apart.
   I'd replace bare `0` with an explicit "Not set" and truncate the compound
   value with a tooltip rather than a hard cut.
2. **IEP Due / Eval Due carry legal weight but no visual urgency.** Every
   date in those two columns renders in the same plain gray text whether
   it's next week or next year (some rows even show `-`, presumably "none
   scheduled"). Given the left-rail proximity to Billing/Compliance-style
   modules, a due date inside, say, 14 days is exactly the kind of thing a
   caseload screen should surface at a glance — color, a small badge, or a
   default sort by "soonest due" would turn this from a static record into
   an actual worklist.
3. **"Unassigned (39)" is a big, undifferentiated number.** A caseload of 15
   named students next to 39 unassigned records suggests real backlog, but
   the tab gives no year/priority/reason breakdown — a provider has to click
   in and manually triage 39 rows to find out which few are urgent. Even a
   secondary count ("39 unassigned · 6 overdue") would make that badge
   actionable instead of just alarming.
4. **Collaborators is an avatar stack with a "+N" overflow and no obvious
   hover/click affordance in the screenshot.** For a field whose entire job
   is "who else is on this student's team," a static avatar cluster with no
   visible name-on-hover or click-through undersells it — this is exactly
   the kind of control that should open a quick roster popover, especially
   since the same providers likely recur across many students and a
   clinician may want to jump to "show me all of Dr. X's students."
5. **Take Data and the overflow menu are the only two actions offered from
   the list, but the table already has a checkbox-select column with no
   visible bulk action bar.** If multi-select is implemented, there's no
   affordance in this screenshot for what it enables (bulk export? bulk
   reassignment?); if it isn't, the checkboxes are dead weight competing for
   attention with the one action that actually matters (Take Data). I'd
   either surface a bulk-action bar the moment >0 rows are checked, or drop
   the column until there's a bulk action worth offering.
6. **Search only targets students, but the row itself contains School,
   Collaborators, and Service Time — all plausible filter axes with no
   visible filter control.** A caseload provider covering multiple schools
   would likely want "show me only Demo School 2" far more often than a
   free-text name search, since they already know the student they're
   looking for by name most of the time and are really trying to narrow the
   list some other way (by school, by upcoming due date, by service type).

## Summary

The Caseload screen is a well-scoped, single-purpose triage list that does
its one job — get a provider from "who's on my list" to "let me log today's
session" — in a single click. The improvements above are about the fields
that already carry compliance meaning (Service Time, IEP/Eval Due,
Unassigned count) not yet visually reflecting the urgency they represent,
and about a couple of controls (bulk-select, Collaborators) that look
present but under-specified in this screenshot. None of this is a
criticism of the Take Data flow itself, which I wasn't able to see.
