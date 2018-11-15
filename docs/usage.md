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
- `--no-npm`: (start) Do not install packages.
- `--no-setup`: (start) Do not run setup command.
- `--app`: (start) Start a backend app.
- `--module`: (start) Start a backend module.
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
- `--app`: Start a backend app.
- `--module`: Start a backend module.
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