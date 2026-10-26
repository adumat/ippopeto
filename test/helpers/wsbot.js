'use strict';
const WebSocket = require('ws');

// A seated player driven from Node: lets e2e tests start races and teleport the raft
// without touching the browser client.
class WsBot {
  constructor(ws) {
    this.ws = ws;
    this.messages = [];
    this.waiters = [];
    ws.on('message', (data) => {
      const m = JSON.parse(data);
      this.messages.push(m);
      this.waiters = this.waiters.filter((w) => !w(m));
    });
  }

  static async join(baseURL, room, name = 'Bot', { k = 'test', token } = {}) {
    const url = new URL(baseURL);
    const ws = new WebSocket(`ws://${url.host}/ws?room=${room}&k=${k}`);
    const bot = new WsBot(ws);
    await new Promise((resolve, reject) => {
      ws.once('open', resolve);
      ws.once('error', reject);
    });
    bot.send({ t: 'join', name, token });
    const joined = await bot.waitFor((m) => m.t === 'joined');
    bot.seat = joined.seat;
    return bot;
  }

  send(msg) {
    this.ws.send(JSON.stringify(msg));
  }

  // Resolves with the first message (or event inside a snapshot) matching pred.
  waitFor(pred, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`WsBot: timed out after ${timeout} ms`)), timeout);
      this.waiters.push((m) => {
        const hit = pred(m) ? m : m.t === 's' ? m.ev.find(pred) : undefined;
        if (!hit) return false;
        clearTimeout(timer);
        resolve(hit);
        return true;
      });
    });
  }

  // Latest snapshot's seat list.
  seats() {
    const last = [...this.messages].reverse().find((m) => m.t === 's');
    return last ? last.s : [];
  }

  teleport(s) {
    this.send({ t: 'debug', op: 'teleport', s });
  }

  close() {
    this.ws.close();
  }
}

module.exports = { WsBot };
