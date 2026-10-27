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

for (const m of require('../../public/track.js').maps().filter((x) => x.id !== 'fiume')) {
  test(`a pick in one browser changes the map for everyone, and ${m.name} races to the end`, async ({ browser, baseURL }) => {
    const room = roomName(m.id);
    const errors = [];
    const pages = [];
    for (const name of ['Anna', 'Bruno']) {
      const page = await (await browser.newContext()).newPage();
      watchErrors(page, errors);
      await board(page, room, name);
      pages.push(page);
    }
    await pages[0].locator('#maps .map', { hasText: m.name }).click();
    for (const page of pages) await expect(page.locator('#maps .map[aria-pressed="true"]')).toHaveText(m.name);

    const bot = await WsBot.join(baseURL, room, 'Carla');
    await pages[1].click('#start');
    const running = await bot.waitFor((s) => s.t === 's' && s.st === 'running' && s.mp === m.id);
    // a generated map races the layout of the seed the server picked
    const C = require('../../public/track.js').course(m.id, running.sd);
    for (let i = 0; i < C.CHECKPOINTS.length; i++) {
      bot.teleport(C.CHECKPOINTS[i] + 20);
      await bot.waitFor((e) => e.k === 'cp' && e.i === i);
    }
    bot.teleport(C.FINISH_S + 20);
    await bot.waitFor((e) => e.k === 'finish');
    const [, many] = Object.values(C.def.causes)[0];
    for (const page of pages) {
      await expect(page.locator('#best-title')).toHaveText(`Migliori tempi: ${m.name}`);
      await expect(page.locator('#final-stats')).toContainText(many);
    }
    bot.close();
    expect(errors).toEqual([]);
  });
}
