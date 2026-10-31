# AFTERGLOW · design contract ("Call sheet")

Afterglow is a content gym in Miami: South Beach (an Art Deco building on Collins Ave with a
rooftop, arched mirrors and the Afterglow Bar) and Wynwood (a mural-wrapped warehouse with the
Neon Room, the Ring and the Studio Wall). The promise is **"You train. We shoot."** An in-house crew
films and photographs you during the session, and the edits land in your inbox. The design comes from
the things a shoot runs on: the **camera viewfinder**, the **story ring**, the **contact sheet** marked
up in grease pencil, the **film strip** and the production **call sheet**. Golden-hour light is the
palette.

## 1. Concept in one line

Every session is a shoot. Classes are listed by the set they happen on, the shot you want is
circled on the frame, the cart is a contact sheet, checkout is the release form, and your
confirmation is the call sheet the crew works from.

## 2. Tokens

| Token | Hex | Use |
|---|---|---|
| `--cream` | `#FFF4EA` | Page background (Deco cream) |
| `--cream-2` | `#FBE7D6` | Raised surfaces on cream, the contact-sheet paper |
| `--paper` | `#FFFFFF` | Release form, call sheet |
| `--night` | `#120E1A` | Text, the Neon Room section, the story viewer |
| `--night-2` | `#221B2E` | Raised surfaces on night |
| `--muted` | `#6E6178` | Secondary text |
| `--line` | `#EAD6C6` | Rules on cream |
| `--peach` | `#FFB38A` | Afterglow gradient start |
| `--pink` | `#FF5E8A` | Afterglow gradient middle; the grease pencil |
| `--violet` | `#6A4BFF` | Afterglow gradient end; links and focus |
| `--rec` | `#D7FF3A` | REC dot, "live", spots-left "going fast" on night |
| `--gold` | `#F4A93B` | Golden-hour badge |

`--afterglow` = `linear-gradient(120deg, peach, pink 55%, violet)`. It appears on: story rings, the
primary "Book" action, the hero scrim, the golden-hour badge and the call-sheet header band. It is
**never** a background for running text.

Category tones (per collection, used as a 3 px "gel" edge on a set card and as story-ring seeds):
ride `#FF3EA5` (neon pink), sculpt `#FF8A5B` (coral), flow `#F4A93B` (gold), box `#6A4BFF` (violet),
sweat `#00C2A8` (aqua), coaching `#120E1A` (night), content `#FF5E8A` (pink), glow `#8E7CFF`
(lavender), bar `#B5651D` (espresso).

## 3. Type

- **Syne** (600–800) for display: wide, fashion-magazine headlines in sentence case (not uppercase
  slabs), the call-sheet title, set names.
- **Outfit** (400–600) for all running text and UI.
- **Fragment Mono** for camera readouts and data: times, timecodes (`00:45:00`), frame numbers
  (`FR 07A`), ISO/shutter strings, prices in the contact sheet, spots left.
- None of the three is used by another template or demo.

## 4. Shapes and motifs (hand-built SVG/CSS in `components/frame/*`)

- **Viewfinder** (`viewfinder.tsx`): four corner brackets over an image, plus a REC dot +
  timecode top left and an exposure readout bottom right (`ISO 400 · 1/250`). Used on heroes, set
  photos and the shot add-on previews.
- **Story ring** (`story-ring.tsx`): a circular thumbnail inside a gradient ring. A "seen" ring is a
  thin cream line.
- **Grease pencil** (`grease.tsx`): a hand-drawn, slightly open ellipse in pink that circles a chosen
  shot add-on on its frame, and the items in the contact-sheet cart. A wobbly underline marks the
  current nav item.
- **Film edge** (`film-edge.tsx`): a row of sprocket holes and an edge code (`AFTERGLOW 400 · 12 ▸
  12A`) along the top of contact-sheet frames and the call-sheet header.
- **Set card**: a photo-first card (16 px radius) with a 3 px gel edge in the category tone.
- **Buttons**: soft rectangles (12 px radius, not pills). The primary "shutter" button is night with a
  white shutter dot on the left that fills with the afterglow gradient on hover. "Book" in a booking
  context uses the afterglow gradient.

## 5. Motion (CSS only; no motion library, no smooth-scroll library)

- **Shutter flash:** adding to the shot list flashes a white overlay over the frame (120 ms in,
  280 ms out), and the shot-list count in the header ticks.
- **Story progress:** the story viewer's segmented progress bars fill in real time; tap left/right to
  move; hold to pause.
- **REC blink:** the REC dot blinks at 1 Hz on live/now elements.
- **Light drift:** the afterglow gradient on the hero scrim slowly drifts (40 s loop).
- **Grease pop:** the circle appears with a quick scale-and-rotate (180 ms) when a shot is chosen.
- **Contact-sheet snap:** horizontal frame rows use CSS scroll-snap.
- All of it respects `prefers-reduced-motion`.

## 6. Navigation and page rhythm

- **Header:** a normal top bar on cream: the wordmark, Schedule · Shoots · Coaching · Glow · Bar ·
  Crew, then Sign in and the **Shot list** button (a tiny film frame + count). On mobile: the
  wordmark, the Shot list button and a menu button opening a full-height sheet. No bottom nav.
