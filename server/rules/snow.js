'use strict';
// A sled that reaches the snow is stuck: pushes do nothing. Three strokes of the whole crew
// within 5 s (everyone pushing, then everyone letting go) drag it back onto the ice.
const Track = require('../../public/track.js');

const EDGE = 40; // the sled is caught once its centre is this close to the edge of the ice
const STROKES = 3;
const WINDOW = 5;

function reset(room) {
  room.snow = { stuck: false, strokes: 0, first: 0, pushing: false };
}

module.exports = {
  onRespawn: reset,
  force(room) {
    if (!room.snow) reset(room);
    const st = room.snow, R = room.raft, C = room.course;
    if (!st.stuck) {
      const c = C.closest(R.x, R.y);
      if (c.dist <= c.hw - EDGE) return;
      // stuck where it stands; the way out is back towards the middle of the ice
      const side = Math.sign((R.x - c.cx) * -c.ty + (R.y - c.cy) * c.tx) || 1;
      const lat = side * (c.hw - Track.RAFT_R - 20);
      Object.assign(st, {
        stuck: true, strokes: 0, first: 0, pushing: false,
        x: R.x, y: R.y, a: R.a,
        fromX: R.x, fromY: R.y,
        toX: c.cx + -c.ty * lat, toY: c.cy + c.tx * lat,
      });
      room.events.push({ k: 'stuck' });
    }
    Object.assign(R, { x: st.x, y: st.y, a: st.a, vx: 0, vy: 0, w: 0 });

    const present = room.seats.filter((s) => s && !s.away);
    if (!present.length) return;
    if (present.every((s) => s.farting)) st.pushing = true;
    else if (st.pushing && present.every((s) => !s.farting)) {
      st.pushing = false;
      if (st.strokes === 0 || room.gt - st.first > WINDOW) {
        st.strokes = 0;
        st.first = room.gt;
      }
      st.strokes++;
      const f = st.strokes / STROKES;
      st.x = st.fromX + (st.toX - st.fromX) * f;
      st.y = st.fromY + (st.toY - st.fromY) * f;
      Object.assign(R, { x: st.x, y: st.y });
      room.events.push({ k: 'stroke', n: st.strokes });
      if (st.strokes >= STROKES) {
        // dragged back onto the ice, the sled faces down the course again
        const c = C.closest(st.x, st.y);
        R.a = Math.atan2(c.tx, -c.ty);
        st.stuck = false;
        room.events.push({ k: 'free' });
      }
    }
  },
};
