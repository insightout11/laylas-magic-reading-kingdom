# Reading Kingdom — Work Orders

**For:** the implementing agent · **Reviewed by:** the planning agent
**Written against:** `d595a16` · **Live:** https://laylas-magic-reading-kingdom.vercel.app

---

## ⛔ READ THIS BEFORE YOU SYNC ANYTHING

> You said: *"the home repo has moved on since my last turn … I'll re-sync to the latest state before implementing anything."*
>
> **Do not re-sync from the home repo.** That is exactly what caused the last collision.

The git repo rooted at `C:\Users\insig` is **not** the source of truth. Its branch
`laylas-reading-kingdom-phonics-art` sits at `213b5e1` and is **six commits stale**:

```
d595a16  Bank the parent's approval decisions as committed data
73c0065  Make it a real installable PWA, with full offline play
35ba468  Remove schwa mislabeled as short-u
2fb38fd  Deterministic sequencing: one activity, one audio path, no blind timers
ead291f  Blending, sentences and stories: the reading spine
f5d7466  Fix: Warm-up Bubbles could never be completed
--------  ^ all six missing from the home repo
213b5e1  ← home repo stops here
```

Last time, treating the home repo as authoritative reverted the working tree to match it:
six `<script>` tags vanished from `index.html`, and `app.js` rolled back to a copy that
still declared `WORDS`, throwing `Identifier 'WORDS' has already been declared`. Nothing
was permanently lost only because everything was already pushed. Don't rely on that twice.

**The files you saw appear are not WIP.** `content.js`, `runtime.js`, `zone-reading.js`,
`zone-play.js`, `progress.js`, `devtools.js`, `approvals.json` and `icons/` are all
**shipped and live**. They are untracked in the *home* repo only because development moved
to the GitHub repo.

### Source of truth

```
github.com/insightout11/laylas-magic-reading-kingdom   →   main   →   Vercel auto-deploys
```

Clone or pull from there, work there, push there. Ignore the home-dir repo entirely.

---

## The orders

Build in this order. WO-1 is first because the parent's approvals are currently one
cleared cache away from being lost.

| # | Work order | Status | Size |
|---|---|---|---|
| WO-1 | **Approvals become permanent** — ship the decision, never ask twice | defect | M |
| WO-2 | **Letter tracing restored & expanded** | regression | M |
| WO-3 | **Family names** — Lily, Daddy, Mommy, Jackson, Lintang | requested | M |
| WO-4 | **Wider word bank** | requested | S |
| WO-5 | **Guided recording booth** | proposed, not requested | M |

---

## WO-1 · Approvals must survive the device they were made on

**Status: defect.** The parent has already listened to the whole library and decided on
every sound. She must never be asked again — and today she would be.

### What is actually broken

Approvals live only in `localStorage['layla-kingdom-v1']`, in one browser, on one origin.
The shipped `audio/phonemes/manifest.json` records every sound as `UNREVIEWED`; the app
carries no memory of a human decision. So the work is silently lost when:

- the PWA is installed on Layla's **tablet** — different device, empty storage;
- the app is opened on the **other origin** — the Vercel URL and the Pages URL keep
  separate stores;
- site data is cleared, or the browser profile changes.

The hash binding is **not** the cause and is working correctly: across
`2fb38fd → 35ba468` exactly one `sha256` line changed, and it belonged to the deleted
`u_short` entry.

### Step 1 — already done, do not redo it

Her decisions have been captured and committed as **`audio/phonemes/approvals.json`**
(commit `d595a16`). It holds all 42 catalogue entries:

- **40 APPROVED**
- **2 REJECTED** — `th_unvoiced` and `th_voiced`; she rejected both deliberately
- each bound to the `sha256` the file had when she decided

She also approved `u_short`, which no longer exists in the catalogue (the schwa fix in
`35ba468`). That orphan is intentionally not in the file.

**Do not re-run the importer or regenerate any audio before this file is wired in.** A
changed byte would lapse the very approvals it preserves.

### Step 2 — read it

- On load, seed any sound the local save has **no decision for** from `approvals.json`.
- A **local decision always wins.** A later rejection, or a parent's own recording, must
  never be overwritten by the shipped baseline.
- Keep hash binding exactly as it is: a shipped approval applies only while the file's
  bytes still match. Re-import a sound and that one lapses, by design.
- The importer keeps writing `UNREVIEWED` for genuinely new assets. This file records
  decisions already made; it does not manufacture them.

Result: a fresh tablet, a new browser, either origin, or cleared data all start from her
decisions. Asked once, ever, per sound.

### Step 3 — make all progress portable

