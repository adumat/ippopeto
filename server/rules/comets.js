'use strict';
// Comets cross the track at intervals and are solid.
module.exports = {
  collide(room) {
    if (room.air) return;
    for (const c of room.course.cometsAt(room.gt)) room.collideCircle(c.x, c.y, c.r);
  },
};
