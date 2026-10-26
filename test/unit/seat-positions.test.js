'use strict';
const test = require('node:test');
const assert = require('node:assert');
const T = require('../../public/track.js');

const near = (a, b, tol = 0.5) => Math.abs(a - b) <= tol;

test('four seats sit at the original corners', () => {
  const pts = T.seatPositions(4);
  for (const [cx, cy] of [[-36, -36], [36, -36], [-36, 36], [36, 36]]) {
    assert.ok(pts.some(([x, y]) => near(x, cx) && near(y, cy)), `no seat at (${cx}, ${cy}): ${JSON.stringify(pts)}`);
  }
});

test('two seats sit on the left and right sides', () => {
  const pts = T.seatPositions(2).map(([x, y]) => [Math.round(x), Math.round(y)]).sort((a, b) => a[0] - b[0]);
  assert.deepStrictEqual(pts, [[-51, 0], [51, 0]]);
});

test('every crew size is symmetric about the bow axis and fits on the raft', () => {
  for (let n = T.MIN_SEATS; n <= T.MAX_SEATS; n++) {
    const pts = T.seatPositions(n);
    assert.strictEqual(pts.length, n);
    for (const [x, y] of pts) {
      assert.ok(pts.some(([x2, y2]) => near(x2, -x) && near(y2, y)), `n=${n}: (${x}, ${y}) has no mirror`);
      assert.ok(Math.abs(x) <= T.RAFT_SIZE / 2 && Math.abs(y) <= T.RAFT_SIZE / 2, `n=${n}: seat off the raft`);
    }
  }
});
