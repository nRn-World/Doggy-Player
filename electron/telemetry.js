import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const NS = 'nRnDp7kQ2mX9pL4';
const API = 'https://abacus.jasoncameron.dev';
const DAYS = 30;
const PING_DELAY_MS = 12_000;
const FETCH_TIMEOUT_MS = 4000;
const GATE_USER = Buffer.from('QURNSU4=', 'base64').toString('utf8');
const GATE_PASS = Buffer.from('TklNREEx', 'base64').toString('utf8');

let statsWindow = null;
let statsAuthed = false;
let ipcRegistered = false;
let pingTimer = null;

function utcDay(offset = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

function statePath() {
  return path.join(app.getPath('userData'), 'instance.json');
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(statePath(), 'utf8'));
  } catch {
    return {};
  }
}

function writeState(state) {
  try {
    fs.writeFileSync(statePath(), JSON.stringify(state));
  } catch (_) {}
}

function isOwnerInstall() {
  return readState().owner === true;
}

function markOwnerInstall() {
  const state = readState();
  if (!state.id) state.id = crypto.randomUUID();
  state.owner = true;
  writeState(state);
}

function safeEqual(input, expected) {
  const left = Buffer.from(String(input ?? ''), 'utf8');
  const right = Buffer.from(String(expected ?? ''), 'utf8');
  if (left.length !== right.length) {
    crypto.timingSafeEqual(right, right);
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

function isStatsSender(event) {
  return !!statsWindow && !statsWindow.isDestroyed() && event.sender === statsWindow.webContents;
}

async function fetchJson(url) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ac.signal });
    const data = await res.json().catch(() => null);
    return data;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function countFrom(data) {
  if (!data || typeof data.value !== 'number') return 0;
  return data.value;
}

function cancelPendingPing() {
  if (pingTimer) {
    clearTimeout(pingTimer);
    pingTimer = null;
  }
}

export async function sendDailyPing() {
  if (!app.isPackaged) return;
  if (isOwnerInstall()) return;

  const today = utcDay(0);
  const state = readState();
  if (!state.id) state.id = crypto.randomUUID();
  if (state.lastPingDate === today) return;

  const data = await fetchJson(`${API}/hit/${NS}/d-${today}`);
  if (!data || typeof data.value !== 'number') return;

  state.lastPingDate = today;
  writeState(state);
}

async function loadDailyCounts() {
  const days = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    days.push(utcDay(-i));
  }

  const results = await Promise.all(
    days.map((date) => fetchJson(`${API}/get/${NS}/d-${date}`))
  );

  const rows = days.map((date, i) => ({
    date,
    count: countFrom(results[i]),
  }));

  const today = rows[rows.length - 1]?.count ?? 0;
  const yesterday = rows[rows.length - 2]?.count ?? 0;
  const last7 = rows.slice(-7).reduce((sum, row) => sum + row.count, 0);
  const last30 = rows.reduce((sum, row) => sum + row.count, 0);
  const offline = results.every((item) => item == null);

  return { ok: true, rows, today, yesterday, last7, last30, offline, generatedAt: new Date().toISOString() };
}

function openStatsWindow() {
  cancelPendingPing();

  if (statsWindow && !statsWindow.isDestroyed()) {
    statsWindow.show();
    statsWindow.focus();
    return;
  }

  statsAuthed = false;
  statsWindow = new BrowserWindow({
    width: 380,
    height: 300,
    resizable: false,
    minimizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../Logo Bilder/logoW-cropped-no-bg1024x1024.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  statsWindow.setMenuBarVisibility(false);
  statsWindow.loadFile(path.join(__dirname, 'usage-stats.html'));
  statsWindow.on('closed', () => {
    statsAuthed = false;
    statsWindow = null;
    if (!isOwnerInstall()) {
      sendDailyPing().catch(() => {});
    }
  });
}

function revealStatsWindow() {
  if (!statsWindow || statsWindow.isDestroyed()) return;
  statsWindow.setResizable(true);
  statsWindow.setMinimumSize(420, 560);
  statsWindow.setSize(520, 720, false);
  statsWindow.center();
}

export function initUsageTelemetry() {
  if (!ipcRegistered) {
    ipcRegistered = true;

    ipcMain.handle('creator-stats:login', (event, payload = {}) => {
      if (!isStatsSender(event)) return { ok: false };
      const name = String(payload.name ?? '').trim();
      const password = String(payload.password ?? '');
      if (!safeEqual(name, GATE_USER) || !safeEqual(password, GATE_PASS)) {
        return { ok: false };
      }
      statsAuthed = true;
      markOwnerInstall();
      cancelPendingPing();
      revealStatsWindow();
      return { ok: true };
    });

    ipcMain.handle('creator-stats:load', (event) => {
      if (!statsAuthed || !isStatsSender(event)) return { ok: false };
      return loadDailyCounts();
    });
  }

  globalShortcut.register('CommandOrControl+Alt+Shift+D', () => {
    openStatsWindow();
  });

  pingTimer = setTimeout(() => {
    pingTimer = null;
    sendDailyPing().catch(() => {});
  }, PING_DELAY_MS);
}

export function unregisterUsageTelemetry() {
  cancelPendingPing();
  try { globalShortcut.unregister('CommandOrControl+Alt+Shift+D'); } catch (_) {}
}
