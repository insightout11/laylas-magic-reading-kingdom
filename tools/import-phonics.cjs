#!/usr/bin/env node
/* ============================================================
   import-phonics.cjs — build-time importer for the phonics library.

   Downloads every non-locked phoneme in phonics.js from ONE licensed
   instructional source (s5s5/phonics, MIT) and conditions each file to
   match the six already-approved starter recordings:

       mono · 44100 Hz · MP3 128 kb/s CBR · peak -1.5 dBFS · silence trimmed

   HARD RULES
   - Entries marked locked:true (s a t p i n) are NEVER downloaded and
     NEVER written. They are read only to record their hash + provenance.
   - Nothing is marked APPROVED here. Every newly written asset lands as
     UNREVIEWED and must be listened to by a human in Parent > Sound Library.
   - Approval is bound to the file's sha256. If an asset's bytes change, the
     app resets that one sound to UNREVIEWED — approvals for untouched files
     (including the starter six) survive.

   Usage:
     node tools/import-phonics.cjs            # download + convert + manifest
     node tools/import-phonics.cjs --verify   # no downloads; re-check + manifest
     node tools/import-phonics.cjs --dry-run  # report what would happen
   ============================================================ */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'audio', 'phonemes');
const RETIRED_DIR = path.join(OUT_DIR, '_retired');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');
const FFMPEG = path.join(__dirname, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const FFMPEG_BIN = fs.existsSync(FFMPEG) ? FFMPEG : path.join(__dirname, 'node_modules', 'ffmpeg-static', 'ffmpeg');

const { PHONICS_CATALOG, PHONICS_PROVIDER } = require(path.join(ROOT, 'phonics.js'));

const args = process.argv.slice(2);
const VERIFY_ONLY = args.includes('--verify');
const DRY_RUN = args.includes('--dry-run');

/* Conditioning targets — measured from the approved starter six. */
const TARGET = { rate: 44100, channels: 1, bitrate: '128k', peakDb: -1.5, trimDb: -45 };

const TRIM_CHAIN =
  'silenceremove=start_periods=1:start_duration=0:start_threshold=' + TARGET.trimDb + 'dB:detection=peak,' +
  'areverse,' +
  'silenceremove=start_periods=1:start_duration=0:start_threshold=' + TARGET.trimDb + 'dB:detection=peak,' +
  'areverse';

function ff(argv) {
  return execFileSync(FFMPEG_BIN, ['-hide_banner', '-nostdin', '-y'].concat(argv),
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}
/* ffmpeg writes its analysis to stderr and exits non-zero on real errors. */
function ffProbeText(argv) {
  try {
    execFileSync(FFMPEG_BIN, ['-hide_banner', '-nostdin'].concat(argv),
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return '';
  } catch (e) {
    return String((e.stderr || '') + (e.stdout || ''));
  }
}
function analyse(file, filterPrefix) {
  const chain = (filterPrefix ? filterPrefix + ',' : '') + 'volumedetect';
  let out = '';
  try {
    out = execFileSync(FFMPEG_BIN,
      ['-hide_banner', '-nostdin', '-i', file, '-af', chain, '-f', 'null', '-'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) { out = String((e.stderr || '') + (e.stdout || '')); }
  // execFileSync puts stderr on the error path only when the exit code is
  // non-zero; ffmpeg exits 0 here, so read the captured stderr directly.
  if (!/max_volume/.test(out)) {
    const r = require('child_process').spawnSync(FFMPEG_BIN,
      ['-hide_banner', '-nostdin', '-i', file, '-af', chain, '-f', 'null', '-'],
      { encoding: 'utf8' });
    out = (r.stderr || '') + (r.stdout || '');
  }
  const max = /max_volume:\s*(-?[\d.]+) dB/.exec(out);
  const mean = /mean_volume:\s*(-?[\d.]+) dB/.exec(out);
  const dur = /time=(\d+):(\d+):([\d.]+)/g;
  let last = null, m;
  while ((m = dur.exec(out))) last = m;
  const seconds = last ? (+last[1]) * 3600 + (+last[2]) * 60 + (+last[3]) : null;
  return {
    maxDb: max ? parseFloat(max[1]) : null,
    meanDb: mean ? parseFloat(mean[1]) : null,
    duration: seconds
  };
}
function probeFormat(file) {
  const out = ffProbeText(['-i', file]);
  const a = /Audio:\s*([a-z0-9]+),\s*(\d+) Hz,\s*(mono|stereo)/i.exec(out);
  const d = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(out);
  return {
    codec: a ? a[1] : null,
    rate: a ? +a[2] : null,
    channels: a ? (a[3].toLowerCase() === 'mono' ? 1 : 2) : null,
    duration: d ? (+d[1]) * 3600 + (+d[2]) * 60 + (+d[3]) : null
  };
}
function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
function log(...a) { console.log(...a); }

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'layla-phonics-importer' } });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 512) throw new Error('suspiciously small download (' + buf.length + ' bytes)');
  fs.writeFileSync(dest, buf);
  return buf.length;
}

