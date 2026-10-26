'use strict';
const { expect } = require('@playwright/test');

const roomName = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

// Collects page errors and console errors so a test can assert there were none.
function watchErrors(page, errors) {
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
}

// Records every snapshot and message the page's game socket receives.
function recordFrames(page) {
  const frames = [];
  page.on('websocket', (ws) => {
    ws.on('framereceived', ({ payload }) => {
      try {
        frames.push(JSON.parse(payload));
      } catch {
        // not JSON: ignore
      }
    });
  });
  return frames;
}

async function board(page, room, name) {
  await page.goto(`/?room=${room}&k=test`);
  await page.fill('#name', name);
  await page.click('#join-form button[type=submit]');
  await expect(page.locator('#lobby')).toBeVisible();
}

module.exports = { roomName, watchErrors, recordFrames, board };
