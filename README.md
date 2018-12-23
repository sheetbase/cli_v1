# Sheetbase CLI

Official CLI for working with Sheetbase.

<!-- <block:header> -->

[![Build Status](https://travis-ci.org/sheetbase/cli.svg?branch=master)](https://travis-ci.org/sheetbase/cli) [![Coverage Status](https://coveralls.io/repos/github/sheetbase/cli/badge.svg?branch=master)](https://coveralls.io/github/sheetbase/cli?branch=master) [![NPM](https://img.shields.io/npm/v/@sheetbase/cli.svg)](https://www.npmjs.com/package/@sheetbase/cli) [![License][license_badge]][license_url] [![Support me on Patreon][badge_patreon]][patreon_url] [![PayPal][badge_paypal_donate]][paypal_donate_url] [![Ask me anything][badge_ask_me]][ask_me_url]

<!-- </block:header> -->

## Install

`npm install -g @sheetbase/cli`

## Additional steps

### Install [@google/clasp](https://github.com/google/clasp)

Recommended for developing Google Apps Script.

`npm install -g @google/clasp`

### Enable Apps Script API

Go to https://script.google.com/home/usersettings, then enable the API.

### Connect Apps Script in Drive

My Drive > Connect more apps > (search for Google Apps Script) > Connect

## Develop & deploy

### Backend

Develop the backend in the **backend/** folder.

To authorize the script:
- Run `sheetbase url -o script`, to open the script in Google Apps Script editor.
- Publish > Deploy as web app... > Update
- Follow the steps to authorize (ignore the warning)
- Verify by `sheetbase url -o backend`

### Frontend

Develop and build according to your framework of choice.

Deploy to a static hosting or build an hybrid app.

## Usage

### Google

Manage Google accounts.
Sub-commands: list, connect, disconnect, default.

#### Options

- `subCommand`: Supported sub-commands.
- `params`: Command params, comma-separated.
- `--yes`: (connect) Agree on account connection.
- `--creds`: (connect) Save credential to .googlerc.json.
- `--full-drive`: (connect) Not recommended, grant full access to Drive.
- `--default`: (list) Show default account only.

### Project

Project general tasks.
Sub-commands: start, setup, config, urls, info, hooks.

#### Options

- `subCommand`: Supported sub-commands.
- `params`: Command params, comma-separated.
- `--npm`: (start) Install npm packages.
- `--setup`: (start) Run setup command.
- `--open`: (url) Open the url in browser.
- `--database`: (model) Custom database.

### Start

Start a new project.
Proxy of _project start_

#### Options

- `projectName`: Name of the project, auto default.
- `resource`: Theme or template to create the project with, default to theme _blank_angular_.
- `--npm`: Install npm packages.
- `--setup`: Run setup command.

### Setup

Setup the project.
Proxy of _project setup_

### Configs

View project configs.
Proxy of _project configs_

### Config

Config backend & frontend.
Proxy of _project config_
Sub-commands: list, update, import, export

#### Options

- `subCommand`: Optional supported sub-commands, default: _list_.
- `params`: Command params, comma-separated.

### Urls

View project URLs.
Proxy of _project urls_

### Url

View or open a project URL.
Proxy of _project url_

#### Options

- `--open`: Open the url in browser.

### Models

View project models.
Proxy of _project models_

### Model

Create model.
Proxy of _project model_

#### Options

- `--database`: Custom database.

### Info

Output project info.
Proxy of _project info_

### Docs

Open the documentation.

### Backend

Run backend related command.

### Frontend

Run frontend related command.

### Help

Display help.

#### Options

- `--detail`: Detail help.

### *

Any other command ends of running: npm run <cmd>.

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