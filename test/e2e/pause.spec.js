'use strict';
const { test, expect } = require('@playwright/test');
const { WsBot } = require('../helpers/wsbot.js');
const { roomName, watchErrors, board } = require('./fixtures.js');

test('pause, let a spectator on, resume with the clock intact, then end the race', async ({ browser, baseURL }) => {
  const room = roomName('pause');
  const errors = [];
  const open = async (name) => {
    const page = await (await browser.newContext()).newPage();
    watchErrors(page, errors);
    await page.goto(`/?room=${room}&k=test`);
    await page.fill('#name', name);
    await page.click('#join-form button[type=submit]');
    return page;
  };
  const anna = await open('Anna');
  await expect(anna.locator('#lobby')).toBeVisible();
  const bot = await WsBot.join(baseURL, room, 'Bot');
  await anna.click('#start');
  await bot.waitFor((m) => m.t === 's' && m.st === 'running');
  await anna.waitForTimeout(1200);

  const bruno = await open('Bruno'); // arrives mid-race: a spectator
  await expect(bruno.locator('#pause')).toBeHidden();

  await anna.locator('body').press('KeyP');
  for (const p of [anna, bruno]) await expect(p.locator('#paused')).toBeVisible();
  await expect(anna.locator('#toast')).toHaveText('Anna ha messo in pausa');
  await expect(bruno.locator('#resume')).toBeDisabled();
  const frozen = await anna.locator('#timer').textContent();
  expect(frozen).not.toBe('0:00.0');

  await bruno.click('#sit-paused');
  await bot.waitFor((m) => m.t === 's' && m.s.filter(Boolean).length === 3);
  await expect(bruno.locator('#resume')).toBeEnabled();
  await expect(bruno.locator('#leave')).toBeVisible();

  await bruno.click('#resume');
  await bot.waitFor((m) => m.t === 's' && m.st === 'countdown');
  await expect(anna.locator('#paused')).toBeHidden();
  await expect(anna.locator('#timer')).toHaveText(frozen);
  await bot.waitFor((m) => m.t === 's' && m.st === 'running');

  await bruno.click('#pause');
  await expect(anna.locator('#paused')).toBeVisible();
  await anna.click('#stop');
  await bot.waitFor((m) => m.t === 's' && m.st === 'lobby');
  for (const p of [anna, bruno]) await expect(p.locator('#lobby')).toBeVisible();
  bot.close();
  expect(errors).toEqual([]);
});
