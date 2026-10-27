'use strict';
const { test, expect } = require('@playwright/test');
const T = require('../../public/track.js').course('fiume');
const { WsBot } = require('../helpers/wsbot.js');
const { roomName, board } = require('./fixtures.js');

async function finishRace(bot) {
  bot.send({ t: 'start' });
  await bot.waitFor((m) => m.t === 's' && m.st === 'running');
  for (let i = 0; i < T.CHECKPOINTS.length; i++) {
    bot.teleport(T.CHECKPOINTS[i] + 20);
    await bot.waitFor((e) => e.k === 'cp' && e.i === i);
  }
  bot.teleport(T.FINISH_S + 20);
  await bot.waitFor((e) => e.k === 'finish');
}

test('boarding a room whose race just finished shows the lobby, not the results', async ({ page, baseURL }) => {
  const room = roomName('late');
  const bot = await WsBot.join(baseURL, room, 'Gino');
  await finishRace(bot);
  await board(page, room, 'Ivo');
  await expect(page.locator('#results')).toBeHidden();
  await expect(page.locator('#start')).toBeEnabled();
  bot.close();
});