The same defect strands everything else in that one store: stars, rewards, castle
unlocks, mastery, heart words. Add **Export progress** / **Import progress** to parent
mode — a downloaded JSON file and a file picker. It is the only way to move her to a new
tablet without starting over.

This is now urgent in its own right: her stars and rewards are still only in that one
browser. Her approvals are safe; her progress is not.

### Step 4 — only for sounds nobody has ever decided on

Future imports still arrive unapproved and must not become another 42-item chore. When a
batch has no decision on record, ask for a listen only where a mistake is plausible, and
let one tap cover the rest.

- **Trust the source (one tap).** Direct 1:1 matches between the provider's IPA file and
  the sound taught — same speaker, same session as sounds already approved by ear.
- **Listen first (~12).** Two real failure modes:
  - *Inferred mappings:* `ee←i`, `oo_long←u`, `y←j`, `x←ks`, `j←dʒ`, `qu←kw`, `l←ɫ`, `o_short←ɑ`
  - *Plosives that can carry an added "uh", which wrecks blending:* `b`, `d`, `g`, `k`

The schwa-sold-as-short-u defect you found in `35ba468` was exactly an inferred mapping —
that is why this tier exists.

### Do not

- Do not auto-approve on load, on first play, or on a timer. Shipping a recorded decision
  is not the same as inventing one.
- Do not let the shipped baseline override a local rejection or a parent recording.

### Acceptance

- [ ] Clearing site data and reloading leaves every previously approved sound approved.
- [ ] Both origins start from the same approved baseline.
- [ ] Installing the PWA on a device that has never run the app yields a playable state
      with no approval prompts.
- [ ] A sound rejected locally stays rejected across a reload — the shipped file does not
      resurrect it.
- [ ] Changing one audio file's bytes lapses that sound only.
- [ ] Export then import on a clean profile restores stars, rewards, unlocks, mastery and
      approvals.
- [ ] `Tests.runAll()` still 24/24, plus a new test that the shipped baseline never
      overrides a local decision.

---

## WO-2 · Letter tracing is nearly unreachable — put it back

**Status: regression.** She loves tracing and barely sees it.

`Games.trace` is reachable from exactly one place: a 30% branch inside Rainbow Road. The
main loop never offers it — `adventure()` in `progress.js` contains **no tracing at all**.
It was lost when the session builder was rewritten.

**Files:** `progress.js`, `app.js`, `styles.css`

### Build

- **Put it in the main loop.** Add a tracing beat to `adventure()`. The natural slot is
  after the current-sound activity, tracing the letter she just heard, so the hand
  reinforces the ear.
- **Give it stroke order.** The start dot is currently hard-coded at `(90,90)` for *every*
  letter, which is wrong for most. Add per-letter stroke data: start point, direction
  arrow, stroke count. Lowercase first — that is what she reads.
- **Make "I did it!" mean something.** Today it awards stars with no check at all, and
  `record()` is always passed `true`, so tracing mastery is meaningless. Score coverage of
  the letter path and require a reasonable fraction. Keep it forgiving — she is four; the
  goal is effort, not calligraphy.
- **Trace more than single letters.** Name tracing (WO-3 supplies them) and word tracing
  for words she has already read.
- **Route the audio properly.** `Games.trace` still calls `AudioSys.speak` directly; move
  it to `Sound.say`, and add an `Act.describe` call so the activity declares its target.

### Acceptance

- [ ] Tracing appears in a normal Magical Adventure without visiting Rainbow Road.
- [ ] Each letter's start dot and direction match how the letter is actually written.
- [ ] Tapping "I did it!" without drawing does not award stars.
- [ ] The debug overlay shows a target for the tracing activity, not a generic title.
- [ ] No console errors on a full soak; `Tests.runAll()` still 24/24.

---

## WO-3 · Teach the family's names, not just Layla

She should be able to spell **Lily** (her middle name), **Daddy**, **Mommy**,
**Jackson** and **Lintang**.

Every name game currently hard-codes Layla: `buildName` uses a literal
`['L','A','Y','L','A']`, `findName` a literal `['LAYLA','MAYA','LUCY']`, and
`missingLetter` a literal `'Y'`.

### The rule that must not bend

Names are **letter recognition**, not phonics. `Jackson` and `Lintang` are not decodable
with her sound set and never will be under these rules. Keep names entirely out of
`content.js`, out of `Reading`, and out of the word engine. The separation between name
familiarity and phoneme mastery is deliberate.

### Build

- Add a `NAMES` registry — a new `names.js`, or a clearly separated block that `Reading`
  never reads. Each entry: display form, letter array, who it is, emoji or felt portrait.
