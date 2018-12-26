import chalk from 'chalk';

const green = chalk.green;

export function help(): string {
    return '' +
`
 Global commands:

    ${green('google [subcommand]')} ........ Manage Google accounts.
    ${green('start [name] [resource]')} .... Start a new project.
    ${green('docs')} ....................... Open the documentation.
    ${green('update')} ..................... Check and install update.
    ${green('help')} ....................... Display help.

 Project commands:

    ${green('setup')} ...................... Setup the project.
    ${green('configs')} .................... View project configs.
    ${green('config [subcommand]')} ........ Config the project.
    ${green('urls')} ....................... View project URLs.
    ${green('url [name]')} ................. View or open a project URL.
    ${green('models')} ..................... View project models.
    ${green('model [schemaFiles]')} ........ Create database models.
    ${green('info')} ....................... Output project info.
    ${green('backend [subcommand]')} ....... Run backend related commands.
    ${green('frontend [subcommand]')} ...... Run frontend related commands.`;
}

export function helpDetail(): string {
    return '' +
`
General commands:

    ${green('docs')} ....................... Open the documentation.
    ${green('update')} ..................... Check and install update.
    ${green('help')} ....................... Display help.

 Command groups:

    ${green('google [subcommand]')} ........ Manage Google accounts.
    ${green('project [subcommand]')} ....... Project general tasks.

 Google sub-commands:
${googleHelp()}

 Project sub-commands:
${projectHelp()}`;
}

export function googleHelp(): string {
    return '' +
    `
    ${green('list')} ....................... List connected accounts.
    ${green('connect')} .................... Connect an account.
    ${green('disconnect [input]')} ......... Disconnect an account.
    ${green('default [id]')} ............... Change the default account.`;
}

export function projectHelp(): string {
    return '' +
    `
    ${green('start [name] [resource]')} .... Start a new project.
    ${green('setup')} ...................... Setup the project.
    ${green('configs')} .................... View project configs.
    ${green('config [subcommand]')} ........ Config the project.
    ${green('urls')} ....................... View project URLs.
    ${green('url [name]')} ................. View or open a project URL.
    ${green('models')} ..................... View project models.
    ${green('model [schemaFiles]')} ........ Create database models.
    ${green('info')} ....................... Output project info.
    ${green('backend [subcommand]')} ....... Run backend related commands.
    ${green('frontend [subcommand]')} ...... Run frontend related commands.`;
}