- **Home:** the hero video (16:9 desktop, the vertical crop on phones) with a viewfinder overlay → a
  row of **story rings** ("Today at Afterglow": Neon Room, Rooftop, Ring, Mirror Hall, Bar, Crew
  picks), which open the full-screen **story viewer** → "You train. We shoot." in three frames (Book
  your class + pick your shot / Train, the crew shoots / Edits land in 48 h) → today's call times
  (the next six sessions) → the sets (South Beach / Wynwood) as a contact sheet → content sessions →
  the crew → the Bar & café → the Glow Pass (coming soon) → sites.
- **Rhythm:** cream pages; the Neon Room and the story viewer are night; one section per page can
  go night. Section heads are a Syne headline with a Fragment Mono slate line above it
  (`SCENE 03 · THE SETS`), not an eyebrow pill.

## 7. Booking interactions

- **Schedule (`/schedule`, "Call times")**: one day at a time. The date strip sits directly above the
  list. Sessions are grouped by **set** (Neon Room, Rooftop, Mirror Hall, the Ring, the Beach…), each
  group headed by its set photo. A row shows: time, class, coach, spots left, a **golden-hour badge**
  when the class overlaps the real Miami golden hour that day (`lib/sun.ts`), and a camera icon when
  shots can be added. Tapping a row **expands it in place** (no side sheet, no docked panel): the
  description, the four shot add-ons as viewfinder frames you circle, the price, and the Book
  button at the bottom of the expanded row (sticky to the viewport bottom on phones while the row is
  open). Full sessions show "Full · next with space →".
- **Shoots / coaching / glow / bar tables** (the service booker): choose the option (set, tier, suite,
  table), then who (crew / coach portraits, or "anyone"), then the length, then the date strip with
  plain time buttons right under it, and the summary with Book right next to the times.
- **Shot list (cart drawer)**: a contact sheet. Each session is a frame with its photo, frame
  number, time and price, and the shot add-ons are written beside it and circled in grease pencil.
  Totals and discounts come from the cart.
- **Checkout (`/checkout`)**: the **release form**. One document: the shot list as a film strip
  across the top, then *You* and *Release* (content consent as three large options, Instagram handle,
  goal, the waiver checkbox) on one form, signed with one "Sign & continue" button. Then the
  payment section opens below. No accordion, no sticky side summary.
- **Thank-you (`/thank-you`)**: the **call sheet**. A production document with an afterglow header
  band: call time, set and site, crew (coach + camera), wardrobe notes, what the crew delivers and
  when ("edits by email within 48 h"), getting there, add to calendar, and a 9:16 **story card** you
  can download and post ("Booked at Afterglow").
- **Account (`/account`, "Your roll")**: upcoming call sheets (move / cancel / add to calendar) and past
  sessions as a contact-sheet grid with the shots booked, circled. Honest delivery copy, no fake
  gallery.

## 8. How this differs from every other template

| | Others | AFTERGLOW |
|---|---|---|
| Navigation | METTLE: rubber bar + LED "next on the floor" readout. Tensile: ink instrument header. | A cream header with a film-frame shot-list button, and **story rings** under it on home opening a full-screen story viewer. No template has stories. |
| Section rhythm | METTLE: rubber/chalk slabs split by a plate-colour strip. Gable: numbered drawing sheets. Alba: chart rail. | Cream pages with a "slate" line (`SCENE 03`) over Syne headlines. One night "Neon Room" section per page. Viewfinder brackets on photography. |
| Timetable | Tensile: a week grid of day columns + slide-over class sheet. METTLE: one day on a horizontal clock with lanes per discipline + panel docked under the board. | One day as a **list grouped by set** with set photos, a **golden-hour badge** from a real sunset calculation, and rows that **expand in place** with the shot choice inside. |
| Upsell | METTLE: barbell thresholds. Gable: gap upsells on the day sheet. | **Shot add-ons** (clips, photo set, reel, raw roll) on every class, picked as viewfinder frames and circled in grease pencil. |
| Cart | METTLE: the Bar (barbell). Gable: day sheet. Others: a list drawer. | A **contact sheet** with frame numbers and grease-pencil circles. |
| Checkout | Step accordion + sticky summary (HAAR/Clarity/Tensile). METTLE: three stacked sets collapsing to receipts. | One **release form**: You + Release signed together, then payment, under a film-strip summary. |
| Confirmation | Tickets (several), METTLE's race bib, Alba's flippable card, Gable's section drawing. | A production **call sheet** + a downloadable 9:16 **story card**. |
| Account | METTLE: training log + plate stack. Gable: week plan board. Tensile: "Your week". | **Your roll**: upcoming call sheets and a contact-sheet grid of past sessions. |
| Type | Big Shoulders/Albert/Chivo (METTLE), Bricolage/Onest/Azeret (Gable), Instrument Serif/Hanken (Alba)… | Syne / Outfit / Fragment Mono. |
| Motion | Shared kit (fade-up, parallax, marquee, Lenis), METTLE rack-in + LED tick, Gable stroke draw-on. | Shutter flash, story progress, REC blink, light drift, grease pop, scroll-snap. |

## 9. Usability rules (non-negotiable)

- Normal top header; no bottom nav bar.
- Times are plain tappable buttons, directly under the date strip.
- The primary action (Book / Add to shot list) is always in view while choosing.
- Works at 390 px: the story viewer is full-screen, set cards stack, the expanded row's Book button
  sticks to the bottom of the viewport while the row is open.
- Focus is visible (violet ring); every overlay traps focus and closes on Escape.
