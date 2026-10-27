'use strict';
// Rules a map switches on by name in its module (`rules: [...]`). A rule exports any of:
//   force(room, dt)            extra forces on the vehicle, after thrust and current
//   collide(room)              contacts after the built-in obstacles
//   gas(room, seat)            { regen, shart } multipliers for one seat this step
//   onRespawn(room)            reset rule state when the vehicle is sent back or a run starts
//   snapshot(room)             extra snapshot fields, e.g. { ic: [...] }
const RULES = {
  jets: require('./jets.js'),
  intakes: require('./intakes.js'),
  methane: require('./methane.js'),
  sled: require('./sled.js'),
  slopes: require('./slopes.js'),
  snow: require('./snow.js'),
  'thin-ice': require('./thin-ice.js'),
  bears: require('./bears.js'),
};

function rulesFor(def) {
  return (def.rules || []).map((name) => {
    if (!RULES[name]) throw new Error(`map ${def.id}: unknown rule ${name}`);
    return RULES[name];
  });
}

module.exports = { RULES, rulesFor };
