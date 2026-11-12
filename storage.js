/* Tiny Tyrants Storage & Reliability Engine (v1.2)
   Provides schema validation, backward-compatible migrations from v1.0/v1.1,
   rolling backups, crash/corruption recovery, and JSON export/import. */
(() => {
  'use strict';

  const SAVE_KEY = 'tiny-tyrants-v1';
  const BACKUP_KEY = 'tiny-tyrants-v1:backup';
  const ARCHIVE_KEY = 'tiny-tyrants-v1:previous-village';
  const CORRUPTED_PREFIX = 'tiny-tyrants-v1:corrupted-';
  const SCHEMA_VERSION = 2;

  const KNOWN_STRUCTURES = new Set([
    'hall', 'mine', 'farm', 'barracks', 'tower',
    'cannon', 'archery', 'mortar', 'forge', 'arc', 'empty'
  ]);

  const KNOWN_TROOPS = ['vanguard', 'ranger', 'bulwark', 'sapper', 'weaver'];

  function createInitialState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      gold: 350,
      grain: 60,
      stage: 1,
      wave: 1,
      stars: {},
      last: Date.now(),
      lastConstructionFinishedAt: 0,
      sound: false,
      army: { vanguard: 0, ranger: 0, bulwark: 0, sapper: 0, weaver: 0 },
      buildings: Array.from({ length: 12 }, (_, i) => ({
        type: i === 0 ? 'hall' : 'empty',
        level: i === 0 ? 1 : 0
      })),
      research: { vanguard: 0, ranger: 0, bulwark: 0, sapper: 0, weaver: 0 },
      claims: {}
    };
  }

  function sanitizeInt(value, fallback = 0, min = 0, max = Infinity) {
    const num = Math.floor(Number(value));
    if (!Number.isFinite(num) || Number.isNaN(num)) return fallback;
    return Math.max(min, Math.min(max, num));
  }

  function validateBuilding(b, index) {
    if (!b || typeof b !== 'object') {
      return { type: index === 0 ? 'hall' : 'empty', level: index === 0 ? 1 : 0 };
    }
    const type = KNOWN_STRUCTURES.has(b.type) ? b.type : (index === 0 ? 'hall' : 'empty');
    const maxLevel = type === 'hall' ? 5 : 6;
    let level = sanitizeInt(b.level, type === 'empty' ? 0 : 1, type === 'empty' ? 0 : 1, maxLevel);
    if (type === 'empty') level = 0;

    const res = { type, level };

    if (b.job && typeof b.job === 'object') {
      const jobLevel = sanitizeInt(b.job.level, level + 1, 1, maxLevel);
      const started = sanitizeInt(b.job.started, Date.now(), 0);
      const finish = sanitizeInt(b.job.finish, started + 10000, 0);
      if (finish > 0) {
        res.job = { level: jobLevel, started, finish };
      }
    }

    if (b.pos && typeof b.pos === 'object') {
      const u = Number(b.pos.u);
      const v = Number(b.pos.v);
      if (Number.isFinite(u) && Number.isFinite(v)) {
        res.pos = {
          u: Math.max(-4, Math.min(4, Math.round(u * 2) / 2)),
          v: Math.max(-4, Math.min(4, Math.round(v * 2) / 2))
        };
      }
    }

    return res;
  }

  function validatePlaythrough(run) {
    if (!run || typeof run !== 'object') return undefined;
    const rawName = String(run.playerName || '').normalize('NFC').trim().replace(/\s+/g, ' ');
    const isSafe = Array.from(rawName).length >= 2 && Array.from(rawName).length <= 20 &&
      !/[<>\u0000-\u001f\u007f]/.test(rawName);
    if (!isSafe) return undefined;

    const startedAt = sanitizeInt(run.startedAt, Date.now(), 0);
    let completedAt = null;
    if (run.completedAt !== null && run.completedAt !== undefined) {
      completedAt = sanitizeInt(run.completedAt, startedAt, startedAt);
    }

    return {
      playerName: rawName,
      startedAt,
      completedAt,
      resultShown: Boolean(run.resultShown)
    };
  }

  function validateState(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { valid: false, errors: ['State is not an object'] };
    }

    const state = createInitialState();
    const errors = [];

    // Currency & progression numbers
    state.gold = sanitizeInt(raw.gold, 350, 0, 10000000);
    state.grain = sanitizeInt(raw.grain, 60, 0, 10000000);
    state.stage = sanitizeInt(raw.stage, 1, 1, 15);
    state.wave = sanitizeInt(raw.wave, 1, 1, 1000);
    state.sound = Boolean(raw.sound);

    const now = Date.now();
    state.last = sanitizeInt(raw.last, now, 0, now + 60000);
    state.lastConstructionFinishedAt = sanitizeInt(raw.lastConstructionFinishedAt, 0, 0, now + 86400000);

    // Stars
    if (raw.stars && typeof raw.stars === 'object' && !Array.isArray(raw.stars)) {
      for (const [k, v] of Object.entries(raw.stars)) {
        const stageNum = parseInt(k, 10);
        if (stageNum >= 1 && stageNum <= 15) {
          const sCount = sanitizeInt(v, 0, 1, 3);
          if (sCount > 0) state.stars[stageNum] = sCount;
        }
      }
    }

    // Army
    if (raw.army && typeof raw.army === 'object') {
      for (const t of KNOWN_TROOPS) {
        state.army[t] = sanitizeInt(raw.army[t], 0, 0, 1000);
      }
    } else if (typeof raw.troops === 'number') {
      // Legacy v1.0 migration
      const legacyTroops = sanitizeInt(raw.troops, 0, 0, 1000);
      state.army.vanguard = Math.max(0, legacyTroops - Math.min(legacyTroops, 2));
      state.army.ranger = Math.min(legacyTroops, 2);
    }

    // Buildings
    if (Array.isArray(raw.buildings) && raw.buildings.length > 0) {
      const sanitized = raw.buildings.slice(0, 12).map((b, i) => validateBuilding(b, i));
      while (sanitized.length < 12) {
        sanitized.push({ type: 'empty', level: 0 });
      }
      // Slot 0 must be hall
      if (sanitized[0].type !== 'hall') {
        sanitized[0].type = 'hall';
        if (sanitized[0].level < 1) sanitized[0].level = 1;
      }
      state.buildings = sanitized;
    } else {
      errors.push('Missing or invalid buildings array; reset to default.');
    }

    // Research
    if (raw.research && typeof raw.research === 'object') {
      for (const t of KNOWN_TROOPS) {
        state.research[t] = sanitizeInt(raw.research[t], 0, 0, 3);
      }
    }

    // Claims
    if (raw.claims && typeof raw.claims === 'object') {
      for (const [k, v] of Object.entries(raw.claims)) {
        if (v === true) state.claims[k] = true;
      }
    }

    // Playthrough
    if (raw.playthrough) {
      const run = validatePlaythrough(raw.playthrough);
      if (run) state.playthrough = run;
    }

    state.schemaVersion = SCHEMA_VERSION;
    return { valid: true, state, errors };
  }

  function getStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const testKey = '__tt_storage_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return window.localStorage;
      }
    } catch {}
    return null;
  }

  const memoryStore = new Map();

  function storageGet(key) {
    const store = getStorage();
    if (store) {
      return store.getItem(key);
    }
    return memoryStore.get(key) || null;
  }

  function storageSet(key, value) {
    const store = getStorage();
    if (store) {
      try {
        store.setItem(key, value);
        return true;
      } catch (err) {
        console.warn('localStorage write failed, falling back to memory store', err);
      }
    }
    memoryStore.set(key, value);
    return false;
  }

  function storageRemove(key) {
    const store = getStorage();
    if (store) {
      try { store.removeItem(key); } catch {}
    }
    memoryStore.delete(key);
  }

  function loadSavedGame() {
    let rawStr = storageGet(SAVE_KEY);
    let recoveredFromBackup = false;

    if (rawStr) {
      try {
        const parsed = JSON.parse(rawStr);
        const { valid, state, errors } = validateState(parsed);
        if (valid && errors.length === 0) {
          return { state, status: 'loaded' };
        }
        if (valid && state) {
          // Self-heal partially malformed state
          saveGame(state);
          return { state, status: 'repaired', warnings: errors };
        }
      } catch (parseErr) {
        console.warn('Corrupted primary save data. Attempting backup recovery...', parseErr);
        // Archive corrupted data for emergency user recovery
        try { storageSet(CORRUPTED_PREFIX + Date.now(), rawStr); } catch {}
      }
    }

    // Attempt backup recovery
    const backupStr = storageGet(BACKUP_KEY);
    if (backupStr) {
      try {
        const parsedBackup = JSON.parse(backupStr);
        const { valid, state } = validateState(parsedBackup);
        if (valid && state) {
          console.info('Successfully recovered village from automatic backup.');
          saveGame(state);
          return { state, status: 'recovered_from_backup' };
        }
      } catch (e) {
        console.warn('Backup was also unreadable.', e);
      }
    }

    // Default fresh start
    const initial = createInitialState();
    return { state: initial, status: 'fresh' };
  }

  function saveGame(state) {
    if (!state || typeof state !== 'object') return false;
    const { state: cleanState } = validateState(state);

    try {
      const json = JSON.stringify(cleanState);
      // Create backup of current save before overwriting
      const current = storageGet(SAVE_KEY);
      if (current && current !== json) {
        storageSet(BACKUP_KEY, current);
      }
      storageSet(SAVE_KEY, json);
      return true;
    } catch (e) {
      console.error('Failed to save game state', e);
      return false;
    }
  }

  function exportSaveJson(state) {
    const { state: cleanState } = validateState(state);
    const exportData = {
      app: 'Tiny Tyrants',
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      village: cleanState
    };
    return JSON.stringify(exportData, null, 2);
  }

  function importSaveJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      const candidate = parsed.village || parsed;
      const { valid, state, errors } = validateState(candidate);
      if (!valid || !state) {
        return { success: false, error: 'Invalid save format: ' + errors.join(', ') };
      }
      return { success: true, state };
    } catch (e) {
      return { success: false, error: 'Malformed JSON file: ' + e.message };
    }
  }

  const api = {
    SAVE_KEY,
    BACKUP_KEY,
    ARCHIVE_KEY,
    SCHEMA_VERSION,
    createInitialState,
    validateState,
    loadSavedGame,
    saveGame,
    exportSaveJson,
    importSaveJson,
    getStorage
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof window !== 'undefined') {
    window.TinyTyrantsStorage = api;
  }
})();
