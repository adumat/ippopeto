'use strict';
const { test, expect } = require('@playwright/test');
const { WsBot } = require('../helpers/wsbot.js');
const { roomName, board } = require('./fixtures.js');

const tok = (c) => c.repeat(32);

test('a spectator sits down once a seat frees up for good', async ({ page, baseURL }) => {
  const room = roomName('sit');
  const bots = [];
  for (const c of 'abcdef') bots.push(await WsBot.join(baseURL, room, `Bot ${c}`, { token: tok(c) }));
  await board(page, room, 'Lia');
  await expect(page.locator('#start')).toBeDisabled();
  await expect(page.locator('#sit')).toBeHidden();

  bots[1].close();
  // held for IPPO_RESERVE_MS (1.5 s in tests), then free
  await page.waitForTimeout(700);
  await expect(page.locator('#sit')).toBeHidden();
  await expect(page.locator('#sit')).toBeVisible({ timeout: 5000 });

  await page.click('#sit');
  await expect(page.locator('#start')).toBeEnabled();
  await expect(page.locator('#sit')).toBeHidden();
  await expect(page.locator('#crew li.me')).toHaveCount(1);
  for (const b of bots) b.close();
});

test('the solo hint shows only with one hippo on board', async ({ page, baseURL }) => {
  const room = roomName('solo');
  await board(page, room, 'Max');
  await expect(page.locator('#solo-hint')).toBeVisible();
  const bot = await WsBot.join(baseURL, room, 'Nora');
  await expect(page.locator('#solo-hint')).toBeHidden();
  bot.close();
});
