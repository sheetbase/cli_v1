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
 * @param {string?} [--npm] (start) Install npm packages.
 * @param {string?} [--setup] (start) Run setup command.
 */
program
  .command('project [subCommand] [params...]')
  .option('--npm', `(${chalk.green('start')}) Install npm packages.`)
  .option('--setup', `(${chalk.green('start')}) Run setup command.`)
  .description('Project general tasks.')
  .action(projectCommand);

/**
 * Start a new project.
 * Proxy of _project start_
 * @name start
 * @param {string?} [projectName] Name of the project, auto default.
 * @param {string?} [resource] Theme to create the project with, default to theme _basic_angular_.
 * @param {string?} [--npm] Install npm packages.
 * @param {string?} [--setup] Run setup command.
 */
program
  .command('start [projectName] [resource]')
  .option('--npm', 'Install npm packages.')
  .option('--setup', 'Run setup command.')
  .description('Start a new project.')
  .action(async (projectName, theme, options) => projectCommand('start', [projectName, theme], options));

/**
 * Setup the project.
 * Proxy of _project setup_
 * @name setup
 */
program
  .command('setup')
  .description('Setup the project.')
  .action(async (options) => projectCommand('setup', [], { npm: false, ... options}));

/**
 * Config backend & frontend.
 * Proxy of _project config_
 * Sub-commands: list, update, import, export
 * @name config
 * @param {string?} [subCommand] Optional supported sub-commands, default: _list_.
 * @param {string?} [params] Command params, comma-separated.
 */
program
  .command('config [subCommand] [params...]')
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
 */
program
  .command('urls [subCommand] [params...]')
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
