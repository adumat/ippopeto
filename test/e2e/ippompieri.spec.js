'use strict';
const { test, expect } = require('@playwright/test');
const T = require('../../public/track.js').course('fiume');
const { WsBot } = require('../helpers/wsbot.js');
const { roomName, watchErrors, board } = require('./fixtures.js');

test('the Ippompieri switch restyles every screen in the room, and back', async ({ browser, baseURL }) => {
  const room = roomName('ippo');
  const errors = [];
  const anna = await (await browser.newContext()).newPage();
  watchErrors(anna, errors);
  await board(anna, room, 'Anna');
  await expect(anna).toHaveTitle('Ippopeto');
  await expect(anna.locator('#ippo')).toHaveAttribute('aria-pressed', 'false');

  await anna.click('#ippo');
  await expect(anna).toHaveTitle('Ippompieri');
  await expect(anna.locator('#ippo')).toHaveAttribute('aria-pressed', 'true');
  await expect(anna.locator('#ippo-notice')).toBeVisible();
  await anna.click('#ippo-ok');
  await expect(anna.locator('#ippo-notice')).toBeHidden();
  await expect(anna.locator('#lobby h2')).toHaveText('L’ammucchiata');
  await expect(anna.locator('#start')).toHaveText('Su gli idranti!');
  await expect(anna.locator('#lobby .ippo-title')).toBeVisible();

  // someone joining a room already in the mode gets the notice once
  const bruno = await (await browser.newContext()).newPage();
  watchErrors(bruno, errors);
  await board(bruno, room, 'Bruno');
  await expect(bruno).toHaveTitle('Ippompieri');
  await expect(bruno.locator('#ippo-notice')).toBeVisible();
  await bruno.click('#ippo-ok');

  // a race: checkpoints read as spintarelle and start the captain's spray
  const bot = await WsBot.join(baseURL, room, 'Carla');
  await anna.click('#start');
  await bot.waitFor((m) => m.t === 's' && m.st === 'running');
  await expect(anna.locator('#vm18')).toBeVisible();
  for (let i = 0; i < T.CHECKPOINTS.length; i++) {
    bot.teleport(T.CHECKPOINTS[i] + 20);
    // the spray starts in the same snapshot as its checkpoint
    await bot.waitFor((m) => m.t === 's' && m.ev.some((e) => e.k === 'cp' && e.i === i) && m.ev.some((e) => e.k === 'spray' && e.d === 3));
  }
  await expect(anna.locator('#toast')).toHaveText(`Spintarella ${T.CHECKPOINTS.length} di ${T.CHECKPOINTS.length}`);
  bot.teleport(T.FINISH_S + 20);
  await bot.waitFor((e) => e.k === 'finish');

  await expect(anna.locator('#results h2')).toHaveText('Siete venuti tutti.');
  await expect(anna.locator('#best-title')).toHaveText('Le sveltine migliori: Fiume');
  await expect(anna.locator('#final-stats')).toContainText('0 sorprese da dietro, 0 schizzi fuori programma');

  // switched off from the results card, everything reads as before
  await anna.click('#ippo-results');
  await expect(bruno).toHaveTitle('Ippopeto');
  await expect(bruno.locator('#results h2')).toHaveText('Arrivati');
  await expect(bruno.locator('#ippo-results')).toHaveAttribute('aria-pressed', 'false');

  bot.close();
  expect(errors).toEqual([]);
});
