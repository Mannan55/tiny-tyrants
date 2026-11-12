const test = require('node:test');
const assert = require('node:assert/strict');
const storage = require('../storage.js');

test('Storage: createInitialState produces valid v1.2 schema', () => {
  const state = storage.createInitialState();
  assert.equal(state.schemaVersion, 2);
  assert.equal(state.gold, 350);
  assert.equal(state.grain, 60);
  assert.equal(state.stage, 1);
  assert.equal(state.wave, 1);
  assert.equal(state.buildings.length, 12);
  assert.equal(state.buildings[0].type, 'hall');
  assert.equal(state.buildings[0].level, 1);
  assert.equal(state.buildings.filter(b => b.type === 'empty').length, 11);
  const validated = storage.validateState(state);
  assert.equal(validated.valid, true);
  assert.equal(validated.errors.length, 0);
});

test('Storage: backward-compatible migration from v1.0 save (single troops count)', () => {
  const legacyV10 = {
    gold: 500,
    grain: 120,
    troops: 5,
    buildings: [
      { type: 'hall', level: 2 },
      { type: 'mine', level: 1 },
      { type: 'farm', level: 1 },
      { type: 'barracks', level: 1 },
      { type: 'cannon', level: 1 },
      { type: 'empty', level: 0 },
      { type: 'empty', level: 0 },
      { type: 'empty', level: 0 }
    ]
  };
  const { valid, state } = storage.validateState(legacyV10);
  assert.equal(valid, true);
  assert.equal(state.gold, 500);
  assert.equal(state.grain, 120);
  // troops: 5 -> vanguard: 3, ranger: 2
  assert.equal(state.army.vanguard, 3);
  assert.equal(state.army.ranger, 2);
  assert.equal(state.buildings.length, 12);
  assert.equal(state.buildings[0].level, 2);
  assert.equal(state.schemaVersion, 2);
});

test('Storage: backward-compatible migration from v1.1 save with playthrough', () => {
  const legacyV11 = {
    gold: 1400,
    grain: 800,
    stage: 4,
    wave: 5,
    stars: { 1: 3, 2: 2, 3: 1 },
    army: { vanguard: 10, ranger: 6, bulwark: 2, sapper: 1, weaver: 1 },
    buildings: [
      { type: 'hall', level: 3 },
      { type: 'mine', level: 4, job: { level: 5, started: 1000, finish: 50000 } },
      { type: 'farm', level: 3 },
      { type: 'barracks', level: 3 },
      { type: 'cannon', level: 3 },
      { type: 'archery', level: 2 },
      { type: 'mortar', level: 1 },
      { type: 'tower', level: 2 },
      { type: 'empty', level: 0 },
      { type: 'empty', level: 0 },
      { type: 'empty', level: 0 },
      { type: 'empty', level: 0 }
    ],
    playthrough: {
      playerName: 'Commander Leo',
      startedAt: 1600000000000,
      completedAt: null,
      resultShown: false
    }
  };
  const { valid, state } = storage.validateState(legacyV11);
  assert.equal(valid, true);
  assert.equal(state.gold, 1400);
  assert.equal(state.stars[1], 3);
  assert.equal(state.stars[2], 2);
  assert.equal(state.buildings[1].job.level, 5);
  assert.equal(state.playthrough.playerName, 'Commander Leo');
  assert.equal(state.playthrough.completedAt, null);
  assert.equal(state.schemaVersion, 2);
});

test('Storage: sanitizes corrupted or malicious data', () => {
  const corrupted = {
    gold: -9999,
    grain: 'not-a-number',
    stage: 999,
    wave: -5,
    stars: { 1: 50, 'bad': 2 },
    buildings: 'not-an-array',
    playthrough: {
      playerName: '<script>alert("hack")</script>',
      startedAt: 'invalid'
    }
  };
  const { valid, state } = storage.validateState(corrupted);
  assert.equal(valid, true);
  assert.equal(state.gold, 0); // clamped to min 0
  assert.equal(state.grain, 60); // fallback 60
  assert.equal(state.stage, 15); // clamped to max 15
  assert.equal(state.wave, 1); // clamped to min 1
  assert.equal(state.buildings.length, 12);
  assert.equal(state.buildings[0].type, 'hall');
  // XSS name should be rejected and playthrough cleared
  assert.equal(state.playthrough, undefined);
});

test('Storage: export and import round-trip', () => {
  const original = storage.createInitialState();
  original.gold = 7777;
  original.grain = 4444;
  original.playthrough = {
    playerName: 'Empress Maya',
    startedAt: 1234567,
    completedAt: 7654321,
    resultShown: true
  };

  const jsonExport = storage.exportSaveJson(original);
  assert.ok(jsonExport.includes('Tiny Tyrants'));
  assert.ok(jsonExport.includes('Empress Maya'));

  const importResult = storage.importSaveJson(jsonExport);
  assert.equal(importResult.success, true);
  assert.equal(importResult.state.gold, 7777);
  assert.equal(importResult.state.grain, 4444);
  assert.equal(importResult.state.playthrough.playerName, 'Empress Maya');
  assert.equal(importResult.state.playthrough.completedAt, 7654321);
});

test('Storage: rejects invalid JSON import', () => {
  const result = storage.importSaveJson('this is not json');
  assert.equal(result.success, false);
  assert.ok(result.error.includes('Malformed JSON'));
});

console.log('Save reliability tests loaded successfully.');
