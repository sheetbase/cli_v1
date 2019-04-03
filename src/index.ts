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
import { updateCommand, checkUpdate } from './commands/update/update';
import { unknownCommand } from './commands/unknown/unknown';

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
 * Sub-commands: list|ls, connect|add, disconnect|remove|rm, default.
 * @name google
 * @param {string?} [subCommand] Supported sub-commands.
 * @param {string[]?} [params] Command params, comma-separated.
 * @param {boolean?} [-y,--yes] (connect) Agree on account connection.
 * @param {boolean?} [-c,--creds] (connect) Save credential to .googlerc.json.
 * @param {boolean?} [-f,--full] (connect) Not recommended, grant full access to Drive.
 * @param {boolean?} [-d,--default] (list) Show default account only.
 */
program
  .command('google [subCommand] [params...]')
  .description('Manage Google accounts.')
  .option('-y, --yes', `(${chalk.green('connect')}) Agree on account connection.`)
  .option('-c, --creds', `(${chalk.green('connect')}) Save credential to .googlerc.json.`)
  .option('-f, --full',
    `(${chalk.green('connect')}) ${chalk.red('Not recommended')}, ` +
    `grant full access to Drive.`,
  )
  .option('-d, --default', `(${chalk.green('list')}) Show default account only.`)
  .action(googleCommand);

/**
 * Project general tasks.
 * Sub-commands: start, setup, configs, config, urls, url, info, build, deploy, preview, models, model.
 * @name project
 * @param {string?} [subCommand] Supported sub-commands.
 * @param {string[]?} [params] Command params, comma-separated.
 * @param {boolean?} [-i,--install] (start) Install npm packages.
 * @param {boolean?} [-x,--no-setup] (start) Do not run setup command.
 * @param {boolean?} [-r,--re-setup] (setup) Force re-setup.
 * @param {boolean?} [-o,--open] (url) Open the url in browser.
 * @param {string?} [-d,--database] (model) Custom database.
 * @param {boolean?} [-c,--clean] (model) Remove the default 'Sheet1'.
 * @param {boolean?} [-b,--backend] (build, deploy) Build or deploy backend only.
 * @param {boolean?} [-f,--frontend] (build, deploy) Build or deploy frontend only.
 * @param {string?} [-m,--message] (deploy) Deployment message.
 */
program
  .command('project [subCommand] [params...]')
  .description('Project general tasks.')
  .option('-i, --install', `(${chalk.green('start')}) Install npm packages.`)
  .option('-x, --no-setup', `(${chalk.green('start')}) Do not run setup command.`)
  .option('-r, --re-setup', `(${chalk.green('setup')}) Force re-setup.`)
  .option('-o, --open', `(${chalk.green('url')}) Open the url in browser.`)
  .option('-d, --database [value]', `(${chalk.green('model')}) Custom database.`)
  .option('-c, --clean', `(${chalk.green('model')}) Remove the default 'Sheet1'.`)
  .option('-b, --backend', `(${chalk.green('build, deploy')}) Build or deploy backend only.`)
  .option('-f, --frontend', `(${chalk.green('build, deploy')}) Build or deploy frontend only.`)
  .option('-m, --message [value]', `(${chalk.green('deploy')}) Deployment message.`)
  .action(projectCommand);

/**
 * Start a new project.
 * Proxy of **project start**
 * @name start
 * @param {string?} [projectName] Name of the project, auto default.
 * @param {string?} [resource] Resource to create the project with, default to theme **blank_angular**.
 * @param {boolean?} [-i,--install] Install npm packages.
 * @param {boolean?} [-x,--no-setup] Do not run setup command.
 */
program
  .command('start [projectName] [resource]')
  .description('Start a new project.')
  .option('-i, --install', 'Install npm packages.')
  .option('-x, --no-setup', 'Do not run setup command.')
  .action((projectName, resource, options) => projectCommand(
    'start', [projectName, resource], options,
  ));

/**
 * Setup the project.
 * Proxy of **project setup**
 * @name setup
 * @param {boolean?} [-r,--re-setup] Force re-setup.
 */
program
  .command('setup')
  .description('Setup the project.')
  .option('-r, --re-setup', `Force re-setup.`)
  .action(() => projectCommand('setup'));

/**
 * View project configs.
 * Proxy of **project configs**
 * @name configs
 */
program
  .command('configs')
  .description('View project configs.')
  .action(() => projectCommand('configs'));

/**
 * Config the project.
 * Proxy of **project config**
 * Sub-commands: list, update, import, export
 * @name config
 * @param {string?} [subCommand] Optional supported sub-commands, default: **list**.
 * @param {string[]?} [params] Command params, comma-separated.
 */
program
  .command('config [subCommand] [params...]')
  .description('Config the project.')
  .action((subCommand, params) => projectCommand('config', [subCommand, ... params]));

