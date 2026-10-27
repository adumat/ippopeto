'use strict';
const { test, expect } = require('@playwright/test');
const T = require('../../public/track.js').course('fiume');
const { WsBot } = require('../helpers/wsbot.js');
const { roomName, watchErrors, board } = require('./fixtures.js');

test('a crew races to the finish and goes again', async ({ browser, baseURL }) => {
  const room = roomName('race');
  const errors = [];
  const pages = [];
  for (const name of ['Anna', 'Bruno']) {
    const page = await (await browser.newContext()).newPage();
    watchErrors(page, errors);
    await board(page, room, name);
    pages.push(page);
  }
  const bot = await WsBot.join(baseURL, room, 'Carla');
  expect(bot.seat).toBe(2);

  await pages[0].click('#start');
  await bot.waitFor((m) => m.t === 's' && m.st === 'countdown');
  await bot.waitFor((m) => m.t === 's' && m.st === 'running');

  for (let i = 0; i < T.CHECKPOINTS.length; i++) {
    bot.teleport(T.CHECKPOINTS[i] + 20);
    await bot.waitFor((e) => e.k === 'cp' && e.i === i);
  }
  bot.teleport(T.FINISH_S + 20);
  await bot.waitFor((e) => e.k === 'finish');

  for (const page of pages) {
    await expect(page.locator('#results')).toBeVisible();
    await expect(page.locator('#final-time')).toHaveText(/^\d+:\d\d\.\d$/);
    await expect(page.locator('#final-stats')).toContainText('morsi di coccodrillo');
    await expect(page.locator('#final-stats')).toContainText(/\d+ pet[oi] vestit[oi]/);
    await expect(page.locator('#final-stats')).toContainText('% del tempo');
    await expect(page.locator('#best li')).toHaveCount(1);
    await expect(page.locator('#lobby')).toBeHidden();
  }

  await pages[1].click('#again');
  await bot.waitFor((m) => m.t === 's' && m.st === 'countdown');
  for (const page of pages) await expect(page.locator('#results')).toBeHidden();

  bot.close();
  expect(errors).toEqual([]);
});
