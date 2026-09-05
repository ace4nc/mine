# between here and there.

Rebuilt as one continuous story, not a website. There's no menu and no
archive panel — Harmain moves through it exactly one moment at a time, in
the order you built it, at whatever pace you set live. A thin constellation
line above the page — Srinagar to Ottawa — fills in as he goes, so the "how
much is left" feeling is the one piece of persistent navigation. Everything
else is full-screen, one idea at a time.

The night sky is pushed further than before: three parallax star layers that
drift with the cursor, an occasional shooting star, a slow-moving nebula, and
— in the faith chapter — the real moon phase for tonight, computed live, not
a static graphic.

Two chapters were added on top of the original brief, specifically for
Aisha and Harmain:
- **under the same sky** — right after "the distance," a quiet space for
  faith: a few Qur'an references (12:18, 30:21, 2:286) with the translation
  left for you to paste in, plus a fourth of your own choosing.
- **in another language** — right after "our private language," a small
  gallery for the Urdu poetry you love (Faiz Ahmed Faiz, Ahmed Faraz),
  your own ghazal "Khud se Jung" if you want it here, and one original
  short piece already written in for you.

## 1. How it moves

Advance with a click on the arrow, the space bar, the right arrow key, or a
swipe on mobile. Go back with the left arrow or the left-side button. That's
the entire navigation model — there is deliberately no way to jump ahead or
skip around, so the order you built stays the order he experiences. This
also makes it easy to drive live on a call: you control exactly when each
beat lands.

## 2. What's actually built and working

- Opening: begin → "you are here / I am here" → the constellation → enter
- The distance: live local time for both of you, real time-zone gap, and a
  real days-since counter — nothing faked
- Under the same sky: your four verses, with tonight's real moon phase
- A timeline of firsts, one memory at a time
- The artifact archive (messages, screenshots, voice, songs, quotes,
  memories, confessions, jokes, places), one at a time
- A custom audio player per song/voice note — only one plays at once —
  plus Spotify-link support for real songs, grouped by mood
- A flip-card knowledge wall
- Sealed "things you don't know about me" cards that crack open on click
- An open-when letter drawer with real date-locking
- The private-language dictionary
- The little-things wall, the poetry gallery, If You Were Here scenarios
- A future checklist that remembers what's been checked, between visits
- The first-photograph frame (EMPTY / RESERVED / FILLED)
- The first-meeting scene, walked through detail by detail
- Today's line, a personalised quiz, a random-us generator, time capsules
  with real date-lock logic
- The letter → final voice note → closing
- Respects `prefers-reduced-motion` and keyboard focus throughout

### Carried over from the previous build, not yet rebuilt
The 12-secret easter-egg system from the first pass didn't make it into this
rebuild — the single-path structure changes how triggers would work, and it
needs a deliberate redesign rather than a copy-paste. Happy to design that
as a next pass once the core story is locked in.

### What's intentionally not built
Section 27–29 of the brief describe a real multi-user backend (Supabase,
authenticated shared archive, admin CMS). That needs real infrastructure and
credentials I don't have, so building it would mean either faking it or
handing you something that looks like it works and doesn't. Instead:
- Everything is config-driven (see below) so *you* are the admin — editing
  `content.js` is the CMS.
- If you want the real shared/authenticated version later, the schema in the
  original brief (profiles, timeline_events, artifacts, voice_notes, letters,
  time_capsules, secrets, shared_entries, with row-level security) is a
  faithful starting point for a Supabase project, and I'm glad to help wire
  it up as a second pass.

## 2. Replacing personal content

Open **`content.js`**. It's one file, organized by chapter, in plain English.
Every placeholder looks like `[YOUR MESSAGE HERE]` — replace the whole
bracketed string. You don't need to touch `index.html`, `app.js`, or
`styles.css` for normal edits; the page rebuilds itself from `content.js` on
load.

Start with `relationship` at the top — names, cities, countries, and
**IANA timezone strings** (e.g. `"Asia/Kolkata"`, `"America/New_York"` — look
yours up if unsure) and `relationshipStart` (`YYYY-MM-DD`). These drive the
live stats in Chapter 1.

## 3. Adding your own verses (faith + poetry chapters)

Two things were deliberately left as placeholders instead of pre-written:

- **Qur'an translations** in `content.js` → `faith.verses`. Translations
  belong to their translators, and which one reads truest to you is a
  personal choice anyway — Sahih International, Yusuf Ali, and Mustafa
  Khattab's *The Clear Qur'an* are all easy to find online. Each verse
  already has its reference (e.g. Surah Yusuf 12:18); just paste the
  translation you like into `text`.
- **Faiz Ahmed Faiz and Ahmed Faraz couplets** in `content.js` →
  `poetry.entries`. Their work is still under copyright, so paste the
  specific couplet you love (not the whole ghazal) into `excerpt`, in
  Urdu script, Roman Urdu, or both — the font is already set up to
  render Nastaliq-style Urdu script beautifully if you paste it in.

One original short piece ("for the one who is far") is already written in
under `poetry.entries` as a placeholder anchor for that chapter — replace
it, keep it, or move it, however you like.

## 4. Adding audio

1. Drop files into the `audio/` folder (mp3 or m4a work everywhere).
2. In `content.js`, set the relevant `audio` field to `"audio/your-file.mp3"`.
3. For commercial songs, don't upload the file — use a Spotify link instead:
   set `spotify: "https://open.spotify.com/track/..."` and leave `audio: null`.
   This keeps you on the right side of copyright and gives a nicer embed.

The audio engine is already safe: only one voice/song plays at a time, and if
a track fails to load it shows a small toast instead of breaking.

## 5. Adding the first photograph, later

In `content.js`, find `firstPhotograph`:
```js
firstPhotograph: {
  state: "RESERVED",   // change to "FILLED" when the day comes
  image: null,         // set to "images/first-photo.jpg"
  caption: "...",
}
```
Drop the photo into `images/`, update `image` and `state`, and the frame
transforms — same frame, same position, just filled.

## 6. Deploying

This is a static site, so any static host works:

- **Simplest:** drag the whole `between-here-and-there` folder onto
  [Netlify Drop](https://app.netlify.com/drop) — done in seconds, gives you a
  private-ish URL.
- **Vercel:** `vercel deploy` from inside this folder (no framework needed —
  choose "Other" when asked).
- **GitHub Pages:** push this folder to a repo and enable Pages on it.
- **Just for one person, right now:** you can also just send the `index.html`
  file directly, or zip the folder — it works by double-clicking `index.html`
  locally too (audio autoplay restrictions still apply, which is by design).

No environment variables, Supabase project, or Spotify developer account are
required for anything currently built — Spotify only needs a normal share
link, not an API key.

## 7. Personal content still needed (not a technical to-do — a you to-do)

Every `[BRACKETED]` value in `content.js`:
- Real names, cities, countries, timezones, relationship start date
- 9 timeline events
- 10 archive artifacts
- Songs and voice notes for the Sound chapter
- 10 knowledge-wall answers, 8 sealed confessions
- 11 open-when letters
- 3+ private-language entries
- 4 verses/du'as for "under the same sky" (translations + your own closing line)
- Your favourite Faiz/Faraz couplets for "in another language" (optional)
- 8 little-things notes
- 6 "if you were here" scenes
- The first-meeting imagined scene
- The main letter and the final voice note
- Quiz questions, random-us prompts, time capsule messages
- 6 more secrets, hidden wherever you like in the code

Nothing in this file was invented as if it were your real relationship —
every placeholder is a placeholder, not a guess.
