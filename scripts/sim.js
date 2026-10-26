const { Room } = require('../server/game.js');
const T = require('../public/track.js');
function run(nPlayers, smart){
const room = new Room('t'); room.flush = function(){ this.events.forEach(e=>{ if(e.k!=='bump') log.push(e.k + (e.i!==undefined?e.i:'') + '@' + this.time.toFixed(1)); }); this.events=[]; };
const log=[];
for (let i=0;i<nPlayers;i++){ const c={id:'c'+i, ws:{readyState:0}, seat:null}; room.addClient(c); room.join(c,'bot'+i); }
room.start();
let steps=0; let fartOn=true;
while (room.status!=='finished' && steps < 60*400){
  const R=room.raft; const c=T.closest(R.x,R.y); const tp=T.pointAt(c.s+300);
  let off=0; const obs=[...T.ROCKS,...T.barrelsAt(room.gt),...T.crocsAt(room.gt)];
  for (const o of obs){ const oc=T.closest(o.x,o.y); if (oc.s>c.s-50 && oc.s<c.s+550){ const lat=(o.x-oc.cx)*(-oc.ty)+(o.y-oc.cy)*(oc.tx); const left=(lat - o.r) - (-oc.hw); const right=oc.hw-(lat+o.r); off = right>left ? (lat+o.r+oc.hw)/2 : (lat-o.r-oc.hw)/2; break; } }
  const tgt={x:tp.x+tp.nx*off, y:tp.y+tp.ny*off};
  let dx=tgt.x-R.x, dy=tgt.y-R.y; const d=Math.hypot(dx,dy); dx/=d; dy/=d;
  // desired thrust dir in local frame
  const cos=Math.cos(-R.a), sin=Math.sin(-R.a);
  const lx=dx*cos-dy*sin, ly=dx*sin+dy*cos;
  const minGas = Math.min(...room.seats.filter(Boolean).map(s=>s.gas));
  if (smart){ if (minGas<5) fartOn=false; if (minGas>60) fartOn=true; } 
  room.seats.forEach(s=>{ if(!s) return; s.aim=Math.atan2(-ly,-lx); s.fartHeld = smart? fartOn : true; });
  room.step(1/60); steps++;
}
const s = T.closest(room.raft.x, room.raft.y).s;
console.log(`players=${nPlayers} smart=${smart} status=${room.status} t=${room.time.toFixed(1)} progress=${(100*s/T.LENGTH).toFixed(0)}% bites=${room.bites} sync=${(100*room.syncTime/room.time).toFixed(0)}%`);
console.log('  ', log.join(' '));
}
run(4,true); run(4,false); run(2,true); run(1,true);
