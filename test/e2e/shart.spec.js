'use strict';
const { test, expect } = require('@playwright/test');
const { WsBot } = require('../helpers/wsbot.js');
const { roomName, watchErrors, recordFrames, board } = require('./fixtures.js');

test('a peto vestito is announced to everyone, naming the culprit', async ({ browser, baseURL }) => {
  const room = roomName('shart');
  const errors = [];
  const pages = [], frames = [];
  for (const name of ['Anna', 'Bruno']) {
    const page = await (await browser.newContext()).newPage();
    watchErrors(page, errors);
    frames.push(recordFrames(page));
    await board(page, room, name);
    pages.push(page);
  }
  const bot = await WsBot.join(baseURL, room, 'Carla');
  await bot.waitFor((m) => m.t === 's' && m.s.some((x) => x && x[1] === 'Anna'));
  const anna = bot.seats().findIndex((x) => x && x[1] === 'Anna');
  bot.send({ t: 'debug', op: 'shart', seat: anna });
  for (let i = 0; i < pages.length; i++) {
    await expect(pages[i].locator('#toast')).toHaveText('Anna se l’è fatta addosso');
    await expect.poll(() => frames[i].some((m) => m.t === 's' && m.ev.some((e) => e.k === 'shart' && e.i === anna))).toBe(true);
  }
  bot.close();
  expect(errors).toEqual([]);
});
