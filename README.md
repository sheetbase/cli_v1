# Sheetbase CLI

Official CLI for working with Sheetbase.

<!-- <block:header> -->

[![Build Status](https://travis-ci.org/Sheetbase/cli.svg?branch=master)](https://travis-ci.org/Sheetbase/cli) [![Coverage Status](https://coveralls.io/repos/github/Sheetbase/cli/badge.svg?branch=master)](https://coveralls.io/github/Sheetbase/cli?branch=master) [![NPM](https://img.shields.io/npm/v/@sheetbase/cli.svg)](https://github.com/Sheetbase/cli) [![License][license_badge]][license_url] [![Support me on Patreon][badge_patreon]][patreon_url] [![PayPal][badge_paypal_donate]][paypal_donate_url] [![Ask me anything][badge_ask_me]][ask_me_url]

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

## Development

Reference: https://sheetbase.github.io/cli/api

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

### Start

Start a new project.
Proxy of _project start_

#### Options

- `projectName`: Name of the project, auto default.
- `theme`: Theme to create the project with, default to _basic_angular_.
- `--no-setup`: Do not run setup command.
- `--no-npm`: Do not install packages.
- `--no-hook`: Do not run setup hook.

### Setup

Setup the project.
Proxy of _project setup_

#### Options

- `--no-hook`: Do not run hook.

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