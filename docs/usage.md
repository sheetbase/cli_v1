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
Sub-commands: list, open

#### Options

- `subCommand`: Optional supported sub-commands, default: _list_.
- `params`: Command params, comma-separated.

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