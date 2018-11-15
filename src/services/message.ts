import chalk from 'chalk';

export const error = `[${chalk.red('ERROR')}]`;
export const warn = `[${chalk.yellow('WARN')}]`;
export const info = `[${chalk.blue('INFO')}]`;
export const wait = `[${chalk.magenta('WAIT')}]`;

export function logError(message: string): void {
    console.error(`\n ${error} ${message}`);
    return process.exit(1);
}
export function logWarn(message: string): void {
    console.log(`\n ${warn} ${message}`);
}
export function logInfo(message: string): void {
    console.log(`\n ${info} ${message}`);
}
export function logWait(message: string): void {
    console.log(`\n ${wait} ${message}`);
}

export const ERROR = {
    UNKNOWN_COMMAND: (cmd?: string) => `Unknown command "${cmd}".`,
    INVALID_PROJECT: `Not in a Sheetbase project.`,
    INVALID_SUBCOMMAND: (cmd?: string) => `Not supported sub-command "${cmd || 'n/a'}".`,
    HOOK_ERROR: (err: any) => `Hook error:
    ${err}`,
    INVALID_EMAIL_PASSWORD: `Invalid email or password.`,
    LOGIN_FAILS: `Login fails.`,
    LOGOUT_FAILS: `Logout fails.`,
    SIGNUP_FAILS: `Signup fails.`,
    NOT_LOGGED_IN: `You have not logged in yet!` +
        `\n To login, run $ ` + chalk.green('sheetbase login'),
    PROFILE_GET_FAILS: `Errors getting profile.`,
    PROFILE_UPDATE_FAILS: `Errors updating profile.`,
    PROFILE_NO_VALUE: `No profile value argument.`,
    GOOGLE_CONNECT_FAILS: `Google connect fails.`,
    GOOGLE_DEFAULT_FAILS: `Errors updating default account`,
    GOOGLE_NO_ID: `No account <id>|default|all|local.`,
    GOOGLE_DISCONNECT_FAILS: `Google disconnect fails`,
    GOOGLE_NO_ACCOUNT: `No account connected!` +
        `\n To connect an account: $ ${chalk.green('sheetbase google connect')}`,
    CONFIG_NO_VALUE: `No configs value argument.`,
    CONFIG_UPDATE_FAILS: `Config update fails.`,
    CONFIG_EXPORT_FAILS: `Config export fails`,
    CONFIG_IMPORT_FAILS: `Config import fails`,
    CONFIG_IMPORT_NO_FILE: `No config file.`,
    CONFIG_GENERATE_FAILS: `Config generate fails`,
    URLS_OPEN_FAILS: `Urls open fails`,
    URLS_LIST_FAILS: `Urls list fails`,
    PROJECT_EXISTS: `Project exists, try different name.`,
    START_INVALID_THEME: `Invalid theme argument.`,
    START_FAILED: `Create project failed.`,
    NPM_INSTALL_FAILED: `Install dependencies failed.`,
};

export const LOG = {
    LINK_OPENED: (link: string) => `Link opened in browser: ${link}`,
    ALREADY_LOGGED_IN: 'You have logged in already!' +
        '\n See your profile: $ ' + chalk.green('sheetbase profile'),
    LOGIN_SUCCESS: 'Login success!',
    LOGOUT_SUCCESS: 'You logged out!',
    SIGNUP_SUCCESS: 'Account created!' +
        '\n You can use it in the CLI or Sheetbase Cloud at ' +
    chalk.blue('https://cloud.sheetbase.net/login') + '.',
    ACCOUNT_UPGRADE: 'To upgrade you account, please login to your Sheetbase Cloud on the web. ' +
    'Link:' + chalk.blue('https://cloud.sheetbase.net/account'),
    PROFILE_UPDATE: 'Profile updated!' +
        '\n See your profile: $ ' + chalk.green('sheetbase profile'),
    GOOGLE_CONNECT: `Account connected!` +
        `\n To see connected accounts: $ ${chalk.yellow('sheetbase google list')}.`,
    GOOGLE_CONNECT_CREDS: `Data saved to .googlerc.json, please keep the file SECRET.`,
    GOOGLE_DEFAULT: (id: string) => `Default account set to: ${chalk.green(id)}.`,
    GOOGLE_DISCONNECT: `Google account disconnected!` +
        `\n You may also remove Sheetbase from your Google account permissions: ` +
        `${chalk.green('https://myaccount.google.com/permissions')}.`,
    GOOGLE_LIST: `  + To connect/re-connect an account: $ ${chalk.yellow('sheetbase google connect')}` +
        `\n  + To remove accounts: $ ` +
        `${chalk.yellow('sheetbase google disconnect <ID>|default|all|local')}` +
        `\n  + To set default account: $ ${chalk.yellow('sheetbase google default <ID>')}`,
    CONFIG_EXPORT: (path: string) => `Configs exported to: ${chalk.green(path)}.`,
    CONFIG_IMPORT: `Config imported.`,
    CONFIG_LIST: '  + To set/update configs: $ ' +
        `${chalk.yellow('sheetbase config update <key1>=<value1> <key2>=<value2> ...')}` +
        `\n  + To view URLs: $ ${chalk.yellow('sheetbase urls')}`,
    CONFIG_UPDATE: 'Configs updated!' +
        `\n To see configs: $ ${chalk.yellow('sheetbase config')}`,
    URLS_OPEN: 'See full list: $ ' + chalk.yellow('sheetbase urls'),
    URLS_LIST: `  + To open link in browser: $ ${chalk.yellow('sheetbase urls open <name>')}`,
    START_BEGIN: `Creating new Sheebase project ...`,
    START_SUCCEED: (name: string) => `New project created under "${chalk.bold(name)}".`,
    PROJECT_START: (name: string) => `Next steps:` +
        `\n   cd ${name}`,
    NPM_INSTALL_BEGIN: `Installing dependencies ... (could take several minutes)`,
    NPM_INSTALL_SUCCEED: `Dependencies installed.`,
    PROJECT_SETUP: (url: string) => `Project setup succeed!` +
    `You can found backend code at: ${url}`,
};