- Seed it: `LAYLA`, `LILY`, `MOMMY`, `DADDY`, `JACKSON`, `LINTANG`.
- Generalise `buildName`, `findName`, `missingLetter` to take a name from the registry.
  Slot count must come from the name's length — `buildName` currently hard-codes `next>=5`.
- Praise already derives from `Act`, so it will name the right person for free. Confirm
  `Praise.word` with `type:'name'` reads correctly for a six-letter name.
- Introduce in order: Layla → Lily → Mommy/Daddy → Jackson/Lintang, gating longer ones
  behind shorter ones.
- Add a "my whole name" activity for `LAYLA LILY` once both are solid.
- `findName` distractors must be non-family names, so a wrong tap never shows a real
  person's name as incorrect.

### Acceptance

- [ ] Each of the six names can be built, found and completed, with praise naming that
      specific person.
- [ ] `Reading.readableWords()` is unchanged — no name has entered the word engine.
- [ ] Spelling `JACKSON` never triggers phonics praise or a phoneme milestone.
- [ ] Tests A and B still pass — the `at` / `LAYLA` praise separation must survive.

---

## WO-4 · More words for her to read

**Current state, with her real decisions applied:** 71 of 81 words readable, 11 of 14
sentences, 1 of 3 stories.

- Rejecting both TH sounds costs exactly **one** word: `thin`. Leave them rejected.
- The missing `/ʌ/` costs **nine**: `sun bug rug hug cup bun run fun duck`.

### Build

- Target roughly 160 words. Weight new entries toward sounds approved earliest.
- Every entry needs aligned `ph[]` and `gr[]`. `ship` is three sounds spelled `sh-i-p`,
  not four. This is the easiest thing here to get wrong.
- Set `audio` honestly: `true` only when `audio/words/<word>.mp3` genuinely exists. A
  false flag silently degrades the best moment in the app.
- Add more decodable sentences and one more story once word count supports it — but never
  sacrifice decodability for theme.
- Extend `RHYME_FAMILIES` to cover new rimes so Ballet and Fairy Garden get variety.

### Acceptance

- [ ] No word is readable whose sounds are not all approved and introduced.
- [ ] Every word's `ph.length === gr.length`.
- [ ] Every word claiming `audio:true` resolves to a real file.
- [ ] Every story remains readable end to end, or is not offered.

---

## WO-5 · Guided recording booth *(proposed, not requested)*

53 of 81 words have no recorded whole-word audio, so after Layla blends `b-e-d` the payoff
is synthetic speech rather than the warm human voice she gets for `cat`. Separately, one
missing `/ʌ/` strands nine words. Both are fixed by the same twenty-minute sitting — if
the app makes it easy.

- A parent screen showing exactly what is missing, one item at a time: record / play back
  / keep / skip. Big targets, no menus.
- Put `/ʌ/` first, labelled plainly — "the *uh* in **up**" — then the 53 words in the
  order that unlocks the most reading.
- Reuse the recording plumbing already in the Sound Library.
- Show progress honestly: *"18 of 54 recorded — 12 more unlocks the first story."*

### Acceptance

- [ ] Recording `/ʌ/` brings `sun bug rug hug cup bun run fun duck` back into the engine.
- [ ] A recorded word is used by the blending games in place of synthetic speech.
- [ ] Recordings survive a reload and are included in any progress export.

---

## Guardrails — invariants earlier phases exist to protect

| Invariant | Cheap check |
|---|---|
| Starter six untouched | byte-identical `s a t p i n`; importer refuses to write locked entries |
| No unapproved sound | nothing reaches gameplay, praise, stories or distractors without approval |
| One activity object | feedback derives from `Act`, never from globals like `S.wordsRead[0]` |
| One audio path | no `speechSynthesis.speak` or `new Audio()` outside the manager |
| No cue strings spoken | `PHONEMES[id].cue` is for the parent panel; TTS reads "nnn" as "n n n" |
| Nothing cuts speech off | transitions await `Sound.idle()`; no bare `setTimeout` for progression |
| One advance per activity | `activityDone()` is idempotent — a stray tap must not skip ahead |
| Names stay out of phonics | letter recognition never unlocks a phoneme for decoding |

---

## How this gets reviewed

Push to `main`, let Vercel deploy, then say what changed. Review runs against the live
URL, not a local build:

1. **Regression suite** — Parent → Regression Tests, expected 24/24 plus new tests.
2. **Soak** — 20 randomised sessions; zero stuck states, zero mismatched feedback, zero
   speech overlaps, zero duplicate completions.
3. **Acceptance** — each box above checked individually, not inferred from the suite.
4. **Eyes on it** — screenshots of anything visual, tablet-shaped viewport.

Report what you could not finish as plainly as what you did. A known gap is cheap; a gap
discovered by a four-year-old is not.
