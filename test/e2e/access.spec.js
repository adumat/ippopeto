'use strict';
const { test, expect } = require('@playwright/test');
const { roomName } = require('./fixtures.js');

test('a wrong code shows the refusal card and stops retrying', async ({ page }) => {
  let sockets = 0;
  page.on('websocket', () => sockets++);
  await page.goto(`/?room=${roomName('access')}&k=wrong`);
  await expect(page.locator('#denied')).toBeVisible();
  await expect(page.locator('#denied-text')).toHaveText('Il codice nel link non è valido. Chiedi il link a chi ha organizzato.');
  await expect(page.locator('#splash')).toBeHidden();
  await page.waitForTimeout(3000);
  expect(sockets).toBe(1);
});

test('the right code reaches the lobby', async ({ page }) => {
  await page.goto(`/?room=${roomName('access')}&k=test`);
  await expect(page.locator('#denied')).toBeHidden();
  await page.fill('#name', 'Dora');
  await page.click('#join-form button[type=submit]');
  await expect(page.locator('#lobby')).toBeVisible();
});
