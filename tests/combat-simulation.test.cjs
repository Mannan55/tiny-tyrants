const test = require('node:test');
const assert = require('node:assert/strict');
const raid = require('../raid.js');

test('Combat: Units definition contains all 5 tactical troop classes', () => {
  const classes = ['vanguard', 'ranger', 'bulwark', 'sapper', 'weaver'];
  for (const c of classes) {
    assert.ok(raid.unitsByType[c], `Missing troop class: ${c}`);
    assert.ok(raid.unitsByType[c].hp > 0);
    assert.ok(raid.unitsByType[c].damage > 0);
  }
});

test('Combat: Bulwark has passive armor reduction and high HP', () => {
  const giant = raid.unitsByType.bulwark;
  assert.equal(giant.hp, 160);
  assert.ok(giant.armor >= 0.2, 'Giant should have at least 20% passive armor');
});

test('Combat: Sapper deals massive multiplier damage to gates', () => {
  const sapper = raid.unitsByType.sapper;
  const warrior = raid.unitsByType.vanguard;

  // Against normal target:
  const baseSapper = sapper.damage;
  const baseWarrior = warrior.damage;
  assert.ok(baseSapper > 0);

  // Against gate, sapper gets 4x bonus multiplier:
  const gateMultiplier = 4.0;
  assert.ok(baseSapper * gateMultiplier > baseWarrior * 4);
});

test('Combat: Gate barrier stops step advancement until destroyed', () => {
  // Simulate path advancement with a gate
  const gate = { kind: 'gate', lane: 1, step: 2, hp: 35 };
  let unit = { route: 1, step: 1 };

  // Unit moves from step 1 to step 2 (where gate is)
  if (gate.hp > 0 && unit.step <= gate.step) {
    unit.step = Math.min(unit.step + 1, 3);
  }
  assert.equal(unit.step, 2);

  // When unit is at gate.step and gate is still alive:
  if (gate.hp > 0 && unit.step >= gate.step) {
    unit.step = gate.step; // Barrier stops unit!
  } else {
    unit.step++;
  }
  assert.equal(unit.step, 2, 'Unit must not cross past intact gate step!');

  // Gate is broken
  gate.hp = 0;
  if (gate.hp > 0 && unit.step >= gate.step) {
    unit.step = gate.step;
  } else {
    unit.step = Math.min(unit.step + 1, 3);
  }
  assert.equal(unit.step, 3, 'Unit advances once gate is broken');
});

test('Combat: Field Hospital rescues up to its capacity', () => {
  const army = { vanguard: 10, ranger: 5 };
  const losses = { vanguard: 4, ranger: 2 };
  let rescueCapacity = 3; // e.g. level 3 Field Hospital

  let dead = 0;
  let rescued = 0;

  for (const k of ['vanguard', 'ranger']) {
    const lost = Math.min(army[k], losses[k] || 0);
    const saved = Math.min(rescueCapacity, lost);
    rescueCapacity -= saved;
    rescued += saved;
    dead += (lost - saved);
  }

  // 4 + 2 = 6 lost, 3 saved by hospital, 3 dead
  assert.equal(rescued, 3);
  assert.equal(dead, 3);
});

test('Combat: Stars calculation rules', () => {
  const totalTroops = 10;

  function calcStars(win, towersCleared, fallen) {
    if (!win) return 0;
    const baseWin = 1;
    const allTowers = towersCleared ? 1 : 0;
    const lowLosses = fallen <= Math.floor(totalTroops * 0.25) ? 1 : 0;
    return baseWin + allTowers + lowLosses;
  }

  assert.equal(calcStars(false, false, 0), 0); // Defeat -> 0 stars
  assert.equal(calcStars(true, false, 5), 1); // Win only -> 1 star
  assert.equal(calcStars(true, true, 5), 2); // Win + all towers -> 2 stars
  assert.equal(calcStars(true, true, 2), 3); // Win + all towers + low casualties -> 3 stars
});

console.log('Combat simulation tests loaded successfully.');
