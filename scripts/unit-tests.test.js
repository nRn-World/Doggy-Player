import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Helper functions extracted for testing
function parseXmlTvTime(value) {
  const match = value.trim().match(
    /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(?:\s*([+-])(\d{2})(\d{2}))?/
  );
  if (!match) return Number.NaN;
  const [, year, month, day, hour, minute, second, sign, offsetHour, offsetMinute] = match;
  const utc = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  if (!sign) return utc / 1000;
  const offsetMs = (Number(offsetHour) * 60 + Number(offsetMinute)) * 60_000;
  return (utc - (sign === '+' ? offsetMs : -offsetMs)) / 1000;
}

function utf8ToBase64(str) {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch {
    return '';
  }
}

function base64ToUtf8(str) {
  try {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

function formatTime(time) {
  if (isNaN(time) || !isFinite(time) || time < 0) return "00:00";
  const h = Math.floor(time / 3600);
  const m = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(time % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

function parseSRT(text) {
  const cues = [];
  const blocks = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split(/\n\s*\n/);
  const timeToSec = (t) => {
    if (!t) return Number.NaN;
    const [timePart, msPart] = t.trim().replace(',', '.').split('.');
    const parts = timePart.split(':').map(p => parseInt(p, 10));
    if (parts.some(p => Number.isNaN(p))) return Number.NaN;
    let secs = 0;
    if (parts.length === 3) {
      secs = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      secs = parts[0] * 60 + parts[1];
    } else {
      return Number.NaN;
    }
    const ms = msPart ? parseFloat('0.' + msPart) : 0;
    return secs + (Number.isNaN(ms) ? 0 : ms);
  };
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    const timeLine = lines.find(l => l.includes('-->'));
    if (!timeLine) continue;
    const [startStr, endStr] = timeLine.split('-->').map(s => s.trim().split(' ')[0]);
    const start = timeToSec(startStr);
    const end = timeToSec(endStr);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
    const cueText = lines.slice(lines.indexOf(timeLine) + 1).join('\n').replace(/<[^>]+>/g, '').trim();
    if (cueText) cues.push({ start, end, text: cueText });
  }
  return cues;
}

function parseVTT(text) {
  const cleaned = text.replace(/^WEBVTT.*\n?/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const timeToSec = (t) => {
    if (!t) return Number.NaN;
    const [timePart, msPart] = t.trim().replace(',', '.').split('.');
    const parts = timePart.split(':').map(p => parseInt(p, 10));
    if (parts.some(p => Number.isNaN(p))) return Number.NaN;
    let secs = 0;
    if (parts.length === 3) {
      secs = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      secs = parts[0] * 60 + parts[1];
    } else {
      return Number.NaN;
    }
    const ms = msPart ? parseFloat('0.' + msPart) : 0;
    return secs + (Number.isNaN(ms) ? 0 : ms);
  };
  const cues = [];
  const blocks = cleaned.trim().split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    const timeLine = lines.find(l => l.includes('-->'));
    if (!timeLine) continue;
    const [startStr, endStr] = timeLine.split('-->').map(s => s.trim().split(' ')[0]);
    const start = timeToSec(startStr);
    const end = timeToSec(endStr);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
    const cueText = lines.slice(lines.indexOf(timeLine) + 1).join('\n').replace(/<[^>]+>/g, '').trim();
    if (cueText) cues.push({ start, end, text: cueText });
  }
  return cues;
}

function parseASS(text) {
  const cues = [];
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const toSec = (t) => {
    if (!t) return Number.NaN;
    const [timePart, csPart] = t.trim().split('.');
    const parts = timePart.split(':').map(p => parseInt(p, 10));
    if (parts.some(p => Number.isNaN(p))) return Number.NaN;
    let secs = 0;
    if (parts.length === 3) {
      secs = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      secs = parts[0] * 60 + parts[1];
    } else {
      return Number.NaN;
    }
    const cs = csPart ? parseInt(csPart, 10) / (csPart.length === 3 ? 1000 : 100) : 0;
    return secs + (Number.isNaN(cs) ? 0 : cs);
  };
  let formatLine = [];
  for (const line of lines) {
    if (line.startsWith('Format:') && line.toLowerCase().includes('start')) {
      formatLine = line.replace('Format:', '').split(',').map(s => s.trim().toLowerCase());
    }
    if (line.startsWith('Dialogue:')) {
      const parts = line.replace('Dialogue:', '').split(',');
      const startIdx = formatLine.indexOf('start');
      const endIdx = formatLine.indexOf('end');
      const textIdx = formatLine.indexOf('text');
      const sIdx = startIdx >= 0 ? startIdx : 1;
      const eIdx = endIdx >= 0 ? endIdx : 2;
      const tIdx = textIdx >= 0 ? textIdx : 9;
      if (parts.length <= Math.max(sIdx, eIdx)) continue;
      const start = toSec(parts[sIdx]?.trim());
      const end = toSec(parts[eIdx]?.trim());
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
      const rawText = parts.slice(tIdx).join(',')
        .replace(/\{[^}]+\}/g, '').replace(/\\N/gi, '\n').replace(/\\n/g, '\n').trim();
      if (rawText) cues.push({ start, end, text: rawText });
    }
  }
  return cues;
}

function parseSUB(text) {
  const cues = [];
  let fps = 23.976;
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  for (const line of lines) {
    const fpsMatch = line.match(/^\{1\}\{1\}([\d.]+)/);
    if (fpsMatch) {
      const parsedFps = parseFloat(fpsMatch[1]);
      if (Number.isFinite(parsedFps) && parsedFps > 0) fps = parsedFps;
      continue;
    }
    const match = line.match(/^\{(\d+)\}\{(\d+)\}(.+)/);
    if (!match) continue;
    const startFrame = parseInt(match[1], 10);
    const endFrame = parseInt(match[2], 10);
    if (Number.isNaN(startFrame) || Number.isNaN(endFrame)) continue;
    const start = startFrame / fps;
    const end = endFrame / fps;
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
    const cueText = match[3].replace(/\|/g, '\n').replace(/\{[^}]+\}/g, '').trim();
    if (cueText) cues.push({ start, end, text: cueText });
  }
  return cues;
}

function parseSMI(text) {
  const cues = [];
  const syncMatches = [...text.matchAll(/<SYNC[^>]+Start=["']?(\d+)["']?[^>]*>([\s\S]*?)(?=<SYNC|<\/BODY|$)/gi)];
  for (let i = 0; i < syncMatches.length; i++) {
    const startMs = parseInt(syncMatches[i][1], 10);
    if (Number.isNaN(startMs)) continue;
    const start = startMs / 1000;
    let end = start + 3;
    if (i + 1 < syncMatches.length) {
      const nextMs = parseInt(syncMatches[i + 1][1], 10);
      if (Number.isFinite(nextMs)) end = nextMs / 1000;
    }
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
    const raw = syncMatches[i][2].replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').trim();
    if (raw && raw !== '&nbsp;') cues.push({ start, end, text: raw });
  }
  return cues;
}

describe('Doggy Player Utility Tests', () => {
  test('parseXmlTvTime handles standard and offset formats', () => {
    assert.strictEqual(parseXmlTvTime('20260330120000 +0000'), 1774872000);
    assert.ok(Number.isNaN(parseXmlTvTime('invalid-time')));
  });

  test('utf8ToBase64 and base64ToUtf8 handle Unicode strings correctly', () => {
    const sample = 'Doggy Player 🐶 - 日本語 & ÅÄÖ';
    const encoded = utf8ToBase64(sample);
    const decoded = base64ToUtf8(encoded);
    assert.strictEqual(decoded, sample);
  });

  test('formatTime formats seconds into hh:mm:ss or mm:ss', () => {
    assert.strictEqual(formatTime(0), '00:00');
    assert.strictEqual(formatTime(65), '01:05');
    assert.strictEqual(formatTime(3665), '1:01:05');
    assert.strictEqual(formatTime(NaN), '00:00');
  });

  test('parseSRT parses valid cues and ignores malformed ones', () => {
    const srt = `1
00:00:01,000 --> 00:00:04,500
Hello World

2
invalid --> time
Bad cue

3
00:00:05,000 --> 00:00:08,000
Second cue`;

    const cues = parseSRT(srt);
    assert.strictEqual(cues.length, 2);
    assert.strictEqual(cues[0].start, 1.0);
    assert.strictEqual(cues[0].end, 4.5);
    assert.strictEqual(cues[0].text, 'Hello World');
    assert.strictEqual(cues[1].start, 5.0);
    assert.strictEqual(cues[1].end, 8.0);
  });

  test('parseVTT parses WebVTT cues with settings', () => {
    const vtt = `WEBVTT

00:01.000 --> 00:04.000 line:0% position:50%
First cue

00:05.000 --> 00:08.000
Second cue`;

    const cues = parseVTT(vtt);
    assert.strictEqual(cues.length, 2);
    assert.strictEqual(cues[0].start, 1.0);
    assert.strictEqual(cues[0].end, 4.0);
    assert.strictEqual(cues[0].text, 'First cue');
  });

  test('parseASS parses SSA/ASS Dialogue events', () => {
    const ass = `[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.50,0:00:03.00,Default,,0,0,0,,Hello {\\b1}World{\\b0}`;

    const cues = parseASS(ass);
    assert.strictEqual(cues.length, 1);
    assert.strictEqual(cues[0].start, 1.5);
    assert.strictEqual(cues[0].end, 3.0);
    assert.strictEqual(cues[0].text, 'Hello World');
  });

  test('parseSUB parses MicroDVD frame subtitles', () => {
    const sub = `{1}{1}25.0
{25}{100}Hello Subtitle`;

    const cues = parseSUB(sub);
    assert.strictEqual(cues.length, 1);
    assert.strictEqual(cues[0].start, 1.0);
    assert.strictEqual(cues[0].end, 4.0);
    assert.strictEqual(cues[0].text, 'Hello Subtitle');
  });

  test('parseSMI parses SAMI sync tags', () => {
    const smi = `<SAMI>
<BODY>
<SYNC Start=1000><P Class=SV>First
<SYNC Start=4000><P Class=SV>Second
</BODY>
</SAMI>`;

    const cues = parseSMI(smi);
    assert.strictEqual(cues.length, 2);
    assert.strictEqual(cues[0].start, 1.0);
    assert.strictEqual(cues[0].end, 4.0);
    assert.strictEqual(cues[0].text, 'First');
  });
});
