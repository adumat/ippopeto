'use strict';
const { test, expect } = require('@playwright/test');
const { roomName, watchErrors, board } = require('./fixtures.js');

test('boarding loads every fart clip and pushing plays without errors', async ({ page }) => {
  const errors = [];
  watchErrors(page, errors);
  const sounds = new Map();
  page.on('response', (r) => {
    if (r.url().includes('/sounds/')) sounds.set(r.url().split('/sounds/')[1], r.status());
  });
  await board(page, roomName('audio'), 'Pia');
  await expect.poll(() => sounds.size).toBe(17);
  expect([...sounds.values()].every((s) => s === 200)).toBe(true);
  await page.keyboard.down('Space');
  await page.waitForTimeout(1500);
  await page.keyboard.up('Space');
  await page.waitForTimeout(300);
  expect(errors).toEqual([]);
});
