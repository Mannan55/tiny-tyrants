# Changelog

All notable changes to **Tiny Tyrants** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-11-12

### Added
- **Storage & Reliability Engine (`storage.js`)**:
  - Versioned schema (v2) with strict validation for resources, buildings, army counts, and timestamps.
  - Automatic rolling backup under `tiny-tyrants-v1:backup` with crash recovery.
  - Safe memory fallback when `localStorage` is disabled or throws quota errors.
  - Complete JSON save export and import with schema validation and pre-import rollback protection.
- **Combat Controls & Feedback**:
  - Battle Pause / Resume toggle (Space key) in raids and settlement defense.
  - Battle speed toggle (1x / 2x speed via `S` key).
  - Floating combat indicators (damage and healing popups).
  - Color-coded unit and building health bars with armor indicators.
  - Detailed expedition debrief showing casualties broken down by troop class, surviving forces, and Field Hospital rescues.
- **Progression & Strategy**:
  - Smart In-Game Advisor banner recommending the optimal next action (foundation buildings, recruitment, raids, lab upgrades).
  - Extended offline resource generation up to 10 hours with clock skew protection.
  - Tactical troop roles: Wall Breakers deal 4x damage against gates and stop to breach them before advancing; Giants prioritize defensive towers and draw aggro; Healers intelligently target lowest-% HP allies.
- **Accessibility & UX**:
  - Modal dialog focus trapping and proper ARIA labels.
  - Support for `prefers-reduced-motion` to tone down animations and particles.
- **Automated Quality Gates**:
  - Expanded unit test suites for save reliability, economy & progression, and combat simulation.
  - End-to-end browser tests executed via Chrome DevTools Protocol.
  - GitHub Actions multi-platform CI matrix testing on Node.js 20, 22, and 24 across Ubuntu and Windows.

### Fixed
- Fixed bug where attacking units would phase through intact gates before destroying them.
- Fixed offline production capping prematurely after only 1 hour.
- Fixed potential data loss on malformed localStorage entries by introducing automatic backup recovery.
- Fixed multiple overriding event listeners on Help and Battle buttons.
- Fixed spacing formatting on the playthrough HUD.

---

## [1.1.0] - 2026-11-12

### Added
- Start screen with village introduction and player name registration (2–20 characters).
- Persistent playthrough timer recording time from name confirmation to full village completion.
- Max-base victory condition (Town Hall 5, all 9 other building types, 11 plots at level 6).
- Congratulations screen showing player name and frozen completion time.
- Continue Village and Start New Game options.
- Regression test suite (`tests/progression.test.cjs`).

---

## [1.0.0] - 2026-11-12

### Added
- Initial launch of Tiny Tyrants on Netlify.
- 5-age Town Hall progression, isometric island renderer (`art.js`), 15 single-player campaign missions (`raid.js`), and base layout editor.
