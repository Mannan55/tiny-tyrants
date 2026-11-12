const test = require('node:test');
const assert = require('node:assert/strict');
const storage = require('../storage.js');

const structures = {
  hall: ['Town Hall', 1, 0],
  mine: ['Gold Mine', 1, 95],
  farm: ['Elixir Collector', 1, 90],
  barracks: ['Army Camp', 1, 120],
  tower: ['Field Hospital', 1, 100],
  cannon: ['Cannon', 1, 85],
  archery: ['Archer Tower', 2, 125],
  mortar: ['Mortar', 3, 170],
  forge: ['Workshop', 4, 210],
  arc: ['Tesla Tower', 5, 270],
  empty: ['Empty Plot', 1, 0]
};

const troops = {
  vanguard: ['Warrior', 1, 12],
  ranger: ['Archer', 1, 15],
  bulwark: ['Giant', 2, 23],
  sapper: ['Wall Breaker', 3, 22],
  weaver: ['Healer', 4, 29]
};

function sumLevel(state, type) {
  return state.buildings.reduce((n, b) => n + (b.type === type ? b.level : 0), 0);
}

function calcCapacity(state) {
  const campLevels = sumLevel(state, 'barracks');
  return campLevels ? 6 + campLevels * 4 : 0;
}

function calcRecruitCost(state, troopKey) {
  const forgeDiscount = sumLevel(state, 'forge') * 2;
  return Math.max(5, troops[troopKey][2] - forgeDiscount);
}

function produceResources(state, elapsedMs) {
  const ticks = Math.min(7200, Math.floor(Math.max(0, elapsedMs) / 5000));
  const goldEarned = sumLevel(state, 'mine') * ticks * 3;
  const grainEarned = sumLevel(state, 'farm') * ticks * 2;
  state.gold += goldEarned;
  state.grain += grainEarned;
  return { ticks, goldEarned, grainEarned };
}

function buildDurationMs(type, targetLevel) {
  const base = { hall: 25, mine: 7, farm: 7, barracks: 10, tower: 9, cannon: 8, archery: 11, mortar: 14, forge: 17, arc: 20 }[type] || 8;
  return Math.round(base * Math.pow(targetLevel, 1.45)) * 1000;
}

test('Economy: Resource generation scales with level and time', () => {
  const state = storage.createInitialState();
  state.buildings[1] = { type: 'mine', level: 2 };
  state.buildings[2] = { type: 'farm', level: 3 };

  // 1 minute = 60,000 ms = 12 ticks
  const result = produceResources(state, 60000);
  assert.equal(result.ticks, 12);
  // Mine lv 2 * 12 ticks * 3 = 72 gold
  assert.equal(result.goldEarned, 72);
  // Farm lv 3 * 12 ticks * 2 = 72 grain
  assert.equal(result.grainEarned, 72);
  assert.equal(state.gold, 350 + 72);
  assert.equal(state.grain, 60 + 72);
});

test('Economy: Offline production allows up to 10 hours', () => {
  const state = storage.createInitialState();
  state.buildings[1] = { type: 'mine', level: 1 };

  // 12 hours offline -> capped at 7200 ticks (10 hours)
  const result = produceResources(state, 12 * 3600 * 1000);
  assert.equal(result.ticks, 7200);
  assert.equal(result.goldEarned, 1 * 7200 * 3);
});

test('Economy: Negative time skew does not produce negative resources', () => {
  const state = storage.createInitialState();
  state.buildings[1] = { type: 'mine', level: 2 };
  const result = produceResources(state, -60000);
  assert.equal(result.ticks, 0);
  assert.equal(result.goldEarned, 0);
  assert.equal(state.gold, 350);
});

test('Army: Capacity requires built Army Camp', () => {
  const state = storage.createInitialState();
  assert.equal(calcCapacity(state), 0);

  state.buildings[3] = { type: 'barracks', level: 1 };
  // Base 6 + 1 * 4 = 10
  assert.equal(calcCapacity(state), 10);

  state.buildings[3].level = 3;
  // Base 6 + 3 * 4 = 18
  assert.equal(calcCapacity(state), 18);
});

test('Economy: Workshop reduces troop recruitment costs', () => {
  const state = storage.createInitialState();
  assert.equal(calcRecruitCost(state, 'vanguard'), 12);
  assert.equal(calcRecruitCost(state, 'ranger'), 15);

  state.buildings[4] = { type: 'forge', level: 2 };
  // Discount: 2 * 2 = 4
  assert.equal(calcRecruitCost(state, 'vanguard'), 8);
  assert.equal(calcRecruitCost(state, 'ranger'), 11);
});

test('Construction: Builder limit and duration formula', () => {
  const state = storage.createInitialState();
  const activeBuilders = state.buildings.filter(b => b.job).length;
  assert.equal(activeBuilders, 0);

  const dur1 = buildDurationMs('mine', 1);
  assert.equal(dur1, 7000); // 7s

  const dur2 = buildDurationMs('mine', 2);
  assert.ok(dur2 > dur1);
});

console.log('Economy and progression tests loaded successfully.');
