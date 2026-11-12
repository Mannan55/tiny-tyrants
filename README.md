# Tiny Tyrants

![Tiny Tyrants](Tiny-Tyrants-logo.svg)

Build a tiny village. Train a mighty army. Rule the kingdom.

**[Play Tiny Tyrants](https://tiny-tyrants.netlify.app/)**

Tiny Tyrants is a single-player village strategy game built with HTML, CSS, JavaScript, and Canvas.

## Play

Open index.html in a modern browser, or serve this folder with any static HTTP server. No build step or dependencies are required.

A new village starts with 350 Gold, 60 Elixir, one Town Hall, and eleven empty plots. Build a Gold Mine, Elixir Collector, and Army Camp, then expand your village and train troops.

## Features

- Five Town Hall tiers with building and troop unlocks.
- Distinct building artwork and visible upgrade stages.
- Two builders with construction timers that continue while the game is closed.
- Five troop classes with individual portraits and battlefield roles.
- Fifteen single-player campaign missions.
- Home defense battles using the village's actual building positions.
- Building-only layout editing with save and cancel.
- Research, achievements, resource exchanges, and optional sound.
- Responsive interface and browser-local progress saving.

Progress is stored in localStorage on the current browser and site origin. Clearing site data removes that progress. Saves are separate across devices and hosting addresses.

## Source files

- index.html — game interface.
- style.css — village HUD, menus, and responsive layout.
- game.js — economy, progression, construction, menus, home defense, and saving.
- art.js — animated village and building renderer.
- raid.js — campaign maps, troop deployment, and combat.
- Tiny-Tyrants-logo.svg and Tiny-Tyrants-mark.svg — logo and emblem.

## Hosting

Deploy this folder as a static site. Use the repository root as the publish directory and leave the build command empty.

The current live game was deployed manually on Netlify. Uploading this repository does not automatically connect it to the Netlify project.

## Current scope

This release is a single-player browser game. It has no accounts, cloud saves, multiplayer, payments, or backend service.

