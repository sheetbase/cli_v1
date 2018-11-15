#!/usr/bin/env node

/**
 * @license
 * Copyright Sheetbase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Sheetbase CLI – Official tool for working with Sheetbase.
 */

import chalk from 'chalk';
import * as program from 'commander';
import * as clear from 'clear';

import { accountCommand } from './commands/account/account';
import { googleCommand } from './commands/google/google';
import { projectCommand } from './commands/project/project';
import { docsCommand } from './commands/docs/docs';
import { backendCommand } from './commands/backend/backend';
import { frontendCommand } from './commands/frontend/frontend';
import { helpCommand } from './commands/help/help';
import { defaultCommand } from './commands/default/default';

export const version = require('../package.json').version;

/**
 * Set global CLI configurations
 */
program
  .version(version, '-v, --version')
  .description('Sheetbase CLI')
  .usage('sheetbase <command> [<args>] [--help] [options]');

/**
 * Manage Sheetbase account.
 * Sub-commands: login, logout, signup, profile, upgrade.
 * @name account
 * @param {string?} [subCommand] Supported sub-commands.
 * @param {string?} [params] Command params, comma-separated.
 * @param {string?} [--web] (login) Login using web UI.
 * @param {string?} [--force] (login) Force login again.
 * @param {string?} [--no-cache] (profile) Do not caching user-related info.
 */
program
  .command('account [subCommand] [params...]')
  .option('-w, --web', `(${chalk.green('login')}) Login using web UI.`)
  .option('-f, --force', `(${chalk.green('login')}) Force login again.`)
  .option('--no-cache', `(${chalk.green('profile')}) Do not caching user-related info.`)
  .description('Manage Sheetbase account.')
  .action(accountCommand);

/**
 * Login to Sheetbase Cloud account.
 * Proxy of _account login_
 * @name login
 * @param {string?} [--web] Using web UI.
 * @param {string?} [--force] Force login again.
 */
program
  .command('login')
  .option('-w, --web', 'Using web UI.')
  .option('-f, --force', 'Force login again.')
  .description('Login to Sheetbase Cloud account.')
  .action(async (options) => await accountCommand('login', [], options));

/**
 * Logout of your Sheetbase Cloud account.
 * Proxy of _account logout_
 * @name logout
 */
program
  .command('logout')
  .description('Logout of your Sheetbase Cloud account.')
  .action(async () => await accountCommand('logout'));

/**
 * Create a Sheetbase Cloud account.
 * Proxy of _account signup_
 * @name signup
 */
program
  .command('signup')
  .description('Create a Sheetbase Cloud account.')
  .action(async () => await accountCommand('signup'));

/**
 * Manage Sheetbase account profile.
 * Proxy of _account profile_
 * Sub-commands: get, open, update
 * @name profile
 * @param {string?} [subCommand] Optional supported sub-commands, default: _get_.
 * @param {string?} [params] Command params, comma-separated.
 * @param {string?} [--no-cache] Do not cache user-related info.
 */
program
  .command('profile [subCommand] [params...]')
  .option('--no-cache', `Do not cache user-related info.`)
  .description('Manage Sheetbase account profile.')
  .action(async (subCommand, params, options) => await accountCommand(
    'profile', [subCommand, ... params], options,
  ));

/**
 * Manage Google accounts.
 * Sub-commands: list, connect, disconnect, default.
 * @name google
 * @param {string?} [subCommand] Supported sub-commands.
 * @param {string?} [params] Command params, comma-separated.
 * @param {string?} [--yes] (connect) Agree on account connection.
 * @param {string?} [--creds] (connect) Save credential to .googlerc.json.
 * @param {string?} [--full-drive] (connect) Not recommended, grant full access to Drive.
 * @param {string?} [--default] (list) Show default account only.
 */
program
  .command('google [subCommand] [params...]')
  .option('-y, --yes', `(${chalk.green('connect')}) Agree on account connection.`)
  .option('-c, --creds', `(${chalk.green('connect')}) Save credential to .googlerc.json.`)
  .option('-f, --full-drive',
    `(${chalk.green('connect')}) ${chalk.red('Not recommended')}, ` +
    `grant full access to Drive.`,
  )
  .option('-d, --default', `(${chalk.green('list')}) Show default account only.`)
  .description('Manage Google accounts.')
  .action(googleCommand);

/**
 * Project general tasks.
 * Sub-commands: start, setup, config, urls, info, hooks.
 * @name project
 * @param {string?} [subCommand] Supported sub-commands.
 * @param {string?} [params] Command params, comma-separated.
 * @param {string?} [--no-setup] (start) Do not run setup command.
 * @param {string?} [--no-npm] (start) Do not install packages.
 * @param {string?} [--no-hook] (start, setup, config, urls) Do not run hook.
 * @param {string?} [--trusted] (setup) Trusted to run sensitive actions.
 * @param {string?} [--no-backend-deploy] (setup) Do not initial deploy the backend.
 */
