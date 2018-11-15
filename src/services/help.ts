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

    ${green('help')} .................... Display help.
    ${green('docs')} .................... Open the documentation.
    ${green('login')} ................... ${exp()} Login to Sheetbase Cloud account.
    ${green('logout')} .................. ${exp()} Logout of your Sheetbase Cloud account.
    ${green('signup')} .................. ${exp()} Create a Sheetbase Cloud account.
    ${green('profile [subcommand]')} .... ${exp()} Manage Sheetbase account profile.
    ${green('google [subcommand]')} ..... ${beta()} Manage Google accounts.
    ${green('start [name] [theme]')} .... Start a new project.

 Project commands:

    ${green('setup')} ................... Setup the project.
    ${green('config [subcommand]')} ..... Config backend & frontend.
    ${green('info')} .................... Output project info.
    ${green('urls')} .................... View project URLs.
    ${green('hooks')} ................... ${exp()} Output list of hooks.`;
}

export function helpDetail(): string {
    return '' +
`
 Command groups:

    ${green('account [subcommand]')} .... ${(
        exp() + ' ' +
        'Manage Sheetbase account ' +
        `(subcommands: ${green('login')}, ${green('logout')}, ${green('signup')}, ` +
        `${green('profile')}, ${green('upgrade')})`
    )}
    ${green('google [subcommand]')} ..... ${(
        beta() + ' ' +
        'Manage Google accounts ' +
        `(subcommands: ${green('list')}, ${green('connect')}, ` +
        `${green('disconnect')}, ${green('default')})`
    )}
    ${green('project [subcommand]')} .... ${(
        'Project general tasks ' +
        `(subcommands: ${green('start')}, ${green('setup')}, ` +
        `${green('config')}, ${green('urls')}, ${green('info')}, ${green('hooks')})`
    )}

 Account subcommands:
${accountHelp()}

 Google subcommands:
${googleHelp()}

 Project subcommands:
${projectHelp()}`;
}

export function accountHelp(): string {
    return '' +
    `
    ${green('login')} ................... Login to Sheetbase Cloud account.
    ${green('logout')} .................. Logout of your Sheetbase Cloud account.
    ${green('signup')} .................. Create a Sheetbase Cloud account.
    ${green('profile [subcommand]')} .... Manage Sheetbase account profile.`;
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
    ${green('start [name] [theme]')} .... Start a new project.
    ${green('setup')} ................... Setup the project.
    ${green('config [subcommand]')} ..... Config backend & frontend.
    ${green('urls')} .................... View project URLs.
    ${green('info')} .................... Output project info.
    ${green('hooks')} ................... Output list of hooks.`;
}
