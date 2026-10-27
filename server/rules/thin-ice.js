'use strict';
// Thin-ice tiles crack when the sled first touches them and break 1.5 s later. A sled over a
// broken tile falls in. Broken tiles refreeze when the sled is sent back or the race restarts.
const BREAK = 1.5;
const TOUCH = 40; // how far beyond a tile's edge the sled's centre still touches it

function tileHas(t, x, y, margin) {
  const dx = x - t.x, dy = y - t.y;
  const ca = Math.cos(t.a), sa = Math.sin(t.a);
  const along = dx * ca + dy * sa, across = -dx * sa + dy * ca;
  return Math.abs(along) <= t.len / 2 + margin && Math.abs(across) <= t.w / 2 + margin;
}

module.exports = {
  onRespawn(room) {
    room.ice = new Map();
  },
  collide(room) {
    if (!room.ice) room.ice = new Map();
    const R = room.raft, C = room.course;
    C.TILES.forEach((t, i) => {
      if (!room.ice.has(i) && tileHas(t, R.x, R.y, TOUCH)) room.ice.set(i, room.gt);
    });
    for (const [i, at] of room.ice) {
      if (room.gt - at >= BREAK && tileHas(C.TILES[i], R.x, R.y, 0)) {
        room.sendBack('water', { k: 'fall' });
        return;
      }
    }
  },
  // cracked (1) and broken (2) tiles, only while any exist
  snapshot(room) {
    if (!room.ice || !room.ice.size) return {};
    return { ic: [...room.ice].map(([i, at]) => [i, room.gt - at >= BREAK ? 2 : 1]) };
  },
};
