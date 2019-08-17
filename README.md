# Sheetbase CLI

Official CLI for working with Sheetbase.

<!-- <block:header> -->

[![Build Status](https://travis-ci.org/sheetbase/cli.svg?branch=master)](https://travis-ci.org/sheetbase/cli) [![Coverage Status](https://coveralls.io/repos/github/sheetbase/cli/badge.svg?branch=master)](https://coveralls.io/github/sheetbase/cli?branch=master) [![NPM](https://img.shields.io/npm/v/@sheetbase/cli.svg)](https://www.npmjs.com/package/@sheetbase/cli) [![License][license_badge]][license_url] [![Support me on Patreon][badge_patreon]][patreon_url] [![PayPal][badge_paypal_donate]][paypal_donate_url] [![Ask me anything][badge_ask_me]][ask_me_url]

<!-- </block:header> -->

## Install

`npm install -g @sheetbase/cli`

## Additional steps

### Enable Apps Script API

Go to <https://script.google.com/home/usersettings>, then enable the API.

### Connect Apps Script in Drive

My Drive > Connect more apps > (search for Google Apps Script) > Connect

### Install @google/clasp

Recommended for developing Google Apps Script, <https://github.com/google/clasp>.

`npm install -g @google/clasp`

## Commands

The following commands provide many convinient methods to manage a Sheetbase project.

> Note: Some of them require you to connect a Google account by `sheetbase google login`; project-related command needs to be run inside a Sheetbase project.

### Google account

- [`sheetbase google list|ls [-d,--default]`](#google)
- [`sheetbase google connect|login|add [-y,--yes] [-c,--creds] [-f,--full-drive]`](#google)
- [`sheetbase google disconnect|logout|remove|rm <id>|all|default|local`](#google)
- [`sheetbase google default [<id>]`](#google)

### Project related

- [`sheetbase [project] start [<projectName>] [<resource>] [-i,--install] [-x,--not-setup]`](#start)
- [`sheetbase [project] setup [-r,--fresh]`](#setup)
- [`sheetbase [project] configs`](#configs)
- [`sheetbase [project] config list|ls`](#config)
- [`sheetbase [project] config update|set <key=value> ...`](#config)
- [`sheetbase [project] config import|im <path>`](#config)
- [`sheetbase [project] config export|ex`](#config)
- [`sheetbase [project] urls`](#urls)
- [`sheetbase [project] url [<name>] [-o,--open]`](#url)
- [`sheetbase [project] info`](#info)
- [`sheetbase [project] build [-b,--backend] [-f,--frontend]`](#build)
- [`sheetbase [project] deploy [-m,--message <value>] [-b,--backend] [-f,--frontend]`](#deploy)
- [`sheetbase [project] preview`](#preview)

#### Backend specific

- [`sheetbase backend build`](#backend)
- [`sheetbase backend push`](#backend)
- [`sheetbase backend deploy [-m,--message <value>]`](#backend)
- [`sheetbase backend install|i`](#backend)
- [`sheetbase backend uninstall|un`](#backend)
- [`sheetbase backend run <script>`](#backend)
- [`sheetbase backend *`](#backend)

#### Frontend specific

- [`sheetbase frontend build`](#frontend)
- [`sheetbase frontend deploy [-m,--message <value>]`](#frontend)
- [`sheetbase frontend prerender [-f,--force <value>] [-o,--only <value>]`](#frontend)
- [`sheetbase frontend install|i`](#frontend)
- [`sheetbase frontend uninstall|un`](#frontend)
- [`sheetbase frontend run <script>`](#frontend)
- [`sheetbase frontend *`](#frontend)

### Database related

- [`sheetbase db list|ls`](#db)
- [`sheetbase db create [input] [-i,--id <value>] [-d,--data]`](#db)
- [`sheetbase db import|im <name> [source] [-i,--id <value>]`](#db)
- [`sheetbase db export|ex <name> [-i,--id <value>]`](#db)

### Misc actions

- [`sheetbase docs`](#docs)
- [`sheetbase update [-y,--yes]`](#update)
- [`sheetbase help [-d,--detail]`](#help)
- [`sheetbase *`](#*)

## Reference

### `Google`

Manage Google accounts.
Sub-commands: list|ls, connect|login|add, disconnect|logout|remove|rm, default.

- `subCommand`: Supported sub-commands.
- `params`: Command params, comma-separated.
- `-y,--yes`: (connect) Agree on account connection.
- `-c,--creds`: (connect) Save credential to .googlerc.json.
- `-f,--full-drive`: (connect) Not recommended, grant full access to Drive.
- `-d,--default`: (list) Show default account only.

### `Project`

Project general tasks.
Sub-commands: start, setup, configs, config, urls, url, info, build, deploy, preview.

- `subCommand`: Supported sub-commands.
- `params`: Command params, comma-separated.
- `-i,--install`: (start) Install npm packages.
- `-x,--not-setup`: (start) Do not run setup command.
- `-r,--fresh`: (setup) Force re-setup.
- `-o,--open`: (url) Open the url in browser.
- `-b,--backend`: (build, deploy) Build or deploy backend only.
- `-f,--frontend`: (build, deploy) Build or deploy frontend only.
- `-m,--message`: (deploy) Deployment message.

### `Start`

Start a new project.
Proxy of **project start**

- `projectName`: Name of the project, auto default.
- `resource`: Resource to create the project with, default to theme **blank_angular**.
- `-i,--install`: Install npm packages.
- `-x,--not-setup`: Do not run setup command.

### `Setup`

Setup the project.
Proxy of **project setup**

- `-r,--fresh`: Force re-setup.

### `Configs`

View project configs.
Proxy of **project configs**

### `Config`

Config the project.
Proxy of **project config**
Sub-commands: list, update, import, export

- `subCommand`: Optional supported sub-commands, default: **list**.
- `params`: Command params, comma-separated.

### `Urls`

View project URLs.
Proxy of **project urls**

### `Url`

View or open a project URL.
Proxy of **project url**

- `name`: Url name to view or open with.
- `-o,--open`: Open the url in browser.

### `Info`

Output project info.
Proxy of **project info**

### `Build`

Build the project.
Proxy of **project build**

- `-b,--backend`: Build backend only.
- `-f,--frontend`: Build frontend only.

### `Deploy`

Deploy the project.
Proxy of **project deploy**

- `-b,--backend`: Deploy backend only.
- `-f,--frontend`: Deploy frontend only.
- `-m,--message`: Deployment message.

### `Preview`

Preview the project.
Proxy of **project preview**

### `Backend`

Run backend related commands.
Sub-commands: build, push, deploy, install|i, uninstall|un, run, *.

- `subCommand`: Optional supported sub-commands.
- `-m,--message`: (deploy) Deployment message.

### `Frontend`

Run frontend related commands.
Sub-commands: build, deploy, prerender, install|i, uninstall|un, run, *.

- `subCommand`: Optional supported sub-commands.
- `-m,--message`: (deploy) Deployment message.
- `-f,--force`: (prerender) Force prerender all or certain parts.
- `-o,--only`: (prerender) Prerender only certain parts.

### `Db`

Manage the database.
Sub-commands: list|ls, create, import|im, export|ex

- `subCommand`: Supported sub-commands.
- `params`: Command params, comma-separated.
- `-i,--id`: The database id.
- `-d,--data`: (create) Create table with sample data.

### `Docs`

Open the documentation.

### `Update`

Check and install update.

- `-y,--yes`: Install update when available.

### `Help`

Display help.

- `-d,--detail`: Detail help.

### `*`

Any other command will run: npm run <cmd>.

## Development

API Reference: https://sheetbase.github.io/cli/api/

## Lisence

Sheetbase CLI is released under the [Apache-2.0](https://github.com/sheetbase/cli/blob/master/LICENSE) license.

<!-- <block:footer> -->

[license_badge]: https://img.shields.io/hexpm/l/plug.svg
[license_url]: https://github.com/sheetbase/cli/blob/master/LICENSE

[badge_patreon]: https://lamnhan.github.io/assets/images/badges/patreon.svg
[patreon_url]: https://www.patreon.com/lamnhan

[badge_paypal_donate]: https://lamnhan.github.io/assets/images/badges/paypal_donate.svg
[paypal_donate_url]: https://www.paypal.me/lamnhan

[badge_ask_me]: https://img.shields.io/badge/ask/me-anything-1abc9c.svg
[ask_me_url]: https://m.me/sheetbase

<!-- </block:footer> -->