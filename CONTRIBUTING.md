# Contributing to Tiny Tyrants

Thank you for your interest in improving Tiny Tyrants! This document provides guidelines for contributing to this open-source project.

## Code of Conduct

Please be respectful, collaborative, and constructive when interacting with the project and other contributors.

## Local Development Workflow

Tiny Tyrants is built using clean, dependency-free vanilla HTML, CSS, JavaScript, and HTML5 Canvas. No build step, bundler, or transpiler is required.

1. Clone the repository:
   ```bash
   git clone https://github.com/Mannan55/tiny-tyrants.git
   cd tiny-tyrants
   ```

2. Serve locally with any static web server:
   ```bash
   # Using Python 3
   python -m http.server 8080

   # Or using Node.js npx
   npx serve .
   ```

3. Open `http://localhost:8080` in your web browser.

## Testing Standards

All pull requests must pass the automated test suite without regressions. Tests use Node.js built-in test runner (`node --test`) and require zero external dependencies:

```bash
# Verify JavaScript syntax across all engine modules
node --check art.js
node --check storage.js
node --check raid.js
node --check game.js
node --check progression.js

# Run automated unit & regression tests
node --test tests/save-reliability.test.cjs
node --test tests/economy-progression.test.cjs
node --test tests/combat-simulation.test.cjs
node tests/progression.test.cjs
```

## Pull Request Guidelines

1. **Keep it focused**: Each PR should address a single feature, bug fix, or improvement.
2. **Preserve save data compatibility**: The game stores state under `tiny-tyrants-v1`. Any changes to the state schema must maintain backward compatibility with existing player villages.
3. **Vanilla JavaScript first**: Avoid adding heavy external libraries, frameworks, or dependencies. Tiny Tyrants thrives on being lightweight, fast, and accessible directly in any browser.
4. **Follow existing conventions**: Match the isometric coordinate logic, naming conventions, and CSS structure.
