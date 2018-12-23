import chalk from 'chalk';

const green = chalk.green;
const yellow = chalk.yellow;
const red = chalk.red;

function exp(): string {
    return red('(experimental)');
}

function beta(): string {
    return yellow('(beta)');
}

export function help(): string {
    return '' +
`
 Global commands:

    ${green('help')} ....................... Display help.
    ${green('docs')} ....................... Open the documentation.
    ${green('google [subcommand]')} ........ ${beta()} Manage Google accounts.
    ${green('start [name] [resource]')} .... Start a new project.

 Project commands:

    ${green('setup')} ......................... Setup the project.
    ${green('configs')} ....................... View project configs.
    ${green('config [subcommand]')} ........... Config backend & frontend.
    ${green('info')} .......................... Output project info.
    ${green('urls')} .......................... View project URLs.
    ${green('url [name]')} .................... View or open a project URL.
    ${green('models')} ........................ View project models.
    ${green('model [id]')} .................... Create model.`;
}

export function helpDetail(): string {
    return '' +
`
 Command groups:

    ${green('google [subcommand]')} ..... ${(
        beta() + ' ' +
        'Manage Google accounts ' +
        `(subcommands: ${green('list')}, ${green('connect')}, ` +
        `${green('disconnect')}, ${green('default')})`
    )}
    ${green('project [subcommand]')} .... ${(
        'Project general tasks ' +
        `(subcommands: ${green('start')}, ${green('setup')}, ` +
        `${green('config')}, ${green('urls')}, ${green('info')})`
    )}

 Google subcommands:
${googleHelp()}

 Project subcommands:
${projectHelp()}`;
}

export function googleHelp(): string {
    return '' +
    `
    ${green('list')} .................... List connected accounts.
    ${green('connect')} ................. Connect an account.
    ${green('disconnect [id]')} ......... Disconnect an account.
    ${green('default [id]')} ............ Change the default account.`;
}

export function projectHelp(): string {
    return '' +
    `
    ${green('start [name] [resource]')} ....... Start a new project.
    ${green('setup')} ......................... Setup the project.
    ${green('configs')} ....................... View project configs.
    ${green('config [subcommand]')} ........... Config backend & frontend.
    ${green('info')} .......................... Output project info.
    ${green('urls')} .......................... View project URLs.
    ${green('url [name]')} .................... View or open a project URL.
    ${green('models')} ........................ View project models.
    ${green('model [id]')} .................... Create model.`;
}
