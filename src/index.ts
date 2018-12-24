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
 * Sheetbase CLI – Official tool for working with Sheetbase project.
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
 * @param {string?} [--open] (url) Open the url in browser.
 * @param {string?} [--database] (model) Custom database.
 * @param {string?} [--clean] (model) Remove the default 'Sheet1'.
 */
program
  .command('project [subCommand] [params...]')
  .option('-n, --npm', `(${chalk.green('start')}) Install npm packages.`)
  .option('-s, --setup', `(${chalk.green('start')}) Run setup command.`)
  .option('-o, --open', `(${chalk.green('url')}) Open the url in browser.`)
  .option('-d, --database [value]', `(${chalk.green('model')}) Custom database.`)
  .option('-c, --clean', `(${chalk.green('model')}) Remove the default 'Sheet1'.`)
  .description('Project general tasks.')
  .action(projectCommand);

/**
 * Start a new project.
 * Proxy of _project start_
 * @name start
 * @param {string?} [projectName] Name of the project, auto default.
 * @param {string?} [resource] Theme or template to create the project with, default to theme _blank_angular_.
 * @param {string?} [--npm] Install npm packages.
 * @param {string?} [--setup] Run setup command.
 */
program
  .command('start [projectName] [resource]')
  .option('--npm', 'Install npm packages.')
  .option('--setup', 'Run setup command.')
  .description('Start a new project.')
  .action(async (projectName, theme, options) => projectCommand(
    'start', [projectName, theme], options,
  ));

/**
 * Setup the project.
 * Proxy of _project setup_
 * @name setup
 */
program
  .command('setup')
  .description('Setup the project.')
  .action(async () => projectCommand('setup'));

/**
 * View project configs.
 * Proxy of _project configs_
 * @name configs
 */
program
  .command('configs')
  .description('View project configs.')
  .action(async () => await projectCommand('configs'));

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
  .action(async (subCommand, params) => await projectCommand(
    'config', [subCommand, ... params],
  ));

/**
 * View project URLs.
 * Proxy of _project urls_
 * @name urls
 */
program
  .command('urls')
  .description(`View project URLs.`)
  .action(async () => await projectCommand('urls'));

/**
 * View or open a project URL.
 * Proxy of _project url_
 * @name url
 * @param {string?} [--open] Open the url in browser.
 */
program
  .command('url [name]')
  .option('-o, --open', `Open the url in browser.`)
  .description(`View or open a project URL.`)
  .action(async (name, options) => await projectCommand('url', [name], options));

/**
 * View project models.
 * Proxy of _project models_
 * @name models
 */
program
  .command('models')
  .description(`View project models.`)
  .action(async () => await projectCommand('models'));

/**
 * Create model.
 * Proxy of _project model_
 * @name model
 * @param {string?} [--database] Custom database.
 * @param {string?} [--clean] Remove the default 'Sheet1'.
 */
program
  .command('model [schemaFiles...]')
  .option('-d, --database [value]', `Custom database.`)
  .option('-c, --clean', `Remove the default 'Sheet1'.`)
  .description(`Create model.`)
  .action(async (schemaFiles, options) => await projectCommand('model', schemaFiles, options));

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
  .command('*', `Any other command will run: ${chalk.green('npm run <cmd>')}.`)
  .action(defaultCommand);

if (!process.argv.slice(2).length) {
  helpCommand();
}

program.parse(process.argv);