program
  .command('project [subCommand] [params...]')
  .option('--no-setup', `(${chalk.green('start')}) Do not run setup command.`)
  .option('--no-npm', `(${chalk.green('start')}) Do not install packages.`)
  .option('--no-hook', '(' +
    `${chalk.green('start')}, ${chalk.green('setup')}, ${chalk.green('config')}, ${chalk.green('urls')}` +
  ') Do not run hook.')
  .option('--trusted', `(${chalk.green('setup')}) Trusted to run sensitive actions.`)
  .option('--no-backend-deploy', `(${chalk.green('setup')}) Do not initial deploy the backend.`)
  .description('Project general tasks.')
  .action(projectCommand);

/**
 * Start a new project.
 * Proxy of _project start_
 * @name start
 * @param {string?} [projectName] Name of the project, auto default.
 * @param {string?} [theme] Theme to create the project with, default to _basic_angular_.
 * @param {string?} [--no-npm] Do not install packages.
 * @param {string?} [--no-setup] Do not run setup command.
 * @param {string?} [--no-hook] Do not run setup hook.
 * @param {string?} [--trusted] Trusted to run setup sensitive actions.
 * @param {string?} [--no-backend-deploy] Do not initial deploy the backend.
 */
program
  .command('start [projectName] [theme]')
  .option('--no-npm', 'Do not install packages.')
  .option('--no-setup', 'Do not run setup command.')
  /* setup options */
  .option('--no-hook', 'Do not run setup hook.')
  .option('--trusted', 'Trusted to run setup sensitive actions.')
  .option('--no-backend-deploy', 'Do not initial deploy the backend.')
  .description('Start a new project.')
  .action(async (projectName, theme, options) => projectCommand('start', [projectName, theme], options));

/**
 * Setup the project.
 * Proxy of _project setup_
 * @name setup
 * @param {string?} [--trusted] Trusted to run sensitive actions.
 * @param {string?} [--no-hook] Do not run hook.
 * @param {string?} [--no-backend-deploy] Do not initial deploy the backend.
 */
program
  .command('setup')
  .option('--trusted', 'Trusted to run sensitive actions.')
  .option('--no-hook', 'Do not run hook.')
  .option('--no-backend-deploy', 'Do not initial deploy the backend.')
  .description('Setup the project.')
  .action(async (options) => projectCommand('setup', [], { npm: false, ... options}));

/**
 * Config backend & frontend.
 * Proxy of _project config_
 * Sub-commands: list, update, import, export
 * @name config
 * @param {string?} [subCommand] Optional supported sub-commands, default: _list_.
 * @param {string?} [params] Command params, comma-separated.
 * @param {string?} [--no-hook] Do not run hook.
 */
program
  .command('config [subCommand] [params...]')
  .option('--no-hook', 'Don not run hook.')
  .description('Config backend & frontend.')
  .action(async (subCommand, params, options) => await projectCommand(
    'config', [subCommand, ... params], options,
  ));

/**
 * View project URLs.
 * Proxy of _project urls_
 * Sub-commands: list, open
 * @name urls
 * @param {string?} [subCommand] Optional supported sub-commands, default: _list_.
 * @param {string?} [params] Command params, comma-separated.
 * @param {string?} [--no-hook] Do not run hook.
 */
program
  .command('urls [subCommand] [params...]')
  .option('--no-hook', 'Don not run hook.')
  .description(`View project URLs.`)
  .action(async (subCommand, params, options) => await projectCommand(
    'urls', [subCommand, ... params], options,
  ));

/**
 * Output project info.
 * Proxy of _project info_
 * @name info
 */
program
  .command('info')
  .description(`Output project info.`)
  .action(async () => await projectCommand('info'));

/**
 * Output list of hooks.
 * Proxy of _project hooks_
 * @name hooks
 */
program
  .command('hooks')
  .description(`Output list of hooks.`)
  .action(async () => await projectCommand('hooks'));

/**
 * Open the documentation.
 * @name docs
 */
program
  .command('docs')
  .description('Open the documentation.')
  .action(docsCommand);

/**
 * Run backend related command.
 * @name backend
 */
program
  .command('backend [subCommand]')
  .description('Run backend related command.')
  .action(backendCommand);

/**
 * Run frontend related command.
 * @name frontend
 */
program
  .command('frontend [subCommand]')
  .description('Run frontend related command.')
  .action(frontendCommand);

/**
 * Display help.
 * @name help
 * @param {string?} [--detail] Detail help.
 */
program
  .command('help')
  .option('-d, --detail', 'Detail help.')
  .description('Display help.')
  .action((options) => helpCommand(options));

program
  .on('--help', () => { clear(); return helpCommand(); });

/**
 * Any other command ends of running: npm run <cmd>.
 * @name *
 */
program
  .command('*', `Any other command ends of running: ${chalk.green('npm run <cmd>')}.`)
  .action(defaultCommand);

if (!process.argv.slice(2).length) {
  helpCommand();
}

program.parse(process.argv);
