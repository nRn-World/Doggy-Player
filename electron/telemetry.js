import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Unguessable counter namespace — not linked from the UI. */
const NS = 'nRnDp7kQ2mX9pL4';
const API = 'https://abacus.jasoncameron.dev';
const DAYS = 30;
const PING_DELAY_MS = 12_000;
const FETCH_TIMEOUT_MS = 4000;

let statsWindow = null;
let ipcRegistered = false;

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

export async function sendDailyPing() {
  if (!app.isPackaged) return;

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

  return { rows, today, yesterday, last7, last30, offline, generatedAt: new Date().toISOString() };
}

function openStatsWindow() {
  if (statsWindow && !statsWindow.isDestroyed()) {
    statsWindow.show();
    statsWindow.focus();
    return;
  }

  statsWindow = new BrowserWindow({
    width: 520,
    height: 720,
    minWidth: 420,
    minHeight: 560,
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
    statsWindow = null;
  });
}

export function initUsageTelemetry() {
  if (!ipcRegistered) {
    ipcRegistered = true;
    ipcMain.handle('creator-stats:load', () => loadDailyCounts());
  }

  globalShortcut.register('CommandOrControl+Alt+Shift+D', () => {
    openStatsWindow();
  });

  setTimeout(() => {
    sendDailyPing().catch(() => {});
  }, PING_DELAY_MS);
}

export function unregisterUsageTelemetry() {
  try { globalShortcut.unregister('CommandOrControl+Alt+Shift+D'); } catch (_) {}
}
