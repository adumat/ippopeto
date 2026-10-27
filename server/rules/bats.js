'use strict';
// Bat swarms cross the cave: solid, and a hit covers everyone's view for a moment.
module.exports = {
  collide(room) {
    for (const b of room.course.batsAt(room.gt)) {
      if (room.collideCircle(b.x, b.y, b.r) && !(room.gt - (room.batsAt || -9) < 2)) {
        room.batsAt = room.gt;
        room.events.push({ k: 'bats' });
      }
    }
  },
};
