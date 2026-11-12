# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| 1.1.x   | :x:                |
| 1.0.x   | :x:                |

## Architecture & Data Safety

Tiny Tyrants is a 100% client-side web application:
- **No telemetry or tracker scripts**: No user information or telemetry is sent to any external server.
- **Local persistence**: Game state is saved strictly in the user's browser `localStorage` under `tiny-tyrants-v1` and automatic backup keys.
- **XSS & Input Sanitization**: Player names and imported save JSON are rigorously validated and sanitized to prevent injection attacks or execution of malicious markup.
- **Export/Import integrity**: Saved villages can be exported to JSON files and re-imported with schema validation and pre-import backups.

## Reporting a Vulnerability

If you discover a security issue or vulnerability in Tiny Tyrants, please report it privately by contacting the maintainer via GitHub or email at mannanshah14@gmail.com.
