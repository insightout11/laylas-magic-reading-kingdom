# Third-party assets

## Phonics audio — `audio/phonemes/` (all 43 files)

Every phoneme recording in this app comes from a **single** instructional
phonics source, so the library sounds like one teaching voice rather than a
patchwork of different speakers and microphones.

| | |
|---|---|
| **Project** | [s5s5/phonics](https://github.com/s5s5/phonics) |
| **Author** | Xiaochao Liu |
| **Copyright** | © 2022 Xiaochao Liu |
| **Licence** | [MIT](https://github.com/s5s5/phonics/blob/main/LICENSE) |
| **Redistribution** | Permitted — MIT grants use, copy, modify, merge, publish, distribute, sublicense |
| **Commercial use** | Permitted |
| **Attribution** | Required — this notice satisfies it |

> Phonics audio by Xiaochao Liu (s5s5/phonics), MIT License.

### MIT License

```
Copyright (c) 2022 Xiaochao Liu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### What was changed

Files were re-encoded, not re-recorded. Each imported file was silence-trimmed
at both ends and gain-normalised so the **encoded** result peaks at −1.5 dBFS,
matching the six starter recordings already approved for this app. Output
format is mono, 44.1 kHz, MP3 128 kb/s CBR.

The six starter files (`s.mp3`, `a.mp3`, `t.mp3`, `p.mp3`, `i.mp3`, `n.mp3`)
were **not** touched by the import — they are byte-for-byte what they were
before, and the importer refuses to write them.

Per-file provenance, checksums, durations and measured peaks are recorded in
[`audio/phonemes/manifest.json`](audio/phonemes/manifest.json). Regenerate it
with `npm run import-phonics`, or re-verify without downloading anything with
`npm run verify-phonics`.

### Retired assets

`audio/phonemes/_retired/` holds recordings that are **no longer used**: they
came from Wikimedia Commons IPA demonstration audio, which is a different
speaker per phoneme and not phonics-instructional. They are kept on disk for
reference only; the app never loads that directory.

---

## Fonts

Loaded from Google Fonts at runtime (Open Font License):
**Andika** (used for every letter a child has to decode — chosen because it
keeps `a` and `g` single-storey and disambiguates `I`/`l`/`1` and `b`/`d`/`p`/`q`),
**Baloo 2** and **Quicksand** for decorative headings.

## Artwork

All child-facing artwork is original to this project: hand-authored SVG in
`feltkit.js`, `felt-characters.js`, `felt-princess.js` and `characters.js`.
No third-party image assets are bundled.