/**
 * View project URLs.
 * Proxy of **project urls**
 * @name urls
 */
program
  .command('urls')
  .description(`View project URLs.`)
  .action(() => projectCommand('urls'));

/**
 * View or open a project URL.
 * Proxy of **project url**
 * @name url
 * @param {string?} [name] Url name to view or open with.
 * @param {boolean?} [-o,--open] Open the url in browser.
 */
program
  .command('url [name]')
  .description(`View or open a project URL.`)
  .option('-o, --open', `Open the url in browser.`)
  .action((name, options) => projectCommand('url', [name], options));

/**
 * View project models.
 * Proxy of **project models**
 * @name models
 */
program
  .command('models')
  .description(`View project models.`)
  .action(() => projectCommand('models'));

/**
 * Create database models.
 * Proxy of **project model**
 * @name model
 * @param {string[]?} [schemaFiles] List of schema files.
 * @param {string?} [-d,--database] Custom database.
 * @param {boolean?} [-c,--clean] Remove the default 'Sheet1'.
 */
program
  .command('model [schemaFiles...]')
  .description(`Create database models.`)
  .option('-d, --database [value]', `Custom database.`)
  .option('-c, --clean', `Remove the default 'Sheet1'.`)
  .action((schemaFiles, options) => projectCommand('model', schemaFiles, options));

/**
 * Output project info.
 * Proxy of **project info**
 * @name info
 */
program
  .command('info')
  .description(`Output project info.`)
  .action(() => projectCommand('info'));

/**
 * Build the project.
 * Proxy of **project build**
 * @name build
 * @param {boolean?} [-b,--backend] Build backend only.
 * @param {boolean?} [-f,--frontend] Build frontend only.
 */
program
  .command('build')
  .description(`Build the project.`)
  .option('-b, --backend', `Build backend only.`)
  .option('-f, --frontend', `Build frontend only.`)
  .action((options) => projectCommand('build', [], options));

/**
 * Deploy the project.
 * Proxy of **project deploy**
 * @name deploy
 * @param {boolean?} [-b,--backend] Deploy backend only.
 * @param {boolean?} [-f,--frontend] Deploy frontend only.
 * @param {string?} [-m,--message] Deployment message.
 */
program
  .command('deploy')
  .description(`Deploy the project.`)
  .option('-b, --backend', `Deploy backend only.`)
  .option('-f, --frontend', `Deploy frontend only.`)
  .option('-m, --message [value]', `Deployment message.`)
  .action((options) => projectCommand('deploy', [], options));

/**
 * Preview the project.
 * Proxy of **project preview**
 * @name preview
 */
program
  .command('preview')
  .description(`Preview the project.`)
  .action(() => projectCommand('preview'));

/**
 * Run backend related commands.
 * @name backend
 * @param {string?} [subCommand] Optional supported sub-commands.
 * @param {string?} [-m,--message] Deployment message.
 */
program
  .command('backend [subCommand]')
  .description('Run backend related commands.')
  .option('-m, --message [value]', `Deployment message.`)
  .allowUnknownOption()
  .action(backendCommand);

/**
 * Run frontend related commands.
 * @name frontend
 * @param {string?} [subCommand] Optional supported sub-commands.
 * @param {string?} [-m,--message] Deployment message.
 * @param {string?} [-f,--force] Force prerender all or certain parts.
 * @param {string?} [-o,--only] Prerender only certain parts.
 */
program
  .command('frontend [subCommand]')
  .description('Run frontend related commands.')
  .option('-m, --message [value]', `Deployment message.`)
  .option('-f, --force [value]', `Force prerender all or certain parts.`)
  .option('-o, --only [value]', `Prerender only certain parts.`)
  .allowUnknownOption()
  .action(frontendCommand);

/**
 * Open the documentation.
 * @name docs
 */
program
  .command('docs')
  .description('Open the documentation.')
  .action(docsCommand);

/**
 * Check and install update.
 * @name update
 * @param {boolean?} [-y,--yes] Install update when available.
 */
program
  .command('update')
  .description('Check and install update.')
  .option('-y, --yes', `Install update when available.`)
  .action(updateCommand);

/**
 * Display help.
 * @name help
 * @param {string?} [-d,--detail] Detail help.
 */
program
  .command('help')
  .description('Display help.')
  .option('-d, --detail', 'Detail help.')
  .action(helpCommand);

program
  .on('--help', () => { clear(); return helpCommand(); });

/**
 * Any other command will run: npm run <cmd>.
 * @name *
 */
program
  .command('*', 'Any other command will run: npm run [cmd].')
  .action(unknownCommand);

// check update
if (process.argv.slice(2)[0] !== 'update') {
  checkUpdate();
}

// show help
if (!process.argv.slice(2).length) {
  helpCommand();
}

program.parse(process.argv);
