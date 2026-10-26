'use strict';
const { test, expect } = require('@playwright/test');
const { roomName, recordFrames, board } = require('./fixtures.js');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

function mySeat(frames) {
  const id = frames.find((m) => m.t === 'hello').id;
  return frames.filter((m) => m.t === 's').map((m) => m.s.find((s) => s && s[0] === id)).filter(Boolean);
}

async function hold(page, key, ms) {
  const button = page.locator(`#touch button[data-k=${key}]`);
  await button.dispatchEvent('pointerdown');
  await page.waitForTimeout(ms);
  await button.dispatchEvent('pointerup');
  await page.waitForTimeout(200);
}

test('touch buttons steer and push', async ({ page }) => {
  const frames = recordFrames(page);
  await board(page, roomName('touch'), 'Elio');
  await expect(page.locator('#touch')).toBeVisible();

  const aim = () => mySeat(frames).at(-1)[2];
  const start = aim();
  await hold(page, 'right', 400);
  const afterRight = aim();
  expect(afterRight).toBeGreaterThan(start + 0.5);
  await hold(page, 'left', 400);
  expect(aim()).toBeLessThan(afterRight - 0.5);

  const before = mySeat(frames).length;
  await hold(page, 'fart', 500);
  expect(mySeat(frames).slice(before).some((s) => s[4] === 1)).toBe(true);
});

test('the lobby does not cover the audio button', async ({ page }) => {
  await board(page, roomName('touch'), 'Fede');
  const lobby = await page.locator('#lobby').boundingBox();
  const mute = await page.locator('#mute').boundingBox();
  const overlap =
    lobby.x < mute.x + mute.width && mute.x < lobby.x + lobby.width && lobby.y < mute.y + mute.height && mute.y < lobby.y + lobby.height;
  expect(overlap).toBe(false);
});
