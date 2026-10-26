'use strict';
const { test, expect } = require('@playwright/test');
const { WsBot } = require('../helpers/wsbot.js');
const { roomName, recordFrames, board } = require('./fixtures.js');

// Puts the page's game socket behind a switch: drop() cuts the live connection,
// and while blocked every reconnect attempt is refused.
async function socketSwitch(page) {
  const sw = { current: null, blocked: false };
  await page.routeWebSocket(/\/ws\?/, (ws) => {
    if (sw.blocked) {
      ws.close({ code: 1001 });
      return;
    }
    const server = ws.connectToServer();
    sw.current = { ws, server };
  });
  sw.drop = async () => {
    await sw.current.server.close();
    await sw.current.ws.close({ code: 1001 });
  };
  return sw;
}

test('a seated player who blips gets the same seat back', async ({ page, baseURL }) => {
  const room = roomName('blip');
  const sw = await socketSwitch(page);
  const frames = recordFrames(page);
  await board(page, room, 'Olga');
  const watcher = await WsBot.join(baseURL, room, 'Piero');

  await sw.drop();
  await watcher.waitFor((m) => m.t === 's' && m.s[0] && m.s[0][1] === 'Olga' && m.s[0][6] === 1);
  await watcher.waitFor((m) => m.t === 's' && m.s[0] && m.s[0][1] === 'Olga' && m.s[0][6] === 0);
  await expect.poll(() => frames.filter((m) => m.t === 'joined').map((j) => j.seat)).toEqual([0, 0]);
  watcher.close();
});

test('a seat whose player never returns is freed', async ({ page, baseURL }) => {
  const room = roomName('gone');
  const sw = await socketSwitch(page);
  await board(page, room, 'Quinto');
  const watcher = await WsBot.join(baseURL, room, 'Rita');
  sw.blocked = true;
  await sw.drop();
  await watcher.waitFor((m) => m.t === 's' && m.s[0] && m.s[0][6] === 1);
  await watcher.waitFor((m) => m.t === 's' && m.s[0] === null, 5000);
  watcher.close();
});

test('a spectator who blips stays a spectator', async ({ page, baseURL }) => {
  const room = roomName('spec');
  const bots = [];
  for (const c of 'efgh') bots.push(await WsBot.join(baseURL, room, `Bot ${c}`));
  const sw = await socketSwitch(page);
  const frames = recordFrames(page);
  await board(page, room, 'Sara');
  bots[0].close(); // no token: the seat frees at once
  await bots[1].waitFor((m) => m.t === 's' && m.s[0] === null);

  await sw.drop();
  await expect.poll(() => frames.filter((m) => m.t === 'hello').length, { timeout: 5000 }).toBe(2);
  await page.waitForTimeout(500);
  expect(frames.filter((m) => m.t === 'joined').map((j) => j.seat)).toEqual([null]);
  expect(bots[1].seats()[0]).toBeNull();
  for (const b of bots) b.close();
});
