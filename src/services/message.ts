// tslint:disable:max-line-length
import chalk from 'chalk';
import { EOL } from 'os';

export const green = chalk.green;
export const red = chalk.red;
export const yellow = chalk.yellow;
export const magenta = chalk.magenta;
export const blue = chalk.blue;
export const gray = chalk.gray;

export const ok = `[${green('OK')}]`;
export const error = `[${red('ERROR')}]`;
export const warn = `[${yellow('WARNING')}]`;
export const wait = `[${magenta('WAIT')}]`;
export const info = `[${blue('INFO')}]`;

export function log(type: string, code: string, exit = false, args: any[] = []): void {
    let message: string = code;
    // get the message
    let msg: any;
    if (type === 'error') {
        msg = ERRORS[code];
    } else {
        msg = LOGS[code];
    }
    if (!!msg) {
        if (msg instanceof Function) {
            message = msg(... args);
        } else {
            message = msg;
        }
    }
    // log the message out
    if (type === 'error') {
        console.error(EOL + ` ${error} ${message}`);
        return process.exit(1);
    } else if (type === 'warn') {
        console.log(EOL + ` ${warn} ${message}`);
    } else if (type === 'wait') {
        console.log(EOL + ` ${wait} ${message}`);
    } else if (type === 'info') {
        console.log(EOL + ` ${info} ${message}`);
    } else {
        console.log(EOL + ` ${ok} ${message}`);
    }
    // exit = 0
    if (!!exit) {
        return process.exit();
    }
}
export function logOk(code: string, exit = false, args?: any[]): void {
    log('ok', code, exit, args);
}
export function logError(code: string, exit = false, args?: any[]): void {
    log('error', code, exit, args);
}
export function logWarn(code: string, exit = false, args?: any[]): void {
    log('warn', code, exit, args);
}
export function logWait(code: string, exit = false, args?: any[]): void {
    log('wait', code, exit, args);
}
export function logInfo(code: string, exit = false, args?: any[]): void {
    log('info', code, exit, args);
}

export async function logAction(
    description: string,
    action: {(): Promise<any>},
    done?: string | {(result: any): string},
) {
    console.log(EOL + ' ' + description);

    // run the action
    const timeBegin = (new Date()).getTime();
    const result = await action();
    const spent = (new Date()).getTime() - timeBegin;

    // log done
    if (!done) {
        done = '... ' + green('done');
    } else if (done instanceof Function) {
        done = done(result);
    }
    console.log('   ' + done + ' ' + gray('(' + spent + 'ms)'));
}

export const ERRORS = {
    BACKEND__ERROR__INVALID: 'No backend found or invalid.',
    DATABASE__ERROR__NO_DATABASE: 'No database found or invalid.',
    DATABASE__ERROR__NO_TABLE: 'No table name provided for this action.',
    GOOGLE__ERROR__NO_ACCOUNT: 'No Google accounts connected, to connect: ' + magenta('sheetbase google connect') + ' and try again.',
    FRONTEND_DEPLOY__ERROR__NO_PROVIDER: 'No deployment configs.',
    FRONTEND_DEPLOY__ERROR__NO_STAGING: 'No staging found, please build first.',
    FRONTEND_PRERENDER__ERROR__NO_PRERENDER: 'No prerender configs.',
    GOOGLE_DISCONNECTED__ERROR__NO_VALUE: 'No value provided, available: <id>|all|default|local.',
    PROJECT__ERROR__INVALID: 'Invalid project, no "sheetbase.json" found.',
    PROJECT__ERROR__EXISTS: 'Project exists, please choose different name.',
    PROJECT_CONFIG_IMPORT__ERROR__NO_FILE: 'No configs file found.',
    PROJECT_MODEL__ERROR__DUPLICATE_GID: (m1: string, m2: string) => (
        `Model "${ m1 }" has the same GID as "${ m2 }"`
    ),
    PROJECT_SETUP__ERROR__NO_GOOGLE_ACCOUNT: (name: string) => {
        return ERRORS['GOOGLE__ERROR__NO_ACCOUNT'] +
            EOL + '       + Then: ' + magenta('cd ' + name) +
            EOL + '       + And: ' + magenta('sheetbase setup') +
            EOL + '';
    },
    PROJECT_START__ERROR__INVALID_RESOURCE: 'Invalid resource.',
};