/* True peak in dBFS, measured in float so encoder overshoot above 0 dB is
   visible. volumedetect clamps to s16 and would report a misleading -0.0. */
function truePeakDb(file) {
  const r = require('child_process').spawnSync(FFMPEG_BIN,
    ['-hide_banner', '-nostdin', '-i', file, '-af',
     'aformat=sample_fmts=flt,astats=measure_overall=Peak_level:measure_perchannel=none',
     '-f', 'null', '-'], { encoding: 'utf8' });
  const out = (r.stderr || '') + (r.stdout || '');
  const m = /Peak level dB:\s*(-?[\d.]+|-?inf)/i.exec(out);
  if (!m) return null;
  return /inf/i.test(m[1]) ? -Infinity : parseFloat(m[1]);
}

function encodeAt(inFile, outFile, gainDb) {
  const chain = TRIM_CHAIN +
    ',volume=' + gainDb.toFixed(2) + 'dB' +
    ',afade=t=in:st=0:d=0.005' +
    ',aresample=' + TARGET.rate;
  ff(['-i', inFile, '-af', chain, '-ac', String(TARGET.channels),
      '-ar', String(TARGET.rate), '-c:a', 'libmp3lame', '-b:a', TARGET.bitrate,
      '-map_metadata', '-1', outFile]);
}

/* Trim silence and normalise so the FINAL, ENCODED file peaks at
   TARGET.peakDb — the level the six approved starter files sit at.

   A single measure-then-apply pass is not enough: lossy MP3 encoding
   overshoots the source waveform (measured at ~2.6 dB here), which would
   push a -1.5 dB source to +1.1 dB and clip. So we encode, measure the
   result's true float peak, correct the gain, and repeat until it lands. */
function condition(inFile, outFile) {
  const pre = analyse(inFile, TRIM_CHAIN);
  if (pre.maxDb === null) throw new Error('could not measure ' + inFile);
  let gain = TARGET.peakDb - pre.maxDb;
  let peak = null, passes = 0;
  for (let i = 0; i < 6; i++) {
    passes++;
    encodeAt(inFile, outFile, gain);
    peak = truePeakDb(outFile);
    if (peak === null || peak === -Infinity) break;
    const err = TARGET.peakDb - peak;
    if (Math.abs(err) <= 0.15) break;
    gain += err;
  }
  return { gainDb: +gain.toFixed(2), preTrimPeakDb: pre.maxDb, finalPeakDb: peak, passes };
}

