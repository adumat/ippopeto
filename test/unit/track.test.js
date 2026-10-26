'use strict';
const test = require('node:test');
const assert = require('node:assert');
const T = require('../../public/track.js');

const MIN_GAP = 2 * T.RAFT_R + 20;
const CLUSTER_S = 150;

test('closest() maps every centre-line point back onto itself', () => {
  for (let s = 0; s <= T.LENGTH; s += 10) {
    const p = T.pointAt(s);
    const c = T.closest(p.x, p.y);
    assert.ok(Math.abs(c.s - s) <= 1, `centre line ambiguous at s=${s.toFixed(0)}: closest() returned ${c.s.toFixed(0)}`);
  }
});

function solidsAt(t) {
  const label = (kind) => (o, i) => ({ ...o, name: `${kind} #${i}` });
  return [...T.ROCKS.map(label('rock')), ...T.barrelsAt(t).map(label('barrel')), ...T.crocsAt(t).map(label('crocodile'))].map((o) => {
    const c = T.closest(o.x, o.y);
    const lat = (o.x - c.cx) * -c.ty + (o.y - c.cy) * c.tx;
    return { name: o.name, s: c.s, lo: lat - o.r, hi: lat + o.r };
  });
}

// Obstacles close together along the course block the river as one.
function clusters(obs) {
  const sorted = [...obs].sort((a, b) => a.s - b.s);
  const out = [];
  for (const o of sorted) {
    const last = out[out.length - 1];
    if (last && o.s - last[last.length - 1].s < CLUSTER_S) last.push(o);
    else out.push([o]);
  }
  return out;
}

function widestGap(cluster) {
  const sMin = cluster[0].s - CLUSTER_S / 2, sMax = cluster[cluster.length - 1].s + CLUSTER_S / 2;
  let hw = Infinity;
  for (let s = sMin; s <= sMax; s += 10) hw = Math.min(hw, T.pointAt(s).hw);
  const blocked = cluster.map((o) => [o.lo, o.hi]).sort((a, b) => a[0] - b[0]);
  let cursor = -hw, best = 0;
  for (const [lo, hi] of blocked) {
    best = Math.max(best, lo - cursor);
    cursor = Math.max(cursor, hi);
  }
  return Math.max(best, hw - cursor);
}

test(`every solid obstacle leaves a gap of at least ${MIN_GAP} px`, () => {
  for (let t = 0; t <= 20; t += 0.05) {
    for (const cluster of clusters(solidsAt(t))) {
      const gap = widestGap(cluster);
      assert.ok(gap >= MIN_GAP, `${cluster.map((o) => o.name).join(' + ')}: widest gap ${gap.toFixed(0)} px at t=${t.toFixed(2)}s`);
    }
  }
});
