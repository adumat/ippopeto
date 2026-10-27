'use strict';
const { test, expect } = require('@playwright/test');
const T = require('../../public/track.js').course('fiume');
const { WsBot } = require('../helpers/wsbot.js');
const { roomName, watchErrors, recordFrames, board } = require('./fixtures.js');

test('the lobby shows the map selector; only seated players can pick', async ({ browser, baseURL }) => {
  const room = roomName('maps');
  const errors = [];
  const page = await (await browser.newContext()).newPage();
  watchErrors(page, errors);
  const frames = recordFrames(page);
  await board(page, room, 'Anna');

  const current = page.locator('#maps .map[aria-pressed="true"]');
  await expect(current).toHaveText('Fiume');
  await expect(current).toBeEnabled();
  expect(await current.locator('img').evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect.poll(() => frames.filter((m) => m.t === 's').pop()?.mp).toBe('fiume');

  // a spectator arriving mid-race sees the selector on the results card, but cannot pick
  const bot = await WsBot.join(baseURL, room, 'Bruno');
  await page.click('#start');
  await bot.waitFor((m) => m.t === 's' && m.st === 'running');
  const spectator = await (await browser.newContext()).newPage();
  watchErrors(spectator, errors);
  await spectator.goto(`/?room=${room}&k=test`);
  await spectator.fill('#name', 'Carla');
  await spectator.click('#join-form button[type=submit]');
  for (let i = 0; i < T.CHECKPOINTS.length; i++) {
    bot.teleport(T.CHECKPOINTS[i] + 20);
    await bot.waitFor((e) => e.k === 'cp' && e.i === i);
  }
  bot.teleport(T.FINISH_S + 20);
  await bot.waitFor((e) => e.k === 'finish');

  await expect(page.locator('#best-title')).toHaveText('Migliori tempi: Fiume');
  await expect(page.locator('#maps-results .map[aria-pressed="true"]')).toBeEnabled();
  await expect(spectator.locator('#results')).toBeVisible();
  await expect(spectator.locator('#maps-results .map').first()).toBeDisabled();

  bot.close();
  expect(errors).toEqual([]);
});