export const LOGS = {
    APP__INFO__INVALID_SUBCOMMAND: (cmd: string) => `Invalid sub-command for "${cmd}", available:`,
    APP__INFO__LINK_OPENED: (link: string) => `Link opened: ${link}`,
    BACKEND_DEPLOY__OK: `To view newly deployed backend: ` + magenta('sheetbase url -o backend'),
    BACKEND_PUSH__OK: (result: any) => {
        const { files = [] } = result;
        let message = 'Pushed ' + files.length + ' files.';
        files.forEach(file => {
            const type = file.type === 'SERVER_JS' ? 'js' : file.type.toLowerCase();
            message += EOL + '    + ' + file.name + '.' + type;
        });
        return message;
    },
    DATABASE_EXPORT__OK: (path: string) => `Data exported to "${path}".`,
    FRONTEND_BUILD__OK: 'To re-deploy the frontend: ' + magenta('sheetbase frontend deploy'),
    FRONTEND_DEPLOY__OK: (url: string) => `Frontend deployed. View: ${url}`,
    FRONTEND_PRERENDER__OK: 'Prerender completed.',
    GOOGLE_CONNECT__WARN__CREDS: 'File ".googlerc.json" saved, please keep the file SECRET.',
    GOOGLE_CONNECT__OK: 'Account connected, see list: ' + magenta('sheetbase google list'),
    GOOGLE_DEFAULT__OK: (id: string) => `Default acccount changed to "${id}", detail: ` + magenta('sheetbase google list -d'),
    GOOGLE_DISCONNECTED__OK: 'You may also want to remove Sheetbase from: https://myaccount.google.com/permissions.',
    GOOGLE_DISCONNECTED__INFO__NO_ACCOUNTS: 'No connected accounts.',
    GOOGLE_LIST__OK: `Accounts listed.
    + To disconnect accounts: ${magenta('sheetbase google disconnect <id>|all|default|local')}
    + To change default account: ${magenta('sheetbase google default <id>')}`,
    PROJECT_BUILD__OK: 'Project build completed!' +
        EOL + '    + Preview: ' + magenta('sheetbase preview') +
        EOL + '    + Re-deploy: ' + magenta('sheetbase deploy'),
    PROJECT_CONFIG_EXPORT__OK: (file: string) => `Project configs exported to "${file}".`,
    PROJECT_CONFIG_IMPORT__OK: 'Project configs imported, view: ' + magenta('sheetbase configs'),
    PROJECT_CONFIG_UPDATE__OK: 'Project configs updated, view: ' + magenta('sheetbase configs'),
    PROJECT_CONFIGS__OK: 'Project configs listed, to update: ' + magenta('sheetbase config update key=value|...'),
    PROJECT_DEPLOY__OK: 'Project deployed!',
    PROJECT_MODEL__OK: 'Models created.',
    PROJECT_MODELS__OK: (models: any) => {
        return (Object.keys(models).length > 0 ? 'Models listed' : 'The project has no models') + ', to create a model: ' + magenta('sheetbase model <schemaFile>');
    },
    PROJECT_SETUP__WARN__HOOK_ERROR: (name: string) => `Error running hook "${name}".`,
    PROJECT_SETUP__OK: 'Project setup successfully.',
    PROJECT_START__OK__THEME: (name: string, options: any) => {
        let message = 'Sheetbase theme project created, next steps:';
        message += EOL + '    + Go to the project: ' + magenta('cd ' + name);
        if (!options.setup) {
            message += EOL + '    + Setup automatically: ' + magenta('sheetbase setup');
        }
        if (!options.install) {
            message += EOL + '    + Install packages: ' + magenta('sheetbase backend install && sheetbase frontend install');
        }
        message += EOL + '    + Great, start developing :)';
        return message;
    },
    PROJECT_START__OK__NOT_THEME: (name: string, options: any) => {
        let message = 'Sheetbase project created, next steps:';
        message += EOL + '    + Go to the project: ' + magenta('cd ' + name);
        if (!options.install) {
            message += EOL + '    + Install packages: ' + magenta('npm install');
        }
        message += EOL + '    + Great, start developing :)';
        return message;
    },
    PROJECT_URL__OK: (name: string, url: string) => `Link of [${name}]: ${green(url)}.\n    + To open, include "-o" flag.`,
    PROJECT_URLS__OK: 'Links listed, to open a link: ' + magenta('sheetbase url -o <name>'),
};