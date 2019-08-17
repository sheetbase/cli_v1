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
- `-x,--no-setup`: (start) Do not run setup command.
- `-r,--re-setup`: (setup) Force re-setup.
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
- `-x,--no-setup`: Do not run setup command.

### `Setup`

Setup the project.
Proxy of **project setup**

- `-r,--re-setup`: Force re-setup.

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