(async function main() {
  if (!fs.existsSync(FFMPEG_BIN)) {
    console.error('ffmpeg not found. Run: cd tools && npm install');
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'phonics-'));

  const manifest = {
    _schema: 2,
    _generated: new Date().toISOString(),
    _provider: PHONICS_PROVIDER,
    _note: 'approvalStatus is NEVER set here. Every asset ships UNREVIEWED and ' +
           'must be listened to by a parent in Parent > Sound Library. The app ' +
           'binds approval to sha256, so untouched files keep their approval.',
    _conditioning: {
      format: 'MP3 ' + TARGET.bitrate + ' CBR, ' + TARGET.rate + ' Hz, mono',
      peakTarget: TARGET.peakDb + ' dBFS',
      silenceTrim: TARGET.trimDb + ' dB peak threshold, both ends',
      matchedTo: 'the six approved starter recordings (s a t p i n)'
    },
    sounds: {}
  };

  let imported = 0, skipped = 0, failed = 0;
  const keptFiles = new Set(['manifest.json']);

  for (const entry of PHONICS_CATALOG) {
    const outPath = path.join(OUT_DIR, entry.file);
    keptFiles.add(entry.file);
    const rec = {
      phonemeId: entry.id,
      ipa: entry.ipa,
      target: entry.target,
      graphemes: entry.graphemes.slice(),
      primaryGrapheme: entry.graphemes[0],
      exampleWord: entry.word,
      phase: entry.phase,
      introducedOrder: entry.order,
      type: entry.type,
      audioFile: 'audio/phonemes/' + entry.file,
      provider: PHONICS_PROVIDER.provider,
      source: PHONICS_PROVIDER.id,
      sourceURL: PHONICS_PROVIDER.sourceUrl,
      fileURL: PHONICS_PROVIDER.rawBase + encodeURIComponent(entry.src),
      license: PHONICS_PROVIDER.license,
      licenseURL: PHONICS_PROVIDER.licenseUrl,
      attribution: PHONICS_PROVIDER.attribution,
      redistribution: PHONICS_PROVIDER.redistribution,
      commercialUse: PHONICS_PROVIDER.commercialUse,
      approvalStatus: 'UNREVIEWED',
      notes: ''
    };

    if (entry.locked) {
      if (!fs.existsSync(outPath)) {
        rec.approvalStatus = 'MISSING';
        rec.notes = 'LOCKED starter asset is missing from disk.';
        failed++;
        log('  !! ' + entry.id + ' — LOCKED but file missing: ' + entry.file);
      } else {
        const fmt = probeFormat(outPath);
        const vol = analyse(outPath, null);
        rec.sha256 = sha256(outPath);
        rec.bytes = fs.statSync(outPath).size;
        rec.duration = fmt.duration;
        rec.peakDb = vol.maxDb;
        rec.truePeakDb = truePeakDb(outPath);
        rec.locked = true;
        rec.notes = 'Approved starter asset. Never re-imported, never re-encoded.';
        skipped++;
        log('  == ' + entry.id.padEnd(12) + ' LOCKED (kept ' + entry.file + ', ' +
            rec.bytes + ' B, ' + (fmt.duration || '?') + 's, peak ' + vol.maxDb + ' dB)');
      }
      manifest.sounds[entry.id] = rec;
      continue;
    }

    if (VERIFY_ONLY) {
      if (fs.existsSync(outPath)) {
        const fmt = probeFormat(outPath);
        const vol = analyse(outPath, null);
        rec.sha256 = sha256(outPath);
        rec.bytes = fs.statSync(outPath).size;
        rec.duration = fmt.duration;
        rec.peakDb = vol.maxDb;
        rec.truePeakDb = truePeakDb(outPath);
        log('  -- ' + entry.id.padEnd(12) + ' verified (' + rec.bytes + ' B, peak ' + vol.maxDb + ' dB)');
      } else {
        rec.approvalStatus = 'MISSING';
        rec.notes = 'No audio file on disk.';
        failed++;
        log('  !! ' + entry.id.padEnd(12) + ' MISSING');
      }
      manifest.sounds[entry.id] = rec;
      continue;
    }

    const url = PHONICS_PROVIDER.rawBase + encodeURIComponent(entry.src);
    if (DRY_RUN) {
      log('  ?? ' + entry.id.padEnd(12) + ' would fetch ' + entry.src + ' -> ' + entry.file);
      manifest.sounds[entry.id] = rec;
      continue;
    }
    try {
      const raw = path.join(tmp, entry.id + '.src.mp3');
      const bytes = await download(url, raw);
      const staged = path.join(tmp, entry.id + '.out.mp3');
      const cond = condition(raw, staged);
      fs.copyFileSync(staged, outPath);

      const fmt = probeFormat(outPath);
      const vol = analyse(outPath, null);
      rec.sha256 = sha256(outPath);
      rec.bytes = fs.statSync(outPath).size;
      rec.duration = fmt.duration;
      rec.peakDb = vol.maxDb;
      rec.sourceBytes = bytes;
      rec.truePeakDb = cond.finalPeakDb;
      rec.notes = 'Imported from ' + entry.src + '; silence-trimmed and normalised ' +
                  (cond.gainDb >= 0 ? '+' : '') + cond.gainDb + ' dB over ' + cond.passes +
                  ' encode pass(es) so the encoded file peaks at ' + TARGET.peakDb +
                  ' dBFS, matching the starter six. Human approval required before child use.';
      imported++;
      log('  ++ ' + entry.id.padEnd(12) + ' ' + entry.src.padEnd(10) + ' -> ' + entry.file.padEnd(18) +
          rec.bytes + ' B, ' + (fmt.duration || '?') + 's, true peak ' +
          (cond.finalPeakDb === null ? '?' : cond.finalPeakDb.toFixed(2)) + ' dB, gain ' +
          cond.gainDb + ' dB, ' + cond.passes + ' pass(es)');
    } catch (e) {
      rec.approvalStatus = 'MISSING';
      rec.notes = 'Import failed: ' + e.message;
      failed++;
      log('  !! ' + entry.id.padEnd(12) + ' FAILED: ' + e.message);
    }
    manifest.sounds[entry.id] = rec;
  }

  /* Retire files that are no longer part of the catalogue (e.g. the old
     Wikimedia IPA-demo recordings). Moved, not deleted. */
  const retired = [];
  if (!DRY_RUN) {
    for (const f of fs.readdirSync(OUT_DIR)) {
      const p = path.join(OUT_DIR, f);
      if (fs.statSync(p).isDirectory()) continue;
      if (keptFiles.has(f)) continue;
      fs.mkdirSync(RETIRED_DIR, { recursive: true });
      fs.renameSync(p, path.join(RETIRED_DIR, f));
      retired.push(f);
    }
  }
  if (retired.length) {
    manifest._retired = {
      files: retired,
      movedTo: 'audio/phonemes/_retired/',
      reason: 'Not part of the current single-provider catalogue (previously ' +
              'sourced from Wikimedia IPA demonstration audio). Kept on disk for ' +
              'reference only; the app never loads this directory.'
    };
    log('\n  retired (moved to _retired/): ' + retired.join(', '));
  }

  manifest._summary = { total: PHONICS_CATALOG.length, imported, lockedKept: skipped, failed };
  if (!DRY_RUN) fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  log('\n  total ' + PHONICS_CATALOG.length + ' · imported ' + imported +
      ' · locked/kept ' + skipped + ' · failed ' + failed);
  log('  manifest: audio/phonemes/manifest.json');
  log('\n  NOTE: every imported sound is UNREVIEWED. Open Parent > Sound Library,');
  log('        listen to each one, and approve or reject. Nothing reaches Layla');
  log('        until a human approves it.');
  if (failed) process.exitCode = 1;
})();
