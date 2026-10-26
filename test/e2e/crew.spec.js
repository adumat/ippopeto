'use strict';
const { test, expect } = require('@playwright/test');
const { WsBot } = require('../helpers/wsbot.js');
const { roomName, board } = require('./fixtures.js');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test('six aboard fit six seat cards on a phone', async ({ page, baseURL }) => {
  const room = roomName('crew');
  await board(page, room, 'Ugo');
  const bots = [];
  for (const n of ['Vera', 'Walter', 'Xena', 'Yuri', 'Zoe']) bots.push(await WsBot.join(baseURL, room, n));
  await expect(page.locator('#seats .seat')).toHaveCount(6);
  for (const box of await Promise.all((await page.locator('#seats .seat').all()).map((l) => l.boundingBox()))) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
  }
  await expect(page.locator('#crew li.empty')).toHaveCount(0);
  bots[0].close();
  await expect(page.locator('#seats .seat')).toHaveCount(5);
  for (const b of bots) b.close();
});
