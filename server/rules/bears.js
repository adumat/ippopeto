'use strict';
// Polar bears wait on the snow. When the sled approaches, a bear shows its charge line straight
// across the course for 1 s, then charges along it and disappears. A sled that keeps its speed
// is past the line by then; a slow or stuck one is caught: a bite.
const Track = require('../../public/track.js');

const RANGE = [-650, -300]; // course distance from the bear, relative, that wakes it

module.exports = {
  onRespawn(room) {
    room.bears = new Map();
  },
  collide(room) {
    if (!room.bears) room.bears = new Map();
    const R = room.raft, C = room.course;
    const s = C.closest(R.x, R.y).s;
    for (let i = 0; i < C.BEARS.length; i++) {
      const b = C.BEARS[i];
      const woke = room.bears.get(i);
      if (woke === undefined) {
        if (s - b.s >= RANGE[0] && s - b.s <= RANGE[1]) {
          const c = C.pointAt(b.s);
          room.bears.set(i, { t0: room.gt, tx: c.x, ty: c.y, line: C.bearLine(b, c.x, c.y) });
          room.events.push({ k: 'bear', b: i });
        }
        continue;
      }
      const p = C.bearAt(b, woke.line, room.gt - woke.t0);
      if (p && !p.warn && Math.hypot(p.x - R.x, p.y - R.y) < Track.RAFT_R + 30) {
        room.sendBack('bear', { k: 'bite' });
        return;
      }
    }
  },
  // bears that have woken up this pass: [index, room time it woke, where it aimed]
  snapshot(room) {
    if (!room.bears || !room.bears.size) return {};
    return { br: [...room.bears].map(([i, w]) => [i, Math.round(w.t0 * 1000) / 1000, Math.round(w.tx), Math.round(w.ty)]) };
  },
};
