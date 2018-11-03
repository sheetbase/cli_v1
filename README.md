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

After running `sheetbase setup` successfully.

Develop the backend in the **backend/** folder. Run `npm run build` to build the distribution package (this has security concern, see below). Run `npm run update` to update the backend.

To authorize the script:
- Run `sheetbase urls open backend`, to open the script in Google Apps Script editor.
- Publish > Deploy as web app... > Update
- Follow the steps to authorize (ignore the warning)
- Verify by `sheetbase urls open backendUrl`

### Frontend

Develop and build according to your framework of choice.

Deploy to a static hosting or build an hybrid app.

## Security

Only start a project with themes that you trust. Bad people may put malicious code in CLI hooks and backend build script.

Add `--trusted` flag to project-related commands (`setup`, `config`, `urls`, ...) to allow the CLI to run sensitive actions, such as: *hooks*, *setup initial build*.

When starting a project with an original theme, the CLI auto add `--trusted` to the `setup` command to let it run setup hooks and `npm run build` before initial deploy the backend.

Please let us know if there is any vulnerable or how to improve the development.

## Usage

### Account

Manage Sheetbase account.
Sub-commands: login, logout, signup, profile, upgrade.

#### Options

- `subCommand`: Supported sub-commands.
- `params`: Command params, comma-separated.
- `--web`: (login) Login using web UI.
- `--force`: (login) Force login again.
- `--no-cache`: (profile) Do not caching user-related info.

### Login

Login to Sheetbase Cloud account.
Proxy of _account login_

#### Options

- `--web`: Using web UI.
- `--force`: Force login again.

### Logout

Logout of your Sheetbase Cloud account.
Proxy of _account logout_

### Signup

Create a Sheetbase Cloud account.
Proxy of _account signup_

### Profile

Manage Sheetbase account profile.
Proxy of _account profile_
Sub-commands: get, open, update

#### Options

- `subCommand`: Optional supported sub-commands, default: _get_.
- `params`: Command params, comma-separated.
- `--no-cache`: Do not cache user-related info.

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
- `--no-setup`: (start) Do not run setup command.
- `--no-npm`: (start) Do not install packages.
- `--no-hook`: (start, setup, config, urls) Do not run hook.
- `--trusted`: (setup) Trusted to run sensitive actions.
- `--no-backend-deploy`: (setup) Do not initial deploy the backend.

### Start

Start a new project.
Proxy of _project start_

#### Options

- `projectName`: Name of the project, auto default.
- `theme`: Theme to create the project with, default to _basic_angular_.
- `--no-npm`: Do not install packages.
- `--no-setup`: Do not run setup command.
- `--no-hook`: Do not run setup hook.
- `--trusted`: Trusted to run setup sensitive actions.
- `--no-backend-deploy`: Do not initial deploy the backend.

### Setup

Setup the project.
Proxy of _project setup_

#### Options

- `--trusted`: Trusted to run sensitive actions.
- `--no-hook`: Do not run hook.
- `--no-backend-deploy`: Do not initial deploy the backend.

### Config

Config backend & frontend.
Proxy of _project config_
Sub-commands: list, update, import, export

#### Options

- `subCommand`: Optional supported sub-commands, default: _list_.
- `params`: Command params, comma-separated.
- `--no-hook`: Do not run hook.

### Urls

View project URLs.
Proxy of _project urls_
Sub-commands: list, open

#### Options

- `subCommand`: Optional supported sub-commands, default: _list_.
- `params`: Command params, comma-separated.
- `--no-hook`: Do not run hook.

### Info

Output project info.
Proxy of _project info_

### Hooks

Output list of hooks.
Proxy of _project hooks_

### Docs

Open the documentation.

### Help

Display help.

#### Options

- `--detail`: Detail help.

### *

Any other command is not supported.

## Development

Reference: https://sheetbase.github.io/cli

## Lisence

Sheetbase CLI is released under the [Apache-2.0](https://github.com/sheetbase/cli/blob/master/LICENSE) license.

<!-- <block:footer> -->

[license_badge]: https://img.shields.io/hexpm/l/plug.svg
[license_url]: https://github.com/sheetbase/cli/blob/master/LICENSE

[badge_patreon]: https://ionicabizau.github.io/badges/patreon.svg
[patreon_url]: https://www.patreon.com/lamnhan

[badge_paypal_donate]: https://ionicabizau.github.io/badges/paypal_donate.svg
[paypal_donate_url]: https://www.paypal.me/lamnhan

[badge_ask_me]: https://img.shields.io/badge/ask/me-anything-1abc9c.svg
[ask_me_url]: https://m.me/sheetbase

<!-- </block:footer> -->