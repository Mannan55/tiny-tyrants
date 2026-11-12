/* Version 1.1: named playthroughs, a persistent elapsed clock, and a max-base ending. */
(() => {
  'use strict';
  const runHud = document.createElement('button');
  runHud.className = 'runHud';
  runHud.id = 'runHud';
  runHud.setAttribute('aria-label', 'View playthrough timer and completion goals');
  document.body.append(runHud);
  const originalClose = $('close').onclick;
  let launchOpen = false;
  let nameEntryOpen = false;

  function validName(value) {
    const normalized = String(value || '').normalize('NFC').trim().replace(/\s+/g, ' ');
    return Array.from(normalized).length >= 2 && Array.from(normalized).length <= 20 &&
      !/[<>\u0000-\u001f\u007f]/.test(normalized) ? normalized : null;
  }

  function formatElapsed(milliseconds) {
    const seconds = Math.max(0, Math.floor(milliseconds / 1000));
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds / 3600) % 24;
    const minutes = Math.floor(seconds / 60) % 60;
    const clock = [hours, minutes, seconds % 60].map(n => String(n).padStart(2, '0')).join(':');
    return (days ? days + 'd ' : '') + clock;
  }

  function completionFacts(buildings) {
    const hall = buildings[0];
    const requiredTypes = Object.keys(structures).filter(type => type !== 'hall' && type !== 'empty');
    const ready = buildings.length === 12 && buildings.every(b => b.type !== 'empty' && !b.job);
    const maxPlots = buildings.slice(1).filter(b => b.type !== 'empty' && b.level >= 6 && !b.job).length;
    const ownedTypes = new Set(buildings.filter(b => b.level > 0 && !b.job).map(b => b.type));
    const missing = requiredTypes.filter(type => !ownedTypes.has(type));
    return {
      hallMax: hall?.type === 'hall' && hall.level >= 5 && !hall.job,
      maxPlots,
      missing,
      complete: Boolean(ready && hall?.type === 'hall' && hall.level >= 5 && maxPlots === 11 && !missing.length)
    };
  }

  function elapsed() {
    const run = s.playthrough;
    return run ? Math.max(0, (run.completedAt || Date.now()) - run.startedAt) : 0;
  }

  function renderHud() {
    const run = s.playthrough;
    runHud.replaceChildren();
    const name = document.createElement('span');
    name.className = 'runName';
    name.textContent = run ? run.playerName : 'Your next tiny empire';
    const time = document.createElement('strong');
    time.textContent = run ? ' ' + formatElapsed(elapsed()) : ' Ready to begin';
    const status = document.createElement('small');
    status.textContent = run?.completedAt ? 'BASE MAXED · VIEW RESULT' : run ? 'PLAYTHROUGH · TAP FOR GOALS' : 'TINY TYRANTS · v1.2';
    runHud.append(name, time, status);
  }

  function releaseModal() {
    launchOpen = false;
    nameEntryOpen = false;
    $('dialog').classList.remove('startDialog', 'victoryDialog');
    $('close').hidden = false;
  }

  function showDialog(html, className = '') {
    releaseModal();
    modal(html);
    if (className) $('dialog').classList.add(className);
  }

  function helpMarkup() {
    return '<p>The playthrough timer measures how long it takes to fully upgrade your village. ' +
      'It starts when you confirm your player name, saves automatically, and keeps running while the game is closed.</p>' +
      '<p>To finish, reach <strong>Town Hall level 5</strong>, build <strong>all 9 other building types</strong>, ' +
      'and fill all <strong>11 remaining plots with level 6 buildings</strong>. Every construction and upgrade must be finished.</p>' +
      '<p>Troop research and campaign stars are optional for this ending. When the base is maxed, the clock freezes ' +
      'and a congratulations screen shows your name and final time. Continue Village keeps your completed base; ' +
      'Start New Game resets the village and starts a new timed run.</p>' +
      '<p>If the last upgrade finishes while you are away, its scheduled finish time is used. ' +
      'Older villages start their clock when a player name is first registered in v1.1.</p>';
  }

  function showGoals() {
    const facts = completionFacts(s.buildings);
    showDialog('<div class="cap">YOUR PLAYTHROUGH</div><h2>Build small. Finish mighty.</h2>' +
      '<div class="goalRows"><div><span>Town Hall level 5</span><b>' + (facts.hallMax ? '✓' : 'Not yet') + '</b></div>' +
      '<div><span>Level 6 building plots</span><b>' + facts.maxPlots + ' / 11</b></div>' +
      '<div><span>Building types built</span><b>' + (9 - facts.missing.length) + ' / 9</b></div></div>' + helpMarkup());
    if (facts.missing.length) {
      const missing = document.createElement('p');
      missing.textContent = 'Still needed: ' + facts.missing.map(type => structures[type][0]).join(', ') + '.';
      $('dialogBody').append(missing);
    }
  }

  function showVictory() {
    if (!s.playthrough?.completedAt) return;
    const run = s.playthrough;
    showDialog('<div class="victoryCrown" aria-hidden="true">' + ('<svg aria-hidden="true" viewBox="0 0 160 190">' + paths.crest + '</svg>') + '</div>' +
      '<div class="cap">TINY TYRANTS · GAME COMPLETE</div><h2>Congratulations!</h2>' +
      '<p class="victoryName"></p><p>You built a fully maxed village.</p>' +
      '<div class="finalTime"><small>YOUR COMPLETION TIME</small><strong>' + formatElapsed(elapsed()) + '</strong></div>' +
      '<p>Your timed run is complete. Keep enjoying this village or begin a new empire.</p>' +
      '<button class="primary" id="continueVillage">Continue Village</button>' +
      '<button class="secondary newRunButton" id="newFromVictory">Start New Game</button>', 'victoryDialog');
    $('dialogBody').querySelector('.victoryName').textContent = run.playerName;
    $('continueVillage').onclick = () => { releaseModal(); $('dialog').close(); };
    $('newFromVictory').onclick = confirmNewGame;
    run.resultShown = true;
    save();
  }

  function checkCompletion() {
    const run = s.playthrough;
    if (!run || run.completedAt) return;
    const facts = completionFacts(s.buildings);
    if (!facts.complete) return;
    run.completedAt = Math.max(run.startedAt, Math.min(Date.now(), s.lastConstructionFinishedAt || Date.now()));
    run.resultShown = false;
    save();
    chime(660);
  }

  function submitPlayerName(name) {
    const playerName = validName(name);
    if (!playerName) return false;
    const now = Date.now();
    if (s.playthrough) {
      s.playthrough.playerName = playerName;
    } else {
      s.playthrough = { playerName, startedAt: now, completedAt: null, resultShown: false };
    }
    releaseModal();
    $('dialog').close();
    save();
    renderHud();
    checkCompletion();
    return true;
  }

  function showNameEntry() {
    showDialog('<div class="cap">YOUR EMPIRE NEEDS A NAME</div><h2>What should we call you?</h2>' +
      '<p>Your player name appears beside the timer and on your final congratulations screen.</p>' +
      '<form id="nameForm"><label for="playerNameInput">Player name</label>' +
      '<input id="playerNameInput" name="playerName" autocomplete="nickname" minlength="2" maxlength="40" ' +
      'placeholder="Enter 2–20 characters" required>' +
      '<p id="nameError" role="status"></p><button class="primary" type="submit">Start My Run →</button></form>' +
      '<p class="smallPrint">Your timer starts when you press Start My Run. Progress stays in this browser.</p>', 'startDialog');
    nameEntryOpen = true;
    $('close').hidden = true;
    $('nameForm').onsubmit = event => {
      event.preventDefault();
      if (!submitPlayerName($('playerNameInput').value)) {
        $('nameError').textContent = 'Use 2–20 characters. Angle brackets and control characters are not allowed.';
      }
    };
    $('playerNameInput').focus();
  }

  function resetVillage() {
    try { localStorage.setItem(saveKey + ':previous-village', JSON.stringify(s)); } catch {}
    s = structuredClone(initial);
    s.last = Date.now();
    selected = 0;
    mission = 1;
    document.body.classList.remove('inspecting');
    portraits.clear();
    save();
    refresh();
    renderHud();
    showNameEntry();
  }

  function confirmNewGame() {
    showDialog('<div class="cap">A NEW BEGINNING</div><h2>Start a fresh village?</h2>' +
      '<p>This replaces your current village with one Town Hall, 350 Gold and 60 Elixir. ' +
      'You will choose a player name and begin a new timer.</p>' +
      '<button class="primary" id="confirmNewRun">Start New Game</button>' +
      '<button class="secondary newRunButton" id="keepCurrent">Keep Current Village</button>');
    $('confirmNewRun').onclick = resetVillage;
    $('keepCurrent').onclick = () => { if (s.playthrough?.completedAt) showVictory(); else showStartScreen(); };
  }

  function exportVillage() {
    if (!window.TinyTyrantsStorage) return;
    const json = window.TinyTyrantsStorage.exportSaveJson(s);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tiny-tyrants-' + (s.playthrough?.playerName ? s.playthrough.playerName.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'village') + '-backup.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notice('Village exported as JSON backup');
  }

  function importVillage() {
    if (!window.TinyTyrantsStorage) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const res = window.TinyTyrantsStorage.importSaveJson(ev.target.result);
        if (!res.success) {
          notice('Import failed: ' + res.error);
          return;
        }
        showDialog('<div class="cap">RESTORE VILLAGE</div><h2>Import village backup?</h2>' +
          '<p>This will replace your current village with the imported backup.</p>' +
          '<div class="startFacts"><span>Town Hall ' + res.state.buildings[0].level + '</span>' +
          '<span>' + (res.state.playthrough?.playerName || 'Village') + '</span>' +
          '<span>' + res.state.gold.toLocaleString() + ' Gold</span></div>' +
          '<button class="primary" id="confirmImport">Restore Village</button>' +
          '<button class="secondary newRunButton" id="cancelImport">Cancel</button>');
        $('confirmImport').onclick = () => {
          try { localStorage.setItem(saveKey + ':previous-village', JSON.stringify(s)); } catch {}
          s = res.state;
          selected = 0;
          mission = Math.max(1, s.stage);
          save();
          refresh();
          renderHud();
          releaseModal();
          $('dialog').close();
          notice('Village successfully restored!');
        };
        $('cancelImport').onclick = () => showStartScreen();
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function showStartScreen() {
    const existingVillage = s.buildings.some(b => b.type !== 'empty' && b.type !== 'hall') ||
      s.buildings[0].level > 1 || s.stage > 1 || Object.values(s.army).some(Boolean);
    showDialog('<div class="startLogo"><svg aria-hidden="true" viewBox="0 0 160 190">' + paths.crest + '</svg></div>' +
      '<div class="cap">TINY TYRANTS · v1.2</div><h2>Your tiny empire starts here.</h2>' +
      '<p>Build a village from one Town Hall. Gather Gold and Elixir, recruit an army, and raid 15 enemy strongholds.</p>' +
      '<div class="startFacts"><span>Build your base</span><span>Train your army</span><span>Max your village</span></div>' +
      '<p>Your challenge: Town Hall 5, all building types, and every other plot upgraded to level 6. ' +
      'A persistent timer records your journey—even while you are away.</p>' +
      (s.playthrough || existingVillage ? '<button class="primary" id="resumeRun">' +
        (s.playthrough?.completedAt ? 'Continue Completed Village' : 'Continue Village') + '</button>' : '') +
      '<button class="' + (s.playthrough || existingVillage ? 'secondary newRunButton' : 'primary') +
      '" id="startFresh">Start New Game →</button>' +
      '<button class="secondary newRunButton" id="startImport">Import Village Backup (.json)</button>' +
      '<p class="smallPrint">No account needed. Your village and timer save in this browser with automatic backups.</p>', 'startDialog');
    launchOpen = true;
    $('close').hidden = true;
    if ($('resumeRun')) $('resumeRun').onclick = () => {
      if (!s.playthrough) showNameEntry();
      else {
        releaseModal();
        $('dialog').close();
        if (s.playthrough.completedAt && !s.playthrough.resultShown) showVictory();
      }
    };
    $('startFresh').onclick = s.playthrough || existingVillage ? confirmNewGame : resetVillage;
    if ($('startImport')) $('startImport').onclick = importVillage;
  }

  $('dialog').addEventListener('cancel', event => {
    if (launchOpen || nameEntryOpen) event.preventDefault();
    else releaseModal();
  });
  $('close').onclick = () => {
    if (launchOpen || nameEntryOpen) return;
    releaseModal();
    originalClose();
  };
  runHud.onclick = () => s.playthrough?.completedAt ? showVictory() : s.playthrough ? showGoals() : showStartScreen();
  $('help').onclick = () => {
    showDialog('<div class="cap">VILLAGE HANDBOOK · v1.2</div><h2>How Tiny Tyrants works</h2>' +
      '<p>Build a Gold Mine, Elixir Collector and Army Camp first. Gold constructs buildings; Elixir recruits troops. ' +
      'Two builders keep working while the game is closed (up to 10 hours offline production).</p><h3>Tactical combat & saves</h3>' +
      '<p>Use Pause (Space) and 2x Speed (S) during battles. Wall Breakers destroy gates; Giants draw enemy tower fire. ' +
      'Save data is automatically verified and backed up with schema validation.</p><h3>Why is there a timer?</h3>' + helpMarkup());
    row('View completion goals', 'See exactly what your village still needs.', showGoals);
    row('Export village backup (JSON)', 'Save your full village and timer to a JSON file.', exportVillage);
    row('Import village backup (JSON)', 'Restore your village from a previously exported backup.', importVillage);
    row('Start screen', 'Read the introduction or start a fresh game.', showStartScreen);
  };
  window.TinyTyrantsProgress = { validName, formatElapsed, completionFacts };
  window.setInterval(() => {
    checkCompletion();
    renderHud();
    if (s.playthrough?.completedAt && !s.playthrough.resultShown && !battle && !layoutEditing &&
        !$('dialog').open && !launchOpen && !nameEntryOpen) showVictory();
  }, 1000);
  renderHud();
  showStartScreen();
})();
